# Simulator — Architecture

## Stack V2 (current)
```
Frontend: Next.js 16 + React Flow + Tailwind CSS + Dagre auto-layout
Canvas:   React Flow (@xyflow/react) — zoom, pan, minimap, custom nodes
AI:       Claude Haiku 4.5 (primary) + Groq Llama 3.3 (fallback)
Live:     World Bank API (8 indicators, 10 countries, 1h cache)
Data:     62 JSON files, 23,840+ data points (~4MB)
Deploy:   Vercel (auto-deploy from GitHub push)
Font:     Inter (Google Fonts)
```

## Data flow
```
User input → keyword matching → smart extraction → AI prompt
                                     ↓
                              extractArchetypeContext (25 archetypes)
                              extractSectionEntries (scored by relevance)
                              extractSacredContext (Bible/Quran patterns)
                              extractFunnelContext (master funnels)
                                     ↓
                              Claude Haiku generates flow JSON
                                     ↓
                              Validation layer (corrects >3x prob errors)
                                     ↓
                              React Flow renders nodes + dagre layout
                                     ↓
                              Particle simulation (100 people, 10 waves)
                                     ↓
                              Dashboard (unique reach, bottlenecks)
```

## Key directories
```
simulator-v2/          ← V2 (Next.js + React Flow) — PRIMARY
  src/components/      ← React components
  src/app/api/         ← API routes (AI generation)
  src/lib/             ← Templates, utilities
  data/                ← 62 JSON data files

simulator/             ← V1 (vanilla JS) — ARCHIVED
  archive/             ← V1 HTML files preserved
  data/                ← Shared data files
  docs/                ← Documentation
```
