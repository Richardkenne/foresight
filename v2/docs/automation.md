# Simulator v2 — Automazioni

## Attive

### Overnight Data Pipeline
- **File**: `scripts/overnight-pipeline.ts`
- **Scheduler**: macOS launchd (`com.simulator.overnight-pipeline`)
- **Frequenza**: ogni notte alle 3:00 AM
- **Cosa fa**:
  1. Fetch dati freschi da World Bank API (15 indicatori, ~1000 entries)
  2. Fetch dati freschi da FRED API (6 serie, ~72 entries)
  3. 40 agenti Claude Haiku (batch di 5) cercano 25-30 data points ciascuno (~1000-1200 dp)
  4. Salva nuovi dati in `data/nightly-*.json`
  5. Embed con OpenAI (512 dim) + upload a Supabase RAG
  6. Report in `docs/nightly-reports/YYYY-MM-DD.md`
- **Costo**: ~$0.20/notte (~$6/mese)
- **Output**: ~1500-2000 nuovi data points/notte
- **Log**: `/tmp/simulator-overnight.log`
- **Errori**: `/tmp/simulator-overnight-error.log`
- **Attivare**: `launchctl load ~/Library/LaunchAgents/com.simulator.overnight-pipeline.plist`
- **Disattivare**: `launchctl unload ~/Library/LaunchAgents/com.simulator.overnight-pipeline.plist`
- **Test manuale**: `export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/overnight-pipeline.ts`

### Supabase Pro Plan
- **Attivo dal**: 2026-04-07
- **Costo**: $25/mo
- **Limiti**: 8 GB database, 250 GB bandwidth, 100 GB file storage
- **Stato attuale**: 1.6 GB usati (314K embeddings), headroom fino a 8 GB (~1.5M embeddings)
- **Progetto**: Simulator (rkkfwsmoqylctprzqhfj)

## Pianificate (non ancora attive)

### Weekly Full Re-Index (Fase 4, Day 35+)
- Re-indicizzazione completa di tutti i JSON nel RAG
- Aggiornamento dati da tutte le API

### Vercel Deploy Webhook
- Auto-deploy su push al branch main
- Attualmente: push manuale solo su richiesta esplicita
