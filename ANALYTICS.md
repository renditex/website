# RenditeX Analytics — Anleitung für dich

Diese Datei ist deine Referenz für das selbst gebaute, datensparsame Analytics-System für die echte RenditeX-Website (Startseite, Tools, Praxistests, Plattformen, Ressourcen). Kein Google Analytics, keine Cookies zur Besucheridentifikation, keine IP-Speicherung — nur aggregierte Seitenaufrufe und Klicks.

**Hinweis zur Historie:** Ursprünglich war dieses System für eine separate `/links`-Seite (Link-in-Bio-Hub) gebaut. Diese Seite wurde wieder verworfen — die normale Website ist jetzt der zentrale Einstiegspunkt, `/links` leitet nur noch auf `/` weiter. Die Analytics-Infrastruktur (Functions, Speicher, Dashboard) blieb bestehen und misst jetzt stattdessen die echten Seiten.

## 1. Was wurde gebaut?

- **Ein öffentlicher, unsichtbarer Tracking-Mechanismus** auf Startseite, `/tools/`, `/plattformen/`, `/wissen/ressourcen/` und den drei Praxistest-Seiten: zählt Seitenaufrufe je Seite sowie Klicks auf die wichtigsten Links (Tools, Praxistests, Community, aktuelles Video, Plattformen, Bücher).
- **Eine private Analytics-Seite** unter `/admin/analytics/` mit Zeiträumen (Heute/7 Tage/30 Tage/Gesamt), KPIs, einem 30-Tage-Verlauf, einer Top-Links-Tabelle, Kategorien (Tools/Wissen/Praxistests/Community/Plattformen) und optional Herkunft (Instagram/YouTube/Telegram/Google/Direkt/Sonstige) sowie Gerätetyp (Mobile/Desktop/Tablet).
- **Ein Login unter `/admin/login/`**, ohne den niemand — auch nicht mit der genauen URL — die Statistiken sehen kann.
- Technisch: 4 kleine serverseitige Funktionen (Netlify Functions) + Netlify Blobs als Speicher. Kein neues Konto, kein neuer Dienst — beides ist Teil deines bestehenden Netlify-Hostings.

## 2. Wo finde ich mein Analytics-Dashboard?

`https://renditex.netlify.app/admin/analytics/` (nach dem Deploy). Ohne gültige Anmeldung leitet die Seite automatisch zu `/admin/login/` weiter.

## 3. Wie lege ich mein Admin-Passwort fest?

Dein Passwort steht **nirgends im Code**. Du legst es über eine Netlify-Environment-Variable fest:

1. Öffne dein Terminal (oder sag mir in diesem Chat dein gewünschtes Passwort — dann erzeuge ich dir den Hash direkt hier, ohne dass du selbst etwas installieren musst).
2. Falls du es selbst machen willst: im Projektordner ausführen:
   ```
   node scripts/hash-password.js "DeinPasswort"
   ```
   Das gibt eine Zeile aus, die mit `scrypt$...` beginnt.
3. Bei **app.netlify.com** → dein Projekt **RenditeX** → **Site configuration** → **Environment variables** → **Add a variable**:
   - Key: `RENDITEX_ADMIN_PASSWORD_HASH`
   - Value: die komplette `scrypt$...`-Zeile aus Schritt 2
4. Noch eine zweite Variable anlegen (einmalig, nie wieder ändern):
   - Key: `RENDITEX_SESSION_SECRET`
   - Value: eine beliebige lange Zufallszeichenkette (z. B. 40+ Zeichen). Wenn du keine zur Hand hast, sag mir Bescheid, ich erzeuge dir eine.

Beide Variablen bei **Scope: alle** bzw. mindestens **Production** aktivieren.

## 4. Muss ich danach neu deployen?

Ja. Netlify liest Environment Variables beim Build/Deploy ein, nicht live. Nach dem Setzen (oder Ändern) der Variablen: in Netlify auf **Deploys** → **Trigger deploy** → **Deploy site**, oder einfach den nächsten normalen Push abwarten.

## 5. Wie ändere ich später mein Passwort?

Schritt 2+3 aus Punkt 3 wiederholen (neuen Hash erzeugen, `RENDITEX_ADMIN_PASSWORD_HASH` in Netlify überschreiben), danach neu deployen. `RENDITEX_SESSION_SECRET` dabei **nicht** ändern — das würde nur alle gerade aktiven Logins abmelden, ist aber nicht schädlich.

