"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { HelpCircleIcon } from "@/components/icons/Icons";

export default function HelpPage() {
  const faqs = [
    {
      q: "How does the ATS score get calculated?",
      a: "The score evaluates keyword match density, technical skill alignment, work experience depth, projects relevance, and structural parsing readability.",
    },
    {
      q: "What file formats are supported?",
      a: "We currently support standard PDF (.pdf) and Microsoft Word (.docx) formats with maximum 5MB file size.",
    },
    {
      q: "Can I download my analysis report?",
      a: "Yes! Click the 'Download Report' button on any analysis page to save or export a comprehensive summary.",
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1240px] mx-auto">
        <h1 className="text-[#171725] font-extrabold text-[24px] tracking-tight mb-2">
          Help & Support
        </h1>
        <p className="text-[#55556A] text-[14px] mb-6">
          Frequently asked questions about ATSly and resume optimization best practices
        </p>

        <div className="space-y-4 max-w-[760px]">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-white border border-[#E5E3F2] rounded-2xl p-6 shadow-card"
            >
              <h3 className="text-[#171725] font-bold text-[15px] mb-2 flex items-center gap-2">
                <HelpCircleIcon size={16} className="text-[#4F46E5]" />
                {faq.q}
              </h3>
              <p className="text-[#55556A] text-[13.5px] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
