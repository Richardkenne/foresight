# Sacred Text Edge Categories — Polymarket Backtest (FINAL)

**Data**: 2026-04-03
**Metodo**: 50 mercati risolti (top per volume, 1 per evento), simulatore v2 con sacred text backbone
**Costo**: ~$0.10 (Claude Haiku con prompt caching)

## Results Summary

| Category | N | Hits | Hit% | Avg P&L | Fee | Verdict |
|----------|---|------|------|---------|-----|---------|
| **Fed/Economy** | **9** | **6** | **67%** | **+19.8%** | 0.5% | **STRONG EDGE** |
| Elections | 21 | 6 | 29% | -23.8% | 0-0.5% | NO EDGE |
| Sports | 7 | 1 | 14% | -48.2% | 0.75% | NO EDGE |
| Geopolitics | 4 | 0 | 0% | -60.3% | 0% | NO EDGE |
| Crypto/Price | 4 | 0 | 0% | -56.4% | 1.8% | NO EDGE |
| Gov/Policy | 3 | 0 | 0% | -56.6% | 0-0.5% | NO EDGE |
| Culture | 1 | 0 | 0% | -61.4% | 0.5% | NO EDGE |

**Overall**: 50 markets, 14 HIT (28%) — il simulatore NON ha edge generalizzato

## Key Finding: Fed/Economy = UNICA categoria con edge

### Dettaglio Fed (9 markets, 67% hit, +19.8% avg P&L)

| # | Result | Sim% | Question | P&L |
|---|--------|------|----------|-----|
| 1 | HIT | 54% | No change Fed rates Jan 2026 | +53.9% |
| 2 | MISS | 46% | Fed -25bps Dec 2025 | -54.0% |
| 3 | HIT | 53% | No change Fed rates Mar 2026 | +53.0% |
| 4 | HIT | 62% | Fed -25bps Oct 2025 | +61.8% |
| 5 | HIT | 56% | Fed -25bps Sep 2025 | +56.0% |
| 6 | MISS | 48% | No change Fed rates Jan 2025 | -52.0% |
| 7 | HIT | 60% | Fed -25bps Nov 2024 | +59.7% |
| 8 | HIT | 51% | No change Fed rates Jul 2025 | +51.2% |
| 9 | MISS | 48% | No change Fed rates Jun 2025 | -52.2% |

### Pattern nei MISS
- I 3 MISS sono tutti con sim_prob < 50% (46%, 48%, 48%)
- Quando il simulatore e' "incerto" (< 50%) → non scommettere
- Quando il simulatore dice YES (> 50%) → 6/6 = 100% hit rate!

### Regola operativa
> **Se il simulatore dice YES con >50% su una Fed decision → scommetti YES**
> Hit rate filtrato: 6/6 = 100% (su questo sample)

## Perche funziona solo su Fed

### Sacred text pattern attivo
- "Chi e' prudente prospera" (Proverbi 21:5)
- "Non affrettatevi" (Isaia 28:16)
- La Fed e' un'istituzione che INCARNA la prudenza — il suo comportamento e' allineato con i pattern sacri di cautela

### Perche le altre categorie falliscono
- **Elections**: il simulatore non conosce candidati specifici, dice "unlikely" per tutti
- **Geopolitics**: eventi troppo specifici per pattern generali
- **Sports**: performance fisica, non comportamento
- **Crypto**: price action pura, zero pattern comportamentale
- **Gov/Policy**: il simulatore e' troppo cauto → dice No a cose che invece succedono (TikTok ban, Epstein files)

## Bias critico identificato

Il simulatore ha un **bias sistematico verso il "No"** (cautela/prudenza).
- Dice "Yes" solo quando tutti gli indicatori convergono
- Su Fed decisions, questo bias e' ALLINEATO con la realta' → edge
- Su tutto il resto, questo bias e' CONTRARIO alla realta' → loss

## Next Steps

1. **Monitorare prossimi mercati Fed su Polymarket** (sezione Economy/Finance)
2. **Filtrare**: scommettere SOLO quando sim > 50%
3. **Sample size**: 9 mercati e' troppo poco — servono 30+ per confermare statisticamente
4. **Migliorare**: aggiungere dati Fed specifici (dot plot, CME FedWatch) nel simulatore per aumentare confidence
