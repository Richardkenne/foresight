# Foresight — ROADMAP

## Completato (sessione 2026-03-27)

### Design & UI
- [x] v1 archiviata in ~/Simulator/v1/, v2 attivo in ~/Simulator/v2/
- [x] TopBar redesign — singola barra 56px, frosted glass, logo SVG
- [x] Button component (6 varianti) + Spinner component
- [x] Design tokens: --accent, --danger, --warning, --success, --purple
- [x] Dashboard pannello laterale dx (400px), accent line, label non troncate
- [x] Stats bar dark glassmorphic con wave progress bars
- [x] Favicon SVG custom, metadata OG
- [x] Zero emoji — tutto Lucide SVG icons

### Simulation Engine
- [x] Reveal sequenziale — nodi appaiono quando particelle arrivano
- [x] Edge hidden durante simulazione
- [x] Fix reverse simulation (edgesRef race condition)
- [x] Particelle persistenti dopo sim
- [x] Stats reset quando si carica nuovo template

### Data & AI
- [x] ~374,000 data points across 179 file, 67K embeddings in Supabase (141 indicizzati)
- [x] 7 API live gratuite: World Bank, REST Countries, Exchange Rates, BLS, Wikipedia, Teleport, CoinGecko
- [x] Prompt AI: "Estimated" se no fonte, copertura completa, fail obbligatori
- [x] Keyword matching italiano
- [x] Template startup e money fixati

## Completato (sessione 2026-03-28)

### Bulk Data Download
- [x] **World Bank API** — 10 file, 247,460 data points scaricati (GDP, population, education, health, labor, business, poverty, environment, financial, gender)
- [x] **Eurostat API** — src/lib/apis/eurostat.ts (GDP, unemployment, business creation, education)
- [x] **Numbeo API** — src/lib/apis/numbeo.ts (cost of living, 60+ cities)
- [x] **FRED API** — src/lib/apis/fred.ts (CPI, unemployment, GDP, savings, Fed funds — sostituisce BLS)
- [ ] **OECD API** — da fare (API SDMX complessa)
- [x] **Life Probabilities Deep** — 312 data points: health/fitness, relationships, immigration/relocation. 20+ fonti (CDC, NIH, APA, Pew, IHRSA, FSI, NIAAA, etc.)
- [x] **Education Probabilities Deep** — 283 data points, 20 sezioni (university acceptance/completion, dropout by field, student loans, ROI by degree, PhD rates, bootcamps, certifications, trade school, MOOC, gap year, 8 countries). 20+ fonti (NCES, NSF, BLS, NACE, AAMC, ABA, OECD, UNESCO, World Bank, CFA Institute, AICPA, PMI, etc.)
- [x] **Tech/AI Deep Probabilities** — 236 data points, 21 sezioni
- [x] **Fame/Entertainment/Sports** — 187 data points, 23 sezioni
- [x] **Career Probabilities Deep** — 346 data points, 23 sezioni
- [x] **Psychology & Habits Probabilities** — 247 data points, 6 sezioni
- Totale progetto: ~350K data points (obiettivo 500K+)

### Deep Research
- [x] 130+ repo analizzati in 12 categorie — docs/deep-research.md
- [x] v3 folder con 6 research demos (loopy, trust, simulating, ballot, covid, crowds)
- [x] Competitor analysis: nessuno fa "visual node-based life simulator con LLM + sacred foundation"

### Truth Matrix — 3 Layer Architecture
- [x] **Layer 0: Sacred Texts (Bible + Quran)** — 16,095 sacred patterns
- [x] **Layer 1: Human Nature (Science + Ancient Wisdom)** — Choices13k, Mesa ABM, Life Events, Game Theory
- [x] **Layer 2: Modern Data** — 106 real probabilities, 46,325 data entries across 69 JSON files

### Engine & Integration
- [x] Dataflow engine, Probability matcher, Speed slider, Signal delta propagation
- [x] Sacred patterns + Real probabilities iniettati nel prompt Claude
- [x] RAG Vector Search — Supabase pgvector, 50K entries, HNSW index

### UX Fixes (sessione 2026-03-28 sera)
- [x] Reverse simulation, Dashboard inline, Particelle persistenti
- [x] Save/Share/Export PNG, Pagina /sim/[id]
- [x] Mobile responsive, Vercel deploy

## Completato (sessione 2026-03-28 notte / 2026-03-29)

### Animazione Fail + Replay Mode + Enterprise UI Redesign
- [x] Fail animation (caduta, grayscale, persistente)
- [x] Replay Mode (TradingView Bar Replay-style con forbici)
- [x] Enterprise UI Redesign (Tersa-inspired): Geist font, palette ridotta, nodi flat, edges animate, floating toolbar

## Completato (sessione 2026-03-29 notte / 2026-03-30)

### Photo to Simulation (Scene Decomposition)
- [x] Upload foto (drag & drop, HEIC support via heic2any)
- [x] EXIF extraction (GPS, datetime, camera) via exifr
- [x] Claude Vision API analizza foto su 5 layer (oggetti, attivita, economia, tempo, luogo)
- [x] 3-5 Simulation Seeds generati per foto (card UI con icona, categoria, confidence)
- [x] Click su seed → genera simulazione automaticamente
- [x] Resize immagine a 1024px client-side prima dell'invio (risparmio token)

