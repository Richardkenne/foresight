'use client';

import { useState, useMemo, useCallback } from 'react';

// ─── Decision Pruning System ───
// Based on Decision Tree Pruning: control the NODES (binary decisions),
// and the PATHS resolve themselves.
//
// Each question maps to a sacred section modifier.
// YES = positive modifier (virtue), NO = negative modifier (sin pattern).
// The combined modifiers adjust ALL bottleneck/decision probabilities.

export interface PruningQuestion {
  id: string;
  question: string;         // Binary question: YES or NO
  section: string;           // Maps to sacred section
  yesModifier: number;       // Multiplier if YES (e.g. 1.5 = +50%)
  noModifier: number;        // Multiplier if NO (e.g. 0.3 = -70%)
  yesLabel: string;          // Short label for YES
  noLabel: string;           // Short label for NO
  insight: string;           // Why this matters (data-backed)
}

export interface PruningResult {
  answers: Record<string, boolean>;    // questionId -> true/false
  combinedModifier: number;            // Product of all modifiers
  perQuestion: Array<{
    id: string;
    answer: boolean;
    modifier: number;
  }>;
}

// Default questions — universal across all simulation types
// Each maps to a sacred section with real data backing
const DEFAULT_QUESTIONS: PruningQuestion[] = [
  {
    id: 'mentor',
    question: 'Do you have a mentor or advisor?',
    section: 'community_and_counsel',
    yesModifier: 1.8,
    noModifier: 0.35,
    yesLabel: 'Yes, guided',
    noLabel: 'No, solo',
    insight: 'Businesses with mentors have 70% higher survival rate (SBA 2024)',
  },
  {
    id: 'validated',
    question: 'Have you validated with real users or customers?',
    section: 'pride_and_hubris',
    yesModifier: 1.5,
    noModifier: 0.4,
    yesLabel: 'Yes, tested',
    noLabel: 'No, assumed',
    insight: '42% of startups fail because they build what nobody needs (CB Insights 2024)',
  },
  {
    id: 'patience',
    question: 'Are you committed for 3+ years?',
    section: 'patience_and_perseverance',
    yesModifier: 1.6,
    noModifier: 0.35,
    yesLabel: 'Yes, long game',
    noLabel: 'No, quick win',
    insight: '74% of startups that scale prematurely fail (Startup Genome 2023)',
  },
  {
    id: 'focus',
    question: 'Are you focused on ONE thing?',
    section: 'forbidden_fruit',
    yesModifier: 1.5,
    noModifier: 0.4,
    yesLabel: 'Yes, focused',
    noLabel: 'No, scattered',
    insight: '67% who chase multiple projects quit all of them within 18 months (HBR 2023)',
  },
  {
    id: 'savings',
    question: 'Do you have 6+ months of financial runway?',
    section: 'stewardship_and_responsibility',
    yesModifier: 1.4,
    noModifier: 0.45,
    yesLabel: 'Yes, prepared',
    noLabel: 'No, tight',
    insight: 'Bootstrapped founders with runway are 72% profitable in 12 months (Indie Hackers 2024)',
  },
  {
    id: 'action',
    question: 'Have you already started (not just planning)?',
    section: 'sloth_and_procrastination',
    yesModifier: 1.4,
    noModifier: 0.5,
    yesLabel: 'Yes, building',
    noLabel: 'No, planning',
    insight: '46% gap between intention and action — most never start (Sheeran & Webb 2016)',
  },
  {
    id: 'honest',
    question: 'Are you doing this the honest, legitimate way?',
    section: 'deception_and_shortcuts',
    yesModifier: 1.2,
    noModifier: 0.15,
    yesLabel: 'Yes, clean',
    noLabel: 'No, shortcuts',
    insight: '95% of get-rich-quick schemes result in net loss (FTC 2024)',
  },
];

// Calculate combined modifier from answers
function calculateModifier(
  questions: PruningQuestion[],
  answers: Record<string, boolean>,
): PruningResult {
  const perQuestion: PruningResult['perQuestion'] = [];
  let combined = 1.0;

  for (const q of questions) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    const mod = answer ? q.yesModifier : q.noModifier;
    combined *= mod;
    perQuestion.push({ id: q.id, answer, modifier: mod });
  }

  // Clamp between 0.01 and 5.0 (same as sacred engine)
  combined = Math.max(0.01, Math.min(5.0, combined));

  return { answers, combinedModifier: combined, perQuestion };
}

