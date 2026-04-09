/**
 * REST Countries + CoinGecko Data Downloader
 *
 * PART 1: Detailed country info for 21 priority countries
 *   API: https://restcountries.com/v3.1/alpha/{code}
 *   Output: data/cultural/restcountries/countries-21.json
 *
 * PART 2: Top 20 cryptocurrency market data
 *   API: https://api.coingecko.com/api/v3/coins/{id}
 *        https://api.coingecko.com/api/v3/coins/{id}/market_chart
 *   Output: data/cultural/coingecko/crypto-top20.json
 *
 * Usage: node scripts/api-restcountries-coingecko.mjs
 * No external deps, no API key required.
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DELAY_MS = 300;

const COUNTRIES_21 = [
  { code: 'ID', name: 'Indonesia' },
  { code: 'IT', name: 'Italy' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'AU', name: 'Australia' },
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PL', name: 'Poland' },
  { code: 'FI', name: 'Finland' },
];

const CRYPTO_IDS = [
  { id: 'bitcoin',           symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum',          symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether',            symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin',       symbol: 'BNB', name: 'BNB' },
  { id: 'solana',            symbol: 'SOL', name: 'Solana' },
  { id: 'ripple',            symbol: 'XRP', name: 'XRP' },
  { id: 'cardano',           symbol: 'ADA', name: 'Cardano' },
  { id: 'dogecoin',          symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'polkadot',          symbol: 'DOT', name: 'Polkadot' },
  { id: 'avalanche-2',       symbol: 'AVAX', name: 'Avalanche' },
  { id: 'chainlink',         symbol: 'LINK', name: 'Chainlink' },
  { id: 'matic-network',     symbol: 'MATIC', name: 'Polygon' },
  { id: 'litecoin',          symbol: 'LTC', name: 'Litecoin' },
  { id: 'uniswap',           symbol: 'UNI', name: 'Uniswap' },
  { id: 'stellar',           symbol: 'XLM', name: 'Stellar' },
  { id: 'monero',            symbol: 'XMR', name: 'Monero' },
  { id: 'cosmos',            symbol: 'ATOM', name: 'Cosmos' },
  { id: 'filecoin',          symbol: 'FIL', name: 'Filecoin' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
  { id: 'vechain',           symbol: 'VET', name: 'VeChain' },
];

// ---------------------------------------------------------------------------
// HTTP helper — pure Node https, no deps
// ---------------------------------------------------------------------------
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ForesightSimulator/1.0 (data-pipeline)',
      },
    };

    https.get(url, options, (res) => {
      if (res.statusCode === 429) {
        reject(new Error(`Rate limited (429) for ${url}`));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }

      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fmt(n) {
  if (n === null || n === undefined) return 'N/A';
  if (typeof n === 'number') {
    if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (Math.abs(n) >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
    if (Math.abs(n) >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
    if (Math.abs(n) >= 1e3)  return n.toLocaleString('en-US');
    return String(n);
  }
  return String(n);
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// PART 1 — REST Countries
// ---------------------------------------------------------------------------
async function fetchCountry(code, name) {
  const url = `https://restcountries.com/v3.1/alpha/${code.toLowerCase()}`;
  const data = await fetchJson(url);
  const c = Array.isArray(data) ? data[0] : data;
  return { code, name, raw: c };
}

function buildCountryDataPoints(code, name, c) {
  const dps = [];
  const src = 'REST Countries';
  const year = 2024;

  const push = (metric, value, context) => {
    if (value === null || value === undefined) return;
    dps.push({ context, country: name, countryCode: code, metric, value, year, source: src });
  };

  // Population
  const pop = c.population ?? null;
  push('population', pop,
    `${name} has a population of ${fmt(pop)} people (${year}).`);

  // Area
  const area = c.area ?? null;
  push('area_km2', area,
    `${name} covers an area of ${fmt(area)} km2.`);

  // Population density (calculated)
  if (pop && area && area > 0) {
    const density = Math.round((pop / area) * 100) / 100;
    push('population_density_per_km2', density,
      `${name} has a population density of ${density} people per km2.`);
  }

  // Capital
  const capital = c.capital ? c.capital.join(', ') : null;
  push('capital_city', capital,
    `The capital city of ${name} is ${capital}.`);

  // Region / subregion
  const region = c.region ?? null;
  const subregion = c.subregion ?? null;
  push('region', region,
    `${name} is located in the ${region} region${subregion ? `, subregion: ${subregion}` : ''}.`);
  if (subregion) {
    push('subregion', subregion,
      `${name} belongs to the ${subregion} subregion of ${region}.`);
  }

  // Continents
  const continents = c.continents ? c.continents.join(', ') : null;
  push('continents', continents,
    `${name} is located on the following continent(s): ${continents}.`);

  // Languages
  const langs = c.languages ? Object.values(c.languages).join(', ') : null;
  push('languages', langs,
    `Official languages spoken in ${name}: ${langs}.`);

  // Currencies
  if (c.currencies) {
    const currArr = Object.entries(c.currencies).map(([currCode, curr]) =>
      `${curr.name} (${currCode}${curr.symbol ? ', symbol: ' + curr.symbol : ''})`
    );
    const currStr = currArr.join('; ');
    push('currencies', currStr,
      `${name} uses the following currency/currencies: ${currStr}.`);
  }

  // Timezones
  const timezones = c.timezones ? c.timezones.join(', ') : null;
  push('timezones', timezones,
    `${name} operates in the following timezone(s): ${timezones}.`);

  // Calling code (IDD root + suffixes)
  if (c.idd && c.idd.root) {
    const suffixes = c.idd.suffixes ? c.idd.suffixes.join(', ') : '';
    const callingCode = c.idd.root + (c.idd.suffixes && c.idd.suffixes.length === 1 ? c.idd.suffixes[0] : '');
    push('calling_code', callingCode || c.idd.root,
      `The international calling code for ${name} is ${callingCode || c.idd.root}.`);
  }

  // Borders
  if (c.borders && c.borders.length > 0) {
    const borders = c.borders.join(', ');
    push('border_countries', borders,
      `${name} shares land borders with the following countries (ISO3): ${borders}.`);
    push('border_count', c.borders.length,
      `${name} borders ${c.borders.length} countries.`);
  } else {
    push('border_countries', 'None',
      `${name} has no land borders (island nation or enclave).`);
    push('border_count', 0,
      `${name} has 0 land borders.`);
  }

  // Gini coefficient
  if (c.gini) {
    const giniEntries = Object.entries(c.gini);
    if (giniEntries.length > 0) {
      const [giniYear, giniVal] = giniEntries.sort((a, b) => b[0] - a[0])[0];
      push('gini_coefficient', giniVal,
        `${name} has a Gini coefficient of ${giniVal} (${giniYear}), measuring income inequality (0=perfect equality, 100=maximum inequality).`);
    }
  }

  // UN member
  const unMember = c.unMember ?? null;
  push('un_member', unMember,
    `${name} is ${unMember ? 'a' : 'not a'} member of the United Nations.`);

  // Landlocked
  const landlocked = c.landlocked ?? null;
  push('landlocked', landlocked,
    `${name} is ${landlocked ? 'landlocked (no direct sea access)' : 'not landlocked (has sea access)'}.`);

  // Driving side
  const drivingSide = c.car?.side ?? null;
  push('driving_side', drivingSide,
    `In ${name}, people drive on the ${drivingSide} side of the road.`);

  // Start of week
  const startOfWeek = c.startOfWeek ?? null;
  push('start_of_week', startOfWeek,
    `The working week in ${name} starts on ${startOfWeek}.`);

  // Flag emoji
  const flagEmoji = c.flag ?? null;
  if (flagEmoji) {
    push('flag_emoji', flagEmoji,
      `The flag emoji for ${name} is ${flagEmoji} (${c.flags?.alt ?? 'national flag'}).`);
  }

  // Flag description (alt text)
  const flagAlt = c.flags?.alt ?? null;
  if (flagAlt) {
    push('flag_description', flagAlt,
      `Flag of ${name}: ${flagAlt}`);
  }

  return dps;
}

async function runRestCountries() {
  console.log('\n=== PART 1: REST Countries (21 countries) ===\n');

  const OUTPUT_DIR = path.join(ROOT, 'data/cultural/restcountries');
  ensureDir(OUTPUT_DIR);

  const allDataPoints = [];
  let idx = 0;

  for (const { code, name } of COUNTRIES_21) {
    idx++;
    try {
      const { raw } = await fetchCountry(code, name);
      const dps = buildCountryDataPoints(code, name, raw);
      allDataPoints.push(...dps);
      console.log(`[${idx}/${COUNTRIES_21.length}] ${name} (${code}) — ${dps.length} data points`);
    } catch (err) {
      console.error(`[${idx}/${COUNTRIES_21.length}] ERROR ${name} (${code}): ${err.message}`);
    }

    if (idx < COUNTRIES_21.length) await sleep(DELAY_MS);
  }

  const output = {
    metadata: {
      title: 'REST Countries — 21 Priority Countries',
      description: 'Detailed country information for the 21 priority countries used in Foresight Simulator',
      countries: COUNTRIES_21.map((c) => c.name),
      countryCodes: COUNTRIES_21.map((c) => c.code),
      source: 'REST Countries API v3.1',
      sourceUrl: 'https://restcountries.com/v3.1/',
      totalDataPoints: allDataPoints.length,
      generatedAt: new Date().toISOString(),
    },
    dataPoints: allDataPoints,
  };

  const outPath = path.join(OUTPUT_DIR, 'countries-21.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\nREST Countries done.`);
  console.log(`  Countries processed: ${COUNTRIES_21.length}`);
  console.log(`  Total data points:   ${allDataPoints.length}`);
  console.log(`  Saved to:            ${outPath}\n`);

  return allDataPoints.length;
}

// ---------------------------------------------------------------------------
// PART 2 — CoinGecko
// ---------------------------------------------------------------------------
async function fetchCoinDetail(coinId) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
  return fetchJson(url);
}

async function fetchCoinMarketChart(coinId) {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=365&interval=daily`;
  return fetchJson(url);
}

function buildCryptoDataPoints(coinDef, detail, chart) {
  const dps = [];
  const src = 'CoinGecko';
  const year = 2024;
  const { name, symbol } = coinDef;
  const country = 'Global';
  const countryCode = 'GLOBAL';

  const push = (metric, value, context) => {
    if (value === null || value === undefined) return;
    dps.push({ context, country, countryCode, metric, value, year, source: src });
  };

  const md = detail?.market_data ?? {};
  const currPrice = md.current_price?.usd ?? null;
  const marketCap  = md.market_cap?.usd ?? null;
  const volume24h  = md.total_volume?.usd ?? null;
  const ath         = md.ath?.usd ?? null;
  const athDate     = md.ath_date?.usd ? md.ath_date.usd.split('T')[0] : null;
  const atl         = md.atl?.usd ?? null;
  const atlDate     = md.atl_date?.usd ? md.atl_date.usd.split('T')[0] : null;
  const priceChange1y = md.price_change_percentage_1y ?? null;
  const priceChange24h = md.price_change_percentage_24h ?? null;
  const priceChange7d  = md.price_change_percentage_7d ?? null;
  const priceChange30d = md.price_change_percentage_30d ?? null;
  const circulatingSupply = md.circulating_supply ?? null;
  const totalSupply       = md.total_supply ?? null;
  const maxSupply         = md.max_supply ?? null;
  const marketCapRank     = detail?.market_cap_rank ?? null;

  // Current price
  push(`crypto_${symbol.toLowerCase()}_price`,
    currPrice,
    `${name} (${symbol}) current price is $${fmt(currPrice)} USD.`);

  // Market cap
  push(`crypto_${symbol.toLowerCase()}_market_cap`,
    marketCap,
    `${name} (${symbol}) market capitalization is $${fmt(marketCap)} USD.`);

  // 24h volume
  push(`crypto_${symbol.toLowerCase()}_volume_24h`,
    volume24h,
    `${name} (${symbol}) 24-hour trading volume is $${fmt(volume24h)} USD.`);

  // ATH
  if (ath && athDate) {
    push(`crypto_${symbol.toLowerCase()}_ath`,
      ath,
      `${name} (${symbol}) all-time high was $${fmt(ath)} USD on ${athDate}.`);
  }

  // ATL
  if (atl && atlDate) {
    push(`crypto_${symbol.toLowerCase()}_atl`,
      atl,
      `${name} (${symbol}) all-time low was $${fmt(atl)} USD on ${atlDate}.`);
  }

  // Price changes
  if (priceChange24h !== null) {
    push(`crypto_${symbol.toLowerCase()}_price_change_24h_pct`,
      Math.round(priceChange24h * 100) / 100,
      `${name} (${symbol}) price changed ${priceChange24h.toFixed(2)}% in the last 24 hours.`);
  }
  if (priceChange7d !== null) {
    push(`crypto_${symbol.toLowerCase()}_price_change_7d_pct`,
      Math.round(priceChange7d * 100) / 100,
      `${name} (${symbol}) price changed ${priceChange7d.toFixed(2)}% over the last 7 days.`);
  }
  if (priceChange30d !== null) {
    push(`crypto_${symbol.toLowerCase()}_price_change_30d_pct`,
      Math.round(priceChange30d * 100) / 100,
      `${name} (${symbol}) price changed ${priceChange30d.toFixed(2)}% over the last 30 days.`);
  }
  if (priceChange1y !== null) {
    push(`crypto_${symbol.toLowerCase()}_price_change_1y_pct`,
      Math.round(priceChange1y * 100) / 100,
      `${name} (${symbol}) price changed ${priceChange1y.toFixed(2)}% over the last year.`);
  }

  // Circulating supply
  push(`crypto_${symbol.toLowerCase()}_circulating_supply`,
    circulatingSupply,
    `${name} (${symbol}) circulating supply is ${fmt(circulatingSupply)} coins.`);

  // Total supply
  if (totalSupply) {
    push(`crypto_${symbol.toLowerCase()}_total_supply`,
      totalSupply,
      `${name} (${symbol}) total supply is ${fmt(totalSupply)} coins.`);
  }

  // Max supply (hard cap)
  if (maxSupply) {
    push(`crypto_${symbol.toLowerCase()}_max_supply`,
      maxSupply,
      `${name} (${symbol}) has a maximum hard-capped supply of ${fmt(maxSupply)} coins.`);
  }

  // Market cap rank
  if (marketCapRank) {
    push(`crypto_${symbol.toLowerCase()}_market_cap_rank`,
      marketCapRank,
      `${name} (${symbol}) is ranked #${marketCapRank} by market capitalization globally.`);
  }

  // 1-year price history summary (from market chart)
  if (chart?.prices && chart.prices.length > 0) {
    const prices = chart.prices.map(([, p]) => p);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const realReturn = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : null;

    push(`crypto_${symbol.toLowerCase()}_1y_min_price`,
      Math.round(minPrice * 100) / 100,
      `${name} (${symbol}) 1-year minimum price was $${fmt(minPrice)} USD.`);

    push(`crypto_${symbol.toLowerCase()}_1y_max_price`,
      Math.round(maxPrice * 100) / 100,
      `${name} (${symbol}) 1-year maximum price was $${fmt(maxPrice)} USD.`);

    push(`crypto_${symbol.toLowerCase()}_1y_avg_price`,
      Math.round(avgPrice * 100) / 100,
      `${name} (${symbol}) 1-year average price was $${fmt(avgPrice)} USD.`);

    if (realReturn !== null) {
      push(`crypto_${symbol.toLowerCase()}_1y_return_pct`,
        Math.round(realReturn * 100) / 100,
        `${name} (${symbol}) delivered a ${realReturn.toFixed(2)}% return over the last year (based on daily close prices).`);
    }
  }

  return dps;
}

async function runCoinGecko() {
  console.log('\n=== PART 2: CoinGecko (top 20 cryptocurrencies) ===\n');

  const OUTPUT_DIR = path.join(ROOT, 'data/cultural/coingecko');
  ensureDir(OUTPUT_DIR);

  const allDataPoints = [];
  let idx = 0;

  for (const coinDef of CRYPTO_IDS) {
    idx++;
    try {
      console.log(`[${idx}/${CRYPTO_IDS.length}] Fetching ${coinDef.name} (${coinDef.symbol})...`);

      // Fetch detail first
      const detail = await fetchCoinDetail(coinDef.id);
      await sleep(DELAY_MS);

      // Fetch market chart
      let chart = null;
      try {
        chart = await fetchCoinMarketChart(coinDef.id);
      } catch (chartErr) {
        console.warn(`  WARNING: Could not fetch market chart for ${coinDef.name}: ${chartErr.message}`);
      }
      if (chart) await sleep(DELAY_MS);

      const dps = buildCryptoDataPoints(coinDef, detail, chart);
      allDataPoints.push(...dps);
      console.log(`  -> ${dps.length} data points generated`);
    } catch (err) {
      console.error(`[${idx}/${CRYPTO_IDS.length}] ERROR ${coinDef.name}: ${err.message}`);
      // Still delay to avoid hammering the rate limit
      await sleep(DELAY_MS * 2);
    }

    // Extra delay between coins (CoinGecko free tier: 10-30 req/min)
    if (idx < CRYPTO_IDS.length) await sleep(DELAY_MS);
  }

  const output = {
    metadata: {
      title: 'CoinGecko — Top 20 Cryptocurrencies',
      description: 'Current market data and 1-year price history for top 20 cryptocurrencies',
      coins: CRYPTO_IDS.map((c) => `${c.name} (${c.symbol})`),
      source: 'CoinGecko API v3 (free, no key)',
      sourceUrl: 'https://api.coingecko.com/api/v3/',
      totalDataPoints: allDataPoints.length,
      generatedAt: new Date().toISOString(),
    },
    dataPoints: allDataPoints,
  };

  const outPath = path.join(OUTPUT_DIR, 'crypto-top20.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\nCoinGecko done.`);
  console.log(`  Coins processed:   ${CRYPTO_IDS.length}`);
  console.log(`  Total data points: ${allDataPoints.length}`);
  console.log(`  Saved to:          ${outPath}\n`);

  return allDataPoints.length;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=========================================');
  console.log(' REST Countries + CoinGecko Downloader  ');
  console.log('=========================================');

  const t0 = Date.now();

  const dp1 = await runRestCountries();
  const dp2 = await runCoinGecko();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('=========================================');
  console.log(` COMPLETE`);
  console.log(`  REST Countries: ${dp1} data points`);
  console.log(`  CoinGecko:      ${dp2} data points`);
  console.log(`  TOTAL:          ${dp1 + dp2} data points`);
  console.log(`  Time:           ${elapsed}s`);
  console.log('=========================================');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
