import { Home, Bookmark, Settings, Newspaper, User } from "lucide-react";
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
    { icon: Newspaper, label: "뉴스 검색", path: "/news" },
    { icon: Settings, label: "프롬프트", path: "/prompts" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <aside className="w-[80px] md:w-[240px] flex flex-col h-screen bg-[#FFF9F2] border-r border-[#F0E6D8] items-center md:items-stretch py-6 transition-all duration-300">
      {/* Logo */}
      <div className="mb-8 px-4 flex justify-center md:justify-start">
        <span className="hidden md:block text-xl font-bold tracking-tight text-gray-900">
          SPH BLOG AGENT✍️
        </span>
        <div className="w-8 h-8 bg-orange-500/20 rounded-lg md:hidden flex items-center justify-center">
          <span className="text-lg">✍️</span>
        </div>
      </div>

      {/* Navigation Menu */}
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
            <item.icon
              className={cn(
                "w-6 h-6 group-hover:scale-110 transition-transform",
                isActive(item.path) && "text-blue-600",
              )}
            />
            <span className="text-[10px] md:text-sm font-medium">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Profile Icon */}
      <div className="px-4 pt-4 border-t border-[#F0E6D8]">
        <button className="w-full flex items-center justify-center md:justify-start gap-3 p-2 rounded-lg hover:bg-orange-500/10 transition-colors group">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700">
            프로필
          </span>
        </button>
      </div>
    </aside>
  );
}
