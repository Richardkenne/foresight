'use client';

import { motion } from 'framer-motion';
import type { Node as RFNode } from '@xyflow/react';
import { SPEED_LEVELS, SPEED_LABELS, SPD_BASE, type SimSettings, type LaunchMode } from '@/lib/simulation-types';
import { type SimMode } from '@/lib/sim-modes';
import { useState } from 'react';

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
  viewMode?: '2d' | '3d' | 'flowchart';
  onUndo: () => void;
  onRedo: () => void;
  onSimulate: () => void;
  onSimulateLive: () => void;
  onSimulateFromCut: () => void;
  onRestart: () => void;
  onEnterStepMode: () => void;
  onSimulateReverse: () => void;
  onToggleReplayMode: () => void;
  onToggleSacredMode: () => void;
  onBacktest: () => void;
  onCrashTest: () => void;
  onMultiAgent: () => void;
  multiAgentRunning: boolean;
  simSettings: SimSettings;
  onSimSettingsChange: (settings: SimSettings) => void;
  onSave: () => void;
  onShare: () => void;
  onExportPNG: () => void;
  onClear: () => void;
  activeMode?: SimMode;
}

export function IdleToolbar({
  replayMode, cutNodeId, hasStats, sacredMode, saving, shareUrl,
  canUndo, canRedo, onUndo, onRedo,
  onSimulate, onSimulateLive, onSimulateFromCut, onRestart, onEnterStepMode, onSimulateReverse,
  onToggleReplayMode, onToggleSacredMode, onBacktest, onCrashTest, onMultiAgent, multiAgentRunning,
  simSettings, onSimSettingsChange,
  onSave, onShare, onExportPNG, onClear,
  viewMode = '2d',
  activeMode,
}: IdleToolbarProps) {
  const is3D = viewMode === '3d';
  const [showSimSettings, setShowSimSettings] = useState(false);
  return (
    <motion.div
      className="fixed bottom-6 right-3 sm:right-6 z-50 max-w-[calc(100vw-12px)]"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-2 sm:px-3 py-2 flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        {/* Simulate */}
        {activeMode !== 'explore' && (
          !is3D && replayMode && cutNodeId ? (
            <button onClick={onSimulateFromCut} className="toolbar-btn toolbar-btn--primary" title="Replay from cut">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          ) : (
            <button onClick={onSimulate} disabled={replayMode} className="toolbar-btn toolbar-btn--primary" title={activeMode === 'whatif' ? 'Test Changes' : activeMode === 'stress' ? 'Run Stress Test' : 'Simulate'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </button>
          )
        )}

        {/* Live Mode */}
        {activeMode !== 'explore' && !is3D && (
          <button onClick={onSimulateLive} disabled={replayMode} className="toolbar-btn" title="Live mode — continuous real-time flow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
              <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
            </svg>
          </button>
        )}

        {/* Restart */}
        {hasStats && (
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

        {/* Simulation Settings (2D only) */}
        {!is3D && (
          <div className="relative">
            <button
              onClick={() => setShowSimSettings(!showSimSettings)}
              className={`toolbar-btn ${showSimSettings ? 'toolbar-btn--active' : ''}`}
              title="Simulation settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            {showSimSettings && (
              <div
                className="absolute bottom-full mb-2 right-0 rounded-xl p-3"
                style={{
                  background: 'var(--surface)',
                  boxShadow: '0 0 0 1px var(--border), 0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 220,
                  zIndex: 100,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 8 }}>
                  Simulation Engine
                </div>
                {/* Launch Mode */}
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 12, color: 'var(--foreground)' }}>Launch Mode</span>
                  <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => onSimSettingsChange({ ...simSettings, launchMode: 'wave' })}
                      className="px-2 py-1"
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: simSettings.launchMode === 'wave' ? 'var(--accent)' : 'transparent',
                        color: simSettings.launchMode === 'wave' ? '#fff' : 'var(--muted)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Wave
                    </button>
                    <button
                      onClick={() => onSimSettingsChange({ ...simSettings, launchMode: 'simultaneous' })}
                      className="px-2 py-1"
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        background: simSettings.launchMode === 'simultaneous' ? 'var(--accent)' : 'transparent',
                        color: simSettings.launchMode === 'simultaneous' ? '#fff' : 'var(--muted)',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Simultaneous
                    </button>
                  </div>
                </div>
                {/* Speed Variation */}
                <label className="flex items-center justify-between mb-2 cursor-pointer">
                  <span style={{ fontSize: 12, color: 'var(--foreground)' }}>Speed Variation</span>
                  <div
                    onClick={() => onSimSettingsChange({ ...simSettings, speedVariation: !simSettings.speedVariation })}
                    className="relative w-8 h-[18px] rounded-full cursor-pointer transition-colors"
                    style={{
                      background: simSettings.speedVariation ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <div
                      className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform"
                      style={{ left: simSettings.speedVariation ? 14 : 2 }}
                    />
                  </div>
                </label>
                {/* Path Following */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span style={{ fontSize: 12, color: 'var(--foreground)' }}>Curve Following</span>
                  <div
                    onClick={() => onSimSettingsChange({ ...simSettings, pathFollowing: !simSettings.pathFollowing })}
                    className="relative w-8 h-[18px] rounded-full cursor-pointer transition-colors"
                    style={{
                      background: simSettings.pathFollowing ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    <div
                      className="absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform"
                      style={{ left: simSettings.pathFollowing ? 14 : 2 }}
                    />
                  </div>
                </label>
              </div>
            )}
          </div>
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

        {/* Crash Test */}
        <button onClick={onCrashTest} className="toolbar-btn" title="Crash Test (compare paths)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </button>

        {/* Multi-Agent 1000 (2D only) */}
        {!is3D && (
          <button onClick={onMultiAgent} disabled={multiAgentRunning} className="toolbar-btn" title="Simulate 1000 agents">
            {multiAgentRunning ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            )}
          </button>
        )}

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
  liveMode?: boolean;
  onTogglePause: () => void;
  onStop: () => void;
}

export function RunningToolbar({ simPaused, liveMode, onTogglePause, onStop }: RunningToolbarProps) {
  return (
    <motion.div
      className="fixed bottom-6 right-3 sm:right-6 z-50"
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
        {liveMode && (
          <div className="flex items-center gap-1.5 px-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', fontFamily: 'var(--font-geist-mono, monospace)' }}>LIVE</span>
          </div>
        )}
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
  youOutcome?: { outcome: 'success' | 'blocked'; nodeLabel: string } | null;
  launchMode?: LaunchMode;
}

export function StatsBar({ speedLevel, currentWave, totalWaves, simStats, successRate, simPaused, onSpeedChange, youOutcome, launchMode = 'wave' }: StatsBarProps) {
  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)]"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-2xl px-4 sm:px-8 py-3 sm:py-4 flex items-center gap-3 sm:gap-5 flex-wrap justify-center overflow-x-auto"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
          scrollbarWidth: 'none',
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

        {/* Wave progress / Simultaneous indicator */}
        <div className="flex items-center gap-3">
          {launchMode === 'simultaneous' ? (
            <>
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-[11px] font-semibold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono)' }}>ALL</span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
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

        {/* YOU outcome */}
        {youOutcome && (
          <>
            <div className="w-px h-5" style={{ background: 'var(--border)' }} />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              background: youOutcome.outcome === 'success'
                ? 'rgba(251,191,36,0.12)'
                : 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.3)',
            }}>
              <div className="w-[7px] h-[7px] rounded-full" style={{
                background: '#fbbf24',
                boxShadow: '0 0 6px rgba(251,191,36,0.6)',
              }} />
              <span className="text-[11px] font-bold" style={{
                color: youOutcome.outcome === 'success' ? '#059669' : '#dc2626',
                fontFamily: 'var(--font-geist-mono)',
              }}>
                YOU:
              </span>
              <span className="text-[11px] font-medium max-w-[140px] truncate" style={{
                color: 'var(--foreground)',
                fontFamily: 'var(--font-geist-mono)',
              }}>
                {youOutcome.nodeLabel}
              </span>
            </div>
          </>
        )}

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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)]"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-full px-3 sm:px-6 py-2.5 flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
        style={{
          background: 'var(--surface)',
          boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>

        {cutNodeId ? (
          <>
            <span className="text-[10px] sm:text-[11px] font-medium" style={{ color: 'var(--muted-foreground)' }}>
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)]"
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
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)]"
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

/* ── 3D Simulation Toolbar ── */

interface Sim3DToolbarProps {
  simRunning: boolean;
  onStartSim: () => void;
  onStopSim: () => void;
  stats: { launched: number; walking: number; success: number; failed: number };
  flyThrough: boolean;
  onToggleFlyThrough: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export function Sim3DToolbar({
  simRunning, onStartSim, onStopSim, stats, flyThrough, onToggleFlyThrough, speed, onSpeedChange,
}: Sim3DToolbarProps) {
  const total = stats.success + stats.failed;
  const rate = total > 0 ? Math.round((stats.success / total) * 100) : 0;

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-24px)]"
      variants={TOOLBAR_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TOOLBAR_TRANSITION}
    >
      <div
        className="rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 flex-wrap justify-center"
        style={{
          background: 'rgba(6, 8, 16, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Play / Stop */}
        {!simRunning ? (
          <button
            onClick={onStartSim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{
              background: '#3b82f6',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Inter, system-ui',
              minWidth: 36,
              minHeight: 36,
              justifyContent: 'center',
            }}
            title="Simulate 100 people"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="hidden sm:inline">Simulate 100</span>
          </button>
        ) : (
          <button
            onClick={onStopSim}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Inter, system-ui',
              minWidth: 36,
              minHeight: 36,
              justifyContent: 'center',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
            title="Stop simulation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
            <span className="hidden sm:inline">Stop</span>
          </button>
        )}

        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Stats */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Launched */}
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: '#60a5fa' }} />
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#e2e8f0',
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
            }}>{stats.launched}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>launched</span>
          </div>

          {/* Walking (in progress) */}
          {stats.walking > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-[7px] h-[7px] rounded-full" style={{ background: '#fbbf24' }} />
              <span style={{
                fontSize: 13, fontWeight: 700, color: '#fbbf24',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontVariantNumeric: 'tabular-nums',
              }}>{stats.walking}</span>
              <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>walking</span>
            </div>
          )}

          {/* Pass */}
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: '#34d399' }} />
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#34d399',
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
            }}>{stats.success}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>pass</span>
          </div>

          {/* Fail */}
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: '#f87171' }} />
            <span style={{
              fontSize: 13, fontWeight: 700, color: '#f87171',
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontVariantNumeric: 'tabular-nums',
            }}>{stats.failed}</span>
            <span style={{ fontSize: 10, fontWeight: 500, color: '#64748b' }}>fail</span>
          </div>
        </div>

        {/* Rate badge */}
        {total > 0 && (
          <>
            <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <span style={{
                fontSize: 13, fontWeight: 800,
                color: rate >= 50 ? '#34d399' : rate >= 25 ? '#fbbf24' : '#f87171',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontVariantNumeric: 'tabular-nums',
              }}>{rate}%</span>
              <span style={{ fontSize: 9, fontWeight: 500, color: '#475569' }}>survive</span>
            </div>
          </>
        )}

        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* Fly-through toggle */}
        <button
          onClick={onToggleFlyThrough}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          style={{
            background: flyThrough ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: flyThrough ? '#60a5fa' : '#64748b',
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui',
            minWidth: 36,
            minHeight: 36,
            justifyContent: 'center',
            border: flyThrough ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid transparent',
          }}
          title={flyThrough ? 'Disable fly-through camera' : 'Enable fly-through camera'}
        >
          {flyThrough ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          )}
          <span className="hidden sm:inline">Fly</span>
        </button>

        {/* Speed control */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSpeedChange(Math.max(0.25, speed - 0.25))}
            className="flex items-center justify-center rounded-md transition-all cursor-pointer"
            style={{
              width: 28, height: 28,
              background: 'rgba(255,255,255,0.04)',
              color: '#64748b',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            title="Slower"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#94a3b8',
            fontFamily: 'var(--font-geist-mono, monospace)',
            fontVariantNumeric: 'tabular-nums',
            width: 28, textAlign: 'center',
          }}>{speed}x</span>
          <button
            onClick={() => onSpeedChange(Math.min(4, speed + 0.25))}
            className="flex items-center justify-center rounded-md transition-all cursor-pointer"
            style={{
              width: 28, height: 28,
              background: 'rgba(255,255,255,0.04)',
              color: '#64748b',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            title="Faster"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Running indicator */}
        {simRunning && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#3b82f6' }} />
            <span style={{
              fontSize: 9, fontWeight: 700, color: '#60a5fa',
              fontFamily: 'var(--font-geist-mono, monospace)',
              letterSpacing: '0.06em', textTransform: 'uppercase' as const,
            }}>Running</span>
          </div>
        )}
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
