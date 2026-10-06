"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Download,
  Search,
  TrendingUp,
  FileText,
  Sliders,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Code2,
  X,
  Eye,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface RealReportItem {
  id: string;
  analysisId: string;
  resumeId: string;
  title: string;
  resumeFileName: string;
  jobTitle: string;
  atsScore: number;
  finalVerdict: string;
  createdAt: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<RealReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    averageAtsScore: 0,
    bestAtsScore: 0,
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const [reportsRes, statsRes] = await Promise.all([
        fetch("/api/reports?limit=50"),
        fetch("/api/dashboard/stats"),
      ]);

      if (reportsRes.status === 401) {
        router.push("/login");
        return;
      }

      if (reportsRes.ok) {
        const data = await reportsRes.json();
        const list = data.data?.reports || data.reports || [];
        setReports(list);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        const s = statsData.data?.stats || statsData.stats || statsData.data || {};
        setStats({
          totalReports: s.totalReports ?? s.totalAnalyses ?? 0,
          averageAtsScore: s.averageAtsScore ?? 0,
          bestAtsScore: s.bestAtsScore ?? 0,
        });
      }
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const filteredReports = reports.filter((report) => {
    const q = searchQuery.toLowerCase();
    return (
      (report.title || "").toLowerCase().includes(q) ||
      (report.resumeFileName || "").toLowerCase().includes(q) ||
      (report.jobTitle || "").toLowerCase().includes(q) ||
      (report.finalVerdict || "").toLowerCase().includes(q)
    );
  });

  const handleDownload = (reportId: string, filename: string) => {
    setDownloadToast(`Generating and downloading PDF report for "${filename}"...`);
    window.open(`/api/reports/${reportId}/download`, "_blank");
    setTimeout(() => setDownloadToast(null), 4000);
  };

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
        setDownloadToast("Report deleted successfully.");
        setTimeout(() => setDownloadToast(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  const handleExportSummary = () => {
    if (reports.length > 0) {
      handleDownload(reports[0].id, reports[0].resumeFileName);
    } else {
      router.push("/analyze");
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="px-6 lg:px-10 py-6 max-w-[1340px] mx-auto min-h-screen">
        {/* Toast Alert */}
        {downloadToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#15173A] text-white px-4 py-3 rounded-xl shadow-lg border border-[#3B34D1] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={18} className="text-[#4CD964]" />
            <span className="text-sm font-medium">{downloadToast}</span>
            <button
              onClick={() => setDownloadToast(null)}
              className="text-gray-400 hover:text-white ml-2"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Intelligence Engine Tag */}
        <div className="flex items-center gap-1.5 text-[#3D37D0] text-[11px] font-bold tracking-wider uppercase mb-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 17v-4" />
            <path d="M12 17v-8" />
            <path d="M17 17v-6" />
          </svg>
          <span>INTELLIGENCE ENGINE</span>
        </div>

        {/* Title & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[#111827] dark:text-white font-bold text-[24px] sm:text-[26px] tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-[#64748B] dark:text-gray-400 text-[13.5px] mt-0.5">
              Comprehensive overview of your job search progress and ATS optimization trends
              across all resume evaluations and target roles.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportSummary}
            className="inline-flex items-center gap-2 bg-[#3D37D0] hover:bg-[#342EB8] text-white font-semibold text-[13.5px] px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <Download size={15} />
            <span>{reports.length > 0 ? "Export Latest PDF Report" : "Create New Report"}</span>
          </button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Reports */}
          <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] relative overflow-hidden flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#64748B] dark:text-gray-400 tracking-wider uppercase">
                TOTAL REPORTS
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] dark:bg-[#272052] text-[#4F46E5] dark:text-[#A78BFA] flex items-center justify-center">
                <FileText size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[30px] font-extrabold text-[#111827] dark:text-white leading-none">
                {stats.totalReports}
              </div>
              <div className="flex items-center gap-1 text-[11.5px] font-semibold text-[#16A34A] dark:text-[#4ADE80] mt-2">
                <TrendingUp size={13} />
                <span>Generated reports</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#ECEEFB] dark:bg-[#1E223D] absolute -right-3 -bottom-3 pointer-events-none opacity-60" />
          </div>

          {/* Avg ATS Score */}
          <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] relative overflow-hidden flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#64748B] dark:text-gray-400 tracking-wider uppercase">
                AVG ATS SCORE
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] dark:bg-[#272052] text-[#4F46E5] dark:text-[#A78BFA] flex items-center justify-center">
                <Sliders size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline text-[#111827] dark:text-white">
                <span className="text-[30px] font-extrabold leading-none">
                  {stats.averageAtsScore > 0 ? stats.averageAtsScore : "—"}
                </span>
                <span className="text-[15px] font-semibold text-[#64748B] dark:text-gray-400 ml-1">/100</span>
              </div>
              <div className="flex items-center gap-1 text-[11.5px] font-semibold text-[#16A34A] dark:text-[#4ADE80] mt-2">
                <TrendingUp size={13} />
                <span>Across all reports</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#ECEEFB] dark:bg-[#1E223D] absolute -right-3 -bottom-3 pointer-events-none opacity-60" />
          </div>

          {/* Best Match Score */}
          <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] relative overflow-hidden flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#64748B] dark:text-gray-400 tracking-wider uppercase">
                BEST MATCH SCORE
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] dark:bg-[#3D2C0D] text-[#D97706] dark:text-[#FBBF24] flex items-center justify-center">
                <AlertTriangle size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[30px] font-extrabold text-[#111827] dark:text-white leading-none">
                {stats.bestAtsScore > 0 ? `${stats.bestAtsScore}%` : "—"}
              </div>
              <div className="text-[11.5px] text-[#64748B] dark:text-gray-400 font-medium mt-2">
                Highest score achieved
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#ECEEFB] dark:bg-[#1E223D] absolute -right-3 -bottom-3 pointer-events-none opacity-60" />
          </div>

          {/* Readiness Index */}
          <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] relative overflow-hidden flex flex-col justify-between transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-bold text-[#64748B] dark:text-gray-400 tracking-wider uppercase">
                READINESS STATUS
              </span>
              <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] dark:bg-[#272052] text-[#4F46E5] dark:text-[#A78BFA] flex items-center justify-center">
                <ShieldCheck size={15} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[24px] font-extrabold text-[#111827] dark:text-white leading-none truncate">
                {stats.bestAtsScore >= 80 ? "High Match" : stats.bestAtsScore >= 60 ? "Moderate Match" : "Active"}
              </div>
              <div className="text-[11.5px] font-semibold text-[#3B34D1] dark:text-indigo-400 mt-2">
                ATSly Evaluation Engine
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#ECEEFB] dark:bg-[#1E223D] absolute -right-3 -bottom-3 pointer-events-none opacity-60" />
          </div>
        </div>

        {/* Recent Exported Reports Table Card */}
        <div className="bg-white dark:bg-[#121528] rounded-2xl p-6 border border-[#ECEFF8] dark:border-[#1E223D] transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-[#111827] dark:text-white font-bold text-[16px]">
                Available Analysis Reports
              </h3>
              <p className="text-[#64748B] dark:text-gray-400 text-[12.5px] mt-0.5">
                Downloadable PDF reports and logs of saved ATS evaluations
              </p>
            </div>

            {/* Filter Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                placeholder="Filter reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#F3F4F9] dark:bg-[#1E223D] text-[13px] text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 rounded-xl pl-9 pr-3 py-1.5 w-56 border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:focus:bg-[#161933] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <TableSkeleton rows={5} cols={5} />
          )}

          {/* Empty state: No reports at all */}
          {!loading && reports.length === 0 && (
            <div className="py-12 text-center border border-dashed border-[#ECEFF8] dark:border-[#1E223D] rounded-xl my-2">
              <div className="w-12 h-12 rounded-full bg-[#EFEDFF] dark:bg-[#1E223D] text-[#453DE0] dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <FileText size={22} />
              </div>
              <h4 className="text-[#111827] dark:text-white font-bold text-[16px] mb-1">No reports available yet</h4>
              <p className="text-[#64748B] dark:text-gray-400 text-[13px] max-w-sm mx-auto mb-5">
                Analyze a resume against any job description to automatically generate detailed ATS evaluation reports.
              </p>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 bg-[#3D37D0] hover:bg-[#342EB8] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
              >
                <Sparkles size={14} />
                Run ATS Analysis
              </Link>
            </div>
          )}

          {/* Table Container */}
          {!loading && reports.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="border-b border-[#F1F3F9] dark:border-[#1E223D] text-[11px] font-bold text-[#64748B] dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-2">RESUME & TARGET ROLE</th>
                    <th className="py-3 px-4">ATS SCORE</th>
                    <th className="py-3 px-4">VERDICT</th>
                    <th className="py-3 px-4">DATE GENERATED</th>
                    <th className="py-3 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F9] dark:divide-[#1E223D]">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-[#F9FAFE] dark:hover:bg-[#161A36] transition-colors group cursor-pointer"
                      onClick={() => router.push(`/results/${report.analysisId}`)}
                    >
                      {/* Report Name with Icon */}
                      <td className="py-3.5 px-2">
                        <div className="flex items-center gap-2.5">
                          <FileText
                            size={16}
                            className="text-[#453DE0] dark:text-indigo-400 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-[#111827] dark:text-white block">
                              {report.title || report.resumeFileName}
                            </span>
                            <span className="text-[11.5px] text-[#64748B] dark:text-gray-400">
                              {report.jobTitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ATS Score */}
                      <td className="py-3.5 px-4 font-bold text-[#111827] dark:text-white">
                        {report.atsScore}/100
                      </td>

                      {/* Format / Verdict Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                            report.atsScore >= 80
                              ? "bg-[#DCFCE7] dark:bg-[#143E23] text-[#16A34A] dark:text-[#4ADE80]"
                              : report.atsScore >= 60
                              ? "bg-[#FEF3C7] dark:bg-[#3D2C0D] text-[#D97706] dark:text-[#FBBF24]"
                              : "bg-[#FEE2E2] dark:bg-[#451A1A] text-[#DC2626] dark:text-[#F87171]"
                          }`}
                        >
                          {report.finalVerdict}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#64748B] dark:text-gray-400">
                        {new Date(report.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            title="View Report Analysis"
                            onClick={() => router.push(`/results/${report.analysisId}`)}
                            className="text-[#64748B] dark:text-gray-400 hover:text-[#3D37D0] dark:hover:text-indigo-400 p-1.5 rounded-lg hover:bg-[#EFEDFF] dark:hover:bg-[#1E2248] transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            title="Download PDF Report"
                            onClick={() => handleDownload(report.id, report.resumeFileName)}
                            className="text-[#3D37D0] dark:text-indigo-400 hover:text-[#2827B8] dark:hover:text-indigo-300 p-1.5 rounded-lg hover:bg-[#EFEDFF] dark:hover:bg-[#1E2248] transition-colors cursor-pointer"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            type="button"
                            title="Delete Report"
                            onClick={(e) => handleDelete(report.id, e)}
                            className="text-[#64748B] dark:text-gray-400 hover:text-[#DC2626] dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-[#FEE2E2] dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && reports.length > 0 && filteredReports.length === 0 && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400 text-xs">
              No reports match &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
