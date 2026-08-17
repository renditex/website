/* ============================================================
   RenditeX — Projektseiten-System (Bitopex & weitere)
   Eine Seite = statisches HTML-Grundgerüst mit leeren Containern
   (IDs) + ein Datenobjekt pro Projekt. Dieses Skript rendert daraus
   alle dynamischen Bereiche. Neue Projektseite = Ordner kopieren,
   Datenobjekt austauschen, fertig — kein zweiter Code-Pfad nötig.

   Grundsatz: keine Inhalte erfinden. Fehlt ein Datenfeld (leeres
   Array, null), zeigt der jeweilige Bereich einen ehrlichen
   Platzhalter statt erfundener Inhalte.
   ============================================================ */
(function(){
"use strict";

function $(id){ return document.getElementById(id); }
function esc(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

var STATUS = {
  active:   { label:'Aktiv',       color:'var(--z3)' },
  watching: { label:'Beobachtung', color:'var(--z2)' },
  paused:   { label:'Pausiert',    color:'var(--muted-2)' },
  ended:    { label:'Beendet',     color:'var(--z0)' }
};

var UPDATE_TYPE_COLOR = {
  positive: 'var(--z3)',
  neutral:  'var(--muted-2)',
  change:   'var(--brand)',
  risk:     'var(--z0)',
  opinion:  'var(--z2)',
  video:    'var(--brand)'
};

function fmtDate(iso){
  if(!iso) return '—';
  var d = new Date(iso.length <= 7 ? iso + '-01' : iso + 'T00:00:00');
  if(isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit', year:'numeric'});
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

/* ---------- Status-Pille (Hero + Statuskarte) ---------- */
function statusPillHtml(status){
  var s = STATUS[status] || STATUS.active;
  return '<span class="proj-pill" style="--sc:' + s.color + '"><span class="dot"></span>Status: ' + esc(s.label) + '</span>';
}

/* ---------- Snapshot-Kennzahlen (nutzt .stats/.stat wieder) ---------- */
function renderStats(host, stats){
  if(!host) return;
  if(!stats || !stats.length){ host.hidden = true; return; }
  host.hidden = false;
  host.innerHTML = stats.map(function(s){
    return '<div class="stat"><div class="k">' + esc(s.k) + '</div><div class="n">' + esc(s.v) + '</div></div>';
  }).join('');
}

/* ---------- Updates-Timeline ---------- */
function renderUpdates(host, updates, projectName){
  if(!host) return;
  if(!updates || !updates.length){
    host.innerHTML = '<div class="proj-empty">Hier sammle ich laufend Updates zu ' + esc(projectName) + ' — der erste Eintrag folgt, sobald es etwas Neues zu berichten gibt.</div>';
    return;
  }
  var sorted = updates.slice().sort(function(a,b){ return new Date(b.date) - new Date(a.date); });
  host.innerHTML = sorted.map(function(u){
    var color = UPDATE_TYPE_COLOR[u.type] || 'var(--brand)';
    return '<div class="proj-update" style="--uc:' + color + '">' +
      '<div class="proj-update-date">' + fmtDate(u.date) + '</div>' +
      '<h3>' + esc(u.title) + '</h3>' +
      (u.text ? '<p>' + esc(u.text) + '</p>' : '') +
      (u.tags && u.tags.length ? '<div class="proj-tags">' + u.tags.map(function(t){ return '<span class="proj-tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
    '</div>';
  }).join('');
}

/* ---------- Videos: Featured (klick-to-embed) + Grid (Link raus) ---------- */
function renderVideos(hostFeatured, hostGrid, videos, channelUrl, projectName){
  if(!hostFeatured) return;
  if(!videos || !videos.length){
    hostFeatured.innerHTML = '<div class="proj-empty">Videos zu ' + esc(projectName) + ' erscheinen hier, sobald sie veröffentlicht sind. Bis dahin: <a href="' + esc(channelUrl) + '" target="_blank" rel="noopener">mein YouTube-Kanal</a>.</div>';
    if(hostGrid) hostGrid.innerHTML = '';
    return;
  }
  var sorted = videos.slice().sort(function(a,b){ return new Date(b.publishedAt) - new Date(a.publishedAt); });
  var featured = sorted.filter(function(v){ return v.featured; })[0] || sorted[0];
  var rest = sorted.filter(function(v){ return v !== featured; }).slice(0, 4);
  var fId = youtubeId(featured.youtubeUrl);
  var fThumb = featured.thumbnail || youtubeThumb(featured.youtubeUrl);

  hostFeatured.innerHTML =
    '<button type="button" class="proj-video-thumb" data-yt="' + esc(fId || '') + '" aria-label="Video abspielen: ' + esc(featured.title) + '">' +
      (fThumb ? '<img src="' + esc(fThumb) + '" alt="" loading="lazy">' : '') +
      '<span class="play">' + PLAY_ICON + '</span>' +
    '</button>' +
    '<div>' +
      '<div class="kicker">Aktuellstes Video</div>' +
      '<h3>' + esc(featured.title) + '</h3>' +
      '<div class="date">' + fmtDate(featured.publishedAt) + '</div>' +
      (featured.description ? '<p>' + esc(featured.description) + '</p>' : '') +
      '<div style="margin-top:16px"><a class="btn primary" href="' + esc(featured.youtubeUrl) + '" target="_blank" rel="noopener">Video ansehen</a></div>' +
    '</div>';

  if(hostGrid){
    hostGrid.innerHTML = rest.map(function(v){
      var thumb = v.thumbnail || youtubeThumb(v.youtubeUrl);
      return '<a class="proj-video-card" href="' + esc(v.youtubeUrl) + '" target="_blank" rel="noopener">' +
        '<span class="proj-video-thumb">' + (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '') + '<span class="play">' + PLAY_ICON + '</span></span>' +
        '<div class="body"><h4>' + esc(v.title) + '</h4><div class="date">' + fmtDate(v.publishedAt) + '</div></div>' +
      '</a>';
    }).join('');
  }
}

/* Klick auf das große Vorschaubild: erst dann laedt das eingebettete
   Video (youtube-nocookie) — spart Ladezeit fuer alle, die nicht klicken. */
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

/* ---------- Pro-Punkte / Was man wissen sollte ---------- */
function renderPoints(host, items, icon, color, emptyText){
  if(!host) return;
  if(!items || !items.length){
    host.innerHTML = '<div class="proj-empty">' + esc(emptyText) + '</div>';
    return;
  }
  host.innerHTML = items.map(function(it){
    return '<div class="proj-point"><span class="ic" style="--pc:' + color + '">' + icon + '</span>' +
      '<div><h4>' + esc(it.title) + '</h4><p>' + esc(it.text) + '</p></div></div>';
  }).join('');
}

/* ---------- Risiken (nutzt .limits/.limit wieder) ---------- */
function renderRisks(host, risks){
  if(!host) return;
  host.innerHTML = (risks || []).map(function(r){
    return '<div class="limit"><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></div>';
  }).join('');
}

/* ---------- Zielgruppe ---------- */
function renderList(host, items){
  if(!host) return;
  host.innerHTML = (items || []).map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('');
}

/* ---------- FAQ (nutzt .acc wieder) ---------- */
function renderFaq(host, faq){
  if(!host) return;
  host.innerHTML = (faq || []).map(function(f){
    return '<details><summary>' + esc(f.q) + '<span class="plus">+</span></summary><div class="body">' + esc(f.a) + '</div></details>';
  }).join('');
}

/* ---------- Weiterführende Inhalte (nutzt .note wieder) ---------- */
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
  // Hero-Status + zuletzt aktualisiert — eine Quelle (data.updatedAt), nicht mehrfach pflegen
  if($('projStatusHero')) $('projStatusHero').innerHTML = statusPillHtml(data.status);
  if($('projUpdatedHero')) $('projUpdatedHero').textContent = 'Zuletzt aktualisiert: ' + fmtDate(data.updatedAt);

  renderStats($('projSnapshot'), data.stats);

  // Statuskarte "Mein aktueller Stand"
  if($('projAssessSummary')) $('projAssessSummary').textContent = data.summary || '';
  if($('projStatusCard')) $('projStatusCard').innerHTML = statusPillHtml(data.status);
  if($('projAssessText')) $('projAssessText').textContent = data.currentAssessment || 'Ich sammle hier laufend weitere Erfahrungen und ergänze diese Einschätzung, sobald sich der Stand ändert.';
  if($('projAssessUpdated')) $('projAssessUpdated').textContent = fmtDate(data.updatedAt);
  var nextCheckRow = $('projNextCheckRow');
  if(nextCheckRow){
    if(data.nextCheck){ nextCheckRow.hidden = false; $('projNextCheck').textContent = fmtDate(data.nextCheck); }
    else { nextCheckRow.hidden = true; }
  }

  renderUpdates($('projUpdates'), data.updates, data.name);
  renderVideos($('projVideoFeatured'), $('projVideoGrid'), data.videos, data.channelUrl, data.name);

  renderPoints($('projPositives'), data.positives, '✓', 'var(--brand)', 'Wird ergänzt, sobald genug eigene Erfahrung mit ' + data.name + ' vorliegt.');
  renderPoints($('projConsiderations'), data.considerations, '!', 'var(--z2)', 'Wird ergänzt, sobald es dazu Konkretes zu sagen gibt.');

  var perfSection = $('entwicklung');
  if(perfSection){ perfSection.hidden = !(data.performance && data.performance.length); }
  renderStats($('projPerfStats'), data.performance);

  renderRisks($('projRisks'), data.risks);
  renderList($('projAudienceFit'), data.audienceFit);
  renderList($('projAudienceNotFit'), data.audienceNotFit);
  renderFaq($('projFaq'), data.faq);
  renderRelated($('projRelated'), data.related);

  // CTA-Karte
  if($('projCtaName')) $('projCtaName').textContent = data.name;
  var ctaBtn = $('projCtaBtn');
  if(ctaBtn && data.websiteUrl){ ctaBtn.href = data.websiteUrl; }
  var affTag = $('projAffiliateTag');
  if(affTag) affTag.hidden = !data.affiliate;

  // Sticky Mobile-CTA
  if(document.getElementById('projSticky')) document.body.classList.add('has-proj-sticky');

  // JSON-LD Datum konsistent nachziehen (kein zweites Pflegefeld im Head noetig)
  var ld = document.getElementById('projJsonLd');
  if(ld){
    try{
      var obj = JSON.parse(ld.textContent);
      obj.dateModified = data.updatedAt;
      ld.textContent = JSON.stringify(obj);
    }catch(e){}
  }
}

window.RX = window.RX || {};
window.RX.project = { init: init, STATUS: STATUS, fmtDate: fmtDate };
})();
