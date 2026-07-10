import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function Loading() {
  return (
    <>
      <PageHeader 
        title="Data Santri" 
        description="Kelola data dan saldo uang saku santri" 
      />
      <TableSkeleton rows={8} />
    </>
  );
}
