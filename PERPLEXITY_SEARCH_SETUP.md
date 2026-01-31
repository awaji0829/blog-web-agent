# Perplexity 뉴스 검색 API 구현 완료

## 구현 내용

Perplexity Search API를 사용한 키워드 기반 최신 뉴스 검색 기능이 구현되었습니다.

### 구현된 파일

1. **Edge Function**: [/supabase/functions/search-news/index.ts](supabase/functions/search-news/index.ts)
   - Perplexity Search API 호출
   - 키워드 배열, 최신성 필터, 결과 개수 파라미터 지원

2. **API 레이어**: [/src/lib/api.ts](src/lib/api.ts)
   - `searchRecentNews()` 함수 추가
   - TypeScript 타입 정의 (NewsSearchResult, NewsSearchResponse)

---

## 사용 방법

### 1. 환경 변수 설정

Supabase Dashboard에서 Edge Function 환경 변수 추가:

```
PERPLEXITY_API_KEY=your-perplexity-api-key
```

### 2. Edge Function 배포

```bash
supabase functions deploy search-news
```

### 3. 코드에서 사용

```typescript
import { blogApi } from '@/lib/api';

// 최근 30일 이내 뉴스 검색
const response = await blogApi.searchRecentNews(
  ['AI 에이전트', '2026 트렌드'],  // 키워드 배열
  'month',                          // 최신성: hour, day, week, month, year
  10                                // 최대 결과 개수
);

console.log(response.results);
// [
//   {
//     title: "AI 에이전트, 2026년 기업 필수 기술로 부상",
//     url: "https://example.com/article-123",
//     snippet: "2026년 기업들이 AI 에이전트를 도입하며...",
//     date: "2026-01-15",
//     last_updated: "2026-01-20"
//   },
//   ...
// ]
```

---

## API 스펙

### 함수 시그니처

```typescript
async function searchRecentNews(
  keywords: string[],
  recency?: 'hour' | 'day' | 'week' | 'month' | 'year',
  maxResults?: number
): Promise<NewsSearchResponse>
```

### 파라미터

- **keywords** (required): 검색 키워드 배열
- **recency** (optional): 최신성 필터 (기본값: 'month')
  - `'hour'`: 최근 1시간
  - `'day'`: 최근 24시간
  - `'week'`: 최근 7일
  - `'month'`: 최근 30일
  - `'year'`: 최근 365일
- **maxResults** (optional): 최대 결과 개수 (기본값: 10)

### 응답 형식

```typescript
interface NewsSearchResponse {
  results: NewsSearchResult[];  // 검색 결과 배열
  total: number;                // 결과 개수
  search_id: string;            // Perplexity 검색 ID
}

interface NewsSearchResult {
  title: string;           // 기사 제목
  url: string;             // 기사 URL
  snippet: string;         // 기사 요약
  date: string | null;     // 게시 날짜 (YYYY-MM-DD)
  last_updated: string | null;  // 최종 수정 날짜 (YYYY-MM-DD)
}
```

---

## 사용 예시

### 예시 1: 최근 뉴스 검색

```typescript
const news = await blogApi.searchRecentNews(
  ['OpenAI', 'GPT-5'],
  'week',  // 최근 7일
  5        // 최대 5개
);

news.results.forEach(article => {
  console.log(`${article.title} - ${article.date}`);
  console.log(article.url);
});
```

### 예시 2: 실시간 뉴스 검색

```typescript
const breaking = await blogApi.searchRecentNews(
  ['긴급속보', '한국'],
  'hour',  // 최근 1시간
  20
);
```

### 예시 3: 월간 트렌드 분석

```typescript
const trends = await blogApi.searchRecentNews(
  ['AI', 'Blockchain', 'Web3'],
  'month',
  50
);

// 날짜별 기사 수 분석
const byDate = trends.results.reduce((acc, article) => {
  const date = article.date || 'unknown';
  acc[date] = (acc[date] || 0) + 1;
  return acc;
}, {});
```

---

## 주의사항

1. **API 키 관리**
   - Perplexity API 키는 Supabase Edge Function 환경 변수로 관리
   - 절대 클라이언트 코드에 노출하지 말 것

2. **비용 관리**
   - Perplexity API는 호출당 과금
   - maxResults를 적절히 제한할 것

3. **에러 처리**
   - API 키 미설정 시: "PERPLEXITY_API_KEY not configured"
   - 키워드 미입력 시: "keywords are required"
   - Perplexity API 오류 시: "Perplexity API error: {status}"

---

## 검증 완료

- ✅ TypeScript 컴파일 성공
- ✅ Edge Function 코드 작성 완료
- ✅ API 레이어 통합 완료
- ✅ 타입 안정성 확보

---

## UI 구현 완료 ✨

뉴스 검색 페이지가 추가되었습니다!

### 추가된 파일

4. **UI 컴포넌트**: [/src/features/news/NewsSearchScreen.tsx](src/features/news/NewsSearchScreen.tsx)
   - 키워드 태그 입력 UI
   - 검색 기간 선택 (1시간 ~ 1년)
   - 검색 결과 카드 뷰
   - 반응형 디자인

### 접속 방법

1. 개발 서버 실행: `npm run dev`
2. 왼쪽 사이드바에서 "뉴스 검색" 클릭
3. 또는 직접 접속: `http://localhost:5173/news`

### 사용 방법

1. **키워드 입력**
   - 텍스트 입력 후 Enter 또는 "추가" 버튼
   - 여러 키워드 추가 가능 (태그 형태)
   - X 버튼으로 키워드 제거

2. **검색 기간 선택**
   - 1시간, 24시간, 1주일, 1개월, 1년 중 선택
   - 기본값: 1개월

3. **검색**
   - "검색하기" 버튼 클릭
   - 결과는 카드 형태로 표시
   - 제목, 요약, 날짜 정보 포함
   - 외부 링크 아이콘으로 원문 이동

### UI 특징

- 🎨 그라데이션 배경 (오렌지 → 화이트 → 블루)
- 💫 애니메이션 효과 (호버, 트랜지션)
- 📱 반응형 디자인
- 🎯 직관적인 태그 입력
- 🔍 실시간 검색
- ⚡ 로딩 상태 표시
- ❌ 에러 핸들링

---

## 배포 전 체크리스트

- [ ] Supabase에 `PERPLEXITY_API_KEY` 환경 변수 설정
- [ ] `supabase functions deploy search-news` 실행
- [ ] `/news` 페이지 접속하여 테스트
- [ ] 검색 결과 확인

**빌드 검증**: ✅ 통과 (에러 없음)
