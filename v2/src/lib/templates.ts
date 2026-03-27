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
      { id: 1, type: 'desire', label: 'Have a startup idea', x: 0, y: 100, prob: 100, desc: '90% of adults have business ideas', source: 'Gallup 2023' },
      { id: 2, type: 'bottleneck', label: 'Actually start building?', x: 240, y: 100, prob: 8, desc: 'Only 5-10% of people act on their ideas', source: 'GEM Global Report' },
      { id: 12, type: 'outcome-bad', label: 'Never started', x: 240, y: 300, prob: 100, desc: '92% talk about it but never begin', source: 'GEM Global Report' },
      { id: 3, type: 'bottleneck', label: 'Run out of money', x: 480, y: 100, prob: 38, desc: '38% of startups fail from cash problems', source: 'CB Insights' },
      { id: 4, type: 'outcome-bad', label: 'Dead: no funding', x: 480, y: 300, prob: 100, desc: '62% never raise or run dry', source: 'CB Insights' },
      { id: 5, type: 'decision', label: 'Find product-market fit?', x: 720, y: 100, prob: 40, desc: 'Only 40% of funded startups find PMF', source: 'Startup Genome 2023' },
      { id: 6, type: 'outcome-bad', label: 'Nobody wants this', x: 720, y: 300, prob: 100, desc: '#1 reason startups die: no market need', source: 'CB Insights' },
      { id: 7, type: 'bottleneck', label: 'Scale the team', x: 960, y: 100, prob: 60, desc: '23% fail from wrong team', source: 'CB Insights' },
      { id: 8, type: 'outcome-bad', label: 'Team implodes', x: 960, y: 300, prob: 100, desc: 'Co-founder conflict kills 65%', source: 'Noam Wasserman' },
      { id: 9, type: 'decision', label: 'Reach profitability?', x: 1200, y: 100, prob: 33, desc: 'Only 33% of VC-backed reach profit', source: 'PitchBook 2023' },
      { id: 10, type: 'outcome-good', label: 'Sustainable business', x: 1440, y: 40, prob: 100, desc: '~6% of all startups reach this', source: 'Startup Genome' },
      { id: 11, type: 'outcome-bad', label: 'Zombie company', x: 1440, y: 220, prob: 100, desc: 'Alive but not growing', source: 'YC pattern' },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 12, label: 'fail' }, { from: 2, to: 3, label: 'pass' },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 7, label: 'yes' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 9, to: 10, label: 'yes' }, { from: 9, to: 11, label: 'no' },
    ]
  },
  money: {
    title: 'Sell What People Want',
    input: 'Making money on what people want',
    nodes: [
      { id: 1, type: 'start', label: 'Pick a painful problem', x: 0, y: 120, prob: 100, desc: '42% of startups fail: no market need', source: 'CB Insights' },
      { id: 2, type: 'action', label: 'Validate with 10 people', x: 240, y: 120, prob: 100, desc: 'Talk to real potential buyers', source: 'Mom Test method' },
      { id: 3, type: 'bottleneck', label: 'Will they pay?', x: 480, y: 120, prob: 30, desc: '"Interested" ≠ paying. Only 30% convert from interest to wallet', source: 'Gartner' },
      { id: 4, type: 'outcome-bad', label: 'Nobody pays — pivot', x: 480, y: 300, prob: 100, desc: 'Most common outcome for first ideas', source: 'YC data' },
      { id: 5, type: 'action', label: 'Build MVP + first sale', x: 720, y: 120, prob: 100, desc: 'Smallest version that solves the problem', source: 'Lean Startup' },
      { id: 6, type: 'bottleneck', label: 'Get 10 paying customers', x: 960, y: 120, prob: 35, desc: '65% of products never reach 10 customers', source: 'Baremetrics' },
      { id: 7, type: 'outcome-bad', label: 'No traction, die slowly', x: 960, y: 300, prob: 100, desc: 'Product exists but nobody buys it', source: 'Indie Hackers survey' },
      { id: 8, type: 'decision', label: 'Retention > 40%?', x: 1200, y: 120, prob: 45, desc: 'Month 2 retention is the real test', source: 'Lenny Rachitsky' },
      { id: 9, type: 'outcome-good', label: 'Sustainable business', x: 1440, y: 60, prob: 100, desc: 'Revenue grows via word-of-mouth + retention', source: 'First Round Capital' },
      { id: 10, type: 'outcome-bad', label: 'Leaky bucket — churn wins', x: 1440, y: 240, prob: 100, desc: 'Acquiring faster than retaining = death', source: 'ProfitWell' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  cafe: {
    title: 'Open a Cafe',
    input: 'I want to open a cafe',
    nodes: [
      { id: 1, type: 'desire', label: 'Dream of owning a cafe', x: 0, y: 120, prob: 100, desc: 'Top 5 most desired business', source: 'NRA 2023' },
      { id: 2, type: 'action', label: 'Find location + capital', x: 240, y: 120, prob: 100, desc: 'Cost: 50-200M IDR', source: 'Indonesia avg' },
      { id: 3, type: 'bottleneck', label: 'Location good enough?', x: 480, y: 120, prob: 45, desc: '#1 factor for success', source: 'Restaurant.org' },
      { id: 4, type: 'outcome-bad', label: 'Bad location, low traffic', x: 480, y: 300, prob: 100, desc: '55% choose wrong location', source: 'FSR Magazine' },
      { id: 5, type: 'action', label: 'Open doors, first month', x: 720, y: 120, prob: 100, desc: 'Honeymoon: friends & family', source: 'Common pattern' },
      { id: 6, type: 'bottleneck', label: 'Survive month 3-6', x: 960, y: 120, prob: 40, desc: '60% fail in year 1', source: 'National Restaurant Assoc' },
      { id: 7, type: 'outcome-bad', label: 'Closed: no customers', x: 960, y: 300, prob: 100, desc: 'Avg cafe lasts 4.5 years', source: 'BLS' },
      { id: 8, type: 'decision', label: 'Build regulars?', x: 1200, y: 120, prob: 50, desc: '70% revenue from regulars', source: 'Toast POS' },
      { id: 9, type: 'outcome-good', label: 'Profitable, growing', x: 1440, y: 60, prob: 100, desc: '~17% become profitable', source: 'Industry benchmark' },
      { id: 10, type: 'outcome-bad', label: 'Breakeven forever', x: 1440, y: 220, prob: 100, desc: 'Survive but never profit', source: 'Common' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  content: {
    title: 'Content Creator Journey',
    input: 'I want to become a content creator',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to be a creator', x: 0, y: 120, prob: 100, desc: '50M+ consider themselves creators', source: 'SignalFire 2023' },
      { id: 2, type: 'action', label: 'Post first content', x: 240, y: 120, prob: 100, desc: 'Only 12% actually post', source: 'Creator Economy Report' },
      { id: 3, type: 'bottleneck', label: 'Stay consistent 90 days', x: 480, y: 120, prob: 20, desc: '80% quit within 90 days', source: 'YouTube Creator Academy' },
      { id: 4, type: 'outcome-bad', label: 'Quit: no views', x: 480, y: 300, prob: 100, desc: 'Avg: 50 views/video', source: 'Tubics' },
      { id: 5, type: 'bottleneck', label: 'Reach 1K followers', x: 720, y: 120, prob: 35, desc: '35% of consistent reach 1K', source: 'Linktree' },
      { id: 6, type: 'outcome-bad', label: 'Small audience forever', x: 720, y: 300, prob: 100, desc: 'Median: 500 subscribers', source: 'Social Blade' },
      { id: 7, type: 'decision', label: 'Monetize?', x: 960, y: 120, prob: 30, desc: '4% earn >$100K/yr', source: 'Linktree 2023' },
      { id: 8, type: 'outcome-good', label: 'Full-time creator', x: 1200, y: 60, prob: 100, desc: 'Top 1% earn 90% of revenue', source: 'Goldman Sachs' },
      { id: 9, type: 'outcome-bad', label: 'Hobby income only', x: 1200, y: 220, prob: 100, desc: 'Median earns $0/yr', source: 'Linktree' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  saas: {
    title: 'Build a SaaS',
    input: 'I want to build a SaaS product',
    nodes: [
      { id: 1, type: 'desire', label: 'See a problem worth solving', x: 0, y: 100, prob: 100, desc: 'Avg dev has 3-5 ideas/year', source: 'Indie Hackers' },
      { id: 2, type: 'action', label: 'Build an MVP', x: 240, y: 100, prob: 100, desc: 'Avg 2-4 months solo', source: 'YC benchmark' },
      { id: 3, type: 'bottleneck', label: 'Get 10 paying users', x: 480, y: 100, prob: 25, desc: '75% never get 10 customers', source: 'Baremetrics' },
      { id: 4, type: 'outcome-bad', label: '$0 MRR forever', x: 480, y: 280, prob: 100, desc: 'Most common outcome', source: 'Indie Hackers' },
      { id: 5, type: 'bottleneck', label: 'Reach $1K MRR', x: 720, y: 100, prob: 40, desc: '10% reach $1K MRR', source: 'MicroConf' },
      { id: 6, type: 'outcome-bad', label: 'Side project purgatory', x: 720, y: 280, prob: 100, desc: 'Not enough to quit job', source: 'Common' },
      { id: 7, type: 'decision', label: 'Churn below 5%?', x: 960, y: 100, prob: 45, desc: 'Avg churn: 5-7%/month', source: 'ProfitWell' },
      { id: 8, type: 'bottleneck', label: 'Scale to $10K MRR', x: 1200, y: 100, prob: 50, desc: '$1K to $10K: 11 months avg', source: 'Baremetrics' },
      { id: 9, type: 'outcome-bad', label: 'Churn kills growth', x: 1200, y: 280, prob: 100, desc: 'Leaky bucket', source: 'ProfitWell' },
      { id: 10, type: 'outcome-good', label: 'Ramen profitable', x: 1440, y: 40, prob: 100, desc: '~2% of ideas reach this', source: 'Composite' },
      { id: 11, type: 'outcome-bad', label: 'Burnout, shut down', x: 1440, y: 200, prob: 100, desc: 'Solo burnout: 72%', source: 'Indie survey' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
      { from: 8, to: 10, label: 'pass' }, { from: 8, to: 11, label: 'fail' },
    ]
  },
  freelance: {
    title: 'Go Freelance',
    input: 'I want to go freelance',
    nodes: [
      { id: 1, type: 'desire', label: 'Want freedom & flexibility', x: 0, y: 120, prob: 100, desc: '36% of US workforce freelances', source: 'Upwork 2023' },
      { id: 2, type: 'action', label: 'Send proposals', x: 240, y: 120, prob: 100, desc: '10 proposals to first gig', source: 'Upwork' },
      { id: 3, type: 'bottleneck', label: 'Land first client', x: 480, y: 120, prob: 45, desc: '55% quit before first client', source: 'Payoneer' },
      { id: 4, type: 'outcome-bad', label: 'No clients, back to job', x: 480, y: 300, prob: 100, desc: 'Most common outcome', source: 'Industry' },
      { id: 5, type: 'bottleneck', label: 'Earn $2K+/month', x: 720, y: 120, prob: 40, desc: '31% earn >$75K/yr', source: 'Upwork' },
      { id: 6, type: 'outcome-bad', label: 'Feast-famine cycle', x: 720, y: 300, prob: 100, desc: '#1 freelance fear', source: 'Freelancers Union' },
      { id: 7, type: 'decision', label: 'Raise rates?', x: 960, y: 120, prob: 50, desc: 'Top 10% earn 3-5x market', source: 'Toptal' },
      { id: 8, type: 'outcome-good', label: 'Premium freelancer', x: 1200, y: 60, prob: 100, desc: '$100K+ earners', source: 'McKinsey' },
      { id: 9, type: 'outcome-bad', label: 'Stuck at low rates', x: 1200, y: 220, prob: 100, desc: 'Race to bottom', source: 'Common' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  app: {
    title: 'Create an App',
    input: 'I want to create an app',
    nodes: [
      { id: 1, type: 'desire', label: 'Have an app idea', x: 0, y: 100, prob: 100, desc: 'Every developer has 3-5 ideas/year', source: 'Indie Hackers' },
      { id: 2, type: 'action', label: 'Design & build it', x: 240, y: 100, prob: 100, desc: 'Avg cost: $5K-$50K solo, 3-6 months', source: 'Clutch 2024' },
      { id: 3, type: 'bottleneck', label: 'Submit to app store', x: 480, y: 100, prob: 75, desc: '25% of submissions get rejected', source: 'Apple 2024' },
      { id: 4, type: 'outcome-bad', label: 'Rejected / stuck in dev', x: 480, y: 280, prob: 100, desc: 'Many never finish or pass review', source: 'Apple data' },
      { id: 5, type: 'bottleneck', label: 'Get first 100 downloads', x: 720, y: 100, prob: 30, desc: 'Most apps get <1K total downloads', source: 'Statista' },
      { id: 6, type: 'outcome-bad', label: 'Zero traction', x: 720, y: 280, prob: 100, desc: '70% of apps get under 5K downloads ever', source: 'AppFollow' },
      { id: 7, type: 'bottleneck', label: 'Day 30 retention > 4%', x: 960, y: 100, prob: 25, desc: 'Avg day 30 retention: 2-4%', source: 'AppsFlyer 2024' },
      { id: 8, type: 'outcome-bad', label: 'Users download, never return', x: 960, y: 280, prob: 100, desc: '96% of users churn in 30 days', source: 'AppsFlyer' },
      { id: 9, type: 'decision', label: 'Monetize?', x: 1200, y: 100, prob: 30, desc: 'Avg app revenue: $1,100/month', source: 'BuildFire' },
      { id: 10, type: 'outcome-good', label: 'Sustainable app business', x: 1440, y: 40, prob: 100, desc: 'Top 1% earn 90%+ of all revenue', source: 'Sensor Tower' },
      { id: 11, type: 'outcome-bad', label: 'Costs more than it earns', x: 1440, y: 200, prob: 100, desc: 'Most apps never recoup dev cost', source: 'Industry avg' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 9, to: 10, label: 'yes' }, { from: 9, to: 11, label: 'no' },
    ]
  },
  lend_money: {
    title: 'Friend Asks to Borrow Money',
    input: 'A friend without a job asks me to borrow money',
    nodes: [
      { id: 1, type: 'start', label: 'Friend asks for money', x: 0, y: 140, prob: 100, desc: '43% of people have lent to friends/family', source: 'Bankrate 2024' },
      { id: 2, type: 'decision', label: 'Do you lend?', x: 240, y: 140, prob: 60, desc: '60% say yes when close friend asks', source: 'LendingTree 2023' },
      { id: 3, type: 'outcome-good', label: 'Say no, relationship survives', x: 240, y: 320, prob: 100, desc: '71% of those who say no keep the friendship', source: 'Bankrate' },
      { id: 4, type: 'action', label: 'You give them money', x: 480, y: 140, prob: 100, desc: 'Avg personal loan to friend: $500-$3K', source: 'LendingTree' },
      { id: 5, type: 'bottleneck', label: 'Do they pay you back?', x: 720, y: 140, prob: 47, desc: '53% of lenders lose money on personal loans', source: 'Bankrate 2024' },
      { id: 6, type: 'outcome-bad', label: 'Never paid back', x: 720, y: 320, prob: 100, desc: '$3,257 avg amount lost forever', source: 'LendingTree 2023' },
      { id: 7, type: 'decision', label: 'Does it damage the relationship?', x: 960, y: 140, prob: 46, desc: '46% say lending damaged a relationship', source: 'Bankrate 2024' },
      { id: 8, type: 'outcome-good', label: 'Paid back, friendship intact', x: 1200, y: 80, prob: 100, desc: 'Only ~25% of all loans end well', source: 'Composite' },
      { id: 9, type: 'outcome-bad', label: 'Lost money AND the friend', x: 1200, y: 240, prob: 100, desc: '37% lost a relationship over money', source: 'Bankrate' },
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
      { id: 1, type: 'desire', label: 'Want to lose weight', x: 0, y: 120, prob: 100, desc: '49% of adults tried in the past year', source: 'CDC 2024' },
      { id: 2, type: 'action', label: 'Start a diet / gym', x: 240, y: 120, prob: 100, desc: 'Jan gym sign-ups spike 50-67%', source: 'IHRSA' },
      { id: 3, type: 'bottleneck', label: 'Survive past week 3', x: 480, y: 120, prob: 36, desc: '64% quit new habits within 30 days', source: 'Strava/Habit research' },
      { id: 4, type: 'outcome-bad', label: 'Quit after 2-3 weeks', x: 480, y: 300, prob: 100, desc: 'Average gym visits: 4.7x/month', source: 'IHRSA' },
      { id: 5, type: 'bottleneck', label: 'Lose 5%+ body weight', x: 720, y: 120, prob: 50, desc: '50% of dieters hit initial target', source: 'NEJM' },
      { id: 6, type: 'outcome-bad', label: 'No visible progress, stop', x: 720, y: 300, prob: 100, desc: 'Metabolic adaptation slows loss', source: 'Lancet' },
      { id: 7, type: 'bottleneck', label: 'Keep it off 1 year', x: 960, y: 120, prob: 40, desc: '80% regain within 1-2 years', source: 'AJCN' },
      { id: 8, type: 'outcome-bad', label: 'Regain all the weight', x: 960, y: 300, prob: 100, desc: '95% regain within 5 years', source: 'NEJM/UCLA meta-analysis' },
      { id: 9, type: 'outcome-good', label: 'Sustained weight loss 5yr+', x: 1200, y: 60, prob: 100, desc: 'Only 5-10% keep weight off long-term', source: 'NWCR' },
      { id: 10, type: 'outcome-bad', label: 'Yo-yo cycle repeats', x: 1200, y: 220, prob: 100, desc: 'Avg person attempts 4-7 diets/year', source: 'CDC' },
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
      { id: 1, type: 'desire', label: 'Want to learn something new', x: 0, y: 120, prob: 100, desc: '74% of workers want to learn new skills', source: 'PwC 2024' },
      { id: 2, type: 'action', label: 'Buy course / start learning', x: 240, y: 120, prob: 100, desc: '$400B online learning market', source: 'Statista' },
      { id: 3, type: 'bottleneck', label: 'Complete the course', x: 480, y: 120, prob: 8, desc: '3-15% completion rate for MOOCs', source: 'MIT/Harvard 2024' },
      { id: 4, type: 'outcome-bad', label: 'Abandoned halfway', x: 480, y: 300, prob: 100, desc: 'Avg Udemy completion: 7%', source: 'Udemy data' },
      { id: 5, type: 'bottleneck', label: 'Practice 20+ hours', x: 720, y: 120, prob: 40, desc: '20hrs = functional competence', source: 'Josh Kaufman' },
      { id: 6, type: 'outcome-bad', label: 'Learned theory, never applied', x: 720, y: 300, prob: 100, desc: 'Retention without practice: 10% after 1mo', source: 'Ebbinghaus' },
      { id: 7, type: 'decision', label: 'Use skill professionally?', x: 960, y: 120, prob: 30, desc: 'Skill half-life: 2.5-5 years', source: 'WEF 2025' },
      { id: 8, type: 'outcome-good', label: 'Career upgrade / new income', x: 1200, y: 60, prob: 100, desc: 'Upskilling = 8-25% salary increase', source: 'LinkedIn 2024' },
      { id: 9, type: 'outcome-bad', label: 'Skill unused, forgotten', x: 1200, y: 220, prob: 100, desc: 'Forgetting curve: 70% lost in 24hrs without review', source: 'Ebbinghaus' },
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
      { id: 1, type: 'desire', label: 'Watch guru video, dream of $10K/mo', x: 0, y: 120, prob: 100, desc: 'Business guru videos get 500M+ views/year on YouTube', source: 'Social Blade 2025' },
      { id: 2, type: 'action', label: 'Buy course ($997-$7000)', x: 240, y: 120, prob: 15, desc: 'Avg info product conversion: 1-5%, upsell funnels push 15%', source: 'ClickFunnels data' },
      { id: 3, type: 'bottleneck', label: 'Actually complete the course', x: 480, y: 120, prob: 12, desc: 'Only 3-15% finish online courses', source: 'MIT/Harvard 2024' },
      { id: 4, type: 'outcome-bad', label: 'Paid but never started', x: 480, y: 300, prob: 100, desc: '68% of course buyers never log in after week 1', source: 'Kajabi data' },
      { id: 5, type: 'action', label: 'Implement the steps', x: 720, y: 120, prob: 100, desc: 'Implementation requires 100-500 hours of real work', source: 'Industry avg' },
      { id: 6, type: 'bottleneck', label: 'Get first paying client/sale', x: 960, y: 120, prob: 8, desc: 'Only 3-10% of course students earn back tuition', source: 'FTC studies' },
      { id: 7, type: 'outcome-bad', label: 'Spent money, no results', x: 960, y: 300, prob: 100, desc: 'Avg course buyer spends $5K+ before first dollar earned', source: 'Refund data' },
      { id: 8, type: 'decision', label: 'Reach $10K/month?', x: 1200, y: 120, prob: 3, desc: '<1% of course buyers reach promised income levels', source: 'Income disclosure statements' },
      { id: 9, type: 'outcome-good', label: 'Built real business', x: 1440, y: 60, prob: 100, desc: 'The few who succeed usually pivot from the taught method', source: 'Case studies' },
      { id: 10, type: 'outcome-bad', label: 'Buy next guru course', x: 1440, y: 220, prob: 100, desc: 'Shiny object syndrome: avg person buys 3-7 courses', source: 'Digital Marketer survey' },
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
      { id: 1, type: 'desire', label: 'See AI agency hype, want in', x: 0, y: 120, prob: 100, desc: 'AI agency searches up 4,200% since 2023', source: 'Google Trends 2025' },
      { id: 2, type: 'action', label: 'Join free community / Discord', x: 240, y: 120, prob: 60, desc: '50K+ people in top AI agency communities', source: 'Skool/Discord data' },
      { id: 3, type: 'action', label: 'Buy accelerator ($2K-$10K)', x: 480, y: 120, prob: 25, desc: 'Avg AI agency accelerator: $3K-$8K', source: 'Market research' },
      { id: 4, type: 'bottleneck', label: 'Learn AI tools (Make, n8n, GPT)', x: 720, y: 120, prob: 40, desc: 'Technical learning curve: 2-6 months', source: 'Community surveys' },
      { id: 5, type: 'outcome-bad', label: 'Overwhelmed, quit learning', x: 720, y: 300, prob: 100, desc: '60% drop out during technical phase', source: 'Accelerator data' },
      { id: 6, type: 'bottleneck', label: 'Land first paying client', x: 960, y: 120, prob: 10, desc: 'Cold outreach: 1-3% response rate', source: 'Agency benchmarks' },
      { id: 7, type: 'outcome-bad', label: 'No clients after months', x: 960, y: 300, prob: 100, desc: 'Avg time to first client: 3-6 months', source: 'Community polls' },
      { id: 8, type: 'decision', label: 'Scale to $10K+/month?', x: 1200, y: 120, prob: 5, desc: '<5% of AI agency starters reach $10K MRR', source: 'Income reports' },
      { id: 9, type: 'outcome-good', label: 'Running profitable agency', x: 1440, y: 60, prob: 100, desc: 'Top performers: $20K-$100K/mo, but rare', source: 'Case studies' },
      { id: 10, type: 'outcome-bad', label: 'Back to job hunt', x: 1440, y: 220, prob: 100, desc: 'Market saturating: 10x more agencies than 2023', source: 'Market analysis' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  dropshipping: {
    title: 'Dropshipping Store',
    input: 'Someone starts a dropshipping business on Shopify',
    nodes: [
      { id: 1, type: 'desire', label: 'Want passive income via dropshipping', x: 0, y: 120, prob: 100, desc: 'Dropshipping market: $300B+ globally', source: 'Grand View Research 2025' },
      { id: 2, type: 'action', label: 'Find winning product on AliExpress', x: 240, y: 120, prob: 100, desc: 'Avg store tests 10-20 products before finding a winner', source: 'Oberlo data' },
      { id: 3, type: 'action', label: 'Build Shopify store ($39/mo)', x: 480, y: 120, prob: 70, desc: '1.7M+ Shopify stores, most inactive within 6 months', source: 'Shopify data' },
      { id: 4, type: 'bottleneck', label: 'Run ads profitably (ROAS > 2x)', x: 720, y: 120, prob: 10, desc: '90% of first ad campaigns lose money', source: 'Facebook Ads benchmarks' },
      { id: 5, type: 'outcome-bad', label: 'Burn ad budget, no sales', x: 720, y: 300, prob: 100, desc: 'Avg new advertiser loses $500-$2000 learning', source: 'Meta Ads data' },
      { id: 6, type: 'bottleneck', label: 'Handle fulfillment & returns', x: 960, y: 120, prob: 50, desc: 'Avg shipping 15-45 days, 20-30% complaint rate', source: 'Aliexpress/Shopify' },
      { id: 7, type: 'outcome-bad', label: 'Chargebacks & angry customers', x: 960, y: 300, prob: 100, desc: 'Dropship chargeback rate 2-5x normal ecommerce', source: 'Stripe data' },
      { id: 8, type: 'decision', label: 'Sustain $5K+/month profit?', x: 1200, y: 120, prob: 5, desc: '<10% of dropshippers are profitable after 1 year', source: 'Shopify merchant data' },
      { id: 9, type: 'outcome-good', label: 'Scaled to real brand', x: 1440, y: 60, prob: 100, desc: 'Successful pivot: private label or 3PL warehouse', source: 'Ecom case studies' },
      { id: 10, type: 'outcome-bad', label: 'Store dead, Shopify cancelled', x: 1440, y: 220, prob: 100, desc: 'Median store lifespan: 4 months', source: 'Shopify churn data' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  upwork_freelance: {
    title: 'Freelancing on Upwork',
    input: 'Someone decides to freelance on Upwork or Fiverr',
    nodes: [
      { id: 1, type: 'desire', label: 'Want freedom & income from freelancing', x: 0, y: 120, prob: 100, desc: '64M Americans freelanced in 2024', source: 'Upwork Freelance Forward 2024' },
      { id: 2, type: 'action', label: 'Learn marketable skill (2-6 months)', x: 240, y: 120, prob: 40, desc: 'Top skills: web dev, design, writing, video editing', source: 'Upwork skill demand' },
      { id: 3, type: 'action', label: 'Create profile, write proposals', x: 480, y: 120, prob: 100, desc: 'Avg freelancer sends 30-50 proposals before first job', source: 'Upwork forums' },
      { id: 4, type: 'bottleneck', label: 'Win first client', x: 720, y: 120, prob: 15, desc: 'New profiles get 1-3% proposal acceptance rate', source: 'Upwork data' },
      { id: 5, type: 'outcome-bad', label: 'Zero responses, give up', x: 720, y: 300, prob: 100, desc: '50% of new freelancers quit within 3 months', source: 'Platform data' },
      { id: 6, type: 'bottleneck', label: 'Get 5-star reviews & repeat clients', x: 960, y: 120, prob: 30, desc: 'Reviews are currency: top rated = 10x more invites', source: 'Upwork algorithm' },
      { id: 7, type: 'outcome-bad', label: 'Race to bottom on price', x: 960, y: 300, prob: 100, desc: 'Global competition pushes rates to $5-15/hr', source: 'Market analysis' },
      { id: 8, type: 'decision', label: 'Reach $5K+/month consistently?', x: 1200, y: 120, prob: 15, desc: 'Top 10% of Upwork freelancers earn $50K+/year', source: 'Upwork earnings data' },
      { id: 9, type: 'outcome-good', label: 'Built premium freelance career', x: 1440, y: 60, prob: 100, desc: 'Top freelancers: $100-300/hr, client waitlists', source: 'Top rated profiles' },
      { id: 10, type: 'outcome-bad', label: 'Inconsistent gig income', x: 1440, y: 220, prob: 100, desc: 'Median Upwork earnings: $3,000-$5,000/year', source: 'Platform data' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  saas_scratch: {
    title: 'SaaS from Scratch',
    input: 'A solo founder builds a SaaS MVP and tries to reach $1M ARR',
    nodes: [
      { id: 1, type: 'desire', label: 'Identify problem worth solving', x: 0, y: 120, prob: 100, desc: '92% of startups fail within 3 years', source: 'Startup Genome 2024' },
      { id: 2, type: 'action', label: 'Build MVP (2-6 months)', x: 240, y: 120, prob: 30, desc: '70% of solo founders never ship v1', source: 'IndieHackers survey' },
      { id: 3, type: 'action', label: 'Launch on Product Hunt / Twitter', x: 480, y: 120, prob: 100, desc: 'Avg PH launch: 200-500 visits, 5-20 signups', source: 'Product Hunt data' },
      { id: 4, type: 'bottleneck', label: 'Get 10 paying users', x: 720, y: 120, prob: 10, desc: 'Free to paid conversion: 2-5% typical', source: 'SaaS benchmarks' },
      { id: 5, type: 'outcome-bad', label: 'No one wants to pay', x: 720, y: 300, prob: 100, desc: '#1 startup killer: no market need (42%)', source: 'CB Insights' },
      { id: 6, type: 'bottleneck', label: 'Reach $1K MRR', x: 960, y: 120, prob: 20, desc: 'Median time to $1K MRR: 6-18 months', source: 'Baremetrics' },
      { id: 7, type: 'outcome-bad', label: 'Stuck at $100-500 MRR forever', x: 960, y: 300, prob: 100, desc: 'Most indie SaaS plateau at $1-5K MRR', source: 'MicroConf data' },
      { id: 8, type: 'decision', label: 'Reach $1M ARR?', x: 1200, y: 120, prob: 3, desc: '<1% of SaaS startups reach $1M ARR', source: 'SaaStr' },
      { id: 9, type: 'outcome-good', label: 'Real SaaS business, growing', x: 1440, y: 60, prob: 100, desc: 'Median time to $1M ARR: 3-5 years', source: 'Bessemer Cloud Index' },
      { id: 10, type: 'outcome-bad', label: 'Shut down or acqui-hire', x: 1440, y: 220, prob: 100, desc: '90% of funded startups fail, 99% of unfunded', source: 'Startup Genome' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  side_hustle: {
    title: 'Side Hustle to Full-Time',
    input: 'Someone with a full-time job starts a side hustle',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to escape 9-5, start side hustle', x: 0, y: 120, prob: 100, desc: '44% of Americans have a side hustle', source: 'Bankrate 2024' },
      { id: 2, type: 'action', label: 'Start building evenings & weekends', x: 240, y: 120, prob: 50, desc: 'Avg side hustler works 12-15 hrs/week extra', source: 'Zapier survey' },
      { id: 3, type: 'bottleneck', label: 'Sustain energy + day job', x: 480, y: 120, prob: 30, desc: 'Burnout hits 70% of side hustlers within 6 months', source: 'Gallup' },
      { id: 4, type: 'outcome-bad', label: 'Burned out, back to just day job', x: 480, y: 300, prob: 100, desc: 'Avg side hustle abandoned after 4.5 months', source: 'Survey data' },
      { id: 5, type: 'bottleneck', label: 'Match day job income ($3-8K/mo)', x: 720, y: 120, prob: 10, desc: 'Median side hustle income: $810/month', source: 'Bankrate 2024' },
      { id: 6, type: 'outcome-bad', label: 'Makes money but cant replace salary', x: 720, y: 300, prob: 100, desc: 'Only 10-15% of side hustles exceed $1K/month', source: 'Bureau of Labor' },
      { id: 7, type: 'decision', label: 'Quit day job and go full-time?', x: 960, y: 120, prob: 25, desc: 'The leap: 6 months savings recommended minimum', source: 'Financial advisors' },
      { id: 8, type: 'outcome-good', label: 'Full-time entrepreneur, growing', x: 1200, y: 60, prob: 100, desc: 'Those who transition: 65% report higher satisfaction', source: 'FreshBooks survey' },
      { id: 9, type: 'outcome-bad', label: 'Income drops, go back to employment', x: 1200, y: 220, prob: 100, desc: '25% of full-time leapers return to employment within 1 year', source: 'BLS data' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  buy_business: {
    title: 'Buy an Existing Business',
    input: 'Someone decides to buy an existing business instead of building from scratch',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to skip startup phase, buy existing', x: 0, y: 120, prob: 100, desc: 'Business acquisitions up 30% since 2020', source: 'BizBuySell 2024' },
      { id: 2, type: 'action', label: 'Search BizBuySell / brokers', x: 240, y: 120, prob: 100, desc: '11,000+ businesses listed for sale at any time', source: 'BizBuySell' },
      { id: 3, type: 'bottleneck', label: 'Find good deal + due diligence', x: 480, y: 120, prob: 15, desc: 'Avg buyer reviews 20-50 businesses before buying 1', source: 'Acquisition data' },
      { id: 4, type: 'outcome-bad', label: 'Analysis paralysis, never buy', x: 480, y: 300, prob: 100, desc: '80% of searchers never complete an acquisition', source: 'Search fund data' },
      { id: 5, type: 'bottleneck', label: 'Secure financing (SBA loan / seller)', x: 720, y: 120, prob: 40, desc: 'SBA 7(a) loans: 10-25% down, 10yr terms', source: 'SBA.gov' },
      { id: 6, type: 'outcome-bad', label: 'Cant get financing approved', x: 720, y: 300, prob: 100, desc: 'SBA loan denial rate: 50-70% for first-time buyers', source: 'SBA data' },
      { id: 7, type: 'action', label: 'Take over operations', x: 960, y: 120, prob: 100, desc: 'Transition period: 3-12 months with seller', source: 'Industry standard' },
      { id: 8, type: 'decision', label: 'Business grows under new owner?', x: 1200, y: 120, prob: 45, desc: '40-50% of acquired businesses grow in year 1', source: 'BizBuySell Insight' },
      { id: 9, type: 'outcome-good', label: 'Profitable owner-operator', x: 1440, y: 60, prob: 100, desc: 'Median SDE for acquired business: $150-300K', source: 'BizBuySell' },
      { id: 10, type: 'outcome-bad', label: 'Revenue drops, debt burden', x: 1440, y: 220, prob: 100, desc: '20-25% of acquisitions fail within 2 years', source: 'Harvard Business Review' },
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
      { id: 1, type: 'desire', label: 'Want passive income from blog', x: 0, y: 120, prob: 100, desc: 'Affiliate marketing industry worth $17B+', source: 'Statista 2025' },
      { id: 2, type: 'action', label: 'Pick niche + buy domain ($50-200)', x: 240, y: 120, prob: 80, desc: '95% of affiliate sites start in oversaturated niches', source: 'Ahrefs study' },
      { id: 3, type: 'action', label: 'Write 50+ articles (3-6 months)', x: 480, y: 120, prob: 15, desc: '90% of bloggers quit before reaching 20 articles', source: 'Blogging survey' },
      { id: 4, type: 'outcome-bad', label: 'Gave up after 10 articles', x: 480, y: 300, prob: 100, desc: 'Avg blog post takes 3-5 hours to write well', source: 'Orbit Media' },
      { id: 5, type: 'bottleneck', label: 'Google indexes + ranks page 1', x: 720, y: 120, prob: 8, desc: 'Only 5.7% of pages rank in top 10 within 1 year', source: 'Ahrefs 2024' },
      { id: 6, type: 'outcome-bad', label: 'Zero traffic after 6 months', x: 720, y: 300, prob: 100, desc: '90.63% of pages get zero Google traffic', source: 'Ahrefs' },
      { id: 7, type: 'bottleneck', label: 'Earn $1K+/month commissions', x: 960, y: 120, prob: 10, desc: 'Median affiliate blogger income: $0-500/year', source: 'Authority Hacker survey' },
      { id: 8, type: 'outcome-bad', label: '$10-50/month, not worth effort', x: 960, y: 300, prob: 100, desc: 'Most affiliate sites earn less than hosting costs', source: 'Market data' },
      { id: 9, type: 'outcome-good', label: '$5K+/month passive income', x: 1200, y: 60, prob: 100, desc: 'Top 10% of affiliate sites earn $10K+/month', source: 'Authority Hacker' },
      { id: 10, type: 'outcome-bad', label: 'Google update kills traffic', x: 1200, y: 220, prob: 100, desc: '40-60% traffic loss common after core updates', source: 'Search Engine Journal' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 7, to: 10, label: 'fail' },
    ]
  },
  paid_community: {
    title: 'Start a Paid Community',
    input: 'Someone launches a paid community on Skool or Circle',
    nodes: [
      { id: 1, type: 'desire', label: 'Monetize expertise with community', x: 0, y: 120, prob: 100, desc: 'Creator economy worth $250B+ in 2025', source: 'Goldman Sachs' },
      { id: 2, type: 'action', label: 'Launch on Skool/Circle ($49-97/mo)', x: 240, y: 120, prob: 50, desc: '200K+ communities on Skool alone', source: 'Skool data 2025' },
      { id: 3, type: 'bottleneck', label: 'Get first 10 paying members', x: 480, y: 120, prob: 20, desc: 'Need existing audience of 1-5K minimum', source: 'Community benchmarks' },
      { id: 4, type: 'outcome-bad', label: '0-3 members, embarrassing', x: 480, y: 300, prob: 100, desc: '80% of paid communities have <10 members', source: 'Platform data' },
      { id: 5, type: 'bottleneck', label: 'Retain members month 2+', x: 720, y: 120, prob: 40, desc: 'Avg community churn: 10-20% monthly', source: 'Skool/Circle data' },
      { id: 6, type: 'outcome-bad', label: 'Members join then cancel quickly', x: 720, y: 300, prob: 100, desc: 'Median membership duration: 2-4 months', source: 'Subscription data' },
      { id: 7, type: 'decision', label: 'Reach 100+ paying members?', x: 960, y: 120, prob: 8, desc: '100 members x $79 = $7,900 MRR', source: 'Community math' },
      { id: 8, type: 'outcome-good', label: 'Thriving community, recurring revenue', x: 1200, y: 60, prob: 100, desc: 'Top communities: 500-5K members, $50-500K MRR', source: 'Skool leaderboard' },
      { id: 9, type: 'outcome-bad', label: 'Plateau at 20-30, exhausting to maintain', x: 1200, y: 220, prob: 100, desc: 'Content treadmill: weekly calls, posts, support', source: 'Creator burnout data' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  crypto_journey: {
    title: 'Crypto Investment Journey',
    input: 'Someone starts investing in cryptocurrency',
    nodes: [
      { id: 1, type: 'desire', label: 'FOMO into crypto, buy first Bitcoin', x: 0, y: 120, prob: 100, desc: '420M+ crypto users globally', source: 'Crypto.com 2025' },
      { id: 2, type: 'action', label: 'Open exchange account, buy BTC', x: 240, y: 120, prob: 70, desc: 'Avg first purchase: $100-500', source: 'Coinbase data' },
      { id: 3, type: 'bottleneck', label: 'Survive first -30% crash', x: 480, y: 120, prob: 40, desc: 'BTC has 5-10 crashes of 30%+ per cycle', source: 'CoinGecko historical' },
      { id: 4, type: 'outcome-bad', label: 'Panic sell at loss', x: 480, y: 300, prob: 100, desc: '80% of retail traders sell at a loss', source: 'Chainalysis 2024' },
      { id: 5, type: 'decision', label: 'Start trading altcoins?', x: 720, y: 120, prob: 60, desc: 'Altcoin greed: 10-100x gains advertised everywhere', source: 'Crypto Twitter' },
      { id: 6, type: 'bottleneck', label: 'Navigate altcoin casino', x: 960, y: 120, prob: 10, desc: '95% of altcoins lose value vs BTC over 4 years', source: 'Messari research' },
      { id: 7, type: 'outcome-bad', label: 'Lost money on shitcoins/rugs', x: 960, y: 300, prob: 100, desc: '$3.9B lost to crypto scams/rugs in 2024', source: 'Chainalysis' },
      { id: 8, type: 'decision', label: 'Net positive after full cycle?', x: 1200, y: 120, prob: 20, desc: 'Only 10-20% of crypto traders are profitable long-term', source: 'Academic studies' },
      { id: 9, type: 'outcome-good', label: 'Built real crypto wealth', x: 1440, y: 60, prob: 100, desc: 'HODLers who held 4+ years: 95% profitable', source: 'Glassnode' },
      { id: 10, type: 'outcome-bad', label: 'Broke + emotional damage', x: 1440, y: 220, prob: 100, desc: 'Avg retail crypto investor underperforms BTC buy-and-hold by 40%', source: 'MIT study' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  // ====== RICHARD'S PERSONAL TEMPLATES ======
  richard_cafepedia: {
    title: 'Cafepedia to Revenue',
    input: 'A solo founder in Indonesia builds a cafe search engine and tries to monetize it',
    nodes: [
      { id: 1, type: 'start', label: 'Build the product (done)', x: 0, y: 120, prob: 100, desc: '764K places in DB, 3,386 enriched — product exists', source: 'Cafepedia internal' },
      { id: 2, type: 'bottleneck', label: 'Get first 10 paying cafes', x: 260, y: 120, prob: 15, desc: 'B2B cold outreach: 1-5% conversion rate typical', source: 'HubSpot 2024' },
      { id: 3, type: 'outcome-bad', label: 'Zero revenue — again', x: 260, y: 320, prob: 100, desc: 'Pattern: perfect product, zero clients — must break this cycle', source: 'Personal history' },
      { id: 4, type: 'action', label: 'Walk into cafes, pitch in person', x: 520, y: 120, prob: 100, desc: 'In-person B2B close rate: 25-40% vs 1-5% cold email', source: 'RAIN Group' },
      { id: 5, type: 'bottleneck', label: 'Cafe owner says yes?', x: 780, y: 120, prob: 35, desc: 'Indonesian SMBs: 300K IDR/mo is budget dust, but trust is everything', source: 'Local market' },
      { id: 6, type: 'outcome-bad', label: 'Not interested / no budget', x: 780, y: 320, prob: 100, desc: '65% of SMBs say no to first pitch', source: 'Sales benchmark' },
      { id: 7, type: 'bottleneck', label: 'Reach 50 paying cafes', x: 1040, y: 120, prob: 30, desc: '50 x 300K = 15M IDR/mo — covers basic costs', source: 'Revenue model' },
      { id: 8, type: 'outcome-bad', label: 'Stuck at 5-10 clients', x: 1040, y: 320, prob: 100, desc: 'Most local SaaS plateau early without sales system', source: 'Estimated' },
      { id: 9, type: 'outcome-good', label: 'Sustainable local business', x: 1300, y: 60, prob: 100, desc: '200+ cafes = 60M IDR/mo — real business', source: 'Revenue target' },
      { id: 10, type: 'outcome-bad', label: 'Another project that dies', x: 1300, y: 280, prob: 100, desc: 'Trading, Perth Alert, Deal Engine — all built, zero revenue', source: 'Personal pattern' },
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
      { id: 1, type: 'desire', label: 'Want a different life', x: 0, y: 120, prob: 100, desc: '4.5M Italians live abroad, fastest-growing diaspora', source: 'AIRE 2024' },
      { id: 2, type: 'bottleneck', label: 'Actually leave comfort zone', x: 260, y: 120, prob: 12, desc: '88% of people who "want to move" never do', source: 'Gallup World Poll' },
      { id: 3, type: 'outcome-bad', label: 'Still dreaming in 5 years', x: 260, y: 320, prob: 100, desc: 'Comfort zone wins for the majority', source: 'Behavioral economics' },
      { id: 4, type: 'action', label: 'Land in new country, figure it out', x: 520, y: 120, prob: 100, desc: 'First 90 days: visa, housing, language, loneliness', source: 'Expat surveys' },
      { id: 5, type: 'bottleneck', label: 'Build income stream abroad', x: 780, y: 120, prob: 30, desc: '70% of expats struggle financially in first 2 years', source: 'HSBC Expat Survey' },
      { id: 6, type: 'outcome-bad', label: 'Forced to go back home', x: 780, y: 320, prob: 100, desc: '25% of expats return within 2 years', source: 'InterNations 2024' },
      { id: 7, type: 'decision', label: 'Found community + purpose?', x: 1040, y: 120, prob: 45, desc: 'Social integration is #1 predictor of expat success', source: 'InterNations' },
      { id: 8, type: 'outcome-good', label: 'Built a real life abroad', x: 1300, y: 60, prob: 100, desc: 'The 15% who make it call it the best decision ever', source: 'Expat surveys' },
      { id: 9, type: 'outcome-bad', label: 'Isolated and stuck', x: 1300, y: 280, prob: 100, desc: 'Expat loneliness: 50% report feeling more alone than back home', source: 'InterNations 2024' },
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
      { id: 1, type: 'start', label: 'Fall in love across faiths', x: 0, y: 120, prob: 100, desc: 'Interfaith couples: 21% of marriages in Indonesia', source: 'Pew Research 2023' },
      { id: 2, type: 'bottleneck', label: 'Family acceptance?', x: 260, y: 120, prob: 40, desc: '60% of interfaith couples face family opposition initially', source: 'ISSP data' },
      { id: 3, type: 'outcome-bad', label: 'Family says no, pressure wins', x: 260, y: 320, prob: 100, desc: 'In collectivist cultures, family pressure breaks 50%+ of couples', source: 'Cross-cultural studies' },
      { id: 4, type: 'decision', label: 'Navigate legal/religious requirements', x: 520, y: 120, prob: 50, desc: 'Indonesia requires same-religion marriage — legal complexity', source: 'Indonesian Marriage Law' },
      { id: 5, type: 'outcome-bad', label: 'Legal barriers too high', x: 520, y: 320, prob: 100, desc: 'Many couples marry abroad to bypass local law', source: 'Legal practice' },
      { id: 6, type: 'bottleneck', label: 'Sustain mutual respect long-term', x: 780, y: 120, prob: 55, desc: 'Interfaith marriages that survive 10+ years: ~55%', source: 'Pew Research' },
      { id: 7, type: 'outcome-bad', label: 'Values diverge over time', x: 780, y: 320, prob: 100, desc: 'Children, holidays, identity — the pressure compounds', source: 'Marriage studies' },
      { id: 8, type: 'outcome-good', label: 'Beautiful bridge between worlds', x: 1040, y: 60, prob: 100, desc: 'Successful interfaith couples report higher empathy and resilience', source: 'Gottman Institute' },
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
      { id: 1, type: 'start', label: 'New idea excites you', x: 0, y: 120, prob: 100, desc: '90% of entrepreneurs are addicted to the building phase', source: 'Behavioral research' },
      { id: 2, type: 'action', label: 'Research obsessively, plan perfectly', x: 260, y: 120, prob: 100, desc: 'Analysis paralysis: avg entrepreneur spends 6 months planning', source: 'GEM Report' },
      { id: 3, type: 'action', label: 'Build an impressive product', x: 520, y: 120, prob: 100, desc: 'Technical founders spend 80% time building, 20% selling', source: 'First Round Review' },
      { id: 4, type: 'bottleneck', label: 'Start selling? (the hard part)', x: 780, y: 120, prob: 20, desc: 'Only 20% of builders ever do real sales outreach', source: 'Indie Hackers survey' },
      { id: 5, type: 'outcome-bad', label: 'Beautiful product, zero clients', x: 780, y: 320, prob: 100, desc: 'The graveyard of perfect products nobody uses', source: 'Pattern recognition' },
      { id: 6, type: 'bottleneck', label: 'Handle rejection daily', x: 1040, y: 120, prob: 35, desc: 'Sales requires 50+ "no" before patterns emerge', source: 'RAIN Group' },
      { id: 7, type: 'outcome-bad', label: 'Quit after 10 rejections', x: 1040, y: 320, prob: 100, desc: '65% of salespeople give up after 5 contacts', source: 'Marketing Donut' },
      { id: 8, type: 'outcome-good', label: 'First revenue — pattern broken', x: 1300, y: 60, prob: 100, desc: 'The first dollar is the hardest — then compounding kicks in', source: 'YC wisdom' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
  richard_first_million: {
    title: 'Path to First $100K from Indonesia',
    input: 'A young entrepreneur in Indonesia tries to reach $100K in savings',
    nodes: [
      { id: 1, type: 'start', label: 'Start from near-zero in a low-cost country', x: 0, y: 120, prob: 100, desc: 'Indonesia avg salary: $300-500/mo — need leverage', source: 'BPS 2024' },
      { id: 2, type: 'decision', label: 'Earn in USD, spend in IDR?', x: 260, y: 120, prob: 60, desc: 'Geo-arbitrage: 1 USD = 16,000 IDR — 5-10x purchasing power', source: 'Exchange rate' },
      { id: 3, type: 'outcome-bad', label: 'Stuck in local salary trap', x: 260, y: 320, prob: 100, desc: 'Local salary max for most: 10-20M IDR/mo ($625-1250)', source: 'Glassdoor ID' },
      { id: 4, type: 'bottleneck', label: 'Build $2K/mo income stream', x: 520, y: 120, prob: 25, desc: '$2K/mo from Indonesia = top 5% lifestyle', source: 'Cost of living data' },
      { id: 5, type: 'outcome-bad', label: 'Inconsistent gig income', x: 520, y: 320, prob: 100, desc: '75% of remote workers from developing countries earn <$1K/mo', source: 'Payoneer 2024' },
      { id: 6, type: 'bottleneck', label: 'Scale to $5K+/mo', x: 780, y: 120, prob: 30, desc: 'From $2K to $5K requires systems, not just hustle', source: 'Indie Hackers' },
      { id: 7, type: 'outcome-bad', label: 'Plateau at $2-3K/mo', x: 780, y: 320, prob: 100, desc: 'Comfortable but not building wealth — lifestyle trap', source: 'Digital nomad surveys' },
      { id: 8, type: 'decision', label: 'Save 50%+ consistently?', x: 1040, y: 120, prob: 40, desc: 'At $5K/mo saving $3K = $100K in ~3 years', source: 'Math' },
      { id: 9, type: 'outcome-good', label: '$100K saved — freedom', x: 1300, y: 60, prob: 100, desc: '$100K in Indonesia = 5+ years of runway or investment capital', source: 'Financial planning' },
      { id: 10, type: 'outcome-bad', label: 'Lifestyle inflation eats savings', x: 1300, y: 280, prob: 100, desc: 'Parkinson law of money: spending expands to match income', source: 'Behavioral finance' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  richard_perfectionism: {
    title: 'Perfectionism Trap',
    input: 'Someone with high standards keeps polishing instead of shipping',
    nodes: [
      { id: 1, type: 'start', label: 'High standards, big vision', x: 0, y: 120, prob: 100, desc: 'Perfectionism rising: 33% increase in young people since 1989', source: 'APA 2023' },
      { id: 2, type: 'action', label: 'Work obsessively on details', x: 260, y: 120, prob: 100, desc: 'Perfectionists spend 2-3x longer on tasks vs "good enough"', source: 'Psychology Today' },
      { id: 3, type: 'bottleneck', label: 'Ship before it feels ready?', x: 520, y: 120, prob: 25, desc: '"If you are not embarrassed by v1, you launched too late" — Reid Hoffman', source: 'LinkedIn founder' },
      { id: 4, type: 'outcome-bad', label: 'Never ships — eternal WIP', x: 520, y: 320, prob: 100, desc: '75% of side projects never see the light of day', source: 'Dev surveys' },
      { id: 5, type: 'bottleneck', label: 'Handle imperfect feedback', x: 780, y: 120, prob: 50, desc: 'First users always find problems — can you not take it personally?', source: 'Product management' },
      { id: 6, type: 'outcome-bad', label: 'One critique, back to hiding', x: 780, y: 320, prob: 100, desc: 'Perfectionists interpret feedback as personal failure', source: 'CBT research' },
      { id: 7, type: 'outcome-good', label: 'Iterate fast, improve from feedback', x: 1040, y: 60, prob: 100, desc: 'Speed of iteration beats quality of iteration', source: 'Eric Ries, Lean Startup' },
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
      { id: 1, type: 'start', label: 'Called to build, not just survive', x: 0, y: 120, prob: 100, desc: '"Whatever you do, work at it with all your heart" — Colossians 3:23', source: 'Bible' },
      { id: 2, type: 'decision', label: 'Serve people or chase money?', x: 260, y: 120, prob: 65, desc: 'Purpose-driven companies outperform market by 400%', source: 'Firms of Endearment study' },
      { id: 3, type: 'outcome-bad', label: 'Greed corrupts the mission', x: 260, y: 320, prob: 100, desc: '"For the love of money is a root of all evil" — 1 Timothy 6:10', source: 'Bible' },
      { id: 4, type: 'bottleneck', label: 'Stay ethical when it costs money', x: 520, y: 120, prob: 50, desc: '50% of entrepreneurs face ethical dilemma in first 2 years', source: 'HBS research' },
      { id: 5, type: 'outcome-bad', label: 'Compromise values for profit', x: 520, y: 320, prob: 100, desc: 'Short-term gain, long-term regret — trust destroyed', source: 'Edelman Trust' },
      { id: 6, type: 'bottleneck', label: 'Generosity while bootstrapping?', x: 780, y: 120, prob: 40, desc: 'Tithing entrepreneurs report higher satisfaction and growth', source: 'Generous Giving study' },
      { id: 7, type: 'outcome-bad', label: 'Scarcity mindset blocks giving', x: 780, y: 320, prob: 100, desc: 'Fear of not having enough kills generosity', source: 'Psychology research' },
      { id: 8, type: 'outcome-good', label: 'Wealth as a tool for good', x: 1040, y: 60, prob: 100, desc: '"Rich in good works, generous, ready to share" — 1 Timothy 6:18', source: 'Bible' },
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
      { id: 1, type: 'desire', label: 'Want to provide and protect', x: 0, y: 120, prob: 100, desc: '72% of men cite "providing" as core to their identity', source: 'Pew Research 2023' },
      { id: 2, type: 'bottleneck', label: 'Find reliable income abroad', x: 260, y: 120, prob: 35, desc: '65% of young expats struggle with stable income first 2 years', source: 'HSBC Expat' },
      { id: 3, type: 'outcome-bad', label: 'Dependent on others — shame spiral', x: 260, y: 320, prob: 100, desc: 'Financial dependence linked to depression in men', source: 'APA studies' },
      { id: 4, type: 'bottleneck', label: 'Build $3K+/mo consistently', x: 520, y: 120, prob: 30, desc: '$3K/mo in Indonesia = provides comfortably + saves', source: 'Cost of living' },
      { id: 5, type: 'outcome-bad', label: 'Income swings, anxiety persists', x: 520, y: 320, prob: 100, desc: 'Inconsistent income is worse psychologically than low but stable', source: 'Behavioral econ' },
      { id: 6, type: 'decision', label: 'Support family + save + grow?', x: 780, y: 120, prob: 40, desc: 'Triple constraint: lifestyle, family obligations, investment', source: 'Financial planning' },
      { id: 7, type: 'outcome-bad', label: 'Burnt out trying to do everything', x: 780, y: 320, prob: 100, desc: 'Provider burnout: when the pressure exceeds the capacity', source: 'Mental health data' },
      { id: 8, type: 'outcome-good', label: 'Stable, respected, at peace', x: 1040, y: 60, prob: 100, desc: 'Financial stability + purpose = highest male life satisfaction', source: 'Gallup wellbeing' },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'no' }, { from: 6, to: 8, label: 'yes' },
    ]
  },
  richard_polymarket: {
    title: 'Prediction Market Trading',
    input: 'Someone tries to make consistent profit trading on Polymarket',
    nodes: [
      { id: 1, type: 'start', label: 'Discover prediction markets', x: 0, y: 120, prob: 100, desc: 'Polymarket: $1B+ monthly volume in 2025', source: 'Polymarket data' },
      { id: 2, type: 'action', label: 'Deposit and start trading', x: 260, y: 120, prob: 100, desc: 'USDC on Polygon — low barrier to entry', source: 'Polymarket' },
      { id: 3, type: 'bottleneck', label: 'Beat the market consistently?', x: 520, y: 120, prob: 20, desc: 'Prediction markets are efficient — hard to find alpha', source: 'Academic research' },
      { id: 4, type: 'outcome-bad', label: 'Emotional trading, lose money', x: 520, y: 320, prob: 100, desc: '80% of retail traders lose money in any market', source: 'SEC data' },
      { id: 5, type: 'decision', label: 'Build systematic edge (bots/data)?', x: 780, y: 120, prob: 30, desc: 'Algorithmic traders capture 60-80% of market alpha', source: 'Market microstructure' },
      { id: 6, type: 'outcome-bad', label: 'Manual trading, slow bleed', x: 780, y: 320, prob: 100, desc: 'Without edge, you are the liquidity for smarter players', source: 'Trading axiom' },
      { id: 7, type: 'bottleneck', label: 'Scale without blowing up', x: 1040, y: 120, prob: 40, desc: 'Position sizing and risk management separate winners from losers', source: 'Kelly Criterion' },
      { id: 8, type: 'outcome-good', label: 'Consistent profits + compounding', x: 1300, y: 60, prob: 100, desc: 'Top Polymarket traders: 20-50% annual returns', source: 'Leaderboard data' },
      { id: 9, type: 'outcome-bad', label: 'One bad bet wipes gains', x: 1300, y: 280, prob: 100, desc: 'Concentration risk: one event can erase months of profit', source: 'Risk management' },
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
      { id: 1, type: 'start', label: 'Trading hours for dollars', x: 0, y: 120, prob: 100, desc: '85% of workers are paid hourly/salary — linear income', source: 'BLS 2024' },
      { id: 2, type: 'desire', label: 'Want income while sleeping', x: 260, y: 120, prob: 100, desc: '"If you don\'t find a way to make money while you sleep..." — Buffett', source: 'Warren Buffett' },
      { id: 3, type: 'bottleneck', label: 'Build something that works without you', x: 520, y: 120, prob: 15, desc: 'Code, content, capital — only 3 forms of true leverage', source: 'Naval Ravikant' },
      { id: 4, type: 'outcome-bad', label: 'Self-employed but still trading time', x: 520, y: 320, prob: 100, desc: 'Most freelancers/consultants just bought themselves a job', source: 'E-Myth' },
      { id: 5, type: 'decision', label: 'Product or audience first?', x: 780, y: 120, prob: 50, desc: 'Audience-first has 3x higher success rate than product-first', source: 'SPI research' },
      { id: 6, type: 'bottleneck', label: 'Reach $5K/mo passive/semi-passive', x: 1040, y: 120, prob: 20, desc: 'Only 4% of online businesses reach $5K/mo', source: 'Indie Hackers' },
      { id: 7, type: 'outcome-bad', label: '$200/mo — not enough to live on', x: 1040, y: 320, prob: 100, desc: 'Median online business revenue: $0-500/mo', source: 'Stripe data' },
      { id: 8, type: 'outcome-good', label: 'Time freedom + growing income', x: 1300, y: 60, prob: 100, desc: 'The 4% who break through report highest life satisfaction', source: 'Lifestyle surveys' },
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
