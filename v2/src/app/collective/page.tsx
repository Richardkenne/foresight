'use client';

import { useState, useCallback } from 'react';

// ── Types ──

interface DataPoint {
  n: number;
  survivalRate: number;
  revenuePerUnit: number;
  saturationIndex: number;
}

interface SimResult {
  scenario: string;
  location: string;
  dataPoints: DataPoint[];
  saturationPoint: number;
  optimalN: number;
  currentN: number;
}

// ── Saturation Model ──

function computeSaturation(
  n: number,
  marketSize: number,
  avgRevenue: number,
  competitionFactor: number
): { survivalRate: number; revenuePerUnit: number; saturationIndex: number } {
  // Logistic decay: survival drops as N approaches market capacity
  const capacity = marketSize / avgRevenue;
  const saturationIndex = n / capacity;
  const survivalRate = Math.max(0.05, 1 / (1 + Math.exp((saturationIndex - 0.5) * 8))) * (1 - competitionFactor * 0.3);
  const revenuePerUnit = avgRevenue * Math.max(0.1, 1 - saturationIndex * 0.8);

  return {
    survivalRate: Math.round(survivalRate * 1000) / 10,
    revenuePerUnit: Math.round(revenuePerUnit),
    saturationIndex: Math.round(saturationIndex * 100) / 100,
  };
}

function runSimulation(
  scenario: string,
  location: string,
  currentN: number,
  marketSize: number,
  avgRevenue: number,
  competitionFactor: number
): SimResult {
  const points: DataPoint[] = [];
  const steps = [100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];

  for (const n of steps) {
    if (n > marketSize / avgRevenue * 3) break; // No point beyond 3x capacity
    const { survivalRate, revenuePerUnit, saturationIndex } = computeSaturation(n, marketSize, avgRevenue, competitionFactor);
    points.push({ n, survivalRate, revenuePerUnit, saturationIndex });
  }

  // Find saturation point (where survival < 30%)
  const saturationPoint = points.find(p => p.survivalRate < 30)?.n || points[points.length - 1].n;
  // Find optimal N (highest survival * revenue product)
  const optimalN = points.reduce((best, p) =>
    (p.survivalRate * p.revenuePerUnit > best.survivalRate * best.revenuePerUnit) ? p : best
  ).n;

  return { scenario, location, dataPoints: points, saturationPoint, optimalN, currentN };
}

// ── SVG Icons ──

function UsersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function formatN(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return String(n);
}

// ── Component ──

