import DashboardLayout from "@/components/layout/DashboardLayout";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <DashboardLayout title="Settings">
      <div className="px-6 lg:px-10 py-7 max-w-[1100px] mx-auto min-h-screen">
        <div className="mb-7 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Tab row */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-[#ECEFF8] shadow-xs space-y-5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-80" />
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
