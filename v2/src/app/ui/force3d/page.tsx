'use client';

import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

// Full cafe scenario with rich data (like our SimNode cards)
const GRAPH_DATA = {
  nodes: [
    {
      id: '1', type: 'state', label: 'Person with coffee passion',
      desc: 'You have desire but no capital, no location, no customers.',
      source: 'Bible: Proverbs 21:20', prob: 100, time: 'Day 1',
    },
    {
      id: '2', type: 'desire', label: 'Want to start a coffee business',
      desc: 'Global coffee market: $495B. Specialty coffee is 55% of US market.',
      source: 'Statista 2025 | SCA 2024', prob: 100, time: '1-7 days',
    },
    {
      id: '3', type: 'bottleneck', label: 'Choose business model',
      desc: 'Coffee cart: $16K-$50K. Kiosk: $50K-$150K. Full cafe: $150K-$300K.',
      source: 'SCA 2024 | Toast 2024', prob: 85, time: '7-14 days',
    },
    {
      id: '4', type: 'state', label: 'Model chosen: Coffee cart',
      desc: 'Lowest capital path. High mobility, low overhead. $16K-$50K startup.',
      source: 'Bible: Luke 14:28', prob: 100, time: 'Day 14',
    },
    {
      id: '5', type: 'state', label: 'Model chosen: Full cafe',
      desc: 'Higher risk, higher reward. $150K-$300K. Need lease, buildout, staff.',
      source: 'IBISWorld 2024', prob: 100, time: 'Day 14',
    },
    {
      id: '6', type: 'bottleneck', label: 'Secure startup capital?',
      desc: 'SBA: 71% loan denial rate. Online lenders approve 56%. Need $16K-$50K.',
      source: 'SBA 2024', prob: 62, time: '30-90 days',
    },
    {
      id: '7', type: 'bottleneck', label: 'Secure startup capital?',
      desc: 'Need $150K-$300K. SBA loans, investors, or family. Much harder to raise.',
      source: 'SBA 2024', prob: 38, time: '60-180 days',
    },
    {
      id: '8', type: 'action', label: 'Find location & permits',
      desc: 'High-traffic spot. Health permit, business license, parking permit.',
      source: 'Square Coffee Data 2024', prob: 100, time: '14-30 days',
    },
    {
      id: '9', type: 'action', label: 'Lease, buildout & hiring',
      desc: 'Commercial lease negotiation. Kitchen buildout 2-4 months. Hire 3-5 staff.',
      source: 'SCA 2024', prob: 100, time: '60-120 days',
    },
    {
      id: '10', type: 'bottleneck', label: 'Location approved?',
      desc: 'Health permits: 85% if compliant. Parking permits: 60% by city.',
      source: 'City Permits 2024', prob: 72, time: '14-45 days',
    },
    {
      id: '11', type: 'bottleneck', label: 'Buildout complete?',
      desc: 'Construction delays, permit issues, equipment delivery. 30% face 2+ month delays.',
      source: 'NRA 2024', prob: 55, time: '90-180 days',
    },
    {
      id: '12', type: 'gate', label: 'Reach breakeven in 6 months?',
      desc: 'Need 500-800 cups/month at $6-$8. Cart breakeven: $4K-$6K/month.',
      source: 'BLS 2024 | Square 2024', prob: 58, time: '180 days',
    },
    {
      id: '13', type: 'gate', label: 'Reach breakeven in 12 months?',
      desc: 'Full cafe needs $15K-$25K/month revenue. Avg cafe: 18 months to profit.',
      source: 'BLS 2024 | Toast 2024', prob: 35, time: '365 days',
    },
    {
      id: 'win1', type: 'outcome-good', label: 'Cart profitable - scaling',
      desc: 'Monthly revenue: $4K-$8K. Profit margin: 30-40%. Next: second cart or kiosk.',
      source: 'SCA 2024', prob: 58, time: 'Month 6+',
    },
    {
      id: 'win2', type: 'outcome-good', label: 'Cafe profitable - growing',
      desc: 'Monthly revenue: $20K-$40K. Profit margin: 10-15%. Brand established.',
      source: 'Toast 2024', prob: 35, time: 'Year 2+',
    },
    {
      id: 'fail1', type: 'outcome-bad', label: 'Capital not secured',
      desc: 'Loan denied, savings insufficient. 38% never launch due to capital.',
      source: 'SBA 2024', prob: 38, time: 'Month 3',
    },
    {
      id: 'fail2', type: 'outcome-bad', label: 'Capital not secured',
      desc: '$150K+ is extremely hard to raise for first-time founders. 62% fail here.',
      source: 'SBA 2024', prob: 62, time: 'Month 6',
    },
    {
      id: 'fail3', type: 'outcome-bad', label: 'Permits denied / no location',
      desc: 'Health dept rejected. City denied permit. 28% face regulatory barriers.',
      source: 'City Permits 2024', prob: 28, time: 'Month 2-3',
    },
    {
      id: 'fail4', type: 'outcome-bad', label: 'Buildout failed',
      desc: 'Construction over budget, lease fell through, ran out of runway.',
      source: 'NRA 2024', prob: 45, time: 'Month 4-6',
    },
    {
      id: 'fail5', type: 'outcome-bad', label: 'Failed to reach breakeven',
      desc: 'Sales below $4K/month. Poor location or execution. Lost $10K-$25K.',
      source: 'BLS 2024', prob: 42, time: 'Month 6',
    },
    {
      id: 'fail6', type: 'outcome-bad', label: 'Cafe closed - losses',
      desc: 'Revenue never covered costs. Lost $100K-$200K. 65% of cafes fail by year 3.',
      source: 'BLS 2024 | Toast 2024', prob: 65, time: 'Year 1-2',
    },
  ],
  links: [
    { source: '1', target: '2', label: '' },
    { source: '2', target: '3', label: '' },
    { source: '3', target: '4', label: 'Cart path' },
    { source: '3', target: '5', label: 'Cafe path' },
    { source: '4', target: '6', label: '' },
    { source: '5', target: '7', label: '' },
    { source: '6', target: '8', label: 'pass (62%)' },
    { source: '6', target: 'fail1', label: 'fail (38%)' },
    { source: '7', target: '9', label: 'pass (38%)' },
    { source: '7', target: 'fail2', label: 'fail (62%)' },
    { source: '8', target: '10', label: '' },
    { source: '9', target: '11', label: '' },
    { source: '10', target: '12', label: 'yes (72%)' },
    { source: '10', target: 'fail3', label: 'no (28%)' },
    { source: '11', target: '13', label: 'yes (55%)' },
    { source: '11', target: 'fail4', label: 'no (45%)' },
    { source: '12', target: 'win1', label: 'yes (58%)' },
    { source: '12', target: 'fail5', label: 'no (42%)' },
    { source: '13', target: 'win2', label: 'yes (35%)' },
    { source: '13', target: 'fail6', label: 'no (65%)' },
  ],
};

