/* ============================================================
   RenditeX Analytics — erlaubte Event-Typen und Ziele.
   Der oeffentliche Tracking-Endpoint akzeptiert NUR, was hier
   eingetragen ist — alles andere wird mit 400 abgelehnt, damit der
   Endpoint nicht als beliebiger Datenspeicher missbraucht werden
   kann. Neue Seite/neuer Link = hier eintragen, sonst wird das
   Event verworfen (fail closed, nicht fail open).

   Bewusst an die echten RenditeX-Seiten gebunden, NICHT an die
   inzwischen wieder entfernte /links-Seite (siehe ANALYTICS.md) —
   die Startseite selbst ist der zentrale Einstiegspunkt. */

// Seiten, fuer die ein page_view gezaehlt werden darf.
const PAGE_IDS = new Set([
  'home', 'tools', 'plattformen', 'ressourcen',
  'bitopex', 'hyperocket', 'smartit', 'deficircle'
]);

// Links, die ein link_click ausloesen duerfen, jeweils mit ihrer
// Kategorie fuer die Dashboard-Gruppierung. Die Kategorie wird
// SERVERSEITIG aus dieser Tabelle bestimmt, nie vom Client
// mitgeschickt — verhindert, dass jemand beliebige Kategorien einschleust.
const LINK_CATEGORIES = {
  // Tools
  heatzone:    'tools',
  fear_greed:  'tools',
  sparplan:    'tools',
  haltefrist:  'tools',
  scamcheck:   'tools',
  halving:     'tools',
  // Wissen
  guide:                  'wissen',
  books:                  'wissen',
  book_bitcoin_standard:  'wissen',
  book_orange_pille:      'wissen',
  book_alles_betrug:      'wissen',
  // Praxistests (Klick auf die Startseiten-Karte — der eigentliche
  // Seitenaufruf der Projektseite selbst laeuft als page_view)
  bitopex:     'praxistests',
  hyperocket:  'praxistests',
  smartit:     'praxistests',
  deficircle:  'praxistests',
  // Community. Hinweis: "defi_circle" (mit Unterstrich) ist der Klick
  // auf den externen Discord-Link (Community-Karte + CTA auf der
  // Projektseite) — bewusst ein anderer Zielname als "deficircle"
  // (Klick auf die Startseiten-Projektkarte bzw. deren page_view),
  // damit beide Events in der Kategorien-Auswertung sauber getrennt bleiben.
  youtube:      'community',
  video:        'community',
  telegram:     'community',
  defi_circle:  'community',
  // Plattformen & Anbieter
  pionex:   'plattformen',
  coinbase: 'plattformen',
  lirunex:  'plattformen',
  bybit:    'plattformen',
  bondora:  'plattformen',
  mintos:   'plattformen',
  monefit:  'plattformen',
  c24:      'plattformen',
  tfbank:   'plattformen',
  dkb:      'plattformen',
  revolut:  'plattformen'
};

const CATEGORY_LABELS = {
  tools:        'Tools',
  wissen:       'Wissen',
  praxistests:  'Praxistests',
  community:    'Community',
  plattformen:  'Plattformen'
};

const LINK_LABELS = {
  heatzone: 'BTC Heatzone', fear_greed: 'Fear & Greed', sparplan: 'Sparplan-Rechner',
  haltefrist: 'Haltefrist-Tracker', scamcheck: 'Scam-Check', halving: 'Halving-Countdown',
  guide: 'Krypto-Guide', books: 'Bücher & Ressourcen',
  book_bitcoin_standard: 'Der Bitcoin Standard', book_orange_pille: 'Die Orange Pille', book_alles_betrug: 'Alles Betrug, außer Bitcoin!',
  bitopex: 'Bitopex', hyperocket: 'HyperRocket', smartit: 'SmartIT', deficircle: 'DeFi Circle',
  youtube: 'YouTube', video: 'Aktuelles Video', telegram: 'Telegram', defi_circle: 'DeFi Circle Community',
  pionex: 'Pionex', coinbase: 'Coinbase', lirunex: 'Lirunex', bybit: 'Bybit EU',
  bondora: 'Bondora', mintos: 'Mintos', monefit: 'Monefit',
  c24: 'C24', tfbank: 'TF Bank', dkb: 'DKB', revolut: 'Revolut'
};

function isValidPageView(target){
  return typeof target === 'string' && PAGE_IDS.has(target);
}

function isValidLinkClick(target){
  return typeof target === 'string' && Object.prototype.hasOwnProperty.call(LINK_CATEGORIES, target);
}

function categoryOf(target){
  return LINK_CATEGORIES[target] || null;
}

module.exports = {
  PAGE_IDS,
  LINK_CATEGORIES,
  CATEGORY_LABELS,
  LINK_LABELS,
  isValidPageView,
  isValidLinkClick,
  categoryOf
};
