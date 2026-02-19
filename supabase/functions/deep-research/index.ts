import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, requireAuth, AuthError } from '../_shared/supabase.ts';
import { checkRateLimit, RateLimitError } from '../_shared/rateLimit.ts';

interface RequestBody {
  session_id: string;
  insight_ids: string[];
}

interface PerplexityChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
}

interface ResearchSourceMeta {
  title: string;
  url: string;
  source_category: 'news' | 'blog' | 'report' | 'paper' | 'official' | 'sns';
  published_date: string | null;
}

interface ResearchOutput {
  topic: string;
  topic_slug: string;
  market_data: Array<{ point: string; source: string }>;
  competitor_analysis: Array<{ company: string; insight: string }>;
  statistics: Array<{ stat: string; source: string }>;
  expert_opinions: Array<{ quote: string; speaker: string }>;
  related_trends: Array<{ trend: string; relevance: string }>;
  sources?: ResearchSourceMeta[];
}

const PERPLEXITY_SYSTEM_PROMPT = `당신은 심층 리서치 어시스턴트입니다. 주어진 주제에 대해 블로그 글 작성에 필요한 최신 정보를 웹에서 검색하고, 구조화된 JSON으로 정리해주세요.

## 리서치 영역
1. **시장 데이터** - 관련 수치, 규모, 성장률, 투자 동향
2. **주요 플레이어 분석** - 관련 기업/인물/기관의 전략과 최근 동향
3. **통계 및 데이터** - 연구 결과, 보고서, 설문조사
4. **전문가 의견** - 전문가/분석가 발언, 인터뷰
5. **연관 트렌드** - 연결된 트렌드, 향후 전망

## 품질 기준
- 각 영역 최소 2개 이상의 항목
- 모든 데이터에 출처 명시 (기관명, 보고서명 등)
- 최신 정보 우선

## 출력 형식 (반드시 이 JSON만 반환)

\`\`\`json
{
  "topic": "주제명",
  "topic_slug": "topic-slug-in-english",
  "market_data": [
    {"point": "데이터 포인트", "source": "출처"}
  ],
  "competitor_analysis": [
    {"company": "기업/기관명", "insight": "분석 내용"}
  ],
  "statistics": [
    {"stat": "통계 수치", "source": "출처"}
  ],
  "expert_opinions": [
    {"quote": "인용문", "speaker": "발언자"}
  ],
  "related_trends": [
    {"trend": "트렌드", "relevance": "관련성 설명"}
  ],
  "sources": [
    {
      "title": "기사/글 제목",
      "url": "출처 URL",
      "source_category": "news | blog | report | paper | official | sns",
      "published_date": "YYYY-MM-DD 또는 null"
    }
  ]
}
\`\`\`

## sources 분류 기준
- **news**: 뉴스 기사 (언론사, 미디어)
- **blog**: 블로그, 개인/기업 블로그 포스트
- **report**: 산업 보고서, 리서치 보고서, 백서
- **paper**: 학술 논문, 연구 자료
- **official**: 공식 사이트, 정부/기관 발표
- **sns**: 소셜 미디어, 포럼 게시글

sources에는 리서치에 사용한 모든 참고 자료를 포함하세요. published_date는 확인 가능한 경우에만 기입하세요.`;

/**
 * Perplexity Sonar API로 검색 + 구조화를 한 번에 수행
 */
async function researchWithPerplexity(
  apiKey: string,
  insight: { title: string; signal: string; potential_angle: string; tags?: string[] },
): Promise<{ result: ResearchOutput; citations: string[] }> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: PERPLEXITY_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `다음 주제에 대해 심층 리서치를 수행하고 JSON으로 정리해주세요.

오늘 날짜: ${new Date().toISOString().split('T')[0]}
주제: ${insight.title}
핵심 신호: ${insight.signal}
분석 각도: ${insight.potential_angle}
관련 키워드: ${insight.tags?.join(', ') || '없음'}

가능한 최신 데이터를 우선 검색하고, 각 데이터의 출처와 날짜를 정확히 명시해주세요.`,
        },
      ],
      search_recency_filter: 'month',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
  }

  const data: PerplexityChatResponse = await response.json();
  const content = data.choices?.[0]?.message?.content || '';
  const citations = data.citations || [];

  // JSON 파싱
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/);
  let result: ResearchOutput;

  if (jsonMatch) {
    result = JSON.parse(jsonMatch[1]);
  } else {
    try {
      result = JSON.parse(content);
    } catch {
      // JSON 배열/객체 부분만 추출 시도
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        result = JSON.parse(objectMatch[0]);
      } else {
        throw new Error(`Failed to parse research JSON: ${content.substring(0, 200)}...`);
      }
    }
  }

  return { result, citations };
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = requireAuth(req);
    await checkRateLimit(user.id, 'deep-research');

    const { session_id, insight_ids } = (await req.json()) as RequestBody;

    if (!session_id || !insight_ids?.length) {
      throw new Error('session_id and insight_ids are required');
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    const supabase = getSupabaseClient(req);

    // 선택된 인사이트 가져오기
    const { data: insights, error: insightsError } = await supabase
      .from('insights')
      .select('*')
      .in('id', insight_ids);

    if (insightsError) throw insightsError;

    if (!insights || insights.length === 0) {
      throw new Error('No insights found');
    }

    // 인사이트 상태 업데이트
    await supabase
      .from('insights')
      .update({ status: 'selected' })
      .in('id', insight_ids);

    // 세션 상태 업데이트
    await supabase
      .from('workflow_sessions')
      .update({ status: 'researching' })
      .eq('id', session_id);

    // 각 인사이트에 대해 리서치 수행 (Perplexity 단일 호출)
    const researchResults = [];

    for (const insight of insights) {
      const { result, citations } = await researchWithPerplexity(
        PERPLEXITY_API_KEY,
        insight,
      );

      // sources: LLM 구조화 결과 우선, 없으면 citations URL로 폴백
      const structuredSources = (result.sources || []).map((s, i) => ({
        title: s.title || '',
        url: s.url || citations[i] || '',
        source_category: s.source_category || 'news',
        published_date: s.published_date || null,
      }));

      // LLM이 sources를 못 만든 경우 citations에서 기본 생성
      const finalSources = structuredSources.length > 0
        ? structuredSources
        : citations.map((url) => ({
            title: '',
            url,
            source_category: 'news' as const,
            published_date: null,
          }));

      // DB에 리서치 저장
      const { data: savedResearch, error: insertError } = await supabase
        .from('research')
        .insert({
          session_id,
          insight_id: insight.id,
          topic: result.topic,
          topic_slug: result.topic_slug,
          market_data: result.market_data,
          competitor_analysis: result.competitor_analysis,
          statistics: result.statistics,
          expert_opinions: result.expert_opinions,
          related_trends: result.related_trends,
          sources: finalSources,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      researchResults.push(savedResearch);
    }

    return new Response(
      JSON.stringify({ research: researchResults }),
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
