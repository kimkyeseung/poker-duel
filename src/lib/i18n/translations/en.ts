export const en = {
  // Common
  common: {
    appName: "Hol'Damn It!",
    tagline: "THE ULTIMATE EQUITY CHALLENGE",
    version: "Alpha 0.1",
    loading: "Loading...",
    error: "Error",
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    delete: "Delete",
    back: "Back",
    next: "Next",
    skip: "Skip",
    start: "Start",
    continue: "Continue",
    retry: "Retry",
    exit: "Exit",
    menu: "Menu",
    home: "Home",
    yes: "Yes",
    no: "No",
  },

  // Navigation
  nav: {
    home: "HOME",
    practice: "PRACTICE",
    credits: "CREDITS",
    hiScore: "HI SCORE",
    settings: "SETTINGS",
    stats: "STATS",
  },

  // Home Page
  home: {
    quickPlay: "QUICK PLAY",
    practice: "PRACTICE",
    dailyRun: "DAILY RUN",
    viewCollection: "VIEW COLLECTION",
    totalWins: "Total Wins",
    bestStreak: "Best Streak",
    rankStatus: "Rank Status",
    wins: "Wins",
    streak: "Streak",
    winRate: "Win Rate",
    newBadge: "NEW",
    hotTables: "The tables are hot!",
    clickToStart: "Click anywhere to start",
    soundEnabled: "Sound will be enabled",
  },

  // Game
  game: {
    rounds: {
      preflop: "PRE-FLOP",
      flop: "THE FLOP",
      turn: "THE TURN",
      river: "THE RIVER",
    },
    labels: {
      you: "YOU",
      dealer: "DEALER",
      vs: "VS",
    },
    messages: {
      revealingCards: "Revealing cards...",
      calculatingWinRate: "Calculating win rate...",
      preparingNextRound: "Preparing next round...",
      timeOut: "Time Out!",
      wrongAnswer: "Wrong Answer!",
    },
    questions: {
      whoHasBetterHand: "Who has the better hand?",
      whoHasHigherWinRate: "Who has a higher win rate?",
      selectWinRate: "Select the win rate range",
      enterWinRate: "Enter your win rate prediction",
      whatIsWinProbability: "What's your win probability?",
    },
    tolerance: "Tolerance: ±{tolerance}%",
    validation: {
      invalidRange: "Please enter a value between 0 and 100",
    },
    actions: {
      nextRound: "Next Round",
      nextLevel: "Next Level",
      viewRiver: "View River",
      submit: "SUBMIT",
    },
  },

  // Results
  results: {
    correct: "CORRECT!",
    wrong: "WRONG!",
    winner: "WINNER!",
    defeat: "DEFEAT",
    draw: "DRAW",
    xpGain: "+{amount} XP",
    handRankingComparison: "Hand Ranking Comparison",
    winProbability: "Win Probability",
    finalResult: "Final Result",
    yourAnswer: "Your answer",
    correctAnswer: "Correct",
    win: "Win",
    ties: "Ties",
    loss: "Loss",
  },

  // Difficulty
  difficulty: {
    easy: "Easy",
    normal: "Normal",
    hard: "Hard",
    expert: "Expert",
    god: "God of Holdem",
    level: "Level {number}",
  },

  // Level Info
  levelInfo: {
    easy: "Choose who has the better hand",
    normal: "Select the correct win rate range",
    hard: "Predict within ±5% accuracy",
    expert: "Predict within ±3% accuracy",
    god: "Predict within ±1% accuracy",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "The journey of a thousand hands begins with a single bet.",
      "In poker, patience is not just a virtue—it's a strategy.",
      "Know when to hold 'em, know when to fold 'em.",
      "Every pro was once a beginner.",
    ],
    normal: [
      "Position is power in poker.",
      "The cards don't know who's winning.",
      "Play the player, not just the cards.",
      "Discipline separates winners from losers.",
    ],
    hard: [
      "The best hand doesn't always win—the best player does.",
      "Poker is a game of decisions, not results.",
      "Trust your reads, but verify with math.",
      "Pressure reveals character at the table.",
    ],
    expert: [
      "At this level, every percentage point matters.",
      "The elite see patterns others miss.",
      "Mastery is knowing what others don't know they don't know.",
      "Precision is the difference between good and great.",
    ],
    god: [
      "Welcome to the final test of poker mastery.",
      "Only the chosen reach this realm.",
      "1% tolerance. Zero room for error.",
      "Become the god of probability.",
    ],
  },

  // Victory
  victory: {
    youWon: "YOU WON!",
    levelCleared: "LEVEL CLEARED",
    nextRank: "NEXT RANK",
    bestAccuracy: "Best Accuracy",
    totalScore: "Total Score",
    shareMessage: "Share your victory with the community!",
    keepGoing: "KEEP GOING →",
    congratulations: "Congratulations! You cleared God of Holdem!",
  },

  // Game Over
  gameOver: {
    title: "GAME OVER",
    message: "Better luck next time!",
    finalScore: "Final Score",
    tryAgain: "Try Again",
    goHome: "Go Home",
    reachedLevel: "Reached Level",
    finalHandAnalysis: "Final Hand Analysis",
    encouragement: "Don't give up! Practice makes perfect.",
    nextDuel: "TRY AGAIN →",
  },

  // Settings
  settings: {
    title: "SETTINGS",
    soundVibration: "Sound & Vibration",
    soundEffects: "Sound Effects",
    vibration: "Vibration",
    theme: "Theme",
    dataManagement: "Data Management",
    resetData: "Reset All Data",
    resetConfirm: "All game data will be deleted. Continue?",
    language: "Language",
  },

  // Stats
  stats: {
    title: "STATISTICS",
    totalGames: "Total Games",
    totalWins: "Total Wins",
    winRate: "Win Rate",
    currentStreak: "Current Streak",
    maxStreak: "Max Streak",
    difficultyStats: "Difficulty Statistics",
    played: "Played",
    cleared: "Cleared",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "Welcome to Hol'Damn It!",
      description: "Test your poker equity knowledge! Predict win rates at each stage of Texas Hold'em.",
    },
    gameFlow: {
      title: "Game Flow",
      description: "Progress through 4 rounds: Pre-flop, Flop, Turn, and River. Make accurate predictions to advance!",
    },
    difficulties: {
      title: "Difficulty Levels",
      description: "Start from Easy and work your way up to God of Holdem. Each level requires more precision.",
    },
    timeLimits: {
      title: "Time Limits",
      description: "Pre-flop: 30 seconds. Other rounds: 60 seconds. Stay sharp and think fast!",
    },
    gotIt: "Got it!",
    letsPlay: "Let's Play!",
  },

  // Hints
  hints: {
    veryFavorable: "You are very favorable! (80%+)",
    favorable: "You are favorable. (60%+)",
    even: "It's almost even. (40-60%)",
    unfavorable: "You are unfavorable. (40%-)",
    veryUnfavorable: "You are very unfavorable. (20%-)",
    showHint: "Show Hint",
  },

  // Achievements (sample)
  achievements: {
    firstStep: "First Step",
    firstStepDesc: "Play your first game",
    tenGames: "Ten Challenges",
    tenGamesDesc: "Play 10 games",
    firstWin: "First Victory",
    firstWinDesc: "Win your first game",
    streakStarter: "Streak Starter",
    streakStarterDesc: "Win 3 games in a row",
  },

  // Titles (sample)
  titles: {
    beginner: "Novice Gambler",
    probabilityStudent: "Probability Student",
    firstWinner: "First Winner",
    consistentPlayer: "Consistent Player",
    expert: "Poker Expert",
    master: "Poker Master",
    legend: "Living Legend",
    godOfHoldem: "God of Holdem",
  },

  // Mascot Messages
  mascot: {
    tips: [
      "Pocket Aces (AA) ranks #1\namong 169 starting hands!",
      "Suited hands are about\n3% better than offsuit",
      "Later position means you can\nplay more hands profitably",
      "The chance to hit a pair\non the flop is about 32%",
      "Pocket pairs flop a set\nabout 12% of the time",
      "AKs vs QQ is\nalmost a coin flip!",
    ],
    events: [
      "In Daily Challenge, all players\nsolve the same puzzle!",
      "Practice mode has\nno time limits!",
      "Clear all 5 difficulties\nto enter the Hall of Fame!",
    ],
    challenges: {
      firstGame: "Ready to start\nyour first game? 🎮",
      threeStreak: "Try to get a\n3-win streak!",
      fiveStreak: "Aim for a\n5-win streak!",
      godChallenge: "Ready to challenge\nGod of Holdem? 👑",
    },
    status: {
      onStreak: "{count}-win streak! Amazing! 🔥",
      winsAchieved: "{count} wins achieved! Congrats! 🎉",
      tryPractice: "How about warming up\nin practice mode?",
      proLevel: "{rate}% win rate! Pro level! 👑",
    },
    luckyCard: "Today's lucky card: {card}",
    hotTables: "The tables are hot!",
  },
};

export type TranslationKeys = typeof en;
