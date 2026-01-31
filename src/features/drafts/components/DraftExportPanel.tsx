import { useState } from "react";
import {
  FileText,
  Copy,
  Download,
  Check,
  Share2,
  ExternalLink,
} from "lucide-react";

interface Draft {
  id: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  word_count: number;
  char_count: number | null;
  status: "draft" | "final" | "published";
}

interface DraftExportPanelProps {
  draft: Draft;
}

export function DraftExportPanel({ draft }: DraftExportPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [htmlCopySuccess, setHtmlCopySuccess] = useState(false);

  const getMarkdownContent = () => {
    // If we have draft content, return it directly (it's already markdown)
    if (draft.content) {
      return draft.content;
    }
    return "";
  };

  // Convert Markdown to Froala-compatible HTML
  const convertMarkdownToFroalaHtml = (markdown: string): string => {
    if (!markdown) return "";

    const lines = markdown.split("\n");
    const htmlLines: string[] = [];
    let inList = false;
    const listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        htmlLines.push("<p><br></p>");
        htmlLines.push("<ul>");
        listItems.forEach((item) => {
          htmlLines.push(
            `  <li><span style="font-family: Pretendard, sans-serif; font-size: 18px;">${item}</span></li>`
          );
        });
        htmlLines.push("</ul>");
        htmlLines.push("<p><br></p>");
        listItems.length = 0;
      }
    };

    const processInlineMarkdown = (text: string): string => {
      // Process bold (**text**)
      text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      // Process italic (*text*)
      text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
      // Process links [text](url) - CTA format
      text = text.replace(
        /\[(.+?)\]\((.+?)\)/g,
        '👉 <a href="$2"><u><span style="font-size: 20px;">$1</span></u></a>'
      );
      return text;
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Empty line
      if (trimmed === "") {
        if (inList) {
          flushList();
          inList = false;
        }
        htmlLines.push("<p><br></p>");
        continue;
      }

      // Heading (# ## ###) - all converted to bold p with 24px
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (inList) {
          flushList();
          inList = false;
        }
        const headingText = processInlineMarkdown(headingMatch[2]);
        htmlLines.push(`<p style="line-height: 2;">`);
        htmlLines.push(
          `  <span style="font-weight: bold; font-size: 24px; font-family: Pretendard, sans-serif;">${headingText}</span>`
        );
        htmlLines.push(`</p>`);
        continue;
      }

      // List item (- item)
      const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (listMatch) {
        inList = true;
        const itemText = processInlineMarkdown(listMatch[1]);
        listItems.push(itemText);
        continue;
      }

      // Regular paragraph
      if (inList) {
        flushList();
        inList = false;
      }
      const processedText = processInlineMarkdown(trimmed);
      htmlLines.push(`<p style="line-height: 2;">`);
      htmlLines.push(
        `  <span style="font-family: Pretendard, sans-serif; font-size: 18px;">${processedText}</span>`
      );
      htmlLines.push(`</p>`);
    }

    // Flush any remaining list
    if (inList) {
      flushList();
    }

    return htmlLines.join("\n");
  };

  const getFroalaHtml = () => {
    const markdown = getMarkdownContent();
    return convertMarkdownToFroalaHtml(markdown);
  };

  const copyMarkdown = async () => {
    const markdown = getMarkdownContent();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = markdown;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const copyFroalaHtml = async () => {
    const html = getFroalaHtml();
    try {
      await navigator.clipboard.writeText(html);
      setHtmlCopySuccess(true);
      setTimeout(() => setHtmlCopySuccess(false), 2000);
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = html;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setHtmlCopySuccess(true);
      setTimeout(() => setHtmlCopySuccess(false), 2000);
    }
  };

  const downloadMarkdown = () => {
    const markdown = getMarkdownContent();
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blog-draft.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openGoogleDocs = () => {
    window.open("https://docs.google.com/document/create", "_blank");
  };

  return (
    <>
      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-600" />
          내보내기 및 공유
        </h3>

        <div className="space-y-3">
          <button
            onClick={openGoogleDocs}
            className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 font-bold hover:bg-blue-100 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              Google Docs로 전송
            </div>
            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copyMarkdown}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all font-medium text-sm gap-2 ${
                copySuccess
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-600"
              }`}
            >
              {copySuccess ? (
                <>
                  <Check className="w-5 h-5 text-green-500" />
                  복사 완료!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-gray-400" />
                  마크다운 복사
                </>
              )}
            </button>
            <button
              onClick={downloadMarkdown}
              className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-600 font-medium text-sm gap-2"
            >
              <Download className="w-5 h-5 text-gray-400" />
              MD 다운로드
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          * 마크다운 복사 시 Froala 에디터와 호환됩니다.
        </p>
      </div>

      {/* Froala HTML Export */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          Froala HTML 변환
        </h3>

        <div className="space-y-3">
          {/* HTML Preview */}
          <div className="relative">
            <textarea
              readOnly
              value={getFroalaHtml()}
              className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="HTML 미리보기..."
            />
            <div className="absolute top-2 right-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-medium">
              HTML
            </div>
          </div>

          {/* Copy HTML Button */}
          <button
            onClick={copyFroalaHtml}
            className={`w-full flex items-center justify-center gap-2 p-4 border rounded-xl transition-all font-bold text-sm ${
              htmlCopySuccess
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100 text-purple-700"
            }`}
          >
            {htmlCopySuccess ? (
              <>
                <Check className="w-5 h-5 text-green-500" />
                HTML 복사 완료!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-purple-500" />
                Froala HTML 복사
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 leading-relaxed">
            ℹ️ Froala CMS 에디터에 바로 붙여넣기 가능한 HTML 형식입니다.
            <br />
            • 최상위 wrapper 없음 (p, ul, li, a 태그만 사용)
            <br />
            • line-height: 2, font-size: 18px 기본 적용
            <br />• 제목은 bold + 24px로 변환 (h1~h6 미사용)
          </p>
        </div>
      </div>
    </>
  );
}
