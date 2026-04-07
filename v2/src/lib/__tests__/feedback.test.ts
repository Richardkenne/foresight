import { describe, it, expect } from 'vitest';
import { aggregateFeedback } from '../feedback';
import type { FeedbackEntry } from '../feedback';

function makeEntry(predicted: number, outcome: 'success' | 'partial' | 'failure'): FeedbackEntry {
  return {
    id: Math.random().toString(36),
    scenario: 'test',
    predictedProb: predicted,
    actualOutcome: outcome,
    timeElapsed: '6 months',
    submittedAt: new Date().toISOString(),
  };
}

describe('aggregateFeedback', () => {
  it('returns zeros for empty entries', () => {
    const result = aggregateFeedback([]);
    expect(result.total).toBe(0);
    expect(result.successCount).toBe(0);
    expect(result.partialCount).toBe(0);
    expect(result.failureCount).toBe(0);
    expect(result.avgPredicted).toBe(0);
    expect(result.avgActualSuccess).toBe(0);
    expect(result.calibrationScore).toBe(0);
  });

  it('counts successes, partials, and failures correctly', () => {
    const entries = [
      makeEntry(70, 'success'),
      makeEntry(50, 'success'),
      makeEntry(40, 'partial'),
      makeEntry(30, 'failure'),
      makeEntry(20, 'failure'),
    ];

    const result = aggregateFeedback(entries);
    expect(result.total).toBe(5);
    expect(result.successCount).toBe(2);
    expect(result.partialCount).toBe(1);
    expect(result.failureCount).toBe(2);
  });

  it('calculates average predicted probability', () => {
    const entries = [
      makeEntry(60, 'success'),
      makeEntry(40, 'failure'),
    ];

    const result = aggregateFeedback(entries);
    expect(result.avgPredicted).toBe(50);
  });

  it('calculates actual success rate (success=100, partial=50, failure=0)', () => {
    const entries = [
      makeEntry(50, 'success'),
      makeEntry(50, 'failure'),
    ];

    const result = aggregateFeedback(entries);
    // (100 + 0) / 2 = 50
    expect(result.avgActualSuccess).toBe(50);
  });

  it('partial outcomes count as 50% success', () => {
    const entries = [
      makeEntry(50, 'partial'),
      makeEntry(50, 'partial'),
    ];

    const result = aggregateFeedback(entries);
    expect(result.avgActualSuccess).toBe(50);
  });

  it('calibration score is high when predicted matches actual', () => {
    // All succeed, all predicted at 100%
    const entries = [
      makeEntry(100, 'success'),
      makeEntry(100, 'success'),
    ];

    const result = aggregateFeedback(entries);
    // avgPredicted = 100, avgActual = 100 -> calibration = 100
    expect(result.calibrationScore).toBe(100);
  });

  it('calibration score is low when predicted diverges from actual', () => {
    // All fail but predicted high
    const entries = [
      makeEntry(90, 'failure'),
      makeEntry(90, 'failure'),
    ];

    const result = aggregateFeedback(entries);
    // avgPredicted = 90, avgActual = 0 -> calibration = 100 - 90 = 10
    expect(result.calibrationScore).toBe(10);
  });

  it('returns the original entries in the result', () => {
    const entries = [makeEntry(50, 'success')];
    const result = aggregateFeedback(entries);
    expect(result.entries).toHaveLength(1);
  });
});
