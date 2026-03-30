import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { ragSearch, isRagReady } from '@/lib/rag';

// ============ REAL PROBABILITIES LOOKUP ============
function loadRealProbabilities(): string {
  const filePath = path.join(process.cwd(), 'data', 'real-probabilities.json');
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // Flatten into a readable format for Claude
    const lines: string[] = [];
    for (const [category, entries] of Object.entries(raw)) {
      for (const [key, data] of Object.entries(entries as Record<string, { prob: number; source: string; year?: number }>)) {
        const label = key.replace(/_/g, ' ');
        lines.push(`${category}/${label}: ${data.prob}% (${data.source}${data.year ? ` ${data.year}` : ''})`);
      }
    }
    return lines.join('\n');
  } catch {
    return '';
  }
}

// ============ SACRED PATTERNS LOOKUP ============
// Layer 0: Bible + Quran — the foundation of ALL behavioral data
interface SacredEntry { s: string; b: string; q: string; c: string; src: string; k: string[] }
interface SacredIndex { patterns: SacredEntry[]; keywordIndex: Record<string, number[]> }

let sacredIndex: SacredIndex | null = null;
function loadSacredIndex(): SacredIndex | null {
  if (sacredIndex) return sacredIndex;
  try {
    const filePath = path.join(process.cwd(), 'data', 'sacred-index.json');
    sacredIndex = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return sacredIndex;
  } catch { return null; }
}

function findSacredPatterns(scenario: string, limit = 20): string {
  const idx = loadSacredIndex();
  if (!idx) return '';

  const words = scenario.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);

  // Find patterns matching the most keywords
  const scores: Record<number, number> = {};
  for (const word of words) {
    const matches = idx.keywordIndex[word];
    if (matches) {
      for (const patternIdx of matches) {
        scores[patternIdx] = (scores[patternIdx] || 0) + 1;
      }
    }
  }

  // Sort by score, take top N
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([i]) => idx.patterns[Number(i)]);

  if (ranked.length === 0) return '';

  // Format for Claude
  const lines = ranked.map(p =>
    `- ${p.s} | Bible: ${p.b} | Quran: ${p.q} | Source: ${p.src}`
  );

  return `SACRED FOUNDATION (Bible + Quran — USE THESE as the basis for probabilities):\n${lines.join('\n')}`;
}

// ============ KNOWLEDGE BASE ============
function loadKB() {
  const dataDir = path.join(process.cwd(), 'data');
  const kb: Record<string, unknown> = {};
  try {
    const files = fs.readdirSync(dataDir).filter((f: string) => f.endsWith('.json') && !['source-authority.json', 'api-databases.json'].includes(f));
    for (const file of files) {
      try {
        kb[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
      } catch { /* skip */ }
    }
    const mdFiles = fs.readdirSync(dataDir).filter((f: string) => f.endsWith('.md') && !['INDEX.md', 'api-databases.md'].includes(f));
    for (const file of mdFiles) {
      try {
        const lines = fs.readFileSync(path.join(dataDir, file), 'utf8').split('\n').slice(0, 150);
        const stats = lines.filter((l: string) => /\d+%|\$[\d,.]+|[\d,.]+\s*(billion|million|trillion)/i.test(l)).slice(0, 30);
        if (stats.length > 0) kb[file.replace('.md', '')] = stats.join('\n');
      } catch { /* skip */ }
    }
  } catch { /* skip */ }
  return kb;
}

// ============ BUSINESS TYPE DETECTION ============
// Auto-detect business model from scenario → loads specific data file
const BUSINESS_TYPE_KEYWORDS: Record<string, string[]> = {
  'saas-data': ['saas', 'software', 'app', 'subscription', 'mrr', 'arr', 'churn', 'b2b software', 'platform', 'tool', 'dashboard', 'api product'],
  'fnb-data': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'kitchen', 'catering', 'food truck', 'bakery', 'pizzeria', 'warung', 'kedai', 'kopi', 'ristorante'],
  'agency-data': ['agency', 'consulting', 'freelance to agency', 'smma', 'marketing agency', 'dev agency', 'design agency', 'agenzia', 'consulenza', 'service business', 'retainer'],
  'marketplace-data': ['marketplace', 'platform', 'two-sided', 'network effect', 'aggregator', 'matching', 'uber for', 'airbnb for'],
  'creator-data': ['youtube', 'tiktok', 'podcast', 'newsletter', 'substack', 'patreon', 'content creator', 'influencer', 'creator economy', 'streaming'],
  'ecommerce-data': ['ecommerce', 'e-commerce', 'shopify', 'dropshipping', 'amazon fba', 'online store', 'dtc', 'direct to consumer', 'print on demand', 'toko online'],
  'upwork-data': ['upwork', 'freelance', 'freelancer', 'freelancing', 'proposal', 'connects', 'top rated', 'expert vetted', 'fiverr', 'gig', 'client acquisition', 'JSS', 'job success'],
};

function detectBusinessType(scenario: string): string | null {
  const lower = scenario.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;
  for (const [file, keywords] of Object.entries(BUSINESS_TYPE_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = file; }
  }
  return bestScore >= 1 ? bestMatch : null;
}

