import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, requireAuth, AuthError } from '../_shared/supabase.ts';
import { checkRateLimit, RateLimitError } from '../_shared/rateLimit.ts';
import { sanitizeUserInput } from '../_shared/sanitize.ts';
import { callAnthropic, parseJsonResponse } from '../_shared/anthropic.ts';

interface RequestBody {
  session_id: string;
  keywords?: string;
  target_audience?: string;
}

interface InsightOutput {
  id: string;
  title: string;
  signal: string;
  potential_angle: string;
  confidence: 'high' | 'medium' | 'low';
  relevance: 'high' | 'medium' | 'low';
  tags: string[];
}

const SYSTEM_PROMPT = `당신은 비즈니스/산업 분석 전문가로서 수집된 콘텐츠를 분석하여 블로그 주제로 발전시킬 수 있는 인사이트를 추출합니다.

## 인사이트 추출 기준

### 주목할 신호 유형
- **시장 트렌드**: 성장/하락 추세, 새로운 시장 형성
- **기술 변화**: 신기술 등장, 기술 패러다임 전환
- **비즈니스 모델 혁신**: 새로운 수익 모델, 가격 전략 변화
- **산업 재편**: M&A, 시장 진입/퇴출, 경쟁 구도 변화
- **규제/정책 변화**: 새 규제, 정책 방향 전환
- **소비자 행동 변화**: 선호도 변화, 새로운 니즈

### 인사이트 평가 기준
- **시의성**: 지금 다룰 가치가 있는가?
- **영향력**: 얼마나 많은 사람/기업에 영향을 미치는가?
- **깊이**: 분석할 내용이 충분한가?
- **차별성**: 기존 콘텐츠와 다른 관점을 제시할 수 있는가?

## 작업 지침

1. 모든 수집된 콘텐츠를 검토합니다
2. 여러 소스에서 반복되는 패턴이나 연결점을 찾습니다
3. 추상적인 인사이트보다 구체적인 신호 중심으로 작성합니다
4. 비즈니스 독자에게 가치 있는 인사이트인지 판단합니다
5. 유사한 인사이트는 통합합니다

## 출력 형식

다음 JSON 형식으로 응답해주세요:

\`\`\`json
{
  "insights": [
    {
      "id": "insight-001",
      "title": "인사이트 제목 (블로그 제목 후보)",
      "signal": "발견된 핵심 신호에 대한 설명. 어떤 변화/트렌드를 감지했는지.",
      "potential_angle": "이 인사이트를 블로그 글로 발전시킬 각도. 어떤 관점에서 분석할 수 있는지.",
      "confidence": "high|medium|low",
      "relevance": "high|medium|low",
      "tags": ["tag1", "tag2", "tag3"]
    }
  ]
}
\`\`\`

품질이 양보다 중요합니다. 3-7개의 의미 있는 인사이트를 추출해주세요.`;

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = requireAuth(req);
    await checkRateLimit(user.id, 'extract-insights');

    const { session_id, keywords, target_audience } = (await req.json()) as RequestBody;

    if (!session_id) {
      throw new Error('session_id is required');
    }

    const supabase = getSupabaseClient(req);

    // 세션의 리소스 가져오기
    const { data: resources, error: resourcesError } = await supabase
      .from('resources')
      .select('*')
      .eq('session_id', session_id);

    if (resourcesError) throw resourcesError;

    if (!resources || resources.length === 0) {
      throw new Error('No resources found for this session');
    }

    // 리소스 콘텐츠 조합
    const resourcesContent = resources
      .map((r, i) => `--- 리소스 ${i + 1}: ${r.title || 'Untitled'} ---\n${r.content || '(내용 없음)'}`)
      .join('\n\n');

    // 사용자 입력 정제 (프롬프트 주입 방지)
    const safeKeywords = keywords ? sanitizeUserInput(keywords, 200) : '';
    const safeAudience = target_audience ? sanitizeUserInput(target_audience, 200) : '';

    // 컨텍스트 구성
    let context = '';
    if (safeKeywords) {
      context += `\n\n## 관심 주제/키워드: ${safeKeywords}`;
      context += `\n이 주제와 관련된 인사이트에 높은 관련성(relevance) 점수를 부여해주세요.`;
    }
    if (safeAudience) {
      context += `\n\n## 타겟 독자: ${safeAudience}`;
      context += `\n이 독자에게 가치 있는 인사이트에 높은 관련성 점수를 부여해주세요.`;
    }

    // Anthropic API 호출
    const response = await callAnthropic({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `다음 콘텐츠를 분석하여 블로그 인사이트를 추출해주세요.${context}\n\n## 수집된 콘텐츠\n\n${resourcesContent}`,
        },
      ],
      maxTokens: 4096,
    });

    // JSON 파싱
    const result = parseJsonResponse<{ insights: InsightOutput[] }>(response);

    // DB에 인사이트 저장
    const insightsToInsert = result.insights.map((insight, index) => ({
      session_id,
      title: insight.title,
      signal: insight.signal,
      potential_angle: insight.potential_angle,
      confidence: insight.confidence,
      relevance: insight.relevance,
      tags: insight.tags,
      status: 'pending',
      source_refs: resources.map(r => ({
        source_type: r.source_type,
        source_id: r.id,
        title: r.title,
      })),
    }));

    const { data: savedInsights, error: insertError } = await supabase
      .from('insights')
      .insert(insightsToInsert)
      .select();

    if (insertError) throw insertError;

    // 세션 상태 업데이트
    await supabase
      .from('workflow_sessions')
      .update({ status: 'selection' })
      .eq('id', session_id);

    return new Response(
      JSON.stringify({ insights: savedInsights }),
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
