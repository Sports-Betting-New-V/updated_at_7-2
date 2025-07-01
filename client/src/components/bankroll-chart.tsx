import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import type { UserStats } from "@shared/schema";

export function BankrollChart() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  if (isLoading) {
    return (
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <CardTitle>Bankroll Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-[#0F172A] rounded border border-[#334155] animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = stats?.bankrollHistory.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
  })) || [];

  return (
    <Card className="bg-[#1E293B] border-[#334155]">
      <CardHeader className="border-b border-[#334155]">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bankroll Performance</CardTitle>
            <p className="text-sm text-slate-400">Your betting journey over time</p>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" className="bg-[#1E40AF] text-white">30D</Button>
            <Button size="sm" variant="outline" className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF]">90D</Button>
            <Button size="sm" variant="outline" className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF]">1Y</Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="bankrollGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#bankrollGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
