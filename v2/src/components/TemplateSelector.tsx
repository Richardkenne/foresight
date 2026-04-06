'use client';

import { useState, useMemo, useEffect } from 'react';
import { TEMPLATES } from '@/lib/templates';

interface TemplateSelectorProps {
  onSelect: (key: string) => void;
  onClose: () => void;
}

interface CategoryDef {
  label: string;
  icon: React.ReactNode;
  keys: string[];
}

const ICO = (d: string) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const CATEGORIES: CategoryDef[] = [
  {
    label: 'Business',
    icon: ICO('M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9zM9 22V12h6v10'),
    keys: ['startup', 'cafe', 'saas', 'saas_scratch', 'ai_agency', 'dropshipping', 'buy_business', 'paid_community'],
  },
  {
    label: 'Money',
    icon: ICO('M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'),
    keys: ['money', 'side_hustle', 'affiliate_blog', 'crypto_journey'],
  },
  {
    label: 'Career',
    icon: ICO('M22 12h-4l-3 9L9 3l-3 9H2'),
    keys: ['freelance', 'upwork_freelance', 'content', 'youtube_guru'],
  },
  {
    label: 'Life',
    icon: ICO('M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'),
    keys: ['lose_weight', 'learn_skill', 'lend_money'],
  },
  {
    label: 'Tech',
    icon: ICO('M4 17l6-6-6-6M12 19h8'),
    keys: ['app'],
  },
  {
    label: 'Me',
    icon: ICO('M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8'),
    keys: ['richard_cafepedia', 'richard_break_pattern', 'richard_first_million', 'richard_leverage', 'richard_polymarket', 'richard_provider', 'richard_perfectionism', 'richard_faith_business', 'richard_move_abroad', 'richard_interfaith'],
  },
];

// Build full list with descriptions
const ALL_TEMPLATES = Object.entries(TEMPLATES).map(([key, t]) => ({
  key,
  title: t.title,
  desc: t.input,
}));

// Daily rotation: deterministic shuffle based on today's date
// Shows ~20 templates per day, different every day, cycles through all
function getDailyTemplates(templates: typeof ALL_TEMPLATES, count: number): typeof ALL_TEMPLATES {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Simple seeded shuffle (mulberry32)
  let s = seed;
  const rand = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const shuffled = [...templates].sort(() => rand() - 0.5);
  return shuffled.slice(0, count);
}

const DAILY_TEMPLATES = getDailyTemplates(ALL_TEMPLATES, 20);

export default function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // Categorize each template
  const categorizedKeys = useMemo(() => {
    const set = new Set<string>();
    CATEGORIES.forEach(c => c.keys.forEach(k => set.add(k)));
    return set;
  }, []);

  // Uncategorized templates go into "Other"
  const uncategorized = useMemo(() => {
    return ALL_TEMPLATES.filter(t => !categorizedKeys.has(t.key));
  }, [categorizedKeys]);

  const allCategories = useMemo(() => {
    const cats = [...CATEGORIES];
    if (uncategorized.length > 0) {
      cats.push({ label: 'Other', icon: ICO('M12 5v14M5 12h14'), keys: uncategorized.map(t => t.key) });
    }
    return cats;
  }, [uncategorized]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return ALL_TEMPLATES;
    const q = search.toLowerCase();
    return ALL_TEMPLATES.filter(t =>
      t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }, [search]);

  // Get templates for display
  // No search + no category = daily rotation (20 random templates)
  // Search or category = full list filtered
  const displayTemplates = useMemo(() => {
    if (activeCategory) {
      const cat = allCategories.find(c => c.label === activeCategory);
      if (cat) {
        const catTemplates = cat.keys
          .map(k => ALL_TEMPLATES.find(t => t.key === k))
          .filter(Boolean) as typeof ALL_TEMPLATES;
        if (!search.trim()) return catTemplates;
        const q = search.toLowerCase();
        return catTemplates.filter(t =>
          t.title.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
        );
      }
    }
    if (search.trim()) return filtered;
    // No search, no category → daily rotation
    return DAILY_TEMPLATES;
  }, [activeCategory, allCategories, filtered, search]);

  return (
    <div
      className="fixed z-[200]"
      onClick={(e) => e.stopPropagation()}
      style={{
        top: '64px',
        right: '8px',
        left: '8px',
        maxWidth: '480px',
        marginLeft: 'auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div
        className="bg-white dark:bg-[#141414] rounded-2xl overflow-hidden w-full max-h-[70vh] flex flex-col"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}
      >
        {/* Search */}
        <div className="p-4 sm:p-7">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              autoFocus
              className="w-full pl-11 pr-5 py-3 text-[14px] bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-gray-300 dark:focus:border-gray-700 focus:ring-1 focus:ring-gray-200 dark:focus:ring-gray-800 transition-all"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="px-4 sm:px-7 pb-3 sm:pb-4 flex gap-2 sm:gap-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory(null)}
            className="shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer"
            style={{
              background: !activeCategory ? 'rgba(59,130,246,0.1)' : 'transparent',
              color: !activeCategory ? '#3b82f6' : '#9ca3af',
              border: !activeCategory ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
            }}
          >
            All
          </button>
          {allCategories.map(cat => (
            <button
              key={cat.label}
              onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
              className="shrink-0 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                background: activeCategory === cat.label ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: activeCategory === cat.label ? '#3b82f6' : '#9ca3af',
                border: activeCategory === cat.label ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              }}
            >
              <span className="mr-1.5">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-gray-800/50" />

        {/* Template list */}
        <div className="overflow-y-auto flex-1 py-2 px-2 sm:px-3" style={{ scrollbarWidth: 'thin', maxHeight: 'calc(70vh - 160px)' }}>
          {displayTemplates.length === 0 && (
            <div className="py-8 text-center text-[13px] text-gray-400">
              No templates match your search.
            </div>
          )}
          {displayTemplates.map(({ key, title, desc }) => (
            <div
              key={key}
              className="group px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl cursor-pointer transition-all"
              onClick={() => { onSelect(key); onClose(); }}
              style={{ margin: '2px 0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {title}
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-400 transition-colors shrink-0 ml-3 opacity-0 group-hover:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <div className="text-[12px] text-gray-400 mt-1 line-clamp-1">{desc}</div>
            </div>
          ))}
        </div>

        {/* Footer count */}
        <div className="h-px bg-gray-100 dark:bg-gray-800/50" />
        <div className="px-4 sm:px-7 py-3 sm:py-4 text-center">
          <span className="text-[11px] text-gray-400">
            {!search.trim() && !activeCategory
              ? `Today's picks — ${displayTemplates.length} of ${ALL_TEMPLATES.length}`
              : `${displayTemplates.length} of ${ALL_TEMPLATES.length} templates`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
