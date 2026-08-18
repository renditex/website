/* ============================================================
   RenditeX — Projektseiten-System (Bitopex & weitere)
   Eine Seite = statisches HTML-Grundgerüst mit leeren Containern
   (IDs) + ein Datenobjekt pro Projekt. Dieses Skript rendert daraus
   alle dynamischen Bereiche. Neue Projektseite = Ordner kopieren,
   Datenobjekt austauschen, fertig — kein zweiter Code-Pfad nötig.

   Grundsatz: keine Inhalte erfinden UND keine sichtbaren Platzhalter.
   Fehlt ein Datenfeld, wird der jeweilige Bereich komplett
   ausgeblendet statt einen "folgt in Kürze"-Hinweis zu zeigen.
   ============================================================ */
(function(){
"use strict";

function $(id){ return document.getElementById(id); }
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function hide(el){ if(el) el.hidden = true; }
function show(el){ if(el) el.hidden = false; }

var STATUS = {
  active:   { label:'Aktiv',       color:'var(--z3)' },
  watching: { label:'Beobachtung', color:'var(--z2)' },
  paused:   { label:'Pausiert',    color:'var(--muted-2)' },
  ended:    { label:'Beendet',     color:'var(--z0)' }
};

function fmtDate(iso){
  if(!iso) return '—';
  var d = new Date(iso.length <= 7 ? iso + '-01' : iso + 'T00:00:00');
  if(isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'});
}
function fmtMonthYear(iso){
  if(!iso) return '—';
  var d = new Date(iso + '-01T00:00:00');
  if(isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', {month:'long', year:'numeric'});
}
function fmtPct(v){
  if(v == null || isNaN(v)) return '—';
  var sign = v >= 0 ? '+' : '';
  return sign + v.toFixed(2).replace('.', ',') + ' %';
}

function youtubeId(url){
  if(!url) return null;
  var m = String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  return m ? m[1] : null;
}
function youtubeThumb(url, fallback){
  var id = youtubeId(url);
  return id ? ('https://i.ytimg.com/vi/' + id + '/hqdefault.jpg') : (fallback || null);
}
var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="rgba(11,22,56,.72)"/><path d="M10 8.2v7.6l6-3.8-6-3.8z" fill="#fff"/></svg>';

/* ---------- Aktuellste Kennzahl je Serie, aus weeklyPerformance ---------- */
function latestPerformance(data){
  var pts = data.weeklyPerformance;
  if(!pts || !pts.length) return null;
  var sorted = pts.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  return sorted[0];
}

/* ---------- Hero-Metazeile: Status, Testbeginn, Schwerpunkt, Stand ---------- */
function renderHeroMeta(el, data){
  if(!el) return;
  var s = STATUS[data.status] || STATUS.active;
  var parts = [esc(s.label)];
  if(data.testStartedAt) parts.push('Live-Test seit ' + esc(fmtMonthYear(data.testStartedAt)));
  if(data.focusLabel) parts.push(esc(data.focusLabel));
  parts.push('Stand: ' + esc(fmtDate(data.updatedAt)));
  el.innerHTML = parts.join(' <span>·</span> ');
}

/* ---------- Wochenperformance: Karten + Chart + Liste ---------- */
var perfChart = null;
function cssVar(name, host){ return getComputedStyle(host).getPropertyValue(name).trim(); }

function renderPerformanceSection(section, data){
  if(!section) return;
  var series = data.performanceSeries;
  var pts = data.weeklyPerformance;
  if(!series || !series.length || !pts || !pts.length){ hide(section); return; }
  show(section);

  var sortedDesc = pts.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  var latest = sortedDesc[0];

  // Zwei (oder mehr) hervorgehobene Karten mit dem jeweils neuesten Wert
  var cardsHost = $('projPerfCards');
  if(cardsHost){
    cardsHost.innerHTML = series.map(function(s){
      var v = latest[s.key];
      var up = v >= 0;
      return '<div class="pcard" style="--pc:' + s.color + '">' +
        '<div class="pcard-k">' + esc(s.label) + '</div>' +
        '<div class="pcard-v" style="color:' + (up ? 'var(--z3)' : 'var(--red)') + '">' + fmtPct(v) + '</div>' +
        '<div class="pcard-d">Letztes Update: ' + esc(fmtDate(latest.date)) + '</div>' +
      '</div>';
    }).join('');
  }

  // Chart
  var chartHost = $('projPerfChart');
  if(chartHost && window.LightweightCharts){
    chartHost.innerHTML = '';
    if(perfChart){ perfChart.remove(); perfChart = null; }
    var box = chartHost.getBoundingClientRect();
    var width = Math.round(box.width) || 600, height = Math.round(box.height) || 300;
    perfChart = LightweightCharts.createChart(chartHost, {
      width: width, height: height,
      layout: { background:{color:'transparent'}, textColor:cssVar('--muted-2', chartHost), fontFamily:'IBM Plex Mono, monospace', fontSize:11.5 },
      localization: { priceFormatter: fmtPct },
      grid: { vertLines:{color:cssVar('--line', chartHost)}, horzLines:{color:cssVar('--line', chartHost)} },
      rightPriceScale: { borderColor:cssVar('--line-soft', chartHost) },
      timeScale: { borderColor:cssVar('--line-soft', chartHost), rightOffset:1 },
      crosshair: { mode: LightweightCharts.CrosshairMode.Magnet },
      handleScroll:false, handleScale:false
    });
    var sortedAsc = pts.slice().sort(function(a,b){ return new Date(a.date) - new Date(b.date); });
    var toLwTime = function(t){ return new Date(t + 'T00:00:00').toISOString().slice(0,10); };
    var lwSeries = series.map(function(s){
      var line = perfChart.addLineSeries({ color:s.color, lineWidth:2.25, priceLineVisible:false });
      line.setData(sortedAsc.map(function(p){ return { time:toLwTime(p.date), value:p[s.key] }; }));
      return line;
    });
    perfChart.timeScale().fitContent();

    var tip = $('projPerfTip');
    if(tip){
      perfChart.subscribeCrosshairMove(function(param){
        if(!param.point){ tip.style.opacity = 0; return; }
        var lines = series.map(function(s, i){
          var d = param.seriesData && param.seriesData.get(lwSeries[i]);
          return d ? '<div class="td" style="color:' + s.color + '">' + esc(s.label) + ': ' + fmtPct(d.value) + '</div>' : '';
        }).join('');
        if(!lines){ tip.style.opacity = 0; return; }
        tip.innerHTML = lines + '<div class="td">' + fmtDate(param.time) + '</div>';
        tip.style.left = param.point.x + 'px';
        tip.style.top = param.point.y + 'px';
        tip.style.opacity = 1;
      });
    }
  }

  // Vollständige Liste, neueste zuerst
  var listHost = $('projPerfList');
  if(listHost){
    listHost.innerHTML = sortedDesc.map(function(p){
      return '<div class="prow"><div class="prow-d">' + esc(fmtDate(p.date)) + '</div>' +
        '<div class="prow-vals">' + series.map(function(s){
          var v = p[s.key], up = v >= 0;
          return '<span><b style="color:' + (up?'var(--z3)':'var(--red)') + '">' + fmtPct(v) + '</b> <i>' + esc(s.label) + '</i></span>';
        }).join('') + '</div></div>';
    }).join('');
  }
}

/* ---------- Timeline: fester, kuratierter Verlauf ---------- */
function renderTimeline(host, data){
  if(!host) return;
  var items = data.timeline || [];
  if(!items.length){ hide(host.closest('section')); return; }
  host.innerHTML = items.map(function(u){
    return '<div class="proj-update">' +
      '<div class="proj-update-date">' + esc(u.dateLabel || fmtDate(u.date)) + '</div>' +
      '<h3>' + esc(u.title) + '</h3>' +
      (u.text ? '<p>' + esc(u.text) + '</p>' : '') +
    '</div>';
  }).join('');
}

/* ---------- Video: Auswahl des Hauptvideos ----------
   Explizit markiertes featured:true gewinnt, sonst automatisch das
   neueste nach publishedAt. */
function pickFeaturedVideo(videos){
  if(!videos || !videos.length) return null;
  var explicit = videos.filter(function(v){ return v.featured; })[0];
  if(explicit) return explicit;
  return videos.slice().sort(function(a,b){ return new Date(b.publishedAt) - new Date(a.publishedAt); })[0];
}

/* ---------- Grosses Hauptvideo — eigener, prominenter Bereich direkt
   nach dem Hero. Darunter die kompakte "seit diesem Video"-Brücke
   zu den aktuellen Zahlen. ---------- */
function renderFeaturedVideo(section, data){
  if(!section) return;
  var featured = pickFeaturedVideo(data.videos);
  if(!featured){ hide(section); return; }
  show(section);
  var fId = youtubeId(featured.youtubeUrl);
  var fThumb = featured.thumbnail || youtubeThumb(featured.youtubeUrl);

  var videoHost = $('projFeaturedVideo');
  if(videoHost){
    videoHost.innerHTML =
      '<button type="button" class="proj-video-thumb big" data-yt="' + esc(fId || '') + '" aria-label="Video abspielen: ' + esc(featured.title) + '">' +
        (fThumb ? '<img src="' + esc(fThumb) + '" alt="" loading="lazy">' : '') +
        '<span class="play">' + PLAY_ICON + '</span>' +
      '</button>';
  }

  var metaHost = $('projFeaturedMeta');
  if(metaHost){
    metaHost.innerHTML =
      '<h3>' + esc(featured.title) + '</h3>' +
      (featured.description ? '<p>' + esc(featured.description) + '</p>' : '') +
      (featured.publishedAt ? '<div class="proj-video-dates"><span>Video veröffentlicht: <b>' + esc(fmtDate(featured.publishedAt)) + '</b></span></div>' : '');
  }

  renderSinceVideo($('projSinceVideo'), data, featured);
}

/* ---------- Brücke "Seit diesem Video passiert" ----------
   Zeigt, je nachdem was an echten Daten vorliegt, entweder die
   praezisen Wochenwerte (Bitopex-Stil: weeklyPerformance) oder,
   falls nur ein aktueller Datenstand ohne Zeitreihe existiert,
   eine schlankere, rein qualitative Variante. Rendert nichts,
   wenn kein echter Datenpunkt neuer ist als das Video. ---------- */
function renderSinceVideo(host, data, featured){
  if(!host) return;
  if(!featured || !featured.publishedAt){ hide(host); return; }
  var vidDate = new Date(featured.publishedAt);
  var series = data.performanceSeries;
  var pts = data.weeklyPerformance;
  var hasSeries = pts && pts.length && series && series.length;
  var newerPts = hasSeries ? pts.filter(function(p){ return new Date(p.date) > vidDate; }) : [];

  if(hasSeries && newerPts.length){
    var latest = latestPerformance(data);
    var metrics = series.map(function(s){
      var v = latest[s.key], up = v >= 0;
      return '<div class="proj-since-item"><span class="l">' + esc(s.label) + ' zuletzt</span>' +
        '<span class="v" style="color:' + (up ? 'var(--z3)' : 'var(--red)') + '">' + fmtPct(v) + '</span></div>';
    }).join('');
    show(host);
    host.innerHTML =
      '<div class="proj-since-head">Seit diesem Video passiert</div>' +
      '<div class="proj-since-row">' +
        '<div class="proj-since-item"><span class="l">Neue Updates</span><span class="v">' + newerPts.length + '</span></div>' +
        '<div class="proj-since-item"><span class="l">Letztes Update</span><span class="v">' + esc(fmtDate(latest.date)) + '</span></div>' +
        metrics +
        '<a class="proj-since-link" href="#projPerformance">Alle Updates ansehen ↓</a>' +
      '</div>';
    return;
  }

  // Qualitative Variante: kein Zeitreihen-Datensatz, aber ein echter,
  // neuerer Datenstand als das Video.
  var hasFreshStand = data.updatedAt && new Date(data.updatedAt) > vidDate;
  if(!hasFreshStand){ hide(host); return; }
  show(host);
  var s = STATUS[data.status] || STATUS.active;
  host.innerHTML =
    '<div class="proj-since-head">Seit diesem Video passiert</div>' +
    '<div class="proj-since-row">' +
      '<div class="proj-since-item"><span class="l">Status</span><span class="v">' + esc(s.label) + '</span></div>' +
      '<div class="proj-since-item"><span class="l">Aktueller Datenstand</span><span class="v">' + esc(fmtDate(data.updatedAt)) + '</span></div>' +
      '<a class="proj-since-link" href="#einschaetzung">Meine Einschätzung lesen ↓</a>' +
    '</div>';
}

/* ---------- Weitere Videos + Interview — gemeinsamer Bereich,
   jeder Teilblock blendet sich unabhaengig aus, wenn keine Daten da sind. ---------- */
function renderMoreSection(section, data){
  if(!section) return;
  var videos = data.videos;
  var featured = pickFeaturedVideo(videos);
  var rest = (videos || [])
    .filter(function(v){ return v !== featured; })
    .sort(function(a,b){ return new Date(b.publishedAt) - new Date(a.publishedAt); })
    .slice(0, 4);

  var gridWrap = $('projVideoGridWrap');
  if(rest.length){
    show(gridWrap);
    var gridHost = $('projVideoGrid');
    if(gridHost){
      gridHost.innerHTML = rest.map(function(v){
        var thumb = v.thumbnail || youtubeThumb(v.youtubeUrl);
        return '<a class="proj-video-card" href="' + esc(v.youtubeUrl) + '" target="_blank" rel="noopener">' +
          '<span class="proj-video-thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '') + '<span class="play">' + PLAY_ICON + '</span></span>' +
          '<div class="body"><h4>' + esc(v.title) + '</h4><div class="date">' + fmtDate(v.publishedAt) + '</div></div>' +
        '</a>';
      }).join('');
    }
  } else {
    hide(gridWrap);
  }

  var interview = data.interview;
  var interviewWrap = $('projInterviewBlock');
  if(interview && interview.youtubeUrl){
    show(interviewWrap);
    var thumb = interview.thumbnail || youtubeThumb(interview.youtubeUrl);
    var host = $('projInterview');
    if(host){
      host.innerHTML =
        '<a class="proj-video-card" href="' + esc(interview.youtubeUrl) + '" target="_blank" rel="noopener" style="max-width:420px">' +
          '<span class="proj-video-thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '') + '<span class="play">' + PLAY_ICON + '</span></span>' +
          '<div class="body"><h4>' + esc(interview.title || 'Im Gespräch mit Bitopex') + '</h4></div>' +
        '</a>';
    }
  } else {
    hide(interviewWrap);
  }

  section.hidden = !(rest.length || (interview && interview.youtubeUrl));
}

document.addEventListener('click', function(e){
  var btn = e.target.closest('.proj-video-thumb[data-yt]');
  if(!btn) return;
  var id = btn.getAttribute('data-yt');
  if(!id) return;
  var wrap = document.createElement('span');
  wrap.className = 'proj-video-thumb';
  wrap.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1" title="YouTube Video" ' +
    'style="position:absolute;inset:0;width:100%;height:100%;border:0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
  btn.replaceWith(wrap);
});

/* ---------- Punkte (Einschätzung: was interessant / was wissen) ---------- */
function renderPoints(host, items, icon, color){
  if(!host) return;
  if(!items || !items.length){ hide(host); return; }
  show(host);
  host.innerHTML = items.map(function(it){
    return '<div class="proj-point"><span class="ic" style="--pc:' + color + '">' + icon + '</span>' +
      '<div><h4>' + esc(it.title) + '</h4><p>' + esc(it.text) + '</p></div></div>';
  }).join('');
}

/* ---------- Risiken ---------- */
function renderRisks(host, risks){
  if(!host) return;
  host.innerHTML = (risks || []).map(function(r){
    return '<div class="limit"><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></div>';
  }).join('');
}

/* ---------- FAQ ---------- */
function renderFaq(host, faq){
  if(!host) return;
  host.innerHTML = (faq || []).map(function(f){
    return '<details><summary>' + esc(f.q) + '<span class="plus">+</span></summary><div class="body">' + esc(f.a) + '</div></details>';
  }).join('');
}

/* ---------- Weiterführende Inhalte ---------- */
function renderRelated(host, items){
  if(!host) return;
  host.innerHTML = (items || []).map(function(r){
    return '<a class="note" href="' + esc(r.href) + '">' +
      (r.kicker ? '<div class="kicker">' + esc(r.kicker) + '</div>' : '') +
      '<h3>' + esc(r.label) + '</h3><p>' + esc(r.desc) + '</p></a>';
  }).join('');
}

/* ---------- Master-Init ---------- */
function init(data){
  renderHeroMeta($('projUpdatedHero'), data);

  renderFeaturedVideo($('hauptvideo'), data);
  renderPerformanceSection($('projPerformance'), data);
  renderTimeline($('projTimeline'), data);
  renderMoreSection($('weitere-videos'), data);

  if($('projAssessText')) $('projAssessText').textContent = data.currentAssessment || '';
  renderPoints($('projPositives'), data.positives, '✓', 'var(--brand)');
  renderPoints($('projConsiderations'), data.considerations, '!', 'var(--z2)');
  var assessSection = $('einschaetzung');
  if(assessSection){
    var hasAny = data.currentAssessment || (data.positives && data.positives.length) || (data.considerations && data.considerations.length);
    assessSection.hidden = !hasAny;
  }

  renderRisks($('projRisks'), data.risks);
  renderFaq($('projFaq'), data.faq);
  renderRelated($('projRelated'), data.related);

  if($('projCtaName')) $('projCtaName').textContent = data.name;
  var ctaSection = $('cta');
  if(ctaSection){
    if(data.websiteUrl){
      show(ctaSection);
      var ctaBtn = $('projCtaBtn');
      if(ctaBtn) ctaBtn.href = data.websiteUrl;
      var affTag = $('projAffiliateTag');
      if(affTag) affTag.hidden = !data.affiliate;
    } else {
      hide(ctaSection);
    }
  }

  var ld = document.getElementById('projJsonLd');
  if(ld){
    try{
      var obj = JSON.parse(ld.textContent);
      obj.dateModified = data.updatedAt;
      ld.textContent = JSON.stringify(obj);
    }catch(e){}
  }

  window.addEventListener('resize', function(){ renderPerformanceSection($('projPerformance'), data); });
}

window.RX = window.RX || {};
window.RX.project = { init: init, STATUS: STATUS, fmtDate: fmtDate, fmtPct: fmtPct };
})();
