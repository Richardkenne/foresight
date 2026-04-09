/**
 * Eurostat Retry — Fetch failed datasets one country at a time
 * Handles HTTP 413 (payload too large) by splitting requests
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/eurostat-v2');
const DELAY_MS = 800;

const COUNTRIES = {
  AT: 'Austria', BE: 'Belgium', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus',
  CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', FR: 'France',
  DE: 'Germany', EL: 'Greece', HU: 'Hungary', IE: 'Ireland', IT: 'Italy',
  LV: 'Latvia', LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', NL: 'Netherlands',
  PL: 'Poland', PT: 'Portugal', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia',
  ES: 'Spain', SE: 'Sweden',
};

const GEO_CODES = Object.keys(COUNTRIES);

// Failed datasets from round 1
const FAILED_DATASETS = [
  { code: 'nama_10_gdp', label: 'GDP and main components' },
  { code: 'nama_10_pc', label: 'GDP per capita' },
  { code: 'lfsa_urgan', label: 'Unemployment rate by sex, age and nationality' },
  { code: 'lfsa_egised', label: 'Employment by sex, age and educational attainment' },
  { code: 'educ_uoe_enrt01', label: 'Students enrolled in education' },
  { code: 'educ_uoe_grad02', label: 'Graduates by education level' },
  { code: 'earn_ses_monthly', label: 'Mean monthly earnings' },
  { code: 'isoc_ci_ifp_iu', label: 'Internet use by individuals' },
  { code: 'env_air_gge', label: 'Greenhouse gas emissions' },
  { code: 'nrg_bal_c', label: 'Energy balance' },
  { code: 'sbs_na_ind_r2', label: 'Industry statistics' },
  { code: 'bd_9ac_l_form_r2', label: 'Business demography' },
  { code: 'isoc_sk_dskl_i21', label: 'Digital skills' },
  { code: 'crim_off_cat', label: 'Crimes recorded by the police' },
  { code: 'migr_imm1ctz', label: 'Immigration by citizenship' },
  { code: 'lfsa_ewpshi', label: 'Employees working part-time' },
  { code: 'earn_gr_gpgr2', label: 'Gender pay gap' },
  { code: 'sdg_08_10', label: 'Employment rate SDG 8.5' },
  { code: 'tps00203', label: 'Healthy life years at birth' },
  { code: 'tec00114', label: 'Government expenditure' },
  { code: 'rd_e_gerdtot', label: 'R&D expenditure' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function decodeIndex(flatIdx, sizes) {
  const indices = new Array(sizes.length);
  let remaining = flatIdx;
  for (let d = sizes.length - 1; d >= 0; d--) {
    indices[d] = remaining % sizes[d];
    remaining = Math.floor(remaining / sizes[d]);
  }
  return indices;
}

function buildReverseIndex(categoryIndex) {
  const rev = {};
  for (const [code, pos] of Object.entries(categoryIndex)) {
    rev[pos] = code;
  }
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
    return { pos: i, name: dimName, labels, rev: reverses[i] };
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
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(45000),
    });
    if (!resp.ok) return [];
    const json = await resp.json();
    return parseJsonStat(json, countryCode);
  } catch {
    return [];
  }
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  let grandTotal = 0;

  console.log(`Eurostat Retry — ${FAILED_DATASETS.length} datasets × ${GEO_CODES.length} countries (per-country fetch)\n`);

  for (let i = 0; i < FAILED_DATASETS.length; i++) {
    const dataset = FAILED_DATASETS[i];
    const outPath = join(OUTPUT_DIR, `${dataset.code}.json`);

    // Skip if already has data
    if (existsSync(outPath)) {
      try {
        const existing = JSON.parse(readFileSync(outPath, 'utf-8'));
        if (existing.dataPoints?.length > 0) {
          console.log(`[${i+1}/${FAILED_DATASETS.length}] ${dataset.code} — already has ${existing.dataPoints.length} dp, skipping`);
          grandTotal += existing.dataPoints.length;
          continue;
        }
      } catch {}
    }

    process.stdout.write(`[${i+1}/${FAILED_DATASETS.length}] ${dataset.code} — `);
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
      fetchedAt: new Date().toISOString(), countries: GEO_CODES,
      dataPoints: allPoints,
    }, null, 2));

    console.log(`${allPoints.length.toLocaleString()} dp`);
    grandTotal += allPoints.length;
  }

  console.log(`\nDone. Grand total: ${grandTotal.toLocaleString()} dp`);
}

main().catch(console.error);
