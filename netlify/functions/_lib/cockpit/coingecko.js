/* ============================================================
   RenditeX Markt-Cockpit — CoinGecko-Anbindung (Krypto-Marktstruktur).
   Nutzt bewusst nur Endpoints der kostenlosen Public API, ohne
   API-Key: /coins/markets (Top 100 inkl. 30d/200d-Preisänderung in
   EINEM Call), /global (Dominance/Gesamt-Marktkap) und
   /coins/bitcoin/market_chart (365 Tage taeglich, fuer die echte
   200-Tage-Linie von BTC). Siehe ANALYTICS.md-Schwesterdokument
   COCKPIT.md fuer die Begruendung der 30d/200d-Wahl statt 50d/90d
   (CoinGecko liefert diese Fenster nicht einzeln, Nachbau ueber 100
   Einzelabrufe waere teuer und langsam).
   ============================================================ */
const BASE = 'https://api.coingecko.com/api/v3';

function apiKeyHeader(){
  var key = process.env.COINGECKO_API_KEY;
  return key ? { 'x-cg-demo-api-key': key } : {};
}

async function cgFetch(path){
  var r = await fetch(BASE + path, { headers: apiKeyHeader() });
  if(!r.ok) throw new Error('CoinGecko ' + path + ' -> ' + r.status);
  return r.json();
}

/* Top 100 nach Marktkapitalisierung, inkl. 30-Tage- und 200-Tage-
   Preisaenderung in Prozent, in einem einzigen Request. */
async function fetchTop100Markets(){
  return cgFetch(
    '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1' +
    '&price_change_percentage=30d,200d&sparkline=false'
  );
}

async function fetchGlobal(){
  var j = await cgFetch('/global');
  return j.data;
}

/* Taegliche Schlusskurse fuer BTC, fuer die echte 200-Tage-Linie
   (kein Naeherungswert wie bei der Top-100-Marktbreite oben —
   hier reicht EIN Coin, ein voller historischer Verlauf ist
   guenstig genug). */
async function fetchBtcDailyHistory(days){
  var j = await cgFetch('/coins/bitcoin/market_chart?vs_currency=usd&days=' + (days || 365) + '&interval=daily');
  return j.prices.map(function(p){ return { t: p[0], price: p[1] }; });
}

/* Fear & Greed kommt nicht von CoinGecko, aber gehoert fachlich zum
   selben Krypto-Marktstruktur-Block und wird hier mit abgeholt,
   damit cockpit-refresh nur eine Quelle fuer den ganzen Block hat. */
async function fetchFearGreed(){
  var r = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
  if(!r.ok) throw new Error('alternative.me -> ' + r.status);
  var j = await r.json();
  return parseInt(j.data[0].value, 10);
}

module.exports = { fetchTop100Markets, fetchGlobal, fetchBtcDailyHistory, fetchFearGreed };
