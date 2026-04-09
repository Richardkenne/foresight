/**
 * Haiku Enrichment Pipeline
 * -------------------------
 * Reads all JSON files from data/cultural/ (recursively),
 * groups data points by country, then sends batches of 20
 * raw data points to Claude Haiku to generate ~100 enriched
 * data points per batch. Saves results to data/cultural/enriched/.
 *
 * Usage: node scripts/enrich-cultural-data.mjs
 * Env:   ANTHROPIC_API_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CULTURAL_DIR   = path.join(ROOT, 'data', 'cultural');
const ENRICHED_DIR   = path.join(ROOT, 'data', 'cultural', 'enriched');
const ENV_FILE       = path.join(ROOT, '.env.local');

const BATCH_SIZE     = 10;     // raw data points per Haiku call (smaller = less tokens)
const CONCURRENCY    = 1;      // sequential to avoid rate limits (10K output tokens/min)
const BATCH_DELAY_MS = 8000;   // 8s between calls to stay under rate limit
const LOG_EVERY      = 10;     // log progress every N batches

// Haiku pricing (USD per 1M tokens) — update if Anthropic changes rates
const COST_INPUT_PER_M  = 0.80;
const COST_OUTPUT_PER_M = 4.00;

// ---------------------------------------------------------------------------
// Load ANTHROPIC_API_KEY from .env.local
// ---------------------------------------------------------------------------
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    throw new Error(`.env.local not found at ${envPath}`);
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key   = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}

// ---------------------------------------------------------------------------
// Recursively collect all JSON files under a directory
// (skips the enriched/ output directory and _INDEX files)
// ---------------------------------------------------------------------------
function collectJsonFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip the enriched output dir to avoid re-processing our own output
      if (entry.name === 'enriched') continue;
      collectJsonFiles(full, files);
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.json') &&
      !entry.name.startsWith('_')
    ) {
      files.push(full);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Extract data points from a JSON file
// Handles both { dataPoints: [...] } and top-level array shapes
// ---------------------------------------------------------------------------
function extractDataPoints(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.dataPoints)) return parsed.dataPoints;
    if (Array.isArray(parsed.data)) return parsed.data;

    // Some files nest under a key that is an array
    for (const val of Object.values(parsed)) {
      if (Array.isArray(val) && val.length > 0 && val[0].country) return val;
    }
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Group data points by country
// ---------------------------------------------------------------------------
function groupByCountry(allPoints) {
  const map = new Map();
  for (const point of allPoints) {
    const country = (point.country || 'Unknown').trim();
    if (!map.has(country)) map.set(country, []);
    map.get(country).push(point);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Build batches of BATCH_SIZE from an array
// ---------------------------------------------------------------------------
function* chunked(arr, size) {
  for (let i = 0; i < arr.length; i += size) {
    yield arr.slice(i, i + size);
  }
}

// ---------------------------------------------------------------------------
// Call Claude Haiku to enrich one batch
// Returns { enriched: [], inputTokens: N, outputTokens: N }
// ---------------------------------------------------------------------------
async function enrichBatch(country, batch, batchIndex, apiKey) {
  const prompt = `You are a cultural data enrichment engine for a life/career/business simulator.

Given these ${batch.length} raw data points about ${country}, generate exactly 5 enriched data points. Keep each point very SHORT (max 15 words context).

Rules for each enriched point:
1. GROUNDED — must derive from one or more of the provided raw data points (cite their IDs in derivedFrom)
2. ADDITIVE — must add comparative, behavioral, or scenario-relevant context not already in the raw data
3. NUMERIC — must include a specific numeric value (not a range, not vague)
4. SIMULATION-USEFUL — must be useful for simulating life, career, or business decisions in ${country}
5. HONEST — do not invent statistics; derive or interpolate from the data provided

Preferred enrichment types (distribute across all 100):
- Cross-country comparison: "Indonesia's X is 3x lower than Australia's Y" (compare to other countries in the raw data if present)
- Behavioral implication: "With X% income on food, discretionary spending for startups is limited to Y%"
- Scenario insight: "High trust in personal recommendations (X%) means word-of-mouth is Nx more effective than digital ads"
- Temporal trend: "Metric grew from X to Y over Z years — annualized rate of N%"
- Demographic intersection: "Urban youth 18-25 in ${country} show X vs Y for rural same age group"
- Business implication: "At GDP per capita of $X, average months to break-even for a cafe is N"
- Risk factor: "N% probability of [negative outcome] given [condition] in ${country}"

Raw data:
${JSON.stringify(batch, null, 2)}

Output ONLY a valid JSON array — no markdown, no explanation, no preamble:
[
  {
    "id": "EN-${country.replace(/\s+/g, '_').toUpperCase()}-${String(batchIndex).padStart(3, '0')}-001",
    "country": "${country}",
    "metric": "short_snake_case_metric_name",
    "value": 0,
    "unit": "unit string",
    "context": "Full sentence explaining the insight with the numeric value embedded.",
    "enrichmentType": "comparison|behavioral|scenario|trend|demographic|business|risk",
    "derivedFrom": ["ID-OF-RAW-POINT-1", "ID-OF-RAW-POINT-2"],
    "source": "Derived from [Source Name] [Year] + [Source Name] [Year]",
    "year": 2023
  }
]`;

  const body = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Haiku API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const usage = data.usage || {};
  const inputTokens  = usage.input_tokens  || 0;
  const outputTokens = usage.output_tokens || 0;

  // Parse the JSON array from the response text
  const rawText = data.content?.[0]?.text || '[]';

  let enriched = [];
  try {
    // Strip any accidental markdown fencing
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    enriched = JSON.parse(cleaned);
    if (!Array.isArray(enriched)) enriched = [];
  } catch (parseErr) {
    console.warn(`    [WARN] JSON parse failed for ${country} batch ${batchIndex}: ${parseErr.message}`);
    enriched = [];
  }

  return { enriched, inputTokens, outputTokens };
}

// ---------------------------------------------------------------------------
// Run N promises with max CONCURRENCY in parallel
// ---------------------------------------------------------------------------
async function runConcurrent(tasks, concurrency) {
  const results = [];
  let i = 0;

  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker);
  await Promise.all(workers);
  return results;
}

// ---------------------------------------------------------------------------
// Sleep helper
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Haiku Enrichment Pipeline ===\n');

  // Load env
  loadEnv(ENV_FILE);
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not found in .env.local');

  // Ensure output directory exists
  fs.mkdirSync(ENRICHED_DIR, { recursive: true });

  // Collect all JSON files
  console.log(`Scanning ${CULTURAL_DIR} ...`);
  const jsonFiles = collectJsonFiles(CULTURAL_DIR);
  console.log(`Found ${jsonFiles.length} JSON files.\n`);

  // Extract and merge all data points
  let allPoints = [];
  for (const file of jsonFiles) {
    const points = extractDataPoints(file);
    allPoints = allPoints.concat(points);
  }
  console.log(`Total raw data points: ${allPoints.length}\n`);

  // Group by country
  const byCountry = groupByCountry(allPoints);
  console.log(`Countries found: ${byCountry.size}`);
  for (const [country, pts] of byCountry) {
    console.log(`  ${country}: ${pts.length} data points`);
  }
  console.log('');

  // Build all batch tasks
  const allBatches = []; // { country, batch, batchIndex }
  for (const [country, points] of byCountry) {
    let batchIndex = 0;
    for (const batch of chunked(points, BATCH_SIZE)) {
      allBatches.push({ country, batch, batchIndex: ++batchIndex });
    }
  }
  console.log(`Total batches to process: ${allBatches.length}\n`);

  // Track totals
  let totalEnriched = 0;
  let totalInputTokens  = 0;
  let totalOutputTokens = 0;
  let totalErrors = 0;
  let batchesDone = 0;

  // Accumulate enriched points per country for saving
  const enrichedByCountry = new Map();

  // Process in groups of CONCURRENCY with BATCH_DELAY_MS between groups
  for (let groupStart = 0; groupStart < allBatches.length; groupStart += CONCURRENCY) {
    const group = allBatches.slice(groupStart, groupStart + CONCURRENCY);

    const tasks = group.map(({ country, batch, batchIndex }) => async () => {
      try {
        const result = await enrichBatch(country, batch, batchIndex, apiKey);
        return { country, batchIndex, ...result, error: null };
      } catch (err) {
        console.error(`  [ERROR] ${country} batch ${batchIndex}: ${err.message}`);
        return { country, batchIndex, enriched: [], inputTokens: 0, outputTokens: 0, error: err.message };
      }
    });

    const results = await runConcurrent(tasks, CONCURRENCY);

    for (const result of results) {
      if (result.error) {
        totalErrors++;
      } else {
        totalEnriched     += result.enriched.length;
        totalInputTokens  += result.inputTokens;
        totalOutputTokens += result.outputTokens;

        if (!enrichedByCountry.has(result.country)) {
          enrichedByCountry.set(result.country, []);
        }
        enrichedByCountry.get(result.country).push(...result.enriched);
      }
      batchesDone++;
    }

    // Progress log every LOG_EVERY batches
    if (batchesDone % LOG_EVERY === 0 || batchesDone === allBatches.length) {
      const pct = ((batchesDone / allBatches.length) * 100).toFixed(1);
      const costSoFar = (
        (totalInputTokens  / 1_000_000) * COST_INPUT_PER_M +
        (totalOutputTokens / 1_000_000) * COST_OUTPUT_PER_M
      ).toFixed(4);
      console.log(
        `[${batchesDone}/${allBatches.length}] ${pct}% — ` +
        `${totalEnriched} enriched — ` +
        `${totalErrors} errors — ` +
        `$${costSoFar} est. cost`
      );
    }

    // Delay between groups to stay under rate limits
    if (groupStart + CONCURRENCY < allBatches.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  // ---------------------------------------------------------------------------
  // Save enriched data per country
  // ---------------------------------------------------------------------------
  console.log('\nSaving enriched data...');

  for (const [country, points] of enrichedByCountry) {
    const safeCountry = country.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const outPath = path.join(ENRICHED_DIR, `${safeCountry}.json`);

    const output = {
      metadata: {
        country,
        generatedAt: new Date().toISOString(),
        totalEnrichedPoints: points.length,
        pipeline: 'haiku-enrichment-pipeline v1',
        model: 'claude-haiku-4-5-20251001',
        batchSize: BATCH_SIZE,
      },
      dataPoints: points,
    };

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`  Saved ${points.length} points → ${path.relative(ROOT, outPath)}`);
  }

  // ---------------------------------------------------------------------------
  // Final summary
  // ---------------------------------------------------------------------------
  const totalCost = (
    (totalInputTokens  / 1_000_000) * COST_INPUT_PER_M +
    (totalOutputTokens / 1_000_000) * COST_OUTPUT_PER_M
  ).toFixed(4);

  console.log('\n=== Pipeline Complete ===');
  console.log(`Raw data points read   : ${allPoints.length}`);
  console.log(`Enriched points saved  : ${totalEnriched}`);
  console.log(`Batches processed      : ${batchesDone}`);
  console.log(`Errors (skipped)       : ${totalErrors}`);
  console.log(`Input tokens used      : ${totalInputTokens.toLocaleString()}`);
  console.log(`Output tokens used     : ${totalOutputTokens.toLocaleString()}`);
  console.log(`Estimated cost         : $${totalCost}`);
  console.log(`Output directory       : ${ENRICHED_DIR}`);
}

main().catch((err) => {
  console.error('\n[FATAL]', err.message);
  process.exit(1);
});
