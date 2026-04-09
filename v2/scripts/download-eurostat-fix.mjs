/**
 * Eurostat Fix Script — retries failed datasets using https module with IPv4 forced.
 * Node.js fetch hangs on IPv6 for ec.europa.eu; using https.get with family:4 solves it.
 *
 * Usage: node scripts/download-eurostat-fix.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import dns from 'dns';

// Force IPv4 DNS resolution — ec.europa.eu IPv6 routes are unreachable from this machine
dns.setDefaultResultOrder('ipv4first');

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/eurostat');
const TODAY = '2026-04-07';
const DELAY_MS = 400;

const COUNTRIES = {
  IT: 'Italy', DE: 'Germany', FR: 'France', ES: 'Spain', NL: 'Netherlands',
  CH: 'Switzerland', SE: 'Sweden', PL: 'Poland', BE: 'Belgium', AT: 'Austria',
  NO: 'Norway', DK: 'Denmark', IE: 'Ireland', PT: 'Portugal', UK: 'United Kingdom',
};
const GEO_CODES = Object.keys(COUNTRIES);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** HTTP GET using https module with IPv4 forced */
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: { 'User-Agent': 'Foresight-RAG-Builder/1.0', 'Accept': 'application/json' },
      family: 4, // force IPv4
    };
    const req = https.get(options, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
        } else {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error(`JSON parse error: ${e.message}`)); }
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function buildUrl(datasetCode, extraParams) {
  const geoParam = GEO_CODES.map((g) => `geo=${g}`).join('&');
  const base = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${datasetCode}?format=JSON&lang=en&${geoParam}`;
  return extraParams ? `${base}&${extraParams}` : base;
}

function parseEurostatResponse(data, datasetCode) {
  const results = [];
  if (!data || !data.dimension || !data.value) return results;

  const dims = data.id;
  const sizes = data.size;
  const values = data.value;
  const dimData = data.dimension;

  const geoI = dims.findIndex((d) => d.toLowerCase() === 'geo' || d.toLowerCase().includes('geo'));
  const timeI = dims.findIndex((d) => d.toLowerCase() === 'time');

  if (geoI === -1 || timeI === -1) {
    console.log(`  [warn] Cannot find geo/time dims in ${datasetCode}. Dims: ${dims.join(', ')}`);
    return results;
  }

  const geoCats = dimData[dims[geoI]]?.category;
  const timeCats = dimData[dims[timeI]]?.category;
  if (!geoCats || !timeCats) return results;

  const geoIndexToCode = Object.fromEntries(
    Object.entries(geoCats.index || {}).map(([code, idx]) => [idx, code])
  );
  const timeIndexToYear = Object.fromEntries(
    Object.entries(timeCats.index || {}).map(([period, idx]) => [idx, period])
  );

  const strides = new Array(dims.length).fill(1);
  for (let d = dims.length - 2; d >= 0; d--) {
    strides[d] = strides[d + 1] * sizes[d + 1];
  }

  const latestByCountry = new Map();

  for (const [flatIdx, val] of Object.entries(values)) {
    if (val === null || val === undefined) continue;
    const idx = parseInt(flatIdx);
    const dimIndices = [];
    let remaining = idx;
    for (let d = 0; d < dims.length; d++) {
      dimIndices.push(Math.floor(remaining / strides[d]));
      remaining = remaining % strides[d];
    }

    const geoCode = geoIndexToCode[dimIndices[geoI]];
    const timePeriod = timeIndexToYear[dimIndices[timeI]];
    if (!geoCode || !timePeriod || !COUNTRIES[geoCode]) continue;

    const yearMatch = timePeriod.match(/^(\d{4})/);
    if (!yearMatch) continue;
    const year = parseInt(yearMatch[1]);

    const existing = latestByCountry.get(geoCode);
    if (!existing || year > existing.year) {
      latestByCountry.set(geoCode, { year, value: val });
    }
  }

  for (const [geoCode, { year, value }] of latestByCountry) {
    results.push({ countryCode: geoCode, year, value });
  }

  return results;
}

async function fetchAndSave(dataset) {
  const url = buildUrl(dataset.code, dataset.extra_params);
  console.log(`\n${dataset.code} — ${dataset.label}`);
  console.log(`  Fetching...`);

  let rawData;
  try {
    rawData = await httpsGet(url);
  } catch (err) {
    // Fallback: retry without extra params
    if (dataset.extra_params) {
      console.log(`  [warn] Failed (${err.message.slice(0, 60)}), retrying without extra params...`);
      await sleep(DELAY_MS);
      try {
        rawData = await httpsGet(buildUrl(dataset.code, ''));
      } catch (err2) {
        console.log(`  [ERROR] ${err2.message.slice(0, 80)}`);
        return { code: dataset.code, success: false, error: err2.message };
      }
    } else {
      console.log(`  [ERROR] ${err.message.slice(0, 80)}`);
      return { code: dataset.code, success: false, error: err.message };
    }
  }

  const parsed = parseEurostatResponse(rawData, dataset.code);
  console.log(`  Parsed ${parsed.length} points across ${new Set(parsed.map(p => p.countryCode)).size} countries`);

  if (parsed.length === 0) {
    console.log(`  [warn] Zero data points`);
    return { code: dataset.code, success: false, error: 'Zero data points' };
  }

  const dataPoints = parsed.map((p) => {
    const country = COUNTRIES[p.countryCode] || p.countryCode;
    const numericValue = typeof p.value === 'number' ? p.value : parseFloat(p.value);
    return {
      id: `EU-${dataset.code.toUpperCase().replace(/_/g, '')}-${p.countryCode}-${p.year}`,
      country,
      countryCode: p.countryCode,
      metric: dataset.metric,
      label: dataset.label,
      value: isNaN(numericValue) ? p.value : numericValue,
      unit: dataset.unit,
      year: p.year,
      source: `Eurostat ${p.year}`,
      sourceUrl: `https://ec.europa.eu/eurostat/databrowser/view/${dataset.code}/default/table`,
      context: dataset.context_template(country, isNaN(numericValue) ? p.value : numericValue, p.year),
    };
  });

  dataPoints.sort((a, b) => a.country.localeCompare(b.country) || b.year - a.year);

  const output = {
    metadata: {
      source: 'Eurostat',
      dataset: dataset.code,
      datasetLabel: dataset.label,
      metric: dataset.metric,
      countries: [...new Set(dataPoints.map(p => p.country))],
      countryCodes: [...new Set(dataPoints.map(p => p.countryCode))],
      lastUpdated: TODAY,
      totalDataPoints: dataPoints.length,
      unitOfMeasure: dataset.unit,
      apiUrl: `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset.code}`,
    },
    dataPoints,
  };

  const filepath = join(OUTPUT_DIR, `${dataset.code}.json`);
  writeFileSync(filepath, JSON.stringify(output, null, 2));
  console.log(`  Saved: ${dataset.code}.json (${dataPoints.length} points)`);
  return { code: dataset.code, success: true, points: dataPoints.length };
}

