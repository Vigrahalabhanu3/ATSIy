import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account",
  description: "Join ATSly today. Evaluate your resume against leading ATS systems with 2 free checks.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
