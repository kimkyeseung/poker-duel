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
      const comparison = compareStartingHands(playerHand, computerHand);
      const playerFavorite = comparison <= 0;
      const isCorrect = answer === 'player' ? playerFavorite : !playerFavorite;

      calculate(playerHand, computerHand, []).then(result => {
        const answerResult: AnswerResult = {
          round: currentRound,
          playerAnswer: answer,
          correctAnswer: result.playerWinRate,
          isCorrect,
          winRateResult: result,
        };
        setCurrentWinRate(result);
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
      });
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
          <div className="text-amber-500 font-bold text-lg">📅 일일 챌린지</div>
          <div className="text-slate-400 text-sm">{todayString}</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        {status === 'waiting' && (
          // 시작 화면
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl">📅</div>
              <h1 className="text-2xl font-bold text-white">일일 챌린지</h1>
              <p className="text-slate-400">
                오늘의 도전! 모든 유저가 같은 문제를 풉니다.
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <p className="text-sm text-slate-300">
                5단계 난이도를 순서대로 클리어하세요.<br />
                한 번 도전하면 다시 도전할 수 없습니다!
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={startGame}
              className="w-full"
            >
              오늘의 챌린지 시작
            </Button>
          </div>
        )}

        {status === 'completed' && existingRecord && (
          // 이미 완료됨
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl">
                {existingRecord.isVictory ? '🏆' : '📅'}
              </div>
              <h1 className="text-2xl font-bold text-white">
                오늘의 챌린지 {existingRecord.isVictory ? '클리어!' : '완료'}
              </h1>
              <p className="text-slate-400">
                {existingRecord.isVictory
                  ? '축하합니다! 오늘의 챌린지를 클리어했습니다.'
                  : '내일 다시 도전해보세요!'}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-2">도달 난이도</div>
              <DifficultyBadge difficulty={existingRecord.difficulty} size="lg" />
            </div>

            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="w-full"
            >
              메인으로
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
              label="컴퓨터"
              handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
              isActive={status === 'answering'}
            />

            <Table communityCards={communityCards} className="w-full max-w-2xl" />

            <PlayerArea
              cards={playerHand}
              label="나"
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
                <div className="text-center text-slate-400">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mb-2" />
                  <p>승률 계산 중...</p>
                </div>
              )}

              {status === 'answering' && !isCalculating && !showResult && (
                <AnswerInput
                  difficulty={difficulty}
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
        message="일일 챌린지 실패! 내일 다시 도전하세요."
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
