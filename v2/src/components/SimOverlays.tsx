'use client';

import { useViewport, type Node as RFNode } from '@xyflow/react';
import type { ParticleData } from './Particle';

// Cut line indicator — vertical dashed line with scissors icon
export function CutLineIndicator({ cutNodeId, nodes }: { cutNodeId: string | null; nodes: RFNode[] }) {
  const { x, y, zoom } = useViewport();
  if (!cutNodeId) return null;
  const node = nodes.find(n => n.id === cutNodeId);
  if (!node) return null;

  const lineX = node.position.x + 170 + 16;
  const nodeY = node.position.y + 50;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[20]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '0 0' }}
    >
      <div
        style={{
          position: 'absolute',
          left: lineX,
          top: -3000,
          width: 2,
          height: 8000,
          background: 'repeating-linear-gradient(to bottom, #ef4444 0, #ef4444 8px, transparent 8px, transparent 16px)',
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: lineX - 10,
          top: nodeY - 10,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
          <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
        </svg>
      </div>
    </div>
  );
}

// Particle layer that moves WITH the React Flow viewport (zoom/pan aware)
export function ParticleLayer({ particles, moveDuration }: { particles: ParticleData[]; moveDuration: number }) {
  const { x, y, zoom } = useViewport();
  if (particles.length === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[25]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '0 0' }}
    >
      {particles.map((p) => {
        const dur = Math.round(moveDuration * (p.speedMult || 1));
        const isActive = p.status === 'moving';
        return (
          <div
            key={p.id}
            className={`particle ${isActive ? 'particle-walking' : ''} ${p.status === 'blocked' ? 'particle-blocked' : p.status === 'failing' ? 'particle-failing' : p.status === 'success' ? 'particle-success' : ''}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              transition: `left ${dur}ms cubic-bezier(0.4, 0, 0.2, 1), top ${dur}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease`,
            }}
            dangerouslySetInnerHTML={{ __html: p.svg }}
          />
        );
      })}
    </div>
  );
}
