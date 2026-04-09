/**
 * World Bank MEGA — Fetch ALL available indicators for 21 priority countries
 * Strategy: use the indicator list API to discover ALL indicators, then fetch each
 * Target: 500K+ data points
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/worldbank-v2');

// 21 priority countries
const COUNTRIES = 'ID;IT;SG;MY;AU;US;DE;FR;GB;ES;NL;CH;AT;BE;SE;NO;DK;IE;PT;PL;FI';
const COUNTRY_MAP = {
  ID:'Indonesia',IT:'Italy',SG:'Singapore',MY:'Malaysia',AU:'Australia',US:'United States',
  DE:'Germany',FR:'France',GB:'United Kingdom',ES:'Spain',NL:'Netherlands',CH:'Switzerland',
  AT:'Austria',BE:'Belgium',SE:'Sweden',NO:'Norway',DK:'Denmark',IE:'Ireland',PT:'Portugal',
  PL:'Poland',FI:'Finland'
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Fetch indicator list from World Bank
async function fetchIndicatorList(page = 1) {
  const url = `https://api.worldbank.org/v2/indicator?format=json&per_page=500&page=${page}`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) return { indicators: [], totalPages: 0 };
    const data = await resp.json();
    const meta = data[0];
    const indicators = (data[1] || []).map(ind => ({ id: ind.id, name: ind.name }));
    return { indicators, totalPages: meta.pages || 0 };
  } catch { return { indicators: [], totalPages: 0 }; }
}

// Fetch data for one indicator
async function fetchIndicator(indicatorId) {
  const url = `https://api.worldbank.org/v2/country/${COUNTRIES}/indicator/${indicatorId}?format=json&per_page=1000&date=2015:2024`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!resp.ok) return [];
    const data = await resp.json();
    if (!data[1]) return [];
    return data[1]
      .filter(d => d.value !== null && d.value !== undefined)
      .map(d => ({
        context: `${d.country.value} ${d.indicator.value} in ${d.date} was ${d.value}. Source: World Bank ${indicatorId}.`,
        country: d.country.value,
        countryCode: d.countryCode || d.country.id,
        metric: d.indicator.value,
        indicator: indicatorId,
        value: d.value,
        year: parseInt(d.date),
        source: 'World Bank',
      }));
  } catch { return []; }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Step 1: Get ALL indicator IDs
  console.log('Fetching World Bank indicator list...');
  let allIndicators = [];
  const first = await fetchIndicatorList(1);
  allIndicators = [...first.indicators];
  console.log(`  Page 1/${first.totalPages} — ${first.indicators.length} indicators`);

  for (let p = 2; p <= first.totalPages; p++) {
    await sleep(200);
    const page = await fetchIndicatorList(p);
    allIndicators = [...allIndicators, ...page.indicators];
    if (p % 10 === 0) console.log(`  Page ${p}/${first.totalPages} — total ${allIndicators.length}`);
  }

  console.log(`\nTotal indicators available: ${allIndicators.length}`);

  // Limit to first 1500 indicators (most popular/commonly used ones come first)
  const MAX_INDICATORS = 1500;
  if (allIndicators.length > MAX_INDICATORS) {
    allIndicators = allIndicators.slice(0, MAX_INDICATORS);
    console.log(`Limited to first ${MAX_INDICATORS} indicators`);
  }

  // Step 2: Fetch data for each indicator (batch save every 100)
  let grandTotal = 0;
  let batchPoints = [];
  let batchNum = 0;
  let fetched = 0;
  let withData = 0;

  console.log(`\nFetching data for ${allIndicators.length} indicators × 21 countries...\n`);

  for (let i = 0; i < allIndicators.length; i++) {
    const ind = allIndicators[i];
    const points = await fetchIndicator(ind.id);
    fetched++;

    if (points.length > 0) {
      batchPoints = [...batchPoints, ...points];
      withData++;
      grandTotal += points.length;
    }

    // Save batch every 100 indicators
    if ((i + 1) % 100 === 0 || i === allIndicators.length - 1) {
      if (batchPoints.length > 0) {
        batchNum++;
        const outPath = join(OUTPUT_DIR, `mega-batch-${String(batchNum).padStart(3, '0')}.json`);
        writeFileSync(outPath, JSON.stringify({
          source: 'World Bank',
          batch: batchNum,
          indicatorsInBatch: withData,
          dataPoints: batchPoints,
        }, null, 2));
        console.log(`  Batch ${batchNum} saved — ${batchPoints.length.toLocaleString()} dp (${fetched}/${allIndicators.length} indicators, ${withData} with data, grand: ${grandTotal.toLocaleString()})`);
        batchPoints = [];
      } else {
        console.log(`  ${fetched}/${allIndicators.length} — no new data in this batch`);
      }
    }

    await sleep(150); // Be gentle with WB API
  }

  console.log(`\n=== DONE ===`);
  console.log(`Indicators fetched: ${fetched}`);
  console.log(`Indicators with data: ${withData}`);
  console.log(`Total data points: ${grandTotal.toLocaleString()}`);
  console.log(`Batches saved: ${batchNum}`);
}

main().catch(console.error);
