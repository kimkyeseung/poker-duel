'use client';

import { useState, useMemo } from 'react';
import { Card as CardComponent, CardSlot } from './Card';
import {
  OutcomeCard,
  Card as CardType,
  HandRank,
  HandDistribution,
  MatchupBreakdown,
} from '@/types';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface OutcomeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  outcomes: OutcomeCard[];
  winCount: number;
  tieCount: number;
  lossCount: number;
  // New props for context
  playerHand?: [CardType, CardType];
  computerHand?: [CardType, CardType];
  communityCards?: CardType[];
  playerHandDistribution?: HandDistribution;
  computerHandDistribution?: HandDistribution;
  matchupBreakdowns?: MatchupBreakdown[];
}

// Helper to get hand rank name
function getHandRankName(
  rank: HandRank,
  t: ReturnType<typeof useTranslation>['t']
): string {
  const names: Record<HandRank, string> = {
    [HandRank.ROYAL_FLUSH]: t.handRanks.royalFlush,
    [HandRank.STRAIGHT_FLUSH]: t.handRanks.straightFlush,
    [HandRank.FOUR_OF_A_KIND]: t.handRanks.fourOfAKind,
    [HandRank.FULL_HOUSE]: t.handRanks.fullHouse,
    [HandRank.FLUSH]: t.handRanks.flush,
    [HandRank.STRAIGHT]: t.handRanks.straight,
    [HandRank.THREE_OF_A_KIND]: t.handRanks.threeOfAKind,
    [HandRank.TWO_PAIR]: t.handRanks.twoPair,
    [HandRank.ONE_PAIR]: t.handRanks.onePair,
    [HandRank.HIGH_CARD]: t.handRanks.highCard,
  };
  return names[rank] || `Rank ${rank}`;
}

