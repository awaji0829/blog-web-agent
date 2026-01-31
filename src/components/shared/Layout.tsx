import React, { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50/50">{children}</main>
    </div>
  );
}
