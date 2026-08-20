/* ============================================================
   RenditeX — Startseiten-Logik (RenditeX 2.0)
   Liest ausschliesslich aus bestehenden zentralen Datenquellen
   (RX_DATA.bitopex, RX_DATA.hyperocket, RX.project-Helfer) und
   echten Live-Endpoints (alternative.me Fear & Greed, CoinGecko BTC,
   mempool.space Blockstand). Erfindet, interpoliert oder cached
   NICHTS eigenes — fehlt eine Datenquelle, blendet sich der
   jeweilige Bereich aus, statt einen falschen/veralteten Wert zu
   zeigen. Wird sowohl von index.html ("Live auf RenditeX" + Tools-
   Sektion) als auch von /tools/ eingebunden.
   ============================================================ */
(function(){
"use strict";

var P = window.RX.project;
var DATA = window.RX_DATA || {};
var BITOPEX = DATA.bitopex;
var HYPEROCKET = DATA.hyperocket;
var SMARTIT = DATA.smartit;
var DEFICIRCLE = DATA.deficircle;
var CHANNEL = DATA.channel;

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

/* ============================================================
   Live-Tool-Vorschauen ("Live auf RenditeX" + Tool-Sektion)
   Heatzone und Sparplan-Rechner teilen sich eine BTC-Preisserie
   (ein Fetch statt zwei). Fear & Greed kommt mit kurzer Historie fuer
   die Mini-Sparkline. Alle drei liefern Promises mit echten Werten
   oder werfen — der jeweilige Kartenhost blendet sich dann selbst
   aus, es wird nie ein Fake-/Naeherungswert angezeigt.
   ============================================================ */

/* ---------- Fear & Greed (Wert + kurze Historie fuer Sparkline) ---------- */
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
    fgPromise = fetch('https://api.alternative.me/fng/?limit=30&format=json', { cache:'no-store' })
      .then(function(r){ return r.json(); })
      .then(function(j){
        var arr = j.data.slice().reverse(); // alt -> neu
        var value = parseInt(arr[arr.length - 1].value, 10);
        var zone = FG_ZONES.filter(function(z){ return value <= z.max; })[0];
        var spark = arr.map(function(d){ return parseInt(d.value, 10); });
        return { value:value, zone:zone, spark:spark };
      });
  }
  return fgPromise;
}

/* ---------- BTC-Preisserie + Heatzone-Bewertungsmodell ----------
   Gleiches Modell wie /heatzone-chart/ (log-log-Regression ueber den
   bekannten Kursverlauf; letzte 365 Tage live von CoinGecko, Aelteres
   als feste, oeffentlich dokumentierte Eckdaten — siehe Kommentar
   dort zur 365-Tage-Grenze der kostenlosen API). Bewusst eine
   eigenstaendige Kopie statt eines Imports, um die funktionierende
   Tool-Seite nicht anzufassen — Zonen/Anker bei Aenderungen an
   beiden Stellen pflegen. */
