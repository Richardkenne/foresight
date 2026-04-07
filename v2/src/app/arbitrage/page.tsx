'use client';

import { useState, useMemo } from 'react';
import {
  findArbitrageOpportunities,
  getArbitrageCategories,
  type ArbitrageOpportunity,
} from '@/lib/reality-arbitrage';

// ── SVG Icons (inline, no emoji) ──

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ArrowUpDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

// ── Category metadata ──

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  business: { label: 'Business', color: 'var(--accent)' },
  career: { label: 'Career', color: 'var(--purple)' },
  investment: { label: 'Investment', color: 'var(--success)' },
  lifestyle: { label: 'Lifestyle', color: 'var(--warning)' },
  geography: { label: 'Geography', color: 'var(--danger)' },
};

type SortMode = 'gap-desc' | 'gap-asc' | 'category';

// ── Gap Score Badge ──

function GapBadge({ score }: { score: number }) {
  const getColor = (s: number) => {
    if (s >= 9) return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' };
    if (s >= 7) return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)' };
    if (s >= 5) return { bg: 'rgba(16,185,129,0.12)', text: '#10b981', border: 'rgba(16,185,129,0.25)' };
    return { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.25)' };
  };
  const c = getColor(score);
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {score}/10
    </span>
  );
}

// ── Opportunity Card ──

function OpportunityCard({
  opp,
  onExpand,
}: {
  opp: ArbitrageOpportunity;
  onExpand: (id: string) => void;
}) {
  const cat = CATEGORY_META[opp.category];
  return (
    <div
      className="rounded-xl border p-4 transition-all group cursor-pointer"
      style={{
        background: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onClick={() => onExpand(opp.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = cat.color;
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'none';
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ background: `${cat.color}15`, color: cat.color }}
        >
          {cat.label}
        </span>
        <GapBadge score={opp.gapScore} />
      </div>

      {/* Title */}
      <h3 className="text-[13px] font-semibold mb-3 leading-tight">{opp.title}</h3>

      {/* Perception vs Reality */}
      <div className="space-y-2 mb-3">
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.1)' }}>
          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#ef4444' }}>
            Public Perception
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
            {opp.publicPerception}
          </p>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.1)' }}>
          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#10b981' }}>
            Data Reality
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--foreground)', opacity: 0.85 }}>
            {opp.dataReality}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          className="flex items-center gap-1.5 text-[11px] font-medium transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
          onClick={(e) => {
            e.stopPropagation();
            onExpand(opp.id);
          }}
        >
          <EyeIcon />
          Details
        </button>
        <a
          href={`/sim?scenario=${encodeURIComponent(opp.simulateScenario)}`}
          className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <PlayIcon />
          Simulate
        </a>
      </div>
    </div>
  );
}

// ── Detail Modal ──

