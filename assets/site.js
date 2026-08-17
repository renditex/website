/* ============================================================
   RenditeX — gemeinsame Bausteine für alle Seiten
   Kopfzeile und Fußzeile werden hier zentral gepflegt.
   Änderungen wirken sich automatisch auf jede Seite aus.
   ============================================================ */
(function(){
"use strict";

var LOGO =
  '<svg class="xmark" viewBox="0 0 46 36" aria-hidden="true">' +
    '<g stroke-width="3.6" stroke-linecap="butt" fill="none">' +
      '<g stroke="currentColor"><path d="M2 34 L20 2"/><path d="M9.5 34 L27.5 2"/><path d="M17 34 L35 2"/></g>' +
      '<g stroke="#E4212B"><path d="M11 2 L29 34"/><path d="M18.5 2 L36.5 34"/><path d="M26 2 L44 34"/></g>' +
    '</g>' +
  '</svg>';

var LINKS = {
  youtube:  'https://www.youtube.com/@RenditeX',
  telegram: 'https://t.me/+_PoyewKyz8JjZTVi',
  discord:  'https://discord.gg/HdXWJZYe2x',
  heylink:  'https://heylink.me/RenditeX/',
  whatsapp: 'https://wa.me/+4915143373219'
};

/* ---------- Hauptnavigation ----------
   Eine einzige, feste Struktur für den Header auf JEDER Seite — vorher
   bekam jede Seite ihre eigene Anker-Navigation übergeben, was von Seite
   zu Seite unterschiedlich aussah und verwirrend war. Jetzt: immer
   dieselben vier Punkte, "Wissen" und "Tools" als Dropdown mit allen
   Unterseiten. Neue Tools/Artikel einfach hier eintragen, wirkt sich
   automatisch überall aus. */
var NAV = [
  { label:'Wissen', href:'/#wissen', items:[
      {href:'/#wissen', label:'Krypto-Guide (kostenlos)'},
      {href:'/wissen/die-einjahresfrist/', label:'Die Einjahresfrist'}
    ]},
  { label:'Tools', href:'/#tools', items:[
      {href:'/fear-greed/', label:'Fear & Greed Index'},
      {href:'/heatzone-chart/', label:'Heatzone Chart'},
      {href:'/scam-check/', label:'Scam-Check'},
      {href:'/haltefrist-tracker/', label:'Haltefrist-Tracker'},
      {href:'/halving-countdown/', label:'Halving-Countdown'},
      {href:'/sparplan-rechner/', label:'Sparplan-Rechner'}
    ]},
  { label:'Projekte', href:'/projekte/', items:[
      {href:'/projekte/bitopex/', label:'Bitopex'}
    ]},
  { label:'Plattformen', href:'/#plattformen' },
  { label:'Über mich', href:'/#ueber-mich' }
];
var CHEVRON = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1l5 5 5-5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var BURGER = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

/* ---------- Währung: eine Einstellung für die ganze Seite ----------
   Wird im Browser gespeichert und gilt seitenübergreifend. Tool-Seiten
   hören auf das 'rx-currency'-Event und laden ihre Preisdaten dann
   in der neu gewählten Währung neu (echte $-Kurse, keine Umrechnung). */
var CUR_KEY = 'renditex_currency_v1';
function getCurrency(){
  try{ var c = localStorage.getItem(CUR_KEY); return (c === 'USD') ? 'USD' : 'EUR'; }
  catch(e){ return 'EUR'; }
}
function setCurrency(c){
  c = (c === 'USD') ? 'USD' : 'EUR';
  try{ localStorage.setItem(CUR_KEY, c); }catch(e){}
  document.querySelectorAll('.cur-toggle').forEach(function(b){ b.textContent = c; });
  window.dispatchEvent(new CustomEvent('rx-currency', { detail:{ currency:c } }));
}
function fmtMoney(n, maxFrac){
  var cur = getCurrency();
  return new Intl.NumberFormat('de-DE', {
    style:'currency', currency:cur, maximumFractionDigits:(maxFrac==null?0:maxFrac)
  }).format(n);
}
function currencySymbol(){ return getCurrency() === 'USD' ? '$' : '€'; }

/* ---------- Theme: hell/dunkel ----------
   Wird in localStorage gespeichert und gilt seitenübergreifend. Ohne
   gespeicherte Wahl entscheidet die Systemeinstellung (prefers-color-
   scheme). Das eigentliche Umschalten passiert rein über das
   data-theme-Attribut auf <html> — die Farben selbst liegen in
   renditex.css (:root[data-theme="dark"]). Jede Seite setzt dieses
   Attribut zusätzlich per Inline-Skript im <head> VOR dem ersten
   Rendern, damit es beim Laden nicht kurz hell aufblitzt. */
var THEME_KEY = 'renditex_theme_v1';
function systemPrefersDark(){
  return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}
function getTheme(){
  try{
    var t = localStorage.getItem(THEME_KEY);
    if(t === 'dark' || t === 'light') return t;
  }catch(e){}
  return systemPrefersDark() ? 'dark' : 'light';
}
function setTheme(t){
  t = (t === 'dark') ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', t);
  try{ localStorage.setItem(THEME_KEY, t); }catch(e){}
  document.querySelectorAll('.theme-toggle').forEach(function(b){
    b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
  });
}
var THEME_ICON =
  '<svg class="ic-sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
    '<circle cx="12" cy="12" r="4.2"/>' +
    '<path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7"/>' +
  '</svg>' +
  '<svg class="ic-moon" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">' +
    '<path d="M20.4 14.7A8.7 8.7 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1z"/>' +
  '</svg>';

/* ---------- Kopfzeile ---------- */
function navItemHtml(n, i){
  var here = (typeof location !== 'undefined') ? location.pathname : '';
  if(!n.items){
    var current = n.href.indexOf('#') === -1 && n.href === here;
    return '<div class="nav-item"><a href="' + n.href + '"' + (current ? ' aria-current="page"' : '') + '>' + n.label + '</a></div>';
  }
  var sub = n.items.map(function(s){
    var current = s.href.indexOf('#') === -1 && s.href === here;
    return '<a href="' + s.href + '"' + (current ? ' aria-current="page"' : '') + '>' + s.label + '</a>';
  }).join('');
  return '<div class="nav-item" data-nav-i="' + i + '">' +
      '<button type="button" class="dd-toggle" aria-haspopup="true" aria-expanded="false">' + n.label + CHEVRON + '</button>' +
      '<div class="dd-panel">' + sub + '</div>' +
    '</div>';
}

function header(opts){
  opts = opts || {};
  var host = document.getElementById('rx-top');
  if(!host) return;
  var nav = NAV.map(navItemHtml).join('');

  host.className = 'top';
  host.innerHTML =
    '<div class="wrap top-in">' +
      '<a class="brand" href="/" aria-label="RenditeX Startseite">' +
        '<span class="wm">Rendite</span>' + LOGO +
        (opts.live ? '<span class="dot" id="brandDot"></span>' : '') +
      '</a>' +
      '<nav class="top-nav" id="topNav">' + nav + '</nav>' +
      '<button type="button" class="theme-toggle" id="themeToggle" aria-pressed="' + (getTheme() === 'dark') + '" aria-label="Theme wechseln (hell oder dunkel)">' + THEME_ICON + '</button>' +
      '<button type="button" class="cur-toggle" id="curToggle" aria-label="Währung wechseln (Euro oder US-Dollar)">' + getCurrency() + '</button>' +
      (opts.live
        ? '<div class="pill-live" id="pillLive">' +
            '<span id="pillDot" style="width:7px;height:7px;border-radius:50%;background:var(--z1)"></span>' +
            '<b id="pillVal">—</b><span id="pillLbl" style="color:var(--muted)">lädt</span>' +
          '</div>'
        : '<a class="pill-live show" href="' + LINKS.youtube + '" target="_blank" rel="noopener" ' +
          'style="text-decoration:none;color:var(--text)">' +
            '<span style="width:7px;height:7px;border-radius:50%;background:var(--red)"></span>' +
            '<b>YouTube</b></a>') +
      '<button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="topNav" aria-label="Navigation öffnen">' + BURGER + '</button>' +
    '</div>';

  var btn = document.getElementById('curToggle');
  btn.addEventListener('click', function(){
    setCurrency(getCurrency() === 'EUR' ? 'USD' : 'EUR');
  });

  var themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', function(){
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  });

  /* Dropdowns: per Klick öffnen/schließen, nur eines gleichzeitig offen,
     schließt bei Klick außerhalb oder Escape — funktioniert so gleich
     auf Touch wie mit Maus/Tastatur. */
  function closeAllDropdowns(){
    host.querySelectorAll('.nav-item.open').forEach(function(el){
      el.classList.remove('open');
      var b = el.querySelector('.dd-toggle');
      if(b) b.setAttribute('aria-expanded', 'false');
    });
  }
  host.querySelectorAll('.dd-toggle').forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var item = b.closest('.nav-item');
      var wasOpen = item.classList.contains('open');
      closeAllDropdowns();
      if(!wasOpen){ item.classList.add('open'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', closeAllDropdowns);
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeAllDropdowns(); });

  /* Mobil: Hamburger blendet die komplette Navigation als Panel ein. */
  var navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', function(e){
    e.stopPropagation();
    var isOpen = host.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    if(!isOpen) closeAllDropdowns();
  });
}

