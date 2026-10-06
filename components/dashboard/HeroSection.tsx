"use client";

import Link from "next/link";
import { SparklesIcon, ArrowRightIcon } from "@/components/icons/Icons";
import AnalysisPreview from "./AnalysisPreview";

export default function HeroSection() {
  return (
    <section className="px-6 lg:px-8 py-10 lg:py-14">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-[#EFEDFF] text-[#4F46E5] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <SparklesIcon size={13} className="text-[#4F46E5]" />
              AI-Powered ATS Optimization
            </div>

            <h1 className="text-[#171725] font-extrabold text-[36px] lg:text-[40px] leading-[1.15] tracking-tight mb-4">
              Know How Well Your
              <br />
              Resume Matches the Job.
            </h1>

            <p className="text-[#55556A] text-[15px] leading-relaxed mb-8 max-w-[480px]">
              Analyze your resume against any job description and get an ATS
              score, missing keywords, skill gaps, and actionable improvements.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors duration-150 shadow-sm"
              >
                Analyze My Resume
                <ArrowRightIcon size={15} />
              </Link>
            </div>
          </div>

          {/* Right: Preview Card */}
          <div className="flex justify-center lg:justify-end">
            <AnalysisPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
