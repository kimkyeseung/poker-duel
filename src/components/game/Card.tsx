'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card as CardType, Suit } from '@/types';
import { cn } from '@/lib/utils';
import { audioManager } from '@/lib/audio';

interface CardProps {
  card?: CardType;
  isHidden?: boolean;
  isHighlighted?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animationDelay?: number;
  isFlipping?: boolean;
  flipDelay?: number;
  onFlipComplete?: () => void;
  skipEntryAnimation?: boolean;
}

// Suit configuration
const SUIT_CONFIG: Record<Suit, { symbol: string; color: string; bgColor: string }> = {
  hearts: { symbol: '♥', color: 'text-red-500', bgColor: 'text-red-100' },
  diamonds: { symbol: '♦', color: 'text-red-500', bgColor: 'text-red-100' },
  clubs: { symbol: '♣', color: 'text-gray-800', bgColor: 'text-gray-200' },
  spades: { symbol: '♠', color: 'text-gray-800', bgColor: 'text-gray-200' },
};

// Size configuration
const SIZE_CONFIG = {
  xs: {
    card: 'w-11 h-16',
    rank: 'text-sm',
    suit: 'text-xl',
    cornerRank: 'text-[10px]',
    cornerSuit: 'text-[10px]',
    corner: 'top-0.5 left-0.5',
    cornerBottom: 'bottom-0.5 right-0.5',
  },
  sm: {
    card: 'w-14 h-20',
    rank: 'text-base',
    suit: 'text-2xl',
    cornerRank: 'text-xs',
    cornerSuit: 'text-xs',
    corner: 'top-0.5 left-1',
    cornerBottom: 'bottom-0.5 right-1',
  },
  md: {
    card: 'w-18 h-26',
    rank: 'text-xl',
    suit: 'text-3xl',
    cornerRank: 'text-sm',
    cornerSuit: 'text-sm',
    corner: 'top-1 left-1.5',
    cornerBottom: 'bottom-1 right-1.5',
  },
  lg: {
    card: 'w-24 h-34',
    rank: 'text-2xl',
    suit: 'text-5xl',
    cornerRank: 'text-lg',
    cornerSuit: 'text-base',
    corner: 'top-1.5 left-2',
    cornerBottom: 'bottom-1.5 right-2',
  },
  xl: {
    card: 'w-32 h-44',
    rank: 'text-4xl',
    suit: 'text-6xl',
    cornerRank: 'text-xl',
    cornerSuit: 'text-lg',
    corner: 'top-2 left-3',
    cornerBottom: 'bottom-2 right-3',
  },
};

