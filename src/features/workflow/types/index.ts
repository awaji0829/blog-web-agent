// ============================================
// 워크플로우 단계 타입
// ============================================

export type WorkflowStep =
  | 'input'
  | 'analyzing'
  | 'selection'
  | 'researching'
  | 'outline'
  | 'writing'
  | 'final';

// ============================================
// Database Types (Supabase 스키마 기반)
// ============================================

// 워크플로우 세션
export interface WorkflowSession {
  id: string;
  status: WorkflowStep;
  keywords: string | null;
  target_audience: string | null;
  created_at: string;
  updated_at: string;
}

// 수집된 리소스
export interface Resource {
  id: string;
  session_id: string;
  source_type: 'url' | 'file';
  source_url: string | null;
  file_name: string | null;
  file_path: string | null;
  title: string | null;
  content: string | null;
  collected_at: string;
}

// 추출된 인사이트
export interface Insight {
  id: string;
  session_id: string;
  title: string;
  signal: string | null;
  potential_angle: string | null;
  confidence: 'high' | 'medium' | 'low' | null;
  relevance: 'high' | 'medium' | 'low' | null;
  tags: string[] | null;
  status: 'pending' | 'selected' | 'rejected';
  source_refs: SourceRef[] | null;
  created_at: string;
}

export interface SourceRef {
  source_type: string;
  source_id: string;
  title?: string;
}

// 심화 리서치
export interface Research {
  id: string;
  session_id: string;
  insight_id: string | null;
  topic: string | null;
  topic_slug: string | null;
  market_data: MarketDataPoint[];
  competitor_analysis: CompetitorAnalysis[];
  statistics: Statistic[];
  expert_opinions: ExpertOpinion[];
  related_trends: RelatedTrend[];
  sources: ResearchSource[];
  created_at: string;
}

export interface MarketDataPoint {
  point: string;
  source: string;
  url?: string;
}

export interface CompetitorAnalysis {
  company: string;
  insight: string;
  source?: string;
}

export interface Statistic {
  stat: string;
  source: string;
  url?: string;
}

export interface ExpertOpinion {
  quote: string;
  speaker: string;
  source?: string;
  url?: string;
}

export interface RelatedTrend {
  trend: string;
  relevance: string;
}

export interface ResearchSource {
  url: string;
  title: string;
  type?: string;
  accessed_at?: string;
}

// 아웃라인
export interface Outline {
  id: string;
  session_id: string;
  research_id: string | null;
  title: string | null;
  target_audience: string | null;
  thesis: string | null;
  tone: string;
  structure_pattern: string | null;
  sections: OutlineSection[];
  status: 'draft' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface OutlineSection {
  id: string;
  type: 'intro' | 'body' | 'conclusion';
  title: string;
  content: string;
  keywords: string[];
}

// SEO 분석 메트릭
export interface SeoMetrics {
  overall_score: number;
  keyword_density: {
    score: number;
    value: number;
    status: 'good' | 'low' | 'high';
  };
  readability: {
    score: number;
    avg_sentence_length: number;
    avg_paragraph_length: number;
    status: 'good' | 'needs_improvement';
  };
  content_length: {
    score: number;
    word_count: number;
    char_count: number;
    status: 'good' | 'short' | 'long';
  };
  heading_structure: {
    score: number;
    h2_count: number;
    h3_count: number;
    has_keyword_in_headings: boolean;
  };
  title_optimization: {
    score: number;
    length: number;
    has_keyword: boolean;
    status: 'good' | 'too_short' | 'too_long';
  };
}

export interface SeoSuggestion {
  priority: 'high' | 'medium' | 'low';
  message: string;
}

export interface SeoAnalysisResult {
  overall_score: number;
  metrics: SeoMetrics;
  suggestions: SeoSuggestion[];
  generated_meta: {
    description: string;
    keywords: string[];
  };
}

// 최종 초안
export interface Draft {
  id: string;
  session_id: string;
  outline_id: string | null;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  word_count: number;
  char_count: number | null;
  thumbnail_url: string | null;
  status: 'draft' | 'final' | 'published';
  seo_metrics: SeoMetrics | null;
  meta_description: string | null;
  primary_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

// Draft with session and resources (for list view)
export interface DraftWithDetails extends Draft {
  workflow_sessions?: {
    keywords: string | null;
    target_audience: string | null;
  };
  resources?: Array<{
    id: string;
    source_type: 'url' | 'file';
    source_url: string | null;
    file_name: string | null;
    file_path: string | null;
    title: string | null;
  }>;
}

// ============================================
// Component Props Types (기존 호환용)
// ============================================

// Step 1: 리소스 입력 데이터
export interface ResourceInputData {
  urls: string[];
  files: string[];
  keywords: string;
  targetAudience: string;
}

// Step 3: 인사이트 데이터 (컴포넌트용 - 기존 호환)
export interface InsightData {
  id: string;
  title: string;
  summary: string;        // = signal + potential_angle
  targetAudience: string; // = target_audience from session or insight context
  keywords: string[];     // = tags
}

// Step 5: 아웃라인 데이터 (컴포넌트용 - 기존 호환)
export interface OutlineData {
  sections: OutlineSection[];
  tone: string;
}

// ============================================
// API Response Types
// ============================================

export interface ExtractInsightsResponse {
  insights: Insight[];
}

export interface DeepResearchResponse {
  research: Research[];
}

export interface GenerateOutlineResponse {
  outline: Outline;
}

export interface WriteDraftResponse {
  draft: Draft;
}

export interface AnalyzeSeoResponse {
  analysis: SeoAnalysisResult;
  draft_id: string;
}

// ============================================
// Utility Types
// ============================================

// Insight를 InsightData로 변환하는 헬퍼
export function toInsightData(insight: Insight, targetAudience?: string): InsightData {
  return {
    id: insight.id,
    title: insight.title,
    summary: insight.potential_angle || insight.signal || '',
    targetAudience: targetAudience || '',
    keywords: insight.tags || [],
  };
}

// Outline을 OutlineData로 변환하는 헬퍼
export function toOutlineData(outline: Outline): OutlineData {
  return {
    sections: outline.sections,
    tone: outline.tone,
  };
}