### Context Tags (Structured Routing)
- [x] 4 tag: Location, Budget, Timeline, Experience
- [x] Tag routing: keyword injection per KB/RAG matching migliorato
- [x] Tag prompt modifier: istruzioni specifiche per Claude (budget constraint, timeline compression, experience level)
- [x] Location geolocation browser (auto-detect)
- [x] Tag UI: chip cliccabili sotto l'input, inline editing, pill selector per experience

### Context Node (Canvas)
- [x] Nodo custom `contextNode` con foto + scenario text all'inizio del flow
- [x] Auto-connesso ai nodi di partenza
- [x] Sempre visibile durante la simulazione (non si nasconde)

### History (localStorage)
- [x] Auto-save ogni simulazione generata (max 50 entries FIFO)
- [x] HistoryPanel nel sidebar drawer — timestamp, scenario, foto thumbnail, tags
- [x] Click su entry → ricarica simulazione istantaneamente (no API call)
- [x] Delete singola entry + Clear all

### Hamburger Menu Sidebar
- [x] Drawer animato (slideInLeft) con navigazione: Home, History (funzionale), Saved (Soon), Settings (Soon)
- [x] Item 48px altezza, icone 24px, font 15px, gap 16px

### UI Spacing Overhaul (TradingView-level)
- [x] **Frontend Design Rules Playbook** creato (`~/.claude/playbooks/frontend-design-rules.md`)
- [x] 14 agenti di ricerca su: Linear, Vercel, Stripe, TradingView, Tersa, Dify, Flowise, Raycast, n8n, DrawDB, Langflow
- [x] 10 Commandments: 4px grid, 24px viewport padding, 36-44px hit areas, 20px+ icons, 14px default text
- [x] Global padding audit — tutti i componenti aggiornati
- [x] Bottoni: sm 36px → md 40px, Generate pill (rounded-full, px-6)
- [x] Icone: 14px → 20-24px ovunque (logo 22px, toolbar 20px, sidebar 24px)
- [x] Top bar: 48px → 56px altezza, px-6 padding
- [x] Canvas dots: piu visibili (size 1.5, gap 20, opacity 0.5)
- [x] Pass edges 3x piu spesse (4.5px vs 1.5px fail), colore verde piu acceso (#4ade80)
- [x] TemplateSelector: fixed positioning, left/right 24px, max-w 480px — non esce MAI dal viewport
- [x] Input espandibile: textarea overlay centrato (non inline)
- [x] Stats bar, floating toolbar, Dashboard, SimNode — padding aumentato ovunque

## Completato (sessione 2026-03-30 pomeriggio)

### Deterministic Simulation Engine
- [x] Eliminata TUTTA la randomness: proportional filtering, temperature 0, selezione deterministica edge/start
- [x] Particle animation: walking bounce, speed variation, fall-at-bottleneck
- [x] Speed tuning: move 1300ms, wait 500ms, launch 150ms

### UI & Display
- [x] Display mode toggle: Minimal/Classic nel hamburger menu settings
- [x] Stats bar redesign: v1-style con labels (people, made it, stopped, success rate)
- [x] Card sizing: 270px cards, 200px bottleneck (narrower = visual "tight passage")
- [x] Node spacing: dagre ranksep 250, nodesep 100
- [x] fitView maxZoom 0.85 per nodi leggibili

### Backtesting Fix
- [x] Formula fix: geometric mean invece di cascading multiplication

## Completato (sessione 2026-04-06/07 — MASSIVE)

### Tutte le fasi completate in 2 sessioni:
- [x] RAG: 209/210 file indicizzati, 314,175 rows (223K culturali), 100/100 scenari coperti
- [x] 9 API live (Eurostat, FRED, Numbeo, GEM, OECD, World Bank, CoinGecko, Exchange Rates, REST Countries)
- [x] Photo preprocessing: 25 categorie, 50+ cue terms
- [x] Conditional Engine: 15 industry baselines, 44 country modifiers con settori, node dependencies
- [x] Recursive Simulation: drill-down 3 livelli, breadcrumb
- [x] Profile: warnings (18 regole), sacred assessment (20 domande, 36 roots), dual probabilities
- [x] Data Pipeline: update-pipeline.ts (7 API), diff reports
- [x] Avatar: YOU particle (gold), AvatarReport (5 tab), what-if analysis
- [x] 3D: bloom, auto-orbit, 100 persone, 36 point clouds, fly-through, Sim3DToolbar
- [x] Sim Engine v2: SVG path following, simultaneous launch, speed variation
- [x] Backtesting: 50 casi, /backtest page, Brier 0.27
- [x] Community feedback: /community, reminder 30 giorni, flywheel
- [x] Multi-agent 1000: deterministic PRNG, segmentation, insights
- [x] API pubblica: /api/predict, rate limiting, /api-docs, SDK JS + Python
- [x] Reality Arbitrage: 35 opportunita, /arbitrage page
- [x] Execution Agent: /execute, 5 piani, platform links reali
- [x] Scaffold pages: marketplace, engines, government, realtime, twin, prescriptive
- [x] Functional pages: optimize, causality, generational, collective, explore hub
- [x] Refactor: generate/route.ts (6 file), templates.ts (3 file), SimulatorCanvas (650 righe, 5 hooks)
- [x] UI: 320px responsive, card design (bordi colorati, badge probabilita, sacred purple)
- [x] QA: 153 unit test, prompt audit + fix, RAG quality 9.7/10, coverage 100/100

## Completato (sessione 2026-04-08)

### Depth Variants (Summary / Analysis / Full Model)
- [x] Selettore 3 livelli nel TopBar (segmented control)
- [x] Prompt dinamico: node count basato su depth level
- [x] Upwork Money Tree: 3 varianti (Deep 34, Mid 13, Min 7 nodi)
- [x] Create an App: 3 varianti (Full 32, Mid 14, Min 7 nodi)
- [x] Template selector: sub-picker Summary/Analysis/Full Model al clic
- [x] Badge nodi rinominato: Summary/Analysis/Full Model

### Data Integrity & Source Tracking
- [x] Source labels: disclaimer "estimated by Foresight from public data — not an official source"
- [x] Campo `sourceUrl` aggiunto a TemplateNode — link cliccabile nel detail panel
- [x] Upwork templates: 54 nodi con sourceUrl (12 URL unici specifici per card)
- [x] Tutti i template: 329/409 nodi (80%) con sourceUrl reale
- [x] upwork-data.json: 196 campi URL, 86 URL unici (da 5 iniziali)
- [x] Anni aggiornati: tutte le fonti portate a 2025 dove disponibile
- [x] Probability matcher fix: non sovrascrive piu' prob specifiche dei template

### Step Mode & Detail Panel
- [x] Keyboard shortcuts: Space/Right = next, Left/Backspace = prev, Esc = exit
- [x] Node detail panel (clic su card in step mode): prob, range, desc, source con link, sacred roots con versetti, suggerimenti specifici
- [x] Source nascosta per nodi action/desire/trajectory (no dato statistico)
- [x] Source centrata nelle card

### Flowchart View (ELK.js)
- [x] FlowchartView.tsx: rendering SVG puro con ELK.js layout engine
- [x] Nodi semplificati: solo label + shape (rect/diamond/rounded) + prob badge
- [x] Frecce ortogonali con label pass/fail/yes/no
- [x] Zoom infinito + pan (SVG nativo, qualita' perfetta a qualsiasi zoom)
- [x] View selector: 2D / 3D / Flow (nel menu settings)
- [x] Step mode compatibile con Flow view
- [x] 17 repo flowchart/diagram salvati in deep-research.md (sezione 14)

### Simulation Engine Fixes (sessione 2026-04-08 pomeriggio)
- [x] Gate edge matching fix: `===` → `startsWith` per label tipo `'no (70-80%)'`
- [x] Math.floor → Math.round: evita 0 passers all'ultimo bottleneck con pochi arrivi
- [x] Fallback particelle: mai piu' particelle perse (7/100 missing → 0/100)
- [x] Fix applicato sia in precomputeFates (simulation-types.ts) che in runtime (useSimulation.ts)

### Anti-Hallucination System
- [x] Prompt rules: MAI decimali (79.6% → 80%), SEMPRE range, reality check vs base rates noti
- [x] Post-processing sanitizer: arrotonda prob al 5%, genera probRange se mancante
- [x] Label bottleneck DEVONO mostrare range: "Reach $1M ARR? (10-20%)" non "(79.6%)"

### Tavily Web Search Integration
- [x] `fetchWebSearch()` in data-fetcher.ts — cerca dati freschi 2025-2026 per ogni scenario
- [x] Iniettato come PRIORITA #1 nel prompt (sopra RAG, real-probs, industry baselines)
- [x] Sacred mode: NO Tavily (testi eterni). Normal mode: SI Tavily (dati cambiano)
- [x] API key: TAVILY_API_KEY in .env.local (free tier: 1000 searches/month)

### Live Mode
- [x] Simulazione infinita continua (wave dopo wave, mai si ferma)
- [x] Particelle finite scompaiono dopo fade delay (no memory leak)
- [x] Badge "LIVE" rosso pulsante nella RunningToolbar
- [x] LiveTimer in alto a destra: elapsed time + orario inizio
- [x] LiveInsights pannello destro: "RIGHT NOW IN THE WORLD" facts (Tavily + Haiku)
- [x] Simulation insights ogni 30s: survival rate, deadliest bottleneck, milestones
- [x] Real-time world facts: ticker rotante con dati al secondo/minuto (es. "1 startup fails every second")

### Template Istantaneo + Background Refresh
- [x] Template hardcoded carica a 0 secondi (no API call, anche con Sacred ON)
- [x] /api/refresh-probs: Tavily + Haiku aggiornano prob in background silenziosamente
- [x] Nessun "Building your simulation..." per template esistenti

### Template Unicorn Startup
- [x] 3 varianti: Summary (8 nodi), Analysis (16 nodi), Full Model (26 nodi)
- [x] Percorso: Founder → Seed (10-15%) → PMF (20%) → Series A (25-35%) → $10M ARR (25-40%) → $1B (5-10%)
- [x] Fonti: CB Insights, PitchBook, Startup Genome, Carta, Bessemer, Y Combinator
- [x] Key stat: ~0.07% delle startup funded diventano unicorni (~1,500 globali)

### Layout Fix
- [x] Dagre TB mode: usa altezza reale nodi (non 80px fisso) → no overlap

### In Corso / Prossimi Step
- [ ] Creare varianti Mid + Min per restanti 30 template business/richard/life
- [ ] Data Integrity System: freshness badge, source verification cron, auto-update agent
- [ ] Flowchart view: modalita' ritaglio (cut line orizzontale)
- [ ] 3D mode: debug caricamento

## Livello 90→100: Credibilita Assoluta

### Backtesting (+30% credibilita)
- [ ] Dataset scenari passati (startup fallite 2020-2024, CB Insights, Crunchbase)
- [ ] Simula scenari storici, confronta predizione vs realta
- [ ] Score di calibrazione: "il simulatore predice 14%, la realta era 15%"
- [ ] Pubblica risultati come prova di accuratezza

### Community Feedback Loop
- [ ] Utenti tornano dopo 6-12 mesi: "ce l'ho fatta" / "ho fallito"
- [ ] Il sistema impara dai risultati reali
- [ ] Flywheel: piu utenti = piu preciso = piu utenti

### Multi-Agent Simulation
- [ ] Non UNA persona, ma 1000 agenti con profili diversi
- [ ] Interazioni: competitor, mercato, timing, stagionalita
- [ ] Output: distribuzione risultati, non singolo percorso
- [ ] Da "simulatore" a "motore predittivo"

## Completato (sessione 2026-04-07)

### Rebrand: Simulator → Foresight
- [x] Nome progetto rinominato da "Simulator" a "Foresight" in tutto il branding visibile
- [x] package.json: simulator-v2 → foresight
- [x] Layout principale + 6 sub-route layouts (marketplace, prescriptive, twin, government, engines, realtime)
- [x] Landing page: nav, hero, how it works, comparison table, CTA, footer
- [x] TopBar: logo text + menu header + menu footer
- [x] 3D mode: loading, header, empty state
- [x] ScaffoldShell: nav links + brand
- [x] Community, Backtest, API docs, Marketplace, force3d, reagraph pages
- [x] Hydration error fix (stale .next cache con "350,000+" vs "400,000+")
- [x] Nomi interni (funzioni, classi, variabili) NON rinominati — solo branding utente-facing

### Depth Variants — 102 Template Variants (2026-04-08)
- [x] Creato 3 profondita (Summary 5-7, Analysis 10-14, Full Model 30-45) per TUTTI i 34 template
- [x] 10 agenti paralleli con web research per statistiche reali 2023-2026
- [x] 2 nuovi template: career_change (Cambiare carriera a 30+), buy_house (Comprare casa)
- [x] Totale: 34 template × 3 = 102 varianti, ~2,800+ nodi con fonti verificate
- [x] Fix pinch-to-zoom: browser zoom bloccato sul canvas ReactFlow

### Project Audit
- [x] Audit completo: 310K data points, 249 JSON files, 34 templates (102 varianti), 20+ pagine reali, 12 API routes, 9 node types
- [x] Supabase Pro upgrade ($25/mo) — 8 GB DB, no storage limits
- [x] Cultural data mega-download: 3.2M+ dp (Eurostat 3M, ILO 138K, WB 16K, UN 4K, REST Countries/CoinGecko 464)
- [x] Behavioral cultural data: 629+ dp (Indonesia 157, Italy 159, Australia 160, USA 153) — real 2024-2026 sources with URLs
- [x] 10 API pipeline scripts: worldbank-core6, worldbank-extra, worldbank-mega, eurostat-core, eurostat-retry, eurostat-extra, oecd, fred, un-data, ilo
- [x] Chunked embedding pipeline: embed-chunked.mjs (5-8 dp/chunk, 145K chunks in progress)

### API Pubblica
- [ ] "Qual e la probabilita di X?" come servizio
- [ ] Endpoint: POST /api/predict → { scenario, probability, confidence, sources }
- [ ] Pricing: freemium (5 sim/giorno) + pro ($29/mo)
- [ ] SDK per developer

## Livello 100+: Cambio di Categoria (Oracolo Predittivo)

### Prediction Marketplace
- [ ] Utenti scommettono sulle simulazioni (come Polymarket per decisioni di vita)
- [ ] Soldi veri = incentivo a calibrare il modello
- [ ] I risultati reali aggiornano le probabilita automaticamente

### 50 Industry-Specific Engines
- [ ] Engine cafe, SaaS, real estate, career change, crypto, freelance...
- [ ] Ognuno con dati iper-specifici e modelli causali diversi
- [ ] Da "generico buono" a "specifico eccellente"

### Governo / Istituzionale (B2G)
- [ ] "Se alziamo le tasse del 2%, quante PMI chiudono?"
- [ ] Simulazione policy con dati reali per paese
- [ ] Contratti governativi

### Real-Time Sensing
- [ ] Monitoraggio in tempo reale: se Bitcoin crolla del 40%, tutte le sim crypto si aggiornano
- [ ] Non snapshot settimanale — sistema nervoso continuo
- [ ] Event-driven updates

### Causal Graph Learning
- [ ] Il sistema SCOPRE relazioni causali dai dati che nessuno ha mappato
- [ ] "73% dei cafe vicino a universita sopravvive vs 12% in zona residenziale"
- [ ] Machine learning su risultati storici + community data

### Digital Twin Personale
- [ ] Ogni utente ha un "gemello digitale" della propria vita intera
- [ ] Non una simulazione alla volta — modello continuo: carriera, finanze, relazioni, salute
- [ ] Tutto connesso: "se cambio lavoro, come impatta le mie finanze tra 5 anni?"
- [ ] Il prodotto definitivo

## Livello Beyond: Reality Engine

### Prescriptive Engine
- [ ] Non "cosa succede" ma "cosa DEVI fare" — ottimizzazione automatica del percorso
- [ ] "Non aprire cafe — apri dark kitchen, 3.2x piu probabilita con il tuo profilo"

### Intervention Optimizer
- [ ] Testa 1000 variazioni: ads, hiring, location, timing — trova il path ottimale
- [ ] "Le 3 mosse che aumentano la tua probabilita dal 14% al 38%"

### Cross-Domain Causality
- [ ] Salute → carriera → finanze → relazioni connessi
- [ ] "Se dormi 5h/notte, la tua startup ha 40% meno probabilita"

### Generational Modeling
- [ ] "Se fai X oggi, come impatta i tuoi figli tra 20 anni?"
- [ ] Simulazione dinastica multi-generazionale

### Collective Simulation
- [ ] Simula intere citta/economie — "se 10K persone aprono cafe a Bandung, cosa succede?"
- [ ] Saturazione, supply/demand, emergent behavior

### Reality Arbitrage
- [ ] Trova gap tra percezione pubblica e realta predetta
- [ ] Il simulatore come hedge fund informativo

### Autonomous Execution Agent
- [ ] Il simulatore non dice cosa fare — LO FA. Apre conto, registra azienda, lancia ads.
- [ ] Dall'idea alla realta, zero friction. Il prodotto definitivo.

## Automazioni Attive

### Overnight Pipeline v2 — GAP-DRIVEN (attivo da 2026-03-30)
- **Strategia**: analizza 40K scenari JSONL → trova gap nei dati → Haiku colma i gap
- **Orario**: ogni notte alle 3:00 AM (launchd)
- **Pipeline A**: Gap Analysis — confronta 16 temi con dati esistenti, prioritizza
- **Pipeline B**: ~60 agenti Haiku (P1: tutti i subtopic, P2: 3/notte, P3: 1/notte)
- **Pipeline C**: Embed (512 dim) + upload Supabase RAG
- **Costo**: ~$0.30/notte (~$9/mese)
- **Output**: ~1500-2000 nuovi data points/notte, simulation-ready
- **Gap priority**: agency, content creator, e-commerce, fitness, relationship, skill learning
- **Target**: 1M+ data points totali (attuale: ~334K)
- **Report**: docs/nightly-reports/YYYY-MM-DD.md
- **Log**: /tmp/simulator-overnight.log
- **Complementare**: non è una fase — rafforza TUTTE le fasi continuamente

## Completato (sessione 2026-04-01)

### 36 Sacred Roots — Tassonomia Universale del Comportamento Umano
- [x] Ricerca esaustiva Bibbia (48 pattern estratti) + Corano (23 pattern estratti)
- [x] Merge e deduplica → **36 radici irriducibili** organizzate in 5 domini (god, self, others, resources, epistemic)
- [x] File `data/sacred-roots.json` con versi reali Bibbia + Corano, keywords, frasi esempio
- [x] 36 sacred roots indicizzate in Supabase RAG (embeddings 512 dim)
- [x] `matchSacredRoots()` integrato in `/api/generate` come Layer 0.5
- [x] Prompt aggiornato: pruning questions ora mappano ai 36 root IDs (non piu 10 categorie)
- [x] Ogni nodo generato include `sacredRoots` array con gli ID delle radici che determinano l'outcome

### Sacred Mode (generazione biblica)
- [x] Toggle "Sacred" nella tag bar — attivabile PRIMA della generazione
- [x] Quando attivo: nodi usano solo versetti sacri come contenuto (no McKinsey/BLS)
- [x] Backend: `sacredMode` flag inviato a `/api/generate`, modifica il prompt

### Multi-Modal Input (7 tipi)
- [x] **Audio/Voce**: registrazione live dal microfono (click start/stop) + upload file audio → Whisper → scenario
- [x] **Video**: estrae 3-5 frame + audio + metadata (GPS, data, durata) → Claude Vision + Whisper → scenario
- [x] **URL**: scrape pagina web → Claude analizza contenuto → scenario
- [x] **PDF**: Claude legge PDF nativamente → scenario
- [x] UI: Audio, Foto, Templates visibili — URL, PDF, Video dentro dropdown "Others"
- [x] Endpoint `/api/transcribe` (Whisper), `/api/analyze-video`, `/api/analyze-url`, `/api/analyze-pdf`

### Stop Generation
- [x] Pulsante "Stop" (rosso) sostituisce "Generate" durante la generazione
- [x] Tasto Esc per cancellare (AbortController)
- [x] Nota: l'API viene comunque consumata, ma la UI si libera subito

### UI Cleanup
- [x] Nodi intermedi (state, bottleneck, gate, decision, trajectory) ora neutri/bianchi
- [x] Solo outcome-good (verde) e outcome-bad (rosso) hanno colori forti
- [x] Context tags (Location, Budget, Timeline, Experience) spostati nel Profile → sezione "Context"
- [x] Tag bar semplificata: solo toggle Sacred

## Completato (sessione 2026-04-01 pomeriggio)

### Landing Page
- [x] Landing page su `/` con hero, emotional copy, search bar, problem/solution, how it works, features, data sources, comparison table, CTA
- [x] Simulator spostato su `/sim` (era su `/`)
- [x] Responsive, animated SVG hero graph, rotating placeholders

### Sacred Mode Fix
- [x] Sacred mode ora salta dati statistici (realProbs + kbContext) — output 100% sacro
- [x] Template in sacred mode chiamano `/api/generate` con `sacredMode: true` (non caricano dati statici)
- [x] Bottone Sacred spostato nella TopBar vicino a Generate (pill style, viola)

### Multi-Input
- [x] Tutti gli input (foto, audio, URL, PDF, video) ora si accumulano come attachment
- [x] Chip visivi sotto input bar con icona tipo, label, X per rimuovere, "Clear all"
- [x] Al Generate: testo + allegati combinati in un unico scenario arricchito

### Vertical Layout
- [x] Toggle "Vertical/Horizontal" in Settings (hamburger menu)
- [x] dagre rankdir switch LR/TB, persiste in localStorage

### 3D Force Graph Prototypes
- [x] Installato react-force-graph-3d/2d + reagraph + three
- [x] Prototipo `/ui/force3d` con card HTML (CSS2DRenderer), particelle, DAG top-down
- [x] Reagraph: incompatibile (conflitto Three.js) — scartato
- [x] Decisione: 3d-force-graph = #1 open source browser. Piano: React Flow (2D) + 3d-force-graph (3D) toggle

### Documentazione
- [x] `docs/stack.md` — guida completa stack web: 13 categorie, top 10 con prezzi, graph DB, classifiche per contesto, glossario
- [x] `docs/ui-references.md` — tutti i link demo (33 vasturiano + reagraph + vizceral + cosmograph + AntV + sigma + deck.gl)
- [x] `docs/competitor.md` — analisi ParallelLives.ai

## Completato (sessione 2026-04-01 sera)

### 3D Mode — Three.js Scene
- [x] Toggle "3D Mode" nel menu hamburger (Settings)
- [x] Scena Three.js con: sfere luminose per nodi, tubi 3D per edge, griglia a terra, fog
- [x] Card ologramma CSS2DRenderer (semi-trasparenti, glow, hover)
- [x] Personaggio 3D (capsule gialla + testa) con bob animation
- [x] "Walk through" — personaggio cammina lungo il grafo nodo per nodo
- [x] Camera: isometric (3/4 view) + follow mode (terza persona)
- [x] WASD per muovere camera, Spazio per pausa, +/- per velocita
- [x] Point cloud clessidra (SR-010 Patience/Sabr) — 800 particelle che si assemblano ai bottleneck
- [x] Toolbar condivisa: save, share, export, reverse, sacred, undo/redo (simulate/step/scissors nascosti in 3D)
- [x] Immagini/foto context node in 3D (texture su piano + bordo)
- [x] Camera limitata sopra la superficie (maxPolarAngle)

### Sacred Mode — Puro UI Toggle
- [x] Sacred toggle istantaneo (zero API call) — rivela/nasconde layer sacro
- [x] Sacred ON = solo versetti (legge sacra + Bibbia + Corano)
- [x] Sacred OFF = solo dati statistici (fonti, probabilita)
- [x] Collegato alle 36 Sacred Roots reali (non piu 10 versetti fissi per tipo)
- [x] Tutti i 340 nodi dei template hanno sacredRoots specifici per contenuto
- [x] SimNode legge `sacred-roots.json` e mostra versetti specifici per nodo

### Template Upgrade
- [x] 10 template aggiornati con fonti doppie + anno (CB Insights 2024 | Startup Genome 2024)
- [x] 340 nodi con sacredRoots mappati per contenuto (non per tipo)
- [x] Bottone Restart (refresh icon) accanto a Generate — reset istantaneo senza API call

### Decision Tree Layout (TB mode)
- [x] Edge smoothstep in verticale (linee ortogonali tipo flowchart)
- [x] Handle Top/Bottom per nodi in TB mode
- [x] Dagre centrato con spacing ottimizzato
- [x] Toggle Vertical ri-dispone il grafo esistente istantaneamente

## Completato (sessione 2026-04-07 sera)

### 5-Mode System (Palantir-inspired)
- [x] 5 modalita di analisi: Explore, Simulate, Personal, What-if, Stress Test
- [x] `sim-modes.ts` — tipi, config, persistence localStorage
- [x] `ModeSelector.tsx` — segmented control con sliding indicator (framer-motion), 2 gruppi (CREATE/ANALYZE)
- [x] `PersonalProfileInline.tsx` — 5 dimensioni psicologiche chip-based (zero domande aperte), valori inferiti automaticamente
- [x] TopBar integrato: mode strip, prompt condizionale, profilo inline in Personal mode
- [x] SimulatorCanvas: state management, Explore non auto-simula, Stress applica prob adverse, What-if snapshot originalProb
- [x] prompt-builder.ts: mode-aware (Explore = enciclopedico, Personal = profilo psicologico)
- [x] SimNode.tsx: delta badge (What-if), red pulse (Stress), dashed border (What-if editable)
- [x] SimToolbar.tsx: button label dinamici per mode, hide Simulate in Explore
- [x] SimOverlays.tsx: StressOverlay component (survival rate)
- [x] globals.css: stress-pulse animation, mode-specific styles
- [x] Ricerca competitor: Palantir (15 superfici), Bloomberg (4 pannelli), AnyLogic (3 paradigmi), Crystal Knows (DISC), Aaru, Stanford Generative Agents
- [x] Build: zero errori TypeScript, zero errori Next.js

### Ricerca: DNA Comportamentale (34 dimensioni)
- [x] Mappatura completa 20 dimensioni dai file ME. di Richard (Core Values, Purpose, Fear, Vision, Principles, Boundaries, Barrett Level, Order Thinking, Natural Role, Strengths, Weaknesses, Critical Patterns, Happiness Conditions, Shadow, 12 Dimensioni Maturita, Stress Test)
- [x] Identificate 14 dimensioni mancanti dalla scienza comportamentale (Attachment Style, Locus of Control, Risk Tolerance, Time Orientation, Conflict Style, Decision Style, Stress Response, Energy Pattern, Grit, Need for Cognition, Tolerance for Ambiguity, Self-Determination, Emotional Regulation, Core Beliefs)
- [x] Totale: 34 dimensioni = DNA comportamentale completo per simulazione personalizzata

---

## In Corso: Cultural Data Layer

### Fase 6: Cultural Behavioral Data — Indonesia, Australia, Italia, Singapore, Malaysia
- [ ] World Values Survey (WVS) — 5 paesi, ~50K data points
- [ ] Hofstede Cultural Dimensions + GLOBE — 5 paesi, ~5K data points
- [ ] OECD Time-Use Surveys — daily routines per eta/genere/regione, ~25K data points
- [ ] Pew Research Global — trust, religion, social norms, ~15K data points
- [ ] Government stats: BPS Indonesia, ABS Australia, ISTAT Italia, DOS Singapore, DOSM Malaysia — ~100K data points
- [ ] Edelman Trust Barometer — 5 paesi, ~8K data points
- [ ] GEM Entrepreneurship — 5 paesi, ~10K data points
- [ ] We Are Social / Digital — comportamento digitale, ~3K data points
- [ ] Numbeo / Expatistan — cost of living per citta, ~15K data points
- [ ] Consumer spending patterns — per income/citta/categoria, ~40K data points
- [ ] Business culture / etiquette — meeting style, negotiation, hierarchy, ~7.5K data points
- [ ] Family / marriage / religion rhythms — ~10K data points
- [ ] Regional sub-variations (province/regioni interne) — ~75K data points
- [ ] Embedding + upload Supabase pgvector
- **Target Fase 6: ~290K nuovi data points**

### Fase 7: Cultural Data — USA
- [ ] US Census + BLS + FRED detailed — per stato/contea, ~80K data points
- [ ] Consumer behavior per stato — spending, trust, digital, ~40K data points
- [ ] Cultural variations (Northeast vs South vs West vs Midwest) — ~30K data points
- [ ] Business regulations per stato — ~20K data points
- [ ] Immigration / visa / work patterns — ~15K data points
- [ ] Time-use + daily routines per demographics — ~15K data points
- **Target Fase 7: ~200K nuovi data points**

### Fase 8: Cultural Data — Europa (28 paesi EU + UK)
- [ ] Eurostat detailed — per paese/regione, ~500K data points
- [ ] European Values Study — 29 paesi, ~200K data points
- [ ] Per-country government stats (top 10 paesi: DE, FR, ES, NL, PT, PL, SE, CH, AT, IE) — ~500K data points
- [ ] Business culture per paese — ~145K data points
- [ ] Consumer behavior per paese — ~290K data points
- [ ] Regional sub-variations — ~100K data points
- **Target Fase 8: ~1.7M nuovi data points**

### Fase 9: Cross-Cultural Comparative Data
- [ ] WVS cross-cultural comparison tables — ~100K data points
- [ ] OECD Better Life Index — 38 paesi, ~50K data points
- [ ] Global Gender Gap Report — ~30K data points
- [ ] Transparency International — ~20K data points
- [ ] Migration flow data (UN, IOM) — ~50K data points
- [ ] Cross-border business patterns — ~50K data points
- **Target Fase 9: ~300K nuovi data points**

**Totale Fasi 6-9: ~2.5M nuovi data points**
**Totale progetto dopo Fasi 6-9: ~2.8M data points**
**Infrastruttura: Supabase Pro ($25/mo), retrieval ~200-300ms, zero cambio architettura**

---

## Prossima Sessione

Priorita:
- [ ] Simulazione 100 persone in 3D (wave system con precomputeFates)
- [ ] Bloom/glow post-processing (UnrealBloomPass)
- [ ] 35 point cloud aggiuntivi (cuore, albero, bilancia...) per le altre Sacred Roots
- [x] Sacred mode nel 3D — toggle funzionante (Simulator3D.tsx)
- [x] Sound design — Web Audio API (src/lib/sounds.ts: click, success, fail, whoosh)
- [ ] Fly-through mode completo (camera segue particella "YOU")

## Problemi da Risolvere
- [ ] AI prompt needs deeper flow generation — v1 produce lifecycle paths piu completi di v2
- [ ] Backtest full run pendente (250 casi)
- [ ] Import 62 data file di v1 nel RAG v2 (file presenti, serve verifica e indicizzazione)

## Completato (sessione 2026-03-31)

### Refactor SimulatorCanvas (-31%)
- [x] Split SimulatorCanvas.tsx da 2,443 → 1,677 righe
- [x] Estratti 5 moduli: graph-utils.ts, simulation-types.ts, SimOverlays.tsx, SimToolbar.tsx, usePathFilter.ts
- [x] Bottleneck shape: esagono (6 lati) → rombo/diamond (4 lati) come nel codex

## Backlog (feature secondarie)
- [ ] Confronto scenari A vs B — side-by-side dashboard
- [ ] Interactive sliders — muovi parametro, grafo si ricalcola live
- [ ] Fork tree counterfactual — "cosa sarebbe cambiato se..."
- [x] ~~Code decomposition — SimulatorCanvas 1200+ righe → moduli separati~~ (fatto 2026-03-31)
- [ ] Template editor visuale (drag & drop nodi)
- [ ] Landing page con social proof, counter simulazioni, embed demo
- [ ] Auth + DB utente (Supabase Auth)
- [ ] 10+ nuovi template per SEO
- [ ] OECD API, BLS API bulk
- [ ] Induismo/Buddismo a Layer 1
- [ ] G-Sim calibration loop
- [ ] Saved simulations (preferiti dalla History)

## Infrastruttura
- Repo: github.com/Richardkenne/simulator
- Deploy: v2-nine-jade.vercel.app
- Stack: Next.js 16 + React 19 + TypeScript + React Flow + Tailwind CSS + Framer Motion → Vercel
- AI: Claude Haiku 4.5 (primary) + OpenAI GPT-4o-mini (fallback) + Groq Llama 3.3 (fallback)
- Dati: 249 file JSON + 310K+ data points + 9 API live + 15K+ sacred patterns + 36 sacred roots + 3,260+ probabilita deep
- Input: 7 modalita (testo, audio/mic, foto, video, URL, PDF, template)
- Analisi: 5 modi (Explore, Simulate, Personal, What-if, Stress Test)
- UX: Framer Motion, Cmd+K palette, dark mode, toasts, skeletons, confetti, sound design, undo/redo
- Target: 2.8M data points (pipeline notturna + cultural data Fasi 6-9)
- Pipeline: RAG Supabase pgvector (66K+ rows, 512 dim, HNSW) + keyword matching (fallback)
- Supabase: progetto "Simulator" (rkkfwsmoqylctprzqhfj), ap-southeast-1, free tier
- Re-index: `npm run index-data`
- Local: localhost:3000
- v1: ~/Simulator/v1/ (HTML archive)
- v3: ~/Simulator/v3/ (research demos)

---

## Completato (sessione notturna 2026-04-07/08)

### Cultural Data Pipeline — Fase 6 (parziale)
- [x] 10 agenti ricerca: daily routines, spending, social norms, business culture, religion, digital, education, housing, food, trust (5 paesi × 10 categorie)
- [x] World Bank bulk: 29,506 indicatori × 20 paesi (script in background, 466K+ dp scaricati pre-filtro)
- [x] World Bank MEGA: 200 indicatori selezionati × 20 paesi × 2022-2024 (6,242 dp)
- [x] Eurostat: 15 dataset × 15 paesi EU (210 dp)
- [x] OECD + UN: Better Life Index, Labour Force, Education, Health, Time-Use, HDI (1,110 dp)
- [x] USA cultural data: work culture, consumer, social norms, regional, digital (159 dp)
- [x] Europa top 14: 25 metriche × 14 paesi (350 dp)
- [x] Regional variations: 5 paesi con sub-regioni (302 dp)
- [x] Quality filter: min year 2022, source required, no duplicati
- [x] OpenAI embedding (512 dim) + Supabase upload: ~80K embeddings uploadati
- [x] Enrichment Haiku script (scritto, rate limit da risolvere)
- [x] Cron locale + trigger remoto per continuazione automatica
- **Data points puliti (2022+): 86,507**
- **World Bank bulk completato: 646,001 dp scaricati (29,506 indicatori × 20 paesi)**
- **Embeddings su Supabase: ~220K** (88K esistenti + 80K round 1 + 51K round 2 + round 3 in corso)
- Ondata 2 ricerca: EU detail (DE, FR, ES, UK, NL, SE, PL, CH, BE, AT, NO, DK, IE, PT) + Indonesia deep + Cross-cultural 20 paesi
- Enrichment Haiku: script pronto ma bloccato da rate limit (10K output tokens/min) — serve upgrade piano Anthropic
- Quality filter attivo: min year 2022, source required, no duplicati, slow-update exceptions
- **Per raggiungere 2.5M**: serve enrichment Haiku (upgrade rate limit) + piu fonti API bulk (UN Data, WHO, UNESCO, ILO)

- Ondata 3 ricerca completata: EU detail (DE/FR/ES/UK 203dp, NL/SE/PL/CH 200dp, BE/AT/NO/DK/IE/PT 150dp), Indonesia deep (212dp), Cross-cultural 20 paesi (400dp)
- Embedding round 4 in corso: 92K dp → Supabase (upload con timeout intermittenti, ~50% success)
- **Supabase embeddings stimati: ~220-250K** (88K vecchi + 131K culturali uploadati)

*Ultimo aggiornamento: 2026-04-08 03:30*
