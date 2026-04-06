/**
 * Multi-Agent Simulation — 1000 agents with diverse deterministic profiles.
 * All randomness is seed-based (reproducible). No Math.random().
 */

import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';
import { precomputeFates } from './simulation-types';

// ─── Seeded PRNG (Mulberry32) ───
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Box-Muller for normal distribution (deterministic) ───
function normalRandom(rng: () => number, mean: number, stddev: number): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1 || 0.0001)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

// ─── Sacred Root IDs (36 roots used across all templates) ───
const SACRED_ROOT_IDS = [
  'SR-001', 'SR-002', 'SR-003', 'SR-004', 'SR-005', 'SR-006',
  'SR-007', 'SR-008', 'SR-009', 'SR-010', 'SR-011', 'SR-012',
  'SR-013', 'SR-014', 'SR-015', 'SR-016', 'SR-017', 'SR-018',
  'SR-019', 'SR-020', 'SR-021', 'SR-022', 'SR-023', 'SR-024',
  'SR-025', 'SR-026', 'SR-027', 'SR-028', 'SR-029', 'SR-030',
  'SR-031', 'SR-032', 'SR-033', 'SR-034', 'SR-035', 'SR-036',
];

// ─── Country weights (deterministic distribution) ───
const COUNTRY_WEIGHTS: [string, number][] = [
  ['US', 30], ['UK', 10], ['Indonesia', 5], ['India', 8], ['Germany', 5],
  ['Brazil', 5], ['Nigeria', 4], ['Japan', 4], ['Canada', 4], ['Australia', 3],
  ['France', 3], ['Italy', 3], ['South Korea', 2], ['Mexico', 2], ['Kenya', 2],
  ['Singapore', 2], ['Netherlands', 2], ['Sweden', 1], ['Israel', 1],
  ['UAE', 1], ['Ghana', 1], ['Thailand', 1], ['Other', 1],
];

const COUNTRY_CUMULATIVE: [string, number][] = [];
{
  let cum = 0;
  for (const [country, weight] of COUNTRY_WEIGHTS) {
    cum += weight;
    COUNTRY_CUMULATIVE.push([country, cum]);
  }
}
const COUNTRY_TOTAL = COUNTRY_CUMULATIVE[COUNTRY_CUMULATIVE.length - 1][1];

function pickCountry(rng: () => number): string {
  const r = rng() * COUNTRY_TOTAL;
  for (const [country, cum] of COUNTRY_CUMULATIVE) {
    if (r <= cum) return country;
  }
  return 'Other';
}

// ─── Agent Interface ───
export interface SimAgent {
  id: number;
  age: number;                           // 18-65
  country: string;
  capital: number;                       // $100 - $1M
  experience: number;                    // 0-20 years
  networkSize: number;                   // 0-500
  sacredScores: Record<string, number>;  // 36 roots, 0-10
  riskTolerance: number;                 // 1-10
}

// ─── Generate deterministic agent population ───
export function generateAgentPopulation(count: number, seed: number): SimAgent[] {
  const rng = mulberry32(seed);
  const agents: SimAgent[] = [];

  for (let i = 0; i < count; i++) {
    // Age: normal distribution centered at 32, stddev 10, clamped 18-65
    const rawAge = normalRandom(rng, 32, 10);
    const age = Math.max(18, Math.min(65, Math.round(rawAge)));

    // Capital: log-normal distribution ($100 - $1M)
    const logCapital = normalRandom(rng, 9.2, 2.0); // ln(~10000) center
    const capital = Math.max(100, Math.min(1_000_000, Math.round(Math.exp(logCapital))));

    // Experience: correlated with age (age - 18, scaled, with noise)
    const maxExp = Math.max(0, age - 18);
    const expRatio = Math.max(0, Math.min(1, rng() * 0.8 + 0.1));
    const experience = Math.min(20, Math.round(maxExp * expRatio));

    // Network size: 0-500, skewed low
    const networkSize = Math.max(0, Math.min(500, Math.round(Math.exp(normalRandom(rng, 3.5, 1.5)))));

    // Sacred scores: each root independently 2-9
    const sacredScores: Record<string, number> = {};
    for (const root of SACRED_ROOT_IDS) {
      sacredScores[root] = Math.max(2, Math.min(9, Math.round(normalRandom(rng, 5.5, 1.8))));
    }

    // Risk tolerance: 1-10, normal distribution centered at 5
    const riskTolerance = Math.max(1, Math.min(10, Math.round(normalRandom(rng, 5, 2))));

    // Country
    const country = pickCountry(rng);

    agents.push({
      id: i + 1,
      age,
      country,
      capital,
      experience,
      networkSize,
      sacredScores,
      riskTolerance,
    });
  }

  return agents;
}

