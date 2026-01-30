import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getSupabaseClient } from "../_shared/supabase.ts";
import { callAnthropic } from "../_shared/anthropic.ts";

interface OutlineSection {
  id: string;
  type: "intro" | "body" | "conclusion";
  title: string;
  content: string;
  keywords: string[];
}

interface Outline {
  id: string;
  title: string;
  target_audience: string;
  thesis: string;
  tone: string;
  sections: OutlineSection[];
}

interface RequestBody {
  session_id: string;
  outline_id: string;
  outline: Outline;
}

const SYSTEM_PROMPT = `당신은 비즈니스/산업 분석 블로그 작가입니다. 주어진 개요를 바탕으로 고품질 블로그 글을 작성합니다.

## 글쓰기 원칙

### 톤앤매너
- **전문적이면서 접근 가능한**: 전문 지식을 갖추되 일반 독자도 이해할 수 있게
- **분석적이면서 실용적인**: 깊은 분석을 제공하되 실제 적용 가능한 시사점 포함
- **객관적이면서 관점 있는**: 데이터 기반이되 명확한 해석과 관점 제시

### 문장 작성 원칙
- 한 문장에 하나의 아이디어
- 추상적 표현 대신 구체적 수치와 예시
- 전문 용어는 첫 등장시 설명

### 문단 구성
- 한 문단은 3-5문장
- 한 문단에 하나의 핵심 포인트

### 강조 표현
- **굵은 글씨**: 핵심 개념, 중요 수치
- 인용구: 전문가 의견이나 중요 문장

## SEO/GEO 최적화 원칙

### 제목(H1) 최적화
- 50-60자 이내로 작성 (검색 결과 표시 최적화)
- 핵심 키워드를 제목 앞부분에 자연스럽게 배치
- 숫자, 질문형, "방법", "가이드" 등 클릭 유도 요소 활용

### 부제목(H2, H3) 구조화
- 본문에 최소 2-3개의 H2 헤딩 포함
- 각 H2 섹션 내 필요시 H3 소제목 활용
- 헤딩에 관련 키워드 자연스럽게 포함
- 헤딩만 읽어도 글의 흐름을 파악할 수 있도록 구성

### 키워드 배치 전략
- 개요에서 제공된 키워드를 자연스럽게 본문에 배치
- 첫 100단어 내에 핵심 키워드 1회 이상 포함
- 키워드 밀도 1-3% 유지 (과도한 반복 금지)
- 키워드의 동의어, 관련어도 함께 활용

### 가독성 최적화
- 문장당 평균 20-25단어 이내
- 문단당 3-5문장 (한 문단이 너무 길지 않게)
- 불렛 포인트, 번호 목록 적절히 활용
- 핵심 개념은 **굵은 글씨**로 강조

## 출력 형식

Markdown 형식으로 전체 블로그 글을 작성해주세요.

\`\`\`markdown
# 제목

부제목 또는 리드 문장

## 서론 섹션 제목

서론 내용...

## 본론 섹션 제목

본론 내용...

> 인용이나 강조할 내용

## 결론 섹션 제목

결론 내용...

---
meta_description: 155자 이내의 메타 설명. 핵심 키워드 포함, 클릭 유도 문구
primary_keywords: [핵심키워드1, 핵심키워드2, 핵심키워드3]
---
\`\`\`

2500-3500 단어 분량으로 작성하세요. 반드시 글 마지막에 meta_description과 primary_keywords를 포함해주세요.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { session_id, outline_id, outline } =
      (await req.json()) as RequestBody;

    if (!session_id || !outline_id || !outline) {
      throw new Error("session_id, outline_id, and outline are required");
    }

    const supabase = getSupabaseClient(req);

    // 리서치 데이터 가져오기
    const { data: outlineData } = await supabase
      .from("outlines")
      .select("*, research:research_id(*)")
      .eq("id", outline_id)
      .single();

    const research = outlineData?.research;

    // 세션 상태 업데이트
    await supabase
      .from("workflow_sessions")
      .update({ status: "writing" })
      .eq("id", session_id);

    // 개요 컨텍스트 구성
    const outlineContext = `
## 글 정보
- 제목: ${outline.title}
- 타겟 독자: ${outline.target_audience}
- 핵심 논지: ${outline.thesis}
- 톤앤매너: ${outline.tone}

## 개요 구조

${outline.sections
  .map(
    (s, i) => `
### ${i + 1}. ${s.title} (${s.type})
${s.content}
키워드: ${s.keywords.join(", ")}
`,
  )
  .join("\n")}

${
  research
    ? `
## 활용 가능한 리서치 데이터

### 시장 데이터
${research.market_data?.map((d: any) => `- ${d.point} (출처: ${d.source})`).join("\n") || "없음"}

### 통계
${research.statistics?.map((s: any) => `- ${s.stat} (출처: ${s.source})`).join("\n") || "없음"}

### 전문가 의견
${research.expert_opinions?.map((e: any) => `- "${e.quote}" - ${e.speaker}`).join("\n") || "없음"}
`
    : ""
}
`;

    // Opus 모델로 글 작성 (더 높은 품질)
    const response = await callAnthropic({
      model: "claude-sonnet-4-20250514", // Opus 사용 시: 'claude-opus-4-20250514'
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `다음 개요와 리서치 데이터를 바탕으로 블로그 글을 작성해주세요.\n${outlineContext}`,
        },
      ],
      maxTokens: 8192,
    });

    // Markdown 블록 추출
    let content = response;
    const mdMatch = response.match(/```markdown\n?([\s\S]*?)\n?```/);
    if (mdMatch) {
      content = mdMatch[1];
    }

    // 제목과 부제목 추출
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : outline.title;

    // 첫 번째 단락을 부제목으로
    const lines = content.split("\n").filter((l) => l.trim());
    const subtitleIndex = lines.findIndex(
      (l) => !l.startsWith("#") && l.trim().length > 0,
    );
    const subtitle = subtitleIndex > 0 ? lines[subtitleIndex] : null;

    // 단어 수 계산
    const wordCount = content.replace(/[#*`>\[\]()]/g, "").split(/\s+/).length;

    // 글자 수 계산
    const charCount = content.replace(/[\s#*`>\[\]()]/g, "").length;

    // 메타 정보 추출
    let metaDescription: string | null = null;
    let primaryKeywords: string[] | null = null;

    const metaMatch = content.match(
      /---\s*\nmeta_description:\s*(.+)\nprimary_keywords:\s*\[([^\]]+)\]\s*\n---/,
    );
    if (metaMatch) {
      metaDescription = metaMatch[1].trim();
      primaryKeywords = metaMatch[2].split(",").map((k: string) => k.trim());
      // 메타 정보 블록을 콘텐츠에서 제거
      content = content
        .replace(/---\s*\nmeta_description:[^-]+---\s*$/m, "")
        .trim();
    }

    // DB에 초안 저장
    const { data: savedDraft, error: insertError } = await supabase
      .from("drafts")
      .insert({
        session_id,
        outline_id,
        title,
        subtitle,
        content,
        word_count: wordCount,
        char_count: charCount,
        meta_description: metaDescription,
        primary_keywords: primaryKeywords,
        status: "draft",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 세션 상태 업데이트
    await supabase
      .from("workflow_sessions")
      .update({ status: "final" })
      .eq("id", session_id);

    return new Response(
      JSON.stringify({
        draft: savedDraft,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
