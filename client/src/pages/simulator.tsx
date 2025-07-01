import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, RotateCcw, Trophy, Target, Zap } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { Game, BetWithGame } from "@shared/schema";

export default function Simulator() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    select: (data) => data?.filter(g => g.status === "upcoming") || [],
  });

  const { data: pendingBets } = useQuery<BetWithGame[]>({
    queryKey: ["/api/bets"],
    select: (data) => data?.filter(bet => bet.status === "pending") || [],
  });

  const simulateGameMutation = useMutation({
    mutationFn: async (gameId: number) => {
      const res = await apiRequest("POST", `/api/games/${gameId}/simulate`, {});
      return res.json();
    },
    onSuccess: (data) => {
      setSimulationResults(data);
      toast({
        title: "Game Simulated!",
        description: `Updated ${data.updatedBets} bets with results.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: () => {
      toast({
        title: "Simulation Failed",
        description: "Unable to simulate game results",
        variant: "destructive",
      });
    },
  });

  const simulateAllMutation = useMutation({
    mutationFn: async () => {
      const results = [];
      const upcomingGames = games?.filter(g => g.status === "upcoming") || [];
      
      for (const game of upcomingGames) {
        try {
          const res = await apiRequest("POST", `/api/games/${game.id}/simulate`, {});
          const data = await res.json();
          results.push({ game: game.homeTeam + " vs " + game.awayTeam, ...data });
        } catch (error) {
          console.error(`Failed to simulate game ${game.id}`, error);
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      const totalUpdatedBets = results.reduce((sum, r) => sum + (r.updatedBets || 0), 0);
      toast({
        title: "All Games Simulated!",
        description: `Simulated ${results.length} games and updated ${totalUpdatedBets} bets.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      setSimulationResults({ 
        multipleGames: true, 
        results,
        totalGames: results.length,
        totalUpdatedBets: totalUpdatedBets
      });
    },
  });

  const handleSimulateGame = (gameId: number) => {
    setSelectedGameId(gameId);
    simulateGameMutation.mutate(gameId);
  };

  const handleSimulateAll = () => {
    simulateAllMutation.mutate();
  };

  const resetSimulation = () => {
    setSimulationResults(null);
    setSelectedGameId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Betting Simulator</h1>
            <p className="text-slate-400 mt-2">Simulate game outcomes and see bet results</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="bg-[#1E293B] border-[#334155] hover:border-[#1E40AF]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            <Button
              onClick={handleSimulateAll}
              disabled={simulateAllMutation.isPending || !games?.length}
              className="bg-[#10B981] hover:bg-green-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              {simulateAllMutation.isPending ? "Simulating..." : "Simulate All"}
            </Button>
          </div>
        </div>

        {/* Simulation Results */}
        {simulationResults && (
          <Card className="bg-[#1E293B] border-[#334155] mb-8">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-[#F59E0B]" />
                Simulation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {simulationResults.multipleGames ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-[#0F172A] rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#10B981]">
                        {simulationResults.totalGames}
                      </div>
                      <div className="text-sm text-slate-400">Games Simulated</div>
                    </div>
                    <div className="bg-[#0F172A] rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#1E40AF]">
                        {simulationResults.totalUpdatedBets}
                      </div>
                      <div className="text-sm text-slate-400">Bets Updated</div>
                    </div>
                    <div className="bg-[#0F172A] rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#F59E0B]">
                        {Math.round((simulationResults.totalUpdatedBets / Math.max(simulationResults.totalGames, 1)) * 100) / 100}
                      </div>
                      <div className="text-sm text-slate-400">Avg Bets/Game</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#0F172A] rounded-lg p-4">
                      <h4 className="font-medium mb-2">Game Result</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Home Score:</span>
                          <span className="font-bold">{simulationResults.gameResult?.homeScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Away Score:</span>
                          <span className="font-bold">{simulationResults.gameResult?.awayScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Points:</span>
                          <span className="font-bold">
                            {(simulationResults.gameResult?.homeScore || 0) + (simulationResults.gameResult?.awayScore || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0F172A] rounded-lg p-4">
                      <h4 className="font-medium mb-2">Betting Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Bets Updated:</span>
                          <span className="font-bold text-[#1E40AF]">{simulationResults.updatedBets}</span>
                        </div>
                        <div className="text-sm text-slate-400">
                          Check your betting history to see win/loss results
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pending Bets Summary */}
        {pendingBets && pendingBets.length > 0 && (
          <Card className="bg-[#1E293B] border-[#334155] mb-8">
            <CardHeader className="border-b border-[#334155]">
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-[#F59E0B]" />
                Pending Bets ({pendingBets.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBets.map((bet) => (
                  <div key={bet.id} className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">
                        {bet.game.homeTeam} vs {bet.game.awayTeam}
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        Pending
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400 mb-1">
                      {bet.pick} • {formatCurrency(bet.amount)}
                    </div>
                    <div className="text-xs text-slate-500">
                      Placed {new Date(bet.placedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Games for Simulation */}
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardHeader className="border-b border-[#334155]">
            <CardTitle>Available Games</CardTitle>
            <p className="text-sm text-slate-400">Click to simulate individual game results</p>
          </CardHeader>
          <CardContent className="p-6">
            {games?.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No upcoming games available for simulation
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games?.map((game) => (
                  <Card key={game.id} className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF] transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="font-bold">{game.awayTeam} @ {game.homeTeam}</div>
                          <div className="text-sm text-slate-400">
                            {new Date(game.gameTime).toLocaleDateString()} • {game.sport}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-400">Spread:</span>
                            <div className="font-medium">{game.homeSpread || "N/A"}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Total:</span>
                            <div className="font-medium">{game.totalPoints || "N/A"}</div>
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => handleSimulateGame(game.id)}
                          disabled={simulateGameMutation.isPending && selectedGameId === game.id}
                          className="w-full bg-[#1E40AF] hover:bg-blue-600 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          {simulateGameMutation.isPending && selectedGameId === game.id ? "Simulating..." : "Simulate"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}