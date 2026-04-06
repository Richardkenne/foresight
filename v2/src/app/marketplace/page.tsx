'use client';

import { ScaffoldShell, ComingSoonBadge, EmailSignup, Icons } from '@/components/scaffold/ScaffoldShell';

export default function MarketplacePage() {
  const markets = [
    {
      question: 'Will a SaaS in SEA with $10K reach $1M ARR?',
      yes: 23,
      no: 77,
      volume: '$12,400',
      traders: 89,
    },
    {
      question: 'Can a solo founder reach $10K MRR in 12 months?',
      yes: 31,
      no: 69,
      volume: '$8,200',
      traders: 134,
    },
    {
      question: 'Will someone with $50K saved retire by 45?',
      yes: 18,
      no: 82,
      volume: '$22,100',
      traders: 211,
    },
  ];

  return (
    <ScaffoldShell current="/marketplace">
      {/* Hero */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 40px',
        textAlign: 'center',
      }}>
        <ComingSoonBadge date="Coming Q3 2026" />

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginTop: 24,
        }}>
          Prediction Marketplace
        </h1>

        <p style={{
          fontSize: 20,
          fontWeight: 500,
          color: 'var(--muted-foreground)',
          marginTop: 8,
        }}>
          Bet on Life Decisions
        </p>

        <p style={{
          fontSize: 15,
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          marginTop: 24,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Like Polymarket for real life. Bet on whether scenarios succeed or fail.
          Real money calibrates the model — when people put skin in the game,
          the probabilities become truth.
        </p>
      </section>

      {/* Example Markets */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {markets.map((m, i) => (
          <div key={i} style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            background: 'var(--surface)',
          }}>
            <p style={{
              fontSize: 15,
              fontWeight: 600,
              lineHeight: 1.4,
              marginBottom: 16,
            }}>
              {m.question}
            </p>

            {/* Probability bar */}
            <div style={{
              display: 'flex',
              borderRadius: 6,
              overflow: 'hidden',
              height: 36,
              marginBottom: 12,
            }}>
              <div style={{
                width: `${m.yes}%`,
                background: 'color-mix(in srgb, var(--success) 20%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--success)',
              }}>
                YES {m.yes}%
              </div>
              <div style={{
                width: `${m.no}%`,
                background: 'color-mix(in srgb, var(--danger) 20%, transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--danger)',
              }}>
                NO {m.no}%
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: 16,
              fontSize: 12,
              color: 'var(--muted-foreground)',
            }}>
              <span>Volume: {m.volume}</span>
              <span>{m.traders} traders</span>
            </div>
          </div>
        ))}

        <p style={{
          fontSize: 12,
          color: 'var(--muted)',
          textAlign: 'center',
          marginTop: 8,
        }}>
          Example markets shown above. Real markets launching Q3 2026.
        </p>
      </section>

      {/* How it works */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '40px 24px',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          How it works
        </h2>

        <div style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        }}>
          {[
            { num: '01', title: 'Pick a scenario', desc: 'Browse life and business scenarios from the Simulator.' },
            { num: '02', title: 'Place your bet', desc: 'Bet YES or NO on the outcome. Real money, real conviction.' },
            { num: '03', title: 'Calibrate truth', desc: 'Collective bets create the most accurate probability model ever built.' },
          ].map((s) => (
            <div key={s.num} style={{
              padding: 20,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent)',
                marginBottom: 8,
              }}>{s.num}</div>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
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
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-0.01em',
        }}>
          Get notified when we launch
        </h3>
        <EmailSignup storageKey="sim-marketplace-emails" />
      </section>
    </ScaffoldShell>
  );
}
