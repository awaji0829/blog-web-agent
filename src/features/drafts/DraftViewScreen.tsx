import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, Check } from "lucide-react";
import { blogApi } from "@/lib/api";
import type { DraftWithDetails } from "@/features/workflow/types";
import { DraftEditor } from "./components/DraftEditor";
import { DraftExportPanel } from "./components/DraftExportPanel";
import { DraftSeoPanel } from "./components/DraftSeoPanel";
import { DraftThumbnailPanel } from "./components/DraftThumbnailPanel";
import { DraftResourcesPanel } from "./components/DraftResourcesPanel";

function StatusTag({ status }: { status: "draft" | "final" | "published" }) {
  if (status === "published")
    return <span className="sage-tag sage-tag--brand">발행됨</span>;
  if (status === "final")
    return <span className="sage-tag sage-tag--active">최종</span>;
  return <span className="sage-tag sage-tag--neutral">초안</span>;
}

export function DraftViewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<DraftWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDraft();
  }, [id]);

  async function loadDraft() {
    if (!id) {
      navigate("/saved");
      return;
    }
    try {
      setIsLoading(true);
      setDraft(await blogApi.getDraftById(id));
    } catch (err) {
      console.error("초안을 불러오지 못했어요:", err);
      setError("not-found");
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => navigate("/saved");

  const handleDelete = async () => {
    if (!confirm("이 글을 삭제할까요?")) return;
    try {
      await blogApi.deleteDraft(draft!.id);
      navigate("/saved");
    } catch (err) {
      alert("삭제하지 못했어요 · 잠시 후 다시 시도해 주세요");
      console.error("삭제하지 못했어요:", err);
    }
  };

  const handlePublish = async () => {
    try {
      await blogApi.publishDraft(draft!.id);
      setDraft((prev) => (prev ? { ...prev, status: "published" } : null));
      alert("발행했어요 · 글 목록에서 확인할 수 있어요");
    } catch (err) {
      alert("발행에 실패했어요 · 네트워크를 확인해 주세요");
      console.error("발행하지 못했어요:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2
          className="w-7 h-7 animate-spin"
          style={{ color: "var(--forest)" }}
          strokeWidth={1.5}
        />
        <p style={{ fontSize: 13, color: "var(--dusk)" }}>
          글을 불러오고 있어요 · 잠깐만요
        </p>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <div className="sage-icon-tile" style={{ width: 56, height: 56 }}>
          <AlertCircle className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <h3 style={{ color: "var(--ink)", margin: "16px 0 6px" }}>
          글을 찾을 수 없어요
        </h3>
        <p style={{ fontSize: 13, color: "var(--dusk)", marginBottom: 16 }}>
          삭제되었거나 주소가 잘못된 것 같아요
        </p>
        <button
          onClick={handleBack}
          className="sage-btn sage-btn--primary sage-btn--sm"
        >
          글 목록으로
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header
        className="flex items-center justify-between gap-6"
        style={{
          padding: "18px 36px",
          borderBottom: "1px solid var(--border-sage)",
          background: "var(--page)",
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={handleBack}
            style={{ color: "var(--ink-soft)" }}
            title="글 목록"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <h2
            className="truncate"
            style={{ fontSize: 22, color: "var(--ink)" }}
          >
            {draft.title || "제목 없는 글"}
          </h2>
          <StatusTag status={draft.status} />
        </div>
        <p style={{ fontSize: 13, color: "var(--dusk)", whiteSpace: "nowrap" }}>
          {new Date(draft.created_at).toLocaleDateString("ko-KR")}
        </p>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <DraftEditor draft={draft} isEditable={false} />
          </div>
          <div className="w-full lg:w-96 space-y-5 shrink-0">
            <DraftResourcesPanel
              resources={draft.resources}
              keywords={draft.primary_keywords}
            />
            <DraftExportPanel draft={draft} />
            <DraftSeoPanel draft={draft} />
            <DraftThumbnailPanel draft={draft} />
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0"
        style={{
          background: "var(--page)",
          borderTop: "1px solid var(--border-sage)",
          padding: "16px 32px",
        }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="sage-btn sage-btn--ghost"
            style={{ color: "#7a4f1e" }}
          >
            삭제
          </button>
          {draft.status !== "published" && (
            <button
              onClick={handlePublish}
              className="sage-btn sage-btn--primary sage-btn--lg"
            >
              <Check className="w-4 h-4" strokeWidth={1.5} />
              발행하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