// ─── Multi-Agent Result Types ───
export interface MultiAgentResult {
  totalAgents: number;
  successRate: number;
  failureRate: number;
  distribution: { bucket: string; count: number }[];
  bottleneckAnalysis: { nodeLabel: string; nodeId: string; passRate: number; avgCapitalOfPassers: number }[];
  segmentation: {
    byAge: { range: string; successRate: number; count: number }[];
    byCapital: { range: string; successRate: number; count: number }[];
    byCountry: { country: string; successRate: number; count: number }[];
  };
  keyInsights: string[];
  agents: SimAgent[];
  outcomes: ('success' | 'blocked')[];
}

// ─── Compute agent-specific probability modifier ───
// Adjusts base probability based on agent profile attributes
function agentProbModifier(agent: SimAgent, baseProb: number): number {
  // Capital effect: more capital = slightly higher pass rate (+/- 10%)
  const capitalScore = Math.log10(Math.max(100, agent.capital));
  // capitalScore ranges from 2 (=$100) to 6 (=$1M), center at 4
  const capitalMod = ((capitalScore - 4) / 2) * 10;

  // Experience effect: more experience = higher pass rate (+/- 8%)
  const expMod = ((agent.experience - 5) / 15) * 8;

  // Network effect: bigger network = slightly higher (+/- 5%)
  const netMod = ((Math.min(agent.networkSize, 500) - 100) / 400) * 5;

  // Risk tolerance effect: higher risk = slight edge on action nodes (+/- 3%)
  const riskMod = ((agent.riskTolerance - 5) / 5) * 3;

  // Sacred scores average effect (+/- 12%)
  const sacredValues = Object.values(agent.sacredScores);
  const sacredAvg = sacredValues.reduce((s, v) => s + v, 0) / sacredValues.length;
  const sacredMod = ((sacredAvg - 5) / 5) * 12;

  const totalMod = capitalMod + expMod + netMod + riskMod + sacredMod;
  return Math.max(1, Math.min(99, Math.round(baseProb + totalMod)));
}

