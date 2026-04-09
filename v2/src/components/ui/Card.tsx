import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'ghost';
  padding?: 'sm' | 'md' | 'lg';
}

const PADDING = {
  sm: 'var(--space-3)',
  md: 'var(--space-4)',
  lg: 'var(--space-6)',
} as const;

export default function Card({
  variant = 'default',
  padding = 'md',
  children,
  style,
  className = '',
  ...props
}: CardProps) {
  const base: React.CSSProperties = {
    borderRadius: 'var(--radius)',
    padding: PADDING[padding],
    background: 'var(--surface)',
  };

  const variants: Record<string, React.CSSProperties> = {
    default:  { border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' },
    elevated: { border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' },
    ghost:    { border: 'none', background: 'transparent' },
  };

  return (
    <div
      className={className}
      style={{ ...base, ...variants[variant], ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
