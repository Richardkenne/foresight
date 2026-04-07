# Simulator v2 — ROADMAP

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

## Completato (sessione 2026-04-07 — Cultural Data Pipeline)

### Cultural Data Layer (Foresight v2 — obiettivo 2.5M dp)
- [x] **data/cultural/** — nuova directory dati culturali (separata da dati economici)
- [x] **20 paesi** coperti: IDN, AUS, ITA, SGP, MYS, USA, DEU, FRA, GBR, ESP, NLD, CHE, SWE, POL, BEL, AUT, NOR, DNK, IRL, PRT
- [x] **11 categorie** per paese: daily_routines, spending, social_norms, business_culture, religion, digital_behavior, education, housing, food_lifestyle, trust_governance, regional_variations
- [x] **2,542 data points** culturali (post-filtro qualità), tutti 2022-2025
- [x] **Fonti reali**: Hofstede Insights, Pew Research, Eurobarometer, OECD Better Life, World Values Survey, DataReportal, national stats (CBS, SCB, GUS, BFS, INE, Statbel, etc.), Transparency International, RSF
- [x] **scripts/worldbank-bulk.mjs** — bulk downloader 30 indicatori WB per 20 paesi (log: /tmp/worldbank-bulk.log)
- [x] **scripts/filter-quality.mjs** — rimuove data points year < 2022 da data/cultural/ (rimosse 9 entry pre-2022)
- [x] **scripts/enrich-cultural-data.mjs** — arricchisce con Claude Haiku le categorie mancanti (richiede ANTHROPIC_API_KEY in .env.local)
- Conteggio totale progetto: ~374K esistente + 2,542 culturali = **~377K data points**
- Target: **2.5M data points** (pipeline notturna + bulk sessions + cultural layer in espansione)

### Highlights per paese
- **IDN**: Ramadan/jam karet/gotong royong, Aceh Sharia, TikTok 2nd market
- **SGP**: Kiasu culture, PayNow cashless, PISA math rank 2nd, HDB 78.7%
- **MYS**: Hofstede PDI 100 (world highest), Bumiputera policy, Kelantan Sharia
- **NLD**: Fietscultuur (0.9 trip/day), Polder model, LGBTQ+ 1st country 2001, 29% social housing
- **CHE**: Highest private wealth/capita ($685K), direct democracy 4 referenda/year, 66% vocational
- **SWE**: Jantelagen, Allemansrätten, Swish 82%, Systembolaget monopoly, Spotify/Klarna unicorns
- **POL**: 88% homeownership, BLIK 16M users, Witcher/Cyberpunk gaming hub, 74% voter turnout 2023
- **BEL**: 541-day govt record, Brussels 32% expat, Antwerp 85% world diamonds, compulsory voting 88%
- **PRT**: Saudade, uncertainty avoidance 99 (W.Europe highest), 1B pastel de nata/yr, 189 Mbps broadband
- **NOR**: Jante Law, Friluftsliv, Oil Fund, highest petrol tax

## Completato (sessione 2026-04-06/07 — MASSIVE)

### Tutte le fasi completate in 2 sessioni:
- [x] RAG: 209/210 file indicizzati, 88,650 rows, 100/100 scenari coperti
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
- Dati: 179 file JSON + 374K+ data points + 20 cultural JSON (2,542 dp) + 7 API live + 15K+ sacred patterns + 36 sacred roots + 3,260+ probabilita deep
- Input: 7 modalita (testo, audio/mic, foto, video, URL, PDF, template)
- UX: Framer Motion, Cmd+K palette, dark mode, toasts, skeletons, confetti, sound design, undo/redo
- Target: **2.5M data points** (pipeline notturna + bulk sessions + cultural layer)
- Pipeline: RAG Supabase pgvector (66K+ rows, 512 dim, HNSW) + keyword matching (fallback)
- Supabase: progetto "Simulator" (rkkfwsmoqylctprzqhfj), ap-southeast-1, free tier
- Re-index: `npm run index-data`
- Local: localhost:3000
- v1: ~/Simulator/v1/ (HTML archive)
- v3: ~/Simulator/v3/ (research demos)

---

*Ultimo aggiornamento: 2026-04-07 (cultural pipeline)*
