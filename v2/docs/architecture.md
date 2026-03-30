# Simulator v2 — Architecture

## Index
- [Truth Matrix](#truth-matrix)
- [System Diagram](#system-diagram)
- [Dataflow Engine](#dataflow-engine)
- [Component Map](#component-map)
- [Data Flow](#data-flow)
- [Data Layer](#data-layer)
- [External Dependencies](#external-dependencies)

---

## Truth Matrix

The foundation of the Simulator. Every simulation outcome is rooted in a 3-layer truth system where each layer CONFIRMS the one above it.

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   LAYER 0: SACRED TEXTS (3000+ years of empirical evidence)         ║
║   Bible + Quran — immutable behavioral laws                          ║
║   Written BECAUSE humans exhibited these behaviors repeatedly        ║
║                                                                      ║
║   "Pride goes before destruction" (Proverbs 16:18)                   ║
║   "Do not walk upon earth with insolence" (Quran 17:37)              ║
║                                                                      ║
║   10 Fundamental Laws:                                               ║
║   ┌─────────────────────────┬──────────────────────────────┐         ║
║   │ Community & Counsel     │ Seek advice, don't go alone  │         ║
║   │ Deception & Shortcuts   │ You reap what you sow        │         ║
║   │ Envy & Comparison       │ Envy rots, be original       │         ║
║   │ Fear & Lack of Faith    │ Fear paralyzes, act in faith │         ║
║   │ Forbidden Fruit         │ Focus, don't chase shiny     │         ║
║   │ Greed & Excess          │ Moderation, not excess       │         ║
║   │ Patience & Perseverance │ Endure, compound results     │         ║
║   │ Pride & Hubris          │ Listen, validate, be humble  │         ║
║   │ Sloth & Procrastination │ Act now, don't delay         │         ║
║   │ Stewardship             │ Faithful in little = much    │         ║
║   └─────────────────────────┴──────────────────────────────┘         ║
║                                                                      ║
║   250 individual patterns (expanding to 1000+)                       ║
║   Each pattern: Bible verse + Quran verse + modern data confirmation ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                          ▼ EXPLAINS ▼                                ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   LAYER 1: HUMAN NATURE (Science + Ancient Wisdom + Empirical Models)║
║   Everything that CONFIRMS Layer 0 independently                     ║
║   Science, ancient wisdom traditions, and empirical behavioral data  ║
║                                                                      ║
║   SCIENCE:                                                           ║
║   ┌──────────────────────┬───────────────────────────────────┐       ║
║   │ Maslow               │ Hierarchy of needs                │       ║
║   │ Kahneman & Tversky   │ Loss aversion, prospect theory   │       ║
║   │ Cialdini              │ 6 principles of persuasion       │       ║
║   │ Murray                │ Psychogenic needs                │       ║
║   │ Dunning-Kruger       │ Overconfidence of the unskilled  │       ║
║   │ Bandura              │ Self-efficacy, social learning    │       ║
║   │ Thaler               │ Nudge theory, behavioral econ    │       ║
║   │ Duckworth            │ Grit and perseverance            │       ║
║   │ Dweck                │ Growth vs fixed mindset          │       ║
║   │ Seligman             │ Learned helplessness, optimism   │       ║
║   └──────────────────────┴───────────────────────────────────┘       ║
║                                                                      ║
║   ANCIENT WISDOM (independent confirmation of Layer 0):              ║
║   ┌──────────────────────┬───────────────────────────────────┐       ║
║   │ Bhagavad Gita        │ Duty, detachment, self-mastery   │       ║
║   │ Dhammapada (Buddha)  │ Desire → suffering, middle path  │       ║
║   │ Confucius (Analects) │ Discipline, relationships, order │       ║
║   │ Stoics (Marcus       │ Control what you can, accept     │       ║
║   │  Aurelius, Seneca)   │  what you can't, act with virtue │       ║
║   └──────────────────────┴───────────────────────────────────┘       ║
║                                                                      ║
║   EMPIRICAL MODELS (from 130+ repo research):                        ║
║   ┌──────────────────────┬───────────────────────────────────┐       ║
║   │ Choices13k           │ 13K human decisions (risk/safe)   │       ║
║   │ Mesa ABM models      │ Schelling, wealth, epidemics     │       ║
║   │ CompeteAI (MSFT)     │ Competition vs cooperation       │       ║
║   │ ncase/sim            │ Conditional behavioral rules     │       ║
║   │ OpenLife             │ Life event probabilities by age  │       ║
║   │ cFIREsim             │ Financial behavior 1871-today    │       ║
║   └──────────────────────┴───────────────────────────────────┘       ║
║                                                                      ║
║   Sacred Law              → Scientific Framework                     ║
║   ─────────────────────────────────────────────                      ║
║   "Pride before fall"     → Dunning-Kruger effect                    ║
║   "Love of money = evil"  → Loss aversion, greed bias                ║
║   "Seek counsel"          → Wisdom of crowds, advisory boards        ║
║   "Go to the ant"         → Delayed gratification, grit              ║
║   "Envy rots bones"       → Social comparison theory                 ║
║   "Reap what you sow"     → Reciprocity, karma (secular)            ║
║   "Fear not"              → Imposter syndrome, action bias           ║
║   "Two better than one"   → Accountability, social support           ║
║   "Faithful in little"    → Compounding, stewardship bias            ║
║   "Forbidden fruit"       → FOMO, shiny object syndrome              ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                          ▼ CONFIRMED BY ▼                            ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   LAYER 2: MODERN DATA (confirms what Layer 0 already knew)         ║
║   Corporate research, government statistics, academic studies        ║
║                                                                      ║
║   ┌────────────────────┬───────────────────┬─────────────────┐       ║
║   │ Government         │ Corporate         │ Academic        │       ║
║   ├────────────────────┼───────────────────┼─────────────────┤       ║
║   │ BLS (salaries,     │ McKinsey          │ Harvard         │       ║
║   │   employment)      │ CB Insights       │ Stanford        │       ║
║   │ Census (housing,   │ First Round       │ Wharton         │       ║
║   │   demographics)    │   Capital         │ MIT             │       ║
║   │ CDC (health,       │ Y Combinator      │ NBER            │       ║
║   │   mortality)       │ Endeavor Insight  │ Kauffman        │       ║
║   │ Fed Reserve        │ Indie Hackers     │ SCORE/SBA       │       ║
║   │   (wealth, debt)   │ Gallup            │ Pew Research    │       ║
║   │ USCIS (immigration)│ Ahrefs/SEMrush    │ GEM Report      │       ║
║   │ NCES (education)   │ HubSpot           │ ASTD            │       ║
║   └────────────────────┴───────────────────┴─────────────────┘       ║
║                                                                      ║
║   Example chain:                                                     ║
║   Sacred: "Pride goes before destruction" (Proverbs 16:18)           ║
║       → Science: Dunning-Kruger effect (overconfidence)              ║
║           → Data: "42% of startups fail — no market need"            ║
║                   (CB Insights, 101 post-mortems)                    ║
║                                                                      ║
║   Sacred: "Plans fail without counsel" (Proverbs 15:22)              ║
║       → Science: Wisdom of crowds, advisory boards                   ║
║           → Data: "Mentored businesses 5x survival rate"             ║
║                   (SCORE/SBA)                                        ║
║                                                                      ║
║   Sacred: "Love of money is root of evil" (1 Timothy 6:10)           ║
║       → Science: Loss aversion, greed bias (Kahneman)                ║
║           → Data: "80% of day traders lose money year 1"             ║
║                   (BLS/SEC)                                          ║
║                                                                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                          ▼ POWERS ▼                                  ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║   SIMULATION ENGINE                                                  ║
║                                                                      ║
║   User: "I want to start a business"                                 ║
║       → Engine checks Layer 0: which sacred laws apply?              ║
║         (counsel? patience? pride? stewardship?)                     ║
║       → Claude builds model using Layer 1 (human nature science)     ║
║       → Probabilities from Layer 2 (real data: BLS, McKinsey)        ║
║       → Sacred modifiers applied: no mentor = prob * 0.2             ║
║       → Visual simulation runs with TRUE probabilities               ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## System Diagram

```
                          +------------------+
                          |   Vercel (CDN)   |
                          +--------+---------+
                                   |
                    +--------------+--------------+
                    |      Next.js 16 App         |
                    |      (localhost:3002)        |
                    +--------------+--------------+
                                   |
              +--------------------+--------------------+
              |                    |                     |
    +---------v---------+ +-------v--------+ +---------v---------+
    |  SimulatorCanvas   | | TemplateSelector| |  API /generate    |
    |  + Dataflow Engine | | (template list  | |  (Claude Haiku    |
    |  + Sacred Rules    | |  + categories)  | |   4.5 endpoint)   |
    |  + Particle System | |                 | |  + real-probs     |
    +---------+----------+ +-------+--------+ +---------+---------+
              |                    |                     |
    +---------v----------+  +-----v------+     +--------v--------+
    | SimNode (8 types)  |  | templates.ts|     | Anthropic API   |
    | Particle (SVG)     |  | (50+ tmpl)  |     | (Claude Haiku)  |
    | Dashboard (stats)  |  +-----+------+     +--------+--------+
    +--------------------+        |                      |
                           +------v---------+    +-------v--------+
                           | 69 JSON data   |    | 7 Live APIs    |
                           | files:         |    | (World Bank,   |
                           | - 46K+ dp      |    |  REST Countries|
                           | - 250+ sacred  |    |  BLS, etc.)    |
                           |   patterns     |    +----------------+
                           | - 106 real     |
                           |   probabilities|
                           +----------------+
```

---

## Dataflow Engine

```
src/lib/dataflow-engine.ts

┌─────────────────────────────────────────────────────┐
│                 DATAFLOW ENGINE                      │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │ LAYER 0: Sacred Foundation                    │   │
│  │ 10 sections × 25 patterns = 250 rules         │   │
│  │ (expanding to 1000+ via sacred-batch files)   │   │
│  │                                                │   │
│  │ Applied to EVERY node as modifiers:            │   │
│  │ - Negative match (sin present) → prob * 0.2   │   │
│  │ - Positive match (virtue present) → prob * 2.5 │   │
│  └──────────────────────┬────────────────────────┘   │
│                         ▼                             │
│  ┌───────────────────────────────────────────────┐   │
│  │ LAYER 1: Node Type Computation                │   │
│  │ start → baseValue                              │   │
│  │ bottleneck → input * (prob/100)                │   │
│  │ decision → input * (prob/100)                  │   │
│  │ action → input * 1.05                          │   │
│  │ outcome-good → input * 1.2                     │   │
│  │ outcome-bad → input * 0.3                      │   │
│  └──────────────────────┬────────────────────────┘   │
│                         ▼                             │
│  ┌───────────────────────────────────────────────┐   │
│  │ Cascading Recalculation                       │   │
│  │ Change input → reset downstream → recompute   │   │
│  │ Pull-based: fetch terminal → recurse backward │   │
│  └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Component Map

| File | Ruolo | LOC |
|------|-------|-----|
| `src/lib/dataflow-engine.ts` | Sacred foundation + cascading computation engine | ~300 |
| `src/components/SimulatorCanvas.tsx` | Core: React Flow canvas + simulation loop + particle system + replay mode + floating toolbar | ~1400 |
| `src/components/nodes/SimNode.tsx` | Rendering nodi (8 tipi), flat enterprise design, type labels mono | ~210 |
| `src/components/edges/AnimatedEdge.tsx` | Custom edge: dot animato su pass, tratteggio su fail | ~70 |
| `src/components/Dashboard.tsx` | Pannello risultati laterale dx (400px), stats | ~200 |
| `src/components/Particle.tsx` | Generatore SVG persone animate, status 'failing' con caduta | ~50 |
| `src/components/TemplateSelector.tsx` | Picker template con categorie e ricerca | ~250 |
| `src/components/TopBar.tsx` | Barra superiore minimal (48px): Logo + Input + Templates + Generate | ~100 |
| `src/components/ui/Button.tsx` | Button component (6 varianti) | ~54 |
| `src/components/ui/Spinner.tsx` | Animated SVG loader | ~9 |
| `src/lib/templates.ts` | Definizioni 50+ template con nodi, edge, metadata | ~500 |
| `src/components/DecisionPruning.tsx` | Modal pre-simulazione: 5-7 domande binarie YES/NO, modifier live, dynamic questions da API | ~270 |
| `src/app/api/generate/route.ts` | Endpoint API: prompt + sacred data + real probs → Claude → JSON + pruning_questions | ~830 |
| `src/app/api/index-data/route.ts` | Auto-indexing: delta detection + embed + upload to Supabase. Vercel Cron nightly. | ~200 |

---

## Data Flow

```
User types scenario or selects template
  → TemplateSelector loads template data
  → Dataflow Engine builds computation graph
  → Sacred rules (Layer 0) applied to every node
  → SimulatorCanvas renders nodes + edges (React Flow)
  → User clicks "Simulate"
  → DECISION PRUNING: 5-7 binary YES/NO questions appear
    → Questions are DYNAMIC (generated by Claude per scenario)
    → Each maps to a sacred section modifier
    → YES = positive modifier (1.2-2.5x), NO = negative (0.05-0.5x)
    → Combined modifier applied to ALL bottleneck/decision probabilities
    → User sees live impact meter before launching
    → Skip available for immediate simulation
  → Nodes hidden (opacity 0)
  → 10 waves × 10 particles launched (BFS from start nodes)
  → Particles carry signal delta (Loopy-style)
  → Nodes revealed when particles arrive
  → Sacred modifiers affect outcomes in real-time
  → Stats collected in Dashboard
  → All nodes revealed when simulation ends

AI Generation flow:
  User types free text
  → API embeds scenario with OpenAI text-embedding-3-small (512 dimensions)
  → Supabase pgvector finds top 30 most relevant data points (RAG)
  → API loads real-probabilities.json (106 verified stats)
  → API loads sacred patterns context (16K patterns)
  → 7 live APIs called in parallel (World Bank, BLS, etc.)
  → All data injected into Claude Haiku prompt
  → Claude generates nodes + edges + pruning_questions (dynamic per scenario)
  → Fallback: keyword matching if RAG unavailable
  → Fallback: Groq Llama if Claude fails
  → Dataflow Engine applies sacred modifiers on top
```

---

## Data Layer

### RAG Pipeline (Supabase pgvector)
- **66,672 vector entries** from 141 files indexed with OpenAI text-embedding-3-small (512 dimensions)
- **HNSW index** (m=16, ef_construction=64) for <50ms cosine similarity search
- **Embedding dimensions**: 512 (MRL-optimized, 98.6% quality of 1536, 3x less storage)
- **Supabase project**: "Simulator" (rkkfwsmoqylctprzqhfj, ap-southeast-1, free tier)
- **Re-index**: `npm run index-data`
- **Fallback**: keyword matching (112 keyword entries, 114 files)

### Auto-Indexing Pipeline (NEW)
- **Endpoint**: `POST /api/index-data` — indexes new/updated data files into Supabase
- **Vercel Cron**: runs every night at midnight UTC (`0 0 * * *` in vercel.json)
- **Delta detection**: compares local data/ files vs Supabase file counts, only indexes new or significantly larger files
- **Cost**: ~$0.001 per 100 chunks (OpenAI embeddings) — effectively $0/night for incremental updates
- **Flow**:
  1. Cron triggers GET /api/index-data
  2. Fetches existing file counts from Supabase
  3. Scans local data/ directory for JSON files
  4. Identifies NEW files (0 chunks in Supabase) or UPDATED files (20%+ more local chunks)
  5. Chunks → Embeds (OpenAI) → Uploads (Supabase pgvector)
  6. Returns report of what was indexed
- **Manual trigger**: `curl -X POST localhost:3000/api/index-data`

### Sacred Foundation (Layer 0)
- `data/sacred-texts-patterns.json` — 250 core patterns (Bible + Quran)
- `data/sacred-batch-*.json` — 7 batch files, 16,095 total patterns
- `data/sacred-texts-expanded.json` — 210 refined patterns
- `data/sacred-index.json` — 5,774 patterns with keyword index

### Probability Data (Layer 2)
- `data/real-probabilities.json` — 106 verified stats (BLS, CDC, Census, Fed)
- `data/*-probabilities-deep.json` — 3,260+ deep probability data points:
  - business-survival (221 dp), career (346 dp), country (583 dp)
  - crime-justice (213 dp), education (283 dp), fame-entertainment (187 dp)
  - life/health/relationships (312 dp), psychology-habits (247 dp), tech-AI (236 dp)
  - OpenLife repo (267 dp), Life-Simulator1 repo (412 dp)
- `data/*.json` — 179 files total, ~374K data points, covering all life/business categories
- 7 live APIs: World Bank, REST Countries, Exchange Rates, BLS, Wikipedia, Teleport, CoinGecko

### Source Triangulation (Palantir-style)
Every bottleneck/decision probability uses **weighted multi-source triangulation**:

```
Source Tiers:
  Tier 3 (weight 3x) — Government: BLS, Census, WHO, CDC, Fed
  Tier 2 (weight 2x) — Institutional: McKinsey, YC, PitchBook, CB Insights, World Bank
  Tier 1 (weight 1x) — Media: TechCrunch, Forbes, Bloomberg, HBR

Weighted Average:
  prob = sum(value_i * weight_i) / sum(weight_i)
  Example: BLS 70% (w3) + CB Insights 65% (w2) = (210+130)/5 = 68%

Confidence:
  3+ sources concordant → High (4 dots green)
  2 sources within 10pp → High (4 dots green)
  2 sources >10pp spread → Medium (3 dots amber)
  1 source tier 3 → Medium (3 dots amber)
  1 source tier 1-2 → Low (2 dots red)

Format in source field:
  "BLS 2024:70:3 | CB Insights 2024:65:2"
  name:value:tier | name:value:tier
```

### Institutional Data Sources (169 file, ~470K dp)
- **VC**: Y Combinator, Sequoia, a16z, Benchmark, Accel, Founders Fund, Lightspeed
- **Consulting**: McKinsey, BCG, Bain, Deloitte, PwC
- **Banks**: JPMorgan, Goldman Sachs, Morgan Stanley, UBS, HSBC, Citi, Deutsche Bank, Barclays, BofA, Credit Suisse
- **Government**: World Bank (10 files), BLS (7 files), Eurostat, OECD, FRED
- See `docs/data-sources.md` for complete catalog

### AI Generation
- Claude Haiku 4.5 (primary, temperature 0)
- OpenAI GPT-4o-mini (fallback, temperature 0)
- Groq Llama 3.3 (fallback, temperature 0)

---

## External Dependencies

| Dipendenza | Versione | Uso |
|------------|----------|-----|
| `next` | 16 | Framework |
| `@xyflow/react` | latest | Node graph rendering |
| `dagre` | latest | Auto-layout |
| `tailwindcss` | 4 | Styling |
| `geist` | latest | Font Geist Sans + Mono (Vercel) |
| `rete` | 2 | Dataflow engine types |
| `rete-engine` | 2 | Dataflow computation |

---

*Ultimo aggiornamento: 2026-03-30*
