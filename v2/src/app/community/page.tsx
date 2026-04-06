'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { loadFeedback, aggregateFeedback, type FeedbackEntry, type FeedbackAggregation } from '@/lib/feedback';

/* ─── Animated counter ─── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const step = Math.max(1, Math.ceil(target / (duration / 16)));
          let current = 0;
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(current);
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Calibration bar ─── */
function CalibrationBar({ predicted, actual, label }: { predicted: number; actual: number; label: string }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
        <div className="flex gap-3 text-[10px] tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)' }}>
          <span style={{ color: 'var(--muted)' }}>Predicted: {predicted}%</span>
          <span style={{ color: 'var(--foreground)' }}>Actual: {actual}%</span>
        </div>
      </div>
      <div className="h-2 rounded-full overflow-hidden relative" style={{ background: 'var(--surface-hover)' }}>
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${predicted}%`, background: 'var(--muted)', opacity: 0.3 }}
        />
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${actual}%`, background: actual > predicted ? '#059669' : '#d97706' }}
        />
      </div>
    </div>
  );
}

/* ─── Story card (anonymized) ─── */
function StoryCard({ entry }: { entry: FeedbackEntry }) {
  const outcomeColors: Record<string, string> = {
    success: '#059669',
    partial: '#d97706',
    failure: '#6b7280',
  };
  const outcomeLabels: Record<string, string> = {
    success: 'Succeeded',
    partial: 'Partial outcome',
    failure: "Didn't work out",
  };

  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            background: `${outcomeColors[entry.actualOutcome]}12`,
            color: outcomeColors[entry.actualOutcome],
            fontFamily: 'var(--font-geist-mono)',
          }}
        >
          {outcomeLabels[entry.actualOutcome]}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
          {entry.timeElapsed}
        </span>
      </div>
      <p className="text-[12px] mb-2 leading-relaxed" style={{ color: 'var(--foreground)' }}>
        {entry.scenario}
      </p>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-[10px] tabular-nums" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
          Predicted: {entry.predictedProb}%
        </span>
      </div>
      {entry.details && (
        <p className="text-[11px] leading-relaxed mb-1" style={{ color: 'var(--muted-foreground)' }}>
          {entry.details}
        </p>
      )}
      {entry.lessons && (
        <div
          className="mt-2 px-3 py-2 rounded-lg text-[11px] leading-relaxed"
          style={{ background: 'var(--surface-hover)', color: 'var(--muted-foreground)' }}
        >
          <span className="text-[9px] uppercase tracking-wider font-medium block mb-1" style={{ color: 'var(--muted)' }}>
            Lesson learned
          </span>
          {entry.lessons}
        </div>
      )}
    </div>
  );
}

