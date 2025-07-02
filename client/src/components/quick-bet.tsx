import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Lock, TrendingUp, DollarSign, Shield } from "lucide-react";
import { Link } from "wouter";
import type { Game } from "@shared/schema";

export function QuickBet() {
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [betType, setBetType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [pick, setPick] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: games } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    select: (data) => data?.map(g => ({ ...g, predictions: [] })) || [],
  });

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const res = await apiRequest("POST", "/api/bets", betData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bet Placed! 🎯",
        description: "Your virtual bet has been placed successfully.",
      });
      setSelectedGameId("");
      setBetType("");
      setAmount("");
      setPick("");
      queryClient.invalidateQueries({ queryKey: ["/api/bets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place bet",
        variant: "destructive",
      });
    },
  });

  const selectedGame = games?.find(g => g.id.toString() === selectedGameId);

  const getBetOptions = () => {
    if (!selectedGame) return [];
    
    const options = [];
    if (selectedGame.homeSpread) {
      options.push(
        { value: `${selectedGame.homeTeam} ${selectedGame.homeSpread}`, label: `${selectedGame.homeTeam} ${selectedGame.homeSpread}` },
        { value: `${selectedGame.awayTeam} ${selectedGame.awaySpread}`, label: `${selectedGame.awayTeam} ${selectedGame.awaySpread}` }
      );
    }
    if (selectedGame.homeMoneyline) {
      options.push(
        { value: `${selectedGame.homeTeam} ML`, label: `${selectedGame.homeTeam} ML` },
        { value: `${selectedGame.awayTeam} ML`, label: `${selectedGame.awayTeam} ML` }
      );
    }
    if (selectedGame.totalPoints) {
      options.push(
        { value: `Over ${selectedGame.totalPoints}`, label: `Over ${selectedGame.totalPoints}` },
        { value: `Under ${selectedGame.totalPoints}`, label: `Under ${selectedGame.totalPoints}` }
      );
    }
    return options;
  };

  const handlePlaceBet = () => {
    if (!selectedGameId || !betType || !pick || !amount) {
      toast({
        title: "Incomplete Bet",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    placeBetMutation.mutate({
      gameId: parseInt(selectedGameId),
      betType,
      pick,
      amount,
      odds: -110,
    });
  };

  if (!user) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <CardHeader className="relative border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Secure Betting</CardTitle>
              <p className="text-sm text-blue-600 dark:text-blue-400">Authentication required</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative p-6 text-center space-y-4">
          <div className="p-6 bg-white/50 dark:bg-slate-900/50 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <Lock className="w-12 h-12 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Login Required for Betting
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
              Create your account to access virtual betting with $10,000 starting bankroll
            </p>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <TrendingUp className="w-4 h-4" />
                <span>AI-powered predictions</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                <DollarSign className="w-4 h-4" />
                <span>Virtual currency betting</span>
              </div>
            </div>
          </div>
          
          <Link href="/auth">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
              <Lock className="w-4 h-4 mr-2" />
              Sign Up / Login to Bet
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
      <CardHeader className="border-b border-green-200 dark:border-green-800">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle className="text-green-900 dark:text-green-100">Quick Bet</CardTitle>
            <p className="text-sm text-green-600 dark:text-green-400">Place your virtual bet</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block text-green-900 dark:text-green-100">Select Game</Label>
          <Select value={selectedGameId} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-full border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600">
              <SelectValue placeholder="Choose a game..." />
            </SelectTrigger>
            <SelectContent>
              {games?.filter(g => g.status === "upcoming" || g.status === "scheduled").map((game) => (
                <SelectItem key={game.id} value={game.id.toString()}>
                  {game.awayTeam} @ {game.homeTeam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block text-green-900 dark:text-green-100">Bet Type</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={betType === "spread" ? "default" : "outline"}
              onClick={() => setBetType("spread")}
              className={betType === "spread" ? "bg-green-600 hover:bg-green-700" : "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"}
            >
              Spread
            </Button>
            <Button
              variant={betType === "moneyline" ? "default" : "outline"}
              onClick={() => setBetType("moneyline")}
              className={betType === "moneyline" ? "bg-green-600 hover:bg-green-700" : "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"}
            >
              Moneyline
            </Button>
            <Button
              variant={betType === "total" ? "default" : "outline"}
              onClick={() => setBetType("total")}
              className={betType === "total" ? "bg-green-600 hover:bg-green-700" : "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600"}
            >
              Total
            </Button>
          </div>
        </div>

        {selectedGame && betType && (
          <div>
            <Label className="text-sm font-medium mb-2 block text-green-900 dark:text-green-100">Pick</Label>
            <Select value={pick} onValueChange={setPick}>
              <SelectTrigger className="w-full border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600">
                <SelectValue placeholder="Select your pick..." />
              </SelectTrigger>
              <SelectContent>
                {getBetOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block text-green-900 dark:text-green-100">Bet Amount ($)</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
            className="border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600"
          />
        </div>

        <Button
          onClick={handlePlaceBet}
          disabled={!selectedGameId || !betType || !pick || !amount || placeBetMutation.isPending}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg disabled:opacity-50"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          {placeBetMutation.isPending ? "Placing Bet..." : "Place Virtual Bet"}
        </Button>
      </CardContent>
    </Card>
  );
}