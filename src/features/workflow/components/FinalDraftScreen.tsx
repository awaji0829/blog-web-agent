import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Copy,
  Download,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Wand2,
  Share2,
  ExternalLink,
  BarChart3,
  CheckCircle2,
  PenTool,
  Lightbulb,
  AlertCircle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { analyzeSeo } from "@/lib/api";
import type { SeoAnalysisResult, SeoMetrics } from "@/features/workflow/types";

// Use SeoAnalysisResult for SEO state
type SeoAnalysisState = SeoAnalysisResult;

interface OutlineSection {
  id: string;
  type: "intro" | "body" | "conclusion";
  title: string;
  content: string;
  keywords: string[];
}

interface OutlineData {
  sections: OutlineSection[];
  tone: string;
}

interface Draft {
  id: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  word_count: number;
  char_count: number | null;
  thumbnail_url: string | null;
  status: "draft" | "final" | "published";
  seo_metrics: SeoMetrics | null;
  meta_description: string | null;
  primary_keywords: string[] | null;
}

interface FinalDraftScreenProps {
  onRestart: () => void;
  onComplete: () => void;
  outlineData?: OutlineData | null;
  draft?: Draft | null;
}

const LOADING_TEXTS = [
  "개요를 바탕으로 블로그 글을 작성하고 있습니다...",
  "각 섹션의 내용을 풍부하게 채워가고 있습니다...",
  "논리적 흐름과 가독성을 다듬고 있습니다...",
  "전문적이면서도 읽기 쉬운 문체로 마무리하고 있습니다...",
];

