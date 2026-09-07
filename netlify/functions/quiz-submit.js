/* ============================================================
   POST /api/quiz/submit — traegt ein abgeschlossenes Quiz-Ergebnis
   optional mit Namen in die oeffentliche Bestenliste ein. Bewusst
   ein SEPARATER, expliziter Schritt (nicht automatisch bei jedem
   Quiz-Abschluss) — der Besucher entscheidet aktiv, ob sein Ergebnis
   oeffentlich sichtbar wird. Name ist frei waehlbar, kein Konto,
   kein Login. Siehe Datenschutzerklaerung Abschnitt 5.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { writeResult } = require('./_lib/quiz-store');
const { containsBlockedWord } = require('./_lib/name-filter');

var VALID_LEVELS = { anfaenger: 8, mittel: 8, schwer: 8, extraschwer: 8 };

function json(statusCode, body){
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    body: JSON.stringify(body)
  };
}

// Erlaubt Buchstaben (inkl. Umlaute), Ziffern, Leerzeichen und ein
// paar gaengige Zeichen — alles andere (HTML, Steuerzeichen, Emojis
// mit Fremdsprachen-Missbrauchspotenzial) wird entfernt.
function sanitizeName(raw){
  var s = String(raw || '').trim().slice(0, 24);
  s = s.replace(/[^a-zA-Z0-9äöüÄÖÜß .,_-]/g, '').trim();
  return s || 'Anonym';
}

exports.handler = async function(event){
  connectLambda(event);

  if(event.httpMethod !== 'POST'){
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  var payload;
  try{
    payload = JSON.parse(event.body || '{}');
  }catch(e){
    return json(400, { ok: false, error: 'bad_request' });
  }

  var level = payload && payload.level;
  var expectedTotal = VALID_LEVELS[level];
  if(!expectedTotal){
    return json(400, { ok: false, error: 'invalid_level' });
  }

  var total = expectedTotal;
  var correct = Math.max(0, Math.min(total, parseInt(payload.correct, 10) || 0));
  var timeMs = Math.max(0, Math.min(60 * 60 * 1000, parseInt(payload.timeMs, 10) || 0));
  var name = sanitizeName(payload.name);

  if(containsBlockedWord(name)){
    return json(400, { ok: false, error: 'invalid_name' });
  }

  try{
    await writeResult(level, { name: name, correct: correct, total: total, timeMs: timeMs });
  }catch(e){
    console.error('quiz-submit error:', e);
    return json(500, { ok: false, error: 'internal_error' });
  }

  return json(200, { ok: true });
};
