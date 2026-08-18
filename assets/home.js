/* ============================================================
   RenditeX — Startseiten-Logik (RenditeX 2.0)
   Liest ausschliesslich aus den bestehenden zentralen Datenquellen
   (RX_DATA.bitopex, RX_DATA.hyperocket, RX.project-Helfer) und dem
   Live-Fear&Greed-Endpoint. Erfindet, interpoliert oder cached NICHTS
   eigenes — fehlt eine Datenquelle, blendet sich der jeweilige
   Bereich aus, statt einen falschen/veralteten Wert zu zeigen.
   ============================================================ */
(function(){
"use strict";

var P = window.RX.project;
var DATA = window.RX_DATA || {};
var BITOPEX = DATA.bitopex;
var HYPEROCKET = DATA.hyperocket;

function $(id){ return document.getElementById(id); }
function hide(el){ if(el) el.hidden = true; }
function show(el){ if(el) el.hidden = false; }

function pillHtml(status){
  var s = P.STATUS[status] || P.STATUS.active;
  return '<span class="proj-pill" style="--sc:' + s.color + '"><span class="dot"></span>' + P.esc(s.label) + '</span>';
}

/* Kleine, abhaengigkeitsfreie Sparkline aus echten Werten — kein Fake-Verlauf,
   wird nur gerendert, wenn mindestens zwei echte Datenpunkte vorliegen. */
function sparklineSvg(values, color){
  if(!values || values.length < 2) return '';
  var w = 240, h = 44;
  var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
  var range = (max - min) || 1;
  var stepX = w / (values.length - 1);
  var pts = values.map(function(v, i){
    var x = (i * stepX).toFixed(1);
    var y = (h - 4 - ((v - min) / range) * (h - 8)).toFixed(1);
    return x + ',' + y;
  }).join(' ');
  return '<svg class="pf-spark" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" aria-hidden="true">' +
    '<polyline points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
  '</svg>';
}

/* ---------- Live Fear & Greed ---------- */
var FG_ZONES = [
  { max:24,  de:'Extreme Angst', c:'var(--z0)' },
  { max:44,  de:'Angst',         c:'var(--z1)' },
  { max:55,  de:'Neutral',       c:'var(--z2)' },
  { max:75,  de:'Gier',          c:'var(--z3)' },
  { max:100, de:'Extreme Gier',  c:'var(--z4)' }
];
var fgPromise = null;
function fetchFearGreed(){
  if(!fgPromise){
    fgPromise = fetch('https://api.alternative.me/fng/?limit=1&format=json', { cache:'no-store' })
      .then(function(r){ return r.json(); })
      .then(function(j){
        var v = parseInt(j.data[0].value, 10);
        var zone = FG_ZONES.filter(function(z){ return v <= z.max; })[0];
        return { value:v, zone:zone };
      });
  }
  return fgPromise;
}
function loadFearGreedInto(elId, withLabel){
  var el = $(elId);
  if(!el) return;
  fetchFearGreed().then(function(r){
    el.style.color = r.zone.c;
    el.innerHTML = r.value + (withLabel ? ' <small style="color:var(--muted); font-weight:400">' + r.zone.de + '</small>' : '');
  }).catch(function(){
    var wrap = el.closest('.market-card');
    if(wrap) hide(wrap); else el.textContent = '';
  });
}

/* ---------- Meine Praxistests — grosse, datenorientierte Cards. Bewusst
   erst nach Wissen/Tools, damit RenditeX nicht zuerst wie eine
   Investment-/Affiliate-Seite wirkt (siehe index.html-Reihenfolge). ---------- */
function renderFeaturedProjects(){
  var host = $('projFeatureGrid');
  var section = $('projekte');
  if(!host || !section) return;
  var cards = [];

  if(BITOPEX){
    var latest = P.latestPerformance(BITOPEX);
    var pts = BITOPEX.weeklyPerformance;
    if(latest && pts && pts.length && BITOPEX.performanceSeries && BITOPEX.performanceSeries.length){
      var sortedAsc = pts.slice().sort(function(a, b){ return new Date(a.date) - new Date(b.date); });
      var mainKey = BITOPEX.performanceSeries[0].key;
      var spark = sparklineSvg(sortedAsc.map(function(p){ return p[mainKey]; }), '#0052FF');
      var metrics = BITOPEX.performanceSeries.map(function(s){
        var v = latest[s.key], up = v >= 0;
        return '<div class="pf-metric"><span class="l">' + P.esc(s.label) + '</span>' +
          '<span class="v" style="color:' + (up ? 'var(--z3)' : 'var(--red)') + '">' + P.fmtPct(v) + '</span></div>';
      }).join('');
      cards.push(
        '<a class="proj-feature-card" href="/projekte/bitopex/">' +
          '<div class="pf-top"><span class="pf-label">Praxistest</span>' + pillHtml(BITOPEX.status) + '</div>' +
          '<h3>Bitopex</h3>' +
          (BITOPEX.testStartedAt ? '<div class="pf-sub">seit ' + P.esc(P.fmtMonthYear(BITOPEX.testStartedAt)) + '</div>' : '') +
          '<p>Mein laufender Praxistest der 0DTE- und ALT-0DTE-Strategien mit regelmäßigen Performance-Updates.</p>' +
          '<div class="pf-metrics">' + metrics + '</div>' +
          spark +
          '<div class="pf-meta">Stand: ' + P.esc(P.fmtDate(BITOPEX.updatedAt)) + '</div>' +
          '<span class="pf-cta">Aktuellen Stand ansehen <span class="arr">→</span></span>' +
        '</a>'
      );
    }
  }

  if(HYPEROCKET && HYPEROCKET.accountSnapshot){
    var snap = HYPEROCKET.accountSnapshot;
    var wStats = (HYPEROCKET.withdrawals && HYPEROCKET.withdrawals.length) ? P.computeWithdrawalStats(HYPEROCKET.withdrawals) : null;
    var spark2 = wStats ? sparklineSvg(wStats.months.map(function(m){ return m.total; }), '#12E6D6') : '';
    cards.push(
      '<a class="proj-feature-card" href="/projekte/hyperocket/">' +
        '<div class="pf-top"><span class="pf-label">Praxistest</span>' + pillHtml(HYPEROCKET.status) + '</div>' +
        '<h3>HyperRocket</h3>' +
        '<p>Mein eigener Account, meine dokumentierten Auszahlungen und die laufende Entwicklung meines Praxistests.</p>' +
        '<div class="pf-metrics">' +
          '<div class="pf-metric"><span class="l">Aktiv investiert</span><span class="v">' + P.fmtMoney(snap.activeInvestmentUsdt, 'USDT') + '</span></div>' +
          (wStats ? '<div class="pf-metric"><span class="l">Dokumentiert ausgezahlt</span><span class="v">' + P.fmtMoney(wStats.total, '$') + '</span></div>' : '') +
        '</div>' +
        spark2 +
        '<div class="pf-meta">Stand: ' + P.esc(P.fmtDate(snap.date)) + '</div>' +
        '<span class="pf-cta">Praxistest ansehen <span class="arr">→</span></span>' +
      '</a>'
    );
  }

  if(!cards.length){ hide(section); return; }
  show(section);
  host.innerHTML = cards.join('');
}

/* ---------- Neu auf YouTube — groesstes, aktuellstes Video ueber alle
   Projekte hinweg, mit Ruecklink zur zugehoerigen Projektseite. ---------- */
function renderFeaturedVideo(){
  var section = $('youtube');
  if(!section) return;
  var pool = [];
  if(BITOPEX && BITOPEX.videos) pool = pool.concat(BITOPEX.videos);
  if(HYPEROCKET && HYPEROCKET.videos) pool = pool.concat(HYPEROCKET.videos);
  if(!pool.length){ hide(section); return; }
  show(section);

  var video = pool.slice().sort(function(a, b){ return new Date(b.publishedAt) - new Date(a.publishedAt); })[0];
  var id = P.youtubeId(video.youtubeUrl);
  var thumb = video.thumbnail || P.youtubeThumb(video.youtubeUrl);

  var thumbHost = $('homeVideoThumb');
  if(thumbHost){
    thumbHost.innerHTML =
      '<button type="button" class="proj-video-thumb big" data-yt="' + P.esc(id || '') + '" aria-label="Video abspielen: ' + P.esc(video.title) + '">' +
        (thumb ? '<img src="' + P.esc(thumb) + '" alt="" loading="lazy">' : '') +
        '<span class="play">' + P.playIcon + '</span>' +
      '</button>';
  }

  var metaHost = $('homeVideoMeta');
  if(metaHost){
    metaHost.innerHTML =
      '<h3>' + P.esc(video.title) + '</h3>' +
      (video.description ? '<p>' + P.esc(video.description) + '</p>' : '') +
      (video.publishedAt ? '<div class="proj-video-dates"><span>Veröffentlicht: <b>' + P.esc(P.fmtDate(video.publishedAt)) + '</b></span></div>' : '');
  }

  var linkHost = $('homeVideoLink');
  var proj = video.projectSlug === 'bitopex' ? BITOPEX : (video.projectSlug === 'hyperocket' ? HYPEROCKET : null);
  if(linkHost){
    if(proj){
      show(linkHost);
      linkHost.innerHTML =
        '<div class="proj-since-head">Seit diesem Video gibt es neuere Daten</div>' +
        '<p style="color:var(--muted); font-size:14.5px; margin-top:8px">Das Video zeigt meinen Stand zum Zeitpunkt der Aufnahme. Den aktuellen Stand dokumentiere ich auf RenditeX weiter.</p>' +
        '<a class="btn primary" style="margin-top:14px" href="/projekte/' + P.esc(proj.slug) + '/">Aktuellen Stand ansehen</a>';
    } else {
      hide(linkHost);
    }
  }
}

/* ---------- Markt im Blick — Fear & Greed live, Heatzone ohne
   eigenstaendig nachgerechneten Live-Zonenwert (siehe Kommentar in
   heatzone-chart/index.html: eigenes Bewertungsmodell, keine
   Duplizierung der Berechnung auf der Startseite). ---------- */
function renderMarket(){
  loadFearGreedInto('marketFgVal', true);
}

/* ---------- Neu auf RenditeX — automatisch aus vorhandenen
   Projektdaten abgeleiteter Update-Feed. Keine eigene Textpflege:
   Titel/Zahlen kommen direkt aus withdrawals/weeklyPerformance/videos. ---------- */
function renderUpdatesFeed(){
  var section = $('updates');
  var host = $('updateFeed');
  if(!section || !host) return;
  var items = [];

  if(HYPEROCKET && HYPEROCKET.withdrawals){
    HYPEROCKET.withdrawals.slice().sort(function(a, b){ return new Date(b.date) - new Date(a.date); }).slice(0, 2).forEach(function(w){
      items.push({
        date: w.date,
        title: 'Neue HyperRocket-Auszahlung',
        desc: P.fmtMoney(w.amount, '$') + ' <span>·</span> ' + P.esc(w.asset) + ' · ' + P.esc(P.networkLabel(w.network)),
        href: '/projekte/hyperocket/#auszahlungen'
      });
    });
  }
  if(HYPEROCKET && HYPEROCKET.accountSnapshot){
    items.push({
      date: HYPEROCKET.accountSnapshot.date,
      title: 'HyperRocket Account aktualisiert',
      desc: 'Neuer Account-Snapshot',
      href: '/projekte/hyperocket/#account-stand'
    });
  }
  if(BITOPEX && BITOPEX.weeklyPerformance && BITOPEX.performanceSeries){
    BITOPEX.weeklyPerformance.slice().sort(function(a, b){ return new Date(b.date) - new Date(a.date); }).slice(0, 2).forEach(function(p){
      var parts = BITOPEX.performanceSeries.map(function(s){ return P.esc(s.label) + ' ' + P.fmtPct(p[s.key]); }).join(' <span>·</span> ');
      items.push({ date:p.date, title:'Bitopex Wochenupdate', desc:parts, href:'/projekte/bitopex/#projPerformance' });
    });
  }
  [BITOPEX, HYPEROCKET].forEach(function(proj){
    if(!proj || !proj.videos) return;
    proj.videos.forEach(function(v){
      items.push({
        date: v.publishedAt,
        title: 'Neues Video: ' + v.title,
        desc: P.esc(proj.name),
        href: '/projekte/' + proj.slug + '/#hauptvideo'
      });
    });
  });

  items = items.filter(function(it){ return it.date; });
  items.sort(function(a, b){ return new Date(b.date) - new Date(a.date); });
  items = items.slice(0, 5);

  if(!items.length){ hide(section); return; }
  show(section);
  host.innerHTML = items.map(function(it){
    return '<a class="update-row" href="' + it.href + '">' +
      '<div class="update-date">' + P.esc(P.fmtDate(it.date)) + '</div>' +
      '<div class="update-body"><h4>' + P.esc(it.title) + '</h4><p>' + it.desc + '</p></div>' +
    '</a>';
  }).join('');
}

function init(){
  renderFeaturedProjects();
  renderFeaturedVideo();
  renderMarket();
  renderUpdatesFeed();
}

window.RX = window.RX || {};
window.RX.home = { init: init };
})();
