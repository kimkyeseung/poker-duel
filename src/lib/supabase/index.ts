export { supabase, isSupabaseConfigured } from './client';
export {
  getLeaderboard,
  submitScore,
  getDailyLeaderboard,
  submitDailyScore,
  getPlayerRank,
} from './leaderboard';
export type {
  Database,
  LeaderboardEntry,
  DailyLeaderboardEntry,
} from './types';
