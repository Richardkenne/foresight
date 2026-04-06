import type { Template } from '../templates';

export const lifeTemplates: Record<string, Template> = {
  lend_money: {
    title: 'Friend Asks to Borrow Money',
    input: 'A friend without a job asks me to borrow money',
    nodes: [
      { id: 1, type: 'start', label: 'Friend asks for money', x: 0, y: 140, prob: 100, desc: '43% of people have lent to friends/family', source: 'Bankrate 2024 | LendingTree 2024', sacredRoots: ['SR-020', 'SR-026'] },
      { id: 2, type: 'decision', label: 'Do you lend?', x: 240, y: 140, prob: 60, desc: '60% say yes when close friend asks', source: 'LendingTree 2024 | Bankrate 2024', sacredRoots: ['SR-017', 'SR-024'] },
      { id: 3, type: 'outcome-good', label: 'Say no, relationship survives', x: 240, y: 320, prob: 100, desc: '71% of those who say no keep the friendship', source: 'Bankrate 2024 | NerdWallet 2024', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 4, type: 'action', label: 'You give them money', x: 480, y: 140, prob: 100, desc: 'Avg personal loan to friend: $500-$3K', source: 'LendingTree 2024 | Federal Reserve Survey 2023', sacredRoots: ['SR-024', 'SR-020'] },
      { id: 5, type: 'bottleneck', label: 'Do they pay you back?', x: 720, y: 140, prob: 47, desc: '53% of lenders lose money on personal loans', source: 'Bankrate 2024 | LendingTree 2024', sacredRoots: ['SR-026', 'SR-019'] },
      { id: 6, type: 'outcome-bad', label: 'Never paid back', x: 720, y: 320, prob: 100, desc: '$3,257 avg amount lost forever', source: 'LendingTree 2024 | Bankrate 2024', sacredRoots: ['SR-026', 'SR-021'] },
      { id: 7, type: 'decision', label: 'Does it damage the relationship?', x: 960, y: 140, prob: 46, desc: '46% say lending damaged a relationship', source: 'Bankrate 2024 | NerdWallet 2024', sacredRoots: ['SR-022', 'SR-026'] },
      { id: 8, type: 'outcome-good', label: 'Paid back, friendship intact', x: 1200, y: 80, prob: 100, desc: 'Only ~25% of all loans end well', source: 'Bankrate 2024 | LendingTree 2024', sacredRoots: ['SR-026', 'SR-019'] },
      { id: 9, type: 'outcome-bad', label: 'Lost money AND the friend', x: 1200, y: 240, prob: 100, desc: '37% lost a relationship over money', source: 'Bankrate 2024 | Federal Reserve Survey 2023', sacredRoots: ['SR-026', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5 }, { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 9, label: 'yes' }, { from: 7, to: 8, label: 'no' },
    ]
  },
  lose_weight: {
    title: 'Lose Weight & Keep It Off',
    input: 'I want to lose weight',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to lose weight', x: 0, y: 120, prob: 100, desc: '49% of adults tried in the past year', source: 'CDC NHANES 2024 | WHO Global Report 2024', sacredRoots: ['SR-011', 'SR-005'] },
      { id: 2, type: 'action', label: 'Start a diet / gym', x: 240, y: 120, prob: 100, desc: 'Jan gym sign-ups spike 50-67%', source: 'IHRSA Global Report 2024 | Strava Year in Sport 2024', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 3, type: 'bottleneck', label: 'Survive past week 3', x: 480, y: 120, prob: 36, desc: '64% quit new habits within 30 days', source: 'Strava Year in Sport 2024 | British Journal of Sports Medicine 2023', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 4, type: 'outcome-bad', label: 'Quit after 2-3 weeks', x: 480, y: 300, prob: 100, desc: 'Average gym visits: 4.7x/month', source: 'IHRSA Global Report 2024 | RunRepeat 2024', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Lose 5%+ body weight', x: 720, y: 120, prob: 50, desc: '50% of dieters hit initial target', source: 'NEJM 2024 | Lancet 2023', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 6, type: 'outcome-bad', label: 'No visible progress, stop', x: 720, y: 300, prob: 100, desc: 'Metabolic adaptation slows loss', source: 'Lancet 2023 | Nature Medicine 2024', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'bottleneck', label: 'Keep it off 1 year', x: 960, y: 120, prob: 40, desc: '80% regain within 1-2 years', source: 'American Journal of Clinical Nutrition 2024 | NEJM 2024', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 8, type: 'outcome-bad', label: 'Regain all the weight', x: 960, y: 300, prob: 100, desc: '95% regain within 5 years', source: 'NEJM 2024 | UCLA Meta-Analysis 2023', sacredRoots: ['SR-011', 'SR-005'] },
      { id: 9, type: 'outcome-good', label: 'Sustained weight loss 5yr+', x: 1200, y: 60, prob: 100, desc: 'Only 5-10% keep weight off long-term', source: 'National Weight Control Registry 2024 | NEJM 2024', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 10, type: 'outcome-bad', label: 'Yo-yo cycle repeats', x: 1200, y: 220, prob: 100, desc: 'Avg person attempts 4-7 diets/year', source: 'CDC NHANES 2024 | International Journal of Obesity 2024', sacredRoots: ['SR-011', 'SR-005'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 7, to: 10, label: 'fail' },
    ]
  },
  learn_skill: {
    title: 'Learn a New Skill',
    input: 'I want to learn a new skill',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to learn something new', x: 0, y: 120, prob: 100, desc: '74% of workers want to learn new skills', source: 'PwC Global Workforce Survey 2024 | World Economic Forum 2025', sacredRoots: ['SR-036', 'SR-007'] },
      { id: 2, type: 'action', label: 'Buy course / start learning', x: 240, y: 120, prob: 100, desc: '$400B online learning market', source: 'Statista 2024 | HolonIQ 2024', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 3, type: 'bottleneck', label: 'Complete the course', x: 480, y: 120, prob: 8, desc: '3-15% completion rate for MOOCs', source: 'MIT/Harvard MOOC Study 2024 | Class Central 2024', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Abandoned halfway', x: 480, y: 300, prob: 100, desc: 'Avg Udemy completion: 7%', source: 'Udemy Business Report 2024 | Class Central 2024', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 5, type: 'bottleneck', label: 'Practice 20+ hours', x: 720, y: 120, prob: 40, desc: '20hrs = functional competence', source: 'Josh Kaufman 2023 | Anders Ericsson Research 2023', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'Learned theory, never applied', x: 720, y: 300, prob: 100, desc: 'Retention without practice: 10% after 1mo', source: 'Ebbinghaus Forgetting Curve 2023 | Learning Science Journal 2024', sacredRoots: ['SR-012', 'SR-006'] },
      { id: 7, type: 'decision', label: 'Use skill professionally?', x: 960, y: 120, prob: 30, desc: 'Skill half-life: 2.5-5 years', source: 'World Economic Forum 2025 | McKinsey Reskilling Report 2024', sacredRoots: ['SR-036', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Career upgrade / new income', x: 1200, y: 60, prob: 100, desc: 'Upskilling = 8-25% salary increase', source: 'LinkedIn Workforce Report 2024 | Coursera Global Skills Report 2024', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 9, type: 'outcome-bad', label: 'Skill unused, forgotten', x: 1200, y: 220, prob: 100, desc: 'Forgetting curve: 70% lost in 24hrs without review', source: 'Ebbinghaus Forgetting Curve 2023 | Nature Human Behaviour 2024', sacredRoots: ['SR-006', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  youtube_guru: {
    title: 'YouTube Guru Course Journey',
    input: 'Someone watches a YouTube business guru video promising $10K/month',
    nodes: [
      { id: 1, type: 'desire', label: 'Watch guru video, dream of $10K/mo', x: 0, y: 120, prob: 100, desc: 'Business guru videos get 500M+ views/year on YouTube', source: 'Social Blade 2025', sacredRoots: ['SR-013', 'SR-023'] },
      { id: 2, type: 'action', label: 'Buy course ($997-$7000)', x: 240, y: 120, prob: 15, desc: 'Avg info product conversion: 1-5%, upsell funnels push 15%', source: 'ClickFunnels data', sacredRoots: ['SR-017', 'SR-013'] },
      { id: 3, type: 'bottleneck', label: 'Actually complete the course', x: 480, y: 120, prob: 12, desc: 'Only 3-15% finish online courses', source: 'MIT/Harvard 2024', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Paid but never started', x: 480, y: 300, prob: 100, desc: '68% of course buyers never log in after week 1', source: 'Kajabi data', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'action', label: 'Implement the steps', x: 720, y: 120, prob: 100, desc: 'Implementation requires 100-500 hours of real work', source: 'Industry avg', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Get first paying client/sale', x: 960, y: 120, prob: 8, desc: 'Only 3-10% of course students earn back tuition', source: 'FTC studies', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'Spent money, no results', x: 960, y: 300, prob: 100, desc: 'Avg course buyer spends $5K+ before first dollar earned', source: 'Refund data', sacredRoots: ['SR-031', 'SR-023'] },
      { id: 8, type: 'decision', label: 'Reach $10K/month?', x: 1200, y: 120, prob: 3, desc: '<1% of course buyers reach promised income levels', source: 'Income disclosure statements', sacredRoots: ['SR-035', 'SR-023'] },
      { id: 9, type: 'outcome-good', label: 'Built real business', x: 1440, y: 60, prob: 100, desc: 'The few who succeed usually pivot from the taught method', source: 'Case studies', sacredRoots: ['SR-012', 'SR-005'] },
      { id: 10, type: 'outcome-bad', label: 'Buy next guru course', x: 1440, y: 220, prob: 100, desc: 'Shiny object syndrome: avg person buys 3-7 courses', source: 'Digital Marketer survey', sacredRoots: ['SR-023', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  want_to_win: {
    title: 'I Want to Win',
    input: 'I want to win',
    nodes: [
      { id: 1, type: 'state', label: 'Current position: not winning yet', x: 0, y: 160, prob: 100, desc: 'Most people feel they are losing or stuck — 67% of workers are disengaged, 77% experience burnout', source: 'Gallup State of Global Workplace 2024 | APA Work & Wellbeing Survey 2024', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'desire', label: 'Want to win — but win what?', x: 260, y: 160, prob: 100, desc: '"Winning" without a clear target is the #1 trap. 92% of people never define what winning looks like for them', source: 'Harvard Business Review 2024 | Gallup 2024', sacredRoots: ['SR-009', 'SR-013'] },
      { id: 3, type: 'decision', label: 'Win for ego or win for purpose?', x: 520, y: 160, prob: 35, desc: 'Only 35% pursue goals aligned with intrinsic values — the rest chase status, approval, or money as the end goal', source: 'Self-Determination Theory (Deci & Ryan) | Journal of Personality 2024', time: 'identity question', sacredRoots: ['SR-009', 'SR-016'] },
      { id: 4, type: 'trajectory', label: 'Path of ego: win to prove others wrong', x: 520, y: 360, prob: 100, desc: '"Pride goes before destruction." Ego-driven winners burn relationships, health, and integrity on the way up', source: 'Proverbs 16:18 | HBR: Why Leaders Fail 2024', sacredRoots: ['SR-009', 'SR-026'] },
      { id: 5, type: 'outcome-bad', label: 'Won the game, lost yourself', x: 780, y: 440, prob: 100, desc: '73% of high-achievers report emptiness after reaching their goal. "Is this it?"', source: 'Tal Ben-Shahar (Harvard) | APA 2024', sacredRoots: ['SR-013', 'SR-005'] },
      { id: 6, type: 'outcome-bad', label: 'Burned everyone on the way up', x: 780, y: 300, prob: 100, desc: '61% of executives report regret over sacrificed relationships. Lonely at the top.', source: 'HBR 2024 | RHR International Leadership Survey 2023', sacredRoots: ['SR-026', 'SR-020'] },
      { id: 7, type: 'action', label: 'Define your game + pay the price daily', x: 780, y: 160, prob: 100, desc: 'Deliberate practice: 10,000 hours myth debunked, but 3-5 years of focused daily effort is real', source: 'Ericsson (Peak) 2024 | Cal Newport (Deep Work)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 8, type: 'bottleneck', label: 'Can you sustain discipline for years?', x: 1040, y: 160, prob: 18, desc: 'Only 8-25% maintain new habits after 1 year. Discipline, not motivation, separates winners', source: 'European Journal of Social Psychology 2024 | BJ Fogg (Stanford)', time: '1-5 years', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 9, type: 'outcome-bad', label: 'Quit when it got hard', x: 1040, y: 360, prob: 100, desc: 'The "dip" kills 82% of ambitions. Most quit right before the breakthrough', source: 'Seth Godin (The Dip) | Grit by Angela Duckworth', sacredRoots: ['SR-008', 'SR-007'] },
      { id: 10, type: 'gate', label: 'Do you adapt or stay rigid?', x: 1300, y: 160, prob: 40, desc: 'Winners pivot strategy while keeping the vision. 60% fail because they confuse tactics with identity', source: 'Carol Dweck (Mindset) | McKinsey Resilience Report 2024', time: 'continuous', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 11, type: 'outcome-bad', label: 'Stubborn: winning yesterday\'s game', x: 1300, y: 360, prob: 100, desc: 'Kodak, Blockbuster, Nokia — refused to adapt. Rigidity kills winners faster than competition', source: 'Clayton Christensen (Innovator\'s Dilemma) | McKinsey 2024', sacredRoots: ['SR-009', 'SR-017'] },
      { id: 12, type: 'state', label: 'Winning but not yet won', x: 1300, y: 60, prob: 100, desc: 'Partial victory — progress is real but the game never ends. Sustainable winners know this.', source: 'James Clear (Atomic Habits) | Simon Sinek (Infinite Game)', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 13, type: 'decision', label: 'Hoard the win or serve with it?', x: 1560, y: 160, prob: 55, desc: '"Whoever wants to be great among you must be your servant." Winners who serve compound; hoarders plateau', source: 'Mark 10:43-45 | Adam Grant (Give and Take) 2024', time: 'legacy question', sacredRoots: ['SR-032', 'SR-024'] },
      { id: 14, type: 'outcome-good', label: 'Win that compounds: purpose + impact', x: 1820, y: 80, prob: 100, desc: 'Givers who set boundaries are the top performers in every field — not takers, not matchers', source: 'Adam Grant (Give and Take) | Matthew 25:21', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 15, type: 'outcome-bad', label: 'Won once, never again — hoarding kills growth', x: 1820, y: 280, prob: 100, desc: '"Whoever has will be given more; whoever does not have, even what they have will be taken." One-time winners who hoard decline', source: 'Matthew 25:29 | Nassim Taleb (Antifragile)', sacredRoots: ['SR-013', 'SR-009'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'no' }, { from: 3, to: 7, label: 'yes' },
      { from: 4, to: 5 }, { from: 4, to: 6 },
      { from: 7, to: 8 },
      { from: 8, to: 9, label: 'fail' }, { from: 8, to: 10, label: 'pass' },
      { from: 10, to: 11, label: 'no' }, { from: 10, to: 12, label: 'partial' }, { from: 10, to: 13, label: 'yes' },
      { from: 12, to: 13 },
      { from: 13, to: 14, label: 'yes' }, { from: 13, to: 15, label: 'no' },
    ]
  },
};
