import { type ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost' | 'purple';

const STYLES: Record<Variant, string> = {
  primary: 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)] shadow-[var(--shadow-sm)]',
  secondary: 'bg-[var(--surface)] text-[var(--muted-foreground)] shadow-[0_0_0_1px_var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]',
  danger: 'bg-[var(--danger)] text-white hover:bg-[var(--danger-hover)] shadow-[var(--shadow-sm)]',
  warning: 'bg-[var(--warning)] text-white hover:bg-[var(--warning-hover)] shadow-[var(--shadow-sm)]',
  ghost: 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]',
  purple: 'bg-[var(--purple)] text-white hover:bg-[var(--purple-hover)] shadow-[var(--shadow-sm)]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
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
  const sizeClass = size === 'sm'
    ? 'px-4 py-2 text-[var(--text-base)]'
    : size === 'lg'
      ? 'px-6 py-3 text-[var(--text-lg)]'
      : 'px-5 py-2.5 text-[var(--text-md)]';

  return (
    <button
      disabled={disabled || loading}
      className={`
        ${sizeClass} rounded-[var(--radius)] font-semibold
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
          <Spinner size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          {children}
        </span>
      ) : children}
    </button>
  );
}
