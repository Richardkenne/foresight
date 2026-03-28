/**
 * RAG Indexing Script
 * Chunks all JSON data files → embeds with OpenAI → saves to data/embeddings.json
 *
 * Run: npx tsx scripts/index-data.ts
 * Cost: ~$0.50 one-time for 114 files
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const DATA_DIR = path.join(process.cwd(), 'data');
const OUTPUT_FILE = path.join(DATA_DIR, 'embeddings.json');
const SKIP_FILES = ['source-authority.json', 'api-databases.json', 'embeddings.json'];
const EMBEDDING_MODEL = 'text-embedding-3-small';
const BATCH_SIZE = 100; // OpenAI allows up to 2048 per batch

interface DataChunk {
  id: string;        // unique ID: "filename:section:index"
  file: string;      // source file name
  text: string;      // the actual data point as readable text
  category: string;  // section/category name
}

interface EmbeddingEntry {
  id: string;
  file: string;
  text: string;
  category: string;
  embedding: number[];
}

// ============ CHUNKING ============

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
        : Object.entries(entry)
            .filter(([k]) => !k.startsWith('_'))
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
      if (text.length > 10) {
        chunks.push({ id: `${fileName}:${secName}:${i}`, file: fileName, text, category: secName });
      }
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
    // Add archetype description
    chunks.push({
      id: `${fileName}:${archName}:desc`,
      file: fileName,
      text: `Archetype: ${arch.name || archName}. ${arch.description || ''}. Entry: ${arch.entry_point || ''}. End-to-end: ${arch.cumulative_end_to_end || arch.end_to_end_conversion || ''}`,
      category: archName
    });
    // Add each stage
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      chunks.push({
        id: `${fileName}:${archName}:stage${i}`,
        file: fileName,
        text: `${arch.name || archName} stage: ${s.label} — probability: ${s.prob}%, time: ${s.time}, source: ${s.source}`,
        category: archName
      });
    }
  }
  return chunks;
}

function chunkListFormat(data: unknown[], fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];
  // Limit large lists (WorldBank 35K+, BLS 5K+) to most recent/relevant 200 entries
  const maxListEntries = fileName.startsWith('worldbank-') || fileName.startsWith('bls-') || fileName.startsWith('sacred-batch-') ? 200 : 2000;
  const subset = data.length > maxListEntries ? data.slice(-maxListEntries) : data; // last N = most recent
  for (let i = 0; i < subset.length; i++) {
    const item = data[i];
    if (!item || typeof item !== 'object') continue;
    const entry = item as Record<string, unknown>;

    let text = '';
    // BLS format
    if (entry.series_name && entry.value != null) {
      text = `${entry.series_name} (${entry.year || ''}${entry.period ? '-' + entry.period : ''}): ${entry.value} (${entry.source || 'BLS'})`;
    }
    // WorldBank format
    else if (entry.indicator && entry.country && entry.value != null) {
      text = `${entry.country} ${entry.indicator} (${entry.year || ''}): ${entry.value} (${entry.source || 'World Bank'})`;
    }
    // Sacred batch format
    else if (entry.data_entry) {
      text = `${entry.data_entry} (${entry.data_source || entry.source || ''})`;
    }
    // Generic metric format
    else if (entry.metric && entry.value != null) {
      text = `${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || fileName}, ${entry.year || ''})`;
    }
    // Fallback
    else {
      const parts = Object.entries(entry)
        .filter(([k]) => !k.startsWith('_'))
        .filter(([, v]) => typeof v === 'number' || typeof v === 'string')
        .slice(0, 6)
        .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`);
      text = parts.join(', ');
    }

    if (text.length > 15) {
      chunks.push({ id: `${fileName}:list:${i}`, file: fileName, text, category: 'list' });
    }
  }
  return chunks;
}

function chunkNestedDict(data: Record<string, unknown>, fileName: string): DataChunk[] {
  const chunks: DataChunk[] = [];

  for (const [topKey, topVal] of Object.entries(data)) {
    if (topKey.startsWith('_') || topKey === 'meta' || topKey === 'metadata') continue;
    if (!topVal || typeof topVal !== 'object' || Array.isArray(topVal)) continue;

    const topic = topVal as Record<string, unknown>;

    // Pattern: { data: [{ metric, value }] }
    if (Array.isArray(topic.data)) {
      for (let i = 0; i < (topic.data as unknown[]).length; i++) {
        const entry = (topic.data as Record<string, unknown>[])[i];
        if (entry?.metric && entry?.value != null) {
          chunks.push({
            id: `${fileName}:${topKey}:${i}`,
            file: fileName,
            text: `${topKey}/${entry.metric}: ${entry.value}${entry.unit ? ' ' + entry.unit : ''} (${entry.source || fileName}, ${entry.year || ''})`,
            category: topKey
          });
        }
      }
      continue;
    }

    // Pattern: nested key-value
    for (const [subKey, subVal] of Object.entries(topic)) {
      if (subKey.startsWith('_')) continue;

      if (subVal && typeof subVal === 'object' && !Array.isArray(subVal) && 'value' in (subVal as Record<string, unknown>)) {
        const sv = subVal as Record<string, unknown>;
        chunks.push({
          id: `${fileName}:${topKey}:${subKey}`,
          file: fileName,
          text: `${topKey}/${subKey.replace(/_/g, ' ')}: ${sv.value}${sv.unit ? ' ' + sv.unit : ''} (${sv.source || fileName}, ${sv.year || ''})`,
          category: topKey
        });
      } else if (typeof subVal === 'number' || (typeof subVal === 'string' && /\d/.test(subVal as string))) {
        chunks.push({
          id: `${fileName}:${topKey}:${subKey}`,
          file: fileName,
          text: `${topKey}/${subKey.replace(/_/g, ' ')}: ${subVal}`,
          category: topKey
        });
      }
    }
  }
  return chunks;
}

function chunkFile(filePath: string): DataChunk[] {
  const fileName = path.basename(filePath, '.json');
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Try each format in order
  if (Array.isArray(raw)) {
    return chunkListFormat(raw, fileName);
  }
  if (raw.sections) {
    return chunkSectionsFormat(raw, fileName);
  }
  if (raw.archetypes) {
    return chunkArchetypesFormat(raw, fileName);
  }
  // Nested dict (health-fitness, country-data, etc.)
  return chunkNestedDict(raw, fileName);
}

// ============ EMBEDDING ============

async function embedBatch(openai: OpenAI, texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map(d => d.embedding);
}

// ============ MAIN ============

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // 1. Chunk all files
  console.log('Chunking data files...');
  const allChunks: DataChunk[] = [];
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !SKIP_FILES.includes(f));

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const chunks = chunkFile(filePath);
    allChunks.push(...chunks);
    console.log(`  ${file}: ${chunks.length} chunks`);
  }

  console.log(`\nTotal chunks: ${allChunks.length}`);

  // 2. Deduplicate and limit text length
  const seen = new Set<string>();
  const uniqueChunks = allChunks.filter(c => {
    const key = c.text.substring(0, 200);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(c => ({
    ...c,
    text: c.text.substring(0, 500) // limit to 500 chars per chunk for cost
  }));

  console.log(`Unique chunks (after dedup): ${uniqueChunks.length}`);

  // 3. Embed in batches
  console.log('\nEmbedding...');
  const entries: EmbeddingEntry[] = [];
  let totalTokens = 0;

  for (let i = 0; i < uniqueChunks.length; i += BATCH_SIZE) {
    const batch = uniqueChunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map(c => c.text);

    try {
      const embeddings = await embedBatch(openai, texts);
      for (let j = 0; j < batch.length; j++) {
        entries.push({ ...batch[j], embedding: embeddings[j] });
      }
      totalTokens += texts.join(' ').split(/\s+/).length;
      process.stdout.write(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueChunks.length / BATCH_SIZE)} (${entries.length} embedded)\r`);
    } catch (err) {
      console.error(`\n  Error on batch ${i / BATCH_SIZE}:`, err);
    }
  }

  console.log(`\nDone. ${entries.length} entries embedded. ~${totalTokens} tokens used.`);

  // 4. Save using streaming write to handle large data
  console.log('Saving embeddings...');
  const ws = fs.createWriteStream(OUTPUT_FILE);
  const meta = {
    model: EMBEDDING_MODEL,
    dimensions: entries[0]?.embedding.length || 0,
    total_entries: entries.length,
    indexed_at: new Date().toISOString(),
    files_indexed: files.length,
  };
  ws.write(`{"_meta":${JSON.stringify(meta)},"entries":[\n`);
  for (let i = 0; i < entries.length; i++) {
    const line = JSON.stringify(entries[i]);
    ws.write(i === 0 ? line : `,\n${line}`);
    if (i % 5000 === 0) process.stdout.write(`  Writing ${i}/${entries.length}\r`);
  }
  ws.write('\n]}');
  ws.end();
  await new Promise<void>((resolve) => ws.on('finish', resolve));
  const sizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(1);
  console.log(`\nSaved to ${OUTPUT_FILE} (${sizeMB} MB)`);
}

main().catch(console.error);