// ============ KEYWORD MAP ============
const KEYWORDS: Record<string, string[]> = {
  // === BUSINESS TYPE DATA (auto-matched) ===
  'saas-data': ['saas', 'software', 'app', 'subscription', 'mrr', 'arr', 'churn', 'b2b', 'tool', 'dashboard'],
  'fnb-data': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'kitchen', 'catering', 'food truck', 'bakery', 'warung', 'kedai', 'kopi', 'ristorante'],
  'agency-data': ['agency', 'consulting', 'smma', 'marketing agency', 'dev agency', 'agenzia', 'consulenza', 'service business', 'retainer'],
  'marketplace-data': ['marketplace', 'platform', 'two-sided', 'network effect', 'aggregator', 'uber for', 'airbnb for'],
  'creator-data': ['youtube', 'tiktok', 'podcast', 'newsletter', 'substack', 'patreon', 'content creator', 'influencer', 'streaming'],
  'ecommerce-data': ['ecommerce', 'e-commerce', 'shopify', 'dropshipping', 'amazon fba', 'online store', 'dtc', 'print on demand', 'toko online'],
  // === BUSINESS & MONEY ===
  'master-funnels': ['startup', 'business', 'cafe', 'saas', 'freelance', 'creator', 'ecommerce', 'invest', 'impresa', 'attività', 'azienda', 'negozio', 'aprire', 'funnel', 'conversion', 'pipeline', 'imbuto', 'vendita online', 'bisnis', 'usaha', 'modal', 'jualan', 'toko', 'lead', 'landing page', 'guadagn', 'soldi', 'reddito', 'monetiz', 'costruisci', 'lancia', 'avvia'],
  'funding-finance-business': ['funding', 'finanziamento', 'pendanaan', 'venture capital', 'VC', 'angel', 'angel investor', 'seed', 'serie A', 'raising money', 'raccolta fondi', 'bootstrap', 'bootstrapping', 'investor', 'investitore', 'pitch deck', 'equity', 'dilution', 'crowdfunding', 'accelerator', 'incubator', 'round'],
  'exit-acquisition-data': ['exit', 'acquisition', 'acquisizione', 'akuisisi', 'sell business', 'vendere azienda', 'M&A', 'merger', 'fusione', 'exit strategy', 'valuation', 'valutazione', 'multiple', 'EBITDA', 'due diligence', 'buyer', 'acquirente', 'IPO', 'liquidation', 'flip', 'acqui-hire'],
  'scaling-bottlenecks': ['scaling', 'scalabilit', 'scale', 'bottleneck', 'collo di bottiglia', 'growth', 'crescita', 'hiring', 'assunzion', 'operations', 'operazion', 'systems', 'sistemi', 'constraint', 'capacity', 'delegation', 'delega', 'process', 'automation', 'team growth', 'pertumbuhan', 'skalabil'],
  'pricing-psychology': ['pricing', 'price', 'anchor', 'freemium', 'discount', 'subscription', 'prezzo', 'sconto', 'abbonamento', 'harga', 'diskon'],
  'platform-economics': ['platform', 'marketplace', 'network effect', 'two-sided', 'multi-sided', 'chicken and egg', 'liquidity', 'aggregator', 'winner take all', 'lock-in', 'switching cost', 'ecosystem', 'piattaforma', 'mercato', 'effetto rete', 'ekonomi platform', 'jaringan', 'pasar'],
  'cac-benchmarks': ['cac', 'customer acquisition', 'ltv', 'lifetime value', 'unit econom', 'payback', 'churn', 'acquisizione client', 'costo acquisizione', 'benchmark', 'saas metric', 'arpu', 'mrr', 'arr', 'biaya akuisisi', 'pelanggan', 'monetiz'],
  'post-purchase-retention': ['retention', 'churn', 'loyalty', 'repeat', 'repeat customer', 'LTV', 'lifetime value', 'reactivation', 'win-back', 'onboarding', 'renewal', 'NPS', 'fidelizzazione', 'ritenzione', 'abbandono', 'fedeltà', 'retensi', 'pelanggan setia'],
  'country-specific-business': ['country', 'regulat', 'market', 'nation', 'indonesia', 'italy', 'usa', 'india', 'europe', 'asia', 'africa', 'regulation', 'tax', 'legal', 'regolament', 'paese', 'negara', 'peraturan', 'pajak', 'mercato', 'jurisdiction'],
  'indonesia-business-deep': ['indonesia', 'bisnis', 'UMKM', 'usaha', 'Bandung', 'Jakarta', 'Surabaya', 'pasar indonesia', 'Indonesian market', 'mercato indonesiano', 'rupiah', 'IDR', 'startup indonesia', 'tokopedia', 'gojek', 'grab', 'izin usaha', 'franchise indonesia', 'warung'],
  'cafe-restaurant-business': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'warung', 'barista', 'ristorante', 'caffè', 'cucina', 'pizzeria', 'locale', 'kedai', 'kopi', 'makanan'],
  'failure-forensics': ['fail', 'failure', 'why', 'reason', 'mistake', 'shut down', 'bankrupt', 'falliment', 'perché', 'errore', 'chiudere', 'gagal', 'bangkrut', 'tutup'],
  'business-archetypes-1': ['guru', 'course', 'youtube', 'agency', 'smma', 'dropship', 'creator', 'agenzia', 'nicchia', 'niche', 'lead', 'client'],
  'business-archetypes-2': ['saas', 'software', 'app', 'local business', 'restaurant', 'cafe', 'applicazione'],
  'business-archetypes-3': ['real estate', 'property', 'coaching', 'consult', 'crypto', 'marketplace', 'consulenz'],
  'business-archetypes-4': ['franchise', 'digital product', 'community', 'gig economy', 'acquisition', 'paid community', 'franchising', 'prodotto digitale', 'comunità', 'freelance', 'uber', 'grab', 'ojol', 'waralaba', 'produk digital'],
  'business-archetypes-5': ['side hustle', 'flipping', 'resell', 'tutor', 'teaching', 'print on demand', 'family business', 'inherit', 'reselling', 'ripetizioni', 'insegnare', 'usato', 'rivendere', 'les privat', 'bisnis keluarga', 'jualan', 'thrift'],

  // === MARKETING & SALES ===
  'marketing-growth-data': ['marketing', 'seo', 'ads', 'content', 'email', 'social media', 'growth', 'pubblicità', 'crescita', 'clienti', 'vendere', 'vendita', 'pemasaran', 'iklan', 'personal brand', 'branding', 'networking', 'rete', 'contatti', 'visibilità', 'copywriting', 'copy'],
  'seo-organic-deep': ['seo', 'search engine', 'organic', 'organico', 'google', 'ranking', 'posizionamento', 'backlink', 'keyword', 'parole chiave', 'serp', 'domain authority', 'link building', 'content seo', 'technical seo', 'indicizzazione', 'traffico organico', 'kata kunci', 'peringkat'],
  'email-marketing-deep': ['email', 'email marketing', 'newsletter', 'open rate', 'click rate', 'sequence', 'autoresponder', 'drip', 'campaign', 'campagna', 'subject line', 'deliverability', 'subscriber', 'iscritto', 'opt-in', 'lead magnet', 'segmentation', 'mailchimp', 'convertkit'],
  'ad-channels-conversion': ['ad channel', 'advertis', 'conversion', 'paid ad', 'cpc', 'cpm', 'ctr', 'roas', 'facebook ad', 'google ad', 'tiktok ad', 'instagram ad', 'meta ad', 'campaign', 'pubblicit', 'annunci', 'conversione', 'iklan', 'paid media', 'ppc', 'retarget', 'remarketing'],
  'sales-outreach-data': ['sales', 'vendite', 'penjualan', 'outreach', 'cold email', 'cold call', 'prospecting', 'prospect', 'lead gen', 'lead generation', 'pipeline', 'follow up', 'conversion rate', 'reply rate', 'cadence', 'b2b sales', 'sdr', 'generazione lead', 'email fredde'],
  'negotiation-closing': ['negotiation', 'negotiate', 'closing', 'deal', 'persuasion', 'sales call', 'objection', 'anchor', 'BATNA', 'leverage', 'pitch', 'win-win', 'negoziazione', 'chiusura', 'trattativa', 'vendita', 'negosiasi', 'tawar'],
  'social-proof-mechanics': ['social proof', 'prova sociale', 'testimonial', 'testimonianz', 'review', 'recension', 'ulasan', 'trust', 'fiducia', 'kepercayaan', 'credibility', 'credibilità', 'rating', 'case study', 'endorsement', 'word of mouth', 'passaparola', 'ugc'],
  'community-engagement-deep': ['communit', 'engag', 'member', 'forum', 'discord', 'slack', 'group', 'tribe', 'comunità', 'coinvolgimento', 'membri', 'komunitas', 'anggota', 'loyalty', 'ambassador', 'networking', 'rete di contatti'],

  // === CAREER & WORK ===
  'upwork-data': ['upwork', 'freelance', 'freelancer', 'freelancing', 'proposal', 'connects', 'top rated', 'expert vetted', 'fiverr', 'gig', 'client acquisition', 'JSS', 'job success', 'agency freelance', 'retainer', 'hourly rate'],
  'career-employment': ['job', 'career', 'salary', 'hire', 'resume', 'interview', 'layoff', 'freelance', 'lavoro', 'carriera', 'stipendio', 'assunz', 'colloquio', 'licenzia', 'pekerjaan', 'gaji', 'karir', 'skill', 'impara', 'competenz', 'portfolio', 'consulting', 'consulenz'],
  'side-hustle-entrepreneurship': ['side hustle', 'dropship', 'etsy', 'youtube', 'newsletter', 'lavoretto', 'secondo lavoro', 'extra', 'sampingan', 'usaha sampingan'],
  'remote-work-digital-nomad': ['remote', 'remote work', 'lavoro remoto', 'kerja remote', 'digital nomad', 'nomade digitale', 'work from home', 'wfh', 'coworking', 'smart working', 'distributed', 'async', 'timezone', 'location independent', 'bali', 'bekerja dari rumah', 'hybrid work'],
  'education-stats': ['education', 'university', 'college', 'degree', 'bootcamp', 'mba', 'phd', 'learn', 'course', 'università', 'laurea', 'studio', 'studiare', 'corso', 'scuola', 'training', 'upskill', 'reskill', 'formazione', 'pelatihan', 'belajar', 'kuliah', 'sekolah', 'certificat', 'pendidikan', 'libro', 'book', 'leggere'],
  'language-learning': ['language', 'lingua', 'bahasa', 'learn language', 'imparare lingua', 'belajar bahasa', 'polyglot', 'fluency', 'fluenza', 'immersion', 'immersione', 'vocabulary', 'grammar', 'pronunciation', 'bilingual', 'multilingual', 'Duolingo', 'Anki', 'conversation'],

  // === FINANCE & INVESTING ===
  'personal-finance-data': ['money', 'finance', 'saving', 'credit', 'wealth', 'budget', 'soldi', 'risparmi', 'ricco', 'guadagn', 'debito', 'finanz', 'invest', 'retire', 'emergency fund', 'compounding', 'interesse', 'tabungan', 'keuangan', 'hutang', 'pensione', 'menabung', 'investasi', 'dana darurat', 'cicilan'],
  'crypto-trading-investing': ['crypto', 'bitcoin', 'trading', 'stock', 'forex', 'invest', 'etf', 'criptovalut', 'azioni', 'borsa', 'investir', 'saham', 'perdagangan'],
  'prediction-markets-trading': ['prediction market', 'Polymarket', 'betting', 'odds', 'probability', 'forecast', 'wager', 'speculate', 'position', 'hedge', 'arbitrage', 'event contract', 'mercato predittivo', 'scommessa', 'probabilità', 'prediksi', 'taruhan'],
  'debt-bankruptcy-financial-crisis': ['debt', 'debito', 'hutang', 'bankruptcy', 'bancarotta', 'bangkrut', 'broke', 'financial crisis', 'crisi finanziaria', 'indebitamento', 'insolvency', 'default', 'creditor', 'foreclosure', 'restructuring', 'ristrutturazione', 'pinjaman', 'debt free'],
  'real-estate-housing': ['house', 'rent', 'mortgage', 'property', 'real estate', 'apartment', 'casa', 'affitto', 'mutuo', 'immobil', 'appartamento', 'comprare casa', 'rumah', 'sewa', 'KPR'],

  // === HEALTH & WELLBEING ===
  'health-fitness': ['health', 'fitness', 'gym', 'weight', 'diet', 'exercise', 'sleep', 'meditation', 'palestra', 'dieta', 'peso', 'dimagrire', 'salute', 'dormire', 'workout', 'running', 'muscle', 'yoga', 'mental health', 'benessere', 'olahraga', 'sehat', 'kebugaran', 'corsa', 'allenamento', 'nutrizione', 'calorie', 'perdi peso', 'massa muscolare', 'fisico', 'corpo'],
  'sports-fitness-goals': ['sports', 'sport', 'olahraga', 'athletic', 'atletica', 'marathon', 'maratona', 'strength', 'forza', 'training', 'allenamento', 'latihan', 'workout', 'running', 'corsa', 'gym', 'palestra', 'muscle', 'endurance', 'resistenza', 'personal record', 'prestazione'],
  'mental-health-psychology': ['mental', 'depress', 'anxiety', 'therapy', 'burnout', 'stress', 'depressione', 'ansia', 'terapia', 'psicologo', 'kesehatan mental', 'terapi'],
  'burnout-mental-health-entrepreneurs': ['burnout', 'burn out', 'founder', 'entrepreneur', 'depress', 'exhaust', 'wellbeing', 'esaurim', 'salute mentale', 'imprenditor', 'kelelahan', 'founder depression', 'overwhelm'],
  'addiction-substance-use': ['addict', 'drug', 'alcohol', 'smoking', 'porn', 'cannabis', 'dipendenz', 'droga', 'alcol', 'fumare', 'sigarett', 'kecanduan', 'narkoba'],

  // === RELATIONSHIPS & FAMILY ===
  'relationships': ['relationship', 'marriage', 'divorce', 'dating', 'friend', 'love', 'partner', 'relazione', 'matrimonio', 'divorzio', 'sposare', 'fidanzat', 'amore', 'breakup', 'toxic', 'long distance', 'coppia', 'separazione', 'pacaran', 'hubungan', 'nikah', 'rottura', 'jodoh', 'putus', 'pasangan', 'amico', 'amicizia', 'prestare', 'prestito'],
  'family-dynamics': ['family', 'parent', 'child', 'marriage', 'divorce', 'elder', 'famiglia', 'genitori', 'figli', 'figlio', 'keluarga', 'orang tua', 'anak'],
  'parenting-child-development': ['parenting', 'parent', 'child', 'kid', 'raising kids', 'child development', 'pregnancy', 'toddler', 'baby', 'discipline', 'milestone', 'genitorialità', 'bambino', 'gravidanza', 'sviluppo', 'pengasuhan', 'anak', 'bayi', 'kehamilan'],
  'trust-secrets-betrayal': ['trust', 'betray', 'betrayal', 'secret', 'loyalty', 'cheat', 'cheating', 'lies', 'lying', 'honest', 'affair', 'deceit', 'fiducia', 'tradimento', 'tradire', 'segreto', 'bugia', 'lealtà', 'kepercayaan', 'selingkuh', 'rahasia', 'bohong'],

  // === LIFE & PSYCHOLOGY ===
  'dreams-ambition-failure': ['dream', 'ambition', 'fail', 'goal', 'impostor', 'perfect', 'motivat', 'sogno', 'ambizione', 'fallire', 'obiettivo', 'motivazione', 'mimpi', 'cita-cita'],
  'life-transitions-decisions': ['transition', 'life change', 'decision', 'big decision', 'career change', 'moving', 'midlife', 'quarter-life', 'pivot', 'crossroads', 'turning point', 'restart', 'transizione', 'cambiamento', 'decisione', 'scelta di vita', 'keputusan', 'perubahan hidup'],
  'consumption-action-gap': ['consumption', 'action gap', 'procrastinat', 'knowing', 'doing', 'execut', 'tutorial hell', 'overthink', 'paralysis', 'analysis paralysis', 'azione', 'procrastin', 'blocco', 'penundaan', 'information overload', 'inaction'],
  'psychology-behavioral-business': ['psychology', 'psicologia', 'psikologi', 'behavioral', 'bias', 'cognitive', 'nudge', 'decision making', 'heuristic', 'anchoring', 'framing', 'loss aversion', 'sunk cost', 'confirmation bias', 'persuasion', 'irrational', 'pregiudizi cognitivi', 'comportament'],
  'social-dynamics-influence': ['social dynamics', 'influence', 'influenza', 'persuasion', 'persuasione', 'status', 'networking', 'power', 'potere', 'charisma', 'authority', 'autorità', 'hierarchy', 'social capital', 'pengaruh', 'reciprocity'],
  'productivity-human-performance': ['productivity', 'habit', 'focus', 'deep work', 'performance', 'flow state', 'time management', 'routine', 'efficiency', 'procrastination', 'pomodoro', 'energy', 'peak performance', 'produttività', 'abitudine', 'concentrazione', 'produktivitas', 'kebiasaan', 'fokus'],
  'aging-retirement-life-stages': ['age', 'aging', 'retire', 'retirement', 'pension', 'midlife', 'mid-life', 'life stage', '40s', '50s', '60s', 'senior', 'elder', 'longevity', 'pensione', 'vecchi', 'anzian', 'invecchi', 'mezza età', 'terza età', 'pensiun', 'lansia'],

  // === TECH ===
  'tech-adoption': ['tech', 'ai', 'software', 'cloud', 'cyber', 'blockchain', 'digital', 'tecnologia', 'intelligenza artificiale', 'digitale', 'teknologi'],
  'ai-tools-impact-2025': ['ai', 'artificial intellig', 'chatgpt', 'gpt', 'automat', 'machine learn', 'job displace', 'robot', 'copilot', 'midjourney', 'generativ', 'llm', 'prompt', 'intelligenza artificial', 'automazione', 'kecerdasan buatan', 'ai tool', 'deep learn'],

  // === LEGAL & TAX ===
  'legal-datapoints': ['legal', 'legale', 'hukum', 'law', 'legge', 'contract', 'contratto', 'kontrak', 'IP', 'intellectual property', 'trademark', 'marchio', 'merek', 'copyright', 'patent', 'brevetto', 'NDA', 'license', 'licenza', 'compliance'],
  'legal-tax-business-reality': ['tax', 'tasse', 'pajak', 'tax planning', 'LLC', 'incorporation', 'business structure', 'struttura aziendale', 'PT', 'S-corp', 'SRL', 'partita IVA', 'NPWP', 'deduction', 'detrazione', 'write-off', 'commercialista', 'akuntan'],

  // === SOCIAL MEDIA ===
  'twitter-x-behavior': ['twitter', 'tweet', 'x.com', 'viral', 'follower', 'posting', 'retweet', 'thread', 'influencer', 'engagement', 'algorithm', 'meme', 'troll', 'cancel', 'hashtag', 'social media', 'sosmed', 'trending', 'virale'],
  'youtube-guru-funnel-data': ['youtube guru', 'guru', 'online course', 'info product', 'fake guru', 'webinar', 'masterclass', 'coaching', 'mentorship', 'scam', 'get rich', 'passive income', 'corso online', 'truffa', 'formatore', 'kursus', 'reddito passivo', 'fuffa'],

  // === OTHER ===
  'immigration-relocation-research': ['immigrat', 'visa', 'expat', 'move', 'relocat', 'country', 'abroad', 'cittadin', 'emigr', 'trasferir', 'estero', 'visto', 'permesso', 'pindah', 'imigrasi'],
  'creative-arts-career': ['creativ', 'art', 'artist', 'music', 'musician', 'writing', 'writer', 'acting', 'actor', 'design', 'film', 'paint', 'photograph', 'arte', 'scrittura', 'seni', 'seniman', 'menulis', 'penulis'],
  'nonprofit-social-impact': ['nonprofit', 'non-profit', 'NGO', 'social impact', 'charity', 'volunteering', 'donation', 'foundation', 'cause', 'grant', 'fundraising', 'philanthropy', 'no-profit', 'impatto sociale', 'beneficenza', 'volontariato', 'amal', 'yayasan'],
  'crisis-survival-resilience': ['crisis', 'crisi', 'krisis', 'survive', 'survival', 'sopravvivere', 'resilience', 'resilienza', 'emergency', 'emergenza', 'darurat', 'recession', 'recessione', 'downturn', 'collapse', 'recover', 'recovery', 'ripresa', 'antifragile'],
  'market-timing-trends': ['market timing', 'timing', 'trend', 'seasonal', 'cycle', 'launch timing', 'when to launch', 'window', 'momentum', 'wave', 'hype', 'tendenza', 'stagionale', 'tren', 'kapan', 'waktu pasar'],
  'time-to-result-benchmarks': ['time to result', 'how long', 'quanto tempo', 'berapa lama', 'timeline', 'tempistic', 'benchmark', 'realistic', 'realistico', 'expectation', 'aspettativ', 'duration', 'durata', 'patience', 'pazienza', 'milestone', 'learning curve'],
  'sacred-texts-patterns': ['human nature', 'temptation', 'greed', 'pride', 'fear', 'faith', 'tentazione', 'avidità', 'paura', 'fede', 'bible', 'bibbia', 'quran'],
  'historical-cycles': ['bubble', 'crash', 'cycle', 'repeat', 'history', 'empire', 'mania', 'bolla', 'crisi', 'ciclo', 'storia', 'gelembung', 'sejarah'],

  // === BULK DATA (BLS) — auto-matched to scenarios needing macro data ===
  'bls-unemployment': ['unemploy', 'disoccupazion', 'jobless', 'labor market', 'mercato del lavoro', 'pengangguran', 'job loss'],
  'bls-employment': ['employ', 'nonfarm', 'occupazion', 'payroll', 'workforce', 'forza lavoro', 'tenaga kerja'],
  'bls-cpi-inflation': ['inflation', 'CPI', 'inflazione', 'consumer price', 'prezzi', 'costo della vita', 'inflasi', 'harga'],
  'bls-wages-earnings': ['wage', 'earning', 'salary', 'stipendio', 'salario', 'paga', 'compenso', 'gaji', 'upah', 'hourly'],
  'bls-productivity': ['productivity', 'produttività', 'output', 'efficiency', 'produktivitas', 'labor productivity'],
  'bls-ppi-producer-prices': ['producer price', 'PPI', 'wholesale', 'manufacturing cost', 'costo produzione', 'supply chain cost'],
  'bls-occupational-employment': ['occupation', 'job title', 'profession', 'mestiere', 'professione', 'profesi', 'pekerjaan'],

  // === BULK DATA (World Bank) — country/macro scenarios ===
  'worldbank-gdp-economy': ['GDP', 'economy', 'economic growth', 'PIL', 'economia', 'crescita economica', 'ekonomi', 'pertumbuhan'],
  'worldbank-population-demographics': ['population', 'demographic', 'birth rate', 'popolazione', 'demografia', 'natalità', 'penduduk', 'populasi'],
  'worldbank-education': ['education', 'literacy', 'enrollment', 'school', 'istruzione', 'alfabetizzazione', 'pendidikan', 'sekolah'],
  'worldbank-health': ['health', 'mortality', 'life expectancy', 'sanità', 'mortalità', 'aspettativa di vita', 'kesehatan'],
  'worldbank-labor-employment': ['labor', 'employment rate', 'lavoro', 'tasso di occupazione', 'ketenagakerjaan'],
  'worldbank-poverty-inequality': ['poverty', 'inequality', 'gini', 'povertà', 'disuguaglianza', 'kemiskinan', 'ketimpangan'],
  'worldbank-financial': ['financial inclusion', 'banking', 'bank account', 'inclusione finanziaria', 'conto bancario', 'rekening bank'],
  'worldbank-gender': ['gender', 'women', 'female', 'genere', 'donne', 'gender gap', 'perempuan', 'wanita'],
  'worldbank-business-innovation': ['innovation', 'R&D', 'patent', 'research', 'innovazione', 'ricerca', 'brevetto', 'inovasi'],
  'worldbank-environment-energy': ['environment', 'energy', 'carbon', 'CO2', 'renewable', 'ambiente', 'energia', 'rinnovabile', 'lingkungan', 'energi'],

  // === BEHAVIORAL SCIENCE ===
  'choices13k-summary': ['decision', 'choice', 'risk', 'gamble', 'decisione', 'scelta', 'rischio', 'keputusan', 'lottery', 'expected value'],
  'game-theory-behavioral': ['game theory', 'cooperation', 'defect', 'prisoner', 'nash', 'trust game', 'ultimatum', 'cooperazione', 'teoria dei giochi'],
  'mesa-behavioral-models': ['agent', 'simulation', 'model', 'ABM', 'agent-based', 'simulazione', 'emergent', 'complex system'],

  // === LIFE DATA ===
  'life-event-probabilities': ['life event', 'probability', 'death', 'birth', 'marriage', 'accident', 'probabilità', 'evento', 'morte', 'nascita'],
  'life-events-granular': ['age', 'year by year', 'anno per anno', 'life stage', 'fase della vita', 'mortality', 'fertility'],
  'country-data-global': ['country data', 'GDP per capita', 'cost of living', 'dati paese', 'costo della vita', 'data negara'],
  'industry-specific-data': ['industry', 'sector', 'settore', 'industria', 'margin', 'survival rate', 'tasso di sopravvivenza', 'industri'],
  'time-series-historical': ['historical', 'time series', 'storico', 'serie storica', 'S&P', 'returns', 'rendimenti', 'federal funds'],

  // === SACRED DATA (supplementary — main sacred handled separately) ===
  'sacred-texts-expanded': ['sacred', 'scripture', 'proverb', 'wisdom', 'sacro', 'scrittura', 'proverbio', 'saggezza', 'hikmat'],
  'sacred-batch-1-business': ['business', 'startup', 'impresa', 'bisnis'],
  'sacred-batch-2-finance': ['finance', 'money', 'finanza', 'soldi', 'keuangan'],
  'sacred-batch-3-career': ['career', 'job', 'work', 'carriera', 'lavoro', 'karir'],
  'sacred-batch-4-marketing': ['marketing', 'sales', 'vendita', 'pemasaran'],
  'sacred-batch-5-health': ['health', 'wellness', 'salute', 'benessere', 'kesehatan'],
  'sacred-batch-6-life': ['life', 'purpose', 'meaning', 'vita', 'scopo', 'significato', 'kehidupan'],
  'sacred-batch-7-remaining': ['general', 'human', 'nature', 'umano', 'natura', 'manusia'],

  // === DUPLICATE NAME ALIASES (file exists with slightly different name) ===
  'immigration-relocation': ['immigrat', 'visa', 'expat', 'move', 'relocat', 'abroad', 'trasferir', 'estero', 'pindah'],
  'marketing-growth': ['marketing', 'growth', 'crescita', 'pemasaran', 'pertumbuhan'],
  'personal-finance': ['money', 'finance', 'saving', 'budget', 'soldi', 'risparmi', 'finanz', 'keuangan'],

  // === DEEP PROBABILITY FILES (comprehensive probability data) ===
  'business-survival-probabilities': ['startup', 'business', 'survival', 'fail', 'sopravvivenza', 'falliment', 'cafe', 'ecommerce', 'saas', 'agency', 'freelance', 'side hustle', 'creator', 'bisnis'],
  'career-probabilities-deep': ['career', 'job', 'occupation', 'salary', 'profession', 'lavoro', 'carriera', 'stipendio', 'mestiere', 'automation', 'pekerjaan'],
  'country-probabilities-deep': ['country', 'city', 'cost of living', 'paese', 'città', 'costo', 'negara', 'kota', 'rent', 'affitto', 'salary', 'stipendio'],
  'crime-justice-probabilities': ['crime', 'law', 'court', 'prison', 'arrest', 'crimine', 'legge', 'tribunale', 'prigione', 'arresto', 'kejahatan', 'scam', 'fraud', 'truffa', 'lawsuit', 'causa'],
  'education-probabilities-deep': ['university', 'college', 'degree', 'dropout', 'bootcamp', 'università', 'laurea', 'abbandono', 'kuliah', 'certification', 'PhD', 'MBA'],
  'fame-entertainment-probabilities': ['fame', 'famous', 'viral', 'youtube', 'tiktok', 'music', 'sport', 'actor', 'singer', 'famoso', 'virale', 'musica', 'attore', 'cantante', 'influencer', 'streamer'],
  'life-probabilities-deep': ['health', 'fitness', 'relationship', 'marriage', 'divorce', 'diet', 'gym', 'salute', 'relazione', 'matrimonio', 'divorzio', 'dieta', 'palestra', 'immigration', 'expat'],
  'life-simulator1-probabilities': ['life', 'age', 'death', 'birth', 'vita', 'età', 'morte', 'nascita', 'pregnancy', 'gravidanza', 'addiction', 'crime', 'happiness'],
  'openlife-probabilities': ['life', 'event', 'career', 'relationship', 'health', 'invest', 'social media', 'prison', 'lawsuit', 'emigrat'],
  'psychology-habits-probabilities': ['habit', 'psychology', 'motivation', 'discipline', 'procrastinat', 'meditation', 'therapy', 'burnout', 'abitudine', 'psicologia', 'disciplina', 'terapia'],
  'tech-ai-probabilities-deep': ['tech', 'AI', 'app', 'software', 'startup', 'saas', 'crypto', 'developer', 'coding', 'automation', 'cybersecurity', 'hacker'],
};

