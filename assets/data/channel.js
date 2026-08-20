/* ============================================================
   Allgemeine Kanal-Videos — fuer Videos, die zu KEINEM einzelnen
   Praxistest gehoeren (z. B. allgemeine Krypto-/Wissensvideos).
   Einfach oben ein neues Objekt ergaenzen, published-Datum nicht
   vergessen — die Seite zeigt automatisch das zeitlich neueste
   Video ueber ALLE Quellen hinweg (dieser Datei + Bitopex +
   HyperRocket + SmartIT), nichts muss manuell "aktiv" geschaltet
   werden. Gehoert ein Video zu einem Praxistest, gehoert es in
   dessen eigene Datei (assets/data/<projekt>.js), nicht hierher.
   ============================================================ */
window.RX_DATA = window.RX_DATA || {};
window.RX_DATA.channel = {
  videos: [
    {
      title: 'DAS hätte ich als Krypto-Anfänger gebraucht',
      youtubeUrl: 'https://youtu.be/wrqdhVPNWEI',
      publishedAt: '2026-08-20',
      description: 'Was ich rückblickend gerne schon zu Beginn gewusst hätte.'
    }
  ]
};