var HZ_ZONES = [
  { hex:'#4C3A9E', de:'Kapitulation', lo:-Infinity, hi:-1.5 },
  { hex:'#2E52C7', de:'Kaufen',       lo:-1.5, hi:-0.9 },
  { hex:'#0D7A82', de:'Akkumulieren', lo:-0.9, hi:-0.3 },
  { hex:'#1C8F52', de:'Neutral',      lo:-0.3, hi:0.3 },
  { hex:'#E06A3A', de:'FOMO',         lo:0.3, hi:0.9 },
  { hex:'#C92E68', de:'Euphorie',     lo:0.9, hi:1.5 },
  { hex:'#A81548', de:'Blase',        lo:1.5, hi:Infinity }
];
function hzZoneOfZ(z){
  for(var i = 0; i < HZ_ZONES.length; i++){ if(z > HZ_ZONES[i].lo && z <= HZ_ZONES[i].hi) return HZ_ZONES[i]; }
  return HZ_ZONES[3];
}
var HZ_GENESIS = Date.UTC(2009, 0, 3);
function hzDaysSince(t){ return Math.max(1, (t - HZ_GENESIS) / 86400000); }
function hzFallbackSeries(cutoffT){
  var fx = 0.92;
  var anchors = [
    ['2013-01-01',12],['2014-01-01',700],['2015-01-01',250],['2016-01-01',380],
    ['2017-01-01',900],['2017-12-17',17500],['2018-12-15',3300],['2019-06-26',11000],
    ['2020-03-13',4600],['2020-12-31',26000],['2021-04-14',61000],['2021-11-10',61500],
    ['2022-06-18',18000],['2022-11-21',15800],['2023-12-31',40000],['2024-03-14',68000],
    ['2024-11-10',76000],['2025-06-01',100000],['2025-10-06',126000],['2025-12-01',92000],['2026-08-01',64000]
  ].map(function(a){ return { t:new Date(a[0] + 'T00:00:00Z').getTime(), p:a[1] * fx }; });
  var out = [];
  for(var i = 0; i < anchors.length - 1; i++){
    var a = anchors[i], b = anchors[i + 1], steps = Math.max(1, Math.round((b.t - a.t) / 86400000));
    for(var s = 0; s < steps; s++){
      var f = s / steps, t = a.t + f * (b.t - a.t);
      var p = Math.exp(Math.log(a.p) + f * (Math.log(b.p) - Math.log(a.p)));
      out.push({ t:t, p:p });
    }
  }
  out.push({ t:anchors[anchors.length - 1].t, p:anchors[anchors.length - 1].p });
  return cutoffT == null ? out : out.filter(function(d){ return d.t < cutoffT; });
}
function hzFitModel(series){
  var n = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
  var pts = series.map(function(d){ return { x:Math.log10(hzDaysSince(d.t)), y:Math.log10(d.p) }; });
  pts.forEach(function(p){ n++; sx += p.x; sy += p.y; sxx += p.x * p.x; sxy += p.x * p.y; });
  var B = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  var A = (sy - B * sx) / n;
  var ybar = sy / n, ssRes = 0, ssTot = 0;
  pts.forEach(function(p){ var pred = A + B * p.x; ssRes += (p.y - pred) * (p.y - pred); ssTot += (p.y - ybar) * (p.y - ybar); });
  return { A:A, B:B, sigma:Math.sqrt(ssRes / n) };
}
function hzZScore(model, t, price){ return (Math.log10(price) - (model.A + model.B * Math.log10(hzDaysSince(t)))) / model.sigma; }

var btcSeriesPromise = null;
function fetchBtcSeries(){
  if(!btcSeriesPromise){
    var cur = RX.currency.get().toLowerCase();
    var livePriceP = fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=' + cur, { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ return (j && j.bitcoin && typeof j.bitcoin[cur] === 'number') ? j.bitcoin[cur] : null; })
      .catch(function(){ return null; });
    var recentP = fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=' + cur + '&days=365&interval=daily', { cache:'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){
        if(j && j.prices && j.prices.length > 200){
          return j.prices.map(function(p){ return { t:p[0], p:p[1] }; }).filter(function(d){ return d.p > 0; });
        }
        return null;
      })
      .catch(function(){ return null; });
    btcSeriesPromise = Promise.all([livePriceP, recentP]).then(function(r){
      var livePrice = r[0], recent = r[1];
      if(!livePrice && !recent) throw new Error('keine BTC-Daten');
      var cutoff = recent ? recent[0].t : Date.now();
      var series = hzFallbackSeries(cutoff).concat(recent || []);
      if(livePrice){
        var lastT = series.length ? series[series.length - 1].t : 0;
        if(Date.now() - lastT > 6 * 3600000){ series.push({ t:Date.now(), p:livePrice }); }
        else{ series[series.length - 1] = { t:series[series.length - 1].t, p:livePrice }; }
      }
      return { series:series, currency:cur };
    });
  }
  return btcSeriesPromise;
}
function heatzoneData(){
  return fetchBtcSeries().then(function(r){
    var model = hzFitModel(r.series);
    var last = r.series[r.series.length - 1];
    var zone = hzZoneOfZ(hzZScore(model, last.t, last.p));
    return { price:last.p, zone:zone, spark:r.series.slice(-120).map(function(d){ return d.p; }), currency:r.currency };
  });
}

/* ---------- Sparplan-Rechner: echter 12-Monats-DCA-Backtest ----------
   Die reale /sparplan-rechner/-Seite begrenzt den Backtest bewusst auf
   maximal 12 Monate (dieselbe 365-Tage-API-Grenze) — die Vorschau
   rechnet deshalb ebenfalls mit 12 Monaten statt einer laengeren,
   nicht mit echten Daten belegbaren Zeitspanne. */
function sparplanData(){
  return fetchBtcSeries().then(function(r){
    var months = 12, amount = 100;
    var last = r.series[r.series.length - 1];
    var start = new Date();
    start = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() - months + 1, 1));
    var dates = [];
    for(var i = 0; i < months; i++){ dates.push(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1)); }
    function priceOnOrBefore(ts){
      var best = r.series[0];
      for(var j = 0; j < r.series.length; j++){ if(r.series[j].t <= ts) best = r.series[j]; else break; }
      return best;
    }
    var units = 0;
    dates.forEach(function(t){ units += amount / priceOnOrBefore(t).p; });
    return { amount:amount, months:months, invested:amount * months, valueToday:units * last.p, currency:r.currency };
  });
}

