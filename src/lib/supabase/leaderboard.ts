'use client';

import { supabase, isSupabaseConfigured } from './client';
import type { LeaderboardEntry, DailyLeaderboardEntry } from './types';

// 점수 쓰기는 테이블 직접 INSERT가 아니라 검증/레이트리밋을 거치는 RPC로만
// 가능하다 (supabase/schema.sql 참조). RPC가 던지는 오류를 사용자에게 보여줄
// 메시지로 옮긴다.
const SUBMIT_ERROR_MESSAGES: Record<string, string> = {
  invalid_player_name: 'Player name must be 1-20 characters',
  invalid_chips: 'Invalid chip count',
  invalid_difficulty: 'Invalid difficulty',
  invalid_country_code: 'Invalid country code',
  rate_limited: 'Too many submissions. Please try again later.',
};

function toSubmitError(message: string | undefined): string {
  if (!message) return 'Failed to submit score';

  const matched = Object.keys(SUBMIT_ERROR_MESSAGES).find((key) => message.includes(key));
  return matched ? SUBMIT_ERROR_MESSAGES[matched] : 'Failed to submit score';
}

// RPC가 합성 타입을 반환할 때 PostgREST 버전에 따라 객체 또는 1개짜리 배열로
// 올 수 있으므로 둘 다 받아넘긴다.
function unwrapRow<T>(data: unknown): T | undefined {
  if (Array.isArray(data)) return data[0] as T | undefined;
  return (data ?? undefined) as T | undefined;
}

// 리더보드 조회 (상위 100명)
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('chips', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }

    if (!data) return [];

    return (data as LeaderboardEntry[]).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (err) {
    console.error('Leaderboard fetch error:', err);
    return [];
  }
}

// 점수 제출
export async function submitScore(
  playerName: string,
  chips: number,
  difficultyReached: string,
  countryCode?: string
): Promise<{ success: boolean; entry?: LeaderboardEntry; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (!playerName.trim()) {
    return { success: false, error: 'Player name is required' };
  }

  if (chips <= 0) {
    return { success: false, error: 'Invalid chip count' };
  }

  try {
    const { data, error } = await supabase.rpc('submit_leaderboard_score', {
      p_player_name: playerName.trim().slice(0, 20),
      p_chips: chips,
      p_difficulty_reached: difficultyReached,
      p_country_code: countryCode || null,
    });

    if (error) {
      console.error('Failed to submit score:', error);
      return { success: false, error: toSubmitError(error.message) };
    }

    const entry = unwrapRow<LeaderboardEntry>(data);
    if (!entry) {
      return { success: false, error: 'Failed to submit score' };
    }

    return { success: true, entry };
  } catch (err) {
    console.error('Score submission error:', err);
    return { success: false, error: 'Failed to submit score' };
  }
}

// 일일 리더보드 조회
export async function getDailyLeaderboard(
  date?: string,
  limit: number = 100
): Promise<DailyLeaderboardEntry[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return [];
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('daily_leaderboard')
      .select('*')
      .eq('date', targetDate)
      .order('chips', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch daily leaderboard:', error);
      return [];
    }

    if (!data) return [];

    return (data as DailyLeaderboardEntry[]).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch (err) {
    console.error('Daily leaderboard fetch error:', err);
    return [];
  }
}

// 일일 점수 제출
export async function submitDailyScore(
  playerName: string,
  chips: number,
  countryCode?: string
): Promise<{ success: boolean; entry?: DailyLeaderboardEntry; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  if (!playerName.trim()) {
    return { success: false, error: 'Player name is required' };
  }

  if (chips <= 0) {
    return { success: false, error: 'Invalid chip count' };
  }

  try {
    // date는 클라이언트 시계를 믿지 않고 서버가 정한다
    const { data, error } = await supabase.rpc('submit_daily_score', {
      p_player_name: playerName.trim().slice(0, 20),
      p_chips: chips,
      p_country_code: countryCode || null,
    });

    if (error) {
      console.error('Failed to submit daily score:', error);
      return { success: false, error: toSubmitError(error.message) };
    }

    const entry = unwrapRow<DailyLeaderboardEntry>(data);
    if (!entry) {
      return { success: false, error: 'Failed to submit score' };
    }

    return { success: true, entry };
  } catch (err) {
    console.error('Daily score submission error:', err);
    return { success: false, error: 'Failed to submit score' };
  }
}

// 플레이어 랭킹 조회
export async function getPlayerRank(chips: number): Promise<number | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const { count, error } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })
      .gt('chips', chips);

    if (error) {
      console.error('Failed to get player rank:', error);
      return null;
    }

    return (count || 0) + 1;
  } catch (err) {
    console.error('Player rank fetch error:', err);
    return null;
  }
}
