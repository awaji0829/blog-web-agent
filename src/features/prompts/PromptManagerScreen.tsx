import { useState, useEffect } from 'react';
import { blogApi, type AiPrompt } from '@/lib/api';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';

export function PromptManagerScreen() {
  const [prompts, setPrompts] = useState<AiPrompt[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
  const hasChanges = selectedPrompt && editingText !== selectedPrompt.system_prompt;

  // Load all prompts on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  // Set editing text when selection changes
  useEffect(() => {
    if (selectedPrompt) {
      setEditingText(selectedPrompt.system_prompt);
    }
  }, [selectedPromptId]);

  async function loadPrompts() {
    try {
      setIsLoading(true);
      const data = await blogApi.getAllPrompts();
      setPrompts(data);
      if (data.length > 0 && !selectedPromptId) {
        setSelectedPromptId(data[0].id);
      }
    } catch (err) {
      setError('프롬프트를 불러올 수 없습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedPromptId || !hasChanges) return;

    try {
      setIsSaving(true);
      const updated = await blogApi.updatePrompt(selectedPromptId, editingText);

      // Update local state
      setPrompts(prev =>
        prev.map(p => p.id === selectedPromptId ? updated : p)
      );

      alert('저장되었습니다!');
    } catch (err) {
      alert('저장에 실패했습니다.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReset() {
    if (!selectedPromptId) return;
    if (!confirm('기본값으로 복원하시겠습니까? 현재 내용은 사라집니다.')) return;

    try {
      setIsSaving(true);
      const updated = await blogApi.resetPromptToDefault(selectedPromptId);

      setPrompts(prev =>
        prev.map(p => p.id === selectedPromptId ? updated : p)
      );
      setEditingText(updated.system_prompt);

      alert('기본값으로 복원되었습니다.');
    } catch (err) {
      alert('복원에 실패했습니다.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">프롬프트를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar: Prompt List */}
      <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">프롬프트 관리</h2>
          <p className="text-sm text-gray-600">AI 함수별 시스템 프롬프트</p>
        </div>
        <div className="p-2">
          {prompts.map(prompt => (
            <button
              key={prompt.id}
              onClick={() => setSelectedPromptId(prompt.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                selectedPromptId === prompt.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="font-semibold text-sm">{prompt.display_name}</div>
              <div className="text-xs text-gray-500 mt-1">{prompt.function_name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {selectedPrompt ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <h1 className="text-2xl font-bold mb-2">{selectedPrompt.display_name}</h1>
              <p className="text-gray-600 mb-2">{selectedPrompt.description}</p>
              <p className="text-sm text-gray-500">
                함수: <code className="bg-gray-100 px-2 py-1 rounded">{selectedPrompt.function_name}</code>
                {' | '}
                마지막 수정: {new Date(selectedPrompt.updated_at).toLocaleString('ko-KR')}
              </p>
            </div>

            {/* Editor */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="flex-1 w-full font-mono text-sm border border-gray-300 rounded-lg p-4 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="시스템 프롬프트를 입력하세요..."
              />
              <div className="mt-3 text-sm text-gray-500 flex justify-between">
                <span>{editingText.length.toLocaleString()} 글자</span>
                {hasChanges && (
                  <span className="text-orange-600 font-medium">저장되지 않은 변경사항</span>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white border-t border-gray-200 p-6 flex gap-4">
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                기본값으로 복원
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            왼쪽에서 프롬프트를 선택하세요
          </div>
        )}
      </div>
    </div>
  );
}
