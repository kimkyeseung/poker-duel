import { TranslationKeys } from './en';

export const zh: TranslationKeys = {
  // Common
  common: {
    appName: "德州扑克！",
    tagline: "终极胜率挑战",
    version: "Alpha 0.1",
    loading: "加载中...",
    error: "错误",
    confirm: "确认",
    cancel: "取消",
    close: "关闭",
    save: "保存",
    delete: "删除",
    back: "返回",
    next: "下一步",
    skip: "跳过",
    start: "开始",
    continue: "继续",
    retry: "重试",
    exit: "退出",
    menu: "菜单",
    home: "主页",
    yes: "是",
    no: "否",
  },

  // Navigation
  nav: {
    home: "主页",
    practice: "练习",
    credits: "制作人员",
    hiScore: "最高分",
    settings: "设置",
    stats: "统计",
  },

  // Home Page
  home: {
    quickPlay: "快速开始",
    practice: "练习模式",
    dailyRun: "每日挑战",
    viewCollection: "查看收藏",
    totalWins: "总胜利",
    bestStreak: "最佳连胜",
    rankStatus: "排名状态",
    wins: "胜利",
    streak: "连胜",
    winRate: "胜率",
    newBadge: "新",
    hotTables: "牌桌火热！",
    clickToStart: "点击任意位置开始",
  },

  // Game
  game: {
    rounds: {
      preflop: "翻牌前",
      flop: "翻牌",
      turn: "转牌",
      river: "河牌",
    },
    labels: {
      you: "你",
      dealer: "庄家",
      vs: "VS",
    },
    messages: {
      revealingCards: "正在揭示牌...",
      calculatingWinRate: "正在计算胜率...",
      preparingNextRound: "正在准备下一轮...",
      timeOut: "时间到！",
      wrongAnswer: "答案错误！",
    },
    actions: {
      nextRound: "下一轮",
      nextLevel: "下一级",
      viewRiver: "查看河牌",
    },
    questions: {
      whoHasBetterHand: "谁的牌更好？",
      selectWinRate: "选择胜率范围",
      enterWinRate: "输入你的胜率预测",
    },
  },

  // Results
  results: {
    correct: "正确！",
    wrong: "错误！",
    winner: "获胜！",
    defeat: "失败",
    draw: "平局",
    xpGain: "+{amount} XP",
    handRankingComparison: "牌型比较",
    winProbability: "胜率",
    yourAnswer: "你的答案",
    correctAnswer: "正确答案",
    win: "胜",
    ties: "平",
    loss: "负",
  },

  // Difficulty
  difficulty: {
    easy: "简单",
    normal: "普通",
    hard: "困难",
    expert: "专家",
    god: "德州之神",
    level: "等级 {number}",
  },

  // Level Info
  levelInfo: {
    easy: "选择谁有更好的牌",
    normal: "选择正确的胜率范围",
    hard: "预测精度在±5%以内",
    expert: "预测精度在±3%以内",
    god: "预测精度在±1%以内",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "千手之旅始于一次下注。",
      "在扑克中，耐心不仅是美德，更是策略。",
      "知道何时持有，何时弃牌。",
      "每个高手都曾是新手。",
    ],
    normal: [
      "在扑克中，位置就是力量。",
      "牌不知道谁在赢。",
      "玩家比牌更重要。",
      "纪律区分赢家和输家。",
    ],
    hard: [
      "最好的牌不一定赢——最好的玩家才会赢。",
      "扑克是决策的游戏，而非结果。",
      "相信你的判断，但要用数学验证。",
      "压力会在牌桌上暴露性格。",
    ],
    expert: [
      "在这个级别，每一个百分点都很重要。",
      "精英能看到别人看不到的模式。",
      "精通是知道别人不知道自己不知道的事。",
      "精确是好与卓越的区别。",
    ],
    god: [
      "欢迎来到扑克精通的最终考验。",
      "只有被选中的人才能到达这个境界。",
      "1%的容差。没有犯错的余地。",
      "成为概率之神。",
    ],
  },

  // Victory
  victory: {
    youWon: "你赢了！",
    levelCleared: "关卡完成",
    nextRank: "下一等级",
    bestAccuracy: "最佳精度",
    totalScore: "总分",
    shareMessage: "与社区分享你的胜利！",
    keepGoing: "继续 →",
    congratulations: "恭喜！你完成了德州之神！",
  },

  // Game Over
  gameOver: {
    title: "游戏结束",
    message: "下次好运！",
    finalScore: "最终分数",
    tryAgain: "再试一次",
    goHome: "返回主页",
  },

  // Settings
  settings: {
    title: "设置",
    soundVibration: "声音和振动",
    soundEffects: "音效",
    vibration: "振动",
    theme: "主题",
    dataManagement: "数据管理",
    resetData: "重置所有数据",
    resetConfirm: "所有游戏数据将被删除。继续？",
    language: "语言",
  },

  // Stats
  stats: {
    title: "统计",
    totalGames: "总游戏数",
    totalWins: "总胜利数",
    winRate: "胜率",
    currentStreak: "当前连胜",
    maxStreak: "最高连胜",
    difficultyStats: "难度统计",
    played: "已玩",
    cleared: "已通关",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "欢迎来到德州扑克！",
      description: "测试你的扑克胜率知识！预测德州扑克每个阶段的胜率。",
    },
    gameFlow: {
      title: "游戏流程",
      description: "经历4轮：翻牌前、翻牌、转牌和河牌。准确预测以晋级！",
    },
    difficulties: {
      title: "难度等级",
      description: "从简单开始，一路升级到德州之神。每个等级需要更高的精度。",
    },
    timeLimits: {
      title: "时间限制",
      description: "翻牌前：30秒。其他轮次：60秒。快速思考！",
    },
    gotIt: "明白了！",
    letsPlay: "开始游戏！",
  },

  // Hints
  hints: {
    veryFavorable: "非常有利！（80%+）",
    favorable: "有利。（60%+）",
    even: "几乎相等。（40-60%）",
    unfavorable: "不利。（40%-）",
    veryUnfavorable: "非常不利。（20%-）",
    showHint: "显示提示",
  },

  // Achievements
  achievements: {
    firstStep: "第一步",
    firstStepDesc: "玩第一局游戏",
    tenGames: "十次挑战",
    tenGamesDesc: "玩10局游戏",
    firstWin: "首次胜利",
    firstWinDesc: "赢得第一局游戏",
    streakStarter: "连胜开始",
    streakStarterDesc: "连续赢3局",
  },

  // Titles
  titles: {
    beginner: "新手赌徒",
    probabilityStudent: "概率学生",
    firstWinner: "首胜者",
    consistentPlayer: "稳定玩家",
    expert: "扑克专家",
    master: "扑克大师",
    legend: "活着的传奇",
  },
};
