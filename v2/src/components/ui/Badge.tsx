import { type HTMLAttributes, type ButtonHTMLAttributes } from 'react';

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

const STYLES: Record<Variant, React.CSSProperties> = {
  success:  { background: 'var(--success-muted)', color: 'var(--success)', border: '1px solid var(--success)' },
  warning:  { background: 'var(--warning-muted)', color: 'var(--warning)', border: '1px solid var(--warning)' },
  danger:   { background: 'var(--danger-muted)',  color: 'var(--danger)',  border: '1px solid var(--danger)' },
  info:     { background: 'color-mix(in srgb, var(--accent) 10%, transparent)', color: 'var(--accent)', border: '1px solid var(--accent)' },
  neutral:  { background: 'var(--surface-hover)', color: 'var(--muted-foreground)', border: '1px solid var(--border)' },
  purple:   { background: 'var(--purple-muted)',  color: 'var(--purple)',  border: '1px solid var(--purple)' },
};

type BadgeProps = {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
} & (
  | ({ onClick: React.MouseEventHandler<HTMLButtonElement> } & ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ onClick?: never } & HTMLAttributes<HTMLSpanElement>)
);

export default function Badge({
  variant = 'neutral',
  size = 'sm',
  children,
  style,
  onClick,
  ...props
}: BadgeProps) {
  const sizeStyles: React.CSSProperties = size === 'sm'
    ? { fontSize: 'var(--text-xs)', padding: '1px var(--space-2)' }
    : size === 'lg'
      ? { fontSize: 'var(--text-base)', padding: 'var(--space-1) var(--space-3)' }
      : { fontSize: 'var(--text-sm)', padding: '2px var(--space-2)' };

  const sharedStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--space-1)',
    borderRadius: 'var(--radius-full)',
    fontWeight: 600,
    fontFamily: 'var(--font-geist-mono)',
    letterSpacing: '0.02em',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    ...sizeStyles,
    ...STYLES[variant],
    ...style,
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{
          ...sharedStyle,
          cursor: 'pointer',
          background: sharedStyle.background as string,
          border: sharedStyle.border as string,
          font: 'inherit',
          transition: 'filter 0.15s, transform 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.92)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = ''; }}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <span
      style={sharedStyle}
      {...(props as HTMLAttributes<HTMLSpanElement>)}
    >
      {children}
    </span>
  );
}
