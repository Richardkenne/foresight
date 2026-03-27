const https = require('https');

let cache = { data: null, ts: 0 };

function fetchJSON(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Simulator/1.0' } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { resolve(null); } });
    }).on('error', () => resolve(null));
  });
}

module.exports = async function handler(req, res) {
  if (cache.data && Date.now() - cache.ts < 3600000) return res.status(200).json(cache.data);

  const r = {};
  const gdp = await fetchJSON('https://api.worldbank.org/v2/country/US;ID;AU;GB;DE;JP;BR;IN;CN/indicator/NY.GDP.PCAP.CD?format=json&date=2023&per_page=20');
  if (gdp?.[1]) { r.gdp_per_capita = {}; gdp[1].forEach(d => { if (d.value) r.gdp_per_capita[d.country.value] = Math.round(d.value); }); }

  r._fetched = new Date().toISOString();
  cache = { data: r, ts: Date.now() };
  res.status(200).json(r);
};
