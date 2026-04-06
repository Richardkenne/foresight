/**
 * Global Entrepreneurship Monitor (GEM) data client
 * Static dataset from GEM 2023/2024 Global Report (gemconsortium.org)
 * GEM does not provide a public REST API — data curated from published reports.
 *
 * Key metrics:
 * - TEA: Total Early-stage Entrepreneurial Activity (% of adult pop aged 18-64)
 * - Established business ownership rate
 * - Entrepreneurial intention (% planning to start a business in 3 years)
 * - Fear of failure (% who would not start due to fear of failing)
 * - Opportunity motivation (% starting for opportunity vs necessity)
 */

import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GEMData {
  country: string;
  iso: string;
  tea: number;                     // Total Early-stage Entrepreneurial Activity (%)
  establishedBiz: number;          // Established business ownership (%)
  entrepreneurialIntention: number; // % planning to start business in 3 years
  fearOfFailure: number;           // % who wouldn't start due to fear
  opportunityMotivation: number;   // % starting for opportunity vs necessity
}

interface GEMDataFile {
  _meta: {
    source: string;
    url: string;
    lastUpdated: string;
    description: string;
  };
  data: GEMData[];
}

// ---------------------------------------------------------------------------
// In-memory cache (TTL = 24h)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: GEMData[];
  expiresAt: number;
}

let cache: CacheEntry | null = null;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(): GEMData[] | null {
  if (!cache) return null;
  if (Date.now() > cache.expiresAt) {
    cache = null;
    return null;
  }
  return cache.data;
}

function setCached(data: GEMData[]): void {
  cache = { data, expiresAt: Date.now() + TTL_MS };
}

// ---------------------------------------------------------------------------
// Loader
// ---------------------------------------------------------------------------

function loadGEMDataset(): GEMData[] {
  const cached = getCached();
  if (cached) return cached;

  try {
    const filePath = path.join(process.cwd(), 'data', 'gem-global-2024.json');
    const raw: GEMDataFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const data = raw.data;
    setCached(data);
    return data;
  } catch (err) {
    console.error('[GEM] Failed to load dataset:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get GEM entrepreneurship data.
 * If country is provided, filters to that country (case-insensitive partial match).
 * Returns empty array on failure — never throws.
 */
export async function getGEMData(country?: string): Promise<GEMData[]> {
  const all = loadGEMDataset();
  if (!country) return all;

  const lower = country.toLowerCase();
  const filtered = all.filter(
    (d) =>
      d.country.toLowerCase().includes(lower) ||
      d.iso.toLowerCase() === lower
  );
  return filtered;
}

/**
 * Format GEM data as a context string for prompt injection.
 * Returns null if no data found.
 */
export function formatGEMContext(data: GEMData[]): string | null {
  if (data.length === 0) return null;

  const lines = data.map(
    (d) =>
      `${d.country}: TEA=${d.tea}%, EstablishedBiz=${d.establishedBiz}%, ` +
      `Intention=${d.entrepreneurialIntention}%, FearOfFailure=${d.fearOfFailure}%, ` +
      `OpportunityMotivation=${d.opportunityMotivation}%`
  );

  return (
    `\nGEM ENTREPRENEURSHIP DATA (GEM 2023/2024 Report — gemconsortium.org):\n` +
    lines.join('\n')
  );
}
