/**
 * Numbeo Cost of Living API Client
 * Uses static dataset of 2024-2025 Numbeo indices (NYC = 100 baseline)
 * Source: Numbeo.com public indices, approximated for 2024
 */

export interface NumbeoEntry {
  city: string;
  country: string;
  region: string;
  costOfLivingIndex: number;
  rentIndex: number;
  restaurantPriceIndex: number;
  groceriesIndex: number;
  purchasingPowerIndex: number;
  source: string;
  year: number;
}

// All indices normalized to NYC = 100
const NUMBEO_DATASET: NumbeoEntry[] = [
  // Southeast Asia
  {
    city: "Bandung",
    country: "Indonesia",
    region: "Southeast Asia",
    costOfLivingIndex: 20.5,
    rentIndex: 8.2,
    restaurantPriceIndex: 16.8,
    groceriesIndex: 22.1,
    purchasingPowerIndex: 28.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Jakarta",
    country: "Indonesia",
    region: "Southeast Asia",
    costOfLivingIndex: 27.3,
    rentIndex: 15.6,
    restaurantPriceIndex: 22.4,
    groceriesIndex: 28.7,
    purchasingPowerIndex: 42.1,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Singapore",
    country: "Singapore",
    region: "Southeast Asia",
    costOfLivingIndex: 82.4,
    rentIndex: 88.6,
    restaurantPriceIndex: 65.3,
    groceriesIndex: 72.1,
    purchasingPowerIndex: 118.5,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Bangkok",
    country: "Thailand",
    region: "Southeast Asia",
    costOfLivingIndex: 39.2,
    rentIndex: 25.4,
    restaurantPriceIndex: 30.7,
    groceriesIndex: 40.5,
    purchasingPowerIndex: 52.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Ho Chi Minh City",
    country: "Vietnam",
    region: "Southeast Asia",
    costOfLivingIndex: 32.8,
    rentIndex: 18.9,
    restaurantPriceIndex: 25.6,
    groceriesIndex: 34.2,
    purchasingPowerIndex: 38.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Kuala Lumpur",
    country: "Malaysia",
    region: "Southeast Asia",
    costOfLivingIndex: 36.5,
    rentIndex: 22.3,
    restaurantPriceIndex: 28.9,
    groceriesIndex: 38.4,
    purchasingPowerIndex: 58.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Manila",
    country: "Philippines",
    region: "Southeast Asia",
    costOfLivingIndex: 30.1,
    rentIndex: 16.7,
    restaurantPriceIndex: 24.3,
    groceriesIndex: 31.8,
    purchasingPowerIndex: 34.5,
    source: "Numbeo 2024",
    year: 2024,
  },
  // East Asia
  {
    city: "Tokyo",
    country: "Japan",
    region: "East Asia",
    costOfLivingIndex: 78.6,
    rentIndex: 45.2,
    restaurantPriceIndex: 70.4,
    groceriesIndex: 82.3,
    purchasingPowerIndex: 92.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Seoul",
    country: "South Korea",
    region: "East Asia",
    costOfLivingIndex: 72.4,
    rentIndex: 52.8,
    restaurantPriceIndex: 58.6,
    groceriesIndex: 68.9,
    purchasingPowerIndex: 96.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Shanghai",
    country: "China",
    region: "East Asia",
    costOfLivingIndex: 58.3,
    rentIndex: 48.7,
    restaurantPriceIndex: 44.2,
    groceriesIndex: 52.6,
    purchasingPowerIndex: 74.8,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Beijing",
    country: "China",
    region: "East Asia",
    costOfLivingIndex: 55.7,
    rentIndex: 46.3,
    restaurantPriceIndex: 42.8,
    groceriesIndex: 50.1,
    purchasingPowerIndex: 71.2,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Hong Kong",
    country: "Hong Kong",
    region: "East Asia",
    costOfLivingIndex: 84.7,
    rentIndex: 98.4,
    restaurantPriceIndex: 68.5,
    groceriesIndex: 78.2,
    purchasingPowerIndex: 87.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Taipei",
    country: "Taiwan",
    region: "East Asia",
    costOfLivingIndex: 62.1,
    rentIndex: 38.5,
    restaurantPriceIndex: 48.7,
    groceriesIndex: 58.3,
    purchasingPowerIndex: 88.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  // South Asia
  {
    city: "Mumbai",
    country: "India",
    region: "South Asia",
    costOfLivingIndex: 26.4,
    rentIndex: 18.3,
    restaurantPriceIndex: 20.7,
    groceriesIndex: 24.8,
    purchasingPowerIndex: 35.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Delhi",
    country: "India",
    region: "South Asia",
    costOfLivingIndex: 22.8,
    rentIndex: 13.6,
    restaurantPriceIndex: 18.4,
    groceriesIndex: 21.3,
    purchasingPowerIndex: 32.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Middle East
  {
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    costOfLivingIndex: 73.8,
    rentIndex: 82.4,
    restaurantPriceIndex: 62.5,
    groceriesIndex: 65.3,
    purchasingPowerIndex: 112.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Istanbul",
    country: "Turkey",
    region: "Middle East",
    costOfLivingIndex: 38.6,
    rentIndex: 24.7,
    restaurantPriceIndex: 32.4,
    groceriesIndex: 36.8,
    purchasingPowerIndex: 44.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Africa
  {
    city: "Cairo",
    country: "Egypt",
    region: "Africa",
    costOfLivingIndex: 22.4,
    rentIndex: 12.8,
    restaurantPriceIndex: 18.6,
    groceriesIndex: 20.3,
    purchasingPowerIndex: 26.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Nairobi",
    country: "Kenya",
    region: "Africa",
    costOfLivingIndex: 31.5,
    rentIndex: 18.4,
    restaurantPriceIndex: 26.3,
    groceriesIndex: 29.7,
    purchasingPowerIndex: 24.8,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Lagos",
    country: "Nigeria",
    region: "Africa",
    costOfLivingIndex: 28.7,
    rentIndex: 15.6,
    restaurantPriceIndex: 23.4,
    groceriesIndex: 27.2,
    purchasingPowerIndex: 21.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Western Europe
  {
    city: "London",
    country: "United Kingdom",
    region: "Western Europe",
    costOfLivingIndex: 88.4,
    rentIndex: 82.6,
    restaurantPriceIndex: 82.3,
    groceriesIndex: 76.5,
    purchasingPowerIndex: 94.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Paris",
    country: "France",
    region: "Western Europe",
    costOfLivingIndex: 82.7,
    rentIndex: 72.4,
    restaurantPriceIndex: 78.5,
    groceriesIndex: 74.3,
    purchasingPowerIndex: 86.2,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Berlin",
    country: "Germany",
    region: "Western Europe",
    costOfLivingIndex: 70.3,
    rentIndex: 58.6,
    restaurantPriceIndex: 68.4,
    groceriesIndex: 65.7,
    purchasingPowerIndex: 92.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Amsterdam",
    country: "Netherlands",
    region: "Western Europe",
    costOfLivingIndex: 78.6,
    rentIndex: 74.3,
    restaurantPriceIndex: 74.8,
    groceriesIndex: 70.2,
    purchasingPowerIndex: 96.8,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Barcelona",
    country: "Spain",
    region: "Western Europe",
    costOfLivingIndex: 63.4,
    rentIndex: 52.7,
    restaurantPriceIndex: 62.5,
    groceriesIndex: 58.3,
    purchasingPowerIndex: 74.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Madrid",
    country: "Spain",
    region: "Western Europe",
    costOfLivingIndex: 62.8,
    rentIndex: 50.4,
    restaurantPriceIndex: 61.7,
    groceriesIndex: 57.6,
    purchasingPowerIndex: 76.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Rome",
    country: "Italy",
    region: "Western Europe",
    costOfLivingIndex: 64.7,
    rentIndex: 48.3,
    restaurantPriceIndex: 64.2,
    groceriesIndex: 60.5,
    purchasingPowerIndex: 68.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Milan",
    country: "Italy",
    region: "Western Europe",
    costOfLivingIndex: 72.3,
    rentIndex: 62.8,
    restaurantPriceIndex: 68.5,
    groceriesIndex: 64.7,
    purchasingPowerIndex: 82.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Lisbon",
    country: "Portugal",
    region: "Western Europe",
    costOfLivingIndex: 58.4,
    rentIndex: 48.6,
    restaurantPriceIndex: 54.3,
    groceriesIndex: 52.7,
    purchasingPowerIndex: 64.8,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Central/Eastern Europe
  {
    city: "Warsaw",
    country: "Poland",
    region: "Central Europe",
    costOfLivingIndex: 52.6,
    rentIndex: 38.4,
    restaurantPriceIndex: 48.7,
    groceriesIndex: 49.3,
    purchasingPowerIndex: 72.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Prague",
    country: "Czech Republic",
    region: "Central Europe",
    costOfLivingIndex: 56.8,
    rentIndex: 42.3,
    restaurantPriceIndex: 52.4,
    groceriesIndex: 53.6,
    purchasingPowerIndex: 76.2,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Vienna",
    country: "Austria",
    region: "Central Europe",
    costOfLivingIndex: 76.4,
    rentIndex: 62.5,
    restaurantPriceIndex: 72.8,
    groceriesIndex: 69.3,
    purchasingPowerIndex: 94.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Northern Europe
  {
    city: "Zurich",
    country: "Switzerland",
    region: "Northern Europe",
    costOfLivingIndex: 118.4,
    rentIndex: 98.7,
    restaurantPriceIndex: 124.5,
    groceriesIndex: 112.3,
    purchasingPowerIndex: 148.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Stockholm",
    country: "Sweden",
    region: "Northern Europe",
    costOfLivingIndex: 82.3,
    rentIndex: 64.7,
    restaurantPriceIndex: 78.5,
    groceriesIndex: 72.4,
    purchasingPowerIndex: 104.8,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Copenhagen",
    country: "Denmark",
    region: "Northern Europe",
    costOfLivingIndex: 94.6,
    rentIndex: 72.3,
    restaurantPriceIndex: 92.4,
    groceriesIndex: 84.7,
    purchasingPowerIndex: 112.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Helsinki",
    country: "Finland",
    region: "Northern Europe",
    costOfLivingIndex: 86.4,
    rentIndex: 68.2,
    restaurantPriceIndex: 82.6,
    groceriesIndex: 76.5,
    purchasingPowerIndex: 98.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Oslo",
    country: "Norway",
    region: "Northern Europe",
    costOfLivingIndex: 104.3,
    rentIndex: 78.6,
    restaurantPriceIndex: 108.5,
    groceriesIndex: 96.4,
    purchasingPowerIndex: 124.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Dublin",
    country: "Ireland",
    region: "Northern Europe",
    costOfLivingIndex: 84.7,
    rentIndex: 88.3,
    restaurantPriceIndex: 82.4,
    groceriesIndex: 74.6,
    purchasingPowerIndex: 102.5,
    source: "Numbeo 2024",
    year: 2024,
  },
  // North America
  {
    city: "New York",
    country: "United States",
    region: "North America",
    costOfLivingIndex: 100.0,
    rentIndex: 100.0,
    restaurantPriceIndex: 100.0,
    groceriesIndex: 100.0,
    purchasingPowerIndex: 100.0,
    source: "Numbeo 2024 (baseline)",
    year: 2024,
  },
  {
    city: "San Francisco",
    country: "United States",
    region: "North America",
    costOfLivingIndex: 104.6,
    rentIndex: 136.4,
    restaurantPriceIndex: 98.7,
    groceriesIndex: 96.3,
    purchasingPowerIndex: 118.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Los Angeles",
    country: "United States",
    region: "North America",
    costOfLivingIndex: 92.4,
    rentIndex: 102.8,
    restaurantPriceIndex: 88.6,
    groceriesIndex: 86.4,
    purchasingPowerIndex: 96.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Chicago",
    country: "United States",
    region: "North America",
    costOfLivingIndex: 82.6,
    rentIndex: 74.3,
    restaurantPriceIndex: 80.4,
    groceriesIndex: 78.5,
    purchasingPowerIndex: 94.2,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Miami",
    country: "United States",
    region: "North America",
    costOfLivingIndex: 86.3,
    rentIndex: 88.7,
    restaurantPriceIndex: 82.5,
    groceriesIndex: 80.4,
    purchasingPowerIndex: 88.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Austin",
    country: "United States",
    region: "North America",
    costOfLivingIndex: 74.8,
    rentIndex: 72.6,
    restaurantPriceIndex: 72.3,
    groceriesIndex: 72.8,
    purchasingPowerIndex: 102.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Toronto",
    country: "Canada",
    region: "North America",
    costOfLivingIndex: 76.4,
    rentIndex: 78.5,
    restaurantPriceIndex: 72.6,
    groceriesIndex: 70.3,
    purchasingPowerIndex: 84.7,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Vancouver",
    country: "Canada",
    region: "North America",
    costOfLivingIndex: 78.3,
    rentIndex: 82.4,
    restaurantPriceIndex: 74.5,
    groceriesIndex: 72.6,
    purchasingPowerIndex: 82.3,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Latin America
  {
    city: "Mexico City",
    country: "Mexico",
    region: "Latin America",
    costOfLivingIndex: 38.4,
    rentIndex: 22.7,
    restaurantPriceIndex: 32.6,
    groceriesIndex: 36.8,
    purchasingPowerIndex: 42.5,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Sao Paulo",
    country: "Brazil",
    region: "Latin America",
    costOfLivingIndex: 42.6,
    rentIndex: 24.8,
    restaurantPriceIndex: 36.4,
    groceriesIndex: 40.7,
    purchasingPowerIndex: 38.4,
    source: "Numbeo 2024",
    year: 2024,
  },
  {
    city: "Buenos Aires",
    country: "Argentina",
    region: "Latin America",
    costOfLivingIndex: 34.7,
    rentIndex: 16.3,
    restaurantPriceIndex: 28.5,
    groceriesIndex: 32.4,
    purchasingPowerIndex: 28.6,
    source: "Numbeo 2024",
    year: 2024,
  },
  // Oceania
  {
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
    costOfLivingIndex: 88.6,
    rentIndex: 82.4,
    restaurantPriceIndex: 86.3,
    groceriesIndex: 80.7,
    purchasingPowerIndex: 98.4,
    source: "Numbeo 2024",
    year: 2024,
  },
];

// Fuzzy match aliases for common city name variations
const CITY_ALIASES: Record<string, string> = {
  nyc: "New York",
  "new york city": "New York",
  ny: "New York",
  sf: "San Francisco",
  "san fran": "San Francisco",
  la: "Los Angeles",
  "los angeles": "Los Angeles",
  hcmc: "Ho Chi Minh City",
  saigon: "Ho Chi Minh City",
  "ho chi minh": "Ho Chi Minh City",
  kl: "Kuala Lumpur",
  hk: "Hong Kong",
  bkk: "Bangkok",
  sgp: "Singapore",
  jkt: "Jakarta",
  "sao paulo": "Sao Paulo",
  "são paulo": "Sao Paulo",
  "buenos aires": "Buenos Aires",
  "mexico city": "Mexico City",
  cdmx: "Mexico City",
  "new york, ny": "New York",
  "san francisco, ca": "San Francisco",
};

function normalizeCity(name: string): string {
  const lower = name.toLowerCase().trim();
  return CITY_ALIASES[lower] ?? name;
}

function fuzzyMatch(query: string, target: string): boolean {
  const q = query.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  return t === q || t.includes(q) || q.includes(t);
}

/**
 * Get cost of living data for a city by name.
 * Supports fuzzy matching and common aliases (e.g. "NYC" → "New York").
 */
export function getCostOfLiving(city: string): NumbeoEntry | null {
  const resolved = normalizeCity(city);
  return (
    NUMBEO_DATASET.find(
      (entry) =>
        fuzzyMatch(resolved, entry.city) ||
        fuzzyMatch(city, entry.city)
    ) ?? null
  );
}

/**
 * Get all cities in a given country.
 */
export function getCostByCountry(country: string): NumbeoEntry[] {
  const q = country.toLowerCase().trim();
  return NUMBEO_DATASET.filter((entry) =>
    entry.country.toLowerCase().includes(q)
  );
}

/**
 * Compare two cities across all cost indices.
 * Returns null if either city is not found.
 * comparison values represent city2 as % of city1 (>100 = city2 is more expensive).
 */
export function compareCities(
  city1: string,
  city2: string
): {
  city1: NumbeoEntry;
  city2: NumbeoEntry;
  comparison: Record<string, number>;
} | null {
  const c1 = getCostOfLiving(city1);
  const c2 = getCostOfLiving(city2);

  if (!c1 || !c2) return null;

  const keys: (keyof NumbeoEntry)[] = [
    "costOfLivingIndex",
    "rentIndex",
    "restaurantPriceIndex",
    "groceriesIndex",
    "purchasingPowerIndex",
  ];

  const comparison: Record<string, number> = {};
  for (const key of keys) {
    const v1 = c1[key] as number;
    const v2 = c2[key] as number;
    // Percentage difference: positive = city2 is more expensive/powerful
    comparison[key] = v1 > 0 ? Math.round(((v2 - v1) / v1) * 100 * 10) / 10 : 0;
  }

  return { city1: c1, city2: c2, comparison };
}

/**
 * Get the full dataset of all cities.
 */
export function getAllCities(): NumbeoEntry[] {
  return [...NUMBEO_DATASET];
}
