import { useState } from "react";
import { Image as ImageIcon, RotateCcw, Wand2, CheckCircle2 } from "lucide-react";

interface Draft {
  id: string;
  thumbnail_url: string | null;
}

interface DraftThumbnailPanelProps {
  draft: Draft;
  onThumbnailUpdate?: (url: string) => void;
}

export function DraftThumbnailPanel({
  draft,
  onThumbnailUpdate,
}: DraftThumbnailPanelProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    draft.thumbnail_url || null,
  );
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);

  const generateThumbnail = () => {
    setIsGeneratingThumb(true);
    setTimeout(() => {
      const newUrl =
        "https://images.unsplash.com/photo-1646583288948-24548aedffd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neSUyMGJsb2clMjB0aHVtYm5haWx8ZW58MXx8fHwxNzY4Nzg3OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080";
      setThumbnailUrl(newUrl);
      setIsGeneratingThumb(false);
      onThumbnailUpdate?.(newUrl);
    }, 2000);
  };

  return (
    <div className="sage-card">
      <h3
        className="sage-eyebrow flex items-center gap-2"
        style={{ marginBottom: 16 }}
      >
        <ImageIcon
          className="w-4 h-4"
          style={{ color: "var(--forest)" }}
          strokeWidth={1.5}
        />
        AI 썸네일 생성
      </h3>

      {thumbnailUrl ? (
        <div className="space-y-3">
          <div
            className="relative group overflow-hidden"
            style={{
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border-sage)",
            }}
          >
            <img
              src={thumbnailUrl}
              alt="생성된 썸네일"
              className="w-full h-40 object-cover"
            />
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(46, 58, 30, 0.4)" }}
            >
              <button
                onClick={generateThumbnail}
                className="sage-btn sage-btn--secondary sage-btn--sm"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} /> 다시 생성
              </button>
            </div>
          </div>
          <p
            className="flex items-center justify-center gap-1"
            style={{ fontSize: 12, color: "var(--forest)", fontWeight: 500 }}
          >
            <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> 만들었어요
          </p>
        </div>
      ) : (
        <div
          className="text-center space-y-3"
          style={{
            background: "var(--mist)",
            border: "1px dashed var(--border-deep)",
            borderRadius: "var(--r-md)",
            padding: 24,
          }}
        >
          <div
            className="sage-icon-tile mx-auto"
            style={{ width: 48, height: 48 }}
          >
            <Wand2 className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>
            글 내용에 어울리는 썸네일을 만들어 드려요
          </div>
          <button
            onClick={generateThumbnail}
            disabled={isGeneratingThumb}
            className="sage-btn sage-btn--primary w-full"
          >
            {isGeneratingThumb ? "썸네일을 만들고 있어요" : "썸네일 만들기"}
          </button>
        </div>
      )}
    </div>
  );
}
