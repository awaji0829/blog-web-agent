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

  const getMarkdownContent = () => draft.content || "";

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
            `  <li><span style="font-family: Pretendard, sans-serif; font-size: 18px;">${item}</span></li>`,
          );
        });
        htmlLines.push("</ul>");
        htmlLines.push("<p><br></p>");
        listItems.length = 0;
      }
    };

    const processInlineMarkdown = (text: string): string => {
      text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
      text = text.replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2"><u><span style="font-size: 20px;">$1</span></u></a>',
      );
      return text;
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === "") {
        if (inList) {
          flushList();
          inList = false;
        }
        htmlLines.push("<p><br></p>");
        continue;
      }
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        if (inList) {
          flushList();
          inList = false;
        }
        const headingText = processInlineMarkdown(headingMatch[2]);
        htmlLines.push(`<p style="line-height: 2;">`);
        htmlLines.push(
          `  <span style="font-weight: bold; font-size: 24px; font-family: Pretendard, sans-serif;">${headingText}</span>`,
        );
        htmlLines.push(`</p>`);
        continue;
      }
      const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
      if (listMatch) {
        inList = true;
        listItems.push(processInlineMarkdown(listMatch[1]));
        continue;
      }
      if (inList) {
        flushList();
        inList = false;
      }
      const processedText = processInlineMarkdown(trimmed);
      htmlLines.push(`<p style="line-height: 2;">`);
      htmlLines.push(
        `  <span style="font-family: Pretendard, sans-serif; font-size: 18px;">${processedText}</span>`,
      );
      htmlLines.push(`</p>`);
    }
    if (inList) flushList();
    return htmlLines.join("\n");
  };

  const getFroalaHtml = () =>
    convertMarkdownToFroalaHtml(getMarkdownContent());

  const copyText = async (text: string, set: (b: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    set(true);
    setTimeout(() => set(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([getMarkdownContent()], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blog-draft.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openGoogleDocs = () =>
    window.open("https://docs.google.com/document/create", "_blank");

  return (
    <>
      <div className="sage-card">
        <h3
          className="sage-eyebrow flex items-center gap-2"
          style={{ marginBottom: 16 }}
        >
          <Share2
            className="w-4 h-4"
            style={{ color: "var(--forest)" }}
            strokeWidth={1.5}
          />
          내보내기 및 공유
        </h3>

        <div className="space-y-3">
          <button
            onClick={openGoogleDocs}
            className="w-full flex items-center justify-between group"
            style={{
              padding: 16,
              background: "var(--leaf)",
              borderRadius: "var(--r-md)",
              color: "var(--forest)",
              fontWeight: 500,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  background: "var(--page)",
                  borderRadius: "50%",
                }}
              >
                <FileText
                  className="w-5 h-5"
                  style={{ color: "var(--forest)" }}
                  strokeWidth={1.5}
                />
              </div>
              Google Docs로 보내기
            </div>
            <ExternalLink
              className="w-4 h-4 opacity-50 group-hover:opacity-100"
              strokeWidth={1.5}
            />
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => copyText(getMarkdownContent(), setCopySuccess)}
              className={`sage-btn ${copySuccess ? "sage-btn--primary" : "sage-btn--secondary"} flex-col`}
              style={{ padding: 16, height: "auto" }}
            >
              {copySuccess ? (
                <>
                  <Check className="w-5 h-5" strokeWidth={1.5} />
                  복사했어요
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" strokeWidth={1.5} />
                  마크다운 복사
                </>
              )}
            </button>
            <button
              onClick={downloadMarkdown}
              className="sage-btn sage-btn--secondary flex-col"
              style={{ padding: 16, height: "auto" }}
            >
              <Download className="w-5 h-5" strokeWidth={1.5} />
              MD 다운로드
            </button>
          </div>
        </div>
        <p
          className="text-center"
          style={{ fontSize: 12, color: "var(--dusk)", marginTop: 12 }}
        >
          마크다운으로 복사하면 Froala 에디터와 그대로 호환돼요
        </p>
      </div>

      <div className="sage-card">
        <h3
          className="sage-eyebrow flex items-center gap-2"
          style={{ marginBottom: 16 }}
        >
          <FileText
            className="w-4 h-4"
            style={{ color: "var(--forest)" }}
            strokeWidth={1.5}
          />
          Froala HTML 변환
        </h3>

        <div className="space-y-3">
          <div className="relative">
            <textarea
              readOnly
              value={getFroalaHtml()}
              className="sage-textarea"
              style={{
                height: 192,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              placeholder="HTML 미리보기"
            />
            <div
              className="absolute top-2 right-2 sage-tag sage-tag--brand"
              style={{ fontSize: 11 }}
            >
              HTML
            </div>
          </div>

          <button
            onClick={() => copyText(getFroalaHtml(), setHtmlCopySuccess)}
            className={`sage-btn w-full ${htmlCopySuccess ? "sage-btn--primary" : "sage-btn--secondary"}`}
          >
            {htmlCopySuccess ? (
              <>
                <Check className="w-5 h-5" strokeWidth={1.5} />
                HTML을 복사했어요
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" strokeWidth={1.5} />
                Froala HTML 복사
              </>
            )}
          </button>

          <p
            style={{
              fontSize: 12,
              color: "var(--dusk)",
              lineHeight: 1.6,
            }}
          >
            Froala CMS 에디터에 바로 붙여 넣을 수 있는 형식이에요 · 최상위
            wrapper 없이 p · ul · li · a 태그만 사용하고, 본문은 line-height 2 ·
            18px, 제목은 24px로 변환돼요
          </p>
        </div>
      </div>
    </>
  );
}
