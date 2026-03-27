# Simulator v2 — ROADMAP

## Completato (sessione 2026-03-27)
- [x] v1 archiviata, v2 promossa come principale
- [x] Reveal sequenziale — nodi appaiono quando particelle arrivano
- [x] Edge hidden durante simulazione (no label fantasma)
- [x] Template "money" riscritto (Sell What People Want)
- [x] Template "startup" fixato — ogni step ha fail path
- [x] Zero emoji — tutto Lucide SVG icons
- [x] Keyword matching italiano (template + KB)
- [x] TopBar redesign — singola barra 56px, frosted glass, logo SVG
- [x] Button component con 6 varianti + Spinner
- [x] Design tokens: --accent, --danger, --warning, --success, --purple
- [x] Dashboard pannello laterale dx, label non troncate, accent line
- [x] Favicon SVG custom, metadata OG
- [x] Stats bar dark glassmorphic con wave progress
- [x] Fix reverse simulation (edgesRef race condition)
- [x] Particelle persistenti dopo sim
- [x] Prompt AI migliorato: "Estimated" se no fonte, copertura completa, fail obbligatori
- [x] API live: REST Countries + Exchange Rates + World Bank
- [ ] Dataset expansion: 72 file → 1000+ dp ciascuno (in corso)

## In Corso
- Dataset expansion batch 1: master-funnels, youtube-guru, archetypes, nonprofit
- Dataset expansion batch 2: historical, prediction-markets, immigration, sacred-texts
- Dataset expansion batch 3: addiction, relationships, education, personal-finance
- Dataset expansion batch 4: tech, marketing, health-fitness, indonesia

## Prossimi Step (priorità)
1. **Dataset expansion round 2** — file da 500-700 dp → 1000+
2. **Code decomposition** — SimulatorCanvas.tsx da 793 → ~250 righe
   - src/lib/simulation.ts (funzioni pure)
   - src/hooks/useSimulation.ts (custom hook)
   - src/components/SimStatsBar.tsx, EmptyState.tsx, GeneratingOverlay.tsx
3. **Template editor** — UI per creare/modificare template custom
4. **Share link** — URL unico per ogni simulazione
5. **Export** — PNG, GIF animato per social
6. **Auth + DB** — Supabase per salvare simulazioni utente
7. **Responsive mobile** — ottimizzare per 320px-768px
8. **OECD API** — dati immigrazione/educazione per paese

## Infrastruttura
- Frontend: Next.js 16 + React + Tailwind + React Flow → Vercel
- AI: Claude Haiku 4.5 (primario) + Groq Llama 3.3 (fallback)
- Dati: 72 file JSON/MD locali + 3 API live (World Bank, REST Countries, Exchange Rates)
- Deploy: Vercel (simulator-v2-snowy.vercel.app)
- Repo: github.com/Richardkenne/ai-os (cartella SISTEMA/simulator/)
