'use client';

/**
 * ShortcutItem — singola riga shortcut (label + kbd keys)
 *
 * SPERIMENTA QUI:
 * - padding riga (px-5 py-3.5, px-5 py-4, px-6 py-5)
 * - font-size label (text-[12px], text-[13px], text-[14px])
 * - font-size kbd (text-[10px], text-[11px])
 * - padding kbd (px-1.5 py-0.5, px-2 py-1)
 * - border-radius kbd (rounded, rounded-md)
 * - gap tra keys (gap-1, gap-1.5)
 */

interface ShortcutItemProps {
  label: string;
  keys: string[];
  soon?: boolean;
}

export default function ShortcutItem({ label, keys, soon }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 rounded-lg">
      <span className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
        {label}
        {soon && (
          <span className="ml-2 text-[9px] text-[var(--muted)] bg-[var(--border)] px-1.5 py-0.5 rounded">
            soon
          </span>
        )}
      </span>
      <span className="flex gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
            style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              color: 'var(--muted-foreground)',
              background: 'var(--surface-hover)',
              border: '1px solid var(--border)',
            }}
          >
            {k}
          </kbd>
        ))}
      </span>
    </div>
  );
}
