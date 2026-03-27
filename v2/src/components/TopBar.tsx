'use client';

import { useRef, useState } from 'react';
import Button from './ui/Button';
import TemplateSelector from './TemplateSelector';

interface TopBarProps {
  scenario: string;
  onScenarioChange: (val: string) => void;
  hasNodes: boolean;
  simRunning: boolean;
  simPaused: boolean;
  generating: boolean;
  sacredMode: boolean;
  onGenerate: () => void;
  onLoadTemplate: (key: string) => void;
  onSimulate: () => void;
  onSimulateReverse: () => void;
  onTogglePause: () => void;
  onStop: () => void;
  onClear: () => void;
  onToggleSacredMode: () => void;
}

function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0 select-none">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[var(--accent)]">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.2" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[13px] font-bold text-[var(--foreground)] tracking-[0.08em] hidden sm:block">
        SIMULATOR
      </span>
    </div>
  );
}

export default function TopBar({
  scenario, onScenarioChange, hasNodes, simRunning, simPaused, generating, sacredMode,
  onGenerate, onLoadTemplate, onSimulate, onSimulateReverse, onTogglePause, onStop, onClear, onToggleSacredMode,
}: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div
      className="h-[56px] shrink-0 z-50 flex items-center gap-3 px-4 border-b border-[var(--border)]"
      style={{
        background: 'color-mix(in srgb, var(--surface) 85%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {/* Logo */}
      <Logo />

      {/* Separator */}
      <div className="w-px h-6 bg-[var(--border)] hidden sm:block" />

      {/* Scenario Input */}
      <div className="flex-1 relative min-w-0">
        <input
          ref={inputRef}
          className="w-full px-3 py-1.5 rounded-lg text-[13px] text-[var(--foreground)] placeholder-[var(--muted)] bg-transparent border border-transparent focus:border-[var(--border)] focus:bg-[var(--surface)] focus:ring-1 focus:ring-[var(--accent)]/20 outline-none transition-all"
          placeholder="Describe a scenario... e.g. 'I want to open a cafe in Indonesia'"
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={generating}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Templates */}
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
          >
            <span className="hidden sm:inline">Templates</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:hidden">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </Button>
          {showTemplates && (
            <TemplateSelector
              onSelect={onLoadTemplate}
              onClose={() => setShowTemplates(false)}
            />
          )}
        </div>

        {/* Generate */}
        <Button
          variant="primary"
          size="sm"
          onClick={onGenerate}
          disabled={generating || !scenario.trim()}
          loading={generating}
        >
          {generating ? 'Generating...' : 'Generate'}
        </Button>

        {/* Sacred Mode toggle */}
        {hasNodes && (
          <>
            <div className="w-px h-5 bg-[var(--border)]" />
            <Button
              variant={sacredMode ? 'primary' : 'ghost'}
              size="sm"
              onClick={onToggleSacredMode}
              title={sacredMode ? 'Switch to Data View' : 'Switch to Sacred View'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="hidden sm:inline ml-1">{sacredMode ? 'Sacred' : 'Data'}</span>
            </Button>
          </>
        )}

        {/* Separator */}
        {hasNodes && <div className="w-px h-5 bg-[var(--border)]" />}

        {/* Simulation controls */}
        {simRunning ? (
          <>
            <Button variant="warning" size="sm" onClick={onTogglePause}>
              {simPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="danger" size="sm" onClick={onStop}>
              Stop
            </Button>
          </>
        ) : (
          <>
            {hasNodes && (
              <>
                <Button variant="primary" size="sm" onClick={onSimulate}>
                  Simulate
                </Button>
                <Button variant="purple" size="sm" onClick={onSimulateReverse} title="Reverse simulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14L4 9l5-5" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                  </svg>
                </Button>
                <Button variant="ghost" size="sm" onClick={onClear} title="Clear">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Click outside to close templates */}
      {showTemplates && (
        <div className="fixed inset-0 z-30" onClick={() => setShowTemplates(false)} />
      )}
    </div>
  );
}
