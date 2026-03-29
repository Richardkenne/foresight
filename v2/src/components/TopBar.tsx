'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';
import TemplateSelector from './TemplateSelector';
import PhotoUpload from './PhotoUpload';
import HistoryPanel from './HistoryPanel';
import type { ContextTags } from '@/lib/context-tags';
import type { HistoryEntry } from '@/lib/history';

interface TopBarProps {
  scenario: string;
  onScenarioChange: (val: string) => void;
  hasNodes: boolean;
  generating: boolean;
  onGenerate: () => void;
  onLoadTemplate: (key: string) => void;
  onPhotoScenario?: (scenario: string, photoPreview?: string) => void;
  onTagsChange?: (tags: ContextTags) => void;
  onHistorySelect?: (entry: HistoryEntry) => void;
  photoPreview?: string | null;
}

function Logo() {
  return (
    <div className="flex items-center gap-2.5 shrink-0 select-none">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-[var(--foreground)]">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.15" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[13px] font-semibold text-[var(--foreground)] tracking-[0.1em] hidden sm:block" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
        SIMULATOR
      </span>
    </div>
  );
}

// Tag chip icons (SVG paths)
const TAG_ICONS: Record<string, string> = {
  location: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z',
  budget: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  timeline: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  experience: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
};

const TAG_LABELS: Record<string, string> = {
  location: 'Location',
  budget: 'Budget',
  timeline: 'Timeline',
  experience: 'Experience',
};

const TAG_PLACEHOLDERS: Record<string, string> = {
  location: 'City or country...',
  budget: 'e.g. $5000, 10 juta...',
  timeline: 'e.g. 6 months, 2 years...',
  experience: '',
};

const EXPERIENCE_OPTIONS = ['none', 'beginner', 'intermediate', 'expert'] as const;

function TagIcon({ name }: { name: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={TAG_ICONS[name] || TAG_ICONS.location} />
      {name === 'location' && <circle cx="12" cy="10" r="3" />}
      {name === 'experience' && <circle cx="12" cy="7" r="4" />}
    </svg>
  );
}

