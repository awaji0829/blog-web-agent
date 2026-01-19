import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCw, Lightbulb, Plus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { InsightCard, InsightData } from './InsightCard';

// Mock Data
const MOCK_INSIGHTS: InsightData[] = [
  {
    id: '1',
    title: '2024년 생성형 AI 트렌드와 미래 전망',
    summary: '급변하는 AI 기술의 흐름을 짚어보고, 비즈니스에 미칠 영향을 분석합니다.',
    targetAudience: '기술 트렌드에 민감한 기획자, PM',
    keywords: ['생성형AI', '테크트렌드', '미래전망']
  },
  {
    id: '2',
    title: '효율적인 원격 근무를 위한 툴 가이드',
    summary: '리모트 워크 환경에서 생산성을 높여주는 협업 툴 5가지를 소개하고 비교합니다.',
    targetAudience: '스타트업 종사자, 프리랜서',
    keywords: ['생산성', '협업툴', '원격근무']
  },
  {
    id: '3',
    title: '브랜딩을 강화하는 스토리텔링 전략',
    summary: '고객의 마음을 움직이는 브랜드 서사를 만드는 구체적인 방법론을 제시합니다.',
    targetAudience: '브랜드 마케터, 콘텐츠 에디터',
    keywords: ['브랜딩', '스토리텔링', '마케팅']
  },
  {
    id: '4',
    title: '초보자를 위한 재테크 포트폴리오 구성법',
    summary: '사회초년생이 쉽게 따라 할 수 있는 자산 배분 전략과 실천 팁을 다룹니다.',
    targetAudience: '사회초년생, 재테크 입문자',
    keywords: ['재테크', '자산관리', '돈관리']
  }
];

interface InsightSelectionScreenProps {
  onNext: (selectedInsights: InsightData[]) => void;
  onBack?: () => void;
}

export function InsightSelectionScreen({ onNext, onBack }: InsightSelectionScreenProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isIdeaInputOpen, setIsIdeaInputOpen] = useState(false);
  const [customIdea, setCustomIdea] = useState("");

  const toggleSelection = (id: string) => {
    // Single selection logic for now based on UI "Select this topic", but prompt says "Select one or multiple".
    // I will support multiple.
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={3} />
      
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3 py-4">
            <h2 className="text-3xl font-bold text-gray-900">
              AI가 분석한 콘텐츠 인사이트를 확인해 보세요.
            </h2>
            <p className="text-gray-500 text-lg">
              이 중에서 가장 발행하고 싶은 주제를 하나 또는 여러 개 선택해 진행할 수 있습니다.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_INSIGHTS.map((insight) => (
              <InsightCard
                key={insight.id}
                data={insight}
                isSelected={selectedIds.includes(insight.id)}
                onSelect={toggleSelection}
              />
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="max-w-2xl mx-auto space-y-6 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm font-medium">
                <RotateCw className="w-4 h-4" />
                다른 인사이트 추천받기
              </button>
              
              <button 
                onClick={() => setIsIdeaInputOpen(!isIdeaInputOpen)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full border transition-all shadow-sm font-medium",
                  isIdeaInputOpen 
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-orange-600 hover:border-orange-100"
                )}
              >
                <Lightbulb className={cn("w-4 h-4", isIdeaInputOpen ? "text-blue-500" : "text-orange-400")} />
                직접 아이디어 입력
              </button>
            </div>

            {/* Custom Idea Input */}
            <AnimatePresence>
              {isIdeaInputOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={customIdea}
                        onChange={(e) => setCustomIdea(e.target.value)}
                        placeholder="새로운 콘텐츠 아이디어를 직접 입력해 보세요."
                        className="flex-1 text-lg p-2 bg-transparent border-b-2 border-gray-100 focus:border-blue-500 focus:outline-none transition-colors"
                        autoFocus
                      />
                      <button 
                         className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={!customIdea.trim()}
                         onClick={() => {
                            // Add logic
                            console.log("Add custom idea");
                         }}
                      >
                        추가
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next Button Floating or Fixed? 
             The prompt didn't strictly specify a global "Next" button at the bottom, 
             but usually, after selection, you need to proceed. 
             "진행할 수 있습니다" implies an action. 
             However, the "Select this topic" button on the card might act as the trigger or just a toggle.
             Given "Select one or multiple", we probably need a "Proceed with selected" button.
             
             Wait, prompt says: 
             "✅ 이 주제로 선택" 버튼 (카드의 메인 액션 버튼).
             
             If I can select multiple, I probably need a main CTA at the bottom right or center.
             Or maybe the card button IS the trigger? "Select this topic" -> proceeds immediately? 
             No, "one or multiple" implies batch selection.
             
             Let's add a "Proceed" button that appears when at least one is selected.
          */}
          
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
              >
                <button
                  onClick={() => {
                    const selected = MOCK_INSIGHTS.filter(insight => selectedIds.includes(insight.id));
                    onNext(selected);
                  }}
                  className="bg-gray-900 text-white pl-8 pr-6 py-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4 text-lg font-bold"
                >
                  {selectedIds.length}개의 주제로 진행하기
                  <div className="bg-white/20 rounded-full p-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
