'use client';

import { Card as CardType, Suit } from '@/types';
import { cn } from '@/lib/utils';

interface CardProps {
  card?: CardType;
  isHidden?: boolean;
  isHighlighted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animationDelay?: number;
}

// 수트별 색상 및 심볼
const SUIT_CONFIG: Record<Suit, { symbol: string; color: string }> = {
  hearts: { symbol: '♥', color: 'text-red-500' },
  diamonds: { symbol: '♦', color: 'text-red-500' },
  clubs: { symbol: '♣', color: 'text-slate-900' },
  spades: { symbol: '♠', color: 'text-slate-900' },
};

// 크기별 스타일
const SIZE_CONFIG = {
  sm: {
    card: 'w-12 h-16',
    rank: 'text-sm',
    suit: 'text-lg',
    cornerRank: 'text-xs',
    cornerSuit: 'text-xs',
  },
  md: {
    card: 'w-16 h-22',
    rank: 'text-lg',
    suit: 'text-2xl',
    cornerRank: 'text-sm',
    cornerSuit: 'text-sm',
  },
  lg: {
    card: 'w-20 h-28',
    rank: 'text-2xl',
    suit: 'text-4xl',
    cornerRank: 'text-base',
    cornerSuit: 'text-base',
  },
};

export function Card({
  card,
  isHidden = false,
  isHighlighted = false,
  size = 'md',
  className,
  animationDelay = 0,
}: CardProps) {
  const sizeConfig = SIZE_CONFIG[size];

  // 카드 뒷면
  if (isHidden || !card) {
    return (
      <div
        className={cn(
          sizeConfig.card,
          'rounded-lg shadow-lg flex items-center justify-center',
          'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900',
          'border-2 border-blue-700',
          'transform transition-all duration-300',
          className
        )}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* 뒷면 패턴 */}
        <div className="w-3/4 h-3/4 rounded border-2 border-blue-600 flex items-center justify-center">
          <div className="text-blue-500 text-2xl">🂠</div>
        </div>
      </div>
    );
  }

  const suitConfig = SUIT_CONFIG[card.suit];

  return (
    <div
      className={cn(
        sizeConfig.card,
        'rounded-lg shadow-lg relative overflow-hidden',
        'bg-white',
        'border-2',
        isHighlighted ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-200',
        'transform transition-all duration-300 hover:scale-105',
        'animate-in slide-in-from-bottom-2 fade-in',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* 좌상단 */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className={cn(sizeConfig.cornerRank, 'font-bold', suitConfig.color)}>
          {card.rank}
        </span>
        <span className={cn(sizeConfig.cornerSuit, suitConfig.color)}>
          {suitConfig.symbol}
        </span>
      </div>

      {/* 중앙 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn(sizeConfig.suit, suitConfig.color)}>
          {suitConfig.symbol}
        </span>
      </div>

      {/* 우하단 (180도 회전) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className={cn(sizeConfig.cornerRank, 'font-bold', suitConfig.color)}>
          {card.rank}
        </span>
        <span className={cn(sizeConfig.cornerSuit, suitConfig.color)}>
          {suitConfig.symbol}
        </span>
      </div>

      {/* 하이라이트 효과 */}
      {isHighlighted && (
        <div className="absolute inset-0 bg-amber-400/10 animate-pulse" />
      )}
    </div>
  );
}

// 빈 카드 슬롯
export function CardSlot({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        sizeConfig.card,
        'rounded-lg border-2 border-dashed border-slate-600',
        'bg-slate-800/50',
        'flex items-center justify-center',
        className
      )}
    >
      <span className="text-slate-600 text-2xl">?</span>
    </div>
  );
}
