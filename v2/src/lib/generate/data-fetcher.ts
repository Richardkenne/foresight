import fs from 'fs';
import path from 'path';
import https from 'https';
import { ragSearch, isRagReady } from '@/lib/rag';
import type {
  SacredEntry, SacredIndex, SacredRoot,
  ArchetypeData, SectionData, SectionEntry, FunnelData,
  RestCountryResponse, TeleportResponse,
} from './types';

// ============ REAL PROBABILITIES LOOKUP ============
export function loadRealProbabilities(): string {
  const filePath = path.join(process.cwd(), 'data', 'real-probabilities.json');
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
let sacredIndex: SacredIndex | null = null;
function loadSacredIndex(): SacredIndex | null {
  if (sacredIndex) return sacredIndex;
  try {
    const filePath = path.join(process.cwd(), 'data', 'sacred-index.json');
    sacredIndex = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return sacredIndex;
  } catch { return null; }
}

// ============ 36 SACRED ROOTS ============
let sacredRoots: SacredRoot[] | null = null;
function loadSacredRoots(): SacredRoot[] | null {
  if (sacredRoots) return sacredRoots;
  try {
    const filePath = path.join(process.cwd(), 'data', 'sacred-roots.json');
    sacredRoots = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return sacredRoots;
  } catch { return null; }
}

export function matchSacredRoots(scenario: string, limit = 5): string {
  const roots = loadSacredRoots();
  if (!roots) return '';

  const words = scenario.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  const scores: { root: SacredRoot; score: number }[] = [];
  for (const root of roots) {
    let score = 0;
    for (const word of words) {
      if (root.keywords.some(kw => kw.includes(word) || word.includes(kw))) score += 2;
      if (root.description.toLowerCase().includes(word)) score += 1;
      if (root.label_positive.toLowerCase().includes(word)) score += 1;
      if (root.label_negative.toLowerCase().includes(word)) score += 1;
    }
    for (const ex of root.example_sentences) {
      const exWords = ex.toLowerCase().split(/\s+/);
      const overlap = words.filter(w => exWords.some(ew => ew.includes(w))).length;
      score += overlap;
    }
    if (score > 0) scores.push({ root, score });
  }

  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, limit);
  if (top.length === 0) return '';

  const lines = top.map(({ root }) =>
    `- [${root.id}] ${root.label_positive} <-> ${root.label_negative} | Bible: ${root.bible_key} "${root.bible_text.substring(0, 80)}..." | Quran: ${root.quran_key} | ${root.description}`
  );

  return `\n\nSACRED ROOTS (36 irreducible behavioral atoms — these determine the outcome):
${lines.join('\n')}
Use these roots to determine WHY nodes succeed or fail. Each bottleneck/gate outcome is determined by which pole of these roots the person is on.`;
}

export function findSacredPatterns(scenario: string, limit = 20): string {
  const idx = loadSacredIndex();
  if (!idx) return '';

  const words = scenario.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3);

  const scores: Record<number, number> = {};
  for (const word of words) {
    const matches = idx.keywordIndex[word];
    if (matches) {
      for (const patternIdx of matches) {
        scores[patternIdx] = (scores[patternIdx] || 0) + 1;
      }
    }
  }

  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([i]) => idx.patterns[Number(i)]);

  if (ranked.length === 0) return '';

  const lines = ranked.map(p =>
    `- ${p.s} | Bible: ${p.b} | Quran: ${p.q} | Source: ${p.src}`
  );

  return `SACRED FOUNDATION (Bible + Quran — USE THESE as the basis for probabilities):\n${lines.join('\n')}`;
}

// ============ KNOWLEDGE BASE ============
export function loadKB() {
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
const BUSINESS_TYPE_KEYWORDS: Record<string, string[]> = {
  'saas-data': ['saas', 'software', 'app', 'subscription', 'mrr', 'arr', 'churn', 'b2b software', 'platform', 'tool', 'dashboard', 'api product'],
  'fnb-data': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'kitchen', 'catering', 'food truck', 'bakery', 'pizzeria', 'warung', 'kedai', 'kopi', 'ristorante'],
  'agency-data': ['agency', 'consulting', 'freelance to agency', 'smma', 'marketing agency', 'dev agency', 'design agency', 'agenzia', 'consulenza', 'service business', 'retainer'],
  'marketplace-data': ['marketplace', 'platform', 'two-sided', 'network effect', 'aggregator', 'matching', 'uber for', 'airbnb for'],
  'creator-data': ['youtube', 'tiktok', 'podcast', 'newsletter', 'substack', 'patreon', 'content creator', 'influencer', 'creator economy', 'streaming'],
  'ecommerce-data': ['ecommerce', 'e-commerce', 'shopify', 'dropshipping', 'amazon fba', 'online store', 'dtc', 'direct to consumer', 'print on demand', 'toko online'],
  'upwork-data': ['upwork', 'freelance', 'freelancer', 'freelancing', 'proposal', 'connects', 'top rated', 'expert vetted', 'fiverr', 'gig', 'client acquisition', 'JSS', 'job success'],
  'cleaning-service-business': ['cleaning', 'cleaning service', 'janitorial', 'maid service', 'housekeeping', 'pulizia', 'kebersihan'],
  'gym-fitness-business': ['gym', 'fitness studio', 'personal training', 'crossfit', 'pilates', 'yoga studio', 'palestra', 'open a gym'],
  'photography-business': ['photography', 'photographer', 'photo business', 'portrait', 'wedding photography', 'studio photo', 'fotografo'],
  'salon-beauty-business': ['salon', 'hair salon', 'beauty salon', 'barbershop', 'barber', 'hairdresser', 'nail salon', 'spa', 'salone', 'parrucchiere'],
  'franchise-business': ['franchise', 'franchising', 'brand license', 'waralaba', 'open a franchise', 'buy a franchise'],
  'cafe-restaurant-business': ['restaurant', 'ristorante', 'open a restaurant', 'cafe business', 'food business', 'trattoria', 'osteria'],
  'youtube-guru-funnel-data': ['coaching', 'life coach', 'business coach', 'online course', 'info product', 'mentorship', 'coaching business', 'corso online'],
  'creator-podcast': ['podcast', 'podcasting', 'start a podcast', 'podcast monetize', 'audio show'],
};

export function detectBusinessType(scenario: string): string | null {
  const lower = scenario.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;
  for (const [file, keywords] of Object.entries(BUSINESS_TYPE_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = file; }
  }
  return bestScore >= 1 ? bestMatch : null;
}

