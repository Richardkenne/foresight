import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/worldbank-v2');
const OUTPUT_FILE = join(OUTPUT_DIR, 'core6-all.json');

const COUNTRIES = ['ID', 'IT', 'SG', 'MY', 'AU', 'US'];
const COUNTRY_CODES_PARAM = COUNTRIES.join(';');

const INDICATORS = [
  // Economy
  'NY.GDP.MKTP.CD', 'NY.GDP.PCAP.CD', 'NY.GDP.MKTP.KD.ZG', 'FP.CPI.TOTL.ZG',
  'NE.GDI.TOTL.ZS', 'BX.KLT.DINV.CD.WD', 'NE.EXP.GNFS.ZS', 'NE.IMP.GNFS.ZS',
  'GC.DOD.TOTL.GD.ZS', 'FM.LBL.BMNY.GD.ZS',
  // Population
  'SP.POP.TOTL', 'SP.POP.GROW', 'SP.URB.TOTL.IN.ZS', 'SP.DYN.LE00.IN',
  'SP.DYN.TFRT.IN', 'SP.DYN.CDRT.IN', 'SP.DYN.IMRT.IN', 'SP.POP.65UP.TO.ZS',
  'SP.POP.0014.TO.ZS',
  // Education
  'SE.XPD.TOTL.GD.ZS', 'SE.PRM.CMPT.ZS', 'SE.SEC.ENRR', 'SE.TER.ENRR',
  'SE.ADT.LITR.ZS', 'SE.PRM.TENR', 'SE.SEC.CMPT.LO.ZS',
  // Health
  'SH.XPD.CHEX.GD.ZS', 'SH.MED.BEDS.ZS', 'SH.MED.PHYS.ZS', 'SH.STA.MMRT',
  'SH.DYN.NCOM.ZS', 'SH.PRV.SMOK', 'SH.STA.OBSE.MA.ZS',
  // Labor
  'SL.UEM.TOTL.ZS', 'SL.UEM.1524.ZS', 'SL.TLF.CACT.ZS', 'SL.TLF.CACT.FE.ZS',
  'SL.EMP.VULN.ZS', 'SL.AGR.EMPL.ZS', 'SL.IND.EMPL.ZS', 'SL.SRV.EMPL.ZS',
  // Business
  'IC.BUS.EASE.XQ', 'IC.REG.DURS', 'IC.TAX.TOTL.CP.ZS', 'NV.SRV.TOTL.ZS',
  'NV.IND.TOTL.ZS',
  // Technology
  'IT.NET.USER.ZS', 'IT.CEL.SETS.P2', 'IT.NET.BBND.P2', 'GB.XPD.RSDV.GD.ZS',
  'IP.PAT.RESD', 'TX.VAL.TECH.MF.ZS',
  // Finance
  'FM.AST.DOMS.GD.ZS', 'FS.AST.PRVT.GD.ZS', 'FB.CBK.BRCH.P5', 'SI.POV.GINI',
  'SI.DST.FRST.10', 'SI.DST.10TH.10',
  // Environment
  'EN.ATM.CO2E.PC', 'EG.USE.PCAP.KG.OE', 'EG.ELC.RNEW.ZS', 'ER.PTD.TOTL.ZS',
  'AG.LND.FRST.ZS',
  // Infrastructure
  'IS.AIR.PSGR', 'EG.ELC.ACCS.ZS', 'SH.H2O.BASW.ZS', 'SH.STA.BASS.ZS',
  // Trade
  'NE.TRD.GNFS.ZS', 'TG.VAL.TOTL.GD.ZS',
  // Tourism
  'ST.INT.ARVL', 'ST.INT.RCPT.CD', 'ST.INT.DPRT', 'ST.INT.XPND.CD',
  // Gender
  'SG.GEN.PARL.ZS', 'SE.ENR.PRIM.FM.ZS',
  // Agriculture
  'AG.LND.ARBL.ZS', 'AG.YLD.CREL.KG', 'NV.AGR.TOTL.ZS',
];

const COUNTRY_NAMES = {
  ID: 'Indonesia',
  IT: 'Italy',
  SG: 'Singapore',
  MY: 'Malaysia',
  AU: 'Australia',
  US: 'United States',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchIndicator(indicator) {
  const url = `https://api.worldbank.org/v2/country/${COUNTRY_CODES_PARAM}/indicator/${indicator}?format=json&per_page=1000&date=2015:2024`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${indicator}`);
  const json = await res.json();
  // json[0] = pagination metadata, json[1] = data array
  if (!Array.isArray(json) || json.length < 2 || !Array.isArray(json[1])) {
    return [];
  }
  return json[1];
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const allDataPoints = [];
  let totalFetched = 0;

  for (let i = 0; i < INDICATORS.length; i++) {
    const indicator = INDICATORS[i];
    try {
      const rows = await fetchIndicator(indicator);
      let dpCount = 0;

      for (const row of rows) {
        if (row.value === null || row.value === undefined) continue;

        const countryCode = row.country?.id;
        const countryName = COUNTRY_NAMES[countryCode] || row.country?.value || countryCode;
        const indicatorName = row.indicator?.value || indicator;
        const year = parseInt(row.date, 10);
        const value = typeof row.value === 'string' ? parseFloat(row.value) : row.value;

        if (isNaN(value)) continue;

        allDataPoints.push({
          context: `${countryName} ${indicatorName} in ${year} was ${value}`,
          country: countryName,
          countryCode,
          metric: indicatorName,
          indicator,
          value,
          year,
          source: 'World Bank',
        });
        dpCount++;
      }

      totalFetched += dpCount;
      console.log(`${i + 1}/${INDICATORS.length} ${indicator} — ${dpCount} dp`);
    } catch (err) {
      console.error(`ERROR ${i + 1}/${INDICATORS.length} ${indicator}: ${err.message}`);
    }

    if (i < INDICATORS.length - 1) {
      await sleep(300);
    }
  }

  const output = {
    source: 'World Bank',
    countries: COUNTRIES,
    fetchedAt: new Date().toISOString(),
    totalDataPoints: allDataPoints.length,
    dataPoints: allDataPoints,
  };

  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\nDone. Total data points: ${allDataPoints.length}`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
