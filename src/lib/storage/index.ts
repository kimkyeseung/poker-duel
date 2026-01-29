'use client';

import { GameStats, initialGameStats, HandRecord, DailyChallengeRecord, EndingComment } from '@/types';

const STORAGE_KEYS = {
  STATS: 'poker-duel-stats',
  COMMENTS: 'poker-duel-comments',
  SETTINGS: 'poker-duel-settings',
  TUTORIAL_SEEN: 'poker-duel-tutorial-seen',
};

// 통계 관련
export function getGameStats(): GameStats {
  if (typeof window === 'undefined') return initialGameStats;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS);
    if (data) {
      return { ...initialGameStats, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load game stats:', e);
  }
  return initialGameStats;
}

export function saveGameStats(stats: GameStats): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save game stats:', e);
  }
}

export function updateGameStats(updater: (stats: GameStats) => GameStats): void {
  const current = getGameStats();
  const updated = updater(current);
  saveGameStats(updated);
}

// 핸드 히스토리 추가
export function addHandToHistory(hand: HandRecord): void {
  updateGameStats((stats) => {
    const history = [...stats.handHistory, hand];
    // 최대 100개까지 저장
    if (history.length > 100) {
      history.shift();
    }
    return { ...stats, handHistory: history };
  });
}

// 일일 챌린지 기록
export function getDailyChallengeRecord(date: string): DailyChallengeRecord | null {
  const stats = getGameStats();
  return stats.dailyChallengeHistory[date] || null;
}

export function saveDailyChallengeRecord(record: DailyChallengeRecord): void {
  updateGameStats((stats) => ({
    ...stats,
    dailyChallengeHistory: {
      ...stats.dailyChallengeHistory,
      [record.date]: record,
    },
  }));
}

// 엔딩 코멘트 관련
export function getEndingComments(): EndingComment[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load comments:', e);
  }
  return [];
}

export function addEndingComment(comment: EndingComment): void {
  if (typeof window === 'undefined') return;

  try {
    const comments = getEndingComments();
    comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  } catch (e) {
    console.error('Failed to save comment:', e);
  }
}

// 튜토리얼
export function hasTutorialSeen(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEYS.TUTORIAL_SEEN) === 'true';
}

export function setTutorialSeen(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TUTORIAL_SEEN, 'true');
}

// 설정
export interface GameSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  theme: 'casino' | 'minimal' | 'dark';
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  theme: 'casino',
};

export function getSettings(): GameSettings {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return defaultSettings;
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function updateSettings(updates: Partial<GameSettings>): void {
  const current = getSettings();
  saveSettings({ ...current, ...updates });
}

// 연승 기록 업데이트
export function updateStreak(isWin: boolean): void {
  updateGameStats((stats) => {
    if (isWin) {
      const newStreak = stats.currentStreak + 1;
      return {
        ...stats,
        currentStreak: newStreak,
        maxStreak: Math.max(stats.maxStreak, newStreak),
      };
    } else {
      return {
        ...stats,
        currentStreak: 0,
      };
    }
  });
}

// 게임 결과 기록
export function recordGameResult(
  difficulty: GameStats['difficultyStats'] extends Record<infer K, unknown> ? K : never,
  isWin: boolean
): void {
  updateGameStats((stats) => {
    const diffStats = stats.difficultyStats[difficulty];
    return {
      ...stats,
      totalGames: stats.totalGames + 1,
      totalWins: isWin ? stats.totalWins + 1 : stats.totalWins,
      totalLosses: isWin ? stats.totalLosses : stats.totalLosses + 1,
      difficultyStats: {
        ...stats.difficultyStats,
        [difficulty]: {
          played: diffStats.played + 1,
          cleared: isWin ? diffStats.cleared + 1 : diffStats.cleared,
        },
      },
    };
  });
}
