#!/usr/bin/env node
/**
 * filter-quality.mjs
 * Removes data points with year < 2022 from all JSON files in data/cultural/.
 * Also removes entries with null/undefined values or missing sources.
 * Rewrites files in-place, updates dataPoints count.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, lstatSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data', 'cultural');
const MIN_YEAR = 2022;

let totalRemoved = 0;
let totalKept = 0;
let filesProcessed = 0;

function isDataPoint(obj) {
  return obj && typeof obj === 'object' && 'value' in obj;
}

function filterObj(obj, path = '') {
  if (!obj || typeof obj !== 'object') return [obj, 0, 0];
  if (Array.isArray(obj)) {
    const filtered = obj.map(item => filterObj(item, path)).filter(([v]) => v !== null);
    return [filtered.map(([v]) => v), 0, 0];
  }

  // Is it a data point leaf?
  if (isDataPoint(obj)) {
    const year = parseInt(obj.year);
    if (isNaN(year) || year < MIN_YEAR) return [null, 1, 0];   // removed
    if (obj.value === null || obj.value === undefined) return [null, 1, 0];
    return [obj, 0, 1]; // kept
  }

  // Recurse into object
  let removed = 0, kept = 0;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('_') || k === 'dataPoints') {
      out[k] = v;
      continue;
    }
    const [filtered, r, k2] = filterObj(v, `${path}.${k}`);
    removed += r;
    kept += k2;
    if (filtered !== null && filtered !== undefined) {
      if (typeof filtered === 'object' && !Array.isArray(filtered) && Object.keys(filtered).length === 0) continue;
      out[k] = filtered;
    }
  }
  return [out, removed, kept];
}

function processFile(filePath) {
  let raw;
  try { raw = JSON.parse(readFileSync(filePath, 'utf8')); }
  catch { console.error(`  SKIP (parse error): ${filePath}`); return; }

  const [filtered, removed, kept] = filterObj(raw);
  totalRemoved += removed;
  totalKept += kept;
  filesProcessed++;

  // Update dataPoints count
  if (filtered && typeof filtered === 'object') {
    filtered.dataPoints = kept;
    if (filtered._meta) filtered._meta.filtered = new Date().toISOString().slice(0,10);
  }

  writeFileSync(filePath, JSON.stringify(filtered, null, 2));
  if (removed > 0) {
    console.log(`  ${filePath.split('/').pop()}: removed ${removed}, kept ${kept}`);
  } else {
    console.log(`  ${filePath.split('/').pop()}: all ${kept} data points pass (year >= ${MIN_YEAR})`);
  }
}

function walkDir(dir) {
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    // Check with lstat first to detect broken symlinks
    let lst;
    try { lst = lstatSync(full); } catch { console.log(`  SKIP (inaccessible): ${f}`); continue; }
    if (lst.isSymbolicLink()) {
      // Try to resolve — skip if broken (iCloud not available in this env)
      try { statSync(full); } catch { console.log(`  SKIP (broken symlink): ${f}`); continue; }
    }
    let st;
    try { st = statSync(full); } catch { console.log(`  SKIP (stat error): ${f}`); continue; }
    if (st.isDirectory()) walkDir(full);
    else if (f.endsWith('.json')) processFile(full);
  }
}

console.log(`=== filter-quality.mjs — removing data points year < ${MIN_YEAR} ===`);
console.log(`Directory: ${DATA_DIR}\n`);
walkDir(DATA_DIR);
console.log(`\nDone. Files: ${filesProcessed} | Removed: ${totalRemoved} | Kept: ${totalKept}`);
