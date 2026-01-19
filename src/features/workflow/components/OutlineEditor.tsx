import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  FileText, 
  Send, 
  Sparkles,
  MoreVertical,
  AlignLeft
} from 'lucide-react';
import { ProgressBar } from '@/components/shared/ProgressBar';

interface OutlineSection {
  id: string;
  type: 'intro' | 'body' | 'conclusion';
  title: string;
  content: string; // Detail content for the right panel
  keywords: string[];
}

const INITIAL_OUTLINE: OutlineSection[] = [
  { 
    id: '1', 
    type: 'intro', 
    title: '서론: 생성형 AI의 등장과 충격', 
    content: '2023년 ChatGPT의 등장으로 시작된 생성형 AI 혁명은 산업 전반에 큰 파장을 일으켰습니다. 본 글에서는 이러한 변화의 흐름을 짚어봅니다.',
    keywords: ['ChatGPT', 'AI혁명', '산업변화']
  },
  { 
    id: '2', 
    type: 'body', 
    title: '본론 1: 2024년 주요 기술 트렌드', 
    content: '멀티모달 모델의 발전과 온디바이스 AI의 상용화가 올해의 핵심 키워드입니다. 특히 스마트폰 제조사들의 움직임이 심상치 않습니다.',
    keywords: ['멀티모달', '온디바이스AI', '스마트폰']
  },
  { 
    id: '3', 
    type: 'body', 
    title: '본론 2: 비즈니스 적용 사례 분석', 
    content: '마케팅, 고객 CS, 코딩 보조 등 실제 업무 현장에서 AI가 어떻게 쓰이고 있는지 구체적인 ROI 데이터와 함께 살펴봅니다.',
    keywords: ['업무자동화', 'ROI', '생산성']
  },
  { 
    id: '4', 
    type: 'conclusion', 
    title: '결론: 변화에 대처하는 우리의 자세', 
    content: 'AI는 도구일 뿐입니다. 이를 어떻게 활용하느냐에 따라 개인과 기업의 경쟁력이 결정될 것입니다. 지속적인 학습이 필요합니다.',
    keywords: ['경쟁력', '학습', '미래준비']
  }
];

interface OutlineData {
  sections: OutlineSection[];
  tone: string;
}

interface OutlineEditorProps {
  onBack: () => void;
  onNext: (data: OutlineData) => void;
  selectedInsights?: { id: string; title: string; summary: string; targetAudience: string; keywords: string[] }[];
}

