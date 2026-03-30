# Simulator v2 -- 60-Day Execution Plan

From narrative decision map (60/100 credibility) to reality prediction engine (100+/100).

Work schedule: 6-8 hours/day, 3-4 tasks/day, checkboxes for tracking.

**REGOLA NON-NEGOZIABILE**: Ogni giorno termina con un blocco **End-of-Day Test & Fix**. Nessun giorno è "completato" finché i test non passano. Se qualcosa è rotto → fix immediato prima di passare al giorno dopo.

---

## Index

- [Progress Tracker](#progress-tracker)
- [Phase 1: Data Foundation -- Days 1-8](#phase-1-data-foundation----days-1-8)
- [Phase 1B: Conditional Engine -- Days 9-22](#phase-1b-conditional-engine----days-9-22)
- [Phase 2: Recursive Simulation -- Days 23-28](#phase-2-recursive-simulation----days-23-28)
- [Phase 3: User Profile -- Days 29-34](#phase-3-user-profile----days-29-34)
- [Phase 4: Auto Data Pipeline -- Days 35-40](#phase-4-auto-data-pipeline----days-35-40)
- [Phase 5: Backtesting -- Days 41-50](#phase-5-backtesting----days-41-50)
- [Phase 5B: Community Feedback Loop -- Days 51-54](#phase-5b-community-feedback-loop----days-51-54)
- [Phase 6: Multi-Agent Simulation -- Days 55-58](#phase-6-multi-agent-simulation----days-55-58)
- [Phase 7: Public API -- Days 59-63](#phase-7-public-api----days-59-63)
- [Overnight Agent Tasks](#overnight-agent-tasks)

---

## Progress Tracker

| Phase | Days | Tasks | Completed | Credibility Gain |
|-------|------|-------|-----------|-----------------|
| 1 Data Foundation | 1-8 | 27 | 0/27 | +25% |
| 1B Conditional Engine | 9-22 | 46 | 0/46 | +35% |
| 2 Recursive Simulation | 23-28 | 21 | 0/21 | +10% |
| 3 User Profile | 29-34 | 20 | 0/20 | +15% |
| 4 Auto Pipeline | 35-40 | 20 | 0/20 | +15% |
| 5 Backtesting | 41-50 | 33 | 0/33 | +30% |
| 5B Community Feedback | 51-54 | 13 | 0/13 | +5% |
| 6 Multi-Agent | 55-58 | 13 | 0/13 | +10% |
| 7 Public API | 59-63 | 16 | 0/16 | +5% |
| **TOTAL** | **63** | **209** | **0/209** | **150%** |

Current credibility: 60/100
Target: 100+/100 (absolute prediction engine)

---

## Phase 1: Data Foundation -- Days 1-8

Goal: Zero "Estimated" labels for top 100 scenarios. RAG from 9.5K to 50K+ rows. 5-10 new live APIs.

### Day 1 -- RAG Full Re-Index + Audit

- [x] **Task 1.1: Audit indexed vs unindexed JSON files** (1h) — DONE 2026-03-30
  - Result: 46/113 files indexed, 67 missing, 9,511 rows total
  - Used Supabase MCP directly (no script needed)
  - Audit: all 68 missing files have valid formats — chunking works, just never re-run

- [x] **Task 1.2: Fix index-data.ts chunking for skipped file formats** (1.5h) — NOT NEEDED
  - All 113 eligible files produce chunks with existing handlers (0 zero-chunk files)
  - Root cause: files added after last index run, not format issues
  - Optimization: embedding dimensions 1536 → 512 (98.6% quality, 3x less storage, $0/mo vs $25/mo)
  - Schema: ivfflat → HNSW (m=16, ef=64), World Bank sampling 50 → 200

- [ ] **Task 1.3: Run full re-index** (running)
  - Supabase schema migrated: vector(512), HNSW index, search_embeddings function updated
  - `rag.ts` and `index-data.ts` updated with dimensions: 512
  - Full re-index launched on all 113 files (~50K chunks)
  - Test: verify 40K+ rows, 110+ distinct files after completion

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify Supabase: `SELECT COUNT(*), COUNT(DISTINCT file) FROM simulator_embeddings` → 40K+ rows, 110+ files
  - [ ] Test RAG search: run a simulation "open a cafe in Bandung" → check RAG context has data from multiple new files
  - [ ] Check no regression: existing simulations still generate correctly

### Day 2 -- New Live APIs (Batch 1: Economics)

- [x] **Task 2.1: Add Eurostat API client** — DONE (Day 1 sera)
  - File: `src/lib/apis/eurostat.ts` — 5 datasets, 24h cache, MRL dimensions

- [x] **Task 2.2: Add FRED API client** — DONE (Day 1 sera)
  - File: `src/lib/apis/fred.ts` — 6 series, 24h cache
  - Note: manca FRED_API_KEY in .env.local (gratis, registra su fred.stlouisfed.org)

- [x] **Task 2.3: Add Numbeo Cost of Living** — DONE (Day 1 sera)
  - File: `src/lib/apis/numbeo.ts` — 50 citta, fuzzy match, static dataset 2024

- [x] **Task 2.0: Bulk data download** — DONE (overnight Day 1)
  - Script: `scripts/bulk-download.ts`
  - Fonti: World Bank expanded (25 indicators), BLS detailed (20 series), Eurostat (8 datasets), UN SDG (10 indicators), REST Countries, OECD proxy (15 indicators)
  - Target: ~500K new data points downloaded overnight

- [ ] **Task 2.4: Wire new APIs into generate route** (1h)
  - Files: `src/app/api/generate/route.ts`
  - What: Import the 3 new API clients. In the generation flow, after RAG search, call the relevant APIs based on detected location/topic keywords. Inject their data as additional context for Claude. Format: `LIVE DATA (Eurostat): GDP growth Germany 1.2% (2025)...`
  - Dependencies: Tasks 2.1-2.3
  - Test: Generate "start a business in Germany" -- the response should contain Eurostat GDP data, not "Estimated"
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Test each new API client independently (Eurostat, FRED, Numbeo)
  - [ ] Generate "start a business in Germany" → verify Eurostat data appears, no "Estimated"
  - [ ] Generate "open a cafe in Bandung" → verify Numbeo cost data appears
  - [ ] Check API error handling: disconnect wifi, verify graceful fallback

### Day 3 -- New Live APIs (Batch 2: Business Intelligence)

- [ ] **Task 3.1: Add GEM (Global Entrepreneurship Monitor) data** (1.5h)
  - Files: Create `data/gem-entrepreneurship-2024.json`, create `src/lib/apis/gem.ts`
  - What: GEM publishes annual reports with entrepreneurship rates by country (TEA rate, established business ownership, entrepreneurial intentions, fear of failure rate). Download the latest dataset from gemconsortium.org (they have public CSV/Excel). Parse into JSON with structure: `{country, year, tea_rate, established_rate, intentions, fear_of_failure, source}`. Should cover 50+ countries.
  - Dependencies: none
  - Test: `data/gem-entrepreneurship-2024.json` has 50+ country entries. RAG search for "entrepreneurship Indonesia" returns GEM data.
  - Time: 1.5h

- [ ] **Task 3.2: Add CB Insights / Crunchbase startup failure data** (1.5h)
  - Files: Create `data/startup-failure-reasons-2024.json`
  - What: Compile CB Insights top 20 startup failure reasons (2024 update), Crunchbase funding data (median seed/Series A by country/industry), Y Combinator batch stats (acceptance rate, survival rate, median valuation). Structure as deep probability data: `{category, metric, value, source, year}`. At least 100 data points.
  - Dependencies: none
  - Test: RAG search for "why startups fail" returns CB Insights data with specific percentages and sources
  - Time: 1.5h

- [ ] **Task 3.3: Add ILO (International Labour Organization) API** (1h)
  - Files: Create `src/lib/apis/ilo.ts`
  - What: ILO has a free SDMX API (ilostat.ilo.org/data/). Fetch: unemployment by country/age/gender, wages by sector/country, informal employment rate, youth unemployment. Parse into structured JSON. Focus on SE Asia + Europe + Americas.
  - Dependencies: none
  - Test: `fetchILO('unemployment', 'Indonesia')` returns `{rate: 5.3, year: 2024, source: 'ILO ILOSTAT'}`
  - Time: 1h

- [ ] **Task 3.4: Index new data files into RAG** (1h)
  - Files: `scripts/index-data.ts`
  - What: Run indexer on the 3 new data files (GEM, startup failure, ILO cache). Verify they appear in RAG search results.
  - Dependencies: Tasks 3.1-3.3 + Day 1 re-index
  - Test: `SELECT COUNT(DISTINCT file) FROM simulator_embeddings` increased by 3
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Test GEM, Crunchbase proxy, and OECD API clients
  - [ ] Generate a startup scenario → verify new data sources appear in output
  - [ ] Verify caching works: second call should be instant (no API hit)

### Day 4 -- New Live APIs (Batch 3: Quality of Life + Photo Fix)

- [ ] **Task 4.1: Add Teleport Quality of Life enhanced** (1h)
  - Files: Modify `src/app/api/generate/route.ts` (existing Teleport call)
  - What: The current Teleport integration only fetches city scores. Enhance to also fetch: salary data (by job title), cost breakdown (rent, food, transport), startup ecosystem score. Add caching. Structure the enhanced data as additional context lines.
  - Dependencies: none
  - Test: Generate "move to Berlin as software engineer" -- response includes Teleport salary data for software engineers in Berlin
  - Time: 1h

- [ ] **Task 4.2: Add Open Exchange Rates enhanced** (1h)
  - Files: Modify existing exchange rate call in `src/app/api/generate/route.ts`
  - What: Current integration fetches basic rates. Enhance: add historical rates (1 year ago) to compute YoY change, add purchasing power parity data. When the scenario mentions money/budget/investment, inject currency context: "1 USD = 16,200 IDR (down 3.2% YoY)".
  - Dependencies: none
  - Test: Generate "invest $10K in Indonesia" -- response includes current IDR rate AND trend
  - Time: 1h

- [ ] **Task 4.3: Fix photo scenario keyword extraction** (2h)
  - Files: `src/app/api/analyze-photo/route.ts`, `src/lib/rag.ts`
  - What: Currently photo scenarios produce overly descriptive text ("a person sitting at a desk with a laptop") that fails RAG matching. Add a post-processing step: after Claude Vision returns the scene analysis, extract ONLY business/life keywords (e.g. "laptop" -> "tech startup", "freelance", "remote work"; "restaurant kitchen" -> "F&B", "cafe business", "food service"). Create a keyword mapping file `src/lib/photo-keywords.ts` with 200+ visual-to-business mappings. Use these extracted keywords for RAG search instead of the raw description.
  - Dependencies: none
  - Test: Upload a photo of a cafe -- the generated seeds should match RAG data about cafe/F&B business, not generic "person in room" data
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Test quality of life APIs (Teleport, Numbeo extended)
  - [ ] Photo scenario test: upload 3 different photos → verify keywords are business-relevant, not visual descriptions
  - [ ] Generate from each photo → check RAG matches are relevant

### Day 5 -- Eliminate "Estimated" Labels

- [ ] **Task 5.1: Audit top 100 scenarios for "Estimated" occurrences** (1.5h)
  - Files: Create `scripts/test-100-simulations.ts` (replace existing `scripts/test-100-simulations.js`)
  - What: Define 100 most common scenarios (20 business, 15 career, 15 finance, 10 education, 10 health, 10 relationships, 10 immigration, 10 misc). For each, call the generate API and count how many nodes have "Estimated" as source vs real sources. Output a report: scenario, total nodes, estimated count, real count, percentage. Save report to `data/audit-estimated.json`.
  - Dependencies: Day 1 re-index complete, Day 2-3 APIs wired
  - Test: Run the script -- it produces a JSON report. Count scenarios with >50% "Estimated" -- this is the target list.
  - Time: 1.5h (mostly API wait time, run in parallel batches of 5)

- [ ] **Task 5.2: Expand probability-matcher.ts with 200+ entries** (2h)
  - Files: `src/lib/probability-matcher.ts`
  - What: Currently has ~60 hardcoded entries in `REAL_PROBS`. Expand to 200+ by: (a) programmatically extracting top stats from ALL data/*.json files at build time, (b) adding keyword variants (e.g. "open cafe" = "start restaurant" = "F&B business"), (c) adding country-specific variants ("business Indonesia" vs "business USA"). Use fuzzy matching: if the node label contains ANY of the keywords, match. Add a relevance score to pick the best match when multiple apply.
  - Dependencies: none (can be done in parallel with 5.1)
  - Test: Match rate on the 100 test scenarios should be >80% (vs current ~40%)
  - Time: 2h

- [ ] **Task 5.3: Add source citation fallback chain** (1.5h)
  - Files: `src/app/api/generate/route.ts`
  - What: Modify the Claude prompt to enforce a strict source chain: (1) First try RAG match -- cite the exact source, (2) If no RAG match, try probability-matcher -- cite the hardcoded source, (3) If no matcher, try live API data -- cite the API, (4) ONLY if all 3 fail, use "Estimated (Claude inference based on [reasoning])". The prompt should explicitly list which data sources are available for this specific scenario. Add a post-generation validator that checks each node's source field and flags any remaining "Estimated" for logging.
  - Dependencies: Tasks 5.1, 5.2
  - Test: Re-run 10 scenarios from the audit -- "Estimated" count should drop by 60%+
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Run top 100 scenarios list, count "Estimated" labels → target: 0
  - [ ] Compare before/after: document improvement percentage
  - [ ] Spot-check 10 random simulations for data accuracy

### Day 6 -- Data Quality + Coverage Gaps

- [ ] **Task 6.1: Create missing data for uncovered categories** (2h)
  - Files: Create 3-5 new JSON files in `data/`
  - What: Based on the Day 5 audit, identify the TOP 10 categories where "Estimated" still appears. For each, research and compile real data. Likely gaps: (a) `data/visa-immigration-by-country.json` -- visa success rates, processing times, costs for top 30 countries, (b) `data/freelance-gig-economy-2024.json` -- platform success rates (Upwork, Fiverr, Toptal acceptance rate, average earnings), (c) `data/real-estate-investment-global.json` -- property appreciation rates, rental yields, vacancy rates by city. Each file should have 50+ data points with sources.
  - Dependencies: Day 5 audit results
  - Test: Each new file passes JSON lint. Run indexer on new files. Re-test previously "Estimated" scenarios -- they now show real sources.
  - Time: 2h

- [ ] **Task 6.2: Add semantic search fallback with keyword expansion** (1.5h)
  - Files: `src/lib/rag.ts`
  - What: Currently RAG embeds the raw scenario text. Add a keyword expansion step before embedding: extract the top 5 keywords from the scenario, then expand each with 3 synonyms using a static synonym map (no API call needed). Concatenate expanded keywords with the original text before embedding. This improves recall for scenarios that use unusual phrasing.
  - Dependencies: none
  - Test: RAG search for "become a content creator" now also returns data from `youtube-guru-funnel-data.json` and `fame-entertainment-probabilities.json`
  - Time: 1.5h

- [ ] **Task 6.3: Run full audit again and log results** (1h)
  - Files: `scripts/test-100-simulations.ts`
  - What: Re-run the 100-scenario audit. Compare with Day 5 results. Target: <10% "Estimated" across all scenarios. Log the improvement in `data/audit-estimated-v2.json`.
  - Dependencies: Tasks 6.1, 6.2
  - Test: "Estimated" rate dropped from ~40% to <10%
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Run coverage report: which categories still have gaps?
  - [ ] Test edge cases: very niche scenarios (e.g. "start a llama farm in Peru")
  - [ ] Verify data freshness: no data older than 2023 in top results

### Day 7 -- World Bank + BLS Bulk Enhancement

- [ ] **Task 7.1: Download remaining World Bank indicators** (1.5h)
  - Files: Existing `data/worldbank-*.json` files (10 files, 247K data points)
  - What: The current World Bank files cover GDP, population, education, health, labor, business, poverty, environment, financial, gender. Add 5 more indicator groups: (a) Trade/exports by country, (b) Infrastructure (internet, mobile, electricity), (c) Tourism statistics, (d) Agriculture, (e) Urban development. Use World Bank API v2. Append to existing files or create new ones. Target: 50K+ additional data points.
  - Dependencies: none
  - Test: `ls data/worldbank-*.json | wc -l` = 15. Total World Bank data points > 300K.
  - Time: 1.5h

- [ ] **Task 7.2: Add BLS bulk data download** (1.5h)
  - Files: Existing `data/bls-*.json` files (7 files)
  - What: Currently have CPI, employment, occupational, PPI, productivity, unemployment, wages. Add: (a) Job openings by industry (JOLTS), (b) Consumer expenditure by category, (c) Work stoppages/strikes, (d) Workplace injuries by industry, (e) Employee benefits by industry. Use BLS Public Data API v2 (free, 500 req/day).
  - Dependencies: none
  - Test: `ls data/bls-*.json | wc -l` = 12. Total BLS data points > 50K.
  - Time: 1.5h

- [ ] **Task 7.3: Index all new data into RAG** (1h)
  - Files: `scripts/index-data.ts`
  - What: Run incremental index on the new World Bank and BLS files only (not full re-index). Add an `--incremental` flag to the indexer that only processes files not yet in the embeddings table.
  - Dependencies: Tasks 7.1, 7.2
  - Test: `SELECT COUNT(*) FROM simulator_embeddings` increased by 5K+. New World Bank/BLS categories appear in RAG search.
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify World Bank enhanced data appears in country-specific sims
  - [ ] BLS bulk data test: career/salary scenarios use real BLS numbers
  - [ ] Performance check: RAG search still <100ms with larger dataset

### Day 8 -- Phase 1 Finalization + Buffer

- [ ] **Task 8.1: Final "Estimated" audit -- zero tolerance** (1h)
  - Files: `scripts/test-100-simulations.ts`
  - What: Run the 100-scenario test one final time. For any remaining "Estimated" nodes, manually research and add the missing data point to the relevant JSON file. Target: 0-2 "Estimated" across 100 scenarios (excluding truly novel/obscure scenarios).
  - Dependencies: All of Phase 1
  - Test: Report shows <2% "Estimated" rate
  - Time: 1h

- [ ] **Task 8.2: Data quality validation script** (1.5h)
  - Files: Create `scripts/validate-data.ts`
  - What: Create a validator that checks ALL data files for: (a) valid JSON, (b) no data older than 2022 (flag outdated), (c) all probability values are 0-100, (d) all entries have a `source` field, (e) no duplicate entries, (f) no empty/null values. Output a quality report.
  - Dependencies: none
  - Test: Run validator -- it reports any quality issues. Fix them.
  - Time: 1.5h

- [ ] **Task 8.3: Document all data sources** (1h)
  - Files: `data/INDEX.md`, `docs/data.md`
  - What: Update the data index with ALL files (now 120+), their row counts, sources, freshness dates. Update `docs/data.md` with the new API list (now 10+ live APIs). Include API rate limits and costs.
  - Dependencies: All of Phase 1
  - Test: `data/INDEX.md` lists every single JSON file with accurate metadata
  - Time: 1h

---

- [ ] **End-of-Day Test & Fix**
  - [ ] **Full regression test**: run 20 diverse scenarios, verify all pass
  - [ ] **Performance benchmark**: measure avg generation time (target: <5s)
  - [ ] **Storage check**: Supabase size still under 500MB free tier
  - [ ] **Phase 1 sign-off**: document credibility improvement with evidence

## Phase 1B: Conditional Engine -- Days 9-22

Goal: P(node) = f(business_model, location, budget, timeline), not constant. This is the BIGGEST credibility leap (+35%).

### Day 9 -- Engine Architecture + Type System

- [ ] **Task 9.1: Design the conditional probability type system** (2h)
  - Files: Create `src/lib/engines/types.ts`
  - What: Define TypeScript interfaces for the entire conditional engine:
    ```
    BusinessModel: 'saas' | 'service' | 'fnb' | 'marketplace' | 'content' | 'ecommerce' | 'hardware'
    ProbabilityRange: { base: number, optimistic: number, adverse: number }
    ConditionalFactors: { model: BusinessModel, location: string, budget: number, timeline: number, experience: ExperienceLevel }
    NodeProbability: { range: ProbabilityRange, factors: ConditionalFactors, sources: string[], confidence: number }
    BurnModel: { monthly_burn: number, runway_months: number, death_probability_by_month: number[] }
    EngineResult: { nodes: NodeProbability[], burn: BurnModel, warnings: string[] }
    ```
  - Dependencies: none
  - Test: TypeScript compiles with no errors. Types are imported in other engine files.
  - Time: 2h

- [ ] **Task 9.2: Create the engine registry** (1.5h)
  - Files: Create `src/lib/engines/registry.ts`
  - What: An engine registry that maps business models to their specific probability engines. Each engine implements a common interface `IBusinessEngine` with methods: `getNodeProbabilities(scenario, factors) -> NodeProbability[]`, `getBurnModel(factors) -> BurnModel`, `getWarnings(factors) -> string[]`. The registry auto-selects the right engine based on scenario keywords. If no specific engine matches, fall back to a `GenericEngine`.
  - Dependencies: Task 9.1
  - Test: `getEngine('I want to open a cafe')` returns the F&B engine. `getEngine('build a SaaS')` returns the SaaS engine.
  - Time: 1.5h

- [ ] **Task 9.3: Create the SaaS engine (first engine)** (2h)
  - Files: Create `src/lib/engines/saas.ts`, create `data/engine-saas-probabilities.json`
  - What: The SaaS engine contains industry-specific probabilities for EVERY common node type in a SaaS simulation. Data file structure:
    ```
    { "find_problem": { base: 40, optimistic: 65, adverse: 15, source: "Startup Genome 2024" },
      "build_mvp": { base: 70, optimistic: 90, adverse: 35, source: "YC stats" },
      "get_first_customer": { base: 25, optimistic: 50, adverse: 8, source: "First Round Capital" },
      ... }
    ```
    Include modifiers: budget < $5K -> all probabilities * 0.6. Budget > $50K -> * 1.3. Timeline < 3 months -> * 0.7. Experience = none -> * 0.5. Location in tech hub -> * 1.2.
    The data file should have 30+ node types with sourced probabilities.
  - Dependencies: Task 9.2
  - Test: `saasEngine.getNodeProbabilities('build SaaS', {budget: 5000, timeline: 6, experience: 'beginner', location: 'San Francisco'})` returns 30+ probabilities with ranges
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Type system compiles: `npx tsc --noEmit` passes
  - [ ] Engine architecture renders correctly in React Flow
  - [ ] Unit test: SaaS engine returns different probabilities than F&B engine

### Day 10 -- F&B Engine + Service Engine

- [ ] **Task 10.1: Create the F&B engine** (2h)
  - Files: Create `src/lib/engines/fnb.ts`, create `data/engine-fnb-probabilities.json`
  - What: F&B (Food & Beverage) engine with probabilities specific to restaurants, cafes, food trucks, dark kitchens, catering. Include: location scouting success, permit acquisition, supplier negotiation, first month survival, break-even timeline, food cost ratio targets, staff retention. Modifiers: location (tourist area +20%, residential -15%), budget (< $10K -> food truck/dark kitchen only, > $100K -> full restaurant), experience (chef background +30%, no F&B -40%). At least 30 node types with data from: National Restaurant Association, Toast POS reports, CHD Expert.
  - Dependencies: Task 9.2
  - Test: `fnbEngine.getNodeProbabilities('open cafe Bandung', {budget: 8000, experience: 'none'})` returns probabilities that are DIFFERENT from `{budget: 80000, experience: 'expert'}`
  - Time: 2h

- [ ] **Task 10.2: Create the Service/Agency engine** (2h)
  - Files: Create `src/lib/engines/service.ts`, create `data/engine-service-probabilities.json`
  - What: Service business engine covering: freelancing, consulting, agencies, coaching. Node types: find first client, set pricing, build portfolio, get referrals, hire first employee, hit $10K MRR, scale to team. Modifiers: network size (strong network +40%), experience (expert in domain +50%), location (tier 1 city +15% for agencies), budget (low budget actually OK for services -> no penalty below $5K). Data from: Upwork reports, HubSpot agency benchmarks, coaching industry stats.
  - Dependencies: Task 9.2
  - Test: Service engine returns higher probabilities for experienced consultants than for beginners, as expected
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] F&B engine test: "open a cafe" uses F&B-specific probabilities
  - [ ] Service engine test: "start a consulting firm" uses service probabilities
  - [ ] Both engines produce ranges (base/optimistic/adverse), not single values

### Day 11 -- Marketplace + Content Engines

- [ ] **Task 11.1: Create the Marketplace engine** (2h)
  - Files: Create `src/lib/engines/marketplace.ts`, create `data/engine-marketplace-probabilities.json`
  - What: Two-sided marketplace engine (like Airbnb, Uber, Etsy). Node types: solve chicken-and-egg, onboard supply side, onboard demand side, reach liquidity, unit economics positive, fundraise, scale. This is the hardest business model -- probabilities are LOW. Modifiers: budget (< $50K -> almost impossible for marketplace, needs network effects), location (local marketplace easier than global), experience (marketplace experience rare, huge bonus). Data from: a16z marketplace guides, Lenny Rachitsky data, NFX.
  - Dependencies: Task 9.2
  - Test: Marketplace engine shows very low base probabilities (5-15% for key milestones) but reasonable optimistic scenarios for well-funded experienced founders
  - Time: 2h

- [ ] **Task 11.2: Create the Content engine** (1.5h)
  - Files: Create `src/lib/engines/content.ts`, create `data/engine-content-probabilities.json`
  - What: Content business engine: YouTube, newsletter, podcast, blog, course creator. Node types: choose niche, create first content, reach 100 subscribers, reach 1000, monetize, reach $1K/mo, reach $10K/mo, diversify revenue. Modifiers: platform (YouTube hardest but highest ceiling, newsletter most predictable), consistency (posting frequency is the #1 factor), niche (business/finance highest RPM, lifestyle lowest). Data from: YouTube Creator Academy, Substack public data, ConvertKit reports, Teachable marketplace stats.
  - Dependencies: Task 9.2
  - Test: Content engine for "start YouTube channel about cooking" vs "start newsletter about SaaS" returns meaningfully different probabilities
  - Time: 1.5h

- [ ] **Task 11.3: Create the Generic fallback engine** (1h)
  - Files: Create `src/lib/engines/generic.ts`
  - What: For scenarios that do not match any specific engine (career change, education, immigration, health goals, etc.). Uses the existing probability-matcher.ts data but wraps it in the engine interface. Applies basic modifiers: budget, timeline, experience. Does NOT have industry-specific logic -- that is the point of the specialized engines.
  - Dependencies: Task 9.2
  - Test: `getEngine('learn piano')` returns GenericEngine. It still provides reasonable probabilities from existing data.
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Marketplace engine test: "build an Airbnb clone" → marketplace probabilities
  - [ ] Content engine test: "start a YouTube channel" → content creator probabilities
  - [ ] Verify engine auto-selection: correct engine chosen based on scenario keywords

### Day 12 -- Wire Engines into Generation Pipeline

- [ ] **Task 12.1: Modify generate route to use conditional engine** (2h)
  - Files: `src/app/api/generate/route.ts`
  - What: Major refactor of the generation flow. After detecting the scenario topic, select the appropriate engine from the registry. Pass `ConditionalFactors` (extracted from context tags: location, budget, timeline, experience). The engine returns `NodeProbability[]` with ranges. Inject these into the Claude prompt as: "CONDITIONAL PROBABILITIES (from [Engine] engine): Node X: base 14%, optimistic 22%, adverse 6% (source: BLS 2024). Modifiers applied: budget=$5K (-20%), experience=none (-40%), location=Bandung (neutral)."
  - Dependencies: All engines (Day 9-11)
  - Test: Generate "open cafe in Bandung with $5K and no experience" -- nodes show RANGES (not single numbers) and sources cite engine-specific data
  - Time: 2h

- [ ] **Task 12.2: Update SimNode to display probability ranges** (1.5h)
  - Files: `src/components/nodes/SimNode.tsx`
  - What: Currently nodes show a single probability number (e.g. "14%"). Change to show a range: "8-18% (base: 14%)". Use a mini bar visualization: a thin horizontal bar where the range is shown as a gradient (red left = adverse, green right = optimistic, dot at base). The range should be visually compact (fits in existing node width).
  - Dependencies: Task 12.1 (needs range data in node)
  - Test: Nodes display "8-22%" with a mini range bar. Hovering shows the full breakdown (base, optimistic, adverse, factors applied).
  - Time: 1.5h

- [ ] **Task 12.3: Update Dashboard to show conditional factors** (1h)
  - Files: `src/components/Dashboard.tsx`
  - What: Add a "Factors Applied" section to the Dashboard showing: detected business model, location modifier, budget modifier, timeline modifier, experience modifier. Each with its impact (e.g. "Budget: $5,000 -> -20% on all nodes"). This makes the simulation TRANSPARENT -- users understand WHY their probabilities are what they are.
  - Dependencies: Task 12.1
  - Test: Dashboard shows factors section with correct modifiers for the current simulation
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] End-to-end: generate 5 scenarios of different types, verify each uses correct engine
  - [ ] Dashboard shows range (base/optimistic/adverse) instead of single probability
  - [ ] No regression: old templates still work correctly

### Day 13 -- Burn/Runway Modeling

- [ ] **Task 13.1: Build the burn rate calculator** (2h)
  - Files: Create `src/lib/engines/burn-model.ts`
  - What: Given budget and monthly expenses (estimated from business model + location), calculate: (a) runway in months, (b) probability of running out of money at each month, (c) break-even timeline estimate, (d) "death zone" -- the month range where most businesses of this type die. Formula: `P(death_month_n) = base_failure_rate * (1 + cash_pressure_factor)` where `cash_pressure_factor` increases exponentially as runway approaches 0. Use real data: median burn rates by business type (SaaS: $15-50K/mo, F&B: $3-15K/mo, Service: $1-5K/mo) from First Round Capital and SBA data.
  - Dependencies: Engine types (Day 9)
  - Test: `calculateBurn({model: 'saas', budget: 50000, location: 'San Francisco'})` returns `{monthly_burn: 25000, runway: 2, death_probability: [0.05, 0.15, 0.45, 0.80, ...]}`
  - Time: 2h

- [ ] **Task 13.2: Integrate burn model into simulation nodes** (1.5h)
  - Files: `src/app/api/generate/route.ts`, `src/lib/dataflow-engine.ts`
  - What: When generating nodes, inject burn/runway data. Add a special "Runway" indicator that decreases as the simulation progresses through time-consuming nodes. If a node takes "3-6 months" and the user only has 4 months of runway, flag it with a warning. The dataflow engine should propagate runway state: each node consumes time and money, reducing available runway for subsequent nodes.
  - Dependencies: Task 13.1
  - Test: Generate "start SaaS with $10K" -- the simulation shows a runway counter decreasing. Late-stage nodes are flagged as "warning: runway may be exhausted by this point"
  - Time: 1.5h

- [ ] **Task 13.3: Add runway visualization to canvas** (1.5h)
  - Files: `src/components/SimulatorCanvas.tsx`, create `src/components/RunwayBar.tsx`
  - What: Add a horizontal "Runway Bar" at the bottom of the canvas (or top). It shows: starting capital, current projected capital at each node, burn rate, months remaining. As the simulation runs (particles move), the bar animates to show capital decreasing. Color: green (>6 months), yellow (3-6 months), red (<3 months), black (0 = dead). This is a key visual that makes the simulator feel REAL.
  - Dependencies: Task 13.2
  - Test: Visually verify: the bar starts green and transitions to red/black for underfunded scenarios
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Burn model test: runway decreases over time in simulation
  - [ ] Cash death scenario triggers correctly when burn > capital
  - [ ] Visual: burn rate visible in Dashboard stats

### Day 14 -- Node Dependency System

- [ ] **Task 14.1: Define node dependency graph** (2h)
  - Files: Create `src/lib/engines/dependency-graph.ts`
  - What: Build a system where a choice at node N changes probabilities at nodes N+1, N+2, etc. Examples: (a) "Bootstrap" at funding node -> lower probabilities for "hire team" but higher for "reach profitability", (b) "Take VC" at funding node -> higher "hire team" but lower "maintain control", (c) "Choose cheap location" -> lower rent cost but lower foot traffic. Define a `DependencyRule` type: `{trigger_node_type, trigger_choice, affected_nodes, modifier}`. Create 50+ rules covering the most common decision chains.
  - Dependencies: Engine types (Day 9)
  - Test: When node 3 is "Bootstrap funding", node 7 "Hire first employee" has its probability reduced by 30%
  - Time: 2h

- [ ] **Task 14.2: Integrate dependency propagation into dataflow** (1.5h)
  - Files: `src/lib/dataflow-engine.ts`
  - What: Modify the dataflow engine to check dependency rules after each node is computed. When a node resolves (pass or fail), look up all dependency rules where it is the trigger. Apply the modifiers to downstream nodes. Recompute affected nodes. This creates a cascading effect where early decisions ripple through the entire simulation.
  - Dependencies: Task 14.1
  - Test: Change a decision at an early node and verify that downstream nodes recalculate their probabilities
  - Time: 1.5h

- [ ] **Task 14.3: Visual feedback for dependency changes** (1h)
  - Files: `src/components/nodes/SimNode.tsx`, `src/components/edges/AnimatedEdge.tsx`
  - What: When a dependency modifier is applied, briefly flash the affected node with a subtle pulse animation. Show a small delta indicator: "+5%" or "-12%" next to the probability, fading after 2 seconds. On the edge connecting the trigger to the affected node, show a brief "ripple" animation.
  - Dependencies: Task 14.2
  - Test: Visually verify: when the simulation passes through a decision node, downstream nodes pulse and show delta indicators
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Dependency test: choice at node 3 changes probability at node 7
  - [ ] Visual: edges show dependency direction
  - [ ] Generate 3 scenarios, verify node dependencies are logical

### Day 15 -- Country-Specific Modifiers

- [ ] **Task 15.1: Build country modifier database** (2h)
  - Files: Create `data/country-business-modifiers.json`
  - What: For the top 30 countries (by user interest: USA, UK, Germany, France, Indonesia, Singapore, Thailand, India, Australia, Canada, Japan, South Korea, Brazil, Mexico, Nigeria, UAE, etc.), define business modifiers: (a) ease of doing business score (World Bank), (b) startup ecosystem rank (Startup Genome), (c) cost multiplier (1.0 = USA baseline), (d) corruption index impact, (e) visa/legal complexity for foreigners, (f) internet infrastructure score, (g) talent availability score. Each modifier is a multiplier (0.5 to 2.0) applied to relevant node probabilities.
  - Dependencies: none
  - Test: `getCountryModifier('Indonesia', 'saas')` returns `{cost: 0.3, talent: 0.7, ecosystem: 0.5, legal: 0.6, overall: 0.52}`
  - Time: 2h

- [ ] **Task 15.2: Integrate country modifiers into engines** (1.5h)
  - Files: All engine files (`src/lib/engines/*.ts`), `src/lib/engines/registry.ts`
  - What: When `ConditionalFactors.location` is set, the engine looks up the country modifier and applies it to all probabilities. The modifier is applied AFTER the base engine calculation. Example: SaaS base probability for "find first customer" is 25%. In Indonesia: 25% * 0.52 (ecosystem) = 13%. In San Francisco: 25% * 1.4 = 35%.
  - Dependencies: Task 15.1
  - Test: Same scenario, different countries -> visibly different probabilities. "Open SaaS in San Francisco" vs "Open SaaS in Bandung" shows 2-3x difference in key probabilities
  - Time: 1.5h

- [ ] **Task 15.3: Add country context to Claude prompt** (1h)
  - Files: `src/app/api/generate/route.ts`
  - What: When a country is detected, inject a rich country context into the Claude prompt: GDP, population, business environment score, key industries, regulatory challenges, success stories, common pitfalls. This helps Claude generate country-appropriate node labels and descriptions (e.g. "KUR Loan" for Indonesia, "SBA Loan" for USA).
  - Dependencies: Task 15.1
  - Test: Generate "start business in Indonesia" -- nodes reference Indonesian-specific funding (KUR), regulations (PT PMA), and challenges
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Same scenario, different countries → verify different probabilities
  - [ ] Indonesia vs USA vs Germany comparison test
  - [ ] Country modifier data is sourced (not "Estimated")

### Day 16 -- Timeline Compression and Expansion

- [ ] **Task 16.1: Build time-aware probability curves** (2h)
  - Files: Create `src/lib/engines/time-model.ts`
  - What: Probabilities are not just point estimates -- they change with time. A SaaS that tries to reach product-market fit in 1 month has a MUCH lower probability than one that takes 12 months. Build time curves for each major node type: `P(success, t) = base * timeCurve(t)` where timeCurve models the S-curve of success over time. Data: median time to key milestones from Startup Genome, First Round Capital. Store as `data/time-curves.json` with 50+ milestone curves.
  - Dependencies: Engine types (Day 9)
  - Test: `getTimeProbability('product_market_fit', 1)` = 5%. `getTimeProbability('product_market_fit', 12)` = 30%. `getTimeProbability('product_market_fit', 24)` = 45%.
  - Time: 2h

- [ ] **Task 16.2: Integrate timeline into node generation** (1.5h)
  - Files: `src/app/api/generate/route.ts`, engines
  - What: When `ConditionalFactors.timeline` is set (e.g. "6 months"), compress or expand the simulation timeline. Short timeline = fewer nodes but higher risk at each. Long timeline = more nodes with gradual progression. The time model adjusts each node's probability based on how much time is allocated to it. Inject time warnings: "This step typically takes 6-12 months. Your timeline allows only 3 months -- probability reduced by 50%."
  - Dependencies: Task 16.1
  - Test: "Start SaaS in 3 months" shows compressed, high-risk path. "Start SaaS in 24 months" shows gradual, higher-probability path
  - Time: 1.5h

- [ ] **Task 16.3: Add timeline visualization to canvas** (1h)
  - Files: `src/components/SimulatorCanvas.tsx`
  - What: Add subtle time markers on the canvas edges. Each edge shows the estimated time for that transition (e.g. "2-4 months"). Nodes that exceed the user's timeline budget are highlighted with a warning border. Total timeline shown in the Dashboard: "Estimated total time: 18-24 months (your budget: 6 months -- WARNING)."
  - Dependencies: Task 16.2
  - Test: Time labels appear on edges. Dashboard shows timeline comparison.
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Timeline test: "6 months" vs "5 years" → different probabilities and node structure
  - [ ] Verify timeline affects burn rate calculations
  - [ ] Edge case: very short (1 week) and very long (20 years) timelines

### Day 17 -- Experience Level Deep Integration

- [ ] **Task 17.1: Build experience modifier curves** (1.5h)
  - Files: Create `data/experience-modifiers.json`
  - What: For each business model and node type, define how experience level changes probability. Not just a flat multiplier -- experienced founders skip steps, avoid common mistakes, and have networks. Structure: `{node_type: {none: 0.4, beginner: 0.65, intermediate: 0.85, expert: 1.2}, skip_if_expert: boolean}`. Some nodes are SKIPPABLE for experts (e.g. "Learn basic marketing" can be skipped if experience = expert in marketing). 100+ node-type entries.
  - Dependencies: Engine types (Day 9)
  - Test: Expert in SaaS skips "Learn to code" and "Find co-founder (technical)" nodes entirely. Beginner sees all nodes.
  - Time: 1.5h

- [ ] **Task 17.2: Dynamic node generation based on experience** (2h)
  - Files: `src/app/api/generate/route.ts`
  - What: Modify the Claude prompt to generate DIFFERENT nodes based on experience level. Expert: fewer, more advanced nodes (skip basics). None: more learning/preparation nodes. Inject experience context: "User is a BEGINNER with NO experience in [field]. Generate nodes that include learning steps, finding mentors, and basic skill acquisition. Do NOT assume they know industry terminology." vs "User is an EXPERT in [field] with 10+ years. Skip basics. Focus on advanced strategy, scaling, and avoiding expert-level pitfalls."
  - Dependencies: Task 17.1
  - Test: Generate "start agency" with experience=none (10+ nodes including learning) vs experience=expert (7 nodes, all advanced). Visibly different simulations.
  - Time: 2h

- [ ] **Task 17.3: Skill-gap warnings** (1h)
  - Files: `src/lib/engines/warnings.ts` (create)
  - What: When the user's experience level creates a critical skill gap, generate specific warnings. E.g. "You selected 'no experience' but this scenario requires programming skills. Probability of success without learning to code or hiring a developer: 3%." Warnings are injected as special warning nodes in the simulation graph (red border, exclamation icon).
  - Dependencies: Task 17.1
  - Test: "Build SaaS app" with experience=none generates a warning node: "Critical skill gap: software development"
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Experience test: beginner vs expert → same scenario, different probabilities
  - [ ] Verify experience affects which nodes appear (beginner gets more steps)
  - [ ] Context tags properly route to experience-modified data

### Day 18 -- Engine Testing + Calibration

- [ ] **Task 18.1: Create engine test suite** (2h)
  - Files: Create `scripts/test-engines.ts`
  - What: Automated tests for ALL 5 engines + generic. For each engine, test 10 scenarios with different factor combinations. Verify: (a) probabilities are within reasonable bounds (0-100%), (b) modifiers work correctly (higher budget = higher probability), (c) ranges make sense (optimistic > base > adverse), (d) sources are present for every probability, (e) burn model calculations are correct. Output a calibration report.
  - Dependencies: All engines complete
  - Test: Run `npx tsx scripts/test-engines.ts` -- all tests pass, report shows calibration scores
  - Time: 2h

- [ ] **Task 18.2: Cross-engine comparison** (1.5h)
  - Files: `scripts/test-engines.ts` (extend)
  - What: Run the SAME scenario through different engines and compare. "Start a business" should give VERY different results for SaaS vs F&B vs Service vs Marketplace. Verify that the differences are meaningful and data-backed, not random. Create a comparison table output.
  - Dependencies: Task 18.1
  - Test: Comparison table shows SaaS has higher ceiling but lower base than Service. F&B has highest capital requirement. Marketplace has lowest base probability. All make intuitive sense.
  - Time: 1.5h

- [ ] **Task 18.3: Edge case handling** (1h)
  - Files: All engine files
  - What: Test and fix edge cases: (a) budget = 0 (should still work, just very low probabilities), (b) timeline = 1 month (should work, warn about unrealistic timeline), (c) location = unknown city (fall back to country, then to global averages), (d) experience = expert in unrelated field (partial credit). Ensure no crashes, NaN, or undefined values.
  - Dependencies: Tasks 18.1, 18.2
  - Test: All edge cases produce valid output with appropriate warnings
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] **Calibration**: run 50 scenarios, check probability ranges are reasonable
  - [ ] **Cross-engine**: verify engines don't conflict when scenario is ambiguous
  - [ ] **Edge cases**: empty budget, no location, all tags filled vs none

### Day 19 -- E-commerce + Hardware Engines

- [ ] **Task 19.1: Create E-commerce engine** (1.5h)
  - Files: Create `src/lib/engines/ecommerce.ts`, create `data/engine-ecommerce-probabilities.json`
  - What: E-commerce engine covering: dropshipping, private label, DTC brand, Amazon FBA. Node types: find product/niche, source supplier, build store, first sale, reach $1K/mo, $10K/mo, scale with ads. Modifiers: platform (Shopify vs Amazon vs own site), product type (digital vs physical), fulfillment model. Data from: Shopify reports, Jungle Scout Amazon data.
  - Dependencies: Task 9.2
  - Test: Dropshipping shows very different probabilities from private label DTC
  - Time: 1.5h

- [ ] **Task 19.2: Create Hardware/Physical Product engine** (1.5h)
  - Files: Create `src/lib/engines/hardware.ts`, create `data/engine-hardware-probabilities.json`
  - What: Hardware startup engine (the hardest business model). Node types: design prototype, find manufacturer, first batch, quality control, logistics, first customers, iterate. Very capital-intensive, long timelines. Data from: HAX accelerator, Bolt.io, Kickstarter stats.
  - Dependencies: Task 9.2
  - Test: Hardware engine shows highest capital requirements and longest timelines of any engine
  - Time: 1.5h

- [ ] **Task 19.3: Update engine registry with all 7 engines** (1h)
  - Files: `src/lib/engines/registry.ts`
  - What: Register all 7 engines (SaaS, F&B, Service, Marketplace, Content, E-commerce, Hardware). Update keyword detection to correctly route scenarios to the right engine. Add logging: "Engine selected: [name] (confidence: [score])". Handle ambiguous cases (e.g. "sell food online" = F&B or E-commerce? -> check for physical location keywords).
  - Dependencies: Tasks 19.1, 19.2
  - Test: 20 test scenarios all route to the correct engine
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] E-commerce engine test: "start a Shopify store" → e-commerce probabilities
  - [ ] Hardware engine test: "launch a physical product" → hardware probabilities
  - [ ] Both produce realistic burn rates and timelines

### Day 20 -- Conditional Engine Polish

- [ ] **Task 20.1: Add "Why this probability?" explainer** (2h)
  - Files: Create `src/components/ProbabilityExplainer.tsx`
  - What: When user clicks on a node's probability, a popover appears explaining: (a) base probability from engine data (with source citation), (b) each modifier applied and its impact, (c) final calculation chain. Example: "Base: 25% (Startup Genome 2024) -> Budget modifier ($5K): -20% = 20% -> Experience (none): -40% = 12% -> Location (Bandung): -15% = 10.2% -> Final range: 5-18% (base: 10%)". This is the KEY transparency feature that builds trust.
  - Dependencies: Day 12
  - Test: Click any node probability -> popover shows full calculation chain with sources
  - Time: 2h

- [ ] **Task 20.2: A/B scenario comparison** (2h)
  - Files: Create `src/components/ScenarioCompare.tsx`
  - What: Side-by-side comparison of the SAME scenario with different factors. User sets Scenario A (e.g. $5K budget, no experience, Bandung) and Scenario B (e.g. $50K budget, expert, Singapore). Both simulations render side by side (split canvas or tabbed view). Key metrics compared: overall success probability, runway, time to break-even, critical risk nodes.
  - Dependencies: Conditional engine complete
  - Test: Compare "open cafe $5K beginner Bandung" vs "open cafe $50K expert Singapore" -- differences are dramatic and meaningful
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] UI polish check: all new engine outputs display correctly
  - [ ] Range display: base/optimistic/adverse clearly visible in all nodes
  - [ ] Mobile responsive: check on 320px, 768px, 1024px

### Day 21 -- Integration Testing

- [ ] **Task 21.1: Full end-to-end test: 20 scenarios** (2h)
  - Files: `scripts/test-100-simulations.ts` (extend)
  - What: Test 20 carefully chosen scenarios that cover all 7 engines, all experience levels, various budgets/locations. For each: verify engine selection is correct, probabilities are conditional (not static), ranges are present, burn model works, no "Estimated" labels, sources cited. Generate a comprehensive report.
  - Dependencies: All Phase 1B
  - Test: 20/20 scenarios produce conditional probabilities with correct engine selection
  - Time: 2h

- [ ] **Task 21.2: Performance optimization** (1.5h)
  - Files: `src/app/api/generate/route.ts`, engine files
  - What: The conditional engine adds computation. Profile the generate route: how much time does engine calculation add? Target: <200ms for engine computation (Claude API call is ~2-5s, so engine should be negligible). Optimize: pre-compute country modifiers at startup, cache engine data in memory, avoid redundant lookups.
  - Dependencies: Task 21.1
  - Test: Measure API response time with and without conditional engine. Overhead should be <200ms.
  - Time: 1.5h

- [ ] **Task 21.3: Error handling and fallbacks** (1h)
  - Files: All engine files, `src/app/api/generate/route.ts`
  - What: If any engine throws an error, fall back gracefully to GenericEngine. If country data is missing, use global averages. If burn model fails, skip it (do not crash the simulation). Log all fallbacks for debugging. Never let the conditional engine break the existing generation flow.
  - Dependencies: Task 21.1
  - Test: Deliberately break each engine's data file -> simulation still generates with fallback
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] **Full integration test**: 30 scenarios across all engine types
  - [ ] **Performance**: generation time still <5s
  - [ ] **Accuracy audit**: spot-check 10 probabilities against real data sources

### Day 22 -- Phase 1B Buffer + Documentation

- [ ] **Task 22.1: Write engine documentation** (1h)
  - Files: `docs/architecture.md`
  - What: Update architecture doc with: conditional engine diagram, engine registry flow, modifier system, burn model, dependency graph. Include example calculation chains. This documentation is critical for future development.
  - Dependencies: All Phase 1B
  - Test: Architecture doc accurately describes the system
  - Time: 1h

- [ ] **Task 22.2: Create engine data refresh guide** (1h)
  - Files: Create `docs/engine-data-guide.md`
  - What: Document how to update engine probabilities when new data comes out. For each engine: which data files to update, which sources to check, how to re-validate. This ensures the conditional engine stays current.
  - Dependencies: All Phase 1B
  - Test: Following the guide, anyone can update SaaS engine probabilities
  - Time: 1h

- [ ] **Task 22.3: Buffer / catchup** (remaining hours)
  - What: Use remaining time to fix any issues found during testing, improve data coverage, or polish UI elements.
  - Dependencies: All Phase 1B
  - Test: All Phase 1B tests pass cleanly
  - Time: remaining

---

- [ ] **End-of-Day Test & Fix**
  - [ ] All Phase 1B documentation complete
  - [ ] **Phase 1B sign-off**: credibility score re-assessment
  - [ ] Buffer: fix any remaining issues from Days 9-21

## Phase 2: Recursive Simulation -- Days 23-28

Goal: Click any node to open a sub-simulation. Infinite drill-down depth.

### Day 23 -- Sub-Simulation Architecture

- [ ] **Task 23.1: Design sub-simulation data model** (1.5h)
  - Files: Create `src/lib/sub-simulation.ts`
  - What: Define how sub-simulations work. A sub-simulation is a full simulation generated with the parent node's context. Data model: `SubSimulation { parentNodeId, parentScenario, depth, nodes, edges, factors }`. The parent node's label becomes the sub-simulation's scenario. Parent node's probability and factors are passed as context. Maximum depth: 5 levels.
  - Dependencies: Phase 1B complete
  - Test: TypeScript compiles. Types are correct.
  - Time: 1.5h

- [ ] **Task 23.2: Build sub-simulation API endpoint** (2h)
  - Files: Create `src/app/api/generate-sub/route.ts`
  - What: New API endpoint that generates a sub-simulation. Accepts: parent node data (label, probability, type, factors), depth level, parent scenario for context. Uses the same conditional engine but with narrowed scope. The Claude prompt includes: "You are generating a DETAILED sub-simulation for the step: [parent node label]. This is part of a larger simulation about: [root scenario]. The parent step has a [probability]% chance of success. Break this step into 6-10 detailed sub-steps with their own probabilities."
  - Dependencies: Task 23.1
  - Test: POST to `/api/generate-sub` with a "Find Location" node -> returns 6-10 sub-nodes about location scouting
  - Time: 2h

- [ ] **Task 23.3: Breadcrumb navigation component** (1h)
  - Files: Create `src/components/Breadcrumb.tsx`
  - What: Navigation breadcrumb that shows the drill-down path: "Main > Funding > KUR Loan > Application Process". Clicking any breadcrumb level navigates back to that level. Shows current depth indicator. Maximum display: 5 levels. Styled minimal (no background, just text with chevrons).
  - Dependencies: none
  - Test: Breadcrumb renders correctly at 3 levels. Clicking "Main" returns to root.
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 24 -- Sub-Simulation UI Integration

- [ ] **Task 24.1: Add "Drill Down" interaction to SimNode** (2h)
  - Files: `src/components/nodes/SimNode.tsx`, `src/components/SimulatorCanvas.tsx`
  - What: Double-click (or dedicated button) on any node opens a sub-simulation. The current simulation is saved to a stack. The canvas transitions (zoom into node animation) to the sub-simulation. The sub-simulation renders in the same canvas with a different background tint (slightly different shade per depth level). Loading state while sub-simulation generates.
  - Dependencies: Tasks 23.2, 23.3
  - Test: Double-click "Find Location" node -> loading spinner -> sub-simulation appears with breadcrumb showing "Main > Find Location"
  - Time: 2h

- [ ] **Task 24.2: Simulation stack management** (1.5h)
  - Files: `src/components/SimulatorCanvas.tsx`
  - What: Manage a stack of simulations for drill-down and back navigation. Structure: `SimulationStack: Array<{nodes, edges, scenario, depth, scrollPosition}>`. Push to stack when drilling down. Pop when navigating back. Preserve scroll/zoom position at each level. Maximum stack depth: 5.
  - Dependencies: Task 24.1
  - Test: Drill down 3 levels, then navigate back 2 levels -> each level restores exactly as it was
  - Time: 1.5h

- [ ] **Task 24.3: Pass parent context to sub-simulations** (1h)
  - Files: `src/app/api/generate-sub/route.ts`
  - What: The sub-simulation API receives the full parent context: (a) parent node's label, probability, and description, (b) the root scenario (original user query), (c) the conditional factors (location, budget, timeline, experience), (d) what the user chose at decision nodes above. This context makes sub-simulations contextually aware, not generic.
  - Dependencies: Task 24.1
  - Test: Sub-simulation for "Find Location" in "Open cafe Bandung" generates Bandung-specific location nodes (Braga, Dago, etc.), not generic "find a location" steps
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 25 -- Sub-Simulation Polish

- [ ] **Task 25.1: Depth-based visual differentiation** (1.5h)
  - Files: `src/components/nodes/SimNode.tsx`, `src/components/SimulatorCanvas.tsx`
  - What: Each drill-down level has a subtle visual difference: (a) background canvas tint shifts slightly (Level 0: default, Level 1: slight blue tint, Level 2: slight purple tint), (b) node border gets thinner at deeper levels (suggesting more detail), (c) edge style becomes more dotted at deeper levels. These visual cues help the user know their depth without looking at the breadcrumb.
  - Dependencies: Day 24
  - Test: At depth 3, the visual style is noticeably different from depth 0, but still professional
  - Time: 1.5h

- [ ] **Task 25.2: Sub-simulation data inheritance** (1.5h)
  - Files: `src/lib/engines/dependency-graph.ts`, `src/lib/sub-simulation.ts`
  - What: When a sub-simulation generates, it inherits the parent's conditional factors AND any dependency modifications from ancestor nodes. E.g. if the parent path chose "bootstrap" over "VC funding", the sub-simulation for "hire team" automatically has reduced probabilities for expensive hires.
  - Dependencies: Day 14 (dependency system)
  - Test: Sub-simulation probabilities change based on choices made in parent simulation
  - Time: 1.5h

- [ ] **Task 25.3: Aggregate sub-simulation results up** (1.5h)
  - Files: `src/lib/sub-simulation.ts`, `src/components/Dashboard.tsx`
  - What: After exploring a sub-simulation, the detailed result should feed back into the parent. If the sub-simulation reveals that "Find Location" has a 65% success rate (based on detailed analysis), update the parent node's probability from its original estimate. Show in Dashboard: "Refined probability after drill-down: 18% -> 12% (location analysis revealed higher competition)."
  - Dependencies: Task 25.2
  - Test: Drill into a node, complete sub-simulation, navigate back -> parent node shows updated probability
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 26 -- Sub-Simulation Testing

- [ ] **Task 26.1: Test 3-level deep drill-down** (1.5h)
  - Files: Manual testing
  - What: Test 5 scenarios with 3-level drill-down: (a) "Open cafe" > "Find Location" > "Negotiate Lease", (b) "Start SaaS" > "Build MVP" > "Choose Tech Stack", (c) "Career change" > "Learn New Skills" > "Get Certification", (d) "Invest in crypto" > "Choose Exchange" > "Security Setup", (e) "Start YouTube" > "Create Content" > "Edit First Video". Verify: breadcrumbs work, back navigation works, context is inherited, probabilities make sense at each level.
  - Dependencies: Day 25
  - Test: All 5 scenarios drill down and back successfully without crashes or data loss
  - Time: 1.5h

- [ ] **Task 26.2: Performance optimization for sub-simulations** (1h)
  - Files: `src/app/api/generate-sub/route.ts`
  - What: Sub-simulations should be fast. Optimize: use a shorter Claude prompt (less context, since we are more specific), generate fewer nodes (6-8 instead of 8-15), cache sub-simulations by parent node ID (if user drills into the same node twice, serve cached). Target: sub-simulation load time < 3 seconds.
  - Dependencies: Task 26.1
  - Test: Measure sub-simulation generation time. Should be <3s.
  - Time: 1h

- [ ] **Task 26.3: Mobile responsive sub-simulation** (1h)
  - Files: `src/components/SimulatorCanvas.tsx`, `src/components/Breadcrumb.tsx`
  - What: Verify sub-simulation works on mobile (320px+). Breadcrumb should collapse on small screens (show only current + parent, with "..." for deeper levels). Drill-down should work with long-press (since double-tap is zoom on mobile).
  - Dependencies: Task 26.1
  - Test: Test on mobile viewport (Chrome DevTools) -- drill-down and back navigation work
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 27-28 -- Phase 2 Buffer + Edge Cases

- [ ] **Task 27.1: Handle edge cases** (2h)
  - What: Fix issues found during testing. Common edge cases: (a) drilling into "fail" nodes, (b) drilling into start/end nodes, (c) very long breadcrumb paths, (d) sub-simulation that generates 0 nodes (API error). Each should be handled gracefully.
  - Time: 2h

- [ ] **Task 27.2: Sub-simulation history** (1.5h)
  - Files: `src/lib/history.ts`
  - What: Save sub-simulation explorations in history. When loading a saved simulation, also load its sub-simulation tree (if explored). This lets users revisit their deep analysis.
  - Dependencies: Day 26
  - Test: Save a simulation with 2 levels of drill-down. Reload from history. Both levels are accessible.
  - Time: 1.5h

- [ ] **Task 27.3: Documentation update** (1h)
  - Files: `docs/architecture.md`, `docs/step-by-step.md`
  - What: Update docs with recursive simulation architecture, API endpoints, UI flow.
  - Time: 1h

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Phase 3: User Profile -- Days 29-34

Goal: Same simulation, different results for different profiles.

### Day 29 -- Profile Data Model + Storage

- [ ] **Task 29.1: Define profile schema** (1.5h)
  - Files: Create `src/lib/profile/types.ts`
  - What: Complete user profile type: `{age: number, country: string, city: string, capital: number, currency: string, skills: string[], experience: Record<string, ExperienceLevel>, network_size: 'none'|'small'|'medium'|'large', languages: string[], visa_status: string, education: string, risk_tolerance: 'low'|'medium'|'high', past_ventures: number, monthly_expenses: number}`. Default values for each field.
  - Dependencies: none
  - Test: TypeScript compiles, profile with all fields validates correctly
  - Time: 1.5h

- [ ] **Task 29.2: Profile storage (localStorage first)** (1h)
  - Files: Create `src/lib/profile/storage.ts`
  - What: Save/load profile from localStorage. Key: `simulator-profile`. Auto-save on change. Migration support (if profile schema changes, old profiles are upgraded). Export/import as JSON.
  - Dependencies: Task 29.1
  - Test: Save profile, reload page, profile persists. Export JSON, clear, import JSON -- profile restored.
  - Time: 1h

- [ ] **Task 29.3: Profile form UI** (2h)
  - Files: Create `src/components/ProfilePanel.tsx`
  - What: Profile form in a sidebar panel (accessible from hamburger menu "Settings"). Clean, minimal form with sections: Personal (age, country, city), Financial (capital, monthly expenses, currency, risk tolerance), Skills (multi-select tags for skills, experience level per skill), Network (size selector, languages), History (past ventures count, education). Auto-save on blur. Professional design matching existing UI (Geist font, dark theme, consistent spacing).
  - Dependencies: Tasks 29.1, 29.2
  - Test: Fill out profile form, navigate away, come back -- all values persisted
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 30 -- Profile Integration into Engine

- [ ] **Task 30.1: Profile-to-factors mapper** (1.5h)
  - Files: Create `src/lib/profile/mapper.ts`
  - What: Convert a user profile into `ConditionalFactors` for the engine. Mapping: (a) capital -> budget, (b) city/country -> location, (c) highest relevant skill experience -> experience level, (d) age -> timeline modifier (younger = longer runway, older = more urgency), (e) network_size -> modifier for customer/funding acquisition, (f) past_ventures -> experience bonus, (g) risk_tolerance -> affects optimistic vs adverse weighting. Each mapping has clear rules and documentation.
  - Dependencies: Profile types (Day 29), Engine types (Day 9)
  - Test: Profile with age=25, capital=$10K, experience=beginner, country=Indonesia maps to correct ConditionalFactors
  - Time: 1.5h

- [ ] **Task 30.2: Inject profile into generation** (1.5h)
  - Files: `src/app/api/generate/route.ts`
  - What: When generating a simulation, if a profile exists, automatically use its factors (overriding manually set context tags). The profile provides DEFAULT values that context tags can override. Add profile context to Claude prompt: "User profile: 29-year-old Italian-Ghanaian male living in Bandung, Indonesia. Capital: $5,000. Experience: beginner in F&B, expert in data analysis. Small professional network. No previous ventures. Risk tolerance: medium."
  - Dependencies: Task 30.1
  - Test: With profile set, generate "start business" -- the simulation references profile-specific data without user manually setting context tags
  - Time: 1.5h

- [ ] **Task 30.3: Personalized warnings based on profile** (1.5h)
  - Files: Create `src/lib/profile/warnings.ts`
  - What: Analyze the profile against the scenario and generate specific warnings. Rules: (a) capital < median startup cost for this model -> "Your capital ($X) is below the median ($Y) for [model] businesses", (b) no relevant experience -> "You have no experience in [field]. Consider: mentor, course, or pivot to [related field where you have experience]", (c) visa complications -> "As a foreigner in [country], you need [visa type]. Processing time: [X months]", (d) age-specific -> "At [age], your risk tolerance should account for [X]". Maximum 3 warnings per simulation.
  - Dependencies: Task 30.1
  - Test: Profile with $1K capital generates warning about underfunding. Profile with no F&B experience generates skill gap warning.
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 31 -- Profile-Driven Personalization

- [ ] **Task 31.1: Different simulation paths based on profile** (2h)
  - Files: `src/app/api/generate/route.ts`
  - What: The Claude prompt should generate genuinely DIFFERENT nodes based on the profile. Not just different probabilities on the same nodes, but different paths. Example: (a) User with $1K capital: "Bootstrap" path with lean nodes (no "raise seed round"). (b) User with $100K: "Funded" path with hiring and office nodes. (c) User in Indonesia: local funding options (KUR, angel networks Jakarta). (d) User in USA: SBA loans, YC application. (e) User with coding skills: "Build it yourself" vs "Hire developer" nodes.
  - Dependencies: Day 30
  - Test: Generate "start business" with 2 radically different profiles -- the node STRUCTURE is different, not just the numbers
  - Time: 2h

- [ ] **Task 31.2: Profile comparison feature** (1.5h)
  - Files: Extend `src/components/ScenarioCompare.tsx`
  - What: Allow comparing the same scenario with two different profiles (not just different factors). "What if I had $50K instead of $5K?" or "What if I was in Singapore instead of Bandung?". Quick toggle buttons on the profile panel: "Compare with: $10K more capital / Different country / More experience". Reuses the A/B comparison from Day 20.
  - Dependencies: Task 31.1, Day 20 comparison feature
  - Test: Compare profiles shows meaningful differences in both structure and probabilities
  - Time: 1.5h

- [ ] **Task 31.3: Profile onboarding flow** (1h)
  - Files: Create `src/components/Onboarding.tsx`
  - What: First-time user sees a brief onboarding: 3 quick questions (age, country, main goal). These seed the profile with basic data. Not a full form -- just enough to start personalizing. "Tell us a bit about you so we can personalize your simulations." Dismissable, remembers if completed via localStorage.
  - Dependencies: Profile form (Day 29)
  - Test: New user (cleared localStorage) sees onboarding. Fills 3 fields. Profile is seeded. Subsequent visits skip onboarding.
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 32-34 -- Profile Testing + Polish

- [ ] **Task 32.1: Test 5 profiles across 5 scenarios** (2h)
  - What: Create 5 distinct profiles (young broke beginner, experienced funded founder, immigrant low budget, expert career changer, student). Run each through 5 scenarios (start SaaS, open cafe, career change, invest, create content). Verify all 25 combinations produce meaningfully different, reasonable results.
  - Test: 25 combinations all work, no crashes, meaningful differentiation
  - Time: 2h

- [ ] **Task 32.2: Profile data privacy** (1h)
  - What: Profile is localStorage only (no server upload). Add a "Clear Profile" button. Add a privacy notice: "Your profile is stored only on this device. We never send personal data to our servers." Verify the generate API does not log profile data.
  - Time: 1h

- [ ] **Task 33.1: Profile-aware history** (1.5h)
  - Files: `src/lib/history.ts`
  - What: History entries now include which profile was active when the simulation was generated. Viewing old simulations shows the profile snapshot. Allows comparing "how my simulation changed as my profile evolved."
  - Time: 1.5h

- [ ] **Task 33.2: Profile suggestions** (1.5h)
  - Files: `src/lib/profile/suggestions.ts`
  - What: After a simulation runs, suggest profile improvements: "Tip: if you increased your capital by $5K, your success probability would increase from 12% to 22%." or "Learning [skill] would unlock 3 additional paths." Maximum 2 suggestions per simulation.
  - Time: 1.5h

- [ ] **Task 34.1: Documentation update** (1h)
  - Files: `docs/architecture.md`, `docs/step-by-step.md`, `ROADMAP.md`
  - What: Update all docs with profile system architecture and completion status.
  - Time: 1h

- [ ] **Task 34.2: Buffer / fix issues** (remaining hours)
  - What: Fix any issues from Phase 3 testing.
  - Time: remaining

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Phase 4: Auto Data Pipeline -- Days 35-40

Goal: System gets smarter every week automatically.

### Day 35 -- Pipeline Script Foundation

- [ ] **Task 35.1: Create master pipeline script** (2h)
  - Files: Create `scripts/update-pipeline.ts`
  - What: Master script that orchestrates ALL data updates. Calls each API client, downloads fresh data, compares with existing data, reports what changed. Structure: `{apis: [{name, fetcher, outputFile, schedule}], run(api?: string)}`. Can run all APIs or a specific one. Includes retry logic (3 attempts with backoff). Logs everything to `data/pipeline-log.json`.
  - Dependencies: All API clients from Phase 1
  - Test: `npx tsx scripts/update-pipeline.ts` runs all APIs, downloads data, reports what changed
  - Time: 2h

- [ ] **Task 35.2: Add diff reporting** (1.5h)
  - Files: `scripts/update-pipeline.ts`
  - What: After each API fetch, compare new data with existing file. Generate a diff report: (a) new data points added, (b) changed values (with old vs new), (c) removed data points. Store diff in `data/diffs/YYYY-MM-DD.json`. This diff is critical for the email report and for auditing data quality over time.
  - Dependencies: Task 35.1
  - Test: Run pipeline twice -- second run shows "0 changes" (data hasn't changed). Manually modify a value, run again -- diff catches it.
  - Time: 1.5h

- [ ] **Task 35.3: Auto-chunking and embedding for new data** (1.5h)
  - Files: `scripts/update-pipeline.ts`, `scripts/index-data.ts`
  - What: After pipeline downloads new data, automatically run the indexer on changed files ONLY. Use the `--incremental` flag from Day 7. Delete old embeddings for changed files, then re-embed. This ensures RAG stays in sync with fresh data.
  - Dependencies: Task 35.2, Day 7 incremental indexer
  - Test: Pipeline updates a World Bank file -> old embeddings deleted -> new ones created -> RAG search returns fresh data
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 36 -- Scheduling + Monitoring

- [ ] **Task 36.1: GitHub Actions weekly cron** (1.5h)
  - Files: Create `.github/workflows/data-pipeline.yml`
  - What: GitHub Actions workflow that runs every Sunday at 2 AM UTC. Steps: (a) checkout repo, (b) install dependencies, (c) run `scripts/update-pipeline.ts`, (d) commit changed data files, (e) run indexer on changed files, (f) push to repo. Uses repo secrets for API keys. Timeout: 30 minutes.
  - Dependencies: Task 35.3
  - Test: Manually trigger the workflow via GitHub Actions UI -- it runs successfully and commits any data changes
  - Time: 1.5h

- [ ] **Task 36.2: Vercel Cron alternative (simpler)** (1h)
  - Files: Create `src/app/api/cron/update-data/route.ts`, update `vercel.json`
  - What: Alternative to GitHub Actions: a Vercel Cron Job endpoint. Runs weekly. Fetches API data and updates Supabase directly (not local files). Simpler but less comprehensive than the GitHub Actions approach. Add Vercel cron config: `{"crons": [{"path": "/api/cron/update-data", "schedule": "0 2 * * 0"}]}`.
  - Dependencies: Task 35.1
  - Test: Call the cron endpoint manually -> it fetches fresh data and reports what changed
  - Time: 1h

- [ ] **Task 36.3: Pipeline monitoring dashboard** (1.5h)
  - Files: Create `src/app/api/pipeline-status/route.ts`
  - What: API endpoint that returns pipeline status: last run date, success/failure, data freshness per source (days since last update), total data points, diff summary from last run. This will be displayed in the admin section later. For now, just the API.
  - Dependencies: Task 35.2
  - Test: GET `/api/pipeline-status` returns JSON with all source freshness dates
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 37 -- Email Report + Alerts

- [ ] **Task 37.1: Email report with SendGrid/Resend** (2h)
  - Files: Create `scripts/send-pipeline-report.ts`
  - What: After pipeline runs, send an email report with: (a) summary (X data points updated, Y new, Z changed), (b) per-source breakdown, (c) data freshness table, (d) any errors/warnings, (e) diff highlights (biggest changes). Use Resend (free tier: 3K emails/month) or SendGrid (free tier: 100/day). HTML formatted email.
  - Dependencies: Task 36.1
  - Test: Run pipeline + email script -> receive a formatted email with data update summary
  - Time: 2h

- [ ] **Task 37.2: Stale data alerts** (1h)
  - Files: `scripts/update-pipeline.ts`
  - What: If any data source has not been updated for >14 days, trigger an alert (email + console warning). If a source API is down for 3 consecutive runs, mark it as "unhealthy" in the status. This prevents silent data staleness.
  - Dependencies: Task 37.1
  - Test: Set a source's last update to 20 days ago -> alert fires
  - Time: 1h

- [ ] **Task 37.3: Rate limit management** (1h)
  - Files: `scripts/update-pipeline.ts`
  - What: Track API rate limits for each source. World Bank: 500 req/min. BLS: 500 req/day. FRED: 120 req/min. Add throttling: never exceed 80% of rate limit. Log remaining quota after each run. If approaching limit, reduce scope (fewer indicators) or delay.
  - Dependencies: Task 35.1
  - Test: Pipeline runs without hitting any rate limits
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 38-40 -- Pipeline Polish + Buffer

- [ ] **Task 38.1: Add new API sources to pipeline** (2h)
  - What: Add to the pipeline any APIs from Phase 1 that are not yet automated: Eurostat, FRED, Numbeo, GEM, ILO. Each should have a fetcher function, output file, and schedule.
  - Time: 2h

- [ ] **Task 38.2: Data versioning** (1.5h)
  - Files: `data/versions/`
  - What: Before each pipeline update, snapshot the current data files into `data/versions/YYYY-MM-DD/`. Keep last 4 snapshots (1 month). This allows rollback if bad data is ingested.
  - Time: 1.5h

- [ ] **Task 38.3: Pipeline dry-run mode** (1h)
  - What: Add `--dry-run` flag to pipeline that fetches data but does not save or commit. Reports what WOULD change. Useful for testing.
  - Time: 1h

- [ ] **Task 39.1: Full pipeline test** (2h)
  - What: Run the full pipeline end-to-end: fetch all APIs, diff, index, email report. Verify everything works together.
  - Time: 2h

- [ ] **Task 39.2: Documentation** (1h)
  - Files: `docs/automation.md`
  - What: Document the pipeline: sources, schedule, monitoring, how to add new sources, troubleshooting.
  - Time: 1h

- [ ] **Task 40.1: Buffer / catchup** (full day)
  - What: Fix issues, catch up on any delayed tasks.
  - Time: full day

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Phase 5: Backtesting -- Days 41-50

Goal: Prove the simulator works by testing it against historical data.

### Day 41 -- Historical Dataset Creation

- [ ] **Task 41.1: Compile startup failure dataset (2020-2024)** (2.5h)
  - Files: Create `data/backtesting/startup-failures-2020-2024.json`
  - What: Research and compile 100+ real startup stories with known outcomes. For each: company name, founding year, business model, initial capital, founder experience, location, key milestones reached, final outcome (failed/survived/acquired), time to outcome, failure reason (if failed). Sources: CB Insights post-mortems, Crunchbase, TechCrunch shutdown reports, Y Combinator data. Structure: `{company, year, model, capital, experience, location, milestones: [{name, reached: boolean, month}], outcome, reason}`.
  - Dependencies: none
  - Test: Dataset has 100+ entries with complete data. No empty fields.
  - Time: 2.5h

- [ ] **Task 41.2: Compile success dataset** (1.5h)
  - Files: Create `data/backtesting/startup-successes-2020-2024.json`
  - What: 50+ successful startups (reached $1M+ ARR or acquired for $10M+). Same structure as failures. Include the milestones they hit and their timeline. Sources: IndieHackers, Crunchbase, ProductHunt success stories.
  - Dependencies: none
  - Test: Dataset has 50+ entries with complete milestone data
  - Time: 1.5h

- [ ] **Task 41.3: Standardize milestone taxonomy** (1h)
  - Files: Create `data/backtesting/milestone-taxonomy.json`
  - What: Define a standard set of 30 milestones that map to simulation nodes. E.g. "launch_mvp", "first_customer", "product_market_fit", "10k_mrr", "100k_mrr", "first_hire", "seed_funding", "series_a", etc. Each historical startup's milestones must be mapped to this taxonomy. This enables apples-to-apples comparison between simulated and real outcomes.
  - Dependencies: Tasks 41.1, 41.2
  - Test: All historical milestones map cleanly to taxonomy
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 42-43 -- Backtesting Engine

- [ ] **Task 42.1: Build the backtesting runner** (2.5h)
  - Files: Create `scripts/backtest.ts`
  - What: For each historical startup, reconstruct the scenario ("Start [model] business in [location] with $[capital] and [experience]") and run it through the simulator. Compare simulated milestones vs actual milestones. For each milestone: did the simulator predict it would be reached? Was it actually reached? Calculate hit rate: `predicted_pass AND actually_passed` / total. Also: false positive rate (predicted pass, actually failed) and false negative rate (predicted fail, actually passed).
  - Dependencies: Task 41.3, conditional engine
  - Test: Run backtest on 10 historical startups -- produces accuracy metrics
  - Time: 2.5h

- [ ] **Task 42.2: Probability calibration scorer** (2h)
  - Files: Create `src/lib/backtesting/calibration.ts`
  - What: For nodes where the simulator predicts "65% probability", approximately 65% of historical cases should have succeeded. Build a calibration curve: group all predictions by probability bucket (0-10%, 10-20%, ..., 90-100%), compute actual success rate per bucket. A perfectly calibrated simulator has predicted_rate = actual_rate for all buckets. Output a calibration score (0-100, where 100 = perfect calibration).
  - Dependencies: Task 42.1
  - Test: Calibration curve shows reasonable correlation between predicted and actual probabilities
  - Time: 2h

- [ ] **Task 43.1: Backtest analysis report** (2h)
  - Files: `scripts/backtest.ts`
  - What: Generate a comprehensive report: (a) overall accuracy (hit rate), (b) accuracy by business model, (c) accuracy by milestone type, (d) calibration score, (e) worst predictions (most wrong), (f) best predictions (most accurate), (g) systematic biases (e.g. "simulator is too optimistic about funding, too pessimistic about first sales"). Save to `data/backtesting/report.json`.
  - Dependencies: Task 42.2
  - Test: Report identifies specific biases that can be fixed
  - Time: 2h

- [ ] **Task 43.2: Fix systematic biases** (2h)
  - Files: Engine probability files, `src/lib/probability-matcher.ts`
  - What: Based on the backtest report, adjust probabilities where the simulator is systematically wrong. If the simulator predicts 60% for "first customer" but reality is 40%, adjust the base probability down. Document each adjustment with: old value, new value, reason, backtest evidence.
  - Dependencies: Task 43.1
  - Test: Re-run backtest after adjustments -- calibration score improves
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 44-46 -- Backtest Iteration

- [ ] **Task 44.1: Second backtest round** (2h)
  - What: After bias fixes, run the full backtest again. Compare calibration scores before and after. Target: calibration score > 70 (where 100 = perfect). If still below 70, identify remaining biases and fix.
  - Time: 2h

- [ ] **Task 44.2: Add more historical data** (2h)
  - What: Based on where the simulator is weakest (e.g. F&B startups, or specific countries), add 50+ more historical entries for those categories. Re-run backtest.
  - Time: 2h

- [ ] **Task 45.1: Country-specific backtesting** (2h)
  - What: Run backtests grouped by country. The simulator may be well-calibrated for USA but poorly for Indonesia. Identify country-specific biases and fix them.
  - Time: 2h

- [ ] **Task 45.2: Business model-specific backtesting** (2h)
  - What: Same as above but grouped by business model (SaaS, F&B, Service, etc.). Fix model-specific biases.
  - Time: 2h

- [ ] **Task 46.1: Final calibration round** (2h)
  - What: Third backtest round. Target: calibration score > 75. Log all improvements.
  - Time: 2h

- [ ] **Task 46.2: Publish calibration score** (1.5h)
  - Files: Create `src/components/CalibrationBadge.tsx`
  - What: Display calibration score on the UI as a trust badge: "Calibration: 78/100 (tested against 150+ historical startups)". Subtle, in the Dashboard or footer. Links to a page showing the methodology.
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 47-50 -- Backtesting Infrastructure

- [ ] **Task 47.1: Automated backtest in CI** (1.5h)
  - Files: `.github/workflows/backtest.yml`
  - What: Run backtests automatically on every engine change (PR that modifies `src/lib/engines/`). Fail the build if calibration score drops below 70. This prevents regressions.
  - Time: 1.5h

- [ ] **Task 47.2: Historical data expansion plan** (1h)
  - What: Document where to find more historical data. Create a checklist of sources to scrape/compile. Target: 500+ historical entries by month 3.
  - Time: 1h

- [ ] **Task 48.1: Backtesting documentation** (1h)
  - Files: `docs/architecture.md`
  - What: Document backtesting methodology, calibration scoring, bias correction process.
  - Time: 1h

- [ ] **Task 48.2-50.3: Buffer** (6 days buffer)
  - What: Phase 5 is research-heavy and may take longer. Use buffer days for additional historical data collection, calibration tuning, or catching up on previous phases.
  - Time: variable

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Phase 5B: Community Feedback Loop -- Days 51-54

Goal: Users contribute real outcomes to improve the simulator.

### Day 51 -- Feedback System

- [ ] **Task 51.1: Outcome feedback schema** (1.5h)
  - Files: Create `src/lib/feedback/types.ts`
  - What: Define feedback data model: `{simulation_id, user_id (anonymous hash), submitted_at, months_elapsed, milestones_reached: [{name, reached, actual_month}], final_outcome, comments}`. Store in Supabase table `simulation_outcomes`.
  - Test: TypeScript compiles, Supabase migration creates table
  - Time: 1.5h

- [ ] **Task 51.2: Feedback submission UI** (2h)
  - Files: Create `src/components/FeedbackForm.tsx`
  - What: After 6+ months (tracked via localStorage), prompt user: "How did it go? Help us improve." Form: for each milestone in their original simulation, checkbox (reached/not reached) + when. Final outcome selector. Optional comments. Submit to Supabase.
  - Test: Submit feedback -> data appears in Supabase table
  - Time: 2h

- [ ] **Task 51.3: Reminder system** (1h)
  - Files: `src/lib/feedback/reminders.ts`
  - What: localStorage-based reminder: if user generated a simulation 6 months ago and has not submitted feedback, show a non-intrusive banner on next visit.
  - Test: Set localStorage date to 7 months ago -> banner appears
  - Time: 1h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 52-53 -- Feedback Integration

- [ ] **Task 52.1: Aggregate community outcomes** (2h)
  - Files: Create `src/lib/feedback/aggregator.ts`
  - What: Query all submitted outcomes, aggregate by scenario type and milestone. Compute community success rates. Compare with simulator predictions. Feed into calibration system.
  - Time: 2h

- [ ] **Task 52.2: Public accuracy dashboard** (2h)
  - Files: Create `src/app/accuracy/page.tsx`
  - What: Public page showing: total simulations run, feedback received, accuracy by category, calibration score, sample predictions vs outcomes. This is the trust page.
  - Time: 2h

- [ ] **Task 53.1: Auto-adjust probabilities from feedback** (2h)
  - Files: `src/lib/feedback/adjuster.ts`
  - What: When 10+ feedback entries exist for a scenario type, automatically adjust engine probabilities toward the community-observed rate. Weighted: recent feedback counts more. Only adjust when confidence is high (10+ samples).
  - Time: 2h

- [ ] **Task 53.2: Buffer** (remaining)
  - Time: remaining

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 54 -- Documentation

- [ ] **Task 54.1: Update all docs** (2h)
  - Files: `docs/architecture.md`, `docs/step-by-step.md`, `ROADMAP.md`
  - Time: 2h

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Phase 6: Multi-Agent Simulation -- Days 55-58

Goal: Simulate 1000 agents for probability distributions, not single paths.

### Day 55 -- Multi-Agent Architecture

- [ ] **Task 55.1: Agent profile generator** (2h)
  - Files: Create `src/lib/multiagent/agent-generator.ts`
  - What: Generate N synthetic agents with diverse profiles. Distribution: age (normal dist, mean 30, sd 8), capital (log-normal, median $10K), experience (weighted: 40% none, 30% beginner, 20% intermediate, 10% expert), location (weighted by country population). Each agent gets a unique profile that feeds into the conditional engine.
  - Test: Generate 1000 agents -> profile distribution matches expected demographics
  - Time: 2h

- [ ] **Task 55.2: Parallel simulation runner** (2h)
  - Files: Create `src/lib/multiagent/runner.ts`
  - What: Run the conditional engine for N agents on the SAME scenario. Does NOT call Claude API (too expensive for 1000 runs). Instead, uses the engine directly to compute probabilities, then Monte Carlo samples each node (random number vs probability -> pass/fail). Collects aggregate results: success rate distribution, median path, best/worst case paths.
  - Test: Run 1000 agents on "start SaaS" -> get a distribution of outcomes
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 56 -- Interaction Effects

- [ ] **Task 56.1: Competition modeling** (2h)
  - Files: Create `src/lib/multiagent/interactions.ts`
  - What: When multiple agents pursue the same scenario in the same location, competition effects reduce probabilities. Model: market saturation (too many cafes in one area), talent competition, funding competition. `P_adjusted = P_base * (1 - saturation_factor)` where saturation increases with number of competing agents.
  - Test: 100 agents opening cafes in Bandung -> later agents have lower success probability
  - Time: 2h

- [ ] **Task 56.2: Timing and seasonality** (1.5h)
  - Files: `src/lib/multiagent/timing.ts`
  - What: Add timing effects: launching in December vs January, economic cycle (recession vs boom), seasonal demand. Agents that launch at optimal times have +10-20% probability boost.
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 57 -- Multi-Agent Visualization

- [ ] **Task 57.1: Distribution histogram** (2h)
  - Files: Create `src/components/DistributionChart.tsx`
  - What: After multi-agent simulation, display a histogram of outcomes. X-axis: success metric (revenue, survival months, milestones reached). Y-axis: number of agents. Highlight where the user's profile falls on the distribution. Use SVG (no external charting library).
  - Test: Histogram renders correctly for 1000-agent simulation
  - Time: 2h

- [ ] **Task 57.2: Heatmap probability view** (2h)
  - Files: Create `src/components/HeatmapOverlay.tsx`
  - What: Overlay on the simulation canvas showing probability density. Nodes are colored by how many agents passed through them (green = most, red = least). Edges show flow volume. This replaces the single-path view with a many-paths view.
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 58 -- Multi-Agent Polish

- [ ] **Task 58.1: Performance optimization** (2h)
  - What: 1000 agent simulations should complete in <5 seconds. Profile and optimize the runner. Use Web Workers if needed to avoid blocking UI.
  - Time: 2h

- [ ] **Task 58.2: Multi-agent documentation** (1h)
  - What: Update architecture docs.
  - Time: 1h

- [ ] **Task 58.3: Buffer** (remaining)
  - Time: remaining

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Phase 7: Public API -- Days 59-63

Goal: POST /api/predict endpoint with freemium pricing.

### Day 59 -- API Design

- [ ] **Task 59.1: Design public API spec** (2h)
  - Files: Create `docs/api-spec.md`
  - What: OpenAPI 3.0 spec for: `POST /api/predict` (main endpoint), `GET /api/models` (list available business models), `GET /api/health` (health check). Request: `{scenario, model?, location?, budget?, timeline?, experience?, agents?: number}`. Response: `{prediction: {overall_success: ProbabilityRange, milestones: [{name, probability, timeline, source}], burn_model, warnings}, meta: {engine_used, data_freshness, calibration_score}}`.
  - Time: 2h

- [ ] **Task 59.2: Implement /api/predict** (2h)
  - Files: Create `src/app/api/predict/route.ts`
  - What: Public prediction endpoint. Uses the conditional engine (no Claude API call -- too expensive for public API). Returns structured prediction based on engine data, burn model, and probability matcher. Rate limited: 5 requests per hour for free tier (based on IP).
  - Test: `curl -X POST /api/predict -d '{"scenario": "start SaaS", "budget": 50000}'` returns structured prediction
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 60 -- Rate Limiting + Auth

- [ ] **Task 60.1: API key system** (2h)
  - Files: Create `src/lib/api/auth.ts`, Supabase migration for `api_keys` table
  - What: Simple API key system. Free tier: 5 req/hour, no key needed (IP-based). Pro tier: 1000 req/day, API key required. Keys stored in Supabase. Middleware checks key on every /api/predict request.
  - Time: 2h

- [ ] **Task 60.2: Rate limiting middleware** (1.5h)
  - Files: Create `src/middleware.ts` (or extend existing)
  - What: Rate limit /api/predict based on tier. Use Vercel KV or Supabase for counters. Return 429 with retry-after header when limit exceeded.
  - Time: 1.5h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 61 -- SDK + Documentation

- [ ] **Task 61.1: JavaScript SDK** (2h)
  - Files: Create `sdk/simulator-sdk.ts`
  - What: Lightweight JS/TS SDK: `const sim = new Simulator({apiKey}); const result = await sim.predict({scenario, budget, location});`. Publish to npm (later). Include TypeScript types.
  - Time: 2h

- [ ] **Task 61.2: Python SDK** (1.5h)
  - Files: Create `sdk/simulator_sdk.py`
  - What: Python equivalent: `sim = Simulator(api_key="..."); result = sim.predict(scenario="start SaaS", budget=50000)`. Simple requests-based client.
  - Time: 1.5h

- [ ] **Task 61.3: API documentation page** (2h)
  - Files: Create `src/app/api-docs/page.tsx`
  - What: Interactive API docs page with: endpoint reference, request/response examples, code samples in JS/Python/curl, rate limit info, pricing.
  - Time: 2h

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

### Day 62-63 -- Launch Prep

- [ ] **Task 62.1: Pricing page** (2h)
  - Files: Create `src/app/pricing/page.tsx`
  - What: Pricing page: Free (5/hour, basic predictions), Pro ($29/mo, 1000/day, all engines, multi-agent, priority support). Stripe integration for payments (or simple "contact us" for MVP).
  - Time: 2h

- [ ] **Task 62.2: Landing page updates** (2h)
  - What: Update landing page with: API section, calibration badge, data source count, live counter of simulations run.
  - Time: 2h

- [ ] **Task 63.1: Final testing** (2h)
  - What: End-to-end test of the entire system: web UI, public API, backtesting, pipeline. Fix any remaining issues.
  - Time: 2h

- [ ] **Task 63.2: Launch checklist** (1h)
  - What: Verify: all tests pass, API docs live, pricing page live, calibration badge showing, data pipeline running, error monitoring active.
  - Time: 1h

---

- [ ] **End-of-Day Test & Fix**
  - [ ] Verify all new features work end-to-end
  - [ ] Check no regressions from previous days
  - [ ] Fix any issues found before moving to next day

## Overnight Agent Tasks

These can run in the background while you sleep. Set up and trigger before end of day.

### After Day 1
- RAG full re-index (if not complete during the day) -- let OpenAI embedding API process all 116 files overnight

### After Day 3
- Index new API data files into RAG
- Run `scripts/test-100-simulations.ts` to generate the baseline "Estimated" audit

### After Day 5
- Run full 100-scenario audit after probability-matcher expansion
- Generate quality report for all data files

### After Day 8
- Run final "Estimated" audit
- Generate data quality validation report

### After Day 11
- Run engine tests for all 5 engines overnight

### After Day 13
- Generate 50 burn model calculations for different scenarios and verify reasonableness

### After Day 18
- Full engine test suite + cross-engine comparison

### After Day 22
- 100-scenario test with conditional engine (compare pre/post conditional)

### After Day 26
- Sub-simulation depth test (5 scenarios, 3 levels each)

### After Day 32
- 25-combination profile test (5 profiles x 5 scenarios)

### After Day 36
- First full pipeline run (all APIs)

### After Day 41
- Historical dataset compilation research (web search for startup post-mortems)

### After Day 44
- Second backtest round (full 150+ historical entries)

### After Day 55
- 1000-agent simulation batch run (10 scenarios x 1000 agents = 10K simulations)

---

*Last updated: 2026-03-29*
