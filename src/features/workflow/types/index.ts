// 워크플로우 단계 타입
export type WorkflowStep =
  | 'input'
  | 'analyzing'
  | 'selection'
  | 'researching'
  | 'outline'
  | 'final';

// Step 1: 리소스 입력 데이터
export interface ResourceInputData {
  urls: string[];
  files: string[];
  customPrompt: string;
}

// Step 3: 인사이트 데이터
export interface InsightData {
  id: string;
  title: string;
  summary: string;
  targetAudience: string;
  keywords: string[];
}

// Step 5: 아웃라인 섹션
export interface OutlineSection {
  id: string;
  type: 'intro' | 'body' | 'conclusion';
  title: string;
  content: string;
  keywords: string[];
}

// Step 5: 아웃라인 데이터
export interface OutlineData {
  sections: OutlineSection[];
  tone: string;
}
