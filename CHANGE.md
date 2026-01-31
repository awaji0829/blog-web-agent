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
