'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import TemplateSelector from './TemplateSelector';
import PhotoUpload from './PhotoUpload';
import HistoryPanel from './HistoryPanel';
import ProfilePanel from './ProfilePanel';
import ModeSelector from './ModeSelector';
import PersonalProfileInline from './PersonalProfileInline';
import { type SimMode, MODE_CONFIG } from '@/lib/sim-modes';
import type { ContextTags } from '@/lib/context-tags';
import type { HistoryEntry } from '@/lib/history';
import type { UserProfile } from '@/lib/user-profile';
import { DEPTH_NODE_COUNTS, type DepthLevel } from '@/lib/generate/types';

export interface Attachment {
  id: string;
  type: 'photo' | 'audio' | 'url' | 'pdf' | 'video';
  label: string;       // short display label
  content: string;     // extracted text/scenario from this source
  preview?: string;    // image data URL for photos
}

interface TopBarProps {
  scenario: string;
  onScenarioChange: (val: string) => void;
  hasNodes: boolean;
  generating: boolean;
  onGenerate: () => void;
  onRestart?: () => void;
  onStop?: () => void;
  onLoadTemplate: (key: string) => void;
  onPhotoScenario?: (scenario: string, photoPreview?: string) => void;
  onAudioScenario?: (scenario: string) => void;
  onTagsChange?: (tags: ContextTags) => void;
  onHistorySelect?: (entry: HistoryEntry) => void;
  onProfileChange?: (profile: UserProfile) => void;
  photoPreview?: string | null;
  sacredMode?: boolean;
  onSacredModeChange?: (val: boolean) => void;
  attachments?: Attachment[];
  onAttachmentsChange?: (attachments: Attachment[]) => void;
  layoutDirection?: 'LR' | 'TB';
  onLayoutDirectionChange?: (dir: 'LR' | 'TB') => void;
  viewMode?: '2d' | '3d' | 'flowchart';
  onViewModeChange?: (mode: '2d' | '3d' | 'flowchart') => void;
  // Trigger counter props: increment to open the respective panel (used by CommandPalette)
  openHistoryTrigger?: number;
  openProfileTrigger?: number;
  activeMode?: SimMode;
  onModeChange?: (mode: SimMode) => void;
  depthLevel?: DepthLevel;
  onDepthLevelChange?: (level: DepthLevel) => void;
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
        FORESIGHT
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
  scenario, onScenarioChange, hasNodes, generating,
  onGenerate, onRestart, onStop, onLoadTemplate, onPhotoScenario, onAudioScenario, onTagsChange, onHistorySelect, onProfileChange, photoPreview,
  sacredMode, onSacredModeChange, attachments = [], onAttachmentsChange, layoutDirection = 'LR', onLayoutDirectionChange, viewMode = '2d', onViewModeChange, openHistoryTrigger, openProfileTrigger,
  activeMode, onModeChange,
  depthLevel = 'analysis', onDepthLevelChange,
}: TopBarProps) {
  const addAttachment = useCallback((att: Omit<Attachment, 'id'>) => {
    const newAtt: Attachment = { ...att, id: `${att.type}-${Date.now()}` };
    onAttachmentsChange?.([...attachments, newAtt]);
  }, [attachments, onAttachmentsChange]);

  const removeAttachment = useCallback((id: string) => {
    onAttachmentsChange?.(attachments.filter(a => a.id !== id));
  }, [attachments, onAttachmentsChange]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showAudio, setShowAudio] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [urlSeeds, setUrlSeeds] = useState<{ category: string; icon: string; scenario: string; confidence: number }[] | null>(null);
  const [urlMeta, setUrlMeta] = useState<Record<string, string>>({});
  const [inputExpanded, setInputExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [displayMode, setDisplayMode] = useState<'minimal' | 'classic'>('minimal');
  const [darkMode, setDarkMode] = useState<boolean | null>(null); // null = follows system

  // Load display mode and theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sim-display-mode') as 'minimal' | 'classic' | null;
    if (saved) {
      setDisplayMode(saved);
      document.documentElement.setAttribute('data-display', saved);
    }
    const savedTheme = localStorage.getItem('sim-theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleDisplayMode = () => {
    const next = displayMode === 'minimal' ? 'classic' : 'minimal';
    setDisplayMode(next);
    localStorage.setItem('sim-display-mode', next);
    document.documentElement.setAttribute('data-display', next);
  };

  const toggleDarkMode = () => {
    // If null (system), detect current effective theme and flip it
    const currentlyDark = darkMode === null
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : darkMode;
    const next = !currentlyDark;
    setDarkMode(next);
    const theme = next ? 'dark' : 'light';
    localStorage.setItem('sim-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  // Trigger-based imperative open: parent increments the counter to open a panel
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; } // skip on mount
    if (openHistoryTrigger) { setShowMenu(true); setShowHistory(true); setShowProfile(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openHistoryTrigger]);
  useEffect(() => {
    if (!mountedRef.current) return;
    if (openProfileTrigger) { setShowMenu(true); setShowProfile(true); setShowHistory(false); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProfileTrigger]);

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
      <div className="h-[56px] flex items-center gap-1.5 sm:gap-3 px-2 sm:px-6">
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

        <div className="w-px h-7 bg-[var(--border)] shrink-0 hidden sm:block" />

        <Logo />

        {/* Photo thumbnail (persistent after photo-generated simulation) */}
        {photoPreview && !showPhoto && (
          <div className="shrink-0 h-[32px] w-[32px] rounded-md overflow-hidden border border-[var(--border)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoPreview} alt="Source" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Scenario Input — click to expand as overlay */}
        {MODE_CONFIG[activeMode || 'simulate'].showsPrompt && (
          <div className="flex-1 relative min-w-0 max-w-[520px]">
            <div
              className="w-full px-2 sm:px-3 py-2 rounded-lg text-[12px] sm:text-[13px] text-[var(--foreground)] bg-transparent border border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-hover)] cursor-text transition-all line-clamp-1 sm:line-clamp-2"
              onClick={() => { if (!generating) setInputExpanded(true); }}
              title={scenario || 'Describe a scenario...'}
            >
              {scenario || <span className="text-[var(--muted)]">Describe a scenario...</span>}
            </div>
          </div>
        )}

        {/* Expanded textarea overlay */}
        {inputExpanded && MODE_CONFIG[activeMode || 'simulate'].showsPrompt && (
          <>
            <div className="fixed inset-0 z-[250] bg-black/10" onClick={() => setInputExpanded(false)} />
            <div className="fixed z-[251] left-3 right-3 sm:left-6 sm:right-6 max-w-[600px] mx-auto" style={{ top: '64px' }}>
              <textarea
                ref={inputRef}
                className="w-full px-4 py-3 rounded-xl text-[14px] text-[var(--foreground)] placeholder-[var(--muted)] border border-[var(--border)] outline-none resize-none shadow-lg"
                style={{ minHeight: '80px', maxHeight: '200px', background: 'var(--surface)' }}
                placeholder="Describe a scenario..."
                value={scenario}
                onChange={(e) => onScenarioChange(e.target.value)}
                disabled={generating}
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
              <div className="mt-2 text-[11px] text-[var(--muted)] text-right">
                Enter to generate / Esc to close
              </div>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Hidden file inputs for Others menu */}
          <input type="file" accept=".pdf,application/pdf" className="hidden" ref={(el) => { if (el) el.dataset.pdfInput = 'true'; }}
            onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setAudioProcessing(true);
              try {
                const formData = new FormData(); formData.append('pdf', file);
                const res = await fetch('/api/analyze-pdf', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('PDF analysis failed');
                const { scenario: s } = await res.json();
                if (s) {
                  addAttachment({ type: 'pdf', label: file.name.slice(0, 30), content: s });
                }
              } catch (err) { console.error('PDF error:', err); }
              setAudioProcessing(false); e.target.value = '';
            }}
          />
          <input type="file" accept="video/*" className="hidden" ref={(el) => { if (el) el.dataset.videoInput = 'true'; }}
            onChange={async (e) => {
              const file = e.target.files?.[0]; if (!file) return;
              setAudioProcessing(true);
              try {
                const frames: string[] = [];
                const video = document.createElement('video'); video.muted = true; video.preload = 'auto';
                const vUrl = URL.createObjectURL(file); video.src = vUrl;
                await new Promise<void>((r) => { video.onloadedmetadata = () => r(); video.onerror = () => r(); });
                const duration = video.duration || 0;
                if (duration > 0) {
                  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                  canvas.width = 512; canvas.height = 288;
                  const fc = Math.min(5, Math.max(3, Math.floor(duration / 10)));
                  for (let i = 0; i < fc; i++) {
                    video.currentTime = (duration / (fc + 1)) * (i + 1);
                    await new Promise<void>((r2) => { video.onseeked = () => r2(); });
                    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg', 0.6).split(',')[1]);
                  }
                }
                URL.revokeObjectURL(vUrl);
                const videoMeta: Record<string, string> = {};
                if (file.lastModified) { const d = new Date(file.lastModified); videoMeta.date = d.toISOString().split('T')[0]; videoMeta.time = d.toTimeString().split(' ')[0]; }
                if (duration > 0) videoMeta.duration = Math.round(duration) + 's';
                if (file.name) videoMeta.filename = file.name;
                try {
                  const pos = await new Promise<GeolocationPosition>((res2, rej2) => navigator.geolocation.getCurrentPosition(res2, rej2, { timeout: 3000 }));
                  videoMeta.latitude = pos.coords.latitude.toFixed(4); videoMeta.longitude = pos.coords.longitude.toFixed(4);
                  const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`);
                  const geoData = await geoRes.json();
                  if (geoData.city || geoData.locality) videoMeta.location = `${geoData.city || geoData.locality}, ${geoData.countryName || ''}`;
                } catch { /* skip */ }
                const formData = new FormData(); formData.append('video', file);
                if (frames.length > 0) formData.append('frames', JSON.stringify(frames));
                if (Object.keys(videoMeta).length > 0) formData.append('metadata', JSON.stringify(videoMeta));
                const res = await fetch('/api/analyze-video', { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Video analysis failed');
                const { scenario: s } = await res.json();
                if (s) {
                  addAttachment({ type: 'video', label: file.name.slice(0, 30), content: s });
                }
              } catch (err) { console.error('Video error:', err); }
              setAudioProcessing(false); e.target.value = '';
            }}
          />

          {/* Audio: record or upload */}
          <div className="relative">
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAudioProcessing(true);
                try {
                  const formData = new FormData();
                  formData.append('audio', file);
                  const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
                  if (!res.ok) throw new Error('Transcription failed');
                  const { text } = await res.json();
                  if (text) {
                    addAttachment({ type: 'audio', label: 'Audio file', content: text });
                  }
                } catch (err) {
                  console.error('Audio transcription error:', err);
                }
                setAudioProcessing(false);
                e.target.value = '';
              }}
            />
            <button
              onClick={async () => {
                if (audioProcessing) return;

                // If recording, stop and transcribe
                if (isRecording && mediaRecorderRef.current) {
                  mediaRecorderRef.current.stop();
                  return;
                }

                // Start recording
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                  mediaRecorderRef.current = mediaRecorder;
                  audioChunksRef.current = [];

                  mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) audioChunksRef.current.push(e.data);
                  };

                  mediaRecorder.onstop = async () => {
                    setIsRecording(false);
                    stream.getTracks().forEach(t => t.stop());

                    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    if (blob.size < 1000) return; // too short

                    setAudioProcessing(true);
                    try {
                      const formData = new FormData();
                      formData.append('audio', blob, 'recording.webm');
                      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
                      if (!res.ok) throw new Error('Transcription failed');
                      const { text } = await res.json();
                      if (text) {
                        addAttachment({ type: 'audio', label: 'Voice recording', content: text });
                      }
                    } catch (err) {
                      console.error('Audio transcription error:', err);
                    }
                    setAudioProcessing(false);
                  };

                  mediaRecorder.start();
                  setIsRecording(true);
                } catch (err) {
                  console.error('Microphone access denied:', err);
                  // Fallback: open file picker
                  audioInputRef.current?.click();
                }
              }}
              onContextMenu={(e) => {
                // Right-click: open file picker for audio upload
                e.preventDefault();
                audioInputRef.current?.click();
              }}
              disabled={audioProcessing}
              className="h-11 w-11 flex items-center justify-center rounded-lg transition-colors cursor-pointer"
              style={{
                color: isRecording ? '#ef4444' : audioProcessing ? 'var(--muted)' : 'var(--muted-foreground)',
                background: isRecording ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                outline: isRecording ? '2px solid rgba(239, 68, 68, 0.4)' : 'none',
                animation: isRecording ? 'pulse 1.5s infinite' : 'none',
              }}
              title={isRecording ? 'Click to stop recording' : audioProcessing ? 'Transcribing...' : 'Click to record / Right-click to upload audio'}
            >
              {audioProcessing ? (
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              ) : isRecording ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          </div>

          {/* Photo upload */}
          <div className="relative hidden sm:block">
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
                onSeedSelect={(s, preview) => {
                  addAttachment({ type: 'photo', label: 'Photo analysis', content: s, preview });
                  setShowPhoto(false);
                }}
                onClose={() => setShowPhoto(false)}
              />
            )}
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); setShowPhoto(false); }}
              className="h-11 px-3 sm:px-5 text-[14px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-[10px] transition-colors cursor-pointer flex items-center gap-2.5"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="hidden sm:inline">Templates</span>
            </button>
            {showTemplates && (
              <TemplateSelector
                onSelect={onLoadTemplate}
                onClose={() => setShowTemplates(false)}
              />
            )}
          </div>

          {/* Others dropdown (URL, PDF, Video) */}
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowAudio(!showAudio); setShowTemplates(false); setShowPhoto(false); }}
              className="h-11 px-3 text-[13px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              title="More input types"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
              </svg>
              <span className="hidden sm:inline">Others</span>
            </button>
            <AnimatePresence>
            {showAudio && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAudio(false)} />
                <motion.div
                  className="absolute top-full right-0 mt-2 z-40 rounded-xl border border-[var(--border)] shadow-lg overflow-hidden"
                  style={{ background: 'var(--surface)', minWidth: '180px' }}
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={async () => {
                      setShowAudio(false);
                      const url = prompt('Paste a URL (job listing, Airbnb, LinkedIn, website...)');
                      if (!url?.trim()) return;
                      setAudioProcessing(true);
                      try {
                        const res = await fetch('/api/analyze-url', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
                        if (!res.ok) throw new Error('URL analysis failed');
                        const data = await res.json();
                        if (data.seeds && Array.isArray(data.seeds)) {
                          // If seeds, pick best one as attachment
                          const best = data.seeds[0];
                          if (best) {
                            addAttachment({ type: 'url', label: url.trim().replace(/^https?:\/\//, '').slice(0, 30), content: best.scenario });
                          }
                        } else if (data.scenario) {
                          addAttachment({ type: 'url', label: url.trim().replace(/^https?:\/\//, '').slice(0, 30), content: data.scenario });
                        }
                      } catch (err) { console.error('URL error:', err); }
                      setAudioProcessing(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    URL
                  </button>
                  <button
                    onClick={() => { setShowAudio(false); (document.querySelector('input[data-pdf-input]') as HTMLInputElement)?.click(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={() => { setShowAudio(false); (document.querySelector('input[data-video-input]') as HTMLInputElement)?.click(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
                    </svg>
                    Video
                  </button>
                </motion.div>
              </>
            )}
            </AnimatePresence>
          </div>

          <div className="w-px h-7 bg-[var(--border)] hidden sm:block" />

          {/* Sacred mode toggle — hidden on narrow screens, visible via bottom bar */}
          {onSacredModeChange && (
            <button
              onClick={() => onSacredModeChange(!sacredMode)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              style={{
                background: sacredMode ? 'color-mix(in srgb, var(--purple) 15%, transparent)' : 'transparent',
                color: sacredMode ? 'var(--purple)' : 'var(--muted)',
                border: `1px solid ${sacredMode ? 'var(--purple)' : 'var(--border)'}`,
              }}
              title={sacredMode ? 'Switch to data mode' : 'Switch to sacred mode (Bible + Quran only)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Sacred
            </button>
          )}

          {generating ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => onStop?.()}
              className="!px-6 !py-2.5 !text-[14px] !rounded-full !bg-red-500 hover:!bg-red-600"
            >
              Stop
            </Button>
          ) : (
            <>
              {hasNodes && (
                <button
                  onClick={() => onRestart?.()}
                  title="Restart — clear simulation state"
                  className="flex items-center justify-center w-[36px] h-[36px] rounded-full transition-colors cursor-pointer hover:bg-[var(--surface-hover)]"
                  style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" />
                  </svg>
                </button>
              )}
              {/* Depth level selector */}
              <div className="flex items-center rounded-full border border-[var(--border)] overflow-hidden" style={{ background: 'var(--surface)' }}>
                {(['summary', 'analysis', 'full'] as DepthLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => onDepthLevelChange?.(level)}
                    className="px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer"
                    style={{
                      background: depthLevel === level ? 'var(--foreground)' : 'transparent',
                      color: depthLevel === level ? 'var(--surface)' : 'var(--muted)',
                    }}
                    title={`${DEPTH_NODE_COUNTS[level].label} (${DEPTH_NODE_COUNTS[level].min}-${DEPTH_NODE_COUNTS[level].max} nodes)`}
                  >
                    {DEPTH_NODE_COUNTS[level].label}
                  </button>
                ))}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={onGenerate}
                disabled={!scenario.trim() && attachments.length === 0}
                className="!px-6 !py-2.5 !text-[14px] !rounded-full"
              >
                Generate
              </Button>
            </>
          )}
        </div>

        {(showTemplates || showPhoto) && (
          <div className="fixed inset-0 z-30" onClick={() => { setShowTemplates(false); setShowPhoto(false); }} />
        )}
      </div>

      {/* ─── Attachment chips ─── */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-6 py-2 border-t border-[var(--border)] overflow-x-auto" style={{ background: 'var(--surface)', scrollbarWidth: 'none' }}>
          <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-medium shrink-0">Sources:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium border"
                style={{
                  background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                  color: 'var(--accent)',
                }}
              >
                {att.type === 'photo' && att.preview && (
                  <img src={att.preview} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
                )}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  {att.type === 'audio' && <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></>}
                  {att.type === 'photo' && <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>}
                  {att.type === 'url' && <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>}
                  {att.type === 'pdf' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>}
                  {att.type === 'video' && <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 9l5 3-5 3V9z" /></>}
                </svg>
                <span className="max-w-[120px] truncate">{att.label}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 shrink-0"
                  title="Remove"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => onAttachmentsChange?.([])}
              className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] px-1"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* URL Seeds popup */}
      <AnimatePresence>
      {urlSeeds && (
        <>
          <motion.div
            className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-[2px]"
            onClick={() => setUrlSeeds(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="fixed z-[201] left-3 right-3 sm:left-6 sm:right-6 max-w-[600px] mx-auto rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden"
            style={{ top: '80px', background: 'var(--surface)' }}
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="text-[14px] font-semibold text-[var(--foreground)]">{urlMeta.title || 'URL Analysis'}</div>
              {urlMeta.description && <div className="text-[11px] text-[var(--muted)] mt-1 line-clamp-2">{urlMeta.description}</div>}
            </div>
            <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto">
              {urlSeeds.map((seed, i) => {
                const catColors: Record<string, string> = { intention: '#3b82f6', content: '#8b5cf6', opportunity: '#10b981', risk: '#ef4444', competitor: '#f59e0b', market: '#06b6d4' };
                const catLabels: Record<string, string> = { intention: 'Intention', content: 'Content', opportunity: 'Opportunity', risk: 'Risk', competitor: 'Competitor', market: 'Market' };
                const color = catColors[seed.category] || '#64748b';
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setUrlSeeds(null);
                      if (onAudioScenario) onAudioScenario(seed.scenario);
                      else onScenarioChange(seed.scenario);
                    }}
                    className="text-left p-3 rounded-xl border border-[var(--border)] hover:border-[var(--foreground)] transition-all cursor-pointer"
                    style={{ background: 'var(--background)' }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ background: color + '15', color }}>{catLabels[seed.category] || seed.category}</span>
                      <span className="text-[9px] text-[var(--muted)] ml-auto" style={{ fontFamily: 'var(--font-geist-mono)' }}>{Math.round(seed.confidence * 100)}%</span>
                    </div>
                    <div className="text-[12px] text-[var(--foreground)] leading-snug line-clamp-3">{seed.scenario}</div>
                  </button>
                );
              })}
            </div>
            <div className="px-5 py-3 border-t border-[var(--border)] text-center">
              <button onClick={() => setUrlSeeds(null)} className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer">Close</button>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Mode selector strip */}
      <div className="flex justify-center py-1" style={{ borderBottom: '1px solid color-mix(in srgb, var(--foreground) 6%, transparent)' }}>
        <ModeSelector activeMode={activeMode || 'simulate'} onModeChange={(m) => onModeChange?.(m)} hasNodes={hasNodes} />
      </div>

      {/* Personal mode profile inline */}
      {activeMode === 'personal' && (
        <div className="px-4 pt-2">
          <PersonalProfileInline onProfileChange={onProfileChange} />
        </div>
      )}

      {/* Sacred mode toggle row */}
      <div className="h-[32px] flex items-center gap-1.5 px-2 sm:px-6 border-t border-[var(--border)] overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => onSacredModeChange?.(!sacredMode)}
          className="flex items-center gap-1.5 h-[22px] px-2.5 rounded-md text-[10px] font-medium shrink-0 cursor-pointer transition-all"
          style={{
            background: sacredMode ? 'rgba(168,85,247,0.12)' : 'transparent',
            color: sacredMode ? '#a855f7' : 'var(--muted)',
            border: sacredMode ? '1px solid rgba(168,85,247,0.25)' : '1px dashed rgba(0,0,0,0.1)',
          }}
          title={sacredMode ? 'Switch to Data mode' : 'Switch to Sacred mode (Bible + Quran)'}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          {sacredMode ? 'Sacred' : 'Sacred'}
        </button>
      </div>

      {/* Sidebar menu drawer */}
      <AnimatePresence>
      {showMenu && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/20 z-[300] backdrop-blur-[2px]"
            onClick={() => { setShowMenu(false); setShowHistory(false); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="fixed top-0 left-0 h-full w-[260px] max-w-[100vw] z-[301] flex flex-col"
            style={{
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
            }}
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Menu header */}
            <div className="h-[56px] flex items-center justify-between px-5 border-b border-[var(--border)]">
              <span className="text-[16px] font-bold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-geist-mono), monospace', letterSpacing: '0.08em' }}>
                FORESIGHT
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

            {/* Menu content — nav items, history panel, or profile panel */}
            {showHistory ? (
              <HistoryPanel
                onSelect={(entry) => {
                  setShowMenu(false);
                  setShowHistory(false);
                  if (onHistorySelect) onHistorySelect(entry);
                }}
                onBack={() => setShowHistory(false)}
              />
            ) : showProfile ? (
              <ProfilePanel
                onBack={() => setShowProfile(false)}
                onProfileChange={onProfileChange}
                tags={tags}
                onTagsChange={(t) => { setTags(t); if (onTagsChange) onTagsChange(t); }}
              />
            ) : (
              <nav className="flex-1 py-3 px-3">
                {[
                  { icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z', label: 'Home', active: true, action: () => setShowMenu(false) },
                  { icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', label: 'History', active: false, action: () => setShowHistory(true) },
                  { icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', label: 'Profile', active: false, extra: <circle cx="12" cy="7" r="4" />, action: () => setShowProfile(true) },
                  { icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', label: 'Community', active: false, extra: <><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, action: () => { setShowMenu(false); window.location.href = '/community'; } },
                  { icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z', label: 'Saved', active: false, action: undefined },
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
                    {!item.active && !item.action && (
                      <span className="ml-auto text-[10px] text-[var(--muted)] bg-[var(--border)] px-2 py-1 rounded-md">Soon</span>
                    )}
                  </button>
                ))}
              </nav>
            )}

            {/* Settings */}
            <div className="px-3 py-3 border-t border-[var(--border)]">
              <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-4 mb-2">Settings</div>
              <button
                onClick={toggleDisplayMode}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] transition-colors cursor-pointer hover:bg-[var(--surface-hover)]"
                style={{ color: 'var(--foreground)' }}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                    <path d="M9 21V9" />
                  </svg>
                  <span>{displayMode === 'classic' ? 'Classic' : 'Minimal'}</span>
                </div>
                {/* Toggle switch */}
                <div
                  className="relative w-[44px] h-[24px] rounded-full transition-colors"
                  style={{ background: displayMode === 'classic' ? '#f59e0b' : 'var(--border)' }}
                >
                  <div
                    className="absolute top-[2px] w-[20px] h-[20px] rounded-full shadow transition-all"
                    style={{ left: displayMode === 'classic' ? '22px' : '2px', background: 'var(--surface)' }}
                  />
                </div>
              </button>
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] transition-colors cursor-pointer hover:bg-[var(--surface-hover)]"
                style={{ color: 'var(--foreground)' }}
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const isDark = darkMode === null
                      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                      : darkMode;
                    return isDark ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                      </svg>
                    );
                  })()}
                  <span>{(() => {
                    const isDark = darkMode === null
                      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                      : darkMode;
                    return isDark ? 'Light mode' : 'Dark mode';
                  })()}</span>
                </div>
                {/* Toggle switch */}
                <div
                  className="relative w-[44px] h-[24px] rounded-full transition-colors"
                  style={{ background: (() => {
                    const isDark = darkMode === null
                      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                      : darkMode;
                    return isDark ? 'var(--accent)' : 'var(--border)';
                  })() }}
                >
                  <div
                    className="absolute top-[2px] w-[20px] h-[20px] rounded-full shadow transition-all"
                    style={{
                      left: (() => {
                        const isDark = darkMode === null
                          ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)
                          : darkMode;
                        return isDark ? '22px' : '2px';
                      })(),
                      background: 'var(--surface)',
                    }}
                  />
                </div>
              </button>
              {/* Vertical layout toggle */}
              <button
                onClick={() => {
                  const next = layoutDirection === 'LR' ? 'TB' : 'LR';
                  onLayoutDirectionChange?.(next);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] transition-colors cursor-pointer hover:bg-[var(--surface-hover)]"
                style={{ color: 'var(--foreground)' }}
              >
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {layoutDirection === 'TB' ? (
                      <><line x1="12" y1="2" x2="12" y2="22" /><polyline points="8 6 12 2 16 6" /><polyline points="8 18 12 22 16 18" /></>
                    ) : (
                      <><line x1="2" y1="12" x2="22" y2="12" /><polyline points="6 8 2 12 6 16" /><polyline points="18 8 22 12 18 16" /></>
                    )}
                  </svg>
                  <span>{layoutDirection === 'TB' ? 'Vertical' : 'Horizontal'}</span>
                </div>
                <div
                  className="relative w-[44px] h-[24px] rounded-full transition-colors"
                  style={{ background: layoutDirection === 'TB' ? 'var(--purple)' : 'var(--border)' }}
                >
                  <div
                    className="absolute top-[2px] w-[20px] h-[20px] rounded-full shadow transition-all"
                    style={{ left: layoutDirection === 'TB' ? '22px' : '2px', background: 'var(--surface)' }}
                  />
                </div>
              </button>
              {/* View mode selector */}
              <div className="px-4 py-2">
                <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">View</div>
                <div className="flex gap-1.5">
                  {([
                    { mode: '2d' as const, label: '2D', icon: 'M3 3h18v18H3V3z' },
                    { mode: '3d' as const, label: '3D', icon: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z' },
                    { mode: 'flowchart' as const, label: 'Flow', icon: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V15M9 21H5a2 2 0 0 1-2-2V15' },
                  ]).map(({ mode, label, icon }) => (
                    <button
                      key={mode}
                      onClick={() => onViewModeChange?.(mode)}
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer"
                      style={{
                        background: viewMode === mode ? 'var(--foreground)' : 'transparent',
                        color: viewMode === mode ? 'var(--surface)' : 'var(--muted)',
                        border: viewMode === mode ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={icon} />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shortcuts section */}
            <div className="px-3 py-3 border-t border-[var(--border)]">
              <div className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider px-4 mb-2">Shortcuts</div>
              {[
                { label: 'Command palette', keys: ['Cmd', 'K'] },
                { label: 'Generate', keys: ['Enter'] },
                { label: 'Stop / Cancel', keys: ['Esc'] },
                { label: 'Undo', keys: ['Cmd', 'Z'], soon: true },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 16px',
                    borderRadius: '8px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                    {s.label}
                    {s.soon && (
                      <span style={{ marginLeft: '6px', fontSize: '9px', color: 'var(--muted)', background: 'var(--border)', padding: '1px 5px', borderRadius: '4px' }}>
                        soon
                      </span>
                    )}
                  </span>
                  <span style={{ display: 'flex', gap: '3px' }}>
                    {s.keys.map((k, i) => (
                      <kbd
                        key={i}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-geist-mono), monospace',
                          fontWeight: 500,
                          color: 'var(--muted-foreground)',
                          background: 'var(--surface-hover)',
                          border: '1px solid var(--border)',
                          lineHeight: 1.4,
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </div>
              ))}
            </div>

            {/* Menu footer */}
            <div className="px-5 py-4 border-t border-[var(--border)]">
              <div className="text-[11px] text-[var(--muted)]">
                Foresight
              </div>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
  );
}
