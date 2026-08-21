/* ============================================================
   GET /api/analytics/stats?range=today|7d|30d|all — authentifizierter
   Admin-Endpoint. Liefert OHNE gueltige Session-Cookie NIEMALS
   Daten zurueck (401), unabhaengig davon, ob die Dashboard-Seite
   selbst aufgerufen wurde oder der Endpoint direkt. Das ist die
   eigentliche Absicherung — nicht der unbekannte Pfad, siehe
   ANALYTICS.md.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { verifySessionToken, getSessionTokenFromHeaders } = require('./_lib/auth');
const { loadEvents } = require('./_lib/store');
const { computeSummary, computeSeries } = require('./_lib/aggregate');

var VALID_RANGES = ['today', '7d', '30d', 'all'];

function json(statusCode, body){
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

exports.handler = async function(event){
  connectLambda(event);

  if(event.httpMethod !== 'GET'){
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  var sessionSecret = process.env.RENDITEX_SESSION_SECRET;
  var token = getSessionTokenFromHeaders(event.headers);
  if(!sessionSecret || !verifySessionToken(token, sessionSecret)){
    return json(401, { ok: false, error: 'unauthorized' });
  }

  var range = (event.queryStringParameters && event.queryStringParameters.range) || '30d';
  if(VALID_RANGES.indexOf(range) === -1) range = '30d';

  try{
    var rangeEvents = await loadEvents(range);
    var summary = computeSummary(rangeEvents);
    var seriesEvents = range === '30d' ? rangeEvents : await loadEvents('30d');
    var series = computeSeries(seriesEvents);

    return json(200, Object.assign({ ok: true, range: range, series: series }, summary));
  }catch(e){
    console.error('analytics-stats error:', e);
    return json(500, { ok: false, error: 'internal_error' });
  }
};
