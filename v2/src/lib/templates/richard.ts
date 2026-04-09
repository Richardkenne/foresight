import type { Template } from '../templates';

export const richardTemplates: Record<string, Template> = {

  // ============================================================
  // CAFEPEDIA TO REVENUE
  // ============================================================

  richard_cafepedia: {
    title: 'Cafepedia to Revenue',
    input: 'A solo founder in Indonesia builds a cafe search engine and tries to monetize it',
    nodes: [
      { id: 1, type: 'state', label: 'Solo founder, product built, 0 revenue', x: 0, y: 200, prob: 100, desc: '764K places indexed, 3,386 enriched in Bandung. Product exists but has never been sold. Pattern: Trading, Perth Alert, Deal Engine -- all built, zero revenue.', source: 'Cafepedia internal (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 2, type: 'desire', label: 'Want first paying customer', x: 200, y: 200, prob: 100, desc: 'The first dollar is the hardest -- 90% of startups die before first revenue. Median time to first B2B SaaS sale: 6-12 months.', source: 'CB Insights 2024', sourceUrl: 'https://www.cbinsights.com/research/report/startup-failure-reasons-top/', sacredRoots: ['SR-009', 'SR-001'] },
      { id: 3, type: 'action', label: 'Define ICP: cafe owners in Bandung', x: 400, y: 200, prob: 100, desc: 'Ideal Customer Profile: independent cafe owners spending 0-500K IDR/mo on marketing. Bandung has 3,000+ cafes, ~1,500 active on Google Maps.', source: 'Google Maps data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 4, type: 'action', label: 'Build outreach list of 100 cafes', x: 600, y: 200, prob: 100, desc: 'Scrape Google Maps, Instagram, Grab/GoFood for contact info. B2B outreach requires 100+ contacts minimum for statistical learning.', source: 'HubSpot Sales 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.hubspot.com/state-of-marketing', sacredRoots: ['SR-008', 'SR-012'] },
      { id: 5, type: 'gate', label: 'Outreach method works?', x: 850, y: 200, prob: 25, desc: 'Cold email: 1-5% reply rate. Cold DM (Instagram/WhatsApp): 5-15% reply. In-person walk-in: 25-40% conversation rate. Indonesian SMBs trust face-to-face.', source: 'HubSpot 2025 + RAIN Group', sourceUrl: 'https://www.hubspot.com/state-of-marketing', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 20, type: 'state', label: 'Cold emails/DMs ignored', x: 850, y: 450, prob: 100, desc: 'B2B cold email avg open rate: 21.5%, reply rate 1-3%. Indonesian SMBs rarely check business email. WhatsApp is king but unsolicited messages get blocked.', source: 'Mailchimp 2025 + HubSpot', sourceUrl: 'https://mailchimp.com/resources/email-marketing-benchmarks/', sacredRoots: ['SR-010', 'SR-008'] },
      { id: 21, type: 'trajectory', label: 'Digital-only outreach path', x: 1050, y: 450, prob: 100, desc: 'Hiding behind a screen because face-to-face feels scary. Classic builder avoidance pattern.', source: 'Indie Hackers survey 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 22, type: 'action', label: 'Keep sending cold messages', x: 1250, y: 400, prob: 100, desc: 'Same approach, diminishing returns. Without personalization, B2B cold outreach decays to <0.5% after 3rd touchpoint.', source: 'Woodpecker 2024', sourceUrl: 'https://woodpecker.co/blog/cold-email-statistics/', sacredRoots: ['SR-010', 'SR-005'] },
      { id: 23, type: 'outcome-bad', label: 'Another project dies at $0', x: 1450, y: 400, prob: 100, desc: 'Pattern repeats: perfect product, zero clients. Trading, Perth Alert, Deal Engine -- all built, zero revenue.', source: 'Personal history (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 24, type: 'action', label: 'Pivot to content marketing', x: 1250, y: 510, prob: 100, desc: 'Write cafe reviews, build Instagram following, hope for organic inbound. Content marketing takes 6-12 months to generate leads for B2B.', source: 'Content Marketing Institute 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://contentmarketinginstitute.com/research/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 25, type: 'bottleneck', label: 'Content generates inbound leads?', x: 1450, y: 510, prob: 15, desc: 'Only 13% of B2B content marketers report strong lead generation in year 1.', source: 'Content Marketing Institute 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://contentmarketinginstitute.com/research/', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 26, type: 'outcome-bad', label: 'Nice content, still $0 revenue', x: 1650, y: 560, prob: 100, desc: 'Content without sales funnel = vanity metrics. Views and likes do not pay rent.', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-031'] },
      { id: 30, type: 'state', label: 'Some cafes reply "interesting" but do not pay', x: 850, y: -20, prob: 100, desc: 'Polite interest is not a sales pipeline. Indonesian business culture: saying "menarik" (interesting) is a soft no.', source: 'Local market (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-026'] },
      { id: 31, type: 'action', label: 'Offer free trial / pilot program', x: 1050, y: -20, prob: 100, desc: 'Free trial conversion in B2B SaaS: 15-25% (Totango 2024). For micro-SMBs in Indonesia, free-to-paid is even harder.', source: 'Totango 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.totango.com/resources', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 32, type: 'bottleneck', label: 'Free trial converts to paid?', x: 1250, y: -20, prob: 20, desc: 'Free trial to paid for micro-SaaS: 15-25% globally. For Indonesian SMBs with no SaaS culture: estimated 5-15%.', source: 'Totango 2024 + local estimate (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-031'] },
      { id: 33, type: 'outcome-bad', label: 'Free users who never pay', x: 1250, y: -150, prob: 100, desc: 'Classic trap: giving away value hoping for conversion. Without payment nudges, free users stay free forever.', source: 'SaaS metrics (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 34, type: 'state', label: 'First 1-3 paying cafes', x: 1450, y: -20, prob: 100, desc: 'Revenue: 1-3 x 300K IDR = 300K-900K IDR/mo ($19-56). Not sustainable, but proof of concept.', source: 'Revenue model (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 6, type: 'action', label: 'Walk into cafes and pitch in person', x: 1050, y: 200, prob: 100, desc: 'In-person B2B close rate: 25-40% vs 1-5% cold email (RAIN Group). Indonesian culture rewards face-to-face trust.', source: 'RAIN Group 2024', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-009', 'SR-026'] },
      { id: 7, type: 'state', label: 'Pitched 20 cafes in person', x: 1250, y: 200, prob: 100, desc: '20 in-person pitches at 30% close rate = 6 paying cafes. Takes 2-3 weeks of daily hustle.', source: 'Sales math (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-012'] },
      { id: 8, type: 'bottleneck', label: 'Cafe owner says yes and pays?', x: 1450, y: 200, prob: 35, desc: 'Indonesian SMBs: 300K IDR/mo ($19) is budget dust, but trust is everything. Owner must see value in 60 seconds.', source: 'Local market (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-026', 'SR-001'] },
      { id: 9, type: 'outcome-bad', label: 'Most say "nanti" -- polite rejection', x: 1450, y: 350, prob: 100, desc: '65% of Indonesian SMBs say no to first pitch. "Nanti ya" culture means rejection without confrontation.', source: 'Sales benchmark (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 40, type: 'state', label: '10 paying cafes: 3M IDR/mo ($188)', x: 1650, y: 200, prob: 100, desc: 'First real milestone: 10 cafes x 300K = 3M IDR/mo. Covers phone bill. Need 50+ for basic sustainability.', source: 'Revenue model (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 41, type: 'action', label: 'Systematize: referral program + WhatsApp group', x: 1850, y: 200, prob: 100, desc: 'Referral programs in SMB SaaS: 20-35% of new customers come from referrals (Extole 2024). WhatsApp group = community lock-in.', source: 'Extole 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.extole.com/resources/', sacredRoots: ['SR-025', 'SR-012'] },
      { id: 42, type: 'bottleneck', label: 'Reach 50 paying cafes?', x: 2100, y: 200, prob: 30, desc: '50 x 300K = 15M IDR/mo ($940). Most local SaaS plateau at 5-15 clients. Churn at micro-SMB level: 5-10%/mo.', source: 'SaaS benchmarks (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 43, type: 'outcome-bad', label: 'Stuck at 10-20 clients, churn eats growth', x: 2100, y: 400, prob: 100, desc: 'Monthly churn of 5-10% means losing 1-2 cafes per month. Must constantly replace. Treadmill, not business.', source: 'SaaS churn data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 44, type: 'action', label: 'Expand to Grab/GoFood integration + premium tier', x: 2300, y: 200, prob: 100, desc: 'Upsell: analytics dashboard, menu management, delivery integration. Premium tier: 500K-1M IDR/mo.', source: 'GoTo Financial 2024 (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-035'] },
      { id: 45, type: 'bottleneck', label: 'Scale to 200+ cafes and premium tier?', x: 2500, y: 200, prob: 20, desc: '200 cafes at blended 400K avg = 80M IDR/mo ($5,000). Real business. Requires hiring, support, product-market fit across cities.', source: 'Revenue target (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 46, type: 'outcome-good', label: 'Sustainable local SaaS: 200+ cafes, $5K/mo', x: 2700, y: 130, prob: 100, desc: '200+ cafes paying = real business. $5K/mo in Indonesia = top 1% income. Proof that the builder can also sell.', source: 'Revenue target (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 47, type: 'outcome-bad', label: 'Growth caps at 80-100 cafes', x: 2700, y: 300, prob: 100, desc: 'Bandung market saturated, no budget for Jakarta expansion. Revenue: 30-40M IDR/mo ($1,875-2,500).', source: 'Market analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-036'] },
      { id: 50, type: 'outcome-good', label: 'Pattern finally broken: builder who sells', x: 2700, y: 50, prob: 100, desc: 'First business with real revenue. Identity shift from "I build things" to "I build things people pay for".', source: 'Personal pattern (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 20, label: 'no (60-70%)' },
      { from: 5, to: 30, label: 'partial (15-20%)' },
      { from: 5, to: 6, label: 'yes (15-25%)' },
      { from: 20, to: 21 }, { from: 21, to: 22 }, { from: 22, to: 23 },
      { from: 21, to: 24 }, { from: 24, to: 25 },
      { from: 25, to: 26, label: 'fail' }, { from: 25, to: 34, label: 'pass' },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 34, label: 'pass' },
      { from: 6, to: 7 }, { from: 7, to: 8 },
      { from: 8, to: 9, label: 'fail' }, { from: 8, to: 40, label: 'pass' },
      { from: 34, to: 40 },
      { from: 40, to: 41 }, { from: 41, to: 42 },
      { from: 42, to: 43, label: 'fail' }, { from: 42, to: 44, label: 'pass' },
      { from: 44, to: 45 },
      { from: 45, to: 46, label: 'pass' }, { from: 45, to: 47, label: 'fail' },
      { from: 46, to: 50 },
    ]
  },

  richard_cafepediaMid: {
    title: 'Cafepedia to Revenue (Analysis)',
    input: 'A solo founder in Indonesia builds a cafe search engine and tries to monetize it',
    nodes: [
      { id: 1, type: 'state', label: 'Build the product (done)', x: 0, y: 120, prob: 100, desc: '764K places in DB, 3,386 enriched -- product exists', source: 'Cafepedia internal (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Get first 10 paying cafes', x: 260, y: 120, prob: 15, desc: 'B2B cold outreach: 1-5% conversion rate typical', source: 'HubSpot 2025', sourceUrl: 'https://www.hubspot.com/state-of-marketing', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Zero revenue -- again', x: 260, y: 320, prob: 100, desc: 'Pattern: perfect product, zero clients -- must break this cycle', source: 'Personal history (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 4, type: 'action', label: 'Walk into cafes, pitch in person', x: 520, y: 120, prob: 100, desc: 'In-person B2B close rate: 25-40% vs 1-5% cold email', source: 'RAIN Group', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-009', 'SR-012'] },
      { id: 5, type: 'bottleneck', label: 'Cafe owner says yes?', x: 780, y: 120, prob: 35, desc: 'Indonesian SMBs: 300K IDR/mo is budget dust, but trust is everything', source: 'Local market (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-026', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'Not interested / no budget', x: 780, y: 320, prob: 100, desc: '65% of SMBs say no to first pitch', source: 'Sales benchmark (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 7, type: 'bottleneck', label: 'Reach 50 paying cafes', x: 1040, y: 120, prob: 30, desc: '50 x 300K = 15M IDR/mo -- covers basic costs', source: 'Revenue model (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 8, type: 'outcome-bad', label: 'Stuck at 5-10 clients', x: 1040, y: 320, prob: 100, desc: 'Most local SaaS plateau early without sales system', source: 'Estimated (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-036'] },
      { id: 9, type: 'outcome-good', label: 'Sustainable local business', x: 1300, y: 60, prob: 100, desc: '200+ cafes = 60M IDR/mo -- real business', source: 'Revenue target (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 10, type: 'outcome-bad', label: 'Another project that dies', x: 1300, y: 280, prob: 100, desc: 'Trading, Perth Alert, Deal Engine -- all built, zero revenue', source: 'Personal pattern (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-006'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5 }, { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 9, label: 'pass' },
      { from: 7, to: 10, label: 'fail' },
    ]
  },

  richard_cafepediaMin: {
    title: 'Cafepedia to Revenue (Summary)',
    input: 'A solo founder in Indonesia builds a cafe search engine and tries to monetize it',
    nodes: [
      { id: 1, type: 'state', label: 'Product built, 764K places, $0 revenue', x: 0, y: 150, prob: 100, desc: 'Cafepedia exists -- full DB, enriched data, working product. Zero customers.', source: 'Cafepedia internal (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 2, type: 'bottleneck', label: 'Gets first paying cafe? (15%)', x: 300, y: 150, prob: 15, desc: 'B2B cold outreach: 1-5% conversion. In-person pitch: 25-40%. Must overcome builder avoidance of sales.', source: 'HubSpot 2025 + RAIN Group', sourceUrl: 'https://www.hubspot.com/state-of-marketing', sacredRoots: ['SR-010', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Zero revenue -- pattern repeats', x: 300, y: 350, prob: 100, desc: 'Trading, Perth Alert, Deal Engine, Cafepedia -- all built perfectly, all at $0', source: 'Personal pattern (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Reaches 50 paying cafes? (30%)', x: 600, y: 150, prob: 30, desc: '50 x 300K IDR = 15M/mo ($940). Most local SaaS plateau at 5-15 clients without sales system.', source: 'SaaS benchmarks (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-good', label: 'Sustainable business: 200+ cafes', x: 900, y: 100, prob: 100, desc: '200+ cafes = 60-80M IDR/mo ($3,750-5,000). Real local SaaS business. Pattern broken.', source: 'Revenue target (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-025'] },
      { id: 6, type: 'outcome-bad', label: 'Stuck at 10-20, churn eats growth', x: 900, y: 250, prob: 100, desc: '5-10% monthly churn at micro-SMB level. Must replace 1-2 cafes/month just to stay flat.', source: 'SaaS churn data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-036'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (85%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'pass' }, { from: 4, to: 6, label: 'fail' },
    ]
  },

  // ============================================================
  // MOVE ABROAD SOLO (ITALY TO ASIA)
  // ============================================================

  richard_move_abroad: {
    title: 'Move Abroad Solo (Italy to Asia)',
    input: 'An Italian moves alone to Southeast Asia to build a life',
    nodes: [
      { id: 1, type: 'state', label: '1000 Italians consider moving abroad', x: 0, y: 200, prob: 100, desc: '4.5M Italians live abroad (AIRE 2024). Italy had net negative migration of young adults (25-34) for 8th consecutive year. 130K+ left in 2023.', source: 'AIRE/ISTAT 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.esteri.it/it/servizi-consolari-e-visti/italiani-all-estero/aire_702/', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'desire', label: 'Want a different life -- escape stagnation', x: 200, y: 200, prob: 100, desc: 'Italy youth unemployment 22.3% (2024). Average net salary 25-34: EUR 1,200-1,500/mo.', source: 'ISTAT 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.istat.it/', sacredRoots: ['SR-007', 'SR-001'] },
      { id: 3, type: 'bottleneck', label: 'Actually buys one-way ticket?', x: 400, y: 200, prob: 12, desc: '88% of people who "want to move" never do (Gallup). Of those who leave Italy, only 8% go to Asia.', source: 'Gallup World Poll 2024 + AIRE', sourceUrl: 'https://www.gallup.com/analytics/318875/global-research.aspx', sacredRoots: ['SR-001', 'SR-008'] },
      { id: 4, type: 'action', label: 'Arrive alone in Southeast Asia', x: 600, y: 200, prob: 100, desc: 'First 30 days: tourist visa, temporary housing, culture shock. Indonesia B211A visa: 60 days, extendable.', source: 'Immigration data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-001', 'SR-009'] },
      { id: 5, type: 'gate', label: 'Handles first 90 days?', x: 850, y: 200, prob: 40, desc: 'First 90 days is the danger zone. 25% of expats return within 6 months (InterNations 2024).', source: 'InterNations Expat Insider 2024', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-001', 'SR-025'] },
      { id: 20, type: 'state', label: 'Overwhelmed: no friends, no structure', x: 850, y: 450, prob: 100, desc: 'Expat loneliness: 50% report feeling more isolated than home country. No family safety net.', source: 'InterNations 2024', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-007'] },
      { id: 21, type: 'trajectory', label: 'Tourist-mode expat trap', x: 1050, y: 450, prob: 100, desc: 'Spending savings, no routine, drinking with other expats. Burn rate: $1,500-2,500/mo doing nothing.', source: 'Digital nomad surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 22, type: 'outcome-bad', label: 'Money runs out, flies home defeated', x: 1250, y: 400, prob: 100, desc: '25% of expats return within 2 years. Many return to worse situation: no job, no savings.', source: 'InterNations 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 23, type: 'action', label: 'Isolate and doom-scroll', x: 1050, y: 530, prob: 100, desc: 'Without structure, default is screen time. Expats in isolation average 6+ hours/day on phone.', source: 'Expat mental health studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-014', 'SR-025'] },
      { id: 24, type: 'outcome-bad', label: 'Mental health crisis abroad', x: 1250, y: 530, prob: 100, desc: 'Expat depression rate: 25-30% (APA). Without local support network, escalates quickly.', source: 'APA expat studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-014', 'SR-007'] },
      { id: 30, type: 'state', label: 'Settled but no income, burning savings', x: 850, y: -20, prob: 100, desc: 'Found housing, learned basics, but cash is going out, nothing coming in. Average expat runway: 6-12 months.', source: 'HSBC Expat Survey 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 31, type: 'action', label: 'Take any job: teaching English, freelancing', x: 1050, y: -20, prob: 100, desc: 'English teaching in Indonesia: 8-15M IDR/mo ($500-940). Most expats default to teaching as survival income.', source: 'ESL job boards 2024 (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 32, type: 'bottleneck', label: 'Builds real income stream?', x: 1250, y: -20, prob: 30, desc: '70% of expats in developing countries struggle financially in first 2 years (HSBC).', source: 'HSBC Expat + Payoneer 2024', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 33, type: 'outcome-bad', label: 'Stuck in survival mode: $500-800/mo', x: 1250, y: -150, prob: 100, desc: 'Enough to exist in SEA, not enough to build. No savings, no investment, no growth.', source: 'Expat income data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 6, type: 'action', label: 'Build routine: gym, work, community', x: 1050, y: 200, prob: 100, desc: 'Structure is the antidote to expat drift. Successful expats report 3 pillars: physical routine, work schedule, social circle.', source: 'Expat success studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-008', 'SR-025'] },
      { id: 7, type: 'bottleneck', label: 'Earns $2K+/mo while abroad?', x: 1250, y: 200, prob: 30, desc: '$2K/mo in Indonesia = top 5% lifestyle. Geo-arbitrage: 1 USD = 16,000 IDR.', source: 'Numbeo + Payoneer 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 8, type: 'outcome-bad', label: 'Income unstable, always anxious', x: 1250, y: 350, prob: 100, desc: 'Inconsistent foreign income: some months $2K, some $400. Cannot plan, cannot commit.', source: 'Freelancer surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 40, type: 'state', label: 'Income stable, now need roots', x: 1450, y: 200, prob: 100, desc: 'Money solved, but still a foreigner. Integration requires: local language, local friends, long-term visa.', source: 'InterNations 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-016'] },
      { id: 41, type: 'action', label: 'Learn local language seriously', x: 1650, y: 200, prob: 100, desc: 'Bahasa Indonesia is one of easiest languages for Europeans (FSI Category I). Only 15% of expats learn beyond basics.', source: 'FSI + InterNations (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-016', 'SR-025'] },
      { id: 42, type: 'decision', label: 'Found real community + purpose?', x: 1850, y: 200, prob: 45, desc: 'Social integration is #1 predictor of expat success (InterNations). 55% of long-term expats who stay cite "found my people".', source: 'InterNations 2024', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-016'] },
      { id: 43, type: 'outcome-bad', label: 'Isolated: income but no belonging', x: 1850, y: 380, prob: 100, desc: 'Making money but no deep connections. Expat bubble: surface friendships that change every 6 months.', source: 'Expat studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-025', 'SR-007'] },
      { id: 44, type: 'bottleneck', label: 'Secures long-term visa/residency?', x: 2050, y: 200, prob: 40, desc: 'Indonesia KITAS requires sponsor. KITAP requires 5+ years + marriage or investment. Many live in perpetual visa-run cycle.', source: 'Indonesia immigration (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-001'] },
      { id: 45, type: 'outcome-bad', label: 'Perpetual visa tourist -- no legal stability', x: 2050, y: 380, prob: 100, desc: 'Visa runs every 60-180 days. Cannot own property, limited banking, always one policy change from deportation.', source: 'Expat forums (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-007'] },
      { id: 46, type: 'outcome-good', label: 'Built a real life abroad: income + roots + purpose', x: 2250, y: 130, prob: 100, desc: 'The 10-15% who truly make it: stable income, local integration, long-term visa, community.', source: 'Expat surveys (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-025', 'SR-001'] },
      { id: 47, type: 'outcome-bad', label: 'Comfortable but rootless: permanent tourist', x: 2250, y: 300, prob: 100, desc: 'Earning money, nice apartment, but no depth. Not Italian anymore, not Indonesian either. Identity limbo.', source: 'Third culture studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-016', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'fail (88%)' }, { from: 3, to: 4, label: 'pass (12%)' },
      { from: 4, to: 5 },
      { from: 5, to: 20, label: 'no (30%)' },
      { from: 5, to: 30, label: 'partial (30%)' },
      { from: 5, to: 6, label: 'yes (40%)' },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 21, to: 23 }, { from: 23, to: 24 },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 40, label: 'pass' },
      { from: 6, to: 7 },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 40, label: 'pass' },
      { from: 40, to: 41 }, { from: 41, to: 42 },
      { from: 42, to: 43, label: 'no' }, { from: 42, to: 44, label: 'yes' },
      { from: 44, to: 45, label: 'fail' }, { from: 44, to: 46, label: 'pass' },
      { from: 44, to: 47, label: 'fail' },
    ]
  },

  richard_move_abroadMid: {
    title: 'Move Abroad Solo (Italy to Asia) (Analysis)',
    input: 'An Italian moves alone to Southeast Asia to build a life',
    nodes: [
      { id: 1, type: 'desire', label: 'Want a different life', x: 0, y: 120, prob: 100, desc: '4.5M Italians live abroad, fastest-growing diaspora', source: 'AIRE 2025 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.esteri.it/it/servizi-consolari-e-visti/italiani-all-estero/aire_702/', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'bottleneck', label: 'Actually leave comfort zone', x: 260, y: 120, prob: 12, desc: '88% of people who "want to move" never do', source: 'Gallup World Poll', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-001', 'SR-008'] },
      { id: 3, type: 'outcome-bad', label: 'Still dreaming in 5 years', x: 260, y: 320, prob: 100, desc: 'Comfort zone wins for the majority', source: 'Behavioral economics (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 4, type: 'action', label: 'Land in new country, figure it out', x: 520, y: 120, prob: 100, desc: 'First 90 days: visa, housing, language, loneliness', source: 'Expat surveys (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-001', 'SR-009'] },
      { id: 5, type: 'bottleneck', label: 'Build income stream abroad', x: 780, y: 120, prob: 30, desc: '70% of expats struggle financially in first 2 years', source: 'HSBC Expat Survey', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 6, type: 'outcome-bad', label: 'Forced to go back home', x: 780, y: 320, prob: 100, desc: '25% of expats return within 2 years', source: 'InterNations 2025', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-007', 'SR-031'] },
      { id: 7, type: 'decision', label: 'Found community + purpose?', x: 1040, y: 120, prob: 45, desc: 'Social integration is #1 predictor of expat success', source: 'InterNations', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-016'] },
      { id: 8, type: 'outcome-good', label: 'Built a real life abroad', x: 1300, y: 60, prob: 100, desc: 'The 15% who make it call it the best decision ever', source: 'Expat surveys (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-025', 'SR-001'] },
      { id: 9, type: 'outcome-bad', label: 'Isolated and stuck', x: 1300, y: 280, prob: 100, desc: 'Expat loneliness: 50% report feeling more alone than back home', source: 'InterNations 2025', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5 }, { from: 5, to: 6, label: 'fail' }, { from: 5, to: 7, label: 'pass' },
      { from: 7, to: 8, label: 'yes' }, { from: 7, to: 9, label: 'no' },
    ]
  },

  richard_move_abroadMin: {
    title: 'Move Abroad Solo (Italy to Asia) (Summary)',
    input: 'An Italian moves alone to Southeast Asia to build a life',
    nodes: [
      { id: 1, type: 'desire', label: 'Want a different life (4.5M Italians abroad)', x: 0, y: 150, prob: 100, desc: 'Italy youth unemployment 22.3%. 130K+ young Italians left in 2023.', source: 'AIRE/ISTAT 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.esteri.it/it/servizi-consolari-e-visti/italiani-all-estero/aire_702/', sacredRoots: ['SR-007', 'SR-005'] },
      { id: 2, type: 'bottleneck', label: 'Actually leaves? (12%)', x: 300, y: 150, prob: 12, desc: '88% who "want to move" never do. Comfort zone, family ties, fear of unknown.', source: 'Gallup World Poll 2024', sourceUrl: 'https://www.gallup.com/analytics/318875/global-research.aspx', sacredRoots: ['SR-001', 'SR-008'] },
      { id: 3, type: 'outcome-bad', label: 'Still dreaming in 5 years', x: 300, y: 350, prob: 100, desc: '88% stay. Comfort zone wins.', source: 'Behavioral economics (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-001'] },
      { id: 4, type: 'bottleneck', label: 'Builds stable income abroad? (30%)', x: 600, y: 150, prob: 30, desc: '70% of expats struggle financially first 2 years. 25% return home.', source: 'HSBC Expat Survey 2024', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-good', label: 'Real life abroad: income + roots', x: 900, y: 100, prob: 100, desc: 'The 10-15% who truly integrate: stable income, local language, community, long-term visa.', source: 'InterNations 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-001'] },
      { id: 6, type: 'outcome-bad', label: 'Returns home or stays isolated', x: 900, y: 250, prob: 100, desc: '25% return defeated. Others stay but never integrate -- permanent tourists with no roots.', source: 'InterNations 2024', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-025', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (88%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'pass' }, { from: 4, to: 6, label: 'fail' },
    ]
  },

  // ============================================================
  // INTERFAITH RELATIONSHIP
  // ============================================================

  richard_interfaith: {
    title: 'Interfaith Relationship',
    input: 'A Christian man and a Muslim woman try to build a future together',
    nodes: [
      { id: 1, type: 'state', label: 'Christian man meets Muslim woman in Indonesia', x: 0, y: 200, prob: 100, desc: 'Indonesia: 87% Muslim, 10% Christian. Marriage Law No. 1/1974 requires same-religion marriage.', source: 'BPS Indonesia 2024 + Marriage Law', sourceUrl: 'https://www.bps.go.id/', sacredRoots: ['SR-020', 'SR-001'] },
      { id: 2, type: 'state', label: 'Deep connection forms across faith lines', x: 200, y: 200, prob: 100, desc: 'Interfaith couples in Indonesia estimated at 2-5% of all couples. Higher in urban areas.', source: 'Pew Research 2024 + local estimates (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-020', 'SR-026'] },
      { id: 3, type: 'gate', label: 'Family finds out -- reaction?', x: 450, y: 200, prob: 40, desc: '60% of interfaith couples in collectivist cultures face initial family opposition (ISSP).', source: 'ISSP 2024 + Pew (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://issp.org/', sacredRoots: ['SR-025', 'SR-030'] },
      { id: 20, type: 'state', label: 'Family threatens disownment', x: 450, y: 450, prob: 100, desc: 'In Indonesian Muslim families, marrying a non-Muslim can trigger: financial cutoff, social shaming, community exclusion.', source: 'Indonesian social studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-025', 'SR-003'] },
      { id: 21, type: 'decision', label: 'Choose partner or family?', x: 650, y: 450, prob: 30, desc: 'In collectivist cultures, choosing partner over family is extremely rare. 70%+ of couples break up under sustained family pressure.', source: 'Cross-cultural relationship studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-026', 'SR-025'] },
      { id: 22, type: 'outcome-bad', label: 'Couple separates under pressure', x: 650, y: 600, prob: 100, desc: 'Family pressure breaks 50%+ of interfaith couples in Indonesia.', source: 'Relationship studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-025', 'SR-007'] },
      { id: 23, type: 'state', label: 'Stay together despite family opposition', x: 850, y: 450, prob: 100, desc: 'Rare but real. Must build independent support system. Financial independence becomes critical.', source: 'Interfaith couple studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-001', 'SR-026'] },
      { id: 30, type: 'state', label: 'Family tolerates but disapproves', x: 450, y: -20, prob: 100, desc: '"Terserah kamu" (up to you) = passive disapproval in Indonesian culture. Tension at every family gathering.', source: 'Indonesian cultural norms (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-025', 'SR-030'] },
      { id: 31, type: 'trajectory', label: 'Walk on eggshells path', x: 650, y: -20, prob: 100, desc: 'Every holiday, every family event is navigating two worlds. Children question amplifies tension.', source: 'Interfaith family studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-030', 'SR-020'] },
      { id: 4, type: 'state', label: 'Family gives conditional acceptance', x: 650, y: 200, prob: 100, desc: 'Conditions often include: one must convert, children must follow one religion, specific wedding ceremony.', source: 'Indonesian marriage practice (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-025'] },
      { id: 5, type: 'decision', label: 'Navigate legal marriage requirements?', x: 850, y: 200, prob: 50, desc: 'Indonesia Marriage Law requires same religion on KTP. Options: convert, marry abroad (Singapore), civil union.', source: 'Indonesian Marriage Law No. 1/1974 (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-017'] },
      { id: 6, type: 'outcome-bad', label: 'Legal barriers block marriage', x: 850, y: 380, prob: 100, desc: 'Cannot marry legally in Indonesia without religious conversion. Singapore wedding costs $2,000-5,000.', source: 'Legal practice (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-021'] },
      { id: 40, type: 'action', label: 'Married -- now build shared life', x: 1050, y: 200, prob: 100, desc: 'Legal marriage secured. Now: daily life as interfaith couple. Whose holidays? Whose prayers? Whose food rules?', source: 'Gottman Institute (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-026', 'SR-020'] },
      { id: 41, type: 'bottleneck', label: 'Maintain mutual respect for 5+ years?', x: 1250, y: 200, prob: 55, desc: 'Interfaith marriages that survive 10+ years: ~55% (Pew Research 2024). Key: neither tries to convert the other.', source: 'Pew Research 2024', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-030', 'SR-020'] },
      { id: 42, type: 'outcome-bad', label: 'Values diverge -- resentment builds', x: 1250, y: 380, prob: 100, desc: 'Over time, small compromises feel like betrayals. The gap widens.', source: 'Marriage therapy data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-026', 'SR-001'] },
      { id: 43, type: 'decision', label: 'Children: what religion?', x: 1450, y: 200, prob: 40, desc: 'Indonesia requires religion on birth certificate. "Both" is not an option legally. 65% of interfaith divorces cite this as trigger.', source: 'Family law practice (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-020', 'SR-003'] },
      { id: 44, type: 'outcome-bad', label: 'Children question tears couple apart', x: 1450, y: 380, prob: 100, desc: 'Each parent wants to pass their faith. Grandparents intensify pressure. Children caught in the middle.', source: 'Interfaith family studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-020', 'SR-025'] },
      { id: 45, type: 'outcome-good', label: 'Beautiful bridge between worlds', x: 1650, y: 130, prob: 100, desc: 'Successful interfaith couples report higher empathy, resilience, and cultural intelligence.', source: 'Gottman Institute + Pew (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-020', 'SR-029'] },
      { id: 46, type: 'outcome-bad', label: 'Divorce after 5-10 years', x: 1650, y: 300, prob: 100, desc: 'Interfaith divorce rate ~45% (vs ~35% same-faith). Most common window: 5-10 years.', source: 'Pew Research 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-026', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'no (35%)' },
      { from: 3, to: 30, label: 'partial (25%)' },
      { from: 3, to: 4, label: 'yes (40%)' },
      { from: 20, to: 21 },
      { from: 21, to: 22, label: 'no' }, { from: 21, to: 23, label: 'yes' },
      { from: 23, to: 40 },
      { from: 30, to: 31 }, { from: 31, to: 5 },
      { from: 4, to: 5 },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 40, label: 'yes' },
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'fail' }, { from: 41, to: 43, label: 'pass' },
      { from: 43, to: 44, label: 'no' }, { from: 43, to: 45, label: 'yes' },
      { from: 43, to: 46, label: 'no' },
    ]
  },

  richard_interfaithMid: {
    title: 'Interfaith Relationship (Analysis)',
    input: 'A Christian man and a Muslim woman try to build a future together',
    nodes: [
      { id: 1, type: 'state', label: 'Fall in love across faiths', x: 0, y: 120, prob: 100, desc: 'Interfaith couples: 21% of marriages in Indonesia', source: 'Pew Research 2025', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-020', 'SR-001'] },
      { id: 2, type: 'bottleneck', label: 'Family acceptance?', x: 260, y: 120, prob: 40, desc: '60% of interfaith couples face family opposition initially', source: 'ISSP data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://issp.org/', sacredRoots: ['SR-025', 'SR-030'] },
      { id: 3, type: 'outcome-bad', label: 'Family says no, pressure wins', x: 260, y: 320, prob: 100, desc: 'In collectivist cultures, family pressure breaks 50%+ of couples', source: 'Cross-cultural studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-025', 'SR-003'] },
      { id: 4, type: 'decision', label: 'Navigate legal/religious requirements', x: 520, y: 120, prob: 50, desc: 'Indonesia requires same-religion marriage -- legal complexity', source: 'Indonesian Marriage Law (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-017'] },
      { id: 5, type: 'outcome-bad', label: 'Legal barriers too high', x: 520, y: 320, prob: 100, desc: 'Many couples marry abroad to bypass local law', source: 'Legal practice (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-003', 'SR-021'] },
      { id: 6, type: 'bottleneck', label: 'Sustain mutual respect long-term', x: 780, y: 120, prob: 55, desc: 'Interfaith marriages that survive 10+ years: ~55%', source: 'Pew Research', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-030', 'SR-020'] },
      { id: 7, type: 'outcome-bad', label: 'Values diverge over time', x: 780, y: 320, prob: 100, desc: 'Children, holidays, identity -- the pressure compounds', source: 'Marriage studies (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-026', 'SR-001'] },
      { id: 8, type: 'outcome-good', label: 'Beautiful bridge between worlds', x: 1040, y: 60, prob: 100, desc: 'Successful interfaith couples report higher empathy and resilience', source: 'Gottman Institute (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-020', 'SR-029'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 6, label: 'yes' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },

  richard_interfaithMin: {
    title: 'Interfaith Relationship (Summary)',
    input: 'A Christian man and a Muslim woman try to build a future together',
    nodes: [
      { id: 1, type: 'state', label: 'Christian + Muslim couple in Indonesia', x: 0, y: 150, prob: 100, desc: 'Indonesia: 87% Muslim, 10% Christian. Marriage Law requires same religion.', source: 'BPS Indonesia 2024 + Pew Research', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-020', 'SR-001'] },
      { id: 2, type: 'bottleneck', label: 'Family accepts? (40%)', x: 300, y: 150, prob: 40, desc: '60% face initial opposition. In Indonesian Muslim families, marrying non-Muslim can trigger disownment.', source: 'ISSP 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://issp.org/', sacredRoots: ['SR-025', 'SR-030'] },
      { id: 3, type: 'outcome-bad', label: 'Family pressure wins, couple separates', x: 300, y: 350, prob: 100, desc: 'Family pressure breaks 50%+ of interfaith couples in collectivist cultures.', source: 'Cross-cultural studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-025', 'SR-003'] },
      { id: 4, type: 'bottleneck', label: 'Survives 10+ years? (55%)', x: 600, y: 150, prob: 55, desc: 'Interfaith marriages 10+ year survival: ~55%. Children religion is the #1 breaking point.', source: 'Pew Research 2024', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-030', 'SR-020'] },
      { id: 5, type: 'outcome-good', label: 'Beautiful bridge between worlds', x: 900, y: 100, prob: 100, desc: 'Higher empathy, resilience, cultural intelligence.', source: 'Gottman Institute (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-020', 'SR-029'] },
      { id: 6, type: 'outcome-bad', label: 'Values diverge, divorce after 5-10 years', x: 900, y: 250, prob: 100, desc: 'Interfaith divorce rate ~45% vs ~35% same-faith.', source: 'Pew Research 2024 (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-026', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (60%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'pass' }, { from: 4, to: 6, label: 'fail' },
    ]
  },

  // ============================================================
  // BREAK THE "BUILD BUT NEVER SELL" PATTERN
  // ============================================================

  richard_break_pattern: {
    title: 'Break the "Build but Never Sell" Pattern',
    input: 'Someone who always builds perfect products but never makes money from them',
    nodes: [
      { id: 1, type: 'state', label: '1000 technical founders have an idea', x: 0, y: 200, prob: 100, desc: '90% of entrepreneurs are addicted to the building phase. Technical founders spend avg 80% time building, 20% on distribution.', source: 'First Round Review 2024 + GEM Report', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 2, type: 'action', label: 'Research obsessively, plan perfectly', x: 200, y: 200, prob: 100, desc: 'Analysis paralysis: avg technical founder spends 6 months planning before writing code.', source: 'GEM Report 2024', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-014', 'SR-017'] },
      { id: 3, type: 'action', label: 'Build an impressive product', x: 400, y: 200, prob: 100, desc: 'Average solo developer spends 4-8 months building before showing anyone. 95% of pre-launch features are never used.', source: 'Pendo 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.pendo.io/resources/', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 4, type: 'state', label: 'Product is "ready" -- now what?', x: 600, y: 200, prob: 100, desc: 'The terrifying moment: building is over, selling must begin. This is where 80% of builder-founders freeze.', source: 'Indie Hackers 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 5, type: 'gate', label: 'Starts real sales outreach?', x: 850, y: 200, prob: 20, desc: 'Only 20% of builder-founders ever do real sales outreach (cold calls, door knocking, direct pitches).', source: 'Indie Hackers survey 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 20, type: 'state', label: 'Refuses to sell -- adds more features instead', x: 850, y: 450, prob: 100, desc: 'Classic avoidance: "I need to add X feature first." Feature creep is emotional armor against rejection.', source: 'Product psychology (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-014'] },
      { id: 21, type: 'trajectory', label: 'Perpetual builder path', x: 1050, y: 450, prob: 100, desc: 'Build, polish, add features, rebuild, never launch. The hamster wheel of perfectionism.', source: 'Maker psychology (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-009'] },
      { id: 22, type: 'action', label: 'Launch on Product Hunt / Hacker News', x: 1250, y: 400, prob: 100, desc: 'Passive launch: post and hope. PH avg: 500 visits, 2% signup, 0.1% paid. Not a sales strategy.', source: 'Product Hunt data 2024 (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 23, type: 'outcome-bad', label: 'Beautiful product, zero paying users', x: 1450, y: 400, prob: 100, desc: 'The graveyard of perfect products nobody uses. 95% of indie products generate <$100 lifetime revenue.', source: 'Indie Hackers data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 24, type: 'action', label: 'Start new project (the cycle restarts)', x: 1250, y: 520, prob: 100, desc: 'Abandon current project, excited by new idea. Average serial builder: 5-10 abandoned projects.', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-008'] },
      { id: 25, type: 'outcome-bad', label: 'Portfolio of dead projects, $0 total revenue', x: 1450, y: 520, prob: 100, desc: 'Trading, Perth Alert, Deal Engine, Cafepedia -- all built, zero revenue. The pattern is the enemy.', source: 'Personal history (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 30, type: 'state', label: 'Sends DMs, gets polite rejections', x: 850, y: -20, prob: 100, desc: '"Interesting!" "Love it!" -- none of these are sales. Polite interest is the cruelest form of rejection.', source: 'Sales psychology (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-009'] },
      { id: 31, type: 'trajectory', label: 'Soft-sell path: pitch without closing', x: 1050, y: -20, prob: 100, desc: 'Describes the product instead of asking for money. Never says "here is the payment link."', source: 'RAIN Group 2024', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 32, type: 'bottleneck', label: 'Learns to ask for money directly?', x: 1250, y: -20, prob: 25, desc: 'Only 25% of soft-sellers ever learn to close. Most quit after 10-20 rejections.', source: 'Sales training data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 33, type: 'outcome-bad', label: 'Stuck in pitch-rejection loop forever', x: 1250, y: -150, prob: 100, desc: 'Pitching the same way, getting the same result, wondering if the product is the problem (it is not).', source: 'RAIN Group (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 6, type: 'action', label: 'Cold call/walk-in/direct pitch 50 prospects', x: 1050, y: 200, prob: 100, desc: 'Real sales requires 50+ "no" before patterns emerge. Average B2B close rate: 20% warm, 1-5% cold.', source: 'RAIN Group 2024', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 7, type: 'bottleneck', label: 'Handles rejection without quitting?', x: 1250, y: 200, prob: 35, desc: '65% of salespeople give up after 5 contacts. But 80% of sales require 5+ follow-ups.', source: 'Marketing Donut 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.marketingdonut.co.uk/', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 8, type: 'outcome-bad', label: 'Quits after 10 rejections -- back to building', x: 1250, y: 380, prob: 100, desc: 'Rejection feels personal. Returns to the safety of code.', source: 'Psychology of rejection (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 40, type: 'state', label: 'First paying customer', x: 1450, y: 200, prob: 100, desc: 'The first dollar changes everything. Proof: someone values this enough to pay.', source: 'YC wisdom (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 41, type: 'action', label: 'Document what worked, repeat it', x: 1650, y: 200, prob: 100, desc: 'First sale = first data point. What channel? What pitch? Systemize the sales motion.', source: 'Sales process (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 42, type: 'bottleneck', label: 'Reaches 10 paying customers?', x: 1850, y: 200, prob: 40, desc: '1 to 10 customers: product-market fit validation. If 10 people pay, you have a business.', source: 'YC + First Round (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 43, type: 'outcome-bad', label: 'First sale was a fluke -- cannot repeat', x: 1850, y: 380, prob: 100, desc: 'One customer is luck. Repeatable sales is a system.', source: 'SaaS data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-012'] },
      { id: 44, type: 'decision', label: 'Keep selling or go back to building?', x: 2050, y: 200, prob: 50, desc: 'The critical fork. With 10 customers, the temptation is to "improve the product" instead of getting to 50.', source: 'Founder psychology (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-012'] },
      { id: 45, type: 'outcome-bad', label: 'Goes back to building -- revenue flatlines', x: 2050, y: 380, prob: 100, desc: 'Classic builder trap: 10 customers then rebuilds the entire product. Revenue: $500/mo forever.', source: 'Indie Hackers pattern (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-009'] },
      { id: 46, type: 'outcome-good', label: 'Pattern broken: builder who sells = unstoppable', x: 2250, y: 130, prob: 100, desc: 'A technical founder who can also sell is the rarest and most valuable combination.', source: 'First Round Review (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 47, type: 'outcome-bad', label: 'Moderate success but never scales past $2K/mo', x: 2250, y: 300, prob: 100, desc: 'Can sell but cannot scale. Solo founder ceiling: $1-3K/mo without hiring or automating sales.', source: 'Indie Hackers data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-036', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      { from: 5, to: 20, label: 'no (55%)' },
      { from: 5, to: 30, label: 'partial (25%)' },
      { from: 5, to: 6, label: 'yes (20%)' },
      { from: 20, to: 21 }, { from: 21, to: 22 }, { from: 22, to: 23 },
      { from: 21, to: 24 }, { from: 24, to: 25 },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 40, label: 'pass' },
      { from: 6, to: 7 },
      { from: 7, to: 8, label: 'fail' }, { from: 7, to: 40, label: 'pass' },
      { from: 40, to: 41 }, { from: 41, to: 42 },
      { from: 42, to: 43, label: 'fail' }, { from: 42, to: 44, label: 'pass' },
      { from: 44, to: 45, label: 'no' }, { from: 44, to: 46, label: 'yes' },
      { from: 44, to: 47, label: 'no' },
    ]
  },

  richard_break_patternMid: {
    title: 'Break the "Build but Never Sell" Pattern (Analysis)',
    input: 'Someone who always builds perfect products but never makes money from them',
    nodes: [
      { id: 1, type: 'state', label: 'New idea excites you', x: 0, y: 120, prob: 100, desc: '90% of entrepreneurs are addicted to the building phase', source: 'Behavioral research (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 2, type: 'action', label: 'Research obsessively, plan perfectly', x: 260, y: 120, prob: 100, desc: 'Analysis paralysis: avg entrepreneur spends 6 months planning', source: 'GEM Report', sourceUrl: 'https://www.gemconsortium.org/reports/latest-global-report', sacredRoots: ['SR-014', 'SR-017'] },
      { id: 3, type: 'action', label: 'Build an impressive product', x: 520, y: 120, prob: 100, desc: 'Technical founders spend 80% time building, 20% selling', source: 'First Round Review', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 4, type: 'gate', label: 'Start selling? (the hard part)', x: 780, y: 120, prob: 20, desc: 'Only 20% of builders ever do real sales outreach', source: 'Indie Hackers survey', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 5, type: 'outcome-bad', label: 'Beautiful product, zero clients', x: 780, y: 320, prob: 100, desc: 'The graveyard of perfect products nobody uses', source: 'Pattern recognition (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 9, type: 'state', label: 'Made pitches, polite rejections, no revenue', x: 780, y: 270, prob: 100, desc: 'Sending DMs, getting "interesting!" replies, but no one pulls out their wallet', source: 'Indie Hackers survey', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-010', 'SR-009'] },
      { id: 10, type: 'bottleneck', label: 'Closes a real deal?', x: 1040, y: 270, prob: 20, desc: 'Polite interest is not sales pipeline -- most builders never learn to close', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-001', 'SR-010'] },
      { id: 11, type: 'outcome-bad', label: 'Stuck in pitch-rejection loop', x: 1040, y: 420, prob: 100, desc: 'Pitching the same way, getting the same result', source: 'RAIN Group', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 6, type: 'bottleneck', label: 'Handle rejection daily', x: 1040, y: 120, prob: 35, desc: 'Sales requires 50+ "no" before patterns emerge', source: 'RAIN Group', sourceUrl: 'https://www.raingroup.com/resources/', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 7, type: 'outcome-bad', label: 'Quit after 10 rejections', x: 1040, y: 320, prob: 100, desc: '65% of salespeople give up after 5 contacts', source: 'Marketing Donut (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.marketingdonut.co.uk/', sacredRoots: ['SR-010', 'SR-007'] },
      { id: 8, type: 'outcome-good', label: 'First revenue -- pattern broken', x: 1300, y: 60, prob: 100, desc: 'The first dollar is the hardest -- then compounding kicks in', source: 'YC wisdom (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 9, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 9, to: 10 }, { from: 10, to: 6, label: 'pass' }, { from: 10, to: 11, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },

  richard_break_patternMin: {
    title: 'Break the "Build but Never Sell" Pattern (Summary)',
    input: 'Someone who always builds perfect products but never makes money from them',
    nodes: [
      { id: 1, type: 'state', label: 'Builder with perfect product, $0 revenue', x: 0, y: 150, prob: 100, desc: '90% of technical founders are addicted to building. 80% of time on product, 20% on distribution.', source: 'First Round Review 2024 + GEM', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-008', 'SR-011'] },
      { id: 2, type: 'bottleneck', label: 'Starts real sales outreach? (20%)', x: 300, y: 150, prob: 20, desc: 'Only 20% of builders ever do real sales (cold calls, door knocking).', source: 'Indie Hackers 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 3, type: 'outcome-bad', label: 'Beautiful product, zero clients -- pattern repeats', x: 300, y: 350, prob: 100, desc: '80% never sell. Start new project instead.', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Survives 50+ rejections? (35%)', x: 600, y: 150, prob: 35, desc: '65% quit after 5 contacts. But 80% of sales require 5+ follow-ups.', source: 'Marketing Donut + RAIN Group (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-010'] },
      { id: 5, type: 'outcome-good', label: 'First revenue -- pattern broken forever', x: 900, y: 100, prob: 100, desc: 'The first dollar changes everything. Builder who can sell = rarest, most valuable founder type.', source: 'YC wisdom (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-005', 'SR-012'] },
      { id: 6, type: 'outcome-bad', label: 'Quits after rejections, back to building', x: 900, y: 250, prob: 100, desc: 'Rejection feels personal. Returns to the safety of code. Revenue: $0 forever.', source: 'Sales psychology (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-010', 'SR-007'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (80%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'pass' }, { from: 4, to: 6, label: 'fail' },
    ]
  },

  // ============================================================
  // PATH TO FIRST $100K FROM INDONESIA
  // ============================================================

  richard_first_million: {
    title: 'Path to First $100K from Indonesia',
    input: 'A young entrepreneur in Indonesia tries to reach $100K in savings',
    nodes: [
      { id: 1, type: 'state', label: '1000 young foreigners in Indonesia want financial freedom', x: 0, y: 200, prob: 100, desc: 'Indonesia avg salary: $300-500/mo (BPS 2024). Foreign digital nomads: estimated 50,000+ in Bali/Jakarta/Bandung.', source: 'BPS Indonesia 2024 (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-007'] },
      { id: 2, type: 'desire', label: 'Want $100K saved -- true freedom in Indonesia', x: 200, y: 200, prob: 100, desc: '$100K = 1.6B IDR = 5+ years of runway. At $5K/mo saving $3K, takes ~3 years. At $2K/mo saving $1K, takes 8+ years.', source: 'Financial planning (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'decision', label: 'Earn in USD, spend in IDR?', x: 400, y: 200, prob: 60, desc: 'Geo-arbitrage: 1 USD = 16,000 IDR (2024). $2K/mo in Bandung = top 5% lifestyle. Local salary: max $625-1,250.', source: 'Exchange rate + Numbeo 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 4, type: 'gate', label: 'Income channel established?', x: 650, y: 200, prob: 25, desc: '3 paths: freelancing (Upwork/Fiverr), remote job (LinkedIn), own product (SaaS/content).', source: 'Payoneer 2024 + remote work data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 20, type: 'state', label: 'Cannot find USD income source', x: 650, y: 450, prob: 100, desc: 'No marketable skill for remote work. No portfolio. No network. Stuck competing with local salaries.', source: 'Payoneer 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 21, type: 'trajectory', label: 'Local salary trap', x: 850, y: 450, prob: 100, desc: 'Best local salary: English teaching 8-15M IDR ($500-940). $100K would take 15+ years at max savings rate.', source: 'ESL job data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 22, type: 'outcome-bad', label: 'Comfortable poverty: surviving, not building', x: 1050, y: 450, prob: 100, desc: 'Enough to live in Indonesia, never enough to save. One medical bill away from crisis.', source: 'Financial data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-014'] },
      { id: 30, type: 'state', label: 'Making $1-1.5K/mo but inconsistent', x: 650, y: -20, prob: 100, desc: 'Some months $1.5K, some $400. 75% of remote workers from developing countries earn <$1K/mo (Payoneer).', source: 'Payoneer 2024', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 31, type: 'action', label: 'Build systems: retainers, recurring clients', x: 850, y: -20, prob: 100, desc: 'Shift from one-off gigs to monthly retainers. 30% of successful freelancers have 2+ retainer clients.', source: 'Freelancer surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 32, type: 'bottleneck', label: 'Stabilizes at $2K+/mo?', x: 1050, y: -20, prob: 20, desc: 'Going from inconsistent $1K to stable $2K requires: niche positioning, retainer clients, or productized service.', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 33, type: 'outcome-bad', label: 'Forever in $1K/mo limbo', x: 1050, y: -150, prob: 100, desc: 'Not poor enough to panic, not rich enough to breathe. The invisible trap.', source: 'Digital nomad surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 5, type: 'state', label: 'Stable $2K+/mo income from abroad', x: 850, y: 200, prob: 100, desc: '$2K/mo = 32M IDR. In Bandung: 12M costs. Potential savings: 20M/mo ($1,250). But lifestyle inflation is the enemy.', source: 'Cost of living Bandung (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 6, type: 'bottleneck', label: 'Scales to $5K+/mo?', x: 1050, y: 200, prob: 30, desc: 'Only 4% of online businesses reach $5K/mo (Indie Hackers). Need: premium positioning, automation, or team.', source: 'Indie Hackers 2024', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 7, type: 'outcome-bad', label: 'Plateau at $2-3K/mo -- lifestyle trap', x: 1050, y: 380, prob: 100, desc: 'Comfortable in Bandung but not building wealth. The golden cage.', source: 'Digital nomad surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-014'] },
      { id: 40, type: 'state', label: 'Earning $5K+/mo in Indonesia', x: 1250, y: 200, prob: 100, desc: '$5K/mo = 80M IDR. Top 1% income. Potential savings: 60M+/mo ($3,750). $100K in ~2.2 years.', source: 'Financial math (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 41, type: 'decision', label: 'Save 50%+ consistently?', x: 1450, y: 200, prob: 40, desc: 'At $5K/mo, saving $3K = $100K in ~33 months. But lifestyle inflation is real.', source: 'Behavioral finance (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 42, type: 'outcome-bad', label: 'Lifestyle inflation eats savings', x: 1450, y: 380, prob: 100, desc: 'Earning $5K but spending $4.5K. $100K would take 16+ years.', source: 'Behavioral finance (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-011'] },
      { id: 43, type: 'action', label: 'Automate savings: 50% to separate account on payday', x: 1650, y: 200, prob: 100, desc: 'Pay yourself first. Automated transfers. Separate account (Wise, Interactive Brokers). Never touch it.', source: 'Financial planning (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-017'] },
      { id: 44, type: 'bottleneck', label: 'Maintains discipline for 2-3 years?', x: 1850, y: 200, prob: 35, desc: 'Only 30-40% of high earners maintain >40% savings rate for 2+ years. Life events derail most.', source: 'Financial behavior studies (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 45, type: 'outcome-bad', label: 'Emergency wipes savings at $40-60K', x: 1850, y: 380, prob: 100, desc: 'Medical emergency, family obligation, market crash. One event can erase 1-2 years of savings.', source: 'Financial risk data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-007'] },
      { id: 46, type: 'outcome-good', label: '$100K saved -- financial freedom in Indonesia', x: 2050, y: 130, prob: 100, desc: '$100K = 1.6B IDR. 5+ years of runway. Invest at 10% = $10K/yr passive. The game changes forever.', source: 'Financial planning (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 47, type: 'outcome-bad', label: 'Earns well but never reaches $100K', x: 2050, y: 300, prob: 100, desc: 'Income $3-5K/mo, savings $500-1K/mo. $100K in 8-15 years. Comfortable but never truly free.', source: 'Financial data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 20, label: 'no (40%)' }, { from: 3, to: 4, label: 'yes (60%)' },
      { from: 4, to: 20, label: 'no (40%)' },
      { from: 4, to: 30, label: 'partial (35%)' },
      { from: 4, to: 5, label: 'yes (25%)' },
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 5, label: 'pass' },
      { from: 5, to: 6 },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 40, label: 'pass' },
      { from: 40, to: 41 },
      { from: 41, to: 42, label: 'no' }, { from: 41, to: 43, label: 'yes' },
      { from: 43, to: 44 },
      { from: 44, to: 45, label: 'fail' }, { from: 44, to: 46, label: 'pass' },
      { from: 44, to: 47, label: 'fail' },
    ]
  },

  richard_first_millionMid: {
    title: 'Path to First $100K from Indonesia (Analysis)',
    input: 'A young entrepreneur in Indonesia tries to reach $100K in savings',
    nodes: [
      { id: 1, type: 'state', label: 'Start from near-zero in a low-cost country', x: 0, y: 120, prob: 100, desc: 'Indonesia avg salary: $300-500/mo -- need leverage', source: 'BPS 2025', sacredRoots: ['SR-009', 'SR-007'] },
      { id: 2, type: 'decision', label: 'Earn in USD, spend in IDR?', x: 260, y: 120, prob: 60, desc: 'Geo-arbitrage: 1 USD = 16,000 IDR -- 5-10x purchasing power', source: 'Exchange rate (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-017', 'SR-031'] },
      { id: 3, type: 'outcome-bad', label: 'Stuck in local salary trap', x: 260, y: 320, prob: 100, desc: 'Local salary max for most: 10-20M IDR/mo ($625-1250)', source: 'Glassdoor ID', sourceUrl: 'https://www.glassdoor.com/research/', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 4, type: 'gate', label: 'Build $2K/mo income stream', x: 520, y: 120, prob: 25, desc: '$2K/mo from Indonesia = top 5% lifestyle', source: 'Cost of living data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Inconsistent gig income', x: 520, y: 320, prob: 100, desc: '75% of remote workers from developing countries earn <$1K/mo', source: 'Payoneer 2025', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 11, type: 'state', label: 'Making $1-1.5K/mo inconsistently', x: 520, y: 270, prob: 100, desc: 'Some months $1.5K, some months $400', source: 'Cost of living data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 12, type: 'bottleneck', label: 'Stabilizes at $2K+?', x: 780, y: 270, prob: 20, desc: 'Inconsistent income usually means no system -- just hustle that burns out', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 13, type: 'outcome-bad', label: 'Forever in $1K/mo limbo', x: 780, y: 420, prob: 100, desc: 'Not poor enough to panic, not rich enough to breathe -- the invisible trap', source: 'Digital nomad surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 6, type: 'bottleneck', label: 'Scale to $5K+/mo', x: 780, y: 120, prob: 30, desc: 'From $2K to $5K requires systems, not just hustle', source: 'Indie Hackers', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 7, type: 'outcome-bad', label: 'Plateau at $2-3K/mo', x: 780, y: 320, prob: 100, desc: 'Comfortable but not building wealth -- lifestyle trap', source: 'Digital nomad surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-014'] },
      { id: 8, type: 'decision', label: 'Save 50%+ consistently?', x: 1040, y: 120, prob: 40, desc: 'At $5K/mo saving $3K = $100K in ~3 years', source: 'Math (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 9, type: 'outcome-good', label: '$100K saved -- freedom', x: 1300, y: 60, prob: 100, desc: '$100K in Indonesia = 5+ years of runway or investment capital', source: 'Financial planning (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 10, type: 'outcome-bad', label: 'Lifestyle inflation eats savings', x: 1300, y: 280, prob: 100, desc: 'Parkinson law of money: spending expands to match income', source: 'Behavioral finance (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-011'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 11, label: 'partial' }, { from: 4, to: 6, label: 'yes' },
      { from: 11, to: 12 }, { from: 12, to: 6, label: 'pass' }, { from: 12, to: 13, label: 'fail' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
      { from: 8, to: 9, label: 'yes' }, { from: 8, to: 10, label: 'no' },
    ]
  },

  richard_first_millionMin: {
    title: 'Path to First $100K from Indonesia (Summary)',
    input: 'A young entrepreneur in Indonesia tries to reach $100K in savings',
    nodes: [
      { id: 1, type: 'state', label: 'Young foreigner in Indonesia, near-zero savings', x: 0, y: 150, prob: 100, desc: 'Indonesia avg salary $300-500/mo. Need geo-arbitrage: earn USD, spend IDR. $100K = 1.6B IDR = 5+ years runway.', source: 'BPS 2024 + Numbeo (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-009', 'SR-007'] },
      { id: 2, type: 'bottleneck', label: 'Builds $2K+/mo USD income? (25%)', x: 300, y: 150, prob: 25, desc: '75% of remote workers from developing countries earn <$1K/mo.', source: 'Payoneer 2024 (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 3, type: 'outcome-bad', label: 'Stuck in local salary or inconsistent gigs', x: 300, y: 350, prob: 100, desc: 'Local salary: max $625-1,250/mo. Freelance: some months $1.5K, some $400. $100K is 15+ years away.', source: 'Income data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 4, type: 'bottleneck', label: 'Scales to $5K/mo + saves 50%? (12%)', x: 600, y: 150, prob: 30, desc: 'Only 4% of online businesses reach $5K/mo. Of those, only 30-40% maintain 50% savings rate.', source: 'Indie Hackers + financial data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 5, type: 'outcome-good', label: '$100K saved -- financial freedom', x: 900, y: 100, prob: 100, desc: '$100K in Indonesia: invest at 10% = $10K/yr passive. Or deploy as startup capital.', source: 'Financial planning (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 6, type: 'outcome-bad', label: 'Lifestyle inflation or plateau at $2-3K', x: 900, y: 250, prob: 100, desc: 'Comfortable but never free. Earning $3-5K but spending $4K. The golden cage.', source: 'Behavioral finance (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-013', 'SR-014'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail (75%)' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'pass' }, { from: 4, to: 6, label: 'fail' },
    ]
  },

  // ============================================================
  // PERFECTIONISM TRAP
  // ============================================================

  richard_perfectionism: {
    title: 'Perfectionism Trap',
    input: 'Someone with high standards keeps polishing instead of shipping',
    nodes: [
      // Main path: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15
      { id: 1, type: 'state', label: '1000 people with high standards start a project', x: 0, y: 200, prob: 100, desc: 'Perfectionism prevalence: 30% of adults score high on maladaptive perfectionism scales. 33% increase among young people since 1989 (meta-analysis of 41,641 students)', source: 'Curran & Hill 2019, Psychological Bulletin', sourceUrl: 'https://www.apa.org/pubs/journals/releases/bul-bul0000138.pdf', sacredRoots: ['SR-009', 'SR-008'] },
      { id: 2, type: 'action', label: 'Research obsessively, plan in detail', x: 200, y: 200, prob: 100, desc: 'Perfectionists spend 2-3x longer on planning phases. Analysis paralysis affects 68% of high-perfectionism scorers', source: 'Stoeber & Eysenck 2008, Journal of Research in Personality (estimated by Foresight from public data)', sourceUrl: 'https://www.psychologytoday.com/us/basics/perfectionism', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 3, type: 'action', label: 'Build obsessively — polish every detail', x: 400, y: 200, prob: 100, desc: 'Technical founders spend 80% of time building, 20% on distribution. Perfectionists skew to 95/5', source: 'First Round Review 2024', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 4, type: 'state', label: '700-800 stuck in perpetual "almost done"', x: 600, y: 200, prob: 75, desc: '70-80% of side projects never ship. Perfectionism is the #1 self-reported reason for non-completion', source: 'Stack Overflow Developer Survey 2024', sourceUrl: 'https://survey.stackoverflow.co/2024/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 5, type: 'gate', label: 'Ship before it feels ready?', x: 800, y: 200, prob: 25, desc: 'Only 20-25% of perfectionists manage to ship imperfect work. "If you are not embarrassed by v1, you launched too late" — Reid Hoffman', source: 'Indie Hackers survey 2024', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-001'] },

      // NO path (never ship): 10 → 11 → 12 → 13 → 14
      { id: 10, type: 'state', label: 'Keeps polishing — "just one more feature"', x: 800, y: 480, prob: 100, desc: 'Feature creep: avg project scope increases 150% from initial plan when perfectionist leads', source: 'Standish Group CHAOS Report 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.standishgroup.com/', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 11, type: 'trajectory', label: 'Diminishing returns loop', x: 1000, y: 480, prob: 100, desc: 'After 80% completion, each improvement yields <5% quality gain but costs 3x the time (Pareto principle applied to shipping)', source: 'Pareto efficiency in software — IEEE studies (estimated by Foresight from public data)', sourceUrl: 'https://ieeexplore.ieee.org/', sacredRoots: ['SR-014', 'SR-017'] },
      { id: 12, type: 'action', label: 'Compare to top players, feel inadequate', x: 1200, y: 420, prob: 100, desc: 'Social comparison perfectionism: 78% of perfectionists report feeling inferior when comparing to established competitors', source: 'Flett & Hewitt 2023, Clinical Psychology Review (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-018', 'SR-005'] },
      { id: 13, type: 'outcome-bad', label: 'Abandons project — starts a new one', x: 1400, y: 420, prob: 100, desc: 'Serial starter pattern: 60% of perfectionists abandon projects to start fresh rather than ship imperfect work', source: 'Behavioral research (estimated by Foresight from public data)', sourceUrl: 'https://www.psychologytoday.com/', sacredRoots: ['SR-009', 'SR-005'] },
      { id: 14, type: 'action', label: 'Burn out from overwork without output', x: 1200, y: 540, prob: 100, desc: 'Perfectionism-burnout link: perfectionists have 2x higher burnout rates. 67% report exhaustion from self-imposed standards', source: 'Hill & Curran 2016, Journal of Personality (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/monitor/2018/11/perfectionism', sacredRoots: ['SR-014', 'SR-007'] },
      { id: 15, type: 'outcome-bad', label: 'Years of work, nothing to show', x: 1400, y: 540, prob: 100, desc: 'The hidden cost: avg perfectionist has 3-5 "almost done" projects gathering dust', source: 'Pattern analysis (estimated by Foresight from public data)', sacredRoots: ['SR-009', 'SR-018'] },

      // PARTIAL path (ships but fragile): 20 → 21 → 22 → 23/24 → 25/26
      { id: 20, type: 'state', label: 'Ships reluctantly, feels exposed', x: 800, y: -20, prob: 100, desc: '10-15% of perfectionists ship with extreme anxiety. "Vulnerability hangover" — Brene Brown', source: 'Brown 2022, Atlas of the Heart (estimated by Foresight from public data)', sourceUrl: 'https://brenebrown.com/', sacredRoots: ['SR-001', 'SR-018'] },
      { id: 21, type: 'trajectory', label: 'Hyper-vigilant monitoring of reception', x: 1000, y: -20, prob: 100, desc: 'Checks reviews/metrics obsessively. One negative comment = catastrophe', source: 'CBT research on perfectionism (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 22, type: 'bottleneck', label: 'Handles first negative feedback?', x: 1200, y: -20, prob: 40, desc: '60% of perfectionists who ship retreat after first criticism. Only 40% persist through negative feedback', source: 'Feedback resilience studies 2023 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-036'] },
      { id: 23, type: 'outcome-bad', label: 'One critique — pulls product, goes silent', x: 1400, y: -80, prob: 100, desc: 'Perfectionists interpret criticism as proof of inadequacy. 45% pull products after early negative reviews', source: 'Product management research (estimated by Foresight from public data)', sacredRoots: ['SR-018', 'SR-005'] },
      { id: 24, type: 'state', label: 'Absorbs feedback, iterates cautiously', x: 1400, y: 40, prob: 100, desc: 'Learning to separate self-worth from product quality — the critical psychological shift', source: 'Growth mindset — Dweck 2006 (estimated by Foresight from public data)', sourceUrl: 'https://mindsetonline.com/', sacredRoots: ['SR-036', 'SR-009'] },

      // YES path (ships confidently): 30 → 31 → 32 → 33/34 → 35/36
      { id: 30, type: 'state', label: '200-250 ship with "good enough" mindset', x: 1000, y: 200, prob: 100, desc: '20-25% adopt iterative approach. These are the ones who internalize "done is better than perfect"', source: 'Indie Hackers 2024 launch data (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-012'] },
      { id: 31, type: 'trajectory', label: 'Lean iteration path', x: 1200, y: 200, prob: 100, desc: 'Ship → measure → iterate. Speed of iteration beats quality of iteration (Eric Ries)', source: 'Lean Startup methodology 2024', sourceUrl: 'http://theleanstartup.com/', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 32, type: 'action', label: 'Collect real user data, iterate weekly', x: 1400, y: 130, prob: 100, desc: 'Weekly shipping cadence: products that iterate weekly have 3.2x higher retention than monthly shippers', source: 'Amplitude 2024 Product Report (estimated by Foresight from public data)', sourceUrl: 'https://amplitude.com/blog', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 33, type: 'outcome-good', label: 'Product-market fit through iteration', x: 1650, y: 130, prob: 100, desc: 'Iterators find PMF 2.5x faster than perfectionists. Avg time to PMF: 18 months iterating vs 4+ years polishing', source: 'First Round Review 2024 (estimated by Foresight from public data)', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-012', 'SR-036'] },

      // Branch: therapy/coaching path
      { id: 34, type: 'action', label: 'Seek CBT or coaching for perfectionism', x: 1400, y: 270, prob: 100, desc: 'CBT for perfectionism: 60-80% show significant improvement in 8-12 sessions. Effect size d=0.89', source: 'Egan et al. 2022, meta-analysis of CBT for perfectionism', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-004'] },
      { id: 35, type: 'bottleneck', label: 'Internalizes "progress over perfection"?', x: 1650, y: 270, prob: 55, desc: '55% of CBT completers maintain gains at 12-month follow-up. The rest relapse under stress', source: 'Clinical outcomes 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-036', 'SR-004'] },
      { id: 36, type: 'outcome-bad', label: 'Relapse under pressure — old patterns return', x: 1900, y: 330, prob: 100, desc: '45% relapse when facing high-stakes deadlines. Perfectionism is deeply wired — cognitive restructuring takes years', source: 'Longitudinal studies (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-014'] },
      { id: 37, type: 'outcome-good', label: 'Healthy striving — ships consistently', x: 1900, y: 210, prob: 100, desc: 'Adaptive perfectionism: high standards + low self-criticism. These individuals ship 4x more than maladaptive perfectionists', source: 'Stoeber 2023, Personality and Individual Differences (estimated by Foresight from public data)', sourceUrl: 'https://www.psychologytoday.com/us/basics/perfectionism', sacredRoots: ['SR-009', 'SR-012'] },

      // Deep branch: identity + self-worth
      { id: 40, type: 'state', label: 'Realizes perfectionism masks fear of judgment', x: 600, y: 480, prob: 100, desc: 'Root cause: 82% of clinical perfectionists trace it to conditional self-worth — "I am only valuable if my work is flawless"', source: 'Hewitt & Flett Perfectionism Model 2023 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-018', 'SR-005'] },
      { id: 41, type: 'decision', label: 'Separate self-worth from output quality?', x: 800, y: 680, prob: 30, desc: 'Only 30% of perfectionists ever decouple identity from performance. It requires deep psychological work', source: 'Clinical psychology (estimated by Foresight from public data)', sourceUrl: 'https://www.psychologytoday.com/', sacredRoots: ['SR-005', 'SR-004'] },
      { id: 42, type: 'outcome-bad', label: 'Identity = output — trapped forever', x: 1050, y: 780, prob: 100, desc: 'When self-worth depends on perfection, every project becomes an existential test. 70% remain stuck', source: 'Personality research (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-005', 'SR-018'] },
      { id: 43, type: 'state', label: 'New identity: "I am a shipper, not a polisher"', x: 1050, y: 580, prob: 100, desc: 'Identity-based change: "I am someone who ships" vs "I am trying to ship" — 2.3x more effective', source: 'Atomic Habits — Clear 2018 (estimated by Foresight from public data)', sourceUrl: 'https://jamesclear.com/', sacredRoots: ['SR-009', 'SR-036'] },

      // Workplace/team impact branch
      { id: 44, type: 'action', label: 'Set impossible standards for team/collaborators', x: 400, y: 680, prob: 100, desc: 'Other-oriented perfectionism: 28% of perfectionists impose standards on others, causing team conflict and turnover', source: 'Hewitt & Flett 2023 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-025', 'SR-014'] },
      { id: 45, type: 'outcome-bad', label: 'Team quits — works alone again', x: 600, y: 680, prob: 100, desc: 'Perfectionist managers have 35% higher turnover in their teams. End up solo, confirming "nobody meets my standards"', source: 'Management research (estimated by Foresight from public data)', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-025', 'SR-005'] },

      // Convergence: success outcomes
      { id: 50, type: 'outcome-good', label: 'Ships consistently — perfectionism becomes an asset', x: 2100, y: 200, prob: 100, desc: 'The 5-8% who convert maladaptive perfectionism to adaptive: high standards + fast shipping = exceptional quality at speed', source: 'Organizational psychology 2024 (estimated by Foresight from public data)', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-009', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      // Gate: NO / PARTIAL / YES
      { from: 5, to: 10, label: 'no (55-60%)' },
      { from: 5, to: 20, label: 'partial (10-15%)' },
      { from: 5, to: 30, label: 'yes (20-25%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 12, to: 13 },
      { from: 11, to: 14 }, { from: 14, to: 15 },
      // Deep branch from NO: identity work
      { from: 10, to: 40 }, { from: 40, to: 41 },
      { from: 41, to: 42, label: 'no' }, { from: 41, to: 43, label: 'yes' },
      { from: 43, to: 30 },
      // Team impact branch
      { from: 40, to: 44 }, { from: 44, to: 45 },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 31 },
      // YES path
      { from: 30, to: 31 },
      { from: 31, to: 32 }, { from: 32, to: 33 },
      { from: 31, to: 34 }, { from: 34, to: 35 },
      { from: 35, to: 36, label: 'fail' }, { from: 35, to: 37, label: 'pass' },
      // SUCCESS convergence
      { from: 33, to: 50 }, { from: 37, to: 50 },
    ]
  },
  richard_perfectionismMid: {
    title: 'Perfectionism Trap (Analysis)',
    input: 'Someone with high standards keeps polishing instead of shipping',
    nodes: [
      { id: 1, type: 'state', label: '1000 people with high standards start a project', x: 0, y: 200, prob: 100, desc: 'Perfectionism prevalence: 30% of adults score high on maladaptive perfectionism. 33% increase among young people since 1989', source: 'Curran & Hill 2019, Psychological Bulletin', sourceUrl: 'https://www.apa.org/pubs/journals/releases/bul-bul0000138.pdf', sacredRoots: ['SR-009', 'SR-008'] },
      { id: 2, type: 'action', label: 'Research, plan, build obsessively', x: 250, y: 200, prob: 100, desc: 'Perfectionists spend 2-3x longer on tasks. 80% of time building, 5% on distribution', source: 'First Round Review 2024 (estimated by Foresight from public data)', sourceUrl: 'https://review.firstround.com/', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 3, type: 'state', label: '700-800 stuck in "almost done" loop', x: 500, y: 200, prob: 75, desc: '70-80% of side projects never ship. Perfectionism is #1 self-reported blocker', source: 'Stack Overflow Developer Survey 2024', sourceUrl: 'https://survey.stackoverflow.co/2024/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 4, type: 'gate', label: 'Ship before it feels ready?', x: 750, y: 200, prob: 25, desc: 'Only 20-25% of perfectionists ship imperfect work', source: 'Indie Hackers survey 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-009', 'SR-001'] },
      // NO path
      { id: 10, type: 'trajectory', label: 'Diminishing returns: polish, compare, burn out', x: 750, y: 450, prob: 100, desc: '55-60% enter the polish loop. Feature creep, social comparison, and burnout follow', source: 'Standish Group CHAOS Report 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.standishgroup.com/', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 11, type: 'outcome-bad', label: 'Abandons or burns out — years wasted', x: 1050, y: 450, prob: 100, desc: '60% abandon projects to start fresh. 67% report exhaustion from self-imposed standards', source: 'Hill & Curran 2016 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/monitor/2018/11/perfectionism', sacredRoots: ['SR-009', 'SR-005'] },
      // PARTIAL path
      { id: 20, type: 'state', label: 'Ships reluctantly, hypervigilant', x: 750, y: 0, prob: 100, desc: '10-15% ship with extreme anxiety. Monitor reception obsessively', source: 'CBT research (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-001', 'SR-018'] },
      { id: 21, type: 'bottleneck', label: 'Survives first negative feedback?', x: 1050, y: 0, prob: 40, desc: '60% retreat after first criticism. Only 40% persist', source: 'Feedback resilience studies 2023 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-036'] },
      { id: 22, type: 'outcome-bad', label: 'One critique — retreats to hiding', x: 1300, y: -60, prob: 100, desc: 'Perfectionists interpret criticism as proof of inadequacy', source: 'CBT research (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-018', 'SR-005'] },
      // YES path
      { id: 30, type: 'state', label: '200-250 ship with "good enough" mindset', x: 1050, y: 200, prob: 100, desc: 'Weekly shippers have 3.2x higher retention. Speed of iteration beats quality of iteration', source: 'Lean Startup — Ries 2024 (estimated by Foresight from public data)', sourceUrl: 'http://theleanstartup.com/', sacredRoots: ['SR-036', 'SR-012'] },
      { id: 31, type: 'bottleneck', label: 'Internalizes "progress over perfection"?', x: 1300, y: 200, prob: 55, desc: 'CBT for perfectionism: 60-80% improve in 8-12 sessions. 55% maintain gains at 12 months', source: 'Egan et al. 2022 meta-analysis (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-004'] },
      { id: 32, type: 'outcome-good', label: 'Healthy striving — ships consistently', x: 1550, y: 130, prob: 100, desc: '5-8% convert maladaptive to adaptive perfectionism: high standards + fast shipping', source: 'Stoeber 2023 (estimated by Foresight from public data)', sourceUrl: 'https://www.psychologytoday.com/us/basics/perfectionism', sacredRoots: ['SR-009', 'SR-012'] },
      { id: 33, type: 'outcome-bad', label: 'Relapse under pressure — old patterns', x: 1550, y: 280, prob: 100, desc: '45% relapse when facing high-stakes deadlines. Perfectionism is deeply wired', source: 'Longitudinal studies (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-014'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      { from: 4, to: 10, label: 'no (55-60%)' }, { from: 10, to: 11 },
      { from: 4, to: 20, label: 'partial (10-15%)' }, { from: 20, to: 21 },
      { from: 21, to: 22, label: 'fail' }, { from: 21, to: 30, label: 'pass' },
      { from: 4, to: 30, label: 'yes (20-25%)' },
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'pass' }, { from: 31, to: 33, label: 'fail' },
    ]
  },
  richard_perfectionismMin: {
    title: 'Perfectionism Trap (Summary)',
    input: 'Someone with high standards keeps polishing instead of shipping',
    nodes: [
      { id: 1, type: 'state', label: 'High standards, big vision', x: 0, y: 120, prob: 100, desc: 'Perfectionism rising: 33% increase in young people since 1989', source: 'APA 2025', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-009', 'SR-008'] },
      { id: 2, type: 'action', label: 'Work obsessively on details', x: 260, y: 120, prob: 100, desc: 'Perfectionists spend 2-3x longer on tasks vs "good enough"', source: 'Psychology Today (estimated by Foresight from public data)', sourceUrl: 'https://www.psychologytoday.com/', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 3, type: 'bottleneck', label: 'Ship before it feels ready?', x: 520, y: 120, prob: 25, desc: '"If you are not embarrassed by v1, you launched too late" — Reid Hoffman', source: 'LinkedIn founder', sacredRoots: ['SR-009', 'SR-001'] },
      { id: 4, type: 'outcome-bad', label: 'Never ships — eternal WIP', x: 520, y: 320, prob: 100, desc: '75% of side projects never see the light of day', source: 'Dev surveys (estimated by Foresight from public data)', sourceUrl: 'https://survey.stackoverflow.co/', sacredRoots: ['SR-009', 'SR-018'] },
      { id: 5, type: 'bottleneck', label: 'Handle imperfect feedback', x: 780, y: 120, prob: 50, desc: 'First users always find problems — can you not take it personally?', source: 'Product management (estimated by Foresight from public data)', sacredRoots: ['SR-009', 'SR-036'] },
      { id: 6, type: 'outcome-bad', label: 'One critique, back to hiding', x: 780, y: 320, prob: 100, desc: 'Perfectionists interpret feedback as personal failure', source: 'CBT research (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 7, type: 'outcome-good', label: 'Iterate fast, improve from feedback', x: 1040, y: 60, prob: 100, desc: 'Speed of iteration beats quality of iteration', source: 'Eric Ries, Lean Startup (estimated by Foresight from public data)', sourceUrl: 'http://theleanstartup.com/', sacredRoots: ['SR-036', 'SR-009'] },
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
      // Main path: calling → purpose → ethics → generosity → stewardship → scale
      { id: 1, type: 'state', label: '1000 Christian entrepreneurs feel called to build', x: 0, y: 200, prob: 100, desc: '"Whatever you do, work at it with all your heart" — Colossians 3:23. 65% of US Christians report faith influences business decisions', source: 'Barna Group 2024', sourceUrl: 'https://www.barna.com/', sacredRoots: ['SR-003', 'SR-016'] },
      { id: 2, type: 'desire', label: 'Honor God while building wealth', x: 200, y: 200, prob: 100, desc: '"A good person leaves an inheritance to their children\'s children" — Proverbs 13:22. Wealth creation as stewardship, not greed', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-024', 'SR-003'] },
      { id: 3, type: 'decision', label: 'Serve people first or chase money?', x: 400, y: 200, prob: 65, desc: 'Purpose-driven companies outperform S&P 500 by 14x over 15 years (Firms of Endearment study). 65% choose service', source: 'Sisodia et al. 2024, Firms of Endearment', sourceUrl: 'https://www.firmsofendearment.com/', sacredRoots: ['SR-032', 'SR-013'] },
      { id: 4, type: 'action', label: 'Build with service-first mindset', x: 600, y: 200, prob: 100, desc: 'B Corps grow 28% faster than conventional businesses. Stakeholder capitalism emerging as dominant model', source: 'B Lab 2024 Annual Report', sourceUrl: 'https://www.bcorporation.net/', sacredRoots: ['SR-032', 'SR-012'] },
      { id: 5, type: 'gate', label: 'First ethical dilemma — stay honest?', x: 800, y: 200, prob: 50, desc: '73% of entrepreneurs face ethical dilemma in first 2 years. 50% compromise at least once. "No one can serve two masters" — Matthew 6:24', source: 'EY Entrepreneurship Barometer 2024 (estimated by Foresight from public data)', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-015', 'SR-023'] },

      // NO path (chase money): 10 → 11 → 12 → 13
      { id: 10, type: 'trajectory', label: 'Money-first path: cut corners for growth', x: 400, y: 480, prob: 100, desc: '"For the love of money is a root of all evil" — 1 Timothy 6:10. Short-term gains at spiritual cost', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-002', 'SR-013'] },
      { id: 11, type: 'action', label: 'Overcharge, underdeliver, exploit workers', x: 600, y: 480, prob: 100, desc: '38% of businesses that prioritize profit over people fail within 5 years from reputation damage', source: 'Edelman Trust Barometer 2024', sourceUrl: 'https://www.edelman.com/trust/trust-barometer', sacredRoots: ['SR-023', 'SR-015'] },
      { id: 12, type: 'bottleneck', label: 'Reputation survives?', x: 800, y: 480, prob: 20, desc: '80% of businesses with trust violations lose >40% revenue within 2 years', source: 'Edelman Trust 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.edelman.com/trust/trust-barometer', sacredRoots: ['SR-023', 'SR-032'] },
      { id: 13, type: 'outcome-bad', label: 'Rich but empty — spiritual bankruptcy', x: 1000, y: 540, prob: 100, desc: '"What does it profit a man to gain the whole world and forfeit his soul?" — Mark 8:36', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-002', 'SR-005'] },
      { id: 14, type: 'state', label: 'Financial success but inner conflict', x: 1000, y: 420, prob: 100, desc: '20% succeed financially but report severe guilt/anxiety. Studies show religious entrepreneurs with value conflicts have 2x depression rates', source: 'Journal of Business Ethics 2024 (estimated by Foresight from public data)', sourceUrl: 'https://link.springer.com/journal/10551', sacredRoots: ['SR-005', 'SR-004'] },

      // PARTIAL path (compromise sometimes): 20 → 21 → 22 → 23/24
      { id: 20, type: 'state', label: 'Compromises ethics "just this once"', x: 800, y: -20, prob: 100, desc: 'Slippery slope: 67% of first-time ethical compromisers report doing it again within 6 months', source: 'Bazerman & Tenbrunsel 2024, Blind Spots (estimated by Foresight from public data)', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-015', 'SR-003'] },
      { id: 21, type: 'trajectory', label: 'Gradual drift from values', x: 1000, y: -20, prob: 100, desc: 'Ethical fading: small compromises normalize. "The heart is deceitful above all things" — Jeremiah 17:9', source: 'Bible + Behavioral Ethics (estimated by Foresight from public data)', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-003', 'SR-023'] },
      { id: 22, type: 'bottleneck', label: 'Catches drift and course-corrects?', x: 1200, y: -20, prob: 45, desc: '45% with accountability structures (church, mentor, board) catch and correct ethical drift', source: 'Praxis Labs 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.praxislabs.org/', sacredRoots: ['SR-016', 'SR-025'] },
      { id: 23, type: 'outcome-bad', label: 'Values eroded — faith becomes performance', x: 1400, y: -80, prob: 100, desc: 'Faith becomes a brand, not a practice. "Not everyone who says Lord, Lord..." — Matthew 7:21', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-003', 'SR-023'] },
      { id: 24, type: 'state', label: 'Repents, rebuilds with accountability', x: 1400, y: 40, prob: 100, desc: 'Course correction requires humility + community. "Confess your sins to each other" — James 5:16', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-016', 'SR-003'] },

      // YES path (stays ethical): 30 → 31 → 32 → 33 → 34 → 35
      { id: 30, type: 'state', label: '500 stay ethical through first test', x: 1000, y: 200, prob: 100, desc: 'Companies with strong ethical foundations have 40% higher employee retention', source: 'Gallup Workplace 2024', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-015', 'SR-032'] },
      { id: 31, type: 'bottleneck', label: 'Practice generosity while bootstrapping?', x: 1200, y: 200, prob: 40, desc: 'Tithing entrepreneurs: 88% report higher satisfaction, 73% report business growth after starting to tithe. Only 40% tithe consistently while bootstrapping', source: 'Generous Giving 2024 (estimated by Foresight from public data)', sourceUrl: 'https://generousgiving.org/', sacredRoots: ['SR-024', 'SR-001'] },
      { id: 32, type: 'action', label: 'Tithe first, budget second', x: 1400, y: 130, prob: 100, desc: '"Honor the Lord with your wealth, with the firstfruits" — Proverbs 3:9. Counter-intuitive: give first, not from leftovers', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-024', 'SR-003'] },
      { id: 33, type: 'bottleneck', label: 'Business survives lean months?', x: 1600, y: 130, prob: 55, desc: '55% of bootstrapped businesses survive past year 2. Faith entrepreneurs report higher resilience but same survival rate', source: 'BLS Business Survival 2024', sourceUrl: 'https://www.bls.gov/bdm/', sacredRoots: ['SR-001', 'SR-012'] },
      { id: 34, type: 'outcome-good', label: 'Sustainable, ethical, generous business', x: 1850, y: 70, prob: 100, desc: '"Rich in good works, generous, ready to share" — 1 Timothy 6:18. These businesses report 3x higher owner life satisfaction', source: 'Bible + Gallup (estimated by Foresight from public data)', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-024', 'SR-032'] },
      { id: 35, type: 'outcome-bad', label: 'Business fails despite integrity', x: 1850, y: 190, prob: 100, desc: '45% fail financially even with strong ethics. "In this world you will have trouble" — John 16:33', source: 'Bible + BLS data (estimated by Foresight from public data)', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-003', 'SR-001'] },

      // Scarcity vs abundance branch
      { id: 36, type: 'state', label: 'Fear blocks giving — scarcity mindset', x: 1400, y: 270, prob: 100, desc: '60% of bootstrapping entrepreneurs report scarcity anxiety. "Do not be anxious about anything" — Philippians 4:6', source: 'Bible + Psychology (estimated by Foresight from public data)', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-024', 'SR-001'] },
      { id: 37, type: 'decision', label: 'Trust God with finances?', x: 1600, y: 270, prob: 35, desc: '"Bring the full tithe... test me in this" — Malachi 3:10. Only 35% take the leap of radical financial trust', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-003', 'SR-024'] },
      { id: 38, type: 'outcome-bad', label: 'Hoards — prospers materially, stunted spiritually', x: 1850, y: 330, prob: 100, desc: '"The one who gathers money little by little makes it grow" — but without generosity the soul shrinks', source: 'Proverbs 13:11 + pastoral observation (estimated by Foresight from public data)', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-013', 'SR-024'] },

      // Mentorship + community branch
      { id: 40, type: 'action', label: 'Find Christian business mentors', x: 1000, y: 360, prob: 100, desc: 'Faith-based business networks (C12, FCCI, Praxis): members report 2x revenue growth vs non-mentored peers', source: 'C12 Group outcomes 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.c12group.com/', sacredRoots: ['SR-016', 'SR-025'] },
      { id: 41, type: 'bottleneck', label: 'Finds accountability community?', x: 1200, y: 360, prob: 35, desc: 'Only 35% of faith entrepreneurs join structured accountability. Those who do: 45% higher ethical consistency', source: 'Barna Group 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.barna.com/', sacredRoots: ['SR-016', 'SR-032'] },
      { id: 42, type: 'outcome-bad', label: 'Isolated — faith becomes private, business becomes secular', x: 1400, y: 420, prob: 100, desc: 'Without community, faith-business integration erodes. 65% revert to "Sunday faith, Monday secular"', source: 'Barna Faith at Work 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.barna.com/', sacredRoots: ['SR-016', 'SR-003'] },
      { id: 43, type: 'state', label: 'Accountability keeps values integrated', x: 1400, y: 300, prob: 100, desc: 'Community as guardrails: weekly accountability calls reduce ethical drift by 60%', source: 'Praxis Labs 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.praxislabs.org/', sacredRoots: ['SR-016', 'SR-015'] },

      // Employee/stakeholder impact
      { id: 44, type: 'action', label: 'Pay fair wages, invest in employees', x: 1600, y: 360, prob: 100, desc: '"The worker deserves his wages" — 1 Timothy 5:18. Fair-wage companies: 25% higher productivity, 40% lower turnover', source: 'Bible + MIT Living Wage study (estimated by Foresight from public data)', sourceUrl: 'https://livingwage.mit.edu/', sacredRoots: ['SR-032', 'SR-023'] },
      { id: 45, type: 'state', label: 'Employees become advocates — organic growth', x: 1850, y: 360, prob: 100, desc: 'Purpose-driven companies with fair wages: 3.5x higher Glassdoor ratings, 2x higher referral hires', source: 'Glassdoor 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.glassdoor.com/research/', sacredRoots: ['SR-032', 'SR-025'] },

      // Kingdom impact convergence
      { id: 50, type: 'outcome-good', label: 'Wealth as a tool for Kingdom impact', x: 2100, y: 200, prob: 100, desc: 'The 5-10% who combine ethical business + generosity + faith resilience: highest reported purpose, impact, and satisfaction scores', source: 'Praxis Labs + Barna 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.praxislabs.org/', sacredRoots: ['SR-024', 'SR-032'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      // Decision: serve or chase
      { from: 3, to: 10, label: 'no (35%)' },
      { from: 3, to: 4, label: 'yes (65%)' },
      // Money-first path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 12, to: 13, label: 'fail' }, { from: 12, to: 14, label: 'pass' },
      // Service path → ethical dilemma gate
      { from: 4, to: 5 },
      { from: 5, to: 20, label: 'partial (25%)' },
      { from: 5, to: 30, label: 'yes (50%)' },
      { from: 5, to: 10, label: 'no (25%)' },
      // Partial path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 30 },
      // YES path: ethics → generosity → survival
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'pass' }, { from: 31, to: 36, label: 'fail' },
      { from: 32, to: 33 },
      { from: 33, to: 34, label: 'pass' }, { from: 33, to: 35, label: 'fail' },
      // Scarcity branch
      { from: 36, to: 37 },
      { from: 37, to: 34, label: 'yes' }, { from: 37, to: 38, label: 'no' },
      // Mentorship branch
      { from: 30, to: 40 }, { from: 40, to: 41 },
      { from: 41, to: 42, label: 'fail' }, { from: 41, to: 43, label: 'pass' },
      { from: 43, to: 44 }, { from: 44, to: 45 },
      // Convergence
      { from: 34, to: 50 }, { from: 45, to: 50 },
    ]
  },
  richard_faith_businessMid: {
    title: 'Kingdom Economics: Faith + Business (Analysis)',
    input: 'A Christian entrepreneur tries to honor God while building wealth',
    nodes: [
      { id: 1, type: 'state', label: 'Called to build, not just survive', x: 0, y: 120, prob: 100, desc: '"Whatever you do, work at it with all your heart" -- Colossians 3:23', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-003', 'SR-016'] },
      { id: 2, type: 'decision', label: 'Serve people or chase money?', x: 260, y: 120, prob: 65, desc: 'Purpose-driven companies outperform market by 400%', source: 'Firms of Endearment study (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.firmsofendearment.com/', sacredRoots: ['SR-032', 'SR-013'] },
      { id: 3, type: 'outcome-bad', label: 'Greed corrupts the mission', x: 260, y: 320, prob: 100, desc: '"For the love of money is a root of all evil" -- 1 Timothy 6:10', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-002', 'SR-013'] },
      { id: 4, type: 'bottleneck', label: 'Stay ethical when it costs money', x: 520, y: 120, prob: 50, desc: '50% of entrepreneurs face ethical dilemma in first 2 years', source: 'HBS research (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://hbr.org/', sacredRoots: ['SR-015', 'SR-023'] },
      { id: 5, type: 'outcome-bad', label: 'Compromise values for profit', x: 520, y: 320, prob: 100, desc: 'Short-term gain, long-term regret -- trust destroyed', source: 'Edelman Trust (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.edelman.com/trust/trust-barometer', sacredRoots: ['SR-015', 'SR-023'] },
      { id: 6, type: 'bottleneck', label: 'Generosity while bootstrapping?', x: 780, y: 120, prob: 40, desc: 'Tithing entrepreneurs report higher satisfaction and growth', source: 'Generous Giving study (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-024', 'SR-001'] },
      { id: 7, type: 'outcome-bad', label: 'Scarcity mindset blocks giving', x: 780, y: 320, prob: 100, desc: 'Fear of not having enough kills generosity', source: 'Psychology research (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-024', 'SR-001'] },
      { id: 8, type: 'outcome-good', label: 'Wealth as a tool for good', x: 1040, y: 60, prob: 100, desc: '"Rich in good works, generous, ready to share" -- 1 Timothy 6:18', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-024', 'SR-032'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
  richard_faith_businessMin: {
    title: 'Kingdom Economics: Faith + Business (Summary)',
    input: 'A Christian entrepreneur tries to honor God while building wealth',
    nodes: [
      { id: 1, type: 'state', label: 'Christian entrepreneur called to build', x: 0, y: 150, prob: 100, desc: '"Whatever you do, work at it with all your heart" — Colossians 3:23', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-003', 'SR-016'] },
      { id: 2, type: 'decision', label: 'Serve people or chase money?', x: 300, y: 150, prob: 65, desc: 'Purpose-driven companies outperform S&P 500 by 14x over 15 years', source: 'Firms of Endearment study (estimated by Foresight from public data)', sourceUrl: 'https://www.firmsofendearment.com/', sacredRoots: ['SR-032', 'SR-013'] },
      { id: 3, type: 'outcome-bad', label: 'Greed corrupts the mission', x: 300, y: 350, prob: 100, desc: '"For the love of money is a root of all evil" — 1 Timothy 6:10', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-002', 'SR-013'] },
      { id: 4, type: 'bottleneck', label: 'Stay ethical + generous while bootstrapping?', x: 600, y: 150, prob: 40, desc: '50% face ethical dilemma in year 1. Only 40% tithe while bootstrapping', source: 'Barna Group 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.barna.com/', sacredRoots: ['SR-015', 'SR-024'] },
      { id: 5, type: 'outcome-bad', label: 'Compromise values or hoard from fear', x: 600, y: 350, prob: 100, desc: 'Short-term gain, long-term spiritual cost', source: 'Edelman Trust 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.edelman.com/trust/trust-barometer', sacredRoots: ['SR-015', 'SR-024'] },
      { id: 6, type: 'outcome-good', label: 'Wealth as a tool for Kingdom impact', x: 900, y: 100, prob: 100, desc: '"Rich in good works, generous, ready to share" — 1 Timothy 6:18', source: 'Bible', sourceUrl: 'https://www.biblegateway.com/', sacredRoots: ['SR-024', 'SR-032'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'no' }, { from: 2, to: 4, label: 'yes' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
    ]
  },

  richard_provider: {
    title: 'Become a Provider Before 30',
    input: 'A young man abroad tries to become financially stable enough to provide for his family',
    nodes: [
      // Main path: desire → income → stability → provide → legacy
      { id: 1, type: 'desire', label: '1000 young men abroad want to provide', x: 0, y: 200, prob: 100, desc: '72% of men globally cite "providing for family" as core to identity (Pew 2024). For expats, this pressure intensifies — no safety net', source: 'Pew Research 2024', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-020', 'SR-019'] },
      { id: 2, type: 'state', label: 'Far from home, limited network, near-zero savings', x: 200, y: 200, prob: 100, desc: 'Young expats in SEA: median savings <$2K. 78% report financial stress in first year abroad', source: 'InterNations Expat Insider 2024', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-007', 'SR-001'] },
      { id: 3, type: 'action', label: 'Hustle: freelancing, gigs, online work', x: 400, y: 200, prob: 100, desc: '83% of expat entrepreneurs start with freelancing or gig work. Average time to first dollar: 3-6 weeks', source: 'Payoneer Global Gig Economy Report 2024', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 4, type: 'gate', label: 'Find reliable income abroad?', x: 600, y: 200, prob: 35, desc: '65% of young expats struggle with stable income for 2+ years. Only 35% achieve stability in year 1', source: 'HSBC Expat Survey 2024', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-031', 'SR-001'] },

      // NO path: dependent, shame spiral
      { id: 10, type: 'state', label: 'No income — dependent on others', x: 600, y: 480, prob: 100, desc: 'Financial dependence linked to 3x higher depression rates in men 25-35. Shame spiral activates', source: 'APA Journal of Family Psychology 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 11, type: 'trajectory', label: 'Provider identity crisis', x: 800, y: 480, prob: 100, desc: '"If I cant provide, what am I worth?" — 58% of financially dependent men report identity crisis', source: 'Masculinity studies 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-005', 'SR-019'] },
      { id: 12, type: 'decision', label: 'Go back home or keep fighting?', x: 1000, y: 480, prob: 40, desc: '25% of expats return home within 2 years. 40% who stay find new paths. 35% get stuck', source: 'InterNations 2024', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-001', 'SR-007'] },
      { id: 13, type: 'outcome-bad', label: 'Returns home — perceived failure', x: 1200, y: 540, prob: 100, desc: 'Returning expats report higher shame than those who never left. Cultural pressure compounds it', source: 'Migration studies (estimated by Foresight from public data)', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-018', 'SR-005'] },
      { id: 14, type: 'state', label: 'Stays, rebuilds from scratch', x: 1200, y: 420, prob: 100, desc: 'Resilience path: those who stay and rebuild report highest long-term satisfaction (5-year follow-up)', source: 'Expat longitudinal studies (estimated by Foresight from public data)', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-001', 'SR-009'] },

      // PARTIAL path: inconsistent income
      { id: 20, type: 'state', label: 'Making $1-2.5K/mo inconsistently', x: 600, y: -20, prob: 100, desc: 'Some months $2.5K, some months $400. Median freelancer from developing country: $1.2K/mo', source: 'Payoneer 2024', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 21, type: 'trajectory', label: 'Anxiety: never know next months income', x: 800, y: -20, prob: 100, desc: 'Income volatility is psychologically worse than low but stable income. Cortisol levels 40% higher', source: 'Behavioral economics (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 22, type: 'bottleneck', label: 'Stabilizes at $2K+/mo?', x: 1000, y: -20, prob: 25, desc: 'Only 25% of inconsistent freelancers achieve stable $2K+. Requires niching down + recurring clients', source: 'Upwork/Payoneer data 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-012', 'SR-011'] },
      { id: 23, type: 'outcome-bad', label: 'Forever in $1K/mo limbo', x: 1200, y: -80, prob: 100, desc: 'Not poor enough to panic, not rich enough to breathe — the invisible trap. 45% of SE Asia expats stuck here', source: 'Digital nomad surveys 2024 (estimated by Foresight from public data)', sourceUrl: 'https://nomadlist.com/', sacredRoots: ['SR-013', 'SR-007'] },
      { id: 24, type: 'state', label: 'Stabilized — enters growth path', x: 1200, y: 40, prob: 100, desc: 'Crossing $2K/mo consistent = psychological shift. Provider anxiety drops 60%', source: 'Financial psychology (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-031', 'SR-004'] },

      // YES path: stable income → scale → provide → legacy
      { id: 30, type: 'state', label: '350 achieve stable income ($2-3K/mo)', x: 800, y: 200, prob: 100, desc: '$2-3K/mo in Indonesia = top 5% lifestyle. Covers rent, food, transport, and basic savings', source: 'Numbeo Cost of Living 2024', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 31, type: 'bottleneck', label: 'Scale to $3-5K+/mo?', x: 1000, y: 200, prob: 30, desc: 'From $2K to $5K requires systems, not just more hours. Only 30% of freelancers cross this threshold', source: 'Indie Hackers 2024', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 32, type: 'outcome-bad', label: 'Plateau at $2-3K — comfortable but not building', x: 1200, y: 290, prob: 100, desc: 'Lifestyle trap: comfortable enough to not push, not enough to build real wealth. 55% plateau here', source: 'Digital nomad income surveys (estimated by Foresight from public data)', sourceUrl: 'https://nomadlist.com/', sacredRoots: ['SR-013', 'SR-014'] },
      { id: 33, type: 'action', label: 'Support family + save 40-50%', x: 1200, y: 200, prob: 100, desc: 'At $5K/mo in Indonesia, saving $2-2.5K = $24-30K/year. Family support + wealth building simultaneously', source: 'Financial planning (estimated by Foresight from public data)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-019', 'SR-031'] },
      { id: 34, type: 'decision', label: 'Balance family duty, growth, and rest?', x: 1400, y: 200, prob: 40, desc: 'Triple constraint: provider duty + wealth building + mental health. 60% burn out trying all three', source: 'Work-life balance research (estimated by Foresight from public data)', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-019', 'SR-014'] },
      { id: 35, type: 'outcome-bad', label: 'Burnt out — provider becomes hollow', x: 1600, y: 270, prob: 100, desc: 'Provider burnout: body present, spirit absent. 43% of high-performing men 25-35 report burnout symptoms', source: 'Gallup Wellbeing 2024', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 36, type: 'outcome-good', label: 'Stable, respected, at peace', x: 1600, y: 130, prob: 100, desc: 'Financial stability + purpose + community = highest male life satisfaction. The 10-15% who achieve all three', source: 'Gallup Global Wellbeing 2024', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-019', 'SR-004'] },

      // Emergency fund / safety net branch
      { id: 40, type: 'action', label: 'Build 6-month emergency fund', x: 1000, y: 360, prob: 100, desc: 'Only 39% of adults globally have 3+ months emergency fund. For expats with no family safety net, this is existential', source: 'Bankrate Financial Security Survey 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.bankrate.com/', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 41, type: 'bottleneck', label: 'Saves 6 months expenses ($8-12K)?', x: 1200, y: 360, prob: 25, desc: '75% of expats never build adequate emergency fund. Living month-to-month is the norm', source: 'Financial planning data (estimated by Foresight from public data)', sourceUrl: 'https://www.bankrate.com/', sacredRoots: ['SR-011', 'SR-007'] },
      { id: 42, type: 'outcome-bad', label: 'One crisis away from collapse', x: 1400, y: 420, prob: 100, desc: 'No safety net abroad: medical emergency, visa issue, or family crisis can wipe everything', source: 'Expat risk analysis (estimated by Foresight from public data)', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-007', 'SR-011'] },
      { id: 43, type: 'state', label: 'Safety net built — breathes easier', x: 1400, y: 300, prob: 100, desc: 'Emergency fund = 60% reduction in financial anxiety. Enables risk-taking for growth', source: 'Financial psychology (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-011', 'SR-004'] },

      // Legacy convergence
      // Relationship + partner support branch
      { id: 44, type: 'decision', label: 'Partner understands the financial struggle?', x: 800, y: 360, prob: 55, desc: '55% of couples where one partner is an expat report financial stress as top conflict. Partner support is #1 predictor of provider resilience', source: 'Gottman Institute + Expat studies (estimated by Foresight from public data)', sourceUrl: 'https://www.gottman.com/research/', sacredRoots: ['SR-020', 'SR-025'] },
      { id: 45, type: 'outcome-bad', label: 'Relationship strain from financial pressure', x: 1000, y: 420, prob: 100, desc: '40% of expat relationships end within 3 years, financial stress cited in 70% of breakups', source: 'InterNations 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.internations.org/expat-insider/', sacredRoots: ['SR-020', 'SR-007'] },
      { id: 46, type: 'state', label: 'Partner becomes ally in the financial fight', x: 1000, y: 300, prob: 100, desc: 'Couples who budget together report 30% higher savings rate and 45% lower financial stress', source: 'Financial Therapy Association (estimated by Foresight from public data)', sourceUrl: 'https://www.financialtherapyassociation.org/', sacredRoots: ['SR-020', 'SR-031'] },

      // Skill development branch
      { id: 47, type: 'action', label: 'Invest in high-demand skills (AI, code, data)', x: 600, y: 360, prob: 100, desc: 'AI/automation skills: freelancers with AI skills earn 47% more than average. Fastest path to $50+/hr', source: 'Upwork In-Demand Skills 2025 (estimated by Foresight from public data)', sourceUrl: 'https://www.upwork.com/research/in-demand-skills-2026', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 48, type: 'bottleneck', label: 'Skill translates to income within 6 months?', x: 800, y: 560, prob: 30, desc: '70% of self-taught skills never monetize. Key: pick skills where demand > supply and you can show proof of work', source: 'Learning ROI studies (estimated by Foresight from public data)', sourceUrl: 'https://www.coursera.org/research', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 49, type: 'outcome-bad', label: 'Learned skill but cant sell it', x: 1000, y: 560, prob: 100, desc: 'The "I know it but cant monetize it" trap. Skill without sales = expensive hobby', source: 'Freelance market analysis (estimated by Foresight from public data)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-009', 'SR-010'] },

      // Legacy convergence
      { id: 50, type: 'outcome-good', label: 'Provider, protector, at peace — before 30', x: 1850, y: 200, prob: 100, desc: 'The 5-8% who achieve stable income + family support + savings + peace of mind abroad before 30. "A good man leaves an inheritance" — Proverbs 13:22', source: 'Composite analysis (estimated by Foresight from public data)', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-019', 'SR-003'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      // Gate: NO / PARTIAL / YES
      { from: 4, to: 10, label: 'no (35%)' },
      { from: 4, to: 20, label: 'partial (30%)' },
      { from: 4, to: 30, label: 'yes (35%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 12, to: 13, label: 'no' }, { from: 12, to: 14, label: 'yes' },
      { from: 14, to: 3 },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 30 },
      // YES path
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'fail' }, { from: 31, to: 33, label: 'pass' },
      { from: 33, to: 34 },
      { from: 34, to: 35, label: 'no' }, { from: 34, to: 36, label: 'yes' },
      // Emergency fund branch
      { from: 30, to: 40 }, { from: 40, to: 41 },
      { from: 41, to: 42, label: 'fail' }, { from: 41, to: 43, label: 'pass' },
      { from: 43, to: 33 },
      // Relationship branch
      { from: 30, to: 44 },
      { from: 44, to: 45, label: 'no' }, { from: 44, to: 46, label: 'yes' },
      { from: 46, to: 33 },
      // Skill development branch
      { from: 3, to: 47 }, { from: 47, to: 48 },
      { from: 48, to: 49, label: 'fail' }, { from: 48, to: 30, label: 'pass' },
      // Convergence
      { from: 36, to: 50 },
    ]
  },
  richard_providerMid: {
    title: 'Become a Provider Before 30 (Analysis)',
    input: 'A young man abroad tries to become financially stable enough to provide for his family',
    nodes: [
      { id: 1, type: 'desire', label: 'Want to provide and protect', x: 0, y: 120, prob: 100, desc: '72% of men cite "providing" as core to their identity', source: 'Pew Research 2025', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-020', 'SR-019'] },
      { id: 2, type: 'gate', label: 'Find reliable income abroad', x: 260, y: 120, prob: 35, desc: '65% of young expats struggle with stable income first 2 years', source: 'HSBC Expat', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Dependent on others -- shame spiral', x: 260, y: 320, prob: 100, desc: 'Financial dependence linked to depression in men', source: 'APA studies', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 9, type: 'state', label: 'Making $1.5-2.5K/mo inconsistently', x: 260, y: 270, prob: 100, desc: 'Some months feel rich, some months count every rupiah', source: 'HSBC Expat', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-031', 'SR-010'] },
      { id: 10, type: 'bottleneck', label: 'Stabilizes income?', x: 520, y: 270, prob: 20, desc: 'Inconsistent foreign income is the norm, not the exception', source: 'Pattern analysis (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-012'] },
      { id: 11, type: 'outcome-bad', label: 'Forever hustling, never stable', x: 520, y: 420, prob: 100, desc: 'Always one bad month away from crisis', source: 'Expat surveys (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-007', 'SR-014'] },
      { id: 4, type: 'bottleneck', label: 'Build $3K+/mo consistently', x: 520, y: 120, prob: 30, desc: '$3K/mo in Indonesia = provides comfortably + saves', source: 'Cost of living (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Income swings, anxiety persists', x: 520, y: 320, prob: 100, desc: 'Inconsistent income is worse psychologically than low but stable', source: 'Behavioral econ (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-001', 'SR-011'] },
      { id: 6, type: 'decision', label: 'Support family + save + grow?', x: 780, y: 120, prob: 40, desc: 'Triple constraint: lifestyle, family obligations, investment', source: 'Financial planning (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-019', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: 'Burnt out trying to do everything', x: 780, y: 320, prob: 100, desc: 'Provider burnout: when the pressure exceeds the capacity', source: 'Mental health data (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-014', 'SR-011'] },
      { id: 8, type: 'outcome-good', label: 'Stable, respected, at peace', x: 1040, y: 60, prob: 100, desc: 'Financial stability + purpose = highest male life satisfaction', source: 'Gallup wellbeing', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-019', 'SR-004'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3, label: 'no' }, { from: 2, to: 9, label: 'partial' }, { from: 2, to: 4, label: 'yes' },
      { from: 9, to: 10 }, { from: 10, to: 4, label: 'pass' }, { from: 10, to: 11, label: 'fail' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
      { from: 6, to: 7, label: 'no' }, { from: 6, to: 8, label: 'yes' },
    ]
  },
  richard_providerMin: {
    title: 'Become a Provider Before 30 (Summary)',
    input: 'A young man abroad tries to become financially stable enough to provide for his family',
    nodes: [
      { id: 1, type: 'desire', label: 'Young man abroad wants to provide', x: 0, y: 150, prob: 100, desc: '72% of men cite "providing" as core identity. For expats, pressure intensifies', source: 'Pew Research 2024', sourceUrl: 'https://www.pewresearch.org/', sacredRoots: ['SR-020', 'SR-019'] },
      { id: 2, type: 'bottleneck', label: 'Find stable income abroad?', x: 300, y: 150, prob: 35, desc: '65% of young expats struggle financially for 2+ years', source: 'HSBC Expat Survey 2024', sourceUrl: 'https://www.expatexplorer.hsbc.com/', sacredRoots: ['SR-031', 'SR-001'] },
      { id: 3, type: 'outcome-bad', label: 'Dependent — shame and anxiety', x: 300, y: 350, prob: 100, desc: 'Financial dependence linked to 3x higher depression in young men', source: 'APA 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.apa.org/pubs/reports', sacredRoots: ['SR-018', 'SR-009'] },
      { id: 4, type: 'bottleneck', label: 'Scale to $3K+/mo and save?', x: 600, y: 150, prob: 30, desc: '$3K/mo in Indonesia = comfortable + savings. Only 30% cross this threshold', source: 'Payoneer 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.payoneer.com/resources/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: 'Plateau or burnout', x: 600, y: 350, prob: 100, desc: '60% either plateau at $2K or burn out trying to do everything', source: 'Digital nomad surveys (estimated by Foresight from public data)', sourceUrl: 'https://nomadlist.com/', sacredRoots: ['SR-014', 'SR-013'] },
      { id: 6, type: 'outcome-good', label: 'Stable, respected, at peace before 30', x: 900, y: 100, prob: 100, desc: 'Financial stability + purpose = highest male life satisfaction', source: 'Gallup Wellbeing 2024', sourceUrl: 'https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx', sacredRoots: ['SR-019', 'SR-004'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
    ]
  },

  richard_polymarket: {
    title: 'Prediction Market Trading',
    input: 'Someone tries to make consistent profit trading on Polymarket',
    nodes: [
      // Main path: discover → deposit → trade → edge → scale → compound
      { id: 1, type: 'state', label: '1000 people discover prediction markets', x: 0, y: 200, prob: 100, desc: 'Polymarket peaked at $3.2B monthly volume (Oct 2024, US election). 2025 avg: $500M-1B/mo. Growing 300%+ YoY', source: 'Polymarket on-chain data 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-035', 'SR-013'] },
      { id: 2, type: 'action', label: 'Create account, deposit USDC', x: 200, y: 200, prob: 100, desc: 'USDC on Polygon — low barrier. Avg first deposit: $50-200. KYC required since Jan 2025', source: 'Polymarket 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'action', label: 'Start trading on gut feeling', x: 400, y: 200, prob: 100, desc: '90%+ of new traders start with gut/news-based trades. No backtesting, no model, no edge', source: 'Retail trading behavior studies (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-011', 'SR-017'] },
      { id: 4, type: 'state', label: '600-700 lose money in first month', x: 600, y: 200, prob: 70, desc: '70-80% of retail traders lose money across all markets. Prediction markets no different — efficient pricing punishes noise traders', source: 'ESMA Retail Trading Report 2024', sourceUrl: 'https://www.esma.europa.eu/', sacredRoots: ['SR-011', 'SR-015'] },
      { id: 5, type: 'gate', label: 'Recognizes need for systematic edge?', x: 800, y: 200, prob: 20, desc: 'Only 15-20% of losing traders seek data-driven approach. Rest double down on gut feeling or quit', source: 'Trading psychology research (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-035'] },

      // NO path: emotional trading spiral
      { id: 10, type: 'trajectory', label: 'Emotional trading: chase losses, revenge trade', x: 800, y: 480, prob: 100, desc: 'Loss aversion triggers: traders hold losers 2x longer than winners (disposition effect). Avg retail loss: 30-50% of capital in year 1', source: 'Barber & Odean 2024 (estimated by Foresight from public data)', sourceUrl: 'https://faculty.haas.berkeley.edu/odean/', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 11, type: 'action', label: 'Deposit more to recover losses', x: 1000, y: 480, prob: 100, desc: 'Sunk cost fallacy: 45% of losing traders deposit additional funds within 30 days of significant loss', source: 'Crypto trading analytics (estimated by Foresight from public data)', sourceUrl: 'https://www.esma.europa.eu/', sacredRoots: ['SR-011', 'SR-015'] },
      { id: 12, type: 'bottleneck', label: 'Stops before total wipeout?', x: 1200, y: 480, prob: 30, desc: '70% of emotional traders continue until account is depleted or nearly so', source: 'Retail trading data (estimated by Foresight from public data)', sourceUrl: 'https://www.esma.europa.eu/', sacredRoots: ['SR-011', 'SR-001'] },
      { id: 13, type: 'outcome-bad', label: 'Account blown — joins the 80% who lose', x: 1400, y: 540, prob: 100, desc: 'Total capital loss. Avg blown account: $500-2000 for retail prediction market traders', source: 'On-chain analytics (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 14, type: 'state', label: 'Stopped early — lesson learned', x: 1400, y: 420, prob: 100, desc: '30% who stop early: some return with better strategy, most quit trading permanently', source: 'Trading behavior analysis (estimated by Foresight from public data)', sourceUrl: 'https://www.esma.europa.eu/', sacredRoots: ['SR-017', 'SR-001'] },

      // PARTIAL path: dabble in data but no commitment
      { id: 20, type: 'state', label: 'Builds basic model but trades emotionally still', x: 800, y: -20, prob: 100, desc: '10-15% try spreadsheets/basic models but override them with gut feeling when stakes are high', source: 'Quantitative trading research (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 21, type: 'trajectory', label: 'Model says X, gut says Y — follows gut', x: 1000, y: -20, prob: 100, desc: 'Algo override rate: 60-70% of semi-systematic traders override their models on high-conviction trades', source: 'Trading psychology (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-014'] },
      { id: 22, type: 'bottleneck', label: 'Commits to pure systematic trading?', x: 1200, y: -20, prob: 30, desc: 'Only 30% of semi-systematic traders fully commit to model-driven execution. Rest stay hybrid (underperforming)', source: 'Algo trading conversion (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 23, type: 'outcome-bad', label: 'Hybrid approach: slight losses, lots of stress', x: 1400, y: -80, prob: 100, desc: 'Semi-systematic traders: median return -5% to +5% annually. High effort, low reward', source: 'Trading performance studies (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 24, type: 'state', label: 'Fully systematic — joins the algo path', x: 1400, y: 40, prob: 100, desc: 'Transition to pure algo: removes emotion, enables backtesting, scales linearly', source: 'Market microstructure (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-012'] },

      // YES path: systematic edge
      { id: 30, type: 'state', label: '150-200 build real systematic edge', x: 1000, y: 200, prob: 100, desc: 'Edge types in prediction markets: latency arbitrage (crypto), ELO/statistical models (sports), sentiment scraping (politics)', source: 'Polymarket leaderboard analysis 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 31, type: 'action', label: 'Backtest strategy on historical data', x: 1200, y: 200, prob: 100, desc: 'Backtesting: strategies that work in backtest work live only 30-40% of the time (overfitting, regime change)', source: 'Quantitative finance (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 32, type: 'bottleneck', label: 'Strategy survives live market?', x: 1400, y: 200, prob: 35, desc: 'Live vs backtest: slippage, latency, liquidity gaps. 65% of backtested strategies fail live', source: 'Algo trading data (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 33, type: 'outcome-bad', label: 'Strategy fails live — back to drawing board', x: 1600, y: 280, prob: 100, desc: 'Most quant traders iterate 5-10 strategies before finding one that works live', source: 'Quant community data (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-009'] },
      { id: 34, type: 'action', label: 'Deploy bot with strict risk limits', x: 1600, y: 200, prob: 100, desc: 'Kelly Criterion position sizing: bet fraction = edge/odds. Max 2-5% per position. Stop-loss at 15-20% drawdown', source: 'Kelly Criterion — Thorp 2006 (estimated by Foresight from public data)', sourceUrl: 'https://en.wikipedia.org/wiki/Kelly_criterion', sacredRoots: ['SR-011', 'SR-017'] },
      { id: 35, type: 'bottleneck', label: 'Scale without blowing up?', x: 1800, y: 200, prob: 40, desc: 'Position sizing is everything. Top 10 Polymarket traders all use fractional Kelly. 60% of profitable traders blow up when scaling too fast', source: 'Trading risk management (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 36, type: 'outcome-bad', label: 'One concentrated bet wipes months of gains', x: 2000, y: 270, prob: 100, desc: 'Concentration risk: single event can erase 3-6 months of profit. Even top traders blow up 1-2x/year', source: 'Trading performance (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-031'] },
      { id: 37, type: 'outcome-good', label: 'Consistent profits + compounding', x: 2000, y: 130, prob: 100, desc: 'Top Polymarket traders: 20-50% annual returns. Top 1%: $100K-1M+ annual profit. Compounding at 30%/yr doubles capital every 2.5 years', source: 'Polymarket leaderboard 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-035'] },

      // Market-specific branches
      { id: 40, type: 'decision', label: 'Which market vertical? Sports/Crypto/Politics', x: 1000, y: 360, prob: 50, desc: 'Sports: highest volume, most data, most competition. Politics: seasonal spikes. Crypto: fastest alpha decay', source: 'Polymarket volume analysis 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 41, type: 'action', label: 'Sports: build ELO/XGBoost model', x: 1200, y: 360, prob: 100, desc: 'Sports models: ELO ratings + XGBoost/random forest on player stats. Edge: 2-5% over market when calibrated well', source: 'Sports analytics (estimated by Foresight from public data)', sourceUrl: 'https://fivethirtyeight.com/', sacredRoots: ['SR-017', 'SR-035'] },
      { id: 42, type: 'action', label: 'Crypto: latency arbitrage bot', x: 1200, y: 440, prob: 100, desc: 'Crypto latency arb: exploit price differences between CEX and Polymarket. Requires <100ms execution. Edge: 1-3% per trade', source: 'Market microstructure (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-017', 'SR-012'] },

      // Bankroll management branch
      { id: 43, type: 'action', label: 'Track every trade: P&L journal', x: 1400, y: 360, prob: 100, desc: 'Traders who journal: 30% higher returns than non-journalers. Forces honest assessment of edge vs luck', source: 'Trading psychology (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-011'] },
      { id: 44, type: 'bottleneck', label: 'Honest about actual edge vs luck?', x: 1600, y: 360, prob: 35, desc: '65% of profitable traders in a given month are simply lucky (survivorship bias). Only journaling reveals true edge', source: 'Taleb — Fooled by Randomness (estimated by Foresight from public data)', sourceUrl: 'https://www.fooledbyrandomness.com/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 45, type: 'outcome-bad', label: 'Confuses luck for skill — eventual blowup', x: 1800, y: 420, prob: 100, desc: 'The "hot hand" fallacy: traders who mistake luck for skill increase position sizes and eventually blow up', source: 'Behavioral finance (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-011', 'SR-015'] },

      // Convergence
      { id: 50, type: 'outcome-good', label: 'Sustainable prediction market income', x: 2200, y: 200, prob: 100, desc: 'The 2-5% who survive: systematic edge + risk management + emotional discipline. Median profitable trader: $5-20K/year. Top decile: $50K+', source: 'Composite analysis (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-035'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }, { from: 4, to: 5 },
      // Gate: NO / PARTIAL / YES
      { from: 5, to: 10, label: 'no (60-65%)' },
      { from: 5, to: 20, label: 'partial (15-20%)' },
      { from: 5, to: 30, label: 'yes (15-20%)' },
      // NO path
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 12, to: 13, label: 'fail' }, { from: 12, to: 14, label: 'pass' },
      { from: 14, to: 30 },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 30 },
      // YES path
      { from: 30, to: 31 }, { from: 31, to: 32 },
      { from: 32, to: 33, label: 'fail' }, { from: 32, to: 34, label: 'pass' },
      { from: 34, to: 35 },
      { from: 35, to: 36, label: 'fail' }, { from: 35, to: 37, label: 'pass' },
      // Market vertical branch
      { from: 30, to: 40 },
      { from: 40, to: 41, label: 'yes' }, { from: 40, to: 42, label: 'no' },
      { from: 41, to: 31 }, { from: 42, to: 31 },
      // Bankroll management
      { from: 34, to: 43 }, { from: 43, to: 44 },
      { from: 44, to: 45, label: 'fail' }, { from: 44, to: 35, label: 'pass' },
      // Convergence
      { from: 37, to: 50 },
    ]
  },
  richard_polymarketMid: {
    title: 'Prediction Market Trading (Analysis)',
    input: 'Someone tries to make consistent profit trading on Polymarket',
    nodes: [
      { id: 1, type: 'state', label: 'Discover prediction markets', x: 0, y: 120, prob: 100, desc: 'Polymarket: $1B+ monthly volume in 2025', source: 'Polymarket data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-035', 'SR-013'] },
      { id: 2, type: 'action', label: 'Deposit and start trading', x: 260, y: 120, prob: 100, desc: 'USDC on Polygon -- low barrier to entry', source: 'Polymarket (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 3, type: 'bottleneck', label: 'Beat the market consistently?', x: 520, y: 120, prob: 20, desc: 'Prediction markets are efficient -- hard to find alpha', source: 'Academic research (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 4, type: 'outcome-bad', label: 'Emotional trading, lose money', x: 520, y: 320, prob: 100, desc: '80% of retail traders lose money in any market', source: 'SEC data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-011', 'SR-015'] },
      { id: 5, type: 'decision', label: 'Build systematic edge (bots/data)?', x: 780, y: 120, prob: 30, desc: 'Algorithmic traders capture 60-80% of market alpha', source: 'Market microstructure (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 6, type: 'outcome-bad', label: 'Manual trading, slow bleed', x: 780, y: 320, prob: 100, desc: 'Without edge, you are the liquidity for smarter players', source: 'Trading axiom (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 7, type: 'bottleneck', label: 'Scale without blowing up', x: 1040, y: 120, prob: 40, desc: 'Position sizing and risk management separate winners from losers', source: 'Kelly Criterion (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://en.wikipedia.org/wiki/Kelly_criterion', sacredRoots: ['SR-011', 'SR-014'] },
      { id: 8, type: 'outcome-good', label: 'Consistent profits + compounding', x: 1300, y: 60, prob: 100, desc: 'Top Polymarket traders: 20-50% annual returns', source: 'Leaderboard data (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-035'] },
      { id: 9, type: 'outcome-bad', label: 'One bad bet wipes gains', x: 1300, y: 280, prob: 100, desc: 'Concentration risk: one event can erase months of profit', source: 'Risk management (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-011', 'SR-031'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6, label: 'no' }, { from: 5, to: 7, label: 'yes' },
      { from: 7, to: 8, label: 'pass' }, { from: 7, to: 9, label: 'fail' },
    ]
  },
  richard_polymarketMin: {
    title: 'Prediction Market Trading (Summary)',
    input: 'Someone tries to make consistent profit trading on Polymarket',
    nodes: [
      { id: 1, type: 'state', label: 'Discover Polymarket, deposit USDC', x: 0, y: 150, prob: 100, desc: 'Polymarket: $500M-1B monthly volume 2025. Low barrier to entry', source: 'Polymarket 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-035', 'SR-013'] },
      { id: 2, type: 'bottleneck', label: 'Beat the market consistently?', x: 300, y: 150, prob: 20, desc: '70-80% of retail traders lose money. Prediction markets are efficient', source: 'ESMA 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.esma.europa.eu/', sacredRoots: ['SR-035', 'SR-017'] },
      { id: 3, type: 'outcome-bad', label: 'Emotional trading — account blown', x: 300, y: 350, prob: 100, desc: '80% of retail traders lose. Avg loss: 30-50% of capital in year 1', source: 'SEC data (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-011', 'SR-015'] },
      { id: 4, type: 'decision', label: 'Build systematic bot/model?', x: 600, y: 150, prob: 30, desc: 'Algorithmic traders capture 60-80% of market alpha', source: 'Market microstructure (estimated by Foresight from public data)', sourceUrl: 'https://www.sec.gov/edgar/', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 5, type: 'outcome-bad', label: 'Manual trading — slow bleed', x: 600, y: 350, prob: 100, desc: 'Without edge, you are liquidity for smarter players', source: 'Trading axiom (estimated by Foresight from public data)', sacredRoots: ['SR-035', 'SR-012'] },
      { id: 6, type: 'outcome-good', label: 'Consistent profits + compounding', x: 900, y: 100, prob: 100, desc: 'Top traders: 20-50% annual returns. The 2-5% who survive', source: 'Polymarket leaderboard 2025 (estimated by Foresight from public data)', sourceUrl: 'https://polymarket.com/', sacredRoots: ['SR-011', 'SR-035'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'no' }, { from: 4, to: 6, label: 'yes' },
    ]
  },

  richard_leverage: {
    title: 'From Manual Labor to Leverage',
    input: 'Someone escapes trading time for money and builds leverage-based income',
    nodes: [
      // Main path: linear income → desire → leverage type → build → scale → freedom
      { id: 1, type: 'state', label: '1000 people trading hours for dollars', x: 0, y: 200, prob: 100, desc: '85% of workers globally earn linear income (hourly/salary). Income capped by hours available. Max ~2,080 hrs/year', source: 'BLS 2025 + ILO World Employment Report 2024', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 2, type: 'desire', label: 'Want income that compounds without them', x: 200, y: 200, prob: 100, desc: '"If you dont find a way to make money while you sleep, you will work until you die" — Warren Buffett. 73% of millennials want passive income', source: 'Bankrate Financial Freedom Survey 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.bankrate.com/', sacredRoots: ['SR-007', 'SR-017'] },
      { id: 3, type: 'action', label: 'Try side projects while still employed', x: 400, y: 200, prob: 100, desc: '44% of Americans have a side hustle in 2024. Avg hours spent: 12/week. Most earn <$500/mo from it', source: 'Bankrate Side Hustle Survey 2024', sourceUrl: 'https://www.bankrate.com/', sacredRoots: ['SR-012', 'SR-008'] },
      { id: 4, type: 'gate', label: 'Identifies real leverage type?', x: 600, y: 200, prob: 15, desc: 'Naval Ravikant: only 3 forms of true leverage — Code (software), Content (media), Capital (money). 85% pick wrong type or none', source: 'Naval Ravikant (estimated by Foresight from public data)', sourceUrl: 'https://nav.al/', sacredRoots: ['SR-017', 'SR-012'] },

      // NO path: self-employed trap
      { id: 10, type: 'state', label: 'Quits job, becomes self-employed', x: 600, y: 480, prob: 100, desc: '"Most freelancers just bought themselves a job" — Michael Gerber. Self-employed work 20% more hours than employees for similar income', source: 'E-Myth Revisited + BLS 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.emyth.com/', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 11, type: 'trajectory', label: 'Still trading time — with more stress', x: 800, y: 480, prob: 100, desc: 'Freelancer income volatility: 40% report >50% month-to-month variation. No benefits, no PTO, no safety net', source: 'Upwork Freelance Forward 2024', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-031', 'SR-014'] },
      { id: 12, type: 'decision', label: 'Productize the service?', x: 1000, y: 480, prob: 25, desc: 'Service-to-product transition: 25% attempt it, 10% succeed. Key: package repeatable work into fixed-price deliverable', source: 'Productized consulting data (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 13, type: 'outcome-bad', label: 'Freelance treadmill — busy but not building', x: 1200, y: 540, prob: 100, desc: 'The freelancer trap: too busy serving clients to build leverage. 75% of freelancers stay here for 3+ years', source: 'Freelance economy research (estimated by Foresight from public data)', sourceUrl: 'https://www.upwork.com/resources/freelancing-stats', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 14, type: 'state', label: 'Productized service — first leverage', x: 1200, y: 420, prob: 100, desc: 'Productized services: fixed scope, fixed price, delegatable. Avg revenue: $5-20K/mo for successful ones', source: 'Indie Hackers 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-036'] },

      // PARTIAL path: picked leverage type but cant execute
      { id: 20, type: 'state', label: 'Picked leverage type but building slowly', x: 600, y: -20, prob: 100, desc: '10-15% identify correct leverage but struggle with execution. Still employed, building nights/weekends', source: 'Side project data (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-009'] },
      { id: 21, type: 'trajectory', label: 'Energy split: day job + side build', x: 800, y: -20, prob: 100, desc: 'Split attention: 85% of side projects fail because founder cant dedicate enough time. Avg: 10hrs/week is not enough for real leverage', source: 'Indie Hackers survey 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-014', 'SR-009'] },
      { id: 22, type: 'bottleneck', label: 'Reaches $1K/mo from leverage asset?', x: 1000, y: -20, prob: 20, desc: '$1K/mo is the validation threshold. Only 20% of side projects reach this. Median time: 12-18 months', source: 'Stripe Atlas data 2024 (estimated by Foresight from public data)', sourceUrl: 'https://stripe.com/atlas', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 23, type: 'outcome-bad', label: 'Side project dies — back to linear income', x: 1200, y: -80, prob: 100, desc: '80% of side projects generate <$100/mo and are abandoned within 2 years', source: 'Stripe data 2024 (estimated by Foresight from public data)', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-031', 'SR-009'] },
      { id: 24, type: 'state', label: '$1K/mo validated — enters growth path', x: 1200, y: 40, prob: 100, desc: 'First $1K/mo proves the model. Now the question is: can it 5x?', source: 'Indie Hackers 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-036'] },

      // YES path: real leverage building
      { id: 30, type: 'state', label: '150 choose correct leverage and commit', x: 800, y: 200, prob: 100, desc: '15% identify and commit to real leverage. Code leverage: SaaS/tools. Content leverage: audience/media. Capital leverage: investing', source: 'Naval Ravikant framework (estimated by Foresight from public data)', sourceUrl: 'https://nav.al/', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 31, type: 'decision', label: 'Product-first or audience-first?', x: 1000, y: 200, prob: 50, desc: 'Audience-first has 3x higher success rate (30% vs 10%). But takes longer to start earning', source: 'SPI research 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.smartpassiveincome.com/', sacredRoots: ['SR-017', 'SR-025'] },
      { id: 32, type: 'action', label: 'Build audience first (content leverage)', x: 1200, y: 120, prob: 100, desc: 'Creator economy: 50M+ creators globally, but only 4% earn >$100K/year. Median full-time creator: $44K/year', source: 'Linktree Creator Report 2024 (estimated by Foresight from public data)', sourceUrl: 'https://linktr.ee/', sacredRoots: ['SR-025', 'SR-012'] },
      { id: 33, type: 'action', label: 'Build product first (code leverage)', x: 1200, y: 280, prob: 100, desc: 'SaaS: 92% of SaaS companies fail within 3 years. But survivors enjoy 70-80% gross margins and recurring revenue', source: 'McKinsey SaaS report 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.mckinsey.com/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 34, type: 'bottleneck', label: 'Reach $5K/mo from leverage asset?', x: 1400, y: 200, prob: 20, desc: 'Only 4% of online businesses reach $5K/mo. Median online business: $0-500/mo. The gap between $1K and $5K is where most die', source: 'Indie Hackers 2024 + Stripe data', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 35, type: 'outcome-bad', label: '$200-500/mo — not enough to quit', x: 1600, y: 280, prob: 100, desc: 'The "almost there" trap: enough to feel progress but not enough to replace income. 70% stay here for years', source: 'Stripe data 2024 (estimated by Foresight from public data)', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 36, type: 'state', label: '$5K/mo leverage income achieved', x: 1600, y: 130, prob: 100, desc: '$5K/mo = quits day job territory. In low-cost country (Indonesia): wealthy. In US/EU: baseline', source: 'Financial planning (estimated by Foresight from public data)', sourceUrl: 'https://www.numbeo.com/', sacredRoots: ['SR-031', 'SR-012'] },
      { id: 37, type: 'bottleneck', label: 'Scale to $10K+/mo?', x: 1800, y: 130, prob: 40, desc: '$5K → $10K requires hiring, systems, or new channels. 60% plateau at $5-8K', source: 'Indie Hackers scaling data (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-036'] },
      { id: 38, type: 'outcome-bad', label: 'Comfortable plateau at $5-8K', x: 2000, y: 200, prob: 100, desc: 'Golden handcuffs: comfortable enough to stop pushing, not wealthy enough to have true freedom', source: 'Lifestyle business research (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-013', 'SR-014'] },
      { id: 39, type: 'outcome-good', label: '$10K+/mo — real leverage achieved', x: 2000, y: 70, prob: 100, desc: 'The 2-4% who reach $10K+/mo leverage income: highest reported life satisfaction, time freedom, and optionality', source: 'Indie Hackers 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-031', 'SR-012'] },

      // Stacking leverage
      { id: 40, type: 'action', label: 'Stack leverage: code + content + capital', x: 1800, y: 350, prob: 100, desc: 'Naval: "Fortunes require leverage. Business leverage: labor, capital, code, media. Code and media are permissionless"', source: 'Naval Ravikant (estimated by Foresight from public data)', sourceUrl: 'https://nav.al/', sacredRoots: ['SR-017', 'SR-012'] },
      { id: 41, type: 'state', label: 'Multiple income streams compounding', x: 2000, y: 350, prob: 100, desc: 'Millionaires avg 7 income streams. Leverage stacking: SaaS + audience + investing = exponential growth', source: 'IRS data analysis (estimated by Foresight from public data)', sourceUrl: 'https://www.irs.gov/statistics', sacredRoots: ['SR-031', 'SR-017'] },

      // Capital leverage sub-branch
      { id: 42, type: 'action', label: 'Invest profits into index funds/assets', x: 1800, y: 450, prob: 100, desc: 'Capital leverage: S&P 500 avg return 10.5%/yr. $5K/mo invested = $1M in ~8 years with compounding', source: 'Vanguard 2024 (estimated by Foresight from public data)', sourceUrl: 'https://investor.vanguard.com/', sacredRoots: ['SR-031', 'SR-011'] },
      { id: 43, type: 'bottleneck', label: 'Maintains 50%+ savings rate?', x: 2000, y: 450, prob: 30, desc: 'FIRE movement: 50% savings rate = financial independence in 17 years. But lifestyle inflation kills 70% of attempts', source: 'FIRE community data (estimated by Foresight from public data)', sourceUrl: 'https://www.mrmoneymustache.com/', sacredRoots: ['SR-011', 'SR-013'] },
      { id: 44, type: 'outcome-bad', label: 'Lifestyle inflation eats the leverage gains', x: 2200, y: 450, prob: 100, desc: 'Parkinson law: spending expands to match income. $10K/mo becomes $10K/mo expenses. Back to linear', source: 'Behavioral finance (estimated by Foresight from public data)', sourceUrl: 'https://www.bankrate.com/', sacredRoots: ['SR-013', 'SR-011'] },

      // Convergence
      { id: 50, type: 'outcome-good', label: 'Time freedom + compounding wealth', x: 2200, y: 200, prob: 100, desc: 'The 2-4% who escape linear income: income grows while they sleep, time is freed for family/purpose/health. Avg net worth 10x peers within 10 years', source: 'Wealth research (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-031', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
      // Gate: NO / PARTIAL / YES
      { from: 4, to: 10, label: 'no (55-60%)' },
      { from: 4, to: 20, label: 'partial (10-15%)' },
      { from: 4, to: 30, label: 'yes (15%)' },
      // NO path: self-employed trap
      { from: 10, to: 11 }, { from: 11, to: 12 },
      { from: 12, to: 13, label: 'no' }, { from: 12, to: 14, label: 'yes' },
      { from: 14, to: 34 },
      // PARTIAL path
      { from: 20, to: 21 }, { from: 21, to: 22 },
      { from: 22, to: 23, label: 'fail' }, { from: 22, to: 24, label: 'pass' },
      { from: 24, to: 34 },
      // YES path
      { from: 30, to: 31 },
      { from: 31, to: 32, label: 'yes' }, { from: 31, to: 33, label: 'no' },
      { from: 32, to: 34 }, { from: 33, to: 34 },
      { from: 34, to: 35, label: 'fail' }, { from: 34, to: 36, label: 'pass' },
      { from: 36, to: 37 },
      { from: 37, to: 38, label: 'fail' }, { from: 37, to: 39, label: 'pass' },
      // Stacking leverage
      { from: 36, to: 40 }, { from: 40, to: 41 },
      // Capital leverage sub-branch
      { from: 36, to: 42 }, { from: 42, to: 43 },
      { from: 43, to: 44, label: 'fail' }, { from: 43, to: 50, label: 'pass' },
      // Convergence
      { from: 39, to: 50 }, { from: 41, to: 50 },
    ]
  },
  richard_leverageMid: {
    title: 'From Manual Labor to Leverage (Analysis)',
    input: 'Someone escapes trading time for money and builds leverage-based income',
    nodes: [
      { id: 1, type: 'state', label: 'Trading hours for dollars', x: 0, y: 120, prob: 100, desc: '85% of workers are paid hourly/salary -- linear income', source: 'BLS 2025', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 2, type: 'desire', label: 'Want income while sleeping', x: 260, y: 120, prob: 100, desc: '"If you don\'t find a way to make money while you sleep..." -- Buffett', source: 'Warren Buffett (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.berkshirehathaway.com/letters/letters.html', sacredRoots: ['SR-007', 'SR-017'] },
      { id: 3, type: 'bottleneck', label: 'Build something that works without you', x: 520, y: 120, prob: 15, desc: 'Code, content, capital -- only 3 forms of true leverage', source: 'Naval Ravikant (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://nav.al/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 4, type: 'outcome-bad', label: 'Self-employed but still trading time', x: 520, y: 320, prob: 100, desc: 'Most freelancers/consultants just bought themselves a job', source: 'E-Myth (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.emyth.com/', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 5, type: 'decision', label: 'Product or audience first?', x: 780, y: 120, prob: 50, desc: 'Audience-first has 3x higher success rate than product-first', source: 'SPI research (estimated by Foresight from public data -- not an official source)', sourceUrl: 'https://www.smartpassiveincome.com/', sacredRoots: ['SR-017', 'SR-025'] },
      { id: 6, type: 'bottleneck', label: 'Reach $5K/mo passive/semi-passive', x: 1040, y: 120, prob: 20, desc: 'Only 4% of online businesses reach $5K/mo', source: 'Indie Hackers', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 7, type: 'outcome-bad', label: '$200/mo -- not enough to live on', x: 1040, y: 320, prob: 100, desc: 'Median online business revenue: $0-500/mo', source: 'Stripe data', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 8, type: 'outcome-good', label: 'Time freedom + growing income', x: 1300, y: 60, prob: 100, desc: 'The 4% who break through report highest life satisfaction', source: 'Lifestyle surveys (estimated by Foresight from public data -- not an official source)', sacredRoots: ['SR-031', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 }, { from: 2, to: 3 },
      { from: 3, to: 4, label: 'fail' }, { from: 3, to: 5, label: 'pass' },
      { from: 5, to: 6 }, { from: 6, to: 7, label: 'fail' }, { from: 6, to: 8, label: 'pass' },
    ]
  },
  richard_leverageMin: {
    title: 'From Manual Labor to Leverage (Summary)',
    input: 'Someone escapes trading time for money and builds leverage-based income',
    nodes: [
      { id: 1, type: 'state', label: 'Trading hours for dollars', x: 0, y: 150, prob: 100, desc: '85% of workers earn linear income — capped by hours available', source: 'BLS 2025', sourceUrl: 'https://www.bls.gov/', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 2, type: 'bottleneck', label: 'Build something that works without you?', x: 300, y: 150, prob: 15, desc: 'Code, content, capital — only 3 forms of true leverage. 85% never find the right one', source: 'Naval Ravikant (estimated by Foresight from public data)', sourceUrl: 'https://nav.al/', sacredRoots: ['SR-012', 'SR-017'] },
      { id: 3, type: 'outcome-bad', label: 'Self-employed but still trading time', x: 300, y: 350, prob: 100, desc: 'Most freelancers just bought themselves a job. No real leverage', source: 'E-Myth (estimated by Foresight from public data)', sourceUrl: 'https://www.emyth.com/', sacredRoots: ['SR-031', 'SR-005'] },
      { id: 4, type: 'bottleneck', label: 'Reach $5K/mo passive/semi-passive?', x: 600, y: 150, prob: 20, desc: 'Only 4% of online businesses reach $5K/mo', source: 'Indie Hackers 2024 (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-012', 'SR-031'] },
      { id: 5, type: 'outcome-bad', label: '$200/mo — not enough to live on', x: 600, y: 350, prob: 100, desc: 'Median online business: $0-500/mo', source: 'Stripe data 2024 (estimated by Foresight from public data)', sourceUrl: 'https://stripe.com/reports', sacredRoots: ['SR-031', 'SR-007'] },
      { id: 6, type: 'outcome-good', label: 'Time freedom + compounding wealth', x: 900, y: 100, prob: 100, desc: 'The 2-4% who break through: income grows while they sleep', source: 'Lifestyle research (estimated by Foresight from public data)', sourceUrl: 'https://www.indiehackers.com/', sacredRoots: ['SR-031', 'SR-012'] },
    ],
    edges: [
      { from: 1, to: 2 },
      { from: 2, to: 3, label: 'fail' }, { from: 2, to: 4, label: 'pass' },
      { from: 4, to: 5, label: 'fail' }, { from: 4, to: 6, label: 'pass' },
    ]
  },
};