export function OutlineEditor({ onBack, onNext, selectedInsights }: OutlineEditorProps) {
  const [sections, setSections] = useState<OutlineSection[]>(INITIAL_OUTLINE);
  const [selectedId, setSelectedId] = useState<string>(INITIAL_OUTLINE[0].id);
  const [chatInput, setChatInput] = useState("");
  const [tone, setTone] = useState("professional");

  const selectedSection = sections.find(s => s.id === selectedId) || sections[0];

  const handleUpdateSection = (id: string, field: keyof OutlineSection, value: any) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;
    
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);
  };

  const deleteSection = (id: string) => {
    const newSections = sections.filter(s => s.id !== id);
    setSections(newSections);
    if (selectedId === id && newSections.length > 0) {
      setSelectedId(newSections[0].id);
    }
  };

  const addSection = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newSection: OutlineSection = {
      id: newId,
      type: 'body',
      title: '새로운 섹션',
      content: '',
      keywords: []
    };
    setSections([...sections, newSection]);
    setSelectedId(newId);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      <ProgressBar currentStep={5} />

      <div className="flex-1 flex overflow-hidden max-w-[1600px] mx-auto w-full px-4 pb-4 gap-4">
        
        {/* Left: Outline Tree */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-gray-500" />
              목차 구조
            </h3>
            <button 
              onClick={addSection}
              className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-500 hover:text-blue-600"
              title="섹션 추가"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {sections.map((section, index) => (
              <div 
                key={section.id}
                onClick={() => setSelectedId(section.id)}
                className={cn(
                  "group relative p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm",
                  selectedId === section.id 
                    ? "bg-blue-50 border-blue-200 shadow-sm" 
                    : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 w-1.5 h-1.5 rounded-full shrink-0",
                    section.type === 'intro' ? "bg-green-400" :
                    section.type === 'conclusion' ? "bg-orange-400" : "bg-blue-400"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate leading-tight",
                      selectedId === section.id ? "text-blue-900" : "text-gray-700"
                    )}>
                      {section.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">
                      {section.type === 'intro' ? '서론' : section.type === 'conclusion' ? '결론' : '본론'}
                    </p>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className={cn(
                  "absolute right-2 top-2 flex items-center gap-1 bg-white/90 backdrop-blur shadow-sm rounded-lg p-0.5 border border-gray-100 opacity-0 transition-opacity",
                  "group-hover:opacity-100",
                  selectedId === section.id && "opacity-100" // Always show on selected for mobile/touch friendly
                )}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveSection(index, 'up'); }}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); moveSection(index, 'down'); }}
                    disabled={index === sections.length - 1}
                    className="p-1 hover:bg-gray-100 rounded text-gray-500 disabled:opacity-30"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }}
                    className="p-1 hover:bg-red-50 hover:text-red-500 rounded text-gray-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Detail Editor */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-w-[400px]">
          <div className="p-6 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">섹션 제목</label>
            <input 
              type="text" 
              value={selectedSection.title}
              onChange={(e) => handleUpdateSection(selectedSection.id, 'title', e.target.value)}
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
              placeholder="제목을 입력하세요"
            />
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">핵심 내용 및 포함할 데이터</label>
              <textarea 
                value={selectedSection.content}
                onChange={(e) => handleUpdateSection(selectedSection.id, 'content', e.target.value)}
                className="w-full h-[300px] resize-none text-base leading-relaxed text-gray-700 bg-gray-50 rounded-xl border border-gray-200 p-4 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none"
                placeholder="이 섹션에 들어갈 내용을 자유롭게 작성하거나 수정하세요."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">추출 키워드</label>
                <button className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  키워드 자동 추천
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedSection.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100 flex items-center gap-2 group">
                    #{kw}
                    <button 
                      onClick={() => {
                        const newKws = selectedSection.keywords.filter((_, idx) => idx !== i);
                        handleUpdateSection(selectedSection.id, 'keywords', newKws);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-blue-900 transition-opacity"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button 
                  className="px-3 py-1.5 bg-gray-50 text-gray-400 text-sm font-medium rounded-lg border border-dashed border-gray-300 hover:border-gray-400 hover:text-gray-500 transition-colors"
                  onClick={() => {
                     // Simple prompt to add keyword for now
                     const k = prompt("추가할 키워드:");
                     if (k) handleUpdateSection(selectedSection.id, 'keywords', [...selectedSection.keywords, k]);
                  }}
                >
                  + 키워드 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Assistant */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI 어시스턴트
            </h3>
          </div>

          <div className="p-4 border-b border-gray-100">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">톤앤매너 설정</label>
            <div className="relative">
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              >
                <option value="professional">💼 전문적인 (Professional)</option>
                <option value="friendly">😊 친근한 (Friendly)</option>
                <option value="humorous">😄 유머러스한 (Humorous)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
            <div className="bg-blue-50 p-3 rounded-xl rounded-tl-none border border-blue-100 mb-4">
              <p className="text-sm text-blue-800 leading-relaxed">
                현재 <strong>{selectedSection.title}</strong> 섹션을 보고 계시네요. 
                <br/><br/>
                이 부분에 최신 통계 데이터를 더 보강할까요? 아니면 예시를 추가할까요?
              </p>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="예: 통계 지표를 더 강조해줘"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    // Send action
                    setChatInput("");
                  }
                }}
              />
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={!chatInput.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Actions */}
      <div className="bg-white border-t border-gray-200 py-4 px-8">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            인사이트 다시 고르기
          </button>
          
          <button
            onClick={() => onNext({ sections, tone })}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
          >
            <FileText className="w-5 h-5" />
            최종 초안 작성 시작
          </button>
        </div>
      </div>
    </div>
  );
}
