import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";

export function AnalysisLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[60vh] gap-6">
      <div
        className="sage-icon-tile"
        style={{ width: 64, height: 64, borderRadius: "var(--r-lg)" }}
      >
        <Sparkles className="w-7 h-7" strokeWidth={1.5} />
      </div>

      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          style={{ color: "var(--ink)" }}
        >
          인사이트를 분석하고 있어요
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          style={{
            fontSize: 14,
            color: "var(--ink-soft)",
            marginTop: 8,
          }}
        >
          리소스를 읽고 핵심 신호를 찾는 중이에요 · 약 30초 소요
        </motion.p>
      </div>

      {/* The one looping animation allowed by spec */}
      <div className="flex items-center gap-2">
        <span className="sage-dot" />
        <span className="sage-dot" />
        <span className="sage-dot" />
      </div>
    </div>
  );
}
