import { useState, useCallback } from 'react';
import { blogApi } from '@/lib/api';
import type {
  WorkflowStep,
  WorkflowSession,
  Insight,
  Research,
  Outline,
  Draft,
  ResourceInputData,
} from '../types';

interface WorkflowState {
  session: WorkflowSession | null;
  insights: Insight[];
  research: Research[];
  outline: Outline | null;
  draft: Draft | null;
  step: WorkflowStep;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkflowState = {
  session: null,
  insights: [],
  research: [],
  outline: null,
  draft: null,
  step: 'input',
  isLoading: false,
  error: null,
};

export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>(initialState);

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  };

  const setStep = (step: WorkflowStep) => {
    setState(prev => ({ ...prev, step }));
  };

  // Step 1: 리소스 수집 및 인사이트 추출 시작
  const startAnalysis = useCallback(async (data: ResourceInputData) => {
    setLoading(true);
    setError(null);

    try {
      // 1. 세션 생성
      const session = await blogApi.createSession({
        keywords: data.keywords || undefined,
        target_audience: data.targetAudience || undefined,
      });

      setState(prev => ({ ...prev, session, step: 'analyzing' }));

      // 2. URL 리소스 수집
      for (const url of data.urls.filter(u => u.trim())) {
        try {
          await blogApi.collectResource(session.id, url);
        } catch (err) {
          console.warn(`Failed to collect URL: ${url}`, err);
        }
      }

      // 3. 파일 리소스 추가 (TODO: 실제 파일 업로드 구현)
      // for (const file of data.files) { ... }

      // 4. 인사이트 추출
      const insights = await blogApi.extractInsights(
        session.id,
        {
          keywords: data.keywords,
          target_audience: data.targetAudience,
        }
      );

      setState(prev => ({
        ...prev,
        insights,
        step: 'selection',
        isLoading: false,
      }));

      return { session, insights };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      throw err;
    }
  }, []);

  // Step 2: 인사이트 선택 후 심화 리서치
  const selectInsightsAndResearch = useCallback(async (insightIds: string[]) => {
    if (!state.session) throw new Error('No active session');

    setLoading(true);
    setError(null);
    setStep('researching');

    try {
      // 1. 인사이트 선택 상태 업데이트
      await blogApi.selectInsights(insightIds);

      // 2. 심화 리서치 수행
      const research = await blogApi.deepResearch(state.session.id, insightIds);

      setState(prev => ({
        ...prev,
        research,
        isLoading: false,
      }));

      // 3. 첫 번째 리서치로 아웃라인 생성
      if (research.length > 0) {
        await generateOutline(research[0].id);
      }

      return research;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed');
      throw err;
    }
  }, [state.session]);

  // Step 3: 아웃라인 생성
  const generateOutline = useCallback(async (researchId: string) => {
    if (!state.session) throw new Error('No active session');

    setLoading(true);
    setError(null);

    try {
      const outline = await blogApi.generateOutline(state.session.id, researchId);

      setState(prev => ({
        ...prev,
        outline,
        step: 'outline',
        isLoading: false,
      }));

      return outline;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Outline generation failed');
      throw err;
    }
  }, [state.session]);

  // Step 4: 아웃라인 업데이트
  const updateOutline = useCallback(async (updates: Partial<Outline>) => {
    if (!state.outline) throw new Error('No outline');

    try {
      const updated = await blogApi.updateOutline(state.outline.id, updates);
      setState(prev => ({ ...prev, outline: updated }));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  }, [state.outline]);

  // Step 5: 초안 작성
  const writeDraft = useCallback(async () => {
    if (!state.session || !state.outline) {
      throw new Error('Session and outline required');
    }

    setLoading(true);
    setError(null);
    setStep('writing');

    try {
      const draft = await blogApi.writeDraft(
        state.session.id,
        state.outline.id,
        state.outline
      );

      setState(prev => ({
        ...prev,
        draft,
        step: 'final',
        isLoading: false,
      }));

      return draft;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Draft writing failed');
      throw err;
    }
  }, [state.session, state.outline]);

  // Step 6: 초안 업데이트
  const updateDraft = useCallback(async (updates: Partial<Draft>) => {
    if (!state.draft) throw new Error('No draft');

    try {
      const updated = await blogApi.updateDraft(state.draft.id, updates);
      setState(prev => ({ ...prev, draft: updated }));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
      throw err;
    }
  }, [state.draft]);

  // 처음부터 다시 시작
  const restart = useCallback(() => {
    setState(initialState);
  }, []);

  // 특정 단계로 돌아가기
  const goToStep = useCallback((step: WorkflowStep) => {
    setStep(step);
  }, []);

  return {
    // State
    ...state,

    // Actions
    startAnalysis,
    selectInsightsAndResearch,
    generateOutline,
    updateOutline,
    writeDraft,
    updateDraft,
    restart,
    goToStep,
    setStep,
  };
}

export type UseWorkflowReturn = ReturnType<typeof useWorkflow>;
