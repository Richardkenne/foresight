'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHistory, deleteHistoryEntry, clearHistory, type HistoryEntry } from '@/lib/history';

interface HistoryPanelProps {
  onSelect: (entry: HistoryEntry) => void;
  onBack: () => void;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryPanel({ onSelect, onBack }: HistoryPanelProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setEntries(getHistory());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteHistoryEntry(id);
    refresh();
  };

  const handleClear = () => {
    clearHistory();
    refresh();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with back button */}
      <div className="h-[56px] flex items-center gap-3 px-5 border-b border-[var(--border)] shrink-0">
        <button
          onClick={onBack}
          className="h-9 w-9 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[14px] font-semibold text-[var(--foreground)]">History</span>
        <span className="text-[10px] text-[var(--muted)] ml-auto">
          {entries.length} simulation{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Entries list */}
      <div className="flex-1 overflow-y-auto py-2 px-3" style={{ scrollbarWidth: 'thin' }}>
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-40">
              <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <div className="text-[13px] text-[var(--muted-foreground)] font-medium mb-1">No simulations yet</div>
            <div className="text-[11px] text-[var(--muted)]">Generate one to get started.</div>
          </div>
        )}

        {entries.map((entry) => {
          const isHovered = hoveredId === entry.id;
          return (
            <div
              key={entry.id}
              className="group px-3 py-3 rounded-lg cursor-pointer transition-all"
              style={{
                background: isHovered ? 'var(--surface-hover)' : 'transparent',
                marginBottom: 2,
              }}
              onClick={() => onSelect(entry)}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start gap-2.5">
                {/* Thumbnail */}
                {entry.photoThumbnail ? (
                  <div className="shrink-0 w-[36px] h-[36px] rounded-md overflow-hidden border border-[var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={entry.photoThumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="shrink-0 w-[36px] h-[36px] rounded-md border border-[var(--border)] flex items-center justify-center" style={{ background: 'var(--surface)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] text-[var(--foreground)] font-medium truncate leading-tight">
                    {entry.scenario}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[var(--muted)]" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
                      {formatTimestamp(entry.timestamp)}
                    </span>
                    {entry.flowData?.nodes && (
                      <span className="text-[10px] text-[var(--muted)]">
                        {(entry.flowData.nodes as unknown[]).length} nodes
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {entry.tags && Object.values(entry.tags).some(Boolean) && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(entry.tags).filter(([, v]) => v).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-[9px] font-medium px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(59,130,246,0.08)',
                            color: '#3b82f6',
                            border: '1px solid rgba(59,130,246,0.12)',
                          }}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, entry.id)}
                  className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {entries.length > 0 && (
        <div className="shrink-0 px-5 py-3 border-t border-[var(--border)]">
          <button
            onClick={handleClear}
            className="w-full text-center text-[11px] text-[var(--muted)] hover:text-red-500 transition-colors cursor-pointer py-1.5 rounded-md hover:bg-red-500/5"
          >
            Clear all history
          </button>
        </div>
      )}
    </div>
  );
}
