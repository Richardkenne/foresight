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
        className="flex justify-center py-1"
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
        className="h-[32px] flex items-center gap-1.5 px-2 sm:px-6 border-t border-[var(--border)] overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        <button
          onClick={() => onSacredModeChange?.(!sacredMode)}
          className="flex items-center gap-1.5 h-[22px] px-2.5 rounded-md text-[10px] font-medium shrink-0 cursor-pointer transition-all"
          style={{
            background: sacredMode ? 'rgba(168,85,247,0.12)' : 'transparent',
            color: sacredMode ? '#a855f7' : 'var(--muted)',
            border: sacredMode ? '1px solid rgba(168,85,247,0.25)' : '1px dashed rgba(0,0,0,0.1)',
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
