# Priority Impact — Fasi ordinate per impatto sul prodotto

## Index
- [Ranking impatto](#ranking-impatto)
- [1. Conditional Engine (Fase 1B)](#1-conditional-engine-fase-1b)
- [2. Recursive Simulation (Fase 2)](#2-recursive-simulation-fase-2)
- [3. Backtesting (Fase 5)](#3-backtesting-fase-5)
- [4. Public API (Fase 7)](#4-public-api-fase-7)
- [5. Data Foundation completamento (Fase 1)](#5-data-foundation-completamento-fase-1)
- [6. Multi-Agent Simulation (Fase 6)](#6-multi-agent-simulation-fase-6)
- [7. Community Feedback (Fase 5B)](#7-community-feedback-fase-5b)
- [8. Auto Pipeline (Fase 4)](#8-auto-pipeline-fase-4)
- [9. User Profile completamento (Fase 3)](#9-user-profile-completamento-fase-3)

---

## Ranking impatto

| Rank | Fase | Impatto | Ore | Perche QUESTO ordine |
|------|------|---------|-----|---------------------|
| 1 | 1B Conditional Engine | CRITICO | 84h | Senza questo, ogni simulazione da le stesse probabilita a tutti. E' la differenza tra "giocattolo" e "strumento serio". |
| 2 | 2 Recursive Simulation | ALTO | 36h | Nessun competitor ce l'ha. Click su nodo → sub-simulazione. Il WOW factor che fa condividere il prodotto. |
| 3 | 5 Backtesting | ALTO | 54h | Senza prova che funziona, nessuno paga. "Il nostro simulatore predice con 87% di accuratezza" = vendibilita. |
| 4 | 7 Public API | ALTO | 30h | Primo revenue stream: $29/mo per developer. Trasforma il Simulator da "sito" a "piattaforma". |
| 5 | 1 Data Foundation | MEDIO | 10h rimaste | Gia 90% fatto. Completare elimina "Estimated" e aggiunge 5 API. Incrementale. |
| 6 | 6 Multi-Agent | MEDIO | 24h | Da "1 persona" a "1000 persone simulate". Impressionante ma non critico per MVP. |
| 7 | 5B Community Feedback | MEDIO | 24h | Flywheel a lungo termine. Non urgente ora — serve prima una base utenti. |
| 8 | 4 Auto Pipeline | BASSO | 15h rimaste | Gia 40% fatto. Il cron nightly c'e gia. Manca email report e API fetch automatico. |
| 9 | 3 User Profile | BASSO | 5h rimaste | Gia 85% fatto. Mancano solo test A/B e warnings personalizzati. |

---

## 1. Conditional Engine (Fase 1B)

**Impatto: CRITICO — senza questo il prodotto non e credibile**

### Cosa fa
Ora: scrivi "open a cafe" e "build a SaaS" → entrambi hanno probabilita generiche calcolate da Claude.
Dopo: ogni scenario usa un ENGINE SPECIFICO con dati reali per quel tipo di business.

### Perche e il piu importante
- Un cafe a Bandung ha 45% di sopravvivenza al primo anno (NRA data).
- Un SaaS bootstrapped ha 20% di raggiungere $1K MRR (Indie Hackers data).
- Un'agency ha 60% di chiudere il primo cliente in 90 giorni (HubSpot data).

Questi numeri sono DIVERSI. Ora il Simulator li tratta tutti uguale. Il Conditional Engine li separa.

### Cosa si costruisce (in dettaglio)

**A. Type System (`src/lib/engines/types.ts`) — 2h**
```
BusinessModel: 'saas' | 'service' | 'fnb' | 'marketplace' | 'content' | 'ecommerce' | 'hardware'
ProbabilityRange: { base: number, optimistic: number, adverse: number }
ConditionalFactors: { model, location, budget, timeline, experience }
```
Ogni nodo non ha piu UN numero (es. 40%) ma TRE: base 40%, ottimistico 65%, avverso 15%. Il Simulator mostra il range.

**B. 7 Business Engines — 14h**
Ogni engine ha un file JSON con 30+ probabilita specifiche + modifier per location/budget/experience:

1. `saas.ts` — SaaS/software (YC, Indie Hackers, First Round data)
2. `fnb.ts` — Cafe/ristorante (NRA, Toast POS, CHD Expert data)
3. `service.ts` — Agency/consulenza (HubSpot, Bonsai data)
4. `marketplace.ts` — Platform/marketplace (a16z, NFX data)
5. `content.ts` — Creator/influencer (YouTube, Patreon, Substack data)
6. `ecommerce.ts` — E-commerce/dropship (Shopify, Jungle Scout data)
7. `generic.ts` — Fallback per tutto il resto

**C. Burn/Runway Model — 3h**
Aggiunge una barra "RUNWAY" al canvas: se hai $5K e bruci $800/mo, muori al mese 6.
Ogni nodo ha un costo. Il runway scende. Se arrivi a 0 prima del break-even = game over.
Visivamente: barra rossa che scende da sinistra a destra sotto i nodi.

**D. Node Dependencies — 3h**
Ora i nodi sono indipendenti. Dopo: se al nodo 3 scegli "bootstrap" invece di "VC funding", le probabilita dal nodo 4 in poi CAMBIANO. La scelta si propaga downstream.

**E. Integration + Testing — 8h**
Wire gli engine nella generate route, update SimNode per mostrare range (es. "40% [15-65]"), test 20 scenari.

### Risultato
"Open a cafe in Bandung with $8K budget and no experience" → probabilita specifiche per F&B + Indonesia + low budget + zero experience. Completamente diverso da "Build a SaaS in San Francisco with $100K and 5 years of experience".

---

## 2. Recursive Simulation (Fase 2)

**Impatto: ALTO — il feature che nessuno ha**

### Cosa fa
Ora: vedi "Proposal to Interview: 4%" come nodo nel flow. Fine.
Dopo: CLICCHI su quel nodo e si apre una SUB-SIMULAZIONE che ti mostra COME migliorare quel 4%.

### Perche e importante
E' la differenza tra "ti dico che hai 4% di chance" e "ti mostro i 5 step per portarlo al 20%".
Nessun competitor (Loopy, ncase, ABM tools) ha drill-down su nodi. E' il feature che fa dire "wow" e condividere.

### Cosa si costruisce (in dettaglio)

**A. Sub-Simulation API (`/api/generate` enhancement) — 3h**
Nuovo parametro `parentContext`: quando clicchi un nodo, l'API riceve il label + desc + prob del nodo parent e genera una sub-simulazione DENTRO quel singolo step.

Esempio: clicchi "Proposal to Interview (4%)" →
Claude riceve: "Generate a detailed simulation for improving Upwork proposal-to-interview conversion rate (currently 4%). Parent scenario: Start freelancing on Upwork."
Claude genera: Write compelling proposal → Customize per job → Add portfolio link → Follow up → Get response

**B. UI: Drill-down interaction — 4h**
- Click su nodo → animazione zoom-in
- Sub-flow appare DENTRO lo stesso canvas (non un modal)
- Breadcrumb in alto: "Main > Start Freelancing > Proposal to Interview"
- Back button per tornare al livello superiore
- Profondita massima: 3 livelli (main → sub → sub-sub)

**C. Context Passing — 2h**
Il sub-flow eredita il contesto del parent: se il profilo utente dice "Indonesia, $10-30/hr rate", la sub-simulazione di "Proposal to Interview" usa QUEI dati.

**D. Stack Management — 2h**
Un array di flow: `flowStack = [mainFlow, subFlow1, subFlow2]`. Push quando drill-down, pop quando back. Ogni livello mantiene il suo stato (particelle, stats).

### Risultato
L'utente non vede solo "4% chance" — vede PERCHE e COME. E puo simulare ogni singolo micro-step. E' come Google Maps: prima vedi il percorso, poi zoomi sulla singola svolta.

---

## 3. Backtesting (Fase 5)

**Impatto: ALTO — la PROVA che funziona**

### Cosa fa
Prendi 200 startup fallite (CB Insights, Crunchbase) e 200 successi.
Simula ogni scenario retroattivamente.
Confronta: il Simulator aveva predetto fallimento? Successo? Con quale probabilita?

### Perche e importante
Senza backtesting, il Simulator e un'opinione. Con backtesting, e uno STRUMENTO.
"Accuracy score: 87%" sulla landing page = credibilita istantanea.
E' quello che separa un blog da un prodotto serio.

### Cosa si costruisce
- Dataset di 400+ scenari storici (2020-2024) con outcome reale
- Script che simula ognuno e confronta predizione vs realta
- Calibration score: quanto le probabilita del Simulator matchano la realta
- Fix automatico: se il Simulator sovrastima cafe survival, abbassa i numeri
- Pagina pubblica con risultati

---

## 4. Public API (Fase 7)

**Impatto: ALTO — primo revenue**

### Cosa fa
`POST /api/predict` → `{ scenario: "open cafe Bandung", probability: 23%, confidence: 0.87, sources: [...] }`

### Perche e importante
- Primo monetizzazione reale: $29/mo per developer
- Permette ALTRI di costruire sopra il Simulator (app, plugin, tool)
- Effetto rete: piu usano l'API → piu dati → piu accurato
- Posizionamento: da "sito web" a "piattaforma dati predittiva"

### Cosa si costruisce
- Endpoint REST con auth (API key)
- Rate limiting (5 free/giorno, 500 pro/giorno)
- SDK JavaScript + Python
- Pagina documentazione
- Stripe billing integration
- Landing page con pricing

---

## 5-9: Le altre fasi

Dettaglio minore perche o sono quasi finite (1, 3, 4) o sono scale-up post-MVP (6, 5B):

- **Fase 1** (10h rimaste): completare 26 file RAG + 5 API extra. Incrementale.
- **Fase 6 Multi-Agent** (24h): 1000 agenti simulati in parallelo. Impressionante ma non critico per vendere.
- **Fase 5B Community** (24h): utenti inviano risultati reali. Flywheel lungo termine. Serve prima base utenti.
- **Fase 4 Pipeline** (15h rimaste): email report + API fetch automatico. Cron gia attivo.
- **Fase 3 Profile** (5h rimaste): test A/B + warnings. Quasi finita.

---

*Ultimo aggiornamento: 2026-03-30*
