import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { callAnthropic, parseJsonResponse } from '../_shared/anthropic.ts';

interface RequestBody {
  session_id: string;
  insight_ids: string[];
}

interface ResearchOutput {
  topic: string;
  topic_slug: string;
  market_data: Array<{ point: string; source: string }>;
  competitor_analysis: Array<{ company: string; insight: string }>;
  statistics: Array<{ stat: string; source: string }>;
  expert_opinions: Array<{ quote: string; speaker: string }>;
  related_trends: Array<{ trend: string; relevance: string }>;
}

const SYSTEM_PROMPT = `당신은 비즈니스 리서처로서 선정된 주제에 대해 심층 분석을 수행하고 블로그 글 작성에 필요한 맥락을 확장합니다.

## 리서치 영역

### 1. 시장 데이터 (market_data)
- 시장 규모와 성장률
- 주요 지표와 통계
- 투자 동향

### 2. 경쟁 분석 (competitor_analysis)
- 주요 플레이어
- 각 플레이어의 전략과 포지셔닝
- 최근 움직임 (M&A, 신제품, 피봇 등)

### 3. 통계 및 데이터 (statistics)
- 관련 연구 결과
- 산업 보고서 데이터
- 설문조사 결과

### 4. 전문가 의견 (expert_opinions)
- 업계 전문가 인터뷰/발언
- 분석가 의견
- 리더십 발언

### 5. 연관 트렌드 (related_trends)
- 연결된 기술/시장 트렌드
- 영향을 주고받는 요인
- 향후 전망에 영향을 미칠 요소

## 품질 기준

- 최소 3개 이상의 시장 데이터 포인트
- 최소 2개 이상의 경쟁사/기업 분석
- 모든 데이터 포인트에 출처 명시
- 최신 정보 우선 (2024-2025년 데이터)

## 출력 형식

다음 JSON 형식으로 응답해주세요:

\`\`\`json
{
  "topic": "주제명",
  "topic_slug": "topic-slug-format",
  "market_data": [
    {"point": "시장 데이터 포인트", "source": "출처"}
  ],
  "competitor_analysis": [
    {"company": "기업명", "insight": "분석 내용"}
  ],
  "statistics": [
    {"stat": "통계 수치", "source": "출처"}
  ],
  "expert_opinions": [
    {"quote": "인용문", "speaker": "발언자"}
  ],
  "related_trends": [
    {"trend": "트렌드", "relevance": "관련성 설명"}
  ]
}
\`\`\`

실제 존재하는 데이터와 출처를 사용하세요. 확인되지 않은 정보는 추측임을 명시하세요.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, insight_ids } = (await req.json()) as RequestBody;

    if (!session_id || !insight_ids?.length) {
      throw new Error('session_id and insight_ids are required');
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

    // 각 인사이트에 대해 리서치 수행
    const researchResults = [];

    for (const insight of insights) {
      const insightContext = `
## 인사이트 정보
- 제목: ${insight.title}
- 핵심 신호: ${insight.signal}
- 분석 각도: ${insight.potential_angle}
- 태그: ${insight.tags?.join(', ')}
`;

      const response = await callAnthropic({
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `다음 인사이트에 대해 심화 리서치를 수행해주세요.\n${insightContext}\n\n블로그 글 작성에 필요한 시장 데이터, 경쟁 분석, 통계, 전문가 의견, 연관 트렌드를 조사해주세요.`,
          },
        ],
        maxTokens: 4096,
      });

      const result = parseJsonResponse<ResearchOutput>(response);

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
          sources: [],
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
