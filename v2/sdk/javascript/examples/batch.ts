/**
 * Batch prediction example -- predict multiple scenarios.
 * Run: npx tsx examples/batch.ts
 */
import { SimulatorClient, RateLimitError } from '../index';

async function main() {
  const client = new SimulatorClient();

  const scenarios = [
    { scenario: 'Start a food truck in Austin, Texas', country: 'USA', budget: 30000 },
    { scenario: 'Launch a B2B SaaS for inventory management', budget: 100000, timeline: '18 months' },
    { scenario: 'Open a yoga studio in Bali', country: 'Indonesia', budget: 15000, timeline: '6 months' },
  ];

  console.log(`Predicting ${scenarios.length} scenarios...\n`);

  const results = await client.predictBatch(scenarios);

  for (const { params, result, error } of results) {
    console.log(`--- ${params.scenario} ---`);
    if (result) {
      console.log(`  Probability: ${result.probability}%`);
      console.log(`  Confidence: ${result.confidence}`);
      console.log(`  Bottlenecks: ${result.keyBottlenecks.length}`);
    } else if (error instanceof RateLimitError) {
      console.log(`  Rate limited. Retry after: ${error.retryAfter}s`);
    } else if (error) {
      console.log(`  Error: ${error.message}`);
    }
    console.log('');
  }
}

main();
