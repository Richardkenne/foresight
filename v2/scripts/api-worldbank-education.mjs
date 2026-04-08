#!/usr/bin/env node
// Fetch World Bank education indicators and save to data/cultural/education-global/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '..', 'data', 'cultural', 'education-global');

const INDICATORS = [
  { id: 'SE.XPD.TOTL.GD.ZS', name: 'education-expenditure-pct-gdp' },
  { id: 'SE.PRM.ENRR', name: 'primary-enrollment-gross' },
  { id: 'SE.SEC.ENRR', name: 'secondary-enrollment-gross' },
  { id: 'SE.TER.ENRR', name: 'tertiary-enrollment-gross' },
  { id: 'SE.ADT.LITR.ZS', name: 'adult-literacy-rate' },
  { id: 'SE.PRM.CMPT.ZS', name: 'primary-completion-rate' },
  { id: 'SE.SEC.CMPT.LO.ZS', name: 'lower-secondary-completion-rate' },
  { id: 'SE.ADT.1524.LT.ZS', name: 'youth-literacy-rate-15-24' },
  { id: 'SE.PRM.TENR', name: 'primary-enrollment-net' },
  { id: 'UIS.NERA.2', name: 'adjusted-net-enrollment-primary' },
  { id: 'SE.SEC.TENR', name: 'secondary-enrollment-net' },
  { id: 'SE.XPD.PRIM.PC.ZS', name: 'expenditure-per-student-primary' },
];

const BASE = 'https://api.worldbank.org/v2/country/all/indicator';
const PARAMS = 'format=json&per_page=500&date=2018:2024';

async function fetchAllPages(indicatorId) {
  let page = 1;
  let allRecords = [];
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${BASE}/${indicatorId}?${PARAMS}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${indicatorId} page ${page}`);
    const json = await res.json();

    if (!json || json.length < 2) break;

    const meta = json[0];
    totalPages = meta.pages || 1;
    const records = json[1] || [];
    allRecords.push(...records);
    page++;
  }

  return allRecords;
}

function transform(records) {
  return records
    .filter(r => r.value !== null)
    .map(r => ({
      countryCode: r.countryiso3code || r.country?.id,
      country: r.country?.value,
      year: parseInt(r.date),
      value: r.value,
      indicator: r.indicator?.id,
      indicatorName: r.indicator?.value,
    }));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let totalDataPoints = 0;

  for (const ind of INDICATORS) {
    process.stdout.write(`Fetching ${ind.id} (${ind.name})... `);
    try {
      const raw = await fetchAllPages(ind.id);
      const data = transform(raw);
      const outPath = path.join(OUT_DIR, `${ind.name}.json`);

      const output = {
        indicator: ind.id,
        name: ind.name,
        source: 'World Bank API v2',
        dateRange: '2018-2024',
        fetchedAt: new Date().toISOString(),
        totalRecords: data.length,
        data,
      };

      fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
      console.log(`${data.length} data points`);
      totalDataPoints += data.length;
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }

    // small delay to be polite to the API
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nDone. Total: ${totalDataPoints} data points across ${INDICATORS.length} indicators.`);
  console.log(`Saved to: ${OUT_DIR}`);
}

main().catch(console.error);
