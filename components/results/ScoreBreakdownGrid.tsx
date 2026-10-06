import { ATSResult } from "@/lib/types";
import { getProgressPercentage } from "@/lib/utils";
import {
  KeyIcon,
  CodeIcon,
  BriefcaseIcon,
  FolderIcon,
  GraduationCapIcon,
  FileTextIcon,
} from "@/components/icons/Icons";

interface ScoreBreakdownGridProps {
  result: ATSResult;
}

const breakdownMeta = [
  {
    key: "keywordMatch" as const,
    label: "Keyword Match",
    icon: KeyIcon,
  },
  {
    key: "technicalSkillsMatch" as const,
    label: "Technical Skills",
    icon: CodeIcon,
  },
  {
    key: "experienceMatch" as const,
    label: "Experience",
    icon: BriefcaseIcon,
  },
  {
    key: "projectsMatch" as const,
    label: "Projects",
    icon: FolderIcon,
  },
  {
    key: "educationMatch" as const,
    label: "Education",
    icon: GraduationCapIcon,
  },
  {
    key: "resumeStructure" as const,
    label: "Resume Structure",
    icon: FileTextIcon,
  },
];

export default function ScoreBreakdownGrid({ result }: ScoreBreakdownGridProps) {
  const { scoreBreakdown } = result;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {breakdownMeta.map((item) => {
        const data = scoreBreakdown[item.key];
        const pct = getProgressPercentage(data.score, data.max);
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#EFEDFF] dark:bg-[#201D47] flex items-center justify-center text-[#4F46E5] dark:text-[#A5B4FC]">
                  <Icon size={16} />
                </div>
                <span className="text-[#171725] dark:text-white font-semibold text-[14px]">
                  {item.label}
                </span>
              </div>
              <span className="text-[#4F46E5] dark:text-[#A5B4FC] font-extrabold text-[15px]">
                {data.score}/{data.max}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[#EFEDFF] dark:bg-[#1E223D] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F46E5] rounded-full transition-all duration-500"
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
