import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResourceInput } from "./components/ResourceInput";
import { AnalysisLoading } from "./components/AnalysisLoading";
import { InsightSelectionScreen } from "./components/InsightSelectionScreen";
import { DeepResearchLoading } from "./components/DeepResearchLoading";
import { OutlineEditor } from "./components/OutlineEditor";
import { FinalDraftScreen } from "./components/FinalDraftScreen";
import { useWorkflow } from "./hooks/useWorkflow";
import { blogApi } from "@/lib/api";
import type {
  ResourceInputData,
  InsightData,
  OutlineData,
  Insight,
  Draft,
} from "./types";

interface WorkflowContainerProps {
  initialDraft?: Draft | null;
}

export function WorkflowContainer({ initialDraft }: WorkflowContainerProps) {
  const workflow = useWorkflow();
  const navigate = useNavigate();
  const prevDraftIdRef = useRef<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(!!initialDraft);

  // 저장된 초안을 보는 경우 final 화면으로 이동, 새 글 작성 시 리셋
  useEffect(() => {
    const currentDraftId = initialDraft?.id ?? null;
    const prevDraftId = prevDraftIdRef.current;

    if (initialDraft && currentDraftId !== prevDraftId) {
      // 새로운 초안을 보는 경우
      workflow.setDraft(initialDraft);
      workflow.setStep("final");
      setIsInitializing(false);
    } else if (!initialDraft && prevDraftId !== null) {
      // 새 글 작성으로 전환 (초안 보기에서 새 글 작성 버튼 클릭)
      workflow.restart();
      setIsInitializing(false);
    } else if (!initialDraft) {
      setIsInitializing(false);
    }

    prevDraftIdRef.current = currentDraftId;
  }, [initialDraft]);

  // ResourceInput에서 분석 시작
  const handleStartAnalysis = async (data: ResourceInputData) => {
    try {
      await workflow.startAnalysis(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      // 에러 시에도 selection 단계로 이동 (mock 데이터로 fallback)
      workflow.setStep("selection");
    }
  };

  // InsightSelectionScreen에서 인사이트 선택 후 진행
  const handleSelectionNext = async (insights: InsightData[]) => {
    try {
      const insightIds = insights.map((i) => i.id);
      await workflow.selectInsightsAndResearch(insightIds);
    } catch (err) {
      console.error("Research failed:", err);
      // 에러 시에도 outline 단계로 이동
      workflow.setStep("outline");
    }
  };

  // DeepResearchLoading 완료 (자동으로 outline 단계로 이동)
  const handleResearchComplete = () => {
    workflow.setStep("outline");
  };

  // OutlineEditor에서 뒤로 가기
  const handleOutlineBack = () => {
    workflow.setStep("selection");
  };

  // OutlineEditor에서 초안 작성 시작
  const handleFinalDraft = async (data: OutlineData) => {
    try {
      // 아웃라인 업데이트 후 초안 작성
      if (workflow.outline) {
        await workflow.updateOutline({
          sections: data.sections,
          tone: data.tone,
        });
      }
      await workflow.writeDraft();
    } catch (err) {
      console.error("Draft writing failed:", err);
      workflow.setStep("final");
    }
  };

  // 처음부터 다시 시작
  const handleRestart = () => {
    if (confirm("정말로 처음부터 다시 시작하시겠습니까?")) {
      workflow.restart();
    }
  };

  // 발행 완료
  const handleComplete = async () => {
    try {
      if (workflow.draft) {
        await blogApi.publishDraft(workflow.draft.id);
      }
      alert("발행이 완료되었습니다!");
      workflow.restart();
      navigate("/saved");
    } catch (err) {
      console.error("Publish failed:", err);
      alert("발행에 실패했습니다.");
    }
  };

  // Insight를 InsightData로 변환 (기존 컴포넌트 호환)
  const insightsAsData: InsightData[] = workflow.insights.map(
    (insight: Insight) => ({
      id: insight.id,
      title: insight.title,
      summary: insight.potential_angle || insight.signal || "",
      targetAudience: workflow.session?.target_audience || "",
      keywords: insight.tags || [],
    })
  );

  // Outline을 OutlineData로 변환
  const outlineAsData: OutlineData | null = workflow.outline
    ? {
        sections: workflow.outline.sections,
        tone: workflow.outline.tone,
      }
    : null;

  // 초기화 중이거나 initialDraft가 있는데 아직 final 단계가 아닌 경우 로딩 표시
  if (isInitializing || (initialDraft && workflow.step !== "final" && workflow.step !== "writing")) {
    return (
      <div className="h-full w-full">
        <FinalDraftScreen
          onRestart={handleRestart}
          onComplete={handleComplete}
          outlineData={outlineAsData}
          draft={null}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {workflow.step === "input" && (
        <ResourceInput onStartAnalysis={handleStartAnalysis} />
      )}

      {workflow.step === "analyzing" && <AnalysisLoading />}

      {workflow.step === "selection" && (
        <InsightSelectionScreen
          onNext={handleSelectionNext}
          insights={insightsAsData}
          isLoading={workflow.isLoading}
        />
      )}

      {workflow.step === "researching" && (
        <DeepResearchLoading onComplete={handleResearchComplete} />
      )}

      {workflow.step === "outline" && (
        <OutlineEditor
          onBack={handleOutlineBack}
          onNext={handleFinalDraft}
          selectedInsights={insightsAsData.filter((i) =>
            workflow.insights.find(
              (wi) => wi.id === i.id && wi.status === "selected"
            )
          )}
          outline={outlineAsData}
          isLoading={workflow.isLoading}
        />
      )}

      {(workflow.step === "writing" || workflow.step === "final") && (
        <FinalDraftScreen
          onRestart={handleRestart}
          onComplete={handleComplete}
          outlineData={outlineAsData}
          draft={workflow.draft}
        />
      )}

      {/* 에러 표시 */}
      {workflow.error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <p className="font-medium">오류 발생</p>
          <p className="text-sm">{workflow.error}</p>
        </div>
      )}
    </div>
  );
}