## 6. Wo werden die Statistiken gespeichert?

In **Netlify Blobs** — einem einfachen Speicher, der direkt zu deinem Netlify-Projekt gehört (kein separates Konto, keine externe Datenbank). Jedes Event (ein Seitenaufruf oder ein Klick) wird als eigener kleiner Datensatz gespeichert, nicht als gemeinsamer Zähler — das verhindert, dass zwei gleichzeitige Klicks sich gegenseitig überschreiben. Die Dashboard-Zahlen werden beim Anzeigen aus diesen Einzeldatensätzen zusammengerechnet.

## 7. Entstehen dadurch zusätzliche Kosten?

Bei deiner voraussichtlichen Nutzung (persönlicher Link-Hub, keine Massen-Website): nein. Netlify Functions und Netlify Blobs sind im kostenlosen Netlify-Plan mit großzügigen Freikontingenten enthalten. Solltest du irgendwann sehr hohen Traffic bekommen, würde das zuerst bei den Functions-Aufrufen relevant — für den aktuellen Umfang (ein Link-Hub) ist das praktisch ausgeschlossen.

## 8. Muss ich meine Datenschutzerklärung anpassen?

**Erledigt** — `rechtliches/datenschutz.html` enthält jetzt einen eigenen Abschnitt „3. Reichweitenmessung" mit genau der Beschreibung unten, plus eine Korrektur in Abschnitt 2 (dort stand vorher fälschlich „keine Analyse-/Tracking-Werkzeuge"). **Bitte trotzdem selbst prüfen bzw. von jemandem prüfen lassen — das ist keine Rechtsberatung.** Konkret verarbeitet/speichert das System:

- **Was:** Seitenaufrufe und Klicks auf definierte Ziele (z. B. „Heatzone-Link geklickt"), jeweils mit: Datum/Uhrzeit, grobe Herkunftskategorie (z. B. „Instagram", nicht die volle URL), grobe Gerätekategorie (Mobile/Desktop/Tablet).
- **Was NICHT:** keine IP-Adressen, keine Cookies zur Wiedererkennung einzelner Besucher, keine Nutzerprofile, keine Fingerprints, keine Möglichkeit, ein einzelnes Event einer bestimmten Person zuzuordnen.
- **Wie lange:** aktuell zeitlich unbegrenzt (kein automatisches Löschen eingebaut) — du kannst Events jederzeit manuell aus Netlify Blobs löschen, falls gewünscht.
- **Wofür:** ausschließlich um zu sehen, welche Inhalte auf RenditeX funktionieren (Reichweitenmessung in eigener Verantwortung, kein Tracking Dritter, keine Weitergabe an Dritte).
- Für das Admin-Login wird zusätzlich ein einzelnes, technisch notwendiges Session-Cookie gesetzt (`rx_admin_session`) — das betrifft aber nur dich als Admin nach Login, nicht normale Besucher.

## 9. Was muss erledigt sein, bevor ich HeyLink kündigen kann?

(Ergänzt die Migrationsliste aus dem Chat — hier nur der Analytics-Teil:)

- [ ] Die beiden Environment Variables in Netlify setzen (Punkt 3) und deployen.
- [ ] Einmal selbst einloggen und prüfen, dass das Dashboard lädt.
- [ ] Ein paar Tage warten, bis echte Daten hereinkommen, um zu prüfen, dass die Zahlen plausibel wirken.
- [ ] Datenschutzerklärung ergänzen (Punkt 8).
- [ ] Danach: HeyLink-Statistiken (falls du sie exportieren willst) sichern, dann kündigen.

---

## Wie der Admin-Bereich tatsächlich geschützt ist (keine Scheinsicherheit)

