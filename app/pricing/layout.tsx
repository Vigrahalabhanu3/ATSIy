import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing & Plans",
  description: "Transparent ATS analysis pricing tiers: Free, Pro, and Premium packages for candidates and professionals.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
