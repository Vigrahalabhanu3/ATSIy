"use client";

import { useState, useEffect } from "react";
import {
  Cookie,
  ShieldCheck,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export interface CookiePreferences {
  accepted: boolean;
  essential: boolean;
  preferences: boolean;
  analytics: boolean;
  timestamp: string;
}

const CONSENT_KEY = "atsly_cookie_consent";

export default function CookieConsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [allowPreferences, setAllowPreferences] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if user already made a choice
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      const shouldPrompt = localStorage.getItem("atsly_ask_cookie_consent");

      if (shouldPrompt === "true") {
        setIsOpen(true);
      } else if (!stored) {
        // Delay slightly for smooth page entrance
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed: CookiePreferences = JSON.parse(stored);
        setAllowPreferences(parsed.preferences ?? true);
        setAllowAnalytics(parsed.analytics ?? false);
      }
    } catch {
      // In case of restricted storage
    }

    // 2. Event listener for manual re-opening from Settings or Footer
    const handleOpen = () => {
      setIsOpen(true);
      setShowDetails(true);
    };

    window.addEventListener("open-cookie-settings", handleOpen);
    window.addEventListener("atsly_ask_cookies", handleOpen);

    return () => {
      window.removeEventListener("open-cookie-settings", handleOpen);
      window.removeEventListener("atsly_ask_cookies", handleOpen);
    };
  }, []);

  const saveConsent = (preferences: boolean, analytics: boolean) => {
    const consentObj: CookiePreferences = {
      accepted: true,
      essential: true, // Always required for auth and security
      preferences,
      analytics,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consentObj));
      localStorage.removeItem("atsly_ask_cookie_consent");

      // Set cookie in browser for edge/SSR awareness (1 year expiry)
      const oneYear = 365 * 24 * 60 * 60;
      document.cookie = `atsly_consent=accepted; Path=/; SameSite=Lax; Max-Age=${oneYear}`;
    } catch (e) {
      console.error("Failed to store cookie consent:", e);
    }

    window.dispatchEvent(
      new CustomEvent("atsly_cookies_updated", { detail: consentObj })
    );

    setIsOpen(false);
    setToastMessage("Cookie and session preferences updated securely.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleAcceptEssential = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(allowPreferences, allowAnalytics);
  };

  if (!isOpen && !toastMessage) return null;

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Check size={16} strokeWidth={2.5} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Cookie Consent Banner / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111322] border border-[#ECEFF8] dark:border-[#232742] shadow-2xl rounded-2xl w-full max-w-[620px] overflow-hidden transition-all duration-200 text-[#111827] dark:text-[#F1F5F9]">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-[#F1F3F9] dark:border-[#1E2238] flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#453DE0] dark:text-[#818CF8] flex items-center justify-center shrink-0 shadow-xs">
                  <Cookie size={22} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-[#111827] dark:text-white flex items-center gap-2">
                    Cookie &amp; Session Storage Settings
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Secure
                    </span>
                  </h2>
                  <p className="text-[12.5px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 leading-relaxed">
                    ATSly requires essential cookies and local session keys to maintain your authenticated login state, guard your resume data, and prevent unauthorized access.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcceptEssential}
                title="Dismiss and keep essential only"
                className="text-[#9CA3AF] hover:text-[#4B5563] dark:hover:text-[#CBD5E1] p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Expandable Preferences Section */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Category 1: Essential (Locked) */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#F8F9FE] dark:bg-[#16192E] border border-[#ECEFF8] dark:border-[#222744]">
                <div className="flex items-start gap-3">
                  <Lock size={18} className="text-[#453DE0] dark:text-[#818CF8] shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold text-[#111827] dark:text-white">
                        Strictly Necessary Session Keys
                      </span>
                      <span className="text-[9.5px] bg-[#EEF2FF] dark:bg-[#1E1B4B] text-[#453DE0] dark:text-[#818CF8] font-bold px-2 py-0.5 rounded-md uppercase">
                        Required
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Encrypted JWT token (`atsly_token`), CSRF protection, and credit verification. Required to keep you signed in securely across page navigation.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center h-6">
                  <span className="text-[11.5px] font-bold text-[#453DE0] dark:text-[#818CF8]">
                    Always Active
                  </span>
                </div>
              </div>

              {/* Category 2: Functional / UI Preferences */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#F8F9FE] dark:bg-[#16192E] border border-[#ECEFF8] dark:border-[#222744]">
                <div className="flex items-start gap-3">
                  <Sliders size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold text-[#111827] dark:text-white">
                        Preferences &amp; Dark/Light Mode
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Remembers your chosen theme (dark/light/system), collapsed sidebar state, and filter preferences on this device.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={allowPreferences}
                    onChange={(e) => setAllowPreferences(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#453DE0]"></div>
                </label>
              </div>

              {/* Category 3: Analytics / Performance Diagnostics */}
              <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-[#F8F9FE] dark:bg-[#16192E] border border-[#ECEFF8] dark:border-[#222744]">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-bold text-[#111827] dark:text-white">
                        Performance Diagnostics
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                      Anonymous scan latency and cache hit benchmarks to speed up ATS processing times.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={allowAnalytics}
                    onChange={(e) => setAllowAnalytics(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#453DE0]"></div>
                </label>
              </div>

              {/* Technical Details Accordion Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-[#453DE0] dark:text-[#818CF8] hover:underline cursor-pointer"
                >
                  <span>{showDetails ? "Hide technical storage attributes" : "View technical cookie names and attributes"}</span>
                  {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#171A2E] text-[11px] space-y-1.5 font-mono text-[#4B5563] dark:text-[#94A3B8] border border-gray-200 dark:border-gray-800">
                    <div>• <strong className="text-gray-800 dark:text-gray-200">atsly_token:</strong> HttpOnly, Secure, SameSite=Lax (7 days)</div>
                    <div>• <strong className="text-gray-800 dark:text-gray-200">atsly_session:</strong> Session presence flag (7 days)</div>
                    <div>• <strong className="text-gray-800 dark:text-gray-200">atsly_consent:</strong> User consent marker (1 year)</div>
                    <div>• <strong className="text-gray-800 dark:text-gray-200">localStorage token:</strong> Client-side Bearer fallback for zero-downtime navigation</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 sm:p-6 pt-3 bg-[#F8F9FE] dark:bg-[#0D0F1F] border-t border-[#ECEFF8] dark:border-[#1E2238] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[13px] font-semibold text-[#374151] dark:text-[#D1D5DB] transition-all cursor-pointer text-center"
              >
                Essential Only
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-[#1E2238] border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-[13px] font-bold text-[#111827] dark:text-white transition-all cursor-pointer text-center"
                >
                  Save Choices
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#453DE0] hover:bg-[#3B33D1] text-white text-[13px] font-bold shadow-md transition-all cursor-pointer text-center"
                >
                  Accept All &amp; Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
