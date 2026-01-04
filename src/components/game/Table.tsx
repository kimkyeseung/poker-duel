'use client';

import { Card as CardType } from '@/types';
import { Card, CardSlot } from './Card';
import { cn } from '@/lib/utils';

interface TableProps {
  communityCards: CardType[];
  className?: string;
  isRevealing?: boolean; // 카드 공개 애니메이션 중
  newCardsCount?: number; // 새로 공개되는 카드 수 (flop: 3, turn/river: 1)
  onRevealComplete?: () => void; // 모든 카드 공개 완료 콜백
}

export function Table({
  communityCards,
  className,
  isRevealing = false,
  newCardsCount = 0,
  onRevealComplete,
}: TableProps) {
  // 5개의 커뮤니티 카드 슬롯
  const slots = Array(5).fill(null);

  // 이전에 공개된 카드 수
  const previousCardCount = communityCards.length - newCardsCount;

  // 마지막 카드 공개 완료 시 콜백 호출
  const handleLastCardFlipComplete = () => {
    if (onRevealComplete) {
      onRevealComplete();
    }
  };

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
          {slots.map((_, index) => {
            const card = communityCards[index];
            const isNewCard = isRevealing && index >= previousCardCount && index < communityCards.length;
            const isLastNewCard = isNewCard && index === communityCards.length - 1;
            const flipDelayIndex = index - previousCardCount;

            return (
              <div key={index} className="transform transition-all duration-500">
                {card ? (
                  isNewCard ? (
                    // 새로 공개되는 카드 (뒤집기 애니메이션)
                    <Card
                      card={card}
                      size="lg"
                      isFlipping={true}
                      flipDelay={flipDelayIndex * 400} // 0.4초 간격으로 순차 공개
                      onFlipComplete={isLastNewCard ? handleLastCardFlipComplete : undefined}
                    />
                  ) : (
                    // 이미 공개된 카드
                    <Card
                      card={card}
                      size="lg"
                    />
                  )
                ) : (
                  <CardSlot size="lg" />
                )}
              </div>
            );
          })}
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
    <div
      className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-700"
      role="status"
      aria-label={`현재 라운드: ${currentRound.name}`}
    >
      {rounds.map((round, index) => (
        <div key={round.name} className="flex items-center">
          <div
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              cardCount >= round.count
                ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                : 'bg-slate-600'
            )}
            aria-hidden="true"
          />
          {index < rounds.length - 1 && (
            <div
              className={cn(
                'w-4 h-0.5 transition-all duration-300',
                cardCount > round.count
                  ? 'bg-amber-500'
                  : 'bg-slate-600'
              )}
              aria-hidden="true"
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
