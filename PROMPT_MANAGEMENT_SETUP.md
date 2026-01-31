# 프롬프트 관리 시스템 설정 가이드

이 가이드는 AI 프롬프트 관리 기능을 완전히 활성화하기 위한 단계별 설정 방법을 안내합니다.

## 완료된 작업

✅ Database migration 파일 생성
✅ API 레이어 추가 (CRUD 함수)
✅ React UI 작성 (PromptManagerScreen)
✅ App.tsx 라우팅 설정
✅ Sidebar 메뉴 추가

## 남은 작업 (Supabase에서 실행)

### 1단계: Database Migration 실행

1. Supabase Dashboard 접속
2. SQL Editor 열기
3. 다음 파일의 내용을 복사하여 실행:
   - `/supabase/migrations/003_add_prompts_table.sql`

### 2단계: Seed Data 실행

1. 같은 SQL Editor에서 다음 파일 실행:
   - `/supabase/migrations/004_seed_prompts.sql`

**중요**: write-draft와 analyze-seo 프롬프트는 다음과 같이 수동으로 추가해야 합니다:

#### write-draft 프롬프트 추가:

```sql
-- write-draft/index.ts의 lines 29-129 내용을 복사하여 실행
INSERT INTO ai_prompts (function_name, display_name, description, system_prompt, default_prompt) VALUES (
  'write-draft',
  '초안 작성',
  '개요를 바탕으로 고품질 블로그 글 작성',
  $$[여기에 write-draft/index.ts의 SYSTEM_PROMPT 전체 내용 붙여넣기]$$,
  $$[동일한 내용]$$
) ON CONFLICT (function_name) DO NOTHING;
```

#### analyze-seo 프롬프트 추가:

```sql
INSERT INTO ai_prompts (function_name, display_name, description, system_prompt, default_prompt) VALUES (
  'analyze-seo',
  'SEO 메타 설명 생성',
  'SEO 메타 설명 생성',
  '당신은 SEO 전문가입니다. 주어진 블로그 글에 대한 메타 설명을 생성해주세요. 155자 이내로 작성하고, 핵심 키워드를 자연스럽게 포함하며, 클릭을 유도하는 문구로 작성하세요. 메타 설명만 출력하세요.',
  '당신은 SEO 전문가입니다. 주어진 블로그 글에 대한 메타 설명을 생성해주세요. 155자 이내로 작성하고, 핵심 키워드를 자연스럽게 포함하며, 클릭을 유도하는 문구로 작성하세요. 메타 설명만 출력하세요.'
) ON CONFLICT (function_name) DO NOTHING;
```

### 3단계: 데이터 확인

```sql
-- 5개의 프롬프트가 생성되었는지 확인
SELECT function_name, display_name FROM ai_prompts ORDER BY function_name;
```

예상 결과:
```
analyze-seo         | SEO 메타 설명 생성
deep-research       | 심화 리서치
extract-insights    | 인사이트 추출
generate-outline    | 개요 생성
write-draft         | 초안 작성
```

## Edge Functions 수정 (선택 사항)

현재 Edge Functions는 하드코딩된 SYSTEM_PROMPT를 사용합니다. DB에서 프롬프트를 로드하려면 다음 패턴을 적용하세요:

### 수정 패턴 (모든 Edge Functions 공통)

**파일**:
- `/supabase/functions/extract-insights/index.ts`
- `/supabase/functions/deep-research/index.ts`
- `/supabase/functions/generate-outline/index.ts`
- `/supabase/functions/write-draft/index.ts`
- `/supabase/functions/analyze-seo/index.ts`

**변경 사항**:

