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
- [ ] **OECD API** — da fare prossima sessione (API SDMX complessa)
- [ ] **BLS API** — da fare prossima sessione (unemployment, CPI, wages, productivity)
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

## In Corso — Day 1 (2026-03-30)

### RAG Full Re-Index (Task 1.1-1.3)
- [x] Audit: 46/113 file indicizzati, 67 mancanti, 9,511 rows
- [x] Schema ottimizzato: vector(1536) → vector(512) (98.6% qualità, 3x meno storage)
- [x] HNSW index (m=16, ef=64) sostituisce ivfflat
- [x] World Bank sampling: 50 → 200 entries per file
- [x] Full re-index completato: 49,557 rows, 87 file, 277 MB
- [ ] Re-run batch mancanti (~26 file con timeout) — domani
- [ ] Verifica: zero "Estimated" per top 100 scenari

### Problema "Estimated" nei nodi (in risoluzione)
- ~~RAG ha solo 9,511 rows (362 categorie, 626MB) — sotto-utilizzato~~
- ~~116 JSON locali non tutti indicizzati nel RAG~~
- Scenari da foto troppo descrittivi → keyword mismatch (da risolvere Day 2+)
- **Storage**: da 626MB → ~200MB stimati (512 dim, free tier safe)

## Prossimi Step — Piano Palantir-Level

### Fase 1 — Data Foundation (Day 1-8)
- [x] ~~Supabase Pro ($25/mo)~~ → ottimizzato con 512 dim, $0/mo
- [x] Schema migration: vector(512), HNSW index, search_embeddings updated
- [ ] Ingestion pipeline: indicizzare TUTTI i 113 JSON in RAG (da 9.5K a 50K+ rows) — IN CORSO
- [ ] Aggiungere 20+ API live (BLS per settore, Eurostat, World Bank granulare, real estate, education per paese)
- [ ] Pre-processing scenari foto: estrarre keyword business, rimuovere descrizioni visive
- [ ] Obiettivo: zero "Estimated" per i top 100 scenari

### Fase 2 — Recursive Simulation
- [ ] Ogni nodo cliccabile → apre sub-simulazione di quel singolo step
- [ ] Drill-down infinito: "Open cafe → Find location" → affitto per zona, traffico, competitor
- [ ] Simulazione a profondita illimitata

### Fase 3 — Profilo Utente
- [ ] Profilo completo: eta, paese, capitale, skills, esperienza, network
- [ ] Ogni simulazione calibrata sull'utente, non su medie generiche
- [ ] "Per un 29enne italiano a Bandung con $5K e zero esperienza F&B, probabilita = X%"

### Fase 4 — Data Pipeline Automatico
- [ ] Cron job settimanale: aggiorna dati da tutte le API
- [ ] Scraping automatico report annuali (CB Insights, Statista, World Bank)
- [ ] Sistema che diventa piu intelligente ogni settimana

### Fase 1B — Conditional Engine (+35% credibilita)
- [ ] P(nodo) = f(business_model, location, budget, timeline) — non costante
- [ ] 3+ business-model engines separati (SaaS, Service, F&B, Marketplace, Content)
- [ ] Ogni engine ha probabilita specifiche per industry/country
- [ ] Range output: base case / optimistic / adverse (es. 8-18%, non solo 14%)
- [ ] Burn/time modeling: runway che scende, morte per cash/time mismatch

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
- [ ] Sacred mode nel 3D (card ologramma mostrano versetti)
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
- Dati: 179 file JSON + 374K+ data points + 7 API live + 15K+ sacred patterns + 36 sacred roots + 3,260+ probabilita deep
- Input: 7 modalita (testo, audio/mic, foto, video, URL, PDF, template)
- UX: Framer Motion, Cmd+K palette, dark mode, toasts, skeletons, confetti, sound design, undo/redo
- Target: 1M+ data points (pipeline notturna + bulk sessions)
- Pipeline: RAG Supabase pgvector (66K+ rows, 512 dim, HNSW) + keyword matching (fallback)
- Supabase: progetto "Simulator" (rkkfwsmoqylctprzqhfj), ap-southeast-1, free tier
- Re-index: `npm run index-data`
- Local: localhost:3000
- v1: ~/Simulator/v1/ (HTML archive)
- v3: ~/Simulator/v3/ (research demos)

---

*Ultimo aggiornamento: 2026-04-01*
