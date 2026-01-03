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
    { id: 'overview', label: '개요', icon: '📊' },
    { id: 'titles', label: '칭호', icon: '🏅' },
    { id: 'achievements', label: '도전과제', icon: '🏆' },
    { id: 'history', label: '히스토리', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* 헤더 */}
      <header className="p-4 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← 메인으로
          </button>
          <div className="text-amber-500 font-bold text-lg">📊 통계</div>
          <div className="w-16" />
        </div>
      </header>

      {/* 탭 */}
      <div className="border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-3 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                <span className="mr-1">{tab.icon}</span>
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
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/30 text-center">
        <div className="text-4xl mb-2">{currentTitle.icon}</div>
        <div className="text-xl font-bold text-white">{currentTitle.name}</div>
        <div className="text-sm text-slate-400 mt-1">{currentTitle.description}</div>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="총 게임" value={stats.totalGames} icon="🎮" />
        <StatCard label="승리" value={stats.totalWins} icon="🏆" color="text-emerald-400" />
        <StatCard label="패배" value={stats.totalLosses} icon="💔" color="text-red-400" />
        <StatCard label="승률" value={`${winRate.toFixed(1)}%`} icon="📊" color="text-amber-400" />
      </div>

      {/* 연승 기록 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">최다 연승</div>
          <div className="text-3xl font-bold text-amber-400">{stats.maxStreak}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">현재 연승</div>
          <div className="text-3xl font-bold text-white">{stats.currentStreak}</div>
        </div>
      </div>

      {/* 난이도별 통계 */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <h3 className="text-sm text-slate-400 mb-4">난이도별 클리어</h3>
        <div className="space-y-3">
          {(Object.keys(stats.difficultyStats) as Difficulty[]).map((diff) => {
            const { played, cleared } = stats.difficultyStats[diff];
            const rate = played > 0 ? (cleared / played) * 100 : 0;
            return (
              <div key={diff} className="flex items-center gap-3">
                <DifficultyBadge difficulty={diff} size="sm" />
                <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <div className="text-sm text-slate-300 w-20 text-right">
                  {cleared}/{played}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 도전과제 진행률 */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm text-slate-400">도전과제 진행률</h3>
          <span className="text-amber-400 font-bold">
            {achievementProgress.unlocked}/{achievementProgress.total}
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
            style={{ width: `${achievementProgress.percentage}%` }}
          />
        </div>
        <div className="text-right text-xs text-slate-500 mt-1">
          {achievementProgress.percentage}% 완료
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
    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className={cn('text-2xl font-bold', color)}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
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
      <p className="text-slate-400 text-sm">
        획득: {unlockedTitles.length}/{TITLES.length}
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
                    ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/50'
                    : 'bg-slate-800/50 border-slate-700'
                  : 'bg-slate-800/30 border-slate-800 opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{isUnlocked ? title.icon : '🔒'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn('font-bold', isUnlocked ? 'text-white' : 'text-slate-500')}>
                      {title.name}
                    </span>
                    {isCurrent && (
                      <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                        현재
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400">{title.description}</p>
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
    { id: 'gameplay' as const, name: '게임플레이', icon: '🎮' },
    { id: 'mastery' as const, name: '마스터리', icon: '⭐' },
    { id: 'special' as const, name: '특별', icon: '💎' },
  ];

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">
        획득: {unlockedAchievements.length}/{ACHIEVEMENTS.length}
      </p>

      {categories.map((category) => {
        const categoryAchievements = ACHIEVEMENTS.filter((a) => a.category === category.id);

        return (
          <div key={category.id}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>{category.icon}</span>
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
                        ? 'bg-slate-800/50 border-slate-700'
                        : 'bg-slate-800/20 border-slate-800 opacity-50'
                    )}
                  >
                    <div className="text-2xl">{isUnlocked ? achievement.icon : '🔒'}</div>
                    <div className="flex-1">
                      <div className={cn('font-medium', isUnlocked ? 'text-white' : 'text-slate-500')}>
                        {achievement.name}
                      </div>
                      <p className="text-xs text-slate-400">{achievement.description}</p>
                    </div>
                    {isUnlocked && (
                      <div className="text-emerald-400 text-sm">✓</div>
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
      <div className="text-center text-slate-500 py-12">
        <div className="text-4xl mb-2">📜</div>
        <p>아직 플레이 기록이 없습니다.</p>
        <p className="text-sm mt-1">게임을 플레이하면 여기에 기록됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-400 text-sm">최근 {history.length}개의 기록</p>
      <div className="space-y-2">
        {history.slice(0, 20).map((record) => {
          const date = new Date(record.date);
          const dateString = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

          return (
            <div
              key={record.id}
              className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 flex items-center gap-3"
            >
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-xl',
                record.isVictory ? 'bg-emerald-500/20' : 'bg-red-500/20'
              )}>
                {record.isVictory ? '🏆' : '💔'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={record.difficulty} size="sm" />
                  <span className={cn(
                    'text-sm font-medium',
                    record.isVictory ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {record.isVictory ? '승리' : '패배'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  승률: {record.winRateResult.playerWinRate.toFixed(1)}%
                </p>
              </div>
              <div className="text-xs text-slate-500">{dateString}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
