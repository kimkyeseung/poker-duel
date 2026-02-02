import { TranslationKeys } from './en';

export const es: TranslationKeys = {
  // Common
  common: {
    appName: "¡Hol'Damn It!",
    tagline: "EL DESAFÍO DEFINITIVO DE EQUIDAD",
    version: "Alpha 0.1",
    loading: "Cargando...",
    error: "Error",
    confirm: "Confirmar",
    cancel: "Cancelar",
    close: "Cerrar",
    save: "Guardar",
    delete: "Eliminar",
    back: "Atrás",
    next: "Siguiente",
    skip: "Saltar",
    start: "Iniciar",
    continue: "Continuar",
    retry: "Reintentar",
    exit: "Salir",
    menu: "Menú",
    home: "Inicio",
    yes: "Sí",
    no: "No",
  },

  // Navigation
  nav: {
    home: "INICIO",
    practice: "PRÁCTICA",
    credits: "CRÉDITOS",
    hiScore: "RÉCORD",
    settings: "AJUSTES",
    stats: "ESTADÍSTICAS",
  },

  // Home Page
  home: {
    quickPlay: "JUEGO RÁPIDO",
    practice: "PRÁCTICA",
    dailyRun: "DESAFÍO DIARIO",
    viewCollection: "VER COLECCIÓN",
    totalWins: "Victorias Totales",
    bestStreak: "Mejor Racha",
    rankStatus: "Estado de Rango",
    wins: "Victorias",
    streak: "Racha",
    winRate: "% Victoria",
    newBadge: "NUEVO",
    hotTables: "¡Las mesas están calientes!",
    clickToStart: "Haz clic en cualquier lugar para empezar",
  },

  // Game
  game: {
    rounds: {
      preflop: "PRE-FLOP",
      flop: "EL FLOP",
      turn: "EL TURN",
      river: "EL RIVER",
    },
    labels: {
      you: "TÚ",
      dealer: "CRUPIER",
      vs: "VS",
    },
    messages: {
      revealingCards: "Revelando cartas...",
      calculatingWinRate: "Calculando probabilidad...",
      preparingNextRound: "Preparando siguiente ronda...",
      timeOut: "¡Tiempo agotado!",
      wrongAnswer: "¡Respuesta incorrecta!",
    },
    actions: {
      nextRound: "Siguiente Ronda",
      nextLevel: "Siguiente Nivel",
      viewRiver: "Ver River",
    },
    questions: {
      whoHasBetterHand: "¿Quién tiene la mejor mano?",
      selectWinRate: "Selecciona el rango de probabilidad",
      enterWinRate: "Ingresa tu predicción de probabilidad",
    },
  },

  // Results
  results: {
    correct: "¡CORRECTO!",
    wrong: "¡INCORRECTO!",
    winner: "¡GANADOR!",
    defeat: "DERROTA",
    draw: "EMPATE",
    xpGain: "+{amount} XP",
    handRankingComparison: "Comparación de Manos",
    winProbability: "Probabilidad de Ganar",
    yourAnswer: "Tu respuesta",
    correctAnswer: "Correcta",
    win: "Gan.",
    ties: "Emp.",
    loss: "Perd.",
  },

  // Difficulty
  difficulty: {
    easy: "Fácil",
    normal: "Normal",
    hard: "Difícil",
    expert: "Experto",
    god: "Dios del Holdem",
    level: "Nivel {number}",
  },

  // Level Info
  levelInfo: {
    easy: "Elige quién tiene la mejor mano",
    normal: "Selecciona el rango correcto de probabilidad",
    hard: "Predice con ±5% de precisión",
    expert: "Predice con ±3% de precisión",
    god: "Predice con ±1% de precisión",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "El viaje de mil manos comienza con una sola apuesta.",
      "En el póker, la paciencia no es solo una virtud, es una estrategia.",
      "Saber cuándo mantener y cuándo retirarse.",
      "Todo profesional fue una vez principiante.",
    ],
    normal: [
      "La posición es poder en el póker.",
      "Las cartas no saben quién está ganando.",
      "Juega al jugador, no solo a las cartas.",
      "La disciplina separa a ganadores de perdedores.",
    ],
    hard: [
      "La mejor mano no siempre gana, el mejor jugador sí.",
      "El póker es un juego de decisiones, no de resultados.",
      "Confía en tus lecturas, pero verifica con matemáticas.",
      "La presión revela el carácter en la mesa.",
    ],
    expert: [
      "A este nivel, cada punto porcentual importa.",
      "La élite ve patrones que otros no ven.",
      "La maestría es saber lo que otros no saben.",
      "La precisión marca la diferencia entre bueno y excelente.",
    ],
    god: [
      "Bienvenido a la prueba final de maestría en póker.",
      "Solo los elegidos llegan a este reino.",
      "1% de tolerancia. Sin margen de error.",
      "Conviértete en el dios de la probabilidad.",
    ],
  },

  // Victory
  victory: {
    youWon: "¡GANASTE!",
    levelCleared: "NIVEL COMPLETADO",
    nextRank: "SIGUIENTE RANGO",
    bestAccuracy: "Mejor Precisión",
    totalScore: "Puntuación Total",
    shareMessage: "¡Comparte tu victoria con la comunidad!",
    keepGoing: "CONTINUAR →",
    congratulations: "¡Felicidades! ¡Completaste Dios del Holdem!",
  },

  // Game Over
  gameOver: {
    title: "FIN DEL JUEGO",
    message: "¡Mejor suerte la próxima vez!",
    finalScore: "Puntuación Final",
    tryAgain: "Intentar de Nuevo",
    goHome: "Ir al Inicio",
  },

  // Settings
  settings: {
    title: "AJUSTES",
    soundVibration: "Sonido y Vibración",
    soundEffects: "Efectos de Sonido",
    vibration: "Vibración",
    theme: "Tema",
    dataManagement: "Gestión de Datos",
    resetData: "Restablecer Datos",
    resetConfirm: "Se eliminarán todos los datos. ¿Continuar?",
    language: "Idioma",
  },

  // Stats
  stats: {
    title: "ESTADÍSTICAS",
    totalGames: "Partidas Totales",
    totalWins: "Victorias Totales",
    winRate: "% Victoria",
    currentStreak: "Racha Actual",
    maxStreak: "Racha Máxima",
    difficultyStats: "Estadísticas por Dificultad",
    played: "Jugadas",
    cleared: "Completadas",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "¡Bienvenido a Hol'Damn It!",
      description: "¡Pon a prueba tu conocimiento de equidad en póker! Predice probabilidades en cada etapa del Texas Hold'em.",
    },
    gameFlow: {
      title: "Flujo del Juego",
      description: "Progresa a través de 4 rondas: Pre-flop, Flop, Turn y River. ¡Haz predicciones precisas para avanzar!",
    },
    difficulties: {
      title: "Niveles de Dificultad",
      description: "Empieza desde Fácil y avanza hasta Dios del Holdem. Cada nivel requiere más precisión.",
    },
    timeLimits: {
      title: "Límites de Tiempo",
      description: "Pre-flop: 30 segundos. Otras rondas: 60 segundos. ¡Piensa rápido!",
    },
    gotIt: "¡Entendido!",
    letsPlay: "¡A Jugar!",
  },

  // Hints
  hints: {
    veryFavorable: "¡Muy favorable! (80%+)",
    favorable: "Favorable. (60%+)",
    even: "Casi igual. (40-60%)",
    unfavorable: "Desfavorable. (40%-)",
    veryUnfavorable: "Muy desfavorable. (20%-)",
    showHint: "Mostrar Pista",
  },

  // Achievements
  achievements: {
    firstStep: "Primer Paso",
    firstStepDesc: "Juega tu primera partida",
    tenGames: "Diez Desafíos",
    tenGamesDesc: "Juega 10 partidas",
    firstWin: "Primera Victoria",
    firstWinDesc: "Gana tu primera partida",
    streakStarter: "Inicio de Racha",
    streakStarterDesc: "Gana 3 partidas seguidas",
  },

  // Titles
  titles: {
    beginner: "Apostador Novato",
    probabilityStudent: "Estudiante de Probabilidad",
    firstWinner: "Primer Ganador",
    consistentPlayer: "Jugador Constante",
    expert: "Experto en Póker",
    master: "Maestro del Póker",
    legend: "Leyenda Viviente",
  },
};
