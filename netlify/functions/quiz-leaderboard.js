/* ============================================================
   GET /api/quiz/leaderboard?level=... — oeffentliche Bestenliste,
   kein Login noetig (die Ergebnisse sind ja bewusst oeffentlich
   eingetragen worden). Sortiert nach Ergebnis (mehr richtige
   Antworten zuerst), bei Gleichstand nach Zeit (schneller zuerst).
   Liefert nur die Top 10, keine vollstaendige Historie.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { listResultsForLevel } = require('./_lib/quiz-store');

var VALID_LEVELS = ['anfaenger', 'mittel', 'schwer', 'extraschwer'];

function json(statusCode, body){
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
    body: JSON.stringify(body)
  };
}

exports.handler = async function(event){
  connectLambda(event);

  if(event.httpMethod !== 'GET'){
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  var level = event.queryStringParameters && event.queryStringParameters.level;
  if(VALID_LEVELS.indexOf(level) === -1){
    return json(400, { ok: false, error: 'invalid_level' });
  }

  try{
    var results = await listResultsForLevel(level);
    var top = results
      .sort(function(a, b){
        if(b.correct !== a.correct) return b.correct - a.correct;
        return a.timeMs - b.timeMs;
      })
      .slice(0, 10)
      .map(function(r){ return { name: r.name, correct: r.correct, total: r.total, timeMs: r.timeMs, submittedAt: r.submittedAt }; });

    return json(200, { ok: true, level: level, count: results.length, top: top });
  }catch(e){
    console.error('quiz-leaderboard error:', e);
    return json(500, { ok: false, error: 'internal_error' });
  }
};
