'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type SimMode, MODE_CONFIG, CREATE_MODES, ANALYZE_MODES, canActivateMode } from '@/lib/sim-modes';

interface ModeSelectorProps {
  activeMode: SimMode;
  onModeChange: (mode: SimMode) => void;
  hasNodes: boolean;
}

function ModeIcon({ d }: { d: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function ModeTooltip({ mode }: { mode: SimMode }) {
  const cfg = MODE_CONFIG[mode];
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none"
      style={{ width: 260 }}
    >
      <div
        className="rounded-lg px-3 py-2.5 text-left"
        style={{
          background: 'var(--surface)',
          border: '1px solid color-mix(in srgb, var(--foreground) 12%, transparent)',
          boxShadow: '0 8px 24px color-mix(in srgb, var(--foreground) 15%, transparent)',
        }}
      >
        <div
          className="text-[11px] font-semibold mb-1 text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          {cfg.label}
        </div>
        <div className="text-[10px] leading-[1.5] text-[var(--muted-foreground)] mb-1.5">
          {cfg.description}
        </div>
        <div
          className="text-[9px] italic text-[var(--muted)]"
          style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
        >
          {cfg.example}
        </div>
      </div>
    </motion.div>
  );
}

export default function ModeSelector({ activeMode, onModeChange, hasNodes }: ModeSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [hoveredMode, setHoveredMode] = useState<SimMode | null>(null);

  // Update indicator position when activeMode changes
  useEffect(() => {
    const el = itemRefs.current[activeMode];
    const container = containerRef.current;
    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [activeMode]);

  const renderGroup = (modes: SimMode[]) =>
    modes.map((mode) => {
      const cfg = MODE_CONFIG[mode];
      const disabled = !canActivateMode(mode, hasNodes);
      const active = mode === activeMode;

      return (
        <div key={mode} className="relative">
          <button
            ref={(el) => { itemRefs.current[mode] = el; }}
            onClick={() => !disabled && onModeChange(mode)}
            onMouseEnter={() => setHoveredMode(mode)}
            onMouseLeave={() => setHoveredMode(null)}
            disabled={disabled}
            className={`
              mode-tab relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-md
              text-[11px] font-medium uppercase tracking-[0.08em] whitespace-nowrap
              transition-colors duration-150
              ${active ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}
              ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:text-[var(--foreground)]'}
            `}
            style={{ fontFamily: 'var(--font-geist-mono), monospace' }}
          >
            <ModeIcon d={cfg.icon} />
            <span className="hidden sm:inline">{cfg.shortLabel}</span>
          </button>
          <AnimatePresence>
            {hoveredMode === mode && <ModeTooltip mode={mode} />}
          </AnimatePresence>
        </div>
      );
    });

  return (
    <div
      className="mode-selector flex items-center gap-0.5 px-1 py-0.5 rounded-lg"
      style={{
        background: 'var(--surface)',
        border: '1px solid color-mix(in srgb, var(--foreground) 8%, transparent)',
        height: 34,
      }}
      ref={containerRef}
    >
      {/* CREATE group */}
      {renderGroup(CREATE_MODES)}

      {/* Divider */}
      <div
        className="mx-1 self-stretch"
        style={{
          width: 1,
          background: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
          marginTop: 6,
          marginBottom: 6,
        }}
      />

      {/* ANALYZE group */}
      {renderGroup(ANALYZE_MODES)}

      {/* Sliding indicator */}
      {indicator.width > 0 && (
        <motion.div
          className="absolute rounded-md"
          style={{
            background: 'color-mix(in srgb, var(--foreground) 6%, transparent)',
            height: 28,
            zIndex: 0,
          }}
          animate={{ left: indicator.left, width: indicator.width }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </div>
  );
}
