'use client';

/**
 * NavItem — singola riga di navigazione (icona + label + hover)
 *
 * SPERIMENTA QUI:
 * - padding (px-5 py-4, px-6 py-5)
 * - gap icona-testo (gap-4, gap-5, gap-6)
 * - font-size (text-[14px], text-[15px], text-[16px])
 * - border-radius (rounded-lg, rounded-xl, rounded-2xl)
 * - dimensione icona (width="20", width="24", width="28")
 * - hover background color
 */

import type { ReactNode } from 'react';
import Badge from '@/components/ui/Badge';

interface NavItemProps {
  icon: string;
  extra?: ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  soon?: boolean;
  onClick: () => void;
}

export default function NavItem({ icon, extra, label, active, disabled, soon, onClick }: NavItemProps) {
  return (
    <button
      className="w-full flex items-center gap-5 px-4 py-5 rounded-xl text-[15px] transition-colors cursor-pointer"
      style={{
        color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
        background: active ? 'var(--surface-hover)' : 'transparent',
        fontWeight: active ? 600 : 400,
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      onClick={onClick}
      disabled={disabled}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
        {extra}
      </svg>
      {label}
      {soon && (
        <span className="ml-auto">
          <Badge variant="neutral" size="sm">Soon</Badge>
        </span>
      )}
    </button>
  );
}
