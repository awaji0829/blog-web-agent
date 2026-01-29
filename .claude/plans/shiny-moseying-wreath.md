# Blog Automation Web Integration Plan

## Overview

blog-agent의 Claude Code 자동화 시스템을 React 웹 UI에 통합합니다.
- **Backend**: Supabase Edge Functions + Anthropic API
- **Database**: Supabase PostgreSQL
- **Frontend**: 기존 React 컴포넌트 수정

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ResourceInput → InsightSelection → OutlineEditor → FinalDraft  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Supabase Client     │
                    └───────────┬───────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                    Supabase Edge Functions                       │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│ extract-     │ deep-        │ generate-    │ write-            │
│ insights     │ research     │ outline      │ draft             │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬───────────┘
       │              │              │               │
       └──────────────┴──────────────┴───────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    Anthropic API      │
                    │  (Claude Sonnet/Opus) │
                    └───────────────────────┘
```

---

## Database Schema (Supabase)

### Tables

```sql
-- 워크플로우 세션
CREATE TABLE workflow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT DEFAULT 'input', -- input, analyzing, selection, researching, outline, final
  keywords TEXT,
  target_audience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 수집된 리소스
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL, -- url, file
  source_url TEXT,
  file_name TEXT,
  file_path TEXT,
  title TEXT,
  content TEXT,
  collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 추출된 인사이트
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  signal TEXT,
  potential_angle TEXT,
  confidence TEXT, -- high, medium, low
  relevance TEXT,  -- high, medium, low
  tags TEXT[],
  status TEXT DEFAULT 'pending', -- pending, selected, rejected
  source_refs JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 심화 리서치
CREATE TABLE research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  insight_id UUID REFERENCES insights(id),
  topic TEXT,
  topic_slug TEXT,
  market_data JSONB,
  competitor_analysis JSONB,
  statistics JSONB,
  expert_opinions JSONB,
  related_trends JSONB,
  sources JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 아웃라인
CREATE TABLE outlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  research_id UUID REFERENCES research(id),
  title TEXT,
  target_audience TEXT,
  thesis TEXT,
  tone TEXT,
  structure_pattern TEXT,
  sections JSONB, -- [{id, type, title, content, keywords}]
  status TEXT DEFAULT 'draft', -- draft, approved
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 최종 초안
CREATE TABLE drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES workflow_sessions(id) ON DELETE CASCADE,
  outline_id UUID REFERENCES outlines(id),
  title TEXT,
  subtitle TEXT,
  content TEXT, -- Full markdown content
  word_count INTEGER,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'draft', -- draft, final, published
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Edge Functions

### 1. `/functions/collect-resource`

**Purpose**: URL에서 콘텐츠 수집 (웹 스크래핑)

```typescript
// POST /functions/v1/collect-resource
interface Request {
  session_id: string;
  url: string;
}

interface Response {
  resource_id: string;
  title: string;
  content: string;
}
```

### 2. `/functions/extract-insights`

**Purpose**: 수집된 리소스에서 인사이트 추출

```typescript
// POST /functions/v1/extract-insights
interface Request {
  session_id: string;
  keywords?: string;      // 선택적 주제/키워드
  target_audience?: string; // 선택적 타겟 독자
}

interface Response {
  insights: Array<{
    id: string;
    title: string;
    signal: string;
    potential_angle: string;
    confidence: 'high' | 'medium' | 'low';
    relevance: 'high' | 'medium' | 'low';
    tags: string[];
  }>;
}
```

**Anthropic API 호출**:
- Model: `claude-sonnet-4-20250514`
- System prompt: insight-extractor.md 내용 기반
- User prompt: 수집된 리소스 내용 + keywords/audience 컨텍스트

### 3. `/functions/deep-research`

**Purpose**: 선택된 인사이트에 대한 심화 리서치

```typescript
// POST /functions/v1/deep-research
interface Request {
  session_id: string;
  insight_ids: string[];
}

interface Response {
  research: Array<{
    id: string;
    topic: string;
    market_data: Array<{point: string; source: string}>;
    competitor_analysis: Array<{company: string; insight: string}>;
    statistics: Array<{stat: string; source: string}>;
    expert_opinions: Array<{quote: string; speaker: string}>;
    related_trends: Array<{trend: string; relevance: string}>;
  }>;
}
```

**Anthropic API 호출**:
- Model: `claude-sonnet-4-20250514`
- System prompt: deep-researcher.md 내용 기반
- Tools: WebSearch 활용 (Anthropic web_search tool)

