/**
 * Embed + Upload Cultural Data to Supabase pgvector
 * --------------------------------------------------
 * 1. Reads all JSON files from data/cultural/ (recursively)
 * 2. Extracts data points with context strings
 * 3. Embeds via OpenAI text-embedding-3-small (512 dim)
 * 4. Uploads to Supabase pgvector table
 *
 * Usage: node scripts/embed-cultural-data.mjs
 * Env: OPENAI_API_KEY + SUPABASE_URL + SUPABASE_SERVICE_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CULTURAL_DIR = path.join(ROOT, 'data', 'cultural');
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
if (!SUPABASE_KEY) { console.error('Missing SUPABASE key (service role or anon)'); process.exit(1); }

const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIM = 512;
const EMBED_BATCH = 100; // OpenAI supports up to 2048 inputs per call
const UPLOAD_BATCH = 10;
const TABLE = 'simulator_embeddings'; // existing Supabase table

// ---------------------------------------------------------------------------
// Collect all data points
// ---------------------------------------------------------------------------
function collectDataPoints(dir) {
  const points = [];
  const files = [];

  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.json') && !entry.name.startsWith('_') && entry.name !== 'summary.json' && entry.name !== 'meta.json') {
        files.push(full);
      }
    }
  }
  walk(dir);

  for (const f of files) {
    try {
      const d = JSON.parse(fs.readFileSync(f, 'utf-8'));
      const dp = d.dataPoints || (Array.isArray(d) ? d : []);
      const source = path.relative(CULTURAL_DIR, f);
      for (const p of dp) {
        // Build embedding text from context + key fields
        const text = [
          p.context,
          p.country ? `Country: ${p.country}` : '',
          p.metric ? `Metric: ${p.metric}` : '',
          p.indicator ? `Indicator: ${p.indicator}` : '',
          p.source ? `Source: ${p.source}` : '',
          p.year ? `Year: ${p.year}` : '',
          `Value: ${p.value}`,
        ].filter(Boolean).join('. ');

        if (text.length > 20) {
          points.push({
            id: p.id || `${source}-${points.length}`,
            text,
            metadata: {
              country: p.country || p.countryCode || 'unknown',
              metric: p.metric || p.indicator || p.indicator_name || '',
              value: p.value,
              year: p.year || 0,
              source: p.source || 'World Bank',
              file: source,
            },
          });
        }
      }
    } catch { /* skip */ }
  }
  return points;
}

// ---------------------------------------------------------------------------
// Embed via OpenAI
// ---------------------------------------------------------------------------
async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: EMBED_MODEL, input: texts, dimensions: EMBED_DIM }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embed error ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.data.map(d => d.embedding);
}

// ---------------------------------------------------------------------------
// Upload to Supabase
// ---------------------------------------------------------------------------
async function uploadBatch(rows) {
  // Map to simulator_embeddings schema: id, file, category, text, embedding
  const mapped = rows.map((r, i) => ({
    id: r.metadata?.country ? `cultural-${r.metadata.country.toLowerCase().replace(/\s+/g,'-')}-${r.metadata.metric?.slice(0,30) || 'dp'}-${Date.now()}-${i}` : `cultural-${Date.now()}-${i}`,
    file: r.metadata?.file || 'cultural-data',
    category: `cultural-${r.metadata?.country?.toLowerCase().replace(/\s+/g,'-') || 'general'}`,
    text: r.content,
    embedding: `[${r.embedding.join(',')}]`,
  }));
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(mapped),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upload error ${res.status}: ${err}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Embed + Upload Cultural Data ===\n');

  // Collect
  const points = collectDataPoints(CULTURAL_DIR);
  console.log(`Collected ${points.length.toLocaleString()} data points from ${CULTURAL_DIR}\n`);

  if (points.length === 0) {
    console.log('No data points found. Exiting.');
    return;
  }

  // Embed in batches
  let embedded = 0;
  const allRows = [];

  for (let i = 0; i < points.length; i += EMBED_BATCH) {
    const batch = points.slice(i, i + EMBED_BATCH);
    const texts = batch.map(p => p.text);

    try {
      const embeddings = await embedBatch(texts);

      for (let j = 0; j < batch.length; j++) {
        allRows.push({
          content: batch[j].text,
          embedding: embeddings[j],
          metadata: batch[j].metadata,
        });
      }

      embedded += batch.length;
      if (embedded % 500 === 0 || i + EMBED_BATCH >= points.length) {
        console.log(`  Embedded ${embedded.toLocaleString()} / ${points.length.toLocaleString()}`);
      }
    } catch (err) {
      console.error(`  [ERROR] Embed batch ${i}: ${err.message}`);
      // Wait and retry once
      await new Promise(r => setTimeout(r, 5000));
      try {
        const embeddings = await embedBatch(texts);
        for (let j = 0; j < batch.length; j++) {
          allRows.push({
            content: batch[j].text,
            embedding: embeddings[j],
            metadata: batch[j].metadata,
          });
        }
        embedded += batch.length;
      } catch (err2) {
        console.error(`  [FAIL] Batch ${i} skipped: ${err2.message}`);
      }
    }

    // Small delay to respect rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\nEmbedded ${embedded.toLocaleString()} data points. Uploading to Supabase...\n`);

  // Upload in batches
  let uploaded = 0;
  for (let i = 0; i < allRows.length; i += UPLOAD_BATCH) {
    const batch = allRows.slice(i, i + UPLOAD_BATCH);
    try {
      await uploadBatch(batch);
      uploaded += batch.length;
      if (uploaded % 500 === 0 || i + UPLOAD_BATCH >= allRows.length) {
        console.log(`  Uploaded ${uploaded.toLocaleString()} / ${allRows.length.toLocaleString()}`);
      }
    } catch (err) {
      console.error(`  [ERROR] Upload batch ${i}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n=== Complete ===`);
  console.log(`Embedded: ${embedded.toLocaleString()}`);
  console.log(`Uploaded: ${uploaded.toLocaleString()}`);
  console.log(`Table: ${TABLE}`);
  console.log(`Dimensions: ${EMBED_DIM}`);
}

main().catch(console.error);
