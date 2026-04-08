'use client';

import { motion } from 'framer-motion';

interface SimStats {
  total: number;
  success: number;
  blocked: number;
}

interface ScenarioSnapshot {
  scenario: string;
  stats: SimStats;
  bottlenecks: { label: string; actualRate: number; expectedRate: number }[];
}

interface ComparisonDashboardProps {
  scenarioA: ScenarioSnapshot;
  scenarioB: ScenarioSnapshot;
  onClose: () => void;
  onViewA?: () => void;
  onViewB?: () => void;
}

export default function ComparisonDashboard({ scenarioA, scenarioB, onClose, onViewA, onViewB }: ComparisonDashboardProps) {
  const rateA = scenarioA.stats.total > 0 ? Math.round(scenarioA.stats.success / scenarioA.stats.total * 100) : 0;
  const rateB = scenarioB.stats.total > 0 ? Math.round(scenarioB.stats.success / scenarioB.stats.total * 100) : 0;
  const delta = rateB - rateA;
  const winner = delta > 0 ? 'B' : delta < 0 ? 'A' : null;

  return (
    <motion.div
      className="w-full sm:w-[420px] shrink-0 h-full bg-[var(--surface)] border-l border-[var(--border)] flex flex-col overflow-hidden"
      style={{ maxWidth: '100vw' }}
      initial={{ x: 420, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 420, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-6 pb-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[var(--foreground)] tracking-tight">A vs B Comparison</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
            {scenarioA.stats.total + scenarioB.stats.total} total simulated
          </p>
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
      <div className="overflow-y-auto px-6 pb-6 flex-1">

        {/* Verdict */}
        <div className="rounded-xl p-4 mb-5" style={{ background: winner ? (winner === 'A' ? 'rgba(99, 102, 241, 0.06)' : 'rgba(14, 165, 233, 0.06)') : 'var(--surface-hover)', outline: '1px solid var(--border)' }}>
          <div className="text-[11px] uppercase tracking-[0.1em] font-medium mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
            Verdict
          </div>
          <div className="text-[14px] font-semibold" style={{ color: 'var(--foreground)' }}>
            {winner
              ? `Scenario ${winner} has a ${Math.abs(delta)}% higher success rate`
              : 'Both scenarios have equal success rates'}
          </div>
        </div>

        {/* Side-by-side metrics */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Scenario A */}
          <div className="rounded-xl p-3" style={{ outline: '1px solid var(--border)', background: winner === 'A' ? 'rgba(99, 102, 241, 0.04)' : 'transparent' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
              <span className="text-[9px] uppercase tracking-[0.1em] font-semibold" style={{ color: '#6366f1', fontFamily: 'var(--font-geist-mono)' }}>Scenario A</span>
            </div>
            <div className="text-[10px] mb-3 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{scenarioA.scenario}</div>
            <div className="space-y-2">
              <div>
                <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: rateA >= 50 ? '#059669' : rateA >= 25 ? '#d97706' : '#dc2626' }}>{rateA}%</div>
                <div className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Success rate</div>
              </div>
              <div className="flex gap-3">
                <div>
                  <div className="text-[13px] font-semibold tabular-nums text-emerald-600" style={{ fontFamily: 'var(--font-geist-mono)' }}>{scenarioA.stats.success}</div>
                  <div className="text-[8px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Made it</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold tabular-nums text-red-500" style={{ fontFamily: 'var(--font-geist-mono)' }}>{scenarioA.stats.blocked}</div>
                  <div className="text-[8px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Stopped</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scenario B */}
          <div className="rounded-xl p-3" style={{ outline: '1px solid var(--border)', background: winner === 'B' ? 'rgba(14, 165, 233, 0.04)' : 'transparent' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#0ea5e9' }} />
              <span className="text-[9px] uppercase tracking-[0.1em] font-semibold" style={{ color: '#0ea5e9', fontFamily: 'var(--font-geist-mono)' }}>Scenario B</span>
            </div>
            <div className="text-[10px] mb-3 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>{scenarioB.scenario}</div>
            <div className="space-y-2">
              <div>
                <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: rateB >= 50 ? '#059669' : rateB >= 25 ? '#d97706' : '#dc2626' }}>{rateB}%</div>
                <div className="text-[9px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Success rate</div>
              </div>
              <div className="flex gap-3">
                <div>
                  <div className="text-[13px] font-semibold tabular-nums text-emerald-600" style={{ fontFamily: 'var(--font-geist-mono)' }}>{scenarioB.stats.success}</div>
                  <div className="text-[8px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Made it</div>
                </div>
                <div>
                  <div className="text-[13px] font-semibold tabular-nums text-red-500" style={{ fontFamily: 'var(--font-geist-mono)' }}>{scenarioB.stats.blocked}</div>
                  <div className="text-[8px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted)' }}>Stopped</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delta bar */}
        <div className="rounded-xl p-3 mb-5" style={{ outline: '1px solid var(--border)' }}>
          <div className="text-[10px] uppercase tracking-[0.1em] font-medium mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
            Delta
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[6px] rounded-full overflow-hidden relative" style={{ background: 'var(--surface-hover)' }}>
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: 'var(--border)' }} />
              {/* Delta indicator */}
              {delta !== 0 && (
                <div
                  className="absolute top-0 bottom-0 rounded-full transition-all duration-500"
                  style={{
                    left: delta > 0 ? '50%' : `${50 + delta / 2}%`,
                    width: `${Math.abs(delta) / 2}%`,
                    background: delta > 0 ? '#0ea5e9' : '#6366f1',
                  }}
                />
              )}
            </div>
            <span className="text-[12px] font-semibold tabular-nums shrink-0" style={{
              color: delta > 0 ? '#0ea5e9' : delta < 0 ? '#6366f1' : 'var(--muted)',
              fontFamily: 'var(--font-geist-mono)',
            }}>
              {delta > 0 ? '+' : ''}{delta}%
            </span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px]" style={{ color: '#6366f1' }}>A better</span>
            <span className="text-[8px]" style={{ color: '#0ea5e9' }}>B better</span>
          </div>
        </div>

        {/* Bottleneck comparison */}
        {(scenarioA.bottlenecks.length > 0 || scenarioB.bottlenecks.length > 0) && (
          <div className="mb-4">
            <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
              Deadliest Bottlenecks
            </h3>

            {scenarioA.bottlenecks.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
                  <span className="text-[9px] font-medium" style={{ color: '#6366f1' }}>Scenario A</span>
                </div>
                <div className="rounded-lg overflow-hidden" style={{ outline: '1px solid var(--border)' }}>
                  {scenarioA.bottlenecks.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2" style={{ borderBottom: i < Math.min(scenarioA.bottlenecks.length, 3) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <span className="text-[10px] truncate flex-1" style={{ color: 'var(--foreground)' }}>{b.label}</span>
                      <span className="text-[10px] font-semibold tabular-nums ml-2" style={{ color: b.actualRate < b.expectedRate ? '#dc2626' : '#059669', fontFamily: 'var(--font-geist-mono)' }}>
                        {b.actualRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {scenarioB.bottlenecks.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#0ea5e9' }} />
                  <span className="text-[9px] font-medium" style={{ color: '#0ea5e9' }}>Scenario B</span>
                </div>
                <div className="rounded-lg overflow-hidden" style={{ outline: '1px solid var(--border)' }}>
                  {scenarioB.bottlenecks.slice(0, 3).map((b, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2" style={{ borderBottom: i < Math.min(scenarioB.bottlenecks.length, 3) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <span className="text-[10px] truncate flex-1" style={{ color: 'var(--foreground)' }}>{b.label}</span>
                      <span className="text-[10px] font-semibold tabular-nums ml-2" style={{ color: b.actualRate < b.expectedRate ? '#dc2626' : '#059669', fontFamily: 'var(--font-geist-mono)' }}>
                        {b.actualRate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
        {onViewA && (
          <button
            onClick={onViewA}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium cursor-pointer transition-all hover:opacity-80"
            style={{ outline: '1px solid #6366f1', color: '#6366f1' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: '#6366f1' }} />
            View A
          </button>
        )}
        {onViewB && (
          <button
            onClick={onViewB}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-medium cursor-pointer transition-all hover:opacity-80"
            style={{ outline: '1px solid #0ea5e9', color: '#0ea5e9' }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: '#0ea5e9' }} />
            View B
          </button>
        )}
      </div>
    </motion.div>
  );
}
