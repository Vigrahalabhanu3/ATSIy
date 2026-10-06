import { ATSResult } from "@/lib/types";

interface TechnicalSkillsProps {
  result: ATSResult;
}

export default function TechnicalSkills({ result }: TechnicalSkillsProps) {
  const { matching, missing } = result.technicalSkills;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card transition-colors">
      <h3 className="text-[#171725] dark:text-white font-extrabold text-[18px] mb-5">
        Technical Skills
      </h3>

      {/* Matching Skills */}
      <div className="mb-6">
        <p className="text-[#8080A0] dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">
          MATCHING SKILLS
        </p>
        <div className="flex flex-wrap gap-2.5">
          {matching.map((skill) => (
            <span
              key={skill}
              className="bg-[#F3F4F6] dark:bg-[#1E223D] text-[#1F2937] dark:text-gray-200 text-[13px] font-semibold px-4 py-1.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      <div>
        <p className="text-[#8080A0] dark:text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-3">
          MISSING SKILLS TO ADD
        </p>
        <div className="flex flex-wrap gap-2.5">
          {missing.map((skill) => (
            <span
              key={skill}
              className="bg-[#FEE2E2] dark:bg-[#451A1A] text-[#DC2626] dark:text-[#F87171] text-[13px] font-semibold px-4 py-1.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
