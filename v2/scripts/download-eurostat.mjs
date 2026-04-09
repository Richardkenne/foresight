/**
 * Eurostat Bulk Data Downloader for Foresight RAG System
 * Downloads key EU socioeconomic datasets and formats them for RAG ingestion.
 *
 * Usage: node scripts/download-eurostat.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/eurostat');
const TODAY = '2026-04-07';
const DELAY_MS = 350; // 350ms between requests to be polite

// --- Country mapping ---
const COUNTRIES = {
  IT: 'Italy',
  DE: 'Germany',
  FR: 'France',
  ES: 'Spain',
  NL: 'Netherlands',
  CH: 'Switzerland',
  SE: 'Sweden',
  PL: 'Poland',
  BE: 'Belgium',
  AT: 'Austria',
  NO: 'Norway',
  DK: 'Denmark',
  IE: 'Ireland',
  PT: 'Portugal',
  UK: 'United Kingdom',
};

const GEO_CODES = Object.keys(COUNTRIES);

// --- Dataset definitions ---
const DATASETS = [
  {
    code: 'nama_10_gdp',
    metric: 'gdp',
    label: 'GDP and main components',
    unit: 'million_euro',
    context_template: (country, value, year) =>
      `${country} GDP was ${value} million EUR in ${year} (Eurostat nama_10_gdp).`,
    extra_params: 'na_item=B1GQ&unit=CP_MEUR&time=2023',
  },
  {
    code: 'une_rt_m',
    metric: 'unemployment_rate_monthly',
    label: 'Unemployment rate (monthly)',
    unit: 'percent',
    context_template: (country, value, year) =>
      `${country} monthly unemployment rate was ${value}% in ${year} (Eurostat une_rt_m).`,
    extra_params: 'sex=T&age=TOTAL&s_adj=SA&unit=PC_ACT',
  },
  {
    code: 'earn_mw_cur',
    metric: 'minimum_wage',
    label: 'Minimum wages',
    unit: 'euro_per_month',
    context_template: (country, value, year) =>
      `${country} statutory minimum wage was ${value} EUR/month in ${year} (Eurostat earn_mw_cur).`,
    extra_params: 'currency=EUR',
  },
  {
    code: 'ilc_di01',
    metric: 'median_income',
    label: 'Median equivalised net income',
    unit: 'euro_per_year',
    context_template: (country, value, year) =>
      `${country} median equivalised net income was ${value} EUR/year in ${year} (Eurostat ilc_di01).`,
    extra_params: 'unit=EUR&indic_il=MED_E',
  },
  {
    code: 'ilc_lvho02',
    metric: 'housing_cost_overburden_rate',
    label: 'Housing cost overburden rate',
    unit: 'percent',
    context_template: (country, value, year) =>
      `${country} housing cost overburden rate was ${value}% in ${year} — proportion of population spending >40% of income on housing (Eurostat ilc_lvho02).`,
    extra_params: 'unit=PC&incgrp=TOTAL&hhtyp=TOTAL',
  },
  {
    code: 'isoc_ci_ifp_iu',
    metric: 'internet_usage_rate',
    label: 'Internet usage by individuals',
    unit: 'percent',
    context_template: (country, value, year) =>
      `${country} internet usage rate among individuals was ${value}% in ${year} (Eurostat isoc_ci_ifp_iu).`,
    extra_params: 'indic_is=I_IUSE&unit=PC_IND&ind_type=IND_TOTAL',
  },
  {
    code: 'educ_uoe_enrt01',
    metric: 'education_enrollment',
    label: 'Students enrolled by education level',
    unit: 'number',
    context_template: (country, value, year) =>
      `${country} had ${value} students enrolled in tertiary education in ${year} (Eurostat educ_uoe_enrt01).`,
    extra_params: 'isced11=ED5-8&sex=T&unit=NR',
  },
  {
    code: 'demo_mlexpec',
    metric: 'life_expectancy',
    label: 'Life expectancy at birth',
    unit: 'years',
    context_template: (country, value, year) =>
      `${country} life expectancy at birth was ${value} years in ${year} (Eurostat demo_mlexpec).`,
    extra_params: 'sex=T&age=Y_LT1',
  },
  {
    code: 'demo_find',
    metric: 'fertility_rate',
    label: 'Fertility indicators',
    unit: 'children_per_woman',
    context_template: (country, value, year) =>
      `${country} total fertility rate was ${value} children per woman in ${year} (Eurostat demo_find).`,
    extra_params: 'indic_de=TOTFERRT',
  },
  {
    code: 'tour_occ_nim',
    metric: 'tourism_nights_spent',
    label: 'Nights spent at tourist accommodation',
    unit: 'million_nights',
    context_template: (country, value, year) =>
      `${country} had ${value} million tourist nights spent in ${year} (Eurostat tour_occ_nim).`,
    extra_params: 'nace_r2=I5510&unit=NR&c_resid=TOTAL',
  },
  {
    code: 'tin00098',
    metric: 'ease_of_starting_business',
    label: 'Ease of doing business — starting a business',
    unit: 'days',
    context_template: (country, value, year) =>
      `${country} required ${value} days to start a business in ${year} (Eurostat/World Bank tin00098).`,
    extra_params: '',
  },
  {
    code: 'tps00001',
    metric: 'population_total',
    label: 'Population total',
    unit: 'persons',
    context_template: (country, value, year) =>
      `${country} population was ${value.toLocaleString()} persons in ${year} (Eurostat tps00001).`,
    extra_params: '',
  },
  {
    code: 'sbs_na_ind_r2',
    metric: 'enterprise_births',
    label: 'Business demography — enterprise births',
    unit: 'number',
    context_template: (country, value, year) =>
      `${country} had ${value} enterprise births in ${year} (Eurostat sbs_na_ind_r2).`,
    extra_params: 'indic_sb=V97510&nace_r2=B-S_X_K642&sizeclas=TOTAL',
  },
  {
    code: 'hlth_sha11_hf',
    metric: 'healthcare_expenditure',
    label: 'Healthcare expenditure by financing scheme',
    unit: 'million_euro',
    context_template: (country, value, year) =>
      `${country} total healthcare expenditure was ${value} million EUR in ${year} (Eurostat hlth_sha11_hf).`,
    extra_params: 'unit=MIO_EUR&icha11_hf=HF&icha11_hc=HC_TOT',
  },
  {
    code: 'tsdsc100',
    metric: 'poverty_risk_rate',
    label: 'At-risk-of-poverty rate',
    unit: 'percent',
    context_template: (country, value, year) =>
      `${country} at-risk-of-poverty rate was ${value}% of the population in ${year} (Eurostat tsdsc100).`,
    extra_params: '',
  },
];

// --- Utilities ---
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function buildUrl(datasetCode, extraParams) {
  const geoParam = GEO_CODES.map((g) => `geo=${g}`).join('&');
  const base = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${datasetCode}?format=JSON&lang=en&${geoParam}`;
  return extraParams ? `${base}&${extraParams}` : base;
}

/**
 * Parse Eurostat JSON-STAT format.
 * Returns array of { countryCode, year, value }
 */
