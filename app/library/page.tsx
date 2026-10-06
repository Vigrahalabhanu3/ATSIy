"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  Eye,
  Check,
  CheckCircle2,
  Cloud,
  UploadCloud,
  FileUp,
  X,
  Download,
  Trash2,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { ResumeCardsSkeleton } from "@/components/ui/Skeleton";
import { apiFetch } from "@/lib/api/client";

interface RealResumeItem {
  id: string;
  name: string;
  fullName: string;
  type: "DOCX" | "PDF";
  size: string;
  sizeBytes: number;
  fileUrl: string;
  updatedAt: string;
  tags: { label: string; isMaster?: boolean }[];
  atsScore: number;
  keywordsMatched: number;
  totalKeywords: number;
  role: string;
  matchedKeywordsList: string[];
  missingKeywordsList: string[];
  extractedText?: string;
  parsedResume?: any;
  analysisCount?: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 KB";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function LibraryPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<RealResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "DOCX" | "PDF">("ALL");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<RealResumeItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [toastError, setToastError] = useState(false);
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch real resumes from backend
  const fetchResumes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/api/resumes?limit=50");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.data?.resumes || data.resumes)) {
        const rawList = data.data?.resumes || data.resumes;
        const formatted: RealResumeItem[] = rawList.map((r: any, idx: number) => {
          const extension = (r.fileType || "pdf").toUpperCase() as "DOCX" | "PDF";
          const skills: string[] = r.parsedResume?.skills || [];
          const matchedKeywords = skills.slice(0, 15);
          const name = r.originalFileName || "Resume.pdf";
          const shortName = name.length > 20 ? name.substring(0, 18) + "..." : name;
          const score = r.latestScore ?? 0;

          return {
            id: r.id,
            name: shortName,
            fullName: name,
            type: extension === "DOCX" ? "DOCX" : "PDF",
            size: formatBytes(r.fileSize),
            sizeBytes: r.fileSize || 0,
            fileUrl: r.fileUrl,
            updatedAt: new Date(r.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            tags: [
              ...(idx === 0 ? [{ label: "Default Master", isMaster: true }] : []),
              { label: `v1.${idx}`, isMaster: false },
            ],
            atsScore: score,
            keywordsMatched: matchedKeywords.length,
            totalKeywords: Math.max(matchedKeywords.length, 10),
            role: r.parsedResume?.experience?.[0]?.role || r.parsedResume?.name || "Professional Profile",
            matchedKeywordsList: matchedKeywords,
            missingKeywordsList: [],
            extractedText: r.extractedText,
            parsedResume: r.parsedResume,
            analysisCount: r.analysisCount || 0,
          };
        });
        setResumes(formatted);
        if (formatted.length > 0 && !masterResumeId) {
          setMasterResumeId(formatted[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching resumes:", err);
    } finally {
      setLoading(false);
    }
  }, [router, masterResumeId]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  // Master resume
  const masterResume =
    resumes.find((r) => r.id === masterResumeId) || resumes[0];

  // Filtering resumes
  const filteredResumes = resumes.filter((item) => {
    const matchesSearch =
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      filterType === "ALL" ? true : item.type === filterType;

    return matchesSearch && matchesType;
  });

  // Calculate real total storage used
  const totalSizeBytes = resumes.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const totalStorageFormatted = formatBytes(totalSizeBytes);
  const storagePercentage = Math.min(100, Math.round((totalSizeBytes / (50 * 1024 * 1024)) * 100));

  // Calculate average ATS score for resumes that have analyses
  const scoredResumes = resumes.filter((r) => r.atsScore > 0);
  const avgScore =
    scoredResumes.length > 0
      ? Math.round(
          scoredResumes.reduce((acc, curr) => acc + curr.atsScore, 0) /
            scoredResumes.length
        )
      : 0;

  // Handle setting a file as Default Master
  const handleSetMaster = (id: string) => {
    setMasterResumeId(id);
    setActiveMenuId(null);
  };

  // Real delete from Cloudinary + MongoDB
  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/api/resumes/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResumes((prev) => prev.filter((item) => item.id !== id));
        setToastError(false);
        setUploadToast("Resume deleted successfully.");
      } else {
        setToastError(true);
        setUploadToast(data.error?.message || "Failed to delete resume.");
      }
    } catch (err) {
      console.error("Error deleting resume:", err);
      setToastError(true);
      setUploadToast("Network error deleting resume.");
    } finally {
      setActiveMenuId(null);
      setTimeout(() => setUploadToast(null), 4000);
    }
  };

  // Real file uploads to /api/resumes
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "docx"].includes(extension)) {
      setToastError(true);
      setUploadToast("Only PDF and DOCX files are supported.");
      setTimeout(() => setUploadToast(null), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToastError(true);
      setUploadToast("File exceeds the 5MB maximum limit.");
      setTimeout(() => setUploadToast(null), 4000);
      return;
    }

    try {
      setIsUploading(true);
      setToastError(false);
      setUploadToast(`Uploading and extracting text from "${file.name}"...`);

      const formData = new FormData();
      formData.append("file", file);

      const res = await apiFetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Upload failed");
      }

      setToastError(false);
      setUploadToast(`"${file.name}" parsed and saved successfully!`);
      // Refresh real resumes list
      await fetchResumes();
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setToastError(true);
      setUploadToast(err.message || "Failed to upload and parse resume.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadToast(null), 5000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="px-6 lg:px-10 py-6 max-w-[1340px] mx-auto min-h-screen">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Upload Toast Notification */}
        {uploadToast && (
          <div
            className={`fixed bottom-6 right-6 z-50 text-white px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              toastError
                ? "bg-[#991B1B] border-[#DC2626]"
                : "bg-[#15173A] border-[#3B34D1]"
            }`}
          >
            {isUploading ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : toastError ? (
              <X size={18} className="text-[#FCA5A5]" />
            ) : (
              <CheckCircle2 size={18} className="text-[#4CD964]" />
            )}
            <span className="text-sm font-medium">{uploadToast}</span>
            <button
              onClick={() => setUploadToast(null)}
              className="text-gray-400 hover:text-white ml-2"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[#111827] dark:text-white font-bold text-[24px] sm:text-[26px] tracking-tight">
              Resume Library
            </h1>
            <p className="text-[#64748B] dark:text-gray-400 text-[13.5px] mt-0.5">
              Manage your base resumes, PDF/DOCX files, and parsed metadata
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 bg-[#3D37D0] hover:bg-[#342EB8] disabled:opacity-60 text-white font-semibold text-[13.5px] px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileUp size={16} />
            )}
            <span>{isUploading ? "Uploading..." : "Upload New Resume"}</span>
          </button>
        </div>

        {/* Quota & Storage Banner Card */}
        <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 mb-7 transition-colors">
          {/* Storage & Quota */}
          <div className="flex items-center gap-3.5 min-w-[240px]">
            <div className="w-11 h-11 rounded-xl bg-[#453DE0] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Cloud size={22} className="fill-white stroke-none" />
            </div>
            <div>
              <div className="text-[10.5px] font-bold text-[#64748B] dark:text-gray-400 tracking-wider uppercase">
                STORAGE & QUOTA
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[18px] font-bold text-[#111827] dark:text-white">
                  {totalStorageFormatted}
                </span>
                <span className="text-[13px] font-normal text-[#64748B] dark:text-gray-400">
                  / 50 MB used
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-36 h-2 bg-[#E2E6F2] dark:bg-[#1E223D] rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-[#3B34D1] rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, storagePercentage)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Total Resumes */}
          <div className="min-w-[130px]">
            <div className="text-[13px] text-[#64748B] dark:text-gray-400 font-medium">
              Total Resumes
            </div>
            <div className="text-[16px] font-bold text-[#111827] dark:text-white mt-0.5">
              {resumes.length} {resumes.length === 1 ? "File" : "Files"}
            </div>
          </div>

          {/* Default Variant */}
          <div className="min-w-[200px]">
            <div className="text-[13px] text-[#64748B] dark:text-gray-400 font-medium">
              Default Variant
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CheckCircle2 size={15} className="text-[#3533D6] dark:text-indigo-400 shrink-0" />
              <span className="text-[#3533D6] dark:text-indigo-400 font-semibold text-[13.5px] truncate max-w-[180px]">
                {masterResume ? masterResume.fullName : "None Selected"}
              </span>
            </div>
          </div>

          {/* Parsed Score Avg */}
          <div className="min-w-[140px]">
            <div className="text-[13px] text-[#64748B] dark:text-gray-400 font-medium">
              Parsed Score Avg
            </div>
            <div className="text-[16px] font-bold text-[#111827] dark:text-white mt-0.5">
              {avgScore > 0 ? `${avgScore}% ATS` : "No scores yet"}
            </div>
          </div>
        </div>

        {/* Section Title & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[#111827] dark:text-white font-bold text-[16px]">All Files</h2>
            <span className="bg-[#ECEEF5] dark:bg-[#1E223D] text-[#555E6D] dark:text-gray-300 text-[12px] font-semibold px-2.5 py-0.5 rounded-full">
              {filteredResumes.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 relative">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#F3F4F9] dark:bg-[#1E223D] text-[13px] text-[#111827] dark:text-white placeholder:text-[#9CA3AF] dark:placeholder:text-gray-500 rounded-xl pl-9 pr-3 py-2 w-56 sm:w-64 border-none focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white dark:focus:bg-[#161933] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F3F4F9] dark:bg-[#1E223D] hover:bg-[#EAEBF3] dark:hover:bg-[#252A4A] text-[#374151] dark:text-gray-200 rounded-xl text-[13px] font-medium transition-colors cursor-pointer"
              >
                <SlidersHorizontal size={14} />
                <span>Filter</span>
              </button>

              {/* Filter Dropdown */}
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#161933] rounded-xl shadow-lg border border-[#ECEFF8] dark:border-[#1E223D] py-2 z-30">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Format
                  </div>
                  <button
                    onClick={() => {
                      setFilterType("ALL");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1F2447] ${
                      filterType === "ALL" ? "text-[#3D37D0] dark:text-indigo-400 font-semibold" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span>All Formats</span>
                    {filterType === "ALL" && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("DOCX");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1F2447] ${
                      filterType === "DOCX" ? "text-[#3D37D0] dark:text-indigo-400 font-semibold" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span>DOCX Resumes</span>
                    {filterType === "DOCX" && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => {
                      setFilterType("PDF");
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1F2447] ${
                      filterType === "PDF" ? "text-[#3D37D0] dark:text-indigo-400 font-semibold" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <span>PDF Resumes</span>
                    {filterType === "PDF" && <Check size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="my-4">
            <ResumeCardsSkeleton />
          </div>
        )}

        {/* Empty state when user has no resumes at all */}
        {!loading && resumes.length === 0 && (
          <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-12 text-center border border-[#ECEFF8] dark:border-[#1E223D] my-4">
            <div className="w-12 h-12 rounded-full bg-[#EFEDFF] dark:bg-[#1E223D] text-[#453DE0] dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <UploadCloud size={24} />
            </div>
            <h3 className="text-[#111827] dark:text-white font-bold text-[17px] mb-1">No resumes yet</h3>
            <p className="text-[#64748B] dark:text-gray-400 text-[13.5px] max-w-sm mx-auto mb-5">
              Upload your first resume to get started. We will extract text and parse sections ready for ATS evaluation.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#3D37D0] hover:bg-[#342EB8] text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Upload Resume
            </button>
          </div>
        )}

        {/* Empty state when filtering */}
        {!loading && resumes.length > 0 && filteredResumes.length === 0 && (
          <div className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-12 text-center border border-[#ECEFF8] dark:border-[#1E223D] my-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No resumes found matching &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterType("ALL");
              }}
              className="mt-3 text-xs font-semibold text-[#3D37D0] dark:text-indigo-400 hover:underline"
            >
              Reset search & filter
            </button>
          </div>
        )}

        {/* Resume Cards Grid */}
        {!loading && filteredResumes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResumes.map((resume) => {
              const isHigh = resume.atsScore >= 90;
              const isMenuOpen = activeMenuId === resume.id;
              const isCurrentMaster = resume.id === masterResumeId;

              return (
                <div
                  key={resume.id}
                  className="bg-[#F6F7FD] dark:bg-[#121528] rounded-2xl p-5 border border-[#ECEFF8] dark:border-[#1E223D] flex flex-col justify-between transition-all duration-150 hover:shadow-sm relative"
                >
                  <div>
                    {/* Top Header Row */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Format Badge */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded tracking-wide shrink-0 ${
                            resume.type === "DOCX"
                              ? "bg-[#EDE9FE] dark:bg-[#272052] text-[#5542F6] dark:text-[#A78BFA]"
                              : "bg-[#FEEAEA] dark:bg-[#451A1A] text-[#EF4444] dark:text-[#F87171]"
                          }`}
                        >
                          {resume.type}
                        </span>

                        {/* Title & Metadata */}
                        <div className="min-w-0">
                          <h3
                            className="font-bold text-[14.5px] text-[#111827] dark:text-white truncate"
                            title={resume.fullName}
                          >
                            {resume.name}
                          </h3>
                          <p className="text-[11.5px] text-[#6B7280] dark:text-gray-400 mt-0.5">
                            {resume.size} • {resume.updatedAt}
                          </p>
                        </div>
                      </div>

                      {/* 3-Dot Action Menu */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          aria-label="Resume options"
                          onClick={() =>
                            setActiveMenuId(isMenuOpen ? null : resume.id)
                          }
                          className="p-1 rounded-md text-[#9CA3AF] hover:text-[#374151] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-[#161933] rounded-xl shadow-lg border border-[#ECEFF8] dark:border-[#1E223D] py-1.5 z-20">
                            <button
                              onClick={() => {
                                setPreviewResume(resume);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1F2447] flex items-center gap-2"
                            >
                              <Eye size={13} />
                              <span>View Details</span>
                            </button>

                            <button
                              onClick={() => handleSetMaster(resume.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1F2447] flex items-center gap-2"
                            >
                              <Check size={13} />
                              <span>Set as Master</span>
                            </button>

                            <button
                              onClick={() => {
                                if (resume.fileUrl) {
                                  window.open(resume.fileUrl, "_blank");
                                }
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1F2447] flex items-center gap-2"
                            >
                              <Download size={13} />
                              <span>Download File</span>
                            </button>

                            <div className="h-px bg-gray-100 dark:bg-[#1E223D] my-1" />

                            <button
                              onClick={() => handleDelete(resume.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role & Tags */}
                    <div className="mt-3">
                      <p className="text-[12.5px] font-semibold text-[#111827] dark:text-white truncate">
                        {resume.role}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {isCurrentMaster && (
                          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-[#E0E7FF] dark:bg-[#27265B] text-[#3730A3] dark:text-indigo-300">
                            Default Master
                          </span>
                        )}
                        <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#ECEEF5] dark:bg-[#1E223D] text-[#4B5563] dark:text-gray-300">
                          {resume.analysisCount || 0} analyses
                        </span>
                      </div>
                    </div>

                    {/* ATS Score / Details */}
                    <div className="mt-4 pt-3 border-t border-[#E5E7EB]/60 dark:border-[#1E223D]">
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <span className="text-[#64748B] dark:text-gray-400">
                          {resume.atsScore > 0 ? "Latest ATS Match" : "Keywords Extracted"}
                        </span>
                        <span className="font-bold text-[#111827] dark:text-white">
                          {resume.atsScore > 0 ? `${resume.atsScore}%` : `${resume.keywordsMatched} items`}
                        </span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full h-1.5 bg-[#E2E6F2] dark:bg-[#1E223D] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isHigh ? "bg-[#10B981]" : "bg-[#3D37D0]"
                          }`}
                          style={{
                            width: `${resume.atsScore > 0 ? resume.atsScore : Math.min(100, resume.keywordsMatched * 6)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setPreviewResume(resume)}
                      className="flex-1 text-center py-2 px-3 bg-white dark:bg-[#1A1E36] hover:bg-gray-50 dark:hover:bg-[#232948] border border-[#D1D5DB] dark:border-[#2A3158] text-[#374151] dark:text-gray-200 rounded-xl text-[12.5px] font-semibold transition-colors shadow-2xs"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push(`/analyze?resumeId=${resume.id}`)}
                      className="flex-1 text-center py-2 px-3 bg-[#3D37D0] hover:bg-[#342EB8] text-white rounded-xl text-[12.5px] font-semibold transition-colors shadow-2xs"
                    >
                      Analyze
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`mt-6 border-2 border-dashed rounded-2xl p-9 flex flex-col items-center justify-center text-center transition-all duration-150 ${
            isDragging
              ? "border-[#453DE0] bg-[#EFEDFF] dark:bg-[#1F1F47]"
              : "border-[#D2D6E6] dark:border-[#1E223D] bg-[#F9FAFE] dark:bg-[#121528] hover:border-[#453DE0]/50"
          }`}
        >
          {/* Cloud Circle Icon */}
          <div className="w-12 h-12 rounded-full bg-[#4338CA] text-white flex items-center justify-center mb-3.5 shadow-sm">
            <UploadCloud size={22} className="text-white" />
          </div>

          <h3 className="font-bold text-[15px] text-[#111827] dark:text-white mb-1">
            Drag and drop your resume files here
          </h3>

          <p className="text-[12.5px] text-[#64748B] dark:text-gray-400 max-w-lg mb-4 leading-relaxed">
            Supports PDF and DOCX formats up to 5MB. Files are securely uploaded and extracted for ATS evaluation.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-white dark:bg-[#1A1E36] border border-[#D1D5DB] dark:border-[#2A3158] hover:bg-gray-50 dark:hover:bg-[#232948] text-[#1F2937] dark:text-gray-200 text-[13px] font-semibold px-5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Browse Files from Computer
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewResume(null)}
        >
          <div
            className="bg-white dark:bg-[#121528] border border-gray-100 dark:border-[#1E223D] rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-[#1E223D]">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    previewResume.type === "DOCX"
                      ? "bg-[#EDE9FE] dark:bg-[#272052] text-[#5542F6] dark:text-[#A78BFA]"
                      : "bg-[#FEEAEA] dark:bg-[#451A1A] text-[#EF4444] dark:text-[#F87171]"
                  }`}
                >
                  {previewResume.type}
                </span>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">
                    {previewResume.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {previewResume.role} • {previewResume.size} • Uploaded {previewResume.updatedAt}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewResume(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1A1E36]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Extracted Skills */}
            {previewResume.matchedKeywordsList.length > 0 && (
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                  Extracted Skills & Keywords ({previewResume.matchedKeywordsList.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {previewResume.matchedKeywordsList.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#EEF2FF] dark:bg-[#1F2248] text-[#3730A3] dark:text-indigo-300 text-xs font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracted text snippet */}
            {previewResume.extractedText && (
              <div className="mt-5">
                <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Extracted Resume Text Preview
                </h4>
                <div className="bg-[#F9FAFB] dark:bg-[#0E1122] rounded-xl p-3 border border-gray-200 dark:border-[#1E223D] text-xs text-gray-700 dark:text-gray-300 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {previewResume.extractedText.slice(0, 1500)}
                  {previewResume.extractedText.length > 1500 ? "..." : ""}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-[#1E223D]">
              <button
                type="button"
                onClick={() => setPreviewResume(null)}
                className="px-4 py-2 border border-gray-200 dark:border-[#1E223D] text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[#1A1E36]"
              >
                Close
              </button>
              {previewResume.fileUrl && (
                <a
                  href={previewResume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 dark:bg-[#1E223D] text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-[#252A4A] inline-flex items-center gap-1.5"
                >
                  <Download size={13} />
                  Download File
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  router.push(`/analyze?resumeId=${previewResume.id}`);
                }}
                className="px-4 py-2 bg-[#3D37D0] hover:bg-[#342EB8] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles size={13} />
                Analyze with ATSly
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
