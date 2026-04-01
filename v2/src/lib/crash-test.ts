import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import type { TemplateNode, TemplateEdge } from '@/lib/templates';
import type { UserProfile } from '@/lib/user-profile';
import { getProfilePromptModifier } from '@/lib/user-profile';
import { templateToFlow } from '@/lib/graph-utils';
import { precomputeFates, type PrecomputedFate } from '@/lib/simulation-types';

/* ── Types ── */

export interface CrashTestStats {
  survivalRate: number;
  totalPeople: number;
  survivors: number;
  fatalGate: { nodeId: string; label: string; type: string; deaths: number; prob: number } | null;
  compoundProbability: number;
  topKillers: { nodeId: string; label: string; type: string; deaths: number; prob: number }[];
  pathLength: number;
  fates: PrecomputedFate[];
}

export interface CrashTestScenario {
  id: string;
  name: string;
  status: 'pending' | 'generating' | 'simulating' | 'done' | 'error';
  flowData?: { nodes: TemplateNode[]; edges: TemplateEdge[] };
  rfNodes?: RFNode[];
  rfEdges?: RFEdge[];
  stats?: CrashTestStats;
  error?: string;
}

/* ── Auto-label edges (extracted from SimulatorCanvas) ── */

export function autoLabelEdges(nodes: TemplateNode[], edges: TemplateEdge[]): TemplateEdge[] {
  const nodeTypeMap: Record<number, string> = {};
  for (const n of nodes) nodeTypeMap[n.id] = n.type;

  return edges.map(e => {
    if (e.label) return e;
    const srcType = nodeTypeMap[e.from];
    const tgtType = nodeTypeMap[e.to];
    if (srcType === 'bottleneck' || srcType === 'decision' || srcType === 'gate') {
      if (tgtType === 'outcome-bad') return { ...e, label: srcType === 'decision' ? 'no' : 'fail' };
      const siblings = edges.filter(s => s.from === e.from && s !== e);
      const siblingGoesToBad = siblings.some(s => nodeTypeMap[s.to] === 'outcome-bad');
      if (siblingGoesToBad) return { ...e, label: srcType === 'decision' ? 'yes' : 'pass' };
      if (srcType === 'gate' && tgtType === 'state') return { ...e, label: 'partial' };
    }
    return e;
  });
}

/* ── Compute stats from fates ── */

export function computeStats(
  fates: PrecomputedFate[],
  nodes: RFNode[],
): CrashTestStats {
  const total = fates.length;
  const survivors = fates.filter(f => f.outcome === 'success').length;

  // Count deaths per node
  const deathCounts: Record<string, number> = {};
  for (const f of fates) {
    if (f.deathNode) {
      deathCounts[f.deathNode] = (deathCounts[f.deathNode] || 0) + 1;
    }
  }

  // Build top killers list
  const killerEntries = Object.entries(deathCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nodeId, deaths]) => {
      const node = nodes.find(n => n.id === nodeId);
      const d = node?.data as Record<string, unknown> | undefined;
      return {
        nodeId,
        label: (d?.label as string) || nodeId,
        type: (d?.nodeType as string) || '',
        deaths,
        prob: (d?.prob as number) ?? 100,
      };
    });

  const fatalGate = killerEntries[0] || null;

  // Compound probability: multiply all gate/bottleneck probs along the success path
  const successFate = fates.find(f => f.outcome === 'success');
  let compound = 1;
  if (successFate) {
    for (const nodeId of successFate.path) {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) continue;
      const d = node.data as Record<string, unknown>;
      const nodeType = d.nodeType as string;
      const prob = d.prob as number;
      if ((nodeType === 'bottleneck' || nodeType === 'gate' || nodeType === 'decision') && typeof prob === 'number' && prob < 100) {
        compound *= prob / 100;
      }
    }
  } else {
    // No success path: estimate from node probs
    const gateNodes = nodes.filter(n => {
      const d = n.data as Record<string, unknown>;
      const t = d.nodeType as string;
      const p = d.prob as number;
      return (t === 'bottleneck' || t === 'gate' || t === 'decision') && typeof p === 'number' && p < 100;
    });
    for (const n of gateNodes) {
      compound *= ((n.data as Record<string, unknown>).prob as number) / 100;
    }
  }

  // Avg path length
  const avgPath = fates.reduce((s, f) => s + f.path.length, 0) / total;

  return {
    survivalRate: Math.round(survivors / total * 100),
    totalPeople: total,
    survivors,
    fatalGate,
    compoundProbability: Math.round(compound * 1000) / 10,
    topKillers: killerEntries,
    pathLength: Math.round(avgPath * 10) / 10,
    fates,
  };
}

/* ── Run a single scenario (generate + simulate) ── */

export async function runScenario(
  scenario: string,
  profile: UserProfile,
  sacredMode: boolean,
  signal?: AbortSignal,
): Promise<Omit<CrashTestScenario, 'id' | 'name'>> {
  // 1. Generate via API
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario,
      profile: { ...profile, _promptMod: getProfilePromptModifier(profile) },
      sacredMode,
    }),
    signal,
  });

  if (!res.ok) throw new Error(`Server error: ${res.status}`);
  const flow = await res.json();
  if (!flow.nodes || !flow.edges) throw new Error('Invalid flow data');

  // 2. Auto-label edges
  const tNodes: TemplateNode[] = flow.nodes.map((n: TemplateNode) => ({ ...n, source: n.source || 'AI generated' }));
  const tEdges = autoLabelEdges(tNodes, flow.edges as TemplateEdge[]);

  // 3. Convert to React Flow format (no context node for crash test)
  const { nodes: rfNodes, edges: rfEdges } = templateToFlow(tNodes, tEdges, undefined, 'LR');

  // 4. Find start node (skip contextNode)
  const hasIncoming = new Set(rfEdges.map(e => e.target));
  const startNodeIds = rfNodes
    .filter(n => n.type !== 'contextNode' && !hasIncoming.has(n.id))
    .map(n => n.id);

  if (startNodeIds.length === 0) throw new Error('No start node found');

  // 5. Pre-compute fates (100 people)
  const fates = precomputeFates(100, startNodeIds[0], rfNodes, rfEdges);

  // 6. Compute stats
  const stats = computeStats(fates, rfNodes);

  return {
    status: 'done',
    flowData: { nodes: tNodes, edges: tEdges },
    rfNodes,
    rfEdges,
    stats,
  };
}

/* ── Run all scenarios in parallel ── */

export async function runCrashTest(
  scenarios: { id: string; name: string }[],
  profile: UserProfile,
  sacredMode: boolean,
  onUpdate: (id: string, partial: Partial<CrashTestScenario>) => void,
  signal?: AbortSignal,
): Promise<void> {
  await Promise.allSettled(
    scenarios.map(async ({ id, name }) => {
      onUpdate(id, { status: 'generating' });
      try {
        const result = await runScenario(name, profile, sacredMode, signal);
        onUpdate(id, { ...result, status: 'done' });
      } catch (err) {
        onUpdate(id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    })
  );
}
