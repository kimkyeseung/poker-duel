'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/stores/gameStore';
import { usePokerCalculator } from '@/hooks/usePokerCalculator';
import { Button, Timer, TimerBar } from '@/components/ui';
import {
  Card,
  Table,
  PlayerArea,
  AnswerInput,
  ResultDisplay,
  GameOverDialog,
  VictoryDialog,
  GameProgressCompact,
} from '@/components/game';
import { checkAnswer } from '@/lib/poker/calculator';
import { evaluateStartingHand, compareStartingHands, StartingHandInfo } from '@/lib/poker/starting-hands';
import { recordGameResult, updateStreak } from '@/lib/storage';
import { DIFFICULTY_CONFIG, WinRateResult, AnswerResult, GameRound } from '@/types';
import { cn } from '@/lib/utils';

const CARD_REVEAL_DURATION = 2000;

const ROUND_NAMES: Record<GameRound, string> = {
  preflop: 'PRE-FLOP',
  flop: 'THE FLOP',
  turn: 'THE TURN',
  river: 'THE RIVER',
};

export default function GamePage() {
  const router = useRouter();

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

  const [isRevealingCards, setIsRevealingCards] = useState(false);
  const [isRevealingPlayerCards, setIsRevealingPlayerCards] = useState(false);
  const [newCardsCount, setNewCardsCount] = useState(0);
  const [hasPlayerCardsRevealed, setHasPlayerCardsRevealed] = useState(false);

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!gameId) {
      initGame('easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'playing' && playerHand && computerHand) {
      if (currentRound === 'preflop') {
        if (shouldSkipPreflop()) {
          setHasPlayerCardsRevealed(true);
          nextRound();
        } else {
          setIsRevealingPlayerCards(true);
          setTimeout(() => {
            setIsRevealingPlayerCards(false);
            setHasPlayerCardsRevealed(true);
            hasSubmittedRef.current = false;
            startRound();
          }, CARD_REVEAL_DURATION);
        }
      } else if (currentRound === 'river') {
        setIsRevealingCards(true);
        setNewCardsCount(1);
        calculate(playerHand, computerHand, communityCards)
          .then(result => {
            setCurrentWinRate(result);
            setTimeout(() => {
              setIsRevealingCards(false);
              setNewCardsCount(0);
              handleRiverResult(result);
            }, CARD_REVEAL_DURATION);
          })
          .catch(err => {
            console.error('River calculation error:', err);
            setIsRevealingCards(false);
            setNewCardsCount(0);
          });
      } else if (currentRound === 'flop') {
        console.log('Flop started, communityCards:', communityCards);
        setIsRevealingCards(true);
        setNewCardsCount(3);
        calculate(playerHand, computerHand, communityCards)
          .then(result => {
            console.log('Flop calculation result:', result);
            setCurrentWinRate(result);
            setTimeout(() => {
              setIsRevealingCards(false);
              setNewCardsCount(0);
              hasSubmittedRef.current = false;
              console.log('Flop: calling startRound');
              startRound();
            }, CARD_REVEAL_DURATION);
          })
          .catch(err => {
            console.error('Flop calculation error:', err);
            setIsRevealingCards(false);
            setNewCardsCount(0);
            hasSubmittedRef.current = false;
            startRound();
          });
      } else if (currentRound === 'turn') {
        setIsRevealingCards(true);
        setNewCardsCount(1);
        calculate(playerHand, computerHand, communityCards)
          .then(result => {
            setCurrentWinRate(result);
            setTimeout(() => {
              setIsRevealingCards(false);
              setNewCardsCount(0);
              hasSubmittedRef.current = false;
              startRound();
            }, CARD_REVEAL_DURATION);
          })
          .catch(err => {
            console.error('Turn calculation error:', err);
            setIsRevealingCards(false);
            setNewCardsCount(0);
            hasSubmittedRef.current = false;
            startRound();
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentRound, communityCards.length]);

  const handleTimeout = useCallback(() => {
    if (hasSubmittedRef.current) return;
    stopTimer();
    gameOver('Time Out!');
    recordGameResult(difficulty, false);
    updateStreak(false);
  }, [stopTimer, gameOver, difficulty]);

  const handleSubmitAnswer = useCallback((answer: string | number) => {
    if (!playerHand || !computerHand) return;
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    stopTimer();

    let isCorrect = false;
    let actualWinRate = currentWinRate;

    if (currentRound === 'preflop') {
      const comparison = compareStartingHands(playerHand, computerHand);
      const playerFavorite = comparison <= 0;
      isCorrect = answer === 'player' ? playerFavorite : !playerFavorite;

      const playerInfo = evaluateStartingHand(playerHand);
      const computerInfo = evaluateStartingHand(computerHand);

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
  }, [playerHand, computerHand, currentRound, difficulty, currentWinRate, stopTimer]);

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
      gameOver('Wrong Answer!');
      recordGameResult(difficulty, false);
      updateStreak(false);
    }
  };

  const processPreflopResult = (
    isCorrect: boolean,
    answer: string | number,
    playerInfo: StartingHandInfo,
    computerInfo: StartingHandInfo
  ) => {
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
      playerHandRank: { name: playerInfo.name, rank: playerInfo.rank },
      computerHandRank: { name: computerInfo.name, rank: computerInfo.rank },
    };
    setLastAnswer(result);
    setShowResult(true);

    if (!isCorrect) {
      gameOver('Wrong Answer!');
      recordGameResult(difficulty, false);
      updateStreak(false);
    }
  };

  const handleRiverResult = (result: WinRateResult) => {
    setLastAnswer({
      round: 'river',
      playerAnswer: '',
      correctAnswer: result.playerWinRate,
      isCorrect: true,
      winRateResult: result,
    });
    setShowResult(true);
  };

  const handleContinue = () => {
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);

    if (currentRound === 'river' || currentRound === 'turn') {
      recordGameResult(difficulty, true);
      updateStreak(true);
      setHasPlayerCardsRevealed(false);

      if (difficulty === 'god') {
        victory();
      } else {
        nextDifficulty();
      }
    } else {
      nextRound();
    }
  };

  const handleViewRiver = () => {
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    nextRound();
  };

  const handleRetry = () => {
    resetGame();
    initGame('easy');
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    setHasPlayerCardsRevealed(false);
  };

  const handleGoHome = () => {
    resetGame();
    router.push('/');
  };

  const handleWriteComment = () => {
    router.push('/comments');
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="h-screen bg-[#0a0e1a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-3 border-b border-white/5 glass shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={handleGoHome}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-2"
            aria-label="Exit game"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Exit</span>
          </button>
          <GameProgressCompact difficulty={difficulty} currentRound={currentRound} />
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-between p-3 pb-4 min-h-0">
        {/* Round Info with Timer */}
        <div className="text-center shrink-0 flex items-center justify-center gap-4">
          <span className="badge badge-outline">{config.name}</span>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {ROUND_NAMES[currentRound]}
          </h2>
          {status === 'answering' && (
            <Timer
              seconds={Math.ceil(timeRemaining)}
              maxSeconds={getTimeLimit()}
              isRunning={isTimerRunning}
              onTick={decrementTimer}
              onTimeout={handleTimeout}
              compact
            />
          )}
        </div>

        {/* Computer Area */}
        <PlayerArea
          cards={computerHand}
          isComputer
          label="DEALER"
          handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
          handRank={showResult && currentRound === 'preflop' && computerHand ? evaluateStartingHand(computerHand).rank : undefined}
          isActive={status === 'answering'}
          compact
          showCards
        />

        {/* Table */}
        <Table
          communityCards={communityCards}
          className="w-full max-w-xl"
          isRevealing={isRevealingCards}
          newCardsCount={newCardsCount}
          compact
        />

        {/* Player Area */}
        <PlayerArea
          cards={playerHand}
          label="YOU"
          handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
          winRate={showResult && currentRound !== 'preflop' && currentWinRate ? currentWinRate.playerWinRate : undefined}
          handRank={showResult && currentRound === 'preflop' && playerHand ? evaluateStartingHand(playerHand).rank : undefined}
          isActive={status === 'answering'}
          isRevealing={isRevealingPlayerCards}
          hasRevealed={hasPlayerCardsRevealed}
          compact
        />

        {/* Input/Result Area */}
        <div className="w-full max-w-md shrink-0">
          {/* Card Reveal Animation */}
          {(isRevealingCards || isRevealingPlayerCards) && (
            <div className="text-center">
              <div className="text-4xl mb-2 animate-bounce">🃏</div>
              <p className="text-[#00d4ff] text-sm font-semibold animate-pulse">
                Revealing cards...
              </p>
            </div>
          )}

          {/* Calculating */}
          {isCalculating && !isRevealingCards && !isRevealingPlayerCards && (
            <div className="text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full mb-2" />
              <p className="text-[#64748b] text-sm">Calculating win rate...</p>
            </div>
          )}

          {/* Answer Input */}
          {status === 'answering' && !isCalculating && !showResult && (
            <AnswerInput
              difficulty={difficulty}
              currentRound={currentRound}
              onSubmit={handleSubmitAnswer}
              disabled={!isTimerRunning}
            />
          )}

          {/* Result Display */}
          {showResult && lastAnswer && currentWinRate && (
            <div className="space-y-3">
              <ResultDisplay
                winRateResult={currentWinRate}
                answerResult={lastAnswer}
                isRiverConfirmation={currentRound === 'river'}
                compact
              />
              {lastAnswer.isCorrect && currentRound === 'turn' ? (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleViewRiver}
                    fullWidth
                  >
                    View River
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleContinue}
                    fullWidth
                  >
                    Next Level →
                  </Button>
                </div>
              ) : lastAnswer.isCorrect || currentRound === 'river' ? (
                <Button
                  variant="success"
                  onClick={handleContinue}
                  fullWidth
                >
                  {currentRound === 'river' ? 'Next Level' : 'Next Round'} →
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* Game Over Dialog */}
      <GameOverDialog
        isOpen={status === 'gameover'}
        onRetry={handleRetry}
        onGoHome={handleGoHome}
        difficulty={difficulty}
        winRateResult={currentWinRate}
        message={useGameStore.getState().finalMessage}
      />

      {/* Victory Dialog */}
      <VictoryDialog
        isOpen={status === 'victory'}
        onGoHome={handleGoHome}
        onWriteComment={handleWriteComment}
      />
    </div>
  );
}
