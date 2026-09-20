-- ============================================================================
-- Hol'Damn It! Supabase Schema
-- Supabase SQL Editor에서 실행하세요.
--
-- 보안 모델
--   - 읽기: 누구나 가능 (리더보드는 공개 데이터)
--   - 쓰기: 테이블 직접 INSERT 불가. 검증과 레이트리밋을 거치는
--           submit_leaderboard_score / submit_daily_score RPC로만 가능
--   - UPDATE / DELETE: 클라이언트에서 불가 (정책 없음 + 권한 회수)
--   - id / created_at / date: 서버가 결정하며 클라이언트가 지정할 수 없음
--
-- 한계 (중요)
--   anon 키는 클라이언트 번들에 그대로 노출되므로, RLS만으로는 "정상적인
--   플레이로 얻은 점수"임을 증명할 수 없다. 아래 검증은 구조적으로 불가능한
--   값과 대량 스팸을 차단할 뿐, 그럴듯한 값을 위조하는 것까지 막지는 못한다.
--   완전한 방어는 서버 측 게임 검증(Edge Function에서 게임 세션을 발급하고
--   점수를 재계산)이 필요하다.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 테이블
-- ----------------------------------------------------------------------------

-- 전체 리더보드 (역대 최고 기록)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  chips INTEGER NOT NULL,
  difficulty_reached VARCHAR(20) NOT NULL,
  country_code VARCHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 일일 리더보드 (일일 챌린지 기록)
