import { GameStats } from '@/types';

// 칭호 정의
export interface TitleDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  checkCondition: (stats: GameStats) => boolean;
  priority: number; // 높을수록 우선 표시
}

export const TITLES: TitleDefinition[] = [
  {
    id: 'beginner',
    name: '초보 갬블러',
    description: '첫 번째 게임을 플레이했습니다.',
    icon: '🎰',
    checkCondition: (stats) => stats.totalGames >= 1,
    priority: 1,
  },
  {
    id: 'learner',
    name: '확률 입문자',
    description: '10게임을 플레이했습니다.',
    icon: '📚',
    checkCondition: (stats) => stats.totalGames >= 10,
    priority: 2,
  },
  {
    id: 'first-win',
    name: '첫 승리',
    description: '첫 번째 승리를 달성했습니다.',
    icon: '🎉',
    checkCondition: (stats) => stats.totalWins >= 1,
    priority: 3,
  },
  {
    id: 'streak-3',
    name: '연승 시작',
    description: '3연승을 달성했습니다.',
    icon: '🔥',
    checkCondition: (stats) => stats.maxStreak >= 3,
    priority: 4,
  },
  {
    id: 'streak-5',
    name: '연승 기록',
    description: '5연승을 달성했습니다.',
    icon: '⚡',
    checkCondition: (stats) => stats.maxStreak >= 5,
    priority: 5,
  },
  {
    id: 'streak-10',
    name: '연승 마스터',
    description: '10연승을 달성했습니다.',
    icon: '💫',
    checkCondition: (stats) => stats.maxStreak >= 10,
    priority: 6,
  },
  {
    id: 'easy-master',
    name: '쉬움 정복자',
    description: '쉬움 난이도를 3회 클리어했습니다.',
    icon: '⭐',
    checkCondition: (stats) => stats.difficultyStats.easy.cleared >= 3,
    priority: 7,
  },
  {
    id: 'normal-master',
    name: '보통 정복자',
    description: '보통 난이도를 3회 클리어했습니다.',
    icon: '⭐⭐',
    checkCondition: (stats) => stats.difficultyStats.normal.cleared >= 3,
    priority: 8,
  },
  {
    id: 'hard-master',
    name: '어려움 정복자',
    description: '어려움 난이도를 3회 클리어했습니다.',
    icon: '⭐⭐⭐',
    checkCondition: (stats) => stats.difficultyStats.hard.cleared >= 3,
    priority: 9,
  },
  {
    id: 'expert-clear',
    name: '전문가',
    description: '전문가 난이도를 클리어했습니다.',
    icon: '💎',
    checkCondition: (stats) => stats.difficultyStats.expert.cleared >= 1,
    priority: 10,
  },
  {
    id: 'god-clear',
    name: '홀덤의 신',
    description: '홀덤의 신 난이도를 클리어했습니다.',
    icon: '👑',
    checkCondition: (stats) => stats.difficultyStats.god.cleared >= 1,
    priority: 100,
  },
  {
    id: 'calculator',
    name: '인간 계산기',
    description: '승률 50% 이상을 유지합니다.',
    icon: '🧮',
    checkCondition: (stats) =>
      stats.totalGames >= 10 && stats.totalWins / stats.totalGames >= 0.5,
    priority: 11,
  },
  {
    id: 'veteran',
    name: '베테랑',
    description: '50게임을 플레이했습니다.',
    icon: '🎖️',
    checkCondition: (stats) => stats.totalGames >= 50,
    priority: 12,
  },
  {
    id: 'legend',
    name: '전설',
    description: '100게임을 플레이했습니다.',
    icon: '🏅',
    checkCondition: (stats) => stats.totalGames >= 100,
    priority: 13,
  },
];

// 획득한 칭호들 반환
export function getUnlockedTitles(stats: GameStats): TitleDefinition[] {
  return TITLES.filter((title) => title.checkCondition(stats));
}

// 현재 최고 칭호 반환
export function getCurrentTitle(stats: GameStats): TitleDefinition {
  const unlocked = getUnlockedTitles(stats);
  if (unlocked.length === 0) {
    return TITLES[0]; // 기본 칭호
  }
  return unlocked.reduce((prev, curr) =>
    curr.priority > prev.priority ? curr : prev
  );
}

// 칭호 ID로 칭호 정보 가져오기
export function getTitleById(id: string): TitleDefinition | undefined {
  return TITLES.find((t) => t.id === id);
}

// 칭호 ID를 번역 키로 변환
const TITLE_KEY_MAP: Record<string, string> = {
  'beginner': 'beginner',
  'learner': 'probabilityStudent',
  'first-win': 'firstWinner',
  'streak-3': 'consistentPlayer',
  'streak-5': 'consistentPlayer',
  'streak-10': 'master',
  'easy-master': 'consistentPlayer',
  'normal-master': 'expert',
  'hard-master': 'expert',
  'expert-clear': 'master',
  'god-clear': 'godOfHoldem',
  'calculator': 'expert',
  'veteran': 'master',
  'legend': 'legend',
};

export function getTitleKey(titleId: string): string {
  return TITLE_KEY_MAP[titleId] || 'beginner';
}
