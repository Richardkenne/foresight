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
import CrashTestPanel from './CrashTestPanel';
import type { CrashTestScenario } from '@/lib/crash-test';
import CommandPalette from './CommandPalette';
import { toast, ToastContainer } from './ui/Toast';
import { GeneratingSkeleton } from './ui/Skeleton';
import { createPersonSVG, createYouSVG, type ParticleData } from './Particle';
import { TEMPLATES, TEMPLATE_KEYWORDS, type TemplateNode, type TemplateEdge } from '@/lib/templates';
import type { ContextTags } from '@/lib/context-tags';
import { saveToHistory, createThumbnail, type HistoryEntry } from '@/lib/history';
import { SimulatorDataflow } from '@/lib/dataflow-engine';
import { applyRealProbabilities } from '@/lib/probability-matcher';
import DecisionPruning, { type PruningResult } from './DecisionPruning';
import { type UserProfile, loadProfile, getProfilePromptModifier } from '@/lib/user-profile';
import { analyzeProfile, type ProfileWarning } from '@/lib/profile-warnings';
import WarningBanner from './WarningBanner';
import { templateToFlow, getLayoutedElements } from '@/lib/graph-utils';
import { SPD_BASE, SPEED_LEVELS, SPEED_LABELS, precomputeFates, type SimSettings, type LaunchMode } from '@/lib/simulation-types';
import { CutLineIndicator, ParticleLayer } from './SimOverlays';
import { IdleToolbar, RunningToolbar, StatsBar, ReplayBar, StepModeBar, PathFilterBar, ResultsTab } from './SimToolbar';
import { usePathFilter } from './usePathFilter';
import AvatarReport from './AvatarReport';
import type { PrecomputedFate } from '@/lib/simulation-types';
import { extractEdgePaths, getPointOnEdge, type EdgePathInfo } from '@/lib/path-follower';
import { triggerConfetti } from './ui/Confetti';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { sounds } from '@/lib/sounds';
import { generateAgentPopulation, runMultiAgentSim } from '@/lib/multi-agent';
import FeedbackForm from './FeedbackForm';
import { recordSimulationDate, shouldShowReminder } from '@/lib/feedback';
import dynamic from 'next/dynamic';

const Graph3DView = dynamic(() => import('./Graph3DView'), { ssr: false });
const MultiAgentResults = dynamic(() => import('./MultiAgentResults'), { ssr: false });

const nodeTypes = { simNode: SimNodeComponent, contextNode: ContextNodeComponent };
const edgeTypes = { animated: AnimatedEdgeComponent };

// Recursive drill-down: each level stores the graph + context needed to restore it
interface SimLevel {
  nodes: RFNode[];
  edges: RFEdge[];
  scenario: string;
  parentNodeLabel: string;
  depth: number;
  flowData: Record<string, unknown> | null;
}

// Background colors per drill-down depth (subtle distinction)
const DEPTH_BG_COLORS = [
  'var(--background)',          // depth 0 — top level
  'color-mix(in srgb, var(--background) 96%, #6366f1 4%)',  // depth 1 — slight indigo tint
  'color-mix(in srgb, var(--background) 92%, #8b5cf6 8%)',  // depth 2 — slight violet tint
  'color-mix(in srgb, var(--background) 88%, #a855f7 12%)', // depth 3 — slight purple tint
];

