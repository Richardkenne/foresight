'use client';

/**
 * Sidebar — menu laterale di Foresight
 *
 * Composto da sub-component indipendenti:
 * - SidebarNav        → src/components/sidebar/SidebarNav.tsx
 * - SidebarSettings   → src/components/sidebar/SidebarSettings.tsx
 * - SidebarViewSelector → src/components/sidebar/SidebarViewSelector.tsx
 * - SidebarShortcuts  → src/components/sidebar/SidebarShortcuts.tsx
 * - SidebarFooter     → src/components/sidebar/SidebarFooter.tsx
 *
 * Il parent (TopBar) gestisce il container esterno (width, background, border, shadow).
 * Questo componente gestisce il layout interno (flex column, overflow scroll).
 * Ogni sub-component gestisce il proprio padding.
 */

import SidebarNav from './sidebar/SidebarNav';
import SidebarSettings from './sidebar/SidebarSettings';
import SidebarViewSelector from './sidebar/SidebarViewSelector';
import SidebarShortcuts from './sidebar/SidebarShortcuts';
import SidebarFooter from './sidebar/SidebarFooter';

interface SidebarProps {
  onClose: () => void;
  onShowHistory: () => void;
  onShowProfile: () => void;
  onNavigateCommunity: () => void;
  displayMode: 'classic' | 'minimal';
  onToggleDisplayMode: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  layoutDirection: 'LR' | 'TB';
  onToggleLayoutDirection: () => void;
  viewMode: '2d' | '3d' | 'flowchart';
  onViewModeChange: (mode: '2d' | '3d' | 'flowchart') => void;
}

export default function Sidebar({
  onClose,
  onShowHistory,
  onShowProfile,
  onNavigateCommunity,
  displayMode,
  onToggleDisplayMode,
  darkMode,
  onToggleDarkMode,
  layoutDirection,
  onToggleLayoutDirection,
  viewMode,
  onViewModeChange,
}: SidebarProps) {

  const handleNavClick = (id: string) => {
    switch (id) {
      case 'home': onClose(); break;
      case 'history': onShowHistory(); break;
      case 'profile': onShowProfile(); break;
      case 'community': onNavigateCommunity(); break;
      default: onClose();
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-y-auto p-6">

      <SidebarNav activeId="home" onNavigate={handleNavClick} />

      {/* spacer — pushes settings to bottom */}
      <div className="flex-1" />

      <SidebarSettings
        displayMode={displayMode}
        onToggleDisplayMode={onToggleDisplayMode}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
        layoutDirection={layoutDirection}
        onToggleLayoutDirection={onToggleLayoutDirection}
      />

      <SidebarViewSelector
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />

      <SidebarShortcuts />

      <SidebarFooter />

    </div>
  );
}
