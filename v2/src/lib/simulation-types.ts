import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

// Simulation speed config — base values, scaled by speedMultiplier
export const SPD_BASE = { move: 2000, wait: 800, launch: 250, wavePause: 1200, waves: 10, perWave: 10 };

// Simulation launch modes
export type LaunchMode = 'wave' | 'simultaneous';

export interface SimSettings {
  launchMode: LaunchMode;
  speedVariation: boolean; // per-person speed variation (0.7x-1.3x)
  pathFollowing: boolean;  // SVG edge path following (smooth curves)
}
// Speed levels: 0=1x, 1=1.5x, 2=2x, 3=3x, 4=5x, 5=8x
export const SPEED_LEVELS = [1, 1.5, 2, 3, 5, 8];
export const SPEED_LABELS = ['1x', '1.5x', '2x', '3x', '5x', '8x'];

export interface PrecomputedFate {
  personId: number;
  path: string[];              // node IDs to visit in order
  outcome: 'success' | 'blocked';
  speedMult: number;           // 0.7–1.3 individual variation
  startDelay: number;          // 0–400ms stagger at launch
  deathNode?: string;          // bottleneck that killed them (for death counter)
  isYou?: boolean;             // first particle = YOU avatar
  outcomeNodeId?: string;      // terminal node ID where this person ended up
}

/**
 * Compute personalized probability for the YOU particle using sacredProfile.
 * Adjusts generic prob by +/- up to 15% based on average sacred scores.
 * Returns clamped 1–99 (never 0 or 100 to keep determinism clean).
 */
export function computePersonalProb(
  genericProb: number,
  sacredProfile?: Record<string, number> | null,
): number {
  if (!sacredProfile || Object.keys(sacredProfile).length === 0) return genericProb;
  const scores = Object.values(sacredProfile);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length; // 0–10 scale
  // Map avg 0–10 to modifier -15..+15
  const modifier = ((avg - 5) / 5) * 15;
  return Math.max(1, Math.min(99, Math.round(genericProb + modifier)));
}

/**
 * Determine if the YOU particle passes a bottleneck/gate.
 * Uses a dynamic threshold instead of a fixed 50% cutoff.
 *
 * How it works:
 * - Base threshold is 50%
 * - Sacred profile shifts it: strong profile (avg 7-10) lowers threshold (easier to pass),
 *   weak profile (avg 0-3) raises it (harder to pass)
 * - Shift range: ±10 points (threshold can be 40-60)
 * - Clamped to 20-80 so extreme probs always behave correctly
 *
 * Examples with avg sacred score 8/10 (threshold = 44):
 *   prob 45% → pass (45 >= 44)  — previously would FAIL at 50 cutoff
 *   prob 43% → fail (43 < 44)
 * Examples with avg sacred score 2/10 (threshold = 56):
 *   prob 55% → fail (55 < 56)   — previously would PASS at 50 cutoff
 *   prob 57% → pass (57 >= 56)
 */
export function shouldYouPass(
  prob: number,
  sacredProfile?: Record<string, number> | null,
): boolean {
  const personalProb = computePersonalProb(prob, sacredProfile);
  if (!sacredProfile || Object.keys(sacredProfile).length === 0) {
    return personalProb >= 50;
  }
  const scores = Object.values(sacredProfile);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  // avg 5 = no shift, avg 10 = threshold drops to 40, avg 0 = threshold rises to 60
  const thresholdShift = (5 - avg) * 2;
  const threshold = Math.max(20, Math.min(80, 50 + thresholdShift));
  return personalProb >= threshold;
}

/**
 * Determine the YOU particle's gate route (3-way: no/partial/yes).
 * Uses proportional boundaries based on personalized prob + sacred threshold.
 */
