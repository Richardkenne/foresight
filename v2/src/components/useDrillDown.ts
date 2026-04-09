import { useCallback, useRef, useState } from 'react';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { templateToFlow } from '@/lib/graph-utils';
import type { TemplateNode } from '@/lib/templates';
import type { ContextTags } from '@/lib/context-tags';
import type { UserProfile } from '@/lib/user-profile';
import { toast } from './ui/Toast';
import { sounds } from '@/lib/sounds';

// Recursive drill-down: each level stores the graph + context needed to restore it
export interface SimLevel {
  nodes: RFNode[];
  edges: RFEdge[];
  scenario: string;
  parentNodeLabel: string;
  depth: number;
  flowData: Record<string, unknown> | null;
}

// Background colors per drill-down depth
export const DEPTH_BG_COLORS = [
  'var(--background)',
  'color-mix(in srgb, var(--background) 96%, var(--accent) 4%)',
  'color-mix(in srgb, var(--background) 92%, var(--purple) 8%)',
  'color-mix(in srgb, var(--background) 88%, var(--sacred-accent) 12%)',
];

export interface UseDrillDownParams {
  nodesRef: React.MutableRefObject<RFNode[]>;
  edgesRef: React.MutableRefObject<RFEdge[]>;
  setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
  fitView: (opts?: Record<string, unknown>) => void;
  scenario: string;
  setScenario: (s: string) => void;
  lastFlowData: Record<string, unknown> | null;
  setLastFlowData: (d: Record<string, unknown> | null) => void;
  sacredMode: boolean;
  layoutDirection: 'LR' | 'TB';
  contextTagsRef: React.MutableRefObject<ContextTags>;
  profileRef: React.MutableRefObject<UserProfile>;
  generating: boolean;
  // Simulation controls
  stopSim: () => void;
  setShowDashboard: (v: boolean) => void;
  setParticles: (p: never[]) => void;
  particlesRef: React.MutableRefObject<unknown[]>;
  statsRef: React.MutableRefObject<{ total: number; success: number; blocked: number }>;
  setSimStats: (s: { total: number; success: number; blocked: number }) => void;
  simRunningRef: React.MutableRefObject<boolean>;
  requestSimulate: () => void;
}

export function useDrillDown({
  nodesRef,
  edgesRef,
  setNodes,
  setEdges,
  fitView,
  scenario,
  setScenario,
  lastFlowData,
  setLastFlowData,
  sacredMode,
  layoutDirection,
  contextTagsRef,
  profileRef,
  generating,
  stopSim,
  setShowDashboard,
  setParticles,
  particlesRef,
  statsRef,
  setSimStats,
  simRunningRef,
  requestSimulate,
}: UseDrillDownParams) {
  const [simStack, setSimStack] = useState<SimLevel[]>([]);
  const [drillLoading, setDrillLoading] = useState<string | null>(null);
  const currentDepth = simStack.length;
  const drillBackRef = useRef<() => void>(() => {});

  // Drill into a node
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
        ? simStack[0].scenario
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

      setSimStack(prev => [...prev, currentLevel]);

      statsRef.current = { total: 0, success: 0, blocked: 0 };
      setSimStats({ total: 0, success: 0, blocked: 0 });
      stopSim();
      setShowDashboard(false);
      particlesRef.current = [];
      setParticles([] as never[]);

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
  }, [currentDepth, scenario, simStack, lastFlowData, sacredMode, layoutDirection, setNodes, setEdges, fitView, nodesRef, edgesRef, contextTagsRef, profileRef, stopSim, setShowDashboard, setParticles, particlesRef, statsRef, setSimStats, simRunningRef, setLastFlowData, setScenario, requestSimulate]);

  // Go back one level
  const drillBack = useCallback(() => {
    if (simStack.length === 0) return;

    const prev = simStack[simStack.length - 1];

    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([] as never[]);

    setNodes(prev.nodes);
    setEdges(prev.edges);
    setScenario(prev.scenario);
    setLastFlowData(prev.flowData);
    setSimStack(s => s.slice(0, -1));
    sounds.click();

    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
  }, [simStack, setNodes, setEdges, fitView, stopSim, setShowDashboard, setParticles, particlesRef, statsRef, setSimStats, setScenario, setLastFlowData]);

  // Keep drillBackRef in sync
  drillBackRef.current = drillBack;

  // Go back to a specific level
  const drillBackToLevel = useCallback((targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= simStack.length) {
      if (simStack.length > 0) {
        const root = simStack[0];
        statsRef.current = { total: 0, success: 0, blocked: 0 };
        setSimStats({ total: 0, success: 0, blocked: 0 });
        stopSim();
        setShowDashboard(false);
        particlesRef.current = [];
        setParticles([] as never[]);

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

    const target = simStack[targetIndex + 1];
    if (!target) return;

    statsRef.current = { total: 0, success: 0, blocked: 0 };
    setSimStats({ total: 0, success: 0, blocked: 0 });
    stopSim();
    setShowDashboard(false);
    particlesRef.current = [];
    setParticles([] as never[]);

    setNodes(target.nodes);
    setEdges(target.edges);
    setScenario(target.scenario);
    setLastFlowData(target.flowData);
    setSimStack(s => s.slice(0, targetIndex + 1));
    sounds.click();
    setTimeout(() => fitView({ padding: 0.3, duration: 400, maxZoom: 0.85 }), 100);
  }, [simStack, setNodes, setEdges, fitView, stopSim, setShowDashboard, setParticles, particlesRef, statsRef, setSimStats, setScenario, setLastFlowData]);

  // Double-click handler
  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: RFNode) => {
    if (simRunningRef.current || generating || drillLoading) return;
    drillIntoNode(node);
  }, [drillIntoNode, generating, drillLoading, simRunningRef]);

  return {
    simStack,
    drillLoading,
    currentDepth,
    drillBackRef,
    drillIntoNode,
    drillBack,
    drillBackToLevel,
    onNodeDoubleClick,
  };
}
