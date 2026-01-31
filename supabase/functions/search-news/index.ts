import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  keywords: string[];
  recency?: "hour" | "day" | "week" | "month" | "year";
  max_results?: number;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date: string | null;
  last_updated: string | null;
}

interface PerplexityResponse {
  results: SearchResult[];
  id: string;
  server_time: string | null;
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

    // Perplexity Search API 호출
    const response = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: keywords,
        search_recency_filter: recency,
        max_results,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data: PerplexityResponse = await response.json();

    return new Response(
      JSON.stringify({
        results: data.results,
        total: data.results.length,
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
