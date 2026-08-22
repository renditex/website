/* ============================================================
   RenditeX Markt-Cockpit — Berechnungen fuer den Block
   Krypto-Marktstruktur. Reine Funktionen, keine Netzwerkaufrufe
   (die liegen in coingecko.js) und kein Blobs-Zugriff (liegt in
   store.js) — leicht einzeln testbar, siehe COCKPIT.md.
   ============================================================ */

/* Ausgeschlossen aus "Marktbreite"/"Altcoin Season": Stablecoins und
   1:1-Wrapped-Assets messen keine eigene Marktbewegung, wuerden die
   Breite/Season-Berechnung sonst kuenstlich verzerren (ein Stable-
   coin steht praktisch immer "neutral", kein Signal). Liste bewusst
   klein und explizit gepflegt statt eines Heuristik-Rateversuchs. */
var EXCLUDE_SYMBOLS = new Set([
  'usdt','usdc','dai','busd','tusd','usde','fdusd','usds','usdp','pyusd','frax',
  'wbtc','weth','wsteth','steth','wbeth','cbbtc','reth'
]);

function isEligible(coin){
  return coin && coin.symbol && !EXCLUDE_SYMBOLS.has(String(coin.symbol).toLowerCase());
}

/* Marktbreite Top 100 — genutzte Definition (bewusst abweichend vom
   klassischen "% ueber gleitendem 50-/200-Tage-Durchschnitt"):
   Anteil der Top-100-Coins (ohne Stablecoins/Wrapped-Assets) mit
   POSITIVER 30-Tage- bzw. 200-Tage-Preisveraenderung. CoinGecko
   liefert diese beiden Fenster direkt im /coins/markets-Response,
   ein echter SMA-Vergleich wuerde 100 Einzelabrufe pro Tag pro
   Coin brauchen. Siehe COCKPIT.md fuer die Begruendung. */
function computeMarketBreadth(markets){
  var eligible = markets.filter(isEligible);
  var n = eligible.length;
  if(!n) return null;
  var above30d = eligible.filter(function(c){ return (c.price_change_percentage_30d_in_currency || 0) > 0; }).length;
  var above200d = eligible.filter(function(c){ return (c.price_change_percentage_200d_in_currency || 0) > 0; }).length;
  return {
    window: '30d/200d-Preisaenderung (nicht 50d/200d-SMA)',
    coinCount: n,
    sharePositive30d: above30d / n,
    sharePositive200d: above200d / n
  };
}

/* Altcoin Season Index — genutzte Definition (bewusst abweichend von
   der bei blockchaincenter.net verbreiteten 90-Tage-Definition):
   Anteil der Top-50-Coins (ohne BTC, ohne Stablecoins/Wrapped), die
   BTC ueber 30 Tage outperformt haben. 30 statt 90 Tage aus demselben
   Grund wie bei der Marktbreite — CoinGecko liefert dieses Fenster
   direkt, ohne zusaetzliche Einzelabrufe. */
function computeAltcoinSeason(markets){
  var btc = markets.find(function(c){ return c.id === 'bitcoin'; });
  if(!btc || btc.price_change_percentage_30d_in_currency == null) return null;
  var btcChange = btc.price_change_percentage_30d_in_currency;
  var top50 = markets
    .filter(function(c){ return c.id !== 'bitcoin' && isEligible(c); })
    .slice(0, 50);
  if(!top50.length) return null;
  var outperforming = top50.filter(function(c){
    return (c.price_change_percentage_30d_in_currency || -Infinity) > btcChange;
  }).length;
  return {
    window: '30 Tage (nicht 90 Tage)',
    btcChange30d: btcChange,
    coinCount: top50.length,
    shareOutperforming: outperforming / top50.length
  };
}

/* Echter 200-Tage-SMA fuer BTC (kein Naeherungswert — ein Coin,
   voller taeglicher Verlauf ist guenstig). Erwartet mind. 200
   taegliche Datenpunkte in history (aeltestes zuerst). */
function computeBtc200dma(history){
  if(!history || history.length < 200) return null;
  var last200 = history.slice(-200);
  var sum = last200.reduce(function(acc, p){ return acc + p.price; }, 0);
  var ma = sum / 200;
  var current = history[history.length - 1].price;
  return {
    ma200: ma,
    currentPrice: current,
    distancePct: (current - ma) / ma
  };
}

/* Dominance-/Market-Cap-Trend braucht eigene Historie, die CoinGecko
   im Free-Tier fuer /global nicht herausgibt — deshalb ausschliesslich
   aus unseren eigenen taeglichen Snapshots (siehe store.js) berechnet.
   Liefert bewusst null statt eines erfundenen Trends, solange nicht
   genug eigene Historie vorliegt. */
function computeTrendFromSnapshots(snapshots, field, minDays){
  minDays = minDays || 7;
  if(!snapshots || snapshots.length < minDays) return null;
  var sorted = snapshots.slice().sort(function(a, b){ return a.date < b.date ? -1 : 1; });
  var first = sorted[0][field];
  var last = sorted[sorted.length - 1][field];
  if(first == null || last == null) return null;
  return { from: first, to: last, deltaPct: (last - first) / first, days: sorted.length };
}

module.exports = {
  computeMarketBreadth,
  computeAltcoinSeason,
  computeBtc200dma,
  computeTrendFromSnapshots,
  EXCLUDE_SYMBOLS
};