// ============ SMART EXTRACTION ============
interface ArchetypeStage { id: string; label: string; prob: number; time: string; source: string }
interface Archetype { name: string; description: string; entry_point: string; stages: ArchetypeStage[]; bottlenecks?: string[]; cumulative_end_to_end?: string; end_to_end_conversion?: string; reality_check?: string }
interface ArchetypeData { archetypes: Record<string, Archetype> }
interface SectionEntry { metric?: string; value?: string | number; unit?: string; source?: string; year?: string | number; pattern?: string; modern_equivalent?: string; business_application?: string; cycle_name?: string; what_happened?: string; sacred_source_bible?: string; sacred_source_quran?: string; data_confirmation?: string; data_source?: string; modern_parallel?: string; modern_data?: string }
interface SectionData { sections: Record<string, SectionEntry[]> }
interface FunnelData { stages?: { label: string; prob: number; source: string }[]; [key: string]: unknown }

function extractArchetypeContext(data: ArchetypeData, scenario: string): string | null {
  if (!data.archetypes) return null;
  const lower = scenario.toLowerCase();
  let bestKey: string | null = null, bestScore = 0;
  for (const [key, arch] of Object.entries(data.archetypes)) {
    const text = `${arch.name} ${arch.description} ${arch.entry_point}`.toLowerCase();
    const words = lower.split(/\s+/);
    const score = words.filter(w => w.length > 3 && text.includes(w)).length;
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }
  if (bestKey && bestScore >= 2) {
    const arch = data.archetypes[bestKey];
    return `\nARCHETYPE MATCH: "${arch.name}"
Description: ${arch.description}
FULL MICRO-STEP FUNNEL:
${arch.stages.map((s, i) => `  ${i + 1}. [${s.id}] ${s.label} — prob: ${s.prob}%, time: ${s.time}, source: ${s.source}`).join('\n')}
Bottlenecks: ${(arch.bottlenecks || []).join(', ')}
End-to-end: ${arch.cumulative_end_to_end || arch.end_to_end_conversion || 'see stages'}
`;
  }
  return null;
}

