'use client';

import { Card as CardType } from '@/types';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface PlayerAreaProps {
  cards: [CardType, CardType] | null;
  isComputer?: boolean;
  label: string;
  handName?: string;
  winRate?: number;
  isActive?: boolean;
  className?: string;
}

export function PlayerArea({
  cards,
  isComputer = false,
  label,
  handName,
  winRate,
  isActive = false,
  className,
}: PlayerAreaProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2',
        isComputer ? 'flex-col' : 'flex-col-reverse',
        className
      )}
    >
      {/* 플레이어 정보 */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-full',
          'bg-slate-800/80 border',
          isActive ? 'border-amber-500 shadow-lg shadow-amber-500/20' : 'border-slate-700'
        )}
      >
        {/* 아바타 */}
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-xl',
            isComputer
              ? 'bg-gradient-to-br from-red-500 to-red-700'
              : 'bg-gradient-to-br from-blue-500 to-blue-700'
          )}
        >
          {isComputer ? '🤖' : '👤'}
        </div>

        {/* 이름 및 정보 */}
        <div className="text-left">
          <div className="text-white font-semibold">{label}</div>
          {handName && (
            <div className="text-xs text-slate-400">{handName}</div>
          )}
        </div>

        {/* 승률 표시 */}
        {typeof winRate === 'number' && (
          <div
            className={cn(
              'ml-2 px-3 py-1 rounded-full text-sm font-bold',
              winRate >= 50
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-red-500/20 text-red-400'
            )}
          >
            {winRate.toFixed(1)}%
          </div>
        )}
      </div>

      {/* 카드 */}
      <div className="flex gap-2">
        {cards ? (
          <>
            <Card card={cards[0]} size="lg" isHighlighted={isActive} />
            <Card card={cards[1]} size="lg" isHighlighted={isActive} animationDelay={100} />
          </>
        ) : (
          <>
            <Card isHidden size="lg" />
            <Card isHidden size="lg" />
          </>
        )}
      </div>
    </div>
  );
}
