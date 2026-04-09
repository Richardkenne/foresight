'use client';

import { useState, useEffect, Suspense } from 'react';

const COLORS: Record<string, string> = {
  'state': '#60a5fa',
  'bottleneck': '#a78bfa',
  'action': '#94a3b8',
  'gate': '#fbbf24',
  'outcome-good': '#34d399',
  'outcome-bad': '#f87171',
};

const nodes = [
  { id: '1', label: 'You want to open a cafe', fill: '#60a5fa' },
  { id: '2', label: 'Choose model', fill: '#a78bfa' },
  { id: '3', label: 'Coffee cart', fill: '#60a5fa' },
  { id: '4', label: 'Full cafe', fill: '#60a5fa' },
  { id: '5', label: 'Secure capital?', fill: '#a78bfa' },
  { id: '6', label: 'Secure capital?', fill: '#a78bfa' },
  { id: '7', label: 'Find location', fill: '#94a3b8' },
  { id: '8', label: 'Find location', fill: '#94a3b8' },
  { id: '9', label: 'Approved?', fill: '#a78bfa' },
  { id: '10', label: 'Approved?', fill: '#a78bfa' },
  { id: '11', label: 'Breakeven?', fill: '#fbbf24' },
  { id: '12', label: 'Breakeven?', fill: '#fbbf24' },
  { id: 'win1', label: 'Cart profitable', fill: '#34d399' },
  { id: 'win2', label: 'Cafe profitable', fill: '#34d399' },
  { id: 'fail1', label: 'Capital denied', fill: '#f87171' },
  { id: 'fail2', label: 'Capital denied', fill: '#f87171' },
  { id: 'fail3', label: 'Permits denied', fill: '#f87171' },
  { id: 'fail4', label: 'Permits denied', fill: '#f87171' },
  { id: 'fail5', label: 'No breakeven', fill: '#f87171' },
  { id: 'fail6', label: 'No breakeven', fill: '#f87171' },
];

const edges = [
  { id: 'e1', source: '1', target: '2', label: '' },
  { id: 'e2', source: '2', target: '3', label: 'Cart' },
  { id: 'e3', source: '2', target: '4', label: 'Cafe' },
  { id: 'e4', source: '3', target: '5', label: '' },
  { id: 'e5', source: '4', target: '6', label: '' },
  { id: 'e6', source: '5', target: '7', label: 'pass' },
  { id: 'e7', source: '5', target: 'fail1', label: 'fail' },
  { id: 'e8', source: '6', target: '8', label: 'pass' },
  { id: 'e9', source: '6', target: 'fail2', label: 'fail' },
  { id: 'e10', source: '7', target: '9', label: '' },
  { id: 'e11', source: '8', target: '10', label: '' },
  { id: 'e12', source: '9', target: '11', label: 'yes' },
  { id: 'e13', source: '9', target: 'fail3', label: 'no' },
  { id: 'e14', source: '10', target: '12', label: 'yes' },
  { id: 'e15', source: '10', target: 'fail4', label: 'no' },
  { id: 'e16', source: '11', target: 'win1', label: 'yes' },
  { id: 'e17', source: '11', target: 'fail5', label: 'no' },
  { id: 'e18', source: '12', target: 'win2', label: 'yes' },
  { id: 'e19', source: '12', target: 'fail6', label: 'no' },
];

function ReagraphCanvas() {
  const [GraphCanvas, setGraphCanvas] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import('reagraph')
      .then((mod) => {
        setGraphCanvas(() => mod.GraphCanvas);
      })
      .catch((err) => {
        console.error('Reagraph load error:', err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return (
      <div style={{ color: 'var(--danger)', padding: 40, fontFamily: 'system-ui', fontSize: 'var(--text-md)' }}>
        <h2 style={{ marginBottom: 8 }}>Reagraph failed to load</h2>
        <p style={{ color: 'var(--muted)' }}>{error}</p>
        <p style={{ color: 'var(--muted-foreground)', marginTop: 16 }}>This is a Three.js version conflict. The 3D Force Graph variant works — try that instead.</p>
        <a href="/ui/force3d" style={{ color: 'var(--accent)', marginTop: 8, display: 'inline-block' }}>Open 3D Force Graph</a>
      </div>
    );
  }

  if (!GraphCanvas) {
    return <div style={{ color: 'var(--muted-foreground)', padding: 40 }}>Loading Reagraph...</div>;
  }

  return (
    <GraphCanvas
      nodes={nodes}
      edges={edges}
      layoutType="hierarchicalTd"
      theme={{
        canvas: { background: '#0a0a12' },
        node: {
          fill: '#60a5fa',
          activeFill: '#93c5fd',
          opacity: 1,
          selectedOpacity: 1,
          inactiveOpacity: 0.3,
          label: {
            color: '#e2e8f0',
            activeColor: '#ffffff',
            fontSize: 7,
            stroke: '#0a0a12',
          },
        },
        edge: {
          fill: '#334155',
          activeFill: '#60a5fa',
          opacity: 0.6,
          selectedOpacity: 1,
          inactiveOpacity: 0.15,
          label: {
            color: '#94a3b8',
            activeColor: '#e2e8f0',
            fontSize: 5,
            stroke: '#0a0a12',
          },
        },
        ring: {
          fill: '#60a5fa',
          activeFill: '#3b82f6',
        },
        arrow: {
          fill: '#475569',
          activeFill: '#60a5fa',
        },
      }}
      edgeArrowPosition="end"
      labelType="all"
      animated
    />
  );
}

export default function ReagraphPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: '#0a0a12', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a12', position: 'relative' }}>
      {/* Title */}
      <div style={{
        position: 'absolute', top: 24, left: 24, zIndex: 10,
        color: 'var(--border)', fontFamily: 'system-ui',
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Reagraph (React Three Fiber)</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>Cafe Business Simulation — drag to rotate, scroll to zoom</p>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24, zIndex: 10,
        display: 'flex', gap: 16, fontFamily: 'system-ui', fontSize: 11,
      }}>
        {Object.entries(COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ color: 'var(--muted)' }}>{type}</span>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{
        position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', gap: 8, fontFamily: 'system-ui',
      }}>
        <a href="/ui/force3d" style={{
          padding: 'var(--space-2) var(--space-4)', background: 'var(--foreground)', color: 'var(--muted)', borderRadius: 8,
          fontSize: 'var(--text-sm)', textDecoration: 'none', border: '1px solid var(--muted-foreground)',
        }}>3D Force Graph</a>
        <span style={{
          padding: 'var(--space-2) var(--space-4)', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)', borderRadius: 8,
          fontSize: 'var(--text-sm)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
        }}>Reagraph</span>
      </div>

      {/* Back link */}
      <a href="/sim" style={{
        position: 'absolute', top: 24, right: 24, zIndex: 10,
        color: 'var(--accent)', fontSize: 'var(--text-base)', fontFamily: 'system-ui', textDecoration: 'none',
      }}>
        Back to Foresight
      </a>

      <Suspense fallback={<div style={{ color: 'var(--muted-foreground)', padding: 40 }}>Loading 3D...</div>}>
        <ReagraphCanvas />
      </Suspense>
    </div>
  );
}
