'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  Card,
  Table,
  PlayerArea,
  AnswerInput,
  ResultDisplay,
  DifficultyBadge,
} from '@/components/game';
import { usePokerCalculator } from '@/hooks/usePokerCalculator';
import { createDeck, shuffleDeck } from '@/lib/poker';
import { evaluateStartingHand, compareStartingHands, StartingHandInfo } from '@/lib/poker/starting-hands';
import { checkAnswer } from '@/lib/poker/calculator';
import {
  Card as CardType,
  Difficulty,
  GameRound,
  WinRateResult,
  AnswerResult,
  DIFFICULTY_CONFIG,
} from '@/types';
import { cn } from '@/lib/utils';

// 연습 모드에서 사용 가능한 난이도 (쉬움~어려움)
const PRACTICE_DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];

export default function PracticePage() {
  const router = useRouter();
  const { calculate, isCalculating } = usePokerCalculator();

  // 게임 상태
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentRound, setCurrentRound] = useState<GameRound>('preflop');
  const [playerHand, setPlayerHand] = useState<[CardType, CardType] | null>(null);
  const [computerHand, setComputerHand] = useState<[CardType, CardType] | null>(null);
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [deck, setDeck] = useState<CardType[]>([]);

  // UI 상태
  const [currentWinRate, setCurrentWinRate] = useState<WinRateResult | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // 새 게임 시작
  const startNewGame = useCallback(() => {
    const newDeck = shuffleDeck(createDeck());
    const newPlayerHand: [CardType, CardType] = [newDeck[0], newDeck[1]];
    const newComputerHand: [CardType, CardType] = [newDeck[2], newDeck[3]];

    setDeck(newDeck.slice(4));
    setPlayerHand(newPlayerHand);
    setComputerHand(newComputerHand);
    setCommunityCards([]);
    setCurrentRound('preflop');
    setCurrentWinRate(null);
    setLastAnswer(null);
    setShowResult(false);
    setIsPlaying(true);
  }, []);

  // 라운드 변경 시 승률 계산
  useEffect(() => {
    if (isPlaying && playerHand && computerHand && !showResult) {
      if (currentRound !== 'preflop') {
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
        });
      }
    }
  }, [isPlaying, currentRound, playerHand, computerHand, communityCards, calculate, showResult]);

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string | number) => {
    if (!playerHand || !computerHand) return;

    if (currentRound === 'preflop') {
      // 프리플랍: 핸드랭킹 비교 (승률 계산 없음)
      const comparison = compareStartingHands(playerHand, computerHand);
      const playerFavorite = comparison <= 0;
      const isCorrect = answer === 'player' ? playerFavorite : !playerFavorite;

      // 핸드 순위 기반 결과 생성
      const playerInfo = evaluateStartingHand(playerHand);
      const computerInfo = evaluateStartingHand(computerHand);
      const correctAnswer = playerInfo.rank < computerInfo.rank ? 'player' : 'computer';

      const preflopResult: WinRateResult = {
        playerWinRate: playerInfo.rank < computerInfo.rank ? 100 : 0,
        computerWinRate: computerInfo.rank < playerInfo.rank ? 100 : 0,
        tieRate: playerInfo.rank === computerInfo.rank ? 100 : 0,
        totalCombinations: 0,
        playerWins: playerInfo.rank < computerInfo.rank ? 1 : 0,
        computerWins: computerInfo.rank < playerInfo.rank ? 1 : 0,
        ties: playerInfo.rank === computerInfo.rank ? 1 : 0,
      };

      setCurrentWinRate(preflopResult);
      setLastAnswer({
        round: currentRound,
        playerAnswer: answer,
        correctAnswer: correctAnswer,
        isCorrect,
        winRateResult: preflopResult,
      });
      setShowResult(true);
    } else {
      if (!currentWinRate) return;

      const isCorrect = checkAnswer(difficulty, answer, currentWinRate);
      setLastAnswer({
        round: currentRound,
        playerAnswer: answer,
        correctAnswer: currentWinRate.playerWinRate,
        isCorrect,
        winRateResult: currentWinRate,
      });
      setShowResult(true);
    }
  }, [playerHand, computerHand, currentRound, difficulty, currentWinRate, calculate]);

  // 다음 라운드
  const handleNextRound = useCallback(() => {
    const roundOrder: GameRound[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = roundOrder.indexOf(currentRound);

    if (currentIndex < roundOrder.length - 1) {
      const nextRound = roundOrder[currentIndex + 1];

      // 커뮤니티 카드 추가
      let newCommunityCards = [...communityCards];

      if (nextRound === 'flop') {
        newCommunityCards = [deck[1], deck[2], deck[3]];
        setDeck(deck.slice(4));
      } else if (nextRound === 'turn') {
        newCommunityCards = [...communityCards, deck[1]];
        setDeck(deck.slice(2));
      } else if (nextRound === 'river') {
        newCommunityCards = [...communityCards, deck[1]];
        setDeck(deck.slice(2));
      }

      setCommunityCards(newCommunityCards);
      setCurrentRound(nextRound);
      setShowResult(false);
      setLastAnswer(null);
      setCurrentWinRate(null);
    } else {
      // 모든 라운드 완료, 새 게임
      startNewGame();
    }
  }, [currentRound, communityCards, deck, startNewGame]);

  // 난이도 변경
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    if (isPlaying) {
      startNewGame();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← 나가기
          </button>
          <div className="text-amber-500 font-bold text-lg">🎯 연습 모드</div>
          <div className="w-16" /> {/* 스페이서 */}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {!isPlaying ? (
          // 시작 화면
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl">🎯</div>
              <h1 className="text-2xl font-bold text-white">연습 모드</h1>
              <p className="text-slate-400">
                시간 제한 없이 자유롭게 연습하세요
              </p>
            </div>

            {/* 난이도 선택 */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-3">난이도 선택</div>
              <div className="flex gap-2 justify-center">
                {PRACTICE_DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'px-4 py-2 rounded-lg font-semibold transition-all',
                      difficulty === d
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    )}
                  >
                    {DIFFICULTY_CONFIG[d].nameKo}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3">
                * 전문가, 홀덤의 신은 본 게임에서만 도전 가능
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={startNewGame}
              className="w-full"
            >
              연습 시작
            </Button>
          </div>
        ) : (
          // 게임 화면
          <>
            <DifficultyBadge difficulty={difficulty} />

            {/* 컴퓨터 영역 */}
            <PlayerArea
              cards={computerHand}
              isComputer
              label="컴퓨터"
              handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
            />

            {/* 테이블 */}
            <Table communityCards={communityCards} className="w-full max-w-2xl" />

            {/* 플레이어 영역 */}
            <PlayerArea
              cards={playerHand}
              label="나"
              handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
              winRate={showResult && currentWinRate ? currentWinRate.playerWinRate : undefined}
            />

            {/* 입력/결과 영역 */}
            <div className="w-full max-w-md space-y-4">
              {/* 계산 중 */}
              {isCalculating && (
                <div className="text-center text-slate-400">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2" />
                  <p>승률 계산 중...</p>
                </div>
              )}

              {/* 답변 입력 */}
              {!showResult && !isCalculating && (
                <AnswerInput
                  difficulty={difficulty}
                  currentRound={currentRound}
                  onSubmit={handleSubmitAnswer}
                />
              )}

              {/* 결과 표시 */}
              {showResult && lastAnswer && currentWinRate && (
                <div className="space-y-4">
                  <ResultDisplay
                    winRateResult={currentWinRate}
                    answerResult={lastAnswer}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={startNewGame}
                      className="flex-1"
                    >
                      새 게임
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleNextRound}
                      className="flex-1"
                    >
                      {currentRound === 'river' ? '새 게임' : '다음 라운드'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
