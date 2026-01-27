'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import { DifficultyBadge } from '@/components/game';
import { getGameStats } from '@/lib/storage';
import {
  getUnlockedTitles,
  getCurrentTitle,
  TITLES,
  TitleDefinition,
} from '@/lib/game/titles';
import {
  getUnlockedAchievements,
  getAchievementProgress,
  ACHIEVEMENTS,
  AchievementDefinition,
} from '@/lib/game/achievements';
import { GameStats, Difficulty, DIFFICULTY_CONFIG, initialGameStats } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'titles' | 'achievements' | 'history';

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<GameStats>(initialGameStats);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    setStats(getGameStats());
  }, []);

  const currentTitle = getCurrentTitle(stats);
  const unlockedTitles = getUnlockedTitles(stats);
  const unlockedAchievements = getUnlockedAchievements(stats);
  const achievementProgress = getAchievementProgress(stats);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '1' },
    { id: 'titles', label: 'Titles', icon: '2' },
    { id: 'achievements', label: 'Achievements', icon: '3' },
    { id: 'history', label: 'History', icon: '4' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-white/5 glass">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-[#64748b] hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>
          <div className="text-[#00d4ff] font-bold text-lg">STATISTICS</div>
          <div className="w-16" />
        </div>
      </header>

      {/* 탭 */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'text-[#00d4ff] border-b-2 border-[#00d4ff]'
                    : 'text-[#64748b] hover:text-white'
                )}
              >
                <span className="mr-2 w-5 h-5 inline-flex items-center justify-center rounded-full bg-white/10 text-xs">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'overview' && (
            <OverviewTab stats={stats} currentTitle={currentTitle} achievementProgress={achievementProgress} />
          )}
          {activeTab === 'titles' && (
            <TitlesTab unlockedTitles={unlockedTitles} currentTitle={currentTitle} />
          )}
          {activeTab === 'achievements' && (
            <AchievementsTab unlockedAchievements={unlockedAchievements} stats={stats} />
          )}
          {activeTab === 'history' && (
            <HistoryTab stats={stats} />
          )}
        </div>
      </main>
    </div>
  );
}

