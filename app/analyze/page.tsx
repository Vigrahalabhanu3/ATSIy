"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ResumeUpload from "@/components/analyzer/ResumeUpload";
import JobDescription from "@/components/analyzer/JobDescription";
import ScoreBreakdown from "@/components/analyzer/ScoreBreakdown";
import { LoaderIcon } from "@/components/icons/Icons";
import { ATSResult } from "@/lib/types";
import { formatAnalysisToATSResult } from "@/lib/services/adapter";
import { CreditBalanceResponse } from "@/types/credits";
import { getCredits } from "@/lib/api/credits";
import { apiFetch } from "@/lib/api/client";
import {
  Zap,
  ShieldCheck,
  AlertTriangle,
  Crown,
  History,
  X,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface UploadedFileInfo {
  id?: string;
  name: string;
  size: string;
  file?: File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AnalyzePage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Credit system state
  const [credits, setCredits] = useState<CreditBalanceResponse | null>(null);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [showExhaustedModal, setShowExhaustedModal] = useState(false);

  // User's saved resumes to pick from
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");

  // Latest analysis preview for right column (real DB data)
  const [latestResult, setLatestResult] = useState<ATSResult | null>(null);

  // Load user's credits, resumes, and latest analysis
  const loadUserData = useCallback(async () => {
    try {
      setLoadingCredits(true);
      const [creditsData, resumesRes, recentRes] = await Promise.all([
        getCredits().catch(() => null),
        apiFetch("/api/resumes?limit=10"),
        apiFetch("/api/dashboard/recent"),
      ]);

      if (creditsData) {
        setCredits(creditsData);
      }

      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        const list = resumesData.data?.resumes || resumesData.resumes || [];
        setSavedResumes(list);
      }

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        const recentList = recentData.data?.recent || recentData.recent || [];
        if (recentList.length > 0) {
          const singleRes = await apiFetch(`/api/analyses/${recentList[0].id}`);
          if (singleRes.ok) {
            const singleData = await singleRes.json();
            const fullDoc = singleData.data?.analysis || singleData.analysis;
            if (fullDoc) {
              setLatestResult(formatAnalysisToATSResult(fullDoc));
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading user context for analyze page:", err);
    } finally {
      setLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile({
      name: file.name,
      size: formatFileSize(file.size),
      file,
    });
    setSelectedResumeId("");
    setError(null);
  }, []);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setSelectedResumeId("");
  }, []);

  const handleSelectSavedResume = (resumeId: string) => {
    const found = savedResumes.find((r) => r.id === resumeId);
    if (found) {
      setSelectedResumeId(resumeId);
      setUploadedFile({
        id: found.id,
        name: found.originalFileName,
        size: formatFileSize(found.fileSize),
      });
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile && !selectedResumeId) {
      setError("Please upload your resume or select an existing one first.");
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError("Please paste a comprehensive job description (at least 20 characters) before analyzing.");
      return;
    }

    // Client-side quick check: if normal user has 0 balance, prevent call to server/Make immediately
    if (credits && !credits.isUnlimited && credits.balance <= 0) {
      setShowExhaustedModal(true);
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      // Step 1: Checking credits
      setAnalysisStep("Checking credits...");
      await new Promise((r) => setTimeout(r, 400));

      let targetResumeId = selectedResumeId || uploadedFile?.id;

      // If a new file was uploaded, upload & parse into MongoDB first (Uploads DO NOT consume credit)
      if (!targetResumeId && uploadedFile?.file) {
        setAnalysisStep("Uploading and parsing resume...");
        const formData = new FormData();
        formData.append("file", uploadedFile.file);

        const uploadRes = await apiFetch("/api/resumes", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error?.message || "Failed to process resume file");
        }

        targetResumeId = uploadData.data?.resume?.id || uploadData.resume?.id;
      }

      if (!targetResumeId) {
        throw new Error("Unable to identify resume ID for ATS analysis");
      }

      // Step 2: Reserving credit...
      setAnalysisStep("Reserving credit...");
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: Trigger real ATS analysis via backend pipeline
      setAnalysisStep("Analyzing resume against job description...");
      const analysisRes = await apiFetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: targetResumeId,
          jobDescription: jobDescription.trim(),
        }),
      });

      const analysisData = await analysisRes.json();

      // Handle 402 Credits Exhausted error from authoritative server
      if (analysisRes.status === 402 || analysisData.error?.code === "CREDITS_EXHAUSTED") {
        setIsAnalyzing(false);
        setAnalysisStep("");
        setShowExhaustedModal(true);
        // Refresh credit balance
        getCredits().then(setCredits).catch(() => {});
        return;
      }

      if (!analysisRes.ok || !analysisData.success) {
        // Refresh credits so restored credit is accurately shown in UI
        getCredits().then(setCredits).catch(() => {});
        throw new Error(
          analysisData.error?.message ||
            "We couldn't complete the analysis. Your credit has been restored. Please try again."
        );
      }

      const analysisId = analysisData.data?.analysis?.id || analysisData.analysis?.id;
      setAnalysisStep("Finalizing analysis report...");

      // Step 4: Redirect to real results page
      router.push(`/results/${analysisId}`);
    } catch (err: any) {
      console.error("Analysis workflow error:", err);
      setError(err.message || "Failed to complete ATS analysis. Please try again.");
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const isUnlimited = credits?.isUnlimited;
  const isOutOfCredits = Boolean(credits && !isUnlimited && credits.balance <= 0);

  return (
    <DashboardLayout title="Analyze Resume">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1200px] mx-auto relative">
        {/* Credits Exhausted Modal */}
        {showExhaustedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#ECEFF8] relative animate-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => setShowExhaustedModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-5 mx-auto">
                <AlertTriangle size={28} />
              </div>

              <div className="text-center">
                <h3 className="text-[20px] font-black text-[#111827] tracking-tight">
                  Your ATS credits are used up
                </h3>
                <p className="text-[#64748B] text-[13.5px] mt-2 leading-relaxed">
                  You&apos;ve used all available ATS checks on your current plan. Upgrade to keep analyzing resumes.
                </p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 my-5 space-y-2.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] font-medium">Current plan</span>
                  <span className="font-bold text-[#111827] uppercase tracking-wide">
                    {credits?.plan || "Free"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] font-medium">Credits used</span>
                  <span className="font-extrabold text-[#DC2626]">
                    {credits?.used ?? 2} / {credits?.limit ?? 2}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B] font-medium">Remaining balance</span>
                  <span className="font-bold text-[#111827]">0 credits</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white font-bold text-[14px] py-3 rounded-xl transition-all shadow-md"
                >
                  <Crown size={16} className="text-[#FBBF24]" />
                  <span>Upgrade to Pro</span>
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href="/settings?tab=credits"
                  onClick={() => setShowExhaustedModal(false)}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#374151] font-semibold text-[13.5px] py-2.5 rounded-xl transition-colors"
                >
                  <History size={15} />
                  <span>View Credit History</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
          {/* Left column */}
          <div className="space-y-4">
            {/* Real Credit Status Banner */}
            <div className="bg-gradient-to-r from-[#EEF2FF] to-[#F5F3FF] dark:from-[#1E1B4B]/70 dark:to-[#17143A]/80 border border-[#C7D2FE] dark:border-[#3730A3] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4338CA] dark:bg-[#4F46E5] text-white flex items-center justify-center shrink-0">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-[#1E1B4B] dark:text-white">
                      {isUnlimited ? (
                        <span className="text-[#10B981] flex items-center gap-1">
                          <ShieldCheck size={16} /> Unlimited ATS Checks (Admin)
                        </span>
                      ) : (
                        `${credits?.balance ?? 2} / ${credits?.limit ?? 2} credits available`
                      )}
                    </span>
                    {!isUnlimited && (
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-[#1E223D] text-[#4338CA] dark:text-[#A5B4FC] border border-[#C7D2FE] dark:border-[#3730A3]">
                        {credits?.plan || "Free"} Plan
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#6366F1] dark:text-[#A5B4FC] mt-0.5">
                    {isUnlimited
                      ? "Owner access: checks never consume credits"
                      : "1 ATS evaluation consumes exactly 1 credit. Resume uploads are free."}
                  </p>
                </div>
              </div>

              {!isUnlimited && (
                <Link
                  href="/pricing"
                  className="text-[12px] font-bold text-[#4338CA] dark:text-[#818CF8] hover:underline self-start sm:self-center shrink-0 flex items-center gap-1"
                >
                  <span>Upgrade</span>
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {/* Quick Resume Selector if user has saved resumes */}
            {savedResumes.length > 0 && (
              <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
                <span className="text-[13px] font-semibold text-[#171725] dark:text-white">
                  Select from your saved resumes:
                </span>
                <select
                  value={selectedResumeId}
                  onChange={(e) => handleSelectSavedResume(e.target.value)}
                  className="text-[13px] border border-[#E5E3F2] dark:border-[#1E223D] rounded-lg px-3 py-1.5 bg-[#F8F7FF] dark:bg-[#181C33] text-[#171725] dark:text-white focus:outline-none focus:border-[#4F46E5]"
                >
                  <option value="">-- Or upload a new file below --</option>
                  {savedResumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.originalFileName} (Uploaded {new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <ResumeUpload
              uploadedFile={
                uploadedFile
                  ? { name: uploadedFile.name, size: uploadedFile.size }
                  : null
              }
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
            />

            <JobDescription
              value={jobDescription}
              onChange={setJobDescription}
            />

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 bg-[#FEF2F2] dark:bg-[#EF4444]/10 border border-[#FECACA] dark:border-[#EF4444]/30 rounded-xl px-4 py-3">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p className="text-[#DC2626] dark:text-[#F87171] text-[13px] font-medium">{error}</p>
              </div>
            )}

            {/* Analyze button & Loading status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-[#4F46E5] dark:text-[#818CF8] text-[13px] font-medium">
                  <LoaderIcon size={16} className="animate-spin" />
                  <span>{analysisStep || "Analyzing resume against job description..."}</span>
                </div>
              )}
              <div className="ml-auto w-full sm:w-auto">
                {isOutOfCredits ? (
                  <button
                    type="button"
                    onClick={() => setShowExhaustedModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold text-[14px] w-full sm:w-auto px-6 py-3 rounded-xl transition-colors shadow-sm"
                  >
                    <AlertTriangle size={16} />
                    <span>Credits Exhausted — Upgrade</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="inline-flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] w-full sm:w-auto px-6 py-3 rounded-xl transition-colors duration-150 shadow-sm"
                  >
                    {isAnalyzing ? (
                      <>
                        <LoaderIcon size={16} className="animate-spin" />
                        <span>{analysisStep || "Analyzing..."}</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} className="text-[#FDE047]" />
                        <span>Analyze Resume (1 Credit)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right column: real recent analysis or scoring guide */}
          <div className="sticky top-[72px]">
            {latestResult ? (
              <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl p-5 shadow-xs transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#171725] dark:text-white font-bold text-[15px]">Latest Analysis</h2>
                  <span className="bg-[#EFEDFF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {latestResult.matchLabel}
                  </span>
                </div>

                <div className="text-center py-4 mb-3 border-b border-[#F0EEFF] dark:border-[#1E223D]">
                  <span className="text-[36px] font-extrabold text-[#4F46E5] dark:text-[#818CF8] leading-none">
                    {latestResult.atsScore}
                  </span>
                  <span className="text-[14px] font-semibold text-[#8080A0] dark:text-[#94A3B8]"> / 100</span>
                  <p className="text-[12px] text-[#55556A] dark:text-[#94A3B8] mt-1 truncate">
                    {latestResult.jobTitle}
                  </p>
                </div>

                <ScoreBreakdown result={latestResult} compact={true} />
              </div>
            ) : (
              <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-xl p-5 shadow-xs transition-colors">
                <h2 className="text-[#171725] dark:text-white font-bold text-[15px] mb-3">ATS Evaluation Criteria</h2>
                <p className="text-[#55556A] dark:text-[#94A3B8] text-[13px] leading-relaxed mb-4">
                  Your resume is parsed and evaluated against standard Applicant Tracking System benchmarks:
                </p>
                <div className="space-y-2.5 text-[12.5px] text-[#404050] dark:text-[#CBD5E1]">
                  <div className="flex items-center justify-between py-1 border-b border-[#F4F4F8] dark:border-[#1E223D]">
                    <span>Keyword Match</span>
                    <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">25 pts max</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F4F4F8] dark:border-[#1E223D]">
                    <span>Technical Skills Match</span>
                    <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">20 pts max</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F4F4F8] dark:border-[#1E223D]">
                    <span>Experience Relevance</span>
                    <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">20 pts max</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F4F4F8] dark:border-[#1E223D]">
                    <span>Projects Alignment</span>
                    <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">15 pts max</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-[#F4F4F8] dark:border-[#1E223D]">
                    <span>Education Relevance</span>
                    <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">10 pts max</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Structure & Readability</span>
                    <span className="font-semibold text-[#4F46E5] dark:text-[#818CF8]">10 pts max</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
