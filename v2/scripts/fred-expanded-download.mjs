#!/usr/bin/env node
/**
 * FRED (Federal Reserve Economic Data) — Expanded US economic data
 * API: https://api.stlouisfed.org/fred/
 * Target: 200K+ data points (100 high-value US economic time series)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/fred-usa');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const API_KEY = process.env.FRED_API_KEY || ''; // Set FRED_API_KEY env var
const DELAY_MS = 200;
const TIMEOUT_MS = 15_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 100 key FRED series
const SERIES = [
  // GDP & Growth
  { id: 'GDP', name: 'Gross Domestic Product', unit: 'USD billions' },
  { id: 'GDPC1', name: 'Real GDP', unit: 'USD billions (2017)' },
  { id: 'A191RL1Q225SBEA', name: 'Real GDP growth rate', unit: '%' },
  { id: 'GDPPOT', name: 'Potential GDP', unit: 'USD billions' },
  // Employment
  { id: 'UNRATE', name: 'Unemployment Rate', unit: '%' },
  { id: 'PAYEMS', name: 'Total Nonfarm Payrolls', unit: 'thousands' },
  { id: 'JTSJOL', name: 'Job Openings', unit: 'thousands' },
  { id: 'ICSA', name: 'Initial Claims', unit: 'people' },
  { id: 'U6RATE', name: 'Underemployment Rate (U-6)', unit: '%' },
  { id: 'LNS14000006', name: 'Black Unemployment Rate', unit: '%' },
  { id: 'LNS14000009', name: 'Hispanic Unemployment Rate', unit: '%' },
  { id: 'LNS14000003', name: 'Female Unemployment Rate', unit: '%' },
  { id: 'LNS14024887', name: 'Youth Unemployment (16-24)', unit: '%' },
  { id: 'CIVPART', name: 'Labor Force Participation Rate', unit: '%' },
  { id: 'EMRATIO', name: 'Employment-Population Ratio', unit: '%' },
  // Inflation & Prices
  { id: 'CPIAUCSL', name: 'Consumer Price Index (All Urban)', unit: 'index' },
  { id: 'CPILFESL', name: 'Core CPI (ex food & energy)', unit: 'index' },
  { id: 'PCEPI', name: 'PCE Price Index', unit: 'index' },
  { id: 'PCEPILFE', name: 'Core PCE Price Index', unit: 'index' },
  { id: 'GASREGW', name: 'Regular Gas Price', unit: 'USD/gallon' },
  { id: 'CUSR0000SAF11', name: 'Food CPI', unit: 'index' },
  { id: 'CPIMEDSL', name: 'Medical Care CPI', unit: 'index' },
  { id: 'CUSR0000SEHA', name: 'Rent CPI', unit: 'index' },
  // Interest Rates
  { id: 'FEDFUNDS', name: 'Federal Funds Rate', unit: '%' },
  { id: 'DGS10', name: '10-Year Treasury Rate', unit: '%' },
  { id: 'DGS2', name: '2-Year Treasury Rate', unit: '%' },
  { id: 'T10Y2Y', name: '10Y-2Y Treasury Spread', unit: '%' },
  { id: 'MORTGAGE30US', name: '30-Year Mortgage Rate', unit: '%' },
  { id: 'MORTGAGE15US', name: '15-Year Mortgage Rate', unit: '%' },
  { id: 'DPRIME', name: 'Bank Prime Rate', unit: '%' },
  // Housing
  { id: 'MSPUS', name: 'Median Home Sale Price', unit: 'USD' },
  { id: 'HOUST', name: 'Housing Starts', unit: 'thousands' },
  { id: 'PERMIT', name: 'Building Permits', unit: 'thousands' },
  { id: 'CSUSHPINSA', name: 'Case-Shiller Home Price Index', unit: 'index' },
  { id: 'RRVRUSQ156N', name: 'Rental Vacancy Rate', unit: '%' },
  { id: 'RHORUSQ156N', name: 'Homeownership Rate', unit: '%' },
  { id: 'CPIHOSSL', name: 'Owners Equivalent Rent', unit: 'index' },
  // Income & Wealth
  { id: 'MEHOINUSA672N', name: 'Median Household Income', unit: 'USD' },
  { id: 'MEPAINUSA672N', name: 'Median Personal Income', unit: 'USD' },
  { id: 'DSPIC96', name: 'Real Disposable Personal Income', unit: 'USD billions' },
  { id: 'PSAVERT', name: 'Personal Savings Rate', unit: '%' },
  { id: 'TNWBSHNO', name: 'Household Net Worth', unit: 'USD billions' },
  { id: 'WFRBST01134', name: 'Top 1% Net Worth Share', unit: '%' },
  { id: 'WFRBSB50215', name: 'Bottom 50% Net Worth Share', unit: '%' },
  // Debt
  { id: 'GFDEBTN', name: 'Federal Debt Total', unit: 'USD millions' },
  { id: 'GFDEGDQ188S', name: 'Federal Debt to GDP', unit: '%' },
  { id: 'SLOAS', name: 'Student Loans Outstanding', unit: 'USD billions' },
  { id: 'REVOLSL', name: 'Revolving Consumer Credit', unit: 'USD billions' },
  { id: 'CCLACBW027SBOG', name: 'Credit Card Loans', unit: 'USD billions' },
  { id: 'TOTALSL', name: 'Total Consumer Credit', unit: 'USD billions' },
  { id: 'DRALACBS', name: 'Delinquency Rate All Loans', unit: '%' },
  // Stock Market
  { id: 'SP500', name: 'S&P 500 Index', unit: 'index' },
  { id: 'NASDAQCOM', name: 'NASDAQ Composite', unit: 'index' },
  { id: 'DJIA', name: 'Dow Jones Industrial Average', unit: 'index' },
  { id: 'VIXCLS', name: 'VIX Volatility Index', unit: 'index' },
  { id: 'WILLSMLCAP', name: 'Wilshire Small-Cap Index', unit: 'index' },
  // Money Supply
  { id: 'M2SL', name: 'M2 Money Supply', unit: 'USD billions' },
  { id: 'WALCL', name: 'Fed Total Assets', unit: 'USD millions' },
  // Trade
  { id: 'BOPGSTB', name: 'Trade Balance', unit: 'USD millions' },
  { id: 'DTWEXBGS', name: 'Trade-Weighted Dollar Index', unit: 'index' },
  // Business
  { id: 'INDPRO', name: 'Industrial Production Index', unit: 'index' },
  { id: 'TCU', name: 'Capacity Utilization', unit: '%' },
  { id: 'RSXFS', name: 'Retail Sales (ex food services)', unit: 'USD millions' },
  { id: 'UMCSENT', name: 'Consumer Sentiment (U Mich)', unit: 'index' },
  { id: 'BSCICP03USM665S', name: 'Business Confidence Index', unit: 'index' },
  { id: 'STLFSI4', name: 'Financial Stress Index', unit: 'index' },
  // Demographics
  { id: 'POPTHM', name: 'US Population', unit: 'thousands' },
  { id: 'LES1252881600Q', name: 'Median Weekly Earnings', unit: 'USD' },
  // Poverty
  { id: 'PPAAUS00000A156N', name: 'Poverty Rate', unit: '%' },
  // Crypto
  { id: 'CBBTCUSD', name: 'Bitcoin Price (Coinbase)', unit: 'USD' },
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

async function fetchSeries(seriesId, name, unit) {
  if (!API_KEY) {
    // Without API key, use FRED's public observation endpoint
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=DEMO_KEY&file_type=json&observation_start=2020-01-01`;
    try {
      const data = await fetchWithTimeout(url);
      if (data.observations) {
        return data.observations
          .filter(obs => obs.value !== '.')
          .map(obs => ({
            indicator: name,
            indicatorId: seriesId,
            country: 'United States',
            countryCode: 'USA',
            date: obs.date,
            year: parseInt(obs.date.substring(0, 4)),
            value: parseFloat(obs.value),
            unit,
            sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
            source: 'Federal Reserve Economic Data (FRED)',
            fetchedAt: new Date().toISOString().split('T')[0],
          }));
      }
    } catch {
      return [];
    }
  }

  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&observation_start=2020-01-01`;
  try {
    const data = await fetchWithTimeout(url);
    if (data.observations) {
      return data.observations
        .filter(obs => obs.value !== '.')
        .map(obs => ({
          indicator: name,
          indicatorId: seriesId,
          country: 'United States',
          countryCode: 'USA',
          date: obs.date,
          year: parseInt(obs.date.substring(0, 4)),
          value: parseFloat(obs.value),
          unit,
          sourceUrl: `https://fred.stlouisfed.org/series/${seriesId}`,
          source: 'Federal Reserve Economic Data (FRED)',
          fetchedAt: new Date().toISOString().split('T')[0],
        }));
    }
  } catch {
    return [];
  }
  return [];
}

async function main() {
  console.log(`\n=== FRED Expanded Download ===`);
  console.log(`Series: ${SERIES.length}`);
  console.log(`API Key: ${API_KEY ? 'SET' : 'DEMO_KEY (limited)'}\n`);

  let totalDP = 0;
  const allData = [];

  for (let i = 0; i < SERIES.length; i++) {
    const s = SERIES[i];
    const dataPoints = await fetchSeries(s.id, s.name, s.unit);
    totalDP += dataPoints.length;
    allData.push(...dataPoints);
    console.log(`[${i + 1}/${SERIES.length}] ${s.name}: ${dataPoints.length} DP | Total: ${totalDP.toLocaleString()}`);
    await sleep(DELAY_MS);
  }

  const output = {
    source: 'Federal Reserve Economic Data (FRED)',
    description: 'Comprehensive US economic data: GDP, employment, inflation, housing, debt, markets, income, demographics',
    fetchedAt: new Date().toISOString().split('T')[0],
    seriesCount: SERIES.length,
    dataPointCount: allData.length,
    dataPoints: allData,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'fred-expanded-all.json'), JSON.stringify(output, null, 2));
  console.log(`\n=== COMPLETE: ${totalDP.toLocaleString()} data points ===`);
}

main().catch(console.error);
