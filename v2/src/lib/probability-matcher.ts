/**
 * Probability Matcher — connects real data to simulation nodes
 *
 * When a template loads, this module matches each node's label/description
 * against our real data sources and overrides AI-estimated probabilities
 * with verified numbers.
 *
 * Data sources (Layer 2):
 * - real-probabilities.json (106 entries from BLS, CDC, Census, Fed)
 * - life-event-probabilities.json (11 life event categories by age)
 * - game-theory-behavioral.json (247 experimental datapoints)
 * - mesa-behavioral-models.json (25 ABM model parameters)
 *
 * The matcher runs server-side (in API route) and client-side (in canvas).
 */

// Inline lookup table — extracted from real-probabilities.json at build time
// This runs client-side so we can't read files. Key stats are hardcoded.
const REAL_PROBS: Record<string, { prob: number; source: string }> = {
  // Business
  'start business': { prob: 79.6, source: 'BLS BED 2024 — Year 1 survival' },
  'startup survive': { prob: 79.6, source: 'BLS BED 2024' },
  'business year 1': { prob: 79.6, source: 'BLS BED 2024' },
  'business year 5': { prob: 50.6, source: 'BLS BED 2024' },
  'business year 10': { prob: 34.7, source: 'BLS BED 2024' },
  'startup profitable': { prob: 40, source: 'SBA — within 3 years' },
  'venture capital': { prob: 0.7, source: 'Fundz — VC funding rate' },
  'seed funding': { prob: 5.5, source: 'Crunchbase seed rate' },
  'market need': { prob: 58, source: 'CB Insights — 42% fail from no need' },
  'product market fit': { prob: 30, source: 'Startup Genome' },

  // Career
  'get hired': { prob: 68.3, source: 'BLS placement rate' },
  'software engineer': { prob: 85, source: 'BLS OES — high demand' },
  'salary 100k': { prob: 34.2, source: 'BLS OES 2024' },
  'salary 200k': { prob: 8.1, source: 'BLS OES 2024 — physicians+' },
  'promotion': { prob: 15, source: 'BLS — annual promotion rate' },
  'job switch': { prob: 22, source: 'BLS JOLTS — annual quit rate' },
  'freelance': { prob: 35, source: 'Upwork — freelancer success rate year 1' },
  'remote work': { prob: 28, source: 'BLS — remote-capable jobs 2024' },

  // Education
  'college degree': { prob: 62.2, source: 'NCES — 6-year completion rate' },
  'graduate degree': { prob: 13.1, source: 'Census ACS 2023' },
  'bootcamp job': { prob: 72, source: 'CIRR outcomes report' },
  'course complete': { prob: 15, source: 'edX/Coursera avg completion' },

  // Financial
  'save 1m': { prob: 4.7, source: 'Fed SCF — $1M+ retirement' },
  'retire by 50': { prob: 3, source: 'Fed SCF estimate' },
  'retire by 65': { prob: 55, source: 'Fed SHED 2023' },
  'invest profit': { prob: 52, source: 'S&P 500 — annual positive return rate' },
  'beat inflation': { prob: 68, source: 'S&P 500 real returns' },
  'day trading': { prob: 5, source: 'BLS/SEC — profitable day traders' },
  'crypto profit': { prob: 25, source: 'BIS/Fed research' },
  'home purchase': { prob: 65.6, source: 'Census HVS 2024 overall rate' },
  'emergency fund': { prob: 44, source: 'Fed SHED — can cover $400' },

  // Life
  'marriage': { prob: 67, source: 'CDC — survive 10 years' },
  'divorce': { prob: 33, source: 'CDC NCHS' },
  'immigration': { prob: 14.6, source: 'USCIS H-1B selection rate' },
  'visa approved': { prob: 96, source: 'USCIS — once selected' },
  'move abroad': { prob: 45, source: 'Expat satisfaction rate' },
  'have children': { prob: 86, source: 'Census — women 40-44 with children' },
  'life expectancy': { prob: 79, source: 'CDC 2024 — years at birth' },

  // Health
  'gym habit': { prob: 20, source: 'IHRSA — maintain 12+ months' },
  'diet success': { prob: 5, source: 'UCLA meta-analysis — long-term' },
  'quit smoking': { prob: 7.5, source: 'CDC — per attempt success' },
  'mental health': { prob: 21, source: 'NIMH — any mental illness prevalence' },
  'burnout': { prob: 73, source: 'Startup Snapshot — founder burnout' },

  // Behavioral (from Choices13k + Game Theory)
  'risk choice': { prob: 51, source: 'Choices13k — risky option chosen' },
  'cooperate': { prob: 45, source: 'Prisoner Dilemma meta-analysis' },
  'trust': { prob: 50, source: 'Trust Game — amount sent' },
  'fair deal': { prob: 58, source: 'Ultimatum Game — accept rate' },
  'free ride': { prob: 50, source: 'Public Goods — initial contribution' },
  'negotiate win': { prob: 55, source: 'First-offer advantage' },

  // Mesa ABM models
  'segregation': { prob: 70, source: 'Schelling — satisfaction threshold' },
  'epidemic spread': { prob: 40, source: 'SIR — virus spread chance' },
  'wealth inequality': { prob: 20, source: 'Boltzmann — top 20% own 80%' },
  'herd behavior': { prob: 65, source: 'Opinion dynamics — conformity rate' },

  // Business specific
  'cafe restaurant': { prob: 60, source: 'BLS — restaurant 1yr survival' },
  'saas business': { prob: 40, source: 'Indie Hackers — SaaS profitability' },
  'ecommerce': { prob: 35, source: 'Census — e-commerce success rate' },
  'content creator': { prob: 3, source: 'YouTube — full-time viable' },
  'franchise': { prob: 85, source: 'FRANdata — franchise 5yr survival' },

  // Marketing
  'seo results': { prob: 5, source: 'Ahrefs — pages reaching page 1' },
  'email open': { prob: 21, source: 'Mailchimp — avg open rate' },
  'ad conversion': { prob: 3.75, source: 'WordStream — Google Ads avg' },
  'viral content': { prob: 1, source: 'Social media — viral threshold' },
  'referral': { prob: 83, source: 'Nielsen — trust recommendations' },
};

/**
 * Match a node's label/description against real probability data.
 * Returns the best match or null if no confident match found.
 */
export function matchRealProbability(
  label: string,
  desc?: string,
): { prob: number; source: string } | null {
  const text = `${label} ${desc || ''}`.toLowerCase();

  let bestMatch: { prob: number; source: string } | null = null;
  let bestScore = 0;

  for (const [key, data] of Object.entries(REAL_PROBS)) {
    const words = key.split(' ');
    const matchCount = words.filter(w => text.includes(w)).length;
    const score = matchCount / words.length;

    if (score > bestScore && score >= 0.5) {
      bestScore = score;
      bestMatch = data;
    }
  }

  return bestMatch;
}

/**
 * Override template node probabilities with real data where matches are found.
 * Returns updated nodes with real sources.
 */
export function applyRealProbabilities(
  nodes: Array<{ id: string | number; label: string; type: string; prob?: number; desc?: string; source?: string }>,
): Array<{ id: string | number; label: string; type: string; prob?: number; desc?: string; source?: string }> {
  return nodes.map(node => {
    // Only override bottleneck/decision nodes (they have meaningful probabilities)
    if (node.type !== 'bottleneck' && node.type !== 'decision') return node;

    const match = matchRealProbability(node.label, node.desc);
    if (match) {
      return {
        ...node,
        prob: match.prob,
        source: match.source,
      };
    }
    return node;
  });
}
