#!/usr/bin/env node
/**
 * World Bank ALL COUNTRIES — Top 50 indicators × ALL 217 countries
 * This is the BIGGEST single download: ~500K+ data points
 * Uses "all" country shortcut for maximum coverage
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/worldbank-all');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 300;
const TIMEOUT_MS = 60_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Top 50 most valuable indicators for life simulator
const INDICATORS = [
  // Core economic
  { id: 'NY.GDP.PCAP.CD', name: 'GDP per capita (current USD)', cat: 'economic' },
  { id: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth (annual %)', cat: 'economic' },
  { id: 'FP.CPI.TOTL.ZG', name: 'Inflation, consumer prices (annual %)', cat: 'economic' },
  { id: 'SI.POV.GINI', name: 'Gini index', cat: 'economic' },
  { id: 'NY.GDP.PCAP.PP.CD', name: 'GDP per capita, PPP', cat: 'economic' },
  { id: 'GC.DOD.TOTL.GD.ZS', name: 'Central government debt (% GDP)', cat: 'economic' },
  // Employment
  { id: 'SL.UEM.TOTL.ZS', name: 'Unemployment, total (% labor force)', cat: 'labor' },
  { id: 'SL.UEM.1524.ZS', name: 'Youth unemployment (15-24)', cat: 'labor' },
  { id: 'SL.TLF.CACT.ZS', name: 'Labor force participation rate', cat: 'labor' },
  { id: 'SL.TLF.CACT.FE.ZS', name: 'Female labor force participation', cat: 'labor' },
  { id: 'SL.EMP.SELF.ZS', name: 'Self-employment (% total)', cat: 'labor' },
  // Education
  { id: 'SE.ADT.LITR.ZS', name: 'Adult literacy rate', cat: 'education' },
  { id: 'SE.TER.ENRR', name: 'Tertiary enrollment (% gross)', cat: 'education' },
  { id: 'SE.XPD.TOTL.GD.ZS', name: 'Education expenditure (% GDP)', cat: 'education' },
  { id: 'SE.PRM.CMPT.ZS', name: 'Primary completion rate', cat: 'education' },
  // Health
  { id: 'SP.DYN.LE00.IN', name: 'Life expectancy at birth', cat: 'health' },
  { id: 'SP.DYN.IMRT.IN', name: 'Infant mortality rate', cat: 'health' },
  { id: 'SH.XPD.CHEX.GD.ZS', name: 'Health expenditure (% GDP)', cat: 'health' },
  { id: 'SH.MED.PHYS.ZS', name: 'Physicians per 1,000', cat: 'health' },
  { id: 'SP.DYN.TFRT.IN', name: 'Fertility rate (births/woman)', cat: 'health' },
  { id: 'SH.STA.SUIC.P5', name: 'Suicide mortality rate', cat: 'health' },
  { id: 'SH.TBS.INCD', name: 'Tuberculosis incidence', cat: 'health' },
  // Demographics
  { id: 'SP.POP.TOTL', name: 'Population, total', cat: 'demographics' },
  { id: 'SP.POP.GROW', name: 'Population growth (annual %)', cat: 'demographics' },
  { id: 'SP.URB.TOTL.IN.ZS', name: 'Urban population (%)', cat: 'demographics' },
  { id: 'SP.POP.65UP.TO.ZS', name: 'Population ages 65+ (%)', cat: 'demographics' },
  { id: 'SM.POP.NETM', name: 'Net migration', cat: 'demographics' },
  // Environment
  { id: 'EN.ATM.CO2E.PC', name: 'CO2 emissions per capita', cat: 'environment' },
  { id: 'EG.FEC.RNEW.ZS', name: 'Renewable energy (%)', cat: 'environment' },
  { id: 'AG.LND.FRST.ZS', name: 'Forest area (%)', cat: 'environment' },
  { id: 'EG.ELC.ACCS.ZS', name: 'Access to electricity (%)', cat: 'environment' },
  // Gender
  { id: 'SG.GEN.PARL.ZS', name: 'Women in parliament (%)', cat: 'gender' },
  { id: 'SE.ENR.PRIM.FM.ZS', name: 'Gender parity, primary', cat: 'gender' },
  // Financial
  { id: 'IC.REG.DURS', name: 'Time to start a business (days)', cat: 'business' },
  { id: 'IC.BUS.NDNS.ZS', name: 'New business density', cat: 'business' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'FDI inflows (% GDP)', cat: 'business' },
  // Infrastructure
  { id: 'IT.NET.USER.ZS', name: 'Internet users (%)', cat: 'infrastructure' },
  { id: 'IT.CEL.SETS.P2', name: 'Mobile subscriptions (per 100)', cat: 'infrastructure' },
  { id: 'IT.NET.BBND.P2', name: 'Fixed broadband (per 100)', cat: 'infrastructure' },
  // Poverty
  { id: 'SI.POV.DDAY', name: 'Poverty headcount $2.15/day', cat: 'poverty' },
  { id: 'SI.POV.NAHC', name: 'Poverty headcount (national)', cat: 'poverty' },
  // Tourism
  { id: 'ST.INT.ARVL', name: 'International tourism arrivals', cat: 'tourism' },
  // Trade
  { id: 'NE.EXP.GNFS.ZS', name: 'Exports (% GDP)', cat: 'trade' },
  { id: 'NE.IMP.GNFS.ZS', name: 'Imports (% GDP)', cat: 'trade' },
  // Military
  { id: 'MS.MIL.XPND.GD.ZS', name: 'Military expenditure (% GDP)', cat: 'military' },
  // Human development proxy
  { id: 'SH.H2O.SMDW.ZS', name: 'Access to safe drinking water', cat: 'health' },
  { id: 'SH.STA.SMSS.ZS', name: 'Access to sanitation (%)', cat: 'health' },
  // Innovation
  { id: 'IP.PAT.RESD', name: 'Patent applications (residents)', cat: 'innovation' },
  { id: 'GB.XPD.RSDV.GD.ZS', name: 'R&D expenditure (% GDP)', cat: 'innovation' },
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

async function fetchAllPages(indicatorId) {
  const allItems = [];
  let page = 1;
  const perPage = 10000;

  while (true) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${indicatorId}?format=json&per_page=${perPage}&page=${page}&date=2018:2024`;
    try {
      const data = await fetchWithTimeout(url);
      const meta = data[0];
      const items = data[1];
      if (!items || items.length === 0) break;
      allItems.push(...items.filter(i => i.value !== null));
      if (page >= meta.pages) break;
      page++;
      await sleep(100);
    } catch (err) {
      break;
    }
  }
  return allItems;
}

async function main() {
  console.log(`\n=== World Bank ALL COUNTRIES Download ===`);
  console.log(`Indicators: ${INDICATORS.length}`);
  console.log(`Countries: ALL (217)`);
  console.log(`Expected: 500K-1M+ data points\n`);

  let totalDP = 0;

  for (let i = 0; i < INDICATORS.length; i++) {
    const ind = INDICATORS[i];
    const items = await fetchAllPages(ind.id);

    const dataPoints = items.map(item => ({
      indicator: ind.name,
      indicatorId: ind.id,
      category: ind.cat,
      country: item.country.value,
      countryCode: item.countryiso3code,
      year: parseInt(item.date),
      value: item.value,
      sourceUrl: `https://data.worldbank.org/indicator/${ind.id}?locations=${item.countryiso3code}`,
      source: 'World Bank',
      fetchedAt: new Date().toISOString().split('T')[0],
    }));

    totalDP += dataPoints.length;
    console.log(`[${i + 1}/${INDICATORS.length}] ${ind.name}: ${dataPoints.length} DP | Total: ${totalDP.toLocaleString()}`);

    // Save per-indicator file
    if (dataPoints.length > 0) {
      const filename = `wb-${ind.id.replace(/\./g, '-').toLowerCase()}.json`;
      const output = {
        indicator: ind.name,
        indicatorId: ind.id,
        category: ind.cat,
        source: 'World Bank',
        fetchedAt: new Date().toISOString().split('T')[0],
        dataPointCount: dataPoints.length,
        dataPoints,
      };
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(output, null, 2));
    }

    await sleep(DELAY_MS);
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Total data points: ${totalDP.toLocaleString()}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
