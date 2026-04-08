/**
 * Fetch health indicators from World Bank API
 * Saves each indicator as a separate JSON file in data/cultural/health-global/
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'health-global');

const INDICATORS = [
  'SH.XPD.CHEX.PC.CD',
  'SH.MED.BEDS.ZS',
  'SH.MED.PHYS.ZS',
  'SP.DYN.LE00.IN',
  'SH.STA.MMRT',
  'SH.DYN.MORT',
  'SH.IMM.MEAS',
  'SH.STA.SUIC.P5',
  'SH.TBS.INCD',
  'SH.HIV.INCD.ZS',
];

const BASE = 'https://api.worldbank.org/v2/country/all/indicator';

async function fetchIndicator(code) {
  const url = `${BASE}/${code}?format=json&per_page=500&date=2018:2024`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${code}`);
  const json = await res.json();

  // World Bank returns [metadata, data[]] — page through if needed
  const meta = json[0];
  let records = json[1] || [];

  // If there are more pages, fetch them
  const totalPages = meta.pages || 1;
  for (let page = 2; page <= totalPages; page++) {
    const pageRes = await fetch(`${url}&page=${page}`);
    const pageJson = await pageRes.json();
    if (pageJson[1]) records = records.concat(pageJson[1]);
  }

  // Filter out null values and slim down
  const cleaned = records
    .filter(r => r.value !== null)
    .map(r => ({
      country: r.country.value,
      countryCode: r.countryiso3code,
      year: parseInt(r.date),
      value: r.value,
      indicator: r.indicator.id,
      indicatorName: r.indicator.value,
    }));

  return cleaned;
}

async function main() {
  let totalPoints = 0;

  for (const code of INDICATORS) {
    try {
      const data = await fetchIndicator(code);
      const outPath = join(OUT_DIR, `${code}.json`);
      writeFileSync(outPath, JSON.stringify(data, null, 2));
      console.log(`${code}: ${data.length} data points saved`);
      totalPoints += data.length;
    } catch (err) {
      console.error(`FAILED ${code}: ${err.message}`);
    }
  }

  console.log(`\nTotal: ${totalPoints} data points across ${INDICATORS.length} indicators`);
}

main();
