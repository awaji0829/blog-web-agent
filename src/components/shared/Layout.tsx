import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--mist)", fontFamily: "var(--font-sans)" }}
    >
      <Sidebar />
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--mist)" }}
      >
        {children}
      </main>
    </div>
  );
}
