'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

interface ContextNodeData {
  photoUrl?: string;
  scenario: string;
  [key: string]: unknown;
}

function ContextNodeComponent({ data }: NodeProps) {
  const d = data as ContextNodeData;

  return (
    <div className="context-node">
      {d.photoUrl && (
        <div className="context-node__photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={d.photoUrl} alt="Scene" />
        </div>
      )}
      <div className="context-node__text">
        <div className="context-node__label">Scenario</div>
        <div className="context-node__scenario">{d.scenario}</div>
      </div>
      <Handle type="source" position={Position.Right} className="sim-handle" />
    </div>
  );
}

export default memo(ContextNodeComponent);
