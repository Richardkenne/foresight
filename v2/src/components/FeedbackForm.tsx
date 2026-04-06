'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveFeedback, generateId, type FeedbackEntry } from '@/lib/feedback';

interface FeedbackFormProps {
  scenario: string;
  predictedProb: number;
  simulationId?: string;
  onClose: () => void;
}

const TIME_OPTIONS = [
  '3 months',
  '6 months',
  '1 year',
  '2 years',
  '3+ years',
];

const OUTCOME_OPTIONS: { value: FeedbackEntry['actualOutcome']; label: string; color: string; bgColor: string; icon: string }[] = [
  {
    value: 'success',
    label: 'I succeeded',
    color: '#059669',
    bgColor: 'rgba(5, 150, 105, 0.08)',
    icon: 'M20 6L9 17l-5-5',
  },
  {
    value: 'partial',
    label: 'Partially',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.08)',
    icon: 'M5 12h14',
  },
  {
    value: 'failure',
    label: "It didn't work out",
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.08)',
    icon: 'M18 6L6 18M6 6l12 12',
  },
];

export default function FeedbackForm({ scenario, predictedProb, simulationId, onClose }: FeedbackFormProps) {
  const [outcome, setOutcome] = useState<FeedbackEntry['actualOutcome'] | null>(null);
  const [timeElapsed, setTimeElapsed] = useState('');
  const [details, setDetails] = useState('');
  const [lessons, setLessons] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = outcome !== null && timeElapsed !== '';

  const handleSubmit = async () => {
    if (!canSubmit || !outcome) return;
    setSubmitting(true);

    const entry: FeedbackEntry = {
      id: generateId(),
      simulationId,
      scenario,
      predictedProb,
      actualOutcome: outcome,
      timeElapsed,
      details: details.trim() || undefined,
      lessons: lessons.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    // Save locally
    saveFeedback(entry);

    // Also save to server file
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch {
      // localStorage already saved, server save is best-effort
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-[480px] mx-4 rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            boxShadow: '0 0 0 1px var(--border), 0 24px 64px rgba(0, 0, 0, 0.2)',
            maxHeight: '90vh',
          }}
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {submitted ? (
            /* Thank you state */
            <div className="p-8 text-center">
              <div
                className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(5, 150, 105, 0.1)' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <h2 className="text-[17px] font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Thank you
              </h2>
              <p className="text-[13px] mb-6" style={{ color: 'var(--muted-foreground)' }}>
                Your outcome helps calibrate our predictions and makes the simulator more accurate for everyone.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer transition-colors"
                style={{
                  background: 'var(--foreground)',
                  color: 'var(--background)',
                }}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-start px-6 pt-6 pb-2">
                <div>
                  <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--foreground)' }}>
                    Report Your Outcome
                  </h2>
                  <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>
                    Help us calibrate predictions with real results
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Scrollable content */}
              <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                {/* Scenario (pre-filled, read-only) */}
                <div className="mb-4">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1.5 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    Scenario
                  </label>
                  <div
                    className="text-[13px] px-3 py-2.5 rounded-xl"
                    style={{
                      background: 'var(--surface-hover)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {scenario}
                  </div>
                </div>

                {/* Predicted probability (pre-filled) */}
                <div className="mb-5">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1.5 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    Predicted success rate
                  </label>
                  <div
                    className="text-[15px] font-semibold tabular-nums"
                    style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)' }}
                  >
                    {predictedProb}%
                  </div>
                </div>

                {/* Outcome selector */}
                <div className="mb-5">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-medium mb-2 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    What happened?
                  </label>
                  <div className="flex gap-2">
                    {OUTCOME_OPTIONS.map((opt) => {
                      const selected = outcome === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setOutcome(opt.value)}
                          className="flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: selected ? opt.bgColor : 'transparent',
                            border: `1.5px solid ${selected ? opt.color : 'var(--border)'}`,
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={selected ? opt.color : 'var(--muted)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d={opt.icon} />
                          </svg>
                          <span
                            className="text-[11px] font-medium text-center leading-tight"
                            style={{ color: selected ? opt.color : 'var(--muted-foreground)' }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time elapsed */}
                <div className="mb-5">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-medium mb-2 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    Time since simulation
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTimeElapsed(t)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all"
                        style={{
                          background: timeElapsed === t ? 'var(--foreground)' : 'transparent',
                          color: timeElapsed === t ? 'var(--background)' : 'var(--muted-foreground)',
                          border: `1px solid ${timeElapsed === t ? 'var(--foreground)' : 'var(--border)'}`,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details (optional) */}
                <div className="mb-4">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1.5 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    What happened? <span style={{ color: 'var(--muted)', opacity: 0.6 }}>(optional)</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Share your experience..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] resize-none focus:outline-none"
                    style={{
                      background: 'var(--surface-hover)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Lessons (optional) */}
                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-[0.1em] font-medium mb-1.5 block" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono)' }}>
                    What did you learn? <span style={{ color: 'var(--muted)', opacity: 0.6 }}>(optional)</span>
                  </label>
                  <textarea
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    placeholder="Any insights for others facing the same decision..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-[13px] resize-none focus:outline-none"
                    style={{
                      background: 'var(--surface-hover)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-2 mb-5 px-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p className="text-[10px] leading-relaxed" style={{ color: 'var(--muted)' }}>
                    All submissions are anonymous. No personal data is collected or stored.
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="w-full py-3 rounded-xl text-[13px] font-semibold cursor-pointer transition-all"
                  style={{
                    background: canSubmit ? 'var(--foreground)' : 'var(--border)',
                    color: canSubmit ? 'var(--background)' : 'var(--muted)',
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Outcome'}
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
