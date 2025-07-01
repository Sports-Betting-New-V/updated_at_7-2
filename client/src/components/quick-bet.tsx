import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Game } from "@shared/schema";

export function QuickBet() {
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [betType, setBetType] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [pick, setPick] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        title: "Bet Placed!",
        description: "Your bet has been placed successfully.",
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
    if (!selectedGameId || !betType || !amount || !pick) {
      toast({
        title: "Missing Information",
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

  return (
    <Card className="bg-[#1E293B] border-[#334155]">
      <CardHeader className="border-b border-[#334155]">
        <CardTitle>Quick Bet</CardTitle>
        <p className="text-sm text-slate-400">Place a simulated bet</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <Label className="text-sm font-medium mb-2 block">Select Game</Label>
          <Select value={selectedGameId} onValueChange={setSelectedGameId}>
            <SelectTrigger className="w-full bg-[#0F172A] border-[#334155] text-slate-50">
              <SelectValue placeholder="Choose a game..." />
            </SelectTrigger>
            <SelectContent className="bg-[#0F172A] border-[#334155]">
              {games?.filter(g => g.status === "upcoming").map((game) => (
                <SelectItem key={game.id} value={game.id.toString()}>
                  {game.awayTeam} @ {game.homeTeam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-sm font-medium mb-2 block">Bet Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={betType === "spread" ? "default" : "outline"}
              onClick={() => setBetType("spread")}
              className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF]"
            >
              Spread
            </Button>
            <Button
              variant={betType === "moneyline" ? "default" : "outline"}
              onClick={() => setBetType("moneyline")}
              className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF]"
            >
              Moneyline
            </Button>
            <Button
              variant={betType === "total" ? "default" : "outline"}
              onClick={() => setBetType("total")}
              className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF]"
            >
              Total
            </Button>
            <Button
              variant={betType === "prop" ? "default" : "outline"}
              onClick={() => setBetType("prop")}
              className="bg-[#0F172A] border-[#334155] hover:border-[#1E40AF]"
            >
              Prop
            </Button>
          </div>
        </div>

        {selectedGame && betType && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Pick</Label>
            <Select value={pick} onValueChange={setPick}>
              <SelectTrigger className="w-full bg-[#0F172A] border-[#334155] text-slate-50">
                <SelectValue placeholder="Choose your pick..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0F172A] border-[#334155]">
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
          <Label className="text-sm font-medium mb-2 block">Bet Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400">$</span>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#0F172A] border-[#334155] pl-8 pr-3 py-2 text-slate-50 focus:border-[#1E40AF]"
              placeholder="100"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Min: $10</span>
            <span>Available: $12,450</span>
          </div>
        </div>
        
        <Button
          onClick={handlePlaceBet}
          disabled={placeBetMutation.isPending}
          className="w-full bg-[#1E40AF] hover:bg-blue-600 text-white py-3"
        >
          {placeBetMutation.isPending ? "Placing..." : "Place Bet"}
        </Button>
      </CardContent>
    </Card>
  );
}
