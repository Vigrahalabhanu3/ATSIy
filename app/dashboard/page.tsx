"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  FileText,
  BarChart3,
  Sliders,
  Award,
  Plus,
  ArrowRight,
  UploadCloud,
  Zap,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  History,
  Crown,
} from "lucide-react";
import { StatsGridSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { CreditBalanceResponse, CreditTransactionItem } from "@/types/credits";
import { getCredits, getCreditHistory } from "@/lib/api/credits";

interface RecentAnalysis {
  id: string;
  resumeId: string;
  resumeFileName: string;
  jobTitle: string;
  jobDescriptionPreview: string;
  atsScore: number;
  finalVerdict: string;
  createdAt: string;
}

interface DashboardStats {
  totalResumes: number;
  totalAnalyses: number;
  totalReports: number;
  averageAtsScore: number;
  bestAtsScore: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    totalAnalyses: 0,
    totalReports: 0,
    averageAtsScore: 0,
    bestAtsScore: 0,
  });
  const [credits, setCredits] = useState<CreditBalanceResponse | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<CreditTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [meRes, statsRes, recentRes, creditsData, historyData] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/dashboard/stats"),
        fetch("/api/dashboard/recent"),
        getCredits().catch(() => null),
        getCreditHistory(1, 5).catch(() => ({ transactions: [] })),
      ]);

      if (meRes.status === 401) {
        router.push("/login");
        return;
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.data?.user || meData.user);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const s = statsData.data || statsData.stats || stats;
        setStats(s);
        if (s.credits && !creditsData) {
          setCredits(s.credits);
        }
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        setRecentAnalyses(recentData.data?.recent || recentData.recent || []);
      }

      if (creditsData) {
        setCredits(creditsData);
      }

      if (historyData?.transactions) {
        setRecentTransactions(historyData.transactions);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getVerdictBadge = (verdict: string, score: number) => {
    if (score >= 80 || verdict === "Strong Match") {
      return "bg-[#DCFCE7] text-[#16A34A]";
    }
    if (score >= 60 || verdict === "Moderate Match") {
      return "bg-[#FEF3C7] text-[#D97706]";
    }
    return "bg-[#FEE2E2] text-[#DC2626]";
  };

  const getDaysUntilReset = (resetAt: string | null) => {
    if (!resetAt) return null;
    const diff = new Date(resetAt).getTime() - Date.now();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysUntilReset = credits ? getDaysUntilReset(credits.resetAt) : null;
  const isUnlimited = credits?.isUnlimited || user?.role === "admin";
  const usedPercent = credits && !isUnlimited && credits.limit > 0
    ? Math.min(100, Math.round(((credits.limit - credits.balance) / credits.limit) * 100))
    : 0;

  return (
    <DashboardLayout title="Dashboard">
      <div className="px-6 lg:px-10 py-7 max-w-[1340px] mx-auto min-h-screen">
        {/* Top Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#4F46E5] dark:text-[#818CF8] uppercase tracking-wider mb-1">
              <Sparkles size={13} />
              <span>ATS INTELLIGENCE PLATFORM</span>
            </div>
            <h1 className="text-[#111827] dark:text-white font-extrabold text-[26px] sm:text-[28px] tracking-tight">
              Welcome back, {user?.name || "Candidate"}
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-[13.5px] mt-0.5">
              Real-time analytics and tracking for your resumes, credits, and ATS match performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/library"
              className="inline-flex items-center gap-2 bg-white dark:bg-[#121528] hover:bg-[#F8F7FF] dark:hover:bg-[#1E223D] text-[#1F2937] dark:text-white border border-[#E5E7EB] dark:border-[#1E223D] font-semibold text-[13.5px] px-4 py-2.5 rounded-xl transition-all shadow-2xs"
            >
              <UploadCloud size={16} />
              <span>Upload Resume</span>
            </Link>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-[13.5px] px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <Plus size={16} />
              <span>Analyze Resume</span>
            </Link>
          </div>
        </div>

        {/* 5 Real Database Stats Cards (including ATS Credits Card) */}
        {loading ? (
          <StatsGridSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
            {/* ATS Credits Card */}
            <div className="bg-gradient-to-br from-[#1E1B4B] to-[#312E81] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden border border-[#3730A3]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#A5B4FC] tracking-wider uppercase flex items-center gap-1">
                  <Zap size={13} className="text-[#FBBF24]" />
                  ATS CREDITS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                  {isUnlimited ? "ADMIN" : `${credits?.plan || "FREE"} PLAN`}
                </span>
              </div>

              <div className="mt-3">
                {isUnlimited ? (
                  <div>
                    <div className="text-[26px] font-black tracking-tight text-white flex items-center gap-2">
                      <span>Unlimited</span>
                      <ShieldCheck size={20} className="text-[#34D399]" />
                    </div>
                    <p className="text-[11.5px] text-[#C7D2FE] mt-1">
                      No usage limits applied
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline text-white">
                      <span className="text-[28px] font-black leading-none">
                        {credits?.balance ?? 0}
                      </span>
                      <span className="text-[14px] text-[#A5B4FC] font-semibold ml-1">
                        / {credits?.limit ?? 2} remaining
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-white/15 h-2 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="bg-[#6366F1] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(8, 100 - usedPercent))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#C7D2FE] mt-2">
                      <span>{credits?.used ?? 0} used</span>
                      <span>
                        {daysUntilReset !== null ? `Reset in ${daysUntilReset}d` : "30-day cycle"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <Link
                    href="/pricing"
                    className="text-[12px] font-bold text-[#FDE047] hover:underline flex items-center gap-1"
                  >
                    <span>{isUnlimited ? "View Plans" : "Upgrade Plan"}</span>
                    <ArrowRight size={12} />
                  </Link>
                  <Link
                    href="/settings?tab=credits"
                    className="text-[11px] text-[#A5B4FC] hover:text-white"
                  >
                    Ledger
                  </Link>
                </div>
              </div>
            </div>

            {/* Total Resumes */}
            <Link
              href="/library"
              className="bg-white dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] shadow-xs hover:border-[#4F46E5] dark:hover:border-[#6366F1] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
                  TOTAL RESUMES
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FileText size={16} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[30px] font-extrabold text-[#111827] dark:text-white leading-none">
                  {stats.totalResumes}
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-2 flex items-center justify-between">
                  <span>Stored in Library</span>
                  <span className="text-[#4F46E5] dark:text-[#818CF8] font-semibold group-hover:translate-x-0.5 transition-transform">
                    View →
                  </span>
                </div>
              </div>
            </Link>

            {/* Total Analyses */}
            <Link
              href="/analyses"
              className="bg-white dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] shadow-xs hover:border-[#4F46E5] dark:hover:border-[#6366F1] transition-all group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
                  TOTAL ANALYSES
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] dark:bg-[#6366F1]/20 text-[#6366F1] dark:text-[#A5B4FC] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 size={16} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-[30px] font-extrabold text-[#111827] dark:text-white leading-none">
                  {stats.totalAnalyses}
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-2 flex items-center justify-between">
                  <span>Completed Scans</span>
                  <span className="text-[#4F46E5] dark:text-[#818CF8] font-semibold group-hover:translate-x-0.5 transition-transform">
                    History →
                  </span>
                </div>
              </div>
            </Link>

            {/* Average ATS Score */}
            <div className="bg-white dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
                  AVG ATS SCORE
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] dark:bg-[#F59E0B]/20 text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
                  <Sliders size={16} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline text-[#111827] dark:text-white">
                  <span className="text-[30px] font-extrabold leading-none">
                    {stats.averageAtsScore > 0 ? stats.averageAtsScore : "0"}
                  </span>
                  <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">/100</span>
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-2">
                  Across all scans
                </div>
              </div>
            </div>

            {/* Best ATS Score */}
            <div className="bg-white dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
                  BEST ATS SCORE
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] dark:bg-[#10B981]/20 text-[#16A34A] dark:text-[#34D399] flex items-center justify-center">
                  <Award size={16} />
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline text-[#111827] dark:text-white">
                  <span className="text-[30px] font-extrabold leading-none">
                    {stats.bestAtsScore > 0 ? stats.bestAtsScore : "0"}
                  </span>
                  <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8] ml-1">/100</span>
                </div>
                <div className="text-[12px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-2">
                  Highest match rate
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Launch CTA Banner */}
        <div className="bg-gradient-to-r from-[#4338CA] to-[#312E81] rounded-2xl p-6 sm:p-7 text-white mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold tracking-tight">
              Ready to evaluate a new job description?
            </h2>
            <p className="text-[#C7D2FE] text-[13.5px] mt-1 max-w-xl leading-relaxed">
              Upload your PDF/DOCX resume or pick an existing file, paste the target role criteria,
              and receive verified ATS scoring with keyword and structural suggestions.
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-white text-[#4338CA] hover:bg-[#F5F3FF] font-bold text-[13.5px] px-5 py-3 rounded-xl transition-colors shadow-xs shrink-0 self-start sm:self-center"
          >
            <span>Start ATS Scan</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Main Grid: Recent Analyses + Recent Credit Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Analyses Section (2 cols) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] shadow-xs transition-colors">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[#111827] dark:text-white font-bold text-[17px]">Recent Analyses</h2>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-[12.5px] mt-0.5">
                  Your most recent resume evaluations and ATS reports
                </p>
              </div>
              {recentAnalyses.length > 0 && (
                <Link
                  href="/analyses"
                  className="text-[13px] font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:text-[#4338CA] dark:hover:text-[#A5B4FC] inline-flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>

            {loading && <TableSkeleton rows={4} cols={5} />}

            {!loading && recentAnalyses.length === 0 && (
              <div className="py-12 text-center border border-dashed border-[#ECEFF8] dark:border-[#1E223D] rounded-xl">
                <div className="w-12 h-12 rounded-full bg-[#EFEDFF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mx-auto mb-3">
                  <BarChart3 size={22} />
                </div>
                <h3 className="text-[#111827] dark:text-white font-bold text-[15px] mb-1">No analyses yet</h3>
                <p className="text-[#64748B] dark:text-[#94A3B8] text-[13px] max-w-sm mx-auto mb-5">
                  Upload a resume and enter a target job description to run your first evaluation.
                </p>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
                >
                  <Plus size={14} />
                  Analyze a Resume
                </Link>
              </div>
            )}

            {!loading && recentAnalyses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#F1F3F9] dark:border-[#1E223D] text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                      <th className="py-3 px-2">ROLE & RESUME</th>
                      <th className="py-3 px-4">ATS SCORE</th>
                      <th className="py-3 px-4">VERDICT</th>
                      <th className="py-3 px-4">DATE</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F3F9] dark:divide-[#1E223D]">
                    {recentAnalyses.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => router.push(`/results/${item.id}`)}
                        className="hover:bg-[#F9FAFE] dark:hover:bg-[#181C33] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-2">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="text-[#453DE0] dark:text-[#818CF8] shrink-0" />
                            <div>
                              <span className="font-semibold text-[#111827] dark:text-white block group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                                {item.jobTitle}
                              </span>
                              <span className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8]">
                                {item.resumeFileName}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-[#111827] dark:text-white">
                          {item.atsScore}/100
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getVerdictBadge(
                              item.finalVerdict,
                              item.atsScore
                            )}`}
                          >
                            {item.finalVerdict}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-[#64748B] dark:text-[#94A3B8]">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="text-[#4F46E5] dark:text-[#818CF8] font-semibold text-xs group-hover:underline inline-flex items-center gap-1">
                            Results →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Credit Activity Section (1 col) */}
          <div className="bg-white dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] shadow-xs flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center">
                    <History size={16} />
                  </div>
                  <div>
                    <h2 className="text-[#111827] dark:text-white font-bold text-[16px]">Credit Activity</h2>
                    <p className="text-[#64748B] dark:text-[#94A3B8] text-[12px]">Ledger transaction events</p>
                  </div>
                </div>
                <Link
                  href="/settings?tab=credits"
                  className="text-[12px] font-semibold text-[#4F46E5] dark:text-[#818CF8] hover:underline"
                >
                  All
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-[#181C33]">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[#ECEFF8] dark:border-[#1E223D] rounded-xl text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                  No credit transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentTransactions.map((tx) => {
                    const isPositive = tx.type === "ALLOCATED" || tx.type === "REFUNDED" || tx.type === "PLAN_UPGRADE";
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-xl border border-[#F1F3F9] dark:border-[#1E223D] hover:bg-[#F9FAFE] dark:hover:bg-[#181C33] transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isPositive
                                ? "bg-[#DCFCE7] dark:bg-[#10B981]/20 text-[#16A34A] dark:text-[#34D399]"
                                : "bg-[#F1F5F9] dark:bg-[#1E223D] text-[#64748B] dark:text-[#94A3B8]"
                            }`}
                          >
                            {isPositive ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                          </div>
                          <div>
                            <div className="text-[12.5px] font-bold text-[#111827] dark:text-white leading-tight">
                              {tx.type === "CONSUMED"
                                ? "ATS Analysis"
                                : tx.type === "REFUNDED"
                                ? "Credit Refund"
                                : tx.type === "ALLOCATED"
                                ? "Monthly Allocation"
                                : tx.type === "RESERVED"
                                ? "Credit Reserved"
                                : tx.type}
                            </div>
                            <div className="text-[11px] text-[#94A3B8]">
                              {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[12.5px] font-extrabold ${
                              isPositive ? "text-[#16A34A] dark:text-[#34D399]" : "text-[#111827] dark:text-white"
                            }`}
                          >
                            {isPositive ? `+${tx.amount}` : `-${tx.amount}`} credit
                            {tx.amount > 1 ? "s" : ""}
                          </span>
                          <span className="block text-[10px] text-[#94A3B8] font-medium">
                            bal: {tx.balanceAfter}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-[#F1F3F9] dark:border-[#1E223D] flex items-center justify-between text-[12px]">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Need more checks?</span>
              <Link
                href="/pricing"
                className="font-bold text-[#4F46E5] dark:text-[#818CF8] hover:underline flex items-center gap-1"
              >
                <span>Upgrade to Pro</span>
                <Crown size={13} className="text-[#F59E0B]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
