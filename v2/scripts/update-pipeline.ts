/**
 * Data Update Pipeline
 * Fetches fresh data from all live APIs, compares with existing data,
 * updates data/real-probabilities.json, and generates a diff report.
 *
 * Run with: npx tsx scripts/update-pipeline.ts
 * Options:
 *   --reindex   Trigger /api/index-data after update
 *   --dry-run   Show what would change without writing files
 */

import fs from "fs";
import path from "path";

// ─── Config ───

const DATA_DIR = path.join(process.cwd(), "data");
const REPORT_DIR = path.join(process.cwd(), "docs", "pipeline-reports");
const REAL_PROB_PATH = path.join(DATA_DIR, "real-probabilities.json");

const RATE_LIMIT_MS = 1100; // 1.1s between requests per API

const FLAGS = {
  reindex: process.argv.includes("--reindex"),
  dryRun: process.argv.includes("--dry-run"),
};

// ─── Types ───

interface SourceData {
  [key: string]: number | string | null;
}

interface PipelineResult {
  source: string;
  data: SourceData;
  errors: string[];
}

interface DiffEntry {
  key: string;
  source: string;
  oldValue: number | string | null;
  newValue: number | string | null;
}

// ─── Helpers ───

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.error(`  [HTTP ${res.status}] ${url}`);
      return null;
    }
    return res;
  } catch (err) {
    console.error(`  [FETCH ERROR] ${url}: ${(err as Error).message}`);
    return null;
  }
}

function round(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── 1. Eurostat ───

async function fetchEurostat(): Promise<PipelineResult> {
  console.log("[Eurostat] Fetching GDP growth & unemployment for top EU countries...");
  const errors: string[] = [];
  const data: SourceData = {};

  const BASE = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data";

  // GDP growth
  const gdpUrl = `${BASE}/nama_10_gdp?format=JSON&lang=en&unit=CLV_PCH_PRE&na_item=B1GQ&geo=EU27_2020&geo=DE&geo=FR&geo=IT&geo=ES&geo=NL&geo=PL&geo=SE&geo=BE&geo=AT&geo=IE&geo=DK&geo=FI&geo=PT&geo=CZ&geo=RO&geo=EL&geo=HU&geo=BG&geo=HR&geo=SK`;
  const gdpRes = await safeFetch(gdpUrl);
  if (gdpRes) {
    try {
      const json = await gdpRes.json();
      const entries = parseEurostatFlat(json, "gdp_growth");
      for (const e of entries) {
        data[`gdp_growth_${e.geo.toLowerCase()}`] = e.value;
      }
    } catch (e) {
      errors.push(`GDP parse error: ${(e as Error).message}`);
    }
  } else {
    errors.push("GDP endpoint failed");
  }

  await sleep(RATE_LIMIT_MS);

  // Unemployment
  const unUrl = `${BASE}/une_rt_m?format=JSON&lang=en&unit=PC_ACT&age=TOTAL&sex=T&geo=EU27_2020&geo=DE&geo=FR&geo=IT&geo=ES&geo=NL&geo=PL&geo=SE&geo=BE&geo=AT&geo=IE&geo=DK&geo=FI&geo=PT&geo=CZ&geo=RO&geo=EL&geo=HU&geo=BG&geo=HR&geo=SK`;
  const unRes = await safeFetch(unUrl);
  if (unRes) {
    try {
      const json = await unRes.json();
      const entries = parseEurostatFlat(json, "unemployment");
      for (const e of entries) {
        data[`unemployment_${e.geo.toLowerCase()}`] = e.value;
      }
    } catch (e) {
      errors.push(`Unemployment parse error: ${(e as Error).message}`);
    }
  } else {
    errors.push("Unemployment endpoint failed");
  }

  return { source: "eurostat", data, errors };
}

interface EurostatParsed {
  geo: string;
  value: number;
}

function parseEurostatFlat(raw: Record<string, unknown>, _indicator: string): EurostatParsed[] {
  const results: EurostatParsed[] = [];
  try {
    const dimension = raw.dimension as Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }>;
    const dimOrder = raw.id as string[];
    const size = raw.size as number[];
    const value = raw.value as Record<string, number>;

    if (!dimension || !dimOrder || !size || !value) return results;

    const geoIdx = dimOrder.indexOf("geo");
    const timeIdx = dimOrder.indexOf("time");
    if (geoIdx === -1 || timeIdx === -1) return results;

    const geoDim = dimension["geo"];
    const timeDim = dimension["time"];
    if (!geoDim || !timeDim) return results;

    const geoIndex = geoDim.category.index;
    const timeIndex = timeDim.category.index;

    // Find the most recent time period
    let latestTime = "";
    let latestPos = -1;
    for (const [code, pos] of Object.entries(timeIndex)) {
      const year = parseInt(code.replace(/[^0-9]/g, "").substring(0, 4), 10);
      if (year >= 2023 && (latestPos === -1 || pos > latestPos)) {
        latestTime = code;
        latestPos = pos;
      }
    }
    // Fallback: take highest position
    if (latestPos === -1) {
      for (const [code, pos] of Object.entries(timeIndex)) {
        if (pos > latestPos) {
          latestTime = code;
          latestPos = pos;
        }
      }
    }

    for (const [geoCode, geoPos] of Object.entries(geoIndex)) {
      let flatIdx = 0;
      let stride = 1;
      for (let d = dimOrder.length - 1; d >= 0; d--) {
        const dimName = dimOrder[d];
        let pos = 0;
        if (dimName === "geo") pos = geoPos;
        else if (dimName === "time") pos = latestPos;
        flatIdx += pos * stride;
        stride *= size[d];
      }
      const val = value[String(flatIdx)];
      if (val !== undefined && val !== null) {
        results.push({ geo: geoCode, value: round(val) });
      }
    }
  } catch {
    // parse error handled by caller
  }
  return results;
}

