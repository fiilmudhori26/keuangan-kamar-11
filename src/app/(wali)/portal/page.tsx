"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import {
  User,
  Home,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface StudentInfo {
  id: string;
  full_name: string;
  room_number: string;
  current_balance: number;
}

interface TransactionInfo {
  id: string;
  transaction_date: string;
  description: string;
  type: string;
  amount: number;
  balance_after: number;
}

export default function WaliPortalPage() {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get linked student via RLS
      const { data: guardianLink } = await supabase
        .from("guardian_students")
        .select("student_id")
        .eq("guardian_id", user.id)
        .single();

      if (!guardianLink) return;

      // Get student info via RLS
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("id", guardianLink.student_id)
        .single();

      if (studentData) {
        setStudent(studentData);
      }

      // Get transactions via RLS
      const from = txPage * pageSize;
      const to = from + pageSize - 1;

      const { data: txData, count } = await supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .eq("student_id", guardianLink.student_id)
        .order("transaction_date", { ascending: false })
        .range(from, to);

      if (txData) {
        setTransactions(txData);
        setHasMore((count || 0) > from + pageSize);
      }
    } catch (error) {
      console.error("Error fetching portal data:", error);
    } finally {
      setLoading(false);
    }
  }, [txPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-20 mb-3" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 py-3">
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <Card className="border-0 shadow-md">
        <EmptyState
          icon={User}
          title="Data tidak ditemukan"
          description="Belum ada santri yang terhubung dengan akun Anda. Hubungi pengurus untuk informasi lebih lanjut."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-md animate-fade-in animate-delay-1">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nama Santri</p>
              <p className="font-semibold">{student.full_name}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md animate-fade-in animate-delay-2">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center flex-shrink-0">
              <Home className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kamar</p>
              <p className="font-semibold">Kamar {student.room_number}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md animate-fade-in animate-delay-3">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Saat Ini</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(student.current_balance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History — Read Only */}
      <Card className="border-0 shadow-md animate-fade-in animate-delay-4">
        <CardHeader>
          <CardTitle className="text-lg">Riwayat Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <EmptyState
              icon={ArrowLeftRight}
              title="Belum ada transaksi"
              description="Riwayat transaksi akan muncul di sini"
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
                        {formatDateShort(tx.transaction_date)}
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
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {formatCurrency(tx.balance_after)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Simple pagination */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={txPage <= 0}
                  onClick={() => setTxPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Halaman {txPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setTxPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
