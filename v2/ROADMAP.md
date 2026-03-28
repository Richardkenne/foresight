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
- [x] 56,000+ data points across 67 file (50+ a 1000+ dp)
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
- [x] **Tech/AI Deep Probabilities** — 236 data points, 21 sezioni (automation risk by sector, AI adoption, coding productivity, AI accuracy, AI startup success, developer jobs AI impact, prompt engineering, bootcamp placement, salary progression, tech layoffs, remote vs office salary, freelance dev, open source career, app store success, mobile retention, SaaS benchmarks, Product Hunt/indie hacker, conversion rates, crypto trading, NFT/DeFi, cybersecurity). Sources: McKinsey, Goldman Sachs, Gartner, GitHub, BLS, Verizon DBIR, ProfitWell, Chainalysis, Stanford AI Index, IBM/Ponemon.
- [x] **Fame/Entertainment/Sports** — 187 data points, 23 sezioni: pro sports going-pro (NCAA), career length, injury rates, Olympics, prize money (tennis/UFC/esports), youth dropout, acting (SAG-AFTRA), music industry, touring, YouTube/TikTok/Instagram/Twitch, podcasting, writing/publishing, film, comedy, viral content, Patreon, esports, creative careers. 18+ fonti.
- [x] **Career Probabilities Deep** — 346 data points, 23 sezioni: top 50 occupations (employment/salary/growth/automation risk), 20 high-growth + 15 declining occupations, 40 automation risk scores (Frey-Osborne), wages by 23 groups, education-earnings, career transitions by age/industry/generation/race, freelance vs employee, remote work by 17 occupation types, underemployment by 20 majors, first job by 15 fields, salary progression, sector projections, entrepreneurship, life events impact. 12 fonti (BLS OEWS 2024, BLS OOH 2024-2034, O*NET, Frey-Osborne Oxford, Pew Research, NY Fed, Zippia, NovoResume, High5Test, WEF, Upwork, Kauffman).
- [x] **Psychology & Habits Probabilities** — 247 data points, 6 sezioni (habits/behavior change, mental health, productivity/performance, personal growth, social dynamics). Includes: New Year's resolutions, habit formation (Lally 66 days), habit retention gym/meditation/journaling, therapy completion, self-help implementation, cold turkey vs gradual, accountability effect, depression/anxiety/PTSD treatment, burnout by profession, impostor syndrome, loneliness by age/country, suicide global, addiction recovery by substance, deep work, multitasking loss, meetings waste, procrastination, morning routine, sleep deprivation, exercise cognition, career change by age, midlife/quarter-life crisis, retirement satisfaction, volunteering impact, travel/personality, reading by country, financial literacy, Dunbar's number, weak ties, mentorship career impact, social media mental health, trust by country (16 countries), cooperation rates. 18+ sources (APA, WHO, NIH/NIDA, SAMHSA, Gallup, Pew, World Values Survey, UCL, PMC/PubMed, IHRSA, FINRA).
- Totale progetto: ~350K data points (obiettivo 500K+)

### Deep Research
- [x] 130+ repo analizzati in 12 categorie — docs/deep-research.md
- [x] v3 folder con 6 research demos (loopy, trust, simulating, ballot, covid, crowds)
- [x] Competitor analysis: nessuno fa "visual node-based life simulator con LLM + sacred foundation"
- [x] NegotiationForge analizzato — fork tree counterfactual da implementare in futuro

### Truth Matrix — 3 Layer Architecture
- [x] **Layer 0: Sacred Texts (Bible + Quran)**
  - 16,095 sacred patterns (da 250 iniziali)
  - 7 batch paralleli: business (4,575), finance (9,960), career (111), marketing (10), health (10), life (10), remaining (161)
  - Expanded: 210 pattern raffinati
  - Ogni dato comportamentale mappato a versetto Bibbia + Corano
  - Sacred Mode UI: toggle button nella TopBar, mostra versetti sui nodi
- [x] **Layer 1: Human Nature (Science + Ancient Wisdom)**
  - Choices13k: 13K decisioni umane empiriche
  - Mesa ABM: 25 modelli comportamentali con parametri esatti
  - Life Event Probabilities: 11 categorie per eta (SSA, CDC, Census)
  - Game Theory: 247 datapoint sperimentali (cooperazione, fiducia, competizione)
  - cFIREsim: comportamento finanziario storico 1871-oggi
  - Framework: Maslow, Kahneman, Murray, Cialdini, Dunning-Kruger
  - Ancient Wisdom: Gita, Dhammapada, Confucius, Stoics (Layer 1, non Layer 0)
- [x] **Layer 2: Modern Data**
  - 106 real probabilities da BLS, CDC, Census, Fed, USCIS
  - 46,325 data entries across 69 JSON files
  - Probability Matcher: collega dati reali ai nodi automaticamente
  - Sacred Index: 5,774 pattern indicizzati per keyword lookup