// ─── 2. FRED ───

async function fetchFred(): Promise<PipelineResult> {
  console.log("[FRED] Fetching US economic indicators...");
  const errors: string[] = [];
  const data: SourceData = {};

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    errors.push("FRED_API_KEY not set - skipping");
    return { source: "fred", data, errors };
  }

  const series: Record<string, string> = {
    CPIAUCSL: "cpi_inflation",
    UNRATE: "unemployment_us",
    FEDFUNDS: "fed_funds_rate",
    GDP: "gdp_us",
    PSAVERT: "personal_savings_rate",
    UMCSENT: "consumer_sentiment",
  };

  for (const [seriesId, key] of Object.entries(series)) {
    const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
    const res = await safeFetch(url);
    if (res) {
      try {
        const json = await res.json();
        const obs = json.observations?.[0];
        if (obs && obs.value !== "." && obs.value !== "") {
          data[key] = round(parseFloat(obs.value));
        }
      } catch (e) {
        errors.push(`${seriesId}: ${(e as Error).message}`);
      }
    } else {
      errors.push(`${seriesId}: fetch failed`);
    }
    await sleep(RATE_LIMIT_MS);
  }

  return { source: "fred", data, errors };
}

// ─── 3. World Bank ───

async function fetchWorldBank(): Promise<PipelineResult> {
  console.log("[World Bank] Fetching GDP per capita, population for top 50 countries...");
  const errors: string[] = [];
  const data: SourceData = {};

  // World Bank uses semicolons in the URL path to separate country codes
  const countries = "USA;CHN;JPN;DEU;IND;GBR;FRA;BRA;ITA;CAN;KOR;AUS;ESP;MEX;IDN;NLD;SAU;TUR;CHE;POL;SWE;BEL;ARG;NOR;AUT;ARE;ISR;THA;IRL;SGP;MYS;PHL;DNK;HKG;FIN;CZE;ROU;PRT;NZL;GRC;HUN;COL;CHL;VNM;PER;EGY;NGA;KEN;GHA;ZAF";

  // GDP per capita (current US$)
  const gdpUrl = `https://api.worldbank.org/v2/country/${countries}/indicator/NY.GDP.PCAP.CD?format=json&date=2022:2025&per_page=200`;
  const gdpRes = await safeFetch(gdpUrl);
  if (gdpRes) {
    try {
      const json = await gdpRes.json();
      const entries = Array.isArray(json) && json.length > 1 ? json[1] : [];
      if (Array.isArray(entries)) {
        // Take only the most recent value per country
        const seen = new Set<string>();
        for (const e of entries) {
          if (e?.value != null && e?.country?.id && !seen.has(e.country.id)) {
            seen.add(e.country.id);
            data[`gdp_pcap_${e.country.id.toLowerCase()}`] = round(e.value, 0);
          }
        }
      }
    } catch (e) {
      errors.push(`GDP per capita: ${(e as Error).message}`);
    }
  } else {
    errors.push("GDP per capita endpoint failed");
  }

  await sleep(RATE_LIMIT_MS);

  // Population
  const popUrl = `https://api.worldbank.org/v2/country/${countries}/indicator/SP.POP.TOTL?format=json&date=2022:2025&per_page=200`;
  const popRes = await safeFetch(popUrl);
  if (popRes) {
    try {
      const json = await popRes.json();
      const entries = Array.isArray(json) && json.length > 1 ? json[1] : [];
      if (Array.isArray(entries)) {
        const seen = new Set<string>();
        for (const e of entries) {
          if (e?.value != null && e?.country?.id && !seen.has(e.country.id)) {
            seen.add(e.country.id);
            data[`population_${e.country.id.toLowerCase()}`] = round(e.value, 0);
          }
        }
      }
    } catch (e) {
      errors.push(`Population: ${(e as Error).message}`);
    }
  } else {
    errors.push("Population endpoint failed");
  }

  return { source: "worldbank", data, errors };
}

