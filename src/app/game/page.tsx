'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGameStore } from '@/stores/gameStore';
import { usePokerCalculator } from '@/hooks/usePokerCalculator';
import { Timer, AudioToggle, LanguageSelector } from '@/components/ui';
import {
  Card,
  Table,
  PlayerArea,
  AnswerInput,
  ResultDialog,
  GameOverDialog,
  VictoryDialog,
  GameProgressCompact,
  DevAnswerOverlay,
  LevelStartOverlay,
} from '@/components/game';
import { checkAnswer } from '@/lib/poker/calculator';
import { evaluateStartingHand, compareStartingHands, StartingHandInfo } from '@/lib/poker/starting-hands';
import { recordGameResult, updateStreak } from '@/lib/storage';
import { useBGM, useSFX } from '@/lib/audio';
import { useTranslation } from '@/lib/i18n';
import { DIFFICULTY_CONFIG, WinRateResult, AnswerResult, GameRound } from '@/types';
import { cn } from '@/lib/utils';

const CARD_REVEAL_DURATION = 2000;

export default function GamePage() {
  const router = useRouter();
  const { t } = useTranslation();

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

  const { calculate, isCalculating, calculateWithDetails, isCalculatingDetails, detailsResult, clearDetailsResult } = usePokerCalculator();
  const { playSFX } = useSFX();
  const [currentWinRate, setCurrentWinRate] = useState<WinRateResult | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Play game BGM
  useBGM('game');

  const [isRevealingCards, setIsRevealingCards] = useState(false);
  const [isRevealingPlayerCards, setIsRevealingPlayerCards] = useState(false);
  const [newCardsCount, setNewCardsCount] = useState(0);
  const [hasPlayerCardsRevealed, setHasPlayerCardsRevealed] = useState(false);
  const [showLevelOverlay, setShowLevelOverlay] = useState(true);
  const [isViewingRiver, setIsViewingRiver] = useState(false);
  const [isAnswerPanelOpen, setIsAnswerPanelOpen] = useState(false);

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!gameId) {
      initGame('easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === 'playing' && playerHand && computerHand && !showLevelOverlay) {
      if (currentRound === 'preflop') {
        if (shouldSkipPreflop()) {
          setHasPlayerCardsRevealed(true);
          nextRound();
        } else {
          setIsRevealingPlayerCards(true);
          playSFX('card-deal');
          setTimeout(() => {
            setIsRevealingPlayerCards(false);
            setHasPlayerCardsRevealed(true);
            hasSubmittedRef.current = false;
            playSFX('round-start');
            startRound();
          }, CARD_REVEAL_DURATION);
        }
      } else if (currentRound === 'river') {
        setIsRevealingCards(true);
        setNewCardsCount(1);
        playSFX('card-flip');
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
        playSFX('card-deal');
        calculate(playerHand, computerHand, communityCards)
          .then(result => {
            console.log('Flop calculation result:', result);
            setCurrentWinRate(result);
            setTimeout(() => {
              setIsRevealingCards(false);
              setNewCardsCount(0);
              hasSubmittedRef.current = false;
              console.log('Flop: calling startRound');
              playSFX('round-start');
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
        playSFX('card-flip');
        calculate(playerHand, computerHand, communityCards)
          .then(result => {
            setCurrentWinRate(result);
            setTimeout(() => {
              setIsRevealingCards(false);
              setNewCardsCount(0);
              hasSubmittedRef.current = false;
              playSFX('round-start');
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
  }, [status, currentRound, communityCards.length, showLevelOverlay]);

  // Auto-open answer panel when entering answering state
  useEffect(() => {
    if (status === 'answering' && !isCalculating && !showResult) {
      setIsAnswerPanelOpen(true);
    }
  }, [status, isCalculating, showResult]);

  const handleTimeout = useCallback(() => {
    if (hasSubmittedRef.current) return;
    stopTimer();
    playSFX('game-over');
    gameOver('Time Out!');
    recordGameResult(difficulty, false);
    updateStreak(false);
  }, [stopTimer, gameOver, difficulty, playSFX]);

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

    if (isCorrect) {
      playSFX('correct');
    } else {
      playSFX('wrong');
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

    if (isCorrect) {
      playSFX('correct');
    } else {
      playSFX('wrong');
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
    setIsViewingRiver(false);
    clearDetailsResult();

    if (currentRound === 'river' || currentRound === 'turn') {
      recordGameResult(difficulty, true);
      updateStreak(true);
      setHasPlayerCardsRevealed(false);

      if (difficulty === 'god') {
        playSFX('victory');
        victory();
      } else {
        playSFX('level-up');
        setShowLevelOverlay(true);
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
    setIsViewingRiver(true);
    clearDetailsResult();
    nextRound();
  };

  const handleRetry = () => {
    resetGame();
    initGame('easy');
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    setHasPlayerCardsRevealed(false);
    setShowLevelOverlay(true);
    clearDetailsResult();
  };

  const handleLevelOverlayComplete = useCallback(() => {
    setShowLevelOverlay(false);
  }, []);

  const handleGoHome = () => {
    resetGame();
    router.push('/');
  };

  const handleRequestDetails = useCallback(() => {
    if (!playerHand || !computerHand) return;
    calculateWithDetails(playerHand, computerHand, communityCards);
  }, [playerHand, computerHand, communityCards, calculateWithDetails]);

  const handleWriteComment = () => {
    router.push('/comments');
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="h-screen bg-[#0a0e1a] overflow-hidden flex flex-col">
      {/* Header - Full width */}
      <header className="p-2 sm:p-3 border-b border-white/5 glass shrink-0">
        <div className="max-w-[1280px] mx-auto flex justify-between items-center">
          <button
            onClick={handleGoHome}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-1 sm:gap-2"
            aria-label="Exit game"
          >
            {/* Mobile: Symbol Image */}
            <div className="relative w-7 h-7 sm:hidden">
              <Image
                src="/symbol.png"
                alt="Home"
                fill
                className="object-contain"
              />
            </div>
            {/* Desktop: Arrow Icon */}
            <svg className="w-5 h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">{t.common.exit}</span>
          </button>
          <GameProgressCompact difficulty={difficulty} currentRound={currentRound} />
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSelector />
            <AudioToggle />
          </div>
        </div>
      </header>

      {/* Content Container - max 1280px centered */}
      <div className="flex-1 max-w-[1280px] w-full mx-auto min-h-0">
        {/* Game Area - Desktop: 8:4 split layout */}
        <main className="h-full flex flex-col lg:flex-row p-2 sm:p-3 lg:p-4 gap-4">
        {/* Left Side - Game Board (8/12 on desktop) */}
        <div className="flex-1 lg:w-2/3 flex flex-col items-center justify-between min-h-0">
          {/* Round Info with Timer */}
          <div className="text-center shrink-0 flex items-center justify-center gap-2 sm:gap-4">
            <span className="badge badge-outline text-[10px] sm:text-xs lg:text-sm">{t.difficulty[difficulty]}</span>
            <h2 className="text-lg sm:text-2xl lg:text-4xl font-black text-white">
              {t.game.rounds[currentRound]}
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
            label={t.game.labels.dealer}
            handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
            handRank={showResult && currentRound === 'preflop' && computerHand ? evaluateStartingHand(computerHand).rank : undefined}
            isActive={status === 'answering'}
            compact
            showCards
            className="lg:scale-125 lg:origin-center"
          />

          {/* Table */}
          <Table
            communityCards={communityCards}
            className="w-full max-w-xl lg:max-w-2xl lg:scale-125 lg:origin-center"
            isRevealing={isRevealingCards}
            newCardsCount={newCardsCount}
            compact
          />

          {/* Player Area */}
          <PlayerArea
            cards={playerHand}
            label={t.game.labels.you}
            handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
            winRate={showResult && currentRound !== 'preflop' && currentWinRate ? currentWinRate.playerWinRate : undefined}
            handRank={showResult && currentRound === 'preflop' && playerHand ? evaluateStartingHand(playerHand).rank : undefined}
            isActive={status === 'answering'}
            isRevealing={isRevealingPlayerCards}
            hasRevealed={hasPlayerCardsRevealed}
            compact
            className="lg:scale-125 lg:origin-center"
          />

          {/* Mobile Only: Input/Result Area */}
          <div className="w-full max-w-md shrink-0 lg:hidden">
            {/* Card Reveal Animation */}
            {(isRevealingCards || isRevealingPlayerCards) && (
              <div className="text-center">
                <div className="text-2xl sm:text-4xl mb-1 sm:mb-2 animate-bounce">🃏</div>
                <p className="text-[#00d4ff] text-xs sm:text-sm font-semibold animate-pulse">
                  {t.game.messages.revealingCards}
                </p>
              </div>
            )}

            {/* Calculating */}
            {isCalculating && !isRevealingCards && !isRevealingPlayerCards && (
              <div className="text-center">
                <div className="animate-spin inline-block w-5 h-5 sm:w-6 sm:h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full mb-1 sm:mb-2" />
                <p className="text-[#64748b] text-xs sm:text-sm">{t.game.messages.calculatingWinRate}</p>
              </div>
            )}

            {/* Answer Input - Mobile Toggle */}
            {status === 'answering' && !isCalculating && !showResult && (
              <div className="relative">
                {/* Mobile Toggle Button */}
                <button
                  onClick={() => setIsAnswerPanelOpen(!isAnswerPanelOpen)}
                  className={cn(
                    'sm:hidden w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300',
                    'border backdrop-blur-sm',
                    isAnswerPanelOpen
                      ? 'bg-[#1a1f35]/50 border-[#00d4ff]/30 text-[#00d4ff]'
                      : 'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] border-transparent text-white animate-pulse'
                  )}
                >
                  {/* Eye Icon */}
                  {isAnswerPanelOpen ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  <span className="text-sm font-semibold">
                    {isAnswerPanelOpen ? t.game.actions.hideAnswer : t.game.actions.showAnswer}
                  </span>
                </button>

                {/* Answer Panel - Tablet (Always Visible) */}
                <div className="hidden sm:block lg:hidden">
                  <AnswerInput
                    difficulty={difficulty}
                    currentRound={currentRound}
                    onSubmit={handleSubmitAnswer}
                    disabled={!isTimerRunning}
                  />
                </div>
              </div>
            )}

            {/* Waiting for result */}
            {!showResult && status === 'playing' && !isRevealingCards && !isRevealingPlayerCards && !isCalculating && (
              <div className="text-center text-[#64748b] text-xs sm:text-sm">
                {t.game.messages.preparingNextRound}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Answer Panel (4/12 on desktop) */}
        <div className="hidden lg:flex lg:w-1/3 lg:max-w-sm flex-col">
          <div className="flex-1 flex flex-col rounded-2xl bg-[#1a1f35]/50 border border-white/5 p-4">
            {/* Panel Header */}
            <div className="text-center mb-4 pb-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">{t.game.labels.yourAnswer}</h3>
              <p className="text-xs text-[#64748b] mt-1">{t.difficulty[difficulty]} • {t.game.rounds[currentRound]}</p>
            </div>

            {/* Panel Content */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Card Reveal Animation */}
              {(isRevealingCards || isRevealingPlayerCards) && (
                <div className="text-center">
                  <div className="text-5xl mb-3 animate-bounce">🃏</div>
                  <p className="text-[#00d4ff] text-base font-semibold animate-pulse">
                    {t.game.messages.revealingCards}
                  </p>
                </div>
              )}

              {/* Calculating */}
              {isCalculating && !isRevealingCards && !isRevealingPlayerCards && (
                <div className="text-center">
                  <div className="animate-spin inline-block w-8 h-8 border-3 border-[#00d4ff] border-t-transparent rounded-full mb-3" />
                  <p className="text-[#64748b] text-base">{t.game.messages.calculatingWinRate}</p>
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

              {/* Waiting for result */}
              {!showResult && status === 'playing' && !isRevealingCards && !isRevealingPlayerCards && !isCalculating && (
                <div className="text-center text-[#64748b] text-base">
                  {t.game.messages.preparingNextRound}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>{/* End of Content Container */}

      {/* Result Dialog */}
      {showResult && lastAnswer && currentWinRate && (
        <ResultDialog
          isOpen={showResult}
          winRateResult={currentWinRate}
          answerResult={lastAnswer}
          currentRound={currentRound}
          onContinue={handleContinue}
          onViewRiver={handleViewRiver}
          onRetry={handleRetry}
          onGoHome={handleGoHome}
          isViewingRiver={isViewingRiver}
          difficulty={difficulty}
          outcomes={detailsResult?.outcomes}
          isCalculatingDetails={isCalculatingDetails}
          onRequestDetails={handleRequestDetails}
          playerHand={playerHand as [import('@/types').Card, import('@/types').Card] | undefined}
          computerHand={computerHand as [import('@/types').Card, import('@/types').Card] | undefined}
          communityCards={communityCards}
          playerHandDistribution={detailsResult?.playerHandDistribution}
          computerHandDistribution={detailsResult?.computerHandDistribution}
          matchupBreakdowns={detailsResult?.matchupBreakdowns}
        />
      )}

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

      {/* Dev Answer Overlay - only visible in development */}
      <DevAnswerOverlay currentWinRate={currentWinRate} />

      {/* Level Start Overlay */}
      <LevelStartOverlay
        isVisible={showLevelOverlay}
        difficulty={difficulty}
        onComplete={handleLevelOverlayComplete}
      />

      {/* Mobile Answer Panel Popup */}
      {status === 'answering' && !isCalculating && !showResult && (
        <div
          className={cn(
            'sm:hidden fixed inset-0 z-50 transition-all duration-300',
            isAnswerPanelOpen ? 'pointer-events-auto' : 'pointer-events-none'
          )}
        >
          {/* Backdrop */}
          <div
            className={cn(
              'absolute inset-0 bg-black/30 transition-opacity duration-300',
              isAnswerPanelOpen ? 'opacity-100' : 'opacity-0'
            )}
            onClick={() => setIsAnswerPanelOpen(false)}
          />

          {/* Panel */}
          <div
            className={cn(
              'absolute bottom-0 left-0 right-0 p-3 pb-6 transition-transform duration-300 ease-out',
              'bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a] to-[#0a0e1a]/95',
              'border-t border-[#00d4ff]/20',
              'rounded-t-3xl shadow-[0_-10px_40px_rgba(0,212,255,0.15)]',
              isAnswerPanelOpen ? 'translate-y-0' : 'translate-y-full'
            )}
          >
            {/* Handle Bar */}
            <div className="flex justify-center mb-3">
              <div
                className="w-12 h-1 bg-[#64748b]/50 rounded-full cursor-pointer"
                onClick={() => setIsAnswerPanelOpen(false)}
              />
            </div>

            <AnswerInput
              difficulty={difficulty}
              currentRound={currentRound}
              onSubmit={(answer) => {
                handleSubmitAnswer(answer);
                setIsAnswerPanelOpen(false);
              }}
              disabled={!isTimerRunning}
            />
          </div>
        </div>
      )}
    </div>
  );
}
