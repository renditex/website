/* ============================================================
   Projektdaten DeFi Circle — einzige Stelle, die fuer die
   persoenlichen/zeitlichen Angaben gepflegt werden muss (Level-
   Stand, Timeline, Videos, Einschaetzung, Risiken, FAQ). Die
   strukturellen Erklaerbereiche (Level-System, Burn-Mechanismus,
   Token-Oekosystem, Holder-Level, Learning & Tools, Elite & Netzwerk)
   sind bewusst direkt in projekte/defi-circle/index.html geschrieben,
   nicht hier — das ist stabiler Referenztext ueber das System, keine
   sich haeufig aendernde Kennzahl. Siehe project.js fuer die
   generischen Renderer (Timeline/Video/Einschaetzung/Risiken/FAQ),
   die dieses Objekt ueber RX.project.init() konsumieren.
   ============================================================ */
window.RX_DATA = window.RX_DATA || {};
window.RX_DATA.deficircle = {
  slug: 'defi-circle',
  name: 'DeFi Circle',
  status: 'active',

  updatedAt: '2026-08-20',
  metaTags: ['Aktiv', 'Praxistest', 'DeFi', 'Community & Learning'],

  // Persoenliche Eckdaten fuer Hero-Kennzahlen und "Mein aktueller Stand".
  // Bewusst keine genauen Monate/Datumsangaben, wo ich sie nicht sicher
  // weiss — siehe ANALYTICS/PROJEKT-Grundsatz "keine Daten erfinden".
  personal: {
    memberSinceLabel: 'über 1 Jahr',
    currentLevel: 'Elite',
    eliteSinceLabel: 'seit rund 2 Monaten',
    pathBeforeLabel: 'Fundamentals → Breakthrough',
    focusLabel: 'DeFi lernen & selbst anwenden',
    developmentMultipleLabel: '≈ 8x',
    developmentNote: 'Entwicklung meines eigenen eingesetzten Kapitals (ursprünglich rund 7.000–8.000 €) seit meinem Einstieg vor über einem Jahr. Eine persönliche, historische Entwicklung — keine Prognose, keine typische oder garantierte Rendite und keine Aussage darüber, wie sich BURN oder andere Bestandteile künftig entwickeln. Nicht auf andere Nutzer übertragbar.',
    strategiesNote: 'Ich setze inzwischen auch eigene Strategien im DeFi Circle um. Die Details dazu veröffentliche ich aktuell bewusst nicht.'
  },

  aboutText: 'Der DeFi Circle ist für mich in erster Linie kein klassisches Investmentprodukt, sondern der Ort, an dem ich mich seit über einem Jahr intensiv mit DeFi beschäftige und weiterentwickle — eine Community rund um DeFi, Learning, Strategien, Protokolle, Tools und Bots, organisiert vor allem über Discord als Community- und Call-Zentrale. Der Kerngedanke, der mich am meisten überzeugt: erst verstehen, dann anwenden.',

  timeline: [
    { dateLabel:'Vor über einem Jahr', title:'Einstieg über Basic', text:'Ich lerne den DeFi Circle über den kostenlosen Basic-Zugang kennen — Community, Orientierung und erste Inhalte.' },
    { dateLabel:'Fundamentals', title:'Grundlagen strukturiert', text:'Mit dem Fundamentals-Zugang durchlaufe ich strukturierte Lerninhalte zu DeFi-Grundlagen, Protokollen und dem Ökosystem — inklusive regelmäßigem Austausch.' },
    { dateLabel:'Breakthrough', title:'Tiefer in Anwendung und Strategien', text:'Breakthrough geht deutlich tiefer in die praktische Anwendung — Tools, Bots und der Gedanke „erst verstehen, dann anwenden“ stehen im Vordergrund.' },
    { dateLabel:'Seit rund 2 Monaten', title:'Elite', text:'Ich gehöre inzwischen zur Elite und bin damit stärker an der Weiterentwicklung des Ökosystems beteiligt, statt nur Inhalte zu konsumieren.' }
  ],

  // Keine belastbaren, aktuellen Videos zu DeFi Circle im Projekt
  // vorhanden — bewusst leer statt einer erfundenen URL. Sobald ein
  // echtes Video existiert, hier eintragen (siehe Bitopex/HyperRocket/
  // SmartIT fuer das erwartete Datenformat).
  videos: [],
  interview: null,

  currentAssessment: 'Der eigentliche Mehrwert ist für mich nicht ein einzelner Kurs oder eine einzelne Kennzahl, sondern der Lernweg selbst: DeFi nicht nur theoretisch verstehen, sondern selbst anwenden — und mich dabei laufend mit anderen austauschen, die dieselben Themen praktisch angehen.',
  positives: [
    { title:'Strukturierter Lernweg', text:'Fundamentals, Breakthrough und Deep Dive bauen spürbar aufeinander auf, statt unzusammenhängender Einzelinhalte.' },
    { title:'Community statt Einzelkonsum', text:'Calls, Austausch und gemeinsame Analyse sind für mich der eigentliche Unterschied zu reinem Lernvideo-Konsum.' },
    { title:'Eigene Anwendung möglich', text:'Ich setze inzwischen eigene Strategien um, statt nur zuzusehen.' }
  ],
  considerations: [
    { title:'Zugang läuft über Burn, nicht über Abo', text:'Fundamentals und Breakthrough werden über einen Burn-Mechanismus freigeschaltet — das lohnt sich zu verstehen, bevor man startet.' },
    { title:'Elite ist eine andere Kategorie', text:'Elite basiert auf dem Halten eines hohen BURN-Gegenwerts, nicht auf einem weiteren Burn-Schritt — leicht zu verwechseln.' },
    { title:'DeFi bleibt komplex', text:'Der Zugang zum Circle ersetzt kein eigenes Verständnis von Smart-Contract- und Protokollrisiken.' }
  ],

  risks: [
    { title:'Tokenrisiko', text:'BURN kann stark im Wert schwanken. Der Burn-Mechanismus garantiert keinen steigenden Kurs.' },
    { title:'DeFi-Risiko', text:'Smart Contracts können Fehler oder Schwachstellen enthalten.' },
    { title:'Protokollrisiko', text:'Externe Protokolle, mit denen im DeFi Circle gearbeitet wird, können ausfallen oder gehackt werden.' },
    { title:'Liquidationsrisiko', text:'Bei Lending/Borrowing bzw. gehebelten Strategien können Liquidationen auftreten.' },
    { title:'Gegenparteirisiko', text:'Je nach genutzter Strategie bzw. Plattform innerhalb des Ökosystems.' },
    { title:'Wallet-/Security-Risiko', text:'Private Keys, Signaturen, Phishing und falsche Transaktionen bleiben eigene Verantwortung.' },
    { title:'Totalverlustrisiko', text:'Eingesetztes Kapital kann teilweise oder vollständig verloren gehen.' },
    { title:'Komplexität', text:'DeFi verlangt eigenes Verständnis. Eine Strategie sollte nicht nur deshalb genutzt werden, weil sie jemand anderes vorstellt.' }
  ],

  faq: [
    { q:'Ist der DeFi Circle eine klassische Mitgliedschaft?', a:'Nein. Fundamentals und Breakthrough werden über einen Burn-Mechanismus freigeschaltet, nicht über einen laufenden Mitgliedsbeitrag.' },
    { q:'Was bedeutet Elite konkret?', a:'Elite setzt das Halten von BURN im Gegenwert von 1.000.000 USD voraus — nicht das Verbrennen dieses Betrags. Elite-Mitglieder sind stärker an der Weiterentwicklung des Ökosystems beteiligt.' },
    { q:'Steigt der Kurs automatisch durch den Burn?', a:'Nein. Durch das Verbrennen wird das verfügbare Angebot reduziert. Bleibt die Nachfrage gleich oder steigt sie, kann das den Preis unterstützen — ein Kursanstieg ist dadurch aber nicht garantiert.' },
    { q:'Zeigt diese Seite meinen aktuellen Depotwert?', a:'Nein. Ich zeige hier bewusst nur die relative Entwicklung (≈8x) meines eigenen eingesetzten Kapitals, keinen aktuellen Euro-Betrag.' },
    { q:'Beschreibst du deine eigenen Strategien im Detail?', a:'Aktuell nicht öffentlich. Ich dokumentiere hier meinen Lernweg und das System, nicht meine konkreten Strategien.' }
  ],

  related: [
    { kicker:'Projekt', label:'Bitopex', href:'/projekte/bitopex/', desc:'Mein laufender Praxistest von Bitopex — Copy-Trading mit 0DTE und ALT-0DTE.' },
    { kicker:'Projekt', label:'SmartIT', href:'/projekte/smartit/', desc:'Mein Staking-Setup rund um den SIT-Token, mit Positionen und Rewards-Stand.' },
    { kicker:'Tool', label:'Scam-Check', href:'/scam-check/', desc:'Zwölf Warnsignale für Krypto-Betrug zum Ankreuzen — bevor du irgendwo Geld einzahlst.' },
    { kicker:'Wissen', label:'Krypto-Guide', href:'/#wissen', desc:'Grundlagen, DeFi, Sicherheit und Steuern — kostenlos als PDF.' }
  ]
};
