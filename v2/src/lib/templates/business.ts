import type { Template } from '../templates';

export const businessTemplates: Record<string, Template> = {
  startup: {
    title: 'Launch a Startup',
    input: 'I want to launch a startup',
    nodes: [
      { id: 1, type: 'desire', label: 'Have a startup idea', x: 0, y: 100, prob: 100, desc: '90% of adults have business ideas', source: 'Gallup 2025 | GEM Global Report 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Actually start building?', x: 240, y: 100, prob: 8, desc: 'Only 5-10% of people act on their ideas', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 12, type: 'outcome-bad', label: 'Never started', x: 240, y: 300, prob: 100, desc: '92% talk about it but never begin', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'gate', label: 'Run out of money', x: 480, y: 100, prob: 38, desc: '38% of startups fail from cash problems', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Dead: no funding', x: 480, y: 300, prob: 100, desc: '62% never raise or run dry', source: 'CB Insights 2025 | Crunchbase 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 13, type: 'state', label: 'Zombie company, surviving but not growing', x: 480, y: 250, prob: 100, desc: 'Burning fumes, no clear path forward but not dead yet — the worst limbo', source: 'CB Insights 2025 | PitchBook 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 14, type: 'bottleneck', label: 'Converts to growth?', x: 720, y: 250, prob: 20, desc: 'Zombie startups rarely recover — most just delay death', source: 'Startup Genome 2025 | Y Combinator 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 15, type: 'outcome-bad', label: 'Trapped in zombie mode', x: 720, y: 400, prob: 100, desc: 'Not dead, not alive — founders stuck for years', source: 'Y Combinator 2025 | First Round Capital 2025', sourceUrl: 'https://www.ycombinator.com/companies', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 5, type: 'decision', label: 'Find product-market fit?', x: 720, y: 100, prob: 40, desc: 'Only 40% of funded startups find PMF', source: 'Startup Genome 2025 | a16z 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Nobody wants this', x: 720, y: 300, prob: 100, desc: '#1 reason startups die: no market need', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 7, type: 'bottleneck', label: 'Scale the team', x: 960, y: 100, prob: 60, desc: '23% fail from wrong team', source: 'CB Insights 2025 | Noam Wasserman 2023', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-025', 'SR-026'] },
      { id: 8, type: 'outcome-bad', label: 'Team implodes', x: 960, y: 300, prob: 100, desc: 'Co-founder conflict kills 65%', source: 'Noam Wasserman 2023 | Harvard Business Review 2025', sourceUrl: 'https://noamwasserman.com/research/', sacredRoots: ['SR-026', 'SR-025'] },
      { id: 9, type: 'decision', label: 'Reach profitability?', x: 1200, y: 100, prob: 33, desc: 'Only 33% of VC-backed reach profit', source: 'PitchBook 2025 | NVCA Yearbook 2025', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 10, type: 'outcome-good', label: 'Sustainable business', x: 1440, y: 40, prob: 100, desc: '~6% of all startups reach this', source: 'Startup Genome 2025 | PitchBook 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 11, type: 'outcome-bad', label: 'Zombie company', x: 1440, y: 220, prob: 100, desc: 'Alive but not growing', source: 'Y Combinator 2025 | Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-007', 'SR-010'] },
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
      { id: 1, type: 'start', label: 'Pick a painful problem', x: 0, y: 120, prob: 100, desc: '42% of startups fail: no market need', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 2, type: 'action', label: 'Validate with 10 people', x: 240, y: 120, prob: 100, desc: 'Talk to real potential buyers', source: 'The Mom Test 2023 | Y Combinator 2025', sourceUrl: 'https://www.ycombinator.com/companies', sacredRoots: ['SR-035', 'SR-009'] },
      { id: 3, type: 'gate', label: 'Will they pay?', x: 480, y: 120, prob: 30, desc: '"Interested" ≠ paying. Only 30% convert from interest to wallet', source: 'Gartner 2025 | HubSpot Sales Report 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-035', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'Nobody pays — pivot', x: 480, y: 300, prob: 100, desc: 'Most common outcome for first ideas', source: 'Y Combinator 2025 | CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-005', 'SR-009'] },
      { id: 11, type: 'state', label: 'Interest but no conversion', x: 480, y: 270, prob: 100, desc: 'People say "cool" and "I would buy this" but wallets stay shut — the cruelest validation', source: 'Gartner 2025 | McKinsey Consumer Report 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-010', 'SR-023'] },
      { id: 12, type: 'bottleneck', label: 'Converts to paying?', x: 720, y: 270, prob: 20, desc: 'Warm interest rarely converts without urgency or scarcity', source: 'HubSpot Sales Report 2025 | Salesforce State of Sales 2025', sourceUrl: 'https://www.hubspot.com/state-of-marketing', sacredRoots: ['SR-010', 'SR-016'] },
      { id: 13, type: 'outcome-bad', label: 'Eternal "almost" customers', x: 720, y: 420, prob: 100, desc: 'Pipeline full of maybes, bank account empty', source: 'Salesforce State of Sales 2025 | Gartner 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-023', 'SR-007'] },
      { id: 5, type: 'action', label: 'Build MVP + first sale', x: 720, y: 120, prob: 100, desc: 'Smallest version that solves the problem', source: 'Lean Startup 2023 | Y Combinator 2025', sourceUrl: 'https://www.ycombinator.com/companies', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Get 10 paying customers', x: 960, y: 120, prob: 35, desc: '65% of products never reach 10 customers', source: 'Baremetrics 2025 | Indie Hackers 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 7, type: 'outcome-bad', label: 'No traction, die slowly', x: 960, y: 300, prob: 100, desc: 'Product exists but nobody buys it', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 8, type: 'decision', label: 'Retention > 40%?', x: 1200, y: 120, prob: 45, desc: 'Month 2 retention is the real test', source: 'Lenny Rachitsky 2025 | Mixpanel Benchmarks 2025', sourceUrl: 'https://www.lennysnewsletter.com/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 9, type: 'outcome-good', label: 'Sustainable business', x: 1440, y: 60, prob: 100, desc: 'Revenue grows via word-of-mouth + retention', source: 'First Round Capital 2025 | Bain & Company 2025', sourceUrl: 'https://stateofstartups.firstround.com/', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Leaky bucket — churn wins', x: 1440, y: 240, prob: 100, desc: 'Acquiring faster than retaining = death', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-031', 'SR-035'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'no' }, { from: 3, to: 11, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 5, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  upworkMoneyTree: {
    title: 'Upwork Money Tree',
    input: 'I want to make money on Upwork as a freelancer',
    nodes: [
      // Main funnel: A → B → C → D → E
      { id: 1, type: 'state', label: '1000 people want to make money on Upwork', x: 0, y: 200, prob: 100, desc: 'Upwork has 18M+ registered freelancers (SEC FY2024). This model tracks 1000 new signups through the funnel', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.demandsage.com/upwork-statistics/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'action', label: 'Create account', x: 200, y: 200, prob: 100, desc: 'Sign up on Upwork', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211063208', sacredRoots: ['SR-008'] },
      { id: 3, type: 'state', label: '600-700 complete profile', x: 400, y: 200, prob: 65, desc: '30-40% abandon during profile creation', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211063208', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'action', label: '300-400 approved, 200-350 send first proposal', x: 650, y: 200, prob: 54, desc: '~54% of completed profiles approved, ~70% of approved send proposals', source: 'Upwork 2025 | upwork-data.json (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/34955398999699-What-are-Upwork-Connects', sacredRoots: ['SR-008', 'SR-012'] },
      { id: 5, type: 'gate', label: 'Gets first interview response?', x: 900, y: 200, prob: 15, desc: '70-85% get zero response, 10-20% partial, 5-15% yes', source: 'Upwork Community Data 2025 | upwork-data.json (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gigradar.io/blog/upwork-metrics-benchmarks-for-agencies', sacredRoots: ['SR-010', 'SR-035'] },

      // NO path (70-85%): N0 → N1 → N2 → N3 → N4, N2 → N5 → N6
      { id: 10, type: 'state', label: 'No interview response after first proposal wave', x: 900, y: 480, prob: 100, desc: '70-85% of proposers never hear back', source: 'Upwork Community 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 11, type: 'trajectory', label: 'High-friction new freelancer path', x: 1100, y: 480, prob: 100, desc: 'Generic proposals, no portfolio, no reviews', source: 'Upwork Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 12, type: 'action', label: 'Keep sending generic proposals', x: 1300, y: 420, prob: 100, desc: 'Same approach, hoping for different results', source: 'Upwork Community 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 13, type: 'outcome-bad', label: 'Never earns meaningful income', x: 1500, y: 420, prob: 100, desc: 'A large share never earns meaningful income', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-reports-fourth-quarter-and-full-year-2025-financial-results', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 14, type: 'action', label: 'Stop early / burn connects', x: 1300, y: 540, prob: 100, desc: 'Runs out of connects, gets discouraged', source: 'Upwork Community 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 15, type: 'outcome-bad', label: 'Many churn within year 1', x: 1500, y: 540, prob: 100, desc: 'Burns connects, frustrated, leaves platform', source: 'Upwork Community Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.demandsage.com/upwork-statistics/', sacredRoots: ['SR-010', 'SR-005'] },

      // PARTIAL path (10-20%): P0 → P1 → P2 → P3 → P4, P2 → P5 → P6 → P7/P8
      { id: 20, type: 'state', label: 'Gets interview but no hire yet', x: 900, y: -50, prob: 100, desc: '10-20% of proposers reach interview stage', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 21, type: 'trajectory', label: 'Early traction, no conversion', x: 1100, y: -50, prob: 100, desc: 'Getting interviews but failing to close', source: 'Upwork Community 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 22, type: 'action', label: 'Compete on price / generic profile', x: 1300, y: -130, prob: 100, desc: 'Races to bottom on pricing', source: 'Upwork Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-023', 'SR-010'] },
      { id: 23, type: 'outcome-bad', label: 'Stays in low-trust pipeline', x: 1500, y: -130, prob: 100, desc: 'Cheap work, no reputation, no growth', source: 'Upwork Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-023', 'SR-010'] },
      { id: 24, type: 'action', label: 'Improve niche, portfolio, speed', x: 1300, y: 30, prob: 100, desc: 'Invests in positioning and quality', source: 'Upwork Top Freelancer Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/in-demand-skills-2026', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 25, type: 'bottleneck', label: 'Converts interview to hire?', x: 1500, y: 30, prob: 35, desc: '~20-50% depending on positioning. Generic profile: ~20%. Niche + portfolio + fast response: ~50%', source: 'Upwork Top Freelancer Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gigradar.io/blog/benchmark-overview-reply-shortlist-win-rates-by-category-budget', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 26, type: 'outcome-bad', label: 'Stuck at interview stage', x: 1700, y: -30, prob: 100, desc: 'Gets interviews but never closes', source: 'Upwork Community 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-023'] },
      { id: 27, type: 'state', label: 'Moves into first-hire path', x: 1700, y: 80, prob: 100, desc: 'Joins the YES path from partial', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-035'] },

      // YES path (5-15%): Y0 → Y1 → Y2 → branches
      { id: 30, type: 'state', label: '20-40 get first hire (2-4% of signups)', x: 1100, y: 200, prob: 100, desc: 'Only 2-4% of original 1000 land their first job', source: 'Upwork Marketplace Data 2025 | upwork-data.json (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-reports-fourth-quarter-and-full-year-2025-financial-results', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 31, type: 'trajectory', label: 'Validated Upwork path', x: 1350, y: 200, prob: 100, desc: 'First hire proves the model works', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-035'] },

      // Y2 branch 1: deliver → earn $100+
      { id: 32, type: 'action', label: 'Deliver well, get review, refine proposals', x: 1600, y: 120, prob: 100, desc: 'Build reputation through quality work', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 33, type: 'outcome-good', label: '15-30 earn $100+ in 90 days (60-80% of first hires)', x: 1850, y: 120, prob: 75, desc: '60-80% of first hires earn $100+ within 90 days', source: 'Upwork Earnings Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-031'] },

      // Y2 branch 2: stay active → retention
      { id: 34, type: 'action', label: 'Stay active for 1 year', x: 1600, y: 200, prob: 100, desc: 'Consistent presence on platform', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 35, type: 'state', label: '5-15 remain active after year 1 (0.5-1.5%)', x: 1850, y: 200, prob: 50, desc: '0.5-1.5% of original signups still active at month 12', source: 'Upwork Retention Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.demandsage.com/upwork-statistics/', sacredRoots: ['SR-010', 'SR-012'] },

      // Y2 branch 3: specialize
      { id: 36, type: 'action', label: 'Specialize and raise conversion', x: 1600, y: 280, prob: 100, desc: 'Pick a niche, build expertise', source: 'Upwork Top Freelancer Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/in-demand-skills-2026', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 37, type: 'state', label: 'Specialists convert 10-20% vs generalists 2-5%', x: 1850, y: 280, prob: 100, desc: 'Specialization is the #1 lever for success', source: 'Upwork Top Freelancer Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/in-demand-skills-2026', sacredRoots: ['SR-035', 'SR-012'] },

      // Y2 branch 4: repeat clients → $10k bottleneck
      { id: 38, type: 'action', label: 'Build repeat clients', x: 1600, y: 360, prob: 100, desc: 'Turn one-off jobs into ongoing relationships', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/resources/investor-faqs/', sacredRoots: ['SR-026', 'SR-032'] },
      { id: 39, type: 'state', label: 'Repeat clients significantly improve retention', x: 1850, y: 360, prob: 100, desc: 'Repeat work is the foundation of freelance income', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/resources/investor-faqs/', sacredRoots: ['SR-026', 'SR-032'] },
      { id: 40, type: 'action', label: 'Sustain path into year 2', x: 2100, y: 360, prob: 100, desc: 'Keep delivering, keep growing', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 41, type: 'bottleneck', label: 'Reaches $10k/year by year 2?', x: 2350, y: 360, prob: 30, desc: 'Only 0.3-1% of original 1000 reach $10k/year', source: 'Upwork Earnings Distribution 2025 | upwork-data.json (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-reports-fourth-quarter-and-full-year-2025-financial-results', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 42, type: 'outcome-good', label: '3-10 of 1000 reach $10k/year (0.3-1%)', x: 2600, y: 300, prob: 100, desc: 'The Upwork success story', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-reports-fourth-quarter-and-full-year-2025-financial-results', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 43, type: 'outcome-bad', label: 'Active but earning $2-5k/year', x: 2600, y: 430, prob: 100, desc: 'Typical active freelancer income remains low', source: 'Upwork Earnings Distribution 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://passivesecrets.com/upwork-statistics/', sacredRoots: ['SR-031', 'SR-010'] },

      // SUCCESS convergence node
      { id: 50, type: 'outcome-good', label: 'First real traction on Upwork', x: 2100, y: 180, prob: 100, desc: 'Multiple paths lead here: earnings, retention, specialization, repeat clients, $10k milestone', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      // Gate: NO / PARTIAL / YES
      { from: 5, to: 10, label: 'no (70-85%)' },
      { from: 5, to: 20, label: 'partial (10-20%)' },
      { from: 5, to: 30, label: 'yes (5-15%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 12, to: 13 },
      { from: 11, to: 14 }, { from: 14, to: 15 },
      // PARTIAL path
      { from: 20, to: 21 },
      { from: 21, to: 22, label: 'no' }, { from: 22, to: 23 },
      { from: 21, to: 24, label: 'yes' }, { from: 24, to: 25 },
      { from: 25, to: 26, label: 'fail' }, { from: 25, to: 27, label: 'pass' },
      { from: 27, to: 30 },
      // YES path
      { from: 30, to: 31 },
      { from: 31, to: 32 }, { from: 32, to: 33 },
      { from: 31, to: 34 }, { from: 34, to: 35 },
      { from: 31, to: 36 }, { from: 36, to: 37 },
      { from: 31, to: 38 }, { from: 38, to: 39 }, { from: 39, to: 40 }, { from: 40, to: 41 },
      { from: 41, to: 42, label: 'pass' }, { from: 41, to: 43, label: 'fail' },
      // SUCCESS convergence
      { from: 33, to: 50 }, { from: 35, to: 50 }, { from: 37, to: 50 }, { from: 39, to: 50 }, { from: 42, to: 50 },
    ]
  },
  upworkMoneyTreeMid: {
    title: 'Upwork Money Tree (Analysis)',
    input: 'I want to make money on Upwork as a freelancer',
    nodes: [
      { id: 1, type: 'state', label: '1000 people want to make money on Upwork', x: 0, y: 200, prob: 100, desc: 'Upwork has 18M+ registered freelancers (SEC FY2024). This model tracks 1000 new signups through the funnel', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.demandsage.com/upwork-statistics/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'state', label: '600-700 complete profile, 200-350 send proposals', x: 250, y: 200, prob: 35, desc: '35% abandon profile, ~54% approved, ~70% of approved propose', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'gate', label: 'Gets first interview response?', x: 550, y: 200, prob: 15, desc: '70-85% no response, 10-20% partial, 5-15% yes', source: 'Upwork Community Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211063208', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 10, type: 'trajectory', label: 'High-friction path: generic proposals', x: 550, y: 420, prob: 100, desc: '70-85% never get a response. Keep sending generic proposals or burn connects and quit', source: 'Upwork Community 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 11, type: 'outcome-bad', label: 'Never earns meaningful income or churns year 1', x: 850, y: 420, prob: 100, desc: 'A large share never earns or leaves within 12 months', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 20, type: 'state', label: 'Gets interview but no hire yet', x: 550, y: 0, prob: 100, desc: '10-20% of proposers reach interview stage', source: 'Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 21, type: 'bottleneck', label: 'Converts interview to hire?', x: 850, y: 0, prob: 35, desc: '~20-50% depending on positioning. Generic profile: ~20%. Niche + portfolio: ~50%', source: 'Upwork Top Freelancer Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gigradar.io/blog/benchmark-overview-reply-shortlist-win-rates-by-category-budget', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 22, type: 'outcome-bad', label: 'Stuck: low-trust pipeline', x: 1100, y: -60, prob: 100, desc: 'Competes on price, no reputation growth', source: 'Upwork Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-023', 'SR-010'] },
      { id: 30, type: 'state', label: '20-40 get first hire (2-4% of signups)', x: 850, y: 200, prob: 100, desc: 'Only 2-4% of 1000 land first job', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-reports-fourth-quarter-and-full-year-2025-financial-results', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 31, type: 'state', label: 'Deliver, specialize, build repeat clients', x: 1100, y: 200, prob: 100, desc: 'Specialists convert 10-20% vs generalists 2-5%. Repeat clients improve retention', source: 'Upwork Top Freelancer Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-035', 'SR-026'] },
      { id: 32, type: 'bottleneck', label: 'Reaches $10k/year by year 2?', x: 1400, y: 200, prob: 30, desc: 'Only 0.3-1% of original 1000 reach this milestone', source: 'Upwork Earnings Distribution 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211068358-All-about-your-Job-Success-Score', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 33, type: 'outcome-good', label: '3-10 of 1000 reach $10k/year', x: 1650, y: 130, prob: 100, desc: 'The Upwork success story: 0.3-1% of signups', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 34, type: 'outcome-bad', label: 'Active but $2-5k/year', x: 1650, y: 280, prob: 100, desc: 'Typical active freelancer income stays low', source: 'Upwork Earnings Distribution 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-031', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 10, label: 'no (70-85%)' }, { from: 10, to: 11 },
      { from: 3, to: 20, label: 'partial (10-20%)' }, { from: 20, to: 21 },
      { from: 21, to: 22, label: 'fail' }, { from: 21, to: 30, label: 'pass' },
      { from: 3, to: 30, label: 'yes (5-15%)' },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'pass' }, { from: 32, to: 34, label: 'fail' },
    ]
  },
  upworkMoneyTreeMin: {
    title: 'Upwork Money Tree (Summary)',
    input: 'I want to make money on Upwork as a freelancer',
    nodes: [
      { id: 1, type: 'state', label: '1000 Upwork signups', x: 0, y: 150, prob: 100, desc: '1000 people create an account wanting to earn money', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.demandsage.com/upwork-statistics/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'bottleneck', label: 'Gets first interview? (5-15%)', x: 300, y: 150, prob: 15, desc: '200-350 send proposals, only 5-15% get any response', source: 'Upwork Community Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 3, type: 'outcome-bad', label: '850-950 never earn', x: 300, y: 350, prob: 100, desc: '70-85% get zero response, churn or stagnate', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211063208', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Gets first hire? (2-4%)', x: 600, y: 150, prob: 30, desc: 'Must convert interview to actual paid work', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/34955398999699-What-are-Upwork-Connects', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 5, type: 'bottleneck', label: 'Reaches $10k/year? (0.3-1%)', x: 900, y: 150, prob: 30, desc: 'Needs specialization + repeat clients + year 2 persistence', source: 'Upwork Earnings Distribution 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gigradar.io/blog/upwork-metrics-benchmarks-for-agencies', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-good', label: '3-10 of 1000 make it', x: 1200, y: 100, prob: 100, desc: '0.3-1% reach sustainable Upwork income', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Rest earn $2-5k/year', x: 1200, y: 250, prob: 100, desc: 'Active but low income — the typical outcome', source: 'Upwork Earnings Distribution 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-031', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (85-95%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  cafe: {
    title: 'Open a Cafe',
    input: 'I want to open a cafe',
    nodes: [
      { id: 1, type: 'desire', label: 'Dream of owning a cafe', x: 0, y: 120, prob: 100, desc: 'Top 5 most desired business', source: 'National Restaurant Association 2025 | IBISWorld 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Find location + capital', x: 240, y: 120, prob: 100, desc: 'Cost: 50-200M IDR', source: 'BPS Indonesia 2025 | SWA Magazine 2025', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Location good enough?', x: 480, y: 120, prob: 45, desc: '#1 factor for success', source: 'Restaurant.org 2025 | National Restaurant Association 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 4, type: 'outcome-bad', label: 'Bad location, low traffic', x: 480, y: 300, prob: 100, desc: '55% choose wrong location', source: 'FSR Magazine 2025 | Restaurant Business 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.fsrmagazine.com/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 5, type: 'action', label: 'Open doors, first month', x: 720, y: 120, prob: 100, desc: 'Honeymoon: friends & family', source: 'Toast Restaurant Report 2025 | Square Food Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'gate', label: 'Survive month 3-6', x: 960, y: 120, prob: 40, desc: '60% fail in year 1', source: 'National Restaurant Association 2025 | Bureau of Labor Statistics 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Closed: no customers', x: 960, y: 300, prob: 100, desc: 'Avg cafe lasts 4.5 years', source: 'Bureau of Labor Statistics 2025 | IBISWorld 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.ibisworld.com/industry-statistics/', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 11, type: 'state', label: 'Surviving but barely, thin margins', x: 960, y: 270, prob: 100, desc: 'Every month feels like the last — counting every cup sold, dreading rent day', source: 'National Restaurant Association 2025 | Toast Restaurant Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 12, type: 'bottleneck', label: 'Turns profitable?', x: 1200, y: 270, prob: 20, desc: 'Thin-margin cafes rarely recover without a pivot', source: 'Restaurant Business 2025 | Square Food Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://squareup.com/us/en/townsquare/future-of-restaurants', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 13, type: 'outcome-bad', label: 'Slow death, closed month 9', x: 1200, y: 420, prob: 100, desc: 'Delayed failure — lost more money by staying open longer', source: 'Bureau of Labor Statistics 2025 | Restaurant Business 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.restaurantbusinessonline.com/', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 8, type: 'decision', label: 'Build regulars?', x: 1200, y: 120, prob: 50, desc: '70% revenue from regulars', source: 'Toast POS 2025 | Square Food Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 9, type: 'outcome-good', label: 'Profitable, growing', x: 1440, y: 60, prob: 100, desc: '~17% become profitable', source: 'IBISWorld 2025 | National Restaurant Association 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 10, type: 'outcome-bad', label: 'Breakeven forever', x: 1440, y: 220, prob: 100, desc: 'Survive but never profit', source: 'Restaurant Business 2025 | Toast Restaurant Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-013', 'SR-010'] },
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
      { id: 1, type: 'desire', label: 'Want to be a creator', x: 0, y: 120, prob: 100, desc: '50M+ consider themselves creators', source: 'SignalFire 2025 | Adobe Creator Economy Report 2025', sourceUrl: 'https://www.signalfire.com/blog/creator-economy-map', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Post first content', x: 240, y: 120, prob: 100, desc: 'Only 12% actually post', source: 'Adobe Creator Economy Report 2025 | Linktree Creator Report 2025', sourceUrl: 'https://blog.adobe.com/en/topics/creativity', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 3, type: 'bottleneck', label: 'Stay consistent 90 days', x: 480, y: 120, prob: 20, desc: '80% quit within 90 days', source: 'YouTube Creator Academy 2025 | Epidemic Sound Creator Report 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Quit: no views', x: 480, y: 300, prob: 100, desc: 'Avg: 50 views/video', source: 'Tubics 2025 | Social Blade 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.tubics.com/blog/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 5, type: 'gate', label: 'Reach 1K followers', x: 720, y: 120, prob: 35, desc: '35% of consistent reach 1K', source: 'Linktree Creator Report 2025 | ConvertKit Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'Small audience forever', x: 720, y: 300, prob: 100, desc: 'Median: 500 subscribers', source: 'Social Blade 2025 | Linktree Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 10, type: 'state', label: 'Small audience, 100-500 followers, growth flatlined', x: 720, y: 270, prob: 100, desc: 'Posting into the void — some likes, no momentum, algorithm ignores you', source: 'Linktree Creator Report 2025 | Epidemic Sound Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 11, type: 'bottleneck', label: 'Breaks through?', x: 960, y: 270, prob: 20, desc: 'Going viral is luck — most plateau creators never escape', source: 'Social Blade 2025 | YouTube Creator Academy 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 12, type: 'outcome-bad', label: 'Forever micro-creator', x: 960, y: 420, prob: 100, desc: 'Posting for years to 300 followers — invisible to the world', source: 'Linktree Creator Report 2025 | Adobe Creator Economy Report 2025', sourceUrl: 'https://blog.adobe.com/en/topics/creativity', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'decision', label: 'Monetize?', x: 960, y: 120, prob: 30, desc: '4% earn >$100K/yr', source: 'Linktree Creator Report 2025 | Goldman Sachs 2025', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Full-time creator', x: 1200, y: 60, prob: 100, desc: 'Top 1% earn 90% of revenue', source: 'Goldman Sachs 2025 | SignalFire 2025', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 9, type: 'outcome-bad', label: 'Hobby income only', x: 1200, y: 220, prob: 100, desc: 'Median earns $0/yr', source: 'Linktree Creator Report 2025 | ConvertKit Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-013', 'SR-031'] },
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
      { id: 1, type: 'desire', label: 'See a problem worth solving', x: 0, y: 100, prob: 100, desc: 'Avg dev has 3-5 ideas/year', source: 'Indie Hackers 2025 | Product Hunt 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 2, type: 'action', label: 'Build an MVP', x: 240, y: 100, prob: 100, desc: 'Avg 2-4 months solo', source: 'Y Combinator 2025 | MicroConf 2025', sourceUrl: 'https://www.ycombinator.com/companies', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 3, type: 'gate', label: 'Get 10 paying users', x: 480, y: 100, prob: 25, desc: '75% never get 10 customers', source: 'Baremetrics 2025 | Indie Hackers 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: '$0 MRR forever', x: 480, y: 280, prob: 100, desc: 'Most common outcome', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 12, type: 'state', label: '3-7 customers, real revenue but stalled', x: 480, y: 250, prob: 100, desc: 'Enough to feel real, not enough to matter — the cruelest tease', source: 'Baremetrics 2025 | ChartMogul 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 13, type: 'bottleneck', label: 'Grows past 10?', x: 720, y: 250, prob: 20, desc: 'Most SaaS with 3-7 users stay there forever', source: 'ChartMogul 2025 | Baremetrics 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 14, type: 'outcome-bad', label: 'Stuck at $50-200 MRR forever', x: 720, y: 400, prob: 100, desc: 'Not enough to justify the work, too much to give up', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 5, type: 'bottleneck', label: 'Reach $1K MRR', x: 720, y: 100, prob: 40, desc: '10% reach $1K MRR', source: 'MicroConf 2025 | Baremetrics 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 6, type: 'outcome-bad', label: 'Side project purgatory', x: 720, y: 280, prob: 100, desc: 'Not enough to quit job', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-008', 'SR-007'] },
      { id: 7, type: 'decision', label: 'Churn below 5%?', x: 960, y: 100, prob: 45, desc: 'Avg churn: 5-7%/month', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 8, type: 'bottleneck', label: 'Scale to $10K MRR', x: 1200, y: 100, prob: 50, desc: '$1K to $10K: 11 months avg', source: 'Baremetrics 2025 | Stripe Atlas Report 2025', sourceUrl: 'https://stripe.com/atlas/guides', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-bad', label: 'Churn kills growth', x: 1200, y: 280, prob: 100, desc: 'Leaky bucket', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 10, type: 'outcome-good', label: 'Ramen profitable', x: 1440, y: 40, prob: 100, desc: '~2% of ideas reach this', source: 'Stripe Atlas Report 2025 | Indie Hackers 2025', sourceUrl: 'https://stripe.com/atlas/guides', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 11, type: 'outcome-bad', label: 'Burnout, shut down', x: 1440, y: 200, prob: 100, desc: 'Solo burnout: 72%', source: 'Indie Hackers 2025 | MicroConf Burnout Survey 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-014', 'SR-011'] },
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
      { id: 1, type: 'desire', label: 'Want freedom & flexibility', x: 0, y: 120, prob: 100, desc: '36% of US workforce freelances', source: 'Upwork Freelance Forward 2025 | McKinsey Freelance Economy 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-007', 'SR-011'] },
      { id: 2, type: 'action', label: 'Send proposals', x: 240, y: 120, prob: 100, desc: '10 proposals to first gig', source: 'Upwork Freelance Forward 2025 | Fiverr Business Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 3, type: 'gate', label: 'Land first client', x: 480, y: 120, prob: 45, desc: '55% quit before first client', source: 'Payoneer Global Freelancer Report 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'No clients, back to job', x: 480, y: 300, prob: 100, desc: 'Most common outcome', source: 'Payoneer Global Freelancer Report 2025 | Freelancers Union 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 10, type: 'state', label: 'One small gig but no pattern', x: 480, y: 270, prob: 100, desc: 'Did one $200 project, felt great, then silence — was it a fluke?', source: 'Payoneer Global Freelancer Report 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-001', 'SR-035'] },
      { id: 11, type: 'bottleneck', label: 'Lands a second?', x: 720, y: 270, prob: 20, desc: 'First client is luck, second is proof — most never get there', source: 'Freelancers Union 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 12, type: 'outcome-bad', label: 'One-hit wonder freelancer', x: 720, y: 420, prob: 100, desc: 'Forever chasing that second client', source: 'Freelancers Union 2025 | Payoneer Global Freelancer Report 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Earn $2K+/month', x: 720, y: 120, prob: 40, desc: '31% earn >$75K/yr', source: 'Upwork Freelance Forward 2025 | Payoneer Global Freelancer Report 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'Feast-famine cycle', x: 720, y: 300, prob: 100, desc: '#1 freelance fear', source: 'Freelancers Union 2025 | McKinsey Freelance Economy 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 7, type: 'decision', label: 'Raise rates?', x: 960, y: 120, prob: 50, desc: 'Top 10% earn 3-5x market', source: 'Toptal 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-009', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Premium freelancer', x: 1200, y: 60, prob: 100, desc: '$100K+ earners', source: 'McKinsey Freelance Economy 2025 | Toptal 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 9, type: 'outcome-bad', label: 'Stuck at low rates', x: 1200, y: 220, prob: 100, desc: 'Race to bottom', source: 'Payoneer Global Freelancer Report 2025 | Freelancers Union 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-013', 'SR-009'] },
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
      // ── STARTING STATE ──
      { id: 1, type: 'state', label: '1000 people want to build an app', x: 0, y: 200, prob: 100, desc: '5.7M apps on App Store + Google Play combined. 557K new iOS apps submitted/year. Most never launch.', source: 'data.ai 2025 | Statista App Market 2025', sourceUrl: 'https://www.data.ai/en/go/state-of-mobile-2025', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'desire', label: 'Have an app idea that could work', x: 250, y: 200, prob: 100, desc: 'Every developer has 3-5 ideas/year. But 95% of ideas are solutions looking for a problem.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-017'] },

      // ── VALIDATION PHASE ──
      { id: 3, type: 'action', label: 'Validate the idea (talk to users)', x: 500, y: 200, prob: 100, desc: 'Only 10-15% of app makers do real user research before building. Those who do are 3x more likely to succeed.', source: 'CB Insights 2025 | Y Combinator 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-035', 'SR-009'] },
      { id: 4, type: 'bottleneck', label: 'Problem-solution fit found?', x: 750, y: 200, prob: 25, desc: '~75% of apps fail because they solve a problem nobody has. "No market need" is the #1 reason startups die.', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-035', 'SR-023'] },
      { id: 5, type: 'outcome-bad', label: 'Building something nobody wants', x: 750, y: 420, prob: 100, desc: '42% of failed apps cite "no market need". The builder was too in love with the solution to test the problem.', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-009', 'SR-023'] },

      // ── BUILD PHASE ──
      { id: 6, type: 'state', label: 'Validated idea, ready to build', x: 1000, y: 200, prob: 100, desc: 'Now the real work begins. Avg MVP takes 8-16 weeks solo, $5K-$50K if outsourced.', source: 'Clutch 2025 | GoodFirms 2025', sourceUrl: 'https://clutch.co/resources', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'decision', label: 'Build solo or hire?', x: 1250, y: 200, prob: 60, desc: 'Solo: $0-5K + 3-6 months of nights/weekends. Agency: $40K-$300K. 60% choose solo, most underestimate time 2-3x.', source: 'Clutch 2025', sourceUrl: 'https://clutch.co/resources', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 8, type: 'outcome-bad', label: 'Stuck in development hell', x: 1250, y: 420, prob: 100, desc: '60-70% of indie apps never ship. Scope creep, perfectionism, and burnout kill most projects before launch.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 9, type: 'action', label: 'Build MVP (minimum viable product)', x: 1500, y: 200, prob: 100, desc: 'Key: ship the smallest thing that tests the core hypothesis. 80% of features are never used.', source: 'Mixpanel Benchmarks 2025', sourceUrl: 'https://mixpanel.com/blog/benchmarks/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 10, type: 'bottleneck', label: 'Actually ships the MVP?', x: 1750, y: 200, prob: 35, desc: 'Only ~30-40% of started app projects reach a shippable state. The gap between "almost done" and "done" kills most.', source: 'Indie Hackers 2025 | Product Hunt 2025', sourceUrl: 'https://www.producthunt.com/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 11, type: 'outcome-bad', label: '95% done forever', x: 1750, y: 420, prob: 100, desc: 'The last 5% takes 50% of the time. Many quit here — polishing instead of shipping.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-010', 'SR-012'] },

      // ── APP STORE SUBMISSION ──
      { id: 12, type: 'state', label: 'MVP built, ready to submit', x: 2000, y: 200, prob: 100, desc: 'Apple review takes 24-48hrs avg. Google Play: 1-7 days. Both have strict guidelines.', source: 'Apple App Review 2025 | Google Play Policy 2025', sourceUrl: 'https://developer.apple.com/app-store/review/', sacredRoots: ['SR-003', 'SR-010'] },
      { id: 13, type: 'bottleneck', label: 'App store approval?', x: 2250, y: 200, prob: 75, desc: '~25% of iOS submissions rejected (1.93M rejected in 2024). Top reasons: performance issues, broken links, privacy violations.', source: 'Apple App Review 2025', sourceUrl: 'https://developer.apple.com/app-store/review/', sacredRoots: ['SR-003', 'SR-010'] },
      { id: 14, type: 'outcome-bad', label: 'Rejected, must fix and resubmit', x: 2250, y: 420, prob: 100, desc: 'Each rejection = 1-2 weeks delay. Some apps get stuck in rejection loops for months.', source: 'Apple App Review 2025 | AppFollow 2025', sourceUrl: 'https://appfollow.io/blog', sacredRoots: ['SR-010', 'SR-005'] },

      // ── LAUNCH & TRACTION ──
      { id: 15, type: 'state', label: 'App live on store', x: 2500, y: 200, prob: 100, desc: 'You are now 1 of 5.7M apps. The real competition begins — for attention.', source: 'data.ai 2025', sourceUrl: 'https://www.data.ai/en/go/state-of-mobile-2025', sacredRoots: ['SR-007', 'SR-035'] },
      { id: 16, type: 'action', label: 'Launch marketing (ASO, social, PR)', x: 2750, y: 200, prob: 100, desc: '70% of users discover apps via store search. Proper ASO yields ~12% more downloads. Top 3 search results get 90% of clicks.', source: 'Apple 2025 | data.ai 2025', sourceUrl: 'https://www.data.ai/en/go/state-of-mobile-2025', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 17, type: 'gate', label: 'Gets first 1000 downloads?', x: 3000, y: 200, prob: 20, desc: '~80% of apps never reach 1000 downloads. Avg CPI (cost per install): $1.50-$5.00 iOS, $0.50-$2.00 Android.', source: 'AppsFlyer 2025 | data.ai 2025', sourceUrl: 'https://www.appsflyer.com/resources/', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 18, type: 'outcome-bad', label: 'Ghost app: <100 downloads', x: 3000, y: 420, prob: 100, desc: '70% of apps get under 5K total downloads ever. Most get under 100.', source: 'data.ai 2025 | Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-007', 'SR-035'] },
      { id: 19, type: 'trajectory', label: 'Some downloads but unclear if growing', x: 3000, y: 0, prob: 100, desc: 'Partial traction: 100-500 downloads but no clear growth pattern. Need to decide: iterate or pivot.', source: 'Mixpanel Benchmarks 2025', sourceUrl: 'https://mixpanel.com/blog/benchmarks/', sacredRoots: ['SR-010', 'SR-017'] },

      // ── RETENTION WALL ──
      { id: 20, type: 'state', label: 'Has users, but are they staying?', x: 3250, y: 200, prob: 100, desc: 'Day 1 retention avg: 26%. Day 7: 13%. Day 30: 7%. Banking/News best (30%+ D1), Education worst (2% D30).', source: 'AppsFlyer 2025 | Adjust 2025', sourceUrl: 'https://www.appsflyer.com/resources/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 21, type: 'bottleneck', label: 'Day 30 retention > 7%?', x: 3500, y: 200, prob: 25, desc: 'Only ~25% of apps beat the 7% D30 avg. 96% of users churn within 30 days. This is THE make-or-break metric.', source: 'AppsFlyer 2025 | Adjust Mobile Report 2025', sourceUrl: 'https://www.adjust.com/resources/reports/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 22, type: 'outcome-bad', label: 'Leaky bucket: users in, users out', x: 3500, y: 420, prob: 100, desc: 'Spending money on acquisition but losing users faster than gaining them. Net negative growth.', source: 'AppsFlyer 2025', sourceUrl: 'https://www.appsflyer.com/resources/', sacredRoots: ['SR-031', 'SR-007'] },

      // ── MONETIZATION ──
      { id: 23, type: 'state', label: 'Users retained, ready to monetize', x: 3750, y: 200, prob: 100, desc: 'Freemium conversion: 2-5%. Hard paywall generates 8x more revenue than freemium. Subscriptions: 28% annual retention vs 12% monthly.', source: 'Sensor Tower 2025 | RevenueCat 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 24, type: 'decision', label: 'Which monetization model?', x: 4000, y: 200, prob: 100, desc: 'Subscription (best LTV), freemium (best reach), ads (best for casual), paid upfront (worst conversion). Choose based on category.', source: 'Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 25, type: 'bottleneck', label: 'Reaches $1K MRR?', x: 4250, y: 200, prob: 20, desc: 'Only 0.5-1% of apps earn significant money. Avg app revenue: $1,100/month. Top 1% earn 90%+ of all app store revenue.', source: 'Sensor Tower 2025 | BuildFire 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 26, type: 'outcome-bad', label: 'Revenue < server costs', x: 4250, y: 420, prob: 100, desc: 'Most apps never recoup dev cost. Server + maintenance: $50-500/month minimum. Revenue: $0-50/month typical.', source: 'Sensor Tower 2025 | Statista 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-031', 'SR-007'] },

      // ── GROWTH & SCALE ──
      { id: 27, type: 'state', label: 'Revenue positive, growing', x: 4500, y: 200, prob: 100, desc: 'Past $1K MRR. Now the question is: can it scale? 74% of top apps update monthly, 26% weekly.', source: 'Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 28, type: 'action', label: 'Optimize funnel + iterate features', x: 4750, y: 200, prob: 100, desc: 'Focus on activation rate, onboarding, and core loop. Each 1% improvement in retention = 10-25% more revenue.', source: 'Mixpanel Benchmarks 2025 | Lenny Rachitsky 2025', sourceUrl: 'https://mixpanel.com/blog/benchmarks/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 29, type: 'bottleneck', label: 'Reaches $10K MRR?', x: 5000, y: 200, prob: 30, desc: 'Crossing $10K MRR means you have a real business. Only ~0.1% of all apps reach this milestone.', source: 'Sensor Tower 2025 | Indie Hackers 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 30, type: 'outcome-bad', label: 'Plateau at $1-5K MRR', x: 5000, y: 420, prob: 100, desc: 'Enough to cover costs, not enough to quit your job. The "indie app purgatory" — sustainable but not scalable.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-010', 'SR-013'] },

      // ── OUTCOMES ──
      { id: 31, type: 'outcome-good', label: 'Sustainable app business ($10K+ MRR)', x: 5250, y: 140, prob: 100, desc: 'Top 0.1% of apps. Generates real income, can hire, can scale. Path to acquisition or lifestyle business.', source: 'Sensor Tower 2025 | data.ai 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 32, type: 'state', label: 'Decide: scale or lifestyle?', x: 5250, y: 280, prob: 100, desc: 'At $10K+ MRR you choose: raise funding and scale to millions, or keep it lean as a lifestyle business.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-017', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7 }, { from: 7, to: 8, label: 'no' }, { from: 7, to: 9, label: 'yes' },
      { from: 9, to: 10 }, { from: 10, to: 11, label: 'fail' }, { from: 10, to: 12, label: 'pass' },
      { from: 12, to: 13 }, { from: 13, to: 14, label: 'fail' }, { from: 13, to: 15, label: 'pass' },
      { from: 15, to: 16 }, { from: 16, to: 17 },
      { from: 17, to: 18, label: 'no' }, { from: 17, to: 19, label: 'partial' }, { from: 17, to: 20, label: 'yes' },
      { from: 19, to: 20 },
      { from: 20, to: 21 }, { from: 21, to: 22, label: 'fail' }, { from: 21, to: 23, label: 'pass' },
      { from: 23, to: 24 }, { from: 24, to: 25 },
      { from: 25, to: 26, label: 'fail' }, { from: 25, to: 27, label: 'pass' },
      { from: 27, to: 28 }, { from: 28, to: 29 },
      { from: 29, to: 30, label: 'fail' }, { from: 29, to: 31, label: 'pass' },
      { from: 31, to: 32 },
    ]
  },
  appMid: {
    title: 'Create an App (Analysis)',
    input: 'I want to create an app',
    nodes: [
      { id: 1, type: 'desire', label: 'Have an app idea', x: 0, y: 100, prob: 100, desc: 'Every developer has 3-5 ideas/year', source: 'Indie Hackers 2025 | Statista App Market 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Design & build it', x: 240, y: 100, prob: 100, desc: 'Avg cost: $5K-$50K solo, 3-6 months', source: 'Clutch 2025 | GoodFirms 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://clutch.co/resources', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 3, type: 'bottleneck', label: 'Submit to app store', x: 480, y: 100, prob: 75, desc: '25% of submissions get rejected', source: 'Apple App Review 2025 | Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-003', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Rejected / stuck in dev', x: 480, y: 280, prob: 100, desc: 'Many never finish or pass review', source: 'Apple App Review 2025 | AppFollow 2025', sourceUrl: 'https://appfollow.io/blog', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Get first 100 downloads', x: 720, y: 100, prob: 30, desc: 'Most apps get <1K total downloads', source: 'Statista App Market 2025 | data.ai 2025', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Zero traction', x: 720, y: 280, prob: 100, desc: '70% of apps get under 5K downloads ever', source: 'AppFollow 2025 | data.ai 2025', sourceUrl: 'https://www.data.ai/en/go/state-of-mobile-2025', sacredRoots: ['SR-007', 'SR-035'] },
      { id: 7, type: 'gate', label: 'Day 30 retention > 4%', x: 960, y: 100, prob: 25, desc: 'Avg day 30 retention: 2-4%', source: 'AppsFlyer 2025 | Adjust Mobile Report 2025', sourceUrl: 'https://www.appsflyer.com/resources/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 8, type: 'outcome-bad', label: 'Users download, never return', x: 960, y: 280, prob: 100, desc: '96% of users churn in 30 days', source: 'AppsFlyer 2025 | Adjust Mobile Report 2025', sourceUrl: 'https://www.appsflyer.com/resources/', sacredRoots: ['SR-032', 'SR-035'] },
      { id: 12, type: 'state', label: '1-3% retention, some return but not sticky', x: 960, y: 250, prob: 100, desc: 'A few users come back, but not enough to build on — hope without traction', source: 'AppsFlyer 2025 | Mixpanel Benchmarks 2025', sourceUrl: 'https://mixpanel.com/blog/benchmarks/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 13, type: 'bottleneck', label: 'Improves retention?', x: 1200, y: 250, prob: 20, desc: 'Fixing retention is the hardest problem in mobile — most never crack it', source: 'Mixpanel Benchmarks 2025 | AppsFlyer 2025', sourceUrl: 'https://mixpanel.com/blog/benchmarks/', sacredRoots: ['SR-036', 'SR-005'] },
      { id: 14, type: 'outcome-bad', label: 'Slow churn death', x: 1200, y: 400, prob: 100, desc: 'Users trickle in and trickle out — net zero growth', source: 'AppsFlyer 2025 | data.ai 2025', sourceUrl: 'https://www.data.ai/en/go/state-of-mobile-2025', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 9, type: 'decision', label: 'Monetize?', x: 1200, y: 100, prob: 30, desc: 'Avg app revenue: $1,100/month', source: 'BuildFire 2025 | Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 10, type: 'outcome-good', label: 'Sustainable app business', x: 1440, y: 40, prob: 100, desc: 'Top 1% earn 90%+ of all revenue', source: 'Sensor Tower 2025 | data.ai 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 11, type: 'outcome-bad', label: 'Costs more than it earns', x: 1440, y: 200, prob: 100, desc: 'Most apps never recoup dev cost', source: 'Sensor Tower 2025 | Statista App Market 2025', sacredRoots: ['SR-031', 'SR-017'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'no' }, { from: 7, to: 12, label: 'partial' }, { from: 7, to: 9, label: 'yes' },
      { from: 12, to: 13 }, { from: 13, to: 9, label: 'pass' }, { from: 13, to: 14, label: 'fail' },
      { from: 9, to: 10, label: 'yes' }, { from: 9, to: 11, label: 'no' },
    ]
  },
  appMin: {
    title: 'Create an App (Summary)',
    input: 'I want to create an app',
    nodes: [
      { id: 1, type: 'state', label: '1000 people want to build an app', x: 0, y: 150, prob: 100, desc: '5.7M apps exist. 557K new iOS submissions/year. Most never launch or gain traction.', source: 'data.ai 2025 | Statista 2025', sourceUrl: 'https://www.data.ai/en/go/state-of-mobile-2025', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Ships MVP & gets approved?', x: 300, y: 150, prob: 25, desc: '~60-70% never finish building. 25% of submissions rejected by Apple. Only ~25% of starters get a live app.', source: 'Apple App Review 2025 | Indie Hackers 2025', sourceUrl: 'https://developer.apple.com/app-store/review/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '750+ never ship or get rejected', x: 300, y: 350, prob: 100, desc: 'Stuck in dev, scope creep, or app store rejection loops', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 4, type: 'bottleneck', label: 'Gets 1000+ downloads & retains users?', x: 600, y: 150, prob: 20, desc: '80% of apps never reach 1000 downloads. Day 30 retention avg: 7%. 96% of users churn in 30 days.', source: 'AppsFlyer 2025 | data.ai 2025', sourceUrl: 'https://www.appsflyer.com/resources/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 5, type: 'bottleneck', label: 'Reaches $1K MRR?', x: 900, y: 150, prob: 20, desc: 'Only 0.5-1% of apps earn significant money. Top 1% earn 90%+ of all revenue. Avg app revenue: $1,100/month.', source: 'Sensor Tower 2025 | BuildFire 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 6, type: 'outcome-good', label: '~1 of 1000 builds a real app business', x: 1200, y: 100, prob: 100, desc: '0.1% reach $10K+ MRR. The rest: ghost apps, zombie apps, or expensive hobbies.', source: 'Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Rest: costs more than it earns', x: 1200, y: 250, prob: 100, desc: 'Most apps never recoup dev cost. Server + maintenance eats the little revenue they make.', source: 'Sensor Tower 2025', sourceUrl: 'https://sensortower.com/blog/', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (75%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  dropshipping: {
    title: 'Dropshipping Store',
    input: 'Someone starts a dropshipping business on Shopify',
    nodes: [
      { id: 1, type: 'desire', label: 'Want passive income via dropshipping', x: 0, y: 120, prob: 100, desc: 'Dropshipping market: $300B+ globally', source: 'Grand View Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.grandviewresearch.com/', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 2, type: 'action', label: 'Find winning product on AliExpress', x: 240, y: 120, prob: 100, desc: 'Avg store tests 10-20 products before finding a winner', source: 'Oberlo data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.oberlo.com/statistics', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 3, type: 'action', label: 'Build Shopify store ($39/mo)', x: 480, y: 120, prob: 70, desc: '1.7M+ Shopify stores, most inactive within 6 months', source: 'Shopify data', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 4, type: 'gate', label: 'Run ads profitably (ROAS > 2x)', x: 720, y: 120, prob: 10, desc: '90% of first ad campaigns lose money', source: 'Facebook Ads benchmarks (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.facebook.com/business/ads', sacredRoots: ['SR-035', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Burn ad budget, no sales', x: 720, y: 300, prob: 100, desc: 'Avg new advertiser loses $500-$2000 learning', source: 'Meta Ads data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.facebook.com/business/ads', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 11, type: 'state', label: 'Occasional ROAS 1.8x but inconsistent', x: 720, y: 270, prob: 100, desc: 'Some days profitable, most not — chasing a pattern that may not exist', source: 'Facebook Ads benchmarks (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.facebook.com/business/ads', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Stabilizes ROAS?', x: 960, y: 270, prob: 20, desc: 'Inconsistent ROAS usually means the product is mediocre, not the ads', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 13, type: 'outcome-bad', label: 'Slow bleed on ads, net negative', x: 960, y: 420, prob: 100, desc: 'Spending $50/day hoping tomorrow will be different', source: 'Meta Ads data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.facebook.com/business/ads', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 6, type: 'bottleneck', label: 'Handle fulfillment & returns', x: 960, y: 120, prob: 50, desc: 'Avg shipping 15-45 days, 20-30% complaint rate', source: 'Aliexpress/Shopify', sacredRoots: ['SR-032', 'SR-019'] },
      { id: 7, type: 'outcome-bad', label: 'Chargebacks & angry customers', x: 960, y: 300, prob: 100, desc: 'Dropship chargeback rate 2-5x normal ecommerce', source: 'Stripe data', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-032', 'SR-023'] },
      { id: 8, type: 'decision', label: 'Sustain $5K+/month profit?', x: 1200, y: 120, prob: 5, desc: '<10% of dropshippers are profitable after 1 year', source: 'Shopify merchant data', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 9, type: 'outcome-good', label: 'Scaled to real brand', x: 1440, y: 60, prob: 100, desc: 'Successful pivot: private label or 3PL warehouse', source: 'Ecom case studies (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 10, type: 'outcome-bad', label: 'Store dead, Shopify cancelled', x: 1440, y: 220, prob: 100, desc: 'Median store lifespan: 4 months', source: 'Shopify churn data', sacredRoots: ['SR-007', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'no' }, { from: 4, to: 11, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 6, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  saas_scratch: {
    title: 'SaaS from Scratch',
    input: 'A solo founder builds a SaaS MVP and tries to reach $1M ARR',
    nodes: [
      { id: 1, type: 'desire', label: 'Identify problem worth solving', x: 0, y: 120, prob: 100, desc: '92% of startups fail within 3 years', source: 'Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 2, type: 'action', label: 'Build MVP (2-6 months)', x: 240, y: 120, prob: 30, desc: '70% of solo founders never ship v1', source: 'IndieHackers survey (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 3, type: 'action', label: 'Launch on Product Hunt / Twitter', x: 480, y: 120, prob: 100, desc: 'Avg PH launch: 200-500 visits, 5-20 signups', source: 'Product Hunt data', sourceUrl: 'https://www.producthunt.com/', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 4, type: 'gate', label: 'Get 10 paying users', x: 720, y: 120, prob: 10, desc: 'Free to paid conversion: 2-5% typical', source: 'SaaS benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 5, type: 'outcome-bad', label: 'No one wants to pay', x: 720, y: 300, prob: 100, desc: '#1 startup killer: no market need (42%)', source: 'CB Insights', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-035', 'SR-007'] },
      { id: 11, type: 'state', label: '3-7 paying, proof but no momentum', x: 720, y: 270, prob: 100, desc: 'Enough signal to keep going, not enough to feel confident — the founder purgatory', source: 'SaaS benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Reaches 10+?', x: 960, y: 270, prob: 20, desc: 'The gap from 5 to 10 users feels infinite without a growth channel', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 13, type: 'outcome-bad', label: 'Stalled at 5 users, dying slowly', x: 960, y: 420, prob: 100, desc: 'Not enough to celebrate, too much to abandon', source: 'MicroConf data', sourceUrl: 'https://microconf.com/resources', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Reach $1K MRR', x: 960, y: 120, prob: 20, desc: 'Median time to $1K MRR: 6-18 months', source: 'Baremetrics', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Stuck at $100-500 MRR forever', x: 960, y: 300, prob: 100, desc: 'Most indie SaaS plateau at $1-5K MRR', source: 'MicroConf data', sourceUrl: 'https://microconf.com/resources', sacredRoots: ['SR-013', 'SR-010'] },
      { id: 8, type: 'decision', label: 'Reach $1M ARR?', x: 1200, y: 120, prob: 3, desc: '<1% of SaaS startups reach $1M ARR', source: 'SaaStr (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.saastr.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: 'Real SaaS business, growing', x: 1440, y: 60, prob: 100, desc: 'Median time to $1M ARR: 3-5 years', source: 'Bessemer Cloud Index', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 10, type: 'outcome-bad', label: 'Shut down or acqui-hire', x: 1440, y: 220, prob: 100, desc: '90% of funded startups fail, 99% of unfunded', source: 'Startup Genome', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-007', 'SR-019'] },
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
      { id: 1, type: 'desire', label: 'Want to escape 9-5, start side hustle', x: 0, y: 120, prob: 100, desc: '44% of Americans have a side hustle', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Start building evenings & weekends', x: 240, y: 120, prob: 50, desc: 'Avg side hustler works 12-15 hrs/week extra', source: 'Zapier survey', sourceUrl: 'https://zapier.com/blog/', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 3, type: 'gate', label: 'Sustain energy + day job', x: 480, y: 120, prob: 30, desc: 'Burnout hits 70% of side hustlers within 6 months', source: 'Gallup', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 4, type: 'outcome-bad', label: 'Burned out, back to just day job', x: 480, y: 300, prob: 100, desc: 'Avg side hustle abandoned after 4.5 months', source: 'Survey data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-014', 'SR-012'] },
      { id: 10, type: 'state', label: 'Sporadic 5-8 hrs/week, slow progress', x: 480, y: 270, prob: 100, desc: 'Too tired after work most days — touching the project once a week, guilt growing', source: 'Gallup', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 11, type: 'bottleneck', label: 'Finds rhythm?', x: 720, y: 270, prob: 20, desc: 'Sporadic effort rarely compounds into real progress', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-014', 'SR-012'] },
      { id: 12, type: 'outcome-bad', label: 'Eternal side project, zero momentum', x: 720, y: 420, prob: 100, desc: 'Years of "working on something" with nothing to show', source: 'Survey data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-008', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Match day job income ($3-8K/mo)', x: 720, y: 120, prob: 10, desc: 'Median side hustle income: $810/month', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/surveys/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'Makes money but cant replace salary', x: 720, y: 300, prob: 100, desc: 'Only 10-15% of side hustles exceed $1K/month', source: 'Bureau of Labor (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 7, type: 'decision', label: 'Quit day job and go full-time?', x: 960, y: 120, prob: 25, desc: 'The leap: 6 months savings recommended minimum', source: 'Financial advisors (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Full-time entrepreneur, growing', x: 1200, y: 60, prob: 100, desc: 'Those who transition: 65% report higher satisfaction', source: 'FreshBooks survey (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freshbooks.com/research', sacredRoots: ['SR-012', 'SR-001'] },
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
      { id: 1, type: 'desire', label: 'Want to skip startup phase, buy existing', x: 0, y: 120, prob: 100, desc: 'Business acquisitions up 30% since 2020', source: 'BizBuySell 2025', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 2, type: 'action', label: 'Search BizBuySell / brokers', x: 240, y: 120, prob: 100, desc: '11,000+ businesses listed for sale at any time', source: 'BizBuySell', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Find good deal + due diligence', x: 480, y: 120, prob: 15, desc: 'Avg buyer reviews 20-50 businesses before buying 1', source: 'Acquisition data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 4, type: 'outcome-bad', label: 'Analysis paralysis, never buy', x: 480, y: 300, prob: 100, desc: '80% of searchers never complete an acquisition', source: 'Search fund data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Secure financing (SBA loan / seller)', x: 720, y: 120, prob: 40, desc: 'SBA 7(a) loans: 10-25% down, 10yr terms', source: 'SBA.gov', sourceUrl: 'https://www.sba.gov/business-guide', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'Cant get financing approved', x: 720, y: 300, prob: 100, desc: 'SBA loan denial rate: 50-70% for first-time buyers', source: 'SBA data', sourceUrl: 'https://www.sba.gov/business-guide', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 7, type: 'action', label: 'Take over operations', x: 960, y: 120, prob: 100, desc: 'Transition period: 3-12 months with seller', source: 'Industry standard (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-032', 'SR-019'] },
      { id: 8, type: 'decision', label: 'Business grows under new owner?', x: 1200, y: 120, prob: 45, desc: '40-50% of acquired businesses grow in year 1', source: 'BizBuySell Insight', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 9, type: 'outcome-good', label: 'Profitable owner-operator', x: 1440, y: 60, prob: 100, desc: 'Median SDE for acquired business: $150-300K', source: 'BizBuySell', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Revenue drops, debt burden', x: 1440, y: 220, prob: 100, desc: '20-25% of acquisitions fail within 2 years', source: 'Harvard Business Review', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-031', 'SR-007'] },
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
      { id: 2, type: 'action', label: 'Pick niche + buy domain ($50-200)', x: 240, y: 120, prob: 80, desc: '95% of affiliate sites start in oversaturated niches', source: 'Ahrefs study', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 3, type: 'action', label: 'Write 50+ articles (3-6 months)', x: 480, y: 120, prob: 15, desc: '90% of bloggers quit before reaching 20 articles', source: 'Blogging survey (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Gave up after 10 articles', x: 480, y: 300, prob: 100, desc: 'Avg blog post takes 3-5 hours to write well', source: 'Orbit Media (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.orbitmedia.com/blog/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 5, type: 'gate', label: 'Google indexes + ranks page 1', x: 720, y: 120, prob: 8, desc: 'Only 5.7% of pages rank in top 10 within 1 year', source: 'Ahrefs 2025', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Zero traffic after 6 months', x: 720, y: 300, prob: 100, desc: '90.63% of pages get zero Google traffic', source: 'Ahrefs', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'state', label: 'Page 2-3, 10-50 visitors/month', x: 720, y: 270, prob: 100, desc: 'Google knows you exist but doesnt care — stuck in no-mans-land of search results', source: 'Ahrefs 2025', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 12, type: 'bottleneck', label: 'Climbs to page 1?', x: 960, y: 270, prob: 20, desc: 'Page 2 to page 1 requires backlinks and time most bloggers dont have', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 13, type: 'outcome-bad', label: 'Forever on page 2, invisible', x: 960, y: 420, prob: 100, desc: 'The best place to hide a dead body is page 2 of Google', source: 'SEO wisdom (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'bottleneck', label: 'Earn $1K+/month commissions', x: 960, y: 120, prob: 10, desc: 'Median affiliate blogger income: $0-500/year', source: 'Authority Hacker survey', sourceUrl: 'https://www.authorityhacker.com/data/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 8, type: 'outcome-bad', label: '$10-50/month, not worth effort', x: 960, y: 300, prob: 100, desc: 'Most affiliate sites earn less than hosting costs', source: 'Market data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-013'] },
      { id: 9, type: 'outcome-good', label: '$5K+/month passive income', x: 1200, y: 60, prob: 100, desc: 'Top 10% of affiliate sites earn $10K+/month', source: 'Authority Hacker', sourceUrl: 'https://www.authorityhacker.com/data/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 10, type: 'outcome-bad', label: 'Google update kills traffic', x: 1200, y: 220, prob: 100, desc: '40-60% traffic loss common after core updates', source: 'Search Engine Journal (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.searchenginejournal.com/', sacredRoots: ['SR-001', 'SR-019'] },
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
      { id: 1, type: 'desire', label: 'Monetize expertise with community', x: 0, y: 120, prob: 100, desc: 'Creator economy worth $250B+ in 2025', source: 'Goldman Sachs', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 2, type: 'action', label: 'Launch on Skool/Circle ($49-97/mo)', x: 240, y: 120, prob: 50, desc: '200K+ communities on Skool alone', source: 'Skool data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 3, type: 'gate', label: 'Get first 10 paying members', x: 480, y: 120, prob: 20, desc: 'Need existing audience of 1-5K minimum', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: '0-3 members, embarrassing', x: 480, y: 300, prob: 100, desc: '80% of paid communities have <10 members', source: 'Platform data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-018', 'SR-007'] },
      { id: 10, type: 'state', label: '4-7 members, real but tiny', x: 480, y: 270, prob: 100, desc: 'Enough to feel responsible, not enough to feel successful — awkward middle', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 11, type: 'bottleneck', label: 'Grows past 10?', x: 720, y: 270, prob: 20, desc: 'Small communities either grow or die — staying at 5 members is unsustainable', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 12, type: 'outcome-bad', label: 'Ghost community, 5 silent members', x: 720, y: 420, prob: 100, desc: 'Posting to yourself while 5 people lurk and wonder if they should cancel', source: 'Platform data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-008'] },
      { id: 5, type: 'bottleneck', label: 'Retain members month 2+', x: 720, y: 120, prob: 40, desc: 'Avg community churn: 10-20% monthly', source: 'Skool/Circle data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-032', 'SR-025'] },
      { id: 6, type: 'outcome-bad', label: 'Members join then cancel quickly', x: 720, y: 300, prob: 100, desc: 'Median membership duration: 2-4 months', source: 'Subscription data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-032', 'SR-026'] },
      { id: 7, type: 'decision', label: 'Reach 100+ paying members?', x: 960, y: 120, prob: 8, desc: '100 members x $79 = $7,900 MRR', source: 'Community math (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 8, type: 'outcome-good', label: 'Thriving community, recurring revenue', x: 1200, y: 60, prob: 100, desc: 'Top communities: 500-5K members, $50-500K MRR', source: 'Skool leaderboard (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 9, type: 'outcome-bad', label: 'Plateau at 20-30, exhausting to maintain', x: 1200, y: 220, prob: 100, desc: 'Content treadmill: weekly calls, posts, support', source: 'Creator burnout data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-014', 'SR-012'] },
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
      { id: 1, type: 'desire', label: 'FOMO into crypto, buy first Bitcoin', x: 0, y: 120, prob: 100, desc: '420M+ crypto users globally', source: 'Crypto.com 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://crypto.com/research', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'action', label: 'Open exchange account, buy BTC', x: 240, y: 120, prob: 70, desc: 'Avg first purchase: $100-500', source: 'Coinbase data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.coinbase.com/research', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'gate', label: 'Survive first -30% crash', x: 480, y: 120, prob: 40, desc: 'BTC has 5-10 crashes of 30%+ per cycle', source: 'CoinGecko historical', sourceUrl: 'https://www.coingecko.com/', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Panic sell at loss', x: 480, y: 300, prob: 100, desc: '80% of retail traders sell at a loss', source: 'Chainalysis 2025', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 11, type: 'state', label: 'Holding but panicking daily', x: 480, y: 270, prob: 100, desc: 'Checking portfolio 20x/day, losing sleep, telling yourself "just hold" while dying inside', source: 'CoinGecko historical', sourceUrl: 'https://www.coingecko.com/', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 12, type: 'bottleneck', label: 'Survives the full dip?', x: 720, y: 270, prob: 20, desc: 'Most panickers eventually crack and sell at the worst moment', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 13, type: 'outcome-bad', label: 'Sold at -25%, missed recovery', x: 720, y: 420, prob: 100, desc: 'Panic sold near the bottom, watched it recover without them', source: 'Chainalysis 2025', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 5, type: 'decision', label: 'Start trading altcoins?', x: 720, y: 120, prob: 60, desc: 'Altcoin greed: 10-100x gains advertised everywhere', source: 'Crypto Twitter (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-013', 'SR-017'] },
      { id: 6, type: 'bottleneck', label: 'Navigate altcoin casino', x: 960, y: 120, prob: 10, desc: '95% of altcoins lose value vs BTC over 4 years', source: 'Messari research (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://messari.io/research', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 7, type: 'outcome-bad', label: 'Lost money on shitcoins/rugs', x: 960, y: 300, prob: 100, desc: '$3.9B lost to crypto scams/rugs in 2024', source: 'Chainalysis', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-023', 'SR-031'] },
      { id: 8, type: 'decision', label: 'Net positive after full cycle?', x: 1200, y: 120, prob: 20, desc: 'Only 10-20% of crypto traders are profitable long-term', source: 'Academic studies (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-035', 'SR-011'] },
      { id: 9, type: 'outcome-good', label: 'Built real crypto wealth', x: 1440, y: 60, prob: 100, desc: 'HODLers who held 4+ years: 95% profitable', source: 'Glassnode', sourceUrl: 'https://glassnode.com/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 10, type: 'outcome-bad', label: 'Broke + emotional damage', x: 1440, y: 220, prob: 100, desc: 'Avg retail crypto investor underperforms BTC buy-and-hold by 40%', source: 'MIT study (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-011', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 11, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 5, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  ai_agency: {
    title: 'AI Agency Startup',
    input: 'Someone decides to start an AI automation agency',
    nodes: [
      { id: 1, type: 'desire', label: 'See AI agency hype, want in', x: 0, y: 120, prob: 100, desc: 'AI agency searches up 4,200% since 2023', source: 'Google Trends 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://trends.google.com/', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'action', label: 'Join free community / Discord', x: 240, y: 120, prob: 60, desc: '50K+ people in top AI agency communities', source: 'Skool/Discord data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 3, type: 'action', label: 'Buy accelerator ($2K-$10K)', x: 480, y: 120, prob: 25, desc: 'Avg AI agency accelerator: $3K-$8K', source: 'Market research (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-036'] },
      { id: 4, type: 'bottleneck', label: 'Learn AI tools (Make, n8n, GPT)', x: 720, y: 120, prob: 40, desc: 'Technical learning curve: 2-6 months', source: 'Community surveys (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 5, type: 'outcome-bad', label: 'Overwhelmed, quit learning', x: 720, y: 300, prob: 100, desc: '60% drop out during technical phase', source: 'Accelerator data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-036', 'SR-010'] },
      { id: 6, type: 'gate', label: 'Land first paying client', x: 960, y: 120, prob: 10, desc: 'Cold outreach: 1-3% response rate', source: 'Agency benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'No clients after months', x: 960, y: 300, prob: 100, desc: 'Avg time to first client: 3-6 months', source: 'Community polls (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'state', label: 'Got one small $500 project, no repeat', x: 960, y: 270, prob: 100, desc: 'One cheap project, client ghosted after — was it even real revenue?', source: 'Agency benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Gets a real retainer?', x: 1200, y: 270, prob: 20, desc: 'One-off projects rarely lead to agency growth', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-010', 'SR-032'] },
      { id: 13, type: 'outcome-bad', label: 'Stuck doing $500 gigs', x: 1200, y: 420, prob: 100, desc: 'Freelancer disguised as agency — no leverage, no scale', source: 'Community polls (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 8, type: 'decision', label: 'Scale to $10K+/month?', x: 1200, y: 120, prob: 5, desc: '<5% of AI agency starters reach $10K MRR', source: 'Income reports (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: 'Running profitable agency', x: 1440, y: 60, prob: 100, desc: 'Top performers: $20K-$100K/mo, but rare', source: 'Case studies (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Back to job hunt', x: 1440, y: 220, prob: 100, desc: 'Market saturating: 10x more agencies than 2023', source: 'Market analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-007', 'SR-027'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'no' }, { from: 6, to: 11, label: 'partial' }, { from: 6, to: 8, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 8, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  upwork_freelance: {
    title: 'Freelancing on Upwork',
    input: 'Someone decides to freelance on Upwork or Fiverr',
    nodes: [
      { id: 1, type: 'desire', label: 'Want freedom & income from freelancing', x: 0, y: 120, prob: 100, desc: '64M Americans freelanced in 2024', source: 'Upwork Freelance Forward 2025:100:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'action', label: 'Learn marketable skill (2-6 months)', x: 240, y: 120, prob: 40, desc: 'Top skills: web dev, design, writing, video editing', source: 'Upwork Skills Index 2025:40:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 3, type: 'state', label: '650 of 1000 complete profile', x: 480, y: 120, prob: 100, desc: '35% drop off before completing profile', source: 'Upwork Platform Data 2025:65:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 4, type: 'action', label: '245 send first proposal', x: 660, y: 120, prob: 100, desc: 'Avg 30-50 proposals before first response', source: 'Upwork Community Forums 2025:24:1 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 5, type: 'gate', label: 'Get first interview response', x: 900, y: 120, prob: 10, desc: 'New profiles: 1-3% proposal acceptance rate', source: 'Upwork Freelancer Report 2025:10:2 | McKinsey Freelance Economy 2025:12:2', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'No response, quit', x: 900, y: 350, prob: 100, desc: '60-70% quit within year 1', source: 'Upwork Retention Data 2025:65:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 14, type: 'state', label: 'Has interviews but no hires', x: 900, y: 270, prob: 100, desc: 'Clients respond, ask questions, then go silent — so close yet so far', source: 'Upwork Freelancer Report 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 15, type: 'bottleneck', label: 'Converts to hire?', x: 1140, y: 270, prob: 20, desc: 'Interview-to-hire conversion for new freelancers is brutal', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.google.com/search?q=', sacredRoots: ['SR-010', 'SR-016'] },
      { id: 16, type: 'outcome-bad', label: 'Stuck at interview stage', x: 1140, y: 420, prob: 100, desc: 'Always a bridesmaid, never a bride — proposals read but never hired', source: 'Upwork Community Forums (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'state', label: '25 get first hire (2.5% of signups)', x: 1140, y: 120, prob: 100, desc: 'First hire is the critical proof point', source: 'Upwork Marketplace Stats 2025:2.5:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 8, type: 'bottleneck', label: 'Get 5-star reviews & repeat clients', x: 1380, y: 120, prob: 30, desc: 'Top rated = 10x more invites. Specialists convert 10-20% vs 2-5% generalists', source: 'Upwork Algorithm Study 2025:30:2 | Harvard Business Review 2025:28:2', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-032', 'SR-036'] },
      { id: 9, type: 'outcome-bad', label: 'Race to bottom on price', x: 1380, y: 350, prob: 100, desc: 'Global competition pushes rates to $5-15/hr', source: 'ILO Global Wage Report 2025:100:3 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.ilo.org/global/research/lang--en/index.htm', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 10, type: 'state', label: '8 remain active after year 1 (0.8%)', x: 1620, y: 120, prob: 100, desc: '60% client repeat hire rate for survivors', source: 'Upwork Annual Report 2025:0.8:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 11, type: 'decision', label: 'Reach $10K/year by year 2?', x: 1860, y: 120, prob: 15, desc: 'Top 10% earn $50K+/year', source: 'Upwork Earnings Data 2025:15:2 | Payoneer Freelancer Survey 2025:12:2', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 12, type: 'outcome-good', label: '3 of 1000 reach $10K/year', x: 2100, y: 60, prob: 100, desc: 'Top freelancers: $100-300/hr, client waitlists', source: 'Upwork Top Rated Profiles 2025:0.3:2 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 13, type: 'outcome-bad', label: 'Median income $2-5K/year', x: 2100, y: 250, prob: 100, desc: 'Active but not enough to live on', source: 'Payoneer Global Freelancer Survey 2025:100:2', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-013', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 14, label: 'partial' }, { from: 5, to: 7, label: 'yes' },
      { from: 14, to: 15 }, { from: 15, to: 7, label: 'pass' }, { from: 15, to: 16, label: 'fail' },
      { from: 7, to: 8 }, { from: 8, to: 9, label: 'fail' }, { from: 8, to: 10, label: 'pass' },
      { from: 10, to: 11 }, { from: 11, to: 12, label: 'yes' }, { from: 11, to: 13, label: 'no' },
    ]
  },
};
