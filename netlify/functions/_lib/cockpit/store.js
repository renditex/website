/* ============================================================
   RenditeX Markt-Cockpit — Speicherung ueber Netlify Blobs.
   Eigener Store-Namensraum, getrennt von den Analytics-Stores
   (siehe _lib/store.js), damit beide Systeme sich nicht
   gegenseitig beeinflussen koennen. Zwei Verwendungszwecke:
   1) taegliche Snapshots fuer Kennzahlen, die CoinGecko im
      Free-Tier nicht historisch herausgibt (Dominance, Market Cap)
   2) ein gecachtes "fertig berechnetes" Ergebnis pro Block, damit
      der oeffentliche Lese-Endpoint (cockpit-data.js) nicht bei
      jedem Seitenaufruf neu rechnen oder gar neu von CoinGecko
      abrufen muss (siehe Auftrag Abschnitt 41, Performance).
   ============================================================ */
const { getStore } = require('@netlify/blobs');

function snapshotStore(){ return getStore('rx-cockpit-snapshots'); }
function computedStore(){ return getStore('rx-cockpit-computed'); }

function pad2(n){ return n < 10 ? '0' + n : String(n); }
function dateKeyUTC(d){
  return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate());
}

async function writeTodaySnapshot(data){
  var store = snapshotStore();
  var key = 'snapshots/' + dateKeyUTC(new Date()) + '.json';
  await store.setJSON(key, Object.assign({}, data, { date: dateKeyUTC(new Date()) }));
}

async function loadRecentSnapshots(days){
  var store = snapshotStore();
  var res = await store.list({ prefix: 'snapshots/' });
  var keys = res.blobs.map(function(b){ return b.key; }).sort();
  var recentKeys = keys.slice(-1 * (days || 30));
  var values = await Promise.all(recentKeys.map(function(k){
    return store.get(k, { type: 'json' }).catch(function(){ return null; });
  }));
  return values.filter(Boolean);
}

async function writeComputedBlock(blockId, data){
  var store = computedStore();
  await store.setJSON('blocks/' + blockId + '.json', Object.assign({}, data, {
    computedAt: new Date().toISOString()
  }));
}

async function readComputedBlock(blockId){
  var store = computedStore();
  return store.get('blocks/' + blockId + '.json', { type: 'json' }).catch(function(){ return null; });
}

module.exports = {
  dateKeyUTC,
  writeTodaySnapshot,
  loadRecentSnapshots,
  writeComputedBlock,
  readComputedBlock
};
