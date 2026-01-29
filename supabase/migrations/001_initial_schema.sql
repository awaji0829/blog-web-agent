-- Blog Automation Workflow Schema
-- Run this in Supabase SQL Editor

-- 워크플로우 세션
CREATE TABLE IF NOT EXISTS workflow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'input' CHECK (status IN ('input', 'analyzing', 'selection', 'researching', 'outline', 'writing', 'final')),
  keywords TEXT,
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수집된 리소스
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('url', 'file')),
  source_url TEXT,
  file_name TEXT,
  file_path TEXT,
  title TEXT,
  content TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 추출된 인사이트
CREATE TABLE IF NOT EXISTS insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  signal TEXT,
  potential_angle TEXT,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  relevance TEXT CHECK (relevance IN ('high', 'medium', 'low')),
  tags TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  source_refs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 심화 리서치
CREATE TABLE IF NOT EXISTS research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES insights(id) ON DELETE SET NULL,
  topic TEXT,
  topic_slug TEXT,
  market_data JSONB DEFAULT '[]'::jsonb,
  competitor_analysis JSONB DEFAULT '[]'::jsonb,
  statistics JSONB DEFAULT '[]'::jsonb,
  expert_opinions JSONB DEFAULT '[]'::jsonb,
  related_trends JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 아웃라인
CREATE TABLE IF NOT EXISTS outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  research_id UUID REFERENCES research(id) ON DELETE SET NULL,
  title TEXT,
  target_audience TEXT,
  thesis TEXT,
  tone TEXT DEFAULT 'professional',
  structure_pattern TEXT,
  sections JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 최종 초안
CREATE TABLE IF NOT EXISTS drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  outline_id UUID REFERENCES outlines(id) ON DELETE SET NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  word_count INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resources_session_id ON resources(session_id);
CREATE INDEX IF NOT EXISTS idx_insights_session_id ON insights(session_id);
CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);
CREATE INDEX IF NOT EXISTS idx_research_session_id ON research(session_id);
CREATE INDEX IF NOT EXISTS idx_outlines_session_id ON outlines(session_id);
CREATE INDEX IF NOT EXISTS idx_drafts_session_id ON drafts(session_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_workflow_sessions_updated_at ON workflow_sessions;
CREATE TRIGGER update_workflow_sessions_updated_at
  BEFORE UPDATE ON workflow_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_outlines_updated_at ON outlines;
CREATE TRIGGER update_outlines_updated_at
  BEFORE UPDATE ON outlines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_drafts_updated_at ON drafts;
CREATE TRIGGER update_drafts_updated_at
  BEFORE UPDATE ON drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - 일단 비활성화 상태로 시작
-- 필요시 인증 추가 후 활성화
ALTER TABLE workflow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE drafts ENABLE ROW LEVEL SECURITY;

-- Public access policies (개발용 - 프로덕션에서는 인증 기반으로 변경)
CREATE POLICY "Allow all access to workflow_sessions" ON workflow_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to resources" ON resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to insights" ON insights FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to research" ON research FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to outlines" ON outlines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to drafts" ON drafts FOR ALL USING (true) WITH CHECK (true);
