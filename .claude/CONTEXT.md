# 프로젝트 컨텍스트

**프로젝트명**: BlogFlow (SPH BLOG AGENT)
**목적**: AI 기반 자동 블로그 콘텐츠 생성 웹 애플리케이션

---

## 핵심 개념

### 워크플로우 단계
```
input → analyzing → selection → researching → outline → writing → final
```

1. **input**: URL/파일 입력 + 키워드/타겟 독자 설정
2. **analyzing**: AI가 리소스에서 인사이트 추출
3. **selection**: 사용자가 흥미로운 인사이트 선택
4. **researching**: 선택된 인사이트에 대한 심화 리서치
5. **outline**: AI가 아웃라인 생성 → 사용자 편집
6. **writing**: AI가 최종 초안 작성
7. **final**: SEO 분석 + 편집 + 발행

---

## 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- React Router v6 (라우팅)
- Tailwind CSS v4 (스타일링)
- Framer Motion (애니메이션)
- lucide-react (아이콘)

### Backend
- Supabase PostgreSQL (데이터베이스)
- Supabase Edge Functions (Deno runtime)
- Anthropic Claude API (AI)
  - Sonnet 4: 분석, 리서치, 아웃라인
  - Opus 4: 최종 글쓰기

### 외부 API
- Perplexity Search API (뉴스 검색)

---

## 데이터베이스 구조

### 핵심 테이블
- `workflow_sessions` - 워크플로우 세션 (1개 세션 = 1개 블로그 글)
- `resources` - 수집된 URL/파일
- `insights` - AI가 추출한 인사이트
- `research` - 심화 리서치 결과
- `outlines` - 아웃라인
- `drafts` - 최종 초안
- `ai_prompts` - AI 프롬프트 관리

### 관계
```
session → resources (1:N)
session → insights (1:N)
session → research (1:N)
session → outlines (1:N)
session → drafts (1:N)

insight → research (1:1)
research → outline (1:1)
outline → draft (1:1)
```

---

## 주요 디자인 결정

### 1. Mock 데이터 vs 실제 API
- **현재**: UI는 완성, Mock 데이터 사용
- **목표**: Edge Functions 구현 후 실제 API로 전환

### 2. AI 모델 선택
- **분석/리서치/아웃라인**: Claude Sonnet (빠르고 저렴)
- **최종 글쓰기**: Claude Opus (고품질 필요)

### 3. 프롬프트 관리
- DB에 저장 (`ai_prompts` 테이블)
- 관리자 UI에서 수정 가능 (`/prompts`)
- 각 Edge Function이 DB에서 로드

### 4. SEO 최적화
- AI 프롬프트에 SEO 지침 포함
- 작성 후 자동 분석 (`analyze-seo` function)
- 키워드 밀도, 가독성, 헤딩 구조 등 측정

---

## 디자인 패턴

### UI 컨포넌트
- `bg-gray-50/50` - 기본 배경
- `max-w-5xl mx-auto` - 최대 너비 제한
- `bg-white rounded-xl border border-gray-200` - 카드 스타일
- `bg-blue-600 text-white` - 주요 액션 버튼
- `hover:shadow-md transition-all` - 호버 효과

### 색상 규칙
- **주요 액션**: Blue (`bg-blue-600`)
- **긍정**: Green (`bg-green-100`)
- **경고**: Orange (`bg-orange-500`)
- **부정**: Red (`bg-red-500`)
- **중립**: Gray (`bg-gray-100`)

---

## API 호출 패턴

### Supabase Edge Function 호출
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { param1: value1, param2: value2 }
});
```

### 데이터베이스 쿼리
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column', value);
```

---

## 상태 관리

### WorkflowContainer
- `useWorkflow` 훅으로 전체 워크플로우 상태 관리
- `step` - 현재 단계
- `sessionId` - 현재 세션 ID
- `insights`, `research`, `outline`, `draft` - 각 단계 데이터

---

## 중요 파일 설명

### `src/lib/api.ts`
모든 API 호출을 중앙화. `blogApi` 객체로 export.

### `src/features/workflow/types/index.ts`
TypeScript 타입 정의. DB 스키마와 1:1 매칭.

### `src/features/workflow/hooks/useWorkflow.ts`
워크플로우 상태 관리 훅. 단계 전환, 데이터 저장.

### `CLAUDE.md`
프로젝트 가이드. Claude Code가 참조하는 메인 문서.

---

## 개발 원칙

### 1. 유지보수성 우선
- 필요 이상의 추상화 지양
- 명확한 네이밍
- 주석은 "왜"를 설명

### 2. 디자인 일관성
- 기존 페이지 스타일 유지
- 그라디언트 배경 지양 → 단색 배경
- 일관된 색상 체계

### 3. 타입 안정성
- 모든 API 응답에 타입 정의
- `any` 사용 최소화
- DB 스키마와 타입 동기화

---

## 환경 설정

### 로컬 개발
```bash
npm run dev          # 개발 서버 (localhost:5173)
npm run build        # 프로덕션 빌드
```

### Supabase
```bash
supabase start       # 로컬 Supabase 시작
supabase functions deploy [name]  # Edge Function 배포
supabase secrets set KEY=value    # 환경 변수 설정
```

---

## 자주 하는 작업

### 새 워크플로우 단계 추가
1. `types/index.ts`에 타입 추가
2. 새 컴포넌트 생성 (`src/features/workflow/components/`)
3. `WorkflowContainer.tsx`에 단계 추가
4. `useWorkflow.ts`에 상태 로직 추가

### Edge Function 생성
1. `supabase/functions/[name]/index.ts` 생성
2. `src/lib/api.ts`에 API 함수 추가
3. 타입 정의 (`types/index.ts`)
4. 컴포넌트에서 호출

---

## 트러블슈팅

### Supabase 연결 실패
- `.env` 파일에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 확인
- Supabase 프로젝트 대시보드에서 키 확인

### Edge Function 에러
- `supabase functions serve` 로그 확인
- Deno import 경로 확인 (ESM 방식)
- 환경 변수 설정 확인

### TypeScript 에러
- `npm run build` 실행해서 전체 타입 체크
- `tsconfig.json` 확인

---

## 다음 세션 시작 시 확인 사항

1. **진행 상황**: `.claude/PROGRESS.md` 읽기
2. **최근 변경**: `CHANGE.md` 읽기
3. **계획**: `.claude/plans/shiny-moseying-wreath.md` 확인
4. **현재 브랜치**: `git status` 확인
5. **빌드 상태**: `npm run build` 실행

---

## 참고 링크

- Supabase Docs: https://supabase.com/docs
- Anthropic API: https://docs.anthropic.com
- Tailwind CSS: https://tailwindcss.com
- React Router: https://reactrouter.com
