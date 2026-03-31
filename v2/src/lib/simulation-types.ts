import type { Node as RFNode, Edge as RFEdge } from '@xyflow/react';

// Simulation speed config — base values, scaled by speedMultiplier
export const SPD_BASE = { move: 2000, wait: 800, launch: 250, wavePause: 1200, waves: 10, perWave: 10 };
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
}

// Pre-compute all fates deterministically before animation
export function precomputeFates(
  totalPeople: number,
  startNodeId: string,
  nodes: RFNode[],
  edges: RFEdge[]
): PrecomputedFate[] {
  const fates: PrecomputedFate[] = [];

  // Deterministic counters — same logic as real-time, but computed ahead
  const counters: Record<string, { arrivals: number; passed: number; routedNo: number; routedPartial: number; routedYes: number }> = {};

  for (let i = 0; i < totalPeople; i++) {
    const path: string[] = [];
    let currentNodeId = startNodeId;
    let outcome: 'success' | 'blocked' = 'blocked';
    let deathNode: string | undefined;
    let maxSteps = 50; // safety limit

    while (maxSteps-- > 0) {
      path.push(currentNodeId);
      const node = nodes.find(n => n.id === currentNodeId);
      if (!node) break;

      const data = node.data as Record<string, unknown>;
      const nodeType = data.nodeType as string;
      const prob = data.prob as number;

      // Terminal nodes
      if (nodeType === 'outcome-good') { outcome = 'success'; break; }
      if (nodeType === 'outcome-bad') { outcome = 'blocked'; break; }

      // Init counter for this node
      if (!counters[currentNodeId]) {
        counters[currentNodeId] = { arrivals: 0, passed: 0, routedNo: 0, routedPartial: 0, routedYes: 0 };
      }
      const cnt = counters[currentNodeId];

      // Gate node: 3-way deterministic split
      if (nodeType === 'gate' && typeof prob === 'number') {
        cnt.arrivals++;
        const out = edges.filter(e => e.source === currentNodeId);
        const noEdge = out.find(e => e.label === 'no' || e.label === 'fail');
        const partialEdge = out.find(e => e.label === 'partial');
        const yesEdge = out.find(e => e.label === 'yes' || e.label === 'pass');

        const partialPct = (partialEdge?.data as Record<string, unknown>)?.prob as number
          ?? Math.min(25, Math.floor((100 - prob) / 2));
        const noPct = 100 - prob - partialPct;

        const shouldNo = Math.floor(cnt.arrivals * noPct / 100);
        const shouldPartial = Math.floor(cnt.arrivals * (noPct + partialPct) / 100);

        let route: 'no' | 'partial' | 'yes';
        if (cnt.routedNo < shouldNo) route = 'no';
        else if (cnt.routedPartial < (shouldPartial - shouldNo)) route = 'partial';
        else route = 'yes';

        if (route === 'no') { cnt.routedNo++; deathNode = currentNodeId; currentNodeId = noEdge?.target || ''; }
        else if (route === 'partial') { cnt.routedPartial++; currentNodeId = partialEdge?.target || ''; }
        else { cnt.routedYes++; currentNodeId = yesEdge?.target || ''; }

        if (!currentNodeId) break;
        continue;
      }

      // Bottleneck/decision: binary pass/fail
      const isOutcomeNode = nodeType === 'outcome-good' || nodeType === 'outcome-bad';
      const hasProb = !isOutcomeNode && nodeType !== 'gate' && typeof prob === 'number' && prob < 100;

      if (hasProb) {
        cnt.arrivals++;
        const shouldHavePassed = Math.floor(cnt.arrivals * prob / 100);
        const pass = cnt.passed < shouldHavePassed;
        if (pass) cnt.passed++;

        if (!pass) {
          deathNode = currentNodeId;
          // Route to fail edge destination
          const failE = edges.find(e => e.source === currentNodeId && (e.label === 'fail' || e.label === 'no'));
          if (failE) path.push(failE.target);
          outcome = 'blocked';
          break;
        }

        // Pass: follow pass edge
        if (nodeType === 'bottleneck' || nodeType === 'decision') {
          const passE = edges.find(e => e.source === currentNodeId && (e.label === 'pass' || e.label === 'yes'));
          if (passE) { currentNodeId = passE.target; continue; }
        }
      }

      // Follow default edge (non-probabilistic nodes: state, action, desire, etc.)
      const out = edges.filter(e => e.source === currentNodeId);
      if (out.length === 0) {
        outcome = nodeType === 'outcome-good' ? 'success' : 'blocked';
        break;
      }
      currentNodeId = out[0].target;
    }

    fates.push({
      personId: i + 1,
      path,
      outcome,
      speedMult: 0.7 + Math.random() * 0.6,
      startDelay: Math.random() * 400,
      deathNode,
    });
  }

  return fates;
}
