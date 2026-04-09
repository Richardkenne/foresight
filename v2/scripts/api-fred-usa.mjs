/**
 * FRED API — USA Economic Data Downloader
 * Downloads 150 series from the Federal Reserve Economic Data API
 * Output: data/cultural/fred-usa/fred-all.json
 *
 * Usage: node scripts/api-fred-usa.mjs
 * Requires: FRED_API_KEY in .env.local
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// 1. Read .env.local manually (no external deps)
// ---------------------------------------------------------------------------
function readEnvLocal() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    env[key] = val;
  }
  return env;
}

const env = readEnvLocal();
const FRED_API_KEY = env['FRED_API_KEY'];

if (!FRED_API_KEY) {
  console.error('ERROR: FRED_API_KEY not found in .env.local');
  console.error('');
  console.error('To get a free key:');
  console.error('  1. Go to https://fred.stlouisfed.org/docs/api/api_key.html');
  console.error('  2. Create a free account');
  console.error('  3. Request an API key (instant approval)');
  console.error('  4. Add to .env.local: FRED_API_KEY=your_key_here');
  console.error('');
  console.error('Set FRED_API_KEY in .env.local');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Series definitions — 150 series covering all aspects of the US economy
// ---------------------------------------------------------------------------
const SERIES = [
  // GDP
  { id: 'GDP',               title: 'Gross Domestic Product (nominal, billions USD)' },
  { id: 'GDPC1',             title: 'Real Gross Domestic Product (chained 2017 dollars)' },
  { id: 'A191RL1Q225SBEA',   title: 'Real GDP Growth Rate (quarterly, percent change)' },
  { id: 'GDPDEF',            title: 'GDP Deflator (index)' },

  // Employment
  { id: 'UNRATE',            title: 'Unemployment Rate (percent)' },
  { id: 'PAYEMS',            title: 'Total Nonfarm Payroll Employment (thousands)' },
  { id: 'CIVPART',           title: 'Labor Force Participation Rate (percent)' },
  { id: 'LNS11300000',       title: 'Civilian Labor Force Level (thousands)' },
  { id: 'U6RATE',            title: 'U-6 Underemployment Rate (percent)' },
  { id: 'JTSJOL',            title: 'Job Openings: Total Nonfarm (thousands)' },
  { id: 'JTSHIL',            title: 'Hires: Total Nonfarm (thousands)' },
  { id: 'JTSQUL',            title: 'Quits: Total Nonfarm (thousands)' },
  { id: 'CES0500000003',     title: 'Average Hourly Earnings of All Private Employees (dollars)' },
  { id: 'LES1252881600Q',    title: 'Median Usual Weekly Earnings (Full-Time Workers, dollars)' },

  // Prices & Inflation
  { id: 'CPIAUCSL',          title: 'Consumer Price Index for All Urban Consumers (index)' },
  { id: 'CPILFESL',          title: 'CPI Less Food and Energy (Core CPI, index)' },
  { id: 'PCEPI',             title: 'PCE Price Index (index)' },
  { id: 'PCE',               title: 'Personal Consumption Expenditures (billions USD)' },
  { id: 'DCOILWTICO',        title: 'Crude Oil Prices: West Texas Intermediate (dollars per barrel)' },
  { id: 'GASREGW',           title: 'US Regular Conventional Gas Price (dollars per gallon)' },

  // Housing
  { id: 'MSPUS',             title: 'Median Sales Price of Houses Sold in the US (dollars)' },
  { id: 'HOUST',             title: 'Housing Starts: Total New Privately Owned (thousands)' },
  { id: 'PERMIT',            title: 'New Private Housing Units Authorized by Building Permits (thousands)' },
  { id: 'CSUSHPINSA',        title: 'S&P/Case-Shiller US National Home Price Index' },
  { id: 'RRVRUSQ156N',       title: 'Rental Vacancy Rate in the US (percent)' },
  { id: 'MORTGAGE30US',      title: '30-Year Fixed Rate Mortgage Average (percent)' },
  { id: 'ASPUS',             title: 'Average Sales Price of Houses Sold in the US (dollars)' },
  { id: 'MEDDAYONMARUS',     title: 'Median Days on Market for Homes in the US' },

  // Income
  { id: 'MEHOINUSA672N',     title: 'Real Median Household Income in the US (dollars)' },
  { id: 'DSPIC96',           title: 'Real Disposable Personal Income (billions chained 2017 dollars)' },
  { id: 'A067RC1Q027SBEA',   title: 'Personal Income (billions USD, quarterly)' },
  { id: 'MEPAINUSA672N',     title: 'Real Median Personal Income in the US (dollars)' },

  // Savings & Debt
  { id: 'PSAVERT',           title: 'Personal Saving Rate (percent of disposable income)' },
  { id: 'REVOLSL',           title: 'Revolving Consumer Credit Outstanding (billions USD)' },
  { id: 'TOTALSL',           title: 'Total Consumer Credit Outstanding (billions USD)' },
  { id: 'TDSP',              title: 'Household Debt Service Payments as % of Disposable Income' },

  // Interest Rates
  { id: 'FEDFUNDS',          title: 'Federal Funds Effective Rate (percent)' },
  { id: 'DGS10',             title: '10-Year Treasury Constant Maturity Rate (percent)' },
  { id: 'DGS2',              title: '2-Year Treasury Constant Maturity Rate (percent)' },
  { id: 'DGS30',             title: '30-Year Treasury Constant Maturity Rate (percent)' },
  { id: 'T10Y2Y',            title: '10-Year minus 2-Year Treasury Yield Spread (percent)' },
  { id: 'DFEDTARU',          title: 'Federal Funds Target Range Upper Limit (percent)' },
  { id: 'DFF',               title: 'Federal Funds Effective Rate Daily (percent)' },

  // Money Supply
  { id: 'M2SL',              title: 'M2 Money Stock (billions USD)' },
  { id: 'WALCL',             title: 'Federal Reserve Total Assets (millions USD)' },
  { id: 'BOGMBASE',          title: 'Monetary Base (millions USD)' },

  // Business Activity
  { id: 'INDPRO',            title: 'Industrial Production Index' },
  { id: 'RSAFS',             title: 'Advance Retail Sales: Retail Trade and Food Services (millions USD)' },
  { id: 'ISRATIO',           title: 'Total Business: Inventories to Sales Ratio' },
  { id: 'BUSLOANS',          title: 'Commercial and Industrial Loans (billions USD)' },
  { id: 'DRCCLOBS',          title: 'Delinquency Rate on Credit Card Loans (percent)' },

  // Consumer
  { id: 'UMCSENT',           title: 'University of Michigan Consumer Sentiment Index' },
  { id: 'PCEDG',             title: 'PCE: Durable Goods (billions USD)' },
  { id: 'PCEND',             title: 'PCE: Nondurable Goods (billions USD)' },
  { id: 'PCES',              title: 'PCE: Services (billions USD)' },
  { id: 'RETAILIMSA',        title: 'Retail Inventories (millions USD, seasonally adjusted)' },

  // Stock Market
  { id: 'SP500',             title: 'S&P 500 Index' },
  { id: 'NASDAQCOM',         title: 'NASDAQ Composite Index' },
  { id: 'DJIA',              title: 'Dow Jones Industrial Average' },
  { id: 'VIXCLS',            title: 'CBOE Volatility Index (VIX)' },
  { id: 'WILLRESIND',        title: 'Wilshire US Real Estate Investment Trust Index' },

  // Trade
  { id: 'BOPGSTB',          title: 'Trade Balance: Goods and Services (millions USD)' },
  { id: 'BOPGTB',           title: 'Trade Balance: Goods (millions USD)' },
  { id: 'BOPSEXP',          title: 'Exports of Goods and Services (millions USD)' },
  { id: 'BOPSIMP',          title: 'Imports of Goods and Services (millions USD)' },
  { id: 'DTWEXBGS',         title: 'US Dollar Broad Real Effective Exchange Rate Index' },

  // Poverty
  { id: 'PPAAUS00000A156N', title: 'Poverty Rate in the US (percent of population)' },

  // Education
  { id: 'CGBD2024',         title: 'Federal Student Loan Portfolio Balance (billions USD)' },
  { id: 'SLOAS',            title: 'Student Loans Owned and Securitized (billions USD)' },

  // Demographics
  { id: 'POPTHM',           title: 'Population of the United States (thousands)' },
  { id: 'B230RC0A052NBEA',  title: 'Population: US (persons, annual)' },

  // Inflation Expectations
  { id: 'MICH',             title: 'University of Michigan Inflation Expectation (1-year ahead, percent)' },
  { id: 'T5YIE',            title: '5-Year Breakeven Inflation Rate (percent)' },
  { id: 'T10YIE',           title: '10-Year Breakeven Inflation Rate (percent)' },

  // Banking
  { id: 'TOTBKCR',          title: 'Total Bank Credit of All Commercial Banks (billions USD)' },
  { id: 'DRALACBS',         title: 'Delinquency Rate on All Loans (percent)' },
  { id: 'DRSDCIS',          title: 'Delinquency Rate on Single-Family Residential Mortgages (percent)' },

  // Real Estate
  { id: 'RHORUSQ156N',      title: 'Homeownership Rate in the US (percent)' },
  { id: 'ASPNHSUS',         title: 'Average Sales Price of New Houses Sold (dollars)' },
  { id: 'USSTHPI',          title: 'All-Transactions House Price Index for the United States' },

  // Wages
  { id: 'AHETPI',           title: 'Average Hourly Earnings of Production and Nonsupervisory Employees (dollars)' },
  { id: 'ECI',              title: 'Employment Cost Index: Total Compensation (index)' },
  { id: 'LEU0252881600A',   title: 'Median Usual Weekly Earnings: Full-Time Workers (dollars, annual)' },

  // Government
  { id: 'GFDEBTN',          title: 'Federal Debt: Total Public Debt (millions USD)' },
  { id: 'GFDEGDQ188S',      title: 'Federal Debt: Total Public Debt as % of GDP' },
  { id: 'FYFSD',            title: 'Federal Surplus or Deficit (millions USD)' },
  { id: 'FYONGDA188S',      title: 'Federal Net Outlays as % of GDP' },
  { id: 'FYFSDFYGDP',       title: 'Federal Surplus or Deficit as % of GDP' },

  // Health
  { id: 'HLTHSCPCHCSA',     title: 'US Health Care Spending (percent change)' },
  { id: 'DHMTCBS',          title: 'Death Rate: Heart Disease (per 100,000)' },

  // Energy
  { id: 'CAPUTLG2112A',     title: 'Capacity Utilization: Coal Mining (percent)' },
  { id: 'TOTALSA',          title: 'Total Vehicle Sales (millions of units, annual rate)' },
  { id: 'IPG2211A2N',       title: 'Industrial Production: Electric and Gas Utilities (index)' },

  // Labor market detail
  { id: 'LNS14000006',      title: 'Unemployment Rate: Black or African American (percent)' },
  { id: 'LNS14000003',      title: 'Unemployment Rate: White (percent)' },
  { id: 'LNS14000009',      title: 'Unemployment Rate: Hispanic or Latino (percent)' },
  { id: 'LNU04000012',      title: 'Unemployment Rate: 16-19 Years (youth, percent)' },
  { id: 'EMRATIO',          title: 'Employment-Population Ratio (percent)' },
  { id: 'MANEMP',           title: 'All Employees: Manufacturing (thousands)' },
  { id: 'USCONS',           title: 'All Employees: Construction (thousands)' },
  { id: 'USFIRE',           title: 'All Employees: Financial Activities (thousands)' },
  { id: 'USINFO',           title: 'All Employees: Information (thousands)' },
  { id: 'USLAH',            title: 'All Employees: Leisure and Hospitality (thousands)' },
  { id: 'USEHS',            title: 'All Employees: Education and Health Services (thousands)' },
  { id: 'USPBS',            title: 'All Employees: Professional and Business Services (thousands)' },
  { id: 'USWTRADE',         title: 'All Employees: Wholesale Trade (thousands)' },
  { id: 'USTRADE',          title: 'All Employees: Retail Trade (thousands)' },
  { id: 'USMINE',           title: 'All Employees: Mining and Logging (thousands)' },
  { id: 'CES9091000001',    title: 'All Employees: Federal Government (thousands)' },
  { id: 'CES9092000001',    title: 'All Employees: State Government (thousands)' },
  { id: 'CES9093000001',    title: 'All Employees: Local Government (thousands)' },

  // Productivity
  { id: 'OPHNFB',           title: 'Nonfarm Business Labor Productivity (index, 2012=100)' },
  { id: 'ULCNFB',           title: 'Nonfarm Business Unit Labor Costs (index)' },
  { id: 'PRS85006092',      title: 'Nonfarm Business Output Per Hour: Percent Change (quarterly)' },

  // Small business / startup
  { id: 'BDSBUS',           title: 'Business Dynamics: Net Job Creation Rate (all firms)' },
  { id: 'BDSFIRMS',         title: 'Business Dynamics: Number of Firms' },

  // Credit conditions
  { id: 'DRCCLACBS',        title: 'Delinquency Rate on Credit Cards: All Commercial Banks (percent)' },
  { id: 'DRBLACBS',         title: 'Delinquency Rate on Business Loans: All Commercial Banks (percent)' },
  { id: 'MORTGAGE15US',     title: '15-Year Fixed Rate Mortgage Average (percent)' },
  { id: 'TERMCBCCALLNS',    title: 'Interest Rate on Credit Card Plans: All Accounts (percent)' },

  // International comparison
  { id: 'IEABC',            title: 'US Current Account Balance (millions USD)' },
  { id: 'NETFI',            title: 'Net US International Investment Position (millions USD)' },
  { id: 'USDFCFP',          title: 'Foreign Direct Investment into the US (millions USD)' },

  // Financial stress
  { id: 'STLFSI4',          title: 'St. Louis Fed Financial Stress Index' },
  { id: 'NFCI',             title: 'Chicago Fed National Financial Conditions Index' },
  { id: 'BAMLH0A0HYM2',     title: 'ICE BofA US High Yield Index Option-Adjusted Spread (percent)' },
  { id: 'BAMLC0A0CM',       title: 'ICE BofA US Corporate Index Option-Adjusted Spread (percent)' },

  // Technology / Innovation
  { id: 'IPMINE',           title: 'Industrial Production: Mining (index)' },
  { id: 'COMPUTSA',         title: 'Manufacturers\' New Orders: Computer and Electronic Products (millions USD)' },

  // Agriculture
  { id: 'WPU01',            title: 'Producer Price Index: Farm Products (index)' },

  // Social
  { id: 'LES1252881500Q',   title: 'Usual Weekly Earnings: Employed Full-Time Workers (dollars)' },
  { id: 'LNU04073413',      title: 'Part-Time Workers for Economic Reasons (thousands)' },
  { id: 'NILFWJN',          title: 'Not in Labor Force: Want a Job Now (thousands)' },

  // Insurance
  { id: 'IC4WSA',           title: 'Insured Unemployment (4-Week Moving Average, thousands)' },
  { id: 'ICSA',             title: 'Initial Claims for Unemployment Insurance (weekly, thousands)' },
  { id: 'CCSA',             title: 'Continued Claims for Unemployment Insurance (thousands)' },

  // Small/medium indicators
  { id: 'AMDMNO',           title: 'Manufacturers New Orders: Durable Goods (millions USD)' },
  { id: 'AMDMVS',           title: 'Manufacturers Shipments: Durable Goods (millions USD)' },
  { id: 'ANXAVS',           title: 'Manufacturers Inventories to Shipments Ratio: Durable Goods' },

  // Misc / leading indicators
  { id: 'PERMIT1',          title: 'New Privately-Owned Housing Units Authorized: 1-Unit Structures (thousands)' },
  { id: 'HSN1F',            title: 'New One Family Houses Sold in the US (thousands)' },
  { id: 'EXHOSLUSM495S',    title: 'Existing Home Sales (thousands, seasonally adjusted annual rate)' },
  { id: 'MNFCTRSMSA',       title: 'Manufacturing and Trade: Total Business Sales (millions USD)' },
  { id: 'TCU',              title: 'Capacity Utilization: Total Industry (percent)' },
  { id: 'MCUMFN',           title: 'Capacity Utilization: Manufacturing (percent)' },

  // Commodities
  { id: 'PPIACO',           title: 'Producer Price Index: All Commodities (index)' },
  { id: 'PPIFES',           title: 'Producer Price Index: Finished Energy Goods (index)' },
  { id: 'PPIFGS',           title: 'Producer Price Index: Finished Goods (index)' },
  { id: 'PPICRM',           title: 'Producer Price Index: Crude Materials for Further Processing (index)' },
  { id: 'WPU10',            title: 'Producer Price Index: Metals and Metal Products (index)' },
  { id: 'GOLDAMGBD228NLBM', title: 'Gold Fixing Price (USD per troy ounce, London Bullion Market)' },
];

// ---------------------------------------------------------------------------
// 3. HTTP helper — wraps https.get as a Promise
// ---------------------------------------------------------------------------
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// 4. Main
// ---------------------------------------------------------------------------
async function main() {
  const OBS_START = '2015-01-01';
  const OBS_END   = '2024-12-31';
  const BASE      = 'https://api.stlouisfed.org/fred/series/observations';

  // Ensure output directory exists
  const outDir = path.join(ROOT, 'data', 'cultural', 'fred-usa');
  fs.mkdirSync(outDir, { recursive: true });

  const allDataPoints = [];
  let totalObs = 0;

  console.log(`Starting FRED download: ${SERIES.length} series, ${OBS_START} → ${OBS_END}\n`);

  for (let i = 0; i < SERIES.length; i++) {
    const { id, title } = SERIES[i];
    const url = `${BASE}?series_id=${id}&api_key=${FRED_API_KEY}&file_type=json&observation_start=${OBS_START}&observation_end=${OBS_END}`;

    let observations = [];
    let skipped = 0;
    let fetchError = null;

    try {
      const json = await fetchJSON(url);

      if (json.error_message) {
        fetchError = json.error_message;
      } else if (Array.isArray(json.observations)) {
        for (const obs of json.observations) {
          if (obs.value === '.') { skipped++; continue; }
          const numVal = parseFloat(obs.value);
          if (isNaN(numVal)) { skipped++; continue; }

          observations.push({
            context: `United States ${title} on ${obs.date} was ${obs.value}`,
            country: 'United States',
            countryCode: 'US',
            metric: id,
            indicator: id,
            value: numVal,
            year: parseInt(obs.date.slice(0, 4)),
            source: 'FRED',
          });
        }
      }
    } catch (err) {
      fetchError = err.message;
    }

    const count = observations.length;
    const label = fetchError
      ? `ERROR: ${fetchError}`
      : `${count} observations${skipped ? ` (${skipped} skipped)` : ''}`;

    console.log(`${String(i + 1).padStart(3)}/${SERIES.length}  ${id.padEnd(25)} — ${label}`);

    allDataPoints.push(...observations);
    totalObs += count;

    // 200ms delay between requests to respect FRED rate limits
    if (i < SERIES.length - 1) {
      await sleep(200);
    }
  }

  // Write output
  const outFile = path.join(outDir, 'fred-all.json');
  fs.writeFileSync(outFile, JSON.stringify(allDataPoints, null, 2));

  console.log(`\nDone.`);
  console.log(`Total data points: ${totalObs.toLocaleString()}`);
  console.log(`Output: ${outFile}`);
  console.log(`File size: ${(fs.statSync(outFile).size / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
