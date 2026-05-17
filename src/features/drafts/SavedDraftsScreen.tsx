import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FileText,
  Trash2,
  BarChart3,
  Loader2,
  Plus,
  Search,
  Link as LinkIcon,
} from "lucide-react";
import { blogApi } from "@/lib/api";
import type { DraftWithDetails } from "@/features/workflow/types";

interface SavedDraftsScreenProps {
  onNewDraft: () => void;
}

type StatusKey = "all" | "published" | "final" | "draft";

const FILTERS: { id: StatusKey; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "published", label: "발행됨" },
  { id: "final", label: "최종" },
  { id: "draft", label: "초안" },
];

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

export function SavedDraftsScreen({ onNewDraft }: SavedDraftsScreenProps) {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<StatusKey>("all");

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await blogApi.getAllDrafts();
      setDrafts(data);
    } catch (err) {
      console.error("초안을 불러오지 못했어요:", err);
      setError("글을 불러오지 못했어요 · 다시 시도해 주세요");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 글을 삭제할까요?")) return;
    try {
      await blogApi.deleteDraft(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    } catch (err) {
      console.error("삭제하지 못했어요:", err);
      alert("삭제하지 못했어요 · 잠시 후 다시 시도해 주세요");
    }
  };

  const filteredDrafts = drafts.filter((draft) => {
    const matchesStatus = filter === "all" || draft.status === filter;
    const matchesSearch =
      draft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && (!searchQuery || matchesSearch);
  });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="flex flex-col h-full w-full">
      {/* TopBar */}
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
            글
          </div>
          <div style={{ fontSize: 13, color: "var(--dusk)", marginTop: 4 }}>
            작성한 글을 모아 두고 발행 상태를 확인할 수 있어요
          </div>
        </div>
        <button
          onClick={onNewDraft}
          className="sage-btn sage-btn--primary"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />새 글 작성
        </button>
      </header>

      <div className="flex-1 overflow-y-auto" style={{ padding: "24px 36px 36px" }}>
        <div className="max-w-5xl mx-auto flex flex-col gap-[18px]">
          {/* Filters + search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`sage-tag ${
                    filter === f.id ? "sage-tag--active" : "sage-tag--neutral"
                  }`}
                  style={{ cursor: "pointer", padding: "6px 14px", fontSize: 13 }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative" style={{ width: 260 }}>
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--dusk)" }}
                strokeWidth={1.5}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="글 검색"
                className="sage-input"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: "var(--forest)" }}
                strokeWidth={1.5}
              />
              <p style={{ fontSize: 13, color: "var(--dusk)" }}>
                글을 불러오고 있어요 · 잠깐만요
              </p>
            </div>
          ) : error ? (
            <div
              className="sage-card flex flex-col items-center justify-center text-center"
              style={{ padding: "48px 24px" }}
            >
              <p style={{ color: "var(--ink-soft)", marginBottom: 16 }}>
                {error}
              </p>
              <button
                onClick={loadDrafts}
                className="sage-btn sage-btn--secondary sage-btn--sm"
              >
                다시 시도
              </button>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div
              className="sage-card flex flex-col items-center justify-center text-center"
              style={{ padding: "48px 24px" }}
            >
              <div
                className="sage-icon-tile"
                style={{ width: 56, height: 56 }}
              >
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--ink)",
                  marginTop: 16,
                  marginBottom: 6,
                }}
              >
                {searchQuery || filter !== "all"
                  ? "조건에 맞는 글이 없어요"
                  : "아직 작성된 글이 없어요"}
              </div>
              <div style={{ fontSize: 13, color: "var(--dusk)", marginBottom: 16 }}>
                {searchQuery || filter !== "all"
                  ? "필터를 바꾸거나 검색어를 다시 확인해 주세요"
                  : "첫 글을 시작해 보세요 · 약 1분이면 충분해요"}
              </div>
              {!searchQuery && filter === "all" && (
                <button
                  onClick={onNewDraft}
                  className="sage-btn sage-btn--primary sage-btn--sm"
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />새 글 작성
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
              {filteredDrafts.map((draft, index) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(`/drafts/${draft.id}`)}
                  className="group"
                  style={{
                    background: "var(--page)",
                    border: "1px solid var(--border-sage)",
                    borderRadius: "var(--r-lg)",
                    padding: 20,
                    cursor: "pointer",
                    transition: "border-color var(--dur-base) var(--ease)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-deep)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor = "var(--border-sage)")
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div
                        className="flex items-center gap-2 mb-2.5"
                        style={{ fontSize: 12, color: "var(--dusk)", fontWeight: 500 }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: statusDotTone(draft.status),
                            display: "inline-block",
                          }}
                        />
                        <span>{formatDate(draft.created_at)}</span>
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
                        {draft.title || "제목 없는 글"}
                      </div>
                      {draft.subtitle && (
                        <div
                          className="line-clamp-2"
                          style={{
                            fontSize: 13,
                            color: "var(--ink-soft)",
                            lineHeight: 1.55,
                            marginBottom: 12,
                          }}
                        >
                          {draft.subtitle}
                        </div>
                      )}
                      <div
                        className="flex items-center gap-4 flex-wrap"
                        style={{ fontSize: 12, color: "var(--dusk)" }}
                      >
                        <span>
                          {draft.word_count?.toLocaleString() || 0}단어
                        </span>
                        {draft.char_count != null && (
                          <span>{draft.char_count.toLocaleString()}자</span>
                        )}
                        {draft.seo_metrics && (
                          <span
                            className="flex items-center gap-1"
                            style={{ color: "var(--forest)" }}
                          >
                            <BarChart3 className="w-3 h-3" strokeWidth={1.5} />
                            SEO {draft.seo_metrics.overall_score}점
                          </span>
                        )}
                        {draft.resources && draft.resources.length > 0 && (
                          <span className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3" strokeWidth={1.5} />
                            자료 {draft.resources.length}개
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <StatusTag status={draft.status} />
                      <button
                        onClick={(e) => handleDelete(draft.id, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{
                          padding: 6,
                          borderRadius: "var(--r-sm)",
                          color: "var(--dusk)",
                        }}
                        title="삭제"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--warm)";
                          e.currentTarget.style.color = "#7a4f1e";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--dusk)";
                        }}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
