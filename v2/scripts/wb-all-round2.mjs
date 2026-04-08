#!/usr/bin/env node
/**
 * World Bank ALL COUNTRIES — Round 2: 100 MORE indicators × 217 countries
 * These are the NEXT most valuable indicators not covered in Round 1
 * Target: 150K+ data points
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

// 100 NEW indicators (not in Round 1's 50)
const INDICATORS = [
  // Economic depth
  { id: 'NV.SRV.TOTL.ZS', name: 'Services value added (% GDP)', cat: 'economic' },
  { id: 'NV.IND.TOTL.ZS', name: 'Industry value added (% GDP)', cat: 'economic' },
  { id: 'NV.AGR.TOTL.ZS', name: 'Agriculture value added (% GDP)', cat: 'economic' },
  { id: 'NE.CON.PRVT.ZS', name: 'Household consumption (% GDP)', cat: 'economic' },
  { id: 'NE.CON.GOVT.ZS', name: 'Government consumption (% GDP)', cat: 'economic' },
  { id: 'NY.GNS.ICTR.ZS', name: 'Gross savings (% GDP)', cat: 'economic' },
  { id: 'BN.CAB.XOKA.GD.ZS', name: 'Current account balance (% GDP)', cat: 'economic' },
  { id: 'NY.GNP.PCAP.CD', name: 'GNI per capita', cat: 'economic' },
  { id: 'NY.GNP.PCAP.PP.CD', name: 'GNI per capita PPP', cat: 'economic' },
  { id: 'BX.TRF.PWKR.DT.GD.ZS', name: 'Remittance inflows (% GDP)', cat: 'economic' },
  { id: 'PA.NUS.FCRF', name: 'Exchange rate (LCU per USD)', cat: 'economic' },
  { id: 'FM.LBL.BMNY.GD.ZS', name: 'Broad money (% GDP)', cat: 'economic' },
  { id: 'GC.TAX.TOTL.GD.ZS', name: 'Tax revenue (% GDP)', cat: 'economic' },
  { id: 'GC.REV.XGRT.GD.ZS', name: 'Government revenue (% GDP)', cat: 'economic' },
  { id: 'GC.XPN.TOTL.GD.ZS', name: 'Government expenditure (% GDP)', cat: 'economic' },
  // Labor depth
  { id: 'SL.TLF.CACT.MA.ZS', name: 'Male labor participation', cat: 'labor' },
  { id: 'SL.EMP.TOTL.SP.ZS', name: 'Employment-to-population ratio', cat: 'labor' },
  { id: 'SL.EMP.VULN.ZS', name: 'Vulnerable employment', cat: 'labor' },
  { id: 'SL.EMP.WORK.ZS', name: 'Wage workers (% total)', cat: 'labor' },
  { id: 'SL.AGR.EMPL.ZS', name: 'Employment in agriculture', cat: 'labor' },
  { id: 'SL.IND.EMPL.ZS', name: 'Employment in industry', cat: 'labor' },
  { id: 'SL.SRV.EMPL.ZS', name: 'Employment in services', cat: 'labor' },
  { id: 'SL.UEM.ADVN.ZS', name: 'Unemployment with advanced education', cat: 'labor' },
  { id: 'SL.UEM.LTRM.ZS', name: 'Long-term unemployment', cat: 'labor' },
  // Education depth
  { id: 'SE.PRM.ENRR', name: 'Primary enrollment (gross)', cat: 'education' },
  { id: 'SE.SEC.ENRR', name: 'Secondary enrollment (gross)', cat: 'education' },
  { id: 'SE.ADT.1524.LT.ZS', name: 'Youth literacy (15-24)', cat: 'education' },
  { id: 'SE.SEC.CMPT.LO.ZS', name: 'Lower secondary completion', cat: 'education' },
  { id: 'SE.XPD.PRIM.PC.ZS', name: 'Expenditure per student primary', cat: 'education' },
  { id: 'SE.ENR.SECO.FM.ZS', name: 'Gender parity secondary', cat: 'education' },
  // Health depth
  { id: 'SH.DYN.MORT', name: 'Under-5 mortality', cat: 'health' },
  { id: 'SH.STA.MMRT', name: 'Maternal mortality ratio', cat: 'health' },
  { id: 'SH.MED.BEDS.ZS', name: 'Hospital beds per 1000', cat: 'health' },
  { id: 'SH.IMM.MEAS', name: 'Measles immunization', cat: 'health' },
  { id: 'SH.HIV.INCD.ZS', name: 'HIV incidence', cat: 'health' },
  { id: 'SH.PRV.SMOK', name: 'Smoking prevalence', cat: 'health' },
  { id: 'SN.ITK.DEFC.ZS', name: 'Undernourishment prevalence', cat: 'health' },
  { id: 'SH.STA.OWGH.ZS', name: 'Overweight prevalence', cat: 'health' },
  { id: 'SH.DYN.NCOM.ZS', name: 'NCD mortality (30-70)', cat: 'health' },
  { id: 'SH.ALC.PCAP.LI', name: 'Alcohol consumption per capita', cat: 'health' },
  // Demographics depth
  { id: 'SP.POP.0014.TO.ZS', name: 'Population 0-14 (%)', cat: 'demographics' },
  { id: 'SP.POP.1564.TO.ZS', name: 'Population 15-64 (%)', cat: 'demographics' },
  { id: 'SP.DYN.CBRT.IN', name: 'Birth rate (per 1000)', cat: 'demographics' },
  { id: 'SP.DYN.CDRT.IN', name: 'Death rate (per 1000)', cat: 'demographics' },
  { id: 'SP.RUR.TOTL.ZS', name: 'Rural population (%)', cat: 'demographics' },
  { id: 'SP.ADO.TFRT', name: 'Adolescent fertility rate', cat: 'demographics' },
  { id: 'SP.POP.DPND', name: 'Age dependency ratio', cat: 'demographics' },
  { id: 'SP.POP.DPND.OL', name: 'Old-age dependency ratio', cat: 'demographics' },
  // Environment depth
  { id: 'EN.ATM.CO2E.KT', name: 'CO2 emissions total (kt)', cat: 'environment' },
  { id: 'EN.ATM.METH.KT.CE', name: 'Methane emissions (kt CO2eq)', cat: 'environment' },
  { id: 'AG.LND.ARBL.ZS', name: 'Arable land (%)', cat: 'environment' },
  { id: 'AG.LND.TOTL.K2', name: 'Land area (sq km)', cat: 'environment' },
  { id: 'ER.H2O.FWTL.ZS', name: 'Freshwater withdrawal', cat: 'environment' },
  { id: 'EN.ATM.PM25.MC.M3', name: 'PM2.5 air pollution', cat: 'environment' },
  { id: 'EG.USE.PCAP.KG.OE', name: 'Energy use per capita', cat: 'environment' },
  { id: 'EG.USE.ELEC.KH.PC', name: 'Electric power per capita', cat: 'environment' },
  // Financial depth
  { id: 'FB.CBK.BRCH.P5', name: 'Bank branches per 100K', cat: 'financial' },
  { id: 'FB.ATM.TOTL.P5', name: 'ATMs per 100K', cat: 'financial' },
  { id: 'CM.MKT.LCAP.GD.ZS', name: 'Stock market cap (% GDP)', cat: 'financial' },
  { id: 'FX.OWN.TOTL.ZS', name: 'Bank account ownership (%)', cat: 'financial' },
  { id: 'IC.LGL.CRED.XQ', name: 'Legal rights index (0-12)', cat: 'financial' },
  { id: 'IC.CRD.INFO.XQ', name: 'Credit info depth (0-8)', cat: 'financial' },
  { id: 'IC.REG.COST.PC.ZS', name: 'Cost to start business (% GNI)', cat: 'financial' },
  // Trade & infrastructure
  { id: 'TG.VAL.TOTL.GD.ZS', name: 'Merchandise trade (% GDP)', cat: 'trade' },
  { id: 'BG.GSR.NFSV.GD.ZS', name: 'Trade in services (% GDP)', cat: 'trade' },
  { id: 'ST.INT.RCPT.CD', name: 'Tourism receipts (USD)', cat: 'tourism' },
  { id: 'IS.AIR.PSGR', name: 'Air transport passengers', cat: 'infrastructure' },
  { id: 'IS.RRS.GOOD.MT.K6', name: 'Railways goods (million ton-km)', cat: 'infrastructure' },
  { id: 'EP.PMP.SGAS.CD', name: 'Gas price (USD/liter)', cat: 'infrastructure' },
  // Gender depth
  { id: 'SL.TLF.CACT.FM.ZS', name: 'Female-to-male labor ratio', cat: 'gender' },
  { id: 'SE.ENR.TERT.FM.ZS', name: 'Gender parity tertiary', cat: 'gender' },
  // Poverty depth
  { id: 'SI.DST.FRST.10', name: 'Income share bottom 10%', cat: 'poverty' },
  { id: 'SI.DST.10TH.10', name: 'Income share top 10%', cat: 'poverty' },
  { id: 'SI.SPR.PCAP.ZG', name: 'Shared prosperity', cat: 'poverty' },
  // Innovation & tech
  { id: 'IC.FRM.CORR.ZS', name: 'Firms paying bribes (%)', cat: 'governance' },
  { id: 'IC.FRM.CMPU.ZS', name: 'Firms using email (%)', cat: 'technology' },
  { id: 'TX.VAL.TECH.MF.ZS', name: 'High-tech exports (%)', cat: 'technology' },
  { id: 'BM.KLT.DINV.WD.GD.ZS', name: 'FDI outflows (% GDP)', cat: 'investment' },
  // Debt & finance
  { id: 'DT.DOD.DECT.GN.ZS', name: 'External debt (% GNI)', cat: 'debt' },
  { id: 'FR.INR.LEND', name: 'Lending interest rate', cat: 'financial' },
  { id: 'FR.INR.DPST', name: 'Deposit interest rate', cat: 'financial' },
  { id: 'FR.INR.RINR', name: 'Real interest rate', cat: 'financial' },
  // Social
  { id: 'SP.REG.BRTH.ZS', name: 'Birth registration (%)', cat: 'governance' },
  { id: 'per_lm_alllm.cov_pop_tot', name: 'Social protection coverage', cat: 'social' },
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
  // Skip already done
  const existing = new Set(fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.json')));
  const remaining = INDICATORS.filter(ind => {
    const filename = `wb-${ind.id.replace(/\./g,'-').toLowerCase()}.json`;
    return !existing.has(filename);
  });

  console.log(`\n=== World Bank Round 2: ${remaining.length} new indicators ===\n`);
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
