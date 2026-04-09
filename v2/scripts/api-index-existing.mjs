/**
 * api-index-existing.mjs
 * -----------------------------------------------------------------------
 * Index 24 pre-existing VC / consulting / bank JSON files into Supabase
 * pgvector (simulator_embeddings table).
 *
 * Each file has the shape:
 *   { _meta: {...}, sections: { <sectionName>: <items|{description,data}> } }
 *
 * Usage:
 *   node scripts/api-index-existing.mjs
 *
 * Requires in .env.local:
 *   OPENAI_API_KEY, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL),
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Paths & env
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ENV_FILE = path.join(ROOT, '.env.local');

function loadEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf-8').split('\n')) {
    const m = line.match(/^([^=#][^=]*)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnv(ENV_FILE);
const OPENAI_KEY = env.OPENAI_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY =
  env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_KEY ||
  env.SUPABASE_ANON_KEY;

if (!OPENAI_KEY) { console.error('Missing OPENAI_API_KEY in .env.local'); process.exit(1); }
if (!SUPABASE_URL) { console.error('Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL in .env.local'); process.exit(1); }
if (!SUPABASE_KEY) { console.error('Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in .env.local'); process.exit(1); }

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const FILES_TO_PROCESS = [
  'vc-y-combinator.json',
  'vc-sequoia.json',
  'vc-a16z.json',
  'vc-benchmark.json',
  'vc-accel.json',
  'vc-founders-fund.json',
  'vc-lightspeed.json',
  'consulting-mckinsey.json',
  'consulting-bcg.json',
  'consulting-bain.json',
  'consulting-deloitte.json',
  'consulting-pwc.json',
  'consulting-ey.json',
  'consulting-kpmg.json',
  'bank-jpmorgan.json',
  'bank-goldman-sachs.json',
  'bank-morgan-stanley.json',
  'bank-ubs.json',
  'bank-hsbc.json',
  'bank-citibank.json',
  'bank-deutsche-bank.json',
  'bank-barclays.json',
  'bank-bofa.json',
  'bank-credit-suisse.json',
];

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIM = 512;
const EMBED_BATCH_SIZE = 100;   // max texts per OpenAI call
const UPLOAD_BATCH_SIZE = 20;   // rows per Supabase POST
const TABLE = 'simulator_embeddings';
const DELAY_BETWEEN_EMBED_BATCHES_MS = 200;
const DELAY_BETWEEN_UPLOAD_BATCHES_MS = 500;

// ---------------------------------------------------------------------------
// Extract data points from a single JSON file
// ---------------------------------------------------------------------------
function extractDataPoints(filename) {
  const fullPath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  WARNING: file not found — ${filename}`);
    return [];
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (e) {
    console.warn(`  WARNING: JSON parse error in ${filename}: ${e.message}`);
    return [];
  }

  // Derive category from filename stem: "vc-y-combinator.json" → "vc-y-combinator"
  const category = filename.replace('.json', '');

  const points = [];

  // ---- case 1: flat dataPoints array at root ----
  if (Array.isArray(raw.dataPoints)) {
    for (const dp of raw.dataPoints) {
      const text = buildText(dp, raw._meta?.source || category);
      if (text) points.push({ text, category, file: filename });
    }
    return points;
  }

  // ---- case 2: root is an array ----
  if (Array.isArray(raw)) {
    for (const dp of raw) {
      const text = buildText(dp, category);
      if (text) points.push({ text, category, file: filename });
    }
    return points;
  }

  // ---- case 3: sections object (primary pattern for these 24 files) ----
  if (raw.sections && typeof raw.sections === 'object') {
    const sourceName = raw._meta?.source || category;
    for (const [sectionName, sectionValue] of Object.entries(raw.sections)) {
      // Section can be an array of items directly, or {description, data:[...]}
      let items = [];
      if (Array.isArray(sectionValue)) {
        items = sectionValue;
      } else if (sectionValue && typeof sectionValue === 'object') {
        if (Array.isArray(sectionValue.data)) {
          items = sectionValue.data;
        } else {
          // dict of named items — collect values that are objects
          items = Object.values(sectionValue).filter(v => v && typeof v === 'object' && !Array.isArray(v));
        }
      }

      for (const item of items) {
        if (!item || typeof item !== 'object') continue;
        const text = buildText(item, sourceName, sectionName);
        if (text) points.push({ text, category, file: filename });
      }
    }
    return points;
  }

  console.warn(`  WARNING: unrecognized structure in ${filename}`);
  return [];
}

// ---------------------------------------------------------------------------
// Build embedding text from a data point object
// ---------------------------------------------------------------------------
function buildText(dp, source, sectionName) {
  if (!dp || typeof dp !== 'object') return '';

  const parts = [];

  // Primary descriptive fields
  if (dp.context)      parts.push(dp.context);
  if (dp.description && dp.description !== dp.context) parts.push(dp.description);
  if (dp.text && dp.text !== dp.context) parts.push(dp.text);

  // Metric / indicator
  if (dp.metric)     parts.push(`Metric: ${dp.metric}`);
  if (dp.indicator)  parts.push(`Indicator: ${dp.indicator}`);
  if (dp.name && !dp.metric) parts.push(`Name: ${dp.name}`);

  // Value + unit
  if (dp.value !== undefined && dp.value !== null) {
    const unit = dp.unit ? ` ${dp.unit}` : '';
    parts.push(`Value: ${dp.value}${unit}`);
  }

  // Qualitative / contextual
  if (dp.category)  parts.push(`Category: ${dp.category}`);
  if (dp.type)      parts.push(`Type: ${dp.type}`);
  if (sectionName)  parts.push(`Section: ${sectionName.replace(/_/g, ' ')}`);

  // Provenance
  if (dp.source)  parts.push(`Source: ${dp.source}`);
  else if (source) parts.push(`Source: ${source}`);
  if (dp.year)    parts.push(`Year: ${dp.year}`);
  if (dp.region)  parts.push(`Region: ${dp.region}`);
  if (dp.country) parts.push(`Country: ${dp.country}`);

  const text = parts.filter(Boolean).join('. ');
  return text.length > 15 ? text : '';
}

// ---------------------------------------------------------------------------
// OpenAI embeddings
// ---------------------------------------------------------------------------
async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      dimensions: EMBED_DIM,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embed error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data.map(d => d.embedding);
}

// ---------------------------------------------------------------------------
// Supabase upload
// ---------------------------------------------------------------------------
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
    throw new Error(`Supabase upload error ${res.status}: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== api-index-existing.mjs — Index VC / Consulting / Bank Data ===\n');

  let grandTotal = 0;
  let grandUploaded = 0;

  for (const filename of FILES_TO_PROCESS) {
    // 1. Extract data points
    const points = extractDataPoints(filename);
    const category = filename.replace('.json', '');
    console.log(`Processing ${filename} — ${points.length} data points`);

    if (points.length === 0) continue;

    // 2. Embed in batches of EMBED_BATCH_SIZE
    const allEmbedded = [];
    const textChunks = chunkArray(points.map(p => p.text), EMBED_BATCH_SIZE);

    for (let ci = 0; ci < textChunks.length; ci++) {
      const chunk = textChunks[ci];
      try {
        const embeddings = await embedBatch(chunk);
        for (let j = 0; j < chunk.length; j++) {
          const globalIdx = ci * EMBED_BATCH_SIZE + j;
          allEmbedded.push({
            point: points[globalIdx],
            embedding: embeddings[j],
          });
        }
        process.stdout.write(`  Embedded ${Math.min((ci + 1) * EMBED_BATCH_SIZE, points.length)}/${points.length} ...\r`);
      } catch (e) {
        console.error(`\n  ERROR embedding batch ${ci + 1} of ${filename}: ${e.message}`);
      }

      if (ci < textChunks.length - 1) {
        await sleep(DELAY_BETWEEN_EMBED_BATCHES_MS);
      }
    }

    process.stdout.write('\n');

    // 3. Build Supabase rows
    const timestamp = Date.now();
    const rows = allEmbedded.map((item, i) => ({
      id: `${category}-${i}-${timestamp}`,
      file: item.point.file,
      category: item.point.category,
      text: item.point.text,
      embedding: `[${item.embedding.join(',')}]`,
    }));

    // 4. Upload in batches of UPLOAD_BATCH_SIZE
    const uploadChunks = chunkArray(rows, UPLOAD_BATCH_SIZE);
    let uploaded = 0;

    for (let ui = 0; ui < uploadChunks.length; ui++) {
      try {
        await uploadBatch(uploadChunks[ui]);
        uploaded += uploadChunks[ui].length;
        process.stdout.write(`  Uploaded ${uploaded}/${rows.length} ...\r`);
      } catch (e) {
        console.error(`\n  ERROR uploading batch ${ui + 1} of ${filename}: ${e.message}`);
      }

      if (ui < uploadChunks.length - 1) {
        await sleep(DELAY_BETWEEN_UPLOAD_BATCHES_MS);
      }
    }

    process.stdout.write('\n');
    console.log(`  Done: ${uploaded} rows uploaded.\n`);

    grandTotal += points.length;
    grandUploaded += uploaded;
  }

  console.log('=== Finished ===');
  console.log(`Total data points extracted : ${grandTotal.toLocaleString()}`);
  console.log(`Total rows uploaded         : ${grandUploaded.toLocaleString()}`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
