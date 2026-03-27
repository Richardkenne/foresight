# Simulator — Data Sources & Knowledge Base

## Overview
- **Total data points:** 6,250+
- **Files:** 12 (JSON + MD)
- **Location:** `simulator/data/`
- **Source tiers:** S (government/peer-reviewed) → A (top consulting) → B (industry) → C (aggregators) → D (anecdotal)

## Data files

| File | Points | Top sources |
|------|--------|-------------|
| education-stats.json | 527 | NCES, BLS, NSF, College Board, MIT |
| health-fitness.json | 503 | CDC, NEJM, Lancet, JAMA, WHO, IHRSA |
| relationships.md | 555 | Gottman Institute, Pew Research, BLS, OECD |
| personal-finance-data.md | 550 | Federal Reserve, DALBAR, IRS, Vanguard |
| marketing-growth-data.md | 564 | Google, Nielsen, WordStream, Buffer |
| tech-adoption-data-points.md | 420 | Gartner, IBM, GitHub, Statista |
| immigration-relocation-research.md | 430 | USCIS, State Dept, Eurostat, Mercer |
| productivity-human-performance-data.md | 400 | UC Irvine, VidIQ, GitHub, WEF |
| nonprofit-social-impact.json | 306 | Giving USA, GiveWell, B Lab, WEF |
| legal-datapoints.json | 319 | USPTO, EEOC, WIPO, IRS, FTC |
| master-funnels.json | ~100 | Composite (all above) |
| source-authority.json | — | Classification system |

## Source tier distribution (estimated)
- **S tier (30%):** BLS, Census, Fed, WHO, UNESCO, NEJM, Lancet
- **A tier (35%):** McKinsey, CB Insights, Harvard, Pew, Gallup, Nielsen
- **B tier (25%):** ChartMogul, ProfitWell, Toast, Upwork, Shopify
- **C tier (8%):** Failory, DemandSage (to be replaced)
- **D tier (2%):** "Common pattern" (to be eliminated)

## Top sources used (by frequency)

### Tier S
1. U.S. Bureau of Labor Statistics (BLS) — business survival, wages, employment
2. Federal Reserve (FRED/SHED/SCF) — wealth, debt, savings
3. CDC — health, weight, chronic disease
4. UNESCO — global education, literacy
5. NEJM / Lancet / JAMA — clinical outcomes, health interventions

### Tier A
1. CB Insights — startup failure reasons, VC funnel
2. McKinsey — consumer behavior, digital transformation
3. Pew Research — demographics, social trends, religion
4. ChartMogul — SaaS growth, ARR milestones, churn
5. Gallup — global polls, employment, wellbeing
6. Nielsen/NielsenIQ — consumer purchasing, advertising
7. Harvard Business School — management, strategy
8. Gottman Institute — marriage, relationship prediction

### Tier B
1. ProfitWell/Paddle — SaaS churn, pricing
2. Toast POS — restaurant data
3. Upwork — freelance market
4. Shopify — ecommerce conversion
5. IHRSA — fitness industry

## Expansion plan
- **Current:** 6,250 data points
- **Next:** 10,000 (add: crypto, real estate detail, parenting, retirement, career transitions)
- **Then:** 100,000 (per-country, per-industry, per-demographic breakdowns)
- **Automated:** Monthly cron to scrape BLS, CB Insights, Statista updates
