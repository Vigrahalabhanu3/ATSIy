"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Check,
  CheckCircle2,
  X,
  FileText,
  Search,
  ArrowRightLeft,
  FileEdit,
  Columns,
  BarChart3,
  FolderSync,
  Download,
  RotateCw,
  Star,
  Shield,
  Layers,
  Cpu,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState<"fullstack" | "pm" | "ds">("fullstack");
  const [acceptedFix, setAcceptedFix] = useState(false);

  // Playground roles data
  const rolesData = {
    fullstack: {
      score: 91,
      title: "Senior Full Stack Engineer",
      matchBadge: "High Match",
      description: "Candidate meets 8 of 9 essential core systems & API requirements.",
      matched: [
        "TypeScript & React",
        "Node.js Microservices",
        "PostgreSQL & Redis",
        "Docker & CI/CD",
      ],
      missing: ["Terraform IaC", "GraphQL Schema"],
    },
    pm: {
      score: 87,
      title: "Lead Product Manager",
      matchBadge: "Strong Match",
      description: "Candidate meets 7 of 8 agile roadmap & user analytics requirements.",
      matched: [
        "Product Lifecycle (PLM)",
        "User Retention Funnels",
        "A/B Experimentation",
        "Cross-Functional Sprint Planning",
      ],
      missing: ["SQL Cohort Analysis", "B2B SaaS Pricing"],
    },
    ds: {
      score: 94,
      title: "Senior Machine Learning Engineer",
      matchBadge: "Top Tier",
      description: "Candidate meets 9 of 10 model training & distributed inference requirements.",
      matched: [
        "PyTorch & Transformers",
        "MLOps & Kubeflow",
        "Vector Embeddings (Pinecone)",
        "Distributed GPU Training",
      ],
      missing: ["CUDA Optimization"],
    },
  };

  const activeRole = rolesData[selectedRole];

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* 1. Header Navbar (Image 3) */}
      <header className="h-[76px] px-6 lg:px-12 flex items-center justify-between border-b border-[#ECEFF8] bg-white sticky top-0 z-40">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#453DE0] text-white flex items-center justify-center font-extrabold text-[16px] shadow-xs">
            A
          </div>
          <span className="text-[#15173A] font-extrabold text-[20px] tracking-tight">
            ATSly
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-[13.5px] font-medium text-[#4B5563]">
          <a href="#features" className="hover:text-[#111827] transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-[#111827] transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-[#111827] transition-colors">
            Pricing
          </a>
          <a href="#reviews" className="hover:text-[#111827] transition-colors">
            Reviews
          </a>
          <a href="#faq" className="hover:text-[#111827] transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/login"
            className="text-[13.5px] font-semibold text-[#4B5563] hover:text-[#111827] px-2 py-1 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-[#453DE0] hover:bg-[#3B33D1] text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            Get Started Free
          </Link>
          <Link
            href="/settings"
            aria-label="User profile"
            className="w-8 h-8 rounded-full bg-[#3C38CA] flex items-center justify-center text-white hover:bg-[#322EB8] transition-colors"
          >
            <span className="text-xs font-semibold">JD</span>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section (Image 3) */}
      <section className="pt-12 pb-16 px-6 lg:px-8 max-w-[1240px] mx-auto text-center">
        {/* Release Announcement Badge */}
        <div className="inline-flex items-center gap-2 bg-[#EEF2FF] text-[#453DE0] text-[12px] font-semibold px-3.5 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-[#453DE0] animate-pulse" />
          <span className="font-bold">NEW RELEASE</span>
          <span className="text-gray-400">•</span>
          <span>AI Resume Scoring Engine 3.0 is live — 99.4% ATS Parsing Accuracy</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-[38px] sm:text-[48px] lg:text-[56px] font-extrabold text-[#111827] tracking-tight leading-[1.12] max-w-4xl mx-auto">
          Land More Interviews with an{" "}
          <span className="text-[#453DE0]">ATS-Optimized</span> Resume.
        </h1>

        {/* Subtitle */}
        <p className="text-[#64748B] text-[15px] sm:text-[17px] max-w-2xl mx-auto mt-5 leading-relaxed">
          Scan your resume against any target job description in 5 seconds. Pinpoint
          missing keywords, benchmark hard skills, and generate executive-grade
          quantified bullet point rewrites automatically.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#453DE0] hover:bg-[#3B33D1] text-white font-semibold text-[14.5px] px-6 py-3 rounded-xl transition-all shadow-md"
          >
            <span>Analyze Your Resume Free</span>
            <ArrowRight size={16} />
          </Link>

          <a
            href="#playground"
            className="inline-flex items-center gap-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#374151] font-semibold text-[14px] px-5 py-3 rounded-xl transition-colors shadow-xs"
          >
            <Play size={14} className="fill-[#453DE0] text-[#453DE0]" />
            <span>Explore Live ATS Simulator</span>
          </a>
        </div>

        {/* Trust Checklist */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-6 text-[12.5px] font-medium text-[#4B5563]">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#453DE0]" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#453DE0]" />
            Instant ATS format score
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-[#453DE0]" />
            Works with Greenhouse, Lever &amp; Workday
          </span>
        </div>

        {/* Company Logos */}
        <div className="mt-14 pt-8 border-t border-[#F1F3F9]">
          <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-6">
            TRUSTED BY 45,000+ CANDIDATES HIRED AT INDUSTRY LEADERS
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-14 opacity-60 grayscale hover:grayscale-0 transition-all">
            {/* Google */}
            <span className="font-bold text-lg text-gray-700 tracking-tighter">Google</span>
            {/* Microsoft */}
            <span className="font-bold text-lg text-gray-700 tracking-tight">Microsoft</span>
            {/* Amazon */}
            <span className="font-bold text-lg text-gray-700">amazon</span>
            {/* GitHub */}
            <span className="font-bold text-lg text-gray-700">GitHub</span>
            {/* Stripe */}
            <span className="font-bold text-lg text-gray-700">stripe</span>
          </div>
        </div>

        {/* Interactive Resume Demo Card (Alex Chen Preview from Image 3) */}
        <div className="mt-12 bg-white rounded-2xl border border-[#ECEFF8] p-6 lg:p-7 shadow-lg text-left max-w-[1040px] mx-auto">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#F1F3F9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[15px] text-[#111827]">
                    Alex_Chen_Senior_Engineer_2025.pdf
                  </h3>
                  <span className="bg-[#ECEEF5] text-[#555E6D] text-[11px] font-semibold px-2 py-0.5 rounded">
                    v3.2
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Target: Senior Distributed Systems Architect @ Stripe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-1.5 bg-[#EDE9FE] hover:bg-[#E0DBFF] text-[#453DE0] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Sparkles size={13} />
                <span>Instant Re-scan</span>
              </Link>
              <button
                type="button"
                onClick={() => alert("Downloading ATS PDF...")}
                className="inline-flex items-center gap-1.5 bg-[#453DE0] hover:bg-[#3B33D1] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                <Download size={13} />
                <span>Export ATS PDF</span>
              </button>
            </div>
          </div>

          {/* Card Body: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
            {/* Left: ATS Match Score & Breakdown */}
            <div className="lg:col-span-4 bg-[#F8F9FE] rounded-2xl p-5 border border-[#ECEFF8] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-[14.5px] text-[#111827]">
                    ATS Match Score
                  </span>
                  <span className="bg-[#EDE9FE] text-[#453DE0] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    Top 5% Tier
                  </span>
                </div>

                {/* Score Circle */}
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="w-28 h-28 rounded-full border-8 border-[#453DE0] border-t-[#D2D6F5] flex flex-col items-center justify-center shadow-xs">
                    <span className="text-3xl font-extrabold text-[#111827]">88</span>
                    <span className="text-[10px] font-bold text-[#453DE0] tracking-wider uppercase">
                      STRONG MATCH
                    </span>
                  </div>
                  <p className="text-xs text-[#453DE0] font-semibold mt-3 flex items-center gap-1">
                    Predicted interview invitation probability: 84% ↑
                  </p>
                </div>

                {/* Metric Bars */}
                <div className="space-y-3 mt-4 text-xs font-medium">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Hard Skills Alignment</span>
                      <span className="font-bold text-gray-900">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E6F2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#453DE0] rounded-full w-[92%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">Action Verb &amp; Quant Metrics</span>
                      <span className="font-bold text-gray-900">84%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E6F2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#453DE0] rounded-full w-[84%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-600">ATS Layout &amp; Section Parsability</span>
                      <span className="font-bold text-gray-900">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#E2E6F2] rounded-full overflow-hidden">
                      <div className="h-full bg-[#453DE0] rounded-full w-[100%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Cross-Analysis & AI Bullet Rewriter */}
            <div className="lg:col-span-8 space-y-5">
              {/* Target Keyword Cross-Analysis */}
              <div className="bg-[#F8F9FE] rounded-2xl p-5 border border-[#ECEFF8]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[14px] text-[#111827]">
                    Target Keyword Cross-Analysis
                  </h4>
                  <span className="text-xs text-gray-500">Parsed 28 job criteria</span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ✓ Kubernetes (EKS)
                  </span>
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ✓ Golang Microservices
                  </span>
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ✓ High-Throughput Kafka
                  </span>
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ✓ PostgreSQL Sharding
                  </span>
                  <span className="bg-[#FEE2E2] text-[#B91C1C] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ! Distributed Tracing (Missing)
                  </span>
                  <span className="bg-[#FEE2E2] text-[#B91C1C] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ! gRPC Contracts (Missing)
                  </span>
                  <span className="bg-[#E0F2FE] text-[#0369A1] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                    ✓ AWS IAM Security
                  </span>
                </div>
              </div>

              {/* Recruiter-Grade AI Bullet Rewriter */}
              <div className="bg-[#F8F9FE] rounded-2xl p-5 border border-[#ECEFF8]">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[14px] text-[#111827]">
                    Recruiter-Grade AI Bullet Rewriter
                  </h4>
                  <span className="text-xs text-[#453DE0] font-semibold flex items-center gap-1">
                    <Zap size={12} />
                    Quantified Impact Formula
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {/* Original */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                    <div className="text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1">
                      ✕ ORIGINAL BULLET POINT
                    </div>
                    <p className="text-gray-700 leading-relaxed italic">
                      &quot;Responsible for managing AWS cloud servers and maintaining our database
                      clusters to ensure high uptime.&quot;
                    </p>
                    <div className="mt-3 text-[11px] text-gray-500 font-medium">
                      <span className="font-bold text-gray-700">ATS Weakness:</span> Vague action
                      verbs, no hard numbers.
                    </div>
                  </div>

                  {/* Optimized */}
                  <div className="bg-white p-3.5 rounded-xl border border-[#C7D2FE] relative">
                    <div className="text-[11px] font-bold text-[#453DE0] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      OPTIMIZED WITH ATSLY AI
                    </div>
                    <p className="text-gray-900 leading-relaxed">
                      &quot;Orchestrated 14 multi-region{" "}
                      <span className="bg-indigo-100 text-[#453DE0] px-1 rounded font-semibold">
                        AWS EKS
                      </span>{" "}
                      microservices, optimizing auto-scaling rules to achieve{" "}
                      <span className="bg-indigo-100 text-[#453DE0] px-1 rounded font-semibold">
                        99.99% uptime
                      </span>{" "}
                      and reducing latency by{" "}
                      <span className="bg-indigo-100 text-[#453DE0] px-1 rounded font-semibold">
                        34%
                      </span>
                      .&quot;
                    </p>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[11px] font-bold text-emerald-600">
                        +38 ATS Score Impact
                      </span>
                      <button
                        type="button"
                        onClick={() => setAcceptedFix(true)}
                        className={`px-3 py-1 text-[11.5px] font-semibold rounded-lg transition-all ${
                          acceptedFix
                            ? "bg-emerald-600 text-white"
                            : "bg-[#453DE0] hover:bg-[#3B33D1] text-white"
                        }`}
                      >
                        {acceptedFix ? "Applied ✓" : "Accept AI Fix"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (Image 4) */}
      <section id="how-it-works" className="py-20 px-6 lg:px-8 bg-[#F8F9FE] border-t border-[#ECEFF8]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="text-[11px] font-bold text-[#453DE0] uppercase tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="text-[32px] sm:text-[38px] font-extrabold text-[#111827] mt-1.5 tracking-tight">
              Beat the automated screening filter in 3 straightforward steps
            </h2>
            <p className="text-[#64748B] text-[15px] max-w-2xl mx-auto mt-2">
              Applicant tracking systems automatically discard up to 75% of qualified resumes.
              Here is how ATSly guarantees your resume bypasses the filter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01 */}
            <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block bg-[#EEF2FF] text-[#453DE0] font-extrabold text-sm px-3 py-1 rounded-lg mb-4">
                  01
                </span>
                <h3 className="font-bold text-[18px] text-[#111827] mb-2">
                  Upload Resume File
                </h3>
                <p className="text-[#64748B] text-[13.5px] leading-relaxed">
                  Drop your existing PDF or DOCX file. ATSly&apos;s multi-tier parser extracts text,
                  nested contact blocks, chronological work experience, and educational tables
                  without data loss.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-[#453DE0] font-semibold">
                <FileText size={15} />
                <span>Universal Compatibility: PDF, DOCX, TXT support</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block bg-[#EEF2FF] text-[#453DE0] font-extrabold text-sm px-3 py-1 rounded-lg mb-4">
                  02
                </span>
                <h3 className="font-bold text-[18px] text-[#111827] mb-2">
                  Target Job Matching
                </h3>
                <p className="text-[#64748B] text-[13.5px] leading-relaxed">
                  Paste the target job description or drop a direct URL from LinkedIn, Indeed, or
                  Greenhouse. Our NLP cross-checks exact taxonomy, required years of experience,
                  and hard credentials.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-[#453DE0] font-semibold">
                <Search size={15} />
                <span>Dual-Vector Scoring: Semantics + Exact Match</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block bg-[#453DE0] text-white font-extrabold text-sm px-3 py-1 rounded-lg mb-4 shadow-xs">
                  03
                </span>
                <h3 className="font-bold text-[18px] text-[#111827] mb-2">
                  Apply 1-Click Fixes
                </h3>
                <p className="text-[#64748B] text-[13.5px] leading-relaxed">
                  Generate tailored bullet points, fix formatting flaws like multi-column headers,
                  inject missing technical keywords naturally, and download an ATS-compliant resume
                  instantly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-[#453DE0] font-semibold">
                <Sparkles size={15} />
                <span>Recruiter-Grade Output: Single-click PDF/Word export</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Enterprise ATS Technology Features (Image 4) */}
      <section id="features" className="py-20 px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold text-[#453DE0] uppercase tracking-wider">
            ENGINEERED FOR ACCURACY
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-extrabold text-[#111827] mt-1.5 tracking-tight">
            Enterprise ATS technology in your hands
          </h2>
          <p className="text-[#64748B] text-[15px] max-w-2xl mx-auto mt-2">
            Every feature is modeled directly on the proprietary parsing engines used by enterprise
            recruiting platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center mb-4">
              <Search size={20} />
            </div>
            <h3 className="font-bold text-[16px] text-[#111827] mb-2">
              ATS Keyword Parsing
            </h3>
            <p className="text-[#64748B] text-[13px] leading-relaxed mb-4">
              Detects required keyword frequencies, synonyms, and acronym expansions (e.g. AWS ↔
              Amazon Web Services) to guarantee search indexation by human recruiters.
            </p>
            <Link
              href="/analyze"
              className="text-xs font-semibold text-[#453DE0] hover:underline flex items-center gap-1"
            >
              <span>Learn about parsing models</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center mb-4">
              <ArrowRightLeft size={20} />
            </div>
            <h3 className="font-bold text-[16px] text-[#111827] mb-2">
              Real-Time Cross Matching
            </h3>
            <p className="text-[#64748B] text-[13px] leading-relaxed mb-4">
              Side-by-side comparison reveals the precise match coefficient between your resume
              summary and the hiring team&apos;s required competencies.
            </p>
            <Link
              href="/analyze"
              className="text-xs font-semibold text-[#453DE0] hover:underline flex items-center gap-1"
            >
              <span>Explore matching logic</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center mb-4">
              <FileEdit size={20} />
            </div>
            <h3 className="font-bold text-[16px] text-[#111827] mb-2">
              Action Verb Rewriter
            </h3>
            <p className="text-[#64748B] text-[13px] leading-relaxed mb-4">
              Transforms passive duties (&quot;responsible for sales calls&quot;) into executive-grade,
              metric-backed impact statements (&quot;drove $1.4M ARR expansion across 40 accounts&quot;).
            </p>
            <Link
              href="/analyze"
              className="text-xs font-semibold text-[#453DE0] hover:underline flex items-center gap-1"
            >
              <span>See bullet examples</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center mb-4">
              <Columns size={20} />
            </div>
            <h3 className="font-bold text-[16px] text-[#111827] mb-2">
              Multi-Column Health Check
            </h3>
            <p className="text-[#64748B] text-[13px] leading-relaxed mb-4">
              Flags dangerous two-column layouts, inaccessible SVG icons, invisible text hacks, and
              table headers that cause traditional ATS parsers to scramble content.
            </p>
            <Link
              href="/analyze"
              className="text-xs font-semibold text-[#453DE0] hover:underline flex items-center gap-1"
            >
              <span>Check parsing risks</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="font-bold text-[16px] text-[#111827] mb-2">
              Skills Gap Benchmark
            </h3>
            <p className="text-[#64748B] text-[13px] leading-relaxed mb-4">
              Separates required hard tools (Python, Docker, SQL) from leadership and operational
              skills, giving you a precise roadmap for immediate resume customization.
            </p>
            <Link
              href="/reports"
              className="text-xs font-semibold text-[#453DE0] hover:underline flex items-center gap-1"
            >
              <span>View skills taxonomy</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-7 border border-[#ECEFF8] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#453DE0] flex items-center justify-center mb-4">
              <FolderSync size={20} />
            </div>
            <h3 className="font-bold text-[16px] text-[#111827] mb-2">
              Multi-Variant Management
            </h3>
            <p className="text-[#64748B] text-[13px] leading-relaxed mb-4">
              Manage and organize distinct resume variants for different career paths (e.g.
              Engineering Lead vs. Solutions Architect) under one unified dashboard.
            </p>
            <Link
              href="/library"
              className="text-xs font-semibold text-[#453DE0] hover:underline flex items-center gap-1"
            >
              <span>Organize applications</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Interactive Playground (Image 2) */}
      <section id="playground" className="py-20 px-6 lg:px-8 bg-[#F8F9FE] border-t border-[#ECEFF8]">
        <div className="max-w-[1040px] mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-[#453DE0] text-[11.5px] font-bold px-3 py-1 rounded-full mb-3">
            <Sparkles size={12} />
            Interactive Playground
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-extrabold text-[#111827] tracking-tight">
            Test your resume in real time against sample roles
          </h2>
          <p className="text-[#64748B] text-[15px] max-w-2xl mx-auto mt-2 mb-8">
            Select a sample role below to see how ATSly&apos;s scoring engine calculates match rates
            and identifies critical missing keywords dynamically.
          </p>

          {/* Role Filter Tabs */}
          <div className="inline-flex p-1 bg-white border border-[#E5E7EB] rounded-2xl mb-8 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedRole("fullstack")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === "fullstack"
                  ? "bg-[#3D37D0] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              Senior Full Stack
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("pm")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === "pm"
                  ? "bg-[#3D37D0] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              Product Manager
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("ds")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === "ds"
                  ? "bg-[#3D37D0] text-white shadow-xs"
                  : "text-[#4B5563] hover:text-[#111827]"
              }`}
            >
              Data Scientist
            </button>
          </div>

          {/* Dynamic Interactive Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECEFF8] shadow-md text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F1F3F9]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#3D37D0] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                  <span className="text-2xl font-black leading-none">{activeRole.score}</span>
                  <span className="text-[9px] font-bold tracking-widest text-white/80 mt-1 uppercase">
                    SCORE / 100
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[17px] text-[#111827]">
                      {activeRole.title}
                    </h3>
                    <span className="bg-[#EEF2FF] text-[#453DE0] text-[11px] font-bold px-2 py-0.5 rounded">
                      {activeRole.matchBadge}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{activeRole.description}</p>
                </div>
              </div>

              <Link
                href="/analyze"
                className="bg-[#3D37D0] hover:bg-[#342EB8] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs shrink-0 self-start sm:self-center"
              >
                Run Free Custom Scan
              </Link>
            </div>

            {/* Competencies Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {/* Matched */}
              <div className="bg-[#F8F9FE] p-4 rounded-xl border border-[#ECEFF8]">
                <div className="text-[11px] font-bold text-[#111827] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#3D37D0]" />
                  MATCHED COMPETENCIES
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeRole.matched.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-800 font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="bg-[#F8F9FE] p-4 rounded-xl border border-[#ECEFF8]">
                <div className="text-[11px] font-bold text-[#B91C1C] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>!</span>
                  KEYWORDS TO INJECT
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {activeRole.missing.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-[#FEE2E2] text-[#B91C1C] px-2.5 py-1 rounded-lg font-medium"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials (Image 2) */}
      <section id="reviews" className="py-20 px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="text-center mb-14">
          <span className="text-[11px] font-bold text-[#453DE0] uppercase tracking-wider">
            PROVEN RESULTS
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-extrabold text-[#111827] mt-1.5 tracking-tight">
            From ATS rejections to multiple tier-1 offers
          </h2>
          <p className="text-[#64748B] text-[15px] max-w-2xl mx-auto mt-2">
            Real candidates who updated their resumes with ATSly and immediately unlocked interview
            callbacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-gray-700 text-[13.5px] leading-relaxed italic">
                &quot;I applied to 60+ roles with zero callbacks. Ran ATSly once, discovered my
                2-column format was unreadable to Workday, and fixed my keywords. I got 5 interview
                invites within two weeks.&quot;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  SJ
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Sarah Jenkins</h4>
                  <p className="text-[11px] text-gray-500">Hired at Datadog</p>
                </div>
              </div>
              <span className="bg-[#EEF2FF] text-[#453DE0] text-[11px] font-bold px-2 py-0.5 rounded">
                +42% Score
              </span>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-gray-700 text-[13.5px] leading-relaxed italic">
                &quot;The bullet point rewrites are genuinely recruiter grade. It transformed my
                generic statements into punchy, metric-driven accomplishments without sounding like
                generic AI fluff.&quot;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center">
                  MV
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Marcus Vance</h4>
                  <p className="text-[11px] text-gray-500">Hired at DoorDash</p>
                </div>
              </div>
              <span className="bg-[#EEF2FF] text-[#453DE0] text-[11px] font-bold px-2 py-0.5 rounded">
                +36% Score
              </span>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex text-amber-400 text-sm mb-3">★★★★★</div>
              <p className="text-gray-700 text-[13.5px] leading-relaxed italic">
                &quot;As an engineering manager who reviews thousands of resumes, ATSly produces the
                exact clean formatting and quantified impact phrasing that instantly moves candidates
                to the phone-screen pile.&quot;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center">
                  ER
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Elena Rostova</h4>
                  <p className="text-[11px] text-gray-500">Hiring Manager @ Uber</p>
                </div>
              </div>
              <span className="bg-[#EDE9FE] text-[#5542F6] text-[11px] font-bold px-2 py-0.5 rounded">
                Verified Lead
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Pricing Plans (Image 5) */}
      <section id="pricing" className="py-20 px-6 lg:px-8 bg-[#F8F9FE] border-t border-[#ECEFF8]">
        <div className="max-w-[980px] mx-auto text-center">
          <span className="text-[11px] font-bold text-[#453DE0] uppercase tracking-wider">
            TRANSPARENT PLANS
          </span>
          <h2 className="text-[32px] sm:text-[38px] font-extrabold text-[#111827] mt-1.5 tracking-tight">
            Invest in your career for less than the cost of one lunch
          </h2>
          <p className="text-[#64748B] text-[15px] max-w-xl mx-auto mt-2 mb-12">
            Start free to evaluate your current score, or upgrade to Pro to unlock automated bullet
            rewrites and unlimited target scans.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left items-stretch">
            {/* Free Starter */}
            <div className="bg-white rounded-2xl p-8 border border-[#ECEFF8] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Free Starter</h3>
                  <span className="bg-[#ECEEF5] text-[#555E6D] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    Always Free
                  </span>
                </div>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-[#111827]">$0</span>
                  <span className="text-xs text-gray-500 font-medium">/ forever</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Perfect for checking your current resume health before sending out your first round
                  of applications.
                </p>

                <ul className="space-y-3 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" />
                    <span>3 free ATS resume scans per month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" />
                    <span>Basic missing keyword identification</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" />
                    <span>Multi-column &amp; formatting risk check</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-gray-400">
                    <X size={14} />
                    <span>Unlimited target job description scans</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="w-full mt-8 bg-white border border-[#D1D5DB] hover:bg-gray-50 text-[#1F2937] text-xs font-bold py-3 rounded-xl transition-colors text-center block shadow-xs"
              >
                Create Free Account
              </Link>
            </div>

            {/* Pro Job Hunter */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#453DE0] shadow-lg flex flex-col justify-between relative">
              <span className="absolute -top-3 right-6 bg-[#3D37D0] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                MOST POPULAR
              </span>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-900">Pro Job Hunter</h3>
                </div>

                <div className="flex items-baseline gap-1 my-3">
                  <span className="text-4xl font-extrabold text-[#111827]">$19</span>
                  <span className="text-xs text-gray-500 font-medium">
                    / month • cancel anytime
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed mb-6">
                  Full enterprise-grade toolset to tailor your resume for every single job
                  application automatically.
                </p>

                <ul className="space-y-3 text-xs text-gray-700 font-medium">
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" strokeWidth={3} />
                    <span className="font-bold text-gray-900">
                      Unlimited ATS job description scans
                    </span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" strokeWidth={3} />
                    <span>1-Click quantified bullet rewriter engine</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" strokeWidth={3} />
                    <span>10+ ATS-certified clean resume templates</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check size={14} className="text-[#453DE0]" strokeWidth={3} />
                    <span>Direct PDF &amp; DOCX ATS format export</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/signup"
                className="w-full mt-8 bg-[#453DE0] hover:bg-[#3B33D1] text-white text-xs font-bold py-3 rounded-xl transition-all text-center block shadow-md"
              >
                Start 7-Day Free Pro Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Large Purple Final CTA Banner (Image 5) */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-[1140px] mx-auto bg-[#453DE0] rounded-3xl p-10 sm:p-14 text-white text-center shadow-xl relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-5">
            <Check size={12} strokeWidth={3} />
            100% Free Resume Analysis
          </span>

          {/* Headline */}
          <h2 className="text-[32px] sm:text-[44px] lg:text-[48px] font-extrabold tracking-tight leading-[1.15] max-w-3xl mx-auto">
            Stop getting lost in automated ATS black holes. Start landing top interviews today.
          </h2>

          <p className="text-white/85 text-[15px] sm:text-[16px] max-w-xl mx-auto mt-4 mb-8 leading-relaxed">
            Upload your existing resume now to see your instant ATS compatibility score and bullet
            rewrite recommendations in under 60 seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/analyze"
              className="bg-white hover:bg-gray-100 text-[#453DE0] font-bold text-[14px] px-6 py-3 rounded-xl transition-all shadow-md"
            >
              Analyze My Resume Now — Free
            </Link>
            <a
              href="#how-it-works"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-[14px] px-5 py-3 rounded-xl transition-colors"
            >
              See How Recruiter Scoring Works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-xs text-white/80">
            <span>• No credit card needed</span>
            <span>• Instant PDF upload</span>
            <span>• SOC2 Certified &amp; GDPR Safe</span>
          </div>
        </div>
      </section>

      {/* 9. Landing Footer */}
      <footer className="py-10 px-6 lg:px-8 border-t border-[#ECEFF8] bg-white text-xs text-gray-500">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#453DE0] text-white flex items-center justify-center font-bold text-xs">
              A
            </div>
            <span className="font-extrabold text-sm text-[#111827]">ATSly</span>
            <span className="text-gray-400">| AI-Powered ATS Resume Analyzer</span>
          </div>

          <p>© 2026 ATSly. All rights reserved.</p>

          <div className="flex items-center gap-4 text-gray-500">
            <a href="#" className="hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="hover:text-gray-900">Terms of Service</a>
            <Link href="/library" className="hover:text-gray-900 font-semibold text-[#453DE0]">
              Go to Dashboard →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