/* ─── Main community page ─── */
export default function CommunityPage() {
  const [agg, setAgg] = useState<FeedbackAggregation | null>(null);
  const [simCount, setSimCount] = useState(0);

  useEffect(() => {
    // Load from localStorage
    const entries = loadFeedback();
    setAgg(aggregateFeedback(entries));

    // Load simulation count from localStorage
    const count = localStorage.getItem('sim-total-count');
    setSimCount(count ? parseInt(count, 10) : 0);

    // Also try server data
    fetch('/api/feedback')
      .then(r => r.json())
      .then(data => {
        if (data.entries && data.entries.length > entries.length) {
          setAgg(aggregateFeedback(data.entries));
        }
      })
      .catch(() => {});
  }, []);

  if (!agg) return null;

  const hasData = agg.total > 0;

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: 'var(--foreground)', textDecoration: 'none' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="6" r="2" /><circle cx="12" cy="18" r="2" /><circle cx="19" cy="6" r="2" />
            <path d="M5 8v1a4 4 0 004 4h6a4 4 0 004-4V8" /><line x1="12" y1="13" x2="12" y2="16" />
          </svg>
          Simulator
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sim" className="text-[13px] font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer" style={{ background: 'var(--foreground)', color: 'var(--background)', textDecoration: 'none' }}>
            Open Simulator
          </Link>
        </div>
      </nav>

      <div className="max-w-[720px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-semibold tracking-tight mb-2" style={{ color: 'var(--foreground)' }}>
            Community Outcomes
          </h1>
          <p className="text-[14px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Real results from real people. After running a simulation, users come back months later to report what actually happened. This data helps calibrate our predictions.
          </p>
        </div>

        {/* Flywheel counters */}
        <div
          className="grid grid-cols-3 gap-4 mb-10 p-6 rounded-2xl"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
        >
          <div className="text-center">
            <div className="text-[28px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--foreground)' }}>
              <Counter target={simCount} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] font-medium mt-1" style={{ color: 'var(--muted)' }}>
              Simulations run
            </div>
          </div>
          <div className="text-center">
            <div className="text-[28px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--foreground)' }}>
              <Counter target={agg.total} />
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] font-medium mt-1" style={{ color: 'var(--muted)' }}>
              Outcomes reported
            </div>
          </div>
          <div className="text-center">
            <div className="text-[28px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-geist-mono)', color: hasData ? (agg.calibrationScore >= 70 ? '#059669' : agg.calibrationScore >= 40 ? '#d97706' : '#dc2626') : 'var(--muted)' }}>
              {hasData ? <Counter target={agg.calibrationScore} suffix="%" /> : '--'}
            </div>
            <div className="text-[10px] uppercase tracking-[0.08em] font-medium mt-1" style={{ color: 'var(--muted)' }}>
              Calibration accuracy
            </div>
          </div>
        </div>

        {hasData ? (
          <>
            {/* Predictions vs Reality */}
            <div className="mb-10">
              <h2 className="text-[13px] uppercase tracking-[0.1em] font-medium mb-4" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                Our Predictions vs Reality
              </h2>
              <div
                className="rounded-2xl p-5"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                <CalibrationBar
                  predicted={agg.avgPredicted}
                  actual={agg.avgActualSuccess}
                  label="Overall success rate"
                />

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="text-center py-3 rounded-xl" style={{ background: 'rgba(5, 150, 105, 0.06)' }}>
                    <div className="text-[18px] font-semibold tabular-nums" style={{ color: '#059669', fontFamily: 'var(--font-geist-mono)' }}>
                      {agg.successCount}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-medium mt-0.5" style={{ color: '#059669', opacity: 0.7 }}>
                      Succeeded
                    </div>
                  </div>
                  <div className="text-center py-3 rounded-xl" style={{ background: 'rgba(217, 119, 6, 0.06)' }}>
                    <div className="text-[18px] font-semibold tabular-nums" style={{ color: '#d97706', fontFamily: 'var(--font-geist-mono)' }}>
                      {agg.partialCount}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-medium mt-0.5" style={{ color: '#d97706', opacity: 0.7 }}>
                      Partial
                    </div>
                  </div>
                  <div className="text-center py-3 rounded-xl" style={{ background: 'rgba(107, 114, 128, 0.06)' }}>
                    <div className="text-[18px] font-semibold tabular-nums" style={{ color: '#6b7280', fontFamily: 'var(--font-geist-mono)' }}>
                      {agg.failureCount}
                    </div>
                    <div className="text-[9px] uppercase tracking-wider font-medium mt-0.5" style={{ color: '#6b7280', opacity: 0.7 }}>
                      Didn&apos;t work out
                    </div>
                  </div>
                </div>

                {/* Insight line */}
                <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <p className="text-[12px] leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    The simulator predicted an average {agg.avgPredicted}% success rate, and {agg.avgActualSuccess}% of people who tried actually succeeded or partially succeeded. Calibration score: {agg.calibrationScore}%.
                  </p>
                </div>
              </div>
            </div>

            {/* Anonymized stories */}
            <div className="mb-10">
              <h2 className="text-[13px] uppercase tracking-[0.1em] font-medium mb-4" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                Community Stories
              </h2>
              {agg.entries
                .filter(e => e.details || e.lessons)
                .slice(0, 10)
                .map((entry) => (
                  <StoryCard key={entry.id} entry={entry} />
                ))}
              {agg.entries.filter(e => e.details || e.lessons).length === 0 && (
                <p className="text-[13px]" style={{ color: 'var(--muted)' }}>
                  No stories shared yet. Be the first to report your outcome.
                </p>
              )}
            </div>
          </>
        ) : (
          /* Empty state */
          <div
            className="text-center py-16 rounded-2xl"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="text-[15px] font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              No outcomes reported yet
            </h3>
            <p className="text-[13px] max-w-[360px] mx-auto mb-6" style={{ color: 'var(--muted-foreground)' }}>
              Run a simulation, live your decision, then come back to share what happened. Your data helps everyone.
            </p>
            <Link
              href="/sim"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
              style={{
                background: 'var(--foreground)',
                color: 'var(--background)',
                textDecoration: 'none',
              }}
            >
              Run a simulation
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-[10px]" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
            All data is anonymous. No personal information is collected.
          </p>
        </div>
      </div>
    </main>
  );
}
