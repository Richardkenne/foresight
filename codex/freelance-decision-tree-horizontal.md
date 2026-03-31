# Freelance Decision Tree Horizontal

Questo diagramma usa un frame da `decision tree / state transition map` in orizzontale.

```mermaid
flowchart LR
    A["STATE<br/>$5000 -> $6000<br/>First proof achieved<br/>Confidence ↑"]
    B["EVENT<br/>Continue selling service"]
    C{"BOTTLENECK<br/>Can they repeat it?"}

    A --> B --> C

    C -->|NO<br/>(≈60–80%)| D["STATE<br/>Inconsistent income<br/>Random clients"]
    D --> E["EVENT<br/>Keep trying same way"]
    E --> F["OUTCOME<br/>Stagnation<br/>$0–$2k/month unstable"]
    D --> G["EVENT<br/>Quit / burnout"]
    G --> H["OUTCOME<br/>Exit freelance"]

    C -->|PARTIAL<br/>(≈15–30%)| I["STATE<br/>Some repeat clients<br/>Low pricing"]
    I --> J["EVENT<br/>Accept low rates"]
    J --> K["OUTCOME<br/>Trapped<br/>Overworked, low income"]
    I --> L["EVENT<br/>Try to increase price"]
    L --> M{"BOTTLENECK<br/>Lose clients?"}
    M -->|YES| N["OUTCOME<br/>Back to low income"]
    M -->|NO| O["OUTCOME<br/>Move upmarket"]

    C -->|YES<br/>(≈5–10%)| P["STATE<br/>Repeatable acquisition<br/>Clear offer"]
    P --> Q["EVENT<br/>Systemize<br/>Process, offer"]
    Q --> R["OUTCOME<br/>Stable $3k–$10k/month"]
    P --> S["EVENT<br/>Niche down"]
    S --> T["OUTCOME<br/>Higher rates"]
    P --> U["EVENT<br/>Scale<br/>Team / productize"]
    U --> V{"BOTTLENECK<br/>Operations complexity"}
    V -->|FAIL| W["OUTCOME<br/>Collapse / chaos"]
    V -->|PASS| X["OUTCOME<br/>Agency / scalable business"]
```

## Recommended Frame

Il frame migliore qui non è una timeline pura ma uno di questi:

1. `Decision tree`
2. `State transition map`
3. `Probabilistic path map`

Se vuoi comunicarlo in modo più strategico che tecnico, ti consiglio questo titolo:

`From first proof to scalable business: horizontal decision tree`

Se vuoi comunicarlo in modo più "founder/operator", ti consiglio questo:

`Freelance growth map: states, bottlenecks, and branching outcomes`
