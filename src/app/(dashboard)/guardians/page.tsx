"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGuardians,
  createGuardian,
  deleteGuardian,
} from "@/actions/guardians";
import { getAllStudentsSimple } from "@/actions/students";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  UserCog,
  Plus,
  Trash2,
  Search,
  Loader2,
  Save,
  Mail,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { GuardianStudentData, PaginatedResponse } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";

export default function GuardiansPage() {
  const [data, setData] = useState<PaginatedResponse<GuardianStudentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formStudentId, setFormStudentId] = useState("");
  const [students, setStudents] = useState<{ id: string; fullName: string; roomNumber: string }[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const fetchGuardians = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getGuardians(page, debouncedSearch);
      setData(result);
    } catch {
      toast.error("Gagal memuat data wali");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    async function loadStudents() {
      try {
        const result = await getAllStudentsSimple();
        setStudents(result);
      } catch {
        // Ignore
      }
    }
    loadStudents();
  }, []);

  async function handleAddGuardian() {
    if (!formName || !formEmail || !formPassword || !formStudentId) {
      toast.error("Semua field wajib diisi");
      return;
    }
    if (formPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createGuardian(
        formName,
        formEmail,
        formPassword,
        formStudentId
      );
      if (result.success) {
        toast.success("Akun wali berhasil dibuat");
        setShowAddDialog(false);
        resetForm();
        fetchGuardians();
      } else {
        toast.error(result.error || "Gagal membuat akun wali");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteGuardian(deleteId);
      if (result.success) {
        toast.success("Akun wali berhasil dihapus");
        fetchGuardians();
      } else {
        toast.error(result.error || "Gagal menghapus wali");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  function resetForm() {
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormStudentId("");
  }

  return (
    <>
      <PageHeader
        title="Kelola Wali Santri"
        description="Buat dan kelola akun wali santri"
        action={
          <Button
            className="gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Tambah Wali
          </Button>
        }
      />

      <Card className="p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email wali..."
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
            icon={UserCog}
            title={search ? "Tidak ditemukan" : "Belum ada akun wali"}
            description={
              search
                ? `Tidak ada wali yang cocok dengan "${search}"`
                : "Buat akun wali santri untuk memberikan akses baca ke data keuangan"
            }
            action={
              !search ? (
                <Button
                  className="gap-2"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Wali
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Nama Wali</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Santri</TableHead>
                    <TableHead className="whitespace-nowrap">Kamar</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((gs) => (
                    <TableRow key={gs.id} className="group">
                      <TableCell className="font-medium whitespace-nowrap">
                        {gs.guardian?.fullName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {gs.guardian?.email}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{gs.student?.fullName}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="secondary" className="font-normal">
                          Kamar {gs.student?.roomNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={() => setDeleteId(gs.guardianId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {data.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                {data.total} wali terdaftar
              </p>
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[36px] min-w-[36px]"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-3 tabular-nums">
                  {page} / {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[36px] min-w-[36px]"
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

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Akun Wali</DialogTitle>
            <DialogDescription>
              Buat akun baru untuk wali santri. Wali hanya dapat melihat data
              santri yang terhubung.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Wali *</Label>
              <Input
                placeholder="Masukkan nama wali"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                placeholder="email@contoh.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Password *</Label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Santri yang Dihubungkan *</Label>
              <Select
                value={formStudentId}
                onValueChange={setFormStudentId}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih santri" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName} — Kamar {s.roomNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleAddGuardian}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Buat Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Hapus Akun Wali?</AlertDialogTitle>
                <AlertDialogDescription>
                  Akun wali ini akan dihapus secara permanen dan tidak dapat
                  mengakses data santri lagi.
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
