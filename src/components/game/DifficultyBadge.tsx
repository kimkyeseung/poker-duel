'use client';

import { Difficulty, DIFFICULTY_CONFIG } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'from-[#00ff88] to-[#00cc66]',
  normal: 'from-[#00d4ff] to-[#0066ff]',
  hard: 'from-[#ffd700] to-[#ffb800]',
  expert: 'from-[#ff4d94] to-[#ff0080]',
  king: 'from-[#ff4444] to-[#cc0000]',
  god: 'from-[#ffd700] via-[#ff4d94] to-[#ff0080]',
};

const DIFFICULTY_ICONS: Record<Difficulty, string> = {
  easy: '1',
  normal: '2',
  hard: '3',
  expert: '4',
  king: '5',
  god: '6',
};

export function DifficultyBadge({
  difficulty,
  size = 'md',
  className,
}: DifficultyBadgeProps) {
  const { t } = useTranslation();
  const color = DIFFICULTY_COLORS[difficulty];

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-bold text-white',
        'bg-gradient-to-r',
        'shadow-lg',
        color,
        sizes[size],
        className
      )}
    >
      <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
        {DIFFICULTY_ICONS[difficulty]}
      </span>
      <span>{t.difficulty[difficulty]}</span>
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
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'king', 'god'];
  const currentIndex = difficulties.indexOf(currentDifficulty);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {difficulties.map((diff, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={diff} className="flex items-center">
            {/* 난이도 점 */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                isCompleted
                  ? 'bg-[#00ff88] text-[#0a0e1a]'
                  : isCurrent
                  ? cn('bg-gradient-to-r text-white ring-2 ring-white/30', DIFFICULTY_COLORS[diff])
                  : 'bg-[#1a1f35] text-[#64748b]'
              )}
            >
              {isCompleted ? '✓' : index + 1}
            </div>

            {/* 연결선 */}
            {index < difficulties.length - 1 && (
              <div
                className={cn(
                  'w-6 h-0.5',
                  isCompleted ? 'bg-[#00ff88]' : 'bg-[#1a1f35]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
