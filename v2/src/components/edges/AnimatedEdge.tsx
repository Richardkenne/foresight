'use client';

import { memo } from 'react';
import { getBezierPath, type EdgeProps } from '@xyflow/react';

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  label,
  labelStyle,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const lbl = String(label || '').toLowerCase();
  const isPass = lbl.startsWith('pass') || lbl.startsWith('yes');
  const isFail = lbl.startsWith('fail') || lbl.startsWith('no');

  return (
    <>
      {/* Base path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          strokeDasharray: isFail ? '6 4' : undefined,
        }}
      />

      {/* Animated dot on pass/yes edges */}
      {isPass && (
        <circle r="3.5" fill="var(--success)" opacity="0.8">
          <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Label — positioned above the line with background */}
      {label && (
        <g transform={`translate(${labelX}, ${labelY - 12})`}>
          <rect
            x={-(String(label).length * 3.5 + 8)}
            y={-8}
            width={String(label).length * 7 + 16}
            height={16}
            rx={4}
            fill="var(--background)"
            opacity={0.9}
          />
          <text
            className="react-flow__edge-text"
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              ...labelStyle,
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase' as const,
            }}
          >
            {label as string}
          </text>
        </g>
      )}
    </>
  );
}

export default memo(AnimatedEdgeComponent);
