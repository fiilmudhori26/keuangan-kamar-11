"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getStudentById, updateStudent } from "@/actions/students";
import { getStudentTransactions, createTransaction, deleteTransaction } from "@/actions/transactions";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Wallet,
  Home,
  User,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Pencil,
  Loader2,
  Save,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { StudentData, TransactionData, DateFilterType } from "@/types";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txTotalPages, setTxTotalPages] = useState(0);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("month");

  const [showTxDialog, setShowTxDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [txDescription, setTxDescription] = useState("");
  const [txType, setTxType] = useState<"IN" | "OUT">("IN");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  const [editName, setEditName] = useState("");
  const [editRoom, setEditRoom] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [studentResult, txResult] = await Promise.all([
        getStudentById(studentId),
        getStudentTransactions(studentId, txPage, dateFilter),
      ]);

      if (studentResult.success && studentResult.data) {
        setStudent(studentResult.data);
        setEditName(studentResult.data.fullName);
        setEditRoom(studentResult.data.roomNumber);
      }

      setTransactions(txResult.data);
      setTxTotal(txResult.total);
      setTxTotalPages(txResult.totalPages);
    } catch {
      toast.error("Gagal memuat data santri");
    } finally {
      setLoading(false);
    }
  }, [studentId, txPage, dateFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAddTransaction() {
    if (!txDescription || !txAmount || !txDate) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createTransaction(
        studentId,
        txDescription,
        txType,
        parseFloat(txAmount),
        txDate
      );

      if (result.success) {
        toast.success("Transaksi berhasil disimpan");
        setShowTxDialog(false);
        setTxDescription("");
        setTxAmount("");
        setTxType("IN");
        setTxDate(new Date().toISOString().split("T")[0]);
        fetchData();
      } else {
        toast.error(result.error || "Gagal menyimpan transaksi");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditStudent() {
    if (!editName || !editRoom) {
      toast.error("Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const result = await updateStudent(studentId, editName, editRoom);
      if (result.success) {
        toast.success("Data santri berhasil diperbarui");
        setShowEditDialog(false);
        fetchData();
      } else {
        toast.error(result.error || "Gagal mengupdate data");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteTransaction(deleteId);
      if (result.success) {
        toast.success("Transaksi berhasil dihapus");
        setDeleteId(null);
        fetchData();
      } else {
        toast.error(result.error || "Gagal menghapus transaksi");
      }
    } catch {
      toast.error("Gagal menghapus transaksi");
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !student) {
    return (
      <>
        <PageHeader title="Detail Santri" />
        <DetailSkeleton />
      </>
    );
  }

  if (!student) {
    return (
      <>
        <PageHeader title="Santri Tidak Ditemukan" />
        <Card>
          <EmptyState
            icon={User}
            title="Santri tidak ditemukan"
            description="Data santri yang Anda cari tidak tersedia"
            action={
              <Link href="/students">
                <Button>Kembali ke Data Santri</Button>
              </Link>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={student.fullName}
        description={`Kamar ${student.roomNumber}`}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Link href="/students">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="animate-fade-in animate-delay-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama Santri</p>
              <p className="font-semibold">{student.fullName}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center">
              <Home className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kamar</p>
              <p className="font-semibold">Kamar {student.roomNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in animate-delay-3">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-teal/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-teal" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
              <p className="text-xl font-bold text-teal dark:text-teal">
                {formatCurrency(Number(student.currentBalance))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in animate-delay-4">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              {(["today", "week", "month"] as DateFilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={dateFilter === f ? "default" : "outline"}
                  size="sm"
                  className="text-xs whitespace-nowrap min-h-[36px]"
                  onClick={() => {
                    setDateFilter(f);
                    setTxPage(1);
                  }}
                >
                  {f === "today"
                    ? "Hari Ini"
                    : f === "week"
                    ? "Minggu Ini"
                    : "Bulan Ini"}
                </Button>
              ))}
            </div>
            <Button
              className="gap-2 min-h-[36px]"
              size="sm"
              onClick={() => setShowTxDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Tambah
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="Belum ada transaksi"
              description="Tambahkan transaksi pertama untuk santri ini"
              action={
                <Button
                  className="gap-2"
                  onClick={() => setShowTxDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Tambah Transaksi
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                      <TableHead className="whitespace-nowrap">Deskripsi</TableHead>
                      <TableHead className="whitespace-nowrap">Jenis</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Jumlah</TableHead>
                      <TableHead className="whitespace-nowrap text-right">Saldo</TableHead>
                      <TableHead className="w-[56px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="group">
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDateShort(tx.transactionDate)}
                        </TableCell>
                        <TableCell className="max-w-[160px] sm:max-w-[200px] truncate">
                          {tx.description}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={tx.type === "IN" ? "success" : "warning"}
                            className="gap-1 whitespace-nowrap"
                          >
                            {tx.type === "IN" ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {tx.type === "IN" ? "Masuk" : "Keluar"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold tabular-nums whitespace-nowrap ${
                            tx.type === "IN"
                              ? "text-teal dark:text-teal"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {tx.type === "IN" ? "+" : "-"}
                          {formatCurrency(Number(tx.amount))}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums whitespace-nowrap">
                          {formatCurrency(Number(tx.balanceAfter))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground/50 hover:text-destructive md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            onClick={() => setDeleteId(tx.id)}
                            title="Hapus transaksi"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {txTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground order-2 sm:order-1">
                    {txTotal} transaksi
                  </p>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[36px] min-w-[36px]"
                      disabled={txPage <= 1}
                      onClick={() => setTxPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium px-3 tabular-nums">
                      {txPage} / {txTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[36px] min-w-[36px]"
                      disabled={txPage >= txTotalPages}
                      onClick={() => setTxPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showTxDialog} onOpenChange={setShowTxDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
            <DialogDescription>
              Tambahkan transaksi untuk {student.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Deskripsi *</Label>
              <Input
                placeholder="Contoh: Uang saku mingguan"
                value={txDescription}
                onChange={(e) => setTxDescription(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Jenis Transaksi *</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setTxType("IN")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 min-h-[48px]",
                    txType === "IN"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400 shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-emerald-200 hover:bg-emerald-50/50 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20"
                  )}
                >
                  <ArrowDownRight className="h-5 w-5" />
                  Uang Masuk
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setTxType("OUT")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 min-h-[48px]",
                    txType === "OUT"
                      ? "border-red-500 bg-red-50 text-red-700 dark:border-red-500 dark:bg-red-950/40 dark:text-red-400 shadow-sm"
                      : "border-border bg-background text-muted-foreground hover:border-red-200 hover:bg-red-50/50 dark:hover:border-red-800 dark:hover:bg-red-950/20"
                  )}
                >
                  <ArrowUpRight className="h-5 w-5" />
                  Uang Keluar
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Jumlah (Rp) *</Label>
              <Input
                type="number"
                placeholder="0"
                min="1"
                value={txAmount}
                onChange={(e) => setTxAmount(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Tanggal *</Label>
              <Input
                type="date"
                value={txDate}
                onChange={(e) => setTxDate(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTxDialog(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleAddTransaction}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Santri</DialogTitle>
            <DialogDescription>
              Perbarui informasi santri
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Santri *</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Kamar *</Label>
              <Input
                value={editRoom}
                onChange={(e) => setEditRoom(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              onClick={handleEditStudent}
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus transaksi ini? Saldo santri akan dikembalikan seperti sebelum transaksi.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
