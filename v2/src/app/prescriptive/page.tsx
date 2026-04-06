'use client';

import { ScaffoldShell, ComingSoonBadge, EmailSignup, Icons } from '@/components/scaffold/ScaffoldShell';

export default function PrescriptivePage() {
  const optimizations = [
    {
      bad: 'Open a cafe in Bandung',
      good: 'Open a dark kitchen in Bandung',
      multiplier: '3.2x',
      reason: 'Lower rent, no front-of-house staff, delivery-first market. Same cuisine, 3.2x higher success probability with your capital.',
    },
    {
      bad: 'Launch a SaaS for everyone',
      good: 'Launch a vertical SaaS for dentists',
      multiplier: '4.1x',
      reason: 'Dentists have high willingness-to-pay, low tech adoption, and word-of-mouth networks. TAM is smaller but conversion is 4.1x higher.',
    },
    {
      bad: 'Quit your job and go all-in',
      good: 'Keep your job, build nights + weekends for 6 months',
      multiplier: '2.8x',
      reason: 'Runway of 6+ months reduces panic decisions. Validation before commitment. 2.8x more likely to reach $5K MRR.',
    },
  ];

  return (
    <ScaffoldShell current="/prescriptive">
      {/* Hero */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 40px',
        textAlign: 'center',
      }}>
        <ComingSoonBadge date="Coming 2027" />

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginTop: 24,
        }}>
          Don't simulate.
          <br />
          <span style={{ color: 'var(--accent)' }}>Optimize.</span>
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          marginTop: 24,
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          We don't just tell you what happens — we tell you what to DO.
          The prescriptive engine analyzes your situation and finds
          the highest-probability path to your goal.
        </p>
      </section>

      {/* Optimization examples */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        {optimizations.map((opt, i) => (
          <div key={i} style={{
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            overflow: 'hidden',
          }}>
            {/* Comparison header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'stretch',
            }}>
              {/* Bad option */}
              <div style={{
                padding: '16px 20px',
                background: 'color-mix(in srgb, var(--danger) 5%, transparent)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--danger)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                  Your plan
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{opt.bad}</p>
              </div>

              {/* Arrow */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 12px',
                borderBottom: '1px solid var(--border)',
                color: 'var(--accent)',
              }}>
                {Icons.arrowRight}
              </div>

              {/* Good option */}
              <div style={{
                padding: '16px 20px',
                background: 'color-mix(in srgb, var(--success) 5%, transparent)',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--success)', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                  Our recommendation
                </div>
                <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{opt.good}</p>
              </div>
            </div>

            {/* Explanation */}
            <div style={{ padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--success)',
                lineHeight: 1,
                flexShrink: 0,
              }}>
                {opt.multiplier}
              </span>
              <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>
                {opt.reason}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* How it differs */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '40px 24px',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          Simulation vs. Optimization
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
        }}>
          <div style={{
            padding: 20,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8 }}>
              Simulation (today)
            </h3>
            <ul style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--foreground)', listStyle: 'none', padding: 0, margin: 0 }}>
              <li>Shows what happens</li>
              <li>Maps all possible paths</li>
              <li>You choose which path</li>
              <li>Descriptive output</li>
            </ul>
          </div>
          <div style={{
            padding: 20,
            borderRadius: 10,
            border: '1px solid var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 3%, var(--surface))',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 8 }}>
              Prescriptive (coming)
            </h3>
            <ul style={{ fontSize: 13, lineHeight: 1.8, color: 'var(--foreground)', listStyle: 'none', padding: 0, margin: 0 }}>
              <li>Tells you what to DO</li>
              <li>Finds the optimal path</li>
              <li>Engine recommends for you</li>
              <li>Actionable output</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Email signup */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        borderTop: '1px solid var(--border)',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Get notified when we launch
        </h3>
        <EmailSignup storageKey="sim-prescriptive-emails" />
      </section>
    </ScaffoldShell>
  );
}
