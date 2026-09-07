/* ============================================================
   RenditeX Krypto-Quiz — Speicherung ueber Netlify Blobs. Gleiches
   Prinzip wie die Analytics-Events (_lib/store.js): jedes eingetragene
   Ergebnis ist ein eigener, unveraenderlicher Blob, die Bestenliste
   wird beim Lesen berechnet, nicht beim Schreiben. Jeder Eintrag
   traegt eine stabile "id" (= Key-Suffix), damit das Admin-Interface
   gezielt einzelne Eintraege loeschen kann (Moderation).
   ============================================================ */
const { getStore } = require('@netlify/blobs');
var LEVELS = ['anfaenger', 'mittel', 'schwer', 'extraschwer'];

function resultsStore(){
  return getStore('rx-quiz-results');
}

function keyFor(level, id){
  return 'results/' + level + '/' + id + '.json';
}

async function writeResult(level, entry){
  var store = resultsStore();
  var now = new Date();
  var rand = Math.random().toString(36).slice(2, 8);
  var id = now.getTime() + '-' + rand;
  await store.setJSON(keyFor(level, id), Object.assign({}, entry, { id: id, submittedAt: now.toISOString() }));
  return id;
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

async function listAllResults(){
  var perLevel = await Promise.all(LEVELS.map(function(lv){
    return listResultsForLevel(lv).then(function(results){
      return results.map(function(r){ return Object.assign({ level: lv }, r); });
    });
  }));
  return [].concat.apply([], perLevel);
}

async function deleteResult(level, id){
  if(LEVELS.indexOf(level) === -1 || !id) return;
  var store = resultsStore();
  await store.delete(keyFor(level, id));
}

module.exports = { writeResult, listResultsForLevel, listAllResults, deleteResult, LEVELS: LEVELS };
