import { GameStats } from '@/types';

// 도전과제 정의
export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  checkCondition: (stats: GameStats) => boolean;
  category: 'gameplay' | 'mastery' | 'special';
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // 게임플레이 카테고리
  {
    id: 'first-game',
    name: '첫 발걸음',
    description: '첫 번째 게임을 시작했습니다.',
    icon: '👣',
    checkCondition: (stats) => stats.totalGames >= 1,
    category: 'gameplay',
  },
  {
    id: 'games-10',
    name: '열 번의 도전',
    description: '10게임을 플레이했습니다.',
    icon: '🎮',
    checkCondition: (stats) => stats.totalGames >= 10,
    category: 'gameplay',
  },
  {
    id: 'games-50',
    name: '반백의 경험',
    description: '50게임을 플레이했습니다.',
    icon: '🎯',
    checkCondition: (stats) => stats.totalGames >= 50,
    category: 'gameplay',
  },
  {
    id: 'games-100',
    name: '백전노장',
    description: '100게임을 플레이했습니다.',
    icon: '🏆',
    checkCondition: (stats) => stats.totalGames >= 100,
    category: 'gameplay',
  },
  {
    id: 'first-win',
    name: '승리의 맛',
    description: '첫 번째 승리를 달성했습니다.',
    icon: '🥇',
    checkCondition: (stats) => stats.totalWins >= 1,
    category: 'gameplay',
  },
  {
    id: 'wins-10',
    name: '승리의 연속',
    description: '10승을 달성했습니다.',
    icon: '🎊',
    checkCondition: (stats) => stats.totalWins >= 10,
    category: 'gameplay',
  },
  {
    id: 'wins-25',
    name: '승리 전문가',
    description: '25승을 달성했습니다.',
    icon: '🌟',
    checkCondition: (stats) => stats.totalWins >= 25,
    category: 'gameplay',
  },

  // 마스터리 카테고리
  {
    id: 'streak-3',
    name: '연승 시작',
    description: '3연승을 달성했습니다.',
    icon: '🔥',
    checkCondition: (stats) => stats.maxStreak >= 3,
    category: 'mastery',
  },
  {
    id: 'streak-5',
    name: '불타는 연승',
    description: '5연승을 달성했습니다.',
    icon: '⚡',
    checkCondition: (stats) => stats.maxStreak >= 5,
    category: 'mastery',
  },
  {
    id: 'streak-10',
    name: '연승 마스터',
    description: '10연승을 달성했습니다.',
    icon: '💫',
    checkCondition: (stats) => stats.maxStreak >= 10,
    category: 'mastery',
  },
  {
    id: 'easy-clear',
    name: '쉬움 클리어',
    description: '쉬움 난이도를 클리어했습니다.',
    icon: '✅',
    checkCondition: (stats) => stats.difficultyStats.easy.cleared >= 1,
    category: 'mastery',
  },
  {
    id: 'normal-clear',
    name: '보통 클리어',
    description: '보통 난이도를 클리어했습니다.',
    icon: '☑️',
    checkCondition: (stats) => stats.difficultyStats.normal.cleared >= 1,
    category: 'mastery',
  },
  {
    id: 'hard-clear',
    name: '어려움 클리어',
    description: '어려움 난이도를 클리어했습니다.',
    icon: '✔️',
    checkCondition: (stats) => stats.difficultyStats.hard.cleared >= 1,
    category: 'mastery',
  },
  {
    id: 'expert-clear',
    name: '전문가 클리어',
    description: '전문가 난이도를 클리어했습니다.',
    icon: '💎',
    checkCondition: (stats) => stats.difficultyStats.expert.cleared >= 1,
    category: 'mastery',
  },
  {
    id: 'god-clear',
    name: '홀덤의 신',
    description: '홀덤의 신 난이도를 클리어했습니다.',
    icon: '👑',
    checkCondition: (stats) => stats.difficultyStats.god.cleared >= 1,
    category: 'mastery',
  },

  // 특별 카테고리
  {
    id: 'high-winrate',
    name: '확률의 지배자',
    description: '승률 70% 이상을 달성했습니다. (최소 20게임)',
    icon: '📊',
    checkCondition: (stats) =>
      stats.totalGames >= 20 && stats.totalWins / stats.totalGames >= 0.7,
    category: 'special',
  },
  {
    id: 'perfectionist',
    name: '완벽주의자',
    description: '5연속 정확한 승률 예측 (±1% 이내)',
    icon: '🎯',
    checkCondition: (stats) => stats.maxStreak >= 5 && stats.difficultyStats.god.cleared >= 1,
    category: 'special',
  },
  {
    id: 'all-clear',
    name: '올 클리어',
    description: '모든 난이도를 각각 3회 이상 클리어했습니다.',
    icon: '🏅',
    checkCondition: (stats) =>
      stats.difficultyStats.easy.cleared >= 3 &&
      stats.difficultyStats.normal.cleared >= 3 &&
      stats.difficultyStats.hard.cleared >= 3 &&
      stats.difficultyStats.expert.cleared >= 3 &&
      stats.difficultyStats.god.cleared >= 3,
    category: 'special',
  },
];

// 획득한 도전과제들 반환
export function getUnlockedAchievements(stats: GameStats): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((ach) => ach.checkCondition(stats));
}

// 카테고리별 도전과제 반환
export function getAchievementsByCategory(
  category: AchievementDefinition['category']
): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((ach) => ach.category === category);
}

// 도전과제 ID로 정보 가져오기
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// 도전과제 진행률 계산
export function getAchievementProgress(stats: GameStats): {
  unlocked: number;
  total: number;
  percentage: number;
} {
  const unlocked = getUnlockedAchievements(stats).length;
  const total = ACHIEVEMENTS.length;
  return {
    unlocked,
    total,
    percentage: Math.round((unlocked / total) * 100),
  };
}
