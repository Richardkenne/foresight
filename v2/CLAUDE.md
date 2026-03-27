@AGENTS.md

# Simulator v2 — Project Rules

## Design Rules (NON-NEGOTIABLE)
- **NO EMOJI** — Never use emoji characters anywhere (UI, code, data, templates). Use Lucide SVG icons or inline SVG instead. Emoji = cheap, icons = professional.
- **Typography** — Use Inter for UI, system font stack as fallback. Font sizes: consistent scale (10px metadata, 12px body, 13px labels, 15px headings). Letter-spacing tight on headings.
- **Spacing** — Follow 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48). No arbitrary values. Padding/margin must be consistent across components.
- **Responsive** — Must work on mobile (320px+), tablet (768px+), and desktop (1024px+). Use Tailwind responsive prefixes. Test at all breakpoints.
- **Quality bar** — Must look like a top-tier product (Linear, Vercel, Raycast level). No generic AI slop. Clean, minimal, professional.

## Stack
- Next.js 16 + React + TypeScript
- Tailwind CSS
- React Flow (@xyflow/react) for node graph
- Dagre for auto-layout
- Claude Haiku for AI generation

## Architecture
- `src/components/SimulatorCanvas.tsx` — core simulation engine + React Flow canvas
- `src/components/nodes/SimNode.tsx` — node rendering (8 types)
- `src/components/Dashboard.tsx` — results modal
- `src/components/Particle.tsx` — SVG person generator
- `src/components/TemplateSelector.tsx` — template picker
- `src/lib/templates.ts` — all template data
- `src/app/api/generate/route.ts` — Claude API endpoint

## Simulation Flow
- Nodes hidden (opacity 0) when simulation starts
- Revealed one by one as particles reach them (opacity transition)
- All revealed when simulation stops
- 10 waves, 10 people per wave, BFS from start nodes
