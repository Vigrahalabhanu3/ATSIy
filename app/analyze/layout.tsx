import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analyze Resume",
  description: "Upload your resume and test against any job description for verified ATS scoring and suggestions.",
};

export default function AnalyzeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
