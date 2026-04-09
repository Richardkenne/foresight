#!/usr/bin/env node
/**
 * worldbank-bulk.mjs
 * Bulk download World Bank cultural & social indicators for target countries.
 * Writes to data/cultural/worldbank-bulk-<country>.json
 * Log: /tmp/worldbank-bulk.log
 */

import { writeFileSync, appendFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'cultural');
const LOG_FILE = '/tmp/worldbank-bulk.log';

mkdirSync(DATA_DIR, { recursive: true });

const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  appendFileSync(LOG_FILE, line);
};

// 20 target countries
const COUNTRIES = ['IDN','AUS','ITA','SGP','MYS','USA','DEU','FRA','GBR','ESP',
                   'NLD','CHE','SWE','POL','BEL','AUT','NOR','DNK','IRL','PRT'];

// World Bank indicators: code → human label
const INDICATORS = {
  // Demographics & social
  'SP.POP.TOTL':       'population_total',
  'SP.POP.GROW':       'population_growth_pct',
  'SP.URB.TOTL.IN.ZS': 'urban_population_pct',
  'SP.DYN.TFRT.IN':    'fertility_rate',
  'SP.DYN.LE00.IN':    'life_expectancy',
  'SP.POP.65UP.TO.ZS': 'population_65plus_pct',
  // Education
  'SE.ADT.LITR.ZS':    'adult_literacy_rate_pct',
  'SE.TER.ENRR':       'tertiary_enrollment_pct',
  'SE.XPD.TOTL.GD.ZS': 'govt_education_spend_pct_gdp',
  'SE.PRE.ENRR':       'preprimary_enrollment_pct',
  // Labour & income
  'SL.UEM.TOTL.ZS':    'unemployment_rate_pct',
  'SL.TLF.CACT.ZS':    'labor_force_participation_pct',
  'SL.EMP.VULN.ZS':    'vulnerable_employment_pct',
  'NY.GDP.PCAP.PP.CD': 'gdp_per_capita_ppp',
  'SI.POV.GINI':       'gini_index',
  // Health & wellbeing
  'SH.XPD.CHEX.GD.ZS': 'health_expenditure_pct_gdp',
  'SH.H2O.SMDW.ZS':    'safe_water_access_pct',
  'SH.STA.SMSS.ZS':    'sanitation_access_pct',
  'SH.IMM.MEAS':        'measles_immunization_pct',
  // Digital & infrastructure
  'IT.NET.USER.ZS':    'internet_users_pct',
  'IT.CEL.SETS.P2':    'mobile_subscriptions_per100',
  'IT.MLT.MAIN.P2':    'fixed_broadband_per100',
  // Gender
  'SG.GEN.PARL.ZS':    'women_in_parliament_pct',
  'SL.TLF.CACT.FE.ZS': 'female_labor_participation_pct',
  // Governance
  'CC.EST':  'control_of_corruption',
  'RL.EST':  'rule_of_law',
  'GE.EST':  'govt_effectiveness',
  'VA.EST':  'voice_accountability',
  // Environment
  'EN.ATM.CO2E.PC':    'co2_emissions_per_capita',
  'AG.LND.FRST.ZS':    'forest_area_pct',
};

async function fetchIndicator(country, indicator) {
  const url = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json&mrv=3&per_page=3`;
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!Array.isArray(data) || data.length < 2) return null;
    const rows = data[1];
    if (!rows) return null;
    const latest = rows.find(r => r.value !== null);
    if (!latest) return null;
    return { value: latest.value, year: parseInt(latest.date), source: 'World Bank API' };
  } catch {
    return null;
  }
}

async function processCountry(iso3) {
  log(`START ${iso3}`);
  const results = {};
  let count = 0;
  for (const [code, label] of Object.entries(INDICATORS)) {
    const point = await fetchIndicator(iso3.toLowerCase(), code);
    if (point) {
      results[label] = point;
      count++;
    }
    await new Promise(r => setTimeout(r, 150)); // rate limit
  }
  const out = {
    _meta: { country: iso3, source: 'worldbank-bulk.mjs', created: new Date().toISOString().slice(0,10) },
    dataPoints: count,
    indicators: results,
  };
  const path = join(DATA_DIR, `worldbank-${iso3.toLowerCase()}.json`);
  writeFileSync(path, JSON.stringify(out, null, 2));
  log(`DONE ${iso3}: ${count} indicators → ${path}`);
  return count;
}

log('=== worldbank-bulk.mjs START ===');
log(`Countries: ${COUNTRIES.join(', ')}`);
log(`Indicators: ${Object.keys(INDICATORS).length}`);

let total = 0;
for (const country of COUNTRIES) {
  total += await processCountry(country);
}

log(`=== worldbank-bulk.mjs COMPLETE — total: ${total} data points ===`);
