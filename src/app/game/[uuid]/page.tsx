'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { usePokerCalculator } from '@/hooks/usePokerCalculator';
import { Button, TimerBar } from '@/components/ui';
import {
  Card,
  Table,
  PlayerArea,
  AnswerInput,
  ResultDisplay,
  GameOverDialog,
  VictoryDialog,
  DifficultyBadge,
  DifficultyProgress,
} from '@/components/game';
import { checkAnswer } from '@/lib/poker/calculator';
import { evaluateStartingHand, compareStartingHands, StartingHandInfo } from '@/lib/poker/starting-hands';
import { recordGameResult, updateStreak, addHandToHistory } from '@/lib/storage';
import { DIFFICULTY_CONFIG, WinRateResult, AnswerResult, GameRound } from '@/types';
import { cn } from '@/lib/utils';

// 카드 공개 애니메이션 시간 (ms)
const CARD_REVEAL_DURATION = 2000;

export default function GamePage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;

  const {
    gameId,
    difficulty,
    status,
    currentRound,
    playerHand,
    computerHand,
    communityCards,
    timeRemaining,
    isTimerRunning,
    winRateResult,
    answers,
    initGame,
    startRound,
    decrementTimer,
    stopTimer,
    gameOver,
    nextRound,
    nextDifficulty,
    victory,
    resetGame,
    getTimeLimit,
    shouldSkipPreflop,
  } = useGameStore();

  const { calculate, isCalculating } = usePokerCalculator();
  const [currentWinRate, setCurrentWinRate] = useState<WinRateResult | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // 카드 공개 애니메이션 상태
  const [isRevealingCards, setIsRevealingCards] = useState(false);
  const [isRevealingPlayerCards, setIsRevealingPlayerCards] = useState(false);
  const [newCardsCount, setNewCardsCount] = useState(0);
  const [hasPlayerCardsRevealed, setHasPlayerCardsRevealed] = useState(false);

  // 게임 초기화 (uuid가 변경될 때만 실행)
  useEffect(() => {
    // uuid가 변경되었거나 gameId가 없을 때만 초기화
    if (!gameId || gameId !== uuid) {
      initGame('easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  // 라운드 시작 시 승률 계산 및 카드 공개 애니메이션
  useEffect(() => {
    if (status === 'playing' && playerHand && computerHand) {

      if (currentRound === 'preflop') {
        // 프리플랍: 핸드랭킹 비교
        if (shouldSkipPreflop()) {
          // 같은 핸드면 플랍으로 스킵
          setHasPlayerCardsRevealed(true);
          nextRound();
        } else {
          // 플레이어 카드 공개 애니메이션
          setIsRevealingPlayerCards(true);
          setTimeout(() => {
            setIsRevealingPlayerCards(false);
            setHasPlayerCardsRevealed(true);
            startRound();
          }, CARD_REVEAL_DURATION);
        }
      } else if (currentRound === 'river') {
        // 리버: 카드 공개 후 결과 확인
        setIsRevealingCards(true);
        setNewCardsCount(1);
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          // 애니메이션 완료 후 결과 표시
          setTimeout(() => {
            setIsRevealingCards(false);
            setNewCardsCount(0);
            handleRiverResult(result);
          }, CARD_REVEAL_DURATION);
        });
      } else if (currentRound === 'flop') {
        // 플랍: 3장 공개 애니메이션
        setIsRevealingCards(true);
        setNewCardsCount(3);
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          // 애니메이션 완료 후 라운드 시작
          setTimeout(() => {
            setIsRevealingCards(false);
            setNewCardsCount(0);
            startRound();
          }, CARD_REVEAL_DURATION);
        });
      } else if (currentRound === 'turn') {
        // 턴: 1장 공개 애니메이션
        setIsRevealingCards(true);
        setNewCardsCount(1);
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          // 애니메이션 완료 후 라운드 시작
          setTimeout(() => {
            setIsRevealingCards(false);
            setNewCardsCount(0);
            startRound();
          }, CARD_REVEAL_DURATION);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentRound, communityCards.length]);

  // 타이머 타임아웃 처리
  const handleTimeout = useCallback(() => {
    stopTimer();
    gameOver('시간 초과!');
    recordGameResult(difficulty, false);
    updateStreak(false);
  }, [stopTimer, gameOver, difficulty]);

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string | number) => {
    if (!playerHand || !computerHand) return;

    stopTimer();

    let isCorrect = false;
    let actualWinRate = currentWinRate;

    if (currentRound === 'preflop') {
      // 프리플랍: 핸드랭킹 비교 (승률 계산 없음)
      const comparison = compareStartingHands(playerHand, computerHand);
      const playerFavorite = comparison <= 0;

      if (answer === 'player') {
        isCorrect = playerFavorite;
      } else {
        isCorrect = !playerFavorite;
      }

      // 프리플랍: 핸드 순위로만 결과 표시 (승률 계산 X)
      const playerInfo = evaluateStartingHand(playerHand);
      const computerInfo = evaluateStartingHand(computerHand);

      // 순위 기반 WinRateResult 생성 (프리플랍은 승률 계산 X)
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
      processPreflopResult(isCorrect, answer, playerInfo, computerInfo);
      return;
    }

    if (!actualWinRate) return;

    isCorrect = checkAnswer(difficulty, answer, actualWinRate);
    processAnswerResult(isCorrect, answer, actualWinRate);
  }, [playerHand, computerHand, currentRound, difficulty, currentWinRate, calculate, stopTimer]);

  // 정답 결과 처리
  const processAnswerResult = (isCorrect: boolean, answer: string | number, winRate: WinRateResult) => {
    const result: AnswerResult = {
      round: currentRound,
      playerAnswer: answer,
      correctAnswer: winRate.playerWinRate,
      isCorrect,
      winRateResult: winRate,
    };

    setLastAnswer(result);
    setShowResult(true);

    if (!isCorrect) {
      gameOver('오답입니다!');
      recordGameResult(difficulty, false);
      updateStreak(false);
    }
  };

  // 프리플랍 결과 처리 (핸드 순위 기반)
  const processPreflopResult = (
    isCorrect: boolean,
    answer: string | number,
    playerInfo: StartingHandInfo,
    computerInfo: StartingHandInfo
  ) => {
    // 프리플랍은 순위로 정답 표시 (낮은 순위가 강함)
    const correctAnswer = playerInfo.rank < computerInfo.rank ? 'player' : 'computer';

    const result: AnswerResult = {
      round: 'preflop',
      playerAnswer: answer,
      correctAnswer: correctAnswer,
      isCorrect,
      winRateResult: {
        playerWinRate: playerInfo.rank < computerInfo.rank ? 100 : 0,
        computerWinRate: computerInfo.rank < playerInfo.rank ? 100 : 0,
        tieRate: playerInfo.rank === computerInfo.rank ? 100 : 0,
        totalCombinations: 0,
        playerWins: playerInfo.rank < computerInfo.rank ? 1 : 0,
        computerWins: computerInfo.rank < playerInfo.rank ? 1 : 0,
        ties: playerInfo.rank === computerInfo.rank ? 1 : 0,
      },
      // 핸드 순위 정보 추가
      playerHandRank: {
        name: playerInfo.name,
        rank: playerInfo.rank,
      },
      computerHandRank: {
        name: computerInfo.name,
        rank: computerInfo.rank,
      },
    };

    setLastAnswer(result);
    setShowResult(true);

    if (!isCorrect) {
      gameOver('오답입니다!');
      recordGameResult(difficulty, false);
      updateStreak(false);
    }
  };

  // 리버 결과 처리
  const handleRiverResult = (result: WinRateResult) => {
    // 리버는 확인만 하고 다음 진행
    setLastAnswer({
      round: 'river',
      playerAnswer: '',
      correctAnswer: result.playerWinRate,
      isCorrect: true,
      winRateResult: result,
    });
    setShowResult(true);
  };

  // 다음으로 진행
  const handleContinue = () => {
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);

    if (currentRound === 'river') {
      // 난이도 클리어
      recordGameResult(difficulty, true);
      updateStreak(true);
      setHasPlayerCardsRevealed(false); // 다음 난이도를 위해 리셋

      if (difficulty === 'god') {
        victory();
      } else {
        nextDifficulty();
      }
    } else {
      nextRound();
    }
  };

  // 재시작
  const handleRetry = () => {
    resetGame();
    initGame('easy');
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    setHasPlayerCardsRevealed(false);
  };

  // 홈으로
  const handleGoHome = () => {
    resetGame();
    router.push('/');
  };

  // 코멘트 작성
  const handleWriteComment = () => {
    router.push('/comments');
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleGoHome}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← 나가기
          </button>
          <DifficultyBadge difficulty={difficulty} />
          <DifficultyProgress currentDifficulty={difficulty} />
        </div>
      </header>

      {/* 게임 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {/* 컴퓨터 영역 */}
        <PlayerArea
          cards={computerHand}
          isComputer
          label="컴퓨터"
          handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
          isActive={status === 'answering'}
        />

        {/* 테이블 */}
        <Table
          communityCards={communityCards}
          className="w-full max-w-2xl"
          isRevealing={isRevealingCards}
          newCardsCount={newCardsCount}
        />

        {/* 플레이어 영역 */}
        <PlayerArea
          cards={playerHand}
          label="나"
          handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
          winRate={showResult && currentWinRate ? currentWinRate.playerWinRate : undefined}
          isActive={status === 'answering'}
          isRevealing={isRevealingPlayerCards}
          hasRevealed={hasPlayerCardsRevealed}
        />

        {/* 입력/결과 영역 */}
        <div className="w-full max-w-md">
          {/* 타이머 */}
          {status === 'answering' && (
            <div className="mb-4">
              <TimerBar
                seconds={timeRemaining}
                maxSeconds={getTimeLimit()}
                isRunning={isTimerRunning}
                onTick={decrementTimer}
                onTimeout={handleTimeout}
              />
            </div>
          )}

          {/* 카드 공개 애니메이션 중 */}
          {(isRevealingCards || isRevealingPlayerCards) && (
            <div className="text-center text-amber-400">
              <div className="text-4xl mb-2 animate-bounce">🃏</div>
              <p className="text-lg font-semibold">카드 공개 중...</p>
            </div>
          )}

          {/* 계산 중 */}
          {isCalculating && !isRevealingCards && !isRevealingPlayerCards && (
            <div className="text-center text-slate-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2" />
              <p>승률 계산 중...</p>
            </div>
          )}

          {/* 답변 입력 */}
          {status === 'answering' && !isCalculating && !showResult && (
            <AnswerInput
              difficulty={difficulty}
              currentRound={currentRound}
              onSubmit={handleSubmitAnswer}
              disabled={!isTimerRunning}
            />
          )}

          {/* 결과 표시 */}
          {showResult && lastAnswer && currentWinRate && (
            <div className="space-y-4">
              <ResultDisplay
                winRateResult={currentWinRate}
                answerResult={lastAnswer}
              />
              {lastAnswer.isCorrect && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleContinue}
                  className="w-full"
                >
                  {currentRound === 'river' ? '다음 난이도' : '다음 라운드'} →
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 게임오버 다이얼로그 */}
      <GameOverDialog
        isOpen={status === 'gameover'}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
        difficulty={difficulty}
        winRateResult={currentWinRate}
        message={useGameStore.getState().finalMessage}
      />

      {/* 승리 다이얼로그 */}
      <VictoryDialog
        isOpen={status === 'victory'}
        onGoHome={handleGoHome}
        onWriteComment={handleWriteComment}
      />
    </div>
  );
}
