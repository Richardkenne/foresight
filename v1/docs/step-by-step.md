# Simulator — Step by Step

## Fase 1: MVP (COMPLETATA)
- [x] Flow canvas con nodi draggabili
- [x] 10 template con dati reali
- [x] Persone SVG animate
- [x] Pause / Resume / Stop + Spacebar
- [x] Reveal progressivo nodi (invisibili fino ad arrivo)
- [x] Persone parcheggiate sui terminali
- [x] Simulate from any node
- [x] Lucide SVG icons
- [x] Auto-fit layout con anti-overlap
- [x] Node.js server

## Fase 2: Knowledge Base (COMPLETATA)
- [x] Knowledge base iniziale ~9,100+ data points
- [x] Source authority tiers (S/A/B/C/D)
- [x] Competitor research (50+ tool)
- [x] API databases reference (FRED, World Bank, OECD — tutti gratis)
- [x] MD → JSON conversion completata

## Fase 3: AI Integration (COMPLETATA)
- [x] Testato 3 provider: Claude (9.2/10), Groq (4.7/10), OpenAI (3.7/10)
- [x] Claude Haiku 4.5 come default
- [x] Groq come fallback
- [x] Knowledge base collegata all'AI (keyword matching)
- [x] World Bank API live (8 indicatori, 10 paesi, cache 1h)

## Fase 4: Deploy (COMPLETATA)
- [x] Deploy su Vercel — LIVE: https://simulator-swart.vercel.app
- [x] Env vars su Vercel
- [ ] Dominio custom
- [ ] Meta tags + OG image + Favicon

## Fase 5: UX Polish (COMPLETATA)
- [x] Dark mode automatico
- [x] Mobile + iPad responsive
- [x] Dashboard risultati (survival funnel + bottleneck ranking)
- [x] Loop handling (max 3 revisit)
- [x] Conditional probability (-10% per revisit)
- [x] Stats tracking per nodo
- [x] Time dimension sui nodi
- [x] Edge reveal (solo quando nodi visibili)

## Fase 6: Knowledge Base Expansion (COMPLETATA)
- [x] 25 business archetypes con 487 micro-step e probabilita' reali
- [x] YouTube guru funnel deep data (95 data points)
- [x] 10 nuovi template frontend (total 30)
- [x] Batch 1: platform economics, ad channels, retention, country data, psychology, sales, funding, failure forensics (4,440 dp)
- [x] Batch 2: pricing psychology, community engagement, email deep, SEO deep, legal/tax, burnout, scaling, market timing (4,413 dp)
- [x] Batch 3: negotiation, CAC benchmarks, social proof, exit/acquisition, Indonesia deep, time-to-result, AI tools impact (3,240 dp)
- [x] **Totale: 23,390+ data points in 60 file JSON**

## Fase 7: Smart Context Engine (COMPLETATA)
- [x] extractArchetypeContext — trova archetipo migliore, restituisce stages completi
- [x] extractSectionEntries — score per entry, top 25 rilevanti (non primi 3KB)
- [x] extractFunnelContext — estrae funnel matching da master-funnels
- [x] Validation layer post-generazione (corregge prob se >3x differenza da KB)
- [x] System prompt aggiornato (AI usa probabilita' esatte da archetipi)
- [x] api/generate.js sincronizzato con server.js
- [x] Context: 8 dataset, 16KB limit (era 3 dataset, 8KB)

## Fase 8: Actionable Insights (DA FARE — PROSSIMA)
- [ ] Campo `tips` sui nodi (2-3 strategie concrete per migliorare la probabilita')
- [ ] AI genera tips con dati reali dal KB
- [ ] UI: tips nel pannello laterale + dashboard bottleneck
- [ ] Param sliders (utente modifica prob → vede impatto)
- [ ] "What-if" mode

## Fase 9: Sacred Texts + History Layer (DA FARE — VISIONARIA)
> Insight: i testi sacri (Bibbia, Corano) sono il primo database comportamentale dell'umanita'.
> Ogni pattern che i dati moderni misurano era gia' descritto migliaia di anni fa.
> La storia ripete questi pattern ciclicamente. I dati li quantificano.

### Gerarchia delle fonti:
```
PERCHE' (natura umana)  →  Testi sacri (Bibbia, Corano)
COME (precedenti)       →  Storia (eventi ripetuti nei secoli)
QUANTO SPESSO (oggi)    →  Dati moderni (23K+ data points)
```

### Concept: "Forbidden Fruit Pattern"
In ogni scenario di vita/business esiste UN singolo "albero proibito" — la tentazione specifica
che la maggioranza delle persone non resiste. Questo pattern e' universale e predittibile.

### Task:
- [ ] Ricerca: mappare i pattern fondamentali dai testi sacri (10 Comandamenti, 7 peccati capitali, concetti Coranici) ai pattern business/vita moderni
- [ ] Ricerca: mappare eventi storici ricorrenti che confermano ogni pattern (es. avidita' → Tulip Mania 1637, South Sea 1720, Dot-com 2000, Crypto 2021)
- [ ] Creare `sacred-patterns.json` — pattern universali con ref bibliche/coraniche + conferme storiche + dati moderni
- [ ] Creare `historical-cycles.json` — cicli storici ripetuti con date, cause, esiti
- [ ] Integrare nel system prompt: ogni simulazione identifica il "forbidden fruit" specifico di quel percorso
- [ ] UI: mostrare il pattern sacro/storico nel dashboard risultati ("Questo pattern esiste da 3,000 anni")
- [ ] Validazione: ogni pattern sacro deve avere almeno 3 conferme storiche + 1 dato moderno

## Fase 10: Monetizzazione
- [ ] Landing page
- [ ] Dominio custom
- [ ] Free tier (3 sim/day)
- [ ] Pro ($9/mo): unlimited, export, custom
- [ ] Stripe integration
