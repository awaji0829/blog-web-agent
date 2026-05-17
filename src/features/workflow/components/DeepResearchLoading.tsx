import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lightbulb, BrainCircuit } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";

const LOADING_TEXTS = [
  "관련된 최신 자료를 수집하고 있어요 · 잠깐만요",
  "신뢰도 높은 통계와 트렌드를 정리하고 있어요",
  "글의 논리적인 구조를 설계하고 있어요 · 약 30초 소요",
];

interface DeepResearchLoadingProps {
  onComplete: () => void;
}

export function DeepResearchLoading({ onComplete }: DeepResearchLoadingProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(
      () => setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length),
      4000,
    );
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return Math.min(prev + Math.random() * 2, 100);
      });
    }, 100);
    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col h-full w-full">
      <ProgressBar currentStep={4} />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div
          className="sage-icon-tile mb-8"
          style={{ width: 72, height: 72, borderRadius: "var(--r-lg)" }}
        >
          <BrainCircuit className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="text-center max-w-lg w-full">
          <div
            className="flex items-baseline justify-center gap-2"
            style={{ marginBottom: 16 }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              {Math.round(progress)}%
            </span>
            <span style={{ fontSize: 14, color: "var(--dusk)" }}>
              분석 완료
            </span>
          </div>

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
            리서치가 끝나면 글의 뼈대를 직접 다듬을 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}
