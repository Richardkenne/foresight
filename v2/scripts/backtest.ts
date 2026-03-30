/**
 * Backtesting Runner — Tests Simulator predictions against real outcomes
 *
 * Takes historical dataset (real companies, real outcomes),
 * runs each through the Simulator, compares predicted probability
 * with actual outcome (success/fail).
 *
 * Output: calibration score, accuracy metrics, bias analysis.
 *
 * Run: npx tsx scripts/backtest.ts
 */

import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3000/api/generate';
const DATA_DIR = path.join(process.cwd(), 'data');
const RESULTS_FILE = path.join(DATA_DIR, 'backtest-results.json');

interface HistoricalCase {
  company_name: string;
  scenario: string;
  business_type: string;
  outcome: 'failed' | 'success';
  failure_reason?: string;
  success_metric?: string;
  source: string;
}

interface BacktestResult {
  company: string;
  scenario: string;
  business_type: string;
  actual_outcome: 'failed' | 'success';
  predicted_success_pct: number;  // Final outcome-good node reach %
  predicted_fail_pct: number;     // Final outcome-bad node reach %
  provider: string;
  nodes_count: number;
  bottleneck_count: number;
  avg_bottleneck_prob: number;
  correct: boolean;               // Did prediction match reality?
  confidence: number;             // How confident was the prediction?
  error?: string;
}

interface SimNode {
  id: number;
  type: string;
  label: string;
  prob?: number;
  probRange?: { optimistic: number; adverse: number };
}

// Calculate predicted success rate from simulation flow
function calculatePredictedRate(nodes: SimNode[]): { successPct: number; failPct: number; avgBottleneckProb: number; bottleneckCount: number } {
  const bottlenecks = nodes.filter(n => n.type === 'bottleneck' || n.type === 'decision');

  if (bottlenecks.length === 0) return { successPct: 50, failPct: 50, avgBottleneckProb: 50, bottleneckCount: 0 };

  // Cascading probability: multiply all bottleneck pass rates
  let cascadingProb = 1.0;
  for (const b of bottlenecks) {
    cascadingProb *= (b.prob || 50) / 100;
  }

  const successPct = Math.round(cascadingProb * 100 * 10) / 10;
  const failPct = Math.round((1 - cascadingProb) * 100 * 10) / 10;
  const avgBottleneckProb = Math.round(bottlenecks.reduce((s, b) => s + (b.prob || 50), 0) / bottlenecks.length);

  return { successPct, failPct, avgBottleneckProb, bottleneckCount: bottlenecks.length };
}

// Run a single backtest
async function runOne(c: HistoricalCase): Promise<BacktestResult> {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: c.scenario }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const flow = await res.json() as { nodes?: SimNode[]; _provider?: string };
    if (!flow.nodes || flow.nodes.length === 0) throw new Error('No nodes');

    const { successPct, failPct, avgBottleneckProb, bottleneckCount } = calculatePredictedRate(flow.nodes);

    // Prediction: if cascading success < 20% → predict failure, else success
    const predictedOutcome = successPct < 20 ? 'failed' : 'success';
    const correct = predictedOutcome === c.outcome;

    // Confidence: how far from 50/50 (higher = more confident)
    const confidence = Math.abs(successPct - 50) / 50;

    return {
      company: c.company_name,
      scenario: c.scenario,
      business_type: c.business_type,
      actual_outcome: c.outcome,
      predicted_success_pct: successPct,
      predicted_fail_pct: failPct,
      provider: flow._provider || 'unknown',
      nodes_count: flow.nodes.length,
      bottleneck_count: bottleneckCount,
      avg_bottleneck_prob: avgBottleneckProb,
      correct,
      confidence,
    };
  } catch (e) {
    return {
      company: c.company_name,
      scenario: c.scenario,
      business_type: c.business_type,
      actual_outcome: c.outcome,
      predicted_success_pct: 0,
      predicted_fail_pct: 0,
      provider: 'error',
      nodes_count: 0,
      bottleneck_count: 0,
      avg_bottleneck_prob: 0,
      correct: false,
      confidence: 0,
      error: (e as Error).message,
    };
  }
}

