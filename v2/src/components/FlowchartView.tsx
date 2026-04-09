'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

const elk = new ELK();

// Node type → visual config
const NODE_STYLES: Record<string, { bg: string; border: string; shape: 'rect' | 'diamond' | 'rounded' | 'pill' }> = {
  state:          { bg: 'var(--node-state-bg, #d8ead8)', border: 'var(--node-state-accent, #5f7d63)', shape: 'rect' },
  action:         { bg: 'var(--node-action-bg, #eff6ff)', border: 'var(--accent)', shape: 'rect' },
  desire:         { bg: 'var(--node-desire-bg, #f5f3ff)', border: 'var(--purple)', shape: 'rect' },
  bottleneck:     { bg: 'var(--node-bottleneck-bg, #fffbeb)', border: 'var(--warning)', shape: 'diamond' },
  gate:           { bg: 'var(--node-gate-bg, #fffbeb)', border: 'var(--warning-hover, #d97706)', shape: 'diamond' },
  decision:       { bg: 'var(--node-decision-bg)', border: 'var(--node-decision-accent)', shape: 'diamond' },
  trajectory:     { bg: 'var(--node-trajectory-bg, #efe2fb)', border: 'var(--node-trajectory-accent, #7f5aa6)', shape: 'rect' },
  'outcome-good': { bg: 'var(--node-good-bg, #dcfce7)', border: 'var(--success)', shape: 'rounded' },
  'outcome-bad':  { bg: 'var(--node-bad-bg, #fee2e2)', border: 'var(--danger)', shape: 'rounded' },
  loop:           { bg: 'var(--surface-hover)', border: 'var(--muted-foreground)', shape: 'rect' },
};

interface LayoutNode {
  id: string;
  label: string;
  nodeType: string;
  prob?: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sections?: Array<{ startPoint: { x: number; y: number }; endPoint: { x: number; y: number }; bendPoints?: Array<{ x: number; y: number }> }>;
}

interface FlowchartViewProps {
  nodes: RFNode[];
  edges: RFEdge[];
  onNodeClick?: (nodeId: string) => void;
}

