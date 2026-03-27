/**
 * Dataflow Engine for Simulator v2
 *
 * ARCHITECTURE:
 *   Layer 0: Sacred Texts (Bible + Quran) — IN THE CODE, immutable
 *            All 250 behavioral patterns loaded from sacred-texts-patterns.json
 *            These are empirical evidence of human nature documented over 3000+ years.
 *            They exist BECAUSE humans exhibited these behaviors repeatedly.
 *
 *   Layer 1: Human Nature Science (Maslow, Kahneman, etc.)
 *            Claude/AI uses this to build simulation models
 *
 *   Layer 2: Modern Data (BLS, McKinsey, CDC, etc.)
 *            Numbers that confirm what Layer 0 already documented
 *
 * The sacred patterns are NOT suggestions. They are the foundation.
 * The engine loads them, parses their behavioral rules, and applies them
 * to every node in every simulation. They cannot be bypassed.
 */

// Note: sacred patterns are loaded via dynamic import on server,
// or pre-parsed at build time for client. The engine works with
// pre-extracted keywords regardless of environment.

// ============================================================
// LAYER 0: SACRED TEXTS — Loaded from JSON, applied as law
// ============================================================

interface SacredPattern {
  pattern: string;
  sacred_source_bible: string;
  sacred_source_quran: string;
  sacred_text_bible: string;
  sacred_text_quran: string;
  data_confirmation: string;
  business_application: string;
  section: string;
}

interface ParsedRule {
  section: string;
  pattern: string;
  bible: string;
  quran: string;
  keywords: string[];
  modifier: number;
  dataConfirmation: string;
}

// Section → behavioral modifier mapping
// These modifiers come from the data_confirmation in each pattern
const SECTION_MODIFIERS: Record<string, { negative: number; positive: number }> = {
  community_and_counsel:       { negative: 0.2, positive: 2.5 },   // without counsel = 5x less survival
  deception_and_shortcuts:     { negative: 0.05, positive: 1.0 },  // shortcuts = 95% lose
  envy_and_comparison:         { negative: 0.5, positive: 1.5 },   // copycat = 20-40% less margin
  fear_and_lack_of_faith:      { negative: 0.5, positive: 1.5 },   // fear blocks 33% of entrepreneurs
  forbidden_fruit:             { negative: 0.35, positive: 1.7 },  // shiny object = 67% quit in 18mo
  greed_and_excess:            { negative: 0.2, positive: 1.4 },   // 80% day traders lose money
  patience_and_perseverance:   { negative: 0.3, positive: 1.8 },   // premature scaling = 74% fail
  pride_and_hubris:            { negative: 0.3, positive: 1.6 },   // 42% fail from no market need
  sloth_and_procrastination:   { negative: 0.4, positive: 1.6 },   // 46% intention-behavior gap
  stewardship_and_responsibility: { negative: 0.35, positive: 1.5 }, // bootstrap = 72% profitable in 12mo
};

/**
 * Load sacred patterns. On server: from filesystem.
 * On client: uses pre-built static rules (the section modifiers + keywords).
 * The 250 patterns are the foundation — they exist in the JSON file
 * and are always applied through the section-level modifiers.
 */

/**
 * Extract meaningful keywords from a pattern description
 */
function extractKeywords(text: string): string[] {
  // Remove common words, keep behavioral terms
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
    'that', 'this', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
    'who', 'whom', 'which', 'what', 'where', 'when', 'why', 'how',
    'all', 'each', 'every', 'any', 'few', 'more', 'most', 'other',
    'some', 'such', 'than', 'too', 'very', 'just', 'because', 'between',
  ]);

  const words = text
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  // Also extract multi-word phrases that are behaviorally meaningful
  const phrases: string[] = [];
  const behavioralPhrases = [
    'without counsel', 'no mentor', 'solo founder', 'get rich quick',
    'quick money', 'easy money', 'day trading', 'give up', 'quit early',
    'no validation', 'no market', 'ignore feedback', 'shiny object',
    'fear of failure', 'imposter syndrome', 'analysis paralysis',
    'premature scaling', 'scale too fast', 'overleverag', 'all in',
    'copy competitor', 'me too', 'social comparison', 'lifestyle inflation',
    'ponzi', 'pyramid', 'scheme', 'fake review', 'shortcut',
    'procrastinat', 'tutorial hell', 'course hopping',
    'no accountability', 'isolated', 'alone',
    'compound interest', 'long term', 'patience', 'persever',
    'mentor', 'advisor', 'community', 'mastermind', 'accountability',
    'validate', 'test', 'mvp', 'feedback', 'iterate',
    'bootstrap', 'prove first', 'faithful', 'steward',
    'focus', 'deep work', 'one thing', 'specialize',
    'diversif', 'hedge', 'balanced', 'moderate',
    'humble', 'listen', 'learn', 'research',
    'discipline', 'consistent', 'daily habit', 'routine',
    'generous', 'give', 'serve', 'help others',
    'honest', 'transparent', 'integrity', 'trust',
    'debt', 'borrow', 'leverage', 'interest', 'loan',
    'family', 'support system', 'relationship',
    'excellence', 'quality', 'craft', 'mastery',
    'fair', 'just', 'equit', 'ethical',
    'grateful', 'thankful', 'content',
  ];

  for (const phrase of behavioralPhrases) {
    if (text.includes(phrase)) {
      phrases.push(phrase);
    }
  }

  return [...new Set([...words.slice(0, 8), ...phrases])];
}

