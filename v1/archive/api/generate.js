const https = require('https');
const fs = require('fs');
const path = require('path');

// ============ KNOWLEDGE BASE ============
function loadKB() {
  const dataDir = path.join(process.cwd(), 'data');
  const kb = {};
  try {
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && !['source-authority.json', 'api-databases.json'].includes(f));
    for (const file of files) {
      try { kb[file.replace('.json', '')] = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')); } catch (e) {}
    }
    const mdFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.md') && !['INDEX.md', 'api-databases.md'].includes(f));
    for (const file of mdFiles) {
      try {
        const lines = fs.readFileSync(path.join(dataDir, file), 'utf8').split('\n').slice(0, 150);
        const stats = lines.filter(l => /\d+%|\$[\d,.]+|[\d,.]+\s*(billion|million|trillion)/i.test(l)).slice(0, 30);
        if (stats.length > 0) kb[file.replace('.md', '')] = stats.join('\n');
      } catch (e) {}
    }
  } catch (e) {}
  return kb;
}

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
  'life-transitions-decisions': ['move','relocate','start over','gap year','drop out','run away','promise','second chance','risk'],
  'trust-secrets-betrayal': ['secret','cheat','betray','lie','fraud','scam','trust','infidelity','hidden','whistle'],
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

// ============ SMART EXTRACTION ============
function extractArchetypeContext(data, scenario) {
  if (!data.archetypes) return null;
  const lower = scenario.toLowerCase();
  let bestKey = null, bestScore = 0;
  for (const [key, arch] of Object.entries(data.archetypes)) {
    const text = `${key.replace(/_/g, ' ')} ${arch.name} ${arch.description} ${arch.entry_point}`.toLowerCase();
    const words = lower.split(/\s+/);
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
End-to-end: ${arch.cumulative_end_to_end || arch.end_to_end_conversion || 'see stages'}
`;
  }
  return null;
}

function extractSectionEntries(data, scenario, maxEntries) {
  if (!data.sections) return null;
  const lower = scenario.toLowerCase();
  const scenarioWords = lower.split(/\s+/).filter(w => w.length > 3);
  const sectionScores = [];
  for (const [secName, entries] of Object.entries(data.sections)) {
    if (!Array.isArray(entries)) continue;
    const secWords = secName.replace(/_/g, ' ').toLowerCase();
    const secScore = scenarioWords.filter(w => secWords.includes(w)).length;
    sectionScores.push({ name: secName, entries, score: secScore });
  }
  sectionScores.sort((a, b) => b.score - a.score);
  const scored = [];
  for (const sec of sectionScores.slice(0, 3)) {
    for (const entry of sec.entries) {
      const metricLower = (entry.metric || '').toLowerCase();
      const entryScore = sec.score + scenarioWords.filter(w => metricLower.includes(w)).length;
      if (entryScore > 0) scored.push({ ...entry, _score: entryScore, _section: sec.name });
    }
  }
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
  const lower = scenario.toLowerCase();
  let results = [];
  for (const [key, funnel] of Object.entries(data)) {
    if (key === '_meta' || key === 'business_archetypes' || !funnel.stages) continue;
    const funnelWords = key.replace(/_/g, ' ').toLowerCase();
    const score = lower.split(/\s+/).filter(w => w.length > 3 && funnelWords.includes(w)).length;
    if (score > 0) results.push({ key, stages: funnel.stages, score, extra: funnel });
  }
  results.sort((a, b) => b.score - a.score);
  const best = results[0];
  if (!best) return null;
  let ctx = `\nFUNNEL: ${best.key}\n`;
  ctx += best.stages.map((s, i) => `  ${i+1}. ${s.label}: ${s.prob}% (${s.source})`).join('\n');
  for (const [k, v] of Object.entries(best.extra)) {
    if (k === 'stages') continue;
    if (typeof v === 'object') ctx += `\n  ${k}: ${JSON.stringify(v)}`;
  }
  return ctx;
}

function extractSacredContext(data, scenario) {
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
      return `  Pattern: "${e.pattern}" | Bible: ${e.sacred_source_bible} | Quran: ${e.sacred_source_quran || 'N/A'} | Modern: ${e.modern_equivalent || ''} | Data: ${e.data_confirmation || ''} (${e.data_source || ''})`;
    } else {
      return `  ${e.cycle_name || e.pattern} (${e.year || ''}) | ${e.what_happened || ''} | Modern: ${e.modern_parallel || ''} | Data: ${e.modern_data || ''} (${e.data_source || ''})`;
    }
  }).join('\n');
}

function matchKB(kb, scenario) {
  const lower = scenario.toLowerCase();
  const relevant = [];
  for (const [key, words] of Object.entries(KEYWORDS)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > 0) relevant.push({ key, score });
  }
  if (!relevant.find(r => r.key === 'master-funnels')) relevant.push({ key: 'master-funnels', score: 0.5 });
  relevant.sort((a, b) => b.score - a.score);
  const top = relevant.slice(0, 8);

  let context = '';
  let archetypeFound = false;

  for (const { key } of top) {
    const data = kb[key];
    if (!data) continue;
    if (typeof data === 'string') { context += `\n--- ${key} ---\n${data}\n`; continue; }
    if (data.archetypes) {
      const archCtx = extractArchetypeContext(data, scenario);
      if (archCtx) { context += archCtx; archetypeFound = true; continue; }
    }
    if (key === 'sacred-texts-patterns' || key === 'historical-cycles') {
      const sacredCtx = extractSacredContext(data, scenario);
      if (sacredCtx) { context += `\n--- ${key} ---\n${sacredCtx}\n`; continue; }
    }
    if (key === 'master-funnels') {
      const funnelCtx = extractFunnelContext(data, scenario);
      if (funnelCtx) { context += funnelCtx + '\n'; continue; }
    }
    if (data.sections) {
      const entries = extractSectionEntries(data, scenario, 25);
      if (entries) { context += `\n--- ${key} (top matches) ---\n${entries}\n`; continue; }
    }
    context += `\n--- ${key} ---\n${JSON.stringify(data, null, 0).substring(0, 2000)}\n`;
  }

  // Auto-include time-to-result for business scenarios
  const bizWords = ['business','start','launch','build','earn','money','income','revenue','profit','sell','client','customer'];
  if (bizWords.some(w => lower.includes(w)) && !relevant.find(r => r.key === 'time-to-result-benchmarks')) {
    const ttr = kb['time-to-result-benchmarks'];
    if (ttr && ttr.sections) {
      const entries = extractSectionEntries(ttr, scenario, 10);
      if (entries) context += `\n--- time-to-result (auto) ---\n${entries}\n`;
    }
  }

  if (archetypeFound) context = `[ARCHETYPE AVAILABLE — base your simulation on the archetype stages below]\n` + context;
  return context.substring(0, 16000);
}

// ============ WORLD BANK LIVE ============
let wbCache = { data: null, ts: 0 };

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Simulator/1.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

async function getLiveData() {
  if (wbCache.data && Date.now() - wbCache.ts < 3600000) return wbCache.data;
  try {
    const gdp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN/indicator/NY.GDP.PCAP.CD?format=json&date=2023&per_page=20');
    const unemp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN/indicator/SL.UEM.TOTL.ZS?format=json&date=2023&per_page=20');
    const r = {};
    if (gdp?.[1]) { r.gdp = {}; gdp[1].forEach(d => { if (d.value) r.gdp[d.country.value] = '$' + Math.round(d.value).toLocaleString(); }); }
    if (unemp?.[1]) { r.unemp = {}; unemp[1].forEach(d => { if (d.value) r.unemp[d.country.value] = d.value.toFixed(1) + '%'; }); }
    wbCache = { data: r, ts: Date.now() };
    return r;
  } catch (e) { return null; }
}

// ============ CLAUDE API ============
function callClaude(systemPrompt, userMsg) {
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
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
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
function callGroq(systemPrompt, userMsg) {
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
      res.on('data', c => d += c);
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
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { scenario } = req.body;
    if (!scenario) return res.status(400).json({ error: 'Missing scenario' });

    const kb = loadKB();
    const kbContext = matchKB(kb, scenario);
    const live = await getLiveData();

    let liveStr = '';
    if (live?.gdp) liveStr = `\nLIVE DATA: GDP/capita: ${Object.entries(live.gdp).map(([k,v])=>`${k}: ${v}`).join(', ')}. Unemployment: ${Object.entries(live.unemp||{}).map(([k,v])=>`${k}: ${v}`).join(', ')}`;

    const systemPrompt = `You are a life/business scenario simulator. Generate a realistic flowchart with nodes and edges.
CRITICAL — DATA-DRIVEN GENERATION:
If an ARCHETYPE is provided (marked [ARCHETYPE AVAILABLE]), use its stages as the SKELETON. Use the EXACT probabilities. NEVER invent different numbers when data is provided.
If section data points are provided, use those specific numbers. CITE the source.
RULES: Return ONLY valid JSON. 8-18 nodes. Include success AND failure paths.
Node types: start, desire, action, bottleneck, decision, outcome-good, outcome-bad, loop. Edges: pass/fail for bottleneck, yes/no for decision.
Position: x increases by ~260, failures below (y+200). Min 260px horizontal spacing.
JSON: {"title":"...","nodes":[{"id":1,"type":"desire","label":"...","x":0,"y":120,"prob":100,"desc":"Real stat from KB","source":"Source Year","time":"30-90 days"}],"edges":[{"from":1,"to":2,"label":""}]}
prob = conditional % of PASSING. Only bottleneck/decision need realistic prob. Others = 100.
desc MUST include a specific number/stat, not generic text. If sacred text patterns are in the data, reference them in the most critical bottleneck desc.${liveStr}`;

    const userMsg = `Scenario: "${scenario}"\n\nUSE THESE DATA POINTS:\n${kbContext || 'Use Tier S/A sources.'}\n\nReturn ONLY JSON.`;

    let flow;
    try {
      flow = await callClaude(systemPrompt, userMsg);
      flow._provider = 'claude';
    } catch (e) {
      flow = await callGroq(systemPrompt, userMsg);
      flow._provider = 'groq';
    }
    flow._live_data = !!live?.gdp;

    res.status(200).json(flow);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
