import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient, requireAuth, AuthError } from '../_shared/supabase.ts';
import { checkRateLimit, RateLimitError } from '../_shared/rateLimit.ts';
import { sanitizeExternalContent } from '../_shared/sanitize.ts';

interface RequestBody {
  session_id: string;
  url: string;
}

// SSRF 방지: 허용된 스킴과 차단된 호스트 목록
const ALLOWED_SCHEMES = ['https:'];
const BLOCKED_HOSTNAMES = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
];
const BLOCKED_HOST_PATTERNS = [
  /^10\.\d+\.\d+\.\d+$/,           // 10.x.x.x (RFC 1918)
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/, // 172.16-31.x.x
  /^192\.168\.\d+\.\d+$/,           // 192.168.x.x
  /^169\.254\.\d+\.\d+$/,           // 링크-로컬 (AWS 메타데이터)
  /^fd[0-9a-f]{2}:/i,               // IPv6 ULA
];

function validateUrl(rawUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  if (!ALLOWED_SCHEMES.includes(parsed.protocol)) {
    throw new Error(`URL scheme not allowed: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    throw new Error('URL points to a blocked host');
  }

  for (const pattern of BLOCKED_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error('URL points to a private/reserved IP range');
    }
  }

  // 포트 화이트리스트: 명시적 포트가 있으면 80/443만 허용
  if (parsed.port && parsed.port !== '443' && parsed.port !== '80') {
    throw new Error('Non-standard ports are not allowed');
  }

  return parsed;
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const user = requireAuth(req);
    await checkRateLimit(user.id, 'collect-resource');

    const { session_id, url } = (await req.json()) as RequestBody;

    if (!session_id || !url) {
      throw new Error('session_id and url are required');
    }

    // SSRF 방지: URL 검증 (fetch 전에 반드시 실행)
    const validatedUrl = validateUrl(url);

    const supabase = getSupabaseClient(req);

    console.log(`[collect-resource] Attempting to fetch: ${validatedUrl.href}`);

    // URL에서 콘텐츠 가져오기 (검증된 URL만 사용)
    const response = await fetch(validatedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    console.log(`[collect-resource] Response status: ${response.status} ${response.statusText}`);
    console.log(`[collect-resource] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // 403 에러 상세 정보
      let errorDetails = `Status: ${response.status} ${response.statusText}`;

      try {
        const errorBody = await response.text();
        console.log(`[collect-resource] Error response body (first 500 chars):`, errorBody.substring(0, 500));
        errorDetails += `\nURL: ${url}\nServer: ${response.headers.get('server') || 'unknown'}`;
      } catch (e) {
        console.error('[collect-resource] Could not read error response body');
      }

      throw new Error(`Failed to fetch URL: ${errorDetails}`);
    }

    const html = await response.text();

    // 간단한 HTML 파싱 (제목과 본문 추출)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : validatedUrl.hostname;

    // 본문 추출 (script, style, nav, header, footer 제거)
    const rawText = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 주입 패턴 제거 + XML 태그 격리 + 10000자 제한
    const content = sanitizeExternalContent(rawText, 10000);

    // DB에 저장
    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        session_id,
        source_type: 'url',
        source_url: url,
        title,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        resource_id: resource.id,
        title: resource.title,
        content_length: content.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const status = error instanceof RateLimitError ? 429 : error instanceof AuthError ? 401 : 400;
    const safeMessage = (error instanceof AuthError || error instanceof RateLimitError) ? err.message : 'An internal error occurred.';
    console.error('[collect-resource] Error:', err.message);

    return new Response(
      JSON.stringify({ error: safeMessage }),
      {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
