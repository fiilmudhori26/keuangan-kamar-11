import { Suspense } from "react";
import { getDashboardStats, getRecentTransactions } from "@/actions/transactions";
import { DashboardSkeleton } from "@/components/shared/loading-skeleton";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";

export const metadata = {
  title: "Dashboard — Keuangan Santri",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const [stats, recentTransactions] = await Promise.all([
    getDashboardStats(),
    getRecentTransactions(5),
  ]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Ringkasan keuangan santri hari ini
        </p>
      </div>
      <StatsCards stats={stats} />
      <RecentTransactions transactions={recentTransactions} />
    </div>
  );
}
