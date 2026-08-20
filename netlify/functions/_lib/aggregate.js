/* ============================================================
   RenditeX Analytics — Aggregation der rohen Events zu den
   Kennzahlen, die das Dashboard zeigt. Passiert komplett beim
   Lesen (nicht beim Schreiben), siehe store.js fuer die Begruendung.
   Zeigt bewusst NIE "Besucher" oder aehnliche Kennzahlen, die eine
   Unique-Visitor-Messung voraussetzen wuerden, die dieses System
   nicht besitzt — nur Page Views und Klicks (siehe Anforderung
   "keine Unique Visitors erfinden").
   ============================================================ */
const { LINK_CATEGORIES, CATEGORY_LABELS, LINK_LABELS } = require('./whitelist');
const { dateKeyUTC } = require('./store');

const REF_LABELS = {
  instagram: 'Instagram', youtube: 'YouTube', telegram: 'Telegram',
  tiktok: 'TikTok', google: 'Google', direkt: 'Direkt', sonstige: 'Sonstige'
};
const DEVICE_LABELS = { mobile: 'Mobile', desktop: 'Desktop', tablet: 'Tablet' };

function computeSummary(events){
  var pageViews = 0, linkClicks = 0;
  var byLink = {};
  var byCategory = {};
  var byRef = {};
  var byDevice = {};

  events.forEach(function(e){
    if(e.t === 'page_view'){
      pageViews++;
      if(e.ref) byRef[e.ref] = (byRef[e.ref] || 0) + 1;
      if(e.dev) byDevice[e.dev] = (byDevice[e.dev] || 0) + 1;
    } else if(e.t === 'link_click'){
      linkClicks++;
      byLink[e.target] = (byLink[e.target] || 0) + 1;
      var cat = e.cat || LINK_CATEGORIES[e.target];
      if(cat) byCategory[cat] = (byCategory[cat] || 0) + 1;
    }
  });

  var topLinks = Object.keys(byLink).map(function(target){
    return {
      target: target,
      label: LINK_LABELS[target] || target,
      clicks: byLink[target],
      share: linkClicks ? byLink[target] / linkClicks : 0
    };
  }).sort(function(a, b){ return b.clicks - a.clicks; });

  var categories = Object.keys(byCategory).map(function(cat){
    return { category: cat, label: CATEGORY_LABELS[cat] || cat, clicks: byCategory[cat] };
  }).sort(function(a, b){ return b.clicks - a.clicks; });

  var referrers = Object.keys(byRef).map(function(ref){
    return { ref: ref, label: REF_LABELS[ref] || ref, count: byRef[ref] };
  }).sort(function(a, b){ return b.count - a.count; });

  var devices = Object.keys(byDevice).map(function(dev){
    return { device: dev, label: DEVICE_LABELS[dev] || dev, count: byDevice[dev] };
  }).sort(function(a, b){ return b.count - a.count; });

  return {
    pageViews: pageViews,
    linkClicks: linkClicks,
    ctr: pageViews ? linkClicks / pageViews : null,
    topLink: topLinks.length ? topLinks[0] : null,
    topLinks: topLinks,
    categories: categories,
    referrers: referrers,
    devices: devices
  };
}

// Fester 30-Tage-Tagesverlauf fuers Chart, unabhaengig vom
// gewaehlten KPI-Zeitraum (siehe Vorgabe "Aufrufe der letzten 30 Tage").
function computeSeries(events30d){
  var byDay = {};
  var today = new Date();
  for(var i = 29; i >= 0; i--){
    var d = new Date(today.getTime() - i * 86400000);
    byDay[dateKeyUTC(d)] = { date: dateKeyUTC(d), pageViews: 0, linkClicks: 0 };
  }
  events30d.forEach(function(e){
    var day = e.ts ? e.ts.slice(0, 10) : null;
    if(!day || !byDay[day]) return;
    if(e.t === 'page_view') byDay[day].pageViews++;
    else if(e.t === 'link_click') byDay[day].linkClicks++;
  });
  return Object.keys(byDay).sort().map(function(k){ return byDay[k]; });
}

module.exports = { computeSummary, computeSeries };
