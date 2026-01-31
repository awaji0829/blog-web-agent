import { useState } from "react";
import {
  Image as ImageIcon,
  RotateCcw,
  Wand2,
  CheckCircle2,
} from "lucide-react";

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
    draft.thumbnail_url || null
  );
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);

  const generateThumbnail = () => {
    setIsGeneratingThumb(true);
    setTimeout(() => {
      const newUrl =
        "https://images.unsplash.com/photo-1646583288948-24548aedffd8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwdGVjaG5vbG9neSUyMGJsb2clMjB0aHVtYm5haWx8ZW58MXx8fHwxNzY4Nzg3OTc0fDA&ixlib=rb-4.1.0&q=80&w=1080";
      setThumbnailUrl(newUrl);
      setIsGeneratingThumb(false);
      if (onThumbnailUpdate) {
        onThumbnailUpdate(newUrl);
      }
    }, 2000);
  };

  return (
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
  );
}
