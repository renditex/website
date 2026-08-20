/* ============================================================
   RenditeX Admin — Analytics-Dashboard-Logik. Nur auf
   /admin/analytics/ geladen. Jede Anfrage an /api/analytics/stats
   laeuft mit Cookies (credentials:'same-origin') — ohne gueltige
   Session antwortet die Function mit 401, dann wird sofort zur
   Login-Seite umgeleitet. Es werden nie Rohdaten oder IP-Adressen
   angezeigt, nur die vom Server bereits aggregierten Zahlen.
   ============================================================ */
(function(){
"use strict";

function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function fmtInt(n){ return (n || 0).toLocaleString('de-DE'); }
function fmtPct(n){ return n == null ? '—' : (n * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %'; }

var currentData = null;
var chart = null;
var chartSeries = null;
var chartMetric = 'pageViews';

function goToLogin(){
  window.location.href = '/admin/login/';
}

function fetchStats(range){
  return fetch('/api/analytics/stats?range=' + encodeURIComponent(range), {
    method: 'GET',
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json' }
  }).then(function(res){
    if(res.status === 401){
      goToLogin();
      return null;
    }
    if(!res.ok) throw new Error('stats_failed_' + res.status);
    return res.json();
  });
}

function renderKpis(data){
  $('kpiViews').textContent = fmtInt(data.pageViews);
  $('kpiClicks').textContent = fmtInt(data.linkClicks);
  $('kpiCtr').textContent = fmtPct(data.ctr);
  $('kpiTop').textContent = data.topLink ? data.topLink.label : '—';
}

function renderTopLinks(topLinks){
  var host = $('topLinksHost');
  if(!topLinks || !topLinks.length){
    host.innerHTML = '<div class="admin-empty">Noch keine Klicks in diesem Zeitraum.</div>';
    return;
  }
  var rows = topLinks.map(function(l){
    return '<tr>' +
      '<td>' + esc(l.label) + '<div class="bar-track"><div class="bar" style="width:' + Math.round(l.share * 100) + '%"></div></div></td>' +
      '<td class="num">' + fmtInt(l.clicks) + '</td>' +
      '<td class="num">' + fmtPct(l.share) + '</td>' +
    '</tr>';
  }).join('');
  host.innerHTML =
    '<table class="admin-table"><thead><tr><th>Link</th><th class="num">Klicks</th><th class="num">Anteil</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>';
}

function renderBarList(hostId, items, valueKey, labelKey, emptyText){
  var host = $(hostId);
  if(!items || !items.length){
    host.innerHTML = '<div class="admin-empty">' + emptyText + '</div>';
    return;
  }
  var max = Math.max.apply(null, items.map(function(i){ return i[valueKey]; }));
  host.innerHTML = items.map(function(i){
    var pct = max ? Math.round((i[valueKey] / max) * 100) : 0;
    return '<div class="admin-catrow">' +
      '<span class="name">' + esc(i[labelKey]) + '</span>' +
      '<span class="track"><span class="fill" style="width:' + pct + '%"></span></span>' +
      '<span class="n">' + fmtInt(i[valueKey]) + '</span>' +
    '</div>';
  }).join('');
}

function ensureChart(){
  if(chart || typeof LightweightCharts === 'undefined') return;
  var host = $('chartHost');
  var box = host.getBoundingClientRect();
  function cssVar(name){ return getComputedStyle(host).getPropertyValue(name).trim(); }
  chart = LightweightCharts.createChart(host, {
    width: Math.round(box.width) || 600,
    height: 220,
    layout: { background: { color: 'transparent' }, textColor: cssVar('--muted-2'), fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 },
    grid: { vertLines: { color: cssVar('--line-soft') }, horzLines: { color: cssVar('--line-soft') } },
    rightPriceScale: { borderColor: cssVar('--line-soft') },
    timeScale: { borderColor: cssVar('--line-soft'), rightOffset: 1 },
    handleScroll: false, handleScale: false
  });
  chartSeries = chart.addHistogramSeries({ color: cssVar('--cyan'), priceFormat: { type: 'volume' } });
  window.addEventListener('resize', function(){
    var b = host.getBoundingClientRect();
    chart.resize(Math.round(b.width) || 600, 220);
  });
}

function renderChart(series){
  if(!series || !series.length) return;
  ensureChart();
  if(!chartSeries) return;
  chartSeries.setData(series.map(function(d){ return { time: d.date, value: d[chartMetric] }; }));
  chart.timeScale().fitContent();
}

function renderAll(data){
  currentData = data;
  renderKpis(data);
  renderTopLinks(data.topLinks);
  renderBarList('categoriesHost', data.categories, 'clicks', 'label', 'Noch keine Klicks in diesem Zeitraum.');
  renderBarList('referrersHost', data.referrers, 'count', 'label', 'Noch keine Aufrufe in diesem Zeitraum.');
  renderBarList('devicesHost', data.devices, 'count', 'label', 'Noch keine Aufrufe in diesem Zeitraum.');
  renderChart(data.series);
  $('adminUpdated').textContent = 'Stand: ' + new Date().toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function loadRange(range){
  fetchStats(range).then(function(data){
    if(!data) return; // 401 -> bereits umgeleitet
    if(!data.ok){ throw new Error(data.error || 'unknown'); }
    renderAll(data);
  }).catch(function(){
    $('topLinksHost').innerHTML = '<div class="admin-empty">Daten konnten nicht geladen werden. Bitte Seite neu laden.</div>';
  });
}

function wireRangeButtons(){
  var host = $('rangeButtons');
  host.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-range]');
    if(!btn) return;
    host.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    loadRange(btn.getAttribute('data-range'));
  });
}

function wireChartToggle(){
  var host = $('chartToggle');
  host.addEventListener('click', function(e){
    var btn = e.target.closest('button[data-metric]');
    if(!btn) return;
    host.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    chartMetric = btn.getAttribute('data-metric');
    if(currentData) renderChart(currentData.series);
  });
}

function wireLogout(){
  $('logoutBtn').addEventListener('click', function(){
    fetch('/api/analytics/logout', { method: 'POST', credentials: 'same-origin' })
      .catch(function(){})
      .then(goToLogin);
  });
}

wireRangeButtons();
wireChartToggle();
wireLogout();
loadRange('30d');
})();
