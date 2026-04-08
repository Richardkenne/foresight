#!/usr/bin/env node
/**
 * World Bank ALL COUNTRIES — Round 3: 80 MORE indicators
 * Focus: governance, technology, debt, trade depth, social protection
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

const INDICATORS = [
  // Governance
  { id: 'CC.EST', name: 'Control of Corruption', cat: 'governance' },
  { id: 'GE.EST', name: 'Government Effectiveness', cat: 'governance' },
  { id: 'PV.EST', name: 'Political Stability', cat: 'governance' },
  { id: 'RQ.EST', name: 'Regulatory Quality', cat: 'governance' },
  { id: 'RL.EST', name: 'Rule of Law', cat: 'governance' },
  { id: 'VA.EST', name: 'Voice and Accountability', cat: 'governance' },
  // Technology & Innovation
  { id: 'IP.JRN.ARTC.SC', name: 'Scientific journal articles', cat: 'innovation' },
  { id: 'IP.PAT.NRES', name: 'Patent applications nonresidents', cat: 'innovation' },
  { id: 'IP.TMK.TOTL', name: 'Trademark applications', cat: 'innovation' },
  { id: 'TX.VAL.TECH.CD', name: 'High-tech exports (USD)', cat: 'technology' },
  { id: 'IT.MLT.MAIN.P2', name: 'Fixed telephone subscriptions', cat: 'technology' },
  { id: 'IT.NET.SECR.P6', name: 'Secure internet servers', cat: 'technology' },
  // Trade depth
  { id: 'TX.VAL.MRCH.CD.WT', name: 'Merchandise exports (USD)', cat: 'trade' },
  { id: 'TM.VAL.MRCH.CD.WT', name: 'Merchandise imports (USD)', cat: 'trade' },
  { id: 'TX.VAL.FOOD.ZS.UN', name: 'Food exports (%)', cat: 'trade' },
  { id: 'TX.VAL.FUEL.ZS.UN', name: 'Fuel exports (%)', cat: 'trade' },
  { id: 'TX.VAL.MANF.ZS.UN', name: 'Manufactures exports (%)', cat: 'trade' },
  { id: 'TM.VAL.FOOD.ZS.UN', name: 'Food imports (%)', cat: 'trade' },
  { id: 'TM.VAL.FUEL.ZS.UN', name: 'Fuel imports (%)', cat: 'trade' },
  { id: 'LP.LPI.OVRL.XQ', name: 'Logistics performance index', cat: 'trade' },
  // Debt depth
  { id: 'DT.DOD.DECT.CD', name: 'External debt stock (USD)', cat: 'debt' },
  { id: 'DT.TDS.DECT.GN.ZS', name: 'Debt service (% GNI)', cat: 'debt' },
  { id: 'DT.DOD.DLXF.CD', name: 'Long-term debt (USD)', cat: 'debt' },
  { id: 'DT.INT.DECT.GN.ZS', name: 'Interest payments (% GNI)', cat: 'debt' },
  // Social protection
  { id: 'per_si_allsi.cov_pop_tot', name: 'Social insurance coverage', cat: 'social' },
  { id: 'per_sa_allsa.cov_pop_tot', name: 'Social assistance coverage', cat: 'social' },
  // Agriculture
  { id: 'AG.PRD.CREL.MT', name: 'Cereal production (metric tons)', cat: 'agriculture' },
  { id: 'AG.YLD.CREL.KG', name: 'Cereal yield (kg/hectare)', cat: 'agriculture' },
  { id: 'AG.PRD.FOOD.XD', name: 'Food production index', cat: 'agriculture' },
  { id: 'AG.PRD.LVSK.XD', name: 'Livestock production index', cat: 'agriculture' },
  { id: 'AG.CON.FERT.ZS', name: 'Fertilizer consumption (kg/hectare)', cat: 'agriculture' },
  // Water & sanitation
  { id: 'SH.H2O.BASW.ZS', name: 'Basic drinking water (%)', cat: 'water' },
  { id: 'SH.STA.BASS.ZS', name: 'Basic sanitation (%)', cat: 'water' },
  { id: 'SH.STA.HYGN.ZS', name: 'Handwashing facilities (%)', cat: 'water' },
  // Energy depth
  { id: 'EG.ELC.RNWX.ZS', name: 'Renewable electricity output (%)', cat: 'energy' },
  { id: 'EG.ELC.COAL.ZS', name: 'Electricity from coal (%)', cat: 'energy' },
  { id: 'EG.ELC.NGAS.ZS', name: 'Electricity from natural gas (%)', cat: 'energy' },
  { id: 'EG.ELC.NUCL.ZS', name: 'Electricity from nuclear (%)', cat: 'energy' },
  { id: 'EG.ELC.HYRO.ZS', name: 'Electricity from hydroelectric (%)', cat: 'energy' },
  { id: 'EG.ELC.PETR.ZS', name: 'Electricity from oil (%)', cat: 'energy' },
  { id: 'EG.IMP.CONS.ZS', name: 'Energy imports (% use)', cat: 'energy' },
  // Transport
  { id: 'IS.SHP.GOOD.TU', name: 'Container port traffic (TEU)', cat: 'transport' },
  { id: 'IS.VEH.NVEH.P3', name: 'Motor vehicles per 1000', cat: 'transport' },
  { id: 'IS.VEH.ROAD.K1', name: 'Vehicles per km of road', cat: 'transport' },
  // Health systems
  { id: 'SH.XPD.OOPC.CH.ZS', name: 'Out-of-pocket (% health exp)', cat: 'health' },
  { id: 'SH.XPD.GHED.GD.ZS', name: 'Domestic govt health exp (% GDP)', cat: 'health' },
  { id: 'SH.XPD.PVTD.CH.ZS', name: 'Private health exp (%)', cat: 'health' },
  // Education systems
  { id: 'SE.PRM.TENR', name: 'Primary enrollment adjusted net', cat: 'education' },
  { id: 'SE.SEC.TENR', name: 'Secondary enrollment adjusted net', cat: 'education' },
  { id: 'SE.PRM.PRSL.ZS', name: 'Persistence to last grade primary', cat: 'education' },
  { id: 'UIS.FOSEP.56.F600', name: 'STEM female graduates', cat: 'education' },
  // Population
  { id: 'SP.DYN.AMRT.MA', name: 'Mortality rate adult male', cat: 'demographics' },
  { id: 'SP.DYN.AMRT.FE', name: 'Mortality rate adult female', cat: 'demographics' },
  { id: 'SH.DTH.COMM.ZS', name: 'Cause of death communicable (%)', cat: 'health' },
  { id: 'SH.DTH.NCOM.ZS', name: 'Cause of death NCDs (%)', cat: 'health' },
  { id: 'SH.DTH.INJR.ZS', name: 'Cause of death injuries (%)', cat: 'health' },
  // Business environment
  { id: 'IC.TAX.TOTL.CP.ZS', name: 'Total tax rate (% profit)', cat: 'business' },
  { id: 'IC.TAX.PAYM', name: 'Tax payments per year', cat: 'business' },
  { id: 'IC.EXP.TMBC', name: 'Time to export (border)', cat: 'business' },
  { id: 'IC.IMP.TMBC', name: 'Time to import (border)', cat: 'business' },
  { id: 'IC.PRP.DURS', name: 'Time to register property (days)', cat: 'business' },
  { id: 'IC.ISV.DURS', name: 'Time to resolve insolvency (years)', cat: 'business' },
  // Financial markets
  { id: 'CM.MKT.TRAD.GD.ZS', name: 'Stock market turnover (% GDP)', cat: 'financial' },
  { id: 'FS.AST.PRVT.GD.ZS', name: 'Domestic credit to private sector (% GDP)', cat: 'financial' },
  { id: 'FM.AST.NFRG.CN', name: 'Net foreign assets', cat: 'financial' },
];

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
  const existing = new Set(fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json')));
  const remaining = INDICATORS.filter(ind => {
    const filename = `wb-${ind.id.replace(/\./g,'-').toLowerCase()}.json`;
    return !existing.has(filename);
  });
  console.log(`\n=== World Bank Round 3: ${remaining.length} new indicators ===\n`);
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
    console.log(`[${i+1}/${remaining.length}] ${ind.name}: ${dataPoints.length} DP | Total: ${totalDP.toLocaleString()}`);
    if (dataPoints.length > 0) {
      const filename = `wb-${ind.id.replace(/\./g,'-').toLowerCase()}.json`;
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify({
        indicator: ind.name, indicatorId: ind.id, category: ind.cat,
        source: 'World Bank', fetchedAt: '2026-04-09',
        dataPointCount: dataPoints.length, dataPoints
      }, null, 2));
    }
    await sleep(DELAY_MS);
  }
  console.log(`\nCOMPLETE: ${totalDP.toLocaleString()} new DP`);
}
main().catch(console.error);