function SimulatorCanvasInner({ sharedSimulation }: { sharedSimulation?: Record<string, unknown> | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const { fitView, flowToScreenPosition } = useReactFlow();

  const [scenario, setScenario] = useState('');
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const contextTagsRef = useRef<ContextTags>({});
  const profileRef = useRef<UserProfile>(loadProfile());
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<import('./TopBar').Attachment[]>([]);
  const [layoutDirection, setLayoutDirection] = useState<'LR' | 'TB'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sim-layout-direction') as 'LR' | 'TB') || 'LR';
    }
    return 'LR';
  });
  const [viewMode, setViewMode] = useState<'2d' | '3d'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('sim-view-mode') as '2d' | '3d') || '2d';
    }
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

  // Edge path cache for SVG path following
  const edgePathsRef = useRef<Map<string, EdgePathInfo>>(new Map());
  const animFrameRef = useRef<number>(0);

  // Simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simStats, setSimStats] = useState({ total: 0, success: 0, blocked: 0 });
  const [youOutcome, setYouOutcome] = useState<{ outcome: 'success' | 'blocked'; nodeLabel: string } | null>(null);
  const youPathRef = useRef<Set<string>>(new Set());
  const [showDashboard, setShowDashboard] = useState(false);
  const [sacredMode, setSacredMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [lastFlowData, setLastFlowData] = useState<Record<string, unknown> | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [openHistoryTrigger, setOpenHistoryTrigger] = useState(0);
  const [openProfileTrigger, setOpenProfileTrigger] = useState(0);

  // Community Feedback
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showFeedbackReminder, setShowFeedbackReminder] = useState(false);

  // Crash Test
  const [showCrashTest, setShowCrashTest] = useState(false);

  // Multi-Agent Simulation
  const [multiAgentRunning, setMultiAgentRunning] = useState(false);
  const [multiAgentResult, setMultiAgentResult] = useState<import('@/lib/multi-agent').MultiAgentResult | null>(null);

  // Personal Report
  const [showAvatarReport, setShowAvatarReport] = useState(false);
  const storedFatesRef = useRef<PrecomputedFate[]>([]);

  // Profile warnings
  const [profileWarnings, setProfileWarnings] = useState<ProfileWarning[]>([]);

  // Recursive drill-down state
  const [simStack, setSimStack] = useState<SimLevel[]>([]);
  const [drillLoading, setDrillLoading] = useState<string | null>(null); // node ID loading
  const currentDepth = simStack.length;
  const drillBackRef = useRef<() => void>(() => {});

  // Reverse engineering: click outcome → show path back to root
  const [reversePath, setReversePath] = useState<{ id: string; label: string; type: string; prob: number; edgeLabel: string }[] | null>(null);
  const [reverseCompoundProb, setReverseCompoundProb] = useState(0);

  // Abort controller for cancelling generation
  const abortRef = useRef<AbortController | null>(null);

  // Keyboard shortcuts: Esc to cancel generation, Cmd+K for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && generating && abortRef.current) {
        abortRef.current.abort();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generating]);

  // Sacred patterns data for sacred mode view
  const sacredDataRef = useRef<Record<string, { bible: string; quran: string; pattern: string }>>({});
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [currentWave, setCurrentWave] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(0);
  const speedRef = useRef(0);

  // Replay / scrubbing mode (TradingView-style)
  const [replayMode, setReplayMode] = useState(false);
  const [cutNodeId, setCutNodeId] = useState<string | null>(null);
  const cutDownstreamRef = useRef<Set<string>>(new Set());
  const cutReachCountRef = useRef(0); // how many people reached the cut node in the last sim
  const replayOverrideRef = useRef<{ waves: number; perWave: number } | null>(null);

  // Node values — signal delta propagation (inspired by Loopy)
  const [nodeValues, setNodeValues] = useState<Record<string, number>>({});

  // Decision Pruning — binary questions before simulation
  const [showPruning, setShowPruning] = useState(false);
  const pruningResultRef = useRef<PruningResult | null>(null);
  const [apiPruningQuestions, setApiPruningQuestions] = useState<Array<{id:string;question:string;section:string;yesModifier:number;noModifier:number;yesLabel:string;noLabel:string;insight:string}>>([]);

  // Load shared simulation if provided
  useEffect(() => {
    if (!sharedSimulation?.flow) return;
    const flow = sharedSimulation.flow as Record<string, unknown>;
    if (!flow.nodes || !flow.edges) return;
    setScenario((sharedSimulation.scenario as string) || '');
    setLastFlowData(flow);
    const tNodes = (flow.nodes as TemplateNode[]).map(n => ({ ...n, source: n.source || 'Shared' }));
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[], undefined, layoutDirection);
    setNodes(ln);
    setEdges(le);
    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 200);
  }, [sharedSimulation, fitView]);
  const nodeValuesRef = useRef<Record<string, number>>({});

  const simRunningRef = useRef(false);
  const simPausedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const particleIdRef = useRef(0);
  const personIdRef = useRef(0);
  const statsRef = useRef({ total: 0, success: 0, blocked: 0 });
  const nodesRef = useRef<RFNode[]>([]);
  const edgesRef = useRef<RFEdge[]>([]);
  const nodeReachRef = useRef<Record<string, Set<number>>>({});
  const particlesRef = useRef<ParticleData[]>([]);
  const flowContainerRef = useRef<HTMLDivElement>(null);
  const revealedNodesRef = useRef<Set<string>>(new Set());
  const waveRef = useRef(0);
  const finishedCountRef = useRef(0);
  const originalEdgesRef = useRef<RFEdge[] | null>(null);
  const dataflowRef = useRef<SimulatorDataflow>(new SimulatorDataflow());

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);

  // Speed-adjusted timing values
  const getSPD = useCallback(() => {
    const mult = SPEED_LEVELS[speedRef.current] || 1;
    return {
      move: Math.round(SPD_BASE.move / mult),
      wait: Math.round(SPD_BASE.wait / mult),
      launch: Math.round(SPD_BASE.launch / mult),
      wavePause: Math.round(SPD_BASE.wavePause / mult),
      waves: SPD_BASE.waves,
      perWave: SPD_BASE.perWave,
    };
  }, []);

  // Signal propagation: when a particle reaches a node, it carries a delta that modifies the node value
  // and propagates to connected nodes (Loopy-style feedback)
  const propagateSignal = useCallback((nodeId: string, delta: number) => {
    // Update this node's value
    const current = nodeValuesRef.current[nodeId] || 0;
    nodeValuesRef.current[nodeId] = current + delta;
    setNodeValues({ ...nodeValuesRef.current });

    // Propagate to connected nodes with edge strength
    const outEdges = edgesRef.current.filter(e => e.source === nodeId);
    for (const edge of outEdges) {
      const strength = (edge.data as Record<string, unknown>)?.strength as number ?? 1;
      const propagatedDelta = delta * strength * 0.7; // decay factor
      if (Math.abs(propagatedDelta) > 0.01) {
        // Delayed propagation
        const spd = getSPD();
        setTimeout(() => {
          if (simRunningRef.current) {
            const targetCurrent = nodeValuesRef.current[edge.target] || 0;
            nodeValuesRef.current[edge.target] = targetCurrent + propagatedDelta;
            setNodeValues({ ...nodeValuesRef.current });
          }
        }, spd.move * 0.5);
      }
    }
  }, [getSPD]);

  // Handle slider change on a node — triggers cascading recalculation
  const handleNodeSliderChange = useCallback(async (nodeId: string, value: number, nodeType: string) => {
    if (nodeType === 'start') {
      dataflowRef.current.updateParameter(nodeId, value / 100);
    } else {
      dataflowRef.current.updateProbability(nodeId, value);
    }
    // Recompute all values
    const values = await dataflowRef.current.computeAll();
    nodeValuesRef.current = values;
    setNodeValues(values);
    // Update all nodes with new computed values
    setNodes(prev => prev.map(n => ({
      ...n,
      data: {
        ...n.data,
        computedValue: values[n.id],
        onSliderChange: (n.data as Record<string, unknown>).onSliderChange,
      },
    })));
  }, [setNodes]);

  // Community feedback reminder — check on mount
  useEffect(() => {
    if (shouldShowReminder()) {
      // Gentle delay before showing reminder
      const t = setTimeout(() => setShowFeedbackReminder(true), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  // Auto-dismiss error
  useEffect(() => {
    if (errorMsg) {
      const t = setTimeout(() => setErrorMsg(''), 4000);
      return () => clearTimeout(t);
    }
  }, [errorMsg]);

  // Auto-show dashboard when simulation ends naturally
  useEffect(() => {
    if (simRunning && statsRef.current.total > 0) {
      const done = statsRef.current.success + statsRef.current.blocked;
      if (done >= statsRef.current.total && waveRef.current >= (replayOverrideRef.current?.waves ?? SPD_BASE.waves)) {
        // All waves launched and all particles finished
        setTimeout(() => {
          if (simRunningRef.current) {
            stopSim();
          }
        }, 2000);
      }
    }
  }, [simStats, simRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal a node during simulation (called when a particle reaches it)
  const revealNode = useCallback((nodeId: string) => {
    if (revealedNodesRef.current.has(nodeId)) return;
    revealedNodesRef.current.add(nodeId);
    // Make node visible via style on the React Flow wrapper
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' } }
        : n
    ));
    // Unhide edges where both source and target are revealed
    setEdges(prev => prev.map(e => {
      if (revealedNodesRef.current.has(e.source) && revealedNodesRef.current.has(e.target)) {
        return { ...e, hidden: false };
      }
      return e;
    }));
  }, [setNodes, setEdges]);

  // ─── Replay / Scrubbing ───

  // BFS: get all nodes downstream of a given node (following forward edges)
  const getDownstreamNodes = useCallback((startNodeId: string): Set<string> => {
    const downstream = new Set<string>();
    const queue: string[] = [];
    const outEdges = edgesRef.current.filter(e => e.source === startNodeId);
    for (const e of outEdges) {
      if (!downstream.has(e.target)) {
        downstream.add(e.target);
        queue.push(e.target);
      }
    }
    while (queue.length > 0) {
      const current = queue.shift()!;
      const nextEdges = edgesRef.current.filter(e => e.source === current);
      for (const e of nextEdges) {
        if (!downstream.has(e.target)) {
          downstream.add(e.target);
          queue.push(e.target);
        }
      }
    }
    return downstream;
  }, []);

  // Exit replay mode — restore everything
  const exitReplayMode = useCallback(() => {
    setReplayMode(false);
    setCutNodeId(null);
    cutDownstreamRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, isCutPoint: false },
      style: { ...n.style, opacity: 1, transition: 'opacity 0.4s ease' },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
  }, [setNodes, setEdges]);

  // Handle node click in replay mode — cut the graph
  // Reverse engineering: BFS backward from an outcome node to root
  const computeReversePath = useCallback((nodeId: string) => {
    const allEdges = edgesRef.current;
    const allNodes = nodesRef.current;

    // BFS backward
    const path: { id: string; label: string; type: string; prob: number; edgeLabel: string }[] = [];
    let current = nodeId;
    const visited = new Set<string>();

    while (current && !visited.has(current)) {
      visited.add(current);
      const nd = allNodes.find(n => n.id === current);
      if (!nd) break;
      const d = nd.data as Record<string, unknown>;
      // Find the edge that leads TO this node
      const inEdge = allEdges.find(e => e.target === current && visited.has(e.source) === false);
      const edgeLabel = inEdge ? (inEdge.label as string || '') : '';
      path.unshift({
        id: current,
        label: (d.label as string) || '',
        type: (d.nodeType as string) || nd.type || '',
        prob: (d.prob as number) ?? 100,
        edgeLabel,
      });
      // Find parent
      const parentEdge = allEdges.find(e => e.target === current && !visited.has(e.source));
      if (!parentEdge) break;
      current = parentEdge.source;
    }
    // Add the root node
    if (current && !visited.has(current)) {
      const nd = allNodes.find(n => n.id === current);
      if (nd) {
        const d = nd.data as Record<string, unknown>;
        path.unshift({ id: current, label: (d.label as string) || '', type: (d.nodeType as string) || nd.type || '', prob: (d.prob as number) ?? 100, edgeLabel: '' });
      }
    }

    // Compound probability
    const compound = path.reduce((acc, step) => {
      const p = step.prob < 100 ? step.prob / 100 : 1;
      return acc * p;
    }, 1) * 100;

    setReversePath(path);
    setReverseCompoundProb(Math.round(compound * 10) / 10);

    // Highlight the path on canvas
    const pathIds = new Set(path.map(s => s.id));
    setNodes(prev => prev.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: pathIds.has(n.id) ? 1 : 0.15,
        transition: 'opacity 0.4s ease',
      },
    })));
    setEdges(prev => prev.map(e => ({
      ...e,
      style: {
        ...e.style,
        opacity: pathIds.has(e.source) && pathIds.has(e.target) ? 1 : 0.1,
      },
    })));
  }, [setNodes, setEdges]);

  const clearReversePath = useCallback(() => {
    setReversePath(null);
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: 1, transition: 'opacity 0.4s ease' },
    })));
    setEdges(prev => prev.map(e => ({
      ...e,
      style: { ...e.style, opacity: 1 },
    })));
  }, [setNodes, setEdges]);

  const onNodeClickReplay = useCallback((_event: React.MouseEvent, node: RFNode) => {
    // Reverse engineering: click any outcome node (when not in replay/sim)
    if (!replayMode && !simRunningRef.current) {
      const d = node.data as Record<string, unknown>;
      const nodeType = (d.nodeType as string) || '';
      if (nodeType === 'outcome-good' || nodeType === 'outcome-bad') {
        computeReversePath(node.id);
        return;
      }
      // Click non-outcome while reverse is shown → clear
      if (reversePath) {
        clearReversePath();
        return;
      }
    }

    if (!replayMode || simRunningRef.current) return;

    const nodeId = node.id;
    setCutNodeId(nodeId);

    const downstream = getDownstreamNodes(nodeId);
    cutDownstreamRef.current = downstream;

    // Hide downstream nodes, mark cut point
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, isCutPoint: n.id === nodeId },
      style: {
        ...n.style,
        opacity: downstream.has(n.id) ? 0 : 1,
        transition: 'opacity 0.4s ease',
      },
    })));

    // Hide edges touching downstream nodes
    setEdges(prev => prev.map(e => ({
      ...e,
      hidden: downstream.has(e.source) || downstream.has(e.target),
    })));

    // Save how many people reached this node in the last simulation
    const reachSet = nodeReachRef.current[nodeId];
    cutReachCountRef.current = reachSet ? reachSet.size : 0;

    // Clear particles and stats
    particlesRef.current = [];
    setParticles([]);
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    setShowDashboard(false);
  }, [replayMode, getDownstreamNodes, setNodes, setEdges]);

  // Load a template
  const loadTemplate = useCallback((key: string, autoSim = false) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setPhotoPreview(null); // Clear photo when loading template
    // Reset stats before stopSim so dashboard doesn't auto-open
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    setYouOutcome(null);
    youPathRef.current = new Set();
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([]);
    setScenario(t.input);

    // SACRED MODE: generate via API instead of loading static template
    if (sacredMode) {
      setGenerating(true);
      setErrorMsg('');
      fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: t.input, tags: contextTagsRef.current, profile: profileRef.current, sacredMode: true }),
      })
        .then(res => { if (!res.ok) throw new Error('Server error'); return res.json(); })
        .then(flow => {
          if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');
          setLastFlowData(flow);
          if (flow.pruning_questions && Array.isArray(flow.pruning_questions)) {
            setApiPruningQuestions(flow.pruning_questions);
          }
          const tNodes = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'Sacred text' }));
          const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges, undefined, layoutDirection);
          setNodes(ln);
          setEdges(le);
          sounds.whoosh();
          undoPushState({ nodes: ln, edges: le });
          saveToHistory({ scenario: t.input, flowData: { nodes: flow.nodes, edges: flow.edges } });
          setTimeout(() => {
            fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
            setTimeout(() => simulate(), 500);
          }, 100);
        })
        .catch(() => { setErrorMsg('Sacred generation failed.'); })
        .finally(() => setGenerating(false));
      return;
    }
    // Apply real probabilities from verified data (Layer 2 overrides AI estimates)
    const enrichedNodes = applyRealProbabilities(t.nodes) as typeof t.nodes;
    const { nodes: ln, edges: le } = templateToFlow(enrichedNodes, t.edges, undefined, layoutDirection);
    setNodes(ln);
    setEdges(le);
    setErrorMsg('');
    sounds.whoosh();
    undoPushState({ nodes: ln, edges: le });

    // Build dataflow graph and compute initial values
    dataflowRef.current.buildFromTemplate(t.nodes, t.edges).then(async () => {
      const values = await dataflowRef.current.computeAll();
      nodeValuesRef.current = values;
      setNodeValues(values);
      // Update nodes with computed values + slider handlers
      setNodes(prev => prev.map(n => {
        const nt = (n.data as Record<string, unknown>).nodeType as string;
        const isInteractive = nt === 'start' || nt === 'bottleneck' || nt === 'decision' || nt === 'gate';
        return {
          ...n,
          data: {
            ...n.data,
            computedValue: values[n.id],
            onSliderChange: isInteractive
              ? (val: number) => handleNodeSliderChange(n.id, val, nt)
              : undefined,
          },
        };
      }));
    });

    setTimeout(() => {
      fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
      if (autoSim) setTimeout(() => simulate(), 500);
    }, 100);
  }, [setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate from AI
  const generateFlow = useCallback(async () => {
    const textInput = scenario.trim();
    // Combine text + attachments into one enriched scenario
    let input = textInput;
    if (attachments.length > 0) {
      const parts: string[] = [];
      if (textInput) parts.push(textInput);
      for (const att of attachments) {
        parts.push(`[${att.type.toUpperCase()} source: ${att.label}]\n${att.content}`);
      }
      input = parts.join('\n\n---\n\n');
    }
    if (!input) {
      return;
    }
    sounds.click();
    const inputLower = input.toLowerCase();
    const inputWords = inputLower.split(/\s+/).filter(w => w.length > 2);

    // Fuzzy match: check if word is close enough (1-2 char typos)
    const fuzzyMatch = (word: string, keyword: string): boolean => {
      if (keyword.length < 3) return word === keyword;
      // Exact substring match
      if (inputLower.includes(keyword)) return true;
      // Check each input word against keyword with typo tolerance
      for (const w of inputWords) {
        if (w.length < 3) continue;
        // Starts-with match (handles partial stems)
        if (w.startsWith(keyword) || keyword.startsWith(w)) return true;
        // Simple distance: count differing chars (for same-length or +-1 words)
        if (Math.abs(w.length - keyword.length) <= 1) {
          const longer = w.length >= keyword.length ? w : keyword;
          const shorter = w.length < keyword.length ? w : keyword;
          let diffs = 0;
          let si = 0;
          for (let li = 0; li < longer.length && diffs <= 2; li++) {
            if (shorter[si] === longer[li]) { si++; }
            else { diffs++; if (longer.length === shorter.length) si++; }
          }
          diffs += shorter.length - si;
          if (diffs <= 2 && shorter.length >= 4) return true;
        }
      }
      return false;
    };

    // Try keyword match first (exact + fuzzy)
    let best: string | null = null;
    let bestScore = 0;
    for (const [k, words] of Object.entries(TEMPLATE_KEYWORDS)) {
      const sc = words.filter(w => fuzzyMatch(inputLower, w)).length;
      if (sc > bestScore) { bestScore = sc; best = k; }
    }
    if (bestScore >= 3 && best) { loadTemplate(best, true); return; }

    // Call AI API
    setGenerating(true);
    setErrorMsg('');
    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: input, tags: contextTagsRef.current, profile: profileRef.current, sacredMode }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Server error');
      const flow = await res.json();
      if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');
      setLastFlowData(flow);

      // Store dynamic pruning questions from Claude if available
      if (flow.pruning_questions && Array.isArray(flow.pruning_questions)) {
        setApiPruningQuestions(flow.pruning_questions);
      } else {
        setApiPruningQuestions([]);
      }

      statsRef.current = { total: 0, success: 0, blocked: 0 };
      setSimStats({ total: 0, success: 0, blocked: 0 });
      stopSim();
      setShowDashboard(false);
      particlesRef.current = [];
      setParticles([]);
      const tNodes: TemplateNode[] = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'AI generated' }));
      // Auto-label edges: if a bottleneck/decision has 2 outgoing edges,
      // the one going to outcome-bad = fail, the other = pass
      const nodeTypeMap: Record<number, string> = {};
      for (const n of tNodes) nodeTypeMap[n.id] = n.type;
      const tEdges: TemplateEdge[] = (flow.edges as TemplateEdge[]).map(e => {
        if (e.label) return e; // already labeled
        const srcType = nodeTypeMap[e.from];
        const tgtType = nodeTypeMap[e.to];
        if (srcType === 'bottleneck' || srcType === 'decision' || srcType === 'gate') {
          if (tgtType === 'outcome-bad') return { ...e, label: srcType === 'decision' ? 'no' : 'fail' };
          // Check if sibling edge goes to outcome-bad
          const siblings = (flow.edges as TemplateEdge[]).filter(s => s.from === e.from && s !== e);
          const siblingGoesToBad = siblings.some(s => nodeTypeMap[s.to] === 'outcome-bad');
          if (siblingGoesToBad) return { ...e, label: srcType === 'decision' ? 'yes' : 'pass' };
          // Gate: if target is state node, it's the partial path
          if (srcType === 'gate' && tgtType === 'state') return { ...e, label: 'partial' };
        }
        return e;
      });
      const ctx = photoPreview ? { photoUrl: photoPreview, scenario: input } : undefined;
      const { nodes: ln, edges: le } = templateToFlow(tNodes, tEdges, ctx, layoutDirection);
      setNodes(ln);
      setEdges(le);
      undoPushState({ nodes: ln, edges: le });

      // Analyze profile for warnings
      const warnings = analyzeProfile(profileRef.current, input, contextTagsRef.current);
      setProfileWarnings(warnings);

      // Save to history
      const historyEntry: Omit<HistoryEntry, 'id' | 'timestamp'> = {
        scenario: input,
        tags: contextTagsRef.current ? { ...contextTagsRef.current } : undefined,
        flowData: { nodes: flow.nodes, edges: flow.edges },
      };
      if (photoPreview) {
        createThumbnail(photoPreview).then(thumb => {
          saveToHistory({ ...historyEntry, photoThumbnail: thumb || undefined });
        });
      } else {
        saveToHistory(historyEntry);
      }

      setTimeout(() => {
        fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
        // Show Decision Pruning after generate (instead of auto-simulate)
        setTimeout(() => requestSimulate(), 500);
      }, 100);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled — no error message needed
      } else if (best && bestScore >= 2) {
        loadTemplate(best, true);
      } else {
        setErrorMsg('Could not generate scenario. Check your internet connection or pick a template.');
        toast.error('Generation failed. Check your connection or pick a template.');
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  }, [scenario, attachments, loadTemplate, setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // precomputeFates is now imported from @/lib/simulation-types

  // Simulation engine
  const simTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(x => x !== id);
      if (simRunningRef.current && !simPausedRef.current) fn();
      else if (simRunningRef.current && simPausedRef.current) {
        // Re-queue if paused
        const newId = window.setTimeout(function retry() {
          if (!simRunningRef.current) return;
          if (simPausedRef.current) {
            const retryId = window.setTimeout(retry, 200);
            timeoutsRef.current.push(retryId);
          } else {
            fn();
          }
        }, 200);
        timeoutsRef.current.push(newId);
      }
    }, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const updateParticles = useCallback((updater: (prev: ParticleData[]) => ParticleData[]) => {
    particlesRef.current = updater(particlesRef.current);
    setParticles([...particlesRef.current]);
  }, []);

  // Animate a particle along an SVG edge path using requestAnimationFrame
  const animateAlongEdge = useCallback((
    particle: ParticleData,
    sourceNodeId: string,
    targetNodeId: string,
    duration: number,
    onComplete: () => void,
  ) => {
    const pathKey = `${sourceNodeId}->${targetNodeId}`;
    const pathInfo = edgePathsRef.current.get(pathKey);

    // Fallback positions (node centers)
    const sourceNode = nodesRef.current.find(n => n.id === sourceNodeId);
    const targetNode = nodesRef.current.find(n => n.id === targetNodeId);
    const fallbackSource = {
      x: sourceNode ? sourceNode.position.x + 85 - 12 : particle.x,
      y: sourceNode ? sourceNode.position.y + 50 - 16 : particle.y,
    };
    const fallbackTarget = {
      x: targetNode ? targetNode.position.x + 85 - 12 : particle.x,
      y: targetNode ? targetNode.position.y + 50 - 16 : particle.y,
    };

    let startTime: number | null = null;
    let pauseOffset = 0;
    let pauseStart: number | null = null;

    const step = (now: number) => {
      if (!simRunningRef.current) return;
      if (simPausedRef.current) {
        if (!pauseStart) pauseStart = now;
        requestAnimationFrame(step);
        return;
      }
      if (pauseStart) {
        pauseOffset += now - pauseStart;
        pauseStart = null;
      }
      if (!startTime) startTime = now;

      const elapsed = now - startTime - pauseOffset;
      const progress = Math.min(1, elapsed / duration);

      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      const point = getPointOnEdge(pathInfo, eased, fallbackSource, fallbackTarget);
      particle.x = point.x;
      particle.y = point.y;
      updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: point.x, y: point.y } : p));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        onComplete();
      }
    };

    requestAnimationFrame(step);
  }, [updateParticles]);

  // Route particle from a node to the next destination (extracted routing logic)
  // moveTo is defined below and referenced via moveToRef to avoid circular dependency
  const moveToRef = useRef<(particle: ParticleData, nodeId: string, cb: (r: 'success' | 'blocked') => void) => void>(() => {});

  const routeFromNode = useCallback((particle: ParticleData, nodeId: string, cb: (r: 'success' | 'blocked') => void) => {
    if (!simRunningRef.current) return;
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) { cb('blocked'); return; }

    const data = node.data as Record<string, unknown>;
    const nodeType = data.nodeType as string;
    const prob = data.prob as number;
    const isOutcome = nodeType === 'outcome-good' || nodeType === 'outcome-bad';

    // Gate node: 3-way split
    if (nodeType === 'gate' && typeof prob === 'number') {
      const arrivalKey = `arrivals-${nodeId}`;
      const arrivals = ((node.data as Record<string, unknown>)[arrivalKey] as number || 0) + 1;
      setNodes(ns => ns.map(n => n.id === nodeId ? {
        ...n, data: { ...n.data, [arrivalKey]: arrivals }
      } : n));

      const out = edgesRef.current.filter(e => e.source === nodeId);
      const noEdge = out.find(e => e.label === 'no' || e.label === 'fail');
      const partialEdge = out.find(e => ((e.label || '') as string).toLowerCase().startsWith('partial'));
      const yesEdge = out.find(e => e.label === 'yes' || e.label === 'pass');

      const partialPct = (partialEdge?.data as Record<string, unknown>)?.prob as number
        ?? Math.min(25, Math.floor((100 - prob) / 2));
      const noPct = 100 - prob - partialPct;

      const shouldNo = Math.floor(arrivals * noPct / 100);
      const shouldPartial = Math.floor(arrivals * (noPct + partialPct) / 100);
      const prevNo = (node.data as Record<string, unknown>)[`routed-no-${nodeId}`] as number || 0;
      const prevPartial = (node.data as Record<string, unknown>)[`routed-partial-${nodeId}`] as number || 0;

      let route: 'no' | 'partial' | 'yes';
      if (prevNo < shouldNo) route = 'no';
      else if (prevPartial < (shouldPartial - shouldNo)) route = 'partial';
      else route = 'yes';

      const counterKey = `routed-${route}-${nodeId}`;
      const prevCount = (node.data as Record<string, unknown>)[counterKey] as number || 0;
      setNodes(ns => ns.map(n => n.id === nodeId ? {
        ...n, data: { ...n.data, [counterKey]: prevCount + 1 }
      } : n));

      if (route === 'no' && noEdge) {
        const deathKey = `deaths-${nodeId}`;
        const prevDeaths = (node.data as Record<string, unknown>)[deathKey] as number || 0;
        setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, [deathKey]: prevDeaths + 1 } } : n));
        moveToRef.current(particle, noEdge.target, cb);
        return;
      } else if (route === 'partial' && partialEdge) {
        moveToRef.current(particle, partialEdge.target, cb);
        return;
      } else if (route === 'yes' && yesEdge) {
        moveToRef.current(particle, yesEdge.target, cb);
        return;
      }
      if (out.length > 0) { moveToRef.current(particle, out[0].target, cb); return; }
    }

    const hasProb = !isOutcome && nodeType !== 'gate' && typeof prob === 'number' && prob < 100;
    if (hasProb) {
      const arrivalKey = `arrivals-${nodeId}`;
      const passedKey = `passed-${nodeId}`;
      const arrivals = ((node.data as Record<string, unknown>)[arrivalKey] as number || 0) + 1;
      const passed = (node.data as Record<string, unknown>)[passedKey] as number || 0;
      const shouldHavePassed = Math.floor(arrivals * prob / 100);
      const pass = passed < shouldHavePassed;
      setNodes(ns => ns.map(n => n.id === nodeId ? {
        ...n, data: { ...n.data, [arrivalKey]: arrivals, [passedKey]: pass ? passed + 1 : passed }
      } : n));
      if (!pass) {
        const deathKey = `deaths-${nodeId}`;
        const prevDeaths = (node.data as Record<string, unknown>)[deathKey] as number || 0;
        setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, [deathKey]: prevDeaths + 1 } } : n));
        const failEdges = edgesRef.current.filter(e => e.source === nodeId);
        const failE = failEdges.find(e => ((e.label || '') as string).toLowerCase().startsWith('fail') || ((e.label || '') as string).toLowerCase().startsWith('no'));
        if (failE) {
          moveToRef.current(particle, failE.target, cb);
          return;
        }
        // No fail edge — die in place (deterministic scatter based on personId)
        const scatterSeed = particle.personId;
        const fallX = ((scatterSeed * 7) % 80) - 40;
        const fallY = 30 + ((scatterSeed * 13) % 25);
        particle.status = 'failing';
        updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + fallX, y: p.y + fallY, status: 'failing' } : p));
        finishedCountRef.current++;
        cb('blocked');
        return;
      }
    }

    // Route passed particles through "pass"/"yes" edge
    if (hasProb && (nodeType === 'bottleneck' || nodeType === 'decision')) {
      const out = edgesRef.current.filter(e => e.source === nodeId);
      const passE = out.find(e => ((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes'));
      if (passE) {
        moveToRef.current(particle, passE.target, cb);
        return;
      }
    }

    // Follow edges
    const out = edgesRef.current.filter(e => e.source === nodeId);
    if (out.length === 0) {
      const isSuccess = nodeType === 'outcome-good';
      // Deterministic scatter based on personId
      const scatterSeed = particle.personId;
      const ox = ((scatterSeed * 7) % 60) - 30;
      const oy = ((scatterSeed * 13) % 40) - 20;
      if (isSuccess) {
        particle.status = 'success';
        updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + ox, y: p.y + oy, status: 'success' } : p));
      } else {
        particle.status = 'failing';
        updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + ox, y: p.y + oy, status: 'failing' } : p));
      }
      finishedCountRef.current++;
      cb(isSuccess ? 'success' : 'blocked');
      return;
    }

    // Apply edge strength to signal delta
    const nextE = out[0];
    const edgeStrength = (nextE.data as Record<string, unknown>)?.strength as number ?? 1;
    particle.signalDelta = (particle.signalDelta ?? 0.33) * edgeStrength;
    moveToRef.current(particle, nextE.target, cb);
  }, [simTimeout, updateParticles, setNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  const moveTo = useCallback((particle: ParticleData, nodeId: string, cb: (r: 'success' | 'blocked') => void) => {
    if (!simRunningRef.current) return;

    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) { cb('blocked'); return; }

    // Reveal this node when particle arrives
    revealNode(nodeId);

    // Track unique reach
    if (!nodeReachRef.current[nodeId]) nodeReachRef.current[nodeId] = new Set();
    nodeReachRef.current[nodeId].add(particle.personId);

    // Determine source node for edge path following
    const prevNodeId = particle.visitedNodes.size > 0
      ? Array.from(particle.visitedNodes).pop()
      : undefined;
    particle.visitedNodes.add(nodeId);

    // Target position (node center)
    const tx = node.position.x + 85 - 12;
    const ty = node.position.y + 50 - 16;

    // Signal propagation
    const signalDelta = particle.signalDelta ?? 0.33;
    propagateSignal(nodeId, signalDelta);

    const usePathFollow = simSettingsRef.current.pathFollowing && prevNodeId;
    const spd = getSPD();
    const moveDuration = Math.round(spd.move * (particle.speedMult || 1));

    if (usePathFollow && prevNodeId) {
      // SVG path following: animate along the actual edge bezier curve
      animateAlongEdge(particle, prevNodeId, nodeId, moveDuration, () => {
        // Snap to exact node center at end
        particle.x = tx;
        particle.y = ty;
        updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: tx, y: ty } : p));
        // Bottleneck/gate pause: 200ms delay before routing decision
        const nodeData = node.data as Record<string, unknown>;
        const nType = nodeData.nodeType as string;
        const isBnOrGate = nType === 'bottleneck' || nType === 'decision' || nType === 'gate';
        const pauseMs = isBnOrGate ? Math.round(200 / (SPEED_LEVELS[speedRef.current] || 1)) : 0;
        if (pauseMs > 0) {
          simTimeout(() => routeFromNode(particle, nodeId, cb), pauseMs);
        } else {
          routeFromNode(particle, nodeId, cb);
        }
      });
      return;
    }

    // Legacy mode: instant position set, CSS transition handles animation
    particle.x = tx;
    particle.y = ty;
    updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: tx, y: ty } : p));

    // Route from this node after wait delay
    simTimeout(() => {
      routeFromNode(particle, nodeId, cb);
    }, spd.wait);
  }, [simTimeout, updateParticles, revealNode, propagateSignal, getSPD, animateAlongEdge, routeFromNode]);

  // Keep moveToRef in sync for routeFromNode's recursive calls
  moveToRef.current = moveTo;

  // (Old inline routing logic removed — now lives in routeFromNode above)

  const launchPerson = useCallback((startNodeId: string) => {
    const pid = ++personIdRef.current;
    const pId = ++particleIdRef.current;
    const startNode = nodesRef.current.find(n => n.id === startNodeId);
    if (!startNode) return;

    const isYou = pid === 1; // First person launched is always YOU
    const particle: ParticleData = {
      id: pId,
      personId: pid,
      x: startNode.position.x + 85 - 12,
      y: startNode.position.y + 50 - 16,
      svg: isYou ? createYouSVG() : createPersonSVG(),
      status: 'moving',
      visitedNodes: new Set(),
      // Deterministic speed variation based on person index (no Math.random)
      speedMult: isYou ? 1.0 : (simSettingsRef.current.speedVariation
        ? (0.7 + ((pid - 2) / Math.max(1, (SPD_BASE.waves * SPD_BASE.perWave) - 2)) * 0.6)
        : 1.0),
      isYou,
    };

    updateParticles(prev => [...prev, particle]);

    moveTo(particle, startNodeId, (result) => {
      if (result === 'success') statsRef.current.success++;
      else statsRef.current.blocked++;
      setSimStats({ ...statsRef.current });

      // Track YOU outcome
      if (isYou) {
        const lastNodeId = Array.from(particle.visitedNodes).pop();
        const lastNode = nodesRef.current.find(n => n.id === lastNodeId);
        const label = (lastNode?.data as Record<string, unknown>)?.label as string || 'Unknown';
        setYouOutcome({ outcome: result, nodeLabel: label });
        youPathRef.current = new Set(particle.visitedNodes);
      }
    });
  }, [moveTo, updateParticles]);

  const launchWave = useCallback((waveNum: number, startNodeIds: string[]) => {
    const spd = getSPD();
    const override = replayOverrideRef.current;
    const totalWaves = override ? override.waves : spd.waves;
    const peoplePerWave = override ? override.perWave : spd.perWave;

    if (waveNum >= totalWaves || !simRunningRef.current) {
      if (waveNum >= totalWaves) {
        simTimeout(() => {
          if (simRunningRef.current) {
            replayOverrideRef.current = null;
            stopSim();
          }
        }, spd.move + spd.wait * 3);
      }
      return;
    }

    waveRef.current = waveNum;
    setCurrentWave(waveNum + 1);

    for (let i = 0; i < peoplePerWave; i++) {
      simTimeout(() => {
        if (!simRunningRef.current) return;
        statsRef.current.total++;
        setSimStats({ ...statsRef.current });
        const startId = startNodeIds[0];
        launchPerson(startId);
      }, i * spd.launch);
    }

    simTimeout(() => launchWave(waveNum + 1, startNodeIds), spd.perWave * spd.launch + spd.wavePause);
  }, [simTimeout, launchPerson, getSPD]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simultaneous launch: all 100 people spawn at once with small deterministic stagger
  const launchSimultaneous = useCallback((startNodeIds: string[]) => {
    const totalPeople = SPD_BASE.waves * SPD_BASE.perWave; // 100
    const spd = getSPD();

    // Set wave display to show "All" mode
    setCurrentWave(1);

    for (let i = 0; i < totalPeople; i++) {
      // Deterministic stagger: spread launch over ~500ms so they don't all overlap
      const staggerMs = Math.round((i / totalPeople) * 500 / (SPEED_LEVELS[speedRef.current] || 1));
      simTimeout(() => {
        if (!simRunningRef.current) return;
        statsRef.current.total++;
        setSimStats({ ...statsRef.current });
        const startId = startNodeIds[0];
        launchPerson(startId);
      }, staggerMs);
    }

    // Schedule end of simulation
    const maxPathLength = 50; // safety max
    const estimatedDuration = maxPathLength * spd.move + 2000;
    simTimeout(() => {
      if (simRunningRef.current) {
        // Check if all particles have finished
        const checkEnd = () => {
          if (!simRunningRef.current) return;
          const total = statsRef.current.total;
          const finished = statsRef.current.success + statsRef.current.blocked;
          if (finished >= total && total > 0) {
            stopSim();
          } else {
            simTimeout(checkEnd, 500);
          }
        };
        checkEnd();
      }
    }, estimatedDuration);
  }, [simTimeout, launchPerson, getSPD]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate from cut point (replay mode)
  const simulateFromCut = useCallback(() => {
    if (!cutNodeId || simRunningRef.current) return;

    simRunningRef.current = true;
    simPausedRef.current = false;
    setSimRunning(true);
    setSimPaused(false);
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    personIdRef.current = 0;
    particleIdRef.current = 0;
    finishedCountRef.current = 0;
    waveRef.current = 0;
    setCurrentWave(0);
    nodeReachRef.current = {};
    nodesRef.current.forEach(n => { nodeReachRef.current[n.id] = new Set(); });
    particlesRef.current = [];
    setParticles([]);
    setShowDashboard(false);
    setErrorMsg('');
    nodeValuesRef.current = {};
    setNodeValues({});

    // Pre-populate revealed nodes with everything upstream (already visible)
    revealedNodesRef.current = new Set(
      nodesRef.current.filter(n => !cutDownstreamRef.current.has(n.id)).map(n => n.id)
    );

    // Calculate waves/perWave from reach count
    const reach = cutReachCountRef.current || SPD_BASE.waves * SPD_BASE.perWave;
    const perWave = Math.min(10, Math.max(1, Math.ceil(reach / 10)));
    const waves = Math.max(1, Math.ceil(reach / perWave));
    replayOverrideRef.current = { waves, perWave };

    // Launch waves from cut node
    launchWave(0, [cutNodeId]);
  }, [cutNodeId, launchWave]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply pruning modifiers to all bottleneck/decision nodes
  const applyPruningModifiers = useCallback((modifier: number) => {
    if (modifier === 1.0) return; // No change
    setNodes(prev => prev.map(n => {
      const data = n.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      if (nodeType === 'bottleneck' || nodeType === 'decision' || nodeType === 'gate') {
        const origProb = data.prob as number;
        // Apply modifier, clamp to 1-99 range
        const newProb = Math.round(Math.max(1, Math.min(99, origProb * modifier)));
        return { ...n, data: { ...data, prob: newProb } };
      }
      return n;
    }));
  }, [setNodes]);

  // Request pruning before simulation
  const requestSimulate = useCallback(() => {
    if (simRunningRef.current || nodesRef.current.length === 0) return;
    setShowPruning(true);
  }, []);

  // Pruning callbacks use simulateRef to avoid circular dependency
  const simulateRef = useRef<() => void>(() => {});

  // Handle pruning complete — apply modifiers, then start simulation
  const handlePruningComplete = useCallback((result: PruningResult) => {
    pruningResultRef.current = result;
    setShowPruning(false);
    applyPruningModifiers(result.combinedModifier);
    setTimeout(() => simulateRef.current(), 150);
  }, [applyPruningModifiers]);

  // Handle pruning skip — run with no modifiers
  const handlePruningSkip = useCallback(() => {
    pruningResultRef.current = null;
    setShowPruning(false);
    setTimeout(() => simulateRef.current(), 150);
  }, []);

  const simulate = useCallback(() => {
    if (simRunningRef.current || nodesRef.current.length === 0) return;

    // Track simulation date for feedback reminder + increment counter
    recordSimulationDate();
    try {
      const prev = parseInt(localStorage.getItem('sim-total-count') || '0', 10);
      localStorage.setItem('sim-total-count', String(prev + 1));
    } catch { /* ignore */ }

    simRunningRef.current = true;
    simPausedRef.current = false;
    setSimRunning(true);
    setSimPaused(false);
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    personIdRef.current = 0;
    particleIdRef.current = 0;
    finishedCountRef.current = 0;
    waveRef.current = 0;
    setCurrentWave(0);
    nodeReachRef.current = {};
    nodesRef.current.forEach(n => { nodeReachRef.current[n.id] = new Set(); });
    particlesRef.current = [];
    setParticles([]);
    setShowDashboard(false);
    setErrorMsg('');
    setPathFilter('all');
    setYouOutcome(null);
    youPathRef.current = new Set();

    // Reset node signal values
    nodeValuesRef.current = {};
    setNodeValues({});

    // Hide all nodes, reset deterministic counters, sequential reveal
    revealedNodesRef.current = new Set();
    setNodes(prev => prev.map(n => {
      const cleaned = { ...n.data };
      Object.keys(cleaned).forEach(k => {
        if (k.startsWith('arrivals-') || k.startsWith('passed-') || k.startsWith('deaths-') || k.startsWith('routed-')) {
          delete cleaned[k];
        }
      });
      return {
        ...n,
        data: cleaned,
        style: {
          ...n.style,
          opacity: n.type === 'contextNode' ? 1 : 0,
          transition: 'opacity 0.5s ease',
        },
      };
    }));
    // Pre-reveal context node
    const ctxNode = nodesRef.current.find(n => n.type === 'contextNode');
    if (ctxNode) revealedNodesRef.current.add(ctxNode.id);
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

    // Find start nodes (no incoming edges)
    const hasIncoming = new Set(edgesRef.current.map(e => e.target));
    const startNodeIds = nodesRef.current.filter(n => !hasIncoming.has(n.id)).map(n => n.id);
    if (startNodeIds.length === 0) { stopSim(); return; }

    // ─── PRE-DETERMINED FATE SYSTEM ───
    // All paths computed BEFORE animation. The simulation is a replay.
    const totalPeople = SPD_BASE.waves * SPD_BASE.perWave; // 100
    const fates = precomputeFates(totalPeople, startNodeIds[0], nodesRef.current, edgesRef.current, profileRef.current?.sacredProfile);
    storedFatesRef.current = fates;
    const spd = getSPD();

    // DEBUG: log pre-computed fates
    console.log('[SIM] Fates computed:', fates.length, 'Start:', startNodeIds[0]);
    console.log('[SIM] Sample paths:', fates.slice(0, 3).map(f => f.path.join('→')));
    console.log('[SIM] Successes:', fates.filter(f => f.outcome === 'success').length);
    console.log('[SIM] Avg path length:', (fates.reduce((s, f) => s + f.path.length, 0) / fates.length).toFixed(1));
    console.log('[SIM] Speed:', spd);

    // Pre-calculate death counts per node and apply them
    const deathCounts: Record<string, number> = {};
    for (const fate of fates) {
      if (fate.deathNode) {
        deathCounts[fate.deathNode] = (deathCounts[fate.deathNode] || 0) + 1;
      }
    }

    // Extract SVG edge paths for path-following mode
    // Edges need to be visible briefly for DOM query — unhide, extract, re-hide
    if (simSettingsRef.current.pathFollowing) {
      // Temporarily show edges so SVG paths exist in DOM
      setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
      // Use requestAnimationFrame to ensure DOM is painted before extracting paths
      requestAnimationFrame(() => {
        edgePathsRef.current = extractEdgePaths(
          edgesRef.current.map(e => ({ id: e.id, source: e.source, target: e.target }))
        );
        console.log('[SIM] Edge paths extracted:', edgePathsRef.current.size);
        // Re-hide edges for sequential reveal
        setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

        // Launch based on mode
        if (simSettingsRef.current.launchMode === 'simultaneous') {
          launchSimultaneous(startNodeIds);
        } else {
          launchWave(0, startNodeIds);
        }
      });
    } else {
      edgePathsRef.current = new Map();
      if (simSettingsRef.current.launchMode === 'simultaneous') {
        launchSimultaneous(startNodeIds);
      } else {
        launchWave(0, startNodeIds);
      }
    }
  }, [launchWave, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep simulateRef in sync
  simulateRef.current = simulate;

  // Multi-agent simulation (1000 agents, client-side, deterministic)
  const handleMultiAgent = useCallback(() => {
    if (nodesRef.current.length === 0 || multiAgentRunning) return;
    setMultiAgentRunning(true);
    setMultiAgentResult(null);

    // Use requestAnimationFrame to allow UI to show loading state before heavy computation
    requestAnimationFrame(() => {
      setTimeout(() => {
        const agents = generateAgentPopulation(1000, 42);
        const result = runMultiAgentSim(agents, nodesRef.current, edgesRef.current);
        setMultiAgentResult(result);
        setMultiAgentRunning(false);
      }, 50); // small delay to let loading spinner render
    });
  }, [multiAgentRunning]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function stopSim() {
    simRunningRef.current = false;
    simPausedRef.current = false;
    setSimRunning(false);
    setSimPaused(false);
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];

    // Clear edge path cache and offscreen SVG
    edgePathsRef.current = new Map();
    const offscreenSVG = document.getElementById('__sim-offscreen-svg');
    if (offscreenSVG) offscreenSVG.innerHTML = '';

    // Restore original edges FIRST if we were in reverse mode
    // This must happen before setEdges so React Flow gets the correct edges
    if (originalEdgesRef.current) {
      const origEdges = originalEdgesRef.current;
      edgesRef.current = origEdges;
      originalEdgesRef.current = null;
      setEdges(origEdges.map(e => ({ ...e, hidden: false })));
    }

    // Reveal all nodes when simulation ends + clear cut point
    // KILLER NODE HIGHLIGHTING: find the 3-5 deadliest bottlenecks and highlight them
    revealedNodesRef.current = new Set();
    setCutNodeId(null);
    cutDownstreamRef.current = new Set();

    // Calculate kill rates for bottleneck/decision nodes
    const killerNodeIds = new Set<string>();
    const bottleneckKills: { id: string; killRate: number }[] = [];
    for (const n of nodesRef.current) {
      const data = n.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      if (nodeType !== 'bottleneck' && nodeType !== 'decision' && nodeType !== 'gate') continue;
      const reached = nodeReachRef.current[n.id]?.size || 0;
      if (reached === 0) continue;
      // Find pass edge target
      const passEdge = edgesRef.current.find(e => e.source === n.id && (((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes')));
      const passed = passEdge ? (nodeReachRef.current[passEdge.target]?.size || 0) : 0;
      const killRate = 1 - (passed / reached); // 0 = nobody dies, 1 = everyone dies
      bottleneckKills.push({ id: n.id, killRate });
    }
    // Top 3-5 killers (killRate > 30%)
    bottleneckKills.sort((a, b) => b.killRate - a.killRate);
    const topKillers = bottleneckKills.filter(b => b.killRate > 0.3).slice(0, 5);
    for (const k of topKillers) killerNodeIds.add(k.id);
    // Also highlight outcome nodes (always visible)
    for (const n of nodesRef.current) {
      const t = (n.data as Record<string, unknown>).nodeType as string;
      if (t === 'outcome-good' || t === 'outcome-bad') killerNodeIds.add(n.id);
    }

    const hasKillers = topKillers.length > 0;
    const youPath = youPathRef.current;
    const hasYouPath = youPath.size > 0;

    setNodes(prev => prev.map(n => {
      const isKiller = killerNodeIds.has(n.id);
      const isOnYouPath = hasYouPath && youPath.has(n.id);
      return {
        ...n,
        data: { ...n.data, isCutPoint: false },
        style: {
          ...n.style,
          opacity: hasKillers ? (isKiller || isOnYouPath ? 1 : 0.4) : 1,
          transition: 'opacity 0.8s ease',
          filter: hasKillers && !isKiller && !isOnYouPath ? 'grayscale(0.3)' : 'none',
          // Gold outline for YOU path nodes
          ...(isOnYouPath ? { boxShadow: '0 0 0 2px #fbbf24, 0 0 12px rgba(251,191,36,0.3)' } : {}),
        },
      };
    }));

    // Also dim non-critical edges, but keep YOU's path bright
    if (hasKillers || hasYouPath) {
      setEdges(prev => prev.map(e => {
        const isOnYouPath = hasYouPath && youPath.has(e.source) && youPath.has(e.target);
        const isKillerEdge = killerNodeIds.has(e.source) || killerNodeIds.has(e.target);
        return {
          ...e,
          hidden: false,
          style: {
            ...e.style,
            opacity: isOnYouPath ? 1 : (isKillerEdge ? 1 : 0.25),
            transition: 'opacity 0.8s ease',
            // Thicker gold stroke for YOU path edges
            ...(isOnYouPath ? { stroke: '#fbbf24', strokeWidth: 3 } : {}),
          },
        };
      }));
    }

    // Keep particles in their final positions — don't clear them
    // They only get cleared on new simulation or clear button

    // Reset stats refs for clean state
    waveRef.current = 0;
    setCurrentWave(0);
    finishedCountRef.current = 0;

    if (statsRef.current.total > 0) {
      // Trigger confetti if success rate > 50%
      const _total = statsRef.current.total;
      const _success = statsRef.current.success;
      const _rate = _total > 0 ? _success / _total : 0;
      if (_rate > 0.5) {
        setTimeout(() => triggerConfetti(), 300);
        setTimeout(() => sounds.success(), 200);
      } else if (_rate < 0.2) {
        setTimeout(() => sounds.fail(), 200);
      }
      setTimeout(() => { setShowDashboard(true); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }, 500);
    }
  }

  const simulateReverse = useCallback(() => {
    if (simRunningRef.current || nodesRef.current.length === 0) return;

    // Build the reverse traversal order using BFS on ORIGINAL edges (left→right)
    const originalEdges = edgesRef.current;
    const adjForward: Record<string, string[]> = {};
    const hasIncoming = new Set<string>();
    for (const e of originalEdges) {
      if (!adjForward[e.source]) adjForward[e.source] = [];
      adjForward[e.source].push(e.target);
      hasIncoming.add(e.target);
    }
    // Find start nodes (no incoming) to do BFS
    const startIds = nodesRef.current.filter(n => !hasIncoming.has(n.id)).map(n => n.id);

    // BFS to get visit order (left to right)
    const visitOrder: string[] = [];
    const visited = new Set<string>();
    const queue = [...startIds];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      visitOrder.push(id);
      for (const next of (adjForward[id] || [])) {
        if (!visited.has(next)) queue.push(next);
      }
    }
    // Add any unvisited nodes
    for (const n of nodesRef.current) {
      if (!visited.has(n.id)) visitOrder.push(n.id);
    }

    // Reverse the order → right to left
    const reverseOrder = [...visitOrder].reverse();

    // Setup simulation state
    simRunningRef.current = true;
    simPausedRef.current = false;
    setSimRunning(true);
    setSimPaused(false);
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    setYouOutcome(null);
    youPathRef.current = new Set();
    particlesRef.current = [];
    setParticles([]);
    setShowDashboard(false);
    waveRef.current = 0;
    setCurrentWave(0);
    finishedCountRef.current = 0;

    // Save original edges for restore
    originalEdgesRef.current = [...originalEdges];

    // Hide all nodes and edges
    revealedNodesRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: 0, transition: 'opacity 0.5s ease' },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

    // Reveal nodes one by one in reverse order, with particles moving right→left
    const spd = getSPD();
    const stepDelay = spd.move * 0.6;
    let personCount = 0;

    reverseOrder.forEach((nodeId, i) => {
      simTimeout(() => {
        if (!simRunningRef.current) return;

        // Reveal the node
        revealNode(nodeId);

        // Create a particle at this node
        const node = nodesRef.current.find(n => n.id === nodeId);
        if (!node) return;

        personCount++;
        const pid = ++particleIdRef.current;
        const particle: ParticleData = {
          id: pid,
          personId: personCount,
          x: node.position.x + 85 - 12,
          y: node.position.y + 50 - 16,
          svg: createPersonSVG(),
          status: 'moving',
          visitedNodes: new Set([nodeId]),
          speedMult: 0.8 + Math.random() * 0.4,
        };
        updateParticles(prev => [...prev, particle]);

        // Move particle to the PREVIOUS node in reverse order (one step left)
        if (i < reverseOrder.length - 1) {
          const nextNodeId = reverseOrder[i + 1];
          const nextNode = nodesRef.current.find(n => n.id === nextNodeId);
          if (nextNode) {
            simTimeout(() => {
              particle.x = nextNode.position.x + 85 - 12;
              particle.y = nextNode.position.y + 50 - 16;
              updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: particle.x, y: particle.y } : p));
            }, stepDelay * 0.5);
          }
        }

        // Track stats
        const data = node.data as Record<string, unknown>;
        const nodeType = data.nodeType as string;
        if (nodeType === 'outcome-good') { statsRef.current.success++; statsRef.current.total++; }
        else if (nodeType === 'outcome-bad') { statsRef.current.blocked++; statsRef.current.total++; }
        setSimStats({ ...statsRef.current });

        // If last node, stop simulation
        if (i === reverseOrder.length - 1) {
          simTimeout(() => {
            if (simRunningRef.current) stopSim();
          }, stepDelay);
        }
      }, i * stepDelay);
    });
  }, [simTimeout, updateParticles, revealNode, getSPD, createPersonSVG]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePause() {
    if (!simRunningRef.current) return;
    simPausedRef.current = !simPausedRef.current;
    setSimPaused(simPausedRef.current);
  }

  // Get screen position for a canvas coordinate
  const getScreenPos = useCallback((canvasX: number, canvasY: number) => {
    try {
      return flowToScreenPosition({ x: canvasX, y: canvasY });
    } catch {
      return { x: canvasX, y: canvasY };
    }
  }, [flowToScreenPosition]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Cmd+Z = undo, Cmd+Shift+Z = redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey && !isInput) {
        e.preventDefault();
        const state = undo();
        if (state) {
          setNodes(state.nodes);
          setEdges(state.edges);
          sounds.click();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey && !isInput) {
        e.preventDefault();
        const state = redo();
        if (state) {
          setNodes(state.nodes);
          setEdges(state.edges);
          sounds.click();
        }
        return;
      }

      // Enter in input = generate
      if (e.key === 'Enter' && !e.shiftKey && isInput && scenario.trim()) {
        e.preventDefault();
        generateFlow();
        return;
      }

      // Escape = stop simulation or exit step mode
      if (e.key === 'Escape') {
        if (stepMode) {
          e.preventDefault();
          exitStepMode();
          return;
        }
        if (simRunningRef.current) {
          e.preventDefault();
          stopSim();
          return;
        }
        if (showDashboard) {
          e.preventDefault();
          setShowDashboard(false);
          return;
        }
      }

      // Backspace to go back one drill-down level
      if (e.key === 'Backspace' && !isInput && !simRunningRef.current) {
        e.preventDefault();
        drillBackRef.current();
        return;
      }

      // Arrow keys for step mode
      if (stepMode && !isInput) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          stepForward();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          stepBack();
          return;
        }
      }

      // Space = start sim, or pause/resume if already running
      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        if (simRunningRef.current) {
          togglePause();
        } else if (nodesRef.current.length > 0) {
          requestSimulate();
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [scenario, generateFlow, simulate]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasNodes = nodes.length > 0;
  const successRate = simStats.total > 0 ? Math.round(simStats.success / simStats.total * 100) : 0;

  // ─── Step-by-step mode (TradingView style: one card at a time) ───
  const [stepMode, setStepMode] = useState(false);
  const stepIndexRef = useRef(0);
  const [stepIndex, setStepIndex] = useState(0);
  const stepOrderRef = useRef<string[]>([]);

  const enterStepMode = useCallback(() => {
    if (nodesRef.current.length === 0) return;

    // Build left-to-right order of nodes
    const ordered = [...nodesRef.current]
      .filter(n => n.type !== 'contextNode')
      .sort((a, b) => (a.position.x || 0) - (b.position.x || 0));
    stepOrderRef.current = ordered.map(n => n.id);
    stepIndexRef.current = 0;
    setStepIndex(0);
    setStepMode(true);
    setShowDashboard(false);
    setPathFilter('all');

    // Hide all nodes
    setNodes(prev => prev.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.type === 'contextNode' ? 1 : 0,
        transition: 'opacity 0.5s ease',
      },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));
  }, [setNodes, setEdges]);

  const stepForward = useCallback(() => {
    const order = stepOrderRef.current;
    if (stepIndexRef.current >= order.length) return;

    const nodeId = order[stepIndexRef.current];
    stepIndexRef.current++;
    setStepIndex(stepIndexRef.current);

    // Reveal this node
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' } }
        : n
    ));

    // Reveal edges where both source and target are now visible
    const revealedSoFar = new Set(order.slice(0, stepIndexRef.current));
    setEdges(prev => prev.map(e => {
      if (revealedSoFar.has(e.source) && revealedSoFar.has(e.target)) {
        return { ...e, hidden: false };
      }
      return e;
    }));

    // Auto-zoom to the revealed node
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      fitView({ nodes: [node], padding: 1.5, duration: 600, maxZoom: 1.2 });
    }
  }, [setNodes, setEdges, fitView]);

  const stepBack = useCallback(() => {
    if (stepIndexRef.current <= 0) return;

    stepIndexRef.current--;
    setStepIndex(stepIndexRef.current);

    const order = stepOrderRef.current;
    const nodeId = order[stepIndexRef.current];

    // Hide this node
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, style: { ...n.style, opacity: 0, transition: 'opacity 0.3s ease' } }
        : n
    ));

    // Hide edges connected to this node
    setEdges(prev => prev.map(e => {
      if (e.source === nodeId || e.target === nodeId) {
        return { ...e, hidden: true };
      }
      return e;
    }));

    // Zoom to previous node
    if (stepIndexRef.current > 0) {
      const prevNode = nodesRef.current.find(n => n.id === order[stepIndexRef.current - 1]);
      if (prevNode) fitView({ nodes: [prevNode], padding: 1.5, duration: 600, maxZoom: 1.2 });
    }
  }, [setNodes, setEdges, fitView]);

  const exitStepMode = useCallback(() => {
    setStepMode(false);
    // Reveal all nodes
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
  }, [setNodes, setEdges, fitView]);

  // Path filter extracted to usePathFilter hook
  const { pathFilter, setPathFilter, applyPathFilter } = usePathFilter(setNodes, setEdges, nodesRef, edgesRef);

  // ─── Undo / Redo ───
  const { undo, redo, canUndo, canRedo, pushState: undoPushState } = useUndoRedo();

  // Save simulation to Supabase
  const handleSave = useCallback(async () => {
    if (!lastFlowData || !scenario.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          title: (lastFlowData as Record<string, unknown>).title || scenario.substring(0, 100),
          flow: lastFlowData,
          provider: (lastFlowData as Record<string, unknown>)._provider,
          data_source: (lastFlowData as Record<string, unknown>)._data_source,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setShareUrl(`${window.location.origin}/sim/${saved.id}`);
        toast.success('Simulation saved.');
      } else {
        toast.error('Save failed.');
      }
    } catch { toast.error('Save failed.'); }
    setSaving(false);
  }, [lastFlowData, scenario]);

  // Share link (save first if needed, then copy URL)
  const handleShare = useCallback(async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      return;
    }
    if (!lastFlowData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          title: (lastFlowData as Record<string, unknown>).title || scenario.substring(0, 100),
          flow: lastFlowData,
          provider: (lastFlowData as Record<string, unknown>)._provider,
          data_source: (lastFlowData as Record<string, unknown>)._data_source,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        const url = `${window.location.origin}/sim/${saved.id}`;
        setShareUrl(url);
        await navigator.clipboard.writeText(url);
      }
    } catch { /* silent */ }
    setSaving(false);
  }, [lastFlowData, scenario, shareUrl]);

  // Export canvas as PNG
  const handleExportPNG = useCallback(() => {
    const el = document.querySelector('.react-flow') as HTMLElement;
    if (!el) return;
    import('html-to-image').then(({ toPng }) => {
      toPng(el, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background').trim() || '#ffffff',
        quality: 1,
        pixelRatio: 2,
      }).then((dataUrl) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `simulation-${Date.now()}.png`;
        a.click();
      });
    });
  }, []);

  // History: load a saved simulation entry
  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    const flow = entry.flowData;
    if (!flow?.nodes || !flow?.edges) return;

    // ontology scenario cleared
    setScenario(entry.scenario || '');
    setPhotoPreview(entry.photoThumbnail || null);
    setLastFlowData(flow as Record<string, unknown>);

    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([]);
    setErrorMsg('');

    const tNodes = (flow.nodes as TemplateNode[]).map(n => ({ ...n, source: n.source || 'History' }));
    const ctx = entry.photoThumbnail ? { photoUrl: entry.photoThumbnail, scenario: entry.scenario } : undefined;
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[], ctx, layoutDirection);
    setNodes(ln);
    setEdges(le);

    setTimeout(() => {
      fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
      setTimeout(() => simulate(), 500);
    }, 100);
  }, [setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Recursive Drill-Down ───

  // Drill into a node: push current state, generate sub-simulation
  const drillIntoNode = useCallback(async (node: RFNode) => {
    const d = node.data as Record<string, unknown>;
    const nodeType = (d.nodeType as string) || '';
    const drillableTypes = ['bottleneck', 'gate', 'action', 'state', 'decision', 'trajectory'];
    if (!drillableTypes.includes(nodeType)) return;
    if (currentDepth >= 3) {
      toast.error('Maximum drill-down depth (3) reached.');
      return;
    }
    if (simRunningRef.current) return;

    const nodeLabel = (d.label as string) || 'Unknown step';
    const nodeDesc = (d.desc as string) || '';
    const nodeProb = (d.prob as number) ?? 100;

    // Push current state to stack
    const currentLevel: SimLevel = {
      nodes: [...nodesRef.current],
      edges: [...edgesRef.current],
      scenario,
      parentNodeLabel: nodeLabel,
      depth: currentDepth,
      flowData: lastFlowData,
    };

    setDrillLoading(node.id);
    sounds.click();

    try {
      const parentScenario = simStack.length > 0
        ? simStack[0].scenario  // always use the root scenario
        : scenario;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: `${parentScenario} — specifically: ${nodeLabel}`,
          tags: contextTagsRef.current,
          profile: profileRef.current,
          sacredMode,
          parentContext: {
            parentScenario,
            parentNodeLabel: nodeLabel,
            parentNodeDescription: nodeDesc,
            parentNodeProb: nodeProb,
            depth: currentDepth + 1,
          },
        }),
      });

      if (!res.ok) throw new Error('Server error');
      const flow = await res.json();
      if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');

      // Save stack
      setSimStack(prev => [...prev, currentLevel]);

      // Clear simulation state
      statsRef.current = { total: 0, success: 0, blocked: 0 };
      setSimStats({ total: 0, success: 0, blocked: 0 });
      stopSim();
      setShowDashboard(false);
      particlesRef.current = [];
      setParticles([]);

      // Load sub-simulation
      setLastFlowData(flow);
      setScenario(`${nodeLabel}`);
      const tNodes = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'Sub-simulation' }));
      const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges, undefined, layoutDirection);
      setNodes(ln);
      setEdges(le);
      sounds.whoosh();

      setTimeout(() => {
        fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
        setTimeout(() => requestSimulate(), 500);
      }, 100);
    } catch {
      toast.error('Could not generate sub-simulation.');
    } finally {
      setDrillLoading(null);
    }
  }, [currentDepth, scenario, simStack, lastFlowData, sacredMode, layoutDirection, setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Go back one level in the drill-down stack
  const drillBack = useCallback(() => {
    if (simStack.length === 0) return;

    const prev = simStack[simStack.length - 1];

    // Restore previous state
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([]);

    setNodes(prev.nodes);
    setEdges(prev.edges);
    setScenario(prev.scenario);
    setLastFlowData(prev.flowData);
    setSimStack(s => s.slice(0, -1));
    sounds.click();

    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
  }, [simStack, setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep drillBackRef in sync
  drillBackRef.current = drillBack;

  // Go back to a specific level
  const drillBackToLevel = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= simStack.length) {
      // Going to level 0 (root) — restore from first stack entry
      if (simStack.length > 0) {
        const root = simStack[0];
        statsRef.current = { total: 0, success: 0, blocked: 0 };
        setSimStats({ total: 0, success: 0, blocked: 0 });
        stopSim();
        setShowDashboard(false);
        particlesRef.current = [];
        setParticles([]);

        setNodes(root.nodes);
        setEdges(root.edges);
        setScenario(root.scenario);
        setLastFlowData(root.flowData);
        setSimStack([]);
        sounds.click();
        setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
      }
      return;
    }

    // Restore to targetIndex+1 level
    const target = simStack[targetIndex + 1];
    if (!target) return;

    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([]);

    setNodes(target.nodes);
    setEdges(target.edges);
    setScenario(target.scenario);
    setLastFlowData(target.flowData);
    setSimStack(s => s.slice(0, targetIndex + 1));
    sounds.click();
    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
  }, [simStack, setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Double-click handler for drill-down
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: RFNode) => {
    if (simRunningRef.current || generating || drillLoading) return;
    drillIntoNode(node);
  }, [drillIntoNode, generating, drillLoading]);

  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: DEPTH_BG_COLORS[currentDepth] || DEPTH_BG_COLORS[0], transition: 'background 0.4s ease' }}>
      {/* ========== TOP BAR + SCENARIO BAR ========== */}
      <TopBar
        scenario={scenario}
        onScenarioChange={setScenario}
        hasNodes={hasNodes}
        generating={generating}
        onGenerate={generateFlow}
        onRestart={() => {
          // Instant reset: clear simulation state, keep the graph
          stopSim();
          statsRef.current = { total: 0, success: 0, blocked: 0 };
          setSimStats({ total: 0, success: 0, blocked: 0 });
          setShowDashboard(false);
          particlesRef.current = [];
          setParticles([]);
          setErrorMsg('');
          // Re-reveal all nodes and edges
          setNodes(prev => prev.map(n => ({ ...n, style: { ...n.style, opacity: 1 } })));
          setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
          setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
        }}
        onStop={() => abortRef.current?.abort()}
        onLoadTemplate={loadTemplate}
        photoPreview={photoPreview}
        onPhotoScenario={(s, preview) => {
          setScenario(s);
          if (preview) setPhotoPreview(preview);
          // Trigger generation after state update
          setTimeout(() => {
            const input = s.trim();
            if (!input) return;
            setGenerating(true);
            setErrorMsg('');
            fetch('/api/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ scenario: input, tags: contextTagsRef.current, profile: profileRef.current, sacredMode, fromPhoto: true }),
            })
              .then(res => { if (!res.ok) throw new Error('Server error'); return res.json(); })
              .then(flow => {
                if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');
                setLastFlowData(flow);
                statsRef.current = { total: 0, success: 0, blocked: 0 };
                setSimStats({ total: 0, success: 0, blocked: 0 });
                stopSim();
                setShowDashboard(false);
                particlesRef.current = [];
                setParticles([]);
                const tNodes = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'AI generated (photo)' }));
                const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges, preview ? { photoUrl: preview, scenario: s } : undefined, layoutDirection);
                setNodes(ln);
                setEdges(le);

                // Save to history
                const photoHistEntry: Omit<HistoryEntry, 'id' | 'timestamp'> = {
                  scenario: s,
                  tags: contextTagsRef.current ? { ...contextTagsRef.current } : undefined,
                  flowData: { nodes: flow.nodes, edges: flow.edges },
                };
                if (preview) {
                  createThumbnail(preview).then(thumb => {
                    saveToHistory({ ...photoHistEntry, photoThumbnail: thumb || undefined });
                  });
                } else {
                  saveToHistory(photoHistEntry);
                }

                setTimeout(() => {
                  fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
                  setTimeout(() => simulate(), 500);
                }, 100);
              })
              .catch(() => { setErrorMsg('Could not generate scenario from photo.'); toast.error('Could not generate scenario from photo.'); })
              .finally(() => setGenerating(false));
          }, 50);
        }}
        onAudioScenario={(text) => {
          setScenario(text);
          setTimeout(() => generateFlow(), 50);
        }}
        onTagsChange={(t) => { contextTagsRef.current = t; }}
        onProfileChange={(p) => { profileRef.current = p; }}
        onHistorySelect={handleHistorySelect}
        sacredMode={sacredMode}
        onSacredModeChange={(newMode) => {
          setSacredMode(newMode);
          // Pure UI toggle — reveal/hide sacred layer on existing nodes, no API call
          setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } })));
        }}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
        layoutDirection={layoutDirection}
        onLayoutDirectionChange={(dir) => {
          setLayoutDirection(dir);
          localStorage.setItem('sim-layout-direction', dir);
          // Re-layout existing graph with new direction
          const currentNodes = nodesRef.current;
          const currentEdges = edgesRef.current;
          if (currentNodes.length > 0) {
            // Update direction in node data + re-layout with dagre
            const updatedNodes = currentNodes.map(n => ({
              ...n,
              data: { ...(n.data as Record<string, unknown>), direction: dir },
            }));
            const { nodes: ln, edges: le } = getLayoutedElements(updatedNodes, currentEdges, dir);
            // For TB mode, edges should be smoothstep
            const styledEdges = le.map(e => ({
              ...e,
              type: dir === 'TB' ? 'smoothstep' : (e.type || 'animated'),
            }));
            setNodes(ln);
            setEdges(styledEdges);
            setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
          }
        }}
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          localStorage.setItem('sim-view-mode', mode);
        }}
        openHistoryTrigger={openHistoryTrigger}
        openProfileTrigger={openProfileTrigger}
      />

      {/* ========== ERROR MESSAGE ========== */}
      {errorMsg && (
        <div className="absolute top-[96px] left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] px-6 py-2.5 rounded-lg backdrop-blur-sm animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* ========== PROFILE WARNINGS ========== */}
      {!generating && profileWarnings.length > 0 && (
        <WarningBanner
          warnings={profileWarnings}
          onDismiss={(id) => setProfileWarnings(prev => prev.filter(w => w.id !== id))}
        />
      )}

      {/* ========== GENERATING OVERLAY ========== */}
      {generating && (
        <div className="absolute inset-0 top-[80px] z-30 flex items-center justify-center bg-[var(--background)]/70 backdrop-blur-[3px]">
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px 36px',
              boxShadow: 'var(--shadow-xl)',
              maxWidth: '480px',
              width: '90%',
            }}
          >
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '4px' }}>
                Building your simulation...
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                Analyzing scenario and sourcing real-world data
              </div>
            </div>
            <GeneratingSkeleton />
          </div>
        </div>
      )}

      {/* ========== EMPTY STATE ========== */}
      {!hasNodes && !generating && viewMode === '2d' && (
        <div className="absolute inset-0 top-[94px] z-20 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 sm:gap-6 w-full" style={{ maxWidth: 480 }}>
            {/* Compass icon */}
            <svg
              width="52" height="52" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: 'var(--border)' }}
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>

            {/* Title + subtitle */}
            <div className="flex flex-col items-center gap-2 text-center">
              <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                What do you want to simulate?
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                Type a scenario, upload a photo, or record your voice
              </div>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Open a cafe in Bali',
                'Go freelance on Upwork',
                'Move to Europe',
                'Launch a SaaS',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setScenario(suggestion);
                    setTimeout(() => generateFlow(), 50);
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--foreground)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface-hover)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--muted)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Crash Test shortcut */}
            <button
              onClick={() => setShowCrashTest(true)}
              style={{
                marginTop: 8,
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: '#ef4444',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.15)',
                cursor: 'pointer',
                fontFamily: 'Inter, system-ui',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)';
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Crash Test
            </button>
          </div>
        </div>
      )}

      {/* ========== DRILL-DOWN BREADCRUMB ========== */}
      {simStack.length > 0 && (
        <div
          className="relative z-40 flex items-center gap-1 px-4 py-2 overflow-x-auto"
          style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            scrollbarWidth: 'thin',
          }}
        >
          {/* Back button */}
          <button
            onClick={drillBack}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'transparent', border: '1px solid var(--border)',
              cursor: 'pointer', color: 'var(--muted)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
            title="Back (Backspace)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Root level */}
          <button
            onClick={() => drillBackToLevel(-1)}
            className="truncate"
            style={{
              fontSize: 11, fontWeight: 600, color: 'var(--muted)',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: 6, maxWidth: 180,
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
            title={simStack[0]?.scenario || 'Root'}
          >
            {simStack[0]?.scenario || 'Main'}
          </button>

          {/* Intermediate levels */}
          {simStack.slice(1).map((level, i) => (
            <div key={i} className="flex items-center gap-1 flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
              <button
                onClick={() => drillBackToLevel(i)}
                className="truncate"
                style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--muted)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '4px 8px', borderRadius: 6, maxWidth: 160,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--foreground)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)'; }}
                title={level.parentNodeLabel}
              >
                {level.parentNodeLabel}
              </button>
            </div>
          ))}

          {/* Current level label */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span
              className="truncate"
              style={{
                fontSize: 11, fontWeight: 700, color: 'var(--foreground)',
                padding: '4px 8px', maxWidth: 200,
              }}
            >
              {scenario}
            </span>
          </div>

          {/* Depth indicator */}
          <div
            style={{
              marginLeft: 'auto', flexShrink: 0,
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: 'var(--muted)',
              padding: '3px 8px', borderRadius: 4,
              background: 'var(--border)', opacity: 0.7,
            }}
          >
            Depth {currentDepth}/3
          </div>
        </div>
      )}

      {/* ========== DRILL-DOWN LOADING OVERLAY ========== */}
      {drillLoading && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '24px 32px',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
              Drilling into step...
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Generating sub-simulation
            </div>
            <div className="mt-3" style={{ width: 140, height: 2, background: 'var(--border)', borderRadius: 1, overflow: 'hidden', margin: '12px auto 0' }}>
              <div
                style={{
                  width: '60%', height: '100%',
                  background: 'var(--foreground)',
                  borderRadius: 1,
                  animation: 'drill-loading 1.5s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========== MAIN LAYOUT: Canvas + Results Panel ========== */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* ========== CANVAS: 2D (React Flow) or 3D (Force Graph) ========== */}
        {viewMode === '3d' ? (
          <div className="flex-1 relative">
            <Graph3DView nodes={nodes} edges={edges} layoutDirection={layoutDirection} />
          </div>
        ) : (
          <div className={`flex-1 relative ${replayMode && !simRunning ? 'cursor-crosshair' : ''}`} ref={flowContainerRef}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClickReplay}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              minZoom={0.3}
              maxZoom={2}
              defaultEdgeOptions={{
                type: 'default',
                style: { stroke: '#d4d4d4', strokeWidth: 2 },
              }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="var(--muted)" style={{ opacity: 0.5 }} />
              <Controls
                position="bottom-left"
                showInteractive={false}
                className="!border-[var(--border)] !rounded-lg !shadow-sm !overflow-hidden !mb-6 !ml-6"
              />
              <MiniMap
                position="bottom-right"
                pannable
                zoomable
                nodeColor={(node) => {
                  const t = (node.data as Record<string, unknown>).nodeType as string;
                  if (t === 'outcome-good') return '#34d399';
                  if (t === 'outcome-bad') return '#f87171';
                  return '#cbd5e1';
                }}
                maskColor="rgba(0,0,0,0.08)"
                style={{
                  opacity: 0.7,
                  width: 140,
                  height: 90,
                  marginBottom: 24,
                  marginRight: 24,
                }}
              />
            </ReactFlow>

            {/* ========== CUT LINE (replay mode) ========== */}
            {replayMode && <CutLineIndicator cutNodeId={cutNodeId} nodes={nodes} />}

            {/* ========== PARTICLE OVERLAY (inside React Flow viewport) ========== */}
            <ParticleLayer particles={particles} moveDuration={getSPD().move} pathFollowing={simSettings.pathFollowing} />
          </div>
        )}

        {/* ========== RESULTS PANEL (fixed right, always visible when results exist) ========== */}
        {showDashboard && (
          <Dashboard
            stats={statsRef.current}
            nodes={nodesRef.current}
            nodeUniqueReach={nodeReachRef.current}
            edges={edgesRef.current.map(e => ({ source: e.source, target: e.target, label: e.label as string | undefined }))}
            onClose={() => { setShowDashboard(false); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }}
            onReportOutcome={() => setShowFeedbackForm(true)}
          />
        )}

        {/* ========== FEEDBACK FORM MODAL ========== */}
        {showFeedbackForm && (
          <FeedbackForm
            scenario={scenario}
            predictedProb={statsRef.current.total > 0 ? Math.round(statsRef.current.success / statsRef.current.total * 100) : 0}
            onClose={() => setShowFeedbackForm(false)}
          />
        )}

        {/* ========== FEEDBACK REMINDER BANNER ========== */}
        {showFeedbackReminder && !simRunning && !showFeedbackForm && (
          <div
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-5 py-3 rounded-2xl"
            style={{
              background: 'var(--surface)',
              boxShadow: '0 0 0 1px var(--border), 0 8px 32px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(8px)',
              maxWidth: '440px',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <p className="text-[12px] leading-snug" style={{ color: 'var(--foreground)' }}>
              How did it go? Share your outcome to help calibrate predictions.
            </p>
            <button
              onClick={() => { setShowFeedbackReminder(false); setShowFeedbackForm(true); }}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer"
              style={{ background: 'var(--foreground)', color: 'var(--background)' }}
            >
              Report
            </button>
            <button
              onClick={() => setShowFeedbackReminder(false)}
              className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>
        )}

        {/* ========== REVERSE ENGINEERING PANEL ========== */}
        {reversePath && reversePath.length > 0 && (
          <div
            className="absolute top-[52px] left-4 z-30 overflow-y-auto"
            style={{
              maxHeight: 'calc(100vh - 160px)',
              width: 320,
              background: 'var(--surface)',
              borderRadius: 16,
              boxShadow: '0 0 0 1px var(--border), 0 8px 32px rgba(0,0,0,0.12)',
              scrollbarWidth: 'thin',
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-4 pt-4 pb-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)' }}>
                    <path d="M9 14L4 9l5-5" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>Reverse Engineer</span>
                </div>
                <button
                  onClick={clearReversePath}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--muted)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                Path to reach this outcome
              </div>
              <div className="mt-2 px-3 py-2" style={{
                background: reverseCompoundProb > 10 ? 'rgba(16,185,129,0.08)' : reverseCompoundProb > 3 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)',
                borderRadius: 8,
                border: `1px solid ${reverseCompoundProb > 10 ? 'rgba(16,185,129,0.2)' : reverseCompoundProb > 3 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`,
              }}>
                <span style={{
                  fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em',
                  color: reverseCompoundProb > 10 ? '#10b981' : reverseCompoundProb > 3 ? '#f59e0b' : '#ef4444',
                }}>{reverseCompoundProb}%</span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>compound probability</span>
              </div>
            </div>

            {/* Steps */}
            <div className="px-4 py-3">
              {reversePath.map((step, i) => {
                const isLast = i === reversePath.length - 1;
                const isOutcome = step.type.startsWith('outcome');
                const isGate = step.type === 'bottleneck' || step.type === 'gate' || step.type === 'decision';
                return (
                  <div key={step.id} className="relative">
                    {/* Connector line */}
                    {i > 0 && (
                      <div style={{
                        position: 'absolute', top: -12, left: 11, width: 1, height: 12,
                        background: 'var(--border)',
                      }} />
                    )}
                    {/* Edge label between steps */}
                    {step.edgeLabel && (
                      <div style={{
                        fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
                        color: step.edgeLabel.toLowerCase().startsWith('yes') || step.edgeLabel.toLowerCase().startsWith('pass') ? '#10b981' : step.edgeLabel.toLowerCase().startsWith('no') || step.edgeLabel.toLowerCase().startsWith('fail') ? '#ef4444' : '#f59e0b',
                        marginBottom: 4, marginLeft: 28, letterSpacing: '0.05em',
                      }}>
                        {step.edgeLabel}
                      </div>
                    )}
                    {/* Step card */}
                    <div className="flex items-start gap-3 mb-3">
                      {/* Step number / dot */}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700,
                        background: isOutcome
                          ? (step.type === 'outcome-good' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)')
                          : isGate ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.1)',
                        color: isOutcome
                          ? (step.type === 'outcome-good' ? '#10b981' : '#ef4444')
                          : isGate ? '#f59e0b' : 'var(--muted)',
                      }}>
                        {reversePath.length - i}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', marginBottom: 2 }}>
                          {step.type.replace('-', ' ')}
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.3 }}>
                          {step.label}
                        </div>
                        {isGate && step.prob < 100 && (
                          <div className="mt-1 flex items-center gap-2">
                            <div style={{ flex: 1, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${step.prob}%`, height: '100%', background: step.prob > 50 ? '#10b981' : step.prob > 25 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: step.prob > 50 ? '#10b981' : step.prob > 25 ? '#f59e0b' : '#ef4444' }}>
                              {step.prob}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Vertical line to next */}
                    {!isLast && (
                      <div style={{
                        marginLeft: 11, width: 1, height: 8,
                        background: 'var(--border)',
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========== DECISION PRUNING MODAL ========== */}
      {showPruning && (
        <DecisionPruning
          onComplete={handlePruningComplete}
          onSkip={handlePruningSkip}
          questions={apiPruningQuestions.length > 0 ? apiPruningQuestions : undefined}
        />
      )}

      {/* ========== CRASH TEST PANEL ========== */}
      {showCrashTest && (
        <CrashTestPanel
          currentScenario={scenario}
          profile={profileRef.current}
          sacredMode={sacredMode}
          onLoadScenario={(s: CrashTestScenario) => {
            if (!s.flowData) return;
            const { nodes: ln, edges: le } = templateToFlow(s.flowData.nodes, s.flowData.edges, undefined, layoutDirection);
            setNodes(ln);
            setEdges(le);
            setScenario(s.name);
            stopSim();
            setShowDashboard(false);
            particlesRef.current = [];
            setParticles([]);
            statsRef.current = { total: 0, success: 0, blocked: 0 };
            setSimStats({ total: 0, success: 0, blocked: 0 });
            undoPushState({ nodes: ln, edges: le });
            setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
          }}
          onClose={() => setShowCrashTest(false)}
        />
      )}

      {/* Multi-Agent Results */}
      {multiAgentResult && (
        <MultiAgentResults
          result={multiAgentResult}
          onClose={() => setMultiAgentResult(null)}
        />
      )}

      {/* ========== TOOLBARS (extracted components) ========== */}
      {hasNodes && !simRunning && (
        <IdleToolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => { const s = undo(); if (s) { setNodes(s.nodes); setEdges(s.edges); sounds.click(); } }}
          onRedo={() => { const s = redo(); if (s) { setNodes(s.nodes); setEdges(s.edges); sounds.click(); } }}
          replayMode={replayMode}
          cutNodeId={cutNodeId}
          hasStats={statsRef.current.total > 0}
          sacredMode={sacredMode}
          saving={saving}
          shareUrl={shareUrl}
          onSimulate={requestSimulate}
          onSimulateFromCut={simulateFromCut}
          onRestart={() => { stopSim(); setTimeout(() => requestSimulate(), 200); }}
          onEnterStepMode={enterStepMode}
          onSimulateReverse={simulateReverse}
          onToggleReplayMode={() => replayMode ? exitReplayMode() : setReplayMode(true)}
          onToggleSacredMode={() => {
            const newMode = !sacredMode;
            setSacredMode(newMode);
            // Pure UI toggle — reveal/hide sacred layer, no API call
            setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } })));
          }}
          onBacktest={() => {
            fetch('/api/backtest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sample_size: 20 }) })
              .then(r => r.json())
              .then(d => { if (d.message) alert(d.message + ' — check progress at /api/backtest'); })
              .catch(() => alert('Backtest failed to start'));
          }}
          onCrashTest={() => setShowCrashTest(true)}
          onMultiAgent={handleMultiAgent}
          multiAgentRunning={multiAgentRunning}
          simSettings={simSettings}
          onSimSettingsChange={setSimSettings}
          onSave={handleSave}
          onShare={handleShare}
          onExportPNG={handleExportPNG}
          onClear={() => { stopSim(); setNodes([]); setEdges([]); setShowDashboard(false); setScenario(''); setErrorMsg(''); }}
          viewMode={viewMode}
        />
      )}

      {simRunning && viewMode === '2d' && (
        <RunningToolbar
          simPaused={simPaused}
          onTogglePause={togglePause}
          onStop={stopSim}
        />
      )}

      {simRunning && viewMode === '2d' && (
        <StatsBar
          speedLevel={speedLevel}
          currentWave={currentWave}
          totalWaves={replayOverrideRef.current?.waves ?? SPD_BASE.waves}
          simStats={simStats}
          successRate={successRate}
          simPaused={simPaused}
          onSpeedChange={(v) => { setSpeedLevel(v); speedRef.current = v; }}
          youOutcome={youOutcome}
          launchMode={simSettings.launchMode}
        />
      )}

      {replayMode && !simRunning && viewMode === '2d' && (
        <ReplayBar
          cutNodeId={cutNodeId}
          cutNodeLabel={nodesRef.current.find(n => n.id === cutNodeId)?.data?.label as string || 'node'}
          cutReachCount={cutReachCountRef.current}
          simRunning={simRunning}
          onSimulateFromCut={simulateFromCut}
          onExitReplayMode={exitReplayMode}
        />
      )}

      {stepMode && viewMode === '2d' && (
        <StepModeBar
          stepIndex={stepIndex}
          totalSteps={stepOrderRef.current.length}
          onStepBack={stepBack}
          onStepForward={stepForward}
          onExitStepMode={exitStepMode}
        />
      )}

      {!simRunning && statsRef.current.total > 0 && !showDashboard && !stepMode && viewMode === '2d' && (
        <>
          <ResultsTab onShowDashboard={() => { setShowDashboard(true); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }} />
          <PathFilterBar pathFilter={pathFilter} onFilterChange={applyPathFilter} />
          {/* YOU outcome badge — post-simulation */}
          {youOutcome && (
            <div
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50"
              style={{
                background: 'var(--surface)',
                boxShadow: '0 0 0 1px rgba(251,191,36,0.4), 0 4px 20px rgba(251,191,36,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#fbbf24',
                boxShadow: '0 0 8px rgba(251,191,36,0.6)',
              }} />
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#fbbf24',
                fontFamily: 'var(--font-geist-mono)',
                letterSpacing: '0.05em',
              }}>
                YOU
              </span>
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--muted)',
              }}>
                reached:
              </span>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: youOutcome.outcome === 'success' ? '#059669' : '#dc2626',
                fontFamily: 'var(--font-geist-mono)',
              }}>
                {youOutcome.nodeLabel}
              </span>
              {youOutcome.outcome === 'success' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {youOutcome.outcome === 'blocked' && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              )}
              {profileRef.current?.sacredProfile && Object.keys(profileRef.current.sacredProfile).length > 0 && storedFatesRef.current.length > 0 && (
                <button
                  onClick={() => setShowAvatarReport(true)}
                  className="ml-2 text-[11px] font-medium px-3 py-1 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: 'rgba(99,102,241,0.1)',
                    color: '#6366f1',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.2)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)'; }}
                >
                  Personal Report
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* ========== PERSONAL REPORT OVERLAY ========== */}
      {showAvatarReport && storedFatesRef.current.length > 0 && profileRef.current?.sacredProfile && (
        <AvatarReport
          fates={storedFatesRef.current}
          nodes={nodesRef.current}
          edges={edgesRef.current}
          sacredProfile={profileRef.current.sacredProfile}
          onClose={() => setShowAvatarReport(false)}
        />
      )}

      {/* ========== COMMAND PALETTE (Cmd+K) ========== */}
      <CommandPalette
        open={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onLoadTemplate={(key) => loadTemplate(key)}
        onGenerate={generateFlow}
        onOpenHistory={() => setOpenHistoryTrigger((v) => v + 1)}
        onOpenProfile={() => setOpenProfileTrigger((v) => v + 1)}
        onToggleSacredMode={() => {
          const newMode = !sacredMode;
          setSacredMode(newMode);
          setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } })));
        }}
        sacredMode={sacredMode}
      />

      {/* ========== TOAST NOTIFICATIONS ========== */}
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
