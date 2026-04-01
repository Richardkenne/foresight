import { useRef, useState, useCallback } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

interface HistoryState {
  nodes: RFNode[];
  edges: RFEdge[];
}

const MAX_HISTORY = 20;

export function useUndoRedo() {
  const historyRef = useRef<HistoryState[]>([]);
  const indexRef = useRef(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const syncFlags = useCallback(() => {
    setCanUndo(indexRef.current > 0);
    setCanRedo(indexRef.current < historyRef.current.length - 1);
  }, []);

  const pushState = useCallback((state: HistoryState) => {
    // Discard any redo states ahead of current index
    historyRef.current = historyRef.current.slice(0, indexRef.current + 1);

    // Deep-copy to avoid mutation issues
    historyRef.current.push({
      nodes: state.nodes.map(n => ({ ...n })),
      edges: state.edges.map(e => ({ ...e })),
    });

    // Trim to max
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(historyRef.current.length - MAX_HISTORY);
    }

    indexRef.current = historyRef.current.length - 1;
    syncFlags();
  }, [syncFlags]);

  const undo = useCallback((): HistoryState | null => {
    if (indexRef.current <= 0) return null;
    indexRef.current--;
    syncFlags();
    return historyRef.current[indexRef.current];
  }, [syncFlags]);

  const redo = useCallback((): HistoryState | null => {
    if (indexRef.current >= historyRef.current.length - 1) return null;
    indexRef.current++;
    syncFlags();
    return historyRef.current[indexRef.current];
  }, [syncFlags]);

  return { undo, redo, canUndo, canRedo, pushState };
}
