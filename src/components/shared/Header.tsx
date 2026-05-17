import React, { ReactNode } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
}

/** Sage TopBar — title + subtitle on the left, actions on the right. */
export function Header({ title, subtitle, right }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between w-full gap-6"
      style={{
        padding: "22px 36px 18px",
        borderBottom: "1px solid var(--border-sage)",
        background: "var(--page)",
      }}
    >
      <div className="min-w-0">
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            lineHeight: 1.25,
          }}
        >
          {title ?? "SPH"}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: "var(--dusk)", marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}
