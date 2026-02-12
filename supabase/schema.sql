-- Hol'Damn It! Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Leaderboard table (all-time high scores)
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  chips INTEGER NOT NULL CHECK (chips > 0),
  difficulty_reached VARCHAR(20) NOT NULL,
  country_code VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily leaderboard table (daily challenge scores)
CREATE TABLE IF NOT EXISTS daily_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  chips INTEGER NOT NULL CHECK (chips > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country_code VARCHAR(2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_chips ON leaderboard(chips DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date ON daily_leaderboard(date);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_chips ON daily_leaderboard(chips DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_leaderboard ENABLE ROW LEVEL SECURITY;

-- Policies: Anyone can read, anyone can insert
CREATE POLICY "Anyone can read leaderboard" ON leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert to leaderboard" ON leaderboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read daily_leaderboard" ON daily_leaderboard
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert to daily_leaderboard" ON daily_leaderboard
  FOR INSERT WITH CHECK (true);

-- Optional: Function to get player rank
CREATE OR REPLACE FUNCTION get_player_rank(player_chips INTEGER)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER + 1
  FROM leaderboard
  WHERE chips > player_chips;
$$ LANGUAGE SQL STABLE;
