# Foresight — Step by Step

## Index
- [Fase 1: Data Foundation](#fase-1-data-foundation) — DONE
- [Fase 1B: Conditional Engine](#fase-1b-conditional-engine) — DONE
- [Fase 1C: Landing + Sacred + Multi-Input + Layout](#fase-1c-landing--sacred--multi-input--layout) — DONE
- [Fase 1D: 3D Force Graph Migration](#fase-1d-3d-force-graph-migration) — DONE
- [Fase 2: Recursive Simulation](#fase-2-recursive-simulation) — DONE
- [Fase 3: Profilo Utente](#fase-3-profilo-utente) — DONE
- [Fase 4: Data Pipeline Automatico](#fase-4-data-pipeline-automatico) — DONE
- [Fase 5: Avatar / Digital Twin](#fase-5-avatar--digital-twin) — DONE
- [Fase 5B: 5-Mode System](#fase-5b-5-mode-system--fatto-2026-04-07) — DONE
- [Fase 5C: DNA Comportamentale](#fase-5c-dna-comportamentale-34-dimensioni--ricerca-fatta-implementazione-parziale) — Ricerca DONE, impl. parziale
- [Fase 6: Cultural Data — 5 paesi](#fase-6-cultural-behavioral-data--5-paesi-indonesia-australia-italia-singapore-malaysia) — ~290K dp
- [Fase 7: Cultural Data — USA](#fase-7-cultural-data--usa-200k-dp) — ~200K dp
- [Fase 8: Cultural Data — Europa](#fase-8-cultural-data--europa-29-paesi-17m-dp) — ~1.7M dp
- [Fase 9: Cross-Cultural Comparative](#fase-9-cross-cultural-comparative-300k-dp) — ~300K dp
- [Livello 90-100: Credibilita Assoluta](#livello-90-100-credibilita-assoluta)
- [Livello 100+: Oracolo Predittivo](#livello-100-oracolo-predittivo)
- [Livello Beyond: Reality Engine](#livello-beyond-reality-engine)
- [Depth Variants](#depth-variants--3-modalita-per-template-summary--analysis--full-model) — DONE (34 template × 3 = 102 varianti)
- [Data Integrity System](#data-integrity-system--3-livelli) — TODO (3 livelli: freshness badge → source verification → auto-update agent)
- [Fase 10: Simulation Quality](#fase-10-simulation-quality--2026-04-08) — DONE
- [UI Polish](#ui-polish)

---

## Fase 10: Simulation Quality (2026-04-08)
- [x] YOU routing graduale: `shouldYouPass()` + `youGateRoute()` con soglia dinamica basata su sacred profile
- [x] Prompt optimization ~25-30%: Upwork/archetipi condizionali, real probs filtrate, sacred roots top 3
- [x] A vs B Comparison: ComparisonDashboard, bottone nel Dashboard, banner comparison mode
- [x] LiveInsights: tema bianco (var(--surface)), no AnimatePresence lag, refs stabili

---

## Fase 1: Data Foundation (+25% credibilita)
- [x] ~~Upgrade Supabase a Pro ($25/mo)~~ → ottimizzato a 512 dim, free tier sufficiente ($0/mo)
- [x] Schema: vector(1536) → vector(512), ivfflat → HNSW (m=16, ef=64)
- [x] Re-indicizzare 113 JSON nel RAG → 50,749 rows, 114+ file
- [x] 247 Upwork data points (8 agenti di ricerca) → data/upwork-data.json → indicizzato in Supabase
- [x] Auto-indexing pipeline: /api/index-data + Vercel Cron nightly (delta detection)
- [x] Prompt hardened: no hallucination, RAG data priority, Upwork mechanics injected
- [x] 3-tier AI cascade: Claude Haiku → OpenAI GPT-4o-mini → Groq Llama 3.3
- [x] 10 test Upwork simulazioni: media 6.6→8.5/10 con Claude
- [x] Aggiungere API: Eurostat, Numbeo, FRED (fatto — src/lib/apis/)
- [x] Aggiungere API: GEM (40 paesi, 5 metriche) + OECD (38 paesi, 6 metriche) — src/lib/apis/
- [x] Pre-processing scenari foto: photo-preprocessor.ts (25 categorie, 50+ cue terms, strip visual noise)
- [x] Test: 100/100 scenari coperti — coverage-report.md, 18 gap file creati, 19 keyword aggiunti
- [x] Re-index: 209/210 file indicizzati, 88,650 rows in Supabase, 227 nuovi chunks

## Fase 1B: Conditional Engine (+35% credibilita) — FATTO (2026-04-06)
- [x] Decision Pruning: 5-7 domande binarie YES/NO pre-simulazione, modifier applicato a tutti i bottleneck
- [x] Domande dinamiche: Claude genera domande specifiche per scenario (non generiche)
- [x] Upwork-specific mechanics nel prompt (Connects, JSS, rates, funnel)
- [x] P(nodo) = f(business_model, location, budget, timeline) — detectBusinessType() + profile modifiers
- [x] 6 business-model engines (SaaS, F&B, Agency, Marketplace, Creator, Ecommerce) — generate/route.ts:162-181
- [x] Ogni engine ha probabilita specifiche per industry/country — BUSINESS_BASE_PROBS + COUNTRY_MODIFIERS (44 paesi)
- [x] Range output: base/optimistic/adverse — nel prompt Claude (generate/route.ts:1320)
- [x] Burn/time modeling: canSurviveMonths nel profilo, iniettato nel prompt — user-profile.ts:45
- [x] Dipendenza tra nodi: modifiesDownstream + applyNodeDependencies() — generate/route.ts

## Fase 1C: Landing + Sacred + Multi-Input + Layout — FATTO (2026-04-01)

### Landing Page
- [x] Landing page su `/` con hero emotivo, search bar, problem/solution, features, comparison table, CTA
- [x] Simulator spostato su `/sim`
- [x] Responsive, animated SVG hero graph, rotating placeholders

### Sacred Mode Fix
- [x] Sacred mode salta dati statistici (realProbs + kbContext) — output 100% sacro
- [x] Template in sacred mode: API call con `sacredMode: true` (non dati statici)
- [x] Bottone Sacred nella TopBar vicino a Generate (pill viola)

### Multi-Input (Tier 2)
- [x] Foto/audio/URL/PDF/video si accumulano come attachment (non sovrascrivono)
- [x] Chip visivi sotto input bar (icona tipo, label, X, "Clear all")
- [x] Al Generate: testo + allegati combinati in scenario unico

### Vertical Layout
- [x] Toggle "Vertical/Horizontal" in Settings
- [x] dagre rankdir LR/TB, persiste localStorage

### Competitor Analysis
- [x] Analisi ParallelLives.ai — solo landing page, 0 tech, 200K followers
- [x] `docs/competitor.md` aggiornato

### Research & Documentation
- [x] `docs/stack.md` — guida completa stack web (13 categorie, top 10 con prezzi, graph DB, classifiche)
- [x] `docs/ui-references.md` — tutti i link demo (33 vasturiano, reagraph, vizceral, etc)
- [x] Analisi 15+ graph viz libraries, classificate per visual/performance/UX/enterprise
- [x] Prototipo `/ui/force3d` con card HTML, particelle, DAG
- [x] Reagraph scartato (conflitto Three.js, inferiore a 3d-force-graph)

---

## Fase 1D: 3D Mode — FATTO (2026-04-01 sera)

### Step 1: Rendering base — FATTO
- [x] Toggle "3D Mode" in Settings (hamburger menu)
- [x] Three.js scena: sfere luminose, tubi 3D, griglia, fog
- [x] Card ologramma CSS2DRenderer (glassmorphism, glow, hover)
- [x] Colori edge: verde (pass), rosso (fail)
- [x] Posizioni basate su layout dagre del 2D

### Step 2: Walk-through persona — FATTO
- [x] Personaggio 3D (capsule + testa) con bob animation
- [x] "Walk through" button — cammina nodo per nodo
- [x] Camera follow mode (terza persona)
- [x] Spazio = pausa, +/- = velocita, WASD = muovi camera
- [x] Point cloud clessidra (800 particelle) ai bottleneck

### Step 3: Effetti — FATTO
- [x] Fog (profondita)
- [x] Camera isometric 3/4 view + follow mode toggle
- [x] Sfondo scuro per ologramma
- [x] UnrealBloomPass (glow) — strength 0.4, radius 0.3, threshold 0.8
- [x] Camera auto-orbit — 0.1 rad/s dopo 3s idle

### Step 4: FATTO (2026-04-06)
- [x] Simulazione 100 persone in 3D — 10 wave x 10 persone, capsule mesh, bob animation
- [x] 36 point cloud per Sacred Roots — point-cloud-shapes.ts con forme parametriche
- [x] Sacred mode nel 3D — toggle + API call (Simulator3D.tsx:65,132,333)
- [x] Sound design per pass/fail — Web Audio API (src/lib/sounds.ts: click, success, fail, whoosh)
- [x] Bloom post-processing — EffectComposer + UnrealBloomPass
- [x] Fly-through camera — cinematic follow "YOU" con lerp 0.05, ESC to exit
- [x] Sim3DToolbar — play/stop/stats/fly-through/speed controls

---

## Fase 2: Recursive Simulation (+10% wow factor) — FATTO (2026-04-06)
- [x] Double-click su nodo → genera sub-simulazione (chiamata API con parentContext)
- [x] UI: breadcrumb con navigazione multi-livello
- [x] Navigazione breadcrumb: Main > Node Label > Sub-node (clickable)
- [x] Dati del nodo parent passati come contesto alla sub-simulazione
- [x] Back button + Backspace per tornare al livello superiore
- [x] Max depth 3 livelli, sfondo diverso per depth
- [ ] Test: drill-down 3 livelli di profondita

## Fase 3: Profilo Utente (+15% personalizzazione) — FATTO
- [x] Schema profilo: eta, paese, citta, capitale, skills, esperienza, network, lingua, visa, pattern
- [x] UI: ProfilePanel in sidebar con 5 sezioni (Identity, Financial, Professional, Network, Upwork)
- [x] Storage: localStorage con auto-save
- [x] Iniezione profilo nel prompt Claude come context personalizzato
- [x] Campi Upwork-specifici: JSS, lifetime earnings, badge tier, hourly rate
- [x] Warning personalizzati: 18 regole (profile-warnings.ts), WarningBanner.tsx, field dots in ProfilePanel
- [x] Probabilita diverse per profilo: sacred modifier engine + dual probability display in SimNode

## Fase 4: Data Pipeline Automatico (+15% freshness) — FATTO (2026-04-06)
- [x] Auto-indexing API: /api/index-data (delta detection, embed, upload)
- [x] Vercel Cron nightly (vercel.json, 0 0 * * *)
- [x] Script `scripts/update-pipeline.ts` — 7 API fetcher (Eurostat, FRED, World Bank, CoinGecko, Exchange Rates, Numbeo, REST Countries)
- [x] Aggiornamento `real-probabilities.json` con dati freschi — npm run update-data
- [x] Diff report in docs/pipeline-reports/YYYY-MM-DD.md
- [x] Test: 152 data points fetched, 5/7 API funzionanti

---

## Fase 5: Avatar / Digital Twin — FATTO (2026-04-06)

### Livello 1: Sacred Root Self-Assessment — FATTO
- [x] 20 domande comportamentali — sacred-assessment.ts
- [x] Ogni domanda mappa a 1-3 radici sacre, tutte 36 coperte
- [x] Output: 36 punteggi (0-10) con radar per dominio
- [x] Storage: localStorage, integrato in UserProfile
- [x] SacredAssessment.tsx con pagine, progress bar, risultati

### Livello 2: Probabilita Personalizzate — FATTO
- [x] Modifier engine: sacred-modifier.ts — score 0→0.5x, 5→1.0x, 10→1.5x
- [x] Dual display in SimNode: "YOUR: 9%" + "14%" barrato
- [x] Claude riceve sacred profile e calibra nodi
- [x] Tooltip con reason: "Your Patience is 3/10 — -25%"

### Livello 3: Avatar Visuale — FATTO
- [x] Particella "YOU" gold (#fbbf24), 1.5x grande, label "YOU"
- [x] Path personalizzato basato su sacred profile
- [x] 99 particelle generiche per confronto
- [x] Path YOU evidenziato dopo simulazione (bordi gold)

### Livello 4: Avatar Report — FATTO
- [x] AvatarReport.tsx: 5 tab (Your Path, Diagnosis, Prescription, What-If, Comparison)
- [x] Diagnosi sacra per ogni punto di fallimento
- [x] Prescrizione con verso sacro + azione concreta
- [x] What-if: 3 scenari (weakest root, top 3, ideal)
- [x] Confronto avatar vs media 100 persone + percentile

---

## Livello 90-100: Credibilita Assoluta

### Simulation Engine v2: Pre-determined Fate — FATTO (2026-04-06)
- [x] Pre-calcolo: precomputeFates calcola percorso completo di ogni persona
- [x] Lancio simultaneo: toggle Wave/Simultaneous in settings
- [x] SVG path following: path-follower.ts, getPointAtLength, bezier curves
- [x] Velocita individuale: 0.7x-1.3x deterministica per indice persona
- [x] Deviazione ai bottleneck: 200ms pausa + divert to fail edge
- [x] Replay deterministico: stessa sim = stesso risultato

### Data Points da Integrare nel RAG
- [ ] VC: vc-y-combinator, vc-sequoia, vc-a16z, vc-benchmark, vc-accel, vc-founders-fund, vc-lightspeed (7 file, ~1,460 dp)
- [ ] Consulting: consulting-mckinsey, consulting-bcg, consulting-bain, consulting-deloitte, consulting-pwc (5 file, ~1,000 dp)
- [ ] Banks: bank-jpmorgan, bank-goldman-sachs, bank-morgan-stanley, bank-ubs, bank-hsbc, bank-citibank, bank-deutsche-bank, bank-barclays, bank-bofa, bank-credit-suisse (10 file, ~2,000 dp)
- [ ] Magazines/Research: Forbes, HBR, Economist, Bloomberg, Psychology Today, Scientific American
- [ ] Universities: Stanford, MIT, Harvard, Wharton, Oxford/OWID

### Backtesting (+30% credibilita) — FATTO (2026-04-06)
- [x] Dataset 50 casi storici con outcome noti — backtest-cases.json
- [x] Runner: scripts/run-backtest.ts (mock + live mode)
- [x] Metriche: Brier 0.27, Accuracy 58%, Hit Rate 58%
- [x] Pagina pubblica /backtest con calibration chart, tables, filters

### Community Feedback Loop — FATTO (2026-04-06)
- [x] FeedbackForm.tsx: outcome selector, time elapsed, details, lessons
- [x] /api/feedback: POST (store) + GET (retrieve)
- [x] /community page: calibration chart, anonymized stories, flywheel counters
- [x] Reminder 30 giorni dopo simulazione
- [x] FlywheelBar nella landing page

### Multi-Agent Simulation — FATTO (2026-04-06)
- [x] 1000 agenti con profili diversi (multi-agent.ts, Mulberry32 PRNG, seed 42)
- [x] Segmentation: by age, capital, country + bottleneck analysis
- [x] Output: MultiAgentResults.tsx — histogram, insights, tables
- [x] "Simulate 1000" button in toolbar

### API Pubblica — FATTO (2026-04-06)
- [x] POST /api/predict → probability, confidence, probRange, bottlenecks, sources
- [x] Rate limiting: 5/day per IP, 429 con Retry-After
- [x] /api-docs page con try-it form, examples, dark code blocks
- [x] SDK JavaScript (@simulator/sdk) + Python (simulator-sdk) — sdk/ directory
- [x] API docs aggiornati con SDK install + examples
- [ ] Pricing tier pro $29/mo (futuro — richiede auth)

---

## Livello 100+: Oracolo Predittivo

### Prediction Marketplace — SCAFFOLD (2026-04-06)
- [x] /marketplace page con 3 mercati esempio, email signup, "Coming Q3 2026"
- [ ] Smart contract / real money integration (richiede blockchain)

### 50 Industry-Specific Engines — SCAFFOLD (2026-04-06)
- [x] /engines page con 20 industry cards (6 Active, 14 Coming Soon)
- [x] Active engines linkano a /sim con template pre-caricato
- [ ] Engines iper-specifici con modelli causali (futuro)

### Governo / Istituzionale (B2G) — SCAFFOLD (2026-04-06)
- [x] /government page con 3 mockup simulazioni policy, CTA istituzionale
- [ ] Dati reali per paese/regione + contratti governativi (futuro)

### Real-Time Sensing — SCAFFOLD (2026-04-06)
- [x] /realtime page con dashboard mockup, 3 alert esempio
- [ ] Event-driven system + monitoraggio 50+ fonti (futuro)

### Causal Graph Learning
- [ ] ML scopre relazioni causali non mappate (richiede training data)

### Digital Twin Personale — SCAFFOLD (2026-04-06)
- [x] /twin page con visualizzazione interconnected circles, feature cards
- [ ] Modello continuo (richiede architettura dedicata)

---

## Livello Beyond: Reality Engine

### Prescriptive Engine — SCAFFOLD (2026-04-06)
- [x] /prescriptive page con 3 esempi ottimizzazione, comparison grid
- [ ] AI-powered path optimization (futuro)

### Intervention Optimizer — FUNZIONALE (2026-04-06)
- [x] /optimize page con 5 slider parametri + 27 combinazioni testate
- [x] Top 3 path ottimali con confronto parametri
- [ ] Integrazione con AI per 1000 variazioni (futuro)

### Cross-Domain Causality — FUNZIONALE (2026-04-06)
- [x] /causality page con 5 domini, slider, BFS ripple effects
- [x] Network diagram + impact table
- [ ] ML-powered causal weights (futuro — ora hardcoded)

### Generational Modeling — FUNZIONALE (2026-04-06)
- [x] /generational page con compound growth model, timeline 5-50y
- [x] Wealth trajectory, education access, QoL projection
- [ ] Full multi-generational dynasty model (futuro)

### Collective Simulation — FUNZIONALE (2026-04-06)
- [x] /collective page con logistic saturation model
- [x] N entrants vs survival rate, saturation point, optimal N
- [ ] Agent-based emergent behavior (futuro)

### Reality Arbitrage — FATTO (2026-04-07)
- [x] reality-arbitrage.ts: 35 opportunita in 5 categorie (Business, Career, Investment, Lifestyle, Geography)
- [x] /arbitrage page con filtri, search, sort, detail modal, "Simulate This" CTA
- [x] Aggiunto a /explore hub + landing page nav

### Autonomous Execution Agent — FUNZIONALE (2026-04-07)
- [x] execution-planner.ts: 5 piani esecutivi (cafe, SaaS, freelance, ecommerce, generic)
- [x] /execute page con timeline, step cards, platform links reali, cost/time estimates
- [x] "Ready to Execute?" button nel Dashboard post-simulazione
- [x] Country-aware (Indonesia, US, UK, Italy, Singapore, Australia)
- [ ] Integrazione API reali (LegalZoom, Stripe, etc.) — futuro

---

## Fase 5B: 5-Mode System — FATTO (2026-04-07)
- [x] Ricerca competitor: Palantir (15 superfici Foundry + 7 Gotham), Bloomberg (PORT scenarios), AnyLogic (3 paradigmi), Crystal Knows (DISC), Aaru ($1B, synthetic audiences), Stanford Generative Agents
- [x] Architettura 5 modi: Explore (dati puri) | Simulate (attuale) | Personal (profilo psicologico) | What-if (modifica prob) | Stress Test (worst case)
- [x] `src/lib/sim-modes.ts` — SimMode type, MODE_CONFIG, canActivateMode(), loadMode(), saveMode()
- [x] `src/components/ModeSelector.tsx` — segmented control con sliding indicator framer-motion, 2 gruppi CREATE/ANALYZE, disabled state per modi che richiedono grafo
- [x] `src/components/PersonalProfileInline.tsx` — 5 dimensioni psicologiche tutte chip-based: blocker, never-do, risk tolerance, decision style, under pressure. Valori Schwartz inferiti automaticamente dalle selezioni.
- [x] TopBar.tsx — ModeSelector strip integrato, prompt condizionale (hidden in What-if/Stress), PersonalProfileInline in Personal mode
- [x] SimulatorCanvas.tsx — activeMode state + localStorage, Explore blocca auto-sim, Stress applica probRange.adverse, What-if snapshot originalProb
- [x] prompt-builder.ts — mode-aware: Explore = enciclopedico (min 2 fonti/bottleneck), Personal = profilo psicologico completo
- [x] SimNode.tsx — delta badge verde/rosso (What-if), red pulse border (Stress), dashed border (What-if editable), originalProb tracking
- [x] SimToolbar.tsx — label dinamici ("Test Changes" in What-if, "Run Stress Test" in Stress), hide Simulate in Explore
- [x] SimOverlays.tsx — StressOverlay component (survival rate pill con icona zap)
- [x] globals.css — stress-pulse keyframe, data-mode selectors, mode-selector/tab utility classes
- [x] Build verificato: 0 errori TypeScript, 0 errori Next.js build

## Fase 5C: DNA Comportamentale (34 dimensioni) — Ricerca FATTA, implementazione parziale
- [x] Mappatura 20 dimensioni esistenti dai file ME. iCloud (Core Values 9, Purpose, Fear, Vision, Principles 9, Boundaries 6, Barrett Level, Order Thinking, Natural Role, Strengths, Weaknesses, Critical Patterns, Happiness, Shadow, 12 dim maturita, Stress Test)
- [x] Identificate 14 dimensioni mancanti (Attachment Style, Locus of Control, Risk Tolerance, Time Orientation, Conflict Style, Decision Style, Stress Response, Energy Pattern, Grit, Need for Cognition, Tolerance for Ambiguity, Self-Determination, Emotional Regulation, Core Beliefs)
- [x] PersonalProfileInline cattura 5 dimensioni chiave via chip e inferisce valori Schwartz
- [ ] Espandere PersonalProfileInline con le 14 dimensioni mancanti (progressive disclosure)
- [ ] Creare mapping completo dimensione → modifier probabilita (es. Grit alto → persistenza +40% ai bottleneck)

---

## Fase 6-9: Cultural & Statistical Data — FATTO (2026-04-08)

### Dati statistici scaricati (3.2M+ dp da API reali)
- [x] **Eurostat** — 71 dataset, 27 paesi EU, 3.06M dp (GDP, lavoro, educazione, salute, turismo, crimini, migrazione, housing, digital, R&D)
- [x] **ILO** — 10 indicatori, 21 paesi, 138K dp (unemployment, earnings, hours, employment by sector)
- [x] **World Bank** — 165+ indicatori, 21 paesi (core6 + extra + mega), 16K dp
- [x] **UN Data** — SDG indicators, 21 paesi, 4K dp
- [x] **REST Countries** — 21 paesi, 419 dp (demographics, languages, currencies)
- [x] **CoinGecko** — top 20 crypto, 45 dp

### Dati culturali comportamentali (629+ dp con fonte URL, 2024-2026)
- [x] **Indonesia** — 157 dp: cafe/nongkrong culture, e-wallet 96%, halal market, GoFood/Grab, Gen Z behavior, religion impact
- [x] **Italy** — 159 dp: espresso/bar culture, NEET 15.2%, brain drain, Partita IVA, North-South divide, tourism 458M notti
- [x] **Australia** — 160 dp: flat white culture, BNPL/Afterpay, immigration, housing crisis, work-life balance, sports
- [x] **USA** — 153 dp: Starbucks/specialty coffee, student debt, gig economy, tipping culture, regional differences
- [ ] **Singapore** — in progress (hawker culture, HDB, tuition culture, COE, startup ecosystem)
- [ ] **Malaysia** — da fare

### Pipeline & Embedding
- [x] 10 script API creati (worldbank ×3, eurostat ×3, oecd, ilo, un-data, fred)
- [x] embed-chunked.mjs — chunked embedding (5-8 dp/chunk, ~145K chunks)
- [x] Supabase Pro ($25/mo) — 8 GB DB limit
- [x] Embedding in corso (145K chunks → Supabase pgvector)
- [ ] Test retrieval culturale post-embedding
- [ ] Embed file >50MB (9 file Eurostat/ILO skippati per OOM — servono streaming)

### Fonti non ancora scaricate
- [ ] Hofstede 6 dimensioni CSV (102 paesi) — geerthofstede.com
- [ ] World Values Survey wave 7 (64 paesi) — worldvaluessurvey.org
- [ ] DataReportal Digital 2026 (200+ paesi, digital behavior)

**Totale: 3.2M+ dp statistici + 629 dp culturali comportamentali = 3.5M+ dp**

---

## Sessione 2026-04-08 pomeriggio — Engine Fixes + Live Mode + Web Search

### Simulation Engine Fixes
- [x] Gate edge matching: exact → startsWith (fix particelle perse)
- [x] Math.floor → Math.round (fix 0 MADE IT)
- [x] Fallback edge per particelle senza match
- [x] Fix applicato sia precompute che runtime

### Anti-Hallucination
- [x] Prompt: no decimali, range obbligatori, reality check
- [x] Sanitizer post-AI: prob arrotondate al 5%, probRange auto-generato

### Tavily Web Search
- [x] fetchWebSearch() — dati freschi 2025-2026 per ogni scenario
- [x] Priorita #1 nel prompt (sopra RAG e training data)
- [x] Sacred mode: no Tavily. Normal mode: si Tavily.
- [x] /api/live-facts — "RIGHT NOW IN THE WORLD" real-time facts
- [x] /api/refresh-probs — aggiorna prob template in background

### Live Mode
- [x] Simulazione infinita, particelle auto-cleanup
- [x] LiveTimer (elapsed + orario inizio)
- [x] LiveInsights pannello dx (world facts + simulation insights)

### Template
- [x] Template carica istantaneo (no API call) + Tavily refresh background
- [x] Unicorn Startup template (3 varianti: 8/16/26 nodi)

### Layout
- [x] Dagre TB: altezza reale nodi → no overlap

---

## UI Polish (continuo)
- [x] Responsive mobile 320px — audit completo + @media max-width:360px aggiunto
- [x] Dark mode — prefers-color-scheme + data-theme + 19 dark: usages
- [x] Frontend Design Rules Playbook creato
- [x] Global padding audit completato
- [x] Canvas dots piu visibili
- [x] Pass edges 3x piu spesse
- [x] Bottleneck shape: esagono → rombo/diamond (4 lati, clip-path polygon)

## Refactor — FATTO
- [x] SimulatorCanvas split: 3,002 → 650 righe (-78%) — 5 hooks estratti (useSimulation, useFlowGeneration, useDrillDown, useReplayMode, useStepMode)
  - [x] graph-utils.ts (dagre layout + templateToFlow) — 154 righe
  - [x] simulation-types.ts (speed config + PrecomputedFate + precomputeFates) — 130 righe
  - [x] SimOverlays.tsx (CutLineIndicator + ParticleLayer) — 78 righe
  - [x] SimToolbar.tsx (7 toolbar components) — 458 righe
  - [x] usePathFilter.ts (path filter hook) — 113 righe
- [x] generate/route.ts split: 1,733 → 6 file (route.ts 57L, types.ts 51L, data-fetcher.ts 1124L, prompt-builder.ts 231L, response-parser.ts 90L, ai-cascade.ts 161L)
- [x] templates.ts split per categoria — templates/business.ts, richard.ts, life.ts + barrel

---

## Quality Assurance — FATTO (2026-04-07)
- [x] 153 unit test (vitest): simulation, sacred modifier, assessment, profile warnings, multi-agent, photo preprocessor, point clouds, response parser, data fetcher, reality arbitrage, execution planner, feedback, path follower
- [x] Prompt audit: 6.3/10 → fix applicati (15 industry baselines, 4 archetypes non-business, data priority order, country sector modifiers)
- [x] RAG quality: 9.7/10 (19/20 queries good, 1 weak — gym)
- [x] Coverage: 100/100 scenari coperti, 18 gap file creati
- [x] Card design restored: bordi colorati, badge probabilita cerchio, sacred purple theme

## Depth Variants — 3 modalita per template (Summary / Analysis / Full Model)
- [x] Sistema depth level: selettore UI nel TopBar (segmented control), prompt dinamico, API route, badge nodi
- [x] Upwork Money Tree: Deep (34 nodi), Analysis/Mid (13 nodi), Summary/Min (7 nodi)
- [x] Template selector: varianti Mid/Min nascoste, sub-picker con 3 opzioni al clic
- [x] Source labels: 201 fonti sintetizzate → "(estimated, non-official)", 188 fonti reali intatte
- [x] Creato Full Model (30-45 nodi) + Mid/Analysis (10-14) + Min/Summary (5-7) per TUTTI i template (2026-04-08):
  - [x] business.ts (17): startup(35), money(37), cafe(32), content(30), saas(40), freelance(31), app(32), dropshipping(33), saas_scratch(29), side_hustle(31), buy_business(29), affiliate_blog(29), paid_community(29), crypto_journey(29), ai_agency(26), upwork_freelance(30), upworkMoneyTree(34)
  - [x] richard.ts (10): cafepedia(30), move_abroad(25), interfaith(19), break_pattern(26), first_million(22), perfectionism(31), faith_business(31), provider(32), polymarket(30), leverage(30)
  - [x] life.ts (7): lend_money(36), lose_weight(29), learn_skill(29), youtube_guru(31), want_to_win(33), career_change(39), buy_house(39)
- [x] 2 nuovi template aggiunti: career_change (Cambiare carriera a 30+), buy_house (Comprare casa)
- [x] Naming convention: `{key}` = Full Model, `{key}Mid` = Analysis, `{key}Min` = Summary
- [x] Source URL: campo `sourceUrl` su tutti i nodi con fonti reali 2023-2026
- [x] Ricerca approfondita: 10 agenti paralleli con web search per statistiche reali
- [x] Totale: 34 template × 3 profondita = 102 varianti, ~2,800+ nodi con dati verificati

## Data Integrity System — 3 livelli
Obiettivo: garantire che ogni dato nel simulatore sia verificabile, aggiornato e trasparente. Questo e' il MOAT vs LLM generici.

### Livello 1: Freshness Badge (visuale, priorita' ALTA)
- [ ] Aggiungere campo `dataDate` a ogni dp nel JSON (data di quando il dato e' stato verificato)
- [ ] Badge visuale sulle card: verde (<3 mesi), giallo (3-6 mesi), rosso (>6 mesi)
- [ ] Mostrare freshness nel detail panel (panel a destra in step mode)
- [ ] Script di audit: scansiona tutti i JSON e lista dp con data > 6 mesi

### Livello 2: Source Verification (cron, priorita' MEDIA)
- [ ] Cron job settimanale: fetch ogni `sourceUrl` nei JSON
- [ ] Se URL ritorna 404 o redirect → flag "needs review" + notifica
- [ ] Se contenuto della pagina e' cambiato significativamente → flag "content changed"
- [ ] Dashboard interna: lista dp con problemi di freshness/URL rotti
- [ ] Report automatico via email/Slack con dp da aggiornare

### Livello 3: Auto-Update Agent (AI, priorita' BASSA — il vero moat)
- [ ] Agente AI (cron mensile): per ogni sezione del JSON
  - Cerca online numeri piu' recenti (web search)
  - Confronta vecchio vs nuovo valore
  - Se differenza >10% → propone update con fonte
  - Salva proposta in `data/pending-updates.json`
- [ ] UI di review: l'admin vede le proposte e approva/rifiuta con 1 clic
- [ ] Log di ogni update: chi, quando, vecchio valore, nuovo valore, fonte
- [ ] Obiettivo: ogni dp verificato almeno 1x ogni 3 mesi

### Metriche di qualita' (target)
- [ ] 100% dei dp con `sourceUrl` (ora: 80% template, 100% JSON Upwork)
- [ ] 100% dei dp con `dataDate`
- [ ] 0 URL rotti (404)
- [ ] 0 dp piu' vecchi di 6 mesi senza flag
- [ ] Tempo medio di aggiornamento dopo pubblicazione nuova fonte: <7 giorni

## Flowchart View (ELK.js) — FATTO parziale (2026-04-08)
- [x] FlowchartView.tsx con ELK.js layout engine (SVG puro)
- [x] View selector 2D/3D/Flow nel menu settings
- [x] Step mode compatibile con Flow view (opacity + edge hidden)
- [ ] Modalita' ritaglio in Flow (cut line orizzontale)
- [ ] Fit-to-screen automatico al primo load
- [ ] Click su nodo → detail panel anche in Flow

*Ultimo aggiornamento: 2026-04-08*
