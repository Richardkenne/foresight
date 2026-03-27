const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) process.env[key.trim()] = val.join('=').trim();
  });
}

const GROQ_KEY = process.env.GROQ_API_KEY;
const PORT = 3456;

// ============ KNOWLEDGE BASE LOADER ============
function loadKnowledgeBase() {
  const dataDir = path.join(__dirname, 'data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f !== 'source-authority.json' && f !== 'api-databases.json');
  const kb = {};

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      const data = JSON.parse(content);
      kb[file.replace('.json', '')] = data;
    } catch (e) { /* skip non-JSON */ }
  }

  // Also extract key stats from MD files (first 100 lines of each)
  const mdFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'api-databases.md');
  for (const file of mdFiles) {
    try {
      const lines = fs.readFileSync(path.join(dataDir, file), 'utf8').split('\n').slice(0, 150);
      // Extract lines with numbers/percentages
      const stats = lines.filter(l => /\d+%|\$[\d,.]+|[\d,.]+\s*(billion|million|trillion)/i.test(l)).slice(0, 30);
      if (stats.length > 0) kb[file.replace('.md', '')] = stats.join('\n');
    } catch (e) { /* skip */ }
  }

  return kb;
}

let knowledgeBase = {};
try {
  knowledgeBase = loadKnowledgeBase();
  console.log(`Knowledge base loaded: ${Object.keys(knowledgeBase).length} datasets`);
} catch (e) { console.error('KB load error:', e.message); }

