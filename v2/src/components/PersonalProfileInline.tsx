'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadProfile, saveProfile } from '@/lib/user-profile';

/* ─── Personal Profile: chip-based psychological profiling ─── */

interface PersonalProfileInlineProps {
  onProfileChange?: (profile: Record<string, unknown>) => void;
}

interface Dimension {
  key: string;
  label: string;
  options: string[];
}

const DIMENSIONS: Dimension[] = [
  {
    key: 'blocker',
    label: 'What blocks you most?',
    options: ['Perfectionism', 'Fear of failure', 'Lack of money', 'Lack of time', 'Indecision', 'Overwhelm'],
  },
  {
    key: 'neverDo',
    label: 'What would you never do?',
    options: ['Lie / cheat', 'Risk everything', 'Work alone', 'Follow orders', 'Give up control', 'Hurt relationships'],
  },
  {
    key: 'riskTolerance',
    label: 'Risk tolerance',
    options: ['Low', 'Medium', 'High'],
  },
  {
    key: 'decisionStyle',
    label: 'Decision style',
    options: ['Analyze everything', 'Go with gut', 'Ask others', 'Avoid deciding'],
  },
  {
    key: 'underPressure',
    label: 'Under pressure you...',
    options: ['Fight harder', 'Freeze', 'Seek help', 'Quit'],
  },
];

// Map selections to inferred psychological values
function inferValues(selections: Record<string, string>): string[] {
  const values: string[] = [];

  // Blocker inference
  if (selections.blocker === 'Perfectionism') values.push('Mastery');
  if (selections.blocker === 'Fear of failure') values.push('Security');
  if (selections.blocker === 'Indecision') values.push('Conformity');
  if (selections.blocker === 'Overwhelm') values.push('Stimulation');

  // Never-do inference
  if (selections.neverDo === 'Lie / cheat') values.push('Integrity');
  if (selections.neverDo === 'Risk everything') values.push('Security');
  if (selections.neverDo === 'Give up control') values.push('Power');
  if (selections.neverDo === 'Work alone') values.push('Benevolence');
  if (selections.neverDo === 'Follow orders') values.push('Self-Direction');
  if (selections.neverDo === 'Hurt relationships') values.push('Benevolence');

  // Risk tolerance
  if (selections.riskTolerance === 'High') values.push('Achievement');
  if (selections.riskTolerance === 'Low') values.push('Tradition');

  // Decision style
  if (selections.decisionStyle === 'Analyze everything') values.push('Universalism');
  if (selections.decisionStyle === 'Go with gut') values.push('Self-Direction');

  // Under pressure
  if (selections.underPressure === 'Fight harder') values.push('Achievement');
  if (selections.underPressure === 'Seek help') values.push('Benevolence');

  // Deduplicate
  return [...new Set(values)].slice(0, 4);
}

export default function PersonalProfileInline({ onProfileChange }: PersonalProfileInlineProps) {
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('sim-personal-selections');
    return saved ? JSON.parse(saved) : {};
  });

  const inferredValues = inferValues(selections);
  const filledCount = Object.keys(selections).length;

  useEffect(() => {
    localStorage.setItem('sim-personal-selections', JSON.stringify(selections));

    // Merge into user profile
    const profile = loadProfile();
    const updated = {
      ...profile,
      personalSelections: selections,
      inferredValues,
      riskTolerance: (selections.riskTolerance?.toLowerCase() as 'conservative' | 'moderate' | 'aggressive' | undefined) || profile.riskTolerance,
    };
    saveProfile(updated);
    onProfileChange?.(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections]);

  const select = (key: string, value: string) => {
    setSelections((prev) => {
      // Toggle off if already selected
      if (prev[key] === value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div
          className="mx-auto px-4 py-3 rounded-lg"
          style={{
            maxWidth: 720,
            background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
            border: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--muted-foreground)]"
              style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              Your Profile
            </span>
            <span className="text-[10px] text-[var(--muted)]">
              {filledCount}/{DIMENSIONS.length}
            </span>
          </div>

          {/* Dimensions */}
          <div className="space-y-2">
            {DIMENSIONS.map((dim) => (
              <div key={dim.key}>
                <div className="text-[11px] text-[var(--muted-foreground)] mb-1">{dim.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {dim.options.map((opt) => {
                    const selected = selections[dim.key] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => select(dim.key, opt)}
                        className={`
                          px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150
                          ${selected
                            ? 'bg-[var(--foreground)] text-[var(--background)]'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          }
                        `}
                        style={{
                          border: selected
                            ? '1px solid var(--foreground)'
                            : '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)',
                          fontFamily: 'var(--font-geist-mono), monospace',
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Inferred values */}
          {inferredValues.length > 0 && (
            <div className="mt-3 pt-2" style={{ borderTop: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)' }}>
              <span className="text-[10px] text-[var(--muted-foreground)]" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                Detected values:{' '}
              </span>
              {inferredValues.map((v) => (
                <span
                  key={v}
                  className="inline-block px-2 py-0.5 rounded-full text-[9px] font-medium mr-1.5 mb-0.5"
                  style={{
                    background: 'color-mix(in srgb, var(--foreground) 8%, transparent)',
                    color: 'var(--foreground)',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
