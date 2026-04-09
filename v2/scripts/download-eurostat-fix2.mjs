/**
 * Eurostat Fix2 — saves the last 2 datasets: tour_occ_nim and sbs_na_ind_r2
 * Uses https module with IPv4 forced (family:4).
 *
 * tour_occ_nim: nace_r2=I551 (hotels only, monthly data → latest year summed)
 * sbs_na_ind_r2: indic_sb=V11110 (number of enterprises), nace_r2=C (manufacturing sector representative)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/eurostat');
const TODAY = '2026-04-07';
const DELAY_MS = 400;

const COUNTRIES = {
  IT: 'Italy', DE: 'Germany', FR: 'France', ES: 'Spain', NL: 'Netherlands',
  CH: 'Switzerland', SE: 'Sweden', PL: 'Poland', BE: 'Belgium', AT: 'Austria',
  NO: 'Norway', DK: 'Denmark', IE: 'Ireland', PT: 'Portugal', UK: 'United Kingdom',
};
const GEO_CODES = Object.keys(COUNTRIES);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get(
      { hostname: parsed.hostname, path: parsed.pathname + parsed.search,
        headers: { 'User-Agent': 'Foresight-RAG-Builder/1.0', 'Accept': 'application/json' },
        family: 4 },
      (res) => {
        let b = '';
        res.on('data', (d) => (b += d));
        res.on('end', () => {
          if (res.statusCode >= 400) reject(new Error(`HTTP ${res.statusCode}: ${b.slice(0, 200)}`));
          else { try { resolve(JSON.parse(b)); } catch (e) { reject(new Error('JSON parse: ' + e.message)); } }
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(25000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function buildUrl(code, extraParams) {
  const geoParam = GEO_CODES.map((g) => `geo=${g}`).join('&');
  const base = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${code}?format=JSON&lang=en&${geoParam}`;
  return extraParams ? `${base}&${extraParams}` : base;
}

function parseEurostatResponse(data) {
  const results = [];
  if (!data?.dimension || !data?.value) return results;

  const dims = data.id;
  const sizes = data.size;
  const values = data.value;
  const dimData = data.dimension;

  const geoI = dims.findIndex((d) => d.toLowerCase() === 'geo');
  const timeI = dims.findIndex((d) => d.toLowerCase() === 'time');
  if (geoI === -1 || timeI === -1) return results;

  const geoCats = dimData[dims[geoI]]?.category;
  const timeCats = dimData[dims[timeI]]?.category;
  if (!geoCats || !timeCats) return results;

  const geoIndexToCode = Object.fromEntries(
    Object.entries(geoCats.index || {}).map(([code, idx]) => [idx, code])
  );
  const timeIndexToPeriod = Object.fromEntries(
    Object.entries(timeCats.index || {}).map(([period, idx]) => [idx, period])
  );

  const strides = new Array(dims.length).fill(1);
  for (let d = dims.length - 2; d >= 0; d--) strides[d] = strides[d + 1] * sizes[d + 1];

  // For monthly data: sum all months of latest year per country
  // For annual: take latest year
  const byCountryYear = new Map(); // key: `${geoCode}|${year}` → { sum, count }

  for (const [flatIdx, val] of Object.entries(values)) {
    if (val === null || val === undefined) continue;
    const idx = parseInt(flatIdx);
    const dimIndices = [];
    let remaining = idx;
    for (let d = 0; d < dims.length; d++) {
      dimIndices.push(Math.floor(remaining / strides[d]));
      remaining = remaining % strides[d];
    }

    const geoCode = geoIndexToCode[dimIndices[geoI]];
    const period = timeIndexToPeriod[dimIndices[timeI]];
    if (!geoCode || !period || !COUNTRIES[geoCode]) continue;

    const yearMatch = period.match(/^(\d{4})/);
    if (!yearMatch) continue;
    const year = parseInt(yearMatch[1]);

    const key = `${geoCode}|${year}`;
    const existing = byCountryYear.get(key) || { sum: 0, count: 0, year };
    existing.sum += val;
    existing.count += 1;
    byCountryYear.set(key, existing);
  }

  // Keep only the latest year per country
  const latestByCountry = new Map();
  for (const [key, data] of byCountryYear) {
    const [geoCode] = key.split('|');
    const existing = latestByCountry.get(geoCode);
    if (!existing || data.year > existing.year) {
      latestByCountry.set(geoCode, { year: data.year, sum: data.sum, count: data.count });
    }
  }

  for (const [geoCode, { year, sum, count }] of latestByCountry) {
    results.push({ countryCode: geoCode, year, value: sum, months: count });
  }

  return results;
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('\nEurostat Fix2 — tour_occ_nim + sbs_na_ind_r2');
  console.log('='.repeat(60));
  let totalPoints = 0;

  // --- 1. tour_occ_nim ---
  {
    const code = 'tour_occ_nim';
    const url = buildUrl(code, 'nace_r2=I551&unit=NR&c_resid=TOTAL');
    console.log(`\n${code} — Nights spent at hotels (I551), all residents`);
    console.log('  Fetching...');

    try {
      const rawData = await httpsGet(url);
      const parsed = parseEurostatResponse(rawData);
      console.log(`  Parsed ${parsed.length} points (monthly data summed per latest year)`);

      const dataPoints = parsed.map((p) => {
        const country = COUNTRIES[p.countryCode];
        return {
          id: `EU-TOUROCCONIM-${p.countryCode}-${p.year}`,
          country,
          countryCode: p.countryCode,
          metric: 'tourism_hotel_nights_annual',
          label: 'Annual nights spent at hotels and similar accommodation',
          value: p.value,
          unit: 'nights_per_year',
          year: p.year,
          source: `Eurostat ${p.year}`,
          sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/tour_occ_nim/default/table',
          context: `${country} had ${p.value.toLocaleString()} nights spent at hotels and similar accommodation in ${p.year} (${p.months} months summed, Eurostat tour_occ_nim, NACE I551).`,
          note: p.months < 12 ? `Data covers ${p.months} months of ${p.year}` : `Full year ${p.year}`,
        };
      });

      dataPoints.sort((a, b) => a.country.localeCompare(b.country));

      const output = {
        metadata: {
          source: 'Eurostat', dataset: code,
          datasetLabel: 'Nights spent at hotels and similar accommodation (monthly, summed to annual)',
          metric: 'tourism_hotel_nights_annual',
          countries: [...new Set(dataPoints.map(p => p.country))],
          countryCodes: [...new Set(dataPoints.map(p => p.countryCode))],
          lastUpdated: TODAY, totalDataPoints: dataPoints.length,
          unitOfMeasure: 'nights_per_year',
          note: 'NACE I551 = Hotels and similar accommodation. Monthly values summed to get annual total.',
          apiUrl: `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${code}`,
        },
        dataPoints,
      };

      writeFileSync(join(OUTPUT_DIR, `${code}.json`), JSON.stringify(output, null, 2));
      console.log(`  Saved: ${code}.json (${dataPoints.length} points)`);
      totalPoints += dataPoints.length;
    } catch (err) {
      console.log(`  [ERROR] ${err.message}`);
    }
  }

  await sleep(DELAY_MS);

  // --- 2. sbs_na_ind_r2 ---
  {
    const code = 'sbs_na_ind_r2';
    // Use number of enterprises (V11110) across manufacturing (C) + services (G-N combined)
    // Fetch two sectors and merge
    const url = buildUrl(code, 'indic_sb=V11110&nace_r2=C');
    console.log(`\n${code} — Number of enterprises (manufacturing sector, nace C)`);
    console.log('  Fetching...');

    try {
      const rawData = await httpsGet(url);
      const parsed = parseEurostatResponse(rawData);
      console.log(`  Parsed ${parsed.length} points`);

      const dataPoints = parsed.map((p) => {
        const country = COUNTRIES[p.countryCode];
        return {
          id: `EU-SBSNAINDR2-${p.countryCode}-${p.year}`,
          country,
          countryCode: p.countryCode,
          metric: 'enterprises_manufacturing_count',
          label: 'Number of active enterprises in manufacturing (NACE C)',
          value: p.value,
          unit: 'number_of_enterprises',
          year: p.year,
          source: `Eurostat ${p.year}`,
          sourceUrl: 'https://ec.europa.eu/eurostat/databrowser/view/sbs_na_ind_r2/default/table',
          context: `${country} had ${p.value.toLocaleString()} active enterprises in the manufacturing sector in ${p.year} (Eurostat sbs_na_ind_r2, NACE C, indic V11110).`,
        };
      });

      dataPoints.sort((a, b) => a.country.localeCompare(b.country));

      const output = {
        metadata: {
          source: 'Eurostat', dataset: code,
          datasetLabel: 'Structural Business Statistics — number of enterprises (manufacturing)',
          metric: 'enterprises_manufacturing_count',
          countries: [...new Set(dataPoints.map(p => p.country))],
          countryCodes: [...new Set(dataPoints.map(p => p.countryCode))],
          lastUpdated: TODAY, totalDataPoints: dataPoints.length,
          unitOfMeasure: 'number_of_enterprises',
          note: 'NACE C = Manufacturing sector. Indicator V11110 = number of active enterprises.',
          apiUrl: `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${code}`,
        },
        dataPoints,
      };

      writeFileSync(join(OUTPUT_DIR, `${code}.json`), JSON.stringify(output, null, 2));
      console.log(`  Saved: ${code}.json (${dataPoints.length} points)`);
      totalPoints += dataPoints.length;
    } catch (err) {
      console.log(`  [ERROR] ${err.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`FIX2 DONE — ${totalPoints} new data points saved`);
  console.log('='.repeat(60) + '\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
