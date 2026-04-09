import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '../data/cultural/worldbank-v2');
const OUTPUT_FILE = join(OUTPUT_DIR, 'core6-extra.json');

const COUNTRIES = ['ID', 'IT', 'SG', 'MY', 'AU', 'US'];
const COUNTRY_CODES_PARAM = COUNTRIES.join(';');

const INDICATORS = [
  // Poverty
  'SI.POV.NAHC', 'SI.POV.DDAY', 'SI.SPR.PCAP.ZG', 'SI.POV.GAPS',
  // Remittances
  'BX.TRF.PWKR.CD.DT', 'BX.TRF.PWKR.DT.GD.ZS',
  // Digital
  'IT.NET.SECR.P6', 'IT.MLT.MAIN.P2', 'IE.ICT.TOTL.GD.ZS',
  // Entrepreneurship
  'IC.FRM.DURS', 'IC.FRM.CORR.ZS', 'IC.PRP.DURS', 'IC.EXP.DURS', 'IC.IMP.DURS',
  // Governance (World Governance Indicators)
  'GE.EST', 'RQ.EST', 'RL.EST', 'VA.EST', 'CC.EST', 'PV.EST',
  // Military
  'MS.MIL.XPND.GD.ZS', 'MS.MIL.TOTL.P1',
  // Energy
  'EG.USE.ELEC.KH.PC', 'EG.FEC.RNEW.ZS', 'EG.EGY.PRIM.PP.KD',
  // Water
  'SH.H2O.SMDW.ZS', 'SH.STA.SMSS.ZS',
  // Nutrition
  'SN.ITK.DEFC.ZS', 'SH.STA.STNT.ZS', 'SH.STA.WAST.ZS',
  // Transport
  'IS.VEH.NVEH.P3', 'IS.VEH.PCAR.P3',
  // Urban
  'SP.URB.GROW', 'EN.URB.LCTY.UR.ZS',
  // Emissions
  'EN.ATM.GHGT.KT.CE', 'EN.ATM.METH.KT.CE', 'EN.ATM.NOXE.KT.CE',
  // Debt
  'DT.DOD.DECT.CD', 'DT.DOD.DLXF.CD', 'DT.TDS.DECT.EX.ZS',
  // Research
  'GB.XPD.RSDV.GD.ZS', 'SP.POP.SCIE.RD.P6',
  // Tax
  'GC.TAX.TOTL.GD.ZS', 'GC.REV.XGRT.GD.ZS', 'GC.XPN.TOTL.GD.ZS',
  // Social protection
  'per.si.allsi.cov.pop.tot', 'HD.HCI.OVRL',
  // Migration
  'SM.POP.NETM', 'SM.POP.REFG', 'SM.POP.REFG.OR',
  // Children
  'SH.DYN.MORT', 'SP.ADO.TFRT', 'SH.IMM.MEAS',
  // Financial inclusion
  'FX.OWN.TOTL.FE.ZS', 'FX.OWN.TOTL.MA.ZS', 'FX.OWN.TOTL.YG.ZS', 'FX.OWN.TOTL.OL.ZS',
  // Logistics
  'LP.LPI.OVRL.XQ', 'LP.LPI.INFR.XQ', 'LP.LPI.LOGS.XQ', 'LP.LPI.TRDL.XQ',
  // Property
  'IC.PRP.PROC',
  // Insurance
  'IC.FRM.THEV.ZS',
  // Agriculture detail
  'AG.PRD.CREL.MT', 'AG.PRD.FOOD.XD', 'AG.CON.FERT.ZS',
  // Tourism detail
  'ST.INT.TVLR.CD', 'ST.INT.TVLX.CD',
  // Telecom
  'IT.TEL.INVS.CN',
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
