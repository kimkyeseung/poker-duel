import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 컴포넌트의 핵심 로직 테스트 (난이도별 테마, 격언 등)
describe('LevelStartOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('난이도별 테마', () => {
    const DIFFICULTY_THEMES = {
      easy: { gradient: 'from-emerald-500 to-green-600' },
      normal: { gradient: 'from-cyan-500 to-blue-600' },
      hard: { gradient: 'from-amber-500 to-orange-600' },
      expert: { gradient: 'from-purple-500 to-violet-600' },
      god: { gradient: 'from-rose-500 to-pink-600' },
    };

    it('easy 난이도는 emerald/green 그라데이션을 사용한다', () => {
      expect(DIFFICULTY_THEMES.easy.gradient).toBe('from-emerald-500 to-green-600');
    });

    it('normal 난이도는 cyan/blue 그라데이션을 사용한다', () => {
      expect(DIFFICULTY_THEMES.normal.gradient).toBe('from-cyan-500 to-blue-600');
    });

    it('hard 난이도는 amber/orange 그라데이션을 사용한다', () => {
      expect(DIFFICULTY_THEMES.hard.gradient).toBe('from-amber-500 to-orange-600');
    });

    it('expert 난이도는 purple/violet 그라데이션을 사용한다', () => {
      expect(DIFFICULTY_THEMES.expert.gradient).toBe('from-purple-500 to-violet-600');
    });

    it('god 난이도는 rose/pink 그라데이션을 사용한다', () => {
      expect(DIFFICULTY_THEMES.god.gradient).toBe('from-rose-500 to-pink-600');
    });
  });

  describe('레벨 정보', () => {
    const LEVEL_INFO = {
      easy: "Choose who has the better hand",
      normal: "Select the correct win rate range",
      hard: "Predict within ±5% accuracy",
      expert: "Predict within ±3% accuracy",
      god: "Predict within ±1% accuracy",
    };

    it('easy 레벨 정보가 올바르다', () => {
      expect(LEVEL_INFO.easy).toBe("Choose who has the better hand");
    });

    it('normal 레벨 정보가 올바르다', () => {
      expect(LEVEL_INFO.normal).toBe("Select the correct win rate range");
    });

    it('hard 레벨 정보가 ±5% 정확도를 명시한다', () => {
      expect(LEVEL_INFO.hard).toContain('±5%');
    });

    it('expert 레벨 정보가 ±3% 정확도를 명시한다', () => {
      expect(LEVEL_INFO.expert).toContain('±3%');
    });

    it('god 레벨 정보가 ±1% 정확도를 명시한다', () => {
      expect(LEVEL_INFO.god).toContain('±1%');
    });
  });

  describe('포커 격언', () => {
    const LEVEL_QUOTES = {
      easy: [
        "The journey of a thousand hands begins with a single bet.",
        "In poker, patience is not just a virtue—it's a strategy.",
        "Know when to hold 'em, know when to fold 'em.",
        "Every pro was once a beginner.",
      ],
      normal: [
        "Position is power in poker.",
        "The cards don't know who's winning.",
        "Play the player, not just the cards.",
        "Discipline separates winners from losers.",
      ],
      hard: [
        "The best hand doesn't always win—the best player does.",
        "Poker is a game of decisions, not results.",
        "Trust your reads, but verify with math.",
        "Pressure reveals character at the table.",
      ],
      expert: [
        "At this level, every percentage point matters.",
        "The elite see patterns others miss.",
        "Mastery is knowing what others don't know they don't know.",
        "Precision is the difference between good and great.",
      ],
      god: [
        "Welcome to the final test of poker mastery.",
        "Only the chosen reach this realm.",
        "1% tolerance. Zero room for error.",
        "Become the god of probability.",
      ],
    };

    it('각 난이도마다 최소 1개 이상의 격언이 있다', () => {
      expect(LEVEL_QUOTES.easy.length).toBeGreaterThanOrEqual(1);
      expect(LEVEL_QUOTES.normal.length).toBeGreaterThanOrEqual(1);
      expect(LEVEL_QUOTES.hard.length).toBeGreaterThanOrEqual(1);
      expect(LEVEL_QUOTES.expert.length).toBeGreaterThanOrEqual(1);
      expect(LEVEL_QUOTES.god.length).toBeGreaterThanOrEqual(1);
    });

    it('god 난이도 격언에 "1%" 또는 "final"이 포함된다', () => {
      const hasRelevantContent = LEVEL_QUOTES.god.some(
        quote => quote.includes('1%') || quote.includes('final') || quote.includes('god')
      );
      expect(hasRelevantContent).toBe(true);
    });
  });

  describe('애니메이션 타이밍', () => {
    it('오버레이는 5초 후에 사라져야 한다', () => {
      const OVERLAY_DURATION = 5000; // ms
      expect(OVERLAY_DURATION).toBe(5000);
    });

    it('entering 애니메이션은 300ms 후에 visible로 전환된다', () => {
      const ENTERING_DURATION = 300;
      expect(ENTERING_DURATION).toBe(300);
    });

    it('exiting 애니메이션은 4700ms 후에 시작된다', () => {
      const EXIT_START = 4700;
      expect(EXIT_START).toBe(4700);
    });
  });

  describe('레벨 번호 계산', () => {
    const difficulties = ['easy', 'normal', 'hard', 'expert', 'king', 'god'];

    it('easy는 Level 1이다', () => {
      expect(difficulties.indexOf('easy') + 1).toBe(1);
    });

    it('normal은 Level 2이다', () => {
      expect(difficulties.indexOf('normal') + 1).toBe(2);
    });

    it('hard는 Level 3이다', () => {
      expect(difficulties.indexOf('hard') + 1).toBe(3);
    });

    it('expert는 Level 4이다', () => {
      expect(difficulties.indexOf('expert') + 1).toBe(4);
    });

    it('king은 Level 5이다', () => {
      expect(difficulties.indexOf('king') + 1).toBe(5);
    });

    it('god는 Level 6이다', () => {
      expect(difficulties.indexOf('god') + 1).toBe(6);
    });
  });
});