```typescript
// BEFORE (hardcoded)
const SYSTEM_PROMPT = `당신은...`;

// AFTER (DB-loaded with fallback)
const DEFAULT_SYSTEM_PROMPT = `당신은...`;  // 기존 SYSTEM_PROMPT를 DEFAULT로 rename

async function getSystemPrompt(
  supabase: any,
  functionName: string
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('ai_prompts')
      .select('system_prompt')
      .eq('function_name', functionName)
      .single();

    if (error || !data) {
      console.warn(`Prompt load failed for ${functionName}, using default`);
      return DEFAULT_SYSTEM_PROMPT;
    }

    return data.system_prompt;
  } catch (err) {
    console.error(`Error fetching prompt for ${functionName}:`, err);
    return DEFAULT_SYSTEM_PROMPT;
  }
}

// In serve() function
serve(async (req) => {
  try {
    const supabase = getSupabaseClient(req);

    // Load prompt from DB
    const systemPrompt = await getSystemPrompt(supabase, 'extract-insights'); // 각 함수에 맞는 이름으로 변경

    // Use loaded prompt
    const response = await callAnthropic({
      system: systemPrompt,  // 기존 SYSTEM_PROMPT 대신 사용
      messages: [...],
    });

    // ...
  }
});
```

**주의사항**:
- 각 Edge Function마다 `functionName`을 정확히 지정해야 합니다
  - extract-insights: `'extract-insights'`
  - deep-research: `'deep-research'`
  - generate-outline: `'generate-outline'`
  - write-draft: `'write-draft'`
  - analyze-seo: `'analyze-seo'`
- DEFAULT_SYSTEM_PROMPT는 fallback용으로 반드시 유지하세요
- DB 조회 실패 시 자동으로 DEFAULT_SYSTEM_PROMPT를 사용합니다

### analyze-seo 특별 처리

analyze-seo는 inline prompt를 사용하므로 다음과 같이 수정:

```typescript
// Line 375-384 근처
async function generateMetaDescription(content: string, title: string, keywords: string[]): Promise<string> {
  try {
    // DB에서 프롬프트 로드
    const supabase = getSupabaseClient(/* req */); // req를 함수 파라미터로 추가 필요
    const systemPrompt = await getSystemPrompt(supabase, 'analyze-seo');

    const response = await callAnthropic({
      model: 'claude-sonnet-4-20250514',
      system: systemPrompt,  // 기존 하드코딩된 문자열 대신
      messages: [{
        role: 'user',
        content: `제목: ${title}\n키워드: ${keywords.join(', ')}\n\n본문 (처음 500자):\n${content.substring(0, 500)}`,
      }],
      maxTokens: 200,
    });
    // ...
  }
}
```

## 사용 방법

### 웹 UI에서 프롬프트 수정

1. 개발 서버 실행: `npm run dev`
2. 브라우저에서 앱 접속
3. 왼쪽 사이드바에서 "프롬프트" 클릭
4. 수정하고 싶은 프롬프트 선택
5. 텍스트 에디터에서 수정
6. "저장" 버튼 클릭

### 기본값으로 복원

1. 프롬프트 선택
2. "기본값으로 복원" 버튼 클릭
3. 확인 다이얼로그에서 "확인"

### 프롬프트 수정 후 동작

- **Edge Functions 수정 전**: 하드코딩된 프롬프트 사용 (UI 수정 반영 안 됨)
- **Edge Functions 수정 후**: DB에서 실시간으로 프롬프트 로드 (즉시 반영)

## 트러블슈팅

### 프롬프트 목록이 비어있음

- Supabase에서 migration 및 seed가 정상적으로 실행되었는지 확인
- SQL Editor에서 `SELECT * FROM ai_prompts;` 실행하여 데이터 확인

### 프롬프트 저장 실패

- 브라우저 콘솔에서 에러 확인
- Supabase Dashboard → Logs에서 에러 확인
- RLS 정책이 올바르게 설정되었는지 확인

### Edge Function에서 프롬프트 로드 실패

- Edge Function 로그에서 warning 확인
- DEFAULT_SYSTEM_PROMPT fallback이 작동하고 있는지 확인
- Supabase 연결 설정 확인

## 다음 단계 (선택 사항)

현재 구현은 기본 기능만 포함합니다. 필요에 따라 다음 기능을 추가할 수 있습니다:

- 버전 히스토리 및 rollback
- 프롬프트 A/B 테스트
- 프롬프트 테스트 샌드박스 (샘플 입력으로 AI 응답 미리보기)
- Syntax highlighting 에디터
- 협업 기능 (변경 사항 알림)

---

**문서 작성일**: 2026-01-31
**구현 완료**: React UI, API 레이어, Database Schema
**추가 작업 필요**: Supabase Migration 실행, Edge Functions 수정 (선택)
