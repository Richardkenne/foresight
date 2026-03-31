# Minimal Palantir-Like Ontology Layer

This folder contains a minimal, isolated implementation for one scenario only:

`"A man with $0 wants to make money"`

It does not change `v2`.

## Files

- `src/minimal-ontology-scenario.ts`
  - scenario data model
  - transition engine
  - relation model
  - node mapping
  - derived summary

- `src/demo.ts`
  - example sequences
  - simple runner

## Proposed Data Model

### Entities

- `Person`
- `IncomePath`
- `Attempt`
- `Outcome`

### Person state

- `cash`
- `urgency`
- `energy`
- `experience`
- `active`

Initial:

- `cash = 0`
- `urgency = high`
- `energy = medium`
- `experience = low`
- `active = true`

### IncomePath state

- `type`
- `upfront_cost`
- `started`
- `repeatable`
- `monthly_income`

Initial:

- `type = "no_upfront_cost_income_path"`
- `upfront_cost = 0`
- `started = false`
- `repeatable = false`
- `monthly_income = 0`

### Outcome state

- `first_100_earned`
- `reached_500`
- `reached_1000`
- `quit`
- `burnout`
- `stagnation`

Initial:

- all `false`

## Transition Logic

Supported events:

- `start_income_path`
- `make_attempt`
- `earn_first_100`
- `reach_500_month`
- `reach_1000_month`
- `quit_path`
- `burnout_event`

Example sequence:

1. initial: `cash=0`, `started=false`
2. `start_income_path` -> `started=true`
3. `make_attempt`
4. `earn_first_100(pass)` -> `first_100_earned=true`, `monthly_income=100`
5. `reach_500_month(partial|pass)`
6. `reach_1000_month(partial|fail|pass)`

## Node Mapping

The mapping function projects ontology state into node UI categories:

- `STATE`
- `ACTION / EVENT`
- `BOTTLENECK / GATE`
- `OUTCOME`

This keeps the UI visually node-based, but the node text/status now comes from entity state rather than being static labels.

## Why This Is More Palantir-Like

Because the simulator view becomes a projection of:

- entities
- relations
- events
- transitions
- derived state

instead of only being a hand-authored flowchart.
