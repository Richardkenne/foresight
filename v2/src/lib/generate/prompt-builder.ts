import { getTagKeywords, getTagPromptModifier, type ContextTags } from '@/lib/context-tags';
import {
  detectBusinessType,
  buildIndustryCountryContext,
  findSacredPatterns,
  matchSacredRoots,
  loadRealProbabilities,
  CURRENCY_MAP,
} from './data-fetcher';
import type { ParentContext } from './types';

// ============ STATIC SYSTEM PROMPT (cached across requests) ============
export const STATIC_PROMPT = `You are a life/business scenario simulator. Generate a realistic flowchart with nodes and edges.

CRITICAL RULES:
1. DATA INTEGRITY: Every node MUST have a real source. Use the RAG data provided, your training knowledge, or well-known reports (BLS, World Bank, McKinsey, CB Insights, PitchBook, etc.). Format: "ReportName Year:value:tier". If you truly cannot find ANY data for a node, use a closely related statistic and cite it honestly. "No data" should be extremely rare — only for truly novel scenarios with zero comparable data.
2. COMPLETE COVERAGE: The flow must cover the ENTIRE scenario from start to end. If the user says "move abroad and learn a language", cover BOTH — immigration steps AND language learning journey. Never stop halfway.
3. EVERY STEP NEEDS A FAIL PATH: Every bottleneck/decision MUST have a fail/no edge leading to an outcome-bad node. This is non-negotiable. Real life has failure at every step.
4. If an ARCHETYPE is provided, use its stages as the SKELETON with EXACT probabilities.
5. If section data points are provided, use those specific numbers and CITE the source.
6. NEVER HALLUCINATE PLATFORM FEATURES: Do NOT invent steps that don't exist on real platforms. Upwork has NO mandatory "skills test" or "AI developer test". Stick to real platform mechanics: profile creation, proposals (with Connects), interviews, contracts, JSS score, badges.
7. USE RAG DATA FIRST: When the provided data includes a specific probability (e.g., "proposal_to_interview_new_pct: 2-5%"), use THAT number, not a higher one. The RAG data is verified — ONLY use verified data. Never estimate probabilities.

STRUCTURE: Return ONLY valid JSON. 10-14 nodes. Include success AND failure paths.
Node types: start, desire, action, state, trajectory, bottleneck, gate, decision, outcome-good, outcome-bad, loop.

SIMULATION FLOW PATTERN (follow this):
state → action/event → new state → bottleneck/gate → state → outcome
Without state you show only steps. With state you show how the person TRANSFORMS after each step.

- "state" = the person's current condition. Green background. ALWAYS use after bottlenecks and at the start. Examples: "Man with $0 margin, urgent income need", "Has 5 clients but low pricing", "Breakeven, not growing". State answers: "WHO are you now?"
- "trajectory" = the PATH the person is on. Purple background. Use after a gate/bottleneck to label the direction. Examples: "Low-income trap", "Scalable path", "High-friction path". Trajectory answers: "WHERE are you heading?"
- "gate" = 3-way probabilistic split with edges "no", "partial", "yes". Use instead of bottleneck when there's a meaningful gray zone. The "partial" edge leads to a state describing the trapped condition.
- Start flows with a state node describing the initial condition, then desire/action.

Example flow: state("No money, needs income") → desire("Want to freelance") → action("Learn skill") → state("Has skill, no clients") → bottleneck("Land first client?") → state("First client landed, $500 earned") → ...
Edges: pass/fail for bottleneck, yes/no for decision, no/partial/yes for gate. Every bottleneck/decision/gate MUST have both a pass/yes AND a fail/no edge. Gate nodes also need a "partial" edge to a state node.
Position: x increases by ~260, failures below (y+200). Min 260px horizontal spacing.
JSON format: {"title":"...","nodes":[{"id":1,"type":"desire","label":"...","x":0,"y":120,"prob":68,"desc":"Real stat","source":"BLS 2024:70:3 | CB Insights 2024:65:2","time":"30-90 days","sacredRoots":["SR-009","SR-031"]}],"edges":[{"from":1,"to":2,"label":""}],"pruning_questions":[{"id":"q1","question":"Binary YES/NO question SPECIFIC to this exact scenario — NOT generic business questions","sacredRoot":"SR-031","yesModifier":1.8,"noModifier":0.35,"yesLabel":"Yes, short","noLabel":"No, short","insight":"Data-backed reason why this matters (stat + source)"}]}
For each node, include "sacredRoots": an array of 1-3 sacred root IDs (from the 36) that determine the outcome at that node. This connects every simulation step to its irreducible behavioral atoms.
PRUNING QUESTIONS MUST be scenario-specific. Example: for "friend asks to borrow money" → "Do you have a written agreement?" NOT "Do you have a mentor?". For "open a restaurant" → "Do you have restaurant experience?" NOT "Are you committed for 3+ years?". Generate 5-7 questions that ONLY make sense for THIS specific scenario.
prob = weighted average of all sources. Only bottleneck/decision need realistic prob (<100). Others = 100.
For bottleneck/decision nodes, also include "probRange" with optimistic and adverse: {"prob":40,"probRange":{"optimistic":65,"adverse":15}}.
NODE DEPENDENCY SYSTEM: For bottleneck and gate nodes, include a "modifiesDownstream" field: an array of objects {"targetNodeLabel": string, "modifier": number} where modifier is a multiplier applied to downstream node probabilities. Example: if "Land First Client" passes, it might boost "Get Referral" by 1.3x (30% more likely). If "Funding Secured" fails, downstream "Scale Team" drops by 0.5x. Use modifiers between 0.3-2.0. Only include when a real causal dependency exists between nodes — do not force dependencies on every node.
desc MUST include a specific number/stat, not generic text.
SOURCE TRIANGULATION: For every bottleneck/decision prob, provide MULTIPLE sources when possible. Format: "SourceName Year:value:tier | SourceName Year:value:tier" where tier is 3=government(BLS,Census,WHO), 2=institutional(McKinsey,YC,PitchBook), 1=media(TechCrunch,Forbes). prob = weighted avg (tier3 x3, tier2 x2, tier1 x1). Example: "BLS 2024:70:3 | CB Insights 2024:65:2" → prob = (70*3+65*2)/5 = 68.

UPWORK/FREELANCE PLATFORM MECHANICS (use when scenario involves Upwork or freelancing):
- Profile approval: ~50-60% of submissions approved (Upwork tightened screening 2023)
- Connects: $0.15 each, 2-16 per proposal. Average $9-27 spent before first hire.
- Proposal-to-interview rate: 2-5% for new freelancers, 15-25% for established, 30-50% for Top Rated Plus
- Proposals before first hire: 15-30 (median 20)
- Time to first dollar: 1-3 months
- 60-70% of new freelancers quit within year 1
- Only 2.5% of signups get their first job. Only 0.8% still active after 1 year.
- Income: median active freelancer earns $2-5K/year. Top 1% earns $150-500K/year.
- JSS (Job Success Score) 90%+ = 2-3x higher hire rate. Top Rated = 3-5x more invites.
- Expert-Vetted acceptance: 1%. Rates: $150-300/hr.
- Repeat hire rate: 60%. 75% of GSV from returning clients.
- Hourly-to-retainer conversion: 30-40% for 3+ month relationships.
- Solo-to-agency transition: 5-7% overall, 15-20% of high earners. Takes 3-5 years.
- Geographic rates: US $75-150/hr dev, India $15-40/hr, Indonesia $10-30/hr, Philippines $10-30/hr.
- AI category: demand 2-3x supply, rates $75-150/hr median, +1400% YoY growth.

DECISION PRUNING QUESTIONS: Generate exactly 5-7 binary YES/NO questions that determine success/failure for THIS specific scenario. Each question must:
- Be a simple YES/NO binary decision the person makes BEFORE starting
- Map to one of these sacred root IDs (36 irreducible atoms): SR-001 (Faith/Doubt), SR-002 (Worship/Idolatry), SR-003 (Obedience/Rebellion), SR-004 (Gratitude/Ingratitude), SR-005 (Repentance/Hardening), SR-006 (Remembrance/Forgetfulness), SR-007 (Hope/Despair), SR-008 (Fervor/Lukewarmness), SR-009 (Humility/Pride), SR-010 (Patience/Haste), SR-011 (Self-control/Lust), SR-012 (Diligence/Sloth), SR-013 (Contentment/Greed), SR-014 (Moderation/Excess), SR-015 (Conscience/Numbness), SR-016 (Pure Intention/Performance), SR-017 (Wisdom/Folly), SR-018 (Transparency/Hiding), SR-019 (Accountability/Blame), SR-020 (Love/Hatred), SR-021 (Justice/Oppression), SR-022 (Mercy/Vengeance), SR-023 (Truth/Deception), SR-024 (Generosity/Hoarding), SR-025 (Community/Isolation), SR-026 (Loyalty/Betrayal), SR-027 (Celebration/Envy), SR-028 (Compassion/Indifference), SR-029 (Inclusion/Tribalism), SR-030 (Reverence/Mockery), SR-031 (Stewardship/Waste), SR-032 (Service/Domination), SR-033 (Reform/Corruption), SR-034 (Middle Path/Extremism), SR-035 (Certainty/Conjecture), SR-036 (Teachability/Closedness)
- Have yesModifier (1.2-2.5) and noModifier (0.05-0.5) that reflect real data
- Include a data-backed "insight" with a real statistic
- Be SPECIFIC to the scenario — ask about CONCRETE MECHANICS, not generic self-help. Examples:
  - Upwork: "Do you have a Connects budget of $20+/month?" NOT "Are you willing to invest?"
  - Upwork: "Have you specialized in ONE niche?" NOT "Do you have skills?"
  - Upwork: "Do you have 5+ portfolio pieces?" NOT "Are you prepared?"
  - Visa: "Do you have a sponsor employer?" NOT "Are you committed?"
  - Startup: "Have you talked to 20+ potential customers?" NOT "Have you validated?"
  - Weight loss: "Do you have a gym membership or home equipment?" NOT "Are you motivated?"`;

