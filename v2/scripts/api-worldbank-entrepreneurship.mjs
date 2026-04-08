#!/usr/bin/env node
// Fetch entrepreneurship & business indicators from World Bank API
// Output: data/cultural/entrepreneurship-global/*.json

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'entrepreneurship-global');
mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://api.worldbank.org/v2/country/all/indicator';
const DATE_RANGE = '2018:2024';
// Doing Business indicators were discontinued in 2021; use wider range to get last available data
const DATE_RANGE_LEGACY = '2004:2024';

const INDICATORS = [
  { code: 'IC.BUS.NDNS.ZS', name: 'new-business-density' },
  { code: 'IC.REG.PROC', name: 'business-registration-procedures', legacy: true },
  { code: 'IC.REG.DURS', name: 'time-to-start-business-days', legacy: true },
  { code: 'IC.REG.COST.PC.ZS', name: 'cost-to-start-business-pct-gni', legacy: true },
  { code: 'IC.TAX.TOTL.CP.ZS', name: 'total-tax-rate-pct-profits', legacy: true },
  { code: 'IC.FRM.CORR.ZS', name: 'firms-experiencing-bribery-pct' },
  { code: 'IC.CRD.INFO.XQ', name: 'credit-information-depth-index', legacy: true },
  { code: 'IC.LGL.CRED.XQ', name: 'strength-legal-rights-index', legacy: true },
  { code: 'NY.GDP.MKTP.KD.ZG', name: 'gdp-growth-annual-pct' },
  { code: 'FP.CPI.TOTL.ZG', name: 'inflation-consumer-prices-pct' },
  { code: 'SL.UEM.TOTL.ZS', name: 'unemployment-total-pct' },
  { code: 'SL.UEM.1524.ZS', name: 'youth-unemployment-pct' },
  { code: 'NE.EXP.GNFS.ZS', name: 'exports-pct-gdp' },
  { code: 'BX.KLT.DINV.WD.GD.ZS', name: 'fdi-inflows-pct-gdp' },
];

async function fetchIndicator({ code, name, legacy }) {
  const dateRange = legacy ? DATE_RANGE_LEGACY : DATE_RANGE;
  const url = `${BASE}/${code}?format=json&per_page=500&date=${dateRange}`;
  let allRecords = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const pageUrl = `${url}&page=${page}`;
    const res = await fetch(pageUrl);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${code} page ${page}`);
      break;
    }
    const json = await res.json();
    if (!json || json.length < 2) {
      console.error(`  No data for ${code}`);
      break;
    }

    const [meta, data] = json;
    totalPages = meta.pages || 1;

    // Filter out null values and aggregate entries
    const records = (data || [])
      .filter(d => d.value !== null)
      .map(d => ({
        country: d.country.value,
        countryCode: d.countryiso3code,
        year: parseInt(d.date),
        value: d.value,
      }));

    allRecords = allRecords.concat(records);
    page++;
  }

  const output = {
    indicator: code,
    name: name,
    description: allRecords.length > 0 ? `World Bank ${code}` : 'No data',
    dateRange: legacy ? DATE_RANGE_LEGACY : DATE_RANGE,
    fetchedAt: new Date().toISOString(),
    totalRecords: allRecords.length,
    data: allRecords,
  };

  const filePath = join(OUT_DIR, `${name}.json`);
  writeFileSync(filePath, JSON.stringify(output, null, 2));
  return allRecords.length;
}

async function main() {
  console.log(`Fetching ${INDICATORS.length} indicators from World Bank API...`);
  let totalDataPoints = 0;

  // Fetch 3 at a time to avoid overwhelming the API
  for (let i = 0; i < INDICATORS.length; i += 3) {
    const batch = INDICATORS.slice(i, i + 3);
    const results = await Promise.all(batch.map(ind => {
      console.log(`  Fetching ${ind.code} (${ind.name})...`);
      return fetchIndicator(ind);
    }));
    for (let j = 0; j < batch.length; j++) {
      console.log(`  -> ${batch[j].name}: ${results[j]} records`);
      totalDataPoints += results[j];
    }
  }

  console.log(`\nDone. Total data points: ${totalDataPoints}`);
  console.log(`Files saved to: data/cultural/entrepreneurship-global/`);
}

main().catch(console.error);
