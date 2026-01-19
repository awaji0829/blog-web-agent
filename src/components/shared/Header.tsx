import React from "react";
import { User } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between w-full h-16 px-8 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-2">
        {/* Logo Text */}
        <span className="text-xl font-bold tracking-tight text-gray-900">
          SPH BLOG AGENT✍️
        </span>
      </div>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors">
        <User className="w-5 h-5 text-gray-600" />
      </div>
    </header>
  );
}