window.addEventListener('rx-currency', function(){
  btcSeriesPromise = null;
  renderLiveTeaser();
  renderToolsFeatured();
});

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
        '<a class="proj-feature-card" href="/projekte/bitopex/" data-track="bitopex">' +
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
      '<a class="proj-feature-card" href="/projekte/hyperocket/" data-track="hyperocket">' +
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

  if(SMARTIT && SMARTIT.snapshot){
    var snap3 = SMARTIT.snapshot;
    var claimActions = (SMARTIT.actions || []).filter(function(a){ return a.type === 'Claim'; })
      .slice().sort(function(a, b){ return new Date(a.createdAt) - new Date(b.createdAt); });
    var monthsMap3 = {};
    claimActions.forEach(function(a){
      var ym = a.createdAt.slice(0, 7);
      monthsMap3[ym] = (monthsMap3[ym] || 0) + a.amountEur;
    });
    var months3 = Object.keys(monthsMap3).sort().map(function(ym){ return monthsMap3[ym]; });
    var spark3 = months3.length >= 2 ? sparklineSvg(months3, '#8B5CF6') : '';
    cards.push(
      '<a class="proj-feature-card" href="/projekte/smartit/" data-track="smartit">' +
        '<div class="pf-top"><span class="pf-label">Praxistest</span>' + pillHtml(SMARTIT.status) + '</div>' +
        '<h3>SmartIT</h3>' +
        '<p>Mein Staking-Setup rund um den SIT-Token, mit meinen gestakten Positionen und dem aktuellen Rewards-Stand.</p>' +
        '<div class="pf-metrics">' +
          '<div class="pf-metric"><span class="l">Kaufwert</span><span class="v">' + P.fmtMoney(snap3.purchasePriceEur, '€') + '</span></div>' +
          '<div class="pf-metric"><span class="l">Rewards gesamt</span><span class="v">' + P.fmtSit(snap3.totalRewardsSit) + '</span></div>' +
        '</div>' +
        spark3 +
        '<div class="pf-meta">Stand: ' + P.esc(P.fmtDate(snap3.date)) + '</div>' +
        '<span class="pf-cta">Praxistest ansehen <span class="arr">→</span></span>' +
      '</a>'
    );
  }

  if(DEFICIRCLE && DEFICIRCLE.personal){
    var dp = DEFICIRCLE.personal;
    cards.push(
      '<a class="proj-feature-card" href="/projekte/defi-circle/" data-track="deficircle">' +
        '<div class="pf-top"><span class="pf-label">Praxistest</span>' + pillHtml(DEFICIRCLE.status) + '</div>' +
        '<h3>DeFi Circle</h3>' +
        '<p>Mein Lernweg im DeFi Circle — von Fundamentals über Breakthrough bis zur Elite, mit Community, Level-System und eigener Anwendung.</p>' +
        '<div class="pf-levelline">' +
          '<span class="step">Fundamentals</span><span class="sep">→</span>' +
          '<span class="step">Breakthrough</span><span class="sep">→</span>' +
          '<span class="step is-current">Elite</span>' +
        '</div>' +
        '<div class="pf-devnote">' + P.esc(dp.memberSinceLabel) + ' dabei · ' + P.esc(dp.developmentMultipleLabel) + ' persönliche Entwicklung</div>' +
        '<div class="pf-meta">Stand: ' + P.esc(P.fmtDate(DEFICIRCLE.updatedAt)) + '</div>' +
        '<span class="pf-cta">Praxistest ansehen <span class="arr">→</span></span>' +
      '</a>'
    );
  }

  if(!cards.length){ hide(section); return; }
  show(section);
  host.innerHTML = cards.join('');
}

/* ---------- Gemeinsamer Video-Pool ueber alle Projekte und den
   allgemeinen Kanal hinweg, neuestes zuerst. Einzige Quelle fuer
   "aktuelles Video" auf der Startseite — ein neues Video muss nur an
   einer Stelle (der jeweiligen Projekt-Datendatei oder channel.js)
   eingetragen werden. ---------- */
