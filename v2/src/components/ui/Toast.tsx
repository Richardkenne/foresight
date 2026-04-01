'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

// ─── Global state ───────────────────────────────────────────────────────────

type Listener = (toasts: ToastItem[]) => void;
let toasts: ToastItem[] = [];
let nextId = 1;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((fn) => fn([...toasts]));
}

function addToast(type: ToastType, message: string) {
  const id = nextId++;
  toasts = [...toasts, { id, type, message }];
  notify();

  // Start exit animation after 2.7s, remove at 3s
  setTimeout(() => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t));
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, 300);
  }, 2700);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export const toast = {
  success: (message: string) => addToast('success', message),
  error: (message: string) => addToast('error', message),
  info: (message: string) => addToast('info', message),
};

// ─── Icons ──────────────────────────────────────────────────────────────────

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─── Toast item component ────────────────────────────────────────────────────

const COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: '#16a34a',
    text: '#15803d',
  },
  error: {
    bg: '#fef2f2',
    border: '#fecaca',
    icon: '#dc2626',
    text: '#b91c1c',
  },
  info: {
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: '#2563eb',
    text: '#1d4ed8',
  },
};

// Dark mode colors (used when data-theme="dark" or prefers-color-scheme: dark)
const DARK_COLORS: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
  success: {
    bg: '#052e16',
    border: '#166534',
    icon: '#4ade80',
    text: '#86efac',
  },
  error: {
    bg: '#2d0a0a',
    border: '#7f1d1d',
    icon: '#f87171',
    text: '#fca5a5',
  },
  info: {
    bg: '#0c1a3d',
    border: '#1e3a8a',
    icon: '#60a5fa',
    text: '#93c5fd',
  },
};

function ToastItemComponent({ item, onDismiss }: { item: ToastItem; onDismiss: (id: number) => void }) {
  const colors = COLORS[item.type];
  const darkColors = DARK_COLORS[item.type];

  const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: '280px',
    maxWidth: '360px',
    padding: '12px 14px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    background: colors.bg,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    cursor: 'pointer',
    userSelect: 'none' as const,
    animation: item.exiting
      ? 'toast-slide-out 0.3s cubic-bezier(0.4,0,1,1) forwards'
      : 'toast-slide-in 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
  };

  return (
    <div
      style={style}
      className="toast-item"
      data-type={item.type}
      onClick={() => onDismiss(item.id)}
    >
      <span style={{ color: colors.icon, flexShrink: 0 }}>
        {item.type === 'success' && <SuccessIcon />}
        {item.type === 'error' && <ErrorIcon />}
        {item.type === 'info' && <InfoIcon />}
      </span>
      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: colors.text,
          lineHeight: '1.4',
        }}
      >
        {item.message}
      </span>
    </div>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>([]);
  const mountedRef = useRef(false);

  const handleDismiss = useCallback((id: number) => {
    toasts = toasts.map((t) => (t.id === id ? { ...t, exiting: true } : t));
    notify();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notify();
    }, 300);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const listener: Listener = (updated) => {
      if (mountedRef.current) setItems(updated);
    };
    listeners.add(listener);
    return () => {
      mountedRef.current = false;
      listeners.delete(listener);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {items.map((item) => (
        <div key={item.id} style={{ pointerEvents: 'auto' }}>
          <ToastItemComponent item={item} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  );
}
