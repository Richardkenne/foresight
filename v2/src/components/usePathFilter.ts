import { useCallback, useState } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

export function usePathFilter(
  setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>,
  nodesRef: React.MutableRefObject<RFNode[]>,
  edgesRef: React.MutableRefObject<RFEdge[]>
) {
  const [pathFilter, setPathFilter] = useState<'all' | 'success' | 'partial' | 'fail'>('all');

  const applyPathFilter = useCallback((filter: 'all' | 'success' | 'partial' | 'fail') => {
    setPathFilter(filter);

    if (filter === 'all') {
      setNodes(prev => prev.map(n => ({
        ...n,
        style: { ...n.style, opacity: 1, filter: 'none', transition: 'opacity 0.4s ease, filter 0.4s ease' },
      })));
      setEdges(prev => prev.map(e => ({ ...e, hidden: false, style: { ...e.style, opacity: 1 } })));
      return;
    }

    // Build path sets by tracing backward from outcome nodes
    const pathNodes = new Set<string>();
    const pathEdgeIds = new Set<string>();

    // Helper: trace backward from a node to find all ancestors
    const traceBackward = (nodeId: string, visited: Set<string>) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      pathNodes.add(nodeId);
      const incoming = edgesRef.current.filter(e => e.target === nodeId);
      for (const e of incoming) {
        pathEdgeIds.add(e.id);
        traceBackward(e.source, visited);
      }
    };

    // Helper: trace forward from a node following specific edges
    const traceForward = (nodeId: string, visited: Set<string>) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      pathNodes.add(nodeId);
      const outgoing = edgesRef.current.filter(e => e.source === nodeId);
      for (const e of outgoing) {
        pathEdgeIds.add(e.id);
        traceForward(e.target, visited);
      }
    };

    if (filter === 'success') {
      const goodNodes = nodesRef.current.filter(n =>
        (n.data as Record<string, unknown>).nodeType === 'outcome-good'
      );
      const visited = new Set<string>();
      for (const n of goodNodes) traceBackward(n.id, visited);
    } else if (filter === 'fail') {
      const badNodes = nodesRef.current.filter(n =>
        (n.data as Record<string, unknown>).nodeType === 'outcome-bad'
      );
      const visited = new Set<string>();
      for (const n of badNodes) traceBackward(n.id, visited);
    } else if (filter === 'partial') {
      const partialEdges = edgesRef.current.filter(e => e.label === 'partial');
      const visited = new Set<string>();
      for (const e of partialEdges) {
        pathEdgeIds.add(e.id);
        pathNodes.add(e.source);
        traceForward(e.target, visited);
      }
      if (partialEdges.length > 0) {
        const gateId = partialEdges[0].source;
        traceBackward(gateId, new Set());
      }
    }

    // Apply opacity + color tint per path type
    const tintColor = filter === 'success' ? 'rgba(16, 185, 129, 0.08)'
      : filter === 'fail' ? 'rgba(239, 68, 68, 0.08)'
      : filter === 'partial' ? 'rgba(120, 120, 120, 0.12)'
      : 'transparent';
    const borderColor = filter === 'success' ? 'rgba(16, 185, 129, 0.4)'
      : filter === 'fail' ? 'rgba(239, 68, 68, 0.4)'
      : filter === 'partial' ? 'rgba(120, 120, 120, 0.5)'
      : undefined;

    setNodes(prev => prev.map(n => {
      const isInPath = pathNodes.has(n.id);
      return {
        ...n,
        style: {
          ...n.style,
          opacity: isInPath ? 1 : 0.06,
          filter: isInPath ? 'none' : 'grayscale(1) blur(1px)',
          background: isInPath ? tintColor : undefined,
          outline: isInPath && borderColor ? `2px solid ${borderColor}` : undefined,
          transition: 'opacity 0.4s ease, filter 0.4s ease, background 0.4s ease',
        },
      };
    }));
    setEdges(prev => prev.map(e => ({
      ...e,
      style: {
        ...e.style,
        opacity: pathEdgeIds.has(e.id) ? 1 : 0.04,
        stroke: pathEdgeIds.has(e.id) && filter === 'partial' ? '#888' : e.style?.stroke,
      },
    })));
  }, [setNodes, setEdges, nodesRef, edgesRef]);

  return { pathFilter, setPathFilter, applyPathFilter };
}
