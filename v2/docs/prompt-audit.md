# Prompt Quality Audit — Simulator v2

## Index
- [1. Prompt Structure Analysis](#1-prompt-structure-analysis)
- [2. Data Integration Analysis](#2-data-integration-analysis)
- [3. Output Quality Rubric](#3-output-quality-rubric)
- [4. 20 Scenario Dry Runs](#4-20-scenario-dry-runs)
- [5. Critical Weaknesses](#5-critical-weaknesses)
- [6. Improvement Recommendations](#6-improvement-recommendations)

---

## 1. Prompt Structure Analysis

### Overall Architecture
The prompt is split into 3 layers:
1. **STATIC_PROMPT** (~76 lines, cached via `cache_control: ephemeral`) — rules, node types, JSON format, platform-specific mechanics
2. **Dynamic prompt** (built per-request) — live data, industry probs, sacred context, country modifiers, user profile, context tags
3. **User message** — scenario text + KB/RAG context as data points

### Structure Quality: **7/10**

**Strengths:**
- Clear node type definitions with purpose and color mapping
- Explicit JSON format with example
- Source triangulation system (tier 3/2/1 weighting) is well-designed
- Fail path requirement ("EVERY STEP NEEDS A FAIL PATH") is explicit and repeated
- Flow pattern (state -> action -> bottleneck -> state -> outcome) is clearly articulated
- Upwork-specific mechanics section prevents hallucination for that vertical

**Weaknesses:**
- **PROMPT IS TOO LONG** — STATIC_PROMPT alone is ~3,500 tokens. With dynamic context (live data, sacred patterns, real probs, industry baselines, RAG/KB results), the total system prompt can reach 8,000-12,000 tokens. For Claude Haiku 4.5 with 4,000 max_tokens output, this leaves marginal headroom and increases cost per call.
- **Instruction density is extreme** — 7 CRITICAL RULES, then node types, then simulation flow pattern, then edge labels, then JSON format, then source triangulation, then Upwork mechanics, then pruning questions, then sacred roots (all 36 IDs listed inline). Claude Haiku may not follow ALL of these simultaneously.
- **"start" node type is mentioned in line 25 but NOT defined in the node type table** in CLAUDE.md. The STATIC_PROMPT says `start` is a valid type, but the canonical list in CLAUDE.md uses `state` for initial nodes. This is contradictory.
- **Node count instruction is ambiguous** — STATIC_PROMPT says "10-14 nodes", but drill-down says "5-8 nodes". No guidance for when 10 is too few (complex multi-stage scenarios) or too many.
- **No negative examples** — the prompt says what to do but never shows what BAD output looks like. One "DON'T DO THIS" example would dramatically reduce errors.
- **Edge label spec is incomplete** — says "pass/fail for bottleneck, yes/no for decision, no/partial/yes for gate" but the template examples also use unlabeled edges (e.g., `{ from: 1, to: 2 }` with no label). The prompt doesn't clarify when empty labels are acceptable.

### Are Node Types Well-Defined? **8/10**
The types (state, desire, action, trajectory, bottleneck, gate, decision, outcome-good, outcome-bad, loop) are well-defined with "answers" column. Missing: `loop` type has no definition anywhere in the prompt. The `start` type appears in JSON format but isn't in the main table.

### Are Edge Labels Well-Specified? **6/10**
- Bottleneck: pass/fail — clear
- Decision: yes/no — clear
- Gate: no/partial/yes — clear
- **But:** no specification for edges FROM non-decision nodes (state -> action, desire -> action). Templates show these as empty string labels, but the prompt never says this explicitly.
- **No guidance on edge label text content** beyond the binary labels. Templates show rich labels like nothing beyond pass/fail/yes/no, but the prompt says "Edge labels must be meaningful" without defining what that means for non-gate edges.

### Is the Output JSON Format Unambiguous? **7/10**
- The inline example is good but only shows ONE node and ONE edge
- Missing: `time` field is shown in the example but never explained (format? required?)
- Missing: `probRange` is defined in text but not shown in the JSON example
- Missing: `modifiesDownstream` is defined in text but the JSON example doesn't include it
- Missing: `pruning_questions` is in the example but the full question object schema is only partially shown
- The `title` field at root level is shown but never described

### Are There Contradictory Instructions? **YES — 3 found**

1. **Rule 1 says "If you truly cannot find ANY data, use a closely related statistic"** but **Rule 7 says "Never estimate probabilities"**. These directly conflict — using a "closely related statistic" IS an estimation.

2. **Rule 4 says "use archetype stages as the SKELETON with EXACT probabilities"** but the dynamic prompt also injects INDUSTRY BASELINE PROBABILITIES with "USE THESE AS BASE RATES". When an archetype AND industry baseline both exist, which takes priority?

3. **Node count: "10-14 nodes"** but templates have 12-16 nodes (startup template has 15). The prompt says 10-14 but the reference data shows 12-16.

---

## 2. Data Integration Analysis

### RAG Context Quality: **8/10**
- RAG search (Supabase pgvector, 66K+ embeddings) returns top 30 matches
- Fallback to keyword-based KB matching if RAG unavailable
- KB matching uses a sophisticated keyword map with 80+ data file categories
- Smart extraction functions handle archetypes, sections, funnels, lists, nested dicts
- **Truncated to 16,000 chars** which is a reasonable limit
- **Weakness:** RAG results are injected into the USER message, not the system prompt. This means they don't benefit from prompt caching and are re-processed every time.

### Real Probability Data: **9/10**
- `real-probabilities.json` has 480 entries from BLS, CDC, Census, Fed, SBA — all US government tier-3 sources
- Format is clean: `category/metric: prob% (source year)`
- Injected into dynamic prompt with clear header "VERIFIED REAL PROBABILITIES"
- **Weakness:** US-centric. No equivalent dataset for Indonesia, EU, or other markets. Country modifiers attempt to compensate but are rough multipliers.

### Sacred Mode Separation: **7/10**
- Sacred mode clearly instructs "ONLY Bible and Quran" and "Do NOT use McKinsey, BLS..."
- Real probabilities are skipped (`if (!sacredMode)`)
- Sacred patterns and sacred roots are always injected regardless of mode (good — they serve as behavioral atoms)
- **Weakness:** When sacred mode is OFF, both statistical data AND sacred patterns are injected. The prompt says sacred patterns are "the basis for probabilities" which contradicts "use VERIFIED REAL PROBABILITIES". Claude must reconcile two potentially conflicting data streams.

### Industry-Specific Base Probs: **8/10**
- 7 business types covered: SaaS, F&B, Agency, Marketplace, Creator, E-commerce, Upwork
- Each has 7-8 specific probability milestones with credible sources
- Country modifiers (35 countries) adjust probabilities proportionally
- **Weakness:** Only 7 verticals. Scenarios like "open a gym", "start farming", "import/export" have NO industry baseline. Claude gets generic data only.

### Sacred Profile Context: **6/10**
- User's behavioral scores (36 roots, 0-10 each) are injected with calibration rules
- "Low scores = lower probability, high scores = higher probability"
- **Weakness:** The calibration rule is vague. "Reduce probability by 20-30%" for low patience — but 20% or 30%? This gives Claude discretion to choose, which contradicts the deterministic philosophy.

---

## 3. Output Quality Rubric

### Realistic Bottleneck Probabilities: **7/10**
- Industry baselines provide strong anchors (SaaS first_job: 2.5%, F&B survive_year1: 40%)
- Source triangulation weighting (tier3 x3, tier2 x2, tier1 x1) is well-designed
- **Risk:** When no industry baseline exists, Claude defaults to training knowledge which tends toward 50% (regression to mean). The prompt says "never estimate" but provides no mechanism to PREVENT estimation when data is absent.

### Meaningful Edge Labels: **5/10**
- The prompt only specifies: pass/fail, yes/no, no/partial/yes
- No instruction to add CONTEXT to labels (e.g., "fail — 60% never raise money")
- Templates show only bare labels ("fail", "pass", "yes", "no", "partial")
- **This is a missed opportunity** — edge labels could carry the "why" of each transition

### Proper Node Flow: **8/10**
- Flow pattern is explicitly stated and well-defined
- Templates consistently follow the pattern
- The "ALWAYS include state nodes after bottlenecks" rule is clear
- **Weakness:** No explicit rule about when to use `trajectory` nodes. They appear in the type table but zero templates use them.

### Sufficient Depth (7-15 nodes): **7/10**
- "10-14 nodes" instruction is clear
- Templates average 13 nodes — good reference
- **Risk:** Haiku with max_tokens: 4000 and a 12-node graph with all fields (desc, source, sacredRoots, probRange, modifiesDownstream) will produce ~2,500-3,500 tokens of JSON. This is tight but feasible. At 14+ nodes, risk of truncation increases.

### Source Citations: **8/10**
- "Every node MUST have a real source" is explicit
- Triangulation format "SourceName Year:value:tier" is well-specified
- Templates demonstrate consistent sourcing
- **Risk:** Claude Haiku may cite plausible-sounding but non-existent reports. No verification mechanism exists.

### Sacred Roots Mapping: **7/10**
- "1-3 sacred root IDs per node" is clear
- All 36 roots are listed inline (adds ~800 tokens to prompt)
- `matchSacredRoots()` provides top 5 relevant roots per scenario
- **Weakness:** The mapping from scenario keyword to sacred root is keyword-based and shallow. "Open a cafe" matches on general business words, not on the specific behavioral atoms relevant to F&B entrepreneurship.

### modifiesDownstream: **6/10**
- Well-defined: `{targetNodeLabel, modifier}` with range 0.3-2.0
- "Only include when a real causal dependency exists"
- Post-processing function `applyNodeDependencies()` applies multipliers correctly
- **Weakness:** Label matching is fragile — Claude must generate an EXACT label string that matches another node. Typos, capitalization differences, or slight rephrasing break the dependency chain.

### probRange Inclusion: **6/10**
- `{"prob":40,"probRange":{"optimistic":65,"adverse":15}}` — clear format
- "For bottleneck/decision nodes, also include probRange"
- **Weakness:** No guidance on HOW to determine optimistic vs adverse. Claude will likely add arbitrary +/-25 spreads. Should specify: "optimistic = best documented case, adverse = worst documented case, with source".

---

## 4. 20 Scenario Dry Runs

### Scenario 1: "Open a cafe in Bandung with $5,000"

| Aspect | Result |
|--------|--------|
| Business type | `fnb-data` (matches "cafe") |
| KB files matched | `cafe-restaurant-business`, `fnb-data`, `indonesia-business-deep`, `master-funnels`, `country-specific-business` |
| RAG results | ~30 embeddings from cafe/restaurant/Indonesia data |
| Industry base probs | F&B: location_secured 60%, survive_year1 40%, break_even_6mo 30% |
| Country modifier | Indonesia: 0.60x → adjusted: location 36%, survive 24%, break_even 18% |
| Country data | REST API: Indonesia population 275M, IDR currency |
| Exchange rate | 1 USD = ~15,800 IDR |
| City data | Teleport API unlikely to have Bandung |
| GEM/OECD | None directly, but `indonesia-business-deep.json` has UMKM data |
| **GAP** | $5,000 = ~79M IDR. No data on MICRO cafe economics at this capital level. F&B baselines assume US-scale investment ($50-200K). The 0.60x modifier is crude — a $5K cafe in Bandung is a completely different business than a US cafe. Missing: Bandung-specific rent, foot traffic, local competition density, kopi culture economics. |

### Scenario 2: "Build a SaaS for small businesses"

| Aspect | Result |
|--------|--------|
| Business type | `saas-data` |
| KB files matched | `saas-data`, `master-funnels`, `scaling-bottlenecks`, `cac-benchmarks`, `pricing-psychology` |
| Industry base probs | SaaS: funding_seed 12%, product_market_fit 25%, reach_1k_mrr 18%, scale_10k 8% |
| Country modifier | None detected (no country mentioned) — uses 1.0x |
| **GAP** | "Small businesses" is vague — B2B SaaS for SMBs has very different economics than B2B enterprise. No differentiation in the prompt. Missing: B2B SMB-specific churn rates (higher than enterprise), average deal size, sales cycle length. |

### Scenario 3: "Start freelancing on Upwork as AI automation specialist"

| Aspect | Result |
|--------|--------|
| Business type | `upwork-data` |
| KB files matched | `upwork-data`, `career-employment`, `ai-tools-impact-2025`, `master-funnels` |
| Industry base probs | Upwork: profile_approved 55%, first_job 2.5%, active_year1 0.8%, top_rated 5% |
| Country modifier | None detected |
| Upwork mechanics | FULL section injected (lines 48-63 of STATIC_PROMPT) — excellent coverage |
| **GAP** | AI automation is a HIGH DEMAND niche (2-3x supply vs demand) but the base probs use GENERAL Upwork numbers. The prompt has the AI category stat ($75-150/hr, +1400% YoY) but doesn't instruct Claude to adjust base rates for high-demand niches. A first_job rate of 2.5% is for the average freelancer — AI specialists likely have 5-10%. |

### Scenario 4: "Move from Italy to Indonesia"

| Aspect | Result |
|--------|--------|
| Business type | None (not a business scenario) |
| KB files matched | `immigration-relocation`, `country-specific-business`, `indonesia-business-deep`, `life-transitions-decisions` |
| Countries detected | Italy, Indonesia |
| Country data | Both countries via REST API |
| Exchange rate | EUR and IDR injected |
| **GAP** | No immigration-specific archetype or funnel. Missing: KITAS/KITAP visa requirements, Italian bureaucracy for emigration (AIRE registration), cost of living comparison (Italy vs Bandung), health insurance requirements, tax treaty implications. The prompt has no "life transition" flow pattern — only business flows. Claude must improvise a non-business simulation structure. |

### Scenario 5: "Learn to code and switch careers at 35"

| Aspect | Result |
|--------|--------|
| Business type | None |
| KB files matched | `career-employment`, `education-stats`, `tech-adoption`, `ai-tools-impact-2025`, `consumption-action-gap` |
| Industry base probs | None (no business type) |
| **GAP** | No career-switch archetype. Missing: bootcamp completion rates by age, coding job placement rates for career changers, ageism data in tech hiring, realistic timeline for job-ready skills (6-12 months). The `real-probabilities.json` has education stats but not career-switch-specific ones. |

### Scenario 6: "Start a YouTube channel about finance"

| Aspect | Result |
|--------|--------|
| Business type | `creator-data` |
| KB files matched | `creator-data`, `youtube-guru-funnel-data`, `master-funnels`, `marketing-growth` |
| Industry base probs | Creator: first_1000_followers 30%, monetization_enabled 15%, earn_1k_month 5% |
| **GAP** | Finance niche is PREMIUM (higher CPMs, $15-30 vs avg $3-5) but creator baselines are generic across all niches. Missing: finance-specific YouTuber data (competition level, AdSense CPM for finance, compliance requirements like disclaimers). |

### Scenario 7: "Open a franchise McDonald's"

| Aspect | Result |
|--------|--------|
| Business type | `fnb-data` (matches "restaurant", "food") — but `franchise-business` keyword list also matches |
| KB files matched | `franchise-business`, `fnb-data`, `cafe-restaurant-business`, `master-funnels` |
| Industry base probs | F&B baselines applied — but franchise economics are COMPLETELY different from independent restaurants |
| **GAP** | Critical gap. McDonald's franchise: $1-2.2M initial investment, 90%+ survival rate (vs 40% for independent). The F&B baselines (survive_year1: 40%) are WRONG for franchises. No franchise-specific baseline probs exist. Missing: franchise approval rate, net worth requirements ($500K+), McDonald's specific unit economics. |

### Scenario 8: "Launch a crypto trading bot"

| Aspect | Result |
|--------|--------|
| Business type | None (no exact match — "crypto" is in `crypto-trading-investing` keywords but not in BUSINESS_TYPE_KEYWORDS) |
| KB files matched | `crypto-trading-investing`, `prediction-markets-trading`, `tech-adoption`, `master-funnels` |
| Crypto data | CoinGecko API: BTC, ETH, SOL, ADA prices + market cap |
| **GAP** | No trading bot archetype. Missing: algorithmic trading success rates, bot profitability data, slippage/latency economics, regulatory landscape (SEC, MiCA). Crypto market data is injected but it's just current prices — not useful for simulation probabilities. |

### Scenario 9: "Start a cleaning service with $500"

| Aspect | Result |
|--------|--------|
| Business type | None — `cleaning-service-business` is in KEYWORDS but not in BUSINESS_TYPE_KEYWORDS |
| KB files matched | `cleaning-service-business`, `master-funnels`, `side-hustle-entrepreneurship` |
| Industry base probs | NONE — no industry baseline for cleaning services |
| **GAP** | Major gap. Cleaning services are one of the most common small businesses. No archetype, no funnel, no base probs. Claude must generate all numbers from training data. Missing: customer acquisition cost for local services, average revenue per cleaning, retention rates, equipment costs at $500 budget. |

### Scenario 10: "Get an MBA at Harvard"

| Aspect | Result |
|--------|--------|
| Business type | None |
| KB files matched | `education-stats`, `education-probabilities-deep`, `career-employment`, `master-funnels` |
| Industry base probs | None |
| **GAP** | `real-probabilities.json` has general education stats but not MBA-specific. Missing: Harvard MBA acceptance rate (12%), GMAT requirements, ROI data, post-MBA salary lift, career outcomes by pre-MBA background. The prompt has no "education journey" flow pattern. |

### Scenario 11: "Become a professional photographer"

| Aspect | Result |
|--------|--------|
| Business type | None — `photography-business` is in KEYWORDS but not in BUSINESS_TYPE_KEYWORDS |
| KB files matched | `photography-business`, `creative-arts-career`, `career-employment`, `master-funnels` |
| Industry base probs | NONE |
| **GAP** | No photography business baseline. Missing: avg photographer income ($40K BLS), wedding photography market size, portfolio-to-booking conversion, equipment investment required, seasonality data. |

### Scenario 12: "Start dropshipping from Indonesia"

| Aspect | Result |
|--------|--------|
| Business type | `ecommerce-data` (matches "dropshipping") |
| KB files matched | `ecommerce-data`, `indonesia-business-deep`, `master-funnels`, `country-specific-business` |
| Country modifier | Indonesia: 0.60x |
| Industry base probs | E-commerce: first_sale 45%, profitable_month1 15%, scale_100k 8% |
| **GAP** | Dropshipping from Indonesia has unique challenges (shipping times to US/EU, payment processing, supplier relationships). The ecommerce baselines assume Shopify/US context. Missing: Indonesia-specific dropshipping data, Tokopedia/Shopee vs international marketplace comparison, shipping cost impact. |

### Scenario 13: "Open a gym in a small town"

| Aspect | Result |
|--------|--------|
| Business type | None — `gym-fitness-business` is in KEYWORDS but not in BUSINESS_TYPE_KEYWORDS |
| KB files matched | `gym-fitness-business`, `health-fitness`, `master-funnels`, `country-specific-business` |
| Industry base probs | NONE |
| **GAP** | No gym business baseline. Missing: gym membership retention rates (50% quit within 6 months), small town vs urban unit economics, equipment financing, seasonal patterns. "Small town" context is lost — no population size threshold or market saturation data. |

### Scenario 14: "Build an AI agency"

| Aspect | Result |
|--------|--------|
| Business type | `agency-data` (matches "agency") |
| KB files matched | `agency-data`, `ai-tools-impact-2025`, `master-funnels`, `scaling-bottlenecks` |
| Industry base probs | Agency: first_client 55%, retain_6mo 35%, scale_team 20%, profitable_year1 40% |
| **GAP** | "AI agency" is a 2024-2026 trend with very different economics than traditional agencies. AI agencies have lower headcount, higher margins, but faster commoditization risk. The agency baselines are for traditional service agencies. Missing: AI agency specific data (pricing tiers, typical deliverables, client education costs). |

### Scenario 15: "Start farming organic vegetables"

| Aspect | Result |
|--------|--------|
| Business type | None — `farming-agriculture-business` is in KEYWORDS but not in BUSINESS_TYPE_KEYWORDS |
| KB files matched | `farming-agriculture-business`, `master-funnels`, `country-specific-business` |
| Industry base probs | NONE |
| **GAP** | Major gap. Farming has excellent BLS data (50.5% 10-year survival — highest of all industries!) but no archetype. Missing: organic certification timeline (3 years), crop yield economics, land costs, seasonal cash flow, organic premium markup data. |

### Scenario 16: "Launch a mobile app"

| Aspect | Result |
|--------|--------|
| Business type | `saas-data` (matches "app") |
| KB files matched | `saas-data`, `tech-adoption`, `master-funnels`, `marketing-growth` |
| Industry base probs | SaaS baselines — but mobile apps have VERY different economics than SaaS |
| **GAP** | Mobile apps: 0.5% of apps are financially successful (Gartner), avg development cost $50-300K, App Store approval rate ~65%, user acquisition cost $1-5 CPI. SaaS baselines (MRR-focused) don't apply to mobile apps (download + IAP model). Massive mismatch. |

### Scenario 17: "Start a podcast"

| Aspect | Result |
|--------|--------|
| Business type | `creator-data` (matches "podcast") |
| KB files matched | `creator-data`, `master-funnels`, `marketing-growth`, `community-engagement-deep` |
| Industry base probs | Creator baselines — podcasting has very different economics than YouTube/TikTok |
| **GAP** | Podcasting: 90% quit before episode 3 ("podfade"), median podcast has 27 downloads per episode, monetization threshold ~5,000 downloads/episode. Creator baselines (1K followers) don't map to podcast metrics (downloads, not followers). Missing: podcast-specific funnel, equipment costs, hosting costs, ad CPM by niche. |

### Scenario 18: "Open a barbershop"

| Aspect | Result |
|--------|--------|
| Business type | None — `salon-beauty-business` is in KEYWORDS (matches "barbershop") but not in BUSINESS_TYPE_KEYWORDS |
| KB files matched | `salon-beauty-business`, `master-funnels`, `country-specific-business` |
| Industry base probs | NONE |
| **GAP** | No barbershop/salon baseline. Missing: chair rental vs booth rent economics, average revenue per chair, walk-in vs appointment ratios, repeat customer rates (very high in barbershops — 70-80%). |

### Scenario 19: "Become a digital nomad"

| Aspect | Result |
|--------|--------|
| Business type | None |
| KB files matched | `remote-work-digital-nomad`, `immigration-relocation`, `career-employment`, `life-transitions-decisions` |
| Industry base probs | None |
| **GAP** | Digital nomad is a LIFESTYLE scenario, not a business. The prompt has no lifestyle simulation pattern. Missing: visa logistics (digital nomad visas by country), cost of living comparison tool, income requirements, loneliness/burnout data, average duration before settling. The flow pattern (state -> action -> bottleneck) doesn't fit well. |

### Scenario 20: "Start an import/export business"

| Aspect | Result |
|--------|--------|
| Business type | None — `import-export-trade` is in KEYWORDS but not in BUSINESS_TYPE_KEYWORDS |
| KB files matched | `import-export-trade`, `master-funnels`, `country-specific-business`, `legal-datapoints` |
| Industry base probs | NONE |
| **GAP** | Major gap. Import/export: customs clearance, trade financing, letter of credit, freight forwarding, tariff calculations, compliance (FDA for food, EPA for chemicals). No archetype, no funnel, no base probs. Claude must generate everything from training data. |

---

## 5. Critical Weaknesses

### W1: Only 7 Industry Baselines (SEVERE)
Of 20 scenarios tested, only 8 matched an industry baseline (scenarios 1, 2, 3, 6, 7, 12, 14, 16). The remaining 12 get NO base probabilities. Claude must hallucinate all numbers for 60% of inputs.

**Affected scenarios:** Cleaning service, gym, barbershop, photography, farming, import/export, digital nomad, MBA, career switch, crypto bot, mobile app (mismatched to SaaS).

### W2: BUSINESS_TYPE_KEYWORDS vs KEYWORDS Mismatch (MODERATE)
There are 25+ data files in KEYWORDS that have no corresponding entry in BUSINESS_TYPE_KEYWORDS. This means the KB/RAG data is matched and injected, but the INDUSTRY BASELINE PROBABILITIES are missing. Files like `salon-beauty-business`, `gym-fitness-business`, `farming-agriculture-business`, `import-export-trade` exist with good keyword coverage but provide zero baseline probs.

### W3: Non-Business Scenarios Poorly Supported (SEVERE)
4 of 20 scenarios are non-business (move abroad, career switch, MBA, digital nomad). The prompt's flow pattern, node types, and probability structure are all business-oriented. There is no "life transition" archetype, no "education journey" archetype, no "relocation" archetype. Claude must improvise.

### W4: Country Modifier is Too Crude (MODERATE)
Indonesia = 0.60x is a single number applied to ALL probabilities uniformly. In reality:
- Indonesia F&B survival might be HIGHER than US (lower costs, local food culture)
- Indonesia SaaS might be LOWER (smaller TAM, payment infrastructure)
- Indonesia freelancing is different (lower rates but lower costs)
A single modifier cannot capture this.

### W5: Contradictory Data Authority (MODERATE)
The prompt injects: (a) sacred patterns as "basis for probabilities", (b) real probabilities as "VERIFIED — use these exact numbers", (c) industry baselines as "USE THESE AS BASE RATES", (d) RAG/KB data as "USE THESE DATA POINTS". Four sources compete for authority. Claude must decide which wins. No explicit priority order is given.

### W6: Prompt Token Budget Risk (LOW-MODERATE)
STATIC_PROMPT: ~3,500 tokens. Typical dynamic prompt: ~2,000-4,000 tokens. User message with KB context: ~2,000-5,000 tokens. Total input: ~8,000-12,000 tokens. Output: up to 4,000 tokens. Total per call: 12,000-16,000 tokens. For Haiku this is affordable, but the signal-to-noise ratio degrades as context grows.

### W7: No Output Validation (LOW)
The AI cascade attempts JSON parsing with repair, but there is NO schema validation. A response with missing `sacredRoots`, missing `probRange`, wrong node types, or missing fail edges would pass through without detection. `applyNodeDependencies` only handles one post-processing step.

---

## 6. Improvement Recommendations

### R1: Add 8-10 More Industry Baselines (HIGH IMPACT)
Add entries to `BUSINESS_BASE_PROBS` for the most common missing verticals:

**File: `src/lib/generate/data-fetcher.ts`, add to BUSINESS_BASE_PROBS object:**
```typescript
'salon-beauty-business': {
  label: 'Salon / Barbershop',
  probs: {
    location_secured: 0.65, survive_year1: 0.55, break_even_6mo: 0.40,
    regular_clients_50plus: 0.45, expand_chairs: 0.15, survive_year3: 0.45,
  },
  sources: 'BLS 2024, IBISWorld Beauty Industry 2024',
},
'gym-fitness-business': {
  label: 'Gym / Fitness Studio',
  probs: {
    location_secured: 0.55, member_retention_6mo: 0.50, survive_year1: 0.50,
    break_even_year1: 0.35, expand: 0.10, profitable_year2: 0.30,
  },
  sources: 'IHRSA 2024, BLS 2024',
},
'farming-agriculture-business': {
  label: 'Farming / Agriculture',
  probs: {
    land_secured: 0.50, first_harvest: 0.70, survive_year1: 0.80,
    profitable_year2: 0.35, organic_certified: 0.20, survive_year5: 0.55,
  },
  sources: 'USDA 2024, BLS 2024 (50.5% 10yr survival)',
},
'franchise-business': {
  label: 'Franchise',
  probs: {
    approved_by_franchisor: 0.30, financing_secured: 0.50, survive_year1: 0.92,
    break_even_year2: 0.65, profitable_year3: 0.75, multi_unit: 0.15,
  },
  sources: 'IFA Franchise Report 2024, FranData 2024',
},
'import-export-trade': {
  label: 'Import/Export',
  probs: {
    supplier_secured: 0.50, first_shipment: 0.40, customs_cleared: 0.70,
    profitable_year1: 0.30, survive_year3: 0.40, scale_1m_revenue: 0.10,
  },
  sources: 'ITC Trade Map 2024, WTO 2024',
},
'photography-business': {
  label: 'Photography',
  probs: {
    first_paid_gig: 0.60, consistent_bookings: 0.30, full_time_income: 0.20,
    survive_year1: 0.55, premium_pricing: 0.15,
  },
  sources: 'BLS OES Photographers 2024, PPA Benchmark 2024',
},
'cleaning-service-business': {
  label: 'Cleaning Service',
  probs: {
    first_client: 0.70, consistent_5_clients: 0.40, survive_year1: 0.60,
    hire_first_employee: 0.25, profitable_year1: 0.45, scale_10_employees: 0.10,
  },
  sources: 'BLS 2024, IBISWorld Cleaning Industry 2024',
},
```

Also add corresponding entries to `BUSINESS_TYPE_KEYWORDS` for each.

### R2: Add Data Authority Priority Order (HIGH IMPACT)
**File: `src/lib/generate/prompt-builder.ts`, add to STATIC_PROMPT after the 7 CRITICAL RULES:**
```
DATA AUTHORITY ORDER (when sources conflict, use this priority):
1. ARCHETYPE STAGES — if an archetype matches, its probabilities are the skeleton
2. INDUSTRY BASELINE PROBS — adjust archetype or use as base when no archetype exists
3. VERIFIED REAL PROBABILITIES — use to validate/override when they cover the exact metric
4. RAG/KB DATA POINTS — specific data for this scenario, use to refine
5. SACRED PATTERNS — explain WHY probabilities are what they are, don't override numbers
6. YOUR TRAINING KNOWLEDGE — only when no data from layers 1-5 covers the metric
```

### R3: Add Non-Business Flow Patterns (MEDIUM IMPACT)
**File: `src/lib/generate/prompt-builder.ts`, add to STATIC_PROMPT:**
```
NON-BUSINESS SCENARIOS: When the scenario is about life transitions (moving, career change, education, lifestyle change), adapt the flow:
- state("Current situation") → desire("What you want") → action("First step: research/apply") → bottleneck("Get accepted/approved?") → state("In transition") → bottleneck("Adapt successfully?") → outcome
- Use LIFE probabilities from real-probabilities.json (visa approval rates, degree completion rates, relocation success rates)
- Include emotional/psychological bottlenecks (culture shock, impostor syndrome, loneliness)
```

### R4: Country-Specific Modifiers by Industry (MEDIUM IMPACT)
Replace the single `COUNTRY_MODIFIERS` number with per-industry modifiers:
```typescript
// Instead of Indonesia: 0.60 for everything
'indonesia': {
  fnb: 0.75,      // Lower costs offset lower market size
  saas: 0.45,     // Small TAM, payment infrastructure gaps
  agency: 0.55,   // Growing demand but low rates
  creator: 0.50,  // Large population but low CPMs
  ecommerce: 0.65, // Tokopedia/Shopee ecosystem strong
  default: 0.60,
}
```

### R5: Fix Contradictory Instructions (HIGH IMPACT, LOW EFFORT)
**File: `src/lib/generate/prompt-builder.ts`, lines in STATIC_PROMPT:**

Change Rule 1 from:
> "If you truly cannot find ANY data for a node, use a closely related statistic and cite it honestly"

To:
> "If no data from the provided sources covers a node exactly, find the CLOSEST related statistic from the provided data and cite it with prefix 'PROXY:'. Example: 'PROXY: BLS 2024 general small business survival used for barbershop — no barbershop-specific data available'"

Change Rule 7 from:
> "Never estimate probabilities"

To:
> "Never invent probabilities. Every number must trace to a source — either provided data, a named report, or a PROXY statistic with honest labeling."

### R6: Enrich Edge Labels (LOW EFFORT, MEDIUM IMPACT)
**File: `src/lib/generate/prompt-builder.ts`, add to STATIC_PROMPT after edge label spec:**
```
EDGE LABEL ENRICHMENT: For bottleneck/gate/decision edges, append a brief stat after the label.
Examples: "fail — 60% fail here", "yes — if PMF found (25%)", "partial — surviving but stalled".
This gives users instant context without clicking nodes.
```

### R7: Add probRange Guidance (LOW EFFORT, MEDIUM IMPACT)
**File: `src/lib/generate/prompt-builder.ts`, clarify the probRange instruction:**

Change:
> `For bottleneck/decision nodes, also include "probRange" with optimistic and adverse`

To:
> `For bottleneck/decision nodes, include "probRange": {"optimistic": best_documented_case, "adverse": worst_documented_case}. The optimistic value should come from the most favorable study/context you can find. The adverse value from the most unfavorable. Both must cite a real source in the node's "source" field. Do NOT just add/subtract 20 from prob.`

### R8: Add Output Validation (MEDIUM EFFORT, HIGH IMPACT)
**File: `src/lib/generate/response-parser.ts`, add a validation function:**

After JSON parsing, validate:
- Every bottleneck/gate/decision has both pass AND fail edges
- Every node has `source` (non-empty string)
- Every bottleneck/decision has `probRange`
- Every node has `sacredRoots` (non-empty array)
- Node count is 8-16
- At least one `outcome-good` and one `outcome-bad` exist
- No orphan nodes (every node appears in at least one edge)

Log warnings for failures but don't reject the response.

### R9: Move Sacred Root IDs Out of STATIC_PROMPT (LOW EFFORT, TOKEN SAVINGS)
The 36 sacred root IDs with full descriptions take ~800 tokens in STATIC_PROMPT. Move them to the dynamic prompt and only include the 5 most relevant (already computed by `matchSacredRoots()`). The full list is unnecessary in every request — Claude knows the IDs from the subset.

**Estimated token savings:** ~600 tokens per request.

### R10: Add a "Bad Example" to the Prompt (LOW EFFORT, HIGH IMPACT)
Add after the JSON format example:
```
BAD EXAMPLE (DO NOT generate output like this):
- Node with prob: 50 and no source → WRONG, 50% is the lazy default
- Node with desc: "This is an important step" → WRONG, must contain a specific number
- Bottleneck with only a "pass" edge and no "fail" edge → WRONG, every gate needs both paths
- Node with source: "Various sources" → WRONG, must name specific reports with year
```

---

## Summary Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Prompt structure clarity | 7/10 | Good but too long, some contradictions |
| Data integration | 8/10 | Excellent RAG + KB, but gaps in coverage |
| Node type definitions | 8/10 | Clear, but `loop` and `start` types undefined |
| Edge label specification | 5/10 | Only binary labels, missed enrichment opportunity |
| JSON format clarity | 7/10 | Example too minimal, some fields undocumented |
| Probability realism | 7/10 | Strong when baselines exist, weak otherwise |
| Coverage breadth | 5/10 | Only 7 of ~20 common verticals have baselines |
| Non-business support | 3/10 | Prompt is business-first, lifestyle scenarios struggle |
| Sacred integration | 7/10 | Well-designed but authority conflict with stats |
| Token efficiency | 6/10 | Sacred root list in static prompt is wasteful |
| **Overall** | **6.3/10** | Solid foundation with clear gaps in coverage and consistency |

### Top 3 Actions by Impact-to-Effort Ratio
1. **R1: Add industry baselines** — 8 new entries, ~100 lines of code, fixes 60% of scenarios
2. **R2: Add data authority order** — 6 lines in prompt, eliminates source conflict confusion
3. **R5: Fix contradictions** — 4 line changes, removes logical impossibilities from instructions
