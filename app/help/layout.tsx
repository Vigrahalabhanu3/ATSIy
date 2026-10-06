import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & ATS Guide",
  description: "Learn how Applicant Tracking Systems evaluate resumes and how to optimize your scores.",
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
