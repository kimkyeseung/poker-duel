'use client';

import { cn } from '@/lib/utils';
import { Difficulty, GameRound } from '@/types/poker';
import { difficultyColors } from '@/lib/design-tokens';
import { useTranslation } from '@/lib/i18n';

interface GameProgressProps {
  difficulty: Difficulty;
  currentRound: GameRound;
  className?: string;
}

const ROUNDS: GameRound[] = ['preflop', 'flop', 'turn', 'river'];

// 컴팩트 버전 (헤더용)
export function GameProgressCompact({ difficulty, currentRound, className }: GameProgressProps) {
  const { t } = useTranslation();
  const colors = difficultyColors[difficulty];
  const diffName = t.difficulty[difficulty];
  const roundName = t.game.rounds[currentRound];

  return (
    <div className={cn('flex items-center gap-1.5 sm:gap-3', className)}>
      {/* 난이도 뱃지 */}
      <span
        className={cn(
          'px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-sm font-bold',
          colors.bgSubtle,
          colors.text,
          colors.border,
          'border'
        )}
      >
        {diffName}
      </span>

      {/* 구분선 */}
      <span className="text-[#1a1f35] hidden sm:inline">|</span>

      {/* 라운드 */}
      <span className="text-white/80 text-[10px] sm:text-sm font-medium hidden sm:inline">
        {roundName}
      </span>

      {/* 라운드 도트 인디케이터 */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {ROUNDS.map((round, index) => {
          const currentIndex = ROUNDS.indexOf(currentRound);
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div
              key={round}
              className={cn(
                'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300',
                isActive
                  ? 'bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.5)]'
                  : isCompleted
                  ? 'bg-[#00ff88]'
                  : 'bg-[#1a1f35]'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
