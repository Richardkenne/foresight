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
// Supports both CSS-transition mode (legacy) and SVG path-following mode
export function ParticleLayer({
  particles,
  moveDuration,
  pathFollowing = false,
}: {
  particles: ParticleData[];
  moveDuration: number;
  pathFollowing?: boolean;
}) {
  const { x, y, zoom } = useViewport();
  if (particles.length === 0) return null;

  // Sort: YOU particle rendered LAST so it's on top
  const sorted = [...particles].sort((a, b) => (a.isYou ? 1 : 0) - (b.isYou ? 1 : 0));

  return (
    <div
      className="absolute inset-0 pointer-events-none z-[25]"
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '0 0' }}
    >
      {sorted.map((p) => {
        const dur = Math.round(moveDuration * (p.speedMult || 1));
        const isActive = p.status === 'moving';
        const youClass = p.isYou ? 'particle-you' : '';
        const statusClass = p.status === 'blocked' ? 'particle-blocked'
          : p.status === 'failing' ? (p.isYou ? 'particle-you-failing' : 'particle-failing')
          : p.status === 'success' ? (p.isYou ? 'particle-you-success' : 'particle-success')
          : '';

        // When path following is active, particles are positioned by the animation loop
        // directly setting x/y — no CSS transition needed, use will-change for perf
        const transitionStyle = pathFollowing
          ? { transition: 'opacity 0.5s ease' }
          : { transition: `left ${dur}ms cubic-bezier(0.4, 0, 0.2, 1), top ${dur}ms cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease` };

        return (
          <div
            key={p.id}
            className={`particle ${isActive ? 'particle-walking' : ''} ${youClass} ${statusClass}`}
            style={{
              position: 'absolute',
              left: p.isYou ? p.x - 5 : p.x,
              top: p.isYou ? p.y - 8 : p.y,
              ...transitionStyle,
              zIndex: p.isYou ? 100 : 25,
              transform: p.isYou ? 'scale(1.5)' : undefined,
              transformOrigin: p.isYou ? 'center bottom' : undefined,
              willChange: pathFollowing ? 'left, top' : undefined,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: p.svg }} />
            {p.isYou && (
              <div
                style={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 8,
                  fontWeight: 800,
                  color: '#fbbf24',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  textTransform: 'uppercase' as const,
                }}
              >
                YOU
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
