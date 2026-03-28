'use client';

import 'react';
import { type Node as RFNode } from '@xyflow/react';

interface SimStats {
  total: number;
  success: number;
  blocked: number;
}

interface DashboardProps {
  stats: SimStats;
  nodes: RFNode[];
  nodeUniqueReach: Record<string, Set<number>>;
  edges: { source: string; target: string; label?: string }[];
  onClose: () => void;
}

export default function Dashboard({ stats, nodes, nodeUniqueReach, edges, onClose }: DashboardProps) {

  const totalPeople = stats.total;
  const ordered = [...nodes].sort((a, b) => (a.position.x || 0) - (b.position.x || 0));

  const funnelNodes = ordered.filter(n => (n.data as Record<string, unknown>).nodeType !== 'outcome-bad');
  const rows = funnelNodes.map(n => {
    const unique = nodeUniqueReach[n.id] ? nodeUniqueReach[n.id].size : 0;
    const pct = totalPeople > 0 ? Math.round(unique / totalPeople * 100) : 0;
    return { label: (n.data as Record<string, unknown>).label as string, unique, pct, type: (n.data as Record<string, unknown>).nodeType as string };
  }).filter(r => r.unique > 0);

  const bottlenecks = nodes
    .filter(n => {
      const t = (n.data as Record<string, unknown>).nodeType;
      const p = (n.data as Record<string, unknown>).prob as number;
      return (t === 'bottleneck' || t === 'decision') && p < 100;
    })
    .map(n => {
      const reached = nodeUniqueReach[n.id] ? nodeUniqueReach[n.id].size : 0;
      const outEdges = edges.filter(e => e.source === n.id && (e.label === 'pass' || e.label === 'yes'));
      let passed = 0;
      if (outEdges.length > 0) {
        passed = nodeUniqueReach[outEdges[0].target] ? nodeUniqueReach[outEdges[0].target].size : 0;
      }
      const actualRate = reached > 0 ? Math.round(passed / reached * 100) : 0;
      return {
        label: (n.data as Record<string, unknown>).label as string,
        reached, passed, actualRate,
        expectedRate: (n.data as Record<string, unknown>).prob as number,
      };
    })
    .filter(b => b.reached > 0)
    .sort((a, b) => a.actualRate - b.actualRate);

  const maxReach = rows.length > 0 ? rows[0].unique : 1;
  const successRate = totalPeople > 0 ? Math.round(stats.success / totalPeople * 100) : 0;

  return (
    <div className="w-full sm:w-[380px] shrink-0 h-full bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5 pb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">Results</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{totalPeople} simulated</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto px-5 pb-5 flex-1">

        {/* Summary row */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 rounded-xl p-3" style={{ outline: '1px solid var(--border)' }}>
            <div className="text-[22px] font-semibold text-emerald-600 tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.success}</div>
            <div className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Made it</div>
          </div>
          <div className="flex-1 rounded-xl p-3" style={{ outline: '1px solid var(--border)' }}>
            <div className="text-[22px] font-semibold text-red-500 tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{stats.blocked}</div>
            <div className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Stopped</div>
          </div>
          <div className="flex-1 rounded-xl p-3" style={{ outline: '1px solid var(--border)' }}>
            <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: successRate >= 50 ? '#059669' : successRate >= 25 ? '#d97706' : '#dc2626' }}>{successRate}%</div>
            <div className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Rate</div>
          </div>
        </div>

        {/* Survival funnel */}
        <div className="mb-6">
          <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>Survival Funnel</h3>
          <div className="space-y-1">
            {rows.slice(0, 14).map((r, i) => {
              const barW = Math.max(4, Math.round(r.unique / maxReach * 100));
              return (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-[110px] min-w-[110px] text-right">
                    <span className="text-[10px] leading-tight line-clamp-2 block" style={{ color: 'var(--muted-foreground)' }} title={r.label}>{r.label}</span>
                  </div>
                  <div className="flex-1 rounded h-[18px] overflow-hidden relative" style={{ background: 'var(--surface-hover)' }}>
                    <div
                      className="h-full rounded flex items-center transition-all duration-500 ease-out"
                      style={{
                        width: `${barW}%`,
                        background: 'var(--foreground)',
                        opacity: 0.12 + (barW / 100) * 0.18,
                        transitionDelay: `${i * 30}ms`,
                      }}
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-medium tabular-nums" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>
                      {r.unique}
                    </span>
                  </div>
                  <div className="w-[34px] min-w-[34px] text-right">
                    <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{r.pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadliest bottlenecks */}
        {bottlenecks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>Deadliest Bottlenecks</h3>
            <div className="rounded-xl overflow-hidden" style={{ outline: '1px solid var(--border)' }}>
              {bottlenecks.slice(0, 6).map((b, i) => {
                const isWorse = b.actualRate < b.expectedRate;
                const diff = b.actualRate - b.expectedRate;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5"
                    style={{ borderBottom: i < Math.min(bottlenecks.length, 6) - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-medium tabular-nums w-4 shrink-0" style={{ color: isWorse ? '#dc2626' : '#059669', fontFamily: 'var(--font-geist-mono)' }}>
                        {i + 1}
                      </span>
                      <span className="text-[11px] truncate" style={{ color: 'var(--foreground)' }}>{b.label}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-2">
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: isWorse ? '#dc2626' : '#059669', fontFamily: 'var(--font-geist-mono)' }}>
                        {b.actualRate}%
                      </span>
                      <span className="text-[9px]" style={{ color: 'var(--muted)' }}>/</span>
                      <span className="text-[11px] tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                        {b.expectedRate}%
                      </span>
                      <span
                        className="text-[9px] font-medium px-1.5 py-0.5 rounded-full tabular-nums"
                        style={{
                          background: isWorse ? 'rgba(220, 38, 38, 0.08)' : 'rgba(5, 150, 105, 0.08)',
                          color: isWorse ? '#dc2626' : '#059669',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {diff > 0 ? '+' : ''}{diff}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-[9px] text-center" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
          Unique reach, not visits
        </p>
      </div>
    </div>
  );
}
