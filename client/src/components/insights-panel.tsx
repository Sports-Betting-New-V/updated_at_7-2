import { useQuery } from "@tanstack/react-query";
import { Lightbulb, BarChart3, Calendar, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UserStats } from "@shared/schema";

export function InsightsPanel() {
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader className="border-b border-[#334155]">
          <CardTitle>AI Insights</CardTitle>
          <p className="text-sm text-slate-400">Personalized recommendations</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[#10B981]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Lightbulb className="text-[#10B981] w-4 h-4" />
            </div>
            <div>
              <div className="font-medium">Strong Recent Performance</div>
              <div className="text-sm text-slate-400">
                You've won {stats?.currentStreak || 0} of your recent bets. Consider increasing bet sizes on high-confidence picks.
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[#F59E0B]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <BarChart3 className="text-[#F59E0B] w-4 h-4" />
            </div>
            <div>
              <div className="font-medium">Spread Betting Strength</div>
              <div className="text-sm text-slate-400">
                Your spread bets have a {stats?.winRate.toFixed(0) || 0}% win rate. Focus more on spreads over moneylines.
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-[#1E40AF]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Calendar className="text-[#1E40AF] w-4 h-4" />
            </div>
            <div>
              <div className="font-medium">Weekend Games Alert</div>
              <div className="text-sm text-slate-400">
                Your weekend betting performance is 15% better than weekdays. Plan accordingly.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader className="border-b border-[#334155]">
          <CardTitle>Risk Management</CardTitle>
          <p className="text-sm text-slate-400">Keep your bankroll healthy</p>
        </CardHeader>
        
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Daily Risk Limit</span>
            <span className="font-medium">$500 / $1,000</span>
          </div>
          <Progress value={50} className="w-full" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Largest Bet Size</span>
            <span className="font-medium">$300 (2.4%)</span>
          </div>
          <Progress value={24} className="w-full" />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Win Streak</span>
            <span className="font-medium text-[#10B981]">{stats?.currentStreak || 0} bets</span>
          </div>
          
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
            <div className="flex items-center space-x-2">
              <Shield className="text-[#1E40AF] w-4 h-4" />
              <span className="text-sm font-medium">Bankroll Protection Active</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Auto-stop at 10% daily loss activated
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
