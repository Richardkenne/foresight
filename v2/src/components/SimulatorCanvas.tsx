'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react';

import SimNodeComponent from './nodes/SimNode';
import ContextNodeComponent from './nodes/ContextNode';
import AnimatedEdgeComponent from './edges/AnimatedEdge';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import LiveInsights from './LiveInsights';
import CrashTestPanel from './CrashTestPanel';
import type { CrashTestScenario } from '@/lib/crash-test';
import CommandPalette from './CommandPalette';
import { ToastContainer } from './ui/Toast';
import { GeneratingSkeleton } from './ui/Skeleton';
import type { TemplateNode, TemplateEdge } from '@/lib/templates';
import type { ContextTags } from '@/lib/context-tags';
import DecisionPruning, { type PruningResult } from './DecisionPruning';
import { type UserProfile, loadProfile } from '@/lib/user-profile';
import WarningBanner from './WarningBanner';
import { templateToFlow, getLayoutedElements } from '@/lib/graph-utils';
import { SPD_BASE, type SimSettings } from '@/lib/simulation-types';
import { type SimMode, loadMode, saveMode, MODE_CONFIG } from '@/lib/sim-modes';
import { CutLineIndicator, ParticleLayer } from './SimOverlays';
import { IdleToolbar, RunningToolbar, StatsBar, ReplayBar, StepModeBar, PathFilterBar, ResultsTab } from './SimToolbar';
import { usePathFilter } from './usePathFilter';
import AvatarReport from './AvatarReport';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { sounds } from '@/lib/sounds';
import { generateAgentPopulation, runMultiAgentSim } from '@/lib/multi-agent';
import FeedbackForm from './FeedbackForm';
import { shouldShowReminder } from '@/lib/feedback';
import dynamic from 'next/dynamic';

// Extracted hooks
import { useSimulation } from './useSimulation';
import { useDrillDown, DEPTH_BG_COLORS } from './useDrillDown';
import { useStepMode } from './useStepMode';
import { useReplayMode } from './useReplayMode';
import { useFlowGeneration } from './useFlowGeneration';

const Graph3DView = dynamic(() => import('./Graph3DView'), { ssr: false });
const FlowchartView = dynamic(() => import('./FlowchartView'), { ssr: false });
const MultiAgentResults = dynamic(() => import('./MultiAgentResults'), { ssr: false });

const nodeTypes = { simNode: SimNodeComponent, contextNode: ContextNodeComponent };
const edgeTypes = { animated: AnimatedEdgeComponent };

function LiveTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="fixed top-20 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
      background: 'rgba(6, 8, 16, 0.75)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
    }}>
      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ef4444' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', letterSpacing: '0.08em', fontFamily: 'var(--font-geist-mono, monospace)' }}>LIVE</span>
      <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', fontFamily: 'var(--font-geist-mono, monospace)', fontVariantNumeric: 'tabular-nums' }}>
        {hrs > 0 ? `${pad(hrs)}:` : ''}{pad(mins)}:{pad(secs)}
      </span>
      <div className="w-px h-3" style={{ background: 'rgba(255,255,255,0.15)' }} />
      <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'var(--font-geist-mono, monospace)' }}>
        {pad(startTime.getHours())}:{pad(startTime.getMinutes())}
      </span>
    </div>
  );
}

