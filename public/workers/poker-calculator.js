// Poker Calculator Web Worker
// UI 블로킹 없이 승률 계산

// 랭크를 숫자로 변환
function rankToNumber(rank) {
  const rankMap = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 11, 'Q': 12, 'K': 13, 'A': 14,
  };
  return rankMap[rank];
}

// 52장 덱 생성
function createDeck() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// 카드 비교
function isSameCard(a, b) {
  return a.suit === b.suit && a.rank === b.rank;
}

// 덱에서 특정 카드 제외
function excludeCards(deck, exclude) {
  return deck.filter(card => !exclude.some(ex => isSameCard(card, ex)));
}

// 조합 생성
function* combinations(arr, r) {
  if (r === 0) {
    yield [];
    return;
  }
  if (arr.length < r) return;

  for (let i = 0; i <= arr.length - r; i++) {
    for (const combo of combinations(arr.slice(i + 1), r - 1)) {
      yield [arr[i], ...combo];
    }
  }
}

// 5장에서 조합 생성
function getCombinations5(arr) {
  const result = [];
  const n = arr.length;
  for (let i = 0; i < n - 4; i++) {
    for (let j = i + 1; j < n - 3; j++) {
      for (let k = j + 1; k < n - 2; k++) {
        for (let l = k + 1; l < n - 1; l++) {
          for (let m = l + 1; m < n; m++) {
            result.push([arr[i], arr[j], arr[k], arr[l], arr[m]]);
          }
        }
      }
    }
  }
  return result;
}

// 핸드 랭크
const HandRank = {
  HIGH_CARD: 1,
  ONE_PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
};

// 스트레이트 체크
function checkStraight(ranks) {
  const sorted = [...ranks].sort((a, b) => b - a);
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i] - sorted[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}

// 휠 스트레이트 체크
function checkWheelStraight(ranks) {
  const sorted = [...ranks].sort((a, b) => b - a);
  return (
    sorted[0] === 14 &&
    sorted[1] === 5 &&
    sorted[2] === 4 &&
    sorted[3] === 3 &&
    sorted[4] === 2
  );
}

// 랭크별 카운트
function getRankCounts(ranks) {
  const counts = {};
  for (const rank of ranks) {
    counts[rank] = (counts[rank] || 0) + 1;
  }
  return counts;
}

// 카운트 패턴에 맞는 하이카드 정렬
function getHighCardsForCounts(rankCounts, pattern) {
  const entries = Object.entries(rankCounts)
    .map(([rank, count]) => ({ rank: parseInt(rank), count }))
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return b.rank - a.rank;
    });

  const result = [];
  let patternIndex = 0;

  for (const entry of entries) {
    if (patternIndex < pattern.length && entry.count === pattern[patternIndex]) {
      result.push(entry.rank);
      patternIndex++;
    } else if (entry.count === 1 && pattern.includes(1)) {
      result.push(entry.rank);
    }
  }

  return result;
}

// 점수 계산
function calculateScore(rank, highCards) {
  let score = rank * Math.pow(15, 5);
  for (let i = 0; i < highCards.length && i < 5; i++) {
    score += highCards[i] * Math.pow(15, 4 - i);
  }
  return score;
}

// 5장 핸드 평가
function evaluateFiveCards(cards) {
  const ranks = cards.map(c => rankToNumber(c.rank)).sort((a, b) => b - a);
  const suits = cards.map(c => c.suit);

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = checkStraight(ranks);
  const isWheelStraight = checkWheelStraight(ranks);

  const rankCounts = getRankCounts(ranks);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  let rank;
  let highCards;

  if (isFlush && isStraight && ranks[0] === 14) {
    rank = HandRank.ROYAL_FLUSH;
    highCards = ranks;
  } else if (isFlush && (isStraight || isWheelStraight)) {
    rank = HandRank.STRAIGHT_FLUSH;
    highCards = isWheelStraight ? [5, 4, 3, 2, 1] : ranks;
  } else if (counts[0] === 4) {
    rank = HandRank.FOUR_OF_A_KIND;
    highCards = getHighCardsForCounts(rankCounts, [4, 1]);
  } else if (counts[0] === 3 && counts[1] === 2) {
    rank = HandRank.FULL_HOUSE;
    highCards = getHighCardsForCounts(rankCounts, [3, 2]);
  } else if (isFlush) {
    rank = HandRank.FLUSH;
    highCards = ranks;
  } else if (isStraight || isWheelStraight) {
    rank = HandRank.STRAIGHT;
    highCards = isWheelStraight ? [5, 4, 3, 2, 1] : ranks;
  } else if (counts[0] === 3) {
    rank = HandRank.THREE_OF_A_KIND;
    highCards = getHighCardsForCounts(rankCounts, [3, 1, 1]);
  } else if (counts[0] === 2 && counts[1] === 2) {
    rank = HandRank.TWO_PAIR;
    highCards = getHighCardsForCounts(rankCounts, [2, 2, 1]);
  } else if (counts[0] === 2) {
    rank = HandRank.ONE_PAIR;
    highCards = getHighCardsForCounts(rankCounts, [2, 1, 1, 1]);
  } else {
    rank = HandRank.HIGH_CARD;
    highCards = ranks;
  }

  return {
    rank,
    highCards,
    score: calculateScore(rank, highCards),
  };
}

