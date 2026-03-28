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

  // Build funnel: ordered by x position (left to right = flow order)
  const ordered = [...nodes].sort((a, b) => (a.position.x || 0) - (b.position.x || 0));

  // Funnel rows — only main path nodes (not failure outcomes)
  const funnelNodes = ordered.filter(n => (n.data as Record<string, unknown>).nodeType !== 'outcome-bad');
  const rows = funnelNodes.map(n => {
    const unique = nodeUniqueReach[n.id] ? nodeUniqueReach[n.id].size : 0;
    const pct = totalPeople > 0 ? Math.round(unique / totalPeople * 100) : 0;
    return { label: (n.data as Record<string, unknown>).label as string, unique, pct, type: (n.data as Record<string, unknown>).nodeType as string };
  }).filter(r => r.unique > 0);

  // Find deadliest bottlenecks
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

  const typeColor = (type: string) => {
    switch (type) {
      case 'outcome-good': return { bar: '#16a34a', bg: 'rgba(22,163,106,0.08)' };
      case 'bottleneck': return { bar: '#f59e0b', bg: 'rgba(245,158,11,0.08)' };
      case 'decision': return { bar: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' };
      case 'desire': return { bar: '#ec4899', bg: 'rgba(236,72,153,0.08)' };
      default: return { bar: '#3b82f6', bg: 'rgba(59,130,246,0.08)' };
    }
  };

  return (
    <div
      className="w-full sm:w-[360px] shrink-0 h-full bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden"
    >
        {/* Header */}
        <div className="flex justify-between items-center px-5 pt-4 pb-3 border-b border-[var(--border)]" style={{ borderTop: '2px solid var(--accent)' }}>
          <div>
            <h2 className="text-[17px] font-bold text-[var(--foreground)] tracking-tight">Simulation Results</h2>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">{totalPeople} unique people simulated</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 py-4 flex-1" style={{ scrollbarWidth: 'thin' }}>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-5 max-sm:gap-1">
            <div className="relative overflow-hidden rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(22,163,106,0.06) 0%, rgba(22,163,106,0.12) 100%)', border: '1px solid rgba(22,163,106,0.12)' }}>
              <div className="text-2xl font-extrabold text-green-600 dark:text-green-400 tabular-nums">{stats.success}</div>
              <div className="text-[11px] font-medium text-green-700/60 dark:text-green-400/60 mt-1 uppercase tracking-wider">Made It</div>
            </div>
            <div className="relative overflow-hidden rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.12) 100%)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <div className="text-2xl font-extrabold text-red-600 dark:text-red-400 tabular-nums">{stats.blocked}</div>
              <div className="text-[11px] font-medium text-red-700/60 dark:text-red-400/60 mt-1 uppercase tracking-wider">Stopped</div>
            </div>
            <div className="relative overflow-hidden rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.12) 100%)', border: '1px solid rgba(59,130,246,0.12)' }}>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">{successRate}%</div>
              <div className="text-[11px] font-medium text-blue-700/60 dark:text-blue-400/60 mt-1 uppercase tracking-wider">Success Rate</div>
            </div>
          </div>

          {/* Survival funnel */}
          <div className="mb-6">
            <h3 className="text-[11px] text-[var(--muted)] uppercase tracking-[0.1em] font-semibold mb-3">Survival Funnel</h3>
            <div className="space-y-1.5">
              {rows.slice(0, 14).map((r, i) => {
                const barW = Math.max(6, Math.round(r.unique / maxReach * 100));
                const colors = typeColor(r.type);
                return (
                  <div key={i} className="group flex items-center gap-2.5">
                    <div className="w-[120px] min-w-[120px] text-right">
                      <span className="text-[11px] text-[var(--muted-foreground)] leading-tight line-clamp-2 block" title={r.label}>{r.label}</span>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900/50 rounded-md h-[22px] overflow-hidden relative" style={{ border: '1px solid rgba(0,0,0,0.04)' }}>
                      <div
                        className="h-full rounded-md flex items-center transition-all duration-500 ease-out"
                        style={{
                          width: `${barW}%`,
                          background: `linear-gradient(90deg, ${colors.bar}dd, ${colors.bar}88)`,
                          transitionDelay: `${i * 40}ms`,
                        }}
                      >
                        <span className="text-[10px] text-white font-bold pl-2 whitespace-nowrap drop-shadow-sm">
                          {r.unique}
                        </span>
                      </div>
                    </div>
                    <div className="w-[38px] min-w-[38px] text-right">
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: colors.bar }}>{r.pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deadliest bottlenecks */}
          {bottlenecks.length > 0 && (
            <div className="mb-4">
              <h3 className="text-[11px] text-[var(--muted)] uppercase tracking-[0.1em] font-semibold mb-3">Deadliest Bottlenecks</h3>
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
                {bottlenecks.slice(0, 6).map((b, i) => {
                  const isWorse = b.actualRate < b.expectedRate;
                  const diff = b.actualRate - b.expectedRate;
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface)]"
                      style={{ borderBottom: i < Math.min(bottlenecks.length, 6) - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                          style={{
                            background: isWorse ? 'rgba(239,68,68,0.1)' : 'rgba(22,163,106,0.1)',
                            color: isWorse ? '#ef4444' : '#16a34a',
                          }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-[12px] text-[var(--foreground)] truncate">{b.label}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <div className="text-right">
                          <div className="text-[12px] font-bold tabular-nums" style={{ color: isWorse ? '#ef4444' : '#16a34a' }}>
                            {b.actualRate}%
                          </div>
                          <div className="text-[9px] text-[var(--muted)]">actual</div>
                        </div>
                        <div className="text-[10px] text-gray-300 dark:text-gray-600">vs</div>
                        <div className="text-right">
                          <div className="text-[12px] font-medium text-[var(--muted-foreground)] tabular-nums">{b.expectedRate}%</div>
                          <div className="text-[9px] text-[var(--muted)]">expected</div>
                        </div>
                        <div
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums"
                          style={{
                            background: isWorse ? 'rgba(239,68,68,0.08)' : 'rgba(22,163,106,0.08)',
                            color: isWorse ? '#ef4444' : '#16a34a',
                          }}
                        >
                          {diff > 0 ? '+' : ''}{diff}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800/50">
          <p className="text-[10px] text-[var(--muted)] text-center">
            {totalPeople} unique people simulated. Metrics show unique reach, not visits.
          </p>
        </div>
    </div>
  );
}
