export interface TemplateNode {
  id: number;
  type: string;
  label: string;
  x: number;
  y: number;
  prob: number;
  desc: string;
  source: string;
  time?: string;
  sacredRoots?: string[];
}

export interface TemplateEdge {
  from: number;
  to: number;
  label?: string;
}

export interface Template {
  title: string;
  input: string;
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}

export const TEMPLATES: Record<string, Template> = {
  startup: {
    title: 'Launch a Startup',
    input: 'I want to launch a startup',
    nodes: [
      { id: 1, type: 'desire', label: 'Have a startup idea', x: 0, y: 100, prob: 100, desc: '90% of adults have business ideas', source: 'Gallup 2023 | GEM Global Report 2024', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Actually start building?', x: 240, y: 100, prob: 8, desc: 'Only 5-10% of people act on their ideas', source: 'GEM Global Report 2024 | Kauffman Foundation 2023', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 12, type: 'outcome-bad', label: 'Never started', x: 240, y: 300, prob: 100, desc: '92% talk about it but never begin', source: 'GEM Global Report 2024 | Kauffman Foundation 2023', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'gate', label: 'Run out of money', x: 480, y: 100, prob: 38, desc: '38% of startups fail from cash problems', source: 'CB Insights 2024 | Startup Genome 2024', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Dead: no funding', x: 480, y: 300, prob: 100, desc: '62% never raise or run dry', source: 'CB Insights 2024 | Crunchbase 2024', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 13, type: 'state', label: 'Zombie company, surviving but not growing', x: 480, y: 250, prob: 100, desc: 'Burning fumes, no clear path forward but not dead yet — the worst limbo', source: 'CB Insights 2024 | PitchBook 2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 14, type: 'bottleneck', label: 'Converts to growth?', x: 720, y: 250, prob: 20, desc: 'Zombie startups rarely recover — most just delay death', source: 'Startup Genome 2024 | Y Combinator 2024', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 15, type: 'outcome-bad', label: 'Trapped in zombie mode', x: 720, y: 400, prob: 100, desc: 'Not dead, not alive — founders stuck for years', source: 'Y Combinator 2024 | First Round Capital 2023', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 5, type: 'decision', label: 'Find product-market fit?', x: 720, y: 100, prob: 40, desc: 'Only 40% of funded startups find PMF', source: 'Startup Genome 2024 | a16z 2023', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Nobody wants this', x: 720, y: 300, prob: 100, desc: '#1 reason startups die: no market need', source: 'CB Insights 2024 | Startup Genome 2024', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 7, type: 'bottleneck', label: 'Scale the team', x: 960, y: 100, prob: 60, desc: '23% fail from wrong team', source: 'CB Insights 2024 | Noam Wasserman 2023', sacredRoots: ['SR-025', 'SR-026'] },
      { id: 8, type: 'outcome-bad', label: 'Team implodes', x: 960, y: 300, prob: 100, desc: 'Co-founder conflict kills 65%', source: 'Noam Wasserman 2023 | Harvard Business Review 2024', sacredRoots: ['SR-026', 'SR-025'] },
      { id: 9, type: 'decision', label: 'Reach profitability?', x: 1200, y: 100, prob: 33, desc: 'Only 33% of VC-backed reach profit', source: 'PitchBook 2024 | NVCA Yearbook 2024', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 10, type: 'outcome-good', label: 'Sustainable business', x: 1440, y: 40, prob: 100, desc: '~6% of all startups reach this', source: 'Startup Genome 2024 | PitchBook 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 11, type: 'outcome-bad', label: 'Zombie company', x: 1440, y: 220, prob: 100, desc: 'Alive but not growing', source: 'Y Combinator 2024 | Startup Genome 2024', sacredRoots: ['SR-007', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 12, label: 'fail' }, { from: 2, to: 3, label: 'pass' },
      { from: 3, to: 4, label: 'no' }, { from: 3, to: 13, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 13, to: 14 }, { from: 14, to: 5, label: 'pass' }, { from: 14, to: 15, label: 'fail' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 7, label: 'yes' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 9, to: 10, label: 'yes' }, { from: 9, to: 11, label: 'no' },
    ]
  },
  money: {
    title: 'Sell What People Want',
    input: 'Making money on what people want',
    nodes: [
      { id: 1, type: 'start', label: 'Pick a painful problem', x: 0, y: 120, prob: 100, desc: '42% of startups fail: no market need', source: 'CB Insights 2024 | Startup Genome 2024', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 2, type: 'action', label: 'Validate with 10 people', x: 240, y: 120, prob: 100, desc: 'Talk to real potential buyers', source: 'The Mom Test 2023 | Y Combinator 2024', sacredRoots: ['SR-035', 'SR-009'] },
      { id: 3, type: 'gate', label: 'Will they pay?', x: 480, y: 120, prob: 30, desc: '"Interested" ≠ paying. Only 30% convert from interest to wallet', source: 'Gartner 2024 | HubSpot Sales Report 2024', sacredRoots: ['SR-035', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'Nobody pays — pivot', x: 480, y: 300, prob: 100, desc: 'Most common outcome for first ideas', source: 'Y Combinator 2024 | CB Insights 2024', sacredRoots: ['SR-005', 'SR-009'] },
      { id: 11, type: 'state', label: 'Interest but no conversion', x: 480, y: 270, prob: 100, desc: 'People say "cool" and "I would buy this" but wallets stay shut — the cruelest validation', source: 'Gartner 2024 | McKinsey Consumer Report 2023', sacredRoots: ['SR-010', 'SR-023'] },
      { id: 12, type: 'bottleneck', label: 'Converts to paying?', x: 720, y: 270, prob: 20, desc: 'Warm interest rarely converts without urgency or scarcity', source: 'HubSpot Sales Report 2024 | Salesforce State of Sales 2024', sacredRoots: ['SR-010', 'SR-016'] },
      { id: 13, type: 'outcome-bad', label: 'Eternal "almost" customers', x: 720, y: 420, prob: 100, desc: 'Pipeline full of maybes, bank account empty', source: 'Salesforce State of Sales 2024 | Gartner 2024', sacredRoots: ['SR-023', 'SR-007'] },
      { id: 5, type: 'action', label: 'Build MVP + first sale', x: 720, y: 120, prob: 100, desc: 'Smallest version that solves the problem', source: 'Lean Startup 2023 | Y Combinator 2024', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Get 10 paying customers', x: 960, y: 120, prob: 35, desc: '65% of products never reach 10 customers', source: 'Baremetrics 2024 | Indie Hackers 2024', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 7, type: 'outcome-bad', label: 'No traction, die slowly', x: 960, y: 300, prob: 100, desc: 'Product exists but nobody buys it', source: 'Indie Hackers 2024 | MicroConf 2023', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 8, type: 'decision', label: 'Retention > 40%?', x: 1200, y: 120, prob: 45, desc: 'Month 2 retention is the real test', source: 'Lenny Rachitsky 2024 | Mixpanel Benchmarks 2024', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 9, type: 'outcome-good', label: 'Sustainable business', x: 1440, y: 60, prob: 100, desc: 'Revenue grows via word-of-mouth + retention', source: 'First Round Capital 2024 | Bain & Company 2023', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Leaky bucket — churn wins', x: 1440, y: 240, prob: 100, desc: 'Acquiring faster than retaining = death', source: 'ProfitWell 2024 | ChartMogul 2024', sacredRoots: ['SR-031', 'SR-035'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'no' }, { from: 3, to: 11, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 5, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  cafe: {
    title: 'Open a Cafe',
    input: 'I want to open a cafe',
    nodes: [
      { id: 1, type: 'desire', label: 'Dream of owning a cafe', x: 0, y: 120, prob: 100, desc: 'Top 5 most desired business', source: 'National Restaurant Association 2024 | IBISWorld 2024', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Find location + capital', x: 240, y: 120, prob: 100, desc: 'Cost: 50-200M IDR', source: 'BPS Indonesia 2024 | SWA Magazine 2023', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Location good enough?', x: 480, y: 120, prob: 45, desc: '#1 factor for success', source: 'Restaurant.org 2024 | National Restaurant Association 2024', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 4, type: 'outcome-bad', label: 'Bad location, low traffic', x: 480, y: 300, prob: 100, desc: '55% choose wrong location', source: 'FSR Magazine 2024 | Restaurant Business 2023', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 5, type: 'action', label: 'Open doors, first month', x: 720, y: 120, prob: 100, desc: 'Honeymoon: friends & family', source: 'Toast Restaurant Report 2024 | Square Food Report 2024', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'gate', label: 'Survive month 3-6', x: 960, y: 120, prob: 40, desc: '60% fail in year 1', source: 'National Restaurant Association 2024 | Bureau of Labor Statistics 2024', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Closed: no customers', x: 960, y: 300, prob: 100, desc: 'Avg cafe lasts 4.5 years', source: 'Bureau of Labor Statistics 2024 | IBISWorld 2024', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 11, type: 'state', label: 'Surviving but barely, thin margins', x: 960, y: 270, prob: 100, desc: 'Every month feels like the last — counting every cup sold, dreading rent day', source: 'National Restaurant Association 2024 | Toast Restaurant Report 2024', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 12, type: 'bottleneck', label: 'Turns profitable?', x: 1200, y: 270, prob: 20, desc: 'Thin-margin cafes rarely recover without a pivot', source: 'Restaurant Business 2024 | Square Food Report 2024', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 13, type: 'outcome-bad', label: 'Slow death, closed month 9', x: 1200, y: 420, prob: 100, desc: 'Delayed failure — lost more money by staying open longer', source: 'Bureau of Labor Statistics 2024 | Restaurant Business 2024', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 8, type: 'decision', label: 'Build regulars?', x: 1200, y: 120, prob: 50, desc: '70% revenue from regulars', source: 'Toast POS 2024 | Square Food Report 2024', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 9, type: 'outcome-good', label: 'Profitable, growing', x: 1440, y: 60, prob: 100, desc: '~17% become profitable', source: 'IBISWorld 2024 | National Restaurant Association 2024', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 10, type: 'outcome-bad', label: 'Breakeven forever', x: 1440, y: 220, prob: 100, desc: 'Survive but never profit', source: 'Restaurant Business 2024 | Toast Restaurant Report 2024', sacredRoots: ['SR-013', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'no' }, { from: 6, to: 11, label: 'partial' }, { from: 6, to: 8, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 8, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  content: {
    title: 'Content Creator Journey',
    input: 'I want to become a content creator',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to be a creator', x: 0, y: 120, prob: 100, desc: '50M+ consider themselves creators', source: 'SignalFire 2023 | Adobe Creator Economy Report 2024', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Post first content', x: 240, y: 120, prob: 100, desc: 'Only 12% actually post', source: 'Adobe Creator Economy Report 2024 | Linktree Creator Report 2024', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 3, type: 'bottleneck', label: 'Stay consistent 90 days', x: 480, y: 120, prob: 20, desc: '80% quit within 90 days', source: 'YouTube Creator Academy 2024 | Epidemic Sound Creator Report 2024', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Quit: no views', x: 480, y: 300, prob: 100, desc: 'Avg: 50 views/video', source: 'Tubics 2024 | Social Blade 2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 5, type: 'gate', label: 'Reach 1K followers', x: 720, y: 120, prob: 35, desc: '35% of consistent reach 1K', source: 'Linktree Creator Report 2024 | ConvertKit Creator Report 2024', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'Small audience forever', x: 720, y: 300, prob: 100, desc: 'Median: 500 subscribers', source: 'Social Blade 2024 | Linktree Creator Report 2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 10, type: 'state', label: 'Small audience, 100-500 followers, growth flatlined', x: 720, y: 270, prob: 100, desc: 'Posting into the void — some likes, no momentum, algorithm ignores you', source: 'Linktree Creator Report 2024 | Epidemic Sound Creator Report 2024', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 11, type: 'bottleneck', label: 'Breaks through?', x: 960, y: 270, prob: 20, desc: 'Going viral is luck — most plateau creators never escape', source: 'Social Blade 2024 | YouTube Creator Academy 2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 12, type: 'outcome-bad', label: 'Forever micro-creator', x: 960, y: 420, prob: 100, desc: 'Posting for years to 300 followers — invisible to the world', source: 'Linktree Creator Report 2024 | Adobe Creator Economy Report 2024', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'decision', label: 'Monetize?', x: 960, y: 120, prob: 30, desc: '4% earn >$100K/yr', source: 'Linktree Creator Report 2024 | Goldman Sachs 2023', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Full-time creator', x: 1200, y: 60, prob: 100, desc: 'Top 1% earn 90% of revenue', source: 'Goldman Sachs 2023 | SignalFire 2024', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 9, type: 'outcome-bad', label: 'Hobby income only', x: 1200, y: 220, prob: 100, desc: 'Median earns $0/yr', source: 'Linktree Creator Report 2024 | ConvertKit Creator Report 2024', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 10, label: 'partial' }, { from: 5, to: 7, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 7, label: 'pass' }, { from: 11, to: 12, label: 'fail' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  saas: {
    title: 'Build a SaaS',
    input: 'I want to build a SaaS product',
    nodes: [
      { id: 1, type: 'desire', label: 'See a problem worth solving', x: 0, y: 100, prob: 100, desc: 'Avg dev has 3-5 ideas/year', source: 'Indie Hackers 2024 | Product Hunt 2024', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 2, type: 'action', label: 'Build an MVP', x: 240, y: 100, prob: 100, desc: 'Avg 2-4 months solo', source: 'Y Combinator 2024 | MicroConf 2024', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 3, type: 'gate', label: 'Get 10 paying users', x: 480, y: 100, prob: 25, desc: '75% never get 10 customers', source: 'Baremetrics 2024 | Indie Hackers 2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: '$0 MRR forever', x: 480, y: 280, prob: 100, desc: 'Most common outcome', source: 'Indie Hackers 2024 | MicroConf 2024', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 12, type: 'state', label: '3-7 customers, real revenue but stalled', x: 480, y: 250, prob: 100, desc: 'Enough to feel real, not enough to matter — the cruelest tease', source: 'Baremetrics 2024 | ChartMogul 2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 13, type: 'bottleneck', label: 'Grows past 10?', x: 720, y: 250, prob: 20, desc: 'Most SaaS with 3-7 users stay there forever', source: 'ChartMogul 2024 | Baremetrics 2024', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 14, type: 'outcome-bad', label: 'Stuck at $50-200 MRR forever', x: 720, y: 400, prob: 100, desc: 'Not enough to justify the work, too much to give up', source: 'Indie Hackers 2024 | MicroConf 2024', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 5, type: 'bottleneck', label: 'Reach $1K MRR', x: 720, y: 100, prob: 40, desc: '10% reach $1K MRR', source: 'MicroConf 2024 | Baremetrics 2024', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 6, type: 'outcome-bad', label: 'Side project purgatory', x: 720, y: 280, prob: 100, desc: 'Not enough to quit job', source: 'Indie Hackers 2024 | MicroConf 2024', sacredRoots: ['SR-008', 'SR-007'] },
      { id: 7, type: 'decision', label: 'Churn below 5%?', x: 960, y: 100, prob: 45, desc: 'Avg churn: 5-7%/month', source: 'ProfitWell 2024 | ChartMogul 2024', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 8, type: 'bottleneck', label: 'Scale to $10K MRR', x: 1200, y: 100, prob: 50, desc: '$1K to $10K: 11 months avg', source: 'Baremetrics 2024 | Stripe Atlas Report 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-bad', label: 'Churn kills growth', x: 1200, y: 280, prob: 100, desc: 'Leaky bucket', source: 'ProfitWell 2024 | ChartMogul 2024', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 10, type: 'outcome-good', label: 'Ramen profitable', x: 1440, y: 40, prob: 100, desc: '~2% of ideas reach this', source: 'Stripe Atlas Report 2024 | Indie Hackers 2024', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 11, type: 'outcome-bad', label: 'Burnout, shut down', x: 1440, y: 200, prob: 100, desc: 'Solo burnout: 72%', source: 'Indie Hackers 2024 | MicroConf Burnout Survey 2023', sacredRoots: ['SR-014', 'SR-011'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 12, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 12, to: 13 }, { from: 13, to: 5, label: 'pass' }, { from: 13, to: 14, label: 'fail' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
      { from: 8, to: 10, label: 'pass' }, { from: 8, to: 11, label: 'fail' },
    ]
  },
  freelance: {
    title: 'Go Freelance',
    input: 'I want to go freelance',
    nodes: [
      { id: 1, type: 'desire', label: 'Want freedom & flexibility', x: 0, y: 120, prob: 100, desc: '36% of US workforce freelances', source: 'Upwork Freelance Forward 2024 | McKinsey Freelance Economy 2023', sacredRoots: ['SR-007', 'SR-011'] },
      { id: 2, type: 'action', label: 'Send proposals', x: 240, y: 120, prob: 100, desc: '10 proposals to first gig', source: 'Upwork Freelance Forward 2024 | Fiverr Business Report 2024', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 3, type: 'gate', label: 'Land first client', x: 480, y: 120, prob: 45, desc: '55% quit before first client', source: 'Payoneer Global Freelancer Report 2024 | Upwork Freelance Forward 2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'No clients, back to job', x: 480, y: 300, prob: 100, desc: 'Most common outcome', source: 'Payoneer Global Freelancer Report 2024 | Freelancers Union 2024', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 10, type: 'state', label: 'One small gig but no pattern', x: 480, y: 270, prob: 100, desc: 'Did one $200 project, felt great, then silence — was it a fluke?', source: 'Payoneer Global Freelancer Report 2024 | Upwork Freelance Forward 2024', sacredRoots: ['SR-001', 'SR-035'] },
      { id: 11, type: 'bottleneck', label: 'Lands a second?', x: 720, y: 270, prob: 20, desc: 'First client is luck, second is proof — most never get there', source: 'Freelancers Union 2024 | Upwork Freelance Forward 2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 12, type: 'outcome-bad', label: 'One-hit wonder freelancer', x: 720, y: 420, prob: 100, desc: 'Forever chasing that second client', source: 'Freelancers Union 2024 | Payoneer Global Freelancer Report 2024', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Earn $2K+/month', x: 720, y: 120, prob: 40, desc: '31% earn >$75K/yr', source: 'Upwork Freelance Forward 2024 | Payoneer Global Freelancer Report 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'Feast-famine cycle', x: 720, y: 300, prob: 100, desc: '#1 freelance fear', source: 'Freelancers Union 2024 | McKinsey Freelance Economy 2023', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 7, type: 'decision', label: 'Raise rates?', x: 960, y: 120, prob: 50, desc: 'Top 10% earn 3-5x market', source: 'Toptal 2024 | Upwork Freelance Forward 2024', sacredRoots: ['SR-009', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Premium freelancer', x: 1200, y: 60, prob: 100, desc: '$100K+ earners', source: 'McKinsey Freelance Economy 2023 | Toptal 2024', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 9, type: 'outcome-bad', label: 'Stuck at low rates', x: 1200, y: 220, prob: 100, desc: 'Race to bottom', source: 'Payoneer Global Freelancer Report 2024 | Freelancers Union 2024', sacredRoots: ['SR-013', 'SR-009'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 10, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 5, label: 'pass' }, { from: 11, to: 12, label: 'fail' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  app: {
    title: 'Create an App',
    input: 'I want to create an app',
    nodes: [
      { id: 1, type: 'desire', label: 'Have an app idea', x: 0, y: 100, prob: 100, desc: 'Every developer has 3-5 ideas/year', source: 'Indie Hackers 2024 | Statista App Market 2024', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Design & build it', x: 240, y: 100, prob: 100, desc: 'Avg cost: $5K-$50K solo, 3-6 months', source: 'Clutch 2024 | GoodFirms 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 3, type: 'bottleneck', label: 'Submit to app store', x: 480, y: 100, prob: 75, desc: '25% of submissions get rejected', source: 'Apple App Review 2024 | Sensor Tower 2024', sacredRoots: ['SR-003', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Rejected / stuck in dev', x: 480, y: 280, prob: 100, desc: 'Many never finish or pass review', source: 'Apple App Review 2024 | AppFollow 2024', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Get first 100 downloads', x: 720, y: 100, prob: 30, desc: 'Most apps get <1K total downloads', source: 'Statista App Market 2024 | data.ai 2024', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Zero traction', x: 720, y: 280, prob: 100, desc: '70% of apps get under 5K downloads ever', source: 'AppFollow 2024 | data.ai 2024', sacredRoots: ['SR-007', 'SR-035'] },
      { id: 7, type: 'gate', label: 'Day 30 retention > 4%', x: 960, y: 100, prob: 25, desc: 'Avg day 30 retention: 2-4%', source: 'AppsFlyer 2024 | Adjust Mobile Report 2024', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 8, type: 'outcome-bad', label: 'Users download, never return', x: 960, y: 280, prob: 100, desc: '96% of users churn in 30 days', source: 'AppsFlyer 2024 | Adjust Mobile Report 2024', sacredRoots: ['SR-032', 'SR-035'] },
      { id: 12, type: 'state', label: '1-3% retention, some return but not sticky', x: 960, y: 250, prob: 100, desc: 'A few users come back, but not enough to build on — hope without traction', source: 'AppsFlyer 2024 | Mixpanel Benchmarks 2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 13, type: 'bottleneck', label: 'Improves retention?', x: 1200, y: 250, prob: 20, desc: 'Fixing retention is the hardest problem in mobile — most never crack it', source: 'Mixpanel Benchmarks 2024 | AppsFlyer 2024', sacredRoots: ['SR-036', 'SR-005'] },
      { id: 14, type: 'outcome-bad', label: 'Slow churn death', x: 1200, y: 400, prob: 100, desc: 'Users trickle in and trickle out — net zero growth', source: 'AppsFlyer 2024 | data.ai 2024', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 9, type: 'decision', label: 'Monetize?', x: 1200, y: 100, prob: 30, desc: 'Avg app revenue: $1,100/month', source: 'BuildFire 2024 | Sensor Tower 2024', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 10, type: 'outcome-good', label: 'Sustainable app business', x: 1440, y: 40, prob: 100, desc: 'Top 1% earn 90%+ of all revenue', source: 'Sensor Tower 2024 | data.ai 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 11, type: 'outcome-bad', label: 'Costs more than it earns', x: 1440, y: 200, prob: 100, desc: 'Most apps never recoup dev cost', source: 'Sensor Tower 2024 | Statista App Market 2024', sacredRoots: ['SR-031', 'SR-017'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'no' }, { from: 7, to: 12, label: 'partial' }, { from: 7, to: 9, label: 'yes' },
      { from: 12, to: 13 }, { from: 13, to: 9, label: 'pass' }, { from: 13, to: 14, label: 'fail' },
      { from: 9, to: 10, label: 'yes' }, { from: 9, to: 11, label: 'no' },
    ]
  },
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
  ai_agency: {
    title: 'AI Agency Startup',
    input: 'Someone decides to start an AI automation agency',
    nodes: [
      { id: 1, type: 'desire', label: 'See AI agency hype, want in', x: 0, y: 120, prob: 100, desc: 'AI agency searches up 4,200% since 2023', source: 'Google Trends 2025', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'action', label: 'Join free community / Discord', x: 240, y: 120, prob: 60, desc: '50K+ people in top AI agency communities', source: 'Skool/Discord data', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 3, type: 'action', label: 'Buy accelerator ($2K-$10K)', x: 480, y: 120, prob: 25, desc: 'Avg AI agency accelerator: $3K-$8K', source: 'Market research', sacredRoots: ['SR-031', 'SR-036'] },
      { id: 4, type: 'bottleneck', label: 'Learn AI tools (Make, n8n, GPT)', x: 720, y: 120, prob: 40, desc: 'Technical learning curve: 2-6 months', source: 'Community surveys', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 5, type: 'outcome-bad', label: 'Overwhelmed, quit learning', x: 720, y: 300, prob: 100, desc: '60% drop out during technical phase', source: 'Accelerator data', sacredRoots: ['SR-036', 'SR-010'] },
      { id: 6, type: 'gate', label: 'Land first paying client', x: 960, y: 120, prob: 10, desc: 'Cold outreach: 1-3% response rate', source: 'Agency benchmarks', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'No clients after months', x: 960, y: 300, prob: 100, desc: 'Avg time to first client: 3-6 months', source: 'Community polls', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'state', label: 'Got one small $500 project, no repeat', x: 960, y: 270, prob: 100, desc: 'One cheap project, client ghosted after — was it even real revenue?', source: 'Agency benchmarks', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Gets a real retainer?', x: 1200, y: 270, prob: 20, desc: 'One-off projects rarely lead to agency growth', source: 'Pattern analysis', sacredRoots: ['SR-010', 'SR-032'] },
      { id: 13, type: 'outcome-bad', label: 'Stuck doing $500 gigs', x: 1200, y: 420, prob: 100, desc: 'Freelancer disguised as agency — no leverage, no scale', source: 'Community polls', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 8, type: 'decision', label: 'Scale to $10K+/month?', x: 1200, y: 120, prob: 5, desc: '<5% of AI agency starters reach $10K MRR', source: 'Income reports', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: 'Running profitable agency', x: 1440, y: 60, prob: 100, desc: 'Top performers: $20K-$100K/mo, but rare', source: 'Case studies', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Back to job hunt', x: 1440, y: 220, prob: 100, desc: 'Market saturating: 10x more agencies than 2023', source: 'Market analysis', sacredRoots: ['SR-007', 'SR-027'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'no' }, { from: 6, to: 11, label: 'partial' }, { from: 6, to: 8, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 8, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  dropshipping: {
    title: 'Dropshipping Store',
    input: 'Someone starts a dropshipping business on Shopify',
    nodes: [
      { id: 1, type: 'desire', label: 'Want passive income via dropshipping', x: 0, y: 120, prob: 100, desc: 'Dropshipping market: $300B+ globally', source: 'Grand View Research 2025', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 2, type: 'action', label: 'Find winning product on AliExpress', x: 240, y: 120, prob: 100, desc: 'Avg store tests 10-20 products before finding a winner', source: 'Oberlo data', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 3, type: 'action', label: 'Build Shopify store ($39/mo)', x: 480, y: 120, prob: 70, desc: '1.7M+ Shopify stores, most inactive within 6 months', source: 'Shopify data', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 4, type: 'gate', label: 'Run ads profitably (ROAS > 2x)', x: 720, y: 120, prob: 10, desc: '90% of first ad campaigns lose money', source: 'Facebook Ads benchmarks', sacredRoots: ['SR-035', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Burn ad budget, no sales', x: 720, y: 300, prob: 100, desc: 'Avg new advertiser loses $500-$2000 learning', source: 'Meta Ads data', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 11, type: 'state', label: 'Occasional ROAS 1.8x but inconsistent', x: 720, y: 270, prob: 100, desc: 'Some days profitable, most not — chasing a pattern that may not exist', source: 'Facebook Ads benchmarks', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Stabilizes ROAS?', x: 960, y: 270, prob: 20, desc: 'Inconsistent ROAS usually means the product is mediocre, not the ads', source: 'Pattern analysis', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 13, type: 'outcome-bad', label: 'Slow bleed on ads, net negative', x: 960, y: 420, prob: 100, desc: 'Spending $50/day hoping tomorrow will be different', source: 'Meta Ads data', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 6, type: 'bottleneck', label: 'Handle fulfillment & returns', x: 960, y: 120, prob: 50, desc: 'Avg shipping 15-45 days, 20-30% complaint rate', source: 'Aliexpress/Shopify', sacredRoots: ['SR-032', 'SR-019'] },
      { id: 7, type: 'outcome-bad', label: 'Chargebacks & angry customers', x: 960, y: 300, prob: 100, desc: 'Dropship chargeback rate 2-5x normal ecommerce', source: 'Stripe data', sacredRoots: ['SR-032', 'SR-023'] },
      { id: 8, type: 'decision', label: 'Sustain $5K+/month profit?', x: 1200, y: 120, prob: 5, desc: '<10% of dropshippers are profitable after 1 year', source: 'Shopify merchant data', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 9, type: 'outcome-good', label: 'Scaled to real brand', x: 1440, y: 60, prob: 100, desc: 'Successful pivot: private label or 3PL warehouse', source: 'Ecom case studies', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 10, type: 'outcome-bad', label: 'Store dead, Shopify cancelled', x: 1440, y: 220, prob: 100, desc: 'Median store lifespan: 4 months', source: 'Shopify churn data', sacredRoots: ['SR-007', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'no' }, { from: 4, to: 11, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 6, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  upwork_freelance: {
    title: 'Freelancing on Upwork',
    input: 'Someone decides to freelance on Upwork or Fiverr',
    nodes: [
      { id: 1, type: 'desire', label: 'Want freedom & income from freelancing', x: 0, y: 120, prob: 100, desc: '64M Americans freelanced in 2024', source: 'Upwork Freelance Forward 2024:100:2', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'action', label: 'Learn marketable skill (2-6 months)', x: 240, y: 120, prob: 40, desc: 'Top skills: web dev, design, writing, video editing', source: 'Upwork Skills Index 2024:40:2', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 3, type: 'state', label: '650 of 1000 complete profile', x: 480, y: 120, prob: 100, desc: '35% drop off before completing profile', source: 'Upwork Platform Data 2024:65:2', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 4, type: 'action', label: '245 send first proposal', x: 660, y: 120, prob: 100, desc: 'Avg 30-50 proposals before first response', source: 'Upwork Community Forums 2024:24:1', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 5, type: 'gate', label: 'Get first interview response', x: 900, y: 120, prob: 10, desc: 'New profiles: 1-3% proposal acceptance rate', source: 'Upwork Freelancer Report 2024:10:2 | McKinsey Freelance Economy 2023:12:2', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'No response, quit', x: 900, y: 350, prob: 100, desc: '60-70% quit within year 1', source: 'Upwork Retention Data 2024:65:2', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 14, type: 'state', label: 'Has interviews but no hires', x: 900, y: 270, prob: 100, desc: 'Clients respond, ask questions, then go silent — so close yet so far', source: 'Upwork Freelancer Report 2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 15, type: 'bottleneck', label: 'Converts to hire?', x: 1140, y: 270, prob: 20, desc: 'Interview-to-hire conversion for new freelancers is brutal', source: 'Pattern analysis', sacredRoots: ['SR-010', 'SR-016'] },
      { id: 16, type: 'outcome-bad', label: 'Stuck at interview stage', x: 1140, y: 420, prob: 100, desc: 'Always a bridesmaid, never a bride — proposals read but never hired', source: 'Upwork Community Forums', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'state', label: '25 get first hire (2.5% of signups)', x: 1140, y: 120, prob: 100, desc: 'First hire is the critical proof point', source: 'Upwork Marketplace Stats 2024:2.5:2', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 8, type: 'bottleneck', label: 'Get 5-star reviews & repeat clients', x: 1380, y: 120, prob: 30, desc: 'Top rated = 10x more invites. Specialists convert 10-20% vs 2-5% generalists', source: 'Upwork Algorithm Study 2024:30:2 | Harvard Business Review 2023:28:2', sacredRoots: ['SR-032', 'SR-036'] },
      { id: 9, type: 'outcome-bad', label: 'Race to bottom on price', x: 1380, y: 350, prob: 100, desc: 'Global competition pushes rates to $5-15/hr', source: 'ILO Global Wage Report 2024:100:3', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 10, type: 'state', label: '8 remain active after year 1 (0.8%)', x: 1620, y: 120, prob: 100, desc: '60% client repeat hire rate for survivors', source: 'Upwork Annual Report 2024:0.8:2', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 11, type: 'decision', label: 'Reach $10K/year by year 2?', x: 1860, y: 120, prob: 15, desc: 'Top 10% earn $50K+/year', source: 'Upwork Earnings Data 2024:15:2 | Payoneer Freelancer Survey 2024:12:2', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 12, type: 'outcome-good', label: '3 of 1000 reach $10K/year', x: 2100, y: 60, prob: 100, desc: 'Top freelancers: $100-300/hr, client waitlists', source: 'Upwork Top Rated Profiles 2024:0.3:2', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 13, type: 'outcome-bad', label: 'Median income $2-5K/year', x: 2100, y: 250, prob: 100, desc: 'Active but not enough to live on', source: 'Payoneer Global Freelancer Survey 2024:100:2', sacredRoots: ['SR-013', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 14, label: 'partial' }, { from: 5, to: 7, label: 'yes' },
      { from: 14, to: 15 }, { from: 15, to: 7, label: 'pass' }, { from: 15, to: 16, label: 'fail' },
      { from: 7, to: 8 }, { from: 8, to: 9, label: 'fail' }, { from: 8, to: 10, label: 'pass' },
      { from: 10, to: 11 }, { from: 11, to: 12, label: 'yes' }, { from: 11, to: 13, label: 'no' },
    ]
  },
  saas_scratch: {
    title: 'SaaS from Scratch',
    input: 'A solo founder builds a SaaS MVP and tries to reach $1M ARR',
    nodes: [
      { id: 1, type: 'desire', label: 'Identify problem worth solving', x: 0, y: 120, prob: 100, desc: '92% of startups fail within 3 years', source: 'Startup Genome 2024', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 2, type: 'action', label: 'Build MVP (2-6 months)', x: 240, y: 120, prob: 30, desc: '70% of solo founders never ship v1', source: 'IndieHackers survey', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 3, type: 'action', label: 'Launch on Product Hunt / Twitter', x: 480, y: 120, prob: 100, desc: 'Avg PH launch: 200-500 visits, 5-20 signups', source: 'Product Hunt data', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 4, type: 'gate', label: 'Get 10 paying users', x: 720, y: 120, prob: 10, desc: 'Free to paid conversion: 2-5% typical', source: 'SaaS benchmarks', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 5, type: 'outcome-bad', label: 'No one wants to pay', x: 720, y: 300, prob: 100, desc: '#1 startup killer: no market need (42%)', source: 'CB Insights', sacredRoots: ['SR-035', 'SR-007'] },
      { id: 11, type: 'state', label: '3-7 paying, proof but no momentum', x: 720, y: 270, prob: 100, desc: 'Enough signal to keep going, not enough to feel confident — the founder purgatory', source: 'SaaS benchmarks', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Reaches 10+?', x: 960, y: 270, prob: 20, desc: 'The gap from 5 to 10 users feels infinite without a growth channel', source: 'Pattern analysis', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 13, type: 'outcome-bad', label: 'Stalled at 5 users, dying slowly', x: 960, y: 420, prob: 100, desc: 'Not enough to celebrate, too much to abandon', source: 'MicroConf data', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Reach $1K MRR', x: 960, y: 120, prob: 20, desc: 'Median time to $1K MRR: 6-18 months', source: 'Baremetrics', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Stuck at $100-500 MRR forever', x: 960, y: 300, prob: 100, desc: 'Most indie SaaS plateau at $1-5K MRR', source: 'MicroConf data', sacredRoots: ['SR-013', 'SR-010'] },
      { id: 8, type: 'decision', label: 'Reach $1M ARR?', x: 1200, y: 120, prob: 3, desc: '<1% of SaaS startups reach $1M ARR', source: 'SaaStr', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: 'Real SaaS business, growing', x: 1440, y: 60, prob: 100, desc: 'Median time to $1M ARR: 3-5 years', source: 'Bessemer Cloud Index', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 10, type: 'outcome-bad', label: 'Shut down or acqui-hire', x: 1440, y: 220, prob: 100, desc: '90% of funded startups fail, 99% of unfunded', source: 'Startup Genome', sacredRoots: ['SR-007', 'SR-019'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'no' }, { from: 4, to: 11, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 6, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  side_hustle: {
    title: 'Side Hustle to Full-Time',
    input: 'Someone with a full-time job starts a side hustle',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to escape 9-5, start side hustle', x: 0, y: 120, prob: 100, desc: '44% of Americans have a side hustle', source: 'Bankrate 2024', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Start building evenings & weekends', x: 240, y: 120, prob: 50, desc: 'Avg side hustler works 12-15 hrs/week extra', source: 'Zapier survey', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 3, type: 'gate', label: 'Sustain energy + day job', x: 480, y: 120, prob: 30, desc: 'Burnout hits 70% of side hustlers within 6 months', source: 'Gallup', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 4, type: 'outcome-bad', label: 'Burned out, back to just day job', x: 480, y: 300, prob: 100, desc: 'Avg side hustle abandoned after 4.5 months', source: 'Survey data', sacredRoots: ['SR-014', 'SR-012'] },
      { id: 10, type: 'state', label: 'Sporadic 5-8 hrs/week, slow progress', x: 480, y: 270, prob: 100, desc: 'Too tired after work most days — touching the project once a week, guilt growing', source: 'Gallup', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 11, type: 'bottleneck', label: 'Finds rhythm?', x: 720, y: 270, prob: 20, desc: 'Sporadic effort rarely compounds into real progress', source: 'Pattern analysis', sacredRoots: ['SR-014', 'SR-012'] },
      { id: 12, type: 'outcome-bad', label: 'Eternal side project, zero momentum', x: 720, y: 420, prob: 100, desc: 'Years of "working on something" with nothing to show', source: 'Survey data', sacredRoots: ['SR-008', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Match day job income ($3-8K/mo)', x: 720, y: 120, prob: 10, desc: 'Median side hustle income: $810/month', source: 'Bankrate 2024', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'Makes money but cant replace salary', x: 720, y: 300, prob: 100, desc: 'Only 10-15% of side hustles exceed $1K/month', source: 'Bureau of Labor', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 7, type: 'decision', label: 'Quit day job and go full-time?', x: 960, y: 120, prob: 25, desc: 'The leap: 6 months savings recommended minimum', source: 'Financial advisors', sacredRoots: ['SR-001', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Full-time entrepreneur, growing', x: 1200, y: 60, prob: 100, desc: 'Those who transition: 65% report higher satisfaction', source: 'FreshBooks survey', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 9, type: 'outcome-bad', label: 'Income drops, go back to employment', x: 1200, y: 220, prob: 100, desc: '25% of full-time leapers return to employment within 1 year', source: 'BLS data', sacredRoots: ['SR-007', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 10, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 5, label: 'pass' }, { from: 11, to: 12, label: 'fail' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  buy_business: {
    title: 'Buy an Existing Business',
    input: 'Someone decides to buy an existing business instead of building from scratch',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to skip startup phase, buy existing', x: 0, y: 120, prob: 100, desc: 'Business acquisitions up 30% since 2020', source: 'BizBuySell 2024', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 2, type: 'action', label: 'Search BizBuySell / brokers', x: 240, y: 120, prob: 100, desc: '11,000+ businesses listed for sale at any time', source: 'BizBuySell', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Find good deal + due diligence', x: 480, y: 120, prob: 15, desc: 'Avg buyer reviews 20-50 businesses before buying 1', source: 'Acquisition data', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 4, type: 'outcome-bad', label: 'Analysis paralysis, never buy', x: 480, y: 300, prob: 100, desc: '80% of searchers never complete an acquisition', source: 'Search fund data', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Secure financing (SBA loan / seller)', x: 720, y: 120, prob: 40, desc: 'SBA 7(a) loans: 10-25% down, 10yr terms', source: 'SBA.gov', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'Cant get financing approved', x: 720, y: 300, prob: 100, desc: 'SBA loan denial rate: 50-70% for first-time buyers', source: 'SBA data', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 7, type: 'action', label: 'Take over operations', x: 960, y: 120, prob: 100, desc: 'Transition period: 3-12 months with seller', source: 'Industry standard', sacredRoots: ['SR-032', 'SR-019'] },
      { id: 8, type: 'decision', label: 'Business grows under new owner?', x: 1200, y: 120, prob: 45, desc: '40-50% of acquired businesses grow in year 1', source: 'BizBuySell Insight', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 9, type: 'outcome-good', label: 'Profitable owner-operator', x: 1440, y: 60, prob: 100, desc: 'Median SDE for acquired business: $150-300K', source: 'BizBuySell', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Revenue drops, debt burden', x: 1440, y: 220, prob: 100, desc: '20-25% of acquisitions fail within 2 years', source: 'Harvard Business Review', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8 }, { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  affiliate_blog: {
    title: 'Affiliate Marketing Blog',
    input: 'Someone starts an affiliate marketing blog',
    nodes: [
      { id: 1, type: 'desire', label: 'Want passive income from blog', x: 0, y: 120, prob: 100, desc: 'Affiliate marketing industry worth $17B+', source: 'Statista 2025', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 2, type: 'action', label: 'Pick niche + buy domain ($50-200)', x: 240, y: 120, prob: 80, desc: '95% of affiliate sites start in oversaturated niches', source: 'Ahrefs study', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 3, type: 'action', label: 'Write 50+ articles (3-6 months)', x: 480, y: 120, prob: 15, desc: '90% of bloggers quit before reaching 20 articles', source: 'Blogging survey', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Gave up after 10 articles', x: 480, y: 300, prob: 100, desc: 'Avg blog post takes 3-5 hours to write well', source: 'Orbit Media', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 5, type: 'gate', label: 'Google indexes + ranks page 1', x: 720, y: 120, prob: 8, desc: 'Only 5.7% of pages rank in top 10 within 1 year', source: 'Ahrefs 2024', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Zero traffic after 6 months', x: 720, y: 300, prob: 100, desc: '90.63% of pages get zero Google traffic', source: 'Ahrefs', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'state', label: 'Page 2-3, 10-50 visitors/month', x: 720, y: 270, prob: 100, desc: 'Google knows you exist but doesnt care — stuck in no-mans-land of search results', source: 'Ahrefs 2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 12, type: 'bottleneck', label: 'Climbs to page 1?', x: 960, y: 270, prob: 20, desc: 'Page 2 to page 1 requires backlinks and time most bloggers dont have', source: 'Pattern analysis', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 13, type: 'outcome-bad', label: 'Forever on page 2, invisible', x: 960, y: 420, prob: 100, desc: 'The best place to hide a dead body is page 2 of Google', source: 'SEO wisdom', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'bottleneck', label: 'Earn $1K+/month commissions', x: 960, y: 120, prob: 10, desc: 'Median affiliate blogger income: $0-500/year', source: 'Authority Hacker survey', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 8, type: 'outcome-bad', label: '$10-50/month, not worth effort', x: 960, y: 300, prob: 100, desc: 'Most affiliate sites earn less than hosting costs', source: 'Market data', sacredRoots: ['SR-031', 'SR-013'] },
      { id: 9, type: 'outcome-good', label: '$5K+/month passive income', x: 1200, y: 60, prob: 100, desc: 'Top 10% of affiliate sites earn $10K+/month', source: 'Authority Hacker', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 10, type: 'outcome-bad', label: 'Google update kills traffic', x: 1200, y: 220, prob: 100, desc: '40-60% traffic loss common after core updates', source: 'Search Engine Journal', sacredRoots: ['SR-001', 'SR-019'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 11, label: 'partial' }, { from: 5, to: 7, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 7, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 7, to: 10, label: 'fail' },
    ]
  },
  paid_community: {
    title: 'Start a Paid Community',
    input: 'Someone launches a paid community on Skool or Circle',
    nodes: [
      { id: 1, type: 'desire', label: 'Monetize expertise with community', x: 0, y: 120, prob: 100, desc: 'Creator economy worth $250B+ in 2025', source: 'Goldman Sachs', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 2, type: 'action', label: 'Launch on Skool/Circle ($49-97/mo)', x: 240, y: 120, prob: 50, desc: '200K+ communities on Skool alone', source: 'Skool data 2025', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 3, type: 'gate', label: 'Get first 10 paying members', x: 480, y: 120, prob: 20, desc: 'Need existing audience of 1-5K minimum', source: 'Community benchmarks', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: '0-3 members, embarrassing', x: 480, y: 300, prob: 100, desc: '80% of paid communities have <10 members', source: 'Platform data', sacredRoots: ['SR-018', 'SR-007'] },
      { id: 10, type: 'state', label: '4-7 members, real but tiny', x: 480, y: 270, prob: 100, desc: 'Enough to feel responsible, not enough to feel successful — awkward middle', source: 'Community benchmarks', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 11, type: 'bottleneck', label: 'Grows past 10?', x: 720, y: 270, prob: 20, desc: 'Small communities either grow or die — staying at 5 members is unsustainable', source: 'Pattern analysis', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 12, type: 'outcome-bad', label: 'Ghost community, 5 silent members', x: 720, y: 420, prob: 100, desc: 'Posting to yourself while 5 people lurk and wonder if they should cancel', source: 'Platform data', sacredRoots: ['SR-025', 'SR-008'] },
      { id: 5, type: 'bottleneck', label: 'Retain members month 2+', x: 720, y: 120, prob: 40, desc: 'Avg community churn: 10-20% monthly', source: 'Skool/Circle data', sacredRoots: ['SR-032', 'SR-025'] },
      { id: 6, type: 'outcome-bad', label: 'Members join then cancel quickly', x: 720, y: 300, prob: 100, desc: 'Median membership duration: 2-4 months', source: 'Subscription data', sacredRoots: ['SR-032', 'SR-026'] },
      { id: 7, type: 'decision', label: 'Reach 100+ paying members?', x: 960, y: 120, prob: 8, desc: '100 members x $79 = $7,900 MRR', source: 'Community math', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 8, type: 'outcome-good', label: 'Thriving community, recurring revenue', x: 1200, y: 60, prob: 100, desc: 'Top communities: 500-5K members, $50-500K MRR', source: 'Skool leaderboard', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 9, type: 'outcome-bad', label: 'Plateau at 20-30, exhausting to maintain', x: 1200, y: 220, prob: 100, desc: 'Content treadmill: weekly calls, posts, support', source: 'Creator burnout data', sacredRoots: ['SR-014', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 10, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 5, label: 'pass' }, { from: 11, to: 12, label: 'fail' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  crypto_journey: {
    title: 'Crypto Investment Journey',
    input: 'Someone starts investing in cryptocurrency',
    nodes: [
      { id: 1, type: 'desire', label: 'FOMO into crypto, buy first Bitcoin', x: 0, y: 120, prob: 100, desc: '420M+ crypto users globally', source: 'Crypto.com 2025', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'action', label: 'Open exchange account, buy BTC', x: 240, y: 120, prob: 70, desc: 'Avg first purchase: $100-500', source: 'Coinbase data', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'gate', label: 'Survive first -30% crash', x: 480, y: 120, prob: 40, desc: 'BTC has 5-10 crashes of 30%+ per cycle', source: 'CoinGecko historical', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Panic sell at loss', x: 480, y: 300, prob: 100, desc: '80% of retail traders sell at a loss', source: 'Chainalysis 2024', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 11, type: 'state', label: 'Holding but panicking daily', x: 480, y: 270, prob: 100, desc: 'Checking portfolio 20x/day, losing sleep, telling yourself "just hold" while dying inside', source: 'CoinGecko historical', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 12, type: 'bottleneck', label: 'Survives the full dip?', x: 720, y: 270, prob: 20, desc: 'Most panickers eventually crack and sell at the worst moment', source: 'Pattern analysis', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 13, type: 'outcome-bad', label: 'Sold at -25%, missed recovery', x: 720, y: 420, prob: 100, desc: 'Panic sold near the bottom, watched it recover without them', source: 'Chainalysis 2024', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 5, type: 'decision', label: 'Start trading altcoins?', x: 720, y: 120, prob: 60, desc: 'Altcoin greed: 10-100x gains advertised everywhere', source: 'Crypto Twitter', sacredRoots: ['SR-013', 'SR-017'] },
      { id: 6, type: 'bottleneck', label: 'Navigate altcoin casino', x: 960, y: 120, prob: 10, desc: '95% of altcoins lose value vs BTC over 4 years', source: 'Messari research', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 7, type: 'outcome-bad', label: 'Lost money on shitcoins/rugs', x: 960, y: 300, prob: 100, desc: '$3.9B lost to crypto scams/rugs in 2024', source: 'Chainalysis', sacredRoots: ['SR-023', 'SR-031'] },
      { id: 8, type: 'decision', label: 'Net positive after full cycle?', x: 1200, y: 120, prob: 20, desc: 'Only 10-20% of crypto traders are profitable long-term', source: 'Academic studies', sacredRoots: ['SR-035', 'SR-011'] },
      { id: 9, type: 'outcome-good', label: 'Built real crypto wealth', x: 1440, y: 60, prob: 100, desc: 'HODLers who held 4+ years: 95% profitable', source: 'Glassnode', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 10, type: 'outcome-bad', label: 'Broke + emotional damage', x: 1440, y: 220, prob: 100, desc: 'Avg retail crypto investor underperforms BTC buy-and-hold by 40%', source: 'MIT study', sacredRoots: ['SR-011', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 11, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 5, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  // ====== RICHARD'S PERSONAL TEMPLATES ======
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

// Keyword matching for auto-selecting templates
export const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  startup: ['startup', 'company', 'venture', 'founder', 'lanciare', 'avviare', 'impresa'],
  money: ['money', 'desire', 'want', 'sell', 'profit', 'rich', 'wealth', 'soldi', 'vendere', 'guadagn', 'ricco'],
  cafe: ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'caffè', 'ristorante', 'locale', 'pizzeria'],
  content: ['content', 'creator', 'youtube', 'tiktok', 'influencer', 'video', 'contenut', 'creatore'],
  saas: ['saas', 'software', 'app', 'tool', 'platform', 'subscription', 'piattaforma', 'abbonamento'],
  freelance: ['freelance', 'consulting', 'independent', 'gig', 'consulente', 'libero professionista', 'freelancer'],
  app: ['app', 'mobile', 'ios', 'android', 'application', 'download', 'applicazione'],
  lend_money: ['lend', 'borrow', 'loan', 'friend', 'money', 'debt', 'prestare', 'prestito', 'debito', 'amico'],
  lose_weight: ['weight', 'lose', 'diet', 'gym', 'fat', 'fitness', 'exercise', 'dimagrire', 'peso', 'dieta', 'palestra'],
  learn_skill: ['learn', 'skill', 'course', 'study', 'tutorial', 'certification', 'imparare', 'corso', 'studiare', 'competenza'],
  youtube_guru: ['guru', 'course', 'youtube', 'buy course', 'iman', 'liam', '$10k', 'comprare corso'],
  ai_agency: ['ai agency', 'automation', 'agency', 'ai', 'accelerator', 'n8n', 'agenzia', 'automazione'],
  dropshipping: ['dropshipping', 'shopify', 'aliexpress', 'ecommerce', 'drop ship'],
  upwork_freelance: ['upwork', 'fiverr', 'freelance', 'freelancing', 'gig', 'proposal'],
  saas_scratch: ['saas', 'mvp', 'product hunt', 'arr', 'mrr', 'solo founder', 'indie'],
  side_hustle: ['side hustle', 'side project', 'quit job', '9-5', 'full-time', 'secondo lavoro', 'lavoretto', 'lasciare lavoro'],
  buy_business: ['buy business', 'acquire', 'acquisition', 'bizbuy', 'due diligence', 'comprare azienda', 'acquisizione'],
  affiliate_blog: ['affiliate', 'blog', 'seo', 'commission', 'passive income', 'niche site', 'reddito passivo', 'affiliazione'],
  paid_community: ['community', 'skool', 'circle', 'membership', 'members', 'comunità', 'membri'],
  crypto_journey: ['crypto', 'bitcoin', 'btc', 'altcoin', 'trading', 'hodl', 'criptovalut'],
  richard_cafepedia: ['cafepedia', 'cafe search', 'monetize', 'b2b', 'indonesia cafe'],
  richard_move_abroad: ['move abroad', 'expat', 'leave country', 'trasferirsi', 'emigrare', 'southeast asia'],
  richard_interfaith: ['interfaith', 'christian muslim', 'mixed religion', 'relationship', 'faith couple'],
  richard_break_pattern: ['never sell', 'build dont sell', 'no revenue', 'pattern', 'non vendo mai'],
  richard_first_million: ['100k', 'first million', 'save money', 'geo arbitrage', 'indonesia income'],
  richard_perfectionism: ['perfectionism', 'never ship', 'overpolish', 'perfezionismo', 'non finisco mai'],
  richard_faith_business: ['faith business', 'kingdom', 'christian entrepreneur', 'fede', 'imprenditore cristiano'],
  richard_provider: ['provider', 'provide', 'family', 'mantenere', 'provvedere', 'before 30'],
  richard_polymarket: ['polymarket', 'prediction market', 'bet', 'trading prediction'],
  richard_leverage: ['leverage', 'passive income', 'reddito passivo', 'leva', 'sleep money'],
};