// ============ INDUSTRY BASE PROBABILITIES ============
const BUSINESS_BASE_PROBS: Record<string, { label: string; probs: Record<string, number>; sources: string }> = {
  'saas-data': {
    label: 'SaaS',
    probs: {
      funding_seed: 0.12, product_market_fit: 0.25, reach_1k_mrr: 0.18,
      scale_to_10k_mrr: 0.08, survive_year1: 0.80, survive_year3: 0.50,
      profitable_year3: 0.20, exit_acquisition: 0.05,
    },
    sources: 'CB Insights 2024, SaaStr 2024, Stripe Atlas 2024',
  },
  'fnb-data': {
    label: 'Food & Beverage',
    probs: {
      location_secured: 0.60, survive_year1: 0.40, profit_year2: 0.25,
      survive_year3: 0.35, expand_second_location: 0.10,
      health_inspection_pass: 0.85, break_even_6mo: 0.30,
    },
    sources: 'BLS 2024, Restaurant Association 2024, Toast 2024',
  },
  'agency-data': {
    label: 'Agency / Consulting',
    probs: {
      first_client: 0.55, retain_clients_6mo: 0.35, scale_team_5plus: 0.20,
      reach_10k_monthly: 0.30, survive_year1: 0.65, profitable_year1: 0.40,
      transition_retainer: 0.25,
    },
    sources: 'HubSpot Agency Report 2024, Promethean Research 2024',
  },
  'marketplace-data': {
    label: 'Marketplace',
    probs: {
      chicken_egg_solved: 0.15, liquidity_threshold: 0.10, funding_seed: 0.08,
      survive_year1: 0.70, reach_gmv_100k: 0.12, network_effects_active: 0.08,
      unit_economics_positive: 0.15,
    },
    sources: 'a16z Marketplace 2024, Lenny Rachitsky 2024, PitchBook 2024',
  },
  'creator-data': {
    label: 'Creator Economy',
    probs: {
      first_1000_followers: 0.30, monetization_enabled: 0.15, earn_1k_month: 0.05,
      earn_10k_month: 0.01, full_time_income: 0.04, brand_deal_first: 0.12,
      burnout_year1: 0.60,
    },
    sources: 'SignalFire Creator Report 2024, Linktree 2024, YouTube Creator Data 2024',
  },
  'ecommerce-data': {
    label: 'E-commerce',
    probs: {
      first_sale: 0.45, profitable_month1: 0.15, reach_10k_revenue: 0.20,
      survive_year1: 0.55, scale_100k_revenue: 0.08, positive_roas: 0.30,
      repeat_customer_rate: 0.25,
    },
    sources: 'Shopify 2024, Statista 2024, Jungle Scout 2024',
  },
  'upwork-data': {
    label: 'Upwork / Freelance',
    probs: {
      profile_approved: 0.55, first_job: 0.025, active_after_year1: 0.008,
      reach_50h_rate: 0.10, top_rated_badge: 0.05, retainer_client: 0.15,
      agency_transition: 0.05,
    },
    sources: 'Upwork SEC Filing 2024, Freelancer Union 2024',
  },
  'cleaning-service-business': {
    label: 'Cleaning Service',
    probs: {
      first_client: 0.70, survive_year1: 0.65, scale_team: 0.25, revenue_50k: 0.40,
    },
    sources: 'IBIS World 2024, SBA 2024, Cleaning Business Today 2024',
  },
  'gym-fitness-business': {
    label: 'Gym / Fitness Studio',
    probs: {
      location: 0.55, survive_year1: 0.40, members_500: 0.30, profit_year2: 0.25,
    },
    sources: 'IHRSA 2024, Club Industry 2024, BLS 2024',
  },
  'photography-business': {
    label: 'Photography',
    probs: {
      first_client: 0.60, full_time: 0.25, revenue_50k: 0.20, studio: 0.15,
    },
    sources: 'PPA 2024, BLS OES 2024, Photoshelter 2024',
  },
  'salon-beauty-business': {
    label: 'Salon / Beauty',
    probs: {
      location: 0.60, survive_year1: 0.55, regular_clients: 0.45, profit_year1: 0.35,
    },
    sources: 'IBIS World 2024, BLS 2024, Professional Beauty Association 2024',
  },
  'franchise-business': {
    label: 'Franchise',
    probs: {
      approval: 0.65, funding: 0.50, survive_year1: 0.85, roi_3years: 0.60,
    },
    sources: 'IFA 2024, FRANdata 2024, Franchise Business Review 2024',
  },
  'cafe-restaurant-business': {
    label: 'Restaurant / Cafe',
    probs: {
      location: 0.55, survive_year1: 0.40, profit_year2: 0.25, expand: 0.10,
    },
    sources: 'BLS 2024, Restaurant Association 2024, Toast 2024',
  },
  'youtube-guru-funnel-data': {
    label: 'Coaching / Info Products',
    probs: {
      first_client: 0.55, full_time: 0.20, revenue_100k: 0.12, scale: 0.08,
    },
    sources: 'Coaching Federation 2024, Kajabi 2024, Teachable 2024',
  },
  'creator-podcast': {
    label: 'Podcast',
    probs: {
      launch: 0.80, reach_1000: 0.15, monetize: 0.08, full_time: 0.03,
    },
    sources: 'Edison Research 2024, Spotify 2024, Podcast Index 2024',
  },
};

// ============ COUNTRY BUSINESS MODIFIERS ============
// Sector keys: fnb = food & beverage, tech = software/saas, services = agency/freelance/coaching
interface CountryModifier {
  modifier: number; // default multiplier (backward compat)
  label: string;
  sectors?: Partial<Record<string, number>>; // optional per-sector overrides
}

