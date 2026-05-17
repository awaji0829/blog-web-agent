import {
  ExternalLink,
  Calendar,
  Newspaper,
  BookOpen,
  FileBarChart,
  GraduationCap,
  Globe,
  MessageCircle,
} from "lucide-react";
import type { ResearchSource, SourceCategory } from "@/features/workflow/types";

interface DraftSourcesPanelProps {
  sources?: ResearchSource[];
}

const CATEGORY_CONFIG: Record<
  SourceCategory,
  { label: string; variant: string; icon: typeof Newspaper }
> = {
  news: { label: "뉴스", variant: "sage-tag--brand", icon: Newspaper },
  blog: { label: "블로그", variant: "sage-tag--brand", icon: BookOpen },
  report: { label: "보고서", variant: "sage-tag--neutral", icon: FileBarChart },
  paper: { label: "논문", variant: "sage-tag--neutral", icon: GraduationCap },
  official: { label: "공식", variant: "sage-tag--warm", icon: Globe },
  sns: { label: "SNS", variant: "sage-tag--warm", icon: MessageCircle },
};

function formatDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export function DraftSourcesPanel({ sources }: DraftSourcesPanelProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="sage-card">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen
          className="w-4 h-4"
          style={{ color: "var(--forest)" }}
          strokeWidth={1.5}
        />
        <h3 className="sage-eyebrow">참고 출처</h3>
        <span
          className="ml-auto"
          style={{ fontSize: 12, color: "var(--dusk)" }}
        >
          {sources.length}개
        </span>
      </div>

      <div className="space-y-2">
        {sources.map((source, i) => {
          const category = source.source_category || "news";
          const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.news;
          const IconComponent = config.icon;
          const displayDate = formatDate(source.published_date);
          const displayTitle = source.title || source.url || "출처 없음";

          return (
            <div
              key={i}
              onClick={() =>
                source.url &&
                window.open(source.url, "_blank", "noopener,noreferrer")
              }
              className="group"
              style={{
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                background: "var(--mist)",
                border: "1px solid var(--border-sage)",
                cursor: source.url ? "pointer" : undefined,
                transition: "border-color var(--dur-base) var(--ease)",
              }}
              onMouseEnter={(e) => {
                if (source.url)
                  e.currentTarget.style.borderColor = "var(--border-deep)";
              }}
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border-sage)")
              }
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`sage-tag ${config.variant} shrink-0`}
                  style={{ fontSize: 11 }}
                >
                  <IconComponent className="w-3 h-3" strokeWidth={1.5} />
                  {config.label}
                </span>

                <div className="flex-1 min-w-0">
                  <p
                    className="truncate"
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--ink)",
                      lineHeight: 1.3,
                    }}
                  >
                    {displayTitle}
                  </p>
                  {displayDate && (
                    <p
                      className="flex items-center gap-1 mt-1"
                      style={{ fontSize: 12, color: "var(--dusk)" }}
                    >
                      <Calendar className="w-3 h-3" strokeWidth={1.5} />
                      {displayDate}
                    </p>
                  )}
                </div>

                {source.url && (
                  <ExternalLink
                    className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: "var(--dusk)" }}
                    strokeWidth={1.5}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
