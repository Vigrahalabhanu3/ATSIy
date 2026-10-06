import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS Evaluation Report",
  description: "Detailed ATS breakdown, keyword match analytics, skill gaps, and bullet point recommendations.",
};

export default function ResultDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
