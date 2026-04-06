// Community Feedback Loop — types and localStorage helpers

export interface FeedbackEntry {
  id: string;
  simulationId?: string;
  scenario: string;
  predictedProb: number;
  actualOutcome: 'success' | 'partial' | 'failure';
  timeElapsed: string;
  details?: string;
  lessons?: string;
  submittedAt: string; // ISO date
}

const FEEDBACK_KEY = 'sim-community-feedback';
const SIM_DATE_KEY = 'sim-last-simulation-date';

export function loadFeedback(): FeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFeedback(entry: FeedbackEntry): void {
  const all = loadFeedback();
  all.push(entry);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(all));
}

export function recordSimulationDate(): void {
  localStorage.setItem(SIM_DATE_KEY, new Date().toISOString());
}

export function getSimulationDate(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SIM_DATE_KEY);
}

export function shouldShowReminder(): boolean {
  const dateStr = getSimulationDate();
  if (!dateStr) return false;
  const simDate = new Date(dateStr);
  const now = new Date();
  const daysSince = (now.getTime() - simDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSince >= 30;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Aggregation helpers for the community page
export interface FeedbackAggregation {
  total: number;
  successCount: number;
  partialCount: number;
  failureCount: number;
  avgPredicted: number;
  avgActualSuccess: number;
  calibrationScore: number; // 0-100, how close predicted vs actual
  entries: FeedbackEntry[];
}

export function aggregateFeedback(entries: FeedbackEntry[]): FeedbackAggregation {
  if (entries.length === 0) {
    return { total: 0, successCount: 0, partialCount: 0, failureCount: 0, avgPredicted: 0, avgActualSuccess: 0, calibrationScore: 0, entries: [] };
  }

  const successCount = entries.filter(e => e.actualOutcome === 'success').length;
  const partialCount = entries.filter(e => e.actualOutcome === 'partial').length;
  const failureCount = entries.filter(e => e.actualOutcome === 'failure').length;

  const avgPredicted = entries.reduce((sum, e) => sum + e.predictedProb, 0) / entries.length;
  // Actual success rate: success = 1.0, partial = 0.5, failure = 0.0
  const avgActualSuccess = entries.reduce((sum, e) => {
    if (e.actualOutcome === 'success') return sum + 100;
    if (e.actualOutcome === 'partial') return sum + 50;
    return sum;
  }, 0) / entries.length;

  // Calibration: 100 - abs(predicted - actual)
  const calibrationScore = Math.max(0, Math.round(100 - Math.abs(avgPredicted - avgActualSuccess)));

  return {
    total: entries.length,
    successCount,
    partialCount,
    failureCount,
    avgPredicted: Math.round(avgPredicted),
    avgActualSuccess: Math.round(avgActualSuccess),
    calibrationScore,
    entries,
  };
}
