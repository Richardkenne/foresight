'use client';

/**
 * ToggleItem — singola riga con icona + label + toggle switch
 *
 * SPERIMENTA QUI:
 * - padding (px-5 py-4, px-6 py-5)
 * - gap icona-testo (gap-3, gap-4, gap-5)
 * - font-size (text-[14px], text-[15px], text-[16px])
 * - border-radius (rounded-lg, rounded-xl)
 * - dimensione icona (width="18", width="20", width="22")
 * - dimensione toggle (w-[44px] h-[24px], w-[48px] h-[26px])
 * - colore toggle attivo (var(--accent), var(--warning), var(--purple))
 */

import type { ReactNode } from 'react';

interface ToggleItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  activeColor?: string;
  onClick: () => void;
}

export default function ToggleItem({ icon, label, active, activeColor = 'var(--accent)', onClick }: ToggleItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-5 rounded-xl text-[15px] transition-colors cursor-pointer hover:bg-[var(--surface-hover)]"
      style={{ color: 'var(--foreground)' }}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span>{label}</span>
      </div>

      {/* Toggle switch */}
      <div
        className="relative w-[44px] h-[24px] rounded-full transition-colors"
        style={{ background: active ? activeColor : 'var(--border)' }}
      >
        <div
          className="absolute top-[2px] w-[20px] h-[20px] rounded-full shadow transition-all"
          style={{ left: active ? '22px' : '2px', background: 'var(--surface)' }}
        />
      </div>
    </button>
  );
}
