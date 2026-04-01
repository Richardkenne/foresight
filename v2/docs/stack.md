# Web Development Stack — Complete Guide

## Index
- [Overview: Come funziona un sito/app](#overview-come-funziona-un-sitoapp)
- [1. Frontend Framework](#1-frontend--framework)
- [2. UI Library](#2-ui-library-componenti-pronti)
- [3. Styling](#3-styling)
- [4. Visualizzazione — Grafici](#4-visualizzazione--grafici-chart)
- [5. Visualizzazione — Grafi/Nodi](#5-visualizzazione--grafi--nodi)
- [6. Visualizzazione — Grafi TOP 15 (ranking completo)](#6-visualizzazione--grafi-top-15-ranking-completo)
- [7. Animazioni](#7-animazioni)
- [8. State Management](#8-state-management)
- [9. Backend Framework](#9-backend--framework-server)
- [10. Database](#10-database)
- [11. Auth](#11-auth-login)
- [12. AI/LLM](#12-aillm)
- [13. Hosting/Deploy](#13-hosting--deploy)
- [14. Il nostro stack attuale](#14-il-nostro-stack-attuale)
- [Glossario](#glossario)

---

## Overview: Come funziona un sito/app

```
UTENTE (browser)
  |
FRONTEND (quello che vedi)
  |-- Framework (struttura dell'app)
  |-- UI Library (componenti: bottoni, card, menu)
  |-- Styling (colori, layout, spacing)
  |-- Visualizzazione (grafici, grafi, 3D)
  |-- Animazioni (movimento, transizioni)
  |-- State Management (memoria dell'app)
  |
BACKEND (quello che non vedi)
  |-- Framework server (API, logica)
  |-- Database (dove salvi i dati)
  |-- Auth (login/registrazione)
  |-- AI/LLM (intelligenza artificiale)
  |-- File Storage (immagini, PDF)
  |-- Email (notifiche)
  |
INFRASTRUTTURA (dove gira)
  |-- Hosting (server)
  |-- CDN (velocita)
  |-- Domain (nome.com)
  |-- CI/CD (deploy automatico)
```

---

## 1. Frontend — Framework

La struttura dell'app. Decide come organizzi pagine, routing, rendering.

| # | Nome | Cosa fa | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **Next.js** | React + server + routing + API | Free | 135K |
| 2 | **React** | Libreria UI componenti | Free | 235K |
| 3 | **Svelte/SvelteKit** | Compila tutto, zero runtime | Free | 82K |
| 4 | **Vue.js** | Alternativa React, piu semplice | Free | 49K |
| 5 | **Nuxt** | Next.js ma per Vue | Free | 56K |
| 6 | **Astro** | Siti statici veloci | Free | 50K |
| 7 | **Angular** | Enterprise framework Google | Free | 98K |
| 8 | **Remix** | Data-focused, nested routes | Free | 31K |
| 9 | **Solid.js** | React-like ma piu veloce | Free | 33K |
| 10 | **Qwik** | Resumable, zero JS upfront | Free | 21K |

**Tutti gratis.** I framework sono sempre open source.

---

## 2. UI Library (componenti pronti)

Bottoni, menu, dialog, card, form gia pronti. Non devi costruirli da zero.

| # | Nome | Stile | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **shadcn/ui** | Minimal premium | Free | 85K |
| 2 | **Material UI** | Google | Free (Pro: $200/anno) | 95K |
| 3 | **Ant Design** | Enterprise (Alibaba) | Free | 94K |
| 4 | **DaisyUI** | Colorato Tailwind | Free | 36K |
| 5 | **Chakra UI** | Pulito | Free (Pro: $50/anno) | 38K |
| 6 | **Mantine** | Moderno, 100+ comp | Free | 28K |
| 7 | **Headless UI** | Unstyled (Tailwind Labs) | Free | 27K |
| 8 | **Aceternity UI** | Animazioni cinematiche | Free (Pro: $49 one-time) | 10K |
| 9 | **Magic UI** | Landing page premium | Free (Pro: $49 one-time) | 5K |
| 10 | **Radix UI** | Primitivi accessibili | Free | 18K |

---

## 3. Styling

Come gestisci colori, layout, spacing, responsive.

| # | Nome | Tipo | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **Tailwind CSS** | Utility classes | Free (Catalyst UI: $299) | 87K |
| 2 | **CSS vanilla** | Nativo browser | Free | - |
| 3 | **Styled Components** | CSS-in-JS | Free | 40K |
| 4 | **Emotion** | CSS-in-JS leggero | Free | 17K |
| 5 | **UnoCSS** | Utility come Tailwind | Free | 17K |
| 6 | **Sass/SCSS** | CSS con variabili/nesting | Free | 15K |
| 7 | **Panda CSS** | Type-safe CSS | Free | 5K |
| 8 | **Vanilla Extract** | CSS type-safe build-time | Free | 10K |
| 9 | **Stitches** | CSS-in-JS performante | Free | 8K |
| 10 | **Open Props** | CSS custom properties | Free | 5K |

---

## 4. Visualizzazione — Grafici (chart)

Barre, linee, torte, scatter plot, dashboard.

| # | Nome | Cosa fa | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **D3.js** | Tutto (low-level, mattoni LEGO) | Free | 110K |
| 2 | **Chart.js** | Grafici semplici Canvas | Free | 66K |
| 3 | **Apache ECharts** | Enterprise charts | Free | 63K |
| 4 | **Recharts** | Chart React + D3 | Free | 25K |
| 5 | **Highcharts** | Chart professionali | **$590/anno** (dev) | 12K |
| 6 | **Tremor** | Dashboard React | Free | 16K |
| 7 | **Nivo** | Chart belli React | Free | 14K |
| 8 | **Plotly.js** | Grafici scientifici | Free (Enterprise: custom) | 18K |
| 9 | **ApexCharts** | Grafici moderni | Free (Pro: custom) | 15K |
| 10 | **Visx** | D3 + React (Airbnb) | Free | 19K |

**D3.js** = libreria low-level per manipolare dati e renderizzarli in SVG/Canvas. Non da componenti pronti, tu scrivi tutto. Potentissimo ma tanto codice. Tutti i chart library (Recharts, Nivo, ecc.) sono costruiti SOPRA D3.

---

## 5. Visualizzazione — Grafi / Nodi (CLASSIFICA REALE)

Grafi, flowchart, decision tree, network visualization.
Classifica COMPLETA: proprietario + open source + SaaS. La verita, non il marketing.

### TIER GOD — Software proprietario (non puoi usarli come libreria)

Questi sono SOPRA tutto. Non sono librerie — sono prodotti/engine interi.

| # | Nome | Visual | Prezzo | Web? | Cosa fa | Perche non lo usiamo |
|---|---|---|---|---|---|---|
| 0a | **Unreal Engine** | 10/10 | Free (5% royalty >$1M) | No (exe) | Game engine fotorealistico (Fortnite, Mandalorian) | Non e web. Peso 2-50GB. Overkill: jet per andare al supermercato |
| 0b | **Unity** | 9.5/10 | Free/$400/anno | WebGL possibile | Game engine 3D (Pokemon Go, citta, simulazioni) | Possibile in web ma pesantissimo, curva di apprendimento enorme |
| 0c | **Palantir Foundry** | 9.5/10 | $millions/anno | Si (app interna) | Analytics enterprise, grafi, intelligence | Proprietario, non vendono la viz come libreria |
| 0d | **Houdini** | 10/10 | $2000/anno | No | VFX cinematici (Marvel, Dune) | Non e web, e per film/VFX |
| 0e | **Graphistry** | 8.5/10 | SaaS custom pricing | Si (iframe) | GPU graph viz, milioni di edge | SaaS — puoi solo embeddare via iframe, non controllare |

### TIER 1 — Il meglio che puoi usare nel browser (open source, free)

| # | Nome | Visual | Prezzo | 3D | Particelle | DAG | React | Stars | Best Demo |
|---|---|---|---|---|---|---|---|---|---|
| 1 | **3d-force-graph** | 9/10 | Free | Si | Si native | Si | Wrapper | 5.9K | [particles](https://vasturiano.github.io/3d-force-graph/example/directional-links-particles/) |
| 2 | **Reagraph** | 8.5/10 | Free | Si | Possibile | Si | Native | 1K | [storybook](https://storybook.reagraph.dev) |
| 3 | **Netflix Vizceral** | 8/10 | Free | Si | Si core | No | Wrapper | 4.1K | YouTube "Netflix Vizceral" |
| 4 | **Cosmograph** | 8/10 | Free | No | No | No | Wrapper | ~1K | [app](https://cosmograph.app/run/) |

**3d-force-graph e il #1 open source per il browser.** Nulla lo batte come combinazione visual + features + free. L'unica cosa sopra e software proprietario da migliaia/milioni di dollari.

### TIER 2 — Ottimi, ma meno visual

| # | Nome | Visual | Prezzo | 3D | Particelle | DAG | React | Stars | Best Demo |
|---|---|---|---|---|---|---|---|---|---|
| 5 | **AntV G6 v5** | 7.5/10 | Free | Si | Si | Si | Bindings | 12K | [examples](https://g6.antv.antgroup.com/en/examples) |
| 6 | **Sigma.js** | 7/10 | Free | No | No | Via ext | Wrapper | 12K | [site](https://www.sigmajs.org/) |
| 7 | **deck.gl** | 7/10 | Free | Si | Si | No | Native | 14K | [trips](https://deck.gl/examples/trips-layer) |

### TIER 3 — Funzionali, non cinematici

| # | Nome | Visual | Prezzo | 3D | Particelle | DAG | React | Stars | Best Demo |
|---|---|---|---|---|---|---|---|---|---|
| 8 | **React Flow** | 6.5/10 | Free (Pro $249/mo) | No | Possibile | Si | Native | 36K | [examples](https://reactflow.dev/examples) |
| 9 | **Cytoscape.js** | 6/10 | Free | No | No | Si | Wrapper | 10.9K | [demos](https://js.cytoscape.org/demos/) |
| 10 | **Orb (Memgraph)** | 6/10 | Free | No | No | Parziale | Manual | 420 | [playground](https://playground.memgraph.com) |
| 11 | **Gephi Lite** | 6/10 | Free | No | No | Parziale | No | 315 | [app](https://gephi.org/gephi-lite/) |

### TIER 3.5 — Enterprise (a pagamento)

| # | Nome | Visual | Prezzo | 3D | Particelle | DAG | React | Note |
|---|---|---|---|---|---|---|---|---|
| - | **Ogma** (Linkurious) | 8/10 | **Custom (enterprise)** | No | No | Si | Si | Ultra performance, banche, intelligence, fraud detection |
| - | **yFiles** | 7.5/10 | **$5000+/anno** | No | No | **Il migliore** | Si | Il piu potente layout engine al mondo per DAG/tree/hierarchical |
| - | **GoJS** | 7/10 | **$3000/anno** | No | No | Si | Si | Diagrammi enterprise, Northwoods Software |
| - | **KeyLines** (Cambridge Intelligence) | 8/10 | **Custom** | No | No | Si | Si | Intelligence, investigation, law enforcement |

Se hai $5K+/anno, yFiles ha il layout DAG piu preciso che esista. Ma per il browser gratis, nessuno batte 3d-force-graph.

### TIER 4 — Datati o barebones

| # | Nome | Visual | Prezzo | 3D | Particelle | DAG | React | Stars |
|---|---|---|---|---|---|---|---|---|
| 12 | **VivaGraphJS** | 5.5/10 | Free | Si | No | No | Manual | 3.9K |
| 13 | **vis-network** | 5/10 | Free | No | No | Si | Wrapper | 3.5K |
| 14 | **ngraph** | 5/10 | Free | Possibile | No | No | Manual | 1.5K |

### Layout Engine (calcolano POSIZIONE dei nodi — non disegnano nulla)

| Nome | Cosa fa | Si usa con | Prezzo | Stars |
|---|---|---|---|---|
| **dagre** | Layout DAG (quello che usiamo noi) | React Flow | Free | 4K |
| **elkjs** | Layout engine avanzato (Eclipse Layout Kernel) | React Flow, qualsiasi | Free | 700 |
| **D3-force** | Physics engine per layout force-directed | D3.js, qualsiasi renderer | Free | (parte di D3) |
| **d3-force-3d** | D3-force ma in 3D | 3d-force-graph | Free | (vasturiano) |
| **Graphology** | Engine dati grafo + algoritmi (shortest path, pagerank, community detection) | Sigma.js (renderer) | Free | 1K |

Graphology non e un'alternativa a 3d-force-graph — e il "cervello" che calcola, Sigma.js e gli "occhi" che mostrano. Come dagre e il cervello di React Flow.

### Graph Database / Computation Engine (backend — dove SALVI e QUERY grafi grandi)

Per chi ha milioni di nodi e relazioni (social network, fraud detection, knowledge graph).

| # | Nome | Tipo | Strength | Prezzo | Ci serve? |
|---|---|---|---|---|---|
| 1 | **Neo4j** | Graph DB | Query Cypher + ecosystem enorme | Free / Enterprise $36K+/anno | No — 25 nodi, localStorage basta |
| 2 | **Memgraph** | Graph DB real-time | Streaming + performance, Cypher compatibile | Free / Enterprise custom | No — non abbiamo streaming |
| 3 | **NetworkX** | Python in-memory | Algoritmi accademici avanzati (1000+ algoritmi) | Free | No — non usiamo Python backend |
| 4 | **TigerGraph** | DB distribuito | Massive scale, parallelismo, miliardi di nodi | Free / Enterprise custom | No — serve per scale che non abbiamo |
| 5 | **ArangoDB** | Multi-model | Graph + document + key-value in un DB | Free / $16K/anno | No — Supabase Postgres basta |
| 6 | **JanusGraph** | Distributed graph | Scalabile su Cassandra/HBase | Free (open source) | No — infrastruttura enterprise enorme |
| 7 | **Dgraph** | Graph + GraphQL | Semplice, veloce, GraphQL nativo | Free / Cloud custom | No — Supabase basta |
| 8 | **FalkorDB** | Redis-based graph | Fork di RedisGraph, in-memory ultra fast | Free | No — non ci serve un graph DB |
| 9 | **RedisGraph** | In-memory | Era ultra fast | **DEPRECATO** (Redis lo ha droppato 2023) | No — morto |
| 10 | **Apache AGE** | PostgreSQL extension | Aggiunge graph query a Postgres | Free | **Forse** — gia usiamo Postgres/Supabase |

### Classifiche Graph DB per contesto

**Per tipo di engine:**

| Tipo | Top tools | Quando |
|---|---|---|
| Graph DB (persistente) | Neo4j, Memgraph, TigerGraph | Prodotto reale con dati permanenti |
| In-memory engine | Graphology, NetworkX | Prototipo, UI, calcolo veloce |
| Distributed graph | JanusGraph, TigerGraph | Scale massivo (miliardi di nodi) |
| Real-time streaming | Memgraph, FalkorDB | Event-driven, analytics live |
| Multi-model DB | ArangoDB | Quando serve graph + document + key-value |

Differenza chiave: DB = storage + query. Engine = calcolo. In-memory = veloce ma RAM-only.

**Per performance pura:**

| Rank | Tool | Note |
|---|---|---|
| 1 | TigerGraph | Distribuito, 100x Neo4j in benchmark |
| 2 | Memgraph | In-memory, fino a 100x Neo4j |
| 3 | FalkorDB | Redis-based, ultra low latency |
| 4 | Neo4j | Stabile ma piu lento dei nuovi |
| 5 | NetworkX | Lento su large graph (Python, RAM) |

**Per AI / Knowledge Graph / RAG:**

| Rank | Tool | Note |
|---|---|---|
| 1 | Neo4j | Standard per knowledge graph, ecosystem enorme, Cypher |
| 2 | FalkorDB | Focus specifico su GraphRAG |
| 3 | Memgraph | Real-time graph + AI |
| 4 | NetworkX | Prototyping ML/research |
| 5 | TigerGraph | Enterprise AI graph |

**Per maturita / ecosystem:**

| Rank | Tool | Note |
|---|---|---|
| 1 | Neo4j | Il piu maturo, piu grande community, piu integrazioni |
| 2 | ArangoDB | Solido, multi-model, buona docs |
| 3 | TigerGraph | Enterprise forte |
| 4 | Memgraph | Giovane ma in crescita rapida |
| 5 | NetworkX | Maturo in Python/accademia |

**Per noi:** il nostro "graph engine" e un array JS di nodi + edge + dagre per layout. Funziona perfettamente con 25 nodi. Non serve Neo4j per 25 nodi come non serve un Boeing per attraversare la strada.

**L'unico interessante per il futuro:** Apache AGE — aggiunge query a grafo direttamente nel nostro Postgres/Supabase. Se un giorno volessimo fare query tipo "trova tutti i path che passano per il bottleneck X con prob > 50%", AGE lo fa senza aggiungere un altro database. Ma per ora non serve.

### Note importanti

**Graphistry** (Tier God) = piattaforma SaaS GPU-accelerated. Renderizza milioni di edge. Visivamente impressionante. MA: non e una libreria che installi — e un servizio hosted. Puoi solo embeddare via iframe, non hai controllo sui nodi, non puoi fare card custom, non puoi fare simulazione. Per noi: inutile. E come guardare una foto bella ma non poterla toccare.

**Reagraph** = teoricamente buono ma conflitto Three.js con 3d-force-graph. Non possono coesistere. 3d-force-graph e superiore in tutto, quindi reagraph e irrilevante per noi.

**React Flow** = quello che usiamo ora. Il MIGLIORE per card HTML custom, layout DAG preciso, interazioni flowchart. Visual 6.5/10 ma customizzabile. Non e cinematico ma e il piu controllabile.

**vis.js** = libreria per network/grafi e timeline. Componenti piu pronti di D3 ma estetica datata (2015). Meno attivo.

**D3.js** (nella sezione chart) = libreria low-level. Non e per grafi — e per dati. Tutti i chart (Recharts, Nivo) sono costruiti SOPRA D3.

### Classifiche per contesto (non esiste UNA classifica giusta)

La libreria "migliore" dipende da cosa stai costruendo:

**Se costruisci Palantir (enterprise, 100K+ nodi, team di 10, budget $M):**

| Rank | Tool | Ruolo |
|---|---|---|
| 1 | Cytoscape.js | Core graph engine serio |
| 2 | Sigma.js | Scale massivo (WebGL) |
| 3 | Reagraph | UI React + interazioni |
| 4 | Graphology | Engine algoritmi |
| 5 | Ogma/yFiles | Enterprise paid |

**Se costruisci per performance/scale (milioni di nodi):**

| Rank | Tool | Note |
|---|---|---|
| 1 | Sigma.js | WebGL, 100K+ nodi |
| 2 | Ogma | Enterprise ultra ottimizzato |
| 3 | Cosmograph | GPU shader, milioni di nodi |
| 4 | Cytoscape.js | Solido fino a 50K |
| 5 | 3d-force-graph | Degrada sopra 10K |

**Se costruisci per UX/product (app consumer, interazioni):**

| Rank | Tool | Note |
|---|---|---|
| 1 | React Flow | Il migliore per card HTML, workflow, DAG |
| 2 | Reagraph | Lasso, select, events moderni |
| 3 | vis-network | Semplice ma efficace |
| 4 | AntV G6 | Feature-complete |
| 5 | 3d-force-graph | UX base minimal (ma customizzabile) |

**Se costruisci per visual wow (demo, storytelling, impressionare):**

| Rank | Tool | Note |
|---|---|---|
| 1 | 3d-force-graph | Particelle, bloom, 3D, VR — imbattibile |
| 2 | Netflix Vizceral | Traffico animato cinematico |
| 3 | Cosmograph | Galaxy di dati |
| 4 | Reagraph | 3D pulito |
| 5 | deck.gl | Archi animati su mappe |

### Cosa serve a NOI (Simulator v2)

Noi abbiamo 15-25 nodi per simulazione, 1 developer, $0 budget. Non ci serve:
- Scale (15 nodi, non 100K)
- Graph algorithms (non facciamo pagerank o community detection)
- Lasso/multi-select (non siamo un tool di analisi)
- Team enterprise (siamo 1 persona)

Ci serve:
- Card ricche con desc, source, prob, time → **React Flow** (gia fatto)
- Effetto wow quando serve → **3d-force-graph** (toggle 2D/3D)
- Layout DAG preciso → **dagre** (gia fatto)

**Stack finale: React Flow + 3d-force-graph + dagre. Due renderer, un engine. Basta.**

Aggiungere Cytoscape, Sigma, Graphology sarebbe over-engineering — complessita 4x per zero beneficio con 25 nodi.

### La posizione reale di 3d-force-graph

3d-force-graph e il **#1 al mondo per graph visualization nel browser**. Non e il #1 assoluto — software proprietario (Unreal, Palantir, Houdini) e superiore visivamente. Ma quelli costano da $400 a milioni e non girano nel browser. Per qualsiasi progetto web, 3d-force-graph e il tetto.

### Demo 3d-force-graph — tutti i link

| Demo | URL | Cosa vedi |
|---|---|---|
| **Directional Particles** | https://vasturiano.github.io/3d-force-graph/example/directional-links-particles/ | Particelle che scorrono sugli edge in 3D |
| **Bloom Effect** | https://vasturiano.github.io/3d-force-graph/example/bloom-effect/ | Nodi con glow luminoso |
| **Emit Particles** | https://vasturiano.github.io/3d-force-graph/example/emit-particles/ | Click nodo = emette particelle |
| **Tree / DAG** | https://vasturiano.github.io/3d-force-graph/example/tree/ | Struttura ad albero 3D |
| **Fly Controls** | https://vasturiano.github.io/3d-force-graph/example/controls-fly/ | Prima persona WASD dentro il grafo |
| **Auto Orbit** | https://vasturiano.github.io/3d-force-graph/example/camera-auto-orbit/ | Camera gira intorno automaticamente |
| **Click Focus** | https://vasturiano.github.io/3d-force-graph/example/click-to-focus/ | Click nodo = camera vola li |
| **Highlight** | https://vasturiano.github.io/3d-force-graph/example/highlight/ | Hover = evidenzia connessioni |
| **HTML Nodes** | https://vasturiano.github.io/3d-force-graph/example/html-nodes/ | Nodi con contenuto HTML |
| **Text Nodes** | https://vasturiano.github.io/3d-force-graph/example/text-nodes/ | Nodi con testo |
| **Expandable Nodes** | https://vasturiano.github.io/3d-force-graph/example/expandable-nodes/ | Clicca per espandere rami |
| **Custom Geometries** | https://vasturiano.github.io/3d-force-graph/example/custom-node-geometry/ | Forme 3D custom per nodi |
| **Gradient Links** | https://vasturiano.github.io/3d-force-graph/example/gradient-links/ | Edge con gradiente colore |
| Basic | https://vasturiano.github.io/3d-force-graph/example/basic/ | Grafo base |
| Large graph (~4k) | https://vasturiano.github.io/3d-force-graph/example/large-graph/ | 4000 nodi |
| Directional arrows | https://vasturiano.github.io/3d-force-graph/example/directional-links-arrows/ | Frecce direzionali |
| Curved links | https://vasturiano.github.io/3d-force-graph/example/curved-links/ | Edge curve |
| Auto-colored | https://vasturiano.github.io/3d-force-graph/example/auto-colored/ | Colori automatici |
| Image nodes | https://vasturiano.github.io/3d-force-graph/example/img-nodes/ | Nodi con immagini |
| Text in links | https://vasturiano.github.io/3d-force-graph/example/text-links/ | Testo sugli edge |
| Orbit controls | https://vasturiano.github.io/3d-force-graph/example/controls-orbit/ | Controlli orbita |
| Fix dragged nodes | https://vasturiano.github.io/3d-force-graph/example/fix-dragged-nodes/ | Drag e fissa nodi |
| Fit to canvas | https://vasturiano.github.io/3d-force-graph/example/fit-to-canvas/ | Auto-fit |
| Multi-selection | https://vasturiano.github.io/3d-force-graph/example/multi-selection/ | Selezione multipla |
| Dynamic changes | https://vasturiano.github.io/3d-force-graph/example/dynamic/ | Nodi che cambiano in tempo reale |
| Collision detection | https://vasturiano.github.io/3d-force-graph/example/collision-detection/ | Nodi non si sovrappongono |
| Link force manipulation | https://vasturiano.github.io/3d-force-graph/example/manipulate-link-force/ | Forza edge modificabile |
| DAG yarn.lock | https://vasturiano.github.io/3d-force-graph/example/dag-yarn/ | Dipendenze come DAG |
| External objects | https://vasturiano.github.io/3d-force-graph/example/scene/ | Oggetti 3D esterni |
| Pause/resume | https://vasturiano.github.io/3d-force-graph/example/pause-resume/ | Pausa/riprendi |

### Opzioni upgrade per Simulator v2

| Opzione | Cosa fai | Effort | Risultato |
|---|---|---|---|
| **A** | Tieni React Flow (2D) + aggiungi 3d-force-graph come modalita 3D | Medio (2-3h) | Il meglio dei due mondi: card precise in 2D, wow in 3D |
| **B** | Tieni React Flow + migliora solo il design CSS (glow, dark, spacing) | Basso (1-2h) | 2D ma premium. Palantir-feel senza 3D |
| **C** | Switch completo a 3d-force-graph | Alto (1-2 giorni) | Tutto in 3D, perdi card HTML precise |

**Raccomandazione: Opzione A** — tieni entrambi, l'utente switcha. React Flow per precisione, 3d-force-graph per immersione.

---

## 7. Animazioni

Movimento, transizioni, effetti visivi.

| # | Nome | Cosa fa | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **Framer Motion** | Animazioni React dichiarative | Free | 25K |
| 2 | **GSAP** | Animazioni pro timeline/scroll | Free (Business: **$199/anno**) | 20K |
| 3 | **Lottie** | After Effects nel browser | Free | 31K |
| 4 | **Rive** | Animazioni interattive real-time | Free (Pro: **$25/mo**) | SaaS |
| 5 | **Three.js** | 3D engine WebGL | Free | 105K |
| 6 | **React Three Fiber** | Three.js in React | Free | 29K |
| 7 | **Auto Animate** | Animazioni zero-config | Free | 13K |
| 8 | **Anime.js** | Animazioni leggere | Free | 51K |
| 9 | **Motion One** | Web Animations API | Free | 4K |
| 10 | **Popmotion** | Animazioni funzionali | Free | 8K |

---

## 8. State Management

Come l'app ricorda i dati mentre la usi (senza ricaricare).

| # | Nome | Cosa fa | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **React useState/useContext** | Built-in React | Free | - |
| 2 | **Zustand** | Store semplice e leggero | Free | 52K |
| 3 | **Jotai** | Stato atomico | Free | 20K |
| 4 | **Redux Toolkit** | Store complesso (enterprise) | Free | 61K |
| 5 | **TanStack Query** | Gestione dati server/cache | Free | 44K |
| 6 | **Valtio** | Proxy-based (Zustand team) | Free | 10K |
| 7 | **Recoil** | Atomico (Meta) | Free | 20K |
| 8 | **XState** | State machine | Free | 28K |
| 9 | **Nanostores** | Ultra-leggero (300B) | Free | 5K |
| 10 | **Legend State** | Reactive (velocissimo) | Free | 3K |

---

## 9. Backend — Framework server

Gestisce API, logica, comunicazione con database.

| # | Nome | Lingua | Prezzo | Stars |
|---|---|---|---|---|
| 1 | **Next.js API Routes** | TypeScript | Free | - |
| 2 | **Express.js** | Node.js | Free | 66K |
| 3 | **FastAPI** | Python | Free | 82K |
| 4 | **Django** | Python | Free | 83K |
| 5 | **NestJS** | TypeScript | Free | 70K |
| 6 | **Hono** | TypeScript | Free | 22K |
| 7 | **tRPC** | TypeScript | Free | 36K |
| 8 | **Flask** | Python | Free | 70K |
| 9 | **Spring Boot** | Java | Free | 77K |
| 10 | **Ruby on Rails** | Ruby | Free | 56K |

---

## 10. Database

Dove salvi i dati (utenti, simulazioni, contenuti).

| # | Nome | Tipo | Free tier | Prezzo pro |
|---|---|---|---|---|
| 1 | **Supabase** | Postgres + Auth + Vector | 500MB, 50K rows | **$25/mo** |
| 2 | **PostgreSQL** | SQL puro (self-host) | Illimitato | Hosting: $5-20/mo |
| 3 | **PlanetScale** | MySQL serverless | 5GB, 1B reads | **$29/mo** |
| 4 | **MongoDB Atlas** | NoSQL documenti | 512MB | **$57/mo** |
| 5 | **Turso** | SQLite edge | 9GB, 500 DB | **$29/mo** |
| 6 | **Neon** | Postgres serverless | 512MB | **$19/mo** |
| 7 | **Upstash Redis** | Key-value cache | 10K cmd/day | **$10/mo** |
| 8 | **Firebase** | NoSQL Google | 1GB | **$25/mo** |
| 9 | **CockroachDB** | SQL distribuito | 10GB | **$29/mo** |
| 10 | **D1 (Cloudflare)** | SQLite edge | 5GB | **$5/mo** |

---

## 11. Auth (login)

Gestione utenti, registrazione, login, permessi.

| # | Nome | Cosa fa | Free tier | Prezzo pro |
|---|---|---|---|---|
| 1 | **Supabase Auth** | Email, OAuth, magic link | 50K MAU | Built-in Pro |
| 2 | **Auth.js (NextAuth)** | Auth per Next.js | Illimitato | Free (self-host) |
| 3 | **Clerk** | Auth + UI pronta | 10K MAU | **$25/mo** |
| 4 | **Lucia** | Auth leggero | Illimitato | Free (self-host) |
| 5 | **Firebase Auth** | Google auth | 10K verif/mo | Pay per use |
| 6 | **Auth0** | Enterprise auth | 7.5K MAU | **$35/mo** |
| 7 | **Kinde** | Auth moderno | 10.5K MAU | **$25/mo** |
| 8 | **WorkOS** | Enterprise SSO | 1M MAU | **$125/mo** |
| 9 | **Stytch** | Passwordless | 1K MAU | Custom |
| 10 | **Descope** | No-code auth | 7.5K MAU | Custom |

---

## 12. AI/LLM

Intelligenza artificiale, generazione testo, speech-to-text.

| # | Nome | Cosa fa | Prezzo |
|---|---|---|---|
| 1 | **Claude (Anthropic)** | LLM top-tier | Haiku: $0.25/1M tok, Sonnet: $3, Opus: $15 |
| 2 | **OpenAI GPT** | LLM mainstream | GPT-4o-mini: $0.15/1M, GPT-4o: $2.50 |
| 3 | **Groq** | LLM velocissimo | Llama 3.3: $0.05/1M tok |
| 4 | **Google Gemini** | LLM Google | Flash: $0.075/1M, Pro: $1.25 |
| 5 | **Mistral** | LLM europeo | Small: $0.10/1M, Large: $2 |
| 6 | **Whisper (OpenAI)** | Speech-to-text | $0.006/minuto |
| 7 | **Vercel AI SDK** | Streaming AI React | Free (paga il provider) |
| 8 | **LangChain** | Chain/agent framework | Free |
| 9 | **Replicate** | Modelli on-demand | Pay per second |
| 10 | **Together AI** | LLM open-source hosted | Llama: $0.05/1M tok |

---

## 13. Hosting / Deploy

Dove metti il sito online.

| # | Nome | Cosa fa | Free tier | Prezzo pro |
|---|---|---|---|---|
| 1 | **Vercel** | Deploy Next.js | 100GB BW | **$20/mo** |
| 2 | **Netlify** | Deploy JAMstack | 100GB BW | **$19/mo** |
| 3 | **Cloudflare Pages** | Deploy edge | Illimitato BW | Free (!!) |
| 4 | **Railway** | Deploy qualsiasi | $5 credito | **$5/mo** + uso |
| 5 | **Fly.io** | Container globali | 3 VM gratis | Pay per use |
| 6 | **Render** | Deploy semplice | 750h/mo | **$7/mo** |
| 7 | **AWS Amplify** | Deploy AWS facile | 12 mesi free | Pay per use |
| 8 | **DigitalOcean** | VPS/App Platform | - | **$5/mo** |
| 9 | **Hetzner** | VPS economico EU | - | **EUR 4/mo** |
| 10 | **Coolify** | Self-hosted Vercel | Free (self-host) | **$5/mo** hosted |

---

## 14. Il nostro stack attuale

```
Frontend:   Next.js 16 + React 19 + Tailwind CSS + React Flow + Framer Motion
Backend:    Next.js API Routes + Claude Haiku + OpenAI GPT-4o-mini + Groq Llama 3.3 + Whisper
Database:   Supabase (Postgres + pgvector per RAG, 66K+ embeddings)
Hosting:    Vercel (v2-nine-jade.vercel.app)
Auth:       Nessuna (solo per uso personale)
Costo:      ~$0/mese (free tier tutto)
Dati:       374K+ data points, 179 JSON, 7 API live, 36 sacred roots
Input:      7 modalita (testo, audio/mic, foto, video, URL, PDF, template)
```

---

## Glossario

| Termine | Significato |
|---|---|
| **Framework** | Struttura che organizza il codice (come le fondamenta di una casa) |
| **Libreria** | Pezzo di codice riutilizzabile che fa UNA cosa (come un attrezzo) |
| **UI** | User Interface — quello che l'utente vede e tocca |
| **UX** | User Experience — come l'utente si SENTE usando l'app |
| **Component** | Pezzo di UI riutilizzabile (bottone, card, menu) |
| **API** | Porta tra frontend e backend — il frontend chiede, il backend risponde |
| **Database** | Dove salvi dati permanentemente (come un archivio) |
| **ORM** | Traduttore tra codice e database (scrivi TypeScript, lui fa SQL) |
| **Auth** | Sistema di login/registrazione/permessi |
| **Deploy** | Mettere il sito online su un server |
| **CDN** | Rete di server che serve i file dal punto piu vicino all'utente |
| **SSR** | Server-Side Rendering — la pagina viene costruita sul server |
| **SSG** | Static Site Generation — la pagina viene pre-costruita |
| **Edge** | Server vicini all'utente (Cloudflare, Vercel Edge) |
| **WebGL** | Tecnologia per grafica 3D nel browser (GPU) |
| **SVG** | Formato immagine vettoriale (scalabile, leggero) |
| **Canvas** | Area di disegno 2D nel browser |
| **Three.js** | Libreria per fare 3D nel browser con WebGL |
| **DAG** | Directed Acyclic Graph — grafo con direzione, senza cicli (il nostro flusso) |
| **RAG** | Retrieval-Augmented Generation — AI cerca dati prima di rispondere |
| **Embedding** | Testo trasformato in numeri per ricerca semantica |
| **pgvector** | Estensione PostgreSQL per salvare e cercare embeddings |
| **Token** | Pezzo di testo (~4 caratteri) — unita di misura per costi AI |
| **MAU** | Monthly Active Users — utenti attivi al mese |
| **BW** | Bandwidth — quantita di dati trasferiti |

---

*Ultimo aggiornamento: 2026-04-01*
