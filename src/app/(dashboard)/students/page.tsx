"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getStudents, deleteStudent } from "@/actions/students";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/use-debounce";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { StudentData, PaginatedResponse } from "@/types";

export default function StudentsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<StudentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getStudents(page, debouncedSearch);
      setData(result);
    } catch {
      toast.error("Gagal memuat data santri");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteStudent(deleteId);
      if (result.success) {
        toast.success("Santri berhasil dihapus");
        fetchStudents();
      } else {
        toast.error(result.error || "Gagal menghapus santri");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Data Santri"
        description="Kelola data dan keuangan santri"
        action={
          <Link href="/students/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Santri
            </Button>
          </Link>
        }
      />

      <Card className="p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama santri atau nomor kamar..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : !data || data.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title={search ? "Tidak ditemukan" : "Belum ada data santri"}
            description={
              search
                ? `Tidak ada santri yang cocok dengan "${search}"`
                : "Mulai dengan menambahkan data santri baru"
            }
            action={
              !search ? (
                <Link href="/students/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Santri
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Santri</TableHead>
                  <TableHead>Kamar</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((student) => (
                  <TableRow key={student.id} className="group">
                    <TableCell className="font-medium">
                      {student.fullName}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        Kamar {student.roomNumber}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-teal dark:text-teal">
                      {formatCurrency(Number(student.currentBalance))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(`/students/${student.id}`)
                          }
                          aria-label="Lihat detail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() =>
                            router.push(`/students/${student.id}`)
                          }
                          aria-label="Edit santri"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeleteId(student.id)}
                          aria-label="Hapus santri"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(page - 1) * data.pageSize + 1}–
                {Math.min(page * data.pageSize, data.total)} dari {data.total}{" "}
                santri
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-2 tabular-nums">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Link
        href="/students/new"
        className="fixed bottom-6 right-6 lg:hidden z-50"
      >
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Hapus Santri?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tindakan ini tidak dapat dibatalkan. Semua data transaksi santri
                  ini juga akan dihapus secara permanen.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
