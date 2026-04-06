import type { Template } from '../templates';

export const richardTemplates: Record<string, Template> = {
  richard_cafepedia: {
    title: 'Cafepedia to Revenue',
    input: 'A solo founder in Indonesia builds a cafe search engine and tries to monetize it',
    nodes: [
      { id: 1, type: 'start', label: 'Build the product (done)', x: 0, y: 120, prob: 100, desc: '764K places in DB, 3,386 enriched — product exists', source: 'Cafepedia internal', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Get first 10 paying cafes', x: 260, y: 120, prob: 15, desc: 'B2B cold outreach: 1-5% conversion rate typical', source: 'HubSpot 2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Zero revenue — again', x: 260, y: 320, prob: 100, desc: 'Pattern: perfect product, zero clients — must break this cycle', source: 'Personal history', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 4, type: 'action', label: 'Walk into cafes, pitch in person', x: 520, y: 120, prob: 100, desc: 'In-person B2B close rate: 25-40% vs 1-5% cold email', source: 'RAIN Group', sacredRoots: ['SR-009', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Cafe owner says yes?', x: 780, y: 120, prob: 35, desc: 'Indonesian SMBs: 300K IDR/mo is budget dust, but trust is everything', source: 'Local market', sacredRoots: ['SR-026', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'Not interested / no budget', x: 780, y: 320, prob: 100, desc: '65% of SMBs say no to first pitch', source: 'Sales benchmark', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 7, type: 'bottleneck', label: 'Reach 50 paying cafes', x: 1040, y: 120, prob: 30, desc: '50 x 300K = 15M IDR/mo — covers basic costs', source: 'Revenue model', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 8, type: 'outcome-bad', label: 'Stuck at 5-10 clients', x: 1040, y: 320, prob: 100, desc: 'Most local SaaS plateau early without sales system', source: 'Estimated', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 9, type: 'outcome-good', label: 'Sustainable local business', x: 1300, y: 60, prob: 100, desc: '200+ cafes = 60M IDR/mo — real business', source: 'Revenue target', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 10, type: 'outcome-bad', label: 'Another project that dies', x: 1300, y: 280, prob: 100, desc: 'Trading, Perth Alert, Deal Engine — all built, zero revenue', source: 'Personal pattern', sacredRoots: ['SR-005', 'SR-006'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5 }, { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 7, to: 10, label: 'fail' },
    ]
  },
  richard_move_abroad: {
    title: 'Move Abroad Solo (Italy to Asia)',
    input: 'An Italian moves alone to Southeast Asia to build a life',
    nodes: [
      { id: 1, type: 'desire', label: 'Want a different life', x: 0, y: 120, prob: 100, desc: '4.5M Italians live abroad, fastest-growing diaspora', source: 'AIRE 2024', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'bottleneck', label: 'Actually leave comfort zone', x: 260, y: 120, prob: 12, desc: '88% of people who "want to move" never do', source: 'Gallup World Poll', sacredRoots: ['SR-001', 'SR-008'] },
      { id: 3, type: 'outcome-bad', label: 'Still dreaming in 5 years', x: 260, y: 320, prob: 100, desc: 'Comfort zone wins for the majority', source: 'Behavioral economics', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 4, type: 'action', label: 'Land in new country, figure it out', x: 520, y: 120, prob: 100, desc: 'First 90 days: visa, housing, language, loneliness', source: 'Expat surveys', sacredRoots: ['SR-001', 'SR-009'] },
      { id: 5, type: 'bottleneck', label: 'Build income stream abroad', x: 780, y: 120, prob: 30, desc: '70% of expats struggle financially in first 2 years', source: 'HSBC Expat Survey', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'Forced to go back home', x: 780, y: 320, prob: 100, desc: '25% of expats return within 2 years', source: 'InterNations 2024', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 7, type: 'decision', label: 'Found community + purpose?', x: 1040, y: 120, prob: 45, desc: 'Social integration is #1 predictor of expat success', source: 'InterNations', sacredRoots: ['SR-025', 'SR-016'] },
      { id: 8, type: 'outcome-good', label: 'Built a real life abroad', x: 1300, y: 60, prob: 100, desc: 'The 15% who make it call it the best decision ever', source: 'Expat surveys', sacredRoots: ['SR-025', 'SR-001'] },
      { id: 9, type: 'outcome-bad', label: 'Isolated and stuck', x: 1300, y: 280, prob: 100, desc: 'Expat loneliness: 50% report feeling more alone than back home', source: 'InterNations 2024', sacredRoots: ['SR-025', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5 }, { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  richard_interfaith: {
    title: 'Interfaith Relationship',
    input: 'A Christian man and a Muslim woman try to build a future together',
    nodes: [
      { id: 1, type: 'start', label: 'Fall in love across faiths', x: 0, y: 120, prob: 100, desc: 'Interfaith couples: 21% of marriages in Indonesia', source: 'Pew Research 2023', sacredRoots: ['SR-020', 'SR-001'] },
      { id: 2, type: 'bottleneck', label: 'Family acceptance?', x: 260, y: 120, prob: 40, desc: '60% of interfaith couples face family opposition initially', source: 'ISSP data', sacredRoots: ['SR-025', 'SR-030'] },
      { id: 3, type: 'outcome-bad', label: 'Family says no, pressure wins', x: 260, y: 320, prob: 100, desc: 'In collectivist cultures, family pressure breaks 50%+ of couples', source: 'Cross-cultural studies', sacredRoots: ['SR-025', 'SR-003'] },
      { id: 4, type: 'decision', label: 'Navigate legal/religious requirements', x: 520, y: 120, prob: 50, desc: 'Indonesia requires same-religion marriage — legal complexity', source: 'Indonesian Marriage Law', sacredRoots: ['SR-003', 'SR-017'] },
      { id: 5, type: 'outcome-bad', label: 'Legal barriers too high', x: 520, y: 320, prob: 100, desc: 'Many couples marry abroad to bypass local law', source: 'Legal practice', sacredRoots: ['SR-003', 'SR-021'] },
      { id: 6, type: 'bottleneck', label: 'Sustain mutual respect long-term', x: 780, y: 120, prob: 55, desc: 'Interfaith marriages that survive 10+ years: ~55%', source: 'Pew Research', sacredRoots: ['SR-030', 'SR-020'] },
      { id: 7, type: 'outcome-bad', label: 'Values diverge over time', x: 780, y: 320, prob: 100, desc: 'Children, holidays, identity — the pressure compounds', source: 'Marriage studies', sacredRoots: ['SR-026', 'SR-001'] },
      { id: 8, type: 'outcome-good', label: 'Beautiful bridge between worlds', x: 1040, y: 60, prob: 100, desc: 'Successful interfaith couples report higher empathy and resilience', source: 'Gottman Institute', sacredRoots: ['SR-020', 'SR-029'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 6, label: 'yes' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
  richard_break_pattern: {
    title: 'Break the "Build but Never Sell" Pattern',
    input: 'Someone who always builds perfect products but never makes money from them',
    nodes: [
      { id: 1, type: 'start', label: 'New idea excites you', x: 0, y: 120, prob: 100, desc: '90% of entrepreneurs are addicted to the building phase', source: 'Behavioral research', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 2, type: 'action', label: 'Research obsessively, plan perfectly', x: 260, y: 120, prob: 100, desc: 'Analysis paralysis: avg entrepreneur spends 6 months planning', source: 'GEM Report', sacredRoots: ['SR-014', 'SR-017'] },
      { id: 3, type: 'action', label: 'Build an impressive product', x: 520, y: 120, prob: 100, desc: 'Technical founders spend 80% time building, 20% selling', source: 'First Round Review', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 4, type: 'gate', label: 'Start selling? (the hard part)', x: 780, y: 120, prob: 20, desc: 'Only 20% of builders ever do real sales outreach', source: 'Indie Hackers survey', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 5, type: 'outcome-bad', label: 'Beautiful product, zero clients', x: 780, y: 320, prob: 100, desc: 'The graveyard of perfect products nobody uses', source: 'Pattern recognition', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 9, type: 'state', label: 'Made pitches, polite rejections, no revenue', x: 780, y: 270, prob: 100, desc: 'Sending DMs, getting "interesting!" replies, but no one pulls out their wallet — rejection in slow motion', source: 'Indie Hackers survey', sacredRoots: ['SR-010', 'SR-009'] },
      { id: 10, type: 'bottleneck', label: 'Closes a real deal?', x: 1040, y: 270, prob: 20, desc: 'Polite interest is not sales pipeline — most builders never learn to close', source: 'Pattern analysis', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 11, type: 'outcome-bad', label: 'Stuck in pitch-rejection loop', x: 1040, y: 420, prob: 100, desc: 'Pitching the same way, getting the same result, wondering if the problem is you', source: 'RAIN Group', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 6, type: 'bottleneck', label: 'Handle rejection daily', x: 1040, y: 120, prob: 35, desc: 'Sales requires 50+ "no" before patterns emerge', source: 'RAIN Group', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 7, type: 'outcome-bad', label: 'Quit after 10 rejections', x: 1040, y: 320, prob: 100, desc: '65% of salespeople give up after 5 contacts', source: 'Marketing Donut', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 8, type: 'outcome-good', label: 'First revenue — pattern broken', x: 1300, y: 60, prob: 100, desc: 'The first dollar is the hardest — then compounding kicks in', source: 'YC wisdom', sacredRoots: ['SR-005', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 9, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 9, to: 10 }, { from: 10, to: 6, label: 'pass' }, { from: 10, to: 11, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
  richard_first_million: {
    title: 'Path to First $100K from Indonesia',
    input: 'A young entrepreneur in Indonesia tries to reach $100K in savings',
    nodes: [
      { id: 1, type: 'start', label: 'Start from near-zero in a low-cost country', x: 0, y: 120, prob: 100, desc: 'Indonesia avg salary: $300-500/mo — need leverage', source: 'BPS 2024', sacredRoots: ['SR-009', 'SR-007'] },
      { id: 2, type: 'decision', label: 'Earn in USD, spend in IDR?', x: 260, y: 120, prob: 60, desc: 'Geo-arbitrage: 1 USD = 16,000 IDR — 5-10x purchasing power', source: 'Exchange rate', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 3, type: 'outcome-bad', label: 'Stuck in local salary trap', x: 260, y: 320, prob: 100, desc: 'Local salary max for most: 10-20M IDR/mo ($625-1250)', source: 'Glassdoor ID', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 4, type: 'gate', label: 'Build $2K/mo income stream', x: 520, y: 120, prob: 25, desc: '$2K/mo from Indonesia = top 5% lifestyle', source: 'Cost of living data', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Inconsistent gig income', x: 520, y: 320, prob: 100, desc: '75% of remote workers from developing countries earn <$1K/mo', source: 'Payoneer 2024', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 11, type: 'state', label: 'Making $1-1.5K/mo inconsistently', x: 520, y: 270, prob: 100, desc: 'Some months $1.5K, some months $400 — cant plan, cant relax, cant commit', source: 'Cost of living data', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Stabilizes at $2K+?', x: 780, y: 270, prob: 20, desc: 'Inconsistent income usually means no system — just hustle that burns out', source: 'Pattern analysis', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 13, type: 'outcome-bad', label: 'Forever in $1K/mo limbo', x: 780, y: 420, prob: 100, desc: 'Not poor enough to panic, not rich enough to breathe — the invisible trap', source: 'Digital nomad surveys', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 6, type: 'bottleneck', label: 'Scale to $5K+/mo', x: 780, y: 120, prob: 30, desc: 'From $2K to $5K requires systems, not just hustle', source: 'Indie Hackers', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 7, type: 'outcome-bad', label: 'Plateau at $2-3K/mo', x: 780, y: 320, prob: 100, desc: 'Comfortable but not building wealth — lifestyle trap', source: 'Digital nomad surveys', sacredRoots: ['SR-013', 'SR-014'] },
      { id: 8, type: 'decision', label: 'Save 50%+ consistently?', x: 1040, y: 120, prob: 40, desc: 'At $5K/mo saving $3K = $100K in ~3 years', source: 'Math', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: '$100K saved — freedom', x: 1300, y: 60, prob: 100, desc: '$100K in Indonesia = 5+ years of runway or investment capital', source: 'Financial planning', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 10, type: 'outcome-bad', label: 'Lifestyle inflation eats savings', x: 1300, y: 280, prob: 100, desc: 'Parkinson law of money: spending expands to match income', source: 'Behavioral finance', sacredRoots: ['SR-013', 'SR-011'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 11, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 6, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  richard_perfectionism: {
    title: 'Perfectionism Trap',
    input: 'Someone with high standards keeps polishing instead of shipping',
    nodes: [
      { id: 1, type: 'start', label: 'High standards, big vision', x: 0, y: 120, prob: 100, desc: 'Perfectionism rising: 33% increase in young people since 1989', source: 'APA 2023', sacredRoots: ['SR-009', 'SR-008'] },
      { id: 2, type: 'action', label: 'Work obsessively on details', x: 260, y: 120, prob: 100, desc: 'Perfectionists spend 2-3x longer on tasks vs "good enough"', source: 'Psychology Today', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 3, type: 'bottleneck', label: 'Ship before it feels ready?', x: 520, y: 120, prob: 25, desc: '"If you are not embarrassed by v1, you launched too late" — Reid Hoffman', source: 'LinkedIn founder', sacredRoots: ['SR-009', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'Never ships — eternal WIP', x: 520, y: 320, prob: 100, desc: '75% of side projects never see the light of day', source: 'Dev surveys', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 5, type: 'bottleneck', label: 'Handle imperfect feedback', x: 780, y: 120, prob: 50, desc: 'First users always find problems — can you not take it personally?', source: 'Product management', sacredRoots: ['SR-009', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'One critique, back to hiding', x: 780, y: 320, prob: 100, desc: 'Perfectionists interpret feedback as personal failure', source: 'CBT research', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 7, type: 'outcome-good', label: 'Iterate fast, improve from feedback', x: 1040, y: 60, prob: 100, desc: 'Speed of iteration beats quality of iteration', source: 'Eric Ries, Lean Startup', sacredRoots: ['SR-036', 'SR-009'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
    ]
  },
  richard_faith_business: {
    title: 'Kingdom Economics: Faith + Business',
    input: 'A Christian entrepreneur tries to honor God while building wealth',
    nodes: [
      { id: 1, type: 'start', label: 'Called to build, not just survive', x: 0, y: 120, prob: 100, desc: '"Whatever you do, work at it with all your heart" — Colossians 3:23', source: 'Bible', sacredRoots: ['SR-003', 'SR-016'] },
      { id: 2, type: 'decision', label: 'Serve people or chase money?', x: 260, y: 120, prob: 65, desc: 'Purpose-driven companies outperform market by 400%', source: 'Firms of Endearment study', sacredRoots: ['SR-032', 'SR-013'] },
      { id: 3, type: 'outcome-bad', label: 'Greed corrupts the mission', x: 260, y: 320, prob: 100, desc: '"For the love of money is a root of all evil" — 1 Timothy 6:10', source: 'Bible', sacredRoots: ['SR-002', 'SR-013'] },
      { id: 4, type: 'bottleneck', label: 'Stay ethical when it costs money', x: 520, y: 120, prob: 50, desc: '50% of entrepreneurs face ethical dilemma in first 2 years', source: 'HBS research', sacredRoots: ['SR-015', 'SR-023'] },
      { id: 5, type: 'outcome-bad', label: 'Compromise values for profit', x: 520, y: 320, prob: 100, desc: 'Short-term gain, long-term regret — trust destroyed', source: 'Edelman Trust', sacredRoots: ['SR-015', 'SR-023'] },
      { id: 6, type: 'bottleneck', label: 'Generosity while bootstrapping?', x: 780, y: 120, prob: 40, desc: 'Tithing entrepreneurs report higher satisfaction and growth', source: 'Generous Giving study', sacredRoots: ['SR-024', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'Scarcity mindset blocks giving', x: 780, y: 320, prob: 100, desc: 'Fear of not having enough kills generosity', source: 'Psychology research', sacredRoots: ['SR-024', 'SR-001'] },
      { id: 8, type: 'outcome-good', label: 'Wealth as a tool for good', x: 1040, y: 60, prob: 100, desc: '"Rich in good works, generous, ready to share" — 1 Timothy 6:18', source: 'Bible', sacredRoots: ['SR-024', 'SR-032'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
  richard_provider: {
    title: 'Become a Provider Before 30',
    input: 'A young man abroad tries to become financially stable enough to provide for his family',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to provide and protect', x: 0, y: 120, prob: 100, desc: '72% of men cite "providing" as core to their identity', source: 'Pew Research 2023', sacredRoots: ['SR-020', 'SR-019'] },
      { id: 2, type: 'gate', label: 'Find reliable income abroad', x: 260, y: 120, prob: 35, desc: '65% of young expats struggle with stable income first 2 years', source: 'HSBC Expat', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Dependent on others — shame spiral', x: 260, y: 320, prob: 100, desc: 'Financial dependence linked to depression in men', source: 'APA studies', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 9, type: 'state', label: 'Making $1.5-2.5K/mo inconsistently', x: 260, y: 270, prob: 100, desc: 'Some months feel rich, some months count every rupiah — cant plan a life on this', source: 'HSBC Expat', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 10, type: 'bottleneck', label: 'Stabilizes income?', x: 520, y: 270, prob: 20, desc: 'Inconsistent foreign income is the norm, not the exception — few break through', source: 'Pattern analysis', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 11, type: 'outcome-bad', label: 'Forever hustling, never stable', x: 520, y: 420, prob: 100, desc: 'Always one bad month away from crisis — provider anxiety never stops', source: 'Expat surveys', sacredRoots: ['SR-007', 'SR-014'] },
      { id: 4, type: 'bottleneck', label: 'Build $3K+/mo consistently', x: 520, y: 120, prob: 30, desc: '$3K/mo in Indonesia = provides comfortably + saves', source: 'Cost of living', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Income swings, anxiety persists', x: 520, y: 320, prob: 100, desc: 'Inconsistent income is worse psychologically than low but stable', source: 'Behavioral econ', sacredRoots: ['SR-001', 'SR-011'] },
      { id: 6, type: 'decision', label: 'Support family + save + grow?', x: 780, y: 120, prob: 40, desc: 'Triple constraint: lifestyle, family obligations, investment', source: 'Financial planning', sacredRoots: ['SR-019', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Burnt out trying to do everything', x: 780, y: 320, prob: 100, desc: 'Provider burnout: when the pressure exceeds the capacity', source: 'Mental health data', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 8, type: 'outcome-good', label: 'Stable, respected, at peace', x: 1040, y: 60, prob: 100, desc: 'Financial stability + purpose = highest male life satisfaction', source: 'Gallup wellbeing', sacredRoots: ['SR-019', 'SR-004'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 9, label: 'partial' }, { from: 2, to: 4, label: 'yes' },
      { from: 9, to: 10 }, { from: 10, to: 4, label: 'pass' }, { from: 10, to: 11, label: 'fail' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'no' }, { from: 6, to: 8, label: 'yes' },
    ]
  },
  richard_polymarket: {
    title: 'Prediction Market Trading',
    input: 'Someone tries to make consistent profit trading on Polymarket',
    nodes: [
      { id: 1, type: 'start', label: 'Discover prediction markets', x: 0, y: 120, prob: 100, desc: 'Polymarket: $1B+ monthly volume in 2025', source: 'Polymarket data', sacredRoots: ['SR-035', 'SR-013'] },
      { id: 2, type: 'action', label: 'Deposit and start trading', x: 260, y: 120, prob: 100, desc: 'USDC on Polygon — low barrier to entry', source: 'Polymarket', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'bottleneck', label: 'Beat the market consistently?', x: 520, y: 120, prob: 20, desc: 'Prediction markets are efficient — hard to find alpha', source: 'Academic research', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 4, type: 'outcome-bad', label: 'Emotional trading, lose money', x: 520, y: 320, prob: 100, desc: '80% of retail traders lose money in any market', source: 'SEC data', sacredRoots: ['SR-011', 'SR-015'] },
      { id: 5, type: 'decision', label: 'Build systematic edge (bots/data)?', x: 780, y: 120, prob: 30, desc: 'Algorithmic traders capture 60-80% of market alpha', source: 'Market microstructure', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 6, type: 'outcome-bad', label: 'Manual trading, slow bleed', x: 780, y: 320, prob: 100, desc: 'Without edge, you are the liquidity for smarter players', source: 'Trading axiom', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 7, type: 'bottleneck', label: 'Scale without blowing up', x: 1040, y: 120, prob: 40, desc: 'Position sizing and risk management separate winners from losers', source: 'Kelly Criterion', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 8, type: 'outcome-good', label: 'Consistent profits + compounding', x: 1300, y: 60, prob: 100, desc: 'Top Polymarket traders: 20-50% annual returns', source: 'Leaderboard data', sacredRoots: ['SR-011', 'SR-035'] },
      { id: 9, type: 'outcome-bad', label: 'One bad bet wipes gains', x: 1300, y: 280, prob: 100, desc: 'Concentration risk: one event can erase months of profit', source: 'Risk management', sacredRoots: ['SR-011', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 7, label: 'yes' },
      { from: 7, to: 8, label: 'pass' }, { from: 7, to: 9, label: 'fail' },
    ]
  },
  richard_leverage: {
    title: 'From Manual Labor to Leverage',
    input: 'Someone escapes trading time for money and builds leverage-based income',
    nodes: [
      { id: 1, type: 'start', label: 'Trading hours for dollars', x: 0, y: 120, prob: 100, desc: '85% of workers are paid hourly/salary — linear income', source: 'BLS 2024', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 2, type: 'desire', label: 'Want income while sleeping', x: 260, y: 120, prob: 100, desc: '"If you don\'t find a way to make money while you sleep..." — Buffett', source: 'Warren Buffett', sacredRoots: ['SR-007', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Build something that works without you', x: 520, y: 120, prob: 15, desc: 'Code, content, capital — only 3 forms of true leverage', source: 'Naval Ravikant', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 4, type: 'outcome-bad', label: 'Self-employed but still trading time', x: 520, y: 320, prob: 100, desc: 'Most freelancers/consultants just bought themselves a job', source: 'E-Myth', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 5, type: 'decision', label: 'Product or audience first?', x: 780, y: 120, prob: 50, desc: 'Audience-first has 3x higher success rate than product-first', source: 'SPI research', sacredRoots: ['SR-017', 'SR-025'] },
      { id: 6, type: 'bottleneck', label: 'Reach $5K/mo passive/semi-passive', x: 1040, y: 120, prob: 20, desc: 'Only 4% of online businesses reach $5K/mo', source: 'Indie Hackers', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: '$200/mo — not enough to live on', x: 1040, y: 320, prob: 100, desc: 'Median online business revenue: $0-500/mo', source: 'Stripe data', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 8, type: 'outcome-good', label: 'Time freedom + growing income', x: 1300, y: 60, prob: 100, desc: 'The 4% who break through report highest life satisfaction', source: 'Lifestyle surveys', sacredRoots: ['SR-031', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
};
