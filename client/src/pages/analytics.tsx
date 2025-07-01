import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, PieChart, TrendingUp, Calendar, Target, DollarSign } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import type { UserStats, BetWithGame } from "@shared/schema";

export default function Analytics() {
  const [timeFrame, setTimeFrame] = useState<string>("30d");
  const [analysisType, setAnalysisType] = useState<string>("performance");

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: bets } = useQuery<BetWithGame[]>({
    queryKey: ["/api/bets"],
  });

  // Prepare data for charts
  const betTypeData = bets?.reduce((acc, bet) => {
    const existing = acc.find(item => item.type === bet.betType);
    if (existing) {
      existing.count += 1;
      existing.winRate = bet.status === "won" ? existing.winRate + 1 : existing.winRate;
    } else {
      acc.push({
        type: bet.betType,
        count: 1,
        winRate: bet.status === "won" ? 1 : 0,
      });
    }
    return acc;
  }, [] as any[])?.map(item => ({
    ...item,
    winRate: (item.winRate / item.count) * 100,
  })) || [];

  const monthlyData = [
    { month: "Jan", profit: 450, bets: 12 },
    { month: "Feb", profit: -200, bets: 8 },
    { month: "Mar", profit: 780, bets: 15 },
    { month: "Apr", profit: 320, bets: 10 },
    { month: "May", profit: 890, bets: 18 },
    { month: "Jun", profit: 1200, bets: 22 },
    { month: "Jul", profit: 650, bets: 14 },
  ];

  const pieColors = ["#1E40AF", "#10B981", "#F59E0B", "#EF4444"];

  const winStreakData = [
    { week: "Week 1", streak: 3 },
    { week: "Week 2", streak: 0 },
    { week: "Week 3", streak: 5 },
    { week: "Week 4", streak: 2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-slate-400 mt-2">Deep insights into your betting performance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={timeFrame} onValueChange={setTimeFrame}>
              <SelectTrigger className="w-32 bg-[#1E293B] border-[#334155]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E293B] border-[#334155]">
                <SelectItem value="7d">7 Days</SelectItem>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Volume</p>
                  <p className="text-2xl font-bold">{formatCurrency(5480)}</p>
                  <p className="text-xs text-[#10B981]">+12.3% vs last period</p>
                </div>
                <DollarSign className="text-[#10B981] text-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Sharp Ratio</p>
                  <p className="text-2xl font-bold">1.47</p>
                  <p className="text-xs text-[#10B981]">Above average</p>
                </div>
                <Target className="text-[#F59E0B] text-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Bet Size</p>
                  <p className="text-2xl font-bold">{formatCurrency(125)}</p>
                  <p className="text-xs text-slate-400">2.1% of bankroll</p>
                </div>
                <BarChart3 className="text-[#1E40AF] text-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E293B] border-[#334155]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Best Streak</p>
                  <p className="text-2xl font-bold">7 wins</p>
                  <p className="text-xs text-[#10B981]">Current: {stats?.currentStreak || 0}</p>
                </div>
                <TrendingUp className="text-[#10B981] text-xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle>Monthly Performance</CardTitle>
              <p className="text-sm text-slate-400">Profit/Loss and betting volume</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      stroke="#10B981"
                      strokeWidth={2}
                      fill="url(#profitGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Bet Type Distribution */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle>Bet Type Performance</CardTitle>
              <p className="text-sm text-slate-400">Win rates by bet type</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={betTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="type" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="winRate" fill="#1E40AF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Analysis */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle>Risk Analysis</CardTitle>
              <p className="text-sm text-slate-400">Bankroll management metrics</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Kelly Criterion</span>
                  <span className="text-sm font-medium">3.2%</span>
                </div>
                <Progress value={32} className="w-full" />
                <p className="text-xs text-slate-400 mt-1">Optimal bet size recommendation</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Risk of Ruin</span>
                  <span className="text-sm font-medium text-[#10B981]">0.8%</span>
                </div>
                <Progress value={8} className="w-full" />
                <p className="text-xs text-slate-400 mt-1">Probability of losing entire bankroll</p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-400">Max Drawdown</span>
                  <span className="text-sm font-medium text-[#F59E0B]">-12.3%</span>
                </div>
                <Progress value={77} className="w-full" />
                <p className="text-xs text-slate-400 mt-1">Largest peak-to-trough decline</p>
              </div>

              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <h4 className="font-medium mb-2 text-[#10B981]">Risk Score: Low</h4>
                <p className="text-xs text-slate-400">
                  Your betting strategy shows good bankroll management with conservative bet sizing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle>Performance Insights</CardTitle>
              <p className="text-sm text-slate-400">AI-generated recommendations</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                  <span className="text-sm font-medium text-[#10B981]">Strong Performance</span>
                </div>
                <p className="text-xs text-slate-400">
                  Your spread betting shows 68% win rate, 15% above average.
                </p>
              </div>

              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div>
                  <span className="text-sm font-medium text-[#F59E0B]">Opportunity</span>
                </div>
                <p className="text-xs text-slate-400">
                  Consider increasing bet sizes on high-confidence picks (8.5+ edge score).
                </p>
              </div>

              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-[#1E40AF] rounded-full"></div>
                  <span className="text-sm font-medium text-[#1E40AF]">Trend Alert</span>
                </div>
                <p className="text-xs text-slate-400">
                  Weekend games show 23% higher profit margins than weekday bets.
                </p>
              </div>

              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-[#EF4444] rounded-full"></div>
                  <span className="text-sm font-medium text-[#EF4444]">Watch Out</span>
                </div>
                <p className="text-xs text-slate-400">
                  Moneyline bets on favorites (-200 or higher) show negative expected value.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Metrics */}
          <Card className="bg-[#1E293B] border-[#334155]">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle>Advanced Metrics</CardTitle>
              <p className="text-sm text-slate-400">Professional analytics</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1E40AF]">2.34</div>
                  <div className="text-xs text-slate-400">Sharpe Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10B981]">18.7%</div>
                  <div className="text-xs text-slate-400">CLV</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#F59E0B]">1.89</div>
                  <div className="text-xs text-slate-400">Sortino Ratio</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#EF4444]">-0.12</div>
                  <div className="text-xs text-slate-400">Max DD</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Hit Rate</span>
                    <span className="font-medium">{formatPercentage(stats?.winRate || 0)}</span>
                  </div>
                  <Progress value={stats?.winRate || 0} className="w-full" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Avg Win</span>
                    <span className="font-medium text-[#10B981]">{formatCurrency(187)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Avg Loss</span>
                    <span className="font-medium text-[#EF4444]">{formatCurrency(-142)}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Win/Loss Ratio</span>
                    <span className="font-medium">1.32</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}