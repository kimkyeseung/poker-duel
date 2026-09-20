export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// chips는 DB에서 BIGINT다. PostgREST가 int8을 JSON 숫자로 내려주므로 JS에서는
// number(배정밀도)로 받으며, 정확히 표현되는 범위는 Number.MAX_SAFE_INTEGER
// (9,007,199,254,740,991)까지다. 게임에서 도달 가능한 칩 규모를 훨씬 넘으므로
// 실사용에는 문제가 없지만, 그 이상을 다뤄야 한다면 문자열로 받아야 한다.
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
