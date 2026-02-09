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
} from "./types";

export function WorkflowContainer() {
  const workflow = useWorkflow();
  const navigate = useNavigate();

  // ResourceInput에서 분석 시작
  const handleStartAnalysis = async (data: ResourceInputData) => {
    try {
      await workflow.startAnalysis(data);
    } catch (err) {
      console.error("Analysis failed:", err);
      // 에러 발생 시 input 단계로 돌아가기
      workflow.setStep("input");
      // 에러는 workflow.error에 저장되어 있음
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

  return (
    <div className="h-full w-full">
      {workflow.step === "input" && (
        <ResourceInput
          onStartAnalysis={handleStartAnalysis}
          error={workflow.error}
        />
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
          researchSources={workflow.research.flatMap((r) => r.sources || [])}
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
