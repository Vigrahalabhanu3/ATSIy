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
import { RefreshIcon, DownloadIcon } from "@/components/icons/Icons";
import { formatAnalysisToATSResult } from "@/lib/services/adapter";
import { AnalysisDetailSkeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api/client";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#171725] dark:text-white font-extrabold text-[19px] mt-8 mb-4 tracking-tight">
      {children}
    </h2>
  );
}

export default function AnalysisDetailPage() {
  const router = useRouter();
  const routeParams = useParams();
  const analysisId = (routeParams?.id as string) || "";

  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string>("");
  const [dateAnalyzed, setDateAnalyzed] = useState<string>("");

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch(`/api/analyses/${analysisId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error?.message || "Failed to load analysis result");
          return;
        }

        const rawAnalysis = data.data?.analysis || data.analysis;
        setResumeFileName(rawAnalysis.resumeFileName || "Resume.pdf");
        if (rawAnalysis.createdAt) {
          setDateAnalyzed(
            new Date(rawAnalysis.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          );
        }

        const formatted = formatAnalysisToATSResult(rawAnalysis);
        setResult(formatted);
      } catch (err: any) {
        console.error("Error loading analysis:", err);
        setError("Network error loading analysis details");
      } finally {
        setLoading(false);
      }
    }

    if (analysisId) {
      loadAnalysis();
    }
  }, [analysisId]);

  const handleDownload = async () => {
    try {
      // Find matching report for this analysis
      const res = await fetch(`/api/reports?search=${encodeURIComponent(analysisId)}`);
      const data = await res.json();
      const report = data.data?.reports?.find((r: any) => r.analysisId === analysisId) || data.reports?.[0];
      if (report?.id) {
        window.open(`/api/reports/${report.id}/download`, "_blank");
      } else {
        window.print();
      }
    } catch {
      window.print();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Resume Analysis">
        <AnalysisDetailSkeleton />
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout title="Resume Analysis">
        <div className="px-4 sm:px-6 lg:px-8 py-16 max-w-[600px] mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF5F5] border border-[#FEE2E2] flex items-center justify-center mx-auto mb-4 text-[#DC2626] font-bold text-xl">
            !
          </div>
          <h2 className="text-[#171725] font-extrabold text-[22px] mb-2">Analysis Not Found</h2>
          <p className="text-[#55556A] text-[14px] mb-6">{error || "This analysis could not be located in your account."}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/analyze")}
              className="bg-[#4338CA] text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl hover:bg-[#3730A3] transition-colors"
            >
              Analyze a Resume
            </button>
            <button
              onClick={() => router.push("/analyses")}
              className="bg-white border border-[#E5E3F2] text-[#171725] font-semibold text-[13px] px-5 py-2.5 rounded-xl hover:bg-[#F8F7FF] transition-colors"
            >
              My Analyses
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Resume Analysis">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px] mx-auto">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#4F46E5] uppercase tracking-wider mb-1">
              <span>{resumeFileName}</span>
              <span>•</span>
              <span className="text-[#8080A0] font-medium lowercase">
                {dateAnalyzed ? `Analyzed on ${dateAnalyzed}` : "Real ATS Evaluation"}
              </span>
            </div>
            <h1 className="text-[#171725] dark:text-white font-extrabold text-[26px] tracking-tight">
              {result.jobTitle || "Resume Analysis"}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/analyze")}
              className="inline-flex items-center gap-2 bg-white dark:bg-[#121528] hover:bg-[#F8F7FF] dark:hover:bg-[#1A1E36] text-[#171725] dark:text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl border border-[#E5E3F2] dark:border-[#1E223D] transition-colors duration-150 shadow-xs"
            >
              <RefreshIcon size={14} className="text-[#8080A0]" />
              Analyze Another Resume
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl transition-colors duration-150 shadow-sm"
            >
              <DownloadIcon size={14} />
              Download Report
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
