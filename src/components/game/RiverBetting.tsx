'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { ChipDisplay } from './ChipDisplay';
import {
  calculateOdds,
  formatOdds,
  formatChips,
  calculateExpectedPayout,
} from '@/lib/game/chips';
import { useTranslation } from '@/lib/i18n';

interface RiverBettingProps {
  chips: number;
  playerWinRate: number;
  onBet: (amount: number) => void;
  onSkip: () => void;
  disabled?: boolean;
  className?: string;
}

export function RiverBetting({
  chips,
  playerWinRate,
  onBet,
  onSkip,
  disabled = false,
  className,
}: RiverBettingProps) {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState<number>(0);
  const [isAllIn, setIsAllIn] = useState(false);

  const odds = calculateOdds(playerWinRate);
  const expectedPayout = calculateExpectedPayout(betAmount, odds);
  const potentialProfit = expectedPayout - betAmount;

  const handleBetChange = useCallback((value: number) => {
    const clampedValue = Math.min(Math.max(0, value), chips);
    setBetAmount(clampedValue);
    setIsAllIn(clampedValue === chips && chips > 0);
  }, [chips]);

  const handleAllIn = useCallback(() => {
    setBetAmount(chips);
    setIsAllIn(true);
  }, [chips]);

  const handleQuickBet = useCallback((percentage: number) => {
    const amount = Math.floor(chips * percentage);
    setBetAmount(amount);
    setIsAllIn(percentage === 1);
  }, [chips]);

  const handleSubmit = useCallback(() => {
    if (betAmount > 0) {
      onBet(betAmount);
    }
  }, [betAmount, onBet]);

  const canBet = chips > 0 && betAmount > 0;

  return (
    <div className={cn('game-card p-4 sm:p-6', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">
          {t.game.betting?.title || '리버 배팅'}
        </h3>
        <ChipDisplay chips={chips} size="sm" />
      </div>

      {/* 배당률 정보 */}
      <div className="bg-[#1a1f35] rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#94a3b8] text-sm">
            {t.game.betting?.odds || '배당률'}
          </span>
          <span className="text-[#ffd700] font-bold text-xl">
            {formatOdds(odds)}
          </span>
        </div>
        <p className="text-[#64748b] text-xs">
          {t.game.betting?.oddsDescription || '승률이 낮을수록 배당률이 높습니다'}
        </p>
      </div>

      {/* 배팅 금액 입력 */}
      <div className="mb-4">
        <label className="block text-[#94a3b8] text-sm mb-2">
          {t.game.betting?.amount || '배팅 금액'}
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max={chips}
            value={betAmount || ''}
            onChange={(e) => handleBetChange(Number(e.target.value))}
            disabled={disabled || chips === 0}
            placeholder="0"
            className={cn(
              'w-full px-4 py-3 text-xl font-bold text-center',
              'bg-[#1a1f35] border-2 rounded-xl',
              'text-white placeholder:text-[#64748b]',
              'transition-all duration-200',
              'focus:outline-none focus:border-[#ffd700] focus:shadow-[0_0_20px_rgba(255,215,0,0.2)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              isAllIn ? 'border-[#ff4444]' : 'border-[#1a1f35]'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ffd700]">
            🪙
          </span>
        </div>
      </div>

      {/* 퀵 배팅 버튼 */}
      <div className="flex gap-2 mb-4">
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <button
            key={pct}
            onClick={() => handleQuickBet(pct)}
            disabled={disabled || chips === 0}
            className={cn(
              'flex-1 py-2 rounded-lg text-sm font-bold',
              'transition-all duration-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              pct === 1
                ? 'bg-[#ff4444] text-white hover:bg-[#ff6666]'
                : 'bg-[#1a1f35] text-[#94a3b8] hover:bg-[#2a2f45] hover:text-white'
            )}
          >
            {pct === 1 ? 'ALL IN' : `${pct * 100}%`}
          </button>
        ))}
      </div>

      {/* 예상 수익 */}
      {betAmount > 0 && (
        <div className="bg-[#0f1424] rounded-xl p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[#64748b] text-sm">
              {t.game.betting?.expectedPayout || '예상 수익 (승리 시)'}
            </span>
            <span className="text-[#00ff88] font-bold">
              +{formatChips(potentialProfit)}
            </span>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={onSkip}
          disabled={disabled}
          className="flex-1"
        >
          {t.game.betting?.skip || '스킵'}
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleSubmit}
          disabled={disabled || !canBet}
          className={cn(
            'flex-1',
            isAllIn && 'bg-gradient-to-r from-[#ff4444] to-[#ff0000]'
          )}
        >
          {isAllIn
            ? 'ALL IN!'
            : t.game.betting?.bet || '배팅'}
        </Button>
      </div>

      {/* 칩 없음 경고 */}
      {chips === 0 && (
        <p className="text-[#ff4444] text-sm text-center mt-3">
          {t.game.betting?.noChips || '배팅할 칩이 없습니다'}
        </p>
      )}
    </div>
  );
}
