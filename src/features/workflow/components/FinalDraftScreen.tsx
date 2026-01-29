import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import { ProgressBar } from "@/components/shared/ProgressBar";

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
  thumbnail_url: string | null;
  status: 'draft' | 'final' | 'published';
}

interface FinalDraftScreenProps {
  onRestart: () => void;
  onComplete: () => void;
  outlineData?: OutlineData | null;
  draft?: Draft | null;
}

export function FinalDraftScreen({
  onRestart,
  onComplete,
  outlineData,
  draft,
}: FinalDraftScreenProps) {
  const [showAiTooltip, setShowAiTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(draft?.thumbnail_url || null);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Use draft content if available
  const draftTitle = draft?.title || "2024년 생성형 AI 트렌드와 미래 전망";
  const draftSubtitle = draft?.subtitle || "급변하는 AI 기술의 흐름을 짚어보고, 비즈니스에 미칠 영향을 심층 분석합니다.";
  const draftWordCount = draft?.word_count || 1240;

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

        // Calculate position relative to viewport but centered above selection
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
    document.addEventListener("keyup", handleSelection); // For keyboard selection

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("keyup", handleSelection);
    };
  }, []);

  const generateThumbnail = () => {
    setIsGeneratingThumb(true);
    // Simulate API call
    setTimeout(() => {
      setThumbnailUrl(
        "https://images.unsplash.com/photo-1646583288948-24548aedffd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neSUyMGJsb2clMjB0aHVtYm5haWx8ZW58MXx8fHwxNzY4Nzg3OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080"
      );
      setIsGeneratingThumb(false);
    }, 2000);
  };

  const [copySuccess, setCopySuccess] = useState(false);

  // 에디터 내용을 Markdown으로 변환
  const getMarkdownContent = () => {
    const editor = editorRef.current;
    if (!editor) return "";

    // 에디터의 innerHTML을 간단한 Markdown으로 변환
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

  const copyMarkdown = async () => {
    const markdown = getMarkdownContent();
    try {
      await navigator.clipboard.writeText(markdown);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
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
    <div className="flex flex-col h-full w-full bg-gray-50/50">
      <ProgressBar currentStep={6} />

      {/* Floating AI Tooltip */}
      {showAiTooltip && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in zoom-in duration-150 cursor-pointer hover:bg-black"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent losing selection
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
              {/* Paper-like styling */}
              <div
                ref={editorRef}
                contentEditable
                className="max-w-3xl mx-auto outline-none prose prose-lg prose-blue focus:prose-headings:text-blue-600"
                suppressContentEditableWarning
              >
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                  {draftTitle}
                </h1>

                <p className="text-gray-500 text-xl font-light mb-8">
                  {draftSubtitle}
                </p>

                {thumbnailUrl && (
                  <img
                    src={thumbnailUrl}
                    alt="Blog Thumbnail"
                    className="w-full h-64 object-cover rounded-xl mb-8 shadow-sm"
                  />
                )}

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                  1. 서론: 생성형 AI의 등장과 충격
                </h2>
                <p>
                  2023년 ChatGPT의 등장으로 시작된 생성형 AI 혁명은 산업 전반에
                  큰 파장을 일으켰습니다. 단순한 챗봇을 넘어, 이제는 코딩,
                  디자인, 데이터 분석 등 전문 영역까지 그 영향력을 확대하고
                  있습니다. 본 글에서는 이러한 변화의 흐름을 짚어보고, 2024년에
                  우리가 주목해야 할 핵심 트렌드를 분석합니다.
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                  2. 2024년 주요 기술 트렌드
                </h2>
                <p>
                  올해의 핵심 키워드는 단연{" "}
                  <strong>'멀티모달(Multi-modal)'</strong>과{" "}
                  <strong>'온디바이스 AI(On-device AI)'</strong>입니다. 텍스트를
                  넘어 이미지, 영상, 음성을 동시에 처리하는 멀티모달 모델은 AI의
                  활용성을 극대화하고 있습니다.
                </p>
                <blockquote>
                  "AI는 더 이상 클라우드 서버에만 존재하지 않습니다. 당신의
                  주머니 속 스마트폰, 손목 위의 워치에서 실시간으로 작동하게 될
                  것입니다."
                </blockquote>
                <p>
                  특히 스마트폰 제조사들은 NPU 성능을 대폭 강화하여, 인터넷 연결
                  없이도 고성능 AI 기능을 사용할 수 있는 환경을 구축하고
                  있습니다.
                </p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                  3. 비즈니스 적용 사례 분석
                </h2>
                <p>
                  마케팅 분야에서는 개인화된 콘텐츠 생성에 AI가 적극 도입되고
                  있습니다. 고객 데이터 분석을 통해 타겟 오디언스에게 최적화된
                  카피라이팅을 수 초 만에 생성하며, 이는 기존 방식 대비{" "}
                  <strong>300% 이상의 효율</strong>을 보여줍니다.
                </p>
                <ul>
                  <li>고객 CS 자동화: 24시간 응대 가능한 AI 상담원</li>
                  <li>
                    데이터 분석: 복잡한 엑셀 데이터를 자연어로 질의 및 시각화
                  </li>
                  <li>코드 어시스턴트: 개발 생산성 50% 향상</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">
                  4. 결론: 변화에 대처하는 자세
                </h2>
                <p>
                  AI는 결국 도구입니다. 이를 두려워하기보다는, 내 업무에 어떻게
                  접목시켜
                  <strong>'증강된 인간(Augmented Human)'</strong>이 될 것인가를
                  고민해야 합니다. 지속적인 학습과 열린 마음가짐이 그 어느
                  때보다 필요한 시점입니다.
                </p>
              </div>
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

            {/* SEO & Geo Checklist */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                SEO&GEO 가독성 분석
              </h3>

              <div className="space-y-5">
                {/* Score 1 */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">키워드 밀도</span>
                    <span className="font-bold text-green-600">
                      좋음 (2.4%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full w-[70%]" />
                  </div>
                </div>

                {/* Score 2 */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">가독성 점수</span>
                    <span className="font-bold text-blue-600">우수 (88점)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-[88%]" />
                  </div>
                </div>

                {/* Score 3 */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">글자 수</span>
                    <span className="font-bold text-gray-900">{draftWordCount.toLocaleString()}자</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full w-[40%]" />
                  </div>
                </div>
              </div>
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
