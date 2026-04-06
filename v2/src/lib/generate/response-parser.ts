import type { FlowNode } from './types';

// ============ JSON REPAIR ============
// Fixes common LLM JSON issues: trailing commas, missing brackets, unescaped chars
export function repairJSON(raw: string): string {
  let s = raw.trim();
  // Strip markdown fences
  s = s.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  // Extract outermost JSON object if wrapped in text
  const objMatch = s.match(/\{[\s\S]*\}/);
  if (objMatch) s = objMatch[0];
  // Fix trailing commas before } or ]
  s = s.replace(/,\s*([\]}])/g, '$1');
  // Fix missing commas between objects in arrays: }{ → },{
  s = s.replace(/\}\s*\{/g, '},{');
  // Fix single quotes to double quotes (but not inside strings)
  if (!s.includes('"nodes"') && s.includes("'nodes'")) {
    s = s.replace(/'/g, '"');
  }
  // Remove control characters that break JSON
  s = s.replace(/[\x00-\x1f]/g, (c) => c === '\n' || c === '\r' || c === '\t' ? c : '');
  // Fix truncated JSON — close open brackets/braces
  let braces = 0, brackets = 0, inString = false, escape = false;
  for (const c of s) {
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') braces++;
    if (c === '}') braces--;
    if (c === '[') brackets++;
    if (c === ']') brackets--;
  }
  // Remove trailing comma before closing
  s = s.replace(/,\s*$/, '');
  // Close unclosed structures
  while (brackets > 0) { s += ']'; brackets--; }
  while (braces > 0) { s += '}'; braces--; }
  return s;
}

// ============ NODE DEPENDENCY POST-PROCESSING ============
// After Claude returns the graph, apply modifiesDownstream modifiers to target node probs
export function applyNodeDependencies(flow: Record<string, unknown>): void {
  const nodes = flow.nodes as FlowNode[] | undefined;
  if (!nodes || !Array.isArray(nodes)) return;

  // Build label -> node index map (case-insensitive)
  const labelMap = new Map<string, number>();
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].label) {
      labelMap.set(nodes[i].label.toLowerCase().trim(), i);
    }
  }

  // Collect all modifiers: targetLabel -> list of multipliers
  const modifiers = new Map<string, number[]>();

  for (const node of nodes) {
    if (!node.modifiesDownstream || !Array.isArray(node.modifiesDownstream)) continue;
    for (const dep of node.modifiesDownstream) {
      if (!dep.targetNodeLabel || typeof dep.modifier !== 'number') continue;
      // Clamp modifier to sane range
      const mod = Math.max(0.1, Math.min(3.0, dep.modifier));
      const key = dep.targetNodeLabel.toLowerCase().trim();
      if (!modifiers.has(key)) modifiers.set(key, []);
      modifiers.get(key)!.push(mod);
    }
  }

  // Apply combined modifiers (multiply all together)
  for (const [targetLabel, mods] of modifiers) {
    const idx = labelMap.get(targetLabel);
    if (idx == null) continue;
    const targetNode = nodes[idx];
    if (typeof targetNode.prob !== 'number' || targetNode.prob >= 100) continue;

    const combinedModifier = mods.reduce((acc, m) => acc * m, 1.0);
    const originalProb = targetNode.prob;
    // Apply modifier, clamp to 1-99 (never 0% or 100%)
    targetNode.prob = Math.round(Math.max(1, Math.min(99, originalProb * combinedModifier)));

    // Also adjust probRange if present
    const probRange = targetNode.probRange as { optimistic: number; adverse: number } | undefined;
    if (probRange) {
      probRange.optimistic = Math.round(Math.max(1, Math.min(99, probRange.optimistic * combinedModifier)));
      probRange.adverse = Math.round(Math.max(1, Math.min(99, probRange.adverse * combinedModifier)));
    }
  }
}
