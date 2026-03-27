# GitHub Simulation References

Data: 2026-03-27

## Obiettivo

Questo file raccoglie i progetti GitHub più vicini al tuo `simulator`, con una lettura pratica:

- cosa sono
- cosa fanno
- stack / architettura se chiaro
- perché sono rilevanti
- se sono più `simulation`, `decision-analysis`, `flowchart generation`, oppure altro

## Principio guida

Il tuo progetto sembra stare soprattutto in questa zona:

- `simulation engine`
- `what-if engine`
- `decision path engine`
- `scenario outcome visualizer`

Non è principalmente:

- `forecast engine`
- `prediction market engine`
- `binary event predictor`

Questa distinzione è importante. Il prodotto riceve uno scenario e sviluppa un percorso con nodi, colli di bottiglia e outcome. Non deve ridursi a scommettere se un evento esterno accadrà o no.

---

## 1. life-decision-tree-simulator

Repo:
- https://github.com/tuskydv/life-decision-tree-simulator

Che cos'è:
- Un simulatore di decisioni di vita sotto incertezza.
- Costruisce un albero decisionale, calcola expected utility e best path.
- Ha frontend interattivo con visualizzazione dei nodi.

Cosa fa:
- aggiunta e modifica di nodi decisionali
- visualizzazione di probabilità
- calcolo in tempo reale del percorso migliore
- dashboard con grafici e distribuzione

Stack:
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Zustand
- Recharts
- C++ compilato in WebAssembly

Perché è importante:
- È il repo più vicino al tuo progetto a livello di struttura mentale.
- Ha lo stesso asse: input decisionale -> albero -> outcome -> visualizzazione.
- È vicino soprattutto se vuoi che il simulator diventi più rigoroso lato nodi/probabilità.

Classificazione:
- `simulation`
- `decision-analysis`

Valore come reference:
- molto alto

---

## 2. NegotiationForge

Repo:
- https://github.com/Powfu-zwx/NegotiationForge

Che cos'è:
- Un simulatore di negoziazione avversariale con analisi in tempo reale, recap e fork tree.
- È un workbench di scenario e decisione, non una semplice chat AI.

Cosa fa:
- scenario di negoziazione multi-turno
- AI opponent con obiettivi, limiti, emozioni e pazienza
- analisi live dello stato della negoziazione
- identificazione di nodi chiave
- recap finale
- costruzione di percorsi alternativi sui nodi chiave

Stack:
- lato prodotto sembra full-stack web
- dalla ricognizione iniziale: Next.js + FastAPI + SQLite + provider LLM compatibili

Perché è importante:
- È vicino al tuo progetto non tanto per il tema negoziazione, ma per la logica:
  - scenario
  - stato che evolve
  - nodi chiave
  - alternative paths
  - counterfactual exploration

Classificazione:
- `simulation`
- `counterfactual analysis`
- `decision workbench`

Valore come reference:
- molto alto

### Nota teorica: NegotiationForge e i principi che hai citato

Sì, c'è parentela concettuale con:

#### Reinforcement Learning
- affinità: esplorazione di strategie e tradeoff
- differenza: NegotiationForge non è automaticamente un sistema RL solo perché esplora mosse
- punto in comune: `exploration vs exploitation`

#### Game Theory
- affinità: attori con obiettivi diversi, negoziazione, strategia, risposta all'avversario
- concetti vicini: strategia dominante, concessione, equilibrio, leverage negoziale
- questo legame qui è forte

#### Monte Carlo Tree Search (MCTS)
- affinità: esplora rami futuri possibili da uno stato presente
- differenza: non ogni fork tree è MCTS
- ma l'idea di `esplora possibili futuri` è assolutamente collegata

#### Causal Inference
- affinità: domanda implicita `se cambio questa mossa, cosa cambia dopo?`
- questa è logica controfattuale
- quindi sì, c'è vicinanza con il pensiero causale: `cosa causa cosa`

### Formula corretta

La frase giusta da mettere negli appunti è:

> NegotiationForge non è automaticamente RL, MCTS o causal inference in senso tecnico, ma condivide la stessa famiglia concettuale: esplorazione di alternative, dinamica strategica, analisi controfattuale e catene causa-effetto.

Questa è una formulazione rigorosa e corretta.

---

## 3. decision-trees-simulator

Repo:
- https://github.com/admirable-ubu/decision-trees-simulator

Che cos'è:
- Tool open source didattico per capire come vengono generati gli alberi decisionali ID3.

Cosa fa:
- visualizzazione interattiva del training step-by-step
- entropia
- conditional entropy
- logica di split dei decision tree

Stack visibile:
- JavaScript
- HTML
- CSS

Perché è importante:
- È meno vicino al tuo prodotto come UX finale.
- Però è utile se vuoi rendere il simulator più rigoroso lato branching logic e visual explanation.

Classificazione:
- `decision tree education`
- `algorithm visualization`

Valore come reference:
- medio

