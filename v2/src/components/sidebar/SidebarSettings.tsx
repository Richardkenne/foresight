'use client';

/**
 * SidebarSettings — toggle settings section
 *
 * SPERIMENTA QUI:
 * - gap tra items (gap-1, gap-2)
 * - padding container (px-4 py-5)
 * - spacing label "Settings" (mb-3, mb-4)
 */

import Text from '@/components/ui/Text';
import ToggleItem from './ToggleItem';

interface SidebarSettingsProps {
  displayMode: 'classic' | 'minimal';
  onToggleDisplayMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  layoutDirection: 'LR' | 'TB';
  onToggleLayoutDirection: () => void;
}

export default function SidebarSettings({
  displayMode,
  onToggleDisplayMode,
  darkMode,
  onToggleDarkMode,
  layoutDirection,
  onToggleLayoutDirection,
}: SidebarSettingsProps) {
  return (
    <div className="px-8 py-6 border-t border-[var(--border)]">
      <Text variant="label" as="div" className="px-4 mb-4">
        Settings
      </Text>
      <div className="flex flex-col gap-1">
        <ToggleItem
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
            </svg>
          }
          label={displayMode === 'classic' ? 'Classic' : 'Minimal'}
          active={displayMode === 'classic'}
          activeColor="#f59e0b"
          onClick={onToggleDisplayMode}
        />
        <ToggleItem
          icon={
            darkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )
          }
          label={darkMode ? 'Light mode' : 'Dark mode'}
          active={darkMode}
          onClick={onToggleDarkMode}
        />
        <ToggleItem
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {layoutDirection === 'TB' ? (
                <><line x1="12" y1="2" x2="12" y2="22" /><polyline points="8 6 12 2 16 6" /><polyline points="8 18 12 22 16 18" /></>
              ) : (
                <><line x1="2" y1="12" x2="22" y2="12" /><polyline points="6 8 2 12 6 16" /><polyline points="18 8 22 12 18 16" /></>
              )}
            </svg>
          }
          label={layoutDirection === 'TB' ? 'Vertical' : 'Horizontal'}
          active={layoutDirection === 'TB'}
          activeColor="var(--purple)"
          onClick={onToggleLayoutDirection}
        />
      </div>
    </div>
  );
}