// Analyze results
function analyze(results: BacktestResult[]) {
  const valid = results.filter(r => !r.error);
  const correct = valid.filter(r => r.correct);
  const accuracy = valid.length > 0 ? Math.round(correct.length / valid.length * 100) : 0;

  // By business type
  const byType: Record<string, { total: number; correct: number; accuracy: number }> = {};
  for (const r of valid) {
    if (!byType[r.business_type]) byType[r.business_type] = { total: 0, correct: 0, accuracy: 0 };
    byType[r.business_type].total++;
    if (r.correct) byType[r.business_type].correct++;
  }
  for (const t of Object.values(byType)) {
    t.accuracy = Math.round(t.correct / t.total * 100);
  }

  // By outcome
  const failures = valid.filter(r => r.actual_outcome === 'failed');
  const successes = valid.filter(r => r.actual_outcome === 'success');
  const failAccuracy = failures.length > 0 ? Math.round(failures.filter(r => r.correct).length / failures.length * 100) : 0;
  const successAccuracy = successes.length > 0 ? Math.round(successes.filter(r => r.correct).length / successes.length * 100) : 0;

  // Calibration: average predicted success % for actual failures vs actual successes
  const avgPredForFailures = failures.length > 0 ? Math.round(failures.reduce((s, r) => s + r.predicted_success_pct, 0) / failures.length) : 0;
  const avgPredForSuccesses = successes.length > 0 ? Math.round(successes.reduce((s, r) => s + r.predicted_success_pct, 0) / successes.length) : 0;

  // Bias: does the simulator over-predict success or failure?
  const overOptimistic = failures.filter(r => r.predicted_success_pct > 30).length;
  const overPessimistic = successes.filter(r => r.predicted_success_pct < 10).length;

  return {
    total_cases: results.length,
    valid_cases: valid.length,
    errors: results.length - valid.length,
    overall_accuracy: accuracy,
    failure_detection_accuracy: failAccuracy,
    success_detection_accuracy: successAccuracy,
    avg_predicted_success_for_actual_failures: avgPredForFailures,
    avg_predicted_success_for_actual_successes: avgPredForSuccesses,
    calibration_gap: avgPredForSuccesses - avgPredForFailures,
    over_optimistic_count: overOptimistic,
    over_pessimistic_count: overPessimistic,
    by_business_type: byType,
    by_provider: {
      claude: valid.filter(r => r.provider === 'claude').length,
      openai: valid.filter(r => r.provider === 'openai').length,
      groq: valid.filter(r => r.provider === 'groq').length,
    },
  };
}

async function main() {
  // Load datasets
  const failuresPath = path.join(DATA_DIR, 'backtest-failures.json');
  const successesPath = path.join(DATA_DIR, 'backtest-successes.json');

  if (!fs.existsSync(failuresPath) || !fs.existsSync(successesPath)) {
    console.error('Missing backtest dataset files. Run data collection first.');
    process.exit(1);
  }

  const failures: HistoricalCase[] = JSON.parse(fs.readFileSync(failuresPath, 'utf8'));
  const successes: HistoricalCase[] = JSON.parse(fs.readFileSync(successesPath, 'utf8'));

  // Sample: take 25 failures + 25 successes for quick test (full run = all)
  const sampleSize = parseInt(process.env.SAMPLE_SIZE || '25');
  const shuffled = [...failures.slice(0, sampleSize), ...successes.slice(0, sampleSize)]
    .sort(() => Math.random() - 0.5);

  console.log(`\nBacktesting ${shuffled.length} cases (${sampleSize} failures + ${sampleSize} successes)...\n`);

  const results: BacktestResult[] = [];

  for (let i = 0; i < shuffled.length; i++) {
    const c = shuffled[i];
    process.stdout.write(`[${i + 1}/${shuffled.length}] ${c.company_name}... `);

    const result = await runOne(c);
    results.push(result);

    const icon = result.error ? 'ERR' : result.correct ? 'OK' : 'MISS';
    console.log(`${icon} | pred: ${result.predicted_success_pct}% | actual: ${result.actual_outcome} | ${result.provider}`);

    // Rate limit protection: 2s between calls
    await new Promise(r => setTimeout(r, 2000));
  }

  // Analyze
  const analysis = analyze(results);

  console.log('\n========== BACKTEST RESULTS ==========');
  console.log(`Total cases: ${analysis.total_cases}`);
  console.log(`Valid: ${analysis.valid_cases} | Errors: ${analysis.errors}`);
  console.log(`\nOVERALL ACCURACY: ${analysis.overall_accuracy}%`);
  console.log(`Failure detection: ${analysis.failure_detection_accuracy}%`);
  console.log(`Success detection: ${analysis.success_detection_accuracy}%`);
  console.log(`\nCALIBRATION:`);
  console.log(`  Avg predicted success for ACTUAL failures: ${analysis.avg_predicted_success_for_actual_failures}%`);
  console.log(`  Avg predicted success for ACTUAL successes: ${analysis.avg_predicted_success_for_actual_successes}%`);
  console.log(`  Gap: ${analysis.calibration_gap}pp (higher = better calibrated)`);
  console.log(`\nBIAS:`);
  console.log(`  Over-optimistic (predicted success but failed): ${analysis.over_optimistic_count}`);
  console.log(`  Over-pessimistic (predicted failure but succeeded): ${analysis.over_pessimistic_count}`);
  console.log(`\nBY BUSINESS TYPE:`);
  for (const [type, data] of Object.entries(analysis.by_business_type)) {
    console.log(`  ${type}: ${data.accuracy}% (${data.correct}/${data.total})`);
  }
  console.log(`\nBY PROVIDER: Claude ${analysis.by_provider.claude} | OpenAI ${analysis.by_provider.openai} | Groq ${analysis.by_provider.groq}`);

  // Save full results
  const output = {
    timestamp: new Date().toISOString(),
    sample_size: sampleSize,
    analysis,
    results,
  };

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
  console.log(`\nFull results saved to ${RESULTS_FILE}`);
}

main().catch(console.error);
