import { BrainIcon, TwitterIcon, LinkedInIcon, GitHubIcon } from "@/components/icons/Icons";

const footerLinks = {
  Product: ["Features", "Pricing", "Resume Builder", "ATS Checker"],
  Resources: ["How It Works", "Resume Templates", "Career Blog", "FAQ"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-white border-t border-[#E5E3F2] px-6 lg:px-8 py-10">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#4F46E5] flex items-center justify-center">
                <BrainIcon className="text-white" size={15} />
              </div>
              <span className="text-[#171725] font-bold text-[16px]">ATSly</span>
            </div>
            <p className="text-[#55556A] text-[13px] leading-relaxed max-w-[220px]">
              Advanced AI-powered resume analyzer helping job seekers bypass ATS
              filters and secure interviews faster.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[#171725] font-semibold text-[14px] mb-3">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[#55556A] text-[13px] hover:text-[#4F46E5] transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E5E3F2] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#8080A0] text-[12px]">
            © 2026 ATSly AI Resume Analyzer. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[
              { icon: TwitterIcon, label: "Twitter" },
              { icon: LinkedInIcon, label: "LinkedIn" },
              { icon: GitHubIcon, label: "GitHub" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="text-[#8080A0] hover:text-[#4F46E5] transition-colors duration-150 text-[13px] flex items-center gap-1"
              >
                <Icon size={15} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
