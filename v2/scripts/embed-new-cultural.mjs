/**
 * Embed + Upload NEW cultural data (only the 8 new directories)
 * Processes one file at a time to avoid OOM
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CULTURAL = path.join(ROOT, 'data', 'cultural');
const ENV_FILE = path.join(ROOT, '.env.local');

// Load env
const envLines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const OPENAI_KEY = env.OPENAI_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;

if (!OPENAI_KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1); }
if (!SUPABASE_URL) { console.error('Missing SUPABASE_URL'); process.exit(1); }
if (!SUPABASE_KEY) { console.error('Missing SUPABASE key'); process.exit(1); }

const TABLE = 'simulator_embeddings';
const EMBED_BATCH = 80;
const UPLOAD_BATCH = 50;

// Only new directories
const NEW_DIRS = [
  'health-global', 'education-global', 'entrepreneurship-global', 'gender-equality',
  'infrastructure-tech', 'environment-climate', 'poverty-inequality', 'financial-inclusion',
  'countries-wellbeing', 'undp-hdi',
];

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts, dimensions: 512 }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.data.map(d => d.embedding);
}

async function uploadBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${res.status}: ${err.slice(0, 200)}`);
  }
}

function buildText(record, source) {
  return [
    record.country ? `Country: ${record.country}` : '',
    record.indicatorName || record.metric ? `Indicator: ${record.indicatorName || record.metric}` : '',
    record.year ? `Year: ${record.year}` : '',
    record.value !== undefined ? `Value: ${record.value}` : '',
    record.sourceUrl ? `Source: ${record.sourceUrl}` : '',
    `File: ${source}`,
  ].filter(Boolean).join('. ');
}

async function processFile(filePath, dirName) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  const records = Array.isArray(parsed) ? parsed : (parsed.data || []);
  const source = `${dirName}/${path.basename(filePath)}`;

  if (records.length === 0) return 0;

  let embedded = 0;

  for (let i = 0; i < records.length; i += EMBED_BATCH) {
    const batch = records.slice(i, i + EMBED_BATCH);
    const texts = batch.map(r => buildText(r, source));

    try {
      const embeddings = await embedBatch(texts);

      const rows = batch.map((r, j) => ({
        id: `cult-${dirName}-${(r.countryCode || r.country || 'x').toString().toLowerCase().replace(/\s+/g, '-')}-${(r.indicator || r.metric || path.basename(filePath, '.json')).slice(0, 30)}-${r.year || 0}-${i + j}`,
        file: source,
        category: `cultural-${dirName}`,
        text: texts[j],
        embedding: `[${embeddings[j].join(',')}]`,
      }));

      // Upload in sub-batches
      for (let u = 0; u < rows.length; u += UPLOAD_BATCH) {
        const uploadSlice = rows.slice(u, u + UPLOAD_BATCH);
        await uploadBatch(uploadSlice);
      }

      embedded += batch.length;
    } catch (err) {
      console.error(`    [ERR] ${source} batch ${i}: ${err.message.slice(0, 100)}`);
      await new Promise(r => setTimeout(r, 3000));
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 150));
  }

  return embedded;
}

async function main() {
  console.log('=== Embed NEW Cultural Data → Supabase ===\n');

  let grandTotal = 0;

  for (const dirName of NEW_DIRS) {
    const dir = path.join(CULTURAL, dirName);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
    let dirTotal = 0;

    for (const file of files) {
      const count = await processFile(path.join(dir, file), dirName);
      dirTotal += count;
      if (count > 0) process.stdout.write(`  ${dirName}/${file}: ${count} embedded\n`);
    }

    console.log(`  → ${dirName}: ${dirTotal.toLocaleString()} total\n`);
    grandTotal += dirTotal;
  }

  console.log(`\n=== DONE: ${grandTotal.toLocaleString()} records embedded to Supabase ===`);
}

main().catch(console.error);