const TYPE_CONFIG: Record<string, { color: string; border: string; icon: string }> = {
  'state':        { color: '#1e3a5f', border: '#3b82f6', icon: 'S' },
  'desire':       { color: '#1e293b', border: '#64748b', icon: 'D' },
  'action':       { color: '#1e293b', border: '#64748b', icon: 'A' },
  'bottleneck':   { color: '#2d1b4e', border: '#a78bfa', icon: 'B' },
  'gate':         { color: '#3d2e0a', border: '#fbbf24', icon: 'G' },
  'outcome-good': { color: '#0a3d2e', border: '#34d399', icon: 'W' },
  'outcome-bad':  { color: '#3d0a0a', border: '#f87171', icon: 'X' },
};

export default function Force3DPage() {
  const fgRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Build Three.js objects for each node (HTML-like cards via CSS2D or Sprite)
  const nodeThreeObject = useCallback((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const THREE = require('three');
    const { CSS2DObject } = require('three/examples/jsm/renderers/CSS2DRenderer');

    const cfg = TYPE_CONFIG[node.type] || TYPE_CONFIG.state;

    const el = document.createElement('div');
    el.style.cssText = `
      background: ${cfg.color};
      border: 1.5px solid ${cfg.border};
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 180px;
      max-width: 220px;
      font-family: system-ui, -apple-system, sans-serif;
      color: var(--border);
      pointer-events: auto;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 20px ${cfg.border}30;
      transition: box-shadow 0.2s, transform 0.2s;
    `;

    // Type badge + prob
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';

    const badge = document.createElement('span');
    badge.style.cssText = `font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${cfg.border}25;color:${cfg.border};text-transform:uppercase;letter-spacing:0.05em;`;
    badge.textContent = node.type;
    header.appendChild(badge);

    if (node.prob < 100) {
      const prob = document.createElement('span');
      prob.style.cssText = `font-size:12px;font-weight:800;color:${cfg.border};`;
      prob.textContent = `${node.prob}%`;
      header.appendChild(prob);
    }
    el.appendChild(header);

    // Label
    const label = document.createElement('div');
    label.style.cssText = 'font-size:12px;font-weight:700;line-height:1.3;margin-bottom:4px;color:var(--surface-hover);';
    label.textContent = node.label;
    el.appendChild(label);

    // Description
    if (node.desc) {
      const desc = document.createElement('div');
      desc.style.cssText = 'font-size:10px;line-height:1.4;color:var(--muted);margin-bottom:4px;';
      desc.textContent = node.desc;
      el.appendChild(desc);
    }

    // Source + time
    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;';

    if (node.source) {
      const src = document.createElement('span');
      src.style.cssText = 'font-size:8px;color:var(--muted-foreground);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      src.textContent = node.source;
      footer.appendChild(src);
    }
    if (node.time) {
      const time = document.createElement('span');
      time.style.cssText = 'font-size:8px;color:var(--muted-foreground);white-space:nowrap;';
      time.textContent = node.time;
      footer.appendChild(time);
    }
    el.appendChild(footer);

    // Hover effect
    el.addEventListener('mouseenter', () => {
      el.style.boxShadow = `0 0 40px ${cfg.border}60`;
      el.style.transform = 'scale(1.05)';
    });
    el.addEventListener('mouseleave', () => {
      el.style.boxShadow = `0 0 20px ${cfg.border}30`;
      el.style.transform = 'scale(1)';
    });

    const obj = new CSS2DObject(el);
    obj.layers.set(0);
    return obj;
  }, []);

  // Need to add CSS2DRenderer
  useEffect(() => {
    if (!fgRef.current || !mounted) return;
    const fg = fgRef.current;

    try {
      const { CSS2DRenderer } = require('three/examples/jsm/renderers/CSS2DRenderer');
      const cssRenderer = new CSS2DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      cssRenderer.domElement.style.top = '0px';
      cssRenderer.domElement.style.pointerEvents = 'none';

      // Find the container and append
      const container = fg.renderer().domElement.parentElement;
      if (container) {
        container.appendChild(cssRenderer.domElement);

        // Hook into render loop
        const origRender = fg.renderer().render.bind(fg.renderer());
        const scene = fg.scene();
        const camera = fg.camera();

        const animate = () => {
          cssRenderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();

        // Handle resize
        const onResize = () => cssRenderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }
    } catch (e) {
      console.warn('CSS2DRenderer not available, using default labels:', e);
    }
  }, [mounted]);

  // Set camera after load
  useEffect(() => {
    if (!fgRef.current || !mounted) return;
    setTimeout(() => {
      fgRef.current?.cameraPosition({ x: 0, y: 0, z: 500 }, { x: 0, y: 0, z: 0 }, 1500);
    }, 800);
  }, [mounted]);

  const handleNodeClick = useCallback((node: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!fgRef.current) return;
    const distance = 200;
    const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
    fgRef.current.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      node,
      1000
    );
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', fontFamily: 'system-ui' }}>
        Loading 3D Foresight...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#060810', position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px 24px',
        background: 'linear-gradient(180deg, #060810 0%, #06081000 100%)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'system-ui',
      }}>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--border)', letterSpacing: '-0.02em', margin: 0 }}>
            Foresight — 3D Mode
          </h1>
          <p style={{ fontSize: 11, color: 'var(--muted-foreground)', margin: '2px 0 0' }}>
            Open a Cafe in Bandung — 21 nodes, full decision tree with sources
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/sim" style={{
            padding: '6px 14px', background: 'var(--foreground)', color: 'var(--muted)', borderRadius: 8,
            fontSize: 'var(--text-sm)', textDecoration: 'none', border: '1px solid var(--muted-foreground)',
          }}>
            2D Mode
          </a>
          <span style={{
            padding: '6px 14px', background: 'color-mix(in srgb, var(--accent) 8%, transparent)', color: 'var(--accent)', borderRadius: 8,
            fontSize: 'var(--text-sm)', border: '1px solid color-mix(in srgb, var(--accent) 19%, transparent)',
          }}>
            3D Mode
          </span>
        </div>
      </div>

      {/* Controls hint */}
      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', gap: 20, fontFamily: 'system-ui', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)',
      }}>
        <span>Drag to rotate</span>
        <span>Scroll to zoom</span>
        <span>Click node to focus</span>
        <span>Right-drag to pan</span>
      </div>

      {/* Stats */}
      <div style={{
        position: 'absolute', bottom: 20, right: 24, zIndex: 10,
        fontFamily: 'system-ui', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)',
      }}>
        21 nodes / 20 edges / 350K+ data points
      </div>

      <ForceGraph3D
        ref={fgRef}
        graphData={GRAPH_DATA}
        backgroundColor="#060810"
        dagMode="td"
        dagLevelDistance={80}
        // Use custom Three.js objects (cards)
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        // Hide default node rendering
        nodeOpacity={0}
        nodeResolution={1}
        // Link styling
        linkColor={(link: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const lbl = (link.label || '').toLowerCase();
          if (lbl.includes('fail') || lbl.includes('no')) return '#f8717140';
          if (lbl.includes('pass') || lbl.includes('yes')) return '#34d39950';
          return '#33415540';
        }}
        linkWidth={(link: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const lbl = (link.label || '').toLowerCase();
          if (lbl.includes('pass') || lbl.includes('yes')) return 3;
          if (lbl.includes('fail') || lbl.includes('no')) return 1;
          return 2;
        }}
        linkOpacity={0.5}
        linkCurvature={0.15}
        // Directional particles
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const lbl = (link.label || '').toLowerCase();
          if (lbl.includes('fail') || lbl.includes('no')) return '#f87171';
          if (lbl.includes('pass') || lbl.includes('yes')) return '#34d399';
          return '#60a5fa';
        }}
        // Link labels
        linkLabel={(link: any) => link.label ? `<span style="color:var(--muted);font-size:11px;font-family:system-ui;background:var(--foreground);padding:2px 8px;border-radius:4px">${link.label}</span>` : ''} // eslint-disable-line @typescript-eslint/no-explicit-any
        // Interaction
        onNodeClick={handleNodeClick}
        // Performance
        warmupTicks={100}
        cooldownTicks={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
}
