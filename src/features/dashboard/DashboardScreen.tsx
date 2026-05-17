import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Plus } from "lucide-react";
import { blogApi } from "@/lib/api";
import type { DraftWithDetails } from "@/features/workflow/types";

function statusDotTone(status: "draft" | "final" | "published") {
  if (status === "published") return "var(--sage)";
  if (status === "final") return "var(--forest)";
  return "var(--dusk)";
}

function StatusTag({ status }: { status: "draft" | "final" | "published" }) {
  if (status === "published")
    return <span className="sage-tag sage-tag--brand">발행됨</span>;
  if (status === "final")
    return <span className="sage-tag sage-tag--active">최종</span>;
  return <span className="sage-tag sage-tag--neutral">초안</span>;
}

function Metric({
  label,
  value,
  delta,
  flat,
}: {
  label: string;
  value: string;
  delta: string;
  flat?: boolean;
}) {
  return (
    <div className="sage-metric">
      <div className="sage-metric__label">{label}</div>
      <div className="sage-metric__value">{value}</div>
      <div
        className="sage-metric__delta"
        style={flat ? { color: "var(--dusk)" } : undefined}
      >
        {delta}
      </div>
    </div>
  );
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setDrafts(await blogApi.getAllDrafts());
      } catch (err) {
        console.error("대시보드 데이터를 불러오지 못했어요:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const publishedCount = drafts.filter((d) => d.status === "published").length;
  const thisWeek = drafts.filter(
    (d) => new Date(d.created_at).getTime() >= weekAgo,
  ).length;
  const draftCount = drafts.filter((d) => d.status === "draft").length;
  const total = drafts.length;
  const autoRate =
    total > 0 ? Math.round((publishedCount / total) * 100) : 0;
  const recent = drafts.slice(0, 4);

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });

  return (
    <div className="flex flex-col h-full w-full">
      <header
        className="flex items-center justify-between gap-6"
        style={{
          padding: "22px 36px 18px",
          borderBottom: "1px solid var(--border-sage)",
          background: "var(--page)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            대시보드
          </div>
          <div style={{ fontSize: 13, color: "var(--dusk)", marginTop: 4 }}>
            이번 주 작성 현황을 한눈에 볼 수 있어요
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="sage-btn sage-btn--primary"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />새 글 작성
        </button>
      </header>

      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "32px 36px" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: "var(--forest)" }}
                strokeWidth={1.5}
              />
              <p style={{ fontSize: 13, color: "var(--dusk)" }}>
                현황을 불러오고 있어요 · 잠깐만요
              </p>
            </div>
          ) : (
            <>
              <section>
                <div className="sage-eyebrow" style={{ marginBottom: 12 }}>
                  이번 주
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Metric
                    label="전체 글"
                    value={String(total)}
                    delta={`작성 ${thisWeek}건`}
                  />
                  <Metric
                    label="발행됨"
                    value={String(publishedCount)}
                    delta={publishedCount > 0 ? "게시 중" : "아직 없어요"}
                    flat={publishedCount === 0}
                  />
                  <Metric
                    label="자동화율"
                    value={`${autoRate}%`}
                    delta={autoRate > 0 ? "발행 비중" : "—"}
                    flat={autoRate === 0}
                  />
                  <Metric
                    label="초안 대기"
                    value={String(draftCount)}
                    delta={draftCount > 0 ? "검토 필요" : "비어 있어요"}
                    flat={draftCount === 0}
                  />
                </div>
              </section>

              <section>
                <div className="flex items-baseline justify-between mb-3.5">
                  <h3 style={{ color: "var(--ink)" }}>최근 글</h3>
                  <span
                    onClick={() => navigate("/saved")}
                    className="inline-flex items-center gap-1 cursor-pointer"
                    style={{
                      fontSize: 13,
                      color: "var(--forest)",
                      fontWeight: 500,
                    }}
                  >
                    전체 보기{" "}
                    <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </span>
                </div>

                {recent.length === 0 ? (
                  <div
                    className="sage-card flex flex-col items-center text-center"
                    style={{ padding: "40px 24px" }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>
                      아직 작성된 글이 없어요
                    </div>
                    <div
                      style={{ fontSize: 13, color: "var(--dusk)", margin: "6px 0 16px" }}
                    >
                      첫 글을 시작해 보세요 · 약 1분이면 충분해요
                    </div>
                    <button
                      onClick={() => navigate("/")}
                      className="sage-btn sage-btn--primary sage-btn--sm"
                    >
                      <Plus className="w-4 h-4" strokeWidth={1.5} />새 글 작성
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
                    {recent.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => navigate(`/drafts/${p.id}`)}
                        style={{
                          background: "var(--page)",
                          border: "1px solid var(--border-sage)",
                          borderRadius: "var(--r-lg)",
                          padding: 20,
                          cursor: "pointer",
                          transition: "border-color var(--dur-base) var(--ease)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--border-deep)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.borderColor =
                            "var(--border-sage)")
                        }
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            className="flex items-center gap-2"
                            style={{
                              fontSize: 12,
                              color: "var(--dusk)",
                              fontWeight: 500,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: statusDotTone(p.status),
                                display: "inline-block",
                              }}
                            />
                            <span>{formatDate(p.created_at)}</span>
                          </div>
                          <StatusTag status={p.status} />
                        </div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 500,
                            color: "var(--ink)",
                            marginBottom: 6,
                            letterSpacing: "-0.015em",
                            lineHeight: 1.4,
                          }}
                        >
                          {p.title || "제목 없는 글"}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--ink-soft)",
                            lineHeight: 1.55,
                          }}
                        >
                          {p.subtitle ||
                            `${p.word_count?.toLocaleString() || 0}단어`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
