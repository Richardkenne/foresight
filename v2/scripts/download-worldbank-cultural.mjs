/**
 * World Bank Bulk Data Downloader for Foresight RAG System
 * Downloads 30 indicators for 20 countries, 2018-2024
 * Output: /data/cultural/worldbank/ — one JSON file per indicator
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/worldbank');

// --- Countries ---
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

// --- Indicators ---
const INDICATORS = [
  { code: 'NY.GDP.PCAP.CD',      metric: 'gdp_per_capita',              unit: 'USD',            label: 'GDP per capita',                    filename: 'gdp-per-capita' },
  { code: 'SL.UEM.TOTL.ZS',      metric: 'unemployment_rate',           unit: '%',              label: 'Unemployment rate',                 filename: 'unemployment-rate' },
  { code: 'SP.POP.TOTL',         metric: 'total_population',            unit: 'people',         label: 'Total population',                  filename: 'total-population' },
  { code: 'SE.XPD.TOTL.GD.ZS',   metric: 'education_spending_pct_gdp',  unit: '% of GDP',       label: 'Education spending % GDP',          filename: 'education-spending' },
  { code: 'SH.XPD.CHEX.GD.ZS',   metric: 'health_spending_pct_gdp',     unit: '% of GDP',       label: 'Health spending % GDP',             filename: 'health-spending' },
  { code: 'NY.GNS.ICTR.ZS',      metric: 'gross_savings_pct_gdp',       unit: '% of GDP',       label: 'Gross savings % GDP',               filename: 'gross-savings' },
  { code: 'SI.POV.GINI',         metric: 'gini_index',                  unit: 'index (0-100)',  label: 'Gini inequality index',             filename: 'gini-index' },
  { code: 'IC.BUS.EASE.XQ',      metric: 'ease_of_doing_business',      unit: 'score',          label: 'Ease of doing business score',      filename: 'ease-doing-business' },
  { code: 'IT.NET.USER.ZS',      metric: 'internet_users_pct',          unit: '% of population',label: 'Internet users %',                  filename: 'internet-users' },
  { code: 'SP.DYN.LE00.IN',      metric: 'life_expectancy',             unit: 'years',          label: 'Life expectancy at birth',          filename: 'life-expectancy' },
  { code: 'SL.TLF.CACT.FE.ZS',   metric: 'female_labor_participation',  unit: '% of female pop',label: 'Female labor force participation',  filename: 'female-labor-participation' },
  { code: 'SL.TLF.CACT.MA.ZS',   metric: 'male_labor_participation',    unit: '% of male pop',  label: 'Male labor force participation',    filename: 'male-labor-participation' },
  { code: 'SE.TER.ENRR',         metric: 'tertiary_enrollment_rate',    unit: '% gross',        label: 'Tertiary school enrollment rate',   filename: 'tertiary-enrollment' },
  { code: 'FP.CPI.TOTL.ZG',      metric: 'inflation_rate',              unit: '% annual',       label: 'Inflation rate (CPI)',               filename: 'inflation-rate' },
  { code: 'BX.TRF.PWKR.CD.DT',   metric: 'remittances_received',        unit: 'USD',            label: 'Personal remittances received',     filename: 'remittances' },
  { code: 'SM.POP.NETM',         metric: 'net_migration',               unit: 'people',         label: 'Net migration',                     filename: 'net-migration' },
  { code: 'SP.URB.TOTL.IN.ZS',   metric: 'urban_population_pct',        unit: '% of total',     label: 'Urban population %',                filename: 'urban-population' },
  { code: 'SL.EMP.SELF.ZS',      metric: 'self_employed_pct',           unit: '% of employment',label: 'Self-employed % of total employment',filename: 'self-employed' },
  { code: 'NY.GDP.MKTP.KD.ZG',   metric: 'gdp_growth_pct',              unit: '% annual',       label: 'GDP growth rate',                   filename: 'gdp-growth' },
  { code: 'SH.STA.SUIC.P5',      metric: 'suicide_rate_per_100k',       unit: 'per 100,000',    label: 'Suicide mortality rate',            filename: 'suicide-rate' },
  { code: 'SP.DYN.TFRT.IN',      metric: 'fertility_rate',              unit: 'births per woman',label: 'Total fertility rate',             filename: 'fertility-rate' },
  { code: 'SP.DYN.SMAM.MA',      metric: 'mean_age_first_marriage_male',unit: 'years',          label: 'Mean age at first marriage (male)', filename: 'marriage-age-male' },
  { code: 'SP.DYN.SMAM.FE',      metric: 'mean_age_first_marriage_female',unit: 'years',        label: 'Mean age at first marriage (female)',filename: 'marriage-age-female' },
  { code: 'IC.REG.DURS',         metric: 'time_to_start_business_days', unit: 'days',           label: 'Time required to start a business', filename: 'business-start-time' },
  { code: 'IC.REG.COST.PC.ZS',   metric: 'cost_to_start_business_pct_gni',unit: '% of GNI',    label: 'Cost to start business % GNI per capita',filename: 'business-start-cost' },
  { code: 'IC.TAX.TOTL.CP.ZS',   metric: 'total_tax_rate_pct_profit',   unit: '% of profit',   label: 'Total tax and contribution rate',   filename: 'tax-rate' },
  { code: 'SL.UEM.1524.ZS',      metric: 'youth_unemployment_pct',      unit: '%',              label: 'Youth unemployment % (ages 15-24)', filename: 'youth-unemployment' },
  { code: 'SE.ADT.LITR.ZS',      metric: 'adult_literacy_rate',         unit: '% of people 15+',label: 'Adult literacy rate',               filename: 'adult-literacy' },
  { code: 'EN.ATM.CO2E.PC',      metric: 'co2_emissions_per_capita',    unit: 'metric tons',    label: 'CO2 emissions per capita',          filename: 'co2-emissions' },
  { code: 'ST.INT.ARVL',         metric: 'international_tourism_arrivals',unit: 'arrivals',     label: 'International tourism arrivals',    filename: 'tourism-arrivals' },
];

const COUNTRY_CODES_JOINED = COUNTRIES.map(c => c.code).join(';');
const DELAY_MS = 200;
const DATE_RANGE = '2018:2024';
const TODAY = '2026-04-07';

// Lookup maps
const countryMap = Object.fromEntries(COUNTRIES.map(c => [c.code, c.name]));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function formatValue(value, metric) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  // Round reasonably based on metric type
  if (metric.includes('pct') || metric.includes('rate') || metric.includes('pct_gdp') || metric === 'gini_index') {
    return Math.round(num * 100) / 100;
  }
  if (metric === 'total_population' || metric === 'net_migration' || metric.includes('arrivals') || metric.includes('remittances')) {
    return Math.round(num);
  }
  return Math.round(num * 10) / 10;
}

function buildContext(country, indicator, value, unit, year) {
  if (value === null) return null;
  const label = indicator.label;
  return `${country} ${label.toLowerCase()} was ${value} ${unit} in ${year}`;
}

async function fetchIndicator(indicatorCode, indicatorMeta, pageNum = 1) {
  const url = `https://api.worldbank.org/v2/country/${COUNTRY_CODES_JOINED}/indicator/${indicatorCode}?format=json&per_page=500&date=${DATE_RANGE}&page=${pageNum}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${indicatorCode}`);
  const json = await res.json();
  return json;
}

async function downloadIndicator(indicator, indicatorIndex) {
  const totalIndicators = INDICATORS.length;
  process.stdout.write(`[${indicatorIndex + 1}/${totalIndicators}] ${indicator.label} (${indicator.code}) ... `);

  let allData = [];
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const json = await fetchIndicator(indicator.code, indicator, page);

      // World Bank returns [paginationInfo, dataArray]
      if (!Array.isArray(json) || json.length < 2) {
        console.log('NO DATA (unexpected response format)');
        break;
      }

      const [meta, rows] = json;
      if (!rows || rows.length === 0) {
        if (page === 1) console.log('NO DATA');
        break;
      }

      totalPages = meta.pages || 1;
      allData = allData.concat(rows);

      if (page < totalPages) {
        page++;
        await sleep(DELAY_MS);
      } else {
        break;
      }
    } while (page <= totalPages);

  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return { dataPoints: [], count: 0 };
  }

  // Transform to RAG format
  const dataPoints = [];
  let idCounter = 1;

  for (const row of allData) {
    if (!row || row.value === null || row.value === undefined) continue;

    const countryCode = row.countryiso3code || row.country?.id;
    if (!countryCode || !countryMap[countryCode]) continue; // skip non-target countries

    const countryName = countryMap[countryCode];
    const year = parseInt(row.date, 10);
    const rawValue = row.value;
    const formattedValue = formatValue(rawValue, indicator.metric);
    const context = buildContext(countryName, indicator, formattedValue, indicator.unit, year);

    dataPoints.push({
      id: `WB-${indicator.filename.toUpperCase().replace(/-/g, '')}-${String(idCounter).padStart(4, '0')}`,
      country: countryName,
      countryCode,
      metric: indicator.metric,
      value: formattedValue,
      unit: indicator.unit,
      year,
      source: `World Bank ${year}`,
      context,
    });

    idCounter++;
  }

  // Sort by country then year descending
  dataPoints.sort((a, b) => {
    if (a.country < b.country) return -1;
    if (a.country > b.country) return 1;
    return b.year - a.year;
  });

  console.log(`${dataPoints.length} data points`);
  return { dataPoints, count: dataPoints.length };
}

async function main() {
  console.log('=== World Bank Bulk Downloader for Foresight RAG ===');
  console.log(`Countries: ${COUNTRIES.length} | Indicators: ${INDICATORS.length} | Range: ${DATE_RANGE}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log('');

  // Ensure output dir exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let grandTotal = 0;
  const summary = [];

  for (let i = 0; i < INDICATORS.length; i++) {
    const indicator = INDICATORS[i];

    const { dataPoints, count } = await downloadIndicator(indicator, i);

    const output = {
      metadata: {
        source: 'World Bank',
        indicator: indicator.label,
        indicatorCode: indicator.code,
        metric: indicator.metric,
        unit: indicator.unit,
        countries: COUNTRIES.length,
        dateRange: DATE_RANGE,
        lastUpdated: TODAY,
        totalDataPoints: count,
      },
      dataPoints,
    };

    const outputPath = join(OUTPUT_DIR, `${indicator.filename}.json`);
    writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

    grandTotal += count;
    summary.push({ indicator: indicator.label, file: `${indicator.filename}.json`, count });

    // Respectful delay between requests
    if (i < INDICATORS.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log('');
  console.log('=== DOWNLOAD COMPLETE ===');
  console.log('');

  // Summary table
  console.log('Indicator                              | File                          | Points');
  console.log('---------------------------------------|-------------------------------|-------');
  for (const s of summary) {
    const ind = s.indicator.padEnd(38).slice(0, 38);
    const file = s.file.padEnd(30).slice(0, 30);
    console.log(`${ind} | ${file} | ${s.count}`);
  }

  console.log('');
  console.log(`TOTAL DATA POINTS DOWNLOADED: ${grandTotal}`);
  console.log(`Files saved to: ${OUTPUT_DIR}`);

  // Write index file
  const indexPath = join(OUTPUT_DIR, '_INDEX.json');
  writeFileSync(indexPath, JSON.stringify({
    description: 'World Bank bulk data for Foresight RAG system',
    source: 'World Bank Open Data API v2',
    countries: COUNTRIES,
    indicators: INDICATORS.map(ind => ({
      code: ind.code,
      metric: ind.metric,
      label: ind.label,
      unit: ind.unit,
      file: `${ind.filename}.json`,
    })),
    dateRange: DATE_RANGE,
    lastUpdated: TODAY,
    totalDataPoints: grandTotal,
    summary,
  }, null, 2), 'utf8');

  console.log(`Index written: ${indexPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
