'use client';

import { ScaffoldShell, ComingSoonBadge, EmailSignup, Icons } from '@/components/scaffold/ScaffoldShell';

/* Interconnected circles visualization */
function TwinVisualization() {
  const domains = [
    { label: 'Career', cx: 200, cy: 120, r: 60, color: 'var(--accent)' },
    { label: 'Finances', cx: 340, cy: 120, r: 55, color: 'var(--success)' },
    { label: 'Health', cx: 140, cy: 260, r: 50, color: 'var(--warning)' },
    { label: 'Relationships', cx: 400, cy: 260, r: 52, color: 'var(--purple)' },
    { label: 'YOU', cx: 270, cy: 200, r: 35, color: 'var(--foreground)' },
  ];

  return (
    <div style={{
      maxWidth: 540,
      margin: '0 auto',
      aspectRatio: '540/380',
    }}>
      <svg viewBox="0 0 540 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Connection lines */}
        {domains.slice(0, 4).map((d, i) => (
          <line
            key={`line-${i}`}
            x1={270}
            y1={200}
            x2={d.cx}
            y2={d.cy}
            stroke={d.color}
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="4 4"
          />
        ))}
        {/* Cross connections */}
        <line x1={200} y1={120} x2={340} y2={120} stroke="var(--border)" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4" />
        <line x1={200} y1={120} x2={140} y2={260} stroke="var(--border)" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4" />
        <line x1={340} y1={120} x2={400} y2={260} stroke="var(--border)" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4" />
        <line x1={140} y1={260} x2={400} y2={260} stroke="var(--border)" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 4" />

        {/* Domain circles */}
        {domains.map((d, i) => (
          <g key={i}>
            <circle cx={d.cx} cy={d.cy} r={d.r} fill={d.color} fillOpacity="0.08" stroke={d.color} strokeWidth="1.5" strokeOpacity="0.4" />
            <text x={d.cx} y={d.cy + 4} textAnchor="middle" fill={d.color} fontSize={i === 4 ? 14 : 12} fontWeight={i === 4 ? 700 : 500}>
              {d.label}
            </text>
          </g>
        ))}

        {/* Animated pulse on center */}
        <circle cx={270} cy={200} r={35} fill="none" stroke="var(--foreground)" strokeWidth="1" strokeOpacity="0.2">
          <animate attributeName="r" values="35;50;35" dur="3s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.2;0;0.2" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

export default function TwinPage() {
  const features = [
    {
      icon: Icons.brain,
      title: 'Holistic model',
      desc: 'Career, finances, health, relationships — all interconnected. Change one, see the ripple across all.',
    },
    {
      icon: Icons.activity,
      title: 'Continuous updates',
      desc: 'Not a snapshot. A living model that evolves as your life changes. Feed it decisions, it updates projections.',
    },
    {
      icon: Icons.compass,
      title: 'Life trajectory',
      desc: 'See where you are heading — 1 year, 5 years, 10 years. Based on your current decisions and habits.',
    },
    {
      icon: Icons.target,
      title: 'What-if scenarios',
      desc: 'Clone your twin. Try different decisions. Compare outcomes. Pick the one that optimizes for what you care about.',
    },
  ];

  return (
    <ScaffoldShell current="/twin">
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
          Your Digital Twin
        </h1>

        <p style={{
          fontSize: 20,
          fontWeight: 500,
          color: 'var(--muted-foreground)',
          marginTop: 8,
        }}>
          A Complete Model of Your Life
        </p>

        <p style={{
          fontSize: 15,
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          marginTop: 24,
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Not just one simulation — a continuous model of your entire life.
          Every decision you make feeds back into the model.
          Your twin grows with you.
        </p>
      </section>

      {/* Visualization */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 40px',
      }}>
        <div style={{
          borderRadius: 12,
          border: '1px solid var(--border)',
          padding: 24,
          background: 'var(--surface)',
        }}>
          <TwinVisualization />
        </div>
      </section>

      {/* Features */}
      <section style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '0 24px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}>
        {features.map((f, i) => (
          <div key={i} style={{
            padding: 20,
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
          }}>
            <span style={{ color: 'var(--accent)' }}>{f.icon}</span>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginTop: 12 }}>{f.title}</h3>
            <p style={{ fontSize: 12, color: 'var(--muted-foreground)', lineHeight: 1.5, marginTop: 4 }}>{f.desc}</p>
          </div>
        ))}
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
        <EmailSignup storageKey="sim-twin-emails" />
      </section>
    </ScaffoldShell>
  );
}
