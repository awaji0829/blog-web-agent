-- Migration 008: Rate Limiting
-- 유저별 Edge Function 호출 횟수를 1시간 윈도우로 제한

CREATE TABLE IF NOT EXISTS rate_limits (
  user_id       UUID        NOT NULL,
  function_name TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  call_count    INTEGER     NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, function_name, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON rate_limits (user_id, function_name, window_start);

-- rate_limits는 service role(Edge Function)만 접근
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No direct client access: rate_limits"
  ON rate_limits FOR ALL USING (false);

-- ============================================================
-- 원자적 호출 횟수 증가 + 한도 초과 여부 반환
-- SECURITY DEFINER: 호출자 권한과 무관하게 테이블에 쓸 수 있음
-- ============================================================
CREATE OR REPLACE FUNCTION check_and_increment_rate_limit(
  p_user_id       UUID,
  p_function_name TEXT,
  p_max_calls     INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count        INTEGER;
BEGIN
  -- 현재 시간을 1시간 단위로 내림 (슬라이딩 아닌 고정 윈도우)
  v_window_start := date_trunc('hour', NOW());

  -- 24시간 이상 된 오래된 레코드 주기적 정리 (테이블 비대화 방지)
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '24 hours';

  -- 원자적 upsert: 없으면 INSERT(count=1), 있으면 INCREMENT
  INSERT INTO rate_limits (user_id, function_name, window_start, call_count)
  VALUES (p_user_id, p_function_name, v_window_start, 1)
  ON CONFLICT (user_id, function_name, window_start)
  DO UPDATE SET call_count = rate_limits.call_count + 1
  RETURNING call_count INTO v_count;

  -- 한도 이내면 TRUE, 초과면 FALSE
  RETURN v_count <= p_max_calls;
END;
$$;
