'use client';

import { useState, useCallback } from 'react';

// ── Types ──

interface Domain {
  id: string;
  label: string;
  color: string;
  selected: boolean;
  value: number;
  projected: number | null;
}

interface CausalLink {
  from: string;
  to: string;
  weight: number;
}

interface RippleEffect {
  domain: string;
  current: number;
  projected: number;
  delta: number;
  chain: string[];
}

// ── Causal Model ──

const CAUSAL_LINKS: CausalLink[] = [
  { from: 'health', to: 'career', weight: 0.30 },
  { from: 'health', to: 'relationships', weight: 0.20 },
  { from: 'health', to: 'finance', weight: 0.10 },
  { from: 'career', to: 'finance', weight: 0.50 },
  { from: 'career', to: 'relationships', weight: 0.15 },
  { from: 'career', to: 'education', weight: 0.10 },
  { from: 'finance', to: 'health', weight: 0.15 },
  { from: 'finance', to: 'education', weight: 0.25 },
  { from: 'finance', to: 'relationships', weight: 0.10 },
  { from: 'relationships', to: 'health', weight: 0.25 },
  { from: 'relationships', to: 'career', weight: 0.10 },
  { from: 'education', to: 'career', weight: 0.35 },
  { from: 'education', to: 'finance', weight: 0.15 },
];

function computeRipple(domains: Domain[], changedId: string, newValue: number): RippleEffect[] {
  const current: Record<string, number> = {};
  const projected: Record<string, number> = {};
  for (const d of domains) {
    current[d.id] = d.value;
    projected[d.id] = d.value;
  }
  projected[changedId] = newValue;
  const delta = newValue - current[changedId];
  const chains: Record<string, string[]> = {};

  // BFS propagation (2 levels deep)
  const queue = [{ id: changedId, depth: 0, chain: [changedId] }];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const { id, depth, chain } = queue.shift()!;
    if (depth >= 2) continue;
    const outgoing = CAUSAL_LINKS.filter(l => l.from === id);
    for (const link of outgoing) {
      const impact = delta * link.weight * (depth === 0 ? 1 : 0.5);
      projected[link.to] = Math.min(10, Math.max(1, projected[link.to] + impact));
      const newChain = [...chain, link.to];
      chains[link.to] = newChain;
      if (!visited.has(`${id}-${link.to}`)) {
        visited.add(`${id}-${link.to}`);
        queue.push({ id: link.to, depth: depth + 1, chain: newChain });
      }
    }
  }

  return domains
    .filter(d => d.id !== changedId && d.selected)
    .map(d => ({
      domain: d.label,
      current: current[d.id],
      projected: Math.round(projected[d.id] * 10) / 10,
      delta: Math.round((projected[d.id] - current[d.id]) * 10) / 10,
      chain: chains[d.id] || [],
    }))
    .filter(r => Math.abs(r.delta) > 0.05);
}

// ── SVG Icons ──

function NetworkIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" /><circle cx="5" cy="19" r="3" /><circle cx="19" cy="19" r="3" />
      <line x1="12" y1="8" x2="5" y2="16" /><line x1="12" y1="8" x2="19" y2="16" />
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

const DOMAIN_COLORS: Record<string, string> = {
  health: '#10b981',
  career: '#3b82f6',
  finance: '#f59e0b',
  relationships: '#ec4899',
  education: '#8b5cf6',
};

