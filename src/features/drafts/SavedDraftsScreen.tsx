import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  Calendar,
  Eye,
  Trash2,
  BarChart3,
  Loader2,
  Plus,
  Search,
  ChevronRight,
  Link as LinkIcon,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { blogApi } from '@/lib/api';
import type { DraftWithDetails } from '@/features/workflow/types';

interface SavedDraftsScreenProps {
  onNewDraft: () => void;
}

export function SavedDraftsScreen({ onNewDraft }: SavedDraftsScreenProps) {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await blogApi.getAllDrafts();
      setDrafts(data);
    } catch (err) {
      console.error('Failed to load drafts:', err);
      setError('저장된 초안을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('정말로 이 초안을 삭제하시겠습니까?')) return;

    try {
      await blogApi.deleteDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (err) {
      console.error('Failed to delete draft:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const filteredDrafts = drafts.filter(draft =>
    draft.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: 'draft' | 'final' | 'published') => {
    switch (status) {
      case 'published':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">발행됨</span>;
      case 'final':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">최종</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">초안</span>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">저장된 초안</h1>
            <button
              onClick={onNewDraft}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              새 글 작성
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목 또는 내용으로 검색..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">초안을 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={loadDrafts}
                className="text-blue-600 hover:underline"
              >
                다시 시도
              </button>
            </div>
          ) : filteredDrafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">
                {searchQuery ? '검색 결과가 없습니다.' : '저장된 초안이 없습니다.'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNewDraft}
                  className="text-blue-600 hover:underline font-medium"
                >
                  첫 번째 글을 작성해보세요
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrafts.map((draft, index) => (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/drafts/${draft.id}`)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusBadge(draft.status)}
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(draft.created_at)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
                        {draft.title || '제목 없음'}
                      </h3>

                      {draft.subtitle && (
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {draft.subtitle}
                        </p>
                      )}

                      {/* Resources */}
                      {draft.resources && draft.resources.length > 0 && (
                        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                          <LinkIcon className="w-3 h-3" />
                          <span>
                            {draft.resources.map((r, i) => (
                              <span key={r.id}>
                                {r.source_type === 'url' ? (r.title || r.source_url || 'URL') : (r.file_name || '파일')}
                                {i < draft.resources!.length - 1 && ', '}
                              </span>
                            ))}
                          </span>
                        </div>
                      )}

                      {/* Keywords */}
                      {draft.primary_keywords && draft.primary_keywords.length > 0 && (
                        <div className="mb-3 flex items-start gap-2">
                          <Tag className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {draft.primary_keywords.map((keyword, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>{draft.word_count?.toLocaleString() || 0}단어</span>
                        {draft.char_count && (
                          <span>{draft.char_count.toLocaleString()}자</span>
                        )}
                        {draft.seo_metrics && (
                          <span className="flex items-center gap-1 text-green-600">
                            <BarChart3 className="w-3 h-3" />
                            SEO {draft.seo_metrics.overall_score}점
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleDelete(draft.id, e)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="p-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
