import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  "리소스 투입",
  "분석 중",
  "인사이트 선택",
  "리서치 중",
  "개요 검토",
  "최종 초안"
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="w-full py-6 border-b border-gray-100 bg-white mb-8">
      <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] text-sm">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={index} className="flex items-center">
                <div 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap",
                    isActive 
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-100" 
                      : isCompleted 
                        ? "text-gray-400" 
                        : "text-gray-300"
                  )}
                >
                  <span className={cn(
                    "w-5 h-5 flex items-center justify-center rounded-full text-xs",
                    isActive ? "bg-blue-600 text-white" : isCompleted ? "bg-gray-200 text-gray-500" : "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <Check className="w-3 h-3" /> : stepNum}
                  </span>
                  <span>{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className="mx-2 text-gray-300">›</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
