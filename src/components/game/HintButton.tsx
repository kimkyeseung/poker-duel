'use client';

import { useState } from 'react';
import { WinRateResult, Card as CardType } from '@/types';
import { getRangeHint, getDirectionHint, Hint } from '@/lib/game/hints';
import { cn } from '@/lib/utils';

interface HintButtonProps {
  winRateResult: WinRateResult | null;
  playerHand: [CardType, CardType] | null;
  communityCards: CardType[];
  disabled?: boolean;
  onHintUsed?: () => void;
}

export function HintButton({
  winRateResult,
  playerHand,
  communityCards,
  disabled = false,
  onHintUsed,
}: HintButtonProps) {
  const [hint, setHint] = useState<Hint | null>(null);
  const [hintUsed, setHintUsed] = useState(false);

  const handleUseHint = () => {
    if (disabled || hintUsed || !winRateResult) return;

    // 힌트 생성 (범위 힌트 사용)
    const newHint = getRangeHint(winRateResult.playerWinRate);
    setHint(newHint);
    setHintUsed(true);
    onHintUsed?.();
  };

  if (hintUsed && hint) {
    return (
      <div className="bg-[#ffd700]/10 border border-[#ffd700]/30 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#ffd700]/20 flex items-center justify-center text-[#ffd700] text-sm font-bold">
            H
          </span>
          <span className="text-[#ffd700] text-sm">{hint.message}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleUseHint}
      disabled={disabled || !winRateResult}
      className={cn(
        'px-4 py-2 rounded-full border transition-all text-sm',
        'flex items-center gap-2',
        disabled || !winRateResult
          ? 'border-white/10 text-[#64748b] cursor-not-allowed'
          : 'border-[#ffd700]/50 text-[#ffd700] hover:bg-[#ffd700]/10'
      )}
    >
      <span className="w-5 h-5 rounded-full bg-[#ffd700]/20 flex items-center justify-center text-xs font-bold">
        ?
      </span>
      <span>Use Hint</span>
    </button>
  );
}
