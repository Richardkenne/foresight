/**
 * Design Tokens — JS export layer
 *
 * Source of truth: globals.css :root variables.
 * This file provides typed access for components that need
 * color values in JS (inline styles, conditional logic).
 *
 * Usage:
 *   import { nodeColors, probColor, tokens } from '@/lib/design-tokens';
 *   style={{ color: nodeColors('bottleneck').accent }}
 *   style={{ color: probColor(75) }}
 */

// ─── CSS Variable Helpers ───

/** Read a CSS custom property at runtime */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

// ─── Node Type Colors ───

export type NodeType =
  | 'start' | 'desire' | 'action' | 'state'
  | 'bottleneck' | 'trajectory' | 'gate' | 'decision'
  | 'outcome-good' | 'outcome-bad' | 'loop';

export interface NodeColorSet {
  accent: string;
  bg: string;
  text: string;
}

/** Get CSS variable references for a node type */
export function nodeColors(type: string): NodeColorSet {
  const key = type || 'state';
  return {
    accent: `var(--node-${key}-accent)`,
    bg:     `var(--node-${key}-bg)`,
    text:   `var(--node-${key}-text)`,
  };
}

/** Fallback: static light-mode values for contexts where CSS vars don't resolve */
const NODE_COLORS_STATIC: Record<string, NodeColorSet> = {
  start:          { accent: '#3b82f6', bg: '#eff6ff', text: '#2563eb' },
  desire:         { accent: '#8b5cf6', bg: '#f5f3ff', text: '#7c3aed' },
  action:         { accent: '#3b82f6', bg: '#eff6ff', text: '#2563eb' },
  state:          { accent: '#5f7d63', bg: '#d8ead8', text: '#3d5e41' },
  bottleneck:     { accent: '#f59e0b', bg: '#fffbeb', text: '#d97706' },
  trajectory:     { accent: '#7f5aa6', bg: '#efe2fb', text: '#6b3fa0' },
  gate:           { accent: '#d97706', bg: '#fffbeb', text: '#b45309' },
  decision:       { accent: '#06b6d4', bg: '#ecfeff', text: '#0891b2' },
  'outcome-good': { accent: '#6daa84', bg: '#f0faf4', text: '#4a8a64' },
  'outcome-bad':  { accent: '#c87e7e', bg: '#fef2f2', text: '#b45555' },
  loop:           { accent: '#64748b', bg: '#f8fafc', text: '#475569' },
};

export function nodeColorsStatic(type: string): NodeColorSet {
  return NODE_COLORS_STATIC[type] || NODE_COLORS_STATIC.state;
}

// ─── Sacred Mode ───

export const sacred = {
  accent: 'var(--sacred-accent)',
  bg:     'var(--sacred-bg)',
  text:   'var(--sacred-text)',
  border: 'var(--sacred-border)',
} as const;

// ─── Probability Colors ───

/** Returns CSS variable for probability-based coloring */
export function probColor(prob: number): string {
  if (prob >= 60) return 'var(--prob-high)';
  if (prob >= 40) return 'var(--prob-mid)';
  return 'var(--prob-low)';
}

export function probBgColor(prob: number): string {
  if (prob >= 60) return 'var(--prob-high-bg)';
  if (prob >= 40) return 'var(--prob-mid-bg)';
  return 'var(--prob-low-bg)';
}

/** Static hex values for contexts where CSS vars don't resolve (e.g., SVG gradients) */
export function probColorStatic(prob: number): string {
  if (prob >= 60) return '#10b981';
  if (prob >= 40) return '#f59e0b';
  return '#ef4444';
}

// ─── Tier Colors ───

export function tierColor(tier: number): string {
  if (tier === 3) return 'var(--tier-3)';
  if (tier === 2) return 'var(--tier-2)';
  return 'var(--tier-1)';
}

// ─── Semantic Tokens (CSS var references) ───

export const tokens = {
  // Core
  background:       'var(--background)',
  foreground:       'var(--foreground)',
  surface:          'var(--surface)',
  surfaceHover:     'var(--surface-hover)',
  border:           'var(--border)',
  borderSubtle:     'var(--border-subtle)',
  muted:            'var(--muted)',
  mutedForeground:  'var(--muted-foreground)',

  // Status
  accent:           'var(--accent)',
  accentHover:      'var(--accent-hover)',
  accentForeground: 'var(--accent-foreground)',
  danger:           'var(--danger)',
  dangerHover:      'var(--danger-hover)',
  dangerMuted:      'var(--danger-muted)',
  warning:          'var(--warning)',
  warningHover:     'var(--warning-hover)',
  warningMuted:     'var(--warning-muted)',
  success:          'var(--success)',
  successHover:     'var(--success-hover)',
  successMuted:     'var(--success-muted)',
  purple:           'var(--purple)',
  purpleHover:      'var(--purple-hover)',
  purpleMuted:      'var(--purple-muted)',

  // Shadows
  shadowSm: 'var(--shadow-sm)',
  shadowMd: 'var(--shadow-md)',
  shadowLg: 'var(--shadow-lg)',
  shadowXl: 'var(--shadow-xl)',

  // Radius
  radiusSm:   'var(--radius-sm)',
  radius:     'var(--radius)',
  radiusLg:   'var(--radius-lg)',
  radiusXl:   'var(--radius-xl)',
  radiusFull: 'var(--radius-full)',

  // Spacing
  space1:  'var(--space-1)',
  space2:  'var(--space-2)',
  space3:  'var(--space-3)',
  space4:  'var(--space-4)',
  space6:  'var(--space-6)',
  space8:  'var(--space-8)',
  space10: 'var(--space-10)',
  space12: 'var(--space-12)',

  // Typography
  textXs:  'var(--text-xs)',
  textSm:  'var(--text-sm)',
  textBase: 'var(--text-base)',
  textMd:  'var(--text-md)',
  textLg:  'var(--text-lg)',
  textXl:  'var(--text-xl)',
  text2xl: 'var(--text-2xl)',
  text3xl: 'var(--text-3xl)',

  // Animation
  durationFast:   'var(--duration-fast)',
  durationNormal: 'var(--duration-normal)',
  durationSlow:   'var(--duration-slow)',
  easeDefault:    'var(--ease-default)',
  easeIn:         'var(--ease-in)',
  easeOut:        'var(--ease-out)',
  easeBounce:     'var(--ease-bounce)',

  // Z-index
  zBase:     'var(--z-base)',
  zDropdown: 'var(--z-dropdown)',
  zSticky:   'var(--z-sticky)',
  zOverlay:  'var(--z-overlay)',
  zModal:    'var(--z-modal)',
  zToast:    'var(--z-toast)',
} as const;
