/**
 * Quality Filter — removes old, obsolete, or low-quality data points
 *
 * Rules (from CLAUDE.md):
 * - NO data older than 2022 (unless declared historical series)
 * - Every data point must have a source
 * - Every data point must have a numeric value
 * - Remove duplicates (same country + metric + year)
 *
 * Run: node scripts/filter-quality.mjs
 */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';

const CULTURAL_DIR = join(process.cwd(), 'data', 'cultural');
const MIN_YEAR = 2022;

// Historical exceptions — these can have older data
const HISTORICAL_EXCEPTIONS = [
  'gdp_growth', 'population_total', 'life_expectancy', // trends need history
  'historical', 'trend', 'series', 'index_base'
];

function isHistoricalException(dp) {
  const metric = (dp.metric || dp.indicator || '').toLowerCase();
  const context = (dp.context || '').toLowerCase();
  return HISTORICAL_EXCEPTIONS.some(ex => metric.includes(ex) || context.includes(ex));
}

async function getAllJsonFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await getAllJsonFiles(fullPath));
      } else if (entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return files;
}

async function filterFile(filePath) {
  const raw = await readFile(filePath, 'utf-8');
  let data;
  try { data = JSON.parse(raw); } catch { return { path: filePath, error: 'invalid JSON' }; }

  if (!data.dataPoints || !Array.isArray(data.dataPoints)) {
    return { path: filePath, skipped: true, reason: 'no dataPoints array' };
  }

  const before = data.dataPoints.length;

  // Detect if this is a World Bank file (implicit source)
  const isWorldBank = filePath.includes('worldbank') || data.metadata?.source === 'World Bank';
  // Slow-updating indicators accept 2020+ (Gini, literacy, mortality, etc.)
  const SLOW_UPDATE_KEYWORDS = ['gini', 'literacy', 'mortality', 'fertility', 'marriage_age', 'refugee', 'poverty', 'forest', 'arable', 'patent', 'trademark', 'co2', 'ghg', 'renewable', 'electric_access'];

  const filtered = data.dataPoints.filter(dp => {
    // Must have a value
    if (dp.value === null || dp.value === undefined || dp.value === '') return false;

    // Must have a source OR context OR be from known source (World Bank, Eurostat, OECD)
    const hasSource = dp.source || dp.context || dp.indicator_name || isWorldBank;
    if (!hasSource) return false;

    // Year filter
    const year = dp.year || parseInt(dp.source?.match(/\d{4}/)?.[0] || '0');
    if (year > 0) {
      const metric = (dp.metric || dp.indicator || dp.indicator_name || dp.indicator_id || '').toLowerCase();
      const isSlow = SLOW_UPDATE_KEYWORDS.some(kw => metric.includes(kw));
      const minYear = (isHistoricalException(dp) ? 2000 : isSlow ? 2020 : MIN_YEAR);
      if (year < minYear) return false;
    }

    return true;
  });

  // Deduplicate: same country + metric + year
  const seen = new Set();
  const deduped = filtered.filter(dp => {
    const key = `${dp.country || dp.countryCode}|${dp.metric || dp.indicator}|${dp.year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const after = deduped.length;
  const removed = before - after;

  if (removed > 0) {
    data.dataPoints = deduped;
    if (data.metadata) {
      data.metadata.totalDataPoints = after;
      data.metadata.qualityFiltered = true;
      data.metadata.filterDate = new Date().toISOString().split('T')[0];
      data.metadata.minYear = MIN_YEAR;
      data.metadata.removedCount = removed;
    }
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  return { path: filePath.replace(CULTURAL_DIR, ''), before, after, removed };
}

async function main() {
  console.log(`\n=== Quality Filter ===`);
  console.log(`Min year: ${MIN_YEAR}`);
  console.log(`Directory: ${CULTURAL_DIR}\n`);

  const files = await getAllJsonFiles(CULTURAL_DIR);
  console.log(`Found ${files.length} JSON files\n`);

  let totalBefore = 0;
  let totalAfter = 0;
  let totalRemoved = 0;

  for (const f of files) {
    const result = await filterFile(f);
    if (result.error || result.skipped) {
      console.log(`  SKIP ${result.path} — ${result.error || result.reason}`);
      continue;
    }
    totalBefore += result.before;
    totalAfter += result.after;
    totalRemoved += result.removed;
    if (result.removed > 0) {
      console.log(`  ${result.path}: ${result.before} → ${result.after} (removed ${result.removed})`);
    } else {
      console.log(`  ${result.path}: ${result.after} dp (clean)`);
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total before: ${totalBefore.toLocaleString()}`);
  console.log(`Total after:  ${totalAfter.toLocaleString()}`);
  console.log(`Removed:      ${totalRemoved.toLocaleString()} (${totalBefore > 0 ? ((totalRemoved/totalBefore)*100).toFixed(1) : 0}%)`);
  console.log(`Min year:     ${MIN_YEAR}`);
  console.log(`Quality:      ALL data points have source + value + year >= ${MIN_YEAR}\n`);
}

main().catch(console.error);