function extractSectionEntries(data: SectionData, scenario: string, maxEntries: number): string | null {
  if (!data.sections) return null;
  const lower = scenario.toLowerCase();
  const scenarioWords = lower.split(/\s+/).filter(w => w.length > 3);
  const sectionScores: { name: string; entries: SectionEntry[]; score: number }[] = [];
  for (const [secName, entries] of Object.entries(data.sections)) {
    if (!Array.isArray(entries)) continue;
    const secWords = secName.replace(/_/g, ' ').toLowerCase();
    const secScore = scenarioWords.filter(w => secWords.includes(w)).length;
    sectionScores.push({ name: secName, entries, score: secScore });
  }
  sectionScores.sort((a, b) => b.score - a.score);
  const scored: (SectionEntry & { _score: number })[] = [];
  for (const sec of sectionScores.slice(0, 3)) {
    for (const entry of sec.entries) {
      const metricLower = (entry.metric || '').toLowerCase();
      const entryScore = sec.score + scenarioWords.filter(w => metricLower.includes(w)).length;
      if (entryScore > 0) scored.push({ ...entry, _score: entryScore });
    }
  }
  scored.sort((a, b) => b._score - a._score);
  const top = scored.slice(0, maxEntries);
  if (top.length === 0) return null;
  return top.map(e => `  - ${e.metric}: ${e.value}${e.unit ? ' ' + e.unit : ''} (${e.source}, ${e.year})`).join('\n');
}

function extractFunnelContext(data: Record<string, FunnelData>, scenario: string): string | null {
  const lower = scenario.toLowerCase();
  const results: { key: string; stages: FunnelData['stages']; score: number; extra: FunnelData }[] = [];
  for (const [key, funnel] of Object.entries(data)) {
    if (key === '_meta' || key === 'business_archetypes' || !funnel.stages) continue;
    const funnelWords = key.replace(/_/g, ' ').toLowerCase();
    const score = lower.split(/\s+/).filter(w => w.length > 3 && funnelWords.includes(w)).length;
    if (score > 0) results.push({ key, stages: funnel.stages, score, extra: funnel });
  }
  results.sort((a, b) => b.score - a.score);
  const best = results[0];
  if (!best || !best.stages) return null;
  let ctx = `\nFUNNEL: ${best.key}\n`;
  ctx += best.stages.map((s, i) => `  ${i + 1}. ${s.label}: ${s.prob}% (${s.source})`).join('\n');
  return ctx;
}

function extractSacredContext(data: SectionData, scenario: string): string | null {
  if (!data.sections) return null;
  const lower = scenario.toLowerCase();
  const scenarioWords = lower.split(/\s+/).filter(w => w.length > 3);
  const scored: (SectionEntry & { _score: number })[] = [];
  for (const [, entries] of Object.entries(data.sections)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const searchText = `${entry.pattern || ''} ${entry.modern_equivalent || ''} ${entry.business_application || ''} ${entry.cycle_name || ''} ${entry.what_happened || ''}`.toLowerCase();
      const score = scenarioWords.filter(w => searchText.includes(w)).length;
      if (score >= 2) scored.push({ ...entry, _score: score });
    }
  }
  scored.sort((a, b) => b._score - a._score);
  const top = scored.slice(0, 8);
  if (top.length === 0) return null;
  return top.map(e => {
    if (e.sacred_source_bible) {
      return `  Pattern: "${e.pattern}" | Bible: ${e.sacred_source_bible} | Quran: ${e.sacred_source_quran || 'N/A'} | Modern: ${e.modern_equivalent || ''} | Data: ${e.data_confirmation || ''} (${e.data_source || ''})`;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return `  ${e.cycle_name || e.pattern} (${(e as any).year || ''}) | ${e.what_happened || ''} | Modern: ${(e as any).modern_parallel || ''} | Data: ${(e as any).modern_data || ''} (${e.data_source || ''})`;
  }).join('\n');
}

// ============ UNIVERSAL EXTRACTORS (handle ALL data formats) ============

