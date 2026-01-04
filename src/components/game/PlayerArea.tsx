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
  handRank?: number; // 프리플랍 핸드 랭킹 (1~169)
  isActive?: boolean;
  className?: string;
  isRevealing?: boolean; // 카드 공개 애니메이션 중
  onRevealComplete?: () => void; // 카드 공개 완료 콜백
  hasRevealed?: boolean; // 카드가 이미 공개된 상태인지
}

export function PlayerArea({
  cards,
  isComputer = false,
  label,
  handName,
  winRate,
  handRank,
  isActive = false,
  className,
  isRevealing = false,
  onRevealComplete,
  hasRevealed = false,
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
          'bg-slate-800/80 border backdrop-blur-sm',
          'transition-all duration-300',
          isActive
            ? 'border-amber-500 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/10'
            : 'border-slate-700'
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

        {/* 핸드 랭킹 표시 (프리플랍) */}
        {typeof handRank === 'number' && (
          <div
            className={cn(
              'ml-2 px-3 py-1 rounded-full text-sm font-bold font-mono',
              isComputer
                ? 'bg-red-500/20 text-red-400'
                : 'bg-blue-500/20 text-blue-400'
            )}
          >
            {handRank}/169
          </div>
        )}

        {/* 승률 표시 (플랍/턴/리버) */}
        {typeof winRate === 'number' && typeof handRank !== 'number' && (
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
          isRevealing ? (
            // 카드 공개 애니메이션
            <>
              <Card
                card={cards[0]}
                size="lg"
                isHighlighted={isActive}
                isFlipping={true}
                flipDelay={0}
              />
              <Card
                card={cards[1]}
                size="lg"
                isHighlighted={isActive}
                isFlipping={true}
                flipDelay={400}
                onFlipComplete={onRevealComplete}
              />
            </>
          ) : (
            // 일반 카드 표시
            <>
              <Card card={cards[0]} size="lg" isHighlighted={isActive} skipEntryAnimation={hasRevealed} />
              <Card card={cards[1]} size="lg" isHighlighted={isActive} skipEntryAnimation={hasRevealed} />
            </>
          )
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