export function youGateRoute(
  prob: number,
  partialPct: number,
  sacredProfile?: Record<string, number> | null,
): 'no' | 'partial' | 'yes' {
  const personalProb = computePersonalProb(prob, sacredProfile);
  const noPct = 100 - personalProb - partialPct;

  if (!sacredProfile || Object.keys(sacredProfile).length === 0) {
    if (personalProb >= 50) return 'yes';
    if (personalProb >= noPct) return 'partial';
    return 'no';
  }

  const scores = Object.values(sacredProfile);
  const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
  // Sacred bonus: shifts the yes/partial/no boundaries
  // Strong profile (avg 8) = +6 bonus to effective prob for routing
  // Weak profile (avg 2) = -6 penalty
  const sacredBonus = (avg - 5) * 2;
  const effectiveForRouting = personalProb + sacredBonus;

  if (effectiveForRouting >= 50) return 'yes';
  if (effectiveForRouting >= noPct) return 'partial';
  return 'no';
}

// Pre-compute all fates deterministically before animation
export function precomputeFates(
  totalPeople: number,
  startNodeId: string,
  nodes: RFNode[],
  edges: RFEdge[],
  sacredProfile?: Record<string, number> | null,
): PrecomputedFate[] {
  const fates: PrecomputedFate[] = [];

  // Deterministic counters — same logic as real-time, but computed ahead
  const counters: Record<string, { arrivals: number; passed: number; routedNo: number; routedPartial: number; routedYes: number }> = {};

  for (let i = 0; i < totalPeople; i++) {
    const isYou = i === 0; // First particle is always YOU
    const path: string[] = [];
    let currentNodeId = startNodeId;
    let outcome: 'success' | 'blocked' = 'blocked';
    let deathNode: string | undefined;
    let outcomeNodeId: string | undefined;
    let maxSteps = 50; // safety limit

    while (maxSteps-- > 0) {
      path.push(currentNodeId);
      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) break;

      const data = node.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      const prob = data.prob as number;

      // Terminal nodes
      if (nodeType === 'outcome-good') { outcome = 'success'; outcomeNodeId = currentNodeId; break; }
      if (nodeType === 'outcome-bad') { outcome = 'blocked'; outcomeNodeId = currentNodeId; break; }

      // Init counter for this node
      if (!counters[currentNodeId]) {
        counters[currentNodeId] = { arrivals: 0, passed: 0, routedNo: 0, routedPartial: 0, routedYes: 0 };
      }
      const cnt = counters[currentNodeId];

      // Gate node: 3-way deterministic split
      if (nodeType === 'gate' && typeof prob === 'number') {
        cnt.arrivals++;

        // YOU uses personalized probability at gates
        const effectiveProb = isYou ? computePersonalProb(prob, sacredProfile) : prob;

        const out = edges.filter(e => e.source === currentNodeId);
        const noEdge = out.find(e => { const l = ((e.label || '') as string).toLowerCase(); return l === 'no' || l === 'fail' || l.startsWith('no ') || l.startsWith('no(') || l.startsWith('fail ') || l.startsWith('fail('); });
        const partialEdge = out.find(e => ((e.label || '') as string).toLowerCase().startsWith('partial'));
        const yesEdge = out.find(e => { const l = ((e.label || '') as string).toLowerCase(); return l === 'yes' || l === 'pass' || l.startsWith('yes ') || l.startsWith('yes(') || l.startsWith('pass ') || l.startsWith('pass('); });

        const partialPct = (partialEdge?.data as Record<string, unknown>)?.prob as number
          ?? Math.min(25, Math.floor((100 - effectiveProb) / 2));
        const noPct = 100 - effectiveProb - partialPct;

        // For YOU: use dynamic threshold routing (not fixed 50% cutoff)
        if (isYou) {
          const route = youGateRoute(prob, partialPct, sacredProfile);

          const fallback = out[0]?.target || '';
          if (route === 'no') { cnt.routedNo++; deathNode = currentNodeId; currentNodeId = noEdge?.target || fallback; }
          else if (route === 'partial') { cnt.routedPartial++; currentNodeId = partialEdge?.target || fallback; }
          else { cnt.routedYes++; currentNodeId = yesEdge?.target || fallback; }
          if (!currentNodeId) break;
          continue;
        }

        const shouldNo = Math.round(cnt.arrivals * noPct / 100);
        const shouldPartial = Math.round(cnt.arrivals * (noPct + partialPct) / 100);

        let route: 'no' | 'partial' | 'yes';
        if (cnt.routedNo < shouldNo) route = 'no';
        else if (cnt.routedPartial < (shouldPartial - shouldNo)) route = 'partial';
        else route = 'yes';

        const fallbackTarget = out[0]?.target || '';
        if (route === 'no') { cnt.routedNo++; deathNode = currentNodeId; currentNodeId = noEdge?.target || fallbackTarget; }
        else if (route === 'partial') { cnt.routedPartial++; currentNodeId = partialEdge?.target || fallbackTarget; }
        else { cnt.routedYes++; currentNodeId = yesEdge?.target || fallbackTarget; }

        if (!currentNodeId) break;
        continue;
      }

      // Bottleneck/decision: binary pass/fail
      const isOutcomeNode = nodeType === 'outcome-good' || nodeType === 'outcome-bad';
      const hasProb = !isOutcomeNode && nodeType !== 'gate' && typeof prob === 'number' && prob < 100;

      if (hasProb) {
        cnt.arrivals++;

        // YOU uses dynamic threshold routing at bottlenecks (not fixed 50% cutoff)
        if (isYou) {
          const pass = shouldYouPass(prob, sacredProfile);
          if (pass) cnt.passed++;

          if (!pass) {
            deathNode = currentNodeId;
            const failE = edges.find(e => e.source === currentNodeId && (((e.label || '') as string).toLowerCase().startsWith('fail') || ((e.label || '') as string).toLowerCase().startsWith('no')));
            if (failE) { path.push(failE.target); outcomeNodeId = failE.target; }
            else { outcomeNodeId = currentNodeId; }
            outcome = 'blocked';
            break;
          }

          if (nodeType === 'bottleneck' || nodeType === 'decision') {
            const passE = edges.find(e => e.source === currentNodeId && (((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes')));
            if (passE) { currentNodeId = passE.target; continue; }
          }
        } else {
          const shouldHavePassed = Math.round(cnt.arrivals * prob / 100);
          const pass = cnt.passed < shouldHavePassed;
          if (pass) cnt.passed++;

          if (!pass) {
            deathNode = currentNodeId;
            const failE = edges.find(e => e.source === currentNodeId && (((e.label || '') as string).toLowerCase().startsWith('fail') || ((e.label || '') as string).toLowerCase().startsWith('no')));
            if (failE) { path.push(failE.target); outcomeNodeId = failE.target; }
            else { outcomeNodeId = currentNodeId; }
            outcome = 'blocked';
            break;
          }

          if (nodeType === 'bottleneck' || nodeType === 'decision') {
            const passE = edges.find(e => e.source === currentNodeId && (((e.label || '') as string).toLowerCase().startsWith('pass') || ((e.label || '') as string).toLowerCase().startsWith('yes')));
            if (passE) { currentNodeId = passE.target; continue; }
          }
        }
      }

      // Follow default edge (non-probabilistic nodes: state, action, desire, etc.)
      const out = edges.filter(e => e.source === currentNodeId);
      if (out.length === 0) {
        outcome = nodeType === 'outcome-good' ? 'success' : 'blocked';
        outcomeNodeId = currentNodeId;
        break;
      }
      currentNodeId = out[0].target;
    }

    // Deterministic speed variation based on person index (no Math.random)
    // Spread evenly from 0.7 to 1.3
    const t = totalPeople > 2 ? (i - 1) / (totalPeople - 2) : 0.5;
    const speedMult = isYou ? 1.0 : (0.7 + t * 0.6);
    // Deterministic stagger delay based on index
    const startDelay = isYou ? 0 : Math.round(((i - 1) % 10) / 9 * 400);

    fates.push({
      personId: i + 1,
      path,
      outcome,
      speedMult,
      startDelay,
      deathNode,
      isYou,
      outcomeNodeId,
    });
  }

  return fates;
}
