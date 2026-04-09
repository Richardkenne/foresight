/**
 * ILO Labor Market Data Downloader
 * Downloads annual labor indicators from the ILO rplumber REST API for 21 priority countries.
 *
 * API: https://rplumber.ilo.org/data/indicator/?id={INDICATOR}&ref_area={ISO3}&timefrom=2015&timeto=2024&type=both&format=.json
 *
 * Usage: node scripts/api-ilo-labor.mjs
 * Output: data/cultural/ilo-labor/ilo-all.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/ilo-labor');
const OUTPUT_FILE = join(OUTPUT_DIR, 'ilo-all.json');
const DELAY_MS = 1000;

// ILO uses ISO3 codes
const COUNTRY_NAMES = {
  IDN: 'Indonesia',
  ITA: 'Italy',
  SGP: 'Singapore',
  MYS: 'Malaysia',
  AUS: 'Australia',
  USA: 'United States',
  DEU: 'Germany',
  FRA: 'France',
  GBR: 'United Kingdom',
  ESP: 'Spain',
  NLD: 'Netherlands',
  CHE: 'Switzerland',
  AUT: 'Austria',
  BEL: 'Belgium',
  SWE: 'Sweden',
  NOR: 'Norway',
  DNK: 'Denmark',
  IRL: 'Ireland',
  PRT: 'Portugal',
  POL: 'Poland',
  FIN: 'Finland',
};

// ISO3 → ISO2 mapping for output countryCode field
const ISO3_TO_ISO2 = {
  IDN: 'ID',
  ITA: 'IT',
  SGP: 'SG',
  MYS: 'MY',
  AUS: 'AU',
  USA: 'US',
  DEU: 'DE',
  FRA: 'FR',
  GBR: 'GB',
  ESP: 'ES',
  NLD: 'NL',
  CHE: 'CH',
  AUT: 'AT',
  BEL: 'BE',
  SWE: 'SE',
  NOR: 'NO',
  DNK: 'DK',
  IRL: 'IE',
  PRT: 'PT',
  POL: 'PL',
  FIN: 'FI',
};

const COUNTRIES = Object.keys(COUNTRY_NAMES);

// ILO indicator IDs (verified against rplumber API)
const DATASETS = [
  { id: 'UNE_DEAP_SEX_AGE_RT',    label: 'Unemployment rate by sex and age' },
  { id: 'EAP_DWAP_SEX_AGE_RT',    label: 'Labor force participation rate by sex and age' },
  { id: 'EMP_TEMP_SEX_AGE_NB',    label: 'Employment by sex and age' },
  { id: 'EAR_4MTH_SEX_ECO_CUR_NB', label: 'Monthly earnings by sex and economic activity' },
  { id: 'HOW_TEMP_SEX_ECO_NB',    label: 'Hours of work by sex and economic activity' },
  { id: 'EMP_NIFL_SEX_ECO_NB',    label: 'Informal employment by sex and economic activity' },
  { id: 'EMP_TEMP_SEX_STE_NB',    label: 'Employment by sex and status in employment' },
  { id: 'GDP_211P_NOC_NB',        label: 'GDP and productivity' },
  { id: 'SDG_0852_SEX_AGE_RT',    label: 'Youth NEET rate (SDG 8.5.2)' },
  { id: 'SDG_0111_SEX_AGE_RT',    label: 'Working poverty rate (SDG 1.1.1)' },
];

const BASE_URL = 'https://rplumber.ilo.org/data/indicator/';

// --- Helpers ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch one indicator for one country from the ILO rplumber API.
 * Returns array of row objects or empty array on error/no-data.
 */
async function fetchIndicator(indicatorId, iso3) {
  const params = new URLSearchParams({
    id: indicatorId,
    ref_area: iso3,
    timefrom: '2015',
    timeto: '2024',
    type: 'both',
    format: '.json',
  });
  const url = `${BASE_URL}?${params}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      // 400 = deprecated/invalid indicator for this combo — expected for some
      if (res.status === 400 || res.status === 404 || res.status === 204) {
        return [];
      }
      process.stdout.write(` [HTTP ${res.status}]`);
      return [];
    }

    const text = await res.text();
    if (!text || text.trim() === '' || text.trim() === '[]') return [];

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return [];
    }

    if (!Array.isArray(data) || data.length === 0) return [];

    return data;
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      process.stdout.write(' [timeout]');
    }
    return [];
  }
}

/**
 * Convert a rplumber row to our standard data point format.
 */
function rowToPoint(row, country, iso2, datasetId, datasetLabel) {
  const year = String(row.time ?? row.TIME_PERIOD ?? '');
  const value = row.obs_value ?? row.OBS_VALUE;
  if (value === null || value === undefined || year === '') return null;

  // Build a rich metric label from available classification labels
  const sexLabel = row['sex.label'] ?? '';
  const classif1Label = row['classif1.label'] ?? '';
  const classif2Label = row['classif2.label'] ?? '';
  const sourceLabel = row['source.label'] ?? '';
  const indicatorLabel = row['indicator.label'] ?? datasetLabel;

  const metricParts = [indicatorLabel];
  if (sexLabel && sexLabel !== 'Total') metricParts.push(sexLabel);
  if (classif1Label) metricParts.push(classif1Label);
  if (classif2Label) metricParts.push(classif2Label);

  return {
    context: `${country} — ${metricParts.join(', ')}`,
    country,
    countryCode: iso2,
    metric: metricParts.join(' | '),
    indicator: datasetId,
    sex: sexLabel || 'Total',
    classif1: classif1Label || null,
    classif2: classif2Label || null,
    source_label: sourceLabel || null,
    value,
    year,
    source: 'ILO',
  };
}

// --- Main ---
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const allPoints = [];
  let totalRequests = 0;
  let totalSuccess = 0;
  let totalPoints = 0;

  console.log('ILO Labor Data Downloader');
  console.log(`Indicators: ${DATASETS.length} | Countries: ${COUNTRIES.length}`);
  console.log(`Total requests: ${DATASETS.length * COUNTRIES.length}`);
  console.log('─'.repeat(60));

  for (const dataset of DATASETS) {
    console.log(`\n[${dataset.id}] ${dataset.label}`);

    for (const iso3 of COUNTRIES) {
      const country = COUNTRY_NAMES[iso3];
      const iso2 = ISO3_TO_ISO2[iso3];

      process.stdout.write(`  ${iso3} (${country})...`);
      totalRequests++;

      const rows = await fetchIndicator(dataset.id, iso3);

      if (rows.length > 0) {
        totalSuccess++;
        let pointCount = 0;

        for (const row of rows) {
          const point = rowToPoint(row, country, iso2, dataset.id, dataset.label);
          if (point) {
            allPoints.push(point);
            pointCount++;
          }
        }

        totalPoints += pointCount;
        process.stdout.write(` ${pointCount} pts\n`);
      } else {
        process.stdout.write(' no data\n');
      }

      await sleep(DELAY_MS);
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log(`Requests: ${totalRequests} | With data: ${totalSuccess} | Data points: ${totalPoints}`);
  console.log(`Saving to: ${OUTPUT_FILE}`);

  writeFileSync(OUTPUT_FILE, JSON.stringify(allPoints, null, 2), 'utf-8');

  console.log(`Done. ${allPoints.length} records written.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
