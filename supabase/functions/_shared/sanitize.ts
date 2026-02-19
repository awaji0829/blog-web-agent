/**
 * Prompt Injection 방지 유틸리티
 *
 * 두 가지 레벨:
 *   1. sanitizeUserInput  — 인증된 사용자 입력 (keywords, target_audience, outline 필드)
 *   2. sanitizeExternalContent — 외부 URL에서 fetch한 HTML 파싱 결과 (신뢰 불가)
 */

// 알려진 프롬프트 주입 패턴 (케이스 무관)
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+instructions?/gi,
  /forget\s+(your|the|all)?\s*(previous\s+)?instructions?/gi,
  /you\s+are\s+now\s+(a|an|the)\s+/gi,
  /\[SYSTEM\]/gi,
  /\[USER\]/gi,
  /\[ASSISTANT\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /<\|endoftext\|>/gi,
  /---+\s*SYSTEM\s*---+/gi,
  /===+\s*SYSTEM\s*===+/gi,
  /new\s+instruction[s]?\s*:/gi,
  /override\s+(previous\s+)?instructions?/gi,
  /disregard\s+(previous\s+|the\s+)?instructions?/gi,
  /reveal\s+(your\s+)?(system\s+)?prompt/gi,
  /print\s+(the\s+)?(api[_\s]key|anthropic|openai)/gi,
];

// null byte, 과도한 개행(3개 이상 연속), 제어 문자 제거
function stripControlChars(text: string): string {
  return text
    .replace(/\0/g, '')           // null byte
    .replace(/\r/g, '')           // carriage return
    .replace(/\n{3,}/g, '\n\n')   // 3개 이상 연속 개행 → 2개로
    .trim();
}

/**
 * 인증된 사용자 입력 필드 정제
 * - keywords, target_audience, outline 제목/본문 등
 */
export function sanitizeUserInput(text: string, maxLength = 500): string {
  if (!text) return '';

  let result = text.substring(0, maxLength * 2); // 먼저 느슨하게 자르기
  result = stripControlChars(result);

  // 주입 패턴 제거
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, '[제거됨]');
  }

  // 최종 길이 제한
  if (result.length > maxLength) {
    result = result.substring(0, maxLength) + '...';
  }

  return result;
}

/**
 * 외부 URL에서 가져온 텍스트 정제 (더 공격적인 필터링)
 * - 주입 패턴 제거 후 XML 구분자로 감싸서 모델이 "데이터"로 인식하도록 격리
 */
export function sanitizeExternalContent(content: string, maxLength = 10000): string {
  if (!content) return '';

  let result = content.substring(0, maxLength * 2);
  result = stripControlChars(result);

  // 주입 패턴 제거
  for (const pattern of INJECTION_PATTERNS) {
    result = result.replace(pattern, '[content removed]');
  }

  // 최종 길이 제한
  if (result.length > maxLength) {
    result = result.substring(0, maxLength) + '...';
  }

  // XML 태그로 감싸서 프롬프트 구조와 격리
  // → 모델이 이 안의 내용을 지시문이 아닌 데이터로 인식
  return `<external_content>\n${result}\n</external_content>`;
}

/**
 * 문자열 배열 일괄 정제 (tags 등)
 */
export function sanitizeStringArray(arr: string[], maxItemLength = 50): string[] {
  return arr
    .slice(0, 20) // 최대 20개
    .map(item => sanitizeUserInput(item, maxItemLength))
    .filter(item => item.length > 0);
}
