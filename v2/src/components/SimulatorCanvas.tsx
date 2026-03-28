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
import TopBar from './TopBar';
import Dashboard from './Dashboard';
import Spinner from './ui/Spinner';
import { createPersonSVG, type ParticleData } from './Particle';
import { TEMPLATES, TEMPLATE_KEYWORDS, type TemplateNode, type TemplateEdge } from '@/lib/templates';
import { SimulatorDataflow } from '@/lib/dataflow-engine';
import { applyRealProbabilities } from '@/lib/probability-matcher';

const nodeTypes = { simNode: SimNodeComponent };

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
          className={`particle ${p.status === 'blocked' ? 'particle-blocked' : p.status === 'success' ? 'particle-success' : ''}`}
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
  g.setGraph({ rankdir: direction, nodesep: 80, ranksep: 220, edgesep: 40 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 170, height: 100 });
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
function templateToFlow(templateNodes: TemplateNode[], templateEdges: TemplateEdge[]) {
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

  const rfEdges: RFEdge[] = templateEdges.map((e, i) => ({
    id: `e-${e.from}-${e.to}-${i}`,
    source: String(e.from),
    target: String(e.to),
    label: e.label || '',
    type: 'default',
    animated: false,
    style: {
      stroke: e.label === 'fail' || e.label === 'no' ? '#fca5a5' : e.label === 'pass' || e.label === 'yes' ? '#86efac' : '#d4d4d4',
      strokeWidth: 2,
    },
    labelStyle: {
      fill: e.label === 'fail' || e.label === 'no' ? '#ef4444' : e.label === 'pass' || e.label === 'yes' ? '#22c55e' : '#aaa',
      fontSize: 10,
      fontWeight: 600,
    },
  }));

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
      if (done >= statsRef.current.total && waveRef.current >= SPD_BASE.waves) {
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

  // Load a template
  const loadTemplate = useCallback((key: string, autoSim = false) => {
    const t = TEMPLATES[key];
    if (!t) return;
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
        body: JSON.stringify({ scenario: input }),
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
      const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges);
      setNodes(ln);
      setEdges(le);
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 400 });
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
        particle.status = isSuccess ? 'success' : 'blocked';
        // Scatter around terminal node
        const ox = (Math.random() - 0.5) * 60;
        const oy = (Math.random() - 0.5) * 40;
        updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + ox, y: p.y + oy, status: particle.status } : p));
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
    if (waveNum >= spd.waves || !simRunningRef.current) {
      // All waves done — check if we should auto-show dashboard
      if (waveNum >= spd.waves) {
        simTimeout(() => {
          if (simRunningRef.current) {
            stopSim();
          }
        }, spd.move + spd.wait * 3); // Wait for last particles to finish
      }
      return;
    }

    waveRef.current = waveNum;
    setCurrentWave(waveNum + 1);

    for (let i = 0; i < spd.perWave; i++) {
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

    // Hide all nodes and edges for sequential reveal
    revealedNodesRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: 0, transition: 'opacity 0.5s ease' },
    })));
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

    // Reveal all nodes when simulation ends
    revealedNodesRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
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

      // Space = pause/resume (only when not in input)
      if (e.key === ' ' && !isInput && simRunningRef.current) {
        e.preventDefault();
        togglePause();
        return;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [scenario, generateFlow]);

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

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--background)]">
      {/* ========== TOP BAR + SCENARIO BAR ========== */}
      <TopBar
        scenario={scenario}
        onScenarioChange={setScenario}
        hasNodes={hasNodes}
        simRunning={simRunning}
        simPaused={simPaused}
        generating={generating}
        sacredMode={sacredMode}
        onGenerate={generateFlow}
        onLoadTemplate={loadTemplate}
        onSimulate={simulate}
        onSimulateReverse={simulateReverse}
        onTogglePause={togglePause}
        onStop={stopSim}
        onClear={() => { stopSim(); setNodes([]); setEdges([]); setShowDashboard(false); setScenario(''); setErrorMsg(''); }}
        onSave={handleSave}
        onShare={handleShare}
        onExportPNG={handleExportPNG}
        saving={saving}
        shareUrl={shareUrl}
        onToggleSacredMode={() => {
          const newMode = !sacredMode;
          setSacredMode(newMode);
          // Update all nodes with sacred mode flag
          setNodes(prev => prev.map(n => ({
            ...n,
            data: { ...n.data, sacredMode: newMode },
          })));
        }}
      />

      {/* ========== ERROR MESSAGE ========== */}
      {errorMsg && (
        <div className="absolute top-[56px] left-1/2 -translate-x-1/2 z-50 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] px-4 py-2 rounded-lg backdrop-blur-sm animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* ========== GENERATING OVERLAY ========== */}
      {generating && (
        <div className="absolute inset-0 top-[56px] z-30 flex items-center justify-center bg-[var(--background)]/60 backdrop-blur-[2px]">
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
        <div className="flex-1 relative" ref={flowContainerRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'default',
              style: { stroke: '#d4d4d4', strokeWidth: 2 },
            }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="var(--muted)" style={{ opacity: 0.3 }} />
            <Controls
              position="bottom-left"
              showInteractive={false}
              className="!border-[var(--border)] !rounded-lg !shadow-sm !overflow-hidden !mb-4 !ml-4"
            />
            <MiniMap
              position="bottom-right"
              pannable
              zoomable
              nodeColor={(node) => {
                const t = (node.data as Record<string, unknown>).nodeType as string;
                if (t === 'outcome-good') return '#34d399';
                if (t === 'outcome-bad') return '#f87171';
                if (t === 'bottleneck') return '#fb923c';
                if (t === 'decision') return '#facc15';
                if (t === 'desire') return '#a78bfa';
                if (t === 'action') return '#4ade80';
                if (t === 'loop') return '#38bdf8';
                return '#ddd';
              }}
              maskColor="rgba(0,0,0,0.08)"
              style={{
                opacity: 0.7,
                width: 140,
                height: 90,
                marginBottom: 16,
                marginRight: 16,
              }}
            />
          </ReactFlow>

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

      {/* ========== STATS BAR (during simulation) ========== */}
      {simRunning && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div
            className="rounded-2xl px-2 py-1.5 flex items-center gap-2"
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.24), 0 0 0 1px rgba(255,255,255,0.06) inset',
            }}
          >
            {/* Speed control */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                className="w-16 h-1 appearance-none bg-white/10 rounded-full cursor-pointer accent-blue-400"
                style={{ accentColor: '#60a5fa' }}
              />
              <span className="text-[10px] font-bold text-white/50 tabular-nums w-6 text-center">{SPEED_LABELS[speedLevel]}</span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Wave progress */}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="flex gap-[3px]">
                {Array.from({ length: SPD_BASE.waves }, (_, i) => (
                  <div
                    key={i}
                    className="w-[6px] h-[14px] rounded-[2px] transition-all duration-300"
                    style={{
                      background: i < currentWave ? 'rgba(96, 165, 250, 0.9)' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold text-white/50 tabular-nums">{currentWave}/{SPD_BASE.waves}</span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-white/10" />

            {/* Metrics */}
            <div className="flex items-center gap-4 px-4 py-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-[6px] h-[6px] rounded-full bg-blue-400" />
                <span className="text-[12px] font-bold text-white tabular-nums">{simStats.total}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[6px] h-[6px] rounded-full bg-emerald-400" />
                <span className="text-[12px] font-bold text-emerald-400 tabular-nums">{simStats.success}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-[6px] h-[6px] rounded-full bg-red-400" />
                <span className="text-[12px] font-bold text-red-400 tabular-nums">{simStats.blocked}</span>
              </div>
            </div>

            {/* Rate pill */}
            <div
              className="px-3 py-1.5 rounded-xl text-[12px] font-bold tabular-nums"
              style={{
                background: successRate >= 50 ? 'rgba(16, 185, 129, 0.15)' : successRate >= 25 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: successRate >= 50 ? '#34d399' : successRate >= 25 ? '#fbbf24' : '#f87171',
              }}
            >
              {successRate}%
            </div>

            {/* Status */}
            {simPaused ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Paused</span>
              </div>
            ) : (
              <kbd className="text-[9px] text-white/30 bg-white/5 px-2 py-1 rounded-lg font-mono mx-1">space</kbd>
            )}
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
