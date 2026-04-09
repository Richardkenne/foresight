'use client';

/**
 * SidebarHeader — logo FORESIGHT + close button
 *
 * SPERIMENTA QUI:
 * - altezza header (h-[56px], h-[60px], h-[64px])
 * - padding orizzontale (px-5, px-6, px-8)
 * - font-size logo (text-[14px], text-[16px], text-[18px])
 * - letter-spacing (tracking-[0.06em], tracking-[0.08em], tracking-[0.1em])
 * - dimensione bottone X (h-10 w-10, h-11 w-11)
 */

import Text from '@/components/ui/Text';
import IconButton from '@/components/ui/IconButton';

interface SidebarHeaderProps {
  onClose: () => void;
}

export default function SidebarHeader({ onClose }: SidebarHeaderProps) {
  return (
    <div className="h-[var(--topbar-height)] flex items-center justify-between px-8 border-b border-[var(--border)]">
      <Text variant="mono" style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.08em' }}>
        FORESIGHT
      </Text>
      <IconButton variant="ghost" size="md" onClick={onClose} aria-label="Close sidebar">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  );
}
