'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TimerBar } from '@/components/ui';
import {
  Table,
  PlayerArea,
  AnswerInput,
  ResultDisplay,
  DifficultyBadge,
  DifficultyProgress,
  GameOverDialog,
  VictoryDialog,
} from '@/components/game';
import { usePokerCalculator } from '@/hooks/usePokerCalculator';
import { createDeck, seededShuffleDeck, getDailySeed } from '@/lib/poker';
import { evaluateStartingHand, compareStartingHands, isSameStrength } from '@/lib/poker/starting-hands';
import { checkAnswer } from '@/lib/poker/calculator';
import { getDailyChallengeRecord, saveDailyChallengeRecord } from '@/lib/storage';
import {
  Card as CardType,
  Difficulty,
  GameRound,
  WinRateResult,
  AnswerResult,
  DIFFICULTY_CONFIG,
  PREFLOP_TIME_LIMIT,
  DailyChallengeRecord,
} from '@/types';
import { cn } from '@/lib/utils';

// 오늘 날짜 문자열
function getTodayString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

export default function DailyChallengePage() {
  const router = useRouter();
  const { calculate, isCalculating } = usePokerCalculator();
  const todayString = getTodayString();

  // 게임 상태
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentRound, setCurrentRound] = useState<GameRound>('preflop');
  const [playerHand, setPlayerHand] = useState<[CardType, CardType] | null>(null);
  const [computerHand, setComputerHand] = useState<[CardType, CardType] | null>(null);
  const [communityCards, setCommunityCards] = useState<CardType[]>([]);
  const [deck, setDeck] = useState<CardType[]>([]);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);

  // UI 상태
  const [currentWinRate, setCurrentWinRate] = useState<WinRateResult | null>(null);
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'playing' | 'answering' | 'gameover' | 'victory' | 'completed'>('waiting');
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [existingRecord, setExistingRecord] = useState<DailyChallengeRecord | null>(null);

  // 이미 완료된 챌린지 확인
  useEffect(() => {
    const record = getDailyChallengeRecord(todayString);
    if (record) {
      setExistingRecord(record);
      setStatus('completed');
    }
  }, [todayString]);

  // 게임 시작
  const startGame = useCallback(() => {
    const seed = getDailySeed();
    const newDeck = seededShuffleDeck(createDeck(), seed);
    const newPlayerHand: [CardType, CardType] = [newDeck[0], newDeck[1]];
    const newComputerHand: [CardType, CardType] = [newDeck[2], newDeck[3]];

    setDeck(newDeck.slice(4));
    setPlayerHand(newPlayerHand);
    setComputerHand(newComputerHand);
    setCommunityCards([]);
    setCurrentRound('preflop');
    setDifficulty('easy');
    setAnswers([]);
    setCurrentWinRate(null);
    setLastAnswer(null);
    setShowResult(false);
    setStatus('playing');
  }, []);

  // 라운드 시작
  useEffect(() => {
    if (status === 'playing' && playerHand && computerHand) {
      if (currentRound === 'preflop') {
        if (isSameStrength(playerHand, computerHand)) {
          // 같은 핸드면 플랍으로 스킵
          handleNextRound();
        } else {
          setTimeRemaining(PREFLOP_TIME_LIMIT);
          setIsTimerRunning(true);
          setStatus('answering');
        }
      } else if (currentRound === 'river') {
        // 리버: 결과 확인
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          handleRiverComplete(result);
        });
      } else {
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);
          setTimeRemaining(DIFFICULTY_CONFIG[difficulty].timeLimit);
          setIsTimerRunning(true);
          setStatus('answering');
        });
      }
    }
  }, [status, currentRound, playerHand, computerHand, communityCards, difficulty]);

  // 타임아웃
  const handleTimeout = useCallback(() => {
    setIsTimerRunning(false);
    setStatus('gameover');

    saveDailyChallengeRecord({
      date: todayString,
      completed: true,
      difficulty,
      isVictory: false,
      answers,
    });
  }, [todayString, difficulty, answers]);

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string | number) => {
    if (!playerHand || !computerHand) return;

    setIsTimerRunning(false);

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

      const answerResult: AnswerResult = {
        round: currentRound,
        playerAnswer: answer,
        correctAnswer: correctAnswer,
        isCorrect,
        winRateResult: preflopResult,
      };

      setCurrentWinRate(preflopResult);
      setLastAnswer(answerResult);
      setAnswers(prev => [...prev, answerResult]);
      setShowResult(true);

      if (!isCorrect) {
        setStatus('gameover');
        saveDailyChallengeRecord({
          date: todayString,
          completed: true,
          difficulty,
          isVictory: false,
          answers: [...answers, answerResult],
        });
      }
    } else {
      if (!currentWinRate) return;

      const isCorrect = checkAnswer(difficulty, answer, currentWinRate);
      const answerResult: AnswerResult = {
        round: currentRound,
        playerAnswer: answer,
        correctAnswer: currentWinRate.playerWinRate,
        isCorrect,
        winRateResult: currentWinRate,
      };
      setLastAnswer(answerResult);
      setAnswers(prev => [...prev, answerResult]);
      setShowResult(true);

      if (!isCorrect) {
        setStatus('gameover');
        saveDailyChallengeRecord({
          date: todayString,
          completed: true,
          difficulty,
          isVictory: false,
          answers: [...answers, answerResult],
        });
      }
    }
  }, [playerHand, computerHand, currentRound, difficulty, currentWinRate, todayString, answers, calculate]);

  // 리버 완료
  const handleRiverComplete = (result: WinRateResult) => {
    setLastAnswer({
      round: 'river',
      playerAnswer: '',
      correctAnswer: result.playerWinRate,
      isCorrect: true,
      winRateResult: result,
    });
    setShowResult(true);
  };

  // 다음 라운드
  const handleNextRound = useCallback(() => {
    const roundOrder: GameRound[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = roundOrder.indexOf(currentRound);

    if (currentIndex < roundOrder.length - 1) {
      const nextRound = roundOrder[currentIndex + 1];

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
      setStatus('playing');
    }
  }, [currentRound, communityCards, deck]);

  // 다음 난이도
  const handleNextDifficulty = useCallback(() => {
    const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'god'];
    const currentIndex = difficulties.indexOf(difficulty);

    if (currentIndex < difficulties.length - 1) {
      // 다음 난이도로 새 게임
      const nextDifficulty = difficulties[currentIndex + 1];
      const seed = getDailySeed() + currentIndex + 1; // 난이도별 다른 시드
      const newDeck = seededShuffleDeck(createDeck(), seed);
      const newPlayerHand: [CardType, CardType] = [newDeck[0], newDeck[1]];
      const newComputerHand: [CardType, CardType] = [newDeck[2], newDeck[3]];

      setDeck(newDeck.slice(4));
      setPlayerHand(newPlayerHand);
      setComputerHand(newComputerHand);
      setCommunityCards([]);
      setCurrentRound('preflop');
      setDifficulty(nextDifficulty);
      setShowResult(false);
      setLastAnswer(null);
      setCurrentWinRate(null);
      setStatus('playing');
    } else {
      // 모든 난이도 클리어
      setStatus('victory');
      saveDailyChallengeRecord({
        date: todayString,
        completed: true,
        difficulty: 'god',
        isVictory: true,
        answers,
      });
    }
  }, [difficulty, todayString, answers]);

  // 다음으로 진행
  const handleContinue = () => {
    setShowResult(false);
    setLastAnswer(null);
    setCurrentWinRate(null);

    if (currentRound === 'river') {
      handleNextDifficulty();
    } else {
      handleNextRound();
    }
  };

  // 시간 제한 계산
  const getTimeLimit = () => {
    return currentRound === 'preflop' ? PREFLOP_TIME_LIMIT : DIFFICULTY_CONFIG[difficulty].timeLimit;
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-white/5 glass">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Exit</span>
          </button>
          <div className="text-[#ffd700] font-bold text-lg">DAILY CHALLENGE</div>
          <div className="text-[#64748b] text-sm">{todayString}</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {status === 'waiting' && (
          // 시작 화면
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl">
                <span className="inline-block bg-gradient-to-br from-[#ffd700] to-[#ffb800] text-transparent bg-clip-text font-black">D</span>
              </div>
              <h1 className="text-2xl font-black text-white">DAILY CHALLENGE</h1>
              <p className="text-[#64748b]">
                Today's challenge! Same puzzle for all players.
              </p>
            </div>

            <div className="game-card p-6">
              <p className="text-sm text-white/80">
                Clear all 5 difficulty levels in order.<br />
                You only get one attempt per day!
              </p>
            </div>

            <Button
              variant="gold"
              size="lg"
              onClick={startGame}
              fullWidth
            >
              START TODAY'S CHALLENGE
            </Button>
          </div>
        )}

        {status === 'completed' && existingRecord && (
          // 이미 완료됨
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl">
                {existingRecord.isVictory ? (
                  <span className="inline-block bg-gradient-to-br from-[#ffd700] to-[#ffb800] text-transparent bg-clip-text">W</span>
                ) : (
                  <span className="text-[#64748b]">D</span>
                )}
              </div>
              <h1 className="text-2xl font-black text-white">
                {existingRecord.isVictory ? 'CHALLENGE CLEARED!' : 'CHALLENGE COMPLETE'}
              </h1>
              <p className="text-[#64748b]">
                {existingRecord.isVictory
                  ? 'Congratulations! You cleared today\'s challenge.'
                  : 'Try again tomorrow!'}
              </p>
            </div>

            <div className="game-card p-6">
              <div className="text-sm text-[#64748b] mb-2">Reached Difficulty</div>
              <DifficultyBadge difficulty={existingRecord.difficulty} size="lg" />
            </div>

            <Button
              variant="secondary"
              onClick={() => router.push('/')}
              fullWidth
            >
              Back to Main
            </Button>
          </div>
        )}

        {(status === 'playing' || status === 'answering') && (
          // 게임 화면
          <>
            <div className="flex items-center gap-4">
              <DifficultyBadge difficulty={difficulty} />
              <DifficultyProgress currentDifficulty={difficulty} />
            </div>

            <PlayerArea
              cards={computerHand}
              isComputer
              label="DEALER"
              handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
              isActive={status === 'answering'}
            />

            <Table communityCards={communityCards} className="w-full max-w-2xl" />

            <PlayerArea
              cards={playerHand}
              label="YOU"
              handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
              winRate={showResult && currentWinRate ? currentWinRate.playerWinRate : undefined}
              isActive={status === 'answering'}
            />

            <div className="w-full max-w-md">
              {status === 'answering' && (
                <div className="mb-4">
                  <TimerBar
                    seconds={timeRemaining}
                    maxSeconds={getTimeLimit()}
                    isRunning={isTimerRunning}
                    onTick={() => setTimeRemaining(prev => prev - 1)}
                    onTimeout={handleTimeout}
                  />
                </div>
              )}

              {isCalculating && (
                <div className="text-center text-[#64748b]">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full mb-2" />
                  <p>Calculating win rate...</p>
                </div>
              )}

              {status === 'answering' && !isCalculating && !showResult && (
                <AnswerInput
                  difficulty={difficulty}
                  currentRound={currentRound}
                  onSubmit={handleSubmitAnswer}
                  disabled={!isTimerRunning}
                />
              )}

              {showResult && lastAnswer && currentWinRate && (
                <div className="space-y-4">
                  <ResultDisplay
                    winRateResult={currentWinRate}
                    answerResult={lastAnswer}
                  />
                  {lastAnswer.isCorrect && (
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handleContinue}
                      fullWidth
                    >
                      {currentRound === 'river' ? 'Next Level' : 'Next Round'} →
                    </Button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* 게임오버 */}
      <GameOverDialog
        isOpen={status === 'gameover'}
        onRetry={() => router.push('/')}
        onGoHome={() => router.push('/')}
        difficulty={difficulty}
        winRateResult={currentWinRate}
        message="Daily challenge failed! Try again tomorrow."
      />

      {/* 승리 */}
      <VictoryDialog
        isOpen={status === 'victory'}
        onGoHome={() => router.push('/')}
        onWriteComment={() => router.push('/comments')}
      />
    </div>
  );
}
