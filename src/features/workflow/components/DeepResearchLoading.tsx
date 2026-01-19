import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Search, BookOpen, BrainCircuit } from 'lucide-react';
import { ProgressBar } from '@/components/shared/ProgressBar';

const LOADING_TEXTS = [
  "선택하신 주제와 관련된 최신 뉴스 자료를 수집하고 있습니다...",
  "신뢰도 높은 통계 데이터와 관련 트렌드를 분석 중입니다...",
  "글의 논리적인 구조를 설계하는 중입니다. 약 30초 정도 소요됩니다..."
];

const FLOATING_KEYWORDS = [
  "AI 트렌드", "생산성", "자동화", "시장 규모", "2024 전망", 
  "데이터 분석", "인사이트", "기술 혁신", "사용자 경험", "ROI"
];

interface DeepResearchLoadingProps {
  onComplete: () => void;
}

export function DeepResearchLoading({ onComplete }: DeepResearchLoadingProps) {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Text cycling
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 4000);

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500); // Slight delay before finishing
          return 100;
        }
        // Random increment
        return Math.min(prev + Math.random() * 2, 100);
      });
    }, 100);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={4} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        
        {/* Floating Keywords Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FLOATING_KEYWORDS.map((keyword, i) => (
            <motion.div
              key={i}
              className="absolute text-sm font-medium text-blue-200/50 px-3 py-1 rounded-full border border-blue-100/30 bg-white/20 backdrop-blur-sm"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                scale: 0.5,
                opacity: 0 
              }}
              animate={{ 
                y: [null, Math.random() * -100],
                opacity: [0, 1, 0],
                scale: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "linear"
              }}
            >
              #{keyword}
            </motion.div>
          ))}
        </div>

        {/* Central Animation */}
        <div className="relative mb-12">
          {/* Pulsing Circles */}
          <motion.div 
            className="absolute inset-0 bg-blue-100 rounded-full"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="absolute inset-0 bg-blue-200 rounded-full delay-75"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Main Icon Circle */}
          <div className="relative w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
             <motion.div
               animate={{ rotateY: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             >
                <BrainCircuit className="w-16 h-16 text-blue-600" />
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
              stroke="#2563EB"
              strokeWidth="4"
              strokeDasharray={389.5} // 2 * pi * 62
              strokeDashoffset={389.5 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
        </div>

        {/* Dynamic Text */}
        <div className="text-center space-y-4 max-w-lg z-10">
          <h2 className="text-2xl font-bold text-gray-900">
             {Math.round(progress)}% 분석 완료
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
          className="mt-16 bg-blue-50 border border-blue-100 px-6 py-4 rounded-xl flex items-center gap-3 max-w-md shadow-sm z-10"
        >
          <div className="bg-blue-100 p-2 rounded-full">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-blue-800 font-medium">
            Tip: 리서치가 완료되면 글의 뼈대(Outline)를 직접 수정하실 수 있습니다.
          </p>
        </motion.div>

      </div>
    </div>
  );
}