// Extract from flat arrays (BLS, WorldBank, sacred-batch files)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromList(data: any[], scenario: string, maxEntries: number): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const lower = scenario.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 3);

  // Score each item by keyword relevance
  const scored: { item: Record<string, unknown>; score: number }[] = [];
  for (const item of data) {
    if (typeof item !== 'object' || !item) continue;
    const text = Object.values(item).filter(v => typeof v === 'string').join(' ').toLowerCase();
    const score = words.filter(w => text.includes(w)).length;
    if (score > 0) scored.push({ item, score });
  }
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, maxEntries);
  if (top.length === 0) {
    // No keyword match — take most recent entries (last N items, often most recent data)
    const fallback = data.slice(-Math.min(maxEntries, 10));
    if (fallback.length === 0) return null;
    return fallback.map(item => formatListItem(item)).filter(Boolean).join('\n');
  }
  return top.map(({ item }) => formatListItem(item)).filter(Boolean).join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatListItem(item: any): string {
  if (!item || typeof item !== 'object') return '';
  // BLS format: series_name + year + period + value
  if (item.series_name && item.value != null) {
    const period = item.period ? `-${item.period}` : '';
    return `  - ${item.series_name} (${item.year || ''}${period}): ${item.value} (${item.source || 'BLS'})`;
  }
  // WorldBank format: country + indicator + year + value
  if (item.indicator && item.country && item.value != null) {
    const val = typeof item.value === 'number' && item.value > 1e6
      ? (item.value > 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M')
      : item.value;
    return `  - ${item.country} ${item.indicator} (${item.year || ''}): ${val} (${item.source || 'World Bank'})`;
  }
  // Sacred batch format: data_entry + data_source
  if (item.data_entry) {
    return `  - ${item.data_entry} (${item.data_source || item.source || 'Sacred'})`;
  }
  // Generic: metric + value
  if (item.metric && item.value != null) {
    return `  - ${item.metric}: ${item.value}${item.unit ? ' ' + item.unit : ''} (${item.source || 'Data'}, ${item.year || ''})`;
  }
  // Last resort: stringify key-value pairs with numbers
  const parts: string[] = [];
  for (const [k, v] of Object.entries(item)) {
    if (k.startsWith('_') || k === 'meta') continue;
    if (typeof v === 'number' || (typeof v === 'string' && /\d/.test(v))) {
      parts.push(`${k.replace(/_/g, ' ')}: ${v}`);
    }
  }
  return parts.length > 0 ? `  - ${parts.join(', ')}` : '';
}

// Extract from nested dicts (health-fitness, country-data-global, industry-specific, etc.)
// Handles: { topic: { subtopic: { metric: value } } } or { topic: { data: [...] } }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromNestedDict(data: Record<string, any>, scenario: string, maxEntries: number): string | null {
  const lower = scenario.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 3);

  // Score top-level keys by relevance
  const topicScores: { key: string; score: number }[] = [];
  for (const key of Object.keys(data)) {
    if (key === '_meta' || key === 'meta' || key === '_metadata') continue;
    const keyWords = key.replace(/[_-]/g, ' ').toLowerCase();
    const score = words.filter(w => keyWords.includes(w)).length;
    topicScores.push({ key, score });
  }
  topicScores.sort((a, b) => b.score - a.score);
  // Take top 3 topics (or all if few scored)
  const bestTopics = topicScores.slice(0, 3).filter(t => t.score > 0);
  if (bestTopics.length === 0) {
    // No match — take first 3 non-meta topics
    const fallbackTopics = topicScores.slice(0, 3);
    if (fallbackTopics.length === 0) return null;
    bestTopics.push(...fallbackTopics);
  }

  const lines: string[] = [];
  for (const { key } of bestTopics) {
    if (lines.length >= maxEntries) break;
    const topic = data[key];
    if (!topic || typeof topic !== 'object') continue;

    // Pattern 1: { data: [{ metric, value, ... }] }
    if (Array.isArray(topic.data)) {
      for (const entry of topic.data.slice(0, 8)) {
        if (lines.length >= maxEntries) break;
        if (entry.metric && entry.value != null) {
          lines.push(`  - ${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || key}, ${entry.year || ''})`);
        }
      }
      continue;
    }

    // Pattern 2: { subtopic: { value, source, year } } (country-data-global style)
    if (!Array.isArray(topic)) {
      for (const [subKey, subVal] of Object.entries(topic)) {
        if (lines.length >= maxEntries) break;
        if (subKey.startsWith('_')) continue;

        // Direct value object
        if (subVal && typeof subVal === 'object' && !Array.isArray(subVal) && 'value' in (subVal as Record<string, unknown>)) {
          const sv = subVal as Record<string, unknown>;
          lines.push(`  - ${key}/${subKey.replace(/_/g, ' ')}: ${sv.value}${sv.unit ? ' ' + sv.unit : ''} (${sv.source || key}, ${sv.year || ''})`);
          continue;
        }

        // Nested category: { sub_sub: { value, source } }
        if (subVal && typeof subVal === 'object' && !Array.isArray(subVal)) {
          for (const [ssKey, ssVal] of Object.entries(subVal as Record<string, unknown>)) {
            if (lines.length >= maxEntries) break;
            if (ssVal && typeof ssVal === 'object' && !Array.isArray(ssVal) && 'value' in (ssVal as Record<string, unknown>)) {
              const sv = ssVal as Record<string, unknown>;
              lines.push(`  - ${subKey}/${ssKey.replace(/_/g, ' ')}: ${sv.value}${sv.unit ? ' ' + sv.unit : ''} (${sv.source || key}, ${sv.year || ''})`);
            }
          }
          continue;
        }

        // Flat key-value (industry-specific style: { survival_y1: 0.62 })
        if (typeof subVal === 'number') {
          lines.push(`  - ${key}/${subKey.replace(/_/g, ' ')}: ${subVal}`);
        } else if (typeof subVal === 'string' && /\d/.test(subVal)) {
          lines.push(`  - ${key}/${subKey.replace(/_/g, ' ')}: ${subVal}`);
        }
      }
    }
  }

  return lines.length > 0 ? lines.join('\n') : null;
}

