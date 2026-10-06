import {
  TargetIcon,
  KeyIcon,
  CodeIcon,
  BriefcaseIcon,
  FolderOpenIcon,
  LightbulbIcon,
} from "@/components/icons/Icons";

const features = [
  {
    icon: TargetIcon,
    title: "ATS Score",
    description:
      "Get a precise percentage rating showing how well your resume matches the job requirements.",
  },
  {
    icon: KeyIcon,
    title: "Keyword Matching",
    description:
      "Instantly spot missing hard and soft keywords required by the employer's screening filters.",
  },
  {
    icon: CodeIcon,
    title: "Technical Skill Analysis",
    description:
      "Verify if your listed programming languages, frameworks, and tools align with job demands.",
  },
  {
    icon: BriefcaseIcon,
    title: "Experience Match",
    description:
      "Evaluate your work history depth and leadership metrics against the position seniority.",
  },
  {
    icon: FolderOpenIcon,
    title: "Project Match",
    description:
      "Highlight relevant portfolio items and side projects that demonstrate practical competency.",
  },
  {
    icon: LightbulbIcon,
    title: "AI Recommendations",
    description:
      "Receive tailored copywriting suggestions to rewrite bullet points for maximum impact.",
  },
];

export default function Features() {
  return (
    <section className="px-6 lg:px-8 py-14 bg-white">
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-[#4F46E5] text-xs font-semibold uppercase tracking-widest mb-2">
            CAPABILITIES
          </p>
          <h2 className="text-[#171725] font-extrabold text-[30px] lg:text-[34px] tracking-tight mb-3">
            Powerful Features for Job Seekers
          </h2>
          <p className="text-[#55556A] text-[15px] max-w-[520px] mx-auto">
            Everything you need to beat the resume screening robots and land
            interviews.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-[#F8F7FF] border border-[#E5E3F2] rounded-xl p-6 hover:shadow-card-hover hover:bg-white transition-all duration-200"
              >
                <div className="w-10 h-10 bg-[#EFEDFF] rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-[#4F46E5]" />
                </div>
                <h3 className="text-[#171725] font-bold text-[15px] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#55556A] text-[14px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