// ─── 4. CoinGecko ───

async function fetchCoinGecko(): Promise<PipelineResult> {
  console.log("[CoinGecko] Fetching BTC, ETH prices...");
  const errors: string[] = [];
  const data: SourceData = {};

  const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true";
  const res = await safeFetch(url);
  if (res) {
    try {
      const json = await res.json();
      if (json.bitcoin) {
        data.btc_usd = round(json.bitcoin.usd, 0);
        data.btc_24h_change = round(json.bitcoin.usd_24h_change);
      }
      if (json.ethereum) {
        data.eth_usd = round(json.ethereum.usd, 0);
        data.eth_24h_change = round(json.ethereum.usd_24h_change);
      }
    } catch (e) {
      errors.push(`Parse error: ${(e as Error).message}`);
    }
  } else {
    errors.push("CoinGecko endpoint failed (rate limited?)");
  }

  return { source: "crypto", data, errors };
}

// ─── 5. Exchange Rates ───

async function fetchExchangeRates(): Promise<PipelineResult> {
  console.log("[Exchange Rates] Fetching USD rates...");
  const errors: string[] = [];
  const data: SourceData = {};

  const url = "https://open.er-api.com/v6/latest/USD";
  const res = await safeFetch(url);
  if (res) {
    try {
      const json = await res.json();
      const rates = json.rates as Record<string, number> | undefined;
      if (rates) {
        const targets = ["EUR", "GBP", "IDR", "AUD", "SGD", "JPY", "CNY", "INR", "BRL", "KRW"];
        for (const t of targets) {
          if (rates[t] != null) {
            data[`usd_${t.toLowerCase()}`] = round(rates[t], t === "IDR" || t === "KRW" ? 0 : 4);
          }
        }
      }
    } catch (e) {
      errors.push(`Parse error: ${(e as Error).message}`);
    }
  } else {
    errors.push("Exchange rates endpoint failed");
  }

  return { source: "exchange_rates", data, errors };
}

// ─── 6. Numbeo (static dataset refresh check) ───

async function fetchNumbeo(): Promise<PipelineResult> {
  console.log("[Numbeo] Using static dataset (no live API without paid key)...");
  const data: SourceData = {};

  // Numbeo doesn't have a free API - we read from our static dataset
  // and flag that this source is static
  const cities = [
    { city: "Bandung", idx: 20.5 },
    { city: "Jakarta", idx: 27.3 },
    { city: "Singapore", idx: 82.4 },
    { city: "New York", idx: 100.0 },
    { city: "London", idx: 88.4 },
    { city: "Tokyo", idx: 78.6 },
    { city: "Berlin", idx: 70.3 },
    { city: "Sydney", idx: 88.6 },
    { city: "Dubai", idx: 73.8 },
    { city: "Bangkok", idx: 39.2 },
    { city: "Paris", idx: 82.7 },
    { city: "Milan", idx: 72.3 },
    { city: "Seoul", idx: 72.4 },
    { city: "Mumbai", idx: 26.4 },
    { city: "Sao Paulo", idx: 42.6 },
    { city: "Mexico City", idx: 38.4 },
    { city: "Istanbul", idx: 38.6 },
    { city: "Warsaw", idx: 52.6 },
    { city: "Toronto", idx: 76.4 },
    { city: "San Francisco", idx: 104.6 },
    { city: "Zurich", idx: 118.4 },
    { city: "Copenhagen", idx: 94.6 },
    { city: "Hong Kong", idx: 84.7 },
    { city: "Amsterdam", idx: 78.6 },
    { city: "Vienna", idx: 76.4 },
    { city: "Lisbon", idx: 58.4 },
    { city: "Buenos Aires", idx: 34.7 },
    { city: "Cairo", idx: 22.4 },
    { city: "Nairobi", idx: 31.5 },
    { city: "Lagos", idx: 28.7 },
  ];

  for (const c of cities) {
    data[`cost_of_living_${c.city.toLowerCase().replace(/\s+/g, "_")}`] = c.idx;
  }

  return { source: "numbeo", data, errors: ["Static dataset (no free API - update manually from numbeo.com)"] };
}

