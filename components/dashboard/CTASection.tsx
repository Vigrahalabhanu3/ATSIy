import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/Icons";

export default function CTASection() {
  return (
    <section className="px-6 lg:px-8 py-14 bg-[#F8F7FF]">
      <div className="max-w-[1200px] mx-auto">
        <div className="bg-white border border-[#E5E3F2] rounded-2xl shadow-card p-10 text-center">
          <h2 className="text-[#171725] font-extrabold text-[28px] lg:text-[32px] tracking-tight mb-3">
            Ready to improve your resume?
          </h2>
          <p className="text-[#55556A] text-[15px] max-w-[480px] mx-auto mb-7 leading-relaxed">
            Join thousands of successful job seekers who optimized their
            applications and landed top-tier interviews with ATSly.
          </p>
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-[15px] px-7 py-3 rounded-lg transition-colors duration-150 shadow-sm"
          >
            Analyze My Resume
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
