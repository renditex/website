/* ============================================================
   RenditeX Analytics — grobe, datensparsame Klassifizierung.
   Wandelt Referer-Header und User-Agent SOFORT beim Request in
   eine von wenigen festen Kategorien um. Die volle Referrer-URL
   und der volle User-Agent-String werden nirgends gespeichert —
   nur das Ergebnis dieser Funktionen landet im Event.
   ============================================================ */

const REF_HOST_MAP = [
  [/instagram\.com$/i, 'instagram'],
  [/(youtube\.com|youtu\.be)$/i, 'youtube'],
  [/(t\.me|telegram\.org)$/i, 'telegram'],
  [/tiktok\.com$/i, 'tiktok'],
  [/google\./i, 'google'],
  [/renditex\.netlify\.app$/i, 'direkt'],
  [/renditex\.de$/i, 'direkt']
];

function classifyReferrer(referer, ownHost){
  if(!referer) return 'direkt';
  var host;
  try{
    host = new URL(referer).hostname;
  }catch(e){
    return 'sonstige';
  }
  if(ownHost && host === ownHost) return 'direkt';
  for(var i = 0; i < REF_HOST_MAP.length; i++){
    if(REF_HOST_MAP[i][0].test(host)) return REF_HOST_MAP[i][1];
  }
  return 'sonstige';
}

function classifyDevice(userAgent){
  var ua = String(userAgent || '');
  if(/ipad|tablet|android(?!.*mobile)/i.test(ua)) return 'tablet';
  if(/mobile|iphone|ipod|android/i.test(ua)) return 'mobile';
  return 'desktop';
}

module.exports = { classifyReferrer, classifyDevice };
