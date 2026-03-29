import { type ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'purple';

const STYLES: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(59,130,246,0.4)]',
  secondary: 'bg-[var(--surface)] text-[var(--muted-foreground)] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(239,68,68,0.4)]',
  warning: 'bg-[var(--warning)] text-white hover:bg-[var(--warning-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(245,158,11,0.4)]',
  ghost: 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]',
  purple: 'bg-[var(--purple)] text-white hover:bg-[var(--purple-hover)] shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(139,92,246,0.4)]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
  loading?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClass = size === 'sm' ? 'px-4 py-2 text-[13px]' : 'px-5 py-2.5 text-[14px]';

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${sizeClass} rounded-[10px] font-semibold
        transition-all duration-150 cursor-pointer
        disabled:opacity-30 disabled:cursor-not-allowed
        active:scale-[0.97]
        ${STYLES[variant]}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size={size === 'sm' ? 14 : 16} />
          {children}
        </span>
      ) : children}
    </button>
  );
}
