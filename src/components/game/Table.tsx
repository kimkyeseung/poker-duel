'use client';

import { Card as CardType } from '@/types';
import { Card, CardSlot } from './Card';
import { cn } from '@/lib/utils';

interface TableProps {
  communityCards: CardType[];
  className?: string;
}

export function Table({ communityCards, className }: TableProps) {
  // 5개의 커뮤니티 카드 슬롯
  const slots = Array(5).fill(null);

  return (
    <div className={cn('relative', className)}>
      {/* 테이블 배경 */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-800 to-emerald-900 rounded-[100px] shadow-2xl border-8 border-amber-900/50" />

      {/* 테이블 펠트 텍스처 */}
      <div className="absolute inset-2 bg-emerald-700 rounded-[90px] opacity-50" style={{
        backgroundImage: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.1) 20%)',
        backgroundSize: '10px 10px',
      }} />

      {/* 커뮤니티 카드 영역 */}
      <div className="relative z-10 flex items-center justify-center py-8 px-4">
        <div className="flex gap-2 md:gap-3">
          {slots.map((_, index) => (
            <div key={index} className="transform transition-all duration-500">
              {communityCards[index] ? (
                <Card
                  card={communityCards[index]}
                  size="lg"
                  animationDelay={index * 100}
                />
              ) : (
                <CardSlot size="lg" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 라운드 표시 */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <RoundIndicator cardCount={communityCards.length} />
      </div>
    </div>
  );
}

// 라운드 표시기
function RoundIndicator({ cardCount }: { cardCount: number }) {
  const rounds = [
    { name: '프리플랍', count: 0 },
    { name: '플랍', count: 3 },
    { name: '턴', count: 4 },
    { name: '리버', count: 5 },
  ];

  const currentRound = rounds.reduce((prev, curr) => {
    if (cardCount >= curr.count) return curr;
    return prev;
  }, rounds[0]);

  return (
    <div className="flex items-center gap-1 bg-slate-900/80 px-3 py-1 rounded-full">
      {rounds.map((round, index) => (
        <div key={round.name} className="flex items-center">
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              cardCount >= round.count
                ? 'bg-amber-500'
                : 'bg-slate-600'
            )}
          />
          {index < rounds.length - 1 && (
            <div
              className={cn(
                'w-4 h-0.5 transition-all',
                cardCount > round.count
                  ? 'bg-amber-500'
                  : 'bg-slate-600'
              )}
            />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-amber-400 font-semibold">
        {currentRound.name}
      </span>
    </div>
  );
}
