# Foresight — ROADMAP

## In Corso (sessione 2026-05-28) — Cultural Data Pipeline v2

### Data Pipeline — Obiettivo 2.5M data points
- [x] **Conteggio baseline**: 6,056 dp attivi in data/cultural/ (143 file con dataPoints)
- [x] **Nota symlink**: 29 directory in data/cultural/ sono symlink verso iCloud Drive (non disponibili nel cloud container) — contengono bulk World Bank, Eurostat, WHO, ILO, UN, OECD, Restcountries, CoinGecko, FRED scaricati in sessioni precedenti
- [x] **worldbank-bulk.mjs**: rilanciato — 0 indicator per paese (World Bank API bloccata dal network allowlist del cloud container)
- [x] **filter-quality.mjs**: eseguito — 0 dp rimossi (tutti i dati sono già >= 2022)
- [x] **generate-cultural-bulk.mjs**: eseguito — +992 dp (20 paesi × ~50 dp/paese, dati offline Hofstede/OECD BLI/Pew)
- [x] **Agenti ricerca paralleli completati**: 20 paesi, 8,058 dp nuovi (IDN/AUS/SGP/MYS, ITA/ESP/PRT/FRA, DEU/AUT/CHE/NLD, GBR/IRL/NOR/DNK/SWE, USA/POL/BEL)
- [x] **Conteggio finale sessione**: 14,114 dp totali in data/cultural/ (175 file)
- [ ] **enrich-cultural-data.mjs**: richiede ANTHROPIC_API_KEY in .env.local — da eseguire quando disponibile
- [ ] **cross-cultural-synthesis-2025.json**: agente in corso

### Blockers identificati
- World Bank API (api.worldbank.org) non in allowlist network del cloud container
- ANTHROPIC_API_KEY non presente in .env.local per questa sessione cloud
- 29 directory symlink (iCloud Drive macOS) non accessibili nel cloud container
- git push via HTTP: 503 dal proxy locale (payload troppo grande, 166 file, ~34K inserzioni)

### Prossimi passi
- [ ] Aggiungere ANTHROPIC_API_KEY a .env.local → eseguire enrich-cultural-data.mjs
- [ ] Sync iCloud → riporta bulk data (WHO 79K, IMF 31K, WB 247K, Eurostat 3M) nella repo
- [ ] Eseguire worldbank-bulk.mjs da Mac con accesso internet
- [ ] Embedding nuovi file in Supabase pgvector

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

## Completato (sessione 2026-04-08/09 — BEAST MODE)
- [x] **+269,887 nuovi data points** — da 3.2M a 3.47M totali
- [x] **API bulk**: WB All Countries 123K (92 indicatori × 217 paesi), WHO GHO 79K (160+ indicatori), IMF WEO 31K, WB Expanded 18K (63 nuovi paesi)
- [x] **Ricerca Round 1** (22 file): Religion, Creator Economics, AI/Remote, Vocational, Addiction, Dating, Longevity, Cost of Living, Food, Crime, Digital, Mental Health, Energy, Transport, Sports, Housing, Healthcare, Migration, Geopolitics, Startup/VC, Education — 11K DP
- [x] **Ricerca Round 2** (10 file): Freelancing/Upwork, Personal Finance Lifecycle, Habits/Productivity, Parenting, Career Transitions, Small Business, Wealth Building, Indonesia Life, Relationship Psychology, AI Tools — 5.3K DP
- [x] **Ricerca Round 3** (5 file): Negotiation/Sales, Aging/Retirement, Immigration/Visa, Crypto/Trading, Legal/Tax — 2.1K DP
- [x] **15 nuovi download script** pronti per future sessioni
- [x] **Storage optimization**: dati pesanti su iCloud Drive con symlink (1.7G → 29M locale)

## Completato (sessione 2026-04-09 — DESIGN SYSTEM)
- [x] **Token System**: 85+ CSS variables in globals.css + design-tokens.ts
- [x] **8 Primitives**: Button, Badge, Card, Text, IconButton, Spinner, Skeleton, Toast
- [x] **Full project migration**: 816 hardcoded values reduced to 223 (residual SVG/WebGL only)
- [x] **4px spacing grid enforcement**: 52 violations fixed across 43 files
- [x] **5 compositions migrated**: Dashboard, SimToolbar, TopBar, TemplateSelector, Sidebar
- [x] **Brand visual assets**: logo mark SVG, full logo (light+dark), OG image 1200x630, apple touch icon 180x180

### In Corso / Prossimi Step
- [ ] **Design System Layer 4**: Layout System (page grid, breakpoints, containers)
- [ ] **Design System Layer 5**: Interaction System (hover/focus/active/disabled states, animation tokens)
- [ ] **5 agenti mancanti** Round 3: Entrepreneurship Psychology, Faith/Religion Outcomes, Content Monetization, Social Skills/Networking, Fitness/Health Science
- [ ] **Embedding** tutti i nuovi file in Supabase pgvector (~270K DP → ~45K chunks)
- [ ] Data Integrity System: freshness badge, source verification cron, auto-update agent

## Livello 90→100: Credibilita Assoluta

### API Pubblica
- [ ] "Qual e la probabilita di X?" come servizio
- [ ] Endpoint: POST /api/predict → { scenario, probability, confidence, sources }
- [ ] Pricing: freemium (5 sim/giorno) + pro ($29/mo)

## Livello 100+: Cambio di Categoria (Oracolo Predittivo)

### Prediction Marketplace
- [ ] Utenti scommettono sulle simulazioni (come Polymarket per decisioni di vita)

### Digital Twin Personale
- [ ] Ogni utente ha un "gemello digitale" della propria vita intera

## Livello Beyond: Reality Engine

### Prescriptive Engine
- [ ] Non "cosa succede" ma "cosa DEVI fare" — ottimizzazione automatica del percorso

## Infrastruttura
- Repo: github.com/Richardkenne/simulator
- Deploy: v2-nine-jade.vercel.app
- Stack: Next.js 16 + React 19 + TypeScript + React Flow + Tailwind CSS + Framer Motion → Vercel
- AI: Claude Haiku 4.5 (primary) + OpenAI GPT-4o-mini (fallback) + Groq Llama 3.3 (fallback)
- Dati: ~1,200+ file JSON + 3.47M+ data points + 9 API live + 15K+ sacred patterns + 36 sacred roots
- Storage: dati pesanti su iCloud Drive (symlink), locale 29M, iCloud ~1.7G
- Cultural data locale (2026-05-28): 14,114 dp in 175 file (symlink iCloud esclusi)
- Target: 2.5M cultural data points (serve sync iCloud + enrich pipeline)