export function Card({
  card,
  isHidden = false,
  isHighlighted = false,
  size = 'md',
  className,
  animationDelay = 0,
  isFlipping = false,
  flipDelay = 0,
  onFlipComplete,
  skipEntryAnimation = false,
}: CardProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const [isFlipped, setIsFlipped] = useState(false);
  const onFlipCompleteRef = useRef(onFlipComplete);

  useEffect(() => {
    onFlipCompleteRef.current = onFlipComplete;
  }, [onFlipComplete]);

  useEffect(() => {
    if (isFlipping && card) {
      const timer = setTimeout(() => {
        setIsFlipped(true);
        audioManager.playSFX('card-flip');
        if (onFlipCompleteRef.current) {
          setTimeout(onFlipCompleteRef.current, 500);
        }
      }, flipDelay);
      return () => clearTimeout(timer);
    } else if (!isFlipping) {
      setIsFlipped(false);
    }
  }, [isFlipping, flipDelay, card]);

  const handleHover = useCallback(() => {
    if (card && !isHidden) {
      audioManager.playSFX('card-hover');
    }
  }, [card, isHidden]);

  // Card back
  const CardBack = () => (
    <div
      className={cn(
        sizeConfig.card,
        'rounded-xl shadow-xl flex items-center justify-center',
        'bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#1a237e]',
        'border border-[#3949ab]',
        'relative overflow-hidden',
      )}
    >
      {/* Pattern overlay */}
      <div className="absolute inset-2 rounded-lg border border-[#3949ab]/50 flex items-center justify-center">
        <div className="w-full h-full relative">
          {/* Diamond pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 6px,
                rgba(255,255,255,0.15) 6px,
                rgba(255,255,255,0.15) 12px
              )`
            }} />
          </div>
          {/* Center emblem - card suit pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[#5c6bc0]/60 text-2xl">♠</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Hidden card
  if ((isHidden || !card) && !isFlipping) {
    return (
      <div
        className={cn('transform transition-all duration-300', className)}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        <CardBack />
      </div>
    );
  }

  // Card front renderer
  const CardFront = ({ cardData }: { cardData: CardType }) => {
    const suitConfig = SUIT_CONFIG[cardData.suit];
    return (
      <div
        className={cn(
          sizeConfig.card,
          'rounded-xl shadow-xl relative overflow-hidden',
          'bg-white',
          'border',
          isHighlighted
            ? 'border-[#00d4ff] ring-2 ring-[#00d4ff]/50 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
            : 'border-gray-200',
        )}
      >
        {/* Top left corner */}
        <div className={cn('absolute flex flex-col items-center leading-tight', sizeConfig.corner)}>
          <span className={cn(sizeConfig.cornerRank, 'font-bold', suitConfig.color)}>
            {cardData.rank}
          </span>
          <span className={cn(sizeConfig.cornerSuit, suitConfig.color, '-mt-0.5')}>
            {suitConfig.symbol}
          </span>
        </div>

        {/* Center suit - large watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(sizeConfig.suit, suitConfig.color, 'drop-shadow-sm')}>
            {suitConfig.symbol}
          </span>
        </div>

        {/* Bottom right corner (rotated) */}
        <div className={cn('absolute flex flex-col items-center leading-tight rotate-180', sizeConfig.cornerBottom)}>
          <span className={cn(sizeConfig.cornerRank, 'font-bold', suitConfig.color)}>
            {cardData.rank}
          </span>
          <span className={cn(sizeConfig.cornerSuit, suitConfig.color, '-mt-0.5')}>
            {suitConfig.symbol}
          </span>
        </div>

        {/* Highlight effect */}
        {isHighlighted && (
          <div className="absolute inset-0 bg-gradient-to-t from-[#00d4ff]/10 to-transparent" />
        )}
      </div>
    );
  };

  // Flipping animation
  if (isFlipping && card) {
    return (
      <div
        className={cn(sizeConfig.card, 'relative', className)}
        style={{
          perspective: '1000px',
          animationDelay: `${animationDelay}ms`
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Back face */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <CardBack />
          </div>

          {/* Front face */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <CardFront cardData={card} />
          </div>
        </div>
      </div>
    );
  }

  // Normal card display
  const cardLabel = `${card!.rank} of ${card!.suit}`;

  return (
    <div
      role="img"
      aria-label={cardLabel}
      tabIndex={0}
      className={cn(
        'transition-all duration-300',
        'hover:shadow-2xl hover:-translate-y-2',
        'focus:outline-none focus:ring-2 focus:ring-[#00d4ff] focus:ring-offset-2 focus:ring-offset-[#0a0e1a]',
        !skipEntryAnimation && 'animate-in slide-in-from-bottom-4 fade-in',
        className
      )}
      style={{ animationDelay: skipEntryAnimation ? undefined : `${animationDelay}ms` }}
      onMouseEnter={handleHover}
    >
      <CardFront cardData={card!} />
    </div>
  );
}

// Empty card slot
export function CardSlot({ size = 'md', className }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        sizeConfig.card,
        'rounded-xl border-2 border-dashed border-[#1a1f35]',
        'bg-[#0f1424]/50',
        'flex items-center justify-center',
        className
      )}
    >
      <span className={cn('text-[#1a1f35]', size === 'xs' ? 'text-xl' : 'text-3xl')}>?</span>
    </div>
  );
}
