import {
  applyTransition,
  createInitialScenarioState,
  getNextStepContext,
  getOntologyDebugSnapshot,
  mapScenarioToPresentation,
  simulateOptimisticPath,
} from "./scenario.js";

let state = createInitialScenarioState();

const summaryEl = document.getElementById("summary");
const flowEl = document.getElementById("flow");
const primaryActionEl = document.getElementById("primary-action");
const branchChooserEl = document.getElementById("branch-chooser");
const branchPromptEl = document.getElementById("branch-prompt");
const branchButtonsEl = document.getElementById("branch-buttons");
const debugPanelEl = document.getElementById("debug-panel");
const entitiesEl = document.getElementById("debug-entities");
const relationsEl = document.getElementById("debug-relations");
const historyEl = document.getElementById("debug-history");
const transitionMapEl = document.getElementById("debug-transition-map");
const flagsEl = document.getElementById("debug-flags");
const advancedControlsEl = document.getElementById("advanced-controls");

function phaseClass(phase, tone) {
  return `sim-card ${phase} ${tone}`;
}

function phaseLabel(phase) {
  if (phase === "completed") return "Completed";
  if (phase === "current") return "Current";
  if (phase === "terminal") return "Terminal";
  return "Upcoming";
}

function renderFlow(flow) {
  flowEl.innerHTML = flow
    .map((node) => `
      <article class="${phaseClass(node.phase, node.tone)}">
        <div class="card-topline">
          <div class="card-kicker">${node.category}</div>
          <div class="card-phase">${phaseLabel(node.phase)}</div>
        </div>
        <h3 class="card-title">${node.label}</h3>
        <p class="card-detail">${node.detail}</p>
      </article>
    `)
    .join("");
}

function renderDebug(debug) {
  entitiesEl.textContent = JSON.stringify(debug.entities, null, 2);
  relationsEl.textContent = JSON.stringify(debug.relations, null, 2);
  historyEl.textContent = JSON.stringify(debug.eventHistory, null, 2);
  transitionMapEl.textContent = JSON.stringify(debug.transitionMap, null, 2);
  flagsEl.textContent = JSON.stringify(debug.derivedFlags, null, 2);
}

function renderAdvancedControls() {
  const controls = [
    { label: "Start income path", event: { type: "start_income_path" } },
    { label: "Make attempt", event: { type: "make_attempt" } },
    { label: "Earn first $100", event: { type: "earn_first_100", branch: "pass" } },
    { label: "Reach $500 partial", event: { type: "reach_500_month", branch: "partial" } },
    { label: "Reach $500 pass", event: { type: "reach_500_month", branch: "pass" } },
    { label: "Reach $1,000 partial", event: { type: "reach_1000_month", branch: "partial" } },
    { label: "Reach $1,000 pass", event: { type: "reach_1000_month", branch: "pass" } },
    { label: "Reach $1,000 fail", event: { type: "reach_1000_month", branch: "fail" } },
    { label: "Exit path", event: { type: "quit_path", branch: "fail" } },
    { label: "Burnout", event: { type: "burnout_event" } },
  ];

  advancedControlsEl.innerHTML = controls
    .map((control, index) => `
      <button class="tiny-control" data-advanced-index="${index}">${control.label}</button>
    `)
    .join("");

  advancedControlsEl.querySelectorAll("[data-advanced-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const control = controls[Number(button.dataset.advancedIndex)];
      state = applyTransition(state, control.event);
      render();
    });
  });
}

function renderBranchChooser(context) {
  if (!context.branchOptions || context.branchOptions.length === 0) {
    branchChooserEl.hidden = true;
    branchButtonsEl.innerHTML = "";
    return;
  }

  branchChooserEl.hidden = false;
  branchPromptEl.textContent = context.branchPrompt || "Choose a branch.";
  branchButtonsEl.innerHTML = context.branchOptions
    .map((option, index) => `
      <button class="branch-button" data-branch-index="${index}">${option.label}</button>
    `)
    .join("");

  branchButtonsEl.querySelectorAll("[data-branch-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const option = context.branchOptions[Number(button.dataset.branchIndex)];
      state = applyTransition(state, option.event);
      render();
    });
  });
}

function renderPrimaryControl(context) {
  if (!context.nextAction || context.finished) {
    primaryActionEl.disabled = true;
    primaryActionEl.textContent = context.finished ? "Simulation complete" : "Choose branch";
    return;
  }

  primaryActionEl.disabled = false;
  primaryActionEl.textContent = context.nextAction.label;
}

function render() {
  const presentation = mapScenarioToPresentation(state);
  const debug = getOntologyDebugSnapshot(state);
  const nextContext = getNextStepContext(state);

  summaryEl.textContent = presentation.summary;
  renderFlow(presentation.flow);
  renderPrimaryControl(nextContext);
  renderBranchChooser(nextContext);
  renderDebug(debug);
  renderAdvancedControls();
}

primaryActionEl.addEventListener("click", () => {
  const context = getNextStepContext(state);
  if (!context.nextAction) return;
  state = applyTransition(state, context.nextAction.event);
  render();
});

document.getElementById("reset").addEventListener("click", () => {
  state = createInitialScenarioState();
  render();
});

document.getElementById("simulate-path").addEventListener("click", () => {
  state = simulateOptimisticPath(state);
  render();
});

document.getElementById("toggle-debug").addEventListener("click", () => {
  debugPanelEl.open = !debugPanelEl.open;
});

render();
