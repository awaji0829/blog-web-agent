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

    // URL에서 콘텐츠 가져오기
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
