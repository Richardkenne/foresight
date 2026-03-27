# Simulator — Project Context

## Cos'e

Simulator e un visual node-based life outcome simulator. L'utente sceglie uno scenario (carriera, finanza, immigrazione, relazioni, startup...) e il sistema genera un grafo interattivo di nodi decisionali collegati da edge pesati. Particelle animate (persone) attraversano il grafo simulando percorsi di vita reali, mostrando visivamente come scelte diverse portano a outcome diversi.

## Perche esiste

Non esiste nessun tool che combini:
1. **Simulazione visiva** — non numeri in un foglio Excel, ma un grafo animato dove vedi le persone muoversi
2. **LLM-powered** — i nodi e le probabilita vengono generati da Claude, non hardcoded
3. **Dati reali** — 56,000+ data points da 7 API live + 67 file JSON, non numeri inventati
4. **Template pronti** — 50+ scenari pronti, dall'immigrazione al retirement planning

Il gap di mercato e chiaro: i simulatori esistenti sono o troppo accademici (Mesa, NetLogo), o troppo semplici (ncase/loopy), o non hanno AI. Nessuno fa "life simulator visuale con nodi + LLM + dati reali".

## Per chi e

- Persone che devono prendere decisioni importanti (trasferirsi, cambiare lavoro, investire)
- Studenti che vogliono esplorare scenari di carriera
- Financial planners che vogliono mostrare scenari ai clienti
- Chiunque sia curioso di "what if?"

## Visione a lungo termine

Diventare il "Palantir for personal decisions" — una piattaforma dove chiunque puo simulare qualsiasi scenario di vita con dati reali e AI. Da tool gratuito a SaaS B2B (consulenti, coach, financial planners).

## Stack tecnico

Next.js 16 + React Flow + Tailwind su Vercel. Claude Haiku per generazione AI. 7 API live gratuite per dati in tempo reale. Dagre per auto-layout del grafo.

## Storia del progetto

- **v1**: Prototipo iniziale, proof of concept. Archiviato in ~/Simulator/v1/
- **v2** (attuale): Redesign completo UI (Linear/Vercel quality), 56K+ data points, 50+ template, deep research su 130+ repo
- **v3** (research): Demo folder ~/Simulator/v3/ con prototipi delle feature da integrare (loopy, trust game, simulating)

## Cosa lo rende unico

L'unico prodotto al mondo che combina: grafo visuale interattivo + simulazione particelle animate + generazione AI dei nodi + dati reali da API live + 50+ template pronti. Nessun competitor copre tutti e 5 questi aspetti.
