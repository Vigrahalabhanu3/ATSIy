import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Real-time analytics and tracking for your resumes, credits, and ATS match performance.",
};

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
