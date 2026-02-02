import { TranslationKeys } from './en';

export const fr: TranslationKeys = {
  // Common
  common: {
    appName: "Hol'Damn It!",
    tagline: "LE DÉFI ULTIME D'ÉQUITÉ",
    version: "Alpha 0.1",
    loading: "Chargement...",
    error: "Erreur",
    confirm: "Confirmer",
    cancel: "Annuler",
    close: "Fermer",
    save: "Sauvegarder",
    delete: "Supprimer",
    back: "Retour",
    next: "Suivant",
    skip: "Passer",
    start: "Démarrer",
    continue: "Continuer",
    retry: "Réessayer",
    exit: "Quitter",
    menu: "Menu",
    home: "Accueil",
    yes: "Oui",
    no: "Non",
  },

  // Navigation
  nav: {
    home: "ACCUEIL",
    practice: "ENTRAÎNEMENT",
    credits: "CRÉDITS",
    hiScore: "MEILLEUR SCORE",
    settings: "PARAMÈTRES",
    stats: "STATISTIQUES",
  },

  // Home Page
  home: {
    quickPlay: "JEU RAPIDE",
    practice: "ENTRAÎNEMENT",
    dailyRun: "DÉFI QUOTIDIEN",
    viewCollection: "VOIR COLLECTION",
    totalWins: "Victoires Totales",
    bestStreak: "Meilleure Série",
    rankStatus: "Statut de Rang",
    wins: "Victoires",
    streak: "Série",
    winRate: "% Victoire",
    newBadge: "NOUVEAU",
    hotTables: "Les tables sont chaudes!",
    clickToStart: "Cliquez n'importe où pour commencer",
    soundEnabled: "Le son sera activé",
  },

  // Game
  game: {
    rounds: {
      preflop: "PRÉ-FLOP",
      flop: "LE FLOP",
      turn: "LE TURN",
      river: "LA RIVER",
    },
    labels: {
      you: "VOUS",
      dealer: "CROUPIER",
      vs: "VS",
    },
    messages: {
      revealingCards: "Révélation des cartes...",
      calculatingWinRate: "Calcul des probabilités...",
      preparingNextRound: "Préparation du prochain tour...",
      timeOut: "Temps écoulé!",
      wrongAnswer: "Mauvaise réponse!",
    },
    questions: {
      whoHasBetterHand: "Qui a la meilleure main?",
      whoHasHigherWinRate: "Qui a la probabilité de gain la plus élevée?",
      selectWinRate: "Sélectionnez la plage de probabilité",
      enterWinRate: "Entrez votre prédiction de probabilité",
      whatIsWinProbability: "Quelle est votre probabilité de gagner?",
    },
    tolerance: "Tolérance: ±{tolerance}%",
    validation: {
      invalidRange: "Entrez une valeur entre 0 et 100",
    },
    actions: {
      nextRound: "Tour Suivant",
      nextLevel: "Niveau Suivant",
      viewRiver: "Voir River",
      submit: "VALIDER",
    },
  },

  // Results
  results: {
    correct: "CORRECT!",
    wrong: "FAUX!",
    winner: "GAGNANT!",
    defeat: "DÉFAITE",
    draw: "ÉGALITÉ",
    xpGain: "+{amount} XP",
    handRankingComparison: "Comparaison des Mains",
    winProbability: "Probabilité de Gain",
    finalResult: "Résultat Final",
    nextIs: "Le niveau suivant est",
    nextIsSuffix: ".",
    yourAnswer: "Votre réponse",
    correctAnswer: "Correcte",
    win: "Vic.",
    ties: "Nul",
    loss: "Déf.",
  },

  // Difficulty
  difficulty: {
    easy: "Facile",
    normal: "Normal",
    hard: "Difficile",
    expert: "Expert",
    god: "Dieu du Holdem",
    level: "Niveau {number}",
  },

  // Level Info
  levelInfo: {
    easy: "Choisissez qui a la meilleure main",
    normal: "Sélectionnez la bonne plage de probabilité",
    hard: "Prédisez avec ±5% de précision",
    expert: "Prédisez avec ±3% de précision",
    god: "Prédisez avec ±1% de précision",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "Le voyage de mille mains commence par un seul pari.",
      "Au poker, la patience n'est pas qu'une vertu, c'est une stratégie.",
      "Savoir quand garder et quand se coucher.",
      "Tout professionnel a été débutant un jour.",
    ],
    normal: [
      "La position est le pouvoir au poker.",
      "Les cartes ne savent pas qui gagne.",
      "Jouez le joueur, pas seulement les cartes.",
      "La discipline sépare les gagnants des perdants.",
    ],
    hard: [
      "La meilleure main ne gagne pas toujours—le meilleur joueur si.",
      "Le poker est un jeu de décisions, pas de résultats.",
      "Faites confiance à vos lectures, mais vérifiez avec les maths.",
      "La pression révèle le caractère à la table.",
    ],
    expert: [
      "À ce niveau, chaque point de pourcentage compte.",
      "L'élite voit des schémas que les autres manquent.",
      "La maîtrise est de savoir ce que les autres ignorent.",
      "La précision fait la différence entre bon et excellent.",
    ],
    god: [
      "Bienvenue au test ultime de maîtrise du poker.",
      "Seuls les élus atteignent ce royaume.",
      "1% de tolérance. Aucune marge d'erreur.",
      "Devenez le dieu des probabilités.",
    ],
  },

  // Victory
  victory: {
    youWon: "VOUS AVEZ GAGNÉ!",
    levelCleared: "NIVEAU RÉUSSI",
    nextRank: "PROCHAIN RANG",
    bestAccuracy: "Meilleure Précision",
    totalScore: "Score Total",
    shareMessage: "Partagez votre victoire avec la communauté!",
    keepGoing: "CONTINUER →",
    congratulations: "Félicitations! Vous avez terminé Dieu du Holdem!",
  },

  // Game Over
  gameOver: {
    title: "FIN DE PARTIE",
    message: "Bonne chance la prochaine fois!",
    finalScore: "Score Final",
    tryAgain: "Réessayer",
    goHome: "Accueil",
    reachedLevel: "Niveau Atteint",
    finalHandAnalysis: "Analyse Finale de Main",
    encouragement: "N'abandonnez pas! C'est en forgeant qu'on devient forgeron.",
    nextDuel: "RÉESSAYER →",
  },

  // Settings
  settings: {
    title: "PARAMÈTRES",
    soundVibration: "Son et Vibration",
    soundEffects: "Effets Sonores",
    vibration: "Vibration",
    theme: "Thème",
    dataManagement: "Gestion des Données",
    resetData: "Réinitialiser les Données",
    resetConfirm: "Toutes les données seront supprimées. Continuer?",
    language: "Langue",
  },

  // Stats
  stats: {
    title: "STATISTIQUES",
    totalGames: "Parties Totales",
    totalWins: "Victoires Totales",
    winRate: "% Victoire",
    currentStreak: "Série Actuelle",
    maxStreak: "Série Maximum",
    difficultyStats: "Stats par Difficulté",
    played: "Jouées",
    cleared: "Réussies",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "Bienvenue dans Hol'Damn It!",
      description: "Testez vos connaissances en équité poker! Prédisez les probabilités à chaque étape du Texas Hold'em.",
    },
    gameFlow: {
      title: "Déroulement du Jeu",
      description: "Progressez à travers 4 tours: Pré-flop, Flop, Turn et River. Faites des prédictions précises pour avancer!",
    },
    difficulties: {
      title: "Niveaux de Difficulté",
      description: "Commencez par Facile et progressez jusqu'à Dieu du Holdem. Chaque niveau demande plus de précision.",
    },
    timeLimits: {
      title: "Limites de Temps",
      description: "Pré-flop: 30 secondes. Autres tours: 60 secondes. Réfléchissez vite!",
    },
    gotIt: "Compris!",
    letsPlay: "Jouons!",
  },

  // Hints
  hints: {
    veryFavorable: "Très favorable! (80%+)",
    favorable: "Favorable. (60%+)",
    even: "Presque égal. (40-60%)",
    unfavorable: "Défavorable. (40%-)",
    veryUnfavorable: "Très défavorable. (20%-)",
    showHint: "Montrer Indice",
  },

  // Achievements
  achievements: {
    firstStep: "Premier Pas",
    firstStepDesc: "Jouez votre première partie",
    tenGames: "Dix Défis",
    tenGamesDesc: "Jouez 10 parties",
    firstWin: "Première Victoire",
    firstWinDesc: "Gagnez votre première partie",
    streakStarter: "Début de Série",
    streakStarterDesc: "Gagnez 3 parties consécutives",
  },

  // Titles
  titles: {
    beginner: "Joueur Débutant",
    probabilityStudent: "Étudiant en Probabilité",
    firstWinner: "Premier Gagnant",
    consistentPlayer: "Joueur Régulier",
    expert: "Expert en Poker",
    master: "Maître du Poker",
    legend: "Légende Vivante",
    godOfHoldem: "Dieu du Holdem",
  },

  // Mascot Messages
  mascot: {
    tips: [
      "Les As de poche (AA) sont\nle #1 sur 169 mains!",
      "Les mains assorties sont\nenviron 3% meilleures",
      "Plus votre position est tardive,\nplus vous pouvez jouer de mains",
      "La chance de toucher une paire\nau flop est d'environ 32%",
      "Les paires de poche font un set\nenviron 12% du temps",
      "AKs vs QQ c'est\npresque pile ou face!",
    ],
    events: [
      "Dans le Défi Quotidien, tous\nrésolvent le même problème!",
      "Le mode entraînement\nn'a pas de limite de temps!",
      "Terminez les 5 difficultés\npour entrer au Panthéon!",
    ],
    challenges: {
      firstGame: "Prêt à commencer\nvotre première partie? 🎮",
      threeStreak: "Essayez d'obtenir\nune série de 3!",
      fiveStreak: "Visez une\nsérie de 5!",
      godChallenge: "Prêt à défier\nle Dieu du Holdem? 👑",
    },
    status: {
      onStreak: "Série de {count}! Incroyable! 🔥",
      winsAchieved: "{count} victoires! Félicitations! 🎉",
      tryPractice: "Que diriez-vous de vous\néchauffer en mode entraînement?",
      proLevel: "Taux de {rate}%! Niveau pro! 👑",
    },
    luckyCard: "Carte porte-bonheur: {card}",
    hotTables: "Les tables sont chaudes!",
  },
};
