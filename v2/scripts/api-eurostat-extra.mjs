/**
 * Eurostat Extra — 50 additional datasets NOT in the core/retry list
 * Fetches per-country to avoid HTTP 413
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/eurostat-v2');
const DELAY_MS = 600;

const COUNTRIES = {
  AT:'Austria',BE:'Belgium',BG:'Bulgaria',HR:'Croatia',CY:'Cyprus',
  CZ:'Czechia',DK:'Denmark',EE:'Estonia',FI:'Finland',FR:'France',
  DE:'Germany',EL:'Greece',HU:'Hungary',IE:'Ireland',IT:'Italy',
  LV:'Latvia',LT:'Lithuania',LU:'Luxembourg',MT:'Malta',NL:'Netherlands',
  PL:'Poland',PT:'Portugal',RO:'Romania',SK:'Slovakia',SI:'Slovenia',
  ES:'Spain',SE:'Sweden',
};
const GEO_CODES = Object.keys(COUNTRIES);

const EXTRA_DATASETS = [
  { code: 'lfsa_egan2', label: 'Employment by sex, age and economic activity' },
  { code: 'lfsa_eisn2', label: 'Employment by sex, age and occupation' },
  { code: 'lfsa_ergaed', label: 'Employment rates by age and education' },
  { code: 'lfsa_eegaed', label: 'Employment by education attainment' },
  { code: 'une_rt_m', label: 'Monthly unemployment rates' },
  { code: 'prc_hicp_midx', label: 'HICP monthly data index' },
  { code: 'prc_ppp_ind', label: 'Purchasing power parities' },
  { code: 'nama_10_a64', label: 'National accounts by 64 branches' },
  { code: 'nama_10_a10', label: 'National accounts by 10 branches' },
  { code: 'nama_10_fcs', label: 'Final consumption expenditure of households' },
  { code: 'sbs_r_nuts06_r2', label: 'Business statistics by NUTS 2 regions' },
  { code: 'hlth_silc_02', label: 'Unmet needs for medical examination' },
  { code: 'hlth_ehis_bm1e', label: 'Body mass index by sex and age' },
  { code: 'hlth_ehis_sk3e', label: 'Smoking habits by sex and age' },
  { code: 'hlth_ehis_al1e', label: 'Alcohol consumption by sex and age' },
  { code: 'hlth_ehis_pe9e', label: 'Physical activity by sex and age' },
  { code: 'hlth_hlye', label: 'Healthy life years' },
  { code: 'educ_uoe_enra11', label: 'Students by education level and field' },
  { code: 'educ_uoe_fini04', label: 'Education expenditure per student' },
  { code: 'edat_lfse_03', label: 'Early leavers from education by sex' },
  { code: 'edat_lfse_14', label: 'Adults with tertiary education' },
  { code: 'isoc_ci_in_h', label: 'Internet access of households' },
  { code: 'isoc_ci_im_i', label: 'Internet purchases by individuals' },
  { code: 'isoc_r_cux_i', label: 'Cloud computing services used' },
  { code: 'isoc_cisci_ax', label: 'AI usage by enterprises' },
  { code: 'demo_mlexpec', label: 'Life expectancy by age and sex' },
  { code: 'demo_frate', label: 'Fertility rates by age' },
  { code: 'demo_nsinagec', label: 'Deaths by age and sex' },
  { code: 'migr_pop1ctz', label: 'Population by citizenship' },
  { code: 'migr_asyappctza', label: 'Asylum applicants by citizenship' },
  { code: 'ilc_lvho02', label: 'Housing cost overburden rate' },
  { code: 'ilc_mdes01', label: 'Material deprivation rate' },
  { code: 'ilc_peps01n', label: 'People at risk of poverty or social exclusion' },
  { code: 'ilc_li02', label: 'At-risk-of-poverty rate by age' },
  { code: 'earn_mw_cur', label: 'Minimum wages (bi-annual)' },
  { code: 'earn_ses_pub2s', label: 'Public sector mean earnings' },
  { code: 'tps00001', label: 'Total population' },
  { code: 'tps00006', label: 'Live births and crude birth rate' },
  { code: 'tps00010', label: 'Crude marriage rate' },
  { code: 'tps00013', label: 'Crude divorce rate' },
  { code: 'tps00025', label: 'Total fertility rate' },
  { code: 'tps00026', label: 'Infant mortality rate' },
  { code: 'sdg_01_10', label: 'People at risk of poverty (SDG 1)' },
  { code: 'sdg_03_10', label: 'Life expectancy at birth (SDG 3)' },
  { code: 'sdg_04_10', label: 'Early leavers from education (SDG 4)' },
  { code: 'sdg_05_20', label: 'Gender employment gap (SDG 5)' },
  { code: 'sdg_07_10', label: 'Primary energy consumption (SDG 7)' },
  { code: 'sdg_08_20', label: 'Young people NEET (SDG 8)' },
  { code: 'sdg_09_10', label: 'Gross domestic expenditure on R&D (SDG 9)' },
  { code: 'sdg_10_10', label: 'Gini coefficient (SDG 10)' },
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function decodeIndex(flatIdx, sizes) {
  const indices = new Array(sizes.length);
  let remaining = flatIdx;
  for (let d = sizes.length - 1; d >= 0; d--) {
    indices[d] = remaining % sizes[d];
    remaining = Math.floor(remaining / sizes[d]);
  }
  return indices;
}

function buildReverseIndex(idx) {
  const rev = {};
  for (const [code, pos] of Object.entries(idx)) rev[pos] = code;
  return rev;
}

function parseJsonStat(data, filterGeo) {
  const { id, size, dimension, value } = data;
  if (!id || !size || !dimension || value === undefined) return [];

  const geoPos = id.findIndex(d => d.toLowerCase() === 'geo');
  let timePos = id.findIndex(d => d.toLowerCase() === 'time');
  if (timePos === -1) timePos = id.findIndex(d => d.toLowerCase() === 'time_period');
  if (geoPos === -1 || timePos === -1) return [];

  const reverses = id.map(dimName => {
    const dim = dimension[dimName];
    if (!dim?.category?.index) return {};
    return buildReverseIndex(dim.category.index);
  });

  const geoRev = reverses[geoPos];
  const timeRev = reverses[timePos];
  if (!Object.keys(geoRev).length || !Object.keys(timeRev).length) return [];

  const extraDims = id.map((dimName, i) => {
    if (i === geoPos || i === timePos) return null;
    const dim = dimension[dimName];
    const labels = dim?.category?.label || {};
    return { pos: i, labels, rev: reverses[i] };
  }).filter(Boolean);

  const results = [];
  for (const [flatIdxStr, val] of Object.entries(value)) {
    if (val === null || val === undefined) continue;
    const flatIdx = parseInt(flatIdxStr, 10);
    const indices = decodeIndex(flatIdx, size);
    const geoCode = geoRev[indices[geoPos]];
    const yearStr = timeRev[indices[timePos]];
    if (!geoCode || !yearStr) continue;
    if (filterGeo && geoCode !== filterGeo) continue;

    const extras = extraDims.map(d => {
      const code = d.rev[indices[d.pos]];
      return d.labels[code] || code;
    }).filter(l => l && l !== 'Annual' && l !== 'Total');

    results.push({ countryCode: geoCode, year: yearStr, value: val, extra: extras.length ? extras.join(', ') : '' });
  }
  return results;
}

async function fetchForCountry(dataset, countryCode) {
  const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset.code}?format=JSON&lang=en&sinceTimePeriod=2015&untilTimePeriod=2024&geo=${countryCode}`;
  try {
    const resp = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(45000) });
    if (!resp.ok) return [];
    const json = await resp.json();
    return parseJsonStat(json, countryCode);
  } catch { return []; }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  let grandTotal = 0;

  console.log(`Eurostat Extra — ${EXTRA_DATASETS.length} datasets × ${GEO_CODES.length} countries\n`);

  for (let i = 0; i < EXTRA_DATASETS.length; i++) {
    const dataset = EXTRA_DATASETS[i];
    const outPath = join(OUTPUT_DIR, `${dataset.code}.json`);

    if (existsSync(outPath)) {
      try {
        const existing = JSON.parse(readFileSync(outPath, 'utf-8'));
        if (existing.dataPoints?.length > 0) {
          console.log(`[${i+1}/${EXTRA_DATASETS.length}] ${dataset.code} — already has ${existing.dataPoints.length.toLocaleString()} dp, skip`);
          grandTotal += existing.dataPoints.length;
          continue;
        }
      } catch {}
    }

    process.stdout.write(`[${i+1}/${EXTRA_DATASETS.length}] ${dataset.code} — `);
    const allPoints = [];

    for (const code of GEO_CODES) {
      const raw = await fetchForCountry(dataset, code);
      for (const r of raw) {
        const detail = r.extra ? ` (${r.extra})` : '';
        allPoints.push({
          context: `${COUNTRIES[r.countryCode]} ${dataset.label.toLowerCase()}${detail} was ${r.value} in ${r.year}. Source: Eurostat ${dataset.code}.`,
          country: COUNTRIES[r.countryCode],
          countryCode: r.countryCode,
          metric: dataset.label,
          indicator: dataset.code,
          value: r.value,
          year: r.year,
          source: 'Eurostat',
        });
      }
      await sleep(DELAY_MS);
    }

    writeFileSync(outPath, JSON.stringify({
      source: 'Eurostat', dataset: dataset.code, label: dataset.label,
      fetchedAt: new Date().toISOString(), countries: GEO_CODES, dataPoints: allPoints,
    }, null, 2));

    console.log(`${allPoints.length.toLocaleString()} dp`);
    grandTotal += allPoints.length;
  }

  console.log(`\nDone. Grand total: ${grandTotal.toLocaleString()} dp`);
}

main().catch(console.error);
