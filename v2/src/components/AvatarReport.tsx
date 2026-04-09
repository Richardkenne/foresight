'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Node as RFNode, type Edge as RFEdge } from '@xyflow/react';
import type { PrecomputedFate } from '@/lib/simulation-types';
import type { SacredProfile } from '@/lib/sacred-assessment';
import { computePersonalProb } from '@/lib/sacred-modifier';
import sacredRootsData from '@/lib/sacred-roots.json';

// ─── Types ─────────────────────────────────────────

interface SacredRoot {
  id: string;
  domain: string;
  name_en: string;
  label_positive: string;
  label_negative: string;
  bible_key: string;
  bible_text: string;
  quran_key: string;
  quran_text: string;
  description: string;
}

interface AvatarReportProps {
  fates: PrecomputedFate[];
  nodes: RFNode[];
  edges: RFEdge[];
  sacredProfile: SacredProfile;
  onClose: () => void;
}

type TabId = 'path' | 'diagnosis' | 'prescription' | 'whatif' | 'comparison';

// ─── Helpers ─────────────────────────────────────────

const ROOTS_MAP: Record<string, SacredRoot> = {};
(sacredRootsData as SacredRoot[]).forEach(r => { ROOTS_MAP[r.id] = r; });

function scoreToMultiplier(score: number): number {
  return 0.5 + (score / 10) * 1.0;
}

/** Recalculate personal prob with a hypothetical score override */
function hypotheticalProb(
  genericProb: number,
  nodeSacredRoots: string[],
  sacredProfile: SacredProfile,
  overrides: Record<string, number>,
): number {
  const merged = { ...sacredProfile, ...overrides };
  const matched = nodeSacredRoots.filter(id => merged[id] != null);
  if (matched.length === 0) return genericProb;
  const avg = matched.reduce((s, id) => s + merged[id], 0) / matched.length;
  const mult = scoreToMultiplier(avg);
  return Math.max(1, Math.min(99, Math.round(genericProb * mult * 10) / 10));
}

/** Get node data safely */
function nd(node: RFNode): Record<string, unknown> {
  return node.data as Record<string, unknown>;
}

// ─── Icons (Lucide-style inline SVG) ─────────────────

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18" /><path d="M6 6l12 12" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function IconAlertTriangle({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconTrendUp({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function IconUser({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconBarChart({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}

function IconBookOpen({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
    </svg>
  );
}

