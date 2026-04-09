#!/usr/bin/env node
/**
 * World Bank Mega Download — TOP 200 indicators
 * Concurrency: 3 | Delay: 300ms | Timeout: 30s | Retry: 1x after 2s
 * Checkpoint every 25 indicators
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = '/Users/richardbotsiokennedy/Forsight/v2/data/cultural/worldbank-mega';
const CONCURRENCY = 3;
const DELAY_MS = 300;
const TIMEOUT_MS = 30_000;
const RETRY_DELAY_MS = 2_000;
const CHECKPOINT_EVERY = 25;
const DATE_RANGE = '2022:2024';

// Countries
const COUNTRIES = ['IDN','AUS','ITA','SGP','MYS','USA','DEU','FRA','GBR','ESP','NLD','CHE','SWE','POL','BEL','AUT','NOR','DNK','IRL','PRT'];

// All 200 indicators with human-readable names and units
const INDICATORS = [
  // Economic (40)
  { id: 'NY.GDP.PCAP.CD', name: 'GDP per capita', unit: 'USD' },
  { id: 'NY.GDP.MKTP.KD.ZG', name: 'GDP growth rate', unit: '%' },
  { id: 'FP.CPI.TOTL.ZG', name: 'inflation (CPI)', unit: '%' },
  { id: 'NE.EXP.GNFS.ZS', name: 'exports of goods and services', unit: '% of GDP' },
  { id: 'NE.IMP.GNFS.ZS', name: 'imports of goods and services', unit: '% of GDP' },
  { id: 'BN.CAB.XOKA.GD.ZS', name: 'current account balance', unit: '% of GDP' },
  { id: 'FM.LBL.BMNY.GD.ZS', name: 'broad money (M3)', unit: '% of GDP' },
  { id: 'NY.GNS.ICTR.ZS', name: 'gross savings rate', unit: '% of GDP' },
  { id: 'SI.POV.GINI', name: 'Gini index (inequality)', unit: 'index' },
  { id: 'SI.DST.FRST.10', name: 'income share of bottom 10%', unit: '%' },
  { id: 'SI.DST.10TH.10', name: 'income share of top 10%', unit: '%' },
  { id: 'NY.GDP.PCAP.PP.CD', name: 'GDP per capita (PPP)', unit: 'int. USD' },
  { id: 'NY.GNP.PCAP.CD', name: 'GNI per capita', unit: 'USD' },
  { id: 'NE.CON.PRVT.ZS', name: 'household consumption', unit: '% of GDP' },
  { id: 'NE.CON.GOVT.ZS', name: 'government consumption', unit: '% of GDP' },
  { id: 'NV.SRV.TOTL.ZS', name: 'services sector', unit: '% of GDP' },
  { id: 'NV.IND.TOTL.ZS', name: 'industry sector', unit: '% of GDP' },
  { id: 'NV.AGR.TOTL.ZS', name: 'agriculture sector', unit: '% of GDP' },
  { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'foreign direct investment inflows', unit: '% of GDP' },
  { id: 'BX.TRF.PWKR.DT.GD.ZS', name: 'remittance inflows', unit: '% of GDP' },
  { id: 'GC.TAX.TOTL.GD.ZS', name: 'tax revenue', unit: '% of GDP' },
  { id: 'GC.DOD.TOTL.GD.ZS', name: 'government debt', unit: '% of GDP' },
  { id: 'GC.XPN.TOTL.GD.ZS', name: 'government expenditure', unit: '% of GDP' },
  { id: 'GC.REV.XGRT.GD.ZS', name: 'government revenue', unit: '% of GDP' },
  { id: 'FB.CBK.BRCH.P5', name: 'bank branches per 100K adults', unit: 'per 100K' },
  { id: 'FB.ATM.TOTL.P5', name: 'ATMs per 100K adults', unit: 'per 100K' },
  { id: 'PA.NUS.FCRF', name: 'official exchange rate (LCU per USD)', unit: 'LCU/USD' },
  { id: 'CM.MKT.LCAP.GD.ZS', name: 'stock market capitalization', unit: '% of GDP' },
  { id: 'IC.FRM.CORR.ZS', name: 'firms paying bribes', unit: '% of firms' },
  { id: 'IC.FRM.FTML.ZS', name: 'firms facing competition', unit: '% of firms' },
  { id: 'IC.FRM.BRIB.ZS', name: 'bribery incidence among firms', unit: '% of firms' },
  { id: 'IC.FRM.CMPU.ZS', name: 'firms using email for business', unit: '% of firms' },
  { id: 'SE.XPD.TOTL.GD.ZS', name: 'education expenditure', unit: '% of GDP' },
  { id: 'SH.XPD.CHEX.GD.ZS', name: 'health expenditure', unit: '% of GDP' },
  { id: 'MS.MIL.XPND.GD.ZS', name: 'military expenditure', unit: '% of GDP' },
  { id: 'EG.USE.ELEC.KH.PC', name: 'electricity consumption per capita', unit: 'kWh' },
  { id: 'EG.USE.PCAP.KG.OE', name: 'energy use per capita', unit: 'kg of oil eq.' },
  { id: 'EP.PMP.SGAS.CD', name: 'pump price for gasoline', unit: 'USD/liter' },
  { id: 'IT.CEL.SETS.P2', name: 'mobile subscriptions', unit: 'per 100 people' },
  { id: 'IT.NET.USER.ZS', name: 'internet users', unit: '% of population' },

  // Labor (30)
  { id: 'SL.UEM.TOTL.ZS', name: 'unemployment rate', unit: '% of labor force' },
  { id: 'SL.UEM.1524.ZS', name: 'youth unemployment rate', unit: '% ages 15-24' },
  { id: 'SL.UEM.ADVN.ZS', name: 'unemployment with advanced education', unit: '%' },
  { id: 'SL.TLF.CACT.ZS', name: 'labor force participation rate', unit: '%' },
  { id: 'SL.TLF.CACT.FE.ZS', name: 'female labor force participation', unit: '%' },
  { id: 'SL.TLF.CACT.MA.ZS', name: 'male labor force participation', unit: '%' },
  { id: 'SL.EMP.TOTL.SP.ZS', name: 'employment-to-population ratio', unit: '%' },
  { id: 'SL.EMP.SELF.ZS', name: 'self-employment rate', unit: '% of total employment' },
  { id: 'SL.EMP.VULN.ZS', name: 'vulnerable employment rate', unit: '% of total employment' },
  { id: 'SL.EMP.WORK.ZS', name: 'wage and salaried workers', unit: '% of total employment' },
  { id: 'SL.AGR.EMPL.ZS', name: 'employment in agriculture', unit: '%' },
  { id: 'SL.IND.EMPL.ZS', name: 'employment in industry', unit: '%' },
  { id: 'SL.SRV.EMPL.ZS', name: 'employment in services', unit: '%' },
  { id: 'SL.TLF.PART.ZS', name: 'part-time employment rate', unit: '%' },
  { id: 'SL.TLF.PART.FE.ZS', name: 'female part-time employment', unit: '%' },
  { id: 'SL.ISV.IFRM.ZS', name: 'informal employment', unit: '% of total employment' },
  { id: 'SL.UEM.LTRM.ZS', name: 'long-term unemployment', unit: '% of labor force' },
  { id: 'SL.UEM.NEET.ZS', name: 'youth NEET rate', unit: '%' },
  { id: 'SL.GDP.PCAP.EM.KD', name: 'GDP per person employed', unit: 'constant 2017 USD' },
  { id: 'SL.EMP.MPYR.ZS', name: 'employers', unit: '% of total employment' },
  { id: 'SL.EMP.SMGT.FE.ZS', name: 'female share of senior management', unit: '%' },
  { id: 'SL.TLF.0714.ZS', name: 'child labor rate', unit: '%' },
  { id: 'SL.UEM.BASC.ZS', name: 'unemployment with basic education', unit: '%' },
  { id: 'SL.UEM.INTM.ZS', name: 'unemployment with intermediate education', unit: '%' },
  { id: 'SL.EMP.1524.SP.ZS', name: 'youth employment-to-population ratio', unit: '%' },
  { id: 'SH.H2O.SMDW.ZS', name: 'safely managed drinking water', unit: '% of population' },
  { id: 'SH.STA.BASS.ZS', name: 'basic sanitation services', unit: '% of population' },
  { id: 'SL.TLF.TOTL.FE.ZS', name: 'female share of labor force', unit: '%' },
  { id: 'SL.EMP.TOTL.SP.FE.ZS', name: 'female employment-to-population ratio', unit: '%' },
  { id: 'SL.FAM.WORK.ZS', name: 'contributing family workers', unit: '% of total employment' },

  // Demographics (30)
  { id: 'SP.POP.TOTL', name: 'total population', unit: 'people' },
  { id: 'SP.POP.GROW', name: 'population growth rate', unit: '%' },
  { id: 'SP.URB.TOTL.IN.ZS', name: 'urban population share', unit: '%' },
  { id: 'SP.RUR.TOTL.ZS', name: 'rural population share', unit: '%' },
  { id: 'SP.POP.65UP.TO.ZS', name: 'population aged 65+', unit: '% of total' },
  { id: 'SP.POP.0014.TO.ZS', name: 'population aged 0-14', unit: '% of total' },
  { id: 'SP.POP.1564.TO.ZS', name: 'working-age population (15-64)', unit: '% of total' },
  { id: 'SP.DYN.LE00.IN', name: 'life expectancy at birth', unit: 'years' },
  { id: 'SP.DYN.LE00.FE.IN', name: 'female life expectancy at birth', unit: 'years' },
  { id: 'SP.DYN.LE00.MA.IN', name: 'male life expectancy at birth', unit: 'years' },
  { id: 'SP.DYN.TFRT.IN', name: 'fertility rate', unit: 'births per woman' },
  { id: 'SP.DYN.CBRT.IN', name: 'birth rate', unit: 'per 1,000 people' },
  { id: 'SP.DYN.CDRT.IN', name: 'death rate', unit: 'per 1,000 people' },
  { id: 'SP.DYN.IMRT.IN', name: 'infant mortality rate', unit: 'per 1,000 live births' },
  { id: 'SP.ADO.TFRT', name: 'adolescent fertility rate', unit: 'per 1,000 girls 15-19' },
  { id: 'SM.POP.NETM', name: 'net migration', unit: 'people' },
  { id: 'SM.POP.REFG', name: 'refugee population', unit: 'people' },
  { id: 'SM.POP.TOTL.ZS', name: 'international migrant stock', unit: '% of population' },
  { id: 'SP.POP.DPND', name: 'age dependency ratio', unit: '% of working-age pop' },
  { id: 'SP.POP.DPND.OL', name: 'old-age dependency ratio', unit: '% of working-age pop' },
  { id: 'SP.POP.DPND.YG', name: 'young-age dependency ratio', unit: '% of working-age pop' },
  { id: 'SH.DYN.MORT', name: 'under-5 mortality rate', unit: 'per 1,000 live births' },
  { id: 'SH.STA.MMRT', name: 'maternal mortality ratio', unit: 'per 100,000 live births' },
  { id: 'SH.DTH.COMM.ZS', name: 'deaths from communicable diseases', unit: '% of total deaths' },
  { id: 'SH.DTH.NCOM.ZS', name: 'deaths from non-communicable diseases', unit: '% of total deaths' },
  { id: 'SH.DYN.NCOM.ZS', name: 'NCD mortality rate', unit: 'per 100K between 30-70' },
  { id: 'SP.DYN.SMAM.MA', name: 'mean age at first marriage (male)', unit: 'years' },
  { id: 'SP.DYN.SMAM.FE', name: 'mean age at first marriage (female)', unit: 'years' },
  { id: 'SP.HOU.FEMA.ZS', name: 'female-headed households', unit: '%' },
  { id: 'EN.POP.DNST', name: 'population density', unit: 'people per sq. km' },

  // Education (25)
  { id: 'SE.PRM.ENRR', name: 'primary school enrollment rate', unit: '% gross' },
  { id: 'SE.SEC.ENRR', name: 'secondary school enrollment rate', unit: '% gross' },
  { id: 'SE.TER.ENRR', name: 'tertiary education enrollment rate', unit: '% gross' },
  { id: 'SE.PRM.CMPT.ZS', name: 'primary school completion rate', unit: '%' },
  { id: 'SE.SEC.CMPT.LO.ZS', name: 'lower secondary school completion rate', unit: '%' },
  { id: 'SE.ADT.LITR.ZS', name: 'adult literacy rate', unit: '%' },
  { id: 'SE.ADT.LITR.FE.ZS', name: 'female adult literacy rate', unit: '%' },
  { id: 'SE.XPD.PRIM.ZS', name: 'primary education expenditure share', unit: '% of gov. education spending' },
  { id: 'SE.XPD.SECO.ZS', name: 'secondary education expenditure share', unit: '% of gov. education spending' },
  { id: 'SE.XPD.TERT.ZS', name: 'tertiary education expenditure share', unit: '% of gov. education spending' },
  { id: 'SE.PRM.TCHR', name: 'primary school teachers', unit: 'count' },
  { id: 'SE.PRE.ENRR', name: 'pre-primary enrollment rate', unit: '% gross' },
  { id: 'SE.ENR.PRSC.FM.ZS', name: 'gender parity in primary/secondary/tertiary', unit: 'ratio female/male' },
  { id: 'SE.ENR.SECO.FM.ZS', name: 'gender parity in secondary education', unit: 'ratio' },
  { id: 'SE.ENR.TERT.FM.ZS', name: 'gender parity in tertiary education', unit: 'ratio' },
  { id: 'SE.PRM.UNER', name: 'out-of-school children (primary)', unit: 'count' },
  { id: 'SE.SEC.UNER', name: 'out-of-school youth (secondary)', unit: 'count' },
  { id: 'SE.PRM.GINT.ZS', name: 'overage students in primary', unit: '%' },
  { id: 'SE.PRM.REPT.ZS', name: 'primary school repeater rate', unit: '%' },
  { id: 'SE.SEC.PROG.ZS', name: 'secondary education progression rate', unit: '%' },
  { id: 'SE.TER.CUAT.BA.ZS', name: 'population with bachelor\'s degree+', unit: '% ages 25+' },
  { id: 'SE.TER.CUAT.DO.ZS', name: 'population with doctoral degree', unit: '% ages 25+' },
  { id: 'UIS.FOSEP.56.F600', name: 'STEM graduates share', unit: '%' },
  { id: 'UIS.E.1.G', name: 'government education expenditure', unit: 'USD' },
  { id: 'SE.XPD.TOTL.GD.ZS', name: 'total education expenditure', unit: '% of GDP' },

  // Health (25)
  { id: 'SH.XPD.CHEX.PC.CD', name: 'current health expenditure per capita', unit: 'USD' },
  { id: 'SH.XPD.OOPC.CH.ZS', name: 'out-of-pocket health spending', unit: '% of current health exp' },
  { id: 'SH.MED.PHYS.ZS', name: 'physicians density', unit: 'per 1,000 people' },
  { id: 'SH.MED.BEDS.ZS', name: 'hospital beds', unit: 'per 1,000 people' },
  { id: 'SH.IMM.MEAS', name: 'measles immunization coverage', unit: '% of children ages 12-23 months' },
  { id: 'SH.STA.SUIC.P5', name: 'suicide mortality rate', unit: 'per 100K population' },
  { id: 'SH.PRV.SMOK.MA', name: 'male smoking prevalence', unit: '% of male adults' },
  { id: 'SH.PRV.SMOK.FE', name: 'female smoking prevalence', unit: '% of female adults' },
  { id: 'SH.STA.OWGH.ZS', name: 'overweight prevalence', unit: '% of adults' },
  { id: 'SH.STA.OBSE.ZS', name: 'obesity prevalence', unit: '% of adults' },
  { id: 'SH.HIV.INCD', name: 'HIV incidence rate', unit: 'per 1,000 uninfected people' },
  { id: 'SH.TBS.INCD', name: 'tuberculosis incidence rate', unit: 'per 100K people' },
  { id: 'SH.DTH.INJR.ZS', name: 'deaths from injuries', unit: '% of total deaths' },
  { id: 'SH.ALC.PCAP.LI', name: 'alcohol consumption per capita', unit: 'liters of pure alcohol' },
  { id: 'SH.STA.BRTC.ZS', name: 'births attended by skilled staff', unit: '%' },
  { id: 'SH.STA.ANVC.ZS', name: 'antenatal care coverage', unit: '%' },
  { id: 'SN.ITK.DEFC.ZS', name: 'prevalence of undernourishment', unit: '% of population' },
  { id: 'SN.ITK.VITA.ZS', name: 'vitamin A supplementation coverage', unit: '%' },
  { id: 'SH.H2O.BASW.ZS', name: 'basic drinking water services', unit: '% of population' },
  { id: 'SH.STA.SMSS.ZS', name: 'safely managed sanitation', unit: '% of population' },
  { id: 'SH.DYN.AIDS.ZS', name: 'HIV prevalence', unit: '% of population ages 15-49' },
  { id: 'SH.XPD.GHED.GD.ZS', name: 'government health expenditure', unit: '% of GDP' },
  { id: 'SH.XPD.PVTD.CH.ZS', name: 'private health expenditure share', unit: '% of current health exp' },
  { id: 'SH.MED.NUMW.P3', name: 'nursing and midwifery personnel', unit: 'per 1,000 people' },
  { id: 'SH.UHC.SRVS.CV.XD', name: 'UHC service coverage index', unit: 'index 0-100' },

  // Technology & Infrastructure (25)
  { id: 'IT.NET.BBND.P2', name: 'fixed broadband subscriptions', unit: 'per 100 people' },
  { id: 'IT.NET.SECR.P6', name: 'secure internet servers', unit: 'per 1M people' },
  { id: 'IT.MLT.MAIN.P2', name: 'fixed telephone subscriptions', unit: 'per 100 people' },
  { id: 'IP.PAT.RESD', name: 'resident patent applications', unit: 'count' },
  { id: 'IP.PAT.NRES', name: 'nonresident patent applications', unit: 'count' },
  { id: 'IP.TMK.RESD', name: 'resident trademark applications', unit: 'count' },
  { id: 'GB.XPD.RSDV.GD.ZS', name: 'R&D expenditure', unit: '% of GDP' },
  { id: 'TX.VAL.TECH.MF.ZS', name: 'high-technology exports', unit: '% of manufactured exports' },
  { id: 'TX.VAL.ICTG.ZS.UN', name: 'ICT goods exports', unit: '% of total goods exports' },
  { id: 'BX.GSR.CCIS.ZS', name: 'ICT service exports', unit: '% of service exports' },
  { id: 'IS.AIR.PSGR', name: 'air transport passengers carried', unit: 'count' },
  { id: 'IS.SHP.GOOD.TU', name: 'container port traffic', unit: 'TEU' },
  { id: 'IS.RRS.TOTL.KM', name: 'railway lines total', unit: 'km' },
  { id: 'IS.ROD.TOTL.KM', name: 'road network total', unit: 'km' },
  { id: 'IS.ROD.PSGR.K6', name: 'road passenger transport', unit: 'billion passenger-km' },
  { id: 'EG.ELC.ACCS.ZS', name: 'access to electricity', unit: '% of population' },
  { id: 'EG.FEC.RNEW.ZS', name: 'renewable energy consumption share', unit: '%' },
  { id: 'EN.ATM.GHGT.KT.CE', name: 'total greenhouse gas emissions', unit: 'kt of CO2 equivalent' },
  { id: 'EN.ATM.PM25.MC.M3', name: 'PM2.5 air pollution', unit: 'micrograms per cubic meter' },
  { id: 'AG.LND.FRST.ZS', name: 'forest area', unit: '% of land area' },
  { id: 'ER.PTD.TOTL.ZS', name: 'terrestrial and marine protected areas', unit: '% of total territorial area' },
  { id: 'AG.LND.ARBL.ZS', name: 'arable land', unit: '% of land area' },
  { id: 'EN.CO2.ETOT.ZS', name: 'CO2 emissions from energy', unit: '% of total' },
  { id: 'EG.ELC.RNWX.KH', name: 'renewable electricity output', unit: 'kWh' },
  { id: 'SH.H2O.SMDW.ZS', name: 'safely managed drinking water (infra)', unit: '% of population' },

  // Business Environment (25)
  { id: 'IC.BUS.NDNS.ZS', name: 'new businesses registered density', unit: 'per 1,000 adults 15-64' },
  { id: 'IC.BUS.NREG', name: 'new business registrations count', unit: 'count' },
  { id: 'IC.CRD.INFO.XQ', name: 'credit information depth index', unit: '0-8 scale' },
  { id: 'IC.LGL.CRED.XQ', name: 'strength of legal rights index', unit: '0-12 scale' },
  { id: 'IC.FRM.DURS', name: 'average duration of power outages', unit: 'hours' },
  { id: 'IC.FRM.TRNG.ZS', name: 'firms offering formal training', unit: '%' },
  { id: 'IC.FRM.FEMM.ZS', name: 'firms with female top managers', unit: '%' },
  { id: 'IC.TAX.DURS', name: 'time to pay taxes', unit: 'hours per year' },
  { id: 'IC.TAX.PAYM', name: 'tax payments per year', unit: 'number per year' },
  { id: 'IC.GOV.DURS.ZS', name: 'senior management time with government regulations', unit: '%' },
  { id: 'IC.EXP.DURS', name: 'time to export (documentary compliance)', unit: 'hours' },
  { id: 'IC.IMP.DURS', name: 'time to import (documentary compliance)', unit: 'hours' },
  { id: 'IC.REG.DURS', name: 'time to start a business', unit: 'days' },
  { id: 'IC.REG.COST.PC.ZS', name: 'cost to start a business', unit: '% of GNI per capita' },
  { id: 'IC.TAX.TOTL.CP.ZS', name: 'total tax rate for business', unit: '% of commercial profits' },
  { id: 'IC.ISV.DURS', name: 'time to resolve insolvency', unit: 'years' },
  { id: 'IC.ELC.OUTG', name: 'power outages experienced by firms', unit: 'number per year' },
  { id: 'IC.WRH.DURS', name: 'time to obtain construction permits', unit: 'days' },
  { id: 'IC.PRP.DURS', name: 'time to register property', unit: 'days' },
  { id: 'IC.PRP.COST.ZS', name: 'cost to register property', unit: '% of property value' },
  { id: 'VC.IHR.PSRC.P5', name: 'intentional homicides', unit: 'per 100K people' },
  { id: 'CC.EST', name: 'control of corruption', unit: 'WGI estimate' },
  { id: 'GE.EST', name: 'government effectiveness', unit: 'WGI estimate' },
  { id: 'RL.EST', name: 'rule of law', unit: 'WGI estimate' },
  { id: 'RQ.EST', name: 'regulatory quality', unit: 'WGI estimate' },
];

// Country name map
const COUNTRY_NAMES = {
  IDN: 'Indonesia', AUS: 'Australia', ITA: 'Italy', SGP: 'Singapore',
  MYS: 'Malaysia', USA: 'United States', DEU: 'Germany', FRA: 'France',
  GBR: 'United Kingdom', ESP: 'Spain', NLD: 'Netherlands', CHE: 'Switzerland',
  SWE: 'Sweden', POL: 'Poland', BEL: 'Belgium', AUT: 'Austria',
  NOR: 'Norway', DNK: 'Denmark', IRL: 'Ireland', PRT: 'Portugal'
};

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Fetch with timeout + retry
async function fetchWithRetry(url, attemptNum = 1) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timer);
    if (attemptNum === 1) {
      await sleep(RETRY_DELAY_MS);
      return fetchWithRetry(url, 2);
    }
    throw err;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Process one indicator across all countries
async function fetchIndicator(indicator) {
  const countryStr = COUNTRIES.join(';');
  const url = `https://api.worldbank.org/v2/country/${countryStr}/indicator/${indicator.id}?format=json&date=${DATE_RANGE}&per_page=1000`;

  try {
    const data = await fetchWithRetry(url);
    if (!Array.isArray(data) || data.length < 2 || !data[1]) return [];

    const records = [];
    for (const item of data[1]) {
      if (item.value === null || item.value === undefined || item.value === '') continue;
      const countryCode = item.countryiso3code || item.country?.id;
      const countryName = COUNTRY_NAMES[countryCode] || item.country?.value || countryCode;
      const year = parseInt(item.date, 10);
      const value = typeof item.value === 'number' ? item.value : parseFloat(item.value);
      if (isNaN(value)) continue;

      records.push({
        indicator_id: indicator.id,
        indicator_name: indicator.name,
        country_code: countryCode,
        country: countryName,
        year,
        value,
        unit: indicator.unit,
        context: `${countryName}'s ${indicator.name} was ${value} ${indicator.unit} in ${year}`
      });
    }
    return records;
  } catch (err) {
    console.error(`  [FAIL] ${indicator.id}: ${err.message}`);
    return [];
  }
}

// Concurrency limiter
async function runWithConcurrency(tasks, concurrency) {
  const results = new Array(tasks.length);
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const i = index++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log(`\nWorld Bank Mega Download`);
  console.log(`Indicators: ${INDICATORS.length} | Countries: ${COUNTRIES.length} | Range: ${DATE_RANGE}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  const allData = [];
  let checkpointNum = 1;
  let lastCheckpointIdx = 0;

  // Build tasks in order
  const tasks = INDICATORS.map((indicator, idx) => async () => {
    await sleep(DELAY_MS); // rate limit
    const records = await fetchIndicator(indicator);
    return { indicator, idx, records };
  });

  // Process with concurrency
  let completedCount = 0;
  const pendingResults = [];

  // Sequential batches with concurrency
  for (let i = 0; i < INDICATORS.length; i += CONCURRENCY) {
    const batch = INDICATORS.slice(i, i + CONCURRENCY);
    const batchPromises = batch.map(async (indicator, batchIdx) => {
      if (batchIdx > 0) await sleep(DELAY_MS * batchIdx);
      const records = await fetchIndicator(indicator);
      completedCount++;
      const total = allData.length + records.length;
      if (completedCount % 10 === 0 || completedCount === INDICATORS.length) {
        console.log(`Progress: ${completedCount}/${INDICATORS.length} indicators | ${allData.length + records.length} data points so far`);
      }
      return { indicator, records };
    });

    const batchResults = await Promise.all(batchPromises);
    for (const { indicator, records } of batchResults) {
      allData.push(...records);
      if (records.length > 0) {
        process.stdout.write(`  [OK] ${indicator.id} → ${records.length} records\n`);
      } else {
        process.stdout.write(`  [EMPTY] ${indicator.id}\n`);
      }
    }

    // Checkpoint every CHECKPOINT_EVERY indicators
    const processedSoFar = i + CONCURRENCY;
    const lastCheckpoint = Math.floor(lastCheckpointIdx / CHECKPOINT_EVERY);
    const currentCheckpoint = Math.floor(Math.min(processedSoFar, INDICATORS.length) / CHECKPOINT_EVERY);

    if (currentCheckpoint > lastCheckpoint) {
      const slice = allData.slice(lastCheckpointIdx);
      if (slice.length > 0) {
        const fileName = `worldbank-mega-${String(checkpointNum).padStart(3, '0')}.json`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        fs.writeFileSync(filePath, JSON.stringify(slice, null, 2));
        console.log(`\n[CHECKPOINT ${checkpointNum}] Saved ${slice.length} records → ${fileName}`);
        lastCheckpointIdx = allData.length;
        checkpointNum++;
      }
    }
  }

  // Save remaining data
  const remaining = allData.slice(lastCheckpointIdx);
  if (remaining.length > 0) {
    const fileName = `worldbank-mega-${String(checkpointNum).padStart(3, '0')}.json`;
    const filePath = path.join(OUTPUT_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(remaining, null, 2));
    console.log(`\n[CHECKPOINT ${checkpointNum}] Saved ${remaining.length} records → ${fileName}`);
  }

  // Save combined file
  const combinedPath = path.join(OUTPUT_DIR, 'worldbank-mega-combined.json');
  fs.writeFileSync(combinedPath, JSON.stringify(allData, null, 2));

  // Save metadata
  const meta = {
    downloaded_at: new Date().toISOString(),
    total_data_points: allData.length,
    indicators_fetched: INDICATORS.length,
    countries: COUNTRIES,
    date_range: DATE_RANGE,
    breakdown_by_indicator: INDICATORS.map(ind => ({
      id: ind.id,
      name: ind.name,
      count: allData.filter(d => d.indicator_id === ind.id).length
    })).filter(x => x.count > 0),
    breakdown_by_country: COUNTRIES.map(code => ({
      code,
      country: COUNTRY_NAMES[code],
      count: allData.filter(d => d.country_code === code).length
    }))
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`DOWNLOAD COMPLETE`);
  console.log(`Total data points: ${allData.length}`);
  console.log(`Indicators with data: ${meta.breakdown_by_indicator.length}/${INDICATORS.length}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`${'='.repeat(60)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
