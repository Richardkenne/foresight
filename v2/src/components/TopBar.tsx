'use client';

import { useRef, useState } from 'react';
import Button from './ui/Button';
import TemplateSelector from './TemplateSelector';

interface TopBarProps {
  scenario: string;
  onScenarioChange: (val: string) => void;
  hasNodes: boolean;
  generating: boolean;
  onGenerate: () => void;
  onLoadTemplate: (key: string) => void;
}

function Logo() {
  return (
    <div className="flex items-center gap-2 shrink-0 select-none">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-[var(--foreground)]">
        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.15" />
        <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[12px] font-semibold text-[var(--foreground)] tracking-[0.1em] hidden sm:block" style={{ fontFamily: 'var(--font-geist-mono), monospace' }}>
        SIMULATOR
      </span>
    </div>
  );
}

export default function TopBar({
  scenario, onScenarioChange, generating,
  onGenerate, onLoadTemplate,
}: TopBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div
      className="h-[48px] shrink-0 z-50 flex items-center gap-3 px-4 border-b border-[var(--border)]"
      style={{
        background: 'var(--surface)',
      }}
    >
      <Logo />

      <div className="w-px h-5 bg-[var(--border)] hidden sm:block" />

      {/* Scenario Input */}
      <div className="flex-1 relative min-w-0">
        <input
          ref={inputRef}
          className="w-full px-3 py-1.5 rounded-lg text-[13px] text-[var(--foreground)] placeholder-[var(--muted)] bg-transparent border border-transparent focus:border-[var(--border)] focus:bg-[var(--surface-hover)] outline-none transition-all"
          placeholder="Describe a scenario..."
          value={scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          disabled={generating}
        />
      </div>

      {/* Minimal actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowTemplates(!showTemplates); }}
            className="h-8 px-3 text-[11px] font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-lg transition-colors cursor-pointer"
          >
            Templates
          </button>
          {showTemplates && (
            <TemplateSelector
              onSelect={onLoadTemplate}
              onClose={() => setShowTemplates(false)}
            />
          )}
        </div>

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

      {showTemplates && (
        <div className="fixed inset-0 z-30" onClick={() => setShowTemplates(false)} />
      )}
    </div>
  );
}
