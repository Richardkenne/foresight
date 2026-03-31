# No-Money Income Path: Candidate Data Mapping

Scenario target:

`A man with no money tries to make some money`

Obiettivo di questa nota:
- trovare dati gia presenti nel workspace
- associare dati specifici ai nodi del flow HTML
- non cambiare nulla in `v2`

## Best Matches Found

### 1. First proof / first money

Best direct support:

- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `earn_100_in_90_days`: `18` su `1000` signup = `1.8% of start`
  - `time_to_first_dollar_months`: `1-3 months`, median `1.5`

- [time-to-result-benchmarks.json](/Users/richardbotsiokennedy/Simulator/v2/data/time-to-result-benchmarks.json)
  - `Freelancing (cold outreach) — time to first client`: `1-2 weeks`
  - `Freelancing (local services) — time to first job`: `1-7 days`
  - `Productized service — first client`: `1-3 weeks`
  - `Local service business (cleaning, lawn) — first client`: `1-7 days`

Interpretazione:
- se il path e` `Upwork/freelance`, hai dati abbastanza precisi per il nodo `Sticks long enough to earn first $100?`
- se il path e` piu` generico, il file migliore e` `time-to-result-benchmarks.json`

### 2. $500/month threshold

Best direct support:

- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - `Median monthly side hustle income`: `$500`
  - `Average monthly side hustle income`: `$891`
  - `Side hustlers earning under $500/month`: `47%`

Interpretazione:
- il tuo nodo `Reaches $500/month?` e` molto difendibile
- `$500/month` emerge proprio come soglia reale nel dataset, non come numero arbitrario

### 3. $1K+/month threshold

Best support:

- [time-to-result-benchmarks.json](/Users/richardbotsiokennedy/Simulator/v2/data/time-to-result-benchmarks.json)
  - `Productized service — $1K/month`: `1-2 months`
  - `Cleaning/janitorial service — $1K/month`: `2-4 weeks`

- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `pct_earning_over_1k_month`: `15-20%` of active earners

Interpretazione:
- `$1K/month` come soglia di sostenibilita` minima ha senso
- il dato Upwork non dice “tutti”, ma dice che tra chi e` gia` attivo una quota relativamente piccola supera `$1K/month`

### 4. Quit / abandonment / early failure

Best support:

- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `freelancer_quit_year_1_pct`: `60-70%`
  - `freelancer_never_earn_pct`: `50-70%`
  - `freelancer_avg_lifespan_months`: `8-14 months`

- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - `Average side hustle lifespan before quitting/pivoting`: `14 months`

Interpretazione:
- il nodo `Quit, no income` e` ben supportato
- l’idea del drop-off prima della stabilita` non e` narrativa: e` gia` nei dati

### 5. Burnout

Best support:

- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - `Side hustle burnout rate within first year`: `43%`

- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `burnout_past_year_pct`: `63%`
  - `anxiety_income_instability_pct`: `68%`

- [content-creator-business.json](/Users/richardbotsiokennedy/Simulator/v2/data/content-creator-business.json)
  - `Average time for creator to earn first dollar`: `6.5 months`
  - multiple burnout metrics for creators

Interpretazione:
- il nodo `Burnout after repeated attempts` e` assolutamente supportabile
- per content-based paths, il file creator e` molto utile per mostrare quanto lungo sia il periodo senza reward

## Best Node-by-Node Mapping

### STATE
`Man with $0 liquid margin / urgent income need`

Weak direct support:
- non ho trovato un dataset esatto con questa frase

Closest support:
- [personal-finance.json](/Users/richardbotsiokennedy/Simulator/v2/data/personal-finance.json)
- [worldbank-poverty-inequality.json](/Users/richardbotsiokennedy/Simulator/v2/data/worldbank-poverty-inequality.json)

Note:
- questo nodo e` piu` a framing level che a metric level
- si puo` supportare meglio cercando indicatori di liquid fragility, not income generation

### ACTION
`Starts a no-upfront-cost income path`

Best support:
- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - side hustles
  - freelance services
  - service pricing examples

### BOTTLENECK
`Sticks long enough to earn first $100?`

Best support:
- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `earn_100_in_90_days = 1.8%`
  - `time_to_first_dollar_months = 1-3`

- [content-creator-business.json](/Users/richardbotsiokennedy/Simulator/v2/data/content-creator-business.json)
  - `Average time for creator to earn first dollar = 6.5 months`

### GATE
`Reaches $500/month?`

Best support:
- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - median exactly `$500/month`
  - `47%` earn under `$500/month`

### STATE
`Stuck at $200-$400/month`

Partial support:
- no exact `$200-$400` metric found yet

Closest support:
- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - median `$500`
  - large subscale cohort under `$500`

Note:
- il range `$200-$400` e` narrativamente buono, ma ad oggi lo tratterei come inferred, non directly measured

### STATE
`$500+/month achieved / bills partly covered`

Best support:
- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - median `$500`
  - average `$891`

### BOTTLENECK
`Scales to $1,000+/month?`

Best support:
- [time-to-result-benchmarks.json](/Users/richardbotsiokennedy/Simulator/v2/data/time-to-result-benchmarks.json)
  - multiple service paths reaching `$1K/month`
- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `15-20%` of active earners exceed `$1K/month`

### OUTCOME
`Quit, no income`

Best support:
- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `50-70% never earn`
  - `60-70% quit year 1`

### OUTCOME
`Stuck in low-income trap`

Best support:
- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - `47% under $500/month`
- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - bottom 50% less than `$2K/year`

### OUTCOME
`Burnout after repeated attempts`

Best support:
- [side-hustle-entrepreneurship.json](/Users/richardbotsiokennedy/Simulator/v2/data/side-hustle-entrepreneurship.json)
  - `43% burnout in first year`
- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `63% burnout past year`

### OUTCOME
`Sustainable income ($1K+/month)`

Best support:
- [time-to-result-benchmarks.json](/Users/richardbotsiokennedy/Simulator/v2/data/time-to-result-benchmarks.json)
  - several service paths have explicit `$1K/month` benchmarks
- [upwork-data.json](/Users/richardbotsiokennedy/Simulator/v2/data/upwork-data.json)
  - `15-20%` of active earners exceed `$1K/month`

## Bottom Line

The scenario is supportable with real internal data.

Strongly supported nodes:
- first money / first proof
- `$500/month`
- `$1K/month`
- quit / abandonment
- burnout

Weakest node:
- `$0 liquid margin / urgent income need`

Reason:
- this is more a financial-fragility framing node than a business-performance node

## Recommended Use

If you want the cleanest evidence-backed version of this scenario, the best hybrid grounding is:

1. `side-hustle-entrepreneurship.json` for `$500/month` and burnout
2. `time-to-result-benchmarks.json` for first client / first revenue / `$1K/month`
3. `upwork-data.json` if you want to anchor the scenario to a freelancing path specifically
