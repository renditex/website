/* ============================================================
   GET /api/cockpit/data — oeffentlicher Lese-Endpoint fuers
   Markt-Cockpit. Anders als die Analytics-Endpoints bewusst OHNE
   Login: Marktdaten sind nicht sensibel, jeder Besucher darf sie
   sehen. Liest ausschliesslich das von cockpit-refresh.js bereits
   fertig berechnete Ergebnis aus Blobs — kein Live-Abruf bei
   Netlify/CoinGecko pro Seitenaufruf (siehe Auftrag Abschnitt 41).
   ============================================================ */
const { connectLambda } = require('@netlify/blobs');
const { readComputedBlock } = require('./_lib/cockpit/store');
const { verdictForScore } = require('./_lib/cockpit/aggregate');

function json(statusCode, body){
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' },
    body: JSON.stringify(body)
  };
}

var KNOWN_BLOCKS = ['krypto-marktstruktur', 'wachstum', 'inflation', 'liquiditaet', 'zinsen', 'kredit', 'stress'];

/* "Zinsen" und "Kredit" wurden fachlich als zwei Bloecke recherchiert
   (unterschiedliche Frequenz/Quellen), zeigen sich aber laut
   Datendossier (Schritt 4) als EIN Bereich "Zinsen & Kredit" im
   Marktbild — einfacher Durchschnitt beider Block-Scores, Treiber
   beider Bloecke zusammengefuehrt. */
function combineZinsenKredit(zinsen, kredit){
  if(!zinsen && !kredit) return null;
  var scores = [zinsen, kredit].filter(function(b){ return b && b.score != null; });
  if(!scores.length) return { score: null, verdictLabel: 'Keine Daten', drivers: [] };
  var avg = Math.round(scores.reduce(function(s, b){ return s + b.score; }, 0) / scores.length);
  var drivers = [].concat(zinsen ? zinsen.drivers : [], kredit ? kredit.drivers : [])
    .sort(function(a, b){ return Math.abs(b.score) - Math.abs(a.score); });
  var verdict = verdictForScore(avg);
  return { score: avg, verdictBucket: verdict.bucket, verdictLabel: verdict.label, drivers: drivers, computedAt: (zinsen || kredit).computedAt };
}

exports.handler = async function(event){
  connectLambda(event);

  if(event.httpMethod !== 'GET'){
    return json(405, { ok: false, error: 'method_not_allowed' });
  }

  try{
    var results = {};
    for(var i = 0; i < KNOWN_BLOCKS.length; i++){
      var id = KNOWN_BLOCKS[i];
      results[id] = await readComputedBlock(id);
    }
    results['zinsen-kredit'] = combineZinsenKredit(results.zinsen, results.kredit);
    return json(200, { ok: true, blocks: results });
  }catch(e){
    console.error('cockpit-data error:', e);
    return json(500, { ok: false, error: 'internal_error' });
  }
};
