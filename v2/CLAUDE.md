@AGENTS.md

# Foresight (Simulator v2) — Project Rules

## Design Rules (NON-NEGOTIABLE)
- **NO EMOJI** — Never use emoji characters anywhere (UI, code, data, templates). Use Lucide SVG icons or inline SVG instead. Emoji = cheap, icons = professional.
- **Typography** — Use Inter for UI, system font stack as fallback. Font sizes: consistent scale (10px metadata, 12px body, 13px labels, 15px headings). Letter-spacing tight on headings.
- **Spacing** — Follow 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48). No arbitrary values. Padding/margin must be consistent across components.
- **Responsive** — Must work on mobile (320px+), tablet (768px+), and desktop (1024px+). Use Tailwind responsive prefixes. Test at all breakpoints.
- **Quality bar** — Must look like a top-tier product (Linear, Vercel, Raycast level). No generic AI slop. Clean, minimal, professional.
- **No overlap** — Cards/nodes must NEVER overlap. Dagre node height must account for actual content (desc, sources, footer). Increase nodesep if needed.
- **Edge labels** — NEVER cross the edge line. Always positioned above the line with a background rect. No/fail = red, yes/pass = green, partial = amber. Labels matched with startsWith (case-insensitive) to handle long labels like "YES (reason)".

## Core Philosophy (NON-NEGOTIABLE)
- **DETERMINISTIC** — The simulator maps observed reality. No randomness, no noise, no estimation.
- Sacred texts describe deterministic laws. Psychology confirms them. Data measures them. All three converge.
- Probabilities are FACTS, not dice rolls. "70% fail" means exactly 70 out of 100 fail. Always.
- Same scenario = same graph = same result. Every run identical.
- Temperature 0 on all AI providers. No "Estimated" probabilities — only verified data or null.
- If data doesn't exist, say "No data" — never guess.
- The only Math.random() allowed is COSMETIC (particle appearance, animation scatter).

## Stack
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + Framer Motion
- React Flow (@xyflow/react) for node graph
- Dagre for auto-layout
- Claude Haiku 4.5 for AI generation (fallback: OpenAI, Groq)
- Supabase Pro pgvector for RAG (3.47M+ dp, 145K+ chunked embeddings — NEW FILES NOT YET EMBEDDED, 512 dim, HNSW, $25/mo)
- Data storage: heavy files on iCloud Drive (symlink from data/cultural/), ~1,200+ JSON files across 45+ domains
- Beast Mode (2026-04-08/09): +270K DP from WHO GHO, IMF WEO, WB 80+ countries, 37 deep research files
- Deep research files in data/: 37 domain-specific JSON files with qualitative data (studies, reports, specific facts)
- API bulk files on iCloud: worldbank-all (92 indicators), who-gho, imf-weo, worldbank-expanded (63 countries)
- OpenAI Whisper for audio/video transcription
- Web Audio API for sound design

## Architecture
- `src/components/SimulatorCanvas.tsx` — core simulation engine + React Flow canvas (~1,677 lines)
- `src/lib/graph-utils.ts` — dagre layout + template-to-ReactFlow conversion (~154 lines)
- `src/lib/simulation-types.ts` — speed config, PrecomputedFate, precomputeFates (~130 lines)
- `src/components/SimOverlays.tsx` — CutLineIndicator + ParticleLayer viewport overlays (~78 lines)
- `src/components/SimToolbar.tsx` — all floating toolbars: Idle, Running, Stats, Replay, StepMode, PathFilter, Results (~458 lines)
- `src/components/usePathFilter.ts` — path filter hook (success/partial/fail highlighting) (~113 lines)
- `src/components/nodes/SimNode.tsx` — node rendering (11 types)

## Node Types & Simulation Flow
The simulation follows this pattern:
`state → desire/action → new state → bottleneck/gate → trajectory → state → outcome`

| Type | Color | Purpose | Answers |
|------|-------|---------|---------|
| `state` | Neutral (white), pill shape | Current condition of the person | "Who are you NOW?" |
| `desire` | Gray | What you want | "What do you want?" |
| `action` | Gray | What you do | "What are you doing?" |
| `trajectory` | Neutral, subtle left border | The path you're on | "Where are you heading?" |
| `bottleneck` | Neutral hexagon, subtle border | Binary gate (pass/fail) | "Do you pass?" |
| `gate` | Neutral, left border | 3-way split (no/partial/yes) | "Which path?" |
| `decision` | Gray | Yes/no choice | "Do you choose yes?" |
| `outcome-good` | Green outline | Positive end | "You made it" |
| `outcome-bad` | Red outline | Negative end | "You didn't make it" |

