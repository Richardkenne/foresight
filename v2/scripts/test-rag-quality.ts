/**
 * RAG Quality Test — tests 20 common scenarios against Supabase pgvector
 *
 * For each query:
 * 1. Generates an embedding via OpenAI (text-embedding-3-small, 512 dims)
 * 2. Queries Supabase search_embeddings RPC
 * 3. Records top 5 results with similarity scores
 * 4. Also runs keyword matching fallback for comparison
 *
 * Run: npx tsx scripts/test-rag-quality.ts
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

// ─── Config ───
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

const QUERIES = [
  'opening a cafe',
  'SaaS startup funding',
  'freelancing on Upwork',
  'moving to Indonesia',
  'career change at 35',
  'YouTube channel growth',
  'restaurant failure rate',
  'crypto trading success',
  'cleaning business startup',
  'MBA return on investment',
  'photography business',
  'dropshipping profit margin',
  'gym business survival',
  'AI agency pricing',
  'organic farming profitability',
  'mobile app success rate',
  'podcast monetization',
  'barbershop startup cost',
  'digital nomad income',
  'import export business',
];

// ─── Keyword matching (from data-fetcher.ts) ───
const BUSINESS_TYPE_KEYWORDS: Record<string, string[]> = {
  'saas-data': ['saas', 'software', 'app', 'subscription', 'mrr', 'arr', 'churn', 'b2b software', 'platform', 'tool', 'dashboard', 'api product'],
  'fnb-data': ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'kitchen', 'catering', 'food truck', 'bakery', 'pizzeria', 'warung', 'kedai', 'kopi', 'ristorante'],
  'agency-data': ['agency', 'consulting', 'freelance to agency', 'smma', 'marketing agency', 'dev agency', 'design agency', 'agenzia', 'consulenza', 'service business', 'retainer'],
  'marketplace-data': ['marketplace', 'platform', 'two-sided', 'network effect', 'aggregator', 'matching', 'uber for', 'airbnb for'],
  'creator-data': ['youtube', 'tiktok', 'podcast', 'newsletter', 'substack', 'patreon', 'content creator', 'influencer', 'creator economy', 'streaming'],
  'ecommerce-data': ['ecommerce', 'e-commerce', 'shopify', 'dropshipping', 'amazon fba', 'online store', 'dtc', 'direct to consumer', 'print on demand', 'toko online'],
  'upwork-data': ['upwork', 'freelance', 'freelancer', 'freelancing', 'proposal', 'connects', 'top rated', 'expert vetted', 'fiverr', 'gig', 'client acquisition', 'JSS', 'job success'],
};

function detectBusinessType(scenario: string): string | null {
  const lower = scenario.toLowerCase();
  let bestMatch: string | null = null;
  let bestScore = 0;
  for (const [file, keywords] of Object.entries(BUSINESS_TYPE_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = file; }
  }
  return bestScore >= 1 ? bestMatch : null;
}

// ─── HTTP helpers ───
function httpPost(hostname: string, path: string, headers: Record<string, string>, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': String(Buffer.byteLength(body)) } }, (res) => {
      let d = '';
      res.on('data', (c: Buffer) => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Embed ───
async function embedQuery(text: string): Promise<number[]> {
  const body = JSON.stringify({ model: 'text-embedding-3-small', input: text.substring(0, 1000), dimensions: 512 });
  const raw = await httpPost('api.openai.com', '/v1/embeddings', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  }, body);
  const j = JSON.parse(raw);
  if (j.error) throw new Error(j.error.message);
  return j.data[0].embedding;
}

// ─── Supabase vector search ───
interface SearchResult {
  id: string;
  file: string;
  category: string;
  text: string;
  similarity: number;
}

async function searchEmbeddings(queryEmbedding: number[], matchCount: number = 5): Promise<SearchResult[]> {
  const body = JSON.stringify({
    query_embedding: `[${queryEmbedding.join(',')}]`,
    match_count: matchCount,
  });
  const raw = await httpPost(new URL(SUPABASE_URL).hostname, '/rest/v1/rpc/search_embeddings', {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  }, body);
  const results = JSON.parse(raw);
  if (!Array.isArray(results)) {
    console.error('  Unexpected Supabase response:', typeof results === 'string' ? results.substring(0, 200) : JSON.stringify(results).substring(0, 200));
    return [];
  }
  return results;
}

// ─── Rate limiter ───
function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Relevance evaluation heuristic ───
// Automatic relevance scoring based on keyword overlap
function evaluateRelevance(query: string, result: SearchResult): 'Relevant' | 'Partial' | 'Irrelevant' {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const text = result.text.toLowerCase();
  const file = result.file.toLowerCase();

  // Direct keyword match count
  let matches = 0;
  for (const word of queryWords) {
    if (text.includes(word) || file.includes(word)) matches++;
  }

  // Semantic domain mapping
  const domainMap: Record<string, string[]> = {
    cafe: ['cafe', 'coffee', 'fnb', 'food', 'restaurant', 'beverage', 'menu', 'barista', 'espresso'],
    saas: ['saas', 'software', 'mrr', 'arr', 'churn', 'subscription', 'b2b', 'recurring'],
    upwork: ['upwork', 'freelanc', 'proposal', 'connects', 'gig', 'hourly rate', 'client', 'fiverr'],
    indonesia: ['indonesia', 'jakarta', 'bandung', 'bali', 'rupiah', 'idr', 'visa', 'kitas'],
    career: ['career', 'job', 'salary', 'employment', 'occupation', 'profession', 'hiring', 'wage'],
    youtube: ['youtube', 'channel', 'subscriber', 'video', 'creator', 'content', 'monetiz', 'adsense'],
    restaurant: ['restaurant', 'food', 'dining', 'kitchen', 'fnb', 'menu', 'chef', 'cuisine'],
    crypto: ['crypto', 'bitcoin', 'ethereum', 'trading', 'blockchain', 'exchange', 'defi', 'token'],
    cleaning: ['cleaning', 'janitorial', 'maid', 'housekeeping', 'sanitation', 'commercial cleaning'],
    mba: ['mba', 'business school', 'graduate', 'education', 'roi', 'degree', 'tuition'],
    photography: ['photo', 'camera', 'portrait', 'wedding photo', 'studio', 'photographer'],
    dropshipping: ['dropship', 'ecommerce', 'shopify', 'margin', 'supplier', 'aliexpress', 'online store'],
    gym: ['gym', 'fitness', 'health club', 'membership', 'workout', 'personal train'],
    agency: ['agency', 'consulting', 'ai agency', 'smma', 'retainer', 'client acquisition'],
    farming: ['farm', 'organic', 'agriculture', 'crop', 'harvest', 'soil', 'livestock'],
    app: ['app', 'mobile', 'download', 'ios', 'android', 'play store', 'app store'],
    podcast: ['podcast', 'episode', 'listener', 'sponsor', 'audio', 'rss'],
    barbershop: ['barber', 'haircut', 'salon', 'grooming', 'hair'],
    nomad: ['nomad', 'remote', 'travel', 'location independent', 'coworking', 'visa'],
    import: ['import', 'export', 'trade', 'customs', 'shipping', 'tariff', 'logistics'],
  };

  // Check if result text matches query domain
  let domainMatch = false;
  for (const [domain, keywords] of Object.entries(domainMap)) {
    const queryMatchesDomain = queryWords.some(w => keywords.some(kw => kw.includes(w) || w.includes(kw)));
    if (queryMatchesDomain) {
      const textMatchesDomain = keywords.some(kw => text.includes(kw) || file.includes(kw));
      if (textMatchesDomain) { domainMatch = true; break; }
    }
  }

  // High similarity + domain match = Relevant
  if (result.similarity >= 0.65 && domainMatch) return 'Relevant';
  if (result.similarity >= 0.55 && (matches >= 2 || domainMatch)) return 'Relevant';
  if (result.similarity >= 0.45 && (matches >= 1 || domainMatch)) return 'Partial';
  if (result.similarity >= 0.40 && matches >= 1) return 'Partial';
  return 'Irrelevant';
}

// ─── Main ───
interface QueryResult {
  query: string;
  keywordMatch: string | null;
  ragResults: (SearchResult & { relevance: string })[];
  ragError?: string;
  relevantCount: number;
  partialCount: number;
  irrelevantCount: number;
}

async function main() {
  console.log('=== RAG Quality Test ===\n');

  const canRAG = !!(SUPABASE_KEY && OPENAI_API_KEY);
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Supabase key: ${SUPABASE_KEY ? 'SET' : 'MISSING'}`);
  console.log(`OpenAI key: ${OPENAI_API_KEY ? 'SET' : 'MISSING'}`);
  console.log(`RAG available: ${canRAG}\n`);

  const results: QueryResult[] = [];

  for (let i = 0; i < QUERIES.length; i++) {
    const query = QUERIES[i];
    console.log(`[${i + 1}/20] "${query}"`);

    // Keyword match
    const kwMatch = detectBusinessType(query);
    console.log(`  Keyword match: ${kwMatch || 'NONE'}`);

    const qr: QueryResult = {
      query,
      keywordMatch: kwMatch,
      ragResults: [],
      relevantCount: 0,
      partialCount: 0,
      irrelevantCount: 0,
    };

    if (canRAG) {
      try {
        const embedding = await embedQuery(query);
        const searchResults = await searchEmbeddings(embedding, 5);

        for (const r of searchResults) {
          const relevance = evaluateRelevance(query, r);
          qr.ragResults.push({ ...r, relevance });
          if (relevance === 'Relevant') qr.relevantCount++;
          else if (relevance === 'Partial') qr.partialCount++;
          else qr.irrelevantCount++;
        }

        console.log(`  RAG: ${searchResults.length} results (${qr.relevantCount}R/${qr.partialCount}P/${qr.irrelevantCount}I)`);
        for (const r of qr.ragResults) {
          console.log(`    ${(r.similarity * 100).toFixed(1)}% [${r.file}] ${r.text.substring(0, 80)}... → ${r.relevance}`);
        }
      } catch (err) {
        qr.ragError = (err as Error).message;
        console.log(`  RAG ERROR: ${qr.ragError}`);
      }

      // Rate limit: 1 req/sec
      await sleep(1000);
    } else {
      qr.ragError = 'RAG not available (missing keys)';
      console.log('  RAG: skipped (missing keys)');
    }

    results.push(qr);
  }

  // ─── Generate report ───
  generateReport(results, canRAG);
}

function generateReport(results: QueryResult[], canRAG: boolean) {
  const totalQueries = results.length;
  const queriesWithResults = results.filter(r => r.ragResults.length > 0).length;

  // Count queries by quality
  const goodQueries = results.filter(r => r.relevantCount >= 3).length;
  const okQueries = results.filter(r => r.relevantCount >= 2 && r.relevantCount < 3).length;
  const poorQueries = results.filter(r => r.relevantCount < 2).length;

  // Average similarity
  const allSimilarities = results.flatMap(r => r.ragResults.map(rr => rr.similarity));
  const avgSimilarity = allSimilarities.length > 0 ? (allSimilarities.reduce((a, b) => a + b, 0) / allSimilarities.length) : 0;

  // Average relevance score (Relevant=2, Partial=1, Irrelevant=0, out of 10 max for 5 results)
  const avgRelevanceScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.relevantCount * 2 + r.partialCount * 1, 0) / results.length
    : 0;

  // Keyword coverage
  const kwMatched = results.filter(r => r.keywordMatch !== null).length;

  const lines: string[] = [];
  lines.push('# RAG Quality Report — 2026-04-06');
  lines.push('');
  lines.push('## Summary');
  lines.push(`- **Queries tested**: ${totalQueries}`);
  lines.push(`- **Queries with RAG results**: ${queriesWithResults}/${totalQueries}`);
  lines.push(`- **Average similarity score**: ${(avgSimilarity * 100).toFixed(1)}%`);
  lines.push(`- **Average relevance score**: ${avgRelevanceScore.toFixed(1)}/10 (Relevant=2pts, Partial=1pt, per result x5)`);
  lines.push(`- **Good results (>=3 relevant in top 5)**: ${goodQueries}/${totalQueries}`);
  lines.push(`- **OK results (2 relevant)**: ${okQueries}/${totalQueries}`);
  lines.push(`- **Poor results (<2 relevant)**: ${poorQueries}/${totalQueries}`);
  lines.push(`- **Keyword fallback coverage**: ${kwMatched}/${totalQueries} queries match a business type`);
  lines.push('');

  if (!canRAG) {
    lines.push('> **NOTE**: RAG was not available (missing Supabase/OpenAI keys). Only keyword matching was tested.');
    lines.push('');
  }

  lines.push('## Per-Query Results');
  lines.push('');

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    lines.push(`### ${i + 1}. "${r.query}"`);
    lines.push(`- **Keyword match**: ${r.keywordMatch || 'NONE'}`);
    lines.push(`- **Relevance**: ${r.relevantCount} Relevant, ${r.partialCount} Partial, ${r.irrelevantCount} Irrelevant`);

    if (r.ragError && r.ragResults.length === 0) {
      lines.push(`- **Error**: ${r.ragError}`);
    }

    if (r.ragResults.length > 0) {
      lines.push('');
      lines.push('| Rank | Source File | Similarity | Content Preview | Relevance |');
      lines.push('|------|------------|------------|-----------------|-----------|');
      for (let j = 0; j < r.ragResults.length; j++) {
        const rr = r.ragResults[j];
        const preview = rr.text.substring(0, 80).replace(/\|/g, '/').replace(/\n/g, ' ');
        lines.push(`| ${j + 1} | ${rr.file} | ${(rr.similarity * 100).toFixed(1)}% | ${preview}... | ${rr.relevance} |`);
      }
    }
    lines.push('');
  }

  // Weak areas
  lines.push('## Weak Areas');
  lines.push('');
  const weakQueries = results.filter(r => r.relevantCount < 2);
  if (weakQueries.length === 0) {
    lines.push('No weak areas detected — all queries return at least 2 relevant results.');
  } else {
    lines.push('Queries where RAG fails to return useful data:');
    lines.push('');
    for (const w of weakQueries) {
      const topSim = w.ragResults.length > 0 ? (w.ragResults[0].similarity * 100).toFixed(1) + '%' : 'N/A';
      const topFile = w.ragResults.length > 0 ? w.ragResults[0].file : 'N/A';
      lines.push(`- **"${w.query}"** — ${w.relevantCount} relevant, ${w.partialCount} partial. Top result: ${topFile} (${topSim}). Keyword fallback: ${w.keywordMatch || 'NONE'}`);
    }
  }
  lines.push('');

  // Keyword-only queries (no RAG match but keyword works)
  const kwOnlyQueries = results.filter(r => r.relevantCount < 2 && r.keywordMatch !== null);
  if (kwOnlyQueries.length > 0) {
    lines.push('### Queries saved by keyword fallback');
    lines.push('');
    for (const q of kwOnlyQueries) {
      lines.push(`- **"${q.query}"** → keyword matches \`${q.keywordMatch}\` but RAG returned only ${q.relevantCount} relevant results`);
    }
    lines.push('');
  }

  // Queries with NO coverage at all
  const noCoverage = results.filter(r => r.relevantCount === 0 && r.keywordMatch === null);
  if (noCoverage.length > 0) {
    lines.push('### Queries with ZERO coverage (no RAG, no keyword)');
    lines.push('');
    for (const q of noCoverage) {
      lines.push(`- **"${q.query}"** — needs new data files or expanded keywords`);
    }
    lines.push('');
  }

  lines.push('## Recommendations');
  lines.push('');
  lines.push('### Data Gaps');

  // Find which queries have no keyword match
  const noKwMatch = results.filter(r => r.keywordMatch === null);
  if (noKwMatch.length > 0) {
    lines.push(`- ${noKwMatch.length} queries have no keyword fallback. Add keyword entries for: ${noKwMatch.map(r => `"${r.query}"`).join(', ')}`);
  }

  lines.push('');
  lines.push('### Chunking');
  lines.push('- Current chunks are short (max 500 chars). Consider longer chunks (800-1000 chars) for more context per result.');
  lines.push('- Chunks are path-based (`file/key/subkey: value`). Consider adding natural language descriptions to improve semantic search.');
  lines.push('');
  lines.push('### Embedding Model');
  lines.push('- Using `text-embedding-3-small` at 512 dims. Consider testing `text-embedding-3-large` (3072 dims) for better discrimination on niche queries.');
  lines.push('- Alternative: Cohere embed-v3 or Voyage AI for domain-specific embeddings.');
  lines.push('');
  lines.push('### Search Parameters');
  lines.push('- Current `match_threshold: 0.3` is very permissive. Results below 0.45 are often irrelevant.');
  lines.push('- Consider raising threshold to 0.40-0.45 and relying on keyword fallback for missed queries.');
  lines.push('- Production uses `match_count: 30` — for quality, the top 10-15 are usually sufficient.');
  lines.push('');
  lines.push('### Missing Data Files');

  const missingDomains = [
    { query: 'career change at 35', suggestion: 'career-transitions-data.json' },
    { query: 'cleaning business startup', suggestion: 'cleaning-business-data.json' },
    { query: 'MBA return on investment', suggestion: 'education-roi-data.json' },
    { query: 'photography business', suggestion: 'photography-business-data.json' },
    { query: 'gym business survival', suggestion: 'fitness-industry-data.json' },
    { query: 'organic farming profitability', suggestion: 'agriculture-data.json' },
    { query: 'barbershop startup cost', suggestion: 'personal-services-data.json' },
    { query: 'import export business', suggestion: 'trade-logistics-data.json' },
  ];

  for (const m of missingDomains) {
    const r = results.find(q => q.query === m.query);
    if (r && r.relevantCount < 2) {
      lines.push(`- Create \`data/${m.suggestion}\` for "${m.query}" queries`);
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('*Generated by `scripts/test-rag-quality.ts`*');

  const reportPath = path.join(process.cwd(), 'docs', 'rag-quality-report.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`\n=== Report written to ${reportPath} ===`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
