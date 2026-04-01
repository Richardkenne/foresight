'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { TemplateNode, TemplateEdge } from '@/lib/templates';
import { TEMPLATES } from '@/lib/templates';
import { loadProfile } from '@/lib/user-profile';
import { saveToHistory } from '@/lib/history';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

/* ── Type config ── */
const TYPE_CONFIG: Record<string, { color: string; border: string }> = {
  'state':        { color: '#0f1d2e', border: '#3b82f6' },
  'desire':       { color: '#1a1a2e', border: '#8b5cf6' },
  'action':       { color: '#1a1a2e', border: '#64748b' },
  'bottleneck':   { color: '#1e1028', border: '#a78bfa' },
  'gate':         { color: '#2a2008', border: '#fbbf24' },
  'decision':     { color: '#1a1a2e', border: '#64748b' },
  'trajectory':   { color: '#1a1a2e', border: '#475569' },
  'outcome-good': { color: '#0a2e1e', border: '#34d399' },
  'outcome-bad':  { color: '#2e0a0a', border: '#f87171' },
};

function getCfg(type: string) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.state;
}

/* ── Graph data types ── */
interface GraphNode { id: string; type: string; label: string; desc?: string; source?: string; prob?: number; time?: string; }
interface GraphLink { source: string; target: string; label?: string; }
interface GraphData { nodes: GraphNode[]; links: GraphLink[]; }

// Need at least 1 node for Three.js renderer to initialize (invisible placeholder)
const INIT_GRAPH: GraphData = { nodes: [{ id: '__init__', type: 'state', label: '', prob: 0 }], links: [] };

function apiToGraphData(nodes: TemplateNode[], edges: TemplateEdge[]): GraphData {
  return {
    nodes: nodes.map(n => ({
      id: String(n.id),
      type: n.type || 'state',
      label: n.label || '',
      desc: n.desc,
      source: typeof n.source === 'string' ? n.source : Array.isArray(n.source) ? (n.source as any[]).map((s: any) => s.name || s).join(', ') : undefined,
      prob: n.prob,
      time: n.time,
    })),
    links: edges.map(e => ({
      source: String(e.from),
      target: String(e.to),
      label: e.label || '',
    })),
  };
}