// ─── 7. REST Countries ───

async function fetchRESTCountries(): Promise<PipelineResult> {
  console.log("[REST Countries] Fetching country metadata...");
  const errors: string[] = [];
  const data: SourceData = {};

  const url = "https://restcountries.com/v3.1/all?fields=name,cca3,population,region,subregion,currencies,languages";
  const res = await safeFetch(url);
  if (res) {
    try {
      const json = (await res.json()) as Array<{
        name: { common: string };
        cca3: string;
        population: number;
        region: string;
      }>;
      // Just store top-level counts per region
      const regionCounts: Record<string, number> = {};
      let totalPop = 0;
      for (const c of json) {
        regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
        totalPop += c.population || 0;
      }
      data.total_countries = json.length;
      data.world_population = round(totalPop, 0);
      for (const [region, count] of Object.entries(regionCounts)) {
        data[`countries_in_${region.toLowerCase().replace(/\s+/g, "_")}`] = count;
      }
    } catch (e) {
      errors.push(`Parse error: ${(e as Error).message}`);
    }
  } else {
    errors.push("REST Countries endpoint failed");
  }

  return { source: "rest_countries", data, errors };
}

// ─── Diff computation ───

function computeDiff(
  oldSources: Record<string, SourceData>,
  newResults: PipelineResult[]
): { changes: DiffEntry[]; noChange: DiffEntry[]; allErrors: { source: string; error: string }[] } {
  const changes: DiffEntry[] = [];
  const noChange: DiffEntry[] = [];
  const allErrors: { source: string; error: string }[] = [];

  for (const result of newResults) {
    const oldData = oldSources[result.source] || {};

    for (const [key, newVal] of Object.entries(result.data)) {
      const oldVal = oldData[key] ?? null;
      if (oldVal === null || oldVal !== newVal) {
        changes.push({ key, source: result.source, oldValue: oldVal, newValue: newVal });
      } else {
        noChange.push({ key, source: result.source, oldValue: oldVal, newValue: newVal });
      }
    }

    for (const err of result.errors) {
      allErrors.push({ source: result.source, error: err });
    }
  }

  return { changes, noChange, allErrors };
}

// ─── Report generation ───

function generateReport(
  changes: DiffEntry[],
  noChange: DiffEntry[],
  allErrors: { source: string; error: string }[],
  dateStr: string
): string {
  const lines: string[] = [
    `# Pipeline Report ${dateStr}`,
    "",
    `Run at: ${new Date().toISOString()}`,
    "",
  ];

  // Changes
  lines.push(`## Changes (${changes.length})`);
  if (changes.length === 0) {
    lines.push("No changes detected.");
  } else {
    for (const c of changes) {
      const oldStr = c.oldValue === null ? "N/A" : String(c.oldValue);
      const newStr = String(c.newValue);
      lines.push(`- **${c.key}**: ${oldStr} -> ${newStr} (source: ${c.source})`);
    }
  }
  lines.push("");

  // No Change
  lines.push(`## No Change (${noChange.length})`);
  if (noChange.length > 20) {
    lines.push(`${noChange.length} values unchanged (showing first 20):`);
    for (const c of noChange.slice(0, 20)) {
      lines.push(`- ${c.key}: ${c.newValue} (${c.source})`);
    }
    lines.push(`- ... and ${noChange.length - 20} more`);
  } else if (noChange.length === 0) {
    lines.push("(first run or all values changed)");
  } else {
    for (const c of noChange) {
      lines.push(`- ${c.key}: ${c.newValue} (${c.source})`);
    }
  }
  lines.push("");

  // Errors
  lines.push(`## Errors (${allErrors.length})`);
  if (allErrors.length === 0) {
    lines.push("No errors.");
  } else {
    for (const e of allErrors) {
      lines.push(`- **${e.source}**: ${e.error}`);
    }
  }
  lines.push("");

  return lines.join("\n");
}

// ─── Main ───

