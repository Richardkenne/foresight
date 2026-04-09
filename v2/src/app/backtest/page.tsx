'use client';

import { useEffect, useState } from 'react';

// ── Types ──

interface CaseResult {
  id: string;
  scenario: string;
  category: string;
  year: number;
  actualOutcome: 'failed' | 'success';
  predictedProbability: number;
  predictedOutcome: 'failed' | 'success';
  correct: boolean;
  brierContribution: number;
  provider: string;
  nodeCount: number;
  bottleneckCount: number;
  error?: string;
}

interface CalibrationBucket {
  range: string;
  lower: number;
  upper: number;
  count: number;
  actualSuccessRate: number;
  expectedRate: number;
  cases: string[];
}

interface CategoryBreakdown {
  category: string;
  total: number;
  correct: number;
  accuracy: number;
  brierScore: number;
  avgPredictedForSuccess: number;
  avgPredictedForFailure: number;
}

interface BacktestReport {
  timestamp: string;
  mode: 'mock' | 'live';
  totalCases: number;
  validCases: number;
  errors: number;
  brierScore: number;
  accuracy: number;
  hitRate: number;
  calibration: CalibrationBucket[];
  categoryBreakdown: CategoryBreakdown[];
  results: CaseResult[];
  summary: string;
}

// ── Components ──

