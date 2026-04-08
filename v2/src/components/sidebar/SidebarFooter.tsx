'use client';

/**
 * SidebarFooter — bottom footer text
 *
 * SPERIMENTA QUI:
 * - padding (px-6 py-4)
 * - font-size (text-[10px], text-[11px], text-[12px])
 * - colore (var(--muted))
 */

export default function SidebarFooter() {
  return (
    <div className="px-8 py-6 border-t border-[var(--border)]">
      <div className="text-[11px] text-[var(--muted)]">Foresight</div>
    </div>
  );
}
