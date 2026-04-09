'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { MultiAgentResult } from '@/lib/multi-agent';

interface MultiAgentResultsProps {
  result: MultiAgentResult;
  onClose: () => void;
}

// Simple horizontal bar for histograms
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-5 w-full rounded-sm overflow-hidden" style={{ background: 'var(--surface-hover)' }}>
      <div
        className="h-full rounded-sm transition-all duration-500"
        style={{ width: `${pct}%`, background: color, minWidth: value > 0 ? '2px' : '0' }}
      />
    </div>
  );
}

export default function MultiAgentResults({ result, onClose }: MultiAgentResultsProps) {
  const maxSegCount = Math.max(...result.segmentation.byCapital.map(s => s.count), 1);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <motion.div
          className="relative w-[90vw] max-w-[900px] max-h-[85vh] overflow-y-auto rounded-xl"
          style={{
            background: 'var(--surface)',
            boxShadow: '0 0 0 1px var(--border), 0 24px 48px color-mix(in srgb, var(--foreground) 20%, transparent)',
          }}
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                Multi-Agent Simulation
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                {result.totalAgents.toLocaleString()} agents | deterministic seed-based
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md transition-colors cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* ─── Overview ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total" value={result.totalAgents.toLocaleString()} />
              <StatCard label="Success rate" value={`${result.successRate}%`} accent="var(--success)" />
              <StatCard label="Failure rate" value={`${result.failureRate}%`} accent="var(--danger)" />
              <StatCard label="Bottlenecks" value={String(result.bottleneckAnalysis.length)} />
            </div>

            {/* ─── Key Insights ─── */}
            {result.keyInsights.length > 0 && (
              <section>
                <SectionTitle>Key Insights</SectionTitle>
                <div className="space-y-1.5">
                  {result.keyInsights.map((insight, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 rounded-lg text-[12px]"
                      style={{ background: 'var(--surface-hover)', color: 'var(--foreground)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-px">
                        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
                      </svg>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ─── Bottleneck Analysis ─── */}
            {result.bottleneckAnalysis.length > 0 && (
              <section>
                <SectionTitle>Bottleneck Analysis</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                    <thead>
                      <tr style={{ color: 'var(--muted)' }}>
                        <th className="text-left py-1.5 px-2 font-medium">Node</th>
                        <th className="text-right py-1.5 px-2 font-medium">Pass Rate</th>
                        <th className="text-right py-1.5 px-2 font-medium">Avg Capital (passers)</th>
                        <th className="text-left py-1.5 px-2 font-medium w-32">Distribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.bottleneckAnalysis.map((bn, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td className="py-1.5 px-2 font-medium" style={{ color: 'var(--foreground)' }}>{bn.nodeLabel}</td>
                          <td className="py-1.5 px-2 text-right" style={{ color: bn.passRate < 30 ? 'var(--danger)' : bn.passRate < 60 ? 'var(--warning)' : 'var(--success)' }}>
                            {bn.passRate}%
                          </td>
                          <td className="py-1.5 px-2 text-right" style={{ color: 'var(--muted-foreground)' }}>
                            ${bn.avgCapitalOfPassers.toLocaleString()}
                          </td>
                          <td className="py-1.5 px-2">
                            <Bar value={bn.passRate} max={100} color={bn.passRate < 30 ? 'var(--danger)' : bn.passRate < 60 ? 'var(--warning)' : 'var(--success)'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ─── Segmentation: By Capital ─── */}
            <section>
              <SectionTitle>By Capital</SectionTitle>
              <div className="space-y-1">
                {result.segmentation.byCapital.map((seg) => (
                  <SegRow key={seg.range} label={seg.range} successRate={seg.successRate} count={seg.count} maxCount={maxSegCount} />
                ))}
              </div>
            </section>

            {/* ─── Segmentation: By Age ─── */}
            <section>
              <SectionTitle>By Age</SectionTitle>
              <div className="space-y-1">
                {result.segmentation.byAge.map((seg) => (
                  <SegRow key={seg.range} label={seg.range} successRate={seg.successRate} count={seg.count} maxCount={Math.max(...result.segmentation.byAge.map(s => s.count), 1)} />
                ))}
              </div>
            </section>

            {/* ─── Segmentation: By Country ─── */}
            <section>
              <SectionTitle>By Country (top 10)</SectionTitle>
              <div className="space-y-1">
                {result.segmentation.byCountry.map((seg) => (
                  <SegRow key={seg.country} label={seg.country} successRate={seg.successRate} count={seg.count} maxCount={Math.max(...result.segmentation.byCountry.map(s => s.count), 1)} />
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Sub-components ───

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-hover)' }}>
      <div className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{label}</div>
      <div className="text-lg font-semibold mt-0.5" style={{ color: accent || 'var(--foreground)', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
      {children}
    </h3>
  );
}

function SegRow({ label, successRate, count, maxCount }: { label: string; successRate: number; count: number; maxCount: number }) {
  return (
    <div className="flex items-center gap-2 text-[11px]" style={{ fontFamily: 'var(--font-geist-mono)' }}>
      <span className="w-24 shrink-0 truncate" style={{ color: 'var(--foreground)' }}>{label}</span>
      <span className="w-12 text-right shrink-0" style={{ color: successRate > 30 ? 'var(--success)' : successRate > 10 ? 'var(--warning)' : 'var(--danger)' }}>
        {successRate}%
      </span>
      <div className="flex-1">
        <Bar value={count} max={maxCount} color="var(--accent)" />
      </div>
      <span className="w-10 text-right shrink-0" style={{ color: 'var(--muted)' }}>{count}</span>
    </div>
  );
}
