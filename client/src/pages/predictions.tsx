import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, TrendingUp, Filter, Star } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getConfidenceColor, getTagColor, formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import type { GameWithPredictions, Prediction } from "@shared/schema";

export default function Predictions() {
  const [confidenceFilter, setConfidenceFilter] = useState<string>("all");
  const [sportFilter, setSportFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: games, isLoading } = useQuery<GameWithPredictions[]>({
    queryKey: ["/api/games"],
  });

  const generatePredictionsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/predictions/generate", {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Predictions Generated!",
        description: "New AI predictions have been generated for upcoming games.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate predictions",
        variant: "destructive",
      });
    },
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

  const filteredGames = games?.filter(game => {
    const hasPredictions = game.predictions.length > 0;
    const sportMatch = sportFilter === "all" || game.sport === sportFilter;
    const confidenceMatch = confidenceFilter === "all" || 
      game.predictions.some(p => p.confidenceTier === confidenceFilter);
    
    return hasPredictions && sportMatch && confidenceMatch;
  }) || [];

  const handlePlaceBet = (gameId: number, prediction: Prediction) => {
    const odds = prediction.betType === "moneyline" ? -110 : -110; // Simplified odds
    
    placeBetMutation.mutate({
      gameId,
      predictionId: prediction.id,
      betType: prediction.betType,
      pick: prediction.recommendedPick,
      amount: "100.00", // Default bet amount
      odds,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-16 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Predictions</h1>
            <p className="text-muted-foreground mt-2">Machine learning powered betting recommendations</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => generatePredictionsMutation.mutate()}
              disabled={generatePredictionsMutation.isPending}
              variant="outline"
              className=" hover:border-[#1E40AF]"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${generatePredictionsMutation.isPending ? 'animate-spin' : ''}`} />
              Generate New
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mb-8">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>
          
          <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
            <SelectTrigger className="w-48 ">
              <SelectValue placeholder="Confidence Level" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High Confidence</SelectItem>
              <SelectItem value="medium">Medium Confidence</SelectItem>
              <SelectItem value="low">Low Confidence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sportFilter} onValueChange={setSportFilter}>
            <SelectTrigger className="w-48 ">
              <SelectValue placeholder="Sport" />
            </SelectTrigger>
            <SelectContent className="">
              <SelectItem value="all">All Sports</SelectItem>
              <SelectItem value="NBA">NBA</SelectItem>
              <SelectItem value="NFL">NFL</SelectItem>
              <SelectItem value="MLB">MLB</SelectItem>
              <SelectItem value="NHL">NHL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) =>
            game.predictions.map((prediction) => (
              <Card key={prediction.id} className=" hover:border-[#1E40AF] transition-colors">
                <CardHeader className="border-b border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {game.homeTeam} vs {game.awayTeam}
                    </CardTitle>
                    <Badge className={`text-xs ${getConfidenceColor(prediction.confidenceTier)}`}>
                      {prediction.confidenceTier}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(game.gameTime).toLocaleDateString()} • {game.sport}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 border border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Recommended Pick</span>
                        <Star className="w-4 h-4 text-[#F59E0B]" />
                      </div>
                      <div className="font-bold text-[#10B981] text-lg">
                        {prediction.recommendedPick}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {prediction.betType} bet
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Edge Score</div>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-[#F59E0B] mr-1" />
                          <span className="font-bold text-[#F59E0B]">
                            {prediction.edgeScore}/10
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Suggested Bet</div>
                        <div className="font-bold">{formatCurrency(100)}</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {prediction.tags.map((tag) => (
                        <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {prediction.reasoning}
                    </div>
                    
                    <Button
                      onClick={() => handlePlaceBet(game.id, prediction)}
                      disabled={placeBetMutation.isPending}
                      className="w-full bg-[#1E40AF] hover:bg-blue-600 text-white"
                    >
                      {placeBetMutation.isPending ? "Placing..." : "Place Bet"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        {filteredGames.length === 0 && (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              No predictions match your current filters
            </div>
            <Button
              onClick={() => {
                setConfidenceFilter("all");
                setSportFilter("all");
              }}
              variant="outline"
              className=" hover:border-[#1E40AF]"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}