/* ============================================================
   RenditeX Analytics — Speicherung ueber Netlify Blobs.
   Architektur-Entscheidung (siehe ANALYTICS.md fuer die
   ausfuehrliche Begruendung): JEDES Event wird als eigener,
   unveraenderlicher Blob unter einem eigenen Schluessel abgelegt
   (Event-Log), nicht als gemeinsamer Zaehler, der bei zwei
   gleichzeitigen Klicks ueberschrieben werden koennte. Aggregation
   (Summen, Zeitreihen) passiert beim Lesen im Dashboard, nicht beim
   Schreiben — dadurch ist kein Request je von einem anderen
   abhaengig und es kann nichts "verloren gehen".
   ============================================================ */
const { getStore } = require('@netlify/blobs');

function eventsStore(){
  return getStore('rx-analytics-events');
}
function rateLimitStore(){
  return getStore('rx-analytics-ratelimit');
}

function pad2(n){ return n < 10 ? '0' + n : String(n); }
function dateKeyUTC(d){
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}

async function writeEvent(event){
  var store = eventsStore();
  var now = new Date();
  var day = dateKeyUTC(now);
  var rand = Math.random().toString(36).slice(2, 8);
  var key = 'events/' + day + '/' + now.getTime() + '-' + rand + '.json';
  await store.setJSON(key, Object.assign({}, event, { ts: now.toISOString() }));
}

function keyDate(key){
  var m = key.match(/^events\/(\d{4}-\d{2}-\d{2})\//);
  return m ? m[1] : null;
}

async function listAllEventKeys(){
  var store = eventsStore();
  var keys = [];
  var cursor;
  do{
    var res = await store.list({ prefix: 'events/', cursor: cursor });
    res.blobs.forEach(function(b){ keys.push(b.key); });
    cursor = res.cursor;
  } while(cursor);
  return keys;
}

// range: 'today' | '7d' | '30d' | 'all'
async function loadEvents(range){
  var keys = await listAllEventKeys();
  var now = new Date();
  var cutoffDate = null;
  if(range === 'today'){
    cutoffDate = dateKeyUTC(now);
  } else if(range === '7d' || range === '30d'){
    var days = range === '7d' ? 7 : 30;
    var cutoff = new Date(now.getTime() - (days - 1) * 86400000);
    cutoffDate = dateKeyUTC(cutoff);
  }
  var filtered = keys.filter(function(k){
    var d = keyDate(k);
    if(!d) return false;
    if(cutoffDate === null) return true;
    return d >= cutoffDate;
  });
  var store = eventsStore();
  var values = await Promise.all(filtered.map(function(k){
    return store.get(k, { type: 'json' }).catch(function(){ return null; });
  }));
  return values.filter(Boolean);
}

/* ---------- Login-Rate-Limit ----------
   Bewusst EIN globaler Zaehler statt pro IP-Adresse, damit dafuer
   keine IP gespeichert werden muss. Kleines Race-Fenster bei
   zeitgleichen Versuchen wird in Kauf genommen (siehe ANALYTICS.md)
   — fuer einen einzelnen Admin-Account ausreichend, keine
   Enterprise-Anforderung. */
var RATE_LIMIT_KEY = 'login-attempts';
var RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 Minuten
var RATE_LIMIT_MAX = 8;

async function checkAndBumpLoginRateLimit(){
  var store = rateLimitStore();
  var now = Date.now();
  var state = await store.get(RATE_LIMIT_KEY, { type: 'json' }).catch(function(){ return null; });
  if(!state || !state.resetAt || state.resetAt < now){
    state = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  if(state.count >= RATE_LIMIT_MAX){
    return { allowed: false, retryAfterSeconds: Math.ceil((state.resetAt - now) / 1000) };
  }
  state.count += 1;
  await store.setJSON(RATE_LIMIT_KEY, state);
  return { allowed: true };
}

async function resetLoginRateLimit(){
  var store = rateLimitStore();
  await store.delete(RATE_LIMIT_KEY).catch(function(){});
}

module.exports = {
  writeEvent,
  loadEvents,
  dateKeyUTC,
  checkAndBumpLoginRateLimit,
  resetLoginRateLimit
};
