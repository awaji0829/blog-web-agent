import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  PenTool,
  Lightbulb,
} from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { DraftEditor } from "@/features/drafts/components/DraftEditor";
import { DraftExportPanel } from "@/features/drafts/components/DraftExportPanel";
import { DraftSeoPanel } from "@/features/drafts/components/DraftSeoPanel";
import { DraftThumbnailPanel } from "@/features/drafts/components/DraftThumbnailPanel";

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
}

const LOADING_TEXTS = [
  "개요를 바탕으로 블로그 글을 작성하고 있습니다...",
  "각 섹션의 내용을 풍부하게 채워가고 있습니다...",
  "논리적 흐름과 가독성을 다듬고 있습니다...",
  "전문적이면서도 읽기 쉬운 문체로 마무리하고 있습니다...",
];

// Loading Screen Component
function DraftLoadingScreen() {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return Math.min(prev + Math.random() * 1.5, 95);
      });
    }, 150);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={6} />

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Central Animation */}
        <div className="relative mb-12">
          {/* Pulsing Circles */}
          <motion.div
            className="absolute inset-0 bg-green-100 rounded-full"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 bg-green-200 rounded-full"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />

          {/* Main Icon Circle */}
          <div className="relative w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <PenTool className="w-16 h-16 text-green-600" />
            </motion.div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90 z-20 pointer-events-none">
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#16A34A"
              strokeWidth="4"
              strokeDasharray={389.5}
              strokeDashoffset={389.5 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
        </div>

        {/* Dynamic Text */}
        <div className="text-center space-y-4 max-w-lg z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            초안을 작성하고 있습니다
          </h2>

          <div className="h-8 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-lg text-gray-600 absolute w-full left-0 right-0"
              >
                {LOADING_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Tip Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-16 bg-green-50 border border-green-100 px-6 py-4 rounded-xl flex items-center gap-3 max-w-md shadow-sm z-10"
        >
          <div className="bg-green-100 p-2 rounded-full">
            <Lightbulb className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-green-800 font-medium">
            Tip: 초안이 완성되면 직접 수정하거나 AI 문장 다듬기를 사용할 수 있습니다.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function FinalDraftScreen({
  onRestart,
  onComplete,
  outlineData,
  draft,
}: FinalDraftScreenProps) {
  // Show loading screen if no draft data yet
  if (!draft) {
    return <DraftLoadingScreen />;
  }

  // If draft exists but has no content, show loading (still being written)
  if (!draft.content) {
    return <DraftLoadingScreen />;
  }

  // Ensure draft has required fields before rendering
  if (!draft.id) {
    console.error('Draft missing required id field:', draft);
    return <DraftLoadingScreen />;
  }

  return (
    <FinalDraftContent
      onRestart={onRestart}
      onComplete={onComplete}
      draft={draft}
    />
  );
}

// Separated content component to avoid hooks issues
function FinalDraftContent({
  onRestart,
  onComplete,
  draft,
}: {
  onRestart: () => void;
  onComplete: () => void;
  draft: Draft;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={6} />

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-8">
          {/* Left Column: Editor View */}
          <div className="flex-1 min-w-0">
            <DraftEditor draft={draft} />
          </div>

          {/* Right Column: Action Panel */}
          <div className="w-full lg:w-96 space-y-6 shrink-0">
            <DraftExportPanel draft={draft} />
            <DraftSeoPanel draft={draft} />
            <DraftThumbnailPanel draft={draft} />
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-8 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={onRestart}
            className="text-gray-400 text-sm font-medium hover:text-gray-600 underline decoration-gray-300 underline-offset-4"
          >
            처음부터 다시 시작하기
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Check className="w-5 h-5" />
            최종 발행 완료
          </button>
        </div>
      </div>
    </div>
  );
}
