import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Library",
  description: "Secure cloud library for managing, organizing, and versioning your uploaded resumes.",
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
