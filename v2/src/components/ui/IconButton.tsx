import { type ButtonHTMLAttributes } from 'react';

type Variant = 'ghost' | 'subtle' | 'solid';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

const SIZE = {
  sm: { width: 28, height: 28, fontSize: 14 },
  md: { width: 34, height: 34, fontSize: 16 },
} as const;

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  ghost: {
    background: 'transparent',
    color: 'var(--muted)',
    border: 'none',
  },
  subtle: {
    background: 'var(--surface-hover)',
    color: 'var(--muted-foreground)',
    border: '1px solid var(--border-subtle)',
  },
  solid: {
    background: 'var(--surface)',
    color: 'var(--foreground)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
};

export default function IconButton({
  variant = 'ghost',
  size = 'md',
  children,
  style,
  className = '',
  ...props
}: IconButtonProps) {
  const s = SIZE[size];

  return (
    <button
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: s.width,
        height: s.height,
        fontSize: s.fontSize,
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'background var(--duration-fast), color var(--duration-fast)',
        flexShrink: 0,
        ...VARIANT_STYLES[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
