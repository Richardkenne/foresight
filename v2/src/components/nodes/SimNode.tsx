'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { loadSacredProfile } from '@/lib/sacred-assessment';
import { nodeColors, sacred, probColor as getProbColor, probBgColor, tierColor, tokens } from '@/lib/design-tokens';

// Rich text: parse **bold**, __underline__, and \n into React elements
function renderRichText(text: string): React.ReactNode[] {
  // Split by newlines first
  const lines = text.split(/\\n|\n/);
  const result: React.ReactNode[] = [];
  lines.forEach((line, li) => {
    if (li > 0) result.push(<br key={`br-${li}`} />);
    // Parse **bold** and __underline__ within each line
    const parts = line.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
    parts.forEach((part, pi) => {
      const boldMatch = part.match(/^\*\*(.+)\*\*$/);
      const underlineMatch = part.match(/^__(.+)__$/);
      if (boldMatch) {
        result.push(<strong key={`${li}-${pi}`} style={{ fontWeight: 700 }}>{boldMatch[1]}</strong>);
      } else if (underlineMatch) {
        result.push(<span key={`${li}-${pi}`} style={{ textDecoration: 'underline' }}>{underlineMatch[1]}</span>);
      } else if (part) {
        result.push(part);
      }
    });
  });
  return result;
}

// Colors now come from CSS variables via design-tokens.ts
// NODE_COLORS → nodeColors(type), SACRED_COLORS → sacred

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
// TIER_COLORS now from design-tokens: tierColor(tier)

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
  originalProb?: number;
  probRange?: { optimistic: number; adverse: number };
  time?: string;
  hidden?: boolean;
  computedValue?: number;
  onSliderChange?: (value: number) => void;
  sacredMode?: boolean;
  sacredRoots?: string[];
  isCutPoint?: boolean;
  sacredProfile?: SacredProfile;
  activeMode?: string; // SimMode
  [key: string]: unknown;
}

// 36 Sacred Roots — loaded from data, indexed by ID
import { computePersonalProb, type PersonalProb } from '@/lib/sacred-modifier';
import type { SacredProfile } from '@/lib/sacred-assessment';
import sacredRootsData from '@/lib/sacred-roots.json';

interface SacredRoot {
  id: string;
  label_positive: string;
  bible_text: string;
  bible_key: string;
  quran_text: string;
  quran_key: string;
}

const SACRED_ROOTS_MAP: Record<string, SacredRoot> = {};
(sacredRootsData as SacredRoot[]).forEach(r => { SACRED_ROOTS_MAP[r.id] = r; });

// Fallback: type-based verses (used when node has no sacredRoots)
const TYPE_FALLBACK: Record<string, string[]> = {
  start: ['SR-001', 'SR-016'], desire: ['SR-007', 'SR-016'], action: ['SR-012', 'SR-003'],
  state: ['SR-018', 'SR-035'], bottleneck: ['SR-010', 'SR-001'], trajectory: ['SR-017', 'SR-035'],
  gate: ['SR-017', 'SR-007'], decision: ['SR-017', 'SR-025'], 'outcome-good': ['SR-004', 'SR-012'],
  'outcome-bad': ['SR-005', 'SR-019'], loop: ['SR-036', 'SR-025'],
};

function getSacredForNode(nodeType: string, sacredRootIds?: string[]): SacredRoot[] {
  const ids = sacredRootIds?.length ? sacredRootIds : (TYPE_FALLBACK[nodeType] || ['SR-001', 'SR-012']);
  return ids.map(id => SACRED_ROOTS_MAP[id]).filter(Boolean);
}

