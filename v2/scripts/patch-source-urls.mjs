/**
 * Patch all cultural data JSONs to add sourceUrl field
 * Handles both flat arrays and nested {data:[]} formats
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CULTURAL = path.join(ROOT, 'data', 'cultural');

const NEW_DIRS = [
  'health-global', 'education-global', 'entrepreneurship-global', 'gender-equality',
  'infrastructure-tech', 'environment-climate', 'poverty-inequality', 'financial-inclusion',
  'countries-wellbeing', 'undp-hdi',
];

let totalPatched = 0;
let totalFiles = 0;

for (const dirName of NEW_DIRS) {
  const dir = path.join(CULTURAL, dirName);
  if (!fs.existsSync(dir)) continue;

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);

      // Determine the records array
      let records;
      let isNested = false;
      if (Array.isArray(data)) {
        records = data;
      } else if (data && Array.isArray(data.data)) {
        records = data.data;
        isNested = true;
      } else {
        continue;
      }

      let changed = false;
      for (const record of records) {
        if (!record.sourceUrl) {
          const indicator = record.indicator || file.replace('.json', '');
          if (dirName === 'countries-wellbeing' && file.includes('rest-countries')) {
            record.sourceUrl = 'https://restcountries.com/v3.1/all';
          } else if (dirName === 'undp-hdi') {
            record.sourceUrl = 'https://hdr.undp.org/data-center/human-development-index';
          } else {
            record.sourceUrl = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json`;
          }
          changed = true;
        }
      }

      if (changed) {
        if (isNested) {
          data.data = records;
          if (!data.sourceUrl) {
            const indicator = data.indicator || file.replace('.json', '');
            data.sourceUrl = `https://api.worldbank.org/v2/country/all/indicator/${indicator}?format=json`;
          }
          fs.writeFileSync(filePath, JSON.stringify(data));
        } else {
          fs.writeFileSync(filePath, JSON.stringify(records));
        }
        totalPatched += records.length;
        totalFiles++;
      }
    } catch (err) {
      console.error(`  Skip ${dirName}/${file}: ${err.message}`);
    }
  }
}

console.log(`Patched ${totalPatched.toLocaleString()} records in ${totalFiles} files with sourceUrl`);
