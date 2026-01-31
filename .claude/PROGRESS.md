# 프로젝트 진행 상황

**마지막 업데이트**: 2026-01-31
**현재 상태**: 기본 UI 구현 완료, Edge Functions 대기 중

---

## 완료된 작업 ✅

### 1. 프로젝트 초기 설정
- [x] React + Vite + TypeScript 환경 구성
- [x] Supabase 클라이언트 설정 (`src/lib/supabase.ts`)
- [x] 라우팅 구조 설정 (React Router)
- [x] 기본 레이아웃 컴포넌트 (Sidebar, Header → Sidebar 통합)

### 2. 데이터베이스 (Supabase)
- [x] 스키마 설계 (`supabase/migrations/001_initial_schema.sql`)
- [x] SEO 필드 추가 (`supabase/migrations/002_add_seo_fields.sql`)
- [x] AI 프롬프트 관리 테이블 (`supabase/migrations/003_add_prompts.sql`)
- [x] 기본 프롬프트 시드 데이터 (`supabase/migrations/004_seed_prompts.sql`)

### 3. API 레이어
- [x] `src/lib/api.ts` - 전체 API 함수 구현
  - Session, Resource, Insight, Research, Outline, Draft API
  - SEO 분석 API
  - AI 프롬프트 관리 API
  - 뉴스 검색 API (Perplexity)
- [x] TypeScript 타입 정의 (`src/features/workflow/types/index.ts`)
  - Draft, DraftWithDetails 타입
  - SeoMetrics, SeoAnalysisResult 타입
  - 기타 워크플로우 타입

### 4. 워크플로우 컴포넌트
- [x] `WorkflowContainer.tsx` - 전체 워크플로우 오케스트레이터
- [x] `useWorkflow.ts` - 상태 관리 훅
- [x] `ResourceInput.tsx` - URL/파일 입력 (다중 타겟 독자 선택 기능)
- [x] `AnalysisLoading.tsx` - 분석 로딩 화면
- [x] `InsightSelectionScreen.tsx` - 인사이트 선택
- [x] `DeepResearchLoading.tsx` - 리서치 로딩 화면
- [x] `OutlineEditor.tsx` - 아웃라인 편집
- [x] `FinalDraftScreen.tsx` - 최종 초안 + SEO 분석

### 5. 기타 화면
- [x] `SavedDraftsScreen.tsx` - 저장된 초안 목록 (리소스/키워드 표시)
- [x] `DraftViewScreen.tsx` - 개별 초안 보기
- [x] `PromptManagerScreen.tsx` - AI 프롬프트 관리
- [x] `NewsSearchScreen.tsx` - 뉴스 검색 (목업 데이터)

### 6. 최근 작업 (2026-01-31)
- [x] 타겟 독자 다중 선택 기능 (`ResourceInput.tsx`)
- [x] Header를 Sidebar로 통합 (로고 상단, 프로필 하단)
- [x] SavedDraftsScreen에 리소스/키워드 표시
- [x] NewsSearchScreen 목업 데이터 추가

---

## 진행 중 / 대기 중 🔄

### Edge Functions (Supabase)
- [ ] `supabase/functions/collect-resource` - URL 스크래핑
- [ ] `supabase/functions/extract-insights` - Claude API로 인사이트 추출
- [ ] `supabase/functions/deep-research` - Claude API + web_search
- [ ] `supabase/functions/generate-outline` - 아웃라인 생성
- [ ] `supabase/functions/write-draft` - 초안 작성 (Opus)
- [ ] `supabase/functions/analyze-seo` - SEO 분석
- [ ] `supabase/functions/search-news` - Perplexity API 연동

### 환경 변수 설정
- [ ] `ANTHROPIC_API_KEY` - Supabase Edge Functions 환경 변수
- [ ] `PERPLEXITY_API_KEY` - 뉴스 검색용

---

## 현재 워크플로우 동작 방식

### 프론트엔드 (개발 모드)
- ✅ 모든 UI 컴포넌트 작동
- ⚠️ Mock 데이터 사용 중 (실제 API 연동 대기)

### 데이터 흐름
```
1. ResourceInput → Mock 분석 → InsightSelectionScreen
2. 인사이트 선택 → Mock 리서치 → OutlineEditor
3. 아웃라인 편집 → Mock 초안 작성 → FinalDraftScreen
4. 초안 저장 → drafts 테이블 (실제 DB 사용)
```

---

## 다음 단계 (우선순위)

### 1단계: Edge Functions 구현
1. `collect-resource` - 웹 스크래핑 기본 구현
2. `extract-insights` - Claude Sonnet API 연동
3. `deep-research` - Claude Sonnet + web_search tool
4. `generate-outline` - Claude Sonnet API
5. `write-draft` - Claude Opus API
6. `analyze-seo` - SEO 점수 계산 알고리즘

### 2단계: 프론트엔드 통합
1. `ResourceInput.tsx` - 실제 API 호출로 변경
2. `InsightSelectionScreen.tsx` - DB 데이터 로드
3. `OutlineEditor.tsx` - AI 어시스턴트 연동
4. `FinalDraftScreen.tsx` - 실제 SEO 분석 연동

### 3단계: 기능 개선
1. 에러 핸들링 강화
2. 로딩 상태 개선
3. 실시간 진행 상태 (Supabase Realtime)
4. 뉴스 검색 Perplexity API 연동

---

## 참고 파일 위치

### 프롬프트 소스 (blog-agent)
```
/Users/admin/code/blog-agent/.claude/agents/
├── insight-extractor.md
├── deep-researcher.md
├── outline-writer.md
└── blog-writer.md

/Users/admin/code/blog-agent/.claude/skills/blog-standards/references/
├── writing-style.md
└── structure-patterns.md
```

### 현재 프로젝트 구조
```
src/
├── lib/
│   ├── supabase.ts          ✅ 완료
│   ├── api.ts               ✅ 완료
│   └── utils.ts
├── features/
│   ├── workflow/            ✅ UI 완료, API 연동 대기
│   ├── drafts/              ✅ 완료
│   ├── prompts/             ✅ 완료
│   └── news/                ✅ UI 완료, API 연동 대기
└── components/shared/       ✅ 완료

supabase/
├── migrations/              ✅ 완료
└── functions/               ⚠️ 대기 중
```

---

## 중요 노트

### Mock 데이터 → 실제 API 전환
각 컴포넌트에서 `// 🎭 MOCK DATA` 또는 `// TODO: Replace with real API` 주석을 찾아서 실제 API 호출로 교체해야 합니다.

### Edge Functions 배포
```bash
supabase functions deploy [function-name]
supabase secrets set ANTHROPIC_API_KEY=your_key
supabase secrets set PERPLEXITY_API_KEY=your_key
```

### 테스트 순서
1. DB 연결 테스트 (Supabase 클라이언트)
2. 개별 Edge Function 테스트
3. E2E 워크플로우 테스트
4. UI 통합 테스트

---

## 관련 문서

- 전체 계획: `.claude/plans/shiny-moseying-wreath.md`
- 변경 이력: `CHANGE.md`
- 뉴스 검색: `PERPLEXITY_SEARCH_SETUP.md`
- 프로젝트 가이드: `CLAUDE.md`