const COUNTRY_MODIFIERS: Record<string, CountryModifier> = {
  'united states': { modifier: 1.0, label: 'US (baseline)' },
  'usa': { modifier: 1.0, label: 'US (baseline)' },
  'united kingdom': { modifier: 0.95, label: 'UK' },
  'uk': { modifier: 0.95, label: 'UK' },
  'germany': { modifier: 0.90, label: 'Germany', sectors: { fnb: 0.85, tech: 0.92, services: 0.90 } },
  'canada': { modifier: 0.95, label: 'Canada' },
  'australia': { modifier: 0.92, label: 'Australia', sectors: { fnb: 0.88, tech: 0.90, services: 0.93 } },
  'france': { modifier: 0.85, label: 'France', sectors: { fnb: 0.90, tech: 0.80, services: 0.82 } },
  'italy': { modifier: 0.75, label: 'Italy', sectors: { fnb: 0.85, tech: 0.65, services: 0.70 } },
  'spain': { modifier: 0.80, label: 'Spain', sectors: { fnb: 0.85, tech: 0.72, services: 0.78 } },
  'netherlands': { modifier: 0.93, label: 'Netherlands' },
  'sweden': { modifier: 0.92, label: 'Sweden' },
  'norway': { modifier: 0.90, label: 'Norway' },
  'denmark': { modifier: 0.93, label: 'Denmark' },
  'switzerland': { modifier: 0.95, label: 'Switzerland' },
  'ireland': { modifier: 0.93, label: 'Ireland', sectors: { tech: 0.96, services: 0.90 } },
  'singapore': { modifier: 0.98, label: 'Singapore', sectors: { fnb: 0.92, tech: 1.0, services: 0.95 } },
  'japan': { modifier: 0.82, label: 'Japan', sectors: { fnb: 0.88, tech: 0.85, services: 0.75 } },
  'south korea': { modifier: 0.88, label: 'South Korea', sectors: { tech: 0.92, fnb: 0.82 } },
  'china': { modifier: 0.75, label: 'China', sectors: { fnb: 0.80, tech: 0.82, services: 0.65 } },
  'india': { modifier: 0.65, label: 'India', sectors: { fnb: 0.70, tech: 0.75, services: 0.60 } },
  'indonesia': { modifier: 0.60, label: 'Indonesia', sectors: { fnb: 0.75, tech: 0.50, services: 0.65 } },
  'thailand': { modifier: 0.65, label: 'Thailand', sectors: { fnb: 0.75, tech: 0.55, services: 0.62 } },
  'vietnam': { modifier: 0.60, label: 'Vietnam', sectors: { fnb: 0.70, tech: 0.55, services: 0.58 } },
  'philippines': { modifier: 0.58, label: 'Philippines', sectors: { fnb: 0.65, tech: 0.50, services: 0.62 } },
  'malaysia': { modifier: 0.72, label: 'Malaysia', sectors: { fnb: 0.78, tech: 0.68, services: 0.72 } },
  'brazil': { modifier: 0.62, label: 'Brazil', sectors: { fnb: 0.70, tech: 0.58, services: 0.60 } },
  'mexico': { modifier: 0.65, label: 'Mexico', sectors: { fnb: 0.72, tech: 0.58, services: 0.62 } },
  'argentina': { modifier: 0.55, label: 'Argentina', sectors: { fnb: 0.60, tech: 0.55, services: 0.52 } },
  'colombia': { modifier: 0.60, label: 'Colombia' },
  'chile': { modifier: 0.72, label: 'Chile' },
  'peru': { modifier: 0.58, label: 'Peru' },
  'nigeria': { modifier: 0.45, label: 'Nigeria', sectors: { fnb: 0.55, tech: 0.40, services: 0.42 } },
  'south africa': { modifier: 0.60, label: 'South Africa' },
  'kenya': { modifier: 0.52, label: 'Kenya', sectors: { tech: 0.58, fnb: 0.55, services: 0.48 } },
  'ghana': { modifier: 0.50, label: 'Ghana' },
  'egypt': { modifier: 0.55, label: 'Egypt' },
  'turkey': { modifier: 0.62, label: 'Turkey', sectors: { fnb: 0.68, tech: 0.58, services: 0.60 } },
  'poland': { modifier: 0.80, label: 'Poland', sectors: { tech: 0.85, services: 0.78 } },
  'portugal': { modifier: 0.82, label: 'Portugal' },
  'new zealand': { modifier: 0.90, label: 'New Zealand' },
  'taiwan': { modifier: 0.88, label: 'Taiwan', sectors: { tech: 0.92, fnb: 0.82 } },
  'hong kong': { modifier: 0.90, label: 'Hong Kong' },
  'united arab emirates': { modifier: 0.85, label: 'UAE', sectors: { fnb: 0.80, tech: 0.88, services: 0.82 } },
  'saudi arabia': { modifier: 0.70, label: 'Saudi Arabia' },
};

// Map business type keys to sector categories for country modifier lookup
const BUSINESS_TYPE_TO_SECTOR: Record<string, string> = {
  'fnb-data': 'fnb',
  'cafe-restaurant-business': 'fnb',
  'saas-data': 'tech',
  'agency-data': 'services',
  'upwork-data': 'services',
  'cleaning-service-business': 'services',
  'salon-beauty-business': 'services',
  'photography-business': 'services',
  'youtube-guru-funnel-data': 'services',
  'ecommerce-data': 'tech',
  'marketplace-data': 'tech',
  'creator-data': 'services',
  'creator-podcast': 'services',
  'gym-fitness-business': 'services',
  'franchise-business': 'fnb', // most franchises are F&B
};

export function buildIndustryCountryContext(
  businessType: string | null,
  detectedCountries: string[],
  profileCountry?: string,
): string {
  let ctx = '';
  const country = profileCountry?.toLowerCase()
    || (detectedCountries.length > 0 ? detectedCountries[0] : null);
  const countryMod = country ? COUNTRY_MODIFIERS[country] : null;

  if (businessType && BUSINESS_BASE_PROBS[businessType]) {
    const bp = BUSINESS_BASE_PROBS[businessType];
    // Use sector-specific modifier if available, fall back to default
    const sector = BUSINESS_TYPE_TO_SECTOR[businessType];
    const sectorMod = sector ? countryMod?.sectors?.[sector] : undefined;
    const sectorModifier: number = (typeof sectorMod === 'number' ? sectorMod : countryMod?.modifier) ?? 1.0;
    const adjustedProbs = Object.entries(bp.probs)
      .map(([k, v]) => {
        const adjusted = Math.min(0.99, Math.max(0.01, v * sectorModifier));
        return `  ${k.replace(/_/g, ' ')}: ${(adjusted * 100).toFixed(1)}%`;
      })
      .join('\n');

    const modLabel = countryMod
      ? ` in ${countryMod.label}, ${sector ? `sector "${sector}" ` : ''}modifier ${sectorModifier}x`
      : '';
    ctx += `\n\nINDUSTRY BASELINE PROBABILITIES (${bp.label}${modLabel}):\n${adjustedProbs}\nSources: ${bp.sources}`;
    ctx += `\nUSE THESE AS BASE RATES. Every bottleneck/gate probability should START from these numbers and adjust only if the specific scenario warrants it.`;
  }

  if (countryMod && !businessType) {
    ctx += `\n\nCOUNTRY MODIFIER: ${countryMod.label} = ${countryMod.modifier}x baseline (World Bank Ease of Doing Business). Apply this multiplier to all business-related probabilities.`;
  }

  return ctx;
}