function DetailModal({
  opp,
  onClose,
}: {
  opp: ArbitrageOpportunity;
  onClose: () => void;
}) {
  const cat = CATEGORY_META[opp.category];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: `${cat.color}15`, color: cat.color }}
            >
              {cat.label}
            </span>
            <GapBadge score={opp.gapScore} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <XIcon />
          </button>
        </div>

        <h2 className="text-[17px] font-bold mb-4 leading-tight">{opp.title}</h2>

        {/* Perception vs Reality */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#ef4444' }}>
              Public Perception
            </div>
            <p className="text-[12px] leading-relaxed">{opp.publicPerception}</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#10b981' }}>
              Data Reality
            </div>
            <p className="text-[12px] leading-relaxed">{opp.dataReality}</p>
          </div>
        </div>

        {/* Actionable */}
        <div className="rounded-xl p-4 mb-5" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
            Actionable Insight
          </div>
          <p className="text-[12px] leading-relaxed">{opp.actionable}</p>
        </div>

        {/* Opportunity */}
        <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--purple)' }}>
            The Opportunity
          </div>
          <p className="text-[12px] leading-relaxed">{opp.opportunity}</p>
        </div>

        {/* Evidence */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpenIcon />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>
              Evidence Sources
            </span>
          </div>
          <ul className="space-y-1.5">
            {opp.evidence.map((e, i) => (
              <li
                key={i}
                className="text-[11px] leading-relaxed pl-3"
                style={{ color: 'var(--muted-foreground)', borderLeft: '2px solid var(--border)' }}
              >
                {e}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <a
          href={`/sim?scenario=${encodeURIComponent(opp.simulateScenario)}`}
          className="flex items-center justify-center gap-2 w-full text-[13px] font-semibold py-3 rounded-xl transition-all"
          style={{
            background: 'var(--accent)',
            color: 'var(--accent-foreground)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent)')}
        >
          <PlayIcon />
          Simulate This Scenario
        </a>
      </div>
    </div>
  );
}

// ── Main Page ──

export default function ArbitragePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('gap-desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = getArbitrageCategories();
  const allOpportunities = findArbitrageOpportunities();

  const filtered = useMemo(() => {
    let results = activeCategory
      ? allOpportunities.filter((o) => o.category === activeCategory)
      : allOpportunities;

    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.publicPerception.toLowerCase().includes(q) ||
          o.dataReality.toLowerCase().includes(q) ||
          o.actionable.toLowerCase().includes(q)
      );
    }

    if (sortMode === 'gap-desc') results.sort((a, b) => b.gapScore - a.gapScore);
    else if (sortMode === 'gap-asc') results.sort((a, b) => a.gapScore - b.gapScore);
    else results.sort((a, b) => a.category.localeCompare(b.category));

    return results;
  }, [allOpportunities, activeCategory, search, sortMode]);

  const expandedOpp = expandedId
    ? allOpportunities.find((o) => o.id === expandedId) || null
    : null;

  const avgGap = allOpportunities.length
    ? (allOpportunities.reduce((s, o) => s + o.gapScore, 0) / allOpportunities.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 border-b" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <a
            href="/explore"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <ArrowLeftIcon />
          </a>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
              <ScaleIcon />
            </div>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight">Reality Arbitrage</h1>
              <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                See what others miss &mdash; {allOpportunities.length} opportunities, avg gap {avgGap}/10
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Hero */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
          <h2 className="text-[20px] font-bold mb-2 tracking-tight">
            Gaps Between Perception and Reality
          </h2>
          <p className="text-[13px] leading-relaxed max-w-2xl" style={{ color: 'var(--muted-foreground)' }}>
            The biggest opportunities hide in plain sight — where public perception diverges from data-backed reality.
            Every gap is an edge. Every edge is actionable. Click any card to see the evidence, then simulate the scenario.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="text-center">
              <div className="text-[20px] font-bold" style={{ color: 'var(--accent)' }}>{allOpportunities.length}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-[20px] font-bold" style={{ color: 'var(--danger)' }}>{avgGap}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Avg Gap Score</div>
            </div>
            <div className="text-center">
              <div className="text-[20px] font-bold" style={{ color: 'var(--success)' }}>{categories.length}</div>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Categories</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[12px] border outline-none transition-colors"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-[12px] border outline-none cursor-pointer"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
              }}
            >
              <option value="gap-desc">Gap: High to Low</option>
              <option value="gap-asc">Gap: Low to High</option>
              <option value="category">By Category</option>
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted)' }}>
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveCategory(null)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
            style={{
              background: !activeCategory ? 'var(--foreground)' : 'var(--surface)',
              color: !activeCategory ? 'var(--background)' : 'var(--muted-foreground)',
              borderColor: !activeCategory ? 'var(--foreground)' : 'var(--border)',
            }}
          >
            All ({allOpportunities.length})
          </button>
          {categories.map((cat) => {
            const meta = CATEGORY_META[cat.name];
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(isActive ? null : cat.name)}
                className="text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all"
                style={{
                  background: isActive ? `${meta.color}20` : 'var(--surface)',
                  color: isActive ? meta.color : 'var(--muted-foreground)',
                  borderColor: isActive ? meta.color : 'var(--border)',
                }}
              >
                {meta.label} ({cat.count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <div className="text-[11px] mb-3" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} {filtered.length === 1 ? 'opportunity' : 'opportunities'}
          {search && ` matching "${search}"`}
          {activeCategory && ` in ${CATEGORY_META[activeCategory].label}`}
        </div>

        {/* Card Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>
              No opportunities match your search. Try different keywords.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opp={opp}
                onExpand={setExpandedId}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {expandedOpp && (
        <DetailModal opp={expandedOpp} onClose={() => setExpandedId(null)} />
      )}
    </div>
  );
}