// Table Context Section
function TableContextSection({
  playerHand,
  computerHand,
  communityCards,
  neededCards,
  t,
}: {
  playerHand?: [CardType, CardType];
  computerHand?: [CardType, CardType];
  communityCards?: CardType[];
  neededCards: number;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  return (
    <div className="bg-[#1a1f35] rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
        {t.outcomeAnalysis.tableContext}
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Player Hand */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-[#00d4ff] mb-2 font-medium">
            {t.outcomeAnalysis.yourHand}
          </div>
          <div className="flex gap-1">
            {playerHand ? (
              playerHand.map((card, i) => (
                <CardComponent key={i} card={card} size="xs" skipEntryAnimation />
              ))
            ) : (
              <>
                <CardSlot size="xs" />
                <CardSlot size="xs" />
              </>
            )}
          </div>
        </div>

        {/* Community Cards */}
        <div className="flex flex-col items-center flex-1">
          <div className="text-xs text-[#64748b] mb-2 font-medium">
            {t.outcomeAnalysis.communityCards}
          </div>
          <div className="flex gap-1 flex-wrap justify-center">
            {communityCards?.map((card, i) => (
              <CardComponent key={i} card={card} size="xs" skipEntryAnimation />
            ))}
            {/* Empty slots for remaining cards */}
            {Array.from({ length: neededCards }).map((_, i) => (
              <CardSlot key={`empty-${i}`} size="xs" />
            ))}
          </div>
          {neededCards > 0 && (
            <div className="text-xs text-[#64748b] mt-1">
              {neededCards} {t.outcomeAnalysis.remaining}
            </div>
          )}
        </div>

        {/* Computer Hand */}
        <div className="flex flex-col items-center">
          <div className="text-xs text-[#ff4d94] mb-2 font-medium">
            {t.outcomeAnalysis.dealerHand}
          </div>
          <div className="flex gap-1">
            {computerHand ? (
              computerHand.map((card, i) => (
                <CardComponent key={i} card={card} size="xs" skipEntryAnimation />
              ))
            ) : (
              <>
                <CardSlot size="xs" />
                <CardSlot size="xs" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hand Distribution Chart
function HandDistributionChart({
  playerDist,
  computerDist,
  total,
  t,
}: {
  playerDist?: HandDistribution;
  computerDist?: HandDistribution;
  total: number;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  if (!playerDist || !computerDist || total === 0) return null;

  // Get ranks that have non-zero values (sorted by rank descending)
  const activeRanks = Object.keys(playerDist)
    .map(Number)
    .filter((rank) => (playerDist[rank] || 0) > 0 || (computerDist[rank] || 0) > 0)
    .sort((a, b) => b - a);

  if (activeRanks.length === 0) return null;

  return (
    <div className="bg-[#1a1f35] rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
        {t.outcomeAnalysis.handDistribution}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Distribution */}
        <div>
          <div className="text-xs text-[#00d4ff] mb-2 font-medium text-center">
            {t.outcomeAnalysis.yourHand}
          </div>
          <div className="space-y-1.5">
            {activeRanks.map((rank) => {
              const count = playerDist[rank] || 0;
              const percent = (count / total) * 100;
              if (percent < 0.1) return null;
              return (
                <div key={rank} className="flex items-center gap-2">
                  <div className="w-20 text-xs text-[#94a3b8] truncate">
                    {getHandRankName(rank as HandRank, t)}
                  </div>
                  <div className="flex-1 h-4 bg-[#0f1424] rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] rounded"
                      style={{ width: `${Math.max(percent, 1)}%` }}
                    />
                  </div>
                  <div className="w-14 text-xs text-[#00d4ff] text-right tabular-nums">
                    {percent.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Computer Distribution */}
        <div>
          <div className="text-xs text-[#ff4d94] mb-2 font-medium text-center">
            {t.outcomeAnalysis.dealerHand}
          </div>
          <div className="space-y-1.5">
            {activeRanks.map((rank) => {
              const count = computerDist[rank] || 0;
              const percent = (count / total) * 100;
              if (percent < 0.1) return null;
              return (
                <div key={rank} className="flex items-center gap-2">
                  <div className="w-20 text-xs text-[#94a3b8] truncate">
                    {getHandRankName(rank as HandRank, t)}
                  </div>
                  <div className="flex-1 h-4 bg-[#0f1424] rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#ff4d94] to-[#ff0080] rounded"
                      style={{ width: `${Math.max(percent, 1)}%` }}
                    />
                  </div>
                  <div className="w-14 text-xs text-[#ff4d94] text-right tabular-nums">
                    {percent.toFixed(1)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Matchup Breakdown Table
function MatchupBreakdownTable({
  matchups,
  total,
  t,
}: {
  matchups?: MatchupBreakdown[];
  total: number;
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showAll, setShowAll] = useState(false);

  if (!matchups || matchups.length === 0) return null;

  // Filter out insignificant matchups and sort by total
  const significantMatchups = matchups.filter((m) => (m.total / total) * 100 >= 0.5);
  const displayMatchups = showAll
    ? significantMatchups
    : significantMatchups.slice(0, 10);

  return (
    <div className="bg-[#1a1f35] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
        {t.outcomeAnalysis.matchupAnalysis}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#64748b] text-xs uppercase">
              <th className="text-left py-2 pr-2">{t.outcomeAnalysis.yourHand}</th>
              <th className="text-center py-2 px-2">{t.game.labels.vs}</th>
              <th className="text-left py-2 px-2">{t.outcomeAnalysis.dealerHand}</th>
              <th className="text-right py-2 px-1 text-[#00d4ff]">{t.results.win}</th>
              <th className="text-right py-2 px-1 text-[#64748b]">{t.results.ties}</th>
              <th className="text-right py-2 pl-1"  style={{ color: '#ff4d94' }}>{t.results.loss}</th>
            </tr>
          </thead>
          <tbody>
            {displayMatchups.map((matchup, i) => {
              const winPct = (matchup.wins / matchup.total) * 100;
              const tiePct = (matchup.ties / matchup.total) * 100;
              const lossPct = (matchup.losses / matchup.total) * 100;
              const freqPct = (matchup.total / total) * 100;

              return (
                <tr
                  key={i}
                  className="border-t border-[#0f1424] hover:bg-[#252b45]/50 transition-colors"
                >
                  <td className="py-2 pr-2">
                    <span className="text-[#00d4ff]">
                      {getHandRankName(matchup.playerRank, t)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-center text-[#64748b]">vs</td>
                  <td className="py-2 px-2">
                    <span className="text-[#ff4d94]">
                      {getHandRankName(matchup.computerRank, t)}
                    </span>
                  </td>
                  <td className="py-2 px-1 text-right tabular-nums">
                    <span
                      className={cn(
                        'font-medium',
                        winPct > 50 ? 'text-[#00d4ff]' : 'text-[#64748b]'
                      )}
                    >
                      {winPct.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-2 px-1 text-right tabular-nums text-[#64748b]">
                    {tiePct > 0 ? `${tiePct.toFixed(0)}%` : '-'}
                  </td>
                  <td className="py-2 pl-1 text-right tabular-nums">
                    <span
                      className={cn(
                        'font-medium',
                        lossPct > 50 ? 'text-[#ff4d94]' : 'text-[#64748b]'
                      )}
                    >
                      {lossPct.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show More / Show Less */}
      {significantMatchups.length > 10 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-[#64748b] hover:text-white transition-colors"
          >
            {showAll ? t.outcomeAnalysis.showLess : t.outcomeAnalysis.showMore} ({significantMatchups.length})
          </button>
        </div>
      )}
    </div>
  );
}

export function OutcomeDetailsDialog({
  isOpen,
  onClose,
  outcomes,
  winCount,
  tieCount,
  lossCount,
  playerHand,
  computerHand,
  communityCards,
  playerHandDistribution,
  computerHandDistribution,
  matchupBreakdowns,
}: OutcomeDetailsDialogProps) {
  const { t } = useTranslation();

  // Calculate needed cards
  const neededCards = communityCards ? 5 - communityCards.length : 2;
  const total = outcomes.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full h-full max-w-3xl max-h-[90vh] m-4 bg-[#0a0e1a] rounded-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {t.outcomeAnalysis.title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0f1424] rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#00d4ff] tabular-nums">
                {winCount.toLocaleString()}
              </div>
              <div className="text-xs text-[#64748b] uppercase">{t.results.win}</div>
            </div>
            <div className="bg-[#0f1424] rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#64748b] tabular-nums">
                {tieCount.toLocaleString()}
              </div>
              <div className="text-xs text-[#64748b] uppercase">{t.results.ties}</div>
            </div>
            <div className="bg-[#0f1424] rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#ff4d94] tabular-nums">
                {lossCount.toLocaleString()}
              </div>
              <div className="text-xs text-[#64748b] uppercase">{t.results.loss}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Table Context */}
          <TableContextSection
            playerHand={playerHand}
            computerHand={computerHand}
            communityCards={communityCards}
            neededCards={neededCards}
            t={t}
          />

          {/* Hand Distribution */}
          <HandDistributionChart
            playerDist={playerHandDistribution}
            computerDist={computerHandDistribution}
            total={total}
            t={t}
          />

          {/* Matchup Analysis */}
          <MatchupBreakdownTable
            matchups={matchupBreakdowns}
            total={total}
            t={t}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 text-center text-sm text-[#64748b]">
          {t.results.totalCombinations}: {total.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