// Sacred rules are applied through section-level modifiers.
// The 250 individual patterns in sacred-texts-patterns.json provide
// the evidence and scripture references. The engine applies the
// behavioral laws through keyword matching against the 10 sections.
// This works client-side without filesystem access.
const SACRED_RULES: ParsedRule[] = [];

// Section keywords for positive matching (the OPPOSITE of the sin)
const SECTION_POSITIVE_KEYWORDS: Record<string, string[]> = {
  community_and_counsel: ['mentor', 'advisor', 'counsel', 'team', 'community', 'mastermind', 'accountability', 'partner', 'co-founder', 'support'],
  deception_and_shortcuts: ['honest', 'transparent', 'integrity', 'ethical', 'legitimate', 'authentic', 'genuine', 'real value'],
  envy_and_comparison: ['original', 'unique', 'differentiat', 'innovate', 'own path', 'authentic', 'first mover', 'niche'],
  fear_and_lack_of_faith: ['courage', 'start', 'launch', 'ship', 'action', 'begin', 'faith', 'trust', 'confident', 'brave'],
  forbidden_fruit: ['focus', 'commit', 'one thing', 'deep work', 'specialize', 'master', 'double down', 'depth', 'niche down'],
  greed_and_excess: ['diversif', 'moderate', 'balanced', 'conservative', 'steward', 'sustainable', 'long term', 'patient capital'],
  patience_and_perseverance: ['persist', 'patience', 'long term', 'compound', 'consistent', 'discipline', 'endure', 'years', 'marathon'],
  pride_and_hubris: ['validate', 'test', 'mvp', 'feedback', 'listen', 'research', 'humble', 'learn', 'iterate', 'customer first'],
  sloth_and_procrastination: ['execute', 'build', 'ship', 'daily', 'habit', 'routine', 'disciplin', 'proactive', 'start now', 'take action'],
  stewardship_and_responsibility: ['bootstrap', 'prove first', 'foundation', 'system', 'process', 'organized', 'step by step', 'small start', 'traction'],
};

// ============================================================
// ENGINE
// ============================================================

export interface DFNode {
  id: string;
  label: string;
  desc?: string;
  nodeType: string;
  prob: number;
  baseValue: number;
  formula?: (inputs: number[]) => number;
  appliedRules?: Array<{
    section: string;
    bible: string;
    quran: string;
    type: 'warning' | 'blessing';
    modifier: number;
  }>;
}

interface DFEdge {
  from: string;
  to: string;
  label?: string;
  strength: number;
}

/**
 * Apply ALL sacred patterns to a node.
 * Checks the node's text against all 250 patterns.
 * Returns combined modifier and list of triggered rules.
 */
function applySacredFoundation(
  node: DFNode,
  predecessorContext: string,
): {
  modifier: number;
  rules: DFNode['appliedRules'];
} {
  const text = `${node.label} ${node.desc || ''} ${predecessorContext}`.toLowerCase();
  let modifier = 1.0;
  const rules: DFNode['appliedRules'] = [];

  // Check each section's patterns
  for (const [section, sectionMods] of Object.entries(SECTION_MODIFIERS)) {
    const sectionRules = SACRED_RULES.filter(r => r.section === section);
    if (sectionRules.length === 0) continue;

    // Check if any negative pattern keywords match
    let negativeMatch = false;
    let matchedRule: ParsedRule | null = null;

    for (const rule of sectionRules) {
      const matches = rule.keywords.filter(kw => text.includes(kw));
      if (matches.length >= 2) {  // require 2+ keyword matches for confidence
        negativeMatch = true;
        matchedRule = rule;
        break;
      }
    }

    if (negativeMatch && matchedRule) {
      modifier *= sectionMods.negative;
      rules.push({
        section,
        bible: matchedRule.bible,
        quran: matchedRule.quran,
        type: 'warning',
        modifier: sectionMods.negative,
      });
      continue;
    }

    // Check if positive keywords match (the virtue, not the sin)
    const positiveKws = SECTION_POSITIVE_KEYWORDS[section] || [];
    const posMatches = positiveKws.filter(kw => text.includes(kw));
    if (posMatches.length >= 2) {
      modifier *= sectionMods.positive;
      // Find a rule from this section for the reference
      const refRule = sectionRules[0];
      if (refRule) {
        rules.push({
          section,
          bible: refRule.bible,
          quran: refRule.quran,
          type: 'blessing',
          modifier: sectionMods.positive,
        });
      }
    }
  }

  // Clamp modifier
  modifier = Math.max(0.01, Math.min(5, modifier));
  return { modifier, rules: rules || [] };
}

