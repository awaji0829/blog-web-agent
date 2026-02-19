import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, requireAuth, AuthError } from '../_shared/supabase.ts';
import { checkRateLimit, RateLimitError } from '../_shared/rateLimit.ts';
import { callAnthropic } from '../_shared/anthropic.ts';

interface RequestBody {
  draft_id: string;
  keywords?: string[];
}

interface KeywordDensityResult {
  score: number;
  value: number;
  status: 'good' | 'low' | 'high';
  details: { keyword: string; count: number; density: number }[];
}

interface ReadabilityResult {
  score: number;
  avg_sentence_length: number;
  avg_paragraph_length: number;
  status: 'excellent' | 'good' | 'needs_improvement';
}

interface ContentLengthResult {
  score: number;
  word_count: number;
  char_count: number;
  status: 'optimal' | 'short' | 'long';
}

interface HeadingStructureResult {
  score: number;
  h2_count: number;
  h3_count: number;
  headings_with_keywords: number;
  is_hierarchical: boolean;
}

interface TitleOptimizationResult {
  score: number;
  length: number;
  has_keyword: boolean;
  suggestions: string[];
}

interface SeoMetrics {
  keyword_density: KeywordDensityResult;
  readability: ReadabilityResult;
  content_length: ContentLengthResult;
  heading_structure: HeadingStructureResult;
  title_optimization: TitleOptimizationResult;
}

interface Suggestion {
  priority: 'high' | 'medium' | 'low';
  category: string;
  message: string;
}