// ============ KEYWORD MAP ============
const KEYWORDS = {
  'master-funnels': ['startup','business','cafe','saas','freelance','creator','ecommerce','invest'],
  'education-stats': ['education','university','college','degree','bootcamp','mba','phd','learn','course','certification'],
  'health-fitness': ['health','fitness','gym','weight','diet','exercise','sleep','meditation'],
  'relationships': ['relationship','marriage','divorce','dating','friend','love','partner'],
  'personal-finance-data': ['money','finance','saving','credit','wealth','budget'],
  'marketing-growth-data': ['marketing','seo','ads','content','email','social media','growth','brand','viral'],
  'tech-adoption-data-points': ['tech','ai','software','cloud','cyber','blockchain','digital'],
  'immigration-relocation-research': ['immigrat','visa','expat','move','relocat','country','abroad','indonesia','australia'],
  'productivity-human-performance-data': ['productiv','skill','remote','focus','habit','time'],
  'nonprofit-social-impact': ['nonprofit','charity','donat','volunteer','social','community','fundrais'],
  'legal-datapoints': ['legal','patent','trademark','lawsuit','contract','compliance','regulation'],
  'twitter-x-behavior-data': ['twitter','tweet','x.com','bookmark','scroll','lurk'],
  'consumption-action-gap-research': ['scroll','bookmark','save','procrastinat','abandon','never','forget','unused'],
  'prediction-markets-trading': ['polymarket','kalshi','predict','options','robinhood'],
  'addiction-substance-use': ['addict','drug','alcohol','smoking','porn','cannabis','opioid','vaping'],
  'cafe-restaurant-business': ['cafe','coffee','restaurant','food','bar','warung','barista','menu','kitchen','cook','chef'],
  'career-employment': ['job','career','salary','hire','resume','interview','layoff','unemploy','freelance','remote work','promotion'],
  'family-dynamics': ['family','parent','child','marriage','divorce','elder','aging','household','sibling','wedding','baby'],
  'real-estate-housing': ['house','rent','mortgage','property','real estate','apartment','buy home','landlord','tenant','kos'],
  'crypto-trading-investing': ['crypto','bitcoin','trading','stock','forex','invest','etf','portfolio','day trad','defi','nft'],
  'mental-health-psychology': ['mental','depress','anxiety','therapy','burnout','stress','suicide','loneli','psycholog','counsel'],
  'side-hustle-entrepreneurship': ['side hustle','dropship','etsy','youtube','newsletter','online course','gig','uber','amazon fba','shopify'],
  'debt-bankruptcy-financial-crisis': ['debt','bankrupt','foreclos','credit card','student loan','payday','poverty','default','collect'],
  'aging-retirement-life-stages': ['retire','pension','401k','elder','aging','midlife','social security','nursing home','senior'],
  'life-transitions-decisions': ['move','relocate','start over','gap year','drop out','run away','promise','second chance','risk','america','vita','sparisce','parte','smette','trasferisce','promette'],
  'trust-secrets-betrayal': ['secret','cheat','betray','lie','fraud','scam','trust','infidelity','hidden','whistle','nasconde','senza dirlo','famiglia','segreto'],
  'crisis-survival-resilience': ['crisis','disaster','war','pandemic','homeless','grief','trauma','emergency','survivor','comeback'],
  'social-dynamics-influence': ['peer pressure','status','reputation','network','persuad','mob','social mobil','culture shock','generation','tribe'],
  'dreams-ambition-failure': ['dream','ambition','fail','goal','impostor','perfect','procrastinat','motivat','success','give up'],
  'business-archetypes-1': ['guru','course','youtube','liam','iman','agency','smma','ai agency','dropship','creator','content','influencer'],
  'business-archetypes-2': ['saas','software','app','local business','restaurant','cafe','shop','partner','cofounder','affiliate','blog','seo','newsletter','media','substack'],
  'business-archetypes-3': ['real estate','property','rent','mortgage','coaching','consult','crypto','bitcoin','trading','marketplace','platform','import','export','alibaba'],
  'business-archetypes-4': ['franchise','digital product','template','notion','ebook','gumroad','community','skool','circle','membership','gig','uber','delivery','buy business','acquisition','flippa'],
  'business-archetypes-5': ['side hustle','transition','quit job','full time','resell','flip','thrift','tutor','teach','print on demand','merch','family business','inherit','succession'],
  'youtube-guru-funnel-data': ['youtube','guru','funnel','course','video','watch','cta','retention','click','landing page','checkout','upsell','creator economy'],
  'platform-economics': ['upwork','fiverr','etsy','shopify','amazon fba','gumroad','substack','beehiiv','skool','circle','seller','merchant','platform'],
  'ad-channels-conversion': ['facebook ads','google ads','tiktok ads','youtube ads','linkedin ads','cpc','cpm','roas','ctr','conversion','ads','advertising','ppc','email marketing'],
  'post-purchase-retention': ['retention','churn','engagement','completion','refund','onboarding','activation','loyalty','subscription','cancel'],
  'country-specific-business': ['indonesia','usa','italy','australia','bandung','jakarta','perth','sydney','melbourne','umkm','partita iva','abn','sba'],
  'psychology-behavioral-business': ['procrastinat','decision fatigue','imposter','motivation','bias','fear','risk','burnout','stress','comparison','perfecti','discipline'],
  'sales-outreach-data': ['cold email','linkedin','cold call','outreach','sales','pipeline','close','proposal','pitch','demo','referral','pricing'],
  'funding-finance-business': ['funding','venture capital','angel','seed','series a','bootstrap','loan','crowdfund','grant','investor','equity','dilution','runway'],
  'failure-forensics': ['fail','failure','why','reason','mistake','death','shut down','bankrupt','pivot','post-mortem','lesson'],
  'pricing-psychology': ['pricing','price','anchor','decoy','freemium','discount','bundle','subscription','charm','willingness to pay','elasticity'],
  'community-engagement-deep': ['discord','skool','circle','slack','community','engagement','lurker','member','gamification','retention','dau','mau'],
  'email-marketing-deep': ['email','newsletter','open rate','click rate','automation','welcome','sequence','deliverability','subject line','mailchimp','klaviyo'],
  'seo-organic-deep': ['seo','organic','ranking','backlink','keyword','serp','google','ai overview','local seo','content','domain authority','page speed'],
  'legal-tax-business-reality': ['llc','tax','legal','partita iva','abn','corp','trademark','patent','compliance','gdpr','permit','license','formation'],
  'burnout-mental-health-entrepreneurs': ['burnout','mental health','depression','anxiety','founder','isolation','loneliness','therapy','sleep','work hours','stress'],
  'scaling-bottlenecks': ['hiring','hire','team','delegation','scale','outsource','automate','sop','operations','first hire','org chart','va','contractor'],
  'market-timing-trends': ['trend','saturation','seasonal','hype','cycle','timing','ai market','platform shift','google trends','recession','competition','first mover'],
  'negotiation-closing': ['negotiation','closing','objection','proposal','pitch','demo','deal','contract','win rate','close rate','b2b','b2c'],
  'cac-benchmarks': ['cac','customer acquisition','ltv','lifetime value','payback','cost per','acquisition cost','plg','product led','growth channel'],
  'social-proof-mechanics': ['review','testimonial','ugc','case study','social proof','trust','badge','rating','star','influence','fomo','scarcity'],
  'exit-acquisition-data': ['exit','acquisition','sell business','valuation','multiple','ipo','m&a','broker','flippa','empire flippers','earn out','due diligence'],
  'indonesia-business-deep': ['indonesia','bandung','jakarta','umkm','warung','grab','gojek','tokopedia','shopee','qris','rupiah','kopi','cafe indonesia'],
  'time-to-result-benchmarks': ['how long','time to','first dollar','first client','first sale','timeline','months','weeks','realistic','fast','slow'],
  'ai-tools-impact-2025': ['ai tool','chatgpt','claude','copilot','cursor','midjourney','ai replace','ai productivity','ai marketing','ai coding','ai agent','automation ai'],
  'sacred-texts-patterns': ['human nature','temptation','greed','pride','fear','envy','sloth','patience','forbidden','sin','shortcut','compare','deceive','steward','counsel','bible','quran','faith','trust','disobey','hubris'],
  'historical-cycles': ['bubble','crash','cycle','repeat','history','empire','gold rush','mania','panic','ponzi','fraud','innovation','resistance','wave','boom','bust','crisis'],
};

