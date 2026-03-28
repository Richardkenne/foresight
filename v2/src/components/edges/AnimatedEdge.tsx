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

  const isPass = label === 'pass' || label === 'yes';
  const isFail = label === 'fail' || label === 'no';

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
        <circle r="3.5" fill="#10b981" opacity="0.8">
          <animateMotion dur="2.5s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Label */}
      {label && (
        <text
          x={labelX}
          y={labelY}
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
      )}
    </>
  );
}

export default memo(AnimatedEdgeComponent);