### 4. `/functions/generate-outline`

**Purpose**: 리서치 결과 기반 아웃라인 생성

```typescript
// POST /functions/v1/generate-outline
interface Request {
  session_id: string;
  research_id: string;
}

interface Response {
  outline: {
    id: string;
    title: string;
    target_audience: string;
    thesis: string;
    tone: string;
    sections: Array<{
      id: string;
      type: 'intro' | 'body' | 'conclusion';
      title: string;
      content: string;
      keywords: string[];
    }>;
  };
}
```

**Anthropic API 호출**:
- Model: `claude-sonnet-4-20250514`
- System prompt: outline-writer.md + blog-standards skill 내용

### 5. `/functions/write-draft`

**Purpose**: 아웃라인 기반 블로그 글 작성

```typescript
// POST /functions/v1/write-draft
interface Request {
  session_id: string;
  outline_id: string;
  outline: OutlineData; // 사용자가 수정한 최종 아웃라인
}

interface Response {
  draft: {
    id: string;
    title: string;
    subtitle: string;
    content: string; // Full markdown
    word_count: number;
  };
}
```

**Anthropic API 호출**:
- Model: `claude-opus-4-20250514` (글쓰기는 Opus 권장)
- System prompt: blog-writer.md + writing-style.md 내용

---

## Frontend Implementation

### Phase 1: API Layer Setup

**파일**: `src/lib/api.ts`

```typescript
export const blogApi = {
  // 세션 생성
  createSession: (data) => supabase.from('workflow_sessions').insert(data),

  // 리소스 수집
  collectResource: (sessionId, url) =>
    supabase.functions.invoke('collect-resource', { body: { session_id: sessionId, url } }),

  // 인사이트 추출
  extractInsights: (sessionId, keywords?, audience?) =>
    supabase.functions.invoke('extract-insights', { body: { session_id: sessionId, keywords, target_audience: audience } }),

  // 심화 리서치
  deepResearch: (sessionId, insightIds) =>
    supabase.functions.invoke('deep-research', { body: { session_id: sessionId, insight_ids: insightIds } }),

  // 아웃라인 생성
  generateOutline: (sessionId, researchId) =>
    supabase.functions.invoke('generate-outline', { body: { session_id: sessionId, research_id: researchId } }),

  // 초안 작성
  writeDraft: (sessionId, outlineId, outline) =>
    supabase.functions.invoke('write-draft', { body: { session_id: sessionId, outline_id: outlineId, outline } }),
};
```

### Phase 2: Component Updates

#### 1. ResourceInput.tsx 수정

**현재 동작**: Mock 데이터, setTimeout으로 시뮬레이션
**변경 후**:
1. 세션 생성 (workflow_sessions)
2. URL 입력 시 → `collect-resource` Edge Function 호출
3. 파일 업로드 시 → Supabase Storage에 업로드 후 resources 테이블에 저장
4. "분석 시작하기" 클릭 → `extract-insights` 호출

```tsx
const handleStartAnalysis = async () => {
  // 1. 세션 생성
  const { data: session } = await supabase
    .from('workflow_sessions')
    .insert({ keywords, target_audience: targetAudience })
    .select()
    .single();

  // 2. URL 수집
  for (const url of urls.filter(u => u.trim())) {
    await supabase.functions.invoke('collect-resource', {
      body: { session_id: session.id, url }
    });
  }

  // 3. 인사이트 추출
  setStep('analyzing');
  const { data: result } = await supabase.functions.invoke('extract-insights', {
    body: { session_id: session.id, keywords, target_audience: targetAudience }
  });

  // 4. 다음 단계로
  setInsights(result.insights);
  setStep('selection');
};
```

#### 2. InsightSelectionScreen.tsx 수정

**현재 동작**: MOCK_INSIGHTS 하드코딩
**변경 후**:
1. DB에서 인사이트 목록 로드
2. 선택 시 insights.status를 'selected'로 업데이트
3. "진행하기" 클릭 → `deep-research` 호출

#### 3. OutlineEditor.tsx 수정

**현재 동작**: INITIAL_OUTLINE 하드코딩
**변경 후**:
1. 리서치 완료 후 `generate-outline` 호출로 초기 아웃라인 로드
2. 사용자 편집 내용 실시간 저장 (outlines 테이블)
3. AI 어시스턴트 → Anthropic API로 섹션별 피드백 제공

#### 4. FinalDraftScreen.tsx 수정

