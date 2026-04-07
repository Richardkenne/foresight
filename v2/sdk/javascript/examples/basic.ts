/**
 * Basic prediction example.
 * Run: npx tsx examples/basic.ts
 */
import { SimulatorClient, SimulatorError } from '../index';

async function main() {
  const client = new SimulatorClient({
    baseUrl: 'https://simulator.vercel.app',
  });

  try {
    const result = await client.predict({
      scenario: 'Launch a mobile app for language learning targeting Southeast Asia',
    });

    console.log('--- Prediction Result ---');
    console.log(`Scenario: ${result.scenario}`);
    console.log(`Probability: ${result.probability}%`);
    console.log(`Confidence: ${result.confidence}`);
    console.log(`Range: ${result.probRange.adverse}% (adverse) - ${result.probRange.optimistic}% (optimistic)`);
    console.log('');
    console.log('Key Bottlenecks:');
    for (const b of result.keyBottlenecks) {
      console.log(`  [${b.prob}%] ${b.label} -- ${b.description}`);
    }
    console.log('');
    console.log('Sources:', result.sources.join(', '));
    console.log('Sacred Roots:', result.sacredRoots.join(', '));
    console.log('Generated at:', result.generatedAt);
  } catch (err) {
    if (err instanceof SimulatorError) {
      console.error(`API Error (${err.statusCode}): ${err.message}`);
    } else {
      console.error('Unexpected error:', err);
    }
  }
}

main();