// ============ SMART CONTEXT BUILDER ============
// Instead of truncating entire JSON files, extract ONLY the relevant entries

function extractArchetypeContext(data, scenario) {
  // For archetype files: find the best matching archetype and return its full stages
  if (!data.archetypes) return null;
  const lower = scenario.toLowerCase();
  let bestKey = null, bestScore = 0;

  for (const [key, arch] of Object.entries(data.archetypes)) {
    // Score by matching archetype key, name, description, entry_point against scenario
    const text = `${key.replace(/_/g, ' ')} ${arch.name} ${arch.description} ${arch.entry_point}`.toLowerCase();
    const words = lower.split(/\s+/);
    // Allow short words (ai, seo, app) but give bonus to longer matches
    let score = 0;
    for (const w of words) {
      if (w.length < 2) continue;
      if (text.includes(w)) score += (w.length > 3 ? 2 : 1);
    }
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }

  if (bestKey && bestScore >= 2) {
    const arch = data.archetypes[bestKey];
    return `\nARCHETYPE MATCH: "${arch.name}"
Description: ${arch.description}
FULL MICRO-STEP FUNNEL (USE THESE EXACT PROBABILITIES):
${arch.stages.map((s, i) => `  ${i+1}. [${s.id}] ${s.label} — prob: ${s.prob}%, time: ${s.time}, source: ${s.source}`).join('\n')}
Bottlenecks: ${(arch.bottlenecks || []).join(', ')}
End-to-end conversion: ${arch.cumulative_end_to_end || arch.end_to_end_conversion || 'see stages'}
${arch.reality_check ? 'Reality check: ' + arch.reality_check : ''}
`;
  }
  return null;
}

function extractSectionEntries(data, scenario, maxEntries) {
  // For section-based files: score each entry's metric against scenario words, return top N
  if (!data.sections) return null;
  const lower = scenario.toLowerCase();
  const scenarioWords = lower.split(/\s+/).filter(w => w.length > 3);

  // First: score sections by name match
  const sectionScores = [];
  for (const [secName, entries] of Object.entries(data.sections)) {
    if (!Array.isArray(entries)) continue;
    const secWords = secName.replace(/_/g, ' ').toLowerCase();
    const secScore = scenarioWords.filter(w => secWords.includes(w)).length;
    sectionScores.push({ name: secName, entries, score: secScore });
  }
  sectionScores.sort((a, b) => b.score - a.score);

  // Take top 3 sections, then within each, score individual entries
  const topSections = sectionScores.slice(0, 3);
  const scored = [];

  for (const sec of topSections) {
    for (const entry of sec.entries) {
      const metricLower = (entry.metric || '').toLowerCase();
      const entryScore = sec.score + scenarioWords.filter(w => metricLower.includes(w)).length;
      if (entryScore > 0) scored.push({ ...entry, _score: entryScore, _section: sec.name });
    }
  }

  // Also scan ALL sections for high-relevance individual entries (score >= 2)
  for (const sec of sectionScores.slice(3)) {
    for (const entry of sec.entries) {
      const metricLower = (entry.metric || '').toLowerCase();
      const entryScore = scenarioWords.filter(w => metricLower.includes(w)).length;
      if (entryScore >= 2) scored.push({ ...entry, _score: entryScore + 1, _section: sec.name });
    }
  }

  scored.sort((a, b) => b._score - a._score);
  const top = scored.slice(0, maxEntries);

  if (top.length === 0) return null;

  return top.map(e => `  • ${e.metric}: ${e.value}${e.unit ? ' ' + e.unit : ''} (${e.source}, ${e.year})`).join('\n');
}

