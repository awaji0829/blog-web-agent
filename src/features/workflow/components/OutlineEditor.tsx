import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowLeft,
  FileText,
  Send,
  Sparkles,
  AlignLeft,
  FileEdit,
  Lightbulb,
} from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface OutlineSection {
  id: string;
  type: "intro" | "body" | "conclusion";
  title: string;
  content: string;
  keywords: string[];
}

interface OutlineData {
  sections: OutlineSection[];
  tone: string;
}

interface OutlineEditorProps {
  onBack: () => void;
  onNext: (data: OutlineData) => void;
  selectedInsights?: {
    id: string;
    title: string;
    summary: string;
    targetAudience: string;
    keywords: string[];
  }[];
  outline?: OutlineData | null;
  isLoading?: boolean;
}

const LOADING_TEXTS = [
  "리서치 결과를 분석해 글 구조를 설계하고 있어요",
  "각 섹션에 들어갈 핵심 내용을 구성하고 있어요",
  "논리적인 흐름으로 개요를 정리하고 있어요 · 약 30초 소요",
];

function OutlineLoadingScreen() {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(
      () => setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length),
      4000,
    );
    const progressInterval = setInterval(() => {
      setProgress((prev) =>
        prev >= 95 ? 95 : Math.min(prev + Math.random() * 2, 95),
      );
    }, 100);
    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <ProgressBar currentStep={5} />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="sage-icon-tile mb-8"
          style={{ width: 72, height: 72, borderRadius: "var(--r-lg)" }}
        >
          <FileEdit className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="text-center max-w-lg w-full">
          <h2 style={{ color: "var(--ink)", marginBottom: 16 }}>
            개요를 생성하고 있어요
          </h2>
          <div
            className="mx-auto"
            style={{ maxWidth: 360, marginBottom: 20 }}
          >
            <div className="sage-progress">
              <div
                className="sage-progress__fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div className="h-7 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="absolute w-full left-0 right-0"
                style={{ fontSize: 15, color: "var(--ink-soft)" }}
              >
                {LOADING_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="mt-16 flex items-center gap-3 max-w-md"
          style={{
            background: "var(--leaf)",
            borderRadius: "var(--r-md)",
            padding: "14px 16px",
          }}
        >
          <Lightbulb
            className="w-5 h-5 flex-shrink-0"
            style={{ color: "var(--forest)" }}
            strokeWidth={1.5}
          />
          <p style={{ fontSize: 13, color: "var(--forest)", lineHeight: 1.55 }}>
            개요가 만들어지면 섹션 순서와 내용을 자유롭게 다듬을 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}

export function OutlineEditor({
  onBack,
  onNext,
  outline,
  isLoading,
}: OutlineEditorProps) {
  if (!outline || !outline.sections || outline.sections.length === 0) {
    return <OutlineLoadingScreen />;
  }
  return (
    <OutlineEditorContent
      onBack={onBack}
      onNext={onNext}
      outline={outline}
      isLoading={isLoading}
    />
  );
}

function sectionDot(type: OutlineSection["type"]) {
  if (type === "intro") return "var(--sage)";
  if (type === "conclusion") return "var(--clay)";
  return "var(--forest)";
}

