# Simulator — Plan

## What we're building
A life/business simulator where you describe any scenario and see a visual simulation of what actually happens — with real probabilities from top consulting/research sources.

## Why
No tool exists that combines:
1. Natural language input → visual flowchart
2. Real-world probabilities (not made up)
3. Animated simulation (people walking through)
4. Consumer-friendly UX (not enterprise software)

The closest competitor (Machinations.io) does game economy, not real life.

## Key decisions
- **Claude Haiku over Groq for generation** — 9.2/10 accuracy vs 4.7/10, worth the cost
- **Data-first, AI-second** — probabilities come from knowledge base, not hallucinated
- **Smart extraction over brute-force** — AI receives relevant entries, not truncated JSON blobs
- **HTML MVP first, Next.js later** — ship fast, migrate with traction
- **Source tiers (S/A/B/C/D)** — only S/A/B sources for probabilities
- **Validation layer** — post-generation check corrects AI when prob differs >3x from KB
- **No auth, no DB for MVP** — localStorage until we need sharing
- **Sacred texts as foundational layer (Fase 9)** — not a feature, the philosophical backbone. Testi sacri (PERCHE') → Storia (COME) → Dati (QUANTO SPESSO)

## Target users
1. Founders evaluating business ideas
2. Business coaches / accelerators (teaching tool)
3. Content creators (viral "why 98% fail" videos)
4. Anyone making a life decision
5. People curious about human nature patterns

## Revenue model (future)
- Free: 3 simulations/day with templates
- Pro ($9/mo): unlimited AI generation, custom scenarios, export
- Team ($29/mo): shared scenarios, embed in presentations
