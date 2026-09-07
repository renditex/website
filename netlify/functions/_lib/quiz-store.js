/* ============================================================
   RenditeX Krypto-Quiz — Speicherung ueber Netlify Blobs. Gleiches
   Prinzip wie die Analytics-Events (_lib/store.js): jedes eingetragene
   Ergebnis ist ein eigener, unveraenderlicher Blob, die Bestenliste
   wird beim Lesen berechnet, nicht beim Schreiben.
   ============================================================ */
const { getStore } = require('@netlify/blobs');

function resultsStore(){
  return getStore('rx-quiz-results');
}

async function writeResult(level, entry){
  var store = resultsStore();
  var now = new Date();
  var rand = Math.random().toString(36).slice(2, 8);
  var key = 'results/' + level + '/' + now.getTime() + '-' + rand + '.json';
  await store.setJSON(key, Object.assign({}, entry, { submittedAt: now.toISOString() }));
}

async function listResultsForLevel(level){
  var store = resultsStore();
  var keys = [];
  var cursor;
  do{
    var res = await store.list({ prefix: 'results/' + level + '/', cursor: cursor });
    res.blobs.forEach(function(b){ keys.push(b.key); });
    cursor = res.cursor;
  } while(cursor);
  var values = await Promise.all(keys.map(function(k){
    return store.get(k, { type: 'json' }).catch(function(){ return null; });
  }));
  return values.filter(Boolean);
}

module.exports = { writeResult, listResultsForLevel };
