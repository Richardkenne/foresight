#!/usr/bin/env node
/**
 * IMF World Economic Outlook — Economic projections download
 * API: https://www.imf.org/external/datamapper/api/v1/
 * Target: 500K+ data points
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/imf-weo');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 500;
const TIMEOUT_MS = 30_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// IMF WEO indicators
const INDICATORS = [
  { id: 'NGDP_RPCH', name: 'Real GDP growth', unit: '%' },
  { id: 'NGDPD', name: 'GDP (current prices)', unit: 'USD billions' },
  { id: 'NGDPDPC', name: 'GDP per capita (current prices)', unit: 'USD' },
  { id: 'PPPGDP', name: 'GDP (PPP)', unit: 'Int. USD billions' },
  { id: 'PPPPC', name: 'GDP per capita (PPP)', unit: 'Int. USD' },
  { id: 'PCPIPCH', name: 'Inflation (avg consumer prices)', unit: '%' },
  { id: 'PCPIEPCH', name: 'Inflation (end of period)', unit: '%' },
  { id: 'LUR', name: 'Unemployment rate', unit: '%' },
  { id: 'LP', name: 'Population', unit: 'millions' },
  { id: 'BCA', name: 'Current account balance', unit: 'USD billions' },
  { id: 'BCA_NGDPD', name: 'Current account balance', unit: '% of GDP' },
  { id: 'GGXWDG_NGDP', name: 'Government gross debt', unit: '% of GDP' },
  { id: 'GGXCNL_NGDP', name: 'Government net lending/borrowing', unit: '% of GDP' },
  { id: 'GGXWDN_NGDP', name: 'Government net debt', unit: '% of GDP' },
  { id: 'GGR_NGDP', name: 'Government revenue', unit: '% of GDP' },
  { id: 'GGX_NGDP', name: 'Government total expenditure', unit: '% of GDP' },
  { id: 'NID_NGDP', name: 'Total investment', unit: '% of GDP' },
  { id: 'NGSD_NGDP', name: 'Gross national savings', unit: '% of GDP' },
  { id: 'TM_RPCH', name: 'Import volume growth', unit: '%' },
  { id: 'TX_RPCH', name: 'Export volume growth', unit: '%' },
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

async function fetchIndicator(indicatorId, indicatorName, unit) {
  const url = `https://www.imf.org/external/datamapper/api/v1/${indicatorId}`;
  try {
    const data = await fetchWithTimeout(url);
    const values = data.values?.[indicatorId];
    if (!values) return [];

    const dataPoints = [];
    for (const [countryCode, yearData] of Object.entries(values)) {
      for (const [year, value] of Object.entries(yearData)) {
        const yr = parseInt(year);
        if (yr >= 2020 && value !== null && value !== undefined) {
          dataPoints.push({
            indicator: indicatorName,
            indicatorId,
            country: countryCode,
            year: yr,
            value: parseFloat(value),
            unit,
            isProjection: yr > 2024,
            sourceUrl: `https://www.imf.org/external/datamapper/${indicatorId}`,
            source: 'IMF World Economic Outlook',
            fetchedAt: new Date().toISOString().split('T')[0],
          });
        }
      }
    }
    return dataPoints;
  } catch (err) {
    console.log(`  Error fetching ${indicatorId}: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log(`\n=== IMF World Economic Outlook Download ===`);
  console.log(`Indicators: ${INDICATORS.length}`);
  console.log(`All countries × ${INDICATORS.length} indicators × 10 years\n`);

  let totalDP = 0;
  const allData = [];

  for (let i = 0; i < INDICATORS.length; i++) {
    const ind = INDICATORS[i];
    const dataPoints = await fetchIndicator(ind.id, ind.name, ind.unit);
    totalDP += dataPoints.length;
    allData.push(...dataPoints);

    console.log(`[${i + 1}/${INDICATORS.length}] ${ind.name}: ${dataPoints.length} DP | Total: ${totalDP.toLocaleString()}`);
    await sleep(DELAY_MS);
  }

  // Save all
  const output = {
    source: 'IMF World Economic Outlook',
    description: 'Economic projections and historical data for all IMF member countries',
    fetchedAt: new Date().toISOString().split('T')[0],
    indicatorCount: INDICATORS.length,
    dataPointCount: allData.length,
    dataPoints: allData,
  };

  const filename = 'imf-weo-all.json';
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(output, null, 2));

  console.log(`\n=== COMPLETE ===`);
  console.log(`Total data points: ${totalDP.toLocaleString()}`);
  console.log(`Output: ${path.join(OUTPUT_DIR, filename)}`);
}

main().catch(console.error);
