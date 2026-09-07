/* ============================================================
   POST /api/quiz/telegram — meldet ein abgeschlossenes Krypto-Quiz
   an die RenditeX-Telegram-Gruppe. Bewusst wie analytics-event.js:
   oeffentlicher Endpoint, striktes Whitelisting der Eingaben, Fehler
   duerfen dem Besucher nie auffallen (Ergebnis-Anzeige ist bereits
   fertig, die Meldung ist nur ein Nice-to-have obendrauf).
   Ohne konfigurierten Bot (RENDITEX_TELEGRAM_BOT_TOKEN /
   RENDITEX_TELEGRAM_CHAT_ID) passiert einfach nichts — kein Fehler,
   keine Wartepflicht fuer den Besucher.
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');

var VALID_LEVELS = { anfaenger: 8, mittel: 8, schwer: 8, extraschwer: 8 };
var NO_CONTENT = { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };

function fmtTime(ms){
  var s = Math.round(ms / 1000);
  var m = Math.floor(s / 60);
  s = s % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// Telegram-Markdown hat einige Sonderzeichen, die sonst die
// Formatierung zerschiessen oder den Request ablehnen lassen.
function escMd(s){
  return String(s).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

exports.handler = async function(event){
  connectLambda(event);

  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  var token = process.env.RENDITEX_TELEGRAM_BOT_TOKEN;
  var chatId = process.env.RENDITEX_TELEGRAM_CHAT_ID;
  if(!token || !chatId){
    return NO_CONTENT;
  }

  var payload;
  try{
    payload = JSON.parse(event.body || '{}');
  }catch(e){
    return NO_CONTENT;
  }

  var level = payload && payload.level;
  var expectedTotal = VALID_LEVELS[level];
  if(!expectedTotal){
    return NO_CONTENT;
  }

  var total = expectedTotal;
  var correct = Math.max(0, Math.min(total, parseInt(payload.correct, 10) || 0));
  var timeMs = Math.max(0, Math.min(60 * 60 * 1000, parseInt(payload.timeMs, 10) || 0));
  var levelLabel = typeof payload.levelLabel === 'string' ? payload.levelLabel.slice(0, 24) : level;
  var nickname = typeof payload.nickname === 'string' ? payload.nickname.trim().slice(0, 24) : '';

  var pct = Math.round((correct / total) * 100);
  var emoji = pct >= 90 ? '🏆' : pct >= 70 ? '💪' : pct >= 50 ? '🙂' : '📘';
  var who = nickname ? escMd(nickname) : '_Jemand_';

  var text = emoji + ' *Krypto\\-Quiz abgeschlossen*\n' +
    who + ' hat die Stufe *' + escMd(levelLabel) + '* gemacht\\.\n' +
    '✅ ' + correct + ' / ' + total + ' richtig \\(' + pct + '%\\)\n' +
    '⏱ ' + escMd(fmtTime(timeMs)) + ' Minuten';

  try{
    await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'MarkdownV2' })
    });
  }catch(e){
    // Speicher-/Netzwerkfehler duerfen dem Besucher nie auffallen.
  }

  return NO_CONTENT;
};
