'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

// Minimal palette: neutral for most nodes, green for success, red for fail
const NODE_COLORS: Record<string, { accent: string; bg: string; bgDark: string; text: string }> = {
  start:          { accent: '#64748b', bg: '#f8fafc', bgDark: '#1e293b', text: '#475569' },
  desire:         { accent: '#64748b', bg: '#f8fafc', bgDark: '#1e293b', text: '#475569' },
  action:         { accent: '#64748b', bg: '#f8fafc', bgDark: '#1e293b', text: '#475569' },
  state:          { accent: '#5f7d63', bg: '#d8ead8', bgDark: '#1a3a1e', text: '#3d5e41' },
  bottleneck:     { accent: '#64748b', bg: '#f8fafc', bgDark: '#1e293b', text: '#475569' },
  trajectory:     { accent: '#7f5aa6', bg: '#efe2fb', bgDark: '#2d1a4e', text: '#6b3fa0' },
  gate:           { accent: '#d97706', bg: '#fffbeb', bgDark: '#451a03', text: '#b45309' },
  decision:       { accent: '#64748b', bg: '#f8fafc', bgDark: '#1e293b', text: '#475569' },
  'outcome-good': { accent: '#10b981', bg: '#f0fdf4', bgDark: '#022c22', text: '#059669' },
  'outcome-bad':  { accent: '#ef4444', bg: '#fef2f2', bgDark: '#450a0a', text: '#dc2626' },
  loop:           { accent: '#64748b', bg: '#f8fafc', bgDark: '#1e293b', text: '#475569' },
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
  state: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  trajectory: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  ),
  gate: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16v4l-6 4 6 4v4H4v-4l6-4-6-4V4z" />
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

interface SourceEntry {
  name: string;
  value: number;   // probability from this source
  tier: 1 | 2 | 3; // 1=media, 2=institutional, 3=government
}

// Source tier weights for weighted average
const TIER_WEIGHTS: Record<number, number> = { 3: 3, 2: 2, 1: 1 };
const TIER_LABELS: Record<number, string> = { 3: 'GOV', 2: 'INST', 1: 'MEDIA' };
const TIER_COLORS: Record<number, string> = { 3: '#3b82f6', 2: '#8b5cf6', 1: '#94a3b8' };

function parseSourcesFromString(source: string): SourceEntry[] | null {
  // Parse format: "BLS 2024:70:3 | CB Insights 2024:65:2"
  if (!source.includes(':')) return null;
  const parts = source.split('|').map(s => s.trim());
  const entries: SourceEntry[] = [];
  for (const p of parts) {
    const [name, val, tier] = p.split(':').map(s => s.trim());
    if (name && val) {
      entries.push({ name, value: Number(val), tier: (Number(tier) || 2) as 1 | 2 | 3 });
    }
  }
  return entries.length > 0 ? entries : null;
}

function getConfidence(sources: SourceEntry[]): { level: string; dots: number } {
  if (sources.length >= 3) return { level: 'High', dots: 4 };
  if (sources.length === 2) {
    const spread = Math.abs(sources[0].value - sources[1].value);
    return spread <= 10 ? { level: 'High', dots: 4 } : { level: 'Medium', dots: 3 };
  }
  const tier = sources[0]?.tier || 1;
  return tier === 3 ? { level: 'Medium', dots: 3 } : { level: 'Low', dots: 2 };
}

function weightedAverage(sources: SourceEntry[]): number {
  let sum = 0, wSum = 0;
  for (const s of sources) {
    const w = TIER_WEIGHTS[s.tier] || 1;
    sum += s.value * w;
    wSum += w;
  }
  return Math.round(sum / wSum * 10) / 10;
}

interface SimNodeData {
  nodeType: string;
  label: string;
  desc?: string;
  source?: string;
  sources?: SourceEntry[];
  prob?: number;
  probRange?: { optimistic: number; adverse: number };
  time?: string;
  hidden?: boolean;
  computedValue?: number;
  onSliderChange?: (value: number) => void;
  sacredMode?: boolean;
  isCutPoint?: boolean;
  [key: string]: unknown;
}