// --- Fixed dataset definitions ---
const RETRY_DATASETS = [
  {
    code: 'nama_10_gdp',
    metric: 'gdp_million_eur',
    label: 'GDP (current prices, million EUR)',
    unit: 'million_euro',
    extra_params: 'na_item=B1GQ&unit=CP_MEUR&lastTimePeriod=1',
    context_template: (country, value, year) =>
      `${country} GDP was ${Number(value).toLocaleString()} million EUR in ${year} (Eurostat nama_10_gdp, current prices).`,
  },
  {
    code: 'une_rt_m',
    metric: 'unemployment_rate_monthly',
    label: 'Unemployment rate (monthly, seasonally adjusted)',
    unit: 'percent',
    extra_params: 'sex=T&age=TOTAL&s_adj=SA&unit=PC_ACT&lastTimePeriod=1',
    context_template: (country, value, year) =>
      `${country} monthly unemployment rate was ${value}% in ${year} (Eurostat une_rt_m, seasonally adjusted, total).`,
  },
  {
    code: 'isoc_ci_ifp_iu',
    metric: 'internet_usage_last_12months',
    label: 'Individuals who used the internet in the last 12 months',
    unit: 'percent',
    extra_params: 'indic_is=I_ILT12&unit=PC_IND&ind_type=IND_TOTAL',
    context_template: (country, value, year) =>
      `${country} internet usage rate (last 12 months) was ${value}% of individuals aged 16-74 in ${year} (Eurostat isoc_ci_ifp_iu).`,
  },
  {
    code: 'tour_occ_nim',
    metric: 'tourism_nights_all_accommodation',
    label: 'Annual nights spent at tourist accommodation (all types)',
    unit: 'nights',
    extra_params: 'nace_r2=I551-I553&unit=NR&c_resid=TOTAL&freq=A',
    context_template: (country, value, year) =>
      `${country} had ${Number(value).toLocaleString()} nights spent at all tourist accommodation types in ${year} (Eurostat tour_occ_nim).`,
  },
  {
    code: 'sbs_na_ind_r2',
    metric: 'enterprise_birth_rate',
    label: 'Enterprise birth rate',
    unit: 'percent_of_active_enterprises',
    extra_params: 'indic_sb=V97510R&nace_r2=B-N_X_K&lastTimePeriod=1',
    context_template: (country, value, year) =>
      `${country} enterprise birth rate was ${value}% of active enterprises in ${year} (Eurostat sbs_na_ind_r2, non-financial business economy).`,
  },
  {
    code: 'sdg_01_10',
    metric: 'poverty_social_exclusion_rate',
    label: 'People at risk of poverty or social exclusion (AROPE)',
    unit: 'percent',
    extra_params: 'unit=PC&lastTimePeriod=1',
    context_template: (country, value, year) =>
      `${country} had ${value}% of the population at risk of poverty or social exclusion in ${year} (Eurostat sdg_01_10, AROPE indicator).`,
  },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('\nEurostat Fix Script — IPv4-forced https module');
  console.log('='.repeat(60));

  let totalPoints = 0;
  let successes = 0;
  const failures = [];

  for (const dataset of RETRY_DATASETS) {
    const result = await fetchAndSave(dataset);
    if (result.success) {
      successes++;
      totalPoints += result.points;
    } else {
      failures.push(result);
    }
    await sleep(DELAY_MS);
  }

  console.log('\n' + '='.repeat(60));
  console.log('FIX SCRIPT DONE');
  console.log(`  Fixed : ${successes}/${RETRY_DATASETS.length}`);
  console.log(`  Points: ${totalPoints}`);
  if (failures.length > 0) {
    console.log(`  Still failing: ${failures.map(f => f.code).join(', ')}`);
    for (const f of failures) console.log(`    - ${f.code}: ${f.error.slice(0, 80)}`);
  }
  console.log('='.repeat(60) + '\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
