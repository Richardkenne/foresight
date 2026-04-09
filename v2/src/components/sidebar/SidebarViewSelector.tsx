'use client';

/**
 * SidebarViewSelector — view mode buttons (2D, 3D, Flow)
 *
 * SPERIMENTA QUI:
 * - gap tra bottoni (gap-2, gap-3)
 * - padding bottoni (py-3, py-3)
 * - border-radius (rounded-lg, rounded-xl)
 */

import Text from '@/components/ui/Text';

const VIEW_MODES: { mode: '2d' | '3d' | 'flowchart'; label: string; icon: string }[] = [
  { mode: '2d', label: '2D', icon: 'M3 3h18v18H3V3z' },
  { mode: '3d', label: '3D', icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z' },
  { mode: 'flowchart', label: 'Flow', icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V15M9 21H5a2 2 0 0 1-2-2V15' },
];

interface SidebarViewSelectorProps {
  viewMode: '2d' | '3d' | 'flowchart';
  onViewModeChange: (mode: '2d' | '3d' | 'flowchart') => void;
}

export default function SidebarViewSelector({ viewMode, onViewModeChange }: SidebarViewSelectorProps) {
  return (
    <div className="px-8 py-6 border-t border-[var(--border)]">
      <Text variant="label" as="div" className="px-4 mb-4">
        View
      </Text>
      <div className="flex gap-3 px-4">
        {VIEW_MODES.map(({ mode, label, icon }) => (
          <button
            key={mode}
            onClick={() => onViewModeChange(mode)}
            className="flex-1 flex flex-col items-center gap-1 py-3 rounded-lg text-[11px] font-medium transition-all cursor-pointer hover:bg-[var(--surface-hover)] active:scale-95"
            style={{
              background: viewMode === mode ? 'var(--foreground)' : 'transparent',
              color: viewMode === mode ? 'var(--surface)' : 'var(--muted)',
              border: viewMode === mode ? 'none' : '1px solid var(--border)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={icon} />
            </svg>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
