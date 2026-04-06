'use client';

import { ScaffoldShell, ComingSoonBadge, Icons } from '@/components/scaffold/ScaffoldShell';

export default function GovernmentPage() {
  const simulations = [
    {
      title: 'Tax increase +2% on SMEs',
      description: 'What happens to small business survival rates if corporate tax increases by 2 percentage points?',
      result: '12.3% more SME closures within 18 months. Retail and hospitality hit hardest.',
      impact: 'High',
    },
    {
      title: 'Universal Basic Income ($1,000/mo)',
      description: 'Impact of UBI on labor participation, inflation, and poverty rates across demographics.',
      result: 'Poverty drops 41%. Labor participation dips 3.2% in year 1, recovers by year 3.',
      impact: 'Very High',
    },
    {
      title: 'Remote work mandate for government',
      description: 'What if 60% of government roles shift to remote? Effect on productivity, real estate, migration.',
      result: 'Office real estate demand drops 28%. Rural migration increases 15%. Productivity neutral.',
      impact: 'Medium',
    },
  ];

  return (
    <ScaffoldShell current="/government">
      {/* Hero — darker, more institutional */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 40px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--muted-foreground)',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          marginBottom: 24,
        }}>
          {Icons.building}
          Institutional Access
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          Policy Simulation<br />
          <span style={{ color: 'var(--muted-foreground)' }}>for Government</span>
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          marginTop: 24,
          maxWidth: 580,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          What happens if we raise taxes by 2%? How many SMEs close?
          Run policy scenarios before they become reality.
          Data-driven governance, not guesswork.
        </p>
      </section>

      {/* Simulation examples */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '0 24px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          marginBottom: 8,
        }}>
          Example Simulations
        </h2>

        {simulations.map((sim, i) => (
          <div key={i} style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 24,
            background: 'var(--surface)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>{sim.title}</h3>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 10,
                color: sim.impact === 'Very High' ? 'var(--danger)' : sim.impact === 'High' ? 'var(--warning)' : 'var(--accent)',
                background: sim.impact === 'Very High'
                  ? 'color-mix(in srgb, var(--danger) 10%, transparent)'
                  : sim.impact === 'High'
                    ? 'color-mix(in srgb, var(--warning) 10%, transparent)'
                    : 'color-mix(in srgb, var(--accent) 10%, transparent)',
              }}>
                {sim.impact} Impact
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5, marginBottom: 12 }}>
              {sim.description}
            </p>
            <div style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--background)',
              border: '1px solid var(--border)',
              fontSize: 13,
              lineHeight: 1.5,
            }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                Projected outcome
              </span>
              <p style={{ marginTop: 4 }}>{sim.result}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Capabilities */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '40px 24px',
        borderTop: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {[
            { icon: Icons.trendingUp, title: 'Economic modeling', desc: 'GDP, employment, inflation, trade balance impact projections.' },
            { icon: Icons.users, title: 'Demographic analysis', desc: 'How policies affect different income brackets, ages, and regions.' },
            { icon: Icons.target, title: 'Risk assessment', desc: 'Second and third-order effects. What breaks when you change one variable.' },
          ].map((cap, i) => (
            <div key={i} style={{
              padding: 20,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
            }}>
              <span style={{ color: 'var(--accent)' }}>{cap.icon}</span>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{cap.title}</h3>
              <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5, marginTop: 4 }}>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: '48px 24px',
        textAlign: 'center',
        borderTop: '1px solid var(--border)',
      }}>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: 12,
        }}>
          Contact us for institutional access
        </h2>
        <p style={{
          fontSize: 13,
          color: 'var(--muted-foreground)',
          marginBottom: 24,
        }}>
          We work with government agencies, policy institutes, and international organizations.
        </p>
        <a href="mailto:hello@simulator.dev" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          borderRadius: 8,
          background: 'var(--foreground)',
          color: 'var(--background)',
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          {Icons.mail}
          Get in touch
        </a>
      </section>
    </ScaffoldShell>
  );
}
