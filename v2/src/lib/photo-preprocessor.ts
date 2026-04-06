// Photo scenario preprocessor
// Strips visual descriptions from Claude Vision output and extracts
// business-relevant keywords for better RAG matching.

export interface PhotoKeywords {
  businessType: string;           // "cafe", "restaurant", "retail", etc.
  industry: string;               // "food & beverage", "retail", "tech"
  keywords: string[];             // ["coffee shop", "startup", "small business"]
  location?: string;              // detected from description
  estimatedBudget?: string;       // "low", "medium", "high"
  scenario: string;               // cleaned scenario text optimized for RAG matching
}

// ---- Visual cue -> business keyword mappings (50+) ----

interface CueMapping {
  cues: string[];
  businessType: string;
  industry: string;
  keywords: string[];
}

const CUE_MAPPINGS: CueMapping[] = [
  // F&B - Coffee
  { cues: ['coffee machine', 'espresso', 'barista', 'latte', 'cappuccino', 'coffee bean', 'coffee grinder', 'pour over', 'drip coffee', 'coffee roaster'],
    businessType: 'cafe', industry: 'food & beverage', keywords: ['coffee shop', 'cafe', 'F&B', 'beverage', 'hospitality'] },
  // F&B - Restaurant
  { cues: ['kitchen', 'chef', 'cooking', 'stove', 'oven', 'food prep', 'dining table', 'plates', 'cutlery', 'restaurant menu'],
    businessType: 'restaurant', industry: 'food & beverage', keywords: ['restaurant', 'food service', 'F&B', 'dining', 'hospitality'] },
  // F&B - Street food / market
  { cues: ['food stall', 'street food', 'food cart', 'warung', 'hawker', 'market stall', 'food vendor', 'takeaway'],
    businessType: 'food stall', industry: 'food & beverage', keywords: ['street food', 'food vendor', 'small business', 'micro enterprise'] },
  // F&B - Bakery
  { cues: ['bread', 'pastry', 'bakery', 'cake', 'dough', 'baking', 'oven', 'flour'],
    businessType: 'bakery', industry: 'food & beverage', keywords: ['bakery', 'pastry shop', 'baked goods', 'F&B'] },
  // F&B - Bar
  { cues: ['bar', 'cocktail', 'beer tap', 'wine', 'bottles', 'liquor', 'pub', 'bartender'],
    businessType: 'bar', industry: 'food & beverage', keywords: ['bar', 'nightlife', 'hospitality', 'alcohol', 'entertainment'] },
  // Retail - Fashion
  { cues: ['clothing rack', 'mannequin', 'price tags', 'fashion', 'garment', 'boutique', 'shoes', 'accessories', 'handbag', 'dress'],
    businessType: 'boutique', industry: 'retail', keywords: ['retail', 'fashion', 'boutique', 'clothing', 'apparel'] },
  // Retail - General
  { cues: ['store shelf', 'shopping', 'checkout', 'cash register', 'retail display', 'merchandise', 'shop window', 'storefront'],
    businessType: 'retail store', industry: 'retail', keywords: ['retail', 'store', 'commerce', 'brick and mortar', 'small business'] },
  // Retail - Grocery
  { cues: ['grocery', 'supermarket', 'produce', 'fruits', 'vegetables', 'aisle', 'shopping cart', 'minimarket'],
    businessType: 'grocery store', industry: 'retail', keywords: ['grocery', 'supermarket', 'FMCG', 'food retail'] },
  // Tech / Office
  { cues: ['laptop', 'whiteboard', 'meeting', 'office', 'computer', 'monitor', 'desk', 'coworking', 'startup', 'code'],
    businessType: 'tech startup', industry: 'technology', keywords: ['tech startup', 'SaaS', 'software', 'office', 'knowledge work'] },
  // Beauty / Personal care
  { cues: ['salon', 'mirror', 'hair', 'barber', 'beauty', 'makeup', 'nail', 'spa', 'scissors', 'styling'],
    businessType: 'salon', industry: 'personal services', keywords: ['beauty salon', 'barbershop', 'personal care', 'services'] },
  // Health / Fitness
  { cues: ['gym', 'weights', 'treadmill', 'fitness', 'exercise', 'yoga', 'workout', 'dumbbell'],
    businessType: 'gym', industry: 'health & fitness', keywords: ['gym', 'fitness center', 'health', 'wellness', 'sports'] },
  // Health / Medical
  { cues: ['clinic', 'doctor', 'hospital', 'medical', 'pharmacy', 'medicine', 'stethoscope', 'patient', 'dental'],
    businessType: 'clinic', industry: 'healthcare', keywords: ['healthcare', 'clinic', 'medical practice', 'health services'] },
  // Education
  { cues: ['classroom', 'school', 'teacher', 'students', 'books', 'library', 'university', 'lecture', 'blackboard', 'education'],
    businessType: 'school', industry: 'education', keywords: ['education', 'school', 'tutoring', 'learning', 'edtech'] },
  // Real estate
  { cues: ['apartment', 'building', 'construction', 'real estate', 'house', 'property', 'for sale', 'for rent', 'renovation'],
    businessType: 'real estate', industry: 'real estate', keywords: ['real estate', 'property', 'housing', 'construction', 'development'] },
  // Transportation
  { cues: ['taxi', 'ride', 'driver', 'car rental', 'fleet', 'delivery', 'truck', 'logistics', 'shipping', 'warehouse'],
    businessType: 'logistics', industry: 'transportation', keywords: ['logistics', 'transportation', 'delivery', 'fleet management', 'supply chain'] },
  // Agriculture
  { cues: ['farm', 'crop', 'harvest', 'agriculture', 'field', 'livestock', 'cattle', 'poultry', 'plantation', 'organic'],
    businessType: 'farm', industry: 'agriculture', keywords: ['agriculture', 'farming', 'agribusiness', 'crop production', 'livestock'] },
  // Manufacturing
  { cues: ['factory', 'machinery', 'assembly', 'production line', 'manufacturing', 'industrial', 'workshop', 'welding'],
    businessType: 'factory', industry: 'manufacturing', keywords: ['manufacturing', 'production', 'factory', 'industrial', 'supply chain'] },
  // Tourism / Hospitality
  { cues: ['hotel', 'resort', 'tourism', 'tourist', 'guest house', 'hostel', 'travel', 'suitcase', 'reception', 'lobby'],
    businessType: 'hotel', industry: 'hospitality', keywords: ['hotel', 'tourism', 'hospitality', 'accommodation', 'travel'] },
  // Automotive
  { cues: ['car', 'mechanic', 'auto repair', 'garage', 'car wash', 'tire', 'motor', 'vehicle', 'dealership'],
    businessType: 'auto shop', industry: 'automotive', keywords: ['automotive', 'car repair', 'auto services', 'vehicle maintenance'] },
  // Creative / Media
  { cues: ['camera', 'studio', 'photography', 'film', 'video', 'music', 'recording', 'microphone', 'instrument', 'stage'],
    businessType: 'creative studio', industry: 'media & entertainment', keywords: ['creative agency', 'media production', 'content creation', 'entertainment'] },
  // E-commerce / Digital
  { cues: ['package', 'shipping box', 'packing', 'label', 'fulfillment', 'inventory', 'online order'],
    businessType: 'e-commerce', industry: 'e-commerce', keywords: ['e-commerce', 'online retail', 'fulfillment', 'dropshipping', 'digital commerce'] },
  // Laundry / Cleaning
  { cues: ['laundry', 'washing machine', 'dryer', 'cleaning', 'detergent', 'ironing', 'dry clean'],
    businessType: 'laundry', industry: 'services', keywords: ['laundry service', 'cleaning service', 'household services'] },
  // Printing / Copying
  { cues: ['printer', 'printing', 'copy', 'photocopy', 'banner', 'signage', 'design'],
    businessType: 'print shop', industry: 'services', keywords: ['printing service', 'copy center', 'signage', 'design services'] },
  // Pet services
  { cues: ['pet', 'dog', 'cat', 'veterinary', 'vet', 'grooming', 'pet food', 'animal'],
    businessType: 'pet services', industry: 'pet care', keywords: ['pet care', 'veterinary', 'pet grooming', 'animal services'] },
  // Coworking / Shared space
  { cues: ['coworking', 'shared office', 'hot desk', 'meeting room', 'conference', 'open plan'],
    businessType: 'coworking space', industry: 'real estate', keywords: ['coworking', 'shared workspace', 'office rental', 'flexible workspace'] },
  // Childcare
  { cues: ['daycare', 'playground', 'children', 'toys', 'nursery', 'kindergarten', 'childcare'],
    businessType: 'daycare', industry: 'childcare', keywords: ['childcare', 'daycare', 'early education', 'preschool'] },
];

