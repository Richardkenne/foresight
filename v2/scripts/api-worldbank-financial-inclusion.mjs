/**
 * Fetch financial inclusion & economic freedom indicators from World Bank API
 * Save each indicator as a separate JSON file in data/cultural/financial-inclusion/
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'financial-inclusion');

const INDICATORS = [
  { id: 'FX.OWN.TOTL.ZS', name: 'account-ownership-total' },
  { id: 'FX.OWN.TOTL.FE.ZS', name: 'account-ownership-female' },
  { id: 'FX.OWN.TOTL.MA.ZS', name: 'account-ownership-male' },
  { id: 'FX.OWN.TOTL.YG.ZS', name: 'account-ownership-young' },
  { id: 'FX.OWN.TOTL.OL.ZS', name: 'account-ownership-older' },
  { id: 'WP15163_4.2', name: 'saved-at-financial-institution' },
  { id: 'WP15163_4.3', name: 'borrowed-from-financial-institution' },
  { id: 'FB.CBK.BRCH.P5', name: 'commercial-bank-branches-per-100k' },
  { id: 'FB.ATM.TOTL.P5', name: 'atms-per-100k-adults' },
  { id: 'CM.MKT.LCAP.GD.ZS', name: 'market-capitalization-pct-gdp' },
  { id: 'GC.DOD.TOTL.GD.ZS', name: 'central-govt-debt-pct-gdp' },
  { id: 'BN.CAB.XOKA.GD.ZS', name: 'current-account-balance-pct-gdp' },
  { id: 'FR.INR.RINR', name: 'real-interest-rate' },
  { id: 'PA.NUS.PPPC.RF', name: 'ppp-conversion-factor' },
];

const BASE = 'https://api.worldbank.org/v2/country/all/indicator';
const PARAMS = 'format=json&per_page=500&date=2015:2024';

async function fetchIndicator(indicator) {
  const url = `${BASE}/${indicator.id}?${PARAMS}`;
  let allData = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const pageUrl = `${url}&page=${page}`;
    const res = await fetch(pageUrl);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${indicator.id} page ${page}`);
      break;
    }
    const json = await res.json();

    if (!json || json.length < 2 || !json[1]) {
      console.error(`  No data for ${indicator.id} page ${page}`);
      break;
    }

    const meta = json[0];
    totalPages = meta.pages || 1;

    const records = json[1].map(r => ({
      country: r.country?.value,
      countryCode: r.countryiso3code,
      year: parseInt(r.date),
      value: r.value,
    })).filter(r => r.value !== null && r.countryCode);

    allData.push(...records);
    page++;
  }

  return allData;
}

async function main() {
  console.log(`Fetching ${INDICATORS.length} indicators from World Bank API...\n`);

  for (const ind of INDICATORS) {
    process.stdout.write(`  ${ind.id} (${ind.name})...`);
    try {
      const data = await fetchIndicator(ind);
      const output = {
        indicator: ind.id,
        name: ind.name,
        source: 'World Bank',
        dateRange: '2015-2024',
        fetchedAt: new Date().toISOString(),
        totalRecords: data.length,
        data,
      };
      const filePath = join(OUT_DIR, `${ind.name}.json`);
      writeFileSync(filePath, JSON.stringify(output, null, 2));
      console.log(` ${data.length} records`);
    } catch (err) {
      console.error(` FAILED: ${err.message}`);
    }
  }

  console.log('\nDone.');
}

main();
