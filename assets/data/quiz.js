/* ============================================================
   RenditeX Krypto-Quiz — Fragen direkt aus dem RenditeX-Krypto-Guide
   (Stand Mai 2026) abgeleitet, nichts frei erfunden. Vier Stufen mit
   steigendem Schwierigkeitsgrad:
   - anfaenger: Begriffe/Fakten direkt aus Kapitel 1-2
   - mittel:    Zusammenhänge aus Kapitel 2-4
   - schwer:    Anwendung/Details aus Kapitel 5-7
   - extraschwer: Verknüpfung mehrerer Kapitel, Feinheiten

   Jede Frage: { q, choices:[4 Optionen], correct: Index, why: kurze
   Begründung, die nach der Antwort angezeigt wird }. Neue Fragen
   einfach am Ende der jeweiligen Stufe ergänzen.
   ============================================================ */
window.RX_DATA = window.RX_DATA || {};
window.RX_DATA.quiz = {
  levels: [
    {
      id: 'anfaenger',
      label: 'Anfänger',
      description: 'Grundbegriffe aus den ersten beiden Kapiteln des Guides.',
      questions: [
        { q: 'Was ist beim Umgang mit Kryptowerten anders als bei einem klassischen Bankkonto?', choices: ['Es gibt keine Kurse', 'Du kannst die Werte selbst verwahren und direkt übertragen', 'Alles läuft nur über eine App', 'Es gibt keine Risiken'], correct: 1, why: 'Genau das ist laut Guide der wichtigste Unterschied — Selbstverwahrung bringt Freiheit, aber auch Eigenverantwortung.' },
        { q: 'Wie viele Bitcoin wird es laut Guide maximal geben?', choices: ['100 Millionen', '21 Millionen', '1 Milliarde', 'Unbegrenzt viele'], correct: 1, why: 'Die Begrenzung auf 21 Millionen Einheiten gilt als einer der Gründe, warum Bitcoin oft „digitales Gold" genannt wird.' },
        { q: 'Wie lässt sich eine Blockchain am ehesten beschreiben?', choices: ['Eine private Excel-Tabelle einer Bank', 'Ein öffentliches, digitales Kassenbuch', 'Ein Passwort-Manager', 'Eine Kryptowährung selbst'], correct: 1, why: 'Transaktionen werden in Blöcken gesammelt, kryptografisch gesichert und von vielen Teilnehmern geprüft.' },
        { q: 'Was verwaltet dein Wallet eigentlich?', choices: ['Deine Coins direkt', 'Die Schlüssel, mit denen du auf deine Coins zugreifst', 'Nur deine Login-Daten', 'Die gesamte Blockchain'], correct: 1, why: 'Die Blockchain speichert, welcher Adresse welche Coins gehören — das Wallet verwaltet nur die Zugriffsschlüssel.' },
        { q: 'Was ist der Private Key?', choices: ['Deine Kontonummer, die du weitergeben kannst', 'Der Schlüssel zu deinen Coins, der niemals geteilt werden darf', 'Der Name deines Wallets', 'Ein öffentliches Passwort'], correct: 1, why: 'Der Public Key bzw. die Adresse darf geteilt werden, der Private Key niemals.' },
        { q: 'Aus wie vielen Wörtern besteht eine Seed Phrase laut Guide meistens?', choices: ['4 oder 6', '12 oder 24', '50 oder mehr', 'Genau 8'], correct: 1, why: '12 oder 24 Wörter sind laut Guide üblich — mit ihnen lässt sich ein Wallet vollständig wiederherstellen.' },
        { q: 'Was solltest du laut Guide mit deiner Seed Phrase niemals tun?', choices: ['Sie offline auf Papier notieren', 'Sie fotografieren oder in der Cloud speichern', 'Sie an einem sicheren Ort aufbewahren', 'Sie zur Wallet-Wiederherstellung nutzen'], correct: 1, why: 'Fotografieren, Cloud-Speicherung oder Versand per Chat gelten als klare No-Gos.' },
        { q: 'Was ist ein Stablecoin?', choices: ['Ein besonders volatiler Coin', 'Ein Token, der den Wert einer Währung wie US-Dollar möglichst stabil abbilden soll', 'Eine Hardware Wallet', 'Ein anderer Name für Bitcoin'], correct: 1, why: 'Stablecoins versuchen, den Wert einer staatlichen Währung abzubilden — praktisch zum schnellen Wechseln im Markt.' }
      ]
    },
    {
      id: 'mittel',
      label: 'Mittel',
      description: 'Zusammenhänge aus den Kapiteln zu Wallets, Sicherheit und Einstieg.',
      questions: [
        { q: 'Was unterscheidet einen Coin von einem Token?', choices: ['Coins laufen auf einer eigenen Blockchain, Tokens auf bestehenden Blockchains', 'Tokens sind immer teurer', 'Coins gibt es nur bei Bitcoin', 'Es gibt keinen Unterschied'], correct: 0, why: 'Bitcoin läuft auf der Bitcoin-Blockchain, viele DeFi-Tokens dagegen z. B. auf Ethereum, Arbitrum, Base oder Solana.' },
        { q: 'Welches Konsensverfahren nutzt Ethereum seit dem „Merge"?', choices: ['Proof of Work', 'Proof of Stake', 'Proof of Authority', 'Gar keines'], correct: 1, why: 'Validatoren sichern das Netzwerk, indem sie ETH hinterlegen — das spart Energie, bringt aber andere Risiken mit sich.' },
        { q: 'Was ist laut Guide das größte Risiko bei einem Custodial Wallet bzw. Börsen-Konto?', choices: ['Zu hohe Sicherheit', 'Du bist von Anbieter, Login und Auszahlung abhängig, weil die Plattform die Coins verwahrt', 'Es kostet immer eine Gebühr', 'Es funktioniert nur offline'], correct: 1, why: 'Die Plattform verwahrt die Coins — bei Problemen mit dem Anbieter bist du auf Login und Auszahlung angewiesen.' },
        { q: 'Warum eignet sich Dollar-Cost Averaging (DCA) laut Guide besonders für Einsteiger?', choices: ['Es garantiert Gewinne', 'Es verteilt das Risiko über die Zeit und erzeugt weniger Stress', 'Es ist die einzige legale Kaufmethode', 'Es funktioniert nur bei fallenden Kursen'], correct: 1, why: 'Regelmäßige feste Beträge statt eines großen Einmalkaufs senken das Risiko eines schlechten Einstiegszeitpunkts — schützen aber nicht vor Verlusten.' },
        { q: 'Was ist ein „Token Approval" (Freigabe)?', choices: ['Eine Bestätigungs-E-Mail der Börse', 'Eine Erlaubnis, mit der ein Smart Contract bestimmte Tokens aus deinem Wallet bewegen darf', 'Ein Zertifikat für Hardware Wallets', 'Ein anderer Name für die Seed Phrase'], correct: 1, why: 'Genau hier warnt der Guide: nicht die Wallet-Verbindung allein ist riskant, sondern eine unbedachte Freigabe oder Signatur.' },
        { q: 'Warum gilt SMS-2FA laut Guide als weniger sicher als eine Authenticator-App?', choices: ['SMS ist langsamer', 'SMS-2FA ist anfälliger für SIM-Swapping', 'SMS kostet Geld', 'SMS funktioniert nicht im Ausland'], correct: 1, why: 'Beim SIM-Swapping übernehmen Angreifer deine Telefonnummer und damit potenziell auch den SMS-Code.' },
        { q: 'Welcher Punkt gehört laut Guide NICHT zu den empfohlenen Prüfkriterien für eine Krypto-Börse?', choices: ['Regulierung und Standort', 'Gebührenstruktur', 'Ob die App ein auffälliges Farbschema hat', 'Ob eine Auszahlung aufs eigene Wallet möglich ist'], correct: 2, why: 'Design bzw. Farbschema wird im Guide explizit als weniger wichtig genannt als Regulierung, Gebühren, Auszahlung und Sicherheit.' },
        { q: 'Wo sollte man laut Guide eine Hardware Wallet kaufen?', choices: ['Bei jedem Online-Marktplatz, Hauptsache günstig', 'Möglichst direkt beim Hersteller oder bei sehr vertrauenswürdigen Händlern', 'Nur gebraucht, das spart Geld', 'Ausschließlich über Social-Media-Anzeigen'], correct: 1, why: 'Manipulierte Geräte aus unsicheren Quellen sind ein bekanntes Risiko — deshalb der Rat zu offiziellen Bezugsquellen.' }
      ]
    },
    {
      id: 'schwer',
      label: 'Schwer',
      description: 'Details zu Projekten, DeFi und den Steuer-Grundlagen aus dem Guide.',
      questions: [
        { q: 'Als was wird Chainlink (LINK) im Guide eingeordnet?', choices: ['Smart-Contract-Plattform', 'Oracle-Netzwerk, das externe Daten wie Preise in Smart Contracts bringt', 'Stablecoin', 'Zahlungsnetzwerk'], correct: 1, why: 'Chainlink wird explizit als Oracle-Netzwerk kategorisiert, nicht als eigene Smart-Contract-Plattform.' },
        { q: 'Was beschreibt der Guide als Kernstärke von Solana im Vergleich zu den anderen genannten Plattformen?', choices: ['Besonders viele Bücher darüber', 'Hohe Geschwindigkeit, niedrige Gebühren, starkes App- und Meme-Coin-Ökosystem', 'Als einzige Plattform Proof of Work', 'Keine Smart Contracts'], correct: 1, why: 'Genau diese drei Punkte nennt der Guide für Solana in der Projekt-Übersicht.' },
        { q: 'Welches der folgenden ist laut Guide ein DeFi-Risiko, das nicht direkt mit einem Smart-Contract-Bug zusammenhängt?', choices: ['Protokollfehler', 'Liquidationsrisiko bei geliehenen Assets', 'Hacks', 'Fehler im Vertragscode'], correct: 1, why: 'Das Liquidationsrisiko entsteht durch Marktbewegungen bei besicherten Krediten, nicht durch einen Programmierfehler.' },
        { q: 'Nach welcher Haltedauer ist ein Verkauf von Kryptowerten im Privatvermögen in Deutschland laut Guide in vielen Fällen steuerfrei?', choices: ['Nach 6 Monaten', 'Nach mehr als einem Jahr', 'Nie, Krypto ist immer steuerpflichtig', 'Nach 5 Jahren'], correct: 1, why: 'Nach über einem Jahr Haltedauer ist ein Verkauf im Privatvermögen in vielen Fällen steuerfrei — die sogenannte Einjahresfrist.' },
        { q: 'Wie hoch ist seit 2024 die relevante Freigrenze für private Veräußerungsgeschäfte mit Krypto?', choices: ['600 Euro', 'Weniger als 1.000 Euro Gewinn im Kalenderjahr', '10.000 Euro', 'Es gibt keine Grenze'], correct: 1, why: 'Seit 2024 liegt diese Freigrenze laut Guide bei unter 1.000 Euro Gewinn pro Kalenderjahr.' },
        { q: 'Seit wann gelten laut Guide die MiCA-Regeln für Krypto-Dienstleister?', choices: ['Seit 30. Juni 2024', 'Seit 30. Dezember 2024', 'Seit 1. Januar 2020', 'Sie gelten noch nicht'], correct: 1, why: 'Die Regeln für Asset-Referenced Tokens und E-Money Tokens galten schon ab Juni 2024, für Krypto-Dienstleister erst ab Dezember 2024.' },
        { q: 'Was ist Liquid Staking laut Guide?', choices: ['Eine Methode, bei der man ETH staked und dafür einen handelbaren Staking-Token erhält', 'Eine besonders liquide Börse', 'Ein anderer Name für Mining', 'Eine Steuerstrategie'], correct: 0, why: 'Beispiele im Guide sind Lido und Rocket Pool — man erhält einen handelbaren Token als Gegenwert für die gestakten Coins.' },
        { q: 'Welche zwei Angaben gehören laut Guide unter anderem zur Dokumentation einer Krypto-Transaktion für die Steuer?', choices: ['Nur der Betrag in Euro', 'Datum/Uhrzeit UND der Zweck der Transaktion (z. B. Kauf, Tausch, Staking)', 'Nur der Name der Börse', 'Nichts davon ist nötig'], correct: 1, why: 'Der Guide listet u. a. Datum, Uhrzeit, Coin, Gegenwert, Gebühren, Netzwerk, Wallet-Adressen und den Zweck der Transaktion.' }
      ]
    },
    {
      id: 'extraschwer',
      label: 'Extra schwer',
      description: 'Feinheiten und Verknüpfungen über mehrere Kapitel hinweg.',
      questions: [
        { q: 'Warum kann laut Guide auch ein reiner Krypto-gegen-Krypto-Tausch steuerlich relevant sein?', choices: ['Weil er wie eine Veräußerung behandelt werden kann', 'Weil Tauschbörsen höhere Gebühren nehmen', 'Weil das nur bei Stablecoins gilt', 'Das ist laut Guide nie der Fall'], correct: 0, why: 'Auch ein Tausch Krypto gegen Krypto oder das Bezahlen mit Krypto kann steuerlich eine Veräußerung darstellen.' },
        { q: 'Was ist der entscheidende Unterschied zwischen einer „Freigrenze" und einem „Freibetrag" im steuerlichen Kontext des Guides?', choices: ['Es gibt keinen Unterschied', 'Bei Überschreiten einer Freigrenze wird der gesamte Gewinn steuerpflichtig, bei einem Freibetrag nur der übersteigende Teil', 'Ein Freibetrag gilt nur für Bitcoin', 'Die Freigrenze betrifft nur DeFi'], correct: 1, why: 'Genau das betont der Guide ausdrücklich — wird die Freigrenze überschritten, kann der komplette Gewinn relevant werden.' },
        { q: 'Welches Netzwerk nennt der Guide neben Ethereum ebenfalls als Ort, an dem Tokens ausgegeben werden?', choices: ['Nur Bitcoin', 'Arbitrum, Base oder Solana', 'Nur Gold-gedeckte Systeme', 'Es gibt kein anderes'], correct: 1, why: 'Der Guide nennt explizit Arbitrum, Base und Solana als weitere Netzwerke für DeFi-, Gaming- oder Community-Tokens.' },
        { q: 'Warum reicht laut Guide eine reine Wallet-Verbindung mit einer Website allein oft noch nicht als Warnsignal — was ist der eigentlich kritische Moment?', choices: ['Die Verbindung selbst ist bereits immer gefährlich', 'Erst eine unbedachte Freigabe oder Signatur kann gefährlich werden', 'Nur die Farbe der Website zählt', 'Wallet-Verbindungen sind ganz ohne Ausnahme harmlos'], correct: 1, why: 'Der Guide unterscheidet bewusst: eine Verbindung ist nicht automatisch gefährlich, eine Freigabe oder Signatur kann es aber sein.' },
        { q: 'Warum können DeFi-Erträge wie Staking oder Lending laut Guide steuerlich zu zwei unterschiedlichen Zeitpunkten relevant werden?', choices: ['Einmal beim Zufluss der Erträge und erneut bei einem späteren Verkauf', 'Nur beim Verkauf, nie beim Zufluss', 'Nur einmal im Jahr automatisch', 'DeFi-Erträge sind grundsätzlich steuerfrei'], correct: 0, why: 'Der Zufluss selbst kann relevant sein, und ein späterer Verkauf der erhaltenen Coins kann erneut steuerlich geprüft werden.' },
        { q: 'Was macht Proof of Stake laut Guide nicht automatisch zu einer risikofreien Alternative zu Proof of Work?', choices: ['Es ist langsamer', 'Es bringt andere Abhängigkeiten mit sich, etwa rund um Staking-Anbieter oder Liquid-Staking-Protokolle', 'Es verbraucht mehr Energie', 'Es existiert nur theoretisch'], correct: 1, why: 'Der Guide stellt klar: Proof of Stake spart Energie, aber die neuen Abhängigkeiten sind ein eigenes Risiko.' },
        { q: 'Welche Kombination aus Prüfpunkten für ein Krypto-Projekt nennt der Guide sinnvoll?', choices: ['Logo-Design, Follower-Zahl, Website-Ladezeit', 'Gelöstes Problem, Tokenomics/Verteilung und regulatorische Risiken', 'Nur der aktuelle Kurs', 'Nur die Marktkapitalisierung'], correct: 1, why: 'Der Guide nennt u. a. das gelöste Problem, echte Nutzeraktivität, Tokenomics/Verteilung, Kontrolle, Liquidität und regulatorische Risiken.' },
        { q: 'Warum empfiehlt der Guide, DeFi-Transaktionen von Anfang an laufend zu dokumentieren statt später?', choices: ['Weil Steuer-Tools DeFi-Transaktionen nicht immer perfekt erkennen und nachträgliches Sortieren aufwendiger ist', 'Weil DeFi-Plattformen die Historie nach 30 Tagen löschen', 'Weil es gesetzlich stündlich vorgeschrieben ist', 'Aus keinem besonderen Grund'], correct: 0, why: 'Der Guide warnt: nachträglich Hunderte Transaktionen zu sortieren ist deutlich unangenehmer als eine saubere laufende Übersicht.' }
      ]
    }
  ]
};