// Visual-only words to strip from descriptions (not business-relevant)
const VISUAL_NOISE_PATTERNS = [
  // Physical descriptors
  /\b(?:wooden|metal|plastic|glass|concrete|marble|brick|stone|ceramic|leather|fabric|velvet)\b/gi,
  // Lighting / color
  /\b(?:bright|dim|warm|cool|natural|artificial|soft|harsh|ambient|fluorescent|neon|colorful|muted|vibrant)\s*(?:light(?:ing)?|glow|tone|color|hue|palette)?\b/gi,
  // Interior design
  /\b(?:modern|vintage|rustic|minimalist|industrial|contemporary|traditional|elegant|cozy|spacious)\s*(?:interior|design|decor|aesthetic|style|look|feel|atmosphere|vibe|ambiance)?\b/gi,
  // Photo composition
  /\b(?:foreground|background|left|right|center|corner|edge|frame|visible|shown|seen|appears|looks like|seems to be|I (?:can )?see)\b/gi,
  // Furniture descriptors (when purely decorative)
  /\b(?:comfortable|cushioned|upholstered|polished|decorated|ornate|patterned|textured)\b/gi,
  // Photo/vision meta-language
  /\b(?:the (?:photo|image|picture|scene) (?:shows|depicts|features|contains|reveals|captures))\b/gi,
  /\b(?:in this (?:photo|image|picture|scene))\b/gi,
  /\b(?:there (?:is|are) (?:a |an |several |multiple |some )?)\b/gi,
];