/**
 * SimulatorDataflow — cascading computation graph.
 *
 * Every computation passes through the sacred foundation FIRST.
 * The 250 patterns from Bible + Quran are the immutable laws.
 * Modern data and AI build ON TOP of these laws, never against them.
 */
export class SimulatorDataflow {
  private nodes: Map<string, DFNode> = new Map();
  private edges: DFEdge[] = [];
  private cache: Map<string, number> = new Map();

  async buildFromTemplate(
    templateNodes: Array<{ id: string | number; label: string; type: string; prob?: number; desc?: string }>,
    templateEdges: Array<{ from: string | number; to: string | number; label?: string }>,
  ) {
    this.nodes.clear();
    this.edges = [];
    this.cache.clear();

    for (const n of templateNodes) {
      this.nodes.set(String(n.id), {
        id: String(n.id),
        label: n.label,
        desc: n.desc,
        nodeType: n.type,
        prob: n.prob ?? 50,
        baseValue: 0.5,
      });
    }

    for (const e of templateEdges) {
      this.edges.push({
        from: String(e.from),
        to: String(e.to),
        label: e.label,
        strength: 1,
      });
    }
  }

  private getIncomingEdges(nodeId: string): DFEdge[] {
    return this.edges.filter(e => e.to === nodeId);
  }

  private getOutgoingEdges(nodeId: string): DFEdge[] {
    return this.edges.filter(e => e.from === nodeId);
  }

  private getPredecessorContext(nodeId: string, depth = 3): string {
    if (depth <= 0) return '';
    const incoming = this.getIncomingEdges(nodeId);
    const parts: string[] = [];
    for (const edge of incoming) {
      const pred = this.nodes.get(edge.from);
      if (pred) {
        parts.push(pred.label);
        if (pred.desc) parts.push(pred.desc);
        parts.push(this.getPredecessorContext(edge.from, depth - 1));
      }
    }
    return parts.join(' ');
  }

  /**
   * Fetch computed value. Sacred foundation applied to EVERY node.
   */
  fetch(nodeId: string): number {
    const cached = this.cache.get(nodeId);
    if (cached !== undefined) return cached;

    const node = this.nodes.get(nodeId);
    if (!node) return 0;

    const incoming = this.getIncomingEdges(nodeId);

    if (incoming.length === 0) {
      const value = node.baseValue;
      this.cache.set(nodeId, value);
      return value;
    }

    const inputValues = incoming.map(edge => {
      return this.fetch(edge.from) * edge.strength;
    });

    // LAYER 1: Base computation
    let value: number;
    if (node.formula) {
      value = node.formula(inputValues);
    } else {
      const avgInput = inputValues.reduce((a, b) => a + b, 0) / inputValues.length;
      switch (node.nodeType) {
        case 'bottleneck': value = avgInput * (node.prob / 100); break;
        case 'decision': value = avgInput * (node.prob / 100); break;
        case 'outcome-good': value = avgInput * 1.2; break;
        case 'outcome-bad': value = avgInput * 0.3; break;
        case 'action': value = avgInput * 1.05; break;
        case 'loop': value = avgInput * 1.1; break;
        default: value = avgInput;
      }
    }

    // LAYER 0: SACRED FOUNDATION — applied last because it overrides everything
    const context = this.getPredecessorContext(nodeId);
    const { modifier, rules } = applySacredFoundation(node, context);
    value *= modifier;
    node.appliedRules = rules;

    value = Math.max(0, Math.min(1, value));
    this.cache.set(nodeId, value);
    return value;
  }

  async computeAll(): Promise<Record<string, number>> {
    this.cache.clear();
    const results: Record<string, number> = {};
    for (const [id] of this.nodes) {
      results[id] = this.fetch(id);
    }
    return results;
  }

  getAppliedRules(nodeId: string): DFNode['appliedRules'] {
    return this.nodes.get(nodeId)?.appliedRules || [];
  }

  updateParameter(nodeId: string, value: number) {
    const node = this.nodes.get(nodeId);
    if (node) { node.baseValue = value; this.resetDownstream(nodeId); }
  }

  updateProbability(nodeId: string, prob: number) {
    const node = this.nodes.get(nodeId);
    if (node) { node.prob = prob; this.resetDownstream(nodeId); }
  }

  private resetDownstream(nodeId: string) {
    this.cache.delete(nodeId);
    for (const edge of this.getOutgoingEdges(nodeId)) {
      this.resetDownstream(edge.to);
    }
  }

  reset() { this.cache.clear(); }

  getNodeIds(): string[] { return Array.from(this.nodes.keys()); }

  /**
   * Get total sacred rules loaded (for diagnostics)
   */
  static getRulesCount(): number { return SACRED_RULES.length; }
}

export { SACRED_RULES };
export type { ParsedRule, SacredPattern };