function matchKB(kb: Record<string, unknown>, scenario: string): string {
  const lower = scenario.toLowerCase();
  const relevant: { key: string; score: number }[] = [];
  for (const [key, words] of Object.entries(KEYWORDS)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > 0) relevant.push({ key, score });
  }
  if (!relevant.find(r => r.key === 'master-funnels')) relevant.push({ key: 'master-funnels', score: 0.5 });
  relevant.sort((a, b) => b.score - a.score);
  const top = relevant.slice(0, 8);

  let context = '';
  let extractedCount = 0;
  for (const { key } of top) {
    const data = kb[key];
    if (!data) continue;
    if (typeof data === 'string') { context += `\n--- ${key} ---\n${data}\n`; extractedCount++; continue; }

    let extracted: string | null = null;

    // 1. Archetype format
    if ((data as ArchetypeData).archetypes) {
      extracted = extractArchetypeContext(data as ArchetypeData, scenario);
      if (extracted) { context += extracted; extractedCount++; continue; }
    }
    // 2. Sacred/historical format
    if (key === 'sacred-texts-patterns' || key === 'historical-cycles') {
      extracted = extractSacredContext(data as SectionData, scenario);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    // 3. Funnel format
    if (key === 'master-funnels') {
      extracted = extractFunnelContext(data as Record<string, FunnelData>, scenario);
      if (extracted) { context += extracted + '\n'; extractedCount++; continue; }
    }
    // 4. Sections format
    if ((data as SectionData).sections) {
      extracted = extractSectionEntries(data as SectionData, scenario, 25);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    // 5. List/Array format (BLS, WorldBank, sacred-batch)
    if (Array.isArray(data)) {
      extracted = extractFromList(data as Record<string, unknown>[], scenario, 15);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    // 6. Nested dict format (health-fitness, country-data, industry-specific, etc.)
    if (typeof data === 'object' && !Array.isArray(data)) {
      extracted = extractFromNestedDict(data as Record<string, unknown>, scenario, 15);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    // 7. LAST RESORT — should rarely happen now. Log which file fell through.
    console.warn(`[KB WARN] No extractor matched for: ${key}`);
    context += `\n--- ${key} ---\n${JSON.stringify(data).substring(0, 2000)}\n`;
  }

  if (extractedCount === 0) {
    console.warn(`[KB WARN] Zero data extracted for scenario: "${scenario.substring(0, 80)}"`);
  }

  return context.substring(0, 16000);
}

// ============ LIVE API INTEGRATIONS ============
let wbCache: { data: Record<string, Record<string, string>> | null; ts: number } = { data: null, ts: 0 };
let countryCache: Map<string, { data: Record<string, string> | null; ts: number }> = new Map();
let exchangeCache: { data: Record<string, number> | null; ts: number } = { data: null, ts: 0 };
let wikiCache: Map<string, { data: string | null; ts: number }> = new Map();
let laborCache: { data: string | null; ts: number } = { data: null, ts: 0 };
let cryptoCache: { data: string | null; ts: number } = { data: null, ts: 0 };
let cityCache: Map<string, { data: string | null; ts: number }> = new Map();

function fetchJSON(url: string): Promise<unknown> {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Simulator/1.0' } }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

async function getLiveData() {
  if (wbCache.data && Date.now() - wbCache.ts < 3600000) return wbCache.data;
  try {
    const gdp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN/indicator/NY.GDP.PCAP.CD?format=json&date=2023&per_page=20') as [unknown, { value: number; country: { value: string } }[]];
    const unemp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN/indicator/SL.UEM.TOTL.ZS?format=json&date=2023&per_page=20') as [unknown, { value: number; country: { value: string } }[]];
    const r: Record<string, Record<string, string>> = {};
    if (gdp?.[1]) { r.gdp = {}; gdp[1].forEach(d => { if (d.value) r.gdp[d.country.value] = '$' + Math.round(d.value).toLocaleString(); }); }
    if (unemp?.[1]) { r.unemp = {}; unemp[1].forEach(d => { if (d.value) r.unemp[d.country.value] = d.value.toFixed(1) + '%'; }); }
    wbCache = { data: r, ts: Date.now() };
    return r;
  } catch { return null; }
}

// ============ REST COUNTRIES API ============
const COUNTRY_NAMES = [
  'australia', 'united states', 'usa', 'indonesia', 'germany', 'united kingdom', 'uk', 'japan',
  'brazil', 'india', 'china', 'canada', 'france', 'italy', 'spain', 'netherlands', 'sweden',
  'norway', 'denmark', 'switzerland', 'singapore', 'south korea', 'mexico', 'argentina',
  'thailand', 'vietnam', 'philippines', 'malaysia', 'new zealand', 'ireland', 'portugal',
  'poland', 'turkey', 'egypt', 'nigeria', 'south africa', 'kenya', 'ghana', 'colombia',
  'chile', 'peru', 'saudi arabia', 'uae', 'qatar', 'dubai', 'taiwan', 'hong kong'
];

function detectCountries(scenario: string): string[] {
  const lower = scenario.toLowerCase();
  const found: string[] = [];
  for (const c of COUNTRY_NAMES) {
    if (lower.includes(c)) found.push(c);
  }
  // Map common aliases
  return Array.from(new Set(found.map(c => {
    if (c === 'usa') return 'united states';
    if (c === 'uk') return 'united kingdom';
    if (c === 'dubai' || c === 'uae') return 'united arab emirates';
    return c;
  })));
}

interface RestCountryResponse {
  name: { common: string; official: string };
  population: number;
  languages?: Record<string, string>;
  currencies?: Record<string, { name: string; symbol: string }>;
  capital?: string[];
  region: string;
}

async function getCountryData(countries: string[]): Promise<string | null> {
  if (countries.length === 0) return null;
  const results: string[] = [];

  for (const country of countries.slice(0, 3)) { // max 3 countries
    const cacheKey = country.toLowerCase();
    const cached = countryCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 3600000) {
      if (cached.data) results.push(Object.entries(cached.data).map(([k, v]) => `${k}: ${v}`).join(', '));
      continue;
    }
    try {
      const data = await fetchJSON(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fields=name,population,languages,currencies,capital,region`) as RestCountryResponse[];
      if (data && Array.isArray(data) && data[0]) {
        const c = data[0];
        const info: Record<string, string> = {
          country: c.name.common,
          population: c.population > 1e6 ? (c.population / 1e6).toFixed(1) + 'M' : c.population.toLocaleString(),
          region: c.region,
          capital: c.capital?.[0] || 'N/A',
          languages: c.languages ? Object.values(c.languages).slice(0, 3).join(', ') : 'N/A',
          currency: c.currencies ? Object.entries(c.currencies).map(([code, cur]) => `${cur.name} (${cur.symbol || code})`).slice(0, 2).join(', ') : 'N/A'
        };
        countryCache.set(cacheKey, { data: info, ts: Date.now() });
        results.push(Object.entries(info).map(([k, v]) => `${k}: ${v}`).join(', '));
      } else {
        countryCache.set(cacheKey, { data: null, ts: Date.now() });
      }
    } catch {
      countryCache.set(cacheKey, { data: null, ts: Date.now() });
    }
  }
  return results.length > 0 ? results.join(' | ') : null;
}

// ============ OPEN EXCHANGE RATES API ============
async function getExchangeRates(): Promise<Record<string, number> | null> {
  if (exchangeCache.data && Date.now() - exchangeCache.ts < 3600000) return exchangeCache.data;
  try {
    // Free tier of exchangerate-api (no key needed)
    const data = await fetchJSON('https://open.er-api.com/v6/latest/USD') as { result: string; rates: Record<string, number> };
    if (data?.result === 'success' && data.rates) {
      const relevant: Record<string, number> = {};
      const keep = ['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'IDR', 'INR', 'BRL', 'CNY', 'SGD', 'KRW', 'MXN', 'THB', 'VND', 'PHP', 'MYR', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'TRY', 'ZAR', 'NGN', 'GHS', 'AED', 'SAR', 'QAR', 'COP', 'CLP', 'PEN', 'ARS', 'EGP', 'KES', 'TWD', 'HKD'];
      for (const code of keep) {
        if (data.rates[code]) relevant[code] = data.rates[code];
      }
      exchangeCache = { data: relevant, ts: Date.now() };
      return relevant;
    }
    return null;
  } catch { return null; }
}

// ============ WIKIPEDIA CONTEXT API ============
function extractTopics(scenario: string): string[] {
  const lower = scenario.toLowerCase();
  const stopwords = new Set(['i', 'me', 'my', 'want', 'to', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'shall', 'can', 'may', 'might', 'must', 'and', 'or', 'but', 'if', 'then', 'so', 'for', 'of', 'in', 'on', 'at', 'by', 'from', 'with', 'as', 'into', 'about', 'what', 'how', 'when', 'where', 'who', 'which', 'that', 'this', 'it', 'not', 'no', 'all', 'some', 'any', 'much', 'many', 'more', 'most', 'very', 'too', 'also', 'just', 'than', 'after', 'before', 'while', 'during', 'through', 'up', 'out', 'off', 'over', 'under', 'between', 'each', 'every', 'both', 'few', 'other', 'new', 'old', 'get', 'make', 'go', 'come', 'take', 'give', 'know', 'think', 'see', 'look', 'find', 'tell', 'try', 'use', 'work', 'like', 'need', 'feel', 'become', 'start', 'open', 'move', 'live', 'run', 'set', 'learn', 'change', 'help', 'show', 'keep', 'let', 'begin', 'seem', 'leave', 'play', 'turn', 'bring', 'build', 'buy', 'sell', 'pay', 'spend', 'voglio', 'vorrei', 'come', 'cosa', 'per', 'che', 'con', 'una', 'uno', 'del', 'della', 'sono', 'fare', 'aprire', 'nel', 'nella']);

  // Try multi-word proper nouns/concepts first (e.g. "New York", "machine learning")
  const multiWordPatterns = lower.match(/[a-z]+(?:\s+[a-z]+){1,2}/g) || [];
  const candidates: { term: string; score: number }[] = [];

  for (const phrase of multiWordPatterns) {
    const words = phrase.split(/\s+/);
    if (words.every(w => stopwords.has(w) || w.length <= 2)) continue;
    const meaningfulWords = words.filter(w => !stopwords.has(w) && w.length > 2);
    if (meaningfulWords.length >= 2) {
      candidates.push({ term: meaningfulWords.join(' '), score: meaningfulWords.length * 2 });
    }
  }

  // Score individual words — capitalized words in original get higher score
  const words = lower.split(/\s+/).filter(w => w.length > 3 && !stopwords.has(w));
  for (const w of words) {
    const isCapitalized = scenario.split(/\s+/).some(orig => orig.toLowerCase() === w && /^[A-Z]/.test(orig));
    candidates.push({ term: w, score: isCapitalized ? 3 : 1 });
  }

  // Deduplicate: if a word is part of a multi-word candidate, skip standalone
  candidates.sort((a, b) => b.score - a.score);
  const selected: string[] = [];
  const used = new Set<string>();
  for (const c of candidates) {
    if (selected.length >= 3) break;
    const cWords = c.term.split(/\s+/);
    if (cWords.some(w => used.has(w))) continue;
    selected.push(c.term);
    cWords.forEach(w => used.add(w));
  }

  return selected.slice(0, 3);
}

async function getWikipediaContext(scenario: string): Promise<string | null> {
  const topics = extractTopics(scenario);
  if (topics.length === 0) return null;

  const results: string[] = [];
  for (const topic of topics) {
    const cacheKey = topic.toLowerCase();
    const cached = wikiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < 3600000) {
      if (cached.data) results.push(cached.data);
      continue;
    }
    try {
      const encoded = encodeURIComponent(topic.replace(/\s+/g, '_'));
      const data = await fetchJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`) as { type?: string; title?: string; extract?: string };
      if (data?.extract && data.type !== 'disambiguation') {
        // Take first 2-3 sentences, max 500 chars per topic
        const sentences = data.extract.match(/[^.!?]+[.!?]+/g) || [data.extract];
        let extract = sentences.slice(0, 3).join('').trim();
        if (extract.length > 500) extract = extract.substring(0, 497) + '...';
        const entry = `${data.title}: ${extract}`;
        wikiCache.set(cacheKey, { data: entry, ts: Date.now() });
        results.push(entry);
      } else {
        wikiCache.set(cacheKey, { data: null, ts: Date.now() });
      }
    } catch {
      wikiCache.set(cacheKey, { data: null, ts: Date.now() });
    }
  }
  return results.length > 0 ? results.join(' | ') : null;
}

// ============ BLS LABOR DATA API ============
async function getLaborData(): Promise<string | null> {
  if (laborCache.data && Date.now() - laborCache.ts < 3600000) return laborCache.data;
  try {
    const postBody = JSON.stringify({
      seriesid: ['LNS14000000', 'CES0000000001', 'CUUR0000SA0'],
      latest: true
    });
    const data = await new Promise<unknown>((resolve) => {
      const req = https.request({
        hostname: 'api.bls.gov',
        path: '/publicAPI/v2/timeseries/data/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postBody)
        }
      }, (res) => {
        let d = '';
        res.on('data', (c: Buffer) => d += c);
        res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(null); } });
      });
      req.on('error', () => resolve(null));
      req.write(postBody);
      req.end();
    });

    const resp = data as { status?: string; Results?: { series?: { seriesID: string; data?: { value: string }[] }[] } };
    if (resp?.status !== 'REQUEST_SUCCEEDED' || !resp.Results?.series) return null;

    const values: Record<string, string> = {};
    for (const series of resp.Results.series) {
      const latest = series.data?.[0]?.value;
      if (latest) values[series.seriesID] = latest;
    }

    const parts: string[] = [];
    if (values['LNS14000000']) parts.push(`US Unemployment: ${values['LNS14000000']}%`);
    if (values['CES0000000001']) {
      const nonfarm = parseFloat(values['CES0000000001']);
      parts.push(`Nonfarm Jobs: ${(nonfarm / 1000).toFixed(1)}M`);
    }
    if (values['CUUR0000SA0']) parts.push(`CPI: ${values['CUUR0000SA0']}`);

    if (parts.length === 0) return null;
    const result = parts.join(', ');
    laborCache = { data: result, ts: Date.now() };
    return result;
  } catch { return null; }
}

// ============ COINGECKO CRYPTO DATA ============
const CRYPTO_TERMS = ['crypto', 'bitcoin', 'btc', 'ethereum', 'eth', 'altcoin', 'defi', 'nft', 'web3', 'blockchain', 'trading', 'hodl', 'criptovalut'];

async function getCryptoData(scenario: string): Promise<string | null> {
  const lower = scenario.toLowerCase();
  if (!CRYPTO_TERMS.some(t => lower.includes(t))) return null;

  // 15-minute cache (crypto moves fast)
  if (cryptoCache.data && Date.now() - cryptoCache.ts < 900000) return cryptoCache.data;

  try {
    const [priceData, globalData] = await Promise.all([
      fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,cardano&vs_currencies=usd&include_24hr_change=true&include_market_cap=true') as Promise<Record<string, { usd: number; usd_24h_change?: number; usd_market_cap?: number }> | null>,
      fetchJSON('https://api.coingecko.com/api/v3/global') as Promise<{ data?: { total_market_cap?: { usd?: number }; market_cap_percentage?: { btc?: number }; active_cryptocurrencies?: number } } | null>
    ]);

    const parts: string[] = [];

    if (priceData) {
      const coins: { id: string; symbol: string }[] = [
        { id: 'bitcoin', symbol: 'BTC' },
        { id: 'ethereum', symbol: 'ETH' },
        { id: 'solana', symbol: 'SOL' },
        { id: 'cardano', symbol: 'ADA' }
      ];
      for (const coin of coins) {
        const d = priceData[coin.id];
        if (d?.usd) {
          const price = d.usd >= 1000 ? '$' + Math.round(d.usd).toLocaleString() : '$' + d.usd.toFixed(2);
          const change = d.usd_24h_change != null ? ` (${d.usd_24h_change >= 0 ? '+' : ''}${d.usd_24h_change.toFixed(1)}%)` : '';
          parts.push(`${coin.symbol}: ${price}${change}`);
        }
      }
    }

    if (globalData?.data) {
      const g = globalData.data;
      if (g.total_market_cap?.usd) {
        const cap = g.total_market_cap.usd;
        const formatted = cap >= 1e12 ? '$' + (cap / 1e12).toFixed(2) + 'T' : '$' + (cap / 1e9).toFixed(0) + 'B';
        parts.push(`Total Market Cap: ${formatted}`);
      }
      if (g.market_cap_percentage?.btc) {
        parts.push(`BTC Dominance: ${g.market_cap_percentage.btc.toFixed(1)}%`);
      }
      if (g.active_cryptocurrencies) {
        parts.push(`Active Coins: ${g.active_cryptocurrencies.toLocaleString()}`);
      }
    }

    if (parts.length === 0) return null;
    const result = parts.join(', ');
    cryptoCache = { data: result, ts: Date.now() };
    return result;
  } catch { return null; }
}

