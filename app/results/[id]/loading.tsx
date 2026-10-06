import DashboardLayout from "@/components/layout/DashboardLayout";
import { AnalysisDetailSkeleton } from "@/components/ui/Skeleton";

export default function AnalysisDetailLoading() {
  return (
    <DashboardLayout title="Resume Analysis">
      <AnalysisDetailSkeleton />
    </DashboardLayout>
  );
}
