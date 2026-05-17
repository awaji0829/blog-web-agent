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

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (
        selection &&
        selection.toString().length > 0 &&
        editorRef.current?.contains(selection.anchorNode)
      ) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
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

  const renderContent = () => {
    if (!draft.content) return null;
    const html = draft.content
      .replace(
        /^# (.+)$/gm,
        '<h1 style="font-size:36px;font-weight:600;color:var(--ink);letter-spacing:-0.025em;line-height:1.15;margin:0 0 16px">$1</h1>',
      )
      .replace(
        /^## (.+)$/gm,
        '<h2 style="font-size:24px;font-weight:600;color:var(--ink);letter-spacing:-0.02em;margin:32px 0 14px">$1</h2>',
      )
      .replace(
        /^### (.+)$/gm,
        '<h3 style="font-size:18px;font-weight:500;color:var(--ink);margin:24px 0 12px">$1</h3>',
      )
      .replace(
        /\*\*(.+?)\*\*/g,
        '<span style="color:var(--forest)">$1</span>',
      )
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(
        /^> (.+)$/gm,
        '<blockquote style="border-left:3px solid var(--border-deep);padding-left:16px;color:var(--ink-soft);margin:16px 0">$1</blockquote>',
      )
      .replace(/^- (.+)$/gm, "<li>$1</li>")
      .replace(
        /(<li>.*<\/li>\n?)+/g,
        '<ul style="list-style:disc;padding-left:22px;margin:16px 0;line-height:1.7">$&</ul>',
      )
      .replace(/\n\n/g, '</p><p style="margin:16px 0;line-height:1.8">')
      .replace(
        /^(?!<[h|u|b|l])(.+)$/gm,
        '<p style="margin:16px 0;line-height:1.8">$1</p>',
      );
    return { __html: html };
  };

  const handleInput = () => {
    if (onContentChange && editorRef.current)
      onContentChange(editorRef.current.innerText);
  };

  const draftTitle = draft.title || "블로그 제목";
  const draftSubtitle = draft.subtitle || "";

  return (
    <>
      {showAiTooltip && isEditable && (
        <div
          className="fixed z-50 -translate-x-1/2 -translate-y-full flex items-center gap-2 cursor-pointer"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            background: "var(--ink)",
            color: "var(--leaf)",
            fontSize: 12,
            padding: "6px 12px",
            borderRadius: "var(--r-sm)",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            alert("AI 문장 다듬기를 시작할게요");
          }}
        >
          <Wand2
            className="w-3 h-3"
            style={{ color: "var(--sage)" }}
            strokeWidth={1.5}
          />
          AI 문장 다듬기
        </div>
      )}

      <div
        className="min-h-[800px] relative"
        style={{
          background: "var(--page)",
          border: "1px solid var(--border-sage)",
          borderRadius: "var(--r-xl)",
          padding: 48,
          color: "var(--ink)",
        }}
      >
        {draft.content ? (
          <div
            ref={editorRef}
            contentEditable={isEditable}
            onInput={handleInput}
            className="max-w-3xl mx-auto outline-none"
            style={{ fontSize: 15, lineHeight: 1.8 }}
            suppressContentEditableWarning
            dangerouslySetInnerHTML={renderContent() || undefined}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={isEditable}
            onInput={handleInput}
            className="max-w-3xl mx-auto outline-none"
            suppressContentEditableWarning
          >
            <h1
              style={{
                fontSize: 36,
                fontWeight: 600,
                color: "var(--ink)",
                letterSpacing: "-0.025em",
                marginBottom: 16,
              }}
            >
              {draftTitle}
            </h1>
            {draftSubtitle && (
              <p
                style={{
                  color: "var(--ink-soft)",
                  fontSize: 18,
                  marginBottom: 32,
                }}
              >
                {draftSubtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