// ============ BUILD DYNAMIC PROMPT ============
export interface DynamicPromptInput {
  scenario: string;
  enrichedScenario: string;
  tags?: ContextTags;
  profile?: Record<string, unknown>;
  sacredMode?: boolean;
  detectedCountries: string[];
  liveData: {
    live: Record<string, Record<string, string>> | null;
    countryData: string | null;
    exchangeRates: Record<string, number> | null;
    laborData: string | null;
    wikiContext: string | null;
    cryptoData: string | null;
    cityData: string | null;
  };
}

export async function buildDynamicPrompt(input: DynamicPromptInput): Promise<string> {
  const { scenario, enrichedScenario, tags, profile, sacredMode, detectedCountries, liveData } = input;
  const { live, countryData, exchangeRates, laborData, wikiContext, cryptoData, cityData } = liveData;

  let liveStr = '';
  if (live?.gdp) liveStr = `\nLIVE DATA: GDP/capita: ${Object.entries(live.gdp).map(([k, v]) => `${k}: ${v}`).join(', ')}. Unemployment: ${Object.entries(live.unemp || {}).map(([k, v]) => `${k}: ${v}`).join(', ')}`;
  if (countryData) liveStr += `\nCOUNTRY DATA: ${countryData}`;
  if (exchangeRates && detectedCountries.length > 0) {
    const relevantRates: string[] = [];
    for (const country of detectedCountries) {
      const code = CURRENCY_MAP[country];
      if (code && code !== 'USD' && exchangeRates[code]) {
        relevantRates.push(`1 USD = ${exchangeRates[code].toFixed(code === 'IDR' || code === 'VND' || code === 'KRW' ? 0 : 2)} ${code}`);
      }
    }
    if (relevantRates.length > 0) liveStr += `\nEXCHANGE RATES: ${relevantRates.join(', ')}`;
  }
  if (laborData) liveStr += `\nUS LABOR DATA: ${laborData}`;
  if (wikiContext) liveStr += `\nWIKIPEDIA CONTEXT: ${wikiContext}`;
  if (cryptoData) liveStr += `\nCRYPTO MARKET DATA: ${cryptoData}`;
  if (cityData) liveStr += `\nCITY QUALITY OF LIFE: ${cityData}`;

  // BUSINESS TYPE DETECTION
  const businessType = detectBusinessType(scenario);
  if (businessType) {
    console.log(`[API] Business type detected: ${businessType}`);
  }

  // INDUSTRY + COUNTRY baseline probabilities
  const profileCountry = (profile as Record<string, unknown> | undefined)?.country as string | undefined;
  const industryCountryCtx = buildIndustryCountryContext(businessType, detectedCountries, profileCountry);
  if (industryCountryCtx) {
    liveStr += industryCountryCtx;
    console.log(`[API] Industry/country context injected (${businessType || 'no-type'}, ${detectedCountries[0] || profileCountry || 'no-country'})`);
  }

  // LAYER 0: Sacred foundation
  const sacredContext = findSacredPatterns(scenario);
  if (sacredContext) {
    liveStr += `\n\n${sacredContext}`;
  }

  // LAYER 0.5: Sacred Roots
  const sacredRootsContext = matchSacredRoots(scenario);
  if (sacredRootsContext) {
    liveStr += sacredRootsContext;
  }

  // SACRED MODE
  if (sacredMode) {
    liveStr += `\n\nSACRED MODE ACTIVE: Generate the simulation using ONLY sacred texts (Bible + Quran) as sources.
- Node "desc" must contain the sacred verse text (not statistics)
- Node "source" must be formatted as "Bible: [verse] | Quran: [verse]"
- Probabilities come from the 36 sacred roots, not from statistical data
- Each node MUST include "sacredRoots" array with the relevant root IDs
- The flow structure is the same (state → action → bottleneck → outcome) but all content is sacred
- Do NOT use McKinsey, BLS, CB Insights or any statistical source — ONLY Bible and Quran
- Edge labels remain the same (pass/fail, yes/no/partial)
- Example node: {"id":1,"type":"state","label":"Man with nothing","desc":"When the woman saw that the fruit of the tree was good for food and pleasing to the eye, she took some and ate it.","source":"Bible: Genesis 3:6 | Quran: Al-Araf 7:20","prob":100,"sacredRoots":["SR-013","SR-003"]}`;
    console.log('[API] Sacred mode active');
  }

  // LAYER 2: Real probabilities (skip in sacred mode)
  if (!sacredMode) {
    const realProbs = loadRealProbabilities();
    if (realProbs) {
      liveStr += `\n\nVERIFIED REAL PROBABILITIES (confirms the sacred patterns above — use these exact numbers):\n${realProbs}`;
    }
  }

  // CONTEXT TAGS
  const tagModifier = tags ? getTagPromptModifier(tags) : '';
  if (tagModifier) {
    liveStr += tagModifier;
    console.log(`[API] Context tags active: ${Object.entries(tags || {}).filter(([,v]) => v).map(([k,v]) => `${k}=${v}`).join(', ')}`);
  }

  // USER PROFILE
  if (profile && Object.keys(profile).length > 0) {
    const { getProfilePromptModifier } = await import('@/lib/user-profile');
    const profileMod = getProfilePromptModifier(profile as import('@/lib/user-profile').UserProfile);
    if (profileMod) {
      liveStr += profileMod;
      console.log(`[API] Profile active: ${Object.keys(profile).filter(k => !k.startsWith('_') && profile![k] != null).length} fields`);
    }

    // SACRED PROFILE — personalized probability calibration
    const sacredProfile = (profile as import('@/lib/user-profile').UserProfile).sacredProfile;
    if (sacredProfile && Object.keys(sacredProfile).length > 0) {
      const sacredLines = Object.entries(sacredProfile)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([rootId, score]) => `${rootId}: ${score}/10`)
        .join(', ');
      liveStr += `\n\nUSER SACRED PROFILE (behavioral assessment scores — calibrate bottleneck probabilities accordingly):\n${sacredLines}\n`;
      liveStr += `SACRED CALIBRATION RULE: A user with low scores (0-3) on roots relevant to a bottleneck should have LOWER success probability at that bottleneck. A user with high scores (7-10) should have HIGHER probability. Example: low Patience (2/10) at a bottleneck requiring patience = reduce probability by 20-30%. High Diligence (9/10) at a bottleneck requiring consistent work = increase probability by 15-25%. Apply this proportionally to ALL bottleneck/gate nodes based on their sacredRoots.`;
      console.log(`[API] Sacred Profile active: ${Object.keys(sacredProfile).length} roots scored`);
    }
  }

  return liveStr ? liveStr.trim() : '';
}

