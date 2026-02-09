import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  keywords: string[];
  recency?: "hour" | "day" | "week" | "month" | "year";
  max_results?: number;
}

interface PerplexityChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
}

interface TranslatedResult {
  title: string;
  snippet: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { keywords, recency = "month", max_results = 10 } =
      (await req.json()) as RequestBody;

    if (!keywords || keywords.length === 0) {
      throw new Error("keywords are required");
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) {
      throw new Error("PERPLEXITY_API_KEY not configured");
    }

    const query = keywords.join(", ");

    // Perplexity Sonar API (Chat Completions) 호출
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: `You are a Korean news research assistant. Search for recent news and articles related to the given keywords. Return ALL results in Korean (한국어). Translate titles and summaries to Korean if the original is in another language. Return results as a JSON array with exactly this format:
[
  { "title": "기사 제목 (한국어)", "snippet": "기사 요약 2-3문장 (한국어)" },
  ...
]
Return up to ${max_results} results. Respond ONLY with the JSON array, no other text.`,
          },
          {
            role: "user",
            content: `다음 주제에 대한 최신 뉴스를 검색해주세요: ${query}`,
          },
        ],
        search_recency_filter: recency,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data: PerplexityChatResponse = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    const citations = data.citations || [];

    // Perplexity 응답에서 JSON 파싱
    let rawResults: Array<{ title: string; snippet: string }> = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        rawResults = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse Perplexity response:", content);
      rawResults = [{ title: query, snippet: content.substring(0, 300) }];
    }

    // Claude Haiku로 한국어 번역
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    let translatedResults = rawResults;

    if (ANTHROPIC_API_KEY && rawResults.length > 0) {
      try {
        const translateResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-haiku-4-5",
            max_tokens: 4096,
            messages: [
              {
                role: "user",
                content: `다음 뉴스 검색 결과를 한국어로 번역해주세요. 이미 한국어인 항목은 그대로 두세요.
JSON 배열만 반환하세요. 다른 텍스트는 포함하지 마세요.

입력:
${JSON.stringify(rawResults)}

출력 형식:
[{"title": "한국어 제목", "snippet": "한국어 요약"}]`,
              },
            ],
          }),
        });

        if (translateResponse.ok) {
          const translateData = await translateResponse.json();
          const translated = translateData.content?.[0]?.text || "";
          const jsonMatch = translated.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            translatedResults = JSON.parse(jsonMatch[0]) as TranslatedResult[];
          }
        }
      } catch (err) {
        console.error("Translation failed, using original:", err);
      }
    }

    // 결과 조합 (번역 + citation URL)
    const results = translatedResults.map((item, i) => ({
      title: item.title,
      url: citations[i] || "",
      snippet: item.snippet,
      date: null,
      last_updated: null,
    }));

    return new Response(
      JSON.stringify({
        results,
        total: results.length,
        search_id: data.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
