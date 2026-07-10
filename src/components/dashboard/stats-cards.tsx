import {
  Users,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const statCards = [
  {
    title: "Total Santri",
    key: "totalStudents" as const,
    icon: Users,
    format: (v: number) => v.toString(),
    gradient: "from-blue-500 to-blue-600",
    bgLight: "bg-blue-50 dark:bg-blue-950/50",
    textColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "Total Saldo",
    key: "totalBalance" as const,
    icon: Wallet,
    format: (v: number) => formatCurrency(v),
    gradient: "from-emerald-500 to-emerald-600",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/50",
    textColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Transaksi Hari Ini",
    key: "transactionsToday" as const,
    icon: ArrowLeftRight,
    format: (v: number) => v.toString(),
    gradient: "from-amber-500 to-orange-500",
    bgLight: "bg-amber-50 dark:bg-amber-950/50",
    textColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "Transaksi Bulan Ini",
    key: "transactionsThisMonth" as const,
    icon: TrendingUp,
    format: (v: number) => v.toString(),
    gradient: "from-purple-500 to-purple-600",
    bgLight: "bg-purple-50 dark:bg-purple-950/50",
    textColor: "text-purple-600 dark:text-purple-400",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card
          key={card.key}
          className={`overflow-hidden animate-fade-in animate-delay-${index + 1} border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <div
                className={`h-10 w-10 rounded-xl ${card.bgLight} flex items-center justify-center`}
              >
                <card.icon className={`h-5 w-5 ${card.textColor}`} />
              </div>
            </div>
            <div className="mt-3">
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.format(stats[card.key])}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
