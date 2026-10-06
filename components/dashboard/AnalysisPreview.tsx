import { ATSResult } from "@/lib/types";
import { getProgressPercentage } from "@/lib/utils";

interface AnalysisPreviewProps {
  result?: ATSResult;
}

const breakdown = [
  { label: "Keyword Match", key: "keywordMatch" as const, max: 25, defaultScore: 22 },
  { label: "Technical Skills", key: "technicalSkillsMatch" as const, max: 20, defaultScore: 18 },
  { label: "Experience Relevance", key: "experienceMatch" as const, max: 20, defaultScore: 17 },
  { label: "Projects Impact", key: "projectsMatch" as const, max: 15, defaultScore: 14 },
];

export default function AnalysisPreview({ result }: AnalysisPreviewProps) {
  const atsScore = result?.atsScore ?? 88;

  return (
    <div className="w-full max-w-[360px] bg-white rounded-2xl shadow-[0_4px_24px_rgba(79,70,229,0.10)] border border-[#E5E3F2] overflow-hidden">
      {/* Window header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E3F2] bg-[#FAFAFA]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="text-[11px] text-[#8080A0] font-medium">
          ATS_Analysis_Report.json
        </span>
        <div className="w-14" aria-hidden="true" />
      </div>

      <div className="p-5">
        {/* Score */}
        <div className="flex items-center justify-between bg-[#F8F7FF] rounded-xl px-4 py-3 mb-5">
          <div>
            <p className="text-[10px] font-semibold text-[#8080A0] uppercase tracking-wider mb-0.5">
              Overall ATS Score
            </p>
            <p className="text-[#171725] font-extrabold text-[28px] leading-none">
              {atsScore}
              <span className="text-[14px] font-semibold text-[#8080A0] ml-1">
                / 100
              </span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#16A34A] text-[11px] font-semibold px-2.5 py-1 rounded-full">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {result?.finalVerdict || "Evaluated"}
          </span>
        </div>

        {/* Progress bars */}
        <div className="space-y-3.5 mb-5">
          {breakdown.map((item) => {
            const scoreData = result?.scoreBreakdown?.[item.key];
            const score = scoreData ? scoreData.score : item.defaultScore;
            const max = scoreData ? scoreData.max : item.max;
            const pct = getProgressPercentage(score, max);
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] text-[#55556A] font-medium">
                    {item.label}
                  </span>
                  <span className="text-[13px] font-bold text-[#4F46E5]">
                    {score} / {max}
                  </span>
                </div>
                <div className="h-2 bg-[#EFEDFF] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4F46E5] rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
