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
  handRank?: number;
  isActive?: boolean;
  className?: string;
  isRevealing?: boolean;
  onRevealComplete?: () => void;
  hasRevealed?: boolean;
  compact?: boolean;
  showCards?: boolean;
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
  compact = false,
  showCards = false,
}: PlayerAreaProps) {
  const cardSize = compact ? 'md' : 'lg';
  const shouldHideCards = isComputer && !showCards;

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        compact ? 'gap-2' : 'gap-3',
        isComputer ? 'flex-col' : 'flex-col-reverse',
        className
      )}
    >
      {/* Player Info Badge */}
      <div
        className={cn(
          'flex items-center rounded-full',
          'bg-[#1a1f35]/90 border backdrop-blur-sm',
          'transition-all duration-300',
          compact ? 'gap-2 px-3 py-1.5' : 'gap-3 px-4 py-2',
          isActive
            ? isComputer
              ? 'border-[#ff4d94]/50 shadow-[0_0_20px_rgba(255,77,148,0.2)]'
              : 'border-[#00d4ff]/50 shadow-[0_0_20px_rgba(0,212,255,0.2)]'
            : 'border-white/5'
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-bold',
            compact ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg',
            isComputer
              ? 'bg-gradient-to-br from-[#ff4d94] to-[#ff0080] text-white'
              : 'bg-gradient-to-br from-[#00d4ff] to-[#0066ff] text-white'
          )}
        >
          {isComputer ? 'D' : 'P'}
        </div>

        {/* Name and Info */}
        <div className="text-left">
          <div className={cn(
            'font-bold',
            compact ? 'text-xs' : 'text-sm',
            isComputer ? 'text-[#ff4d94]' : 'text-[#00d4ff]'
          )}>
            {label}
          </div>
          {handName && (
            <div className={cn('text-[#64748b]', compact ? 'text-[10px]' : 'text-xs')}>{handName}</div>
          )}
        </div>

        {/* Hand Rank (Preflop) */}
        {typeof handRank === 'number' && (
          <div
            className={cn(
              'ml-1 rounded-full font-bold font-mono',
              compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
              isComputer
                ? 'bg-[#ff4d94]/20 text-[#ff4d94]'
                : 'bg-[#00d4ff]/20 text-[#00d4ff]'
            )}
          >
            #{handRank}
          </div>
        )}

        {/* Win Rate (Flop/Turn/River) */}
        {typeof winRate === 'number' && typeof handRank !== 'number' && (
          <div
            className={cn(
              'ml-1 rounded-full font-bold',
              compact ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
              winRate >= 50
                ? 'bg-[#00ff88]/20 text-[#00ff88]'
                : 'bg-[#ff4444]/20 text-[#ff4444]'
            )}
          >
            {winRate.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Cards */}
      <div className={cn('flex', compact ? 'gap-2' : 'gap-3')}>
        {cards ? (
          isRevealing ? (
            <>
              <Card
                card={cards[0]}
                size={cardSize}
                isHighlighted={isActive}
                isFlipping={true}
                flipDelay={0}
              />
              <Card
                card={cards[1]}
                size={cardSize}
                isHighlighted={isActive}
                isFlipping={true}
                flipDelay={400}
                onFlipComplete={onRevealComplete}
              />
            </>
          ) : (
            <>
              <Card
                card={shouldHideCards ? undefined : cards[0]}
                isHidden={shouldHideCards}
                size={cardSize}
                isHighlighted={isActive && !shouldHideCards}
                skipEntryAnimation={hasRevealed}
              />
              <Card
                card={shouldHideCards ? undefined : cards[1]}
                isHidden={shouldHideCards}
                size={cardSize}
                isHighlighted={isActive && !shouldHideCards}
                skipEntryAnimation={hasRevealed}
              />
            </>
          )
        ) : (
          <>
            <Card isHidden size={cardSize} />
            <Card isHidden size={cardSize} />
          </>
        )}
      </div>
    </div>
  );
}
