'use client';

import { cn } from '@/lib/utils';
import { Difficulty, GameRound, DIFFICULTY_CONFIG } from '@/types/poker';
import { difficultyColors, difficultyNames, roundNames } from '@/lib/design-tokens';

interface GameProgressProps {
  difficulty: Difficulty;
  currentRound: GameRound;
  className?: string;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard', 'expert', 'god'];
const ROUNDS: GameRound[] = ['preflop', 'flop', 'turn', 'river'];

export function GameProgress({ difficulty, currentRound, className }: GameProgressProps) {
  const currentDifficultyIndex = DIFFICULTIES.indexOf(difficulty);
  const currentRoundIndex = ROUNDS.indexOf(currentRound);

  return (
    <div className={cn('space-y-3', className)}>
      {/* 난이도 진행도 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 min-w-[50px]">난이도</span>
        <div className="flex-1 flex items-center gap-1">
          {DIFFICULTIES.map((diff, index) => {
            const isActive = index === currentDifficultyIndex;
            const isCompleted = index < currentDifficultyIndex;
            const colors = difficultyColors[diff === 'god' ? 'master' : diff];

            return (
              <div
                key={diff}
                className="flex-1 relative"
                title={difficultyNames[diff === 'god' ? 'master' : diff]}
              >
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    isActive
                      ? cn(colors.bg, 'ring-2 ring-offset-1 ring-offset-slate-900', colors.border.replace('border-', 'ring-'))
                      : isCompleted
                      ? colors.bg
                      : 'bg-slate-700'
                  )}
                />
                {isActive && (
                  <div
                    className={cn(
                      'absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap',
                      colors.text
                    )}
                  >
                    {difficultyNames[diff === 'god' ? 'master' : diff]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 라운드 진행도 */}
      <div className="flex items-center gap-2 mt-6">
        <span className="text-xs text-slate-400 min-w-[50px]">라운드</span>
        <div className="flex-1 flex items-center">
          {ROUNDS.map((round, index) => {
            const isActive = index === currentRoundIndex;
            const isCompleted = index < currentRoundIndex;

            return (
              <div key={round} className="flex-1 flex items-center">
                {/* 점 */}
                <div
                  className={cn(
                    'w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0',
                    isActive
                      ? 'bg-amber-500 ring-4 ring-amber-500/30'
                      : isCompleted
                      ? 'bg-emerald-500'
                      : 'bg-slate-600'
                  )}
                />
                {/* 연결선 */}
                {index < ROUNDS.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 transition-all duration-300',
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-700'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 라운드 라벨 */}
      <div className="flex items-center gap-2">
        <span className="min-w-[50px]" />
        <div className="flex-1 flex">
          {ROUNDS.map((round, index) => {
            const isActive = index === currentRoundIndex;

            return (
              <div
                key={round}
                className={cn(
                  'flex-1 text-center text-xs transition-all duration-300',
                  isActive ? 'text-amber-400 font-medium' : 'text-slate-500'
                )}
              >
                {roundNames[round]}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 컴팩트 버전 (헤더용)
export function GameProgressCompact({ difficulty, currentRound, className }: GameProgressProps) {
  const colors = difficultyColors[difficulty === 'god' ? 'master' : difficulty];
  const diffName = difficultyNames[difficulty === 'god' ? 'master' : difficulty];
  const roundName = roundNames[currentRound];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* 난이도 뱃지 */}
      <span
        className={cn(
          'px-3 py-1 rounded-full text-sm font-medium',
          colors.bgSubtle,
          colors.text,
          colors.border,
          'border'
        )}
      >
        {diffName}
      </span>

      {/* 구분선 */}
      <span className="text-slate-600">|</span>

      {/* 라운드 */}
      <span className="text-slate-300 text-sm">
        {roundName}
      </span>

      {/* 라운드 도트 인디케이터 */}
      <div className="flex items-center gap-1">
        {ROUNDS.map((round, index) => {
          const currentIndex = ROUNDS.indexOf(currentRound);
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <div
              key={round}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                isActive
                  ? 'bg-amber-500'
                  : isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-slate-600'
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

// 난이도만 보여주는 뱃지 (간소화 버전)
export function DifficultyBadgeSimple({
  difficulty,
  size = 'md',
  className,
}: {
  difficulty: Difficulty;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const colors = difficultyColors[difficulty === 'god' ? 'master' : difficulty];
  const diffName = difficultyNames[difficulty === 'god' ? 'master' : difficulty];

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={cn(
        'rounded-full font-medium inline-flex items-center',
        colors.bgSubtle,
        colors.text,
        colors.border,
        'border',
        sizes[size],
        className
      )}
    >
      {diffName}
    </span>
  );
}
