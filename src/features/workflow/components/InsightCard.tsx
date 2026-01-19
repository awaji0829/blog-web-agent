import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Target, Hash } from 'lucide-react';

export interface InsightData {
  id: string;
  title: string;
  summary: string;
  targetAudience: string;
  keywords: string[];
}

interface InsightCardProps {
  data: InsightData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function InsightCard({ data, isSelected, onSelect }: InsightCardProps) {
  return (
    <div 
      onClick={() => onSelect(data.id)}
      className={cn(
        "relative flex flex-col p-6 rounded-2xl bg-white transition-all duration-200 cursor-pointer border-2 text-left h-full",
        isSelected 
          ? "border-blue-500 shadow-blue-100 shadow-xl scale-[1.02] z-10" 
          : "border-transparent shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-gray-100"
      )}
    >
      {isSelected && (
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-200">
          <Check className="w-5 h-5" />
        </div>
      )}

      {/* Header */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
        {data.title}
      </h3>

      {/* Content */}
      <div className="flex-1 space-y-4">
        {/* Summary */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">핵심 요약</p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.summary}
          </p>
        </div>

        <div className="w-full h-px bg-gray-50 my-2" />

        {/* Target Audience */}
        <div className="flex items-start gap-2">
          <Target className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-0.5">타겟 독자</span>
            <span className="text-sm font-medium text-gray-800">{data.targetAudience}</span>
          </div>
        </div>

        {/* Keywords */}
        <div className="flex items-start gap-2 pt-1">
          <Hash className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {data.keywords.map((keyword, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-600">
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-4 border-t border-gray-50">
        <button
          className={cn(
            "w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2",
            isSelected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100 group-hover:bg-gray-100"
          )}
        >
          {isSelected ? (
            <>
              <Check className="w-4 h-4" />
              선택됨
            </>
          ) : (
            <>
              이 주제로 선택
            </>
          )}
        </button>
      </div>
    </div>
  );
}
