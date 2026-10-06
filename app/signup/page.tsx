"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  CheckCircle2,
  Shield,
  Star,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Check,
} from "lucide-react";

export default function SignUpPage({
  initialMode = "signup",
}: {
  initialMode?: "signup" | "login";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Software Engineering & Tech");
  const [agreed, setAgreed] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Password strength calculation
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const getStrengthScore = () => {
    let score = 0;
    if (password.length > 0) score += 1;
    if (hasMinLength) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;
    return score;
  };

  const strengthScore = getStrengthScore();

  const getStrengthLabel = () => {
    if (password.length === 0) return "Enter password";
    if (strengthScore <= 1) return "Weak";
    if (strengthScore === 2) return "Fair";
    if (strengthScore === 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (!email) {
        setErrorMsg("Please enter your email address.");
        setIsLoading(false);
        return;
      }

      if (!password) {
        setErrorMsg("Please enter your password.");
        setIsLoading(false);
        return;
      }

      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMsg("Please enter your full name.");
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setErrorMsg("Password must be at least 8 characters long.");
          setIsLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName.trim(),
            email: email.trim(),
            password,
            confirmPassword: password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.error?.message || "Registration failed. Please try again.");
          setIsLoading(false);
          return;
        }

        const token = data.data?.token || data.token;
        const userObj = data.data?.user || data.user;

        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("atsly_token", token);
          }
          localStorage.setItem(
            "atsly_user",
            JSON.stringify({
              id: userObj?.id,
              name: userObj?.name || fullName,
              email: userObj?.email || email,
              role: role,
              isLoggedIn: true,
            })
          );
          // Ask for cookie acceptance after initial register
          if (!localStorage.getItem("atsly_cookie_consent")) {
            localStorage.setItem("atsly_ask_cookie_consent", "true");
          }
        }

        router.push("/dashboard");
      } else {
        // Login flow
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorMsg(data.error?.message || "Invalid credentials. Please try again.");
          setIsLoading(false);
          return;
        }

        const token = data.data?.token || data.token;
        const userObj = data.data?.user || data.user;

        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("atsly_token", token);
          }
          localStorage.setItem(
            "atsly_user",
            JSON.stringify({
              id: userObj?.id,
              name: userObj?.name,
              email: userObj?.email,
              role: userObj?.role || role,
              isLoggedIn: true,
            })
          );
          // Ask for cookie acceptance after initial login if not already saved
          if (!localStorage.getItem("atsly_cookie_consent")) {
            localStorage.setItem("atsly_ask_cookie_consent", "true");
          }
        }

        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FD] flex flex-col justify-between">
      {/* Top Navigation */}
      <header className="h-[72px] px-6 lg:px-12 flex items-center justify-between border-b border-[#ECEFF8] bg-white">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#453DE0] text-white flex items-center justify-center font-extrabold text-[16px] shadow-xs">
            A
          </div>
          <span className="text-[#15173A] font-extrabold text-[20px] tracking-tight">
            ATSly
          </span>
        </Link>

        <Link
          href="/"
          className="text-[13.5px] font-medium text-[#4B5563] hover:text-[#111827] transition-colors flex items-center gap-1.5"
        >
          <span>← Back to Home</span>
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto w-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          {/* Left Column: Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-7 sm:p-9 border border-[#ECEFF8] shadow-sm">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 bg-[#EEF2FF] text-[#453DE0] text-[11.5px] font-semibold px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#453DE0]" />
              <span>Get started for free • No credit card required</span>
            </div>

            {/* Heading */}
            <h1 className="text-[26px] sm:text-[28px] font-extrabold text-[#111827] tracking-tight">
              {mode === "signup"
                ? "Create your ATSly account"
                : "Sign in to your ATSly account"}
            </h1>

            <p className="text-[#64748B] text-[13.5px] mt-1 mb-5">
              Join 45,000+ job seekers optimizing their resumes for top tech and enterprise roles.
            </p>



            {/* Social Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {/* Google Button */}
              <button
                type="button"
                onClick={() => setErrorMsg("Direct email registration is active. Please use the form below to sign up.")}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-xl text-[13px] font-medium text-[#374151] transition-colors shadow-xs"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>{mode === "signup" ? "Sign up with Google" : "Sign in with Google"}</span>
              </button>

              {/* LinkedIn Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setErrorMsg("Direct email registration is active. Please use the form below to sign up.")}
                  className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-xl text-[13px] font-medium text-[#374151] transition-colors shadow-xs"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="#0A66C2">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span>{mode === "signup" ? "Sign up with LinkedIn" : "Sign in with LinkedIn"}</span>
                </button>
                <span className="absolute -top-2 right-2 bg-[#3D37D0] text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase pointer-events-none shadow-xs">
                  RECOMMENDED
                </span>
              </div>
            </div>

            {/* Or Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-[#E5E7EB] flex-1" />
              <span className="text-[12px] text-[#9CA3AF] font-medium">
                {mode === "signup" ? "Or register with email" : "Or sign in with email"}
              </span>
              <div className="h-px bg-[#E5E7EB] flex-1" />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-xs rounded-xl p-3 mb-4">
                {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    />
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#FAFBFD] border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#374151] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#FAFBFD] border border-gray-200 rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[12.5px] font-semibold text-[#374151] mb-1.5">
                  {mode === "signup" ? "Create Password" : "Password"}
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#FAFBFD] border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter (Only for signup) */}
                {mode === "signup" && (
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="text-[#6B7280]">Password Strength:</span>
                      <span
                        className={`font-semibold ${
                          strengthScore >= 3
                            ? "text-emerald-600"
                            : strengthScore >= 2
                            ? "text-amber-600"
                            : "text-gray-500"
                        }`}
                      >
                        {getStrengthLabel()}
                      </span>
                    </div>

                    {/* 4 segments */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <div
                        className={`h-1 rounded-full transition-all ${
                          strengthScore >= 1 ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-1 rounded-full transition-all ${
                          strengthScore >= 2 ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-1 rounded-full transition-all ${
                          strengthScore >= 3 ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                      <div
                        className={`h-1 rounded-full transition-all ${
                          strengthScore >= 4 ? "bg-emerald-500" : "bg-gray-200"
                        }`}
                      />
                    </div>

                    {/* Criteria check pills */}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                            hasMinLength
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {hasMinLength && "✓"}
                        </span>
                        8+ chars
                      </span>

                      <span className="flex items-center gap-1">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                            hasNumber
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {hasNumber && "✓"}
                        </span>
                        1+ number
                      </span>

                      <span className="flex items-center gap-1">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                            hasSpecial
                              ? "bg-emerald-500 border-emerald-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {hasSpecial && "✓"}
                        </span>
                        1+ symbol
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Role (Sign Up only) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#374151] mb-1.5">
                    Target Role / Career Field
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#FAFBFD] border border-gray-200 rounded-xl pl-10 pr-10 py-2.5 text-[13.5px] text-[#111827] focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option>Select your field...</option>
                      <option>Software Engineering &amp; Tech</option>
                      <option>Product Management</option>
                      <option>Data Science &amp; AI</option>
                      <option>Cloud &amp; DevOps</option>
                      <option>Design &amp; UI/UX</option>
                      <option>Management &amp; Leadership</option>
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
                    />
                  </div>
                </div>
              )}

              {/* Terms Checkbox */}
              {mode === "signup" && (
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 rounded text-[#453DE0] focus:ring-indigo-400 cursor-pointer"
                  />
                  <label
                    htmlFor="terms"
                    className="text-[12px] text-[#64748B] leading-tight cursor-pointer"
                  >
                    I agree to ATSly&apos;s{" "}
                    <Link href="#" className="text-[#453DE0] hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="#" className="text-[#453DE0] hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#453DE0] hover:bg-[#3B33D1] text-white font-semibold text-[14px] py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : mode === "signup" ? (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Link */}
            <div className="mt-5 text-center text-[13px] text-[#64748B]">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setErrorMsg("");
                    }}
                    className="text-[#453DE0] font-semibold hover:underline cursor-pointer"
                  >
                    Log in
                  </button>
                </>
              ) : (
                <>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMsg("");
                    }}
                    className="text-[#453DE0] font-semibold hover:underline cursor-pointer"
                  >
                    Sign up free
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Benefits & Live Scan Preview */}
          <div className="lg:col-span-5 space-y-4">
            {/* Benefits Card */}
            <div className="bg-[#F6F7FD] rounded-2xl p-6 border border-[#ECEFF8]">
              <div className="text-[10.5px] font-bold text-[#453DE0] tracking-wider uppercase mb-1">
                EVERYTHING INCLUDED WITH FREE TIER
              </div>
              <h2 className="text-[19px] font-bold text-[#111827] mb-4 tracking-tight">
                Beat the ATS algorithm instantly
              </h2>

              <ul className="space-y-3.5">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E0E7FF] text-[#453DE0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">
                      3 Free In-Depth ATS Resume Scans
                    </h3>
                    <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-relaxed">
                      Full diagnostic audit checking parser readiness, parsing tiers, and layout glitches.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E0E7FF] text-[#453DE0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">
                      Real-Time Keyword Match Analysis
                    </h3>
                    <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-relaxed">
                      Side-by-side gap analysis mapping your skills straight to active job descriptions.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E0E7FF] text-[#453DE0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">
                      Recruiter-Approved Bullet Rewrites
                    </h3>
                    <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-relaxed">
                      Instant high-impact action verbs and quantitative metrics engineered to catch attention.
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E0E7FF] text-[#453DE0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#111827]">
                      Multi-Format Export
                    </h3>
                    <p className="text-[11.5px] text-[#64748B] mt-0.5 leading-relaxed">
                      Download both standardized ATS-compliant PDF and customizable DOCX files.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Live Scan Engine Preview Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#ECEFF8] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#111827]">
                  <span className="w-2 h-2 rounded-full bg-[#453DE0] animate-pulse" />
                  <span>LIVE SCAN ENGINE</span>
                </div>
                <span className="bg-[#ECEEF5] text-[#555E6D] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  Processed in 1.4s
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[14.5px] text-[#111827]">
                    Senior Product Manager
                  </h4>
                  <p className="text-[11.5px] text-[#64748B] mt-0.5">
                    Matches 24 of 27 target skills
                  </p>
                </div>

                {/* Circular Score Badge */}
                <div className="w-12 h-12 rounded-full border-4 border-[#3D37D0] flex items-center justify-center font-extrabold text-[14px] text-[#3D37D0]">
                  89%
                </div>
              </div>

              {/* Missing skill tag */}
              <div className="bg-[#F6F7FD] rounded-xl p-2.5 mt-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#3D37D0] font-medium text-[11.5px]">
                  <Sparkles size={13} className="text-[#3D37D0]" />
                  <span>Missing: Agile Lifecycle KPIs</span>
                </div>
                <span className="bg-white border border-[#D1D5DB] rounded-lg px-2 py-0.5 text-[11px] font-semibold text-[#1F2937]">
                  Auto-fix
                </span>
              </div>
            </div>

            {/* Social Proof Rating Card */}
            <div className="bg-[#F6F7FD] rounded-2xl p-4 border border-[#ECEFF8] flex items-center gap-3.5">
              {/* Avatars */}
              <div className="flex -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  SJ
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  MV
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500 border-2 border-white flex items-center justify-center text-white text-[10px] font-bold">
                  ER
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#111827]">
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                  <span>4.9 / 5</span>
                </div>
                <div className="text-[11.5px] text-[#64748B]">
                  Over 2,400+ career transition reviews
                </div>
              </div>
            </div>

            {/* Encryption Security Badge Card */}
            <div className="bg-white rounded-2xl p-3.5 border border-[#ECEFF8] flex items-center gap-3 text-[11.5px] text-[#64748B] leading-relaxed">
              <div className="w-8 h-8 rounded-xl bg-[#F4F5FD] text-[#453DE0] flex items-center justify-center shrink-0">
                <Shield size={16} />
              </div>
              <p>
                <span className="font-semibold text-[#111827]">
                  Bank-grade 256-bit encryption.
                </span>{" "}
                Your resume data is strictly confidential and is never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#9CA3AF] border-t border-[#ECEFF8] bg-white">
        © 2026 ATSly AI Resume Analyzer. All rights reserved.
      </footer>
    </div>
  );
}
