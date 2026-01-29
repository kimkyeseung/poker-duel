'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, AudioToggle, ClickToStart } from '@/components/ui';
import { TutorialDialog } from '@/components/TutorialDialog';
import { getGameStats } from '@/lib/storage';
import { getCurrentTitle } from '@/lib/game/titles';
import { useGameStore } from '@/stores/gameStore';
import { useAudio } from '@/lib/audio';
import { GameStats } from '@/types';

// 마스코트 메시지 생성 함수
function getMascotMessage(stats: GameStats | null): { message: string; type: string } {
  const messages: { message: string; type: string }[] = [];

  // 1. 데일리 팁/힌트
  const tips = [
    { message: "포켓 에이스(AA)는\n169개 핸드 중 1위예요!", type: "tip" },
    { message: "suited 핸드는 offsuit보다\n약 3% 더 유리해요", type: "tip" },
    { message: "포지션이 늦을수록 더 많은\n핸드를 플레이할 수 있어요", type: "tip" },
    { message: "플랍에서 페어가 될 확률은\n약 32%예요", type: "tip" },
    { message: "포켓 페어로 셋이 될 확률은\n약 12%예요", type: "tip" },
    { message: "AKs vs QQ는\n거의 동전 던지기예요!", type: "tip" },
  ];
  messages.push(tips[Math.floor(Math.random() * tips.length)]);

  // 2. 동적 상태 메시지 (유저 상황 기반)
  if (stats) {
    if (stats.currentStreak >= 5) {
      messages.push({ message: `${stats.currentStreak}연승 중! 대단해요! 🔥`, type: "status" });
    } else if (stats.currentStreak >= 3) {
      messages.push({ message: `${stats.currentStreak}연승! 오늘 운이 좋네요!`, type: "status" });
    }

    if (stats.totalWins > 0 && stats.totalWins % 10 === 0) {
      messages.push({ message: `${stats.totalWins}승 달성! 축하해요! 🎉`, type: "status" });
    }

    if (stats.totalGames > 0 && stats.totalGames === stats.totalLosses) {
      messages.push({ message: "연습 모드에서 감을 익혀보는 건 어때요?", type: "status" });
    }

    const winRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;
    if (winRate >= 70 && stats.totalGames >= 10) {
      messages.push({ message: `승률 ${winRate.toFixed(0)}%! 프로 수준이네요! 👑`, type: "status" });
    }
  }

  // 3. 이벤트/공지 알림
  const events = [
    { message: "일일 챌린지에서 모든 유저가\n같은 문제를 풀어요!", type: "event" },
    { message: "연습 모드에서\n시간 제한 없이 연습해보세요!", type: "event" },
    { message: "5단계 난이도를 모두 클리어하면\n명예의 전당에 등록!", type: "event" },
  ];
  messages.push(events[Math.floor(Math.random() * events.length)]);

  // 4. 개인화된 도전 제안
  if (stats) {
    if (stats.totalGames === 0) {
      messages.push({ message: "첫 게임을\n시작해볼까요? 🎮", type: "challenge" });
    } else if (stats.maxStreak < 3) {
      messages.push({ message: "3연승에\n도전해보세요!", type: "challenge" });
    } else if (stats.maxStreak < 5) {
      messages.push({ message: "5연승 달성이\n목표예요!", type: "challenge" });
    } else {
      messages.push({ message: "홀덤의 신에 도전해볼\n준비 됐나요? 👑", type: "challenge" });
    }
  }

  // 5. 오늘의 럭키 카드
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const luckyRank = ranks[seed % ranks.length];
  const luckySuit = suits[seed % suits.length];
  const isRed = luckySuit === '♥' || luckySuit === '♦';
  messages.push({
    message: `오늘의 럭키 카드: ${isRed ? '🔴' : '⚫'} ${luckySuit}${luckyRank}`,
    type: "lucky"
  });

  // 랜덤으로 하나 선택
  return messages[Math.floor(Math.random() * messages.length)];
}

