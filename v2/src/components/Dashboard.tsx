'use client';

import 'react';
import { motion } from 'framer-motion';
import { type Node as RFNode } from '@xyflow/react';
import { tokens } from '@/lib/design-tokens';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Text from '@/components/ui/Text';
import IconButton from '@/components/ui/IconButton';

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
  onReportOutcome?: () => void;
  onCompare?: () => void;
  scenario?: string;
}

export default function Dashboard({ stats, nodes, nodeUniqueReach, edges, onClose, onReportOutcome, onCompare, scenario }: DashboardProps) {

  const totalPeople = stats.total;
  const ordered = [...nodes].sort((a, b) => (a.position.x || 0) - (b.position.x || 0));

  const funnelNodes = ordered.filter(n => (n.data as Record<string, unknown>).nodeType !== 'outcome-bad');
  const rows = funnelNodes.map(n => {
    const unique = nodeUniqueReach[n.id] ? nodeUniqueReach[n.id].size : 0;
    const pct = totalPeople > 0 ? Math.round(unique / totalPeople * 100) : 0;
    return { label: (n.data as Record<string, unknown>).label as string, unique, pct, type: (n.data as Record<string, unknown>).nodeType as string };
  }).filter(r => r.unique > 0);

  // Collect all data sources from nodes
  const dataSources = ordered
    .map(n => {
      const d = n.data as Record<string, unknown>;
      const source = d.source as string;
      if (!source) return null;
      // Parse multi-source format: "Name 2024:70:2 | Name 2023:65:1"
      const sources = source.includes(':')
        ? source.split('|').map(s => s.trim().split(':')[0].trim())
        : [source];
      return {
        label: d.label as string,
        nodeType: d.nodeType as string,
        sources,
      };
    })
    .filter(Boolean) as { label: string; nodeType: string; sources: string[] }[];

  const bottlenecks = nodes
    .filter(n => {
      const t = (n.data as Record<string, unknown>).nodeType;
      const p = (n.data as Record<string, unknown>).prob as number;
      return (t === 'bottleneck' || t === 'decision' || t === 'gate') && p < 100;
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
    <motion.div
      className="w-full sm:w-[380px] shrink-0 h-full bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden"
      style={{ maxWidth: '100vw' }}
      initial={{ x: 380, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 380, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4">
        <div>
          <Text variant="subheading" as="h2">Results</Text>
          <Text variant="mono" as="p" muted style={{ fontSize: '11px', marginTop: '2px' }}>{totalPeople} simulated</Text>
        </div>
        <IconButton variant="ghost" size="sm" onClick={onClose} style={{ borderRadius: 'var(--radius-full)' }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </IconButton>
      </div>

      {/* Scrollable content */}
      <div className="overflow-y-auto px-6 pb-6 flex-1">

        {/* Summary row */}
        <div className="flex gap-2 mb-6">
          <Card variant="default" padding="sm" className="flex-1" style={{ boxShadow: 'none' }}>
            <Text variant="mono" as="div" style={{ fontSize: 'var(--text-2xl)', color: tokens.successHover }} className="tabular-nums">{stats.success}</Text>
            <Text variant="caption" as="div" style={{ fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Made it</Text>
          </Card>
          <Card variant="default" padding="sm" className="flex-1" style={{ boxShadow: 'none' }}>
            <Text variant="mono" as="div" style={{ fontSize: 'var(--text-2xl)', color: tokens.dangerHover }} className="tabular-nums">{stats.blocked}</Text>
            <Text variant="caption" as="div" style={{ fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Stopped</Text>
          </Card>
          <Card variant="default" padding="sm" className="flex-1" style={{ boxShadow: 'none' }}>
            <Text variant="mono" as="div" style={{ fontSize: 'var(--text-2xl)', color: successRate >= 50 ? tokens.successHover : successRate >= 25 ? tokens.warningHover : tokens.dangerHover }} className="tabular-nums">{successRate}%</Text>
            <Text variant="caption" as="div" style={{ fontSize: '9px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Rate</Text>
          </Card>
        </div>

        {/* Survival funnel */}
        <div className="mb-6">
          <Text variant="label" as="h3" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-geist-mono)', marginBottom: '12px', display: 'block' }}>Survival Funnel</Text>
          <div className="space-y-1">
            {rows.slice(0, 14).map((r, i) => {
              const barW = Math.max(4, Math.round(r.unique / maxReach * 100));
              return (
                <div key={i} className="flex items-center gap-2" style={{ minWidth: 0 }}>
                  <div className="text-right shrink-0" style={{ width: '40%', maxWidth: '130px', minWidth: '70px' }}>
                    <span className="text-[10px] leading-tight line-clamp-2 block" style={{ color: 'var(--muted-foreground)' }} title={r.label}>{r.label}</span>
                  </div>
                  <div className="flex-1 rounded h-[18px] overflow-hidden relative" style={{ background: 'var(--surface-hover)', minWidth: 0 }}>
                    <div
                      className="h-full rounded transition-all duration-500 ease-out"
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Deadliest bottlenecks */}
        {bottlenecks.length > 0 && (
          <div className="mb-4">
            <Text variant="label" as="h3" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-geist-mono)', marginBottom: '12px', display: 'block' }}>Deadliest Bottlenecks</Text>
            <Card variant="default" padding="none" style={{ overflow: 'hidden', boxShadow: 'none' }}>
              {bottlenecks.slice(0, 6).map((b, i) => {
                const isWorse = b.actualRate < b.expectedRate;
                const diff = b.actualRate - b.expectedRate;
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-3"
                    style={{ borderBottom: i < Math.min(bottlenecks.length, 6) - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[10px] font-medium tabular-nums w-4 shrink-0" style={{ color: isWorse ? tokens.dangerHover : tokens.successHover, fontFamily: 'var(--font-geist-mono)' }}>
                        {i + 1}
                      </span>
                      <span className="text-[11px] truncate" style={{ color: 'var(--foreground)' }}>{b.label}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="text-[11px] font-semibold tabular-nums" style={{ color: isWorse ? tokens.dangerHover : tokens.successHover, fontFamily: 'var(--font-geist-mono)' }}>
                        {b.actualRate}%
                      </span>
                      <span className="text-[9px]" style={{ color: 'var(--muted)' }}>/</span>
                      <span className="text-[11px] tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                        {b.expectedRate}%
                      </span>
                      <Badge variant={isWorse ? 'danger' : 'success'} size="sm" className="tabular-nums">
                        {diff > 0 ? '+' : ''}{diff}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* Data Sources */}
        {dataSources.length > 0 && (
          <div className="mb-4">
            <Text variant="label" as="h3" style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-geist-mono)', marginBottom: '12px', display: 'block' }}>Data Sources</Text>
            <Card variant="default" padding="none" style={{ overflow: 'hidden', boxShadow: 'none' }}>
              {dataSources.map((ds, i) => (
                <div
                  key={i}
                  className="px-3 py-2"
                  style={{ borderBottom: i < dataSources.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                >
                  <div className="text-[10px] font-medium mb-1 truncate" style={{ color: 'var(--foreground)' }} title={ds.label}>
                    {ds.label}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {ds.sources.map((src, j) => (
                      <span key={j} className="text-[9px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t flex flex-col gap-2" style={{ borderColor: 'var(--border)' }}>
        {onCompare && (
          <button
            onClick={onCompare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-medium cursor-pointer transition-all hover:opacity-90"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--foreground)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
            </svg>
            Compare with another scenario
          </button>
        )}
        {onReportOutcome && (
          <button
            onClick={onReportOutcome}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-medium cursor-pointer transition-all hover:opacity-90"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Report Your Outcome
          </button>
        )}
        {scenario && (
          <a
            href={`/execute?scenario=${encodeURIComponent(scenario)}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-medium transition-all hover:opacity-90"
            style={{
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
            Ready to Execute?
          </a>
        )}
        <Text variant="caption" as="p" muted style={{ fontSize: '9px', fontFamily: 'var(--font-geist-mono)', textAlign: 'center' }}>
          Unique reach, not visits
        </Text>
      </div>
    </motion.div>
  );
}
