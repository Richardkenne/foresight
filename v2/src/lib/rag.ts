/**
 * RAG module — Supabase pgvector
 * Embeds scenario → searches Supabase for nearest data points → returns context
 */

import https from 'https';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

function fetchJSON(url: string, options: { method?: string; headers?: Record<string, string>; body?: string }): Promise<unknown> {
  const parsed = new URL(url);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve(d); } });
    });
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

// Embed a query using OpenAI
function embedQuery(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const body = JSON.stringify({
    model: 'text-embedding-3-small',
    input: text.substring(0, 1000),
    dimensions: 512,
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

interface SearchResult {
  id: string;
  file: string;
  category: string;
  text: string;
  similarity: number;
}

/**
 * Search for relevant data points using Supabase pgvector
 */
export async function ragSearch(scenario: string, topN: number = 30): Promise<string | null> {
  if (!SUPABASE_KEY) return null;

  try {
    // 1. Embed the scenario
    const queryEmbedding = await embedQuery(scenario);

    // 2. Call Supabase RPC function
    const results = await fetchJSON(`${SUPABASE_URL}/rest/v1/rpc/search_embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        query_embedding: `[${queryEmbedding.join(',')}]`,
        match_count: topN,
      }),
    }) as SearchResult[];

    if (!Array.isArray(results) || results.length === 0) return null;

    // 3. Format as context string
    const fileSet = new Set(results.map(r => r.file));
    const lines = results.map(r =>
      `  - [${r.file}] ${r.text} (relevance: ${(r.similarity * 100).toFixed(0)}%)`
    );

    return `RAG CONTEXT (${results.length} data points from ${fileSet.size} sources: ${[...fileSet].join(', ')}):\n${lines.join('\n')}`;
  } catch (err) {
    console.error('[RAG] Search error:', err);
    return null;
  }
}

/**
 * Check if RAG is available (Supabase key configured)
 */
export function isRagReady(): boolean {
  const ready = !!(SUPABASE_KEY && process.env.OPENAI_API_KEY);
  if (!ready) {
    console.warn(`[RAG] Not ready — SUPABASE_KEY: ${SUPABASE_KEY ? 'set' : 'MISSING'}, OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? 'set' : 'MISSING'}`);
  }
  return ready;
}
