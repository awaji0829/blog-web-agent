-- AI Prompts Management Table
-- Migration for storing and managing SYSTEM_PROMPT for Edge Functions

CREATE TABLE IF NOT EXISTS ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT UNIQUE NOT NULL CHECK (function_name IN (
    'extract-insights',
    'deep-research',
    'generate-outline',
    'write-draft',
    'analyze-seo'
  )),
  display_name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  default_prompt TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prompts_function_name ON ai_prompts(function_name);

-- Trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_prompt_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prompt_timestamp
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_updated_at();

-- Row Level Security
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Public access policy (for development - change to auth-based in production)
CREATE POLICY "Allow all access to ai_prompts"
  ON ai_prompts
  FOR ALL
  USING (true)
  WITH CHECK (true);
