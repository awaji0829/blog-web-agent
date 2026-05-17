import { useState, useEffect } from "react";
import { BarChart3, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
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

function Bar({ value }: { value: number }) {
  return (
    <div className="sage-progress" style={{ height: 8 }}>
      <div
        className="sage-progress__fill"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
  score,
  tone = "ok",
}: {
  label: string;
  value: React.ReactNode;
  score: number;
  tone?: "ok" | "warn";
}) {
  return (
    <div>
      <div
        className="flex justify-between mb-1.5"
        style={{ fontSize: 13 }}
      >
        <span style={{ color: "var(--ink-soft)" }}>{label}</span>
        <span
          style={{
            fontWeight: 500,
            color: tone === "warn" ? "#7a4f1e" : "var(--forest)",
          }}
        >
          {value}
        </span>
      </div>
      <Bar value={score} />
    </div>
  );
}

export function DraftSeoPanel({ draft }: DraftSeoPanelProps) {
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysisState | null>(
    null,
  );
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);

  const draftWordCount = draft.word_count || 0;
  const draftCharCount = draft.char_count || 0;

  useEffect(() => {
    const fetchSeoAnalysis = async () => {
      if (!draft.id) return;
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
        setSeoAnalysis(
          await analyzeSeo(draft.id, draft.primary_keywords || undefined),
        );
      } catch (err) {
        console.error("SEO 분석에 실패했어요:", err);
        setSeoError("SEO 분석에 실패했어요 · 다시 시도해 주세요");
      } finally {
        setIsSeoLoading(false);
      }
    };
    fetchSeoAnalysis();
  }, [
    draft.id,
    draft.seo_metrics,
    draft.meta_description,
    draft.primary_keywords,
  ]);

  const m = seoAnalysis?.metrics;
  const loadingText = isSeoLoading ? "분석 중" : "-";

  return (
    <div className="sage-card">
      <h3
        className="sage-eyebrow flex items-center gap-2"
        style={{ marginBottom: 16 }}
      >
        <BarChart3
          className="w-4 h-4"
          style={{ color: "var(--forest)" }}
          strokeWidth={1.5}
        />
        SEO · GEO 가독성 분석
        {isSeoLoading && (
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: "var(--dusk)" }}
            strokeWidth={1.5}
          />
        )}
      </h3>

      {seoError ? (
        <div
          className="flex items-center gap-2"
          style={{ fontSize: 13, color: "#7a4f1e", padding: "8px 0" }}
        >
          <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
          {seoError}
        </div>
      ) : (
        <div className="space-y-5">
          {seoAnalysis && (
            <div
              className="flex items-center justify-between"
              style={{
                background: "var(--leaf)",
                borderRadius: "var(--r-md)",
                padding: 16,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--ink)",
                }}
              >
                종합 SEO 점수
              </span>
              <div className="flex items-center gap-2">
                <TrendingUp
                  className="w-4 h-4"
                  style={{ color: "var(--forest)" }}
                  strokeWidth={1.5}
                />
                <span
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "var(--forest)",
                  }}
                >
                  {seoAnalysis.overall_score}점
                </span>
              </div>
            </div>
          )}

          <Metric
            label="키워드 밀도"
            score={m?.keyword_density?.score || 0}
            tone={m?.keyword_density?.status === "good" ? "ok" : "warn"}
            value={
              m?.keyword_density ? (
                <>
                  {m.keyword_density.status === "good"
                    ? "좋음"
                    : m.keyword_density.status === "low"
                      ? "낮음"
                      : "높음"}{" "}
                  ({m.keyword_density.value.toFixed(1)}%)
                </>
              ) : (
                loadingText
              )
            }
          />

          <Metric
            label="가독성 점수"
            score={m?.readability?.score || 0}
            tone={m?.readability?.status === "good" ? "ok" : "warn"}
            value={
              m?.readability ? (
                <>
                  {m.readability.status === "good" ? "우수" : "개선 필요"} (
                  {m.readability.score}점)
                </>
              ) : (
                loadingText
              )
            }
          />

          <Metric
            label="콘텐츠 길이"
            score={
              m?.content_length?.score ||
              Math.min((draftWordCount / 2500) * 100, 100)
            }
            tone={m?.content_length?.status === "short" ? "warn" : "ok"}
            value={
              <>
                {draftWordCount.toLocaleString()}단어 ·{" "}
                {draftCharCount.toLocaleString()}자
              </>
            }
          />

          <Metric
            label="헤딩 구조"
            score={m?.heading_structure?.score || 0}
            tone={
              (m?.heading_structure?.score || 0) >= 70 ? "ok" : "warn"
            }
            value={
              m?.heading_structure ? (
                <>
                  H2 {m.heading_structure.h2_count}개 · H3{" "}
                  {m.heading_structure.h3_count}개
                </>
              ) : (
                loadingText
              )
            }
          />

          <Metric
            label="제목 최적화"
            score={m?.title_optimization?.score || 0}
            tone={m?.title_optimization?.status === "good" ? "ok" : "warn"}
            value={
              m?.title_optimization ? (
                <>
                  {m.title_optimization.status === "good"
                    ? "최적"
                    : m.title_optimization.status === "too_short"
                      ? "너무 짧음"
                      : "너무 김"}{" "}
                  ({m.title_optimization.length}자)
                </>
              ) : (
                loadingText
              )
            }
          />

          {seoAnalysis?.suggestions &&
            seoAnalysis.suggestions.length > 0 && (
              <div
                className="mt-4 pt-4"
                style={{ borderTop: "1px solid var(--border-sage)" }}
              >
                <div className="sage-eyebrow" style={{ marginBottom: 8 }}>
                  개선 제안
                </div>
                <div className="space-y-2">
                  {seoAnalysis.suggestions
                    .slice(0, 3)
                    .map((suggestion, idx) => {
                      const warn = suggestion.priority !== "low";
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2"
                          style={{
                            fontSize: 12,
                            padding: 8,
                            borderRadius: "var(--r-sm)",
                            background: warn
                              ? "var(--warm)"
                              : "var(--leaf)",
                            color: warn ? "#7a4f1e" : "var(--forest)",
                          }}
                        >
                          <AlertCircle
                            className="w-3 h-3 mt-0.5 shrink-0"
                            strokeWidth={1.5}
                          />
                          {suggestion.message}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
