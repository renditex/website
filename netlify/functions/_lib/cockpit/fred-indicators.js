/* ============================================================
   RenditeX Markt-Cockpit — Indikator-Register fuer die
   FRED-basierten Bloecke. Nur A- und B-Bewertungen aus dem
   Datendossier (Schritt 3/4) — C/D-Reihen bewusst nicht hier drin.
   transform 'yoy' fuer Index-Level-Reihen (waechst ueber Jahrzehnte
   monoton, Level-Perzentil waere sinnlos), 'level' fuer Reihen, die
   bereits als Rate/Spread/Index um einen Mittelwert schwanken.
   ============================================================ */
var BLOCKS = {
  wachstum: [
    { id: 'sahm',    seriesId: 'SAHMREALTIME', label: 'Sahm Rule',                       grade: 'A', transform: 'level', invert: true },
    { id: 'claims',  seriesId: 'ICSA',         label: 'Initial Jobless Claims',           grade: 'A', transform: 'level', invert: true },
    { id: 'wei',     seriesId: 'WEI',          label: 'Weekly Economic Index',            grade: 'A', transform: 'level' },
    { id: 'cfnai',   seriesId: 'CFNAI',        label: 'Chicago Fed National Activity Index', grade: 'A', transform: 'level' },
    { id: 'indpro',  seriesId: 'INDPRO',       label: 'Industrial Production (YoY)',      grade: 'B', transform: 'yoy' },
    { id: 'retail',  seriesId: 'RRSFS',        label: 'Real Retail Sales (YoY)',          grade: 'B', transform: 'yoy' },
    { id: 'permits', seriesId: 'PERMIT',       label: 'Building Permits',                 grade: 'B', transform: 'level' }
  ],
  inflation: [
    { id: 'cpi',       seriesId: 'CPILFESL', label: 'Core CPI (YoY)',        grade: 'A', transform: 'yoy', invert: true },
    { id: 'pce',       seriesId: 'PCEPILFE', label: 'Core PCE (YoY)',        grade: 'A', transform: 'yoy', invert: true },
    { id: 'breakeven', seriesId: 'T5YIFR',   label: '5Y5Y Forward Inflation', grade: 'A', transform: 'level', invert: true },
    { id: 'ppi',       seriesId: 'PPICOR',   label: 'PPI Core (YoY)',        grade: 'B', transform: 'yoy', invert: true },
    { id: 'gscpi',     seriesId: 'GSCPI',    label: 'Global Supply Chain Pressure Index', grade: 'B', transform: 'level', invert: true }
  ],
  liquiditaet: [
    { id: 'fedassets', seriesId: 'WALCL',     label: 'Fed-Bilanzsumme (YoY)',  grade: 'A', transform: 'yoy' },
    { id: 'tga',       seriesId: 'WTREGEN',   label: 'Treasury General Account', grade: 'A', transform: 'level', invert: true },
    { id: 'rrp',       seriesId: 'RRPONTSYD', label: 'Reverse Repo',           grade: 'A', transform: 'level', invert: true },
    { id: 'reserves',  seriesId: 'WRESBAL',   label: 'Bank-Reserven',          grade: 'B', transform: 'level' },
    { id: 'm2',        seriesId: 'M2SL',      label: 'M2 Geldmenge (YoY)',     grade: 'B', transform: 'yoy' },
    { id: 'usdindex',  seriesId: 'DTWEXBGS',  label: 'USD-Index',              grade: 'A', transform: 'level', invert: true }
  ],
  zinsen: [
    { id: 'fedfunds',  seriesId: 'DFF',    label: 'Fed Funds Rate',    grade: 'A', transform: 'level', invert: true },
    { id: 'ust10y',    seriesId: 'DGS10',  label: 'US Treasury 10Y',   grade: 'A', transform: 'level', invert: true },
    { id: 'realyield', seriesId: 'DFII10', label: '10Y Real Yield',    grade: 'A', transform: 'level', invert: true },
    { id: 'ust2y',     seriesId: 'DGS2',   label: 'US Treasury 2Y',    grade: 'B', transform: 'level', invert: true },
    { id: 'spread',    seriesId: 'T10Y2Y', label: '2Y/10Y Spread',     grade: 'B', transform: 'level' }
  ],
  kredit: [
    { id: 'anfci',    seriesId: 'ANFCI',         label: 'ANFCI',                    grade: 'A', transform: 'level', invert: true },
    { id: 'hyspread', seriesId: 'BAMLH0A0HYM2',  label: 'High Yield Credit Spread', grade: 'A', transform: 'level', invert: true },
    { id: 'nfci',     seriesId: 'NFCI',          label: 'NFCI',                     grade: 'B', transform: 'level', invert: true },
    { id: 'igspread', seriesId: 'BAMLC0A0CM',    label: 'Investment Grade Spread',  grade: 'B', transform: 'level', invert: true },
    { id: 'sloos',    seriesId: 'DRTSCILM',      label: 'SLOOS Lending Standards',  grade: 'B', transform: 'level', invert: true },
    { id: 'sofr',     seriesId: 'SOFR',          label: 'SOFR',                     grade: 'B', transform: 'level', invert: true }
  ],
  stress: [
    { id: 'vix',    seriesId: 'VIXCLS',  label: 'VIX',    grade: 'A', transform: 'level', invert: true },
    { id: 'stlfsi', seriesId: 'STLFSI4', label: 'STLFSI4', grade: 'A', transform: 'level', invert: true }
  ]
};

module.exports = { BLOCKS };