export default function FlowchartView({ nodes, edges, onNodeClick }: FlowchartViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);
  const [layoutEdges, setLayoutEdges] = useState<LayoutEdge[]>([]);
  const [viewBox, setViewBox] = useState('0 0 800 600');
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Run ELK layout
  useEffect(() => {
    if (nodes.length === 0) return;

    const elkGraph = {
      id: 'root',
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '140',
        'elk.layered.spacing.nodeNodeBetweenLayers': '160',
        'elk.layered.spacing.edgeNodeBetweenLayers': '60',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      },
      children: nodes.filter(n => n.type !== 'contextNode').map(n => {
        const d = n.data as Record<string, unknown>;
        const nodeType = (d.nodeType as string) || 'action';
        const isDiamond = nodeType === 'bottleneck' || nodeType === 'gate' || nodeType === 'decision';
        return {
          id: n.id,
          width: isDiamond ? 160 : 200,
          height: isDiamond ? 80 : 50,
          labels: [{ text: (d.label as string) || '' }],
          properties: { nodeType, prob: d.prob },
        };
      }),
      edges: edges.map((e, i) => ({
        id: `e${i}`,
        sources: [e.source],
        targets: [e.target],
        labels: e.label ? [{ text: String(e.label) }] : [],
      })),
    };

    elk.layout(elkGraph).then((result) => {
      const ln: LayoutNode[] = (result.children || []).map(c => ({
        id: c.id,
        label: c.labels?.[0]?.text || '',
        nodeType: (c.properties as Record<string, unknown>)?.nodeType as string || 'action',
        prob: (c.properties as Record<string, unknown>)?.prob as number | undefined,
        x: c.x || 0,
        y: c.y || 0,
        width: c.width || 200,
        height: c.height || 50,
      }));

      const le: LayoutEdge[] = (result.edges || []).map((e) => ({
        id: e.id,
        source: (e.sources as string[])[0],
        target: (e.targets as string[])[0],
        label: e.labels?.[0]?.text,
        sections: (e as unknown as Record<string, unknown>).sections as LayoutEdge['sections'],
      }));

      setLayoutNodes(ln);
      setLayoutEdges(le);

      // Calculate viewBox
      if (ln.length > 0) {
        const maxX = Math.max(...ln.map(n => n.x + n.width)) + 40;
        const maxY = Math.max(...ln.map(n => n.y + n.height)) + 40;
        setViewBox(`-20 -20 ${maxX + 20} ${maxY + 20}`);
      }
    });
  }, [nodes, edges]);

  // Zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(3, Math.max(0.2, s * delta)));
  }, []);

  // Pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  // Map node opacity from React Flow nodes (for step mode)
  const nodeOpacity: Record<string, number> = {};
  for (const rfNode of nodes) {
    nodeOpacity[rfNode.id] = (rfNode.style?.opacity as number) ?? 1;
  }

  // Map edge hidden state from React Flow edges (for step mode)
  const edgeHidden: Record<string, boolean> = {};
  for (const rfEdge of edges) {
    edgeHidden[`${rfEdge.source}-${rfEdge.target}`] = rfEdge.hidden ?? false;
  }

  // Render node shape
  const renderNode = (n: LayoutNode) => {
    const opacity = nodeOpacity[n.id] ?? 1;
    const style = NODE_STYLES[n.nodeType] || NODE_STYLES.action;
    const cx = n.x + n.width / 2;
    const cy = n.y + n.height / 2;
    const hasProb = n.nodeType === 'bottleneck' || n.nodeType === 'gate' || n.nodeType === 'decision';

    return (
      <g key={n.id} onClick={() => onNodeClick?.(n.id)} style={{ cursor: 'pointer', opacity, transition: 'opacity 0.5s ease' }}>
        {style.shape === 'diamond' ? (
          <polygon
            points={`${cx},${cy - n.height / 2 - 10} ${cx + n.width / 2 + 10},${cy} ${cx},${cy + n.height / 2 + 10} ${cx - n.width / 2 - 10},${cy}`}
            fill={style.bg} stroke={style.border} strokeWidth={1.5}
          />
        ) : style.shape === 'rounded' ? (
          <rect
            x={n.x} y={n.y} width={n.width} height={n.height}
            rx={20} ry={20}
            fill={style.bg} stroke={style.border} strokeWidth={1.5}
          />
        ) : (
          <rect
            x={n.x} y={n.y} width={n.width} height={n.height}
            rx={6} ry={6}
            fill={style.bg} stroke={style.border} strokeWidth={1.5}
          />
        )}
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fontSize={11} fontWeight={600} fontFamily="Inter, system-ui, sans-serif"
          fill="var(--foreground)"
        >
          {n.label.length > 30 ? (
            <>
              <tspan x={cx} dy="-0.4em">{n.label.substring(0, 28)}</tspan>
              <tspan x={cx} dy="1.2em">{n.label.substring(28, 56)}{n.label.length > 56 ? '...' : ''}</tspan>
            </>
          ) : n.label}
        </text>
        {hasProb && n.prob !== undefined && (
          <g>
            <circle cx={n.x + n.width - 5} cy={n.y + 5} r={14} fill={n.prob < 30 ? 'var(--danger)' : n.prob < 60 ? 'var(--warning)' : 'var(--success)'} opacity={0.9} />
            <text x={n.x + n.width - 5} y={n.y + 5} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fill="var(--surface)" fontFamily="Inter, system-ui, sans-serif">
              {n.prob}%
            </text>
          </g>
        )}
      </g>
    );
  };

  // Render edge
  const renderEdge = (e: LayoutEdge) => {
    if (!e.sections || e.sections.length === 0) return null;
    const hidden = edgeHidden[`${e.source}-${e.target}`] ?? false;
    if (hidden) return null;
    const section = e.sections[0];
    const points = [section.startPoint, ...(section.bendPoints || []), section.endPoint];
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <g key={e.id}>
        <path d={d} fill="none" stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#arrowhead)" />
        {e.label && (() => {
          const mid = points[Math.floor(points.length / 2)];
          return (
            <g>
              <rect x={mid.x - 30} y={mid.y - 9} width={60} height={18} rx={4} fill="var(--surface)" stroke="var(--border)" strokeWidth={0.5} />
              <text x={mid.x} y={mid.y} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={500} fill="var(--muted-foreground)" fontFamily="Inter, system-ui, sans-serif">
                {String(e.label).replace(/%/g, 'pct').substring(0, 15)}
              </text>
            </g>
          );
        })()}
      </g>
    );
  };

  if (nodes.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 relative"
      style={{ background: 'var(--surface)', overflow: 'hidden', cursor: dragging ? 'grabbing' : 'grab' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        viewBox={viewBox}
        style={{
          width: '100%',
          height: '100%',
          transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--muted)" />
          </marker>
        </defs>
        {layoutEdges.map(renderEdge)}
        {layoutNodes.map(renderNode)}
      </svg>
    </div>
  );
}