function extractFunnelContext(data, scenario) {
  // For master-funnels.json: find matching funnel and return stages
  const lower = scenario.toLowerCase();
  let results = [];

  for (const [key, funnel] of Object.entries(data)) {
    if (key === '_meta' || key === 'business_archetypes') continue;
    if (!funnel.stages) continue;
    const funnelWords = key.replace(/_/g, ' ').toLowerCase();
    const score = lower.split(/\s+/).filter(w => w.length > 3 && funnelWords.includes(w)).length;
    if (score > 0) {
      results.push({ key, stages: funnel.stages, score, extra: funnel });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const best = results[0];
  if (!best) return null;

  let ctx = `\nFUNNEL: ${best.key}\n`;
  ctx += best.stages.map((s, i) => `  ${i+1}. ${s.label}: ${s.prob}% (${s.source})`).join('\n');

  // Add extra data (survival_by_year, failure_reasons, etc.)
  for (const [k, v] of Object.entries(best.extra)) {
    if (k === 'stages') continue;
    if (typeof v === 'object') ctx += `\n  ${k}: ${JSON.stringify(v)}`;
  }

  return ctx;
}

function extractSacredContext(data, scenario) {
  // For sacred-texts-patterns: find entries whose modern_equivalent or business_application matches scenario
  if (!data.sections) return null;
  const lower = scenario.toLowerCase();
  const scenarioWords = lower.split(/\s+/).filter(w => w.length > 3);
  const scored = [];

  for (const [secName, entries] of Object.entries(data.sections)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const searchText = `${entry.pattern || ''} ${entry.modern_equivalent || ''} ${entry.business_application || ''} ${entry.cycle_name || ''} ${entry.what_happened || ''}`.toLowerCase();
      const score = scenarioWords.filter(w => searchText.includes(w)).length;
      if (score >= 2) scored.push({ ...entry, _score: score, _section: secName });
    }
  }

  scored.sort((a, b) => b._score - a._score);
  const top = scored.slice(0, 8);
  if (top.length === 0) return null;

  return top.map(e => {
    if (e.sacred_source_bible) {
      // Sacred text pattern
      return `  📖 Pattern: "${e.pattern}"
    Bible: ${e.sacred_source_bible} — "${e.sacred_text_bible || ''}"
    Quran: ${e.sacred_source_quran || 'N/A'} — "${e.sacred_text_quran || ''}"
    Modern: ${e.modern_equivalent || ''}
    Data: ${e.data_confirmation || ''} (${e.data_source || ''})
    Business: ${e.business_application || ''}`;
    } else {
      // Historical cycle
      return `  📜 ${e.cycle_name || e.pattern} (${e.year || ''})
    What: ${e.what_happened || ''}
    Pattern: ${e.human_nature_at_play || ''}
    Modern parallel: ${e.modern_parallel || ''}
    Data: ${e.modern_data || ''} (${e.data_source || ''})`;
    }
  }).join('\n\n');
}

function buildKBContext(scenario) {
  const lower = scenario.toLowerCase();
  const relevant = [];

  for (const [key, words] of Object.entries(KEYWORDS)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > 0) relevant.push({ key, score });
  }

  if (!relevant.find(r => r.key === 'master-funnels')) {
    relevant.push({ key: 'master-funnels', score: 0.5 });
  }

  relevant.sort((a, b) => b.score - a.score);
  const top = relevant.slice(0, 8); // Check more datasets

  let context = '';
  let archetypeFound = false;

  for (const { key } of top) {
    const data = knowledgeBase[key];
    if (!data) continue;

    if (typeof data === 'string') {
      context += `\n--- ${key} ---\n${data}\n`;
      continue;
    }

    // Smart extraction based on data structure
    // 1. Archetype files → extract matching archetype with full stages
    if (data.archetypes) {
      const archCtx = extractArchetypeContext(data, scenario);
      if (archCtx) { context += archCtx; archetypeFound = true; continue; }
    }

    // 2. Master funnels → extract matching funnel
    if (key === 'master-funnels') {
      const funnelCtx = extractFunnelContext(data, scenario);
      if (funnelCtx) { context += funnelCtx + '\n'; continue; }
    }

    // 2b. Sacred texts and historical cycles → special extraction
    if (key === 'sacred-texts-patterns' || key === 'historical-cycles') {
      const sacredCtx = extractSacredContext(data, scenario);
      if (sacredCtx) { context += `\n--- ${key} (human nature patterns) ---\n${sacredCtx}\n`; continue; }
    }

    // 3. Section-based files → extract top relevant entries (not first 3KB!)
    if (data.sections) {
      const entries = extractSectionEntries(data, scenario, 25);
      if (entries) { context += `\n--- ${key} (top matches) ---\n${entries}\n`; continue; }
    }

    // 4. Fallback: compact stringify with limit (for unusual structures)
    const str = JSON.stringify(data, null, 0);
    context += `\n--- ${key} ---\n${str.substring(0, 2000)}\n`;
  }

  // Always try to include time-to-result data if scenario is business-related
  const bizWords = ['business','start','launch','build','earn','money','income','revenue','profit','sell','client','customer'];
  if (bizWords.some(w => lower.includes(w)) && !relevant.find(r => r.key === 'time-to-result-benchmarks')) {
    const ttr = knowledgeBase['time-to-result-benchmarks'];
    if (ttr && ttr.sections) {
      const entries = extractSectionEntries(ttr, scenario, 10);
      if (entries) context += `\n--- time-to-result (auto-included) ---\n${entries}\n`;
    }
  }

  // Tag whether we found an archetype
  if (archetypeFound) {
    context = `[ARCHETYPE AVAILABLE — base your simulation on the archetype stages below, using the exact probabilities provided]\n` + context;
  }

  return context.substring(0, 16000); // Increased limit for smart-extracted data
}

