import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  AlignLeft,
  FileEdit,
  Lightbulb
} from 'lucide-react';
import { ProgressBar } from '@/components/shared/ProgressBar';

interface OutlineSection {
  id: string;
  type: 'intro' | 'body' | 'conclusion';
  title: string;
  content: string;
  keywords: string[];
}

interface OutlineData {
  sections: OutlineSection[];
  tone: string;
}

interface OutlineEditorProps {
  onBack: () => void;
  onNext: (data: OutlineData) => void;
  selectedInsights?: { id: string; title: string; summary: string; targetAudience: string; keywords: string[] }[];
  outline?: OutlineData | null;
  isLoading?: boolean;
}

const LOADING_TEXTS = [
  "리서치 결과를 분석하여 최적의 글 구조를 설계하고 있습니다...",
  "각 섹션에 들어갈 핵심 내용을 구성하고 있습니다...",
  "논리적인 흐름으로 개요를 정리하고 있습니다..."
];

// Loading Screen Component
function OutlineLoadingScreen() {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // Stay at 95% until data arrives
        return Math.min(prev + Math.random() * 2, 95);
      });
    }, 100);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={5} />

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Central Animation */}
        <div className="relative mb-12">
          {/* Pulsing Circles */}
          <motion.div
            className="absolute inset-0 bg-indigo-100 rounded-full"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 bg-indigo-200 rounded-full"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />

          {/* Main Icon Circle */}
          <div className="relative w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileEdit className="w-16 h-16 text-indigo-600" />
            </motion.div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90 z-20 pointer-events-none">
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="4"
              strokeDasharray={389.5}
              strokeDashoffset={389.5 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
        </div>

        {/* Dynamic Text */}
        <div className="text-center space-y-4 max-w-lg z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            개요를 생성하고 있습니다
          </h2>

          <div className="h-8 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-lg text-gray-600 absolute w-full left-0 right-0"
              >
                {LOADING_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Tip Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-16 bg-indigo-50 border border-indigo-100 px-6 py-4 rounded-xl flex items-center gap-3 max-w-md shadow-sm z-10"
        >
          <div className="bg-indigo-100 p-2 rounded-full">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-sm text-indigo-800 font-medium">
            Tip: 개요가 생성되면 섹션 순서와 내용을 자유롭게 수정할 수 있습니다.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function OutlineEditor({ onBack, onNext, selectedInsights, outline, isLoading }: OutlineEditorProps) {
  // Show loading screen if no outline data yet
  if (!outline || !outline.sections || outline.sections.length === 0) {
    return <OutlineLoadingScreen />;
  }

  return <OutlineEditorContent
    onBack={onBack}
    onNext={onNext}
    outline={outline}
    isLoading={isLoading}
  />;
}

// Separated editor content component to avoid hooks issues
function OutlineEditorContent({
  onBack,
  onNext,
  outline,
  isLoading
}: {
  onBack: () => void;
  onNext: (data: OutlineData) => void;
  outline: OutlineData;
  isLoading?: boolean;
}) {
  const [sections, setSections] = useState<OutlineSection[]>(outline.sections);
  const [selectedId, setSelectedId] = useState<string>(outline.sections[0]?.id || '1');
  const [chatInput, setChatInput] = useState("");
  const [tone, setTone] = useState(outline.tone || 'professional');

  // Update sections when outline prop changes
  useEffect(() => {
    if (outline.sections && outline.sections.length > 0) {
      setSections(outline.sections);
      setSelectedId(outline.sections[0]?.id || '1');
    }
    if (outline.tone) {
      setTone(outline.tone);
    }
  }, [outline]);

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
                  selectedId === section.id && "opacity-100"
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
              value={selectedSection?.title || ''}
              onChange={(e) => handleUpdateSection(selectedSection.id, 'title', e.target.value)}
              className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
              placeholder="제목을 입력하세요"
            />
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">핵심 내용 및 포함할 데이터</label>
              <textarea
                value={selectedSection?.content || ''}
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
                {(selectedSection?.keywords || []).map((kw, i) => (
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
                    const k = prompt("추가할 키워드:");
                    if (k) handleUpdateSection(selectedSection.id, 'keywords', [...(selectedSection.keywords || []), k]);
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
                현재 <strong>{selectedSection?.title}</strong> 섹션을 보고 계시네요.
                <br /><br />
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
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <FileText className="w-5 h-5" />
            {isLoading ? '처리 중...' : '최종 초안 작성 시작'}
          </button>
        </div>
      </div>
    </div>
  );
}
