import {
  applyTransition,
  createInitialScenarioState,
  deriveScenarioSummary,
  mapScenarioToVisibleGraph,
  type ScenarioState,
  type TransitionInput,
} from "./minimal-ontology-scenario";

export interface DemoSnapshot {
  event: TransitionInput | { type: "initial" };
  summary: string;
  state: ScenarioState;
}

export function runDemoSequence(sequence: TransitionInput[]): DemoSnapshot[] {
  let state = createInitialScenarioState();
  const snapshots: DemoSnapshot[] = [
    { event: { type: "initial" }, summary: deriveScenarioSummary(state), state },
  ];

  for (const step of sequence) {
    state = applyTransition(state, step);
    snapshots.push({
      event: step,
      summary: deriveScenarioSummary(state),
      state,
    });
  }

  return snapshots;
}

export function exampleSuccessfulSequence(): DemoSnapshot[] {
  return runDemoSequence([
    { type: "start_income_path" },
    { type: "make_attempt" },
    { type: "earn_first_100", branch: "pass" },
    { type: "reach_500_month", branch: "pass" },
    { type: "reach_1000_month", branch: "pass" },
  ]);
}

export function exampleStagnationSequence(): DemoSnapshot[] {
  return runDemoSequence([
    { type: "start_income_path" },
    { type: "make_attempt" },
    { type: "earn_first_100", branch: "pass" },
    { type: "reach_500_month", branch: "partial" },
    { type: "reach_1000_month", branch: "partial" },
  ]);
}

export function exampleQuitSequence(): DemoSnapshot[] {
  return runDemoSequence([
    { type: "start_income_path" },
    { type: "make_attempt" },
    { type: "quit_path", branch: "fail" },
  ]);
}

export function printDemo(): string {
  const sequence = exampleSuccessfulSequence();
  const finalState = sequence.length > 0
    ? sequence[sequence.length - 1].state
    : createInitialScenarioState();
  const graph = mapScenarioToVisibleGraph(finalState);

  return [
    "Scenario: A man with $0 wants to make money",
    `Summary: ${deriveScenarioSummary(finalState)}`,
    "",
    "Visible nodes:",
    ...graph.nodes.map((node) => `- [${node.category}] ${node.label}: ${node.detail}`),
    "",
    "Visible edges:",
    ...graph.edges.map((edge) => `- ${edge.from} -> ${edge.to}${edge.label ? ` (${edge.label})` : ""}`),
  ].join("\n");
}
