'use client';

import { Card as CardType } from '@/types';
import { Card, CardSlot } from './Card';
import { cn } from '@/lib/utils';

interface TableProps {
  communityCards: CardType[];
  className?: string;
  isRevealing?: boolean;
  newCardsCount?: number;
  onRevealComplete?: () => void;
  compact?: boolean;
}

export function Table({
  communityCards,
  className,
  isRevealing = false,
  newCardsCount = 0,
  onRevealComplete,
  compact = false,
}: TableProps) {
  const cardSize = compact ? 'md' : 'lg';
  const slots = Array(5).fill(null);
  const previousCardCount = communityCards.length - newCardsCount;

  const handleLastCardFlipComplete = () => {
    if (onRevealComplete) {
      onRevealComplete();
    }
  };

  return (
    <div className={cn('relative', className)}>
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
        compact ? 'py-5 px-4' : 'py-10 px-6'
      )}>
        <div className={cn('flex', compact ? 'gap-2' : 'gap-3 md:gap-4')}>
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
