/**
 * Verify Supabase index completeness
 *
 * Queries Supabase to check how many rows exist per file,
 * compares against local data/ directory, and reports gaps.
 *
 * Run: npx tsx scripts/verify-index.ts
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const SKIP_FILES = ['source-authority.json', 'api-databases.json', 'embeddings.json', 'sacred-index.json'];
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rkkfwsmoqylctprzqhfj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

async function getFileCounts(): Promise<Record<string, number>> {
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

  // Fallback: paginated query (handles >50K rows)
  const counts: Record<string, number> = {};
  let offset = 0;
  const PAGE_SIZE = 10000;

  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/simulator_embeddings?select=file&limit=${PAGE_SIZE}&offset=${offset}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    if (!res.ok) {
      console.error(`Supabase query failed: ${res.status} ${await res.text()}`);
      break;
    }
    const rows = (await res.json()) as { file: string }[];
    if (rows.length === 0) break;

    for (const r of rows) counts[r.file] = (counts[r.file] || 0) + 1;
    offset += rows.length;

    if (rows.length < PAGE_SIZE) break;
  }

  return counts;
}

async function getTotalRows(): Promise<number> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/simulator_embeddings?select=id&head=true`,
    {
      method: 'HEAD',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'count=exact',
      },
    }
  );
  const contentRange = res.headers.get('content-range');
  if (contentRange) {
    // Format: "0-0/12345" or "*/12345"
    const match = contentRange.match(/\/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  return -1;
}

async function main() {
  if (!SUPABASE_KEY) {
    console.error('ERROR: Set SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  console.log('=== Verify Supabase Index ===\n');

  // 1. Get total row count
  const totalRows = await getTotalRows();
  console.log(`Total rows in simulator_embeddings: ${totalRows === -1 ? 'unknown (HEAD not supported)' : totalRows}\n`);

  // 2. Get per-file counts
  console.log('Querying per-file counts...');
  const fileCounts = await getFileCounts();
  const indexedFiles = Object.keys(fileCounts).sort();
  console.log(`Indexed files: ${indexedFiles.length}\n`);

  // 3. List local files
  const localFiles = fs.readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json') && !SKIP_FILES.includes(f))
    .map((f) => f.replace('.json', ''))
    .sort();
  console.log(`Local data files (excluding skipped): ${localFiles.length}\n`);

  // 4. Find gaps
  const missingFromIndex: string[] = [];
  const indexedButNotLocal: string[] = [];

  for (const f of localFiles) {
    if (!fileCounts[f]) {
      missingFromIndex.push(f);
    }
  }

  for (const f of indexedFiles) {
    if (!localFiles.includes(f)) {
      indexedButNotLocal.push(f);
    }
  }

  // 5. Report indexed files with counts
  console.log('--- Indexed files ---');
  const sumChunks = Object.values(fileCounts).reduce((a, b) => a + b, 0);
  for (const f of indexedFiles) {
    console.log(`  ${f}: ${fileCounts[f]} chunks`);
  }
  console.log(`  TOTAL: ${sumChunks} chunks across ${indexedFiles.length} files\n`);

  // 6. Report gaps
  if (missingFromIndex.length > 0) {
    console.log(`--- MISSING from index (${missingFromIndex.length} files) ---`);
    for (const f of missingFromIndex) {
      const sizeMB = (fs.statSync(path.join(DATA_DIR, `${f}.json`)).size / 1024 / 1024).toFixed(2);
      console.log(`  [GAP] ${f} (${sizeMB} MB)`);
    }
  } else {
    console.log('--- No gaps: all local files are indexed ---');
  }

  if (indexedButNotLocal.length > 0) {
    console.log(`\n--- Indexed but NOT in local data/ (${indexedButNotLocal.length} files) ---`);
    for (const f of indexedButNotLocal) {
      console.log(`  [ORPHAN] ${f}: ${fileCounts[f]} chunks`);
    }
  }

  // 7. Summary
  console.log('\n=== Summary ===');
  console.log(`Local files:     ${localFiles.length}`);
  console.log(`Indexed files:   ${indexedFiles.length}`);
  console.log(`Missing:         ${missingFromIndex.length}`);
  console.log(`Orphaned:        ${indexedButNotLocal.length}`);
  console.log(`Total rows:      ${totalRows === -1 ? 'unknown' : totalRows}`);

  if (missingFromIndex.length > 0) {
    console.log(`\nRun "npm run reindex" to index missing files.`);
    console.log(`Or "DRY_RUN=1 npm run reindex" to preview without indexing.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
