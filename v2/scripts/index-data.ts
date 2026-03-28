/**
 * RAG Indexing Script — Supabase pgvector
 * Chunks all JSON data files → embeds with OpenAI → uploads to Supabase
 *
 * Run: npx tsx scripts/index-data.ts
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const DATA_DIR = path.join(process.cwd(), 'data');
const SKIP_FILES = ['source-authority.json', 'api-databases.json', 'embeddings.json'];
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 100;

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

interface DataChunk {
  id: string;
  file: string;
  text: string;
  category: string;
}

// ============ CHUNKING (same as before) ============

function chunkSectionsFormat(data: Record<string, unknown>, fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];
  const sections = data.sections as Record<string, unknown[]> | undefined;
  if (!sections) return chunks;
  for (const [secName, entries] of Object.entries(sections)) {
    if (!Array.isArray(entries)) continue;
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!e || typeof e !== 'object') continue;
      const entry = e as Record<string, unknown>;
      const text = entry.metric
        ? `${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || fileName}, ${entry.year || ''})`
        : Object.entries(entry).filter(([k]) => !k.startsWith('_')).map(([k, v]) => `${k}: ${v}`).join(', ');
      if (text.length > 10) chunks.push({ id: `${fileName}:${secName}:${i}`, file: fileName, text, category: secName });
    }
  }
  return chunks;
}

function chunkArchetypesFormat(data: Record<string, unknown>, fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];
  const archetypes = data.archetypes as Record<string, Record<string, unknown>> | undefined;
  if (!archetypes) return chunks;
  for (const [archName, arch] of Object.entries(archetypes)) {
    const stages = arch.stages as { id: string; label: string; prob: number; time: string; source: string }[] | undefined;
    if (!stages) continue;
    chunks.push({ id: `${fileName}:${archName}:desc`, file: fileName, text: `Archetype: ${arch.name || archName}. ${arch.description || ''}. Entry: ${arch.entry_point || ''}. End-to-end: ${arch.cumulative_end_to_end || arch.end_to_end_conversion || ''}`, category: archName });
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      chunks.push({ id: `${fileName}:${archName}:stage${i}`, file: fileName, text: `${arch.name || archName} stage: ${s.label} — probability: ${s.prob}%, time: ${s.time}, source: ${s.source}`, category: archName });
    }
  }
  return chunks;
}

function chunkListFormat(data: unknown[], fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];
  const maxEntries = fileName.startsWith('worldbank-') || fileName.startsWith('bls-') ? 50
    : fileName.startsWith('sacred-batch-') ? 100 : 500;
  const subset = data.length > maxEntries ? data.slice(-maxEntries) : data;
  for (let i = 0; i < subset.length; i++) {
    const item = subset[i];
    if (!item || typeof item !== 'object') continue;
    const entry = item as Record<string, unknown>;
    let text = '';
    if (entry.series_name && entry.value != null) {
      text = `${entry.series_name} (${entry.year || ''}${entry.period ? '-' + entry.period : ''}): ${entry.value} (${entry.source || 'BLS'})`;
    } else if (entry.indicator && entry.country && entry.value != null) {
      text = `${entry.country} ${entry.indicator} (${entry.year || ''}): ${entry.value} (${entry.source || 'World Bank'})`;
    } else if (entry.data_entry) {
      text = `${entry.data_entry} (${entry.data_source || entry.source || ''})`;
    } else if (entry.metric && entry.value != null) {
      text = `${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || fileName}, ${entry.year || ''})`;
    } else {
      const parts = Object.entries(entry).filter(([k]) => !k.startsWith('_')).filter(([, v]) => typeof v === 'number' || typeof v === 'string').slice(0, 6).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
      text = parts.join(', ');
    }
    if (text.length > 15) chunks.push({ id: `${fileName}:list:${i}`, file: fileName, text, category: 'list' });
  }
  return chunks;
}

function chunkNestedDict(data: Record<string, unknown>, fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];
  for (const [topKey, topVal] of Object.entries(data)) {
    if (topKey.startsWith('_') || topKey === 'meta' || topKey === 'metadata') continue;
    if (!topVal || typeof topVal !== 'object' || Array.isArray(topVal)) continue;
    const topic = topVal as Record<string, unknown>;
    if (Array.isArray(topic.data)) {
      for (let i = 0; i < (topic.data as unknown[]).length; i++) {
        const entry = (topic.data as Record<string, unknown>[])[i];
        if (entry?.metric && entry?.value != null) {
          chunks.push({ id: `${fileName}:${topKey}:${i}`, file: fileName, text: `${topKey}/${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || fileName}, ${entry.year || ''})`, category: topKey });
        }
      }
      continue;
    }
    for (const [subKey, subVal] of Object.entries(topic)) {
      if (subKey.startsWith('_')) continue;
      if (subVal && typeof subVal === 'object' && !Array.isArray(subVal) && 'value' in (subVal as Record<string, unknown>)) {
        const sv = subVal as Record<string, unknown>;
        chunks.push({ id: `${fileName}:${topKey}:${subKey}`, file: fileName, text: `${topKey}/${subKey.replace(/_/g, ' ')}: ${sv.value}${sv.unit ? ' ' + sv.unit : ''} (${sv.source || fileName}, ${sv.year || ''})`, category: topKey });
      } else if (typeof subVal === 'number' || (typeof subVal === 'string' && /\d/.test(subVal as string))) {
        chunks.push({ id: `${fileName}:${topKey}:${subKey}`, file: fileName, text: `${topKey}/${subKey.replace(/_/g, ' ')}: ${subVal}`, category: topKey });
      }
    }
  }
  return chunks;
}

function chunkFile(filePath: string): DataChunk[] {
  const fileName = path.basename(filePath, '.json');
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (Array.isArray(raw)) return chunkListFormat(raw, fileName);
  if (raw.sections) return chunkSectionsFormat(raw, fileName);
  if (raw.archetypes) return chunkArchetypesFormat(raw, fileName);
  return chunkNestedDict(raw, fileName);
}

// ============ EMBEDDING ============

async function embedBatch(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts });
  return response.data.map(d => d.embedding);
}

// ============ SUPABASE UPLOAD ============

async function uploadToSupabase(rows: { id: string; file: string; category: string; text: string; embedding: number[] }[]): Promise<void> {
  // Use Supabase REST API to insert rows
  const response = await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows.map(r => ({
      id: r.id,
      file: r.file,
      category: r.category,
      text: r.text,
      embedding: `[${r.embedding.join(',')}]`,
    }))),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} ${err}`);
  }
}

// ============ MAIN ============

async function main() {
  if (!SUPABASE_KEY) {
    console.error('Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 1. Chunk all files
  console.log('Chunking data files...');
  let allChunks: DataChunk[] = [];
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !SKIP_FILES.includes(f));

  for (const file of files) {
    const chunks = chunkFile(path.join(DATA_DIR, file));
    allChunks.push(...chunks);
    console.log(`  ${file}: ${chunks.length} chunks`);
  }
  console.log(`\nTotal chunks: ${allChunks.length}`);

  // 2. Deduplicate
  const seen = new Set<string>();
  allChunks = allChunks.filter(c => {
    const key = c.text.substring(0, 200);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(c => ({ ...c, text: c.text.substring(0, 500) }));

  // 3. Cap at 10K (prioritize probability/deep files)
  const MAX_CHUNKS = 10000;
  if (allChunks.length > MAX_CHUNKS) {
    allChunks.sort((a, b) => {
      const aScore = (a.file.includes('probab') || a.file.includes('deep') || a.file.includes('survival')) ? 1 : 0;
      const bScore = (b.file.includes('probab') || b.file.includes('deep') || b.file.includes('survival')) ? 1 : 0;
      return bScore - aScore;
    });
    allChunks.length = MAX_CHUNKS;
  }
  console.log(`Final chunks: ${allChunks.length}`);

  // 4. Clear existing data
  console.log('\nClearing existing embeddings...');
  await fetch(`${SUPABASE_URL}/rest/v1/simulator_embeddings?id=neq.impossible`, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
  });

  // 5. Embed + upload in batches
  console.log('Embedding + uploading to Supabase...');
  let uploaded = 0;

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.text);

    try {
      const embeddings = await embedBatch(openai, texts);
      const rows = batch.map((c, j) => ({ ...c, embedding: embeddings[j] }));

      // Upload to Supabase in smaller sub-batches (50 rows to avoid payload limits)
      for (let s = 0; s < rows.length; s += 50) {
        await uploadToSupabase(rows.slice(s, s + 50));
      }

      uploaded += batch.length;
      process.stdout.write(`  ${uploaded}/${allChunks.length} (${((uploaded / allChunks.length) * 100).toFixed(0)}%)\r`);
    } catch (err) {
      console.error(`\n  Error on batch ${Math.floor(i / BATCH_SIZE)}:`, err);
    }
  }

  console.log(`\nDone! ${uploaded} entries embedded and uploaded to Supabase.`);
}

main().catch(console.error);
