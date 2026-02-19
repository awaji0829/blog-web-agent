import { getServiceRoleClient } from './supabase.ts';

// 함수별 시간당 최대 호출 횟수
// Claude/Perplexity API를 직접 호출하는 함수에만 제한 적용
const HOURLY_LIMITS: Record<string, number> = {
  'collect-resource':  30,   // URL 수집: 시간당 30개 URL
  'extract-insights':  10,   // Claude Sonnet 호출
  'deep-research':      5,   // Perplexity Sonar 호출 (가장 비쌈)
  'generate-outline':  10,   // Claude Sonnet 호출
  'write-draft':        5,   // Claude Sonnet 16k 토큰 (가장 비쌈)
  'analyze-seo':       20,   // Claude Haiku 호출
  'search-news':       20,   // Perplexity Sonar 호출
};

export class RateLimitError extends Error {
  readonly limit: number;
  readonly functionName: string;

  constructor(functionName: string, limit: number) {
    super(`Rate limit exceeded. ${functionName} allows ${limit} calls per hour.`);
    this.name = 'RateLimitError';
    this.limit = limit;
    this.functionName = functionName;
  }
}

/**
 * 유저의 해당 함수 호출 횟수를 증가시키고, 한도 초과 시 예외를 던집니다.
 * - service role 클라이언트로 rate_limits 테이블에 접근
 * - DB 오류 발생 시 로깅만 하고 통과 (가용성 우선)
 */
export async function checkRateLimit(
  userId: string,
  functionName: string
): Promise<void> {
  const maxCalls = HOURLY_LIMITS[functionName] ?? 10;
  const supabase = getServiceRoleClient();

  const { data, error } = await supabase.rpc('check_and_increment_rate_limit', {
    p_user_id:       userId,
    p_function_name: functionName,
    p_max_calls:     maxCalls,
  });

  if (error) {
    // DB 오류 시 rate limit을 강제하지 않음 (서비스 중단 방지)
    console.error(`[rate-limit] DB error for ${functionName}:`, error.message);
    return;
  }

  if (data === false) {
    throw new RateLimitError(functionName, maxCalls);
  }
}
