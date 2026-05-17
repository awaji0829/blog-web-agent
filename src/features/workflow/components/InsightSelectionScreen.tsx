import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCw, Lightbulb, ChevronRight, Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { InsightCard, InsightData } from "./InsightCard";

// Mock data (fallback when no insights provided)
const MOCK_INSIGHTS: InsightData[] = [
  {
    id: "1",
    title: "2024년 생성형 AI 트렌드와 미래 전망",
    summary:
      "급변하는 AI 기술의 흐름을 짚어 보고, 비즈니스에 미칠 영향을 분석해요.",
    targetAudience: "기술 트렌드에 민감한 기획자, PM",
    keywords: ["생성형AI", "테크트렌드", "미래전망"],
  },
  {
    id: "2",
    title: "효율적인 원격 근무를 위한 툴 가이드",
    summary:
      "리모트 워크 환경에서 생산성을 높여 주는 협업 툴 5가지를 비교해요.",
    targetAudience: "스타트업 종사자, 프리랜서",
    keywords: ["생산성", "협업툴", "원격근무"],
  },
  {
    id: "3",
    title: "브랜딩을 강화하는 스토리텔링 전략",
    summary: "고객의 마음을 움직이는 브랜드 서사를 만드는 방법을 정리해요.",
    targetAudience: "브랜드 마케터, 콘텐츠 에디터",
    keywords: ["브랜딩", "스토리텔링", "마케팅"],
  },
  {
    id: "4",
    title: "초보자를 위한 재테크 포트폴리오 구성법",
    summary: "사회초년생이 쉽게 따라 할 수 있는 자산 배분 전략을 다뤄요.",
    targetAudience: "사회초년생, 재테크 입문자",
    keywords: ["재테크", "자산관리", "돈관리"],
  },
];

interface InsightSelectionScreenProps {
  onNext: (selectedInsights: InsightData[]) => void;
  onBack?: () => void;
  insights?: InsightData[];
  isLoading?: boolean;
}

export function InsightSelectionScreen({
  onNext,
  insights,
  isLoading,
}: InsightSelectionScreenProps) {
  const displayInsights =
    insights && insights.length > 0 ? insights : MOCK_INSIGHTS;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isIdeaInputOpen, setIsIdeaInputOpen] = useState(false);
  const [customIdea, setCustomIdea] = useState("");

  const toggleSelection = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  return (
    <div className="flex flex-col h-full w-full">
      <ProgressBar currentStep={3} />

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col gap-8">
          <div className="text-center pt-2">
            <div className="sage-eyebrow mb-3">인사이트 선택</div>
            <h2 style={{ color: "var(--ink)" }}>
              찾아낸 인사이트를 확인해 보세요
            </h2>
            <p
              className="mx-auto"
              style={{
                fontSize: 15,
                color: "var(--ink-soft)",
                marginTop: 10,
                lineHeight: 1.65,
                maxWidth: "54ch",
              }}
            >
              발행하고 싶은 주제를 하나 이상 골라 주세요 · 함께 글로 이어
              나갈게요
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            {displayInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                data={insight}
                isSelected={selectedIds.includes(insight.id)}
                onSelect={toggleSelection}
              />
            ))}
          </div>

          <div className="max-w-2xl mx-auto w-full flex flex-col gap-5 pt-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
              <button className="sage-btn sage-btn--secondary sage-btn--sm">
                <RotateCw className="w-4 h-4" strokeWidth={1.5} />
                다른 인사이트 추천받기
              </button>
              <button
                onClick={() => setIsIdeaInputOpen(!isIdeaInputOpen)}
                className={`sage-btn sage-btn--sm ${
                  isIdeaInputOpen ? "sage-btn--primary" : "sage-btn--secondary"
                }`}
              >
                <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                직접 아이디어 입력
              </button>
            </div>

            <AnimatePresence>
              {isIdeaInputOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="sage-card flex gap-3">
                    <input
                      type="text"
                      value={customIdea}
                      onChange={(e) => setCustomIdea(e.target.value)}
                      placeholder="새로운 콘텐츠 아이디어를 적어 주세요"
                      className="sage-input"
                      autoFocus
                    />
                    <button
                      className="sage-btn sage-btn--primary"
                      disabled={!customIdea.trim()}
                      onClick={() => console.log("Add custom idea")}
                    >
                      추가
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <button
              onClick={() =>
                onNext(
                  displayInsights.filter((i) =>
                    selectedIds.includes(i.id),
                  ),
                )
              }
              disabled={isLoading}
              className="sage-btn sage-btn--primary sage-btn--lg"
              style={{ borderRadius: "var(--r-pill)", paddingLeft: 26 }}
            >
              {isLoading ? (
                <>
                  <Loader2
                    className="w-5 h-5 animate-spin"
                    strokeWidth={1.5}
                  />
                  주제를 정리하고 있어요
                </>
              ) : (
                <>
                  {selectedIds.length}개 주제로 진행
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
