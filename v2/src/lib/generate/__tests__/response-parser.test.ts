import { describe, it, expect } from 'vitest';
import { repairJSON, applyNodeDependencies } from '../response-parser';

describe('repairJSON', () => {
  it('passes through valid JSON', () => {
    const valid = '{"nodes": [{"id": 1}]}';
    const result = repairJSON(valid);
    expect(JSON.parse(result)).toEqual({ nodes: [{ id: 1 }] });
  });

  it('strips markdown fences', () => {
    const wrapped = '```json\n{"nodes": []}\n```';
    const result = repairJSON(wrapped);
    expect(JSON.parse(result)).toEqual({ nodes: [] });
  });

  it('fixes trailing commas', () => {
    const bad = '{"nodes": [1, 2, 3,]}';
    const result = repairJSON(bad);
    expect(JSON.parse(result)).toEqual({ nodes: [1, 2, 3] });
  });

  it('fixes missing commas between objects', () => {
    const bad = '{"nodes": [{"id": 1}{"id": 2}]}';
    const result = repairJSON(bad);
    expect(JSON.parse(result)).toEqual({ nodes: [{ id: 1 }, { id: 2 }] });
  });

  it('closes unclosed braces', () => {
    const truncated = '{"nodes": [{"id": 1}';
    const result = repairJSON(truncated);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('closes unclosed brackets', () => {
    const truncated = '{"nodes": [1, 2';
    const result = repairJSON(truncated);
    expect(() => JSON.parse(result)).not.toThrow();
  });

  it('extracts JSON from surrounding text', () => {
    const messy = 'Here is the result:\n{"nodes": []}\nEnd of output';
    const result = repairJSON(messy);
    expect(JSON.parse(result)).toEqual({ nodes: [] });
  });

  it('handles empty string', () => {
    const result = repairJSON('');
    // Should not throw
    expect(typeof result).toBe('string');
  });

  it('removes trailing comma before closing', () => {
    const bad = '{"a": 1,';
    const result = repairJSON(bad);
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

describe('applyNodeDependencies', () => {
  it('applies modifier to target node probability', () => {
    const flow = {
      nodes: [
        { label: 'Source', prob: 50, nodeType: 'state', modifiesDownstream: [
          { targetNodeLabel: 'Target', modifier: 1.5 }
        ]},
        { label: 'Target', prob: 40, nodeType: 'bottleneck' },
      ],
    };

    applyNodeDependencies(flow);
    expect(flow.nodes[1].prob).toBe(60); // 40 * 1.5 = 60
  });

  it('clamps modified prob to 1-99', () => {
    const flow = {
      nodes: [
        { label: 'Source', prob: 50, nodeType: 'state', modifiesDownstream: [
          { targetNodeLabel: 'Target', modifier: 0.01 }
        ]},
        { label: 'Target', prob: 10, nodeType: 'bottleneck' },
      ],
    };

    applyNodeDependencies(flow);
    expect(flow.nodes[1].prob).toBeGreaterThanOrEqual(1);
  });

  it('does not modify nodes with prob >= 100', () => {
    const flow = {
      nodes: [
        { label: 'Source', prob: 50, nodeType: 'state', modifiesDownstream: [
          { targetNodeLabel: 'Target', modifier: 1.5 }
        ]},
        { label: 'Target', prob: 100, nodeType: 'state' },
      ],
    };

    applyNodeDependencies(flow);
    expect(flow.nodes[1].prob).toBe(100);
  });

  it('handles missing nodes gracefully', () => {
    const flow = {
      nodes: [
        { label: 'Source', prob: 50, nodeType: 'state', modifiesDownstream: [
          { targetNodeLabel: 'Nonexistent', modifier: 1.5 }
        ]},
      ],
    };

    // Should not throw
    expect(() => applyNodeDependencies(flow)).not.toThrow();
  });

  it('does nothing when no nodes have modifiesDownstream', () => {
    const flow = {
      nodes: [
        { label: 'A', prob: 50, nodeType: 'bottleneck' },
        { label: 'B', prob: 30, nodeType: 'bottleneck' },
      ],
    };

    applyNodeDependencies(flow);
    expect(flow.nodes[0].prob).toBe(50);
    expect(flow.nodes[1].prob).toBe(30);
  });

  it('handles flow without nodes array', () => {
    const flow = {};
    expect(() => applyNodeDependencies(flow)).not.toThrow();
  });

  it('clamps modifier to 0.1-3.0 range', () => {
    const flow = {
      nodes: [
        { label: 'Source', prob: 50, nodeType: 'state', modifiesDownstream: [
          { targetNodeLabel: 'Target', modifier: 100 }
        ]},
        { label: 'Target', prob: 40, nodeType: 'bottleneck' },
      ],
    };

    applyNodeDependencies(flow);
    // 40 * 3.0 = 120 -> clamped to 99
    expect(flow.nodes[1].prob).toBeLessThanOrEqual(99);
  });
});
