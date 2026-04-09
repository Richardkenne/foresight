'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CrashTestScenario } from '@/lib/crash-test';
import { runCrashTest } from '@/lib/crash-test';
import type { UserProfile } from '@/lib/user-profile';

interface CrashTestPanelProps {
  currentScenario?: string;
  profile: UserProfile;
  sacredMode: boolean;
  onLoadScenario: (scenario: CrashTestScenario) => void;
  onClose: () => void;
}

const MAX_SCENARIOS = 5;

function genId() {
  return `ct-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function getRateColor(rate: number): string {
  if (rate >= 30) return '#10b981';
  if (rate >= 10) return '#f59e0b';
  return '#ef4444';
}

function getRateBg(rate: number): string {
  if (rate >= 30) return 'rgba(16,185,129,0.08)';
  if (rate >= 10) return 'rgba(245,158,11,0.08)';
  return 'rgba(239,68,68,0.08)';
}

export default function CrashTestPanel({
  currentScenario,
  profile,
  sacredMode,
  onLoadScenario,
  onClose,
}: CrashTestPanelProps) {
  const [inputs, setInputs] = useState<{ id: string; value: string }[]>(() => {
    const initial = [
      { id: genId(), value: currentScenario || '' },
      { id: genId(), value: '' },
      { id: genId(), value: '' },
    ];
    return initial;
  });
  const [scenarios, setScenarios] = useState<CrashTestScenario[]>([]);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'input' | 'results'>('input');
  const abortRef = useRef<AbortController | null>(null);

  const updateInput = useCallback((id: string, value: string) => {
    setInputs(prev => prev.map(i => i.id === id ? { ...i, value } : i));
  }, []);

  const addInput = useCallback(() => {
    if (inputs.length >= MAX_SCENARIOS) return;
    setInputs(prev => [...prev, { id: genId(), value: '' }]);
  }, [inputs.length]);

  const removeInput = useCallback((id: string) => {
    if (inputs.length <= 2) return;
    setInputs(prev => prev.filter(i => i.id !== id));
  }, [inputs.length]);

  const handleRun = useCallback(async () => {
    const validInputs = inputs.filter(i => i.value.trim());
    if (validInputs.length < 2) return;

    setRunning(true);
    abortRef.current = new AbortController();

    // Initialize scenarios
    const initial: CrashTestScenario[] = validInputs.map(i => ({
      id: i.id,
      name: i.value.trim(),
      status: 'pending',
    }));
    setScenarios(initial);
    setPhase('results');

    await runCrashTest(
      validInputs.map(i => ({ id: i.id, name: i.value.trim() })),
      profile,
      sacredMode,
      (id, partial) => {
        setScenarios(prev => prev.map(s => s.id === id ? { ...s, ...partial } : s));
      },
      abortRef.current.signal,
    );

    setRunning(false);
  }, [inputs, profile, sacredMode]);

  const handleBack = useCallback(() => {
    setPhase('input');
    setScenarios([]);
  }, []);

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  // Sort results: done first, then by survival rate desc
  const sortedScenarios = [...scenarios].sort((a, b) => {
    if (a.status !== 'done' && b.status === 'done') return 1;
    if (a.status === 'done' && b.status !== 'done') return -1;
    return (b.stats?.survivalRate ?? 0) - (a.stats?.survivalRate ?? 0);
  });

  const bestRate = sortedScenarios[0]?.stats?.survivalRate ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 right-0 z-[100]"
      style={{ width: 420, height: '100vh' }}
    >
      <div
        className="h-full flex flex-col overflow-hidden"
        style={{
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(239,68,68,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
                  Crash Test
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {phase === 'input' ? 'Compare alternative paths' : `${scenarios.filter(s => s.status === 'done').length}/${scenarios.length} complete`}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-2)', color: 'var(--muted)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <AnimatePresence mode="wait">
            {phase === 'input' ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 py-4"
              >
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 'var(--space-4)' }}>
                  Enter 2-5 alternative scenarios. Same person, different choices. The simulator runs 100 people through each and shows who survives.
                </div>

                <div className="space-y-3">
                  {inputs.map((input, i) => (
                    <div key={input.id} className="flex items-center gap-2">
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        background: 'rgba(100,116,139,0.08)', color: 'var(--muted)',
                      }}>
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={input.value}
                        onChange={(e) => updateInput(input.id, e.target.value)}
                        placeholder={i === 0 ? 'e.g. Send Upwork proposals' : i === 1 ? 'e.g. Keep building Simulator' : 'e.g. Get a job in Bandung'}
                        className="flex-1"
                        style={{
                          padding: 'var(--space-3) var(--space-4)',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'transparent',
                          fontSize: 13,
                          color: 'var(--foreground)',
                          outline: 'none',
                          fontFamily: 'Inter, system-ui',
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleRun(); }}
                      />
                      {inputs.length > 2 && (
                        <button
                          onClick={() => removeInput(input.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)', color: 'var(--muted)' }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {inputs.length < MAX_SCENARIOS && (
                  <button
                    onClick={addInput}
                    style={{
                      marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', borderRadius: 8,
                      border: '1px dashed var(--border)', background: 'transparent',
                      fontSize: 12, color: 'var(--muted)', cursor: 'pointer',
                      fontFamily: 'Inter, system-ui', width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add scenario
                  </button>
                )}

                <button
                  onClick={handleRun}
                  disabled={inputs.filter(i => i.value.trim()).length < 2}
                  style={{
                    marginTop: 'var(--space-6)', padding: 'var(--space-3) var(--space-6)', borderRadius: 12, width: '100%',
                    background: inputs.filter(i => i.value.trim()).length >= 2
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'var(--border)',
                    color: inputs.filter(i => i.value.trim()).length >= 2 ? '#fff' : 'var(--muted)',
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, system-ui',
                    boxShadow: inputs.filter(i => i.value.trim()).length >= 2
                      ? '0 4px 16px rgba(239,68,68,0.3)'
                      : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Run Crash Test
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-5 py-4"
              >
                {/* Results */}
                <div className="space-y-3">
                  {sortedScenarios.map((s, i) => {
                    const isDone = s.status === 'done';
                    const isError = s.status === 'error';
                    const isBest = isDone && s.stats?.survivalRate === bestRate && bestRate > 0;
                    const rate = s.stats?.survivalRate ?? 0;

                    return (
                      <div
                        key={s.id}
                        style={{
                          borderRadius: 12,
                          border: `1px solid ${isBest ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                          background: isBest ? 'rgba(16,185,129,0.04)' : 'transparent',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {/* Scenario header */}
                        <div className="px-4 pt-3 pb-2 flex items-start justify-between">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div style={{
                              width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 10, fontWeight: 700,
                              background: isDone ? getRateBg(rate) : 'rgba(100,116,139,0.08)',
                              color: isDone ? getRateColor(rate) : 'var(--muted)',
                            }}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>
                                {s.name}
                              </div>
                              {isError && (
                                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 'var(--space-1)' }}>{s.error}</div>
                              )}
                            </div>
                          </div>

                          {/* Status / Rate */}
                          {!isDone && !isError && (
                            <div className="flex items-center gap-1.5" style={{ fontSize: 10, color: 'var(--muted)' }}>
                              <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                              </svg>
                              {s.status === 'generating' ? 'Generating...' : 'Simulating...'}
                            </div>
                          )}
                          {isDone && (
                            <div style={{
                              fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em',
                              color: getRateColor(rate),
                              fontVariantNumeric: 'tabular-nums',
                              lineHeight: 1,
                            }}>
                              {rate}%
                            </div>
                          )}
                        </div>

                        {/* Stats row */}
                        {isDone && s.stats && (
                          <div className="px-4 pb-3">
                            {/* Survival bar */}
                            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginBottom: 'var(--space-2)' }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${rate}%` }}
                                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                                style={{ height: '100%', background: getRateColor(rate), borderRadius: 2 }}
                              />
                            </div>

                            {/* Compound + survivors */}
                            <div className="flex items-center gap-4 mb-2" style={{ fontSize: 11 }}>
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Compound: </span>
                                <span style={{ fontWeight: 700, color: getRateColor(s.stats.compoundProbability), fontVariantNumeric: 'tabular-nums' }}>
                                  {s.stats.compoundProbability}%
                                </span>
                              </div>
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Survived: </span>
                                <span style={{ fontWeight: 700, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
                                  {s.stats.survivors}/{s.stats.totalPeople}
                                </span>
                              </div>
                              <div>
                                <span style={{ color: 'var(--muted)' }}>Steps: </span>
                                <span style={{ fontWeight: 600, color: 'var(--foreground)', fontVariantNumeric: 'tabular-nums' }}>
                                  {s.stats.pathLength}
                                </span>
                              </div>
                            </div>

                            {/* Fatal gate */}
                            {s.stats.fatalGate && (
                              <div style={{
                                padding: 'var(--space-2) var(--space-3)', borderRadius: 8,
                                background: 'rgba(239,68,68,0.06)',
                                border: '1px solid rgba(239,68,68,0.1)',
                              }}>
                                <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#ef4444', marginBottom: 3 }}>
                                  #1 killer
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>
                                  {s.stats.fatalGate.label}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                                  {s.stats.fatalGate.deaths} of {s.stats.totalPeople} died here ({s.stats.fatalGate.prob}% pass rate)
                                </div>
                              </div>
                            )}

                            {/* Other killers */}
                            {s.stats.topKillers.length > 1 && (
                              <div className="mt-2 space-y-1">
                                {s.stats.topKillers.slice(1, 3).map(k => (
                                  <div key={k.nodeId} className="flex items-center justify-between" style={{ fontSize: 10, color: 'var(--muted)' }}>
                                    <span>{k.label}</span>
                                    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{k.deaths} died</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Load button */}
                            <button
                              onClick={() => onLoadScenario(s)}
                              style={{
                                marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', borderRadius: 8, width: '100%',
                                border: '1px solid var(--border)', background: 'transparent',
                                fontSize: 11, fontWeight: 600, color: 'var(--foreground)',
                                cursor: 'pointer', fontFamily: 'Inter, system-ui',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 3 21 3 21 9" /><path d="M21 3l-7 7" /><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
                              </svg>
                              Load on canvas
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom actions */}
                <div className="flex gap-2 mt-4">
                  {running ? (
                    <button
                      onClick={handleStop}
                      style={{
                        flex: 1, padding: 'var(--space-3) var(--space-4)', borderRadius: 10,
                        border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)',
                        fontSize: 12, fontWeight: 600, color: '#ef4444',
                        cursor: 'pointer', fontFamily: 'Inter, system-ui',
                      }}
                    >
                      Stop
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleBack}
                        style={{
                          flex: 1, padding: 'var(--space-3) var(--space-4)', borderRadius: 10,
                          border: '1px solid var(--border)', background: 'transparent',
                          fontSize: 12, fontWeight: 600, color: 'var(--foreground)',
                          cursor: 'pointer', fontFamily: 'Inter, system-ui',
                        }}
                      >
                        Edit scenarios
                      </button>
                      <button
                        onClick={handleRun}
                        style={{
                          flex: 1, padding: 'var(--space-3) var(--space-4)', borderRadius: 10,
                          border: 'none', background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          fontSize: 12, fontWeight: 600, color: '#fff',
                          cursor: 'pointer', fontFamily: 'Inter, system-ui',
                          boxShadow: '0 4px 12px rgba(239,68,68,0.2)',
                        }}
                      >
                        Run again
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
