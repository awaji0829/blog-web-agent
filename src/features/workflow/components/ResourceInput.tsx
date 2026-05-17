import { useState } from "react";
import {
  Link as LinkIcon,
  FileText,
  Plus,
  X,
  UploadCloud,
  Tag,
  Users,
} from "lucide-react";

interface ResourceInputData {
  urls: string[];
  files: string[];
  keywords: string;
  targetAudience: string;
}

interface ResourceInputProps {
  onStartAnalysis: (data: ResourceInputData) => void;
  error?: string | null;
}

const TARGET_AUDIENCE_OPTIONS = [
  { value: "general", label: "일반 대중" },
  { value: "expert", label: "업계 전문가" },
  { value: "executive", label: "경영진 / 의사결정자" },
  { value: "beginner", label: "학생 / 입문자" },
];

function SectionCard({
  icon,
  title,
  required,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="sage-card flex flex-col gap-4">
      <div
        className="flex items-center gap-2 pb-3"
        style={{ borderBottom: "1px solid var(--border-sage)" }}
      >
        <div className="sage-icon-tile" style={{ width: 32, height: 32 }}>
          {icon}
        </div>
        <span style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>
          {title}
        </span>
        <span
          className={`sage-tag ${required ? "sage-tag--brand" : "sage-tag--neutral"}`}
        >
          {required ? "필수" : "선택"}
        </span>
      </div>
      {children}
    </div>
  );
}

