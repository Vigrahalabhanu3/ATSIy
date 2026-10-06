const steps = [
  {
    number: "01",
    title: "Upload Resume",
    description:
      "Upload your current resume in PDF or DOCX format. Our parser extracts all professional details instantly.",
  },
  {
    number: "02",
    title: "Add Job Description",
    description:
      "Paste the target job description so our AI can cross-reference requirements with your background.",
  },
  {
    number: "03",
    title: "Get ATS Analysis",
    description:
      "Receive your comprehensive score, missing keywords, and step-by-step optimization recommendations.",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-6 lg:px-8 py-14 bg-[#F8F7FF]">
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <p className="text-[#4F46E5] text-xs font-semibold uppercase tracking-widest mb-2">
            PROCESS
          </p>
          <h2 className="text-[#171725] font-extrabold text-[30px] lg:text-[34px] tracking-tight mb-3">
            How It Works
          </h2>
          <p className="text-[#55556A] text-[15px] max-w-[480px] mx-auto">
            Three simple steps to pass automated applicant tracking systems.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-[#E5E3F2] rounded-xl p-6 hover:shadow-card-hover transition-shadow duration-200"
            >
              <p className="text-[#C5BDFF] font-extrabold text-[36px] leading-none mb-3 tracking-tight">
                {step.number}
              </p>
              <h3 className="text-[#171725] font-bold text-[16px] mb-2">
                {step.title}
              </h3>
              <p className="text-[#55556A] text-[14px] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
