/**
 * Re-index missing data files into Supabase pgvector
 *
 * 1. Lists all JSON files in data/
 * 2. Queries Supabase to find which files are already indexed
 * 3. Indexes only the missing ones via the index-data API route
 *    (or direct Supabase insertion using the same chunking logic)
 *
 * Processes files in batches of 5, retries once on timeout, then skips.
 *
 * Run: npx tsx scripts/reindex-missing.ts
 * Dry run: DRY_RUN=1 npx tsx scripts/reindex-missing.ts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const DATA_DIR = path.join(process.cwd(), 'data');
const SKIP_FILES = ['source-authority.json', 'api-databases.json', 'embeddings.json', 'sacred-index.json'];
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBED_BATCH_SIZE = 100;
const FILE_BATCH_SIZE = 5;
const DRY_RUN = process.env.DRY_RUN === '1';

interface DataChunk {
  id: string;
  file: string;
  text: string;
  category: string;
}

// --- Chunking (same logic as index-data route) ---

function chunkNestedDict(data: Record<string, unknown>, fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];

  function processValue(key: string, val: unknown, prefix: string) {
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
    const obj = val as Record<string, unknown>;
    if ('value' in obj || 'low' in obj || 'pct' in obj || 'avg_low' in obj) {
      const v = obj.value ?? obj.pct ?? (obj.low && obj.high ? `${obj.low}-${obj.high}` : obj.avg_low && obj.avg_high ? `${obj.avg_low}-${obj.avg_high}` : obj.low);
      const src = (obj.source || obj.note || '') as string;
      const text = `${prefix}/${key.replace(/_/g, ' ')}: ${v}${src ? ` (${src})` : ''}`;
      chunks.push({ id: `${fileName}:${prefix}:${key}`, file: fileName, category: prefix.split('/')[0] || fileName, text: text.substring(0, 500) });
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < Math.min(obj.length, 200); i++) {
        const entry = obj[i];
        if (entry && typeof entry === 'object') {
          const e = entry as Record<string, unknown>;
          if (e.metric && e.value != null) {
            const text = `${e.metric}: ${e.value}${e.unit ? ' ' + e.unit : ''} (${e.source || fileName})`;
            chunks.push({ id: `${fileName}:${prefix}:${key}:${i}`, file: fileName, category: prefix.split('/')[0] || fileName, text: text.substring(0, 500) });
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
          const e = entry as Record<string, unknown>;
          const parts = Object.entries(e).filter(([k]) => !k.startsWith('_')).slice(0, 6).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
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

function chunkFile(filePath: string): DataChunk[] {
  const fileName = path.basename(filePath, '.json');
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(raw)) {
      return raw.slice(0, 200).map((entry, i) => {
        if (!entry || typeof entry !== 'object') return null;
        const parts = Object.entries(entry as Record<string, unknown>).filter(([k]) => !k.startsWith('_')).slice(0, 6).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
        return { id: `${fileName}:list:${i}`, file: fileName, category: 'list', text: parts.join(', ').substring(0, 500) };
      }).filter(Boolean) as DataChunk[];
    }
    return chunkNestedDict(raw, fileName);
  } catch {
    return [];
  }
}

// --- Supabase helpers ---

async function getIndexedFiles(): Promise<Record<string, number>> {
  // Try RPC first
  const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_file_counts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    body: '{}',
  });

  if (rpcRes.ok) {
    const data = (await rpcRes.json()) as { file: string; count: number }[];
    const counts: Record<string, number> = {};
    for (const d of data) counts[d.file] = d.count;
    return counts;
  }

  // Fallback: direct query
  const res = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings?select=file&limit=50000`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) {
    console.error(`Failed to query Supabase: ${res.status} ${await res.text()}`);
    return {};
  }
  const rows = (await res.json()) as { file: string }[];
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.file] = (counts[r.file] || 0) + 1;
  return counts;
}

async function embedBatch(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts, dimensions: 512 });
  return response.data.map((d) => d.embedding);
}

async function uploadToSupabase(rows: { id: string; file: string; category: string; text: string; embedding: number[] }[]): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows.map((r) => ({ ...r, embedding: `[${r.embedding.join(',')}]` }))),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} ${err}`);
  }
}

// --- Index a single file with retry ---

async function indexFile(openai: OpenAI, filePath: string, attempt = 1): Promise<{ file: string; chunks: number; status: 'ok' | 'skipped' | 'error'; error?: string }> {
  const fileName = path.basename(filePath, '.json');
  const TIMEOUT_MS = 60_000;

  try {
    const chunks = chunkFile(filePath);
    if (chunks.length === 0) {
      return { file: fileName, chunks: 0, status: 'skipped', error: 'no chunks produced' };
    }

    // Deduplicate
    const seen = new Set<string>();
    const unique = chunks.filter((c) => {
      const key = c.text.substring(0, 200);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const capped = unique.slice(0, 1000);

    let uploaded = 0;
    for (let i = 0; i < capped.length; i += EMBED_BATCH_SIZE) {
      const batch = capped.slice(i, i + EMBED_BATCH_SIZE);

      // Wrap embedding call with timeout
      const embedPromise = embedBatch(openai, batch.map((c) => c.text));
      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Embedding timeout')), TIMEOUT_MS));
      const embeddings = await Promise.race([embedPromise, timeoutPromise]);

      const rows = batch.map((c, j) => ({ ...c, embedding: embeddings[j] }));
      for (let s = 0; s < rows.length; s += 20) {
        await uploadToSupabase(rows.slice(s, s + 20));
      }
      uploaded += batch.length;
    }

    return { file: fileName, chunks: uploaded, status: 'ok' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (attempt < 2) {
      console.log(`  [retry] ${fileName} failed (${msg}), retrying...`);
      return indexFile(openai, filePath, attempt + 1);
    }
    return { file: fileName, chunks: 0, status: 'error', error: msg };
  }
}

// --- Main ---

async function main() {
  if (!SUPABASE_KEY) {
    console.error('ERROR: Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY && !DRY_RUN) {
    console.error('ERROR: Set OPENAI_API_KEY in .env.local');
    process.exit(1);
  }

  console.log('=== Reindex Missing Files ===\n');

  // 1. List all local JSON files (excluding skipped)
  const allFiles = fs.readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json') && !SKIP_FILES.includes(f))
    .sort();

  console.log(`Local data files: ${allFiles.length}`);

  // 2. Query Supabase for indexed files
  console.log('Querying Supabase for existing index...');
  const indexed = await getIndexedFiles();
  const indexedFileNames = new Set(Object.keys(indexed));
  console.log(`Indexed files in Supabase: ${indexedFileNames.size}\n`);

  // 3. Find missing files
  const missing: string[] = [];
  for (const f of allFiles) {
    const name = f.replace('.json', '');
    if (!indexedFileNames.has(name)) {
      missing.push(f);
    }
  }

  console.log(`Missing files (not indexed): ${missing.length}`);
  if (missing.length === 0) {
    console.log('All files are indexed. Nothing to do.');
    return;
  }

  console.log('Files to index:');
  for (const f of missing) {
    console.log(`  - ${f}`);
  }

  if (DRY_RUN) {
    console.log('\n[DRY RUN] Would index the above files. Set DRY_RUN=0 or remove DRY_RUN to actually index.');
    return;
  }

  // 4. Index in batches of FILE_BATCH_SIZE
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const results: { file: string; chunks: number; status: string; error?: string }[] = [];

  for (let b = 0; b < missing.length; b += FILE_BATCH_SIZE) {
    const batch = missing.slice(b, b + FILE_BATCH_SIZE);
    console.log(`\n--- Batch ${Math.floor(b / FILE_BATCH_SIZE) + 1}/${Math.ceil(missing.length / FILE_BATCH_SIZE)} ---`);

    const batchResults = await Promise.all(
      batch.map((f) => {
        console.log(`  Indexing: ${f}`);
        return indexFile(openai, path.join(DATA_DIR, f));
      })
    );

    results.push(...batchResults);
  }

  // 5. Report
  console.log('\n=== Results ===\n');
  const ok = results.filter((r) => r.status === 'ok');
  const skipped = results.filter((r) => r.status === 'skipped');
  const errors = results.filter((r) => r.status === 'error');

  console.log(`Succeeded: ${ok.length}`);
  for (const r of ok) console.log(`  [OK] ${r.file} (${r.chunks} chunks)`);

  if (skipped.length > 0) {
    console.log(`\nSkipped: ${skipped.length}`);
    for (const r of skipped) console.log(`  [SKIP] ${r.file} -- ${r.error}`);
  }

  if (errors.length > 0) {
    console.log(`\nFailed: ${errors.length}`);
    for (const r of errors) console.log(`  [FAIL] ${r.file} -- ${r.error}`);
  }

  const totalChunks = results.reduce((sum, r) => sum + r.chunks, 0);
  console.log(`\nTotal chunks indexed: ${totalChunks}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
