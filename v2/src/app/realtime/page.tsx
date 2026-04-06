'use client';

import { useState, useEffect } from 'react';
import { ScaffoldShell, ComingSoonBadge, EmailSignup, Icons } from '@/components/scaffold/ScaffoldShell';

/* Simulated live data feed */
function LiveFeed() {
  const feeds = [
    { label: 'BTC/USD', value: '$67,432', change: '-2.1%', negative: true },
    { label: 'US Unemployment', value: '3.8%', change: '+0.1%', negative: true },
    { label: 'S&P 500', value: '5,234', change: '+0.4%', negative: false },
    { label: 'Fed Rate', value: '5.25%', change: '0.0%', negative: false },
    { label: 'CPI Inflation', value: '3.1%', change: '-0.2%', negative: false },
    { label: 'EUR/USD', value: '1.0842', change: '-0.3%', negative: true },
  ];

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 8,
    }}>
      {feeds.map((f, i) => (
        <div key={i} style={{
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          opacity: tick > i ? 1 : 0.4,
          transition: 'opacity 0.3s',
        }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500, marginBottom: 4 }}>{f.label}</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{f.value}</div>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            color: f.negative ? 'var(--danger)' : 'var(--success)',
            marginTop: 2,
          }}>
            {f.change}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RealtimePage() {
  const alerts = [
    {
      icon: Icons.trendingUp,
      title: 'Bitcoin dropped 15%',
      desc: 'Your crypto simulation updated. New failure probability: 84% (was 71%).',
      time: '2 min ago',
      color: 'var(--danger)',
    },
    {
      icon: Icons.activity,
      title: 'US Fed raised rates to 5.5%',
      desc: 'Your SaaS funding simulation adjusted. Seed round probability: -8%.',
      time: '1 hour ago',
      color: 'var(--warning)',
    },
    {
      icon: Icons.globe,
      title: 'Indonesia GDP growth beats forecast',
      desc: 'Your cafe simulation in Bandung improved. Revenue projection: +12%.',
      time: '3 hours ago',
      color: 'var(--success)',
    },
  ];

  return (
    <ScaffoldShell current="/realtime">
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
          Real-Time<br />
          <span style={{ color: 'var(--accent)' }}>Reality Engine</span>
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
          Your simulations update automatically when the world changes.
          Interest rates move? Market crashes? New policy announced?
          Every probability in your simulation recalibrates in real time.
        </p>
      </section>

      {/* Live dashboard mockup */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 40px',
      }}>
        <div style={{
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: 20,
          background: 'var(--surface)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            fontSize: 12,
            color: 'var(--muted-foreground)',
            fontWeight: 500,
          }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--success)',
              animation: 'pulse 2s infinite',
            }} />
            Live data feeds
          </div>
          <LiveFeed />
        </div>
      </section>

      {/* Alerts */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 40px',
      }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          marginBottom: 16,
        }}>
          Simulation Alerts
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alerts.map((alert, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: 16,
              padding: 20,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              alignItems: 'flex-start',
            }}>
              <span style={{ color: alert.color, flexShrink: 0, marginTop: 2 }}>
                {alert.icon}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>{alert.title}</h3>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{alert.time}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{alert.desc}</p>
              </div>
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
        borderTop: '1px solid var(--border)',
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Get notified when we launch
        </h3>
        <EmailSignup storageKey="sim-realtime-emails" />
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </ScaffoldShell>
  );
}
