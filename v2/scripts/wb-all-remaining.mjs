#!/usr/bin/env node
/**
 * World Bank ALL COUNTRIES — Remaining 21 indicators (the first 29 are done)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/worldbank-all');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 400;
const TIMEOUT_MS = 60_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Already done indicators (29) - skip these
const DONE = new Set(fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('wb-','').replace('.json','').replace(/-/g,'.').toUpperCase()));

// All 50 indicators
const ALL_INDICATORS = [
  { id: 'NY.GDP.PCAP.CD', name: 'GDP per capita (current USD)', cat: 'economic' },
  { id: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth (annual %)', cat: 'economic' },
  { id: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices', cat: 'economic' },
  { id: 'SI.POV.GINI', name: 'Gini index', cat: 'economic' },
  { id: 'NY.GDP.PCAP.PP.CD', name: 'GDP per capita, PPP', cat: 'economic' },
  { id: 'GC.DOD.TOTL.GD.ZS', name: 'Government debt (% GDP)', cat: 'economic' },
  { id: 'SL.UEM.TOTL.ZS', name: 'Unemployment rate', cat: 'labor' },
  { id: 'SL.UEM.1524.ZS', name: 'Youth unemployment', cat: 'labor' },
  { id: 'SL.TLF.CACT.ZS', name: 'Labor force participation', cat: 'labor' },
  { id: 'SL.TLF.CACT.FE.ZS', name: 'Female labor participation', cat: 'labor' },
  { id: 'SL.EMP.SELF.ZS', name: 'Self-employment', cat: 'labor' },
  { id: 'SE.ADT.LITR.ZS', name: 'Adult literacy rate', cat: 'education' },
  { id: 'SE.TER.ENRR', name: 'Tertiary enrollment', cat: 'education' },
  { id: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% GDP)', cat: 'education' },
  { id: 'SE.PRM.CMPT.ZS', name: 'Primary completion rate', cat: 'education' },
  { id: 'SP.DYN.LE00.IN', name: 'Life expectancy', cat: 'health' },
  { id: 'SP.DYN.IMRT.IN', name: 'Infant mortality', cat: 'health' },
  { id: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% GDP)', cat: 'health' },
  { id: 'SH.MED.PHYS.ZS', name: 'Physicians per 1,000', cat: 'health' },
  { id: 'SP.DYN.TFRT.IN', name: 'Fertility rate', cat: 'health' },
  { id: 'SH.STA.SUIC.P5', name: 'Suicide rate', cat: 'health' },
  { id: 'SH.TBS.INCD', name: 'TB incidence', cat: 'health' },
  { id: 'SP.POP.TOTL', name: 'Population', cat: 'demographics' },
  { id: 'SP.POP.GROW', name: 'Population growth', cat: 'demographics' },
  { id: 'SP.URB.TOTL.IN.ZS', name: 'Urban population', cat: 'demographics' },
  { id: 'SP.POP.65UP.TO.ZS', name: 'Population 65+', cat: 'demographics' },
  { id: 'SM.POP.NETM', name: 'Net migration', cat: 'demographics' },
  { id: 'EN.ATM.CO2E.PC', name: 'CO2 per capita', cat: 'environment' },
  { id: 'EG.FEC.RNEW.ZS', name: 'Renewable energy %', cat: 'environment' },
  { id: 'AG.LND.FRST.ZS', name: 'Forest area', cat: 'environment' },
  { id: 'EG.ELC.ACCS.ZS', name: 'Access to electricity', cat: 'environment' },
  { id: 'SG.GEN.PARL.ZS', name: 'Women in parliament', cat: 'gender' },
  { id: 'SE.ENR.PRIM.FM.ZS', name: 'Gender parity primary', cat: 'gender' },
  { id: 'IC.REG.DURS', name: 'Time to start business', cat: 'business' },
  { id: 'IC.BUS.NDNS.ZS', name: 'New business density', cat: 'business' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'FDI inflows', cat: 'business' },
  { id: 'IT.NET.USER.ZS', name: 'Internet users', cat: 'infrastructure' },
  { id: 'IT.CEL.SETS.P2', name: 'Mobile subscriptions', cat: 'infrastructure' },
  { id: 'IT.NET.BBND.P2', name: 'Fixed broadband', cat: 'infrastructure' },
  { id: 'SI.POV.DDAY', name: 'Poverty $2.15/day', cat: 'poverty' },
  { id: 'SI.POV.NAHC', name: 'Poverty national', cat: 'poverty' },
  { id: 'ST.INT.ARVL', name: 'Tourism arrivals', cat: 'tourism' },
  { id: 'NE.EXP.GNFS.ZS', name: 'Exports (% GDP)', cat: 'trade' },
  { id: 'NE.IMP.GNFS.ZS', name: 'Imports (% GDP)', cat: 'trade' },
  { id: 'MS.MIL.XPND.GD.ZS', name: 'Military expenditure', cat: 'military' },
  { id: 'SH.H2O.SMDW.ZS', name: 'Safe drinking water', cat: 'health' },
  { id: 'SH.STA.SMSS.ZS', name: 'Sanitation access', cat: 'health' },
  { id: 'IP.PAT.RESD', name: 'Patent applications', cat: 'innovation' },
  { id: 'GB.XPD.RSDV.GD.ZS', name: 'R&D expenditure', cat: 'innovation' },
];

// Filter to only remaining
const remaining = ALL_INDICATORS.filter(ind => {
  const fileKey = ind.id.replace(/\./g, '-').toLowerCase();
  const exists = fs.existsSync(path.join(OUTPUT_DIR, `wb-${fileKey}.json`));
  return !exists;
});

async function fetchWithTimeout(url, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) { clearTimeout(timer); throw err; }
}

async function fetchAllPages(indicatorId) {
  const allItems = [];
  let page = 1;
  while (true) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorId}?format=json&per_page=10000&page=${page}&date=2018:2024`;
    try {
      const data = await fetchWithTimeout(url);
      if (!data[1] || data[1].length === 0) break;
      allItems.push(...data[1].filter(i => i.value !== null));
      if (page >= data[0].pages) break;
      page++;
      await sleep(100);
    } catch { break; }
  }
  return allItems;
}

async function main() {
  console.log(`Remaining indicators: ${remaining.length}/${ALL_INDICATORS.length}`);
  let totalDP = 0;

  for (let i = 0; i < remaining.length; i++) {
    const ind = remaining[i];
    const items = await fetchAllPages(ind.id);
    const dataPoints = items.map(item => ({
      indicator: ind.name, indicatorId: ind.id, category: ind.cat,
      country: item.country.value, countryCode: item.countryiso3code,
      year: parseInt(item.date), value: item.value,
      sourceUrl: `https://data.worldbank.org/indicator/${ind.id}?locations=${item.countryiso3code}`,
      source: 'World Bank', fetchedAt: '2026-04-09',
    }));
    totalDP += dataPoints.length;
    console.log(`[${i+1}/${remaining.length}] ${ind.name}: ${dataPoints.length} DP | Total: ${totalDP}`);
    if (dataPoints.length > 0) {
      const filename = `wb-${ind.id.replace(/\./g,'-').toLowerCase()}.json`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify({ indicator: ind.name, indicatorId: ind.id, category: ind.cat, source: 'World Bank', fetchedAt: '2026-04-09', dataPointCount: dataPoints.length, dataPoints }, null, 2));
    }
    await sleep(DELAY_MS);
  }
  console.log(`\nCOMPLETE: ${totalDP} new DP`);
}

main().catch(console.error);
