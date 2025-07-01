import { useState } from "react";
import { Header } from "@/components/header";
import { StatsOverview } from "@/components/stats-overview";
import { AIPredictions } from "@/components/ai-predictions";
import { QuickBet } from "@/components/quick-bet";
import { RecentBets } from "@/components/recent-bets";
import { BankrollChart } from "@/components/bankroll-chart";
import { InsightsPanel } from "@/components/insights-panel";

export default function Dashboard() {
  const [selectedBet, setSelectedBet] = useState(null);

  const handlePlaceBet = (gameId: number, prediction: any) => {
    // This will be handled by the QuickBet component
    console.log("Place bet:", gameId, prediction);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <AIPredictions onPlaceBet={handlePlaceBet} />
          
          <div className="space-y-6">
            <QuickBet />
            <RecentBets />
          </div>
        </div>

        <div className="mt-8">
          <BankrollChart />
        </div>

        <div className="mt-8">
          <InsightsPanel />
        </div>
      </main>
    </div>
  );
}
