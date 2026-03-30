import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import https from 'https';

/**
 * Auto-Indexing API — indexes new/updated data files into Supabase pgvector
 *
 * Called by Vercel Cron (nightly) or manually via POST.
 * Compares local data/ files against what's already in Supabase,
 * only indexes the DELTA (new files or files with more data).
 *
 * Cost: ~$0.001 per 100 chunks (OpenAI embeddings)
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const SKIP_FILES = ['source-authority.json', 'api-databases.json', 'embeddings.json', 'sacred-index.json'];
const CRON_SECRET = process.env.CRON_SECRET || '';

interface DataChunk {
  id: string;
  file: string;
  text: string;
  category: string;
}

// ─── Chunking (handles all JSON formats in data/) ───

function chunkNestedDict(data: Record<string, unknown>, fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];

  function processValue(key: string, val: unknown, prefix: string) {
    if (!val || typeof val !== 'object') {
      if (typeof val === 'number' || (typeof val === 'string' && /\d/.test(val))) {
        chunks.push({ id: `${fileName}:${prefix}:${key}`, file: fileName, category: prefix.split('/')[0] || fileName, text: `${prefix}/${key.replace(/_/g, ' ')}: ${val}`.substring(0, 500) });
      }
      return;
    }
    const obj = val as Record<string, unknown>;
    // Leaf node with value/low/high
    if ('value' in obj || 'low' in obj || 'pct' in obj || 'avg_low' in obj) {
      const v = obj.value ?? obj.pct ?? (obj.low && obj.high ? `${obj.low}-${obj.high}` : obj.avg_low && obj.avg_high ? `${obj.avg_low}-${obj.avg_high}` : obj.low);
      const src = (obj.source || obj.note || '') as string;
      const text = `${prefix}/${key.replace(/_/g, ' ')}: ${v}${src ? ` (${src})` : ''}`;
      chunks.push({ id: `${fileName}:${prefix}:${key}`, file: fileName, category: prefix.split('/')[0] || fileName, text: text.substring(0, 500) });
    } else if (Array.isArray(obj)) {
      // Array of entries
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
      // Recurse deeper
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

// ─── Embedding ───

function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');
  const body = JSON.stringify({ model: 'text-embedding-3-small', input: texts, dimensions: 512 });
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com', path: '/v1/embeddings', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          resolve(j.data.map((e: { embedding: number[] }) => e.embedding));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Supabase ───

async function getExistingFiles(): Promise<Record<string, number>> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_file_counts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    body: '{}',
  });
  // Fallback: direct query if RPC doesn't exist
  if (!res.ok) {
    const res2 = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings?select=file&limit=50000`, {
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
    });
    if (!res2.ok) return {};
    const rows = await res2.json() as { file: string }[];
    const counts: Record<string, number> = {};
    for (const r of rows) { counts[r.file] = (counts[r.file] || 0) + 1; }
    return counts;
  }
  const data = await res.json() as { file: string; count: number }[];
  const counts: Record<string, number> = {};
  for (const d of data) counts[d.file] = d.count;
  return counts;
}

async function uploadToSupabase(rows: { id: string; file: string; category: string; text: string; embedding: number[] }[]): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows.map(r => ({ ...r, embedding: `[${r.embedding.join(',')}]` }))),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} ${err}`);
  }
}

// ─── Main handler ───

export async function POST(req: NextRequest) {
  // Auth: cron secret or manual trigger
  const authHeader = req.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!SUPABASE_KEY || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'Missing keys' }, { status: 500 });
    }

    // 1. Get existing file counts from Supabase
    const existing = await getExistingFiles();
    console.log('[index-data] Existing files in Supabase:', Object.keys(existing).length);

    // 2. Chunk all local data files
    const localFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !SKIP_FILES.includes(f));
    const toIndex: { file: string; chunks: DataChunk[] }[] = [];

    for (const file of localFiles) {
      const fileName = file.replace('.json', '');
      const chunks = chunkFile(path.join(DATA_DIR, file));
      const existingCount = existing[fileName] || 0;

      // Index if: new file OR local has significantly more chunks
      if (existingCount === 0 || chunks.length > existingCount * 1.2) {
        toIndex.push({ file: fileName, chunks });
        console.log(`[index-data] Will index: ${fileName} (${chunks.length} chunks, was ${existingCount})`);
      }
    }

    if (toIndex.length === 0) {
      return NextResponse.json({ message: 'All files up to date', files_checked: localFiles.length });
    }

    // 3. Embed + upload each file
    let totalUploaded = 0;
    const results: { file: string; chunks: number }[] = [];

    for (const { file, chunks } of toIndex) {
      // Deduplicate
      const seen = new Set<string>();
      const uniqueChunks = chunks.filter(c => {
        const key = c.text.substring(0, 200);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Cap per file
      const capped = uniqueChunks.slice(0, 1000);
      let fileUploaded = 0;

      for (let i = 0; i < capped.length; i += 100) {
        const batch = capped.slice(i, i + 100);
        const embeddings = await embedBatch(batch.map(c => c.text));
        const rows = batch.map((c, j) => ({ ...c, embedding: embeddings[j] }));

        for (let s = 0; s < rows.length; s += 20) {
          await uploadToSupabase(rows.slice(s, s + 20));
        }
        fileUploaded += batch.length;
      }

      totalUploaded += fileUploaded;
      results.push({ file, chunks: fileUploaded });
      console.log(`[index-data] Indexed ${file}: ${fileUploaded} chunks`);
    }

    return NextResponse.json({
      message: `Indexed ${toIndex.length} files, ${totalUploaded} total chunks`,
      files: results,
    });
  } catch (e) {
    console.error('[index-data] Error:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

// GET = same as POST (for Vercel Cron which sends GET)
export async function GET(req: NextRequest) {
  return POST(req);
}
