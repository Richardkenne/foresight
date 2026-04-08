/**
 * Fetch gender equality indicators from World Bank API
 * Saves each indicator as a separate JSON file in data/cultural/gender-equality/
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'gender-equality');

const INDICATORS = [
  { code: 'SG.GEN.PARL.ZS', name: 'women-in-parliament-pct' },
  { code: 'SL.TLF.CACT.FE.ZS', name: 'female-labor-force-participation' },
  { code: 'SL.TLF.CACT.MA.ZS', name: 'male-labor-force-participation' },
  { code: 'SE.ENR.PRIM.FM.ZS', name: 'primary-enrollment-gender-parity' },
  { code: 'SE.ENR.SECO.FM.ZS', name: 'secondary-enrollment-gender-parity' },
  { code: 'SE.ENR.TERT.FM.ZS', name: 'tertiary-enrollment-gender-parity' },
  { code: 'SH.STA.MMRT', name: 'maternal-mortality-ratio' },
  { code: 'SP.ADO.TFRT', name: 'adolescent-fertility-rate' },
  { code: 'SG.VAW.1549.ZS', name: 'women-experiencing-violence-pct' },
  { code: 'SG.OWN.LDAL.FE.ZS', name: 'women-who-own-land-pct' },
  { code: 'SL.EMP.WORK.FE.ZS', name: 'female-wage-workers-pct' },
  { code: 'SG.LAW.NODC.HR', name: 'laws-mandating-nondiscrimination' },
];

const BASE_URL = 'https://api.worldbank.org/v2/country/all/indicator';

async function fetchIndicator(indicator) {
  const url = `${BASE_URL}/${indicator.code}?format=json&per_page=500&date=2018:2024`;
  let allRecords = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const pageUrl = page === 1 ? url : `${url}&page=${page}`;
    const res = await fetch(pageUrl);
    if (!res.ok) {
      console.error(`  ERROR ${res.status} for ${indicator.code} page ${page}`);
      break;
    }
    const json = await res.json();

    if (!json || json.length < 2 || !json[1]) {
      console.error(`  No data returned for ${indicator.code} page ${page}`);
      break;
    }

    const meta = json[0];
    totalPages = meta.pages || 1;

    const records = json[1]
      .filter(r => r.value !== null)
      .map(r => ({
        country: r.country.value,
        countryCode: r.countryiso3code || r.country.id,
        year: parseInt(r.date),
        value: r.value,
      }));

    allRecords = allRecords.concat(records);
    page++;
  }

  return allRecords;
}

async function main() {
  console.log(`Fetching ${INDICATORS.length} gender equality indicators from World Bank API...\n`);

  let totalRecords = 0;

  for (const indicator of INDICATORS) {
    process.stdout.write(`  ${indicator.code} (${indicator.name})...`);
    try {
      const records = await fetchIndicator(indicator);
      const output = {
        indicator: indicator.code,
        name: indicator.name,
        source: 'World Bank Open Data',
        dateRange: '2018-2024',
        fetchedAt: new Date().toISOString(),
        totalRecords: records.length,
        data: records,
      };

      const filePath = join(OUT_DIR, `${indicator.name}.json`);
      writeFileSync(filePath, JSON.stringify(output, null, 2));
      console.log(` ${records.length} records`);
      totalRecords += records.length;
    } catch (err) {
      console.error(` FAILED: ${err.message}`);
    }
  }

  console.log(`\nDone. ${totalRecords} total records saved to ${OUT_DIR}`);
}

main();
