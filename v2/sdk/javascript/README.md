# @simulator/sdk

JavaScript/TypeScript SDK for the Simulator Prediction API.

Deterministic scenario analysis powered by 350K+ data points, 7 live APIs, and sacred behavioral roots.

## Installation

```bash
npm install @simulator/sdk
```

## Quick Start

```typescript
import { SimulatorClient } from '@simulator/sdk';

const client = new SimulatorClient();

const result = await client.predict({
  scenario: 'Open a coffee shop in Bandung, Indonesia',
  country: 'Indonesia',
  budget: 50000,
  timeline: '12 months',
});

console.log(`Success probability: ${result.probability}%`);
console.log(`Confidence: ${result.confidence}`);
console.log(`Range: ${result.probRange.adverse}% - ${result.probRange.optimistic}%`);

for (const b of result.keyBottlenecks) {
  console.log(`  [${b.prob}%] ${b.label}: ${b.description}`);
}
```

## Configuration

```typescript
const client = new SimulatorClient({
  baseUrl: 'https://your-domain.com',  // Default: https://simulator.vercel.app
  apiKey: 'your-api-key',              // Optional, for future authenticated tier
  timeout: 60000,                       // Request timeout in ms (default: 30000)
});
```

## API

### `client.predict(params)`

Predict the probability of success for a single scenario.

**Parameters:**

| Name       | Type     | Required | Description                              |
|------------|----------|----------|------------------------------------------|
| `scenario` | `string` | Yes      | What to predict. Max 2000 chars.         |
| `country`  | `string` | No       | Target country for location-specific data. |
| `budget`   | `number` | No       | Available budget in USD.                 |
| `timeline` | `string` | No       | Target timeline (e.g. "6 months").       |

**Returns:** `Promise<PredictionResult>`

### `client.predictBatch(paramsList)`

Predict multiple scenarios in sequence. Stops early if rate-limited.

**Parameters:** `PredictionParams[]`

**Returns:** `Promise<Array<{ params, result?, error? }>>`

## Error Handling

```typescript
import { SimulatorClient, RateLimitError, ValidationError, ServerError } from '@simulator/sdk';

try {
  const result = await client.predict({ scenario: 'Start a SaaS company' });
} catch (err) {
  if (err instanceof ValidationError) {
    console.error('Invalid input:', err.message);
  } else if (err instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${err.retryAfter}s`);
  } else if (err instanceof ServerError) {
    console.error('Server error:', err.message);
  }
}
```

## Rate Limits

- Free tier: 5 requests per IP per day
- Resets at midnight UTC
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## License

MIT
