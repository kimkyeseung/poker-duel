'use client';

import { useEffect, useState } from 'react';
import { Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface LevelStartOverlayProps {
  isVisible: boolean;
  difficulty: Difficulty;
  onComplete: () => void;
}

// 난이도별 색상 테마
const DIFFICULTY_THEMES: Record<Difficulty, {
  gradient: string;
  glow: string;
  accent: string;
}> = {
  easy: {
    gradient: 'from-emerald-500 to-green-600',
    glow: 'shadow-[0_0_60px_rgba(16,185,129,0.5)]',
    accent: 'text-emerald-400',
  },
  normal: {
    gradient: 'from-cyan-500 to-blue-600',
    glow: 'shadow-[0_0_60px_rgba(0,212,255,0.5)]',
    accent: 'text-cyan-400',
  },
  hard: {
    gradient: 'from-amber-500 to-orange-600',
    glow: 'shadow-[0_0_60px_rgba(245,158,11,0.5)]',
    accent: 'text-amber-400',
  },
  expert: {
    gradient: 'from-purple-500 to-violet-600',
    glow: 'shadow-[0_0_60px_rgba(139,92,246,0.5)]',
    accent: 'text-purple-400',
  },
  king: {
    gradient: 'from-red-500 to-rose-600',
    glow: 'shadow-[0_0_60px_rgba(239,68,68,0.5)]',
    accent: 'text-red-400',
  },
  god: {
    gradient: 'from-rose-500 to-pink-600',
    glow: 'shadow-[0_0_60px_rgba(244,63,94,0.5)]',
    accent: 'text-rose-400',
  },
};


export function LevelStartOverlay({
  isVisible,
  difficulty,
  onComplete,
}: LevelStartOverlayProps) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>('hidden');
  const [quote, setQuote] = useState('');

  const theme = DIFFICULTY_THEMES[difficulty];

  useEffect(() => {
    if (isVisible) {
      // 랜덤 격언 선택
      const quotes = t.quotes[difficulty];
      setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

      // 애니메이션 시퀀스
      setPhase('entering');

      const visibleTimer = setTimeout(() => {
        setPhase('visible');
      }, 300);

      const exitTimer = setTimeout(() => {
        setPhase('exiting');
      }, 4700);

      const completeTimer = setTimeout(() => {
        setPhase('hidden');
        onComplete();
      }, 5000);

      return () => {
        clearTimeout(visibleTimer);
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setPhase('hidden');
    }
  }, [isVisible, difficulty, onComplete]);

  if (phase === 'hidden') return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex items-center justify-center',
        'bg-[#0a0e1a]/95 backdrop-blur-md',
        'transition-opacity duration-300',
        phase === 'entering' && 'opacity-0',
        phase === 'visible' && 'opacity-100',
        phase === 'exiting' && 'opacity-0',
      )}
    >
      {/* 배경 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'absolute w-2 h-2 rounded-full opacity-20',
              `bg-gradient-to-r ${theme.gradient}`,
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 */}
      <div
        className={cn(
          'text-center px-8 transition-all duration-500',
          phase === 'entering' && 'scale-90 opacity-0 translate-y-8',
          phase === 'visible' && 'scale-100 opacity-100 translate-y-0',
          phase === 'exiting' && 'scale-110 opacity-0 -translate-y-8',
        )}
      >
        {/* 레벨 번호 */}
        <div className={cn(
          'text-sm font-bold tracking-[0.3em] uppercase mb-4',
          theme.accent,
        )}>
          {t.difficulty.level.replace('{number}', String(['easy', 'normal', 'hard', 'expert', 'king', 'god'].indexOf(difficulty) + 1))}
        </div>

        {/* 난이도 타이틀 */}
        <h1
          className={cn(
            'text-6xl md:text-8xl font-black mb-6',
            'bg-gradient-to-r bg-clip-text text-transparent',
            theme.gradient,
            theme.glow,
          )}
          style={{
            textShadow: '0 0 40px currentColor',
          }}
        >
          {t.difficulty[difficulty].toUpperCase()}
        </h1>

        {/* 레벨 정보 */}
        <div className="mb-8">
          <div className={cn(
            'inline-block px-6 py-2 rounded-full',
            'bg-white/5 border border-white/10',
            'text-white/80 text-sm font-medium',
          )}>
            {t.levelInfo[difficulty]}
          </div>
        </div>

        {/* 포커 격언 */}
        <p className={cn(
          'text-lg md:text-xl text-white/60 italic max-w-md mx-auto',
          'leading-relaxed',
        )}>
          "{quote}"
        </p>

        {/* 장식 라인 */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <div className={cn(
            'h-[2px] w-16 rounded-full',
            `bg-gradient-to-r ${theme.gradient}`,
            'opacity-50',
          )} />
          <div className={cn(
            'w-3 h-3 rounded-full',
            `bg-gradient-to-r ${theme.gradient}`,
          )} />
          <div className={cn(
            'h-[2px] w-16 rounded-full',
            `bg-gradient-to-l ${theme.gradient}`,
            'opacity-50',
          )} />
        </div>
      </div>
    </div>
  );
}