---

## 4. whatif-simulator

Repo:
- https://github.com/pankajsagvekar/whatif-simulator

Che cos'è:
- App di storytelling interattivo dove l'utente scrive una domanda `What if...`
- Il sistema genera due outcome:
  - serious version
  - fun version

Cosa fa:
- input libero dell'utente
- output alternativo duale
- timeline/journal
- salvataggio della storia

Stack:
- Next.js
- React
- Node.js API routes
- SQLite

Perché è importante:
- È vicino al tuo progetto sul lato UX:
  - input semplice
  - trasformazione immediata in outcome
  - forma “what if”
- È meno strutturato di un vero engine ad albero, ma molto utile come reference prodotto.

Classificazione:
- `what-if simulation`
- `interactive storytelling`

Valore come reference:
- alto

---

## 5. What-If-Business-Simulator

Repo:
- https://github.com/dhanushk21/What-If-Business-Simulator

Che cos'è:
- Simulatore business dove cambi input come prezzo, costo, clienti, marketing e vedi impatto su profitto e crescita.

Cosa fa:
- variazione input
- scenario business
- confronto outcome
- supporto alla decisione

Stack visibile:
- JavaScript
- CSS
- HTML

Perché è importante:
- È un simulatore numerico di scenario, non narrativo.
- È utile se vuoi una futura modalità più economica/manageriale del tuo prodotto.

Classificazione:
- `business scenario analysis`
- `parameter simulation`

Valore come reference:
- medio-alto

---

## 6. ai_flowchart_generator

Repo:
- https://github.com/sixshootercat/ai_flowchart_generator

Che cos'è:
- Generatore AI di flowchart basato su Mermaid.js e Google AI Studio.

Cosa fa:
- prende un prompt
- genera flowchart
- focus soprattutto sull'output diagrammatico

Stack:
- Next.js
- Mermaid.js
- Gemini / Google AI Studio

Perché è importante:
- È utile lato presentazione visuale.
- Meno utile lato motore di simulazione.
- È più `rendering + generation` che `reasoning + simulation`.

Classificazione:
- `flowchart generation`

Valore come reference:
- medio

---

## 7. scenario_simulator_v2

Repo:
- https://github.com/tier4/scenario_simulator_v2

Che cos'è:
- Framework di simulazione scenario-based per Autoware.

Cosa fa:
- simulazione di scenari nel mondo autonomous driving
- framework tecnico, non consumer-facing

Perché è importante:
- Ti mostra un significato più “hard simulation” della parola simulator.
- Però non è vicino al tuo prodotto come UX o target.

Classificazione:
- `technical simulation framework`

Valore come reference:
- basso-medio per il prodotto
- medio per la nozione di orchestrazione/scenario engine

---

## 8. Kartha / Kartha-like Matches

Repo osservati:
- https://github.com/Kartha-AI/agentcare-mcp
- https://github.com/paulokuriki/Kartha-AI_agentcare-mcp
- https://github.com/simoami/agentcare-mcp

Conclusione:
- non risultano collegati al tuo filone `simulation`
- sembrano strumenti MCP / healthcare / EMR
- non sono reference utili per il tuo simulator

Valore come reference:
- nullo per questo progetto

---

## Sintesi: quali contano davvero

### Reference principali

1. `life-decision-tree-simulator`
- più vicino alla tua architettura ideale

2. `NegotiationForge`
- migliore reference per counterfactual paths e fork tree

3. `whatif-simulator`
- migliore reference per UX semplice e user-facing

### Reference secondarie

4. `What-If-Business-Simulator`
- utile per modalità numerica/business

5. `ai_flowchart_generator`
- utile per rendering / presentazione del flow

6. `decision-trees-simulator`
- utile per logica/alberi/rigore didattico

### Poco rilevante per il tuo prodotto

7. `scenario_simulator_v2`
- troppo tecnico e fuori dal tuo caso d'uso

8. `Kartha-*`
- non collegato

---

## Posizionamento del tuo progetto

Il tuo simulator sembra stare qui:

- `human scenario simulation`
- `business/life/relationship outcome engine`
- `what-if branching interface`

Non qui:

- `forecasting engine`
- `prediction market interface`
- `binary event predictor`

Questa è la separazione da preservare.

---

## Nota finale operativa

Se il prodotto cresce, la direzione più forte sembra questa:

### Layer 1: User input
- seed minimale
- situazione umana / business / relazione / scelta

### Layer 2: Simulation engine
- genera passaggi
- genera bottleneck
- genera fork
- assegna probabilità in modo ragionevole

### Layer 3: Counterfactual layer
- “se qui avesse fatto X invece di Y”
- alternative path
- recovery path

### Layer 4: Visual layer
- flowchart
- timeline
- decision tree

In questa struttura:
- `whatif-simulator` aiuta sul Layer 1
- `life-decision-tree-simulator` aiuta su Layer 2/4
- `NegotiationForge` aiuta su Layer 3

