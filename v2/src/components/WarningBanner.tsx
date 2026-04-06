'use client';

import { useState, useMemo } from 'react';
import type { ProfileWarning } from '@/lib/profile-warnings';

interface WarningBannerProps {
  warnings: ProfileWarning[];
  onDismiss?: (id: string) => void;
}

// Lucide-style SVG icon paths
const ICON_PATHS = {
  'alert-triangle': 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  'alert-circle': 'M12 8v4m0 4h.01',
  info: 'M12 16v-4m0-4h.01',
  'chevron-down': 'M6 9l6 6 6-6',
  x: 'M18 6L6 18M6 6l12 12',
};

const SEVERITY_CONFIG = {
  critical: {
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
    color: '#ef4444',
    icon: 'alert-circle' as const,
    dotColor: '#ef4444',
  },
  warning: {
    bg: 'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    color: '#f59e0b',
    icon: 'alert-triangle' as const,
    dotColor: '#f59e0b',
  },
  info: {
    bg: 'rgba(59,130,246,0.06)',
    border: 'rgba(59,130,246,0.15)',
    color: '#3b82f6',
    icon: 'info' as const,
    dotColor: '#3b82f6',
  },
};

function SvgIcon({ name, size = 14, color }: { name: keyof typeof ICON_PATHS; size?: number; color?: string }) {
  const d = ICON_PATHS[name];
  if (name === 'alert-circle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d={d} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function WarningBanner({ warnings, onDismiss }: WarningBannerProps) {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = useMemo(
    () => warnings.filter(w => !dismissed.has(w.id)),
    [warnings, dismissed],
  );

  if (visible.length === 0) return null;

  const criticalCount = visible.filter(w => w.severity === 'critical').length;
  const warningCount = visible.filter(w => w.severity === 'warning').length;
  const infoCount = visible.filter(w => w.severity === 'info').length;

  // Determine banner color based on highest severity
  const highestSeverity = criticalCount > 0 ? 'critical' : warningCount > 0 ? 'warning' : 'info';
  const config = SEVERITY_CONFIG[highestSeverity];

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    onDismiss?.(id);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '88px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 45,
        width: 'min(520px, 90vw)',
        fontFamily: 'var(--font-geist-sans), Inter, system-ui, sans-serif',
      }}
    >
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '8px 14px',
          background: config.bg,
          border: `1px solid ${config.border}`,
          borderRadius: expanded ? '10px 10px 0 0' : '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SvgIcon name={config.icon} size={14} color={config.color} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--foreground)', letterSpacing: '-0.01em' }}>
            {visible.length} warning{visible.length !== 1 ? 's' : ''} found
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {criticalCount > 0 && (
              <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {criticalCount} CRITICAL
              </span>
            )}
            {warningCount > 0 && (
              <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: 'rgba(245,158,11,0.12)', color: '#f59e0b', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {warningCount} WARNING
              </span>
            )}
            {infoCount > 0 && (
              <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: 'rgba(59,130,246,0.12)', color: '#3b82f6', fontFamily: 'var(--font-geist-mono), monospace' }}>
                {infoCount} INFO
              </span>
            )}
          </div>
        </div>
        <div style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <SvgIcon name="chevron-down" size={12} color="var(--muted)" />
        </div>
      </button>

      {/* Expanded list */}
      {expanded && (
        <div
          style={{
            background: 'var(--surface)',
            border: `1px solid ${config.border}`,
            borderTop: 'none',
            borderRadius: '0 0 10px 10px',
            maxHeight: '280px',
            overflowY: 'auto',
            backdropFilter: 'blur(12px)',
          }}
        >
          {visible.map((w, i) => {
            const wConfig = SEVERITY_CONFIG[w.severity];
            return (
              <div
                key={w.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '10px 14px',
                  borderBottom: i < visible.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '1px' }}>
                  <SvgIcon name={wConfig.icon} size={13} color={wConfig.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '2px', lineHeight: 1.3 }}>
                    {w.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--muted-foreground)', lineHeight: 1.45 }}>
                    {w.message}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDismiss(w.id); }}
                  style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    color: 'var(--muted)',
                    transition: 'color 0.15s',
                    marginTop: '1px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; }}
                  title="Dismiss"
                >
                  <SvgIcon name="x" size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Small warning dot for ProfilePanel field indicators
 */
export function FieldWarningDot({ severity, tooltip }: { severity: 'critical' | 'warning'; tooltip?: string }) {
  const color = severity === 'critical' ? '#ef4444' : '#f59e0b';
  return (
    <span
      title={tooltip}
      style={{
        display: 'inline-block',
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: color,
        marginLeft: '4px',
        flexShrink: 0,
        cursor: tooltip ? 'help' : 'default',
      }}
    />
  );
}
