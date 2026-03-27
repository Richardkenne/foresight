# Free Public APIs & Databases for Simulator

> Tutte gratuite, programmabili, con milioni/miliardi di data points.
> Costo totale infrastruttura dati: **$0/mese**.

## Tier 1 — MUST-HAVE (gratis, API eccellente, alto valore)

| # | Database | Python Package | Dati chiave | Rate limit |
|---|----------|---------------|-------------|------------|
| 1 | **FRED** (Federal Reserve) | `fredapi` | 800K+ serie: GDP, inflazione, unemployment, housing | ~illimitato |
| 2 | **World Bank API** | `wbdata` | 16K+ indicatori x 200 paesi: Gini, GDP/capita, poverty | Illimitato |
| 3 | **Our World in Data** | `pd.read_csv(url)` | Happiness, mobilita' sociale, salute, dal 1800 | GitHub 5K/ora |
| 4 | **Census Bureau API** | `censusdata` | Reddito, istruzione per zip code, 330M americani | Illimitato con key |
| 5 | **OECD API** | `pandasdmx` | Mobilita' intergenerazionale, PISA, ore lavoro | Illimitato |
| 6 | **Nasdaq Data Link** | `nasdaqdatalink` | Real estate, commodity, macro alternativo | 50K/giorno |
| 7 | **Semantic Scholar** | `semanticscholar` | 200M paper accademici, ricerca comportamentale | 100 req/sec |
| 8 | **BLS API** | `bls` | Salari per professione, CPI, occupazione | 500/giorno |

## Tier 2 — Alta utilita'

| # | Database | Note |
|---|----------|------|
| 9 | **Kaggle API** | 200K+ dataset curati (consumer, HR, marketing) |
| 10 | **CDC WONDER** | Probabilita' morte per causa/eta'/sesso USA |
| 11 | **EDGAR SEC** | Financials aziende quotate (revenue, growth, burn) |
| 12 | **ClinicalTrials.gov** | 450K+ studi clinici, outcome salute |
| 13 | **OSF API** | Dataset psicologici validati scientificamente |
| 14 | **CrossRef API** | Metadata 140M paper |
| 15 | **CORE API** | 200M paper open access con FULL TEXT |
| 16 | **CoinGecko** | Crypto data, 10K req/mese free |
| 17 | **ICPSR** | 17K+ dataset comportamentali (U. Michigan) |
| 18 | **GBD (IHME)** | Burden of disease globale, download CSV |

## NON adatti (troppo costosi o limitati)

| Database | Motivo |
|----------|--------|
| Twitter/X API | $200/mese minimo |
| Crunchbase API | $99/mese |
| Alpha Vantage | 25 req/giorno |
| Google Scholar | No API |
| Reddit API | Approvazione richiesta |
