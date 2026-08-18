/* ============================================================
   Projektdaten Bitopex — einzige Stelle, die gepflegt werden muss.
   Wird von /projekte/bitopex/ UND von der Startseite (Featured
   Project Card, "Heute bei RenditeX", Update-Feed) eingebunden.
   Neue Werte hier eintragen (v.a. weeklyPerformance), alle
   abhaengigen Stellen ziehen automatisch nach — nirgends doppelt
   pflegen.
   ============================================================ */
window.RX_DATA = window.RX_DATA || {};
window.RX_DATA.bitopex = {
  slug: 'bitopex',
  name: 'Bitopex',
  status: 'active', // active | watching | paused | ended

  testStartedAt: '2025-04', // mein persoenlicher Live-Test
  publicSince: '2026-04',   // seit wann oeffentlich zugaenglich
  updatedAt: '2026-08-17',  // einzige Quelle fuer "Stand: ..."
  focusLabel: 'Copy Trading',

  websiteUrl: 'https://bitopex.io/?ref=51dc337877d4',
  affiliate: true,

  currentAssessment: 'Ich begleite Bitopex inzwischen seit April 2025. Eine einzelne gute Woche ist für mich deshalb deutlich weniger interessant als die Frage, wie sich das Ganze über einen längeren Zeitraum und auch in schwierigeren Marktphasen entwickelt. Genau deshalb dokumentiere ich hier laufend weiter, statt bei einem einzelnen Video stehen zu bleiben.',

  // Zwei Strategien, die ich dokumentiere. Reihenfolge = Reihenfolge im Chart/den Karten.
  performanceSeries: [
    { key:'zeroDTE',    label:'0DTE',     color:'#0052FF' },
    { key:'altZeroDTE', label:'ALT-0DTE', color:'#0E9488' }
  ],
  // Werte sind Prozentpunkte je Woche: 0.23 = +0,23 %
  weeklyPerformance: [
    { date:'2026-07-15', zeroDTE:0.13, altZeroDTE:0.05 },
    { date:'2026-07-19', zeroDTE:0.30, altZeroDTE:0.82 },
    { date:'2026-07-26', zeroDTE:0.33, altZeroDTE:0.94 },
    { date:'2026-08-06', zeroDTE:0.07, altZeroDTE:0.10 },
    { date:'2026-08-09', zeroDTE:0.20, altZeroDTE:0.73 },
    { date:'2026-08-13', zeroDTE:0.15, altZeroDTE:0.27 },
    { date:'2026-08-16', zeroDTE:0.23, altZeroDTE:0.36 }
  ],

  timeline: [
    { date:'2025-04', dateLabel:'April 2025', title:'Start meines Live-Tests', text:'Ich beginne, Bitopex und die Strategien selbst live am Markt zu verfolgen.' },
    { date:'2025-06', dateLabel:'2025', title:'Erste längere Erfahrungsphase', text:'Die Strategie wird nicht anhand alter Marktdaten rückwirkend berechnet, sondern unter realen Marktbedingungen verfolgt.' },
    { date:'2025-09', dateLabel:'später', title:'Erste YouTube-Berichterstattung', text:'Meine Videos zu Bitopex entstehen erst, nachdem ich bereits eigene Erfahrungen gesammelt habe.' },
    { date:'2026-04', dateLabel:'April 2026', title:'Öffentlicher Zugang', text:'Seit April 2026 ist das Angebot nach meinem bisherigen Stand für alle zugänglich.' },
    { date:'2026-07', dateLabel:'Juli/August 2026', title:'Regelmäßige RenditeX-Updates', text:'Ich dokumentiere 0DTE und ALT-0DTE inzwischen regelmäßig.' }
  ],

  videos: [
    {
      title: '1 Jahr Bitopex: +20 % Gewinn trotz Bitcoin-Crash und rotem Kryptomarkt',
      youtubeUrl: 'https://youtu.be/rcBnV1LfkyA',
      publishedAt: '2026-06-10',
      featured: true,
      projectSlug: 'bitopex',
      description: 'Nach einem Jahr Bitopex: mein Ergebnis von +20 % trotz Bitcoin-Crash und rotem Kryptomarkt.'
    }
  ],

  // TODO Viktor: echten Interview-Link ergaenzen, sobald vorhanden
  // {title:'...', youtubeUrl:'...'}
  interview: null,

  positives: [
    { title:'Längerer Live-Zeitraum', text:'Ich begleite das Thema seit April 2025 und kann dadurch mehr beurteilen als nur einzelne Wochen.' },
    { title:'Regelmäßige Ergebnisse', text:'Durch die laufenden Updates lassen sich 0DTE und ALT-0DTE über einen längeren Zeitraum vergleichen.' },
    { title:'Kein reiner Backtest', text:'Für mich ist entscheidend, wie eine Strategie unter realen Marktbedingungen funktioniert — nicht nur, wie sie rückwirkend ausgesehen hätte.' }
  ],
  considerations: [
    { title:'Ergebnisse schwanken', text:'Einzelne Wochen können deutlich unterschiedlich ausfallen.' },
    { title:'Vergangene Performance ist keine Garantie', text:'Auch längere positive Phasen sagen nichts Sicheres über zukünftige Ergebnisse aus.' }
  ],

  risks: [
    { title:'Tradingrisiko', text:'Verlustphasen gehören grundsätzlich zu Tradingstrategien, auch bei bislang positivem Verlauf.' },
    { title:'Plattformrisiko', text:'Neben der eigentlichen Strategie besteht ein Risiko durch die verwendete Plattform selbst.' },
    { title:'Gegenparteirisiko', text:'Du bist von der Zuverlässigkeit des Unternehmens hinter der Plattform und beteiligter Dienstleister abhängig.' }
  ],

  faq: [
    { q:'Seit wann testest du Bitopex?', a:'Seit April 2025.' },
    { q:'Waren deine ersten YouTube-Videos gleichzeitig der Beginn deines Tests?', a:'Nein. Ich habe Bitopex bereits vorher live verfolgt und erst später begonnen, auf YouTube darüber zu berichten.' },
    { q:'Ist das ein Backtest?', a:'Nein. Meine Berichterstattung bezieht sich auf einen laufenden Test unter realen Marktbedingungen, kein rückwirkend berechnetes Backtesting mit historischen Daten.' },
    { q:'Wie aktuell sind die Zahlen?', a:'Das Datum des letzten dokumentierten Wochenupdates steht direkt über dem Chart und oben im Kopfbereich der Seite.' },
    { q:'Sind die Ergebnisse garantiert?', a:'Nein. Vergangene Ergebnisse lassen keine verlässliche Aussage über zukünftige Ergebnisse zu.' },
    { q:'Ist der Link zu Bitopex ein Partnerlink?', a:'Ja. Wenn du dich darüber registrierst, kann ich eine Vergütung erhalten. Für dich entstehen dadurch keine zusätzlichen Kosten.' }
  ],

  related: [
    { kicker:'Tool', label:'Fear & Greed Index', href:'/fear-greed/', desc:'Zeigt, ob im Markt gerade Angst oder Gier herrscht.' },
    { kicker:'Tool', label:'Heatzone Chart', href:'/heatzone-chart/', desc:'Ist Bitcoin gerade günstig oder teuer bewertet?' },
    { kicker:'Tool', label:'Sparplan-Rechner', href:'/sparplan-rechner/', desc:'Was wäre aus einem Sparplan geworden? Mit echten Kursen.' },
    { kicker:'Wissen', label:'Scam-Check', href:'/scam-check/', desc:'Zwölf Warnsignale für Krypto-Betrug zum Ankreuzen.' }
  ]
};
