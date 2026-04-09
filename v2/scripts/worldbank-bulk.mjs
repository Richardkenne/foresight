/**
 * World Bank Bulk Download
 * Downloads ALL available indicators for 20 countries
 * Run: node --max-old-space-size=4096 scripts/worldbank-bulk.mjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_DIR = join(__dirname, '../data/cultural/worldbank-bulk');

const COUNTRIES = 'IDN;AUS;ITA;SGP;MYS;USA;DEU;FRA;GBR;ESP;NLD;CHE;SWE;POL;BEL;AUT;NOR;DNK;IRL;PRT';
const COUNTRY_NAMES = {
  IDN: 'Indonesia', AUS: 'Australia', ITA: 'Italy', SGP: 'Singapore',
  MYS: 'Malaysia', USA: 'United States', DEU: 'Germany', FRA: 'France',
  GBR: 'United Kingdom', ESP: 'Spain', NLD: 'Netherlands', CHE: 'Switzerland',
  SWE: 'Sweden', POL: 'Poland', BEL: 'Belgium', AUT: 'Austria',
  NOR: 'Norway', DNK: 'Denmark', IRL: 'Ireland', PRT: 'Portugal'
};

const BATCH_SIZE = 50;
const CONCURRENCY = 5;
const DELAY_MS = 150;
const REQUEST_TIMEOUT_MS = 30000;
const DATE_RANGE = '2015:2024';

// Ensure output dir exists
if (!existsSync(BASE_DIR)) {
  mkdirSync(BASE_DIR, { recursive: true });
  console.log(`Created dir: ${BASE_DIR}`);
}

// ── Fetch with timeout ─────────────────────────────────────────────────────────
async function fetchWithTimeout(url, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── Sleep ──────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Get ALL indicators (paginated) ────────────────────────────────────────────
async function getAllIndicators() {
  console.log('Fetching indicator list from World Bank...');
  let page = 1;
  let allIndicators = [];
  let total = null;

  while (true) {
    const url = `https://api.worldbank.org/v2/indicator?format=json&per_page=1000&page=${page}`;
    try {
      const data = await fetchWithTimeout(url);
      const meta = data[0];
      const items = data[1];

      if (!items || items.length === 0) break;

      if (total === null) {
        total = meta.total;
        console.log(`Total indicators available: ${total}`);
      }

      allIndicators.push(...items);
      console.log(`  Page ${page}: fetched ${items.length} indicators (total so far: ${allIndicators.length})`);

      if (allIndicators.length >= meta.total) break;
      page++;
      await sleep(100);
    } catch (err) {
      console.error(`Error fetching indicator page ${page}: ${err.message}`);
      break;
    }
  }

  console.log(`Retrieved ${allIndicators.length} indicators total.\n`);
  return allIndicators;
}

// ── Download data for one indicator ──────────────────────────────────────────
async function downloadIndicator(indicator) {
  const id = indicator.id;
  const name = indicator.name;
  const url = `https://api.worldbank.org/v2/country/${COUNTRIES}/indicator/${id}?format=json&per_page=500&date=${DATE_RANGE}`;

  try {
    const data = await fetchWithTimeout(url);
    if (!Array.isArray(data) || data.length < 2 || !data[1]) return [];

    const rows = data[1];
    const points = [];

    for (const row of rows) {
      if (row.value === null || row.value === undefined) continue;
      const countryCode = row.countryiso3code || row.country?.id;
      if (!countryCode || !COUNTRY_NAMES[countryCode]) continue;

      const countryName = COUNTRY_NAMES[countryCode];
      const year = parseInt(row.date, 10);
      const value = parseFloat(row.value);
      if (isNaN(value)) continue;

      points.push({
        id: `WB-${id}-${countryCode}-${year}`,
        country: countryName,
        countryCode,
        indicator: name,
        indicatorCode: id,
        value: Math.round(value * 10000) / 10000,
        year,
        source: `World Bank ${year}`,
        context: `${countryName} ${name} was ${value.toLocaleString('en-US', { maximumFractionDigits: 4 })} in ${year}`
      });
    }

    return points;
  } catch (err) {
    // Silently skip — many indicators have no data for these countries
    return [];
  }
}

// ── Concurrency pool ──────────────────────────────────────────────────────────
async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

// ── Save a batch to disk ──────────────────────────────────────────────────────
function saveBatch(batchNum, indicators, dataPoints) {
  const filename = `worldbank-batch-${String(batchNum).padStart(3, '0')}.json`;
  const filePath = join(BASE_DIR, filename);

  const output = {
    metadata: {
      source: 'World Bank',
      batch: batchNum,
      indicators: indicators.length,
      indicatorIds: indicators.map(i => i.id),
      totalDataPoints: dataPoints.length,
      dateRange: DATE_RANGE,
      countries: Object.keys(COUNTRY_NAMES),
      generatedAt: new Date().toISOString()
    },
    dataPoints
  };

  writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');
  return filePath;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();
  console.log('=== World Bank Bulk Download ===');
  console.log(`Countries: ${Object.keys(COUNTRY_NAMES).join(', ')}`);
  console.log(`Date range: ${DATE_RANGE}`);
  console.log(`Batch size: ${BATCH_SIZE} indicators/file`);
  console.log(`Concurrency: ${CONCURRENCY} parallel requests`);
  console.log('');

  // Step 1: Get all indicators
  const allIndicators = await getAllIndicators();
  if (allIndicators.length === 0) {
    console.error('No indicators found. Exiting.');
    process.exit(1);
  }

  // Step 2: Process in batches
  let globalDataPoints = 0;
  let batchNum = 1;
  let processedCount = 0;
  const totalIndicators = allIndicators.length;

  for (let i = 0; i < allIndicators.length; i += BATCH_SIZE) {
    const batchIndicators = allIndicators.slice(i, i + BATCH_SIZE);

    // Build tasks for this batch
    const tasks = batchIndicators.map(indicator => () => downloadIndicator(indicator));

    // Run with concurrency pool
    const results = await runPool(tasks, CONCURRENCY);

    // Flatten all data points from this batch
    const batchDataPoints = results.flat();
    const nonEmpty = results.filter(r => r.length > 0).length;

    // Save batch to disk
    const filePath = saveBatch(batchNum, batchIndicators, batchDataPoints);

    globalDataPoints += batchDataPoints.length;
    processedCount += batchIndicators.length;

    console.log(
      `Downloaded ${processedCount}/${totalIndicators} indicators | ` +
      `Batch ${batchNum}: ${batchDataPoints.length} data points (${nonEmpty}/${batchIndicators.length} non-empty) | ` +
      `Total: ${globalDataPoints.toLocaleString()} | ` +
      `File: ${filePath.split('/').pop()}`
    );

    batchNum++;

    // Delay between batches
    if (i + BATCH_SIZE < allIndicators.length) {
      await sleep(DELAY_MS);
    }
  }

  // Summary file
  const summaryPath = join(BASE_DIR, 'summary.json');
  writeFileSync(summaryPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalIndicatorsProcessed: processedCount,
    totalBatches: batchNum - 1,
    totalDataPoints: globalDataPoints,
    durationSeconds: Math.round((Date.now() - startTime) / 1000),
    countries: COUNTRY_NAMES,
    dateRange: DATE_RANGE
  }, null, 2), 'utf8');

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log('\n=== DONE ===');
  console.log(`Total indicators processed : ${processedCount}`);
  console.log(`Total batches saved        : ${batchNum - 1}`);
  console.log(`TOTAL DATA POINTS          : ${globalDataPoints.toLocaleString()}`);
  console.log(`Duration                   : ${Math.floor(duration / 60)}m ${duration % 60}s`);
  console.log(`Output directory           : ${BASE_DIR}`);
  console.log(`Summary                    : ${summaryPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