**현재 동작**: 하드코딩된 콘텐츠
**변경 후**:
1. 아웃라인 확정 후 `write-draft` 호출
2. 생성된 초안 표시 및 편집 가능
3. contentEditable 내용 drafts 테이블에 저장

---

## Implementation Order

### Step 1: Supabase Setup
1. 데이터베이스 테이블 생성 (위 스키마)
2. Row Level Security (RLS) 설정
3. Supabase Storage 버킷 생성 (파일 업로드용)

### Step 2: Edge Functions
1. `collect-resource` - 웹 스크래핑 (cheerio 또는 fetch + DOM parsing)
2. `extract-insights` - Anthropic API 연동
3. `deep-research` - Anthropic API + web_search tool
4. `generate-outline` - Anthropic API
5. `write-draft` - Anthropic API (Opus)

### Step 3: Frontend Integration
1. `src/lib/supabase.ts` - 클라이언트 설정 (완료)
2. `src/lib/api.ts` - API 레이어 생성
3. `src/features/workflow/hooks/` - React Query 또는 커스텀 훅
4. 각 컴포넌트 업데이트

### Step 4: Testing & Polish
1. 에러 핸들링 추가
2. 로딩 상태 개선
3. 실시간 진행 상태 표시 (Supabase Realtime 활용)

---

## Critical Files to Modify

```
src/
├── lib/
│   ├── supabase.ts          ✅ 완료
│   └── api.ts               🆕 생성 필요
├── features/workflow/
│   ├── types/index.ts       📝 타입 확장 필요
│   ├── hooks/               🆕 생성 필요
│   │   ├── useSession.ts
│   │   ├── useInsights.ts
│   │   └── useWorkflow.ts
│   ├── components/
│   │   ├── ResourceInput.tsx        📝 수정
│   │   ├── InsightSelectionScreen.tsx 📝 수정
│   │   ├── OutlineEditor.tsx        📝 수정
│   │   └── FinalDraftScreen.tsx     📝 수정
│   └── WorkflowContainer.tsx  📝 상태관리 수정

supabase/
├── migrations/
│   └── 001_initial_schema.sql  🆕 생성 필요
└── functions/
    ├── collect-resource/       🆕 생성 필요
    ├── extract-insights/       🆕 생성 필요
    ├── deep-research/          🆕 생성 필요
    ├── generate-outline/       🆕 생성 필요
    └── write-draft/            🆕 생성 필요
```

---

## Agent Prompts Reference

Edge Function에서 사용할 시스템 프롬프트는 blog-agent에서 가져옴:

| Function | Source File | Model |
|----------|-------------|-------|
| extract-insights | `/Users/admin/code/blog-agent/.claude/agents/insight-extractor.md` | Sonnet |
| deep-research | `/Users/admin/code/blog-agent/.claude/agents/deep-researcher.md` | Sonnet |
| generate-outline | `/Users/admin/code/blog-agent/.claude/agents/outline-writer.md` | Sonnet |
| write-draft | `/Users/admin/code/blog-agent/.claude/agents/blog-writer.md` | Opus |

추가 참조:
- `/Users/admin/code/blog-agent/.claude/skills/blog-standards/references/writing-style.md`
- `/Users/admin/code/blog-agent/.claude/skills/blog-standards/references/structure-patterns.md`

---

## Verification

1. **DB 연결 테스트**: Supabase 클라이언트로 테이블 CRUD 확인
2. **Edge Function 테스트**: 각 함수 개별 호출 테스트
3. **E2E 테스트**: 전체 워크플로우 (입력 → 인사이트 → 리서치 → 아웃라인 → 초안)
4. **UI 테스트**: 각 화면 전환 및 데이터 표시 확인

---

## SEO/GEO 최적화 구현

### 개요

초안 작성 시 SEO/GEO 최적화를 적용하고, 작성 후 분석 점수를 제공합니다.

### 1. write-draft 프롬프트 SEO 지침 추가

**파일**: `supabase/functions/write-draft/index.ts`

기존 `SYSTEM_PROMPT`에 다음 섹션 추가:

