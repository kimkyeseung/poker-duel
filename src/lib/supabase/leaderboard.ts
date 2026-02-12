'use client';

import { supabase, isSupabaseConfigured } from './client';
import type { LeaderboardEntry, DailyLeaderboardEntry } from './types';

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
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        player_name: playerName.trim().slice(0, 20),
        chips,
        difficulty_reached: difficultyReached,
        country_code: countryCode || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to submit score:', error);
      return { success: false, error: error.message };
    }

    return { success: true, entry: data };
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

  const today = new Date().toISOString().split('T')[0];

  try {
    const { data, error } = await supabase
      .from('daily_leaderboard')
      .insert({
        player_name: playerName.trim().slice(0, 20),
        chips,
        date: today,
        country_code: countryCode || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to submit daily score:', error);
      return { success: false, error: error.message };
    }

    return { success: true, entry: data };
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
