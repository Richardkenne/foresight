#!/usr/bin/env node
// Fetch poverty & inequality indicators from World Bank API
// Output: data/cultural/poverty-inequality/*.json

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'poverty-inequality');

const INDICATORS = [
  { id: 'SI.POV.DDAY',       file: 'poverty-headcount-2.15-day.json',     label: 'Poverty headcount $2.15/day (%)' },
  { id: 'SI.POV.LMIC',       file: 'poverty-headcount-3.65-day.json',     label: 'Poverty headcount $3.65/day (%)' },
  { id: 'SI.POV.UMIC',       file: 'poverty-headcount-6.85-day.json',     label: 'Poverty headcount $6.85/day (%)' },
  { id: 'SI.DST.FRST.20',    file: 'income-share-bottom-20.json',         label: 'Income share bottom 20%' },
  { id: 'SI.DST.05TH.20',    file: 'income-share-top-20.json',            label: 'Income share top 20%' },
  { id: 'SI.POV.GINI',       file: 'gini-index.json',                     label: 'GINI index' },
  { id: 'NY.GDP.PCAP.CD',    file: 'gdp-per-capita-usd.json',             label: 'GDP per capita (current USD)' },
  { id: 'NY.GDP.PCAP.PP.CD', file: 'gdp-per-capita-ppp.json',             label: 'GDP per capita (PPP)' },
  { id: 'NY.GNP.PCAP.CD',    file: 'gni-per-capita.json',                 label: 'GNI per capita (current USD)' },
  { id: 'SI.SPR.PCAP.ZG',    file: 'survey-mean-consumption-growth.json',  label: 'Survey mean consumption growth (%)' },
  { id: 'per_allsp.cov_pop_tot', file: 'social-protection-coverage.json', label: 'Social protection coverage (%)' },
  { id: 'SL.TLF.TOTL.IN',    file: 'total-labor-force.json',              label: 'Total labor force' },
];

const BASE = 'https://api.worldbank.org/v2/country/all/indicator';
const PARAMS = 'format=json&per_page=500&date=2015:2024';

async function fetchIndicator(ind) {
  const url = `${BASE}/${ind.id}?${PARAMS}`;
  console.log(`Fetching ${ind.id} ...`);

  // World Bank may paginate; fetch all pages
  let allRecords = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const pageUrl = `${url}&page=${page}`;
    const res = await fetch(pageUrl);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${ind.id} page ${page}`);
      break;
    }
    const json = await res.json();
    // json[0] = metadata, json[1] = data array
    if (!json[1]) {
      console.warn(`  No data for ${ind.id}`);
      break;
    }
    totalPages = json[0].pages;
    allRecords = allRecords.concat(json[1]);
    page++;
  }

  // Filter out entries with null value and aggregate-only country codes
  const AGGREGATE_CODES = new Set([
    'WLD','LIC','LMC','UMC','HIC','LMY','MIC','EAS','ECS','LCN','MEA','NAC','SAS','SSF',
    'ARB','CSS','EAP','ECA','EMU','FCS','HPC','IBD','IBT','IDA','IDB','IDX','INX',
    'LAC','LDC','LTE','MNA','OED','OSS','PRE','PSS','PST','SSA','SST','TEA','TEC','TLA',
    'TMN','TSA','TSS','AFE','AFW','CEB','EAR','ECR','LCR','MEU','NOC','TCA','CLA','CEU',
  ]);

  const records = allRecords
    .filter(r => r.value !== null && !AGGREGATE_CODES.has(r.countryiso3code))
    .map(r => ({
      country: r.country.value,
      iso3: r.countryiso3code,
      year: parseInt(r.date),
      value: r.value,
    }));

  const output = {
    indicator: ind.id,
    label: ind.label,
    source: 'World Bank',
    dateRange: '2015-2024',
    fetchedAt: new Date().toISOString(),
    totalRecords: records.length,
    data: records,
  };

  const outPath = join(OUT_DIR, ind.file);
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`  Saved ${records.length} records -> ${ind.file}`);
  return { id: ind.id, records: records.length };
}

async function main() {
  console.log(`\nFetching ${INDICATORS.length} poverty/inequality indicators from World Bank...\n`);
  const results = [];

  // Fetch 3 at a time to avoid hammering the API
  for (let i = 0; i < INDICATORS.length; i += 3) {
    const batch = INDICATORS.slice(i, i + 3);
    const batchResults = await Promise.all(batch.map(fetchIndicator));
    results.push(...batchResults);
  }

  console.log('\n--- Summary ---');
  let total = 0;
  for (const r of results) {
    console.log(`  ${r.id}: ${r.records} records`);
    total += r.records;
  }
  console.log(`\nTotal: ${total} records across ${results.length} indicators`);
}

main().catch(console.error);
