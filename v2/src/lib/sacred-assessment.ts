/**
 * Sacred Root Self-Assessment
 * 20 behavioral questions mapping to the 36 Sacred Roots.
 * Produces a SacredProfile: Record<rootId, score 0-10>.
 */

export interface AssessmentOption {
  label: string;
  score: number;
}

export interface AssessmentQuestion {
  id: string;
  questionId: string;
  question: string;
  rootIds: string[];
  options: AssessmentOption[];
}

export type SacredProfile = Record<string, number>;

// ─── 20 Behavioral Questions ───────────────────────────────────────

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q01',
    questionId: 'q_unexpected_loss',
    question: 'When you lose money unexpectedly, what do you do?',
    rootIds: ['SR-010', 'SR-001'], // Patience + Faith
    options: [
      { label: 'Panic and make impulsive decisions', score: 1 },
      { label: 'Feel anxious but avoid rash moves', score: 3 },
      { label: 'Accept it and look for lessons', score: 5 },
      { label: 'Stay calm and reassess my strategy', score: 7 },
      { label: 'Trust the process and adapt with clarity', score: 10 },
    ],
  },
  {
    id: 'q02',
    questionId: 'q_wronged',
    question: 'When someone wrongs you, how do you respond?',
    rootIds: ['SR-022', 'SR-020'], // Mercy + Love
    options: [
      { label: 'Seek revenge or hold a deep grudge', score: 1 },
      { label: 'Cut them off completely', score: 3 },
      { label: 'Distance myself but wish them no harm', score: 5 },
      { label: 'Try to understand their perspective', score: 7 },
      { label: 'Forgive and look for a path to reconciliation', score: 10 },
    ],
  },
  {
    id: 'q03',
    questionId: 'q_business_setback',
    question: 'How do you handle a major business or career setback?',
    rootIds: ['SR-009', 'SR-010'], // Humility + Patience
    options: [
      { label: 'Blame others and quit', score: 1 },
      { label: 'Feel defeated for a long time', score: 3 },
      { label: 'Acknowledge the failure and regroup slowly', score: 5 },
      { label: 'Analyze what went wrong and pivot quickly', score: 7 },
      { label: 'Take full responsibility and rebuild with new wisdom', score: 10 },
    ],
  },
  {
    id: 'q04',
    questionId: 'q_competitor_success',
    question: 'When you see a competitor or peer succeeding, what do you feel?',
    rootIds: ['SR-013', 'SR-027'], // Contentment + Celebration
    options: [
      { label: 'Jealousy and resentment', score: 1 },
      { label: 'Insecurity about my own progress', score: 3 },
      { label: 'Neutral -- it does not affect me much', score: 5 },
      { label: 'Motivated to improve my own work', score: 7 },
      { label: 'Genuinely happy for them and inspired', score: 10 },
    ],
  },
  {
    id: 'q05',
    questionId: 'q_temptation_shortcut',
    question: 'When offered a profitable shortcut that bends ethical rules, what do you do?',
    rootIds: ['SR-003', 'SR-023'], // Obedience + Truth
    options: [
      { label: 'Take it without hesitation', score: 1 },
      { label: 'Consider it seriously and probably take it', score: 3 },
      { label: 'Feel tempted but ultimately refuse', score: 5 },
      { label: 'Refuse immediately and move on', score: 7 },
      { label: 'Refuse and speak up about the unethical practice', score: 10 },
    ],
  },
  {
    id: 'q06',
    questionId: 'q_abundance',
    question: 'When you receive an unexpected windfall or gift, what is your first instinct?',
    rootIds: ['SR-004', 'SR-024'], // Gratitude + Generosity
    options: [
      { label: 'Spend it on myself immediately', score: 1 },
      { label: 'Save it all and tell no one', score: 3 },
      { label: 'Feel grateful and use it wisely', score: 5 },
      { label: 'Share a portion with someone in need', score: 7 },
      { label: 'Feel deep gratitude and look for who else benefits', score: 10 },
    ],
  },
  {
    id: 'q07',
    questionId: 'q_mistake_exposed',
    question: 'When a mistake you made is exposed publicly, how do you react?',
    rootIds: ['SR-018', 'SR-019'], // Transparency + Accountability
    options: [
      { label: 'Deny it or blame someone else', score: 1 },
      { label: 'Minimize it and change the subject', score: 3 },
      { label: 'Acknowledge it privately but not publicly', score: 5 },
      { label: 'Own it publicly and explain what happened', score: 7 },
      { label: 'Own it, apologize, and share what I learned', score: 10 },
    ],
  },
  {
    id: 'q08',
    questionId: 'q_boring_work',
    question: 'When the work gets repetitive and boring, what happens?',
    rootIds: ['SR-012', 'SR-008'], // Diligence + Fervor
    options: [
      { label: 'I stop doing it and look for something exciting', score: 1 },
      { label: 'I procrastinate heavily', score: 3 },
      { label: 'I push through but feel drained', score: 5 },
      { label: 'I find ways to make it more efficient or engaging', score: 7 },
      { label: 'I stay committed because I see the bigger purpose', score: 10 },
    ],
  },
  {
    id: 'q09',
    questionId: 'q_criticism',
    question: 'How do you respond to constructive criticism from someone you respect?',
    rootIds: ['SR-036', 'SR-009'], // Teachability + Humility
    options: [
      { label: 'Reject it defensively', score: 1 },
      { label: 'Feel hurt and dismiss most of it', score: 3 },
      { label: 'Listen but do not change much', score: 5 },
      { label: 'Seriously consider it and adjust my approach', score: 7 },
      { label: 'Actively seek more feedback and implement changes', score: 10 },
    ],
  },
  {
    id: 'q10',
    questionId: 'q_power_position',
    question: 'When you are in a position of power or authority, how do you use it?',
    rootIds: ['SR-032', 'SR-021'], // Service + Justice
    options: [
      { label: 'Leverage it for personal gain', score: 1 },
      { label: 'Use it mostly to protect my interests', score: 3 },
      { label: 'Try to be fair to everyone', score: 5 },
      { label: 'Focus on serving the people I lead', score: 7 },
      { label: 'Actively empower others and advocate for the voiceless', score: 10 },
    ],
  },
  {
    id: 'q11',
    questionId: 'q_lonely_struggle',
    question: 'When going through a tough time, do you seek community or isolate?',
    rootIds: ['SR-025', 'SR-007'], // Community + Hope
    options: [
      { label: 'Withdraw completely -- nobody can help', score: 1 },
      { label: 'Isolate but feel bad about it', score: 3 },
      { label: 'Talk to one trusted person', score: 5 },
      { label: 'Reach out to my community for support', score: 7 },
      { label: 'Lean on community while also offering hope to others struggling', score: 10 },
    ],
  },
  {
    id: 'q12',
    questionId: 'q_pleasure_discipline',
    question: 'When tempted by instant gratification that conflicts with your long-term goals, what do you do?',
    rootIds: ['SR-011', 'SR-014'], // Self-Control + Moderation
    options: [
      { label: 'Give in every time', score: 1 },
      { label: 'Give in more often than not', score: 3 },
      { label: 'Resist about half the time', score: 5 },
      { label: 'Usually resist and redirect my energy', score: 7 },
      { label: 'Consistently choose discipline without feeling deprived', score: 10 },
    ],
  },
  {
    id: 'q13',
    questionId: 'q_resources_waste',
    question: 'How do you treat resources (time, money, energy, environment) that are entrusted to you?',
    rootIds: ['SR-031', 'SR-015'], // Stewardship + Conscience
    options: [
      { label: 'Use them carelessly -- they are mine to spend', score: 1 },
      { label: 'Sometimes wasteful without thinking', score: 3 },
      { label: 'Try to be careful but not always consistent', score: 5 },
      { label: 'Intentional about minimizing waste', score: 7 },
      { label: 'Treat every resource as a trust to be maximized for good', score: 10 },
    ],
  },
  {
    id: 'q14',
    questionId: 'q_outsider',
    question: 'When you encounter someone from a very different background or worldview, how do you react?',
    rootIds: ['SR-029', 'SR-028'], // Inclusion + Compassion
    options: [
      { label: 'Avoid or dismiss them', score: 1 },
      { label: 'Stay polite but keep distance', score: 3 },
      { label: 'Treat them normally without extra effort', score: 5 },
      { label: 'Show genuine curiosity about their perspective', score: 7 },
      { label: 'Actively include them and bridge the gap', score: 10 },
    ],
  },
  {
    id: 'q15',
    questionId: 'q_promise_keeping',
    question: 'How reliable are you when it comes to keeping your word?',
    rootIds: ['SR-026', 'SR-023'], // Loyalty + Truth
    options: [
      { label: 'I break promises often if inconvenient', score: 1 },
      { label: 'I keep major promises but bend small ones', score: 3 },
      { label: 'I try to keep my word but sometimes fall short', score: 5 },
      { label: 'My word is very important to me and I rarely break it', score: 7 },
      { label: 'I would rather suffer loss than break a commitment', score: 10 },
    ],
  },
  {
    id: 'q16',
    questionId: 'q_motive_check',
    question: 'When you do something good publicly, how much does the recognition matter?',
    rootIds: ['SR-016', 'SR-002'], // Pure Intention + Worship
    options: [
      { label: 'I would not do it without recognition', score: 1 },
      { label: 'Recognition is a big motivator', score: 3 },
      { label: 'Nice to be recognized but not required', score: 5 },
      { label: 'I do it for the right reasons regardless of who sees', score: 7 },
      { label: 'I often prefer to give anonymously or quietly', score: 10 },
    ],
  },
  {
    id: 'q17',
    questionId: 'q_moral_stand',
    question: 'When the popular opinion conflicts with what you believe is right, what do you do?',
    rootIds: ['SR-035', 'SR-030'], // Certainty + Reverence
    options: [
      { label: 'Go with the crowd to fit in', score: 1 },
      { label: 'Stay quiet about my disagreement', score: 3 },
      { label: 'Hold my view privately but do not speak up', score: 5 },
      { label: 'Respectfully share my perspective when appropriate', score: 7 },
      { label: 'Stand firm with courage and humility, even at personal cost', score: 10 },
    ],
  },
  {
    id: 'q18',
    questionId: 'q_past_failure',
    question: 'How do you deal with guilt from past failures or wrongs?',
    rootIds: ['SR-005', 'SR-007'], // Repentance + Hope
    options: [
      { label: 'Deny or suppress it', score: 1 },
      { label: 'Carry the guilt without resolution', score: 3 },
      { label: 'Try to forget and move on', score: 5 },
      { label: 'Acknowledge it, learn from it, and let go', score: 7 },
      { label: 'Make amends where possible and grow through it', score: 10 },
    ],
  },
  {
    id: 'q19',
    questionId: 'q_injustice_witness',
    question: 'When you witness an unfair situation that does not directly affect you, what do you do?',
    rootIds: ['SR-033', 'SR-021'], // Reform + Justice
    options: [
      { label: 'Not my problem -- walk away', score: 1 },
      { label: 'Feel bad but do nothing', score: 3 },
      { label: 'Mention it to someone but take no action', score: 5 },
      { label: 'Speak up or take small action to help', score: 7 },
      { label: 'Actively intervene and work toward systemic change', score: 10 },
    ],
  },
  {
    id: 'q20',
    questionId: 'q_daily_purpose',
    question: 'How often do you reflect on the deeper purpose behind your daily actions?',
    rootIds: ['SR-006', 'SR-017', 'SR-034'], // Remembrance + Wisdom + Middle Path
    options: [
      { label: 'Never -- I just go through the motions', score: 1 },
      { label: 'Rarely -- only when forced by crisis', score: 3 },
      { label: 'Sometimes -- when I have quiet moments', score: 5 },
      { label: 'Regularly -- it guides many of my decisions', score: 7 },
      { label: 'Daily -- purpose and reflection are central to my life', score: 10 },
    ],
  },
];

