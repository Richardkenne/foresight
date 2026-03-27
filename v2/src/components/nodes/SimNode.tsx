'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const NODE_COLORS: Record<string, { accent: string; bg: string; bgDark: string; text: string }> = {
  start:          { accent: '#6366f1', bg: '#eef2ff', bgDark: '#1e1b4b', text: '#4338ca' },
  desire:         { accent: '#8b5cf6', bg: '#f5f3ff', bgDark: '#1e1b3a', text: '#7c3aed' },
  action:         { accent: '#22c55e', bg: '#f0fdf4', bgDark: '#052e16', text: '#16a34a' },
  bottleneck:     { accent: '#f97316', bg: '#fff7ed', bgDark: '#431407', text: '#ea580c' },
  decision:       { accent: '#eab308', bg: '#fefce8', bgDark: '#422006', text: '#ca8a04' },
  'outcome-good': { accent: '#10b981', bg: '#ecfdf5', bgDark: '#022c22', text: '#059669' },
  'outcome-bad':  { accent: '#ef4444', bg: '#fef2f2', bgDark: '#450a0a', text: '#dc2626' },
  loop:           { accent: '#06b6d4', bg: '#ecfeff', bgDark: '#083344', text: '#0891b2' },
};

const ICONS: Record<string, React.ReactNode> = {
  start: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
    </svg>
  ),
  desire: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  action: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  bottleneck: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  decision: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
    </svg>
  ),
  loop: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
    </svg>
  ),
  'outcome-good': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  'outcome-bad': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

interface SimNodeData {
  nodeType: string;
  label: string;
  desc?: string;
  source?: string;
  prob?: number;
  time?: string;
  hidden?: boolean;
  computedValue?: number;
  onSliderChange?: (value: number) => void;
  [key: string]: unknown;
}

function SimNodeComponent({ data }: NodeProps) {
  const d = data as SimNodeData;
  const nodeType = d.nodeType || 'action';
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.action;
  const icon = ICONS[nodeType];
  const hasProb = nodeType === 'bottleneck' || nodeType === 'decision';
  const isStart = nodeType === 'start';
  const computedValue = d.computedValue;
  // Only show value bar if value is meaningful (> 0)
  const hasValue = typeof computedValue === 'number' && computedValue > 0.001;
  // Visual intensity: 0-1 scale, clamped
  const intensity = hasValue ? Math.min(1, Math.max(0, computedValue)) : 0;
  const isInteractive = isStart || hasProb;

  if (isStart) {
    return (
      <div className="sim-node sim-node--start" style={{ '--node-accent': colors.accent } as React.CSSProperties}>
        <Handle type="target" position={Position.Left} className="sim-handle" />
        <div className="sim-node__start-inner">
          <span className="sim-node__start-icon" style={{ color: colors.accent }}>{icon}</span>
          <span className="sim-node__start-label">{d.label}</span>
        </div>
        <Handle type="source" position={Position.Right} className="sim-handle" />
      </div>
    );
  }

  return (
    <div
      className="sim-node sim-node--card"
      style={{ '--node-accent': colors.accent, '--node-bg': colors.bg } as React.CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="sim-handle" />

      {/* Left accent bar */}
      <div className="sim-node__accent" style={{ background: colors.accent }} />

      {/* Content */}
      <div className="sim-node__body">
        {/* Header row: icon + label + prob badge */}
        <div className="sim-node__header">
          <div className="sim-node__icon" style={{ color: colors.accent }}>
            {icon}
          </div>
          <div className="sim-node__label">{d.label}</div>
          {hasProb && d.prob != null && (
            <div
              className="sim-node__prob"
              style={{
                background: colors.accent,
                color: '#fff',
              }}
            >
              {d.prob}%
            </div>
          )}
        </div>

        {/* Description */}
        {d.desc && (
          <div className="sim-node__desc">{d.desc}</div>
        )}

        {/* Footer: source + time */}
        {(d.source || d.time) && (
          <div className="sim-node__footer">
            {d.source && <span className="sim-node__source">{d.source}</span>}
            {d.time && (
              <span className="sim-node__time">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {d.time}
              </span>
            )}
          </div>
        )}

      </div>

      <Handle type="source" position={Position.Right} className="sim-handle" />
    </div>
  );
}

export default memo(SimNodeComponent);
