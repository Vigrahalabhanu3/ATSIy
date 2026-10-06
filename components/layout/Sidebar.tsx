"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileSearch,
  BarChart3,
  Folder,
  PieChart,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";

export function ATSlyLogoIcon({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-[#4F46E5]", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" />
      <path
        d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analyze Resume", href: "/analyze", icon: FileSearch },
  { label: "My Analyses", href: "/analyses", icon: BarChart3 },
  { label: "Resume Library", href: "/library", icon: Folder },
  { label: "Reports", href: "/reports", icon: PieChart },
  { label: "Pricing & Plans", href: "/pricing", icon: Zap },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    if (href === "/reports" && pathname.startsWith("/results")) return true;
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("atsly_user");
        window.location.href = "/login";
      }
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen w-[240px] bg-[#F4F5FD] dark:bg-[#121528] border-r border-[#E9EBF7] dark:border-[#1E223D] flex flex-col z-30 select-none transition-colors",
        className
      )}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5 px-6 h-[72px] shrink-0">
        <ATSlyLogoIcon size={24} className="text-[#453DE0] dark:text-[#6366F1]" />
        <span className="text-[#15173A] dark:text-white font-extrabold text-[19px] tracking-tight">
          ATSly
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3.5 py-3 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-1.5" role="list">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150",
                    active
                      ? "bg-[#453DE0] text-white font-semibold shadow-xs"
                      : "text-[#50566F] dark:text-[#94A3B8] hover:text-[#15173A] dark:hover:text-white hover:bg-[#EAEBF8] dark:hover:bg-[#1E223D]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon
                    size={17}
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      active
                        ? "text-white"
                        : "text-[#6B728E] dark:text-[#64748B] group-hover:text-[#15173A] dark:group-hover:text-white"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Logout */}
      <div className="p-3 border-t border-[#E9EBF7] dark:border-[#1E223D]">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium text-[#50566F] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#FEE2E2]/60 dark:hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}


