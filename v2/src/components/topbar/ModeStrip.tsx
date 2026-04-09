'use client';

/**
 * ModeStrip — mode selector + sacred mode toggle
 *
 * SPERIMENTA QUI:
 * - padding mode selector (py-1, py-2)
 * - altezza sacred row (h-[32px], h-[36px], h-[40px])
 * - padding sacred row (px-2 sm:px-6)
 * - dimensione sacred button (h-[22px], h-[26px])
 * - font-size sacred (text-[10px], text-[11px], text-[12px])
 */

import ModeSelector from '../ModeSelector';
import PersonalProfileInline from '../PersonalProfileInline';
import type { SimMode } from '@/lib/sim-modes';
import type { UserProfile } from '@/lib/user-profile';

interface ModeStripProps {
  activeMode: SimMode;
  onModeChange: (mode: SimMode) => void;
  hasNodes: boolean;
  sacredMode?: boolean;
  onSacredModeChange?: (val: boolean) => void;
  onProfileChange?: (profile: UserProfile) => void;
}

export default function ModeStrip({
  activeMode,
  onModeChange,
  hasNodes,
  sacredMode,
  onSacredModeChange,
  onProfileChange,
}: ModeStripProps) {
  return (
    <>
      {/* Mode selector */}
      <div
        className="flex justify-center py-2"
        style={{ borderBottom: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)' }}
      >
        <ModeSelector activeMode={activeMode} onModeChange={onModeChange} hasNodes={hasNodes} />
      </div>

      {/* Personal mode profile inline */}
      {activeMode === 'personal' && (
        <div className="px-4 pt-2">
          <PersonalProfileInline onProfileChange={onProfileChange} />
        </div>
      )}

      {/* Sacred mode toggle row */}
      <div
        className="h-[40px] flex items-center gap-3 px-3 sm:px-6 border-t border-[var(--border)] overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => onSacredModeChange?.(!sacredMode)}
          className="flex items-center gap-2 h-[24px] px-3 rounded-md text-[var(--text-xs)] font-medium shrink-0 cursor-pointer transition-all hover:bg-[var(--surface-hover)] active:scale-95"
          style={{
            background: sacredMode ? 'var(--purple-muted)' : 'transparent',
            color: sacredMode ? 'var(--sacred-accent)' : 'var(--muted)',
            border: sacredMode ? '1px solid color-mix(in srgb, var(--sacred-accent) 25%, transparent)' : '1px dashed color-mix(in srgb, var(--foreground) 10%, transparent)',
          }}
          title={sacredMode ? 'Switch to Data mode' : 'Switch to Sacred mode (Bible + Quran)'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {sacredMode ? 'Sacred' : 'Sacred'}
        </button>
      </div>
    </>
  );
}
