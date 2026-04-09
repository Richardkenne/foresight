/**
 * api-oecd-core.mjs
 * Downloads data from the OECD SDMX-JSON API for 21 priority countries.
 * Saves to: data/cultural/oecd-v2/{dataset}.json
 *
 * Each data point:
 *   { context, country, countryCode, metric, indicator, value, year, source }
 *
 * Usage: node scripts/api-oecd-core.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/oecd-v2');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ─── Priority countries ───────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'IDN', name: 'Indonesia' },
  { code: 'ITA', name: 'Italy' },
  { code: 'SGP', name: 'Singapore' },
  { code: 'MYS', name: 'Malaysia' },
  { code: 'AUS', name: 'Australia' },
  { code: 'USA', name: 'United States' },
  { code: 'DEU', name: 'Germany' },
  { code: 'FRA', name: 'France' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'ESP', name: 'Spain' },
  { code: 'NLD', name: 'Netherlands' },
  { code: 'CHE', name: 'Switzerland' },
  { code: 'AUT', name: 'Austria' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'NOR', name: 'Norway' },
  { code: 'DNK', name: 'Denmark' },
  { code: 'IRL', name: 'Ireland' },
  { code: 'PRT', name: 'Portugal' },
  { code: 'POL', name: 'Poland' },
  { code: 'FIN', name: 'Finland' },
];

const COUNTRY_CODES = COUNTRIES.map(c => c.code).join('+');

// Build lookup: code → name
const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map(c => [c.code, c.name]));

// ─── Dataset definitions ──────────────────────────────────────────────────────
// id: OECD dataset code
// label: human-readable description used as the metric prefix
// filter: the filter segment inserted into the URL path (after dataset code)
//         Empty string means we rely on the country filter only.
const DATASETS = [
  {
    id: 'SNA_TABLE1',
    label: 'GDP components',
    filter: '',
  },
  {
    id: 'ALFS_SUMTAB',
    label: 'Labour force statistics',
    filter: '',
  },
  {
    id: 'HEALTH_STAT',
    label: 'Health expenditure and resources',
    filter: '',
  },
  {
    id: 'EDU_FINANCE',
    label: 'Education spending',
    filter: '',
  },
  {
    id: 'BLI',
    label: 'Better Life Index',
    filter: '',
  },
  {
    id: 'WEALTH',
    label: 'Household wealth',
    filter: '',
  },
  {
    id: 'IDD',
    label: 'Income distribution (Gini, poverty)',
    filter: '',
  },
  {
    id: 'GENDER_EMP',
    label: 'Gender employment',
    filter: '',
  },
  {
    id: 'STLABOUR',
    label: 'Short-term labour market',
    filter: '',
  },
  {
    id: 'PRICES_CPI',
    label: 'Consumer prices',
    filter: '',
  },
  {
    id: 'HOUSE_PRICES',
    label: 'Housing prices',
    filter: '',
  },
  {
    id: 'BTD_ED',
    label: 'Business enterprise R&D',
    filter: '',
  },
  {
    id: 'TOURISM_INBOUND',
    label: 'Tourism inbound',
    filter: '',
  },
  {
    id: 'GREEN_GROWTH',
    label: 'Green growth environmental indicators',
    filter: '',
  },
  {
    id: 'DIGICOM',
    label: 'Digital economy',
    filter: '',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Parse SDMX-JSON response into flat data points.
 * Handles arbitrary dimension ordering — finds LOCATION and TIME_PERIOD by id.
 */
function parseSdmxJson(json, datasetId, datasetLabel) {
  const dataPoints = [];

  const structure = json.structure;
  if (!structure) return dataPoints;

  const obsDimensions = structure.dimensions?.observation;
  if (!Array.isArray(obsDimensions)) return dataPoints;

  // Build index map: dimension id → position in the colon-separated key
  const dimIndex = {};
  obsDimensions.forEach((dim, i) => { dimIndex[dim.id] = i; });

  // Build value maps for LOCATION and TIME_PERIOD dimensions
  const locationDim = obsDimensions[dimIndex['LOCATION'] ?? -1];
  const timeDim = obsDimensions[dimIndex['TIME_PERIOD'] ?? -1];

  // Some datasets use 'COU' or 'COUNTRY' instead of 'LOCATION'
  const locDim = locationDim
    ?? obsDimensions.find(d => ['COU', 'COUNTRY', 'REF_AREA'].includes(d.id));
  const tDim = timeDim
    ?? obsDimensions.find(d => ['TIME_PERIOD', 'TIME', 'YEAR', 'PERIOD'].includes(d.id));

  if (!locDim || !tDim) {
    // Cannot map location/time — skip
    return dataPoints;
  }

  const locPos = obsDimensions.indexOf(locDim);
  const timePos = obsDimensions.indexOf(tDim);

  // Build lookup arrays
  const locValues = locDim.values ?? [];   // [{id:'AUS',name:'Australia'}, ...]
  const timeValues = tDim.values ?? [];    // [{id:'2020',name:'2020'}, ...]

  // Collect non-loc/time dimension names for the metric label
  const metricDims = obsDimensions.filter(
    (_, i) => i !== locPos && i !== timePos
  );

  const observations = json.dataSets?.[0]?.observations;
  if (!observations || typeof observations !== 'object') return dataPoints;

  for (const [key, valArr] of Object.entries(observations)) {
    const indices = key.split(':').map(Number);
    const rawValue = valArr?.[0];
    if (rawValue === null || rawValue === undefined) continue;
    const value = Number(rawValue);
    if (isNaN(value)) continue;

    const locIdx = indices[locPos];
    const timeIdx = indices[timePos];

    const locationId = locValues[locIdx]?.id ?? String(locIdx);
    const locationName = COUNTRY_MAP[locationId] ?? locValues[locIdx]?.name ?? locationId;
    const year = timeValues[timeIdx]?.id ?? String(timeIdx);

    // Build a metric name from the remaining dimensions
    const metricParts = metricDims.map((dim, relI) => {
      const absI = obsDimensions.indexOf(dim);
      const valId = dim.values?.[indices[absI]]?.name
        ?? dim.values?.[indices[absI]]?.id
        ?? String(indices[absI]);
      return valId;
    });
    const metric = metricParts.length > 0
      ? metricParts.join(' — ')
      : datasetLabel;

    const context = `${locationName} ${metric} in ${year} was ${value}`;

    dataPoints.push({
      context,
      country: locationName,
      countryCode: locationId,
      metric,
      indicator: datasetId,
      value,
      year,
      source: 'OECD',
    });
  }

  return dataPoints;
}

