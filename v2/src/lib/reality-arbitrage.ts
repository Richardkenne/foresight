// ── Reality Arbitrage Engine ──
// Finds gaps between public perception and data-backed reality

export interface ArbitrageOpportunity {
  id: string;
  category: 'business' | 'career' | 'investment' | 'lifestyle' | 'geography';
  title: string;
  publicPerception: string;
  dataReality: string;
  gapScore: number; // 1-10
  evidence: string[];
  actionable: string;
  opportunity: string;
  simulateScenario: string; // pre-filled scenario for /sim
}

const OPPORTUNITIES: ArbitrageOpportunity[] = [
  // ── BUSINESS (10) ──
  {
    id: 'biz-dark-kitchen',
    category: 'business',
    title: 'Dark Kitchens > Traditional Restaurants',
    publicPerception: 'Opening a restaurant is a dream career worth pursuing',
    dataReality: '60% of restaurants fail within year 1. Dark/ghost kitchens have 2.3x higher survival rate with 70% lower startup costs ($30K vs $275K average)',
    gapScore: 9,
    evidence: [
      'BLS Business Employment Dynamics 2024 — restaurant 1-year failure rate',
      'National Restaurant Association 2024 Industry Report',
      'Euromonitor Ghost Kitchen Market Report 2024',
    ],
    actionable: 'Launch a delivery-only kitchen concept. Test demand with a single menu on 2-3 platforms before signing any lease.',
    opportunity: 'Underpriced market: most aspiring restaurateurs ignore dark kitchens because they lack the "dream" factor',
    simulateScenario: 'I want to start a food business — dark kitchen vs traditional restaurant',
  },
  {
    id: 'biz-boring-business',
    category: 'business',
    title: 'Boring Businesses > Tech Startups',
    publicPerception: 'Tech startups are the best path to wealth creation',
    dataReality: 'Laundromats, car washes, and vending routes have 80%+ 5-year survival rates. Only 0.05% of startups get VC funding, and 75% of VC-backed startups fail.',
    gapScore: 9,
    evidence: [
      'SBA Office of Advocacy 2024 — small business survival by industry',
      'Cambridge Associates — VC return data 2024',
      'Coin Laundry Association — industry survival statistics',
    ],
    actionable: 'Acquire or start a service-based "boring" business with proven unit economics before attempting anything novel.',
    opportunity: 'Talent and capital flow to tech, leaving boring businesses with less competition and higher margins',
    simulateScenario: 'I want to build wealth — boring business (laundromat) vs tech startup',
  },
  {
    id: 'biz-franchise',
    category: 'business',
    title: 'Franchise > Independent Business',
    publicPerception: 'Franchises are uncreative and overpriced — build your own brand',
    dataReality: 'Franchises have a 92% 5-year survival rate vs 50% for independent businesses. Average franchise revenue: $1.2M/year.',
    gapScore: 7,
    evidence: [
      'International Franchise Association 2024 Economic Outlook',
      'BLS BED 2024 — independent business survival rates',
      'FRANdata Franchise Performance Reports 2024',
    ],
    actionable: 'Research franchise opportunities in growing sectors (fitness, senior care, home services) with validated unit economics.',
    opportunity: 'Perception of "boring" keeps smart operators away from proven systems',
    simulateScenario: 'Should I open a franchise or start an independent business?',
  },
  {
    id: 'biz-b2b-saas',
    category: 'business',
    title: 'B2B SaaS > B2C Apps',
    publicPerception: 'Consumer apps (next Instagram, TikTok) are where the money is',
    dataReality: 'B2B SaaS has 3x higher success rate than B2C. Median B2B SaaS has 2-5% monthly churn vs 8-12% for B2C. B2B customers pay 10-100x more per user.',
    gapScore: 8,
    evidence: [
      'PitchBook 2024 — B2B vs B2C startup outcomes',
      'Bessemer Cloud Index 2024 — SaaS metrics',
      'CB Insights State of Venture 2024',
    ],
    actionable: 'Build a SaaS tool that solves a specific workflow problem for a niche industry. Start with 10 paying customers, not 10K free users.',
    opportunity: 'Media glorifies B2C winners; survivorship bias hides millions of failed consumer apps',
    simulateScenario: 'I want to build a software company — B2B SaaS vs B2C consumer app',
  },
  {
    id: 'biz-service-first',
    category: 'business',
    title: 'Service Business > Product Business',
    publicPerception: 'Products scale better — services are a trap',
    dataReality: 'Service businesses reach profitability in 3-6 months vs 18-24 months for products. 78% of service businesses survive 5 years. Capital requirement: $5K vs $50K+.',
    gapScore: 7,
    evidence: [
      'SBA 2024 — time to profitability by business type',
      'Kauffman Foundation — startup capital requirements',
      'BLS BED 2024 — service industry survival rates',
    ],
    actionable: 'Start with services to generate cash flow and learn the market, then productize your most-requested service.',
    opportunity: 'The "services dont scale" meme prevents people from the fastest path to revenue',
    simulateScenario: 'Starting a business — service-first vs product-first approach',
  },
  {
    id: 'biz-acquisition',
    category: 'business',
    title: 'Buy a Business > Start From Zero',
    publicPerception: 'Real entrepreneurs build from scratch',
    dataReality: 'Acquired businesses have 90%+ survival rate. Median ROI on SMB acquisitions: 25-35% annually. SBA loans cover up to 90% of purchase price.',
    gapScore: 8,
    evidence: [
      'BizBuySell 2024 — SMB acquisition success rates',
      'SBA 7(a) Loan Program Statistics 2024',
      'Harvard Business Review — acquisition vs startup outcomes',
    ],
    actionable: 'Search BizBuySell/Acquire.com for businesses with $100K-$500K SDE. Use SBA 7(a) loan for 10% down.',
    opportunity: 'Cultural bias toward "founding" leaves a massive market of profitable businesses available for acquisition',
    simulateScenario: 'Should I start a business from scratch or acquire an existing one?',
  },
  {
    id: 'biz-niche-ecom',
    category: 'business',
    title: 'Niche E-commerce > General Marketplace',
    publicPerception: 'Amazon/Shopify general stores are the easiest e-commerce path',
    dataReality: 'Niche e-commerce sites with <1000 SKUs have 3.2x higher conversion rates and 40% higher margins than general stores. 90% of Amazon FBA sellers earn under $25K/year.',
    gapScore: 6,
    evidence: [
      'Jungle Scout Amazon Seller Report 2024',
      'Shopify Commerce Trends 2024',
      'BigCommerce B2B E-commerce Report 2024',
    ],
    actionable: 'Pick a niche you understand deeply. Build a curated store with <100 SKUs and expert-level content.',
    opportunity: 'Most people try to be the next Amazon instead of becoming the authority in a small niche',
    simulateScenario: 'E-commerce business — niche specialized store vs general marketplace seller',
  },
  {
    id: 'biz-home-services',
    category: 'business',
    title: 'Home Services > Digital Products',
    publicPerception: 'Digital products are passive income with unlimited scale',
    dataReality: 'Home service businesses (plumbing, HVAC, cleaning) average $150K-$300K revenue within 2 years. 85% survive 5 years. Digital products: 95% earn under $1K/month.',
    gapScore: 8,
    evidence: [
      'ServiceTitan 2024 Home Services Industry Report',
      'BLS OES 2024 — home service industry wages',
      'Gumroad Creator Report 2024 — digital product revenue distribution',
    ],
    actionable: 'Start a home services company in an underserved area. Hire technicians, focus on operations and marketing.',
    opportunity: 'Young entrepreneurs avoid "blue collar" businesses, leaving massive demand unmet',
    simulateScenario: 'Building wealth — home services company vs digital product business',
  },
  {
    id: 'biz-recurring-revenue',
    category: 'business',
    title: 'Recurring Revenue > One-Time Sales',
    publicPerception: 'Just sell something — any revenue model works',
    dataReality: 'Businesses with 70%+ recurring revenue sell for 3-8x higher multiples. Subscription businesses have 5x higher customer LTV and 40% more predictable cash flow.',
    gapScore: 6,
    evidence: [
      'Zuora Subscription Economy Index 2024',
      'Vista Equity Partners — recurring revenue valuation data',
      'SaaS Capital — private SaaS valuation multiples 2024',
    ],
    actionable: 'Convert any business model to include a subscription or retainer component. Even product businesses can add maintenance/supply subscriptions.',
    opportunity: 'Most small business owners optimize for revenue instead of revenue quality',
    simulateScenario: 'Business model comparison — recurring revenue vs one-time sales',
  },
  {
    id: 'biz-local-monopoly',
    category: 'business',
    title: 'Local Monopoly > National Scale',
    publicPerception: 'Think big — national/global scale is the only path worth pursuing',
    dataReality: 'Local service businesses in cities under 100K population have 60% less competition and 25% higher margins. A plumber monopolizing a small town earns $200K+/year.',
    gapScore: 7,
    evidence: [
      'Census Bureau 2024 — business density by metro area',
      'SBA Regional Economic Profiles 2024',
      'IBISWorld Local Services Industry Reports 2024',
    ],
    actionable: 'Dominate a small geographic area first. Be the obvious #1 choice in one zip code before expanding.',
    opportunity: 'Ambitious operators overlook small markets where competition is minimal',
    simulateScenario: 'Business strategy — dominate locally vs compete nationally',
  },

  // ── CAREER (8) ──
  {
    id: 'career-trades',
    category: 'career',
    title: 'Trades > College Degree',
    publicPerception: 'A college degree is essential for a good career and earning potential',
    dataReality: 'Plumbers, electricians, and HVAC techs earn $60-90K median with zero student debt. 44% of college graduates are underemployed. Average student debt: $37K.',
    gapScore: 9,
    evidence: [
      'BLS OES May 2024 — trade occupation wages',
      'Federal Reserve Bank of NY — underemployment of college graduates 2024',
      'NCES 2024 — student loan debt statistics',
    ],
    actionable: 'Consider a 2-year trade apprenticeship. Start earning immediately while peers accumulate debt. Own a trade business by 25.',
    opportunity: 'Stigma against trades creates a massive supply shortage — trade workers can charge premium rates',
    simulateScenario: 'Career path — skilled trades vs 4-year college degree',
  },
  {
    id: 'career-remote-lowcost',
    category: 'career',
    title: 'Remote Work from Low-Cost Country',
    publicPerception: 'Remote work pays less and limits career growth',
    dataReality: 'A $60K remote salary from a US company = top 1% income in Indonesia, Thailand, or Colombia. Cost of living arbitrage: 3-5x purchasing power multiplier.',
    gapScore: 10,
    evidence: [
      'Numbeo Cost of Living Index 2024',
      'Levels.fyi Remote Salary Data 2024',
      'World Bank PPP Conversion Factors 2024',
    ],
    actionable: 'Build skills that command US/EU rates (software, design, marketing). Relocate to a low-cost country. Save 60-80% of income.',
    opportunity: 'Most remote workers stay in high-cost cities out of habit, leaving the arbitrage on the table',
    simulateScenario: 'Remote worker — living in expensive city vs relocating to low-cost country',
  },
  {
    id: 'career-govt-jobs',
    category: 'career',
    title: 'Government Jobs > Private Sector',
    publicPerception: 'Government jobs are for people who lack ambition — low pay, slow career',
    dataReality: 'Federal employees get pension (1% x years x high-3 salary), 13-26 vacation days, job security (0.5% layoff rate vs 3.5% private sector), and healthcare for life after 25 years.',
    gapScore: 7,
    evidence: [
      'OPM Federal Employee Benefits Survey 2024',
      'BLS CPS 2024 — public vs private sector separation rates',
      'Congressional Budget Office — federal vs private compensation 2024',
    ],
    actionable: 'Apply for GS-9+ federal positions in your field. Total compensation (salary + benefits + pension) often exceeds private sector for non-FAANG roles.',
    opportunity: 'The "boring government" perception means less competition for jobs with exceptional total compensation',
    simulateScenario: 'Career comparison — government job vs private sector',
  },
  {
    id: 'career-nursing',
    category: 'career',
    title: 'Nursing > Many "Prestigious" Careers',
    publicPerception: 'Nursing is stressful and underpaid compared to white-collar careers',
    dataReality: 'RN median: $86K. Nurse practitioners: $126K. 6% job growth (faster than average). Job security near 100%. Travel nurses earn $100-150K. 2-4 year education.',
    gapScore: 7,
    evidence: [
      'BLS OES May 2024 — nursing occupation wages',
      'BLS Employment Projections 2024-2034 — nursing demand',
      'AMN Healthcare Travel Nursing Salary Report 2024',
    ],
    actionable: 'Consider accelerated BSN programs (12-18 months with prior degree). Specialize in high-demand areas (OR, ICU, NP).',
    opportunity: 'Perception of "just a nurse" hides one of the most recession-proof, well-compensated career paths',
    simulateScenario: 'Career path — nursing vs traditional white-collar career',
  },
  {
    id: 'career-sales',
    category: 'career',
    title: 'Sales > Most White-Collar Jobs',
    publicPerception: 'Sales is sleazy and not a "real" profession',
    dataReality: 'Top 25% of B2B sales reps earn $150K+. Enterprise AEs average $180K OTE. No degree required. Unlimited income ceiling with commission structures.',
    gapScore: 8,
    evidence: [
      'Bravado 2024 State of Sales Compensation',
      'Glassdoor 2024 — enterprise AE compensation data',
      'BLS OES 2024 — sales occupation wage percentiles',
    ],
    actionable: 'Start as an SDR at a SaaS company ($50-65K base + commission). Promote to AE in 12-18 months. No degree needed.',
    opportunity: 'The stigma around sales means massive demand for good salespeople — top performers can name their price',
    simulateScenario: 'Career path — B2B sales vs traditional white-collar career',
  },
  {
    id: 'career-cybersecurity',
    category: 'career',
    title: 'Cybersecurity > Software Engineering',
    publicPerception: 'Software engineering is the best tech career — highest pay, most options',
    dataReality: 'Cybersecurity has 3.5M unfilled positions globally. Entry-level pays $75-95K. Senior roles: $150-250K. 0% unemployment rate. Less ageism than SWE.',
    gapScore: 7,
    evidence: [
      'ISC2 Cybersecurity Workforce Study 2024',
      'BLS OES 2024 — information security analyst wages',
      'CyberSeek — cybersecurity supply/demand data 2024',
    ],
    actionable: 'Get CompTIA Security+ cert ($400, 3 months study). Apply for SOC analyst roles. No CS degree required.',
    opportunity: 'Everyone wants to be a software engineer; cybersecurity talent gap grows every year',
    simulateScenario: 'Tech career — cybersecurity vs software engineering',
  },
  {
    id: 'career-teaching-abroad',
    category: 'career',
    title: 'Teaching Abroad > Entry-Level Corporate',
    publicPerception: 'Teaching abroad is a gap year activity, not a career move',
    dataReality: 'International school teachers in Asia/Middle East earn $40-80K tax-free with housing provided. Net savings often exceed entry-level corporate in Western countries.',
    gapScore: 6,
    evidence: [
      'International Schools Review — salary data 2024',
      'Search Associates — international teacher compensation 2024',
      'Numbeo Cost of Living Comparisons 2024',
    ],
    actionable: 'Get a TEFL cert or use existing degree. Apply to international schools in UAE, Singapore, or Hong Kong for tax-free packages.',
    opportunity: 'Most graduates never consider international teaching — those who do save more than their peers back home',
    simulateScenario: 'Career choice — teaching abroad vs entry-level corporate job at home',
  },
  {
    id: 'career-ai-adjacent',
    category: 'career',
    title: 'AI-Adjacent Roles > AI Engineering',
    publicPerception: 'You need to be an ML engineer to benefit from the AI boom',
    dataReality: 'AI prompt engineers, AI trainers, and AI ops roles pay $80-150K. Require no CS degree. Growing 10x faster than ML engineering roles. Lower barrier, similar pay.',
    gapScore: 7,
    evidence: [
      'Indeed 2024 — AI-related job postings growth by role',
      'Glassdoor 2024 — AI prompt engineer compensation',
      'LinkedIn 2024 Jobs on the Rise Report',
    ],
    actionable: 'Learn prompt engineering, RAG systems, and AI tool integration. Position as "AI implementation specialist" for non-tech companies.',
    opportunity: 'Everyone chases ML/AI engineering; adjacent roles have massive demand with far lower barriers',
    simulateScenario: 'AI career — ML engineering vs AI-adjacent roles (prompt engineer, AI ops)',
  },

  // ── INVESTMENT (6) ──
  {
    id: 'inv-index-funds',
    category: 'investment',
    title: 'Index Funds > Active Trading',
    publicPerception: 'Smart people can beat the market with active trading or stock picking',
    dataReality: '95% of active traders lose money over 5 years. 92% of fund managers underperform the S&P 500. Index funds average 10.5% annual return since 1957.',
    gapScore: 10,
    evidence: [
      'S&P SPIVA Scorecard 2024 — active vs passive performance',
      'Dalbar QAIB 2024 — investor behavior gap',
      'Federal Reserve Survey of Consumer Finances 2022',
    ],
    actionable: 'Put 80-90% of investments in a total market index fund (VTI/VXUS). Automate monthly contributions. Ignore market news.',
    opportunity: 'The financial industry profits from active trading; passive indexing is the proven optimal strategy for 95%+ of people',
    simulateScenario: 'Investment strategy — passive index funds vs active trading',
  },
  {
    id: 'inv-tier2-realestate',
    category: 'investment',
    title: 'Real Estate in Tier 2 Cities > Tier 1',
    publicPerception: 'Real estate in major cities (NYC, SF, London) is the safest investment',
    dataReality: 'Tier 2 cities (Boise, Raleigh, Tampa) offer 6-8% cap rates vs 3-4% in Tier 1. 40% lower entry cost. Similar or higher appreciation rates 2019-2024.',
    gapScore: 7,
    evidence: [
      'Census Bureau Housing Vacancies and Homeownership 2024',
      'Zillow Home Value Index by Metro 2024',
      'CBRE Real Estate Market Outlook 2024',
    ],
    actionable: 'Research Tier 2 cities with population growth >2% and job growth >3%. Buy rental properties with 1% rule (monthly rent >= 1% of purchase price).',
    opportunity: 'Capital concentrates in gateway cities; smaller markets offer better risk-adjusted returns',
    simulateScenario: 'Real estate investment — Tier 1 city vs Tier 2 city',
  },
  {
    id: 'inv-invest-yourself',
    category: 'investment',
    title: 'Investing in Yourself > Stock Market',
    publicPerception: 'Start investing in stocks as early as possible for compound growth',
    dataReality: 'A $10K investment in skills/education yields 20-50% annual return through higher earnings. Stock market averages 10%. The gap is 2-5x in your 20s-30s.',
    gapScore: 8,
    evidence: [
      'Federal Reserve Bank of San Francisco — human capital returns 2024',
      'Georgetown CEW — education ROI by field 2024',
      'BLS CPS 2024 — earnings premium by skill/certification',
    ],
    actionable: 'Allocate 10-20% of income to skill development (courses, certifications, coaching). The ROI vastly exceeds stock market returns early in career.',
    opportunity: 'People feel productive buying stocks but underinvest in the asset with the highest ROI: themselves',
    simulateScenario: 'Where to put $10K — skill development vs stock market investment',
  },
  {
    id: 'inv-dividend-myth',
    category: 'investment',
    title: 'Total Return > Dividend Investing',
    publicPerception: 'Dividend stocks provide safe, passive income for retirement',
    dataReality: 'Total return investing (growth + dividends) outperforms dividend-focused strategies by 2-3% annually. Dividends are tax-inefficient. Selling shares = same result.',
    gapScore: 6,
    evidence: [
      'Vanguard Research — total return vs income investing 2024',
      'S&P Dow Jones Indices — dividend strategy performance 2024',
      'Morningstar — dividend fund underperformance data',
    ],
    actionable: 'Focus on total market index funds. When you need income, sell shares systematically (the "homemade dividend" approach).',
    opportunity: 'Dividend investing feels psychologically safer but mathematically underperforms',
    simulateScenario: 'Investment approach — dividend focused vs total return strategy',
  },
  {
    id: 'inv-real-estate-vs-stocks',
    category: 'investment',
    title: 'Leveraged Real Estate > Stocks (for wealth building)',
    publicPerception: 'The stock market is the best long-term wealth builder',
    dataReality: 'Real estate allows 5:1 leverage (20% down). A 5% appreciation on $200K = $10K gain on $40K invested (25% ROI). Stocks at 5% = $2K on $40K. Plus rental income.',
    gapScore: 7,
    evidence: [
      'Federal Reserve SCF 2022 — median net worth by asset class',
      'CBRE Investment Returns Benchmark 2024',
      'National Association of Realtors — investment property returns 2024',
    ],
    actionable: 'Use house hacking (buy duplex, live in one unit, rent the other) to start building leveraged real estate equity with minimal risk.',
    opportunity: 'Leverage is the key differentiator — most people compare unleveraged returns and miss this',
    simulateScenario: 'Wealth building — leveraged real estate vs stock market investing',
  },
  {
    id: 'inv-starting-business-vs-stocks',
    category: 'investment',
    title: 'Starting a Business > Stock Market',
    publicPerception: 'Starting a business is risky — better to invest in the market',
    dataReality: 'Median net worth of business owners: $1.6M vs $400K for non-owners. Even failed business attempts increase lifetime earnings by 15% through skill development.',
    gapScore: 8,
    evidence: [
      'Federal Reserve SCF 2022 — net worth by self-employment status',
      'Kauffman Foundation — entrepreneurship and wealth creation 2024',
      'NBER Working Paper — returns to entrepreneurship',
    ],
    actionable: 'Start a side business while employed. The experience alone is worth more than the equivalent invested in stocks.',
    opportunity: 'Risk aversion toward entrepreneurship is the single biggest wealth-creation bottleneck for most people',
    simulateScenario: 'Wealth building path — starting a business vs investing in stock market',
  },

  // ── LIFESTYLE (6) ──
  {
    id: 'life-sea-entrepreneur',
    category: 'lifestyle',
    title: 'Southeast Asia > Western Cities for Entrepreneurs',
    publicPerception: 'You need to be in Silicon Valley or London to build a successful business',
    dataReality: 'Full cost of living in Bali/Bangkok/Bandung: $1,000-1,500/month. Same in SF: $5,000-7,000. Runway is 4-5x longer. Internet is fast. Talent pool is growing.',
    gapScore: 9,
    evidence: [
      'Numbeo Cost of Living Index 2024 — city comparisons',
      'Nomad List — cost of living data for digital nomad cities 2024',
      'Startup Genome Global Startup Ecosystem Report 2024',
    ],
    actionable: 'Move to a SEA hub (Bali, Bangkok, KL, HCMC). Your runway multiplies 4x. Build remotely, sell to Western markets.',
    opportunity: 'Geographic arbitrage is the most underused advantage for bootstrapped entrepreneurs',
    simulateScenario: 'Entrepreneur location — Southeast Asia vs Western city (cost of living arbitrage)',
  },
  {
    id: 'life-sleep',
    category: 'lifestyle',
    title: 'Sleep > Hustle Culture',
    publicPerception: 'Sleeping less means more productivity — hustle 18 hours a day',
    dataReality: 'Sleep deprivation (<7 hours) reduces cognitive performance by 40%, increases error rate by 50%, and reduces lifespan by 12%. Top performers average 8.5 hours.',
    gapScore: 8,
    evidence: [
      'CDC NCHS 2024 — sleep and health outcomes',
      'RAND Corporation — economic cost of sleep deprivation 2024',
      'Journal of Sleep Research — elite performer sleep patterns meta-analysis',
    ],
    actionable: 'Protect 8 hours of sleep as non-negotiable. The "extra" 2 hours of work from sleeping 6h instead of 8h are offset by 40% lower performance all day.',
    opportunity: 'Hustle culture is a cultural virus. Optimizing sleep is the single highest-ROI lifestyle change.',
    simulateScenario: 'Productivity approach — 8 hours sleep + focused work vs hustle culture (6 hours sleep)',
  },
  {
    id: 'life-walking',
    category: 'lifestyle',
    title: 'Walking > Gym Membership',
    publicPerception: 'You need an expensive gym membership and complex routine to be fit',
    dataReality: '80% of gym memberships go unused after February. 30 minutes of daily walking reduces all-cause mortality by 33%. Walking is free and has 100% adherence rate.',
    gapScore: 7,
    evidence: [
      'IHRSA Global Health & Fitness Association — gym usage data 2024',
      'CDC NCHS 2024 — physical activity and mortality',
      'British Journal of Sports Medicine — walking and health outcomes meta-analysis 2024',
    ],
    actionable: 'Walk 30-45 minutes daily (7,000-10,000 steps). Add bodyweight exercises at home. Save $50/month on gym fees.',
    opportunity: 'The fitness industry profits from complexity; simplicity (walking) delivers 80% of health benefits',
    simulateScenario: 'Fitness strategy — daily walking routine vs gym membership',
  },
  {
    id: 'life-cooking',
    category: 'lifestyle',
    title: 'Cooking > Eating Out',
    publicPerception: 'Cooking is too time-consuming for busy professionals — eating out saves time',
    dataReality: 'Average American spends $3,500/year eating out. Home cooking costs 60% less. Meal prep takes 4 hours/week and saves 6 hours of restaurant/delivery waiting.',
    gapScore: 6,
    evidence: [
      'BLS Consumer Expenditure Survey 2024 — food spending',
      'USDA Economic Research Service — food prices and spending 2024',
      'Journal of Nutrition Education and Behavior — meal prep time analysis',
    ],
    actionable: 'Batch cook on Sunday (4 hours = 15 meals). Net time savings: 2+ hours/week. Net money savings: $2,000+/year.',
    opportunity: 'The convenience of delivery apps masks massive financial drain — meal prep is a wealth-building habit',
    simulateScenario: 'Lifestyle optimization — meal prep and cooking vs eating out regularly',
  },
  {
    id: 'life-reading',
    category: 'lifestyle',
    title: 'Reading > Social Media',
    publicPerception: 'Social media keeps you informed and connected',
    dataReality: 'Average person spends 2.5 hours/day on social media (912 hours/year). Reading 30 min/day = 25 books/year. CEOs read 50+ books/year. Social media correlates with 40% higher anxiety.',
    gapScore: 8,
    evidence: [
      'DataReportal Digital 2024 — social media time statistics',
      'Pew Research Center — reading habits and outcomes 2024',
      'Journal of Social and Clinical Psychology — social media and mental health',
    ],
    actionable: 'Replace 30 minutes of social media with reading daily. Use screen time limits. Read industry-specific books for career acceleration.',
    opportunity: 'The attention economy is designed to capture your time — redirecting it to reading is a cheat code',
    simulateScenario: 'Time investment — daily reading habit vs social media consumption',
  },
  {
    id: 'life-minimalism',
    category: 'lifestyle',
    title: 'Minimalism > Lifestyle Inflation',
    publicPerception: 'Higher income should mean a better lifestyle — upgrade everything',
    dataReality: 'Americans with $100K+ income save only 6% on average due to lifestyle inflation. Minimalists save 40-60%. Financial independence timeline: 40 years vs 12 years.',
    gapScore: 7,
    evidence: [
      'Federal Reserve SHED 2024 — savings rates by income bracket',
      'BLS Consumer Expenditure Survey 2024 — spending by income',
      'Mr. Money Mustache / FIRE movement — savings rate to retirement calculators',
    ],
    actionable: 'Keep lifestyle costs flat when income increases. Invest the difference. A 50% savings rate = financial independence in ~15 years.',
    opportunity: 'Consumerism is the default; intentional spending is the exception that leads to financial freedom',
    simulateScenario: 'Financial path — minimalist lifestyle vs lifestyle inflation with high income',
  },

  // ── GEOGRAPHY (5) ──
  {
    id: 'geo-indonesia',
    category: 'geography',
    title: 'Indonesia — Cost of Living vs Income Potential',
    publicPerception: 'Indonesia is a developing country with limited economic opportunity',
    dataReality: 'Indonesia: 280M population, $1.4T GDP, fastest-growing internet economy in SEA. Digital economy: $77B (2023), projected $130B by 2025. Cost of living: $500-1,500/month for high quality of life.',
    gapScore: 8,
    evidence: [
      'Google-Temasek-Bain e-Conomy SEA Report 2024',
      'World Bank Indonesia Economic Prospects 2024',
      'Numbeo Cost of Living Index — Indonesia cities 2024',
    ],
    actionable: 'Build a business serving Indonesian digital consumers (280M people going online). Or earn remotely in USD/EUR while living at $1K/month.',
    opportunity: 'Indonesia is the worlds 4th largest country by population with a booming digital economy — yet most Westerners overlook it',
    simulateScenario: 'Location strategy — building a business in Indonesia vs a Western country',
  },
  {
    id: 'geo-eastern-europe-tech',
    category: 'geography',
    title: 'Eastern Europe Tech Talent',
    publicPerception: 'Top tech talent is in Silicon Valley and costs $200K+/year',
    dataReality: 'Senior developers in Poland, Romania, Ukraine cost $40-60K/year. Same skill level as US counterparts (many work for FAANG remotely). 4x cost savings.',
    gapScore: 8,
    evidence: [
      'Stack Overflow Developer Survey 2024 — salary by region',
      'Glassdoor 2024 — Eastern European developer compensation',
      'Kearney Global Services Location Index 2024',
    ],
    actionable: 'Hire remote developers from Poland, Romania, or Ukraine through Toptal, Lemon.io, or direct LinkedIn outreach.',
    opportunity: 'Talent arbitrage: identical skills at 25% of the cost. Most startups overpay for local talent out of habit.',
    simulateScenario: 'Hiring strategy — Eastern European remote developers vs US-based team',
  },
  {
    id: 'geo-africa-mobile',
    category: 'geography',
    title: 'Africa Mobile Money > Western Banking',
    publicPerception: 'Africa is financially underdeveloped and unbanked',
    dataReality: 'Africa processes $800B+ in mobile money annually. M-Pesa alone serves 50M+ users. Mobile money adoption rate: 57% in East Africa vs 12% mobile payment usage in the US.',
    gapScore: 9,
    evidence: [
      'GSMA State of the Industry Report on Mobile Money 2024',
      'World Bank Global Findex Database 2024',
      'McKinsey Africa Mobile Money Report 2024',
    ],
    actionable: 'Build fintech products for African mobile money users. The infrastructure exists; the software layer is underdeveloped.',
    opportunity: 'Africa leapfrogged traditional banking — the mobile money ecosystem is more advanced than most Westerners realize',
    simulateScenario: 'Fintech opportunity — building for African mobile money market',
  },
  {
    id: 'geo-portugal-digital-nomad',
    category: 'geography',
    title: 'Portugal > Other EU Countries for Remote Workers',
    publicPerception: 'Germany, France, or UK are the best European countries for career and income',
    dataReality: 'Portugal offers D7/Digital Nomad visa, NHR tax regime (20% flat rate for 10 years), $1,500-2,500/month cost of living. Lisbon ranked #1 digital nomad city in Europe.',
    gapScore: 7,
    evidence: [
      'Nomad List 2024 — European city rankings',
      'Portuguese Immigration and Borders Service — visa statistics 2024',
      'Numbeo Cost of Living — European city comparisons 2024',
    ],
    actionable: 'Apply for Portuguese D7 or Digital Nomad visa. Benefit from NHR tax regime while enjoying EU residency rights.',
    opportunity: 'Most remote workers default to expensive EU countries; Portugal offers superior quality-of-life-to-cost ratio with tax advantages',
    simulateScenario: 'European relocation — Portugal vs Germany/France for remote workers',
  },
  {
    id: 'geo-middle-east-tax',
    category: 'geography',
    title: 'UAE/Dubai for Tax-Free Income',
    publicPerception: 'Dubai is only for the ultra-rich — too expensive and superficial',
    dataReality: '0% income tax. $2,000-3,500/month for comfortable living outside tourist areas. Digital freelancer visa available. 30% of residents earn $60K+/year tax-free.',
    gapScore: 7,
    evidence: [
      'UAE Federal Tax Authority — tax framework 2024',
      'Numbeo Cost of Living Index — Dubai 2024',
      'DMCC Free Zone — freelancer visa statistics 2024',
    ],
    actionable: 'Get a UAE freelancer visa ($1,500/year). Live outside tourist areas. Keep 100% of your income. Save $15-40K/year in taxes vs US/EU.',
    opportunity: 'The "Dubai is for rich people" myth keeps average earners from the most impactful tax optimization available',
    simulateScenario: 'Tax optimization — relocating to UAE/Dubai vs staying in high-tax country',
  },
];

/**
 * Returns all arbitrage opportunities, optionally filtered by category.
 */
export function findArbitrageOpportunities(
  category?: ArbitrageOpportunity['category']
): ArbitrageOpportunity[] {
  if (!category) return OPPORTUNITIES;
  return OPPORTUNITIES.filter((o) => o.category === category);
}

/**
 * Returns a single opportunity by ID.
 */
export function getArbitrageById(id: string): ArbitrageOpportunity | undefined {
  return OPPORTUNITIES.find((o) => o.id === id);
}

/**
 * Returns all unique categories with counts.
 */
export function getArbitrageCategories(): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const o of OPPORTUNITIES) {
    counts[o.category] = (counts[o.category] || 0) + 1;
  }
  return Object.entries(counts).map(([name, count]) => ({ name, count }));
}

/**
 * Returns opportunities sorted by gap score (highest first).
 */
export function getTopArbitrage(limit = 10): ArbitrageOpportunity[] {
  return [...OPPORTUNITIES].sort((a, b) => b.gapScore - a.gapScore).slice(0, limit);
}
