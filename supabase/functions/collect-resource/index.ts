import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { getSupabaseClient } from '../_shared/supabase.ts';

interface RequestBody {
  session_id: string;
  url: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { session_id, url } = (await req.json()) as RequestBody;

    if (!session_id || !url) {
      throw new Error('session_id and url are required');
    }

    const supabase = getSupabaseClient(req);

    console.log(`[collect-resource] Attempting to fetch: ${url}`);

    // URL에서 콘텐츠 가져오기
    const response = await fetch(url, {
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
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;

    // 본문 추출 (간단한 방식 - script, style, nav, header, footer 제거)
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // 최대 10000자로 제한
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }

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
    console.error('[collect-resource] Error:', error);
    console.error('[collect-resource] Error stack:', error.stack);

    return new Response(
      JSON.stringify({
        error: error.message,
        type: error.name,
        details: 'Check Edge Function logs for more information'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
