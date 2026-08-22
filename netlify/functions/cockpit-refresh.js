/* ============================================================
   Scheduled Function — aktualisiert den Block Krypto-Marktstruktur
   des Markt-Cockpits. Laeuft alle 6 Stunden (siehe netlify.toml),
   holt frische Daten von CoinGecko/alternative.me, berechnet Score
   und Treiber und schreibt EIN fertiges Ergebnis nach Blobs, damit
   der oeffentliche Lese-Endpoint (cockpit-data.js) selbst nichts
   mehr abrufen oder rechnen muss. Erste Phase von Schritt 6 (siehe
   Datendossier) — nur der Krypto-Block, kein FRED noch angebunden.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const cg = require('./_lib/cockpit/coingecko');
const compute = require('./_lib/cockpit/compute');
const norm = require('./_lib/cockpit/normalize');
const { computeBlockScore, verdictForScore } = require('./_lib/cockpit/aggregate');
const store = require('./_lib/cockpit/store');

exports.handler = async function(event){
  connectLambda(event);

  var errors = [];
  var markets = null, global = null, btcHistory = null, fearGreed = null;

  try{ markets = await cg.fetchTop100Markets(); }catch(e){ errors.push('markets: ' + e.message); }
  try{ global = await cg.fetchGlobal(); }catch(e){ errors.push('global: ' + e.message); }
  try{ btcHistory = await cg.fetchBtcDailyHistory(365); }catch(e){ errors.push('btcHistory: ' + e.message); }
  try{ fearGreed = await cg.fetchFearGreed(); }catch(e){ errors.push('fearGreed: ' + e.message); }

  var btc = markets && markets.find(function(c){ return c.id === 'bitcoin'; });
  var eth = markets && markets.find(function(c){ return c.id === 'ethereum'; });

  /* Heutigen Snapshot schreiben — Grundlage fuer Dominance-/Market-
     Cap-/ETH-BTC-Trend, die CoinGecko im Free-Tier nicht historisch
     herausgibt (siehe compute.js). Nur schreiben, was tatsaechlich
     da ist. */
  if(global || btc){
    await store.writeTodaySnapshot({
      btcDominance: global ? global.market_cap_percentage.btc : null,
      totalMarketCapUsd: global ? global.total_market_cap.usd : null,
      ethBtc: (btc && eth) ? (eth.current_price / btc.current_price) : null,
      btcPriceUsd: btc ? btc.current_price : null,
      ethPriceUsd: eth ? eth.current_price : null
    }).catch(function(e){ errors.push('writeSnapshot: ' + e.message); });
  }

  var recentSnapshots = await store.loadRecentSnapshots(30).catch(function(){ return []; });

  var breadth = markets ? compute.computeMarketBreadth(markets) : null;
  var altSeason = markets ? compute.computeAltcoinSeason(markets) : null;
  var ma200 = btcHistory ? compute.computeBtc200dma(btcHistory) : null;
  var dominanceTrend = compute.computeTrendFromSnapshots(recentSnapshots, 'btcDominance');
  var mcapTrend = compute.computeTrendFromSnapshots(recentSnapshots, 'totalMarketCapUsd');
  var ethBtcTrend = compute.computeTrendFromSnapshots(recentSnapshots, 'ethBtc');

  var indicators = [
    {
      id: 'fear_greed', label: 'Fear & Greed Index', grade: 'A',
      score: fearGreed != null ? norm.fromIndex0to100(fearGreed) : null,
      display: fearGreed != null ? String(fearGreed) : null
    },
    {
      id: 'altcoin_season', label: 'Altcoin Season Index (30-Tage-Fenster)', grade: 'A',
      score: altSeason ? norm.fromShare(altSeason.shareOutperforming) : null,
      display: altSeason ? Math.round(altSeason.shareOutperforming * 100) + '%' : null
    },
    {
      id: 'market_breadth', label: 'Marktbreite Top 100 (200-Tage-Fenster)', grade: 'A',
      score: breadth ? norm.fromShare(breadth.sharePositive200d) : null,
      display: breadth ? Math.round(breadth.sharePositive200d * 100) + '%' : null
    },
    {
      id: 'btc_200dma', label: 'BTC vs. 200-Tage-Durchschnitt', grade: 'A',
      score: ma200 ? norm.fromDistancePct(ma200.distancePct) : null,
      display: ma200 ? (ma200.distancePct >= 0 ? '+' : '') + (ma200.distancePct * 100).toFixed(1) + '%' : null
    },
    {
      id: 'btc_dominance_trend', label: 'BTC-Dominance (Trend)', grade: 'A',
      score: dominanceTrend ? norm.fromDistancePct(dominanceTrend.deltaPct, 800) : null,
      display: dominanceTrend ? (dominanceTrend.deltaPct >= 0 ? '+' : '') + (dominanceTrend.deltaPct * 100).toFixed(2) + '%' : null
    },
    {
      id: 'total_mcap_trend', label: 'Gesamt-Marktkapitalisierung (Trend)', grade: 'B',
      score: mcapTrend ? norm.fromDistancePct(mcapTrend.deltaPct, 300) : null,
      display: mcapTrend ? (mcapTrend.deltaPct >= 0 ? '+' : '') + (mcapTrend.deltaPct * 100).toFixed(1) + '%' : null
    },
    {
      id: 'eth_btc_trend', label: 'ETH/BTC (Trend)', grade: 'B',
      score: ethBtcTrend ? norm.fromDistancePct(ethBtcTrend.deltaPct, 300) : null,
      display: ethBtcTrend ? (ethBtcTrend.deltaPct >= 0 ? '+' : '') + (ethBtcTrend.deltaPct * 100).toFixed(1) + '%' : null
    }
  ];

  var agg = computeBlockScore(indicators);
  var verdict = verdictForScore(agg.score);

  await store.writeComputedBlock('krypto-marktstruktur', {
    score: agg.score,
    verdictBucket: verdict.bucket,
    verdictLabel: verdict.label,
    drivers: agg.drivers,
    context: {
      btcPriceUsd: btc ? btc.current_price : null,
      ethPriceUsd: eth ? eth.current_price : null,
      btcDominance: global ? global.market_cap_percentage.btc : null,
      totalMarketCapUsd: global ? global.total_market_cap.usd : null,
      snapshotHistoryDays: recentSnapshots.length
    },
    errors: errors
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, score: agg.score, errors: errors })
  };
};
