/* ============================================================
   Projektdaten SmartIT — einzige Stelle, die gepflegt werden muss.
   Gleiches System wie /projekte/bitopex/ und /projekte/hyperocket/
   (siehe assets/project.js). Neue Position/Aktion einfach unten bei
   positions/actions ergaenzen — Summen, Anzahl und Unlock-Spannen
   werden daraus automatisch berechnet, nirgends doppelt pflegen.
   ============================================================ */
window.RX_DATA = window.RX_DATA || {};
window.RX_DATA.smartit = {
  slug: 'smartit',
  name: 'SmartIT',
  status: 'active', // active | watching | paused | ended

  updatedAt: '2026-08-18', // Datum des Account-Snapshots, einzige Quelle fuer "Stand: ..."
  metaTags: ['Aktiv', 'Praxistest', 'Staking', 'Eigener Account'],

  websiteUrl: 'https://www.smartit.cc/smt351525/',
  affiliate: true,

  currentAssessment: 'Bei SmartIT ist für mich nicht nur der Token selbst interessant, sondern vor allem die Frage, wie sich ein langfristig gebundenes Staking-Setup tatsächlich entwickelt. Deshalb trenne ich auf dieser Seite bewusst zwischen gestakter Position, aktueller Bewertung, Rewards und bereits geclaimten Beträgen.',

  aboutText: 'SmartIT ist ein Projekt rund um den SIT-Token und ein Staking-Modell, bei dem Token über längere Zeit gebunden werden und Rewards entstehen können. Für meinen Praxistest ist besonders relevant, wie sich mein eigenes Setup entwickelt, welche Rewards tatsächlich anfallen und wie lange das Kapital gebunden bleibt. Meine dokumentierten Positionen liegen aktuell in 18-%-Varianten mit langfristigem Staking.',

  // Momentaufnahme meines eigenen Staking-Accounts, exakt so benannt
  // wie im SmartIT-Dashboard. Rewards sind bewusst NICHT gleich
  // Gewinn oder Auszahlung — claimable/claimed/total sind getrennte
  // Groessen, siehe renderStakingSnapshot in project.js.
  snapshot: {
    date: '2026-08-18',
    mainPlan: 'Variant 2 (18%)',
    duration: '5 Years Staking',
    stakedPositionSit: 21888.6450,
    purchasePriceEur: 4394.55,
    todaysValueEur: 4377.73,
    claimableRewardsSit: 135.6024,
    claimedRewardsSit: 1351.4032,
    totalRewardsSit: 1487.0056,
    totalRewardsEur: 297.40,
    sitPriceUsdc: 0.2367
  },

  // Echte, dokumentierte Claims/Staking-Events aus meinem Account.
  actions: [
    { type:'Claim',   amountSit:924.4870, amountEur:184.90, status:'Completed', createdAt:'2026-08-06' },
    { type:'Staking', amountSit:427.0000, amountEur:85.40,  status:'Completed', createdAt:'2026-05-12' },
    { type:'Claim',   amountSit:426.9161, amountEur:85.38,  status:'Completed', createdAt:'2026-05-12' }
  ],

  // Meine 9 gestakten Positionen. Anzahl, Zeitraeume und Unlock-Spanne
  // werden daraus automatisch berechnet (computePositionStats).
  positions: [
    { id:1, plan:'Variant 2 (18%)', stakedAmountSit:18750.0000, claimedRewardsSit:1164.8998, claimableRewardsSit:116.1613, createdAt:'2026-04-21T13:51:00', unlockDate:'2030-09-14T08:48:00' },
    { id:2, plan:'Variant 2 (18%)', stakedAmountSit:247.8105,   claimedRewardsSit:15.3959,   claimableRewardsSit:1.5352,   createdAt:'2026-04-21T13:51:00', unlockDate:'2030-11-18T09:32:00' },
    { id:3, plan:'Variant 2 (18%)', stakedAmountSit:608.4640,   claimedRewardsSit:37.8026,   claimableRewardsSit:3.7696,   createdAt:'2026-04-21T13:51:00', unlockDate:'2030-12-10T12:44:00' },
    { id:4, plan:'Variant 2 (18%)', stakedAmountSit:249.3206,   claimedRewardsSit:15.4897,   claimableRewardsSit:1.5446,   createdAt:'2026-04-21T13:51:00', unlockDate:'2030-12-18T12:02:00' },
    { id:5, plan:'Variant 2 (18%)', stakedAmountSit:247.1503,   claimedRewardsSit:15.3549,   claimableRewardsSit:1.5311,   createdAt:'2026-04-21T13:51:00', unlockDate:'2031-01-18T09:32:00' },
    { id:6, plan:'Variant 2 (18%)', stakedAmountSit:236.8994,   claimedRewardsSit:14.7180,   claimableRewardsSit:1.4676,   createdAt:'2026-04-21T13:51:00', unlockDate:'2031-02-18T09:32:00' },
    { id:7, plan:'Variant 2 (18%)', stakedAmountSit:822.0000,   claimedRewardsSit:51.0692,   claimableRewardsSit:5.0925,   createdAt:'2026-04-21T13:51:00', unlockDate:'2031-03-03T15:22:00' },
    { id:8, plan:'Variant 2 (18%)', stakedAmountSit:300.0000,   claimedRewardsSit:18.6382,   claimableRewardsSit:1.8585,   createdAt:'2026-04-21T13:51:00', unlockDate:'2031-04-01T09:08:00' },
    { id:9, plan:'Variant 1 (18%)', stakedAmountSit:427.0000,   claimedRewardsSit:18.0344,   claimableRewardsSit:2.6453,   createdAt:'2026-05-12T17:14:00', unlockDate:'2031-05-11T17:14:00' }
  ],

  timeline: [
    { dateLabel:'21.04.2026', title:'Erste dokumentierte Staking-Positionen', text:'Ich starte mein SmartIT-Setup mit den ersten acht gestakten Positionen.' },
    { dateLabel:'12.05.2026', title:'Weitere Staking- und Claim-Aktion', text:'Eine weitere Position kommt hinzu, dazu ein erster dokumentierter Claim.' },
    { dateLabel:'06.08.2026', title:'Weiterer dokumentierter Claim', text:'Ich claime erneut Rewards aus meinen laufenden Positionen.' },
    { dateLabel:'18.08.2026', title:'Aktueller Rewards- und Positionsstand', text:'Der aktuelle Account-Snapshot mit allen neun Positionen und meinem Rewards-Stand.' }
  ],

  videos: [
    {
      title: 'SmartIT & SIT Token erklärt: Warum das Staking jetzt spannend ist',
      youtubeUrl: 'https://www.youtube.com/watch?v=fkw4djZtUlE',
      publishedAt: '2026-05-20',
      featured: true,
      projectSlug: 'smartit',
      description: 'Ich erkläre SmartIT und den SIT-Token und ordne ein, warum das Staking-Modell für mich interessant ist.'
    }
  ],

  interview: null,

  positives: [
    { title:'Echte Account-Daten', text:'Ich kann mein Setup und meine Rewards konkret dokumentieren.' },
    { title:'Langfristige Struktur', text:'Die Positionen haben klare Unlock-Daten und lassen sich über längere Zeit verfolgen.' },
    { title:'Rewards transparent nachvollziehbar', text:'Claimable, claimed und Total Rewards sind sauber voneinander trennbar.' }
  ],
  considerations: [
    { title:'Lange Kapitalbindung', text:'Ein großer Teil des gestakten Kapitals ist bis 2030 bzw. 2031 gebunden.' },
    { title:'Token-Risiko', text:'Der Wert hängt auch von der Kursentwicklung des SIT-Tokens ab.' },
    { title:'Rewards sind nicht dasselbe wie reale Auszahlung in Euro', text:'Rewards in SIT und ihr Euro- bzw. USDC-Wert können sich verändern.' },
    { title:'Dashboard-Werte richtig einordnen', text:'Die angezeigten Reward-Werte sind Momentaufnahmen und keine Garantie für künftige Ergebnisse.' }
  ],

  risks: [
    { title:'Token-/Kursrisiko', text:'Der Wert von SIT hängt von der Marktentwicklung ab und kann sowohl steigen als auch deutlich fallen.' },
    { title:'Langfristige Bindung', text:'Ein Großteil meines gestakten Kapitals ist bis 2030 bzw. 2031 gebunden und in dieser Zeit nicht liquide verfügbar.' },
    { title:'Plattformrisiko', text:'Neben dem Token selbst besteht ein Risiko durch die Funktionsfähigkeit und Zahlungsfähigkeit der Plattform.' },
    { title:'Smart-Contract- und Systemrisiko', text:'Wie bei jedem Staking-Modell besteht ein technisches Risiko rund um die zugrunde liegende Infrastruktur.' },
    { title:'Rewards keine Garantie', text:'Angezeigte Rewards sind Momentaufnahmen und keine Zusage für künftige Ergebnisse.' },
    { title:'Wertschwankungen zwischen SIT und EUR/USDC', text:'Der Euro-Gegenwert meiner Rewards verändert sich mit dem SIT-Kurs, unabhängig von der reinen SIT-Menge.' }
  ],

  faq: [
    { q:'Wie viel SIT habe ich aktuell gestaked?', a:'21.888,6450 SIT laut meinem Dashboard-Stand vom 18.08.2026.' },
    { q:'Wie hoch sind meine aktuellen Rewards?', a:'Insgesamt 1.487,0056 SIT, davon 135,6024 SIT aktuell claimbar und 1.351,4032 SIT bereits geclaimt.' },
    { q:'Wie lange sind meine Positionen gebunden?', a:'Die dokumentierten Unlock-Daten reichen aktuell von September 2030 bis Mai 2031.' },
    { q:'Was ist der Unterschied zwischen claimable und claimed Rewards?', a:'Claimable Rewards können aktuell geclaimt werden, claimed Rewards wurden bereits beansprucht.' },
    { q:'Sind Rewards dasselbe wie Gewinn?', a:'Nicht automatisch. Reward-Werte hängen auch vom Tokenpreis und der weiteren Entwicklung ab.' },
    { q:'Wo finde ich mein SmartIT-Video?', a:'Das aktuelle Video ist oben auf dieser Seite eingebunden.' }
  ],

  related: [
    { kicker:'Projekt', label:'Bitopex', href:'/projekte/bitopex/', desc:'Mein laufender Praxistest von Bitopex — Copy-Trading mit 0DTE und ALT-0DTE.' },
    { kicker:'Projekt', label:'HyperRocket', href:'/projekte/hyperocket/', desc:'Mein eigener Account, dokumentierte Auszahlungen und laufende Entwicklung.' },
    { kicker:'Tool', label:'Scam-Check', href:'/scam-check/', desc:'Zwölf Warnsignale für Krypto-Betrug zum Ankreuzen — bevor du irgendwo Geld einzahlst.' },
    { kicker:'Tool', label:'Fear & Greed Index', href:'/fear-greed/', desc:'Zeigt, ob im Markt gerade Angst oder Gier herrscht.' }
  ]
};
