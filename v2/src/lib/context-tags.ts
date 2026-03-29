// Context tags: structured metadata that routes data sources + modifies prompts

export interface ContextTags {
  location?: string;   // city or country name
  budget?: string;     // e.g. "$5000", "10 juta", "low"
  timeline?: string;   // e.g. "6 months", "2 years", "1 month"
  experience?: 'none' | 'beginner' | 'intermediate' | 'expert';
}

// Parse budget string to USD number (approximate)
function parseBudget(raw: string): number | null {
  const clean = raw.replace(/[,\s]/g, '').toLowerCase();
  // Direct number with $ or without
  const numMatch = clean.match(/\$?([\d.]+)(k|m)?/);
  if (numMatch) {
    let val = parseFloat(numMatch[1]);
    if (numMatch[2] === 'k') val *= 1000;
    if (numMatch[2] === 'm') val *= 1000000;
    return val;
  }
  // Indonesian: "10 juta" = 10M IDR ~ $625
  const jutaMatch = raw.match(/([\d.]+)\s*juta/i);
  if (jutaMatch) return parseFloat(jutaMatch[1]) * 1000000 / 16000;
  return null;
}

// Parse timeline to months
function parseTimeline(raw: string): number | null {
  const clean = raw.toLowerCase().trim();
  const mMatch = clean.match(/(\d+)\s*(month|mesi|bulan|mo)/);
  if (mMatch) return parseInt(mMatch[1]);
  const yMatch = clean.match(/(\d+)\s*(year|anni|tahun|yr)/);
  if (yMatch) return parseInt(yMatch[1]) * 12;
  const wMatch = clean.match(/(\d+)\s*(week|settiman|minggu)/);
  if (wMatch) return Math.ceil(parseInt(wMatch[1]) / 4);
  const dMatch = clean.match(/(\d+)\s*(day|giorni|hari)/);
  if (dMatch) return Math.ceil(parseInt(dMatch[1]) / 30);
  return null;
}

// ROUTING: which KB files to force-load based on tags
export function getTagKeywords(tags: ContextTags): string[] {
  const keywords: string[] = [];

  if (tags.location) {
    const loc = tags.location.toLowerCase();
    keywords.push(loc);
    // Country-level routing
    if (/indonesia|bandung|jakarta|surabaya|bali|yogyakarta|medan/i.test(loc)) {
      keywords.push('indonesia', 'bisnis', 'IDR', 'rupiah');
    }
    if (/malaysia|kuala lumpur|penang|johor/i.test(loc)) {
      keywords.push('malaysia', 'MYR', 'ringgit');
    }
    if (/ital[yi]|roma|milano|napoli|torino|firenze/i.test(loc)) {
      keywords.push('italy', 'EUR', 'euro');
    }
    if (/australia|sydney|melbourne|perth|brisbane/i.test(loc)) {
      keywords.push('australia', 'AUD');
    }
    if (/usa|united states|new york|los angeles|san francisco|texas/i.test(loc)) {
      keywords.push('usa', 'USD');
    }
    if (/thailand|bangkok|chiang mai|phuket/i.test(loc)) {
      keywords.push('thailand', 'THB');
    }
    if (/vietnam|ho chi minh|hanoi/i.test(loc)) {
      keywords.push('vietnam', 'VND');
    }
    if (/philippines|manila|cebu/i.test(loc)) {
      keywords.push('philippines', 'PHP');
    }
    if (/singapore/i.test(loc)) {
      keywords.push('singapore', 'SGD');
    }
    if (/india|mumbai|delhi|bangalore/i.test(loc)) {
      keywords.push('india', 'INR');
    }
    // Always add generic location keywords
    keywords.push('country', 'cost of living', 'market');
  }

  if (tags.budget) {
    const usd = parseBudget(tags.budget);
    if (usd !== null) {
      if (usd < 1000) keywords.push('bootstrap', 'side hustle', 'low budget');
      else if (usd < 10000) keywords.push('bootstrap', 'small business', 'modal');
      else if (usd < 100000) keywords.push('funding', 'seed', 'startup');
      else keywords.push('venture capital', 'funding', 'scale');
    }
    keywords.push('pricing', 'cac', 'unit econom');
  }

  if (tags.timeline) {
    const months = parseTimeline(tags.timeline);
    if (months !== null) {
      if (months <= 3) keywords.push('time to result', 'realistic', 'fast');
      else if (months <= 12) keywords.push('time to result', 'benchmark', 'timeline');
      else keywords.push('long term', 'compounding', 'patience');
    }
  }

  if (tags.experience) {
    if (tags.experience === 'none' || tags.experience === 'beginner') {
      keywords.push('learn', 'beginner', 'mistake', 'fail');
    } else if (tags.experience === 'expert') {
      keywords.push('scaling', 'optimization', 'leverage');
    }
  }

  return [...new Set(keywords)];
}

// PROMPT MODIFIER: extra instructions for Claude based on tags
export function getTagPromptModifier(tags: ContextTags): string {
  const parts: string[] = [];

  if (tags.location) {
    parts.push(`LOCATION CONTEXT: The scenario takes place in ${tags.location}. Use LOCAL data: local currency, local cost of living, local market conditions, local regulations, local salary levels. All monetary values should be in local currency with USD equivalent.`);
  }

  if (tags.budget) {
    const usd = parseBudget(tags.budget);
    const budgetStr = usd ? `(~$${usd.toLocaleString()} USD)` : '';
    parts.push(`BUDGET CONSTRAINT: Starting capital is ${tags.budget} ${budgetStr}. Every node that involves spending must check against this budget. Add a bottleneck if the step costs more than 30% of total budget. Adjust strategies to match this budget level.`);
  }

  if (tags.timeline) {
    const months = parseTimeline(tags.timeline);
    const compressed = months !== null && months <= 6;
    parts.push(`TIMELINE: ${tags.timeline}${months ? ` (${months} months)` : ''}. ${compressed ? 'This is a compressed timeline — probabilities of success are LOWER than default because speed increases failure rate. Add time pressure bottlenecks.' : 'Adjust time estimates on each node to fit within this window.'}`);
  }

  if (tags.experience) {
    const levels: Record<string, string> = {
      'none': 'The person has ZERO experience in this field. Add extra learning/preparation nodes. Failure probabilities should be 15-25% higher than industry average. Include common beginner mistakes as bottlenecks.',
      'beginner': 'The person has basic knowledge but no real experience. Failure probabilities should be 10-15% higher than average. Include 1-2 learning curve nodes.',
      'intermediate': 'The person has some experience. Use standard industry probabilities.',
      'expert': 'The person is highly experienced. Reduce failure probabilities by 10-15% from industry average. Skip basic preparation nodes. Focus on scaling and optimization challenges.',
    };
    parts.push(`EXPERIENCE LEVEL: ${tags.experience}. ${levels[tags.experience]}`);
  }

  return parts.length > 0 ? '\n\nCONTEXT TAGS (use these to calibrate the simulation):\n' + parts.join('\n') : '';
}