// Budget indicators from visual cues
const BUDGET_INDICATORS: { cues: string[]; level: 'low' | 'medium' | 'high' }[] = [
  { cues: ['luxury', 'premium', 'high-end', 'upscale', 'designer', 'marble', 'chandelier', 'valet', 'concierge'], level: 'high' },
  { cues: ['mid-range', 'standard', 'typical', 'average', 'moderate', 'commercial', 'chain'], level: 'medium' },
  { cues: ['basic', 'simple', 'low-cost', 'budget', 'makeshift', 'informal', 'street-side', 'small-scale', 'micro'], level: 'low' },
];

// Location extraction patterns
const LOCATION_PATTERNS = [
  /\bin\s+((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?)(?:\s|,|\.|$)/g,
  /(?:located|situated|found|based)\s+(?:in|at|near)\s+((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:,\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)?))/g,
  /\b(Jakarta|Bandung|Surabaya|Bali|Singapore|Bangkok|Kuala Lumpur|Manila|Ho Chi Minh|Hanoi|Tokyo|Seoul|Sydney|Melbourne|Perth|London|New York|Los Angeles|San Francisco|Berlin|Paris|Dubai|Mumbai|Delhi|Shanghai|Beijing|Hong Kong|Taipei|Osaka|Yogyakarta|Semarang|Medan|Makassar)\b/gi,
];

// Country patterns
const COUNTRY_PATTERNS = /\b(Indonesia|Thailand|Vietnam|Philippines|Malaysia|Singapore|Japan|South Korea|China|India|Australia|United States|USA|UK|United Kingdom|Germany|France|Italy|Spain|Netherlands|Brazil|Mexico|Canada|UAE|Dubai|Saudi Arabia|Nigeria|Ghana|Kenya|South Africa|Egypt|Turkey|Russia|Poland|Sweden|Norway|Denmark|Switzerland|Taiwan|Myanmar|Cambodia|Laos)\b/gi;

/**
 * Extract business keywords from a Claude Vision description.
 * Pure string processing -- no API calls.
 */
