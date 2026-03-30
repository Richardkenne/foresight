# Simulator v2 — Step by Step

## Index
- [Fase 1: Data Foundation](#fase-1-data-foundation)
- [Fase 1B: Conditional Engine](#fase-1b-conditional-engine)
- [Fase 2: Recursive Simulation](#fase-2-recursive-simulation)
- [Fase 3: Profilo Utente](#fase-3-profilo-utente)
- [Fase 4: Data Pipeline Automatico](#fase-4-data-pipeline-automatico)
- [Livello 90-100: Credibilita Assoluta](#livello-90-100-credibilita-assoluta)
- [Livello 100+: Oracolo Predittivo](#livello-100-oracolo-predittivo)
- [Livello Beyond: Reality Engine](#livello-beyond-reality-engine)
- [UI Polish](#ui-polish)

---

## Fase 1: Data Foundation (+25% credibilita)
- [x] ~~Upgrade Supabase a Pro ($25/mo)~~ → ottimizzato a 512 dim, free tier sufficiente ($0/mo)
- [x] Schema: vector(1536) → vector(512), ivfflat → HNSW (m=16, ef=64)
- [x] Re-indicizzare 113 JSON nel RAG → 50,749 rows, 114+ file
- [x] 247 Upwork data points (8 agenti di ricerca) → data/upwork-data.json → indicizzato in Supabase
- [x] Auto-indexing pipeline: /api/index-data + Vercel Cron nightly (delta detection)
- [x] Prompt hardened: no hallucination, RAG data priority, Upwork mechanics injected
- [x] 3-tier AI cascade: Claude Haiku → OpenAI GPT-4o-mini → Groq Llama 3.3
- [x] 10 test Upwork simulazioni: media 6.6→8.5/10 con Claude
- [ ] Aggiungere API: Eurostat, BLS bulk, Numbeo, GEM, OECD
- [ ] Pre-processing scenari foto: estrarre keyword business, rimuovere descrizioni visive
- [ ] Test: top 100 scenari con 0 "Estimated"
- [ ] Re-index 26 file mancanti (timeout prima sessione)

## Fase 1B: Conditional Engine (+35% credibilita) — PARZIALMENTE FATTO
- [x] Decision Pruning: 5-7 domande binarie YES/NO pre-simulazione, modifier applicato a tutti i bottleneck
- [x] Domande dinamiche: Claude genera domande specifiche per scenario (non generiche)
- [x] Upwork-specific mechanics nel prompt (Connects, JSS, rates, funnel)
- [ ] P(nodo) = f(business_model, location, budget, timeline) — non costante
- [ ] 3+ business-model engines separati (SaaS, Service, F&B, Marketplace, Content)
- [ ] Ogni engine ha probabilita specifiche per industry/country
- [ ] Range output: base/optimistic/adverse (es. 8-18%, non solo 14%)
- [ ] Burn/time modeling: runway che scende, morte per cash/time mismatch
- [ ] Dipendenza tra nodi: scelta a nodo 3 cambia probabilita nodo 7

## Fase 2: Recursive Simulation (+10% wow factor)
- [ ] Click su nodo → genera sub-simulazione (chiamata API con contesto parent)
- [ ] UI: panel che mostra sub-flow con React Flow nested
- [ ] Navigazione breadcrumb: Main > Funding > KUR Loan
- [ ] Dati del nodo parent passati come contesto alla sub-simulazione
- [ ] Back button per tornare al livello superiore
- [ ] Test: drill-down 3 livelli di profondita

## Fase 3: Profilo Utente (+15% personalizzazione) — FATTO
- [x] Schema profilo: eta, paese, citta, capitale, skills, esperienza, network, lingua, visa, pattern
- [x] UI: ProfilePanel in sidebar con 5 sezioni (Identity, Financial, Professional, Network, Upwork)
- [x] Storage: localStorage con auto-save
- [x] Iniezione profilo nel prompt Claude come context personalizzato
- [x] Campi Upwork-specifici: JSS, lifetime earnings, badge tier, hourly rate
- [ ] Warning personalizzati basati su pattern utente
- [ ] Test: stesso scenario, 2 profili diversi, probabilita diverse

## Fase 4: Data Pipeline Automatico (+15% freshness) — PARZIALMENTE FATTO
- [x] Auto-indexing API: /api/index-data (delta detection, embed, upload)
- [x] Vercel Cron nightly (vercel.json, 0 0 * * *)
- [ ] Script `scripts/update-pipeline.ts` — fetch da tutte le API live
- [ ] Aggiornamento `real-probabilities.json` con dati freschi
- [ ] Email report con diff: cosa e cambiato questa settimana
- [ ] Test: eseguire pipeline manualmente e verificare dati aggiornati

---

## Livello 90-100: Credibilita Assoluta

### Simulation Engine v2: Pre-determined Fate (PROSSIMA SESSIONE — PRIORITA')
- [ ] Pre-calcolo: prima di animare, calcola il percorso completo di ogni persona (quali nodi visita, dove muore)
- [ ] Lancio simultaneo: tutte le 100 persone partono insieme
- [ ] Ogni persona segue le curve degli edge (SVG path + getPointAtLength)
- [ ] Velocita' individuale: ogni persona cammina a velocita' leggermente diversa
- [ ] Chi deve morire al nodo X, devia verso l'outcome-bad quando ci arriva
- [ ] La simulazione e' un replay di una realta' gia' determinata, non un processo real-time
- [ ] Stima: 40-50 minuti

### Data Points da Integrare nel RAG
- [ ] VC: vc-y-combinator, vc-sequoia, vc-a16z, vc-benchmark, vc-accel, vc-founders-fund, vc-lightspeed (7 file, ~1,460 dp)
- [ ] Consulting: consulting-mckinsey, consulting-bcg, consulting-bain, consulting-deloitte, consulting-pwc (5 file, ~1,000 dp)
- [ ] Banks: bank-jpmorgan, bank-goldman-sachs, bank-morgan-stanley, bank-ubs, bank-hsbc, bank-citibank, bank-deutsche-bank, bank-barclays, bank-bofa, bank-credit-suisse (10 file, ~2,000 dp)
- [ ] Magazines/Research: Forbes, HBR, Economist, Bloomberg, Psychology Today, Scientific American
- [ ] Universities: Stanford, MIT, Harvard, Wharton, Oxford/OWID

### Backtesting (+30% credibilita)
- [ ] Backtest completo 250 casi con formula geometrica media
- [ ] Simula scenari storici, confronta predizione vs realta
- [ ] Score calibrazione pubblicato: "predizione 14%, realta 15%"
- [ ] Pagina pubblica con risultati backtesting

### Community Feedback Loop
- [ ] Utenti tornano dopo 6-12 mesi con risultato reale
- [ ] Sistema impara dai risultati (aggiorna probabilita)
- [ ] Flywheel: piu utenti = piu preciso = piu utenti
- [ ] Dashboard pubblica: "X simulazioni, Y% accurate"

### Multi-Agent Simulation
- [ ] 1000 agenti con profili diversi simulati in parallelo
- [ ] Interazioni: competitor, mercato, timing, stagionalita
- [ ] Output: distribuzione risultati (histogram), non singolo percorso
- [ ] Visualizzazione: heatmap probabilita

### API Pubblica
- [ ] POST /api/predict → { scenario, probability, confidence, sources }
- [ ] Pricing: freemium (5/giorno) + pro ($29/mo)
- [ ] SDK JavaScript/Python
- [ ] Documentazione pubblica

---

## Livello 100+: Oracolo Predittivo

### Prediction Marketplace
- [ ] Utenti scommettono sulle simulazioni (Polymarket per decisioni di vita)
- [ ] Soldi veri calibrano il modello
- [ ] Risultati reali aggiornano probabilita automaticamente

### 50 Industry-Specific Engines
- [ ] Engine per: cafe, SaaS, real estate, career change, crypto, freelance, e-commerce, agency, content, coaching...
- [ ] Ognuno con dati iper-specifici e modelli causali
- [ ] Selezione automatica engine basata sullo scenario

### Governo / Istituzionale (B2G)
- [ ] Simulazione policy: "se alziamo tasse del 2%, quante PMI chiudono?"
- [ ] Dati reali per paese/regione
- [ ] Report istituzionali generati automaticamente

### Real-Time Sensing
- [ ] Event-driven: Bitcoin crolla → tutte le sim crypto si aggiornano
- [ ] Monitoraggio continuo di 50+ fonti
- [ ] Alert automatici: "le probabilita del tuo scenario sono cambiate"

### Causal Graph Learning
- [ ] ML scopre relazioni causali non mappate
- [ ] "73% cafe vicino universita sopravvive vs 12% zona residenziale"
- [ ] Insight autonomi pubblicati settimanalmente

### Digital Twin Personale
- [ ] Gemello digitale della vita intera di ogni utente
- [ ] Modello continuo: carriera + finanze + relazioni + salute
- [ ] "Se cambio lavoro, come impatta le mie finanze tra 5 anni?"

---

## Livello Beyond: Reality Engine

### Prescriptive Engine
- [ ] Non "cosa succede" ma "cosa DEVI fare"
- [ ] "Non aprire cafe — apri dark kitchen, 3.2x piu probabilita con il tuo profilo"
- [ ] Ottimizzazione automatica del percorso

### Intervention Optimizer
- [ ] Testa 1000 variazioni automaticamente
- [ ] "E se metti $1K in ads? E se assumi prima? E se cambi citta?"
- [ ] Trova il path con probabilita massima
- [ ] Output: "le 3 mosse che aumentano la tua probabilita dal 14% al 38%"

### Cross-Domain Causality
- [ ] Salute → carriera → finanze → relazioni connessi
- [ ] "Se dormi 5h/notte, la tua startup ha 40% meno probabilita"
- [ ] Visione olistica: ogni scelta impatta tutto il resto

### Generational Modeling
- [ ] "Se fai X oggi, come impatta i tuoi figli tra 20 anni?"
- [ ] Education, wealth, location — effetti multi-generazionali
- [ ] Simulazione dinastica

### Collective Simulation
- [ ] Simula intere citta/economie, non singole persone
- [ ] "Se 10K persone aprono cafe a Bandung, cosa succede al mercato?"
- [ ] Saturazione, prezzi, supply/demand, emergent behavior

### Reality Arbitrage
- [ ] Trova gap tra percezione pubblica e realta predetta
- [ ] Il simulatore sa prima degli altri dove e l'opportunita
- [ ] Monetizzazione diretta: il simulatore come hedge fund informativo

### Autonomous Execution Agent
- [ ] Il simulatore non ti dice cosa fare — LO FA
- [ ] Tu scegli lo scenario, lui: apre il conto, registra l'azienda, trova il locale, lancia ads
- [ ] Dall'idea alla realta, zero friction
- [ ] Il prodotto definitivo

---

## UI Polish (continuo)
- [ ] Responsive mobile 320px check completo
- [ ] Dark mode check completo
- [x] Frontend Design Rules Playbook creato
- [x] Global padding audit completato
- [x] Canvas dots piu visibili
- [x] Pass edges 3x piu spesse

---

*Ultimo aggiornamento: 2026-03-30*
