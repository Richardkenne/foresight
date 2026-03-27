import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';

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

// ============ KEYWORD MAP ============
const KEYWORDS: Record<string, string[]> = {
  'master-funnels': ['startup', 'business', 'cafe', 'saas', 'freelance', 'creator', 'ecommerce', 'invest', 'impresa', 'attività', 'azienda', 'negozio', 'aprire'],
  'education-stats': ['education', 'university', 'college', 'degree', 'bootcamp', 'mba', 'phd', 'learn', 'course', 'università', 'laurea', 'studio', 'studiare', 'corso', 'scuola'],
  'health-fitness': ['health', 'fitness', 'gym', 'weight', 'diet', 'exercise', 'sleep', 'meditation', 'palestra', 'dieta', 'peso', 'dimagrire', 'salute', 'dormire'],
  'relationships': ['relationship', 'marriage', 'divorce', 'dating', 'friend', 'love', 'partner', 'relazione', 'matrimonio', 'divorzio', 'sposare', 'fidanzat', 'amore'],
  'personal-finance-data': ['money', 'finance', 'saving', 'credit', 'wealth', 'budget', 'soldi', 'risparmi', 'ricco', 'guadagn', 'debito', 'finanz'],
  'marketing-growth-data': ['marketing', 'seo', 'ads', 'content', 'email', 'social media', 'growth', 'pubblicità', 'crescita', 'clienti', 'vendere', 'vendita'],
  'tech-adoption-data-points': ['tech', 'ai', 'software', 'cloud', 'cyber', 'blockchain', 'digital', 'tecnologia', 'intelligenza artificiale', 'digitale'],
  'immigration-relocation-research': ['immigrat', 'visa', 'expat', 'move', 'relocat', 'country', 'abroad', 'cittadin', 'emigr', 'trasferir', 'estero', 'visto', 'permesso'],
  'cafe-restaurant-business': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'warung', 'barista', 'ristorante', 'caffè', 'cucina', 'pizzeria', 'locale'],
  'career-employment': ['job', 'career', 'salary', 'hire', 'resume', 'interview', 'layoff', 'freelance', 'lavoro', 'carriera', 'stipendio', 'assunz', 'colloquio', 'licenzia'],
  'crypto-trading-investing': ['crypto', 'bitcoin', 'trading', 'stock', 'forex', 'invest', 'etf', 'criptovalut', 'azioni', 'borsa', 'investir'],
  'mental-health-psychology': ['mental', 'depress', 'anxiety', 'therapy', 'burnout', 'stress', 'depressione', 'ansia', 'terapia', 'psicologo'],
  'side-hustle-entrepreneurship': ['side hustle', 'dropship', 'etsy', 'youtube', 'newsletter', 'lavoretto', 'secondo lavoro', 'extra'],
  'dreams-ambition-failure': ['dream', 'ambition', 'fail', 'goal', 'impostor', 'perfect', 'motivat', 'sogno', 'ambizione', 'fallire', 'obiettivo', 'motivazione'],
  'addiction-substance-use': ['addict', 'drug', 'alcohol', 'smoking', 'porn', 'cannabis', 'dipendenz', 'droga', 'alcol', 'fumare', 'sigarett'],
  'family-dynamics': ['family', 'parent', 'child', 'marriage', 'divorce', 'elder', 'famiglia', 'genitori', 'figli', 'figlio'],
  'real-estate-housing': ['house', 'rent', 'mortgage', 'property', 'real estate', 'apartment', 'casa', 'affitto', 'mutuo', 'immobil', 'appartamento', 'comprare casa'],
  'business-archetypes-1': ['guru', 'course', 'youtube', 'agency', 'smma', 'dropship', 'creator', 'agenzia'],
  'business-archetypes-2': ['saas', 'software', 'app', 'local business', 'restaurant', 'cafe', 'applicazione'],
  'business-archetypes-3': ['real estate', 'property', 'coaching', 'consult', 'crypto', 'marketplace', 'consulenz'],
  'failure-forensics': ['fail', 'failure', 'why', 'reason', 'mistake', 'shut down', 'bankrupt', 'falliment', 'perché', 'errore', 'chiudere'],
  'pricing-psychology': ['pricing', 'price', 'anchor', 'freemium', 'discount', 'subscription', 'prezzo', 'sconto', 'abbonamento'],
  'sacred-texts-patterns': ['human nature', 'temptation', 'greed', 'pride', 'fear', 'faith', 'tentazione', 'avidità', 'paura', 'fede'],
  'historical-cycles': ['bubble', 'crash', 'cycle', 'repeat', 'history', 'empire', 'mania', 'bolla', 'crisi', 'ciclo', 'storia'],
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
  for (const { key } of top) {
    const data = kb[key];
    if (!data) continue;
    if (typeof data === 'string') { context += `\n--- ${key} ---\n${data}\n`; continue; }
    if ((data as ArchetypeData).archetypes) {
      const archCtx = extractArchetypeContext(data as ArchetypeData, scenario);
      if (archCtx) { context += archCtx; continue; }
    }
    if (key === 'sacred-texts-patterns' || key === 'historical-cycles') {
      const sacredCtx = extractSacredContext(data as SectionData, scenario);
      if (sacredCtx) { context += `\n--- ${key} ---\n${sacredCtx}\n`; continue; }
    }
    if (key === 'master-funnels') {
      const funnelCtx = extractFunnelContext(data as Record<string, FunnelData>, scenario);
      if (funnelCtx) { context += funnelCtx + '\n'; continue; }
    }
    if ((data as SectionData).sections) {
      const entries = extractSectionEntries(data as SectionData, scenario, 25);
      if (entries) { context += `\n--- ${key} ---\n${entries}\n`; continue; }
    }
    context += `\n--- ${key} ---\n${JSON.stringify(data).substring(0, 2000)}\n`;
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

// ============ CLAUDE API ============
function callClaude(systemPrompt: string, userMsg: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 3000,
    system: systemPrompt,
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
          resolve(JSON.parse(content));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ GROQ FALLBACK ============
function callGroq(systemPrompt: string, userMsg: string): Promise<unknown> {
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }],
    temperature: 0.7, max_tokens: 3000,
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

// ============ HANDLER ============
export async function POST(request: NextRequest) {
  try {
    const { scenario } = await request.json();
    if (!scenario) return NextResponse.json({ error: 'Missing scenario' }, { status: 400 });

    const kb = loadKB();
    const kbContext = matchKB(kb, scenario);
    const detectedCountries = detectCountries(scenario);

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

    const systemPrompt = `You are a life/business scenario simulator. Generate a realistic flowchart with nodes and edges.

CRITICAL RULES:
1. DATA INTEGRITY: If you have a real stat with a real source, use it. If you DON'T have a verified source, write "Estimated" as source. NEVER invent fake source names.
2. COMPLETE COVERAGE: The flow must cover the ENTIRE scenario from start to end. If the user says "move abroad and learn a language", cover BOTH — immigration steps AND language learning journey. Never stop halfway.
3. EVERY STEP NEEDS A FAIL PATH: Every bottleneck/decision MUST have a fail/no edge leading to an outcome-bad node. This is non-negotiable. Real life has failure at every step.
4. If an ARCHETYPE is provided, use its stages as the SKELETON with EXACT probabilities.
5. If section data points are provided, use those specific numbers and CITE the source.

STRUCTURE: Return ONLY valid JSON. 10-14 nodes. Include success AND failure paths.
Node types: start, desire, action, bottleneck, decision, outcome-good, outcome-bad, loop.
Edges: pass/fail for bottleneck, yes/no for decision. Every bottleneck/decision MUST have both a pass/yes AND a fail/no edge.
Position: x increases by ~260, failures below (y+200). Min 260px horizontal spacing.
JSON format: {"title":"...","nodes":[{"id":1,"type":"desire","label":"...","x":0,"y":120,"prob":100,"desc":"Real stat","source":"Source Year or Estimated","time":"30-90 days"}],"edges":[{"from":1,"to":2,"label":""}]}
prob = conditional % of PASSING. Only bottleneck/decision need realistic prob (<100). Others = 100.
desc MUST include a specific number/stat, not generic text.${liveStr}`;

    const userMsg = `Scenario: "${scenario}"\n\nUSE THESE DATA POINTS:\n${kbContext || 'Use Tier S/A sources.'}\n\nReturn ONLY JSON.`;

    let flow: Record<string, unknown>;
    try {
      flow = await callClaude(systemPrompt, userMsg) as Record<string, unknown>;
      flow._provider = 'claude';
    } catch {
      flow = await callGroq(systemPrompt, userMsg) as Record<string, unknown>;
      flow._provider = 'groq';
    }
    flow._live_data = !!(live?.gdp || countryData || exchangeRates || laborData || cryptoData || cityData);

    return NextResponse.json(flow);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