// Loading Screen Component
function DraftLoadingScreen() {
  const [textIndex, setTextIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
    }, 4000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        return Math.min(prev + Math.random() * 1.5, 95);
      });
    }, 150);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={6} />

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Central Animation */}
        <div className="relative mb-12">
          {/* Pulsing Circles */}
          <motion.div
            className="absolute inset-0 bg-green-100 rounded-full"
            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 bg-green-200 rounded-full"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />

          {/* Main Icon Circle */}
          <div className="relative w-32 h-32 bg-white rounded-full shadow-xl flex items-center justify-center z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <PenTool className="w-16 h-16 text-green-600" />
            </motion.div>
          </div>

          {/* Progress Ring */}
          <svg className="absolute top-0 left-0 w-32 h-32 -rotate-90 z-20 pointer-events-none">
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="64"
              cy="64"
              r="62"
              fill="none"
              stroke="#16A34A"
              strokeWidth="4"
              strokeDasharray={389.5}
              strokeDashoffset={389.5 * (1 - progress / 100)}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          </svg>
        </div>

        {/* Dynamic Text */}
        <div className="text-center space-y-4 max-w-lg z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            초안을 작성하고 있습니다
          </h2>

          <div className="h-8 relative">
            <AnimatePresence mode="wait">
              <motion.p
                key={textIndex}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                className="text-lg text-gray-600 absolute w-full left-0 right-0"
              >
                {LOADING_TEXTS[textIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Tip Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-16 bg-green-50 border border-green-100 px-6 py-4 rounded-xl flex items-center gap-3 max-w-md shadow-sm z-10"
        >
          <div className="bg-green-100 p-2 rounded-full">
            <Lightbulb className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-green-800 font-medium">
            Tip: 초안이 완성되면 직접 수정하거나 AI 문장 다듬기를 사용할 수 있습니다.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export function FinalDraftScreen({
  onRestart,
  onComplete,
  outlineData,
  draft,
}: FinalDraftScreenProps) {
  // Show loading screen if no draft data yet
  if (!draft) {
    return <DraftLoadingScreen />;
  }

  // If draft exists but has no content, show loading (still being written)
  if (!draft.content) {
    return <DraftLoadingScreen />;
  }

  // Ensure draft has required fields before rendering
  if (!draft.id) {
    console.error('Draft missing required id field:', draft);
    return <DraftLoadingScreen />;
  }

  return (
    <FinalDraftContent
      onRestart={onRestart}
      onComplete={onComplete}
      draft={draft}
    />
  );
}

// Separated content component to avoid hooks issues
function FinalDraftContent({
  onRestart,
  onComplete,
  draft,
}: {
  onRestart: () => void;
  onComplete: () => void;
  draft: Draft;
}) {
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    draft.thumbnail_url || null
  );
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<SeoAnalysisState | null>(null);
  const [isSeoLoading, setIsSeoLoading] = useState(false);
  const [seoError, setSeoError] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const draftTitle = draft.title || "블로그 제목";
  const draftSubtitle = draft.subtitle || "";
  const draftWordCount = draft.word_count || 0;
  const draftCharCount = draft.char_count || 0;

  // Fetch SEO analysis when draft is loaded
  useEffect(() => {
    const fetchSeoAnalysis = async () => {
      if (!draft.id) return;

      // If we already have SEO metrics from the draft, use them
      if (draft.seo_metrics) {
        setSeoAnalysis({
          overall_score: draft.seo_metrics.overall_score || 0,
          metrics: draft.seo_metrics,
          suggestions: [],
          generated_meta: {
            description: draft.meta_description || '',
            keywords: draft.primary_keywords || [],
          },
        });
        return;
      }

      setIsSeoLoading(true);
      setSeoError(null);

      try {
        const analysis = await analyzeSeo(draft.id, draft.primary_keywords || undefined);
        setSeoAnalysis(analysis);
      } catch (err) {
        console.error('SEO analysis failed:', err);
        setSeoError('SEO 분석에 실패했습니다.');
      } finally {
        setIsSeoLoading(false);
      }
    };

    fetchSeoAnalysis();
  }, [draft.id, draft.seo_metrics, draft.meta_description, draft.primary_keywords]);

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

  const generateThumbnail = () => {
    setIsGeneratingThumb(true);
    setTimeout(() => {
      setThumbnailUrl(
        "https://images.unsplash.com/photo-1646583288948-24548aedffd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neSUyMGJsb2clMjB0aHVtYm5haWx8ZW58MXx8fHwxNzY4Nzg3OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080"
      );
      setIsGeneratingThumb(false);
    }, 2000);
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const [htmlCopySuccess, setHtmlCopySuccess] = useState(false);

  const getMarkdownContent = () => {
    // If we have draft content, return it directly (it's already markdown)
    if (draft.content) {
      return draft.content;
    }

    const editor = editorRef.current;
    if (!editor) return "";

    let html = editor.innerHTML;
    let markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, "> $1\n\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<ul[^>]*>|<\/ul>/gi, "\n")
      .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, "![]($1)\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return markdown;
  };

  // Convert Markdown to Froala-compatible HTML
  const convertMarkdownToFroalaHtml = (markdown: string): string => {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    const htmlLines: string[] = [];
    let inList = false;
    const listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        htmlLines.push('<p><br></p>');
        htmlLines.push('<ul>');
        listItems.forEach(item => {
          htmlLines.push(`  <li><span style="font-family: Pretendard, sans-serif; font-size: 18px;">${item}</span></li>`);
        });
        htmlLines.push('</ul>');
        htmlLines.push('<p><br></p>');
        listItems.length = 0;
      }
    };

    const processInlineMarkdown = (text: string): string => {
      // Process bold (**text**)
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Process italic (*text*)
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      // Process links [text](url) - CTA format
      text = text.replace(/\[(.+?)\]\((.+?)\)/g, '👉 <a href="$2"><u><span style="font-size: 20px;">$1</span></u></a>');
      return text;
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Empty line
      if (trimmed === '') {
        if (inList) {
          flushList();
          inList = false;
        }
        htmlLines.push('<p><br></p>');
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
        htmlLines.push(`  <span style="font-weight: bold; font-size: 24px; font-family: Pretendard, sans-serif;">${headingText}</span>`);
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
      htmlLines.push(`  <span style="font-family: Pretendard, sans-serif; font-size: 18px;">${processedText}</span>`);
      htmlLines.push(`</p>`);
    }

    // Flush any remaining list
    if (inList) {
      flushList();
    }

    return htmlLines.join('\n');
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

  return (
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={6} />

      {/* Floating AI Tooltip */}
      {showAiTooltip && (
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

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col lg:flex-row gap-8">
          {/* Left Column: Editor View */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[800px] p-12 relative">
              {draft.content ? (
                <div
                  ref={editorRef}
                  contentEditable
                  className="max-w-3xl mx-auto outline-none prose prose-lg prose-blue focus:prose-headings:text-blue-600"
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={renderContent() || undefined}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
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
          </div>

          {/* Right Column: Action Panel */}
          <div className="w-full lg:w-96 space-y-6 shrink-0">
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

            {/* SEO & Geo Checklist */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                SEO&GEO 가독성 분석
                {isSeoLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
              </h3>

              {seoError ? (
                <div className="flex items-center gap-2 text-amber-600 text-sm py-2">
                  <AlertCircle className="w-4 h-4" />
                  {seoError}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Overall Score */}
                  {seoAnalysis && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">종합 SEO 점수</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-2xl font-bold text-green-600">
                            {seoAnalysis.overall_score}점
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Keyword Density */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">키워드 밀도</span>
                      <span className={cn(
                        "font-bold",
                        seoAnalysis?.metrics?.keyword_density?.status === 'good' ? "text-green-600" :
                        seoAnalysis?.metrics?.keyword_density?.status === 'low' ? "text-amber-600" : "text-red-600"
                      )}>
                        {seoAnalysis?.metrics?.keyword_density ? (
                          <>
                            {seoAnalysis.metrics.keyword_density.status === 'good' ? '좋음' :
                             seoAnalysis.metrics.keyword_density.status === 'low' ? '낮음' : '높음'}
                            {' '}({seoAnalysis.metrics.keyword_density.value.toFixed(1)}%)
                          </>
                        ) : isSeoLoading ? '분석 중...' : '-'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          seoAnalysis?.metrics?.keyword_density?.status === 'good' ? "bg-green-500" :
                          seoAnalysis?.metrics?.keyword_density?.status === 'low' ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${seoAnalysis?.metrics?.keyword_density?.score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Readability */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">가독성 점수</span>
                      <span className={cn(
                        "font-bold",
                        seoAnalysis?.metrics?.readability?.status === 'good' ? "text-blue-600" : "text-amber-600"
                      )}>
                        {seoAnalysis?.metrics?.readability ? (
                          <>
                            {seoAnalysis.metrics.readability.status === 'good' ? '우수' : '개선 필요'}
                            {' '}({seoAnalysis.metrics.readability.score}점)
                          </>
                        ) : isSeoLoading ? '분석 중...' : '-'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${seoAnalysis?.metrics?.readability?.score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Content Length */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">콘텐츠 길이</span>
                      <span className="font-bold text-gray-900">
                        {draftWordCount.toLocaleString()}단어 / {draftCharCount.toLocaleString()}자
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          seoAnalysis?.metrics?.content_length?.status === 'good' ? "bg-green-500" :
                          seoAnalysis?.metrics?.content_length?.status === 'short' ? "bg-amber-500" : "bg-blue-500"
                        )}
                        style={{ width: `${seoAnalysis?.metrics?.content_length?.score || Math.min((draftWordCount / 2500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Heading Structure */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">헤딩 구조</span>
                      <span className={cn(
                        "font-bold",
                        (seoAnalysis?.metrics?.heading_structure?.score || 0) >= 70 ? "text-green-600" : "text-amber-600"
                      )}>
                        {seoAnalysis?.metrics?.heading_structure ? (
                          <>H2: {seoAnalysis.metrics.heading_structure.h2_count}개, H3: {seoAnalysis.metrics.heading_structure.h3_count}개</>
                        ) : isSeoLoading ? '분석 중...' : '-'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${seoAnalysis?.metrics?.heading_structure?.score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Title Optimization */}
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">제목 최적화</span>
                      <span className={cn(
                        "font-bold",
                        seoAnalysis?.metrics?.title_optimization?.status === 'good' ? "text-green-600" : "text-amber-600"
                      )}>
                        {seoAnalysis?.metrics?.title_optimization ? (
                          <>
                            {seoAnalysis.metrics.title_optimization.status === 'good' ? '최적' :
                             seoAnalysis.metrics.title_optimization.status === 'too_short' ? '너무 짧음' : '너무 김'}
                            {' '}({seoAnalysis.metrics.title_optimization.length}자)
                          </>
                        ) : isSeoLoading ? '분석 중...' : '-'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${seoAnalysis?.metrics?.title_optimization?.score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Suggestions */}
                  {seoAnalysis?.suggestions && seoAnalysis.suggestions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">개선 제안</h4>
                      <div className="space-y-2">
                        {seoAnalysis.suggestions.slice(0, 3).map((suggestion, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "text-xs p-2 rounded-lg flex items-start gap-2",
                              suggestion.priority === 'high' ? "bg-red-50 text-red-700" :
                              suggestion.priority === 'medium' ? "bg-amber-50 text-amber-700" :
                              "bg-blue-50 text-blue-700"
                            )}
                          >
                            <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                            {suggestion.message}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Thumbnail */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                AI 썸네일 생성
              </h3>

              {thumbnailUrl ? (
                <div className="space-y-3">
                  <div className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={thumbnailUrl}
                      alt="Generated Thumbnail"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={generateThumbnail}
                        className="bg-white/20 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/30 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> 재생성
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 생성 완료
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto text-purple-500">
                    <Wand2 className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-gray-500">
                    글 내용에 딱 맞는
                    <br />
                    고퀄리티 썸네일을 생성합니다.
                  </div>
                  <button
                    onClick={generateThumbnail}
                    disabled={isGeneratingThumb}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg font-bold text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isGeneratingThumb ? "생성 중..." : "썸네일 만들기"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-8 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <button
            onClick={onRestart}
            className="text-gray-400 text-sm font-medium hover:text-gray-600 underline decoration-gray-300 underline-offset-4"
          >
            처음부터 다시 시작하기
          </button>

          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Check className="w-5 h-5" />
            최종 발행 완료
          </button>
        </div>
      </div>
    </div>
  );
}
