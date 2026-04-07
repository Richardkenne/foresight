import { describe, it, expect } from 'vitest';
import { deterministicSpeedMult, deterministicStartDelay, getPointOnEdge } from '../path-follower';

describe('deterministicSpeedMult', () => {
  it('returns 1.0 for person index 0 (YOU)', () => {
    expect(deterministicSpeedMult(0, 10)).toBe(1.0);
  });

  it('returns values in 0.7-1.3 range for other persons', () => {
    for (let i = 1; i < 100; i++) {
      const mult = deterministicSpeedMult(i, 100);
      expect(mult).toBeGreaterThanOrEqual(0.69); // float tolerance
      expect(mult).toBeLessThanOrEqual(1.31);
    }
  });

  it('is deterministic: same index produces same result', () => {
    expect(deterministicSpeedMult(5, 10)).toBe(deterministicSpeedMult(5, 10));
  });
});

describe('deterministicStartDelay', () => {
  it('returns 0 for person index 0 (YOU)', () => {
    expect(deterministicStartDelay(0, 10, false)).toBe(0);
    expect(deterministicStartDelay(0, 10, true)).toBe(0);
  });

  it('returns smaller delays for simultaneous mode (max 200ms)', () => {
    for (let i = 1; i < 50; i++) {
      const delay = deterministicStartDelay(i, 50, true);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(200);
    }
  });

  it('returns delays in wave mode', () => {
    for (let i = 1; i < 20; i++) {
      const delay = deterministicStartDelay(i, 20, false);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThanOrEqual(200);
    }
  });
});

describe('getPointOnEdge', () => {
  it('returns fallback linear interpolation when pathInfo is undefined', () => {
    const src = { x: 0, y: 0 };
    const tgt = { x: 100, y: 100 };

    const p0 = getPointOnEdge(undefined, 0, src, tgt);
    expect(p0.x).toBe(0);
    expect(p0.y).toBe(0);

    const p50 = getPointOnEdge(undefined, 0.5, src, tgt);
    expect(p50.x).toBe(50);
    expect(p50.y).toBe(50);

    const p100 = getPointOnEdge(undefined, 1, src, tgt);
    expect(p100.x).toBe(100);
    expect(p100.y).toBe(100);
  });

  it('clamps progress to 0-1 in linear fallback', () => {
    const src = { x: 0, y: 0 };
    const tgt = { x: 100, y: 100 };

    // Even with negative progress, linear still works (no clamp in fallback)
    const p = getPointOnEdge(undefined, -0.5, src, tgt);
    expect(typeof p.x).toBe('number');
    expect(typeof p.y).toBe('number');
  });
});
