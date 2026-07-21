import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";

export default function Loading() {
  return (
    <>
      <PageHeader
        title="Kelola Wali Santri"
        description="Buat dan kelola akun wali santri"
      />
      <TableSkeleton rows={5} />
    </>
  );
}