```
## SEO/GEO 최적화 원칙

### 제목(H1) 최적화
- 50-60자 이내로 작성
- 핵심 키워드를 제목 앞부분에 자연스럽게 배치
- 숫자, 질문형, "방법", "가이드" 등 클릭 유도 요소 활용

### 부제목(H2, H3) 구조화
- 본문에 최소 2-3개의 H2 헤딩 포함
- 헤딩에 관련 키워드 자연스럽게 포함
- 헤딩만 읽어도 글의 흐름을 파악할 수 있도록 구성

### 키워드 배치 전략
- 개요에서 제공된 키워드를 자연스럽게 본문에 배치
- 첫 100단어 내에 핵심 키워드 1회 이상 포함
- 키워드 밀도 1-3% 유지 (과도한 반복 금지)

### 가독성 최적화
- 문장당 평균 20-25단어 이내
- 문단당 3-5문장
- 불렛 포인트, 번호 목록 적절히 활용

### 메타 정보 생성
- 글 마지막에 다음 형식으로 메타 정보 추가:
---
meta_description: (155자 이내)
primary_keywords: [키워드 3-5개]
---
```

### 2. analyze-seo Edge Function 신규 생성

**파일**: `supabase/functions/analyze-seo/index.ts`

#### 입력/출력

```typescript
// Request
interface AnalyzeSeoRequest {
  draft_id: string;
  keywords?: string[];  // 개요에서 가져온 타겟 키워드
}

// Response
interface SeoAnalysisResult {
  overall_score: number;  // 0-100
  metrics: {
    keyword_density: { score: number; value: number; status: string };
    readability: { score: number; avg_sentence_length: number; status: string };
    content_length: { score: number; word_count: number; status: string };
    heading_structure: { score: number; h2_count: number; h3_count: number };
    title_optimization: { score: number; has_keyword: boolean };
  };
  suggestions: { priority: string; message: string }[];
  generated_meta: { description: string; keywords: string[] };
}
```

#### 분석 지표 (실용적인 것만 선별)

| 지표 | 측정 방법 | 기준 |
|------|----------|------|
| **키워드 밀도** | 정규식 매칭 | 1-3%가 적정 |
| **글자/단어 수** | 단순 카운트 | 1500-2500단어 |
| **가독성** | 문장/문단 길이 평균 | 문장 20-25단어 |
| **헤딩 구조** | Markdown H2/H3 파싱 | H2 2개 이상 |
| **제목 최적화** | 길이 + 키워드 포함 | 50-60자 |
| **메타 설명** | AI 자동 생성 | 155자 이내 |

### 3. DB 스키마 수정

**파일**: `supabase/migrations/002_add_seo_fields.sql`

```sql
ALTER TABLE drafts
  ADD COLUMN IF NOT EXISTS char_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seo_metrics JSONB,
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS primary_keywords TEXT[];
```

### 4. 프론트엔드 타입 확장

**파일**: `src/features/workflow/types/index.ts`

```typescript
export interface SeoMetrics {
  overall_score: number;
  keyword_density: { score: number; value: number; status: string };
  readability: { score: number; status: string };
  heading_structure: { score: number; h2_count: number };
  title_optimization: { score: number; has_keyword: boolean };
  suggestions: { priority: string; message: string }[];
}

// Draft 인터페이스에 추가
seo_metrics: SeoMetrics | null;
meta_description: string | null;
primary_keywords: string[] | null;
```

### 5. FinalDraftScreen 수정

**파일**: `src/features/workflow/components/FinalDraftScreen.tsx`

- 하드코딩된 SEO 분석 값을 실제 `draft.seo_metrics` 데이터로 교체
- 초안 로드 후 자동으로 `analyze-seo` 호출
- 개선 제안 표시 섹션 추가

### 6. API 확장

**파일**: `src/lib/api.ts`

```typescript
analyzeSeo: (draftId: string, keywords?: string[]) =>
  supabase.functions.invoke('analyze-seo', {
    body: { draft_id: draftId, keywords }
  }),
```

---

## 수정 파일 목록

| 파일 | 작업 |
|------|------|
| `supabase/functions/write-draft/index.ts` | SEO 지침 프롬프트 추가 |
| `supabase/functions/analyze-seo/index.ts` | 🆕 신규 생성 |
| `supabase/migrations/002_add_seo_fields.sql` | 🆕 신규 생성 |
| `src/features/workflow/types/index.ts` | SeoMetrics 타입 추가 |
| `src/features/workflow/components/FinalDraftScreen.tsx` | 실제 SEO 데이터 표시 |
| `src/lib/api.ts` | analyzeSeo 함수 추가 |

---

## Verification

1. write-draft 호출 시 SEO 최적화된 글이 생성되는지 확인
2. analyze-seo 호출 시 정확한 점수가 계산되는지 확인
3. FinalDraftScreen에서 실제 SEO 점수가 표시되는지 확인
4. 개선 제안이 의미 있게 표시되는지 확인

---

## Next Steps

사용자 승인 후 순차적으로 진행합니다.