// ─── Component ───

interface DecisionPruningProps {
  onComplete: (result: PruningResult) => void;
  onSkip: () => void;
  questions?: PruningQuestion[];
}

export default function DecisionPruning({
  onComplete,
  onSkip,
  questions = DEFAULT_QUESTIONS,
}: DecisionPruningProps) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  // Live modifier calculation
  const result = useMemo(
    () => calculateModifier(questions, answers),
    [questions, answers],
  );

  // Handle answer
  const handleAnswer = useCallback((answer: boolean) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: answer }));
    // Auto-advance to next unanswered question
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentQ, currentIdx, totalQuestions]);

  // Modifier display
  const modPercent = Math.round((result.combinedModifier - 1) * 100);
  const modColor = modPercent > 0 ? 'var(--success)' : modPercent < 0 ? 'var(--danger)' : 'var(--muted)';
  const modSign = modPercent > 0 ? '+' : '';

  return (
    <div className="pruning-overlay">
      <div className="pruning-modal">
        {/* Header */}
        <div className="pruning-header">
          <div className="pruning-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 3h5v5" /><path d="M8 3H3v5" />
              <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
            </svg>
            <span>Decision Pruning</span>
          </div>
          <div className="pruning-subtitle">
            Your decisions shape the outcome. Answer honestly.
          </div>
        </div>

        {/* Progress bar */}
        <div className="pruning-progress">
          <div
            className="pruning-progress-fill"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question dots - clickable navigation */}
        <div className="pruning-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`pruning-dot${i === currentIdx ? ' pruning-dot--active' : ''}${answers[q.id] !== undefined ? ' pruning-dot--answered' : ''}`}
              style={
                answers[q.id] !== undefined
                  ? { background: answers[q.id] ? 'var(--success)' : 'var(--danger)' }
                  : undefined
              }
            />
          ))}
        </div>

        {/* Current question */}
        <div className="pruning-question-area">
          <div className="pruning-question-number">
            {currentIdx + 1} / {totalQuestions}
          </div>
          <div className="pruning-question-text">
            {currentQ.question}
          </div>

          {/* YES / NO buttons */}
          <div className="pruning-buttons">
            <button
              onClick={() => handleAnswer(true)}
              className={`pruning-btn pruning-btn--yes${answers[currentQ.id] === true ? ' pruning-btn--selected' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>{currentQ.yesLabel}</span>
            </button>
            <button
              onClick={() => handleAnswer(false)}
              className={`pruning-btn pruning-btn--no${answers[currentQ.id] === false ? ' pruning-btn--selected' : ''}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>{currentQ.noLabel}</span>
            </button>
          </div>

          {/* Insight */}
          <div className="pruning-insight">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>{currentQ.insight}</span>
          </div>
        </div>

        {/* Live modifier meter */}
        <div className="pruning-meter">
          <div className="pruning-meter-label">Probability Modifier</div>
          <div className="pruning-meter-bar">
            <div
              className="pruning-meter-fill"
              style={{
                width: `${Math.min(100, Math.max(2, result.combinedModifier * 20))}%`,
                background: modColor,
              }}
            />
          </div>
          <div className="pruning-meter-value" style={{ color: modColor }}>
            {answeredCount > 0 ? `${modSign}${modPercent}%` : '--'}
          </div>
        </div>

        {/* Answered summary chips */}
        {answeredCount > 0 && (
          <div className="pruning-chips">
            {result.perQuestion.map(pq => {
              const q = questions.find(x => x.id === pq.id)!;
              const modPct = Math.round((pq.modifier - 1) * 100);
              return (
                <div
                  key={pq.id}
                  className={`pruning-chip${pq.answer ? ' pruning-chip--yes' : ' pruning-chip--no'}`}
                >
                  <span>{pq.answer ? q.yesLabel : q.noLabel}</span>
                  <span className="pruning-chip-mod">
                    {modPct > 0 ? '+' : ''}{modPct}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="pruning-actions">
          <button onClick={onSkip} className="pruning-action-skip">
            Skip
          </button>
          <button
            onClick={() => onComplete(result)}
            disabled={!allAnswered}
            className="pruning-action-run"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Run Simulation</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_QUESTIONS, calculateModifier };
export type { PruningQuestion as DecisionPruningQuestion };
