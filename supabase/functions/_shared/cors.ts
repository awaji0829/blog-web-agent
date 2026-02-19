// 허용된 오리진 목록
// Supabase 대시보드 → Edge Functions → Secrets → ALLOWED_ORIGINS 에 설정
// 예: "http://localhost:5173,https://yourdomain.com"
// 미설정 시 개발용 localhost만 허용
function getAllowedOrigins(): string[] {
  const env = Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:5173';
  return env.split(',').map(o => o.trim()).filter(Boolean);
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = getAllowedOrigins();

  // 요청 오리진이 허용 목록에 있으면 해당 오리진 반환, 없으면 첫 번째 허용 오리진 반환
  const allowedOrigin = allowed.includes(origin) ? origin : allowed[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

// CORS preflight 응답
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }
  return null;
}
