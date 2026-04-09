import { type HTMLAttributes } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

const STYLES: Record<Variant, React.CSSProperties> = {
  success:  { background: 'var(--success-muted)', color: 'var(--success)', border: '1px solid var(--success)' },
  warning:  { background: 'var(--warning-muted)', color: 'var(--warning)', border: '1px solid var(--warning)' },
  danger:   { background: 'var(--danger-muted)',  color: 'var(--danger)',  border: '1px solid var(--danger)' },
  info:     { background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)', border: '1px solid var(--accent)' },
  neutral:  { background: 'var(--surface-hover)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' },
  purple:   { background: 'var(--purple-muted)',  color: 'var(--purple)',  border: '1px solid var(--purple)' },
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

export default function Badge({
  variant = 'neutral',
  size = 'sm',
  children,
  style,
  ...props
}: BadgeProps) {
  const sizeStyles: React.CSSProperties = size === 'sm'
    ? { fontSize: 'var(--text-xs)', padding: '1px 6px' }
    : { fontSize: 'var(--text-sm)', padding: '2px 8px' };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 'var(--radius-full)',
        fontWeight: 600,
        fontFamily: 'var(--font-geist-mono)',
        letterSpacing: '0.02em',
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...sizeStyles,
        ...STYLES[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
