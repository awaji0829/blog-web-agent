import { Link as LinkIcon, Tag, FileText, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Resource {
  id: string;
  source_type: "url" | "file";
  source_url: string | null;
  file_name: string | null;
  file_path: string | null;
  title: string | null;
}

interface DraftResourcesPanelProps {
  resources?: Resource[];
  keywords?: string[] | null;
}

export function DraftResourcesPanel({
  resources,
  keywords,
}: DraftResourcesPanelProps) {
  const hasResources = resources && resources.length > 0;
  const hasKeywords = keywords && keywords.length > 0;

  const getResourceUrl = (resource: Resource): string | null => {
    if (resource.source_type === "url") return resource.source_url;
    if (resource.source_type === "file" && resource.file_path) {
      const { data } = supabase.storage
        .from("resources")
        .getPublicUrl(resource.file_path);
      return data.publicUrl;
    }
    return null;
  };

  const handleResourceClick = (resource: Resource) => {
    const url = getResourceUrl(resource);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const Head = () => (
    <div className="flex items-center gap-2 mb-4">
      <FileText
        className="w-4 h-4"
        style={{ color: "var(--forest)" }}
        strokeWidth={1.5}
      />
      <h3 className="sage-eyebrow">참고 자료 · 키워드</h3>
    </div>
  );

  if (!hasResources && !hasKeywords) {
    return (
      <div className="sage-card">
        <Head />
        <p
          className="text-center"
          style={{ fontSize: 13, color: "var(--dusk)", padding: "16px 0" }}
        >
          아직 자료 정보가 없어요
        </p>
      </div>
    );
  }

  return (
    <div className="sage-card">
      <Head />
      <div className="space-y-4">
        {hasResources && (
          <div className="space-y-2">
            <div
              className="flex items-center gap-1.5 mb-2"
              style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-soft)" }}
            >
              <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
              사용된 자료
            </div>
            <div className="space-y-1.5">
              {resources.map((r) => {
                const hasLink = getResourceUrl(r) !== null;
                return (
                  <div
                    key={r.id}
                    onClick={() => hasLink && handleResourceClick(r)}
                    className="flex items-center justify-between gap-2"
                    style={{
                      fontSize: 14,
                      color: "var(--ink)",
                      background: "var(--mist)",
                      padding: "8px 12px",
                      borderRadius: "var(--r-md)",
                      border: "1px solid var(--border-sage)",
                      cursor: hasLink ? "pointer" : undefined,
                      transition: "border-color var(--dur-base) var(--ease)",
                    }}
                    onMouseEnter={(e) => {
                      if (hasLink)
                        e.currentTarget.style.borderColor =
                          "var(--border-deep)";
                    }}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor =
                        "var(--border-sage)")
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {r.source_type === "url" ? (
                        <LinkIcon
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--dusk)" }}
                          strokeWidth={1.5}
                        />
                      ) : (
                        <FileText
                          className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: "var(--dusk)" }}
                          strokeWidth={1.5}
                        />
                      )}
                      <span className="truncate">
                        {r.source_type === "url"
                          ? r.title || r.source_url || "URL"
                          : r.file_name || "파일"}
                      </span>
                    </div>
                    {hasLink && (
                      <ExternalLink
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "var(--dusk)" }}
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {hasKeywords && (
          <div
            className="space-y-2 pt-3"
            style={{ borderTop: "1px solid var(--border-sage)" }}
          >
            <div
              className="flex items-center gap-1.5 mb-2"
              style={{ fontSize: 12, fontWeight: 500, color: "var(--ink-soft)" }}
            >
              <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
              핵심 키워드
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, i) => (
                <span key={i} className="sage-tag sage-tag--brand">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
