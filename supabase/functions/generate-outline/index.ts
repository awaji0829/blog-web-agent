import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, requireAuth, AuthError } from '../_shared/supabase.ts';
import { checkRateLimit, RateLimitError } from '../_shared/rateLimit.ts';
import { callAnthropic, parseJsonResponse } from '../_shared/anthropic.ts';

interface RequestBody {
  session_id: string;
  research_id: string;
}

interface OutlineSection {
  id: string;
  type: 'intro' | 'body' | 'conclusion';
  title: string;
  content: string;
  keywords: string[];
}

interface OutlineOutput {
  title: string;
  target_audience: string;
  thesis: string;
  tone: string;
  structure_pattern: string;
  sections: OutlineSection[];
}

const SYSTEM_PROMPT = `당신은 콘텐츠 전략가로서 리서치 결과를 바탕으로 블로그 글의 구조와 개요를 설계합니다.

## 개요 설계 원칙

### 1. 독자 중심 설계
- 타겟 독자가 누구인지 명확히 정의
- 독자가 얻을 가치를 중심으로 구성
- 독자의 사전 지식 수준 고려

### 2. 논리적 흐름
- 자연스러운 정보의 흐름
- 각 섹션 간 명확한 연결
- 점진적 심화 또는 논리적 전개

### 3. 근거 기반 구성
- 리서치 데이터를 적절히 배치
- 주장과 근거의 균형
- 출처 활용 계획

## 구조 패턴 (하나 선택)

- **trend_analysis**: 시장/기술 변화 분석
- **company_analysis**: 특정 기업이나 제품 심층 분석
- **how_to**: 실용적 방법론 제공
- **comparison**: 옵션 비교
- **problem_solving**: 문제 정의 및 해결책 제시

## 출력 형식

다음 JSON 형식으로 응답해주세요:

\`\`\`json
{
  "title": "블로그 글 제목",
  "target_audience": "타겟 독자 정의",
  "thesis": "핵심 논지 (한 문장)",
  "tone": "professional|friendly|humorous",
  "structure_pattern": "trend_analysis|company_analysis|how_to|comparison|problem_solving",
  "sections": [
    {
      "id": "section-1",
      "type": "intro",
      "title": "서론: 섹션 제목",
      "content": "이 섹션에서 다룰 내용 설명. Hook, 문제 제기, 방향 제시 포함.",
      "keywords": ["키워드1", "키워드2"]
    },
    {
      "id": "section-2",
      "type": "body",
      "title": "본론 1: 섹션 제목",
      "content": "이 섹션의 핵심 포인트와 사용할 근거/데이터 설명.",
      "keywords": ["키워드"]
    },
    {
      "id": "section-3",
      "type": "body",
      "title": "본론 2: 섹션 제목",
      "content": "이 섹션의 핵심 포인트와 사용할 근거/데이터 설명.",
      "keywords": ["키워드"]
    },
    {
      "id": "section-4",
      "type": "conclusion",
      "title": "결론: 섹션 제목",
      "content": "핵심 요약, 시사점, 행동 촉구 내용.",
      "keywords": ["키워드"]
    }
  ]
}
\`\`\`

3-5개의 섹션으로 구성하세요. 서론 1개, 본론 1-3개, 결론 1개가 적절합니다.`;

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = requireAuth(req);
    await checkRateLimit(user.id, 'generate-outline');

    const { session_id, research_id } = (await req.json()) as RequestBody;

    if (!session_id || !research_id) {
      throw new Error('session_id and research_id are required');
    }

    const supabase = getSupabaseClient(req);

    // 리서치 데이터 가져오기
    const { data: research, error: researchError } = await supabase
      .from('research')
      .select('*')
      .eq('id', research_id)
      .single();

    if (researchError) throw researchError;

    // 관련 인사이트 가져오기
    const { data: insight } = await supabase
      .from('insights')
      .select('*')
      .eq('id', research.insight_id)
      .single();

    // 세션 정보 가져오기
    const { data: session } = await supabase
      .from('workflow_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    // 리서치 컨텍스트 구성
    const researchContext = `
## 주제
${research.topic}

## 인사이트
- 제목: ${insight?.title}
- 핵심 신호: ${insight?.signal}
- 분석 각도: ${insight?.potential_angle}

## 시장 데이터
${research.market_data?.map((d: any) => `- ${d.point} (${d.source})`).join('\n')}

## 경쟁 분석
${research.competitor_analysis?.map((c: any) => `- ${c.company}: ${c.insight}`).join('\n')}

## 통계
${research.statistics?.map((s: any) => `- ${s.stat} (${s.source})`).join('\n')}

## 전문가 의견
${research.expert_opinions?.map((e: any) => `- "${e.quote}" - ${e.speaker}`).join('\n')}

## 연관 트렌드
${research.related_trends?.map((t: any) => `- ${t.trend}: ${t.relevance}`).join('\n')}

${session?.target_audience ? `\n## 타겟 독자\n${session.target_audience}` : ''}
${session?.keywords ? `\n## 관심 키워드\n${session.keywords}` : ''}
`;

    const response = await callAnthropic({
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `다음 리서치 결과를 바탕으로 블로그 글 개요를 작성해주세요.\n${researchContext}`,
        },
      ],
      maxTokens: 4096,
    });

    const result = parseJsonResponse<OutlineOutput>(response);

    // DB에 아웃라인 저장
    const { data: savedOutline, error: insertError } = await supabase
      .from('outlines')
      .insert({
        session_id,
        research_id,
        title: result.title,
        target_audience: result.target_audience,
        thesis: result.thesis,
        tone: result.tone,
        structure_pattern: result.structure_pattern,
        sections: result.sections,
        status: 'draft',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 세션 상태 업데이트
    await supabase
      .from('workflow_sessions')
      .update({ status: 'outline' })
      .eq('id', session_id);

    return new Response(
      JSON.stringify({ outline: savedOutline }),
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
