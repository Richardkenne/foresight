import { useCallback, useRef, useState, useEffect } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { createPersonSVG, createYouSVG, type ParticleData } from './Particle';
import { SPD_BASE, SPEED_LEVELS, precomputeFates, type SimSettings } from '@/lib/simulation-types';
import type { PrecomputedFate } from '@/lib/simulation-types';
import { SimulatorDataflow } from '@/lib/dataflow-engine';
import { extractEdgePaths, getPointOnEdge, type EdgePathInfo } from '@/lib/path-follower';
import { triggerConfetti } from './ui/Confetti';
import { sounds } from '@/lib/sounds';
import { recordSimulationDate } from '@/lib/feedback';
import type { UserProfile } from '@/lib/user-profile';

export interface SimStats {
  total: number;
  success: number;
  blocked: number;
}

export interface YouOutcome {
  outcome: 'success' | 'blocked';
  nodeLabel: string;
}

export interface UseSimulationParams {
  nodesRef: React.MutableRefObject<RFNode[]>;
  edgesRef: React.MutableRefObject<RFEdge[]>;
  setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
  fitView: (opts?: Record<string, unknown>) => void;
  simSettingsRef: React.MutableRefObject<SimSettings>;
  profileRef: React.MutableRefObject<UserProfile>;
  speedRef: React.MutableRefObject<number>;
}

