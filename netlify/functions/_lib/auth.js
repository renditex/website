/* ============================================================
   RenditeX Analytics — Passwort-Hashing und Session-Cookies.
   Kein zusaetzliches Paket: alles ueber Node's eingebautes
   crypto-Modul (scrypt fuer das Passwort, HMAC-SHA256 fuer die
   signierte, zustandslose Session — kein Session-Store noetig,
   die Signatur macht das Cookie server-verifizierbar).
   ============================================================ */
const crypto = require('crypto');

const SESSION_COOKIE = 'rx_admin_session';
const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 Stunden

/* ---------- Passwort ---------- */
// Format des gespeicherten Hash (RENDITEX_ADMIN_PASSWORD_HASH):
// "scrypt$<saltHex>$<hashHex>" — Erzeugung siehe scripts/hash-password.js
function verifyPassword(password, storedHash){
  if(!password || !storedHash) return false;
  var parts = String(storedHash).split('$');
  if(parts.length !== 3 || parts[0] !== 'scrypt') return false;
  try{
    var salt = parts[1];
    var expected = Buffer.from(parts[2], 'hex');
    var actual = crypto.scryptSync(String(password), salt, expected.length);
    if(actual.length !== expected.length) return false;
    return crypto.timingSafeEqual(actual, expected);
  }catch(e){
    return false;
  }
}

/* ---------- Session-Token ----------
   base64url(payloadJson) + "." + base64url(HMAC-SHA256(payloadJson))
   Zustandslos und faelschungssicher, solange RENDITEX_SESSION_SECRET
   geheim bleibt — kein Datenbank-Zugriff zur Pruefung noetig. */
function b64url(buf){
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str){
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while(str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}

function sign(payloadBuf, secret){
  return crypto.createHmac('sha256', secret).update(payloadBuf).digest();
}

function createSessionToken(secret, ttlSeconds){
  var payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + (ttlSeconds || SESSION_TTL_SECONDS) });
  var payloadBuf = Buffer.from(payload, 'utf8');
  var sig = sign(payloadBuf, secret);
  return b64url(payloadBuf) + '.' + b64url(sig);
}

function verifySessionToken(token, secret){
  if(!token || typeof token !== 'string') return false;
  var parts = token.split('.');
  if(parts.length !== 2) return false;
  try{
    var payloadBuf = b64urlDecode(parts[0]);
    var sigBuf = b64urlDecode(parts[1]);
    var expectedSig = sign(payloadBuf, secret);
    if(sigBuf.length !== expectedSig.length) return false;
    if(!crypto.timingSafeEqual(sigBuf, expectedSig)) return false;
    var payload = JSON.parse(payloadBuf.toString('utf8'));
    return typeof payload.exp === 'number' && payload.exp > Math.floor(Date.now() / 1000);
  }catch(e){
    return false;
  }
}

/* ---------- Cookie-Helfer ---------- */
function parseCookies(cookieHeader){
  var out = {};
  String(cookieHeader || '').split(';').forEach(function(part){
    var idx = part.indexOf('=');
    if(idx === -1) return;
    var k = part.slice(0, idx).trim();
    var v = part.slice(idx + 1).trim();
    if(k) out[k] = decodeURIComponent(v);
  });
  return out;
}

function getSessionTokenFromHeaders(headers){
  var cookies = parseCookies(headers && (headers.cookie || headers.Cookie));
  return cookies[SESSION_COOKIE];
}

function buildSetCookie(token, maxAgeSeconds){
  return SESSION_COOKIE + '=' + encodeURIComponent(token) +
    '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + maxAgeSeconds;
}

function buildClearCookie(){
  return SESSION_COOKIE + '=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

module.exports = {
  SESSION_TTL_SECONDS,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  getSessionTokenFromHeaders,
  buildSetCookie,
  buildClearCookie
};
