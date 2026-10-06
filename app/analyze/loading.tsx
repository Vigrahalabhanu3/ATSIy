import DashboardLayout from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AnalyzeLoading() {
  return (
    <DashboardLayout title="Analyze Resume">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1240px] mx-auto min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Skeletons */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-7 w-52" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>

            {/* Resume Upload Box Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-4">
              <Skeleton className="h-5 w-36" />
              <div className="h-44 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center p-6 space-y-3">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            {/* Job Description Box Skeleton */}
            <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>

            {/* Action Button Skeleton */}
            <div className="flex justify-end">
              <Skeleton className="h-12 w-44 rounded-xl" />
            </div>
          </div>

          {/* Right Column: Score Preview Skeleton */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-6">
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex justify-center py-6">
              <Skeleton className="w-40 h-40 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
