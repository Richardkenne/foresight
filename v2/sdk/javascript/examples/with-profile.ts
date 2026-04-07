/**
 * Prediction with full country/budget/timeline context.
 * Run: npx tsx examples/with-profile.ts
 */
import { SimulatorClient, RateLimitError, ValidationError } from '../index';

async function main() {
  const client = new SimulatorClient({
    baseUrl: 'https://simulator.vercel.app',
    timeout: 60000, // longer timeout for complex scenarios
  });

  try {
    const result = await client.predict({
      scenario: 'Build a fintech startup offering micro-loans to small businesses',
      country: 'Nigeria',
      budget: 250000,
      timeline: '2 years',
    });

    console.log('=== PREDICTION ===');
    console.log(`Scenario: ${result.scenario}`);
    console.log(`Overall probability: ${result.probability}%`);
    console.log(`Confidence in data: ${(result.confidence * 100).toFixed(0)}%`);
    console.log(`Best case: ${result.probRange.optimistic}%`);
    console.log(`Worst case: ${result.probRange.adverse}%`);
    console.log('');

    console.log('=== BOTTLENECKS ===');
    for (const b of result.keyBottlenecks) {
      const bar = '#'.repeat(Math.round(b.prob / 5));
      console.log(`  ${b.label.padEnd(25)} [${String(b.prob).padStart(3)}%] ${bar}`);
      console.log(`  ${''.padEnd(25)} ${b.description}`);
    }
    console.log('');

    console.log('=== DATA SOURCES ===');
    for (const s of result.sources) {
      console.log(`  - ${s}`);
    }
    console.log('');

    console.log('=== SACRED ROOTS ===');
    for (const r of result.sacredRoots) {
      console.log(`  - ${r}`);
    }

    if (result._meta) {
      console.log(`\n[Provider: ${result._meta.provider}, Data: ${result._meta.dataSource}]`);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      console.error('Validation failed:', err.message);
    } else if (err instanceof RateLimitError) {
      console.error(`Rate limited. Reset at: ${err.resetAt.toISOString()}`);
    } else {
      console.error('Error:', (err as Error).message);
    }
  }
}

main();
