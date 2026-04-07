#!/usr/bin/env node
/**
 * enrich-cultural-data.mjs
 * Uses Anthropic Claude API to fill gaps in cultural data files.
 * Reads all JSON in data/cultural/, identifies missing categories,
 * generates data points, writes back.
 * Requires: ANTHROPIC_API_KEY in .env.local or environment.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'cultural');

// Load env
const envPath = join(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g,'');
  }
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY not set. Add it to .env.local');
  process.exit(1);
}

const CATEGORIES = [
  'daily_routines','spending','social_norms','business_culture',
  'religion','digital_behavior','education','housing',
  'food_lifestyle','trust_governance','regional_variations'
];

async function callClaude(prompt) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!resp.ok) throw new Error(`Claude API error: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  return data.content[0].text;
}

function collectMissingCategories(obj) {
  const missing = [];
  for (const cat of CATEGORIES) {
    if (!obj[cat] || Object.keys(obj[cat]).length === 0) missing.push(cat);
  }
  return missing;
}

async function enrichCountry(filePath) {
  const raw = JSON.parse(readFileSync(filePath, 'utf8'));
  const country = raw._meta?.country || filePath.split('/').pop().replace('.json','');
  const missing = collectMissingCategories(raw);
  if (missing.length === 0) {
    console.log(`  ${country}: all categories present, skip`);
    return 0;
  }
  console.log(`  ${country}: enriching ${missing.join(', ')}`);

  const prompt = `You are a cultural data researcher. Generate structured JSON data points for ${country} covering these categories: ${missing.join(', ')}.

Categories to cover:
- daily_routines: sleep patterns, commute times, meal times, leisure hours, working hours norms
- spending: monthly household spend by category (food, housing, transport, entertainment, education)
- social_norms: concepts like collectivism/individualism score, trust in strangers, face-saving importance, punctuality norms
- business_culture: meeting etiquette, hierarchy level, negotiation style, corruption perception index, business formality
- religion: major religion %, religiosity index, impact on daily life, key religious observances
- digital_behavior: social media penetration %, top platforms, e-commerce adoption %, avg daily screen time, mobile payment adoption
- education: literacy rate, avg years schooling, private tutoring prevalence, education spend per household, university entrance rate
- housing: homeownership rate %, avg household size, avg rent (USD/month), multigenerational household %, housing cost/income ratio
- food_lifestyle: eating out frequency/week, home cooking %, fast food penetration, diet type distribution, alcohol consumption
- trust_governance: institutional trust %, political party trust, media trust, civil society participation, WGI scores
- regional_variations: 3-5 key differences between major regions/cities

For each data point use this format:
{ "value": <number or string>, "source": "<org/survey year>", "year": <2022-2025>, "note": "<optional>" }

Return ONLY valid JSON with this structure:
{
  ${missing.map(c => `"${c}": { "<metric_name>": { "value": ..., "source": "...", "year": ... } }`).join(',\n  ')}
}

Use real, sourced data. Minimum 15 data points per category. Sources: World Values Survey, Eurobarometer, Pew Research, OECD, Statista, national statistics offices, etc.`;

  let text;
  try { text = await callClaude(prompt); }
  catch (e) { console.error(`  ${country}: Claude error — ${e.message}`); return 0; }

  // Extract JSON from response
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) { console.error(`  ${country}: could not parse JSON from Claude response`); return 0; }
  let enriched;
  try { enriched = JSON.parse(match[0]); }
  catch (e) { console.error(`  ${country}: JSON parse error — ${e.message}`); return 0; }

  // Merge into existing file
  let added = 0;
  for (const [cat, data] of Object.entries(enriched)) {
    if (!raw[cat]) raw[cat] = {};
    for (const [k, v] of Object.entries(data)) {
      if (!raw[cat][k]) { raw[cat][k] = v; added++; }
    }
  }
  raw.dataPoints = (raw.dataPoints || 0) + added;
  raw._meta = { ...raw._meta, enriched: new Date().toISOString().slice(0,10) };
  writeFileSync(filePath, JSON.stringify(raw, null, 2));
  console.log(`  ${country}: +${added} data points`);
  return added;
}

console.log('=== enrich-cultural-data.mjs START ===');
let totalAdded = 0;
for (const f of readdirSync(DATA_DIR)) {
  if (!f.endsWith('.json')) continue;
  const full = join(DATA_DIR, f);
  totalAdded += await enrichCountry(full);
  await new Promise(r => setTimeout(r, 500)); // rate limit
}
console.log(`=== COMPLETE — total added: ${totalAdded} data points ===`);
