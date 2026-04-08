#!/usr/bin/env node
/**
 * Fetches comprehensive country data from REST Countries API v3.1
 * and wellbeing indicators from World Bank API.
 * Saves to data/cultural/countries-wellbeing/
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'data', 'cultural', 'countries-wellbeing');

// ── REST Countries ──────────────────────────────────────────────
async function fetchRestCountries() {
  console.log('[1/2] Fetching REST Countries API v3.1...');

  // API limits to 10 fields per request, so we split into two
  const fields1 = 'name,cca2,cca3,capital,region,subregion,population,area,languages,currencies';
  const fields2 = 'name,cca3,timezones,borders,gini,car,landlocked,unMember,latlng,flag';

  const [res1, res2] = await Promise.all([
    fetch(`https://restcountries.com/v3.1/all?fields=${fields1}`),
    fetch(`https://restcountries.com/v3.1/all?fields=${fields2}`),
  ]);

  if (!res1.ok) throw new Error(`REST Countries batch 1 failed: ${res1.status}`);
  if (!res2.ok) throw new Error(`REST Countries batch 2 failed: ${res2.status}`);

  const [raw1, raw2] = await Promise.all([res1.json(), res2.json()]);
  console.log(`  → ${raw1.length} countries received`);

  // Index batch 2 by cca3
  const batch2Map = {};
  for (const c of raw2) {
    const code = c.cca3 ?? c.name?.common;
    if (code) batch2Map[code] = c;
  }

  return raw1.map(c => {
    const code = c.cca3 ?? c.name?.common;
    const c2 = batch2Map[code] || {};
    return {
      name: c.name?.common ?? null,
      officialName: c.name?.official ?? null,
      cca2: c.cca2 ?? null,
      cca3: c.cca3 ?? null,
      capital: c.capital ?? [],
      region: c.region ?? null,
      subregion: c.subregion ?? null,
      population: c.population ?? null,
      area: c.area ?? null,
      languages: c.languages ?? {},
      currencies: c.currencies
        ? Object.entries(c.currencies).map(([code, v]) => ({ code, name: v.name, symbol: v.symbol }))
        : [],
      timezones: c2.timezones ?? [],
      borders: c2.borders ?? [],
      gini: c2.gini ?? null,
      carSide: c2.car?.side ?? null,
      landlocked: c2.landlocked ?? null,
      unMember: c2.unMember ?? null,
      latlng: c2.latlng ?? [],
      flag: c2.flag ?? null,
    };
  });
}

// ── World Bank ──────────────────────────────────────────────────
const WB_INDICATORS = [
  { id: 'NY.GDP.PCAP.PP.CD', label: 'gdpPerCapitaPPP' },
  { id: 'SP.DYN.LE00.IN', label: 'lifeExpectancy' },
  { id: 'SE.ADT.LITR.ZS', label: 'literacyRate' },
  { id: 'SL.UEM.TOTL.ZS', label: 'unemployment' },
  { id: 'SI.POV.GINI', label: 'giniIndex' },
  { id: 'SP.URB.TOTL.IN.ZS', label: 'urbanization' },
  { id: 'SM.POP.NETM', label: 'netMigration' },
  { id: 'SP.DYN.TFRT.IN', label: 'fertilityRate' },
  { id: 'SH.STA.SUIC.P5', label: 'suicideRate' },
  { id: 'SP.POP.DPND', label: 'ageDependencyRatio' },
];

async function fetchWBIndicator(indicatorId, label) {
  // Fetch all countries, most recent value, pages up to 20
  const base = `https://api.worldbank.org/v2/country/all/indicator/${indicatorId}?format=json&per_page=500&mrnev=1`;
  let allData = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${base}&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ ${label} page ${page} failed: ${res.status}`);
      break;
    }
    const json = await res.json();
    if (!json[1]) break;

    const meta = json[0];
    totalPages = meta.pages;
    allData = allData.concat(json[1]);
    page++;
  }

  // Build country code → { value, year } map
  const map = {};
  let dataPoints = 0;
  for (const entry of allData) {
    if (entry.value !== null && entry.countryiso3code) {
      // Skip aggregates (only keep actual countries)
      if (entry.countryiso3code.length === 3) {
        map[entry.countryiso3code] = {
          value: entry.value,
          year: parseInt(entry.date),
        };
        dataPoints++;
      }
    }
  }
  console.log(`  → ${label}: ${dataPoints} countries with data`);
  return { label, map, dataPoints };
}

async function fetchWorldBankData() {
  console.log('[2/2] Fetching World Bank wellbeing indicators...');
  const results = [];

  // Fetch sequentially with retry to avoid rate-limit 400s
  for (const ind of WB_INDICATORS) {
    let result = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await fetchWBIndicator(ind.id, ind.label);
        if (result.dataPoints > 0) break;
        // If 0 data points, retry after delay
        await new Promise(r => setTimeout(r, 1500));
      } catch (e) {
        console.warn(`  retry ${attempt}/3 for ${ind.label}: ${e.message}`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    results.push(result || { label: ind.label, map: {}, dataPoints: 0 });
    await new Promise(r => setTimeout(r, 300));
  }

  return results;
}

// ── Main ────────────────────────────────────────────────────────
async function main() {
  const startTime = Date.now();

  // Fetch both sources
  const countries = await fetchRestCountries();
  const wbResults = await fetchWorldBankData();

  // Save REST Countries data
  const restCountriesFile = join(OUT_DIR, 'rest-countries-all.json');
  writeFileSync(restCountriesFile, JSON.stringify(countries, null, 2));
  console.log(`\nSaved: rest-countries-all.json (${countries.length} countries)`);

  // Build wellbeing file: merge all WB indicators by country code
  // First, build a set of all country codes from REST Countries
  const codeSet = new Set(countries.map(c => c.cca3).filter(Boolean));

  const wellbeingByCountry = {};
  let totalWBDataPoints = 0;

  for (const c of countries) {
    if (!c.cca3) continue;
    wellbeingByCountry[c.cca3] = {
      name: c.name,
      cca3: c.cca3,
      region: c.region,
      subregion: c.subregion,
      population: c.population,
      indicators: {},
    };
  }

  for (const { label, map } of wbResults) {
    for (const [code, data] of Object.entries(map)) {
      if (wellbeingByCountry[code]) {
        wellbeingByCountry[code].indicators[label] = data;
        totalWBDataPoints++;
      }
    }
  }

  // Convert to array and sort by name
  const wellbeingArray = Object.values(wellbeingByCountry)
    .filter(c => Object.keys(c.indicators).length > 0)
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const wellbeingFile = join(OUT_DIR, 'world-happiness-wellbeing.json');
  writeFileSync(wellbeingFile, JSON.stringify({
    meta: {
      source: 'World Bank API v2 + REST Countries API v3.1',
      indicators: WB_INDICATORS.map(i => ({ id: i.id, label: i.label })),
      countriesWithData: wellbeingArray.length,
      totalDataPoints: totalWBDataPoints,
      fetchedAt: new Date().toISOString(),
      note: 'Most recent available value per indicator per country (mrnev=1)',
    },
    data: wellbeingArray,
  }, null, 2));

  console.log(`Saved: world-happiness-wellbeing.json (${wellbeingArray.length} countries, ${totalWBDataPoints} data points)`);

  // Count total data points across both files
  let restDataPoints = 0;
  for (const c of countries) {
    // Count non-null fields per country
    const fields = [c.name, c.capital?.length, c.region, c.subregion, c.population, c.area,
      Object.keys(c.languages).length, c.currencies.length, c.timezones.length,
      c.borders.length, c.gini, c.carSide, c.landlocked, c.unMember];
    restDataPoints += fields.filter(f => f !== null && f !== undefined && f !== 0).length;
  }

  const totalDataPoints = restDataPoints + totalWBDataPoints;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n════════════════════════════════════════`);
  console.log(`TOTAL DATA POINTS: ${totalDataPoints.toLocaleString()}`);
  console.log(`  REST Countries:  ${restDataPoints.toLocaleString()} (${countries.length} countries × 14 fields)`);
  console.log(`  World Bank:      ${totalWBDataPoints.toLocaleString()} (${wellbeingArray.length} countries × 10 indicators)`);
  console.log(`  Time elapsed:    ${elapsed}s`);
  console.log(`════════════════════════════════════════`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