/* ── Main component ── */
export default function Simulator3D({ onSwitchTo2D }: { onSwitchTo2D: () => void }) {
  const fgRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const [scenario, setScenario] = useState('');
  const [generating, setGenerating] = useState(false);
  const [graphData, setGraphData] = useState<GraphData>(INIT_GRAPH);
  const [hasGraph, setHasGraph] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sacredMode, setSacredMode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const cssRendererReady = useRef(false);
  const graphVersion = useRef(0);

  useEffect(() => { setMounted(true); }, []);

  /* ── CSS2DRenderer — setup once when ForceGraph3D is ready ── */
  const setupCSSRenderer = useCallback(() => {
    if (cssRendererReady.current || !fgRef.current) return;
    try {
      const fg = fgRef.current;
      const { CSS2DRenderer } = require('three/examples/jsm/renderers/CSS2DRenderer');
      const cssRenderer = new CSS2DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      cssRenderer.domElement.style.top = '0px';
      cssRenderer.domElement.style.pointerEvents = 'none';

      const container = fg.renderer().domElement.parentElement;
      if (container) {
        container.appendChild(cssRenderer.domElement);
        const scene = fg.scene();
        const camera = fg.camera();
        let running = true;
        const animate = () => {
          if (!running) return;
          cssRenderer.render(scene, camera);
          requestAnimationFrame(animate);
        };
        animate();
        cssRendererReady.current = true;

        const onResize = () => cssRenderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener('resize', onResize);
      }
    } catch (e) {
      console.warn('CSS2DRenderer setup failed:', e);
    }
  }, []);

  /* ── Poll for fgRef readiness (ForceGraph3D sets ref async after mount) ── */
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (fgRef.current && !cssRendererReady.current) {
        setupCSSRenderer();
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [mounted, setupCSSRenderer]);

  /* ── Generate flow via API ── */
  const generateFlow = useCallback(async (inputOverride?: string) => {
    const input = (inputOverride || scenario).trim();
    if (!input || generating) return;

    setGenerating(true);
    setErrorMsg('');
    abortRef.current = new AbortController();

    try {
      const profile = loadProfile();
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: input, profile, sacredMode }),
        signal: abortRef.current.signal,
      });
      if (!res.ok) throw new Error('Server error');
      const flow = await res.json();
      if (!flow.nodes?.length || !flow.edges?.length) throw new Error('Invalid flow');

      const gd = apiToGraphData(flow.nodes, flow.edges);
      graphVersion.current++;
      setGraphData(gd);
      setHasGraph(true);

      saveToHistory({ scenario: input, flowData: { nodes: flow.nodes, edges: flow.edges } });

      // Zoom to fit after physics settles
      setTimeout(() => {
        fgRef.current?.zoomToFit(600, 40);
      }, 1500);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setErrorMsg('Generation failed. Try again.');
      }
    } finally {
      setGenerating(false);
    }
  }, [scenario, generating, sacredMode]);

  /* ── Load template ── */
  const loadTemplate = useCallback((key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setScenario(t.input || key);
    if (t.nodes?.length && t.edges?.length) {
      const gd = apiToGraphData(t.nodes, t.edges);
      setGraphData(gd);
      setHasGraph(true);
      setTimeout(() => fgRef.current?.zoomToFit(600, 40), 1500);
    } else {
      setTimeout(() => generateFlow(t.input || key), 50);
    }
  }, [generateFlow]);

  /* ── Node rendering (HTML cards via CSS2DObject) ── */
  const nodeThreeObject = useCallback((node: any) => {
    const { CSS2DObject } = require('three/examples/jsm/renderers/CSS2DRenderer');

    // Hide init placeholder node
    if (node.id === '__init__') {
      const empty = document.createElement('div');
      empty.style.display = 'none';
      const obj = new CSS2DObject(empty);
      obj.layers.set(0);
      return obj;
    }

    const cfg = getCfg(node.type);

    const el = document.createElement('div');
    el.style.cssText = `
      background: ${cfg.color};
      border: 1.5px solid ${cfg.border};
      border-radius: 10px;
      padding: 10px 14px;
      min-width: 180px;
      max-width: 240px;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #e2e8f0;
      pointer-events: auto;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 0 20px ${cfg.border}30;
      transition: box-shadow 0.2s, transform 0.2s;
    `;

    // Header: type badge + prob
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;';
    const badge = document.createElement('span');
    badge.style.cssText = `font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${cfg.border}20;color:${cfg.border};text-transform:uppercase;letter-spacing:0.05em;`;
    badge.textContent = node.type;
    header.appendChild(badge);
    if (node.prob && node.prob < 100) {
      const prob = document.createElement('span');
      prob.style.cssText = `font-size:13px;font-weight:800;color:${cfg.border};`;
      prob.textContent = `${node.prob}%`;
      header.appendChild(prob);
    }
    el.appendChild(header);

    // Label
    const label = document.createElement('div');
    label.style.cssText = 'font-size:12px;font-weight:700;line-height:1.3;margin-bottom:4px;color:#f1f5f9;';
    label.textContent = node.label || '';
    el.appendChild(label);

    // Description (truncated)
    if (node.desc) {
      const desc = document.createElement('div');
      desc.style.cssText = 'font-size:10px;line-height:1.4;color:#94a3b8;margin-bottom:4px;';
      desc.textContent = node.desc.length > 100 ? node.desc.slice(0, 100) + '...' : node.desc;
      el.appendChild(desc);
    }

    // Footer: source + time
    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:6px;';
    if (node.source) {
      const src = document.createElement('span');
      src.style.cssText = 'font-size:8px;color:#64748b;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      src.textContent = node.source;
      footer.appendChild(src);
    }
    if (node.time) {
      const time = document.createElement('span');
      time.style.cssText = 'font-size:8px;color:#475569;white-space:nowrap;';
      time.textContent = node.time;
      footer.appendChild(time);
    }
    el.appendChild(footer);

    // Hover glow
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

  /* ── Node click: camera fly ── */
  const handleNodeClick = useCallback((node: any) => {
    if (!fgRef.current) return;
    const distance = 200;
    const distRatio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
    fgRef.current.cameraPosition(
      { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
      node,
      1000
    );
  }, []);

  /* ── Key handler ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !generating && document.activeElement?.tagName === 'INPUT') {
        e.preventDefault();
        generateFlow();
      }
      if (e.key === 'Escape' && generating) {
        abortRef.current?.abort();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [generating, generateFlow]);

  const suggestions = ['Open a cafe in Bali', 'Go freelance on Upwork', 'Move to Europe', 'Launch a SaaS'];

  if (!mounted) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#060810', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontFamily: 'Inter, system-ui' }}>
        Loading 3D Simulator...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#060810', position: 'relative', overflow: 'hidden' }}>

      {/* ── TOP BAR ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '12px 20px',
        background: 'linear-gradient(180deg, #060810 0%, #060810ee 60%, #06081000 100%)',
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', letterSpacing: '-0.02em', fontFamily: 'Inter, system-ui' }}>
              Simulator
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <button onClick={onSwitchTo2D} style={{
              padding: '5px 12px', background: '#1e293b', color: '#94a3b8', borderRadius: 6,
              fontSize: 11, fontWeight: 600, border: '1px solid #334155', cursor: 'pointer', fontFamily: 'Inter, system-ui',
            }}>2D</button>
            <span style={{
              padding: '5px 12px', background: '#3b82f615', color: '#60a5fa', borderRadius: 6,
              fontSize: 11, fontWeight: 600, border: '1px solid #3b82f630', fontFamily: 'Inter, system-ui',
            }}>3D</span>
            <button onClick={() => setSacredMode(!sacredMode)} style={{
              padding: '5px 12px', marginLeft: 8,
              background: sacredMode ? '#7c3aed20' : '#1e293b',
              color: sacredMode ? '#a78bfa' : '#64748b',
              borderRadius: 6, fontSize: 11, fontWeight: 600,
              border: `1px solid ${sacredMode ? '#7c3aed40' : '#334155'}`,
              cursor: 'pointer', fontFamily: 'Inter, system-ui',
            }}>Sacred</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="What do you want to simulate?"
            style={{
              flex: 1, padding: '10px 16px', borderRadius: 10,
              background: '#0f172a', border: '1px solid #1e293b',
              color: '#e2e8f0', fontSize: 13, fontFamily: 'Inter, system-ui', outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = '#1e293b'; }}
          />
          <button
            onClick={() => generating ? abortRef.current?.abort() : generateFlow()}
            disabled={!scenario.trim() && !generating}
            style={{
              padding: '10px 20px', borderRadius: 10,
              background: generating ? '#dc262620' : '#3b82f6',
              color: generating ? '#f87171' : '#fff',
              fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
              opacity: !scenario.trim() && !generating ? 0.4 : 1,
            }}
          >{generating ? 'Stop' : 'Generate'}</button>
        </div>
      </div>

      {/* ── ERROR ── */}
      {errorMsg && (
        <div style={{
          position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)', zIndex: 30,
          background: '#dc262620', border: '1px solid #dc262640', color: '#f87171',
          padding: '8px 20px', borderRadius: 8, fontSize: 12, fontFamily: 'Inter, system-ui',
        }}>{errorMsg}</div>
      )}

      {/* ── GENERATING OVERLAY ── */}
      {generating && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 25,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #1e293b', borderTopColor: '#3b82f6',
            borderRadius: '50%', animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'Inter, system-ui' }}>Building simulation...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {/* ── EMPTY STATE with templates ── */}
      {!hasGraph && !generating && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 15,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center',
          maxWidth: 600, width: '90%',
        }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#e2e8f0', letterSpacing: '-0.02em', marginBottom: 6, fontFamily: 'Inter, system-ui' }}>3D Simulator</div>
            <div style={{ fontSize: 12, color: '#475569', fontFamily: 'Inter, system-ui' }}>Type a scenario or pick a template</div>
          </div>

          {/* Quick suggestions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setScenario(s); setTimeout(() => generateFlow(s), 50); }}
                style={{
                  padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 500,
                  color: '#94a3b8', background: '#0f172a', border: '1px solid #1e293b',
                  cursor: 'pointer', fontFamily: 'Inter, system-ui', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; }}
              >{s}</button>
            ))}
          </div>

          {/* Template grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8, width: '100%' }}>
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button key={key} onClick={() => loadTemplate(key)}
                style={{
                  padding: '10px 12px', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  color: '#94a3b8', background: '#0f172a', border: '1px solid #1e293b',
                  cursor: 'pointer', fontFamily: 'Inter, system-ui', transition: 'all 0.15s',
                  textAlign: 'left', lineHeight: 1.3,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f640'; e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = '#0f172acc'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1e293b'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = '#0f172a'; }}
              >{t.title}</button>
            ))}
          </div>
        </div>
      )}

      {/* ── CONTROLS HINT ── */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', gap: 16, fontFamily: 'Inter, system-ui', fontSize: 10, color: '#334155',
      }}>
        <span>Drag to rotate</span>
        <span>Scroll to zoom</span>
        <span>Click node to focus</span>
        <span>Right-drag to pan</span>
      </div>

      {/* ── STATS ── */}
      {hasGraph && (
        <div style={{
          position: 'absolute', bottom: 16, right: 20, zIndex: 10,
          fontFamily: 'Inter, system-ui', fontSize: 10, color: '#334155',
        }}>{graphData.nodes.length} nodes / {graphData.links.length} edges</div>
      )}

      {/* ── 3D FORCE GRAPH — always mounted so CSS2DRenderer can attach ── */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#060810"
        dagMode="td"
        dagLevelDistance={80}
        nodeThreeObject={nodeThreeObject}
        nodeThreeObjectExtend={false}
        nodeOpacity={0}
        nodeResolution={1}
        linkColor={(link: any) => {
          const lbl = (link.label || '').toLowerCase();
          if (lbl.startsWith('fail') || lbl.startsWith('no')) return '#f8717140';
          if (lbl.startsWith('pass') || lbl.startsWith('yes')) return '#34d39950';
          return '#33415540';
        }}
        linkWidth={(link: any) => {
          const lbl = (link.label || '').toLowerCase();
          if (lbl.startsWith('pass') || lbl.startsWith('yes')) return 3;
          if (lbl.startsWith('fail') || lbl.startsWith('no')) return 1.5;
          return 2;
        }}
        linkOpacity={0.5}
        linkCurvature={0.12}
        linkDirectionalParticles={3}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2.5}
        linkDirectionalParticleColor={(link: any) => {
          const lbl = (link.label || '').toLowerCase();
          if (lbl.startsWith('fail') || lbl.startsWith('no')) return '#f87171';
          if (lbl.startsWith('pass') || lbl.startsWith('yes')) return '#34d399';
          return '#60a5fa';
        }}
        linkLabel={(link: any) => link.label ? `<span style="color:#94a3b8;font-size:11px;font-family:Inter,system-ui;background:#0f172a;padding:2px 8px;border-radius:4px">${link.label}</span>` : ''}
        onNodeClick={handleNodeClick}
        warmupTicks={100}
        cooldownTicks={0}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
      </div>
    </div>
  );
}
