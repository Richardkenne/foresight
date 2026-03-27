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

## TODO Prossima Sessione
1. **Fork tree counterfactual** — "cosa sarebbe cambiato se..." (da NegotiationForge)
2. **Interactive sliders** — muovi parametro, grafo si ricalcola live (il "holy shit moment")
3. **Visual feedback nodi** — nodi pulsano/cambiano in base al valore computato
4. **Code decomposition** — SimulatorCanvas 850+ righe → moduli separati
5. **Vercel deploy** — settare root directory "v2"
6. **Share link** — URL con template encodato
7. **Export PNG**

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
- Dati: 69+ file JSON (46K+ dp) + 7 API live + 16K sacred patterns
- Local: localhost:3002
- v3: ~/Simulator/v3/ (research demos)
