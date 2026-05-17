import { useState, useEffect } from "react";
import { blogApi, type AiPrompt } from "@/lib/api";
import { Loader2, AlertCircle, RotateCcw } from "lucide-react";

export function PromptManagerScreen() {
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(
    null,
  );
  const [editingText, setEditingText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
  const hasChanges =
    selectedPrompt && editingText !== selectedPrompt.system_prompt;

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    if (selectedPrompt) setEditingText(selectedPrompt.system_prompt);
  }, [selectedPromptId]);

  async function loadPrompts() {
    try {
      setIsLoading(true);
      const data = await blogApi.getAllPrompts();
      setPrompts(data);
      if (data.length > 0 && !selectedPromptId)
        setSelectedPromptId(data[0].id);
    } catch (err) {
      setError("프롬프트를 불러오지 못했어요 · 다시 시도해 주세요");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedPromptId || !hasChanges) return;
    try {
      setIsSaving(true);
      const updated = await blogApi.updatePrompt(
        selectedPromptId,
        editingText,
      );
      setPrompts((prev) =>
        prev.map((p) => (p.id === selectedPromptId ? updated : p)),
      );
      alert("저장했어요");
    } catch (err) {
      alert("저장하지 못했어요 · 잠시 후 다시 시도해 주세요");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!selectedPromptId) return;
    if (!confirm("기본값으로 되돌릴까요? · 지금 내용은 사라져요")) return;
    try {
      setIsSaving(true);
      const updated = await blogApi.resetPromptToDefault(selectedPromptId);
      setPrompts((prev) =>
        prev.map((p) => (p.id === selectedPromptId ? updated : p)),
      );
      setEditingText(updated.system_prompt);
      alert("기본값으로 되돌렸어요");
    } catch (err) {
      alert("되돌리지 못했어요 · 잠시 후 다시 시도해 주세요");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2
          className="w-7 h-7 animate-spin"
          style={{ color: "var(--forest)" }}
          strokeWidth={1.5}
        />
        <p style={{ fontSize: 13, color: "var(--dusk)" }}>
          프롬프트를 불러오고 있어요 · 잠깐만요
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="sage-icon-tile" style={{ width: 56, height: 56 }}>
          <AlertCircle className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <p style={{ color: "var(--ink-soft)", marginTop: 16 }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left: prompt list */}
      <div
        className="w-64 overflow-y-auto flex-shrink-0"
        style={{
          background: "var(--page)",
          borderRight: "1px solid var(--border-sage)",
        }}
      >
        <div
          style={{ padding: 16, borderBottom: "1px solid var(--border-sage)" }}
        >
          <h3 style={{ color: "var(--ink)" }}>프롬프트 관리</h3>
          <p style={{ fontSize: 13, color: "var(--dusk)", marginTop: 4 }}>
            AI 함수별 시스템 프롬프트
          </p>
        </div>
        <div className="p-2">
          {prompts.map((prompt) => {
            const active = selectedPromptId === prompt.id;
            return (
              <button
                key={prompt.id}
                onClick={() => setSelectedPromptId(prompt.id)}
                className="w-full text-left mb-1"
                style={{
                  padding: 12,
                  borderRadius: "var(--r-md)",
                  background: active ? "var(--leaf)" : "transparent",
                  border: `1px solid ${active ? "var(--border-deep)" : "transparent"}`,
                  transition: "background var(--dur-base) var(--ease)",
                }}
                onMouseEnter={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "var(--mist)";
                }}
                onMouseLeave={(e) => {
                  if (!active)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: active ? "var(--forest)" : "var(--ink)",
                  }}
                >
                  {prompt.display_name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--dusk)",
                    marginTop: 4,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {prompt.function_name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main editor */}
      <div className="flex-1 flex flex-col">
        {selectedPrompt ? (
          <>
            <div
              style={{
                background: "var(--page)",
                borderBottom: "1px solid var(--border-sage)",
                padding: 24,
              }}
            >
              <h2 style={{ color: "var(--ink)", marginBottom: 8 }}>
                {selectedPrompt.display_name}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--ink-soft)",
                  marginBottom: 8,
                }}
              >
                {selectedPrompt.description}
              </p>
              <p style={{ fontSize: 13, color: "var(--dusk)" }}>
                함수{" "}
                <code
                  style={{
                    background: "var(--leaf)",
                    color: "var(--forest)",
                    padding: "2px 8px",
                    borderRadius: "var(--r-sm)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {selectedPrompt.function_name}
                </code>{" "}
                · 마지막 수정{" "}
                {new Date(selectedPrompt.updated_at).toLocaleString("ko-KR")}
              </p>
            </div>

            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="sage-textarea flex-1"
                style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
                placeholder="시스템 프롬프트를 입력해 주세요"
              />
              <div
                className="mt-3 flex justify-between"
                style={{ fontSize: 13, color: "var(--dusk)" }}
              >
                <span>{editingText.length.toLocaleString()}글자</span>
                {hasChanges && (
                  <span style={{ color: "var(--forest)", fontWeight: 500 }}>
                    저장하지 않은 변경이 있어요
                  </span>
                )}
              </div>
            </div>

            <div
              className="flex gap-3"
              style={{
                background: "var(--page)",
                borderTop: "1px solid var(--border-sage)",
                padding: 24,
              }}
            >
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="sage-btn sage-btn--primary"
              >
                {isSaving ? "저장하고 있어요" : "저장"}
              </button>
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="sage-btn sage-btn--secondary"
              >
                <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
                기본값으로 되돌리기
              </button>
            </div>
          </>
        ) : (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: "var(--dusk)" }}
          >
            왼쪽에서 프롬프트를 선택해 주세요
          </div>
        )}
      </div>
    </div>
  );
}
