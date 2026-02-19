-- Migration 007: RLS 정책 강화
-- USING(true) 개발용 정책 제거 → 인증된 사용자만 접근 허용

-- ============================================================
-- workflow_sessions
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to workflow_sessions" ON workflow_sessions;

CREATE POLICY "Authenticated users only: workflow_sessions"
  ON workflow_sessions
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- resources
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to resources" ON resources;

CREATE POLICY "Authenticated users only: resources"
  ON resources
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- insights
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to insights" ON insights;

CREATE POLICY "Authenticated users only: insights"
  ON insights
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- research
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to research" ON research;

CREATE POLICY "Authenticated users only: research"
  ON research
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- outlines
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to outlines" ON outlines;

CREATE POLICY "Authenticated users only: outlines"
  ON outlines
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- drafts
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to drafts" ON drafts;

CREATE POLICY "Authenticated users only: drafts"
  ON drafts
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- ai_prompts
-- ============================================================
DROP POLICY IF EXISTS "Allow all access to ai_prompts" ON ai_prompts;

-- SELECT/UPDATE: 인증된 사용자만 (PromptManagerScreen 사용 가능)
CREATE POLICY "Authenticated users read: ai_prompts"
  ON ai_prompts
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users update: ai_prompts"
  ON ai_prompts
  FOR UPDATE
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- INSERT/DELETE: 완전 차단 (프롬프트는 마이그레이션으로만 추가/삭제)
CREATE POLICY "Block insert: ai_prompts"
  ON ai_prompts
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "Block delete: ai_prompts"
  ON ai_prompts
  FOR DELETE
  USING (false);
