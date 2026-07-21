"use client";

import { useState, useEffect, useCallback } from "react";
import { getTransactions, deleteTransaction } from "@/actions/transactions";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import type { TransactionData, DateFilterType, PaginatedResponse } from "@/types";
import Link from "next/link";

export default function TransactionsPage() {
  const [data, setData] = useState<PaginatedResponse<TransactionData & { student?: { fullName: string; roomNumber: string } }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState<DateFilterType>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getTransactions(
        page,
        dateFilter,
        dateFilter === "custom" ? customFrom : undefined,
        dateFilter === "custom" ? customTo : undefined
      );
      setData(result);
    } catch {
      toast.error("Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  }, [page, dateFilter, customFrom, customTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const result = await deleteTransaction(deleteId);
      if (result.success) {
        toast.success("Transaksi berhasil dihapus");
        setDeleteId(null);
        fetchTransactions();
      } else {
        toast.error(result.error || "Gagal menghapus transaksi");
      }
    } catch {
      toast.error("Gagal menghapus transaksi");
    } finally {
      setDeleting(false);
    }
  };

  const filters: { key: DateFilterType; label: string }[] = [
    { key: "today", label: "Hari Ini" },
    { key: "week", label: "Minggu Ini" },
    { key: "month", label: "Bulan Ini" },
  ];

  return (
    <>
      <PageHeader
        title="Riwayat Transaksi"
        description="Semua transaksi keuangan santri"
      />

      <Card className="p-3 sm:p-4 mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map((f) => (
            <Button
              key={f.key}
              variant={dateFilter === f.key ? "default" : "outline"}
              size="sm"
              className="text-xs whitespace-nowrap min-h-[36px]"
              onClick={() => {
                setDateFilter(f.key);
                setShowCustom(false);
              }}
            >
              {f.label}
            </Button>
          ))}
          <Button
            variant={dateFilter === "custom" ? "default" : "outline"}
            size="sm"
            className="text-xs whitespace-nowrap min-h-[36px]"
            onClick={() => {
              setDateFilter("custom");
              setShowCustom(true);
            }}
          >
            Kustom
          </Button>
        </div>

        {showCustom && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4 animate-fade-in">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Dari</Label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Sampai</Label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button
                size="default"
                className="w-full sm:w-auto min-h-[44px]"
                onClick={() => {
                  setPage(1);
                  fetchTransactions();
                }}
              >
                Terapkan
              </Button>
            </div>
          </div>
        )}
      </Card>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : !data || data.data.length === 0 ? (
        <Card>
          <EmptyState
            icon={ArrowLeftRight}
            title="Tidak ada transaksi"
            description="Belum ada transaksi pada periode yang dipilih"
          />
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                    <TableHead className="whitespace-nowrap">Santri</TableHead>
                    <TableHead className="whitespace-nowrap">Deskripsi</TableHead>
                    <TableHead className="whitespace-nowrap">Jenis</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Jumlah</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Saldo</TableHead>
                    <TableHead className="w-[56px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((tx) => (
                    <TableRow key={tx.id} className="group">
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDateShort(tx.transactionDate)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Link
                          href={`/students/${tx.studentId}`}
                          className="text-primary hover:underline font-medium"
                        >
                          {tx.student?.fullName || "—"}
                        </Link>
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
          </Card>

          {data.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Menampilkan {(page - 1) * data.pageSize + 1}–
                {Math.min(page * data.pageSize, data.total)} dari {data.total}{" "}
                transaksi
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
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
