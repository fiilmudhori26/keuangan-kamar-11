"use client";

import { useState, useEffect } from "react";
import { getPublicStudents } from "@/actions/public";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Wallet, User, Loader2, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { StudentData, PaginatedResponse } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function PortalSearchPage() {
  const [data, setData] = useState<PaginatedResponse<StudentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getPublicStudents(1, debouncedSearch, 50);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-lg tracking-tight">Portal Wali</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container px-4 py-8 max-w-3xl mx-auto space-y-6">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Cek Saldo Santri</h1>
          <p className="text-muted-foreground">
            Ketik nama santri untuk melihat sisa uang saku dan riwayat transaksi.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama anak..."
            className="pl-12 h-14 text-lg rounded-full shadow-sm border-muted-foreground/20 focus-visible:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Results List */}
        <div className="mt-8 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed">
              <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Tidak ada nama santri yang cocok.</p>
            </div>
          ) : (
            data?.data.map((student) => (
              <Link key={student.id} href={`/portal/${student.id}`}>
                <Card className="hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{student.fullName}</h3>
                        <p className="text-sm text-muted-foreground">Kamar {student.roomNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div className="hidden sm:block">
                        <p className="text-sm text-muted-foreground">Sisa Saldo</p>
                        <p className="font-medium text-emerald-600">{formatCurrency(student.currentBalance)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
