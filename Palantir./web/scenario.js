const FLOW_ORDER = [
  "person_state",
  "path_state",
  "start_income_path",
  "make_attempt",
  "first_100_gate",
  "five_hundred_gate",
  "one_thousand_gate",
  "outcome_state",
];

export function createInitialScenarioState() {
  const state = {
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

function cloneState(state) {
  return {
    person: { ...state.person },
    incomePath: { ...state.incomePath },
    attempts: state.attempts.map((attempt) => ({ ...attempt })),
    outcome: { ...state.outcome },
    relations: state.relations.map((relation) => ({ ...relation })),
    history: state.history.map((event) => ({ ...event })),
  };
}

function deriveRelations(state) {
  const relations = [
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

function recordEvent(state, input) {
  state.history.push({
    type: input.type,
    branch: input.branch,
    timestamp: new Date().toISOString(),
  });
}

function latestAttempt(state) {
  return state.attempts[state.attempts.length - 1];
}

function lowerEnergy(energy) {
  if (energy === "high") return "medium";
  if (energy === "medium") return "low";
  return "low";
}

function raiseExperience(experience) {
  if (experience === "low") return "medium";
  if (experience === "medium") return "high";
  return "high";
}

export function applyTransition(state, input) {
  const next = cloneState(state);

  switch (input.type) {
    case "start_income_path":
      if (!next.person.active || next.incomePath.started) break;
      next.incomePath.started = true;
      recordEvent(next, input);
      break;

    case "make_attempt":
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

    case "earn_first_100":
      if (!next.person.active || !next.incomePath.started) break;
      next.person.cash += 100;
      next.incomePath.monthly_income = 100;
      next.outcome.first_100_earned = true;
      next.outcome.quit = false;
      next.outcome.stagnation = false;
      if (latestAttempt(next)) latestAttempt(next).status = "proof";
      recordEvent(next, input);
      break;

    case "reach_500_month":
      if (!next.person.active || !next.outcome.first_100_earned) break;
      if (input.branch === "partial") {
        next.person.cash += 200;
        next.incomePath.monthly_income = 300;
        next.outcome.stagnation = true;
        if (latestAttempt(next)) latestAttempt(next).status = "stalled";
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

    case "reach_1000_month":
      if (!next.person.active || (!next.outcome.reached_500 && !next.outcome.stagnation)) break;
      if (input.branch === "fail") {
        next.outcome.burnout = true;
        next.person.active = false;
        next.person.energy = "low";
        if (latestAttempt(next)) latestAttempt(next).status = "burnout";
        recordEvent(next, input);
        break;
      }
      if (input.branch === "partial") {
        next.outcome.stagnation = true;
        next.incomePath.monthly_income = 400;
        if (latestAttempt(next)) latestAttempt(next).status = "stalled";
        recordEvent(next, input);
        break;
      }
      next.person.cash += 1000;
      next.person.urgency = "low";
      next.incomePath.monthly_income = 1000;
      next.incomePath.repeatable = true;
      next.outcome.reached_1000 = true;
      next.outcome.stagnation = false;
      if (latestAttempt(next)) latestAttempt(next).status = "proof";
      recordEvent(next, { type: input.type, branch: "pass" });
      break;

    case "quit_path":
      next.person.active = false;
      next.outcome.quit = true;
      if (latestAttempt(next)) latestAttempt(next).status = "quit";
      recordEvent(next, input);
      break;

    case "burnout_event":
      next.person.active = false;
      next.person.energy = "low";
      next.outcome.burnout = true;
      if (latestAttempt(next)) latestAttempt(next).status = "burnout";
      recordEvent(next, input);
      break;
  }

  next.relations = deriveRelations(next);
  return next;
}

export function deriveScenarioSummary(state) {
  if (state.outcome.reached_1000 && state.incomePath.repeatable) return "Reached sustainable income";
  if (state.outcome.burnout) return "Burnout reached";
  if (state.outcome.quit) return "Exited path";
  if (state.outcome.stagnation) return "Low-income stagnation";
  if (state.outcome.reached_500) return "Income path becoming stable";
  if (state.outcome.first_100_earned) return "First proof achieved";
  if (state.attempts.length > 0) return "Early attempts in progress";
  if (state.incomePath.started) return "Income path started";
  return "Income path not started";
}

function readablePersonDetail(state) {
  const parts = [
    `Cash $${state.person.cash}`,
    `Urgency ${state.person.urgency}`,
    state.person.active ? "Active" : "Inactive",
  ];

  return parts.join(" • ");
}

function readableIncomePathDetail(state) {
  if (!state.incomePath.started) return "Not yet repeatable. Monthly income = $0.";
  if (state.incomePath.repeatable) return `Repeatable path achieved. Monthly income = $${state.incomePath.monthly_income}.`;
  if (state.incomePath.monthly_income === 0) return "Path has started, but revenue has not appeared yet.";
  return `Repeatability not yet achieved. Monthly income = $${state.incomePath.monthly_income}.`;
}

function readableStartDetail(state) {
  return state.incomePath.started
    ? "Income path has been activated."
    : "Waiting to start the income path.";
}

function readableAttemptDetail(state) {
  if (state.attempts.length === 0) return "Attempts have not started yet.";
  const attempt = latestAttempt(state);
  return `${state.attempts.length} attempt${state.attempts.length > 1 ? "s" : ""} logged. Latest status: ${attempt.status}.`;
}

function readableFirstRevenueDetail(state) {
  if (state.outcome.quit) return "Exited before first proof.";
  if (state.outcome.first_100_earned) return "First proof achieved.";
  return "Still pre-revenue.";
}

function readableFiveHundredDetail(state) {
  if (state.outcome.reached_500) return "Reached survival income level.";
  if (state.outcome.stagnation) return "Income is moving, but not yet at survival level.";
  return "Not yet at survival income level.";
}

function readableOneThousandDetail(state) {
  if (state.outcome.reached_1000) return "Repeatability achieved.";
  if (state.outcome.burnout) return "Scale attempt ended in burnout.";
  return "Repeatability not yet achieved.";
}

function currentStepId(state) {
  if (state.outcome.quit || state.outcome.burnout || state.outcome.reached_1000) return "outcome_state";
  if (!state.incomePath.started) return "start_income_path";
  if (state.attempts.length === 0) return "make_attempt";
  if (!state.outcome.first_100_earned) return "first_100_gate";
  if (!state.outcome.reached_500 && !state.outcome.stagnation) return "five_hundred_gate";
  if (!state.outcome.reached_1000 && !state.outcome.burnout) return "one_thousand_gate";
  return "outcome_state";
}

function completedIds(state) {
  const done = new Set(["person_state", "path_state"]);

  if (state.incomePath.started) done.add("start_income_path");
  if (state.attempts.length > 0) done.add("make_attempt");
  if (state.outcome.first_100_earned || state.outcome.quit) done.add("first_100_gate");
  if (state.outcome.reached_500 || state.outcome.stagnation) done.add("five_hundred_gate");
  if (state.outcome.reached_1000 || state.outcome.burnout || (state.outcome.stagnation && state.incomePath.monthly_income >= 400)) {
    done.add("one_thousand_gate");
  }

  return done;
}

function stepPhase(id, state) {
  const current = currentStepId(state);
  const completed = completedIds(state);

  if (id === "outcome_state" && (state.outcome.quit || state.outcome.burnout || state.outcome.reached_1000)) {
    return "terminal";
  }

  if (id === "person_state" || id === "path_state") {
    return id === current ? "current" : "completed";
  }

  if (id === current) return "current";
  if (completed.has(id)) return "completed";

  const currentIndex = FLOW_ORDER.indexOf(current);
  const index = FLOW_ORDER.indexOf(id);
  return index > currentIndex ? "upcoming" : "completed";
}

function cardTone(id, state) {
  if (id === "outcome_state") {
    if (state.outcome.reached_1000) return "success";
    if (state.outcome.quit || state.outcome.burnout) return "failure";
    if (state.outcome.stagnation) return "partial";
    return "neutral";
  }

  if (id === "first_100_gate") {
    if (state.outcome.first_100_earned) return "success";
    if (state.outcome.quit) return "failure";
  }

  if (id === "five_hundred_gate") {
    if (state.outcome.reached_500) return "success";
    if (state.outcome.stagnation) return "partial";
  }

  if (id === "one_thousand_gate") {
    if (state.outcome.reached_1000) return "success";
    if (state.outcome.burnout) return "failure";
  }

  return "neutral";
}

export function getNextStepContext(state) {
  const current = currentStepId(state);

  if (current === "start_income_path") {
    return {
      current,
      nextAction: { label: "Next step", event: { type: "start_income_path" } },
      branchOptions: [],
    };
  }

  if (current === "make_attempt") {
    return {
      current,
      nextAction: { label: "Next step", event: { type: "make_attempt" } },
      branchOptions: [],
    };
  }

  if (current === "first_100_gate") {
    return {
      current,
      nextAction: null,
      branchPrompt: "Choose the outcome of the first revenue bottleneck.",
      branchOptions: [
        { label: "Pass: earn first $100", event: { type: "earn_first_100", branch: "pass" } },
        { label: "Fail: exit path", event: { type: "quit_path", branch: "fail" } },
      ],
    };
  }

  if (current === "five_hundred_gate") {
    return {
      current,
      nextAction: null,
      branchPrompt: "Choose the current income progression branch.",
      branchOptions: [
        { label: "Partial: low-income plateau", event: { type: "reach_500_month", branch: "partial" } },
        { label: "Pass: reach $500/month", event: { type: "reach_500_month", branch: "pass" } },
      ],
    };
  }

  if (current === "one_thousand_gate") {
    return {
      current,
      nextAction: null,
      branchPrompt: "Choose the scaling outcome.",
      branchOptions: [
        { label: "Partial: remain non-repeatable", event: { type: "reach_1000_month", branch: "partial" } },
        { label: "Pass: reach $1,000+/month", event: { type: "reach_1000_month", branch: "pass" } },
        { label: "Fail: burnout", event: { type: "reach_1000_month", branch: "fail" } },
      ],
    };
  }

  return {
    current,
    nextAction: null,
    branchOptions: [],
    finished: true,
  };
}

export function simulateOptimisticPath(state) {
  let next = cloneState(state);
  let guard = 12;

  while (guard-- > 0) {
    const context = getNextStepContext(next);
    if (context.finished) break;
    if (context.nextAction) {
      next = applyTransition(next, context.nextAction.event);
      continue;
    }

    const bestBranch = context.branchOptions.find((option) => option.event.branch === "pass")
      || context.branchOptions[0];
    if (!bestBranch) break;
    next = applyTransition(next, bestBranch.event);
  }

  return next;
}

export function mapScenarioToPresentation(state) {
  const current = currentStepId(state);

  const cards = [
    {
      id: "person_state",
      category: "STATE",
      label: "Person",
      detail: readablePersonDetail(state),
    },
    {
      id: "path_state",
      category: "STATE",
      label: "Income path",
      detail: readableIncomePathDetail(state),
    },
    {
      id: "start_income_path",
      category: "ACTION / EVENT",
      label: "Start income path",
      detail: readableStartDetail(state),
    },
    {
      id: "make_attempt",
      category: "ACTION / EVENT",
      label: "Make attempt",
      detail: readableAttemptDetail(state),
    },
    {
      id: "first_100_gate",
      category: "BOTTLENECK / GATE",
      label: "Stick long enough to earn first $100?",
      detail: readableFirstRevenueDetail(state),
    },
    {
      id: "five_hundred_gate",
      category: "BOTTLENECK / GATE",
      label: "Reach $500/month?",
      detail: readableFiveHundredDetail(state),
    },
    {
      id: "one_thousand_gate",
      category: "BOTTLENECK / GATE",
      label: "Scale to $1,000+/month?",
      detail: readableOneThousandDetail(state),
    },
    {
      id: "outcome_state",
      category: "OUTCOME",
      label: "Current outcome",
      detail: deriveScenarioSummary(state),
    },
  ];

  return {
    summary: deriveScenarioSummary(state),
    currentStepId: current,
    flow: cards.map((card) => ({
      ...card,
      phase: stepPhase(card.id, state),
      tone: cardTone(card.id, state),
    })),
  };
}

export function getTransitionMap() {
  return [
    "start_income_path -> incomePath.started = true",
    "make_attempt -> attempts + person.energy/experience shift",
    "earn_first_100 -> cash += 100, first_100_earned = true, monthly_income = 100",
    "reach_500_month(partial) -> monthly_income = 300, stagnation = true",
    "reach_500_month(pass) -> monthly_income = 500, reached_500 = true",
    "reach_1000_month(partial) -> monthly_income = 400, stagnation = true",
    "reach_1000_month(fail) -> burnout = true, active = false",
    "reach_1000_month(pass) -> monthly_income = 1000, repeatable = true, reached_1000 = true",
    "quit_path -> quit = true, active = false",
    "burnout_event -> burnout = true, active = false",
  ];
}

export function getOntologyDebugSnapshot(state) {
  return {
    entities: {
      person: state.person,
      incomePath: state.incomePath,
      attempts: state.attempts,
      outcome: state.outcome,
    },
    relations: state.relations,
    eventHistory: state.history,
    transitionMap: getTransitionMap(),
    derivedFlags: {
      first_100_earned: state.outcome.first_100_earned,
      reached_500: state.outcome.reached_500,
      reached_1000: state.outcome.reached_1000,
      quit: state.outcome.quit,
      burnout: state.outcome.burnout,
      stagnation: state.outcome.stagnation,
      repeatable: state.incomePath.repeatable,
      active: state.person.active,
      currentStepId: currentStepId(state),
      summary: deriveScenarioSummary(state),
    },
  };
}
