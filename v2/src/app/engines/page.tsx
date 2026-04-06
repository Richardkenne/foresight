'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScaffoldShell, Icons } from '@/components/scaffold/ScaffoldShell';

interface EngineCard {
  id: string;
  name: string;
  icon: React.ReactNode;
  dataPoints: string;
  active: boolean;
  templateKey?: string;
}

const ENGINES: EngineCard[] = [
  { id: 'cafe', name: 'Cafe / Restaurant', icon: Icons.building, dataPoints: '15K+', active: true, templateKey: 'cafe' },
  { id: 'saas', name: 'SaaS', icon: Icons.zap, dataPoints: '12K+', active: true, templateKey: 'saas' },
  { id: 'freelance', name: 'Freelancing', icon: Icons.users, dataPoints: '8K+', active: true, templateKey: 'freelance' },
  { id: 'startup', name: 'Startup', icon: Icons.trendingUp, dataPoints: '18K+', active: true, templateKey: 'startup' },
  { id: 'content', name: 'Content Creator', icon: Icons.activity, dataPoints: '10K+', active: true, templateKey: 'content' },
  { id: 'crypto', name: 'Crypto / Trading', icon: Icons.trendingUp, dataPoints: '14K+', active: true, templateKey: 'crypto_journey' },
  { id: 'ecommerce', name: 'E-Commerce', icon: Icons.globe, dataPoints: '9K+', active: false },
  { id: 'realestate', name: 'Real Estate', icon: Icons.building, dataPoints: '11K+', active: false },
  { id: 'consulting', name: 'Consulting', icon: Icons.brain, dataPoints: '7K+', active: false },
  { id: 'healthcare', name: 'Healthcare', icon: Icons.activity, dataPoints: '13K+', active: false },
  { id: 'education', name: 'Education / EdTech', icon: Icons.compass, dataPoints: '6K+', active: false },
  { id: 'manufacturing', name: 'Manufacturing', icon: Icons.building, dataPoints: '8K+', active: false },
  { id: 'fintech', name: 'FinTech', icon: Icons.trendingUp, dataPoints: '10K+', active: false },
  { id: 'agriculture', name: 'Agriculture', icon: Icons.globe, dataPoints: '5K+', active: false },
  { id: 'logistics', name: 'Logistics', icon: Icons.compass, dataPoints: '7K+', active: false },
  { id: 'media', name: 'Media / Publishing', icon: Icons.activity, dataPoints: '6K+', active: false },
  { id: 'legal', name: 'Legal Services', icon: Icons.building, dataPoints: '4K+', active: false },
  { id: 'energy', name: 'Energy / CleanTech', icon: Icons.zap, dataPoints: '8K+', active: false },
  { id: 'gaming', name: 'Gaming', icon: Icons.target, dataPoints: '5K+', active: false },
  { id: 'biotech', name: 'Biotech / Pharma', icon: Icons.brain, dataPoints: '9K+', active: false },
];

export default function EnginesPage() {
  const router = useRouter();
  const [toast, setToast] = useState<string | null>(null);

  const handleClick = (engine: EngineCard) => {
    if (engine.active && engine.templateKey) {
      router.push(`/sim?template=${engine.templateKey}`);
    } else {
      setToast(engine.name);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const activeCount = ENGINES.filter(e => e.active).length;
  const totalCount = ENGINES.length;

  return (
    <ScaffoldShell current="/engines">
      {/* Hero */}
      <section style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 24px 40px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}>
          50 Industry Engines
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--muted-foreground)',
          lineHeight: 1.7,
          marginTop: 16,
          maxWidth: 600,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Every industry has its own failure modes, bottlenecks, and success patterns.
          Each engine is trained on industry-specific data — not generic advice.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          marginTop: 24,
          fontSize: 13,
          color: 'var(--muted-foreground)',
        }}>
          <span><strong style={{ color: 'var(--success)' }}>{activeCount}</strong> Active</span>
          <span><strong style={{ color: 'var(--purple)' }}>{totalCount - activeCount}</strong> Coming Soon</span>
          <span><strong style={{ color: 'var(--foreground)' }}>350K+</strong> Total Data Points</span>
        </div>
      </section>

      {/* Grid */}
      <section style={{
        maxWidth: 1000,
        margin: '0 auto',
        padding: '0 24px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
      }}>
        {ENGINES.map((engine) => (
          <button
            key={engine.id}
            onClick={() => handleClick(engine)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 20,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = engine.active ? 'var(--accent)' : 'var(--purple)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}>
              <span style={{ color: engine.active ? 'var(--accent)' : 'var(--muted)' }}>
                {engine.icon}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 10,
                color: engine.active ? 'var(--success)' : 'var(--purple)',
                background: engine.active
                  ? 'color-mix(in srgb, var(--success) 10%, transparent)'
                  : 'color-mix(in srgb, var(--purple) 10%, transparent)',
              }}>
                {engine.active ? 'Active' : 'Coming Soon'}
              </span>
            </div>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>{engine.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
                {engine.dataPoints} data points
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: engine.active ? 'var(--accent)' : 'var(--muted-foreground)',
              fontWeight: 500,
            }}>
              {engine.active ? 'Open simulator' : 'Notify me'}
              {Icons.arrowRight}
            </div>
          </button>
        ))}
      </section>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: 10,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          zIndex: 100,
          animation: 'fadeInUp 0.2s ease-out',
        }}>
          {Icons.bell}
          <span>{toast} engine coming soon. You'll be notified.</span>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </ScaffoldShell>
  );
}
