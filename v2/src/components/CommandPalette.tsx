'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TEMPLATES } from '@/lib/templates';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
  group: 'templates' | 'actions' | 'view';
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onLoadTemplate: (key: string) => void;
  onGenerate: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onToggleSacredMode: () => void;
  sacredMode: boolean;
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function TemplateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

function GenerateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SacredIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

// ─── Shortcut key display ─────────────────────────────────────────────────────

function ShortcutBadge({ keys }: { keys: string[] }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 }}>
      {keys.map((k, i) => (
        <kbd
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px var(--space-1)',
            borderRadius: '4px',
            fontSize: 'var(--text-xs)',
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
  );
}

// ─── Group label ──────────────────────────────────────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-2) var(--space-3) var(--space-1)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--muted)',
      }}
    >
      {label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CommandPalette({
  open,
  onClose,
  onLoadTemplate,
  onGenerate,
  onOpenHistory,
  onOpenProfile,
  onToggleSacredMode,
  sacredMode,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build command list
  const allCommands: Command[] = [
    // Actions
    {
      id: 'generate',
      label: 'Generate simulation',
      description: 'Run AI on your current scenario',
      shortcut: 'Enter',
      icon: <GenerateIcon />,
      action: () => { onClose(); onGenerate(); },
      group: 'actions',
    },
    {
      id: 'history',
      label: 'History',
      description: 'Browse past simulations',
      icon: <HistoryIcon />,
      action: () => { onClose(); onOpenHistory(); },
      group: 'actions',
    },
    {
      id: 'profile',
      label: 'Profile',
      description: 'Edit your profile and context',
      icon: <ProfileIcon />,
      action: () => { onClose(); onOpenProfile(); },
      group: 'actions',
    },
    {
      id: 'sacred',
      label: sacredMode ? 'Switch to Data mode' : 'Switch to Sacred mode',
      description: sacredMode ? 'Show statistical sources' : 'Show Bible + Quran overlays',
      icon: <SacredIcon />,
      action: () => { onClose(); onToggleSacredMode(); },
      group: 'view',
    },
    // Templates
    ...Object.entries(TEMPLATES).map(([key, tmpl]) => ({
      id: `tpl-${key}`,
      label: tmpl.title,
      description: tmpl.input,
      icon: <TemplateIcon />,
      action: () => { onClose(); onLoadTemplate(key); },
      group: 'templates' as const,
    })),
  ];

  // Filter by query
  const filtered = query.trim()
    ? allCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          (c.description || '').toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Focus input when opened, reset query
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) filtered[activeIndex].action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, activeIndex, onClose]
  );

  // Scroll active item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!open) return null;

  // Group filtered results
  const groups: Record<string, Command[]> = {};
  for (const cmd of filtered) {
    if (!groups[cmd.group]) groups[cmd.group] = [];
    groups[cmd.group].push(cmd);
  }
  const groupOrder = ['actions', 'view', 'templates'];
  const groupLabels: Record<string, string> = {
    actions: 'Actions',
    view: 'View',
    templates: 'Templates',
  };

  let flatIndex = 0; // track global index across groups

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'color-mix(in srgb, var(--foreground) 35%, transparent)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
        onClick={onClose}
      />

      {/* Palette */}
      <div
        style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2001,
          width: '100%',
          maxWidth: '480px',
          padding: '0 var(--space-4)',
        }}
      >
        <div
          style={{
            borderRadius: '16px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            boxShadow: '0 24px 64px color-mix(in srgb, var(--foreground) 16%, transparent), 0 4px 16px color-mix(in srgb, var(--foreground) 8%, transparent)',
            overflow: 'hidden',
            animation: 'palette-in 0.15s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-4) var(--space-4)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search commands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 'var(--text-md)',
                color: 'var(--foreground)',
                fontFamily: 'inherit',
              }}
              autoComplete="off"
              spellCheck={false}
            />
            <kbd
              style={{
                padding: '2px var(--space-2)',
                borderRadius: '5px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-geist-mono), monospace',
                color: 'var(--muted)',
                background: 'var(--surface-hover)',
                border: '1px solid var(--border)',
                flexShrink: 0,
              }}
            >
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div
            ref={listRef}
            style={{
              maxHeight: '360px',
              overflowY: 'auto',
              padding: 'var(--space-2) 0',
            }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: 'var(--space-6) var(--space-4)',
                  textAlign: 'center',
                  fontSize: 'var(--text-base)',
                  color: 'var(--muted)',
                }}
              >
                No results for &quot;{query}&quot;
              </div>
            ) : (
              groupOrder.map((groupKey) => {
                const cmds = groups[groupKey];
                if (!cmds || cmds.length === 0) return null;
                return (
                  <div key={groupKey}>
                    {!query && <GroupLabel label={groupLabels[groupKey]} />}
                    {cmds.map((cmd) => {
                      const currentIndex = flatIndex++;
                      const isActive = currentIndex === activeIndex;
                      return (
                        <div
                          key={cmd.id}
                          data-active={isActive ? 'true' : undefined}
                          onMouseEnter={() => setActiveIndex(currentIndex)}
                          onClick={cmd.action}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-2) var(--space-3)',
                            margin: '0 var(--space-2)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            background: isActive ? 'var(--surface-hover)' : 'transparent',
                            transition: 'background 0.1s ease',
                          }}
                        >
                          {/* Icon */}
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px',
                              background: isActive ? 'var(--border)' : 'var(--surface-hover)',
                              color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                              flexShrink: 0,
                            }}
                          >
                            {cmd.icon}
                          </span>

                          {/* Label + description */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 'var(--text-base)',
                                fontWeight: 500,
                                color: isActive ? 'var(--foreground)' : 'var(--foreground)',
                                lineHeight: 1.3,
                              }}
                            >
                              {cmd.label}
                            </div>
                            {cmd.description && (
                              <div
                                style={{
                                  fontSize: 'var(--text-sm)',
                                  color: 'var(--muted)',
                                  marginTop: '1px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {cmd.description}
                              </div>
                            )}
                          </div>

                          {/* Shortcut */}
                          {cmd.shortcut && (
                            <ShortcutBadge keys={[cmd.shortcut]} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div
            style={{
              padding: 'var(--space-2) var(--space-4)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              <ShortcutBadge keys={['↑', '↓']} />
              navigate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              <ShortcutBadge keys={['Enter']} />
              select
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
