import { TranslationKeys } from './en';

export const it: TranslationKeys = {
  // Common
  common: {
    appName: "Hol'Damn It!",
    tagline: "LA SFIDA DEFINITIVA DI EQUITÀ",
    version: "Alpha 0.1",
    loading: "Caricamento...",
    error: "Errore",
    confirm: "Conferma",
    cancel: "Annulla",
    close: "Chiudi",
    save: "Salva",
    delete: "Elimina",
    back: "Indietro",
    next: "Avanti",
    skip: "Salta",
    start: "Inizia",
    continue: "Continua",
    retry: "Riprova",
    exit: "Esci",
    menu: "Menu",
    home: "Home",
    yes: "Sì",
    no: "No",
  },

  // Navigation
  nav: {
    home: "HOME",
    practice: "PRATICA",
    credits: "CREDITI",
    hiScore: "RECORD",
    settings: "IMPOSTAZIONI",
    stats: "STATISTICHE",
  },

  // Home Page
  home: {
    quickPlay: "GIOCO RAPIDO",
    practice: "PRATICA",
    dailyRun: "SFIDA GIORNALIERA",
    viewCollection: "VEDI COLLEZIONE",
    totalWins: "Vittorie Totali",
    bestStreak: "Miglior Serie",
    rankStatus: "Stato Rango",
    wins: "Vittorie",
    streak: "Serie",
    winRate: "% Vittoria",
    newBadge: "NUOVO",
    hotTables: "I tavoli sono caldi!",
    clickToStart: "Clicca ovunque per iniziare",
    soundEnabled: "Il suono verrà attivato",
  },

  // Practice Mode
  practice: {
    title: "MODALITÀ PRATICA",
    description: "Pratica senza limiti di tempo",
    selectDifficulty: "Seleziona Difficoltà",
    startPractice: "INIZIA PRATICA",
    modeRestriction: "* Le modalità Esperto e Dio sono disponibili solo nel gioco principale",
  },

  // Game
  game: {
    rounds: {
      preflop: "PRE-FLOP",
      flop: "IL FLOP",
      turn: "IL TURN",
      river: "IL RIVER",
    },
    labels: {
      you: "TU",
      dealer: "DEALER",
      opponent1: "Avversario 1",
      opponent2: "Avversario 2",
      smallBlind: "Small Blind",
      bigBlind: "Big Blind",
      vs: "VS",
      yourAnswer: "La tua risposta",
    },
    opponents: {
      defeated: "Avversario Sconfitto!",
      nextOpponent: "Prossimo Avversario",
      preparing: "Preparazione prossimo avversario...",
    },
    messages: {
      revealingCards: "Rivelazione carte...",
      calculatingWinRate: "Calcolo probabilità...",
      preparingNextRound: "Preparazione prossimo turno...",
      timeOut: "Tempo scaduto!",
      wrongAnswer: "Risposta sbagliata!",
    },
    questions: {
      whoHasBetterHand: "Chi ha la mano migliore?",
      whoHasHigherWinRate: "Chi ha la probabilità di vincita più alta?",
      selectWinRate: "Seleziona l'intervallo di probabilità",
      enterWinRate: "Inserisci la tua previsione di probabilità",
      whatIsWinProbability: "Qual è la tua probabilità di vincita?",
    },
    tolerance: "Tolleranza: ±{tolerance}%",
    choice3: {
      low: "Basso",
      medium: "Medio",
      high: "Alto",
    },
    validation: {
      invalidRange: "Inserisci un valore tra 0 e 100",
    },
    actions: {
      newGame: "Nuova Partita",
      nextRound: "Prossimo Turno",
      nextLevel: "Prossimo Livello",
      viewRiver: "Vedi River",
      submit: "INVIA",
      showAnswer: "Rispondi",
      hideAnswer: "Nascondi",
    },
    betting: {
      title: "Scommessa al River",
      odds: "Quota",
      oddsDescription: "Probabilità più bassa significa quota più alta",
      amount: "Importo scommessa",
      expectedPayout: "Vincita prevista (in caso di vittoria)",
      skip: "Salta",
      bet: "Scommetti",
      noChips: "Nessuna fiche da scommettere",
      chips: "Fiche",
    },
  },

  // Results
  results: {
    correct: "CORRETTO!",
    wrong: "SBAGLIATO!",
    winner: "VINCITORE!",
    defeat: "SCONFITTA",
    draw: "PAREGGIO",
    xpGain: "+{amount} XP",
    handRankingComparison: "Confronto delle Mani",
    winProbability: "Probabilità di Vincita",
    finalResult: "Risultato Finale",
    nextIs: "Il prossimo livello è",
    nextIsSuffix: ".",
    yourAnswer: "La tua risposta",
    correctAnswer: "Corretta",
    win: "Vit.",
    ties: "Par.",
    loss: "Scon.",
    details: "Dettagli",
    outcomeDetails: "Dettagli dei Risultati",
    addedCards: "Carte Aggiunte",
    totalCombinations: "Combinazioni Totali",
    noOutcomes: "Nessun risultato in questa categoria",
  },

  // Hand Ranks
  handRanks: {
    royalFlush: "Scala Reale",
    straightFlush: "Scala Colore",
    fourOfAKind: "Poker",
    fullHouse: "Full",
    flush: "Colore",
    straight: "Scala",
    threeOfAKind: "Tris",
    twoPair: "Doppia Coppia",
    onePair: "Coppia",
    highCard: "Carta Alta",
  },

  // Outcome Analysis
  outcomeAnalysis: {
    title: "Analisi dei Risultati",
    tableContext: "Contesto del Tavolo",
    handDistribution: "Distribuzione delle Mani",
    matchupAnalysis: "Analisi degli Scontri",
    yourHand: "La Tua Mano",
    dealerHand: "Mano del Dealer",
    communityCards: "Carte Comuni",
    remaining: "rimanenti",
    vsDealer: "vs Dealer",
    showMore: "Mostra Altro",
    showLess: "Mostra Meno",
    clickToSeeCards: "Clicca per vedere le combinazioni di carte",
    winningCards: "Carte Vincenti",
    tieCards: "Carte di Pareggio",
    losingCards: "Carte Perdenti",
    allCombinations: "Combinazioni totali",
    viewAll: "Vedi tutto",
    viewAllCombinations: "Vedi tutte le combinazioni",
    others: "Altri",
    matchups: "scontri",
    all: "Tutti",
  },

  // Difficulty
  difficulty: {
    easy: "Facile",
    normal: "Normale",
    hard: "Difficile",
    expert: "Esperto",
    king: "Re dell'Holdem",
    god: "Dio dell'Holdem",
    level: "Livello {number}",
  },

  // Level Info
  levelInfo: {
    easy: "Scegli chi ha la mano migliore",
    normal: "Scegli tra 3 intervalli di probabilità",
    hard: "Scegli tra 5 intervalli di probabilità",
    expert: "Prevedi con ±5% di precisione",
    king: "Prevedi con ±3% di precisione",
    god: "Prevedi con ±1% di precisione",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "Il viaggio di mille mani inizia con una sola scommessa.",
      "Nel poker, la pazienza non è solo una virtù, è una strategia.",
      "Sapere quando tenere e quando lasciare.",
      "Ogni professionista è stato un principiante.",
    ],
    normal: [
      "La posizione è potere nel poker.",
      "Le carte non sanno chi sta vincendo.",
      "Gioca il giocatore, non solo le carte.",
      "La disciplina separa i vincenti dai perdenti.",
    ],
    hard: [
      "La mano migliore non sempre vince—il miglior giocatore sì.",
      "Il poker è un gioco di decisioni, non di risultati.",
      "Fidati delle tue letture, ma verifica con la matematica.",
      "La pressione rivela il carattere al tavolo.",
    ],
    expert: [
      "A questo livello, ogni punto percentuale conta.",
      "L'élite vede schemi che altri non vedono.",
      "La maestria è sapere ciò che altri non sanno.",
      "La precisione fa la differenza tra buono e ottimo.",
    ],
    king: [
      "Osi sfidare il trono del Re!",
      "Sopravvivi qui e sarai un vero re.",
      "Entro il 3%. Resta concentrato.",
      "La corona appartiene al più preciso.",
    ],
    god: [
      "Benvenuto al test finale di maestria nel poker.",
      "Solo gli eletti raggiungono questo regno.",
      "1% di tolleranza. Nessun margine di errore.",
      "Diventa il dio della probabilità.",
    ],
  },

  // Victory
  victory: {
    youWon: "HAI VINTO!",
    levelCleared: "LIVELLO COMPLETATO",
    nextRank: "PROSSIMO RANGO",
    bestAccuracy: "Miglior Precisione",
    totalScore: "Punteggio Totale",
    shareMessage: "Condividi la tua vittoria con la comunità!",
    keepGoing: "CONTINUA →",
    congratulations: "Congratulazioni! Hai completato Dio dell'Holdem!",
  },

  // Game Over
  gameOver: {
    title: "FINE PARTITA",
    message: "In bocca al lupo la prossima volta!",
    finalScore: "Punteggio Finale",
    tryAgain: "Riprova",
    goHome: "Vai alla Home",
    reachedLevel: "Livello Raggiunto",
    finalHandAnalysis: "Analisi Finale della Mano",
    encouragement: "Non arrenderti! La pratica rende perfetti.",
    nextDuel: "RIPROVA →",
  },

  // Settings
  settings: {
    title: "IMPOSTAZIONI",
    soundVibration: "Suono e Vibrazione",
    soundEffects: "Effetti Sonori",
    vibration: "Vibrazione",
    theme: "Tema",
    dataManagement: "Gestione Dati",
    resetData: "Reimposta Dati",
    resetConfirm: "Tutti i dati verranno eliminati. Continuare?",
    language: "Lingua",
  },

  // Stats
  stats: {
    title: "STATISTICHE",
    totalGames: "Partite Totali",
    totalWins: "Vittorie Totali",
    winRate: "% Vittoria",
    currentStreak: "Serie Attuale",
    maxStreak: "Serie Massima",
    difficultyStats: "Statistiche per Difficoltà",
    played: "Giocate",
    cleared: "Completate",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "Benvenuto in Hol'Damn It!",
      description: "Metti alla prova le tue conoscenze di equità nel poker! Prevedi le probabilità in ogni fase del Texas Hold'em.",
    },
    gameFlow: {
      title: "Flusso di Gioco",
      description: "Progredisci attraverso 4 turni: Pre-flop, Flop, Turn e River. Fai previsioni accurate per avanzare!",
    },
    difficulties: {
      title: "Livelli di Difficoltà",
      description: "Inizia da Facile e arriva fino a Dio dell'Holdem. Ogni livello richiede più precisione.",
    },
    timeLimits: {
      title: "Limiti di Tempo",
      description: "Pre-flop: 30 secondi. Altri turni: 60 secondi. Pensa velocemente!",
    },
    gotIt: "Capito!",
    letsPlay: "Giochiamo!",
  },

  // Hints
  hints: {
    veryFavorable: "Molto favorevole! (80%+)",
    favorable: "Favorevole. (60%+)",
    even: "Quasi pari. (40-60%)",
    unfavorable: "Sfavorevole. (40%-)",
    veryUnfavorable: "Molto sfavorevole. (20%-)",
    showHint: "Mostra Suggerimento",
  },

  // Achievements
  achievements: {
    firstStep: "Primo Passo",
    firstStepDesc: "Gioca la tua prima partita",
    tenGames: "Dieci Sfide",
    tenGamesDesc: "Gioca 10 partite",
    firstWin: "Prima Vittoria",
    firstWinDesc: "Vinci la tua prima partita",
    streakStarter: "Inizio Serie",
    streakStarterDesc: "Vinci 3 partite consecutive",
  },

  // Titles
  titles: {
    beginner: "Giocatore Novizio",
    probabilityStudent: "Studente di Probabilità",
    firstWinner: "Primo Vincitore",
    consistentPlayer: "Giocatore Costante",
    expert: "Esperto di Poker",
    master: "Maestro del Poker",
    legend: "Leggenda Vivente",
    godOfHoldem: "Dio dell'Holdem",
  },

  // Mascot Messages
  mascot: {
    tips: [
      "Gli Assi in tasca (AA) sono\nil #1 su 169 mani!",
      "Le mani suited sono\ncirca 3% migliori di offsuit",
      "Più tardi è la posizione,\npiù mani puoi giocare",
      "La probabilità di fare coppia\nal flop è circa 32%",
      "Le coppie in tasca fanno set\ncirca il 12% delle volte",
      "AKs vs QQ è\nquasi un lancio di moneta!",
    ],
    events: [
      "Nella Sfida Giornaliera tutti\nrisolvono lo stesso problema!",
      "La modalità pratica\nnon ha limiti di tempo!",
      "Completa tutte e 5 le difficoltà\nper entrare nella Hall of Fame!",
    ],
    challenges: {
      firstGame: "Pronto a iniziare\nla tua prima partita? 🎮",
      threeStreak: "Prova a ottenere\nuna serie di 3!",
      fiveStreak: "Punta a una\nserie di 5!",
      godChallenge: "Pronto a sfidare\nil Dio dell'Holdem? 👑",
    },
    status: {
      onStreak: "Serie di {count}! Incredibile! 🔥",
      winsAchieved: "{count} vittorie! Congratulazioni! 🎉",
      tryPractice: "Che ne dici di scaldarti\nin modalità pratica?",
      proLevel: "Tasso del {rate}%! Livello pro! 👑",
    },
    luckyCard: "Carta fortunata: {card}",
    hotTables: "I tavoli sono caldi!",
  },
};
