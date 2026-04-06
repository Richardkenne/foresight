/**
 * OECD economic indicators client
 * Curated static dataset from OECD.Stat (data.oecd.org) for OECD member countries.
 * The OECD SDMX REST API is complex; this uses a pre-built dataset with 2023-2024 data.
 *
 * Key metrics:
 * - GDP growth (%)
 * - Unemployment rate (%)
 * - Business birth/death rates (per 1000 existing businesses)
 * - Self-employment rate (% of total employment)
 * - R&D spending (% of GDP)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OECDData {
  country: string;
  iso: string;
  gdpGrowth: number;          // % change YoY
  unemployment: number;        // % of labor force
  businessBirthRate: number;   // new businesses per 1000 existing
  businessDeathRate: number;   // closures per 1000 existing
  selfEmploymentRate: number;  // % of total employment
  rAndDSpending: number;       // % of GDP
}

interface OECDDataFile {
  _meta: {
    source: string;
    url: string;
    lastUpdated: string;
    description: string;
  };
  data: OECDData[];
}

// ---------------------------------------------------------------------------
// In-memory cache (TTL = 24h)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: OECDData[];
  expiresAt: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(): OECDData[] | null {
  if (!cache) return null;
  if (Date.now() > cache.expiresAt) {
    cache = null;
    return null;
  }
  return cache.data;
}

function setCached(data: OECDData[]): void {
  cache = { data, expiresAt: Date.now() + TTL_MS };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

function loadOECDDataset(): OECDData[] {
  const cached = getCached();
  if (cached) return cached;

  try {
    const filePath = path.join(process.cwd(), 'data', 'oecd-indicators-2024.json');
    const raw: OECDDataFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const data = raw.data;
    setCached(data);
    return data;
  } catch (err) {
    console.error('[OECD] Failed to load dataset:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get OECD economic data for a specific country.
 * Case-insensitive partial match on country name or ISO code.
 * Returns null if no match found — never throws.
 */
export async function getOECDData(country?: string): Promise<OECDData | null> {
  const all = loadOECDDataset();
  if (!country) return null;

  const lower = country.toLowerCase();
  const match = all.find(
    (d) =>
      d.country.toLowerCase().includes(lower) ||
      d.iso.toLowerCase() === lower
  );
  return match || null;
}

/**
 * Get OECD data for all countries.
 * Returns empty array on failure — never throws.
 */
export async function getAllOECDData(): Promise<OECDData[]> {
  return loadOECDDataset();
}

/**
 * Format OECD data as a context string for prompt injection.
 * Returns null if no data provided.
 */
export function formatOECDContext(data: OECDData | OECDData[]): string | null {
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return null;

  const lines = arr.map(
    (d) =>
      `${d.country}: GDP Growth=${d.gdpGrowth}%, Unemployment=${d.unemployment}%, ` +
      `BizBirthRate=${d.businessBirthRate}/1000, BizDeathRate=${d.businessDeathRate}/1000, ` +
      `SelfEmployment=${d.selfEmploymentRate}%, R&D=${d.rAndDSpending}% of GDP`
  );

  return (
    `\nOECD ECONOMIC INDICATORS (OECD 2023/2024 — data.oecd.org):\n` +
    lines.join('\n')
  );
}
