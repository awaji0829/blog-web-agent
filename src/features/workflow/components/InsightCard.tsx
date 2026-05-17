import React from "react";
import { Check, Target, Hash } from "lucide-react";

export interface InsightData {
  id: string;
  title: string;
  summary: string;
  targetAudience: string;
  keywords: string[];
}

interface InsightCardProps {
  data: InsightData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function InsightCard({ data, isSelected, onSelect }: InsightCardProps) {
  return (
    <div
      onClick={() => onSelect(data.id)}
      className="relative flex flex-col text-left cursor-pointer"
      style={{
        background: "var(--page)",
        border: `1px solid ${isSelected ? "var(--sage)" : "var(--border-sage)"}`,
        borderRadius: "var(--r-lg)",
        padding: 20,
        transition: "border-color var(--dur-base) var(--ease)",
        boxShadow: isSelected ? "var(--focus-ring)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isSelected)
          e.currentTarget.style.borderColor = "var(--border-deep)";
      }}
      onMouseLeave={(e) => {
        if (!isSelected)
          e.currentTarget.style.borderColor = "var(--border-sage)";
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 style={{ color: "var(--ink)", marginBottom: 8 }}>
            {data.title}
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--ink-soft)",
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            {data.summary}
          </p>
          <div
            className="flex items-center gap-4 flex-wrap"
            style={{ fontSize: 12, color: "var(--dusk)" }}
          >
            {data.targetAudience && (
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>{data.targetAudience}</span>
              </div>
            )}
            {data.keywords.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <Hash className="w-3.5 h-3.5" strokeWidth={1.5} />
                {data.keywords.map((keyword, i) => (
                  <span key={i}>
                    {keyword}
                    {i < data.keywords.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <span
            className={`sage-tag ${isSelected ? "sage-tag--active" : "sage-tag--neutral"}`}
            style={{ padding: "7px 14px", fontSize: 13 }}
          >
            {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={1.5} />}
            {isSelected ? "선택됨" : "선택"}
          </span>
        </div>
      </div>
    </div>
  );
}
