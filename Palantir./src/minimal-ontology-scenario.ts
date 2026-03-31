export type PersonUrgency = "low" | "medium" | "high";
export type PersonEnergy = "low" | "medium" | "high";
export type PersonExperience = "low" | "medium" | "high";
export type IncomePathKind = "no_upfront_cost_income_path";
export type EventType =
  | "start_income_path"
  | "make_attempt"
  | "earn_first_100"
  | "reach_500_month"
  | "reach_1000_month"
  | "quit_path"
  | "burnout_event";
export type Branch = "pass" | "partial" | "fail";

export interface Person {
  entity: "Person";
  id: string;
  cash: number;
  urgency: PersonUrgency;
  energy: PersonEnergy;
  experience: PersonExperience;
  active: boolean;
}

export interface IncomePath {
  entity: "IncomePath";
  id: string;
  type: IncomePathKind;
  upfront_cost: number;
  started: boolean;
  repeatable: boolean;
  monthly_income: number;
}

export interface Attempt {
  entity: "Attempt";
  id: string;
  count: number;
  status: "pending" | "in_progress" | "proof" | "stalled" | "quit" | "burnout";
}

export interface Outcome {
  entity: "Outcome";
  id: string;
  first_100_earned: boolean;
  reached_500: boolean;
  reached_1000: boolean;
  quit: boolean;
  burnout: boolean;
  stagnation: boolean;
}

export interface Relation {
  from: string;
  type: "starts" | "makes" | "affects" | "ends_in";
  to: string;
}

export interface EventRecord {
  type: EventType;
  branch?: Branch;
  timestamp: string;
}

export interface ScenarioState {
  person: Person;
  incomePath: IncomePath;
  attempts: Attempt[];
  outcome: Outcome;
  relations: Relation[];
  history: EventRecord[];
}

export interface TransitionInput {
  type: EventType;
  branch?: Branch;
}

export type NodeCategory = "STATE" | "ACTION / EVENT" | "BOTTLENECK / GATE" | "OUTCOME";

export interface VisibleNode {
  id: string;
  category: NodeCategory;
  label: string;
  detail: string;
  status?: "idle" | "active" | "partial" | "success" | "failure";
}

export interface VisibleEdge {
  from: string;
  to: string;
  label?: string;
}

function cloneState(state: ScenarioState): ScenarioState {
  return {
    person: { ...state.person },
    incomePath: { ...state.incomePath },
    attempts: state.attempts.map((attempt) => ({ ...attempt })),
    outcome: { ...state.outcome },
    relations: state.relations.map((relation) => ({ ...relation })),
    history: state.history.map((event) => ({ ...event })),
  };
}

function lowerEnergy(energy: PersonEnergy): PersonEnergy {
  if (energy === "high") return "medium";
  if (energy === "medium") return "low";
  return "low";
}

function raiseExperience(experience: PersonExperience): PersonExperience {
  if (experience === "low") return "medium";
  if (experience === "medium") return "high";
  return "high";
}

function deriveRelations(state: ScenarioState): Relation[] {
  const relations: Relation[] = [
    { from: state.incomePath.id, type: "affects", to: state.outcome.id },
  ];

  if (state.incomePath.started) {
    relations.push({ from: state.person.id, type: "starts", to: state.incomePath.id });
  }

  for (const attempt of state.attempts) {
    relations.push({ from: state.person.id, type: "makes", to: attempt.id });
  }

  if (
    state.outcome.first_100_earned ||
    state.outcome.reached_500 ||
    state.outcome.reached_1000 ||
    state.outcome.quit ||
    state.outcome.burnout ||
    state.outcome.stagnation
  ) {
    relations.push({ from: state.person.id, type: "ends_in", to: state.outcome.id });
  }

  return relations;
}

function recordEvent(state: ScenarioState, input: TransitionInput): void {
  state.history.push({
    type: input.type,
    branch: input.branch,
    timestamp: new Date().toISOString(),
  });
}

function latestAttempt(state: ScenarioState): Attempt | undefined {
  return state.attempts[state.attempts.length - 1];
}

