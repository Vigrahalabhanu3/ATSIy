import { ATSResult } from "@/lib/types";

interface ProjectMatchProps {
  result: ATSResult;
}

export default function ProjectMatch({ result }: ProjectMatchProps) {
  const { projects } = result.projectMatch;

  return (
    <div className="bg-white dark:bg-[#121528] border border-[#E5E3F2] dark:border-[#1E223D] rounded-2xl p-6 lg:p-7 shadow-card h-full transition-colors">
      <h3 className="text-[#171725] dark:text-white font-extrabold text-[18px] mb-5">
        Project Match
      </h3>
      <div className="space-y-4">
        {projects.map((project) => {
          const isStrong = project.matchStrength === "Strong Match";
          return (
            <div
              key={project.name}
              className="bg-[#F8F7FF] dark:bg-[#1A1E36] border border-[#E5E3F2] dark:border-[#22284D] rounded-xl p-4 transition-all duration-150"
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-[#171725] dark:text-white font-bold text-[14.5px]">
                  {project.name}
                </h4>
                <span
                  className={`text-[11.5px] font-semibold px-2.5 py-0.5 rounded-full ${
                    isStrong
                      ? "bg-[#DCFCE7] dark:bg-[#143E23] text-[#16A34A] dark:text-[#4ADE80]"
                      : "bg-[#EFEDFF] dark:bg-[#201D47] text-[#4F46E5] dark:text-[#A5B4FC]"
                  }`}
                >
                  {isStrong ? "Strong match" : "Moderate relevance"}
                </span>
              </div>
              <p className="text-[#55556A] dark:text-gray-300 text-[13px] leading-relaxed">
                {project.technologies[0]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