### Engine & Integration
- [x] Dataflow engine (src/lib/dataflow-engine.ts) — cascading computation
- [x] Sacred rules come modifier nel engine — 10 leggi fondamentali
- [x] Probability matcher (src/lib/probability-matcher.ts) — 60+ real probs
- [x] Speed slider nella stats bar (6 livelli: 1x-8x)
- [x] Signal delta propagation (Loopy-style)
- [x] Sacred patterns iniettati nel prompt Claude (Layer 0 → AI)
- [x] Real probabilities iniettate nel prompt Claude (Layer 2 → AI)
- [x] Simulazione testata: 100 persone, dati reali, 10% success rate (BLS/SBA)

### Documentation
- [x] docs/architecture.md — Truth Matrix + system diagram + data flow
- [x] docs/project-context.md — visione narrativa
- [x] docs/plan.md — piano 4 fasi
- [x] docs/competitor.md — gap analysis
- [x] docs/data.md — tutte le fonti dati
- [x] docs/deep-research.md — 130+ repo analizzati

### Deep Country Research (sessione 2026-03-28)
- [x] **583 data points** across 20 countries + 15 cities → `country-probabilities-deep.json`
- [x] 20 paesi con 24 dp ciascuno: salary (overall + tech/food/marketing/freelance), CoL, rent, startup costs (cafe/online/agency), survival rates, unemployment, job search, min wage, internet, ease of business, entrepreneurship, savings, gig economy, remote work
- [x] 15 citta con 6 dp ciascuna: CoL index, rent, monthly cost, 1BR rent, cafe startup, coworking
- [x] Fonti: Numbeo 2026, World Bank, OECD, ILO, GEM 2024/2025, BLS, Upwork, ITU, national offices

### Data Pipeline Fix (sessione 2026-03-28 pomeriggio)
- [x] **Diagnosi**: 0 data points nelle risposte API nonostante 85MB di dati — 3 cause trovate
- [x] **Causa 1 — File mancanti**: `personal-finance-data.json` (63 entries), `immigration-relocation-research.json` (68 entries), `marketing-growth-data.json` creati
- [x] **Causa 2 — 22 file non estraibili**: BLS (list), WorldBank (list), health-fitness (nested dict) cadevano nel fallback `JSON.stringify().substring(0,2000)` = garbage. Scritti 2 nuovi extractors universali: `extractFromList()` + `extractFromNestedDict()`
- [x] **Causa 3 — Keyword gaps**: aggiunte 40+ keyword italiane mancanti (guadagn, costruisci, amico, prestito, perdi peso, skill, impara, networking, copywriting, etc.)
- [x] **Risultato**: copertura scenari da 82% → 97.7%, data points per risposta da 0 → 8-11
- [x] **Test**: 40K scenari batch testati, 3 scenari API verificati con data points reali

### Business Survival Probabilities Dataset
- [x] **business-survival-probabilities.json** — 221 data points from 15 sources (SBA, BLS BDM, CB Insights, Failory, Kauffman, Startup Genome, GEM, ChartMogul, Bankrate, Crunchbase, MBO Partners, Datassential, McKinsey, Harvard Business School, DemandSage)
- [x] 14 sezioni: survival by year, by industry, failure reasons, startup success by type, entrepreneurship by country, revenue milestones, funding success rates, cafe/restaurant, ecommerce, SaaS, agency/SMMA, freelance, content creator, side hustle

### RAG Vector Search (COMPLETATO)
- [x] Supabase progetto "Simulator" creato (ap-southeast-1, gratis)
- [x] pgvector + HNSW index + `search_embeddings` function
- [x] `scripts/index-data.ts` — chunking + OpenAI text-embedding-3-small → Supabase
- [x] `src/lib/rag.ts` — Supabase vector search, top 30 results
- [x] Integrato in `route.ts` — RAG primario, keyword matching fallback
- [x] **50,000 entries da 84+ file** indicizzate su Supabase pgvector
- [x] 18 file con 0 chunks fixati (chunker migliorato per 3 strutture dati)
- [x] 5 test API passati — tutti `_data_source: rag`
- [x] `npm run index-data` aggiunto per re-indicizzazione facile
- [x] Fix Claude Haiku parsing (JSON extraction da testo wrappato)
- [x] Logging fallback Claude → Groq per debug

### Massive Probability Data Collection
- [x] 11 agenti paralleli, 3,260+ nuovi data points di probabilità
- [x] Coperture: business survival, career, country (20 paesi), crime/justice, education, fame/entertainment, health/fitness/relationships, psychology/habits, tech/AI, OpenLife repo, Life-Simulator1 repo
- [x] 50+ fonti istituzionali (BLS, SBA, FBI, WHO, APA, NCAA, Gartner, McKinsey, etc.)
- [x] Tutti i file collegati al keyword system (114 file, 0 orfani)

