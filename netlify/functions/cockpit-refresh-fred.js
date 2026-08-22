/* ============================================================
   Scheduled Function — aktualisiert die fuenf FRED-basierten
   Bloecke des Markt-Cockpits (Wachstum, Inflation, Liquiditaet,
   Zinsen, Kredit, Finanzmarktstress). Laeuft einmal taeglich (siehe
   netlify.toml) — FRED-Reihen aktualisieren sich nie haeufiger.
   Getrennte Function von cockpit-refresh.js (Krypto/CoinGecko),
   damit ein Ausfall einer Quelle nicht die andere mitreisst.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { fetchSeriesWithPercentile } = require('./_lib/cockpit/fred');
const { BLOCKS } = require('./_lib/cockpit/fred-indicators');
const norm = require('./_lib/cockpit/normalize');
const { computeBlockScore, verdictForScore } = require('./_lib/cockpit/aggregate');
const { writeComputedBlock } = require('./_lib/cockpit/store');

async function computeOneBlock(blockId, defs){
  var results = await Promise.all(defs.map(function(def){
    return fetchSeriesWithPercentile(def.seriesId, def.transform)
      .then(function(res){ return { def: def, res: res, error: null }; })
      .catch(function(e){ return { def: def, res: null, error: e.message }; });
  }));

  var indicators = results.map(function(r){
    var score = r.res ? norm.fromPercentile(r.res.percentile, !!r.def.invert) : null;
    return {
      id: r.def.id, label: r.def.label, grade: r.def.grade, score: score,
      display: r.res ? r.res.latestValue : null,
      latestDate: r.res ? r.res.latestDate : null,
      percentile: r.res ? r.res.percentile : null,
      error: r.error
    };
  });

  var agg = computeBlockScore(indicators);
  var verdict = verdictForScore(agg.score);
  var errors = indicators.filter(function(i){ return i.error; }).map(function(i){ return i.id + ': ' + i.error; });

  await writeComputedBlock(blockId, {
    score: agg.score,
    verdictBucket: verdict.bucket,
    verdictLabel: verdict.label,
    drivers: agg.drivers.map(function(d){
      var src = indicators.find(function(i){ return i.id === d.id; });
      return Object.assign({}, d, { rawValue: src.display, rawDate: src.latestDate, percentile: src.percentile });
    }),
    context: { indicatorCount: defs.length, errorCount: errors.length },
    errors: errors
  });

  return { blockId: blockId, score: agg.score, errorCount: errors.length };
}

exports.handler = async function(event){
  connectLambda(event);

  var blockIds = Object.keys(BLOCKS);
  var summary = [];
  for(var i = 0; i < blockIds.length; i++){
    try{
      summary.push(await computeOneBlock(blockIds[i], BLOCKS[blockIds[i]]));
    }catch(e){
      summary.push({ blockId: blockIds[i], error: e.message });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, blocks: summary })
  };
};
