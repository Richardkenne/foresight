'use client';

/**
 * ShortcutItem — singola riga shortcut (label + kbd keys)
 *
 * SPERIMENTA QUI:
 * - padding riga (px-6 py-4, px-6 py-4, px-6 py-6)
 * - font-size label (text-[12px], text-[13px], text-[14px])
 * - font-size kbd (text-[10px], text-[11px])
 * - padding kbd (px-2 py-0.5, px-2 py-1)
 * - border-radius kbd (rounded, rounded-md)
 * - gap tra keys (gap-1, gap-2)
 */

import Text from '@/components/ui/Text';
import Badge from '@/components/ui/Badge';

interface ShortcutItemProps {
  label: string;
  keys: string[];
  soon?: boolean;
}

export default function ShortcutItem({ label, keys, soon }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 rounded-lg">
      <Text variant="caption" style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)' }}>
        {label}
        {soon && (
          <span className="ml-2">
            <Badge variant="neutral" size="sm">soon</Badge>
          </span>
        )}
      </Text>
      <span className="flex gap-1">
        {keys.map((k, i) => (
          <kbd
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded text-[var(--text-xs)] font-medium"
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
