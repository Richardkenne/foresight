import { describe, it, expect } from 'vitest';
import { precomputeFates, computePersonalProb } from '../simulation-types';
import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

// Helper to build minimal nodes/edges for testing
function makeNode(id: string, nodeType: string, prob?: number): RFNode {
  return {
    id,
    position: { x: 0, y: 0 },
    data: { nodeType, prob, label: id },
  };
}

function makeEdge(source: string, target: string, label?: string): RFEdge {
  return { id: `${source}-${target}`, source, target, label };
}

describe('computePersonalProb (simulation-types version)', () => {
  it('returns generic prob when sacredProfile is null', () => {
    expect(computePersonalProb(50, null)).toBe(50);
  });

  it('returns generic prob when sacredProfile is empty', () => {
    expect(computePersonalProb(50, {})).toBe(50);
  });

  it('score 0 average shifts probability down by -15', () => {
    const profile = { 'SR-001': 0, 'SR-002': 0 };
    expect(computePersonalProb(50, profile)).toBe(35);
  });

  it('score 5 average keeps probability unchanged', () => {
    const profile = { 'SR-001': 5, 'SR-002': 5 };
    expect(computePersonalProb(50, profile)).toBe(50);
  });

  it('score 10 average shifts probability up by +15', () => {
    const profile = { 'SR-001': 10, 'SR-002': 10 };
    expect(computePersonalProb(50, profile)).toBe(65);
  });

  it('clamps to minimum 1', () => {
    const profile = { 'SR-001': 0, 'SR-002': 0 };
    expect(computePersonalProb(5, profile)).toBe(1);
  });

  it('clamps to maximum 99', () => {
    const profile = { 'SR-001': 10, 'SR-002': 10 };
    expect(computePersonalProb(95, profile)).toBe(99);
  });
});

describe('precomputeFates', () => {
  it('computes fates for a simple 3-node linear graph', () => {
    const nodes = [
      makeNode('start', 'state'),
      makeNode('gate', 'bottleneck', 50),
      makeNode('good', 'outcome-good'),
      makeNode('bad', 'outcome-bad'),
    ];
    const edges = [
      makeEdge('start', 'gate'),
      makeEdge('gate', 'good', 'pass'),
      makeEdge('gate', 'bad', 'fail'),
    ];

    const fates = precomputeFates(10, 'start', nodes, edges);
    expect(fates).toHaveLength(10);
    expect(fates.every(f => f.path.length > 0)).toBe(true);
  });

  it('is deterministic: same input produces same output', () => {
    const nodes = [
      makeNode('s', 'state'),
      makeNode('b', 'bottleneck', 60),
      makeNode('g', 'outcome-good'),
      makeNode('f', 'outcome-bad'),
    ];
    const edges = [
      makeEdge('s', 'b'),
      makeEdge('b', 'g', 'pass'),
      makeEdge('b', 'f', 'fail'),
    ];

    const fates1 = precomputeFates(100, 's', nodes, edges);
    const fates2 = precomputeFates(100, 's', nodes, edges);

    for (let i = 0; i < 100; i++) {
      expect(fates1[i].outcome).toBe(fates2[i].outcome);
      expect(fates1[i].path).toEqual(fates2[i].path);
      expect(fates1[i].speedMult).toBe(fates2[i].speedMult);
    }
  });

  it('all 100 people get valid paths', () => {
    const nodes = [
      makeNode('s', 'state'),
      makeNode('b', 'bottleneck', 70),
      makeNode('g', 'outcome-good'),
      makeNode('f', 'outcome-bad'),
    ];
    const edges = [
      makeEdge('s', 'b'),
      makeEdge('b', 'g', 'pass'),
      makeEdge('b', 'f', 'fail'),
    ];

    const fates = precomputeFates(100, 's', nodes, edges);
    expect(fates).toHaveLength(100);
    fates.forEach(f => {
      expect(f.path.length).toBeGreaterThanOrEqual(1);
      expect(['success', 'blocked']).toContain(f.outcome);
      expect(f.personId).toBeGreaterThan(0);
    });
  });

  it('handles single node graph', () => {
    const nodes = [makeNode('only', 'outcome-good')];
    const edges: RFEdge[] = [];

    const fates = precomputeFates(5, 'only', nodes, edges);
    expect(fates).toHaveLength(5);
    fates.forEach(f => {
      expect(f.outcome).toBe('success');
      expect(f.path).toContain('only');
    });
  });

  it('handles missing start node gracefully', () => {
    const nodes = [makeNode('a', 'state')];
    const edges: RFEdge[] = [];

    const fates = precomputeFates(3, 'nonexistent', nodes, edges);
    expect(fates).toHaveLength(3);
    // Path should just contain the nonexistent ID attempt
    fates.forEach(f => {
      expect(f.outcome).toBe('blocked');
    });
  });

  it('first person is always YOU with speedMult 1.0 and startDelay 0', () => {
    const nodes = [
      makeNode('s', 'state'),
      makeNode('g', 'outcome-good'),
    ];
    const edges = [makeEdge('s', 'g')];

    const fates = precomputeFates(10, 's', nodes, edges);
    expect(fates[0].isYou).toBe(true);
    expect(fates[0].speedMult).toBe(1.0);
    expect(fates[0].startDelay).toBe(0);
  });

  it('respects bottleneck probability distribution', () => {
    const nodes = [
      makeNode('s', 'state'),
      makeNode('b', 'bottleneck', 30),
      makeNode('g', 'outcome-good'),
      makeNode('f', 'outcome-bad'),
    ];
    const edges = [
      makeEdge('s', 'b'),
      makeEdge('b', 'g', 'pass'),
      makeEdge('b', 'f', 'fail'),
    ];

    const fates = precomputeFates(100, 's', nodes, edges);
    const successCount = fates.filter(f => f.outcome === 'success').length;
    // With 30% prob, roughly 30 should succeed (person 0 is YOU with different logic)
    // Allow some tolerance
    expect(successCount).toBeGreaterThanOrEqual(20);
    expect(successCount).toBeLessThanOrEqual(45);
  });

  it('handles gate nodes with 3-way split', () => {
    const nodes = [
      makeNode('s', 'state'),
      makeNode('g', 'gate', 50),
      makeNode('yes-out', 'outcome-good'),
      makeNode('partial-out', 'state'),
      makeNode('no-out', 'outcome-bad'),
    ];
    const edges = [
      makeEdge('s', 'g'),
      makeEdge('g', 'yes-out', 'yes'),
      makeEdge('g', 'partial-out', 'partial'),
      makeEdge('g', 'no-out', 'no'),
    ];

    const fates = precomputeFates(20, 's', nodes, edges);
    expect(fates).toHaveLength(20);
    // All should have completed paths
    fates.forEach(f => {
      expect(f.path.length).toBeGreaterThanOrEqual(2);
    });
  });
});
