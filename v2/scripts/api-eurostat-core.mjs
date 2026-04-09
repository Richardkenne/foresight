/**
 * Eurostat API Core Downloader — EU27 countries, 40 datasets
 * Uses the JSON-stat 2.0 dissemination API.
 *
 * Usage: node scripts/api-eurostat-core.mjs
 * Output: data/cultural/eurostat-v2/{dataset}.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/eurostat-v2');
const DELAY_MS = 500;

// --- Countries ---
const COUNTRIES = {
  AT: 'Austria',
  BE: 'Belgium',
  BG: 'Bulgaria',
  HR: 'Croatia',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DK: 'Denmark',
  EE: 'Estonia',
  FI: 'Finland',
  FR: 'France',
  DE: 'Germany',
  EL: 'Greece',
  HU: 'Hungary',
  IE: 'Ireland',
  IT: 'Italy',
  LV: 'Latvia',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  MT: 'Malta',
  NL: 'Netherlands',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  SK: 'Slovakia',
  SI: 'Slovenia',
  ES: 'Spain',
  SE: 'Sweden',
};

const GEO_CODES = Object.keys(COUNTRIES);

// --- Datasets ---
const DATASETS = [
  { code: 'nama_10_gdp',         label: 'GDP and main components (output, expenditure, income)' },
  { code: 'nama_10_pc',          label: 'GDP per capita' },
  { code: 'lfsa_urgan',          label: 'Unemployment rate by sex, age and nationality' },
  { code: 'lfsa_egised',         label: 'Employment by sex, age and educational attainment level' },
  { code: 'educ_uoe_enrt01',     label: 'Students enrolled in education' },
  { code: 'educ_uoe_grad02',     label: 'Graduates by education level' },
  { code: 'hlth_silc_04',        label: 'Self-perceived health status' },
  { code: 'demo_pjan',           label: 'Population on 1 January by age and sex' },
  { code: 'demo_gind',           label: 'Demographic balance and crude rates' },
  { code: 'ilc_li01',            label: 'At-risk-of-poverty rate (after social transfers)' },
  { code: 'ilc_di04',            label: 'Gini coefficient of equivalised disposable income' },
  { code: 'earn_ses_monthly',    label: 'Mean monthly earnings by sex and economic activity' },
  { code: 'isoc_ci_ifp_iu',      label: 'Internet use by individuals' },
  { code: 'tour_occ_nim',        label: 'Nights spent at tourist accommodation establishments' },
  { code: 'env_air_gge',         label: 'Greenhouse gas emissions by source sector' },
  { code: 'nrg_bal_c',           label: 'Energy balance' },
  { code: 'sbs_na_ind_r2',       label: 'Industry statistics by NACE Rev.2' },
  { code: 'bd_9ac_l_form_r2',    label: 'Business demography — number of enterprises by legal form' },
  { code: 'isoc_sk_dskl_i21',    label: 'Individuals with digital skills' },
  { code: 'crim_off_cat',        label: 'Crimes recorded by the police' },
  { code: 'migr_imm1ctz',        label: 'Immigration by citizenship' },
  { code: 'lfsa_ewpshi',         label: 'Employees working part-time' },
  { code: 'earn_gr_gpgr2',       label: 'Gender pay gap in unadjusted form' },
  { code: 'sdg_08_10',           label: 'Employment rate (SDG indicator 8.5)' },
  { code: 'tps00203',            label: 'Healthy life years at birth' },
  { code: 'tec00114',            label: 'Total general government expenditure' },
  { code: 'tec00127',            label: 'Gross domestic investment (total)' },
  { code: 'prc_hicp_aind',       label: 'Harmonised Index of Consumer Prices (HICP) — annual average' },
  { code: 'lfsa_etgar',          label: 'Temporary employment by sex, age and educational attainment' },
  { code: 'rd_e_gerdtot',        label: 'Total intramural R&D expenditure (GERD)' },
  { code: 'pat_ep_ntot',         label: 'Patent applications to the EPO' },
  { code: 'htec_emp_nat2',       label: 'Employment in technology and knowledge-intensive sectors' },
  { code: 'sbs_sc_ovw',          label: 'Business statistics overview' },
  { code: 'hlth_cd_acdr2',       label: 'Causes of death — standardised death rate' },
  { code: 'tin00171',            label: 'Total tax revenue as % of GDP' },
  { code: 'isoc_bde15b_h',       label: 'Enterprises using social media' },
  { code: 'lfso_20lawksc',       label: 'Average number of usual weekly hours of work' },
  { code: 'tran_hv_psmod',       label: 'Modal split of passenger transport' },
  { code: 'cult_emp_sex',        label: 'Employment in cultural sectors by sex' },
  { code: 'st_int_arvl',         label: 'International tourist arrivals' },
];

// --- Helpers ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Decode a flat value-array index back into per-dimension indices.
 * Row-major order (last dimension changes fastest).
 */
function decodeIndex(flatIdx, sizes) {
  const indices = new Array(sizes.length);
  let remaining = flatIdx;
  for (let d = sizes.length - 1; d >= 0; d--) {
    indices[d] = remaining % sizes[d];
    remaining = Math.floor(remaining / sizes[d]);
  }
  return indices;
}

/**
 * Build a reverse lookup: position → code, for a dimension's category.index map.
 * e.g. { 0: "AT", 1: "BE", ... }
 */
