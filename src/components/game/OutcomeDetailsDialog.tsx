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

// Matchup Detail Dialog - shows all cards for a specific matchup
function MatchupDetailDialog({
  isOpen,
  onClose,
  matchup,
  outcomes,
  playerHand,
  computerHand,
  communityCards,
  t,
}: {
  isOpen: boolean;
  onClose: () => void;
  matchup: MatchupBreakdown;
  outcomes: OutcomeCard[];
  playerHand?: [CardType, CardType];
  computerHand?: [CardType, CardType];
  communityCards?: CardType[];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [activeTab, setActiveTab] = useState<'win' | 'tie' | 'loss'>('win');

  // Calculate needed cards
  const neededCards = communityCards ? 5 - communityCards.length : 2;

  if (!isOpen) return null;

  // Filter outcomes for this matchup
  const matchedOutcomes = outcomes.filter(
    (o) =>
      o.playerHandRank === matchup.playerRank &&
      o.computerHandRank === matchup.computerRank
  );

  const winOutcomes = matchedOutcomes.filter((o) => o.outcome === 'win');
  const tieOutcomes = matchedOutcomes.filter((o) => o.outcome === 'tie');
  const lossOutcomes = matchedOutcomes.filter((o) => o.outcome === 'loss');

  // Set default tab based on available outcomes
  const defaultTab = winOutcomes.length > 0 ? 'win' : lossOutcomes.length > 0 ? 'loss' : 'tie';
  const currentTab = activeTab === 'win' && winOutcomes.length === 0
    ? (lossOutcomes.length > 0 ? 'loss' : 'tie')
    : activeTab === 'loss' && lossOutcomes.length === 0
    ? (winOutcomes.length > 0 ? 'win' : 'tie')
    : activeTab === 'tie' && tieOutcomes.length === 0
    ? defaultTab
    : activeTab;

  const currentOutcomes = currentTab === 'win' ? winOutcomes : currentTab === 'tie' ? tieOutcomes : lossOutcomes;

  const tabs = [
    { key: 'win' as const, label: t.outcomeAnalysis.winningCards || '이기는 카드', count: winOutcomes.length, color: 'text-[#00d4ff]', bg: 'bg-[#00d4ff]' },
    { key: 'tie' as const, label: t.outcomeAnalysis.tieCards || '무승부 카드', count: tieOutcomes.length, color: 'text-[#64748b]', bg: 'bg-[#64748b]' },
    { key: 'loss' as const, label: t.outcomeAnalysis.losingCards || '지는 카드', count: lossOutcomes.length, color: 'text-[#ff4d94]', bg: 'bg-[#ff4d94]' },
  ].filter(tab => tab.count > 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl max-h-[80vh] m-4 bg-[#0a0e1a] rounded-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#00d4ff]">{getHandRankName(matchup.playerRank, t)}</span>
              <span className="text-[#64748b] text-sm">vs</span>
              <span className="text-[#ff4d94]">{getHandRankName(matchup.computerRank, t)}</span>
            </h2>
            <div className="text-xs text-[#64748b] mt-1">
              {t.outcomeAnalysis.allCombinations || '전체 경우의 수'}: {matchup.total}
            </div>
          </div>
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

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex-1 px-4 py-3 text-sm font-medium transition-colors relative',
                currentTab === tab.key
                  ? tab.color
                  : 'text-[#64748b] hover:text-white'
              )}
            >
              {tab.label} ({tab.count})
              {currentTab === tab.key && (
                <div className={cn('absolute bottom-0 left-0 right-0 h-0.5', tab.bg)} />
              )}
            </button>
          ))}
        </div>

        {/* Table Context - Fixed */}
        <div className="px-4 pt-4 pb-2 border-b border-white/10">
          <TableContextSection
            playerHand={playerHand}
            computerHand={computerHand}
            communityCards={communityCards}
            neededCards={neededCards}
            t={t}
          />
        </div>

        {/* Card Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {currentOutcomes.map((outcome, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex gap-0.5 p-2 rounded-lg justify-center',
                  currentTab === 'win' && 'bg-[#00d4ff]/10',
                  currentTab === 'tie' && 'bg-[#64748b]/10',
                  currentTab === 'loss' && 'bg-[#ff4d94]/10'
                )}
              >
                {outcome.cards.map((card, cardIdx) => (
                  <CardComponent
                    key={cardIdx}
                    card={card}
                    size="xs"
                    skipEntryAnimation
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Matchup Card Display - shows actual cards for a matchup
function MatchupCardDisplay({
  outcomes,
  matchup,
  playerHand,
  computerHand,
  communityCards,
  t,
}: {
  outcomes: OutcomeCard[];
  matchup: MatchupBreakdown;
  playerHand?: [CardType, CardType];
  computerHand?: [CardType, CardType];
  communityCards?: CardType[];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filter outcomes that match this specific matchup
  const matchedOutcomes = outcomes.filter(
    (o) =>
      o.playerHandRank === matchup.playerRank &&
      o.computerHandRank === matchup.computerRank
  );

  // Group by outcome type
  const winOutcomes = matchedOutcomes.filter((o) => o.outcome === 'win');
  const tieOutcomes = matchedOutcomes.filter((o) => o.outcome === 'tie');
  const lossOutcomes = matchedOutcomes.filter((o) => o.outcome === 'loss');

  // Show up to 6 sample cards per outcome type
  const maxSamples = 6;

  const renderCardSamples = (
    items: OutcomeCard[],
    label: string,
    colorClass: string,
    bgClass: string
  ) => {
    if (items.length === 0) return null;
    const samples = items.slice(0, maxSamples);
    const remaining = items.length - maxSamples;

    return (
      <div className="mb-3 last:mb-0">
        <div className={cn('text-xs font-medium mb-2', colorClass)}>
          {label} ({items.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {samples.map((outcome, idx) => (
            <div
              key={idx}
              className={cn(
                'flex gap-0.5 p-1.5 rounded-lg',
                bgClass
              )}
            >
              {outcome.cards.map((card, cardIdx) => (
                <CardComponent
                  key={cardIdx}
                  card={card}
                  size="xs"
                  skipEntryAnimation
                />
              ))}
            </div>
          ))}
          {remaining > 0 && (
            <button
              onClick={() => setDetailDialogOpen(true)}
              className={cn(
                'flex items-center px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                'bg-white/5 hover:bg-white/10',
                colorClass
              )}
            >
              +{remaining} {t.outcomeAnalysis.viewAll || '전체 보기'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-[#0f1424] rounded-lg p-3 mt-2">
        {renderCardSamples(
          winOutcomes,
          t.outcomeAnalysis.winningCards || '이기는 카드',
          'text-[#00d4ff]',
          'bg-[#00d4ff]/10'
        )}
        {renderCardSamples(
          tieOutcomes,
          t.outcomeAnalysis.tieCards || '무승부 카드',
          'text-[#64748b]',
          'bg-[#64748b]/10'
        )}
        {renderCardSamples(
          lossOutcomes,
          t.outcomeAnalysis.losingCards || '지는 카드',
          'text-[#ff4d94]',
          'bg-[#ff4d94]/10'
        )}
      </div>

      {/* Detail Dialog */}
      <MatchupDetailDialog
        isOpen={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        matchup={matchup}
        outcomes={outcomes}
        playerHand={playerHand}
        computerHand={computerHand}
        communityCards={communityCards}
        t={t}
      />
    </>
  );
}