export function createInitialScenarioState(): ScenarioState {
  const state: ScenarioState = {
    person: {
      entity: "Person",
      id: "person_1",
      cash: 0,
      urgency: "high",
      energy: "medium",
      experience: "low",
      active: true,
    },
    incomePath: {
      entity: "IncomePath",
      id: "income_path_1",
      type: "no_upfront_cost_income_path",
      upfront_cost: 0,
      started: false,
      repeatable: false,
      monthly_income: 0,
    },
    attempts: [],
    outcome: {
      entity: "Outcome",
      id: "outcome_1",
      first_100_earned: false,
      reached_500: false,
      reached_1000: false,
      quit: false,
      burnout: false,
      stagnation: false,
    },
    relations: [],
    history: [],
  };

  state.relations = deriveRelations(state);
  return state;
}

export function applyTransition(state: ScenarioState, input: TransitionInput): ScenarioState {
  const next = cloneState(state);

  switch (input.type) {
    case "start_income_path": {
      if (!next.person.active || next.incomePath.started) break;
      next.incomePath.started = true;
      recordEvent(next, input);
      break;
    }

    case "make_attempt": {
      if (!next.person.active || !next.incomePath.started) break;
      next.attempts.push({
        entity: "Attempt",
        id: `attempt_${next.attempts.length + 1}`,
        count: next.attempts.length + 1,
        status: "in_progress",
      });
      next.person.energy = lowerEnergy(next.person.energy);
      next.person.experience = raiseExperience(next.person.experience);
      recordEvent(next, input);
      break;
    }

    case "earn_first_100": {
      if (!next.person.active || !next.incomePath.started) break;
      next.person.cash += 100;
      next.incomePath.monthly_income = 100;
      next.outcome.first_100_earned = true;
      next.outcome.quit = false;
      next.outcome.stagnation = false;
      if (latestAttempt(next)) latestAttempt(next)!.status = "proof";
      recordEvent(next, input);
      break;
    }

    case "reach_500_month": {
      if (!next.person.active || !next.outcome.first_100_earned) break;
      if (input.branch === "partial") {
        next.person.cash += 200;
        next.incomePath.monthly_income = 300;
        next.outcome.stagnation = true;
        if (latestAttempt(next)) latestAttempt(next)!.status = "stalled";
        recordEvent(next, input);
        break;
      }
      next.person.cash += 500;
      next.person.urgency = "medium";
      next.incomePath.monthly_income = 500;
      next.outcome.reached_500 = true;
      next.outcome.stagnation = false;
      recordEvent(next, { type: input.type, branch: "pass" });
      break;
    }

    case "reach_1000_month": {
      if (!next.person.active || (!next.outcome.reached_500 && !next.outcome.stagnation)) break;
      if (input.branch === "fail") {
        next.outcome.burnout = true;
        next.person.active = false;
        next.person.energy = "low";
        if (latestAttempt(next)) latestAttempt(next)!.status = "burnout";
        recordEvent(next, input);
        break;
      }
      if (input.branch === "partial") {
        next.outcome.stagnation = true;
        next.incomePath.monthly_income = 400;
        if (latestAttempt(next)) latestAttempt(next)!.status = "stalled";
        recordEvent(next, input);
        break;
      }
      next.person.cash += 1000;
      next.person.urgency = "low";
      next.incomePath.monthly_income = 1000;
      next.incomePath.repeatable = true;
      next.outcome.reached_1000 = true;
      next.outcome.stagnation = false;
      if (latestAttempt(next)) latestAttempt(next)!.status = "proof";
      recordEvent(next, { type: input.type, branch: "pass" });
      break;
    }

    case "quit_path": {
      next.person.active = false;
      next.outcome.quit = true;
      if (latestAttempt(next)) latestAttempt(next)!.status = "quit";
      recordEvent(next, input);
      break;
    }

    case "burnout_event": {
      next.person.active = false;
      next.person.energy = "low";
      next.outcome.burnout = true;
      if (latestAttempt(next)) latestAttempt(next)!.status = "burnout";
      recordEvent(next, input);
      break;
    }
  }

  next.relations = deriveRelations(next);
  return next;
}