Entry points: state (initial condition) → desire (goal) → action (first step)
Key rule: ALWAYS include state nodes after bottlenecks to show transformation.
- `src/components/Dashboard.tsx` — results modal
- `src/components/cards/BottleneckCard.tsx` — bottleneck card for Dashboard
- `src/components/Particle.tsx` — SVG person generator
- `src/components/TemplateSelector.tsx` — template picker
- `src/components/TopBar.tsx` — top bar orchestrator (delegates to sub-components)
- `src/components/Sidebar.tsx` — sidebar shell (composes sub-components)
- `src/components/sidebar/` — SidebarHeader, SidebarNav, NavItem, SidebarSettings, ToggleItem, SidebarViewSelector, SidebarShortcuts, ShortcutItem, SidebarFooter
- `src/components/topbar/` — AttachmentChips, ModeStrip
- `src/lib/templates.ts` — all template data
- `src/app/api/generate/route.ts` — Claude API endpoint

## Data Freshness Rules (NON-NEGOTIABLE)
- **MAI usare dati più vecchi di 2-3 anni** — ogni data point deve essere 2023+ (salvo dati storici ancora validi: testi sacri, tabelle mortalità, serie storiche in corso).
- Quando aggiungi dati, verifica l'anno. Se la fonte è pre-2022 → cerca una versione aggiornata o segnala "outdated".
- Eccezioni: Bibbia, Corano, leggi fisiche, dati storici dichiarati come tali (es. "S&P 500 dal 1871").
- **OGNI data point DEVE avere un sourceUrl** — nessuna eccezione. Dati senza URL non vengono accettati. Quando scarichi da API, includi sempre l'URL della fonte in ogni record (es. `"sourceUrl": "https://api.worldbank.org/v2/..."`). Prima di embeddare in Supabase, verifica che ogni record abbia sourceUrl.

## Localhost Rules (NON-NEGOTIABLE)
- **MAI dare un URL localhost senza prima verificare** — avvia il server (`npm run dev`), aspetta il boot, verifica con `curl` che risponda 200, e SOLO ALLORA dì all'utente di aprirlo.
- Se il server non parte o non risponde → debugga e risolvi PRIMA di comunicare l'URL.
- Vale per TUTTI gli endpoint (pagine, API, ecc.).

## Deploy Rules (NON-NEGOTIABLE — MASSIMA PRIORITA)
- **MAI MAI MAI fare git push** — ogni push triggera un build Vercel che costa soldi reali ($25+ al mese).
- Push SOLO quando l'utente dice ESPLICITAMENTE "pusha", "push", "deploy", o "metti online".
- Anche se l'utente dice "salva", "commit", "backup" → fai SOLO `git commit`, MAI push.
- Anche se l'utente dice "fai push" per un altro progetto → NON pushare questo.
- Se per errore stai per fare push → FERMATI e chiedi conferma.
- Questa regola vale fino a che l'utente non la rimuove esplicitamente.

## Design System Rules (NON-NEGOTIABLE)
- **Tokens first** — All new components MUST use CSS token variables (e.g. `var(--color-accent)`, `var(--space-4)`). NEVER hardcode hex colors, px spacing, or font sizes.
- **Use primitives** — Use existing primitives (Button, Badge, Card, Text, IconButton, Spinner, Skeleton, Toast) from `src/components/ui/` instead of raw `<div>` or `<button>` elements.
- **Spacing: 4px grid only** — Only values: 4, 8, 12, 16, 24, 32, 40, 48. Use `var(--space-1)` through `var(--space-8)`. No arbitrary spacing.
- **Sizes: sm/md/lg** — Button, Card, Badge all support sm/md/lg size variants. Use these consistently.
- **Brand assets** — Logo, OG image, favicon, apple-touch-icon are in `assets/brand/`. Never recreate them.
- **Design tokens JS** — When you need tokens in JS/TS, import from `@/lib/design-tokens` (not from globals.css).
- **5-layer architecture** — Layer 1: Tokens (globals.css + design-tokens.ts) → Layer 2: Primitives (src/components/ui/) → Layer 3: Compositions (Dashboard, SimToolbar, TopBar, TemplateSelector, Sidebar) → Layer 4: Layouts (pending) → Layer 5: Interactions (pending).
- **Migration status** — 816→223 hardcoded values (residual = SVG/WebGL only). Do NOT add new hardcoded values.

## Simulation Flow
- Nodes hidden (opacity 0) when simulation starts
- Revealed one by one as particles reach them (opacity transition)
- All revealed when simulation stops
- 10 waves, 10 people per wave, BFS from start nodes