export default function CausalityPage() {
  const [domains, setDomains] = useState<Domain[]>([
    { id: 'health', label: 'Health', color: DOMAIN_COLORS.health, selected: true, value: 7, projected: null },
    { id: 'career', label: 'Career', color: DOMAIN_COLORS.career, selected: true, value: 6, projected: null },
    { id: 'finance', label: 'Finance', color: DOMAIN_COLORS.finance, selected: true, value: 5, projected: null },
    { id: 'relationships', label: 'Relationships', color: DOMAIN_COLORS.relationships, selected: true, value: 7, projected: null },
    { id: 'education', label: 'Education', color: DOMAIN_COLORS.education, selected: true, value: 6, projected: null },
  ]);
  const [changedDomain, setChangedDomain] = useState<string>('health');
  const [newValue, setNewValue] = useState<number>(5);
  const [ripples, setRipples] = useState<RippleEffect[] | null>(null);

  const toggleDomain = useCallback((id: string) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, selected: !d.selected } : d));
  }, []);

  const updateDomainValue = useCallback((id: string, value: number) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, value } : d));
  }, []);

  const analyze = useCallback(() => {
    const effects = computeRipple(domains, changedDomain, newValue);
    setRipples(effects);
  }, [domains, changedDomain, newValue]);

  const selected = domains.filter(d => d.selected);

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center gap-3">
          <a href="/explore" className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <ArrowLeftIcon />
          </a>
          <NetworkIcon className="flex-shrink-0" style={{ color: 'var(--purple)' }} />
          <div>
            <h1 className="text-[15px] font-semibold tracking-tight">Cross-Domain Causality</h1>
            <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>See how changes in one domain ripple through your entire life</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        {/* Domain Selection */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <label className="text-[12px] font-medium uppercase tracking-wider mb-3 block" style={{ color: 'var(--muted-foreground)' }}>
            Select Domains
          </label>
          <div className="flex flex-wrap gap-2">
            {domains.map(d => (
              <button
                key={d.id}
                onClick={() => toggleDomain(d.id)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all"
                style={{
                  borderColor: d.selected ? d.color : 'var(--border)',
                  background: d.selected ? `${d.color}15` : 'transparent',
                  color: d.selected ? d.color : 'var(--muted-foreground)',
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Current State Sliders */}
        <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[13px] font-semibold">Current State</h2>
          {selected.map(d => (
            <div key={d.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-medium" style={{ color: d.color }}>{d.label}</label>
                <span className="text-[12px] font-mono font-medium" style={{ color: d.color }}>{d.value}/10</span>
              </div>
              <input
                type="range" min={1} max={10} step={1} value={d.value}
                onChange={e => updateDomainValue(d.id, Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: d.color }}
              />
            </div>
          ))}
        </div>

        {/* Intervention */}
        <div className="rounded-xl border p-5 space-y-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <h2 className="text-[13px] font-semibold">What-If Intervention</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Change Domain</label>
              <select
                value={changedDomain}
                onChange={e => setChangedDomain(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-[13px] outline-none"
                style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                {selected.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium mb-1 block" style={{ color: 'var(--muted-foreground)' }}>New Value: {newValue}/10</label>
              <input
                type="range" min={1} max={10} step={1} value={newValue}
                onChange={e => setNewValue(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer mt-2"
                style={{ accentColor: 'var(--accent)' }}
              />
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyze}
          className="w-full py-3 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2"
          style={{ background: 'var(--purple)', color: '#fff', boxShadow: 'var(--shadow-md)', cursor: 'pointer' }}
        >
          <NetworkIcon />
          Analyze Ripple Effects
        </button>

        {/* Network Diagram */}
        {ripples && (
          <div className="space-y-4">
            {/* Visual Network */}
            <div className="rounded-xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[13px] font-semibold mb-4">Causal Network</h2>
              <div className="relative" style={{ height: 280 }}>
                {/* Domain Nodes */}
                {selected.map((d, i) => {
                  const angle = (i / selected.length) * Math.PI * 2 - Math.PI / 2;
                  const cx = 50 + Math.cos(angle) * 35;
                  const cy = 50 + Math.sin(angle) * 35;
                  const effect = ripples.find(r => r.domain === d.label);
                  return (
                    <div
                      key={d.id}
                      className="absolute flex flex-col items-center gap-1"
                      style={{ left: `${cx}%`, top: `${cy}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-bold border-2"
                        style={{
                          borderColor: d.color,
                          background: `${d.color}20`,
                          color: d.color,
                        }}
                      >
                        {d.id === changedDomain ? newValue : (effect ? effect.projected : d.value)}
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: d.color }}>{d.label}</span>
                      {effect && (
                        <span className="text-[10px] font-mono font-medium" style={{ color: effect.delta > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {effect.delta > 0 ? '+' : ''}{effect.delta}
                        </span>
                      )}
                      {d.id === changedDomain && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent)', color: '#fff' }}>
                          changed
                        </span>
                      )}
                    </div>
                  );
                })}

                {/* Connection Lines (SVG overlay) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {CAUSAL_LINKS.filter(l => {
                    const fromD = selected.find(d => d.id === l.from);
                    const toD = selected.find(d => d.id === l.to);
                    return fromD && toD;
                  }).map((l, i) => {
                    const fromIdx = selected.findIndex(d => d.id === l.from);
                    const toIdx = selected.findIndex(d => d.id === l.to);
                    const fromAngle = (fromIdx / selected.length) * Math.PI * 2 - Math.PI / 2;
                    const toAngle = (toIdx / selected.length) * Math.PI * 2 - Math.PI / 2;
                    const x1 = 50 + Math.cos(fromAngle) * 35;
                    const y1 = 50 + Math.sin(fromAngle) * 35;
                    const x2 = 50 + Math.cos(toAngle) * 35;
                    const y2 = 50 + Math.sin(toAngle) * 35;
                    const active = l.from === changedDomain;
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={active ? DOMAIN_COLORS[l.from] : 'var(--border)'}
                        strokeWidth={active ? 0.4 : 0.15}
                        strokeOpacity={active ? 0.8 : 0.4}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Ripple Table */}
            <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 className="text-[13px] font-semibold mb-3">Ripple Effects</h2>
              <p className="text-[12px] mb-4" style={{ color: 'var(--muted-foreground)' }}>
                If <strong>{domains.find(d => d.id === changedDomain)?.label}</strong> changes from{' '}
                <strong>{domains.find(d => d.id === changedDomain)?.value}</strong> to <strong>{newValue}</strong>:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr style={{ color: 'var(--muted-foreground)' }}>
                      <th className="text-left py-1.5 pr-4 font-medium">Domain</th>
                      <th className="text-right py-1.5 pr-4 font-medium">Current</th>
                      <th className="text-right py-1.5 pr-4 font-medium">Projected</th>
                      <th className="text-right py-1.5 pr-4 font-medium">Impact</th>
                      <th className="text-left py-1.5 font-medium">Chain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ripples.map(r => (
                      <tr key={r.domain} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <td className="py-1.5 pr-4 font-medium">{r.domain}</td>
                        <td className="py-1.5 pr-4 text-right font-mono">{r.current}/10</td>
                        <td className="py-1.5 pr-4 text-right font-mono font-medium" style={{ color: 'var(--accent)' }}>{r.projected}/10</td>
                        <td className="py-1.5 pr-4 text-right font-mono" style={{ color: r.delta > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {r.delta > 0 ? '+' : ''}{r.delta}
                        </td>
                        <td className="py-1.5 text-[10px]" style={{ color: 'var(--muted)' }}>
                          {r.chain.join(' -> ')}
                        </td>
                      </tr>
                    ))}
                    {ripples.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center" style={{ color: 'var(--muted)' }}>No significant ripple effects detected</td>
                      </tr>
                    )}
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
