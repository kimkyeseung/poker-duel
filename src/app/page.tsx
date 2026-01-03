'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui';
import { TutorialDialog } from '@/components/TutorialDialog';
import { getGameStats } from '@/lib/storage';
import { GameStats, initialGameStats } from '@/types';

export default function Home() {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);

  useEffect(() => {
    setStats(getGameStats());
  }, []);

  const handleStartGame = () => {
    const gameId = uuidv4();
    router.push(`/game/${gameId}`);
  };

  const handlePractice = () => {
    router.push('/practice');
  };

  const handleDailyChallenge = () => {
    router.push('/daily');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* 헤더 */}
      <header className="p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-amber-500 font-bold text-xl">🎴 Poker Duel</div>
          {stats && stats.totalGames > 0 && (
            <div className="text-slate-400 text-sm">
              승률: {((stats.totalWins / stats.totalGames) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          {/* 로고/타이틀 */}
          <div className="space-y-4">
            <div className="text-8xl">🃏</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Poker <span className="text-amber-500">Duel</span>
            </h1>
            <p className="text-slate-400 text-lg">
              홀덤 승률을 맞춰라!
            </p>
          </div>

          {/* 게임 설명 */}
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
            <p className="text-slate-300 text-sm leading-relaxed">
              컴퓨터와 1:1로 대결하여<br />
              각 라운드마다 정확한 승률을 맞추세요.<br />
              5단계 난이도를 모두 클리어하면 승리!
            </p>
          </div>

          {/* 버튼들 */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartGame}
              className="w-full text-lg py-6"
            >
              🎮 게임 시작
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handlePractice}
                className="w-full"
              >
                🎯 연습 모드
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleDailyChallenge}
                className="w-full"
              >
                📅 일일 챌린지
              </Button>
            </div>

            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowTutorial(true)}
              className="w-full"
            >
              📖 게임 방법
            </Button>
          </div>

          {/* 통계 요약 */}
          {stats && stats.totalGames > 0 && (
            <div className="bg-slate-800/30 rounded-xl p-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.totalGames}</div>
                <div className="text-xs text-slate-500">총 게임</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.totalWins}</div>
                <div className="text-xs text-slate-500">승리</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.maxStreak}</div>
                <div className="text-xs text-slate-500">최다 연승</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="p-4 text-center text-slate-600 text-sm">
        Texas Hold'em Probability Trainer
      </footer>

      {/* 튜토리얼 다이얼로그 */}
      <TutorialDialog
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
