/**
 * Eurostat API client
 * Fetches EU statistical data: GDP, unemployment, business creation, education spending, consumer confidence
 * Base URL: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/
 */

export interface EurostatEntry {
  country: string;
  value: number;
  year: number;
  indicator: string;
}

type EurostatIndicator =
  | 'gdp'
  | 'unemployment'
  | 'business_creation'
  | 'education_spending'
  | 'consumer_confidence';

// ---------------------------------------------------------------------------
// Dataset config
// ---------------------------------------------------------------------------

interface DatasetConfig {
  id: string;
  indicator: string;
  params: Record<string, string>;
}

const DATASETS: Record<EurostatIndicator, DatasetConfig> = {
  gdp: {
    id: 'nama_10_gdp',
    indicator: 'gdp_growth',
    params: {
      unit: 'CLV_PCH_PRE', // % change on previous year, chain-linked volumes
      na_item: 'B1GQ',     // Gross domestic product at market prices
    },
  },
  unemployment: {
    id: 'une_rt_m',
    indicator: 'unemployment_rate',
    params: {
      unit: 'PC_ACT',  // percentage of active population
      age: 'TOTAL',
      sex: 'T',
    },
  },
  business_creation: {
    id: 'tin00172',
    indicator: 'business_creation_rate',
    params: {},
  },
  education_spending: {
    id: 'educ_uoe_fine09',
    indicator: 'education_spending_pct_gdp',
    params: {},
  },
  consumer_confidence: {
    id: 'ei_bsci_m_r2',
    indicator: 'consumer_confidence',
    params: {
      indic: 'BS-CSMCI', // Consumer confidence indicator
      s_adj: 'SA',       // Seasonally adjusted
    },
  },
};

const BASE_URL =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data';

// ---------------------------------------------------------------------------
// In-memory cache (TTL = 24h)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: EurostatEntry[];
  expiresAt: number;
}

const cache = new Map<EurostatIndicator, CacheEntry>();
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(indicator: EurostatIndicator): EurostatEntry[] | null {
  const entry = cache.get(indicator);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(indicator);
    return null;
  }
  return entry.data;
}

function setCached(indicator: EurostatIndicator, data: EurostatEntry[]): void {
  cache.set(indicator, { data, expiresAt: Date.now() + TTL_MS });
}

// ---------------------------------------------------------------------------
// Eurostat JSON response types (simplified)
// ---------------------------------------------------------------------------

interface EurostatResponse {
  dimension: {
    [key: string]: {
      label: string;
      category: {
        index: Record<string, number>;
        label: Record<string, string>;
      };
    };
  };
  id: string[];        // dimension order, e.g. ["freq","unit","geo","time"]
  size: number[];      // number of values per dimension
  value: Record<string, number>; // flat index → value
}

// ---------------------------------------------------------------------------
// Response parser
// ---------------------------------------------------------------------------

/**
 * Parses Eurostat JSON format into EurostatEntry[].
 * The response uses a flat index into value, computed from dimension indices.
 */
function parseResponse(
  raw: EurostatResponse,
  indicator: string
): EurostatEntry[] {
  const results: EurostatEntry[] = [];

  const { dimension, id: dimOrder, size, value } = raw;

  // Find geo (country) and time dimensions
  const geoIdx = dimOrder.indexOf('geo');
  const timeIdx = dimOrder.indexOf('time');

  if (geoIdx === -1 || timeIdx === -1) {
    return results;
  }

  const geoDim = dimension['geo'];
  const timeDim = dimension['time'];

  if (!geoDim || !timeDim) return results;

  const geoLabels = geoDim.category.label;   // code → full name
  const geoIndex = geoDim.category.index;    // code → position
  const timeLabels = timeDim.category.label; // code → label
  const timeIndex = timeDim.category.index;  // code → position

  // For each geo × time combination, look up the flat index
  for (const [geoCode, geoPos] of Object.entries(geoIndex)) {
    for (const [timeCode, timePos] of Object.entries(timeIndex)) {
      // Compute flat index: stride product across all dimensions
      let flatIdx = 0;
      let stride = 1;
      // Walk dimensions in reverse order
      for (let d = dimOrder.length - 1; d >= 0; d--) {
        const dimName = dimOrder[d];
        let pos = 0;
        if (dimName === 'geo') {
          pos = geoPos;
        } else if (dimName === 'time') {
          pos = timePos;
        } else {
          // For other dimensions (unit, sex, etc.) we take position 0
          // This is a reasonable default when filtering by a single value
          pos = 0;
        }
        flatIdx += pos * stride;
        stride *= size[d];
      }

      const val = value[String(flatIdx)];
      if (val === undefined || val === null) continue;

      // Extract year from time code: "2023", "2023M01", "2023Q1" → 2023
      const yearMatch = timeCode.match(/^(\d{4})/);
      if (!yearMatch) continue;
      const year = parseInt(yearMatch[1], 10);

      // Skip old data (keep 2022+)
      if (year < 2022) continue;

      const countryName = geoLabels[geoCode] || geoCode;

      results.push({
        country: countryName,
        value: Math.round(val * 100) / 100,
        year,
        indicator,
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

async function fetchDataset(
  indicator: EurostatIndicator
): Promise<EurostatEntry[]> {
  const cached = getCached(indicator);
  if (cached) return cached;

  const config = DATASETS[indicator];
  const params = new URLSearchParams({
    format: 'JSON',
    lang: 'en',
    ...config.params,
  });

  const url = `${BASE_URL}/${config.id}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      // Next.js fetch: revalidate every 24h on the server too
      next: { revalidate: 86400 },
    } as RequestInit);

    if (!response.ok) {
      console.error(
        `[Eurostat] ${indicator}: HTTP ${response.status} — ${url}`
      );
      return [];
    }

    const raw: EurostatResponse = await response.json();
    const entries = parseResponse(raw, config.indicator);

    setCached(indicator, entries);
    return entries;
  } catch (err) {
    console.error(`[Eurostat] ${indicator}: fetch failed —`, err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a single Eurostat indicator.
 * Returns an empty array on failure — never throws.
 */
export async function fetchEurostatData(
  indicator: EurostatIndicator
): Promise<EurostatEntry[]> {
  return fetchDataset(indicator);
}

/**
 * Fetch all 5 Eurostat indicators in parallel.
 * Returns merged array sorted by country then year.
 */
export async function fetchAllEurostat(): Promise<EurostatEntry[]> {
  const keys = Object.keys(DATASETS) as EurostatIndicator[];
  const results = await Promise.all(keys.map(fetchDataset));
  const merged = results.flat();
  merged.sort((a, b) =>
    a.country.localeCompare(b.country) || a.year - b.year
  );
  return merged;
}
