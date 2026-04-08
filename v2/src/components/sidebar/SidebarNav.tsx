'use client';

/**
 * SidebarNav — navigation section
 *
 * SPERIMENTA QUI:
 * - gap tra items (gap-1, gap-2, gap-3)
 * - padding container (py-6 px-6, py-8 px-8)
 */

import NavItem from './NavItem';

const NAV_ITEMS = [
  { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z', label: 'Home', id: 'home' },
  { icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', label: 'History', id: 'history' },
  { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', label: 'Profile', id: 'profile', extra: <circle cx="12" cy="7" r="4" /> },
  { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', label: 'Community', id: 'community', extra: <><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', label: 'Saved', id: 'saved', soon: true },
];

interface SidebarNavProps {
  activeId?: string;
  onNavigate: (id: string) => void;
}

export default function SidebarNav({ activeId = 'home', onNavigate }: SidebarNavProps) {
  return (
    <nav className="py-8 px-8">
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            extra={item.extra}
            label={item.label}
            active={item.id === activeId}
            disabled={item.soon}
            soon={item.soon}
            onClick={() => onNavigate(item.id)}
          />
        ))}
      </div>
    </nav>
  );
}
