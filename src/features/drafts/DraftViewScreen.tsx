import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { blogApi } from "@/lib/api";
import { DraftEditor } from "./components/DraftEditor";
import { DraftExportPanel } from "./components/DraftExportPanel";
import { DraftSeoPanel } from "./components/DraftSeoPanel";
import { DraftThumbnailPanel } from "./components/DraftThumbnailPanel";

interface Draft {
  id: string;
  session_id: string;
  outline_id: string | null;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  word_count: number;
  char_count: number | null;
  thumbnail_url: string | null;
  status: "draft" | "final" | "published";
  seo_metrics: any;
  meta_description: string | null;
  primary_keywords: string[] | null;
  created_at: string;
  updated_at: string;
}

export function DraftViewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<Draft | null>(null);
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
      const data = await blogApi.getDraftById(id);
      setDraft(data);
    } catch (err) {
      console.error("Failed to load draft:", err);
      setError("Draft not found");
    } finally {
      setIsLoading(false);
    }
  }

  const handleBack = () => navigate("/saved");

  const handleDelete = async () => {
    if (!confirm("정말로 이 초안을 삭제하시겠습니까?")) return;

    try {
      await blogApi.deleteDraft(draft!.id);
      navigate("/saved");
    } catch (err) {
      alert("삭제에 실패했습니다.");
      console.error("Delete failed:", err);
    }
  };

  const handlePublish = async () => {
    try {
      await blogApi.publishDraft(draft!.id);
      setDraft((prev) => (prev ? { ...prev, status: "published" } : null));
      alert("발행이 완료되었습니다!");
    } catch (err) {
      alert("발행에 실패했습니다.");
      console.error("Publish failed:", err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">초안을 불러오는 중...</p>
      </div>
    );
  }

  // Error state
  if (error || !draft) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">초안을 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-4">삭제되었거나 잘못된 URL입니다.</p>
        <button
          onClick={handleBack}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          저장된 글 목록으로
        </button>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      {/* Header Bar (NO ProgressBar) */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold">{draft.title || "제목 없음"}</h1>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                draft.status === "published"
                  ? "bg-green-100 text-green-700"
                  : draft.status === "final"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              )}
            >
              {draft.status === "published"
                ? "발행됨"
                : draft.status === "final"
                ? "최종"
                : "초안"}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(draft.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[1600px] mx-auto px-8 py-6 flex gap-8">
          {/* Left: Editor */}
          <div className="flex-1">
            <DraftEditor draft={draft} isEditable={false} />
          </div>

          {/* Right: Panels */}
          <div className="w-96 space-y-6">
            <DraftExportPanel draft={draft} />
            <DraftSeoPanel draft={draft} />
            <DraftThumbnailPanel draft={draft} />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="text-red-600 font-medium hover:text-red-700"
          >
            삭제
          </button>
          <div className="flex gap-3">
            {draft.status !== "published" && (
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <Check className="w-5 h-5" />
                발행하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
