'use client';

import { Card as CardType } from '@/types';
import { Card, CardSlot } from './Card';
import { cn } from '@/lib/utils';

type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface TableProps {
  communityCards: CardType[];
  burnCards?: CardType[];
  className?: string;
  isRevealing?: boolean;
  newCardsCount?: number;
  onRevealComplete?: () => void;
  compact?: boolean;
  cardSize?: CardSize;
  showBurnCards?: boolean;
}

export function Table({
  communityCards,
  burnCards = [],
  className,
  isRevealing = false,
  newCardsCount = 0,
  onRevealComplete,
  compact = false,
  cardSize: propCardSize,
  showBurnCards = true,
}: TableProps) {
  const cardSize = propCardSize ?? (compact ? 'sm' : 'lg');
  const burnCardSize = compact ? 'xs' : 'sm';
  const slots = Array(5).fill(null);
  const previousCardCount = communityCards.length - newCardsCount;

  const handleLastCardFlipComplete = () => {
    if (onRevealComplete) {
      onRevealComplete();
    }
  };

  return (
    <div data-testid="game-table" className={cn('relative', className)}>
      {/* Table background - darker, more modern */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b from-[#1a1f35] to-[#0f1424] shadow-2xl border border-white/5',
        compact ? 'rounded-[40px]' : 'rounded-[60px]'
      )} />

      {/* Inner felt effect */}
      <div className={cn(
        'absolute bg-[#151a2e]/80',
        compact ? 'inset-2 rounded-[34px]' : 'inset-3 rounded-[52px]'
      )} />

      {/* Subtle glow effect */}
      <div className={cn(
        'absolute inset-0 shadow-[inset_0_0_60px_rgba(0,212,255,0.05)]',
        compact ? 'rounded-[40px]' : 'rounded-[60px]'
      )} />

      {/* Community cards area */}
      <div className={cn(
        'relative z-10 flex items-center justify-center',
        compact ? 'py-3 sm:py-5 px-2 sm:px-4' : 'py-10 px-6'
      )}>
        {/* Burn cards pile (left side) */}
        {showBurnCards && burnCards.length > 0 && (
          <div className={cn(
            'absolute flex flex-col items-center',
            compact ? 'left-2 sm:left-4' : 'left-6'
          )}>
            <div className="relative">
              {burnCards.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'absolute transition-all duration-300',
                    index === burnCards.length - 1 && 'animate-in slide-in-from-right-4 fade-in'
                  )}
                  style={{
                    transform: `rotate(${-5 + index * 3}deg) translateX(${index * 2}px) translateY(${index * 2}px)`,
                  }}
                >
                  <Card isHidden size={burnCardSize} />
                </div>
              ))}
              {/* Top visible burn card */}
              <div
                className="relative"
                style={{
                  transform: `rotate(${-5 + (burnCards.length - 1) * 3}deg)`,
                  marginLeft: `${(burnCards.length - 1) * 2}px`,
                  marginTop: `${(burnCards.length - 1) * 2}px`,
                }}
              >
                <Card isHidden size={burnCardSize} />
              </div>
            </div>
            <span className={cn(
              'text-[#64748b] font-medium mt-1',
              compact ? 'text-[8px]' : 'text-[10px]'
            )}>
              BURN
            </span>
          </div>
        )}

        {/* Community cards */}
        <div className={cn('flex', compact ? 'gap-1 sm:gap-2' : 'gap-3 md:gap-4')}>
          {slots.map((_, index) => {
            const card = communityCards[index];
            const isNewCard = isRevealing && index >= previousCardCount && index < communityCards.length;
            const isLastNewCard = isNewCard && index === communityCards.length - 1;
            const flipDelayIndex = index - previousCardCount;

            return (
              <div key={index} className="transform transition-all duration-500">
                {card ? (
                  isNewCard ? (
                    <Card
                      card={card}
                      size={cardSize}
                      isFlipping={true}
                      flipDelay={flipDelayIndex * 400}
                      onFlipComplete={isLastNewCard ? handleLastCardFlipComplete : undefined}
                    />
                  ) : (
                    <Card card={card} size={cardSize} />
                  )
                ) : (
                  <CardSlot size={cardSize} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
