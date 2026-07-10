"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getStudentById, updateStudent } from "@/actions/students";
import { getStudentTransactions, createTransaction } from "@/actions/transactions";
import { PageHeader } from "@/components/shared/page-header";
import { DetailSkeleton } from "@/components/shared/loading-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  // Dialog states
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Transaction form
  const [txDescription, setTxDescription] = useState("");
  const [txType, setTxType] = useState<"IN" | "OUT">("IN");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editRoom, setEditRoom] = useState("");

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
        <Card className="border-0 shadow-md">
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

      {/* Student Info Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="border-0 shadow-md animate-fade-in animate-delay-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama Santri</p>
              <p className="font-semibold">{student.fullName}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md animate-fade-in animate-delay-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center">
              <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kamar</p>
              <p className="font-semibold">Kamar {student.roomNumber}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md animate-fade-in animate-delay-3">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Number(student.currentBalance))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="border-0 shadow-md animate-fade-in animate-delay-4">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Filter */}
            <div className="flex gap-1">
              {(["today", "week", "month"] as DateFilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={dateFilter === f ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
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
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              size="sm"
              onClick={() => setShowTxDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Tambah Transaksi
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
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Saldo Setelah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-sm">
                        {formatDateShort(tx.transactionDate)}
                      </TableCell>
                      <TableCell>{tx.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant={tx.type === "IN" ? "success" : "warning"}
                          className="gap-1"
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
                        className={`text-right font-semibold ${
                          tx.type === "IN"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {tx.type === "IN" ? "+" : "-"}
                        {formatCurrency(Number(tx.amount))}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(Number(tx.balanceAfter))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {txTotalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {txTotal} transaksi
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={txPage <= 1}
                      onClick={() => setTxPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      {txPage} / {txTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
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

      {/* Add Transaction Dialog */}
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
              <Select
                value={txType}
                onValueChange={(v) => setTxType(v as "IN" | "OUT")}
                disabled={submitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN">💰 Uang Masuk</SelectItem>
                  <SelectItem value="OUT">💸 Uang Keluar</SelectItem>
                </SelectContent>
              </Select>
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
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600"
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

      {/* Edit Student Dialog */}
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
    </>
  );
}
