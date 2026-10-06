import { ATSResult } from "@/lib/types";

interface ResumeStructureProps {
  result: ATSResult;
}

export default function ResumeStructure({ result }: ResumeStructureProps) {
  const { sections, atsReadability } = result.resumeStructure;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card h-full flex flex-col justify-between transition-colors">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#171725] dark:text-white font-extrabold text-[18px]">
            Resume Health
          </h3>
          <span className="bg-[#EFEDFF] dark:bg-[#201D47] text-[#4F46E5] dark:text-[#A5B4FC] text-[12px] font-bold px-3 py-1.5 rounded-full">
            ATS Readability {atsReadability}%
          </span>
        </div>

        <div className="divide-y divide-[#F1F0FB] dark:divide-[#1E223D]">
          {sections.map((section) => {
            const isWarning = section.status === "warning";
            return (
              <div
                key={section.name}
                className="flex items-center justify-between py-3"
              >
                <span className="text-[#171725] dark:text-gray-200 text-[14px] font-medium">
                  {section.name}
                </span>
                {isWarning ? (
                  <span className="text-[#D97706] dark:text-[#FBBF24] font-bold text-[16px]">!</span>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#16A34A"
                    className="stroke-[#16A34A] dark:stroke-[#4ADE80]"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
