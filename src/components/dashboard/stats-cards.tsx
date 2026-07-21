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
    accent: "from-teal to-teal/70",
    bg: "bg-teal dark:bg-teal/20",
    lightBg: "bg-teal/10 dark:bg-teal/10",
    iconColor: "text-teal dark:text-teal",
    valueColor: "text-teal dark:text-teal",
  },
  {
    title: "Total Saldo",
    key: "totalBalance" as const,
    icon: Wallet,
    format: (v: number) => formatCurrency(v),
    accent: "from-gold to-gold/70",
    bg: "bg-gold dark:bg-gold/20",
    lightBg: "bg-gold/10 dark:bg-gold/10",
    iconColor: "text-gold dark:text-gold",
    valueColor: "text-gold dark:text-gold",
  },
  {
    title: "Transaksi Hari Ini",
    key: "transactionsToday" as const,
    icon: ArrowLeftRight,
    format: (v: number) => v.toString(),
    accent: "from-primary to-primary/70",
    bg: "bg-primary dark:bg-primary/20",
    lightBg: "bg-primary/10 dark:bg-primary/10",
    iconColor: "text-primary dark:text-primary",
    valueColor: "text-foreground",
  },
  {
    title: "Transaksi Bulan Ini",
    key: "transactionsThisMonth" as const,
    icon: TrendingUp,
    format: (v: number) => v.toString(),
    accent: "from-amber-500 to-amber-500/70",
    bg: "bg-amber-500 dark:bg-amber-500/20",
    lightBg: "bg-amber-500/10 dark:bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    valueColor: "text-foreground",
  },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card
          key={card.key}
          className={`animate-fade-in animate-delay-${index + 1} overflow-hidden relative`}
        >
          <div
            className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.accent} opacity-60`}
          />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <div
                className={`h-9 w-9 rounded-lg ${card.lightBg} flex items-center justify-center`}
              >
                <card.icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold tracking-tight ${card.valueColor}`}>
              {card.format(stats[card.key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
