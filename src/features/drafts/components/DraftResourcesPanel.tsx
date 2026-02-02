import { Link as LinkIcon, Tag, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Resource {
  id: string;
  source_type: 'url' | 'file';
  source_url: string | null;
  file_name: string | null;
  file_path: string | null;
  title: string | null;
}

interface DraftResourcesPanelProps {
  resources?: Resource[];
  keywords?: string[] | null;
}

export function DraftResourcesPanel({ resources, keywords }: DraftResourcesPanelProps) {
  const hasResources = resources && resources.length > 0;
  const hasKeywords = keywords && keywords.length > 0;

  const getResourceUrl = (resource: Resource): string | null => {
    if (resource.source_type === 'url') {
      return resource.source_url;
    } else if (resource.source_type === 'file' && resource.file_path) {
      const { data } = supabase.storage
        .from('resources')
        .getPublicUrl(resource.file_path);
      return data.publicUrl;
    }
    return null;
  };

  const handleResourceClick = (resource: Resource) => {
    const url = getResourceUrl(resource);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!hasResources && !hasKeywords) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="font-bold text-gray-900">참고 자료 & 키워드</h3>
        </div>
        <p className="text-sm text-gray-400 text-center py-4">
          자료 정보 없음
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-gray-700" />
        <h3 className="font-bold text-gray-900">참고 자료 & 키워드</h3>
      </div>

      <div className="space-y-4">
        {/* Resources */}
        {hasResources && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <LinkIcon className="w-3.5 h-3.5" />
              사용된 자료
            </div>
            <div className="space-y-1.5">
              {resources.map((r) => {
                const hasLink = getResourceUrl(r) !== null;
                return (
                  <div
                    key={r.id}
                    onClick={() => hasLink && handleResourceClick(r)}
                    className={`text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-between gap-2 ${
                      hasLink ? 'cursor-pointer hover:bg-gray-100 hover:shadow-sm transition-all' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium flex-shrink-0">
                        {r.source_type === 'url' ? '🔗' : '📄'}
                      </span>
                      <span className="truncate">
                        {r.source_type === 'url'
                          ? (r.title || r.source_url || 'URL')
                          : (r.file_name || '파일')}
                      </span>
                    </div>
                    {hasLink && (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Keywords */}
        {hasKeywords && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <Tag className="w-3.5 h-3.5" />
              핵심 키워드
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-violet-50 text-violet-700 text-sm rounded-full font-medium"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
