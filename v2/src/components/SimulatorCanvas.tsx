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
  useViewport,
  ReactFlowProvider,
  type Node as RFNode,
  type Edge as RFEdge,
} from '@xyflow/react';
import dagre from 'dagre';

import SimNodeComponent from './nodes/SimNode';
import ContextNodeComponent from './nodes/ContextNode';
import AnimatedEdgeComponent from './edges/AnimatedEdge';
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import Spinner from './ui/Spinner';
import { createPersonSVG, type ParticleData } from './Particle';
import { TEMPLATES, TEMPLATE_KEYWORDS, type TemplateNode, type TemplateEdge } from '@/lib/templates';
import type { ContextTags } from '@/lib/context-tags';
import { saveToHistory, createThumbnail, type HistoryEntry } from '@/lib/history';
import { SimulatorDataflow } from '@/lib/dataflow-engine';
import { applyRealProbabilities } from '@/lib/probability-matcher';

const nodeTypes = { simNode: SimNodeComponent, contextNode: ContextNodeComponent };
const edgeTypes = { animated: AnimatedEdgeComponent };

// Cut line indicator — vertical dashed line with scissors icon
function CutLineIndicator({ cutNodeId, nodes }: { cutNodeId: string | null; nodes: RFNode[] }) {
  const { x, y, zoom } = useViewport();
  if (!cutNodeId) return null;
  const node = nodes.find(n => n.id === cutNodeId);
  if (!node) return null;

  const lineX = node.position.x + 170 + 16;
  const nodeY = node.position.y + 50;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[20]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '0 0' }}
    >
      <div
        style={{
          position: 'absolute',
          left: lineX,
          top: -3000,
          width: 2,
          height: 8000,
          background: 'repeating-linear-gradient(to bottom, #ef4444 0, #ef4444 8px, transparent 8px, transparent 16px)',
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: lineX - 10,
          top: nodeY - 10,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      </div>
    </div>
  );
}

// Particle layer that moves WITH the React Flow viewport (zoom/pan aware)
function ParticleLayer({ particles, moveDuration }: { particles: ParticleData[]; moveDuration: number }) {
  const { x, y, zoom } = useViewport();
  if (particles.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[25]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '0 0' }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className={`particle ${p.status === 'blocked' ? 'particle-blocked' : p.status === 'failing' ? 'particle-failing' : p.status === 'success' ? 'particle-success' : ''}`}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            transition: `left ${moveDuration}ms cubic-bezier(0.4, 0, 0.2, 1), top ${moveDuration}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease`,
          }}
          dangerouslySetInnerHTML={{ __html: p.svg }}
        />
      ))}
    </div>
  );
}

