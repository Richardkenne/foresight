#!/usr/bin/env node
/**
 * UNESCO Institute for Statistics — Global education data
 * API: http://data.uis.unesco.org/
 * Target: 500K+ data points
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/unesco');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 500;
const TIMEOUT_MS = 45_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// UNESCO UIS SDMX API indicators
const INDICATORS = [
  // Education participation
  { id: 'CR.1', name: 'Primary completion rate', unit: '%' },
  { id: 'CR.2', name: 'Lower secondary completion rate', unit: '%' },
  { id: 'CR.3', name: 'Upper secondary completion rate', unit: '%' },
  { id: 'GER.1', name: 'Gross enrollment ratio - primary', unit: '%' },
  { id: 'GER.2', name: 'Gross enrollment ratio - secondary', unit: '%' },
  { id: 'GER.3', name: 'Gross enrollment ratio - tertiary', unit: '%' },
  { id: 'NER.1', name: 'Net enrollment rate - primary', unit: '%' },
  { id: 'NER.2', name: 'Net enrollment rate - secondary', unit: '%' },
  { id: 'ROFST.1', name: 'Out-of-school rate - primary', unit: '%' },
  { id: 'ROFST.2', name: 'Out-of-school rate - secondary', unit: '%' },
  // Literacy
  { id: 'LR.AG15T24', name: 'Youth literacy rate (15-24)', unit: '%' },
  { id: 'LR.AG15T99', name: 'Adult literacy rate (15+)', unit: '%' },
  // Teachers
  { id: 'PTRHC.1', name: 'Pupil-teacher ratio - primary', unit: 'ratio' },
  { id: 'PTRHC.2', name: 'Pupil-teacher ratio - secondary', unit: 'ratio' },
  { id: 'TRTP.1', name: 'Trained teachers - primary', unit: '%' },
  // Expenditure
  { id: 'XGDP.1.FSGOV', name: 'Government education expenditure', unit: '% of GDP' },
  { id: 'XUNIT.1.PPP', name: 'Expenditure per student - primary (PPP)', unit: 'USD' },
  { id: 'XUNIT.2.PPP', name: 'Expenditure per student - secondary (PPP)', unit: 'USD' },
  { id: 'XUNIT.3.PPP', name: 'Expenditure per student - tertiary (PPP)', unit: 'USD' },
  // Gender
  { id: 'GPI.GER.1', name: 'Gender parity index - primary enrollment', unit: 'ratio' },
  { id: 'GPI.GER.2', name: 'Gender parity index - secondary enrollment', unit: 'ratio' },
  { id: 'GPI.GER.3', name: 'Gender parity index - tertiary enrollment', unit: 'ratio' },
  // Science & Technology
  { id: 'GRD.1', name: 'STEM graduates', unit: '%' },
  { id: 'RD.GERD.GDP', name: 'R&D expenditure', unit: '% of GDP' },
  { id: 'RD.RSRCH.FTE', name: 'Researchers per million', unit: 'per million' },
  // ICT in education
  { id: 'COMP.1', name: 'Schools with computers - primary', unit: '%' },
  { id: 'INET.1', name: 'Schools with internet - primary', unit: '%' },
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

async function fetchIndicatorSDMX(indicator) {
  // Try UIS bulk download API
  const url = `https://api.uis.unesco.org/sdmx/data/UNESCO,EDU_NON_FINANCE,4.0/..${indicator.id}....?format=sdmx-json&startPeriod=2018&endPeriod=2026`;

  try {
    const data = await fetchWithTimeout(url);
    const dataPoints = [];

    if (data?.dataSets?.[0]?.observations) {
      const obs = data.dataSets[0].observations;
      const dims = data.structure?.dimensions?.observation || [];

      for (const [key, values] of Object.entries(obs)) {
        const indices = key.split(':').map(Number);
        const value = values[0];
        if (value === null || value === undefined) continue;

        // Extract country and year from dimension indices
        let country = 'Unknown';
        let year = 2024;

        for (let d = 0; d < dims.length; d++) {
          const dim = dims[d];
          if (dim.id === 'REF_AREA' && dim.values?.[indices[d]]) {
            country = dim.values[indices[d]].name || dim.values[indices[d]].id;
          }
          if (dim.id === 'TIME_PERIOD' && dim.values?.[indices[d]]) {
            year = parseInt(dim.values[indices[d]].id) || 2024;
          }
        }

        dataPoints.push({
          indicator: indicator.name,
          indicatorId: indicator.id,
          country,
          year,
          value,
          unit: indicator.unit,
          sourceUrl: `http://data.uis.unesco.org/`,
          source: 'UNESCO Institute for Statistics',
          fetchedAt: new Date().toISOString().split('T')[0],
        });
      }
    }

    return dataPoints;
  } catch (err) {
    // Fallback: try World Bank API for UNESCO data
    try {
      const wbUrl = `https://api.worldbank.org/v2/country/all/indicator/${indicator.id}?format=json&per_page=5000&date=2018:2026`;
      const data = await fetchWithTimeout(wbUrl);
      if (data[1]) {
        return data[1]
          .filter(item => item.value !== null)
          .map(item => ({
            indicator: indicator.name,
            indicatorId: indicator.id,
            country: item.country.value,
            countryCode: item.countryiso3code,
            year: parseInt(item.date),
            value: item.value,
            unit: indicator.unit,
            sourceUrl: `http://data.uis.unesco.org/`,
            source: 'UNESCO via World Bank',
            fetchedAt: new Date().toISOString().split('T')[0],
          }));
      }
    } catch {
      // Silent fail
    }
    return [];
  }
}

async function main() {
  console.log(`\n=== UNESCO Education Data Download ===`);
  console.log(`Indicators: ${INDICATORS.length}\n`);

  let totalDP = 0;
  const allData = [];

  for (let i = 0; i < INDICATORS.length; i++) {
    const ind = INDICATORS[i];
    const dataPoints = await fetchIndicatorSDMX(ind);
    totalDP += dataPoints.length;
    allData.push(...dataPoints);
    console.log(`[${i + 1}/${INDICATORS.length}] ${ind.name}: ${dataPoints.length} DP | Total: ${totalDP.toLocaleString()}`);
    await sleep(DELAY_MS);
  }

  const output = {
    source: 'UNESCO Institute for Statistics',
    description: 'Global education indicators (enrollment, completion, literacy, expenditure, gender parity, ICT)',
    fetchedAt: new Date().toISOString().split('T')[0],
    indicatorCount: INDICATORS.length,
    dataPointCount: allData.length,
    dataPoints: allData,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'unesco-education-all.json'), JSON.stringify(output, null, 2));
  console.log(`\n=== COMPLETE: ${totalDP.toLocaleString()} data points ===`);
}

main().catch(console.error);
