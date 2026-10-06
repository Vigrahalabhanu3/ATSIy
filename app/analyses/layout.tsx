import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Analyses",
  description: "Complete historical record of all your ATS evaluations and keyword match scores.",
};

export default function AnalysesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
