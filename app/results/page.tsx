"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";

function ResultsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      router.replace(`/results/${id}`);
    } else {
      router.replace("/analyses");
    }
  }, [router, searchParams]);

  return (
    <div className="px-4 py-16 text-center">
      <div className="inline-block animate-spin w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full mb-4" />
      <p className="text-[#55556A] text-[14px]">Loading your analysis...</p>
    </div>
  );
}

export default function ResultsRedirectPage() {
  return (
    <DashboardLayout title="Resume Analysis">
      <Suspense
        fallback={
          <div className="px-4 py-16 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-3 border-[#4F46E5] border-t-transparent rounded-full mb-4" />
            <p className="text-[#55556A] text-[14px]">Loading your analysis...</p>
          </div>
        }
      >
        <ResultsRedirectContent />
      </Suspense>
    </DashboardLayout>
  );
}