function SimulatorCanvasInner({ sharedSimulation }: { sharedSimulation?: Record<string, unknown> | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const { fitView, flowToScreenPosition } = useReactFlow();

  const contextTagsRef = useRef<ContextTags>({});
  const profileRef = useRef<UserProfile>(loadProfile());
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('sim-layout-direction') as 'LR' | 'TB') || 'LR';
    return 'LR';
  });
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'flowchart'>(() => {
    if (typeof window !== 'undefined') return (localStorage.getItem('sim-view-mode') as '2d' | '3d' | 'flowchart') || '2d';
    return '2d';
  });

  // Simulation settings (persisted in localStorage)
  const [simSettings, setSimSettings] = useState<SimSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sim-settings');
      if (saved) try { return JSON.parse(saved) as SimSettings; } catch { /* ignore */ }
    }
    return { launchMode: 'wave', speedVariation: true, pathFollowing: true };
  });
  const simSettingsRef = useRef(simSettings);
  useEffect(() => {
    simSettingsRef.current = simSettings;
    if (typeof window !== 'undefined') localStorage.setItem('sim-settings', JSON.stringify(simSettings));
  }, [simSettings]);

  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [openHistoryTrigger, setOpenHistoryTrigger] = useState(0);
  const [openProfileTrigger, setOpenProfileTrigger] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showFeedbackReminder, setShowFeedbackReminder] = useState(false);
  const [showCrashTest, setShowCrashTest] = useState(false);
  const [detailNode, setDetailNode] = useState<RFNode | null>(null);
  const [multiAgentRunning, setMultiAgentRunning] = useState(false);
  const [multiAgentResult, setMultiAgentResult] = useState<import('@/lib/multi-agent').MultiAgentResult | null>(null);
  const [showAvatarReport, setShowAvatarReport] = useState(false);
  const [showPruning, setShowPruning] = useState(false);
  const pruningResultRef = useRef<PruningResult | null>(null);
  const [speedLevel, setSpeedLevel] = useState(0);
  const speedRef = useRef(0);

  const [activeMode, setActiveMode] = useState<SimMode>(() => loadMode());

  const nodesRef = useRef<RFNode[]>([]);
  const edgesRef = useRef<RFEdge[]>([]);
  const flowContainerRef = useRef<HTMLDivElement>(null);

  // Prevent browser pinch-to-zoom on the React Flow canvas (let RF handle it)
  useEffect(() => {
    const el = flowContainerRef.current;
    if (!el) return;
    const prevent = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) e.preventDefault(); };
    const preventTouch = (e: TouchEvent) => { if (e.touches.length > 1) e.preventDefault(); };
    el.addEventListener('wheel', prevent, { passive: false });
    el.addEventListener('touchmove', preventTouch, { passive: false });
    return () => { el.removeEventListener('wheel', prevent); el.removeEventListener('touchmove', preventTouch); };
  }, []);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // ─── HOOKS ───
  const { undo, redo, canUndo, canRedo, pushState: undoPushState } = useUndoRedo();

  const sim = useSimulation({
    nodesRef, edgesRef, setNodes, setEdges,
    fitView: fitView as (opts?: Record<string, unknown>) => void,
    simSettingsRef, profileRef, speedRef,
  });

  const { pathFilter, setPathFilter, applyPathFilter } = usePathFilter(setNodes, setEdges, nodesRef, edgesRef);

  // ─── MODE HANDLERS ───
  const handleModeChange = useCallback((mode: SimMode) => {
    setActiveMode(mode);
    saveMode(mode);
    document.documentElement.setAttribute('data-mode', mode);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-mode', activeMode);
  }, [activeMode]);

  // What-if mode: snapshot original probs when entering the mode
  useEffect(() => {
    if (activeMode === 'whatif') {
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, originalProb: (n.data as Record<string, unknown>).originalProb ?? (n.data as Record<string, unknown>).prob },
        }))
      );
    }
  }, [activeMode, setNodes]);

  const applyStressProbs = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => {
        const data = n.data as Record<string, unknown>;
        if (data?.prob != null && (data.prob as number) < 100) {
          const probRange = data?.probRange as Record<string, unknown> | undefined;
          const adverse = probRange?.adverse as number | undefined;
          return {
            ...n,
            data: {
              ...data,
              originalProb: data.originalProb ?? data.prob,
              prob: adverse ?? Math.max(1, Math.round((data.prob as number) * 0.5)),
            },
          };
        }
        return n;
      })
    );
  }, [setNodes]);

  const requestSimulate = useCallback(() => {
    if (sim.simRunningRef.current || nodesRef.current.length === 0) return;
    if (activeMode === 'explore') return;
    if (activeMode === 'stress') applyStressProbs();
    setShowPruning(true);
  }, [sim.simRunningRef, activeMode, applyStressProbs]);

  const simulateRef = useRef<() => void>(() => {});
  const doSimulate = useCallback(() => {
    if (activeMode === 'explore') return;
    sim.simulate(setPathFilter);
  }, [sim, setPathFilter, activeMode]); // eslint-disable-line react-hooks/exhaustive-deps
  simulateRef.current = doSimulate;

  const handlePruningComplete = useCallback((result: PruningResult) => {
    pruningResultRef.current = result;
    setShowPruning(false);
    sim.applyPruningModifiers(result.combinedModifier);
    setTimeout(() => simulateRef.current(), 150);
  }, [sim.applyPruningModifiers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePruningSkip = useCallback(() => {
    pruningResultRef.current = null;
    setShowPruning(false);
    setTimeout(() => simulateRef.current(), 150);
  }, []);

  const flow = useFlowGeneration({
    nodesRef, edgesRef, setNodes, setEdges,
    fitView: fitView as (opts?: Record<string, unknown>) => void,
    contextTagsRef, profileRef, layoutDirection, undoPushState,
    sim: {
      stopSim: sim.stopSim,
      setShowDashboard: sim.setShowDashboard,
      setParticles: sim.setParticles,
      particlesRef: sim.particlesRef,
      statsRef: sim.statsRef,
      setSimStats: sim.setSimStats,
      setYouOutcome: sim.setYouOutcome as (v: null) => void,
      youPathRef: sim.youPathRef,
      simRunningRef: sim.simRunningRef,
      dataflowRef: sim.dataflowRef as never,
      nodeValuesRef: sim.nodeValuesRef,
      setNodeValues: sim.setNodeValues,
      handleNodeSliderChange: sim.handleNodeSliderChange,
    },
    doSimulate, requestSimulate,
  });

  const step = useStepMode({
    nodesRef, setNodes, setEdges,
    fitView: fitView as (opts?: Record<string, unknown>) => void,
    setShowDashboard: sim.setShowDashboard, setPathFilter,
  });

  const replay = useReplayMode({
    nodesRef, edgesRef, setNodes, setEdges,
    simRunningRef: sim.simRunningRef,
    nodeReachRef: sim.nodeReachRef,
    particlesRef: sim.particlesRef as React.MutableRefObject<unknown[]>,
    setParticles: sim.setParticles as (p: never[]) => void,
    statsRef: sim.statsRef, setSimStats: sim.setSimStats,
    setShowDashboard: sim.setShowDashboard,
  });

  const drill = useDrillDown({
    nodesRef, edgesRef, setNodes, setEdges,
    fitView: fitView as (opts?: Record<string, unknown>) => void,
    scenario: flow.scenario, setScenario: flow.setScenario,
    lastFlowData: flow.lastFlowData, setLastFlowData: flow.setLastFlowData,
    sacredMode: flow.sacredMode, layoutDirection, contextTagsRef, profileRef,
    generating: flow.generating,
    stopSim: sim.stopSim, setShowDashboard: sim.setShowDashboard,
    setParticles: sim.setParticles as (p: never[]) => void,
    particlesRef: sim.particlesRef as React.MutableRefObject<unknown[]>,
    statsRef: sim.statsRef, setSimStats: sim.setSimStats,
    simRunningRef: sim.simRunningRef, requestSimulate,
  });

  // ─── EFFECTS ───
  useEffect(() => {
    if (!sharedSimulation?.flow) return;
    const f = sharedSimulation.flow as Record<string, unknown>;
    if (!f.nodes || !f.edges) return;
    flow.setScenario((sharedSimulation.scenario as string) || '');
    flow.setLastFlowData(f);
    const tNodes = (f.nodes as TemplateNode[]).map(n => ({ ...n, source: n.source || 'Shared' }));
    const { nodes: ln, edges: le } = templateToFlow(tNodes, f.edges as TemplateEdge[], undefined, layoutDirection);
    setNodes(ln); setEdges(le);
    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 200);
  }, [sharedSimulation, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && flow.generating && flow.abortRef.current) flow.abortRef.current.abort();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(v => !v); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flow.generating]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (shouldShowReminder()) {
      const t = setTimeout(() => setShowFeedbackReminder(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (flow.errorMsg) { const t = setTimeout(() => flow.setErrorMsg(''), 4000); return () => clearTimeout(t); }
  }, [flow.errorMsg]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && !isInput) {
        e.preventDefault(); const s = undo(); if (s) { setNodes(s.nodes); setEdges(s.edges); sounds.click(); } return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey && !isInput) {
        e.preventDefault(); const s = redo(); if (s) { setNodes(s.nodes); setEdges(s.edges); sounds.click(); } return;
      }
      if (e.key === 'Enter' && !e.shiftKey && isInput && flow.scenario.trim()) { e.preventDefault(); flow.generateFlow(); return; }
      if (e.key === 'Escape') {
        if (step.stepMode) { e.preventDefault(); setDetailNode(null); step.exitStepMode(); return; }
        if (sim.simRunningRef.current) { e.preventDefault(); sim.stopSim(); return; }
        if (sim.showDashboard) { e.preventDefault(); sim.setShowDashboard(false); return; }
      }
      if (e.key === 'Backspace' && !isInput && !sim.simRunningRef.current) { e.preventDefault(); drill.drillBackRef.current(); return; }
      if (step.stepMode && !isInput) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); step.stepForward(); return; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); step.stepBack(); return; }
      }
      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        if (sim.simRunningRef.current) sim.togglePause();
        else if (nodesRef.current.length > 0) requestSimulate();
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flow.scenario, flow.generateFlow, sim, step, drill, undo, redo, setNodes, setEdges, requestSimulate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── HANDLERS ───
  const handleMultiAgent = useCallback(() => {
    if (nodesRef.current.length === 0 || multiAgentRunning) return;
    setMultiAgentRunning(true); setMultiAgentResult(null);
    requestAnimationFrame(() => {
      setTimeout(() => {
        const agents = generateAgentPopulation(1000, 42);
        const result = runMultiAgentSim(agents, nodesRef.current, edgesRef.current);
        setMultiAgentResult(result); setMultiAgentRunning(false);
      }, 50);
    });
  }, [multiAgentRunning]);

  const handleSave = useCallback(async () => {
    if (!flow.lastFlowData || !flow.scenario.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: flow.scenario,
          title: (flow.lastFlowData as Record<string, unknown>).title || flow.scenario.substring(0, 100),
          flow: flow.lastFlowData,
          provider: (flow.lastFlowData as Record<string, unknown>)._provider,
          data_source: (flow.lastFlowData as Record<string, unknown>)._data_source,
        }),
      });
      if (res.ok) { const saved = await res.json(); setShareUrl(`${window.location.origin}/sim/${saved.id}`); }
    } catch { /* silent */ }
    setSaving(false);
  }, [flow.lastFlowData, flow.scenario]);

  const handleShare = useCallback(async () => {
    if (shareUrl) { await navigator.clipboard.writeText(shareUrl); return; }
    if (!flow.lastFlowData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: flow.scenario,
          title: (flow.lastFlowData as Record<string, unknown>).title || flow.scenario.substring(0, 100),
          flow: flow.lastFlowData,
          provider: (flow.lastFlowData as Record<string, unknown>)._provider,
          data_source: (flow.lastFlowData as Record<string, unknown>)._data_source,
        }),
      });
      if (res.ok) { const saved = await res.json(); const url = `${window.location.origin}/sim/${saved.id}`; setShareUrl(url); await navigator.clipboard.writeText(url); }
    } catch { /* silent */ }
    setSaving(false);
  }, [flow.lastFlowData, flow.scenario, shareUrl]);

  const handleExportPNG = useCallback(() => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    import('html-to-image').then(({ toPng }) => {
      toPng(el, { backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff', quality: 1, pixelRatio: 2 })
        .then((dataUrl) => { const a = document.createElement('a'); a.href = dataUrl; a.download = `simulation-${Date.now()}.png`; a.click(); });
    });
  }, []);

  const hasNodes = nodes.length > 0;
  const successRate = sim.simStats.total > 0 ? Math.round(sim.simStats.success / sim.simStats.total * 100) : 0;

  // ─── RENDER ───
  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: DEPTH_BG_COLORS[drill.currentDepth] || DEPTH_BG_COLORS[0], transition: 'background 0.4s ease' }}>
      <TopBar
        scenario={flow.scenario} onScenarioChange={flow.setScenario}
        hasNodes={hasNodes} generating={flow.generating}
        onGenerate={flow.generateFlow}
        depthLevel={flow.depthLevel} onDepthLevelChange={flow.setDepthLevel}
        onRestart={() => {
          sim.stopSim(); sim.statsRef.current = { total: 0, success: 0, blocked: 0 }; sim.setSimStats({ total: 0, success: 0, blocked: 0 });
          sim.setShowDashboard(false); sim.particlesRef.current = []; sim.setParticles([]); flow.setErrorMsg('');
          setNodes(prev => prev.map(n => ({ ...n, style: { ...n.style, opacity: 1 } }))); setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
          setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
        }}
        onStop={() => flow.abortRef.current?.abort()}
        onLoadTemplate={flow.loadTemplate}
        photoPreview={flow.photoPreview}
        onPhotoScenario={flow.handlePhotoScenario}
        onAudioScenario={(text) => { flow.setScenario(text); setTimeout(() => flow.generateFlow(), 50); }}
        onTagsChange={(t) => { contextTagsRef.current = t; }}
        onProfileChange={(p) => { profileRef.current = p; }}
        onHistorySelect={flow.handleHistorySelect}
        sacredMode={flow.sacredMode}
        onSacredModeChange={(newMode) => { flow.setSacredMode(newMode); setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } }))); }}
        attachments={flow.attachments} onAttachmentsChange={flow.setAttachments}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={(dir) => {
          setLayoutDirection(dir); localStorage.setItem('sim-layout-direction', dir);
          if (nodesRef.current.length > 0) {
            const updatedNodes = nodesRef.current.map(n => ({ ...n, data: { ...(n.data as Record<string, unknown>), direction: dir } }));
            const { nodes: ln, edges: le } = getLayoutedElements(updatedNodes, edgesRef.current, dir);
            setNodes(ln); setEdges(le.map(e => ({ ...e, type: dir === 'TB' ? 'smoothstep' : (e.type || 'animated') })));
            setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
          }
        }}
        viewMode={viewMode}
        onViewModeChange={(mode) => { setViewMode(mode); localStorage.setItem('sim-view-mode', mode); }}
        openHistoryTrigger={openHistoryTrigger} openProfileTrigger={openProfileTrigger}
        activeMode={activeMode} onModeChange={handleModeChange}
      />

      {flow.errorMsg && (
        <div className="absolute top-[96px] left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] px-6 py-2.5 rounded-lg backdrop-blur-sm animate-fade-in">
          {flow.errorMsg}
        </div>
      )}

      {!flow.generating && flow.profileWarnings.length > 0 && (
        <WarningBanner warnings={flow.profileWarnings} onDismiss={(id) => flow.setProfileWarnings(prev => prev.filter(w => w.id !== id))} />
      )}

      {flow.generating && (
        <div className="absolute inset-0 top-[80px] z-30 flex items-center justify-center bg-[var(--background)]/70 backdrop-blur-[3px]">
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px 36px', boxShadow: 'var(--shadow-xl)', maxWidth: '480px', width: '90%' }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>Building your simulation...</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Analyzing scenario and sourcing real-world data</div>
            </div>
            <GeneratingSkeleton />
          </div>
        </div>
      )}

      {!hasNodes && !flow.generating && viewMode === '2d' && (
        <div className="absolute inset-0 top-[94px] z-20 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full" style={{ maxWidth: 480 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--border)' }}>
              <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <div className="flex flex-col items-center gap-2 text-center">
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>What do you want to simulate?</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>Type a scenario, upload a photo, or record your voice</div>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Open a cafe in Bali', 'Go freelance on Upwork', 'Move to Europe', 'Launch a SaaS'].map((suggestion) => (
                <button key={suggestion} onClick={() => { flow.setScenario(suggestion); setTimeout(() => flow.generateFlow(), 50); }}
                  style={{ padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, color: 'var(--foreground)', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--muted)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; }}
                >{suggestion}</button>
              ))}
            </div>
            <button onClick={() => setShowCrashTest(true)}
              style={{ marginTop: 8, padding: '10px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', fontFamily: 'Inter, system-ui', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s ease' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Crash Test
            </button>
          </div>
        </div>
      )}

      {drill.simStack.length > 0 && (
        <div className="relative z-40 flex items-center gap-1 px-4 py-2 overflow-x-auto" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', scrollbarWidth: 'thin' }}>
          <button onClick={drill.drillBack} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--muted)', transition: 'all 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
            title="Back (Backspace)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => drill.drillBackToLevel(-1)} className="truncate" style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, maxWidth: 180, transition: 'color 0.15s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
            title={drill.simStack[0]?.scenario || 'Root'}>{drill.simStack[0]?.scenario || 'Main'}</button>
          {drill.simStack.slice(1).map((level, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M9 18l6-6-6-6" /></svg>
              <button onClick={() => drill.drillBackToLevel(i)} className="truncate" style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, maxWidth: 160, transition: 'color 0.15s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
                title={level.parentNodeLabel}>{level.parentNodeLabel}</button>
            </div>
          ))}
          <div className="flex items-center gap-1 flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M9 18l6-6-6-6" /></svg>
            <span className="truncate" style={{ fontSize: 11, fontWeight: 700, color: 'var(--foreground)', padding: '4px 8px', maxWidth: 200 }}>{flow.scenario}</span>
          </div>
          <div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', padding: '3px 8px', borderRadius: 4, background: 'var(--border)', opacity: 0.7 }}>Depth {drill.currentDepth}/3</div>
        </div>
      )}

      {drill.drillLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 32px', boxShadow: 'var(--shadow-xl)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>Drilling into step...</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>Generating sub-simulation</div>
            <div className="mt-3" style={{ width: 140, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden', margin: '12px auto 0' }}>
              <div style={{ width: '60%', height: '100%', background: 'var(--foreground)', borderRadius: 1, animation: 'drill-loading 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex relative overflow-hidden">
        {viewMode === '3d' ? (
          <div className="flex-1 relative"><Graph3DView nodes={nodes} edges={edges} layoutDirection={layoutDirection} /></div>
        ) : viewMode === 'flowchart' ? (
          <FlowchartView nodes={nodes} edges={edges} onNodeClick={(nodeId) => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) setDetailNode(prev => prev?.id === node.id ? null : node);
          }} />
        ) : (
          <div className={`flex-1 relative ${replay.replayMode && !sim.simRunning ? 'cursor-crosshair' : ''}`} ref={flowContainerRef}>
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onNodeClick={(e, node) => { if (step.stepMode) { setDetailNode(prev => prev?.id === node.id ? null : node); } else { replay.onNodeClickReplay(e, node); } }}
              onNodeDoubleClick={drill.onNodeDoubleClick}
              nodeTypes={nodeTypes} edgeTypes={edgeTypes} fitView fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3} maxZoom={2} defaultEdgeOptions={{ type: 'animated', style: { stroke: '#d4d4d4', strokeWidth: 2 } }}>
              <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--muted)" style={{ opacity: 0.5 }} />
              <Controls position="bottom-left" showInteractive={false} className="!border-[var(--border)] !rounded-lg !shadow-sm !overflow-hidden !mb-6 !ml-6" />
              {/* Node count badge */}
              {nodes.length > 0 && (
                <div
                  className="absolute bottom-7 left-20 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                  style={{
                    background: 'color-mix(in srgb, var(--surface) 90%, transparent)',
                    border: '1px solid var(--border)',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span className="text-[10px] font-medium text-[var(--muted)]">
                    {nodes.length} nodes
                    <span className="ml-1 opacity-60">
                      {nodes.length <= 10 ? 'Summary' : nodes.length <= 20 ? 'Analysis' : 'Full Model'}
                    </span>
                  </span>
                </div>
              )}
              <MiniMap position="bottom-right" pannable zoomable
                nodeColor={(node) => { const t = (node.data as Record<string, unknown>).nodeType as string; if (t === 'outcome-good') return '#34d399'; if (t === 'outcome-bad') return '#f87171'; return '#cbd5e1'; }}
                maskColor="rgba(0,0,0,0.08)" style={{ opacity: 0.7, width: 140, height: 90, marginBottom: 24, marginRight: 24 }} />
            </ReactFlow>
            {replay.replayMode && <CutLineIndicator cutNodeId={replay.cutNodeId} nodes={nodes} />}
            <ParticleLayer particles={sim.particles} moveDuration={sim.getSPD().move} pathFollowing={simSettings.pathFollowing} />

            {/* Node Detail Panel (step mode) */}
            {step.stepMode && detailNode && (() => {
              const d = detailNode.data as Record<string, unknown>;
              const nodeType = d.nodeType as string || 'action';
              const prob = d.prob as number | undefined;
              const probRange = d.probRange as { optimistic: number; adverse: number } | undefined;
              const desc = d.desc as string || '';
              const source = d.source as string || '';
              const sourceUrl = d.sourceUrl as string || '';
              const time = d.time as string || '';
              const sacredRoots = d.sacredRoots as string[] || [];
              const hasProb = nodeType === 'bottleneck' || nodeType === 'gate' || nodeType === 'decision';

              // Contextual suggestions based on node label, desc, and prob
              const suggestions: string[] = [];
              const labelLower = (d.label as string || '').toLowerCase();
              const descLower = desc.toLowerCase();
              if (hasProb && prob !== undefined) {
                if (probRange) {
                  suggestions.push(`With preparation: ${probRange.optimistic}% success. Without: ${probRange.adverse}%. The gap is your leverage.`);
                }
                // Upwork-specific suggestions
                if (labelLower.includes('interview') || labelLower.includes('response') || descLower.includes('proposal')) {
                  suggestions.push('Customize every proposal to the client\'s specific problem. Generic proposals have 2-5% response rate vs 15-25% for tailored ones.');
                  suggestions.push('Respond within 1-2 hours of job posting. First 5 proposals get 3x more views.');
                  if (prob < 20) suggestions.push('Use Boosted Proposals on high-value jobs ($500+). Costs more Connects but 2-3x visibility.');
                }
                if (labelLower.includes('hire') || labelLower.includes('convert')) {
                  suggestions.push('Include a Loom video walkthrough in your proposal. Freelancers who do this convert 3-5x more.');
                  suggestions.push('Show relevant portfolio work. Clients hire proof, not promises.');
                }
                if (labelLower.includes('profile') || descLower.includes('profile')) {
                  suggestions.push('100% profile completion = 2x more visibility. Fill every section including video intro.');
                  suggestions.push('Get your first 5-star review within 30 days. JSS 90%+ = 2-3x higher hire rate.');
                }
                if (labelLower.includes('$10k') || labelLower.includes('income') || labelLower.includes('retain')) {
                  suggestions.push('Repeat clients generate 75% of Upwork GSV. Focus on client retention over new proposals.');
                  suggestions.push('Raise rates 10-15% after every 3 successful contracts. Specialists earn 3-5x more than generalists.');
                }
                if (labelLower.includes('speciali') || descLower.includes('niche')) {
                  suggestions.push('Pick ONE niche (e.g. "AI automation for agencies"). Specialists convert 10-20% vs generalists at 2-5%.');
                }
                if (labelLower.includes('proposal') || descLower.includes('connect')) {
                  suggestions.push('Budget $20-30/month in Connects minimum. Average cost before first hire: $9-27 in Connects.');
                }
                // Generic but data-backed fallbacks
                if (suggestions.length === 0 && prob < 30) {
                  suggestions.push(`Only ${prob}% pass this stage. Study the ${prob}% who made it -- what patterns do they share?`);
                  suggestions.push('This is the hardest bottleneck in the flow. Solve this one first, everything else gets easier.');
                }
                if (suggestions.length === 0 && prob < 60) {
                  suggestions.push(`${100 - prob}% fail here. Identify the top 3 reasons for failure and address each one before starting.`);
                }
              }

              return (
                <div
                  className="absolute top-0 right-0 z-20 h-full w-[320px] border-l border-[var(--border)] overflow-y-auto"
                  style={{ background: 'var(--surface)', boxShadow: '-4px 0 20px rgba(0,0,0,0.05)' }}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">{nodeType}</span>
                    <button onClick={() => setDetailNode(null)} className="p-1 rounded hover:bg-[var(--surface-hover)] cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>

                  <div className="px-4 py-4 space-y-4">
                    {/* Title */}
                    <h3 className="text-[15px] font-bold text-[var(--foreground)] leading-snug">{d.label as string}</h3>

                    {/* Probability */}
                    {hasProb && prob !== undefined && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">Probability</span>
                          <span className="text-[18px] font-bold" style={{ color: prob < 30 ? '#ef4444' : prob < 60 ? '#f59e0b' : '#22c55e' }}>{prob}%</span>
                        </div>
                        {probRange && (
                          <div className="flex gap-3 text-[11px]">
                            <span className="text-green-500">Best: {probRange.optimistic}%</span>
                            <span className="text-red-400">Worst: {probRange.adverse}%</span>
                          </div>
                        )}
                        {/* Prob bar */}
                        <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{
                            width: `${prob}%`,
                            background: prob < 30 ? '#ef4444' : prob < 60 ? '#f59e0b' : '#22c55e',
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {desc && (
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Details</span>
                        <p className="text-[13px] text-[var(--foreground)] mt-1 leading-relaxed opacity-80">{desc}</p>
                      </div>
                    )}

                    {/* Time */}
                    {time && (
                      <div className="flex items-center gap-2">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                        <span className="text-[12px] text-[var(--muted)]">{time}</span>
                      </div>
                    )}

                    {/* Source */}
                    {source && (
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Source</span>
                        {sourceUrl ? (
                          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-1 text-[11px] text-blue-500 hover:text-blue-600 font-mono transition-colors">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                            {source}
                          </a>
                        ) : (
                          <p className="text-[11px] text-[var(--muted)] mt-1 font-mono opacity-70">{source}</p>
                        )}
                      </div>
                    )}

                    {/* Sacred Roots with verses */}
                    {sacredRoots.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Behavioral Drivers</span>
                        <div className="space-y-2 mt-1.5">
                          {sacredRoots.map(r => {
                            const root = (require('@/lib/sacred-roots.json') as Array<{id:string;label_positive:string;label_negative:string;description:string;bible_key:string;bible_text:string;quran_key:string;quran_text:string}>).find(sr => sr.id === r);
                            if (!root) return <span key={r} className="text-[10px] text-[var(--muted)]">{r}</span>;
                            return (
                              <div key={r} className="px-2.5 py-2 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                                <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">{root.label_positive} <span className="font-normal opacity-50">vs</span> {root.label_negative}</div>
                                <div className="text-[10px] text-purple-500 dark:text-purple-400 mt-1 opacity-70">{root.description.slice(0, 120)}{root.description.length > 120 ? '...' : ''}</div>
                                <div className="mt-1.5 pt-1.5 border-t border-purple-100 dark:border-purple-800/30 space-y-1">
                                  <div className="text-[10px] italic text-purple-600 dark:text-purple-300 opacity-80">"{root.bible_text.slice(0, 100)}{root.bible_text.length > 100 ? '...' : ''}"</div>
                                  <div className="text-[9px] text-purple-400 font-mono">{root.bible_key} | {root.quran_key}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">How to improve</span>
                        <ul className="mt-1.5 space-y-1.5">
                          {suggestions.map((s, i) => (
                            <li key={i} className="flex gap-2 text-[12px] text-[var(--foreground)] opacity-80">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 shrink-0"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {sim.showDashboard && (
          <Dashboard stats={sim.statsRef.current} nodes={nodesRef.current} nodeUniqueReach={sim.nodeReachRef.current}
            edges={edgesRef.current.map(e => ({ source: e.source, target: e.target, label: e.label as string | undefined }))}
            onClose={() => { sim.setShowDashboard(false); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }}
            onReportOutcome={() => setShowFeedbackForm(true)} scenario={flow.scenario} />
        )}

        {sim.liveMode && sim.simRunning && (
          <LiveInsights
            simStats={sim.simStats}
            nodes={nodesRef.current}
            nodeReachRef={sim.nodeReachRef}
            edges={edgesRef.current.map(e => ({ source: e.source, target: e.target, label: e.label as string | undefined }))}
            scenario={flow.scenario}
            onClose={sim.stopSim}
          />
        )}

        {showFeedbackForm && <FeedbackForm scenario={flow.scenario} predictedProb={sim.simStats.total > 0 ? Math.round(sim.simStats.success / sim.simStats.total * 100) : 0} onClose={() => setShowFeedbackForm(false)} />}

        {showFeedbackReminder && !sim.simRunning && !showFeedbackForm && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-2xl" style={{ background: 'var(--surface)', boxShadow: '0 0 0 1px var(--border), 0 8px 32px rgba(0,0,0,0.12)', backdropFilter: 'blur(8px)', maxWidth: '440px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <p className="text-[12px] leading-snug" style={{ color: 'var(--foreground)' }}>How did it go? Share your outcome to help calibrate predictions.</p>
            <button onClick={() => { setShowFeedbackReminder(false); setShowFeedbackForm(true); }} className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer" style={{ background: 'var(--foreground)', color: 'var(--background)' }}>Report</button>
            <button onClick={() => setShowFeedbackReminder(false)} className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 1l12 12M13 1L1 13" /></svg>
            </button>
          </div>
        )}

        {replay.reversePath && replay.reversePath.length > 0 && (
          <div className="absolute top-[52px] left-4 z-30 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)', width: 320, background: 'var(--surface)', borderRadius: 16, boxShadow: '0 0 0 1px var(--border), 0 8px 32px rgba(0,0,0,0.12)', scrollbarWidth: 'thin' }}>
            <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}><path d="M9 14L4 9l5-5" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" /></svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>Reverse Engineer</span>
                </div>
                <button onClick={replay.clearReversePath} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Path to reach this outcome</div>
              <div className="mt-2 px-3 py-2" style={{ background: replay.reverseCompoundProb > 10 ? 'rgba(16,185,129,0.08)' : replay.reverseCompoundProb > 3 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 8, border: `1px solid ${replay.reverseCompoundProb > 10 ? 'rgba(16,185,129,0.2)' : replay.reverseCompoundProb > 3 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: replay.reverseCompoundProb > 10 ? '#10b981' : replay.reverseCompoundProb > 3 ? '#f59e0b' : '#ef4444' }}>{replay.reverseCompoundProb}%</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>compound probability</span>
              </div>
            </div>
            <div className="px-4 py-3">
              {replay.reversePath.map((s, i) => {
                const isLast = i === replay.reversePath!.length - 1;
                const isOutcome = s.type.startsWith('outcome');
                const isGate = s.type === 'bottleneck' || s.type === 'gate' || s.type === 'decision';
                return (
                  <div key={s.id} className="relative">
                    {i > 0 && <div style={{ position: 'absolute', top: -12, left: 11, width: 1, height: 12, background: 'var(--border)' }} />}
                    {s.edgeLabel && (
                      <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', color: s.edgeLabel.toLowerCase().startsWith('yes') || s.edgeLabel.toLowerCase().startsWith('pass') ? '#10b981' : s.edgeLabel.toLowerCase().startsWith('no') || s.edgeLabel.toLowerCase().startsWith('fail') ? '#ef4444' : '#f59e0b', marginBottom: 4, marginLeft: 28, letterSpacing: '0.05em' }}>{s.edgeLabel}</div>
                    )}
                    <div className="flex items-start gap-3 mb-3">
                      <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: isOutcome ? (s.type === 'outcome-good' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)') : isGate ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.1)', color: isOutcome ? (s.type === 'outcome-good' ? '#10b981' : '#ef4444') : isGate ? '#f59e0b' : 'var(--muted)' }}>{replay.reversePath!.length - i}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', marginBottom: 2 }}>{s.type.replace('-', ' ')}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>{s.label}</div>
                        {isGate && s.prob < 100 && (
                          <div className="mt-1 flex items-center gap-2">
                            <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}><div style={{ width: `${s.prob}%`, height: '100%', background: s.prob > 50 ? '#10b981' : s.prob > 25 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} /></div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: s.prob > 50 ? '#10b981' : s.prob > 25 ? '#f59e0b' : '#ef4444' }}>{s.prob}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isLast && <div style={{ marginLeft: 11, width: 1, height: 8, background: 'var(--border)' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showPruning && <DecisionPruning onComplete={handlePruningComplete} onSkip={handlePruningSkip} questions={flow.apiPruningQuestions.length > 0 ? flow.apiPruningQuestions : undefined} />}

      {showCrashTest && (
        <CrashTestPanel currentScenario={flow.scenario} profile={profileRef.current} sacredMode={flow.sacredMode}
          onLoadScenario={(s: CrashTestScenario) => {
            if (!s.flowData) return;
            const { nodes: ln, edges: le } = templateToFlow(s.flowData.nodes, s.flowData.edges, undefined, layoutDirection);
            setNodes(ln); setEdges(le); flow.setScenario(s.name);
            sim.stopSim(); sim.setShowDashboard(false); sim.particlesRef.current = []; sim.setParticles([]);
            sim.statsRef.current = { total: 0, success: 0, blocked: 0 }; sim.setSimStats({ total: 0, success: 0, blocked: 0 });
            undoPushState({ nodes: ln, edges: le });
            setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
          }}
          onClose={() => setShowCrashTest(false)} />
      )}

      {multiAgentResult && <MultiAgentResults result={multiAgentResult} onClose={() => setMultiAgentResult(null)} />}

      {hasNodes && !sim.simRunning && (
        <IdleToolbar canUndo={canUndo} canRedo={canRedo}
          onUndo={() => { const s = undo(); if (s) { setNodes(s.nodes); setEdges(s.edges); sounds.click(); } }}
          onRedo={() => { const s = redo(); if (s) { setNodes(s.nodes); setEdges(s.edges); sounds.click(); } }}
          replayMode={replay.replayMode} cutNodeId={replay.cutNodeId} hasStats={sim.statsRef.current.total > 0}
          sacredMode={flow.sacredMode} saving={saving} shareUrl={shareUrl}
          onSimulate={requestSimulate}
          onSimulateLive={() => sim.simulateLive()}
          onSimulateFromCut={() => sim.simulateFromCut(replay.cutNodeId!, replay.cutDownstreamRef, replay.cutReachCountRef)}
          onRestart={() => { sim.stopSim(); setTimeout(() => requestSimulate(), 200); }}
          onEnterStepMode={step.enterStepMode} onSimulateReverse={sim.simulateReverse}
          onToggleReplayMode={() => replay.replayMode ? replay.exitReplayMode() : replay.setReplayMode(true)}
          onToggleSacredMode={() => { const newMode = !flow.sacredMode; flow.setSacredMode(newMode); setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } }))); }}
          onBacktest={() => { fetch('/api/backtest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sample_size: 20 }) }).then(r => r.json()).then(d => { if (d.message) alert(d.message + ' — check progress at /api/backtest'); }).catch(() => alert('Backtest failed to start')); }}
          onCrashTest={() => setShowCrashTest(true)} onMultiAgent={handleMultiAgent} multiAgentRunning={multiAgentRunning}
          simSettings={simSettings} onSimSettingsChange={setSimSettings}
          onSave={handleSave} onShare={handleShare} onExportPNG={handleExportPNG}
          onClear={() => { sim.stopSim(); setNodes([]); setEdges([]); sim.setShowDashboard(false); flow.setScenario(''); flow.setErrorMsg(''); }}
          viewMode={viewMode} />
      )}

      {sim.simRunning && viewMode === '2d' && <RunningToolbar simPaused={sim.simPaused} liveMode={sim.liveMode} onTogglePause={sim.togglePause} onStop={sim.stopSim} />}

      {sim.liveMode && sim.simRunning && viewMode === '2d' && <LiveTimer />}

      {sim.simRunning && viewMode === '2d' && (
        <StatsBar speedLevel={speedLevel} currentWave={sim.currentWave} totalWaves={sim.replayOverrideRef.current?.waves ?? SPD_BASE.waves}
          simStats={sim.simStats} successRate={successRate} simPaused={sim.simPaused}
          onSpeedChange={(v) => { setSpeedLevel(v); speedRef.current = v; }}
          youOutcome={sim.youOutcome} launchMode={simSettings.launchMode} />
      )}

      {replay.replayMode && !sim.simRunning && viewMode === '2d' && (
        <ReplayBar cutNodeId={replay.cutNodeId} cutNodeLabel={nodesRef.current.find(n => n.id === replay.cutNodeId)?.data?.label as string || 'node'}
          cutReachCount={replay.cutReachCountRef.current} simRunning={sim.simRunning}
          onSimulateFromCut={() => sim.simulateFromCut(replay.cutNodeId!, replay.cutDownstreamRef, replay.cutReachCountRef)}
          onExitReplayMode={replay.exitReplayMode} />
      )}

      {step.stepMode && (viewMode === '2d' || viewMode === 'flowchart') && <StepModeBar stepIndex={step.stepIndex} totalSteps={step.stepOrderRef.current.length} onStepBack={step.stepBack} onStepForward={step.stepForward} onExitStepMode={step.exitStepMode} />}

      {!sim.simRunning && sim.statsRef.current.total > 0 && !sim.showDashboard && !step.stepMode && viewMode === '2d' && (
        <>
          <ResultsTab onShowDashboard={() => { sim.setShowDashboard(true); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }} />
          <PathFilterBar pathFilter={pathFilter} onFilterChange={applyPathFilter} />
          {sim.youOutcome && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50" style={{ background: 'var(--surface)', boxShadow: '0 0 0 1px rgba(251,191,36,0.4), 0 4px 20px rgba(251,191,36,0.15), 0 4px 12px rgba(0,0,0,0.08)', borderRadius: 12, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px rgba(251,191,36,0.6)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.05em' }}>YOU</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)' }}>reached:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: sim.youOutcome.outcome === 'success' ? '#059669' : '#dc2626', fontFamily: 'var(--font-geist-mono)' }}>{sim.youOutcome.nodeLabel}</span>
              {sim.youOutcome.outcome === 'success' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              {sim.youOutcome.outcome === 'blocked' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
              {profileRef.current?.sacredProfile && Object.keys(profileRef.current.sacredProfile).length > 0 && sim.storedFatesRef.current.length > 0 && (
                <button onClick={() => setShowAvatarReport(true)} className="ml-2 text-[11px] font-medium px-3 py-1 rounded-lg cursor-pointer transition-all" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)'; }}>Personal Report</button>
              )}
            </div>
          )}
        </>
      )}

      {showAvatarReport && sim.storedFatesRef.current.length > 0 && profileRef.current?.sacredProfile && (
        <AvatarReport fates={sim.storedFatesRef.current} nodes={nodesRef.current} edges={edgesRef.current} sacredProfile={profileRef.current.sacredProfile} onClose={() => setShowAvatarReport(false)} />
      )}

      <CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)}
        onLoadTemplate={(key) => flow.loadTemplate(key)} onGenerate={flow.generateFlow}
        onOpenHistory={() => setOpenHistoryTrigger(v => v + 1)} onOpenProfile={() => setOpenProfileTrigger(v => v + 1)}
        onToggleSacredMode={() => { const newMode = !flow.sacredMode; flow.setSacredMode(newMode); setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } }))); }}
        sacredMode={flow.sacredMode} />

      <ToastContainer />
    </div>
  );
}

export default function SimulatorCanvas({ sharedSimulation }: { sharedSimulation?: Record<string, unknown> | null }) {
  return (
    <ReactFlowProvider>
      <SimulatorCanvasInner sharedSimulation={sharedSimulation} />
    </ReactFlowProvider>
  );
}
