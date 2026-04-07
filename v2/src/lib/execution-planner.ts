// ── Execution Planner ──
// Generates deterministic execution plans for common business/life scenarios.

export interface ExecutionStep {
  id: number
  phase: string
  action: string
  platform: string
  platformUrl: string
  estimatedCost: string
  estimatedTime: string
  automatable: boolean
  apiAvailable: boolean
  status: 'ready' | 'needs-human' | 'coming-soon'
  dependencies: number[]
  description: string
}

export interface ExecutionPlan {
  type: string
  steps: ExecutionStep[]
  totalEstimatedCost: { min: number; max: number }
  totalEstimatedWeeks: { min: number; max: number }
}

// ── Scenario detection ──

type ScenarioType = 'cafe' | 'saas' | 'freelancing' | 'ecommerce' | 'generic'

const SCENARIO_KEYWORDS: Record<ScenarioType, string[]> = {
  cafe: ['cafe', 'coffee', 'restaurant', 'food', 'bar', 'bakery', 'kitchen', 'catering', 'bistro', 'diner', 'pizzeria'],
  saas: ['saas', 'software', 'app', 'platform', 'startup', 'tech', 'api', 'subscription', 'web app', 'mobile app'],
  freelancing: ['freelanc', 'upwork', 'fiverr', 'consulting', 'freelance', 'contractor', 'gig', 'portfolio', 'client'],
  ecommerce: ['ecommerce', 'e-commerce', 'shop', 'store', 'sell', 'product', 'dropship', 'shopify', 'amazon', 'retail', 'merch'],
  generic: [],
}

function detectScenario(text: string): ScenarioType {
  const lower = text.toLowerCase()
  let best: ScenarioType = 'generic'
  let bestScore = 0
  for (const [type, keywords] of Object.entries(SCENARIO_KEYWORDS) as [ScenarioType, string[]][]) {
    const score = keywords.filter(k => lower.includes(k)).length
    if (score > bestScore) {
      bestScore = score
      best = type
    }
  }
  return best
}

// ── Country-aware adjustments ──

function getRegistrar(country: string): { name: string; url: string; cost: string } {
  const c = country.toLowerCase()
  if (c.includes('indonesia') || c.includes('id')) return { name: 'OSS (Online Single Submission)', url: 'https://oss.go.id', cost: '$50-300' }
  if (c.includes('us') || c.includes('united states') || c.includes('america')) return { name: 'Stripe Atlas or LegalZoom', url: 'https://stripe.com/atlas', cost: '$500-800' }
  if (c.includes('uk') || c.includes('united kingdom') || c.includes('england')) return { name: 'Companies House', url: 'https://www.gov.uk/set-up-limited-company', cost: '$15-50' }
  if (c.includes('ital')) return { name: 'Camera di Commercio', url: 'https://www.registroimprese.it', cost: '$200-500' }
  if (c.includes('singapore')) return { name: 'ACRA BizFile+', url: 'https://www.bizfile.gov.sg', cost: '$200-400' }
  if (c.includes('australia') || c.includes('au')) return { name: 'ASIC', url: 'https://asic.gov.au', cost: '$400-800' }
  return { name: 'Local registrar or Stripe Atlas', url: 'https://stripe.com/atlas', cost: '$200-800' }
}

function getPaymentProvider(country: string): { name: string; url: string } {
  const c = country.toLowerCase()
  if (c.includes('indonesia') || c.includes('id')) return { name: 'Midtrans / Xendit', url: 'https://midtrans.com' }
  return { name: 'Stripe', url: 'https://stripe.com' }
}

function getBankOption(country: string): { name: string; url: string } {
  const c = country.toLowerCase()
  if (c.includes('indonesia') || c.includes('id')) return { name: 'Bank BCA / Jenius', url: 'https://www.bca.co.id' }
  if (c.includes('us') || c.includes('united states')) return { name: 'Mercury', url: 'https://mercury.com' }
  return { name: 'Wise Business', url: 'https://wise.com/business' }
}

// ── Plan generators ──

