import DashboardLayout from "@/components/layout/DashboardLayout";
import { StatsGridSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="px-6 lg:px-10 py-7 max-w-[1340px] mx-auto min-h-screen">
        {/* Top Welcome Skeleton */}
        <div className="mb-8 space-y-2">
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded skeleton-shimmer" />
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-gray-800 rounded skeleton-shimmer" />
        </div>

        {/* Quick Action Banner Skeleton */}
        <div className="h-28 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8 skeleton-shimmer" />

        {/* 4 Stat Cards Skeleton */}
        <StatsGridSkeleton />

        {/* Recent Analyses Table Skeleton */}
        <TableSkeleton rows={4} cols={5} />
      </div>
    </DashboardLayout>
  );
}
