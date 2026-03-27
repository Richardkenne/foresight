# UI Research — Simulator v2

## Index
- [Design Benchmarks](#design-benchmarks)
- [Node-Based UI Analysis](#node-based-ui-analysis)
- [Tersa Deep Analysis](#tersa-deep-analysis)
- [Upgrade Applied](#upgrade-applied)
- [Next Steps](#next-steps)

---

## Design Benchmarks

| Progetto | Stars | Stile | Cosa prendere |
|----------|-------|-------|---------------|
| **Linear** | NORTH STAR | Warm grays, LCH colors, Inter Display, minimal | Palette, typography, "structure felt not seen" |
| **Palantir Foundry** | Enterprise | Dark navy, data-dense, functional color only | Info density, colore solo per significato |
| **Raycast** | NORTH STAR | Compact mode, keyboard-first, native feel | Minimal chrome, shortcuts in context |

## Node-Based UI Analysis

| Progetto | Stars | Stile | Cosa prendere |
|----------|-------|-------|---------------|
| **n8n** | 181K | Light + dotted grid + colored accent bars | Barra accent per tipo nodo |
| **Dify** | 134K | White + right-angle routing + purple | Routing ad angolo retto, Cmd+K |
| **Langflow** | 146K | Dark + colored handles + category headers | Handle colorati, dark canvas |
| **Flowise** | 51K | Light + teal/purple + integration icons | Consistenza nodi |
| **DrawDB** | 37K | White + grid snap + minimal + pixel-perfect | Grid snapping, minimal color |
| **Tersa** | 958 | STESSO STACK (Next.js + React Flow + shadcn) | PRIORITA MASSIMA |

Gallery visuale: ~/Simulator/v3/ui-research.html (localhost:3007)

## Tersa Deep Analysis

### Architettura nodo a 3 livelli
```
ai-elements/node.tsx  (Card base + Handles)
  -> nodes/layout.tsx  (wrapper: context menu, toolbar, floating title)
    -> nodes/[type]/  (contenuto specifico)
```

### Pattern chiave
1. **Card con rounded-[28px]** e `ring-1 ring-border` (non solid border)
2. **Titolo floating** sopra il nodo (`absolute -top-6`, monospace, text-xs)
3. **Handles 16px** fuori dal nodo (`-left-4 / -right-4`)
4. **Edge animato** con dot SVG `<animateMotion>` lungo il bezier path
5. **Drop Node** — command palette su drag-to-empty
6. **Canvas**: `panOnDrag=false`, `panOnScroll`, `selectionOnDrag=true`
7. **OKLCH colors** — `--primary: oklch(0.6 0.13 163)` teal, stabile light/dark
8. **Controls pill** — rounded-full, orizzontali

### File reference
| File | Cosa fa |
|------|---------|
| `ai-elements/node.tsx` | Base Card + Handles |
| `ai-elements/edge.tsx` | Animated + Temporary edge |
| `ai-elements/connection.tsx` | Custom bezier + endpoint circle |
| `nodes/layout.tsx` | Universal wrapper (context menu, toolbar, title) |
| `nodes/drop.tsx` | Command palette node |
| `app/globals.css` | OKLCH tokens + RF overrides |

Codice sorgente: ~/Simulator/v3/03-tersa/

## Upgrade Applied (sessione 2026-03-28)

| Cambio | Prima | Dopo |
|--------|-------|------|
| Nodi card | `border-radius: 12px`, solid border | `border-radius: 20px`, `ring-1` (box-shadow) |
| Handles | 8px, dentro il nodo | 12px, bordo pulito |
| Controls | Rettangolari | Pill (`rounded-full`) |
| Start node | rounded-20px | Pill full (`rounded-999px`) |
| Selected | Niente | Ring 2px accent color |

## Next Steps

- [ ] Edge animato con dot SVG (da Tersa `animateMotion`)
- [ ] Floating title sopra nodi (da Tersa `absolute -top-6`)
- [ ] Drop node con command palette (da Tersa)
- [ ] Dark mode con OKLCH tokens (da Tersa)
- [ ] Context menu sui nodi (da Tersa)
- [ ] Keyboard shortcuts (Cmd+A, Cmd+D, Cmd+C/V)

---

*Ultimo aggiornamento: 2026-03-28*
