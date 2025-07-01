import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Percent, Calculator, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { UserStats } from "@shared/schema";

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
              <p className={`text-2xl font-bold ${stats.totalPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stats.totalPL >= 0 ? '+' : ''}{formatCurrency(stats.totalPL)}
              </p>
            </div>
            <TrendingUp className={`text-xl ${stats.totalPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            <span className={stats.totalPL >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {stats.totalPL >= 0 ? '↑' : '↓'} {formatPercentage(Math.abs(stats.roi))}
            </span> vs last month
          </div>
        </CardContent>
      </Card>

      <Card className="">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Win Rate</p>
              <p className="text-2xl font-bold">{formatPercentage(stats.winRate)}</p>
            </div>
            <Percent className="text-orange-500 text-xl" />
          </div>
          <div className="mt-2 text-sm text-slate-400">
            <span className="text-green-500">↑ 3.2%</span> this week
          </div>
        </CardContent>
      </Card>

      <Card className="">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Bets</p>
              <p className="text-2xl font-bold">{stats.totalBets}</p>
            </div>
            <Calculator className="text-blue-500 text-xl" />
          </div>
          <div className="mt-2 text-sm text-slate-400">
            Last bet: 2 hours ago
          </div>
        </CardContent>
      </Card>

      <Card className="">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">ROI</p>
              <p className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.roi >= 0 ? '+' : ''}{formatPercentage(stats.roi)}
              </p>
            </div>
            <PieChart className={`text-xl ${stats.roi >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {stats.currentStreak > 0 ? `${stats.currentStreak} win streak` : 'Above average: 8.3%'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
