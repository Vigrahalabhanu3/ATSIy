import DashboardLayout from "@/components/layout/DashboardLayout";
import { AnalysisDetailSkeleton } from "@/components/ui/Skeleton";

export default function ReportDetailLoading() {
  return (
    <DashboardLayout title="Report Details">
      <AnalysisDetailSkeleton />
    </DashboardLayout>
  );
}