export default function CollectivePage() {
  const [scenario, setScenario] = useState('');
  const [location, setLocation] = useState('');
  const [currentN, setCurrentN] = useState(1000);
  const [marketSize, setMarketSize] = useState(50000000); // $50M
  const [avgRevenue, setAvgRevenue] = useState(120000); // $120K per unit
  const [competitionFactor, setCompetitionFactor] = useState(0.3);
  const [result, setResult] = useState<SimResult | null>(null);

  const simulate = useCallback(() => {
    if (!scenario.trim() || !location.trim()) return;
    const r = runSimulation(scenario, location, currentN, marketSize, avgRevenue, competitionFactor);
    setResult(r);
  }, [scenario, location, currentN, marketSize, avgRevenue, competitionFactor]);

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <a href="/explore" className="p-2 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <ArrowLeftIcon />
          </a>
          <UsersIcon className="flex-shrink-0" style={{ color: 'var(--danger)' }} />
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Collective Simulation</h1>
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>What happens when N people do the same thing?</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Inputs */}
        <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Scenario</label>
              <input type="text" value={scenario} onChange={e => setScenario(e.target.value)}
                placeholder="e.g. Open a cafe"
                className="w-full rounded-lg border px-3 py-3 text-[13px] outline-none"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            </div>
            <div>
              <label className="text-[12px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Bandung, Indonesia"
                className="w-full rounded-lg border px-3 py-3 text-[13px] outline-none"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            </div>
          </div>
        </div>

        {/* Parameters */}
        <div className="rounded-xl border p-5 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[13px] font-semibold">Market Parameters</h2>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Number of Entrants</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>{formatN(currentN)}</span>
            </div>
            <input type="range" min={100} max={100000} step={100} value={currentN}
              onChange={e => setCurrentN(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
            <div className="flex justify-between text-[10px]" style={{ color: 'var(--muted)' }}>
              <span>100</span><span>100K</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Total Addressable Market</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
                ${(marketSize / 1000000).toFixed(0)}M
              </span>
            </div>
            <input type="range" min={1000000} max={500000000} step={1000000} value={marketSize}
              onChange={e => setMarketSize(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Avg Revenue per Business</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
                ${(avgRevenue / 1000).toFixed(0)}K/yr
              </span>
            </div>
            <input type="range" min={10000} max={1000000} step={10000} value={avgRevenue}
              onChange={e => setAvgRevenue(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Competition Intensity</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
                {(competitionFactor * 100).toFixed(0)}%
              </span>
            </div>
            <input type="range" min={0} max={1} step={0.05} value={competitionFactor}
              onChange={e => setCompetitionFactor(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
          </div>
        </div>

        {/* Simulate Button */}
        <button onClick={simulate} disabled={!scenario.trim() || !location.trim()}
          className="w-full py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: (scenario.trim() && location.trim()) ? 'var(--danger)' : 'var(--surface-hover)',
            color: (scenario.trim() && location.trim()) ? '#fff' : 'var(--muted)',
            cursor: (scenario.trim() && location.trim()) ? 'pointer' : 'not-allowed',
            boxShadow: (scenario.trim() && location.trim()) ? 'var(--shadow-md)' : 'none',
          }}>
          <UsersIcon />
          Simulate Collective Impact
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Saturation Point', value: formatN(result.saturationPoint), sub: 'Where survival drops below 30%', color: 'var(--danger)' },
                { label: 'Optimal Entrants', value: formatN(result.optimalN), sub: 'Maximizes survival x revenue', color: 'var(--success)' },
                { label: 'Current Survival', value: `${result.dataPoints.find(p => p.n >= result.currentN)?.survivalRate || 0}%`, sub: `At ${formatN(result.currentN)} entrants`, color: 'var(--accent)' },
              ].map(m => (
                <div key={m.label} className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                  <p className="text-[24px] font-bold font-mono mt-1" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{m.sub}</p>
                </div>
              ))}
            </div>

            {/* Survival Curve Chart */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[13px] font-semibold mb-4">N vs Survival Rate</h2>
              <div className="space-y-2">
                {result.dataPoints.map(dp => (
                  <div key={dp.n} className="flex items-center gap-3">
                    <span className="text-[11px] w-12 text-right font-mono" style={{ color: 'var(--muted-foreground)' }}>{formatN(dp.n)}</span>
                    <div className="flex-1 h-5 rounded" style={{ background: 'var(--surface-hover)' }}>
                      <div className="h-full rounded flex items-center px-2 transition-all"
                        style={{
                          width: `${Math.max(dp.survivalRate, 3)}%`,
                          background: dp.survivalRate > 60 ? 'var(--success)' : dp.survivalRate > 30 ? 'var(--warning)' : 'var(--danger)',
                          fontSize: '9px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                        }}>
                        {dp.survivalRate}%
                      </div>
                    </div>
                    {dp.n === result.currentN && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', color: '#fff' }}>you</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Table */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[13px] font-semibold mb-3">Market Dynamics</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ color: 'var(--muted-foreground)' }}>
                      <th className="text-right py-2 pr-4 font-medium">Entrants</th>
                      <th className="text-right py-2 pr-4 font-medium">Survival Rate</th>
                      <th className="text-right py-2 pr-4 font-medium">Rev/Unit</th>
                      <th className="text-right py-2 font-medium">Saturation Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.dataPoints.map(dp => (
                      <tr key={dp.n} style={{
                        borderTop: '1px solid var(--border-subtle)',
                        background: dp.n === result.currentN ? 'rgba(59,130,246,0.05)' : undefined,
                      }}>
                        <td className="py-2 pr-4 text-right font-mono font-medium">{formatN(dp.n)}</td>
                        <td className="py-2 pr-4 text-right font-mono" style={{
                          color: dp.survivalRate > 60 ? 'var(--success)' : dp.survivalRate > 30 ? 'var(--warning)' : 'var(--danger)',
                        }}>
                          {dp.survivalRate}%
                        </td>
                        <td className="py-2 pr-4 text-right font-mono">${(dp.revenuePerUnit / 1000).toFixed(0)}K</td>
                        <td className="py-2 text-right font-mono" style={{
                          color: dp.saturationIndex > 0.8 ? 'var(--danger)' : dp.saturationIndex > 0.4 ? 'var(--warning)' : 'var(--success)',
                        }}>
                          {dp.saturationIndex}x
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Insight */}
            <div className="rounded-xl border p-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                <strong style={{ color: 'var(--foreground)' }}>Insight:</strong>{' '}
                If {formatN(result.currentN)} people {result.scenario.toLowerCase()} in {result.location},{' '}
                {(() => {
                  const dp = result.dataPoints.find(p => p.n >= result.currentN);
                  if (!dp) return 'the market is beyond saturation.';
                  return `~${dp.survivalRate}% survive year 1. But if only ${formatN(result.optimalN)} enter: ~${result.dataPoints.find(p => p.n >= result.optimalN)?.survivalRate || '?'}% survive.`;
                })()}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
