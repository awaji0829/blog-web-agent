import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { analyzeSeo } from "@/lib/api";
import type { SeoAnalysisResult, SeoMetrics } from "@/features/workflow/types";

type SeoAnalysisState = SeoAnalysisResult;

interface Draft {
  id: string;
  title: string | null;
  word_count: number;
  char_count: number | null;
  seo_metrics: SeoMetrics | null;
  meta_description: string | null;
  primary_keywords: string[] | null;
}

interface DraftSeoPanelProps {
  draft: Draft;
}

export function DraftSeoPanel({ draft }: DraftSeoPanelProps) {
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysisState | null>(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);

  const draftWordCount = draft.word_count || 0;
  const draftCharCount = draft.char_count || 0;

  // Fetch SEO analysis when draft is loaded
  useEffect(() => {
    const fetchSeoAnalysis = async () => {
      if (!draft.id) return;

      // If we already have SEO metrics from the draft, use them
      if (draft.seo_metrics) {
        setSeoAnalysis({
          overall_score: draft.seo_metrics.overall_score || 0,
          metrics: draft.seo_metrics,
          suggestions: [],
          generated_meta: {
            description: draft.meta_description || "",
            keywords: draft.primary_keywords || [],
          },
        });
        return;
      }

      setIsSeoLoading(true);
      setSeoError(null);

      try {
        const analysis = await analyzeSeo(
          draft.id,
          draft.primary_keywords || undefined
        );
        setSeoAnalysis(analysis);
      } catch (err) {
        console.error("SEO analysis failed:", err);
        setSeoError("SEO 분석에 실패했습니다.");
      } finally {
        setIsSeoLoading(false);
      }
    };

    fetchSeoAnalysis();
  }, [draft.id, draft.seo_metrics, draft.meta_description, draft.primary_keywords]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-green-600" />
        SEO&GEO 가독성 분석
        {isSeoLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </h3>

      {seoError ? (
        <div className="flex items-center gap-2 text-amber-600 text-sm py-2">
          <AlertCircle className="w-4 h-4" />
          {seoError}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Overall Score */}
          {seoAnalysis && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">종합 SEO 점수</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-2xl font-bold text-green-600">
                    {seoAnalysis.overall_score}점
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Keyword Density */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">키워드 밀도</span>
              <span
                className={cn(
                  "font-bold",
                  seoAnalysis?.metrics?.keyword_density?.status === "good"
                    ? "text-green-600"
                    : seoAnalysis?.metrics?.keyword_density?.status === "low"
                    ? "text-amber-600"
                    : "text-red-600"
                )}
              >
                {seoAnalysis?.metrics?.keyword_density ? (
                  <>
                    {seoAnalysis.metrics.keyword_density.status === "good"
                      ? "좋음"
                      : seoAnalysis.metrics.keyword_density.status === "low"
                      ? "낮음"
                      : "높음"}{" "}
                    ({seoAnalysis.metrics.keyword_density.value.toFixed(1)}%)
                  </>
                ) : isSeoLoading ? (
                  "분석 중..."
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  seoAnalysis?.metrics?.keyword_density?.status === "good"
                    ? "bg-green-500"
                    : seoAnalysis?.metrics?.keyword_density?.status === "low"
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{
                  width: `${seoAnalysis?.metrics?.keyword_density?.score || 0}%`,
                }}
              />
            </div>
          </div>

          {/* Readability */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">가독성 점수</span>
              <span
                className={cn(
                  "font-bold",
                  seoAnalysis?.metrics?.readability?.status === "good"
                    ? "text-blue-600"
                    : "text-amber-600"
                )}
              >
                {seoAnalysis?.metrics?.readability ? (
                  <>
                    {seoAnalysis.metrics.readability.status === "good"
                      ? "우수"
                      : "개선 필요"}{" "}
                    ({seoAnalysis.metrics.readability.score}점)
                  </>
                ) : isSeoLoading ? (
                  "분석 중..."
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${seoAnalysis?.metrics?.readability?.score || 0}%`,
                }}
              />
            </div>
          </div>

          {/* Content Length */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">콘텐츠 길이</span>
              <span className="font-bold text-gray-900">
                {draftWordCount.toLocaleString()}단어 /{" "}
                {draftCharCount.toLocaleString()}자
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  seoAnalysis?.metrics?.content_length?.status === "good"
                    ? "bg-green-500"
                    : seoAnalysis?.metrics?.content_length?.status === "short"
                    ? "bg-amber-500"
                    : "bg-blue-500"
                )}
                style={{
                  width: `${
                    seoAnalysis?.metrics?.content_length?.score ||
                    Math.min((draftWordCount / 2500) * 100, 100)
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Heading Structure */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">헤딩 구조</span>
              <span
                className={cn(
                  "font-bold",
                  (seoAnalysis?.metrics?.heading_structure?.score || 0) >= 70
                    ? "text-green-600"
                    : "text-amber-600"
                )}
              >
                {seoAnalysis?.metrics?.heading_structure ? (
                  <>
                    H2: {seoAnalysis.metrics.heading_structure.h2_count}개, H3:{" "}
                    {seoAnalysis.metrics.heading_structure.h3_count}개
                  </>
                ) : isSeoLoading ? (
                  "분석 중..."
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{
                  width: `${seoAnalysis?.metrics?.heading_structure?.score || 0}%`,
                }}
              />
            </div>
          </div>

          {/* Title Optimization */}
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-600">제목 최적화</span>
              <span
                className={cn(
                  "font-bold",
                  seoAnalysis?.metrics?.title_optimization?.status === "good"
                    ? "text-green-600"
                    : "text-amber-600"
                )}
              >
                {seoAnalysis?.metrics?.title_optimization ? (
                  <>
                    {seoAnalysis.metrics.title_optimization.status === "good"
                      ? "최적"
                      : seoAnalysis.metrics.title_optimization.status ===
                        "too_short"
                      ? "너무 짧음"
                      : "너무 김"}{" "}
                    ({seoAnalysis.metrics.title_optimization.length}자)
                  </>
                ) : isSeoLoading ? (
                  "분석 중..."
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{
                  width: `${seoAnalysis?.metrics?.title_optimization?.score || 0}%`,
                }}
              />
            </div>
          </div>

          {/* Suggestions */}
          {seoAnalysis?.suggestions && seoAnalysis.suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                개선 제안
              </h4>
              <div className="space-y-2">
                {seoAnalysis.suggestions.slice(0, 3).map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-xs p-2 rounded-lg flex items-start gap-2",
                      suggestion.priority === "high"
                        ? "bg-red-50 text-red-700"
                        : suggestion.priority === "medium"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-blue-50 text-blue-700"
                    )}
                  >
                    <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    {suggestion.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
