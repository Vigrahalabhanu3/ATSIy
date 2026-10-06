"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BellIcon, UserIcon } from "@/components/icons/Icons";
import { Sun, Moon } from "lucide-react";
import { getStoredTheme, applyTheme, isDarkModeActive } from "@/lib/theme";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>("Candidate");
  const [credits, setCredits] = useState<{ balance: number; isUnlimited: boolean; plan: string } | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("atsly_user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.name) setUserName(u.name);
      }
    } catch {}

    fetch("/api/credits")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data || data?.balance !== undefined) {
          const c = data.data || data;
          setCredits({
            balance: c.balance,
            isUnlimited: c.isUnlimited,
            plan: c.plan,
          });
        }
      })
      .catch(() => {});

    setIsDark(isDarkModeActive());

    const onThemeChange = (e: any) => {
      setIsDark(e.detail?.isDark ?? isDarkModeActive());
    };
    window.addEventListener("atsly-theme-change", onThemeChange);
    return () => window.removeEventListener("atsly-theme-change", onThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextMode = isDark ? "light" : "dark";
    applyTheme(nextMode);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      if (typeof window !== "undefined") {
        localStorage.removeItem("atsly_user");
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  return (
    <header className="h-[64px] bg-white dark:bg-[#121528] border-b border-[#F0F1FA] dark:border-[#1E223D] flex items-center justify-between px-8 shrink-0 sticky top-0 z-20 transition-colors duration-200">
      <h1 className="text-[#171A2E] dark:text-[#F1F5F9] font-bold text-[16px] tracking-tight">
        {title}
      </h1>
      <div className="flex items-center gap-3 relative">
        {credits && (
          <Link
            href="/pricing"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#4F46E5] dark:text-[#A5B4FC] hover:bg-[#E0E7FF] dark:hover:bg-[#282566] transition-colors border border-[#C7D2FE] dark:border-[#3730A3]"
          >
            <span className="text-[#F59E0B]">⚡</span>
            <span>
              {credits.isUnlimited ? "Unlimited" : `${credits.balance} Credits`}
            </span>
          </Link>
        )}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#585E75] dark:text-[#94A3B8] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F4F5FD] dark:hover:bg-[#1C2038] transition-colors cursor-pointer"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#585E75] dark:text-[#94A3B8] hover:text-[#171A2E] dark:hover:text-white hover:bg-[#F4F5FD] dark:hover:bg-[#1C2038] transition-colors cursor-pointer"
        >
          <BellIcon size={19} />
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="User profile"
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-full bg-[#4338CA] flex items-center justify-center text-white hover:bg-[#3730A3] transition-colors shadow-xs cursor-pointer"
          >
            <UserIcon size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#171A30] rounded-2xl shadow-xl border border-[#ECEFF8] dark:border-[#262B4D] py-2 z-30 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                <p className="text-[13px] font-bold text-[#111827] dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                  {credits?.isUnlimited
                    ? "Admin (Unlimited)"
                    : `${credits?.plan || "FREE"} Plan • ${credits?.balance ?? 2} left`}
                </p>
              </div>

              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-[12.5px] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F8F7FF] dark:hover:bg-[#202544] hover:text-[#4338CA] dark:hover:text-[#A5B4FC] font-medium"
              >
                Account Settings
              </Link>
              <Link
                href="/library"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-[12.5px] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F8F7FF] dark:hover:bg-[#202544] hover:text-[#4338CA] dark:hover:text-[#A5B4FC] font-medium"
              >
                Resume Library
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-[12.5px] text-[#374151] dark:text-[#CBD5E1] hover:bg-[#F8F7FF] dark:hover:bg-[#202544] hover:text-[#4338CA] dark:hover:text-[#A5B4FC] font-medium"
              >
                Subscription Plans
              </Link>

              <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-[12.5px] text-[#DC2626] dark:text-[#F87171] hover:bg-[#FEE2E2]/60 dark:hover:bg-[#EF4444]/15 font-semibold transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
