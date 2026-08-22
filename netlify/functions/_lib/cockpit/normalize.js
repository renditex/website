/* ============================================================
   RenditeX Markt-Cockpit — Normalisierung auf die gemeinsame
   Skala -100..+100. Siehe Datendossier (Schritt 4) fuer die
   Methodik-Uebersicht je Indikator-Typ. Jede Funktion clippt hart
   auf [-100, 100] — eine Kennzahl darf die Skala nie sprengen,
   auch nicht bei Ausreissern.
   ============================================================ */
function clip(v){ return Math.max(-100, Math.min(100, v)); }

/* Fuer Werte, die bereits als Anteil 0..1 vorliegen (Marktbreite,
   Altcoin Season): 50% = neutral (0), 100% = +100, 0% = -100. */
function fromShare(share){
  if(share == null) return null;
  return clip((share - 0.5) * 200);
}

/* Fuer bereits 0..100 skalierte Indizes (Fear & Greed): 50 = neutral. */
function fromIndex0to100(v){
  if(v == null) return null;
  return clip((v - 50) * 2);
}

/* Fuer eine prozentuale Distanz zu einem Referenzwert (z.B. Kurs vs.
   200-Tage-Durchschnitt): skaliert per Faktor, dann geclippt. Faktor
   400 heisst: +/-25% Distanz erreicht bereits +/-100 (grosszuegig,
   da BTC auch bei +/-25% zum MA200 noch "normale" Marktphasen hat). */
function fromDistancePct(distancePct, factor){
  if(distancePct == null) return null;
  return clip(distancePct * (factor || 400));
}

/* Fuer FRED-Perzentilraenge: invert=true wenn ein HOHER Rohwert der
   Reihe schlecht fuer Risikoassets ist (z.B. Zinsen, Inflation,
   Kreditspreads, VIX) — dann wird der Perzentilrang gespiegelt,
   bevor er auf -100..+100 abgebildet wird. */
function fromPercentile(pct, invert){
  if(pct == null) return null;
  return fromShare(invert ? (1 - pct) : pct);
}

module.exports = { clip, fromShare, fromIndex0to100, fromDistancePct, fromPercentile };