// 키워드 밀도 계산
function calculateKeywordDensity(content: string, keywords: string[]): KeywordDensityResult {
  const cleanContent = content.replace(/[#*`>\[\]()]/g, '').toLowerCase();
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length;

  if (keywords.length === 0 || totalWords === 0) {
    return { score: 50, value: 0, status: 'low', details: [] };
  }

  const keywordStats = keywords.map(keyword => {
    const regex = new RegExp(keyword.toLowerCase(), 'gi');
    const matches = cleanContent.match(regex) || [];
    const count = matches.length;
    const density = (count / totalWords) * 100;

    return { keyword, count, density: Math.round(density * 100) / 100 };
  });

  const avgDensity = keywordStats.reduce((sum, k) => sum + k.density, 0) / keywords.length;

  // 1-3%가 적정 범위
  let status: 'good' | 'low' | 'high' = 'good';
  let score = 100;

  if (avgDensity < 0.5) {
    status = 'low';
    score = Math.max(30, avgDensity * 60);
  } else if (avgDensity > 4) {
    status = 'high';
    score = Math.max(30, 100 - (avgDensity - 3) * 15);
  } else if (avgDensity < 1) {
    status = 'low';
    score = 60 + avgDensity * 40;
  } else if (avgDensity > 3) {
    status = 'high';
    score = 100 - (avgDensity - 3) * 20;
  } else {
    // 1-3% 범위 내: 2%가 이상적
    score = 100 - Math.abs(2 - avgDensity) * 15;
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    value: Math.round(avgDensity * 100) / 100,
    status,
    details: keywordStats,
  };
}

// 가독성 점수 계산
function calculateReadability(content: string): ReadabilityResult {
  const cleanContent = content.replace(/[#*`>\[\]()]/g, '');
  const sentences = cleanContent.split(/[.!?。]+/).filter(s => s.trim().length > 0);
  const paragraphs = cleanContent.split(/\n\n+/).filter(p => p.trim().length > 0);
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);

  if (sentences.length === 0 || paragraphs.length === 0) {
    return { score: 50, avg_sentence_length: 0, avg_paragraph_length: 0, status: 'needs_improvement' };
  }

  const avgSentenceLength = words.length / sentences.length;
  const avgParagraphLength = sentences.length / paragraphs.length;

  let score = 100;

  // 문장 길이 점수 (20-25단어가 이상적)
  if (avgSentenceLength < 10) {
    score -= 15; // 너무 짧음
  } else if (avgSentenceLength < 15) {
    score -= 5;
  } else if (avgSentenceLength > 35) {
    score -= (avgSentenceLength - 35) * 2;
  } else if (avgSentenceLength > 30) {
    score -= 10;
  }

  // 문단 길이 점수 (3-5문장이 이상적)
  if (avgParagraphLength > 7) {
    score -= (avgParagraphLength - 7) * 5;
  } else if (avgParagraphLength < 2) {
    score -= 10;
  }

  let status: 'excellent' | 'good' | 'needs_improvement' = 'excellent';
  if (score < 60) status = 'needs_improvement';
  else if (score < 80) status = 'good';

  return {
    score: Math.max(0, Math.round(score)),
    avg_sentence_length: Math.round(avgSentenceLength * 10) / 10,
    avg_paragraph_length: Math.round(avgParagraphLength * 10) / 10,
    status,
  };
}

// 콘텐츠 길이 분석
function analyzeContentLength(content: string): ContentLengthResult {
  const cleanContent = content.replace(/[#*`>\[\]()]/g, '');
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const charCount = cleanContent.replace(/\s/g, '').length;

  let score = 100;
  let status: 'optimal' | 'short' | 'long' = 'optimal';

  // 1500-2500 단어가 이상적
  if (wordCount < 800) {
    status = 'short';
    score = Math.max(30, (wordCount / 800) * 60);
  } else if (wordCount < 1200) {
    status = 'short';
    score = 60 + ((wordCount - 800) / 400) * 20;
  } else if (wordCount > 3500) {
    status = 'long';
    score = Math.max(50, 100 - (wordCount - 3500) * 0.02);
  } else if (wordCount > 3000) {
    status = 'long';
    score = 90 - ((wordCount - 3000) / 500) * 10;
  } else if (wordCount >= 1500 && wordCount <= 2500) {
    score = 100;
  } else {
    score = 85;
  }

  return {
    score: Math.round(Math.max(0, Math.min(100, score))),
    word_count: wordCount,
    char_count: charCount,
    status,
  };
}

// 헤딩 구조 분석
function analyzeHeadingStructure(content: string, keywords: string[]): HeadingStructureResult {
  const h2Matches = content.match(/^## .+$/gm) || [];
  const h3Matches = content.match(/^### .+$/gm) || [];

  const allHeadings = [...h2Matches, ...h3Matches];
  const headingsWithKeywords = keywords.length > 0
    ? allHeadings.filter(h =>
        keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))
      ).length
    : 0;

  // 계층 구조 체크 (H2가 2개 이상)
  const isHierarchical = h2Matches.length >= 2;

  let score = 40; // 기본 점수

  // H2 개수에 따른 점수
  if (h2Matches.length >= 4) score += 25;
  else if (h2Matches.length >= 3) score += 20;
  else if (h2Matches.length >= 2) score += 15;
  else if (h2Matches.length >= 1) score += 5;

  // H3 사용 보너스
  if (h3Matches.length > 0) score += 10;

  // 키워드 포함 헤딩 보너스
  if (headingsWithKeywords > 0) score += 15;
  if (headingsWithKeywords >= 2) score += 10;

  return {
    score: Math.min(100, score),
    h2_count: h2Matches.length,
    h3_count: h3Matches.length,
    headings_with_keywords: headingsWithKeywords,
    is_hierarchical: isHierarchical,
  };
}

// 제목 최적화 분석
function analyzeTitleOptimization(title: string, keywords: string[]): TitleOptimizationResult {
  const length = title.length;
  const hasKeyword = keywords.length > 0 && keywords.some(k =>
    title.toLowerCase().includes(k.toLowerCase())
  );

  let score = 100;
  const suggestions: string[] = [];

  // 길이 체크 (50-60자 이상적)
  if (length > 70) {
    score -= 25;
    suggestions.push('제목을 60자 이내로 줄이면 검색 결과에서 잘리지 않습니다');
  } else if (length > 60) {
    score -= 10;
    suggestions.push('제목이 약간 깁니다. 60자 이내로 줄이는 것을 권장합니다');
  } else if (length < 20) {
    score -= 20;
    suggestions.push('제목이 너무 짧습니다. 핵심 내용을 더 포함해보세요');
  } else if (length < 30) {
    score -= 10;
    suggestions.push('제목에 더 구체적인 정보를 추가하면 좋습니다');
  }

  // 키워드 포함 체크
  if (!hasKeyword && keywords.length > 0) {
    score -= 25;
    suggestions.push('제목에 핵심 키워드를 포함하면 검색 노출에 유리합니다');
  }

  return {
    score: Math.max(0, score),
    length,
    has_keyword: hasKeyword,
    suggestions,
  };
}

// 개선 제안 생성
function generateSuggestions(metrics: SeoMetrics): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // 키워드 밀도
  if (metrics.keyword_density.status === 'low') {
    suggestions.push({
      priority: 'high',
      category: '키워드',
      message: '키워드 사용이 부족합니다. 핵심 키워드를 본문에 더 자연스럽게 배치해보세요.',
    });
  } else if (metrics.keyword_density.status === 'high') {
    suggestions.push({
      priority: 'medium',
      category: '키워드',
      message: '키워드가 과도하게 반복됩니다. 동의어나 관련어로 일부 대체해보세요.',
    });
  }

  // 가독성
  if (metrics.readability.status === 'needs_improvement') {
    if (metrics.readability.avg_sentence_length > 30) {
      suggestions.push({
        priority: 'high',
        category: '가독성',
        message: '문장이 너무 깁니다. 긴 문장을 나누어 가독성을 높여보세요.',
      });
    }
    if (metrics.readability.avg_paragraph_length > 6) {
      suggestions.push({
        priority: 'medium',
        category: '가독성',
        message: '문단이 너무 깁니다. 3-5문장 단위로 나누는 것을 권장합니다.',
      });
    }
  }

  // 콘텐츠 길이
  if (metrics.content_length.status === 'short') {
    suggestions.push({
      priority: 'high',
      category: '분량',
      message: `현재 ${metrics.content_length.word_count}단어입니다. SEO에 최적화된 1500-2500단어를 목표로 내용을 보강해보세요.`,
    });
  } else if (metrics.content_length.status === 'long') {
    suggestions.push({
      priority: 'low',
      category: '분량',
      message: '글이 다소 깁니다. 핵심 내용 위주로 정리하면 독자 이탈을 줄일 수 있습니다.',
    });
  }

  // 헤딩 구조
  if (metrics.heading_structure.h2_count < 2) {
    suggestions.push({
      priority: 'high',
      category: '구조',
      message: 'H2 헤딩을 2개 이상 사용하여 글의 구조를 명확히 해보세요.',
    });
  }
  if (metrics.heading_structure.headings_with_keywords === 0) {
    suggestions.push({
      priority: 'medium',
      category: '구조',
      message: '일부 헤딩에 핵심 키워드를 포함하면 SEO에 도움이 됩니다.',
    });
  }

  // 제목 최적화
  suggestions.push(...metrics.title_optimization.suggestions.map(msg => ({
    priority: 'medium' as const,
    category: '제목',
    message: msg,
  })));

  // 우선순위로 정렬
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions.slice(0, 5); // 상위 5개만 반환
}

// 종합 점수 계산
function calculateOverallScore(metrics: SeoMetrics): number {
  const weights = {
    keyword_density: 0.25,
    readability: 0.20,
    content_length: 0.20,
    heading_structure: 0.20,
    title_optimization: 0.15,
  };

  const score =
    metrics.keyword_density.score * weights.keyword_density +
    metrics.readability.score * weights.readability +
    metrics.content_length.score * weights.content_length +
    metrics.heading_structure.score * weights.heading_structure +
    metrics.title_optimization.score * weights.title_optimization;

  return Math.round(score);
}

// 메타 설명 생성 (AI 활용)
async function generateMetaDescription(content: string, title: string, keywords: string[]): Promise<string> {
  try {
    const response = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      system: '당신은 SEO 전문가입니다. 주어진 블로그 글에 대한 메타 설명을 생성해주세요. 155자 이내로 작성하고, 핵심 키워드를 자연스럽게 포함하며, 클릭을 유도하는 문구로 작성하세요. 메타 설명만 출력하세요.',
      messages: [{
        role: 'user',
        content: `제목: ${title}\n키워드: ${keywords.join(', ')}\n\n본문 (처음 500자):\n${content.substring(0, 500)}`,
      }],
      maxTokens: 200,
    });

    return response.trim().substring(0, 160);
  } catch (error) {
    console.error('Meta description generation failed:', error);
    // 폴백: 첫 문장 사용
    const firstParagraph = content.split('\n\n')[0] || '';
    return firstParagraph.replace(/[#*`>\[\]()]/g, '').substring(0, 155);
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = requireAuth(req);
    await checkRateLimit(user.id, 'analyze-seo');

    const { draft_id, keywords = [] } = (await req.json()) as RequestBody;

    if (!draft_id) {
      throw new Error('draft_id is required');
    }

    const supabase = getSupabaseClient(req);

    // Draft 가져오기
    const { data: draft, error: draftError } = await supabase
      .from('drafts')
      .select('*, outlines:outline_id(sections)')
      .eq('id', draft_id)
      .single();

    if (draftError) throw draftError;
    if (!draft || !draft.content) {
      throw new Error('Draft not found or has no content');
    }

    // 키워드가 제공되지 않았으면 개요에서 추출
    let targetKeywords = keywords;
    if (targetKeywords.length === 0 && draft.outlines?.sections) {
      const sections = draft.outlines.sections as { keywords?: string[] }[];
      targetKeywords = sections
        .flatMap(s => s.keywords || [])
        .filter((k, i, arr) => arr.indexOf(k) === i); // 중복 제거
    }

    // 각 지표 계산
    const keywordDensity = calculateKeywordDensity(draft.content, targetKeywords);
    const readability = calculateReadability(draft.content);
    const contentLength = analyzeContentLength(draft.content);
    const headingStructure = analyzeHeadingStructure(draft.content, targetKeywords);
    const titleOptimization = analyzeTitleOptimization(draft.title || '', targetKeywords);

    const metrics: SeoMetrics = {
      keyword_density: keywordDensity,
      readability,
      content_length: contentLength,
      heading_structure: headingStructure,
      title_optimization: titleOptimization,
    };

    const overallScore = calculateOverallScore(metrics);
    const suggestions = generateSuggestions(metrics);

    // 메타 설명 생성 (기존에 없으면)
    let metaDescription = draft.meta_description;
    if (!metaDescription) {
      metaDescription = await generateMetaDescription(draft.content, draft.title || '', targetKeywords);
    }

    // DB에 SEO 분석 결과 저장
    const seoMetrics = {
      overall_score: overallScore,
      ...metrics,
    };

    await supabase
      .from('drafts')
      .update({
        seo_metrics: seoMetrics,
        meta_description: metaDescription,
        primary_keywords: targetKeywords.length > 0 ? targetKeywords : null,
      })
      .eq('id', draft_id);

    return new Response(
      JSON.stringify({
        overall_score: overallScore,
        metrics,
        suggestions,
        generated_meta: {
          description: metaDescription,
          keywords: targetKeywords,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const status = error instanceof RateLimitError ? 429 : error instanceof AuthError ? 401 : 400;
    const safeMessage = (error instanceof AuthError || error instanceof RateLimitError) ? err.message : 'An internal error occurred.';
    console.error('Error:', err.message);
    return new Response(
      JSON.stringify({ error: safeMessage }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
