import { describe, it, expect } from 'vitest';
import { generateAgentPopulation } from '../multi-agent';

describe('generateAgentPopulation', () => {
  it('generates the requested number of agents', () => {
    const agents = generateAgentPopulation(100, 42);
    expect(agents).toHaveLength(100);
  });

  it('generates 1000 agents, all with valid fields', () => {
    const agents = generateAgentPopulation(1000, 12345);
    expect(agents).toHaveLength(1000);
    agents.forEach(a => {
      expect(a.id).toBeGreaterThan(0);
      expect(a.age).toBeGreaterThanOrEqual(18);
      expect(a.age).toBeLessThanOrEqual(65);
      expect(a.capital).toBeGreaterThanOrEqual(100);
      expect(a.capital).toBeLessThanOrEqual(1_000_000);
      expect(a.experience).toBeGreaterThanOrEqual(0);
      expect(a.experience).toBeLessThanOrEqual(20);
      expect(a.networkSize).toBeGreaterThanOrEqual(0);
      expect(a.networkSize).toBeLessThanOrEqual(500);
      expect(a.riskTolerance).toBeGreaterThanOrEqual(1);
      expect(a.riskTolerance).toBeLessThanOrEqual(10);
      expect(a.country).toBeTruthy();
      expect(Object.keys(a.sacredScores)).toHaveLength(36);
    });
  });

  it('is deterministic: same seed produces same agents', () => {
    const a1 = generateAgentPopulation(50, 999);
    const a2 = generateAgentPopulation(50, 999);
    for (let i = 0; i < 50; i++) {
      expect(a1[i].age).toBe(a2[i].age);
      expect(a1[i].capital).toBe(a2[i].capital);
      expect(a1[i].country).toBe(a2[i].country);
      expect(a1[i].experience).toBe(a2[i].experience);
      expect(a1[i].sacredScores).toEqual(a2[i].sacredScores);
    }
  });

  it('different seeds produce different agents', () => {
    const a1 = generateAgentPopulation(50, 1);
    const a2 = generateAgentPopulation(50, 2);
    // Not all agents should be identical
    const allSame = a1.every((a, i) => a.age === a2[i].age && a.capital === a2[i].capital);
    expect(allSame).toBe(false);
  });

  it('age distribution centers around 32', () => {
    const agents = generateAgentPopulation(1000, 42);
    const avgAge = agents.reduce((sum, a) => sum + a.age, 0) / agents.length;
    // Should be close to 32 (within 3)
    expect(avgAge).toBeGreaterThan(29);
    expect(avgAge).toBeLessThan(35);
  });

  it('capital is positive for all agents', () => {
    const agents = generateAgentPopulation(500, 77);
    agents.forEach(a => {
      expect(a.capital).toBeGreaterThan(0);
    });
  });

  it('sacred scores are in 2-9 range for all roots', () => {
    const agents = generateAgentPopulation(200, 55);
    agents.forEach(a => {
      for (const score of Object.values(a.sacredScores)) {
        expect(score).toBeGreaterThanOrEqual(2);
        expect(score).toBeLessThanOrEqual(9);
      }
    });
  });

  it('assigns IDs sequentially starting from 1', () => {
    const agents = generateAgentPopulation(10, 42);
    agents.forEach((a, i) => {
      expect(a.id).toBe(i + 1);
    });
  });
});
