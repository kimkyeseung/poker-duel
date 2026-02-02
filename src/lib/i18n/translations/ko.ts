import { TranslationKeys } from './en';

export const ko: TranslationKeys = {
  // Common
  common: {
    appName: "홀뎀잇!",
    tagline: "궁극의 에퀴티 챌린지",
    version: "Alpha 0.1",
    loading: "로딩 중...",
    error: "오류",
    confirm: "확인",
    cancel: "취소",
    close: "닫기",
    save: "저장",
    delete: "삭제",
    back: "뒤로",
    next: "다음",
    skip: "건너뛰기",
    start: "시작",
    continue: "계속",
    retry: "재시도",
    exit: "나가기",
    menu: "메뉴",
    home: "홈",
    yes: "예",
    no: "아니오",
  },

  // Navigation
  nav: {
    home: "홈",
    practice: "연습",
    credits: "크레딧",
    hiScore: "최고 점수",
    settings: "설정",
    stats: "통계",
  },

  // Home Page
  home: {
    quickPlay: "빠른 시작",
    practice: "연습 모드",
    dailyRun: "일일 도전",
    viewCollection: "컬렉션 보기",
    totalWins: "총 승리",
    bestStreak: "최고 연승",
    rankStatus: "랭크 상태",
    wins: "승리",
    streak: "연승",
    winRate: "승률",
    newBadge: "NEW",
    hotTables: "테이블이 뜨겁습니다!",
    clickToStart: "아무 곳이나 클릭하여 시작",
    soundEnabled: "사운드가 활성화됩니다",
  },

  // Game
  game: {
    rounds: {
      preflop: "프리플랍",
      flop: "플랍",
      turn: "턴",
      river: "리버",
    },
    labels: {
      you: "나",
      dealer: "딜러",
      vs: "VS",
    },
    messages: {
      revealingCards: "카드 공개 중...",
      calculatingWinRate: "승률 계산 중...",
      preparingNextRound: "다음 라운드 준비 중...",
      timeOut: "시간 초과!",
      wrongAnswer: "오답!",
    },
    questions: {
      whoHasBetterHand: "누가 더 좋은 패를 가지고 있나요?",
      whoHasHigherWinRate: "누구의 승률이 더 높을까요?",
      selectWinRate: "승률 범위를 선택하세요",
      enterWinRate: "예상 승률을 입력하세요",
      whatIsWinProbability: "당신의 승률은?",
    },
    tolerance: "허용 오차: ±{tolerance}%",
    validation: {
      invalidRange: "0에서 100 사이의 값을 입력하세요",
    },
    actions: {
      nextRound: "다음 라운드",
      nextLevel: "다음 레벨",
      viewRiver: "리버 보기",
      submit: "제출",
    },
  },

  // Results
  results: {
    correct: "정답!",
    wrong: "오답!",
    winner: "승리!",
    defeat: "패배",
    draw: "무승부",
    xpGain: "+{amount} XP",
    handRankingComparison: "핸드 랭킹 비교",
    winProbability: "승률",
    finalResult: "최종 결과",
    nextIs: "다음 레벨은",
    nextIsSuffix: "입니다.",
    yourAnswer: "당신의 답",
    correctAnswer: "정답",
    win: "승",
    ties: "무",
    loss: "패",
  },

  // Difficulty
  difficulty: {
    easy: "쉬움",
    normal: "보통",
    hard: "어려움",
    expert: "전문가",
    god: "홀덤의 신",
    level: "레벨 {number}",
  },

  // Level Info
  levelInfo: {
    easy: "더 좋은 패를 가진 사람을 선택하세요",
    normal: "올바른 승률 범위를 선택하세요",
    hard: "±5% 오차 내로 예측하세요",
    expert: "±3% 오차 내로 예측하세요",
    god: "±1% 오차 내로 예측하세요",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "천 개의 핸드 여정은 한 번의 베팅에서 시작됩니다.",
      "포커에서 인내는 미덕일 뿐만 아니라 전략입니다.",
      "언제 홀드하고 언제 폴드할지 알아야 합니다.",
      "모든 프로도 한때는 초보자였습니다.",
    ],
    normal: [
      "포커에서 포지션은 힘입니다.",
      "카드는 누가 이기고 있는지 모릅니다.",
      "카드만이 아닌 플레이어를 플레이하세요.",
      "규율이 승자와 패자를 구분합니다.",
    ],
    hard: [
      "최고의 패가 항상 이기지는 않습니다—최고의 플레이어가 이깁니다.",
      "포커는 결과가 아닌 결정의 게임입니다.",
      "리드를 믿되, 수학으로 검증하세요.",
      "압박은 테이블에서 성격을 드러냅니다.",
    ],
    expert: [
      "이 레벨에서는 모든 퍼센트 포인트가 중요합니다.",
      "엘리트는 다른 사람이 놓치는 패턴을 봅니다.",
      "숙달은 다른 사람이 모르는 것을 아는 것입니다.",
      "정밀함이 좋음과 위대함의 차이입니다.",
    ],
    god: [
      "포커 마스터리의 최종 테스트에 오신 것을 환영합니다.",
      "선택받은 자만이 이 영역에 도달합니다.",
      "1% 오차. 실수의 여지가 없습니다.",
      "확률의 신이 되세요.",
    ],
  },

  // Victory
  victory: {
    youWon: "승리!",
    levelCleared: "레벨 클리어",
    nextRank: "다음 랭크",
    bestAccuracy: "최고 정확도",
    totalScore: "총 점수",
    shareMessage: "커뮤니티와 승리를 공유하세요!",
    keepGoing: "계속하기 →",
    congratulations: "축하합니다! 홀덤의 신을 클리어했습니다!",
  },

  // Game Over
  gameOver: {
    title: "게임 오버",
    message: "다음에 더 잘할 수 있을 거예요!",
    finalScore: "최종 점수",
    tryAgain: "다시 시도",
    goHome: "홈으로",
    reachedLevel: "도달 레벨",
    finalHandAnalysis: "최종 핸드 분석",
    encouragement: "포기하지 마세요! 연습이 완벽을 만듭니다.",
    nextDuel: "재도전 →",
  },

  // Settings
  settings: {
    title: "설정",
    soundVibration: "사운드 & 진동",
    soundEffects: "효과음",
    vibration: "진동",
    theme: "테마",
    dataManagement: "데이터 관리",
    resetData: "모든 데이터 초기화",
    resetConfirm: "모든 게임 데이터가 삭제됩니다. 계속하시겠습니까?",
    language: "언어",
  },

  // Stats
  stats: {
    title: "통계",
    totalGames: "총 게임",
    totalWins: "총 승리",
    winRate: "승률",
    currentStreak: "현재 연승",
    maxStreak: "최고 연승",
    difficultyStats: "난이도별 통계",
    played: "플레이",
    cleared: "클리어",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "홀뎀잇에 오신 것을 환영합니다!",
      description: "포커 에퀴티 지식을 테스트하세요! 텍사스 홀덤의 각 단계에서 승률을 예측하세요.",
    },
    gameFlow: {
      title: "게임 진행",
      description: "프리플랍, 플랍, 턴, 리버 4라운드를 진행합니다. 정확한 예측으로 다음 단계로 진출하세요!",
    },
    difficulties: {
      title: "난이도 레벨",
      description: "쉬움부터 시작해서 홀덤의 신까지 도전하세요. 각 레벨은 더 높은 정밀도를 요구합니다.",
    },
    timeLimits: {
      title: "시간 제한",
      description: "프리플랍: 30초. 나머지 라운드: 60초. 빠르게 생각하세요!",
    },
    gotIt: "알겠습니다!",
    letsPlay: "플레이하기!",
  },

  // Hints
  hints: {
    veryFavorable: "매우 유리합니다! (80% 이상)",
    favorable: "유리한 편입니다. (60% 이상)",
    even: "거의 비슷합니다. (40~60%)",
    unfavorable: "불리한 편입니다. (40% 미만)",
    veryUnfavorable: "매우 불리합니다. (20% 미만)",
    showHint: "힌트 보기",
  },

  // Achievements
  achievements: {
    firstStep: "첫 발걸음",
    firstStepDesc: "첫 게임 플레이",
    tenGames: "열 번의 도전",
    tenGamesDesc: "10게임 플레이",
    firstWin: "첫 승리",
    firstWinDesc: "첫 게임 승리",
    streakStarter: "연승 시작",
    streakStarterDesc: "3연승 달성",
  },

  // Titles
  titles: {
    beginner: "초보 갬블러",
    probabilityStudent: "확률 입문자",
    firstWinner: "첫 승리자",
    consistentPlayer: "꾸준한 플레이어",
    expert: "포커 전문가",
    master: "포커 마스터",
    legend: "살아있는 전설",
    godOfHoldem: "홀덤의 신",
  },

  // Mascot Messages
  mascot: {
    tips: [
      "포켓 에이스(AA)는\n169개 핸드 중 1위예요!",
      "suited 핸드는 offsuit보다\n약 3% 더 유리해요",
      "포지션이 늦을수록 더 많은\n핸드를 플레이할 수 있어요",
      "플랍에서 페어가 될 확률은\n약 32%예요",
      "포켓 페어로 셋이 될 확률은\n약 12%예요",
      "AKs vs QQ는\n거의 동전 던지기예요!",
    ],
    events: [
      "일일 챌린지에서 모든 유저가\n같은 문제를 풀어요!",
      "연습 모드에서\n시간 제한 없이 연습해보세요!",
      "5단계 난이도를 모두 클리어하면\n명예의 전당에 등록!",
    ],
    challenges: {
      firstGame: "첫 게임을\n시작해볼까요? 🎮",
      threeStreak: "3연승에\n도전해보세요!",
      fiveStreak: "5연승 달성이\n목표예요!",
      godChallenge: "홀덤의 신에 도전해볼\n준비 됐나요? 👑",
    },
    status: {
      onStreak: "{count}연승 중! 대단해요! 🔥",
      winsAchieved: "{count}승 달성! 축하해요! 🎉",
      tryPractice: "연습 모드에서 감을 익혀보는 건 어때요?",
      proLevel: "승률 {rate}%! 프로 수준이네요! 👑",
    },
    luckyCard: "오늘의 럭키 카드: {card}",
    hotTables: "테이블이 뜨겁네요!",
  },
};
