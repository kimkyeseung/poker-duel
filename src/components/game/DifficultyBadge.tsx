'use client';

import { Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'from-emerald-500 to-emerald-600',
  normal: 'from-blue-500 to-blue-600',
  hard: 'from-amber-500 to-amber-600',
  expert: 'from-purple-500 to-purple-600',
  god: 'from-red-500 to-red-600',
};

const DIFFICULTY_ICONS: Record<Difficulty, string> = {
  easy: '⭐',
  normal: '⭐⭐',
  hard: '⭐⭐⭐',
  expert: '💎',
  god: '👑',
};

export function DifficultyBadge({
  difficulty,
  size = 'md',
  className,
}: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];
  const color = DIFFICULTY_COLORS[difficulty];
  const icon = DIFFICULTY_ICONS[difficulty];

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-bold text-white',
        'bg-gradient-to-r shadow-lg',
        color,
        sizes[size],
        className
      )}
    >
      <span>{icon}</span>
      <span>{config.nameKo}</span>
    </div>
  );
}

// 난이도 진행 표시기
export function DifficultyProgress({
  currentDifficulty,
  className,
}: {
  currentDifficulty: Difficulty;
  className?: string;
}) {
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'god'];
  const currentIndex = difficulties.indexOf(currentDifficulty);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {difficulties.map((diff, index) => {
        const config = DIFFICULTY_CONFIG[diff];
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={diff} className="flex items-center">
            {/* 난이도 점 */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? `bg-gradient-to-r ${DIFFICULTY_COLORS[diff]} text-white ring-2 ring-white/50`
                  : 'bg-slate-700 text-slate-500'
              )}
            >
              {isCompleted ? '✓' : index + 1}
            </div>

            {/* 연결선 */}
            {index < difficulties.length - 1 && (
              <div
                className={cn(
                  'w-6 h-0.5',
                  isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
