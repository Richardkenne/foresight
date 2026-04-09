/* ─── Simulation Modes ─── */

export type SimMode = 'explore' | 'simulate' | 'personal' | 'whatif' | 'stress';

export type ModeGroup = 'create' | 'analyze';

export interface ModeConfig {
  label: string;
  shortLabel: string;
  group: ModeGroup;
  /** SVG path (d) for Lucide-style 24x24 icon */
  icon: string;
  /** One-line description shown in tooltip */
  description: string;
  /** Example use case */
  example: string;
  /** Mode requires an existing graph (nodes) to activate */
  requiresGraph: boolean;
  /** Mode shows particle simulation */
  showsParticles: boolean;
  /** Mode shows the prompt input bar */
  showsPrompt: boolean;
}

export const MODE_CONFIG: Record<SimMode, ModeConfig> = {
  explore: {
    label: 'Explore',
    shortLabel: 'Explore',
    group: 'create',
    icon: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z', // search
    description: 'Data only, no simulation. Generates the graph with probabilities and sources but does not launch particles.',
    example: 'e.g. "What does it take to open a cafe in Bandung?"',
    requiresGraph: false,
    showsParticles: false,
    showsPrompt: true,
  },
  simulate: {
    label: 'Simulate',
    shortLabel: 'Simulate',
    group: 'create',
    icon: 'M5 3l14 9-14 9V3z', // play
    description: 'Generates the graph and runs 100 people through it. See who passes each bottleneck and who fails.',
    example: 'e.g. "Can I become a freelance developer earning $5K/mo?"',
    requiresGraph: false,
    showsParticles: true,
    showsPrompt: true,
  },
  personal: {
    label: 'Personal',
    shortLabel: 'Personal',
    group: 'create',
    icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z', // user
    description: 'Like Simulate, but calibrated to YOUR profile. Probabilities adjust based on your psychology and values.',
    example: 'Your golden "YOU" particle shows your personal path',
    requiresGraph: false,
    showsParticles: true,
    showsPrompt: true,
  },
  whatif: {
    label: 'What-if',
    shortLabel: 'What-if',
    group: 'analyze',
    icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z', // edit
    description: 'Edit probabilities manually on an existing graph. See how changing one bottleneck affects the outcome.',
    example: 'e.g. "What if funding success goes from 14% to 40%?"',
    requiresGraph: true,
    showsParticles: true,
    showsPrompt: false,
  },
  stress: {
    label: 'Stress Test',
    shortLabel: 'Stress',
    group: 'analyze',
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z', // zap
    description: 'Worst-case scenario. All probabilities drop to their adverse range. Tests if your plan survives the worst.',
    example: 'Red pulsing borders show stress points',
    requiresGraph: true,
    showsParticles: true,
    showsPrompt: false,
  },
};

export const ALL_MODES: SimMode[] = ['explore', 'simulate', 'personal', 'whatif', 'stress'];
export const CREATE_MODES: SimMode[] = ['explore', 'simulate', 'personal'];
export const ANALYZE_MODES: SimMode[] = ['whatif', 'stress'];

/** Whether a mode can be activated given current state */
export function canActivateMode(mode: SimMode, hasNodes: boolean): boolean {
  const cfg = MODE_CONFIG[mode];
  if (cfg.requiresGraph && !hasNodes) return false;
  return true;
}

/** Load persisted mode from localStorage */
export function loadMode(): SimMode {
  if (typeof window === 'undefined') return 'simulate';
  const saved = localStorage.getItem('sim-active-mode') as SimMode | null;
  if (saved && ALL_MODES.includes(saved)) return saved;
  return 'simulate';
}

/** Persist mode to localStorage */
export function saveMode(mode: SimMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('sim-active-mode', mode);
}
