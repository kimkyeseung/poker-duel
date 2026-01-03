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
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{hint.icon}</span>
          <span className="text-amber-400 text-sm">{hint.message}</span>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleUseHint}
      disabled={disabled || !winRateResult}
      className={cn(
        'px-4 py-2 rounded-lg border transition-all text-sm',
        'flex items-center gap-2',
        disabled || !winRateResult
          ? 'border-slate-700 text-slate-600 cursor-not-allowed'
          : 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10'
      )}
    >
      <span>💡</span>
      <span>힌트 사용</span>
    </button>
  );
}
