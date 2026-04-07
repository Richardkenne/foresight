# RAG Quality Report — 2026-04-06

## Summary
- **Queries tested**: 20
- **Queries with RAG results**: 20/20
- **Average similarity score**: 66.9%
- **Average relevance score**: 9.7/10 (Relevant=2pts, Partial=1pt, per result x5)
- **Good results (>=3 relevant in top 5)**: 19/20
- **OK results (2 relevant)**: 0/20
- **Poor results (<2 relevant)**: 1/20
- **Keyword fallback coverage**: 10/20 queries match a business type

## Per-Query Results

### 1. "opening a cafe"
- **Keyword match**: fnb-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | cafe-restaurant-business | 60.0% | Small cafe startup (500-800 sqft): 80000-150000 USD (Toast, 2024)... | Relevant |
| 2 | fnb-business-comprehensive | 59.4% | startup_costs/cafe coffee shop avg usd: 275000 (Toast 2024)... | Relevant |
| 3 | fnb-business-comprehensive | 59.1% | fnb-business-comprehensive/startup_costs/cafe coffee shop avg usd: 275000 (Toast... | Relevant |
| 4 | master-funnels | 58.6% | cafe/margins/net coffee shop: 11... | Relevant |
| 5 | cafe-restaurant-business | 58.3% | Average cafe/coffee shop startup cost: 200000 USD (SCA (Specialty Coffee Associa... | Relevant |

### 2. "SaaS startup funding"
- **Keyword match**: saas-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | marketplace-platform-business | 70.7% | Marketplace funding premium vs SaaS (same stage): 1.5-2.5 x more capital needed ... | Relevant |
| 2 | career-employment | 70.6% | SaaS startup median annual revenue at 3 years: 350000 USD (SaaS Capital, 2024)... | Relevant |
| 3 | funding-finance-business | 70.0% | SaaS startups hitting $1M ARR that were bootstrapped/indie: 75 % (Founderpath / ... | Relevant |
| 4 | failure-forensics | 69.7% | SaaS startups launched per day (estimated): 100+ startups (SaaStr, 2025)... | Relevant |
| 5 | side-hustle-entrepreneurship | 69.7% | SaaS R&D spending as % of revenue (early stage): 30-40 % (SaaS benchmarks)... | Relevant |

### 3. "freelancing on Upwork"
- **Keyword match**: upwork-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | sales-outreach-data | 68.5% | Upwork freelancer service fee: 10 % (Upwork Pricing 2025)... | Relevant |
| 2 | master-funnels | 68.0% | freelance/platforms/upwork commission: 10... | Relevant |
| 3 | side-hustle-entrepreneurship | 67.7% | Upwork service fee (freelancer, sliding scale): 10 % (Upwork)... | Relevant |
| 4 | business-archetypes-1 | 64.9% | Learn Skill → Freelance → Get Clients stage: Sign up on Upwork/Fiverr — probabil... | Relevant |
| 5 | business-archetypes-1 | 64.9% | Learn Skill → Freelance → Get Clients stage: Reach $500/month consistently — pro... | Relevant |

### 4. "moving to Indonesia"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | bank-hsbc | 65.3% | Average relocation cost — EU to Indonesia: 12000 usd (HSBC International Service... | Relevant |
| 2 | immigration-relocation-research | 64.5% | Average relocation cost — Indonesia (to): 4500 USD (ECA International, 2024)... | Relevant |
| 3 | bank-hsbc | 60.5% | Average time to feel settled — Indonesia: 10 months (HSBC Expat Explorer Survey ... | Relevant |
| 4 | legal-tax-business-reality | 59.4% | Indonesia digital nomad visa (B211A) — cost: 2000000 IDR (Imigrasi, 2026)... | Relevant |
| 5 | immigration-relocation | 58.3% | Jakarta total modest expat budget: 1000–1500 USD/month (Numbeo/local, 2025)... | Relevant |

### 5. "career change at 35"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | aging-retirement-life-stages | 69.2% | Workers considering career change at midlife: 49 % (AARP Work and Jobs Study)... | Relevant |
| 2 | aging-retirement-life-stages | 65.9% | Workers considering career change at midlife: 49 % (AARP Work and Jobs Study, 20... | Relevant |
| 3 | aging-retirement-life-stages | 65.7% | Workers who changed careers after age 40: 29 % (Indeed Survey)... | Relevant |
| 4 | dreams-ambition-failure | 65.4% | Career transitions happening after age 40: 30 % (LinkedIn 2024, 2024)... | Relevant |
| 5 | aging-retirement-life-stages | 65.0% | Workers who changed careers after age 40: 29 % (Indeed Survey, 2023)... | Relevant |

### 6. "YouTube channel growth"
- **Keyword match**: creator-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | marketing-growth | 77.5% | YouTube video podcast channel growth (10k+ subs) YoY: 33 % (YouTube)... | Relevant |
| 2 | side-hustle-entrepreneurship | 77.5% | YouTube collab videos: subscriber growth boost: 20-50 % more subs per video (Est... | Relevant |
| 3 | marketing-growth | 76.7% | YouTube video podcast channel growth (10k+ subs) YoY: 33 % (YouTube, 2025)... | Relevant |
| 4 | youtube-guru-funnel-data | 75.9% | YouTube education channel growth rate: +20 % yoy (Estimated)... | Relevant |
| 5 | side-hustle-entrepreneurship | 74.5% | YouTube channels growing 10%+ monthly: 15 % (Social Blade)... | Relevant |

### 7. "restaurant failure rate"
- **Keyword match**: fnb-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | cafe-restaurant-business | 79.9% | Restaurant failure rate within 10 years: 80 % (BLS, 2024)... | Relevant |
| 2 | cafe-restaurant-business | 79.2% | Restaurant failure rate within 3 years: 30 % (BLS (Bureau of Labor Statistics), ... | Relevant |
| 3 | cafe-restaurant-business | 78.8% | Restaurant failure rate within 5 years: 60 % (BLS / Cornell Hospitality Report, ... | Relevant |
| 4 | cafe-restaurant-business | 77.8% | Restaurant failure rate within 1 year: 17 % (Ohio State University / Perry Group... | Relevant |
| 5 | dreams-ambition-failure | 77.8% | Restaurant failure rate within 1 year: 27 % (National Restaurant Association / O... | Relevant |

### 8. "crypto trading success"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | tech-ai-probabilities-deep | 64.7% | Crypto traders consistently profitable: 15 % (range 10-20%) (Exchange Data Studi... | Relevant |
| 2 | prediction-markets-trading | 62.5% | crypto_trading/crypto_traders_profitable_overall: 20 percent (Estimated, 2024)... | Relevant |
| 3 | tech-ai-probabilities-deep | 60.9% | Crypto day traders consistently profitable: 12.5 % (range 10-15%) (Exchange Data... | Relevant |
| 4 | prediction-markets-trading | 59.7% | retail_trading_profitability/successful_traders_daily_return: 0.03 to 0.13 perce... | Relevant |
| 5 | backtest-relationships-money | 59.6% | case name: Copy trading profitable after 1 year, scenario: Person uses social tr... | Relevant |

### 9. "cleaning business startup"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | country-specific-business | 73.6% | Average cleaning business startup cost: 5000 AUD (EEA Advisory, 2025)... | Relevant |
| 2 | country-specific-business | 71.0% | Cleaning business startup cost: 2000 USD (UpFlip, 2025)... | Relevant |
| 3 | backtest-relationships-money | 68.3% | case name: Cleaning business reaching $5K/month, scenario: Person starts residen... | Relevant |
| 4 | time-to-result-benchmarks | 59.7% | Cleaning business — break-even: 1-3 months (Service business data)... | Relevant |
| 5 | time-to-result-benchmarks | 59.5% | Local service business (cleaning, lawn) — first client: 1-7 days (Small business... | Relevant |

### 10. "MBA return on investment"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | education-stats | 69.9% | mba/Net MBA financial gain over 10 years (avg): 662290 USD (Bloomberg MBA ROI 20... | Relevant |
| 2 | social-dynamics-influence | 69.3% | Status signaling through education: MBA ROI expectation: 200000 USD lifetime pre... | Relevant |
| 3 | education-stats | 68.7% | mba/Average annual ROI — MBA across Bloomberg sample: 12.7 %/year (Bloomberg MBA... | Relevant |
| 4 | life-situations-deep-2 | 68.5% | metric: MBA — ROI timeline for top 20 vs lower ranked programs, value: Top 20: R... | Relevant |
| 5 | bank-morgan-stanley | 66.7% | ROI of top-20 MBA (20-year NPV): 1200000 USD (Morgan Stanley Career & Education ... | Relevant |

### 11. "photography business"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | time-to-result-benchmarks | 68.9% | Photography business — $1K/month: 2-4 months (Photography business surveys)... | Relevant |
| 2 | time-to-result-benchmarks | 68.4% | Photography business — $10K/month: 12-24 months (Photography business data)... | Relevant |
| 3 | time-to-result-benchmarks | 65.7% | Photography — break-even (gear + marketing): 6-12 months (Photography business d... | Relevant |
| 4 | time-to-result-benchmarks | 65.0% | Photography — basics to sellable work: 3-6 months (Photography community)... | Relevant |
| 5 | photography-business | 64.1% | Photography business survive year 5: 40 % (IBISWorld Photography 2024)... | Relevant |

### 12. "dropshipping profit margin"
- **Keyword match**: ecommerce-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | failure-forensics | 79.3% | Dropshipping average profit margin: 10-15 % (Oberlo, 2025)... | Relevant |
| 2 | failure-forensics | 78.3% | Average dropshipping profit margin: 10-15 % (Dropship Lifestyle, 2025)... | Relevant |
| 3 | side-hustle-entrepreneurship | 77.9% | Dropshipping average profit margin: 15-20 % (Oberlo)... | Relevant |
| 4 | country-specific-business | 75.9% | Dropshipping average profit margin: 20 % (Shopify / Oberlo, 2025)... | Relevant |
| 5 | ecommerce-business | 74.5% | Dropshipping net margin (after ads, returns, fees): 5-10 % (Oberlo / industry an... | Relevant |

### 13. "gym business survival"
- **Keyword match**: NONE
- **Relevance**: 0 Relevant, 5 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | business-archetypes-5 | 59.1% | business-archetypes-5/lifestyle_business_context/entrepreneur exercise regularly... | Partial |
| 2 | real-probabilities | 56.7% | business/startup_survive_information/prob: 29.1... | Partial |
| 3 | real-probabilities | 52.7% | business/startup_survive_manufacturing/prob: 43.6... | Partial |
| 4 | master-funnels | 52.6% | startup/by_industry/restaurant survival 5yr pct: 40... | Partial |
| 5 | backtest-relationships-money | 51.7% | case name: Vending machine business profitable year 1, scenario: Person invests ... | Partial |

### 14. "AI agency pricing"
- **Keyword match**: agency-data
- **Relevance**: 3 Relevant, 2 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | pricing-psychology | 68.4% | AI pricing: customers willing to pay premium for AI features: 15 % to 25% premiu... | Partial |
| 2 | pricing-psychology | 66.6% | AI/agentic pricing models emerging: pay per task or resolution: 25 % of AI SaaS ... | Partial |
| 3 | market-timing-trends | 66.2% | AI agency startups 2024-2025 (new category explosion): 15000+ agencies (Industry... | Relevant |
| 4 | business-archetypes-1 | 66.0% | AI Automation Agency (2025 Meta) stage: Close first paying client — probability:... | Relevant |
| 5 | service-agency-business | 65.2% | Rate premium for US-based agencies over global average: 3.5 x multiplier (Clutch... | Relevant |

### 15. "organic farming profitability"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | real-probabilities | 63.5% | real-probabilities/business/startup_survive_agriculture/prob: 50.5... | Relevant |
| 2 | industry-specific-data | 62.6% | agriculture/avg net margin: 0.0391... | Relevant |
| 3 | farming-agriculture-business | 62.5% | Farms with negative net income: 45 % (USDA ERS 2024)... | Relevant |
| 4 | industry-specific-data | 62.3% | agriculture/profitability_by_type/specialty crops trend: below 2023 levels in 20... | Relevant |
| 5 | industry-specific-data | 62.2% | agriculture/profitability_by_type/corn trend: below 2023 levels in 2024... | Relevant |

### 16. "mobile app success rate"
- **Keyword match**: saas-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | failure-forensics | 66.2% | Gaming app success rate (profitable): 5 % (App Annie, 2025)... | Relevant |
| 2 | failure-forensics | 65.6% | Consumer app failure rate (2yr): 90 % (Statista/data.ai, 2025)... | Relevant |
| 3 | failure-forensics | 65.0% | Consumer app failure rate: 90 % (CB Insights, 2025)... | Relevant |
| 4 | master-funnels | 64.8% | app_development/monetization/app store rejection rate pct: 20... | Relevant |
| 5 | failure-forensics | 64.8% | Social media app failure rate: 95 % (Estimated, 2025)... | Relevant |

### 17. "podcast monetization"
- **Keyword match**: creator-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | time-to-result-benchmarks | 71.4% | Podcast: 'monetize from episode 1' — realistic sponsor threshold: 1000+ download... | Relevant |
| 2 | marketing-growth | 67.9% | Podcast ad revenue (US): 4000000000 USD (IAB/PwC)... | Relevant |
| 3 | side-hustle-entrepreneurship | 66.2% | Podcast CPM (mid-roll ad, 25K+ downloads): 20-30 USD (AdvertiseCast)... | Relevant |
| 4 | time-to-result-benchmarks | 66.2% | Podcast — first sponsorship revenue: 6-12 months (Podcast industry surveys)... | Relevant |
| 5 | marketing-growth | 66.0% | Podcast ad revenue (US, 2025): 2500000000 USD (Multiple)... | Relevant |

### 18. "barbershop startup cost"
- **Keyword match**: fnb-data
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | country-specific-business | 79.6% | Average barber/salon startup cost: 60000 USD (LivePlan / UpFlip, 2025)... | Relevant |
| 2 | pet-care-business | 61.7% | Average startup cost grooming: 50,000-100,000 USD (PetGroomer.com 2024)... | Relevant |
| 3 | salon-beauty-business | 61.7% | Average startup cost: 62,000 USD (Professional Beauty Association 2024)... | Relevant |
| 4 | country-specific-business | 61.5% | Average hair salon startup cost: 80000 AUD (Ashmans / EEA Advisory, 2025)... | Relevant |
| 5 | fnb-business-comprehensive | 59.3% | fnb-business-comprehensive/startup_costs/cafe coffee shop avg usd: 275000 (Toast... | Relevant |

### 19. "digital nomad income"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | social-dynamics-influence | 79.7% | Digital nomads average income: 80000 USD/year (Estimated)... | Relevant |
| 2 | indonesia-business-deep | 74.5% | Digital nomad income requirement: 24000 USD/year (Immigration Office, 2025)... | Relevant |
| 3 | remote-work-digital-nomad | 71.9% | metric: Digital nomads — median annual income, value: 60000, unit: USD/year, sou... | Relevant |
| 4 | remote-work-digital-nomad | 71.1% | metric: Average monthly income digital nomads, value: 5000, unit: USD/month, sou... | Relevant |
| 5 | life-situations-deep-2 | 70.9% | metric: Travel world — digital nomad population and income, value: 35 million di... | Relevant |

### 20. "import export business"
- **Keyword match**: NONE
- **Relevance**: 5 Relevant, 0 Partial, 0 Irrelevant

| Rank | Source File | Similarity | Content Preview | Relevance |
|------|------------|------------|-----------------|-----------|
| 1 | business-archetypes-3 | 64.3% | Import/Export Business stage: Clear customs (adds 15-25% to total cost) — probab... | Relevant |
| 2 | business-archetypes-3 | 64.2% | Import/Export Business stage: List on marketplace or local channels — probabilit... | Relevant |
| 3 | business-archetypes-3 | 64.0% | Import/Export Business stage: Reach $5K/month revenue — probability: 30%, time: ... | Relevant |
| 4 | business-archetypes-3 | 63.6% | Import/Export Business stage: Reach $2K/month net profit — probability: 20%, tim... | Relevant |
| 5 | business-archetypes-3 | 63.0% | Import/Export Business stage: Place first order ($500-2K typical) — probability:... | Relevant |

## Weak Areas

Queries where RAG fails to return useful data:

- **"gym business survival"** — 0 relevant, 5 partial. Top result: business-archetypes-5 (59.1%). Keyword fallback: NONE

### Queries with ZERO coverage (no RAG, no keyword)

- **"gym business survival"** — needs new data files or expanded keywords

## Recommendations

### Data Gaps
- 10 queries have no keyword fallback. Add keyword entries for: "moving to Indonesia", "career change at 35", "crypto trading success", "cleaning business startup", "MBA return on investment", "photography business", "gym business survival", "organic farming profitability", "digital nomad income", "import export business"

### Chunking
- Current chunks are short (max 500 chars). Consider longer chunks (800-1000 chars) for more context per result.
- Chunks are path-based (`file/key/subkey: value`). Consider adding natural language descriptions to improve semantic search.

### Embedding Model
- Using `text-embedding-3-small` at 512 dims. Consider testing `text-embedding-3-large` (3072 dims) for better discrimination on niche queries.
- Alternative: Cohere embed-v3 or Voyage AI for domain-specific embeddings.

### Search Parameters
- The `search_embeddings` RPC function does NOT have a `match_threshold` parameter (only `query_embedding` and `match_count`). Consider adding one to filter low-quality results server-side.
- Production uses `match_count: 30` — for quality, the top 10-15 are usually sufficient.
- "gym business survival" returned results with similarity 51-59%, all only partially relevant. A threshold of 0.55+ would filter these out and trigger keyword fallback instead.

### Missing Data Files
- Create `data/fitness-industry-data.json` for "gym business survival" queries

---
*Generated by `scripts/test-rag-quality.ts`*