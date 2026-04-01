'use client';

import { motion } from 'framer-motion';
import type { Node as RFNode } from '@xyflow/react';
import { SPEED_LEVELS, SPEED_LABELS, SPD_BASE } from '@/lib/simulation-types';

const TOOLBAR_VARIANTS = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};
const TOOLBAR_TRANSITION = { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] };

interface IdleToolbarProps {
  replayMode: boolean;
  cutNodeId: string | null;
  hasStats: boolean;
  sacredMode: boolean;
  saving: boolean;
  shareUrl: string;
  canUndo: boolean;
  canRedo: boolean;
  viewMode?: '2d' | '3d';
  onUndo: () => void;
  onRedo: () => void;
  onSimulate: () => void;
  onSimulateFromCut: () => void;
  onRestart: () => void;
  onEnterStepMode: () => void;
  onSimulateReverse: () => void;
  onToggleReplayMode: () => void;
  onToggleSacredMode: () => void;
  onBacktest: () => void;
  onSave: () => void;
  onShare: () => void;
  onExportPNG: () => void;
  onClear: () => void;
}

export function IdleToolbar({
  replayMode, cutNodeId, hasStats, sacredMode, saving, shareUrl,
  canUndo, canRedo, onUndo, onRedo,
  onSimulate, onSimulateFromCut, onRestart, onEnterStepMode, onSimulateReverse,
  onToggleReplayMode, onToggleSacredMode, onBacktest, onSave, onShare, onExportPNG, onClear,
  viewMode = '2d',
}: IdleToolbarProps) {
  const is3D = viewMode === '3d';
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-3 py-2 flex items-center gap-2"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* Simulate (2D only) */}
        {!is3D && replayMode && cutNodeId ? (
          <button onClick={onSimulateFromCut} className="toolbar-btn toolbar-btn--primary" title="Replay from cut">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        ) : !is3D ? (
          <button onClick={onSimulate} disabled={replayMode} className="toolbar-btn toolbar-btn--primary" title="Simulate">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>
        ) : null}

        {/* Restart */}
        {hasStats && !is3D && (
          <button onClick={onRestart} className="toolbar-btn" title="Restart simulation">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
            </svg>
          </button>
        )}

        {/* Step mode (2D only) */}
        {!is3D && (
          <button onClick={onEnterStepMode} className="toolbar-btn" title="Step-by-step (card by card)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        {/* Reverse (both modes) */}
        <button onClick={onSimulateReverse} disabled={replayMode} className="toolbar-btn" title="Reverse">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14L4 9l5-5" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
          </svg>
        </button>

        {/* Scissors / Replay mode (2D only) */}
        {!is3D && (
          <button
            onClick={onToggleReplayMode}
            className={`toolbar-btn ${replayMode ? 'toolbar-btn--active' : ''}`}
            title={replayMode ? 'Exit replay mode' : 'Replay mode'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
              <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
              <line x1="8.12" y1="8.12" x2="12" y2="12"/>
            </svg>
          </button>
        )}

        <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

        {/* Sacred mode */}
        <button
          onClick={onToggleSacredMode}
          className={`toolbar-btn ${sacredMode ? 'toolbar-btn--active' : ''}`}
          title={sacredMode ? 'Data view' : 'Sacred view'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
          </svg>
        </button>

        {/* Backtest */}
        <button onClick={onBacktest} className="toolbar-btn" title="Backtest (test accuracy)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3h6v2H9z" /><path d="M10 5v4l-2 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-7l-2-2V5" /><path d="M10 15h4" />
          </svg>
        </button>

        {/* Save */}
        <button onClick={onSave} disabled={saving} className="toolbar-btn" title="Save">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
          </svg>
        </button>

        {/* Share */}
        <button onClick={onShare} className="toolbar-btn" title={shareUrl ? 'Copied!' : 'Share'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={shareUrl ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>

        {/* Export */}
        <button onClick={onExportPNG} className="toolbar-btn" title="Export PNG">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

        {/* Undo */}
        <button onClick={onUndo} disabled={!canUndo} className="toolbar-btn" title="Undo (Cmd+Z)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
          </svg>
        </button>

        {/* Redo */}
        <button onClick={onRedo} disabled={!canRedo} className="toolbar-btn" title="Redo (Cmd+Shift+Z)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

        {/* Clear */}
        <button onClick={onClear} className="toolbar-btn" title="Clear">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

interface RunningToolbarProps {
  simPaused: boolean;
  onTogglePause: () => void;
  onStop: () => void;
}

export function RunningToolbar({ simPaused, onTogglePause, onStop }: RunningToolbarProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-3 py-2 flex items-center gap-2"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <button onClick={onTogglePause} className="toolbar-btn toolbar-btn--primary" title={simPaused ? 'Resume' : 'Pause'}>
          {simPaused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          )}
        </button>
        <button onClick={onStop} className="toolbar-btn toolbar-btn--danger" title="Stop">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

interface StatsBarProps {
  speedLevel: number;
  currentWave: number;
  totalWaves: number;
  simStats: { total: number; success: number; blocked: number };
  successRate: number;
  simPaused: boolean;
  onSpeedChange: (level: number) => void;
}

export function StatsBar({ speedLevel, currentWave, totalWaves, simStats, successRate, simPaused, onSpeedChange }: StatsBarProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-2xl px-8 py-4 flex items-center gap-5"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* Speed control */}
        <div className="flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          <input
            type="range"
            min={0}
            max={SPEED_LEVELS.length - 1}
            step={1}
            value={speedLevel}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="w-20 h-1 appearance-none rounded-full cursor-pointer"
            style={{ accentColor: 'var(--accent)', background: 'var(--border)' }}
          />
          <span className="text-[11px] font-semibold tabular-nums w-7 text-center" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{SPEED_LABELS[speedLevel]}</span>
        </div>

        <div className="w-px h-5" style={{ background: 'var(--border)' }} />

        {/* Wave progress */}
        <div className="flex items-center gap-3">
          <div className="flex gap-[3px]">
            {Array.from({ length: totalWaves }, (_, i) => (
              <div
                key={i}
                className="w-[6px] h-[14px] rounded-[2px] transition-all duration-300"
                style={{
                  background: i < currentWave ? 'var(--accent)' : 'var(--border)',
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{currentWave}/{totalWaves}</span>
        </div>

        <div className="w-px h-5" style={{ background: 'var(--border)' }} />

        {/* Metrics */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'var(--accent)' }} />
            <span className="text-[13px] font-bold tabular-nums" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>{simStats.total}</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>people</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full bg-emerald-500" />
            <span className="text-[13px] font-bold text-emerald-600 tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{simStats.success}</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>made it</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[7px] h-[7px] rounded-full bg-red-500" />
            <span className="text-[13px] font-bold text-red-500 tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{simStats.blocked}</span>
            <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>stopped</span>
          </div>
        </div>

        {/* Rate — clear label */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'var(--surface-hover)' }}>
          <span className="text-[14px] font-bold tabular-nums" style={{
            color: successRate >= 50 ? '#059669' : successRate >= 25 ? '#d97706' : '#dc2626',
            fontFamily: 'var(--font-geist-mono)',
          }}>
            {simStats.success}/{simStats.total}
          </span>
          <span className="text-[10px] font-medium" style={{ color: 'var(--muted)' }}>survive</span>
          <span className="text-[11px] font-bold tabular-nums" style={{
            color: successRate >= 50 ? '#059669' : successRate >= 25 ? '#d97706' : '#dc2626',
            fontFamily: 'var(--font-geist-mono)',
          }}>
            ({successRate}%)
          </span>
        </div>

        {/* Status */}
        {simPaused ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono)' }}>Paused</span>
          </div>
        ) : (
          <kbd className="text-[10px] px-2.5 py-1 rounded-md" style={{ color: 'var(--muted)', background: 'var(--surface-hover)', fontFamily: 'var(--font-geist-mono)' }}>space</kbd>
        )}
      </div>
    </motion.div>
  );
}

interface ReplayBarProps {
  cutNodeId: string | null;
  cutNodeLabel: string;
  cutReachCount: number;
  simRunning: boolean;
  onSimulateFromCut: () => void;
  onExitReplayMode: () => void;
}

export function ReplayBar({ cutNodeId, cutNodeLabel, cutReachCount, simRunning, onSimulateFromCut, onExitReplayMode }: ReplayBarProps) {
  if (simRunning) return null;
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-6 py-2.5 flex items-center gap-3"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>

        {cutNodeId ? (
          <>
            <span className="text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
              Cut at <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{cutNodeLabel}</span>
              {cutReachCount > 0 && (
                <span style={{ color: 'var(--accent)' }} className="ml-1">({cutReachCount} people)</span>
              )}
            </span>
            <div className="w-px h-4" style={{ background: 'var(--border)' }} />
            <button
              onClick={onSimulateFromCut}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span className="text-[10px] font-semibold">Replay</span>
            </button>
          </>
        ) : (
          <span className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>Click a node to set the cut point</span>
        )}

        <div className="w-px h-4" style={{ background: 'var(--border)' }} />

        <button
          onClick={onExitReplayMode}
          className="flex items-center justify-center w-6 h-6 rounded-full transition-colors cursor-pointer"
          style={{ color: 'var(--muted)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

interface StepModeBarProps {
  stepIndex: number;
  totalSteps: number;
  onStepBack: () => void;
  onStepForward: () => void;
  onExitStepMode: () => void;
}

export function StepModeBar({ stepIndex, totalSteps, onStepBack, onStepForward, onExitStepMode }: StepModeBarProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-3 py-2 flex items-center gap-3"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <button onClick={onStepBack} disabled={stepIndex === 0} className="toolbar-btn" title="Previous (Left arrow)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="text-[11px] font-semibold tabular-nums px-2" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>
          {stepIndex} / {totalSteps}
        </span>

        <button onClick={onStepForward} disabled={stepIndex >= totalSteps} className="toolbar-btn toolbar-btn--primary" title="Next (Right arrow)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <div className="w-px h-5 bg-[var(--border)]" />

        <button onClick={onExitStepMode} className="toolbar-btn" title="Exit step mode (Esc)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

interface PathFilterBarProps {
  pathFilter: 'all' | 'success' | 'partial' | 'fail';
  onFilterChange: (filter: 'all' | 'success' | 'partial' | 'fail') => void;
}

export function PathFilterBar({ pathFilter, onFilterChange }: PathFilterBarProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-1.5 py-1.5 flex items-center gap-1"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {([
          { key: 'all', label: 'All', color: 'var(--foreground)' },
          { key: 'success', label: 'Success', color: '#10b981' },
          { key: 'partial', label: 'Partial', color: '#d97706' },
          { key: 'fail', label: 'Fail', color: '#ef4444' },
        ] as const).map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => onFilterChange(key)}
            className="px-3 py-1.5 rounded-full text-[10px] font-semibold transition-all cursor-pointer"
            style={{
              background: pathFilter === key ? color : 'transparent',
              color: pathFilter === key ? 'var(--accent-foreground)' : 'var(--muted)',
              fontFamily: 'var(--font-geist-mono)',
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

interface ResultsTabProps {
  onShowDashboard: () => void;
}

export function ResultsTab({ onShowDashboard }: ResultsTabProps) {
  return (
    <button
      onClick={onShowDashboard}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-50 rounded-l-lg px-2 py-4 shadow-lg transition-all cursor-pointer group"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRight: 'none' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
    >
      <div className="flex flex-col items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-500 transition-colors">
          <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
        </svg>
        <span className="text-[9px] font-semibold text-gray-400 group-hover:text-blue-500 transition-colors" style={{ writingMode: 'vertical-lr' }}>
          Results
        </span>
      </div>
    </button>
  );
}
