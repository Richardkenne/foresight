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

### Infrastruttura
- [x] Repo: github.com/Richardkenne/simulator
- [x] Struttura: ~/Simulator/v1 (archive) + ~/Simulator/v2 (attivo)

## TODO Prossima Sessione
1. Vercel: settare root directory "v2" in Settings → General
2. Dataset: 17 file sotto 1000 dp (archetypes, master-funnels, sacred-texts, nonprofit)
3. Code decomposition (SimulatorCanvas 793 → ~250 righe)
4. Share link
5. Export PNG

## Backlog
- Template editor, embed widget, landing page
- Auth + DB (Supabase)
- 10+ nuovi template per SEO
- Responsive mobile 320px
- OECD API

## Stack
- Next.js 16 + React Flow + Tailwind → Vercel
- Claude Haiku 4.5 + Groq fallback
- 67 file JSON/MD + 7 API live (gratuite)
- github.com/Richardkenne/simulator
- Local: localhost:3002
