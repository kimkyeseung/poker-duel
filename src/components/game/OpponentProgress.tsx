'use client';

import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { OPPONENT_CONFIGS } from '@/types';
import { cn } from '@/lib/utils';

interface OpponentProgressProps {
  currentOpponentIndex: number;
  opponentsDefeated: boolean[];
  className?: string;
}

export function OpponentProgress({
  currentOpponentIndex,
  opponentsDefeated,
  className,
}: OpponentProgressProps) {
  return (
    <div className={cn('flex items-center gap-1 sm:gap-2', className)}>
      {/* 플레이어 */}
      <ProfileAvatar
        src="/profiles/player.png"
        alt="You"
        fallback="P"
        size="sm"
        isPlayer
        isActive
      />

      {/* VS 표시 */}
      <span className="text-[10px] sm:text-xs text-[#64748b] font-bold">VS</span>

      {/* 상대들 */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        {OPPONENT_CONFIGS.map((opponent, index) => (
          <div key={opponent.type} className="relative">
            <ProfileAvatar
              src={opponent.profileImage}
              alt={opponent.label}
              fallback={opponent.label[0]}
              size="sm"
              isActive={index === currentOpponentIndex}
              isDefeated={opponentsDefeated[index]}
            />

            {/* 연결선 (마지막 제외) */}
            {index < OPPONENT_CONFIGS.length - 1 && (
              <div
                className={cn(
                  'absolute top-1/2 -right-0.5 sm:-right-1 w-1 sm:w-2 h-0.5',
                  'transform -translate-y-1/2',
                  opponentsDefeated[index]
                    ? 'bg-green-500/50'
                    : index < currentOpponentIndex
                      ? 'bg-[#ff4d94]/50'
                      : 'bg-white/10'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
