#!/usr/bin/env node
/**
 * UNDP Human Development Report — Full download
 * API: https://hdr.undp.org/data-center/api
 * Target: 200K+ data points (HDI + sub-indices for all countries)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/undp-hdr');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 500;
const TIMEOUT_MS = 30_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// UNDP HDR indicators
const INDICATORS = [
  { id: 'hdi', name: 'Human Development Index', unit: 'index (0-1)' },
  { id: 'le', name: 'Life expectancy at birth', unit: 'years' },
  { id: 'eys', name: 'Expected years of schooling', unit: 'years' },
  { id: 'mys', name: 'Mean years of schooling', unit: 'years' },
  { id: 'gnipc', name: 'GNI per capita (PPP)', unit: 'USD' },
  { id: 'gdi', name: 'Gender Development Index', unit: 'index' },
  { id: 'gii', name: 'Gender Inequality Index', unit: 'index (0-1)' },
  { id: 'ihdi', name: 'Inequality-adjusted HDI', unit: 'index (0-1)' },
  { id: 'phdi', name: 'Planetary pressures-adjusted HDI', unit: 'index (0-1)' },
  { id: 'mpi', name: 'Multidimensional Poverty Index', unit: 'index (0-1)' },
  { id: 'co2_prod', name: 'CO2 emissions per capita (production)', unit: 'tonnes' },
  { id: 'mf', name: 'Material footprint per capita', unit: 'tonnes' },
  { id: 'pr_f', name: 'Female parliament seats', unit: '%' },
  { id: 'se_f', name: 'Female secondary education', unit: '%' },
  { id: 'se_m', name: 'Male secondary education', unit: '%' },
  { id: 'lfpr_f', name: 'Female labor force participation', unit: '%' },
  { id: 'lfpr_m', name: 'Male labor force participation', unit: '%' },
  { id: 'mmr', name: 'Maternal mortality ratio', unit: 'per 100,000' },
  { id: 'abr', name: 'Adolescent birth rate', unit: 'per 1,000 women 15-19' },
  { id: 'loss_le', name: 'HDI loss due to inequality (life expectancy)', unit: '%' },
  { id: 'loss_edu', name: 'HDI loss due to inequality (education)', unit: '%' },
  { id: 'loss_inc', name: 'HDI loss due to inequality (income)', unit: '%' },
  { id: 'rankdiff_hdi_phdi', name: 'HDI rank change (planetary pressures)', unit: 'rank change' },
];

async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function main() {
  console.log(`\n=== UNDP Human Development Report Download ===`);
  console.log(`Indicators: ${INDICATORS.length}\n`);

  // First, get the composite index data from the public API
  const allData = [];
  let totalDP = 0;

  // Try the HDR statistical tables API
  for (const ind of INDICATORS) {
    const url = `https://hdr.undp.org/sites/default/files/2024_statistical_annex_table_${ind.id}.json`;

    try {
      const data = await fetchWithTimeout(url);

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.value !== null && item.value !== undefined) {
            allData.push({
              indicator: ind.name,
              indicatorId: ind.id,
              country: item.country || item.country_name || 'Unknown',
              countryCode: item.iso3 || item.country_code || '',
              year: parseInt(item.year) || 2024,
              value: parseFloat(item.value),
              unit: ind.unit,
              sourceUrl: `https://hdr.undp.org/data-center/specific-country-data`,
              source: 'UNDP Human Development Report 2024',
              fetchedAt: new Date().toISOString().split('T')[0],
            });
            totalDP++;
          }
        }
      }
      console.log(`[${ind.id}] ${ind.name}: ${totalDP} total DP`);
    } catch (err) {
      // Try alternative API endpoint
      try {
        const altUrl = `https://hdr.undp.org/api/data/${ind.id}`;
        const data = await fetchWithTimeout(altUrl);
        if (data && typeof data === 'object') {
          for (const [country, years] of Object.entries(data)) {
            if (typeof years === 'object') {
              for (const [year, value] of Object.entries(years)) {
                if (value !== null && parseInt(year) >= 2015) {
                  allData.push({
                    indicator: ind.name,
                    indicatorId: ind.id,
                    country,
                    year: parseInt(year),
                    value: parseFloat(value),
                    unit: ind.unit,
                    sourceUrl: `https://hdr.undp.org/data-center/specific-country-data`,
                    source: 'UNDP Human Development Report 2024',
                    fetchedAt: new Date().toISOString().split('T')[0],
                  });
                  totalDP++;
                }
              }
            }
          }
        }
        console.log(`[${ind.id}] ${ind.name} (alt): ${totalDP} total DP`);
      } catch {
        console.log(`[${ind.id}] ${ind.name}: SKIP (API unavailable)`);
      }
    }
    await sleep(DELAY_MS);
  }

  // Also fetch the full composite table
  try {
    console.log('\nFetching composite HDI table...');
    const compositeUrl = 'https://hdr.undp.org/sites/default/files/2024_composite_indices.json';
    const data = await fetchWithTimeout(compositeUrl);
    if (Array.isArray(data)) {
      for (const row of data) {
        for (const [key, value] of Object.entries(row)) {
          if (typeof value === 'number' && key !== 'year' && key !== 'rank') {
            allData.push({
              indicator: key,
              indicatorId: key,
              country: row.country || row.country_name || 'Unknown',
              countryCode: row.iso3 || '',
              year: row.year || 2024,
              value,
              unit: 'index',
              sourceUrl: 'https://hdr.undp.org/data-center/composite-indices',
              source: 'UNDP HDR 2024 Composite Indices',
              fetchedAt: new Date().toISOString().split('T')[0],
            });
            totalDP++;
          }
        }
      }
      console.log(`Composite table: +${data.length} rows`);
    }
  } catch (err) {
    console.log('Composite table: SKIP');
  }

  // Save
  const output = {
    source: 'UNDP Human Development Report',
    description: 'HDI, GDI, GII, IHDI and sub-indices for all countries',
    fetchedAt: new Date().toISOString().split('T')[0],
    indicatorCount: INDICATORS.length,
    dataPointCount: allData.length,
    dataPoints: allData,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'undp-hdr-full.json'), JSON.stringify(output, null, 2));
  console.log(`\n=== COMPLETE: ${totalDP.toLocaleString()} data points ===`);
}

main().catch(console.error);