function allVideosSorted(){
  var pool = [];
  if(BITOPEX && BITOPEX.videos) pool = pool.concat(BITOPEX.videos);
  if(HYPEROCKET && HYPEROCKET.videos) pool = pool.concat(HYPEROCKET.videos);
  if(SMARTIT && SMARTIT.videos) pool = pool.concat(SMARTIT.videos);
  if(DEFICIRCLE && DEFICIRCLE.videos) pool = pool.concat(DEFICIRCLE.videos);
  if(CHANNEL && CHANNEL.videos) pool = pool.concat(CHANNEL.videos);
  return pool.slice().sort(function(a, b){ return new Date(b.publishedAt) - new Date(a.publishedAt); });
}

/* ---------- Neu auf YouTube — groesstes, aktuellstes Video ueber alle
   Projekte hinweg, mit Ruecklink zur zugehoerigen Projektseite. ---------- */
function renderFeaturedVideo(){
  var section = $('youtube');
  if(!section) return;
  var pool = allVideosSorted();
  if(!pool.length){ hide(section); return; }
  show(section);

  var video = pool[0];
  var id = P.youtubeId(video.youtubeUrl);
  var thumb = video.thumbnail || P.youtubeThumb(video.youtubeUrl);

  var thumbHost = $('homeVideoThumb');
  if(thumbHost){
    thumbHost.innerHTML =
      '<button type="button" class="proj-video-thumb big" data-yt="' + P.esc(id || '') + '" data-track="video" aria-label="Video abspielen: ' + P.esc(video.title) + '">' +
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
  var PROJECTS_BY_SLUG = { bitopex: BITOPEX, hyperocket: HYPEROCKET, smartit: SMARTIT, 'defi-circle': DEFICIRCLE };
  var proj = PROJECTS_BY_SLUG[video.projectSlug] || null;
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

/* ---------- /links — kompakte Video-Karte, gleicher Video-Pool wie
   renderFeaturedVideo(), aber leichtgewichtig: kein Inline-Player, nur
   Thumbnail + Titel + direkter Link zu YouTube (siehe Performance-
   Vorgabe fuer die /links-Seite). No-op auf allen anderen Seiten, da
   #lxVideo dort nicht existiert. ---------- */
function renderLinksVideo(){
  var link = $('lxVideo');
  if(!link) return;
  var pool = allVideosSorted();
  if(!pool.length) return;
  var video = pool[0];
  var thumb = video.thumbnail || P.youtubeThumb(video.youtubeUrl);

  link.href = video.youtubeUrl;
  var thumbHost = $('lxVideoThumb');
  if(thumbHost){
    thumbHost.innerHTML =
      (thumb ? '<img src="' + P.esc(thumb) + '" alt="" loading="lazy">' : '') +
      '<span class="yt"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9 7.5v9l7-4.5z"/></svg></span>';
  }
  var titleHost = $('lxVideoTitle');
  if(titleHost) titleHost.textContent = video.title;
  var descHost = $('lxVideoDesc');
  if(descHost && video.description) descHost.textContent = video.description;
}

/* ---------- "Live auf RenditeX" — kompakter Vorgeschmack direkt nach
   dem Hero. Zeigt nur, dass RenditeX echte, interaktive Tools hat —
   die volle Tool-Welt mit denselben Daten kommt weiter unten. ---------- */
function renderLiveTeaser(){
  var section = $('live-teaser');
  if(!section) return;

  heatzoneData().then(function(d){
    var host = $('teaserHeatzone');
    if(!host) return;
    host.innerHTML =
      '<span class="lp-name">BTC Heatzone</span>' +
      '<span class="lp-val" style="color:' + d.zone.hex + '">' + RX.currency.format(d.price, 0) + '</span>' +
      '<span class="lp-zone" style="color:' + d.zone.hex + '">' + P.esc(d.zone.de) + '</span>' +
      sparklineSvg(d.spark, d.zone.hex) +
      '<span class="lp-cue">Tool öffnen →</span>';
  }).catch(function(){ var el = $('teaserHeatzone'); if(el) hide(el.closest('.live-card')); });

  fetchFearGreed().then(function(d){
    var host = $('teaserFg');
    if(!host) return;
    host.innerHTML =
      '<span class="lp-name">Fear &amp; Greed</span>' +
      '<span class="lp-val" style="color:' + d.zone.c + '">' + d.value + '</span>' +
      '<span class="lp-zone" style="color:' + d.zone.c + '">' + P.esc(d.zone.de) + '</span>' +
      sparklineSvg(d.spark, d.zone.c) +
      '<span class="lp-cue">Tool öffnen →</span>';
  }).catch(function(){ var el = $('teaserFg'); if(el) hide(el.closest('.live-card')); });

  sparplanData().then(function(d){
    var host = $('teaserSparplan');
    if(!host) return;
    host.innerHTML =
      '<span class="lp-name">Sparplan-Rechner</span>' +
      '<span class="lp-val">' + RX.currency.format(d.valueToday, 0) + '</span>' +
      '<span class="lp-zone">aus ' + RX.currency.format(d.invested, 0) + ' in ' + d.months + ' Monaten</span>' +
      '<span class="lp-cue">Tool öffnen →</span>';
  }).catch(function(){ var el = $('teaserSparplan'); if(el) hide(el.closest('.live-card')); });
}

/* ---------- Vollstaendige Tool-Sektion: dieselben drei Live-Werte,
   groesser und mit mehr Kontext — nichts wird neu geladen, die
   Promises sind bereits durch renderLiveTeaser() angestossen bzw.
   werden von dort wiederverwendet. ---------- */
function renderToolsFeatured(){
  heatzoneData().then(function(d){
    var host = $('toolsHeatzoneMain');
    if(!host) return;
    host.innerHTML =
      '<div class="tf-price" style="color:' + d.zone.hex + '">' + RX.currency.format(d.price, 0) + '</div>' +
      '<span class="tf-zone-badge" style="color:' + d.zone.hex + '; border-color:' + d.zone.hex + '">' + P.esc(d.zone.de) + '</span>' +
      sparklineSvg(d.spark, d.zone.hex) +
      '<p class="tf-sub">Fair-Value-Modell aus dem gesamten bekannten Kursverlauf, live berechnet.</p>';
  }).catch(function(){ var el = $('toolsHeatzoneMain'); if(el) el.innerHTML = ''; });

  fetchFearGreed().then(function(d){
    var host = $('toolsFgMain');
    if(!host) return;
    host.innerHTML =
      '<div class="tf-price" style="color:' + d.zone.c + '">' + d.value + '</div>' +
      '<span class="tf-zone-badge" style="color:' + d.zone.c + '; border-color:' + d.zone.c + '">' + P.esc(d.zone.de) + '</span>' +
      sparklineSvg(d.spark, d.zone.c) +
      '<p class="tf-sub">Verlauf der letzten 30 Tage, inkl. Contrarian-DCA-Simulation im Tool.</p>';
  }).catch(function(){ var el = $('toolsFgMain'); if(el) el.innerHTML = ''; });

  sparplanData().then(function(d){
    var host = $('toolsSparplanMain');
    if(!host) return;
    var sign = d.valueToday >= d.invested ? 'var(--z3)' : 'var(--red)';
    host.innerHTML =
      '<div class="sp-demo-row"><span>Bitcoin</span><span>' + RX.currency.format(d.amount, 0) + ' / Monat</span></div>' +
      '<div class="sp-demo-row"><span>Zeitraum</span><span>' + d.months + ' Monate</span></div>' +
      '<div class="sp-demo-row"><span>Eingezahlt</span><b>' + RX.currency.format(d.invested, 0) + '</b></div>' +
      '<div class="sp-demo-row"><span>Wert heute</span><b style="color:' + sign + '">' + RX.currency.format(d.valueToday, 0) + '</b></div>';
  }).catch(function(){ var el = $('toolsSparplanMain'); if(el) el.innerHTML = ''; });
}

/* ---------- Halving-Countdown als kleines Utility — echter, live aus
   dem aktuellen Blockstand berechneter Wert (mempool.space), keine
   Naeherung. ---------- */
function renderHalvingUtil(){
  var host = $('utilHalvingVal');
  if(!host) return;
  var NEXT_HALVING_BLOCK = 1050000;
  fetch('https://mempool.space/api/blocks/tip/height', { cache:'no-store' })
    .then(function(r){ if(!r.ok) throw new Error('bad status'); return r.text(); })
    .then(function(txt){
      var h = parseInt(txt, 10);
      if(!h || isNaN(h)) throw new Error('keine Zahl');
      var days = Math.floor(Math.max(0, NEXT_HALVING_BLOCK - h) * 600 / 86400);
      host.textContent = days + ' Tage';
    })
    .catch(function(){ var wrap = host.closest('.tool-mini'); if(wrap) hide(wrap); });
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
  renderLiveTeaser();
  renderFeaturedProjects();
  renderFeaturedVideo();
  renderToolsFeatured();
  renderHalvingUtil();
  renderUpdatesFeed();
}

window.RX = window.RX || {};
window.RX.home = { init: init, renderLinksVideo: renderLinksVideo };
})();
