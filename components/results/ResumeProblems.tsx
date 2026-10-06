import { ATSResult } from "@/lib/types";

interface ResumeProblemsProps {
  result: ATSResult;
}

export default function ResumeProblems({ result }: ResumeProblemsProps) {
  const { topResumeProblems } = result;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card h-full transition-colors">
      <h3 className="text-[#171725] dark:text-white font-extrabold text-[18px] mb-5">
        Top Resume Problems
      </h3>
      <div className="space-y-3.5">
        {topResumeProblems.map((problem, index) => (
          <div
            key={problem.title}
            className="bg-[#FFF5F5] dark:bg-[#2A141A] border border-[#FEE2E2] dark:border-[#4B1C26] rounded-xl p-4 flex items-start gap-3.5"
          >
            <span className="text-[#DC2626] dark:text-[#F87171] font-extrabold text-[16px] leading-tight shrink-0 mt-0.5">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h4 className="text-[#171725] dark:text-white font-bold text-[14px] mb-1">
                {problem.title}
              </h4>
              <p className="text-[#55556A] dark:text-gray-300 text-[12.5px] leading-relaxed">
                {problem.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
