import { TranslationKeys } from './en';

export const ja: TranslationKeys = {
  // Common
  common: {
    appName: "ホールダムイット！",
    tagline: "究極のエクイティチャレンジ",
    version: "Alpha 0.1",
    loading: "読み込み中...",
    error: "エラー",
    confirm: "確認",
    cancel: "キャンセル",
    close: "閉じる",
    save: "保存",
    delete: "削除",
    back: "戻る",
    next: "次へ",
    skip: "スキップ",
    start: "スタート",
    continue: "続ける",
    retry: "リトライ",
    exit: "終了",
    menu: "メニュー",
    home: "ホーム",
    yes: "はい",
    no: "いいえ",
  },

  // Navigation
  nav: {
    home: "ホーム",
    practice: "練習",
    credits: "クレジット",
    hiScore: "ハイスコア",
    settings: "設定",
    stats: "統計",
  },

  // Home Page
  home: {
    quickPlay: "クイックプレイ",
    practice: "練習モード",
    dailyRun: "デイリーチャレンジ",
    viewCollection: "コレクションを見る",
    totalWins: "総勝利数",
    bestStreak: "最高連勝",
    rankStatus: "ランク状態",
    wins: "勝利",
    streak: "連勝",
    winRate: "勝率",
    newBadge: "NEW",
    hotTables: "テーブルが熱い！",
    clickToStart: "どこかをクリックして開始",
    soundEnabled: "サウンドが有効になります",
  },

  // Practice Mode
  practice: {
    title: "練習モード",
    description: "時間制限なしで練習",
    selectDifficulty: "難易度を選択",
    startPractice: "練習開始",
    modeRestriction: "* エキスパートと神モードはメインゲームでのみ利用可能",
  },

  // Game
  game: {
    rounds: {
      preflop: "プリフロップ",
      flop: "フロップ",
      turn: "ターン",
      river: "リバー",
    },
    labels: {
      you: "あなた",
      dealer: "ディーラー",
      opponent1: "対戦相手1",
      opponent2: "対戦相手2",
      smallBlind: "スモールブラインド",
      bigBlind: "ビッグブラインド",
      vs: "VS",
      yourAnswer: "あなたの回答",
    },
    opponents: {
      defeated: "相手を撃破！",
      nextOpponent: "次の相手",
      preparing: "次の相手を準備中...",
    },
    messages: {
      revealingCards: "カードを公開中...",
      calculatingWinRate: "勝率を計算中...",
      preparingNextRound: "次のラウンドを準備中...",
      timeOut: "タイムアウト！",
      wrongAnswer: "不正解！",
    },
    questions: {
      whoHasBetterHand: "どちらが良いハンドを持っていますか？",
      whoHasHigherWinRate: "どちらの勝率が高いですか？",
      selectWinRate: "勝率の範囲を選択してください",
      enterWinRate: "予想勝率を入力してください",
      whatIsWinProbability: "あなたの勝率は？",
    },
    tolerance: "許容誤差: ±{tolerance}%",
    choice3: {
      low: "低",
      medium: "中",
      high: "高",
    },
    validation: {
      invalidRange: "0から100の間の値を入力してください",
    },
    actions: {
      newGame: "新しいゲーム",
      nextRound: "次のラウンド",
      nextLevel: "次のレベル",
      viewRiver: "リバーを見る",
      submit: "送信",
      showAnswer: "回答する",
      hideAnswer: "隠す",
    },
  },

  // Results
  results: {
    correct: "正解！",
    wrong: "不正解！",
    winner: "勝利！",
    defeat: "敗北",
    draw: "引き分け",
    xpGain: "+{amount} XP",
    handRankingComparison: "ハンドランキング比較",
    winProbability: "勝率",
    finalResult: "最終結果",
    nextIs: "次のレベルは",
    nextIsSuffix: "です。",
    yourAnswer: "あなたの回答",
    correctAnswer: "正解",
    win: "勝",
    ties: "分",
    loss: "敗",
    details: "詳細",
    outcomeDetails: "結果の詳細",
    addedCards: "追加カード",
    totalCombinations: "総組み合わせ",
    noOutcomes: "このカテゴリに結果なし",
  },

  // Hand Ranks
  handRanks: {
    royalFlush: "ロイヤルフラッシュ",
    straightFlush: "ストレートフラッシュ",
    fourOfAKind: "フォーカード",
    fullHouse: "フルハウス",
    flush: "フラッシュ",
    straight: "ストレート",
    threeOfAKind: "スリーカード",
    twoPair: "ツーペア",
    onePair: "ワンペア",
    highCard: "ハイカード",
  },

  // Outcome Analysis
  outcomeAnalysis: {
    title: "結果分析",
    tableContext: "テーブル状況",
    handDistribution: "ハンド分布",
    matchupAnalysis: "マッチアップ分析",
    yourHand: "あなたのハンド",
    dealerHand: "ディーラーハンド",
    communityCards: "コミュニティカード",
    remaining: "残り",
    vsDealer: "vs ディーラー",
    showMore: "もっと見る",
    showLess: "閉じる",
    clickToSeeCards: "クリックしてカードの組み合わせを見る",
    winningCards: "勝ちカード",
    tieCards: "引き分けカード",
    losingCards: "負けカード",
    allCombinations: "全組み合わせ",
    viewAll: "すべて見る",
    viewAllCombinations: "全組み合わせを見る",
    others: "その他",
    matchups: "マッチアップ",
    all: "すべて",
  },

  // Difficulty
  difficulty: {
    easy: "イージー",
    normal: "ノーマル",
    hard: "ハード",
    expert: "エキスパート",
    king: "ホールデム王",
    god: "ホールデムの神",
    level: "レベル {number}",
  },

  // Level Info
  levelInfo: {
    easy: "より良いハンドを持っている方を選んでください",
    normal: "3つの勝率範囲から選んでください",
    hard: "5つの勝率範囲から選んでください",
    expert: "±5%の精度で予測してください",
    king: "±3%の精度で予測してください",
    god: "±1%の精度で予測してください",
  },

  // Poker Quotes
  quotes: {
    easy: [
      "千のハンドの旅は一つのベットから始まる。",
      "ポーカーでは、忍耐は美徳だけでなく戦略である。",
      "いつホールドし、いつフォールドするかを知れ。",
      "すべてのプロもかつては初心者だった。",
    ],
    normal: [
      "ポーカーではポジションが力である。",
      "カードは誰が勝っているか知らない。",
      "カードだけでなくプレイヤーをプレイせよ。",
      "規律が勝者と敗者を分ける。",
    ],
    hard: [
      "最高のハンドが常に勝つわけではない—最高のプレイヤーが勝つ。",
      "ポーカーは結果ではなく決断のゲームである。",
      "リードを信じつつ、数学で検証せよ。",
      "プレッシャーはテーブルで性格を明らかにする。",
    ],
    expert: [
      "このレベルでは、すべてのパーセンテージポイントが重要。",
      "エリートは他者が見逃すパターンを見る。",
      "熟達とは他者が知らないことを知ること。",
      "精度が良いと素晴らしいの違いを生む。",
    ],
    king: [
      "王の玉座に挑戦するとは！",
      "ここで生き残れば、真の王だ。",
      "3%以内に入れ。集中しろ。",
      "王冠は最も正確な者に与えられる。",
    ],
    god: [
      "ポーカーマスタリーの最終テストへようこそ。",
      "選ばれた者だけがこの領域に到達する。",
      "1%の許容範囲。エラーの余地なし。",
      "確率の神になれ。",
    ],
  },

  // Victory
  victory: {
    youWon: "勝利！",
    levelCleared: "レベルクリア",
    nextRank: "次のランク",
    bestAccuracy: "最高精度",
    totalScore: "総スコア",
    shareMessage: "コミュニティと勝利を共有しよう！",
    keepGoing: "続ける →",
    congratulations: "おめでとうございます！ホールデムの神をクリアしました！",
  },

  // Game Over
  gameOver: {
    title: "ゲームオーバー",
    message: "次回の健闘を祈る！",
    finalScore: "最終スコア",
    tryAgain: "もう一度",
    goHome: "ホームへ",
    reachedLevel: "到達レベル",
    finalHandAnalysis: "最終ハンド分析",
    encouragement: "諦めないで！練習が完璧を生む。",
    nextDuel: "再挑戦 →",
  },

  // Settings
  settings: {
    title: "設定",
    soundVibration: "サウンドと振動",
    soundEffects: "効果音",
    vibration: "振動",
    theme: "テーマ",
    dataManagement: "データ管理",
    resetData: "データをリセット",
    resetConfirm: "すべてのゲームデータが削除されます。続けますか？",
    language: "言語",
  },

  // Stats
  stats: {
    title: "統計",
    totalGames: "総ゲーム数",
    totalWins: "総勝利数",
    winRate: "勝率",
    currentStreak: "現在の連勝",
    maxStreak: "最高連勝",
    difficultyStats: "難易度別統計",
    played: "プレイ",
    cleared: "クリア",
  },

  // Tutorial
  tutorial: {
    welcome: {
      title: "ホールダムイットへようこそ！",
      description: "ポーカーエクイティの知識をテスト！テキサスホールデムの各段階で勝率を予測しよう。",
    },
    gameFlow: {
      title: "ゲームの流れ",
      description: "プリフロップ、フロップ、ターン、リバーの4ラウンドを進む。正確な予測で次に進もう！",
    },
    difficulties: {
      title: "難易度レベル",
      description: "イージーから始めてホールデムの神を目指そう。各レベルはより高い精度を要求する。",
    },
    timeLimits: {
      title: "制限時間",
      description: "プリフロップ：30秒。他のラウンド：60秒。素早く考えよう！",
    },
    gotIt: "わかった！",
    letsPlay: "プレイしよう！",
  },

  // Hints
  hints: {
    veryFavorable: "非常に有利！（80%以上）",
    favorable: "有利。（60%以上）",
    even: "ほぼ互角。（40-60%）",
    unfavorable: "不利。（40%未満）",
    veryUnfavorable: "非常に不利。（20%未満）",
    showHint: "ヒントを表示",
  },

  // Achievements
  achievements: {
    firstStep: "最初の一歩",
    firstStepDesc: "初めてのゲームをプレイ",
    tenGames: "10回の挑戦",
    tenGamesDesc: "10ゲームをプレイ",
    firstWin: "初勝利",
    firstWinDesc: "初めてのゲームに勝利",
    streakStarter: "連勝開始",
    streakStarterDesc: "3連勝を達成",
  },

  // Titles
  titles: {
    beginner: "初心者ギャンブラー",
    probabilityStudent: "確率の学生",
    firstWinner: "初勝利者",
    consistentPlayer: "安定したプレイヤー",
    expert: "ポーカーエキスパート",
    master: "ポーカーマスター",
    legend: "生きる伝説",
    godOfHoldem: "ホールデムの神",
  },

  // Mascot Messages
  mascot: {
    tips: [
      "ポケットエース(AA)は\n169種類中1位!",
      "スーテッドハンドはオフスートより\n約3%有利です",
      "ポジションが遅いほど\nプレイできるハンドが増えます",
      "フロップでペアになる確率は\n約32%です",
      "ポケットペアがセットになる確率は\n約12%です",
      "AKs vs QQは\nほぼコイントス!",
    ],
    events: [
      "デイリーチャレンジでは全員が\n同じ問題を解きます!",
      "練習モードでは\n時間制限なし!",
      "5つの難易度を全クリアで\n殿堂入り!",
    ],
    challenges: {
      firstGame: "初めてのゲームを\n始めますか? 🎮",
      threeStreak: "3連勝に\n挑戦しよう!",
      fiveStreak: "目標は\n5連勝!",
      godChallenge: "ホールデムの神に\n挑戦する準備は? 👑",
    },
    status: {
      onStreak: "{count}連勝中! すごい! 🔥",
      winsAchieved: "{count}勝達成! おめでとう! 🎉",
      tryPractice: "練習モードで\nウォームアップしませんか?",
      proLevel: "勝率{rate}%! プロレベル! 👑",
    },
    luckyCard: "今日のラッキーカード: {card}",
    hotTables: "テーブルが熱い!",
  },
};
