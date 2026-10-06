import { ATSResult } from "@/lib/types";
import { CheckCircleIcon, TriangleAlertIcon } from "@/components/icons/Icons";

interface ExperienceMatchProps {
  result: ATSResult;
}

export default function ExperienceMatch({ result }: ExperienceMatchProps) {
  const { strengths, gaps } = result.experienceMatch;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card h-full transition-colors">
      <h3 className="text-[#171725] dark:text-white font-extrabold text-[18px] mb-5">
        Experience Match
      </h3>
      <div className="space-y-4">
        {strengths.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <CheckCircleIcon size={18} className="text-[#16A34A] dark:text-[#4ADE80] shrink-0 mt-0.5" />
            <span className="text-[#33334A] dark:text-gray-200 text-[13.5px] leading-relaxed">
              {item}
            </span>
          </div>
        ))}
        {gaps.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <TriangleAlertIcon size={18} className="text-[#D97706] dark:text-[#FBBF24] shrink-0 mt-0.5" />
            <span className="text-[#33334A] dark:text-gray-200 text-[13.5px] leading-relaxed">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
