#!/usr/bin/env node
/**
 * WHO Global Health Observatory — Massive health data download
 * API: https://ghoapi.azureedge.net/api/
 * Target: 2M+ data points across 100+ indicators, 194 countries
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/who-gho');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 300;
const TIMEOUT_MS = 30_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Top 120 WHO indicators (high-value for life simulator)
const INDICATORS = [
  // Mortality
  'WHOSIS_000001', // Life expectancy at birth
  'WHOSIS_000002', // Healthy life expectancy at birth
  'MDG_0000000001', // Infant mortality rate
  'MDG_0000000003', // Under-five mortality rate
  'MDG_0000000005', // Neonatal mortality rate
  'MORT_MATERNALNUM', // Maternal deaths
  'MORT_MATMORT', // Maternal mortality ratio
  // NCDs
  'NCD_BMI_30A', // Obesity prevalence (adults)
  'NCD_BMI_25A', // Overweight prevalence (adults)
  'NCD_HYP_PREVALENCE_A', // Hypertension prevalence
  'NCD_CCS_DIABETES', // Diabetes prevalence
  'NCD_GLUC_04', // Raised blood glucose
  'NCD_CCS_CERVICAL', // Cervical cancer screening
  'NCD_CCS_BREAST', // Breast cancer screening
  'BP_04', // Raised blood pressure
  // Mental health
  'MH_12', // Mental health policy
  'MH_1', // Suicide rate
  'MH_25', // Psychiatrists per 100K
  'MH_26', // Psychologists per 100K
  'MH_27', // Social workers in mental health
  'MH_28', // Mental health nurses
  // Substance use
  'SA_0000001688', // Alcohol consumption per capita
  'SA_0000001462', // Tobacco smoking prevalence
  'SA_0000001690', // Heavy episodic drinking
  // Immunization
  'WHS4_543', // BCG immunization
  'WHS4_544', // DTP3 immunization
  'WHS4_545', // Measles immunization
  'WHS8_110', // Polio immunization
  'WHS4_547', // HepB immunization
  // HIV/TB/Malaria
  'HIV_0000000001', // New HIV infections
  'HIV_0000000006', // ART coverage
  'MDG_0000000020', // TB incidence
  'MDG_0000000022', // TB mortality
  'WHS3_49', // Malaria incidence
  'WHS3_50', // Malaria mortality
  // Reproductive health
  'WHS2_1', // Contraceptive prevalence
  'MDG_0000000010', // Adolescent birth rate
  'WHS2_4', // Antenatal care coverage
  'WHS2_6', // Skilled birth attendance
  // Child health
  'NUTRITION_WT_2', // Stunting prevalence (children)
  'NUTRITION_WH_2', // Wasting prevalence (children)
  'NUTRITION_WA_2', // Underweight prevalence (children)
  'WHS4_128', // Exclusive breastfeeding
  'NUTRITION_564', // Low birth weight
  // Water & Sanitation
  'WSH_SANITATION_SAFELY_MANAGED', // Safely managed sanitation
  'WSH_WATER_SAFELY_MANAGED', // Safely managed water
  'WSH_3', // Basic drinking water
  'WSH_8', // Basic sanitation
  // Health workforce
  'HWF_0001', // Physicians per 10K
  'HWF_0002', // Nursing/midwifery per 10K
  'HWF_0003', // Dentists per 10K
  'HWF_0004', // Pharmacists per 10K
  // Health expenditure
  'GHED_CHE_pc_PPP_SHA2011', // Health expenditure per capita (PPP)
  'GHED_CHE_GDPSHA2011', // Health expenditure % GDP
  'GHED_OOPS_CHE_SHA2011', // Out-of-pocket % health expenditure
  'GHED_GGHE_CHE_SHA2011', // Government health expenditure %
  // Air pollution
  'AIR_11', // Ambient air pollution (PM2.5)
  'AIR_41', // Household air pollution deaths
  // Road safety
  'RS_196', // Road traffic deaths
  'RS_198', // Road traffic death rate
  // Violence
  'VIOLENCE_HOMICIDERATE', // Homicide rate
  'VIOLENCE_IPVRATE', // Intimate partner violence
  // Nutrition
  'NUTRITION_ANAEMIA_CHILDREN_PREV', // Anaemia in children
  'NUTRITION_ANAEMIA_WOMEN_PREV', // Anaemia in women
  // UHC
  'UHC_INDEX_REPORTED', // UHC service coverage index
  'UHC_SCI_INFECT', // UHC infectious diseases
  'UHC_SCI_CNCR', // UHC NCDs
  'UHC_SCI_REPRO', // UHC reproductive/maternal
  // Life course
  'WHS9_86', // Age-standardized death rate (cardiovascular)
  'WHS9_93', // Age-standardized death rate (cancer)
  'WHS9_96', // Age-standardized death rate (diabetes)
  'WHS9_CBR', // Crude birth rate
  'WHS9_CDR', // Crude death rate
  'WHS9_95', // Death rate respiratory diseases
  // Additional high-value
  'SDGPM25', // PM2.5 exposure
  'SDGPOISON', // Poisoning mortality
  'SDGSUICIDE', // Suicide mortality rate (SDG)
  'SDGNCD', // NCD mortality (SDG)
  'SDGNTD', // Neglected tropical diseases
  'HWF_0006', // Hospital beds per 10K
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

async function fetchIndicator(indicatorCode) {
  const url = `https://ghoapi.azureedge.net/api/${indicatorCode}?$filter=TimeDim ge 2020`;
  try {
    const data = await fetchWithTimeout(url);
    if (!data.value || data.value.length === 0) return [];

    return data.value
      .filter(item => item.NumericValue !== null && item.NumericValue !== undefined)
      .map(item => ({
        indicator: indicatorCode,
        indicatorName: item.IndicatorCode || indicatorCode,
        country: item.SpatialDim || 'Unknown',
        year: parseInt(item.TimeDim) || 0,
        value: item.NumericValue,
        sex: item.Dim1 || 'Both',
        ageGroup: item.Dim2 || 'All',
        unit: item.Value || '',
        sourceUrl: `https://www.who.int/data/gho/data/indicators/indicator-details/GHO/${indicatorCode}`,
        source: 'WHO Global Health Observatory',
        fetchedAt: new Date().toISOString().split('T')[0],
      }));
  } catch (err) {
    return [];
  }
}

async function main() {
  console.log(`\n=== WHO Global Health Observatory Download ===`);
  console.log(`Indicators: ${INDICATORS.length}`);
  console.log(`Target: 2M+ data points\n`);

  let totalDP = 0;
  let allData = [];
  let fileCounter = 0;
  const BATCH_SAVE = 50000; // Save every 50K DP

  for (let i = 0; i < INDICATORS.length; i++) {
    const ind = INDICATORS[i];
    const dataPoints = await fetchIndicator(ind);
    totalDP += dataPoints.length;
    allData.push(...dataPoints);

    console.log(`[${i + 1}/${INDICATORS.length}] ${ind}: ${dataPoints.length} DP | Total: ${totalDP.toLocaleString()}`);

    // Save in chunks to avoid memory issues
    if (allData.length >= BATCH_SAVE) {
      fileCounter++;
      const filename = `who-gho-batch-${fileCounter}.json`;
      const output = {
        source: 'WHO Global Health Observatory',
        batch: fileCounter,
        fetchedAt: new Date().toISOString().split('T')[0],
        dataPointCount: allData.length,
        dataPoints: allData,
      };
      fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(output, null, 2));
      console.log(`  >> Saved ${filename} (${allData.length.toLocaleString()} DP)`);
      allData = [];
    }

    await sleep(DELAY_MS);
  }

  // Save remaining
  if (allData.length > 0) {
    fileCounter++;
    const filename = `who-gho-batch-${fileCounter}.json`;
    const output = {
      source: 'WHO Global Health Observatory',
      batch: fileCounter,
      fetchedAt: new Date().toISOString().split('T')[0],
      dataPointCount: allData.length,
      dataPoints: allData,
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), JSON.stringify(output, null, 2));
    console.log(`  >> Saved ${filename} (${allData.length.toLocaleString()} DP)`);
  }

  console.log(`\n=== COMPLETE ===`);
  console.log(`Total data points: ${totalDP.toLocaleString()}`);
  console.log(`Files: ${fileCounter}`);
  console.log(`Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);