### GitHub Dataset Research
- [x] 13 repo analizzati per probabilità/statistiche
- [x] Top 3: owid/owid-datasets (200+ dataset), fivethirtyeight/data (120+), actuarial-data-science
- [x] Decisione: NON scaricare — dati pre-2022, i nostri 2023-2025 sono più freschi

### UX Fixes (sessione 2026-03-28 sera)
- [x] Reverse simulation riscritto — BFS forward → reverse order, nodi dx→sx
- [x] Dashboard trasformato da overlay a pannello inline fisso (TradingView style)
- [x] Particelle persistono dopo simulazione (non vengono cancellate)
- [x] Stats bar spacing migliorato (gap e padding aumentati)
- [x] Save/Share/Export PNG bottoni aggiunti nella TopBar
- [x] Pagina /sim/[id] per simulazioni condivise
- [x] Vercel env vars settate (5/5: SUPABASE, OPENAI, ANTHROPIC, GROQ)
- [x] Mobile responsive (viewport meta, breakpoint 480px, Dashboard responsive)
- [x] Pushed to Vercel

## Completato (sessione 2026-03-28 notte / 2026-03-29)

### Animazione Fail Marcata
- [x] Particelle che falliscono "cadono nel vuoto" — keyframes fallDown (80px, rotazione 35deg, grayscale, scale 0.45)
- [x] Restano a terra visibili (opacity 0.3) — non spariscono
- [x] Nodi outcome-bad con outline rosso, outcome-good con outline verde

### Replay Mode (TradingView Bar Replay-style)
- [x] Bottone forbici nella toolbar — attiva replay mode
- [x] Click su un nodo → tutto ciò a destra sparisce (BFS downstream)
- [x] Linea di taglio rossa tratteggiata con icona forbici
- [x] Nodo tagliato evidenziato con outline rosso
- [x] Replay lancia simulazione dal nodo tagliato con il numero ESATTO di persone che lo avevano raggiunto
- [x] Replay bar in basso mostra: nome nodo + reach count + bottone Replay + Exit
- [x] Wave/perWave calcolati dal reach count (non sempre 100)
- [x] Integrazione con pause/resume/speed esistenti

### Enterprise UI Redesign (Tersa-inspired)
- [x] **Font Geist** — Geist Sans + Geist Mono (come Vercel/Tersa)
- [x] **Palette ridotta** — 3 colori: grigio (neutro), verde (success), rosso (fail). Nodi differenziati per icona, non colore
- [x] **Nodi flat** — no ombre, outline 1px, radius 16px, type label monospace sopra (BOTTLENECK, DECISION...), footer mono
- [x] **Edges animate** — custom edge component con dot verde animato su pass/yes (2.5s loop), fail tratteggiato
- [x] **TopBar minimal** — 48px, solo Logo + Input + Templates + Generate
- [x] **Floating toolbar pill** — bottom-right, rounded-full: Play, Reverse, Scissors, Sacred, Save, Share, Export, Clear
- [x] **Toolbar durante sim** — Pause/Resume + Stop in pill separata
- [x] **Stats bar light theme** — sfondo surface, colori tema, font mono, rounded-full
- [x] **Handles nascosti** — appaiono solo su hover del nodo
- [x] **Scrollbar thin** — custom scrollbar globale
- [x] **Focus states** — outline accent su tutti gli elementi interattivi

## TODO Prossima Sessione
1. **Input condizionali pre-simulazione** — 3-4 domande rapide che adattano le probabilità (bootstrapped/funded, solo/team, etc.)
2. **Confronto scenari A vs B** — side-by-side dashboard
3. **Interactive sliders** — muovi parametro, grafo si ricalcola live
4. **Fork tree counterfactual** — "cosa sarebbe cambiato se..."
5. **Code decomposition** — SimulatorCanvas 1200+ righe → moduli separati
6. **Landing page** — social proof, counter simulazioni, embed demo

## Backlog
- Template editor visuale (drag & drop nodi)
- Embed widget per siti terzi
- Landing page
- Auth + DB (Supabase)
- 10+ nuovi template per SEO
- Responsive mobile 320px
- OECD API
- Induismo/Buddismo a Layer 1 (Gita, Dhammapada come conferma)
- G-Sim calibration loop (LLM genera → dati calibrano → risultato affidabile)

## Infrastruttura
- Repo: github.com/Richardkenne/simulator
- Stack: Next.js 16 + React Flow + Tailwind → Vercel
- AI: Claude Haiku 4.5 + Groq fallback
- Dati: 114 file JSON (~86MB) + 7 API live + 16K sacred patterns + 3,260+ probabilità deep
- Pipeline: RAG Supabase pgvector (primario) + keyword matching (fallback)
- RAG: 50,000 entries da 84+ file, OpenAI text-embedding-3-small, HNSW index, ~$0.0001/query
- Supabase: progetto "Simulator" (rkkfwsmoqylctprzqhfj), ap-southeast-1
- Re-index: `npm run index-data`
- Local: localhost:3002
- v3: ~/Simulator/v3/ (research demos)
