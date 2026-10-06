export type PlanType = "FREE" | "PRO" | "PREMIUM";

export interface PlanDetails {
  id: PlanType;
  name: string;
  monthlyCredits: number;
  priceMonthly: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export type PlanConfigMap = Record<PlanType, PlanDetails>;

export const PLAN_CONFIG: PlanConfigMap = {
  FREE: {
    id: "FREE",
    name: "Free",
    monthlyCredits: 2,
    priceMonthly: 0,
    description: "Ideal for testing your ATS score on target job descriptions.",
    features: [
      "2 ATS analyses per month",
      "Full keyword & skill match scoring",
      "Actionable recommendations & fixes",
      "PDF report generation & download",
      "Resume library storage",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    monthlyCredits: 50,
    priceMonthly: 19,
    description: "For active job seekers submitting applications regularly.",
    popular: true,
    features: [
      "50 ATS analyses per month",
      "Priority AI evaluation speed",
      "Deep experience & project alignment",
      "Unlimited PDF report downloads",
      "Unlimited resume library uploads",
      "Email support",
    ],
  },
  PREMIUM: {
    id: "PREMIUM",
    name: "Premium",
    monthlyCredits: 200,
    priceMonthly: 49,
    description: "For career coaches, executives, and power applicants.",
    features: [
      "200 ATS analyses per month",
      "Fast-track processing pipeline",
      "Deep executive benchmarking",
      "Unlimited resume versioning",
      "Priority customer support",
    ],
  },
};

export const DEFAULT_PLAN: PlanType = "FREE";
export const CREDIT_RESET_DAYS = 30;
