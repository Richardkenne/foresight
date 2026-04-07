# simulator-sdk

Python SDK for the Simulator Prediction API.

Deterministic scenario analysis powered by 350K+ data points, 7 live APIs, and sacred behavioral roots.

## Installation

```bash
pip install simulator-sdk
```

## Quick Start

```python
from simulator_sdk import SimulatorClient

client = SimulatorClient()

result = client.predict(
    scenario="Open a coffee shop in Bandung, Indonesia",
    country="Indonesia",
    budget=50000,
    timeline="12 months",
)

print(f"Success probability: {result.probability}%")
print(f"Confidence: {result.confidence}")
print(f"Range: {result.prob_range['adverse']}% - {result.prob_range['optimistic']}%")

for b in result.key_bottlenecks:
    print(f"  [{b.prob}%] {b.label}: {b.description}")
```

## Configuration

```python
client = SimulatorClient(
    base_url="https://your-domain.com",  # Default: https://simulator.vercel.app
    api_key="your-api-key",              # Optional, for future authenticated tier
    timeout=60,                           # Request timeout in seconds (default: 30)
)
```

## Context Manager

```python
with SimulatorClient() as client:
    result = client.predict(scenario="Start a SaaS company")
    print(result.probability)
```

## API

### `client.predict(scenario, country=None, budget=None, timeline=None)`

Predict the probability of success for a single scenario.

| Parameter  | Type    | Required | Description                              |
|------------|---------|----------|------------------------------------------|
| `scenario` | `str`   | Yes      | What to predict. Max 2000 chars.         |
| `country`  | `str`   | No       | Target country for location-specific data. |
| `budget`   | `float` | No       | Available budget in USD.                 |
| `timeline` | `str`   | No       | Target timeline (e.g. "6 months").       |

**Returns:** `PredictionResult`

### `client.predict_batch(scenarios)`

Predict multiple scenarios in sequence. Stops early if rate-limited.

**Parameters:** `list[dict]` -- each dict must have `scenario` key, optionally `country`, `budget`, `timeline`.

**Returns:** `list[dict]` with keys `params`, `result`, `error`.

## Error Handling

```python
from simulator_sdk import SimulatorClient, RateLimitError, ValidationError, ServerError

try:
    result = client.predict(scenario="Start a SaaS company")
except ValidationError as e:
    print(f"Invalid input: {e}")
except RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except ServerError as e:
    print(f"Server error: {e}")
```

## Rate Limits

- Free tier: 5 requests per IP per day
- Resets at midnight UTC
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## License

MIT
