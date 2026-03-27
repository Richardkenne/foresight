# Simulator — Integration Plan

## Strategia

Evolvere da "template viewer con particelle animate" a "real simulation engine con dati reali e graph execution". 4 fasi, ordinate per impatto.

---

## Phase 1: Real Simulation Engine
> Priorita: ALTA | Blocca tutto il resto

Integrare logica di simulazione reale da:
- **scottfr/simulation** (JS, browser-native) — System Dynamics + ABM engine. NPM-integrabile.
- **ncase/loopy** (public domain) — 3 feature specifiche:
  1. Speed Slider — controllo velocita in tempo reale
  2. Signal Delta Propagation — segnali come delta (+/-) lungo edge
  3. Edge Strength/Polarity — peso (0-1) e segno (+/-) per edge

**Outcome**: i nodi non sono piu solo "tappe visive" ma hanno stato interno che cambia nel tempo. Le simulazioni producono risultati quantitativi reali.

---

## Phase 2: Real Data
> Priorita: ALTA | Rende le simulazioni credibili

Importare dataset reali:
- **Choices13k** — 13,000+ behavioral games con payoff matrix. Per template decision-making.
- **cFIREsim** — dati storici mercati per retirement/FIRE simulation. Per template finanziari.
- **OpenLife** — life tables attuariali. Per template longevita/health.
- **BLS Occupational** — salari per occupazione. Gia parzialmente integrato.
- **SSA Life Table** — tabelle mortalita USA. Per template life expectancy.
- **O*NET** — skill/knowledge per occupazione. Per template carriera.
- **Opportunity Insights** — mobilita economica per area geografica. Per template immigration/location.

**Outcome**: ogni template usa dati reali verificabili, non stime AI.

---

## Phase 3: Graph Execution Engine
> Priorita: MEDIA | Upgrade architetturale

Studiare e applicare pattern da:
- **Rete.js** — visual programming framework con graph execution engine. Pattern: ogni nodo ha input/output tipizzati, il grafo si esegue come un programma.
- **Tersa (Vercel Labs)** — component patterns per UI di prodotto. Ispirazione design system.

**Outcome**: il grafo diventa eseguibile programmaticamente. Ogni nodo puo avere logica custom (formule, condizioni, lookup dati).

---

## Phase 4: Palantir-like Platform
> Priorita: BASSA | Visione lungo termine

Applicare pattern da:
- **OpenPlanter** — piattaforma open per decision support con dati geospaziali
- **G-Sim** — calibrazione simulazioni con dati reali (feedback loop: sim -> confronto dati -> aggiustamento parametri)

**Outcome**: piattaforma completa dove utenti creano simulazioni custom, calibrate su dati reali, con output esportabili e condivisibili.

---

## Decision Log
| Data | Decisione | Motivo |
|------|-----------|--------|
| 2026-03-27 | v3 folder per research demos | Tenere v2 stabile, sperimentare in v3 |
| 2026-03-27 | ncase/loopy features first | Public domain, 3 feature ad alto impatto, bassa complessita |
| 2026-03-27 | scottfr/simulation come engine base | JS nativo, browser-compatible, NPM-ready |
