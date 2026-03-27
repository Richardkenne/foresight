# Simulator — Competitor Intelligence

## Index
- [Competitor diretti](#competitor-diretti)
- [Competitor indiretti — Simulation tools](#competitor-indiretti--simulation-tools)
- [Competitor indiretti — React Flow builders](#competitor-indiretti--react-flow-builders)
- [Gap analysis](#gap-analysis)

---

## Competitor diretti

| Nome | URL | Cosa fa | Forza | Debolezza | Rilevanza |
|------|-----|---------|-------|-----------|-----------|
| **Parallel Lives** | parallellives.io | AI branching timelines — esplora come sarebbero andate le cose con scelte diverse | Concept vicino al nostro, AI-powered, narrativo | No grafo visuale, no dati reali, solo testo | DIRETTO — unico competitor che fa "life what-if con AI" |

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

## Gap analysis

```
Feature Matrix:
                    Simulator  Parallel  Loopy  Insight  Mesa  Flowise
                                Lives            Maker
Grafo visuale         X                   X       X             X
Particelle animate    X
AI generation         X          X                              X
Dati reali (API)      X
Template pronti       X
Life scenarios        X          X
System dynamics                            X       X       X
Browser-native        X          X         X       X             X
Open-source           X                    X       X       X     X
```

**Il nostro vantaggio unico**: nessun prodotto al mondo combina TUTTI e 5:
1. Grafo visuale interattivo (React Flow)
2. Simulazione particelle animate
3. Generazione AI dei nodi (Claude)
4. Dati reali da API live
5. 50+ template pronti per scenari di vita

Parallel Lives e il competitor piu vicino ma fa solo testo narrativo, non ha grafo ne simulazione visiva.
