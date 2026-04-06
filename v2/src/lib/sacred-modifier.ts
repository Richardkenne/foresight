/**
 * Sacred Modifier Engine
 *
 * Computes personalized probabilities based on the user's Sacred Profile.
 * Each node has associated sacred roots (SR-001..SR-036). The user's score
 * on those roots modifies the generic probability up or down.
 *
 * Mapping: score 0 -> 0.5x, score 5 -> 1.0x, score 10 -> 1.5x (linear)
 */

import type { SacredProfile } from './sacred-assessment';
import sacredRootsData from './sacred-roots.json';

// Build a label lookup: SR-001 -> "Faith / Trust"
const ROOT_LABELS: Record<string, string> = {};
(sacredRootsData as Array<{ id: string; label_positive: string }>).forEach(r => {
  ROOT_LABELS[r.id] = r.label_positive;
});

export interface PersonalProb {
  generic: number;      // original probability
  personal: number;     // modified by sacred profile
  modifier: number;     // multiplier applied (0.5 - 1.5)
  reason: string;       // human-readable explanation
  rootId: string;       // primary root driving the modifier
  rootScore: number;    // user's score on the primary root
}

/**
 * Convert a sacred root score (0-10) to a multiplier (0.5-1.5).
 * Linear interpolation: 0->0.5, 5->1.0, 10->1.5
 */
function scoreToMultiplier(score: number): number {
  return 0.5 + (score / 10) * 1.0;
}

/**
 * Compute personalized probability for a single node.
 *
 * @param genericProb - The node's original probability (0-100)
 * @param nodeSacredRoots - Array of sacred root IDs assigned to the node
 * @param sacredProfile - User's 36 scores (rootId -> 0-10)
 * @returns PersonalProb with all details, or null if no roots match
 */
export function computePersonalProb(
  genericProb: number,
  nodeSacredRoots: string[],
  sacredProfile: SacredProfile,
): PersonalProb | null {
  if (!nodeSacredRoots?.length || !sacredProfile || Object.keys(sacredProfile).length === 0) {
    return null;
  }

  // Find roots that exist in both the node and the user's profile
  const matchedRoots = nodeSacredRoots.filter(id => sacredProfile[id] != null);
  if (matchedRoots.length === 0) return null;

  // Average the user's scores for all matched roots
  const avgScore = matchedRoots.reduce((sum, id) => sum + sacredProfile[id], 0) / matchedRoots.length;
  const modifier = scoreToMultiplier(avgScore);

  // Apply modifier, clamp 1-99
  const raw = genericProb * modifier;
  const personal = Math.max(1, Math.min(99, Math.round(raw * 10) / 10));

  // Find the root with the lowest score (biggest drag) or highest (biggest boost)
  // to use as the "primary" reason
  let primaryId = matchedRoots[0];
  let primaryScore = sacredProfile[primaryId];
  for (const id of matchedRoots) {
    const s = sacredProfile[id];
    // Pick the root furthest from 5 (neutral) — the one with most impact
    if (Math.abs(s - 5) > Math.abs(primaryScore - 5)) {
      primaryId = id;
      primaryScore = s;
    }
  }

  const rootLabel = ROOT_LABELS[primaryId] || primaryId;
  const direction = modifier > 1.01 ? '+' : modifier < 0.99 ? '' : '';
  const pctChange = Math.round((modifier - 1) * 100);
  const reason = `Your ${rootLabel} (${primaryId}) is ${primaryScore}/10 → ${direction}${pctChange}%`;

  return {
    generic: genericProb,
    personal,
    modifier: Math.round(modifier * 1000) / 1000,
    reason,
    rootId: primaryId,
    rootScore: primaryScore,
  };
}

/**
 * Batch compute personal probabilities for all nodes that have sacredRoots.
 * Returns a map: nodeId -> PersonalProb
 */
export function computeAllPersonalProbs(
  nodes: Array<{ id: string | number; prob?: number; sacredRoots?: string[] }>,
  sacredProfile: SacredProfile,
): Record<string, PersonalProb> {
  const result: Record<string, PersonalProb> = {};
  for (const node of nodes) {
    if (node.prob == null || !node.sacredRoots?.length) continue;
    const pp = computePersonalProb(node.prob, node.sacredRoots, sacredProfile);
    if (pp) {
      result[String(node.id)] = pp;
    }
  }
  return result;
}
