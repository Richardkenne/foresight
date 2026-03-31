import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface BacktestCase {
  company_name: string;
  scenario: string;
  business_type: string;
  outcome: string;
  failure_reason?: string;
}

interface BacktestResult {
  company_name: string;
  business_type: string;
  actual_outcome: string;
  predicted_success_rate: number;
  predicted_outcome: string;
  correct: boolean;
}

let lastResults: {
  timestamp: string;
  total: number;
  completed: number;
  running: boolean;
  results: BacktestResult[];
  accuracy: number;
  failure_accuracy: number;
  success_accuracy: number;
  by_type: Record<string, { total: number; correct: number; accuracy: number }>;
} | null = null;

function loadCases(sampleSize: number): BacktestCase[] {
  const dataDir = path.join(process.cwd(), 'data');

  let successes: BacktestCase[] = [];
  let failures: BacktestCase[] = [];

  try {
    successes = JSON.parse(fs.readFileSync(path.join(dataDir, 'backtest-successes.json'), 'utf8'));
  } catch { /* empty */ }

  try {
    failures = JSON.parse(fs.readFileSync(path.join(dataDir, 'backtest-failures.json'), 'utf8'));
  } catch { /* empty */ }

  // Mix: 30% successes, 70% failures (realistic distribution)
  const numSuccess = Math.max(1, Math.round(sampleSize * 0.3));
  const numFail = sampleSize - numSuccess;

  const sampledSuccess = successes.slice(0, numSuccess);
  const sampledFail = failures.slice(0, numFail);

  // Interleave
  const cases: BacktestCase[] = [];
  let si = 0, fi = 0;
  while (si < sampledSuccess.length || fi < sampledFail.length) {
    if (fi < sampledFail.length) cases.push(sampledFail[fi++]);
    if (fi < sampledFail.length) cases.push(sampledFail[fi++]);
    if (si < sampledSuccess.length) cases.push(sampledSuccess[si++]);
  }

  return cases;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { sample_size?: number };
  const sampleSize = Math.min(body.sample_size || 20, 50); // cap at 50

  if (lastResults?.running) {
    return NextResponse.json({ error: 'Backtest already running', progress: lastResults });
  }

  const cases = loadCases(sampleSize);

  lastResults = {
    timestamp: new Date().toISOString(),
    total: cases.length,
    completed: 0,
    running: true,
    results: [],
    accuracy: 0,
    failure_accuracy: 0,
    success_accuracy: 0,
    by_type: {},
  };

  // Run in background (don't await)
  runBacktest(cases, req.nextUrl.origin).catch(console.error);

  return NextResponse.json({ message: 'Backtest started', total: cases.length });
}

async function runBacktest(cases: BacktestCase[], origin: string) {
  if (!lastResults) return;

  for (const c of cases) {
    try {
      // Generate flow via internal API
      const res = await fetch(`${origin}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: c.scenario, tags: {}, profile: {} }),
      });

      if (!res.ok) {
        lastResults.completed++;
        continue;
      }

      const flow = await res.json();
      if (!flow.nodes || !flow.edges) {
        lastResults.completed++;
        continue;
      }

      // Import and run precomputeFates
      // We need to convert the flow to React Flow format and compute fates
      // Simplified: count bottleneck probabilities and compute geometric mean
      const probs: number[] = [];
      for (const node of flow.nodes) {
        if ((node.type === 'bottleneck' || node.type === 'gate' || node.type === 'decision') && typeof node.prob === 'number') {
          probs.push(node.prob / 100);
        }
      }

      // Geometric mean of all probabilities = overall success rate
      const successRate = probs.length > 0
        ? Math.round(Math.pow(probs.reduce((a, b) => a * b, 1), 1 / probs.length) * 100)
        : 50; // default if no probs

      const predictedOutcome = successRate > 15 ? 'success' : 'fail';
      const actualOutcome = c.outcome === 'success' ? 'success' : 'fail';
      const correct = predictedOutcome === actualOutcome;

      const result: BacktestResult = {
        company_name: c.company_name,
        business_type: c.business_type,
        actual_outcome: actualOutcome,
        predicted_success_rate: successRate,
        predicted_outcome: predictedOutcome,
        correct,
      };

      lastResults.results.push(result);
      lastResults.completed++;

      // Update aggregates
      const totalResults = lastResults.results;
      const correctCount = totalResults.filter(r => r.correct).length;
      lastResults.accuracy = Math.round(correctCount / totalResults.length * 100);

      const failures = totalResults.filter(r => r.actual_outcome === 'fail');
      const successes = totalResults.filter(r => r.actual_outcome === 'success');
      lastResults.failure_accuracy = failures.length > 0
        ? Math.round(failures.filter(r => r.correct).length / failures.length * 100) : 0;
      lastResults.success_accuracy = successes.length > 0
        ? Math.round(successes.filter(r => r.correct).length / successes.length * 100) : 0;

      // By type
      const byType: Record<string, { total: number; correct: number; accuracy: number }> = {};
      for (const r of totalResults) {
        if (!byType[r.business_type]) byType[r.business_type] = { total: 0, correct: 0, accuracy: 0 };
        byType[r.business_type].total++;
        if (r.correct) byType[r.business_type].correct++;
        byType[r.business_type].accuracy = Math.round(byType[r.business_type].correct / byType[r.business_type].total * 100);
      }
      lastResults.by_type = byType;

    } catch (e) {
      console.error('[backtest] Error on', c.company_name, e);
      lastResults.completed++;
    }
  }

  lastResults.running = false;
}

// GET = check progress
export async function GET() {
  if (!lastResults) {
    return NextResponse.json({ message: 'No backtest run yet. POST to start one.' });
  }
  return NextResponse.json(lastResults);
}
