# Simulator v2 — Architecture

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
    |  (React Flow +     | | (template list  | |  (Claude Haiku    |
    |   simulation       | |  + categories)  | |   4.5 endpoint)   |
    |   engine)          | |                 | |                   |
    +---------+----------+ +-------+--------+ +---------+---------+
              |                    |                     |
    +---------v----------+  +-----v------+     +--------v--------+
    | SimNode (8 types)  |  | templates.ts|     | Anthropic API   |
    | Particle (SVG)     |  | (50+ tmpl)  |     | (Claude Haiku)  |
    | Dashboard (stats)  |  +-----+------+     +--------+--------+
    +--------------------+        |                      |
                           +------v---------+    +-------v--------+
                           | 67 JSON/MD     |    | 7 Live APIs    |
                           | data files     |    | (World Bank,   |
                           | (56K+ dp)      |    |  REST Countries|
                           +----------------+    |  BLS, etc.)    |
                                                 +----------------+
```

## Component Map

| File | Ruolo | LOC |
|------|-------|-----|
| `src/components/SimulatorCanvas.tsx` | Core: React Flow canvas + simulation loop + particle system | ~793 |
| `src/components/nodes/SimNode.tsx` | Rendering nodi (8 tipi: start, decision, outcome, fail, success, neutral, warning, info) | ~150 |
| `src/components/Dashboard.tsx` | Pannello risultati laterale dx (400px), stats, grafici | ~200 |
| `src/components/Particle.tsx` | Generatore SVG persone animate | ~80 |
| `src/components/TemplateSelector.tsx` | Picker template con categorie e ricerca | ~250 |
| `src/lib/templates.ts` | Definizioni 50+ template con nodi, edge, metadata | ~500 |
| `src/app/api/generate/route.ts` | Endpoint API: prompt -> Claude Haiku -> nodi JSON | ~150 |

## Data Flow

```
User selects template
  -> TemplateSelector loads template data
  -> SimulatorCanvas renders nodes + edges (React Flow)
  -> User clicks "Simulate"
  -> Nodes hidden (opacity 0)
  -> 10 waves x 10 particles launched (BFS from start nodes)
  -> Particles animate along edges
  -> Nodes revealed when particles arrive (opacity transition)
  -> Stats collected in Dashboard
  -> All nodes revealed when simulation ends
```

## External Dependencies

| Dipendenza | Versione | Uso |
|------------|----------|-----|
| `next` | 16 | Framework |
| `@xyflow/react` | latest | Node graph rendering |
| `dagre` | latest | Auto-layout |
| `tailwindcss` | 4 | Styling |
| `lucide-react` | latest | Icons (no emoji) |

## Data Layer

- `data/*.json` — 67 file, 56K+ data points
- 7 API live gratuite: World Bank, REST Countries, Exchange Rates, BLS, Wikipedia, Teleport, CoinGecko
- Claude Haiku 4.5 per generazione nodi AI
- Groq come fallback
