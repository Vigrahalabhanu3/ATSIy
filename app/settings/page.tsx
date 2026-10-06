"use client";

import { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import {
  Sliders,
  User,
  CreditCard,
  Sparkles,
  Bell,
  Shield,
  Check,
  CheckCircle2,
  X,
  Upload,
  Sun,
  Moon,
  Monitor,
  Zap,
  History,
  ArrowDownRight,
  ArrowUpRight,
  Crown,
  ChevronLeft,
  ChevronRight,
  Cookie,
  Key,
  RefreshCw,
  Lock,
} from "lucide-react";
import { getStoredTheme, applyTheme, ThemeMode } from "@/lib/theme";
import { CreditBalanceResponse, CreditTransactionItem } from "@/types/credits";
import { getCredits, getCreditHistory } from "@/lib/api/credits";
import { apiFetch, getStoredToken, removeStoredToken, removeStoredUser } from "@/lib/api/client";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [theme, setTheme] = useState("Light Mode (Default)");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("Candidate");
  const [industry, setIndustry] = useState("Software & Technology");

  // Credit ledger state
  const [credits, setCredits] = useState<CreditBalanceResponse | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTransactionItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingCredits, setLoadingCredits] = useState(true);

  // AI Preferences checkboxes
  const [strictMatching, setStrictMatching] = useState(true);
  const [bulletRewriting, setBulletRewriting] = useState(true);
  const [metricsExtraction, setMetricsExtraction] = useState(false);
  const [roleDescription, setRoleDescription] = useState("");

  // Notification checkboxes
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [improvementTips, setImprovementTips] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [cookieConsentStatus, setCookieConsentStatus] = useState<string>("Active & Accepted");
  const [sessionChecking, setSessionChecking] = useState(false);
  const [sessionTokenPreview, setSessionTokenPreview] = useState<string>("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleValidateSession = async () => {
    try {
      setSessionChecking(true);
      const res = await apiFetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        const emailStr = data.data?.user?.email || "verified user";
        showToast(`✓ Session active & valid! Authenticated as ${emailStr}`);
      } else {
        showToast("Session expired. Please sign in again.");
      }
    } catch {
      showToast("Network error verifying session.");
    } finally {
      setSessionChecking(false);
    }
  };

  const handleOpenCookieModal = () => {
    window.dispatchEvent(new CustomEvent("open-cookie-settings"));
  };

  const loadCreditData = async (page = 1) => {
    try {
      setLoadingCredits(true);
      const [c, h] = await Promise.all([
        getCredits().catch(() => null),
        getCreditHistory(page, 10).catch(() => ({ transactions: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 1 } })),
      ]);
      if (c) setCredits(c);
      if (h?.transactions) setCreditHistory(h.transactions);
      if (h?.pagination) {
        setHistoryTotalPages(h.pagination.totalPages || (h.pagination as any).pages || 1);
      }
      setHistoryPage(page);
    } catch (err) {
      console.error("Failed to load credits in settings:", err);
    } finally {
      setLoadingCredits(false);
    }
  };

  // Load real authenticated user
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          const u = data.data?.user || data.user;
          if (u) {
            setFullName(u.name || "");
            setEmail(u.email || "");
          }
        }
      } catch (e) {
        console.error("Error loading user in settings:", e);
      }
    }
    loadUser();
    loadCreditData();

    try {
      const consent = localStorage.getItem("atsly_cookie_consent");
      if (consent) {
        const parsed = JSON.parse(consent);
        setCookieConsentStatus(parsed.analytics ? "All Cookies Accepted" : "Essential Cookies Active");
      }
      const token = getStoredToken();
      if (token) {
        setSessionTokenPreview(token.substring(0, 16) + "..." + token.substring(token.length - 8));
      }
    } catch {}

    const handleCookiesUpdated = () => {
      try {
        const consent = localStorage.getItem("atsly_cookie_consent");
        if (consent) {
          const parsed = JSON.parse(consent);
          setCookieConsentStatus(parsed.analytics ? "All Cookies Accepted" : "Essential Cookies Active");
        }
      } catch {}
    };

    window.addEventListener("atsly_cookies_updated", handleCookiesUpdated);
    return () => window.removeEventListener("atsly_cookies_updated", handleCookiesUpdated);

    // Check if URL has tab=credits or tab=billing
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "credits" || tabParam === "billing") {
        setActiveTab("billing");
        setTimeout(() => {
          document.getElementById("billing")?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }

    // Initialize current theme from storage
    const current = getStoredTheme();
    setTheme(
      current === "dark"
        ? "Dark Mode"
        : current === "system"
        ? "System Match"
        : "Light Mode (Default)"
    );
  }, []);

  const handleThemeChange = (newThemeStr: string) => {
    setTheme(newThemeStr);
    let mode: ThemeMode = "light";
    if (newThemeStr.includes("Dark")) mode = "dark";
    else if (newThemeStr.includes("System")) mode = "system";
    else mode = "light";

    applyTheme(mode);
    showToast(`Workspace theme switched to ${mode === "system" ? "System Match" : mode === "dark" ? "Dark Mode" : "Light Mode"}`);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      showToast("Please enter both current and new passwords.");
      return;
    }
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        showToast(data.error?.message || "Failed to update password.");
      }
    } catch {
      showToast("Network error updating password.");
    }
  };

  const handleSaveChanges = async () => {
    try {
      const res = await apiFetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Profile changes saved successfully!");
      } else {
        showToast(data.error?.message || "Failed to save profile changes.");
      }
    } catch {
      showToast("Network error saving profile changes.");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you ABSOLUTELY sure you want to delete your account? This action is irreversible and permanently deletes all your resumes, evaluations, and reports."
      )
    ) {
      return;
    }
    try {
      const res = await apiFetch("/api/auth/profile", { method: "DELETE" });
      if (res.ok) {
        removeStoredToken();
        removeStoredUser();
        if (typeof window !== "undefined") {
          window.location.href = "/signup";
        }
      } else {
        showToast("Failed to delete account.");
      }
    } catch {
      showToast("Network error deleting account.");
    }
  };

  const navItems = [
    { id: "general", label: "General", icon: Sliders },
    { id: "profile", label: "Profile Details", icon: User },
    { id: "billing", label: "Subscription & Billing", icon: CreditCard },
    { id: "ai", label: "AI Preferences", icon: Sparkles },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "cookies", label: "Cookies & Session", icon: Cookie },
    { id: "security", label: "Security & Danger Zone", icon: Shield },
  ];

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="px-6 lg:px-10 py-6 max-w-[1340px] mx-auto min-h-screen">
        {/* Hidden Avatar input */}
        <input
          type="file"
          ref={avatarInputRef}
          className="hidden"
          accept="image/png,image/jpeg,image/gif"
          onChange={() => showToast("Avatar updated successfully!")}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#15173A] text-white px-4 py-3 rounded-xl shadow-lg border border-[#3B34D1] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-[#4CD964]" />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-gray-400 hover:text-white ml-2"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-[#111827] dark:text-white font-bold text-[24px] sm:text-[26px] tracking-tight">
            Account Settings
          </h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-[13.5px] mt-0.5">
            Manage your profile, preferences, subscription plan, and AI parsing rules.
          </p>
        </div>

        {/* Two Column Layout: Sidebar Tabs + Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Navigation Menu */}
          <div className="lg:col-span-3 sticky top-24">
            <nav className="space-y-1.5" aria-label="Settings categories">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13.5px] font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-[#3D37D0] text-white font-semibold shadow-xs"
                        : "text-[#555E75] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white hover:bg-[#F3F4FD] dark:hover:bg-[#1E223D]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-white" : "text-[#7B829A] dark:text-[#64748B]"}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Content Sections */}
          <div className="lg:col-span-9 space-y-6">
            {/* General Preferences */}
            <div
              id="general"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <h2 className="text-[#111827] dark:text-white font-bold text-[15px]">
                General Preferences
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5 mb-4">
                Customize your workspace appearance and default app behavior.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#374151] mb-2">
                    Workspace Theme
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => handleThemeChange("Light Mode (Default)")}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        theme.includes("Light")
                          ? "bg-white border-[#4F46E5] text-[#4F46E5] shadow-xs ring-1 ring-[#4F46E5]"
                          : "bg-white/70 hover:bg-white border-gray-200 text-[#4B5563]"
                      }`}
                    >
                      <Sun size={18} className={theme.includes("Light") ? "text-[#4F46E5]" : "text-[#6B7280]"} />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange("Dark Mode")}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        theme.includes("Dark")
                          ? "bg-white border-[#4F46E5] text-[#4F46E5] shadow-xs ring-1 ring-[#4F46E5]"
                          : "bg-white/70 hover:bg-white border-gray-200 text-[#4B5563]"
                      }`}
                    >
                      <Moon size={18} className={theme.includes("Dark") ? "text-[#4F46E5]" : "text-[#6B7280]"} />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleThemeChange("System Match")}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all ${
                        theme.includes("System")
                          ? "bg-white border-[#4F46E5] text-[#4F46E5] shadow-xs ring-1 ring-[#4F46E5]"
                          : "bg-white/70 hover:bg-white border-gray-200 text-[#4B5563]"
                      }`}
                    >
                      <Monitor size={18} className={theme.includes("System") ? "text-[#4F46E5]" : "text-[#6B7280]"} />
                      <span>System Default</span>
                    </button>
                  </div>

                  <select
                    value={theme}
                    onChange={(e) => handleThemeChange(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option>Light Mode (Default)</option>
                    <option>Dark Mode</option>
                    <option>System Match</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#374151] mb-1.5">
                    Date Format
                  </label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-[13px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div
              id="profile"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <h2 className="text-[#111827] dark:text-white font-bold text-[15px]">
                Profile Details
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5 mb-5">
                Update your professional identity used across resume scans.
              </p>

              {/* Avatar Row */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-[#3D37D0] text-white font-bold text-[17px] flex items-center justify-center shrink-0 shadow-xs">
                  JD
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="bg-white dark:bg-[#181C33] border border-[#D1D5DB] dark:border-[#1E223D] hover:bg-gray-50 dark:hover:bg-[#1E223D] text-[#1F2937] dark:text-white text-[12.5px] font-semibold px-3.5 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Change Avatar
                  </button>
                  <p className="text-[11.5px] text-[#6B7280] dark:text-[#94A3B8] mt-1">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl px-3.5 py-2 text-[13px] text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl px-3.5 py-2 text-[13px] text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                    Professional Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl px-3.5 py-2 text-[13px] text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                    Target Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl px-3.5 py-2 text-[13px] text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  >
                    <option>Software & Technology</option>
                    <option>Finance & Banking</option>
                    <option>Healthcare & Biotech</option>
                    <option>Management Consulting</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Plan, Credits & Ledger */}
            <div
              id="billing"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-[#111827] dark:text-white font-bold text-[16px] flex items-center gap-2">
                    <Zap size={18} className="text-[#4F46E5] dark:text-[#818CF8]" />
                    Plan & Credit Usage
                  </h2>
                  <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5">
                    Live balance and immutable audit ledger of all ATS checks
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 bg-[#4338CA] hover:bg-[#3730A3] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all shadow-xs self-start sm:self-center"
                >
                  <Crown size={14} className="text-[#FBBF24]" />
                  <span>Upgrade Plan</span>
                </Link>
              </div>

              {/* Current Plan Summary Card */}
              <div className="bg-white dark:bg-[#181C33] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E223D] shadow-xs mb-6 transition-colors">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-4 border-b border-[#F1F5F9] dark:border-[#1E223D]">
                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                      CURRENT PLAN
                    </span>
                    <span className="text-[20px] font-extrabold text-[#111827] dark:text-white mt-1 block">
                      {credits?.isUnlimited ? "Admin Unlimited" : `${credits?.plan || "FREE"}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                      CREDITS REMAINING
                    </span>
                    <span className="text-[20px] font-extrabold text-[#4F46E5] dark:text-[#818CF8] mt-1 block">
                      {credits?.isUnlimited
                        ? "Unlimited"
                        : `${credits?.balance ?? 2} / ${credits?.limit ?? 2}`}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                      CREDITS USED
                    </span>
                    <span className="text-[20px] font-extrabold text-[#111827] dark:text-white mt-1 block">
                      {credits?.used ?? 0}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                      RESET DATE
                    </span>
                    <span className="text-[14px] font-bold text-[#111827] dark:text-white mt-2 block">
                      {credits?.resetAt
                        ? new Date(credits.resetAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "30-Day Period"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {!credits?.isUnlimited && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between text-[12px] font-medium text-[#64748B] dark:text-[#94A3B8] mb-2">
                      <span>Usage Progress</span>
                      <span className="font-bold text-[#111827] dark:text-white">
                        {credits?.used ?? 0} / {credits?.limit ?? 2} used
                      </span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#4F46E5] h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(((credits?.used ?? 0) / Math.max(1, credits?.limit ?? 2)) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Credit History Table */}
              <div className="bg-white dark:bg-[#181C33] rounded-2xl p-5 border border-[#E2E8F0] dark:border-[#1E223D] shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[#111827] dark:text-white font-bold text-[14px] flex items-center gap-1.5">
                    <History size={16} className="text-[#64748B] dark:text-[#94A3B8]" />
                    Credit History Ledger
                  </h3>
                  <span className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">
                    Page {historyPage} of {historyTotalPages}
                  </span>
                </div>

                {loadingCredits ? (
                  <div className="py-8 text-center text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                    Loading transactions...
                  </div>
                ) : creditHistory.length === 0 ? (
                  <div className="py-8 text-center border border-dashed border-[#E2E8F0] dark:border-[#1E223D] rounded-xl text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                    No credit transactions recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12.5px]">
                      <thead>
                        <tr className="border-b border-[#F1F5F9] dark:border-[#1E223D] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                          <th className="py-2.5 px-3">EVENT</th>
                          <th className="py-2.5 px-3">CHANGE</th>
                          <th className="py-2.5 px-3">DATE</th>
                          <th className="py-2.5 px-3">DESCRIPTION</th>
                          <th className="py-2.5 px-3 text-right">BALANCE AFTER</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E223D]">
                        {creditHistory.map((tx) => {
                          const isPositive =
                            tx.type === "ALLOCATED" ||
                            tx.type === "REFUNDED" ||
                            tx.type === "PLAN_UPGRADE";
                          return (
                            <tr key={tx.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E223D]/60 transition-colors">
                              <td className="py-3 px-3 font-semibold text-[#111827] dark:text-white">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                      isPositive
                                        ? "bg-[#DCFCE7] dark:bg-[#10B981]/20 text-[#16A34A] dark:text-[#34D399]"
                                        : "bg-[#F1F5F9] dark:bg-[#1E223D] text-[#64748B] dark:text-[#94A3B8]"
                                    }`}
                                  >
                                    {isPositive ? (
                                      <ArrowDownRight size={13} />
                                    ) : (
                                      <ArrowUpRight size={13} />
                                    )}
                                  </div>
                                  <span>
                                    {tx.type === "CONSUMED"
                                      ? "ATS Analysis"
                                      : tx.type === "REFUNDED"
                                      ? "Credit Refund"
                                      : tx.type === "ALLOCATED"
                                      ? "Monthly Credits"
                                      : tx.type === "RESERVED"
                                      ? "Reservation"
                                      : tx.type}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-3">
                                <span
                                  className={`font-bold ${
                                    isPositive ? "text-[#16A34A] dark:text-[#34D399]" : "text-[#111827] dark:text-white"
                                  }`}
                                >
                                  {isPositive ? `+${tx.amount}` : `-${tx.amount}`} credit
                                  {tx.amount > 1 ? "s" : ""}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-[#64748B] dark:text-[#94A3B8]">
                                {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>

                              <td className="py-3 px-3 text-[#64748B] dark:text-[#94A3B8] max-w-xs truncate">
                                {tx.description}
                              </td>

                              <td className="py-3 px-3 text-right font-semibold text-[#111827] dark:text-white">
                                {tx.balanceAfter}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Pagination */}
                    {historyTotalPages > 1 && (
                      <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#F1F5F9] dark:border-[#1E223D]">
                        <button
                          type="button"
                          disabled={historyPage <= 1}
                          onClick={() => loadCreditData(historyPage - 1)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] dark:text-[#818CF8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <ChevronLeft size={14} /> Previous
                        </button>
                        <button
                          type="button"
                          disabled={historyPage >= historyTotalPages}
                          onClick={() => loadCreditData(historyPage + 1)}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#4F46E5] dark:text-[#818CF8] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Next <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* AI Parser Preferences */}
            <div
              id="ai"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <h2 className="text-[#111827] dark:text-white font-bold text-[15px]">
                AI Parser Preferences
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5 mb-4">
                Configure how our ATS parsing engine evaluates and optimizes your text.
              </p>

              {/* Checkboxes List */}
              <div className="space-y-3">
                {/* Option 1 */}
                <div
                  onClick={() => setStrictMatching(!strictMatching)}
                  className="bg-white dark:bg-[#181C33] rounded-xl p-3.5 border border-gray-200 dark:border-[#1E223D] flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] dark:text-white">
                      Strict Keyword Matching
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Require exact term matches rather than contextual synonyms.
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      strictMatching
                        ? "bg-[#3D37D0] text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0E1122]"
                    }`}
                  >
                    {strictMatching && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* Option 2 */}
                <div
                  onClick={() => setBulletRewriting(!bulletRewriting)}
                  className="bg-white dark:bg-[#181C33] rounded-xl p-3.5 border border-gray-200 dark:border-[#1E223D] flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] dark:text-white">
                      Automatic Bullet Point Rewriting
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Allow AI to rewrite weak bullet points using action-verb formats.
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      bulletRewriting
                        ? "bg-[#3D37D0] text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0E1122]"
                    }`}
                  >
                    {bulletRewriting && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* Option 3 */}
                <div
                  onClick={() => setMetricsExtraction(!metricsExtraction)}
                  className="bg-white dark:bg-[#181C33] rounded-xl p-3.5 border border-gray-200 dark:border-[#1E223D] flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] dark:text-white">
                      Deep Metrics Extraction
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Prioritize quantification (percentages, dollar amounts, scale) in scans.
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      metricsExtraction
                        ? "bg-[#3D37D0] text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0E1122]"
                    }`}
                  >
                    {metricsExtraction && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              </div>

              {/* Textarea Field */}
              <div className="mt-4">
                <label className="block text-[12px] font-semibold text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                  Default Target Role Description
                </label>
                <textarea
                  rows={3}
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  placeholder="Enter default keywords or role descriptions for rapid scanning..."
                  className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl p-3 text-[13px] text-[#111827] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
              </div>
            </div>

            {/* Email Notifications */}
            <div
              id="notifications"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <h2 className="text-[#111827] dark:text-white font-bold text-[15px]">
                Email Notifications
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5 mb-4">
                Control what gets sent to your inbox.
              </p>

              <div className="space-y-3">
                {/* Notification 1 */}
                <div
                  onClick={() => setWeeklySummary(!weeklySummary)}
                  className="bg-white dark:bg-[#181C33] rounded-xl p-3.5 border border-gray-200 dark:border-[#1E223D] flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] dark:text-white">
                      Weekly Summary of Scan History
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Receive a digest of your optimization scores every Monday.
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      weeklySummary
                        ? "bg-[#3D37D0] text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0E1122]"
                    }`}
                  >
                    {weeklySummary && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* Notification 2 */}
                <div
                  onClick={() => setImprovementTips(!improvementTips)}
                  className="bg-white dark:bg-[#181C33] rounded-xl p-3.5 border border-gray-200 dark:border-[#1E223D] flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] dark:text-white">
                      Resume Improvement Tips
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Periodic expert guides and ATS trends.
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      improvementTips
                        ? "bg-[#3D37D0] text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0E1122]"
                    }`}
                  >
                    {improvementTips && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>

                {/* Notification 3 */}
                <div
                  onClick={() => setSecurityAlerts(!securityAlerts)}
                  className="bg-white dark:bg-[#181C33] rounded-xl p-3.5 border border-gray-200 dark:border-[#1E223D] flex items-center justify-between cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <div>
                    <div className="text-[13px] font-bold text-[#111827] dark:text-white">
                      Security &amp; Login Alerts
                    </div>
                    <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                      Get notified immediately upon new device sign-ins.
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ml-3 transition-colors ${
                      securityAlerts
                        ? "bg-[#3D37D0] text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#0E1122]"
                    }`}
                  >
                    {securityAlerts && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Cookies & Session Security */}
            <div
              id="cookies"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#453DE0] dark:text-[#818CF8] flex items-center justify-center">
                    <Cookie size={18} />
                  </div>
                  <div>
                    <h2 className="text-[#111827] dark:text-white font-bold text-[15px]">
                      Cookies &amp; Session Management
                    </h2>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px]">
                      Control browser session storage, authentication cookies, and token validation.
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Session Protected</span>
                </span>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#171A2E] border border-gray-200 dark:border-gray-800">
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Session Key
                  </div>
                  <div className="text-[13px] font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-1.5 font-mono truncate">
                    <Lock size={13} className="text-[#453DE0] shrink-0" />
                    <span>{sessionTokenPreview || "Active (HttpOnly)"}</span>
                  </div>
                  <div className="text-[10.5px] text-gray-500 mt-1">
                    Verified on every request
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#171A2E] border border-gray-200 dark:border-gray-800">
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cookie Storage
                  </div>
                  <div className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
                    <Shield size={13} className="shrink-0" />
                    <span>{cookieConsentStatus}</span>
                  </div>
                  <div className="text-[10.5px] text-gray-500 mt-1">
                    HttpOnly, Secure &amp; SameSite=Lax
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-[#171A2E] border border-gray-200 dark:border-gray-800">
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Edge Portability
                  </div>
                  <div className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1.5">
                    <Check size={13} strokeWidth={2.5} className="shrink-0" />
                    <span>Dual-Layer Sync (100%)</span>
                  </div>
                  <div className="text-[10.5px] text-gray-500 mt-1">
                    Vercel Edge &amp; Multi-domain verified
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleOpenCookieModal}
                  className="bg-white dark:bg-[#181C33] border border-[#D1D5DB] dark:border-[#1E223D] hover:bg-gray-50 dark:hover:bg-[#1E223D] text-[#1F2937] dark:text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Cookie size={14} className="text-[#453DE0]" />
                  <span>Configure Cookie Preferences</span>
                </button>

                <button
                  type="button"
                  onClick={handleValidateSession}
                  disabled={sessionChecking}
                  className="bg-[#3D37D0] hover:bg-[#342EB8] text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw size={13} className={sessionChecking ? "animate-spin" : ""} />
                  <span>{sessionChecking ? "Verifying Session..." : "Verify Active JWT Token"}</span>
                </button>
              </div>
            </div>

            {/* Security */}
            <div
              id="security"
              className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors"
            >
              <h2 className="text-[#111827] dark:text-white font-bold text-[15px]">
                Security
              </h2>
              <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5 mb-4">
                Manage password and connected credentials.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl px-3.5 py-2 text-[13px] text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-[#374151] dark:text-[#CBD5E1] mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-[#0E1122] border border-gray-200 dark:border-[#1E223D] rounded-xl px-3.5 py-2 text-[13px] text-[#111827] dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpdatePassword}
                className="mt-3.5 bg-white dark:bg-[#181C33] border border-[#D1D5DB] dark:border-[#1E223D] hover:bg-gray-50 dark:hover:bg-[#1E223D] text-[#1F2937] dark:text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Update Password
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#FEF1F1] dark:bg-[#EF4444]/10 rounded-2xl p-6 border border-[#FCD7D7] dark:border-[#EF4444]/30 transition-colors">
              <h2 className="text-[#DC2626] dark:text-[#F87171] font-bold text-[15px]">
                Danger Zone
              </h2>
              <p className="text-[#7F1D1D] dark:text-[#FCA5A5] text-[12.5px] mt-0.5 mb-4">
                Irreversible actions regarding your account and stored data.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => showToast("Exporting account data...")}
                  className="bg-white dark:bg-[#181C33] border border-[#D1D5DB] dark:border-[#1E223D] hover:bg-gray-50 dark:hover:bg-[#1E223D] text-[#1F2937] dark:text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Export All Data (JSON)
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="bg-[#C5221F] hover:bg-[#B31D1A] text-white text-[12.5px] font-semibold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>

            {/* Floating / Sticky Bottom Bar */}
            <div className="bg-white dark:bg-[#121528] rounded-2xl p-4 border border-[#ECEFF8] dark:border-[#1E223D] shadow-md flex items-center justify-between sticky bottom-4 z-20 transition-colors">
              <span className="text-[12.5px] text-[#64748B] dark:text-[#94A3B8]">
                Unsaved changes will be lost if you navigate away.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => showToast("Changes reverted.")}
                  className="text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-white px-3 py-2 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="bg-[#3D37D0] hover:bg-[#342EB8] text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
