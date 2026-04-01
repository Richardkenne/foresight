# UI/Visual References — Graph Libraries & Demos

## Index
- [3d-force-graph (vasturiano) — TOP PICK](#3d-force-graph-vasturiano)
- [React bindings](#react-bindings)
- [Reagraph](#reagraph)
- [Netflix Vizceral](#netflix-vizceral)
- [Cosmograph](#cosmograph)
- [AntV G6](#antv-g6)
- [Sigma.js](#sigmajs)
- [deck.gl](#deckgl)
- [Particle / Flow inspiration](#particle--flow-inspiration)
- [Other graph libraries](#other-graph-libraries)
- [Our prototypes](#our-prototypes)
- [Research demos (v3 folder)](#research-demos-v3-folder)

---

## 3d-force-graph (vasturiano)

**Repo:** https://github.com/vasturiano/3d-force-graph
**Stars:** 5,900+ | **Visual:** 9/10 | **Prezzo:** Free

### Live Demos (33 total)

| Demo | URL |
|---|---|
| **Directional Particles** | https://vasturiano.github.io/3d-force-graph/example/directional-links-particles/ |
| **Bloom Effect** | https://vasturiano.github.io/3d-force-graph/example/bloom-effect/ |
| **Emit Particles** | https://vasturiano.github.io/3d-force-graph/example/emit-particles/ |
| **Tree / DAG** | https://vasturiano.github.io/3d-force-graph/example/tree/ |
| **Highlight** | https://vasturiano.github.io/3d-force-graph/example/highlight/ |
| **HTML Nodes** | https://vasturiano.github.io/3d-force-graph/example/html-nodes/ |
| **Text Nodes** | https://vasturiano.github.io/3d-force-graph/example/text-nodes/ |
| Basic | https://vasturiano.github.io/3d-force-graph/example/basic/ |
| Async load | https://vasturiano.github.io/3d-force-graph/example/async-load/ |
| Large graph (~4k) | https://vasturiano.github.io/3d-force-graph/example/large-graph/ |
| Directional arrows | https://vasturiano.github.io/3d-force-graph/example/directional-links-arrows/ |
| Curved links | https://vasturiano.github.io/3d-force-graph/example/curved-links/ |
| Auto-colored | https://vasturiano.github.io/3d-force-graph/example/auto-colored/ |
| Image nodes | https://vasturiano.github.io/3d-force-graph/example/img-nodes/ |
| Custom geometries | https://vasturiano.github.io/3d-force-graph/example/custom-node-geometry/ |
| Gradient links | https://vasturiano.github.io/3d-force-graph/example/gradient-links/ |
| Text in links | https://vasturiano.github.io/3d-force-graph/example/text-links/ |
| Orbit controls | https://vasturiano.github.io/3d-force-graph/example/controls-orbit/ |
| Fly controls | https://vasturiano.github.io/3d-force-graph/example/controls-fly/ |
| Auto-orbit camera | https://vasturiano.github.io/3d-force-graph/example/camera-auto-orbit/ |
| Click focus | https://vasturiano.github.io/3d-force-graph/example/click-to-focus/ |
| Expandable nodes | https://vasturiano.github.io/3d-force-graph/example/expandable-nodes/ |
| Fix dragged nodes | https://vasturiano.github.io/3d-force-graph/example/fix-dragged-nodes/ |
| Fit to canvas | https://vasturiano.github.io/3d-force-graph/example/fit-to-canvas/ |
| Multi-selection | https://vasturiano.github.io/3d-force-graph/example/multi-selection/ |
| Dynamic changes | https://vasturiano.github.io/3d-force-graph/example/dynamic/ |
| Collision detection | https://vasturiano.github.io/3d-force-graph/example/collision-detection/ |
| Link force manipulation | https://vasturiano.github.io/3d-force-graph/example/manipulate-link-force/ |
| DAG yarn.lock | https://vasturiano.github.io/3d-force-graph/example/dag-yarn/ |
| External objects | https://vasturiano.github.io/3d-force-graph/example/scene/ |
| Pause/resume | https://vasturiano.github.io/3d-force-graph/example/pause-resume/ |

### Other vasturiano projects

| Progetto | URL | Cosa fa |
|---|---|---|
| **react-force-graph** | https://github.com/vasturiano/react-force-graph | React wrapper (2D/3D/VR/AR) |
| force-graph (2D) | https://github.com/vasturiano/force-graph | 2D canvas version |
| 3d-force-graph-vr | https://github.com/vasturiano/3d-force-graph-vr | VR version |
| 3d-force-graph-ar | https://github.com/vasturiano/3d-force-graph-ar | AR version |
| d3-force-3d | https://github.com/vasturiano/d3-force-3d | Physics engine |

---

## React bindings

| Pacchetto | URL | Cosa fa |
|---|---|---|
| **react-force-graph** | https://github.com/vasturiano/react-force-graph | React component per 2D/3D/VR/AR |
| NPM | https://www.npmjs.com/package/react-force-graph-3d | react-force-graph-3d |
| NPM | https://www.npmjs.com/package/react-force-graph-2d | react-force-graph-2d |

---

## Reagraph

**Repo:** https://github.com/reaviz/reagraph
**Site:** https://reagraph.dev
**Storybook:** https://storybook.reagraph.dev
**Stars:** 1,000+ | **Visual:** 8.5/10 | **Prezzo:** Free
**Stack:** React + React Three Fiber + Three.js
**Nota:** conflitto Three.js con 3d-force-graph (versioni diverse). Non possono coesistere facilmente.

---

## Netflix Vizceral

**Repo:** https://github.com/Netflix/vizceral
**React wrapper:** https://github.com/Netflix/vizceral-react
**Stars:** 4,100 | **Visual:** 8/10 | **Prezzo:** Free
**Nota:** non mantenuto attivamente. Particelle che fluiscono tra nodi come traffico network.
**Demo:** cerca "Netflix Vizceral demo" su YouTube

---

## Cosmograph

**Repo:** https://github.com/cosmograph-org/cosmos
**App:** https://cosmograph.app
**Demo:** https://cosmograph.app/run/
**Stars:** ~1,000 | **Visual:** 8/10 | **Prezzo:** Free (Enterprise: custom)
**Stack:** WebGL puro (shader GLSL), zero dipendenze
**Nota:** GPU-only rendering, milioni di nodi. Estetica "galaxy". No DAG layout.

---

## AntV G6

**Repo:** https://github.com/antvis/G6
**Site:** https://g6.antv.antgroup.com
**Examples:** https://g6.antv.antgroup.com/en/examples
**Stars:** 12,000 | **Visual:** 7.5/10 | **Prezzo:** Free
**Stack:** Canvas/WebGL, v5 con 3D via Three.js
**Nota:** il piu feature-complete. Edge animations, flowing dashes, dark theme, tutti i layout.

---

## Sigma.js

**Repo:** https://github.com/jacomyal/sigma.js
**Site:** https://www.sigmajs.org
**Stars:** 12,000 | **Visual:** 7/10 | **Prezzo:** Free
**Stack:** WebGL 2D
**React:** @react-sigma/core
**Nota:** 500K+ nodi, velocissimo. No 3D, no particles.

---

## deck.gl

**Repo:** https://github.com/visgl/deck.gl
**Site:** https://deck.gl
**Trips layer demo:** https://deck.gl/examples/trips-layer
**Stars:** 14,000 | **Visual:** 7/10 | **Prezzo:** Free
**Stack:** WebGL2/WebGPU
**Nota:** Uber data viz. Archi 3D animati su mappe. Non e un graph lib.

---

## Particle / Flow inspiration

| Progetto | URL | Cosa fa |
|---|---|---|
| **fieldplay** (anvaka) | https://github.com/anvaka/fieldplay | Milioni di particelle in campi vettoriali GLSL. Spettacolare. |
| **fieldplay demo** | https://anvaka.github.io/fieldplay/ | Live demo |
| **Three Nebula** | https://github.com/creativelifeform/three-nebula | Particle engine 3D per Three.js (emitter, trails, glow) |
| **particles-playground** | https://github.com/isladjan/particles-playground | Three.js + GSAP particelle cinematiche |
| **python_corona_simulation** | https://github.com/paulvangentcom/python_corona_simulation | Particelle che si infettano (stile simile al nostro) |

---

## Other graph libraries

| Libreria | URL | Stars | Visual | Note |
|---|---|---|---|---|
| **React Flow** (noi) | https://github.com/xyflow/xyflow | 36K | 6.5/10 | Il nostro attuale. Best DAG/flowchart React. |
| **Cytoscape.js** | https://github.com/cytoscape/cytoscape.js | 10.9K | 6/10 | Graph theory, academic. |
| **Orb (Memgraph)** | https://github.com/memgraph/orb | 420 | 6/10 | DB graph viz. |
| **VivaGraphJS** | https://github.com/anvaka/VivaGraphJS | 3.9K | 5.5/10 | WebGL, speed over beauty. |
| **vis-network** | https://github.com/visjs/vis-network | 3.5K | 5/10 | Datato (2015 look). |
| **ngraph** | https://github.com/anvaka/ngraph | 1.5K | 5/10 | Modular, barebones. |
| **Graphistry** | https://github.com/graphistry/pygraphistry | 2.5K | 7.5/10 | SaaS, non libreria. |
| **Gephi Lite** | https://github.com/gephi/gephi-lite | 315 | 6/10 | Sigma.js sotto. |

---

## Our prototypes

| Variante | URL locale | Libreria |
|---|---|---|
| **3D Force Graph** | http://localhost:3000/ui/force3d | react-force-graph-3d |
| **Reagraph** | http://localhost:3000/ui/reagraph | reagraph (puo avere conflitto Three.js) |
| **Attuale** | http://localhost:3000/sim | React Flow + dagre |

---

## Research demos (v3 folder)

Scaricati in ~/Simulator/v3/:

| # | Demo | Repo | Cosa fa |
|---|---|---|---|
| 01 | loopy | ncase/loopy | Feedback loop, particelle su percorsi |
| 02 | trust | ncase/trust | Game theory interattivo |
| 03 | simulating | ncase/simulating | Simulazioni epidemie |
| 03 | tersa | vercel-labs/tersa | React Flow canvas premium (Vercel design) |
| 04 | ballot | ncase/ballot | Sistemi di voto |
| 05 | covid19 | python_corona_simulation | Particelle che si infettano |
| 06 | crowds | ncase/crowds | Simulazione sociale agenti |

---

*Ultimo aggiornamento: 2026-04-01*
