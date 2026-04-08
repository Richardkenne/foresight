si# Deep Research — Simulator v2

## Index
- [1. Simulation Engines & Scenario Planning](#1-simulation-engines--scenario-planning)
- [2. Agent-Based / Population / Social Simulation](#2-agent-based--population--social-simulation)
- [3. System Dynamics & Causal Loop Tools](#3-system-dynamics--causal-loop-tools)
- [4. Decision Tree & Node-Based UI](#4-decision-tree--node-based-ui)
- [5. Raccomandazioni operative](#5-raccomandazioni-operative)
- [6. Meccaniche da portare nei template](#6-meccaniche-da-portare-nei-template)
- [6b. Scenario Datasets per template](#6-scenario-datasets-per-template-jsoncsv)
- [7. AI/LLM-Powered Scenario & Simulation Projects](#7-aillm-powered-scenario--simulation-projects-github)
- [8. Life Simulators, Decision Simulators & Financial Life Tools](#8-life-simulators-decision-simulators--financial-life-tools)
- [9. Raccomandazioni — Life Simulator specifiche](#9-raccomandazioni--life-simulator-specifiche)
- [10. React Flow Projects — Simulators, Workflow Engines, Scenario Tools](#10-react-flow-projects--simulators-workflow-engines-scenario-tools)
- [11. Ricerche da completare](#11-ricerche-da-completare)
- [12. Data Pipeline Architecture — Come i Top Player Iniettano Dati nei Modelli](#12-data-pipeline-architecture--come-i-top-player-iniettano-dati-nei-modelli)
- [13. Behavioral & People Simulation — Modes & Architecture Analysis](#13-behavioral--people-simulation--modes--architecture-analysis)

> 140+ repo analizzati in 13 categorie. Ricerca completata 2026-03-27. Aggiornato 2026-04-07.

---

## 1. Simulation Engines & Scenario Planning
> Ricerca: 2026-03-27 | Fonte: GitHub search

### TIER 1 — Altamente rilevanti (500+ stars)

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 1 | **MiroFish** | [github.com/666ghj/MiroFish](https://github.com/666ghj/MiroFish) | ~35,000 | Python | Swarm intelligence prediction engine. Simula comportamenti collettivi con migliaia di agenti per predire scenari. Basato su OASIS di CAMEL-AI. | Si — injection layer per dati reali | ALTISSIMA — architettura multi-agente, reporting, interfaccia interattiva. Forkabile. |
| 2 | **Mesa** | [github.com/mesa/mesa](https://github.com/mesa/mesa) | ~3,600 | Python | Framework ABM (Agent-Based Modeling) — lo standard de facto Python. Visualizzazione browser-based, data collection, GIS. | Si — example model library | ALTA — engine backend maturo, ben documentato. |
| 3 | **OASIS (CAMEL-AI)** | [github.com/camel-ai/oasis](https://github.com/camel-ai/oasis) | ~2,100 | Python | Multi-agent social simulation fino a 1M agenti. 23 azioni (follow, comment, repost). Recommendation algorithms integrati. | Si — simula piattaforme social con dati reali | Forkabile. Ottimo per simulazioni sociali su larga scala. |
| 4 | **HASH** | [github.com/hashintel/hash](https://github.com/hashintel/hash) | ~1,400 | Rust/TS | Piattaforma open-source per knowledge graphs e simulazione multi-agente. Browser-based, entity graphs. | Si — hIndex community con datasets, behaviours, agent schemas | Forkabile ma complesso. Buono per ispirazione architetturale. |
| 5 | **SALib** | [github.com/SALib/SALib](https://github.com/SALib/SALib) | ~968 | Python | Sensitivity Analysis Library — Sobol, Morris, FAST. Essenziale per what-if analysis quantitativa. | No, ma genera dati di analisi | Utile per sensitivity/what-if analysis. |
| 6 | **AgentMaps** | [github.com/noncomputable/AgentMaps](https://github.com/noncomputable/AgentMaps) | 946 | JavaScript | "Make social simulations on real maps!" ABM web con Leaflet. Agenti su mappe reali. | Dati GeoJSON, mappe reali | ALTA — web-based come noi. Approccio visivo (agenti su mappa). |
| 7 | **Agents.jl** | [github.com/JuliaDynamics/Agents.jl](https://github.com/JuliaDynamics/Agents.jl) | 887 | Julia | Framework ABM velocissimo. Schelling, flocking, predator-prey, SIR, opinion dynamics, forest fire. | Libreria modelli nella docs | MEDIA — modelli e meccaniche perfetti come ispirazione template. |
| 8 | **VMAS** | [github.com/proroklab/VectorizedMultiAgentSimulator](https://github.com/proroklab/VectorizedMultiAgentSimulator) | 542 | Python | Simulatore multi-agente differenziabile PyTorch. Navigation, transport, discovery. | Scenari con parametri configurabili | BASSA — troppo ML-focused. |

### TIER 2 — Rilevanti (50-500 stars)

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 9 | **AgentPy** | [github.com/jofmi/agentpy](https://github.com/jofmi/agentpy) | 375 | Python | Framework ABM moderno con analisi integrata. Grids, networks, spatial. | Modelli: opinion dynamics, epidemics, wealth inequality | MEDIA — buona fonte meccaniche. |
| 10 | **python_corona_simulation** | [github.com/paulvangentcom/python_corona_simulation](https://github.com/paulvangentcom/python_corona_simulation) | 293 | Python | Simulazione visiva COVID-19 con agenti che si muovono, si infettano, guariscono. Particelle animate. | Parametri epidemiologici realistici (R0, mortality, recovery) | ALTA — molto simile al nostro approccio visivo (particelle/persone). |
| 11 | **LLM-Agent-Based-Modeling** | [github.com/tsinghua-fib-lab/LLM-Agent-Based-Modeling-and-Simulation](https://github.com/tsinghua-fib-lab/LLM-Agent-Based-Modeling-and-Simulation) | 263 | — | Raccolta paper e risorse su ABM powered by LLM. Survey completo del campo. | Lista curata paper, framework, benchmark | ALTA — risorsa strategica. Mappa tutto il campo emergente LLM+ABM. |
| 12 | **mesa-examples** | [github.com/mesa/mesa-examples](https://github.com/mesa/mesa-examples) | 239 | Python | **30+ modelli ABM pronti**: Boltzmann wealth, Schelling, forest fire, wolf-sheep, epidemic SIR, bank reserves, El Farol bar, Sugarscape. | **GOLDMINE — ogni modello ha dati, parametri, e visualizzazione** | ALTISSIMA — ogni esempio = un potenziale template per il Simulator. |
| 13 | **krABMaga** | [github.com/krABMaga/krABMaga](https://github.com/krABMaga/krABMaga) | 207 | Rust | Framework ABM ad alte prestazioni. Flock, epidemic, forest fire, Schelling. | Modelli con parametri configurabili. Viz web. | MEDIA — reference per performance. |
| 14 | **evoplex** | [github.com/evoplex/evoplex](https://github.com/evoplex/evoplex) | 146 | C++ | ABM su network. Modelli evolutivi, game theory, epidemics su grafi. | Plugin: prisoner dilemma, voter model, SIS epidemic | MEDIA — meccaniche su grafi vicine a React Flow. |
| 15 | **simulation (Insight Maker)** | [github.com/scottfr/simulation](https://github.com/scottfr/simulation) | 139 | JavaScript | Libreria JS per System Dynamics + ABM. Gira in browser e Node. | Stock-flow, agent states, transizioni | ALTA — JS, browser, la piu vicina al nostro stack. NPM integrabile. |
| 16 | **Insight Maker** | [github.com/scottfr/insightmaker](https://github.com/scottfr/insightmaker) | ~132 | JavaScript | System Dynamics + ABM + Differential Equations nel browser. Web-based e gratuito. | Modelli condivisi dalla community | ALTA — web-based, open-source, visual modeling. |
| 17 | **agentscript** | [github.com/backspaces/agentscript](https://github.com/backspaces/agentscript) | 120 | JavaScript | ABM in JS ispirato a NetLogo. Agenti, patch, link. Browser con Canvas/WebGL. | Modelli: flocking, diffusion, fire, ants | ALTA — JS, browser-based, visual. Reference architetturale. |
| 18 | **COVID19_AgentBasedSimulation** | [github.com/petroniocandido/COVID19_AgentBasedSimulation](https://github.com/petroniocandido/COVID19_AgentBasedSimulation) | 89 | Python | COVID-ABS: ABM con effetti sanitari e economici del social distancing. | Dati epidemiologici + economici | MEDIA — dual-track health+economics per template trade-off. |
| 19 | **CompeteAI (Microsoft)** | [github.com/microsoft/competeai](https://github.com/microsoft/competeai) | 84 | Python | ICML 2024 Oral. Simulazione societa con LLM agents. Competizione, cooperazione. | Scenari competizione/cooperazione tra agenti LLM | ALTA — Microsoft Research, meccaniche business/market. |
| 20 | **ASSUME** | [github.com/assume-framework/assume](https://github.com/assume-framework/assume) | 81 | Python | ABM per mercati energetici. Bidding, trading, market evolution. | Dataset mercati energetici, strategie bidding | MEDIA — meccaniche di mercato per template economici. |

### TIER 3 — Nicchia ma interessanti

| # | Nome | URL | Stars | Lang | Descrizione | Utilita |
|---|------|-----|-------|------|-------------|---------|
| 21 | **SimScript** | [github.com/Bernardo-Castilho/SimScript](https://github.com/Bernardo-Castilho/SimScript) | ~50-100 | TypeScript | DES con async/await. Animazioni 2D/3D, network, statistiche. | MEDIA — TypeScript nativo, si integra col nostro stack. |
| 22 | **CLD (Causal Loop)** | [github.com/schucan/CLD](https://github.com/schucan/CLD) | Basse | Web | Web app per Causal Loop Diagrams — Systems Thinking. | BASSA — componente UI per relazioni causali. |
| 23 | **js-simulator** | [github.com/chen0040/js-simulator](https://github.com/chen0040/js-simulator) | ~50 | JavaScript | DES multiagent in JS puro. | BASSA — leggero, forkabile. |
| 24 | **Lineo-PM** | [github.com/lines-labs/lineo-pm](https://github.com/lines-labs/lineo-pm) | Nuovo | TypeScript | Decision-driven planning con Monte Carlo + scenario modeling. | MEDIA — what-if su timeline progettuali. |
| 25 | **Forecast Factory** | [github.com/AmirhosseinHonardoust/Forecast-Factory](https://github.com/AmirhosseinHonardoust/Forecast-Factory) | Nuovo | Python | AI forecasting + what-if scenarios. Prophet + SQL. | BASSA — ispirazione UX what-if dashboards. |
| 26 | **sf_abm** | [github.com/cb-cities/sf_abm](https://github.com/cb-cities/sf_abm) | 41 | Python | Traffic ABM per San Francisco. | BASSA |
| 27 | **mastodon-sim** | [github.com/sandbox-social/mastodon-sim](https://github.com/sandbox-social/mastodon-sim) | 25 | Python | Generative Agent simulation social network Mastodon. | MEDIA — social sim con LLM |
| 28 | **extropy** | [github.com/exaforge/extropy](https://github.com/exaforge/extropy) | 24 | Python | Predictive intelligence through population simulation. | MEDIA — population prediction |
| 29 | **world-synth** | [github.com/kenjinp/world-synth](https://github.com/kenjinp/world-synth) | 13 | TypeScript | Crea mondi con simulazione tettonica, clima, popolazione. | MEDIA — TypeScript, population sim |
| 30 | **IdealWorld** | [github.com/HuanfuLi/IdealWorld](https://github.com/HuanfuLi/IdealWorld) | 2 | TypeScript | Multi-agent society sim con LLM, motore fisico neuro-simbolico. | MEDIA — TypeScript + LLM |

---

## 2. Palantir Open Source & Alternative

> Nota: la ricerca Palantir-specifica ha colpito rate limit. Dati parziali da agent 1.

**Palantir repos pubblici**: [palantir.github.io](https://palantir.github.io/) — hanno decine di repo open-source ma sono tools infrastrutturali (Java/Go), non simulatori. I piu noti:
- `blueprint` — UI toolkit React (architettura componenti)
- `osdk-ts` — TypeScript SDK per Foundry
- `foundry-platform-typescript` — API client

**Alternative open-source a Palantir citate**:
- Fonte: [Medium — Demystifying Palantir](https://dashjoin.medium.com/demystifying-palantir-features-and-open-source-alternatives-ed3ed39432f9)
- HASH (gia in lista sopra) e il piu vicino come concept

---

## 3. System Dynamics & Causal Loop Tools
> Ricerca: 2026-03-28 | Fonte: GitHub search

### TIER 1 — Altamente rilevanti (logica riutilizzabile + visual)

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 1 | **ncase/loopy** | [github.com/ncase/loopy](https://github.com/ncase/loopy) | ~1,700 | JS | Tool interattivo per "pensare in sistemi" — disegni nodi, connessioni con polarita (+/-), simuli feedback loop in tempo reale. Public domain. | Modelli embeddabili via URL | ALTISSIMA — public domain, JS vanilla, logica feedback loop estraibile. Concettualmente identico al nostro sistema a particelle. |
| 2 | **scottfr/simulation** | [github.com/scottfr/simulation](https://github.com/scottfr/simulation) | ~125 | JS | Libreria JS per System Dynamics (Stock & Flow), equazioni differenziali e ABM. Primitives: Stock, Flow, Variable. | Formato ModelJSON + modelli esempio | ALTISSIMA — NPM package, API pulita, usabile nel browser. La logica Stock/Flow/Variable e il cuore di qualsiasi simulatore a nodi. |
| 3 | **bpowers/simlin** | [github.com/bpowers/simlin](https://github.com/bpowers/simlin) | ~100 | TS/Rust | Editor browser-based per modelli SD. Importa Vensim/XMILE, esporta XMILE. Diagrammi + editor embeddabili. | Importa modelli Vensim e XMILE | MEDIA — stack complesso (Rust+TS+WASM), ma componenti diagram/editor in React/TS riutilizzabili. |
| 4 | **SDEverywhere** | [github.com/climateinteractive/SDEverywhere](https://github.com/climateinteractive/SDEverywhere) | ~90 | JS/C/WASM | Transpiler: converte modelli Vensim in C, JS e WASM. Plugin system (Vite, WASM). MIT. | Modelli Vensim come input. Climate Interactive ha molti modelli pubblici. | MEDIA — utile per importare modelli Vensim nel simulatore. Runtime JS riutilizzabile. |

### TIER 2 — Utili per componenti specifici

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 5 | **ncase/simulating** | [github.com/ncase/simulating](https://github.com/ncase/simulating) | ~500 | JS | "Interactive guide to thinking in systems" — tutorial interattivo con simulazioni embedded. Public domain. | Simulazioni educative (epidemie, ecosistemi, feedback) | ALTA — pattern narrativi di simulazione. Ottima fonte per template educativi. |
| 6 | **SDXorg/pysd** | [github.com/SDXorg/pysd](https://github.com/SDXorg/pysd) | ~350 | Python | Esegue modelli SD in Python. Integrazione Big Data e ML. | Legge formati Vensim (.mdl) e XMILE | BASSA frontend, ma ALTA come fonte dataset. |
| 7 | **minsky** | [github.com/highperformancecoder/minsky](https://github.com/highperformancecoder/minsky) | ~200 | C++ | Software desktop per modellare flussi economici con SD. Python scripting. | Modelli economici (Keen, Godley) | BASSA web, ma modelli economici e logica utili come reference. |
| 8 | **SDXorg/test-models** | [github.com/SDXorg/test-models](https://github.com/SDXorg/test-models) | ~50 | Multi | **Collezione standardizzata di modelli SD** in vari formati con output canonici. | SI — LA fonte di dataset SD di riferimento | ALTISSIMA come fonte dati. Modelli semplici e complessi con output attesi. |
| 9 | **MunGell/insightmaker** | [github.com/MunGell/insightmaker](https://github.com/MunGell/insightmaker) | ~50 | JS | Open-source di InsightMaker.com: SD + ABM nel browser. | Migliaia di modelli su insightmaker.com | MEDIA — legacy ma logica simulazione completa. |
| 10 | **SDXorg/SD-Tools** | [github.com/SDXorg/SD-Tools](https://github.com/SDXorg/SD-Tools) | ~40 | MD | Lista curata di TUTTI i tool SD open source — meta-risorsa. | No | ALTA come indice per scoprire altri progetti. |
| 11 | **schucan/CLD** | [github.com/schucan/CLD](https://github.com/schucan/CLD) | ~30 | JS | Web app leggera per Causal Loop Diagrams. Basata su Loopy. | No | ALTA — super leggera, facile da integrare. |

### TIER 3 — Diagramming adattabile

| # | Nome | URL | Stars | Lang | Descrizione |
|---|------|-----|-------|------|-------------|
| 12 | **mermaid-js/mermaid** | [github.com/mermaid-js/mermaid](https://github.com/mermaid-js/mermaid) | ~73,000 | JS | Diagrammi da testo. CLD non supportato ma feature request aperta. |
| 13 | **alyssaxuu/flowy** | [github.com/alyssaxuu/flowy](https://github.com/alyssaxuu/flowy) | ~11,000 | JS | Libreria minimale per flowchart drag-and-drop. |

---

## 4. Raccomandazioni operative

### TOP 5 — Da esplorare subito per il Simulator v2

| Priorita | Repo | Perche |
|----------|------|--------|
| 1 | **mesa-examples** | 30+ modelli con parametri pronti. Ogni modello = un template. Schelling, SIR, wealth, forest fire. |
| 2 | **scottfr/simulation** | Libreria JS per ABM nel browser. Direttamente integrabile come NPM package nel nostro Next.js. |
| 3 | **MiroFish** | 35K stars. Architettura multi-agente con injection dati reali. Studiare come inietta dati nelle simulazioni. |
| 4 | **agentscript** | JS/Canvas ABM ispirato a NetLogo. Reference architetturale per simulazioni visual nel browser. |
| 5 | **LLM-Agent-Based-Modeling (Tsinghua)** | Survey completo del campo LLM+ABM. Conferma che il nostro approccio e un trend di ricerca caldo. |

### Da forkare / prendere dati

| Repo | Cosa prendere |
|------|---------------|
| **mesa-examples** | Parametri e meccaniche di 30+ modelli ABM classici. Tradurre in JSON per i nostri template. |
| **python_corona_simulation** | Parametri epidemiologici realistici. Meccaniche visive particelle. |
| **OASIS** | Meccaniche social simulation (follow, post, comment). Template "social media effect". |
| **CompeteAI** | Meccaniche competizione/cooperazione. Template "market competition". |
| **ASSUME** | Meccaniche mercato energetico (bidding, supply/demand). Template economics. |

---

## 5. Meccaniche da portare nei template

Modelli classici ABM che possiamo tradurre in nodi del Simulator:

| Modello | Meccanica | Template potenziale |
|---------|-----------|---------------------|
| **Schelling segregation** | Scelte individuali che creano pattern macro | Housing, gentrification, social bubbles |
| **SIR epidemic** | Contagio, recovery, immunita | Disease spread, viral marketing, misinformation |
| **Boltzmann wealth** | Come la ricchezza si concentra | Wealth inequality, startup ecosystem |
| **Opinion dynamics** | Come le opinioni cambiano in popolazione | Elections, social media polarization |
| **El Farol bar** | Decisioni con informazione limitata | Market timing, restaurant choice, traffic |
| **Prisoner's dilemma** | Cooperazione vs competizione | Business partnerships, international trade |
| **Forest fire** | Propagazione e soglie critiche | Wildfire, viral content, market crashes |
| **Wolf-sheep predation** | Equilibrio predatore-preda | Market competition, ecosystem balance |
| **Sugarscape** | Risorse, migrazione, commercio | Immigration, resource wars, trade routes |

---

## 6. Scenario Datasets per template (JSON/CSV)
> Ricerca: 2026-03-27 — vedi output completo nella risposta chat del 27/03

Risultati salvati in chat. 21 dataset trovati in 3 tier + TOP 5 prioritizzati.
Dettaglio completo nella risposta conversazione (troppo lungo per markdown table in doc).

**Quick reference TOP 5:**
1. Choices13k (JSON, 13K decision problems) — github.com/jcpeterson/choices13k
2. BLS Occupational API (JSON, 830+ jobs) — bls.gov/bls/api_features.htm
3. SSA Life Table (CSV, mortality by age) — ssa.gov/oact/STATS/table4c6.html
4. Opportunity Insights (CSV, social mobility) — opportunityinsights.org/data
5. O*NET (CSV/JSON-LD, 923 occupations) — onetcenter.org/database.html

---

---

## 8. AI/LLM-Powered Scenario & Simulation Projects (GitHub)
> Ricerca: 2026-03-27 | Query: "AI scenario generator", "LLM simulation", "AI what-if generator", "GPT simulator", "AI decision simulator", "generative simulation", "AI powered simulation", "claude simulation"

### TIER 1 — Major Projects (1,000+ stars)

| # | Name | URL | Stars | Lang | Description | How it uses AI | Datasets | Forkability |
|---|------|-----|-------|------|-------------|----------------|----------|-------------|
| 1 | **Generative Agents (Stanford)** | [github](https://github.com/joonspk-research/generative_agents) | ~17K | Python | "Interactive Simulacra of Human Behavior" — seminal paper. 25 agents in Smallville with memory, planning, relationships. | GPT-3.5/4 reflection-planning-action loop. Memory stream + retrieval + reflection. | Smallville map, agent profiles, observation logs | HIGH — founding paper of LLM simulation. |
| 2 | **AI Town (a16z)** | [github](https://github.com/a16z-infra/ai-town) | ~8K+ | TypeScript | MIT-licensed starter kit. AI characters live, chat, socialize in a virtual town. JS/TS framework. | LLM generates agent conversations, decisions, social interactions in real-time. | Character definitions, map layouts, conversation seeds | VERY HIGH — TypeScript, closest to our stack. |
| 3 | **Microsoft TinyTroupe** | [github](https://github.com/microsoft/TinyTroupe) | ~7.3K | Python | Multiagent persona simulation for business insights. TinyPersons with specific personalities in TinyWorlds. | GPT-4 generates realistic behavior. Parallel agent execution. | Agent persona definitions (JSON), configurable environments | HIGH — Microsoft-backed, business scenario modeling. |
| 4 | **AgentVerse (OpenBMB)** | [github](https://github.com/OpenBMB/AgentVerse) | ~4.7K | Python | Multi-agent framework: task-solving + simulation. Classroom, Prisoner's Dilemma, Software Design. | LLM agents collaborate/compete. Supports GPT-4, Claude. | Scenario configs (classroom, game theory, code review) | HIGH — modular, active community. |
| 5 | **OASIS (CAMEL-AI)** | [github](https://github.com/camel-ai/oasis) | ~2.4K | Python | Social media simulator up to 1M agents. 23 actions. Simulates Twitter/Reddit dynamics. | LLM + rule-based agents. Studies polarization, herd behavior. | Social network configs, recommendation algorithms | HIGH — massive scale. |
| 6 | **GPTeam** | [github](https://github.com/101dotxyz/GPTeam) | ~1.6K | Python | Open-source multi-agent sim. Agents with memory move, speak, collaborate. | GPT-4/3.5, also supports Claude. | World configs (JSON), agent personalities | HIGH — simple, clear, multi-LLM. |

### TIER 2 — Significant Projects (100-1,000 stars)

| # | Name | URL | Stars | Lang | Description | How it uses AI | Datasets | Forkability |
|---|------|-----|-------|------|-------------|----------------|----------|-------------|
| 7 | **WarAgent** | [github](https://github.com/agiresearch/WarAgent) | ~405 | Python | Multi-Agent Simulation of World Wars (WWI, WWII, Warring States). | GPT-4 / Claude-2 simulate country decisions, diplomacy. | Historical conflict data, country profiles | MEDIUM |
| 8 | **Project Sid (Altera)** | [github](https://github.com/altera-al/project-sid) | ~300+ | Python | 10-1000+ agents in Minecraft develop roles, rules, culture, religion. | PIANO architecture — real-time emergent social structures. | Minecraft world configs, agent seeds | MEDIUM |
| 9 | **GPT-World** | [github](https://github.com/ShengdingHu/GPT-World) | ~200+ | Python | Sandbox world sim with JSON config. Deprecated. | GPT + reflection-summary-plan framework. | JSON world configs, agent definitions | LOW — deprecated. |
| 10 | **G-Sim** | [github](https://github.com/samholt/generative-simulations) | ~100+ | Python | ICML 2025. LLM auto-builds simulators + gradient-free calibration. | LLM proposes/refines simulator components and causal relationships. | Domain-specific calibration data | MEDIUM — "LLM builds the simulator" = what we do. |
| 11 | **SimulateGPT** | [github](https://github.com/OpenBioLink/SimulateGPT) | ~100+ | Python | LLMs as universal biomedical simulators. No explicit domain model. | LLM reasoning IS the simulation engine. | Biomedical scenarios | LOW — bio-specific. Validates concept. |
| 12 | **GPT-Simulator** | [github](https://github.com/cognitiveailab/GPT-simulator) | ~100+ | Python | "Can LMs Serve as Text-Based World Simulators?" | GPT predicts state transitions in game environments. | Text adventure states | LOW — research code. |
| 13 | **MicroSims** | [github](https://github.com/dmccreary/microsims) | ~100+ | JS | 100+ educational sims made with GenAI + p5.js. | ChatGPT/Claude generates the simulation code. AI creates, not powers. | YAML metadata, lesson plans | HIGH — "AI generates the sim" = our approach. |
| 14 | **MiroFish (fork)** | [github](https://github.com/amadad/mirofish) | ~100+ | Python | Prediction engine + scenario sim. Knowledge graph + agent personas. | LLM agents simulate social media interactions. Supports Claude. | Social media data, agent configs | MEDIUM |
| 15 | **CompeteAI (MS)** | [github](https://github.com/microsoft/competeai) | ~84 | Python | ICML 2024 Oral. LLM agents in competitive/cooperative society sim. | LLM drives agent strategy. | Competition/cooperation configs | MEDIUM |

### TIER 3 — Reference Collections

| # | Name | URL | Description |
|---|------|-----|-------------|
| 16 | **LLM-Agents-for-Simulation** | [github](https://github.com/giammy677dev/LLM-Agents-for-Simulation) | Curated papers on LLM + simulation. |
| 17 | **LLM-Agent-Based-Modeling (Tsinghua)** | [github](https://github.com/tsinghua-fib-lab/LLM-Agent-Based-Modeling-and-Simulation) | Survey of LLM-powered ABM. |
| 18 | **Awesome-LLM-Human-Simulation** | [github](https://github.com/Persdre/llm-human-simulation) | ICLR 2025. LLM simulating human behavior. |
| 19 | **GenAgents (Stanford HCI)** | [github](https://github.com/joonspk-research/genagents) | Simulates real individuals from 2,000 hours of interviews. |

### Pattern Analysis

**3 approcci distinti:**
1. **LLM-as-Agent**: LLM = cervello di ogni agente (Generative Agents, TinyTroupe, AgentVerse, AI Town, GPTeam, WarAgent)
2. **LLM-as-Simulator-Engine**: LLM ragiona/predice outcome senza modello esplicito (SimulateGPT, GPT-Simulator, **Simulator v2**)
3. **LLM-as-Builder**: LLM genera struttura/codice della simulazione (G-Sim, MicroSims, **Simulator v2**)

**Simulator v2 combina approcci 2+3** — Claude genera la struttura (nodi, connessioni, dati) e ragiona sugli outcome. Nessun altro progetto fa "visual node-based scenario simulation powered by LLM generation" con React Flow.

**Gap nel mercato (nessuno lo fa):**
- Visual/graph-based scenario simulation con LLM (React Flow + AI) -- **noi**
- Consumer-facing "what-if" tool (tutti sono research/enterprise)
- Template-driven scenario library con dati reali
- Mobile-friendly simulation canvas

## 8. Life Simulators, Decision Simulators & Financial Life Tools
> Ricerca: 2026-03-27 | Fonte: GitHub search + WebSearch

### TIER 1 — Direttamente rilevanti per visual node-based life simulator

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 1 | **react-d3-tree** | [github.com/bkrem/react-d3-tree](https://github.com/bkrem/react-d3-tree) | ~1,100+ | TS/React | React component per grafi ad albero interattivi con D3. Custom node rendering, collapse/expand. | No — accetta JSON tree | ALTISSIMA — componente React pronto per decision tree. |
| 2 | **Parallel Lives** | [github.com/Wrttnspknbrkn/parallel-lives](https://github.com/Wrttnspknbrkn/parallel-lives) | Nuovo | Node.js | AI-powered alternate reality simulator. Input: career, location, decisions. Output: branching timelines + grafici + 3D. OpenAI + Supabase. | No — genera via AI | ALTISSIMA — concetto quasi identico al nostro Simulator. Competitor diretto. |
| 3 | **cFIREsim-open** | [github.com/boknows/cFIREsim-open](https://github.com/boknows/cFIREsim-open) | ~180+ | JavaScript | Retirement simulator. Dati storici stock/bond/gold/inflazione 1871-present. | SI — dataset 1871-present | ALTA — dataset finanziari per template retirement/FIRE. |
| 4 | **decision-tree-builder** | [github.com/danwild/decision-tree-builder](https://github.com/danwild/decision-tree-builder) | ~90+ | JS/D3 | Costruttore visuale decision tree con D3.js v4. Flowchart-style, JSON serializzabile. | No — produce JSON | ALTA — UX reference per "create your own simulation". |
| 5 | **decision-tree-maker** | [github.com/damienld22/decision-tree-maker](https://github.com/damienld22/decision-tree-maker) | ~30+ | React | React component library per decision tree visuale. | No | MEDIA — forkabile per editor template. |

### TIER 2 — BitLife clones & life simulation games

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 6 | **OpenLife** | [github.com/WinFan3672/OpenLife](https://github.com/WinFan3672/OpenLife) | ~120+ | Python | Open-source BitLife. Career, relationships, health, crime. | SI — life events, career paths, probabilita | ALTA — dataset eventi vita estraibili. |
| 7 | **Life-Simulator1** | [github.com/fungamer2-2/Life-Simulator1](https://github.com/fungamer2-2/Life-Simulator1) | ~60+ | Python | BitLife clone. MIT. Life events, aging, multi-lingua. | SI — age-based probabilities | MEDIA |
| 8 | **PyLife** | [github.com/2003lxp/PyLife](https://github.com/2003lxp/PyLife) | ~20+ | Python | BitLife clone. Career, education, relationships. | Parziale | BASSA |
| 9 | **BitSim** | [github.com/dolnuea/BitSim](https://github.com/dolnuea/BitSim) | ~10+ | Java/FX | Life sim GUI desktop. | Parziale | BASSA |
| 10 | **life.html** | [github.com/Krobix/life.html](https://github.com/Krobix/life.html) | ~5 | HTML/JS | BitLife in un file HTML. | No | BASSA |

### TIER 3 — Financial simulators & FIRE calculators

| # | Nome | URL | Stars | Lang | Descrizione | Dataset? | Utilita |
|---|------|-----|-------|------|-------------|----------|---------|
| 11 | **fire-calculator** | [github.com/kenrogers/fire-calculator](https://github.com/kenrogers/fire-calculator) | ~50+ | TS/Next.js | FIRE calculator. Next.js + Tailwind. | No | MEDIA — stesso stack. |
| 12 | **wenfire** | [github.com/basnijholt/wenfire](https://github.com/basnijholt/wenfire) | ~40+ | Python | FIRE calculator con visualizzazioni. | No | BASSA |
| 13 | **fire-dashboard** | [github.com/matthewsmorrison/fire-dashboard](https://github.com/matthewsmorrison/fire-dashboard) | ~30+ | JS | Dashboard metriche FIRE. | No | BASSA |
| 14 | **MonteCarlo_simulation** | [github.com/mmsaki/MonteCarlo_simulation](https://github.com/mmsaki/MonteCarlo_simulation) | ~20+ | Python | Retirement sim Monte Carlo. | SI — stock data | MEDIA |
| 15 | **montecarlo-portfolio** | [github.com/cristianleoo/montecarlo-portfolio-management](https://github.com/cristianleoo/montecarlo-portfolio-management) | ~30+ | Python/Streamlit | Portfolio Monte Carlo + Streamlit UI. | SI | MEDIA |

### TIER 4 — Interactive fiction & branching narratives

| # | Nome | URL | Stars | Lang | Descrizione | Utilita |
|---|------|-----|-------|------|-------------|---------|
| 16 | **awesome-interactive-fiction** | [github.com/tajmone/awesome-interactive-fiction](https://github.com/tajmone/awesome-interactive-fiction) | ~199 | List | Lista curata IF: Twine, Ink, Inform. | MEDIA |
| 17 | **iffy** | [github.com/indraastra/iffy](https://github.com/indraastra/iffy) | Nuovo | — | IF engine AI-powered + branching. | MEDIA |
| 18 | **react-decision-tree-flow** | [github.com/rjerue/react-decision-tree-flow](https://github.com/rjerue/react-decision-tree-flow) | ~40+ | React | Declarative decision tree/wizard. | MEDIA |

### TIER 5 — Research & Papers

| # | Nome | URL | Tipo | Descrizione | Utilita |
|---|------|-----|------|-------------|---------|
| 19 | **WHAT-IF** | [arxiv.org/html/2412.10582](https://arxiv.org/html/2412.10582) | Paper | Zero-shot meta-prompting per branching narratives coerenti. | ALTA — tecnica prompting per Haiku. |
| 20 | **AI Life Simulator (PingCAP)** | [pingcap.com/blog](https://www.pingcap.com/blog/build-ai-powered-life-simulator-embeddings-branching-tidb/) | Blog | AI life sim: ogni nodo = 6 dimensioni di vita. | ALTA — "6 dimensions per node" per SimNode. |

---

## 9. Raccomandazioni — Life Simulator specifiche

### TOP 5 da esplorare

| Priorita | Repo | Azione |
|----------|------|--------|
| 1 | **Parallel Lives** | Competitor diretto. Studiare architettura e UX branching timelines. |
| 2 | **OpenLife** | Estrarre dataset: life events, career paths, probabilita per eta -> JSON per template. |
| 3 | **cFIREsim-open** | Estrarre dataset storico 1871-present. Template retirement/investment/FIRE. |
| 4 | **decision-tree-builder** | UX reference per feature "create your own simulation". |
| 5 | **WHAT-IF paper** | Meta-prompting in generate/route.ts per branching outcomes coerenti. |

### Dataset estraibili

| Fonte | Dati | Template target |
|-------|------|-----------------|
| **OpenLife** | Life events, career paths, age probabilities | Life choices, career, relationships, health |
| **cFIREsim-open** | Stock/bond/gold/CPI 1871-present | Retirement, FIRE, investment, inflation |
| **Life-Simulator1** | Life events con probabilita | Life milestones, aging, education |
| **PingCAP tutorial** | 6 life dimensions framework | SimNode 6D: financial, emotional, professional, social, health, personal |

---

## 10. React Flow Projects — Simulators, Workflow Engines, Scenario Tools
> Ricerca: 2026-03-27 | Fonte: GitHub gh CLI (star count verificati), WebSearch, reactflow.dev/showcase

### TIER 1 — Massivi (10K+ stars) — Workflow Engines che usano React Flow

| # | Nome | URL | Stars | Stack | Descrizione | Dataset? | Forkabile/Riutilizzabile? |
|---|------|-----|-------|-------|-------------|----------|---------------------------|
| 1 | **n8n** | [github.com/n8n-io/n8n](https://github.com/n8n-io/n8n) | 181,390 | TS/Vue | Workflow automation platform con native AI capabilities. 400+ integrazioni, visual builder, self-host o cloud. USA React Flow per il canvas nodi. | Si — 400+ connector, template library | Componenti workflow engine riutilizzabili. Architettura node execution reference. Fair-code license. |
| 2 | **Langflow** | [github.com/langflow-ai/langflow](https://github.com/langflow-ai/langflow) | 146,311 | Python/React | UI per LangChain — drag & drop per costruire AI agent workflows. React Flow canvas. Esporta JSON. | Si — componenti LangChain, modelli esportabili | ALTA — architettura nodo-connessione molto simile alla nostra. MIT license. |
| 3 | **Dify** | [github.com/langgenius/dify](https://github.com/langgenius/dify) | 134,741 | TS/Python | Piattaforma agentic workflow. Visual workflow builder con React Flow. RAG, agents, tools. | Si — template workflows, knowledge bases | ALTA — UI workflow builder di altissimo livello. Studio dell'UX nodi. |
| 4 | **ComfyUI** | [github.com/comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI) | 107,143 | Python/JS | GUI nodi per Stable Diffusion. Usa litegraph (non React Flow), ma architettura nodi identica. | Si — workflow JSON condivisibili | MEDIA — non React Flow, ma il benchmark UX per node-based UI. |
| 5 | **Flowise** | [github.com/FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) | 51,152 | TS/React | Build AI Agents visually. React Flow canvas, LangChain.js backend. Chatflow + Agentflow. | Si — template pronti, marketplace componenti | ALTA — React + React Flow, molto vicino al nostro stack. MIT license. |
| 6 | **DrawDB** | [github.com/drawdb-io/drawdb](https://github.com/drawdb-io/drawdb) | 36,991 | React | Database diagram editor con React Flow. SQL generator. | Si — schema esportabili | MEDIA — UX nodi-connessione pulitissima. Reference per UI. |
| 7 | **React Flow (xyflow)** | [github.com/xyflow/xyflow](https://github.com/xyflow/xyflow) | 35,864 | TS/React | LA libreria base. Node-based UIs per React e Svelte. MIT license. | Pro examples, showcase | E' gia il nostro foundation. Aggiornare a v12.8+. |
| 8 | **Node-RED** | [github.com/node-red/node-red](https://github.com/node-red/node-red) | 22,966 | JS | Low-code per event-driven apps. Non usa React Flow (custom canvas), ma paradigma identico. | Si — migliaia di flow nella library | MEDIA — reference architetturale per flow execution engine. |

### TIER 2 — Medi (100-10K stars)

| # | Nome | URL | Stars | Stack | Descrizione | Dataset? | Forkabile/Riutilizzabile? |
|---|------|-----|-------|-------|-------------|----------|---------------------------|
| 9 | **Reaflow** | [github.com/reaviz/reaflow](https://github.com/reaviz/reaflow) | 2,478 | TS/React | Libreria React per workflow editors, flow charts, diagrams. Alternativa a React Flow. | No | BASSA — alternativa, non complementare. |
| 10 | **Reagraph** | [github.com/reaviz/reagraph](https://github.com/reaviz/reagraph) | 1,000 | TS/React | WebGL graph visualizations per React. 3D graph rendering. | No | MEDIA — per upgrade futuro a visualizzazione 3D. |
| 11 | **Tersa** | [github.com/vercel-labs/tersa](https://github.com/vercel-labs/tersa) | 958 | Next.js/React | Open source canvas per AI workflows. Vercel AI SDK + React Flow + TipTap. Next.js 15, React 19, shadcn/ui. | Si — 220 modelli da 36 provider AI | ALTISSIMA — stack quasi identico al nostro (Next.js + React Flow + Tailwind + shadcn). Forkabile. MIT. |
| 12 | **Automation-workflow** | [github.com/Azim-Ahmed/Automation-workflow](https://github.com/Azim-Ahmed/Automation-workflow) | 300 | React | Raccolta esempi React Flow: workflow automations, custom nodes, edge types. | Si — esempi pronti | ALTA — copypaste components direttamente. |
| 13 | **simulation (scottfr)** | [github.com/scottfr/simulation](https://github.com/scottfr/simulation) | 139 | JS | System Dynamics + ABM in browser. Stock-Flow-Variable. NPM package. | Modelli SD integrati | ALTA — engine di simulazione JS, integrabile con React Flow. |
| 14 | **remix-workflows** | [github.com/AlexandroMtzG/remix-workflows](https://github.com/AlexandroMtzG/remix-workflows) | 103 | Remix/React | Workflow builder con Remix, React Flow, Prisma, Tailwind. | No | MEDIA — reference stack simile. |

### TIER 3 — Nicchia ma rilevanti

| # | Nome | URL | Stars | Stack | Descrizione | Riutilizzabile? |
|---|------|-----|-------|-------|-------------|-----------------|
| 15 | **react-decision-tree-flow** | [github.com/rjerue/react-decision-tree-flow](https://github.com/rjerue/react-decision-tree-flow) | 49 | React | Decision tree / wizard dichiarativo per React e React Native. | MEDIA — logica decision tree. |
| 16 | **react-flow-builder** | [github.com/1Madgeek/react-flow-builder](https://github.com/1Madgeek/react-flow-builder) | 27 | React | Lightweight flow builder per AI automation, business process. | BASSA — troppo semplice. |
| 17 | **React-Flow-Tree-Boilerplate** | [github.com/Bosh-Kuo/React-Flow-Tree-Boilerplate](https://github.com/Bosh-Kuo/React-Flow-Tree-Boilerplate) | 12 | React | Boilerplate per tree workflow con React Flow. Start/End/Branch nodes. | MEDIA — branching logic. |
| 18 | **Lineo-PM** | [github.com/lines-labs/lineo-pm](https://github.com/lines-labs/lineo-pm) | 8 | TS | Decision-driven planning con Monte Carlo + scenario modeling. What-if su timeline. | ALTA concettualmente — Monte Carlo + scenario = nostro dominio. |
| 19 | **dataflow-visualization** | [github.com/KNowledgeOnWebScale/dataflow-visualization](https://github.com/KNowledgeOnWebScale/dataflow-visualization) | 6 | React | Genera flow graphs da JSON/YAML con React Flow. | MEDIA — JSON-to-flow pipeline riutilizzabile. |

### Raccomandazioni — React Flow Projects per Simulator v2

**TOP 5 da studiare/forkare:**

| Priorita | Repo | Perche |
|----------|------|--------|
| 1 | **Tersa** (vercel-labs) | Stack quasi identico (Next.js + React Flow + Tailwind + shadcn). 958 stars. MIT. Canvas AI workflow. Forkare componenti UI e architettura nodi. |
| 2 | **Flowise** | 51K stars. React Flow + custom nodes + execution engine. Studiare come eseguono i flussi nodo per nodo (parallelo al nostro wave system). |
| 3 | **Langflow** | 146K stars. React Flow canvas con drag-drop. Studiare UX nodi, connessioni tipizzate, export JSON. |
| 4 | **Automation-workflow** | 300 stars. Raccolta esempi React Flow pronti. Copypaste custom nodes e edge types. |
| 5 | **Lineo-PM** | Solo 8 stars ma Monte Carlo + scenario modeling in TypeScript — concettualmente il piu vicino al nostro simulatore. |

**Componenti specifici da portare nel Simulator v2:**

| Componente | Fonte | Cosa prendere |
|------------|-------|---------------|
| Node execution engine | Flowise, n8n | Come eseguono nodi in sequenza/parallelo, gestione stato |
| Custom node UI | Tersa, Langflow | Design nodi con handle multipli, tipizzazione connessioni |
| JSON export/import | Langflow, dataflow-visualization | Schema JSON per salvare/caricare simulazioni |
| Monte Carlo simulation | Lineo-PM | Logica probabilistica per what-if scenarios |
| Workflow templates | Flowise, n8n | Pattern per template marketplace |
| Canvas UX | DrawDB, Tersa | Minimap, zoom, pan, selection, keyboard shortcuts |

---

## 11. Ricerche da completare

| Area | Status |
|------|--------|
| Decision tree visualization (React/JS) | DONE (sezioni 4, 8) |
| Life simulators / career simulators | DONE (sezione 8) |
| System dynamics / causal loop tools | DONE (sezione 3) |
| Scenario datasets (JSON/CSV) | DONE (sezione 6) |
| AI scenario generators (LLM-powered) | DONE (sezione 7) |
| React Flow-based simulators specifici | DONE (sezione 10 - 19 repo trovati) |
| Data visualization + simulation platforms | DONE (20 repo — ncase/trust 6K, Evidence 6K, Scrollama 6K, deck.gl 14K, nba-monte-carlo 597) |
| Palantir repos dettagliati + cloni | DONE (45+ repo — SpiderFoot 17K, OpenCTI 9K, Grafana 72K, Superset 71K, Sigma.js 12K, AntV G6 12K, OpenPlanter 1.5K) |

---

## 12. Data Visualization + Simulation Platforms
> Ricerca: 2026-03-28

### Explorable Explanations (piu vicini al Simulator)

| Repo | Stars | Descrizione | Valore |
|------|-------|-------------|--------|
| [ncase/trust](https://github.com/ncase/trust) | 6,179 | Game theory della cooperazione interattiva | **ALTO** — prova che explorable explanations scalano |
| [Scrollama](https://github.com/russellsamora/scrollama) | 5,961 | Scrollytelling (NYT, Pudding) | Pattern narrativi |
| [ncase/covid-19](https://github.com/ncase/covid-19) | 233 | Scenario simulation COVID con slider | **ALTO** — sim interattiva con parametri |
| [Idyll](https://github.com/idyll-lang/idyll) | 2,031 | Explorable explanations framework | Competitor concettuale |
| [Waveforms](https://github.com/joshwcomeau/waveforms) | 1,474 | Explorable explanation interattiva React | Pattern React |

### BI/Viz Platforms

| Repo | Stars | Descrizione | Valore |
|------|-------|-------------|--------|
| [deck.gl](https://github.com/visgl/deck.gl) | 14,003 | WebGL2 geospatial viz | Modulare, React-ready |
| [Evidence](https://github.com/evidence-dev/evidence) | 6,101 | BI-as-code (SQL + Markdown) | Template-friendly |
| [Vega-Lite](https://github.com/vega/vega-lite) | 5,251 | Grammatica dichiarativa chart | JSON specs, embeddable |
| [Observable](https://github.com/observablehq/framework) | 3,430 | Data app generator | Data loaders built-in |

### Simulation + Viz

| Repo | Stars | Descrizione | Valore |
|------|-------|-------------|--------|
| [nba-monte-carlo](https://github.com/matsonj/nba-monte-carlo) | 597 | Monte Carlo NBA con dbt + DuckDB | **ALTO** — fork+adapt a altri domini |
| [scottfr/simulation](https://github.com/scottfr/simulation) | 139 | SD + ABM in browser | **ALTO** — JS, integrabile |
| [manim](https://github.com/3b1b/manim) | 85,574 | Animazione math (3Blue1Brown) | Basso per web (video) |

---

## 13. GitHub Probability & Statistics Datasets
> Ricerca: 2026-03-28 | Obiettivo: trovare dataset pronti con probabilità reali da scaricare

### TOP 10 — Repo con dati scaricabili

| # | Repo | Stars | Dati | Formato | DP stimati | Licenza | Scaricato? |
|---|------|-------|------|---------|------------|---------|------------|
| 1 | [owid/owid-datasets](https://github.com/owid/owid-datasets) | 755 | 200+ dataset: mortalità, divorzio, fertilità, depressione, cancro, disastri, crimini, imprenditorialità per paese | CSV | 100K+ | CC-BY | NO — da fare |
| 2 | [fivethirtyeight/data](https://github.com/fivethirtyeight/data) | 17,323 | 120+ dataset: droghe per età, college majors + stipendi, sicurezza aerea, crimini, sport (NBA/NFL elo) | CSV | 50K+ | CC-BY 4.0 | NO — da fare |
| 3 | [owid/covid-19-data](https://github.com/owid/covid-19-data) | 5,657 | COVID giornaliero tutti i paesi: casi, morti, vaccini, eccesso mortalità | CSV+JSON | Milioni | CC-BY 4.0 | NO — utile per epidemie |
| 4 | [datasets/s-and-p-500](https://github.com/datasets/s-and-p-500) | 621 | S&P 500 storico | CSV | Migliaia | ODC | NO |
| 5 | [datasets/population](https://github.com/datasets/population) | 105 | Popolazione per paese 1960-oggi | CSV | 10K+ | ODC | NO |
| 6 | [datasets/gdp](https://github.com/datasets/gdp) | 87 | GDP per paese | CSV | 5K+ | ODC | PARZIALE (WorldBank) |
| 7 | [jennybc/gapminder](https://github.com/jennybc/gapminder) | 302 | Life expectancy + GDP + pop, 142 paesi, 1952-2007 | TSV/CSV | 1,700 | CC-0 | NO |
| 8 | [owid/poverty-data](https://github.com/owid/poverty-data) | 36 | Povertà, distribuzione reddito, Gini per paese | CSV | 10K+ | CC-BY | PARZIALE (WorldBank) |
| 9 | [actuarial-data-science/Tutorials](https://github.com/actuarial-data-science/Tutorials) | 200 | Dati assicurativi: sinistri auto, tabelle mortalità, modelli sopravvivenza | R+data | Migliaia | MIT | NO |
| 10 | [awesomedata/awesome-public-datasets](https://github.com/awesomedata/awesome-public-datasets) | 73,675 | Meta-indice: 500+ link a dataset pubblici per categoria | Markdown | Indice | CC-0 | N/A (indice) |

### Dataset specifici più utili da owid/owid-datasets

| Dataset | Cosa contiene | Valore per Simulator |
|---------|---------------|---------------------|
| Life expectancy (Gapminder, UN, IHME) | Aspettativa di vita per paese/anno | Nodi age/death |
| Cumulative share of marriages ending in divorce | Tassi divorzio per durata | Nodi relationship |
| Duration of marriages ending in divorce | Durata matrimoni | Nodi relationship |
| Five year cancer survival rates | Sopravvivenza cancro | Nodi health |
| Causes of death vs media coverage | Percezione vs realtà rischi | Nodi decision/bias |
| Share of people with business intentions | Intenzioni imprenditoriali per paese | Nodi business |
| Depression prevalence by education | Depressione per istruzione | Nodi mental health |
| Fertility Rate | Tassi fertilità per paese | Nodi life events |
| Drug overdose deaths | Mortalità overdose | Nodi addiction |
| Fatal aviation accidents | Incidenti aerei | Nodi safety/travel |

### Priorità download

1. **owid/owid-datasets** — MASSIMA. 200+ dataset, copre buchi su mortalità, divorzio, cancro, disastri, crimini
2. **fivethirtyeight/data** — ALTA. College majors ROI, sport, droghe, crimini
3. **actuarial-data-science** — MEDIA. Tabelle mortalità granulari

### Nota
La maggior parte dei dataset GitHub contiene dati aggregati paese/anno. Per probabilità individuali granulari (es. "probabilità che 35enne maschio in Indonesia sviluppi diabete") servono fonti istituzionali (WHO API, CDC WONDER, SSA Life Tables) — non disponibili come repo GitHub.

---

*Ultimo aggiornamento: 2026-03-28*
*Totale: 140+ repo analizzati in 13 categorie*

---

## 13. Behavioral & People Simulation — Modes & Architecture Analysis
> Ricerca: 2026-04-07 | Domanda originale: come strutturano i loro "mode" i tool di simulazione comportamentale/umana?

### Panoramica

I tool che simulano comportamento umano, decisioni, o life outcomes convergono su un set ricorrente di **analysis modes** e fanno distinzioni chiare tra analisi **population-level** vs **individual-level**. Questa sezione mappa il pattern per uso diretto nel design dei mode di Foresight.

---

### A. Agent-Based Modeling (ABM) Tools

#### NetLogo
- **Tipo**: Educational ABM framework (open source, Northwestern University)
- **Modes**:
  - **Interactive mode**: drag-and-drop controllo parametri, visualizzazione real-time
  - **BehaviorSpace mode**: esplora sistematicamente lo spazio parametrico — equivalente a "batch simulation" (migliaia di run in parallelo)
  - **NetLogo Web**: browser-based, condivisione via link
- **Population vs Individual**: entrambi — si può tracciare ogni agente singolarmente o guardare distribuzioni di popolazione
- **Psychological profiling**: nativo — ogni "turtle" (agente) ha attributi custom (beliefs, traits, motivations)
- **Pattern chiave**: la simulazione è sempre deterministicamente governata dai parametri — zero randomness ingiustificata

#### AnyLogic
- **Tipo**: Enterprise simulation platform (multi-method)
- **Modes** (tre paradigmi distinti):
  1. **Agent-Based Modeling (ABM)**: individui autonomi con stati, comportamenti, interazioni
  2. **Discrete Event Simulation (DES)**: flusso di processi (code, attese, risorse)
  3. **System Dynamics (SD)**: feedback loops, stock-and-flow (macro/popolazione)
- **Sub-modes specializzati**:
  - **Pedestrian Library**: simula flussi pedonali con social force model — ogni persona ha personalità, stato emotivo, decision-making individuale
  - **Real-time mode**: esegue in tempo reale per training
  - **Virtual-time mode**: corre il più veloce possibile (per analisi batch)
  - **3D animation mode**: visualizzazione immersiva (2025)
- **Population vs Individual**: ENTRAMBI — può tracciare ogni individuo o aggregate statistiche di popolazione
- **Psychological profiling**: sì — attributi individuali configurabili: social distancing propensity, risk tolerance, urgency, compliance
- **Pattern chiave**: la distinzione tra i 3 paradigmi è il modo in cui AnyLogic struttura i "mode" — non sono "view modes" ma paradigmi di modellazione fondamentalmente diversi

#### Mesa (Python)
- **Tipo**: Open-source ABM library (Python, scientifico)
- **Modes** (Mesa 3, 2024-2025):
  - **Batch run mode**: esecuzione parametrica automatizzata su migliaia di configurazioni
  - **Visualization mode**: browser-based con visualizzazione live
  - **Data collection mode**: DataCollector integrato per analisi post-run
  - **Step mode**: avanza un tick alla volta (debug/analisi dettagliata)
- **Population vs Individual**: entrambi — agent reporters (individual) + model reporters (population)
- **Psychological profiling**: nativo via attributi agente; integrazione con pandas/numpy per analisi psicometrica
- **Pattern chiave**: Mesa 3 introduce "AgentSet" — gruppi di agenti filtrabili per attributo (es. "tutti gli agenti con anxiety > 0.7")

---

### B. Digital Twin Platforms (People/Organizations)

#### IBM (Maximo + AI Digital Twins)
- **Tipo**: Enterprise asset + human behavior digital twin
- **Modes**:
  - **Monitoring mode**: real-time tracking di stato attuale
  - **Predictive mode**: AI/ML predice comportamenti/guasti futuri
  - **What-if mode**: simula overrides a condizioni modellate
  - **Historical replay mode**: riproduce stati passati per analisi
- **Population vs Individual**: principalmente individual (asset/persona specifica) — con analytics aggregate
- **Psychological profiling**: sì (per people twins) — IBM + Stanford hanno creato "AI twins" di 1000+ persone che replicano personalità, scelte morali, decision-making con 85% accuracy
- **Pattern chiave**: i mode sono organizzati per **temporalità** (passato/presente/futuro)

#### Siemens (Xcelerator — xDT)
- **Tipo**: Industrial digital twin (factory + product)
- **Modes**:
  - **Design mode**: costruzione del modello
  - **Simulation mode**: test in ambiente virtuale
  - **Executable Digital Twin (xDT)**: modello embedded in edge device — real-time closed-loop optimization
  - **Predictive maintenance mode**: AI predice guasti
- **Population vs Individual**: focus su asset individuali, ma gestisce flotte (population of assets)
- **Psychological profiling**: no (focus industriale, non comportamentale umano)
- **Pattern chiave**: xDT = digital twin che gira ON DEVICE in real-time — architettura interessante per Foresight (simulazione on-edge)

---

### C. Behavioral Prediction Platforms

#### Crystal Knows
- **Tipo**: Personality-based communication + behavioral prediction (B2B sales/HR)
- **Modes**:
  - **Profile mode**: genera profilo personalità DISC completo da dati pubblici (LinkedIn, job title, industry)
  - **Prediction mode**: predice come la persona risponderà in diverse situazioni (email, negoziazione, conflitto)
  - **Playbook mode**: raccomanda stile comunicativo ottimale per interagire con quella persona
  - **Team dynamics mode**: analizza compatibilità e friction tra membri del team
- **Population vs Individual**: principalmente individual — ma ha analytics team/population
- **Psychological profiling**: CORE — usa DISC (Dominance, Influence, Steadiness, Conscientiousness); ogni persona ha blend dei 4 tratti
- **Pattern chiave**: il profilo psicologico È il motore della simulazione — non un layer accessorio

#### Receptiviti
- **Tipo**: Language-to-psychology API (psycholinguistic analysis)
- **Modes** (via API):
  - **Emotion analysis mode**: misura 14 emozioni dal linguaggio
  - **Personality analysis mode**: Big Five, motivazioni, stile decisionale
  - **Leadership assessment mode**: identifica pattern di leadership da comunicazione scritta
  - **Brand/audience mode**: analizza percezione brand da linguaggio dei clienti
  - **Loquent Applied Insights** (2025): suite decision-ready — behavioral insight actionable per business
- **Population vs Individual**: ENTRAMBI — analisi singolo individuo O aggregate su corpus testuale (audience behavior)
- **Psychological profiling**: CORE — la piattaforma intera è costruita su psicometria validata scientificamente
- **Pattern chiave**: psicologia estratta dal LINGUAGGIO — non da survey o test diretti. Scalabile e passivo.

#### Behavox (Quantum + Falcon)
- **Tipo**: Enterprise behavioral intelligence (compliance + HR risk)
- **Modes**:
  - **Conduct mode** (Quantum): sorveglianza comunicazioni per rilevare market abuse, insider trading, misconduct
  - **Human risk mode** (Falcon): predice e previene comportamenti a rischio (flight risk, data exfiltration, credential sharing)
  - **Compliance mode** (Pathfinder): AI chatbot per guidance compliance real-time
- **Population vs Individual**: focus su individui specifici con flagging, ma analisi aggregate di pattern organizzativi
- **Psychological profiling**: implicito — behavioural anomaly detection basato su baseline individuale (ogni persona ha il suo "normal")
- **Pattern chiave**: baseline individuale + anomaly detection = simulazione implicita del "comportamento atteso" vs "comportamento osservato"

---

### D. Life Simulation / Life Course Tools

#### SimPaths (University of Essex, CeMPA)
- **Tipo**: Open-source microsimulation per life course analysis (accademico/policy)
- **Modules** (11):
  1. Ageing
  2. Education
  3. Health
  4. Family composition
  5. Social care
  6. Investment income
  7. Labour income
  8. Disposable income
  9. Consumption
  10. Health (2)
  11. Statistical display
- **Modes**:
  - **Projection mode**: simula life histories nel tempo
  - **Policy simulation mode**: testa alternative tax/benefit systems
  - **Sensitivity analysis mode**: varia parametri per testare robustezza del modello
  - **Comparative mode**: confronta outcomes tra scenari alternativi
- **Population vs Individual**: ENTRAMBI — genera storie individuali E distribuzioni di popolazione. Esplicitamente progettato per feedback dinamici tra i due livelli.
- **Psychological profiling**: parziale — comportamento economico (lavoro/risparmio) dipende da preferenze individuali e incentivi fiscali; non include Big Five o DISC
- **Pattern chiave**: i module sono i "domain" della vita; i mode sono i "what-if axes" (policy, sensitivity, comparison)

#### LifeSim (RAND / UK Millennium Cohort)
- **Tipo**: Microsimulation dinamica — segue coorti reali nel tempo
- **Modes**:
  - **Cohort tracking mode**: segue gli stessi individui nel tempo (longitudinal)
  - **Cross-sectional mode**: snapshot di popolazione a un dato punto temporale
  - **Policy counterfactual mode**: "cosa sarebbe successo senza questa policy?"
- **Population vs Individual**: entrambi — specializzato nel collegare outcomes individuali a pattern di coorte
- **Psychological profiling**: salute mentale inclusa come variabile (depressione, ansia) ma non come driver psicometrico primario

---

### E. Wargaming / Red Team Simulation

#### JCATS (Joint Conflict and Tactical Simulation — LLNL)
- **Tipo**: Military constructive simulation — entity-level battlefield
- **Modes**:
  - **Human-in-the-loop mode**: operatori umani controllano forze friendly/enemy via GUI
  - **Automated behavior mode**: CGF (Computer Generated Forces) — AI controlla entità automaticamente
  - **Training mode**: scenario con obiettivi di apprendimento definiti
  - **Analysis mode**: post-exercise replay e AAR (After Action Review)
  - **Rehearsal mode**: pratica tattica prima di operazioni reali
- **Scale**: da singolo soldato a centinaia di migliaia di entità (joint task force)
- **Population vs Individual**: ENTRAMBI — può tracciare ogni entità singola O analizzare pattern di forze
- **Psychological profiling**: comportamento combattente individuale configurabile (aggression, morale, training level)
- **Pattern chiave**: il livello di risoluzione è configurabile — puoi scendere al singolo soldato o salire al joint command

#### OneSAF (US Army)
- **Tipo**: Next-gen entity-level simulation (CGF + SAF)
- **Modes**:
  - **CGF mode** (Computer Generated Forces): AI governa tutte le forze
  - **SAF mode** (Semi-Automated Forces): umano prende controllo selettivo di entità specifiche
  - **Constructive mode**: pura simulazione (no hardware in loop)
  - **Virtual mode**: integrazione con simulatori fisici (veicoli, aerei)
- **Population vs Individual**: entrambi — brigade-level aggregate o singola entità
- **Psychological profiling**: morale, training level, unit cohesion come variabili comportamentali

#### DARPA Gamebreaker
- **Tipo**: AI-powered wargame balance analysis
- **Modes**:
  - **Balance assessment mode**: AI quantifica bilanciamento del gioco
  - **Exploit discovery mode**: trova "stati rotti" che danno vantaggio asimmetrico
  - **Red team mode**: simula avversario che usa exploit trovati
  - **Capability testing mode**: testa nuove tecnologie/tattiche in ambiente controllato
- **Population vs Individual**: focus su dinamiche di gioco/sistema (population-level emergent behavior)
- **Psychological profiling**: no — focus su game theory, non psicologia individuale

#### Red Team / Blue Team (Cybersecurity wargaming)
- **Platforms**: CrowdStrike, SimSpace, Booz Allen, MITRE
- **Modes standard**:
  - **Red Team mode**: attaccante simula avversario reale (APT, insider threat)
  - **Blue Team mode**: defender risponde e mitiga
  - **Purple Team mode**: red + blue collaborano per massimizzare learning
  - **Tabletop exercise mode**: discussione scenari senza azioni tecniche reali
  - **Full-scale live fire mode**: attacchi reali in ambiente isolato
- **Population vs Individual**: focus su organizzazione come sistema (population of processes/people)
- **Psychological profiling**: executive decision-making sotto attacco — testano come leaders reagiscono psicologicamente a crisi

---

### F. AI-Powered Behavioral Simulation (Research/Commercial Frontier)

#### Aaru (fondata 2024 — valutazione $1B, Series A 2025)
- **Tipo**: Population simulation platform per market research + policy prediction
- **Modes**:
  - **Synthetic audience mode**: genera audience con demographic + psychographic profiles
  - **Scenario testing mode**: espone audience a stimoli (notizie, prodotti, campagne) e misura reazione
  - **Policy simulation mode**: predice come popolazione risponderà a cambiamento di policy
  - **Election prediction mode**: usato per predire elezioni US 2024 con margine <400 voti
- **Population vs Individual**: POPOLAZIONE come unità primaria — ma costruita da individui sintetici dettagliati
- **Psychological profiling**: CORE — ogni agente ha hundreds of traits (demografici, psicografici, media consumption, behavioral tendencies)
- **Pattern chiave**: "synthetic research" come alternativa a survey e focus group — più veloce, scalabile, meno bias

#### Stanford Generative Agents (Park et al., 2023-2024)
- **Tipo**: Research — LLM-powered agent simulation di comportamento umano reale
- **Modes**:
  - **Interactive sandbox mode**: 25 agenti in ambiente The Sims-like — osservazione + intervento
  - **Survey replication mode**: agenti replicano risposte GSS (General Social Survey) con 85% accuracy
  - **Personality replication mode**: agenti replicano Big Five e outcomes sperimentali di individui reali
  - **Social dynamics mode**: agenti formano relazioni, diffondono notizie, coordinano attività di gruppo
- **Population vs Individual**: ENTRAMBI — può girare 1000 agenti individuali distinti O osservare pattern emergenti
- **Psychological profiling**: CORE — ogni agente ha memoria episodica, riflessione, pianificazione — tre componenti dell'architettura

#### Be.FM (Foundation Models for Human Behavior)
- **Tipo**: Research — foundation model addestrato su behavioral economics experiments
- **Modes**:
  - **Individual prediction mode**: predice comportamento di un individuo dato contesto e condizioni
  - **Population distribution mode**: predice distribuzione di comportamenti in una popolazione
  - **Game theory mode**: predice strategie in giochi economici (prisoner's dilemma, ultimatum, trust game)
- **Population vs Individual**: entrambi — esplicitamente progettato per operare a entrambi i livelli
- **Psychological profiling**: implicito — trained su dati reali di 68,779 soggetti in 9 anni

---

### G. Pattern sintetici — Cosa emerge da tutti questi tool

#### I "mode" ricorrenti in tutti i tool di simulazione comportamentale

| Mode | Descrizione | Chi lo usa |
|------|-------------|------------|
| **Baseline / Current State** | Mostra lo stato attuale senza intervento | Tutti |
| **What-if / Scenario** | Varia parametri e mostra outcome alternativo | Tutti |
| **Prediction / Projection** | Estrapola nel futuro da stato attuale | SimPaths, Aaru, IBM, Receptiviti |
| **Counterfactual** | "Cosa sarebbe successo senza X?" | LifeSim, SimPaths, policy tools |
| **Sensitivity analysis** | Testa quanto cambiano gli outcome al variare di un parametro | AnyLogic, SimPaths, Mesa |
| **Batch / Parameter sweep** | Gira migliaia di combinazioni parametriche automaticamente | AnyLogic, NetLogo BehaviorSpace, Mesa |
| **Red team / Adversarial** | Simula avversario o scenario sfavorevole | JCATS, OneSAF, CrowdStrike |
| **Replay / Post-mortem** | Riproduce simulazione passata per analisi | JCATS, IBM, AnyLogic |
| **Step / Debug** | Avanza un tick alla volta | Mesa, AnyLogic |
| **Training / Rehearsal** | Scenario con obiettivi didattici definiti | JCATS, OneSAF, wargaming tools |

#### Population vs Individual — come i tool li distinguono

| Approccio | Tool | Descrizione |
|-----------|------|-------------|
| **Individual-first** (aggrega dopo) | Generative Agents, Crystal, JCATS | Ogni agente è distinto; l'analisi di popolazione emerge dall'aggregazione |
| **Population-first** (disaggrega se necessario) | Aaru, SimPaths, System Dynamics | La popolazione è l'unità primaria; l'individuo è un sample |
| **Dual-level** (switch esplicito) | AnyLogic, Mesa, IBM, Be.FM | Il tool offre esplicitamente entrambi i livelli come mode separati |

#### Dove il profilo psicologico è centrale vs accessorio

| Ruolo della psicologia | Tool |
|------------------------|------|
| **Core engine** (senza psicologia non gira) | Crystal Knows, Receptiviti, Stanford Generative Agents |
| **Layer configurabile** (si aggiunge se serve) | AnyLogic, Mesa, NetLogo, JCATS |
| **Implicito** (baseline comportamentale senza label psicologiche) | Behavox, Be.FM |
| **Assente** | Siemens xDT, DARPA Gamebreaker |

---

### H. Implicazioni per Foresight — Mode da aggiungere o ispirare

Sulla base di questa ricerca, i mode che i competitor più sofisticati offrono e che Foresight potrebbe strutturare:

1. **Simulation mode** (attuale) — run deterministica, visualizzazione particle flow. GIA' PRESENTE.
2. **What-if mode** — freeze un nodo, cambia la probabilità, riesegui. Mostra diff vs baseline.
3. **Sensitivity mode** — varia sistematicamente una probabilità e mostra come cambia l'outcome finale (grafico tornado).
4. **Population mode** — mostra distribuzione di outcome su 1000 persone. Attuale particle system lo fa — renderlo più esplicito.
5. **Individual mode** — traccia UN singolo percorso con storia completa (log di decisioni prese).
6. **Adversarial / Red Team mode** — impostare "worst case" su ogni gate: tutti i bottleneck falliscono. Mostra il path of maximum destruction.
7. **Counterfactual mode** — "Cosa sarebbe successo se fossi partito da uno stato diverso?". Confronta due run side by side.
8. **Replay mode** — riproduci una simulazione salvata (già parzialmente presente con il replay button).
9. **Batch mode** — lancia N simulazioni con parametri randomizzati entro range, mostra distribuzione outcomes.
10. **Profile-driven mode** — carica un profilo psicologico (DISC o Big Five) e il simulatore aggiusta automaticamente le probabilità dei nodi comportamentali.

---

---

## 14. Flowchart / Vertical Layout / Diagram Libraries (GitHub)

Ricerca: 2026-04-08 — 10 agenti paralleli, obiettivo: trovare il miglior modo per renderizzare flowchart verticali puliti (stile Mermaid/Whimsical) nel Simulator.

### TIER 1 — Best for our use case

| # | Nome | URL | Stars | Stack | Perche' ci serve |
|---|------|-----|-------|-------|-----------------|
| 1 | **Flowchart Fun** | [github.com/tone-row/flowchart-fun](https://github.com/tone-row/flowchart-fun) | ~8K | Cytoscape.js | Testo → flowchart pulito verticale. Stile esattamente come lo vogliamo. Forkabile. |
| 2 | **ELK.js** | [github.com/kieler/elkjs](https://github.com/kieler/elkjs) | ~1.5K | JS | Layout engine professionale, meglio di Dagre per verticale. Si integra con React Flow. |
| 3 | **react-d3-tree** | [github.com/bkrem/react-d3-tree](https://github.com/bkrem/react-d3-tree) | ~1.2K | React/D3 | Albero verticale interattivo, click sui nodi. Leggero, pulito. |
| 4 | **React Flow + ELK example** | [github.com/dipockdas/react-flow-elk-mixed-layout](https://github.com/dipockdas/react-flow-elk-mixed-layout) | ~200 | React Flow + ELK | Esempio pronto di React Flow con ELK.js per layout verticale/gerarchico. |
| 5 | **react-decision-tree-flow** | [github.com/rjerue/react-decision-tree-flow](https://github.com/rjerue/react-decision-tree-flow) | ~500 | React/TS | Specializzato per decision tree/wizard. Branching yes/no/partial. |

### TIER 2 — Mermaid ecosystem

| # | Nome | URL | Stars | Stack | Note |
|---|------|-----|-------|-------|------|
| 6 | **Mermaid.js** | [github.com/mermaid-js/mermaid](https://github.com/mermaid-js/mermaid) | ~66K | JS | Standard de facto per diagrammi da testo. Gia' installato nel progetto. |
| 7 | **Mermaid Live Editor** | [github.com/mermaid-js/mermaid-live-editor](https://github.com/mermaid-js/mermaid-live-editor) | ~6.4K | SvelteKit | Editor ufficiale. Forkabile ma SvelteKit (non Next.js). |
| 8 | **Mermaid React Wrapper** | [github.com/mermaid-js/react-wrapper](https://github.com/mermaid-js/react-wrapper) | ~1.1K | React | Wrapper ufficiale React per Mermaid. |
| 9 | **zoom-move-able-react-mermaid** | [github.com/mitate-gengaku/zoom-move-able-react-mermaid](https://github.com/mitate-gengaku/zoom-move-able-react-mermaid) | ~150 | React | Mermaid con zoom + pan built-in. |

### TIER 3 — Alternative / ispirazione

| # | Nome | URL | Stars | Stack | Note |
|---|------|-----|-------|-------|------|
| 10 | **D2 Language** | [github.com/terrastruct/d2](https://github.com/terrastruct/d2) | ~23K | Go | Linguaggio moderno per diagrammi (alternativa a Mermaid). Bellissimo output. |
| 11 | **Markmap** | [github.com/markmap/markmap](https://github.com/markmap/markmap) | ~8K | Vue/D3 | Markdown → mindmap interattiva. Buono per vista gerarchica. |
| 12 | **flowchart.js** | [github.com/adrai/flowchart.js](https://github.com/adrai/flowchart.js) | ~8.8K | Vanilla JS | DSL semplice → SVG. Zero dipendenze. |
| 13 | **REAFLOW** | [github.com/reaviz/reaflow](https://github.com/reaviz/reaflow) | ~2.5K | React | Engine modulare per diagrammi. Buon design. |
| 14 | **react-diagrams** | [github.com/projectstorm/react-diagrams](https://github.com/projectstorm/react-diagrams) | ~9.3K | React/TS | Libreria diagrammi no-nonsense. TypeScript, modulare. |
| 15 | **DeepDiagram** | [github.com/twwch/DeepDiagram](https://github.com/twwch/DeepDiagram) | ~1.5K | LangGraph/React | Testo naturale → diagrammi (AI-powered). Multi-agente. |
| 16 | **NextERD** | [github.com/vaxad/NextERD](https://github.com/vaxad/NextERD) | ~300 | Next.js/React Flow | Template Next.js + React Flow + shadcn/ui. Pattern UI da copiare. |
| 17 | **decision-tree-maker** | [github.com/damienld22/decision-tree-maker](https://github.com/damienld22/decision-tree-maker) | — | React/D3 | Builder visuale per decision tree (basato su react-d3-tree). |

### Decisione presa

**Non forkare.** Soluzione scelta: in TB mode, semplificare i SimNode (solo label, no desc/source) e sostituire Dagre con **ELK.js** per layout verticale professionale. Cosi' si ottiene lo stile pulito tipo Mermaid/Whimsical senza perdere simulazione particelle, click nodi, e tutto il sistema esistente.

*Aggiornato: 2026-04-08 — Ricerca: flowchart/vertical layout libraries (10 agenti paralleli)*