export function extractBusinessKeywords(visionDescription: string): PhotoKeywords {
  const lower = visionDescription.toLowerCase();

  // 1. Match against cue mappings
  let bestMatch: CueMapping | null = null;
  let bestScore = 0;

  for (const mapping of CUE_MAPPINGS) {
    let score = 0;
    for (const cue of mapping.cues) {
      if (lower.includes(cue)) {
        score += cue.split(' ').length; // multi-word cues score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = mapping;
    }
  }

  // 2. Collect ALL matching mappings (not just best) for keyword enrichment
  const allKeywords = new Set<string>();
  const allMatchedTypes: string[] = [];
  for (const mapping of CUE_MAPPINGS) {
    let matched = false;
    for (const cue of mapping.cues) {
      if (lower.includes(cue)) {
        matched = true;
        break;
      }
    }
    if (matched) {
      for (const kw of mapping.keywords) allKeywords.add(kw);
      allMatchedTypes.push(mapping.businessType);
    }
  }

  const businessType = bestMatch?.businessType || 'business';
  const industry = bestMatch?.industry || 'general';
  const keywords = allKeywords.size > 0
    ? Array.from(allKeywords)
    : [businessType, industry, 'small business', 'entrepreneurship'];

  // 3. Extract location
  let location: string | undefined;
  for (const pattern of LOCATION_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(visionDescription);
    if (match?.[1]) {
      location = match[1].trim().replace(/,\s*$/, '');
      break;
    }
  }
  // Try country if no city found
  if (!location) {
    COUNTRY_PATTERNS.lastIndex = 0;
    const countryMatch = COUNTRY_PATTERNS.exec(visionDescription);
    if (countryMatch?.[1]) {
      location = countryMatch[1];
    }
  }

  // 4. Estimate budget
  let estimatedBudget: string | undefined;
  for (const bi of BUDGET_INDICATORS) {
    for (const cue of bi.cues) {
      if (lower.includes(cue)) {
        estimatedBudget = bi.level;
        break;
      }
    }
    if (estimatedBudget) break;
  }

  // 5. Build clean scenario text
  const scenario = buildCleanScenario(visionDescription, businessType, industry, location, keywords);

  return {
    businessType,
    industry,
    keywords,
    location,
    estimatedBudget,
    scenario,
  };
}

/**
 * Build a RAG-optimized scenario from the photo description.
 * Strips visual noise and focuses on business-relevant content.
 */
function buildCleanScenario(
  original: string,
  businessType: string,
  industry: string,
  location: string | undefined,
  keywords: string[],
): string {
  // Start with the original text
  let cleaned = original;

  // Strip visual noise patterns
  for (const pattern of VISUAL_NOISE_PATTERNS) {
    pattern.lastIndex = 0;
    cleaned = cleaned.replace(pattern, ' ');
  }

  // Collapse whitespace
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  // If the cleaned text is too short or lost too much, build from scratch
  if (cleaned.length < 30 || cleaned.length < original.length * 0.3) {
    const locationPart = location ? ` in ${location}` : '';
    return `Start a ${businessType} business${locationPart}. Industry: ${industry}. Key factors: ${keywords.slice(0, 5).join(', ')}.`;
  }

  // Prepend business context for better RAG matching
  const prefix = location
    ? `[${businessType} / ${industry} / ${location}] `
    : `[${businessType} / ${industry}] `;

  return prefix + cleaned;
}

/**
 * Augment a scenario with photo-extracted keywords for RAG search.
 * Returns an enriched search query string.
 */
export function buildRagSearchQuery(scenario: string, photoKeywords: PhotoKeywords): string {
  const parts = [scenario];

  // Add business type and industry
  parts.push(photoKeywords.businessType);
  parts.push(photoKeywords.industry);

  // Add top keywords (deduplicated from scenario)
  const scenarioLower = scenario.toLowerCase();
  for (const kw of photoKeywords.keywords) {
    if (!scenarioLower.includes(kw.toLowerCase())) {
      parts.push(kw);
    }
  }

  // Add location if present
  if (photoKeywords.location) {
    parts.push(photoKeywords.location);
  }

  // Add budget context
  if (photoKeywords.estimatedBudget) {
    const budgetMap: Record<string, string> = {
      low: 'low budget startup bootstrap',
      medium: 'medium investment SME',
      high: 'high investment premium luxury',
    };
    parts.push(budgetMap[photoKeywords.estimatedBudget] || '');
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Detect if a scenario text likely came from a photo analysis.
 * Heuristic: photo scenarios tend to have visual descriptors and scene language.
 */
export function isLikelyPhotoScenario(scenario: string): boolean {
  const lower = scenario.toLowerCase();
  const photoIndicators = [
    'photo shows', 'image shows', 'scene shows', 'picture shows',
    'I see', 'visible in', 'in the photo', 'in this image',
    'the scene', 'the photo', 'can be seen',
    'wooden tables', 'bright lighting', 'warm lighting',
    'interior of', 'exterior of',
    'modern interior', 'rustic interior',
  ];

  let matches = 0;
  for (const indicator of photoIndicators) {
    if (lower.includes(indicator)) matches++;
  }

  // Also check for high density of visual adjectives
  const visualAdj = lower.match(/\b(wooden|metal|glass|brick|bright|dim|warm|cozy|spacious|modern|rustic|vintage)\b/g);
  if (visualAdj && visualAdj.length >= 3) matches += 2;

  return matches >= 2;
}
