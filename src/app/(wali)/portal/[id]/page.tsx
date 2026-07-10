"use client";

import { useState, useEffect } from "react";
import { getPublicStudentDetails, getPublicStudentTransactions } from "@/actions/public";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, ChevronLeft, Loader2, Wallet, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { StudentData } from "@/types";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PortalStudentDetailsPage() {
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!studentId) return;
      setLoading(true);
      try {
        const [studentResult, txResult] = await Promise.all([
          getPublicStudentDetails(studentId),
          getPublicStudentTransactions(studentId, 1, 50),
        ]);
        
        if (studentResult.success && studentResult.data) {
          setStudent(studentResult.data);
        }
        setTransactions(txResult.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Santri tidak ditemukan</h2>
        <p className="text-muted-foreground mb-6">Mungkin data telah dihapus atau ID salah.</p>
        <Link href="/portal" className="text-emerald-600 font-medium hover:underline flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" /> Kembali ke Pencarian
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-3xl mx-auto">
          <Link href="/portal" className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
            Kembali
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container px-4 py-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-600 to-teal-700 text-primary-foreground overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 mb-3">
                  Kamar {student.roomNumber}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1">
                  {student.fullName}
                </h1>
                <p className="text-emerald-100/80 text-sm">
                  Diperbarui {format(new Date(student.updatedAt), "dd MMM yyyy, HH:mm", { locale: id })}
                </p>
              </div>
              
              <div className="bg-black/20 p-4 rounded-2xl backdrop-blur-sm min-w-[200px]">
                <div className="flex items-center gap-2 text-emerald-100/80 mb-1">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">Sisa Uang Saku</span>
                </div>
                <div className="text-3xl font-bold tracking-tight">
                  {formatCurrency(student.currentBalance)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight px-1">Riwayat Transaksi Terakhir</h2>
          
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="divide-y divide-border/50">
              {transactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Belum ada transaksi.
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-2 rounded-full ${
                        tx.type === "IN" 
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50" 
                          : "bg-rose-100 text-rose-600 dark:bg-rose-950/50"
                      }`}>
                        {tx.type === "IN" ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tx.transactionDate), "dd MMM yyyy • HH:mm", { locale: id })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.type === "IN" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {tx.type === "IN" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Sisa: {formatCurrency(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
