import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function Loading() {
  return (
    <>
      <PageHeader 
        title="Transaksi" 
        description="Kelola pemasukan dan pengeluaran" 
      />
      <TableSkeleton rows={8} />
    </>
  );
}
