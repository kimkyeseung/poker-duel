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
  OpponentProgress,
  ChipDisplay,
  RiverBetting,
} from '@/components/game';
import { checkAnswer } from '@/lib/poker/calculator';
import { calculateOdds, getBetOutcome, resolveBet } from '@/lib/game/chips';
import { evaluateStartingHand, compareStartingHands, StartingHandInfo } from '@/lib/poker/starting-hands';
import { recordGameResult, updateStreak, updateChipHighScoreIfNeeded } from '@/lib/storage';
import { useBGM, useSFX } from '@/lib/audio';
import { useTranslation } from '@/lib/i18n';
import { WinRateResult, AnswerResult } from '@/types';
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
    burnCards,
    timeRemaining,
    isTimerRunning,
    currentOpponentIndex,
    opponentsDefeated,
    chips,
    lastChipReward,
    initGame,
    startRound,
    decrementTimer,
    stopTimer,
    gameOver,
    nextRound,
    nextDifficulty,
    nextOpponent,
    defeatCurrentOpponent,
    victory,
    resetGame,
    getTimeLimit,
    shouldSkipPreflop,
    getCurrentOpponent,
    isLastOpponent,
    awardChipsForCorrectAnswer,
    addChips,
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
  const [showOpponentOverlay, setShowOpponentOverlay] = useState(false);
  const [isViewingRiver, setIsViewingRiver] = useState(false);
  const [isAnswerPanelOpen, setIsAnswerPanelOpen] = useState(false);
  const [showRiverBetting, setShowRiverBetting] = useState(false);
  // 배당률의 근거가 되는 승률. 리버 카드를 깔기 전(턴 시점)의 값이라
  // 아직 불확실하고, 그래서 배당률이 결과를 누설하지 않는다.
  const [bettingWinRate, setBettingWinRate] = useState<WinRateResult | null>(null);
  // 리버 카드 공개 후에 정산할 베팅. 배당률은 베팅하는 순간 확정된다.
  // 화면에 그리지 않고 리버 공개 타이머 안에서만 읽으므로, 렌더 타이밍에
  // 영향받지 않도록 state가 아닌 ref로 들고 있는다.
  const pendingBetRef = useRef<{ amount: number; odds: number } | null>(null);

  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!gameId) {
      initGame('easy');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 리버 카드가 공개된 뒤 베팅을 정산한다.
   *
   * 보드가 완성된 시점이라 result는 승/패/무승부가 확정된 값이다.
   * 배당률은 베팅하던 순간(턴 시점 승률)에 이미 고정됐으므로 여기서는
   * 적중 여부만 본다.
   */
  const resolveRiverBet = (result: WinRateResult) => {
    const bet = pendingBetRef.current;
    if (!bet) return;
    const { amount, odds } = bet;
    pendingBetRef.current = null;

    // 스플릿 팟은 판돈을 그대로 돌려준다 (원래는 패배로 처리해 전액 잃었다).
    const outcome = getBetOutcome(result.playerWinRate, result.computerWinRate);
    const delta = resolveBet(amount, odds, outcome);

    if (delta !== 0) addChips(delta);
    if (outcome !== 'push') playSFX(outcome === 'win' ? 'correct' : 'wrong');
  };

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
              // 보드가 다 깔렸으므로 여기서 승패가 확정된다. 베팅했다면 정산한다.
              resolveRiverBet(result);
              handleRiverResult(result);
            }, CARD_REVEAL_DURATION);
          })
          .catch(err => {
            console.error('River calculation error:', err);
            setIsRevealingCards(false);
            setNewCardsCount(0);
          });
      } else if (currentRound === 'flop') {
        setIsRevealingCards(true);
        setNewCardsCount(3);
        playSFX('card-deal');
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
    if (status === 'answering' && !isCalculating && !showResult && !showRiverBetting) {
      setIsAnswerPanelOpen(true);
    }
  }, [status, isCalculating, showResult, showRiverBetting]);

  // Handle opponent transition overlay
  useEffect(() => {
    if (showOpponentOverlay) {
      const timer = setTimeout(() => {
        setShowOpponentOverlay(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showOpponentOverlay]);

  const handleTimeout = useCallback(() => {
    if (hasSubmittedRef.current) return;
    stopTimer();
    playSFX('game-over');
    updateChipHighScoreIfNeeded(chips);
    gameOver('Time Out!');
    recordGameResult(difficulty, false);
    updateStreak(false);
  }, [stopTimer, gameOver, difficulty, playSFX, chips]);

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
      awardChipsForCorrectAnswer();
    } else {
      playSFX('wrong');
      updateChipHighScoreIfNeeded(chips);
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
      updateChipHighScoreIfNeeded(chips);
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

  const handleRiverBet = useCallback((betAmount: number) => {
    if (!bettingWinRate) return;
    setShowRiverBetting(false);

    // 배당률은 리버 카드를 보기 전 승률로 확정하고, 정산은 카드가 깔린 뒤에 한다.
    pendingBetRef.current = {
      amount: betAmount,
      odds: calculateOdds(bettingWinRate.playerWinRate),
    };
    nextRound();
  }, [bettingWinRate, nextRound]);

  const handleRiverSkip = useCallback(() => {
    setShowRiverBetting(false);
    pendingBetRef.current = null;
    nextRound();
  }, [nextRound]);

  const handleContinue = () => {
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    setIsViewingRiver(false);
    setBettingWinRate(null);
    pendingBetRef.current = null;
    clearDetailsResult();

    if (currentRound === 'river' || currentRound === 'turn') {
      // 현재 상대 패배 처리
      defeatCurrentOpponent();

      if (isLastOpponent()) {
        // 딜러(마지막 상대)를 이겼을 때 → 다음 난이도
        recordGameResult(difficulty, true);
        updateStreak(true);
        setHasPlayerCardsRevealed(false);

        if (difficulty === 'god') {
          playSFX('victory');
          updateChipHighScoreIfNeeded(chips);
          victory();
        } else {
          playSFX('level-up');
          setShowLevelOverlay(true);
          nextDifficulty();
        }
      } else {
        // 다음 상대로 전환
        playSFX('correct');
        setHasPlayerCardsRevealed(false);
        setShowOpponentOverlay(true);
        nextOpponent();
      }
    } else {
      nextRound();
    }
  };

  const handleViewRiver = () => {
    // 턴 시점 승률을 배당률 근거로 잡아둔다. 아래에서 currentWinRate를 비우므로
    // 비우기 전에 읽어야 한다.
    const turnWinRate = currentWinRate;

    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    setIsViewingRiver(true);
    clearDetailsResult();

    // 리버 카드를 깔기 전에 베팅을 받는다. 카드가 깔린 뒤에 물으면 승패가
    // 이미 확정돼 배당률이 1.05x(이김) 아니면 10.00x(짐) 둘 중 하나로만
    // 나오고, 그게 곧 정답 누설이자 절대 안 터지는 베팅이 된다.
    if (chips > 0 && turnWinRate) {
      setBettingWinRate(turnWinRate);
      setShowRiverBetting(true);
    } else {
      nextRound();
    }
  };

  const handleRetry = () => {
    resetGame();
    initGame('easy');
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);
    setHasPlayerCardsRevealed(false);
    setShowLevelOverlay(true);
    setShowRiverBetting(false);
    setBettingWinRate(null);
    pendingBetRef.current = null;
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
          <div className="flex flex-col items-center gap-1">
            <GameProgressCompact difficulty={difficulty} currentRound={currentRound} />
            <OpponentProgress
              currentOpponentIndex={currentOpponentIndex}
              opponentsDefeated={opponentsDefeated}
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <ChipDisplay chips={chips} lastReward={lastChipReward} size="sm" />
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
            {/* 리버 베팅 중에는 status가 아직 'answering'이지만 타이머는 멈춰 있다.
                멈춘 타이머를 띄워두면 시간 제한이 있는 것처럼 보이므로 감춘다. */}
            {status === 'answering' && !showRiverBetting && (
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
            label={getCurrentOpponent()?.label || t.game.labels.dealer}
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
            burnCards={burnCards}
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
            {status === 'answering' && !isCalculating && !showResult && !showRiverBetting && (
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
              {status === 'answering' && !isCalculating && !showResult && !showRiverBetting && (
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
          isLastOpponent={isLastOpponent()}
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

      {/* Opponent Transition Overlay */}
      {showOpponentOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
              Opponent Defeated!
            </h2>
            <p className="text-[#00d4ff] text-lg">
              Next: {getCurrentOpponent()?.label || 'Opponent'}
            </p>
          </div>
        </div>
      )}

      {/* River Betting Dialog */}
      {showRiverBetting && bettingWinRate && (
        // 데스크탑에서는 오른쪽(정답 패널 자리)에 붙이고 배경도 덜 어둡게 해서,
        // 베팅 판단의 근거인 보드와 양쪽 핸드가 가리지 않게 한다.
        <div className="fixed inset-0 z-50 flex items-center justify-center lg:justify-end bg-black/80 lg:bg-black/40 p-4 lg:pr-8">
          <div className="w-full max-w-md lg:max-w-sm animate-bounce-in">
            <RiverBetting
              chips={chips}
              playerWinRate={bettingWinRate.playerWinRate}
              onBet={handleRiverBet}
              onSkip={handleRiverSkip}
            />
          </div>
        </div>
      )}

      {/* Mobile Answer Panel Popup */}
      {status === 'answering' && !isCalculating && !showResult && !showRiverBetting && (
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
