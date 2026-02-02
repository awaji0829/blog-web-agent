# 변경 내역 (2026-01-31)

## 1. 타겟 독자 다중 선택 기능

**파일:** `src/features/workflow/components/ResourceInput.tsx`

- 단일 선택 드롭다운 → 다중 선택 체크박스 UI로 변경
- 선택된 독자층을 태그 형태로 표시 (제거 가능)
- "직접 입력" 기능으로 커스텀 독자층 추가
- 여러 독자층 선택 가능 (쉼표로 구분하여 전달)

## 2. Header를 Sidebar로 통합

**파일:**
- `src/components/shared/Sidebar.tsx` (수정)
- `src/components/shared/Layout.tsx` (수정)

- Header 컴포넌트를 Sidebar 내부로 이동
- 로고: Sidebar 상단 (데스크탑: "SPH BLOG AGENT✍️", 모바일: ✍️)
- 프로필: Sidebar 하단 (User 아이콘 + "프로필" 텍스트)
- Layout 구조 간소화 (Header 제거)

## 3. 저장된 초안 목록에 리소스/키워드 표시

**파일:**
- `src/features/workflow/types/index.ts` (DraftWithDetails 타입 추가)
- `src/lib/api.ts` (getAllDrafts 수정)
- `src/features/drafts/SavedDraftsScreen.tsx` (UI 추가)

- 각 draft 카드에 사용된 리소스 표시 (URL/파일)
- 핵심 키워드를 태그 형태로 표시
- getAllDrafts API가 session, resources 정보를 함께 반환

## 4. 뉴스 검색 목업 데이터

**파일:** `src/features/news/NewsSearchScreen.tsx`

- 실제 API 연결 전 UI 확인용 목업 데이터 추가
- 6개 샘플 뉴스 기사 (AI, 블록체인, Web3, 양자컴퓨팅 등)
- 1초 로딩 시뮬레이션
- 실제 API 전환 시 주석 처리된 코드 활성화

---

## 주요 변경 파일 목록

```
src/features/workflow/components/ResourceInput.tsx
src/features/workflow/types/index.ts
src/components/shared/Sidebar.tsx
src/components/shared/Layout.tsx
src/lib/api.ts
src/features/drafts/SavedDraftsScreen.tsx
src/features/news/NewsSearchScreen.tsx
```

## 빌드 상태

✅ TypeScript 컴파일 성공
✅ 빌드 검증 통과

---

# 변경 내역 (2026-02-02)

## 1. AI 프롬프트 DB 관리 시스템
- write-draft Edge Function이 DB의 ai_prompts 테이블에서 프롬프트를 로드하도록 변경 (PromptManagerScreen에서 수정 시 즉시 반영)

## 2. 웹 스크래핑 403 에러 대응
- collect-resource의 User-Agent를 실제 Chrome 브라우저로 위장하고 상세 로깅 추가

## 3. URL 수집 실패 에러 처리
- 모든 URL 수집 실패 시 워크플로우 중단 및 상세 에러 메시지 표시, input 단계로 복귀

## 4. 인사이트 선택 화면 레이아웃 개선
- InsightSelectionScreen의 카드 배열을 가로 그리드에서 세로 리스트로 변경해 가독성 향상

## 5. 인사이트 카드 컴팩트 디자인
- InsightCard를 수평 레이아웃으로 재설계하여 카드 높이 약 50% 감소 및 정보 밀도 향상

## 6. 리소스 입력 화면 정보 위계 개선
- ResourceInput을 섹션별 독립 카드로 분리하고, 필수 항목(참고 자료)을 상단에 강조 배치

## 7. 초안 목록 화면 리소스/키워드 표시
- SavedDraftsScreen의 각 초안 카드에 사용된 리소스와 핵심 키워드를 표시하는 정보 카드 추가

## 8. 초안 상세보기 화면 리소스/키워드 패널
- DraftViewScreen 우측에 참고 자료 및 키워드 패널 추가, getDraftById API가 리소스 정보 포함하도록 개선

## 9. 리소스 클릭으로 URL/파일 열기
- DraftResourcesPanel의 리소스 항목 클릭 시 URL은 새 탭에서 오픈, 파일은 Supabase Storage에서 다운로드/미리보기

---

## 주요 변경 파일 목록 (2026-02-02)

```
supabase/functions/write-draft/index.ts
supabase/functions/_shared/prompts.ts (신규)
supabase/migrations/006_update_write_draft_prompt.sql (신규)
supabase/functions/collect-resource/index.ts
src/features/workflow/hooks/useWorkflow.ts
src/features/workflow/WorkflowContainer.tsx
src/features/workflow/components/ResourceInput.tsx
src/features/workflow/components/InsightSelectionScreen.tsx
src/features/workflow/components/InsightCard.tsx
src/features/workflow/types/index.ts
src/features/drafts/SavedDraftsScreen.tsx
src/features/drafts/DraftViewScreen.tsx
src/features/drafts/components/DraftResourcesPanel.tsx (신규)
src/lib/api.ts
```

## 빌드 상태 (2026-02-02)

✅ TypeScript 컴파일 성공
✅ 빌드 검증 통과
