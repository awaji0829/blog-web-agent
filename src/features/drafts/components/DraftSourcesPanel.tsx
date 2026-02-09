import { ExternalLink, Calendar, Newspaper, BookOpen, FileBarChart, GraduationCap, Globe, MessageCircle } from "lucide-react";
import type { ResearchSource, SourceCategory } from "@/features/workflow/types";

interface DraftSourcesPanelProps {
  sources?: ResearchSource[];
}

const CATEGORY_CONFIG: Record<SourceCategory, { label: string; color: string; icon: typeof Newspaper }> = {
  news: { label: '뉴스', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Newspaper },
  blog: { label: '블로그', color: 'bg-green-50 text-green-700 border-green-200', icon: BookOpen },
  report: { label: '보고서', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileBarChart },
  paper: { label: '논문', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: GraduationCap },
  official: { label: '공식', color: 'bg-red-50 text-red-700 border-red-200', icon: Globe },
  sns: { label: 'SNS', color: 'bg-pink-50 text-pink-700 border-pink-200', icon: MessageCircle },
};

function formatDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

export function DraftSourcesPanel({ sources }: DraftSourcesPanelProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-gray-700" />
        <h3 className="font-bold text-gray-900">참고 출처</h3>
        <span className="text-xs text-gray-400 ml-auto">{sources.length}개</span>
      </div>

      <div className="space-y-2">
        {sources.map((source, i) => {
          const category = source.source_category || 'news';
          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.news;
          const IconComponent = config.icon;
          const displayDate = formatDate(source.published_date);
          const displayTitle = source.title || source.url || '출처 없음';

          return (
            <div
              key={i}
              onClick={() => source.url && window.open(source.url, '_blank', 'noopener,noreferrer')}
              className={`group px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:shadow-sm transition-all ${
                source.url ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Badge */}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border shrink-0 ${config.color}`}>
                  <IconComponent className="w-3 h-3" />
                  {config.label}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                    {displayTitle}
                  </p>
                  {displayDate && (
                    <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3" />
                      {displayDate}
                    </p>
                  )}
                </div>

                {/* External link icon */}
                {source.url && (
                  <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 shrink-0 mt-0.5 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
