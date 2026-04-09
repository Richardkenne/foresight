'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScaffoldShell, Icons } from '@/components/scaffold/ScaffoldShell';
import { generateExecutionPlan, type ExecutionPlan, type ExecutionStep } from '@/lib/execution-planner';

// ── SVG Icons (Lucide style, no emoji) ──

function RocketIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect x="2" y="8" width="20" height="12" rx="2" />
      <path d="M6 16h.01" />
      <path d="M18 16h.01" />
      <path d="M10 16h4" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

// ── Phase colors and icons ──

const PHASE_CONFIG: Record<string, { color: string; bg: string }> = {
  Legal: { color: 'var(--purple-hover)', bg: 'color-mix(in srgb, var(--purple-hover) 8%, transparent)' },
  Financial: { color: 'var(--success-hover)', bg: 'color-mix(in srgb, var(--success-hover) 8%, transparent)' },
  Operations: { color: 'var(--accent-hover)', bg: 'color-mix(in srgb, var(--accent-hover) 8%, transparent)' },
  Marketing: { color: 'var(--warning-hover)', bg: 'color-mix(in srgb, var(--warning-hover) 8%, transparent)' },
  Launch: { color: 'var(--danger-hover)', bg: 'color-mix(in srgb, var(--danger-hover) 8%, transparent)' },
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  ready: { color: 'var(--success-hover)', bg: 'color-mix(in srgb, var(--success-hover) 10%, transparent)', label: 'Ready', icon: <CheckCircleIcon /> },
  'needs-human': { color: 'var(--warning-hover)', bg: 'color-mix(in srgb, var(--warning-hover) 10%, transparent)', label: 'Needs Human', icon: <UserIcon /> },
  'coming-soon': { color: 'var(--muted-foreground)', bg: 'color-mix(in srgb, var(--muted-foreground) 10%, transparent)', label: 'Coming Soon', icon: <ClockIcon /> },
};

// ── Step Card ──

