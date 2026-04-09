'use client';

/**
 * AttachmentChips — source chips (audio, photo, url, pdf, video)
 *
 * SPERIMENTA QUI:
 * - padding container (px-2 sm:px-6 py-2)
 * - gap tra chips (gap-2, gap-2)
 * - dimensione chip (text-[11px], text-[12px])
 * - border-radius chip (rounded-md, rounded-lg, rounded-full)
 * - max-width label (max-w-[120px], max-w-[160px])
 */

import type { ReactNode } from 'react';
import type { Attachment } from '../TopBar';

interface AttachmentChipsProps {
  attachments: Attachment[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

/* Icon paths per attachment type */
const ICON_PATHS: Record<string, ReactNode> = {
  audio: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /></>,
  photo: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  url: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  pdf: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  video: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M10 9l5 3-5 3V9z" /></>,
};

export default function AttachmentChips({ attachments, onRemove, onClearAll }: AttachmentChipsProps) {
  if (attachments.length === 0) return null;

  return (
    <div
      className="flex items-center gap-2 sm:gap-2 px-2 sm:px-6 py-2 border-t border-[var(--border)] overflow-x-auto"
      style={{ background: 'var(--surface)', scrollbarWidth: 'none' }}
    >
      <span className="text-[10px] sm:text-[11px] text-[var(--muted)] font-medium shrink-0">
        Sources:
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center gap-2 pl-2 pr-1 py-0.5 rounded-md text-[11px] font-medium border"
            style={{
              background: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
              color: 'var(--accent)',
            }}
          >
            {att.type === 'photo' && att.preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={att.preview} alt="" className="w-4 h-4 rounded object-cover shrink-0" />
            )}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              {ICON_PATHS[att.type]}
            </svg>
            <span className="max-w-[120px] truncate">{att.label}</span>
            <button
              onClick={() => onRemove(att.id)}
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
          onClick={onClearAll}
          className="text-[10px] text-[var(--muted)] hover:text-[var(--foreground)] px-1"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
