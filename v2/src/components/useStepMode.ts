import { useCallback, useEffect, useRef, useState } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

export interface UseStepModeParams {
  nodesRef: React.MutableRefObject<RFNode[]>;
  setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
  fitView: (opts?: Record<string, unknown>) => void;
  setShowDashboard: (v: boolean) => void;
  setPathFilter: (v: 'all' | 'success' | 'partial' | 'fail') => void;
}

export function useStepMode({
  nodesRef,
  setNodes,
  setEdges,
  fitView,
  setShowDashboard,
  setPathFilter,
}: UseStepModeParams) {
  const [stepMode, setStepMode] = useState(false);
  const stepIndexRef = useRef(0);
  const [stepIndex, setStepIndex] = useState(0);
  const stepOrderRef = useRef<string[]>([]);

  const enterStepMode = useCallback(() => {
    if (nodesRef.current.length === 0) return;

    const ordered = [...nodesRef.current]
      .filter(n => n.type !== 'contextNode')
      .sort((a, b) => (a.position.x || 0) - (b.position.x || 0));
    stepOrderRef.current = ordered.map(n => n.id);
    stepIndexRef.current = 0;
    setStepIndex(0);
    setStepMode(true);
    setShowDashboard(false);
    setPathFilter('all');

    setNodes(prev => prev.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: n.type === 'contextNode' ? 1 : 0,
        transition: 'opacity 0.5s ease',
      },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: true })));
  }, [nodesRef, setNodes, setEdges, setShowDashboard, setPathFilter]);

  const stepForward = useCallback(() => {
    const order = stepOrderRef.current;
    if (stepIndexRef.current >= order.length) return;

    const nodeId = order[stepIndexRef.current];
    stepIndexRef.current++;
    setStepIndex(stepIndexRef.current);

    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' } }
        : n
    ));

    const revealedSoFar = new Set(order.slice(0, stepIndexRef.current));
    setEdges(prev => prev.map(e => {
      if (revealedSoFar.has(e.source) && revealedSoFar.has(e.target)) {
        return { ...e, hidden: false };
      }
      return e;
    }));

    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node) {
      fitView({ nodes: [node], padding: 1.5, duration: 600, maxZoom: 1.2 });
    }
  }, [nodesRef, setNodes, setEdges, fitView]);

  const stepBack = useCallback(() => {
    if (stepIndexRef.current <= 0) return;

    stepIndexRef.current--;
    setStepIndex(stepIndexRef.current);

    const order = stepOrderRef.current;
    const nodeId = order[stepIndexRef.current];

    setNodes(prev => prev.map(n =>
      n.id === nodeId
        ? { ...n, style: { ...n.style, opacity: 0, transition: 'opacity 0.3s ease' } }
        : n
    ));

    setEdges(prev => prev.map(e => {
      if (e.source === nodeId || e.target === nodeId) {
        return { ...e, hidden: true };
      }
      return e;
    }));

    if (stepIndexRef.current > 0) {
      const prevNode = nodesRef.current.find(n => n.id === order[stepIndexRef.current - 1]);
      if (prevNode) fitView({ nodes: [prevNode], padding: 1.5, duration: 600, maxZoom: 1.2 });
    }
  }, [nodesRef, setNodes, setEdges, fitView]);

  const exitStepMode = useCallback(() => {
    setStepMode(false);
    setNodes(prev => prev.map(n => ({
      ...n,
      style: { ...n.style, opacity: 1, transition: 'opacity 0.5s ease' },
    })));
    setEdges(prev => prev.map(e => ({ ...e, hidden: false })));
    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
  }, [setNodes, setEdges, fitView]);

  // Keyboard shortcuts: Space/Right = next, Backspace/Left = prev, Esc = exit
  useEffect(() => {
    if (!stepMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); stepForward(); }
      else if (e.key === 'Backspace' || e.key === 'ArrowLeft') { e.preventDefault(); stepBack(); }
      else if (e.key === 'Escape') { e.preventDefault(); exitStepMode(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stepMode, stepForward, stepBack, exitStepMode]);

  return {
    stepMode,
    stepIndex,
    stepOrderRef,
    enterStepMode,
    stepForward,
    stepBack,
    exitStepMode,
  };
}