async function main() {
  console.log("=== Simulator v2 Data Update Pipeline ===");
  console.log(`Date: ${today()}`);
  console.log(`Flags: reindex=${FLAGS.reindex}, dryRun=${FLAGS.dryRun}`);
  console.log("");

  // Load existing data
  let existingSources: Record<string, SourceData> = {};
  if (fs.existsSync(REAL_PROB_PATH)) {
    try {
      const raw = JSON.parse(fs.readFileSync(REAL_PROB_PATH, "utf8"));
      existingSources = raw.sources || {};
    } catch {
      console.warn("[WARN] Could not parse existing real-probabilities.json, starting fresh");
    }
  }

  // Fetch all APIs (sequential with rate limiting between each API)
  const results: PipelineResult[] = [];

  const fetchers = [
    fetchEurostat,
    fetchFred,
    fetchWorldBank,
    fetchCoinGecko,
    fetchExchangeRates,
    fetchNumbeo,
    fetchRESTCountries,
  ];

  for (const fetcher of fetchers) {
    try {
      const result = await fetcher();
      results.push(result);
      console.log(`  -> ${Object.keys(result.data).length} data points, ${result.errors.length} errors`);
    } catch (err) {
      console.error(`  [FATAL] ${fetcher.name}: ${(err as Error).message}`);
      results.push({ source: fetcher.name.replace("fetch", "").toLowerCase(), data: {}, errors: [(err as Error).message] });
    }
    await sleep(500); // pause between APIs
  }

  console.log("");

  // Compute diff
  const { changes, noChange, allErrors } = computeDiff(existingSources, results);

  console.log(`Changes: ${changes.length} | Unchanged: ${noChange.length} | Errors: ${allErrors.length}`);

  // Build new sources object
  const newSources: Record<string, SourceData> = { ...existingSources };
  for (const result of results) {
    if (Object.keys(result.data).length > 0) {
      newSources[result.source] = { ...newSources[result.source], ...result.data };
    }
  }

  // Write updated real-probabilities.json
  if (!FLAGS.dryRun) {
    // Preserve existing real-probabilities.json structure, only update the sources key
    let existingJson: Record<string, unknown> = {};
    if (fs.existsSync(REAL_PROB_PATH)) {
      try {
        existingJson = JSON.parse(fs.readFileSync(REAL_PROB_PATH, "utf8"));
      } catch {
        existingJson = {};
      }
    }

    // Add/update the pipeline sources without touching existing probability data
    existingJson.lastUpdated = new Date().toISOString();
    existingJson.pipelineSources = newSources;

    fs.writeFileSync(REAL_PROB_PATH, JSON.stringify(existingJson, null, 2));
    console.log(`[OK] Updated ${REAL_PROB_PATH}`);

    // Write report
    const dateStr = today();
    if (!fs.existsSync(REPORT_DIR)) {
      fs.mkdirSync(REPORT_DIR, { recursive: true });
    }
    const reportPath = path.join(REPORT_DIR, `${dateStr}.md`);
    const report = generateReport(changes, noChange, allErrors, dateStr);
    fs.writeFileSync(reportPath, report);
    console.log(`[OK] Report written to ${reportPath}`);
  } else {
    console.log("[DRY RUN] No files written.");
    const report = generateReport(changes, noChange, allErrors, today());
    console.log("\n--- Report Preview ---");
    console.log(report);
  }

  // Optional: trigger re-indexing
  if (FLAGS.reindex && !FLAGS.dryRun) {
    console.log("\n[Reindex] Triggering /api/index-data...");
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      const cronSecret = process.env.CRON_SECRET || "";
      const res = await fetch(`${baseUrl}/api/index-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
        },
      });
      if (res.ok) {
        const json = await res.json();
        console.log(`[Reindex] Success:`, json);
      } else {
        console.error(`[Reindex] Failed: HTTP ${res.status}`);
      }
    } catch (err) {
      console.error(`[Reindex] Error: ${(err as Error).message}`);
    }
  }

  // Summary
  console.log("\n=== Pipeline Complete ===");
  const totalDataPoints = results.reduce((sum, r) => sum + Object.keys(r.data).length, 0);
  console.log(`Total data points fetched: ${totalDataPoints}`);
  console.log(`Sources updated: ${results.filter((r) => Object.keys(r.data).length > 0).length}/${results.length}`);
  if (allErrors.length > 0) {
    console.log(`Warnings/Errors: ${allErrors.length} (see report for details)`);
  }
}

main().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
