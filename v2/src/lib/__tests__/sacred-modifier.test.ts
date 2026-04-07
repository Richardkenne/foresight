import { describe, it, expect, vi } from 'vitest';

// Mock the sacred-roots.json import before importing the module
vi.mock('../sacred-roots.json', () => {
  return {
    default: [
      { id: 'SR-001', label_positive: 'Faith / Trust' },
      { id: 'SR-002', label_positive: 'Worship' },
      { id: 'SR-010', label_positive: 'Patience' },
    ],
  };
});

import { computePersonalProb, computeAllPersonalProbs } from '../sacred-modifier';
import type { SacredProfile } from '../sacred-assessment';

describe('computePersonalProb (sacred-modifier version)', () => {
  it('returns null when nodeSacredRoots is empty', () => {
    const profile: SacredProfile = { 'SR-001': 5 };
    expect(computePersonalProb(50, [], profile)).toBeNull();
  });

  it('returns null when sacredProfile is empty', () => {
    expect(computePersonalProb(50, ['SR-001'], {})).toBeNull();
  });

  it('returns null when no roots match between node and profile', () => {
    const profile: SacredProfile = { 'SR-010': 5 };
    expect(computePersonalProb(50, ['SR-099'], profile)).toBeNull();
  });

  it('score 0 produces 0.5x modifier', () => {
    const profile: SacredProfile = { 'SR-001': 0 };
    const result = computePersonalProb(50, ['SR-001'], profile);
    expect(result).not.toBeNull();
    expect(result!.modifier).toBe(0.5);
    expect(result!.personal).toBe(25);
  });

  it('score 5 produces 1.0x modifier (no change)', () => {
    const profile: SacredProfile = { 'SR-001': 5 };
    const result = computePersonalProb(50, ['SR-001'], profile);
    expect(result).not.toBeNull();
    expect(result!.modifier).toBe(1);
    expect(result!.personal).toBe(50);
  });

  it('score 10 produces 1.5x modifier', () => {
    const profile: SacredProfile = { 'SR-001': 10 };
    const result = computePersonalProb(50, ['SR-001'], profile);
    expect(result).not.toBeNull();
    expect(result!.modifier).toBe(1.5);
    expect(result!.personal).toBe(75);
  });

  it('clamps personal prob to minimum 1', () => {
    const profile: SacredProfile = { 'SR-001': 0 };
    const result = computePersonalProb(1, ['SR-001'], profile);
    expect(result).not.toBeNull();
    expect(result!.personal).toBeGreaterThanOrEqual(1);
  });

  it('clamps personal prob to maximum 99', () => {
    const profile: SacredProfile = { 'SR-001': 10 };
    const result = computePersonalProb(99, ['SR-001'], profile);
    expect(result).not.toBeNull();
    expect(result!.personal).toBeLessThanOrEqual(99);
  });

  it('averages scores across multiple matched roots', () => {
    const profile: SacredProfile = { 'SR-001': 0, 'SR-002': 10 };
    const result = computePersonalProb(50, ['SR-001', 'SR-002'], profile);
    expect(result).not.toBeNull();
    // Average score = 5 -> modifier = 1.0
    expect(result!.modifier).toBe(1);
    expect(result!.personal).toBe(50);
  });

  it('picks the root furthest from neutral as primary', () => {
    const profile: SacredProfile = { 'SR-001': 5, 'SR-002': 9 };
    const result = computePersonalProb(50, ['SR-001', 'SR-002'], profile);
    expect(result).not.toBeNull();
    expect(result!.rootId).toBe('SR-002');
    expect(result!.rootScore).toBe(9);
  });

  it('includes a human-readable reason string', () => {
    const profile: SacredProfile = { 'SR-001': 8 };
    const result = computePersonalProb(50, ['SR-001'], profile);
    expect(result).not.toBeNull();
    expect(result!.reason).toContain('SR-001');
    expect(result!.reason).toContain('8/10');
  });
});

describe('computeAllPersonalProbs', () => {
  it('returns a map of personalized probs for nodes with sacredRoots', () => {
    const nodes = [
      { id: 'n1', prob: 60, sacredRoots: ['SR-001'] },
      { id: 'n2', prob: 40, sacredRoots: ['SR-002'] },
      { id: 'n3' }, // no prob or roots
    ];
    const profile: SacredProfile = { 'SR-001': 7, 'SR-002': 3 };
    const result = computeAllPersonalProbs(nodes, profile);

    expect(result['n1']).toBeDefined();
    expect(result['n2']).toBeDefined();
    expect(result['n3']).toBeUndefined();
  });

  it('returns empty map for empty profile', () => {
    const nodes = [{ id: 'n1', prob: 50, sacredRoots: ['SR-001'] }];
    const result = computeAllPersonalProbs(nodes, {});
    expect(Object.keys(result)).toHaveLength(0);
  });
});
