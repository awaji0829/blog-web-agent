-- Migration: Add SEO fields to drafts table
-- Description: Adds columns for SEO metrics, meta description, and primary keywords

ALTER TABLE drafts
  ADD COLUMN IF NOT EXISTS char_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_metrics JSONB,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS primary_keywords TEXT[];

-- Add GIN index for JSONB queries on seo_metrics
CREATE INDEX IF NOT EXISTS idx_drafts_seo_metrics
ON drafts USING GIN (seo_metrics)
WHERE seo_metrics IS NOT NULL;

-- Comment on columns
COMMENT ON COLUMN drafts.char_count IS 'Character count excluding whitespace and markdown symbols';
COMMENT ON COLUMN drafts.seo_metrics IS 'JSON object containing SEO analysis results';
COMMENT ON COLUMN drafts.meta_description IS 'SEO meta description for the blog post';
COMMENT ON COLUMN drafts.primary_keywords IS 'Array of primary keywords for SEO';
