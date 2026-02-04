'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, AudioToggle, LanguageSelector } from '@/components/ui';
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
import { useAudio, useBGM, useSFX } from '@/lib/audio';
import { useTranslation } from '@/lib/i18n';
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
  const { initAudio } = useAudio();
  const { playSFX } = useSFX();
  const { t } = useTranslation();

  // Play game BGM for practice
  useBGM('game');

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
    initAudio();
    playSFX('card-deal');

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
  }, [initAudio, playSFX]);

  // 라운드 변경 시 승률 계산
  useEffect(() => {
    if (isPlaying && playerHand && computerHand && !showResult) {
      if (currentRound !== 'preflop') {
        calculate(playerHand, computerHand, communityCards).then(result => {
          setCurrentWinRate(result);

          // 리버에서는 자동으로 결과 표시 (입력 없이 결과만 확인)
          if (currentRound === 'river') {
            const playerWins = result.playerWinRate > result.computerWinRate;
            const isTie = result.playerWinRate === result.computerWinRate;
            setLastAnswer({
              round: 'river',
              playerAnswer: playerWins ? 'player' : 'computer',
              correctAnswer: playerWins ? 'player' : isTie ? 'tie' : 'computer',
              isCorrect: true, // 리버는 결과 확인만이므로 항상 정답 처리
              winRateResult: result,
            });
            setShowResult(true);
          }
        });
      }
    }
  }, [isPlaying, currentRound, playerHand, computerHand, communityCards, calculate, showResult]);

  // 정답 제출
  const handleSubmitAnswer = useCallback((answer: string | number) => {
    if (!playerHand || !computerHand) return;

    playSFX('submit');

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

      // Play correct/wrong SFX after a short delay
      setTimeout(() => {
        playSFX(isCorrect ? 'correct' : 'wrong');
      }, 100);
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

      // Play correct/wrong SFX after a short delay
      setTimeout(() => {
        playSFX(isCorrect ? 'correct' : 'wrong');
      }, 100);
    }
  }, [playerHand, computerHand, currentRound, difficulty, currentWinRate, playSFX]);

  // 다음 라운드
  const handleNextRound = useCallback(() => {
    const roundOrder: GameRound[] = ['preflop', 'flop', 'turn', 'river'];
    const currentIndex = roundOrder.indexOf(currentRound);

    if (currentIndex < roundOrder.length - 1) {
      const nextRound = roundOrder[currentIndex + 1];

      // 커뮤니티 카드 추가
      let newCommunityCards = [...communityCards];

      if (nextRound === 'flop') {
        playSFX('card-deal');
        newCommunityCards = [deck[1], deck[2], deck[3]];
        setDeck(deck.slice(4));
      } else if (nextRound === 'turn') {
        playSFX('card-flip');
        newCommunityCards = [...communityCards, deck[1]];
        setDeck(deck.slice(2));
      } else if (nextRound === 'river') {
        playSFX('card-flip');
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
  }, [currentRound, communityCards, deck, startNewGame, playSFX]);

  // 난이도 변경
  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    if (isPlaying) {
      startNewGame();
    }
  };

  return (
    <div className="h-screen bg-[#0a0e1a] flex flex-col overflow-hidden">
      {/* 헤더 */}
      <header className="p-3 border-b border-white/5 glass shrink-0">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>{t.common.exit}</span>
          </button>
          <div className="text-[#00d4ff] font-bold text-lg">{t.practice.title}</div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <AudioToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-between p-3 pb-4 min-h-0">
        {!isPlaying ? (
          // 시작 화면
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <div className="text-6xl">
                <span className="inline-block bg-gradient-to-br from-[#00d4ff] to-[#0066ff] text-transparent bg-clip-text">P</span>
              </div>
              <h1 className="text-2xl font-black text-white">{t.practice.title}</h1>
              <p className="text-[#64748b]">
                {t.practice.description}
              </p>
            </div>

            {/* 난이도 선택 */}
            <div className="game-card p-6">
              <div className="text-sm text-[#64748b] mb-3">{t.practice.selectDifficulty}</div>
              <div className="flex gap-2 justify-center">
                {PRACTICE_DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={cn(
                      'px-4 py-2 rounded-full font-semibold transition-all',
                      difficulty === d
                        ? 'bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                        : 'bg-[#1a1f35] text-[#64748b] hover:bg-[#1a1f35]/80'
                    )}
                  >
                    {t.difficulty[d]}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#475569] mt-3">
                {t.practice.modeRestriction}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={startNewGame}
              fullWidth
            >
              {t.practice.startPractice}
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
              label="DEALER"
              handName={computerHand ? evaluateStartingHand(computerHand).name : undefined}
              compact
              showCards
            />

            {/* 테이블 */}
            <Table communityCards={communityCards} className="w-full max-w-xl" compact />

            {/* 플레이어 영역 */}
            <PlayerArea
              cards={playerHand}
              label="YOU"
              handName={playerHand ? evaluateStartingHand(playerHand).name : undefined}
              winRate={showResult && currentWinRate && currentRound !== 'preflop' ? currentWinRate.playerWinRate : undefined}
              compact
            />

            {/* 입력/결과 영역 */}
            <div className="w-full max-w-md shrink-0">
              {/* 계산 중 */}
              {isCalculating && (
                <div className="text-center text-[#64748b]">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-[#00d4ff] border-t-transparent rounded-full mb-2" />
                  <p className="text-sm">{t.game.messages.calculatingWinRate}</p>
                </div>
              )}

              {/* 답변 입력 (리버에서는 입력 없이 자동으로 결과 표시) */}
              {!showResult && !isCalculating && currentRound !== 'river' && (
                <AnswerInput
                  difficulty={difficulty}
                  currentRound={currentRound}
                  onSubmit={handleSubmitAnswer}
                />
              )}

              {/* 결과 표시 */}
              {showResult && lastAnswer && currentWinRate && (
                <div className="space-y-3">
                  <ResultDisplay
                    winRateResult={currentWinRate}
                    answerResult={lastAnswer}
                    compact
                  />
                  <div className="flex gap-2">
                    {currentRound === 'river' ? (
                      // 리버에서는 New Game 버튼 하나만 표시
                      <Button
                        variant="primary"
                        onClick={startNewGame}
                        className="flex-1"
                      >
                        {t.game.actions.newGame}
                      </Button>
                    ) : (
                      // 다른 라운드에서는 New Game + Next Round
                      <>
                        <Button
                          variant="secondary"
                          onClick={startNewGame}
                          className="flex-1"
                        >
                          {t.game.actions.newGame}
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleNextRound}
                          className="flex-1"
                        >
                          {t.game.actions.nextRound}
                        </Button>
                      </>
                    )}
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
