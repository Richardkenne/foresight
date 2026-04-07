import { describe, it, expect } from 'vitest';
import {
  ASSESSMENT_QUESTIONS,
  computeSacredProfile,
} from '../sacred-assessment';

describe('ASSESSMENT_QUESTIONS', () => {
  it('has exactly 20 questions', () => {
    expect(ASSESSMENT_QUESTIONS).toHaveLength(20);
  });

  it('every question has at least 1 root ID', () => {
    ASSESSMENT_QUESTIONS.forEach(q => {
      expect(q.rootIds.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('every question has exactly 5 options', () => {
    ASSESSMENT_QUESTIONS.forEach(q => {
      expect(q.options).toHaveLength(5);
    });
  });

  it('covers all 36 sacred roots via root IDs', () => {
    const allRoots = new Set<string>();
    ASSESSMENT_QUESTIONS.forEach(q => {
      q.rootIds.forEach(id => allRoots.add(id));
    });
    // There are 36 sacred roots (SR-001 through SR-036)
    for (let i = 1; i <= 36; i++) {
      const id = `SR-${String(i).padStart(3, '0')}`;
      expect(allRoots.has(id)).toBe(true);
    }
  });

  it('option scores range from 1 to 10', () => {
    ASSESSMENT_QUESTIONS.forEach(q => {
      q.options.forEach(opt => {
        expect(opt.score).toBeGreaterThanOrEqual(1);
        expect(opt.score).toBeLessThanOrEqual(10);
      });
    });
  });
});

describe('computeSacredProfile', () => {
  it('returns empty profile for empty answers', () => {
    const profile = computeSacredProfile({});
    expect(Object.keys(profile)).toHaveLength(0);
  });

  it('returns scores in 0-10 range for all answered roots', () => {
    // Answer all questions with max score
    const answers: Record<string, number> = {};
    ASSESSMENT_QUESTIONS.forEach(q => {
      answers[q.questionId] = 10;
    });

    const profile = computeSacredProfile(answers);
    for (const [, score] of Object.entries(profile)) {
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(10);
    }
  });

  it('all max answers produce scores of 10 for all roots', () => {
    const answers: Record<string, number> = {};
    ASSESSMENT_QUESTIONS.forEach(q => {
      answers[q.questionId] = 10;
    });

    const profile = computeSacredProfile(answers);
    for (const score of Object.values(profile)) {
      expect(score).toBe(10);
    }
  });

  it('all min answers produce scores of 1 for all roots', () => {
    const answers: Record<string, number> = {};
    ASSESSMENT_QUESTIONS.forEach(q => {
      answers[q.questionId] = 1;
    });

    const profile = computeSacredProfile(answers);
    for (const score of Object.values(profile)) {
      expect(score).toBe(1);
    }
  });

  it('mixed answers produce scores between 1 and 10', () => {
    const answers: Record<string, number> = {};
    ASSESSMENT_QUESTIONS.forEach((q, i) => {
      answers[q.questionId] = (i % 2 === 0) ? 3 : 7;
    });

    const profile = computeSacredProfile(answers);
    for (const score of Object.values(profile)) {
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(10);
    }
  });

  it('partial answers only produce scores for answered roots', () => {
    const q0 = ASSESSMENT_QUESTIONS[0];
    const answers: Record<string, number> = {
      [q0.questionId]: 7,
    };

    const profile = computeSacredProfile(answers);
    // Should only have entries for the roots of q0
    expect(Object.keys(profile).length).toBe(q0.rootIds.length);
    q0.rootIds.forEach(id => {
      expect(profile[id]).toBe(7);
    });
  });
});
