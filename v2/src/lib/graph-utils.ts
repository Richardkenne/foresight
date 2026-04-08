import dagre from 'dagre';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import type { TemplateNode, TemplateEdge } from '@/lib/templates';

// Dagre layout
export function getLayoutedElements(
  nodes: RFNode[],
  edges: RFEdge[],
  direction: 'LR' | 'TB' = 'LR'
): { nodes: RFNode[]; edges: RFEdge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  const isVertical = direction === 'TB';
  g.setGraph({
    rankdir: direction,
    nodesep: isVertical ? 120 : 140,
    ranksep: isVertical ? 180 : 250,
    edgesep: isVertical ? 40 : 50,
  });

  nodes.forEach((node) => {
    const isContext = node.type === 'contextNode';
    const data = node.data as Record<string, unknown>;
    // Estimate height based on content: sources add ~120px, desc adds ~40px
    const hasSource = data.source && String(data.source).includes(':');
    const hasDesc = !!data.desc;
    const baseH = 100;
    const h = isContext ? 180 : baseH + (hasDesc ? 40 : 0) + (hasSource ? 120 : 0);
    // In vertical mode, use fixed width so dagre centers children properly
    const w = isContext ? 220 : (isVertical ? 240 : 210);
    g.setNode(node.id, { width: w, height: isVertical ? 80 : h });
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
        x: nodeWithPosition.x - (isVertical ? 120 : 85),
        y: nodeWithPosition.y - 50,
      },
      data: {
        ...(node.data as Record<string, unknown>),
        direction,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

// Remove orphan nodes: keep only nodes reachable from start nodes (BFS)
function removeOrphanNodes(
  nodes: RFNode[],
  edges: RFEdge[]
): { nodes: RFNode[]; edges: RFEdge[] } {
  if (nodes.length === 0) return { nodes, edges };

  // Build adjacency (undirected — we want connected components)
  const adj = new Map<string, Set<string>>();
  for (const n of nodes) adj.set(n.id, new Set());
  for (const e of edges) {
    adj.get(e.source)?.add(e.target);
    adj.get(e.target)?.add(e.source);
  }

  // Find start nodes (no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const startNodes = nodes.filter(n => !hasIncoming.has(n.id));
  // If no clear start, use first node
  const seeds = startNodes.length > 0 ? startNodes : [nodes[0]];

  // BFS from seeds
  const visited = new Set<string>();
  const queue = seeds.map(n => n.id);
  for (const id of queue) visited.add(id);
  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adj.get(current);
    if (!neighbors) continue;
    for (const neighbor of Array.from(neighbors)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // Filter
  const filteredNodes = nodes.filter(n => visited.has(n.id));
  const filteredEdges = edges.filter(e => visited.has(e.source) && visited.has(e.target));

  return { nodes: filteredNodes, edges: filteredEdges };
}

// Convert template data to React Flow format
export function templateToFlow(
  templateNodes: TemplateNode[],
  templateEdges: TemplateEdge[],
  context?: { photoUrl?: string; scenario?: string },
  direction: 'LR' | 'TB' = 'LR'
) {
  // Merge adjacent desire → action pairs into a single node
  const mergedNodeIds = new Set<number>();
  const mergeMap = new Map<number, TemplateNode>(); // desire id → merged with action

  for (const n of templateNodes) {
    if (n.type !== 'desire') continue;
    // Find outgoing edge from this desire
    const outEdges = templateEdges.filter(e => e.from === n.id);
    if (outEdges.length !== 1) continue;
    const targetId = outEdges[0].to;
    const targetNode = templateNodes.find(t => t.id === targetId);
    if (!targetNode || targetNode.type !== 'action') continue;
    // Check action has no other incoming edges
    const incomingToAction = templateEdges.filter(e => e.to === targetId);
    if (incomingToAction.length !== 1) continue;
    // Merge: keep desire node, absorb action label
    mergeMap.set(n.id, targetNode);
    mergedNodeIds.add(targetId);
  }

  const rfNodes: RFNode[] = templateNodes
    .filter(n => !mergedNodeIds.has(n.id))
    .map((n) => {
      const merged = mergeMap.get(n.id);
      const label = merged ? `${n.label} → ${merged.label}` : n.label;
      const desc = merged ? (merged.desc ? `${n.desc || ''} ${merged.desc}`.trim() : n.desc) : n.desc;
      const source = merged ? (merged.source || n.source) : n.source;
      return {
        id: String(n.id),
        type: 'simNode',
        position: { x: n.x, y: n.y },
        data: {
          label,
          nodeType: n.type,
          desc,
          source,
          prob: n.prob,
          probRange: (n as unknown as Record<string, unknown>).probRange as { optimistic: number; adverse: number } | undefined,
          time: merged?.time || n.time,
          sacredRoots: n.sacredRoots || (merged as TemplateNode | undefined)?.sacredRoots,
          sourceUrl: n.sourceUrl || (merged as TemplateNode | undefined)?.sourceUrl,
        },
      };
    });

  // Reroute edges: skip merged action nodes
  const rerouteEdges = (edges: TemplateEdge[]): TemplateEdge[] => {
    return edges
      .map(e => {
        // Reroute edges FROM merged action to come FROM desire instead
        if (mergedNodeIds.has(e.from)) {
          const desireId = [...mergeMap.entries()].find(([, v]) => v.id === e.from)?.[0];
          return desireId != null ? { ...e, from: desireId } : e;
        }
        return e;
      })
      // Remove desire→action edge (now desire→desire after reroute, or original)
      .filter(e => !(mergeMap.has(e.from) && mergedNodeIds.has(e.to)));
  };

  const adjustedEdges = rerouteEdges(templateEdges);

  const isVertical = direction === 'TB';
  const rfEdges: RFEdge[] = adjustedEdges.map((e, i) => {
    const lbl = (e.label || '').toLowerCase();
    const isPass = lbl === 'pass' || lbl === 'yes' || lbl.startsWith('yes') || lbl.startsWith('pass');
    const isFail = lbl === 'fail' || lbl === 'no' || lbl.startsWith('no') || lbl.startsWith('fail');
    const isPartial = lbl === 'partial' || lbl.startsWith('partial');
    return {
      id: `e-${e.from}-${e.to}-${i}`,
      source: String(e.from),
      target: String(e.to),
      sourceHandle: isVertical ? 'bottom' : undefined,
      targetHandle: isVertical ? 'top' : undefined,
      label: e.label || '',
      type: isVertical ? 'smoothstep' : 'animated',
      style: {
        stroke: isFail ? '#fca5a5' : isPartial ? '#fbbf24' : isPass ? '#4ade80' : '#a1a1aa',
        strokeWidth: isPass ? 4.5 : isPartial ? 3 : isFail ? 1.5 : 2.5,
        borderRadius: isVertical ? 8 : undefined,
      },
      labelStyle: {
        fill: isFail ? '#ef4444' : isPartial ? '#d97706' : isPass ? '#10b981' : '#a1a1aa',
      },
      data: e.label === 'partial' ? { prob: (e as unknown as Record<string, unknown>).prob } : undefined,
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

  // Remove orphan nodes before layout
  const cleaned = removeOrphanNodes(rfNodes, rfEdges);
  return getLayoutedElements(cleaned.nodes, cleaned.edges, direction);
}