// ============ KEYWORD MAP ============
const KEYWORDS: Record<string, string[]> = {
  'saas-data': ['saas', 'software', 'app', 'subscription', 'mrr', 'arr', 'churn', 'b2b', 'tool', 'dashboard'],
  'fnb-data': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'kitchen', 'catering', 'food truck', 'bakery', 'warung', 'kedai', 'kopi', 'ristorante'],
  'agency-data': ['agency', 'consulting', 'smma', 'marketing agency', 'dev agency', 'agenzia', 'consulenza', 'service business', 'retainer'],
  'marketplace-data': ['marketplace', 'platform', 'two-sided', 'network effect', 'aggregator', 'uber for', 'airbnb for'],
  'creator-data': ['youtube', 'tiktok', 'podcast', 'newsletter', 'substack', 'patreon', 'content creator', 'influencer', 'streaming'],
  'ecommerce-data': ['ecommerce', 'e-commerce', 'shopify', 'dropshipping', 'amazon fba', 'online store', 'dtc', 'print on demand', 'toko online'],
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
  'marketing-growth-data': ['marketing', 'seo', 'ads', 'content', 'email', 'social media', 'growth', 'pubblicità', 'crescita', 'clienti', 'vendere', 'vendita', 'pemasaran', 'iklan', 'personal brand', 'branding', 'networking', 'rete', 'contatti', 'visibilità', 'copywriting', 'copy'],
  'seo-organic-deep': ['seo', 'search engine', 'organic', 'organico', 'google', 'ranking', 'posizionamento', 'backlink', 'keyword', 'parole chiave', 'serp', 'domain authority', 'link building', 'content seo', 'technical seo', 'indicizzazione', 'traffico organico', 'kata kunci', 'peringkat'],
  'email-marketing-deep': ['email', 'email marketing', 'newsletter', 'open rate', 'click rate', 'sequence', 'autoresponder', 'drip', 'campaign', 'campagna', 'subject line', 'deliverability', 'subscriber', 'iscritto', 'opt-in', 'lead magnet', 'segmentation', 'mailchimp', 'convertkit'],
  'ad-channels-conversion': ['ad channel', 'advertis', 'conversion', 'paid ad', 'cpc', 'cpm', 'ctr', 'roas', 'facebook ad', 'google ad', 'tiktok ad', 'instagram ad', 'meta ad', 'campaign', 'pubblicit', 'annunci', 'conversione', 'iklan', 'paid media', 'ppc', 'retarget', 'remarketing'],
  'sales-outreach-data': ['sales', 'vendite', 'penjualan', 'outreach', 'cold email', 'cold call', 'prospecting', 'prospect', 'lead gen', 'lead generation', 'pipeline', 'follow up', 'conversion rate', 'reply rate', 'cadence', 'b2b sales', 'sdr', 'generazione lead', 'email fredde'],
  'negotiation-closing': ['negotiation', 'negotiate', 'closing', 'deal', 'persuasion', 'sales call', 'objection', 'anchor', 'BATNA', 'leverage', 'pitch', 'win-win', 'negoziazione', 'chiusura', 'trattativa', 'vendita', 'negosiasi', 'tawar'],
  'social-proof-mechanics': ['social proof', 'prova sociale', 'testimonial', 'testimonianz', 'review', 'recension', 'ulasan', 'trust', 'fiducia', 'kepercayaan', 'credibility', 'credibilità', 'rating', 'case study', 'endorsement', 'word of mouth', 'passaparola', 'ugc'],
  'community-engagement-deep': ['communit', 'engag', 'member', 'forum', 'discord', 'slack', 'group', 'tribe', 'comunità', 'coinvolgimento', 'membri', 'komunitas', 'anggota', 'loyalty', 'ambassador', 'networking', 'rete di contatti'],
  'upwork-data': ['upwork', 'freelance', 'freelancer', 'freelancing', 'proposal', 'connects', 'top rated', 'expert vetted', 'fiverr', 'gig', 'client acquisition', 'JSS', 'job success', 'agency freelance', 'retainer', 'hourly rate'],
  'career-employment': ['job', 'career', 'salary', 'hire', 'resume', 'interview', 'layoff', 'freelance', 'lavoro', 'carriera', 'stipendio', 'assunz', 'colloquio', 'licenzia', 'pekerjaan', 'gaji', 'karir', 'skill', 'impara', 'competenz', 'portfolio', 'consulting', 'consulenz'],
  'side-hustle-entrepreneurship': ['side hustle', 'dropship', 'etsy', 'youtube', 'newsletter', 'lavoretto', 'secondo lavoro', 'extra', 'sampingan', 'usaha sampingan'],
  'remote-work-digital-nomad': ['remote', 'remote work', 'lavoro remoto', 'kerja remote', 'digital nomad', 'nomade digitale', 'work from home', 'wfh', 'coworking', 'smart working', 'distributed', 'async', 'timezone', 'location independent', 'bali', 'bekerja dari rumah', 'hybrid work'],
  'education-stats': ['education', 'university', 'college', 'degree', 'bootcamp', 'mba', 'phd', 'learn', 'course', 'università', 'laurea', 'studio', 'studiare', 'corso', 'scuola', 'training', 'upskill', 'reskill', 'formazione', 'pelatihan', 'belajar', 'kuliah', 'sekolah', 'certificat', 'pendidikan', 'libro', 'book', 'leggere'],
  'language-learning': ['language', 'lingua', 'bahasa', 'learn language', 'imparare lingua', 'belajar bahasa', 'polyglot', 'fluency', 'fluenza', 'immersion', 'immersione', 'vocabulary', 'grammar', 'pronunciation', 'bilingual', 'multilingual', 'Duolingo', 'Anki', 'conversation'],
  'personal-finance-data': ['money', 'finance', 'saving', 'credit', 'wealth', 'budget', 'soldi', 'risparmi', 'ricco', 'guadagn', 'debito', 'finanz', 'invest', 'retire', 'emergency fund', 'compounding', 'interesse', 'tabungan', 'keuangan', 'hutang', 'pensione', 'menabung', 'investasi', 'dana darurat', 'cicilan'],
  'crypto-trading-investing': ['crypto', 'bitcoin', 'trading', 'stock', 'forex', 'invest', 'etf', 'criptovalut', 'azioni', 'borsa', 'investir', 'saham', 'perdagangan'],
  'prediction-markets-trading': ['prediction market', 'Polymarket', 'betting', 'odds', 'probability', 'forecast', 'wager', 'speculate', 'position', 'hedge', 'arbitrage', 'event contract', 'mercato predittivo', 'scommessa', 'probabilità', 'prediksi', 'taruhan'],
  'debt-bankruptcy-financial-crisis': ['debt', 'debito', 'hutang', 'bankruptcy', 'bancarotta', 'bangkrut', 'broke', 'financial crisis', 'crisi finanziaria', 'indebitamento', 'insolvency', 'default', 'creditor', 'foreclosure', 'restructuring', 'ristrutturazione', 'pinjaman', 'debt free'],
  'real-estate-housing': ['house', 'rent', 'mortgage', 'property', 'real estate', 'apartment', 'casa', 'affitto', 'mutuo', 'immobil', 'appartamento', 'comprare casa', 'rumah', 'sewa', 'KPR'],
  'health-fitness': ['health', 'fitness', 'gym', 'weight', 'diet', 'exercise', 'sleep', 'meditation', 'palestra', 'dieta', 'peso', 'dimagrire', 'salute', 'dormire', 'workout', 'running', 'muscle', 'yoga', 'mental health', 'benessere', 'olahraga', 'sehat', 'kebugaran', 'corsa', 'allenamento', 'nutrizione', 'calorie', 'perdi peso', 'massa muscolare', 'fisico', 'corpo'],
  'sports-fitness-goals': ['sports', 'sport', 'olahraga', 'athletic', 'atletica', 'marathon', 'maratona', 'strength', 'forza', 'training', 'allenamento', 'latihan', 'workout', 'running', 'corsa', 'gym', 'palestra', 'muscle', 'endurance', 'resistenza', 'personal record', 'prestazione'],
  'mental-health-psychology': ['mental', 'depress', 'anxiety', 'therapy', 'burnout', 'stress', 'depressione', 'ansia', 'terapia', 'psicologo', 'kesehatan mental', 'terapi'],
  'burnout-mental-health-entrepreneurs': ['burnout', 'burn out', 'founder', 'entrepreneur', 'depress', 'exhaust', 'wellbeing', 'esaurim', 'salute mentale', 'imprenditor', 'kelelahan', 'founder depression', 'overwhelm'],
  'addiction-substance-use': ['addict', 'drug', 'alcohol', 'smoking', 'porn', 'cannabis', 'dipendenz', 'droga', 'alcol', 'fumare', 'sigarett', 'kecanduan', 'narkoba'],
  'relationships': ['relationship', 'marriage', 'divorce', 'dating', 'friend', 'love', 'partner', 'relazione', 'matrimonio', 'divorzio', 'sposare', 'fidanzat', 'amore', 'breakup', 'toxic', 'long distance', 'coppia', 'separazione', 'pacaran', 'hubungan', 'nikah', 'rottura', 'jodoh', 'putus', 'pasangan', 'amico', 'amicizia', 'prestare', 'prestito'],
  'family-dynamics': ['family', 'parent', 'child', 'marriage', 'divorce', 'elder', 'famiglia', 'genitori', 'figli', 'figlio', 'keluarga', 'orang tua', 'anak'],
  'parenting-child-development': ['parenting', 'parent', 'child', 'kid', 'raising kids', 'child development', 'pregnancy', 'toddler', 'baby', 'discipline', 'milestone', 'genitorialità', 'bambino', 'gravidanza', 'sviluppo', 'pengasuhan', 'anak', 'bayi', 'kehamilan'],
  'trust-secrets-betrayal': ['trust', 'betray', 'betrayal', 'secret', 'loyalty', 'cheat', 'cheating', 'lies', 'lying', 'honest', 'affair', 'deceit', 'fiducia', 'tradimento', 'tradire', 'segreto', 'bugia', 'lealtà', 'kepercayaan', 'selingkuh', 'rahasia', 'bohong'],
  'dreams-ambition-failure': ['dream', 'ambition', 'fail', 'goal', 'impostor', 'perfect', 'motivat', 'win', 'winning', 'success', 'achieve', 'compete', 'sogno', 'ambizione', 'fallire', 'obiettivo', 'motivazione', 'vincere', 'successo', 'mimpi', 'cita-cita', 'menang'],
  'life-transitions-decisions': ['transition', 'life change', 'decision', 'big decision', 'career change', 'moving', 'midlife', 'quarter-life', 'pivot', 'crossroads', 'turning point', 'restart', 'transizione', 'cambiamento', 'decisione', 'scelta di vita', 'keputusan', 'perubahan hidup'],
  'consumption-action-gap': ['consumption', 'action gap', 'procrastinat', 'knowing', 'doing', 'execut', 'tutorial hell', 'overthink', 'paralysis', 'analysis paralysis', 'azione', 'procrastin', 'blocco', 'penundaan', 'information overload', 'inaction'],
  'psychology-behavioral-business': ['psychology', 'psicologia', 'psikologi', 'behavioral', 'bias', 'cognitive', 'nudge', 'decision making', 'heuristic', 'anchoring', 'framing', 'loss aversion', 'sunk cost', 'confirmation bias', 'persuasion', 'irrational', 'pregiudizi cognitivi', 'comportament'],
  'social-dynamics-influence': ['social dynamics', 'influence', 'influenza', 'persuasion', 'persuasione', 'status', 'networking', 'power', 'potere', 'charisma', 'authority', 'autorità', 'hierarchy', 'social capital', 'pengaruh', 'reciprocity'],
  'productivity-human-performance': ['productivity', 'habit', 'focus', 'deep work', 'performance', 'flow state', 'time management', 'routine', 'efficiency', 'procrastination', 'pomodoro', 'energy', 'peak performance', 'produttività', 'abitudine', 'concentrazione', 'produktivitas', 'kebiasaan', 'fokus'],
  'aging-retirement-life-stages': ['age', 'aging', 'retire', 'retirement', 'pension', 'midlife', 'mid-life', 'life stage', '40s', '50s', '60s', 'senior', 'elder', 'longevity', 'pensione', 'vecchi', 'anzian', 'invecchi', 'mezza età', 'terza età', 'pensiun', 'lansia'],
  'tech-adoption': ['tech', 'ai', 'software', 'cloud', 'cyber', 'blockchain', 'digital', 'tecnologia', 'intelligenza artificiale', 'digitale', 'teknologi'],
  'ai-tools-impact-2025': ['ai', 'artificial intellig', 'chatgpt', 'gpt', 'automat', 'machine learn', 'job displace', 'robot', 'copilot', 'midjourney', 'generativ', 'llm', 'prompt', 'intelligenza artificial', 'automazione', 'kecerdasan buatan', 'ai tool', 'deep learn'],
  'legal-datapoints': ['legal', 'legale', 'hukum', 'law', 'legge', 'contract', 'contratto', 'kontrak', 'IP', 'intellectual property', 'trademark', 'marchio', 'merek', 'copyright', 'patent', 'brevetto', 'NDA', 'license', 'licenza', 'compliance'],
  'legal-tax-business-reality': ['tax', 'tasse', 'pajak', 'tax planning', 'LLC', 'incorporation', 'business structure', 'struttura aziendale', 'PT', 'S-corp', 'SRL', 'partita IVA', 'NPWP', 'deduction', 'detrazione', 'write-off', 'commercialista', 'akuntan'],
  'twitter-x-behavior': ['twitter', 'tweet', 'x.com', 'viral', 'follower', 'posting', 'retweet', 'thread', 'influencer', 'engagement', 'algorithm', 'meme', 'troll', 'cancel', 'hashtag', 'social media', 'sosmed', 'trending', 'virale'],
  'youtube-guru-funnel-data': ['youtube guru', 'guru', 'online course', 'info product', 'fake guru', 'webinar', 'masterclass', 'coaching', 'mentorship', 'scam', 'get rich', 'passive income', 'corso online', 'truffa', 'formatore', 'kursus', 'reddito passivo', 'fuffa'],
  'immigration-relocation-research': ['immigrat', 'visa', 'expat', 'move', 'relocat', 'country', 'abroad', 'cittadin', 'emigr', 'trasferir', 'estero', 'visto', 'permesso', 'pindah', 'imigrasi'],
  'creative-arts-career': ['creativ', 'art', 'artist', 'music', 'musician', 'writing', 'writer', 'acting', 'actor', 'design', 'film', 'paint', 'photograph', 'arte', 'scrittura', 'seni', 'seniman', 'menulis', 'penulis'],
  'nonprofit-social-impact': ['nonprofit', 'non-profit', 'NGO', 'social impact', 'charity', 'volunteering', 'donation', 'foundation', 'cause', 'grant', 'fundraising', 'philanthropy', 'no-profit', 'impatto sociale', 'beneficenza', 'volontariato', 'amal', 'yayasan'],
  'crisis-survival-resilience': ['crisis', 'crisi', 'krisis', 'survive', 'survival', 'sopravvivere', 'resilience', 'resilienza', 'emergency', 'emergenza', 'darurat', 'recession', 'recessione', 'downturn', 'collapse', 'recover', 'recovery', 'ripresa', 'antifragile'],
  'market-timing-trends': ['market timing', 'timing', 'trend', 'seasonal', 'cycle', 'launch timing', 'when to launch', 'window', 'momentum', 'wave', 'hype', 'tendenza', 'stagionale', 'tren', 'kapan', 'waktu pasar'],
  'time-to-result-benchmarks': ['time to result', 'how long', 'quanto tempo', 'berapa lama', 'timeline', 'tempistic', 'benchmark', 'realistic', 'realistico', 'expectation', 'aspettativ', 'duration', 'durata', 'patience', 'pazienza', 'milestone', 'learning curve'],
  'sacred-texts-patterns': ['human nature', 'temptation', 'greed', 'pride', 'fear', 'faith', 'tentazione', 'avidità', 'paura', 'fede', 'bible', 'bibbia', 'quran'],
  'historical-cycles': ['bubble', 'crash', 'cycle', 'repeat', 'history', 'empire', 'mania', 'bolla', 'crisi', 'ciclo', 'storia', 'gelembung', 'sejarah'],
  'bls-unemployment': ['unemploy', 'disoccupazion', 'jobless', 'labor market', 'mercato del lavoro', 'pengangguran', 'job loss'],
  'bls-employment': ['employ', 'nonfarm', 'occupazion', 'payroll', 'workforce', 'forza lavoro', 'tenaga kerja'],
  'bls-cpi-inflation': ['inflation', 'CPI', 'inflazione', 'consumer price', 'prezzi', 'costo della vita', 'inflasi', 'harga'],
  'bls-wages-earnings': ['wage', 'earning', 'salary', 'stipendio', 'salario', 'paga', 'compenso', 'gaji', 'upah', 'hourly'],
  'bls-productivity': ['productivity', 'produttività', 'output', 'efficiency', 'produktivitas', 'labor productivity'],
  'bls-ppi-producer-prices': ['producer price', 'PPI', 'wholesale', 'manufacturing cost', 'costo produzione', 'supply chain cost'],
  'bls-occupational-employment': ['occupation', 'job title', 'profession', 'mestiere', 'professione', 'profesi', 'pekerjaan'],
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
  'choices13k-summary': ['decision', 'choice', 'risk', 'gamble', 'decisione', 'scelta', 'rischio', 'keputusan', 'lottery', 'expected value'],
  'game-theory-behavioral': ['game theory', 'cooperation', 'defect', 'prisoner', 'nash', 'trust game', 'ultimatum', 'cooperazione', 'teoria dei giochi'],
  'mesa-behavioral-models': ['agent', 'simulation', 'model', 'ABM', 'agent-based', 'simulazione', 'emergent', 'complex system'],
  'life-event-probabilities': ['life event', 'probability', 'death', 'birth', 'marriage', 'accident', 'probabilità', 'evento', 'morte', 'nascita'],
  'life-events-granular': ['age', 'year by year', 'anno per anno', 'life stage', 'fase della vita', 'mortality', 'fertility'],
  'country-data-global': ['country data', 'GDP per capita', 'cost of living', 'dati paese', 'costo della vita', 'data negara'],
  'industry-specific-data': ['industry', 'sector', 'settore', 'industria', 'margin', 'survival rate', 'tasso di sopravvivenza', 'industri'],
  'time-series-historical': ['historical', 'time series', 'storico', 'serie storica', 'S&P', 'returns', 'rendimenti', 'federal funds'],
  'sacred-texts-expanded': ['sacred', 'scripture', 'proverb', 'wisdom', 'sacro', 'scrittura', 'proverbio', 'saggezza', 'hikmat'],
  'sacred-batch-1-business': ['business', 'startup', 'impresa', 'bisnis'],
  'sacred-batch-2-finance': ['finance', 'money', 'finanza', 'soldi', 'keuangan'],
  'sacred-batch-3-career': ['career', 'job', 'work', 'carriera', 'lavoro', 'karir'],
  'sacred-batch-4-marketing': ['marketing', 'sales', 'vendita', 'pemasaran'],
  'sacred-batch-5-health': ['health', 'wellness', 'salute', 'benessere', 'kesehatan'],
  'sacred-batch-6-life': ['life', 'purpose', 'meaning', 'vita', 'scopo', 'significato', 'kehidupan'],
  'sacred-batch-7-remaining': ['general', 'human', 'nature', 'umano', 'natura', 'manusia'],
  'immigration-relocation': ['immigrat', 'visa', 'expat', 'move', 'relocat', 'abroad', 'trasferir', 'estero', 'pindah'],
  'marketing-growth': ['marketing', 'growth', 'crescita', 'pemasaran', 'pertumbuhan'],
  'personal-finance': ['money', 'finance', 'saving', 'budget', 'soldi', 'risparmi', 'finanz', 'keuangan'],
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
  'salon-beauty-business': ['salon', 'hair', 'beauty', 'barbershop', 'barber', 'hairdress', 'nail', 'spa', 'cosmetolog', 'salone', 'parrucchier', 'bellezza'],
  'gym-fitness-business': ['gym', 'fitness studio', 'personal train', 'crossfit', 'pilates', 'yoga studio', 'palestra'],
  'medical-clinic-business': ['clinic', 'medical practice', 'physician', 'healthcare practice', 'dentist', 'dental practice', 'klinik'],
  'pet-care-business': ['pet', 'grooming', 'pet care', 'dog', 'cat', 'veterinar', 'pet sit', 'animal care', 'hewan'],
  'daycare-childcare-business': ['daycare', 'childcare', 'child care', 'preschool', 'nursery', 'babysit', 'nanny', 'asilo', 'penitipan anak'],
  'bookstore-retail-business': ['bookstore', 'book store', 'book shop', 'bookshop', 'libreria', 'toko buku'],
  'hotel-hospitality-business': ['hotel', 'hospitality', 'boutique hotel', 'motel', 'inn', 'resort', 'accommodation', 'albergo', 'penginapan'],
  'airbnb-short-term-rental': ['airbnb', 'short term rental', 'vacation rental', 'vrbo', 'rental property', 'affitto breve'],
  'farming-agriculture-business': ['farm', 'farming', 'agriculture', 'crop', 'livestock', 'organic farm', 'ranch', 'agribusiness', 'fattoria', 'agricoltura', 'pertanian'],
  'import-export-trade': ['import', 'export', 'international trade', 'shipping', 'customs', 'cargo', 'wholesale', 'commercio', 'impor', 'ekspor'],
  'franchise-business': ['franchise', 'franchis', 'brand license', 'waralaba'],
  'wedding-event-planning': ['wedding', 'event planning', 'wedding planner', 'event manag', 'bride', 'matrimonio', 'pernikahan'],
  'cleaning-service-business': ['cleaning', 'cleaning service', 'janitorial', 'maid', 'housekeeping', 'pulizia', 'kebersihan'],
  'photography-business': ['photograph', 'photo business', 'portrait', 'wedding photo', 'studio photo', 'fotograf'],
  'tutoring-education-business': ['tutor', 'tutoring', 'private lesson', 'teaching business', 'academic help', 'ripetizioni', 'les privat'],
  'laundromat-business': ['laundromat', 'laundry', 'coin laundry', 'dry clean', 'lavanderia'],
  'landscaping-lawn-care': ['landscap', 'lawn', 'lawn care', 'garden', 'mowing', 'yard', 'tree service', 'giardinaggio'],
  'military-career-data': ['military', 'army', 'navy', 'air force', 'marines', 'enlist', 'veteran', 'soldier', 'officer', 'militare', 'esercito', 'militer'],
};

