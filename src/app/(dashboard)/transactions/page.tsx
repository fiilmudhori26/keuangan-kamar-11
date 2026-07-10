"use client";

import { useState, useEffect, useCallback } from "react";
import { getTransactions } from "@/actions/transactions";
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
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  ArrowLeftRight,
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Filter,
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

  return (
    <>
      <PageHeader
        title="Riwayat Transaksi"
        description="Semua transaksi keuangan santri"
      />

      {/* Filters */}
      <Card className="p-4 mb-4 border-0 shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mr-2">Filter:</span>
          {(["today", "week", "month"] as DateFilterType[]).map((f) => (
            <Button
              key={f}
              variant={dateFilter === f ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => {
                setDateFilter(f);
                setShowCustom(false);
              }}
            >
              {f === "today"
                ? "Hari Ini"
                : f === "week"
                ? "Minggu Ini"
                : "Bulan Ini"}
            </Button>
          ))}
          <Button
            variant={dateFilter === "custom" ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => {
              setDateFilter("custom");
              setShowCustom(true);
            }}
          >
            Kustom
          </Button>
        </div>

        {/* Custom date range */}
        {showCustom && (
          <div className="flex flex-wrap gap-4 mt-4 animate-fade-in">
            <div className="space-y-1">
              <Label className="text-xs">Dari</Label>
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Sampai</Label>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex items-end">
              <Button
                size="sm"
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
        <Card className="border-0 shadow-md">
          <EmptyState
            icon={ArrowLeftRight}
            title="Tidak ada transaksi"
            description="Belum ada transaksi pada periode yang dipilih"
          />
        </Card>
      ) : (
        <>
          <Card className="border-0 shadow-md overflow-hidden animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Santri</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Jumlah</TableHead>
                  <TableHead className="text-right">Saldo Setelah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((tx) => (
                  <TableRow key={tx.id} className="group">
                    <TableCell className="text-sm">
                      {formatDateShort(tx.transactionDate)}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/students/${tx.studentId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {tx.student?.fullName || "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {tx.description}
                    </TableCell>
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
          </Card>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {(page - 1) * data.pageSize + 1}–
                {Math.min(page * data.pageSize, data.total)} dari {data.total}{" "}
                transaksi
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
                <span className="text-sm font-medium px-2">
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
    </>
  );
}
