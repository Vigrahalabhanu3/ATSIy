import DashboardLayout from "@/components/layout/DashboardLayout";
import { TableSkeleton } from "@/components/ui/Skeleton";

export default function ReportsLoading() {
  return (
    <DashboardLayout title="Reports">
      <div className="px-6 lg:px-10 py-7 max-w-[1340px] mx-auto min-h-screen">
        <div className="mb-7 space-y-2">
          <div className="h-7 w-48 bg-gray-200 dark:bg-gray-800 rounded skeleton-shimmer" />
          <div className="h-4 w-72 bg-gray-200 dark:bg-gray-800 rounded skeleton-shimmer" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </DashboardLayout>
  );
}
