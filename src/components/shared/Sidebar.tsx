import {
  Home,
  Bookmark,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
}

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems: MenuItem[] = [
    { icon: Home, label: "홈", path: "/" },
    { icon: Bookmark, label: "저장됨", path: "/saved" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <aside className="w-[80px] md:w-[240px] flex flex-col h-screen bg-[#FFF9F2] border-r border-[#F0E6D8] items-center md:items-stretch py-6 transition-all duration-300">
      <div className="mb-8 px-4 flex justify-center md:justify-start">
        <div className="w-8 h-8 bg-orange-500/20 rounded-lg md:hidden" />
      </div>

      <nav className="flex-1 flex flex-col gap-6 w-full">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex flex-col md:flex-row items-center md:px-6 gap-2 md:gap-4 text-gray-500 hover:text-black transition-colors group",
              isActive(item.path) && "text-black",
            )}
          >
            <item.icon className={cn(
              "w-6 h-6 group-hover:scale-110 transition-transform",
              isActive(item.path) && "text-blue-600"
            )} />
            <span className="text-[10px] md:text-sm font-medium">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}