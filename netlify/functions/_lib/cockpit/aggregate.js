/* ============================================================
   RenditeX Markt-Cockpit — Block-Score aus Einzelindikatoren.
   Formel exakt wie im Datendossier (Schritt 4) dokumentiert:
   A-Indikatoren zaehlen 3-fach, B-Indikatoren 2-fach, Gewichte
   werden je Block auf Summe 1 normiert, Block-Score ist der
   gewichtete Durchschnitt. Kein Gesamt-Score ueber Bloecke hinweg
   — bewusst, siehe Auftrag ("keine Kauf-Ampel").
   ============================================================ */
var GRADE_WEIGHT = { A: 3, B: 2, C: 1 };

/* indicators: [{ id, label, grade: 'A'|'B', score: -100..100|null, ...meta }]
   Indikatoren mit score === null (Daten fehlen/noch keine Historie)
   fliessen NICHT ein — kein erfundener Nullwert, siehe "keine
   Fake-Daten". Wenn ALLE fehlen, ist der Block-Score null. */
function computeBlockScore(indicators){
  var usable = indicators.filter(function(i){ return i.score != null && GRADE_WEIGHT[i.grade]; });
  if(!usable.length) return { score: null, drivers: [] };

  var totalWeight = usable.reduce(function(sum, i){ return sum + GRADE_WEIGHT[i.grade]; }, 0);
  var weighted = usable.reduce(function(sum, i){ return sum + i.score * GRADE_WEIGHT[i.grade]; }, 0);
  var score = Math.round(weighted / totalWeight);

  var drivers = usable
    .map(function(i){
      return {
        id: i.id, label: i.label, grade: i.grade, score: Math.round(i.score),
        weight: GRADE_WEIGHT[i.grade] / totalWeight
      };
    })
    .sort(function(a, b){ return Math.abs(b.score) - Math.abs(a.score); });

  return { score: score, drivers: drivers };
}

/* Verdict-Text je Score-Bucket — dieselbe 5-stufige Einteilung wie
   die --z0..--z4-Farbskala im Frontend, damit Text und Farbe immer
   zusammenpassen (siehe markt-cockpit/index.html). */
function verdictForScore(score){
  if(score == null) return { bucket: null, label: 'Keine Daten' };
  if(score >= 60) return { bucket: 'z4', label: 'Stark unterstützend' };
  if(score >= 20) return { bucket: 'z3', label: 'Unterstützend' };
  if(score > -20) return { bucket: 'z2', label: 'Neutral' };
  if(score > -60) return { bucket: 'z1', label: 'Gegenwind' };
  return { bucket: 'z0', label: 'Stark belastend' };
}

module.exports = { computeBlockScore, verdictForScore, GRADE_WEIGHT };