// Matchup Breakdown Table
function MatchupBreakdownTable({
  matchups,
  outcomes,
  total,
  playerHand,
  computerHand,
  communityCards,
  t,
}: {
  matchups?: MatchupBreakdown[];
  outcomes: OutcomeCard[];
  total: number;
  playerHand?: [CardType, CardType];
  computerHand?: [CardType, CardType];
  communityCards?: CardType[];
  t: ReturnType<typeof useTranslation>['t'];
}) {
  const [showAll, setShowAll] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  if (!matchups || matchups.length === 0) return null;

  // Filter out insignificant matchups and sort by total
  const significantMatchups = matchups.filter((m) => (m.total / total) * 100 >= 0.5);
  const displayMatchups = showAll
    ? significantMatchups
    : significantMatchups.slice(0, 10);

  const handleRowClick = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  return (
    <div className="bg-[#1a1f35] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-3">
        {t.outcomeAnalysis.matchupAnalysis}
      </h3>
      <div className="text-xs text-[#64748b] mb-3">
        {t.outcomeAnalysis.clickToSeeCards || '클릭하여 카드 조합 보기'}
      </div>
      <div className="space-y-1">
        {displayMatchups.map((matchup, i) => {
          const isExpanded = expandedRow === i;
          const freqPct = (matchup.total / total) * 100;

          return (
            <div key={i}>
              <button
                onClick={() => handleRowClick(i)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left',
                  isExpanded
                    ? 'bg-[#252b45]'
                    : 'bg-[#0f1424] hover:bg-[#1a1f35]'
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[#00d4ff] text-sm font-medium truncate">
                    {getHandRankName(matchup.playerRank, t)}
                  </span>
                  <span className="text-[#64748b] text-xs">vs</span>
                  <span className="text-[#ff4d94] text-sm font-medium truncate">
                    {getHandRankName(matchup.computerRank, t)}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-[#64748b] tabular-nums">
                    {matchup.total}회 ({freqPct.toFixed(1)}%)
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {matchup.wins > 0 && (
                      <span className="text-[#00d4ff]">{matchup.wins}W</span>
                    )}
                    {matchup.ties > 0 && (
                      <span className="text-[#64748b]">{matchup.ties}T</span>
                    )}
                    {matchup.losses > 0 && (
                      <span className="text-[#ff4d94]">{matchup.losses}L</span>
                    )}
                  </div>
                  <svg
                    className={cn(
                      'w-4 h-4 text-[#64748b] transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              {isExpanded && (
                <MatchupCardDisplay
                  outcomes={outcomes}
                  matchup={matchup}
                  playerHand={playerHand}
                  computerHand={computerHand}
                  communityCards={communityCards}
                  t={t}
                />
              )}
            </div>
          );
        })}
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
            outcomes={outcomes}
            total={total}
            playerHand={playerHand}
            computerHand={computerHand}
            communityCards={communityCards}
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
