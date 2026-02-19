import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 일반 요청용: 호출자의 JWT로 RLS 정책 적용
export function getSupabaseClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authHeader = req.headers.get('Authorization');

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });
}

// 관리자 전용: RLS 우회가 반드시 필요한 경우에만 사용
export function getServiceRoleClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// JWT payload 로컬 디코딩
// Supabase 인프라가 이미 서명 검증을 완료했으므로 재검증 불필요
// 네트워크 호출 없이 빠르게 사용자 정보 추출
function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed JWT');
  // base64url → base64 변환 후 디코딩
  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(base64));
}

// 인증 필수 가드: 유효한 사용자 JWT가 없으면 즉시 예외 발생
// async 제거: 네트워크 호출 없이 동기로 처리
export function requireAuth(req: Request): { id: string; email?: string } {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('Missing or invalid Authorization header');
  }

  const jwt = authHeader.substring('Bearer '.length).trim();

  try {
    const payload = decodeJwtPayload(jwt);

    // 만료 확인
    const exp = payload.exp as number | undefined;
    if (exp && exp < Math.floor(Date.now() / 1000)) {
      throw new AuthError('Token expired');
    }

    // 사용자 토큰 확인
    // anon key → role: 'anon', service_role key → role: 'service_role' 모두 차단
    const role = payload.role as string | undefined;
    if (role !== 'authenticated') {
      throw new AuthError('User authentication required');
    }

    const userId = payload.sub as string | undefined;
    if (!userId) {
      throw new AuthError('Invalid token: missing user ID');
    }

    return { id: userId, email: payload.email as string | undefined };
  } catch (e) {
    if (e instanceof AuthError) throw e;
    throw new AuthError('Invalid token format');
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
