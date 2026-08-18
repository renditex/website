/* ============================================================
   Projektdaten HyperRocket — einzige Stelle, die gepflegt werden muss.
   Wird von /projekte/hyperocket/ UND von der Startseite (Featured
   Project Card, "Heute bei RenditeX", Update-Feed) eingebunden.
   Neue Auszahlung: einfach unten bei withdrawals ergaenzen — Summe,
   Anzahl, Monatswerte, Chart und "seit diesem Video" werden daraus
   automatisch berechnet, nirgends doppelt pflegen.
   ============================================================ */
window.RX_DATA = window.RX_DATA || {};
window.RX_DATA.hyperocket = {
  slug: 'hyperocket',
  name: 'HyperRocket',
  status: 'active', // active | watching | paused | ended

  updatedAt: '2026-08-18', // Datum des Account-Snapshots, einzige Quelle fuer "Stand: ..."
  metaTags: ['Aktiv', 'Praxistest', 'Eigener Account', 'Laufende Updates'],

  websiteUrl: 'https://hyperocket.io/?ref=RenditeX',
  affiliate: true,

  currentAssessment: 'Für meinen Praxistest ist für mich nicht nur interessant, was im Dashboard als Rendite oder ROI angezeigt wird. Entscheidend ist auch, was tatsächlich ausgezahlt werden konnte. Deshalb trenne ich auf dieser Seite bewusst zwischen Dashboard-Zahlen und meinen dokumentierten Auszahlungen.',

  // Momentaufnahme meines eigenen Accounts, exakt so benannt wie im
  // HypeRocket-Dashboard. "Gesamt verdient" und der ROI-Fortschritt
  // sind Dashboard-Begriffe und bewusst NICHT gleich Gewinn/Auszahlung.
  accountSnapshot: {
    date: '2026-08-18',
    activeInvestmentUsdt: 8426.38,
    availableBalanceUsd: 89.67,
    totalEarnedDisplayedUsd: 189.25,
    roiProgressPercent: 47.4,
    roiMaxPercent: 250,
    roiEarnedDisplayedUsd: 3990.57,
    roiTargetDisplayedUsd: 21065.96,
    dailyPerformancePercent: 0.47,
    dailyEarnedDisplayedUsd: 39.60,
    dailyCommissionsUsd: 7.48
  },

  // Echte, tatsaechlich ausgezahlte Betraege (USD-Werte laut Dashboard).
  // Summe, Anzahl, Monatswerte und Chart werden daraus berechnet.
  withdrawals: [
    { date:'2026-08-16', amount:243.47, asset:'USDC', network:'SOL' },
    { date:'2026-08-10', amount:236.51, asset:'USDC', network:'SOL' },
    { date:'2026-08-04', amount:218.26, asset:'USDC', network:'SOL' },
    { date:'2026-07-28', amount:82.16,  asset:'USDC', network:'SOL' },
    { date:'2026-07-26', amount:160.19, asset:'USDC', network:'SOL' },
    { date:'2026-07-22', amount:207.67, asset:'USDC', network:'SOL' },
    { date:'2026-07-17', amount:168.82, asset:'USDC', network:'SOL' },
    { date:'2026-07-13', amount:221.69, asset:'USDC', network:'SOL' },
    { date:'2026-07-08', amount:129.15, asset:'USDC', network:'SOL' },
    { date:'2026-07-05', amount:186.94, asset:'USDC', network:'SOL' },
    { date:'2026-07-01', amount:406.62, asset:'USDC', network:'SOL' },
    { date:'2026-06-21', amount:123.31, asset:'USDC', network:'SOL' },
    { date:'2026-06-18', amount:161.71, asset:'HYPE', network:'SOL' },
    { date:'2026-06-14', amount:312.48, asset:'USDC', network:'SOL' },
    { date:'2026-06-06', amount:168.49, asset:'USDC', network:'SOL' },
    { date:'2026-05-24', amount:122.15, asset:'HYPE', network:'SOL' },
    { date:'2026-05-19', amount:442.77, asset:'USDC', network:'SOL' },
    { date:'2026-05-16', amount:10.00,  asset:'USDC', network:'SOL' }
  ],

  timeline: [
    { dateLabel:'Start', title:'Start meines Praxistests', text:'Ich beginne, HyperRocket direkt selbst zu testen, um mir ein eigenes Bild zu machen.' },
    { dateLabel:'Mai 2026', title:'Erste Auszahlungen dokumentiert', text:'Ab Mitte Mai dokumentiere ich meine ersten tatsächlichen Auszahlungen aus dem eigenen Account.' },
    { dateLabel:'Juni/Juli 2026', title:'Auszahlungen nehmen zu', text:'Weitere Auszahlungen folgen. Juli ist bislang mein stärkster dokumentierter Monat mit 1.563,24 $.' },
    { dateLabel:'August 2026', title:'Weitere Auszahlungen bis 16.08.', text:'Auch im August kommen weitere dokumentierte Auszahlungen hinzu.' },
    { dateLabel:'18.08.2026', title:'Aktueller Account-Snapshot', text:'In meinem aktuellsten Video ordne ich meinen Stand nach fünf Monaten ein — hier halte ich den Account-Stand direkt danach fest.' }
  ],

  // Anbieterangaben aus der offiziellen HypeRocket-Praesentation.
  // WICHTIG: das sind Angaben von HypeRocket, keine von RenditeX
  // unabhaengig verifizierten Fakten — deshalb ueberall "laut
  // Praesentation" statt eigener Aussagen, und klar getrennt von
  // accountSnapshot/withdrawals weiter oben (das sind MEINE Daten).
  presentation: {
    conceptPoints: [
      { title:'Die Verbindung zu Bitopex', text:'Laut HypeRocket-Präsentation basiert das Konzept auf der Trading-Infrastruktur von Bitopex Trading Ltd. und wurde um eine HYPE/USDT-Strategie sowie ein Network-Marketing-Modell erweitert.' },
      { title:'Wer steckt dahinter?', text:'Als CEO bzw. Gründer wird Sven Möller genannt, den ich bereits aus meiner Bitopex-Berichterstattung kenne und mit dem ich auch persönlich gesprochen habe.' },
      { title:'Trading- und HYPE-Komponente', text:'Laut Präsentation wird algorithmisch das Paar HYPE/USDT gehandelt, unter anderem auf OKX und Hyperliquid. Auszahlungen können teilweise in HYPE erfolgen — damit hängt das Ergebnis nicht nur vom Trading ab, sondern zusätzlich von der Kursentwicklung des Tokens.' },
      { title:'ROI-Obergrenze', text:'Laut Präsentation besitzt das Basismodell eine ROI-Obergrenze von 250 %, die durch zusätzliche Pakete verändert werden kann. HypeRocket wirbt zudem mit möglichen täglichen Erträgen von bis zu 1 % — ausdrücklich ohne Renditegarantie.' },
      { title:'Network-Marketing-Modell', text:'Laut Präsentation gibt es zusätzliche Provisionsarten wie Unilevel, Matching sowie Rang- und Infinity-Boni. Diese hängen vom Netzwerk bzw. von Partneraktivitäten ab und sind getrennt vom eigentlichen Trading-Ergebnis zu betrachten.' }
    ],
    history: {
      periodLabel: 'März 2025 bis Mai 2026',
      startCapitalUsdt: 10000,
      cumulativeReturnPercent: 113.0,
      avgMonthlyReturnPercent: 10.4,
      maxDrawdownLabel: '< 5 %',
      positiveMonths: 15,
      totalMonths: 15,
      bestMonth: { label:'Mai 2025', percent:24.7 },
      monthly: [
        { month:'2025-03', performance:3.1 },
        { month:'2025-04', performance:5.1 },
        { month:'2025-05', performance:24.7 },
        { month:'2025-06', performance:5.2 },
        { month:'2025-07', performance:4.2 },
        { month:'2025-08', performance:4.6 },
        { month:'2025-09', performance:15.0 },
        { month:'2025-10', performance:6.7 },
        { month:'2025-11', performance:9.2 },
        { month:'2025-12', performance:8.7 },
        { month:'2026-01', performance:22.0 },
        { month:'2026-02', performance:8.3 },
        { month:'2026-03', performance:10.9 },
        { month:'2026-04', performance:6.5 },
        { month:'2026-05', performance:21.77 }
      ]
    }
  },

  videos: [
    {
      title: 'HypeRocket hat ALLES geändert: Mein Gewinn nach 5 Monaten',
      youtubeUrl: 'https://youtu.be/iPHxi99XNRI',
      publishedAt: '2026-08-05',
      featured: true,
      projectSlug: 'hyperocket',
      description: 'Nach fünf Monaten HyperRocket: mein aktueller Account-Stand und meine bisherigen Auszahlungen.'
    }
  ],

  interview: null,

  positives: [
    { title:'Mehrere Monate Beobachtung', text:'Der Test basiert nicht nur auf einer einzelnen Momentaufnahme, sondern auf mehreren Monaten eigener Erfahrung.' },
    { title:'Tatsächliche Auszahlungen dokumentiert', text:'Ich kann mittlerweile mehrere reale Auszahlungen aus meinem eigenen Account nachvollziehen.' },
    { title:'Laufende Dokumentation', text:'Die Seite kann künftig mit neuen Account-Ständen und Auszahlungen aktualisiert werden.' }
  ],
  considerations: [
    { title:'Auszahlung ist nicht automatisch Gewinn', text:'Die hier gezeigten Auszahlungsbeträge dürfen nicht automatisch mit meinem Nettogewinn gleichgesetzt werden.' },
    { title:'Dashboard-Werte richtig einordnen', text:'Begriffe wie ROI-Fortschritt oder „verdient“ stammen aus dem HypeRocket-Dashboard und werden hier entsprechend gekennzeichnet.' },
    { title:'Vergangene Ergebnisse sagen nichts über die Zukunft', text:'Auch bisherige Auszahlungen garantieren keine zukünftigen Ergebnisse.' }
  ],

  risks: [
    { title:'Plattformrisiko', text:'Mein Kapital ist von der Funktionsfähigkeit und Zahlungsfähigkeit der beteiligten Plattform bzw. Strukturen abhängig.' },
    { title:'Gegenparteirisiko', text:'Du bist von der Zuverlässigkeit des Unternehmens hinter der Plattform abhängig.' },
    { title:'Kapitalverlustrisiko', text:'Konditionen können sich ändern, und ein Totalverlust des eingesetzten Kapitals ist grundsätzlich möglich.' },
    { title:'HYPE-Kursrisiko', text:'Wenn Erträge in HYPE gehalten werden, kann sich der Wert durch Kursbewegungen sowohl erhöhen als auch erheblich reduzieren.' },
    { title:'Vergütungsmodell', text:'Ein Teil des HypeRocket-Modells basiert auf Network-Marketing- und Provisionsstrukturen. Diese Einnahmen sind nicht mit der reinen Trading-Performance gleichzusetzen und hängen von zusätzlichen Faktoren ab.' },
    { title:'Eigenes Risiko', text:'Das ist mein persönlicher Test und keine Empfehlung, denselben Betrag oder überhaupt Geld zu investieren.' }
  ],

  faq: [
    { q:'Wie viel habe ich aktuell bei HyperRocket investiert?', a:'Mein Account zeigt am 18.08.2026 eine aktive Investition von 8.426,38 USDT.' },
    { q:'Wie viel wurde bisher ausgezahlt?', a:'Die hier dokumentierten 18 Auszahlungen ergeben zusammen 3.602,39 $.' },
    { q:'Sind 3.602,39 $ mein Gewinn?', a:'Nicht automatisch. Auf der Seite werden Auszahlungen bewusst getrennt von Gewinn bzw. anderen Dashboard-Kennzahlen dargestellt.' },
    { q:'Was bedeutet der ROI-Fortschritt von 47,4 %?', a:'Das ist die Bezeichnung bzw. Darstellung in meinem HypeRocket-Dashboard. Die Seite leitet daraus keine zusätzlichen Versprechen oder Garantien ab.' },
    { q:'Wie aktuell sind die Daten?', a:'Der aktuelle Account-Snapshot ist vom 18.08.2026. Die letzte hier dokumentierte Auszahlung stammt vom 16.08.2026.' },
    { q:'Ist der Link zu HyperRocket ein Partnerlink?', a:'Ja. Wenn du dich darüber registrierst, kann ich eine Vergütung erhalten. Für dich entstehen dadurch keine zusätzlichen Kosten.' }
  ],

  related: [
    { kicker:'Projekt', label:'Bitopex', href:'/projekte/bitopex/', desc:'Mein laufender Praxistest von Bitopex — Copy-Trading mit 0DTE und ALT-0DTE.' },
    { kicker:'Tool', label:'Scam-Check', href:'/scam-check/', desc:'Zwölf Warnsignale für Krypto-Betrug zum Ankreuzen — bevor du irgendwo Geld einzahlst.' },
    { kicker:'Tool', label:'Fear & Greed Index', href:'/fear-greed/', desc:'Zeigt, ob im Markt gerade Angst oder Gier herrscht.' },
    { kicker:'Tool', label:'Heatzone Chart', href:'/heatzone-chart/', desc:'Ist Bitcoin gerade günstig oder teuer bewertet?' }
  ]
};
