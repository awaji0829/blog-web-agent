import React from "react";
import {
  Home,
  Sparkles,
  PenTool,
  Gift,
  Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: "홈" },
    // { icon: Sparkles, label: '운세' },
    // { icon: PenTool, label: '도구' },
    // { icon: Gift, label: '혜택' },
    { icon: Bookmark, label: "저장됨" },
  ];

  return (
    <aside className="w-[80px] md:w-[240px] flex flex-col h-screen bg-[#FFF9F2] border-r border-[#F0E6D8] items-center md:items-stretch py-6 transition-all duration-300">
      <div className="mb-8 px-4 flex justify-center md:justify-start">
        {/* Logo placeholder or Wrtn style icon - Prompt says Logo is in Header of Main section, but Sidebar usually has one too. 
             The screenshot shows the logo '뤼튼' at the top left of the sidebar area? No, the screenshot shows it in the content area. 
             Wait, the screenshot shows a collapsed sidebar on the left with just icons. 
             I will follow the screenshot style: Narrow sidebar with icons. 
             The user prompt says "Header: Left 'BlogFlow' Logo". This implies the logo is in the main content header, not sidebar.
             I'll stick to a narrow sidebar style like the screenshot.
         */}
        <div className="w-8 h-8 bg-orange-500/20 rounded-lg md:hidden" />
      </div>

      <nav className="flex-1 flex flex-col gap-6 w-full">
        {menuItems.map((item, index) => (
          <button
            key={item.label}
            className={cn(
              "flex flex-col md:flex-row items-center md:px-6 gap-2 md:gap-4 text-gray-500 hover:text-black transition-colors group",
              index === 0 && "text-black", // Active state mock
            )}
          >
            <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] md:text-sm font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </aside>
  );
}