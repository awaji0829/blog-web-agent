import { useState, useEffect, useRef } from "react";
import { Wand2 } from "lucide-react";

interface Draft {
  id: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  word_count: number;
  char_count: number | null;
  status: "draft" | "final" | "published";
}

interface DraftEditorProps {
  draft: Draft;
  onContentChange?: (content: string) => void;
  isEditable?: boolean;
}

export function DraftEditor({
  draft,
  onContentChange,
  isEditable = true,
}: DraftEditorProps) {
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle text selection for AI tooltip
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (
        selection &&
        selection.toString().length > 0 &&
        editorRef.current?.contains(selection.anchorNode)
      ) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setTooltipPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setShowAiTooltip(true);
      } else {
        setShowAiTooltip(false);
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("keyup", handleSelection);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []);

  // Convert markdown content to HTML for display
  const renderContent = () => {
    if (!draft.content) return null;

    // Simple markdown to HTML conversion for display
    const html = draft.content
      .replace(/^# (.+)$/gm, '<h1 class="text-4xl font-extrabold text-gray-900 mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold text-gray-800 mt-8 mb-4">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold text-gray-800 mt-6 mb-3">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-1 my-4">$&</ul>')
      .replace(/\n\n/g, '</p><p class="my-4">')
      .replace(/^(?!<[h|u|b|l])(.+)$/gm, '<p class="my-4">$1</p>');

    return { __html: html };
  };

  const handleInput = () => {
    if (onContentChange && editorRef.current) {
      onContentChange(editorRef.current.innerText);
    }
  };

  const draftTitle = draft.title || "블로그 제목";
  const draftSubtitle = draft.subtitle || "";

  return (
    <>
      {/* Floating AI Tooltip */}
      {showAiTooltip && isEditable && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in zoom-in duration-150 cursor-pointer hover:bg-black"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          onMouseDown={(e) => {
            e.preventDefault();
            alert("AI 문장 다듬기 기능이 실행됩니다.");
          }}
        >
          <Wand2 className="w-3 h-3 text-purple-400" />
          AI 문장 다듬기
        </div>
      )}

      {/* Editor */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[800px] p-12 relative">
        {draft.content ? (
          <div
            ref={editorRef}
            contentEditable={isEditable}
            onInput={handleInput}
            className="max-w-3xl mx-auto outline-none prose prose-lg prose-blue focus:prose-headings:text-blue-600"
            suppressContentEditableWarning
            dangerouslySetInnerHTML={renderContent() || undefined}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={isEditable}
            onInput={handleInput}
            className="max-w-3xl mx-auto outline-none prose prose-lg prose-blue focus:prose-headings:text-blue-600"
            suppressContentEditableWarning
          >
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              {draftTitle}
            </h1>
            {draftSubtitle && (
              <p className="text-gray-500 text-xl font-light mb-8">
                {draftSubtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