// ─── Run multi-agent simulation ───
export function runMultiAgentSim(
  agents: SimAgent[],
  nodes: RFNode[],
  edges: RFEdge[],
): MultiAgentResult {
  // Find start node (no incoming edges)
  const hasIncoming = new Set(edges.map(e => e.target));
  const startNodeIds = nodes.filter(n => !hasIncoming.has(n.id)).map(n => n.id);
  if (startNodeIds.length === 0) {
    return {
      totalAgents: agents.length,
      successRate: 0,
      failureRate: 100,
      distribution: [],
      bottleneckAnalysis: [],
      segmentation: { byAge: [], byCapital: [], byCountry: [] },
      keyInsights: ['No start nodes found in graph'],
      agents,
      outcomes: agents.map(() => 'blocked'),
    };
  }

  const startNodeId = startNodeIds[0];
  const outcomes: ('success' | 'blocked')[] = [];

  // Track which agents pass/fail at each node
  const nodePassers: Record<string, SimAgent[]> = {};
  const nodeArrivals: Record<string, number> = {};

  // Run each agent through the graph using precomputeFates with their sacred profile
  // We run each agent individually (1 person) to get their personal fate
  for (const agent of agents) {
    // Create a modified node set with agent-adjusted probabilities
    const adjustedNodes = nodes.map(n => {
      const data = n.data as Record<string, unknown>;
      const baseProb = data.prob as number;
      if (typeof baseProb === 'number' && baseProb < 100) {
        const adjustedProb = agentProbModifier(agent, baseProb);
        return { ...n, data: { ...data, prob: adjustedProb } };
      }
      return n;
    });

    const fates = precomputeFates(1, startNodeId, adjustedNodes, edges, agent.sacredScores);
    const fate = fates[0];
    outcomes.push(fate.outcome);

    // Track bottleneck passage
    for (const nodeId of fate.path) {
      nodeArrivals[nodeId] = (nodeArrivals[nodeId] || 0) + 1;
      if (!nodePassers[nodeId]) nodePassers[nodeId] = [];
    }

    // If agent was blocked at a specific node, that node killed them
    if (fate.deathNode) {
      // Agent did NOT pass this node
    } else {
      // Agent passed all nodes in their path
      for (const nodeId of fate.path) {
        if (!nodePassers[nodeId]) nodePassers[nodeId] = [];
        nodePassers[nodeId].push(agent);
      }
    }
  }

  const successCount = outcomes.filter(o => o === 'success').length;
  const successRate = Math.round((successCount / agents.length) * 1000) / 10;
  const failureRate = Math.round(((agents.length - successCount) / agents.length) * 1000) / 10;

  // ─── Distribution histogram ───
  const distribution = [
    { bucket: 'Success', count: successCount },
    { bucket: 'Blocked', count: agents.length - successCount },
  ];

  // ─── Bottleneck analysis ───
  const bottleneckAnalysis: MultiAgentResult['bottleneckAnalysis'] = [];
  for (const node of nodes) {
    const data = node.data as Record<string, unknown>;
    const nodeType = data.nodeType as string;
    const prob = data.prob as number;

    if ((nodeType === 'bottleneck' || nodeType === 'gate' || nodeType === 'decision') && typeof prob === 'number' && prob < 100) {
      const arrivals = nodeArrivals[node.id] || 0;
      const passers = nodePassers[node.id] || [];
      const passRate = arrivals > 0 ? Math.round((passers.length / arrivals) * 1000) / 10 : 0;
      const avgCapital = passers.length > 0
        ? Math.round(passers.reduce((s, a) => s + a.capital, 0) / passers.length)
        : 0;

      if (arrivals > 0) {
        bottleneckAnalysis.push({
          nodeLabel: data.label as string || node.id,
          nodeId: node.id,
          passRate,
          avgCapitalOfPassers: avgCapital,
        });
      }
    }
  }

  // Sort by pass rate ascending (deadliest first)
  bottleneckAnalysis.sort((a, b) => a.passRate - b.passRate);

  // ─── Segmentation ───
  const ageRanges = [
    { range: '18-24', min: 18, max: 24 },
    { range: '25-34', min: 25, max: 34 },
    { range: '35-44', min: 35, max: 44 },
    { range: '45-54', min: 45, max: 54 },
    { range: '55-65', min: 55, max: 65 },
  ];

  const byAge = ageRanges.map(({ range, min, max }) => {
    const inRange = agents.filter((a) => a.age >= min && a.age <= max);
    const successes = inRange.filter((_, i) => outcomes[agents.indexOf(inRange[i])] === 'success').length;
    // Use index mapping properly
    const successesCorrect = inRange.filter(a => outcomes[agents.indexOf(a)] === 'success').length;
    return {
      range,
      successRate: inRange.length > 0 ? Math.round((successesCorrect / inRange.length) * 1000) / 10 : 0,
      count: inRange.length,
    };
  });

  const capitalRanges = [
    { range: '$100-1K', min: 100, max: 1000 },
    { range: '$1K-10K', min: 1001, max: 10000 },
    { range: '$10K-50K', min: 10001, max: 50000 },
    { range: '$50K-100K', min: 50001, max: 100000 },
    { range: '$100K-500K', min: 100001, max: 500000 },
    { range: '$500K-1M', min: 500001, max: 1000000 },
  ];

  const byCapital = capitalRanges.map(({ range, min, max }) => {
    const inRange = agents.filter(a => a.capital >= min && a.capital <= max);
    const successes = inRange.filter(a => outcomes[agents.indexOf(a)] === 'success').length;
    return {
      range,
      successRate: inRange.length > 0 ? Math.round((successes / inRange.length) * 1000) / 10 : 0,
      count: inRange.length,
    };
  });

  // By country: top 10 countries by agent count
  const countryMap = new Map<string, { total: number; success: number }>();
  for (let i = 0; i < agents.length; i++) {
    const c = agents[i].country;
    const entry = countryMap.get(c) || { total: 0, success: 0 };
    entry.total++;
    if (outcomes[i] === 'success') entry.success++;
    countryMap.set(c, entry);
  }

  const byCountry = Array.from(countryMap.entries())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([country, data]) => ({
      country,
      successRate: Math.round((data.success / data.total) * 1000) / 10,
      count: data.total,
    }));

  // ─── Key Insights ───
  const keyInsights: string[] = [];

  // Capital insight
  const highCapAgents = agents.filter(a => a.capital > 50000);
  const highCapSuccess = highCapAgents.filter(a => outcomes[agents.indexOf(a)] === 'success').length;
  const lowCapAgents = agents.filter(a => a.capital <= 50000);
  const lowCapSuccess = lowCapAgents.filter(a => outcomes[agents.indexOf(a)] === 'success').length;
  if (lowCapAgents.length > 0 && highCapAgents.length > 0) {
    const highRate = highCapSuccess / highCapAgents.length;
    const lowRate = lowCapSuccess / lowCapAgents.length;
    if (lowRate > 0) {
      const multiplier = (highRate / lowRate).toFixed(1);
      keyInsights.push(`Agents with >$50K capital are ${multiplier}x more likely to succeed`);
    } else if (highRate > 0) {
      keyInsights.push(`Only agents with >$50K capital succeeded (${(highRate * 100).toFixed(1)}% success rate)`);
    }
  }

  // Experience insight
  const expAgents = agents.filter(a => a.experience >= 10);
  const expSuccess = expAgents.filter(a => outcomes[agents.indexOf(a)] === 'success').length;
  if (expAgents.length > 0) {
    const expRate = (expSuccess / expAgents.length * 100).toFixed(1);
    keyInsights.push(`Experienced agents (10+ years) succeed at ${expRate}% vs ${successRate}% overall`);
  }

  // Deadliest bottleneck insight
  if (bottleneckAnalysis.length > 0) {
    const deadliest = bottleneckAnalysis[0];
    keyInsights.push(`Deadliest bottleneck: "${deadliest.nodeLabel}" blocks ${(100 - deadliest.passRate).toFixed(1)}% of agents`);
  }

  // Network insight
  const bigNetAgents = agents.filter(a => a.networkSize >= 200);
  const bigNetSuccess = bigNetAgents.filter(a => outcomes[agents.indexOf(a)] === 'success').length;
  if (bigNetAgents.length > 10) {
    const netRate = (bigNetSuccess / bigNetAgents.length * 100).toFixed(1);
    keyInsights.push(`Agents with 200+ network connections succeed at ${netRate}%`);
  }

  return {
    totalAgents: agents.length,
    successRate,
    failureRate,
    distribution,
    bottleneckAnalysis,
    segmentation: { byAge, byCapital, byCountry },
    keyInsights,
    agents,
    outcomes,
  };
}
