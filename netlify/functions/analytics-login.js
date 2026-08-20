/* ============================================================
   POST /api/analytics/login — einziger Weg, eine gueltige
   Admin-Session zu bekommen. Prueft Passwort gegen
   RENDITEX_ADMIN_PASSWORD_HASH (scrypt, siehe _lib/auth.js), setzt
   bei Erfolg ein signiertes, HttpOnly/Secure-Cookie. Das Passwort
   selbst steht nirgends im Code oder Repo — nur der Hash kommt
   ueber eine Netlify-Environment-Variable herein.
   ============================================================ */
const { verifyPassword, createSessionToken, buildSetCookie, SESSION_TTL_SECONDS } = require('./_lib/auth');
const { checkAndBumpLoginRateLimit, resetLoginRateLimit } = require('./_lib/store');

function json(statusCode, body, extraHeaders){
  return {
    statusCode: statusCode,
    headers: Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, extraHeaders || {}),
    body: JSON.stringify(body)
  };
}

exports.handler = async function(event){
  if(event.httpMethod !== 'POST'){
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  var storedHash = process.env.RENDITEX_ADMIN_PASSWORD_HASH;
  var sessionSecret = process.env.RENDITEX_SESSION_SECRET;
  if(!storedHash || !sessionSecret){
    // Bewusst generisch: verraet einem Angreifer nicht, welcher der
    // beiden Werte fehlt. Fuer dich als Admin steht der Grund im
    // Netlify Function-Log.
    console.error('analytics-login: RENDITEX_ADMIN_PASSWORD_HASH oder RENDITEX_SESSION_SECRET fehlt.');
    return json(500, { ok: false, error: 'server_not_configured' });
  }

  var rate;
  try{
    rate = await checkAndBumpLoginRateLimit();
  }catch(e){
    rate = { allowed: true }; // Rate-Limit-Speicher down blockiert echten Login nicht
  }
  if(!rate.allowed){
    return json(429, { ok: false, error: 'too_many_attempts' }, { 'Retry-After': String(rate.retryAfterSeconds || 600) });
  }

  var payload;
  try{
    payload = JSON.parse(event.body || '{}');
  }catch(e){
    return json(400, { ok: false, error: 'bad_request' });
  }

  var password = payload && payload.password;
  if(!verifyPassword(password, storedHash)){
    return json(401, { ok: false, error: 'invalid_password' });
  }

  resetLoginRateLimit().catch(function(){});
  var token = createSessionToken(sessionSecret, SESSION_TTL_SECONDS);
  return json(200, { ok: true }, { 'Set-Cookie': buildSetCookie(token, SESSION_TTL_SECONDS) });
};
