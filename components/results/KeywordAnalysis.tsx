import { ATSResult } from "@/lib/types";
import { CheckCircleIcon, TriangleAlertIcon } from "@/components/icons/Icons";

interface KeywordAnalysisProps {
  result: ATSResult;
}

export default function KeywordAnalysis({ result }: KeywordAnalysisProps) {
  const { matchedKeywords, missingKeywords } = result;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Matched */}
      <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 shadow-card transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircleIcon size={18} className="text-[#16A34A] dark:text-[#4ADE80]" />
          <h3 className="text-[#171725] dark:text-white font-bold text-[15px]">
            Matched Keywords ({matchedKeywords.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {matchedKeywords.map((kw) => (
            <span
              key={kw}
              className="bg-[#F0FDF4] dark:bg-[#143E23] text-[#16A34A] dark:text-[#4ADE80] border border-[#BBF7D0] dark:border-[#1E5B33] text-[13px] font-semibold px-3 py-1.5 rounded-lg"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Missing */}
      <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 shadow-card transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <TriangleAlertIcon size={18} className="text-[#D97706] dark:text-[#FBBF24]" />
          <h3 className="text-[#171725] dark:text-white font-bold text-[15px]">
            Missing Keywords ({missingKeywords.length})
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {missingKeywords.map((kw) => (
            <span
              key={kw}
              className="bg-[#FFFBEB] dark:bg-[#3D2C0D] text-[#D97706] dark:text-[#FBBF24] border border-[#FDE68A] dark:border-[#5A4112] text-[13px] font-semibold px-3 py-1.5 rounded-lg"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
