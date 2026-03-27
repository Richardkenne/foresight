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

## Dataset locali

67 file JSON/MD in `data/`, 56,000+ data points totali. Categorie principali:

| Categoria | File | Data points | Esempi |
|-----------|------|-------------|--------|
| Historical cycles | ~5 | 3,000+ | Empires, financial crises, tech cycles |
| Productivity & performance | ~8 | 5,000+ | Human performance, cognitive biases, habits |
| Immigration | ~4 | 2,000+ | Visa types, country comparison, cost of living |
| Financial | ~10 | 8,000+ | Compound interest, retirement, FIRE, market history |
| Career | ~6 | 4,000+ | Salary data, career paths, skills demand |
| Health & aging | ~5 | 3,000+ | Life tables, health metrics, aging factors |
| Relationships | ~4 | 2,000+ | Marriage stats, parenting, social networks |
| Startup & business | ~8 | 5,000+ | Startup survival, market timing, business models |
| Psychology | ~5 | 3,000+ | Decision-making, cognitive load, motivation |
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
