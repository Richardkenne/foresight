import { useCallback, useRef, useState } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

export interface UseReplayModeParams {
  nodesRef: React.MutableRefObject<RFNode[]>;
  edgesRef: React.MutableRefObject<RFEdge[]>;
  setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
  simRunningRef: React.MutableRefObject<boolean>;
  nodeReachRef: React.MutableRefObject<Record<string, Set<number>>>;
  particlesRef: React.MutableRefObject<unknown[]>;
  setParticles: (p: never[]) => void;
  statsRef: React.MutableRefObject<{ total: number; success: number; blocked: number }>;
  setSimStats: (s: { total: number; success: number; blocked: number }) => void;
  setShowDashboard: (v: boolean) => void;
}

export function useReplayMode({
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  simRunningRef,
  nodeReachRef,
  particlesRef,
  setParticles,
  statsRef,
  setSimStats,
  setShowDashboard,
}: UseReplayModeParams) {
  const [replayMode, setReplayMode] = useState(false);
  const [cutNodeId, setCutNodeId] = useState<string | null>(null);
  const cutDownstreamRef = useRef<Set<string>>(new Set());
  const cutReachCountRef = useRef(0);

  // Reverse engineering state
  const [reversePath, setReversePath] = useState<{ id: string; label: string; type: string; prob: number; edgeLabel: string }[] | null>(null);
  const [reverseCompoundProb, setReverseCompoundProb] = useState(0);

  // BFS: get all nodes downstream of a given node
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
  }, [edgesRef]);

  // Exit replay mode
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

  // BFS backward from an outcome node to root
  const computeReversePath = useCallback((nodeId: string) => {
    const allEdges = edgesRef.current;
    const allNodes = nodesRef.current;

    const path: { id: string; label: string; type: string; prob: number; edgeLabel: string }[] = [];
    let current = nodeId;
    const visited = new Set<string>();

    while (current && !visited.has(current)) {
      visited.add(current);
      const nd = allNodes.find(n => n.id === current);
      if (!nd) break;
      const d = nd.data as Record<string, unknown>;
      const inEdge = allEdges.find(e => e.target === current && visited.has(e.source) === false);
      const edgeLabel = inEdge ? (inEdge.label as string || '') : '';
      path.unshift({
        id: current,
        label: (d.label as string) || '',
        type: (d.nodeType as string) || nd.type || '',
        prob: (d.prob as number) ?? 100,
        edgeLabel,
      });
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
  }, [nodesRef, edgesRef, setNodes, setEdges]);

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

  // Handle node click in replay mode or reverse engineering
  const onNodeClickReplay = useCallback((_event: React.MouseEvent, node: RFNode) => {
    // Reverse engineering: click any outcome node (when not in replay/sim)
    if (!replayMode && !simRunningRef.current) {
      const d = node.data as Record<string, unknown>;
      const nodeType = (d.nodeType as string) || '';
      if (nodeType === 'outcome-good' || nodeType === 'outcome-bad') {
        computeReversePath(node.id);
        return;
      }
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

    setEdges(prev => prev.map(e => ({
      ...e,
      hidden: downstream.has(e.source) || downstream.has(e.target),
    })));

    const reachSet = nodeReachRef.current[nodeId];
    cutReachCountRef.current = reachSet ? reachSet.size : 0;

    particlesRef.current = [];
    setParticles([] as never[]);
    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    setShowDashboard(false);
  }, [replayMode, getDownstreamNodes, setNodes, setEdges, simRunningRef, nodeReachRef, particlesRef, setParticles, statsRef, setSimStats, setShowDashboard, computeReversePath, clearReversePath, reversePath]);

  return {
    replayMode,
    setReplayMode,
    cutNodeId,
    setCutNodeId,
    cutDownstreamRef,
    cutReachCountRef,
    reversePath,
    reverseCompoundProb,
    exitReplayMode,
    computeReversePath,
    clearReversePath,
    onNodeClickReplay,
    getDownstreamNodes,
  };
}
