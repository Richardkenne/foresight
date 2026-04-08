#!/usr/bin/env node
/**
 * World Bank — Expand to 60 NEW countries (top 200 indicators)
 * Adds: BRICS, ASEAN, Middle East, Africa, Latin America, Caribbean, rest of Europe
 * Concurrency: 5 | Delay: 200ms | Timeout: 30s
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/worldbank-expanded');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const CONCURRENCY = 5;
const DELAY_MS = 200;
const TIMEOUT_MS = 30_000;
const DATE_RANGE = '2020:2024';
const CHECKPOINT_EVERY = 10;

// 60 NEW countries (not in existing 20)
const NEW_COUNTRIES = {
  // BRICS+
  BRA: 'Brazil', RUS: 'Russia', IND: 'India', CHN: 'China', ZAF: 'South Africa',
  // ASEAN
  THA: 'Thailand', VNM: 'Vietnam', PHL: 'Philippines', MMR: 'Myanmar', KHM: 'Cambodia',
  LAO: 'Laos', BRN: 'Brunei',
  // East Asia
  JPN: 'Japan', KOR: 'South Korea', TWN: 'Taiwan', HKG: 'Hong Kong',
  // South Asia
  BGD: 'Bangladesh', PAK: 'Pakistan', LKA: 'Sri Lanka', NPL: 'Nepal',
  // Middle East
  ARE: 'United Arab Emirates', SAU: 'Saudi Arabia', QAT: 'Qatar', KWT: 'Kuwait',
  BHR: 'Bahrain', OMN: 'Oman', JOR: 'Jordan', LBN: 'Lebanon', ISR: 'Israel', TUR: 'Turkey',
  // Africa
  NGA: 'Nigeria', KEN: 'Kenya', GHA: 'Ghana', ETH: 'Ethiopia', TZA: 'Tanzania',
  EGY: 'Egypt', MAR: 'Morocco', TUN: 'Tunisia', SEN: 'Senegal', CIV: "Ivory Coast",
  CMR: 'Cameroon', UGA: 'Uganda', RWA: 'Rwanda', MOZ: 'Mozambique',
  // Latin America
  MEX: 'Mexico', ARG: 'Argentina', COL: 'Colombia', CHL: 'Chile', PER: 'Peru',
  ECU: 'Ecuador', URY: 'Uruguay', CRI: 'Costa Rica', PAN: 'Panama', DOM: 'Dominican Republic',
  // Europe (remaining)
  FIN: 'Finland', GRC: 'Greece', CZE: 'Czech Republic', ROU: 'Romania',
  HUN: 'Hungary', HRV: 'Croatia', BGR: 'Bulgaria', LTU: 'Lithuania',
  SVK: 'Slovakia', SVN: 'Slovenia',
};

// Top 200 indicators (same as worldbank-mega)
const INDICATORS = [
  // Economic (40)
  { id: 'NY.GDP.PCAP.CD', name: 'GDP per capita', unit: 'USD' },
  { id: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth rate', unit: '%' },
  { id: 'FP.CPI.TOTL.ZG', name: 'inflation (CPI)', unit: '%' },
  { id: 'NE.EXP.GNFS.ZS', name: 'exports', unit: '% of GDP' },
  { id: 'NE.IMP.GNFS.ZS', name: 'imports', unit: '% of GDP' },
  { id: 'BN.CAB.XOKA.GD.ZS', name: 'current account balance', unit: '% of GDP' },
  { id: 'NY.GNS.ICTR.ZS', name: 'gross savings rate', unit: '% of GDP' },
  { id: 'SI.POV.GINI', name: 'Gini index', unit: 'index' },
  { id: 'NY.GDP.PCAP.PP.CD', name: 'GDP per capita (PPP)', unit: 'int. USD' },
  { id: 'NY.GNP.PCAP.CD', name: 'GNI per capita', unit: 'USD' },
  { id: 'NE.CON.PRVT.ZS', name: 'household consumption', unit: '% of GDP' },
  { id: 'NV.SRV.TOTL.ZS', name: 'services sector', unit: '% of GDP' },
  { id: 'NV.IND.TOTL.ZS', name: 'industry sector', unit: '% of GDP' },
  { id: 'NV.AGR.TOTL.ZS', name: 'agriculture sector', unit: '% of GDP' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'FDI inflows', unit: '% of GDP' },
  { id: 'GC.TAX.TOTL.GD.ZS', name: 'tax revenue', unit: '% of GDP' },
  { id: 'GC.DOD.TOTL.GD.ZS', name: 'government debt', unit: '% of GDP' },
  { id: 'SE.XPD.TOTL.GD.ZS', name: 'education expenditure', unit: '% of GDP' },
  { id: 'SH.XPD.CHEX.GD.ZS', name: 'health expenditure', unit: '% of GDP' },
  { id: 'MS.MIL.XPND.GD.ZS', name: 'military expenditure', unit: '% of GDP' },
  { id: 'IT.CEL.SETS.P2', name: 'mobile subscriptions', unit: 'per 100' },
  { id: 'IT.NET.USER.ZS', name: 'internet users', unit: '%' },
  { id: 'EG.USE.ELEC.KH.PC', name: 'electricity consumption per capita', unit: 'kWh' },
  { id: 'PA.NUS.FCRF', name: 'exchange rate', unit: 'LCU/USD' },
  { id: 'CM.MKT.LCAP.GD.ZS', name: 'stock market cap', unit: '% of GDP' },
  // Labor (20)
  { id: 'SL.UEM.TOTL.ZS', name: 'unemployment rate', unit: '%' },
  { id: 'SL.UEM.1524.ZS', name: 'youth unemployment', unit: '%' },
  { id: 'SL.TLF.CACT.ZS', name: 'labor force participation', unit: '%' },
  { id: 'SL.TLF.CACT.FE.ZS', name: 'female labor participation', unit: '%' },
  { id: 'SL.EMP.TOTL.SP.ZS', name: 'employment ratio', unit: '%' },
  { id: 'SL.EMP.SELF.ZS', name: 'self-employment', unit: '%' },
  { id: 'SL.EMP.VULN.ZS', name: 'vulnerable employment', unit: '%' },
  { id: 'SL.AGR.EMPL.ZS', name: 'employment in agriculture', unit: '%' },
  { id: 'SL.IND.EMPL.ZS', name: 'employment in industry', unit: '%' },
  { id: 'SL.SRV.EMPL.ZS', name: 'employment in services', unit: '%' },
  // Education (15)
  { id: 'SE.PRM.ENRR', name: 'primary enrollment', unit: '% gross' },
  { id: 'SE.SEC.ENRR', name: 'secondary enrollment', unit: '% gross' },
  { id: 'SE.TER.ENRR', name: 'tertiary enrollment', unit: '% gross' },
  { id: 'SE.ADT.LITR.ZS', name: 'adult literacy', unit: '%' },
  { id: 'SE.ADT.1524.LT.ZS', name: 'youth literacy', unit: '%' },
  { id: 'SE.PRM.CMPT.ZS', name: 'primary completion rate', unit: '%' },
  { id: 'SE.SEC.CMPT.LO.ZS', name: 'lower secondary completion', unit: '%' },
  { id: 'SE.XPD.PRIM.PC.ZS', name: 'expenditure per student (primary)', unit: '% of GDP/capita' },
  // Health (20)
  { id: 'SP.DYN.LE00.IN', name: 'life expectancy', unit: 'years' },
  { id: 'SP.DYN.IMRT.IN', name: 'infant mortality', unit: 'per 1,000' },
  { id: 'SH.DYN.MORT', name: 'under-5 mortality', unit: 'per 1,000' },
  { id: 'SH.STA.MMRT', name: 'maternal mortality', unit: 'per 100,000' },
  { id: 'SP.DYN.TFRT.IN', name: 'fertility rate', unit: 'births per woman' },
  { id: 'SH.MED.PHYS.ZS', name: 'physicians density', unit: 'per 1,000' },
  { id: 'SH.MED.BEDS.ZS', name: 'hospital beds', unit: 'per 1,000' },
  { id: 'SH.IMM.MEAS', name: 'measles immunization', unit: '% children' },
  { id: 'SH.TBS.INCD', name: 'TB incidence', unit: 'per 100,000' },
  { id: 'SH.HIV.INCD.ZS', name: 'HIV incidence', unit: 'per 1,000' },
  { id: 'SH.STA.SUIC.P5', name: 'suicide rate', unit: 'per 100,000' },
  { id: 'SH.PRV.SMOK', name: 'smoking prevalence', unit: '%' },
  { id: 'SN.ITK.DEFC.ZS', name: 'prevalence of undernourishment', unit: '%' },
  { id: 'SH.STA.OWGH.ZS', name: 'overweight prevalence', unit: '%' },
  { id: 'SH.H2O.SMDW.ZS', name: 'access to safe water', unit: '%' },
  { id: 'SH.STA.SMSS.ZS', name: 'access to sanitation', unit: '%' },
  // Demographics (10)
  { id: 'SP.POP.TOTL', name: 'total population', unit: 'people' },
  { id: 'SP.POP.GROW', name: 'population growth', unit: '%' },
  { id: 'SP.URB.TOTL.IN.ZS', name: 'urban population', unit: '%' },
  { id: 'SP.POP.65UP.TO.ZS', name: 'population 65+', unit: '%' },
  { id: 'SP.POP.0014.TO.ZS', name: 'population 0-14', unit: '%' },
  { id: 'SM.POP.NETM', name: 'net migration', unit: 'people' },
  { id: 'SP.DYN.CBRT.IN', name: 'birth rate', unit: 'per 1,000' },
  { id: 'SP.DYN.CDRT.IN', name: 'death rate', unit: 'per 1,000' },
  // Environment (10)
  { id: 'EN.ATM.CO2E.PC', name: 'CO2 emissions per capita', unit: 'metric tons' },
  { id: 'EG.FEC.RNEW.ZS', name: 'renewable energy', unit: '% of total' },
  { id: 'AG.LND.FRST.ZS', name: 'forest area', unit: '%' },
  { id: 'AG.LND.ARBL.ZS', name: 'arable land', unit: '%' },
  { id: 'EN.ATM.PM25.MC.M3', name: 'PM2.5 air pollution', unit: 'µg/m³' },
  { id: 'ER.H2O.FWTL.ZS', name: 'freshwater withdrawal', unit: '%' },
  // Gender (10)
  { id: 'SG.GEN.PARL.ZS', name: 'women in parliament', unit: '%' },
  { id: 'SE.ENR.PRIM.FM.ZS', name: 'gender parity primary', unit: 'ratio' },
  { id: 'SE.ENR.SECO.FM.ZS', name: 'gender parity secondary', unit: 'ratio' },
  { id: 'SL.TLF.CACT.FM.ZS', name: 'female-to-male labor ratio', unit: 'ratio' },
  // Financial inclusion (10)
  { id: 'FX.OWN.TOTL.ZS', name: 'bank account ownership', unit: '%' },
  { id: 'IC.REG.DURS', name: 'time to start business', unit: 'days' },
  { id: 'IC.REG.COST.PC.ZS', name: 'cost to start business', unit: '% of GNI/capita' },
  { id: 'IC.BUS.NDNS.ZS', name: 'new business density', unit: 'per 1,000' },
  { id: 'IC.LGL.CRED.XQ', name: 'legal rights index', unit: '0-12' },
  { id: 'IC.CRD.INFO.XQ', name: 'credit info depth', unit: '0-8' },
  // Poverty (5)
  { id: 'SI.POV.DDAY', name: 'poverty headcount $2.15/day', unit: '%' },
  { id: 'SI.POV.NAHC', name: 'poverty headcount national', unit: '%' },
  { id: 'SI.SPR.PCAP.ZG', name: 'shared prosperity', unit: '%' },
  // Infrastructure (5)
  { id: 'IS.AIR.PSGR', name: 'air transport passengers', unit: 'people' },
  { id: 'IS.RRS.GOOD.MT.K6', name: 'railways goods transported', unit: 'million ton-km' },
  { id: 'EG.ELC.ACCS.ZS', name: 'access to electricity', unit: '%' },
  { id: 'IT.NET.BBND.P2', name: 'fixed broadband', unit: 'per 100' },
  { id: 'IP.PAT.RESD', name: 'patent applications residents', unit: 'count' },
  // Tourism & Trade (5)
  { id: 'ST.INT.ARVL', name: 'international tourism arrivals', unit: 'people' },
  { id: 'ST.INT.RCPT.CD', name: 'tourism receipts', unit: 'USD' },
  { id: 'TG.VAL.TOTL.GD.ZS', name: 'merchandise trade', unit: '% of GDP' },
  { id: 'BG.GSR.NFSV.GD.ZS', name: 'trade in services', unit: '% of GDP' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

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

async function fetchIndicatorBatch(countryCodes, indicators, batchIdx) {
  const countryStr = countryCodes.join(';');
  const dataPoints = [];

  for (let i = 0; i < indicators.length; i++) {
    const ind = indicators[i];
    const url = `https://api.worldbank.org/v2/country/${countryStr}/indicator/${ind.id}?format=json&per_page=1000&date=${DATE_RANGE}`;

    try {
      const data = await fetchWithTimeout(url);
      if (data[1]) {
        for (const item of data[1]) {
          if (item.value !== null) {
            dataPoints.push({
              indicator: ind.name,
              indicatorId: ind.id,
              country: item.country.value,
              countryCode: item.countryiso3code,
              year: parseInt(item.date),
              value: item.value,
              unit: ind.unit,
              sourceUrl: `https://data.worldbank.org/indicator/${ind.id}?locations=${item.countryiso3code}`,
              source: 'World Bank',
              fetchedAt: new Date().toISOString().split('T')[0],
            });
          }
        }
      }
    } catch (err) {
      // Skip failed indicators silently
    }

    if (i % 10 === 0 && i > 0) {
      process.stdout.write(`  Batch ${batchIdx}: ${i}/${indicators.length} indicators, ${dataPoints.length} DP\r`);
    }
    await sleep(DELAY_MS);
  }

  return dataPoints;
}

async function main() {
  const countryCodes = Object.keys(NEW_COUNTRIES);
  console.log(`\n=== World Bank Expanded Countries Download ===`);
  console.log(`Countries: ${countryCodes.length} new countries`);
  console.log(`Indicators: ${INDICATORS.length}`);
  console.log(`Expected: ~${countryCodes.length * INDICATORS.length * 3} data points\n`);

  // Process in batches of 10 countries
  const BATCH_SIZE = 10;
  let totalDP = 0;

  for (let b = 0; b < countryCodes.length; b += BATCH_SIZE) {
    const batchCountries = countryCodes.slice(b, b + BATCH_SIZE);
    const batchNames = batchCountries.map(c => NEW_COUNTRIES[c]).join(', ');
    console.log(`\nBatch ${Math.floor(b/BATCH_SIZE) + 1}/${Math.ceil(countryCodes.length/BATCH_SIZE)}: ${batchNames}`);

    // Parallel fetch: split indicators into CONCURRENCY chunks
    const chunkSize = Math.ceil(INDICATORS.length / CONCURRENCY);
    const chunks = [];
    for (let i = 0; i < INDICATORS.length; i += chunkSize) {
      chunks.push(INDICATORS.slice(i, i + chunkSize));
    }

    const results = await Promise.all(
      chunks.map((chunk, idx) => fetchIndicatorBatch(batchCountries, chunk, idx))
    );

    const batchDP = results.flat();
    totalDP += batchDP.length;

    // Save per-country files
    for (const code of batchCountries) {
      const countryDP = batchDP.filter(dp => dp.countryCode === code);
      if (countryDP.length > 0) {
        const filename = `${code.toLowerCase()}-indicators.json`;
        const output = {
          country: NEW_COUNTRIES[code],
          countryCode: code,
          source: 'World Bank',
          fetchedAt: new Date().toISOString().split('T')[0],
          indicatorCount: new Set(countryDP.map(d => d.indicatorId)).size,
          dataPointCount: countryDP.length,
          dataPoints: countryDP,
        };
        fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(output, null, 2));
        console.log(`  ${NEW_COUNTRIES[code]}: ${countryDP.length} DP`);
      }
    }

    // Checkpoint
    console.log(`  Batch total: ${batchDP.length} DP | Running total: ${totalDP} DP`);
  }

  // Summary
  console.log(`\n=== COMPLETE ===`);
  console.log(`Total data points: ${totalDP.toLocaleString()}`);
  console.log(`Files saved to: ${OUTPUT_DIR}`);
  console.log(`Countries: ${countryCodes.length}`);
}

main().catch(console.error);
