/**
 * embed-chunked.mjs — Master Embedding Script (Chunked)
 * -------------------------------------------------------
 * Embeds ALL JSON data files into Supabase pgvector using chunking:
 * instead of 1 embedding per data point, groups 5-8 related points
 * (same country + category) into one chunk to save storage.
 *
 * Scans:
 *   data/cultural/worldbank/      (+ worldbank-bulk/, worldbank-mega/)
 *   data/cultural/eurostat/
 *   data/cultural/oecd-un/
 *   data/cultural/ai-generated/
 *   data/cultural/enriched/
 *   data/cultural/*.json          (root cultural json files)
 *   data/vc-*.json
 *   data/consulting-*.json
 *   data/bank-*.json
 *
 * Usage: node scripts/embed-chunked.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');

// ---------------------------------------------------------------------------
// Load env
// ---------------------------------------------------------------------------
const envLines = fs.readFileSync(ENV_FILE, 'utf-8').split('\n');
const env = {};
for (const line of envLines) {
  const m = line.match(/^([^#][^=]*)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim();
}

const OPENAI_KEY = env.OPENAI_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;

if (!OPENAI_KEY) { console.error('[ERROR] Missing OPENAI_API_KEY'); process.exit(1); }
if (!SUPABASE_URL) { console.error('[ERROR] Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL'); process.exit(1); }
if (!SUPABASE_KEY) { console.error('[ERROR] Missing SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SERVICE_KEY / SUPABASE_ANON_KEY'); process.exit(1); }

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIM = 512;
const EMBED_BATCH = 100;   // texts per OpenAI call (OpenAI supports up to 2048)
const UPLOAD_BATCH = 15;   // rows per Supabase upsert (keep small to avoid timeout)
const CHUNK_SIZE_MIN = 5;
const CHUNK_SIZE_MAX = 8;
const MAX_CHUNK_CHARS = 2000; // ~500 tokens safety cap
const TABLE = 'simulator_embeddings';
const DELAY_EMBED_MS = 100;
const DELAY_UPLOAD_MS = 100;

// Parallel range support: node script.mjs [startPct] [endPct]
// e.g. node script.mjs 0 33  → first third
const RANGE_START_PCT = parseInt(process.argv[2] || '0', 10);
const RANGE_END_PCT = parseInt(process.argv[3] || '100', 10);

// ---------------------------------------------------------------------------
// Directories and file patterns to scan
// ---------------------------------------------------------------------------
const CULTURAL_DIR = path.join(ROOT, 'data', 'cultural');
const DATA_DIR = path.join(ROOT, 'data');

// Subdirectories inside data/cultural/ to walk recursively
const CULTURAL_SUBDIRS = [
  'worldbank',
  'worldbank-bulk',
  'worldbank-mega',
  'worldbank-v2',
  'worldbank-all',
  'worldbank-expanded',
  'eurostat',
  'eurostat-v2',
  'oecd-un',
  'oecd-v2',
  'fred-usa',
  'un-data',
  'ilo-labor',
  'who-gho',
  'imf-weo',
  'undp-hdr',
  'unesco',
  'restcountries',
  'coingecko',
  'behavioral',
  'enriched',
];

// Root-level cultural JSON files (not in a subdir)
// These are the flat *.json files directly in data/cultural/
const CULTURAL_ROOT_PATTERN = /\.json$/;

// Root data/ files matching these prefixes
const ROOT_DATA_PREFIXES = ['vc-', 'consulting-', 'bank-', 'religion-', 'creator-', 'ai-remote-', 'vocational-', 'addiction-', 'domain-deepening-', 'dating-', 'geopolitics-', 'longevity-', 'startup-vc-', 'cost-of-living-', 'food-nutrition-', 'crime-justice-', 'digital-tech-', 'mental-health-global-', 'energy-climate-', 'transportation-', 'sports-fitness-', 'housing-real-estate-', 'education-global-', 'healthcare-systems-', 'migration-diaspora-'];

// ---------------------------------------------------------------------------
// File collection
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB max — skip larger files to avoid OOM

function isIgnored(name) {
  return name.startsWith('_') || name === 'summary.json' || name === 'meta.json';
}

/** Walk a directory recursively and collect .json file paths */
function walkDir(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else if (entry.isFile() && entry.name.endsWith('.json') && !isIgnored(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function collectFiles() {
  const files = new Set();

  // 1. Cultural subdirectories
  for (const sub of CULTURAL_SUBDIRS) {
    const dir = path.join(CULTURAL_DIR, sub);
    for (const f of walkDir(dir)) files.add(f);
  }

  // 2. Root cultural JSON files (files directly in data/cultural/, not subdirs)
  if (fs.existsSync(CULTURAL_DIR)) {
    for (const entry of fs.readdirSync(CULTURAL_DIR, { withFileTypes: true })) {
      if (entry.isFile() && CULTURAL_ROOT_PATTERN.test(entry.name) && !isIgnored(entry.name)) {
        files.add(path.join(CULTURAL_DIR, entry.name));
      }
    }
  }

  // 3. Root data/ files: vc-*, consulting-*, bank-*
  if (fs.existsSync(DATA_DIR)) {
    for (const entry of fs.readdirSync(DATA_DIR, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.json') && !isIgnored(entry.name)) {
        if (ROOT_DATA_PREFIXES.some(p => entry.name.startsWith(p))) {
          files.add(path.join(DATA_DIR, entry.name));
        }
      }
    }
  }

  return [...files];
}

// ---------------------------------------------------------------------------
// Data point extraction
// Handles three file shapes:
//   A) { dataPoints: [...] }
//   B) Direct array [...]
//   C) { sections: { sectionName: [...items] } }  (vc/consulting/bank files)
// ---------------------------------------------------------------------------
function buildContextFromItem(item, sourceLabel) {
  // For dataPoints-style items (worldbank etc.)
  if (item.context) return item.context;

  // For sections-style items (vc/consulting/bank): build a context string
  const parts = [];
  if (item.metric) parts.push(item.metric);
  if (item.value !== undefined) parts.push(`${item.value}${item.unit ? ' ' + item.unit : ''}`);
  if (item.year) parts.push(`(${item.year})`);
  if (item.source) parts.push(`— ${item.source}`);
  if (item.note) parts.push(item.note);
  return parts.join(' ') || JSON.stringify(item).slice(0, 200);
}

function extractDataPoints(filePath) {
  // Skip files larger than MAX_FILE_SIZE to avoid OOM/stack overflow
  const stat = fs.statSync(filePath);
  if (stat.size > MAX_FILE_SIZE) {
    console.log(`  [SKIP] ${path.basename(filePath)} — ${(stat.size / 1024 / 1024).toFixed(0)}MB > ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    return [];
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }

  const relPath = path.relative(ROOT, filePath);
  const fileName = path.basename(filePath, '.json');
  const points = [];

  // Shape A & B: standard dataPoints array
  const dpArray = raw.dataPoints || (Array.isArray(raw) ? raw : null);
  if (dpArray) {
    for (const dp of dpArray) {
      const context = buildContextFromItem(dp, relPath);
      if (!context || context.length < 10) continue;
      points.push({
        country: dp.country || dp.countryCode || 'global',
        category: dp.metric || dp.indicator || dp.indicator_name || fileName,
        context,
        source: relPath,
        year: dp.year || 0,
        value: dp.value,
      });
    }
    return points;
  }

  // Shape C: { sections: { key: [...] } }
  if (raw.sections && typeof raw.sections === 'object') {
    // Derive org name from file name: vc-a16z → a16z, consulting-mckinsey → mckinsey
    const orgName = fileName.replace(/^(vc|consulting|bank)-/, '');
    const orgType = fileName.startsWith('vc-') ? 'vc'
      : fileName.startsWith('consulting-') ? 'consulting'
      : 'bank';

    for (const [sectionKey, sectionVal] of Object.entries(raw.sections)) {
      const items = Array.isArray(sectionVal) ? sectionVal : [];
      for (const item of items) {
        const context = buildContextFromItem(item, relPath);
        if (!context || context.length < 10) continue;
        points.push({
          country: orgName,          // treat org name as "country" for grouping
          category: `${orgType}-${sectionKey}`,
          context,
          source: relPath,
          year: item.year || 0,
          value: item.value,
        });
      }
    }
    return points;
  }

  return [];
}

// ---------------------------------------------------------------------------
// Chunking: group by country+category, then split into chunks of 5-8
// ---------------------------------------------------------------------------
function groupAndChunk(allPoints) {
  // Group by country+category key
  const groups = new Map();
  for (const dp of allPoints) {
    const key = `${dp.country}||${dp.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(dp);
  }

  const chunks = [];
  for (const [key, points] of groups) {
    const [country, category] = key.split('||');
    // Split group into chunks of CHUNK_SIZE_MAX, minimum CHUNK_SIZE_MIN
    let i = 0;
    while (i < points.length) {
      const slice = points.slice(i, i + CHUNK_SIZE_MAX);
      i += CHUNK_SIZE_MAX;

      // Build combined text, respecting MAX_CHUNK_CHARS
      let text = '';
      const included = [];
      for (const p of slice) {
        const addition = (text ? ' | ' : '') + p.context;
        if (text.length + addition.length > MAX_CHUNK_CHARS && included.length >= CHUNK_SIZE_MIN) break;
        text += addition;
        included.push(p);
      }

      if (text.length < 20) continue;

      const slug = country.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const catSlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
      const sourceFile = included[0]?.source || 'unknown';

      chunks.push({
        text,
        country: slug,
        category: catSlug,
        source: sourceFile,
        dpCount: included.length,
      });
    }
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Deduplication: query Supabase for already-processed files
// ---------------------------------------------------------------------------
async function fetchAlreadyEmbeddedFiles() {
  // Use select with distinct on file column — Supabase REST supports ?select=file
  // We'll fetch all file values and deduplicate in JS (max 10K rows)
  const embedded = new Set();
  let offset = 0;
  const limit = 1000;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${TABLE}?select=file&limit=${limit}&offset=${offset}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) {
      // Table might not exist yet or other error — skip dedup
      console.warn(`  [WARN] Could not query existing embeddings (${res.status}). Will embed all files.`);
      return embedded;
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) break;
    for (const row of rows) {
      if (row.file) embedded.add(row.file);
    }
    if (rows.length < limit) break;
    offset += limit;
  }
  return embedded;
}

// ---------------------------------------------------------------------------
// OpenAI embed
// ---------------------------------------------------------------------------
async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIM }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embed error ${res.status}: ${err.slice(0, 300)}`);
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
    throw new Error(`Supabase upload error ${res.status}: ${err.slice(0, 300)}`);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== embed-chunked.mjs — Master Embedding Script ===\n');

  // 1. Collect files
  console.log('Scanning...');
  const files = collectFiles();
  console.log(`  Found ${files.length} JSON files to process\n`);

  // 2. Extract all data points
  let totalDp = 0;
  const allPoints = [];
  for (const f of files) {
    const pts = extractDataPoints(f);
    totalDp += pts.length;
    allPoints.push(...pts);
  }
  console.log(`Scanning... Found ${totalDp.toLocaleString()} data points in ${files.length} files`);

  if (totalDp === 0) {
    console.log('No data points found. Check your file paths and data structures. Exiting.');
    return;
  }

  // 3. Group + chunk
  const allChunks = groupAndChunk(allPoints);
  const avgDpPerChunk = (totalDp / allChunks.length).toFixed(1);
  console.log(`Grouped into ${allChunks.length.toLocaleString()} chunks (avg ${avgDpPerChunk} dp/chunk)\n`);

  // 4. Deduplication: find already-embedded source files
  console.log('Checking Supabase for already-embedded files...');
  const alreadyEmbedded = await fetchAlreadyEmbeddedFiles();
  console.log(`  ${alreadyEmbedded.size.toLocaleString()} unique source files already in Supabase`);

  const filteredChunks = allChunks.filter(c => !alreadyEmbedded.has(c.source));
  const skippedCount = allChunks.length - filteredChunks.length;
  console.log(`Skipping ${skippedCount.toLocaleString()} chunks from already-embedded files`);

  // Apply range for parallel execution
  const startIdx = Math.floor(filteredChunks.length * RANGE_START_PCT / 100);
  const endIdx = Math.floor(filteredChunks.length * RANGE_END_PCT / 100);
  const newChunks = filteredChunks.slice(startIdx, endIdx);
  console.log(`Range ${RANGE_START_PCT}-${RANGE_END_PCT}%: chunks ${startIdx.toLocaleString()}-${endIdx.toLocaleString()} (${newChunks.length.toLocaleString()} chunks)\n`);

  if (newChunks.length === 0) {
    console.log('Nothing new to embed. All files already processed.');
    return;
  }

  // 5. Embed + Upload in STREAMING mode (no memory accumulation)
  let embeddedCount = 0;
  let uploadedCount = 0;
  let failedCount = 0;
  const textBatches = chunkArray(newChunks, EMBED_BATCH);

  for (let bi = 0; bi < textBatches.length; bi++) {
    const batch = textBatches[bi];
    const texts = batch.map(c => c.text);

    let vectors = null;
    try {
      vectors = await embedBatch(texts);
    } catch (err) {
      console.error(`  [ERROR] Embed batch ${bi}: ${err.message}`);
      await sleep(5000);
      try {
        vectors = await embedBatch(texts);
      } catch (err2) {
        console.error(`  [FAIL] Batch ${bi} skipped: ${err2.message}`);
        failedCount += batch.length;
        continue;
      }
    }

    if (!vectors) continue;

    // Build rows and upload IMMEDIATELY (no accumulation)
    const rows = [];
    const ts = Date.now();
    for (let j = 0; j < batch.length; j++) {
      const c = batch[j];
      rows.push({
        id: `chunk-${c.country}-${c.category}-${ts}-${embeddedCount + j}`,
        file: c.source,
        category: `cultural-${c.country}`,
        text: c.text,
        embedding: `[${vectors[j].join(',')}]`,
      });
    }

    // Upload in sub-batches of UPLOAD_BATCH to avoid Supabase timeout
    for (let ui = 0; ui < rows.length; ui += UPLOAD_BATCH) {
      const subBatch = rows.slice(ui, ui + UPLOAD_BATCH);
      try {
        await uploadBatch(subBatch);
        uploadedCount += subBatch.length;
      } catch (err) {
        await sleep(3000);
        try {
          await uploadBatch(subBatch);
          uploadedCount += subBatch.length;
        } catch (err2) {
          console.error(`  [FAIL] Upload sub-batch ${bi}:${ui} lost: ${err2.message.slice(0,100)}`);
          failedCount += subBatch.length;
        }
      }
      await sleep(300);
    }

    embeddedCount += batch.length;

    if (embeddedCount % 500 === 0 || bi === textBatches.length - 1) {
      console.log(`Processed ${embeddedCount.toLocaleString()}/${newChunks.length.toLocaleString()} chunks (uploaded: ${uploadedCount.toLocaleString()}, failed: ${failedCount})`);
    }

    await sleep(DELAY_EMBED_MS);
  }

  // 6. Final report
  console.log(`\n=== Done ===`);
  console.log(`Chunks processed:     ${embeddedCount.toLocaleString()}`);
  console.log(`Chunks uploaded:      ${uploadedCount.toLocaleString()}`);
  console.log(`Chunks failed:        ${failedCount}`);
  console.log(`Skipped (existing):   ${skippedCount.toLocaleString()}`);
  console.log(`Table:                ${TABLE}`);
  console.log(`Model:                ${EMBED_MODEL} (${EMBED_DIM}d)`);
}

main().catch(err => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