// ============ SMART EXTRACTION ============
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

// ============ UNIVERSAL EXTRACTORS ============
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromList(data: any[], scenario: string, maxEntries: number): string | null {
  if (!Array.isArray(data) || data.length === 0) return null;
  const lower = scenario.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 3);

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
    const fallback = data.slice(-Math.min(maxEntries, 10));
    if (fallback.length === 0) return null;
    return fallback.map(item => formatListItem(item)).filter(Boolean).join('\n');
  }
  return top.map(({ item }) => formatListItem(item)).filter(Boolean).join('\n');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatListItem(item: any): string {
  if (!item || typeof item !== 'object') return '';
  if (item.series_name && item.value != null) {
    const period = item.period ? `-${item.period}` : '';
    return `  - ${item.series_name} (${item.year || ''}${period}): ${item.value} (${item.source || 'BLS'})`;
  }
  if (item.indicator && item.country && item.value != null) {
    const val = typeof item.value === 'number' && item.value > 1e6
      ? (item.value > 1e9 ? (item.value / 1e9).toFixed(1) + 'B' : (item.value / 1e6).toFixed(1) + 'M')
      : item.value;
    return `  - ${item.country} ${item.indicator} (${item.year || ''}): ${val} (${item.source || 'World Bank'})`;
  }
  if (item.data_entry) {
    return `  - ${item.data_entry} (${item.data_source || item.source || 'Sacred'})`;
  }
  if (item.metric && item.value != null) {
    return `  - ${item.metric}: ${item.value}${item.unit ? ' ' + item.unit : ''} (${item.source || 'Data'}, ${item.year || ''})`;
  }
  const parts: string[] = [];
  for (const [k, v] of Object.entries(item)) {
    if (k.startsWith('_') || k === 'meta') continue;
    if (typeof v === 'number' || (typeof v === 'string' && /\d/.test(v))) {
      parts.push(`${k.replace(/_/g, ' ')}: ${v}`);
    }
  }
  return parts.length > 0 ? `  - ${parts.join(', ')}` : '';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractFromNestedDict(data: Record<string, any>, scenario: string, maxEntries: number): string | null {
  const lower = scenario.toLowerCase();
  const words = lower.split(/\s+/).filter(w => w.length > 3);

  const topicScores: { key: string; score: number }[] = [];
  for (const key of Object.keys(data)) {
    if (key === '_meta' || key === 'meta' || key === '_metadata') continue;
    const keyWords = key.replace(/[_-]/g, ' ').toLowerCase();
    const score = words.filter(w => keyWords.includes(w)).length;
    topicScores.push({ key, score });
  }
  topicScores.sort((a, b) => b.score - a.score);
  const bestTopics = topicScores.slice(0, 3).filter(t => t.score > 0);
  if (bestTopics.length === 0) {
    const fallbackTopics = topicScores.slice(0, 3);
    if (fallbackTopics.length === 0) return null;
    bestTopics.push(...fallbackTopics);
  }

  const lines: string[] = [];
  for (const { key } of bestTopics) {
    if (lines.length >= maxEntries) break;
    const topic = data[key];
    if (!topic || typeof topic !== 'object') continue;

    if (Array.isArray(topic.data)) {
      for (const entry of topic.data.slice(0, 8)) {
        if (lines.length >= maxEntries) break;
        if (entry.metric && entry.value != null) {
          lines.push(`  - ${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || key}, ${entry.year || ''})`);
        }
      }
      continue;
    }

    if (!Array.isArray(topic)) {
      for (const [subKey, subVal] of Object.entries(topic)) {
        if (lines.length >= maxEntries) break;
        if (subKey.startsWith('_')) continue;

        if (subVal && typeof subVal === 'object' && !Array.isArray(subVal) && 'value' in (subVal as Record<string, unknown>)) {
          const sv = subVal as Record<string, unknown>;
          lines.push(`  - ${key}/${subKey.replace(/_/g, ' ')}: ${sv.value}${sv.unit ? ' ' + sv.unit : ''} (${sv.source || key}, ${sv.year || ''})`);
          continue;
        }

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

export function matchKB(kb: Record<string, unknown>, scenario: string): string {
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

    if ((data as ArchetypeData).archetypes) {
      extracted = extractArchetypeContext(data as ArchetypeData, scenario);
      if (extracted) { context += extracted; extractedCount++; continue; }
    }
    if (key === 'sacred-texts-patterns' || key === 'historical-cycles') {
      extracted = extractSacredContext(data as SectionData, scenario);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    if (key === 'master-funnels') {
      extracted = extractFunnelContext(data as Record<string, FunnelData>, scenario);
      if (extracted) { context += extracted + '\n'; extractedCount++; continue; }
    }
    if ((data as SectionData).sections) {
      extracted = extractSectionEntries(data as SectionData, scenario, 25);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    if (Array.isArray(data)) {
      extracted = extractFromList(data as Record<string, unknown>[], scenario, 15);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
    if (typeof data === 'object' && !Array.isArray(data)) {
      extracted = extractFromNestedDict(data as Record<string, unknown>, scenario, 15);
      if (extracted) { context += `\n--- ${key} ---\n${extracted}\n`; extractedCount++; continue; }
    }
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

export async function getLiveData() {
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

export function detectCountries(scenario: string): string[] {
  const lower = scenario.toLowerCase();
  const found: string[] = [];
  for (const c of COUNTRY_NAMES) {
    if (lower.includes(c)) found.push(c);
  }
  return Array.from(new Set(found.map(c => {
    if (c === 'usa') return 'united states';
    if (c === 'uk') return 'united kingdom';
    if (c === 'dubai' || c === 'uae') return 'united arab emirates';
    return c;
  })));
}

export async function getCountryData(countries: string[]): Promise<string | null> {
  if (countries.length === 0) return null;
  const results: string[] = [];

  for (const country of countries.slice(0, 3)) {
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
export async function getExchangeRates(): Promise<Record<string, number> | null> {
  if (exchangeCache.data && Date.now() - exchangeCache.ts < 3600000) return exchangeCache.data;
  try {
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

  const words = lower.split(/\s+/).filter(w => w.length > 3 && !stopwords.has(w));
  for (const w of words) {
    const isCapitalized = scenario.split(/\s+/).some(orig => orig.toLowerCase() === w && /^[A-Z]/.test(orig));
    candidates.push({ term: w, score: isCapitalized ? 3 : 1 });
  }

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

export async function getWikipediaContext(scenario: string): Promise<string | null> {
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
export async function getLaborData(): Promise<string | null> {
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

export async function getCryptoData(scenario: string): Promise<string | null> {
  const lower = scenario.toLowerCase();
  if (!CRYPTO_TERMS.some(t => lower.includes(t))) return null;

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

function detectCities(scenario: string): string[] {
  const lower = scenario.toLowerCase();
  const found: string[] = [];
  const sortedCities = Object.keys(CITY_SLUGS).sort((a, b) => b.length - a.length);
  for (const city of sortedCities) {
    if (lower.includes(city) && found.length < 2) {
      const slug = CITY_SLUGS[city];
      if (!found.some(f => CITY_SLUGS[f] === slug)) {
        found.push(city);
      }
    }
  }
  return found;
}

export async function getCityData(scenario: string): Promise<string | null> {
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

// ============ RAG SEARCH ============
export async function fetchRAGContext(enrichedScenario: string): Promise<{ kbContext: string | null; dataSource: 'rag' | 'keyword' }> {
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
  return { kbContext, dataSource };
}

// ============ WEB SEARCH (Tavily) ============
// Fetches fresh statistics from the web for the given scenario
// Requires TAVILY_API_KEY in .env.local (free: 1000 searches/month at tavily.com)
export async function fetchWebSearch(scenario: string): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return '';

  try {
    // Extract key topics for search
    const searchQuery = `${scenario} statistics data 2025 2026 success rate failure rate`;

    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query: searchQuery,
        search_depth: 'basic',
        max_results: 5,
        include_answer: true,
        include_raw_content: false,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[WEB SEARCH] Tavily returned ${res.status}`);
      return '';
    }

    const data = await res.json();
    const parts: string[] = [];

    // Include Tavily's AI-generated answer summary
    if (data.answer) {
      parts.push(`SUMMARY: ${data.answer}`);
    }

    // Include top results with titles, URLs, and content snippets
    if (data.results && Array.isArray(data.results)) {
      for (const r of data.results.slice(0, 5)) {
        const snippet = (r.content || '').slice(0, 300);
        if (snippet) {
          parts.push(`[${r.title}] (${r.url})\n${snippet}`);
        }
      }
    }

    const result = parts.join('\n\n');
    if (result) {
      console.log(`[WEB SEARCH] Found ${data.results?.length || 0} results, ${result.length} chars`);
    }
    return result;
  } catch (err) {
    console.warn('[WEB SEARCH] Failed:', (err as Error).message);
    return '';
  }
}

// ============ FETCH ALL LIVE DATA ============
export async function fetchAllLiveData(scenario: string, detectedCountries: string[], enableWebSearch = true) {
  const [live, countryData, exchangeRates, laborData, wikiContext, cryptoData, cityData, webSearch] = await Promise.all([
    getLiveData(),
    getCountryData(detectedCountries),
    getExchangeRates(),
    getLaborData(),
    getWikipediaContext(scenario),
    getCryptoData(scenario),
    getCityData(scenario),
    enableWebSearch ? fetchWebSearch(scenario) : Promise.resolve(''),
  ]);
  return { live, countryData, exchangeRates, laborData, wikiContext, cryptoData, cityData, webSearch };
}

// ============ CURRENCY MAP (for exchange rate formatting) ============
export const CURRENCY_MAP: Record<string, string> = {
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