// ============ LIVE DATA CACHE ============
let liveDataCache = { data: null, timestamp: 0 };
const CACHE_TTL = 3600000; // 1 hour

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Simulator/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.substring(0, 100))); }
      });
    }).on('error', reject);
  });
}

async function fetchLiveData() {
  if (liveDataCache.data && Date.now() - liveDataCache.timestamp < CACHE_TTL) {
    return liveDataCache.data;
  }

  console.log('Fetching live data from World Bank + FRED...');
  const results = {};

  try {
    // World Bank — GDP per capita (latest, top countries + Indonesia)
    const gdp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN;NG/indicator/NY.GDP.PCAP.CD?format=json&date=2023&per_page=20');
    if (gdp && gdp[1]) {
      results.gdp_per_capita = {};
      gdp[1].forEach(d => { if (d.value) results.gdp_per_capita[d.country.id] = { country: d.country.value, value: Math.round(d.value), year: d.date }; });
    }

    // World Bank — Gini index
    const gini = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;BR;IN;CN;ZA/indicator/SI.POV.GINI?format=json&date=2018:2023&per_page=50');
    if (gini && gini[1]) {
      results.gini_index = {};
      gini[1].forEach(d => {
        if (d.value && !results.gini_index[d.country.id]) results.gini_index[d.country.id] = { country: d.country.value, value: d.value, year: d.date };
      });
    }

    // World Bank — Life expectancy
    const life = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN;NG/indicator/SP.DYN.LE00.IN?format=json&date=2022&per_page=20');
    if (life && life[1]) {
      results.life_expectancy = {};
      life[1].forEach(d => { if (d.value) results.life_expectancy[d.country.id] = { country: d.country.value, value: Math.round(d.value * 10) / 10, year: d.date }; });
    }

    // World Bank — Unemployment rate
    const unemp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN/indicator/SL.UEM.TOTL.ZS?format=json&date=2023&per_page=20');
    if (unemp && unemp[1]) {
      results.unemployment = {};
      unemp[1].forEach(d => { if (d.value) results.unemployment[d.country.id] = { country: d.country.value, value: Math.round(d.value * 10) / 10, year: d.date }; });
    }

    // World Bank — Poverty ratio ($2.15/day)
    const poverty = await fetchJSON('https://api.worldbank.org/v2/country/ID;IN;BR;NG;CN;ZA/indicator/SI.POV.DDAY?format=json&date=2018:2023&per_page=50');
    if (poverty && poverty[1]) {
      results.poverty_rate = {};
      poverty[1].forEach(d => {
        if (d.value && !results.poverty_rate[d.country.id]) results.poverty_rate[d.country.id] = { country: d.country.value, value: Math.round(d.value * 10) / 10, year: d.date };
      });
    }

    // World Bank — Internet users %
    const internet = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;IN;NG;BR/indicator/IT.NET.USER.ZS?format=json&date=2022&per_page=20');
    if (internet && internet[1]) {
      results.internet_users_pct = {};
      internet[1].forEach(d => { if (d.value) results.internet_users_pct[d.country.id] = { country: d.country.value, value: Math.round(d.value * 10) / 10, year: d.date }; });
    }

    // World Bank — Ease of doing business (new methodology)
    const biz = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;SG;JP/indicator/IC.BUS.EASE.XQ?format=json&date=2019&per_page=20');
    if (biz && biz[1]) {
      results.ease_of_business = {};
      biz[1].forEach(d => { if (d.value) results.ease_of_business[d.country.id] = { country: d.country.value, score: Math.round(d.value * 10) / 10, year: d.date }; });
    }

    // World Bank — Inflation
    const inflation = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;BR;IN;CN/indicator/FP.CPI.TOTL.ZG?format=json&date=2023&per_page=20');
    if (inflation && inflation[1]) {
      results.inflation = {};
      inflation[1].forEach(d => { if (d.value) results.inflation[d.country.id] = { country: d.country.value, value: Math.round(d.value * 10) / 10, year: d.date }; });
    }

    results._fetched = new Date().toISOString();
    results._source = 'World Bank Open Data API (live)';
    results._indicators = Object.keys(results).filter(k => !k.startsWith('_')).length;

    liveDataCache = { data: results, timestamp: Date.now() };
    console.log(`Live data cached: ${results._indicators} indicators, ${Object.keys(results.gdp_per_capita || {}).length} countries`);

  } catch (e) {
    console.error('Live data fetch error:', e.message);
    // Return whatever we got
    if (Object.keys(results).length > 0) {
      liveDataCache = { data: results, timestamp: Date.now() };
    }
  }

  return results;
}

