import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Comprehensive ATS diagnostic reports, keyword match tables, and downloadable documentation.",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
