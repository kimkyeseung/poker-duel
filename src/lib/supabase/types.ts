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
      [_ in never]: never;
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