// Sacred verse mapping — based on node type and keywords in label
// These are the foundational verses that explain WHY each node type exists
const SACRED_VERSES: Record<string, { bible: string; bRef: string; quran: string; qRef: string; law: string }> = {
  start:          { bible: 'Commit to the Lord whatever you do, and he will establish your plans.', bRef: 'Proverbs 16:3', quran: 'And whoever puts their trust in Allah, He will be enough for them.', qRef: 'Quran 65:3', law: 'Faith & Trust' },
  desire:         { bible: 'Delight yourself in the Lord, and he will give you the desires of your heart.', bRef: 'Psalm 37:4', quran: 'And for those who fear Allah, He will make a way out.', qRef: 'Quran 65:2', law: 'Desire & Purpose' },
  action:         { bible: 'Faith by itself, if it does not have works, is dead.', bRef: 'James 2:17', quran: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.', qRef: 'Quran 13:11', law: 'Action & Works' },
  state:          { bible: 'Search me, O God, and know my heart; test me and know my anxious thoughts.', bRef: 'Psalm 139:23', quran: 'Indeed, Allah knows what is in every heart.', qRef: 'Quran 67:13', law: 'Awareness & Truth' },
  bottleneck:     { bible: 'Enter through the narrow gate. For wide is the gate that leads to destruction.', bRef: 'Matthew 7:13-14', quran: 'Indeed, with hardship comes ease.', qRef: 'Quran 94:5-6', law: 'Testing & Trials' },
  trajectory:     { bible: 'Broad is the road that leads to destruction, and narrow the road that leads to life.', bRef: 'Matthew 7:13-14', quran: 'And that this is My path, which is straight, so follow it.', qRef: 'Quran 6:153', law: 'Direction & Path' },
  gate:           { bible: 'There is a way that appears to be right, but in the end it leads to death.', bRef: 'Proverbs 14:12', quran: 'We have shown him the two paths.', qRef: 'Quran 90:10', law: 'Divergence & Fate' },
  decision:       { bible: 'Plans fail for lack of counsel, but with many advisers they succeed.', bRef: 'Proverbs 15:22', quran: 'And whose affair is determined by consultation among themselves.', qRef: 'Quran 42:38', law: 'Counsel & Wisdom' },
  'outcome-good': { bible: 'Let us not become weary in doing good, for at the proper time we will reap a harvest.', bRef: 'Galatians 6:9', quran: 'So whoever does an atom\'s weight of good will see it.', qRef: 'Quran 99:7', law: 'Harvest & Reward' },
  'outcome-bad':  { bible: 'Do not be deceived: God cannot be mocked. A man reaps what he sows.', bRef: 'Galatians 6:7', quran: 'And whoever does an atom\'s weight of evil will see it.', qRef: 'Quran 99:8', law: 'Consequence & Justice' },
  loop:           { bible: 'As iron sharpens iron, so one person sharpens another.', bRef: 'Proverbs 27:17', quran: 'And cooperate in righteousness and piety.', qRef: 'Quran 5:2', law: 'Growth & Refinement' },
};

function SimNodeComponent({ data }: NodeProps) {
  const d = data as SimNodeData;
  const nodeType = d.nodeType || 'action';
  const colors = NODE_COLORS[nodeType] || NODE_COLORS.action;
  const icon = ICONS[nodeType];
  const hasProb = nodeType === 'bottleneck' || nodeType === 'decision' || nodeType === 'gate';
  const isStart = nodeType === 'start';
  const isSacred = d.sacredMode === true;

  // Dynamic border color for bottleneck/gate based on probability severity
  const getDifficultyBorder = (): string | undefined => {
    if ((nodeType !== 'bottleneck' && nodeType !== 'gate') || d.prob == null) return undefined;
    const p = d.prob;
    if (p >= 60) return 'rgba(16, 185, 129, 0.6)';   // green — easy
    if (p >= 30) return 'rgba(245, 158, 11, 0.6)';    // orange — medium
    if (p >= 10) return 'rgba(239, 68, 68, 0.7)';     // red — hard
    return 'rgba(127, 29, 29, 0.85)';                  // dark red — killer
  };
  const difficultyBorder = getDifficultyBorder();
  const sacredVerse = SACRED_VERSES[nodeType] || SACRED_VERSES.action;
  const computedValue = d.computedValue;
  // Only show value bar if value is meaningful (> 0)
  const hasValue = typeof computedValue === 'number' && computedValue > 0.001;
  // Visual intensity: 0-1 scale, clamped
  const intensity = hasValue ? Math.min(1, Math.max(0, computedValue)) : 0;
  const isInteractive = isStart || hasProb;

  // Death counter — find any deaths-* key in data
  const deathCount = Object.entries(d).reduce((sum, [k, v]) => k.startsWith('deaths-') ? sum + (v as number) : sum, 0);

  // Node type label (shown above node, monospace like Tersa)
  const NODE_TYPE_LABELS: Record<string, string> = {
    start: 'START', desire: 'DESIRE', action: 'ACTION',
    state: 'STATE', trajectory: 'TRAJECTORY', gate: 'GATE',
    bottleneck: 'BOTTLENECK', decision: 'DECISION',
    'outcome-good': 'OUTCOME', 'outcome-bad': 'OUTCOME',
    loop: 'LOOP',
  };

  if (isStart) {
    return (
      <div className="sim-node sim-node--start">
        <Handle type="target" position={Position.Left} className="sim-handle" />
        <div className="sim-node__start-inner">
          <span className="sim-node__start-icon">{icon}</span>
          <span className="sim-node__start-label">{isSacred ? sacredVerse.law : d.label}</span>
        </div>
        <Handle type="source" position={Position.Right} className="sim-handle" />
      </div>
    );
  }

  return (
    <div
      className={`sim-node sim-node--card${nodeType === 'bottleneck' ? ' sim-node--bottleneck' : ''}${nodeType === 'gate' ? ' sim-node--gate' : ''}${nodeType === 'state' ? ' sim-node--state' : ''}${nodeType === 'trajectory' ? ' sim-node--trajectory' : ''}${nodeType === 'outcome-bad' ? ' sim-node--fail' : nodeType === 'outcome-good' ? ' sim-node--success' : ''}${d.isCutPoint ? ' sim-node--cut' : ''}`}
      style={difficultyBorder ? { outlineColor: difficultyBorder, outlineWidth: 2, outlineStyle: 'solid', '--node-accent': difficultyBorder } as React.CSSProperties : undefined}
    >
      <Handle type="target" position={Position.Left} className="sim-handle" />

      {/* Type label above node */}
      <div className="sim-node__type-label">{NODE_TYPE_LABELS[nodeType] || 'NODE'}</div>

      {/* Content */}
      <div className="sim-node__body">
        {isSacred ? (
          <>
            <div className="sim-node__header">
              <div className="sim-node__icon">{icon}</div>
              <div className="sim-node__label">{sacredVerse.law}</div>
              {hasProb && d.prob != null && (
                <div className="sim-node__prob">{d.prob}%</div>
              )}
            </div>
            <div className="sim-node__desc sim-node__desc--sacred">
              &ldquo;{sacredVerse.bible}&rdquo;
            </div>
            <div className="sim-node__desc sim-node__desc--sacred" style={{ marginTop: '2px', opacity: 0.6 }}>
              &ldquo;{sacredVerse.quran}&rdquo;
            </div>
            <div className="sim-node__footer">
              <span className="sim-node__source">{sacredVerse.bRef}</span>
              <span className="sim-node__source">{sacredVerse.qRef}</span>
            </div>
          </>
        ) : (
          <>
            <div className="sim-node__header">
              <div className="sim-node__icon">{icon}</div>
              <div className="sim-node__label">{d.label}</div>
              {hasProb && d.prob != null && (
                <div className="sim-node__prob">
                  {d.prob}%
                  {d.probRange && (
                    <span style={{ fontSize: '7px', opacity: 0.5, display: 'block', fontWeight: 400, letterSpacing: '0.02em' }}>
                      {d.probRange.adverse}-{d.probRange.optimistic}
                    </span>
                  )}
                </div>
              )}
            </div>
            {d.desc && (
              <div className="sim-node__desc">{d.desc}</div>
            )}
            {(() => {
              // Multi-source triangulation (Palantir-style)
              const sources: SourceEntry[] | null = d.sources as SourceEntry[] || (d.source ? parseSourcesFromString(String(d.source)) : null);

              if (sources && sources.length > 0) {
                const conf = getConfidence(sources);
                const maxVal = Math.max(...sources.map(s => s.value), 1);
                return (
                  <div className="sim-node__footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                    {/* Confidence indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 4 }, (_, i) => (
                          <div key={i} style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: i < conf.dots ? (conf.dots >= 4 ? '#10b981' : conf.dots >= 3 ? '#f59e0b' : '#ef4444') : 'var(--border)',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.05em' }}>
                        {conf.level} conf.
                      </span>
                    </div>
                    {/* Source rows with bars */}
                    {sources.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{
                          fontSize: 7, fontWeight: 700, color: TIER_COLORS[s.tier],
                          fontFamily: 'var(--font-geist-mono)', minWidth: 28, maxWidth: 80, flexShrink: 0, letterSpacing: '0.03em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {s.name}
                        </span>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{
                            width: `${(s.value / maxVal) * 100}%`, height: '100%', borderRadius: 2,
                            background: TIER_COLORS[s.tier], opacity: 0.7,
                          }} />
                        </div>
                        <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)', width: 24, textAlign: 'right', flexShrink: 0 }}>
                          {s.value}%
                        </span>
                      </div>
                    ))}
                    {/* Source names */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginTop: 2 }}>
                      {sources.map((s, i) => (
                        <span key={i} className="sim-node__source" style={{ fontSize: 8 }}>{s.name}</span>
                      ))}
                    </div>
                    {d.time && (
                      <span className="sim-node__time" style={{ marginTop: 2 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {d.time}
                      </span>
                    )}
                  </div>
                );
              }

              // Fallback: single source (legacy format)
              if (d.source || d.time) {
                return (
                  <div className="sim-node__footer">
                    {d.source && <span className="sim-node__source">{String(d.source)}</span>}
                    {d.time && (
                      <span className="sim-node__time">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                        {d.time}
                      </span>
                    )}
                  </div>
                );
              }
              return null;
            })()}
          </>
        )}
      </div>

      {/* Death counter badge */}
      {deathCount > 0 && (
        <div style={{
          position: 'absolute',
          bottom: -22,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 10,
          padding: '1px 7px',
          whiteSpace: 'nowrap',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span style={{ fontSize: 9, fontWeight: 600, color: '#ef4444', fontFamily: 'var(--font-geist-mono)' }}>
            {deathCount} dropped
          </span>
        </div>
      )}

      <Handle type="source" position={Position.Right} className="sim-handle" />
    </div>
  );
}

export default memo(SimNodeComponent);
