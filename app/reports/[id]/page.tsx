"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ATSScoreCard from "@/components/results/ATSScoreCard";
import FinalVerdict from "@/components/results/FinalVerdict";
import ScoreBreakdownGrid from "@/components/results/ScoreBreakdownGrid";
import KeywordAnalysis from "@/components/results/KeywordAnalysis";
import TechnicalSkills from "@/components/results/TechnicalSkills";
import ExperienceMatch from "@/components/results/ExperienceMatch";
import ProjectMatch from "@/components/results/ProjectMatch";
import ResumeStructure from "@/components/results/ResumeStructure";
import ResumeProblems from "@/components/results/ResumeProblems";
import Recommendations from "@/components/results/Recommendations";
import TopChanges from "@/components/results/TopChanges";
import { ATSResult } from "@/lib/types";
import { DownloadIcon } from "@/components/icons/Icons";
import { ArrowLeft } from "lucide-react";
import { formatAnalysisToATSResult } from "@/lib/services/adapter";
import { AnalysisDetailSkeleton } from "@/components/ui/Skeleton";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#171725] font-extrabold text-[19px] mt-8 mb-4 tracking-tight">
      {children}
    </h2>
  );
}

export default function ReportDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const reportId = (routeParams?.id as string) || "";

  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState<string>("");
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/reports/${reportId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error?.message || "Report could not be found");
          return;
        }

        const report = data.data?.report || data.report;
        setReportTitle(report.title || "ATS Report");
        if (report.createdAt) {
          setReportDate(
            new Date(report.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          );
        }

        const reportData = report.reportData || {};
        const formatted = formatAnalysisToATSResult(reportData);
        setResult(formatted);
      } catch (err) {
        console.error("Error loading report detail:", err);
        setError("Network error loading report");
      } finally {
        setLoading(false);
      }
    }

    if (reportId) {
      loadReport();
    }
  }, [reportId]);

  const handleDownload = () => {
    window.open(`/api/reports/${reportId}/download`, "_blank");
  };

  if (loading) {
    return (
      <DashboardLayout title="Report Detail">
        <AnalysisDetailSkeleton />
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout title="Report Detail">
        <div className="px-4 py-16 max-w-md mx-auto text-center">
          <h2 className="text-[#171725] font-bold text-xl mb-2">Report Not Found</h2>
          <p className="text-[#55556A] text-sm mb-5">{error || "This report does not exist or has been deleted."}</p>
          <button
            onClick={() => router.push("/reports")}
            className="bg-[#4338CA] text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            Back to Reports
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Report Detail">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px] mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => router.push("/reports")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64748B] hover:text-[#111827] mb-2"
            >
              <ArrowLeft size={14} />
              <span>Back to Reports</span>
            </button>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider mb-1 block">
              <span>{reportTitle}</span>
              <span>•</span>
              <span className="text-[#8080A0] font-medium lowercase">Generated on {reportDate}</span>
            </div>
            <h1 className="text-[#171725] font-extrabold text-[26px] tracking-tight">
              {result.jobTitle || "ATS Evaluation Report"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
            >
              <DownloadIcon size={14} />
              Download Official PDF
            </button>
          </div>
        </div>

        {/* Top Hero Section: 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-stretch">
          <ATSScoreCard result={result} />
          <FinalVerdict result={result} />
        </div>

        {/* Score Breakdown */}
        <SectionTitle>Score Breakdown</SectionTitle>
        <ScoreBreakdownGrid result={result} />

        {/* Keyword Analysis */}
        <SectionTitle>Keyword Analysis</SectionTitle>
        <KeywordAnalysis result={result} />

        {/* Technical Skills */}
        <div className="mt-6">
          <TechnicalSkills result={result} />
        </div>

        {/* Experience Match & Project Match */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6 items-stretch">
          <ExperienceMatch result={result} />
          <ProjectMatch result={result} />
        </div>

        {/* Resume Health & Top Resume Problems */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6 items-stretch">
          <ResumeStructure result={result} />
          <ResumeProblems result={result} />
        </div>

        {/* Recommended Improvements */}
        <SectionTitle>Recommended Improvements</SectionTitle>
        <Recommendations result={result} />

        {/* Top 5 Changes Checklist */}
        <div className="mt-6 mb-12">
          <TopChanges result={result} />
        </div>
      </div>
    </DashboardLayout>
  );
}