// ============ BUILD USER MESSAGE ============
export function buildUserMessage(
  scenario: string,
  sacredMode: boolean | undefined,
  parentContext: ParentContext | undefined,
  kbContext: string | null,
): string {
  if (parentContext) {
    const depthLabel = parentContext.depth === 1 ? 'first' : parentContext.depth === 2 ? 'second' : 'third';
    const msg = `DRILL-DOWN SIMULATION (${depthLabel} level, depth ${parentContext.depth}/3):

PARENT SCENARIO: "${parentContext.parentScenario}"
DRILLING INTO STEP: "${parentContext.parentNodeLabel}"
STEP DESCRIPTION: ${parentContext.parentNodeDescription || 'N/A'}
STEP PROBABILITY: ${parentContext.parentNodeProb}%

Generate a DETAILED sub-simulation that breaks down ONLY this specific step: "${parentContext.parentNodeLabel}".
- Generate 5-8 nodes (smaller than main simulation)
- Use ${parentContext.parentNodeProb}% as the starting baseline probability
- The sub-simulation should map the micro-steps within this single step
- Start with a state node describing the person at the beginning of this step
- End with outcome-good (successfully completed this step) and outcome-bad (failed at this step)
- Each micro-step must have its own realistic probability based on real data
- Do NOT repeat the entire parent simulation — ONLY zoom into "${parentContext.parentNodeLabel}"

USE THESE DATA POINTS:
${kbContext || 'Use Tier S/A sources.'}

Return ONLY JSON.`;
    console.log(`[API] Sub-simulation: depth=${parentContext.depth}, node="${parentContext.parentNodeLabel}"`);
    return msg;
  }

  return sacredMode
    ? `Scenario: "${scenario}"\n\nUSE ONLY SACRED TEXTS (Bible, Quran, Torah, Bhagavad Gita, Tao Te Ching). NO statistical data. Every node desc must be a sacred verse. Every source must be a scripture reference.\n\nReturn ONLY JSON.`
    : `Scenario: "${scenario}"\n\nUSE THESE DATA POINTS:\n${kbContext || 'Use Tier S/A sources.'}\n\nReturn ONLY JSON.`;
}

// ============ ENRICH SCENARIO WITH TAGS ============
export function enrichScenarioWithTags(scenario: string, tags?: ContextTags): string {
  const tagKeywords = tags ? getTagKeywords(tags) : [];
  return tagKeywords.length > 0
    ? `${scenario} [context: ${tagKeywords.join(', ')}]`
    : scenario;
}
