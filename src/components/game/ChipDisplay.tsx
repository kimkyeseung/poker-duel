'use client';

import { cn } from '@/lib/utils';
import { formatChips } from '@/lib/game/chips';

interface ChipDisplayProps {
  chips: number;
  lastReward?: number | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ChipDisplay({
  chips,
  lastReward,
  className,
  size = 'md',
}: ChipDisplayProps) {

  const sizes = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full font-bold',
        'bg-gradient-to-r from-[#ffd700] to-[#ffb800]',
        'text-[#0a0e1a] shadow-lg shadow-[#ffd700]/20',
        sizes[size],
        className
      )}
    >
      <span className="text-lg">🪙</span>
      <span className="tabular-nums">{formatChips(chips)}</span>
      {lastReward && lastReward > 0 && (
        <span className="text-[#00ff88] text-sm animate-bounce-in">
          +{formatChips(lastReward)}
        </span>
      )}
    </div>
  );
}
