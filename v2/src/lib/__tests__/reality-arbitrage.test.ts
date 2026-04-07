import { describe, it, expect } from 'vitest';
import {
  findArbitrageOpportunities,
  getArbitrageById,
  getArbitrageCategories,
  getTopArbitrage,
} from '../reality-arbitrage';

describe('findArbitrageOpportunities', () => {
  it('returns all opportunities when no category filter', () => {
    const all = findArbitrageOpportunities();
    expect(all.length).toBeGreaterThan(20);
  });

  it('filters by business category', () => {
    const biz = findArbitrageOpportunities('business');
    expect(biz.length).toBeGreaterThan(0);
    biz.forEach(o => expect(o.category).toBe('business'));
  });

  it('filters by career category', () => {
    const career = findArbitrageOpportunities('career');
    expect(career.length).toBeGreaterThan(0);
    career.forEach(o => expect(o.category).toBe('career'));
  });

  it('filters by investment category', () => {
    const inv = findArbitrageOpportunities('investment');
    expect(inv.length).toBeGreaterThan(0);
    inv.forEach(o => expect(o.category).toBe('investment'));
  });

  it('filters by lifestyle category', () => {
    const life = findArbitrageOpportunities('lifestyle');
    expect(life.length).toBeGreaterThan(0);
    life.forEach(o => expect(o.category).toBe('lifestyle'));
  });

  it('filters by geography category', () => {
    const geo = findArbitrageOpportunities('geography');
    expect(geo.length).toBeGreaterThan(0);
    geo.forEach(o => expect(o.category).toBe('geography'));
  });

  it('every opportunity has required fields', () => {
    const all = findArbitrageOpportunities();
    all.forEach(o => {
      expect(o.id).toBeTruthy();
      expect(o.title).toBeTruthy();
      expect(o.publicPerception).toBeTruthy();
      expect(o.dataReality).toBeTruthy();
      expect(o.gapScore).toBeGreaterThanOrEqual(1);
      expect(o.gapScore).toBeLessThanOrEqual(10);
      expect(o.evidence.length).toBeGreaterThan(0);
      expect(o.simulateScenario).toBeTruthy();
    });
  });
});

describe('getArbitrageById', () => {
  it('finds opportunity by ID', () => {
    const opp = getArbitrageById('biz-dark-kitchen');
    expect(opp).toBeDefined();
    expect(opp!.title).toContain('Dark Kitchen');
  });

  it('returns undefined for non-existent ID', () => {
    expect(getArbitrageById('nonexistent')).toBeUndefined();
  });
});

describe('getArbitrageCategories', () => {
  it('returns all 5 categories', () => {
    const cats = getArbitrageCategories();
    const names = cats.map(c => c.name);
    expect(names).toContain('business');
    expect(names).toContain('career');
    expect(names).toContain('investment');
    expect(names).toContain('lifestyle');
    expect(names).toContain('geography');
  });

  it('each category has a positive count', () => {
    const cats = getArbitrageCategories();
    cats.forEach(c => expect(c.count).toBeGreaterThan(0));
  });
});

describe('getTopArbitrage', () => {
  it('returns top 10 by default', () => {
    const top = getTopArbitrage();
    expect(top).toHaveLength(10);
  });

  it('results are sorted by gapScore descending', () => {
    const top = getTopArbitrage(20);
    for (let i = 1; i < top.length; i++) {
      expect(top[i].gapScore).toBeLessThanOrEqual(top[i - 1].gapScore);
    }
  });

  it('respects custom limit', () => {
    const top = getTopArbitrage(3);
    expect(top).toHaveLength(3);
  });
});
