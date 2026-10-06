import DashboardLayout from "@/components/layout/DashboardLayout";
import { ResumeCardsSkeleton, TableSkeleton } from "@/components/ui/Skeleton";

export default function LibraryLoading() {
  return (
    <DashboardLayout title="Resume Library">
      <div className="px-6 lg:px-10 py-7 max-w-[1340px] mx-auto min-h-screen">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <div className="h-7 w-52 bg-gray-200 dark:bg-gray-800 rounded skeleton-shimmer" />
            <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded skeleton-shimmer" />
          </div>
          <div className="h-10 w-36 bg-gray-200 dark:bg-gray-800 rounded-xl skeleton-shimmer" />
        </div>
        <ResumeCardsSkeleton />
      </div>
    </DashboardLayout>
  );
}
