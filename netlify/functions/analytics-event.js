/* ============================================================
   POST /api/analytics/event — oeffentlicher Tracking-Endpoint.
   Bewusst so restriktiv wie moeglich: nur zwei Event-Typen, nur
   Ziele aus der Whitelist, keine beliebigen Felder werden
   uebernommen. Antwort ist immer minimal (204, kein Body) — hier
   werden nie Statistiken oder gespeicherte Daten zurueckgegeben.
   Ein Fehler hier darf dem Besucher nie auffallen: der Client ruft
   das per sendBeacon/fetch(keepalive) fire-and-forget auf und
   ignoriert jede Antwort.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { writeEvent } = require('./_lib/store');
const { isValidPageView, isValidLinkClick, categoryOf } = require('./_lib/whitelist');
const { classifyReferrer, classifyDevice } = require('./_lib/classify');

const NO_CONTENT = { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };

exports.handler = async function(event){
  connectLambda(event);

  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  var payload;
  try{
    payload = JSON.parse(event.body || '{}');
  }catch(e){
    return { statusCode: 400, body: 'Bad Request' };
  }

  var type = payload && payload.event;
  var target = payload && payload.target;

  if(type !== 'page_view' && type !== 'link_click'){
    return { statusCode: 400, body: 'Bad Request' };
  }
  if(type === 'page_view' && !isValidPageView(target)){
    return { statusCode: 400, body: 'Bad Request' };
  }
  if(type === 'link_click' && !isValidLinkClick(target)){
    return { statusCode: 400, body: 'Bad Request' };
  }

  var headers = event.headers || {};
  var host = headers.host || headers.Host || '';
  var record = {
    t: type,
    target: target,
    cat: type === 'link_click' ? categoryOf(target) : null,
    ref: type === 'page_view' ? classifyReferrer(headers.referer || headers.Referer, host) : null,
    dev: classifyDevice(headers['user-agent'] || headers['User-Agent'])
  };

  try{
    await writeEvent(record);
  }catch(e){
    // Speicherfehler duerfen dem Besucher nie sichtbar werden — die
    // eigentliche Navigation ist laengst unabhaengig davon passiert.
    return NO_CONTENT;
  }

  return NO_CONTENT;
};