function MetricCard({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: 'var(--space-6)',
      minWidth: '160px',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--foreground)', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

function CalibrationChart({ buckets }: { buckets: CalibrationBucket[] }) {
  const nonEmpty = buckets.filter(b => b.count > 0);
  const maxCount = Math.max(...nonEmpty.map(b => b.count), 1);

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '24px',
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--foreground)' }}>
        Calibration: Predicted vs Actual Success Rate
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {buckets.map(b => {
          const hasData = b.count > 0;
          const barWidth = hasData ? (b.count / maxCount) * 100 : 0;
          const actualPct = hasData ? (b.actualSuccessRate * 100).toFixed(0) : '-';
          const isCalibrated = hasData && Math.abs(b.actualSuccessRate - b.expectedRate) < 0.15;
          const isOver = hasData && b.actualSuccessRate > b.expectedRate + 0.15;

          return (
            <div key={b.range} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
              <div style={{ width: '60px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {b.range}
              </div>
              <div style={{ flex: 1, position: 'relative', height: '24px', background: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                {/* Expected rate marker */}
                <div style={{
                  position: 'absolute',
                  left: `${b.expectedRate * 100}%`,
                  top: 0,
                  bottom: 0,
                  width: '2px',
                  background: 'var(--muted)',
                  opacity: 0.4,
                  zIndex: 2,
                }} />
                {/* Actual bar */}
                {hasData && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '2px',
                    bottom: '2px',
                    width: `${barWidth}%`,
                    minWidth: '4px',
                    background: isCalibrated ? 'var(--success)' : isOver ? 'var(--warning)' : 'var(--accent)',
                    borderRadius: '3px',
                    opacity: 0.7,
                  }} />
                )}
              </div>
              <div style={{ width: '70px', fontVariantNumeric: 'tabular-nums', color: hasData ? 'var(--foreground)' : 'var(--muted)' }}>
                n={b.count} {hasData ? `(${actualPct}%)` : ''}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '11px', color: 'var(--muted-foreground)' }}>
        <span>Bar width = sample count</span>
        <span>Vertical line = expected rate</span>
        <span style={{ color: 'var(--success)' }}>Green = well calibrated</span>
        <span style={{ color: 'var(--warning)' }}>Amber = underconfident</span>
        <span style={{ color: 'var(--accent)' }}>Blue = overconfident</span>
      </div>
    </div>
  );
}

function CategoryTable({ breakdown }: { breakdown: CategoryBreakdown[] }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
          Performance by Category
        </h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Category', 'Cases', 'Correct', 'Accuracy', 'Brier', 'Avg Pred (Success)', 'Avg Pred (Failure)'].map(h => (
              <th key={h} style={{
                padding: 'var(--space-3) var(--space-4)',
                textAlign: 'left',
                fontWeight: 500,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--muted)',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {breakdown.map(c => (
            <tr key={c.category} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 500 }}>{c.category}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontVariantNumeric: 'tabular-nums' }}>{c.total}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontVariantNumeric: 'tabular-nums' }}>{c.correct}/{c.total}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontVariantNumeric: 'tabular-nums' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: c.accuracy >= 70 ? 'rgba(16,185,129,0.1)' : c.accuracy >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                  color: c.accuracy >= 70 ? 'var(--success)' : c.accuracy >= 50 ? 'var(--warning)' : 'var(--danger)',
                }}>
                  {c.accuracy}%
                </span>
              </td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontVariantNumeric: 'tabular-nums' }}>{c.brierScore.toFixed(4)}</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontVariantNumeric: 'tabular-nums' }}>{c.avgPredictedForSuccess}%</td>
              <td style={{ padding: 'var(--space-3) var(--space-4)', fontVariantNumeric: 'tabular-nums' }}>{c.avgPredictedForFailure}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultsTable({ results }: { results: CaseResult[] }) {
  const [sortKey, setSortKey] = useState<'id' | 'category' | 'predicted' | 'actual'>('id');
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const filtered = results.filter(r => {
    if (filter === 'correct') return r.correct;
    if (filter === 'incorrect') return !r.correct;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'id') return a.id.localeCompare(b.id);
    if (sortKey === 'category') return a.category.localeCompare(b.category);
    if (sortKey === 'predicted') return b.predictedProbability - a.predictedProbability;
    if (sortKey === 'actual') return a.actualOutcome.localeCompare(b.actualOutcome);
    return 0;
  });

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>
          All Test Cases ({filtered.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'correct', 'incorrect'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 500,
                border: '1px solid var(--border)',
                background: filter === f ? 'var(--foreground)' : 'transparent',
                color: filter === f ? 'var(--surface)' : 'var(--muted-foreground)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {[
                { key: 'id', label: 'ID' },
                { key: 'category', label: 'Category' },
                { key: 'id', label: 'Scenario' },
                { key: 'predicted', label: 'Predicted' },
                { key: 'actual', label: 'Actual' },
                { key: 'id', label: 'Brier' },
                { key: 'id', label: 'Result' },
              ].map((h, i) => (
                <th
                  key={`${h.key}-${i}`}
                  onClick={() => setSortKey(h.key as typeof sortKey)}
                  style={{
                    padding: 'var(--space-3) var(--space-3)',
                    textAlign: 'left',
                    fontWeight: 500,
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id} style={{
                borderBottom: '1px solid var(--border-subtle)',
                background: r.correct ? 'transparent' : 'rgba(239,68,68,0.02)',
              }}>
                <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>{r.id}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    padding: '2px var(--space-2)',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: 'var(--border-subtle)',
                    color: 'var(--muted-foreground)',
                  }}>
                    {r.category}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--foreground)' }}>
                  {r.scenario}
                </td>
                <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                  {(r.predictedProbability * 100).toFixed(1)}%
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: r.actualOutcome === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: r.actualOutcome === 'success' ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {r.actualOutcome}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-geist-mono)', fontSize: '11px', color: 'var(--muted-foreground)' }}>
                  {r.brierContribution.toFixed(4)}
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: r.correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    color: r.correct ? 'var(--success)' : 'var(--danger)',
                  }}>
                    {r.correct ? 'HIT' : 'MISS'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function BacktestPage() {
  const [report, setReport] = useState<BacktestReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/backtest')
      .then(r => r.json())
      .then(data => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--background)',
        color: 'var(--muted-foreground)',
        fontSize: '14px',
      }}>
        Loading backtest report...
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--background)',
        color: 'var(--muted-foreground)',
        fontSize: '14px',
        gap: '8px',
      }}>
        <div>No backtest report found.</div>
        <div style={{ fontSize: '12px' }}>Run <code style={{ fontFamily: 'var(--font-geist-mono)', padding: '2px var(--space-2)', background: 'var(--surface)', borderRadius: '4px', border: '1px solid var(--border)' }}>npm run backtest</code> to generate results.</div>
      </div>
    );
  }

  const brierQuality = report.brierScore < 0.15 ? 'Excellent' : report.brierScore < 0.2 ? 'Good' : report.brierScore < 0.25 ? 'Fair' : 'Poor';

  return (
    <div style={{
      background: 'var(--background)',
      minHeight: '100vh',
      overflowY: 'auto',
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 'var(--content-max-width)', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <a href="/" style={{ fontSize: '12px', color: 'var(--muted-foreground)', textDecoration: 'none' }}>Foresight</a>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>/</span>
            <span style={{ fontSize: '12px', color: 'var(--foreground)', fontWeight: 500 }}>Backtest</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.5px' }}>
            Simulation Calibration Report
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px', maxWidth: '600px', lineHeight: 1.5 }}>
            {report.totalCases} historical scenarios with known outcomes tested against the simulator.
            {report.mode === 'mock' ? ' Results from rule-based model (mock mode).' : ' Results from live AI generation.'}
          </p>
          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', fontFamily: 'var(--font-geist-mono)' }}>
            Generated: {new Date(report.timestamp).toLocaleString()} | Mode: {report.mode}
          </div>
        </div>

        {/* Summary */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: 'var(--space-4) var(--space-6)',
          marginBottom: '24px',
          fontSize: '13px',
          color: 'var(--foreground)',
          lineHeight: 1.6,
        }}>
          {report.summary}
        </div>

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <MetricCard
            label="Brier Score"
            value={report.brierScore.toFixed(4)}
            subtitle={`${brierQuality} (0 = perfect)`}
          />
          <MetricCard
            label="Accuracy"
            value={`${(report.accuracy * 100).toFixed(1)}%`}
            subtitle="Directional correctness"
          />
          <MetricCard
            label="Hit Rate"
            value={`${(report.hitRate * 100).toFixed(1)}%`}
            subtitle={`${Math.round(report.hitRate * report.validCases)}/${report.validCases} correct`}
          />
          <MetricCard
            label="Cases Tested"
            value={String(report.totalCases)}
            subtitle={report.errors > 0 ? `${report.errors} errors` : 'No errors'}
          />
          <MetricCard
            label="Categories"
            value={String(report.categoryBreakdown.length)}
            subtitle="Distinct scenario types"
          />
        </div>

        {/* Calibration */}
        <div style={{ marginBottom: '24px' }}>
          <CalibrationChart buckets={report.calibration} />
        </div>

        {/* Category breakdown */}
        <div style={{ marginBottom: '24px' }}>
          <CategoryTable breakdown={report.categoryBreakdown} />
        </div>

        {/* All results */}
        <div style={{ marginBottom: '40px' }}>
          <ResultsTable results={report.results} />
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '11px', color: 'var(--muted)' }}>
          Foresight Backtesting Framework | Data sources: CB Insights, Startup Genome, BLS, NRA, Indie Hackers
        </div>
      </div>
    </div>
  );
}
