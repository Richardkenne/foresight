'use client';

import Link from 'next/link';
import { useState } from 'react';

/* ─── Shared scaffold page shell ─── */

const NAV_LINKS = [
  { href: '/sim', label: 'Foresight' },
  { href: '/engines', label: 'Engines' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/government', label: 'Government' },
  { href: '/realtime', label: 'Real-Time' },
  { href: '/twin', label: 'Digital Twin' },
  { href: '/execute', label: 'Execute' },
  { href: '/prescriptive', label: 'Prescriptive' },
];

/* Inline SVG icons (Lucide style) — no emoji */
export const Icons = {
  arrowRight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  graph: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><circle cx="19" cy="6" r="2" />
      <path d="M5 8v1a4 4 0 004 4h6a4 4 0 004-4V8" /><line x1="12" y1="13" x2="12" y2="16" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  clock: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  bell: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  trendingUp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  zap: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  target: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  building: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
  ),
  globe: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  activity: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  brain: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z" />
    </svg>
  ),
  compass: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  ),
};

/* ─── Coming Soon Badge ─── */
export function ComingSoonBadge({ date }: { date: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-1) var(--space-3)',
      borderRadius: 20,
      fontSize: 'var(--text-sm)',
      fontWeight: 600,
      letterSpacing: '0.02em',
      color: 'var(--purple)',
      background: 'color-mix(in srgb, var(--purple) 10%, transparent)',
      border: '1px solid color-mix(in srgb, var(--purple) 20%, transparent)',
    }}>
      {Icons.clock}
      {date}
    </span>
  );
}

/* ─── Email Signup ─── */
export function EmailSignup({ storageKey }: { storageKey: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existing.push({ email: email.trim(), timestamp: new Date().toISOString() });
    localStorage.setItem(storageKey, JSON.stringify(existing));
    setSubmitted(true);
    setEmail('');
  };

  if (submitted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-6)',
        borderRadius: 8,
        background: 'color-mix(in srgb, var(--success) 10%, transparent)',
        color: 'var(--success)',
        fontSize: 'var(--text-base)',
        fontWeight: 500,
      }}>
        {Icons.check}
        You're on the list. We'll notify you when we launch.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      gap: 'var(--space-2)',
      maxWidth: 420,
      width: '100%',
    }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        style={{
          flex: 1,
          padding: 'var(--space-3) var(--space-4)',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--foreground)',
          fontSize: 'var(--text-base)',
          outline: 'none',
        }}
      />
      <button type="submit" style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-3) var(--space-6)',
        borderRadius: 8,
        border: 'none',
        background: 'var(--accent)',
        color: 'var(--accent-foreground)',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>
        {Icons.bell}
        Notify me
      </button>
    </form>
  );
}

/* ─── Scaffold Nav ─── */
function ScaffoldNav({ current }: { current: string }) {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border)',
      background: 'color-mix(in srgb, var(--background) 80%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        padding: '0 var(--space-6)',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          textDecoration: 'none',
          color: 'var(--foreground)',
          fontWeight: 600,
          fontSize: 'var(--text-md)',
        }}>
          {Icons.graph}
          <span>Foresight</span>
        </Link>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-1)',
          overflow: 'auto',
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 6,
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              color: current === link.href ? 'var(--accent)' : 'var(--muted-foreground)',
              background: current === link.href ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

/* ─── Scaffold Footer ─── */
function ScaffoldFooter() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: 'var(--space-10) var(--space-6)',
      marginTop: 80,
    }}>
      <div style={{
        maxWidth: 'var(--content-max-width)',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          justifyContent: 'center',
        }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--muted-foreground)',
              textDecoration: 'none',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
        <p style={{
          textAlign: 'center',
          fontSize: 'var(--text-xs)',
          color: 'var(--muted)',
        }}>
          Deterministic life simulation. Built with real data.
        </p>
      </div>
    </footer>
  );
}

/* ─── Main Shell ─── */
export function ScaffoldShell({ current, children }: { current: string; children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)',
      overflowY: 'auto',
    }}>
      <ScaffoldNav current={current} />
      <div style={{ paddingTop: 56 }}>
        {children}
      </div>
      <ScaffoldFooter />
    </div>
  );
}
