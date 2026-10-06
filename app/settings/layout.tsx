import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & Credit Ledger",
  description: "Manage your user profile, theme preferences, active subscription plan, and credit usage audit history.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