function buildReverseIndex(categoryIndex) {
  const rev = {};
  for (const [code, pos] of Object.entries(categoryIndex)) {
    rev[pos] = code;
  }
  return rev;
}

/**
 * Parse Eurostat JSON-stat 2.0 response.
 * Returns an array of { countryCode, year, value } — filtered to known GEO_CODES.
 */
function parseJsonStat(data) {
  const { id, size, dimension, value } = data;

  if (!id || !size || !dimension || value === undefined) return [];

  // Find geo and time dimension positions by checking id array
  const geoPos = id.findIndex(d => d.toLowerCase() === 'geo');
  let timePos = id.findIndex(d => d.toLowerCase() === 'time');
  if (timePos === -1) timePos = id.findIndex(d => d.toLowerCase() === 'time_period');

  if (geoPos === -1 || timePos === -1) return [];

  // Build reverse maps for ALL dimensions
  const reverses = id.map(dimName => {
    const dim = dimension[dimName];
    if (!dim?.category?.index) return {};
    return buildReverseIndex(dim.category.index);
  });

  const geoRev = reverses[geoPos];
  const timeRev = reverses[timePos];

  if (!Object.keys(geoRev).length || !Object.keys(timeRev).length) return [];

  // Build label for extra dimensions (unit, sex, age, etc.)
  const extraDims = id.map((dimName, i) => {
    if (i === geoPos || i === timePos) return null;
    const dim = dimension[dimName];
    const labels = dim?.category?.label || {};
    return { pos: i, name: dimName, labels, rev: reverses[i] };
  }).filter(Boolean);

  const results = [];

  for (const [flatIdxStr, val] of Object.entries(value)) {
    if (val === null || val === undefined) continue;
    const flatIdx = parseInt(flatIdxStr, 10);
    const indices = decodeIndex(flatIdx, size);

    const geoCode = geoRev[indices[geoPos]];
    const yearStr = timeRev[indices[timePos]];

    if (!geoCode || !yearStr) continue;
    if (!GEO_CODES.includes(geoCode)) continue;

    // Build extra context from other dimensions
    const extras = extraDims.map(d => {
      const code = d.rev[indices[d.pos]];
      const label = d.labels[code] || code;
      return label;
    }).filter(l => l && l !== 'Annual' && l !== 'Total');

    results.push({
      countryCode: geoCode,
      year: yearStr,
      value: val,
      extra: extras.length ? extras.join(', ') : '',
    });
  }

  return results;
}

/**
 * Build a human-readable context sentence for a data point.
 */
function buildContext(dataset, country, value, year, extra) {
  const detail = extra ? ` (${extra})` : '';
  return `${country} ${dataset.label.toLowerCase()}${detail} was ${value} in ${year}. Source: Eurostat ${dataset.code}.`;
}

/**
 * Fetch one dataset from the Eurostat API.
 * Returns array of formatted dataPoints, or null on failure.
 */
async function fetchDataset(dataset) {
  const geoParams = GEO_CODES.map(c => `geo=${c}`).join('&');
  const url =
    `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset.code}` +
    `?format=JSON&lang=en&sinceTimePeriod=2015&untilTimePeriod=2024` +
    `&${geoParams}`;

  let resp;
  try {
    resp = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    console.error(`  [${dataset.code}] Network error: ${err.message}`);
    return null;
  }

  if (!resp.ok) {
    console.error(`  [${dataset.code}] HTTP ${resp.status} — skipping`);
    return null;
  }

  let json;
  try {
    json = await resp.json();
  } catch (err) {
    console.error(`  [${dataset.code}] JSON parse error: ${err.message}`);
    return null;
  }

  const raw = parseJsonStat(json);
  if (raw.length === 0) {
    console.warn(`  [${dataset.code}] No matching data points extracted`);
    return [];
  }

  const dataPoints = raw.map(({ countryCode, year, value, extra }) => ({
    context: buildContext(dataset, COUNTRIES[countryCode], value, year, extra),
    country: COUNTRIES[countryCode],
    countryCode,
    metric: dataset.label,
    indicator: dataset.code,
    value,
    year,
    source: 'Eurostat',
  }));

  return dataPoints;
}

// --- Main ---
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let totalPoints = 0;
  let successCount = 0;
  let failCount = 0;

  console.log(`Eurostat API Core — ${DATASETS.length} datasets, ${GEO_CODES.length} countries`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  for (let i = 0; i < DATASETS.length; i++) {
    const dataset = DATASETS[i];
    const prefix = `[${String(i + 1).padStart(2, '0')}/${DATASETS.length}]`;
    process.stdout.write(`${prefix} ${dataset.code} ... `);

    const dataPoints = await fetchDataset(dataset);

    if (dataPoints === null) {
      console.log('FAILED');
      failCount++;
    } else {
      const output = {
        source: 'Eurostat',
        dataset: dataset.code,
        label: dataset.label,
        fetchedAt: new Date().toISOString(),
        countries: GEO_CODES,
        dataPoints,
      };

      const outPath = join(OUTPUT_DIR, `${dataset.code}.json`);
      writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8');

      console.log(`OK — ${dataPoints.length} points`);
      totalPoints += dataPoints.length;
      successCount++;
    }

    // Delay between requests (skip after last)
    if (i < DATASETS.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`Datasets: ${successCount} OK, ${failCount} failed`);
  console.log(`Total data points: ${totalPoints.toLocaleString()}`);
  console.log(`Output dir: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