export function deriveScenarioSummary(state: ScenarioState): string {
  if (state.outcome.reached_1000 && state.incomePath.repeatable) return "sustainable income";
  if (state.outcome.reached_500) return "first stable income layer";
  if (state.outcome.first_100_earned) return "first proof achieved";
  if (state.outcome.stagnation) return "stuck low income";
  if (state.outcome.burnout) return "burnout";
  if (state.outcome.quit) return "quit";
  if (state.incomePath.started) return "income path started";
  return "starting from zero";
}

export function mapScenarioToVisibleGraph(state: ScenarioState): {
  nodes: VisibleNode[];
  edges: VisibleEdge[];
} {
  const summary = deriveScenarioSummary(state);

  return {
    nodes: [
      {
        id: "person_state",
        category: "STATE",
        label: "Person",
        detail: `cash=$${state.person.cash} | urgency=${state.person.urgency} | energy=${state.person.energy} | experience=${state.person.experience} | active=${state.person.active}`,
        status: state.person.active ? "active" : "failure",
      },
      {
        id: "path_state",
        category: "STATE",
        label: "IncomePath",
        detail: `type=${state.incomePath.type} | cost=${state.incomePath.upfront_cost} | started=${state.incomePath.started} | repeatable=${state.incomePath.repeatable} | monthly_income=$${state.incomePath.monthly_income}`,
        status: state.incomePath.started ? "active" : "idle",
      },
      {
        id: "start_income_path",
        category: "ACTION / EVENT",
        label: "start_income_path",
        detail: "Person starts IncomePath",
        status: state.incomePath.started ? "success" : "idle",
      },
      {
        id: "make_attempt",
        category: "ACTION / EVENT",
        label: "make_attempt",
        detail: `attempt_count=${state.attempts.length}`,
        status: state.attempts.length > 0 ? "success" : "idle",
      },
      {
        id: "first_100_gate",
        category: "BOTTLENECK / GATE",
        label: "Stick long enough to earn first $100?",
        detail: `first_100_earned=${state.outcome.first_100_earned} | quit=${state.outcome.quit}`,
        status: state.outcome.first_100_earned ? "success" : state.outcome.quit ? "failure" : "idle",
      },
      {
        id: "five_hundred_gate",
        category: "BOTTLENECK / GATE",
        label: "Reaches $500/month?",
        detail: `monthly_income=$${state.incomePath.monthly_income} | stagnation=${state.outcome.stagnation}`,
        status: state.outcome.reached_500 ? "success" : state.outcome.stagnation ? "partial" : "idle",
      },
      {
        id: "one_thousand_gate",
        category: "BOTTLENECK / GATE",
        label: "Scales to $1000+/month?",
        detail: `monthly_income=$${state.incomePath.monthly_income} | repeatable=${state.incomePath.repeatable} | burnout=${state.outcome.burnout}`,
        status: state.outcome.reached_1000 ? "success" : state.outcome.burnout ? "failure" : state.outcome.stagnation ? "partial" : "idle",
      },
      {
        id: "outcome_state",
        category: "OUTCOME",
        label: summary,
        detail: `first_100=${state.outcome.first_100_earned} | 500=${state.outcome.reached_500} | 1000=${state.outcome.reached_1000} | quit=${state.outcome.quit} | burnout=${state.outcome.burnout} | stagnation=${state.outcome.stagnation}`,
        status: state.outcome.reached_1000
          ? "success"
          : state.outcome.quit || state.outcome.burnout
            ? "failure"
            : state.outcome.stagnation
              ? "partial"
              : "idle",
      },
    ],
    edges: [
      { from: "person_state", to: "start_income_path" },
      { from: "path_state", to: "start_income_path" },
      { from: "start_income_path", to: "make_attempt" },
      { from: "make_attempt", to: "first_100_gate" },
      { from: "first_100_gate", to: "five_hundred_gate", label: "pass" },
      { from: "first_100_gate", to: "outcome_state", label: "fail" },
      { from: "five_hundred_gate", to: "one_thousand_gate", label: "pass" },
      { from: "five_hundred_gate", to: "outcome_state", label: "partial" },
      { from: "one_thousand_gate", to: "outcome_state", label: "pass/fail/partial" },
    ],
  };
}
