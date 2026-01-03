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
import { evaluateStartingHand, compareStartingHands } from '@/lib/poker/starting-hands';
import { recordGameResult, updateStreak, addHandToHistory } from '@/lib/storage';
import { DIFFICULTY_CONFIG, WinRateResult, AnswerResult, GameRound } from '@/types';
import { cn } from '@/lib/utils';

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

  // 게임 초기화
  useEffect(() => {
    if (!gameId || gameId !== uuid) {
      initGame('easy');
    }
  }, [uuid, gameId, initGame]);

  // 라운드 시작 시 승률 계산
  useEffect(() => {
    if (status === 'playing' && playerHand && computerHand) {
      if (currentRound === 'preflop') {
        // 프리플랍: 핸드랭킹 비교
        if (shouldSkipPreflop()) {
          // 같은 핸드면 플랍으로 스킵
          nextRound();
        } else {
          startRound();
        }
      } else if (currentRound === 'river') {
        // 리버: 결과 확인만
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          handleRiverResult(result);
        });
      } else {
        // 플랍/턴: 승률 계산
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          startRound();
        });
      }
    }
  }, [status, currentRound, playerHand, computerHand, communityCards]);

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
      // 프리플랍: 핸드랭킹 비교
      const comparison = compareStartingHands(playerHand, computerHand);
      const playerFavorite = comparison <= 0;

      if (answer === 'player') {
        isCorrect = playerFavorite;
      } else {
        isCorrect = !playerFavorite;
      }

      // 프리플랍 승률 계산 (결과 표시용)
      calculate(playerHand, computerHand, []).then(result => {
        setCurrentWinRate(result);
        processAnswerResult(isCorrect, answer, result);
      });
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
        <Table communityCards={communityCards} className="w-full max-w-2xl" />

        {/* 플레이어 영역 */}
        <PlayerArea
          cards={playerHand}
          label="나"
          handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
          winRate={showResult && currentWinRate ? currentWinRate.playerWinRate : undefined}
          isActive={status === 'answering'}
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

          {/* 계산 중 */}
          {isCalculating && (
            <div className="text-center text-slate-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2" />
              <p>승률 계산 중...</p>
            </div>
          )}

          {/* 답변 입력 */}
          {status === 'answering' && !isCalculating && !showResult && (
            <AnswerInput
              difficulty={difficulty}
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
