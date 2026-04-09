/**
 * Patch script — re-downloads the 5 indicators that failed with valid replacement codes
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/worldbank');
const TODAY = '2026-04-07';
const DATE_RANGE = '2018:2024';

const COUNTRIES = [
  { code: 'IDN', name: 'Indonesia' },
  { code: 'AUS', name: 'Australia' },
  { code: 'ITA', name: 'Italy' },
  { code: 'SGP', name: 'Singapore' },
  { code: 'MYS', name: 'Malaysia' },
  { code: 'USA', name: 'United States' },
  { code: 'DEU', name: 'Germany' },
  { code: 'FRA', name: 'France' },
  { code: 'GBR', name: 'United Kingdom' },
  { code: 'ESP', name: 'Spain' },
  { code: 'NLD', name: 'Netherlands' },
  { code: 'CHE', name: 'Switzerland' },
  { code: 'SWE', name: 'Sweden' },
  { code: 'POL', name: 'Poland' },
  { code: 'BEL', name: 'Belgium' },
  { code: 'AUT', name: 'Austria' },
  { code: 'NOR', name: 'Norway' },
  { code: 'DNK', name: 'Denmark' },
  { code: 'IRL', name: 'Ireland' },
  { code: 'PRT', name: 'Portugal' },
];

const countryMap = Object.fromEntries(COUNTRIES.map(c => [c.code, c.name]));
const CODES_JOINED = COUNTRIES.map(c => c.code).join(';');

// Replacement indicators for failed ones
const REPLACEMENTS = [
  {
    originalCode: 'IC.BUS.EASE.XQ',
    newCode: 'GC.TAX.TOTL.GD.ZS',
    metric: 'tax_revenue_pct_gdp',
    unit: '% of GDP',
    label: 'Tax revenue (% of GDP)',
    filename: 'ease-doing-business',
    note: 'Replaced discontinued IC.BUS.EASE.XQ (Doing Business retired 2021) with tax revenue % GDP'
  },
  {
    originalCode: 'EN.ATM.CO2E.PC',
    newCode: 'EN.GHG.CO2.PC.CE.AR5',
    metric: 'co2_emissions_per_capita',
    unit: 'tonnes CO2e per capita',
    label: 'CO2 emissions per capita (excl. LULUCF)',
    filename: 'co2-emissions',
    note: 'Replaced EN.ATM.CO2E.PC (archived) with EN.GHG.CO2.PC.CE.AR5 (GHG CO2 AR5 standard)'
  },
  {
    originalCode: 'IC.REG.DURS',
    newCode: 'IC.TAX.DURS',
    metric: 'time_to_pay_taxes_hours',
    unit: 'hours per year',
    label: 'Time to pay taxes (hours per year)',
    filename: 'business-start-time',
    note: 'Replaced discontinued IC.REG.DURS with IC.TAX.DURS (time to comply with taxes)'
  },
  {
    originalCode: 'IC.REG.COST.PC.ZS',
    newCode: 'GC.XPN.TOTL.GD.ZS',
    metric: 'government_expenditure_pct_gdp',
    unit: '% of GDP',
    label: 'Government expenditure (% of GDP)',
    filename: 'business-start-cost',
    note: 'Replaced discontinued IC.REG.COST.PC.ZS with government expenditure % GDP'
  },
  {
    originalCode: 'IC.TAX.TOTL.CP.ZS',
    newCode: 'GC.TAX.YPKG.RV.ZS',
    metric: 'taxes_on_income_pct_revenue',
    unit: '% of revenue',
    label: 'Taxes on income, profits and capital gains (% of revenue)',
    filename: 'tax-rate',
    note: 'Replaced discontinued IC.TAX.TOTL.CP.ZS with income/profit taxes % of revenue'
  },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function formatValue(value) {
  if (value === null || value === undefined) return null;
  return Math.round(Number(value) * 100) / 100;
}

async function fetchIndicator(code) {
  const url = `https://api.worldbank.org/v2/country/${CODES_JOINED}/indicator/${code}?format=json&per_page=500&date=${DATE_RANGE}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json;
}

async function main() {
  console.log('=== Patching failed indicators with replacements ===\n');
  let totalNew = 0;

  for (const rep of REPLACEMENTS) {
    process.stdout.write(`Trying ${rep.newCode} → ${rep.filename}.json ... `);

    let rows = [];
    try {
      const json = await fetchIndicator(rep.newCode);
      if (!Array.isArray(json) || json.length < 2 || !json[1]) {
        console.log('NO DATA');
        continue;
      }
      rows = json[1];
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      continue;
    }

    const dataPoints = [];
    let i = 1;
    for (const row of rows) {
      if (!row || row.value === null || row.value === undefined) continue;
      const cc = row.countryiso3code || row.country?.id;
      if (!cc || !countryMap[cc]) continue;

      const val = formatValue(row.value);
      const year = parseInt(row.date, 10);
      const country = countryMap[cc];

      dataPoints.push({
        id: `WB-${rep.filename.toUpperCase().replace(/-/g, '')}-${String(i).padStart(4, '0')}`,
        country,
        countryCode: cc,
        metric: rep.metric,
        value: val,
        unit: rep.unit,
        year,
        source: `World Bank ${year}`,
        context: `${country} ${rep.label.toLowerCase()} was ${val} ${rep.unit} in ${year}`,
      });
      i++;
    }

    dataPoints.sort((a, b) => a.country < b.country ? -1 : a.country > b.country ? 1 : b.year - a.year);

    const output = {
      metadata: {
        source: 'World Bank',
        indicator: rep.label,
        indicatorCode: rep.newCode,
        originalIndicatorCode: rep.originalCode,
        note: rep.note,
        metric: rep.metric,
        unit: rep.unit,
        countries: 20,
        dateRange: DATE_RANGE,
        lastUpdated: TODAY,
        totalDataPoints: dataPoints.length,
      },
      dataPoints,
    };

    const path = join(OUTPUT_DIR, `${rep.filename}.json`);
    writeFileSync(path, JSON.stringify(output, null, 2), 'utf8');

    console.log(`${dataPoints.length} data points`);
    totalNew += dataPoints.length;
    await sleep(200);
  }

  console.log(`\nPatch complete. Additional data points: ${totalNew}`);
}

main().catch(e => { console.error(e); process.exit(1); });
