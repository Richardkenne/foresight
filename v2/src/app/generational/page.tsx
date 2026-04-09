'use client';

import { useState, useCallback } from 'react';

// ── Types ──

interface Milestone {
  year: number;
  wealth: number;
  incomePercentile: number;
  educationAccess: string;
  locationQoL: number;
  label: string;
}

// ── Model ──

function computeTrajectory(
  scenario: string,
  startingIncome: number,
  savingsRate: number,
  growthRate: number,
  horizon: number,
  location: string
): Milestone[] {
  const milestones: Milestone[] = [];
  let wealth = 0;
  const annualSavings = startingIncome * (savingsRate / 100);

  for (let y = 0; y <= horizon; y += (horizon <= 10 ? 1 : horizon <= 20 ? 2 : 5)) {
    wealth = annualSavings * ((Math.pow(1 + growthRate / 100, y) - 1) / (growthRate / 100 || 1));
    const incomeAtYear = startingIncome * Math.pow(1 + growthRate / 200, y); // slower income growth
    const percentile = Math.min(99, Math.max(1, 20 + Math.log10(Math.max(incomeAtYear, 1000)) * 18));

    let educationAccess: string;
    if (percentile > 80) educationAccess = 'International / Top-tier';
    else if (percentile > 60) educationAccess = 'Private / National';
    else if (percentile > 40) educationAccess = 'Public / Competitive';
    else educationAccess = 'Public / Basic';

    // QoL: base from location, improves with wealth
    const locationBase: Record<string, number> = {
      'southeast-asia': 5.5, 'europe': 7.5, 'usa': 7.0, 'australia': 8.0,
      'africa': 4.0, 'south-america': 5.0, 'east-asia': 6.5, 'other': 5.0,
    };
    const base = locationBase[location] || 5.5;
    const qol = Math.min(10, base + (percentile - 50) * 0.03 + Math.log10(Math.max(wealth, 1)) * 0.15);

    let label = '';
    if (y === 0) label = 'Start';
    else if (wealth > 1000000) label = 'Millionaire threshold';
    else if (percentile > 80 && y > 0) label = 'Top 20% income';
    else if (y === horizon) label = 'End of horizon';

    milestones.push({
      year: y,
      wealth: Math.round(wealth),
      incomePercentile: Math.round(percentile),
      educationAccess,
      locationQoL: Math.round(qol * 10) / 10,
      label,
    });
  }

  return milestones;
}

function formatCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n}`;
}

// ── SVG Icons ──

function ClockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
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

// ── Component ──

export default function GenerationalPage() {
  const [scenario, setScenario] = useState('');
  const [startingIncome, setStartingIncome] = useState(30000);
  const [savingsRate, setSavingsRate] = useState(20);
  const [growthRate, setGrowthRate] = useState(7);
  const [horizon, setHorizon] = useState(20);
  const [location, setLocation] = useState('southeast-asia');
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);

  const model = useCallback(() => {
    if (!scenario.trim()) return;
    const result = computeTrajectory(scenario, startingIncome, savingsRate, growthRate, horizon, location);
    setMilestones(result);
  }, [scenario, startingIncome, savingsRate, growthRate, horizon, location]);

  const maxWealth = milestones ? Math.max(...milestones.map(m => m.wealth), 1) : 1;

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
          <ClockIcon className="flex-shrink-0" style={{ color: 'var(--warning)' }} />
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Generational Modeling</h1>
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Project wealth, education access, and quality of life across decades</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Scenario */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <label className="text-[12px] font-medium uppercase tracking-wider mb-2 block" style={{ color: 'var(--muted-foreground)' }}>
            Your Scenario
          </label>
          <input
            type="text"
            value={scenario}
            onChange={e => setScenario(e.target.value)}
            placeholder="e.g. Software engineer in Bandung, building side projects"
            className="w-full rounded-lg border px-3 py-3 text-[13px] outline-none"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Parameters */}
        <div className="rounded-xl border p-5 space-y-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[13px] font-semibold">Parameters</h2>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Starting Annual Income</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>{formatCurrency(startingIncome)}</span>
            </div>
            <input type="range" min={5000} max={500000} step={5000} value={startingIncome}
              onChange={e => setStartingIncome(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Savings Rate</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>{savingsRate}%</span>
            </div>
            <input type="range" min={5} max={70} step={5} value={savingsRate}
              onChange={e => setSavingsRate(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Annual Growth Rate</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>{growthRate}%</span>
            </div>
            <input type="range" min={1} max={20} step={1} value={growthRate}
              onChange={e => setGrowthRate(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-medium">Time Horizon</label>
              <span className="text-[12px] font-mono font-medium" style={{ color: 'var(--accent)' }}>{horizon} years</span>
            </div>
            <div className="flex gap-2">
              {[5, 10, 20, 50].map(h => (
                <button key={h} onClick={() => setHorizon(h)}
                  className="flex-1 py-2 rounded-lg text-[12px] font-medium border transition-all"
                  style={{
                    borderColor: horizon === h ? 'var(--accent)' : 'var(--border)',
                    background: horizon === h ? 'var(--accent)' : 'transparent',
                    color: horizon === h ? '#fff' : 'var(--foreground)',
                  }}>
                  {h}y
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[12px] font-medium mb-1 block">Location</label>
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
              style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <option value="southeast-asia">Southeast Asia</option>
              <option value="europe">Europe</option>
              <option value="usa">USA</option>
              <option value="australia">Australia</option>
              <option value="east-asia">East Asia</option>
              <option value="south-america">South America</option>
              <option value="africa">Africa</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Model Button */}
        <button onClick={model} disabled={!scenario.trim()}
          className="w-full py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: scenario.trim() ? 'var(--warning)' : 'var(--surface-hover)',
            color: scenario.trim() ? '#fff' : 'var(--muted)',
            cursor: scenario.trim() ? 'pointer' : 'not-allowed',
            boxShadow: scenario.trim() ? 'var(--shadow-md)' : 'none',
          }}>
          <ClockIcon />
          Model Trajectory
        </button>

        {/* Results */}
        {milestones && (
          <div className="space-y-4">
            {/* Wealth Chart */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[13px] font-semibold mb-4">Wealth Trajectory</h2>
              <div className="space-y-2">
                {milestones.map(m => (
                  <div key={m.year} className="flex items-center gap-3">
                    <span className="text-[11px] w-10 text-right font-mono" style={{ color: 'var(--muted-foreground)' }}>Y{m.year}</span>
                    <div className="flex-1 h-5 rounded" style={{ background: 'var(--surface-hover)' }}>
                      <div className="h-full rounded flex items-center px-2 transition-all"
                        style={{
                          width: `${Math.max((m.wealth / maxWealth) * 100, 3)}%`,
                          background: `linear-gradient(90deg, var(--accent), var(--success))`,
                          fontSize: '9px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap',
                        }}>
                        {formatCurrency(m.wealth)}
                      </div>
                    </div>
                    {m.label && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: 'var(--surface-hover)', color: 'var(--muted-foreground)' }}>
                        {m.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Table */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[13px] font-semibold mb-3">Projected Milestones</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ color: 'var(--muted-foreground)' }}>
                      <th className="text-left py-2 pr-3 font-medium">Year</th>
                      <th className="text-right py-2 pr-3 font-medium">Wealth</th>
                      <th className="text-right py-2 pr-3 font-medium">Income %ile</th>
                      <th className="text-left py-2 pr-3 font-medium">Education Access</th>
                      <th className="text-right py-2 font-medium">QoL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {milestones.map(m => (
                      <tr key={m.year} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td className="py-2 pr-3 font-mono">{m.year}</td>
                        <td className="py-2 pr-3 text-right font-mono font-medium" style={{ color: 'var(--success)' }}>
                          {formatCurrency(m.wealth)}
                        </td>
                        <td className="py-2 pr-3 text-right font-mono">
                          <span className="px-2 py-0.5 rounded text-[10px]" style={{
                            background: m.incomePercentile > 70 ? 'rgba(16,185,129,0.1)' : m.incomePercentile > 40 ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                            color: m.incomePercentile > 70 ? 'var(--success)' : m.incomePercentile > 40 ? 'var(--accent)' : 'var(--danger)',
                          }}>
                            P{m.incomePercentile}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-[11px]">{m.educationAccess}</td>
                        <td className="py-2 text-right font-mono">{m.locationQoL}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