function SimNodeComponent({ data }: NodeProps) {
  const d = data as SimNodeData;
  const nodeType = d.nodeType || 'action';
  const colors = nodeColors(nodeType);
  const icon = ICONS[nodeType];
  const hasProb = nodeType === 'bottleneck' || nodeType === 'decision' || nodeType === 'gate';
  const isSacred = d.sacredMode === true;

  const sacredRoots = getSacredForNode(nodeType, d.sacredRoots as string[] | undefined);
  const primaryRoot = sacredRoots[0];
  const computedValue = d.computedValue;

  // Personal probability from sacred profile (read from localStorage or data)
  const personalProb: PersonalProb | null = useMemo(() => {
    if (!hasProb || d.prob == null || !d.sacredRoots?.length) return null;
    // Prefer sacredProfile passed via data, fallback to localStorage
    const profile = (d.sacredProfile as SacredProfile | undefined) || loadSacredProfile();
    if (!profile || Object.keys(profile).length === 0) return null;
    return computePersonalProb(d.prob, d.sacredRoots as string[], profile);
  }, [hasProb, d.prob, d.sacredRoots, d.sacredProfile]);

  // Sacred profile color tint: green if personal > generic, red if lower, none if equal
  const difficultyBorder: string | undefined = personalProb
    ? personalProb.personal > personalProb.generic
      ? 'var(--success)'
      : personalProb.personal < personalProb.generic
        ? 'var(--danger)'
        : undefined
    : undefined;
  // Only show value bar if value is meaningful (> 0)
  const hasValue = typeof computedValue === 'number' && computedValue > 0.001;
  // Visual intensity: 0-1 scale, clamped
  const intensity = hasValue ? Math.min(1, Math.max(0, computedValue)) : 0;
  const isInteractive = nodeType === 'start' || hasProb;

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

  // Determine accent color: sacred = purple, normal = type-based
  const activeAccent = isSacred ? sacred.accent : colors.accent;
  const activeBg = isSacred ? sacred.bg : colors.bg;

  // Probability badge color: red if <40, amber if 40-60, green if >60
  const probBadgeColor = d.prob != null
    ? getProbColor(d.prob)
    : colors.accent;

  return (
    <motion.div
      className={`sim-node sim-node--card${nodeType === 'bottleneck' ? ' sim-node--bottleneck' : ''}${nodeType === 'gate' ? ' sim-node--gate' : ''}${nodeType === 'state' ? ' sim-node--state' : ''}${nodeType === 'trajectory' ? ' sim-node--trajectory' : ''}${nodeType === 'decision' ? ' sim-node--decision' : ''}${nodeType === 'outcome-bad' ? ' sim-node--fail' : nodeType === 'outcome-good' ? ' sim-node--success' : ''}${d.isCutPoint ? ' sim-node--cut' : ''}${isSacred ? ' sim-node--sacred' : ''}`}
      style={{
        borderLeft: (nodeType !== 'bottleneck' && nodeType !== 'decision' && nodeType !== 'state' && nodeType !== 'outcome-good' && nodeType !== 'outcome-bad')
          ? `3px solid ${activeAccent}` : undefined,
        background: (nodeType !== 'bottleneck' && nodeType !== 'decision') ? activeBg : undefined,
        ...(difficultyBorder ? { outlineColor: difficultyBorder, outlineWidth: 2, outlineStyle: 'solid' as const } : {}),
        ...(d.activeMode === 'stress' && hasProb ? {
          boxShadow: '0 0 0 2px var(--danger)',
          animation: 'stress-pulse 2s ease-in-out infinite',
        } : {}),
        ...(d.activeMode === 'whatif' && hasProb ? {
          borderStyle: 'dashed',
          cursor: 'pointer',
        } : {}),
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -2 }}
      layout={false}
    >
      <Handle type="target" position={d.direction === 'TB' ? Position.Top : Position.Left} className="sim-handle" />

      {/* Type label above node */}
      {NODE_TYPE_LABELS[nodeType] && (
        <div className="sim-node__type-label">{NODE_TYPE_LABELS[nodeType]}</div>
      )}

      {/* Content */}
      <div className="sim-node__body">
        {isSacred ? (
          <>
            {sacredRoots.map((root, idx) => (
              <div key={root.id} style={idx > 0 ? { marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: `1px solid ${sacred.border}33` } : undefined}>
                <div className="sim-node__header">
                  <div className="sim-node__icon" style={{ color: sacred.accent }}>{icon}</div>
                  <div className="sim-node__label" style={{ color: sacred.text }}>{root.label_positive}</div>
                  {idx === 0 && hasProb && d.prob != null && (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--purple-muted)', border: '2px solid var(--sacred-accent)',
                        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-geist-mono)',
                        color: sacred.accent,
                      }}>
                        {d.prob}%
                      </div>
                      {d.originalProb != null && d.originalProb !== d.prob && (
                        <div
                          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[8px] font-bold"
                          style={{
                            width: 18, height: 18,
                            background: (d.prob as number) > d.originalProb ? 'var(--success)' : 'var(--danger)',
                            color: 'white',
                            fontFamily: 'var(--font-geist-mono)',
                          }}
                        >
                          {(d.prob as number) > d.originalProb ? '+' : ''}{(d.prob as number) - d.originalProb}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="sim-node__desc" style={{ fontStyle: 'italic', color: sacred.text, opacity: 0.9, marginTop: 'var(--space-1)' }}>
                  &ldquo;{root.bible_text}&rdquo;
                </div>
                <div style={{ fontSize: 8, color: sacred.accent, opacity: 0.7, marginTop: 2, fontWeight: 600 }}>{root.bible_key}</div>
                <div className="sim-node__desc" style={{ fontStyle: 'italic', color: sacred.text, opacity: 0.7, marginTop: 'var(--space-1)' }}>
                  &ldquo;{root.quran_text}&rdquo;
                </div>
                <div style={{ fontSize: 8, color: sacred.accent, opacity: 0.7, marginTop: 2, fontWeight: 600 }}>{root.quran_key}</div>
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="sim-node__header">
              <div className="sim-node__icon" style={{ color: activeAccent }}>{icon}</div>
              <div className="sim-node__label">{d.label}</div>
              {hasProb && d.prob != null && (
                personalProb ? (
                  <div title={personalProb.reason} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  }}>
                    {/* Personal prob badge — colored circle */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: '50%',
                      background: personalProb.personal > personalProb.generic ? 'var(--success-muted)' : personalProb.personal < personalProb.generic ? 'var(--danger-muted)' : probBgColor(d.prob as number),
                      border: `2px solid ${personalProb.personal > personalProb.generic ? 'var(--success)' : personalProb.personal < personalProb.generic ? 'var(--danger)' : probBadgeColor}`,
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-geist-mono)',
                      color: personalProb.personal > personalProb.generic ? 'var(--success)' : personalProb.personal < personalProb.generic ? 'var(--danger)' : probBadgeColor,
                      flexShrink: 0,
                    }}>
                      {personalProb.personal}%
                    </div>
                    <span style={{ fontSize: 8, color: 'var(--muted)', textDecoration: 'line-through', fontFamily: 'var(--font-geist-mono)' }}>
                      {d.prob}%
                    </span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 36, height: 36, borderRadius: '50%',
                      background: probBgColor(d.prob as number), border: `2px solid ${probBadgeColor}`,
                      fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-geist-mono)',
                      color: probBadgeColor,
                    }}>
                      {d.prob}%
                      {d.probRange && (
                        <span style={{ fontSize: '6px', opacity: 0.5, display: 'block', position: 'absolute', bottom: -10, fontWeight: 400 }}>
                          {d.probRange.adverse}-{d.probRange.optimistic}
                        </span>
                      )}
                    </div>
                    {d.originalProb != null && d.originalProb !== d.prob && (
                      <div
                        className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-[8px] font-bold"
                        style={{
                          width: 18, height: 18,
                          background: (d.prob as number) > d.originalProb ? 'var(--success)' : 'var(--danger)',
                          color: 'white',
                          fontFamily: 'var(--font-geist-mono)',
                        }}
                      >
                        {(d.prob as number) > d.originalProb ? '+' : ''}{(d.prob as number) - d.originalProb}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
            {d.desc && (
              <div className="sim-node__desc">{renderRichText(String(d.desc))}</div>
            )}
            {(() => {
              // Multi-source triangulation (Palantir-style)
              const sources: SourceEntry[] | null = d.sources as SourceEntry[] || (d.source ? parseSourcesFromString(String(d.source)) : null);

              if (sources && sources.length > 0) {
                const conf = getConfidence(sources);
                const maxVal = Math.max(...sources.map(s => s.value), 1);
                return (
                  <div className="sim-node__footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 'var(--space-2)' }}>
                    {/* Confidence indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 4 }, (_, i) => (
                          <div key={i} style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: i < conf.dots ? (conf.dots >= 4 ? 'var(--success)' : conf.dots >= 3 ? 'var(--warning)' : 'var(--danger)') : 'var(--border)',
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: 8, fontWeight: 600, color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.05em' }}>
                        {conf.level} conf.
                      </span>
                    </div>
                    {/* Source rows with bars */}
                    {sources.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <span style={{
                          fontSize: 7, fontWeight: 700, color: tierColor(s.tier),
                          fontFamily: 'var(--font-geist-mono)', minWidth: 28, maxWidth: 80, flexShrink: 0, letterSpacing: '0.03em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {s.name}
                        </span>
                        <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
                          <div style={{
                            width: `${(s.value / maxVal) * 100}%`, height: '100%', borderRadius: 2,
                            background: tierColor(s.tier), opacity: 0.7,
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
              // Hide source for action/desire/trajectory nodes (no statistical data)
              const showSource = d.source && !['action', 'desire', 'trajectory'].includes(nodeType);
              if (showSource || d.time) {
                return (
                  <div className="sim-node__footer">
                    {showSource && <span className="sim-node__source">{String(d.source)}</span>}
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
          background: 'var(--danger-muted)',
          border: '1px solid var(--danger)',
          borderRadius: 10,
          padding: '1px var(--space-2)',
          whiteSpace: 'nowrap',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--danger)', fontFamily: 'var(--font-geist-mono)' }}>
            {deathCount} dropped
          </span>
        </div>
      )}

      <Handle type="source" position={d.direction === 'TB' ? Position.Bottom : Position.Right} className="sim-handle" />
    </motion.div>
  );
}

export default memo(SimNodeComponent);
