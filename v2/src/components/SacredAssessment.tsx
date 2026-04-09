'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ASSESSMENT_QUESTIONS,
  computeSacredProfile,
  saveSacredProfile,
  loadSacredProfile,
  saveSacredAnswers,
  loadSacredAnswers,
  clearSacredAssessment,
  DOMAIN_LABELS,
  DOMAIN_ORDER,
  type SacredProfile,
} from '@/lib/sacred-assessment';
import sacredRoots from '@/lib/sacred-roots.json';

// ─── Types ─────────────────────────────────────────────────────────

interface SacredAssessmentProps {
  onClose: () => void;
  onComplete?: (profile: SacredProfile) => void;
}

type ViewMode = 'assessment' | 'results';

// ─── Root lookup ───────────────────────────────────────────────────

const rootsById = Object.fromEntries(
  sacredRoots.map((r: { id: string; domain: string; label_positive: string; name_en: string }) => [r.id, r])
);

// ─── Radar / Domain Chart ──────────────────────────────────────────

function DomainChart({ profile }: { profile: SacredProfile }) {
  const domainScores = useMemo(() => {
    const result: { domain: string; label: string; score: number; roots: { id: string; name: string; score: number }[] }[] = [];

    for (const domain of DOMAIN_ORDER) {
      const domainRoots = sacredRoots
        .filter((r: { domain: string }) => r.domain === domain)
        .map((r: { id: string; label_positive: string }) => ({
          id: r.id,
          name: r.label_positive,
          score: profile[r.id] ?? 0,
        }));

      const scores = domainRoots.filter(r => r.score > 0);
      const avg = scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10) / 10
        : 0;

      result.push({
        domain,
        label: DOMAIN_LABELS[domain] || domain,
        score: avg,
        roots: domainRoots,
      });
    }
    return result;
  }, [profile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {domainScores.map(d => (
        <div key={d.domain} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--foreground)' }}>{d.label}</span>
            <span style={{
              fontSize: '10px', fontWeight: 700, fontFamily: 'var(--font-geist-mono, monospace)',
              color: d.score >= 7 ? 'var(--success)' : d.score >= 4 ? 'var(--accent)' : 'var(--danger)',
            }}>
              {d.score > 0 ? d.score.toFixed(1) : '--'}
            </span>
          </div>
          {/* Bar */}
          <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--surface-hover)', overflow: 'hidden' }}>
            <div style={{
              width: `${(d.score / 10) * 100}%`,
              height: '100%',
              borderRadius: '3px',
              background: d.score >= 7 ? 'var(--success)' : d.score >= 4 ? 'var(--accent)' : 'var(--danger)',
              transition: 'width 0.6s ease',
            }} />
          </div>
          {/* Individual roots */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', paddingLeft: 'var(--space-1)' }}>
            {d.roots.filter(r => r.score > 0).map(r => (
              <span key={r.id} style={{
                fontSize: '9px', padding: '1px var(--space-2)', borderRadius: '4px',
                background: r.score >= 7 ? 'rgba(16,185,129,0.1)' : r.score >= 4 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)',
                color: r.score >= 7 ? 'var(--success)' : r.score >= 4 ? 'var(--accent)' : 'var(--danger)',
                fontFamily: 'var(--font-geist-mono, monospace)',
              }}>
                {r.name} {r.score.toFixed(1)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export default function SacredAssessment({ onClose, onComplete }: SacredAssessmentProps) {
  const [view, setView] = useState<ViewMode>('assessment');
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<SacredProfile | null>(null);

  const questionsPerPage = 5;
  const totalPages = Math.ceil(ASSESSMENT_QUESTIONS.length / questionsPerPage);
  const pageQuestions = ASSESSMENT_QUESTIONS.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage,
  );

  // Load existing answers on mount
  useEffect(() => {
    const existing = loadSacredProfile();
    const existingAnswers = loadSacredAnswers();
    if (existing && existingAnswers) {
      setProfile(existing);
      setAnswers(existingAnswers);
      setView('results');
    }
  }, []);

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progress = (answeredCount / totalQuestions) * 100;
  const allAnswered = answeredCount >= totalQuestions;

  const handleSelect = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleComplete = () => {
    const result = computeSacredProfile(answers);
    saveSacredProfile(result);
    saveSacredAnswers(answers);
    setProfile(result);
    setView('results');
    onComplete?.(result);
  };

  const handleRetake = () => {
    clearSacredAssessment();
    setAnswers({});
    setProfile(null);
    setCurrentPage(0);
    setView('assessment');
  };

  // ─── Results View ──────────────────────────────────────────────

  if (view === 'results' && profile) {
    const scoredRoots = Object.entries(profile).sort((a, b) => b[1] - a[1]);
    const top3 = scoredRoots.slice(0, 3);
    const bottom3 = scoredRoots.filter(([, s]) => s > 0).slice(-3).reverse();

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
            Sacred Profile
          </button>
          <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px var(--space-2)', borderRadius: '10px', letterSpacing: '0.06em', fontFamily: 'var(--font-geist-mono, monospace)', background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
            COMPLETE
          </span>
        </div>

        {/* Results content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            <div style={{ flex: 1, padding: 'var(--space-3) var(--space-3)', borderRadius: '8px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.06em', marginBottom: 'var(--space-1)', fontFamily: 'var(--font-geist-mono, monospace)' }}>STRONGEST</div>
              {top3.map(([id, score]) => (
                <div key={id} style={{ fontSize: '10px', color: 'var(--foreground)', lineHeight: 1.5 }}>
                  {rootsById[id]?.label_positive ?? id} <span style={{ color: 'var(--success)', fontWeight: 600, fontFamily: 'var(--font-geist-mono, monospace)' }}>{score.toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: 'var(--space-3) var(--space-3)', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--danger)', letterSpacing: '0.06em', marginBottom: 'var(--space-1)', fontFamily: 'var(--font-geist-mono, monospace)' }}>GROWTH AREAS</div>
              {bottom3.map(([id, score]) => (
                <div key={id} style={{ fontSize: '10px', color: 'var(--foreground)', lineHeight: 1.5 }}>
                  {rootsById[id]?.label_positive ?? id} <span style={{ color: 'var(--danger)', fontWeight: 600, fontFamily: 'var(--font-geist-mono, monospace)' }}>{score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Domain breakdown */}
          <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: 'var(--space-3)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
            DOMAIN BREAKDOWN
          </div>
          <DomainChart profile={profile} />
        </div>

        {/* Footer */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--space-2)' }}>
          <button onClick={handleRetake} style={{
            flex: 1, padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: '6px',
            background: 'none', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
          }}>
            Retake Assessment
          </button>
          <button onClick={onClose} style={{
            flex: 1, padding: 'var(--space-2)', border: 'none', borderRadius: '6px',
            background: 'var(--foreground)', color: 'var(--background)', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
          }}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── Assessment View ──────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          Sacred Assessment
        </button>
        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px var(--space-2)', borderRadius: '10px', letterSpacing: '0.06em', fontFamily: 'var(--font-geist-mono, monospace)', background: 'var(--surface-hover)', color: 'var(--muted)' }}>
          {answeredCount}/{totalQuestions}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ padding: '0 var(--space-4)', paddingTop: 'var(--space-3)' }}>
        <div style={{ width: '100%', height: '3px', borderRadius: '2px', background: 'var(--surface-hover)', overflow: 'hidden' }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: '2px',
            background: progress >= 100 ? 'var(--success)' : 'var(--foreground)',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Questions */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {pageQuestions.map((q, idx) => {
            const globalIdx = currentPage * questionsPerPage + idx + 1;
            const selectedScore = answers[q.questionId];
            const mappedRoots = q.rootIds.map(id => rootsById[id]?.label_positive).filter(Boolean);

            return (
              <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {/* Question number + text */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '9px', fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--font-geist-mono, monospace)',
                    minWidth: '20px', paddingTop: '2px',
                  }}>
                    {String(globalIdx).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--foreground)', lineHeight: 1.5, marginBottom: '2px' }}>
                      {q.question}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                      {mappedRoots.join(' + ')}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: 'var(--space-8)' }}>
                  {q.options.map(opt => {
                    const isSelected = selectedScore === opt.score;
                    return (
                      <button
                        key={opt.score}
                        onClick={() => handleSelect(q.questionId, opt.score)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-3)', borderRadius: '6px', cursor: 'pointer',
                          border: isSelected ? '1px solid var(--foreground)' : '1px solid var(--border)',
                          background: isSelected ? 'var(--foreground)' : 'var(--surface)',
                          color: isSelected ? 'var(--background)' : 'var(--foreground)',
                          fontSize: '11px', fontWeight: isSelected ? 500 : 400,
                          textAlign: 'left' as const, transition: 'all 0.15s',
                          width: '100%',
                        }}
                      >
                        <span style={{
                          width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                          border: isSelected ? '4px solid var(--background)' : '2px solid var(--border)',
                          background: isSelected ? 'var(--background)' : 'transparent',
                          transition: 'all 0.15s',
                        }} />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer / Navigation */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
        {currentPage > 0 && (
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--border)', borderRadius: '6px',
              background: 'none', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 'var(--space-1)' }}>
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Page dots */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 'var(--space-1)' }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <div key={i} style={{
              width: '6px', height: '6px', borderRadius: '3px',
              background: i === currentPage ? 'var(--foreground)' : 'var(--border)',
              transition: 'background 0.2s', cursor: 'pointer',
            }} onClick={() => setCurrentPage(i)} />
          ))}
        </div>

        {currentPage < totalPages - 1 ? (
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              padding: 'var(--space-2) var(--space-4)', border: 'none', borderRadius: '6px',
              background: 'var(--foreground)', color: 'var(--background)', fontSize: '11px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            Next
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginLeft: 'var(--space-1)' }}>
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleComplete}
            disabled={!allAnswered}
            style={{
              padding: 'var(--space-2) var(--space-4)', border: 'none', borderRadius: '6px',
              background: allAnswered ? 'var(--success)' : 'var(--surface-hover)',
              color: allAnswered ? 'white' : 'var(--muted)',
              fontSize: '11px', fontWeight: 600, cursor: allAnswered ? 'pointer' : 'not-allowed',
              opacity: allAnswered ? 1 : 0.6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 'var(--space-1)' }}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Complete
          </button>
        )}
      </div>
    </div>
  );
}