// 개요 탭
function OverviewTab({
  stats,
  currentTitle,
  achievementProgress,
}: {
  stats: GameStats;
  currentTitle: TitleDefinition;
  achievementProgress: { unlocked: number; total: number; percentage: number };
}) {
  const winRate = stats.totalGames > 0 ? (stats.totalWins / stats.totalGames) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 현재 칭호 */}
      <div className="bg-gradient-to-r from-[#ffd700]/10 to-[#ff4d94]/10 rounded-2xl p-6 border border-[#ffd700]/30 text-center">
        <div className="text-4xl mb-2">{currentTitle.icon}</div>
        <div className="text-xl font-bold text-white">{currentTitle.name}</div>
        <div className="text-sm text-[#64748b] mt-1">{currentTitle.description}</div>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Games" value={stats.totalGames} icon="G" />
        <StatCard label="Wins" value={stats.totalWins} icon="W" color="text-[#00ff88]" />
        <StatCard label="Losses" value={stats.totalLosses} icon="L" color="text-[#ff4444]" />
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} icon="%" color="text-[#00d4ff]" />
      </div>

      {/* 연승 기록 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="game-card p-4">
          <div className="text-sm text-[#64748b] mb-1">Best Streak</div>
          <div className="text-3xl font-bold text-[#ffd700]">{stats.maxStreak}</div>
        </div>
        <div className="game-card p-4">
          <div className="text-sm text-[#64748b] mb-1">Current Streak</div>
          <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
        </div>
      </div>

      {/* 난이도별 통계 */}
      <div className="game-card p-4">
        <h3 className="text-sm text-[#64748b] mb-4">Difficulty Clears</h3>
        <div className="space-y-3">
          {(Object.keys(stats.difficultyStats) as Difficulty[]).map((diff) => {
            const { played, cleared } = stats.difficultyStats[diff];
            const rate = played > 0 ? (cleared / played) * 100 : 0;
            return (
              <div key={diff} className="flex items-center gap-3">
                <DifficultyBadge difficulty={diff} size="sm" />
                <div className="flex-1 h-2 bg-[#1a1f35] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00d4ff] to-[#0066ff] transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <div className="text-sm text-white/80 w-20 text-right">
                  {cleared}/{played}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 도전과제 진행률 */}
      <div className="game-card p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm text-[#64748b]">Achievement Progress</h3>
          <span className="text-[#ffd700] font-bold">
            {achievementProgress.unlocked}/{achievementProgress.total}
          </span>
        </div>
        <div className="h-3 bg-[#1a1f35] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff4d94] transition-all"
            style={{ width: `${achievementProgress.percentage}%` }}
          />
        </div>
        <div className="text-right text-xs text-[#64748b] mt-1">
          {achievementProgress.percentage}% Complete
        </div>
      </div>
    </div>
  );
}

// 통계 카드
function StatCard({
  label,
  value,
  icon,
  color = 'text-white',
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="game-card p-4 text-center">
      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
        {icon}
      </div>
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-xs text-[#64748b] mt-1">{label}</div>
    </div>
  );
}

// 칭호 탭
function TitlesTab({
  unlockedTitles,
  currentTitle,
}: {
  unlockedTitles: TitleDefinition[];
  currentTitle: TitleDefinition;
}) {
  const unlockedIds = new Set(unlockedTitles.map((t) => t.id));

  return (
    <div className="space-y-4">
      <p className="text-[#64748b] text-sm">
        Unlocked: {unlockedTitles.length}/{TITLES.length}
      </p>
      <div className="grid gap-3">
        {TITLES.map((title) => {
          const isUnlocked = unlockedIds.has(title.id);
          const isCurrent = title.id === currentTitle.id;

          return (
            <div
              key={title.id}
              className={cn(
                'rounded-xl p-4 border transition-all',
                isUnlocked
                  ? isCurrent
                    ? 'bg-gradient-to-r from-[#ffd700]/10 to-[#ff4d94]/10 border-[#ffd700]/50'
                    : 'game-card'
                  : 'bg-[#0f1424]/50 border-white/5 opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{isUnlocked ? title.icon : '?'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-bold', isUnlocked ? 'text-white' : 'text-[#64748b]')}>
                      {title.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-[#ffd700] text-[#0a0e1a] px-2 py-0.5 rounded-full font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748b]">{title.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 도전과제 탭
function AchievementsTab({
  unlockedAchievements,
  stats,
}: {
  unlockedAchievements: AchievementDefinition[];
  stats: GameStats;
}) {
  const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));
  const categories = [
    { id: 'gameplay' as const, name: 'Gameplay', icon: 'G' },
    { id: 'mastery' as const, name: 'Mastery', icon: 'M' },
    { id: 'special' as const, name: 'Special', icon: 'S' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-[#64748b] text-sm">
        Unlocked: {unlockedAchievements.length}/{ACHIEVEMENTS.length}
      </p>

      {categories.map((category) => {
        const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category.id);

        return (
          <div key={category.id}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
                {category.icon}
              </span>
              {category.name}
            </h3>
            <div className="grid gap-2">
              {categoryAchievements.map((achievement) => {
                const isUnlocked = unlockedIds.has(achievement.id);

                return (
                  <div
                    key={achievement.id}
                    className={cn(
                      'rounded-lg p-3 border transition-all flex items-center gap-3',
                      isUnlocked
                        ? 'game-card'
                        : 'bg-[#0f1424]/50 border-white/5 opacity-50'
                    )}
                  >
                    <div className="text-2xl">{isUnlocked ? achievement.icon : '?'}</div>
                    <div className="flex-1">
                      <div className={cn('font-medium', isUnlocked ? 'text-white' : 'text-[#64748b]')}>
                        {achievement.name}
                      </div>
                      <p className="text-xs text-[#64748b]">{achievement.description}</p>
                    </div>
                    {isUnlocked && (
                      <div className="text-[#00ff88] text-sm font-bold">✓</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 히스토리 탭
function HistoryTab({ stats }: { stats: GameStats }) {
  const history = stats.handHistory.slice().reverse(); // 최신순

  if (history.length === 0) {
    return (
      <div className="text-center text-[#64748b] py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center text-2xl font-bold text-white/20">
          H
        </div>
        <p>No play history yet.</p>
        <p className="text-sm mt-1">Your games will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#64748b] text-sm">Recent {history.length} records</p>
      <div className="space-y-2">
        {history.slice(0, 20).map((record) => {
          const date = new Date(record.date);
          const dateString = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

          return (
            <div
              key={record.id}
              className="game-card p-3 flex items-center gap-3"
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
                record.isVictory ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-[#ff4444]/20 text-[#ff4444]'
              )}>
                {record.isVictory ? 'W' : 'L'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={record.difficulty} size="sm" />
                  <span className={cn(
                    'text-sm font-medium',
                    record.isVictory ? 'text-[#00ff88]' : 'text-[#ff4444]'
                  )}>
                    {record.isVictory ? 'WIN' : 'LOSS'}
                  </span>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  Win Rate: {record.winRateResult.playerWinRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-xs text-[#64748b]">{dateString}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