// 7장에서 최고의 5장 조합 찾기
function evaluateBestHand(cards) {
  if (cards.length < 5) {
    throw new Error('최소 5장의 카드가 필요합니다');
  }

  if (cards.length === 5) {
    return evaluateFiveCards(cards);
  }

  const combos = getCombinations5(cards);
  let bestHand = null;

  for (const combo of combos) {
    const evaluation = evaluateFiveCards(combo);
    if (!bestHand || evaluation.score > bestHand.score) {
      bestHand = evaluation;
    }
  }

  return bestHand;
}

// 분석 데이터 집계
function calculateAnalytics(outcomes) {
  const playerDist = {};
  const computerDist = {};
  const matchups = {};

  // 초기화 (HandRank 1~10)
  for (let i = 1; i <= 10; i++) {
    playerDist[i] = 0;
    computerDist[i] = 0;
  }

  // 집계
  for (const o of outcomes) {
    playerDist[o.playerHandRank]++;
    computerDist[o.computerHandRank]++;

    const key = `${o.playerHandRank}-${o.computerHandRank}`;
    if (!matchups[key]) {
      matchups[key] = {
        playerRank: o.playerHandRank,
        computerRank: o.computerHandRank,
        wins: 0,
        ties: 0,
        losses: 0,
        total: 0,
      };
    }
    matchups[key].total++;
    if (o.outcome === 'win') {
      matchups[key].wins++;
    } else if (o.outcome === 'tie') {
      matchups[key].ties++;
    } else {
      matchups[key].losses++;
    }
  }

  // 매치업을 total 기준 내림차순 정렬
  const matchupBreakdowns = Object.values(matchups).sort((a, b) => b.total - a.total);

  return {
    playerHandDistribution: playerDist,
    computerHandDistribution: computerDist,
    matchupBreakdowns,
  };
}

// 완전 탐색으로 승률 계산
function calculateWinRate(playerHand, computerHand, communityCards, includeDetails = false) {
  const usedCards = [...playerHand, ...computerHand, ...communityCards];
  const remainingDeck = excludeCards(createDeck(), usedCards);

  const neededCards = 5 - communityCards.length;

  let playerWins = 0;
  let computerWins = 0;
  let ties = 0;
  let totalCombinations = 0;

  // 상세 모드: 각 경우의 카드 조합 저장
  const outcomes = includeDetails ? [] : null;

  for (const combo of combinations(remainingDeck, neededCards)) {
    const fullCommunity = [...communityCards, ...combo];

    const playerCards = [...playerHand, ...fullCommunity];
    const computerCards = [...computerHand, ...fullCommunity];

    const playerEval = evaluateBestHand(playerCards);
    const computerEval = evaluateBestHand(computerCards);

    let outcome;
    if (playerEval.score > computerEval.score) {
      playerWins++;
      outcome = 'win';
    } else if (playerEval.score < computerEval.score) {
      computerWins++;
      outcome = 'loss';
    } else {
      ties++;
      outcome = 'tie';
    }

    // 상세 모드에서 카드 조합 + 핸드 랭크 저장
    if (includeDetails) {
      outcomes.push({
        cards: combo, // 추가된 커뮤니티 카드들
        outcome,
        playerHandRank: playerEval.rank,
        computerHandRank: computerEval.rank,
      });
    }

    totalCombinations++;
  }

  const playerWinRate = (playerWins / totalCombinations) * 100;
  const computerWinRate = (computerWins / totalCombinations) * 100;
  const tieRate = (ties / totalCombinations) * 100;

  const result = {
    playerWinRate,
    computerWinRate,
    tieRate,
    totalCombinations,
    playerWins,
    computerWins,
    ties,
  };

  if (includeDetails) {
    result.outcomes = outcomes;
    // 분석 데이터 추가
    const analytics = calculateAnalytics(outcomes);
    result.playerHandDistribution = analytics.playerHandDistribution;
    result.computerHandDistribution = analytics.computerHandDistribution;
    result.matchupBreakdowns = analytics.matchupBreakdowns;
  }

  return result;
}

// 메시지 핸들러
self.onmessage = function(e) {
  const { type, playerHand, computerHand, communityCards, includeDetails } = e.data;

  try {
    if (type === 'calculate') {
      const result = calculateWinRate(playerHand, computerHand, communityCards || [], false);
      self.postMessage({ type: 'result', data: result });
    } else if (type === 'calculateWithDetails') {
      const result = calculateWinRate(playerHand, computerHand, communityCards || [], true);
      self.postMessage({ type: 'resultWithDetails', data: result });
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
};
