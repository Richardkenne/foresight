/**
 * Dataflow Engine for Simulator v2
 *
 * Lightweight pull-based dataflow engine. No external dependencies.
 * Each node receives inputs from predecessors, computes outputs,
 * and propagates to successors. When a parameter changes,
 * the engine recalculates all affected nodes (cascading).
 *
 * Inspired by: Rete.js architecture + ncase/loopy signal propagation
 */

export interface DFNode {
  id: string;
  label: string;
  nodeType: string;
  prob: number;
  baseValue: number;
  formula?: (inputs: number[]) => number;
}

interface DFEdge {
  from: string;
  to: string;
  label?: string;
  strength: number;  // multiplier: positive = amplify, negative = invert
}

/**
 * SimulatorDataflow — cascading computation graph.
 * Pull-based: fetch a node's value, it recursively computes all predecessors.
 * Cache-based: computed values are cached until reset.
 */
export class SimulatorDataflow {
  private nodes: Map<string, DFNode> = new Map();
  private edges: DFEdge[] = [];
  private cache: Map<string, number> = new Map();

  /**
   * Build from template data
   */
  async buildFromTemplate(
    templateNodes: Array<{ id: string | number; label: string; type: string; prob?: number }>,
    templateEdges: Array<{ from: string | number; to: string | number; label?: string }>,
  ) {
    this.nodes.clear();
    this.edges = [];
    this.cache.clear();

    for (const n of templateNodes) {
      this.nodes.set(String(n.id), {
        id: String(n.id),
        label: n.label,
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

  /**
   * Get incoming edges for a node
   */
  private getIncomingEdges(nodeId: string): DFEdge[] {
    return this.edges.filter(e => e.to === nodeId);
  }

  /**
   * Get outgoing edges for a node
   */
  private getOutgoingEdges(nodeId: string): DFEdge[] {
    return this.edges.filter(e => e.from === nodeId);
  }

  /**
   * Fetch computed value for a node (recursive, cached)
   */
  fetch(nodeId: string): number {
    // Return cached if available
    const cached = this.cache.get(nodeId);
    if (cached !== undefined) return cached;

    const node = this.nodes.get(nodeId);
    if (!node) return 0;

    // Get inputs from all predecessors
    const incoming = this.getIncomingEdges(nodeId);

    // No inputs = root node, use baseValue
    if (incoming.length === 0) {
      const value = node.baseValue;
      this.cache.set(nodeId, value);
      return value;
    }

    // Recursively fetch predecessor values, apply edge strength
    const inputValues = incoming.map(edge => {
      const predValue = this.fetch(edge.from);
      return predValue * edge.strength;
    });

    // Compute this node's value based on type
    let value: number;

    if (node.formula) {
      value = node.formula(inputValues);
    } else {
      const avgInput = inputValues.reduce((a, b) => a + b, 0) / inputValues.length;

      switch (node.nodeType) {
        case 'bottleneck':
          value = avgInput * (node.prob / 100);
          break;
        case 'decision':
          // For decision, output the weighted average of pass/fail paths
          value = avgInput * (node.prob / 100);
          break;
        case 'outcome-good':
          value = avgInput * 1.2;
          break;
        case 'outcome-bad':
          value = avgInput * 0.3;
          break;
        case 'action':
          value = avgInput * 1.05;
          break;
        case 'loop':
          value = avgInput * 1.1;
          break;
        default:
          value = avgInput;
      }
    }

    // Clamp to reasonable range
    value = Math.max(0, Math.min(1, value));
    this.cache.set(nodeId, value);
    return value;
  }

  /**
   * Compute all node values
   */
  async computeAll(): Promise<Record<string, number>> {
    this.cache.clear();
    const results: Record<string, number> = {};
    for (const [id] of this.nodes) {
      results[id] = this.fetch(id);
    }
    return results;
  }

  /**
   * Update base value of a node (e.g., from slider) and reset cache
   */
  updateParameter(nodeId: string, value: number) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.baseValue = value;
      this.resetDownstream(nodeId);
    }
  }

  /**
   * Update probability of a node
   */
  updateProbability(nodeId: string, prob: number) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.prob = prob;
      this.resetDownstream(nodeId);
    }
  }

  /**
   * Reset cache for a node and all downstream successors (cascading)
   */
  private resetDownstream(nodeId: string) {
    this.cache.delete(nodeId);
    const outgoing = this.getOutgoingEdges(nodeId);
    for (const edge of outgoing) {
      this.resetDownstream(edge.to);
    }
  }

  /**
   * Full reset
   */
  reset() {
    this.cache.clear();
  }

  /**
   * Get node IDs
   */
  getNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }
}
