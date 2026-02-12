'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getLeaderboard, isSupabaseConfigured, LeaderboardEntry } from '@/lib/supabase';
import { formatChips } from '@/lib/game/chips';
import { useTranslation } from '@/lib/i18n';

interface LeaderboardProps {
  className?: string;
  limit?: number;
  highlightChips?: number;
}

export function Leaderboard({
  className,
  limit = 10,
  highlightChips,
}: LeaderboardProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      if (!isSupabaseConfigured()) {
        setIsLoading(false);
        setError('Leaderboard not available');
        return;
      }

      try {
        const data = await getLeaderboard(limit);
        setEntries(data);
      } catch (err) {
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, [limit]);

  if (!isSupabaseConfigured()) {
    return (
      <div className={cn('game-card p-6 text-center', className)}>
        <p className="text-[#64748b] text-sm">
          {t.leaderboard?.notConfigured || 'Leaderboard not configured'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('game-card p-6', className)}>
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin w-5 h-5 border-2 border-[#00d4ff] border-t-transparent rounded-full" />
          <span className="text-[#64748b]">{t.common.loading}</span>
        </div>
      </div>
    );
  }

  if (error || entries.length === 0) {
    return (
      <div className={cn('game-card p-6 text-center', className)}>
        <p className="text-[#64748b] text-sm">
          {error || t.leaderboard?.noEntries || 'No entries yet'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('game-card overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-[#ffd700] to-[#ffb800] p-4">
        <h3 className="text-lg font-bold text-[#0a0e1a] text-center">
          {t.leaderboard?.title || 'Leaderboard'}
        </h3>
      </div>

      {/* Entries */}
      <div className="divide-y divide-white/5">
        {entries.map((entry, index) => {
          const isHighlighted = highlightChips !== undefined && entry.chips === highlightChips;
          const isTop3 = index < 3;

          return (
            <div
              key={entry.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                isHighlighted && 'bg-[#ffd700]/10',
                !isHighlighted && 'hover:bg-white/5'
              )}
            >
              {/* Rank */}
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                index === 0 && 'bg-[#ffd700] text-[#0a0e1a]',
                index === 1 && 'bg-[#c0c0c0] text-[#0a0e1a]',
                index === 2 && 'bg-[#cd7f32] text-[#0a0e1a]',
                index > 2 && 'bg-[#1a1f35] text-[#64748b]'
              )}>
                {isTop3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'font-semibold truncate',
                    isHighlighted ? 'text-[#ffd700]' : 'text-white'
                  )}>
                    {entry.player_name}
                  </span>
                  {entry.country_code && (
                    <span className="text-xs">{entry.country_code}</span>
                  )}
                </div>
                <span className="text-xs text-[#64748b]">
                  {t.difficulty?.[entry.difficulty_reached as keyof typeof t.difficulty] || entry.difficulty_reached}
                </span>
              </div>

              {/* Chips */}
              <div className="text-right">
                <span className={cn(
                  'font-bold tabular-nums',
                  isTop3 ? 'text-[#ffd700]' : 'text-white'
                )}>
                  {formatChips(entry.chips)}
                </span>
                <span className="text-[#ffd700] ml-1">🪙</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
