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
        "relative flex flex-col p-4 rounded-xl bg-white transition-all duration-200 cursor-pointer border-2 text-left",
        isSelected
          ? "border-blue-500 shadow-blue-100 shadow-lg"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md"
      )}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
          <Check className="w-4 h-4" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Left: Title and Summary */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug">
            {data.title}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            {data.summary}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>{data.targetAudience}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Hash className="w-3.5 h-3.5" />
              {data.keywords.map((keyword, i) => (
                <span key={i} className="text-gray-600">
                  {keyword}{i < data.keywords.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Action Button */}
        <div className="flex-shrink-0">
          <button
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
              isSelected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {isSelected ? "선택됨" : "선택"}
          </button>
        </div>
      </div>
    </div>
  );
}
