import {
  LayoutDashboard,
  FileText,
  Newspaper,
  SlidersHorizontal,
  Plus,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: "대시보드", path: "/dashboard" },
    { icon: FileText, label: "글", path: "/saved" },
    { icon: Newspaper, label: "뉴스 검색", path: "/news" },
    { icon: SlidersHorizontal, label: "프롬프트", path: "/prompts" },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return currentPath === "/dashboard";
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("로그아웃 중 문제가 생겼어요:", err);
    }
  };

  const displayName = user?.email?.split("@")[0] ?? "사용자";
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <aside
      className="flex flex-col h-screen flex-shrink-0 w-[72px] md:w-[232px] transition-all duration-300"
      style={{
        background: "var(--page)",
        borderRight: "1px solid var(--border-sage)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-center md:justify-start px-4 md:px-[22px] pt-[22px] pb-4">
        <img
          src="/image/logo-sph.png"
          alt="SPH"
          className="hidden md:block h-7 w-auto"
        />
        <img
          src="/image/logo-mark.svg"
          alt="SPH"
          className="md:hidden h-7 w-7"
        />
      </div>

      {/* Primary action — exactly one per screen */}
      <div className="px-3 pb-3">
        <button
          onClick={() => navigate("/")}
          className="sage-btn sage-btn--primary w-full"
          title="새 글 작성"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden md:inline">새 글 작성</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-2.5 py-2">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex items-center justify-center md:justify-start gap-3 px-3 py-2.5 rounded-[10px]",
                "text-sm transition-colors duration-200",
              )}
              style={{
                color: active ? "var(--forest)" : "var(--ink-soft)",
                background: active ? "var(--leaf)" : "transparent",
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--mist)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.5} />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User block */}
      <div
        className="px-2.5 pt-2.5 pb-5"
        style={{ borderTop: "1px solid var(--border-sage)" }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
            style={{
              background: "var(--leaf)",
              color: "var(--forest)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {initial}
          </div>
          <div className="hidden md:flex flex-col min-w-0">
            <span
              className="truncate"
              style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}
              title={user?.email ?? ""}
            >
              {displayName}
            </span>
            <span style={{ fontSize: 11, color: "var(--dusk)" }}>내 계정</span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="sage-btn sage-btn--ghost w-full justify-center md:justify-start mt-1"
          title="로그아웃"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="hidden md:inline">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
