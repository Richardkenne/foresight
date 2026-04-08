import type { Template } from '../templates';

export const businessTemplates: Record<string, Template> = {
  startupMid: {
    title: 'Launch a Startup (Analysis)',
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
  startupMin: {
    title: 'Launch a Startup (Summary)',
    input: 'I want to launch a startup',
    nodes: [
      { id: 1, type: 'desire', label: 'Have a startup idea', x: 0, y: 150, prob: 100, desc: '90% of adults have business ideas but only 5-10% ever act on them', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Actually build it? (8%)', x: 300, y: 150, prob: 8, desc: '92% never start -- only 8% move from idea to action', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Never started', x: 300, y: 350, prob: 100, desc: '92% talk about it but never begin', source: 'GEM Global Report 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Find product-market fit? (40%)', x: 600, y: 150, prob: 40, desc: 'Only 10-20% of all startups find true PMF; 40% of funded ones do', source: 'Startup Genome 2025 | a16z 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 5, type: 'bottleneck', label: 'Reach profitability? (33%)', x: 900, y: 150, prob: 33, desc: 'Only 33% of VC-backed startups ever reach profitability', source: 'PitchBook 2025 | NVCA Yearbook 2025', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 6, type: 'outcome-good', label: 'Sustainable business (~6%)', x: 1200, y: 100, prob: 100, desc: 'Approximately 6% of all startups reach sustainable profitability', source: 'Startup Genome 2025 | PitchBook 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Failed or zombie', x: 1200, y: 250, prob: 100, desc: '90% fail outright; many more linger as zombie companies', source: 'CB Insights 2025 | Y Combinator 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-007', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  startup: {
    title: 'Launch a Startup',
    input: 'I want to launch a startup',
    nodes: [
      { id: 1, type: 'desire', label: 'Have a startup idea', x: 0, y: 150, prob: 100, desc: '90% of adults have business ideas; entrepreneurial intention is nearly universal', source: 'GEM Global Report 2025 | Gallup 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Research problem and market', x: 200, y: 150, prob: 100, desc: 'Validate the problem exists before building anything', source: 'Y Combinator 2025 | Startup Genome 2025', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-036', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Actually start building?', x: 400, y: 150, prob: 8, desc: 'Only 5-10% of people act on their ideas -- the rest stay in research mode forever', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 4, type: 'state', label: 'Building MVP', x: 600, y: 150, prob: 100, desc: 'Active development of minimum viable product', source: 'Lean Startup 2023 | Y Combinator 2025', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 5, type: 'action', label: 'Launch MVP to first users', x: 800, y: 150, prob: 100, desc: 'Ship early, get real feedback from real users', source: 'Y Combinator 2025 | First Round Capital 2025', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-001', 'SR-035'] },
      { id: 6, type: 'gate', label: 'Funding situation', x: 1000, y: 150, prob: 38, desc: '38% of startups fail from cash problems; 62% never raise meaningful funding', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 7, type: 'action', label: 'Iterate based on user feedback', x: 1200, y: 150, prob: 100, desc: 'Average startup takes 2-3 years to find PMF through systematic iteration', source: 'Startup Genome 2025 | a16z 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-036', 'SR-011'] },
      { id: 8, type: 'decision', label: 'Find product-market fit?', x: 1400, y: 150, prob: 40, desc: 'Only 40% of funded startups find PMF; 42% fail because no market need', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 9, type: 'action', label: 'Raise Series A', x: 1600, y: 150, prob: 100, desc: 'Only 15% of seed-stage startups raise Series A within 2 years (2023 cohort)', source: 'Crunchbase 2025 | Incisive Ventures 2025', sourceUrl: 'https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 10, type: 'gate', label: 'Series A success?', x: 1800, y: 150, prob: 15, desc: '15% of seed-funded startups graduate to Series A (2023 cohort, down from 30% in 2018)', source: 'Crunchbase 2025 | ScaleUp Finance 2025', sourceUrl: 'https://www.scaleup.finance/article/the-series-a-crunch-is-back-why-85-of-seed-stage-startups-now-fail-to-raise-series-a-and-how-to-beat-the-odds', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 11, type: 'bottleneck', label: 'Scale the team without imploding', x: 2050, y: 150, prob: 60, desc: '23% of startups fail from wrong team; co-founder conflict kills 65% of high-potential startups', source: 'CB Insights 2025 | Noam Wasserman 2023', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-025', 'SR-026'] },
      { id: 12, type: 'action', label: 'Scale revenue and operations', x: 2250, y: 150, prob: 100, desc: 'Median SaaS growth rate 28% in 2025, top quartile 100%+ at $1-5M ARR', source: 'ChartMogul SaaS Growth Report 2025 | Lighter Capital 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 13, type: 'bottleneck', label: 'Reach $1M ARR?', x: 2450, y: 150, prob: 50, desc: 'Almost 50% of monetizing SaaS startups reach $1M ARR, but it takes ~5 years on average', source: 'ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 14, type: 'decision', label: 'Reach profitability?', x: 2650, y: 150, prob: 33, desc: 'Only 33% of VC-backed companies ever reach profitability', source: 'PitchBook 2025 | NVCA Yearbook 2025', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 15, type: 'outcome-good', label: 'Sustainable business (~6% of all startups)', x: 2900, y: 100, prob: 100, desc: 'Approximately 6% of all startups reach sustainable profitability', source: 'Startup Genome 2025 | PitchBook 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-012', 'SR-031'] },
      // Branch: never started (from bottleneck 3)
      { id: 20, type: 'outcome-bad', label: 'Never started -- stayed in idea phase', x: 400, y: 350, prob: 100, desc: '92% talk about starting but never begin building', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-012', 'SR-010'] },
      // Branch: no funding (gate 6, "no")
      { id: 30, type: 'state', label: 'Out of cash, no investors', x: 1000, y: 380, prob: 100, desc: '62% never raise or run dry within 18 months', source: 'CB Insights 2025 | Crunchbase 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 31, type: 'outcome-bad', label: 'Dead: no funding', x: 1200, y: 380, prob: 100, desc: 'Cash starvation is the #1 startup killer after no market need', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-031', 'SR-010'] },
      // Branch: zombie from funding gate (gate 6, "partial")
      { id: 32, type: 'state', label: 'Zombie: surviving on fumes', x: 1000, y: 270, prob: 100, desc: 'Not dead, not growing -- burning remaining cash with no clear path forward', source: 'CB Insights 2025 | PitchBook 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 33, type: 'bottleneck', label: 'Zombie converts to growth?', x: 1200, y: 270, prob: 20, desc: 'Zombie startups rarely recover; most delay death by 6-18 months', source: 'Startup Genome 2025 | Y Combinator 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 34, type: 'outcome-bad', label: 'Trapped in zombie mode for years', x: 1400, y: 370, prob: 100, desc: 'Not dead, not alive -- founders stuck for years, burning savings', source: 'Y Combinator 2025 | First Round Capital 2025', sourceUrl: 'https://www.ycombinator.com/companies', sacredRoots: ['SR-007', 'SR-005'] },
      // Branch: no PMF (decision 8, "no")
      { id: 35, type: 'state', label: 'Built it but nobody wants it', x: 1400, y: 320, prob: 100, desc: '#1 reason startups die: 42% fail from no market need', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 36, type: 'decision', label: 'Pivot or die?', x: 1600, y: 320, prob: 35, desc: '35% of failed-PMF startups attempt a pivot; most pivots also fail', source: 'Startup Genome 2025 | CB Insights 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-001', 'SR-036'] },
      { id: 37, type: 'outcome-bad', label: 'Pivot failed, shut down', x: 1800, y: 400, prob: 100, desc: 'Most pivots fail -- the new idea has the same odds as any new startup', source: 'Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-010', 'SR-007'] },
      // Branch: Series A fail (gate 10, "no")
      { id: 40, type: 'state', label: 'Series A rejected', x: 1800, y: 380, prob: 100, desc: '85% of seed startups fail to raise Series A in the 2023 cohort', source: 'Crunchbase 2025 | ScaleUp Finance 2025', sourceUrl: 'https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 41, type: 'decision', label: 'Bootstrap or shut down?', x: 2000, y: 380, prob: 30, desc: '30% attempt to bootstrap after Series A rejection; few succeed', source: 'First Round Capital 2025 | Indie Hackers 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://stateofstartups.firstround.com/', sacredRoots: ['SR-001', 'SR-012'] },
      { id: 42, type: 'outcome-bad', label: 'Shut down after failed raise', x: 2200, y: 420, prob: 100, desc: 'Ran out of runway, could not self-sustain', source: 'Crunchbase 2025', sourceUrl: 'https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/', sacredRoots: ['SR-031', 'SR-007'] },
      // Branch: Series A partial -- bridge round (gate 10, "partial")
      { id: 43, type: 'state', label: 'Bridge round / extension only', x: 1800, y: 270, prob: 100, desc: 'Not a full Series A -- raised extension to survive another 6-12 months', source: 'PitchBook 2025 | Crunchbase 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 44, type: 'bottleneck', label: 'Prove metrics for real A?', x: 2050, y: 270, prob: 35, desc: 'Bridge rounds buy time but 65% still fail to graduate to full Series A', source: 'Crunchbase 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 45, type: 'outcome-bad', label: 'Bridge burned, shut down', x: 2250, y: 330, prob: 100, desc: 'Extended runway but still could not reach Series A metrics', source: 'Crunchbase 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://news.crunchbase.com/seed/funding-startups-timeline-series-a-venture/', sacredRoots: ['SR-031', 'SR-007'] },
      // Branch: team implodes (bottleneck 11, fail)
      { id: 46, type: 'outcome-bad', label: 'Team implodes, co-founder split', x: 2050, y: 350, prob: 100, desc: 'Co-founder conflict kills 65% of high-potential startups', source: 'Noam Wasserman 2023 | Harvard Business Review 2025', sourceUrl: 'https://noamwasserman.com/research/', sacredRoots: ['SR-026', 'SR-025'] },
      // Branch: $1M fail (bottleneck 13, fail)
      { id: 47, type: 'state', label: 'Stalled below $1M ARR', x: 2450, y: 320, prob: 100, desc: 'Revenue plateau -- cannot break through to meaningful scale', source: 'ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-007', 'SR-035'] },
      { id: 48, type: 'decision', label: 'Sell or keep grinding?', x: 2650, y: 320, prob: 40, desc: 'Some find acqui-hire exits or keep grinding below scale', source: 'PitchBook 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 49, type: 'outcome-bad', label: 'Small exit or zombie forever', x: 2900, y: 320, prob: 100, desc: 'Acqui-hire or lifestyle business, never reached venture scale', source: 'PitchBook 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-007', 'SR-010'] },
      // Branch: profitable but not scaling (decision 14, "no")
      { id: 50, type: 'outcome-bad', label: 'Growing but burning cash forever', x: 2900, y: 250, prob: 100, desc: '67% of VC-backed companies never reach profitability; alive but not sustainable', source: 'PitchBook 2025 | NVCA Yearbook 2025', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'fail' }, { from: 3, to: 4, label: 'pass' },
      { from: 4, to: 5 }, { from: 5, to: 6 },
      { from: 6, to: 30, label: 'no' }, { from: 6, to: 32, label: 'partial' }, { from: 6, to: 7, label: 'yes' },
      { from: 30, to: 31 },
      { from: 32, to: 33 }, { from: 33, to: 7, label: 'pass' }, { from: 33, to: 34, label: 'fail' },
      { from: 7, to: 8 },
      { from: 8, to: 35, label: 'no' }, { from: 8, to: 9, label: 'yes' },
      { from: 35, to: 36 }, { from: 36, to: 7, label: 'yes' }, { from: 36, to: 37, label: 'no' },
      { from: 9, to: 10 },
      { from: 10, to: 40, label: 'no' }, { from: 10, to: 43, label: 'partial' }, { from: 10, to: 11, label: 'yes' },
      { from: 40, to: 41 }, { from: 41, to: 12, label: 'yes' }, { from: 41, to: 42, label: 'no' },
      { from: 43, to: 44 }, { from: 44, to: 11, label: 'pass' }, { from: 44, to: 45, label: 'fail' },
      { from: 11, to: 46, label: 'fail' }, { from: 11, to: 12, label: 'pass' },
      { from: 12, to: 13 },
      { from: 13, to: 47, label: 'fail' }, { from: 13, to: 14, label: 'pass' },
      { from: 47, to: 48 }, { from: 48, to: 12, label: 'yes' }, { from: 48, to: 49, label: 'no' },
      { from: 14, to: 15, label: 'yes' }, { from: 14, to: 50, label: 'no' },
    ]
  },
  moneyMid: {
    title: 'Sell What People Want (Analysis)',
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
  moneyMin: { title: 'Sell What People Want (Summary)', input: 'Making money on what people want', nodes: [
      { id: 1, type: 'action', label: 'Pick a painful problem', x: 0, y: 150, prob: 100, desc: '42% of startups fail because no market need -- picking a real problem is step zero', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 2, type: 'bottleneck', label: 'Will they pay? (30%)', x: 300, y: 150, prob: 30, desc: 'Only 30% convert from interested to actually paying', source: 'Gartner 2025 | HubSpot Sales Report 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-035', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Nobody pays -- pivot', x: 300, y: 350, prob: 100, desc: 'Most common outcome for first ideas', source: 'Y Combinator 2025 | CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-005', 'SR-009'] },
      { id: 4, type: 'bottleneck', label: 'Get 10 paying customers? (35%)', x: 600, y: 150, prob: 35, desc: '65% of products never reach 10 paying customers', source: 'Baremetrics 2025 | Indie Hackers 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 5, type: 'decision', label: 'Retention > 40%?', x: 900, y: 150, prob: 45, desc: 'Month 2 retention is the real test -- SaaS average monthly churn 3-7%', source: 'Lenny Rachitsky 2025 | Pendo SaaS Benchmarks 2025', sourceUrl: 'https://www.lennysnewsletter.com/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 6, type: 'outcome-good', label: 'Sustainable business', x: 1200, y: 100, prob: 100, desc: 'Revenue grows via word-of-mouth + retention', source: 'First Round Capital 2025 | Bain & Company 2025', sourceUrl: 'https://stateofstartups.firstround.com/', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 7, type: 'outcome-bad', label: 'Leaky bucket -- churn wins', x: 1200, y: 250, prob: 100, desc: 'Acquiring faster than retaining = death', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-031', 'SR-035'] },
    ], edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'yes' }, { from: 5, to: 7, label: 'no' },
    ] },
  money: { title: 'Sell What People Want', input: 'Making money on what people want', nodes: [
      { id: 1, type: 'state', label: 'You have a skill or knowledge', x: 0, y: 150, prob: 100, desc: 'Everyone has something they can sell -- the question is whether there is a market for it', source: 'GEM Global Report 2025 | Kauffman Foundation 2025', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-005', 'SR-016'] },
      { id: 2, type: 'action', label: 'Pick a painful problem to solve', x: 200, y: 150, prob: 100, desc: '42% of startups fail because they solve problems nobody has', source: 'CB Insights 2025 | Startup Genome 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 3, type: 'action', label: 'Talk to 10 potential buyers', x: 400, y: 150, prob: 100, desc: 'Customer discovery -- ask about their pain, not your solution', source: 'The Mom Test 2023 | Y Combinator 2025', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-035', 'SR-009'] },
      { id: 4, type: 'gate', label: 'Will they pay real money?', x: 600, y: 150, prob: 30, desc: 'Interested is not paying. Only 30% convert from interest to wallet', source: 'Gartner 2025 | HubSpot Sales Report 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-035', 'SR-001'] },
      { id: 5, type: 'action', label: 'Build MVP + make first sale', x: 850, y: 150, prob: 100, desc: 'Smallest version that solves the core problem for real money', source: 'Lean Startup 2023 | Y Combinator 2025', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'bottleneck', label: 'Get 10 paying customers', x: 1050, y: 150, prob: 35, desc: '65% of products never reach 10 paying customers', source: 'Baremetrics 2025 | Indie Hackers 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 7, type: 'action', label: 'Optimize acquisition channel', x: 1250, y: 150, prob: 100, desc: 'Average B2B conversion rate is 2.9%; best performers exceed 11%', source: 'Ruler Analytics 2025 | First Page Sage 2025', sourceUrl: 'https://www.ruleranalytics.com/blog/insight/conversion-rate-by-industry/', sacredRoots: ['SR-017', 'SR-036'] },
      { id: 8, type: 'gate', label: 'Unit economics work?', x: 1450, y: 150, prob: 40, desc: 'LTV must exceed CAC by 3x+ for sustainable growth; most startups never reach this', source: 'Lighter Capital 2025 | ChartMogul 2025', sourceUrl: 'https://www.lightercapital.com/blog/2025-b2b-saas-startup-benchmarks', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 9, type: 'action', label: 'Build retention engine', x: 1700, y: 150, prob: 100, desc: 'Focus on keeping customers: average SaaS monthly churn is 3.5-7.8%', source: 'Pendo SaaS Benchmarks 2025 | Vitally 2025', sourceUrl: 'https://www.pendo.io/pendo-blog/user-retention-rate-benchmarks/', sacredRoots: ['SR-032', 'SR-035'] },
      { id: 10, type: 'decision', label: 'Retention > 40% month 2?', x: 1900, y: 150, prob: 45, desc: 'Sean Ellis 40% rule: if fewer than 40% would be very disappointed losing your product, no PMF', source: 'Lenny Rachitsky 2025 | Mixpanel Benchmarks 2025', sourceUrl: 'https://www.lennysnewsletter.com/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 11, type: 'action', label: 'Scale: hire, automate, expand', x: 2100, y: 150, prob: 100, desc: 'Median annual revenue growth 28% in 2025; top quartile growing 100%+ at $1-5M ARR', source: 'ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 12, type: 'bottleneck', label: 'Reach $100K revenue?', x: 2300, y: 150, prob: 50, desc: 'Half of businesses with paying customers stall before $100K annual revenue', source: 'ChartMogul SaaS Growth Report 2025 | Indie Hackers 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 13, type: 'decision', label: 'Profitable and growing?', x: 2550, y: 150, prob: 55, desc: 'B2B SaaS average retention rate 74%; top performers push NRR past 120%', source: 'Pendo SaaS Benchmarks 2025 | Vitally 2025', sourceUrl: 'https://www.pendo.io/pendo-blog/user-retention-rate-benchmarks/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 14, type: 'outcome-good', label: 'Sustainable, profitable business', x: 2800, y: 100, prob: 100, desc: 'Revenue grows via word-of-mouth + retention; business is self-sustaining', source: 'First Round Capital 2025 | Bain & Company 2025', sourceUrl: 'https://stateofstartups.firstround.com/', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 15, type: 'bottleneck', label: 'Reach $1M ARR?', x: 2800, y: 0, prob: 50, desc: 'Almost 50% of monetizing startups reach $1M ARR but it takes ~5 years', source: 'ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 20, type: 'state', label: 'Nobody pays -- just compliments', x: 600, y: 380, prob: 100, desc: 'Most common outcome: people love the idea but wallets stay shut', source: 'Y Combinator 2025 | CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-005', 'SR-009'] },
      { id: 21, type: 'decision', label: 'Pivot to new problem?', x: 800, y: 380, prob: 40, desc: '40% try again with a different angle; 60% give up entirely', source: 'Startup Genome 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-001', 'SR-036'] },
      { id: 22, type: 'outcome-bad', label: 'Gave up -- no market found', x: 1000, y: 420, prob: 100, desc: 'Ran out of energy or money before finding a paying market', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 23, type: 'state', label: 'Interest but no conversion', x: 600, y: 270, prob: 100, desc: 'People say I would buy this but wallets stay shut -- the cruelest validation', source: 'Gartner 2025 | McKinsey Consumer Report 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-010', 'SR-023'] },
      { id: 24, type: 'bottleneck', label: 'Converts to paying?', x: 850, y: 270, prob: 20, desc: 'Warm interest rarely converts without urgency or scarcity', source: 'HubSpot Sales Report 2025 | Salesforce State of Sales 2025', sourceUrl: 'https://www.hubspot.com/state-of-marketing', sacredRoots: ['SR-010', 'SR-016'] },
      { id: 25, type: 'outcome-bad', label: 'Eternal almost customers', x: 1050, y: 340, prob: 100, desc: 'Pipeline full of maybes, bank account empty', source: 'Salesforce State of Sales 2025 | Gartner 2025', sourceUrl: 'https://www.gartner.com/en/research', sacredRoots: ['SR-023', 'SR-007'] },
      { id: 26, type: 'outcome-bad', label: 'No traction, die slowly', x: 1050, y: 350, prob: 100, desc: 'Product exists but nobody buys it', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 30, type: 'state', label: 'Losing money on every sale', x: 1450, y: 380, prob: 100, desc: 'CAC exceeds LTV -- every new customer makes you poorer', source: 'Lighter Capital 2025 | ProfitWell 2025', sourceUrl: 'https://www.lightercapital.com/blog/2025-b2b-saas-startup-benchmarks', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 31, type: 'decision', label: 'Fix pricing or pivot?', x: 1650, y: 380, prob: 35, desc: '35% successfully restructure pricing; most cannot fix broken unit economics', source: 'ProfitWell 2025 | ChartMogul 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-017', 'SR-036'] },
      { id: 32, type: 'outcome-bad', label: 'Burned cash, shut down', x: 1850, y: 420, prob: 100, desc: 'Revenue existed but margins were negative -- growth accelerated death', source: 'CB Insights 2025 | ProfitWell 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-031', 'SR-023'] },
      { id: 33, type: 'state', label: 'Thin margins, barely sustainable', x: 1450, y: 270, prob: 100, desc: 'LTV:CAC ratio around 1-2x -- surviving but no room for growth', source: 'Lighter Capital 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.lightercapital.com/blog/2025-b2b-saas-startup-benchmarks', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 34, type: 'bottleneck', label: 'Optimize to 3x LTV:CAC?', x: 1700, y: 270, prob: 30, desc: 'Usage-based pricing reduces churn by 46% vs flat-rate models', source: 'Pendo SaaS Benchmarks 2025 | Orb 2025', sourceUrl: 'https://www.withorb.com/blog/saas-churn-rate', sacredRoots: ['SR-017', 'SR-036'] },
      { id: 35, type: 'outcome-bad', label: 'Stuck at breakeven forever', x: 1900, y: 330, prob: 100, desc: 'Revenue covers costs but no profit -- working for free', source: 'Indie Hackers 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 36, type: 'state', label: 'Churn exceeds acquisition', x: 1900, y: 320, prob: 100, desc: 'Average monthly churn 3.5% voluntary + 0.7% involuntary = net negative growth', source: 'Recurly 2025 | CustomerGauge 2025', sourceUrl: 'https://customergauge.com/blog/average-churn-rate-by-industry', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 37, type: 'decision', label: 'Rebuild or abandon?', x: 2100, y: 320, prob: 30, desc: '30% attempt major product overhaul to fix retention; most fail', source: 'Pendo SaaS Benchmarks 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.pendo.io/pendo-blog/user-retention-rate-benchmarks/', sacredRoots: ['SR-001', 'SR-036'] },
      { id: 38, type: 'outcome-bad', label: 'Leaky bucket -- churn wins', x: 2300, y: 380, prob: 100, desc: 'Acquiring faster than retaining = death', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-031', 'SR-035'] },
      { id: 39, type: 'state', label: 'Revenue plateau under $100K', x: 2300, y: 310, prob: 100, desc: 'Hit a ceiling -- cannot find new acquisition channels or expand existing ones', source: 'ChartMogul SaaS Growth Report 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-007', 'SR-017'] },
      { id: 40, type: 'decision', label: 'Lifestyle business or push through?', x: 2550, y: 310, prob: 50, desc: 'Half accept the plateau as a lifestyle business; half push for scale', source: 'Indie Hackers 2025 | MicroConf 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 41, type: 'outcome-bad', label: 'Lifestyle business -- capped growth', x: 2800, y: 310, prob: 100, desc: 'Profitable but never scales -- comfortable ceiling', source: 'Indie Hackers 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-013'] },
      { id: 42, type: 'outcome-bad', label: 'Growing but losing money', x: 2800, y: 240, prob: 100, desc: 'Revenue looks good on paper but expenses always exceed income', source: 'PitchBook 2025 | NVCA Yearbook 2025', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 43, type: 'outcome-bad', label: 'Stalled before $1M -- good but not great', x: 3050, y: 60, prob: 100, desc: 'Profitable, growing, but cannot break into venture-scale revenue', source: 'ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-007', 'SR-013'] },
      { id: 44, type: 'outcome-good', label: 'Reached $1M ARR -- real business', x: 3050, y: -30, prob: 100, desc: 'Top 10% outcome: $1M+ ARR, 1 in 10 of all monetizing startups reach this', source: 'ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-031'] },
    ], edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 20, label: 'no' }, { from: 4, to: 23, label: 'partial' }, { from: 4, to: 5, label: 'yes' },
      { from: 20, to: 21 }, { from: 21, to: 2, label: 'yes' }, { from: 21, to: 22, label: 'no' },
      { from: 23, to: 24 }, { from: 24, to: 5, label: 'pass' }, { from: 24, to: 25, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 26, label: 'fail' }, { from: 6, to: 7, label: 'pass' },
      { from: 7, to: 8 },
      { from: 8, to: 30, label: 'no' }, { from: 8, to: 33, label: 'partial' }, { from: 8, to: 9, label: 'yes' },
      { from: 30, to: 31 }, { from: 31, to: 7, label: 'yes' }, { from: 31, to: 32, label: 'no' },
      { from: 33, to: 34 }, { from: 34, to: 9, label: 'pass' }, { from: 34, to: 35, label: 'fail' },
      { from: 9, to: 10 },
      { from: 10, to: 36, label: 'no' }, { from: 10, to: 11, label: 'yes' },
      { from: 36, to: 37 }, { from: 37, to: 9, label: 'yes' }, { from: 37, to: 38, label: 'no' },
      { from: 11, to: 12 },
      { from: 12, to: 39, label: 'fail' }, { from: 12, to: 13, label: 'pass' },
      { from: 39, to: 40 }, { from: 40, to: 11, label: 'yes' }, { from: 40, to: 41, label: 'no' },
      { from: 13, to: 14, label: 'yes' }, { from: 13, to: 42, label: 'no' },
      { from: 14, to: 15 },
      { from: 15, to: 44, label: 'pass' }, { from: 15, to: 43, label: 'fail' },
    ] },

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
  // === cafeMin (Summary) ===
  cafeMin: {
    title: 'Open a Cafe (Summary)',
    input: 'I want to open a cafe',
    nodes: [
      { id: 1, type: 'desire', label: 'Dream of owning a cafe', x: 0, y: 150, prob: 100, desc: 'Top 5 most desired small business. ~60% of aspiring entrepreneurs consider food/beverage', source: 'National Restaurant Association 2025 | IBISWorld 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Secure location + $112-627K capital?', x: 250, y: 150, prob: 45, desc: 'Opening costs $112K-$627K. 55% choose wrong location — #1 failure factor', source: 'National Restaurant Association 2025 | Restroworks 2025', sourceUrl: 'https://www.restroworks.com/blog/restaurant-failure-statistics/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 3, type: 'outcome-bad', label: 'Never opens or bad location', x: 250, y: 350, prob: 100, desc: 'Capital barrier or poor site selection kills most cafe dreams before day 1', source: 'Datassential 2025 | FSR Magazine 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-031', 'SR-035'] },
      { id: 4, type: 'bottleneck', label: 'Survive year 1? (17% fail)', x: 500, y: 150, prob: 83, desc: '17% of restaurants close within first year. Cash flow problems cause 82% of failures', source: 'Datassential 2025 | Restroworks 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 5, type: 'bottleneck', label: 'Reach profitability? (3-5% margin)', x: 750, y: 150, prob: 40, desc: 'Full-service restaurants average 3-5% profit margin. Food cost 28-35%, labor 25-35%', source: 'Toast Restaurant Report 2025 | National Restaurant Association 2025', sourceUrl: 'https://pos.toasttab.com/blog/on-the-line/average-restaurant-profit-margin', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 6, type: 'outcome-good', label: 'Profitable cafe (top ~17%)', x: 1000, y: 100, prob: 100, desc: '~17% of cafes achieve sustained profitability. 51.4% survive past 5 years', source: 'IBISWorld 2025 | Datassential 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 7, type: 'outcome-bad', label: 'Breakeven or slow death', x: 1000, y: 250, prob: 100, desc: 'Surviving but not thriving — 3-5% margins eaten by any cost spike', source: 'Restaurant Business 2025 | Toast Restaurant Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-007', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  // === cafe (Full Model) ===
  cafe: {
    title: 'Open a Cafe',
    input: 'I want to open a cafe',
    nodes: [
      // Main path (1-15)
      { id: 1, type: 'desire', label: 'Dream of owning a cafe', x: 0, y: 200, prob: 100, desc: 'Top 5 most desired small business. ~60% of aspiring entrepreneurs consider food/beverage', source: 'National Restaurant Association 2025 | IBISWorld 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Research market + write business plan', x: 220, y: 200, prob: 100, desc: 'Analyze local competition, foot traffic, demographics. Business plan takes 2-4 weeks', source: 'National Restaurant Association 2025 | SBA 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-017', 'SR-036'] },
      { id: 3, type: 'bottleneck', label: 'Secure $112-627K capital?', x: 440, y: 200, prob: 50, desc: 'Opening costs $112K-$627K depending on size/location. Recurring monthly costs up to $80K', source: 'Restroworks 2025 | National Restaurant Association 2025', sourceUrl: 'https://www.restroworks.com/blog/restaurant-failure-statistics/', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'Cannot raise capital', x: 440, y: 400, prob: 100, desc: '82% of restaurant failures stem from cash flow problems. Most never secure full funding', source: 'Restroworks 2025 | ContinuServe 2025', sourceUrl: 'https://www.quatrrobss.com/articles-blogs/the-hidden-crisis-how-82-of-restaurant-failures-could-have-been-prevented/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 5, type: 'action', label: 'Find and secure location', x: 660, y: 200, prob: 100, desc: 'Location is the #1 factor. Must balance rent cost vs foot traffic vs parking vs visibility', source: 'National Restaurant Association 2025 | FSR Magazine 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 6, type: 'gate', label: 'Location quality?', x: 880, y: 200, prob: 45, desc: '55% choose wrong location. Good location = high foot traffic + visible + affordable rent + parking', source: 'FSR Magazine 2025 | Restaurant Business 2025', sourceUrl: 'https://www.fsrmagazine.com/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 7, type: 'action', label: 'Build out, hire staff, open doors', x: 1100, y: 200, prob: 100, desc: 'Buildout takes 3-6 months. Hiring is hardest part: 88% report increased labor costs in 2024', source: 'National Restaurant Association 2025 | Toast Restaurant Report 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-costs-continue-to-pressure-restaurant-profitability/', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 8, type: 'state', label: 'First month open: honeymoon phase', x: 1320, y: 200, prob: 100, desc: 'Friends, family, curious neighbors. Revenue looks promising but is not sustainable baseline', source: 'Toast Restaurant Report 2025 | Square Food Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 9, type: 'bottleneck', label: 'Control food cost under 35%?', x: 1540, y: 200, prob: 55, desc: 'Median food cost 32% of sales (2024). Must stay 28-35% to survive. Above = bleeding cash', source: 'National Restaurant Association 2025 | Toast POS 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/restaurant-operators-kept-food-cost-ratios-in-check-in-2024/', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 10, type: 'gate', label: 'Survive months 3-6?', x: 1760, y: 200, prob: 60, desc: '17% fail in year 1. Months 3-6 are the reality check: honeymoon ends, fixed costs hit hard', source: 'Datassential 2025 | Restroworks 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 11, type: 'action', label: 'Build regulars + community', x: 1980, y: 200, prob: 100, desc: '70% of revenue comes from repeat customers. Loyalty programs increase visits 35%', source: 'Toast POS 2025 | Square Food Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 12, type: 'bottleneck', label: 'Keep labor under 35% of revenue?', x: 2200, y: 200, prob: 50, desc: 'Labor is 25-35% of revenue. Prime cost (food+labor) must stay 55-65%. Above = no profit possible', source: 'National Restaurant Association 2025 | NetSuite 2025', sourceUrl: 'https://www.netsuite.com/portal/resource/articles/erp/restaurant-benchmarks.shtml', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 13, type: 'decision', label: 'Reach year 1 profitability?', x: 2420, y: 200, prob: 40, desc: 'Full-service restaurants average 3-5% profit margin. Income before taxes: median 4.3% of sales', source: 'Toast Restaurant Report 2025 | National Restaurant Association 2025', sourceUrl: 'https://pos.toasttab.com/blog/on-the-line/average-restaurant-profit-margin', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 14, type: 'bottleneck', label: 'Survive to year 5? (51.4% do)', x: 2640, y: 140, prob: 51, desc: '51.4% of restaurants survive past 5 years. 34.6% still standing at year 10', source: 'Datassential 2025 | Bureau of Labor Statistics 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 15, type: 'outcome-good', label: 'Established cafe, sustained profitability', x: 2860, y: 80, prob: 100, desc: '~17% of cafes achieve long-term profitability. These are the ones that nailed location, costs, and community', source: 'IBISWorld 2025 | Datassential 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-012', 'SR-025'] },
      // Bad location branch (20+)
      { id: 20, type: 'outcome-bad', label: 'Bad location: low foot traffic', x: 880, y: 420, prob: 100, desc: '55% of cafes fail due to poor location. No amount of great coffee fixes an invisible storefront', source: 'FSR Magazine 2025 | Restaurant Business 2025', sourceUrl: 'https://www.fsrmagazine.com/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 21, type: 'state', label: 'Mediocre location, mixed traffic', x: 880, y: 360, prob: 100, desc: 'Not terrible, not great -- depends on execution. Some days busy, some days empty', source: 'National Restaurant Association 2025 | Toast Restaurant Report 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 22, type: 'bottleneck', label: 'Compensate with marketing/quality?', x: 1100, y: 360, prob: 30, desc: 'Mediocre locations can work with strong social media, delivery apps, and exceptional product', source: 'Toast Restaurant Report 2025 | Square Food Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 23, type: 'outcome-bad', label: 'Closed within 18 months', x: 1100, y: 500, prob: 100, desc: 'Marketing cannot overcome a fundamentally bad location long-term', source: 'Restaurant Business 2025 | Datassential 2025', sourceUrl: 'https://www.restaurantbusinessonline.com/', sacredRoots: ['SR-007', 'SR-031'] },
      // Food cost crisis branch (30+)
      { id: 30, type: 'state', label: 'Food cost above 35%, bleeding cash', x: 1540, y: 400, prob: 100, desc: 'Waste, over-portioning, bad supplier deals. Every plate costs more than it earns', source: 'National Restaurant Association 2025 | Toast POS 2025', sourceUrl: 'https://pos.toasttab.com/blog/on-the-line/how-to-calculate-food-cost-percentage', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 31, type: 'action', label: 'Renegotiate suppliers + reduce waste', x: 1760, y: 400, prob: 100, desc: 'Switch to seasonal menus, reduce SKUs, negotiate bulk deals, implement waste tracking', source: 'National Restaurant Association 2025 | ChowNow 2025', sourceUrl: 'https://get.chownow.com/blog/restaurant-industry-benchmarks/', sacredRoots: ['SR-008', 'SR-031'] },
      { id: 32, type: 'bottleneck', label: 'Get food cost under control?', x: 1980, y: 400, prob: 40, desc: 'Higher volume restaurants reported lower food-cost ratios. Small cafes struggle most', source: 'National Restaurant Association 2025 | NetSuite 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/higher-volume-restaurants-reported-lower-food-cost-ratios-in-2024/', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 33, type: 'outcome-bad', label: 'Closed: margins never recovered', x: 1980, y: 540, prob: 100, desc: 'Continued bleeding until capital ran out. Lost more by staying open', source: 'Restroworks 2025 | Bureau of Labor Statistics 2025', sourceUrl: 'https://www.restroworks.com/blog/restaurant-profitability-statistics/', sacredRoots: ['SR-007', 'SR-031'] },
      // Survival crisis branch (40+)
      { id: 40, type: 'outcome-bad', label: 'Closed in months 3-6: no customers', x: 1760, y: 420, prob: 100, desc: 'The honeymoon ended and nobody came back. Fixed costs ate through remaining capital', source: 'Datassential 2025 | Restaurant Business 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 41, type: 'state', label: 'Surviving but barely: thin margins', x: 1760, y: 340, prob: 100, desc: 'Counting every cup, dreading rent day. Revenue covers costs but nothing left', source: 'National Restaurant Association 2025 | Toast Restaurant Report 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/research-reports/', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 42, type: 'action', label: 'Pivot: add delivery, events, catering', x: 1980, y: 340, prob: 100, desc: 'Diversify revenue: delivery apps (30% commission), private events, corporate catering', source: 'Toast Restaurant Report 2025 | Square Food Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 43, type: 'bottleneck', label: 'Pivot saves the business?', x: 2200, y: 340, prob: 25, desc: 'Thin-margin cafes rarely recover without a significant pivot. Most just delay death', source: 'Restaurant Business 2025 | Square Food Report 2025', sourceUrl: 'https://squareup.com/us/en/townsquare/future-of-restaurants', sacredRoots: ['SR-001', 'SR-017'] },
      { id: 44, type: 'outcome-bad', label: 'Slow death, closed month 9-12', x: 2200, y: 480, prob: 100, desc: 'Delayed failure -- lost more money by staying open longer than cutting losses', source: 'Bureau of Labor Statistics 2025 | Restaurant Business 2025', sourceUrl: 'https://www.restaurantbusinessonline.com/', sacredRoots: ['SR-007', 'SR-031'] },
      // Labor crisis branch (50+)
      { id: 50, type: 'state', label: 'Labor costs above 35%, no staff retention', x: 2200, y: 400, prob: 100, desc: '88% of operators report increased labor costs. High turnover destroys consistency and quality', source: 'National Restaurant Association 2025 | Peppr POS 2025', sourceUrl: 'https://restaurant.org/research-and-media/research/restaurant-economic-insights/analysis-commentary/elevated-costs-continue-to-pressure-restaurant-profitability/', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 51, type: 'outcome-bad', label: 'Staff quits, quality drops, customers leave', x: 2420, y: 400, prob: 100, desc: 'Vicious cycle: underpay staff, they leave, service drops, revenue drops, cannot afford to hire', source: 'National Restaurant Association 2025 | Toast Restaurant Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-025', 'SR-026'] },
      // Post-profitability branches
      { id: 60, type: 'outcome-bad', label: 'Breakeven forever: working for free', x: 2640, y: 300, prob: 100, desc: 'Revenue covers costs. Owner works 60+ hours/week for effectively $0. Trapped', source: 'Restaurant Business 2025 | Toast Restaurant Report 2025', sourceUrl: 'https://pos.toasttab.com/resources/restaurant-success-industry-report', sacredRoots: ['SR-013', 'SR-010'] },
      { id: 61, type: 'outcome-bad', label: 'Closed year 2-5: costs finally win', x: 2860, y: 200, prob: 100, desc: '48.6% close before year 5. Rising rents, inflation, competition eventually overwhelm thin margins', source: 'Datassential 2025 | Bureau of Labor Statistics 2025', sourceUrl: 'https://datassential.com/resource/restaurant-failure-rate/', sacredRoots: ['SR-007', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 },
      { from: 6, to: 20, label: 'no' }, { from: 6, to: 21, label: 'partial' }, { from: 6, to: 7, label: 'yes' },
      { from: 21, to: 22 }, { from: 22, to: 7, label: 'pass' }, { from: 22, to: 23, label: 'fail' },
      { from: 7, to: 8 }, { from: 8, to: 9 },
      { from: 9, to: 30, label: 'fail' }, { from: 9, to: 10, label: 'pass' },
      { from: 30, to: 31 }, { from: 31, to: 32 }, { from: 32, to: 10, label: 'pass' }, { from: 32, to: 33, label: 'fail' },
      { from: 10, to: 40, label: 'no' }, { from: 10, to: 41, label: 'partial' }, { from: 10, to: 11, label: 'yes' },
      { from: 41, to: 42 }, { from: 42, to: 43 }, { from: 43, to: 11, label: 'pass' }, { from: 43, to: 44, label: 'fail' },
      { from: 11, to: 12 },
      { from: 12, to: 50, label: 'fail' }, { from: 12, to: 13, label: 'pass' },
      { from: 50, to: 51 },
      { from: 13, to: 14, label: 'yes' }, { from: 13, to: 60, label: 'no' },
      { from: 14, to: 15, label: 'pass' }, { from: 14, to: 61, label: 'fail' },
    ]
  },
  cafeMid: {
    title: 'Open a Cafe (Analysis)',
    input: 'I want to open a cafe',
    nodes: [
      { id: 1, type: 'desire', label: 'Dream of owning a cafe', x: 0, y: 120, prob: 100, desc: 'Top 5 most desired business', source: 'National Restaurant Association 2025', sourceUrl: 'https://restaurant.org/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Find location + capital', x: 240, y: 120, prob: 100, desc: 'Cost: 50-200M IDR', source: 'BPS Indonesia 2025', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Location good enough?', x: 480, y: 120, prob: 45, desc: '#1 factor for success', source: 'Restaurant.org 2025', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 4, type: 'outcome-bad', label: 'Bad location, low traffic', x: 480, y: 300, prob: 100, desc: '55% choose wrong location', source: 'FSR Magazine 2025', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 5, type: 'action', label: 'Open doors, first month', x: 720, y: 120, prob: 100, desc: 'Honeymoon: friends & family', source: 'Toast Restaurant Report 2025', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 6, type: 'gate', label: 'Survive month 3-6', x: 960, y: 120, prob: 40, desc: '60% fail in year 1', source: 'National Restaurant Association 2025', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Closed: no customers', x: 960, y: 300, prob: 100, desc: 'Avg cafe lasts 4.5 years', source: 'BLS 2025', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 11, type: 'state', label: 'Surviving but barely', x: 960, y: 270, prob: 100, desc: 'Every month feels like the last', source: 'National Restaurant Association 2025', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 12, type: 'bottleneck', label: 'Turns profitable?', x: 1200, y: 270, prob: 20, desc: 'Thin-margin cafes rarely recover', source: 'Restaurant Business 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 13, type: 'outcome-bad', label: 'Slow death, closed month 9', x: 1200, y: 420, prob: 100, desc: 'Delayed failure', source: 'BLS 2025', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 8, type: 'decision', label: 'Build regulars?', x: 1200, y: 120, prob: 50, desc: '70% revenue from regulars', source: 'Toast POS 2025', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 9, type: 'outcome-good', label: 'Profitable, growing', x: 1440, y: 60, prob: 100, desc: '~17% become profitable', source: 'IBISWorld 2025', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 10, type: 'outcome-bad', label: 'Breakeven forever', x: 1440, y: 220, prob: 100, desc: 'Survive but never profit', source: 'Restaurant Business 2025', sacredRoots: ['SR-013', 'SR-010'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'no' }, { from: 6, to: 11, label: 'partial' }, { from: 6, to: 8, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 8, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  contentMin: {
    title: 'Content Creator Journey (Summary)',
    input: 'I want to become a content creator',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to be a creator', x: 0, y: 150, prob: 100, desc: '69M+ active YouTube creators worldwide (2025). 200M+ consider themselves creators across platforms', source: 'DemandSage 2025 | SignalFire 2025', sourceUrl: 'https://www.demandsage.com/youtube-creator-statistics/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Post consistently for 90 days?', x: 250, y: 150, prob: 20, desc: '80% quit within 90 days. Only 12% of aspiring creators ever post at all', source: 'YouTube Creator Academy 2025 | Adobe Creator Economy Report 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: 'Quit: no views, no growth', x: 250, y: 350, prob: 100, desc: 'Average new video gets ~50 views. Most creators never escape algorithmic invisibility', source: 'Social Blade 2025 | Tubics 2025', sourceUrl: 'https://www.tubics.com/blog/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Reach 1K subs + monetize?', x: 500, y: 150, prob: 35, desc: 'YouTube requires 1K subs + 4K watch hours. Only 3M of 69M channels are monetized (4.3%)', source: 'DemandSage 2025 | YouTube 2025', sourceUrl: 'https://www.demandsage.com/youtube-creator-statistics/', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 5, type: 'bottleneck', label: 'Earn a living? ($50K+/yr)', x: 750, y: 150, prob: 12, desc: 'Only 12% of full-time creators earn $50K+/yr. 50% earn under $5K/yr', source: 'Influencer Marketing Hub 2025 | Spiralytics 2025', sourceUrl: 'https://influencermarketinghub.com/creator-earnings-report-2025/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 6, type: 'outcome-good', label: 'Full-time creator (~4%)', x: 1000, y: 100, prob: 100, desc: '4% earn >$100K/yr. Top 1% earn 90% of total creator revenue', source: 'Goldman Sachs 2025 | SignalFire 2025', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Hobby income: median $0-$500/yr', x: 1000, y: 250, prob: 100, desc: 'Nearly half of creators earned less than $500 this year. Median creator earns effectively $0', source: 'Linktree Creator Report 2025 | Influencer Marketing Hub 2025', sourceUrl: 'https://influencermarketinghub.com/creator-earnings-report-2025/', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (80%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  contentMid: {
    title: 'Content Creator Journey (Analysis)',
    input: 'I want to become a content creator',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to be a creator', x: 0, y: 120, prob: 100, desc: '50M+ consider themselves creators', source: 'SignalFire 2025 | Adobe Creator Economy Report 2025', sourceUrl: 'https://www.signalfire.com/blog/creator-economy-map', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Post first content', x: 240, y: 120, prob: 100, desc: 'Only 12% actually post', source: 'Adobe Creator Economy Report 2025', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 3, type: 'bottleneck', label: 'Stay consistent 90 days', x: 480, y: 120, prob: 20, desc: '80% quit within 90 days', source: 'YouTube Creator Academy 2025', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Quit: no views', x: 480, y: 300, prob: 100, desc: 'Avg: 50 views/video', source: 'Tubics 2025 | Social Blade 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 5, type: 'gate', label: 'Reach 1K followers', x: 720, y: 120, prob: 35, desc: '35% of consistent reach 1K', source: 'Linktree Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'Small audience forever', x: 720, y: 300, prob: 100, desc: 'Median: 500 subscribers', source: 'Social Blade 2025', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 10, type: 'state', label: 'Small audience, 100-500, growth flatlined', x: 720, y: 270, prob: 100, desc: 'Posting into the void — some likes, no momentum', source: 'Linktree Creator Report 2025', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 11, type: 'bottleneck', label: 'Breaks through?', x: 960, y: 270, prob: 20, desc: 'Going viral is luck — most plateau creators never escape', source: 'Social Blade 2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 12, type: 'outcome-bad', label: 'Forever micro-creator', x: 960, y: 420, prob: 100, desc: 'Posting for years to 300 followers', source: 'Linktree Creator Report 2025', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 7, type: 'decision', label: 'Monetize?', x: 960, y: 120, prob: 30, desc: '4% earn >$100K/yr', source: 'Linktree Creator Report 2025 | Goldman Sachs 2025', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 8, type: 'outcome-good', label: 'Full-time creator', x: 1200, y: 60, prob: 100, desc: 'Top 1% earn 90% of revenue', source: 'Goldman Sachs 2025', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 9, type: 'outcome-bad', label: 'Hobby income only', x: 1200, y: 220, prob: 100, desc: 'Median earns $0/yr', source: 'Linktree Creator Report 2025', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 10, label: 'partial' }, { from: 5, to: 7, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 7, label: 'pass' }, { from: 11, to: 12, label: 'fail' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },
  content: {
    title: 'Content Creator Journey',
    input: 'I want to become a content creator',
    nodes: [
      // Main path (1-15)
      { id: 1, type: 'desire', label: 'Want to be a creator', x: 0, y: 200, prob: 100, desc: '69M+ active YouTube creators (2025). 200M+ consider themselves creators across all platforms globally', source: 'DemandSage 2025 | SignalFire 2025', sourceUrl: 'https://www.demandsage.com/youtube-creator-statistics/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'action', label: 'Pick a platform + niche', x: 220, y: 200, prob: 100, desc: 'YouTube, TikTok, Instagram, or multi-platform. Niche selection determines ceiling and competition', source: 'Spiralytics 2025 | Linktree Creator Report 2025', sourceUrl: 'https://www.spiralytics.com/blog/content-creator-statistics-2025/', sacredRoots: ['SR-017', 'SR-005'] },
      { id: 3, type: 'bottleneck', label: 'Actually post first content?', x: 440, y: 200, prob: 12, desc: 'Only 12% of aspiring creators ever publish. 88% dream but never ship', source: 'Adobe Creator Economy Report 2025 | Linktree Creator Report 2025', sourceUrl: 'https://blog.adobe.com/en/topics/creativity', sacredRoots: ['SR-001', 'SR-012'] },
      { id: 4, type: 'action', label: 'Post weekly for 90 days', x: 660, y: 200, prob: 100, desc: 'The minimum consistency test. Algorithm needs 30-50 pieces to understand your content', source: 'YouTube Creator Academy 2025 | Epidemic Sound Creator Report 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 5, type: 'gate', label: 'Stay consistent past 90 days?', x: 880, y: 200, prob: 20, desc: '80% quit within 90 days. Creative fatigue (40%) and no visible results (31%) are top reasons', source: 'YouTube Creator Academy 2025 | Billion Dollar Boy 2025', sourceUrl: 'https://www.billiondollarboy.com/news/over-half-of-creators-face-burnout/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 6, type: 'state', label: 'Consistent creator, 100-500 followers', x: 1100, y: 200, prob: 100, desc: 'Posting regularly but algorithm has not rewarded you yet. Average video: 50-200 views', source: 'Social Blade 2025 | Tubics 2025', sourceUrl: 'https://www.tubics.com/blog/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 7, type: 'gate', label: 'Reach 1K subscribers?', x: 1320, y: 200, prob: 35, desc: '35% of consistent creators reach 1K. YouTube monetization requires 1K subs + 4K watch hours', source: 'Linktree Creator Report 2025 | DemandSage 2025', sourceUrl: 'https://www.demandsage.com/youtube-creator-statistics/', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 8, type: 'action', label: 'Apply for monetization (YPP)', x: 1540, y: 200, prob: 100, desc: 'Only 3M of 69M YouTube channels are monetized (4.3%). Alternatively: 10M Shorts views in 90 days', source: 'DemandSage 2025 | YouTube 2025', sourceUrl: 'https://www.demandsage.com/youtube-creator-statistics/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 9, type: 'state', label: 'Monetized but earning pennies', x: 1760, y: 200, prob: 100, desc: 'Average CPM $6.15 (2026). At 10K views/month = ~$60/month. Shorts pay ~$0.04/1K views', source: 'TubeAnalytics 2026 | isthischannelmonetized 2025', sourceUrl: 'https://www.tubeanalytics.net/blog/state-of-youtube-monetization-2026', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 10, type: 'bottleneck', label: 'Reach 10K subscribers?', x: 1980, y: 200, prob: 30, desc: '10K is the threshold where brand deals become viable. Takes avg 6.5 months to first dollar', source: 'Influencer Marketing Hub 2025 | Spiralytics 2025', sourceUrl: 'https://influencermarketinghub.com/creator-earnings-report-2025/', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 11, type: 'action', label: 'Diversify: sponsors, merch, courses', x: 2200, y: 200, prob: 100, desc: '52% of creators are monetized but ad revenue alone is not enough. Brand deals pay 10-100x more than ads', source: 'Uscreen 2025 | Spiralytics 2025', sourceUrl: 'https://www.uscreen.tv/blog/creator-economy-statistics/', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 12, type: 'bottleneck', label: 'Survive burnout? (63% hit it)', x: 2420, y: 200, prob: 37, desc: '63% of full-time creators experience burnout annually. 52% have considered quitting. Financial instability is #1 burnout cause (55%)', source: 'Billion Dollar Boy 2025 | Harvard T.H. Chan 2025', sourceUrl: 'https://www.billiondollarboy.com/news/over-half-of-creators-face-burnout/', sacredRoots: ['SR-014', 'SR-031'] },
      { id: 13, type: 'decision', label: 'Earn $50K+/yr?', x: 2640, y: 200, prob: 12, desc: 'Only 12% of full-time creators earn $50K+. 4% earn >$100K. Top 1% earn 90% of all revenue', source: 'Influencer Marketing Hub 2025 | Goldman Sachs 2025', sourceUrl: 'https://influencermarketinghub.com/creator-earnings-report-2025/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 14, type: 'outcome-good', label: 'Full-time sustainable creator', x: 2860, y: 140, prob: 100, desc: '~4% of all creators reach sustainable full-time income. Multi-stream revenue: ads + sponsors + products', source: 'Goldman Sachs 2025 | SignalFire 2025', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 15, type: 'outcome-good', label: 'Top creator: $100K+/yr', x: 2860, y: 60, prob: 100, desc: 'Top 4% earn >$100K/yr. MrBeast earned $85M from YouTube alone. Extreme power law distribution', source: 'Goldman Sachs 2025 | DemandSage 2025', sourceUrl: 'https://www.demandsage.com/youtube-creator-statistics/', sacredRoots: ['SR-012', 'SR-016'] },
      // Never posted branch (20+)
      { id: 20, type: 'outcome-bad', label: 'Never posted: paralyzed by perfectionism', x: 440, y: 400, prob: 100, desc: '88% of aspiring creators never publish. Fear of judgment and perfectionism are top blockers', source: 'Adobe Creator Economy Report 2025 | Linktree Creator Report 2025', sourceUrl: 'https://blog.adobe.com/en/topics/creativity', sacredRoots: ['SR-009', 'SR-001'] },
      // Quit in 90 days branch (25+)
      { id: 25, type: 'outcome-bad', label: 'Quit: no views, algorithm ignores you', x: 880, y: 420, prob: 100, desc: 'Average new creator gets 50 views/video. Discouraged after 3 months of invisibility', source: 'Tubics 2025 | Social Blade 2025', sourceUrl: 'https://www.tubics.com/blog/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 26, type: 'state', label: 'Posting but inconsistent, losing motivation', x: 880, y: 350, prob: 100, desc: 'Irregular posting destroys algorithmic trust. Platform pushes you down. Creative fatigue building', source: 'YouTube Creator Academy 2025 | Epidemic Sound Creator Report 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-010', 'SR-014'] },
      { id: 27, type: 'bottleneck', label: 'Regain consistency?', x: 1100, y: 350, prob: 25, desc: 'Most inconsistent creators never recover momentum. Algorithm penalizes gaps', source: 'YouTube Creator Academy 2025 | Social Blade 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 28, type: 'outcome-bad', label: 'Fades away: ghost channel', x: 1100, y: 480, prob: 100, desc: 'Posts slow from weekly to monthly to never. Channel becomes a digital graveyard', source: 'Social Blade 2025 | Tubics 2025', sourceUrl: 'https://www.tubics.com/blog/', sacredRoots: ['SR-007', 'SR-010'] },
      // Small audience plateau branch (30+)
      { id: 30, type: 'outcome-bad', label: 'Stuck under 1K forever', x: 1320, y: 420, prob: 100, desc: 'Median YouTube channel has ~500 subscribers. Never reaches monetization threshold', source: 'Social Blade 2025 | Linktree Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 31, type: 'state', label: '300-800 subs, growth flatlined', x: 1320, y: 350, prob: 100, desc: 'Algorithm ignores small channels. Posting into the void -- some likes, zero momentum', source: 'Linktree Creator Report 2025 | Epidemic Sound Creator Report 2025', sourceUrl: 'https://linktr.ee/creator-report', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 32, type: 'action', label: 'Pivot niche or format', x: 1540, y: 350, prob: 100, desc: 'Try Shorts (18% of creator revenue now), different niche, or cross-platform to TikTok/Instagram', source: 'TubeAnalytics 2026 | Uscreen 2025', sourceUrl: 'https://www.tubeanalytics.net/blog/state-of-youtube-monetization-2026', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 33, type: 'bottleneck', label: 'Pivot works?', x: 1760, y: 350, prob: 20, desc: 'Most pivots fail -- audience expects consistency. But some find their real niche this way', source: 'YouTube Creator Academy 2025 | Spiralytics 2025', sourceUrl: 'https://creatoracademy.youtube.com/', sacredRoots: ['SR-001', 'SR-036'] },
      { id: 34, type: 'outcome-bad', label: 'Forever micro-creator: <1K subs', x: 1760, y: 480, prob: 100, desc: 'Years of posting to 300 followers. Invisible to brands, invisible to algorithm', source: 'Linktree Creator Report 2025 | Adobe Creator Economy Report 2025', sourceUrl: 'https://blog.adobe.com/en/topics/creativity', sacredRoots: ['SR-007', 'SR-010'] },
      // Burnout branch (40+)
      { id: 40, type: 'state', label: 'Burned out: creative fatigue + financial stress', x: 2420, y: 400, prob: 100, desc: 'Creative fatigue (40%), demanding workload (31%), constant screen time (27%). Financial instability ranked #1 most severe (55%)', source: 'Billion Dollar Boy 2025 | Viral Nation 2025', sourceUrl: 'https://www.billiondollarboy.com/news/over-half-of-creators-face-burnout/', sacredRoots: ['SR-014', 'SR-031'] },
      { id: 41, type: 'action', label: 'Take break or hire help', x: 2640, y: 400, prob: 100, desc: '59% say burnout negatively impacts career. 37% considered quitting entirely', source: 'Billion Dollar Boy 2025 | Harvard T.H. Chan 2025', sourceUrl: 'https://hsph.harvard.edu/news/content-creators-are-struggling-with-mental-health-study-finds/', sacredRoots: ['SR-014', 'SR-025'] },
      { id: 42, type: 'bottleneck', label: 'Recover and continue?', x: 2860, y: 400, prob: 35, desc: 'Many never return after extended breaks. Algorithm punishes absence. Audience moves on', source: 'Viral Nation 2025 | YouTube Creator Academy 2025', sourceUrl: 'https://www.viralnation.com/resources/blog/the-creator-burnout-crisis-why-over-half-of-influencers-are-at-a-breaking-point', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 43, type: 'outcome-bad', label: 'Quit: burnout wins', x: 2860, y: 530, prob: 100, desc: '37% of burned-out creators quit the industry. The algorithm does not reward rest', source: 'Billion Dollar Boy 2025 | Viral Nation 2025', sourceUrl: 'https://www.billiondollarboy.com/news/over-half-of-creators-face-burnout/', sacredRoots: ['SR-014', 'SR-007'] },
      // Low income outcome (50+)
      { id: 50, type: 'outcome-bad', label: 'Hobby income: $0-$500/yr', x: 2640, y: 300, prob: 100, desc: 'Nearly half of creators earned less than $500 this year. 50% earn under $5K/yr total', source: 'Influencer Marketing Hub 2025 | Linktree Creator Report 2025', sourceUrl: 'https://influencermarketinghub.com/creator-earnings-report-2025/', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'fail (88%)' }, { from: 3, to: 4, label: 'pass' },
      { from: 4, to: 5 },
      { from: 5, to: 25, label: 'no' }, { from: 5, to: 26, label: 'partial' }, { from: 5, to: 6, label: 'yes' },
      { from: 26, to: 27 }, { from: 27, to: 6, label: 'pass' }, { from: 27, to: 28, label: 'fail' },
      { from: 6, to: 7 },
      { from: 7, to: 30, label: 'no' }, { from: 7, to: 31, label: 'partial' }, { from: 7, to: 8, label: 'yes' },
      { from: 31, to: 32 }, { from: 32, to: 33 }, { from: 33, to: 8, label: 'pass' }, { from: 33, to: 34, label: 'fail' },
      { from: 8, to: 9 }, { from: 9, to: 10 },
      { from: 10, to: 34, label: 'fail' }, { from: 10, to: 11, label: 'pass' },
      { from: 11, to: 12 },
      { from: 12, to: 40, label: 'fail' }, { from: 12, to: 13, label: 'pass' },
      { from: 40, to: 41 }, { from: 41, to: 42 }, { from: 42, to: 13, label: 'pass' }, { from: 42, to: 43, label: 'fail' },
      { from: 13, to: 15, label: 'yes' }, { from: 13, to: 50, label: 'no' },
      { from: 14, to: 15 },
    ]
  },
  saas: {
    title: 'Build a SaaS',
    input: 'I want to build a SaaS product',
    nodes: [
      // ── STARTING STATE ──
      { id: 1, type: 'state', label: '1000 people want to build a SaaS', x: 0, y: 200, prob: 100, desc: '92% of SaaS startups fail within 3 years. This model tracks 1000 aspiring SaaS founders through every stage.', source: 'ChartMogul SaaS Growth Report 2025 | Indie Hackers 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'desire', label: 'Identify a painful problem', x: 250, y: 200, prob: 100, desc: 'Avg developer has 3-5 SaaS ideas per year. 42% of failed startups cite "no market need" as cause of death.', source: 'CB Insights 2025 | Indie Hackers 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-017', 'SR-028'] },
      { id: 3, type: 'action', label: 'Validate with 10 potential users', x: 500, y: 200, prob: 100, desc: 'Only 10-15% of SaaS makers do real user research before building. Those who do are 3x more likely to succeed.', source: 'Y Combinator 2025 | The Mom Test 2023', sourceUrl: 'https://www.ycombinator.com/companies', sacredRoots: ['SR-035', 'SR-009'] },
      { id: 4, type: 'bottleneck', label: 'Problem worth solving?', x: 750, y: 200, prob: 30, desc: '~70% of SaaS ideas fail validation. "Interested" does not equal paying. Only 30% convert from interest to wallet.', source: 'Gartner 2025 | CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-035', 'SR-023'] },
      { id: 5, type: 'outcome-bad', label: 'Building something nobody wants', x: 750, y: 420, prob: 100, desc: '#1 SaaS killer: no market need. 42% of all failed startups cite this.', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-009', 'SR-023'] },

      // ── BUILD PHASE ──
      { id: 6, type: 'action', label: 'Build MVP (2-4 months solo)', x: 1000, y: 200, prob: 100, desc: 'Avg solo MVP: 2-4 months. 60-70% of indie SaaS never ship due to scope creep, perfectionism, burnout.', source: 'MicroConf 2025 | Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 7, type: 'bottleneck', label: 'Actually ships?', x: 1250, y: 200, prob: 40, desc: '60% of solo SaaS projects die before launch. Scope creep and perfectionism are the top killers.', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 8, type: 'outcome-bad', label: 'Stuck in dev hell, never launches', x: 1250, y: 420, prob: 100, desc: 'Most common SaaS outcome: endless building, zero users.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-010'] },

      // ── FIRST USERS ──
      { id: 9, type: 'gate', label: 'Get first 10 paying users?', x: 1500, y: 200, prob: 25, desc: '75% of launched SaaS never get 10 paying customers. 70% of micro-SaaS generate under $1K/month.', source: 'Baremetrics 2025 | MicroConf State of Independent SaaS 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-001'] },

      // NO path (75%): zero traction
      { id: 10, type: 'state', label: 'Launched but zero traction', x: 1500, y: 480, prob: 100, desc: 'Product exists, nobody cares. Marketing is harder than building.', source: 'Indie Hackers 2025 | Product Hunt 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'trajectory', label: 'Build-in-public hopium', x: 1700, y: 540, prob: 100, desc: 'Tweeting progress to other builders. No actual customers.', source: 'Indie Hackers 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-010', 'SR-023'] },
      { id: 12, type: 'outcome-bad', label: '$0 MRR forever', x: 1900, y: 540, prob: 100, desc: 'Most common SaaS outcome after launch. Product graveyard.', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-007', 'SR-012'] },

      // PARTIAL path: 3-7 customers, stalled
      { id: 20, type: 'state', label: '3-7 customers, real revenue but stalled', x: 1500, y: -50, prob: 100, desc: 'Enough to feel real, not enough to matter. The cruelest tease in SaaS.', source: 'Baremetrics 2025 | ChartMogul 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 21, type: 'trajectory', label: 'Side project purgatory', x: 1700, y: -50, prob: 100, desc: '$50-200/month. Not enough to justify the work, too much to give up.', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 22, type: 'bottleneck', label: 'Grows past 10 users?', x: 1900, y: -50, prob: 20, desc: 'Most SaaS with 3-7 users stay there forever. Requires repositioning or channel discovery.', source: 'ChartMogul 2025 | Baremetrics 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 23, type: 'outcome-bad', label: 'Stuck at $50-200 MRR forever', x: 2100, y: -120, prob: 100, desc: 'Zombie SaaS: not dead, not alive.', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-013', 'SR-007'] },

      // YES path: 10+ paying
      { id: 30, type: 'state', label: '10+ paying users, early traction', x: 1750, y: 200, prob: 100, desc: 'Only ~10% of launched SaaS reach this. Now the real game starts: retention.', source: 'MicroConf 2025 | Baremetrics 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 31, type: 'decision', label: 'PLG or sales-led?', x: 2000, y: 200, prob: 58, desc: '58% of B2B SaaS use PLG. PLG grows 50% YoY vs 21% for sales-led. PLG works for ACV <$10K.', source: 'ProductLed 2025 | OpenView Partners 2025', sourceUrl: 'https://productled.com/blog/product-led-growth-benchmarks', sacredRoots: ['SR-035', 'SR-017'] },

      // PLG path
      { id: 32, type: 'action', label: 'Free trial / freemium funnel', x: 2250, y: 100, prob: 100, desc: 'Free trial avg conversion: 18.5% (median B2B). Opt-out trials: 48.8%. Freemium: 2-5%.', source: 'First Page Sage 2025 | Userpilot 2025', sourceUrl: 'https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 33, type: 'bottleneck', label: 'Reach $1K MRR?', x: 2500, y: 100, prob: 40, desc: 'Only ~10% of all SaaS ideas ever reach $1K MRR. Median time: 6-12 months from launch.', source: 'Baremetrics 2025 | ChartMogul SaaS Growth Report 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 34, type: 'outcome-bad', label: 'Free users never convert', x: 2500, y: -20, prob: 100, desc: 'Freemium trap: 95-98% never pay. CAC exceeds LTV.', source: 'ProfitWell 2025 | First Page Sage 2025', sourceUrl: 'https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/', sacredRoots: ['SR-031', 'SR-023'] },

      // Sales-led path
      { id: 35, type: 'action', label: 'Outbound sales + demos', x: 2250, y: 300, prob: 100, desc: 'Sales-led works for ACV >$25K. Higher CAC but larger deals. $2 sales spend per $1 new ARR (avg).', source: 'Salesmotion 2025 | SaaS Capital 2025', sourceUrl: 'https://www.saas-capital.com/blog-posts/benchmarking-metrics-for-bootstrapped-saas-companies/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 36, type: 'bottleneck', label: 'Reach $1K MRR?', x: 2500, y: 300, prob: 35, desc: 'Sales cycles are long (3-9 months for enterprise). Cash burns fast before first deals close.', source: 'SaaS Capital 2025 | Lighter Capital 2025', sourceUrl: 'https://www.lightercapital.com/blog/2025-b2b-saas-startup-benchmarks', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 37, type: 'outcome-bad', label: 'CAC too high, cash runs out', x: 2500, y: 430, prob: 100, desc: 'Spending $2+ per $1 of ARR. Runway burns before product-market fit.', source: 'SaaS Capital 2025', sourceUrl: 'https://www.saas-capital.com/blog-posts/benchmarking-metrics-for-bootstrapped-saas-companies/', sacredRoots: ['SR-031', 'SR-007'] },

      // ── CHURN GATE ──
      { id: 40, type: 'state', label: '$1K+ MRR, real business', x: 2750, y: 200, prob: 100, desc: 'Top ~10% of SaaS ideas. Now the enemy is churn. Avg monthly churn: 3.5-5% for SMB SaaS.', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/saas-metrics/customer-churn/', sacredRoots: ['SR-032', 'SR-035'] },
      { id: 41, type: 'gate', label: 'Monthly churn below 5%?', x: 3000, y: 200, prob: 45, desc: 'Good: <3% monthly. Acceptable: 3-5%. Death spiral: >7%. Avg SMB SaaS: 3-7%.', source: 'ProfitWell 2025 | Recurly Churn Report 2025', sourceUrl: 'https://chartmogul.com/saas-metrics/customer-churn/', sacredRoots: ['SR-035', 'SR-032'] },

      // Churn NO: leaky bucket
      { id: 42, type: 'trajectory', label: 'Leaky bucket: acquiring faster than retaining', x: 3000, y: 420, prob: 100, desc: 'Growing revenue masks the churn problem until it is too late.', source: 'ProfitWell 2025 | ChartMogul 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 43, type: 'outcome-bad', label: 'Churn kills growth, flat MRR', x: 3200, y: 420, prob: 100, desc: 'Net revenue retention <100% = slow death. Company shrinks even while adding customers.', source: 'ChartMogul 2025 | SaaS Capital 2025', sourceUrl: 'https://chartmogul.com/reports/', sacredRoots: ['SR-031', 'SR-032'] },

      // Churn PARTIAL: 5-7% (survivable)
      { id: 44, type: 'state', label: 'Churn 5-7%, growing slowly', x: 3000, y: 50, prob: 100, desc: 'Survivable but not fundable. LTV:CAC ratio around 2:1 (target is 3:1+).', source: 'First Page Sage 2025 | SaaS Capital 2025', sourceUrl: 'https://firstpagesage.com/seo-roi/the-saas-ltv-to-cac-ratio-fc/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 45, type: 'bottleneck', label: 'Fixes churn to <3%?', x: 3250, y: 50, prob: 30, desc: 'Requires product improvement, onboarding, customer success. Most never fix it.', source: 'ProfitWell 2025 | Vitally 2025', sourceUrl: 'https://www.vitally.io/post/saas-churn-benchmarks', sacredRoots: ['SR-035', 'SR-032'] },
      { id: 46, type: 'outcome-bad', label: 'Stuck at $1-3K MRR, slow churn death', x: 3500, y: 0, prob: 100, desc: 'Not growing fast enough to outrun churn. Founder burns out.', source: 'MicroConf 2025 | Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-014', 'SR-010'] },

      // Churn YES: healthy
      { id: 47, type: 'state', label: 'Churn <3%, healthy unit economics', x: 3250, y: 200, prob: 100, desc: 'LTV:CAC 3:1+. Net revenue retention >100%. This is the foundation of scale.', source: 'SaaS Capital 2025 | First Page Sage 2025', sourceUrl: 'https://firstpagesage.com/seo-roi/the-saas-ltv-to-cac-ratio-fc/', sacredRoots: ['SR-012', 'SR-031'] },

      // ── SCALE PHASE ──
      { id: 48, type: 'action', label: 'Scale to $10K MRR', x: 3500, y: 200, prob: 100, desc: '$1K to $10K MRR: avg 11 months. Requires systematic acquisition channel, not just word-of-mouth.', source: 'Baremetrics 2025 | Stripe Atlas Report 2025', sourceUrl: 'https://baremetrics.com/blog/how-fast-saas-companies-hit-arr-milestones', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 49, type: 'bottleneck', label: 'Reaches $10K MRR?', x: 3750, y: 200, prob: 50, desc: 'Of those who reach $1K MRR, ~50% make it to $10K. Growth rate must be 7-15% MoM.', source: 'ChartMogul SaaS Growth Report 2025 | Lighter Capital 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 50, type: 'outcome-bad', label: 'Plateaus at $3-8K MRR, solo burnout', x: 3750, y: 380, prob: 100, desc: 'Solo founder burnout rate: 72%. Revenue is real but so is exhaustion.', source: 'Indie Hackers 2025 | MicroConf Burnout Survey 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-014', 'SR-011'] },

      // ── ENDGAME ──
      { id: 51, type: 'decision', label: 'Raise funding or bootstrap?', x: 4000, y: 200, prob: 50, desc: 'Series A requires $1.5-3M ARR, 7-15% MoM growth, <5% churn, LTV:CAC >3:1. CAC payback <12 months.', source: 'SaaStr 2025 | Mosaic Ventures 2025', sourceUrl: 'https://www.saastr.com/dear-saastr-what-are-the-top-10-metrics-series-a-investors-look-at/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 52, type: 'outcome-good', label: 'Ramen profitable ($10K+ MRR)', x: 4250, y: 120, prob: 100, desc: '~2% of all SaaS ideas reach this. Sustainable solo/small-team business.', source: 'Stripe Atlas Report 2025 | Indie Hackers 2025', sourceUrl: 'https://stripe.com/atlas/guides', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 53, type: 'outcome-good', label: 'Series A funded, scaling', x: 4250, y: 280, prob: 100, desc: '<1% of SaaS startups raise Series A. Median pre-money: $40-60M (2025). Now the pressure is 10x.', source: 'PitchBook 2025 | Crunchbase 2025', sourceUrl: 'https://pitchbook.com/news/reports', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 54, type: 'outcome-bad', label: 'Burnout, shuts down', x: 4250, y: 400, prob: 100, desc: '72% of solo SaaS founders report burnout. Revenue cannot compensate for broken health.', source: 'MicroConf Burnout Survey 2025 | Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-014', 'SR-011'] },

      // SUCCESS convergence
      { id: 60, type: 'outcome-good', label: 'Sustainable SaaS business', x: 4500, y: 200, prob: 100, desc: 'Multiple paths converge here: bootstrap profitable, funded and scaling, or acquired. ~2-5% of all who start.', source: 'ChartMogul SaaS Growth Report 2025 | Stripe Atlas 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7 }, { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      // Gate: NO / PARTIAL / YES
      { from: 9, to: 10, label: 'no (75%)' },
      { from: 9, to: 20, label: 'partial (15%)' },
      { from: 9, to: 30, label: 'yes (10%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 30, label: 'pass' }, { from: 22, to: 23, label: 'fail' },
      // YES path
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'yes (PLG)' }, { from: 31, to: 35, label: 'no (sales-led)' },
      { from: 32, to: 33 }, { from: 33, to: 40, label: 'pass' }, { from: 33, to: 34, label: 'fail' },
      { from: 35, to: 36 }, { from: 36, to: 40, label: 'pass' }, { from: 36, to: 37, label: 'fail' },
      // Churn gate
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'no (>7%)' }, { from: 42, to: 43 },
      { from: 41, to: 44, label: 'partial (5-7%)' }, { from: 44, to: 45 },
      { from: 45, to: 47, label: 'pass' }, { from: 45, to: 46, label: 'fail' },
      { from: 41, to: 47, label: 'yes (<5%)' },
      // Scale
      { from: 47, to: 48 }, { from: 48, to: 49 },
      { from: 49, to: 51, label: 'pass' }, { from: 49, to: 50, label: 'fail' },
      { from: 51, to: 52, label: 'yes (bootstrap)' }, { from: 51, to: 53, label: 'no (raise)' },
      { from: 50, to: 54 },
      // Convergence
      { from: 52, to: 60 }, { from: 53, to: 60 },
    ]
  },
  saasMin: {
    title: 'Build a SaaS (Summary)',
    input: 'I want to build a SaaS product',
    nodes: [
      { id: 1, type: 'state', label: '1000 SaaS ideas', x: 0, y: 150, prob: 100, desc: '92% of SaaS startups fail within 3 years. This tracks 1000 aspiring founders.', source: 'ChartMogul SaaS Growth Report 2025 | Indie Hackers 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-007', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Ships an MVP? (40%)', x: 300, y: 150, prob: 40, desc: '60% of solo SaaS never ship. Scope creep, perfectionism, burnout.', source: 'Indie Hackers 2025 | MicroConf 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '600 never launch', x: 300, y: 350, prob: 100, desc: 'Most common outcome: endless building, zero users.', source: 'Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Gets 10 paying users? (25%)', x: 600, y: 150, prob: 25, desc: '75% of launched SaaS never get 10 paying customers.', source: 'Baremetrics 2025 | MicroConf 2025', sourceUrl: 'https://baremetrics.com/blog', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Reaches $10K MRR? (5%)', x: 900, y: 150, prob: 50, desc: 'Of those with $1K MRR, ~50% reach $10K. Avg 11 months. Churn <5% required.', source: 'ChartMogul 2025 | Baremetrics 2025', sourceUrl: 'https://chartmogul.com/reports/saas-growth-the-odds-of-making-it/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-good', label: '~20 of 1000 reach $10K MRR', x: 1200, y: 100, prob: 100, desc: '~2% of all SaaS ideas reach ramen profitability.', source: 'Stripe Atlas Report 2025 | ChartMogul 2025', sourceUrl: 'https://stripe.com/atlas/guides', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 7, type: 'outcome-bad', label: 'Rest: $0 or stuck at $1-3K MRR', x: 1200, y: 250, prob: 100, desc: '72% of solo founders burn out. Revenue is real but so is exhaustion.', source: 'MicroConf 2025 | Indie Hackers 2025', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-014', 'SR-011'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (60%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  saasMid: {
    title: 'Build a SaaS (Analysis)',
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
      // ── STARTING STATE ──
      { id: 1, type: 'state', label: '1000 people want to go freelance', x: 0, y: 200, prob: 100, desc: '36% of US workforce freelances (76.4M). This model tracks 1000 aspiring freelancers through every stage.', source: 'Upwork Freelance Forward 2025 | McKinsey Freelance Economy 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-011'] },
      { id: 2, type: 'desire', label: 'Want freedom, flexibility, higher income', x: 250, y: 200, prob: 100, desc: 'Top motivations: schedule control (73%), location freedom (68%), higher earning potential (52%).', source: 'Upwork Freelance Forward 2025 | Payoneer Global Freelancer Report 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-011', 'SR-007'] },
      { id: 3, type: 'action', label: 'Define niche and create profile', x: 500, y: 200, prob: 100, desc: 'Most freelancers start as generalists. Specialists earn 2-3x more but take longer to find first client.', source: 'Freelancermap Market Study 2025 | Upwork 2025', sourceUrl: 'https://www.freelancermap.com/market-study', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 4, type: 'action', label: 'Send first 10-20 proposals', x: 750, y: 200, prob: 100, desc: 'Avg 10 proposals before first response. 66% of freelancers find it challenging to get enough work.', source: 'Upwork Freelance Forward 2025 | Fiverr Business Report 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-009'] },

      // ── FIRST CLIENT GATE ──
      { id: 5, type: 'gate', label: 'Land first paying client?', x: 1000, y: 200, prob: 45, desc: '55% quit before landing first client. Competition is fierce: freelance market growing 14.5% YoY.', source: 'Payoneer Global Freelancer Report 2025 | SNS Insider 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-010', 'SR-001'] },

      // NO path (55%): no clients
      { id: 10, type: 'state', label: 'Zero responses, zero income', x: 1000, y: 480, prob: 100, desc: 'Proposals ignored, no portfolio, no reviews. The cold-start problem is brutal.', source: 'Payoneer Global Freelancer Report 2025 | Upwork Community 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'trajectory', label: 'Demoralized generalist path', x: 1200, y: 540, prob: 100, desc: 'Competing with thousands on price. No differentiator.', source: 'Upwork Freelance Forward 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-023'] },
      { id: 12, type: 'outcome-bad', label: 'Back to full-time job', x: 1400, y: 540, prob: 100, desc: 'Most common freelance outcome. Income instability wins.', source: 'Payoneer Global Freelancer Report 2025 | Freelancers Union 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-007', 'SR-010'] },

      // PARTIAL path: one gig, no pattern
      { id: 20, type: 'state', label: 'One small gig ($200-500) but no pattern', x: 1000, y: -50, prob: 100, desc: 'First project felt great, then silence. Was it a fluke?', source: 'Payoneer Global Freelancer Report 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-001', 'SR-035'] },
      { id: 21, type: 'trajectory', label: 'One-hit wonder freelancer', x: 1200, y: -50, prob: 100, desc: 'Forever chasing that second client. No system for acquisition.', source: 'Freelancers Union 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 22, type: 'bottleneck', label: 'Lands a second client?', x: 1400, y: -50, prob: 20, desc: 'First client is luck, second is proof. Most never get there.', source: 'Freelancers Union 2025 | Upwork Freelance Forward 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 23, type: 'outcome-bad', label: 'Feast-famine limbo forever', x: 1600, y: -120, prob: 100, desc: '#1 freelance fear. Sporadic income, constant anxiety.', source: 'Freelancers Union 2025 | McKinsey Freelance Economy 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-031', 'SR-011'] },

      // YES path: landed first real client
      { id: 30, type: 'state', label: 'First real client, earning income', x: 1250, y: 200, prob: 100, desc: '45% of aspiring freelancers make it here. Now the challenge: sustaining it.', source: 'Upwork Freelance Forward 2025 | Payoneer 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 31, type: 'action', label: 'Deliver well, ask for referral', x: 1500, y: 200, prob: 100, desc: 'Referrals are the #1 client acquisition channel for established freelancers.', source: 'Freelancermap Market Study 2025 | Upwork 2025', sourceUrl: 'https://www.freelancermap.com/market-study', sacredRoots: ['SR-032', 'SR-026'] },
      { id: 32, type: 'bottleneck', label: 'Earn $2K+/month consistently?', x: 1750, y: 200, prob: 40, desc: 'Avg US freelancer: $48/hr. But consistency is the real bottleneck. Only 31% earn >$75K/yr full-time.', source: 'Upwork Freelance Forward 2025 | ZipRecruiter 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 33, type: 'outcome-bad', label: 'Feast-famine cycle, inconsistent income', x: 1750, y: 400, prob: 100, desc: 'Good months and bad months. No predictability. Savings drain.', source: 'Freelancers Union 2025 | McKinsey 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-031', 'SR-011'] },

      // ── RATE & SPECIALIZATION ──
      { id: 34, type: 'state', label: 'Consistent $2K+/month, building reputation', x: 2000, y: 200, prob: 100, desc: 'Regular income but hourly rate is low. Working too many hours. 43% of freelancers near burnout.', source: 'Payoneer Global Freelancer Report 2025 | Harvard Business Review 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-014', 'SR-012'] },
      { id: 35, type: 'decision', label: 'Specialize and raise rates?', x: 2250, y: 200, prob: 50, desc: 'Top 10% earn 3-5x market rate. AI-adjacent skills saw 30-45% rate growth 2022-2024.', source: 'Toptal 2025 | YunoJuno Freelancer Rates Report 2025', sourceUrl: 'https://www.yunojuno.com/freelancer-rates-report', sacredRoots: ['SR-009', 'SR-017'] },

      // YES: raise rates
      { id: 36, type: 'action', label: 'Niche down, build portfolio, raise to $75-150/hr', x: 2500, y: 120, prob: 100, desc: 'Specialists: $100-200/hr for AI/ML. Generalists: $20-40/hr. 5x difference.', source: 'Clockify 2025 | SUCCESS Magazine 2025', sourceUrl: 'https://clockify.me/average-hourly-rates', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 37, type: 'gate', label: 'Clients accept higher rates?', x: 2750, y: 120, prob: 50, desc: 'Value-based pricing works if you solve expensive problems. Hourly billing caps income.', source: 'Toptal 2025 | Freelancermap 2025', sourceUrl: 'https://www.freelancermap.com/market-study', sacredRoots: ['SR-031', 'SR-017'] },

      // Rate gate NO: price-sensitive clients leave
      { id: 38, type: 'outcome-bad', label: 'Lost clients, back to low rates', x: 2750, y: -30, prob: 100, desc: 'Raised prices, clients left. No pipeline of higher-value clients yet.', source: 'Freelancermap 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freelancermap.com/market-study', sacredRoots: ['SR-031', 'SR-010'] },

      // Rate gate PARTIAL: some accept
      { id: 39, type: 'state', label: 'Mix of old low-rate and new high-rate clients', x: 2750, y: 30, prob: 100, desc: 'Transition period. Income dips before it climbs. Most give up here.', source: 'Toptal 2025 | Upwork 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 40, type: 'bottleneck', label: 'Fully transitions to premium?', x: 3000, y: 30, prob: 35, desc: 'Takes 6-12 months to fully reposition. Requires saying no to cheap work.', source: 'Freelancermap 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freelancermap.com/market-study', sacredRoots: ['SR-035', 'SR-009'] },
      { id: 41, type: 'outcome-bad', label: 'Stuck at mid-range forever', x: 3200, y: -20, prob: 100, desc: 'Comfortable but not premium. $40-60/hr plateau.', source: 'Clockify 2025 | Upwork 2025', sourceUrl: 'https://clockify.me/average-hourly-rates', sacredRoots: ['SR-013', 'SR-009'] },

      // Rate gate YES: premium
      { id: 42, type: 'state', label: 'Premium freelancer, $100+/hr', x: 3000, y: 200, prob: 100, desc: 'Top 10% of freelancers. Clients come via referral. Earning $100K+/yr.', source: 'McKinsey Freelance Economy 2025 | Toptal 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-012', 'SR-009'] },

      // NO: stay at current rates
      { id: 43, type: 'trajectory', label: 'Race to bottom, competing on price', x: 2500, y: 280, prob: 100, desc: 'Undercut by cheaper freelancers globally. AI threatens routine tasks.', source: 'Payoneer 2025 | Freelancers Union 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-013', 'SR-009'] },
      { id: 44, type: 'outcome-bad', label: 'Stuck at low rates, burnout risk', x: 2750, y: 280, prob: 100, desc: 'Working 50+ hr/week for $20-40/hr. 59% report burnout symptoms.', source: 'Harvard Business Review 2025 | Payoneer 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-014', 'SR-011'] },

      // ── ENDGAME ──
      { id: 45, type: 'decision', label: 'Build recurring revenue (retainers/productize)?', x: 3250, y: 200, prob: 50, desc: 'Retainers stabilize income. Productized services scale beyond hours. Top freelancers earn $200K+/yr.', source: 'Toptal 2025 | YunoJuno 2025', sourceUrl: 'https://www.yunojuno.com/freelancer-rates-report', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 46, type: 'outcome-good', label: 'Freelance business owner ($150K+/yr)', x: 3500, y: 120, prob: 100, desc: 'Retainers + productized offers + subcontractors. Top earners ages 55-64 earn $200K+/yr.', source: 'McKinsey 2025 | DemandSage 2025', sourceUrl: 'https://www.demandsage.com/freelance-statistics/', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 47, type: 'outcome-bad', label: 'High income but time-capped', x: 3500, y: 280, prob: 100, desc: 'Trading hours for dollars. Income ceiling without leverage. 78% work on holidays.', source: 'YunoJuno 2025 | Freelancermap 2025', sourceUrl: 'https://www.yunojuno.com/freelancer-rates-report', sacredRoots: ['SR-013', 'SR-011'] },

      // SUCCESS convergence
      { id: 60, type: 'outcome-good', label: 'Sustainable freelance career', x: 3750, y: 200, prob: 100, desc: 'Multiple paths converge: premium rates, retainers, productized services. ~5-10% of those who start.', source: 'Upwork Freelance Forward 2025 | McKinsey 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      // Gate: NO / PARTIAL / YES
      { from: 5, to: 10, label: 'no (55%)' },
      { from: 5, to: 20, label: 'partial (15%)' },
      { from: 5, to: 30, label: 'yes (30%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 30, label: 'pass' }, { from: 22, to: 23, label: 'fail' },
      // YES path
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 34, label: 'pass' },
      { from: 34, to: 35 },
      { from: 35, to: 36, label: 'yes' }, { from: 35, to: 43, label: 'no' },
      // Rate gate
      { from: 36, to: 37 },
      { from: 37, to: 38, label: 'no' }, { from: 37, to: 39, label: 'partial' }, { from: 37, to: 42, label: 'yes' },
      { from: 39, to: 40 }, { from: 40, to: 42, label: 'pass' }, { from: 40, to: 41, label: 'fail' },
      // Low rate path
      { from: 43, to: 44 },
      // Endgame
      { from: 42, to: 45 },
      { from: 45, to: 46, label: 'yes' }, { from: 45, to: 47, label: 'no' },
      // Convergence
      { from: 46, to: 60 }, { from: 42, to: 60 },
    ]
  },
  freelanceMin: {
    title: 'Go Freelance (Summary)',
    input: 'I want to go freelance',
    nodes: [
      { id: 1, type: 'state', label: '1000 aspiring freelancers', x: 0, y: 150, prob: 100, desc: '36% of US workforce freelances (76.4M). This tracks 1000 who want to start.', source: 'Upwork Freelance Forward 2025 | McKinsey 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-011'] },
      { id: 2, type: 'bottleneck', label: 'Lands first client? (45%)', x: 300, y: 150, prob: 45, desc: '55% quit before first paying client. Cold-start problem is brutal.', source: 'Payoneer Global Freelancer Report 2025 | Upwork 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: '550 quit, back to job', x: 300, y: 350, prob: 100, desc: 'Most common freelance outcome. Income instability wins.', source: 'Payoneer 2025 | Freelancers Union 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Earns $2K+/month? (40%)', x: 600, y: 150, prob: 40, desc: 'Only 31% of full-time freelancers earn >$75K/yr. Consistency is the real bottleneck.', source: 'Upwork Freelance Forward 2025 | ZipRecruiter 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'bottleneck', label: 'Raises to premium rates? (25%)', x: 900, y: 150, prob: 25, desc: 'Top 10% earn 3-5x market rate. Specialization is the #1 lever.', source: 'Toptal 2025 | YunoJuno Freelancer Rates Report 2025', sourceUrl: 'https://www.yunojuno.com/freelancer-rates-report', sacredRoots: ['SR-009', 'SR-017'] },
      { id: 6, type: 'outcome-good', label: '~45 of 1000 reach $100K+/yr', x: 1200, y: 100, prob: 100, desc: 'Premium freelancers: $100+/hr, retainers, referral-based. Top earners: $200K+/yr.', source: 'McKinsey 2025 | Toptal 2025', sourceUrl: 'https://www.mckinsey.com/featured-insights', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 7, type: 'outcome-bad', label: 'Rest: feast-famine at $20-40/hr', x: 1200, y: 250, prob: 100, desc: '59% report burnout. 78% work on holidays. Race to bottom.', source: 'Harvard Business Review 2025 | YunoJuno 2025', sourceUrl: 'https://www.yunojuno.com/freelancer-rates-report', sacredRoots: ['SR-014', 'SR-011'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (55%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  freelanceMid: {
    title: 'Go Freelance (Analysis)',
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
  dropshippingMid: {
    title: 'Dropshipping Store (Analysis)',
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
  saas_scratchMid: {
    title: 'SaaS from Scratch (Analysis)',
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
  side_hustleMid: {
    title: 'Side Hustle to Full-Time (Analysis)',
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
      // Main path: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14/15
      { id: 1, type: 'state', label: '1000 people want to buy an existing business', x: 0, y: 200, prob: 100, desc: 'Small business acquisitions rose 5% in 2024 to 9,546 closed deals worth $7.59B. In 2025 transactions stabilized at +0.4% with median sale price $350K', source: 'BizBuySell Insight Report 2025', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 2, type: 'desire', label: 'Skip startup risk, buy proven cash flow', x: 200, y: 200, prob: 100, desc: 'Acquisition loan default rate is 1.93% vs 2.71% for non-acquisition SBA loans — buying is structurally less risky than starting from scratch', source: 'EBIT Community / SBA 7(a) Data 2025', sourceUrl: 'https://ebitcommunity.com/p/sba-acquisition-market-pulse-q4-2025', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 3, type: 'action', label: 'Search BizBuySell, brokers, search funds', x: 400, y: 200, prob: 100, desc: '11,000+ businesses listed at any time. 94 search funds launched in 2023 alone (record). Median days on market: 168', source: 'BizBuySell 2025 / Stanford Search Fund Study 2024', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 4, type: 'action', label: 'Screen 20-50 businesses, narrow to 3-5', x: 600, y: 200, prob: 60, desc: 'Average buyer reviews 20-50 listings before making an offer. Most screen on SDE multiple (median 2.57x in 2024), revenue quality, and customer concentration', source: 'BizBuySell Insight Report 2024 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 5, type: 'bottleneck', label: 'Complete due diligence + make offer?', x: 850, y: 200, prob: 25, desc: 'Stanford 2024: only 63% of search fund searchers who complete their search actually acquire. Many quit during diligence — financials dont match, hidden liabilities, or seller expectations too high', source: 'Stanford GSB Search Fund Study 2024', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-035', 'SR-001'] },

      // FAIL path from due diligence (37% never acquire)
      { id: 20, type: 'state', label: 'Due diligence reveals problems or deal falls through', x: 850, y: 420, prob: 100, desc: '37% of searchers never complete an acquisition per Stanford 2024 data. Common reasons: inflated financials, customer concentration risk, seller wont agree on terms', source: 'Stanford GSB Search Fund Study 2024', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-017', 'SR-026'] },
      { id: 21, type: 'trajectory', label: 'Perpetual searcher path', x: 1050, y: 420, prob: 100, desc: 'Analysis paralysis sets in. Each failed deal costs $5-15K in legal/diligence fees. Some search for 2-3 years without closing', source: 'Search fund community data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://capitalpad.com/search-fund-statistics/', sacredRoots: ['SR-017', 'SR-001'] },
      { id: 22, type: 'outcome-bad', label: 'Never acquires, wasted 1-3 years searching', x: 1300, y: 420, prob: 100, desc: '37% of search fund searchers and an even higher % of independent searchers never close a deal', source: 'Stanford GSB Search Fund Study 2024', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-007', 'SR-001'] },

      // PASS path from diligence → financing gate
      { id: 6, type: 'gate', label: 'Secure financing?', x: 1100, y: 200, prob: 34, desc: 'SBA 7(a) approved $8.29B in acquisition loans through Sep 2025 (+34.58% YoY). Overall SME loan full approval: ~34%. Healthcare 75-80%, services 72-78%, hospitality 50-57%', source: 'SBA Lender Reports 2025 / CrestMont Capital 2026', sourceUrl: 'https://www.sba.gov/partners/lenders/lender-reports', sacredRoots: ['SR-031', 'SR-001'] },

      // NO path from financing
      { id: 23, type: 'state', label: 'Loan denied — insufficient collateral or experience', x: 1100, y: 450, prob: 100, desc: 'First-time buyers face highest denial rates. SBA requires 10-25% down + personal guarantee. Low credit score, no industry experience, or weak business financials = denial', source: 'SBA.gov / NerdWallet 2025', sourceUrl: 'https://www.sba.gov/business-guide', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 24, type: 'outcome-bad', label: 'Cannot finance, deal dies', x: 1350, y: 450, prob: 100, desc: 'Without SBA or seller financing, most buyers cannot close. Avg acquisition loan: $1.18M — too large for personal savings alone', source: 'EBIT Community / SBA Data 2025', sourceUrl: 'https://ebitcommunity.com/p/sba-acquisition-market-pulse-q4-2025', sacredRoots: ['SR-031', 'SR-007'] },

      // PARTIAL path from financing
      { id: 25, type: 'state', label: 'Partial: seller financing or smaller SBA loan', x: 1100, y: 0, prob: 100, desc: '25% of SME loan applications receive partial approval. Seller financing common: 10-30% of deal value held by seller with 3-5 year earnout', source: 'Credit Suite SME Lending 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.creditsuite.com/blog/small-business-lending-statistics-and-trends/', sacredRoots: ['SR-031', 'SR-026'] },
      { id: 26, type: 'bottleneck', label: 'Can close with hybrid financing?', x: 1350, y: 0, prob: 50, desc: 'Seller financing + partial SBA + personal capital can bridge the gap. But higher leverage = more risk. Debt service may consume 40-60% of cash flow', source: 'Industry data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 27, type: 'outcome-bad', label: 'Deal falls apart during closing', x: 1550, y: -60, prob: 100, desc: 'Financing contingency fails, buyer and seller cannot agree on terms, or business performance drops during escrow', source: 'Acquisition data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-031', 'SR-026'] },

      // YES path from financing → operations
      { id: 7, type: 'action', label: 'Close deal, begin transition period', x: 1350, y: 200, prob: 100, desc: 'Typical transition: 3-12 months where seller trains buyer. Median sale price $350K (2025). Enterprise value reached $7.95B total in 2025', source: 'BizBuySell Insight Report 2025', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-032', 'SR-026'] },
      { id: 8, type: 'state', label: 'New owner running operations', x: 1550, y: 200, prob: 100, desc: 'First 90 days critical: learn systems, retain key employees, maintain customer relationships. Seller exits after training period', source: 'Industry standard (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 9, type: 'action', label: 'Retain key staff + customers through year 1', x: 1750, y: 200, prob: 100, desc: 'Employee turnover post-acquisition is the #1 destroyer of value. Key customer churn can tank revenue 20-40% if relationships were seller-dependent', source: 'Fortune / M&A Failure Trap Study 2024', sourceUrl: 'https://fortune.com/2024/11/13/we-analyzed-40000-mergers-acquisitions-ma-deals-over-40-years-why-70-75-percent-fail-leadership-finance/', sacredRoots: ['SR-026', 'SR-032'] },
      { id: 10, type: 'gate', label: 'Business stable or growing after year 1?', x: 2000, y: 200, prob: 30, desc: '70-75% of acquisitions fail to meet objectives (Fortune/40K deal study). For SMBs the rate is better — ~40-50% grow in year 1 per BizBuySell. Key factors: cultural integration, operational continuity, customer retention', source: 'Fortune M&A Study 2024 / BizBuySell Insight 2025', sourceUrl: 'https://fortune.com/2024/11/13/we-analyzed-40000-mergers-acquisitions-ma-deals-over-40-years-why-70-75-percent-fail-leadership-finance/', sacredRoots: ['SR-032', 'SR-012'] },

      // NO path from year 1 gate
      { id: 30, type: 'state', label: 'Revenue declining, key staff leaving', x: 2000, y: 420, prob: 100, desc: 'Post-acquisition failure pattern: cultural clashes lead to employee dissatisfaction and turnover, operational disruptions compound, customers leave', source: 'Fortune / M&A Failure Trap 2024', sourceUrl: 'https://fortune.com/2024/11/13/we-analyzed-40000-mergers-acquisitions-ma-deals-over-40-years-why-70-75-percent-fail-leadership-finance/', sacredRoots: ['SR-026', 'SR-007'] },
      { id: 31, type: 'outcome-bad', label: 'Business fails, debt remains — personal guarantee', x: 2250, y: 480, prob: 100, desc: 'SBA loans require personal guarantee. If business fails, owner still owes. Avg acquisition loan $1.18M. Bankruptcy or years of repayment', source: 'SBA.gov / EBIT Community 2025', sourceUrl: 'https://www.sba.gov/business-guide', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 35, type: 'outcome-bad', label: 'Sold at loss to escape debt', x: 2250, y: 370, prob: 100, desc: 'Fire sale at 0.5-1x SDE. Still owe SBA difference. Personal credit damaged', source: 'BizBuySell (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-031', 'SR-007'] },

      // PARTIAL path from year 1 gate
      { id: 32, type: 'state', label: 'Flat: covering debt service but not growing', x: 2000, y: 0, prob: 100, desc: 'Business maintains revenue but growth stalls. Debt service consumes margin. Owner working 60+ hours as operator, not the passive income they imagined', source: 'BizBuySell Insight (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-014', 'SR-031'] },
      { id: 33, type: 'bottleneck', label: 'Can optimize and grow by year 3?', x: 2250, y: 0, prob: 40, desc: 'Some flat businesses turn around with better marketing, systems, or cost cuts. But debt load limits investment capacity', source: 'BizBuySell (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 34, type: 'outcome-bad', label: 'Stuck: pays the bills but no wealth creation', x: 2500, y: -60, prob: 100, desc: 'Bought a job, not a business. Working harder than employed life for similar or less pay after debt service', source: 'Search fund community (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://capitalpad.com/search-fund-statistics/', sacredRoots: ['SR-014', 'SR-031'] },

      // YES path from year 1 gate → growth
      { id: 11, type: 'trajectory', label: 'Validated acquisition — business growing', x: 2250, y: 200, prob: 100, desc: 'Revenue growing, systems stable, team retained. Nearly 7 in 10 acquired companies (via search funds) generated positive returns per Stanford 2024', source: 'Stanford GSB Search Fund Study 2024', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 12, type: 'action', label: 'Systematize, hire manager, reduce owner dependency', x: 2500, y: 130, prob: 100, desc: 'Build SOPs, promote a GM, create a business that runs without you. This is the path to wealth vs just owning a job', source: 'Industry best practice (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-017', 'SR-032'] },
      { id: 13, type: 'bottleneck', label: 'Scale to 2-3x revenue or exit?', x: 2750, y: 130, prob: 35, desc: 'Search fund IRR: 35.1%, ROI: 4.5x per Stanford 2024. But this is for the best operators. Median outcome is more modest', source: 'Stanford GSB Search Fund Study 2024', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 14, type: 'outcome-good', label: 'Profitable exit or $300K+ annual SDE', x: 3000, y: 70, prob: 100, desc: 'Median SDE for acquired business: $158,950 (2025). Top quartile: $300K+. Exit at 3-5x SDE = $900K-$1.5M+ payday', source: 'BizBuySell Insight Report 2025', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 15, type: 'outcome-good', label: 'Acquire second business, build portfolio', x: 3000, y: 200, prob: 100, desc: 'Serial acquirers use first business cash flow to fund second. Portfolio of 3-5 businesses = diversified income + higher exit multiple', source: 'Search fund / HoldCo model (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://capitalpad.com/search-fund-statistics/', sacredRoots: ['SR-017', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      // Due diligence bottleneck
      { from: 5, to: 20, label: 'fail' }, { from: 5, to: 6, label: 'pass' },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      // Financing gate: no / partial / yes
      { from: 6, to: 23, label: 'no' }, { from: 6, to: 25, label: 'partial' }, { from: 6, to: 7, label: 'yes' },
      { from: 23, to: 24 },
      { from: 25, to: 26 }, { from: 26, to: 27, label: 'fail' }, { from: 26, to: 7, label: 'pass' },
      // Operations
      { from: 7, to: 8 }, { from: 8, to: 9 }, { from: 9, to: 10 },
      // Year 1 gate: no / partial / yes
      { from: 10, to: 30, label: 'no' }, { from: 10, to: 32, label: 'partial' }, { from: 10, to: 11, label: 'yes' },
      { from: 30, to: 31 }, { from: 30, to: 35 },
      { from: 32, to: 33 }, { from: 33, to: 34, label: 'fail' }, { from: 33, to: 11, label: 'pass' },
      // Growth path
      { from: 11, to: 12 }, { from: 12, to: 13 },
      { from: 13, to: 14, label: 'pass' }, { from: 13, to: 15, label: 'pass' },
      { from: 13, to: 34, label: 'fail' },
    ]
  },
  buy_businessMin: {
    title: 'Buy an Existing Business (Summary)',
    input: 'Someone decides to buy an existing business instead of building from scratch',
    nodes: [
      { id: 1, type: 'state', label: '1000 people want to buy a business', x: 0, y: 150, prob: 100, desc: '9,546 small business acquisitions closed in 2024 ($7.59B). Median sale price $350K in 2025', source: 'BizBuySell Insight Report 2025', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 2, type: 'bottleneck', label: 'Find deal + pass due diligence?', x: 300, y: 150, prob: 25, desc: '37% of search fund searchers never acquire per Stanford 2024. Avg buyer reviews 20-50 businesses', source: 'Stanford GSB Search Fund Study 2024', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-035', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Never closes a deal', x: 300, y: 350, prob: 100, desc: 'Analysis paralysis, deal failures, or diligence reveals problems', source: 'Stanford GSB 2024 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.gsb.stanford.edu/faculty-research/case-studies/2024-search-fund-study', sacredRoots: ['SR-007', 'SR-001'] },
      { id: 4, type: 'bottleneck', label: 'Secure financing (SBA/seller)?', x: 600, y: 150, prob: 34, desc: 'SME full loan approval: ~34%. SBA acquisition loans: $8.29B approved in 2025 (+34.58% YoY)', source: 'SBA Lender Reports 2025', sourceUrl: 'https://www.sba.gov/partners/lenders/lender-reports', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Business grows after year 1?', x: 900, y: 150, prob: 30, desc: '70-75% of acquisitions fail to meet objectives (40K deal study). SMBs fare better: ~40-50% grow year 1', source: 'Fortune / M&A Failure Trap 2024', sourceUrl: 'https://fortune.com/2024/11/13/we-analyzed-40000-mergers-acquisitions-ma-deals-over-40-years-why-70-75-percent-fail-leadership-finance/', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 6, type: 'outcome-good', label: 'Profitable owner-operator, $150-300K SDE', x: 1200, y: 100, prob: 100, desc: 'Search fund IRR: 35.1%, ROI: 4.5x. Median SDE: $158,950. Top quartile: $300K+', source: 'Stanford GSB 2024 / BizBuySell 2025', sourceUrl: 'https://www.bizbuysell.com/insight-report/', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 7, type: 'outcome-bad', label: 'Revenue drops, stuck with debt', x: 1200, y: 250, prob: 100, desc: 'SBA personal guarantee means owner owes even if business fails. Avg loan: $1.18M', source: 'SBA / EBIT Community 2025', sourceUrl: 'https://ebitcommunity.com/p/sba-acquisition-market-pulse-q4-2025', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  buy_businessMid: {
    title: 'Buy an Existing Business (Analysis)',
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
      // Main path: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10
      { id: 1, type: 'state', label: '1000 people start an affiliate marketing blog', x: 0, y: 200, prob: 100, desc: 'Affiliate marketing industry worth $12B+ in 2025, growing ~14.7% YoY. 69% of affiliates use SEO as primary traffic source', source: 'FirstPromoter / Authority Hacker 2025', sourceUrl: 'https://firstpromoter.com/blog/affiliate-marketing-statistics', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 2, type: 'action', label: 'Pick niche + buy domain + set up WordPress', x: 200, y: 200, prob: 80, desc: '95% start in oversaturated niches. Domain + hosting: $50-200/year. 74.2% of new pages now contain AI content', source: 'Ahrefs 2025 / Orbit Media 2025', sourceUrl: 'https://ahrefs.com/blog/blogging-statistics/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 3, type: 'action', label: 'Research keywords, plan content calendar', x: 400, y: 200, prob: 70, desc: 'Long-tail keywords with KD <20 are the only realistic path for new sites. Most beginners target head terms they can never rank for', source: 'Ahrefs SEO Study 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-017', 'SR-036'] },
      { id: 4, type: 'bottleneck', label: 'Write 50+ quality articles (3-6 months)?', x: 650, y: 200, prob: 15, desc: 'Avg blog post takes 3h 51min per Orbit Media 2025. 85-90% of bloggers quit before reaching 20 articles. Consistency is the first filter', source: 'Orbit Media Survey 2025', sourceUrl: 'https://www.orbitmedia.com/blog/blogging-statistics/', sacredRoots: ['SR-012', 'SR-011'] },

      // FAIL from content bottleneck
      { id: 20, type: 'state', label: 'Published 5-15 articles then stopped', x: 650, y: 420, prob: 100, desc: 'Burnout, no visible results, lost motivation. The "content valley of death" — months of work with zero traffic feedback', source: 'Orbit Media / Blogging statistics 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.orbitmedia.com/blog/blogging-statistics/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 21, type: 'outcome-bad', label: '850+ abandon blog within 6 months', x: 900, y: 420, prob: 100, desc: 'Domain expires, hosting cancelled, hundreds of hours wasted. The most common outcome by far', source: 'Blogging statistics 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.orbitmedia.com/blog/blogging-statistics/', sacredRoots: ['SR-007', 'SR-010'] },

      // PASS → Google ranking gate
      { id: 5, type: 'gate', label: 'Google indexes and ranks content?', x: 900, y: 200, prob: 5, desc: 'Only 1.74% of newly published pages rank in top 10 within a year (down from 5.7% in 2017). 96.55% of all pages get zero organic traffic from Google. Avg #1 page is 5 years old', source: 'Ahrefs Ranking Study 2024', sourceUrl: 'https://ahrefs.com/blog/how-long-does-it-take-to-rank-in-google-and-how-old-are-top-ranking-pages/', sacredRoots: ['SR-010', 'SR-035'] },

      // NO path from Google gate (zero traffic)
      { id: 22, type: 'state', label: 'Zero organic traffic after 6-12 months', x: 900, y: 450, prob: 100, desc: '96.55% of pages get zero Google traffic per Ahrefs. Content exists but is invisible. No backlinks, no domain authority, no social proof', source: 'Ahrefs Content Study 2024', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 23, type: 'outcome-bad', label: 'Invisible blog, $0 revenue', x: 1150, y: 450, prob: 100, desc: 'Months of content creation for literally zero visitors. Hosting costs exceed revenue indefinitely', source: 'Ahrefs 2024 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-007', 'SR-031'] },

      // PARTIAL path (page 2-3)
      { id: 24, type: 'state', label: 'Page 2-3: 10-100 visitors/month', x: 900, y: 0, prob: 100, desc: 'Google knows you exist but doesnt trust you yet. 72.9% of top 10 pages are 3+ years old — you are competing against established sites', source: 'Ahrefs Ranking Study 2024', sourceUrl: 'https://ahrefs.com/blog/how-long-does-it-take-to-rank-in-google-and-how-old-are-top-ranking-pages/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 25, type: 'action', label: 'Build backlinks, improve content, wait 6-12 more months', x: 1150, y: 0, prob: 100, desc: 'Page 2 to page 1 requires backlinks, content refreshes, and time. Most bloggers dont have the patience or link-building skills', source: 'Ahrefs / SEO industry data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 26, type: 'bottleneck', label: 'Breaks into page 1?', x: 1400, y: 0, prob: 20, desc: 'Requires DR 30+ and relevant backlinks. For those pages that do rank, 40.82% break in within 1 month — but most never get there', source: 'Ahrefs Ranking Study 2024', sourceUrl: 'https://ahrefs.com/blog/how-long-does-it-take-to-rank-in-google-and-how-old-are-top-ranking-pages/', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 27, type: 'outcome-bad', label: 'Permanently stuck on page 2, invisible', x: 1650, y: -60, prob: 100, desc: 'Page 2 gets <1% of clicks. All the work, none of the reward. The digital equivalent of a shop on a dead-end street', source: 'Ahrefs CTR data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-007', 'SR-010'] },

      // YES path from Google gate → traffic
      { id: 6, type: 'state', label: 'Page 1 rankings, 500-5000 visitors/month', x: 1150, y: 200, prob: 100, desc: 'Top 10 results get 90%+ of all clicks. Organic traffic is the holy grail of affiliate — free, recurring, high-intent', source: 'Ahrefs CTR Study (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 7, type: 'action', label: 'Add affiliate links, test conversion', x: 1400, y: 200, prob: 100, desc: 'Apply to Amazon Associates, ShareASale, Impact, or direct programs. Conversion rate: 0.5-3% for most niches. Commission: 3-50% depending on program', source: 'Authority Hacker Affiliate Survey 2024', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-031', 'SR-035'] },
      { id: 8, type: 'bottleneck', label: 'Earn $1K+/month commissions?', x: 1650, y: 200, prob: 10, desc: 'Only 35% of affiliates earn $20K+/year. Avg monthly income ranges from $636 (beginners) to $8,038 (experienced). Merely 1% reach 6-7 figures/month', source: 'Authority Hacker Survey 2024', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-031', 'SR-012'] },

      // FAIL from $1K bottleneck
      { id: 28, type: 'state', label: '$10-100/month, less than hosting costs', x: 1650, y: 420, prob: 100, desc: 'Traffic converts but volume is too low. Earning pennies per click on Amazon 3% commissions. Would need 10x traffic to be meaningful', source: 'Authority Hacker (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-031', 'SR-013'] },
      { id: 29, type: 'outcome-bad', label: 'Hobby blog, not a business', x: 1900, y: 420, prob: 100, desc: 'Years of work for less than minimum wage. The math never works at low traffic volumes with low commission rates', source: 'Affiliate marketing statistics 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-031', 'SR-007'] },

      // PASS → scaling
      { id: 9, type: 'trajectory', label: 'Validated affiliate model — scaling content', x: 1900, y: 200, prob: 100, desc: 'Affiliates with 3+ years experience earn 9.45x more than beginners. Most profitable niches: education ($15,551/mo), travel ($13,847/mo), beauty ($12,475/mo)', source: 'Authority Hacker Survey 2024', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 10, type: 'action', label: 'Scale to 100+ articles, diversify programs', x: 2150, y: 200, prob: 100, desc: 'Build email list, add multiple affiliate programs, create comparison/review content that converts 3-5x better than informational', source: 'Authority Hacker (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 11, type: 'gate', label: 'Survives Google algorithm update?', x: 2400, y: 200, prob: 30, desc: 'Google Dec 2025 core update: 71% of affiliate sites hit. March 2024 update: 30-90% traffic loss reported. HCU wiped 80% traffic from scaled AI content sites', source: 'Search Engine Roundtable / Crowdo 2025', sourceUrl: 'https://crowdo.net/blog/helpful-content-update-traffic-loss-2025', sacredRoots: ['SR-001', 'SR-035'] },

      // NO from algorithm update
      { id: 30, type: 'state', label: 'Algorithm update: 40-90% traffic loss overnight', x: 2400, y: 420, prob: 100, desc: 'Google Dec 2025 core update hit 71% of affiliate sites. Major publishers lost 50-60% traffic overnight in March 2024. Recovery takes 6-12 months if ever', source: 'Search Engine Roundtable 2025 / Global Reach 2025', sourceUrl: 'https://www.globalreach.com/global-reach-media/blog/2025/03/14/recover-lost-traffic-after-googles-latest-algorithm-update', sacredRoots: ['SR-001', 'SR-007'] },
      { id: 31, type: 'outcome-bad', label: 'Traffic destroyed, revenue collapses', x: 2650, y: 420, prob: 100, desc: '60% of Google searches now end with zero clicks (up from 58% in 2024). AI overviews replacing organic results. Affiliate blogs increasingly at risk', source: 'The Digital Bloom Organic Traffic Crisis Report 2025', sourceUrl: 'https://thedigitalbloom.com/learn/2025-organic-traffic-crisis-analysis-report/', sacredRoots: ['SR-007', 'SR-001'] },

      // PARTIAL from algorithm
      { id: 32, type: 'state', label: 'Partial hit: 20-40% traffic loss, recoverable', x: 2400, y: 0, prob: 100, desc: 'Site has enough authority and quality signals to partially recover. Diversified traffic sources (email, social) buffer the blow', source: 'SEO industry data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.searchenginejournal.com/', sacredRoots: ['SR-001', 'SR-017'] },
      { id: 33, type: 'action', label: 'Diversify: email list, social, paid traffic', x: 2650, y: 0, prob: 100, desc: 'Smart affiliates build email lists (owns the audience) and diversify away from 100% Google dependency. 78% still rely on SEO as primary source', source: 'Authority Hacker Survey 2024 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-017', 'SR-036'] },

      // YES from algorithm → success
      { id: 12, type: 'state', label: 'Survived update, $5K+/month passive income', x: 2650, y: 200, prob: 100, desc: 'Top 10% of affiliate sites earn $10K+/month. Avg experienced affiliate: $8,038/month. Sites with E-E-A-T signals and genuine expertise survive updates', source: 'Authority Hacker Survey 2024', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 13, type: 'bottleneck', label: 'Build to $10K+/month or exit?', x: 2900, y: 200, prob: 40, desc: '15% of affiliates earn $80K-$1M+/year. Site exits: 30-40x monthly profit on marketplaces like Empire Flippers. A $10K/mo site sells for $300-400K', source: 'Authority Hacker / Empire Flippers (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 14, type: 'outcome-good', label: '$10K+/month or 6-figure exit', x: 3150, y: 130, prob: 100, desc: 'The affiliate dream realized: recurring passive income or a life-changing lump sum exit. Requires 2-5 years of consistent work', source: 'Authority Hacker 2024', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 15, type: 'outcome-bad', label: 'Plateaus at $3-5K, constant maintenance', x: 3150, y: 280, prob: 100, desc: 'Content needs refreshing, links decay, competitors catch up. Not truly passive — requires ongoing work to maintain rankings', source: 'SEO industry (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-014', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      // Content bottleneck
      { from: 4, to: 20, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 20, to: 21 },
      // Google ranking gate: no / partial / yes
      { from: 5, to: 22, label: 'no' }, { from: 5, to: 24, label: 'partial' }, { from: 5, to: 6, label: 'yes' },
      { from: 22, to: 23 },
      { from: 24, to: 25 }, { from: 25, to: 26 }, { from: 26, to: 27, label: 'fail' }, { from: 26, to: 6, label: 'pass' },
      // Traffic → monetization
      { from: 6, to: 7 }, { from: 7, to: 8 },
      { from: 8, to: 28, label: 'fail' }, { from: 8, to: 9, label: 'pass' },
      { from: 28, to: 29 },
      // Scaling → algorithm gate
      { from: 9, to: 10 }, { from: 10, to: 11 },
      { from: 11, to: 30, label: 'no' }, { from: 11, to: 32, label: 'partial' }, { from: 11, to: 12, label: 'yes' },
      { from: 30, to: 31 },
      { from: 32, to: 33 }, { from: 33, to: 12 },
      // Final
      { from: 12, to: 13 },
      { from: 13, to: 14, label: 'pass' }, { from: 13, to: 15, label: 'fail' },
    ]
  },
  affiliate_blogMin: {
    title: 'Affiliate Marketing Blog (Summary)',
    input: 'Someone starts an affiliate marketing blog',
    nodes: [
      { id: 1, type: 'state', label: '1000 people start an affiliate blog', x: 0, y: 150, prob: 100, desc: 'Affiliate marketing: $12B+ industry (2025). 69% use SEO as primary traffic source', source: 'FirstPromoter 2025', sourceUrl: 'https://firstpromoter.com/blog/affiliate-marketing-statistics', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 2, type: 'bottleneck', label: 'Write 50+ articles without quitting?', x: 300, y: 150, prob: 15, desc: '85-90% quit before 20 articles. Avg post: 3h 51min. Most never reach the content volume needed to rank', source: 'Orbit Media 2025', sourceUrl: 'https://www.orbitmedia.com/blog/blogging-statistics/', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 3, type: 'outcome-bad', label: '850+ quit within 6 months', x: 300, y: 350, prob: 100, desc: 'The most common outcome. Domain expires, hundreds of hours lost', source: 'Blogging statistics 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.orbitmedia.com/blog/blogging-statistics/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Rank page 1 on Google?', x: 600, y: 150, prob: 5, desc: 'Only 1.74% of new pages rank top 10 within a year. 96.55% get zero traffic. Avg #1 page is 5 years old', source: 'Ahrefs Ranking Study 2024', sourceUrl: 'https://ahrefs.com/blog/how-long-does-it-take-to-rank-in-google-and-how-old-are-top-ranking-pages/', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 5, type: 'bottleneck', label: 'Earn $1K+/month + survive Google updates?', x: 900, y: 150, prob: 10, desc: 'Only 35% earn $20K+/yr. Dec 2025 update hit 71% of affiliate sites. 60% of searches end with zero clicks', source: 'Authority Hacker 2024 / Search Engine Roundtable 2025', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 6, type: 'outcome-good', label: '$5-10K+/month passive income', x: 1200, y: 100, prob: 100, desc: 'Top 10% earn $10K+/mo. Avg experienced affiliate: $8,038/mo. Requires 2-5 years', source: 'Authority Hacker Survey 2024', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-survey/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Rest: $0-100/month or wiped by Google', x: 1200, y: 250, prob: 100, desc: 'Most earn less than hosting costs. Those who succeed face constant algorithm risk', source: 'Ahrefs / Authority Hacker (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.authorityhacker.com/affiliate-marketing-statistics/', sacredRoots: ['SR-031', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (85%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  affiliate_blogMid: {
    title: 'Affiliate Marketing Blog (Analysis)',
    input: 'Someone starts an affiliate marketing blog',
    nodes: [
      { id: 1, type: 'desire', label: 'Want passive income from blog', x: 0, y: 120, prob: 100, desc: 'Affiliate marketing industry worth $17B+', source: 'Statista 2025', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 2, type: 'action', label: 'Pick niche + buy domain ($50-200)', x: 240, y: 120, prob: 80, desc: '95% of affiliate sites start in oversaturated niches', source: 'Ahrefs study', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 3, type: 'action', label: 'Write 50+ articles (3-6 months)', x: 480, y: 120, prob: 15, desc: '90% of bloggers quit before reaching 20 articles', source: 'Blogging survey (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Gave up after 10 articles', x: 480, y: 300, prob: 100, desc: 'Avg blog post takes 3-5 hours to write well', source: 'Orbit Media (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.orbitmedia.com/blog/', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 5, type: 'gate', label: 'Google indexes + ranks page 1', x: 720, y: 120, prob: 8, desc: 'Only 5.7% of pages rank in top 10 within 1 year', source: 'Ahrefs 2025', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-010', 'SR-035'] },
      { id: 6, type: 'outcome-bad', label: 'Zero traffic after 6 months', x: 720, y: 300, prob: 100, desc: '90.63% of pages get zero Google traffic', source: 'Ahrefs', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'state', label: 'Page 2-3, 10-50 visitors/month', x: 720, y: 270, prob: 100, desc: 'Google knows you exist but doesnt care — stuck in no-mans-land', source: 'Ahrefs 2025', sourceUrl: 'https://ahrefs.com/blog/search-traffic-study/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 12, type: 'bottleneck', label: 'Climbs to page 1?', x: 960, y: 270, prob: 20, desc: 'Page 2 to page 1 requires backlinks and time most bloggers dont have', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-012'] },
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
      // Main path: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13
      { id: 1, type: 'state', label: '1000 people want to launch a paid community', x: 0, y: 200, prob: 100, desc: 'Creator economy worth $250B+ in 2025. 200K+ communities on Skool alone. Paid communities are the fastest-growing creator monetization model', source: 'Goldman Sachs 2025 / Skool data', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 2, type: 'desire', label: 'Monetize expertise with recurring membership', x: 200, y: 200, prob: 100, desc: 'The pitch: $97/month x 100 members = $9,700 MRR. Skool and Circle make it easy to launch. But launching is not the hard part', source: 'Skool / Circle platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 3, type: 'action', label: 'Choose platform + set up community', x: 400, y: 200, prob: 70, desc: 'Skool: $9-99/mo. Circle: $49-89/mo (annual). Setup takes 1-3 days. 30% never finish setup or launch publicly', source: 'Skool / Circle pricing 2025', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 4, type: 'action', label: 'Announce launch to existing audience', x: 600, y: 200, prob: 50, desc: 'Success requires existing audience of 1-5K minimum (email, social, YouTube). Cold-launching to zero audience = zero members', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 5, type: 'gate', label: 'Get first 10 paying members?', x: 850, y: 200, prob: 20, desc: '80% of paid communities have fewer than 10 members. The first 10 is the hardest — requires trust, proof of value, and an audience that already knows you', source: 'Platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-010'] },

      // NO path (zero traction)
      { id: 20, type: 'state', label: '0-3 members after launch week', x: 850, y: 430, prob: 100, desc: 'No audience = no members. The community feels empty. Posting to yourself. Platform fee ($49-99/mo) exceeds revenue', source: 'Platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 21, type: 'trajectory', label: 'Empty room spiral — less activity = more churn', x: 1050, y: 430, prob: 100, desc: 'Communities need critical mass to generate organic discussion. Below 10 members, the community owner does all the talking. Members feel they joined a dead group', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-007'] },
      { id: 22, type: 'outcome-bad', label: 'Shut down, lost platform fees + reputation', x: 1300, y: 430, prob: 100, desc: 'Embarrassment of a failed public launch. $300-600 in platform fees wasted. Harder to relaunch — audience saw the failure', source: 'Platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-007', 'SR-010'] },

      // PARTIAL path (tiny but real)
      { id: 23, type: 'state', label: '4-9 members — real but fragile', x: 850, y: 0, prob: 100, desc: 'Enough to feel responsible, not enough to feel successful. Revenue: $300-700/mo. One cancellation = -10% revenue instantly', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 24, type: 'action', label: 'Over-deliver to tiny group, get testimonials', x: 1100, y: 0, prob: 100, desc: 'Treat the first 5 members like VIPs. Personal attention, custom content, weekly calls. Their testimonials and word-of-mouth are everything', source: 'Community growth patterns (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-032', 'SR-026'] },
      { id: 25, type: 'bottleneck', label: 'Grows past 10 members?', x: 1350, y: 0, prob: 30, desc: 'Small communities either grow or die. Staying at 5 members is unsustainable — the math doesnt work and motivation fades', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 26, type: 'outcome-bad', label: 'Ghost community: 5 silent members who eventually cancel', x: 1600, y: -60, prob: 100, desc: 'Members stop engaging, start lurking, then cancel one by one. The community dies slowly rather than suddenly', source: 'Platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-008'] },

      // YES path → retention challenge
      { id: 6, type: 'state', label: '10-30 paying members, early traction', x: 1100, y: 200, prob: 100, desc: 'Revenue: $790-2,370/mo at $79/member. Community has enough activity for organic discussion. But now the retention battle begins', source: 'Community math (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 7, type: 'bottleneck', label: 'Retain members past month 2?', x: 1350, y: 200, prob: 40, desc: 'Average Skool community churn: 18%/month. Less than 10% is good. First-year member renewal: 75% (median). Content treadmill begins: weekly calls, posts, modules', source: 'Skool Community Data 2025 / MGI Benchmarking Report 2025', sourceUrl: 'https://www.skool.com/educate/average-churn-levels', sacredRoots: ['SR-032', 'SR-025'] },

      // FAIL from retention
      { id: 27, type: 'state', label: 'High churn: 20-30%/month, losing members faster than gaining', x: 1350, y: 420, prob: 100, desc: 'At 25% monthly churn, you lose half your members every 3 months. Need constant marketing just to stay flat. Exhausting treadmill', source: 'Skool Community Data 2025', sourceUrl: 'https://www.skool.com/community/whats-everyones-monthly-paid-group-retentionchurn-rate-is', sacredRoots: ['SR-032', 'SR-014'] },
      { id: 28, type: 'outcome-bad', label: 'Revolving door: members join then cancel in 2-4 months', x: 1600, y: 420, prob: 100, desc: 'Median membership duration: 2-4 months. Community never grows because churn eats all new signups. Revenue flat or declining', source: 'Subscription data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-032', 'SR-026'] },

      // PASS → scaling
      { id: 8, type: 'trajectory', label: 'Retention < 10% churn — community growing', x: 1600, y: 200, prob: 100, desc: 'Churn under 10% means the community has real value. Members stay, refer others, create content. The flywheel starts spinning', source: 'Skool Community Data 2025', sourceUrl: 'https://www.skool.com/educate/average-churn-levels', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 9, type: 'action', label: 'Add structure: courses, events, tiers', x: 1850, y: 200, prob: 100, desc: 'Successful communities layer value: live calls, courses, challenges, networking events, accountability groups. This is what reduces churn and increases LTV', source: 'Community growth patterns (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-032', 'SR-017'] },
      { id: 10, type: 'gate', label: 'Reach 100+ paying members?', x: 2100, y: 200, prob: 15, desc: '100 members x $79 = $7,900 MRR. This is the threshold where community becomes a real business, not a side project. Very few reach this level', source: 'Community math / Skool leaderboard (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-031'] },

      // NO from 100 member gate
      { id: 29, type: 'state', label: 'Plateau at 20-40 members', x: 2100, y: 420, prob: 100, desc: 'Revenue: $1,580-3,160/mo. Enough to be meaningful but not life-changing. Content treadmill: weekly calls, daily posts, DM support. Creator burnout incoming', source: 'Creator burnout data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-014', 'SR-012'] },
      { id: 40, type: 'outcome-bad', label: 'Burned out at 30 members, closes or goes free', x: 2350, y: 420, prob: 100, desc: 'Working 20+ hours/week on community for $2K/mo. Effective hourly rate below minimum wage. Many convert to free communities or shut down', source: 'Creator economy data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-014', 'SR-031'] },

      // PARTIAL from 100 member gate
      { id: 41, type: 'state', label: '50-80 members, growing slowly', x: 2100, y: 0, prob: 100, desc: 'Revenue: $3,950-6,320/mo. Real business but not yet sustainable if it is the only income. Needs more systems and automation', source: 'Community math (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-012'] },
      { id: 42, type: 'bottleneck', label: 'Builds systems to scale past 100?', x: 2350, y: 0, prob: 40, desc: 'Hire community manager, create self-serve content library, build referral loops. The transition from creator-led to community-led', source: 'Community growth (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-017', 'SR-032'] },
      { id: 43, type: 'outcome-bad', label: 'Stuck at 60: good income but exhausting', x: 2600, y: -60, prob: 100, desc: '$4,740/mo but working 25+ hours/week. Cannot take a break without engagement dropping. Golden handcuffs', source: 'Creator economy (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-014', 'SR-025'] },

      // YES → thriving
      { id: 11, type: 'state', label: '100+ members, $8K+ MRR', x: 2350, y: 200, prob: 100, desc: 'Top Skool communities: 500-5K members. At this scale, community generates its own content, discussions, and referrals. Creator can step back', source: 'Skool leaderboard (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 12, type: 'action', label: 'Add upsells: courses, coaching, events', x: 2600, y: 200, prob: 100, desc: 'Layer revenue: $97/mo membership + $997 course + $5K coaching. LTV per member goes from $300 to $2,000+. The real money is in the stack', source: 'Community business models (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-031', 'SR-017'] },
      { id: 13, type: 'decision', label: 'Scale to 500+ or maintain at 100-200?', x: 2850, y: 200, prob: 50, desc: 'Scaling past 200 requires hiring, systems, and potentially losing the intimate feel that made the community special. Some choose quality over quantity', source: 'Community scaling patterns (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-017'] },
      { id: 14, type: 'outcome-good', label: 'Thriving: 500+ members, $50K+ MRR', x: 3100, y: 130, prob: 100, desc: 'Top Skool communities earn $50-500K MRR. Community runs itself. Creator becomes the brand, not the worker. Recurring revenue dream realized', source: 'Skool leaderboard (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 15, type: 'outcome-good', label: 'Lifestyle: 100-200 members, $10-20K MRR, low stress', x: 3100, y: 280, prob: 100, desc: 'Chose quality over scale. 150 members x $97 = $14,550/mo. Hire 1 community manager. Work 10 hours/week. The sweet spot for many creators', source: 'Community business models (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-014'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      // First 10 members gate: no / partial / yes
      { from: 5, to: 20, label: 'no' }, { from: 5, to: 23, label: 'partial' }, { from: 5, to: 6, label: 'yes' },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 23, to: 24 }, { from: 24, to: 25 }, { from: 25, to: 26, label: 'fail' }, { from: 25, to: 6, label: 'pass' },
      // Retention bottleneck
      { from: 6, to: 7 },
      { from: 7, to: 27, label: 'fail' }, { from: 7, to: 8, label: 'pass' },
      { from: 27, to: 28 },
      // Scaling
      { from: 8, to: 9 }, { from: 9, to: 10 },
      // 100 member gate: no / partial / yes
      { from: 10, to: 29, label: 'no' }, { from: 10, to: 41, label: 'partial' }, { from: 10, to: 11, label: 'yes' },
      { from: 29, to: 40 },
      { from: 41, to: 42 }, { from: 42, to: 43, label: 'fail' }, { from: 42, to: 11, label: 'pass' },
      // Success path
      { from: 11, to: 12 }, { from: 12, to: 13 },
      { from: 13, to: 14, label: 'yes' }, { from: 13, to: 15, label: 'no' },
    ]
  },
  paid_communityMin: {
    title: 'Start a Paid Community (Summary)',
    input: 'Someone launches a paid community on Skool or Circle',
    nodes: [
      { id: 1, type: 'state', label: '1000 people launch a paid community', x: 0, y: 150, prob: 100, desc: 'Creator economy: $250B+ (2025). 200K+ Skool communities. Most launch to zero audience', source: 'Goldman Sachs 2025 / Skool data', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 2, type: 'bottleneck', label: 'Get first 10 paying members?', x: 300, y: 150, prob: 20, desc: '80% of paid communities have <10 members. Requires existing audience of 1-5K minimum', source: 'Platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '800+ fail to get 10 members', x: 300, y: 350, prob: 100, desc: 'Empty rooms, wasted platform fees, public embarrassment of failed launch', source: 'Platform data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Retain members (churn < 10%/mo)?', x: 600, y: 150, prob: 40, desc: 'Avg Skool churn: 18%/month. Good: <10%. First-year renewal: 75% median. Median membership: 2-4 months', source: 'Skool Community Data 2025 / MGI Report 2025', sourceUrl: 'https://www.skool.com/educate/average-churn-levels', sacredRoots: ['SR-032', 'SR-025'] },
      { id: 5, type: 'bottleneck', label: 'Reach 100+ paying members?', x: 900, y: 150, prob: 15, desc: '100 x $79 = $7,900 MRR. Very few communities reach this. Most plateau at 20-40 members', source: 'Community math (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 6, type: 'outcome-good', label: 'Thriving: 100+ members, $8K+ MRR', x: 1200, y: 100, prob: 100, desc: 'Top communities: 500-5K members, $50-500K MRR. Community generates its own content and referrals', source: 'Skool leaderboard (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Plateau at 20-40, burned out', x: 1200, y: 250, prob: 100, desc: 'Content treadmill: weekly calls, daily posts. Working 20+ hrs/week for $2K/mo. Many convert to free or shut down', source: 'Creator burnout data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-014', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (80%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
    ]
  },
  paid_communityMid: {
    title: 'Start a Paid Community (Analysis)',
    input: 'Someone launches a paid community on Skool or Circle',
    nodes: [
      { id: 1, type: 'desire', label: 'Monetize expertise with community', x: 0, y: 120, prob: 100, desc: 'Creator economy worth $250B+ in 2025', source: 'Goldman Sachs', sourceUrl: 'https://www.goldmansachs.com/insights/', sacredRoots: ['SR-025', 'SR-032'] },
      { id: 2, type: 'action', label: 'Launch on Skool/Circle ($49-97/mo)', x: 240, y: 120, prob: 50, desc: '200K+ communities on Skool alone', source: 'Skool data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 3, type: 'gate', label: 'Get first 10 paying members', x: 480, y: 120, prob: 20, desc: 'Need existing audience of 1-5K minimum', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: '0-3 members, embarrassing', x: 480, y: 300, prob: 100, desc: '80% of paid communities have <10 members', source: 'Platform data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-018', 'SR-007'] },
      { id: 10, type: 'state', label: '4-7 members, real but tiny', x: 480, y: 270, prob: 100, desc: 'Enough to feel responsible, not enough to feel successful', source: 'Community benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-010'] },
      { id: 11, type: 'bottleneck', label: 'Grows past 10?', x: 720, y: 270, prob: 20, desc: 'Small communities either grow or die — staying at 5 members is unsustainable', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-025', 'SR-036'] },
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

  crypto_journeyMin: {
    title: 'Crypto Investment Journey (Summary)',
    input: 'Someone starts investing in cryptocurrency',
    nodes: [
      { id: 1, type: 'desire', label: '1000 people FOMO into crypto', x: 0, y: 150, prob: 100, desc: '580M+ crypto owners globally as of 2024. Most enter during bull market hype cycles', source: 'Crypto.com Global Crypto Owners 2024', sourceUrl: 'https://crypto.com/research', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'bottleneck', label: 'Survive first -30% crash?', x: 250, y: 150, prob: 40, desc: 'BTC has 5-10 crashes of 30%+ per cycle. 80% of retail traders ultimately lose money', source: 'CoinGecko Historical Data 2024 | Bitget Research 2025', sourceUrl: 'https://www.coingecko.com/', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '600 panic sell at loss', x: 250, y: 350, prob: 100, desc: '97% of day traders lose money within a year. 80% quit after first 2 years', source: 'BIS Bulletin No. 69 2024 | Bloomberg 2024', sourceUrl: 'https://www.bis.org/publ/bisbull69.pdf', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 4, type: 'bottleneck', label: 'Navigate altcoin casino? (10%)', x: 500, y: 150, prob: 10, desc: '95% of altcoins lose value vs BTC over 4 years. $2.2B stolen via hacks in 2024, $106M in rug pulls', source: 'Messari Research 2025 | Immunefi 2024 | CoinLedger Crypto Crime Report 2025', sourceUrl: 'https://messari.io/research', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 5, type: 'bottleneck', label: 'Net positive after full cycle?', x: 750, y: 150, prob: 20, desc: 'Only 10-20% of crypto traders profitable long-term. Avg retail investor underperforms BTC buy-and-hold by 40%', source: 'Academic Studies 2024 | MIT Digital Currency Initiative', sourceUrl: 'https://dci.mit.edu/', sacredRoots: ['SR-035', 'SR-011'] },
      { id: 6, type: 'outcome-good', label: '20-40 build real crypto wealth', x: 1000, y: 100, prob: 100, desc: 'HODLers who held 4+ years: 95% profitable. DCA through bear market = +192% to +2,056% returns', source: 'Glassnode 2025 | Fidelity Bitcoin Cycles Research 2025', sourceUrl: 'https://glassnode.com/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 7, type: 'outcome-bad', label: '960 broke + emotional damage', x: 1000, y: 250, prob: 100, desc: 'Avg retail crypto investor underperforms BTC buy-and-hold by 40%. $12B lost to scams in 2024 alone', source: 'BIS Bulletin 2024 | CoinLedger Crypto Crime Report 2025', sourceUrl: 'https://coinledger.io/research/crypto-crime-report', sacredRoots: ['SR-011', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (60%)' }, { from: 2, to: 4, label: 'pass (40%)' },
      { from: 4, to: 3, label: 'fail (90%)' }, { from: 4, to: 5, label: 'pass (10%)' },
      { from: 5, to: 6, label: 'pass (20%)' }, { from: 5, to: 7, label: 'fail (80%)' },
    ]
  },

  crypto_journeyMid: {
    title: 'Crypto Investment Journey (Analysis)',
    input: 'Someone starts investing in cryptocurrency',
    nodes: [
      { id: 1, type: 'desire', label: 'FOMO into crypto, buy first Bitcoin', x: 0, y: 120, prob: 100, desc: '420M+ crypto users globally', source: 'Crypto.com 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://crypto.com/research', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'action', label: 'Open exchange account, buy BTC', x: 240, y: 120, prob: 70, desc: 'Avg first purchase: $100-500', source: 'Coinbase data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.coinbase.com/research', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'gate', label: 'Survive first -30% crash', x: 480, y: 120, prob: 40, desc: 'BTC has 5-10 crashes of 30%+ per cycle', source: 'CoinGecko historical', sourceUrl: 'https://www.coingecko.com/', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 4, type: 'outcome-bad', label: 'Panic sell at loss', x: 480, y: 300, prob: 100, desc: '80% of retail traders sell at a loss', source: 'Chainalysis 2025', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 11, type: 'state', label: 'Holding but panicking daily', x: 480, y: 270, prob: 100, desc: 'Checking portfolio 20x/day, losing sleep', source: 'CoinGecko historical', sourceUrl: 'https://www.coingecko.com/', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 12, type: 'bottleneck', label: 'Survives the full dip?', x: 720, y: 270, prob: 20, desc: 'Most panickers eventually crack and sell at worst moment', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 13, type: 'outcome-bad', label: 'Sold at -25%, missed recovery', x: 720, y: 420, prob: 100, desc: 'Panic sold near bottom, watched it recover without them', source: 'Chainalysis 2025', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 5, type: 'decision', label: 'Start trading altcoins?', x: 720, y: 120, prob: 60, desc: 'Altcoin greed: 10-100x gains advertised', source: 'Crypto Twitter (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-013', 'SR-017'] },
      { id: 6, type: 'bottleneck', label: 'Navigate altcoin casino', x: 960, y: 120, prob: 10, desc: '95% of altcoins lose value vs BTC over 4 years', source: 'Messari research (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://messari.io/research', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 7, type: 'outcome-bad', label: 'Lost money on shitcoins/rugs', x: 960, y: 300, prob: 100, desc: '$3.9B lost to crypto scams/rugs in 2024', source: 'Chainalysis', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-023', 'SR-031'] },
      { id: 8, type: 'decision', label: 'Net positive after full cycle?', x: 1200, y: 120, prob: 20, desc: 'Only 10-20% profitable long-term', source: 'Academic studies (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-035', 'SR-011'] },
      { id: 9, type: 'outcome-good', label: 'Built real crypto wealth', x: 1440, y: 60, prob: 100, desc: 'HODLers 4+ years: 95% profitable', source: 'Glassnode', sourceUrl: 'https://glassnode.com/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 10, type: 'outcome-bad', label: 'Broke + emotional damage', x: 1440, y: 220, prob: 100, desc: 'Avg retail underperforms BTC buy-and-hold by 40%', source: 'MIT study (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-011', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'no' }, { from: 3, to: 11, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 5, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  crypto_journey: {
    title: 'Crypto Investment Journey',
    input: 'Someone starts investing in cryptocurrency',
    nodes: [
      // Phase 1: Entry (IDs 1-5)
      { id: 1, type: 'state', label: '1000 people hear about crypto gains', x: 0, y: 200, prob: 100, desc: '580M+ crypto owners globally as of 2024. Most new entrants arrive during bull market euphoria', source: 'Crypto.com Global Crypto Owners 2024', sourceUrl: 'https://crypto.com/research', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'desire', label: 'FOMO kicks in, want quick gains', x: 220, y: 200, prob: 100, desc: 'Social media amplifies gains, hides losses. "Everyone is getting rich except me" feeling', source: 'BIS Bulletin No. 69 2024', sourceUrl: 'https://www.bis.org/publ/bisbull69.pdf', sacredRoots: ['SR-013', 'SR-011'] },
      { id: 3, type: 'action', label: 'Open exchange account, buy first BTC', x: 440, y: 200, prob: 70, desc: 'Avg first purchase $100-500. 30% never actually buy after creating account', source: 'Coinbase Quarterly Report 2024', sourceUrl: 'https://www.coinbase.com/research', sacredRoots: ['SR-031', 'SR-008'] },
      { id: 4, type: 'state', label: '700 now hold crypto', x: 660, y: 200, prob: 100, desc: '70% of account creators make a purchase. Most put in more than they planned', source: 'Kraken Cryptocurrency Statistics 2024', sourceUrl: 'https://www.kraken.com/learn/cryptocurrency-statistics', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 5, type: 'gate', label: 'First -30% crash hits', x: 880, y: 200, prob: 40, desc: 'BTC has 5-10 crashes of 30%+ per cycle. 2022: -78% from ATH. Bear markets last 9-18 months median', source: 'CoinGecko Historical Data 2024 | Fidelity Bitcoin Cycles 2025', sourceUrl: 'https://www.fidelity.com/learning-center/trading-investing/four-year-bitcoin-and-crypto-cycles', sacredRoots: ['SR-011', 'SR-010'] },
      // NO path: Panic sell (IDs 10-14)
      { id: 10, type: 'state', label: 'Panic: portfolio down 30%+', x: 880, y: 450, prob: 100, desc: '80% of retail traders ultimately lose money. Emotional decision-making peaks during crashes', source: 'Bitget Research 2025 | BIS Bulletin 2024', sourceUrl: 'https://www.bitget.com/wiki/what-percentage-of-traders-lose-money', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 11, type: 'action', label: 'Panic sell at loss', x: 1100, y: 390, prob: 100, desc: '97% of day traders lose money within a year. Sell low, regret later', source: 'BIS Bulletin No. 69 2024 | Bloomberg 2024', sourceUrl: 'https://www.bis.org/publ/bisbull69.pdf', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 12, type: 'outcome-bad', label: 'Sold at bottom, missed recovery', x: 1320, y: 390, prob: 100, desc: 'BTC rallied 716% from 2022 bottom ($15,479) to Oct 2025 high ($126,271)', source: 'Trade That Swing BTC Statistics 2025', sourceUrl: 'https://tradethatswing.com/statistics-on-how-bitcoin-moves-average-rally-and-pullback-percentages-bull-bear-market-durations-and-gains-losses/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 13, type: 'action', label: 'Try to "win it back" with leverage', x: 1100, y: 510, prob: 100, desc: 'Revenge trading after loss. Leverage amplifies both gains and catastrophic losses', source: 'Coinmarketman Retail Trading Stats 2025', sourceUrl: 'https://coinmarketman.com/blog/retail-trading-crypto-data/', sacredRoots: ['SR-013', 'SR-011'] },
      { id: 14, type: 'outcome-bad', label: 'Liquidated, lost everything', x: 1320, y: 510, prob: 100, desc: 'Leveraged traders face 90%+ failure rate. Exchanges profit from liquidations', source: 'Bitget Research 2025', sourceUrl: 'https://www.bitget.com/wiki/what-percentage-of-traders-lose-money', sacredRoots: ['SR-031', 'SR-011'] },
      // PARTIAL path: Hold but panicking (IDs 20-24)
      { id: 20, type: 'state', label: 'Holding but checking price 20x/day', x: 880, y: -20, prob: 100, desc: 'Crypto anxiety: sleep disruption, constant portfolio checking, relationship strain', source: 'CoinGecko User Survey 2024', sourceUrl: 'https://www.coingecko.com/', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 21, type: 'trajectory', label: 'White-knuckle HODL path', x: 1100, y: -20, prob: 100, desc: 'Holding through pain but with no strategy. Pure willpower, no conviction', source: 'Pattern Analysis (estimated by Foresight from public data)', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 22, type: 'bottleneck', label: 'Survives the full dip without selling?', x: 1320, y: -20, prob: 25, desc: 'Most panickers eventually crack at the worst moment. Bear markets last 9-18 months', source: 'Fidelity Bitcoin Cycles Research 2025 | KuCoin Bear Market Guide 2026', sourceUrl: 'https://www.fidelity.com/learning-center/trading-investing/four-year-bitcoin-and-crypto-cycles', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 23, type: 'outcome-bad', label: 'Cracked at -50%, sold near bottom', x: 1540, y: -80, prob: 100, desc: 'Held for months then sold at the worst possible moment. Emotional exhaustion wins', source: 'Chainalysis 2025', sourceUrl: 'https://www.chainalysis.com/reports/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 24, type: 'state', label: 'Survived dip, enters YES path', x: 1540, y: 30, prob: 100, desc: 'The few who held through gain conviction. Joins the survivors', source: 'Glassnode On-Chain Data 2025', sourceUrl: 'https://glassnode.com/', sacredRoots: ['SR-010', 'SR-012'] },
      // YES path: Survived crash (IDs 30-37)
      { id: 30, type: 'state', label: '280 survived the crash (40%)', x: 1100, y: 200, prob: 100, desc: '~40% hold through the first major crash. Conviction separates survivors from tourists', source: 'Glassnode On-Chain Data 2025', sourceUrl: 'https://glassnode.com/', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 31, type: 'decision', label: 'Start trading altcoins?', x: 1320, y: 200, prob: 60, desc: 'Altcoin greed: 10-100x gains advertised. $2.2B stolen via hacks in 2024', source: 'Immunefi Crypto Losses 2024 | Crypto Twitter Analysis', sourceUrl: 'https://www.coindesk.com/business/2024/05/30/crypto-hacks-rug-pulls-led-to-473m-worth-of-losses-in-2024-immunefi', sacredRoots: ['SR-013', 'SR-017'] },
      { id: 32, type: 'action', label: 'Buy altcoins / chase memecoins', x: 1540, y: 120, prob: 100, desc: '95% of altcoins lose value vs BTC over 4 years. Memecoin rug pulls exploded in 2025', source: 'Messari Research 2025 | Halborn DeFi Hacks Report 2025', sourceUrl: 'https://messari.io/research', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 33, type: 'gate', label: 'Navigate altcoin casino', x: 1760, y: 120, prob: 10, desc: '$106M lost to rug pulls in 2024 (58 incidents). 339 DeFi security incidents in 2024 = $1.03B lost', source: 'CoinLedger Crypto Crime Report 2025 | SlowMist Annual Report 2024', sourceUrl: 'https://coinledger.io/research/crypto-crime-report', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 34, type: 'outcome-bad', label: 'Lost money on shitcoins / rugs', x: 1760, y: 350, prob: 100, desc: '$12B lost to crypto scams in 2024. North Korea Lazarus Group stole $1.5B from Bybit in 2025', source: 'CoinLedger 2025 | Deepstrike Crypto Crime Report 2025', sourceUrl: 'https://deepstrike.io/blog/crypto-crime-report-2025', sacredRoots: ['SR-023', 'SR-031'] },
      { id: 35, type: 'state', label: 'Got partial altcoin gains but high stress', x: 1760, y: -30, prob: 100, desc: 'Made some gains but lost sleep, relationships, and mental health. Net unclear', source: 'CoinGecko Survey 2024 (estimated by Foresight from public data)', sacredRoots: ['SR-011', 'SR-010'] },
      { id: 36, type: 'action', label: 'Stay BTC-only, DCA strategy', x: 1540, y: 280, prob: 100, desc: 'Optimal crypto allocation: 71.4% BTC + 28.6% ETH for best risk-adjusted returns', source: 'VanEck Optimal Crypto Allocation 2025 | 21Shares Research Q1 2025', sourceUrl: 'https://www.vaneck.com/us/en/blogs/digital-assets/matthew-sigel-optimal-crypto-allocation-for-portfolios/', sacredRoots: ['SR-035', 'SR-011'] },
      { id: 37, type: 'trajectory', label: 'Disciplined long-term holder path', x: 1760, y: 280, prob: 100, desc: 'DCA through 2022 bear market yielded +192% returns. Recommended portfolio allocation: 3-6% crypto', source: 'Grayscale Research 2025 | Morgan Stanley Crypto Allocation 2025', sourceUrl: 'https://research.grayscale.com/reports/the-role-of-crypto-in-a-portfolio', sacredRoots: ['SR-010', 'SR-035'] },
      // Convergence: Full cycle evaluation (IDs 40-45)
      { id: 40, type: 'decision', label: 'Net positive after full 4-year cycle?', x: 1980, y: 200, prob: 20, desc: 'Only 10-20% of crypto traders profitable long-term. 1.6% of day traders profitable in any given year', source: 'Academic Studies 2024 | Coinmarketman Retail Stats 2025', sourceUrl: 'https://coinmarketman.com/blog/retail-trading-crypto-data/', sacredRoots: ['SR-035', 'SR-011'] },
      { id: 41, type: 'state', label: 'Learned portfolio management', x: 2200, y: 120, prob: 100, desc: 'Conservative allocation: 60% BTC, 30% ETH, 10% mid-caps. 5% of total portfolio in crypto max', source: 'VanEck 2025 | Grayscale Research 2025', sourceUrl: 'https://www.vaneck.com/us/en/blogs/digital-assets/matthew-sigel-optimal-crypto-allocation-for-portfolios/', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 42, type: 'bottleneck', label: 'Hold through second cycle?', x: 2420, y: 120, prob: 60, desc: 'HODLers who held 4+ years: 95% profitable. Second cycle holders have conviction, not just hope', source: 'Glassnode On-Chain Data 2025', sourceUrl: 'https://glassnode.com/', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 43, type: 'outcome-good', label: 'Built real crypto wealth (2-4% of original 1000)', x: 2640, y: 60, prob: 100, desc: 'HODLers through 2 full cycles = life-changing returns. BTC 10x in 5 years. DCA investors +500% to +2,056%', source: 'Glassnode 2025 | Fidelity Cycles Research 2025 | ARK Invest Bitcoin Cycles 2025', sourceUrl: 'https://www.ark-invest.com/articles/analyst-research/bitcoin-cycles-entering-2025', sacredRoots: ['SR-010', 'SR-011'] },
      { id: 44, type: 'outcome-bad', label: 'Sold too early, underperformed BTC', x: 2640, y: 180, prob: 100, desc: 'Avg retail crypto investor underperforms BTC buy-and-hold by 40%. Active trading destroys returns', source: 'MIT Digital Currency Initiative Study | BIS Bulletin 2024', sourceUrl: 'https://dci.mit.edu/', sacredRoots: ['SR-011', 'SR-013'] },
      { id: 45, type: 'outcome-bad', label: 'Broke + emotional damage', x: 2200, y: 320, prob: 100, desc: '80% of retail traders lose money. Avg loss worsened by leverage, altcoins, and scams', source: 'BIS Bulletin No. 69 2024 | Bitget Research 2025', sourceUrl: 'https://www.bis.org/publ/bisbull69.pdf', sacredRoots: ['SR-011', 'SR-013'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 10, label: 'no (60%)' },
      { from: 5, to: 20, label: 'partial (20%)' },
      { from: 5, to: 30, label: 'yes (20%)' },
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 10, to: 13 }, { from: 13, to: 14 },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail (75%)' }, { from: 22, to: 24, label: 'pass (25%)' },
      { from: 24, to: 30 },
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'yes' }, { from: 31, to: 36, label: 'no' },
      { from: 32, to: 33 },
      { from: 33, to: 34, label: 'no (70%)' }, { from: 33, to: 35, label: 'partial (20%)' }, { from: 33, to: 40, label: 'yes (10%)' },
      { from: 35, to: 40 },
      { from: 36, to: 37 }, { from: 37, to: 40 },
      { from: 40, to: 41, label: 'yes (20%)' }, { from: 40, to: 45, label: 'no (80%)' },
      { from: 41, to: 42 },
      { from: 42, to: 43, label: 'pass' }, { from: 42, to: 44, label: 'fail' },
    ]
  },

  // ============================================================
  // AI AGENCY — Summary (Min) + Full Model
  // ============================================================

  ai_agencyMin: {
    title: 'AI Agency Startup (Summary)',
    input: 'Someone decides to start an AI automation agency',
    nodes: [
      { id: 1, type: 'desire', label: '1000 people want to start an AI agency', x: 0, y: 150, prob: 100, desc: 'AI agency searches up 4,200% since 2023. Market at $7.63B in 2025, projected $50B by 2030', source: 'Google Trends 2025 | Grand View Research AI Agents Market 2025', sourceUrl: 'https://www.grandviewresearch.com/industry-analysis/ai-agents-market-report', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'bottleneck', label: 'Learn AI tools? (40% pass)', x: 250, y: 150, prob: 40, desc: '60% drop out during technical learning phase (Make, n8n, GPT APIs). Takes 2-6 months', source: 'AI Agency Accelerator Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://thunderbit.com/blog/ai-startup-stats', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 3, type: 'outcome-bad', label: '600 overwhelmed, quit', x: 250, y: 350, prob: 100, desc: '63% of AI startups fail within 3 years vs 50% for traditional tech startups', source: 'Thunderbit AI Startup Stats 2025 | CB Insights State of AI 2025', sourceUrl: 'https://thunderbit.com/blog/ai-startup-stats', sacredRoots: ['SR-036', 'SR-010'] },
      { id: 4, type: 'bottleneck', label: 'Land first paying client? (10%)', x: 500, y: 150, prob: 10, desc: 'Cold email response rate: 4% in 2025 (down from 8.5% in 2019). Meeting booking rate: 0.8%', source: 'Hunter.io State of Email Outreach 2026 | Belkins Cold Email Study 2025', sourceUrl: 'https://hunter.io/the-state-of-cold-email', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Scale to $10K/month? (<5%)', x: 750, y: 150, prob: 5, desc: 'Only 12-15% of AI startups achieve profitability. Avg retainer: $2K-$20K/mo', source: 'Thunderbit AI Startup Stats 2025 | Digital Agency Network Pricing Guide 2025', sourceUrl: 'https://digitalagencynetwork.com/ai-agency-pricing/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-good', label: '5-15 run profitable agency', x: 1000, y: 100, prob: 100, desc: 'Top performers: $20K-$100K/mo. AI agency market growing 45.8% CAGR to $50B by 2030', source: 'CB Insights AI Agent Revenue Rankings 2025 | Grand View Research 2025', sourceUrl: 'https://www.cbinsights.com/research/ai-agent-startups-top-20-revenue/', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 7, type: 'outcome-bad', label: '985 back to job hunt', x: 1000, y: 250, prob: 100, desc: 'Market saturating: 10x more agencies than 2023. Generic ChatGPT wrappers commoditized', source: 'Market Clarity AI Startup Report 2025 | Oreate AI Agency Landscape 2025', sourceUrl: 'https://mktclarity.com/blogs/news/ai-startup-market', sacredRoots: ['SR-007', 'SR-027'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (60%)' }, { from: 2, to: 4, label: 'pass (40%)' },
      { from: 4, to: 3, label: 'fail (90%)' }, { from: 4, to: 5, label: 'pass (10%)' },
      { from: 5, to: 6, label: 'pass (5%)' }, { from: 5, to: 7, label: 'fail (95%)' },
    ]
  },

  ai_agencyMid: {
    title: 'AI Agency Startup (Analysis)',
    input: 'Someone decides to start an AI automation agency',
    nodes: [
      { id: 1, type: 'desire', label: 'See AI agency hype, want in', x: 0, y: 120, prob: 100, desc: 'AI agency searches up 4,200% since 2023', source: 'Google Trends 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://trends.google.com/', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'action', label: 'Join free community / Discord', x: 240, y: 120, prob: 60, desc: '50K+ people in top AI agency communities', source: 'Skool/Discord data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 3, type: 'action', label: 'Buy accelerator ($2K-$10K)', x: 480, y: 120, prob: 25, desc: 'Avg AI agency accelerator: $3K-$8K', source: 'Market research (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-036'] },
      { id: 4, type: 'bottleneck', label: 'Learn AI tools (Make, n8n, GPT)', x: 720, y: 120, prob: 40, desc: 'Technical learning curve: 2-6 months', source: 'Community surveys (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 5, type: 'outcome-bad', label: 'Overwhelmed, quit learning', x: 720, y: 300, prob: 100, desc: '60% drop out during technical phase', source: 'Accelerator data (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-036', 'SR-010'] },
      { id: 6, type: 'gate', label: 'Land first paying client', x: 960, y: 120, prob: 10, desc: 'Cold outreach: 1-3% response rate', source: 'Agency benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'No clients after months', x: 960, y: 300, prob: 100, desc: 'Avg time to first client: 3-6 months', source: 'Community polls (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 11, type: 'state', label: 'Got one small $500 project, no repeat', x: 960, y: 270, prob: 100, desc: 'One cheap project, client ghosted after', source: 'Agency benchmarks (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Gets a real retainer?', x: 1200, y: 270, prob: 20, desc: 'One-off projects rarely lead to agency growth', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-032'] },
      { id: 13, type: 'outcome-bad', label: 'Stuck doing $500 gigs', x: 1200, y: 420, prob: 100, desc: 'Freelancer disguised as agency — no leverage, no scale', source: 'Community polls (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 8, type: 'decision', label: 'Scale to $10K+/month?', x: 1200, y: 120, prob: 5, desc: '<5% of AI agency starters reach $10K MRR', source: 'Income reports (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: 'Running profitable agency', x: 1440, y: 60, prob: 100, desc: 'Top performers: $20K-$100K/mo, but rare', source: 'Case studies (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 10, type: 'outcome-bad', label: 'Back to job hunt', x: 1440, y: 220, prob: 100, desc: 'Market saturating: 10x more agencies than 2023', source: 'Market analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-007', 'SR-027'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'no' }, { from: 6, to: 11, label: 'partial' }, { from: 6, to: 8, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 8, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },
  ai_agency: {
    title: 'AI Agency Startup',
    input: 'Someone decides to start an AI automation agency',
    nodes: [
      { id: 1, type: 'state', label: '1000 people see AI agency hype', x: 0, y: 200, prob: 100, desc: 'AI agency searches up 4,200% since 2023. Market at $7.63B in 2025, projected $50.31B by 2030 at 45.8% CAGR', source: 'Google Trends 2025 | Grand View Research AI Agents Market 2025', sourceUrl: 'https://www.grandviewresearch.com/industry-analysis/ai-agents-market-report', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 2, type: 'desire', label: 'Want financial freedom via AI skills', x: 220, y: 200, prob: 100, desc: '"Build an AI agency, make $10K/mo in 90 days" -- the pitch that hooks thousands', source: 'Skool / YouTube AI Agency Content Analysis 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-007', 'SR-013'] },
      { id: 3, type: 'action', label: 'Join free community / Discord', x: 440, y: 200, prob: 60, desc: '50K+ people in top AI agency communities. 40% never engage beyond joining', source: 'Skool / Discord Community Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.skool.com/', sacredRoots: ['SR-025', 'SR-036'] },
      { id: 4, type: 'action', label: 'Buy accelerator course ($2K-$10K)', x: 660, y: 200, prob: 25, desc: 'Avg AI agency accelerator: $3K-$8K. Only 25% of community members invest in paid training', source: 'Market Research 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-031', 'SR-036'] },
      { id: 5, type: 'bottleneck', label: 'Learn AI tools (Make, n8n, GPT APIs)?', x: 880, y: 200, prob: 40, desc: 'Technical learning curve: 2-6 months. 60% drop out during this phase', source: 'AI Agency Accelerator Completion Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://thunderbit.com/blog/ai-startup-stats', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 10, type: 'state', label: 'Overwhelmed by technical complexity', x: 880, y: 430, prob: 100, desc: '63% of AI startups fail within 3 years. Tools change monthly, tutorials outdated fast', source: 'Thunderbit AI Startup Stats 2025 | CB Insights State of AI 2025', sourceUrl: 'https://thunderbit.com/blog/ai-startup-stats', sacredRoots: ['SR-036', 'SR-010'] },
      { id: 11, type: 'action', label: 'Tutorial hell: learning but never building', x: 1100, y: 430, prob: 100, desc: 'Consuming courses without shipping. The comfortable trap of "preparing"', source: 'Pattern Analysis (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 12, type: 'outcome-bad', label: 'Quit: back to day job, $3K-$10K poorer', x: 1320, y: 430, prob: 100, desc: 'Lost months of time + course investment. No portfolio, no clients, no skills to show', source: 'AI Agency Community Surveys 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 15, type: 'state', label: '400 have basic AI skills', x: 1100, y: 200, prob: 100, desc: '40% of original 1000 can build basic automations. Now the real test: selling', source: 'AI Agency Accelerator Data 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 16, type: 'action', label: 'Cold outreach to potential clients', x: 1320, y: 200, prob: 100, desc: 'Cold email response rate dropped to 4% in 2025 (from 8.5% in 2019). Meeting booking rate: 0.8%', source: 'Hunter.io State of Email Outreach 2026 | Belkins Cold Email Study 2025', sourceUrl: 'https://hunter.io/the-state-of-cold-email', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 17, type: 'gate', label: 'Land first paying client?', x: 1540, y: 200, prob: 10, desc: 'Avg time to first client: 3-6 months. Multichannel (3+ channels) delivers 287% more responses', source: 'Cold Outreach Benchmarks 2025 | Agency Benchmarks (estimated by Foresight from public data)', sourceUrl: 'https://outreaches.ai/blog/cold-outreach-benchmarks', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 20, type: 'state', label: 'Months of outreach, zero clients', x: 1540, y: 450, prob: 100, desc: 'Sent 500+ emails, 20 responses, 0 closes. Confidence destroyed', source: 'Cold Email Benchmarks 2025 (estimated by Foresight from public data)', sourceUrl: 'https://hunter.io/the-state-of-cold-email', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 21, type: 'action', label: 'Lower prices to $200-500 per project', x: 1760, y: 450, prob: 100, desc: 'Desperation pricing. Working for almost free to get "a case study"', source: 'AI Agency Community Data 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-023', 'SR-031'] },
      { id: 22, type: 'outcome-bad', label: 'Burned out, agency never launched', x: 1980, y: 450, prob: 100, desc: 'Most "AI agencies" never get past the first client. Market saturated with 10x more agencies than 2023', source: 'Market Clarity AI Startup Report 2025', sourceUrl: 'https://mktclarity.com/blogs/news/ai-startup-market', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 25, type: 'state', label: 'Got one $500 project, client ghosted', x: 1540, y: -20, prob: 100, desc: 'One cheap project done. No repeat, no referral, no case study worth sharing', source: 'Agency Community Surveys 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 26, type: 'trajectory', label: 'Freelancer disguised as agency', x: 1760, y: -20, prob: 100, desc: 'Doing gig work, not agency work. No leverage, no recurring revenue, no scale', source: 'Pattern Analysis (estimated by Foresight from public data)', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 27, type: 'bottleneck', label: 'Gets a real retainer client?', x: 1980, y: -20, prob: 20, desc: 'One-off projects rarely lead to growth. Need monthly retainer ($2K-$8K/mo) to be viable', source: 'Digital Agency Network AI Pricing Guide 2025', sourceUrl: 'https://digitalagencynetwork.com/ai-agency-pricing/', sacredRoots: ['SR-010', 'SR-032'] },
      { id: 28, type: 'outcome-bad', label: 'Stuck doing $500 gigs forever', x: 2200, y: -80, prob: 100, desc: 'No leverage, no scale. Earning less than a junior developer salary', source: 'AI Agency Community Data 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 30, type: 'state', label: '40 land first real client (4%)', x: 1760, y: 200, prob: 100, desc: 'First paying engagement proves the model. Avg first project: $2,500-$15,000', source: 'Digital Agency Network AI Pricing Guide 2025 | Latenode Agency Comparison 2025', sourceUrl: 'https://latenode.com/blog/industry-use-cases-solutions/enterprise-automation/17-top-ai-automation-agencies-in-2025-complete-service-comparison-pricing-guide', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 31, type: 'action', label: 'Deliver, collect testimonial, build case study', x: 1980, y: 200, prob: 100, desc: 'First project sets the trajectory. Quality delivery = referrals. Bad delivery = dead end', source: 'Agency Growth Data 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 32, type: 'action', label: 'Specialize in one vertical (healthcare, legal, ecom)', x: 2200, y: 140, prob: 100, desc: 'Specialized agencies earn 22% more per hour. Generic ChatGPT wrappers are commoditized', source: 'Upwork Skills Index 2025 | Oreate AI Agency Landscape 2025', sourceUrl: 'https://www.oreateai.com/blog/beyond-the-hype-navigating-the-ai-automation-agency-landscape-in-2025/aec7f6469ce4c7fef56b2bc072e26d5c', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 33, type: 'action', label: 'Build recurring retainer pipeline', x: 2200, y: 260, prob: 100, desc: 'Retainers $2K-$20K/mo. First hire at $15K-$25K/mo revenue. Performance-based: 10-25% of value created', source: 'Digital Agency Network Pricing 2025 | Articsledge AI Agency Model', sourceUrl: 'https://www.articsledge.com/post/ai-agency-business-model', sacredRoots: ['SR-031', 'SR-032'] },
      { id: 34, type: 'bottleneck', label: 'Reach $10K MRR?', x: 2420, y: 200, prob: 15, desc: '<5% of AI agency starters reach $10K MRR. Only 12-15% of AI startups achieve profitability', source: 'Thunderbit AI Startup Stats 2025 | Income Reports (estimated by Foresight from public data)', sourceUrl: 'https://thunderbit.com/blog/ai-startup-stats', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 40, type: 'outcome-good', label: 'Running profitable AI agency ($10K-$100K/mo)', x: 2640, y: 130, prob: 100, desc: 'Top AI agencies: $20K-$100K/mo. Revenue growth 150-200% YoY in early stages. Market growing 45.8% CAGR', source: 'CB Insights AI Agent Revenue Rankings 2025 | Grand View Research 2025', sourceUrl: 'https://www.cbinsights.com/research/ai-agent-startups-top-20-revenue/', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 41, type: 'outcome-bad', label: 'Earning $3-5K/mo, not scalable', x: 2640, y: 280, prob: 100, desc: 'Solo operator trapped. CAC $5K-$50K per B2B client. No leverage, high churn', source: 'Thunderbit AI Startup Stats 2025 | Second Talent AI Funding Stats 2025', sourceUrl: 'https://www.secondtalent.com/resources/ai-startup-funding-investment/', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 42, type: 'state', label: 'Retainer client secured, enters growth path', x: 2200, y: 30, prob: 100, desc: 'Monthly recurring revenue unlocked. Joins the scaling track', source: 'Agency Growth Data 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-032', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 10, label: 'fail (60%)' }, { from: 5, to: 15, label: 'pass (40%)' },
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 15, to: 16 }, { from: 16, to: 17 },
      { from: 17, to: 20, label: 'no (70%)' },
      { from: 17, to: 25, label: 'partial (20%)' },
      { from: 17, to: 30, label: 'yes (10%)' },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 25, to: 26 }, { from: 26, to: 27 },
      { from: 27, to: 28, label: 'fail (80%)' }, { from: 27, to: 42, label: 'pass (20%)' },
      { from: 42, to: 30 },
      { from: 30, to: 31 },
      { from: 31, to: 32 }, { from: 31, to: 33 },
      { from: 32, to: 34 }, { from: 33, to: 34 },
      { from: 34, to: 40, label: 'pass (15%)' }, { from: 34, to: 41, label: 'fail (85%)' },
    ]
  },

  // ============================================================
  // UPWORK FREELANCE — Summary (Min) + Full Model
  // ============================================================

  upwork_freelanceMin: {
    title: 'Freelancing on Upwork (Summary)',
    input: 'Someone decides to freelance on Upwork or Fiverr',
    nodes: [
      { id: 1, type: 'desire', label: '1000 want freedom via freelancing', x: 0, y: 150, prob: 100, desc: '64M Americans freelanced in 2024. Upwork has 18M+ registered freelancers from 180+ countries', source: 'Upwork Freelance Forward 2025 | DemandSage Upwork Statistics 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'bottleneck', label: 'Get first interview? (10%)', x: 250, y: 150, prob: 10, desc: 'New profiles: 1-3% proposal acceptance rate. 30-50 proposals before first response. 35% never complete profile', source: 'Upwork Community Data 2025 | Vollna Projects Analysis 2024', sourceUrl: 'https://www.vollna.com/reports/upwork-projects-overview-2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: '900 quit within year 1', x: 250, y: 350, prob: 100, desc: '60-70% quit within year 1. Platform hire rate: 38% of closed projects filled (2024)', source: 'Upwork Retention Data 2025 | Vollna Projects Analysis 2024', sourceUrl: 'https://www.vollna.com/reports/upwork-projects-overview-2024', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Get first hire? (2.5%)', x: 500, y: 150, prob: 25, desc: 'Only 2.5% of signups land first job. Interview-to-hire conversion brutal for new freelancers', source: 'Upwork Marketplace Stats 2025 (estimated by Foresight from public data)', sourceUrl: 'https://electroiq.com/stats/upwork-statistics/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Reach $10K/year by year 2? (0.3%)', x: 750, y: 150, prob: 15, desc: 'Top Rated badge = top 10% of freelancers. Specialists earn 22% more hourly. JSS 90%+ required', source: 'Upwork Top Rated Requirements 2025 | GiGradar Benchmarks 2025', sourceUrl: 'https://gigradar.io/blog/how-to-become-top-rated-on-upwork', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-good', label: '3 of 1000 make $10K+/year', x: 1000, y: 100, prob: 100, desc: 'Top freelancers: $100-300/hr with client waitlists. Avg Upwork freelancer earns $39/hr', source: 'Upwork Hourly Rates Data 2025 | Upwork Top Rated Profiles', sourceUrl: 'https://www.upwork.com/resources/upwork-hourly-rates', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 7, type: 'outcome-bad', label: 'Rest earn $2-5K/year', x: 1000, y: 250, prob: 100, desc: 'Active but not enough to live on. Global competition pushes rates to $5-15/hr for generalists', source: 'Payoneer Global Freelancer Survey 2025 | ILO Global Wage Report 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-013', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (90%)' }, { from: 2, to: 4, label: 'pass (10%)' },
      { from: 4, to: 3, label: 'fail (75%)' }, { from: 4, to: 5, label: 'pass (25%)' },
      { from: 5, to: 6, label: 'pass (15%)' }, { from: 5, to: 7, label: 'fail (85%)' },
    ]
  },

  upwork_freelanceMid: {
    title: 'Freelancing on Upwork (Analysis)',
    input: 'Someone decides to freelance on Upwork or Fiverr',
    nodes: [
      { id: 1, type: 'desire', label: 'Want freedom & income from freelancing', x: 0, y: 120, prob: 100, desc: '64M Americans freelanced in 2024', source: 'Upwork Freelance Forward 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'action', label: 'Learn skill, create profile, send proposals', x: 300, y: 120, prob: 100, desc: '35% drop off before completing profile. Avg 30-50 proposals before first response', source: 'Upwork Platform Data 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 3, type: 'gate', label: 'Get first interview response', x: 600, y: 120, prob: 10, desc: 'New profiles: 1-3% proposal acceptance rate', source: 'Upwork Freelancer Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'No response, quit', x: 600, y: 350, prob: 100, desc: '60-70% quit within year 1', source: 'Upwork Retention Data 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 10, type: 'state', label: 'Has interviews but no hires', x: 600, y: 270, prob: 100, desc: 'Clients respond, ask questions, then go silent', source: 'Upwork Freelancer Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 11, type: 'bottleneck', label: 'Converts to hire?', x: 900, y: 270, prob: 20, desc: 'Interview-to-hire conversion for new freelancers is brutal', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-010', 'SR-016'] },
      { id: 12, type: 'outcome-bad', label: 'Stuck at interview stage', x: 900, y: 420, prob: 100, desc: 'Proposals read but never hired', source: 'Upwork Community Forums (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 5, type: 'state', label: '25 get first hire (2.5% of signups)', x: 900, y: 120, prob: 100, desc: 'First hire is the critical proof point', source: 'Upwork Marketplace Stats 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 6, type: 'bottleneck', label: 'Get reviews + repeat clients', x: 1140, y: 120, prob: 30, desc: 'Top rated = 10x more invites. Specialists convert 10-20% vs generalists 2-5%', source: 'Upwork Algorithm Study 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-032', 'SR-036'] },
      { id: 7, type: 'outcome-bad', label: 'Race to bottom on price', x: 1140, y: 350, prob: 100, desc: 'Global competition pushes rates to $5-15/hr', source: 'ILO Global Wage Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 8, type: 'state', label: '8 remain active after year 1 (0.8%)', x: 1380, y: 120, prob: 100, desc: '60% client repeat hire rate for survivors', source: 'Upwork Annual Report 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 9, type: 'decision', label: 'Reach $10K/year by year 2?', x: 1620, y: 120, prob: 15, desc: 'Top 10% earn $50K+/year', source: 'Upwork Earnings Data 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 13, type: 'outcome-good', label: '3 of 1000 reach $10K/year', x: 1860, y: 60, prob: 100, desc: 'Top freelancers: $100-300/hr, client waitlists', source: 'Upwork Top Rated Profiles 2025 (estimated by Foresight from public data — not an official source)', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 14, type: 'outcome-bad', label: 'Median income $2-5K/year', x: 1860, y: 250, prob: 100, desc: 'Active but not enough to live on', source: 'Payoneer Global Freelancer Survey 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-013', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'no' }, { from: 3, to: 10, label: 'partial' }, { from: 3, to: 5, label: 'yes' },
      { from: 10, to: 11 }, { from: 11, to: 5, label: 'pass' }, { from: 11, to: 12, label: 'fail' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9 }, { from: 9, to: 13, label: 'yes' }, { from: 9, to: 14, label: 'no' },
    ]
  },
  upwork_freelance: {
    title: 'Freelancing on Upwork',
    input: 'Someone decides to freelance on Upwork or Fiverr',
    nodes: [
      { id: 1, type: 'state', label: '1000 people want freelance income', x: 0, y: 200, prob: 100, desc: '64M Americans freelanced in 2024. Upwork has 18M+ registered freelancers from 180+ countries, 832K active clients', source: 'Upwork Freelance Forward 2025 | DemandSage Upwork Statistics 2025', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'desire', label: 'Want freedom, remote work, be my own boss', x: 220, y: 200, prob: 100, desc: 'Top motivations: flexibility (73%), income diversification (45%), escape 9-5 (38%)', source: 'Upwork Freelance Forward 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 3, type: 'action', label: 'Learn marketable skill (2-6 months)', x: 440, y: 200, prob: 40, desc: 'Top 2025 skills: generative AI, data visualization, UX design. AI skills command 22% premium', source: 'Upwork In-Demand Skills Report 2025 | Vollna Trends Analysis 2025', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-unveils-2025s-most-demand-skills', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 4, type: 'state', label: '650 complete profile', x: 660, y: 200, prob: 65, desc: '35% drop off before completing profile. Profile quality directly impacts visibility in search', source: 'Upwork Platform Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://electroiq.com/stats/upwork-statistics/', sacredRoots: ['SR-012', 'SR-018'] },
      { id: 5, type: 'action', label: '245 send first proposals', x: 880, y: 200, prob: 100, desc: 'Avg 30-50 proposals before first response. Each proposal costs connects (paid currency)', source: 'Upwork Community Data 2025 | Vollna Projects Analysis 2024', sourceUrl: 'https://www.vollna.com/reports/upwork-projects-overview-2024', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 6, type: 'gate', label: 'Get first interview response?', x: 1100, y: 200, prob: 10, desc: 'New profiles: 1-3% acceptance rate. Platform-wide hire rate: 38% of closed projects (2024). Entry-level: 42%', source: 'Vollna Upwork Projects Analysis 2024 | Upwork Freelancer Report 2025', sourceUrl: 'https://www.vollna.com/reports/upwork-projects-overview-2024', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 10, type: 'state', label: 'Zero responses after 50+ proposals', x: 1100, y: 450, prob: 100, desc: '70-85% of new freelancers never get a response. Generic proposals ignored by clients', source: 'Upwork Community Forums 2025 (estimated by Foresight from public data)', sourceUrl: 'https://community.upwork.com/t5/Freelancers/ct-p/Freelancers', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 11, type: 'trajectory', label: 'High-friction generalist path', x: 1320, y: 390, prob: 100, desc: 'No niche, no portfolio, no reviews. Competing with 18M others on price alone', source: 'Upwork Marketplace Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://electroiq.com/stats/upwork-statistics/', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 12, type: 'action', label: 'Keep sending generic proposals', x: 1540, y: 390, prob: 100, desc: 'Same approach, same result. Definition of insanity', source: 'Upwork Community 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 13, type: 'outcome-bad', label: 'Burn connects, quit frustrated', x: 1760, y: 390, prob: 100, desc: '60-70% quit within year 1. Connects exhausted, confidence shattered', source: 'Upwork Retention Data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://techrt.com/upwork-statistics/', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 14, type: 'outcome-bad', label: 'Race to bottom: $5-15/hr gigs', x: 1540, y: 510, prob: 100, desc: 'Global competition pushes generalist rates to $5-15/hr. Unsustainable income', source: 'ILO Global Wage Report 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.ilo.org/global/research/lang--en/index.htm', sacredRoots: ['SR-013', 'SR-027'] },
      { id: 20, type: 'state', label: 'Getting interviews but no hires', x: 1100, y: -20, prob: 100, desc: '10-20% of proposers reach interview stage. Clients respond then ghost', source: 'Upwork Freelancer Report 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 21, type: 'trajectory', label: 'Close but no conversion', x: 1320, y: -20, prob: 100, desc: 'Pricing wrong, portfolio weak, or niche unclear. Interview skills need work', source: 'Upwork Community 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 22, type: 'action', label: 'Improve niche positioning + speed', x: 1540, y: -100, prob: 100, desc: 'Specialized roles fill 60% faster and deliver 30-50% higher ROI than generalists', source: 'Upwork In-Demand Skills Report 2025', sourceUrl: 'https://investors.upwork.com/news-releases/news-release-details/upwork-unveils-2025s-most-demand-skills', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 23, type: 'bottleneck', label: 'Convert interview to hire?', x: 1760, y: -100, prob: 35, desc: 'Generic profile: ~20% conversion. Niche + portfolio + fast response: ~50%', source: 'GiGradar Win Rate Benchmarks 2025', sourceUrl: 'https://gigradar.io/blog/benchmark-overview-reply-shortlist-win-rates-by-category-budget', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 24, type: 'outcome-bad', label: 'Stuck at interview stage forever', x: 1980, y: -160, prob: 100, desc: 'Always shortlisted, never hired. The most frustrating position', source: 'Upwork Community Forums 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 25, type: 'state', label: 'Converted interview, joins hire path', x: 1980, y: -40, prob: 100, desc: 'Broke through from partial path. Now has first hire', source: 'Upwork 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 30, type: 'state', label: '25 get first hire (2.5% of signups)', x: 1320, y: 200, prob: 100, desc: 'Only 2.5% of original 1000 land first paid job. Critical proof point', source: 'Upwork Marketplace Stats 2025 (estimated by Foresight from public data)', sourceUrl: 'https://electroiq.com/stats/upwork-statistics/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 31, type: 'action', label: 'Deliver excellent work, get 5-star review', x: 1540, y: 200, prob: 100, desc: 'First review = everything. JSS 90%+ = Top Rated badge = top 10% visibility', source: 'Upwork Job Success Score Guide 2025', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/211068358-Job-Success-Score', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 32, type: 'trajectory', label: 'Validated freelancer path', x: 1760, y: 200, prob: 100, desc: 'First hire proves the model. Now compound: reviews, badges, invites', source: 'Upwork Algorithm Study 2025 (estimated by Foresight from public data)', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 33, type: 'action', label: 'Specialize in high-demand niche', x: 1980, y: 130, prob: 100, desc: 'AI, data viz, UX design. Specialists: 10-20% conversion vs generalists 2-5%. Earn 22% more hourly', source: 'Upwork In-Demand Skills 2025 | Upwork Hourly Rates 2025', sourceUrl: 'https://www.upwork.com/resources/upwork-hourly-rates', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 34, type: 'action', label: 'Stay generalist, compete on volume', x: 1980, y: 280, prob: 100, desc: 'Generalist writing, translation, admin roles fading. Avg $39/hr but wide spread ($13-$324/hr)', source: 'Upwork Hourly Rates 2025 | Vollna Trends 2025', sourceUrl: 'https://www.upwork.com/resources/upwork-hourly-rates', sacredRoots: ['SR-023', 'SR-010'] },
      { id: 35, type: 'outcome-bad', label: 'Generalist trap: low rates, high churn', x: 2200, y: 340, prob: 100, desc: 'Translation highest hire rate (54%) but lowest pay. Sales/marketing lowest hire rate (<30%)', source: 'Vollna Upwork Projects Analysis 2024', sourceUrl: 'https://www.vollna.com/reports/upwork-projects-overview-2024', sacredRoots: ['SR-023', 'SR-031'] },
      { id: 36, type: 'action', label: 'Build repeat client relationships', x: 2200, y: 130, prob: 100, desc: '60% repeat hire rate for top freelancers. Higher-value jobs weigh more in JSS', source: 'Upwork JSS Insights 2025', sourceUrl: 'https://support.upwork.com/hc/en-us/articles/35230612015123-Job-Success-Score-insights', sacredRoots: ['SR-026', 'SR-032'] },
      { id: 37, type: 'state', label: 'Top Rated badge earned', x: 2420, y: 130, prob: 100, desc: 'Top 10% of freelancers. Benefits: curated job digests, faster payments, consultation offers, prominent badge', source: 'Upwork Top Rated Requirements 2025', sourceUrl: 'https://gigradar.io/blog/how-to-become-top-rated-on-upwork', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 38, type: 'state', label: '8 remain active after year 1 (0.8%)', x: 2200, y: 200, prob: 100, desc: 'Fewer projects posted in 2025, competition up. Standing out matters more than ever', source: 'Vollna Upwork Projects Trends 2025 | Upwork Annual Report 2025', sourceUrl: 'https://www.vollna.com/reports/upwork-projects-trends-2025', sacredRoots: ['SR-012', 'SR-010'] },
      { id: 40, type: 'bottleneck', label: 'Reach $10K/year by year 2?', x: 2420, y: 200, prob: 15, desc: 'Top 10% earn $50K+/year. Requires: JSS 90%+, specialization, repeat clients, Top Rated badge', source: 'Upwork Earnings Data 2025 | Payoneer Freelancer Survey 2025', sourceUrl: 'https://affinco.com/upwork-statistics/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 41, type: 'outcome-good', label: '3 of 1000 earn $10K+/year', x: 2640, y: 130, prob: 100, desc: 'Top freelancers: $100-300/hr with client waitlists. Median full-time freelancer income: $85K', source: 'Upwork Hourly Rates 2025 | TechRT Upwork Statistics 2026', sourceUrl: 'https://techrt.com/upwork-statistics/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 42, type: 'outcome-bad', label: 'Active but earning $2-5K/year', x: 2640, y: 280, prob: 100, desc: 'Active on platform but not enough to live on. The typical freelancer outcome', source: 'Payoneer Global Freelancer Survey 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 50, type: 'outcome-good', label: 'Sustainable freelance career', x: 2640, y: 60, prob: 100, desc: 'Multiple paths converge: specialization + Top Rated + repeat clients + $10K+/year = real freelance business', source: 'Upwork Annual Report 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.upwork.com/research/future-workforce-index-2025', sacredRoots: ['SR-012', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
      { from: 6, to: 10, label: 'no (70-80%)' },
      { from: 6, to: 20, label: 'partial (10-20%)' },
      { from: 6, to: 30, label: 'yes (5-10%)' },
      { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 12, to: 13 },
      { from: 11, to: 14 },
      { from: 20, to: 21 }, { from: 21, to: 22 }, { from: 22, to: 23 },
      { from: 23, to: 24, label: 'fail (65%)' }, { from: 23, to: 25, label: 'pass (35%)' },
      { from: 25, to: 30 },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33 }, { from: 32, to: 34 },
      { from: 34, to: 35 },
      { from: 33, to: 36 }, { from: 36, to: 37 },
      { from: 33, to: 38 }, { from: 34, to: 38 },
      { from: 37, to: 40 }, { from: 38, to: 40 },
      { from: 40, to: 41, label: 'pass (15%)' }, { from: 40, to: 42, label: 'fail (85%)' },
      { from: 41, to: 50 }, { from: 37, to: 50 },
    ]
  },
  dropshipping: { title: 'Dropshipping Store', input: 'Someone starts a dropshipping business on Shopify', nodes: [
    { id: 1, type: 'desire', label: 'Want passive income via dropshipping', x: 0, y: 200, prob: 100, desc: 'Dropshipping market: $301B in 2024, projected $372B in 2025. 27% of online stores use dropshipping', source: 'Grand View Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.grandviewresearch.com/', sacredRoots: ['SR-013', 'SR-007'] },
    { id: 2, type: 'action', label: 'Watch guru courses, research niches', x: 200, y: 200, prob: 100, desc: 'Most beginners spend 2-4 weeks consuming content before acting', source: 'Oberlo data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.oberlo.com/statistics', sacredRoots: ['SR-013', 'SR-008'] },
    { id: 3, type: 'bottleneck', label: 'Actually start building store?', x: 400, y: 200, prob: 40, desc: '60% never get past the research phase', source: 'Shopify merchant data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-001', 'SR-008'] },
    { id: 4, type: 'outcome-bad', label: 'Never started, still watching courses', x: 400, y: 420, prob: 100, desc: 'Perpetual learner — buys courses, never launches', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-008', 'SR-007'] },
    { id: 5, type: 'action', label: 'Find winning product on AliExpress/CJ', x: 600, y: 200, prob: 100, desc: 'Avg store tests 10-20 products before a winner', source: 'AutoDS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-statistics/', sacredRoots: ['SR-035', 'SR-017'] },
    { id: 6, type: 'action', label: 'Build Shopify store ($39/mo)', x: 800, y: 200, prob: 70, desc: '80-90% of Shopify stores fail within first year', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 7, type: 'state', label: 'Store live but zero traffic', x: 1000, y: 200, prob: 100, desc: 'Cold start problem', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-010', 'SR-017'] },
    { id: 8, type: 'action', label: 'Launch Facebook/TikTok ads ($500-2000)', x: 1200, y: 200, prob: 100, desc: 'Avg CPC $0.60-$1.37, cost per purchase: $51.65', source: 'Meta Ads Benchmarks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.shopify.com/blog/facebook-ads-cost', sacredRoots: ['SR-031', 'SR-017'] },
    { id: 9, type: 'gate', label: 'First ad campaign ROAS > 2x?', x: 1450, y: 200, prob: 10, desc: '90% of first campaigns lose money', source: 'Meta Ads benchmarks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.triplewhale.com/blog/facebook-ads-benchmarks', sacredRoots: ['SR-035', 'SR-031'] },
    { id: 10, type: 'state', label: 'Burned $500-2000, few sales', x: 1450, y: 480, prob: 100, desc: 'ROAS 0.2-0.8x', source: 'Meta Ads data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.triplewhale.com/blog/facebook-ads-benchmarks', sacredRoots: ['SR-031', 'SR-017'] },
    { id: 11, type: 'trajectory', label: 'Desperation spending path', x: 1650, y: 480, prob: 100, desc: 'Burning money hoping for a hit', source: 'Meta Ads data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.shopify.com/blog/facebook-ads-cost', sacredRoots: ['SR-023', 'SR-031'] },
    { id: 12, type: 'decision', label: 'Try another product?', x: 1850, y: 480, prob: 30, desc: '30% iterate, rest quit', source: 'AutoDS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-statistics/', sacredRoots: ['SR-011', 'SR-001'] },
    { id: 13, type: 'outcome-bad', label: 'Quit, lost $1-5K', x: 2050, y: 560, prob: 100, desc: 'Median store lifespan: 4 months', source: 'Shopify churn data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-007', 'SR-031'] },
    { id: 14, type: 'action', label: 'Relaunch with new product', x: 2050, y: 400, prob: 100, desc: 'Second attempt, better creative', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-statistics/', sacredRoots: ['SR-011', 'SR-008'] },
    { id: 20, type: 'state', label: 'ROAS 1.5-2x but inconsistent', x: 1450, y: -20, prob: 100, desc: 'Some days profitable, most not', source: 'Meta Ads benchmarks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.triplewhale.com/blog/facebook-ads-benchmarks', sacredRoots: ['SR-035', 'SR-010'] },
    { id: 21, type: 'trajectory', label: 'Break-even grind', x: 1650, y: -20, prob: 100, desc: '$50-100/day, barely breaking even', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-profit-margin/', sacredRoots: ['SR-031', 'SR-012'] },
    { id: 22, type: 'bottleneck', label: 'Stabilizes ROAS above 2x?', x: 1850, y: -20, prob: 20, desc: '80% never stabilize', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-statistics/', sacredRoots: ['SR-035', 'SR-010'] },
    { id: 23, type: 'outcome-bad', label: 'Slow bleed, net negative', x: 2050, y: -100, prob: 100, desc: 'Cumulative loss: $3-10K', source: 'Meta Ads data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.shopify.com/blog/facebook-ads-cost', sacredRoots: ['SR-031', 'SR-007'] },
    { id: 30, type: 'state', label: 'Profitable ads, orders coming in', x: 1700, y: 200, prob: 100, desc: 'ROAS 2-4x, $200-1000/day revenue', source: 'Shopify merchant data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 31, type: 'action', label: 'Process orders via AliExpress/CJ', x: 1950, y: 200, prob: 100, desc: 'Shipping 15-45 days from China', source: 'AliExpress/Shopify data (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-032', 'SR-019'] },
    { id: 32, type: 'bottleneck', label: 'Handle fulfillment?', x: 2200, y: 200, prob: 50, desc: '20-30% complaint rate. Chargebacks 2-5x normal', source: 'Stripe data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-032', 'SR-019'] },
    { id: 33, type: 'outcome-bad', label: 'Chargebacks tank store', x: 2200, y: 400, prob: 100, desc: 'Payment processor bans', source: 'Stripe data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-032', 'SR-023'] },
    { id: 34, type: 'state', label: 'Revenue $5-15K/mo, margins 10-20%', x: 2450, y: 200, prob: 100, desc: 'Real profit $500-3000/mo', source: 'AutoDS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-profit-margin/', sacredRoots: ['SR-031', 'SR-012'] },
    { id: 35, type: 'gate', label: 'Scale to $5K+/mo net profit?', x: 2700, y: 200, prob: 15, desc: '1% of Shopify stores make $10K+/mo', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-031', 'SR-012'] },
    { id: 36, type: 'state', label: 'Stuck $1-3K/mo, costs rising', x: 2700, y: 420, prob: 100, desc: 'CPMs up 15-20%/year. Copycats appear', source: 'Meta Ads 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.triplewhale.com/blog/facebook-ads-benchmarks', sacredRoots: ['SR-031', 'SR-013'] },
    { id: 37, type: 'outcome-bad', label: 'Margins collapse, store dies', x: 2950, y: 420, prob: 100, desc: 'Ad costs exceed margins', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-007', 'SR-031'] },
    { id: 38, type: 'state', label: '$3-5K/mo but fragile', x: 2700, y: -20, prob: 100, desc: 'One ad ban away from zero', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-031', 'SR-017'] },
    { id: 39, type: 'bottleneck', label: 'Transition to private label?', x: 2950, y: -20, prob: 25, desc: 'Requires $10-50K capital', source: 'Ecom cases 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-017', 'SR-001'] },
    { id: 40, type: 'outcome-bad', label: 'Product saturated', x: 3200, y: -100, prob: 100, desc: 'Lifecycle: 3-6 months', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.autods.com/blog/dropshipping-tips-strategies/dropshipping-statistics/', sacredRoots: ['SR-007', 'SR-035'] },
    { id: 41, type: 'action', label: 'Build brand: packaging, shipping, email', x: 2950, y: 200, prob: 100, desc: 'Transition to branded DTC', source: 'Ecom cases 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-012', 'SR-018'] },
    { id: 42, type: 'decision', label: 'Sustain as real brand?', x: 3200, y: 200, prob: 30, desc: '~30% of $5K/mo earners transition', source: 'Ecom cases 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 43, type: 'outcome-good', label: 'Real DTC brand ($10K+/mo)', x: 3450, y: 130, prob: 100, desc: '<1% of dropshippers reach this', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-012', 'SR-018'] },
    { id: 44, type: 'outcome-bad', label: 'Overextended, inventory stuck', x: 3450, y: 280, prob: 100, desc: '$20K unsold inventory', source: 'Ecom cases 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-031', 'SR-023'] },
  ], edges: [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' }, { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 },
    { from: 9, to: 10, label: 'no (90%)' }, { from: 9, to: 20, label: 'partial' }, { from: 9, to: 30, label: 'yes (10%)' },
    { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 12, to: 13, label: 'no' }, { from: 12, to: 14, label: 'yes' }, { from: 14, to: 9 },
    { from: 20, to: 21 }, { from: 21, to: 22 }, { from: 22, to: 23, label: 'fail' }, { from: 22, to: 30, label: 'pass' },
    { from: 30, to: 31 }, { from: 31, to: 32 }, { from: 32, to: 33, label: 'fail' }, { from: 32, to: 34, label: 'pass' }, { from: 34, to: 35 },
    { from: 35, to: 36, label: 'no' }, { from: 35, to: 38, label: 'partial' }, { from: 35, to: 41, label: 'yes' },
    { from: 36, to: 37 }, { from: 38, to: 39 }, { from: 39, to: 40, label: 'fail' }, { from: 39, to: 41, label: 'pass' },
    { from: 41, to: 42 }, { from: 42, to: 43, label: 'yes' }, { from: 42, to: 44, label: 'no' },
  ] },
  dropshippingMin: { title: 'Dropshipping Store (Summary)', input: 'Someone starts a dropshipping business on Shopify', nodes: [
    { id: 1, type: 'desire', label: 'Want passive income via dropshipping', x: 0, y: 150, prob: 100, desc: 'Market $372B. 27% of stores use it', source: 'Grand View Research 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.grandviewresearch.com/', sacredRoots: ['SR-013', 'SR-007'] },
    { id: 2, type: 'bottleneck', label: 'Build store and launch ads?', x: 300, y: 150, prob: 40, desc: '60% never launch. 90% of first ads lose money', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-001', 'SR-031'] },
    { id: 3, type: 'outcome-bad', label: '80-90% fail within year 1', x: 300, y: 350, prob: 100, desc: 'Median store: 4 months', source: 'Shopify churn 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-007', 'SR-031'] },
    { id: 4, type: 'bottleneck', label: 'Profitable ads + fulfillment?', x: 600, y: 150, prob: 15, desc: '<10% ROAS >2x. Chargebacks 2-5x', source: 'Meta Ads 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.triplewhale.com/blog/facebook-ads-benchmarks', sacredRoots: ['SR-035', 'SR-032'] },
    { id: 5, type: 'bottleneck', label: 'Scale to $5K+/mo?', x: 900, y: 150, prob: 20, desc: '1% make $10K+/mo', source: 'Shopify data 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-031', 'SR-012'] },
    { id: 6, type: 'outcome-good', label: 'Real brand (<1%)', x: 1200, y: 100, prob: 100, desc: 'Private label + 3PL', source: 'Ecom cases 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.sellerscommerce.com/blog/dropshipping-statistics/', sacredRoots: ['SR-012', 'SR-018'] },
    { id: 7, type: 'outcome-bad', label: 'Store dead, $1-10K lost', x: 1200, y: 250, prob: 100, desc: 'The typical outcome', source: 'Shopify churn 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://gropulse.com/shopify-success-rate/', sacredRoots: ['SR-007', 'SR-031'] },
  ], edges: [
    { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail (60%)' }, { from: 2, to: 4, label: 'pass' },
    { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' }, { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
  ] },
  saas_scratch: { title: 'SaaS from Scratch', input: 'A solo founder builds a SaaS MVP and tries to reach $1M ARR', nodes: [
    { id: 1, type: 'desire', label: 'Solo founder wants to build SaaS', x: 0, y: 200, prob: 100, desc: '92% fail in 3 years. 39% solo (MicroConf 2024)', source: 'Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-017', 'SR-028'] },
    { id: 2, type: 'action', label: 'Identify problem worth solving', x: 200, y: 200, prob: 100, desc: '#1 killer: no market need (42%)', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-035', 'SR-017'] },
    { id: 3, type: 'bottleneck', label: 'Talk to 10+ users?', x: 400, y: 200, prob: 30, desc: '70% skip research', source: 'IndieHackers 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-035', 'SR-009'] },
    { id: 4, type: 'outcome-bad', label: 'Building without validation', x: 400, y: 420, prob: 100, desc: '"Build it and they will come"', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-008', 'SR-035'] },
    { id: 5, type: 'action', label: 'Build MVP (2-6 months)', x: 600, y: 200, prob: 100, desc: '70% never ship v1', source: 'IndieHackers 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://calmops.com/indie-hackers/what-is-an-indie-hacker-complete-guide-2025/', sacredRoots: ['SR-012', 'SR-008'] },
    { id: 6, type: 'bottleneck', label: 'Ships v1?', x: 800, y: 200, prob: 30, desc: 'Perfectionism kills 70%', source: 'IndieHackers 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-008'] },
    { id: 7, type: 'outcome-bad', label: 'Abandoned mid-build', x: 800, y: 420, prob: 100, desc: 'Zero users after months', source: 'IndieHackers 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-008', 'SR-012'] },
    { id: 8, type: 'action', label: 'Launch PH / Twitter / HN', x: 1000, y: 200, prob: 100, desc: 'Avg PH: 200-500 visits', source: 'Product Hunt 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.producthunt.com/', sacredRoots: ['SR-018', 'SR-009'] },
    { id: 9, type: 'state', label: 'Launch spike then silence', x: 1200, y: 200, prob: 100, desc: 'Day 7: traffic zero', source: 'Product Hunt 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.producthunt.com/', sacredRoots: ['SR-010', 'SR-007'] },
    { id: 10, type: 'gate', label: 'Get 10 paying users?', x: 1450, y: 200, prob: 10, desc: 'Free-to-paid: 2-5% freemium', source: 'SaaS Benchmarks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.madx.digital/learn/saas-conversion-rate', sacredRoots: ['SR-010', 'SR-035'] },
    { id: 11, type: 'state', label: 'Signups but zero payments', x: 1450, y: 480, prob: 100, desc: 'Wallets stay shut', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-035', 'SR-007'] },
    { id: 12, type: 'trajectory', label: 'Feature treadmill', x: 1650, y: 480, prob: 100, desc: 'Adding features, hoping', source: 'MicroConf 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://microconf.com/resources', sacredRoots: ['SR-008', 'SR-010'] },
    { id: 13, type: 'outcome-bad', label: 'Dies after 6+ months', x: 1900, y: 480, prob: 100, desc: '70% never break $1K/mo', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-007', 'SR-010'] },
    { id: 20, type: 'state', label: '3-7 paying, no momentum', x: 1450, y: -20, prob: 100, desc: 'Founder purgatory', source: 'SaaS benchmarks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-001', 'SR-010'] },
    { id: 21, type: 'trajectory', label: '5-to-10 user gap', x: 1650, y: -20, prob: 100, desc: 'No growth channel', source: 'MicroConf 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://microconf.com/resources', sacredRoots: ['SR-010', 'SR-011'] },
    { id: 22, type: 'bottleneck', label: 'Finds growth channel?', x: 1900, y: -20, prob: 20, desc: 'SEO takes 6-12 months', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-011', 'SR-017'] },
    { id: 23, type: 'outcome-bad', label: 'Stalled at 5 users', x: 2150, y: -100, prob: 100, desc: 'Worst limbo', source: 'MicroConf 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://microconf.com/resources', sacredRoots: ['SR-007', 'SR-008'] },
    { id: 30, type: 'state', label: '10+ paying, real signal', x: 1700, y: 200, prob: 100, desc: 'First paying within 30 days if warm', source: 'SaaS Benchmarks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.softwareseni.com/solo-founder-saas-metrics-from-0-to-10k-mrr-in-6-months-with-realistic-timelines/', sacredRoots: ['SR-012', 'SR-035'] },
    { id: 31, type: 'action', label: 'Focus retention + onboarding', x: 1950, y: 200, prob: 100, desc: 'Pre-PMF churn 4.3x higher', source: 'Vitally 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.vitally.io/post/saas-churn-benchmarks', sacredRoots: ['SR-032', 'SR-035'] },
    { id: 32, type: 'bottleneck', label: 'Reach $1K MRR?', x: 2200, y: 200, prob: 30, desc: 'Median 12-18 months', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 33, type: 'outcome-bad', label: 'Plateau $100-500 MRR', x: 2200, y: 400, prob: 100, desc: '50% plateau at $1-10K', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-013', 'SR-010'] },
    { id: 34, type: 'state', label: '$1K MRR achieved', x: 2450, y: 200, prob: 100, desc: '18-month valley of death', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-012', 'SR-011'] },
    { id: 35, type: 'action', label: 'Build growth engine', x: 2700, y: 200, prob: 100, desc: 'Referral SaaS: 30% lower churn', source: 'GrowthUnhinged 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.growthunhinged.com/p/2025-saas-benchmarks-report', sacredRoots: ['SR-017', 'SR-018'] },
    { id: 36, type: 'bottleneck', label: 'Reach $10K MRR?', x: 2950, y: 200, prob: 25, desc: '15% reach $10-100K MRR', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 37, type: 'outcome-bad', label: '$1-5K MRR lifestyle plateau', x: 2950, y: 400, prob: 100, desc: 'Solo founder ceiling', source: 'MicroConf 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://microconf.com/resources', sacredRoots: ['SR-013', 'SR-007'] },
    { id: 38, type: 'state', label: '$10K+ MRR, real business', x: 3200, y: 200, prob: 100, desc: 'Hire or burn out', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-014', 'SR-012'] },
    { id: 39, type: 'decision', label: 'Reach $1M ARR?', x: 3450, y: 200, prob: 10, desc: '<1% reach this', source: 'SaaStr 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.saastr.com/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 40, type: 'outcome-good', label: '$1M+ ARR SaaS', x: 3700, y: 130, prob: 100, desc: '42% solo-founded', source: 'Bessemer 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-036'] },
    { id: 41, type: 'outcome-bad', label: 'Shut down or pivot', x: 3700, y: 280, prob: 100, desc: '99% unfunded fail', source: 'Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-007', 'SR-019'] },
  ], edges: [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
    { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' }, { from: 8, to: 9 }, { from: 9, to: 10 },
    { from: 10, to: 11, label: 'no' }, { from: 10, to: 20, label: 'partial' }, { from: 10, to: 30, label: 'yes' },
    { from: 11, to: 12 }, { from: 12, to: 13 }, { from: 20, to: 21 }, { from: 21, to: 22 },
    { from: 22, to: 23, label: 'fail' }, { from: 22, to: 30, label: 'pass' },
    { from: 30, to: 31 }, { from: 31, to: 32 }, { from: 32, to: 33, label: 'fail' }, { from: 32, to: 34, label: 'pass' },
    { from: 34, to: 35 }, { from: 35, to: 36 }, { from: 36, to: 37, label: 'fail' }, { from: 36, to: 38, label: 'pass' },
    { from: 38, to: 39 }, { from: 39, to: 40, label: 'yes' }, { from: 39, to: 41, label: 'no' },
  ] },
  saas_scratchMin: { title: 'SaaS from Scratch (Summary)', input: 'A solo founder builds a SaaS MVP and tries to reach $1M ARR', nodes: [
    { id: 1, type: 'desire', label: 'Solo founder wants SaaS', x: 0, y: 150, prob: 100, desc: '92% fail. 70% never ship', source: 'Startup Genome 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-017', 'SR-008'] },
    { id: 2, type: 'bottleneck', label: 'Ships + gets 10 paying?', x: 300, y: 150, prob: 10, desc: 'Free-to-paid 2-5%', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-012', 'SR-035'] },
    { id: 3, type: 'outcome-bad', label: 'Never ships or no one pays', x: 300, y: 350, prob: 100, desc: 'No market need (42%)', source: 'CB Insights 2025', sourceUrl: 'https://www.cbinsights.com/research/report/venture-trends-2025/', sacredRoots: ['SR-007', 'SR-035'] },
    { id: 4, type: 'bottleneck', label: 'Reaches $1K MRR?', x: 600, y: 150, prob: 30, desc: 'Median 12-18 months', source: 'SaaSRanger 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://saasranger.com/blog/micro-saas-revenue-reality-what-1000-founders-actually-earn/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 5, type: 'bottleneck', label: 'Reaches $1M ARR?', x: 900, y: 150, prob: 10, desc: '<1% reach this', source: 'SaaStr 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.saastr.com/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 6, type: 'outcome-good', label: 'Real SaaS ($1M+)', x: 1200, y: 100, prob: 100, desc: '42% solo-founded', source: 'Bessemer 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-036'] },
    { id: 7, type: 'outcome-bad', label: 'Shut down or plateau', x: 1200, y: 250, prob: 100, desc: 'Most at $1-5K MRR', source: 'Startup Genome 2025', sourceUrl: 'https://startupgenome.com/report/gser2025', sacredRoots: ['SR-007', 'SR-013'] },
  ], edges: [
    { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail (90%)' }, { from: 2, to: 4, label: 'pass' },
    { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' }, { from: 5, to: 6, label: 'pass' }, { from: 5, to: 7, label: 'fail' },
  ] },
  side_hustle: { title: 'Side Hustle to Full-Time', input: 'Someone with a full-time job starts a side hustle', nodes: [
    { id: 1, type: 'desire', label: 'Want to escape 9-5', x: 0, y: 200, prob: 100, desc: '36% have side hustle. 44% need one to survive', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-007', 'SR-008'] },
    { id: 2, type: 'action', label: 'Research + pick type', x: 200, y: 200, prob: 100, desc: '16% want it full-time', source: 'LendingTree 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.lendingtree.com/debt-consolidation/side-hustle-income-survey/', sacredRoots: ['SR-017', 'SR-013'] },
    { id: 3, type: 'bottleneck', label: 'Actually starts?', x: 400, y: 200, prob: 50, desc: '50% never start', source: 'Zapier 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://zapier.com/blog/', sacredRoots: ['SR-001', 'SR-008'] },
    { id: 4, type: 'outcome-bad', label: 'Never started', x: 400, y: 420, prob: 100, desc: 'Just dreaming', source: 'Survey 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-008', 'SR-007'] },
    { id: 5, type: 'action', label: 'Build evenings + weekends', x: 600, y: 200, prob: 100, desc: '12-15 hrs/week extra', source: 'Zapier 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://zapier.com/blog/', sacredRoots: ['SR-012', 'SR-011'] },
    { id: 6, type: 'state', label: 'Month 1-3: energy drained', x: 800, y: 200, prob: 100, desc: '67% burnout', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-014', 'SR-011'] },
    { id: 7, type: 'gate', label: 'Sustain beyond 3 months?', x: 1050, y: 200, prob: 30, desc: 'Avg abandonment: 4.5 months', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-014', 'SR-011'] },
    { id: 10, type: 'state', label: 'Burnout hits', x: 1050, y: 480, prob: 100, desc: '1 in 5 worse than day job', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-014', 'SR-012'] },
    { id: 11, type: 'trajectory', label: 'Decline spiral', x: 1250, y: 480, prob: 100, desc: 'Miss weeks, then quit', source: 'Survey 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-014', 'SR-008'] },
    { id: 12, type: 'outcome-bad', label: 'Burned out, quit', x: 1500, y: 480, prob: 100, desc: 'Abandoned after 4.5 months', source: 'Survey 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-014', 'SR-012'] },
    { id: 20, type: 'state', label: 'Sporadic 5-8 hrs/week', x: 1050, y: -20, prob: 100, desc: 'Once a week, guilt', source: 'Gallup 2025', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-012', 'SR-011'] },
    { id: 21, type: 'trajectory', label: 'Weekend warrior', x: 1250, y: -20, prob: 100, desc: 'No routine, no momentum', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-008', 'SR-011'] },
    { id: 22, type: 'bottleneck', label: 'Finds rhythm?', x: 1500, y: -20, prob: 20, desc: '20% find one', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-014', 'SR-012'] },
    { id: 23, type: 'outcome-bad', label: 'Eternal side project', x: 1700, y: -100, prob: 100, desc: 'Years, nothing to show', source: 'Survey 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-008', 'SR-012'] },
    { id: 30, type: 'state', label: 'Consistent, first revenue', x: 1300, y: 200, prob: 100, desc: 'Avg $885/mo, median $200', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 31, type: 'action', label: 'Optimize prices + clients', x: 1550, y: 200, prob: 100, desc: 'Millennials avg $1,129/mo', source: 'LendingTree 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.lendingtree.com/debt-consolidation/side-hustle-income-survey/', sacredRoots: ['SR-017', 'SR-012'] },
    { id: 32, type: 'bottleneck', label: 'Exceed $1K/month?', x: 1800, y: 200, prob: 25, desc: '10-15% exceed $1K', source: 'Bankrate 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 33, type: 'outcome-bad', label: '$200-500/mo, not enough', x: 1800, y: 400, prob: 100, desc: 'Median: $200/mo', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-013', 'SR-007'] },
    { id: 34, type: 'state', label: '$1-3K/mo, confidence growing', x: 2050, y: 200, prob: 100, desc: '3/5 say income essential', source: 'LendingTree 2025', sourceUrl: 'https://www.lendingtree.com/debt-consolidation/side-hustle-income-survey/', sacredRoots: ['SR-031', 'SR-001'] },
    { id: 35, type: 'gate', label: 'Match salary ($3-8K/mo)?', x: 2300, y: 200, prob: 15, desc: 'Very few reach this part-time', source: 'BLS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 36, type: 'state', label: '$1-3K plateau, day job limits', x: 2300, y: 420, prob: 100, desc: 'Cannot scale without time', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-013', 'SR-014'] },
    { id: 37, type: 'outcome-bad', label: 'Comfortable but trapped', x: 2550, y: 420, prob: 100, desc: 'Golden handcuffs', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-007', 'SR-001'] },
    { id: 38, type: 'state', label: '$3-5K/mo inconsistent', x: 2300, y: -20, prob: 100, desc: 'Not stable enough', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-031', 'SR-010'] },
    { id: 39, type: 'bottleneck', label: 'Stabilizes 3+ months?', x: 2550, y: -20, prob: 30, desc: 'Need consistency first', source: 'Financial advisors (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freshbooks.com/research', sacredRoots: ['SR-017', 'SR-001'] },
    { id: 40, type: 'outcome-bad', label: 'Income drops', x: 2800, y: -100, prob: 100, desc: 'Bad month shatters confidence', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-007', 'SR-001'] },
    { id: 41, type: 'decision', label: 'Quit day job?', x: 2550, y: 200, prob: 25, desc: '6 months savings minimum', source: 'LendingTree 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.lendingtree.com/debt-consolidation/side-hustle-income-survey/', sacredRoots: ['SR-001', 'SR-017'] },
    { id: 42, type: 'state', label: 'Full-time, no safety net', x: 2800, y: 200, prob: 100, desc: 'Stress peaks first 6 months', source: 'FreshBooks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freshbooks.com/research', sacredRoots: ['SR-001', 'SR-031'] },
    { id: 43, type: 'bottleneck', label: 'Income survives transition?', x: 3050, y: 200, prob: 60, desc: '25% return to employment', source: 'BLS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-031', 'SR-001'] },
    { id: 44, type: 'outcome-good', label: 'Full-time entrepreneur', x: 3300, y: 130, prob: 100, desc: '65% higher satisfaction', source: 'FreshBooks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freshbooks.com/research', sacredRoots: ['SR-012', 'SR-001'] },
    { id: 45, type: 'outcome-bad', label: 'Back to employment', x: 3300, y: 280, prob: 100, desc: '25% return in year 1', source: 'BLS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-007', 'SR-031'] },
    { id: 46, type: 'outcome-bad', label: 'Stays employed, supplement only', x: 2800, y: 350, prob: 100, desc: '$1-3K/mo but no freedom', source: 'Pattern analysis (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.hostinger.com/tutorials/side-hustle-statistics', sacredRoots: ['SR-007', 'SR-013'] },
  ], edges: [
    { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
    { from: 5, to: 6 }, { from: 6, to: 7 },
    { from: 7, to: 10, label: 'no (67%)' }, { from: 7, to: 20, label: 'partial' }, { from: 7, to: 30, label: 'yes (30%)' },
    { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 20, to: 21 }, { from: 21, to: 22 },
    { from: 22, to: 23, label: 'fail' }, { from: 22, to: 30, label: 'pass' },
    { from: 30, to: 31 }, { from: 31, to: 32 }, { from: 32, to: 33, label: 'fail' }, { from: 32, to: 34, label: 'pass' },
    { from: 34, to: 35 }, { from: 35, to: 36, label: 'no' }, { from: 35, to: 38, label: 'partial' }, { from: 35, to: 41, label: 'yes' },
    { from: 36, to: 37 }, { from: 38, to: 39 }, { from: 39, to: 40, label: 'fail' }, { from: 39, to: 41, label: 'pass' },
    { from: 41, to: 42, label: 'yes' }, { from: 41, to: 46, label: 'no' },
    { from: 42, to: 43 }, { from: 43, to: 44, label: 'pass' }, { from: 43, to: 45, label: 'fail' },
  ] },
  side_hustleMin: { title: 'Side Hustle to Full-Time (Summary)', input: 'Someone with a full-time job starts a side hustle', nodes: [
    { id: 1, type: 'desire', label: 'Want to escape 9-5', x: 0, y: 150, prob: 100, desc: '36% have side hustle. 44% need one', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-007', 'SR-008'] },
    { id: 2, type: 'bottleneck', label: 'Survive burnout (67% fail)?', x: 300, y: 150, prob: 30, desc: 'Avg quit: 4.5 months', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-014', 'SR-011'] },
    { id: 3, type: 'outcome-bad', label: 'Burned out, quit', x: 300, y: 350, prob: 100, desc: 'Not enough time/energy', source: 'Bankrate 2025', sourceUrl: 'https://www.bankrate.com/loans/small-business/side-hustles-survey/', sacredRoots: ['SR-014', 'SR-012'] },
    { id: 4, type: 'bottleneck', label: 'Match salary?', x: 600, y: 150, prob: 15, desc: '10-15% exceed $1K/mo', source: 'BLS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-012', 'SR-031'] },
    { id: 5, type: 'decision', label: 'Quit day job?', x: 900, y: 150, prob: 25, desc: '25% return in year 1', source: 'Financial advisors 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freshbooks.com/research', sacredRoots: ['SR-001', 'SR-017'] },
    { id: 6, type: 'outcome-good', label: 'Full-time entrepreneur', x: 1200, y: 100, prob: 100, desc: '65% higher satisfaction', source: 'FreshBooks 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.freshbooks.com/research', sacredRoots: ['SR-012', 'SR-001'] },
    { id: 7, type: 'outcome-bad', label: 'Back to employment', x: 1200, y: 250, prob: 100, desc: 'Most at $200-500/mo', source: 'BLS 2025 (estimated by Foresight from public data — not an official source)', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-007', 'SR-031'] },
  ], edges: [
    { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail (67%)' }, { from: 2, to: 4, label: 'pass' },
    { from: 4, to: 3, label: 'fail' }, { from: 4, to: 5, label: 'pass' }, { from: 5, to: 6, label: 'yes' }, { from: 5, to: 7, label: 'no' },
  ] },

  // ── UNICORN STARTUP ──────────────────────────────────────────────

  unicorn_startupMin: {
    title: 'Path to Unicorn ($1B) (Summary)',
    input: 'I want to build a unicorn startup worth $1 billion',
    nodes: [
      { id: 1, type: 'state', label: '1000 funded startups', x: 0, y: 150, prob: 100, desc: '**~50,000 startups receive seed funding annually** in the US alone. Globally ~300K+ venture-backed startups exist at any time. Most founders believe they can reach $1B.', source: 'Crunchbase Annual Report 2025 | PitchBook Venture Monitor Q4 2024', sourceUrl: 'https://www.crunchbase.com/discover/funding_rounds', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'bottleneck', label: 'Reach product-market fit? (10-25%)', x: 250, y: 150, prob: 15, desc: '**Only 10-25% of funded startups achieve true PMF.** Most die searching. Median time to PMF: 18-24 months. CB Insights: 35% fail from "no market need".', source: 'Startup Genome Report 2025:15:2 | CB Insights 2024:35% no need:2 | Y Combinator Data 2025:PMF rate:2', sourceUrl: 'https://startupgenome.com/reports', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 3, type: 'outcome-bad', label: '750-900 die pre-PMF', x: 250, y: 380, prob: 100, desc: 'Most startups never find PMF. Burn through seed capital in 18-24 months.', source: 'CB Insights Startup Failure Report 2024', sourceUrl: 'https://www.cbinsights.com/research/report/startup-failure-reasons-top/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Raise Series A? (15-25%)', x: 500, y: 150, prob: 20, desc: '**Only 15-25% of seed-funded startups raise Series A.** Median Series A: $12M at $50-60M valuation. Requires $1-2M ARR or 3x growth.', source: 'PitchBook Venture Monitor 2025:20:2 | Carta Series A Benchmark 2024:15-25%:2', sourceUrl: 'https://pitchbook.com/news/reports/q4-2024-pitchbook-nvca-venture-monitor', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'bottleneck', label: 'Scale to $100M+ valuation? (5-15%)', x: 750, y: 150, prob: 10, desc: '**5-15% of Series A companies reach $100M+ valuation** (Series B/C). Requires $10M+ ARR, 2-3x annual growth, unit economics.', source: 'PitchBook 2025:10:2 | Bessemer Cloud Index 2025:growth benchmarks:2', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 6, type: 'bottleneck', label: 'Reach $1B valuation? (1-3%)', x: 1000, y: 150, prob: 2, desc: '**Only 1-3% of Series A startups ever reach unicorn status.** ~1,500 unicorns exist globally (2025). Median time: 7 years from founding. Requires $100M+ ARR or massive growth.', source: 'CB Insights Unicorn Tracker 2025:1-2%:2 | PitchBook 2025:1,500 unicorns:2 | Aileen Lee/Cowboy Ventures Update 2024', sourceUrl: 'https://www.cbinsights.com/research-unicorn-companies', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 7, type: 'outcome-good', label: '1-3 of 1000 become unicorns', x: 1250, y: 100, prob: 100, desc: '**$1B+ valuation achieved.** Join ~1,500 companies globally. Top unicorns: SpaceX ($350B), Stripe ($50B), Databricks ($43B). Most in US (50%), China (15%), India (7%).', source: 'CB Insights Global Unicorn Club 2025 | Hurun Unicorn Index 2025', sourceUrl: 'https://www.cbinsights.com/research-unicorn-companies', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 8, type: 'outcome-bad', label: 'Rest: exit, acquihire, or shut down', x: 1250, y: 250, prob: 100, desc: 'Most funded startups end in small exit ($5-50M), acquihire, or shutdown. **Median VC-backed exit: $24M** — good return for founders, not unicorn.', source: 'PitchBook Exit Data 2025 | AngelList Exit Analysis 2024', sourceUrl: 'https://pitchbook.com/', sacredRoots: ['SR-013', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (75-90%)' }, { from: 2, to: 4, label: 'pass (10-25%)' },
      { from: 4, to: 3, label: 'fail (75-85%)' }, { from: 4, to: 5, label: 'pass (15-25%)' },
      { from: 5, to: 8, label: 'fail (85-95%)' }, { from: 5, to: 6, label: 'pass (5-15%)' },
      { from: 6, to: 7, label: 'pass (1-3%)' }, { from: 6, to: 8, label: 'fail (97-99%)' },
    ],
  },

  unicorn_startupMid: {
    title: 'Path to Unicorn ($1B) (Analysis)',
    input: 'I want to build a unicorn startup worth $1 billion',
    nodes: [
      { id: 1, type: 'state', label: 'Founder with idea + ambition', x: 0, y: 200, prob: 100, desc: '**~5M new businesses started annually in the US** (Census 2024). Of these, ~50K receive institutional seed funding. The unicorn journey begins here.', source: 'US Census Business Applications 2024 | Crunchbase 2025', sourceUrl: 'https://www.census.gov/econ/bfs/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'action', label: 'Build MVP + get first users', x: 250, y: 200, prob: 100, desc: 'Median time from idea to MVP: 3-6 months. First 100 users are the hardest. Y Combinator: "Launch early, iterate fast."', source: 'Y Combinator Startup School 2025', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 3, type: 'bottleneck', label: 'Raise seed round? (10-15%)', x: 500, y: 200, prob: 12, desc: '**Only 10-15% of startups that apply get seed funding.** Median seed round: $3.5M (2024). YC acceptance: 1.5-3%. Average seed valuation: $12-15M.', source: 'PitchBook Seed Report 2025:12:2 | Y Combinator Stats 2025:1.5%:2 | Crunchbase 2025:seed median:2', sourceUrl: 'https://pitchbook.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 4, type: 'outcome-bad', label: 'Bootstrapped or dead', x: 500, y: 430, prob: 100, desc: 'Most startups never raise. Some bootstrap successfully to $1-10M revenue (Indie Hackers path), but unicorn without VC is extremely rare (<0.1%).', source: 'Indie Hackers Survey 2025 | Crunchbase Bootstrap Analysis', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 5, type: 'state', label: 'Seed funded, 18-month runway', x: 750, y: 200, prob: 100, desc: 'Median seed runway: 18-22 months. Must find PMF before money runs out. **42% of seed startups die before Series A.**', source: 'Carta Fundraising Data 2025 | CB Insights 2024', sourceUrl: 'https://carta.com/blog/state-of-private-markets/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 6, type: 'gate', label: 'Achieve product-market fit?', x: 1000, y: 200, prob: 20, desc: '**Only 20% of seed startups find true PMF.** Signs: organic growth, retention >40% monthly, NPS >50. Most pivot 1-3 times before finding it.', source: 'Startup Genome Report 2025:20:2 | Sequoia PMF Framework 2024:retention:2', sourceUrl: 'https://startupgenome.com/', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 7, type: 'outcome-bad', label: 'Pivot loop or die trying', x: 1000, y: 430, prob: 100, desc: 'Endless pivots without traction. "Zombie startup" — alive but not growing. Eventually founders burn out or funding expires.', source: 'CB Insights 2024 | Startup Genome 2025', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 8, type: 'state', label: 'Weak PMF, growing slowly', x: 1000, y: 0, prob: 100, desc: 'Some traction but not explosive. Bridge round territory. ~30% get a bridge, most die.', source: 'Carta Bridge Round Data 2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 9, type: 'bottleneck', label: 'Raise Series A? (20-30%)', x: 1250, y: 200, prob: 25, desc: '**20-30% of PMF-confirmed startups raise Series A.** Median: $12M at $50M valuation. Requires $1-2M ARR or 15-20% MoM growth. Competition: 3,000+ startups per top VC fund.', source: 'PitchBook Series A Benchmark 2025:25:2 | Carta 2025:$12M median:2', sourceUrl: 'https://pitchbook.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 10, type: 'outcome-bad', label: 'Stuck at seed stage, small exit', x: 1250, y: 430, prob: 100, desc: 'Acquihire for $5-20M or slow death. Founder equity often diluted to near zero.', source: 'AngelList Exit Data 2024', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 11, type: 'state', label: 'Series A funded, scaling team', x: 1500, y: 200, prob: 100, desc: '$12-20M raised, 20-50 employees. Must grow 3x/year. Now competing with well-funded rivals. Execution > idea from here.', source: 'Bessemer Growth Benchmarks 2025 | First Round Capital Data', sourceUrl: 'https://www.bvp.com/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 12, type: 'bottleneck', label: 'Reach $10M+ ARR? (25-40%)', x: 1750, y: 200, prob: 30, desc: '**25-40% of Series A companies reach $10M ARR.** Median time: 2-3 years post-Series A. This is the "crossing the chasm" moment.', source: 'Bessemer Cloud Index 2025:30:2 | SaaS Capital Index 2025:growth:2', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 13, type: 'outcome-bad', label: 'Stalled growth, down round or die', x: 1750, y: 430, prob: 100, desc: 'Growth slows to <50%/year. Can not raise next round. Down round or acquihire. **60-70% of Series A companies fail to reach Series B.**', source: 'PitchBook 2025 | Mattermark Analysis 2024', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 14, type: 'bottleneck', label: 'Reach unicorn ($1B)? (5-10%)', x: 2000, y: 200, prob: 7, desc: '**Only 5-10% of $10M+ ARR companies reach $1B valuation.** Requires $100M+ ARR at 10x+ multiple, or massive growth at lower revenue. ~1,500 unicorns exist globally.', source: 'CB Insights Unicorn Tracker 2025:7:2 | PitchBook 2025:1,500:2 | Aileen Lee Cowboy Ventures 2024', sourceUrl: 'https://www.cbinsights.com/research-unicorn-companies', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 15, type: 'outcome-good', label: 'UNICORN: $1B+ valuation', x: 2250, y: 130, prob: 100, desc: '**$1B+ valuation achieved.** ~0.07% of all funded startups. Median time from founding: 7 years. Top sectors: AI/ML (28%), Fintech (18%), Enterprise SaaS (15%). Next: IPO or mega-acquisition.', source: 'CB Insights 2025 | PitchBook Global Unicorn Report 2025', sourceUrl: 'https://www.cbinsights.com/research-unicorn-companies', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 16, type: 'outcome-bad', label: 'Good business, not a unicorn', x: 2250, y: 300, prob: 100, desc: 'Solid $50-500M company. Great for founders (life-changing wealth). But not a unicorn. **90% of successful startups end here** — and that is a win.', source: 'AngelList Returns Report 2024 | Carta Exit Data 2025', sourceUrl: 'https://carta.com/', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail (85-90%)' }, { from: 3, to: 5, label: 'pass (10-15%)' },
      { from: 5, to: 6 },
      { from: 6, to: 7, label: 'no (50-60%)' }, { from: 6, to: 8, label: 'partial (20-30%)' }, { from: 6, to: 9, label: 'yes (20%)' },
      { from: 8, to: 10 },
      { from: 9, to: 10, label: 'fail (70-80%)' }, { from: 9, to: 11, label: 'pass (20-30%)' },
      { from: 11, to: 12 },
      { from: 12, to: 13, label: 'fail (60-75%)' }, { from: 12, to: 14, label: 'pass (25-40%)' },
      { from: 14, to: 15, label: 'pass (5-10%)' }, { from: 14, to: 16, label: 'fail (90-95%)' },
    ],
  },

  unicorn_startup: {
    title: 'Path to Unicorn ($1B)',
    input: 'I want to build a unicorn startup worth $1 billion',
    nodes: [
      { id: 1, type: 'state', label: '10,000 aspiring founders', x: 0, y: 200, prob: 100, desc: '**~5M new businesses started annually in the US** (Census 2024). Of these, ~300K are tech-oriented. ~50K apply for institutional funding. The funnel begins wide.', source: 'US Census Business Applications 2024:5M:3 | Crunchbase 2025:50K seed:2', sourceUrl: 'https://www.census.gov/econ/bfs/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 2, type: 'desire', label: 'Want to build a billion-dollar company', x: 200, y: 200, prob: 100, desc: 'The unicorn dream. 73% of YC applicants cite "building something massive" as top motivation.', source: 'Y Combinator Founder Survey 2025', sourceUrl: 'https://www.ycombinator.com/', sacredRoots: ['SR-007', 'SR-012'] },
      { id: 3, type: 'action', label: 'Build MVP, get first 100 users', x: 400, y: 200, prob: 100, desc: 'Median time from idea to working MVP: 3-6 months. First 100 users require personal outreach, not marketing.', source: 'Y Combinator Startup School 2025 | First Round Capital Review 2024', sourceUrl: 'https://www.ycombinator.com/library', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 4, type: 'state', label: 'MVP live, some traction signals', x: 600, y: 200, prob: 100, desc: 'Product exists, a few users care. Now the real test: can you raise money to grow faster?', source: 'Startup Genome 2025', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 5, type: 'bottleneck', label: 'Raise seed round? (10-15%)', x: 800, y: 200, prob: 12, desc: '**10-15% of startups that apply get seed funding.** Median seed: $3.5M at $12-15M valuation. YC acceptance: 1.5-3%. Need strong team + early traction.', source: 'PitchBook Seed Report 2025:12:2 | Y Combinator Stats 2025:1.5%:2 | Crunchbase 2025', sourceUrl: 'https://pitchbook.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'No funding: bootstrap or die', x: 800, y: 450, prob: 100, desc: '85-90% never raise seed. Some bootstrap to profitability (good outcome, just not unicorn path). Most shut down within 2 years.', source: 'Crunchbase 2025 | Indie Hackers Survey 2025', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 7, type: 'state', label: 'Seed funded, 18-month clock starts', x: 1000, y: 200, prob: 100, desc: '$2-5M raised, 5-15 employees. **18-22 months of runway.** Must find PMF before it runs out. 42% of seed companies die before Series A.', source: 'Carta 2025 | CB Insights 2024', sourceUrl: 'https://carta.com/blog/state-of-private-markets/', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 8, type: 'action', label: 'Iterate rapidly toward PMF', x: 1200, y: 200, prob: 100, desc: 'Average startup pivots 1-3 times before finding PMF. Speed of iteration is the #1 predictor of success (Startup Genome).', source: 'Startup Genome Report 2025', sourceUrl: 'https://startupgenome.com/', sacredRoots: ['SR-009', 'SR-035'] },
      { id: 9, type: 'gate', label: 'Achieve product-market fit?', x: 1400, y: 200, prob: 20, desc: '**Only 20% of seed startups find PMF.** Signs: organic growth, >40% monthly retention, customers pull product from you. Sean Ellis test: >40% say "very disappointed" if product disappears.', source: 'Startup Genome 2025:20:2 | Sequoia PMF Framework 2024 | Superhuman PMF Method 2024', sourceUrl: 'https://startupgenome.com/', sacredRoots: ['SR-035', 'SR-010'] },
      { id: 10, type: 'outcome-bad', label: 'No PMF: pivot exhaustion, shutdown', x: 1400, y: 450, prob: 100, desc: 'Endless pivots, team demoralized. "Zombie startup" — alive but going nowhere. Founders burn out. Most common death.', source: 'CB Insights 2024: 35% fail "no market need"', sourceUrl: 'https://www.cbinsights.com/research/report/startup-failure-reasons-top/', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 11, type: 'state', label: 'Weak PMF, slow growth', x: 1400, y: -20, prob: 100, desc: 'Some traction but not explosive. Growing 5-10% MoM instead of 15-20%. Bridge round territory.', source: 'Carta Bridge Round Data 2025', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 12, type: 'trajectory', label: 'Bridge round or die path', x: 1600, y: -20, prob: 100, desc: '~30% of weak-PMF startups get a bridge round. Most of those still die.', source: 'Carta 2025', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 13, type: 'outcome-bad', label: 'Ran out of runway', x: 1800, y: -20, prob: 100, desc: 'Bridge money spent, still no inflection. Game over.', source: 'CB Insights 2024', sacredRoots: ['SR-007', 'SR-010'] },
      { id: 14, type: 'state', label: 'Strong PMF confirmed', x: 1600, y: 200, prob: 100, desc: 'Product-market fit achieved. Growing 15-25% MoM. Customers are pulling. Time to raise Series A and pour fuel on the fire.', source: 'Sequoia Growth Framework 2025', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 15, type: 'bottleneck', label: 'Raise Series A? (25-35%)', x: 1800, y: 200, prob: 30, desc: '**25-35% of PMF startups raise Series A.** Median: $12M at $50-60M valuation. Need $1-2M ARR or 15-20% MoM growth. VCs see 3,000+ companies per fund.', source: 'PitchBook 2025:30:2 | Carta Series A Benchmark 2025:$12M:2', sourceUrl: 'https://pitchbook.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 16, type: 'outcome-bad', label: 'Stuck at seed, small exit or acquihire', x: 1800, y: 450, prob: 100, desc: 'Acquihire for $5-20M or slow grind. Founder equity often diluted to 5-15%. Decent outcome, not unicorn.', source: 'AngelList Exit Data 2024', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 17, type: 'state', label: 'Series A funded, building machine', x: 2000, y: 200, prob: 100, desc: '$12-20M raised, 20-50 employees. Must grow 3x/year minimum. Execution > idea from this point. Hire VP Sales, VP Eng.', source: 'Bessemer 2025 | First Round Capital 2024', sourceUrl: 'https://www.bvp.com/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 18, type: 'action', label: 'Scale go-to-market + team', x: 2200, y: 200, prob: 100, desc: 'Sales team, marketing engine, customer success. CAC must stay below LTV. Churn must be <5% monthly.', source: 'Bessemer Cloud Index 2025', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-032'] },
      { id: 19, type: 'bottleneck', label: 'Reach $10M+ ARR? (25-40%)', x: 2400, y: 200, prob: 30, desc: '**25-40% of Series A companies reach $10M ARR.** "Crossing the chasm" moment. Median: 2-3 years post-A. Requires repeatable sales motion.', source: 'Bessemer Cloud Index 2025:30:2 | SaaS Capital Index 2025:2-3yr:2', sourceUrl: 'https://www.bvp.com/cloud-index', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 20, type: 'outcome-bad', label: 'Stalled: down round, layoffs, or die', x: 2400, y: 450, prob: 100, desc: 'Growth slows to <50%/year. Cannot raise Series B. Down round (-30-50% valuation) or acquihire. **60-70% of Series A companies never reach B.**', source: 'PitchBook 2025 | Mattermark Analysis 2024', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 21, type: 'state', label: '$10M+ ARR, Series B/C funded', x: 2600, y: 200, prob: 100, desc: 'Real company now. 100-300 employees. $30-80M raised total. Valuation $200-500M. The final stretch to unicorn.', source: 'PitchBook 2025 | Carta 2025', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 22, type: 'action', label: 'Hypergrowth: 2-3x/year for 2-3 years', x: 2800, y: 200, prob: 100, desc: 'Must sustain 100-200% annual growth. International expansion, enterprise tier, platform play. This is where most remaining companies stall.', source: 'Bessemer Centaur Report 2025', sourceUrl: 'https://www.bvp.com/', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 23, type: 'bottleneck', label: 'Reach $1B valuation? (5-10%)', x: 3000, y: 200, prob: 7, desc: '**5-10% of $10M+ ARR companies reach unicorn.** Need $100M+ ARR at 10x multiple, or $50M+ ARR at 20x+ (high growth). Only ~60-100 new unicorns per year globally.', source: 'CB Insights Unicorn Tracker 2025:7:2 | PitchBook 2025:60-100/year:2 | Aileen Lee Cowboy Ventures 2024', sourceUrl: 'https://www.cbinsights.com/research-unicorn-companies', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 24, type: 'outcome-good', label: 'UNICORN: $1B+ valuation', x: 3200, y: 130, prob: 100, desc: '**$1B+ valuation.** ~0.07% of all funded startups ever reach this. ~1,500 unicorns globally (2025). Median time: 7 years. Top: AI/ML (28%), Fintech (18%), SaaS (15%). Next: IPO ($10B+ possible) or mega-acquisition.', source: 'CB Insights Global Unicorn Club 2025 | Hurun Global Unicorn Index 2025', sourceUrl: 'https://www.cbinsights.com/research-unicorn-companies', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 25, type: 'outcome-good', label: 'Strong $100M-$999M company', x: 3200, y: 280, prob: 100, desc: '**"Centaur" ($100M+ ARR) is an incredible achievement.** Founder worth $50-500M. 90% of successful tech companies live here. Not a unicorn on paper, but a massive win.', source: 'Bessemer Centaur Report 2025 | Carta 2025', sourceUrl: 'https://www.bvp.com/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 26, type: 'outcome-bad', label: 'Growth ceiling, modest exit', x: 3000, y: 450, prob: 100, desc: 'Solid company but growth flatlined. $50-200M exit via acquisition. Founders and early employees do well. VCs get 2-5x, not 100x.', source: 'PitchBook Exit Data 2025', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 6, label: 'fail (85-90%)' }, { from: 5, to: 7, label: 'pass (10-15%)' },
      { from: 7, to: 8 }, { from: 8, to: 9 },
      { from: 9, to: 10, label: 'no (50-60%)' }, { from: 9, to: 11, label: 'partial (20-30%)' }, { from: 9, to: 14, label: 'yes (20%)' },
      { from: 11, to: 12 }, { from: 12, to: 13 },
      { from: 14, to: 15 },
      { from: 15, to: 16, label: 'fail (65-75%)' }, { from: 15, to: 17, label: 'pass (25-35%)' },
      { from: 17, to: 18 }, { from: 18, to: 19 },
      { from: 19, to: 20, label: 'fail (60-75%)' }, { from: 19, to: 21, label: 'pass (25-40%)' },
      { from: 21, to: 22 }, { from: 22, to: 23 },
      { from: 23, to: 24, label: 'pass (5-10%)' }, { from: 23, to: 25 }, { from: 23, to: 26, label: 'fail (90-95%)' },
    ],
  },
};