export function ResourceInput({ onStartAnalysis, error }: ResourceInputProps) {
  const [urls, setUrls] = useState<string[]>([""]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [customAudience, setCustomAudience] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleStartAnalysis = () => {
    onStartAnalysis({
      urls: urls.filter((u) => u.trim() !== ""),
      files: uploadedFiles,
      keywords,
      targetAudience:
        selectedAudiences.length > 0 ? selectedAudiences.join(", ") : "",
    });
  };

  const toggleAudience = (value: string) => {
    setSelectedAudiences((prev) =>
      prev.includes(value)
        ? prev.filter((a) => a !== value)
        : [...prev, value],
    );
  };

  const addCustomAudience = () => {
    const trimmed = customAudience.trim();
    if (trimmed && !selectedAudiences.includes(trimmed)) {
      setSelectedAudiences([...selectedAudiences, trimmed]);
      setCustomAudience("");
      setShowCustomInput(false);
    }
  };

  const removeAudience = (audience: string) =>
    setSelectedAudiences((prev) => prev.filter((a) => a !== audience));

  const addUrlInput = () => setUrls([...urls, ""]);

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) setUrls(urls.filter((_, i) => i !== index));
  };

  const handleFileUpload = () => {
    const mockFiles = ["company_report_2024.pdf", "market_analysis.docx"];
    setUploadedFiles((prev) => [...prev, ...mockFiles]);
  };

  const hasResources =
    urls.some((u) => u.trim() !== "") || uploadedFiles.length > 0;

  return (
    <div
      className="max-w-3xl mx-auto flex flex-col gap-5"
      style={{ padding: "48px 16px" }}
    >
      {/* Hero */}
      <div className="text-center mb-2">
        <div className="sage-eyebrow mb-3">새 글</div>
        <h1 style={{ color: "var(--ink)" }}>새로운 글을 시작해 볼까요</h1>
        <p
          className="mx-auto"
          style={{
            fontSize: 15,
            color: "var(--ink-soft)",
            marginTop: 10,
            lineHeight: 1.65,
            maxWidth: "52ch",
          }}
        >
          참고할 링크나 파일을 넣으면 핵심 인사이트를 찾아 드려요 · 약 30초 소요
        </p>
      </div>

      {error && (
        <div
          className="flex items-start gap-3"
          style={{
            background: "var(--warm)",
            borderRadius: "var(--r-md)",
            padding: "14px 16px",
          }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--clay)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            !
          </div>
          <div className="flex-1">
            <div
              style={{ fontWeight: 500, color: "#7a4f1e", marginBottom: 4 }}
            >
              자료를 가져오지 못했어요
            </div>
            <p
              className="whitespace-pre-line"
              style={{ fontSize: 13, color: "#7a4f1e", lineHeight: 1.55 }}
            >
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Resources — required */}
      <SectionCard
        icon={<LinkIcon className="w-4 h-4" strokeWidth={1.5} />}
        title="참고 자료"
        required
      >
        <div className="flex flex-col gap-3">
          <label style={{ color: "var(--ink)", fontWeight: 500 }}>
            URL 링크
          </label>
          {urls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder="참고할 URL을 입력해 주세요"
                className="sage-input"
              />
              {urls.length > 1 && (
                <button
                  onClick={() => removeUrl(index)}
                  className="p-2 flex-shrink-0"
                  style={{ color: "var(--dusk)" }}
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addUrlInput}
            className="flex items-center gap-1 self-start"
            style={{ fontSize: 13, color: "var(--forest)", fontWeight: 500 }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} /> 링크 추가
          </button>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <label style={{ color: "var(--ink)", fontWeight: 500 }}>
            파일 업로드
          </label>
          <div
            onClick={handleFileUpload}
            className="flex flex-col items-center justify-center cursor-pointer"
            style={{
              border: "1px dashed var(--border-deep)",
              borderRadius: "var(--r-md)",
              padding: 24,
              transition: "background var(--dur-base) var(--ease)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--leaf)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div
              className="sage-icon-tile mb-2"
              style={{ width: 40, height: 40 }}
            >
              <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <span
              style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}
            >
              PDF, DOCX 파일을 올려 주세요
            </span>
            <span
              style={{ fontSize: 12, color: "var(--dusk)", marginTop: 4 }}
            >
              클릭하거나 끌어다 놓을 수 있어요
            </span>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {uploadedFiles.map((file, i) => (
                <div
                  key={i}
                  className="sage-tag sage-tag--neutral"
                  style={{ gap: 6 }}
                >
                  <FileText className="w-3 h-3" strokeWidth={1.5} />
                  {file}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFiles((prev) =>
                        prev.filter((_, idx) => idx !== i),
                      );
                    }}
                    style={{ color: "var(--dusk)" }}
                  >
                    <X className="w-3 h-3" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Keywords — optional */}
      <SectionCard
        icon={<Tag className="w-4 h-4" strokeWidth={1.5} />}
        title="주제 · 키워드"
      >
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="예: SaaS 마케팅, B2B, 성장 전략"
          className="sage-input"
        />
        <p style={{ fontSize: 12, color: "var(--dusk)" }}>
          여러 키워드는 쉼표로 구분해 주세요
        </p>
      </SectionCard>

      {/* Target audience — optional */}
      <SectionCard
        icon={<Users className="w-4 h-4" strokeWidth={1.5} />}
        title="타겟 독자"
      >
        <div className="flex flex-wrap gap-2">
          {TARGET_AUDIENCE_OPTIONS.map((option) => {
            const active = selectedAudiences.includes(option.label);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleAudience(option.label)}
                className={`sage-tag ${active ? "sage-tag--active" : "sage-tag--neutral"}`}
                style={{ cursor: "pointer", padding: "7px 14px", fontSize: 13 }}
              >
                {option.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className={`sage-tag ${showCustomInput ? "sage-tag--active" : "sage-tag--neutral"}`}
            style={{ cursor: "pointer", padding: "7px 14px", fontSize: 13 }}
          >
            직접 입력
          </button>
        </div>

        {showCustomInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customAudience}
              onChange={(e) => setCustomAudience(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAudience();
                }
              }}
              placeholder="예: 스타트업 마케터, 30대 직장인"
              className="sage-input"
            />
            <button
              type="button"
              onClick={addCustomAudience}
              className="sage-btn sage-btn--secondary"
            >
              추가
            </button>
          </div>
        )}

        {selectedAudiences.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {selectedAudiences.map((audience) => (
              <span
                key={audience}
                className="sage-tag sage-tag--brand"
                style={{ gap: 6, padding: "6px 12px", fontSize: 13 }}
              >
                {audience}
                <button
                  type="button"
                  onClick={() => removeAudience(audience)}
                  style={{ display: "inline-flex" }}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </span>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Start — the single primary action */}
      <div className="pt-1">
        <button
          onClick={handleStartAnalysis}
          disabled={!hasResources}
          className="sage-btn sage-btn--primary sage-btn--lg w-full"
        >
          분석 시작
        </button>
        {!hasResources && (
          <p
            className="text-center"
            style={{ fontSize: 12, color: "var(--dusk)", marginTop: 8 }}
          >
            링크나 파일을 하나 이상 넣으면 시작할 수 있어요
          </p>
        )}
      </div>
    </div>
  );
}