/* ---------- Breadcrumb ----------
   Zeigt auf jeder Unterseite (nicht auf der Startseite), wo man gerade
   ist: eine Pfad-Zeile (Start › Kategorie › aktuelle Seite) plus optional
   Pillen zu Geschwister-Seiten derselben Kategorie (z. B. den anderen
   Tools), damit man direkt dorthin wechseln kann, ohne über die
   Startseite zurückzumüssen. */
function breadcrumb(opts){
  opts = opts || {};
  var host = document.getElementById('rx-crumb');
  if(!host) return;
  var trail = (opts.trail || []).map(function(seg, i){
    var sep = i > 0 ? '<span class="sep">›</span>' : '';
    if(seg.current) return sep + '<span class="current">' + seg.label + '</span>';
    if(seg.href) return sep + '<a href="' + seg.href + '">' + seg.label + '</a>';
    return sep + '<span>' + seg.label + '</span>';
  }).join('');
  var pills = (opts.pills || []).map(function(p){
    return '<a href="' + p.href + '"' + (p.current ? ' aria-current="page"' : '') + '>' + p.label + '</a>';
  }).join('');
  host.className = 'wrap breadcrumb';
  host.innerHTML =
    '<div class="trail">' + trail + '</div>' +
    (pills ? '<div class="pills">' + pills + '</div>' : '');
}

