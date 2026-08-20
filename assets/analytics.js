/* ============================================================
   RenditeX Analytics — schlanker, fehlertoleranter Client-Tracker.
   Sendet Events per sendBeacon (nicht blockierend, uebersteht auch
   einen sofortigen Seitenwechsel) an /api/analytics/event. Ist der
   Endpoint nicht erreichbar — z. B. in der lokalen Vorschau ohne
   Netlify Functions — passiert einfach nichts: nie ein sichtbarer
   Fehler, nie eine blockierte Navigation. Analytics ist immer
   zweitrangig gegenueber der eigentlichen Seitenfunktion.

   Delegierter Click-Handler statt einzelner Listener pro Element:
   funktioniert automatisch fuer dynamisch nachtraeglich befuellte
   Links (z. B. das per JS geladene Video auf /links) und kann nie
   durch ein erneutes Rendern doppelt gebunden werden.
   ============================================================ */
(function(){
  "use strict";
  var ENDPOINT = '/api/analytics/event';
  var clicksWired = false;

  function send(payload){
    try{
      var body = JSON.stringify(payload);
      if(navigator.sendBeacon){
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      } else if(window.fetch){
        fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }).catch(function(){});
      }
    }catch(e){ /* Analytics darf nie die Seite stoeren */ }
  }

  function trackPageView(pageId){
    send({ event: 'page_view', target: pageId });
  }

  function trackClick(target){
    send({ event: 'link_click', target: target });
  }

  function wireClicks(){
    if(clicksWired) return;
    clicksWired = true;
    document.addEventListener('click', function(e){
      var el = e.target.closest('[data-track]');
      if(!el) return;
      trackClick(el.getAttribute('data-track'));
    });
  }

  window.RX = window.RX || {};
  window.RX.analytics = { trackPageView: trackPageView, trackClick: trackClick, wireClicks: wireClicks };
})();