function StepCard({ step, isLast }: { step: ExecutionStep; isLast: boolean }) {
  const phase = PHASE_CONFIG[step.phase] || PHASE_CONFIG.Operations;
  const status = STATUS_CONFIG[step.status];
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {/* Timeline line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          background: phase.bg,
          border: `2px solid ${phase.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          color: phase.color,
          fontFamily: 'var(--font-geist-mono)',
          flexShrink: 0,
        }}>
          {step.id}
        </div>
        {!isLast && (
          <div style={{
            width: 2,
            flex: 1,
            minHeight: 20,
            background: 'var(--border)',
          }} />
        )}
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          marginBottom: isLast ? 0 : 8,
          padding: '16px 20px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = phase.color;
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 2px 8px ${phase.color}15`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.08em',
                padding: '2px 8px',
                borderRadius: 4,
                background: phase.bg,
                color: phase.color,
              }}>
                {step.phase}
              </span>
              <span style={{
                fontSize: 9,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                borderRadius: 4,
                background: status.bg,
                color: status.color,
              }}>
                {status.icon}
                {status.label}
              </span>
            </div>
            <h3 style={{
              fontSize: 'var(--text-md)',
              fontWeight: 600,
              color: 'var(--foreground)',
              margin: 0,
              lineHeight: 1.4,
            }}>
              {step.action}
            </h3>
          </div>
          {/* Meta pills */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-geist-mono)',
            }}>
              <DollarIcon />
              {step.estimatedCost}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'var(--muted-foreground)',
              fontFamily: 'var(--font-geist-mono)',
            }}>
              <ClockIcon />
              {step.estimatedTime}
            </span>
          </div>
        </div>

        {/* Platform */}
        <div style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap',
        }}>
          {step.platformUrl ? (
            <a
              href={step.platformUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 'var(--text-sm)',
                color: 'var(--accent)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              {step.platform}
              <ExternalLinkIcon />
            </a>
          ) : (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>{step.platform}</span>
          )}
          {step.automatable && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 'var(--text-xs)',
              color: 'var(--purple-hover)',
              background: 'color-mix(in srgb, var(--purple-hover) 8%, transparent)',
              padding: '1px 6px',
              borderRadius: 4,
            }}>
              <BotIcon />
              Automatable
            </span>
          )}
          {step.apiAvailable && (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 'var(--text-xs)',
              color: 'var(--accent-hover)',
              background: 'color-mix(in srgb, var(--accent-hover) 8%, transparent)',
              padding: '1px 6px',
              borderRadius: 4,
            }}>
              <ApiIcon />
              API
            </span>
          )}
        </div>

        {/* Expanded description */}
        {expanded && (
          <div style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 1.6,
              color: 'var(--muted-foreground)',
              margin: 0,
            }}>
              {step.description}
            </p>
            {step.dependencies.length > 0 && (
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
                marginTop: 8,
                fontFamily: 'var(--font-geist-mono)',
              }}>
                Depends on: {step.dependencies.map(d => `Step ${d}`).join(', ')}
              </p>
            )}
            {step.status === 'ready' && step.platformUrl && (
              <a
                href={step.platformUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 12,
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--foreground)',
                  color: 'var(--background)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
              >
                Go to {step.platform}
                <ArrowRightIcon />
              </a>
            )}
            {step.status === 'coming-soon' && (
              <p style={{
                fontSize: 11,
                color: 'var(--muted)',
                marginTop: 8,
                fontStyle: 'italic',
              }}>
                {step.apiAvailable
                  ? `An API integration with ${step.platform} could automate this step in the future.`
                  : 'This step requires manual action and cannot currently be automated.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Summary Card ──

function SummaryCard({ plan }: { plan: ExecutionPlan }) {
  const readyCount = plan.steps.filter(s => s.status === 'ready').length;
  const humanCount = plan.steps.filter(s => s.status === 'needs-human').length;
  const automatableCount = plan.steps.filter(s => s.automatable).length;
  const phases = [...new Set(plan.steps.map(s => s.phase))];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
      gap: 12,
      marginBottom: 32,
    }}>
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>
          ${plan.totalEstimatedCost.min.toLocaleString()}-${plan.totalEstimatedCost.max.toLocaleString()}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>
          Estimated Cost
        </div>
      </div>
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>
          {plan.totalEstimatedWeeks.min}-{plan.totalEstimatedWeeks.max}w
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>
          Estimated Time
        </div>
      </div>
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--success-hover)', fontFamily: 'var(--font-geist-mono)' }}>
          {readyCount}/{plan.steps.length}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>
          Ready Now
        </div>
      </div>
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--warning-hover)', fontFamily: 'var(--font-geist-mono)' }}>
          {humanCount}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>
          Need Human
        </div>
      </div>
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--purple-hover)', fontFamily: 'var(--font-geist-mono)' }}>
          {automatableCount}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>
          Automatable
        </div>
      </div>
      <div style={{
        padding: 16,
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}>
          {phases.length}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginTop: 4, fontWeight: 600 }}>
          Phases
        </div>
      </div>
    </div>
  );
}

// ── Main content (needs searchParams) ──

