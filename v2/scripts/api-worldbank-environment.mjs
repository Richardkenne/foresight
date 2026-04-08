#!/usr/bin/env node
// Fetch environment & climate indicators from World Bank API
// Output: data/cultural/environment-climate/*.json

import fs from 'fs';
import path from 'path';

const BASE = 'https://api.worldbank.org/v2/country/all/indicator';
const OUT_DIR = path.resolve('data/cultural/environment-climate');

const INDICATORS = [
  { id: 'EN.ATM.CO2E.PC', file: 'co2-emissions-per-capita.json', label: 'CO2 emissions per capita (metric tons)' },
  { id: 'AG.LND.FRST.ZS', file: 'forest-area-pct.json', label: 'Forest area (% of land area)' },
  { id: 'ER.H2O.FWTL.ZS', file: 'freshwater-withdrawal-pct.json', label: 'Annual freshwater withdrawals (% of internal resources)' },
  { id: 'EN.ATM.PM25.MC.M3', file: 'pm25-air-pollution.json', label: 'PM2.5 air pollution (micrograms per cubic meter)' },
  { id: 'AG.LND.ARBL.ZS', file: 'arable-land-pct.json', label: 'Arable land (% of land area)' },
  { id: 'ER.PTD.TOTL.ZS', file: 'terrestrial-protected-areas-pct.json', label: 'Terrestrial protected areas (% of total land area)' },
  { id: 'EG.FEC.RNEW.ZS', file: 'renewable-energy-consumption-pct.json', label: 'Renewable energy consumption (% of total final energy)' },
  { id: 'EN.CLC.MDAT.ZS', file: 'climate-disasters.json', label: 'Droughts, floods, extreme temperatures (% pop affected)' },
  { id: 'AG.LND.TOTL.K2', file: 'land-area-sq-km.json', label: 'Land area (sq. km)' },
  { id: 'SP.URB.TOTL.IN.ZS', file: 'urban-population-pct.json', label: 'Urban population (% of total)' },
  { id: 'SP.POP.GROW', file: 'population-growth-annual-pct.json', label: 'Population growth (annual %)' },
  { id: 'SP.POP.TOTL', file: 'total-population.json', label: 'Total population' },
];

async function fetchIndicator(indicator) {
  const allRecords = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${BASE}/${indicator.id}?format=json&per_page=500&date=2018:2024&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${indicator.id} page ${page}`);
      break;
    }
    const json = await res.json();
    const [meta, data] = json;
    totalPages = meta.pages;

    if (data) {
      for (const row of data) {
        if (row.value !== null) {
          allRecords.push({
            country: row.country.value,
            countryCode: row.countryiso3code,
            year: parseInt(row.date),
            value: row.value,
          });
        }
      }
    }
    page++;
  }

  const output = {
    indicator: indicator.id,
    label: indicator.label,
    dateRange: '2018-2024',
    fetchedAt: new Date().toISOString(),
    totalDataPoints: allRecords.length,
    data: allRecords,
  };

  const filePath = path.join(OUT_DIR, indicator.file);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  return { name: indicator.label, file: indicator.file, count: allRecords.length };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Fetching ${INDICATORS.length} environment/climate indicators...\n`);

  let grandTotal = 0;
  for (const ind of INDICATORS) {
    process.stdout.write(`  ${ind.id} ...`);
    const result = await fetchIndicator(ind);
    console.log(` ${result.count} data points → ${result.file}`);
    grandTotal += result.count;
  }

  console.log(`\nDone. Total: ${grandTotal} data points across ${INDICATORS.length} files.`);
}

main().catch(console.error);
