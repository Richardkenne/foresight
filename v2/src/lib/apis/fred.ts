// FRED (Federal Reserve Economic Data) API client
// Base URL: https://api.stlouisfed.org/fred/series/observations
// Docs: https://fred.stlouisfed.org/docs/api/fred/

export interface FredEntry {
  series: string;
  date: string;
  value: number;
  description: string;
}

interface FredObservation {
  date: string;
  value: string;
}

interface FredResponse {
  observations: FredObservation[];
}

const FRED_BASE_URL = "https://api.stlouisfed.org/fred/series/observations";

const SERIES_DESCRIPTIONS: Record<string, string> = {
  CPIAUCSL: "CPI Inflation Rate",
  UNRATE: "Unemployment Rate",
  FEDFUNDS: "Federal Funds Rate",
  GDP: "Gross Domestic Product",
  PSAVERT: "Personal Savings Rate",
  UMCSENT: "Consumer Sentiment (U. Michigan)",
};

const ALL_SERIES = Object.keys(SERIES_DESCRIPTIONS);

// In-memory cache: key -> { data, expiresAt }
interface CacheEntry {
  data: FredEntry[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function getCached(key: string): FredEntry[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: FredEntry[]): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function fetchFredSeries(seriesId: string): Promise<FredEntry[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    return [];
  }

  const cacheKey = `fred_${seriesId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(FRED_BASE_URL);
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "24");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`[FRED] HTTP ${res.status} for series ${seriesId}`);
      return [];
    }

    const json: FredResponse = await res.json();
    const description = SERIES_DESCRIPTIONS[seriesId] ?? seriesId;

    const entries: FredEntry[] = json.observations
      .filter((obs) => obs.value !== "." && obs.value !== "")
      .map((obs) => ({
        series: seriesId,
        date: obs.date,
        value: parseFloat(obs.value),
        description,
      }))
      .filter((entry) => !isNaN(entry.value));

    setCached(cacheKey, entries);
    return entries;
  } catch (err) {
    console.error(`[FRED] Failed to fetch series ${seriesId}:`, err);
    return [];
  }
}

export async function fetchAllFred(): Promise<FredEntry[]> {
  const results = await Promise.all(ALL_SERIES.map((id) => fetchFredSeries(id)));
  return results.flat();
}
