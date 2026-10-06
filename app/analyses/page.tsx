"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  BarChartIcon,
  FileTextIcon,
  ShieldCheckIcon,
  PlusIcon,
  SearchIcon,
  ChevronDownIcon,
  ListIcon,
  GridIcon,
  EyeIcon,
  DownloadIcon,
  TrashIcon,
} from "@/components/icons/Icons";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface RealAnalysisItem {
  id: string;
  resumeId: string;
  resumeFileName: string;
  jobTitle: string;
  jobDescriptionPreview: string;
  atsScore: number;
  finalVerdict: string;
  analysisDuration?: number;
  createdAt: string;
}

export default function AnalysesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"recent" | "highest" | "lowest">("recent");
  const [analyses, setAnalyses] = useState<RealAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    averageAtsScore: 0,
    bestAtsScore: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [analysesRes, statsRes] = await Promise.all([
        fetch("/api/analyses?limit=50"),
        fetch("/api/dashboard/stats"),
      ]);

      if (analysesRes.status === 401) {
        router.push("/login");
        return;
      }

      if (analysesRes.ok) {
        const data = await analysesRes.json();
        const list = data.data?.analyses || data.analyses || [];
        setAnalyses(list);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const s = statsData.data?.stats || statsData.stats || statsData.data || {};
        setStats({
          totalAnalyses: s.totalAnalyses ?? 0,
          averageAtsScore: s.averageAtsScore ?? 0,
          bestAtsScore: s.bestAtsScore ?? 0,
        });
      }
    } catch (err) {
      console.error("Error loading analyses history:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAnalyses = analyses
    .filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (item.jobTitle || "").toLowerCase().includes(query) ||
        (item.resumeFileName || "").toLowerCase().includes(query) ||
        (item.finalVerdict || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "strong" && item.atsScore >= 80) return true;
      if (statusFilter === "moderate" && item.atsScore >= 60 && item.atsScore < 80) return true;
      if (statusFilter === "weak" && item.atsScore < 60) return true;
      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "highest") return b.atsScore - a.atsScore;
      if (sortOrder === "lowest") return a.atsScore - b.atsScore;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    try {
      const res = await fetch(`/api/analyses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnalyses((prev) => prev.filter((item) => item.id !== id));
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting analysis:", err);
    }
  };

  const handleDownloadReport = async (analysisId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/reports?search=${encodeURIComponent(analysisId)}`);
      const data = await res.json();
      const report = data.data?.reports?.find((r: any) => r.analysisId === analysisId) || data.reports?.[0];
      if (report?.id) {
        window.open(`/api/reports/${report.id}/download`, "_blank");
      } else {
        router.push(`/results/${analysisId}`);
      }
    } catch {
      router.push(`/results/${analysisId}`);
    }
  };

  const getScoreBadgeClass = (score: number) => {
    if (score >= 80) {
      return "bg-[#DCFCE7] text-[#16A34A] font-bold";
    }
    if (score >= 60) {
      return "bg-[#FEF3C7] text-[#D97706] font-bold";
    }
    return "bg-[#FEE2E2] text-[#DC2626] font-bold";
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px] mx-auto">
        {/* Top 3 KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Card 1: Total Scans */}
          <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 shadow-card flex items-center justify-between transition-colors">
            <div>
              <p className="text-[#8080A0] dark:text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                TOTAL ANALYSES
              </p>
              <p className="text-[#171725] dark:text-white font-extrabold text-[32px] leading-tight">
                {stats.totalAnalyses}
              </p>
              <div className="flex items-center gap-1 text-[#4F46E5] dark:text-[#818CF8] text-[12.5px] font-semibold mt-1">
                <span>Verified ATS Evaluations</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-sm">
              <BarChartIcon size={22} />
            </div>
          </div>

          {/* Card 2: Average ATS Score */}
          <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 shadow-card flex items-center justify-between transition-colors">
            <div>
              <p className="text-[#8080A0] dark:text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                AVERAGE ATS SCORE
              </p>
              <p className="text-[#171725] dark:text-white font-extrabold text-[32px] leading-tight">
                {stats.averageAtsScore > 0 ? `${stats.averageAtsScore}%` : "—"}
              </p>
              <div className="flex items-center gap-1 text-[#D97706] dark:text-[#FBBF24] text-[12.5px] font-semibold mt-1">
                <span>Across all evaluations</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] dark:bg-[#0284C7]/20 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <FileTextIcon size={22} />
            </div>
          </div>

          {/* Card 3: Top Match Rate */}
          <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 shadow-card flex items-center justify-between transition-colors">
            <div>
              <p className="text-[#8080A0] dark:text-[#94A3B8] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                BEST ATS SCORE
              </p>
              <p className="text-[#171725] dark:text-white font-extrabold text-[32px] leading-tight">
                {stats.bestAtsScore > 0 ? `${stats.bestAtsScore}%` : "—"}
              </p>
              <p className="text-[#55556A] dark:text-[#94A3B8] text-[12.5px] font-medium mt-1">
                Highest match achieved
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] dark:bg-[#1E223D] text-[#4B5563] dark:text-[#94A3B8] flex items-center justify-center shrink-0">
              <ShieldCheckIcon size={22} />
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[#171725] dark:text-white font-extrabold text-[24px] tracking-tight">
              My Analyses
            </h1>
            <p className="text-[#55556A] dark:text-[#94A3B8] text-[13.5px] mt-0.5">
              Review and manage all your historical resume evaluations and ATS scores
            </p>
          </div>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-[13.5px] px-5 py-2.5 rounded-xl transition-colors duration-150 shadow-sm shrink-0"
          >
            <PlusIcon size={16} />
            Analyze New Resume
          </Link>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-[#F8F7FF] dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-3 mb-6 flex flex-col md:flex-row items-center justify-between gap-3 transition-colors">
          {/* Search bar */}
          <div className="relative w-full md:w-[380px]">
            <SearchIcon
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8080A0] dark:text-[#64748B]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title or resume..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0E1122] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl text-[13.5px] text-[#171725] dark:text-white placeholder:text-[#8080A0] dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent transition-all"
            />
          </div>

          {/* Right dropdowns & view toggle */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-white dark:bg-[#0E1122] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-[#171725] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
              >
                <option value="all">All Match Levels</option>
                <option value="strong">Strong Match (80%+)</option>
                <option value="moderate">Moderate Match (60-79%)</option>
                <option value="weak">Low Match (&lt;60%)</option>
              </select>
              <ChevronDownIcon
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8080A0] dark:text-[#64748B] pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="appearance-none bg-white dark:bg-[#0E1122] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl pl-3.5 pr-8 py-2 text-[13px] text-[#171725] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
              >
                <option value="recent">Sort by: Most Recent</option>
                <option value="highest">Sort by: Highest Score</option>
                <option value="lowest">Sort by: Lowest Score</option>
              </select>
              <ChevronDownIcon
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8080A0] dark:text-[#64748B] pointer-events-none"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white dark:bg-[#0E1122] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="List view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "list"
                    ? "bg-[#EFEDFF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8]"
                    : "text-[#8080A0] dark:text-[#64748B] hover:text-[#171725] dark:hover:text-white"
                }`}
              >
                <ListIcon size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#EFEDFF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8]"
                    : "text-[#8080A0] dark:text-[#64748B] hover:text-[#171725] dark:hover:text-white"
                }`}
              >
                <GridIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <TableSkeleton rows={6} cols={5} />
        )}

        {/* Empty State: No analyses at all */}
        {!loading && analyses.length === 0 && (
          <div className="bg-white border border-[#E5E3F2] rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EFEDFF] text-[#4F46E5] flex items-center justify-center mx-auto mb-4">
              <BarChartIcon size={26} />
            </div>
            <h3 className="text-[#171725] font-extrabold text-[18px] mb-1">No analyses yet</h3>
            <p className="text-[#8080A0] text-[14px] max-w-sm mx-auto mb-6">
              Compare your resume with any job description to generate your first ATS score and actionable recommendations.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-[13.5px] px-6 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <PlusIcon size={16} />
              Analyze Your First Resume
            </Link>
          </div>
        )}

        {/* List View Data Table */}
        {!loading && analyses.length > 0 && viewMode === "list" && (
          <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl shadow-card overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E3F2] dark:border-[#1E223D] bg-[#F8F7FF] dark:bg-[#181C33] text-[#8080A0] dark:text-[#94A3B8] text-[12px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Target Role</th>
                    <th className="py-4 px-6">Date Analyzed</th>
                    <th className="py-4 px-6">Resume File</th>
                    <th className="py-4 px-6">ATS Score</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E3F2] dark:divide-[#1E223D]">
                  {filteredAnalyses.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center text-[#8080A0] dark:text-[#94A3B8] text-[14px]"
                      >
                        No analyses found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredAnalyses.map((scan) => (
                      <tr
                        key={scan.id}
                        onClick={() => router.push(`/results/${scan.id}`)}
                        className="hover:bg-[#F8F7FF] dark:hover:bg-[#181C33] transition-colors cursor-pointer group"
                      >
                        {/* Target Role */}
                        <td className="py-4 px-6">
                          <p className="text-[#171725] dark:text-white font-bold text-[14px] group-hover:text-[#4F46E5] dark:group-hover:text-[#818CF8] transition-colors">
                            {scan.jobTitle}
                          </p>
                          <p className="text-[#8080A0] dark:text-[#94A3B8] text-[12.5px] mt-0.5 truncate max-w-md">
                            {scan.jobDescriptionPreview}
                          </p>
                        </td>

                        {/* Date Analyzed */}
                        <td className="py-4 px-6 text-[#55556A] dark:text-[#94A3B8] text-[13.5px]">
                          {new Date(scan.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Resume File */}
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2 text-[#4F46E5] dark:text-[#818CF8] text-[13.5px] font-medium hover:underline">
                            <FileTextIcon size={15} />
                            <span>{scan.resumeFileName}</span>
                          </div>
                        </td>

                        {/* ATS Score */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className="text-[#171725] dark:text-white font-extrabold text-[15px]">
                              {scan.atsScore}/100
                            </span>
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] ${getScoreBadgeClass(
                                scan.atsScore
                              )}`}
                            >
                              {scan.finalVerdict}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div
                            className="inline-flex items-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => router.push(`/results/${scan.id}`)}
                              aria-label="View report"
                              className="p-1.5 text-[#8080A0] dark:text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#EFEDFF] dark:hover:bg-[#4F46E5]/20 rounded-lg transition-colors cursor-pointer"
                              title="View Analysis"
                            >
                              <EyeIcon size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownloadReport(scan.id, e)}
                              aria-label="Download report"
                              className="p-1.5 text-[#8080A0] dark:text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#EFEDFF] dark:hover:bg-[#4F46E5]/20 rounded-lg transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <DownloadIcon size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(scan.id, e)}
                              aria-label="Delete analysis"
                              className="p-1.5 text-[#8080A0] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#EF4444]/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete Analysis"
                            >
                              <TrashIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grid View */}
        {!loading && analyses.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAnalyses.map((scan) => (
              <div
                key={scan.id}
                onClick={() => router.push(`/results/${scan.id}`)}
                className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-5 shadow-card hover:border-[#4F46E5] dark:hover:border-[#6366F1] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getScoreBadgeClass(
                        scan.atsScore
                      )}`}
                    >
                      {scan.finalVerdict}
                    </span>
                    <span className="text-[#8080A0] dark:text-[#94A3B8] text-[12px]">
                      {new Date(scan.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="text-[#171725] dark:text-white font-bold text-[15px] mb-1 line-clamp-1">
                    {scan.jobTitle}
                  </h3>
                  <p className="text-[#8080A0] dark:text-[#94A3B8] text-[12px] flex items-center gap-1.5 mb-3 truncate">
                    <FileTextIcon size={13} />
                    <span>{scan.resumeFileName}</span>
                  </p>

                  <div className="flex items-baseline gap-1 my-3">
                    <span className="text-[28px] font-extrabold text-[#171725] dark:text-white">
                      {scan.atsScore}
                    </span>
                    <span className="text-[14px] text-[#8080A0] dark:text-[#94A3B8]">/100 ATS Score</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F0EEFF] dark:border-[#1E223D]">
                  <span className="text-[12.5px] font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                    View Analysis →
                  </span>
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => handleDownloadReport(scan.id, e)}
                      className="p-1.5 text-[#8080A0] dark:text-[#94A3B8] hover:text-[#4F46E5] dark:hover:text-[#818CF8] hover:bg-[#EFEDFF] dark:hover:bg-[#4F46E5]/20 rounded-lg cursor-pointer"
                      title="Download PDF"
                    >
                      <DownloadIcon size={15} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(scan.id, e)}
                      className="p-1.5 text-[#8080A0] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#FEE2E2] dark:hover:bg-[#EF4444]/10 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <TrashIcon size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