CREATE TABLE IF NOT EXISTS public.daily_leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name VARCHAR(20) NOT NULL,
  chips INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country_code VARCHAR(2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 레이트리밋용 제출 기록.
-- 클라이언트에 절대 노출되지 않으며(권한 회수 + 정책 없음), IP는 원본이 아닌
-- 해시로만 저장한다.
CREATE TABLE IF NOT EXISTS public.score_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash TEXT,
  board TEXT NOT NULL CHECK (board IN ('all_time', 'daily')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 기존 배포 보정
--
-- 이전 스키마에서 created_at은 NULL을 허용했다. 서버가 항상 시각을 정하도록
-- 기본값을 채우고 NOT NULL로 승격한다.
-- ----------------------------------------------------------------------------

UPDATE public.leaderboard SET created_at = NOW() WHERE created_at IS NULL;
UPDATE public.daily_leaderboard SET created_at = NOW() WHERE created_at IS NULL;

ALTER TABLE public.leaderboard
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.daily_leaderboard
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- ----------------------------------------------------------------------------
-- 데이터 무결성 제약
--
-- 기존 배포에 이미 규칙에 맞지 않는 행이 있을 수 있으므로 NOT VALID로 추가한다.
-- NOT VALID는 기존 행만 검사에서 제외하며, 신규 INSERT에는 그대로 적용된다.
-- 기존 데이터를 정리한 뒤 VALIDATE CONSTRAINT로 승격할 수 있다.
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- 칩: 양수여야 한다
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_chips_positive'
  ) THEN
    ALTER TABLE public.leaderboard
      ADD CONSTRAINT leaderboard_chips_positive CHECK (chips > 0) NOT VALID;
  END IF;

  -- 플레이어 이름: 공백만으로 이루어질 수 없고, 제어문자를 포함할 수 없다
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_player_name_valid'
  ) THEN
    ALTER TABLE public.leaderboard
      ADD CONSTRAINT leaderboard_player_name_valid CHECK (
        char_length(btrim(player_name)) BETWEEN 1 AND 20
        AND player_name !~ '[[:cntrl:]]'
      ) NOT VALID;
  END IF;

  -- 난이도: 게임이 정의한 6단계만 허용
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_difficulty_valid'
  ) THEN
    ALTER TABLE public.leaderboard
      ADD CONSTRAINT leaderboard_difficulty_valid CHECK (
        difficulty_reached IN ('easy', 'normal', 'hard', 'expert', 'king', 'god')
      ) NOT VALID;
  END IF;

  -- 국가 코드: ISO 3166-1 alpha-2 형식
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leaderboard_country_code_valid'
  ) THEN
    ALTER TABLE public.leaderboard
      ADD CONSTRAINT leaderboard_country_code_valid CHECK (
        country_code IS NULL OR country_code ~ '^[A-Z]{2}$'
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_leaderboard_chips_positive'
  ) THEN
    ALTER TABLE public.daily_leaderboard
      ADD CONSTRAINT daily_leaderboard_chips_positive CHECK (chips > 0) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_leaderboard_player_name_valid'
  ) THEN
    ALTER TABLE public.daily_leaderboard
      ADD CONSTRAINT daily_leaderboard_player_name_valid CHECK (
        char_length(btrim(player_name)) BETWEEN 1 AND 20
        AND player_name !~ '[[:cntrl:]]'
      ) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'daily_leaderboard_country_code_valid'
  ) THEN
    ALTER TABLE public.daily_leaderboard
      ADD CONSTRAINT daily_leaderboard_country_code_valid CHECK (
        country_code IS NULL OR country_code ~ '^[A-Z]{2}$'
      ) NOT VALID;
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 인덱스
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_leaderboard_chips ON public.leaderboard(chips DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date ON public.daily_leaderboard(date);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_chips ON public.daily_leaderboard(chips DESC);
CREATE INDEX IF NOT EXISTS idx_score_submissions_ip_created
  ON public.score_submissions(ip_hash, created_at DESC);

-- ----------------------------------------------------------------------------
-- RLS 정책
--
-- 읽기만 허용한다. INSERT 정책이 없으므로 RLS에 의해 직접 INSERT는 거부되고,
-- SECURITY DEFINER RPC만 쓰기가 가능하다.
-- ----------------------------------------------------------------------------

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_submissions ENABLE ROW LEVEL SECURITY;

-- 과거 스키마의 무제한 INSERT 정책 제거
DROP POLICY IF EXISTS "Anyone can insert to leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Anyone can insert to daily_leaderboard" ON public.daily_leaderboard;

DROP POLICY IF EXISTS "Anyone can read leaderboard" ON public.leaderboard;
CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can read daily_leaderboard" ON public.daily_leaderboard;
CREATE POLICY "Anyone can read daily_leaderboard" ON public.daily_leaderboard
  FOR SELECT USING (true);

-- score_submissions에는 정책을 만들지 않는다 → 클라이언트는 읽지도 쓰지도 못한다.

-- ----------------------------------------------------------------------------
-- 테이블 권한
--
-- Supabase 기본 설정은 public 스키마의 테이블에 anon 권한을 폭넓게 부여하므로,
-- 쓰기 권한을 명시적으로 회수한다. (RLS와 권한은 별개의 관문이다)
-- ----------------------------------------------------------------------------

REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.leaderboard FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.daily_leaderboard FROM anon, authenticated;
REVOKE ALL ON public.score_submissions FROM anon, authenticated;

GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT SELECT ON public.daily_leaderboard TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 내부 헬퍼
-- ----------------------------------------------------------------------------

-- 요청 IP 추출.
-- x-forwarded-for의 마지막 값을 사용한다. 클라이언트가 헤더를 위조해도 신뢰
-- 경계에 가장 가까운 프록시가 덧붙인 값이 마지막에 오기 때문이다.
-- 헤더를 얻을 수 없는 환경에서는 NULL을 반환하고, 이때 레이트리밋은 건너뛴다.
CREATE OR REPLACE FUNCTION public.request_ip()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_header TEXT;
BEGIN
  BEGIN
    v_header := current_setting('request.headers', true)::json ->> 'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;

  IF v_header IS NULL OR btrim(v_header) = '' THEN
    RETURN NULL;
  END IF;

  RETURN btrim(split_part(v_header, ',', array_length(string_to_array(v_header, ','), 1)));
END;
$$;

REVOKE ALL ON FUNCTION public.request_ip() FROM PUBLIC, anon, authenticated;

-- IP 해시. 원본 IP는 저장하지 않는다.
-- SALT는 배포마다 반드시 교체할 것.
CREATE OR REPLACE FUNCTION public.hash_ip(p_ip TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p_ip IS NULL THEN NULL
    ELSE md5(p_ip || 'holdamnit-change-this-salt')
  END;
$$;

REVOKE ALL ON FUNCTION public.hash_ip(TEXT) FROM PUBLIC, anon, authenticated;

-- 시간당 제출 횟수 제한. 초과 시 예외를 던진다.
CREATE OR REPLACE FUNCTION public.enforce_submission_rate_limit(
  p_ip_hash TEXT,
  p_board TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_recent INTEGER;
BEGIN
  -- IP를 알 수 없으면 제한할 근거가 없으므로 통과시킨다
  IF p_ip_hash IS NULL THEN
    RETURN;
  END IF;

  SELECT count(*) INTO v_recent
  FROM public.score_submissions
  WHERE ip_hash = p_ip_hash
    AND created_at > now() - interval '1 hour';

  IF v_recent >= 10 THEN
    RAISE EXCEPTION 'rate_limited' USING ERRCODE = '53400';
  END IF;

  INSERT INTO public.score_submissions (ip_hash, board) VALUES (p_ip_hash, p_board);
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_submission_rate_limit(TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 점수 제출 RPC
--
-- 클라이언트가 쓰기를 할 수 있는 유일한 경로. id/created_at/date는 인자로 받지
-- 않으므로 클라이언트가 위조할 수 없다.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.submit_leaderboard_score(
  p_player_name TEXT,
  p_chips INTEGER,
  p_difficulty_reached TEXT,
  p_country_code TEXT DEFAULT NULL
)
RETURNS public.leaderboard
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT := btrim(coalesce(p_player_name, ''));
  v_country TEXT := nullif(upper(btrim(coalesce(p_country_code, ''))), '');
  v_ip_hash TEXT := public.hash_ip(public.request_ip());
  v_row public.leaderboard;
BEGIN
  IF v_name = '' OR char_length(v_name) > 20 OR v_name ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'invalid_player_name' USING ERRCODE = '22023';
  END IF;

  IF p_chips IS NULL OR p_chips <= 0 THEN
    RAISE EXCEPTION 'invalid_chips' USING ERRCODE = '22023';
  END IF;

  IF p_difficulty_reached IS NULL
     OR p_difficulty_reached NOT IN ('easy', 'normal', 'hard', 'expert', 'king', 'god') THEN
    RAISE EXCEPTION 'invalid_difficulty' USING ERRCODE = '22023';
  END IF;

  IF v_country IS NOT NULL AND v_country !~ '^[A-Z]{2}$' THEN
    RAISE EXCEPTION 'invalid_country_code' USING ERRCODE = '22023';
  END IF;

  PERFORM public.enforce_submission_rate_limit(v_ip_hash, 'all_time');

  INSERT INTO public.leaderboard (player_name, chips, difficulty_reached, country_code)
  VALUES (v_name, p_chips, p_difficulty_reached, v_country)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_daily_score(
  p_player_name TEXT,
  p_chips INTEGER,
  p_country_code TEXT DEFAULT NULL
)
RETURNS public.daily_leaderboard
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name TEXT := btrim(coalesce(p_player_name, ''));
  v_country TEXT := nullif(upper(btrim(coalesce(p_country_code, ''))), '');
  v_ip_hash TEXT := public.hash_ip(public.request_ip());
  v_row public.daily_leaderboard;
BEGIN
  IF v_name = '' OR char_length(v_name) > 20 OR v_name ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'invalid_player_name' USING ERRCODE = '22023';
  END IF;

  IF p_chips IS NULL OR p_chips <= 0 THEN
    RAISE EXCEPTION 'invalid_chips' USING ERRCODE = '22023';
  END IF;

  IF v_country IS NOT NULL AND v_country !~ '^[A-Z]{2}$' THEN
    RAISE EXCEPTION 'invalid_country_code' USING ERRCODE = '22023';
  END IF;

  PERFORM public.enforce_submission_rate_limit(v_ip_hash, 'daily');

  -- date는 클라이언트 시계를 믿지 않고 서버 날짜를 사용한다
  INSERT INTO public.daily_leaderboard (player_name, chips, date, country_code)
  VALUES (v_name, p_chips, current_date, v_country)
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_leaderboard_score(TEXT, INTEGER, TEXT, TEXT)
  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_daily_score(TEXT, INTEGER, TEXT)
  TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- 순위 조회
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_player_rank(player_chips INTEGER)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT count(*)::INTEGER + 1
  FROM public.leaderboard
  WHERE chips > player_chips;
$$;

GRANT EXECUTE ON FUNCTION public.get_player_rank(INTEGER) TO anon, authenticated;
