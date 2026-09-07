/* ============================================================
   /api/quiz/admin — GET listet ALLE Quiz-Ergebnisse (alle Stufen,
   nicht nur Top 10), DELETE entfernt einen einzelnen Eintrag.
   Genau wie die Analytics-Admin-Endpoints: nur mit gueltiger
   Session (rx_admin_session-Cookie aus /admin/login/) nutzbar,
   siehe _lib/auth.js.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { verifySessionToken, getSessionTokenFromHeaders } = require('./_lib/auth');
const { listAllResults, deleteResult, LEVELS } = require('./_lib/quiz-store');

function json(statusCode, body){
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

function isAuthed(event){
  var sessionSecret = process.env.RENDITEX_SESSION_SECRET;
  var token = getSessionTokenFromHeaders(event.headers);
  return !!(sessionSecret && verifySessionToken(token, sessionSecret));
}

exports.handler = async function(event){
  connectLambda(event);

  if(!isAuthed(event)){
    return json(401, { ok: false, error: 'unauthorized' });
  }

  if(event.httpMethod === 'GET'){
    try{
      var all = await listAllResults();
      all.sort(function(a, b){ return new Date(b.submittedAt) - new Date(a.submittedAt); });
      return json(200, { ok: true, results: all });
    }catch(e){
      console.error('quiz-admin GET error:', e);
      return json(500, { ok: false, error: 'internal_error' });
    }
  }

  if(event.httpMethod === 'DELETE'){
    var payload;
    try{ payload = JSON.parse(event.body || '{}'); }catch(e){ return json(400, { ok: false, error: 'bad_request' }); }
    if(LEVELS.indexOf(payload.level) === -1 || !payload.id){
      return json(400, { ok: false, error: 'bad_request' });
    }
    try{
      await deleteResult(payload.level, payload.id);
      return json(200, { ok: true });
    }catch(e){
      console.error('quiz-admin DELETE error:', e);
      return json(500, { ok: false, error: 'internal_error' });
    }
  }

  return json(405, { ok: false, error: 'method_not_allowed' });
};
