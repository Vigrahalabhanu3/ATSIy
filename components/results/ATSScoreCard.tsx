import { ATSResult } from "@/lib/types";
import { ShieldCheckIcon } from "@/components/icons/Icons";

interface ATSScoreCardProps {
  result: ATSResult;
}

export default function ATSScoreCard({ result }: ATSScoreCardProps) {
  const { atsScore, matchLabel, jobTitle, overallAssessment } = result;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card flex flex-col md:flex-row items-center gap-7 transition-colors">
      {/* Circular gauge */}
      <div className="flex flex-col items-center shrink-0">
        <div className="relative w-[140px] h-[140px]">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
            {/* Background track */}
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke="currentColor"
              className="text-[#EFEDFF] dark:text-[#1E223D]"
              strokeWidth="12"
            />
            {/* Progress track */}
            <circle
              cx="70"
              cy="70"
              r="58"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 58}`}
              strokeDashoffset={`${2 * Math.PI * 58 * (1 - atsScore / 100)}`}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[#171725] dark:text-white font-extrabold text-[36px] leading-none tracking-tight">
              {atsScore}
            </span>
            <span className="text-[#8080A0] dark:text-gray-400 text-[11px] font-bold tracking-wider uppercase mt-1">
              OUT OF 100
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 text-center md:text-left">
        <div className="inline-flex items-center gap-1.5 bg-[#EFEDFF] dark:bg-[#201D47] text-[#4F46E5] dark:text-[#A5B4FC] text-[12px] font-semibold px-3 py-1 rounded-full mb-3">
          <ShieldCheckIcon size={14} className="text-[#4F46E5] dark:text-[#A5B4FC]" />
          <span>{matchLabel}</span>
        </div>

        <h2 className="text-[#171725] dark:text-white font-extrabold text-[22px] lg:text-[24px] tracking-tight leading-snug mb-2.5">
          Excellent alignment with {jobTitle.replace(" Developer", "")} role
        </h2>

        <p className="text-[#55556A] dark:text-gray-300 text-[14px] leading-relaxed max-w-[620px]">
          {overallAssessment}
        </p>
      </div>
    </div>
  );
}
