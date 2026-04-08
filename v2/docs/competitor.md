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
| **LifeSim** | thelifesim.com | "Create Worlds" — simula qualsiasi vita, ovunque, in qualsiasi epoca. By Cris Lenta (@crislenta). Early access, Next.js + PostHog + Tailwind. | Concept ambizioso ("Experience ANY life — ANYTIME — ANYWHERE"), branding forte, early-stage con hype | In early access (non ancora lanciato pubblicamente), no dati reali/deterministici, nessun grafo visuale, nessun pricing visibile, poca sostanza visibile sulla landing | DIRETTO — life simulation AI ma narrativo/entertainment, non data-backed |
| **LifeLens** | lifelens.to | "AI-Powered Life Decision Simulator" — predizioni data-driven per decisioni di vita (carriera, trasferimenti, investimenti). Nuxt.js + Tailwind. Claim: "10K+ decision makers", 4.9/5 rating. | Positioning forte ("see the future of your decisions"), pricing chiaro (Free $0/3 scenari, Pro $12/mo illimitato, Team $29/mo), confidence intervals e proiezioni finanziarie | API punta a localhost:8080 (possibile MVP/fake), "10K users" non verificabile, no grafo visuale, no simulazione particelle, no sacred/deterministic layer, approccio probabilistico generico | DIRETTO — il competitor piu vicino al nostro posizionamento "data-driven life decisions", ma senza grafo ne determinismo |
| **GoalSim** | goalsim.com | "AI Life Simulation Game" — scegli un obiettivo (presidente, Marte, startup unicorno) e l'AI genera una storia interattiva a bivi. Free 50 credits/day, credit packs $2.99-$14.99. 12 lingue. | Gamification forte (stats, skills, HP, energy), 3 game modes (Cozy/Drama/Strategy), AI image generation opzionale, 12 lingue, free-to-play con monetizzazione chiara | Puramente entertainment/narrativo (no dati reali), no grafo visuale, output testuale a bivi (not deterministic), no proiezioni finanziarie o probabilita reali, nessun sacred/data layer | INDIRETTO — entertainment life sim game, non decision-support tool. Buon benchmark per gamification e monetizzazione (credit system) |

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

## Analizzati ma NON competitor

| Nome | URL | Cosa fa | Perche non compete |
|------|-----|---------|-------------------|
| **BVarta (LOKASI Intelligence)** | bvarta.com | Location intelligence + geospatial analytics per Indonesia/SEA. 138M dispositivi, 6M+ POI, 300+ dataset. B2B SaaS (KFC, McDonald's, Pertamina). Founder: Martyn Terpilowski. | Fa previsione SPAZIALE (dove aprire un negozio), non percorsi di vita. B2B enterprise, non B2C. Zero sovrapposizione. |
| **Confluent** | confluent.io | Apache Kafka managed — event streaming per microservizi. | Infrastruttura data, non simulazione. Overengineering per il nostro stadio. |

## Gap analysis

```
Feature Matrix:
                    Simulator  Parallel  LifeSim  LifeLens  GoalSim  Loopy  Insight  Mesa  Flowise
                                Lives                                        Maker
Grafo visuale         X                                                X       X             X
Particelle animate    X
AI generation         X          X         X         X         X                              X
Dati reali (API)      X                              ~
Template pronti       X                              X         X
Life scenarios        X          X         X         X         X
Probabilita reali     X                              ~
Sacred/determ layer   X
Gamification                                                   X
Multi-lingua                                                   X(12)
Pricing chiaro                                       X         X
System dynamics                                                        X       X       X
Browser-native        X          X         X         X         X       X       X             X
Open-source           X                                                X       X       X     X
```
~ = claimed but not verified

**Il nostro vantaggio unico**: nessun prodotto al mondo combina TUTTI e 6:
1. Grafo visuale interattivo (React Flow)
2. Simulazione particelle animate (BFS, 100 persone)
3. Generazione AI dei nodi (Claude) — DETERMINISTICO (temp 0)
4. Dati reali da API live (350K+ data points, 66K+ embeddings)
5. 50+ template pronti per scenari di vita
6. Sacred text layer (Bibbia, Corano, testi sapienziali)

**Competitor piu vicino**: LifeLens (data-driven decisions) ma e un MVP con API a localhost, nessun grafo, nessuna simulazione visiva.
**Competitor piu pericoloso**: GoalSim — ha gamification, 12 lingue, monetizzazione funzionante. Ma e entertainment puro, non data-backed.
**LifeSim**: early access, poca sostanza visibile. Da monitorare quando lancia.
