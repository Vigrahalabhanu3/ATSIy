import { ATSResult } from "@/lib/types";
import { getProgressPercentage } from "@/lib/utils";
import { InfoIcon } from "@/components/icons/Icons";

interface ScoreBreakdownProps {
  result: ATSResult;
  compact?: boolean;
}

const breakdownItems = [
  { label: "Keyword Match", key: "keywordMatch" as const },
  { label: "Technical Skills", key: "technicalSkillsMatch" as const },
  { label: "Experience", key: "experienceMatch" as const },
  { label: "Projects", key: "projectsMatch" as const },
  { label: "Education", key: "educationMatch" as const },
  { label: "Resume Structure", key: "resumeStructure" as const },
];

export default function ScoreBreakdown({ result, compact = false }: ScoreBreakdownProps) {
  const { scoreBreakdown } = result;

  return (
    <div className="space-y-3">
      {breakdownItems.map((item) => {
        const data = scoreBreakdown[item.key];
        const pct = getProgressPercentage(data.score, data.max);
        return (
          <div key={item.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[#55556A] font-medium ${compact ? "text-[13px]" : "text-[14px]"}`}>
                {item.label}
              </span>
              <span className={`font-bold text-[#4F46E5] ${compact ? "text-[13px]" : "text-[14px]"}`}>
                {data.score} / {data.max}
              </span>
            </div>
            <div className="h-1.5 bg-[#EFEDFF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={data.score}
                aria-valuemin={0}
                aria-valuemax={data.max}
                aria-label={`${item.label}: ${data.score} out of ${data.max}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AnalysisPanelProps {
  result: ATSResult;
}

export function AnalysisPanel({ result }: AnalysisPanelProps) {
  return (
    <div className="bg-white border border-[#E5E3F2] rounded-xl p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[#171725] font-bold text-[15px]">Your Analysis</h2>
        <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#16A34A] text-[12px] font-semibold px-3 py-1 rounded-full">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {result.matchLabel}
        </span>
      </div>

      {/* Circular score */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-[120px] h-[120px] mb-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#EFEDFF"
              strokeWidth="10"
            />
            {/* Progress arc */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - result.atsScore / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[#171725] font-extrabold text-[30px] leading-none">
              {result.atsScore}
            </span>
            <span className="text-[#8080A0] text-[12px] font-medium">/ 100</span>
          </div>
        </div>
        <h3 className="text-[#171725] font-bold text-[15px] mb-1">
          Excellent ATS Compatibility
        </h3>
        <p className="text-[#55556A] text-[13px] text-center max-w-[240px] leading-relaxed">
          Your resume matches {result.atsScore}% of the required competencies
          for this position.
        </p>
      </div>

      {/* Score breakdown */}
      <ScoreBreakdown result={result} compact />

      {/* AI recommendation */}
      <div className="mt-5 flex items-start gap-2.5 bg-[#F8F7FF] border border-[#E5E3F2] rounded-xl p-3.5">
        <InfoIcon size={15} className="text-[#4F46E5] shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-[#55556A] leading-relaxed">
          Detailed breakdown indicates strong alignment with core requirements.
          Consider optimizing missing keyword tokens such as{" "}
          <strong className="text-[#171725]">&ldquo;CI/CD Pipelines&rdquo;</strong>{" "}
          and{" "}
          <strong className="text-[#171725]">&ldquo;GraphQL&rdquo;</strong> to
          elevate your score further.
        </p>
      </div>
    </div>
  );
}