// ============ TELEPORT CITY QUALITY OF LIFE API ============
const CITY_SLUGS: Record<string, string> = {
  'new york': 'new-york', 'london': 'london', 'tokyo': 'tokyo', 'sydney': 'sydney',
  'melbourne': 'melbourne', 'bali': 'bali', 'jakarta': 'jakarta', 'bandung': 'bandung',
  'berlin': 'berlin', 'paris': 'paris', 'dubai': 'dubai', 'singapore': 'singapore',
  'bangkok': 'bangkok', 'seoul': 'seoul', 'toronto': 'toronto', 'vancouver': 'vancouver',
  'amsterdam': 'amsterdam', 'barcelona': 'barcelona', 'lisbon': 'lisbon', 'porto': 'porto',
  'milan': 'milan', 'rome': 'rome', 'austin': 'austin', 'san francisco': 'san-francisco',
  'los angeles': 'los-angeles', 'la': 'los-angeles', 'chicago': 'chicago', 'miami': 'miami',
  'denver': 'denver', 'seattle': 'seattle', 'portland': 'portland', 'zurich': 'zurich',
  'geneva': 'geneva', 'stockholm': 'stockholm', 'copenhagen': 'copenhagen', 'oslo': 'oslo',
  'helsinki': 'helsinki', 'dublin': 'dublin', 'edinburgh': 'edinburgh', 'vienna': 'vienna',
  'prague': 'prague', 'budapest': 'budapest', 'warsaw': 'warsaw', 'bucharest': 'bucharest',
  'istanbul': 'istanbul', 'cape town': 'cape-town', 'lagos': 'lagos', 'nairobi': 'nairobi',
  'mumbai': 'mumbai', 'delhi': 'delhi', 'shanghai': 'shanghai', 'beijing': 'beijing',
  'ho chi minh': 'ho-chi-minh-city', 'manila': 'manila', 'kuala lumpur': 'kuala-lumpur',
  'auckland': 'auckland', 'medellin': 'medellin', 'mexico city': 'mexico-city',
  'buenos aires': 'buenos-aires', 'santiago': 'santiago', 'lima': 'lima', 'bogota': 'bogota',
  'chiang mai': 'chiang-mai', 'taipei': 'taipei', 'hong kong': 'hong-kong',
  'boston': 'boston', 'washington': 'washington-dc', 'montreal': 'montreal',
  'munich': 'munich', 'hamburg': 'hamburg', 'brussels': 'brussels', 'lyon': 'lyon',
  'tallinn': 'tallinn', 'riga': 'riga', 'krakow': 'krakow'
};

interface TeleportCategory { name: string; score_out_of_10: number }
interface TeleportResponse { teleport_city_score: number; categories: TeleportCategory[] }

function detectCities(scenario: string): string[] {
  const lower = scenario.toLowerCase();
  const found: string[] = [];
  // Check longer names first to avoid partial matches (e.g. "new york" before "york")
  const sortedCities = Object.keys(CITY_SLUGS).sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    if (lower.includes(city) && found.length < 2) {
      // Avoid duplicate slugs (e.g. "la" and "los angeles" both map to los-angeles)
      const slug = CITY_SLUGS[city];
      if (!found.some(f => CITY_SLUGS[f] === slug)) {
        found.push(city);
      }
    }
  }
  return found;
}

async function getCityData(scenario: string): Promise<string | null> {
  const cities = detectCities(scenario);
  if (cities.length === 0) return null;

  const results: string[] = [];
  const targetCategories = new Set(['Housing', 'Cost of Living', 'Safety', 'Healthcare', 'Education', 'Economy', 'Travel Connectivity', 'Internet Access', 'Startups', 'Environmental Quality']);

  for (const city of cities) {
    const slug = CITY_SLUGS[city];
    if (!slug) continue;

    const cached = cityCache.get(slug);
    if (cached && Date.now() - cached.ts < 3600000) {
      if (cached.data) results.push(cached.data);
      continue;
    }

    try {
      const data = await fetchJSON(`https://api.teleport.org/api/urban_areas/slug:${slug}/scores/`) as TeleportResponse | null;
      if (data?.teleport_city_score && data.categories) {
        const overall = data.teleport_city_score.toFixed(1);
        const cats = data.categories
          .filter(c => targetCategories.has(c.name))
          .map(c => `${c.name}: ${c.score_out_of_10.toFixed(1)}/10`)
          .join(', ');
        const entry = `${city.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}: Overall ${overall}/100 [${cats}]`;
        cityCache.set(slug, { data: entry, ts: Date.now() });
        results.push(entry);
      } else {
        cityCache.set(slug, { data: null, ts: Date.now() });
      }
    } catch {
      cityCache.set(slug, { data: null, ts: Date.now() });
    }
  }

  return results.length > 0 ? results.join(' | ') : null;
}