// ============ SYSTEM PROMPT WITH LIVE DATA ============
function buildSystemPrompt(liveData) {
  let liveContext = '';
  if (liveData && liveData.gdp_per_capita) {
    liveContext = `\n\nLIVE WORLD DATA (use these real numbers when relevant to the scenario):
GDP per capita: ${Object.entries(liveData.gdp_per_capita).map(([k,v]) => `${v.country}: $${v.value.toLocaleString()}`).join(', ')}
Unemployment: ${Object.entries(liveData.unemployment || {}).map(([k,v]) => `${v.country}: ${v.value}%`).join(', ')}
Life expectancy: ${Object.entries(liveData.life_expectancy || {}).map(([k,v]) => `${v.country}: ${v.value}yr`).join(', ')}
Inflation: ${Object.entries(liveData.inflation || {}).map(([k,v]) => `${v.country}: ${v.value}%`).join(', ')}
Internet users: ${Object.entries(liveData.internet_users_pct || {}).map(([k,v]) => `${v.country}: ${v.value}%`).join(', ')}
Poverty (<$2.15/day): ${Object.entries(liveData.poverty_rate || {}).map(([k,v]) => `${v.country}: ${v.value}%`).join(', ')}
Data source: World Bank ${liveData._fetched}`;
  }

  return `You are a life/business scenario simulator engine. Given a user's scenario description, generate a realistic flowchart with nodes and edges representing what actually happens in real life.

CRITICAL — DATA-DRIVEN GENERATION:
You will receive REAL DATA from our knowledge base (23,000+ verified data points). You MUST:
1. If an ARCHETYPE is provided (marked [ARCHETYPE AVAILABLE]), use its stages as the SKELETON of your flowchart. Map archetype stages to nodes. Use the EXACT probabilities from the archetype — do NOT invent different numbers.
2. If section data points are provided (marked "top matches"), use those specific numbers for your prob values and desc fields. CITE the source provided.
3. NEVER invent a probability when real data is provided. If the data says "15% complete course" and you need a course completion node, use prob: 15.
4. If no data is available for a specific step, you may estimate — but mark the source as "estimated" and keep it conservative.
5. If SACRED TEXT PATTERNS are provided, mention the timeless nature of the pattern in the desc field of the most critical bottleneck node. Example: "84% experience imposter syndrome — a fear pattern described in Matthew 25:14-30 (Parable of Talents) and confirmed across 3,000 years of history"
6. If HISTORICAL CYCLES are provided, reference them to show the pattern repeats. Example: "90% fail in 120 days — same pattern as every gold rush since 1849"

RULES:
- Return ONLY valid JSON, no markdown, no explanation
- Use REAL statistics from the data provided. Fall back to known sources (CB Insights, BLS, McKinsey) only when KB data is missing.
- Every bottleneck/decision node MUST have a realistic "prob" (pass-through percentage, CONDITIONAL on reaching that node)
- Include 8-18 nodes per scenario (use more nodes for complex business scenarios with archetype data)
- Include both success and failure paths
- Node types: "start", "desire", "action", "bottleneck", "decision", "outcome-good", "outcome-bad", "loop"
- Edges with label "pass"/"fail" for bottleneck, "yes"/"no" for decision, "" for neutral
- LOOPS: Include at least 1-2 "loop" nodes that connect back to earlier nodes
- MULTIPLE EXITS: Bottleneck/decision nodes can have more than 2 exits
- Position: main path at y=120, x increases by 260. Failures at y=320. Loops at y=0. Min 260px horizontal spacing.
- prob is CONDITIONAL: "of the people who reach this node, what % pass through?" Not absolute probability.

JSON FORMAT:
{
  "title": "Short title",
  "nodes": [
    {"id": 1, "type": "desire", "label": "Short label", "x": 0, "y": 120, "prob": 100, "desc": "One line with REAL stat from KB data", "source": "Source name + year", "time": "30-90 days"}
  ],
  "edges": [
    {"from": 1, "to": 2, "label": ""}
  ]
}

IMPORTANT:
- prob field is the % chance of PASSING THROUGH this node (conditional on reaching it). Only bottleneck and decision nodes need realistic prob values. All other nodes should have prob: 100.
- time field is the realistic time to pass through this node. Use real benchmarks from the data provided.
- Loop nodes MUST have edges going back to earlier nodes to create retry cycles.
- desc MUST include a specific number/stat from the knowledge base data, not a generic description.${liveContext}`;
}

