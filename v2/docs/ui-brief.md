# UI Rebuild Brief — Simulator v2

## Target: Flowise nodes + ncase/trust feel

## References
- **Flowise** (github.com/FlowiseAI/Flowise) — React Flow, nodi puliti, colori per tipo, bordi arrotondati, ombre soft
- **ncase/trust** (ncase.me/trust) — interattivo, minimalista, animazioni fluid, explorable
- **DrawDB** (drawdb.vercel.app) — nodi-connessione ultra-puliti, tipografia chiara

## Problemi attuali
1. Nodi sovrapposti — dagre spacing troppo stretto (nodesep: 80, ranksep: 220)
2. Particelle coprono il testo dei nodi (z-index conflitto)
3. Nodi troppo piccoli (210px card, testo tagliato)
4. Descrizioni non leggibili (font 10px, line-clamp 3)
5. Colori piatti — nessuna gerarchia visiva per tipo nodo
6. Edges generiche — nessun colore/stile per pass/fail
7. Stats bar confusa
8. Dashboard pannello laterale troppo stretto su mobile

## Design System da implementare

### Nodi (SimNode.tsx)
- Card width: 260px (desktop), 180px (mobile)
- Border-radius: 12px
- Ombra: soft (0 2px 8px rgba(0,0,0,0.06))
- Colori per tipo:
  - desire/start: accent blue border-left 3px
  - action: neutral gray
  - bottleneck: amber/warning border-left 3px
  - decision: purple border-left 3px
  - outcome-good: green bg tint
  - outcome-bad: red bg tint
  - loop: dashed border
- Label: 13px font-semibold, 1 riga
- Desc: 11px, max 3 righe, color muted
- Source: 9px, color extra-muted, italic
- Prob badge: pill in alto a destra, colore basato su valore (green >70, amber 30-70, red <30)
- Time badge: pill in basso a destra, icona orologio

### Edges
- Default: grigio chiaro, 1.5px
- Pass/Yes: accent color, animated dash
- Fail/No: rosso, dashed
- Label: pill su edge, 9px, background surface

### Layout (dagre)
- nodesep: 120 (era 80)
- ranksep: 300 (era 220)
- edgesep: 60 (era 40)

### Canvas
- Background: dots pattern (gia presente)
- Minimap: in basso a sinistra (gia presente)
- Controls: zoom +/-, fit view

### Particelle
- z-index SOTTO i nodi (ora sono SOPRA e coprono il testo)
- Dimensione: 16px (era variabile)
- Ombra leggera per profondita

### TopBar
- Sticky, glassmorphic (gia presente)
- Input scenario: piu grande su mobile (h-10)
- Bottoni: icone su mobile, testo su desktop (parzialmente fatto)

### Stats bar (bottom)
- Redesign come progress bar orizzontale
- Verde = success, Rosso = blocked, Grigio = in progress
- Numeri grandi e chiari

### Dashboard
- Full screen overlay su mobile (non pannello laterale)
- Grid 1 colonna su mobile, 3 su desktop
- Grafici mini (success rate donut)

## File da modificare
1. `src/components/nodes/SimNode.tsx` — redesign completo nodo
2. `src/app/globals.css` — colori per tipo, responsive
3. `src/components/SimulatorCanvas.tsx` — dagre spacing, particelle z-index, edge styles
4. `src/components/Dashboard.tsx` — mobile overlay
5. `src/components/TopBar.tsx` — input sizing mobile

## Stima: 1-2 sessioni