// Dagre layout
function getLayoutedElements(
  nodes: RFNode[],
  edges: RFEdge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: RFNode[]; edges: RFEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 120, ranksep: 300, edgesep: 60 });

  nodes.forEach((node) => {
    const isContext = node.type === 'contextNode';
    g.setNode(node.id, { width: isContext ? 240 : 220, height: isContext ? 200 : 110 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 85,
        y: nodeWithPosition.y - 50,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Convert template data to React Flow format
function templateToFlow(
  templateNodes: TemplateNode[],
  templateEdges: TemplateEdge[],
  context?: { photoUrl?: string; scenario?: string }
) {
  const rfNodes: RFNode[] = templateNodes.map((n) => ({
    id: String(n.id),
    type: 'simNode',
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      nodeType: n.type,
      desc: n.desc,
      source: n.source,
      prob: n.prob,
      time: n.time,
    },
  }));

  const rfEdges: RFEdge[] = templateEdges.map((e, i) => {
    const isPass = e.label === 'pass' || e.label === 'yes';
    const isFail = e.label === 'fail' || e.label === 'no';
    return {
      id: `e-${e.from}-${e.to}-${i}`,
      source: String(e.from),
      target: String(e.to),
      label: e.label || '',
      type: 'animated',
      style: {
        stroke: isFail ? '#fca5a5' : isPass ? '#4ade80' : '#d4d4d8',
        strokeWidth: isPass ? 4.5 : isFail ? 1.5 : 1.5,
      },
      labelStyle: {
        fill: isFail ? '#ef4444' : isPass ? '#10b981' : '#a1a1aa',
      },
    };
  });

  // Add context node (photo + scenario) if provided
  if (context?.photoUrl || context?.scenario) {
    const contextId = 'ctx-0';
    rfNodes.unshift({
      id: contextId,
      type: 'contextNode',
      position: { x: 0, y: 0 },
      data: {
        photoUrl: context.photoUrl,
        scenario: context.scenario || '',
      },
    });
    // Connect context node to all start nodes (nodes with no incoming edges)
    const hasIncoming = new Set(rfEdges.map(e => e.target));
    const startIds = rfNodes.filter(n => n.id !== contextId && !hasIncoming.has(n.id)).map(n => n.id);
    for (const sid of startIds) {
      rfEdges.unshift({
        id: `e-ctx-${sid}`,
        source: contextId,
        target: sid,
        type: 'animated',
        style: { stroke: '#d4d4d8', strokeWidth: 1.5 },
      });
    }
  }

  return getLayoutedElements(rfNodes, rfEdges);
}

// Simulation speed config — base values, scaled by speedMultiplier
const SPD_BASE = { move: 2000, wait: 2500, launch: 300, wavePause: 2000, waves: 10, perWave: 10 };
// Speed levels: 0=1x, 1=1.5x, 2=2x, 3=3x, 4=5x, 5=8x
const SPEED_LEVELS = [1, 1.5, 2, 3, 5, 8];
const SPEED_LABELS = ['1x', '1.5x', '2x', '3x', '5x', '8x'];

function SimulatorCanvasInner({ sharedSimulation }: { sharedSimulation?: Record<string, unknown> | null }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const { fitView, flowToScreenPosition } = useReactFlow();

  const [scenario, setScenario] = useState('');
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const contextTagsRef = useRef<ContextTags>({});
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simStats, setSimStats] = useState({ total: 0, success: 0, blocked: 0 });
  const [showDashboard, setShowDashboard] = useState(false);
  const [sacredMode, setSacredMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [lastFlowData, setLastFlowData] = useState<Record<string, unknown> | null>(null);

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

  // Load shared simulation if provided
  useEffect(() => {
    if (!sharedSimulation?.flow) return;
    const flow = sharedSimulation.flow as Record<string, unknown>;
    if (!flow.nodes || !flow.edges) return;
    setScenario((sharedSimulation.scenario as string) || '');
    setLastFlowData(flow);
    const tNodes = (flow.nodes as TemplateNode[]).map(n => ({ ...n, source: n.source || 'Shared' }));
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[]);
    setNodes(ln);
    setEdges(le);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 200);
  }, [sharedSimulation]);
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
  const onNodeClickReplay = useCallback((_event: React.MouseEvent, node: RFNode) => {
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
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([]);
    setScenario(t.input);
    // Apply real probabilities from verified data (Layer 2 overrides AI estimates)
    const enrichedNodes = applyRealProbabilities(t.nodes) as typeof t.nodes;
    const { nodes: ln, edges: le } = templateToFlow(enrichedNodes, t.edges);
    setNodes(ln);
    setEdges(le);
    setErrorMsg('');

    // Build dataflow graph and compute initial values
    dataflowRef.current.buildFromTemplate(t.nodes, t.edges).then(async () => {
      const values = await dataflowRef.current.computeAll();
      nodeValuesRef.current = values;
      setNodeValues(values);
      // Update nodes with computed values + slider handlers
      setNodes(prev => prev.map(n => {
        const nt = (n.data as Record<string, unknown>).nodeType as string;
        const isInteractive = nt === 'start' || nt === 'bottleneck' || nt === 'decision';
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
      fitView({ padding: 0.2, duration: 400 });
      if (autoSim) setTimeout(() => simulate(), 500);
    }, 100);
  }, [setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Generate from AI
  const generateFlow = useCallback(async () => {
    const input = scenario.trim();
    if (!input) {
      // input is in TopBar now
      return;
    }
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
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: input, tags: contextTagsRef.current }),
      });
      if (!res.ok) throw new Error('Server error');
      const flow = await res.json();
      if (!flow.nodes || !flow.edges) throw new Error('Invalid flow');
      setLastFlowData(flow);

      statsRef.current = { total: 0, success: 0, blocked: 0 };
      setSimStats({ total: 0, success: 0, blocked: 0 });
      stopSim();
      setShowDashboard(false);
      particlesRef.current = [];
      setParticles([]);
      const tNodes: TemplateNode[] = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'AI generated' }));
      const ctx = photoPreview ? { photoUrl: photoPreview, scenario: input } : undefined;
      const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges, ctx);
      setNodes(ln);
      setEdges(le);

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
        fitView({ padding: 0.15, duration: 400 });
        // Auto-start simulation after generate
        setTimeout(() => simulate(), 500);
      }, 100);
    } catch {
      if (best && bestScore >= 2) {
        loadTemplate(best, true);
      } else {
        setErrorMsg('Could not generate scenario. Check your internet connection or pick a template.');
      }
    } finally {
      setGenerating(false);
    }
  }, [scenario, loadTemplate, setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const moveTo = useCallback((particle: ParticleData, nodeId: string, cb: (r: 'success' | 'blocked') => void) => {
    if (!simRunningRef.current) return;

    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) { cb('blocked'); return; }

    // Reveal this node when particle arrives
    revealNode(nodeId);

    // Track unique reach
    if (!nodeReachRef.current[nodeId]) nodeReachRef.current[nodeId] = new Set();
    nodeReachRef.current[nodeId].add(particle.personId);
    particle.visitedNodes.add(nodeId);

    // Move particle to node position (canvas coordinates)
    const tx = node.position.x + 85 - 12;
    const ty = node.position.y + 50 - 16;
    particle.x = tx;
    particle.y = ty;
    updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: tx, y: ty } : p));

    // Signal propagation: particle carries a delta value that modifies the node
    const signalDelta = particle.signalDelta ?? 0.33;
    propagateSignal(nodeId, signalDelta);

    const spd = getSPD();
    simTimeout(() => {
      if (!simRunningRef.current) return;
      const data = node.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      const prob = data.prob as number;

      // Handle bottleneck/decision
      if (nodeType === 'bottleneck' || nodeType === 'decision') {
        const pass = Math.random() * 100 < prob;
        const out = edgesRef.current.filter(e => e.source === nodeId);
        const passE = out.find(e => e.label === 'pass' || e.label === 'yes');
        const failE = out.find(e => e.label === 'fail' || e.label === 'no');
        let next: RFEdge | undefined;
        if (pass && passE) next = passE;
        else if (!pass && failE) next = failE;
        else next = out[pass ? 0 : (out.length > 1 ? 1 : 0)];
        if (next) {
          moveTo(particle, next.target, cb);
          return;
        }
      }

      // Follow edges
      const out = edgesRef.current.filter(e => e.source === nodeId);
      if (out.length === 0) {
        const isSuccess = nodeType === 'outcome-good';
        // Scatter around terminal node
        const ox = (Math.random() - 0.5) * 60;
        const oy = (Math.random() - 0.5) * 40;
        if (isSuccess) {
          particle.status = 'success';
          updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + ox, y: p.y + oy, status: 'success' } : p));
        } else {
          // Trigger falling animation — they stay on the ground
          particle.status = 'failing';
          updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + ox, y: p.y + oy, status: 'failing' } : p));
        }
        finishedCountRef.current++;
        cb(isSuccess ? 'success' : 'blocked');
        return;
      }

      // Apply edge strength to signal delta
      const nextE = out.length > 1 && nodeType !== 'bottleneck' && nodeType !== 'decision'
        ? out[Math.floor(Math.random() * out.length)]
        : out[0];
      const edgeStrength = (nextE.data as Record<string, unknown>)?.strength as number ?? 1;
      particle.signalDelta = (particle.signalDelta ?? 0.33) * edgeStrength;
      moveTo(particle, nextE.target, cb);
    }, spd.wait);
  }, [simTimeout, updateParticles, revealNode, propagateSignal, getSPD]);

  const launchPerson = useCallback((startNodeId: string) => {
    const pid = ++personIdRef.current;
    const pId = ++particleIdRef.current;
    const startNode = nodesRef.current.find(n => n.id === startNodeId);
    if (!startNode) return;

    const particle: ParticleData = {
      id: pId,
      personId: pid,
      x: startNode.position.x + 85 - 12,
      y: startNode.position.y + 50 - 16,
      svg: createPersonSVG(),
      status: 'moving',
      visitedNodes: new Set(),
    };

    updateParticles(prev => [...prev, particle]);

    moveTo(particle, startNodeId, (result) => {
      if (result === 'success') statsRef.current.success++;
      else statsRef.current.blocked++;
      setSimStats({ ...statsRef.current });
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
        const startId = startNodeIds[Math.floor(Math.random() * startNodeIds.length)];
        launchPerson(startId);
      }, i * spd.launch);
    }

    simTimeout(() => launchWave(waveNum + 1, startNodeIds), spd.perWave * spd.launch + spd.wavePause);
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

  const simulate = useCallback(() => {
    if (simRunningRef.current || nodesRef.current.length === 0) return;

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

    // Reset node signal values
    nodeValuesRef.current = {};
    setNodeValues({});

    // Hide all nodes and edges for sequential reveal (keep context node visible)
    revealedNodesRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.type === 'contextNode' ? 1 : 0,
        transition: 'opacity 0.5s ease',
      },
    })));
    // Pre-reveal context node
    const ctxNode = nodesRef.current.find(n => n.type === 'contextNode');
    if (ctxNode) revealedNodesRef.current.add(ctxNode.id);
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

    // Find start nodes (no incoming edges)
    const hasIncoming = new Set(edgesRef.current.map(e => e.target));
    const startNodeIds = nodesRef.current.filter(n => !hasIncoming.has(n.id)).map(n => n.id);
    if (startNodeIds.length === 0) { stopSim(); return; }

    launchWave(0, startNodeIds);
  }, [launchWave, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line react-hooks/exhaustive-deps
  function stopSim() {
    simRunningRef.current = false;
    simPausedRef.current = false;
    setSimRunning(false);
    setSimPaused(false);
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];

    // Restore original edges FIRST if we were in reverse mode
    // This must happen before setEdges so React Flow gets the correct edges
    if (originalEdgesRef.current) {
      const origEdges = originalEdgesRef.current;
      edgesRef.current = origEdges;
      originalEdgesRef.current = null;
      // Set React Flow edges to the original (un-reversed) edges, all visible
      setEdges(origEdges.map(e => ({ ...e, hidden: false })));
    } else {
      setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
    }

    // Reveal all nodes when simulation ends + clear cut point
    revealedNodesRef.current = new Set();
    setCutNodeId(null);
    cutDownstreamRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
      data: { ...n.data, isCutPoint: false },
      style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' },
    })));

    // Keep particles in their final positions — don't clear them
    // They only get cleared on new simulation or clear button

    // Reset stats refs for clean state
    waveRef.current = 0;
    setCurrentWave(0);
    finishedCountRef.current = 0;

    if (statsRef.current.total > 0) {
      setTimeout(() => setShowDashboard(true), 500);
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

      // Enter in input = generate
      if (e.key === 'Enter' && !e.shiftKey && isInput && scenario.trim()) {
        e.preventDefault();
        generateFlow();
        return;
      }

      // Space = start sim, or pause/resume if already running
      if (e.key === ' ' && !isInput) {
        e.preventDefault();
        if (simRunningRef.current) {
          togglePause();
        } else if (nodesRef.current.length > 0) {
          simulate();
        }
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [scenario, generateFlow, simulate]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasNodes = nodes.length > 0;
  const successRate = simStats.total > 0 ? Math.round(simStats.success / simStats.total * 100) : 0;

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
      }
    } catch { /* silent */ }
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
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[], ctx);
    setNodes(ln);
    setEdges(le);

    setTimeout(() => {
      fitView({ padding: 0.15, duration: 400 });
      setTimeout(() => simulate(), 500);
    }, 100);
  }, [setNodes, setEdges, fitView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--background)]">
      {/* ========== TOP BAR + SCENARIO BAR ========== */}
      <TopBar
        scenario={scenario}
        onScenarioChange={setScenario}
        hasNodes={hasNodes}
        generating={generating}
        onGenerate={generateFlow}
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
              body: JSON.stringify({ scenario: input, tags: contextTagsRef.current }),
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
                const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges, preview ? { photoUrl: preview, scenario: s } : undefined);
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
                  fitView({ padding: 0.15, duration: 400 });
                  setTimeout(() => simulate(), 500);
                }, 100);
              })
              .catch(() => setErrorMsg('Could not generate scenario from photo.'))
              .finally(() => setGenerating(false));
          }, 50);
        }}
        onTagsChange={(t) => { contextTagsRef.current = t; }}
        onHistorySelect={handleHistorySelect}
      />

      {/* ========== ERROR MESSAGE ========== */}
      {errorMsg && (
        <div className="absolute top-[96px] left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] px-6 py-2.5 rounded-lg backdrop-blur-sm animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* ========== GENERATING OVERLAY ========== */}
      {generating && (
        <div className="absolute inset-0 top-[80px] z-30 flex items-center justify-center bg-[var(--background)]/60 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-lg text-[var(--accent)]">
              <Spinner size={20} />
            </div>
            <div className="text-[12px] text-[var(--muted)] font-medium">Analyzing scenario...</div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500/40"
                  style={{
                    animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== EMPTY STATE ========== */}
      {!hasNodes && !generating && (
        <div className="absolute inset-0 top-[94px] z-20 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l2.5 1.5" />
            </svg>
            <div className="text-[12px] text-[var(--muted)] text-center leading-relaxed">
              Type a scenario above or pick a template to begin
            </div>
          </div>
        </div>
      )}

      {/* ========== MAIN LAYOUT: Canvas + Results Panel ========== */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* ========== REACT FLOW CANVAS ========== */}
        <div className={`flex-1 relative ${replayMode && !simRunning ? 'cursor-crosshair' : ''}`} ref={flowContainerRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClickReplay}
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
          <ParticleLayer particles={particles} moveDuration={getSPD().move} />
        </div>

        {/* ========== RESULTS PANEL (fixed right, always visible when results exist) ========== */}
        {showDashboard && (
          <Dashboard
            stats={statsRef.current}
            nodes={nodesRef.current}
            nodeUniqueReach={nodeReachRef.current}
            edges={edgesRef.current.map(e => ({ source: e.source, target: e.target, label: e.label as string | undefined }))}
            onClose={() => setShowDashboard(false)}
          />
        )}
      </div>

      {/* ========== FLOATING TOOLBAR (when nodes exist, sim not running) ========== */}
      {hasNodes && !simRunning && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className="rounded-full px-3 py-2 flex items-center gap-2"
            style={{
              background: 'var(--surface)',
              boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            {/* Simulate */}
            {replayMode && cutNodeId ? (
              <button onClick={simulateFromCut} className="toolbar-btn toolbar-btn--primary" title="Replay from cut">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            ) : (
              <button onClick={simulate} disabled={replayMode} className="toolbar-btn toolbar-btn--primary" title="Simulate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </button>
            )}

            {/* Reverse */}
            <button onClick={simulateReverse} disabled={replayMode} className="toolbar-btn" title="Reverse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
              </svg>
            </button>

            {/* Scissors / Replay mode */}
            <button
              onClick={() => replayMode ? exitReplayMode() : setReplayMode(true)}
              className={`toolbar-btn ${replayMode ? 'toolbar-btn--active' : ''}`}
              title={replayMode ? 'Exit replay mode' : 'Replay mode'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                <line x1="8.12" y1="8.12" x2="12" y2="12"/>
              </svg>
            </button>

            <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

            {/* Sacred mode */}
            <button
              onClick={() => {
                const newMode = !sacredMode;
                setSacredMode(newMode);
                setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } })));
              }}
              className={`toolbar-btn ${sacredMode ? 'toolbar-btn--active' : ''}`}
              title={sacredMode ? 'Data view' : 'Sacred view'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </button>

            {/* Save */}
            <button onClick={handleSave} disabled={saving} className="toolbar-btn" title="Save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
              </svg>
            </button>

            {/* Share */}
            <button onClick={handleShare} className="toolbar-btn" title={shareUrl ? 'Copied!' : 'Share'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={shareUrl ? 'var(--accent)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>

            {/* Export */}
            <button onClick={handleExportPNG} className="toolbar-btn" title="Export PNG">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>

            <div className="w-px h-5 bg-[var(--border)] mx-0.5" />

            {/* Clear */}
            <button onClick={() => { stopSim(); setNodes([]); setEdges([]); setShowDashboard(false); setScenario(''); setErrorMsg(''); }} className="toolbar-btn" title="Clear">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ========== FLOATING TOOLBAR (during simulation) ========== */}
      {simRunning && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div
            className="rounded-full px-3 py-2 flex items-center gap-2"
            style={{
              background: 'var(--surface)',
              boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            <button onClick={togglePause} className="toolbar-btn toolbar-btn--primary" title={simPaused ? 'Resume' : 'Pause'}>
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
            <button onClick={stopSim} className="toolbar-btn toolbar-btn--danger" title="Stop">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ========== STATS BAR (during simulation) ========== */}
      {simRunning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div
            className="rounded-full px-6 py-2 flex items-center gap-3"
            style={{
              background: 'var(--surface)',
              boxShadow: '0 0 0 1px var(--border), 0 4px 16px rgba(0,0,0,0.08)',
            }}
          >
            {/* Speed control */}
            <div className="flex items-center gap-2 px-2.5 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <input
                type="range"
                min={0}
                max={SPEED_LEVELS.length - 1}
                step={1}
                value={speedLevel}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setSpeedLevel(v);
                  speedRef.current = v;
                }}
                className="w-16 h-1 appearance-none rounded-full cursor-pointer"
                style={{ accentColor: 'var(--accent)', background: 'var(--border)' }}
              />
              <span className="text-[10px] font-semibold tabular-nums w-6 text-center" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{SPEED_LABELS[speedLevel]}</span>
            </div>

            <div className="w-px h-4" style={{ background: 'var(--border)' }} />

            {/* Wave progress */}
            <div className="flex items-center gap-2.5 px-2.5 py-1.5">
              <div className="flex gap-[3px]">
                {Array.from({ length: replayOverrideRef.current?.waves ?? SPD_BASE.waves }, (_, i) => (
                  <div
                    key={i}
                    className="w-[5px] h-[12px] rounded-[2px] transition-all duration-300"
                    style={{
                      background: i < currentWave ? 'var(--accent)' : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>{currentWave}/{replayOverrideRef.current?.waves ?? SPD_BASE.waves}</span>
            </div>

            <div className="w-px h-4" style={{ background: 'var(--border)' }} />

            {/* Metrics */}
            <div className="flex items-center gap-3 px-2.5 py-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-[5px] h-[5px] rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>{simStats.total}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[5px] h-[5px] rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-600 tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{simStats.success}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[5px] h-[5px] rounded-full bg-red-500" />
                <span className="text-[11px] font-semibold text-red-500 tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>{simStats.blocked}</span>
              </div>
            </div>

            {/* Rate pill */}
            <div
              className="px-2 py-1 rounded-full text-[10px] font-semibold tabular-nums"
              style={{
                background: successRate >= 50 ? 'rgba(16, 185, 129, 0.1)' : successRate >= 25 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: successRate >= 50 ? '#059669' : successRate >= 25 ? '#d97706' : '#dc2626',
                fontFamily: 'var(--font-geist-mono)',
              }}
            >
              {successRate}%
            </div>

            {/* Status */}
            {simPaused ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] text-amber-600 font-semibold uppercase tracking-wider" style={{ fontFamily: 'var(--font-geist-mono)' }}>Paused</span>
              </div>
            ) : (
              <kbd className="text-[9px] px-2 py-0.5 rounded-md" style={{ color: 'var(--muted)', background: 'var(--surface-hover)', fontFamily: 'var(--font-geist-mono)' }}>space</kbd>
            )}
          </div>
        </div>
      )}

      {/* ========== REPLAY MODE BAR (when replay active, sim not running) ========== */}
      {replayMode && !simRunning && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
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
                  Cut at <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{nodesRef.current.find(n => n.id === cutNodeId)?.data?.label as string || 'node'}</span>
                  {cutReachCountRef.current > 0 && (
                    <span style={{ color: 'var(--accent)' }} className="ml-1">({cutReachCountRef.current} people)</span>
                  )}
                </span>
                <div className="w-px h-4" style={{ background: 'var(--border)' }} />
                <button
                  onClick={simulateFromCut}
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
              onClick={exitReplayMode}
              className="flex items-center justify-center w-6 h-6 rounded-full transition-colors cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ========== RESULTS TAB (right edge, shows when dashboard is closed) ========== */}
      {!simRunning && statsRef.current.total > 0 && !showDashboard && (
        <button
          onClick={() => setShowDashboard(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 bg-white dark:bg-[#1a1a1a] border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg px-2 py-4 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer group"
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
      )}

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
