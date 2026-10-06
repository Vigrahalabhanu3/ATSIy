"use client";

import { useState, useEffect } from "react";
import { Monitor, Laptop, Copy, Check, Sparkles, Shield, ArrowRight } from "lucide-react";

export default function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  const [windowWidth, setWindowWidth] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      {/* Desktop-Only Screen Displayed strictly on viewports below 1024px */}
      <div className="block lg:hidden min-h-screen w-full bg-[#0D0F1D] text-white flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden font-sans">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-gradient-to-b from-[#4F46E5]/25 via-[#312E81]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-to-t from-[#6366F1]/15 to-transparent blur-2xl pointer-events-none" />

        {/* Top Header */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4338CA] flex items-center justify-center text-white shadow-md shadow-[#4338CA]/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
                <circle cx="12" cy="12" r="3.5" fill="currentColor" />
                <path d="M12 2.5V5M12 19V21.5M2.5 12H5M19 12H21.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-extrabold text-[20px] tracking-tight text-white">ATSly</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#A5B4FC] text-[11px] font-bold uppercase tracking-wider border border-white/15">
            <Sparkles size={12} className="text-[#FBBF24]" />
            <span>Desktop Required</span>
          </div>
        </header>

        {/* Center Card */}
        <main className="relative z-10 max-w-lg mx-auto text-center my-auto py-10">
          {/* Animated Illustration */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#4338CA] to-[#6366F1] opacity-25 blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-3xl bg-[#17192F] border border-[#2E335D] flex items-center justify-center shadow-2xl">
              <Laptop size={44} className="text-[#818CF8]" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-[#4F46E5] border-2 border-[#0D0F1D] flex items-center justify-center text-white shadow-md">
              <Monitor size={18} />
            </div>
          </div>

          <h1 className="text-[26px] sm:text-[32px] font-black tracking-tight text-white leading-tight mb-3">
            Please Open on a Desktop Screen
          </h1>

          <p className="text-[#94A3B8] text-[14px] sm:text-[15px] leading-relaxed mb-6 max-w-md mx-auto">
            ATSly is an advanced, high-density ATS evaluation platform designed for side-by-side resume comparison, keyword breakdown diagnostics, and multi-column parsing reports.
          </p>

          {/* Dimension pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#15172C] border border-[#282C52] text-[12px] text-[#A5B4FC] mb-8 font-mono">
            <span>Detected width: <strong className="text-white">{windowWidth ? `${windowWidth}px` : "Mobile"}</strong></span>
            <span>•</span>
            <span>Minimum required: <strong className="text-[#34D399]">1024px</strong></span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] active:scale-[0.98] text-white font-bold text-[13.5px] px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#4338CA]/25 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-[#34D399]" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={16} />
                  <span>Copy Link for Desktop</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[#64748B] text-[11.5px] mt-4">
            Resize your window or visit from a laptop or desktop computer to continue.
          </p>
        </main>

        {/* Footer */}
        <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#64748B] border-t border-[#1C1F38] pt-5">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#818CF8]" />
            <span>Secure 256-bit ATS Evaluation Workspace</span>
          </div>
          <div>© {new Date().getFullYear()} ATSly. Engineered for Desktop Professionals.</div>
        </footer>
      </div>

      {/* Real Desktop Application strictly on screens >= 1024px */}
      <div className="hidden lg:block min-h-screen w-full">
        {children}
      </div>
    </>
  );
}