// ============ GROQ CALL ============
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

async function callClaude(userPrompt, liveData, kbContext) {
  const systemPrompt = buildSystemPrompt(liveData);
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: systemPrompt,
    messages: [
      { role: 'user', content: `Generate a realistic simulation flowchart for this scenario: "${userPrompt}"

USE THESE REAL DATA POINTS for probabilities (from our verified knowledge base):
${kbContext || 'No specific data available — use your best knowledge from Tier S/A sources.'}

Return ONLY a valid JSON object, no markdown.` }
    ]
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          let content = json.content[0].text;
          // Strip markdown if present
          content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error('Failed to parse Claude response: ' + data.substring(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callOpenAI(userPrompt, liveData, kbContext) {
  const systemPrompt = buildSystemPrompt(liveData);
  const body = JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a realistic simulation flowchart for this scenario: "${userPrompt}"

USE THESE REAL DATA POINTS for probabilities (from our verified knowledge base):
${kbContext || 'No specific data available — use your best knowledge from Tier S/A sources.'}

Return ONLY the JSON object.` }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const content = json.choices[0].message.content;
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error('Failed to parse OpenAI response: ' + data.substring(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function callGroq(userPrompt, liveData, kbContext) {
  const systemPrompt = buildSystemPrompt(liveData);
  const body = JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate a realistic simulation flowchart for this scenario: "${userPrompt}"

USE THESE REAL DATA POINTS for probabilities (from our verified knowledge base):
${kbContext || 'No specific data available — use your best knowledge from Tier S/A sources.'}

Return ONLY the JSON object.` }
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const content = json.choices[0].message.content;
          resolve(JSON.parse(content));
        } catch (e) {
          reject(new Error('Failed to parse Groq response: ' + data.substring(0, 200)));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ============ SERVER ============
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // API: Generate flow (with live data)
  if (req.method === 'POST' && req.url === '/api/generate') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { scenario } = JSON.parse(body);
        if (!scenario) { res.writeHead(400); res.end(JSON.stringify({ error: 'Missing scenario' })); return; }
        console.log(`Generating: "${scenario}"`);
        const liveData = await fetchLiveData();
        const kbContext = buildKBContext(scenario);
        console.log(`  KB context: ${kbContext.length} chars from data/`);
        // Primary: Claude Haiku (best accuracy 9.2/10)
        // Fallback: Groq (fastest, 2.4s)
        let flow;
        try {
          flow = await callClaude(scenario, liveData, kbContext);
          flow._provider = 'claude-haiku-4.5';
        } catch (e) {
          console.log(`  Claude failed (${e.message}), falling back to Groq`);
          flow = await callGroq(scenario, liveData, kbContext);
          flow._provider = 'groq-llama-3.3';
        }

        // ============ VALIDATION LAYER ============
        // Check AI output probabilities against KB data and fix obvious errors
        if (flow.nodes && Array.isArray(flow.nodes)) {
          const validationLog = [];
          // Build a quick lookup of known probabilities from archetype data
          const knownProbs = {};
          for (let i = 1; i <= 5; i++) {
            const archData = knowledgeBase['business-archetypes-' + i];
            if (!archData || !archData.archetypes) continue;
            for (const [, arch] of Object.entries(archData.archetypes)) {
              for (const s of arch.stages || []) {
                // Index by keywords in label
                const words = s.label.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                for (const w of words) {
                  if (!knownProbs[w]) knownProbs[w] = [];
                  knownProbs[w].push({ prob: s.prob, label: s.label, source: s.source });
                }
              }
            }
          }
          // Also index master-funnels
          const mf = knowledgeBase['master-funnels'];
          if (mf) {
            for (const [, funnel] of Object.entries(mf)) {
              for (const s of funnel.stages || []) {
                const words = (s.label || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
                for (const w of words) {
                  if (!knownProbs[w]) knownProbs[w] = [];
                  knownProbs[w].push({ prob: s.prob, label: s.label, source: s.source });
                }
              }
            }
          }

          for (const node of flow.nodes) {
            if (!node.prob || node.prob === 100) continue;
            // Find matching known probs
            const nodeWords = (node.label || '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
            let bestMatch = null, bestOverlap = 0;
            for (const w of nodeWords) {
              if (knownProbs[w]) {
                for (const kp of knownProbs[w]) {
                  const kpWords = kp.label.toLowerCase().split(/\s+/).filter(w2 => w2.length > 4);
                  const overlap = nodeWords.filter(nw => kpWords.includes(nw)).length;
                  if (overlap > bestOverlap) { bestOverlap = overlap; bestMatch = kp; }
                }
              }
            }
            // If we found a match and the AI's prob is way off (>3x difference), correct it
            if (bestMatch && bestOverlap >= 2) {
              const ratio = node.prob / bestMatch.prob;
              if (ratio > 3 || ratio < 0.33) {
                validationLog.push(`CORRECTED: "${node.label}" ${node.prob}% → ${bestMatch.prob}% (KB: "${bestMatch.label}", ${bestMatch.source})`);
                node.prob = bestMatch.prob;
                node.source = bestMatch.source + ' [validated]';
                node._corrected = true;
              }
            }
          }
          if (validationLog.length > 0) {
            console.log(`  Validation: ${validationLog.length} corrections`);
            validationLog.forEach(l => console.log(`    ${l}`));
            flow._validations = validationLog.length;
          }
        }

        // Tag with live data indicator
        flow._live_data = !!liveData?.gdp_per_capita;
        flow._data_source = liveData?._fetched || 'static';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(flow));
      } catch (e) {
        console.error('Error:', e.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Compare Groq vs OpenAI
  if (req.method === 'POST' && req.url === '/api/compare') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { scenario } = JSON.parse(body);
        const liveData = await fetchLiveData();
        const kbContext = buildKBContext(scenario);

        // Run all 3 in parallel
        const [groqR, openaiR, claudeR] = await Promise.all([
          (async () => { const t=Date.now(); const r=await callGroq(scenario,liveData,kbContext).catch(e=>({error:e.message})); return {result:r,ms:Date.now()-t}; })(),
          (async () => { const t=Date.now(); const r=await callOpenAI(scenario,liveData,kbContext).catch(e=>({error:e.message})); return {result:r,ms:Date.now()-t}; })(),
          (async () => { const t=Date.now(); const r=await callClaude(scenario,liveData,kbContext).catch(e=>({error:e.message})); return {result:r,ms:Date.now()-t}; })(),
        ]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ groq: groqR, openai: openaiR, claude: claudeR, kb_chars: kbContext.length }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // API: Get live data directly
  if (req.method === 'GET' && req.url === '/api/live-data') {
    try {
      const liveData = await fetchLiveData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(liveData));
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.md': 'text/markdown' };

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
    res.end(data);
  });
});

// Prefetch live data on startup
fetchLiveData().then(() => {
  server.listen(PORT, () => {
    console.log(`\n  SIMULATOR running at http://localhost:${PORT}`);
    console.log(`  Live data: World Bank API (8 indicators, 10 countries)`);
    console.log(`  Cache TTL: 1 hour\n`);
  });
});