export function useSimulation({
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  fitView,
  simSettingsRef,
  profileRef,
  speedRef,
}: UseSimulationParams) {
  // Simulation state
  const [simRunning, setSimRunning] = useState(false);
  const [simPaused, setSimPaused] = useState(false);
  const [simStats, setSimStats] = useState<SimStats>({ total: 0, success: 0, blocked: 0 });
  const [youOutcome, setYouOutcome] = useState<YouOutcome | null>(null);
  const youPathRef = useRef<Set<string>>(new Set());
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [currentWave, setCurrentWave] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);

  // Node values — signal delta propagation (inspired by Loopy)
  const [nodeValues, setNodeValues] = useState<Record<string, number>>({});
  const nodeValuesRef = useRef<Record<string, number>>({});

  const simRunningRef = useRef(false);
  const simPausedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const particleIdRef = useRef(0);
  const personIdRef = useRef(0);
  const statsRef = useRef<SimStats>({ total: 0, success: 0, blocked: 0 });
  const nodeReachRef = useRef<Record<string, Set<number>>>({});
  const particlesRef = useRef<ParticleData[]>([]);
  const revealedNodesRef = useRef<Set<string>>(new Set());
  const waveRef = useRef(0);
  const finishedCountRef = useRef(0);
  const originalEdgesRef = useRef<RFEdge[] | null>(null);
  const dataflowRef = useRef<SimulatorDataflow>(new SimulatorDataflow());
  const storedFatesRef = useRef<PrecomputedFate[]>([]);

  // Edge path cache for SVG path following
  const edgePathsRef = useRef<Map<string, EdgePathInfo>>(new Map());

  // Replay override (for cut-point replay)
  const replayOverrideRef = useRef<{ waves: number; perWave: number } | null>(null);

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
  }, [speedRef]);

  // Signal propagation: when a particle reaches a node, it carries a delta that modifies the node value
  const propagateSignal = useCallback((nodeId: string, delta: number) => {
    const current = nodeValuesRef.current[nodeId] || 0;
    nodeValuesRef.current[nodeId] = current + delta;
    setNodeValues({ ...nodeValuesRef.current });

    const outEdges = edgesRef.current.filter(e => e.source === nodeId);
    for (const edge of outEdges) {
      const strength = (edge.data as Record<string, unknown>)?.strength as number ?? 1;
      const propagatedDelta = delta * strength * 0.7;
      if (Math.abs(propagatedDelta) > 0.01) {
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
  }, [getSPD, edgesRef]);

  // Handle slider change on a node
  const handleNodeSliderChange = useCallback(async (nodeId: string, value: number, nodeType: string) => {
    if (nodeType === 'start') {
      dataflowRef.current.updateParameter(nodeId, value / 100);
    } else {
      dataflowRef.current.updateProbability(nodeId, value);
    }
    const values = await dataflowRef.current.computeAll();
    nodeValuesRef.current = values;
    setNodeValues(values);
    setNodes(prev => prev.map(n => ({
      ...n,
      data: {
        ...n.data,
        computedValue: values[n.id],
        onSliderChange: (n.data as Record<string, unknown>).onSliderChange,
      },
    })));
  }, [setNodes]);

  // Reveal a node during simulation
  const revealNode = useCallback((nodeId: string) => {
    if (revealedNodesRef.current.has(nodeId)) return;
    revealedNodesRef.current.add(nodeId);
    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' } }
        : n
    ));
    setEdges(prev => prev.map(e => {
      if (revealedNodesRef.current.has(e.source) && revealedNodesRef.current.has(e.target)) {
        return { ...e, hidden: false };
      }
      return e;
    }));
  }, [setNodes, setEdges]);

  // Simulation timeout that respects pause
  const simTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current = timeoutsRef.current.filter(x => x !== id);
      if (simRunningRef.current && !simPausedRef.current) fn();
      else if (simRunningRef.current && simPausedRef.current) {
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
  }, [updateParticles, nodesRef]);

  // moveTo ref for recursive routing
  const moveToRef = useRef<(particle: ParticleData, nodeId: string, cb: (r: 'success' | 'blocked') => void) => void>(() => {});

  // Route particle from a node to the next destination
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
  }, [simTimeout, updateParticles, setNodes, nodesRef, edgesRef]); // eslint-disable-line react-hooks/exhaustive-deps

  const moveTo = useCallback((particle: ParticleData, nodeId: string, cb: (r: 'success' | 'blocked') => void) => {
    if (!simRunningRef.current) return;

    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) { cb('blocked'); return; }

    revealNode(nodeId);

    if (!nodeReachRef.current[nodeId]) nodeReachRef.current[nodeId] = new Set();
    nodeReachRef.current[nodeId].add(particle.personId);

    const prevNodeId = particle.visitedNodes.size > 0
      ? Array.from(particle.visitedNodes).pop()
      : undefined;
    particle.visitedNodes.add(nodeId);

    const tx = node.position.x + 85 - 12;
    const ty = node.position.y + 50 - 16;

    const signalDelta = particle.signalDelta ?? 0.33;
    propagateSignal(nodeId, signalDelta);

    const usePathFollow = simSettingsRef.current.pathFollowing && prevNodeId;
    const spd = getSPD();
    const moveDuration = Math.round(spd.move * (particle.speedMult || 1));

    if (usePathFollow && prevNodeId) {
      animateAlongEdge(particle, prevNodeId, nodeId, moveDuration, () => {
        particle.x = tx;
        particle.y = ty;
        updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: tx, y: ty } : p));
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

    particle.x = tx;
    particle.y = ty;
    updateParticles(prev => prev.map(p => p.id === particle.id ? { ...p, x: tx, y: ty } : p));

    simTimeout(() => {
      routeFromNode(particle, nodeId, cb);
    }, spd.wait);
  }, [simTimeout, updateParticles, revealNode, propagateSignal, getSPD, animateAlongEdge, routeFromNode, nodesRef, simSettingsRef, speedRef]);

  // Keep moveToRef in sync
  moveToRef.current = moveTo;

  const launchPerson = useCallback((startNodeId: string) => {
    const pid = ++personIdRef.current;
    const pId = ++particleIdRef.current;
    const startNode = nodesRef.current.find(n => n.id === startNodeId);
    if (!startNode) return;

    const isYou = pid === 1;
    const particle: ParticleData = {
      id: pId,
      personId: pid,
      x: startNode.position.x + 85 - 12,
      y: startNode.position.y + 50 - 16,
      svg: isYou ? createYouSVG() : createPersonSVG(),
      status: 'moving',
      visitedNodes: new Set(),
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

      if (isYou) {
        const lastNodeId = Array.from(particle.visitedNodes).pop();
        const lastNode = nodesRef.current.find(n => n.id === lastNodeId);
        const label = (lastNode?.data as Record<string, unknown>)?.label as string || 'Unknown';
        setYouOutcome({ outcome: result, nodeLabel: label });
        youPathRef.current = new Set(particle.visitedNodes);
      }
    });
  }, [moveTo, updateParticles, nodesRef, simSettingsRef]);

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

  // Simultaneous launch
  const launchSimultaneous = useCallback((startNodeIds: string[]) => {
    const totalPeople = SPD_BASE.waves * SPD_BASE.perWave;
    const spd = getSPD();

    setCurrentWave(1);

    for (let i = 0; i < totalPeople; i++) {
      const staggerMs = Math.round((i / totalPeople) * 500 / (SPEED_LEVELS[speedRef.current] || 1));
      simTimeout(() => {
        if (!simRunningRef.current) return;
        statsRef.current.total++;
        setSimStats({ ...statsRef.current });
        const startId = startNodeIds[0];
        launchPerson(startId);
      }, staggerMs);
    }

    const maxPathLength = 50;
    const estimatedDuration = maxPathLength * spd.move + 2000;
    simTimeout(() => {
      if (simRunningRef.current) {
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
  }, [simTimeout, launchPerson, getSPD, speedRef]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply pruning modifiers to all bottleneck/decision nodes
  const applyPruningModifiers = useCallback((modifier: number) => {
    if (modifier === 1.0) return;
    setNodes(prev => prev.map(n => {
      const data = n.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      if (nodeType === 'bottleneck' || nodeType === 'decision' || nodeType === 'gate') {
        const origProb = data.prob as number;
        const newProb = Math.round(Math.max(1, Math.min(99, origProb * modifier)));
        return { ...n, data: { ...data, prob: newProb } };
      }
      return n;
    }));
  }, [setNodes]);

  // stopSim function
  function stopSim() {
    simRunningRef.current = false;
    simPausedRef.current = false;
    setSimRunning(false);
    setSimPaused(false);
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];

    edgePathsRef.current = new Map();
    const offscreenSVG = document.getElementById('__sim-offscreen-svg');
    if (offscreenSVG) offscreenSVG.innerHTML = '';

    if (originalEdgesRef.current) {
      const origEdges = originalEdgesRef.current;
      edgesRef.current = origEdges;
      originalEdgesRef.current = null;
      setEdges(origEdges.map(e => ({ ...e, hidden: false })));
    }

    revealedNodesRef.current = new Set();

    // KILLER NODE HIGHLIGHTING
    const killerNodeIds = new Set<string>();
    const bottleneckKills: { id: string; killRate: number }[] = [];
    for (const n of nodesRef.current) {
      const data = n.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      if (nodeType !== 'bottleneck' && nodeType !== 'decision' && nodeType !== 'gate') continue;
      const reached = nodeReachRef.current[n.id]?.size || 0;
      if (reached === 0) continue;
      const passEdge = edgesRef.current.find(e => e.source === n.id && (((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes')));
      const passed = passEdge ? (nodeReachRef.current[passEdge.target]?.size || 0) : 0;
      const killRate = 1 - (passed / reached);
      bottleneckKills.push({ id: n.id, killRate });
    }
    bottleneckKills.sort((a, b) => b.killRate - a.killRate);
    const topKillers = bottleneckKills.filter(b => b.killRate > 0.3).slice(0, 5);
    for (const k of topKillers) killerNodeIds.add(k.id);
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
          ...(isOnYouPath ? { boxShadow: '0 0 0 2px #fbbf24, 0 0 12px rgba(251,191,36,0.3)' } : {}),
        },
      };
    }));

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
            ...(isOnYouPath ? { stroke: '#fbbf24', strokeWidth: 3 } : {}),
          },
        };
      }));
    }

    waveRef.current = 0;
    setCurrentWave(0);
    finishedCountRef.current = 0;

    if (statsRef.current.total > 0) {
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

  // Main simulate function
  const simulate = useCallback((setPathFilter?: (v: 'all' | 'success' | 'partial' | 'fail') => void) => {
    if (simRunningRef.current || nodesRef.current.length === 0) return;

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
    if (setPathFilter) setPathFilter('all');
    setYouOutcome(null);
    youPathRef.current = new Set();

    nodeValuesRef.current = {};
    setNodeValues({});

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
    const ctxNode = nodesRef.current.find(n => n.type === 'contextNode');
    if (ctxNode) revealedNodesRef.current.add(ctxNode.id);
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

    const hasIncoming = new Set(edgesRef.current.map(e => e.target));
    const startNodeIds = nodesRef.current.filter(n => !hasIncoming.has(n.id)).map(n => n.id);
    if (startNodeIds.length === 0) { stopSim(); return; }

    const totalPeople = SPD_BASE.waves * SPD_BASE.perWave;
    const fates = precomputeFates(totalPeople, startNodeIds[0], nodesRef.current, edgesRef.current, profileRef.current?.sacredProfile);
    storedFatesRef.current = fates;
    const spd = getSPD();

    console.log('[SIM] Fates computed:', fates.length, 'Start:', startNodeIds[0]);
    console.log('[SIM] Sample paths:', fates.slice(0, 3).map(f => f.path.join('\u2192')));
    console.log('[SIM] Successes:', fates.filter(f => f.outcome === 'success').length);
    console.log('[SIM] Avg path length:', (fates.reduce((s, f) => s + f.path.length, 0) / fates.length).toFixed(1));
    console.log('[SIM] Speed:', spd);

    const deathCounts: Record<string, number> = {};
    for (const fate of fates) {
      if (fate.deathNode) {
        deathCounts[fate.deathNode] = (deathCounts[fate.deathNode] || 0) + 1;
      }
    }

    if (simSettingsRef.current.pathFollowing) {
      setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
      requestAnimationFrame(() => {
        edgePathsRef.current = extractEdgePaths(
          edgesRef.current.map(e => ({ id: e.id, source: e.source, target: e.target }))
        );
        console.log('[SIM] Edge paths extracted:', edgePathsRef.current.size);
        setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

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
  }, [launchWave, launchSimultaneous, setNodes, setEdges, nodesRef, edgesRef, profileRef, simSettingsRef, getSPD]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate reverse (right-to-left reveal)
  const simulateReverse = useCallback(() => {
    if (simRunningRef.current || nodesRef.current.length === 0) return;

    const originalEdges = edgesRef.current;
    const adjForward: Record<string, string[]> = {};
    const hasIncoming = new Set<string>();
    for (const e of originalEdges) {
      if (!adjForward[e.source]) adjForward[e.source] = [];
      adjForward[e.source].push(e.target);
      hasIncoming.add(e.target);
    }
    const startIds = nodesRef.current.filter(n => !hasIncoming.has(n.id)).map(n => n.id);

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
    for (const n of nodesRef.current) {
      if (!visited.has(n.id)) visitOrder.push(n.id);
    }

    const reverseOrder = [...visitOrder].reverse();

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

    originalEdgesRef.current = [...originalEdges];

    revealedNodesRef.current = new Set();
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: 0, transition: 'opacity 0.5s ease' },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));

    const spd = getSPD();
    const stepDelay = spd.move * 0.6;
    let personCount = 0;

    reverseOrder.forEach((nodeId, i) => {
      simTimeout(() => {
        if (!simRunningRef.current) return;

        revealNode(nodeId);

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

        const data = node.data as Record<string, unknown>;
        const nodeType = data.nodeType as string;
        if (nodeType === 'outcome-good') { statsRef.current.success++; statsRef.current.total++; }
        else if (nodeType === 'outcome-bad') { statsRef.current.blocked++; statsRef.current.total++; }
        setSimStats({ ...statsRef.current });

        if (i === reverseOrder.length - 1) {
          simTimeout(() => {
            if (simRunningRef.current) stopSim();
          }, stepDelay);
        }
      }, i * stepDelay);
    });
  }, [simTimeout, updateParticles, revealNode, getSPD, nodesRef, edgesRef, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  // Simulate from cut point (replay mode)
  const simulateFromCut = useCallback((cutNodeId: string, cutDownstreamRef: React.MutableRefObject<Set<string>>, cutReachCountRef: React.MutableRefObject<number>) => {
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
    nodeValuesRef.current = {};
    setNodeValues({});

    revealedNodesRef.current = new Set(
      nodesRef.current.filter(n => !cutDownstreamRef.current.has(n.id)).map(n => n.id)
    );

    const reach = cutReachCountRef.current || SPD_BASE.waves * SPD_BASE.perWave;
    const perWave = Math.min(10, Math.max(1, Math.ceil(reach / 10)));
    const waves = Math.max(1, Math.ceil(reach / perWave));
    replayOverrideRef.current = { waves, perWave };

    launchWave(0, [cutNodeId]);
  }, [launchWave, nodesRef, setNodes, setEdges]); // eslint-disable-line react-hooks/exhaustive-deps

  function togglePause() {
    if (!simRunningRef.current) return;
    simPausedRef.current = !simPausedRef.current;
    setSimPaused(simPausedRef.current);
  }

  // Auto-show dashboard when simulation ends naturally
  useEffect(() => {
    if (simRunning && statsRef.current.total > 0) {
      const done = statsRef.current.success + statsRef.current.blocked;
      if (done >= statsRef.current.total && waveRef.current >= (replayOverrideRef.current?.waves ?? SPD_BASE.waves)) {
        setTimeout(() => {
          if (simRunningRef.current) {
            stopSim();
          }
        }, 2000);
      }
    }
  }, [simStats, simRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // State
    simRunning,
    simPaused,
    simStats,
    youOutcome,
    youPathRef,
    particles,
    currentWave,
    showDashboard,
    nodeValues,
    storedFatesRef,

    // Refs
    simRunningRef,
    statsRef,
    nodeReachRef,
    particlesRef,
    revealedNodesRef,
    nodeValuesRef,
    dataflowRef,
    originalEdgesRef,
    replayOverrideRef,

    // Setters
    setShowDashboard,
    setParticles,
    setSimStats,
    setYouOutcome,
    setNodeValues,

    // Functions
    simulate,
    stopSim,
    togglePause,
    simulateReverse,
    simulateFromCut,
    applyPruningModifiers,
    handleNodeSliderChange,
    getSPD,
    revealNode,
  };
}
