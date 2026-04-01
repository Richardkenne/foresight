'use client';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  style?: React.CSSProperties;
}

export default function Skeleton({
  className = '',
  width,
  height,
  borderRadius = 6,
  style = {},
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        width: width ?? '100%',
        height: height ?? '16px',
        borderRadius,
        ...style,
      }}
    />
  );
}

// ─── Node skeleton preview ────────────────────────────────────────────────────
// Used during AI generation to show a structural preview of what the graph will look like

export function GeneratingSkeleton() {
  const card = (width: number, type: 'gate' | 'node' | 'outcome') => {
    const isGate = type === 'gate';
    const isOutcome = type === 'outcome';

    return (
      <div
        style={{
          width: `${width}px`,
          padding: '14px 16px',
          borderRadius: isGate ? '4px' : '12px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          transform: isGate ? 'rotate(45deg)' : 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          opacity: isOutcome ? 0.7 : 1,
        }}
      >
        <Skeleton height={9} width="60%" borderRadius={4} style={{ marginBottom: '6px' }} />
        <Skeleton height={7} width="90%" borderRadius={3} style={{ marginBottom: '4px' }} />
        <Skeleton height={7} width="70%" borderRadius={3} />
      </div>
    );
  };

  const connector = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      <Skeleton width={32} height={2} borderRadius={1} style={{ opacity: 0.5 }} />
    </div>
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      {/* Label */}
      <div style={{ textAlign: 'center' }}>
        <Skeleton width={160} height={10} borderRadius={5} style={{ margin: '0 auto 6px' }} />
        <Skeleton width={100} height={8} borderRadius={4} style={{ margin: '0 auto', opacity: 0.6 }} />
      </div>

      {/* Node row 1: state → bottleneck → state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {card(130, 'node')}
        {connector()}
        {card(40, 'gate')}
        {connector()}
        {card(130, 'node')}
      </div>

      {/* Node row 2: action → gate → outcomes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {card(120, 'node')}
        {connector()}
        {card(36, 'gate')}
        {connector()}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {card(110, 'outcome')}
          {card(110, 'outcome')}
        </div>
      </div>

      {/* Hint text */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse-dot 1.2s ease-in-out 0s infinite',
          }}
        />
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse-dot 1.2s ease-in-out 0.2s infinite',
          }}
        />
        <div
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse-dot 1.2s ease-in-out 0.4s infinite',
          }}
        />
      </div>
    </div>
  );
}
