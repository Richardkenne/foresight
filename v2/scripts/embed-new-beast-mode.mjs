#!/usr/bin/env node
/**
 * embed-new-beast-mode.mjs — Embed ONLY the new Beast Mode files
 * Handles: new research files in data/, new API files in data/cultural/
 * Uses same chunking logic as embed-chunked.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');

// Load env
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
if (!SUPABASE_URL) { console.error('[ERROR] Missing SUPABASE_URL'); process.exit(1); }
if (!SUPABASE_KEY) { console.error('[ERROR] Missing SUPABASE_KEY'); process.exit(1); }

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIM = 512;
const EMBED_BATCH = 100;
const UPLOAD_BATCH = 15;
const CHUNK_SIZE = 6;
const MAX_CHUNK_CHARS = 2000;
const TABLE = 'simulator_embeddings';
const DELAY_MS = 150;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// NEW files to embed (Beast Mode output)
const NEW_RESEARCH_FILES = [
  'religion-spirituality.json', 'creator-economics-2025.json', 'ai-remote-work-2025.json',
  'vocational-trades-careers.json', 'addiction-recovery-deep.json', 'domain-deepening-2025.json',
  'dating-relationships-deep.json', 'geopolitics-country-risk.json', 'longevity-aging-death.json',
  'startup-vc-deep.json', 'cost-of-living-global.json', 'food-nutrition-global.json',
  'crime-justice-global.json', 'digital-tech-global.json', 'mental-health-global-deep.json',
  'energy-climate-global.json', 'transportation-mobility-global.json', 'sports-fitness-global.json',
  'housing-real-estate-global.json', 'education-global-deep.json', 'healthcare-systems-global.json',
  'migration-diaspora-global.json',
];

const NEW_CULTURAL_DIRS = [
  'worldbank-all', 'worldbank-expanded', 'who-gho', 'imf-weo',
];

// Collect all files
function collectFiles() {
  const files = [];
  const dataDir = path.join(ROOT, 'data');
  const culturalDir = path.join(ROOT, 'data', 'cultural');

  // Research files in data/
  for (const name of NEW_RESEARCH_FILES) {
    const fp = path.join(dataDir, name);
    if (fs.existsSync(fp)) files.push(fp);
  }

  // API download dirs in data/cultural/
  for (const sub of NEW_CULTURAL_DIRS) {
    const dir = path.join(culturalDir, sub);
    if (fs.existsSync(dir)) {
      // Follow symlinks
      const realDir = fs.realpathSync(dir);
      for (const entry of fs.readdirSync(realDir)) {
        if (entry.endsWith('.json')) {
          files.push(path.join(realDir, entry));
        }
      }
    }
  }

  return files;
}

// Extract data points from various JSON structures
function extractDataPoints(data) {
  // Shape A: { dataPoints: [...] }
  if (data.dataPoints && Array.isArray(data.dataPoints)) return data.dataPoints;
  // Shape B: direct array
  if (Array.isArray(data)) return data;
  // Shape C: { data: [...] }
  if (data.data && Array.isArray(data.data)) return data.data;
  // Shape D: { sections: [...] } or nested arrays
  const points = [];
  for (const [key, val] of Object.entries(data)) {
    if (key.startsWith('_')) continue;
    if (Array.isArray(val)) {
      points.push(...val);
    } else if (typeof val === 'object' && val !== null) {
      for (const subVal of Object.values(val)) {
        if (Array.isArray(subVal)) points.push(...subVal);
      }
    }
  }
  return points;
}

// Create text representation of a data point for embedding
function dpToText(dp) {
  const parts = [];
  if (dp.indicator) parts.push(dp.indicator);
  if (dp.metric) parts.push(dp.metric);
  if (dp.country) parts.push(dp.country);
  if (dp.countryCode) parts.push(dp.countryCode);
  if (dp.category) parts.push(`category: ${dp.category}`);
  if (dp.platform) parts.push(`platform: ${dp.platform}`);
  if (dp.year) parts.push(`year: ${dp.year}`);
  if (dp.value !== undefined && dp.value !== null) parts.push(`value: ${dp.value}`);
  if (dp.unit) parts.push(dp.unit);
  if (dp.description) parts.push(dp.description);
  if (dp.source) parts.push(`source: ${dp.source}`);
  return parts.join(' | ');
}

// Chunk data points into groups
function chunkDataPoints(dps, filename) {
  const chunks = [];
  // Group by country+category if available
  const groups = {};
  for (const dp of dps) {
    const key = `${dp.country || dp.countryCode || 'global'}_${dp.category || dp.indicator || 'misc'}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(dp);
  }

  for (const [groupKey, groupDPs] of Object.entries(groups)) {
    for (let i = 0; i < groupDPs.length; i += CHUNK_SIZE) {
      const slice = groupDPs.slice(i, i + CHUNK_SIZE);
      const text = slice.map(dpToText).join('\n');
      if (text.length > 0) {
        chunks.push({
          text: text.substring(0, MAX_CHUNK_CHARS),
          metadata: {
            file: filename,
            group: groupKey,
            count: slice.length,
            source: slice[0].source || slice[0].sourceUrl || '',
          },
        });
      }
    }
  }
  return chunks;
}

// Embed texts via OpenAI
async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIM }),
  });
  if (!res.ok) throw new Error(`OpenAI embed error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data.map(d => d.embedding);
}

// Upload to Supabase
async function uploadBatch(rows) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Supabase upload error: ${res.status} ${errText}`);
  }
}

async function main() {
  const files = collectFiles();
  console.log(`\n=== Beast Mode Embedding ===`);
  console.log(`Files to embed: ${files.length}\n`);

  let totalChunks = 0;
  let totalUploaded = 0;
  let totalDP = 0;
  const allChunks = [];

  // Phase 1: Extract and chunk
  for (const filePath of files) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      // Skip very large files (>50MB)
      if (raw.length > 50 * 1024 * 1024) {
        console.log(`  SKIP (too large): ${path.basename(filePath)}`);
        continue;
      }
      const data = JSON.parse(raw);
      const dps = extractDataPoints(data);
      if (dps.length === 0) continue;

      totalDP += dps.length;
      const chunks = chunkDataPoints(dps, path.basename(filePath));
      allChunks.push(...chunks);
      totalChunks += chunks.length;
      console.log(`  ${path.basename(filePath)}: ${dps.length} DP → ${chunks.length} chunks`);
    } catch (err) {
      console.log(`  ERROR ${path.basename(filePath)}: ${err.message}`);
    }
  }

  console.log(`\nTotal: ${totalDP.toLocaleString()} DP → ${totalChunks.toLocaleString()} chunks`);
  console.log(`Estimated cost: ~$${(totalChunks * 0.00001).toFixed(4)}\n`);

  // Phase 2: Embed + Upload in batches
  for (let i = 0; i < allChunks.length; i += EMBED_BATCH) {
    const batch = allChunks.slice(i, i + EMBED_BATCH);
    const texts = batch.map(c => c.text);

    try {
      const embeddings = await embedBatch(texts);

      // Create Supabase rows
      const rows = batch.map((chunk, idx) => ({
        content: chunk.text,
        embedding: embeddings[idx],
        metadata: chunk.metadata,
      }));

      // Upload in smaller batches
      for (let j = 0; j < rows.length; j += UPLOAD_BATCH) {
        const uploadSlice = rows.slice(j, j + UPLOAD_BATCH);
        await uploadBatch(uploadSlice);
        totalUploaded += uploadSlice.length;
        await sleep(DELAY_MS);
      }

      const pct = ((i + batch.length) / allChunks.length * 100).toFixed(1);
      process.stdout.write(`\r  Embedded: ${totalUploaded.toLocaleString()}/${totalChunks.toLocaleString()} (${pct}%)`);
    } catch (err) {
      console.log(`\n  ERROR at batch ${i}: ${err.message}`);
      await sleep(2000); // Wait and retry
      try {
        const embeddings = await embedBatch(texts);
        const rows = batch.map((chunk, idx) => ({
          content: chunk.text,
          embedding: embeddings[idx],
          metadata: chunk.metadata,
        }));
        for (let j = 0; j < rows.length; j += UPLOAD_BATCH) {
          await uploadBatch(rows.slice(j, j + UPLOAD_BATCH));
          totalUploaded += rows.slice(j, j + UPLOAD_BATCH).length;
          await sleep(DELAY_MS);
        }
      } catch (retryErr) {
        console.log(`  RETRY FAILED: ${retryErr.message}`);
      }
    }
  }

  console.log(`\n\n=== COMPLETE ===`);
  console.log(`Data points processed: ${totalDP.toLocaleString()}`);
  console.log(`Chunks created: ${totalChunks.toLocaleString()}`);
  console.log(`Uploaded to Supabase: ${totalUploaded.toLocaleString()}`);
}

main().catch(console.error);
