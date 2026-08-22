/* ============================================================
   RenditeX Markt-Cockpit — FRED-Anbindung (St. Louis Fed).
   Ein API-Key fuer alle Series-Requests (RENDITEX_FRED_API_KEY,
   siehe Netlify Environment Variables). Holt fuer jede Serie die
   Historie der letzten ~15 Jahre und berechnet daraus direkt den
   Perzentil-Rang des aktuellsten Werts — FRED liefert die volle
   Historie kostenlos in einem Call, dafuer muss RenditeX (anders
   als bei den CoinGecko-Trends) nichts selbst ueber Wochen
   akkumulieren.

   WICHTIGE VEREINFACHUNG (siehe COCKPIT.md): Alle FRED-Reihen
   nutzen in dieser ersten Ausbaustufe EINHEITLICH Perzentil-Rang
   ueber die verfuegbare Historie — nicht die im Datendossier
   vorgeschlagene Mischung aus Perzentil/Z-Score/Schwellenwert je
   Reihe. Das ist ein bewusster, dokumentierter erster Schritt,
   keine stillschweigende Abweichung.
   ============================================================ */
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';
var LOOKBACK_YEARS = 15;

function fredApiKey(){
  var key = process.env.RENDITEX_FRED_API_KEY;
  if(!key) throw new Error('RENDITEX_FRED_API_KEY fehlt (Netlify Environment Variables)');
  return key;
}

async function fetchFredSeries(seriesId){
  var start = new Date();
  start.setFullYear(start.getFullYear() - LOOKBACK_YEARS);
  var url = FRED_BASE + '?series_id=' + encodeURIComponent(seriesId) +
    '&api_key=' + fredApiKey() +
    '&file_type=json' +
    '&observation_start=' + start.toISOString().slice(0, 10);
  var r = await fetch(url);
  if(!r.ok) throw new Error('FRED ' + seriesId + ' -> ' + r.status);
  var j = await r.json();
  return (j.observations || [])
    .filter(function(o){ return o.value !== '.'; })
    .map(function(o){ return { date: o.date, value: parseFloat(o.value) }; });
}

/* Sucht zu einem Beobachtungspunkt den Wert ca. 1 Jahr zuvor
   (350-380 Tage), fuer die Jahresveraenderungsrate bei Reihen, die
   als Index ueber Jahrzehnte monoton wachsen (CPI, PCE, PPI, M2,
   Industrieproduktion) — deren ROHER Level-Perzentilrang waere
   sinnlos, weil er praktisch immer beim 100. Perzentil laege. */
function toYoy(observations){
  var out = [];
  for(var i = 0; i < observations.length; i++){
    var cur = observations[i];
    var curDate = new Date(cur.date);
    var target = new Date(curDate); target.setDate(target.getDate() - 365);
    var prior = null;
    for(var j = i - 1; j >= 0; j--){
      var d = new Date(observations[j].date);
      var diffDays = (curDate - d) / 86400000;
      if(diffDays >= 350 && diffDays <= 380){ prior = observations[j]; break; }
      if(diffDays > 380) break;
    }
    if(prior && prior.value){
      out.push({ date: cur.date, value: (cur.value - prior.value) / Math.abs(prior.value) });
    }
  }
  return out;
}

function percentileRank(historyValues, latest){
  if(!historyValues.length) return null;
  var below = historyValues.filter(function(v){ return v <= latest; }).length;
  return below / historyValues.length;
}

/* Holt eine Serie, wendet optional die YoY-Transformation an und
   gibt { latestValue, latestDate, percentile, historyLength } zurueck.
   transform: 'yoy' | 'level' */
async function fetchSeriesWithPercentile(seriesId, transform){
  var raw = await fetchFredSeries(seriesId);
  if(!raw.length) return null;
  var series = transform === 'yoy' ? toYoy(raw) : raw;
  if(!series.length) return null;
  var latest = series[series.length - 1];
  var pct = percentileRank(series.map(function(o){ return o.value; }), latest.value);
  return {
    seriesId: seriesId,
    latestValue: latest.value,
    latestDate: latest.date,
    percentile: pct,
    historyLength: series.length,
    transform: transform || 'level'
  };
}

module.exports = { fetchFredSeries, toYoy, percentileRank, fetchSeriesWithPercentile };
