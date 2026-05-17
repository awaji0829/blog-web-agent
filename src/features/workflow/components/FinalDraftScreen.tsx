import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, PenTool, Lightbulb } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { DraftEditor } from "@/features/drafts/components/DraftEditor";
import { DraftExportPanel } from "@/features/drafts/components/DraftExportPanel";
import { DraftSeoPanel } from "@/features/drafts/components/DraftSeoPanel";
import { DraftThumbnailPanel } from "@/features/drafts/components/DraftThumbnailPanel";
import { DraftSourcesPanel } from "@/features/drafts/components/DraftSourcesPanel";
import type { ResearchSource } from "@/features/workflow/types";

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

interface Draft {
  id: string;
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
}

interface FinalDraftScreenProps {
  onRestart: () => void;
  onComplete: () => void;
  outlineData?: OutlineData | null;
  draft?: Draft | null;
  researchSources?: ResearchSource[];
}

const LOADING_TEXTS = [
  "개요를 바탕으로 글을 작성하고 있어요",
  "각 섹션의 내용을 풍부하게 채우고 있어요",
  "논리적 흐름과 가독성을 다듬고 있어요",
  "읽기 좋은 문체로 마무리하고 있어요 · 거의 다 됐어요",
];

function DraftLoadingScreen() {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(
      () => setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length),
      4000,
    );
    const progressInterval = setInterval(() => {
      setProgress((prev) =>
        prev >= 95 ? 95 : Math.min(prev + Math.random() * 1.5, 95),
      );
    }, 150);
    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <ProgressBar currentStep={6} />
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="sage-icon-tile mb-8"
          style={{ width: 72, height: 72, borderRadius: "var(--r-lg)" }}
        >
          <PenTool className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="text-center max-w-lg w-full">
          <h2 style={{ color: "var(--ink)", marginBottom: 16 }}>
            초안을 작성하고 있어요
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
            초안이 완성되면 직접 수정하거나 AI 문장 다듬기를 쓸 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}

export function FinalDraftScreen({
  onRestart,
  onComplete,
  draft,
  researchSources,
}: FinalDraftScreenProps) {
  if (!draft || !draft.content || !draft.id) {
    return <DraftLoadingScreen />;
  }
  return (
    <FinalDraftContent
      onRestart={onRestart}
      onComplete={onComplete}
      draft={draft}
      researchSources={researchSources}
    />
  );
}

function FinalDraftContent({
  onRestart,
  onComplete,
  draft,
  researchSources,
}: {
  onRestart: () => void;
  onComplete: () => void;
  draft: Draft;
  researchSources?: ResearchSource[];
}) {
  return (
    <div className="flex flex-col h-full w-full">
      <ProgressBar currentStep={6} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <DraftEditor draft={draft} />
          </div>
          <div className="w-full lg:w-96 space-y-5 shrink-0">
            <DraftExportPanel draft={draft} />
            <DraftSeoPanel draft={draft} />
            <DraftSourcesPanel sources={researchSources} />
            <DraftThumbnailPanel draft={draft} />
          </div>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          background: "var(--page)",
          borderTop: "1px solid var(--border-sage)",
          padding: "16px 32px",
        }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={onRestart}
            className="sage-btn sage-btn--ghost"
          >
            처음부터 다시 시작하기
          </button>
          <button
            onClick={onComplete}
            className="sage-btn sage-btn--primary sage-btn--lg"
          >
            <Check className="w-4 h-4" strokeWidth={1.5} />
            발행하기
          </button>
        </div>
      </div>
    </div>
  );
}
