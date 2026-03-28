/**
 * RAG (Retrieval Augmented Generation) module
 * Replaces keyword matching with vector similarity search
 *
 * At startup: loads embeddings.json into memory
 * At query time: embeds scenario → cosine similarity → returns top N data points
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

interface EmbeddingEntry {
  id: string;
  file: string;
  text: string;
  category: string;
  embedding: number[];
}

interface EmbeddingsIndex {
  _meta: {
    model: string;
    dimensions: number;
    total_entries: number;
    indexed_at: string;
    files_indexed: number;
  };
  entries: EmbeddingEntry[];
}

// In-memory index — loaded once at startup
let index: EmbeddingsIndex | null = null;
let indexLoadAttempted = false;

function loadIndex(): EmbeddingsIndex | null {
  if (index) return index;
  if (indexLoadAttempted) return null;
  indexLoadAttempted = true;

  const filePath = path.join(process.cwd(), 'data', 'embeddings.json');
  try {
    console.log('[RAG] Loading embeddings index...');
    const raw = fs.readFileSync(filePath, 'utf8');
    index = JSON.parse(raw);
    console.log(`[RAG] Loaded ${index!._meta.total_entries} entries from ${index!._meta.files_indexed} files`);
    return index;
  } catch (err) {
    console.warn('[RAG] embeddings.json not found — falling back to keyword matching');
    return null;
  }
}

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Embed a query using OpenAI API (raw https to avoid dependency issues)
function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body = JSON.stringify({
    model: 'text-embedding-3-small',
    input: text.substring(0, 1000), // limit input
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/embeddings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          if (j.error) return reject(new Error(j.error.message));
          resolve(j.data[0].embedding);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Search for the most relevant data points for a given scenario
 * Returns formatted context string ready for LLM injection
 */
export async function ragSearch(scenario: string, topN: number = 30): Promise<string | null> {
  const idx = loadIndex();
  if (!idx) return null;

  try {
    // Embed the scenario
    const queryEmbedding = await embedQuery(scenario);

    // Compute similarity scores
    const scored = idx.entries.map(entry => ({
      entry,
      score: cosineSimilarity(queryEmbedding, entry.embedding),
    }));

    // Sort by similarity, take top N
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, topN);

    if (topResults.length === 0) return null;

    // Deduplicate by file — max 5 entries per file to ensure diversity
    const fileCounts: Record<string, number> = {};
    const diverse: typeof topResults = [];
    for (const r of topResults) {
      const count = fileCounts[r.entry.file] || 0;
      if (count >= 5) continue;
      fileCounts[r.entry.file] = count + 1;
      diverse.push(r);
      if (diverse.length >= topN) break;
    }

    // Format as context string
    const lines = diverse.map(r =>
      `  - [${r.entry.file}] ${r.entry.text} (relevance: ${(r.score * 100).toFixed(0)}%)`
    );

    const filesSummary = Object.keys(fileCounts).join(', ');
    return `RAG CONTEXT (${diverse.length} data points from ${Object.keys(fileCounts).length} sources: ${filesSummary}):\n${lines.join('\n')}`;

  } catch (err) {
    console.error('[RAG] Search error:', err);
    return null;
  }
}

/**
 * Check if RAG index is available
 */
export function isRagReady(): boolean {
  return loadIndex() !== null;
}
