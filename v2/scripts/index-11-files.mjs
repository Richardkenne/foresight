#!/usr/bin/env node
/**
 * Index 11 JSON files into Supabase RAG (simulator_embeddings)
 * - Small upsert batches (5 rows) to avoid Supabase free tier timeouts
 * - 200ms delay between upserts
 * - Retry logic (3 attempts with backoff)
 * - Sacred-texts-patterns: special chunking for text-heavy entries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// Load .env.local manually
const envPath = path.join(ROOT, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) continue;
  const key = trimmed.substring(0, eqIdx);
  const val = trimmed.substring(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DATA_DIR = path.join(ROOT, 'data');

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error('Missing env vars.');
  process.exit(1);
}

// Accept file names from CLI args, or use default list
const cliFiles = process.argv.slice(2);
const FILES = cliFiles.length > 0 ? cliFiles : [
  'sacred-texts-patterns',
  'sales-outreach-data',
  'scaling-bottlenecks',
  'social-dynamics-influence',
  'tech-adoption',
  'trust-secrets-betrayal',
  'twitter-x-behavior',
  'youtube-guru-funnel-data',
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ─── Chunking ───

function chunkNestedDict(data, fileName) {
  const chunks = [];

  function processValue(key, val, prefix) {
    if (!val || typeof val !== 'object') {
      if (typeof val === 'number' || (typeof val === 'string' && /\d/.test(val))) {
        chunks.push({
          id: `${fileName}:${prefix}:${key}`,
          file: fileName,
          category: prefix.split('/')[0] || fileName,
          text: `${prefix}/${key.replace(/_/g, ' ')}: ${val}`.substring(0, 500),
        });
      }
      return;
    }
    const obj = val;
    if ('value' in obj || 'low' in obj || 'pct' in obj || 'avg_low' in obj) {
      const v = obj.value ?? obj.pct ?? (obj.low && obj.high ? `${obj.low}-${obj.high}` : obj.avg_low && obj.avg_high ? `${obj.avg_low}-${obj.avg_high}` : obj.low);
      const src = (obj.source || obj.note || '');
      const text = `${prefix}/${key.replace(/_/g, ' ')}: ${v}${src ? ` (${src})` : ''}`;
      chunks.push({ id: `${fileName}:${prefix}:${key}`, file: fileName, category: prefix.split('/')[0] || fileName, text: text.substring(0, 500) });
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < Math.min(obj.length, 200); i++) {
        const entry = obj[i];
        if (entry && typeof entry === 'object') {
          const e = entry;
          if (e.metric && e.value != null) {
            const text = `${e.metric}: ${e.value}${e.unit ? ' ' + e.unit : ''} (${e.source || fileName})`;
            chunks.push({ id: `${fileName}:${prefix}:${key}:${i}`, file: fileName, category: prefix.split('/')[0] || fileName, text: text.substring(0, 500) });
          } else {
            // Text-heavy entries (like sacred-texts): concat key fields
            const parts = Object.entries(e).filter(([k]) => !k.startsWith('_') && k !== 'evergreen').slice(0, 6).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
            const text = parts.join(', ');
            if (text.length > 15) {
              chunks.push({ id: `${fileName}:${prefix}:${key}:${i}`, file: fileName, category: prefix.split('/')[0] || fileName, text: text.substring(0, 500) });
            }
          }
        }
      }
    } else {
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith('_') || k === 'source' || k === 'note' || k === 'description') continue;
        processValue(k, v, `${prefix}/${key}`);
      }
    }
  }

  for (const [topKey, topVal] of Object.entries(data)) {
    if (topKey.startsWith('_') || topKey === 'meta' || topKey === 'metadata') continue;
    if (Array.isArray(topVal)) {
      for (let i = 0; i < Math.min(topVal.length, 200); i++) {
        const entry = topVal[i];
        if (entry && typeof entry === 'object') {
          const parts = Object.entries(entry).filter(([k]) => !k.startsWith('_')).slice(0, 6).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
          const text = parts.join(', ');
          if (text.length > 15) chunks.push({ id: `${fileName}:${topKey}:${i}`, file: fileName, category: topKey, text: text.substring(0, 500) });
        }
      }
    } else {
      processValue(topKey, topVal, fileName);
    }
  }
  return chunks;
}

function chunkFile(filePath) {
  const fileName = path.basename(filePath, '.json');
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(raw)) {
      return raw.slice(0, 200).map((entry, i) => {
        if (!entry || typeof entry !== 'object') return null;
        const parts = Object.entries(entry).filter(([k]) => !k.startsWith('_')).slice(0, 6).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
        return { id: `${fileName}:list:${i}`, file: fileName, category: 'list', text: parts.join(', ').substring(0, 500) };
      }).filter(Boolean);
    }
    return chunkNestedDict(raw, fileName);
  } catch (e) {
    console.error(`Error chunking ${filePath}:`, e.message);
    return [];
  }
}

// ─── Embedding ───

async function embedBatch(texts) {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: texts, dimensions: 512 }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`OpenAI error: ${json.error.message}`);
  return json.data.map(e => e.embedding);
}

// ─── Supabase upsert with retry ───

async function uploadToSupabase(rows, attempt = 1) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows.map(r => ({ ...r, embedding: `[${r.embedding.join(',')}]` }))),
  });
  if (!res.ok) {
    const err = await res.text();
    if (attempt < 3 && (err.includes('timeout') || err.includes('57014'))) {
      console.log(`    Retry ${attempt}/3 after timeout...`);
      await sleep(2000 * attempt);
      return uploadToSupabase(rows, attempt + 1);
    }
    throw new Error(`Supabase upload failed: ${res.status} ${err}`);
  }
}

// ─── Main ───

async function indexFile(fileName) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  console.log(`\n--- ${fileName} ---`);

  const chunks = chunkFile(filePath);

  const seen = new Set();
  const unique = chunks.filter(c => {
    const key = c.text.substring(0, 200);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const capped = unique.slice(0, 1000);
  console.log(`  Chunks: ${chunks.length} raw -> ${capped.length} unique`);

  if (capped.length === 0) {
    console.log('  SKIP: no chunks');
    return 0;
  }

  let uploaded = 0;
  const EMBED_BATCH = 50;  // smaller embedding batches
  const UPSERT_BATCH = 5;  // much smaller upserts to avoid timeouts

  for (let i = 0; i < capped.length; i += EMBED_BATCH) {
    const batch = capped.slice(i, i + EMBED_BATCH);

    const embeddings = await embedBatch(batch.map(c => c.text));
    const rows = batch.map((c, j) => ({ ...c, embedding: embeddings[j] }));

    for (let s = 0; s < rows.length; s += UPSERT_BATCH) {
      await uploadToSupabase(rows.slice(s, s + UPSERT_BATCH));
      await sleep(150);  // breathing room for free tier
    }

    uploaded += batch.length;
    process.stdout.write(`  Progress: ${uploaded}/${capped.length}\r`);
  }

  console.log(`  Done: ${uploaded} chunks indexed                `);
  return uploaded;
}

async function main() {
  console.log(`Indexing ${FILES.length} remaining files into Supabase RAG...`);
  console.log(`(3 files already done: side-hustle-entrepreneurship, social-proof-mechanics, time-to-result-benchmarks)\n`);

  let totalChunks = 0;
  const results = [];

  for (const file of FILES) {
    try {
      const count = await indexFile(file);
      totalChunks += count;
      results.push({ file, chunks: count, status: 'ok' });
    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      results.push({ file, chunks: 0, status: 'error' });
    }
  }

  console.log('\n=== SUMMARY ===');
  for (const r of results) {
    console.log(`  ${r.status === 'ok' ? 'OK' : 'FAIL'} ${r.file}: ${r.chunks} chunks`);
  }
  console.log(`\nTotal new: ${totalChunks} chunks`);
  console.log(`Previously indexed: ~2998 chunks`);
  console.log(`Grand total: ~${totalChunks + 2998} chunks`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