export default function Home() {
  const router = useRouter();
  const [showTutorial, setShowTutorial] = useState(false);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [isStarted, setIsStarted] = useState(false);

  const { resetGame } = useGameStore();
  const { initAudio, playSFX, playBGM } = useAudio();

  // Play BGM after user has started
  const handleStart = useCallback(() => {
    setIsStarted(true);
    playBGM('home');
  }, [playBGM]);

  useEffect(() => {
    setStats(getGameStats());
  }, []);

  // Handle click with SFX
  const handleButtonClick = useCallback((callback: () => void) => {
    initAudio();
    playSFX('button-click');
    callback();
  }, [initAudio, playSFX]);

  const handleStartGame = () => {
    initAudio();
    playSFX('button-click');
    resetGame();
    router.push('/game');
  };

  const handlePractice = () => {
    initAudio();
    playSFX('button-click');
    router.push('/practice');
  };

  const handleDailyChallenge = () => {
    initAudio();
    playSFX('button-click');
    router.push('/daily');
  };

  const currentTitle = stats ? getCurrentTitle(stats) : null;
  const winRate = stats && stats.totalGames > 0
    ? Math.round((stats.totalWins / stats.totalGames) * 100)
    : 0;

  // 마스코트 메시지 (클라이언트에서만 랜덤 선택 - hydration 에러 방지)
  const [mascotMessage, setMascotMessage] = useState<{ message: string; type: string }>({
    message: "포켓 에이스(AA)는\n169개 핸드 중 1위예요!",
    type: "tip"
  });

  useEffect(() => {
    setMascotMessage(getMascotMessage(stats));
  }, [stats]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'radial-gradient(circle at top center, #1a0b2e 0%, #0a0a1a 100%)' }}>
      {/* Click to Start Overlay */}
      <ClickToStart onStart={handleStart} />

      {/* Background Decorative Accents */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-[#8b5cf6]/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-[#00d4ff]/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Floating Card Silhouettes */}
      <div className="absolute top-1/4 left-1/4 w-40 h-40 border border-white/5 rounded-xl -rotate-12 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-32 h-32 border border-white/5 rounded-xl rotate-45 pointer-events-none"></div>
      <div className="absolute top-2/3 left-1/3 w-24 h-24 border border-white/5 rounded-xl rotate-12 pointer-events-none"></div>
      {/* Header */}
      <header className="relative z-10 p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd700] to-[#ff8c00] flex items-center justify-center text-[#0a0e1a] font-black text-lg shadow-lg shadow-[#ffd700]/30">
              H
            </div>
            <div>
              <span className="text-white font-bold text-lg">HOL&apos;DAMN IT!</span>
              <span className="text-[#64748b] text-xs ml-2">Alpha 0.1</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {currentTitle && (
              <button
                onClick={() => router.push('/stats')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1f35] hover:bg-[#252b45] transition-colors"
              >
                <span className="text-lg">{currentTitle.icon}</span>
                <span className="text-white text-sm font-medium hidden sm:inline">{currentTitle.name}</span>
              </button>
            )}
            <AudioToggle />
            <button
              onClick={() => router.push('/settings')}
              className="w-10 h-10 rounded-full bg-[#1a1f35] flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#252b45] transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-7xl w-full flex items-center justify-center gap-8 lg:gap-16">

          {/* Left Side - Character Card */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Speech Bubble */}
              <div className={`absolute -top-24 left-1/2 -translate-x-1/2 z-10 bg-[#1a1f35] backdrop-blur-sm rounded-xl px-5 py-3 text-sm text-white/90 w-[280px] text-center shadow-lg border-2 ${
                mascotMessage.type === 'tip' ? 'border-[#00d4ff]' :
                mascotMessage.type === 'status' ? 'border-[#00ff88]' :
                mascotMessage.type === 'event' ? 'border-[#ff4d94]' :
                mascotMessage.type === 'challenge' ? 'border-[#ffd700]' :
                mascotMessage.type === 'lucky' ? 'border-[#8b5cf6]' :
                'border-white/40'
              }`}>
                <span className="whitespace-pre-line">{mascotMessage.message}</span>
                {/* Arrow with border */}
                <div className="absolute -bottom-[12px] left-1/2 -translate-x-1/2">
                  {/* Border triangle (outer) */}
                  <div className={`w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-transparent ${
                    mascotMessage.type === 'tip' ? 'border-t-[#00d4ff]' :
                    mascotMessage.type === 'status' ? 'border-t-[#00ff88]' :
                    mascotMessage.type === 'event' ? 'border-t-[#ff4d94]' :
                    mascotMessage.type === 'challenge' ? 'border-t-[#ffd700]' :
                    mascotMessage.type === 'lucky' ? 'border-t-[#8b5cf6]' :
                    'border-t-white/40'
                  }`}></div>
                  {/* Fill triangle (inner) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-transparent border-t-[#1a1f35]"></div>
                </div>
              </div>

              {/* Character Card */}
              <div className="relative w-48 h-64 rounded-2xl bg-gradient-to-br from-[#1a1f35] to-[#0f1424] border border-white/10 overflow-hidden shadow-2xl">
                {/* NEW Badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#00d4ff] text-[#0a0e1a] text-xs font-bold">
                  NEW
                </div>

                {/* Character Silhouette */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-32 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] flex items-center justify-center">
                    <div className="text-4xl">🎰</div>
                  </div>
                </div>

                {/* Card Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[#0a0e1a] to-transparent">
                  <p className="text-xs text-[#64748b] text-center">The tables are hot!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Main Content */}
          <div className="text-center space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
                <span className="block text-gradient-secondary">HOL&apos;DAMN</span>
                <span className="block text-gradient-primary">IT!</span>
              </h1>
              <p className="text-slate-400 text-sm mt-2 tracking-widest">THE ULTIMATE EQUITY CHALLENGE</p>
            </div>


            {/* Buttons */}
            <div className="space-y-3 max-w-xs mx-auto pt-4">
              <button
                onClick={handleStartGame}
                className="w-full py-4 px-8 rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] text-white text-lg font-bold shadow-lg shadow-[#0066ff]/30 hover:shadow-xl hover:shadow-[#0066ff]/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                QUICK PLAY
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handlePractice}
                  className="flex-1 py-3 px-4 rounded-full bg-[#1a1f35] text-white font-semibold border border-white/10 hover:bg-[#252b45] hover:border-white/20 transition-all"
                >
                  PRACTICE
                </button>
                <button
                  onClick={handleDailyChallenge}
                  className="flex-1 py-3 px-4 rounded-full bg-[#1a1f35] text-white font-semibold border border-white/10 hover:bg-[#252b45] hover:border-white/20 transition-all"
                >
                  DAILY RUN
                </button>
              </div>

              <button
                onClick={() => setShowTutorial(true)}
                className="text-[#64748b] hover:text-[#00d4ff] transition-colors text-sm"
              >
                VIEW COLLECTION
              </button>
            </div>
          </div>

          {/* Right Side - Stats Cards */}
          <div className="hidden lg:flex flex-col gap-3 w-56">
            {/* Total Wins */}
            <div className="bg-[#1a1f35] rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#64748b] text-xs uppercase tracking-wider">Total Wins</span>
                <div className="w-6 h-6 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#00d4ff]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-black text-white tabular-nums">
                {stats?.totalWins?.toLocaleString() ?? 0}
              </div>
            </div>

            {/* High Score */}
            <div className="bg-[#1a1f35] rounded-2xl p-4 border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[#64748b] text-xs uppercase tracking-wider">Best Streak</span>
                <div className="px-2 py-0.5 rounded-full bg-[#ffd700]/20 text-[#ffd700] text-xs font-bold">
                  BEST
                </div>
              </div>
              <div className="text-3xl font-black text-white tabular-nums">
                {stats?.maxStreak ?? 0}
              </div>
            </div>

            {/* Rank Status */}
            <div className="bg-[#1a1f35] rounded-2xl p-4 border border-white/5">
              <div className="text-[#64748b] text-xs uppercase tracking-wider mb-2">Rank Status</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentTitle?.icon ?? '🎮'}</span>
                <span className="text-lg font-bold text-gradient-gold">
                  {currentTitle?.name ?? 'Beginner'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Stats Bar */}
      {stats && stats.totalGames > 0 && (
        <div className="relative z-10 lg:hidden px-4 pb-4">
          <button
            onClick={() => router.push('/stats')}
            className="w-full bg-[#1a1f35] rounded-2xl p-4 flex justify-around border border-white/5"
          >
            <div className="text-center">
              <div className="text-xl font-bold text-white tabular-nums">{stats.totalWins}</div>
              <div className="text-xs text-[#64748b]">Wins</div>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#ffd700] tabular-nums">{stats.maxStreak}</div>
              <div className="text-xs text-[#64748b]">Streak</div>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <div className="text-xl font-bold text-[#00d4ff] tabular-nums">{winRate}%</div>
              <div className="text-xs text-[#64748b]">Win Rate</div>
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 p-4 border-t border-white/5 bg-black/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6">
            <button className="text-white text-sm font-medium hover:text-[#00d4ff] transition-colors">
              HOME
            </button>
            <button
              onClick={handlePractice}
              className="text-[#64748b] text-sm hover:text-white transition-colors"
            >
              PRACTICE
            </button>
            <button
              onClick={() => router.push('/comments')}
              className="text-[#64748b] text-sm hover:text-white transition-colors"
            >
              CREDITS
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[#64748b] text-xs">
            <span>MASTER STATS:</span>
            <span className="text-white font-medium">{stats?.totalGames ?? 0}</span>
            <span>/</span>
            <span>100</span>
          </div>

          <button
            onClick={() => router.push('/stats')}
            className="text-[#64748b] text-sm hover:text-white transition-colors"
          >
            HI SCORE
          </button>
        </div>
      </footer>

      {/* Tutorial Dialog */}
      <TutorialDialog
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
}