function parseEurostatResponse(data, datasetCode) {
  const results = [];

  if (!data || !data.dimension || !data.value) {
    return results;
  }

  const dims = data.id; // ordered list of dimension names, e.g. ["freq","unit","geo","time"]
  const sizes = data.size; // size of each dimension
  const values = data.value; // flat object { "0": val, "123": val, ... } OR array
  const dimData = data.dimension;

  // Find geo and time dimension indices
  const geoIdx = dims.indexOf('geo');
  const timeIdx = dims.indexOf('time');

  if (geoIdx === -1 || timeIdx === -1) {
    // Try alternate dimension names
    const altGeoIdx = dims.findIndex((d) => d.toLowerCase().includes('geo'));
    const altTimeIdx = dims.findIndex((d) => d.toLowerCase() === 'time' || d.toLowerCase() === 'timeperiod');
    if (altGeoIdx === -1 || altTimeIdx === -1) {
      console.log(`  [warn] Could not find geo/time dimensions in ${datasetCode}. Dims: ${dims.join(', ')}`);
      return results;
    }
  }

  const geoI = geoIdx === -1 ? dims.findIndex((d) => d.toLowerCase().includes('geo')) : geoIdx;
  const timeI = timeIdx === -1 ? dims.findIndex((d) => d.toLowerCase() === 'time') : timeIdx;

  // Build geo category index → code map
  const geoCats = dimData[dims[geoI]]?.category;
  const timeCats = dimData[dims[timeI]]?.category;

  if (!geoCats || !timeCats) return results;

  // category.index is { "DE": 0, "FR": 1, ... } → invert to { 0: "DE", 1: "FR" }
  const geoIndexToCode = Object.fromEntries(
    Object.entries(geoCats.index || {}).map(([code, idx]) => [idx, code])
  );
  const timeIndexToYear = Object.fromEntries(
    Object.entries(timeCats.index || {}).map(([period, idx]) => [idx, period])
  );

  // Compute stride for each dimension
  const strides = new Array(dims.length).fill(1);
  for (let d = dims.length - 2; d >= 0; d--) {
    strides[d] = strides[d + 1] * sizes[d + 1];
  }

  // Iterate over non-geo/time dims and collect latest value per geo
  const nTotal = sizes.reduce((a, b) => a * b, 1);

  // group by (geo, time) → best value
  const seen = new Map(); // key: `${geoCode}|${year}` → value

  for (const [flatIdx, val] of Object.entries(values)) {
    if (val === null || val === undefined) continue;
    const idx = parseInt(flatIdx);

    // Decompose flat index to per-dimension indices
    const dimIndices = [];
    let remaining = idx;
    for (let d = 0; d < dims.length; d++) {
      dimIndices.push(Math.floor(remaining / strides[d]));
      remaining = remaining % strides[d];
    }

    const geoCode = geoIndexToCode[dimIndices[geoI]];
    const timePeriod = timeIndexToYear[dimIndices[timeI]];

    if (!geoCode || !timePeriod || !COUNTRIES[geoCode]) continue;

    const key = `${geoCode}|${timePeriod}`;
    // Keep the first non-null value found (can be refined later)
    if (!seen.has(key)) {
      seen.set(key, val);
    }
  }

  // Convert to results array, keeping only the most recent year per country
  const latestByCountry = new Map(); // geoCode → { year, value }

  for (const [key, val] of seen) {
    const [geoCode, timePeriod] = key.split('|');
    // Extract year from period strings like "2023", "2023Q1", "2023M01"
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

// --- Main ---
async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let totalPoints = 0;
  let totalDatasets = 0;
  let failedDatasets = [];

  console.log(`\nEurostat Bulk Downloader — Foresight RAG System`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Countries: ${GEO_CODES.join(', ')}`);
  console.log(`Datasets: ${DATASETS.length}\n`);
  console.log('='.repeat(60));

  for (const dataset of DATASETS) {
    const url = buildUrl(dataset.code, dataset.extra_params);
    console.log(`\n[${DATASETS.indexOf(dataset) + 1}/${DATASETS.length}] ${dataset.code} — ${dataset.label}`);
    console.log(`  URL: ${url.slice(0, 120)}...`);

    let rawData;
    try {
      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Foresight-RAG-Builder/1.0' },
        signal: AbortSignal.timeout(30000),
      });

      if (!resp.ok) {
        // Some datasets require specific params — try without extra_params as fallback
        if (dataset.extra_params) {
          console.log(`  [warn] ${resp.status} with extra params, retrying without...`);
          await sleep(DELAY_MS);
          const fallbackUrl = buildUrl(dataset.code, '');
          const fallbackResp = await fetch(fallbackUrl, {
            headers: { 'Accept': 'application/json', 'User-Agent': 'Foresight-RAG-Builder/1.0' },
            signal: AbortSignal.timeout(30000),
          });
          if (!fallbackResp.ok) {
            throw new Error(`HTTP ${fallbackResp.status}: ${fallbackResp.statusText}`);
          }
          rawData = await fallbackResp.json();
        } else {
          throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
        }
      } else {
        rawData = await resp.json();
      }
    } catch (err) {
      console.log(`  [ERROR] Failed to fetch ${dataset.code}: ${err.message}`);
      failedDatasets.push({ code: dataset.code, error: err.message });
      await sleep(DELAY_MS);
      continue;
    }

    // Parse the JSON-STAT response
    const parsed = parseEurostatResponse(rawData, dataset.code);
    console.log(`  Parsed ${parsed.length} data points across ${new Set(parsed.map(p => p.countryCode)).size} countries`);

    if (parsed.length === 0) {
      console.log(`  [warn] No data points extracted — skipping file write`);
      failedDatasets.push({ code: dataset.code, error: 'Zero data points after parsing' });
      await sleep(DELAY_MS);
      continue;
    }

    // Format for RAG
    const dataPoints = parsed.map((p, i) => {
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

    // Sort by country name then year desc
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

    const filename = `${dataset.code}.json`;
    const filepath = join(OUTPUT_DIR, filename);
    writeFileSync(filepath, JSON.stringify(output, null, 2));
    console.log(`  Saved: ${filename} (${dataPoints.length} points)`);

    totalPoints += dataPoints.length;
    totalDatasets++;

    await sleep(DELAY_MS);
  }

  // Write an index file
  const indexOutput = {
    metadata: {
      source: 'Eurostat',
      generatedAt: TODAY,
      totalDatasets,
      totalDataPoints: totalPoints,
      failedDatasets: failedDatasets.length,
      countries: GEO_CODES.map(code => ({ code, name: COUNTRIES[code] })),
    },
    datasets: DATASETS.map(d => ({
      code: d.code,
      label: d.label,
      metric: d.metric,
      unit: d.unit,
      file: `${d.code}.json`,
      failed: failedDatasets.some(f => f.code === d.code),
    })),
    failedDatasets,
  };
  writeFileSync(join(OUTPUT_DIR, '_index.json'), JSON.stringify(indexOutput, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log(`DONE`);
  console.log(`  Successful datasets : ${totalDatasets}/${DATASETS.length}`);
  console.log(`  Failed datasets     : ${failedDatasets.length}`);
  if (failedDatasets.length > 0) {
    console.log(`  Failed             : ${failedDatasets.map(f => f.code).join(', ')}`);
  }
  console.log(`  Total data points   : ${totalPoints}`);
  console.log(`  Output directory    : ${OUTPUT_DIR}`);
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
