'use client';

import { useState, useEffect, useCallback } from 'react';
import { type UserProfile, saveProfile, loadProfile, isProfileComplete } from '@/lib/user-profile';
import type { ContextTags } from '@/lib/context-tags';
import { loadSacredProfile, type SacredProfile } from '@/lib/sacred-assessment';
import SacredAssessment from './SacredAssessment';
import { getFieldWarnings } from '@/lib/profile-warnings';
import { FieldWarningDot } from './WarningBanner';

interface ProfilePanelProps {
  onBack: () => void;
  onProfileChange?: (profile: UserProfile) => void;
  tags?: ContextTags;
  onTagsChange?: (tags: ContextTags) => void;
}

const SKILL_SUGGESTIONS = [
  'AI/ML', 'React', 'Next.js', 'Python', 'Node.js', 'TypeScript',
  'Web Dev', 'Mobile', 'Data Science', 'DevOps', 'UI/UX', 'Copywriting',
  'SEO', 'Video Editing', 'Automation', 'Blockchain', 'Cloud/AWS',
];

const LANGUAGE_SUGGESTIONS = [
  'English', 'Italian', 'Indonesian', 'Spanish', 'French', 'German',
  'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
];

const EXPERIENCE_OPTIONS = ['none', 'beginner', 'intermediate', 'expert'] as const;

