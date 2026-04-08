/**
 * Fetch infrastructure & technology indicators from World Bank API
 * Saves each indicator as a separate JSON file in data/cultural/infrastructure-tech/
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'infrastructure-tech');

const INDICATORS = [
  { code: 'IT.NET.USER.ZS', name: 'internet-users-pct' },
  { code: 'IT.CEL.SETS.P2', name: 'mobile-subscriptions-per-100' },
  { code: 'IT.NET.BBND.P2', name: 'broadband-subscriptions-per-100' },
  { code: 'EG.ELC.ACCS.ZS', name: 'access-to-electricity-pct' },
  { code: 'EG.USE.PCAP.KG.OE', name: 'energy-use-per-capita' },
  { code: 'EG.FEC.RNEW.ZS', name: 'renewable-energy-pct' },
  { code: 'IS.AIR.DPRT', name: 'air-transport-departures' },
  { code: 'IS.RRS.TOTL.KM', name: 'railway-km' },
  { code: 'IS.ROD.PAVE.ZS', name: 'roads-paved-pct' },
  { code: 'EG.USE.ELEC.KH.PC', name: 'electric-power-consumption-kwh-pc' },
  { code: 'IT.NET.SECR.P6', name: 'secure-internet-servers-per-million' },
  { code: 'MS.MIL.XPND.GD.ZS', name: 'military-expenditure-pct-gdp' },
];

const BASE_URL = 'https://api.worldbank.org/v2/country/all/indicator';

async function fetchIndicator(indicator) {
  const url = `${BASE_URL}/${indicator.code}?format=json&per_page=500&date=2018:2024`;
  let allRecords = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const pageUrl = `${url}&page=${page}`;
    const res = await fetch(pageUrl);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${indicator.code} page ${page}`);
      break;
    }
    const json = await res.json();

    if (!json || json.length < 2) {
      console.error(`  No data for ${indicator.code} page ${page}`);
      break;
    }

    const meta = json[0];
    totalPages = meta.pages || 1;
    const records = json[1] || [];

    // Transform to compact format
    for (const r of records) {
      if (r.value !== null) {
        allRecords.push({
          country: r.country.value,
          countryCode: r.countryiso3code,
          year: parseInt(r.date),
          value: r.value,
        });
      }
    }
    page++;
  }

  // Sort by country then year
  allRecords.sort((a, b) => a.country.localeCompare(b.country) || a.year - b.year);

  const output = {
    indicator: indicator.code,
    name: indicator.name,
    source: 'World Bank',
    dateRange: '2018-2024',
    fetchedAt: new Date().toISOString(),
    totalRecords: allRecords.length,
    data: allRecords,
  };

  const filePath = join(OUT_DIR, `${indicator.name}.json`);
  writeFileSync(filePath, JSON.stringify(output, null, 2));
  return { name: indicator.name, records: allRecords.length, pages: totalPages };
}

async function main() {
  console.log(`Fetching ${INDICATORS.length} infrastructure & tech indicators...\n`);

  for (const ind of INDICATORS) {
    process.stdout.write(`  ${ind.code} (${ind.name})... `);
    try {
      const result = await fetchIndicator(ind);
      console.log(`${result.records} records (${result.pages} pages)`);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }

  console.log('\nDone. Files saved to data/cultural/infrastructure-tech/');
}

main();
