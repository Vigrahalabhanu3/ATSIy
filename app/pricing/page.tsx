"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PLAN_CONFIG, PlanType } from "@/lib/config/plans";
import { CreditBalanceResponse } from "@/types/credits";
import { getCredits } from "@/lib/api/credits";
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Info,
} from "lucide-react";

export default function PricingPage() {
  const [credits, setCredits] = useState<CreditBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeNotice, setUpgradeNotice] = useState<string | null>(null);

  useEffect(() => {
    getCredits()
      .then((c) => setCredits(c))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const currentPlan = credits?.plan || "FREE";
  const isUnlimited = credits?.isUnlimited;

  const handleUpgradeClick = (planKey: PlanType) => {
    if (planKey === currentPlan && !isUnlimited) {
      setUpgradeNotice(`You are currently subscribed to the ${PLAN_CONFIG[planKey].name} plan.`);
      return;
    }
    setUpgradeNotice(
      `Payment processing integration for ${PLAN_CONFIG[planKey].name} ($${PLAN_CONFIG[planKey].priceMonthly}/mo) is coming soon. No charges have been made.`
    );
  };

  const planList = Object.values(PLAN_CONFIG);

  return (
    <DashboardLayout title="Subscription Plans">
      <div className="px-6 lg:px-10 py-8 max-w-[1240px] mx-auto min-h-screen">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8] text-[12px] font-bold tracking-wider uppercase mb-3">
            <Sparkles size={13} />
            <span>TRANSPARENT USAGE LIMITS</span>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#111827] dark:text-white tracking-tight">
            Flexible ATS Evaluation Plans
          </h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-[14.5px] mt-2 leading-relaxed">
            Every analysis consumes 1 verified ATS credit. Resume uploads, history browsing,
            and report downloads are always completely free.
          </p>
        </div>

        {/* Upgrade Notification Banner */}
        {upgradeNotice && (
          <div className="max-w-2xl mx-auto mb-8 bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 border border-[#BFDBFE] dark:border-[#1E40AF] text-[#1E40AF] dark:text-[#93C5FD] p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-[13.5px] font-medium">
              <Info size={18} className="shrink-0 text-[#3B82F6]" />
              <span>{upgradeNotice}</span>
            </div>
            <button
              onClick={() => setUpgradeNotice(null)}
              className="text-[#60A5FA] hover:text-[#1E40AF] dark:hover:text-white text-[13px] font-bold px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
          {planList.map((plan) => {
            const isUserCurrent = !isUnlimited && currentPlan === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 relative ${
                  isPopular
                    ? "bg-[#1E1B4B] text-white border-2 border-[#6366F1] shadow-xl md:-translate-y-2"
                    : "bg-white dark:bg-[#121528] text-[#111827] dark:text-white border border-[#E2E8F0] dark:border-[#1E223D] shadow-sm hover:border-[#CBD5E1] dark:hover:border-[#3730A3]"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[20px] font-black tracking-tight">{plan.name}</h2>
                    {isUserCurrent && (
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          isPopular
                            ? "bg-white/20 text-[#C7D2FE]"
                            : "bg-[#DCFCE7] dark:bg-[#10B981]/20 text-[#16A34A] dark:text-[#34D399]"
                        }`}
                      >
                        CURRENT PLAN
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[13px] leading-relaxed mb-6 ${
                      isPopular ? "text-[#C7D2FE]" : "text-[#64748B] dark:text-[#94A3B8]"
                    }`}
                  >
                    {plan.description}
                  </p>

                  {/* Pricing and Credits */}
                  <div className="mb-6 pb-6 border-b border-gray-200/20 dark:border-gray-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[38px] font-black tracking-tight">
                        ${plan.priceMonthly}
                      </span>
                      <span
                        className={`text-[13px] font-semibold ${
                          isPopular ? "text-[#A5B4FC]" : "text-[#64748B] dark:text-[#94A3B8]"
                        }`}
                      >
                        / month
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-xl font-bold text-[13px] ${
                        isPopular
                          ? "bg-white/10 text-[#FDE047]"
                          : "bg-[#EEF2FF] dark:bg-[#4F46E5]/20 text-[#4F46E5] dark:text-[#818CF8]"
                      }`}
                    >
                      <Zap size={14} />
                      <span>{plan.monthlyCredits} ATS checks / month</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider block ${
                        isPopular ? "text-[#A5B4FC]" : "text-[#94A3B8]"
                      }`}
                    >
                      INCLUDED FEATURES
                    </span>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-[13px]">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isPopular
                              ? "bg-[#6366F1] text-white"
                              : "bg-[#DCFCE7] dark:bg-[#10B981]/20 text-[#16A34A] dark:text-[#34D399]"
                          }`}
                        >
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span
                          className={
                            isPopular ? "text-[#E0E7FF]" : "text-[#334155] dark:text-[#CBD5E1]"
                          }
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div>
                  {isUserCurrent ? (
                    <Link
                      href="/analyze"
                      className={`w-full py-3 px-4 rounded-xl font-bold text-[13.5px] inline-flex items-center justify-center gap-2 transition-all ${
                        isPopular
                          ? "bg-white text-[#1E1B4B] hover:bg-gray-100"
                          : "bg-[#F1F5F9] dark:bg-[#1E223D] text-[#475569] dark:text-[#CBD5E1] hover:bg-[#E2E8F0] dark:hover:bg-[#2A2F50]"
                      }`}
                    >
                      <span>Analyze a Resume</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpgradeClick(plan.id)}
                      className={`w-full py-3 px-4 rounded-xl font-bold text-[13.5px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                        isPopular
                          ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white"
                          : "bg-[#4338CA] hover:bg-[#3730A3] text-white"
                      }`}
                    >
                      {plan.id === "FREE" ? (
                        <span>Get Started Free</span>
                      ) : (
                        <>
                          <Crown size={15} className="text-[#FBBF24]" />
                          <span>Upgrade to {plan.name}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ / Guarantee Footer */}
        <div className="mt-14 bg-white dark:bg-[#121528] rounded-3xl p-7 border border-[#E2E8F0] dark:border-[#1E223D] shadow-xs max-w-3xl mx-auto transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck size={22} className="text-[#10B981]" />
            <h3 className="text-[17px] font-bold text-[#111827] dark:text-white">
              Fair Usage & Credit Protection Guarantee
            </h3>
          </div>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-[13.5px] leading-relaxed">
            Every ATS check is protected by atomic server-side credit reservation. If an analysis
            fails due to external network or service timeouts, your credit is restored
            instantly and marked with a REFUNDED ledger entry. You are never billed for an incomplete
            report.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