export default function ProfilePanel({ onBack, onProfileChange, tags: externalTags, onTagsChange }: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfile>({});
  const [activeSection, setActiveSection] = useState<string | null>('context');
  const [tags, setTags] = useState<ContextTags>(externalTags || {});
  const [showSacredAssessment, setShowSacredAssessment] = useState(false);
  const [sacredProfile, setSacredProfile] = useState<SacredProfile | null>(null);

  // Load sacred profile on mount
  useEffect(() => { setSacredProfile(loadSacredProfile()); }, []);

  // Sync tags to parent
  const updateTag = (key: keyof ContextTags, value: string | undefined) => {
    const next = { ...tags, [key]: value || undefined };
    setTags(next);
    onTagsChange?.(next);
  };

  useEffect(() => { setProfile(loadProfile()); }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch };
      saveProfile(next);
      onProfileChange?.(next);
      return next;
    });
  }, [onProfileChange]);

  const toggleArrayItem = useCallback((field: 'skills' | 'languages', item: string) => {
    setProfile(prev => {
      const arr = prev[field] || [];
      const next = arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item].slice(0, field === 'skills' ? 5 : 6);
      const updated = { ...prev, [field]: next };
      saveProfile(updated);
      onProfileChange?.(updated);
      return updated;
    });
  }, [onProfileChange]);

  const complete = isProfileComplete(profile);
  const filledCount = Object.entries(profile).filter(([, v]) => v != null && v !== '' && (!Array.isArray(v) || v.length > 0)).length;
  const fieldWarnings = getFieldWarnings(profile);

  const sections = [
    { id: 'context', label: 'Context', icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' },
    { id: 'identity', label: 'Identity', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
    { id: 'financial', label: 'Financial', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
    { id: 'professional', label: 'Professional', icon: 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z' },
    { id: 'network', label: 'Network', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { id: 'upwork', label: 'Upwork', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
    { id: 'sacred', label: 'Sacred', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-4)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'none', border: 'none', color: 'var(--foreground)', fontSize: 'var(--text-base)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
          Profile
        </button>
        <span style={{
          fontSize: 'var(--text-xs)', fontWeight: 700, padding: '2px var(--space-2)', borderRadius: '10px', letterSpacing: '0.06em', fontFamily: 'var(--font-geist-mono), monospace',
          background: complete ? 'var(--success-muted)' : 'var(--surface-hover)',
          color: complete ? 'var(--success)' : 'var(--muted)',
        }}>
          {complete ? 'ACTIVE' : `${filledCount} FIELDS`}
        </span>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '2px', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--border)', overflowX: 'auto' }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(activeSection === s.id ? null : s.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-1)', padding: 'var(--space-1) var(--space-2)', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 500, whiteSpace: 'nowrap', transition: 'all 0.1s',
              background: activeSection === s.id ? 'var(--foreground)' : 'transparent',
              color: activeSection === s.id ? 'var(--background)' : 'var(--muted-foreground)',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
            {s.label}
          </button>
        ))}
      </div>


      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-3) var(--space-4)' }}>

        {activeSection === 'context' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <FieldRow label="Location" value={tags.location ?? ''} placeholder="City or country..." onChange={v => updateTag('location', v)} />
            <FieldRow label="Budget" value={tags.budget ?? ''} placeholder="e.g. $5000, 10 juta..." onChange={v => updateTag('budget', v)} />
            <FieldRow label="Timeline" value={tags.timeline ?? ''} placeholder="e.g. 6 months, 2 years..." onChange={v => updateTag('timeline', v)} />
            <ChipField label="Experience" options={[...EXPERIENCE_OPTIONS]} selected={tags.experience ? [tags.experience] : []} onToggle={v => updateTag('experience', tags.experience === v ? undefined : v)} />
          </div>
        )}

        {activeSection === 'identity' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <FieldRow label="Age" value={profile.age ?? ''} type="number" placeholder="29" onChange={v => update({ age: v ? parseInt(v) : undefined })} />
            <FieldRow label="Country" value={profile.country ?? ''} placeholder="Indonesia" onChange={v => update({ country: v || undefined })} warning={fieldWarnings['country']} />
            <FieldRow label="City" value={profile.city ?? ''} placeholder="Bandung" onChange={v => update({ city: v || undefined })} />
            <FieldRow label="Nationality" value={profile.nationality ?? ''} placeholder="Italian" onChange={v => update({ nationality: v || undefined })} />
            <ChipField label="Languages" options={LANGUAGE_SUGGESTIONS} selected={profile.languages || []} onToggle={item => toggleArrayItem('languages', item)} />
          </div>
        )}

        {activeSection === 'financial' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <FieldRow label="Capital (USD)" value={profile.capital ?? ''} type="number" placeholder="5000" onChange={v => update({ capital: v ? parseInt(v) : undefined })} warning={fieldWarnings['capital']} />
            <FieldRow label="Monthly Income" value={profile.monthlyIncome ?? ''} type="number" placeholder="2000" onChange={v => update({ monthlyIncome: v ? parseInt(v) : undefined })} warning={fieldWarnings['monthlyIncome']} />
            <FieldRow label="Monthly Expenses" value={profile.monthlyExpenses ?? ''} type="number" placeholder="800" onChange={v => update({ monthlyExpenses: v ? parseInt(v) : undefined })} />
            <FieldRow label="Runway (months)" value={profile.canSurviveMonths ?? ''} type="number" placeholder="6" onChange={v => update({ canSurviveMonths: v ? parseInt(v) : undefined })} warning={fieldWarnings['canSurviveMonths']} />
            <ChipField label="Risk Tolerance" options={['conservative', 'moderate', 'aggressive']} selected={profile.riskTolerance ? [profile.riskTolerance] : []} onToggle={v => update({ riskTolerance: profile.riskTolerance === v ? undefined : v as UserProfile['riskTolerance'] })} />
          </div>
        )}

        {activeSection === 'professional' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <FieldRow label="Current Role" value={profile.currentRole ?? ''} placeholder="Software Engineer" onChange={v => update({ currentRole: v || undefined })} />
            <FieldRow label="Industry" value={profile.industry ?? ''} placeholder="Tech / AI" onChange={v => update({ industry: v || undefined })} />
            <FieldRow label="Years Experience" value={profile.yearsExperience ?? ''} type="number" placeholder="3" onChange={v => update({ yearsExperience: v ? parseInt(v) : undefined })} warning={fieldWarnings['yearsExperience']} />
            <ChipField label="Education" options={['self-taught', 'bootcamp', 'high-school', 'bachelor', 'master', 'phd']} selected={profile.education ? [profile.education] : []} onToggle={v => update({ education: profile.education === v ? undefined : v as UserProfile['education'] })} />
            <ChipField label="Skills (max 5)" options={SKILL_SUGGESTIONS} selected={profile.skills || []} onToggle={item => toggleArrayItem('skills', item)} warning={fieldWarnings['skills']} />
          </div>
        )}

        {activeSection === 'network' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <ChipField label="Network Size" options={['none', 'small', 'medium', 'large']} selected={profile.networkSize ? [profile.networkSize] : []} onToggle={v => update({ networkSize: profile.networkSize === v ? undefined : v as UserProfile['networkSize'] })} warning={fieldWarnings['networkSize']} />
            <ToggleField label="Has mentor/advisor" value={!!profile.hasMentor} onChange={v => update({ hasMentor: v || undefined })} />
            <ToggleField label="Has co-founder/partner" value={!!profile.hasCofounder} onChange={v => update({ hasCofounder: v || undefined })} />
            <ToggleField label="Has team (2+ people)" value={!!profile.hasTeam} onChange={v => update({ hasTeam: v || undefined })} />
          </div>
        )}

        {activeSection === 'upwork' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <ChipField label="Badge" options={['none', 'rising-talent', 'top-rated', 'top-rated-plus', 'expert-vetted']} selected={profile.upworkBadge ? [profile.upworkBadge] : []} onToggle={v => update({ upworkBadge: profile.upworkBadge === v ? undefined : v as UserProfile['upworkBadge'] })} />
            <FieldRow label="JSS (%)" value={profile.upworkJSS ?? ''} type="number" placeholder="92" onChange={v => update({ upworkJSS: v ? parseInt(v) : undefined })} warning={fieldWarnings['upworkJSS']} />
            <FieldRow label="Lifetime Earnings" value={profile.upworkEarnings ?? ''} type="number" placeholder="15000" onChange={v => update({ upworkEarnings: v ? parseInt(v) : undefined })} />
            <FieldRow label="Hourly Rate (USD)" value={profile.freelanceRate ?? ''} type="number" placeholder="75" onChange={v => update({ freelanceRate: v ? parseInt(v) : undefined })} />
          </div>
        )}

        {activeSection === 'sacred' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.6 }}>
              Measure your alignment with 36 universal principles across 5 domains. Results personalize simulation probabilities.
            </div>
            {sacredProfile ? (
              <>
                {(() => {
                  const entries = Object.entries(sacredProfile).sort((a, b) => b[1] - a[1]);
                  const top = entries.slice(0, 3);
                  const bottom = entries.filter(([, s]) => s > 0).slice(-3);
                  const avg = entries.length > 0 ? Math.round((entries.reduce((a, [, s]) => a + s, 0) / entries.length) * 10) / 10 : 0;
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', fontFamily: 'var(--font-geist-mono, monospace)' }}>OVERALL SCORE</span>
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: avg >= 7 ? 'var(--success)' : avg >= 4 ? 'var(--accent)' : 'var(--danger)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{avg.toFixed(1)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {top.map(([id, score]) => (
                          <span key={id} style={{ fontSize: 'var(--text-xs)', padding: '2px var(--space-2)', borderRadius: '4px', background: 'var(--success-muted)', color: 'var(--success)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                            {id.replace('SR-0', '')} {score.toFixed(1)}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {bottom.map(([id, score]) => (
                          <span key={id} style={{ fontSize: 'var(--text-xs)', padding: '2px var(--space-2)', borderRadius: '4px', background: 'var(--danger-muted)', color: 'var(--danger)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                            {id.replace('SR-0', '')} {score.toFixed(1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <button
                  onClick={() => setShowSacredAssessment(true)}
                  style={{
                    padding: 'var(--space-2)', border: '1px solid var(--border)', borderRadius: '6px',
                    background: 'none', color: 'var(--foreground)', fontSize: 'var(--text-sm)', fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  View Full Results
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowSacredAssessment(true)}
                style={{
                  padding: 'var(--space-3)', border: 'none', borderRadius: '6px',
                  background: 'var(--foreground)', color: 'var(--background)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>
                Take Sacred Assessment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Sacred Assessment overlay */}
      {showSacredAssessment && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'var(--background)',
        }}>
          <SacredAssessment
            onClose={() => {
              setShowSacredAssessment(false);
              const updated = loadSacredProfile();
              setSacredProfile(updated);
              if (updated) {
                update({ sacredProfile: updated });
              }
            }}
            onComplete={(result) => {
              setSacredProfile(result);
              update({ sacredProfile: result });
            }}
          />
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => { setProfile({}); saveProfile({}); onProfileChange?.({}); }}
          style={{ width: '100%', padding: 'var(--space-2)', border: 'none', borderRadius: '6px', background: 'none', color: 'var(--muted)', fontSize: 'var(--text-xs)', cursor: 'pointer', transition: 'color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
        >
          Reset Profile
        </button>
      </div>
    </div>
  );
}

// ─── Field Components (inline styles — no CSS class dependency) ───

function FieldRow({ label, value, type = 'text', placeholder, onChange, warning }: {
  label: string; value: string | number; type?: string; placeholder: string; onChange: (v: string) => void; warning?: 'critical' | 'warning';
}) {
  const tooltips: Record<string, string> = {
    critical: 'This field is critical for accurate simulation',
    warning: 'Filling this field improves simulation accuracy',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <label style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontFamily: 'var(--font-geist-mono), monospace' }}>
        {label}
        {warning && <FieldWarningDot severity={warning} tooltip={tooltips[warning]} />}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: 'var(--space-2) var(--space-2)', border: '1px solid var(--border)', borderRadius: '6px',
          background: 'var(--surface)', color: 'var(--foreground)', fontSize: 'var(--text-sm)', fontFamily: 'inherit',
          outline: 'none', transition: 'border-color 0.15s',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      />
    </div>
  );
}

function ChipField({ label, options, selected, onToggle, warning }: {
  label: string; options: string[]; selected: string[]; onToggle: (v: string) => void; warning?: 'critical' | 'warning';
}) {
  const tooltips: Record<string, string> = {
    critical: 'This field is critical for accurate simulation',
    warning: 'Filling this field improves simulation accuracy',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontFamily: 'var(--font-geist-mono), monospace' }}>
        {label}
        {warning && <FieldWarningDot severity={warning} tooltip={tooltips[warning]} />}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => onToggle(opt)}
              style={{
                padding: '3px var(--space-2)', borderRadius: '5px', fontSize: 'var(--text-xs)', fontWeight: 500, cursor: 'pointer', transition: 'all 0.1s',
                border: `1px solid ${active ? 'var(--foreground)' : 'var(--border)'}`,
                background: active ? 'var(--foreground)' : 'var(--surface)',
                color: active ? 'var(--background)' : 'var(--muted-foreground)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleField({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
        padding: 'var(--space-2) 0', background: 'none', border: 'none', color: 'var(--foreground)',
        fontSize: 'var(--text-sm)', cursor: 'pointer', textAlign: 'left' as const,
      }}
    >
      <span>{label}</span>
      <div style={{
        width: '28px', height: '16px', borderRadius: '8px', position: 'relative' as const, transition: 'background 0.2s',
        background: value ? 'var(--success)' : 'var(--border)',
      }}>
        <div style={{
          width: '12px', height: '12px', borderRadius: '6px', background: 'var(--background)',
          position: 'absolute' as const, top: '2px', left: '2px',
          transition: 'transform 0.2s', transform: value ? 'translateX(12px)' : 'none',
        }} />
      </div>
    </button>
  );
}