function cafePlan(country: string, budget: number): ExecutionStep[] {
  const reg = getRegistrar(country)
  const pay = getPaymentProvider(country)
  const bank = getBankOption(country)
  return [
    { id: 1, phase: 'Legal', action: 'Register business entity', platform: reg.name, platformUrl: reg.url, estimatedCost: reg.cost, estimatedTime: '3-14 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'File business registration with the relevant authority. Choose sole proprietorship or LLC based on liability needs.' },
    { id: 2, phase: 'Financial', action: 'Open business bank account', platform: bank.name, platformUrl: bank.url, estimatedCost: '$0-50', estimatedTime: '1-5 days', automatable: false, apiAvailable: true, status: 'needs-human', dependencies: [1], description: 'Separate personal and business finances from day one. Required for accounting and tax compliance.' },
    { id: 3, phase: 'Operations', action: 'Find and evaluate location', platform: 'Google Maps / Local agents', platformUrl: 'https://maps.google.com', estimatedCost: '$0', estimatedTime: '2-6 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [1], description: 'Scout locations considering foot traffic, rent, proximity to target customers, and local competition radius.' },
    { id: 4, phase: 'Operations', action: 'Negotiate and sign lease', platform: 'Local real estate', platformUrl: '', estimatedCost: '$1,000-10,000 (deposit)', estimatedTime: '1-3 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [3], description: 'Negotiate lease terms. Key points: rent-free period during build-out, break clause, permitted use clause.' },
    { id: 5, phase: 'Legal', action: 'Obtain food service permits', platform: 'Local health department', platformUrl: '', estimatedCost: '$100-1,000', estimatedTime: '2-8 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [1, 4], description: 'Food handling license, health inspection, fire safety certificate. Requirements vary significantly by jurisdiction.' },
    { id: 6, phase: 'Operations', action: 'Design interior and order equipment', platform: 'Local suppliers / Alibaba', platformUrl: 'https://alibaba.com', estimatedCost: budget > 50000 ? '$15,000-40,000' : '$3,000-10,000', estimatedTime: '3-8 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [4], description: 'Espresso machine, grinder, refrigeration, furniture, decor. Buy used equipment to save 40-60%.' },
    { id: 7, phase: 'Operations', action: 'Hire and train staff', platform: 'Deel / Indeed / Local job boards', platformUrl: 'https://indeed.com', estimatedCost: '$0-200 (posting fees)', estimatedTime: '2-4 weeks', automatable: false, apiAvailable: true, status: 'needs-human', dependencies: [4], description: 'Baristas, kitchen staff, cleaners. Train on food safety, customer service, and POS system.' },
    { id: 8, phase: 'Financial', action: 'Set up POS system', platform: 'Square / Toast', platformUrl: 'https://squareup.com', estimatedCost: '$0-80/mo', estimatedTime: '1-3 days', automatable: false, apiAvailable: true, status: 'ready', dependencies: [2], description: 'Point of sale for transactions, inventory tracking, and daily reporting. Square has no monthly fee on basic plan.' },
    { id: 9, phase: 'Financial', action: 'Set up payment processing', platform: pay.name, platformUrl: pay.url, estimatedCost: '2.6-3.5% per txn', estimatedTime: '1-3 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [2], description: 'Accept cards, mobile payments, and potentially cash. Integrate with POS system.' },
    { id: 10, phase: 'Marketing', action: 'Create Google Business Profile', platform: 'Google Business', platformUrl: 'https://business.google.com', estimatedCost: '$0', estimatedTime: '1-2 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4], description: 'Critical for local discovery. Add photos, hours, menu. This is your #1 free marketing channel.' },
    { id: 11, phase: 'Marketing', action: 'Set up social media presence', platform: 'Instagram / TikTok', platformUrl: 'https://instagram.com', estimatedCost: '$0', estimatedTime: '1-2 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [], description: 'Create accounts, establish visual identity, start posting behind-the-scenes content before opening.' },
    { id: 12, phase: 'Marketing', action: 'Plan soft launch and grand opening', platform: 'Meta Ads / Google Ads', platformUrl: 'https://ads.google.com', estimatedCost: '$200-2,000', estimatedTime: '1 week', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5, 6, 7, 8], description: 'Soft launch with friends/family first to iron out issues. Grand opening with local press, influencers, promotions.' },
    { id: 13, phase: 'Launch', action: 'Open for business', platform: 'Your location', platformUrl: '', estimatedCost: '$0', estimatedTime: '1 day', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [5, 6, 7, 8, 9, 10, 11, 12], description: 'All systems go. First 30 days are critical for establishing reputation and operational rhythm.' },
  ]
}

function saasPlan(country: string, _budget: number): ExecutionStep[] {
  const reg = getRegistrar(country)
  const pay = getPaymentProvider(country)
  const bank = getBankOption(country)
  return [
    { id: 1, phase: 'Legal', action: 'Register LLC or equivalent', platform: reg.name, platformUrl: reg.url, estimatedCost: reg.cost, estimatedTime: '3-14 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'Legal entity protects personal assets. LLC is the most common choice for solo founders and small teams.' },
    { id: 2, phase: 'Financial', action: 'Open business bank account', platform: bank.name, platformUrl: bank.url, estimatedCost: '$0-50', estimatedTime: '1-5 days', automatable: false, apiAvailable: true, status: 'needs-human', dependencies: [1], description: 'Required for receiving payments and tracking business expenses separately.' },
    { id: 3, phase: 'Financial', action: 'Set up billing and payments', platform: pay.name, platformUrl: pay.url, estimatedCost: '2.9% + $0.30/txn', estimatedTime: '1-3 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [2], description: 'Subscription billing, invoicing, tax calculation. Stripe Billing or LemonSqueezy for simplicity.' },
    { id: 4, phase: 'Operations', action: 'Build MVP (core feature only)', platform: 'Cursor / VS Code', platformUrl: 'https://cursor.com', estimatedCost: '$0-20/mo', estimatedTime: '2-6 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'Ship the smallest version that delivers value. One core feature, done well. No feature bloat.' },
    { id: 5, phase: 'Operations', action: 'Deploy to production', platform: 'Vercel / Railway', platformUrl: 'https://vercel.com', estimatedCost: '$0-20/mo', estimatedTime: '1-2 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4], description: 'CI/CD pipeline with automatic deploys from git. Add custom domain, SSL, and monitoring.' },
    { id: 6, phase: 'Operations', action: 'Set up error tracking and analytics', platform: 'PostHog / Sentry', platformUrl: 'https://posthog.com', estimatedCost: '$0 (free tier)', estimatedTime: '2-4 hours', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5], description: 'Track errors, user behavior, and conversion funnel. Essential for data-driven iteration.' },
    { id: 7, phase: 'Operations', action: 'Set up transactional email', platform: 'Resend / Postmark', platformUrl: 'https://resend.com', estimatedCost: '$0 (free tier)', estimatedTime: '2-4 hours', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5], description: 'Welcome emails, password resets, notifications. Resend offers 3,000 free emails/month.' },
    { id: 8, phase: 'Marketing', action: 'Create landing page with waitlist', platform: 'Same stack / Carrd', platformUrl: 'https://carrd.co', estimatedCost: '$0-19/yr', estimatedTime: '1-2 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [], description: 'Clear value proposition, demo/screenshots, pricing, and email capture. Test messaging before building.' },
    { id: 9, phase: 'Marketing', action: 'Launch on Product Hunt', platform: 'Product Hunt', platformUrl: 'https://producthunt.com', estimatedCost: '$0', estimatedTime: '1 day (+ prep)', automatable: false, apiAvailable: true, status: 'ready', dependencies: [5, 8], description: 'Prepare assets (logo, screenshots, tagline, maker comment) 1 week before. Launch on Tuesday-Thursday.' },
    { id: 10, phase: 'Marketing', action: 'Start content marketing / SEO', platform: 'Blog / Twitter/X', platformUrl: 'https://x.com', estimatedCost: '$0', estimatedTime: 'Ongoing', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5], description: 'Write about the problem you solve. Build in public. Share metrics and learnings.' },
    { id: 11, phase: 'Marketing', action: 'Set up cold outreach pipeline', platform: 'Apollo.io / Instantly', platformUrl: 'https://apollo.io', estimatedCost: '$0-99/mo', estimatedTime: '1-2 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5], description: 'Find potential customers, personalize outreach, follow up automatically. Start with 20 emails/day.' },
    { id: 12, phase: 'Launch', action: 'Get first 10 paying customers', platform: 'Direct outreach', platformUrl: '', estimatedCost: '$0', estimatedTime: '2-8 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [3, 5, 9], description: 'The hardest milestone. Sell to people you know, do things that do not scale, offer concierge onboarding.' },
  ]
}

function freelancingPlan(_country: string, _budget: number): ExecutionStep[] {
  return [
    { id: 1, phase: 'Operations', action: 'Define your niche and service offering', platform: 'Notion / Google Docs', platformUrl: 'https://notion.so', estimatedCost: '$0', estimatedTime: '1-2 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'Pick ONE skill + ONE industry. "AI automation for e-commerce" beats "I do everything." Specificity wins.' },
    { id: 2, phase: 'Marketing', action: 'Build portfolio with 3-5 case studies', platform: 'Personal site / Framer', platformUrl: 'https://framer.com', estimatedCost: '$0-10/mo', estimatedTime: '3-7 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [1], description: 'Show results, not just work. Before/after, metrics, testimonials. Do free projects if needed to build portfolio.' },
    { id: 3, phase: 'Marketing', action: 'Set up Upwork profile', platform: 'Upwork', platformUrl: 'https://upwork.com', estimatedCost: '$0 (20% fee on earnings)', estimatedTime: '1-2 days', automatable: false, apiAvailable: true, status: 'ready', dependencies: [2], description: 'Professional photo, keyword-rich title, portfolio items, skills tests. Apply to 10+ jobs before expecting responses.' },
    { id: 4, phase: 'Marketing', action: 'Write 5 tailored proposals', platform: 'Upwork', platformUrl: 'https://upwork.com', estimatedCost: '$0', estimatedTime: '2-4 hours', automatable: true, apiAvailable: false, status: 'ready', dependencies: [3], description: 'Reference the client problem specifically. Show you read the brief. Include a relevant portfolio piece.' },
    { id: 5, phase: 'Operations', action: 'Land and deliver first project', platform: 'Your tools', platformUrl: '', estimatedCost: '$0', estimatedTime: '1-3 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [4], description: 'Over-deliver on the first project. Communication is 50% of the value. Send updates proactively.' },
    { id: 6, phase: 'Operations', action: 'Get 5-star review', platform: 'Upwork', platformUrl: 'https://upwork.com', estimatedCost: '$0', estimatedTime: '1-3 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [5], description: 'Ask for review immediately after project close. First 5 reviews determine your trajectory on the platform.' },
    { id: 7, phase: 'Financial', action: 'Set up invoicing and accounting', platform: 'Wise / PayPal', platformUrl: 'https://wise.com', estimatedCost: '$0-20/mo', estimatedTime: '1-2 hours', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5], description: 'Track income, expenses, and taxes from day one. Wise for international payments at low fees.' },
    { id: 8, phase: 'Marketing', action: 'Raise rate to $50/hr after 5 reviews', platform: 'Upwork', platformUrl: 'https://upwork.com', estimatedCost: '$0', estimatedTime: '5 min', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [6], description: 'Social proof justifies higher rates. Increase rate gradually: $25 -> $35 -> $50 -> $75+.' },
    { id: 9, phase: 'Operations', action: 'Build retainer relationships', platform: 'Direct contracts', platformUrl: '', estimatedCost: '$0', estimatedTime: 'Ongoing', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [6], description: 'Monthly retainers provide stable income. Offer a discount for commitment (e.g., 10 hrs/mo guaranteed).' },
    { id: 10, phase: 'Marketing', action: 'Expand to off-platform clients', platform: 'LinkedIn / Twitter/X', platformUrl: 'https://linkedin.com', estimatedCost: '$0', estimatedTime: 'Ongoing', automatable: true, apiAvailable: true, status: 'ready', dependencies: [8], description: 'Share your work publicly. DM potential clients. No platform fees on direct contracts.' },
  ]
}

function ecommercePlan(country: string, budget: number): ExecutionStep[] {
  const reg = getRegistrar(country)
  const pay = getPaymentProvider(country)
  const bank = getBankOption(country)
  return [
    { id: 1, phase: 'Legal', action: 'Register business entity', platform: reg.name, platformUrl: reg.url, estimatedCost: reg.cost, estimatedTime: '3-14 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'Required for business bank account, wholesale purchasing, and tax compliance.' },
    { id: 2, phase: 'Financial', action: 'Open business bank account', platform: bank.name, platformUrl: bank.url, estimatedCost: '$0-50', estimatedTime: '1-5 days', automatable: false, apiAvailable: true, status: 'needs-human', dependencies: [1], description: 'Keep business funds separate. Required for payment processor integration.' },
    { id: 3, phase: 'Operations', action: 'Source products or set up supplier', platform: 'Alibaba / Local wholesale', platformUrl: 'https://alibaba.com', estimatedCost: budget > 10000 ? '$2,000-10,000' : '$200-2,000', estimatedTime: '1-4 weeks', automatable: false, apiAvailable: true, status: 'needs-human', dependencies: [], description: 'Order samples first. Verify quality, shipping time, and communication. Negotiate MOQ and pricing.' },
    { id: 4, phase: 'Operations', action: 'Build online store', platform: 'Shopify / WooCommerce', platformUrl: 'https://shopify.com', estimatedCost: '$29-79/mo', estimatedTime: '3-7 days', automatable: false, apiAvailable: true, status: 'ready', dependencies: [3], description: 'Professional photos, compelling descriptions, clear pricing. Start with one theme, customize minimally.' },
    { id: 5, phase: 'Financial', action: 'Set up payment processing', platform: pay.name, platformUrl: pay.url, estimatedCost: '2.9% + $0.30/txn', estimatedTime: '1-2 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [2, 4], description: 'Accept all major cards and local payment methods. Set up automatic payouts to business bank account.' },
    { id: 6, phase: 'Operations', action: 'Set up shipping and fulfillment', platform: 'ShipStation / Local courier', platformUrl: 'https://shipstation.com', estimatedCost: '$0-25/mo + shipping', estimatedTime: '1-3 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4], description: 'Automate label printing and tracking. Offer free shipping above a threshold to increase AOV.' },
    { id: 7, phase: 'Marketing', action: 'Create product listings and SEO', platform: 'Store platform', platformUrl: '', estimatedCost: '$0', estimatedTime: '2-5 days', automatable: true, apiAvailable: false, status: 'ready', dependencies: [4], description: 'Keyword-rich titles, detailed descriptions, high-quality images. Each product page is a landing page.' },
    { id: 8, phase: 'Marketing', action: 'Launch paid advertising', platform: 'Meta Ads / Google Shopping', platformUrl: 'https://ads.google.com', estimatedCost: '$10-100/day', estimatedTime: '1-2 days setup', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4, 5], description: 'Start with $10-20/day. Test 3-5 ad creatives. Kill underperformers after 1,000 impressions.' },
    { id: 9, phase: 'Marketing', action: 'Set up email marketing', platform: 'Klaviyo / Mailchimp', platformUrl: 'https://klaviyo.com', estimatedCost: '$0 (free tier)', estimatedTime: '2-4 hours', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4], description: 'Welcome series, abandoned cart recovery, post-purchase follow-up. Email drives 20-30% of e-commerce revenue.' },
    { id: 10, phase: 'Operations', action: 'Fulfill first orders', platform: 'Your warehouse / 3PL', platformUrl: '', estimatedCost: 'Variable', estimatedTime: 'Ongoing', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [5, 6, 8], description: 'Fast shipping + good packaging = repeat customers. Include a thank-you note in first 100 orders.' },
    { id: 11, phase: 'Operations', action: 'Set up inventory tracking', platform: 'Shopify / Inventory Planner', platformUrl: 'https://shopify.com', estimatedCost: '$0-50/mo', estimatedTime: '2-4 hours', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4, 10], description: 'Track stock levels, set reorder points, forecast demand. Stockouts kill momentum.' },
  ]
}

function genericPlan(country: string, _budget: number): ExecutionStep[] {
  const reg = getRegistrar(country)
  const bank = getBankOption(country)
  const pay = getPaymentProvider(country)
  return [
    { id: 1, phase: 'Legal', action: 'Register business entity', platform: reg.name, platformUrl: reg.url, estimatedCost: reg.cost, estimatedTime: '3-14 days', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'Choose the right legal structure for your business type and liability needs.' },
    { id: 2, phase: 'Financial', action: 'Open business bank account', platform: bank.name, platformUrl: bank.url, estimatedCost: '$0-50', estimatedTime: '1-5 days', automatable: false, apiAvailable: true, status: 'needs-human', dependencies: [1], description: 'Separate personal and business finances from day one.' },
    { id: 3, phase: 'Financial', action: 'Set up payment processing', platform: pay.name, platformUrl: pay.url, estimatedCost: '2.9% + $0.30/txn', estimatedTime: '1-3 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [2], description: 'Accept payments from customers through your preferred channels.' },
    { id: 4, phase: 'Operations', action: 'Build minimum viable product', platform: 'Depends on business', platformUrl: '', estimatedCost: '$0-5,000', estimatedTime: '2-8 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [], description: 'The smallest version of your offering that delivers real value to customers.' },
    { id: 5, phase: 'Marketing', action: 'Create online presence', platform: 'Carrd / Framer / Squarespace', platformUrl: 'https://carrd.co', estimatedCost: '$0-19/yr', estimatedTime: '1-3 days', automatable: true, apiAvailable: true, status: 'ready', dependencies: [4], description: 'Website, social profiles, Google Business listing. Make it easy for customers to find and trust you.' },
    { id: 6, phase: 'Marketing', action: 'Acquire first 10 customers', platform: 'Direct outreach', platformUrl: '', estimatedCost: '$0-500', estimatedTime: '2-6 weeks', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [3, 4, 5], description: 'Talk to people directly. No ads until you have product-market fit. Do things that do not scale.' },
    { id: 7, phase: 'Operations', action: 'Set up analytics and tracking', platform: 'PostHog / Google Analytics', platformUrl: 'https://posthog.com', estimatedCost: '$0', estimatedTime: '1-2 hours', automatable: true, apiAvailable: true, status: 'ready', dependencies: [5], description: 'Measure what matters: acquisition, activation, retention, revenue, referral.' },
    { id: 8, phase: 'Launch', action: 'Iterate based on customer feedback', platform: 'Customer interviews', platformUrl: '', estimatedCost: '$0', estimatedTime: 'Ongoing', automatable: false, apiAvailable: false, status: 'needs-human', dependencies: [6], description: 'Talk to every early customer. Find the pattern in their feedback. Double down on what works.' },
  ]
}

// ── Main export ──

export function generateExecutionPlan(scenario: string, country: string, budget: number): ExecutionPlan {
  const type = detectScenario(scenario)
  let steps: ExecutionStep[]

  switch (type) {
    case 'cafe':
      steps = cafePlan(country, budget)
      break
    case 'saas':
      steps = saasPlan(country, budget)
      break
    case 'freelancing':
      steps = freelancingPlan(country, budget)
      break
    case 'ecommerce':
      steps = ecommercePlan(country, budget)
      break
    default:
      steps = genericPlan(country, budget)
  }

  // Calculate totals
  const costRanges = steps.map(s => {
    const match = s.estimatedCost.match(/\$?([\d,.]+)(?:\s*-\s*\$?([\d,.]+))?/)
    if (!match) return { min: 0, max: 0 }
    const min = parseFloat(match[1].replace(/,/g, '')) || 0
    const max = parseFloat((match[2] || match[1]).replace(/,/g, '')) || min
    return { min, max }
  })

  const totalMin = costRanges.reduce((sum, r) => sum + r.min, 0)
  const totalMax = costRanges.reduce((sum, r) => sum + r.max, 0)

  // Rough time estimate based on critical path
  const phases = ['Legal', 'Financial', 'Operations', 'Marketing', 'Launch']
  const phaseWeeks: Record<string, number> = {}
  for (const p of phases) {
    const phaseSteps = steps.filter(s => s.phase === p)
    const maxTime = Math.max(0, ...phaseSteps.map(s => {
      const m = s.estimatedTime.match(/(\d+)/)
      return m ? parseInt(m[1]) : 1
    }))
    phaseWeeks[p] = maxTime
  }
  const totalWeeksMin = Math.max(4, Math.round(Object.values(phaseWeeks).reduce((s, w) => s + w, 0) * 0.5))
  const totalWeeksMax = Math.round(Object.values(phaseWeeks).reduce((s, w) => s + w, 0) * 1.5)

  return {
    type: type === 'generic' ? 'General Business' : type.charAt(0).toUpperCase() + type.slice(1),
    steps,
    totalEstimatedCost: { min: totalMin, max: totalMax },
    totalEstimatedWeeks: { min: totalWeeksMin, max: totalWeeksMax },
  }
}
