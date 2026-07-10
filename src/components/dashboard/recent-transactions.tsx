import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, ArrowLeftRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

interface Transaction {
  id: string;
  studentId: string;
  transactionDate: Date;
  description: string;
  type: "IN" | "OUT";
  amount: unknown;
  balanceAfter: unknown;
  createdAt: Date;
  student?: { fullName: string; roomNumber: string };
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="animate-fade-in animate-delay-4 border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold">
          Transaksi Terbaru
        </CardTitle>
        <Link href="/transactions">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            Lihat Semua
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Belum ada transaksi"
            description="Transaksi akan muncul di sini setelah ditambahkan"
          />
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <Link
                key={tx.id}
                href={`/students/${tx.studentId}`}
                className="flex items-center gap-4 rounded-lg p-3 hover:bg-muted/50 transition-colors group"
              >
                {/* Icon */}
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "IN"
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {tx.type === "IN" ? (
                    <ArrowDownRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {tx.student?.fullName || "Santri"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.description}
                  </p>
                </div>

                {/* Amount & Date */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === "IN"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {tx.type === "IN" ? "+" : "-"}
                    {formatCurrency(Number(tx.amount))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateShort(tx.transactionDate)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