- **Wo die Authentifizierung passiert:** serverseitig, in `netlify/functions/analytics-login.js`. Das übermittelte Passwort wird mit `crypto.scryptSync` gegen den in `RENDITEX_ADMIN_PASSWORD_HASH` hinterlegten Hash geprüft (zeitkonstanter Vergleich via `crypto.timingSafeEqual`, verhindert Timing-Angriffe). Es gibt keinen Client-seitigen Vergleich irgendwo im Code.
- **Wo das Secret liegt:** ausschließlich in den Netlify-Environment-Variablen `RENDITEX_ADMIN_PASSWORD_HASH` und `RENDITEX_SESSION_SECRET` — beide nur zur Laufzeit der Functions lesbar, nie im Repository, nie im an den Browser ausgelieferten Code.
- **Wie die Session funktioniert:** Bei erfolgreichem Login setzt der Server ein signiertes Token (HMAC-SHA256 mit `RENDITEX_SESSION_SECRET`) als Cookie — `HttpOnly` (per JavaScript nicht auslesbar), `Secure` (nur über HTTPS übertragen), `SameSite=Lax`, 12 Stunden gültig. Jede nachfolgende Anfrage wird serverseitig anhand der Signatur und des Ablaufdatums geprüft — es gibt keinen serverseitigen Session-Speicher, aber auch keine Möglichkeit, das Cookie zu fälschen, ohne `RENDITEX_SESSION_SECRET` zu kennen.
- **Ist auch die Daten-API geschützt, nicht nur die Seite?** Ja. `netlify/functions/analytics-stats.js` prüft die Session **unabhängig** von der Dashboard-Seite — ein direkter Aufruf von `/api/analytics/stats` ohne gültiges Cookie liefert `401 Unauthorized` und keinerlei Daten, egal ob die URL bekannt ist oder nicht. Das wurde in dieser Session live gegen einen echten lokalen Server getestet (siehe Testprotokoll unten).
- **robots.txt / noindex / unauffälliger Pfad:** vorhanden (`Disallow: /admin/`, `<meta name="robots" content="noindex, nofollow">`, zusätzlicher `X-Robots-Tag`-Header), aber ausdrücklich nur als Zusatzmaßnahme — sie verstecken die Seite vor Suchmaschinen, ersetzen aber nicht die Authentifizierung. Selbst wer die exakte URL kennt, sieht ohne gültiges Passwort keine Daten.
- **Brute-Force-Schutz:** ein einfacher, globaler Zähler (max. 8 Loginversuche pro 10 Minuten, danach `429 Too Many Requests`) — bewusst ohne IP-Speicherung umgesetzt, da nur ein einzelner Admin-Account existiert. Kein Enterprise-Schutz, aber ausreichend gegen automatisiertes Durchprobieren.

## Was getestet wurde — und was noch nach dem echten Deploy geprüft werden sollte

Getestet mit einem echten lokalen Netlify-Function-Server (`netlify dev`), nicht nur durch Code-Lesen:
- ✅ Öffentlicher Event-Endpoint: gültige Events → `204`, ungültige/nicht gelistete Ziele → `400`, falsche HTTP-Methode → `405`
- ✅ Stats-API ohne Session → `401`, mit falscher Passworteingabe → `401`
- ✅ Login mit korrektem Passwort → `200` + korrektes Set-Cookie (HttpOnly/Secure/SameSite=Lax/12h)
- ✅ Logout löscht das Cookie zuverlässig, danach ist die Stats-API wieder `401`
- ✅ Dashboard leitet im echten Browser korrekt zu `/admin/login/` weiter, wenn keine gültige Session vorliegt
- ✅ Login-Formular zeigt bei falschem Passwort die richtige Fehlermeldung, bei richtigem Passwort erfolgreiches Redirect zum Dashboard
- ✅ Alle Seiten mit Tracking funktionieren unverändert normal, wenn der Tracking-Endpoint nicht erreichbar ist (lokale Vorschau ohne Functions) — keine blockierte Navigation, kein sichtbarer Fehler
- ✅ Alle Rechenfunktionen (Kategorien, Top-Links, CTR, Referrer-/Geräte-Klassifizierung, 30-Tage-Zeitreihe) einzeln mit Testdaten verifiziert
- ✅ Mobile Darstellung von Login- und Dashboard-Seite ohne horizontales Scrollen

**Nicht testbar ohne echtes Deployment:** das tatsächliche Schreiben/Lesen der Events in Netlify Blobs — dafür braucht es die echte Netlify-Infrastruktur (in dieser lokalen Umgebung nicht ohne dein Netlify-Login simulierbar). Der Code folgt exakt der offiziellen `@netlify/blobs`-API; ich empfehle, direkt nach dem ersten Deploy einmal die Startseite zu öffnen, ein, zwei Links anzuklicken und danach im Dashboard unter „Heute" zu prüfen, ob die Zahlen ankommen.