function IconTarget({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

// ─── Tab config ─────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'path', label: 'Your Path', icon: <IconUser size={13} /> },
  { id: 'diagnosis', label: 'Diagnosis', icon: <IconAlertTriangle size={13} /> },
  { id: 'prescription', label: 'Prescription', icon: <IconBookOpen size={13} /> },
  { id: 'whatif', label: 'What-If', icon: <IconTrendUp size={13} /> },
  { id: 'comparison', label: 'Comparison', icon: <IconBarChart size={13} /> },
];

// ─── Main Component ─────────────────────────────────

export default function AvatarReport({ fates, nodes, edges, sacredProfile, onClose }: AvatarReportProps) {
  const [activeTab, setActiveTab] = useState<TabId>('path');

  // Person #1 is "YOU"
  const myFate = fates[0];
  if (!myFate) return null;

  const totalPeople = fates.length;
  const successCount = fates.filter(f => f.outcome === 'success').length;
  const successRate = Math.round(successCount / totalPeople * 100);

  // Build node lookup
  const nodeMap: Record<string, RFNode> = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });

  // My visited nodes with details
  const myPath = myFate.path.map(nodeId => {
    const node = nodeMap[nodeId];
    if (!node) return null;
    const d = nd(node);
    return {
      id: nodeId,
      label: d.label as string,
      type: d.nodeType as string,
      prob: d.prob as number | undefined,
      desc: d.desc as string | undefined,
      sacredRoots: d.sacredRoots as string[] | undefined,
      source: d.source as string | undefined,
    };
  }).filter(Boolean) as Array<{
    id: string; label: string; type: string; prob?: number;
    desc?: string; sacredRoots?: string[]; source?: string;
  }>;

  // Failure analysis
  const failureNode = myFate.deathNode ? nodeMap[myFate.deathNode] : null;
  const failureData = failureNode ? nd(failureNode) : null;
  const failureSacredRoots = (failureData?.sacredRoots as string[]) || [];
  const failureProb = failureData?.prob as number | undefined;

  // Sacred root analysis for failure point
  const failureRootAnalysis = failureSacredRoots.map(rootId => {
    const root = ROOTS_MAP[rootId];
    const score = sacredProfile[rootId] ?? 5;
    return { rootId, root, score };
  }).filter(a => a.root);

  // Personal prob at failure point
  const failurePersonalProb = failureProb != null && failureSacredRoots.length > 0
    ? computePersonalProb(failureProb, failureSacredRoots, sacredProfile)
    : null;

  // All bottleneck nodes for prescription
  const bottleneckNodes = myPath.filter(n =>
    (n.type === 'bottleneck' || n.type === 'gate' || n.type === 'decision') && n.prob != null && n.prob < 100
  );

  // Find weakest root
  const profileEntries = Object.entries(sacredProfile).sort((a, b) => a[1] - b[1]);
  const weakestRoot = profileEntries[0];
  const top3Weakest = profileEntries.slice(0, 3);

  // What-If scenarios
  function computeScenarioSuccessProb(overrides: Record<string, number>): number {
    // Recalculate each bottleneck's prob and compound them
    let compound = 1;
    for (const n of bottleneckNodes) {
      if (!n.sacredRoots?.length || n.prob == null) {
        compound *= n.prob != null ? n.prob / 100 : 1;
        continue;
      }
      const hp = hypotheticalProb(n.prob, n.sacredRoots, sacredProfile, overrides);
      compound *= hp / 100;
    }
    return Math.round(compound * 10000) / 100;
  }

  // Scenario 1: weakest root to 7
  const scenario1Overrides: Record<string, number> = {};
  if (weakestRoot) scenario1Overrides[weakestRoot[0]] = 7;
  const scenario1Prob = computeScenarioSuccessProb(scenario1Overrides);

  // Scenario 2: top 3 weakest +2 points
  const scenario2Overrides: Record<string, number> = {};
  top3Weakest.forEach(([id, score]) => { scenario2Overrides[id] = Math.min(10, score + 2); });
  const scenario2Prob = computeScenarioSuccessProb(scenario2Overrides);

  // Scenario 3: all roots at 8
  const scenario3Overrides: Record<string, number> = {};
  Object.keys(sacredProfile).forEach(id => { scenario3Overrides[id] = 8; });
  const scenario3Prob = computeScenarioSuccessProb(scenario3Overrides);

  // Current compound prob
  const currentCompound = computeScenarioSuccessProb({});

  // Comparison: most common path
  const pathFreq: Record<string, number> = {};
  fates.forEach(f => {
    const key = f.path.join('>');
    pathFreq[key] = (pathFreq[key] || 0) + 1;
  });
  const mostCommonPathKey = Object.entries(pathFreq).sort((a, b) => b[1] - a[1])[0];
  const mostCommonPath = mostCommonPathKey ? mostCommonPathKey[0].split('>') : [];

  // My percentile
  const myPathLen = myFate.path.length;
  const shorterOrEqual = fates.filter(f => f.path.length <= myPathLen).length;
  const percentile = Math.round((shorterOrEqual / totalPeople) * 100);

  // Same outcome count
  const sameOutcome = fates.filter(f => f.outcome === myFate.outcome).length;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full max-w-[640px] mx-4 flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
            maxHeight: 'calc(100vh - 48px)',
          }}
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: myFate.outcome === 'success'
                    ? 'var(--success-muted)'
                    : 'var(--danger-muted)',
                }}
              >
                <IconTarget size={18} />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
                  Personal Report
                </h2>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                  Person #1 (YOU) -- {myFate.outcome === 'success' ? 'SUCCEEDED' : 'BLOCKED'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              <IconX size={16} />
            </button>
          </div>

          {/* ─── Tab bar ─── */}
          <div className="flex px-6 gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-medium transition-all cursor-pointer rounded-t-lg"
                style={{
                  color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted)',
                  background: activeTab === tab.id ? 'var(--surface-hover)' : 'transparent',
                  borderBottom: activeTab === tab.id ? '2px solid var(--foreground)' : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ─── Content ─── */}
          <div className="overflow-y-auto flex-1 px-6 py-5" style={{ scrollbarWidth: 'thin' }}>

            {/* ━━━ TAB: Your Path ━━━ */}
            {activeTab === 'path' && (
              <div className="space-y-1">
                {myPath.map((node, i) => {
                  const isFailPoint = node.id === myFate.deathNode;
                  const isSuccess = node.type === 'outcome-good';
                  const isBad = node.type === 'outcome-bad';
                  const isGate = node.type === 'bottleneck' || node.type === 'gate' || node.type === 'decision';

                  return (
                    <div key={`${node.id}-${i}`} className="flex gap-3">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center" style={{ width: 20 }}>
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1.5"
                          style={{
                            background: isFailPoint ? 'var(--danger-hover)'
                              : isSuccess ? 'var(--success-hover)'
                              : isBad ? 'var(--danger-hover)'
                              : isGate ? 'var(--foreground)' : 'var(--muted)',
                            opacity: isGate ? 0.7 : 1,
                          }}
                        />
                        {i < myPath.length - 1 && (
                          <div className="w-px flex-1 min-h-[20px]" style={{ background: 'var(--border)' }} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[12px] font-medium"
                            style={{ color: isFailPoint ? 'var(--danger-hover)' : isSuccess ? 'var(--success-hover)' : 'var(--foreground)' }}
                          >
                            {node.label}
                          </span>
                          {isGate && node.prob != null && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded-full font-medium tabular-nums"
                              style={{
                                background: isFailPoint ? 'color-mix(in srgb, var(--danger-hover) 8%, transparent)' : 'color-mix(in srgb, var(--success-hover) 8%, transparent)',
                                color: isFailPoint ? 'var(--danger-hover)' : 'var(--success-hover)',
                                fontFamily: 'var(--font-geist-mono)',
                              }}
                            >
                              {isFailPoint ? 'FAILED' : 'PASSED'} ({node.prob}%)
                            </span>
                          )}
                        </div>
                        {node.desc && (
                          <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: 'var(--muted)' }}>
                            {node.desc}
                          </p>
                        )}
                        <span
                          className="text-[9px] uppercase tracking-[0.08em] mt-1 inline-block"
                          style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)', opacity: 0.6 }}
                        >
                          {node.type}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ━━━ TAB: Diagnosis ━━━ */}
            {activeTab === 'diagnosis' && (
              <div>
                {myFate.outcome === 'success' ? (
                  <div className="rounded-xl p-4" style={{ background: 'color-mix(in srgb, var(--success-hover) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--success-hover) 15%, transparent)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <IconCheck size={16} />
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--success-hover)' }}>You succeeded</span>
                    </div>
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                      You passed every bottleneck in the simulation. Your sacred root profile was strong enough to navigate this path.
                    </p>
                  </div>
                ) : failureNode && failureData ? (
                  <div className="space-y-4">
                    {/* Failure point */}
                    <div className="rounded-xl p-4" style={{ background: 'color-mix(in srgb, var(--danger-hover) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--danger-hover) 12%, transparent)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <IconAlertTriangle size={16} />
                        <span className="text-[13px] font-semibold" style={{ color: 'var(--danger-hover)' }}>
                          Where You Fell
                        </span>
                      </div>
                      <h4 className="text-[12px] font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        {failureData.label as string}
                      </h4>
                      {typeof failureData.desc === 'string' && failureData.desc && (
                        <p className="text-[10px] mb-3 leading-relaxed" style={{ color: 'var(--muted)' }}>
                          {failureData.desc}
                        </p>
                      )}

                      {/* Probability comparison */}
                      {failurePersonalProb && (
                        <div className="flex gap-3 mb-3">
                          <div className="flex-1 rounded-lg p-2.5" style={{ background: 'var(--surface)' }}>
                            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>Generic</div>
                            <div className="text-[18px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--foreground)' }}>
                              {failurePersonalProb.generic}%
                            </div>
                          </div>
                          <div className="flex-1 rounded-lg p-2.5" style={{ background: 'var(--surface)' }}>
                            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>Your Prob</div>
                            <div
                              className="text-[18px] font-semibold tabular-nums"
                              style={{
                                fontFamily: 'var(--font-geist-mono)',
                                color: failurePersonalProb.personal < failurePersonalProb.generic ? 'var(--danger-hover)' : 'var(--success-hover)',
                              }}
                            >
                              {failurePersonalProb.personal}%
                            </div>
                          </div>
                          <div className="flex-1 rounded-lg p-2.5" style={{ background: 'var(--surface)' }}>
                            <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>Modifier</div>
                            <div
                              className="text-[18px] font-semibold tabular-nums"
                              style={{
                                fontFamily: 'var(--font-geist-mono)',
                                color: failurePersonalProb.modifier < 1 ? 'var(--danger-hover)' : 'var(--success-hover)',
                              }}
                            >
                              {failurePersonalProb.modifier}x
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sacred root diagnosis */}
                    {failureRootAnalysis.length > 0 && (
                      <div>
                        <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                          Root Cause Analysis
                        </h3>
                        <div className="space-y-3">
                          {failureRootAnalysis.map(({ rootId, root, score }) => (
                            <div key={rootId} className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                                  {root.label_positive}
                                </span>
                                <span
                                  className="text-[11px] font-semibold tabular-nums px-2 py-0.5 rounded-full"
                                  style={{
                                    fontFamily: 'var(--font-geist-mono)',
                                    background: score <= 4 ? 'color-mix(in srgb, var(--danger-hover) 8%, transparent)' : score <= 6 ? 'var(--warning-muted)' : 'color-mix(in srgb, var(--success-hover) 8%, transparent)',
                                    color: score <= 4 ? 'var(--danger-hover)' : score <= 6 ? 'var(--warning-hover)' : 'var(--success-hover)',
                                  }}
                                >
                                  {score}/10
                                </span>
                              </div>
                              <p className="text-[10px] mb-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                                You fell here because your {root.label_positive} is {score}/10
                              </p>

                              {/* Score bar */}
                              <div className="h-1.5 rounded-full w-full mb-3" style={{ background: 'var(--surface-hover)' }}>
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${score * 10}%`,
                                    background: score <= 4 ? 'var(--danger-hover)' : score <= 6 ? 'var(--warning-hover)' : 'var(--success-hover)',
                                  }}
                                />
                              </div>

                              {/* Sacred verse */}
                              <div className="pl-3 py-2" style={{ borderLeft: '2px solid var(--border)' }}>
                                <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                  &ldquo;{root.bible_text}&rdquo;
                                </p>
                                <span className="text-[9px] mt-1 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                                  {root.bible_key}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
                    No failure point data available.
                  </p>
                )}
              </div>
            )}

            {/* ━━━ TAB: Prescription ━━━ */}
            {activeTab === 'prescription' && (
              <div className="space-y-4">
                {myFate.outcome === 'success' && (
                  <div className="rounded-xl p-4" style={{ background: 'color-mix(in srgb, var(--success-hover) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--success-hover) 15%, transparent)' }}>
                    <p className="text-[11px]" style={{ color: 'var(--success-hover)' }}>
                      You passed all bottlenecks. Focus on strengthening your weakest roots to maintain resilience.
                    </p>
                  </div>
                )}

                {/* Weakest roots prescriptions */}
                {top3Weakest.length > 0 && (
                  <div>
                    <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                      Priority Actions
                    </h3>
                    <div className="space-y-3">
                      {top3Weakest.map(([rootId, score], idx) => {
                        const root = ROOTS_MAP[rootId];
                        if (!root) return null;

                        // Find bottleneck nodes that use this root
                        const affectedNodes = bottleneckNodes.filter(n => n.sacredRoots?.includes(rootId));
                        const improvedScore = Math.min(10, score + 2);

                        return (
                          <div key={rootId} className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{
                                  background: idx === 0 ? 'var(--danger-muted)' : 'var(--warning-muted)',
                                  color: idx === 0 ? 'var(--danger-hover)' : 'var(--warning-hover)',
                                  fontFamily: 'var(--font-geist-mono)',
                                }}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                                {root.label_positive}
                              </span>
                              <span className="text-[10px] tabular-nums ml-auto" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                                {score}/10
                              </span>
                            </div>

                            {/* Sacred verse */}
                            <div className="pl-3 py-2 mb-3" style={{ borderLeft: '2px solid var(--border)' }}>
                              <p className="text-[10px] italic leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                &ldquo;{root.bible_text}&rdquo;
                              </p>
                              <span className="text-[9px] mt-1 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                                {root.bible_key}
                              </span>
                            </div>

                            {/* Concrete action */}
                            <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--muted-foreground)' }}>
                              {root.description}
                            </p>

                            {/* Impact projection */}
                            {affectedNodes.length > 0 && (
                              <div className="rounded-lg p-2.5 mt-2" style={{ background: 'var(--surface-hover)' }}>
                                <p className="text-[9px] font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>
                                  If your {root.label_positive} were {improvedScore}/10:
                                </p>
                                {affectedNodes.map(n => {
                                  const currentProb = computePersonalProb(n.prob!, n.sacredRoots!, sacredProfile);
                                  const improvedProb = hypotheticalProb(n.prob!, n.sacredRoots!, sacredProfile, { [rootId]: improvedScore });
                                  return (
                                    <p key={n.id} className="text-[9px] mt-1 tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                                      {n.label}: {currentProb?.personal ?? n.prob}% {'->'} {improvedProb}%
                                    </p>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ━━━ TAB: What-If ━━━ */}
            {activeTab === 'whatif' && (
              <div className="space-y-4">
                <div className="rounded-xl p-4 mb-4" style={{ border: '1px solid var(--border)' }}>
                  <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    Current compound probability
                  </div>
                  <div className="text-[22px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--foreground)' }}>
                    {currentCompound}%
                  </div>
                </div>

                {/* Scenario cards */}
                {[
                  {
                    title: weakestRoot ? `If ${ROOTS_MAP[weakestRoot[0]]?.label_positive || weakestRoot[0]} improved to 7/10` : 'Improve weakest root to 7',
                    desc: weakestRoot ? `Currently ${weakestRoot[1]}/10 -- the biggest drag on your path` : '',
                    prob: scenario1Prob,
                    delta: Math.round((scenario1Prob - currentCompound) * 100) / 100,
                  },
                  {
                    title: 'If top 3 weakest roots each improved by +2',
                    desc: top3Weakest.map(([id, s]) => `${ROOTS_MAP[id]?.label_positive || id}: ${s} -> ${Math.min(10, s + 2)}`).join(', '),
                    prob: scenario2Prob,
                    delta: Math.round((scenario2Prob - currentCompound) * 100) / 100,
                  },
                  {
                    title: 'If all roots were at 8/10 (ideal scenario)',
                    desc: 'What a balanced, mature person would achieve on this path',
                    prob: scenario3Prob,
                    delta: Math.round((scenario3Prob - currentCompound) * 100) / 100,
                  },
                ].map((sc, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium" style={{ color: 'var(--foreground)' }}>
                        {sc.title}
                      </span>
                    </div>
                    <p className="text-[9px] mb-3 leading-relaxed" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                      {sc.desc}
                    </p>
                    <div className="flex items-end gap-3">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                          Compound Prob
                        </div>
                        <div
                          className="text-[20px] font-semibold tabular-nums"
                          style={{ fontFamily: 'var(--font-geist-mono)', color: sc.prob > currentCompound ? 'var(--success-hover)' : 'var(--foreground)' }}
                        >
                          {sc.prob}%
                        </div>
                      </div>
                      {sc.delta !== 0 && (
                        <span
                          className="text-[11px] font-medium tabular-nums px-2 py-0.5 rounded-full mb-1"
                          style={{
                            fontFamily: 'var(--font-geist-mono)',
                            background: sc.delta > 0 ? 'color-mix(in srgb, var(--success-hover) 8%, transparent)' : 'color-mix(in srgb, var(--danger-hover) 8%, transparent)',
                            color: sc.delta > 0 ? 'var(--success-hover)' : 'var(--danger-hover)',
                          }}
                        >
                          {sc.delta > 0 ? '+' : ''}{sc.delta}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ━━━ TAB: Comparison ━━━ */}
            {activeTab === 'comparison' && (
              <div className="space-y-4">
                {/* Your outcome vs success rate */}
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                      Your Outcome
                    </div>
                    <div
                      className="text-[16px] font-semibold"
                      style={{ color: myFate.outcome === 'success' ? 'var(--success-hover)' : 'var(--danger-hover)' }}
                    >
                      {myFate.outcome === 'success' ? 'Succeeded' : 'Blocked'}
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                      Success Rate
                    </div>
                    <div className="text-[16px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--foreground)' }}>
                      {successRate}%
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-[9px] uppercase tracking-wider mb-1" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                      Same Result
                    </div>
                    <div className="text-[16px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--foreground)' }}>
                      {sameOutcome}/{totalPeople}
                    </div>
                  </div>
                </div>

                {/* Path comparison */}
                <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                  <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-3" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    Your Path vs Most Common
                  </h3>

                  <div className="space-y-2">
                    {/* Your path */}
                    <div>
                      <span className="text-[9px] font-medium" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>YOU ({myFate.path.length} nodes)</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {myFate.path.slice(0, 10).map((nId, i) => {
                          const n = nodeMap[nId];
                          const label = n ? (nd(n).label as string) : nId;
                          const type = n ? (nd(n).nodeType as string) : '';
                          return (
                            <span
                              key={`my-${i}`}
                              className="text-[8px] px-1.5 py-0.5 rounded"
                              style={{
                                background: type === 'outcome-good' ? 'var(--success-muted)' :
                                  type === 'outcome-bad' ? 'var(--danger-muted)' : 'var(--surface-hover)',
                                color: type === 'outcome-good' ? 'var(--success-hover)' :
                                  type === 'outcome-bad' ? 'var(--danger-hover)' : 'var(--muted-foreground)',
                                fontFamily: 'var(--font-geist-mono)',
                              }}
                            >
                              {label.length > 20 ? label.slice(0, 20) + '...' : label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Most common path */}
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <span className="text-[9px] font-medium" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                        MOST COMMON ({mostCommonPath.length} nodes, {mostCommonPathKey ? mostCommonPathKey[1] : 0} people)
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {mostCommonPath.slice(0, 10).map((nId, i) => {
                          const n = nodeMap[nId];
                          const label = n ? (nd(n).label as string) : nId;
                          const type = n ? (nd(n).nodeType as string) : '';
                          return (
                            <span
                              key={`common-${i}`}
                              className="text-[8px] px-1.5 py-0.5 rounded"
                              style={{
                                background: type === 'outcome-good' ? 'var(--success-muted)' :
                                  type === 'outcome-bad' ? 'var(--danger-muted)' : 'var(--surface-hover)',
                                color: type === 'outcome-good' ? 'var(--success-hover)' :
                                  type === 'outcome-bad' ? 'var(--danger-hover)' : 'var(--muted-foreground)',
                                fontFamily: 'var(--font-geist-mono)',
                              }}
                            >
                              {label.length > 20 ? label.slice(0, 20) + '...' : label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Percentile */}
                <div className="rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                  <h3 className="text-[10px] uppercase tracking-[0.1em] font-medium mb-2" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    Your Position
                  </h3>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    You are in the{' '}
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-geist-mono)' }}>
                      {myFate.outcome === 'success'
                        ? `top ${100 - successRate}%`
                        : `bottom ${100 - successRate}%`
                      }
                    </span>
                    {' '}of simulated people.
                    {myFate.outcome === 'success'
                      ? ` Only ${successCount} out of ${totalPeople} made it through.`
                      : ` ${totalPeople - successCount} out of ${totalPeople} were blocked like you.`
                    }
                  </p>

                  {/* Distribution bar */}
                  <div className="mt-3 relative">
                    <div className="h-4 rounded-full overflow-hidden flex" style={{ background: 'var(--surface-hover)' }}>
                      <div
                        className="h-full"
                        style={{ width: `${successRate}%`, background: 'var(--success-hover)', opacity: 0.3 }}
                      />
                      <div
                        className="h-full"
                        style={{ width: `${100 - successRate}%`, background: 'var(--danger-hover)', opacity: 0.3 }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[8px] tabular-nums" style={{ color: 'var(--success-hover)', fontFamily: 'var(--font-geist-mono)' }}>
                        {successRate}% succeeded
                      </span>
                      <span className="text-[8px] tabular-nums" style={{ color: 'var(--danger-hover)', fontFamily: 'var(--font-geist-mono)' }}>
                        {100 - successRate}% blocked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Footer ─── */}
          <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[9px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
              Deterministic simulation -- Person #1 = YOU
            </p>
            <button
              onClick={onClose}
              className="text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              style={{ background: 'var(--surface-hover)', color: 'var(--foreground)' }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
