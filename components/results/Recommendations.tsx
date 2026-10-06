import { ATSResult } from "@/lib/types";
import { BotIcon } from "@/components/icons/Icons";

interface RecommendationsProps {
  result: ATSResult;
}

export default function Recommendations({ result }: RecommendationsProps) {
  const { recommendations } = result;

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div
          key={rec.id}
          className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card transition-colors"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EFEDFF] dark:bg-[#201D47] text-[#4F46E5] dark:text-[#A5B4FC] flex items-center justify-center shrink-0">
                <BotIcon size={16} />
              </div>
              <h3 className="text-[#171725] dark:text-white font-bold text-[16px]">
                {rec.title}
              </h3>
            </div>
            <span className="bg-[#EFEDFF] dark:bg-[#201D47] text-[#4F46E5] dark:text-[#A5B4FC] text-[11px] font-bold px-3 py-1 rounded-full shrink-0">
              {rec.impactLabel || "High Impact"}
            </span>
          </div>

          <p className="text-[#55556A] dark:text-gray-300 text-[13.5px] leading-relaxed mb-4">
            {rec.description}
          </p>

          {/* Current vs Rewrite */}
          {rec.currentText && rec.recommendedRewrite ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-[#FFF5F5] dark:bg-[#2A141A] border border-[#FEE2E2] dark:border-[#4B1C26] rounded-xl p-3.5">
                <p className="text-[#DC2626] dark:text-[#F87171] text-[10.5px] font-bold tracking-wider uppercase mb-1.5">
                  CURRENT TEXT
                </p>
                <p className="text-[#171725] dark:text-gray-200 font-mono text-[12.5px] leading-relaxed">
                  {rec.currentText}
                </p>
              </div>

              <div className="bg-[#F0FDF4] dark:bg-[#143E23] border border-[#BBF7D0] dark:border-[#1E5B33] rounded-xl p-3.5">
                <p className="text-[#16A34A] dark:text-[#4ADE80] text-[10.5px] font-bold tracking-wider uppercase mb-1.5">
                  RECOMMENDED REWRITE
                </p>
                <p className="text-[#171725] dark:text-gray-200 font-mono text-[12.5px] leading-relaxed">
                  {rec.recommendedRewrite}
                </p>
              </div>
            </div>
          ) : rec.suggestedAddition ? (
            <div className="bg-[#F8F7FF] dark:bg-[#1A1E36] border border-[#E5E3F2] dark:border-[#22284D] rounded-xl p-3.5">
              <p className="text-[#8080A0] dark:text-gray-400 text-[10.5px] font-bold tracking-wider uppercase mb-1.5">
                SUGGESTED ADDITION
              </p>
              <p className="text-[#171725] dark:text-gray-200 font-mono text-[12.5px] leading-relaxed">
                {rec.suggestedAddition}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
