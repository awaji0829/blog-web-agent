import { supabase } from './supabase';
import type {
  WorkflowSession,
  Resource,
  Insight,
  Research,
  Outline,
  Draft,
  SeoAnalysisResult,
} from '@/features/workflow/types';

// ============================================
// Session API
// ============================================

export async function createSession(data: {
  keywords?: string;
  target_audience?: string;
}) {
  const { data: session, error } = await supabase
    .from('workflow_sessions')
    .insert({
      keywords: data.keywords || null,
      target_audience: data.target_audience || null,
      status: 'input',
    })
    .select()
    .single();

  if (error) throw error;
  return session as WorkflowSession;
}

export async function updateSessionStatus(
  sessionId: string,
  status: WorkflowSession['status']
) {
  const { error } = await supabase
    .from('workflow_sessions')
    .update({ status })
    .eq('id', sessionId);

  if (error) throw error;
}

export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('workflow_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data as WorkflowSession;
}

// ============================================
// Resource API
// ============================================

export async function collectResource(sessionId: string, url: string) {
  const { data, error } = await supabase.functions.invoke('collect-resource', {
    body: { session_id: sessionId, url },
  });

  if (error) throw error;
  return data as Resource;
}

export async function addFileResource(
  sessionId: string,
  file: { name: string; path: string; content: string }
) {
  const { data, error } = await supabase
    .from('resources')
    .insert({
      session_id: sessionId,
      source_type: 'file',
      file_name: file.name,
      file_path: file.path,
      title: file.name,
      content: file.content,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Resource;
}

export async function getResources(sessionId: string) {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('session_id', sessionId)
    .order('collected_at', { ascending: false });

  if (error) throw error;
  return data as Resource[];
}

// ============================================
// Insights API
// ============================================

export async function extractInsights(
  sessionId: string,
  options?: { keywords?: string; target_audience?: string }
) {
  const { data, error } = await supabase.functions.invoke('extract-insights', {
    body: {
      session_id: sessionId,
      keywords: options?.keywords,
      target_audience: options?.target_audience,
    },
  });

  if (error) throw error;
  return data.insights as Insight[];
}

export async function getInsights(sessionId: string) {
  const { data, error } = await supabase
    .from('insights')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Insight[];
}

export async function updateInsightStatus(
  insightId: string,
  status: 'pending' | 'selected' | 'rejected'
) {
  const { error } = await supabase
    .from('insights')
    .update({ status })
    .eq('id', insightId);

  if (error) throw error;
}

export async function selectInsights(insightIds: string[]) {
  // 먼저 모든 인사이트를 pending으로 리셋
  const { error: resetError } = await supabase
    .from('insights')
    .update({ status: 'pending' })
    .in('id', insightIds);

  if (resetError) throw resetError;

  // 선택된 인사이트만 selected로 업데이트
  const { error } = await supabase
    .from('insights')
    .update({ status: 'selected' })
    .in('id', insightIds);

  if (error) throw error;
}

// ============================================
// Research API
// ============================================

export async function deepResearch(sessionId: string, insightIds: string[]) {
  const { data, error } = await supabase.functions.invoke('deep-research', {
    body: {
      session_id: sessionId,
      insight_ids: insightIds,
    },
  });

  if (error) throw error;
  return data.research as Research[];
}

export async function getResearch(sessionId: string) {
  const { data, error } = await supabase
    .from('research')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Research[];
}

// ============================================
// Outline API
// ============================================

export async function generateOutline(sessionId: string, researchId: string) {
  const { data, error } = await supabase.functions.invoke('generate-outline', {
    body: {
      session_id: sessionId,
      research_id: researchId,
    },
  });

  if (error) throw error;
  return data.outline as Outline;
}

export async function getOutline(sessionId: string) {
  const { data, error } = await supabase
    .from('outlines')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data as Outline | null;
}

export async function updateOutline(outlineId: string, updates: Partial<Outline>) {
  const { data, error } = await supabase
    .from('outlines')
    .update(updates)
    .eq('id', outlineId)
    .select()
    .single();

  if (error) throw error;
  return data as Outline;
}

export async function approveOutline(outlineId: string) {
  return updateOutline(outlineId, { status: 'approved' });
}

// ============================================
// Draft API
// ============================================

export async function writeDraft(
  sessionId: string,
  outlineId: string,
  outline: Outline
) {
  const { data, error } = await supabase.functions.invoke('write-draft', {
    body: {
      session_id: sessionId,
      outline_id: outlineId,
      outline,
    },
  });

  if (error) throw error;
  return data.draft as Draft;
}

export async function getDraft(sessionId: string) {
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as Draft | null;
}

export async function updateDraft(draftId: string, updates: Partial<Draft>) {
  const { data, error } = await supabase
    .from('drafts')
    .update(updates)
    .eq('id', draftId)
    .select()
    .single();

  if (error) throw error;
  return data as Draft;
}

export async function publishDraft(draftId: string) {
  return updateDraft(draftId, { status: 'published' });
}

export async function getAllDrafts() {
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Draft[];
}

export async function getDraftById(draftId: string) {
  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (error) throw error;
  return data as Draft;
}

export async function deleteDraft(draftId: string) {
  const { error } = await supabase
    .from('drafts')
    .delete()
    .eq('id', draftId);

  if (error) throw error;
}

// ============================================
// SEO Analysis API
// ============================================

export async function analyzeSeo(draftId: string, keywords?: string[]) {
  const { data, error } = await supabase.functions.invoke('analyze-seo', {
    body: {
      draft_id: draftId,
      keywords,
    },
  });

  if (error) throw error;
  return data.analysis as SeoAnalysisResult;
}

export async function getSeoMetrics(draftId: string) {
  const { data, error } = await supabase
    .from('drafts')
    .select('seo_metrics, meta_description, primary_keywords')
    .eq('id', draftId)
    .single();

  if (error) throw error;
  return {
    seo_metrics: data.seo_metrics,
    meta_description: data.meta_description,
    primary_keywords: data.primary_keywords,
  };
}

// ============================================
// Combined Workflow API
// ============================================

export const blogApi = {
  // Session
  createSession,
  updateSessionStatus,
  getSession,

  // Resources
  collectResource,
  addFileResource,
  getResources,

  // Insights
  extractInsights,
  getInsights,
  updateInsightStatus,
  selectInsights,

  // Research
  deepResearch,
  getResearch,

  // Outline
  generateOutline,
  getOutline,
  updateOutline,
  approveOutline,

  // Draft
  writeDraft,
  getDraft,
  updateDraft,
  publishDraft,
  getAllDrafts,
  getDraftById,
  deleteDraft,

  // SEO
  analyzeSeo,
  getSeoMetrics,
};

export default blogApi;
