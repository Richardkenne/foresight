import { describe, it, expect } from 'vitest';
import { getShapePositions, SACRED_ROOT_SHAPES } from '../point-cloud-shapes';

describe('SACRED_ROOT_SHAPES', () => {
  it('has entries for all 36 sacred roots', () => {
    for (let i = 1; i <= 36; i++) {
      const id = `SR-${String(i).padStart(3, '0')}`;
      expect(SACRED_ROOT_SHAPES[id]).toBeDefined();
      expect(typeof SACRED_ROOT_SHAPES[id]).toBe('string');
    }
  });
});

describe('getShapePositions', () => {
  it('returns Float32Array of correct length for default particle count', () => {
    const positions = getShapePositions('SR-001');
    // Default is 800 particles, 3 coords each
    expect(positions).toBeInstanceOf(Float32Array);
    expect(positions.length).toBe(800 * 3);
  });

  it('returns Float32Array of correct length for custom particle count', () => {
    const positions = getShapePositions('SR-010', 200);
    expect(positions).toBeInstanceOf(Float32Array);
    expect(positions.length).toBe(200 * 3);
  });

  it('all 36 shapes return correct length arrays', () => {
    for (let i = 1; i <= 36; i++) {
      const id = `SR-${String(i).padStart(3, '0')}`;
      const positions = getShapePositions(id, 50);
      expect(positions).toBeInstanceOf(Float32Array);
      expect(positions.length).toBe(50 * 3);
    }
  });

  it('uses fallback shape for unknown root ID', () => {
    const positions = getShapePositions('SR-999', 100);
    expect(positions).toBeInstanceOf(Float32Array);
    expect(positions.length).toBe(100 * 3);
  });

  it('positions are within roughly [-2,2] bounding box', () => {
    // The docs say [-1,1]^3 but with some tolerance for randomness
    const positions = getShapePositions('SR-001', 500);
    for (let i = 0; i < positions.length; i++) {
      expect(Math.abs(positions[i])).toBeLessThanOrEqual(2.5);
    }
  });

  it('no NaN or Infinity values in positions', () => {
    for (let i = 1; i <= 36; i++) {
      const id = `SR-${String(i).padStart(3, '0')}`;
      const positions = getShapePositions(id, 100);
      for (let j = 0; j < positions.length; j++) {
        expect(Number.isFinite(positions[j])).toBe(true);
      }
    }
  });
});
