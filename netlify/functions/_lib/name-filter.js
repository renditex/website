/* ============================================================
   RenditeX Krypto-Quiz — einfacher Namensfilter fuer die
   oeffentliche Bestenliste. Kein Konto, kein Login, jeder darf
   einen frei gewaehlten Namen eintragen — deshalb serverseitige
   Pruefung gegen eine Blockliste gaengiger Beleidigungen/Slurs
   (Deutsch + Englisch), bevor ein Name gespeichert wird.

   WICHTIG: Das ist ein Best-Effort-Filter, keine perfekte Loesung.
   Wortspiele, neue Kreationen oder cleveres Umschreiben koennen
   durchrutschen. Zwei Listen, um Fehlalarme bei unschuldigen
   Woertern zu vermeiden:
   - SUBSTRING: lang/eindeutig genug, dass sie in keinem normalen
     Namen zufaellig vorkommen (z.B. "arschloch", "hitler")
   - EXACT_TOKEN: kurz/mehrdeutig, wuerden als Teilstring zu viele
     harmlose Woerter treffen (z.B. "rape" in "grape", "mongo" in
     "Mongolei") — werden deshalb nur bei exakter Wort-Uebereinstimmung
     geblockt, nicht als Teilstring.
   ============================================================ */
var SUBSTRING = [
  // Deutsch
  'arschloch', 'wichser', 'wichsen', 'fotze', 'schlampe', 'nutte', 'missgeburt',
  'spasti', 'vollidiot', 'schwuchtel', 'kanake', 'scheisse', 'scheiss', 'scheiß',
  'hitler', 'hakenkreuz', 'holocaust',
  // Englisch
  'fuck', 'bitch', 'asshole', 'bastard', 'retard', 'faggot', 'nigger', 'nigga',
  'cunt', 'whore', 'slut', 'kike'
];
var EXACT_TOKEN = [
  'arsch', 'hure', 'idiot', 'trottel', 'spast', 'mongo', 'neger', 'zigeuner', 'nazi',
  'shit', 'rape', 'chink', 'spic', 'ss'
];

function normalize(s){
  return String(s || '')
    .toLowerCase()
    .replace(/[013457@$]/g, function(c){
      return { '0':'o', '1':'i', '3':'e', '4':'a', '5':'s', '7':'t', '@':'a', '$':'s' }[c];
    });
}

function containsBlockedWord(raw){
  var norm = normalize(raw);
  var joined = norm.replace(/[^a-zäöüß]/g, '');
  if(!joined) return false;

  if(SUBSTRING.some(function(w){ return joined.indexOf(w) !== -1; })) return true;

  var tokens = norm.split(/[^a-zäöüß]+/).filter(Boolean);
  return tokens.some(function(t){ return EXACT_TOKEN.indexOf(t) !== -1; });
}

module.exports = { containsBlockedWord };