function ExecuteContent() {
  const searchParams = useSearchParams();
  const [scenario, setScenario] = useState(searchParams.get('scenario') || '');
  const [country, setCountry] = useState('United States');
  const [budget, setBudget] = useState('10000');
  const [plan, setPlan] = useState<ExecutionPlan | null>(null);
  const [activePhase, setActivePhase] = useState<string | null>(null);

  // Auto-generate if scenario comes from URL
  useEffect(() => {
    const s = searchParams.get('scenario');
    if (s && !plan) {
      setScenario(s);
      setPlan(generateExecutionPlan(s, country, parseInt(budget) || 10000));
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGenerate = () => {
    if (!scenario.trim()) return;
    setPlan(generateExecutionPlan(scenario.trim(), country, parseInt(budget) || 10000));
    setActivePhase(null);
  };

  const filteredSteps = plan
    ? activePhase
      ? plan.steps.filter(s => s.phase === activePhase)
      : plan.steps
    : [];

  const phases = plan ? [...new Set(plan.steps.map(s => s.phase))] : [];

  return (
    <ScaffoldShell current="/execute">
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}>
              <RocketIcon />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', margin: 0, letterSpacing: '-0.02em' }}>
              Execution Agent
            </h1>
          </div>
          <p style={{ fontSize: 'var(--text-base)', color: 'var(--muted-foreground)', lineHeight: 1.6, maxWidth: 560 }}>
            From simulation to action. Generate a step-by-step execution plan with real platforms, realistic costs, and honest status on what can be automated today.
          </p>
        </div>

        {/* Input form */}
        <div style={{
          padding: 24,
          borderRadius: 16,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          marginBottom: 32,
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Scenario
            </label>
            <input
              type="text"
              value={scenario}
              onChange={e => setScenario(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Open a coffee shop in Jakarta, Build a SaaS for dentists, Start freelancing on Upwork..."
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontSize: 'var(--text-md)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                Country
              </label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer',
                }}
              >
                <option>United States</option>
                <option>Indonesia</option>
                <option>United Kingdom</option>
                <option>Italy</option>
                <option>Singapore</option>
                <option>Australia</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                Budget (USD)
              </label>
              <input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="10000"
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--foreground)',
                  fontSize: 'var(--text-base)',
                  outline: 'none',
                  fontFamily: 'var(--font-geist-mono)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleGenerate}
              disabled={!scenario.trim()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 10,
                border: 'none',
                background: scenario.trim() ? 'var(--foreground)' : 'var(--border)',
                color: scenario.trim() ? 'var(--background)' : 'var(--muted)',
                fontSize: 'var(--text-base)',
                fontWeight: 600,
                cursor: scenario.trim() ? 'pointer' : 'default',
                transition: 'opacity 0.15s',
              }}
            >
              <RocketIcon />
              Generate Plan
            </button>
            <a
              href={`/sim${scenario ? `?q=${encodeURIComponent(scenario)}` : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '12px 20px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted-foreground)',
                fontSize: 'var(--text-base)',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <PlayIcon />
              Simulate First
            </a>
          </div>
        </div>

        {/* Results */}
        {plan && (
          <>
            {/* Plan type badge */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: 6,
                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                color: 'var(--accent)',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.06em',
              }}>
                {plan.type} Plan
              </span>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-foreground)' }}>
                {plan.steps.length} steps across {phases.length} phases
              </span>
            </div>

            {/* Summary metrics */}
            <SummaryCard plan={plan} />

            {/* Phase filter tabs */}
            <div style={{
              display: 'flex',
              gap: 6,
              marginBottom: 24,
              flexWrap: 'wrap',
            }}>
              <button
                onClick={() => setActivePhase(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: !activePhase ? 'var(--foreground)' : 'transparent',
                  color: !activePhase ? 'var(--background)' : 'var(--muted-foreground)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                All ({plan.steps.length})
              </button>
              {phases.map(p => {
                const config = PHASE_CONFIG[p] || PHASE_CONFIG.Operations;
                const count = plan.steps.filter(s => s.phase === p).length;
                return (
                  <button
                    key={p}
                    onClick={() => setActivePhase(activePhase === p ? null : p)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 8,
                      border: `1px solid ${activePhase === p ? config.color : 'var(--border)'}`,
                      background: activePhase === p ? config.bg : 'transparent',
                      color: activePhase === p ? config.color : 'var(--muted-foreground)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {p} ({count})
                  </button>
                );
              })}
            </div>

            {/* Steps timeline */}
            <div>
              {filteredSteps.map((step, i) => (
                <StepCard key={step.id} step={step} isLast={i === filteredSteps.length - 1} />
              ))}
            </div>

            {/* Bottom summary */}
            <div style={{
              marginTop: 40,
              padding: 24,
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
                Total: ${plan.totalEstimatedCost.min.toLocaleString()}-${plan.totalEstimatedCost.max.toLocaleString()} over {plan.totalEstimatedWeeks.min}-{plan.totalEstimatedWeeks.max} weeks
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 16 }}>
                {plan.steps.filter(s => s.status === 'ready').length} steps can be started immediately.
                {plan.steps.filter(s => s.automatable).length} steps can be partially or fully automated.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`/sim?q=${encodeURIComponent(scenario)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {Icons.graph}
                  Simulate This Scenario
                </a>
                <a
                  href="/explore"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--muted-foreground)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {Icons.compass}
                  Explore More Tools
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </ScaffoldShell>
  );
}

// ── Page wrapper with Suspense ──

export default function ExecutePage() {
  return (
    <Suspense fallback={
      <ScaffoldShell current="/execute">
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', color: 'var(--muted-foreground)', fontSize: 13 }}>
          Loading...
        </div>
      </ScaffoldShell>
    }>
      <ExecuteContent />
    </Suspense>
  );
}
