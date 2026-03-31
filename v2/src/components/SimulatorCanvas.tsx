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
import Spinner from './ui/Spinner';
import { createPersonSVG, type ParticleData } from './Particle';
import { TEMPLATES, TEMPLATE_KEYWORDS, type TemplateNode, type TemplateEdge } from '@/lib/templates';
import type { ContextTags } from '@/lib/context-tags';
import { saveToHistory, createThumbnail, type HistoryEntry } from '@/lib/history';
import { SimulatorDataflow } from '@/lib/dataflow-engine';
import { applyRealProbabilities } from '@/lib/probability-matcher';
import DecisionPruning, { type PruningResult } from './DecisionPruning';
import { type UserProfile, loadProfile, getProfilePromptModifier } from '@/lib/user-profile';
import { templateToFlow } from '@/lib/graph-utils';
import { SPD_BASE, SPEED_LEVELS, SPEED_LABELS, precomputeFates } from '@/lib/simulation-types';
import { CutLineIndicator, ParticleLayer } from './SimOverlays';
import { IdleToolbar, RunningToolbar, StatsBar, ReplayBar, StepModeBar, PathFilterBar, ResultsTab } from './SimToolbar';
import { usePathFilter } from './usePathFilter';

const nodeTypes = { simNode: SimNodeComponent, contextNode: ContextNodeComponent };
const edgeTypes = { animated: AnimatedEdgeComponent };

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
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[]);
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
        body: JSON.stringify({ scenario: input, tags: contextTagsRef.current, profile: profileRef.current }),
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
      const { nodes: ln, edges: le } = templateToFlow(tNodes, tEdges, ctx);
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
        fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
        // Show Decision Pruning after generate (instead of auto-simulate)
        setTimeout(() => requestSimulate(), 500);
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

      // Deterministic proportional filter: prob 70% → exactly 70 out of 100 pass
      // No randomness. The observed reality IS the outcome.
      // Outcome nodes never filter — they are terminal destinations
      const isOutcome = nodeType === 'outcome-good' || nodeType === 'outcome-bad';

      // Gate node: 3-way split (NO / PARTIAL / YES) based on edge labels
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

        // prob = YES%, derive PARTIAL from edge data or default split
        // NO% = 100 - prob - partial%. Default partial = middle ground
        const partialPct = (partialEdge?.data as Record<string, unknown>)?.prob as number
          ?? Math.min(25, Math.floor((100 - prob) / 2));
        const noPct = 100 - prob - partialPct;

        // Deterministic: which bucket does this arrival fall into?
        const shouldNo = Math.floor(arrivals * noPct / 100);
        const shouldPartial = Math.floor(arrivals * (noPct + partialPct) / 100);
        const prevNo = (node.data as Record<string, unknown>)[`routed-no-${nodeId}`] as number || 0;
        const prevPartial = (node.data as Record<string, unknown>)[`routed-partial-${nodeId}`] as number || 0;

        let route: 'no' | 'partial' | 'yes';
        if (prevNo < shouldNo) {
          route = 'no';
        } else if (prevPartial < (shouldPartial - shouldNo)) {
          route = 'partial';
        } else {
          route = 'yes';
        }

        // Update counters
        const counterKey = `routed-${route}-${nodeId}`;
        const prevCount = (node.data as Record<string, unknown>)[counterKey] as number || 0;
        setNodes(ns => ns.map(n => n.id === nodeId ? {
          ...n, data: { ...n.data, [counterKey]: prevCount + 1 }
        } : n));

        if (route === 'no' && noEdge) {
          const deathKey = `deaths-${nodeId}`;
          const prevDeaths = (node.data as Record<string, unknown>)[deathKey] as number || 0;
          setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, [deathKey]: prevDeaths + 1 } } : n));
          moveTo(particle, noEdge.target, cb);
          return;
        } else if (route === 'partial' && partialEdge) {
          moveTo(particle, partialEdge.target, cb);
          return;
        } else if (route === 'yes' && yesEdge) {
          moveTo(particle, yesEdge.target, cb);
          return;
        }
        // Fallback: follow first available edge
        if (out.length > 0) { moveTo(particle, out[0].target, cb); return; }
      }

      const hasProb = !isOutcome && nodeType !== 'gate' && typeof prob === 'number' && prob < 100;
      if (hasProb) {
        // Track how many have arrived and how many should pass at this node
        const arrivalKey = `arrivals-${nodeId}`;
        const passedKey = `passed-${nodeId}`;
        const arrivals = ((node.data as Record<string, unknown>)[arrivalKey] as number || 0) + 1;
        const passed = (node.data as Record<string, unknown>)[passedKey] as number || 0;
        // Deterministic: should this person pass based on the ratio so far?
        const shouldHavePassed = Math.floor(arrivals * prob / 100);
        const pass = passed < shouldHavePassed;
        // Update counters
        setNodes(ns => ns.map(n => n.id === nodeId ? {
          ...n, data: { ...n.data, [arrivalKey]: arrivals, [passedKey]: pass ? passed + 1 : passed }
        } : n));
        if (!pass) {
          // Track deaths per node for visual counter
          const deathKey = `deaths-${nodeId}`;
          const prevDeaths = (node.data as Record<string, unknown>)[deathKey] as number || 0;
          setNodes(ns => ns.map(n => n.id === nodeId ? { ...n, data: { ...n.data, [deathKey]: prevDeaths + 1 } } : n));
          // Route failed particle to outcome-bad via fail/no edge if available
          const failEdges = edgesRef.current.filter(e => e.source === nodeId);
          const failE = failEdges.find(e => ((e.label || '') as string).toLowerCase().startsWith('fail') || ((e.label || '') as string).toLowerCase().startsWith('no'));
          if (failE) {
            // Send to outcome-bad node (particle walks there, then dies)
            moveTo(particle, failE.target, cb);
            return;
          }
          // No fail edge — die in place
          const fallX = (Math.random() - 0.5) * 80;
          const fallY = 30 + Math.random() * 25;
          particle.status = 'failing';
          updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: p.x + fallX, y: p.y + fallY, status: 'failing' } : p));
          finishedCountRef.current++;
          cb('blocked');
          return;
        }
      }

      // Route passed particles through "pass"/"yes" edge if available
      if (hasProb && (nodeType === 'bottleneck' || nodeType === 'decision')) {
        const out = edgesRef.current.filter(e => e.source === nodeId);
        const passE = out.find(e => ((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes'));
        if (passE) {
          moveTo(particle, passE.target, cb);
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
      const nextE = out.length > 1
        ? out[0]
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
      speedMult: 0.8 + Math.random() * 0.4, // 0.8–1.2x individual speed
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
        const startId = startNodeIds[0];
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
    const fates = precomputeFates(totalPeople, startNodeIds[0], nodesRef.current, edgesRef.current);
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

    // Use the proven wave-based system with real-time routing (moveTo)
    launchWave(0, startNodeIds);
  }, [launchWave, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep simulateRef in sync
  simulateRef.current = simulate;

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
    setNodes(prev => prev.map(n => {
      const isKiller = killerNodeIds.has(n.id);
      return {
        ...n,
        data: { ...n.data, isCutPoint: false },
        style: {
          ...n.style,
          opacity: hasKillers ? (isKiller ? 1 : 0.4) : 1,
          transition: 'opacity 0.8s ease',
          filter: hasKillers && !isKiller ? 'grayscale(0.3)' : 'none',
        },
      };
    }));

    // Also dim non-critical edges
    if (hasKillers) {
      setEdges(prev => prev.map(e => ({
        ...e,
        hidden: false,
        style: {
          ...e.style,
          opacity: (killerNodeIds.has(e.source) || killerNodeIds.has(e.target)) ? 1 : 0.25,
          transition: 'opacity 0.8s ease',
        },
      })));
    }

    // Keep particles in their final positions — don't clear them
    // They only get cleared on new simulation or clear button

    // Reset stats refs for clean state
    waveRef.current = 0;
    setCurrentWave(0);
    finishedCountRef.current = 0;

    if (statsRef.current.total > 0) {
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
    const { nodes: ln, edges: le } = templateToFlow(tNodes, flow.edges as TemplateEdge[], ctx);
    setNodes(ln);
    setEdges(le);

    setTimeout(() => {
      fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
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
              body: JSON.stringify({ scenario: input, tags: contextTagsRef.current, profile: profileRef.current }),
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
                  fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 });
                  setTimeout(() => simulate(), 500);
                }, 100);
              })
              .catch(() => setErrorMsg('Could not generate scenario from photo.'))
              .finally(() => setGenerating(false));
          }, 50);
        }}
        onTagsChange={(t) => { contextTagsRef.current = t; }}
        onProfileChange={(p) => { profileRef.current = p; }}
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
            onClose={() => { setShowDashboard(false); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }}
          />
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

      {/* ========== TOOLBARS (extracted components) ========== */}
      {hasNodes && !simRunning && (
        <IdleToolbar
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
            setNodes(prev => prev.map(n => ({ ...n, data: { ...n.data, sacredMode: newMode } })));
          }}
          onSave={handleSave}
          onShare={handleShare}
          onExportPNG={handleExportPNG}
          onClear={() => { stopSim(); setNodes([]); setEdges([]); setShowDashboard(false); setScenario(''); setErrorMsg(''); }}
        />
      )}

      {simRunning && (
        <RunningToolbar
          simPaused={simPaused}
          onTogglePause={togglePause}
          onStop={stopSim}
        />
      )}

      {simRunning && (
        <StatsBar
          speedLevel={speedLevel}
          currentWave={currentWave}
          totalWaves={replayOverrideRef.current?.waves ?? SPD_BASE.waves}
          simStats={simStats}
          successRate={successRate}
          simPaused={simPaused}
          onSpeedChange={(v) => { setSpeedLevel(v); speedRef.current = v; }}
        />
      )}

      {replayMode && !simRunning && (
        <ReplayBar
          cutNodeId={cutNodeId}
          cutNodeLabel={nodesRef.current.find(n => n.id === cutNodeId)?.data?.label as string || 'node'}
          cutReachCount={cutReachCountRef.current}
          simRunning={simRunning}
          onSimulateFromCut={simulateFromCut}
          onExitReplayMode={exitReplayMode}
        />
      )}

      {stepMode && (
        <StepModeBar
          stepIndex={stepIndex}
          totalSteps={stepOrderRef.current.length}
          onStepBack={stepBack}
          onStepForward={stepForward}
          onExitStepMode={exitStepMode}
        />
      )}

      {!simRunning && statsRef.current.total > 0 && !showDashboard && !stepMode && (
        <>
          <ResultsTab onShowDashboard={() => { setShowDashboard(true); setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100); }} />
          <PathFilterBar pathFilter={pathFilter} onFilterChange={applyPathFilter} />
        </>
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
