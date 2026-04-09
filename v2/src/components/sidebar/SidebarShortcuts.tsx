'use client';

/**
 * SidebarShortcuts — shortcuts section
 *
 * SPERIMENTA QUI:
 * - padding container (px-6 py-5)
 * - spacing label "Shortcuts" (mb-3, mb-4)
 */

import Text from '@/components/ui/Text';
import ShortcutItem from './ShortcutItem';

const SHORTCUTS = [
  { label: 'Command palette', keys: ['Cmd', 'K'] },
  { label: 'Generate', keys: ['Enter'] },
  { label: 'Stop / Cancel', keys: ['Esc'] },
  { label: 'Undo', keys: ['Cmd', 'Z'], soon: true },
];

export default function SidebarShortcuts() {
  return (
    <div className="px-8 py-6 border-t border-[var(--border)]">
      <Text variant="label" as="div" className="px-4 mb-4">
        Shortcuts
      </Text>
      {SHORTCUTS.map((s) => (
        <ShortcutItem
          key={s.label}
          label={s.label}
          keys={s.keys}
          soon={s.soon}
        />
      ))}
    </div>
  );
}
