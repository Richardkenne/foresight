# Simulator — Data Sources & Datasets

## Index
- [API live attive](#api-live-attive)
- [Dataset locali](#dataset-locali)
- [Dataset da importare](#dataset-da-importare)

---

## API live attive

| API | URL | Dati | Usata per | Costo |
|-----|-----|------|-----------|-------|
| **World Bank** | api.worldbank.org | GDP, population, life expectancy, education per paese | Template immigration, economy, development | Gratuita |
| **REST Countries** | restcountries.com | Info paese (popolazione, lingue, valuta, regione) | Template immigration, relocation | Gratuita |
| **Exchange Rates** | exchangerate-api.com | Tassi di cambio in tempo reale | Template finanziari, relocation | Gratuita (1500 req/mese) |
| **BLS** | api.bls.gov | Salari per occupazione, CPI, employment | Template carriera, salario | Gratuita (500 req/giorno) |
| **Wikipedia** | en.wikipedia.org/api | Info generali, biografie, fatti storici | Contesto template vari | Gratuita |
| **Teleport** | api.teleport.org | Quality of life score per citta (costo vita, sicurezza, salute) | Template relocation, immigration | Gratuita |
| **CoinGecko** | api.coingecko.com | Prezzi crypto in tempo reale | Template crypto, investimenti | Gratuita (30 req/min) |

## Bulk Downloads (API → JSON locali)

| Fonte | File | Data points | Indicatori | Periodo | Status |
|-------|------|-------------|------------|---------|--------|
| **World Bank** | 10 file (`worldbank-*.json`) | 247,460 | GDP, population, education, health, labor, business, poverty, environment, financial, gender | 2000-2024 | Done (2026-03-28) |
| **OECD** | — | — | Economic outlook, education, health, labor, innovation, wellbeing, taxation, trade, housing, productivity | 2000-2024 | TODO |
| **BLS** | 7 file (`bls-*.json`) | ~15,000 | Unemployment, CPI, wages, earnings, productivity, PPI, occupational employment | 2000-2024 | Done (2026-03-28) |

## Deep Country Research

| File | Data points | Paesi | Citta | Fonti |
|------|-------------|-------|-------|-------|
| `country-probabilities-deep.json` | 583 | 20 (USA, ID, AU, UK, IT, IN, UAE, DE, JP, SG, MY, TH, PH, NL, CA, BR, KR, FR, GH, NZ) | 15 (Bandung, Jakarta, Sydney, Melbourne, London, Dubai, NYC, Berlin, Singapore, Bangkok, Tokyo, Milan, Rome, Amsterdam, Toronto) | Numbeo 2026, World Bank, OECD, ILO, GEM 2024/2025, BLS, Upwork, ITU, national stats offices |

Per ogni paese (24 dp ciascuno): salary (overall + tech, food service, marketing, freelance), cost of living index, rent index, business startup cost (cafe, online, agency), business survival (yr1/3/5), unemployment (overall + youth), job search duration, minimum wage, internet penetration, ease of doing business, entrepreneurship rate, savings rate, gig economy %, freelancer hourly rate, remote work %.

Per ogni citta (6 dp ciascuna): cost of living index, CoL+rent index, monthly cost single person, 1BR rent city center, cafe startup cost, coworking monthly cost.

## Dataset locali

107+ file JSON/MD in `data/`, ~365,600+ data points totali. Categorie principali:

| Categoria | File | Data points | Esempi |
|-----------|------|-------------|--------|
| Historical cycles | ~5 | 3,000+ | Empires, financial crises, tech cycles |
| Productivity & performance | ~8 | 5,000+ | Human performance, cognitive biases, habits |
| Immigration | ~5 | 2,300+ | Visa types, country comparison, cost of living, culture shock, expat failure rates, language learning FSI, visa approval rates, relocation satisfaction (312 dp deep) |
| Financial | ~10 | 8,000+ | Compound interest, retirement, FIRE, market history |
| Career | ~7 | 4,350+ | Salary data, career paths, skills demand, career probabilities deep (346 dp): top 50 occupations with salary/growth/automation risk, 20 high-growth + 15 declining occupations, 40 automation risk scores, wages by group, education-earnings, career transitions by age/industry/generation, freelance vs employee, remote work by occupation, underemployment by major, first job stats by field, salary progression, sector projections, entrepreneurship |
| Tech, AI & Digital | ~2 | 1,200+ | AI impact (1010 dp), tech/AI deep probabilities (236 dp): automation risk by sector, AI adoption, coding productivity, AI accuracy, startup success, prompt engineering, bootcamp placement, salary progression, layoffs, remote salary, freelance, open source, app store, retention, SaaS benchmarks, Product Hunt, indie hackers, conversion rates, crypto trading, NFT/DeFi, cybersecurity |
| Health & aging | ~6 | 3,300+ | Life tables, health metrics, aging factors, weight loss, fitness, smoking, alcohol, mental health, sleep, meditation (312 dp deep) |
| Relationships | ~5 | 2,300+ | Marriage stats, parenting, social networks, divorce by country/duration, infidelity, interracial/interfaith, cohabitation effect, friendship, lending money (312 dp deep) |
| Crime, justice & legal | ~1 | 213 | Crime victimization (US/global), recidivism, arrest/conviction rates, sentencing, wrongful conviction, cybercrime, scam/fraud, lawsuit outcomes, divorce/family court, bankruptcy, car accidents, workplace injuries, natural disasters, home fire, identity theft |
| Startup & business | ~9 | 5,200+ | Startup survival, market timing, business models, business survival probabilities (221 dp from SBA/BLS/CB Insights/Failory/Kauffman/GEM/Startup Genome) |
| Psychology & Habits | ~6 | 3,250+ | Decision-making, cognitive load, motivation, psychology-habits-probabilities (247 dp): New Year's resolutions, habit formation (Lally 66 days), habit retention, therapy completion, self-help implementation, journaling/meditation retention, cold turkey vs gradual, accountability/public commitment, depression/anxiety/PTSD treatment, burnout, impostor syndrome, loneliness, suicide, addiction recovery by substance, deep work, multitasking, meetings, procrastination, morning routine, sleep deprivation, exercise cognition, career change, midlife/quarter-life crisis, retirement satisfaction, volunteering, travel, reading habits, financial literacy, Dunbar's number, weak ties, mentorship, social media mental health, trust by country, cooperation rates. 18+ sources (APA, WHO, NIH, SAMHSA, Gallup, Pew, World Values Survey, UCL, PMC/PubMed) |
| Fame, Entertainment & Sports | 1 | 187 | Pro sports probability (NCAA), career length, injury rates, Olympics, prize money, youth dropout, acting (SAG-AFTRA), music industry, touring, YouTube/TikTok/Instagram/Twitch creators, podcasting, writing/publishing, film, comedy, viral content, Patreon, esports, creative careers |
| Other | ~12 | 5,000+ | Sports, creative arts, dreams, remote work, language |

## Dataset da importare

| Dataset | URL/Fonte | Tipo | Dimensione | Uso previsto | Priorita |
|---------|-----------|------|------------|--------------|----------|
| **Choices13k** | github.com/jcpeterson/choices13k | 13,000+ behavioral games con payoff matrix | ~50MB | Template decision-making, game theory, behavioral economics | ALTA |
| **BLS Occupational** | bls.gov/oes | Salari per occupazione (800+ occupazioni) | ~10MB | Template carriera — salari reali per professione | ALTA |
| **SSA Life Table** | ssa.gov/oact/STATS/table4c6.html | Tabelle mortalita attuariali USA | ~1MB | Template life expectancy, health, retirement | ALTA |
| **O*NET** | onetonline.org | Skills, knowledge, abilities per occupazione | ~100MB | Template carriera — match skill-occupazione | MEDIA |
| **Opportunity Insights** | opportunityinsights.org | Mobilita economica per area geografica USA | ~500MB | Template immigration, location, social mobility | MEDIA |
| **cFIREsim** | github.com/boknows/cfiresim | Dati storici mercati per FIRE retirement simulation | ~5MB | Template FIRE, retirement, investimenti | ALTA |
| **OpenLife** | lifetable.de / HMD | Life tables internazionali (190+ paesi) | ~20MB | Template longevita, health comparison tra paesi | MEDIA |
