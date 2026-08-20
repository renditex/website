#!/usr/bin/env node
/* ============================================================
   Erzeugt den Wert fuer die Netlify-Environment-Variable
   RENDITEX_ADMIN_PASSWORD_HASH. Rein lokales Hilfsskript, wird
   NICHT deployt und ist selbst kein Sicherheitsrisiko — es enthaelt
   kein Passwort, nur den Hash-Algorithmus.

   Verwendung:
     node scripts/hash-password.js "MeinNeuesPasswort"

   Die Ausgabe (beginnt mit "scrypt$...") komplett kopieren und in
   Netlify unter Site settings -> Environment variables als Wert von
   RENDITEX_ADMIN_PASSWORD_HASH eintragen. Siehe ANALYTICS.md fuer
   die Schritt-fuer-Schritt-Anleitung.
   ============================================================ */
const crypto = require('crypto');

const password = process.argv[2];
if(!password){
  console.error('Bitte Passwort als Argument uebergeben:');
  console.error('  node scripts/hash-password.js "MeinNeuesPasswort"');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(password, salt, 64).toString('hex');
console.log('scrypt$' + salt + '$' + hash);
