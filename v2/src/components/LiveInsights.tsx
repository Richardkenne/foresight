'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Node as RFNode } from '@xyflow/react';
import type { SimStats } from './useSimulation';

interface Insight {
  id: number;
  time: string;
  text: string;
  type: 'stat' | 'alert' | 'pattern' | 'ai';
}

interface LiveInsightsProps {
  simStats: SimStats;
  nodes: RFNode[];
  nodeReachRef: React.MutableRefObject<Record<string, Set<number>>>;
  edges: { source: string; target: string; label?: string }[];
  scenario: string;
  onClose: () => void;
}

function formatTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

function computeInsights(
  stats: SimStats,
  nodes: RFNode[],
  nodeReach: Record<string, Set<number>>,
  edges: { source: string; target: string; label?: string }[],
  prevStats: SimStats | null,
): Insight[] {
  const insights: Insight[] = [];
  const now = formatTime();
  let id = Date.now();

  const total = stats.total;
  const success = stats.success;
  const blocked = stats.blocked;
  const rate = total > 0 ? Math.round((success / total) * 100) : 0;

  // Survival rate
  if (total >= 10) {
    insights.push({ id: id++, time: now, type: 'stat', text: `Survival rate: ${rate}% (${success}/${total})` });
  }

  // Rate trend
  if (prevStats && prevStats.total >= 10 && total >= 20) {
    const prevRate = Math.round((prevStats.success / prevStats.total) * 100);
    const diff = rate - prevRate;
    if (Math.abs(diff) >= 2) {
      insights.push({
        id: id++, time: now, type: 'pattern',
        text: diff > 0
          ? `Survival rate trending UP (+${diff}pp since last check)`
          : `Survival rate trending DOWN (${diff}pp since last check)`,
      });
    }
  }

  // Deadliest bottleneck
  const bottlenecks: { label: string; killRate: number; reached: number }[] = [];
  for (const n of nodes) {
    const data = n.data as Record<string, unknown>;
    const nt = data.nodeType as string;
    if (nt !== 'bottleneck' && nt !== 'decision' && nt !== 'gate') continue;
    const reached = nodeReach[n.id]?.size || 0;
    if (reached < 5) continue;
    const passEdge = edges.find(e => e.source === n.id && (((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes')));
    const passed = passEdge ? (nodeReach[passEdge.target]?.size || 0) : 0;
    const killRate = Math.round((1 - passed / reached) * 100);
    bottlenecks.push({ label: (data.label as string) || 'Unknown', killRate, reached });
  }
  bottlenecks.sort((a, b) => b.killRate - a.killRate);

  if (bottlenecks.length > 0) {
    const worst = bottlenecks[0];
    insights.push({
      id: id++, time: now, type: 'alert',
      text: `Deadliest bottleneck: "${worst.label}" -- ${worst.killRate}% drop rate (${worst.reached} reached)`,
    });
  }

  // Milestone alerts
  const milestones = [50, 100, 250, 500, 1000, 2500, 5000];
  for (const m of milestones) {
    if (total >= m && (prevStats?.total || 0) < m) {
      insights.push({ id: id++, time: now, type: 'alert', text: `Milestone: ${m} people have entered the simulation` });
    }
  }

  // Success milestones
  const sMilestones = [1, 5, 10, 25, 50, 100];
  for (const m of sMilestones) {
    if (success >= m && (prevStats?.success || 0) < m) {
      insights.push({ id: id++, time: now, type: 'alert', text: `${m} ${m === 1 ? 'person has' : 'people have'} made it through` });
    }
  }

  // Outcome nodes insight
  const outcomeGood = nodes.filter(n => (n.data as Record<string, unknown>).nodeType === 'outcome-good');
  const outcomeBad = nodes.filter(n => (n.data as Record<string, unknown>).nodeType === 'outcome-bad');
  if (outcomeBad.length > 0 && total >= 20) {
    let worstOutcome = { label: '', count: 0 };
    for (const n of outcomeBad) {
      const count = nodeReach[n.id]?.size || 0;
      if (count > worstOutcome.count) {
        worstOutcome = { label: (n.data as Record<string, unknown>).label as string, count };
      }
    }
    if (worstOutcome.count > 0) {
      insights.push({
        id: id++, time: now, type: 'stat',
        text: `Most common failure: "${worstOutcome.label}" (${worstOutcome.count} people)`,
      });
    }
  }

  if (outcomeGood.length > 0 && success > 0) {
    let bestOutcome = { label: '', count: 0 };
    for (const n of outcomeGood) {
      const count = nodeReach[n.id]?.size || 0;
      if (count > bestOutcome.count) {
        bestOutcome = { label: (n.data as Record<string, unknown>).label as string, count };
      }
    }
    if (bestOutcome.count > 0) {
      insights.push({
        id: id++, time: now, type: 'stat',
        text: `Top success path: "${bestOutcome.label}" (${bestOutcome.count} people)`,
      });
    }
  }

  return insights;
}

export default function LiveInsights({ simStats, nodes, nodeReachRef, edges, scenario, onClose }: LiveInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [realTimeFacts, setRealTimeFacts] = useState<string[]>([]);
  const [currentFactIdx, setCurrentFactIdx] = useState(0);
  const prevStatsRef = useRef<SimStats | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addInsights = useCallback(() => {
    const newInsights = computeInsights(simStats, nodes, nodeReachRef.current, edges, prevStatsRef.current);
    if (newInsights.length > 0) {
      setInsights(prev => [...newInsights, ...prev].slice(0, 50));
    }
    prevStatsRef.current = { ...simStats };
  }, [simStats, nodes, nodeReachRef, edges]);

  // Compute insights every 30 seconds
  useEffect(() => {
    addInsights();
    const id = setInterval(addInsights, 30000);
    return () => clearInterval(id);
  }, [addInsights]);

  // Fetch real-time world facts on mount (Tavily + Haiku)
  useEffect(() => {
    if (!scenario) return;
    fetch('/api/live-facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    })
      .then(r => r.ok ? r.json() : { facts: [] })
      .then(d => {
        if (d.facts?.length > 0) setRealTimeFacts(d.facts);
      })
      .catch(() => {});
  }, [scenario]);

  // Rotate real-time facts every 8 seconds
  useEffect(() => {
    if (realTimeFacts.length === 0) return;
    const id = setInterval(() => {
      setCurrentFactIdx(prev => (prev + 1) % realTimeFacts.length);
    }, 8000);
    return () => clearInterval(id);
  }, [realTimeFacts]);

  const typeStyles: Record<string, { color: string; icon: string }> = {
    stat: { color: '#60a5fa', icon: '#' },
    alert: { color: '#fbbf24', icon: '!' },
    pattern: { color: '#a78bfa', icon: '~' },
    ai: { color: '#34d399', icon: '*' },
  };

  return (
    <motion.div
      className="w-full sm:w-[320px] shrink-0 h-full flex flex-col overflow-hidden"
      style={{
        background: 'rgba(6, 8, 16, 0.92)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', fontFamily: 'var(--font-geist-mono, monospace)' }}>LIVE INSIGHTS</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-all cursor-pointer"
          style={{ color: '#64748b' }}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* Real-time world ticker */}
      {realTimeFacts.length > 0 && (
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(239, 68, 68, 0.04)' }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', letterSpacing: '0.1em', fontFamily: 'var(--font-geist-mono, monospace)' }}>RIGHT NOW IN THE WORLD</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentFactIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 11, color: '#e2e8f0', lineHeight: 1.6 }}
            >
              {realTimeFacts[currentFactIdx]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-0.5 mt-2">
            {realTimeFacts.map((_, i) => (
              <div key={i} className="h-[2px] flex-1 rounded-full transition-all duration-300" style={{ background: i === currentFactIdx ? '#ef4444' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </div>
      )}

      {/* Insights feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <AnimatePresence initial={false}>
          {insights.length === 0 && realTimeFacts.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#475569', fontSize: 12, textAlign: 'center', paddingTop: 40 }}>
              Connecting to real-time data...
              <br />
              <span style={{ fontSize: 10, color: '#334155' }}>Loading world facts + simulation insights</span>
            </motion.div>
          )}
          {insights.map((insight) => {
            const style = typeStyles[insight.type] || typeStyles.stat;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg px-3 py-2.5"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-start gap-2">
                  <span style={{
                    fontSize: 10, fontWeight: 800, color: style.color,
                    fontFamily: 'var(--font-geist-mono, monospace)',
                    width: 14, textAlign: 'center', flexShrink: 0, marginTop: 1,
                  }}>
                    {style.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 11, color: '#cbd5e1', lineHeight: 1.5 }}>{insight.text}</p>
                    <span style={{ fontSize: 9, color: '#475569', fontFamily: 'var(--font-geist-mono, monospace)' }}>{insight.time}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
