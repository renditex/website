/* ============================================================
   POST /api/analytics/logout — loescht das Session-Cookie
   zuverlaessig (Max-Age=0), unabhaengig davon ob gerade eine
   gueltige Session vorlag.
   ============================================================ */
const { buildClearCookie } = require('./_lib/auth');

exports.handler = async function(event){
  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Set-Cookie': buildClearCookie()
    },
    body: JSON.stringify({ ok: true })
  };
};
