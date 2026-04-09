'use client';

import { useState, useCallback } from 'react';

// ── Types ──

interface Parameter {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  weight: number;
  value: number;
}

interface Combination {
  params: Record<string, number>;
  probability: number;
  delta: number;
}

// ── Heuristic Engine ──

function estimateProbability(
  params: Record<string, number>,
  paramDefs: Parameter[],
  baseProb: number
): number {
  let score = baseProb;
  for (const def of paramDefs) {
    const normalized = (params[def.key] - def.min) / (def.max - def.min);
    score += normalized * def.weight * (1 - baseProb);
  }
  return Math.min(Math.max(score, 0.01), 0.95);
}

function generateCombinations(paramDefs: Parameter[]): Record<string, number>[] {
  // Pick 3 params with highest weight for combination explosion
  const sorted = [...paramDefs].sort((a, b) => b.weight - a.weight).slice(0, 3);
  const combos: Record<string, number>[] = [];
  const levels = (p: Parameter) => [p.min, (p.min + p.max) / 2, p.max];

  for (const v0 of levels(sorted[0])) {
    for (const v1 of levels(sorted[1])) {
      for (const v2 of levels(sorted[2])) {
        const params: Record<string, number> = {};
        for (const def of paramDefs) params[def.key] = def.value;
        params[sorted[0].key] = v0;
        params[sorted[1].key] = v1;
        params[sorted[2].key] = v2;
        combos.push(params);
      }
    }
  }
  return combos;
}

// ── SVG Icons ──

function SlidersIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" /><line x1="10" x2="14" y1="8" y2="8" /><line x1="18" x2="22" y1="16" y2="16" />
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

function TrendingUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

// ── Component ──

