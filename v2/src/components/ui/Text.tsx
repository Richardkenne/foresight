import { type HTMLAttributes } from 'react';

type Variant = 'heading' | 'subheading' | 'body' | 'caption' | 'mono' | 'label';

const VARIANT_STYLES: Record<Variant, React.CSSProperties> = {
  heading: {
    fontSize: 'var(--text-xl)',
    fontWeight: 'var(--font-semibold)' as unknown as number,
    letterSpacing: 'var(--tracking-tight)',
    lineHeight: 'var(--leading-tight)' as unknown as number,
    color: 'var(--foreground)',
  },
  subheading: {
    fontSize: 'var(--text-lg)',
    fontWeight: 'var(--font-medium)' as unknown as number,
    letterSpacing: 'var(--tracking-tight)',
    lineHeight: 'var(--leading-tight)' as unknown as number,
    color: 'var(--foreground)',
  },
  body: {
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--font-normal)' as unknown as number,
    lineHeight: 'var(--leading-normal)' as unknown as number,
    color: 'var(--foreground)',
  },
  caption: {
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-normal)' as unknown as number,
    lineHeight: 'var(--leading-normal)' as unknown as number,
    color: 'var(--muted)',
  },
  mono: {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-medium)' as unknown as number,
    fontFamily: 'var(--font-geist-mono)',
    letterSpacing: '0.02em',
    color: 'var(--foreground)',
  },
  label: {
    fontSize: 'var(--text-sm)',
    fontWeight: 'var(--font-semibold)' as unknown as number,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--muted)',
  },
};

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'label';
  muted?: boolean;
}

export default function Text({
  variant = 'body',
  as: Tag = 'span',
  muted,
  children,
  style,
  ...props
}: TextProps) {
  return (
    <Tag
      style={{
        ...VARIANT_STYLES[variant],
        ...(muted ? { color: 'var(--muted)' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
