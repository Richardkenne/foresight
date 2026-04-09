# Simulator — Competitor Intelligence

## Index
- [Competitor diretti](#competitor-diretti)
- [Competitor indiretti — Simulation tools](#competitor-indiretti--simulation-tools)
- [Competitor indiretti — React Flow builders](#competitor-indiretti--react-flow-builders)
- [Gap analysis](#gap-analysis)
- [Design System Intelligence](#design-system-intelligence-2026-04-09)
- [Layout Systems — Top Players](#layout-systems--top-players-2026-04-09)
- [Design System Intelligence (2026-04-09)](#design-system-intelligence-2026-04-09)

---

## Competitor diretti

| Nome | URL | Cosa fa | Forza | Debolezza | Rilevanza |
|------|-----|---------|-------|-----------|-----------|
| **Parallel Lives** | parallellives.io | AI branching timelines — esplora come sarebbero andate le cose con scelte diverse | Concept vicino al nostro, AI-powered, narrativo | No grafo visuale, no dati reali, solo testo | DIRETTO — unico competitor che fa "life what-if con AI" |
| **LifeSim** | thelifesim.com | "Create Worlds" — simula qualsiasi vita, ovunque, in qualsiasi epoca. By Cris Lenta (@crislenta). Early access, Next.js + PostHog + Tailwind. | Concept ambizioso ("Experience ANY life — ANYTIME — ANYWHERE"), branding forte, early-stage con hype | In early access (non ancora lanciato pubblicamente), no dati reali/deterministici, nessun grafo visuale, nessun pricing visibile, poca sostanza visibile sulla landing | DIRETTO — life simulation AI ma narrativo/entertainment, non data-backed |
| **LifeLens** | lifelens.to | "AI-Powered Life Decision Simulator" — predizioni data-driven per decisioni di vita (carriera, trasferimenti, investimenti). Nuxt.js + Tailwind. Claim: "10K+ decision makers", 4.9/5 rating. | Positioning forte ("see the future of your decisions"), pricing chiaro (Free $0/3 scenari, Pro $12/mo illimitato, Team $29/mo), confidence intervals e proiezioni finanziarie | API punta a localhost:8080 (possibile MVP/fake), "10K users" non verificabile, no grafo visuale, no simulazione particelle, no sacred/deterministic layer, approccio probabilistico generico | DIRETTO — il competitor piu vicino al nostro posizionamento "data-driven life decisions", ma senza grafo ne determinismo |
| **GoalSim** | goalsim.com | "AI Life Simulation Game" — scegli un obiettivo (presidente, Marte, startup unicorno) e l'AI genera una storia interattiva a bivi. Free 50 credits/day, credit packs $2.99-$14.99. 12 lingue. | Gamification forte (stats, skills, HP, energy), 3 game modes (Cozy/Drama/Strategy), AI image generation opzionale, 12 lingue, free-to-play con monetizzazione chiara | Puramente entertainment/narrativo (no dati reali), no grafo visuale, output testuale a bivi (not deterministic), no proiezioni finanziarie o probabilita reali, nessun sacred/data layer | INDIRETTO — entertainment life sim game, non decision-support tool. Buon benchmark per gamification e monetizzazione (credit system) |

## Competitor indiretti — Simulation tools

| Nome | URL | Cosa fa | Forza | Debolezza |
|------|-----|---------|-------|-----------|
| **ncase/loopy** | ncase.me/loopy | Feedback loop simulator — disegni cerchi e frecce, vedi come i sistemi evolvono | Semplicissimo, virale, public domain | No AI, no dati reali, no template, solo loop causali |
| **Insight Maker** | insightmaker.com | System Dynamics + ABM nel browser | Potente, web-based, gratuito | UI datata, curva di apprendimento alta, no AI |
| **Mesa** | mesa.readthedocs.io | Framework ABM Python — standard de facto | Maturo, ben documentato, community | Solo Python, no UI consumer, accademico |
| **NetLogo** | ccl.northwestern.edu/netlogo | Ambiente ABM educativo | Libreria modelli enorme, educativo | Desktop-only, UI anni 90, no AI |
| **AnyLogic** | anylogic.com | Simulazione enterprise (SD + ABM + DES) | Potentissimo, industria | Costoso ($$$), enterprise-only, pesante |

## Competitor indiretti — React Flow builders

| Nome | URL | Cosa fa | Forza | Debolezza |
|------|-----|---------|-------|-----------|
| **Flowise** | flowiseai.com | LLM workflow builder con React Flow | Open-source, community grande | Solo AI workflows, no simulazione |
| **Langflow** | langflow.org | Visual AI agent builder | Drag-and-drop, Python backend | Solo AI pipelines, no life simulation |
| **Dify** | dify.ai | AI app builder con workflow visuale | Completo, self-hostable | Troppo generico, no simulazione |
| **Tersa** | github.com/vercel-labs/tersa | React Flow canvas per componenti | Design eccellente (Vercel) | Molto diverso, solo UI pattern |

## Analizzati ma NON competitor

| Nome | URL | Cosa fa | Perche non compete |
|------|-----|---------|-------------------|
| **BVarta (LOKASI Intelligence)** | bvarta.com | Location intelligence + geospatial analytics per Indonesia/SEA. 138M dispositivi, 6M+ POI, 300+ dataset. B2B SaaS (KFC, McDonald's, Pertamina). Founder: Martyn Terpilowski. | Fa previsione SPAZIALE (dove aprire un negozio), non percorsi di vita. B2B enterprise, non B2C. Zero sovrapposizione. |
| **Confluent** | confluent.io | Apache Kafka managed — event streaming per microservizi. | Infrastruttura data, non simulazione. Overengineering per il nostro stadio. |

## Gap analysis

```
Feature Matrix:
                    Simulator  Parallel  LifeSim  LifeLens  GoalSim  Loopy  Insight  Mesa  Flowise
                                Lives                                        Maker
Grafo visuale         X                                                X       X             X
Particelle animate    X
AI generation         X          X         X         X         X                              X
Dati reali (API)      X                              ~
Template pronti       X                              X         X
Life scenarios        X          X         X         X         X
Probabilita reali     X                              ~
Sacred/determ layer   X
Gamification                                                   X
Multi-lingua                                                   X(12)
Pricing chiaro                                       X         X
System dynamics                                                        X       X       X
Browser-native        X          X         X         X         X       X       X             X
Open-source           X                                                X       X       X     X
```
~ = claimed but not verified

**Il nostro vantaggio unico**: nessun prodotto al mondo combina TUTTI e 6:
1. Grafo visuale interattivo (React Flow)
2. Simulazione particelle animate (BFS, 100 persone)
3. Generazione AI dei nodi (Claude) — DETERMINISTICO (temp 0)
4. Dati reali da API live (350K+ data points, 66K+ embeddings)
5. 50+ template pronti per scenari di vita
6. Sacred text layer (Bibbia, Corano, testi sapienziali)

**Competitor piu vicino**: LifeLens (data-driven decisions) ma e un MVP con API a localhost, nessun grafo, nessuna simulazione visiva.
**Competitor piu pericoloso**: GoalSim — ha gamification, 12 lingue, monetizzazione funzionante. Ma e entertainment puro, non data-backed.
**LifeSim**: early access, poca sostanza visibile. Da monitorare quando lancia.

---

## Design System Intelligence (2026-04-09)

Analisi comparativa dei design system dei top player per informare il design system di Foresight.

### Token Systems — Spacing

| Prodotto | Base Grid | N. Spacing Values | Valori | Note |
|----------|-----------|-------------------|--------|------|
| **Linear** | 8px | ~4-5 | — | Sistema token semplice, ~12 colori base |
| **Stripe** | 4px | ~6-8 | Frazioni (1/2, 1/3, 1/4...) | Approccio frazionale, non fisso |
| **Palantir Blueprint** | 4px | 8 | 4, 8, 12, 16, 20, 24, 32, 48 | Migrato da 10px a 4px grid (Agosto 2025) |
| **Atlassian** | 8px | ~9 | 2, 4, 8, 12, 16, 20, 24, 32, 40 | Base 8px con eccezioni sotto-griglia |
| **TradingView** | — | ~18 CSS tokens | accent, text, bg, positive, negative, popup, tooltip, market status | 1 font token, interno: --tv-blue-500 / --tv-cold-gray-* |
| **Foresight** | 4px | 8 | 4, 8, 12, 16, 20, 24, 32, 48 | Allineato con Palantir Blueprint |

### Token Systems — Colori

| Prodotto | N. Colori Base | Note |
|----------|----------------|------|
| **Linear** | ~12 | Sistema semplice |
| **TradingView** | ~18 (CSS tokens) | Widget-oriented: accent, text, bg, positive, negative, popup, tooltip |
| **Foresight** | 10 | — |

### Component Size Systems

| Prodotto | N. Taglie | Taglie | Motivo |
|----------|-----------|--------|--------|
| **Palantir Blueprint** | 2 | default + compact (`small` prop) | Data-dense app, no landing |
| **TradingView** | 2 | normal + small (panels) | Data-dense app, no landing |
| **Linear** | 2 | sm + md | App-only, no landing page pubblica |
| **Stripe** | 3 | sm + md + lg | Ha landing page + app |
| **Vercel** | 3 | sm + md + lg | Ha landing page + app |
| **Foresight** | 3 | sm + md + lg | Corretto — abbiamo landing page + app |

**Regola emersa**: app data-dense senza landing = 2 taglie sufficienti. App con landing page = 3 taglie necessarie.

### Design System Architecture — 5-Layer Stack

Tutti i top team usano lo stesso stack a 5 livelli:

```
1. Tokens        → colori, spacing, typography, shadows, radii
2. Primitives    → Button, Badge, Card, Text, Input, Tooltip, Divider, IconButton (6-10 componenti)
3. Compositions  → componenti composti da primitivi (SearchBar = Input + Button + Icon)
4. Layouts       → griglie, sidebar, canvas, responsive containers
5. Interactions  → animazioni, transizioni, drag-and-drop, gestures
```

- Linear formalizza pesantemente ogni livello
- Indie devs fanno lo stesso ma piu leggero
- La struttura e sempre identica — cambia solo il livello di formalizzazione
- Standard primitivi: 6-10 componenti base

### Fonti

| Fonte | URL | Cosa copre |
|-------|-----|------------|
| Nathan Curtis (EightShapes) — Size in Design Systems | https://medium.com/eightshapes-llc/size-in-design-systems-64f234aec519 | "A component library likely requires two or (at most) three sizes. Avoid greater complexity." |
| Palantir Blueprint — Spacing Migration 10px→4px | https://github.com/palantir/blueprint/wiki/Spacing-System-Migration:-10px-to-4px | Dettagli migrazione grid |
| Atlassian — Spacing Foundation | https://atlassian.design/foundations/spacing/ | Valori spacing ufficiali |
| Stripe Apps — Style Guide | https://docs.stripe.com/stripe-apps/style | Token e styling per Stripe Apps |
| TradingView — Styling & Themes | https://www.tradingview.com/widget-docs/tutorials/web-components/styling-and-themes/ | CSS tokens per widget |
| Linear Design (LogRocket) | https://blog.logrocket.com/ux-design/linear-design/ | Analisi design system Linear |

---

## Layout Systems — Top Players (2026-04-09)

Research on how top-tier products structure their page layouts. Used to inform Foresight's own layout decisions.

### Comparison Table

| Property | Linear | Vercel (Geist) | TradingView | Stripe | Palantir (Blueprint) |
|---|---|---|---|---|---|
| **Page structure** | Sidebar + TopBar + Main + Detail Panel | Sidebar + TopBar + Main | Left Toolbar + TopBar + Chart Canvas + Right Panel + Bottom Bar | Sidebar + TopBar + Main (card grid) | Navbar + Sidebar(s) + Main + Overlays |
| **Sidebar width (expanded)** | ~220-240px (resizable, user-customizable) | ~240px (CSS var `--sidebar-width`) | Left: ~48px icon toolbar; Right: ~300-375px (watchlist/details, resizable) | ~240px (collapsible) | No fixed sidebar in Blueprint; Foundry Workshop uses collapsible side panels |
| **Sidebar collapsed** | Fully collapsible (0px, `[` shortcut) | Icon-only mode (~64px, `--sidebar-width-mobile`) | Left toolbar always visible (~48px); Right panel fully hideable | Icon-only mode (~64-72px) | Collapsible panels pattern in Foundry |
| **Collapse breakpoint** | Manual (keyboard `[`) + auto on narrow viewports | ~768px (mobile auto-collapse) | No auto-collapse (desktop-first app) | ~768px (drawer on mobile) | Desktop-only (no responsive breakpoints in Blueprint) |
| **Grid system** | CSS Flexbox (no formal grid) | 24-column grid (Geist Grid component) | Custom absolute/flex panels (no CSS Grid) | CSS Grid (10-col for landing, flex for dashboard) + Stack layout system for apps | Flexbox-based (no CSS Grid in Blueprint core) |
| **Breakpoints** | Not publicly documented; behaves ~768px / ~1024px / ~1440px | xs: 0-650px, sm: 650-900px, md: 900-1280px, lg: 1280-1920px, xl: 1920px+ | Not responsive (fixed desktop layout, min ~1024px) | Not formally documented; apps use spacing tokens only | xs: 0px, sm: 576px, md: 768px, lg: 992px, xl: 1200px |
| **Container max-width** | No max-width (fluid, edge-to-edge) | ~782pt (~1093px) for content area | No max-width (fills viewport minus panels) | ~1146px (observed in dashboard clones) | No max-width in Blueprint (app fills viewport) |
| **TopBar height** | ~44-48px (macOS-native feel) | 64px (`--geist-page-nav-height: 64px`) | ~38-42px (symbol search bar) | ~56-64px | 50px (`$pt-navbar-height: 50px`) |
| **Spacing unit** | 4px grid (inferred from design) | Not formally documented in Geist public docs | Custom (dense UI, ~2-4px micro-spacing) | 2/4/8/16/24/32/48px scale (explicit tokens) | 4px (`$pt-spacing: 4px`), legacy 10px (`$pt-grid-size`) |
| **Layout approach** | Flexbox + CSS custom properties | CSS Grid (24-col) + Flexbox | Absolute positioning + Flexbox + drag-resize | Stack system (x/y/z directions) + CSS Grid | Flexbox + SCSS variables |

### Detailed Notes per Company

#### 1. Linear

**Page structure**: Inverted L-shape -- persistent sidebar on the left, topbar with tabs/breadcrumbs, main content area, optional detail side panel (issue detail, split view).

**Sidebar**:
- Resizable by dragging the border
- Fully collapsible to 0px via `[` keyboard shortcut, click on border, or command menu
- User-customizable: reorder items, hide unused items, drag-and-drop
- Width approximately 220-240px expanded (not publicly documented, based on clone analysis and visual inspection)
- Contains: workspace switcher, navigation items (Inbox, My Issues, etc.), team sections, favorites

**Layout system**:
- Primarily Flexbox-based (no formal CSS Grid for page layout)
- Views: list, board, timeline, split, fullscreen -- each with its own content layout
- Headers store filters and display options
- Side panels display meta properties
- Cross-platform: macOS (Electron), Windows, web browser -- layout adapts to each

**Responsive behavior**:
- Not a mobile-responsive web app (desktop-first, Electron-based)
- Sidebar auto-collapses on narrow browser windows
- Focus on density and information hierarchy over responsive breakpoints

**Design philosophy**: "Reduce visual noise, maintain visual alignment, increase hierarchy and density." Theme generation uses CSS variables for surfaces (elevated, translucent parts).

Sources: [Linear UI Redesign Blog](https://linear.app/now/how-we-redesigned-the-linear-ui), [Collapsible Sidebar Changelog](https://linear.app/changelog/unpublished-collapsible-sidebar), [Personalized Sidebar](https://linear.app/changelog/2024-12-18-personalized-sidebar)

---

#### 2. Vercel (Geist Design System)

**Page structure**: Left sidebar navigation + top bar (64px) + main content area. Dashboard uses card-based metric strips.

**Grid system (Geist Grid component)**:
- 24-column grid
- Responsive at 5 breakpoints:
  - `xs`: 0 - 650px
  - `sm`: 650px - 900px
  - `md`: 900px - 1280px
  - `lg`: 1280px - 1920px
  - `xl`: 1920px - 10000px
- Columns accept values 0-24 per breakpoint
- Uses dynamic CSS media queries internally
- Supports `guideWidth` for visual grid guides
- `unstable_useContainer` prop for container-query-based layouts

**CSS variables**:
- `--geist-page-nav-height`: 64px
- `--geist-page-scrollbar-width`: 4px
- `--sidebar-width`: ~240px (configurable)
- `--sidebar-width-mobile`: icon-only mode

**Container**: Max-width ~782pt (~1093px) for main content, with 16pt side padding. Mobile switches to 90vw.

**Sidebar**: Collapsible, with CSS variable control. shadcn/ui-compatible pattern (`--sidebar-width`, `--sidebar-width-icon`).

**Key insight**: Geist uses a true 24-column grid (not 12), giving finer control for data-dense dashboard layouts. Container queries are supported via `unstable_useContainer`.

Sources: [Geist Grid](https://vercel.com/geist/grid), [Geist UI Grid Docs](https://geist-ui.dev/en-us/components/grid), [Geist Design System Overview](https://designsystems.surf/design-systems/vercel)

---

#### 3. TradingView

**Page structure**: 5-zone layout -- Left Toolbar + Top Bar + Chart Canvas (center) + Right Panel + Bottom Bar. This is NOT a typical web app layout -- it is a custom desktop-like workspace.

**Panels**:
- **Left toolbar** (Drawing tools): ~48px wide, icon-only, always visible. Vertical strip of tool icons.
- **Top toolbar**: ~38-42px height. Contains symbol search, timeframe selector, indicators, compare. Full-width.
- **Chart canvas**: Fills remaining space. Absolute-positioned. Supports multi-chart grid (1x1 up to 3x3, or custom arrangements).
- **Right panel** (Widget bar): ~300-375px wide. Contains Watchlist, Details, News, Calendar. Resizable by dragging. Hideable via `hide_right_toolbar` featureset.
- **Bottom bar** (Timeframe toolbar): ~28-32px. Time period buttons.

**Multi-chart grid**: Up to 9 charts per layout (Expert plan). Arrangements: row, column, 2x2, 3x3, custom. Auto mode adjusts grid to screen resolution. Charts resizable by dragging borders.

**Layout system**:
- Custom absolute positioning + Flexbox (NOT CSS Grid)
- Drag-to-resize panels (like a desktop IDE)
- No responsive breakpoints -- desktop-first, minimum ~1024px viewport
- Layouts are persistent configurations (saved/named, with all indicators and settings)
- Widgets use closed Shadow DOM -- styling via CSS custom properties (tokens) only

**CSS theming**:
- Custom properties for colors, fonts, backgrounds
- `custom_css_url` property for external CSS injection
- Theme parameter: `?$theme=dark` for dark mode

**Key insight**: TradingView is closer to a desktop application than a web dashboard. The layout is entirely custom -- no standard CSS Grid or framework. Everything is resizable, draggable, and panel-based.

Sources: [TradingView Toolbars Docs](https://www.tradingview.com/charting-library-docs/latest/ui_elements/Toolbars/), [TradingView Layouts Guide](https://www.tradingview.com/support/solutions/43000746975-tradingview-layouts-a-quick-guide/), [TradingView CSS Themes](https://www.tradingview.com/charting-library-docs/latest/customization/styles/CSS-Color-Themes/)

---

#### 4. Stripe

**Page structure**: Collapsible sidebar + top bar + main content area with card grid. Dashboard shows KPI cards (revenue, charges, payouts, disputes) with sparklines.

**Sidebar**:
- ~240px expanded, ~64-72px collapsed (icon-only)
- Below 240px labels truncate awkwardly (design constraint)
- Above 300px steals too much content space on 1366px laptops
- Mobile: hidden by default, drawer overlay

**Stripe Apps layout system** (for embedded apps):
- Stack-based system with 3 directions: x (horizontal), y (vertical), z (layered)
- Spacing tokens: `0` (0px), `xxsmall` (2px), `xsmall` (4px), `small` (8px), `medium` (16px), `large` (24px), `xlarge` (32px), `xxlarge` (48px)
- Sizing: fractional tokens (1/2, 1/3, 1/4, 1/5, 1/6, 1/12) + `fill` (100%), `min`, `max`, `fit`
- Alignment: `alignX` (start/center/end/stretch), `alignY` (top/center/baseline/bottom/stretch)
- Distribution: `space-between` or `packed`
- Gap control: `gap`, `gapX`, `gapY` using spacing tokens

**Landing page grid**: CSS Grid with `repeat(10, 1fr)` columns and `repeat(5, 200px)` rows (observed in public blog post about Connect page).

**Container**: ~1146px max-width observed in dashboard implementations, with responsive padding (`p-4 sm:p-6 lg:p-8`).

**Content grid pattern**: `repeat(auto-fit, minmax(280px, 1fr))` for card layouts. 12-column grid with 24px gutters for structured content.

**Key insight**: Stripe uses a dual system -- the public dashboard uses CSS Grid + Flexbox, while Stripe Apps (embedded third-party apps) use a completely custom Stack layout system with explicit design tokens. The spacing token scale (2/4/8/16/24/32/48) is clean and well-documented.

Sources: [Stripe Apps Style Docs](https://docs.stripe.com/stripe-apps/style), [Stripe Connect Frontend Blog](https://stripe.com/blog/connect-front-end-experience), [Stripe Apps Components](https://docs.stripe.com/stripe-apps/components)

---

#### 5. Palantir (Blueprint)

**Page structure**: Navbar (50px) + optional sidebar(s) + main content + overlays/dialogs. Blueprint is a component library, not a full app layout -- Foundry/Workshop builds on top with its own layout system.

**Blueprint core variables** (from `_variables.scss`):
- `$pt-spacing`: 4px (primary unit, 4px-based system)
- `$pt-grid-size`: 10px (DEPRECATED, legacy)
- `$pt-navbar-height`: 50px
- `$pt-border-radius`: 4px
- `$pt-font-size`: 14px
- `$pt-font-size-large`: 16px
- `$pt-font-size-small`: 12px
- `$pt-line-height`: 1.28581
- `$pt-button-height`: 30px (small: 24px, smaller: 20px, large: 40px)
- `$pt-input-height`: 30px (small: 24px, large: 40px)

**Z-index layers**:
- `$pt-z-index-base`: 0
- `$pt-z-index-content`: 10
- `$pt-z-index-overlay`: 20
- `$pt-z-index-dialog-header`: 30

**Breakpoints** (SCSS variables + mixins):
- `$pt-breakpoint-xs`: 0px
- `$pt-breakpoint-sm`: 576px
- `$pt-breakpoint-md`: 768px
- `$pt-breakpoint-lg`: 992px
- `$pt-breakpoint-xl`: 1200px
- Mixins: `media-breakpoint-up()`, `media-breakpoint-down()`
- JS utility: `Utils.getBreakpoint()` for programmatic viewport detection

**Layout approach**:
- Flexbox-first (explicitly recommended over CSS Grid in docs)
- CSS namespace: `bp6` prefix for all classes
- Sass variables + CSS custom properties (tokens) for theming
- Dark theme via `.bp6-dark` class or `?$theme=dark` URL param
- No built-in grid component -- layout is developer-composed with flexbox + spacing variables

**Foundry Workshop layout** (on top of Blueprint):
- Layout components: header, pages, sections, overlays
- Collapsible side panels (left/right) for filters and details
- Module-based UI with configurable layout per module
- Responsive: limited (desktop-first, data-dense enterprise UIs)

**Key insight**: Blueprint is intentionally minimal on layout -- "least intrusion" philosophy. It provides the spacing system and component heights, but leaves page layout entirely to the developer. This is the opposite of Geist (which provides a full grid system). The 4px spacing unit and comprehensive SCSS variable system are the most well-documented of any system reviewed.

Sources: [Blueprint Variables (GitHub)](https://github.com/palantir/blueprint/blob/develop/packages/core/src/common/_variables.scss), [Blueprint Docs](https://blueprintjs.com/docs/), [Blueprint Breakpoints](https://app.studyraid.com/en/read/15048/520731/using-blueprint-js-breakpoints-and-media-queries), [Foundry Workshop Layouts](https://www.palantir.com/docs/foundry/workshop/concepts-layouts)

---

### Patterns & Takeaways for Foresight

| Pattern | Who uses it | Foresight relevance |
|---|---|---|
| **4px spacing grid** | Palantir (4px), Stripe (2/4/8/16/24/32/48), Geist (inferred) | Already using 4px grid per CLAUDE.md -- correct choice |
| **Sidebar 220-240px expanded** | Linear (~220-240px), Vercel (~240px), Stripe (~240px) | Sweet spot is 240px -- wide enough for labels, narrow enough for content |
| **Sidebar icon-only ~64px** | Vercel, Stripe | Good for focus mode, consider for Foresight |
| **Sidebar fully collapsible (0px)** | Linear | Best for canvas-heavy apps like Foresight (maximize React Flow space) |
| **TopBar 48-64px** | Linear (~44-48px), Vercel (64px), Palantir (50px) | 48-56px sweet spot for Foresight |
| **No responsive mobile** | Linear, TradingView | Both are desktop-first complex tools -- Foresight can follow this pattern |
| **24-column grid** | Vercel (Geist) | Finer control than 12-col, but may be overkill for Foresight |
| **Resizable panels** | TradingView, Linear | Relevant for Foresight's canvas + detail panel split |
| **Stack layout (x/y/z)** | Stripe Apps | Interesting abstraction, simpler than grid for component layout |
| **Flexbox over Grid for app shell** | Linear, Palantir, TradingView | CSS Grid for content grids, Flexbox for app shell -- industry consensus |
| **Container max-width ~1100-1200px** | Vercel (~1093px), Stripe (~1146px) | For non-canvas pages (settings, templates), use ~1120px max-width |

**Recommended Foresight layout spec** (based on this research):
```
Sidebar:          240px expanded, 0px collapsed (Linear-style, [ shortcut)
TopBar:           52px height
Spacing:          4px base unit (4/8/12/16/20/24/32/40/48)
Content max-w:    1120px (for non-canvas pages)
Canvas:           100% viewport minus sidebar/topbar (no max-width)
App shell:        Flexbox
Content grids:    CSS Grid (auto-fit, minmax pattern)
Breakpoints:      768px (tablet), 1024px (laptop), 1280px (desktop), 1920px (wide)
```