/* ---------- Fußzeile ---------- */
function footer(){
  var host = document.getElementById('rx-foot');
  if(!host) return;
  host.innerHTML =
    '<div class="wrap foot-grid">' +
      '<div>' +
        '<div class="brand" style="margin-bottom:14px"><span class="wm">Rendite</span>' + LOGO + '</div>' +
        '<div style="font-family:var(--font-mono); font-size:11.5px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted-2); margin-bottom:14px">Krypto · Investment · Optionen · Trading</div>' +
        '<div class="foot-links">' +
          '<a href="/">Alle Tools</a>' +
          '<a href="' + LINKS.youtube + '" target="_blank" rel="noopener">YouTube</a>' +
          '<a href="' + LINKS.telegram + '" target="_blank" rel="noopener">Telegram</a>' +
          '<a href="' + LINKS.heylink + '" target="_blank" rel="noopener">Alle Links</a>' +
        '</div>' +
        '<div class="foot-links">' +
          '<a href="/rechtliches/impressum.html">Impressum</a>' +
          '<a href="/rechtliches/datenschutz.html">Datenschutz</a>' +
          '<a href="/rechtliches/disclaimer.html">Disclaimer</a>' +
        '</div>' +
      '</div>' +
      '<div class="legal">' +
        '<b style="color:var(--muted)">Risikohinweis:</b> Diese Seite dient ausschließlich der Information und stellt keine Anlageberatung, Kaufempfehlung oder Finanzanalyse dar. Kryptowährungen sind hochvolatil, ein Totalverlust des eingesetzten Kapitals ist möglich. Alle Berechnungen sind vereinfachte Modelle ohne Gebühren und Steuern. Historische Entwicklungen erlauben keine Rückschlüsse auf künftige Ergebnisse. Einige ausgehende Links sind Partnerlinks. Triff Anlageentscheidungen nur auf Basis eigener Recherche.' +
        '<div style="margin-top:14px; font-size:12px">© <span id="rxYear"></span> RenditeX — Viktor Investments &amp; Krypto</div>' +
      '</div>' +
    '</div>';
  var y = document.getElementById('rxYear');
  if(y) y.textContent = new Date().getFullYear();
}

/* ---------- Kopfzeile beim Scrollen ---------- */
function stickyPill(watchSelector){
  var el = document.querySelector(watchSelector), pill = document.getElementById('pillLive');
  if(!el || !pill || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(es){
    pill.classList.toggle('show', !es[0].isIntersecting);
  }, {threshold:0}).observe(el);
}

/* ---------- Einblenden beim Scrollen ---------- */
function reveal(){
  if(!('IntersectionObserver' in window)){
    document.querySelectorAll('.reveal').forEach(function(n){ n.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, {threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(n){ io.observe(n); });
}

window.RX = {
  header:header, footer:footer, breadcrumb:breadcrumb, stickyPill:stickyPill, reveal:reveal, links:LINKS, logo:LOGO,
  currency: { get:getCurrency, set:setCurrency, format:fmtMoney, symbol:currencySymbol },
  theme: { get:getTheme, set:setTheme }
};
})();