// ============ CLAUDE API (with prompt caching) ============
function callClaude(staticPrompt: string, dynamicPrompt: string, userMsg: string): Promise<unknown> {
  const systemBlocks: Array<{ type: string; text: string; cache_control?: { type: string } }> = [
    {
      type: 'text',
      text: staticPrompt,
      cache_control: { type: 'ephemeral' }
    },
  ];
  if (dynamicPrompt) {
    systemBlocks.push({ type: 'text', text: dynamicPrompt });
  }

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    temperature: 0,
    system: systemBlocks,
    messages: [{ role: 'user', content: userMsg }]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          let content = j.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          // Try direct parse first
          try { resolve(JSON.parse(content)); return; } catch { /* continue */ }
          // Extract JSON from surrounding text (Claude sometimes adds commentary)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            resolve(JSON.parse(jsonMatch[0]));
          } else {
            reject(new Error('No valid JSON found in Claude response'));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ OPENAI FALLBACK (GPT-4o-mini) ============
function callOpenAI(systemPrompt: string, userMsg: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
    temperature: 0, max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/chat/completions', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          resolve(JSON.parse(j.choices[0].message.content));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ GROQ FALLBACK (3rd tier — free, fast, lower quality) ============
function callGroq(systemPrompt: string, userMsg: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
    temperature: 0, max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.groq.com', path: '/openai/v1/chat/completions', method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          resolve(JSON.parse(j.choices[0].message.content));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ CONTEXT TAGS ROUTING ============
import { getTagKeywords, getTagPromptModifier, type ContextTags } from '@/lib/context-tags';

// ============ HANDLER ============
export async function POST(request: NextRequest) {
  try {
    const { scenario, tags, profile } = await request.json() as { scenario: string; tags?: ContextTags; profile?: Record<string, unknown> };
    if (!scenario) return NextResponse.json({ error: 'Missing scenario' }, { status: 400 });

    // Inject tag keywords into scenario for better routing
    const tagKeywords = tags ? getTagKeywords(tags) : [];
    const enrichedScenario = tagKeywords.length > 0
      ? `${scenario} [context: ${tagKeywords.join(', ')}]`
      : scenario;

    const detectedCountries = detectCountries(enrichedScenario);

    // RAG search (primary) + keyword matching (fallback)
    let kbContext: string | null = null;
    let dataSource: 'rag' | 'keyword' = 'keyword';
    const ragReady = isRagReady();
    console.log(`[API] RAG ready: ${ragReady}`);
    if (ragReady) {
      try {
        kbContext = await ragSearch(enrichedScenario, 30);
        if (kbContext) {
          dataSource = 'rag';
          console.log(`[API] RAG returned ${kbContext.length} chars`);
        } else {
          console.warn('[API] RAG returned null, falling back to keyword');
        }
      } catch (ragErr) {
        console.error('[API] RAG error:', ragErr);
      }
    }
    if (!kbContext) {
      const kb = loadKB();
      kbContext = matchKB(kb, enrichedScenario);
    }

    // Fetch all live data in parallel — none block on failure
    const [live, countryData, exchangeRates, laborData, wikiContext, cryptoData, cityData] = await Promise.all([
      getLiveData(),
      getCountryData(detectedCountries),
      getExchangeRates(),
      getLaborData(),
      getWikipediaContext(scenario),
      getCryptoData(scenario),
      getCityData(scenario)
    ]);

    let liveStr = '';
    if (live?.gdp) liveStr = `\nLIVE DATA: GDP/capita: ${Object.entries(live.gdp).map(([k, v]) => `${k}: ${v}`).join(', ')}. Unemployment: ${Object.entries(live.unemp || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
    if (countryData) liveStr += `\nCOUNTRY DATA: ${countryData}`;
    if (exchangeRates && detectedCountries.length > 0) {
      // Show exchange rates relevant to detected countries
      const currencyMap: Record<string, string> = {
        'australia': 'AUD', 'united states': 'USD', 'indonesia': 'IDR', 'germany': 'EUR',
        'united kingdom': 'GBP', 'japan': 'JPY', 'brazil': 'BRL', 'india': 'INR',
        'china': 'CNY', 'canada': 'CAD', 'france': 'EUR', 'italy': 'EUR', 'spain': 'EUR',
        'netherlands': 'EUR', 'sweden': 'SEK', 'norway': 'NOK', 'denmark': 'DKK',
        'switzerland': 'CHF', 'singapore': 'SGD', 'south korea': 'KRW', 'mexico': 'MXN',
        'argentina': 'ARS', 'thailand': 'THB', 'vietnam': 'VND', 'philippines': 'PHP',
        'malaysia': 'MYR', 'new zealand': 'NZD', 'ireland': 'EUR', 'portugal': 'EUR',
        'poland': 'PLN', 'turkey': 'TRY', 'egypt': 'EGP', 'nigeria': 'NGN',
        'south africa': 'ZAR', 'kenya': 'KES', 'ghana': 'GHS', 'colombia': 'COP',
        'chile': 'CLP', 'peru': 'PEN', 'saudi arabia': 'SAR', 'united arab emirates': 'AED',
        'qatar': 'QAR', 'taiwan': 'TWD', 'hong kong': 'HKD'
      };
      const relevantRates: string[] = [];
      for (const country of detectedCountries) {
        const code = currencyMap[country];
        if (code && code !== 'USD' && exchangeRates[code]) {
          relevantRates.push(`1 USD = ${exchangeRates[code].toFixed(code === 'IDR' || code === 'VND' || code === 'KRW' ? 0 : 2)} ${code}`);
        }
      }
      if (relevantRates.length > 0) liveStr += `\nEXCHANGE RATES: ${relevantRates.join(', ')}`;
    }
    if (laborData) liveStr += `\nUS LABOR DATA: ${laborData}`;
    if (wikiContext) liveStr += `\nWIKIPEDIA CONTEXT: ${wikiContext}`;
    if (cryptoData) liveStr += `\nCRYPTO MARKET DATA: ${cryptoData}`;
    if (cityData) liveStr += `\nCITY QUALITY OF LIFE: ${cityData}`;

    // Static part — cached across requests (rules + format never change)
    const staticPrompt = `You are a life/business scenario simulator. Generate a realistic flowchart with nodes and edges.

CRITICAL RULES:
1. DATA INTEGRITY: If you have a real stat with a real source, use it. If you DON'T have a verified data source, set prob to null and source to "No data". NEVER estimate or guess probabilities.
2. COMPLETE COVERAGE: The flow must cover the ENTIRE scenario from start to end. If the user says "move abroad and learn a language", cover BOTH — immigration steps AND language learning journey. Never stop halfway.
3. EVERY STEP NEEDS A FAIL PATH: Every bottleneck/decision MUST have a fail/no edge leading to an outcome-bad node. This is non-negotiable. Real life has failure at every step.
4. If an ARCHETYPE is provided, use its stages as the SKELETON with EXACT probabilities.
5. If section data points are provided, use those specific numbers and CITE the source.
6. NEVER HALLUCINATE PLATFORM FEATURES: Do NOT invent steps that don't exist on real platforms. Upwork has NO mandatory "skills test" or "AI developer test". Stick to real platform mechanics: profile creation, proposals (with Connects), interviews, contracts, JSS score, badges.
7. USE RAG DATA FIRST: When the provided data includes a specific probability (e.g., "proposal_to_interview_new_pct: 2-5%"), use THAT number, not a higher one. The RAG data is verified — ONLY use verified data. Never estimate probabilities.

STRUCTURE: Return ONLY valid JSON. 10-14 nodes. Include success AND failure paths.
Node types: start, desire, action, bottleneck, decision, outcome-good, outcome-bad, loop.
Edges: pass/fail for bottleneck, yes/no for decision. Every bottleneck/decision MUST have both a pass/yes AND a fail/no edge.
Position: x increases by ~260, failures below (y+200). Min 260px horizontal spacing.
JSON format: {"title":"...","nodes":[{"id":1,"type":"desire","label":"...","x":0,"y":120,"prob":68,"desc":"Real stat","source":"BLS 2024:70:3 | CB Insights 2024:65:2","time":"30-90 days"}],"edges":[{"from":1,"to":2,"label":""}],"pruning_questions":[{"id":"q1","question":"Binary YES/NO question SPECIFIC to this exact scenario — NOT generic business questions","section":"community_and_counsel","yesModifier":1.8,"noModifier":0.35,"yesLabel":"Yes, short","noLabel":"No, short","insight":"Data-backed reason why this matters (stat + source)"}]}
PRUNING QUESTIONS MUST be scenario-specific. Example: for "friend asks to borrow money" → "Do you have a written agreement?" NOT "Do you have a mentor?". For "open a restaurant" → "Do you have restaurant experience?" NOT "Are you committed for 3+ years?". Generate 5-7 questions that ONLY make sense for THIS specific scenario.
prob = weighted average of all sources. Only bottleneck/decision need realistic prob (<100). Others = 100.
For bottleneck/decision nodes, also include "probRange" with optimistic and adverse: {"prob":40,"probRange":{"optimistic":65,"adverse":15}}.
desc MUST include a specific number/stat, not generic text.
SOURCE TRIANGULATION: For every bottleneck/decision prob, provide MULTIPLE sources when possible. Format: "SourceName Year:value:tier | SourceName Year:value:tier" where tier is 3=government(BLS,Census,WHO), 2=institutional(McKinsey,YC,PitchBook), 1=media(TechCrunch,Forbes). prob = weighted avg (tier3 x3, tier2 x2, tier1 x1). Example: "BLS 2024:70:3 | CB Insights 2024:65:2" → prob = (70*3+65*2)/5 = 68.

UPWORK/FREELANCE PLATFORM MECHANICS (use when scenario involves Upwork or freelancing):
- Profile approval: ~50-60% of submissions approved (Upwork tightened screening 2023)
- Connects: $0.15 each, 2-16 per proposal. Average $9-27 spent before first hire.
- Proposal-to-interview rate: 2-5% for new freelancers, 15-25% for established, 30-50% for Top Rated Plus
- Proposals before first hire: 15-30 (median 20)
- Time to first dollar: 1-3 months
- 60-70% of new freelancers quit within year 1
- Only 2.5% of signups get their first job. Only 0.8% still active after 1 year.
- Income: median active freelancer earns $2-5K/year. Top 1% earns $150-500K/year.
- JSS (Job Success Score) 90%+ = 2-3x higher hire rate. Top Rated = 3-5x more invites.
- Expert-Vetted acceptance: 1%. Rates: $150-300/hr.
- Repeat hire rate: 60%. 75% of GSV from returning clients.
- Hourly-to-retainer conversion: 30-40% for 3+ month relationships.
- Solo-to-agency transition: 5-7% overall, 15-20% of high earners. Takes 3-5 years.
- Geographic rates: US $75-150/hr dev, India $15-40/hr, Indonesia $10-30/hr, Philippines $10-30/hr.
- AI category: demand 2-3x supply, rates $75-150/hr median, +1400% YoY growth.

DECISION PRUNING QUESTIONS: Generate exactly 5-7 binary YES/NO questions that determine success/failure for THIS specific scenario. Each question must:
- Be a simple YES/NO binary decision the person makes BEFORE starting
- Map to one of these sacred sections: community_and_counsel, deception_and_shortcuts, envy_and_comparison, fear_and_lack_of_faith, forbidden_fruit, greed_and_excess, patience_and_perseverance, pride_and_hubris, sloth_and_procrastination, stewardship_and_responsibility
- Have yesModifier (1.2-2.5) and noModifier (0.05-0.5) that reflect real data
- Include a data-backed "insight" with a real statistic
- Be SPECIFIC to the scenario — ask about CONCRETE MECHANICS, not generic self-help. Examples:
  - Upwork: "Do you have a Connects budget of $20+/month?" NOT "Are you willing to invest?"
  - Upwork: "Have you specialized in ONE niche?" NOT "Do you have skills?"
  - Upwork: "Do you have 5+ portfolio pieces?" NOT "Are you prepared?"
  - Visa: "Do you have a sponsor employer?" NOT "Are you committed?"
  - Startup: "Have you talked to 20+ potential customers?" NOT "Have you validated?"
  - Weight loss: "Do you have a gym membership or home equipment?" NOT "Are you motivated?"`;

    // BUSINESS TYPE DETECTION: auto-select specific data
    const businessType = detectBusinessType(scenario);
    if (businessType) {
      console.log(`[API] Business type detected: ${businessType}`);
    }

    // LAYER 0: Sacred foundation — injected FIRST because it's the base
    const sacredContext = findSacredPatterns(scenario);
    if (sacredContext) {
      liveStr += `\n\n${sacredContext}`;
    }

    // LAYER 2: Real probabilities (confirms Layer 0)
    const realProbs = loadRealProbabilities();
    if (realProbs) {
      liveStr += `\n\nVERIFIED REAL PROBABILITIES (confirms the sacred patterns above — use these exact numbers):\n${realProbs}`;
    }

    // CONTEXT TAGS: structured routing modifiers
    const tagModifier = tags ? getTagPromptModifier(tags) : '';
    if (tagModifier) {
      liveStr += tagModifier;
      console.log(`[API] Context tags active: ${Object.entries(tags || {}).filter(([,v]) => v).map(([k,v]) => `${k}=${v}`).join(', ')}`);
    }

    // USER PROFILE: personalized probability calibration
    if (profile && Object.keys(profile).length > 0) {
      const { getProfilePromptModifier } = await import('@/lib/user-profile');
      const profileMod = getProfilePromptModifier(profile as import('@/lib/user-profile').UserProfile);
      if (profileMod) {
        liveStr += profileMod;
        console.log(`[API] Profile active: ${Object.keys(profile).filter(k => !k.startsWith('_') && profile![k] != null).length} fields`);
      }
    }

    // Dynamic part — changes per request (live data, KB context, tags, profile)
    const dynamicPrompt = liveStr ? liveStr.trim() : '';

    const userMsg = `Scenario: "${scenario}"\n\nUSE THESE DATA POINTS:\n${kbContext || 'Use Tier S/A sources.'}\n\nReturn ONLY JSON.`;

    let flow: Record<string, unknown>;
    try {
      flow = await callClaude(staticPrompt, dynamicPrompt, userMsg) as Record<string, unknown>;
      flow._provider = 'claude';
    } catch (claudeErr) {
      console.warn('[API] Claude failed, trying OpenAI:', (claudeErr as Error).message);
      const fullPrompt = dynamicPrompt ? `${staticPrompt}\n\n${dynamicPrompt}` : staticPrompt;
      try {
        flow = await callOpenAI(fullPrompt, userMsg) as Record<string, unknown>;
        flow._provider = 'openai';
      } catch (openaiErr) {
        console.warn('[API] OpenAI failed, trying Groq:', (openaiErr as Error).message);
        flow = await callGroq(fullPrompt, userMsg) as Record<string, unknown>;
        flow._provider = 'groq';
      }
    }
    flow._live_data = !!(live?.gdp || countryData || exchangeRates || laborData || cryptoData || cityData);
    flow._data_source = dataSource;

    return NextResponse.json(flow);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