export default function OptimizePage() {
  const [scenario, setScenario] = useState('');
  const [parameters, setParameters] = useState<Parameter[]>([
    { key: 'budget', label: 'Budget', min: 5000, max: 500000, step: 5000, unit: '$', weight: 0.30, value: 50000 },
    { key: 'timeline', label: 'Timeline', min: 3, max: 60, step: 3, unit: 'months', weight: 0.20, value: 12 },
    { key: 'location_score', label: 'Location Quality', min: 1, max: 10, step: 1, unit: '/10', weight: 0.15, value: 5 },
    { key: 'team_size', label: 'Team Size', min: 1, max: 50, step: 1, unit: 'people', weight: 0.15, value: 3 },
    { key: 'marketing', label: 'Marketing Spend', min: 0, max: 100000, step: 1000, unit: '$/mo', weight: 0.20, value: 5000 },
  ]);
  const [results, setResults] = useState<Combination[] | null>(null);
  const [baseProbability, setBaseProbability] = useState<number>(0);

  const updateParam = useCallback((key: string, value: number) => {
    setParameters(prev => prev.map(p => p.key === key ? { ...p, value } : p));
  }, []);

  const optimize = useCallback(() => {
    if (!scenario.trim()) return;

    const currentParams: Record<string, number> = {};
    for (const p of parameters) currentParams[p.key] = p.value;
    const base = estimateProbability(currentParams, parameters, 0.10);
    setBaseProbability(base);

    const combos = generateCombinations(parameters);
    const scored: Combination[] = combos.map(params => {
      const prob = estimateProbability(params, parameters, 0.10);
      return { params, probability: prob, delta: prob - base };
    });

    scored.sort((a, b) => b.probability - a.probability);
    setResults(scored.slice(0, 3));
  }, [scenario, parameters]);

  const formatValue = (key: string, val: number) => {
    const p = parameters.find(p => p.key === key);
    if (!p) return String(val);
    if (p.unit === '$' || p.unit === '$/mo') return `${p.unit === '$/mo' ? '' : '$'}${val.toLocaleString()}${p.unit === '$/mo' ? ' /mo' : ''}`;
    return `${val}${p.unit.startsWith('/') ? '' : ' '}${p.unit}`;
  };

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
          <SlidersIcon className="flex-shrink-0" style={{ color: 'var(--accent)' }} />
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Intervention Optimizer</h1>
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Find the 3 moves that maximize your probability</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Scenario Input */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <label className="text-[12px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--muted-foreground)' }}>
            Scenario
          </label>
          <input
            type="text"
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            placeholder="e.g. Open a coffee shop in Bandung, Indonesia"
            className="w-full rounded-lg border px-3 py-3 text-[13px] outline-none transition-colors"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Parameter Sliders */}
        <div className="rounded-xl border p-5 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Parameters</h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'var(--surface-hover)', color: 'var(--muted-foreground)' }}>
              {parameters.length} variables
            </span>
          </div>

          {parameters.map(p => (
            <div key={p.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>{p.label}</label>
                <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>
                  {formatValue(p.key, p.value)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] w-12 text-right" style={{ color: 'var(--muted)' }}>{formatValue(p.key, p.min)}</span>
                <input
                  type="range"
                  min={p.min}
                  max={p.max}
                  step={p.step}
                  value={p.value}
                  onChange={e => updateParam(p.key, Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent)' }}
                />
                <span className="text-[10px] w-12" style={{ color: 'var(--muted)' }}>{formatValue(p.key, p.max)}</span>
              </div>
              <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                Weight: {(p.weight * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        {/* Optimize Button */}
        <button
          onClick={optimize}
          disabled={!scenario.trim()}
          className="w-full py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: scenario.trim() ? 'var(--accent)' : 'var(--surface-hover)',
            color: scenario.trim() ? 'var(--accent-foreground)' : 'var(--muted)',
            cursor: scenario.trim() ? 'pointer' : 'not-allowed',
            boxShadow: scenario.trim() ? 'var(--shadow-md)' : 'none',
          }}
        >
          <SlidersIcon />
          Optimize
        </button>

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUpIcon />
                <h2 className="text-[13px] font-semibold">
                  The 3 moves that increase your probability from{' '}
                  <span style={{ color: 'var(--danger)' }}>{(baseProbability * 100).toFixed(0)}%</span>
                  {' '}to{' '}
                  <span style={{ color: 'var(--success)' }}>{(results[0].probability * 100).toFixed(0)}%</span>
                </h2>
              </div>

              {/* Bar Chart */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] w-16 text-right font-medium" style={{ color: 'var(--muted-foreground)' }}>Current</span>
                  <div className="flex-1 h-6 rounded" style={{ background: 'var(--surface-hover)' }}>
                    <div
                      className="h-full rounded flex items-center px-2"
                      style={{ width: `${Math.max(baseProbability * 100, 5)}%`, background: 'var(--muted)', color: '#fff', fontSize: '10px', fontWeight: 600 }}
                    >
                      {(baseProbability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-[11px] w-16 text-right font-medium" style={{ color: 'var(--muted-foreground)' }}>Path {i + 1}</span>
                    <div className="flex-1 h-6 rounded" style={{ background: 'var(--surface-hover)' }}>
                      <div
                        className="h-full rounded flex items-center px-2"
                        style={{
                          width: `${Math.max(r.probability * 100, 5)}%`,
                          background: i === 0 ? 'var(--success)' : i === 1 ? 'var(--accent)' : 'var(--purple)',
                          color: '#fff', fontSize: '10px', fontWeight: 600,
                        }}
                      >
                        {(r.probability * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Tables */}
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: i === 0 ? 'var(--success)' : i === 1 ? 'var(--accent)' : 'var(--purple)' }}>
                    {i + 1}
                  </span>
                  <h3 className="text-[13px] font-semibold">
                    Path {i + 1} &mdash; {(r.probability * 100).toFixed(1)}%
                    <span className="ml-2 text-[11px] font-normal" style={{ color: 'var(--success)' }}>
                      +{(r.delta * 100).toFixed(1)}pp
                    </span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr style={{ color: 'var(--muted-foreground)' }}>
                        <th className="text-left py-2 pr-4 font-medium">Parameter</th>
                        <th className="text-right py-2 pr-4 font-medium">Current</th>
                        <th className="text-right py-2 pr-4 font-medium">Optimal</th>
                        <th className="text-right py-2 font-medium">Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameters.map(p => {
                        const current = p.value;
                        const optimal = r.params[p.key];
                        const changed = current !== optimal;
                        return (
                          <tr key={p.key} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <td className="py-2 pr-4 font-medium">{p.label}</td>
                            <td className="py-2 pr-4 text-right font-mono" style={{ color: 'var(--muted-foreground)' }}>
                              {formatValue(p.key, current)}
                            </td>
                            <td className="py-2 pr-4 text-right font-mono" style={{ color: changed ? 'var(--accent)' : 'var(--muted-foreground)', fontWeight: changed ? 600 : 400 }}>
                              {formatValue(p.key, optimal)}
                            </td>
                            <td className="py-2 text-right font-mono" style={{ color: changed ? 'var(--success)' : 'var(--muted)' }}>
                              {changed ? `${((optimal - current) / current * 100).toFixed(0)}%` : '--'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
