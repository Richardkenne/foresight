#!/usr/bin/env node
/**
 * WHO GHO — Round 2: 80 MORE indicators (different from Round 1)
 * Target: 100K+ more data points
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, '../data/cultural/who-gho');
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const DELAY_MS = 400;
const TIMEOUT_MS = 30_000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Round 1 indicators (already downloaded) — skip these
const ROUND1 = new Set([
  'WHOSIS_000001','WHOSIS_000002','MDG_0000000001','MDG_0000000003','MDG_0000000005',
  'MORT_MATERNALNUM','MORT_MATMORT','NCD_BMI_30A','NCD_BMI_25A','NCD_HYP_PREVALENCE_A',
  'NCD_CCS_DIABETES','NCD_GLUC_04','NCD_CCS_CERVICAL','NCD_CCS_BREAST','BP_04',
  'MH_12','MH_1','MH_25','MH_26','MH_27','MH_28',
  'SA_0000001688','SA_0000001462','SA_0000001690',
  'WHS4_543','WHS4_544','WHS4_545','WHS8_110','WHS4_547',
  'HIV_0000000001','HIV_0000000006','MDG_0000000020','MDG_0000000022','WHS3_49','WHS3_50',
  'WHS2_1','MDG_0000000010','WHS2_4','WHS2_6',
  'NUTRITION_WT_2','NUTRITION_WH_2','NUTRITION_WA_2','WHS4_128','NUTRITION_564',
  'WSH_SANITATION_SAFELY_MANAGED','WSH_WATER_SAFELY_MANAGED','WSH_3','WSH_8',
  'HWF_0001','HWF_0002','HWF_0003','HWF_0004',
  'GHED_CHE_pc_PPP_SHA2011','GHED_CHE_GDPSHA2011','GHED_OOPS_CHE_SHA2011','GHED_GGHE_CHE_SHA2011',
  'AIR_11','AIR_41','RS_196','RS_198',
  'VIOLENCE_HOMICIDERATE','VIOLENCE_IPVRATE',
  'NUTRITION_ANAEMIA_CHILDREN_PREV','NUTRITION_ANAEMIA_WOMEN_PREV',
  'UHC_INDEX_REPORTED','UHC_SCI_INFECT','UHC_SCI_CNCR','UHC_SCI_REPRO',
  'WHS9_86','WHS9_93','WHS9_96','WHS9_CBR','WHS9_CDR','WHS9_95',
  'SDGPM25','SDGPOISON','SDGSUICIDE','SDGNCD','SDGNTD','HWF_0006',
]);

// 80 NEW indicators
const INDICATORS = [
  // Diseases
  'MALARIA_EST_INCIDENCE', 'MALARIA_EST_DEATHS',
  'TB_e_inc_100k', 'TB_e_mort_exc_tbhiv_100k',
  'HIV_0000000026', // People living with HIV
  'HEPATITIS_B_SEROPREVALENCE', 'HEPATITIS_C_SEROPREVALENCE',
  'NTD_DENGUE_INCIDENCE', 'NTD_LEPROSY_PREVALENCE',
  'CHOLERA_0000000001', // Cholera cases
  // NCDs extended
  'NCD_CCS_COLORECTAL', 'NCD_CCS_ORAL',
  'NCD_RIS_CHOLESTEROL_A', 'NCD_RIS_SODIUM_A',
  'NCD_INSUFF_PHYSICAL_ACTIVITY',
  // Mental health extended
  'MH_4', // Mental health legislation
  'MH_7', // Community mental health
  'MH_29', // Psychiatrists in mental health
  'MH_30', // Child psychiatrists
  'SDGANXIETY', // Anxiety disorders
  'SDGDEPRESSION', // Depressive disorders
  // Maternal & child extended
  'WHS2_7', // Postnatal care
  'NUTRITION_WH_3', // Wasting severe
  'WHS4_100', // HPV immunization
  'MDG_0000000026', // Stillbirth rate
  'WHOSIS_000015', // Life expectancy at age 60
  // Environmental health
  'AIR_6', // Deaths from air pollution
  'WSH_10', // Deaths from unsafe WASH
  'SDGWASH', // WASH-attributable deaths
  'CHEMICALBURDEN', // Chemical poisoning
  // Injuries
  'VIOLENCE_RATE', // Violence deaths
  'SDG_DROWNING', // Drowning deaths
  'BURN_MORTALITY', // Burns mortality
  'FALL_MORTALITY', // Falls mortality
  // Reproductive
  'SDGCONTRACEPTIVE', // Modern contraception
  'WHS2_515', // Caesarean section rate
  'ABORTION_RATE', // Abortion rate
  // Health systems
  'GHED_PVTD_CHE_SHA2011', // Private health expenditure
  'GHED_EXT_CHE_SHA2011', // External health expenditure
  'HWF_0005', // Health management staff
  'DEVICES_01', // MRI units per million
  'DEVICES_02', // CT scanners per million
  'BEDS_ICU', // ICU beds
  // Immunization extended
  'WHS4_546', // HepA immunization
  'WHS4_548', // Pneumococcal
  'WHS4_549', // Rotavirus
  'WHS4_550', // Rubella
  'WHS4_551', // Yellow fever
  // Occupational health
  'OCC_INJURIES', // Occupational injuries
  'OCC_DEATHS', // Occupational deaths
  // Ageing
  'WHOSIS_000004', // Healthy life expectancy 60+
  'MORTALITY_60', // Probability of dying 15-60
  // Food safety
  'FOODBORNE_BURDEN', // Foodborne disease burden
  // Tobacco extended
  'SA_0000001691', // Smokeless tobacco
  'SA_0000001468', // E-cigarette use
  // Alcohol extended
  'SA_0000001689', // Alcohol use disorders
  'SA_0000001692', // Alcohol-attributable deaths
  // Child health extended
  'NUTRITION_542', // Vitamin A supplementation
  'NUTRITION_560', // Iodized salt
  'WHS4_117', // ORS treatment
  // Cancer
  'CANCER_INCIDENCE_LUNG', 'CANCER_INCIDENCE_BREAST',
  'CANCER_INCIDENCE_COLORECTAL', 'CANCER_INCIDENCE_PROSTATE',
  'CANCER_INCIDENCE_CERVIX', 'CANCER_INCIDENCE_LIVER',
  'CANCER_MORTALITY_ALL',
  // UHC extended
  'UHC_SCI_CAPACITY', // Health capacity index
  'CATASTROPHIC_HEALTH_EXP', // Catastrophic health expenditure
  'IMPOVERISHING_HEALTH_EXP', // Impoverishing health expenditure
  // COVID legacy
  'DEATHS_COVID_CUMULATIVE', 'CASES_COVID_CUMULATIVE',
  // Misc
  'BLOOD_SAFETY', // Blood donation rate
  'ORGAN_TRANSPLANT', // Transplant rate
  'EMERG_CARE', // Emergency care availability
].filter(id => !ROUND1.has(id));

async function fetchIndicator(code) {
  const url = `https://ghoapi.azureedge.net/api/${code}?$filter=TimeDim ge 2018`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.value) return [];
    return data.value
      .filter(item => item.NumericValue !== null && item.NumericValue !== undefined)
      .map(item => ({
        indicator: code, country: item.SpatialDim || 'Unknown',
        year: parseInt(item.TimeDim) || 0, value: item.NumericValue,
        sex: item.Dim1 || 'Both', ageGroup: item.Dim2 || 'All',
        sourceUrl: `https://www.who.int/data/gho/data/indicators/indicator-details/GHO/${code}`,
        source: 'WHO GHO', fetchedAt: '2026-04-09',
      }));
  } catch { return []; }
}

async function main() {
  console.log(`\n=== WHO GHO Round 2: ${INDICATORS.length} new indicators ===\n`);
  let totalDP = 0;
  let allData = [];
  let batchNum = 10; // Start from batch 10 to not overwrite

  for (let i = 0; i < INDICATORS.length; i++) {
    const dps = await fetchIndicator(INDICATORS[i]);
    totalDP += dps.length;
    allData.push(...dps);
    console.log(`[${i+1}/${INDICATORS.length}] ${INDICATORS[i]}: ${dps.length} DP | Total: ${totalDP.toLocaleString()}`);

    if (allData.length >= 50000) {
      batchNum++;
      fs.writeFileSync(path.join(OUTPUT_DIR, `who-gho-batch-${batchNum}.json`),
        JSON.stringify({ source: 'WHO GHO Round 2', batch: batchNum, fetchedAt: '2026-04-09', dataPointCount: allData.length, dataPoints: allData }, null, 2));
      console.log(`  >> Saved batch ${batchNum} (${allData.length} DP)`);
      allData = [];
    }
    await sleep(DELAY_MS);
  }

  if (allData.length > 0) {
    batchNum++;
    fs.writeFileSync(path.join(OUTPUT_DIR, `who-gho-batch-${batchNum}.json`),
      JSON.stringify({ source: 'WHO GHO Round 2', batch: batchNum, fetchedAt: '2026-04-09', dataPointCount: allData.length, dataPoints: allData }, null, 2));
  }
  console.log(`\nCOMPLETE: ${totalDP.toLocaleString()} new DP`);
}

main().catch(console.error);
