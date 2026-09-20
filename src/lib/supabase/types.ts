export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      leaderboard: {
        Row: {
          id: string;
          player_name: string;
          chips: number;
          difficulty_reached: string;
          created_at: string;
          country_code: string | null;
        };
        Insert: {
          id?: string;
          player_name: string;
          chips: number;
          difficulty_reached: string;
          created_at?: string;
          country_code?: string | null;
        };
        Update: {
          id?: string;
          player_name?: string;
          chips?: number;
          difficulty_reached?: string;
          created_at?: string;
          country_code?: string | null;
        };
      };
      daily_leaderboard: {
        Row: {
          id: string;
          player_name: string;
          chips: number;
          date: string;
          created_at: string;
          country_code: string | null;
        };
        Insert: {
          id?: string;
          player_name: string;
          chips: number;
          date: string;
          created_at?: string;
          country_code?: string | null;
        };
        Update: {
          id?: string;
          player_name?: string;
          chips?: number;
          date?: string;
          created_at?: string;
          country_code?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      // 점수 쓰기는 이 RPC로만 가능하다. id/created_at/date는 인자에 없으며
      // 서버가 정한다 (supabase/schema.sql 참조).
      submit_leaderboard_score: {
        Args: {
          p_player_name: string;
          p_chips: number;
          p_difficulty_reached: string;
          p_country_code?: string | null;
        };
        Returns: Database['public']['Tables']['leaderboard']['Row'];
      };
      submit_daily_score: {
        Args: {
          p_player_name: string;
          p_chips: number;
          p_country_code?: string | null;
        };
        Returns: Database['public']['Tables']['daily_leaderboard']['Row'];
      };
      get_player_rank: {
        Args: { player_chips: number };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// 리더보드 엔트리 타입
export interface LeaderboardEntry {
  id: string;
  player_name: string;
  chips: number;
  difficulty_reached: string;
  created_at: string;
  country_code: string | null;
  rank?: number;
}

// 일일 리더보드 엔트리 타입
export interface DailyLeaderboardEntry {
  id: string;
  player_name: string;
  chips: number;
  date: string;
  created_at: string;
  country_code: string | null;
  rank?: number;
}