function OutlineEditorContent({
  onBack,
  onNext,
  outline,
  isLoading,
}: {
  onBack: () => void;
  onNext: (data: OutlineData) => void;
  outline: OutlineData;
  isLoading?: boolean;
}) {
  const [sections, setSections] = useState<OutlineSection[]>(outline.sections);
  const [selectedId, setSelectedId] = useState<string>(
    outline.sections[0]?.id || "1",
  );
  const [chatInput, setChatInput] = useState("");
  const [tone, setTone] = useState(outline.tone || "professional");

  useEffect(() => {
    if (outline.sections && outline.sections.length > 0) {
      setSections(outline.sections);
      setSelectedId(outline.sections[0]?.id || "1");
    }
    if (outline.tone) setTone(outline.tone);
  }, [outline]);

  const selectedSection =
    sections.find((s) => s.id === selectedId) || sections[0];

  const handleUpdateSection = (
    id: string,
    field: keyof OutlineSection,
    value: any,
  ) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;
    const newSections = [...sections];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [
      newSections[targetIndex],
      newSections[index],
    ];
    setSections(newSections);
  };

  const deleteSection = (id: string) => {
    const newSections = sections.filter((s) => s.id !== id);
    setSections(newSections);
    if (selectedId === id && newSections.length > 0)
      setSelectedId(newSections[0].id);
  };

  const addSection = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setSections([
      ...sections,
      {
        id: newId,
        type: "body",
        title: "새로운 섹션",
        content: "",
        keywords: [],
      },
    ]);
    setSelectedId(newId);
  };

  const panel: React.CSSProperties = {
    background: "var(--page)",
    border: "1px solid var(--border-sage)",
    borderRadius: "var(--r-lg)",
  };
  const panelHead: React.CSSProperties = {
    padding: 16,
    borderBottom: "1px solid var(--border-sage)",
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <ProgressBar currentStep={5} />

      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full px-4 pb-4 gap-4">
        {/* Left: outline tree */}
        <div
          className="w-80 flex flex-col overflow-hidden shrink-0"
          style={panel}
        >
          <div
            className="flex items-center justify-between"
            style={panelHead}
          >
            <h3
              className="flex items-center gap-2"
              style={{ color: "var(--ink)", fontSize: 15 }}
            >
              <AlignLeft
                className="w-4 h-4"
                style={{ color: "var(--dusk)" }}
                strokeWidth={1.5}
              />
              목차 구조
            </h3>
            <button
              onClick={addSection}
              className="p-1.5 rounded-md"
              style={{ color: "var(--forest)" }}
              title="섹션 추가"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sections.map((section, index) => {
              const active = selectedId === section.id;
              return (
                <div
                  key={section.id}
                  onClick={() => setSelectedId(section.id)}
                  className="group relative cursor-pointer"
                  style={{
                    padding: 12,
                    borderRadius: "var(--r-md)",
                    border: `1px solid ${active ? "var(--border-deep)" : "transparent"}`,
                    background: active ? "var(--leaf)" : "transparent",
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
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1.5 shrink-0"
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: sectionDot(section.type),
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: active ? "var(--forest)" : "var(--ink)",
                          lineHeight: 1.3,
                        }}
                      >
                        {section.title}
                      </p>
                      <p
                        className="truncate"
                        style={{
                          fontSize: 12,
                          color: "var(--dusk)",
                          marginTop: 4,
                        }}
                      >
                        {section.type === "intro"
                          ? "서론"
                          : section.type === "conclusion"
                            ? "결론"
                            : "본론"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="absolute right-2 top-2 flex items-center gap-1 transition-opacity"
                    style={{
                      background: "var(--page)",
                      border: "1px solid var(--border-sage)",
                      borderRadius: "var(--r-sm)",
                      padding: 2,
                      opacity: active ? 1 : 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "1")
                    }
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, "up");
                      }}
                      disabled={index === 0}
                      className="p-1 rounded disabled:opacity-30"
                      style={{ color: "var(--dusk)" }}
                    >
                      <ChevronUp className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, "down");
                      }}
                      disabled={index === sections.length - 1}
                      className="p-1 rounded disabled:opacity-30"
                      style={{ color: "var(--dusk)" }}
                    >
                      <ChevronDown className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSection(section.id);
                      }}
                      className="p-1 rounded"
                      style={{ color: "var(--dusk)" }}
                    >
                      <Trash2 className="w-3 h-3" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: detail editor */}
        <div
          className="flex-1 flex flex-col overflow-hidden min-w-[400px]"
          style={panel}
        >
          <div style={{ padding: 24, borderBottom: "1px solid var(--border-sage)" }}>
            <div className="sage-eyebrow" style={{ marginBottom: 8 }}>
              섹션 제목
            </div>
            <input
              type="text"
              value={selectedSection?.title || ""}
              onChange={(e) =>
                handleUpdateSection(
                  selectedSection.id,
                  "title",
                  e.target.value,
                )
              }
              placeholder="제목을 입력해 주세요"
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 26,
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
                padding: 0,
              }}
            />
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <div className="sage-eyebrow" style={{ marginBottom: 8 }}>
                핵심 내용 및 포함할 데이터
              </div>
              <textarea
                value={selectedSection?.content || ""}
                onChange={(e) =>
                  handleUpdateSection(
                    selectedSection.id,
                    "content",
                    e.target.value,
                  )
                }
                className="sage-textarea"
                style={{ height: 300 }}
                placeholder="이 섹션에 들어갈 내용을 자유롭게 적거나 다듬어 주세요"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="sage-eyebrow">추출 키워드</div>
                <button
                  className="flex items-center gap-1"
                  style={{ fontSize: 12, color: "var(--forest)", fontWeight: 500 }}
                >
                  <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                  키워드 자동 추천
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(selectedSection?.keywords || []).map((kw, i) => (
                  <span
                    key={i}
                    className="sage-tag sage-tag--brand group"
                    style={{ gap: 6, padding: "6px 12px", fontSize: 13 }}
                  >
                    {kw}
                    <button
                      onClick={() =>
                        handleUpdateSection(
                          selectedSection.id,
                          "keywords",
                          selectedSection.keywords.filter(
                            (_, idx) => idx !== i,
                          ),
                        )
                      }
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  className="sage-tag sage-tag--neutral"
                  style={{
                    cursor: "pointer",
                    padding: "6px 12px",
                    fontSize: 13,
                    borderStyle: "dashed",
                  }}
                  onClick={() => {
                    const k = prompt("추가할 키워드");
                    if (k)
                      handleUpdateSection(selectedSection.id, "keywords", [
                        ...(selectedSection.keywords || []),
                        k,
                      ]);
                  }}
                >
                  + 키워드 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI assistant */}
        <div
          className="w-80 flex flex-col overflow-hidden shrink-0"
          style={panel}
        >
          <div
            style={{
              ...panelHead,
              background: "var(--leaf)",
              borderTopLeftRadius: "var(--r-lg)",
              borderTopRightRadius: "var(--r-lg)",
            }}
          >
            <h3
              className="flex items-center gap-2"
              style={{ color: "var(--ink)", fontSize: 15 }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: "var(--forest)" }}
                strokeWidth={1.5}
              />
              AI 어시스턴트
            </h3>
          </div>

          <div style={{ padding: 16, borderBottom: "1px solid var(--border-sage)" }}>
            <div className="sage-eyebrow" style={{ marginBottom: 8 }}>
              톤앤매너 설정
            </div>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="sage-select"
            >
              <option value="professional">정중한 존댓말</option>
              <option value="friendly">친근한 존댓말</option>
              <option value="humorous">간결한 정보 전달</option>
            </select>
          </div>

          <div
            className="flex-1 p-4 overflow-y-auto"
            style={{ background: "var(--mist)" }}
          >
            <div
              style={{
                background: "var(--leaf)",
                borderRadius: "var(--r-md)",
                borderTopLeftRadius: 0,
                padding: 14,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  color: "var(--forest)",
                  lineHeight: 1.6,
                }}
              >
                지금 <span style={{ color: "var(--ink)" }}>
                  {selectedSection?.title}
                </span>{" "}
                섹션을 보고 계세요 · 통계를 보강할까요, 예시를 더해 볼까요?
              </p>
            </div>
          </div>

          <div
            style={{
              padding: 16,
              borderTop: "1px solid var(--border-sage)",
              background: "var(--page)",
            }}
          >
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="예: 통계 지표를 더 강조해 주세요"
                className="sage-input"
                style={{ paddingRight: 44 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setChatInput("");
                }}
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md disabled:opacity-50"
                style={{ background: "var(--sage)", color: "var(--on-sage)" }}
                disabled={!chatInput.trim()}
              >
                <Send className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div
        style={{
          background: "var(--page)",
          borderTop: "1px solid var(--border-sage)",
          padding: "16px 32px",
        }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="sage-btn sage-btn--ghost"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            인사이트 다시 고르기
          </button>
          <button
            onClick={() => onNext({ sections, tone })}
            disabled={isLoading}
            className="sage-btn sage-btn--primary sage-btn--lg"
          >
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            {isLoading ? "초안을 준비하고 있어요" : "최종 초안 작성 시작"}
          </button>
        </div>
      </div>
    </div>
  );
}
