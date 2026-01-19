import React, { useState } from 'react';
import { ResourceInput } from './components/ResourceInput';
import { AnalysisLoading } from './components/AnalysisLoading';
import { InsightSelectionScreen } from './components/InsightSelectionScreen';
import { DeepResearchLoading } from './components/DeepResearchLoading';
import { OutlineEditor } from './components/OutlineEditor';
import { FinalDraftScreen } from './components/FinalDraftScreen';
import type {
  WorkflowStep,
  ResourceInputData,
  InsightData,
  OutlineData,
} from './types';

export function WorkflowContainer() {
  const [step, setStep] = useState<WorkflowStep>('input');

  // 워크플로우 데이터 상태
  const [resourceInput, setResourceInput] = useState<ResourceInputData | null>(null);
  const [selectedInsights, setSelectedInsights] = useState<InsightData[]>([]);
  const [outlineData, setOutlineData] = useState<OutlineData | null>(null);

  const handleStartAnalysis = (data: ResourceInputData) => {
    setResourceInput(data);
    setStep('analyzing');
    // Simulate analysis delay
    setTimeout(() => {
      setStep('selection');
    }, 3000);
  };

  const handleSelectionNext = (insights: InsightData[]) => {
    setSelectedInsights(insights);
    setStep('researching');
  };

  const handleResearchComplete = () => {
    setStep('outline');
  };

  const handleOutlineBack = () => {
    setStep('selection');
  };

  const handleFinalDraft = (data: OutlineData) => {
    setOutlineData(data);
    setStep('final');
  };

  const handleRestart = () => {
    if (confirm('정말로 처음부터 다시 시작하시겠습니까?')) {
      setResourceInput(null);
      setSelectedInsights([]);
      setOutlineData(null);
      setStep('input');
    }
  };

  const handleComplete = () => {
    alert('발행이 완료되었습니다! (데모 종료)');
    setResourceInput(null);
    setSelectedInsights([]);
    setOutlineData(null);
    setStep('input');
  };

  return (
    <div className="h-full w-full">
      {step === 'input' && (
        <ResourceInput onStartAnalysis={handleStartAnalysis} />
      )}
      {step === 'analyzing' && <AnalysisLoading />}
      {step === 'selection' && (
        <InsightSelectionScreen onNext={handleSelectionNext} />
      )}
      {step === 'researching' && (
        <DeepResearchLoading onComplete={handleResearchComplete} />
      )}
      {step === 'outline' && (
        <OutlineEditor
          onBack={handleOutlineBack}
          onNext={handleFinalDraft}
          selectedInsights={selectedInsights}
        />
      )}
      {step === 'final' && (
        <FinalDraftScreen
          onRestart={handleRestart}
          onComplete={handleComplete}
          outlineData={outlineData}
        />
      )}
    </div>
  );
}
