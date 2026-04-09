import { type ButtonHTMLAttributes } from 'react';

type Variant = 'ghost' | 'subtle' | 'solid';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md';
}

const SIZE_CLASSES = {
  sm: 'w-7 h-7 text-sm',
  md: 'w-[34px] h-[34px] text-base',
} as const;

const VARIANT_CLASSES: Record<Variant, string> = {
  ghost: [
    'bg-transparent text-[var(--muted)] border-none',
    'hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]',
  ].join(' '),
  subtle: [
    'bg-[var(--surface-hover)] text-[var(--muted-foreground)] border border-[var(--border-subtle)]',
    'hover:bg-[var(--surface-hover)] hover:border-[var(--border)]',
  ].join(' '),
  solid: [
    'bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] shadow-[var(--shadow-sm)]',
    'hover:bg-[var(--surface-hover)]',
  ].join(' '),
};

export default function IconButton({
  variant = 'ghost',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center shrink-0
        rounded-[var(--radius-sm)] cursor-pointer
        transition-all duration-150
        active:scale-90
        disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none
        ${SIZE_CLASSES[size]}
        ${VARIANT_CLASSES[variant]}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
