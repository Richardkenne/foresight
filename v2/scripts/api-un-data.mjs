#!/usr/bin/env node
/**
 * api-un-data.mjs
 * Downloads demographic and development data from UN/WHO APIs for 21 priority countries.
 * Sources: UN Population Division (WPP), UN Stats SDG API, WHO GHO API
 * Output: data/cultural/un-data/{un-population,un-sdg,who-health}.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'data', 'cultural', 'un-data');

// 21 priority countries
const COUNTRIES = [
  { name: 'Indonesia',       m49: 360, iso2: 'ID' },
  { name: 'Italy',           m49: 380, iso2: 'IT' },
  { name: 'Singapore',       m49: 702, iso2: 'SG' },
  { name: 'Malaysia',        m49: 458, iso2: 'MY' },
  { name: 'Australia',       m49:  36, iso2: 'AU' },
  { name: 'United States',   m49: 840, iso2: 'US' },
  { name: 'Germany',         m49: 276, iso2: 'DE' },
  { name: 'France',          m49: 250, iso2: 'FR' },
  { name: 'United Kingdom',  m49: 826, iso2: 'GB' },
  { name: 'Spain',           m49: 724, iso2: 'ES' },
  { name: 'Netherlands',     m49: 528, iso2: 'NL' },
  { name: 'Switzerland',     m49: 756, iso2: 'CH' },
  { name: 'Austria',         m49:  40, iso2: 'AT' },
  { name: 'Belgium',         m49:  56, iso2: 'BE' },
  { name: 'Sweden',          m49: 752, iso2: 'SE' },
  { name: 'Norway',          m49: 578, iso2: 'NO' },
  { name: 'Denmark',         m49: 208, iso2: 'DK' },
  { name: 'Ireland',         m49: 372, iso2: 'IE' },
  { name: 'Portugal',        m49: 620, iso2: 'PT' },
  { name: 'Poland',          m49: 616, iso2: 'PL' },
  { name: 'Finland',         m49: 246, iso2: 'FI' },
];

// UN Population Division indicators
const WPP_INDICATORS = [
  { id: 49,  label: 'total population' },
  { id: 47,  label: 'population growth rate' },
  { id: 54,  label: 'population density' },
  { id: 19,  label: 'life expectancy at birth' },
  { id: 17,  label: 'infant mortality rate' },
  { id: 21,  label: 'median age' },
  { id: 56,  label: 'urban population %' },
  { id: 69,  label: 'dependency ratio' },
  { id: 72,  label: 'sex ratio' },
  { id: 65,  label: 'net migration rate' },
  { id: 55,  label: 'fertility rate' },
];

// UN SDG series codes
const SDG_SERIES = [
  { code: 'SI_POV_DAY1',     label: 'poverty rate' },
  { code: 'SL_TLF_UEP',      label: 'unemployment rate' },
  { code: 'SE_ACS_CMPL',     label: 'education completion rate' },
  { code: 'SH_STA_MMRT',     label: 'maternal mortality ratio' },
  { code: 'EN_ATM_CO2',      label: 'CO2 emissions' },
  { code: 'IT_NET_SECUR',    label: 'internet security incidents' },
  { code: 'SG_GEN_PARL',     label: 'women in parliament %' },
  { code: 'ER_PTD_TERRS',    label: 'protected terrestrial areas %' },
];

// WHO GHO indicator codes
const WHO_INDICATORS = [
  { code: 'WHOSIS_000001',         label: 'life expectancy' },
  { code: 'NCD_BMI_30A',           label: 'obesity rate' },
  { code: 'SA_0000001688',         label: 'alcohol consumption per capita' },
  { code: 'TOBACCO_0000000192',    label: 'tobacco use prevalence' },
  { code: 'UHC_INDEX_REPORTED',    label: 'UHC service coverage index' },
  { code: 'HWF_0001',              label: 'physicians per 10000 population' },
  { code: 'SDGSUICIDE',            label: 'suicide mortality rate' },
  { code: 'MH_12',                 label: 'mental health treatment gap' },
  { code: 'WHS6_102',              label: 'hospital beds per 10000' },
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json();
}

// ─── Source 1: UN Population Division (WPP) ────────────────────────────────

async function fetchWPP() {
  const results = [];
  let total = 0;
  let errors = 0;

  console.log('\n[1/3] UN Population Division (WPP)');
  console.log(`      ${WPP_INDICATORS.length} indicators × ${COUNTRIES.length} countries`);

  for (const indicator of WPP_INDICATORS) {
    for (const country of COUNTRIES) {
      const url =
        `https://population.un.org/dataportalapi/api/v1/data/indicators/${indicator.id}` +
        `/locations/${country.m49}/start/2015/end/2024`;

      try {
        const data = await fetchJSON(url);
        // Response shape: { data: [ { timeLabel, value, ... } ] }  or  { data: [...] }
        const rows = Array.isArray(data) ? data : (data?.data ?? []);

        for (const row of rows) {
          const year = parseInt(row.timeLabel ?? row.year ?? row.TimeDim, 10);
          const value = parseFloat(row.value ?? row.Value);
          if (isNaN(year) || isNaN(value)) continue;

          results.push({
            context: `${country.name} ${indicator.label} in ${year} was ${value}`,
            country: country.name,
            countryCode: country.iso2,
            metric: indicator.label,
            indicator: `WPP_${indicator.id}`,
            value,
            year,
            source: 'UN',
          });
          total++;
        }

        process.stdout.write(`  [WPP] ${country.name} / ${indicator.label}: ${rows.length} rows\n`);
      } catch (err) {
        errors++;
        process.stdout.write(`  [WPP] SKIP ${country.name} / ${indicator.label}: ${err.message}\n`);
      }

      await delay(500);
    }
  }

  console.log(`  => WPP done: ${total} data points, ${errors} errors skipped`);
  return results;
}

// ─── Source 2: UN Stats SDG API ───────────────────────────────────────────

async function fetchSDG() {
  const results = [];
  let total = 0;
  let errors = 0;

  const years = '2015,2016,2017,2018,2019,2020,2021,2022,2023,2024';

  console.log('\n[2/3] UN Stats SDG API');
  console.log(`      ${SDG_SERIES.length} series × ${COUNTRIES.length} countries`);

  for (const series of SDG_SERIES) {
    for (const country of COUNTRIES) {
      const url =
        `https://unstats.un.org/sdgapi/v1/sdg/Series/Data` +
        `?seriesCode=${series.code}&areaCode=${country.m49}` +
        `&timePeriod=${years}&pageSize=500`;

      try {
        const data = await fetchJSON(url);
        // Response shape: { data: [ { timePeriodStart, value, ... } ] }
        const rows = Array.isArray(data) ? data : (data?.data ?? []);

        for (const row of rows) {
          const year = parseInt(row.timePeriodStart ?? row.TimePeriod, 10);
          const raw = row.value ?? row.Value;
          // value may be a string like "12.3" or "[c]" for confidential
          const value = parseFloat(raw);
          if (isNaN(year) || isNaN(value)) continue;

          results.push({
            context: `${country.name} ${series.label} in ${year} was ${value}`,
            country: country.name,
            countryCode: country.iso2,
            metric: series.label,
            indicator: series.code,
            value,
            year,
            source: 'UN',
          });
          total++;
        }

        process.stdout.write(`  [SDG] ${country.name} / ${series.code}: ${rows.length} rows\n`);
      } catch (err) {
        errors++;
        process.stdout.write(`  [SDG] SKIP ${country.name} / ${series.code}: ${err.message}\n`);
      }

      await delay(500);
    }
  }

  console.log(`  => SDG done: ${total} data points, ${errors} errors skipped`);
  return results;
}

// ─── Source 3: WHO GHO API ────────────────────────────────────────────────

async function fetchWHO() {
  const results = [];
  let total = 0;
  let errors = 0;

  console.log('\n[3/3] WHO Global Health Observatory (GHO)');
  console.log(`      ${WHO_INDICATORS.length} indicators × ${COUNTRIES.length} countries`);

  for (const indicator of WHO_INDICATORS) {
    for (const country of COUNTRIES) {
      const filter =
        `SpatialDim eq '${country.iso2}' and TimeDim ge 2015 and TimeDim le 2024`;
      const url =
        `https://ghoapi.azureedge.net/api/${indicator.code}` +
        `?$filter=${encodeURIComponent(filter)}`;

      try {
        const data = await fetchJSON(url);
        // OData response: { value: [ { TimeDim, NumericValue, ... } ] }
        const rows = data?.value ?? (Array.isArray(data) ? data : []);

        for (const row of rows) {
          const year = parseInt(row.TimeDim ?? row.Year, 10);
          const value = parseFloat(row.NumericValue ?? row.Value);
          if (isNaN(year) || isNaN(value)) continue;

          results.push({
            context: `${country.name} ${indicator.label} in ${year} was ${value}`,
            country: country.name,
            countryCode: country.iso2,
            metric: indicator.label,
            indicator: indicator.code,
            value,
            year,
            source: 'WHO',
          });
          total++;
        }

        process.stdout.write(`  [WHO] ${country.name} / ${indicator.label}: ${rows.length} rows\n`);
      } catch (err) {
        errors++;
        process.stdout.write(`  [WHO] SKIP ${country.name} / ${indicator.label}: ${err.message}\n`);
      }

      await delay(500);
    }
  }

  console.log(`  => WHO done: ${total} data points, ${errors} errors skipped`);
  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== UN/WHO Data Download ===');
  console.log(`Output dir: ${OUT_DIR}`);
  mkdirSync(OUT_DIR, { recursive: true });

  const [wppData, sdgData, whoData] = await Promise.all([
    fetchWPP(),
    fetchSDG(),
    fetchWHO(),
  ]).catch(async () => {
    // Fallback: run sequentially if parallel causes rate-limit issues
    console.log('  Parallel fetch failed, switching to sequential...');
    const a = await fetchWPP();
    const b = await fetchSDG();
    const c = await fetchWHO();
    return [a, b, c];
  });

  // Save files
  const wppPath = join(OUT_DIR, 'un-population.json');
  const sdgPath = join(OUT_DIR, 'un-sdg.json');
  const whoPath = join(OUT_DIR, 'who-health.json');

  writeFileSync(wppPath, JSON.stringify(wppData, null, 2));
  writeFileSync(sdgPath, JSON.stringify(sdgData, null, 2));
  writeFileSync(whoPath, JSON.stringify(whoData, null, 2));

  const grand = wppData.length + sdgData.length + whoData.length;

  console.log('\n=== DONE ===');
  console.log(`  un-population.json : ${wppData.length} records`);
  console.log(`  un-sdg.json        : ${sdgData.length} records`);
  console.log(`  who-health.json    : ${whoData.length} records`);
  console.log(`  TOTAL              : ${grand} data points`);
  console.log(`\n  Saved to: ${OUT_DIR}`);
}

main().catch((err) => {
  console.error('\nFATAL:', err);
  process.exit(1);
});
