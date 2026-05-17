import React from "react";
import { Check } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
}

const steps = [
  "리소스 투입",
  "분석 중",
  "인사이트 선택",
  "리서치 중",
  "개요 검토",
  "최종 초안",
];

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div
      className="w-full mb-8"
      style={{
        padding: "20px 0",
        borderBottom: "1px solid var(--border-sage)",
        background: "var(--page)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px]">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={index} className="flex items-center">
                <div
                  className="flex items-center gap-2 whitespace-nowrap"
                  style={{
                    padding: "6px 12px",
                    borderRadius: "var(--r-pill)",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    transition: "background var(--dur-base) var(--ease)",
                    background: isActive ? "var(--leaf)" : "transparent",
                    color: isActive
                      ? "var(--forest)"
                      : isCompleted
                        ? "var(--ink-soft)"
                        : "var(--dusk)",
                  }}
                >
                  <span
                    className="flex items-center justify-center"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      fontSize: 12,
                      fontFamily: "var(--font-mono)",
                      background: isActive
                        ? "var(--sage)"
                        : isCompleted
                          ? "var(--sage-soft)"
                          : "var(--mist)",
                      color: isActive
                        ? "var(--on-sage)"
                        : isCompleted
                          ? "var(--forest)"
                          : "var(--dusk)",
                    }}
                  >
                    {isCompleted ? (
                      <Check className="w-3 h-3" strokeWidth={1.5} />
                    ) : (
                      stepNum
                    )}
                  </span>
                  <span>{step}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="mx-2"
                    style={{ color: "var(--border-deep)" }}
                  >
                    ·
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
