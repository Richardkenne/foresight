# SIMULATOR — Roadmap

## Completato
- [x] MVP HTML con 30 template (20 originali + 10 business archetypes)
- [x] Persone SVG animate che camminano nel flow
- [x] Probabilita' reali da fonti verificate (CB Insights, BLS, McKinsey, etc.)
- [x] Lucide SVG icons (no emoji)
- [x] Pause / Resume / Stop + Spacebar shortcut
- [x] Reveal progressivo dei nodi (completamente invisibili fino ad arrivo)
- [x] Persone restano parcheggiate sui nodi terminali
- [x] Simulate from any node (bottone nel pannello edit)
- [x] Auto-fit layout al viewport (5-pass anti-overlap, min spacing)
- [x] Knowledge base: **23,390+ data points** in 60 file JSON
- [x] **25 business archetypes** con 487 micro-steps e probabilita' reali
- [x] Source authority classification (S/A/B/C/D tiers)
- [x] Competitor research completo (50+ tool analizzati)
- [x] AI integration — Claude Haiku 4.5 (9.2/10) + Groq fallback
- [x] Knowledge base COLLEGATA all'AI (50+ dataset, keyword matching IT+EN, top 5, 12KB context)
- [x] World Bank API live (8 indicatori, 10 paesi, cache 1h)
- [x] Server Node.js (localhost:3456)
- [x] **Deploy Vercel** — LIVE su https://simulator-swart.vercel.app
- [x] **Dark mode** — segue automaticamente preferenza sistema
- [x] **Mobile + iPad responsive**
- [x] **Dashboard risultati** — survival funnel + bottleneck ranking + summary stats
- [x] **Loop handling** — particelle possono fare loop, max 3 revisit per nodo
- [x] **Conditional probability** — penalita' -10% per ogni revisit di un bottleneck
- [x] **Stats tracking** per nodo (arrived/passed/blocked)
- [x] **Time dimension** — campo time sui nodi (es. "30-90 days", "3-12 months")
- [x] **Edge reveal** — edge si mostrano solo quando entrambi i nodi sono visibili
- [x] MD -> JSON conversion completata (tutti i file)
- [x] **86% coverage** su 10K scenari JSONL di test
- [x] Git repo separato: github.com/Richardkenne/simulator
- [x] **Batch 1**: Platform economics, ad channels, retention curves, country data (ID/US/IT/AU), psychology, sales, funding, failure forensics — 4,440 DP
- [x] **Batch 2**: Pricing psychology, community engagement, email deep, SEO deep, legal/tax, burnout, scaling bottlenecks, market timing — 4,413 DP
- [x] **Batch 3**: Negotiation, CAC benchmarks, social proof, exit/acquisition, Indonesia deep, time-to-result, AI tools impact — 3,240 DP
- [x] **Batch 4**: Sacred texts patterns (250 dp, Bible + Quran → modern behavior) + Historical cycles (202 dp, repeating patterns across centuries)

## Prossimi step (priorita')
1. **Actionable insights** — per ogni nodo: "come migliorare questa probabilita'" con strategie + fonti
2. Param sliders — utente modifica probabilita', vede impatto su success rate
3. "What-if" mode — cambia una variabile, ricalcola tutto il funnel
4. Fix layout nodi AI-generated (troppo appiccicati con 12+ nodi)
5. Dominio custom + Meta tags + OG image + Favicon
6. Collegare piu' API live (FRED, OECD, BLS, Google Trends)

## Fase 9: Sacred Texts + History Layer (COMPLETATA)
> I testi sacri sono il primo database comportamentale dell'umanita'.
> Implementato: sacred-texts-patterns.json (250 dp) + historical-cycles.json (202 dp)
> Integrato in server.js e api/generate.js con extractSacredContext
> L'AI ora riceve pattern sacri/storici rilevanti per ogni simulazione

## Problemi risolti
- ~~Template hardcoded — non collegati ai JSON~~ -> KB passa dati a Claude
- ~~AI genera nodi con prob inventate~~ -> server carica data/, matcha, passa contesto
- ~~OpenAI inventa fonti~~ -> switchato a Claude Haiku (9.2/10 accuracy)
- ~~Nodi nascosti si vedevano blurrati~~ -> ora completamente invisibili (opacity: 0)
- ~~Keyword match troppo aggressivo~~ -> soglia a 2+, AI-first
- ~~Solo locale~~ -> deployato su Vercel
- ~~Solo light mode~~ -> dark mode automatico
- ~~Probabilities non condizionali~~ -> conditional + penalty su revisit
- ~~No loops~~ -> loop handling con max 3 revisit
- ~~No dashboard~~ -> survival funnel + bottleneck ranking
- ~~No time dimension~~ -> campo time su ogni nodo
- ~~Edge visibili a nodi nascosti~~ -> hidden edges fix
- ~~KB limitata a 12K DP~~ -> espansa a 23K+ DP con 3 batch
- ~~Solo 3 dataset matchati per scenario~~ -> 5 dataset, 12KB context
- ~~Nessun archetipo business~~ -> 25 archetipi con micro-step

## Problemi aperti
- Layout nodi AI-generated: con 12+ nodi si appiccicano (auto-fit da migliorare)
- Nessun modo di salvare scenari custom
- Nessun dominio custom

## Infrastruttura
- Frontend: HTML singolo (vanilla JS) — responsive mobile/tablet/desktop
- Server locale: Node.js (server.js, porta 3456)
- Deploy: **Vercel** (https://simulator-swart.vercel.app)
- AI primary: Claude Haiku 4.5 (Anthropic) — 9.2/10 accuracy
- AI fallback: Groq Llama 3.3 70B — 2.4s, 4.7/10 accuracy
- Live data: World Bank API (8 indicatori, 10 paesi)
- Data: **62 JSON** in simulator/data/ (**23,840+ data points**)
- Git: github.com/Richardkenne/simulator (privato)
- Dark mode: auto (prefers-color-scheme)

## Accuracy benchmark (2026-03-27)
| Provider | Speed | Accuracy | Fonti corrette | Costo/call |
|----------|-------|----------|---------------|------------|
| Claude Haiku 4.5 | 11.1s | 9.2/10 | ~90% | ~$0.004 |
| Groq Llama 3.3 | 2.4s | 4.7/10 | ~50% | ~$0.001 |
| OpenAI 4o-mini | 22.7s | 3.7/10 | ~30% | ~$0.003 |
