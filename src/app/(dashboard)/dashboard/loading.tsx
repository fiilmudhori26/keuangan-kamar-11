import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function Loading() {
  return (
    <>
      <PageHeader 
        title="Dashboard" 
        description="Ringkasan keuangan dan aktivitas terbaru" 
      />
      <DashboardSkeleton />
    </>
  );
}
