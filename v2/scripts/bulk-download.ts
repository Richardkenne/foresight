/**
 * Bulk Data Download — Free APIs
 * Downloads ~500K data points from OECD, UN, Eurostat, BLS
 * Run once, then index into RAG
 *
 * Run: npx tsx scripts/bulk-download.ts
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// ============ HELPERS ============

async function fetchWithRetry(url: string, retries = 3): Promise<Response | null> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (res.ok) return res;
      console.log(`    HTTP ${res.status} for ${url.substring(0, 80)}... (retry ${i + 1})`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`    Error: ${msg.substring(0, 80)} (retry ${i + 1})`);
    }
    await new Promise(r => setTimeout(r, 2000 * (i + 1)));
  }
  return null;
}

function saveJSON(filename: string, data: unknown[]): number {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Saved ${(data as unknown[]).length} entries → ${filename}`);
  return (data as unknown[]).length;
}

// ============ WORLD BANK EXPANDED ============
// More indicators than current bulk — business, tech, infrastructure

async function downloadWorldBankExpanded(): Promise<number> {
  console.log('\n=== World Bank Expanded ===');
  const indicators = [
    // Business environment
    { id: 'IC.BUS.EASE.XQ', name: 'Ease of Doing Business Score' },
    { id: 'IC.REG.DURS', name: 'Days to Start Business' },
    { id: 'IC.REG.COST.PC.ZS', name: 'Cost to Start Business (% GNI)' },
    { id: 'IC.TAX.TOTL.CP.ZS', name: 'Total Tax Rate (% profit)' },
    { id: 'IC.EXP.DURS', name: 'Time to Export (days)' },
    { id: 'IC.IMP.DURS', name: 'Time to Import (days)' },
    // Technology
    { id: 'IT.NET.USER.ZS', name: 'Internet Users (%)' },
    { id: 'IT.CEL.SETS.P2', name: 'Mobile Subscriptions per 100' },
    { id: 'GB.XPD.RSDV.GD.ZS', name: 'R&D Spending (% GDP)' },
    { id: 'IP.PAT.RESD', name: 'Patent Applications (residents)' },
    // Finance & investment
    { id: 'BX.KLT.DINV.WD.GD.ZS', name: 'FDI Inflows (% GDP)' },
    { id: 'CM.MKT.LCAP.GD.ZS', name: 'Market Cap (% GDP)' },
    { id: 'FS.AST.PRVT.GD.ZS', name: 'Domestic Credit to Private Sector (% GDP)' },
    { id: 'FR.INR.LEND', name: 'Lending Interest Rate (%)' },
    { id: 'FR.INR.RINR', name: 'Real Interest Rate (%)' },
    // Infrastructure
    { id: 'EG.USE.ELEC.KH.PC', name: 'Electric Power Consumption per capita' },
    { id: 'IS.AIR.PSGR', name: 'Air Transport Passengers' },
    { id: 'IS.SHP.GOOD.TU', name: 'Container Port Traffic (TEU)' },
    // Social
    { id: 'SL.UEM.TOTL.ZS', name: 'Unemployment Rate (%)' },
    { id: 'SL.UEM.1524.ZS', name: 'Youth Unemployment (%)' },
    { id: 'SL.EMP.SELF.ZS', name: 'Self-Employment Rate (%)' },
    { id: 'SL.TLF.CACT.FE.ZS', name: 'Female Labor Force Participation (%)' },
    { id: 'SE.ADT.LITR.ZS', name: 'Adult Literacy Rate (%)' },
    { id: 'SE.TER.ENRR', name: 'Tertiary Education Enrollment (%)' },
    { id: 'SP.URB.TOTL.IN.ZS', name: 'Urban Population (%)' },
  ];

  let total = 0;
  const allData: { indicator: string; country: string; countryCode: string; value: number; year: number; source: string }[] = [];

  for (const ind of indicators) {
    const url = `https://api.worldbank.org/v2/country/all/indicator/${ind.id}?format=json&per_page=500&date=2018:2025&source=2`;
    const res = await fetchWithRetry(url);
    if (!res) continue;

    try {
      const data = await res.json();
      if (Array.isArray(data) && data[1]) {
        let count = 0;
        for (const entry of data[1]) {
          if (entry.value !== null && entry.country?.value) {
            allData.push({
              indicator: ind.name,
              country: entry.country.value,
              countryCode: entry.countryiso3code || '',
              value: entry.value,
              year: parseInt(entry.date),
              source: 'World Bank',
            });
            count++;
          }
        }
        console.log(`  ${ind.name}: ${count} entries`);
        total += count;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }

  if (allData.length > 0) saveJSON('bulk-worldbank-expanded.json', allData);
  return total;
}

// ============ BLS DETAILED ============
// Occupational employment, wages by state/industry

async function downloadBLSDetailed(): Promise<number> {
  console.log('\n=== BLS Detailed ===');

  // BLS public data API (no key needed for series)
  const series = [
    // CES - Employment by industry
    { id: 'CES0000000001', name: 'Total Nonfarm Employment' },
    { id: 'CES1000000001', name: 'Mining Employment' },
    { id: 'CES2000000001', name: 'Construction Employment' },
    { id: 'CES3000000001', name: 'Manufacturing Employment' },
    { id: 'CES4000000001', name: 'Trade Transport Utilities Employment' },
    { id: 'CES5000000001', name: 'Information Employment' },
    { id: 'CES5500000001', name: 'Financial Activities Employment' },
    { id: 'CES6000000001', name: 'Professional Business Services Employment' },
    { id: 'CES6500000001', name: 'Education Health Services Employment' },
    { id: 'CES7000000001', name: 'Leisure Hospitality Employment' },
    // CPI
    { id: 'CUUR0000SA0', name: 'CPI All Items' },
    { id: 'CUUR0000SAF1', name: 'CPI Food' },
    { id: 'CUUR0000SAH1', name: 'CPI Housing' },
    { id: 'CUUR0000SAM', name: 'CPI Medical' },
    { id: 'CUUR0000SAE', name: 'CPI Education Communication' },
    // Average hourly earnings by industry
    { id: 'CES0500000003', name: 'Avg Hourly Earnings Total Private' },
    { id: 'CES5000000003', name: 'Avg Hourly Earnings Information' },
    { id: 'CES5500000003', name: 'Avg Hourly Earnings Financial' },
    { id: 'CES6000000003', name: 'Avg Hourly Earnings Professional' },
    { id: 'CES7000000003', name: 'Avg Hourly Earnings Leisure Hospitality' },
  ];

  const allData: { series: string; seriesName: string; date: string; value: number; source: string }[] = [];

  // BLS API v2 (no registration needed for public data)
  for (let i = 0; i < series.length; i += 5) {
    const batch = series.slice(i, i + 5);
    const url = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesid: batch.map(s => s.id),
          startyear: '2020',
          endyear: '2025',
        }),
        signal: AbortSignal.timeout(30000),
      });

      const data = await res.json();
      if (data.Results?.series) {
        for (let j = 0; j < data.Results.series.length; j++) {
          const s = data.Results.series[j];
          const seriesInfo = batch[j];
          for (const obs of s.data || []) {
            allData.push({
              series: seriesInfo.id,
              seriesName: seriesInfo.name,
              date: `${obs.year}-${obs.period.replace('M', '')}`,
              value: parseFloat(obs.value),
              source: 'BLS',
            });
          }
          console.log(`  ${seriesInfo.name}: ${s.data?.length || 0} entries`);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  BLS batch error: ${msg.substring(0, 100)}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (allData.length > 0) saveJSON('bulk-bls-detailed.json', allData);
  return allData.length;
}

// ============ EUROSTAT BULK ============

async function downloadEurostatBulk(): Promise<number> {
  console.log('\n=== Eurostat Bulk ===');

  const datasets = [
    { code: 'nama_10_gdp', name: 'GDP by country', params: 'unit=CLV10_MEUR&na_item=B1GQ' },
    { code: 'une_rt_m', name: 'Unemployment monthly', params: 'sex=T&age=TOTAL&s_adj=SA&unit=PC_ACT' },
    { code: 'prc_hicp_manr', name: 'Inflation rate monthly', params: 'coicop=CP00&unit=RCH_A' },
    { code: 'tin00172', name: 'Business birth rate', params: '' },
    { code: 'isoc_ci_ifp_iu', name: 'Internet usage by individuals', params: 'unit=PC_IND&indic_is=I_IUSE' },
    { code: 'earn_ses18_01', name: 'Earnings by sector', params: '' },
    { code: 'sbs_r_nuts06_r2', name: 'Business demography regional', params: '' },
    { code: 'htec_kia_emp2', name: 'Employment in tech/knowledge', params: '' },
  ];

  let total = 0;
  const allData: { dataset: string; indicator: string; country: string; value: number; year: number; source: string }[] = [];

  for (const ds of datasets) {
    const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${ds.code}?format=JSON&lang=en&${ds.params}`;
    const res = await fetchWithRetry(url);
    if (!res) {
      console.log(`  ${ds.name}: FAILED`);
      continue;
    }

    try {
      const data = await res.json();
      if (!data.dimension || !data.value) {
        console.log(`  ${ds.name}: no data in response`);
        continue;
      }

      // Parse Eurostat JSON format
      const geoIdx = data.dimension.geo?.category?.index || {};
      const timeIdx = data.dimension.time?.category?.index || {};
      const geoLabels = data.dimension.geo?.category?.label || {};
      const values = data.value || {};

      const geoKeys = Object.keys(geoIdx);
      const timeKeys = Object.keys(timeIdx);
      const timeSize = timeKeys.length;

      let count = 0;
      for (const geo of geoKeys) {
        for (const time of timeKeys) {
          const year = parseInt(time.substring(0, 4));
          if (year < 2020) continue;

          const flatIdx = geoIdx[geo] * timeSize + timeIdx[time];
          const val = values[flatIdx];
          if (val != null) {
            allData.push({
              dataset: ds.code,
              indicator: ds.name,
              country: geoLabels[geo] || geo,
              value: val,
              year,
              source: 'Eurostat',
            });
            count++;
          }
        }
      }
      console.log(`  ${ds.name}: ${count} entries`);
      total += count;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ${ds.name}: parse error — ${msg.substring(0, 100)}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (allData.length > 0) saveJSON('bulk-eurostat.json', allData);
  return total;
}

// ============ UN DATA ============

async function downloadUNData(): Promise<number> {
  console.log('\n=== UN Data ===');

  // UN Data API — SDG indicators
  const indicators = [
    { code: 'SI_POV_DAY1', name: 'Poverty rate ($2.15/day)' },
    { code: 'SL_TLF_UEM', name: 'Unemployment rate' },
    { code: 'SE_ADT_EDUCTRN', name: 'Adult education participation' },
    { code: 'SH_STA_MORT', name: 'Under-5 mortality rate' },
    { code: 'EN_ATM_CO2', name: 'CO2 emissions per capita' },
    { code: 'IT_NET_BBN', name: 'Fixed broadband subscriptions' },
    { code: 'SL_EMP_EARN', name: 'Average hourly earnings' },
    { code: 'SG_GEN_PARL', name: 'Women in parliament (%)' },
    { code: 'VC_IHR_PSRC', name: 'Intentional homicides per 100K' },
    { code: 'SI_COV_SOCINS', name: 'Social insurance coverage (%)' },
  ];

  let total = 0;
  const allData: { indicator: string; country: string; value: number; year: number; source: string }[] = [];

  for (const ind of indicators) {
    // UN Stats API
    const url = `https://unstats.un.org/sdgapi/v1/sdg/Indicator/${ind.code}/GeoAreas`;
    const res = await fetchWithRetry(url);
    if (!res) {
      // Try alternative: World Bank for same concept
      console.log(`  ${ind.name}: UN API failed, skipping`);
      continue;
    }

    try {
      const data = await res.json();
      if (Array.isArray(data)) {
        // This endpoint returns geo areas, we need the data endpoint
        const dataUrl = `https://unstats.un.org/sdgapi/v1/sdg/Indicator/${ind.code}/Data?pageSize=500`;
        const dataRes = await fetchWithRetry(dataUrl);
        if (dataRes) {
          const dataJson = await dataRes.json();
          const records = dataJson.data || dataJson;
          if (Array.isArray(records)) {
            let count = 0;
            for (const r of records) {
              const year = parseInt(r.timePeriodStart || r.year || '0');
              if (year >= 2018 && r.value != null) {
                allData.push({
                  indicator: ind.name,
                  country: r.geoAreaName || r.country || '',
                  value: parseFloat(r.value),
                  year,
                  source: 'UN SDG',
                });
                count++;
              }
            }
            console.log(`  ${ind.name}: ${count} entries`);
            total += count;
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ${ind.name}: error — ${msg.substring(0, 100)}`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (allData.length > 0) saveJSON('bulk-un-sdg.json', allData);
  return total;
}

// ============ REST COUNTRIES (enrichment) ============

async function downloadCountryData(): Promise<number> {
  console.log('\n=== REST Countries ===');

  const res = await fetchWithRetry('https://restcountries.com/v3.1/all?fields=name,capital,region,subregion,population,area,languages,currencies,timezones,gini,car');
  if (!res) return 0;

  const countries = await res.json();
  const data = countries.map((c: Record<string, unknown>) => ({
    name: (c.name as Record<string, string>)?.common || '',
    capital: (c.capital as string[])?.[0] || '',
    region: c.region || '',
    subregion: c.subregion || '',
    population: c.population || 0,
    area: c.area || 0,
    languages: Object.values((c.languages as Record<string, string>) || {}).join(', '),
    currencies: Object.keys((c.currencies as Record<string, unknown>) || {}).join(', '),
    timezones: (c.timezones as string[])?.join(', ') || '',
    gini: c.gini ? Object.values(c.gini as Record<string, number>)[0] : null,
    drivesSide: (c.car as Record<string, string>)?.side || '',
    source: 'REST Countries',
  }));

  saveJSON('bulk-countries-enriched.json', data);
  console.log(`  ${data.length} countries with full profiles`);
  return data.length;
}

// ============ OECD (via World Bank proxy) ============
// OECD SDMX API is complex, use World Bank OECD-sourced indicators instead

async function downloadOECDviaWorldBank(): Promise<number> {
  console.log('\n=== OECD (via World Bank) ===');

  // These World Bank indicators are sourced from OECD
  const indicators = [
    { id: 'NY.GDP.MKTP.KD.ZG', name: 'GDP Growth (%)' },
    { id: 'NY.GDP.PCAP.PP.CD', name: 'GDP per capita PPP' },
    { id: 'NE.GDI.TOTL.ZS', name: 'Gross Capital Formation (% GDP)' },
    { id: 'NE.TRD.GNFS.ZS', name: 'Trade (% GDP)' },
    { id: 'GC.TAX.TOTL.GD.ZS', name: 'Tax Revenue (% GDP)' },
    { id: 'GC.DOD.TOTL.GD.ZS', name: 'Government Debt (% GDP)' },
    { id: 'BN.CAB.XOKA.GD.ZS', name: 'Current Account Balance (% GDP)' },
    { id: 'FP.CPI.TOTL.ZG', name: 'Inflation CPI (%)' },
    { id: 'PA.NUS.FCRF', name: 'Exchange Rate (local per USD)' },
    { id: 'SL.UEM.TOTL.NE.ZS', name: 'Unemployment ILO (%)' },
    { id: 'SL.GDP.PCAP.EM.KD', name: 'GDP per person employed' },
    { id: 'NY.GNS.ICTR.ZS', name: 'Gross Savings (% GDP)' },
    { id: 'BM.GSR.ROYL.CD', name: 'IP Payments (royalties)' },
    { id: 'TM.TAX.MRCH.SM.AR.ZS', name: 'Tariff Rate Mean (%)' },
    { id: 'IC.BUS.NDNS.ZS', name: 'New Business Density' },
  ];

  // Focus on OECD + key emerging markets
  const countries = 'USA;GBR;DEU;FRA;JPN;KOR;CAN;AUS;ITA;ESP;NLD;CHE;SWE;NOR;DNK;FIN;BEL;AUT;IRL;PRT;NZL;ISR;CZE;POL;HUN;CHL;MEX;TUR;COL;IDN;IND;BRA;CHN;ZAF;THA;VNM;MYS;PHL;SGP;ARE';

  let total = 0;
  const allData: { indicator: string; country: string; countryCode: string; value: number; year: number; source: string }[] = [];

  for (const ind of indicators) {
    const url = `https://api.worldbank.org/v2/country/${countries}/indicator/${ind.id}?format=json&per_page=1000&date=2018:2025`;
    const res = await fetchWithRetry(url);
    if (!res) continue;

    try {
      const data = await res.json();
      if (Array.isArray(data) && data[1]) {
        let count = 0;
        for (const entry of data[1]) {
          if (entry.value !== null) {
            allData.push({
              indicator: ind.name,
              country: entry.country?.value || '',
              countryCode: entry.countryiso3code || '',
              value: entry.value,
              year: parseInt(entry.date),
              source: 'World Bank / OECD',
            });
            count++;
          }
        }
        console.log(`  ${ind.name}: ${count} entries`);
        total += count;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }

  if (allData.length > 0) saveJSON('bulk-oecd-proxy.json', allData);
  return total;
}

// ============ MAIN ============

async function main() {
  const startTime = Date.now();
  console.log('=== BULK DATA DOWNLOAD ===');
  console.log(`Time: ${new Date().toISOString()}`);

  let grandTotal = 0;

  const wb = await downloadWorldBankExpanded();
  grandTotal += wb;

  const bls = await downloadBLSDetailed();
  grandTotal += bls;

  const eu = await downloadEurostatBulk();
  grandTotal += eu;

  const un = await downloadUNData();
  grandTotal += un;

  const countries = await downloadCountryData();
  grandTotal += countries;

  const oecd = await downloadOECDviaWorldBank();
  grandTotal += oecd;

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log('\n=== BULK DOWNLOAD COMPLETE ===');
  console.log(`Duration: ${elapsed}s`);
  console.log(`Total new data points: ${grandTotal.toLocaleString()}`);
  console.log(`World Bank expanded: ${wb.toLocaleString()}`);
  console.log(`BLS detailed: ${bls.toLocaleString()}`);
  console.log(`Eurostat: ${eu.toLocaleString()}`);
  console.log(`UN SDG: ${un.toLocaleString()}`);
  console.log(`Countries: ${countries.toLocaleString()}`);
  console.log(`OECD proxy: ${oecd.toLocaleString()}`);
  console.log('\nNext: run npm run index-data to embed into RAG');
}

main().catch(console.error);