export default function TopBar({
  scenario, onScenarioChange, generating,
  onGenerate, onLoadTemplate, onPhotoScenario, onTagsChange, onHistorySelect, photoPreview,
}: TopBarProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [inputExpanded, setInputExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Context tags state
  const [tags, setTags] = useState<ContextTags>({});
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Notify parent of tag changes
  useEffect(() => {
    if (onTagsChange) onTagsChange(tags);
  }, [tags, onTagsChange]);

  // Focus tag input when editing starts
  useEffect(() => {
    if (editingTag && editingTag !== 'experience') {
      setTimeout(() => tagInputRef.current?.focus(), 50);
    }
  }, [editingTag]);

  // Auto-detect location via browser geolocation
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Reverse geocode using free API
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          const city = data.city || data.locality || '';
          const country = data.countryName || '';
          const location = city ? `${city}, ${country}` : country;
          if (location) {
            setTags(prev => ({ ...prev, location }));
            setEditingTag(null);
          }
        } catch { /* silent fail */ }
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 5000 }
    );
  }, []);

  const hasAnyTag = Object.values(tags).some(v => v);
  const activeTagCount = Object.values(tags).filter(v => v).length;

  const setTag = (key: string, value: string) => {
    setTags(prev => ({ ...prev, [key]: value || undefined }));
    setEditingTag(null);
    setTagInput('');
  };

  const removeTag = (key: string) => {
    setTags(prev => {
      const next = { ...prev };
      delete next[key as keyof ContextTags];
      return next;
    });
  };

  const handleTagSubmit = (key: string) => {
    if (tagInput.trim()) {
      setTag(key, tagInput.trim());
    } else {
      setEditingTag(null);
    }
  };

  return (
    <div className="shrink-0 z-50 border-b border-[var(--border)]" style={{ background: 'var(--surface)' }}>
      {/* Main bar */}
      <div className="h-[56px] flex items-center gap-3 px-6">
        {/* Hamburger menu */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="h-11 w-11 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>

        <div className="w-px h-7 bg-[var(--border)] shrink-0" />

        <Logo />

        {/* Photo thumbnail (persistent after photo-generated simulation) */}
        {photoPreview && !showPhoto && (
          <div className="shrink-0 h-[32px] w-[32px] rounded-md overflow-hidden border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Source" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Scenario Input — expandable textarea */}
        <div className="flex-1 relative min-w-0 max-w-[520px]">
          {inputExpanded ? (
            <textarea
              ref={inputRef}
              className="w-full px-3 py-2 rounded-lg text-[13px] text-[var(--foreground)] placeholder-[var(--muted)] bg-[var(--surface-hover)] border border-[var(--border)] outline-none transition-all resize-none"
              style={{ minHeight: '60px', maxHeight: '160px' }}
              placeholder="Describe a scenario..."
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value)}
              disabled={generating}
              onBlur={() => setInputExpanded(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && scenario.trim()) {
                  e.preventDefault();
                  setInputExpanded(false);
                  onGenerate();
                }
                if (e.key === 'Escape') setInputExpanded(false);
              }}
              autoFocus
            />
          ) : (
            <div
              className="w-full px-3 py-2 rounded-lg text-[13px] text-[var(--foreground)] bg-transparent border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-hover)] cursor-text transition-all truncate"
              onClick={() => { if (!generating) setInputExpanded(true); }}
              title={scenario || 'Describe a scenario...'}
            >
              {scenario || <span className="text-[var(--muted)]">Describe a scenario...</span>}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Photo upload */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPhoto(!showPhoto); setShowTemplates(false); }}
              className="h-11 w-11 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
              title="Photo to Simulation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            {showPhoto && (
              <PhotoUpload
                onSeedSelect={(s, preview) => { if (onPhotoScenario) onPhotoScenario(s, preview); }}
                onClose={() => setShowPhoto(false)}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); setShowPhoto(false); }}
              className="h-11 px-5 text-[14px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-[10px] transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Templates
            </button>
            {showTemplates && (
              <TemplateSelector
                onSelect={onLoadTemplate}
                onClose={() => setShowTemplates(false)}
              />
            )}
          </div>

          <div className="w-px h-7 bg-[var(--border)]" />

          <Button
            variant="primary"
            size="sm"
            onClick={onGenerate}
            disabled={generating || !scenario.trim()}
            loading={generating}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        {(showTemplates || showPhoto) && (
          <div className="fixed inset-0 z-30" onClick={() => { setShowTemplates(false); setShowPhoto(false); }} />
        )}
      </div>

      {/* Context tags row */}
      <div className="h-[32px] flex items-center gap-1.5 px-6 border-t border-[var(--border)] overflow-x-auto" style={{ scrollbarWidth: 'none', background: hasAnyTag ? 'var(--surface)' : 'transparent' }}>
        {/* Tag count indicator */}
        {activeTagCount > 0 && (
          <span className="text-[9px] font-medium text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">
            {activeTagCount} tag{activeTagCount > 1 ? 's' : ''}
          </span>
        )}

        {/* Tag chips */}
        {(['location', 'budget', 'timeline', 'experience'] as const).map((key) => {
          const value = tags[key];
          const isEditing = editingTag === key;

          // Active tag (has value)
          if (value && !isEditing) {
            return (
              <div
                key={key}
                className="group flex items-center gap-1.5 h-[22px] px-2 rounded-md text-[10px] font-medium shrink-0 cursor-pointer transition-all"
                style={{
                  background: 'rgba(59,130,246,0.08)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59,130,246,0.15)',
                }}
                onClick={() => { setEditingTag(key); setTagInput(value); }}
              >
                <TagIcon name={key} />
                <span className="max-w-[120px] truncate">{value}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeTag(key); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-red-500"
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          }

          // Editing state
          if (isEditing) {
            if (key === 'experience') {
              return (
                <div key={key} className="flex items-center gap-1 shrink-0">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setTag('experience', opt)}
                      className="h-[22px] px-2 rounded-md text-[10px] font-medium cursor-pointer transition-all"
                      style={{
                        background: value === opt ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.03)',
                        color: value === opt ? '#3b82f6' : 'var(--muted-foreground)',
                        border: `1px solid ${value === opt ? 'rgba(59,130,246,0.2)' : 'transparent'}`,
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                  <button
                    onClick={() => setEditingTag(null)}
                    className="text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer ml-0.5"
                  >
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            }

            return (
              <div key={key} className="flex items-center gap-1 shrink-0">
                <div
                  className="flex items-center gap-1 h-[22px] px-2 rounded-md text-[10px]"
                  style={{
                    background: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.2)',
                  }}
                >
                  <TagIcon name={key} />
                  <input
                    ref={tagInputRef}
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleTagSubmit(key);
                      if (e.key === 'Escape') { setEditingTag(null); setTagInput(''); }
                    }}
                    onBlur={() => handleTagSubmit(key)}
                    placeholder={TAG_PLACEHOLDERS[key]}
                    className="w-[100px] bg-transparent outline-none text-[10px] text-[var(--foreground)] placeholder-gray-400"
                  />
                </div>
                {/* Geo detect button for location */}
                {key === 'location' && (
                  <button
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="h-[26px] w-[26px] flex items-center justify-center rounded-md cursor-pointer transition-colors hover:bg-blue-500/10"
                    style={{ color: geoLoading ? '#93c5fd' : '#3b82f6' }}
                    title="Detect my location"
                  >
                    {geoLoading ? (
                      <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            );
          }

          // Inactive chip (no value, not editing)
          return (
            <button
              key={key}
              onClick={() => { setEditingTag(key); setTagInput(''); }}
              className="flex items-center gap-1 h-[22px] px-2 rounded-md text-[10px] font-medium shrink-0 cursor-pointer transition-all"
              style={{
                background: 'transparent',
                color: 'var(--muted)',
                border: '1px dashed rgba(0,0,0,0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
                e.currentTarget.style.color = '#3b82f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                e.currentTarget.style.color = 'var(--muted)';
              }}
            >
              <TagIcon name={key} />
              <span>+ {TAG_LABELS[key]}</span>
            </button>
          );
        })}

        {/* Clear all */}
        {activeTagCount > 0 && (
          <button
            onClick={() => setTags({})}
            className="text-[9px] text-gray-400 hover:text-red-500 cursor-pointer ml-1 shrink-0 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Sidebar menu drawer */}
      {showMenu && (
        <>
          <div className="fixed inset-0 bg-black/20 z-[300] backdrop-blur-[2px]" onClick={() => { setShowMenu(false); setShowHistory(false); }} />
          <div
            className="fixed top-0 left-0 h-full w-[260px] z-[301] flex flex-col"
            style={{
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
              animation: 'slideInLeft 0.2s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Menu header */}
            <div className="h-[56px] flex items-center justify-between px-5 border-b border-[var(--border)]">
              <span className="text-[16px] font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.08em' }}>
                SIMULATOR
              </span>
              <button
                onClick={() => { setShowMenu(false); setShowHistory(false); }}
                className="h-10 w-10 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu content — either nav items or history panel */}
            {showHistory ? (
              <HistoryPanel
                onSelect={(entry) => {
                  setShowMenu(false);
                  setShowHistory(false);
                  if (onHistorySelect) onHistorySelect(entry);
                }}
                onBack={() => setShowHistory(false)}
              />
            ) : (
              <nav className="flex-1 py-3 px-3">
                {[
                  { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z', label: 'Home', active: true, action: () => setShowMenu(false) },
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', label: 'History', active: false, action: () => setShowHistory(true) },
                  { icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', label: 'Saved', active: false, action: undefined },
                  { icon: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z', label: 'Settings', active: false, extra: <circle cx="12" cy="12" r="3" />, action: undefined },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] transition-colors cursor-pointer"
                    style={{
                      color: item.active ? 'var(--foreground)' : 'var(--muted-foreground)',
                      background: item.active ? 'var(--surface-hover)' : 'transparent',
                      fontWeight: item.active ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = 'var(--surface-hover)'; }}
                    onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = 'transparent'; }}
                    onClick={() => { if (item.action) item.action(); else setShowMenu(false); }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={item.icon} />
                      {item.extra}
                    </svg>
                    {item.label}
                    {!item.active && item.label !== 'History' && (
                      <span className="ml-auto text-[10px] text-[var(--muted)] bg-[var(--border)] px-2 py-1 rounded-md">Soon</span>
                    )}
                  </button>
                ))}
              </nav>
            )}

            {/* Menu footer */}
            <div className="px-5 py-4 border-t border-[var(--border)]">
              <div className="text-[11px] text-[var(--muted)]">
                Simulator v2
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