// ─── Scoring Engine ────────────────────────────────────────────────

/**
 * Compute a SacredProfile from assessment answers.
 * @param answers - Record<questionId, selectedScore>
 * @returns SacredProfile - Record<rootId, averagedScore 0-10>
 */
export function computeSacredProfile(answers: Record<string, number>): SacredProfile {
  // Accumulate scores per root
  const rootScores: Record<string, number[]> = {};

  for (const q of ASSESSMENT_QUESTIONS) {
    const score = answers[q.questionId];
    if (score == null) continue;
    for (const rootId of q.rootIds) {
      if (!rootScores[rootId]) rootScores[rootId] = [];
      rootScores[rootId].push(score);
    }
  }

  // Average per root, normalize to 0-10
  const profile: SacredProfile = {};
  for (const [rootId, scores] of Object.entries(rootScores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    profile[rootId] = Math.round(avg * 10) / 10; // 1 decimal
  }

  return profile;
}

// ─── Persistence ───────────────────────────────────────────────────

const SACRED_PROFILE_KEY = 'sacredProfile';
const SACRED_ANSWERS_KEY = 'sacredAnswers';

export function saveSacredProfile(profile: SacredProfile): void {
  try {
    localStorage.setItem(SACRED_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

export function loadSacredProfile(): SacredProfile | null {
  try {
    const raw = localStorage.getItem(SACRED_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSacredAnswers(answers: Record<string, number>): void {
  try {
    localStorage.setItem(SACRED_ANSWERS_KEY, JSON.stringify(answers));
  } catch { /* ignore */ }
}

export function loadSacredAnswers(): Record<string, number> | null {
  try {
    const raw = localStorage.getItem(SACRED_ANSWERS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSacredAssessment(): void {
  localStorage.removeItem(SACRED_PROFILE_KEY);
  localStorage.removeItem(SACRED_ANSWERS_KEY);
}

// ─── Domain helpers ────────────────────────────────────────────────

export const DOMAIN_LABELS: Record<string, string> = {
  god: 'Spiritual Foundation',
  self: 'Inner Character',
  others: 'Relationships',
  resources: 'Stewardship',
  epistemic: 'Wisdom & Discernment',
};

export const DOMAIN_ORDER = ['god', 'self', 'others', 'resources', 'epistemic'] as const;