function buildUrl(datasetId, filter) {
  // Pattern:
  // https://stats.oecd.org/SDMX-JSON/data/{dataset}/{location_filter}+{extra_filter}/all
  //   ?startTime=2015&endTime=2024&dimensionAtObservation=allDimensions
  const locationFilter = COUNTRY_CODES;
  // Some datasets need a trailing dot-dot pattern; we add the country filter
  // and let OECD expand remaining dimensions via the "all" agency ref.
  const filterSegment = filter
    ? `${locationFilter}+${filter}`
    : `${locationFilter}....`;

  return (
    `https://stats.oecd.org/SDMX-JSON/data/${datasetId}/${filterSegment}/all` +
    `?startTime=2015&endTime=2024&dimensionAtObservation=allDimensions`
  );
}

function saveResult(datasetId, dataPoints) {
  const outputPath = path.join(OUTPUT_DIR, `${datasetId}.json`);
  const output = {
    dataset: datasetId,
    downloadedAt: new Date().toISOString(),
    totalPoints: dataPoints.length,
    dataPoints,
  };
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  return outputPath;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function downloadDataset(dataset, index, total) {
  const { id, label, filter } = dataset;
  const prefix = `[${index + 1}/${total}]`;
  console.log(`\n${prefix} ${id} — ${label}`);

  const url = buildUrl(id, filter);
  console.log(`  URL: ${url}`);

  let dataPoints = [];
  let status = 'skipped';

  try {
    const res = await fetchWithTimeout(url, 30000);

    if (!res.ok) {
      console.log(`  FAIL HTTP ${res.status} — ${res.statusText}`);
      status = `HTTP ${res.status}`;
    } else {
      let json;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.log(`  FAIL JSON parse error: ${parseErr.message}`);
        status = 'json-parse-error';
        return { id, status, count: 0 };
      }

      dataPoints = parseSdmxJson(json, id, label);

      if (dataPoints.length === 0) {
        console.log(`  WARN No parseable data points (empty/unexpected structure)`);
        status = 'empty';
      } else {
        status = 'ok';
        console.log(`  OK   ${dataPoints.length} data points`);
      }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log(`  FAIL Timeout after 30s`);
      status = 'timeout';
    } else {
      console.log(`  FAIL ${err.message}`);
      status = `error: ${err.message}`;
    }
  }

  // Always save (even empty) so we know what was attempted
  const outPath = saveResult(id, dataPoints);
  console.log(`  Saved → ${path.relative(process.cwd(), outPath)}`);

  return { id, status, count: dataPoints.length };
}

async function main() {
  console.log('=== OECD Core Data Downloader ===');
  console.log(`Datasets: ${DATASETS.length}`);
  console.log(`Countries: ${COUNTRIES.length}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('Delay between requests: 1000ms\n');

  const results = [];

  for (let i = 0; i < DATASETS.length; i++) {
    const result = await downloadDataset(DATASETS[i], i, DATASETS.length);
    results.push(result);

    // 1000ms delay between requests (OECD is slow)
    if (i < DATASETS.length - 1) {
      await sleep(1000);
    }
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));

  let totalPoints = 0;
  let successCount = 0;

  for (const r of results) {
    const statusStr = r.status === 'ok'
      ? `OK (${r.count} pts)`
      : `SKIP — ${r.status}`;
    console.log(`  ${r.id.padEnd(20)} ${statusStr}`);
    totalPoints += r.count;
    if (r.status === 'ok') successCount++;
  }

  console.log('\n' + '-'.repeat(50));
  console.log(`Datasets succeeded:  ${successCount} / ${DATASETS.length}`);
  console.log(`Total data points:   ${totalPoints.toLocaleString()}`);
  console.log(`Output directory:    ${OUTPUT_DIR}`);
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
