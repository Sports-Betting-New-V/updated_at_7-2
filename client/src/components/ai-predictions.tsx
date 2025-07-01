import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getConfidenceColor, getTagColor } from "@/lib/utils";
import type { GameWithPredictions } from "@shared/schema";

interface AIPredictionsProps {
  onPlaceBet: (gameId: number, prediction: any) => void;
}

export function AIPredictions({ onPlaceBet }: AIPredictionsProps) {
  const { data: games, isLoading } = useQuery<GameWithPredictions[]>({
    queryKey: ["/api/games"],
  });

  if (isLoading) {
    return (
      <Card className=" lg:col-span-2">
        <CardHeader>
          <CardTitle>AI Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const gamesWithPredictions = games?.filter(game => game.predictions.length > 0) || [];

  return (
    <Card className=" lg:col-span-2">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle>AI Predictions</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Last updated:</span>
            <span className="text-sm font-medium">2 min ago</span>
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mt-1">High-confidence picks from our ML engine</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {gamesWithPredictions.map((game) =>
          game.predictions.map((prediction) => (
            <div key={prediction.id} className="bg-muted rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-bold">
                    {game.homeTeam} vs {game.awayTeam}
                  </div>
                  <Badge className={`text-xs font-medium capitalize ${getConfidenceColor(prediction.confidenceTier)}`}>
                    {prediction.confidenceTier} Confidence
                  </Badge>
                  {prediction.tags.map((tag) => (
                    <Badge key={tag} className={`text-xs ${getTagColor(tag)}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  {new Date(game.gameTime).toLocaleTimeString([], { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    timeZone: 'America/New_York'
                  })} EST
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-slate-400">Recommended Pick</div>
                  <div className="font-bold text-[#10B981]">{prediction.recommendedPick}</div>
                  <div className="text-sm text-slate-400 capitalize">{prediction.betType}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Edge Score</div>
                  <div className="font-bold text-[#F59E0B]">{prediction.edgeScore}/10</div>
                  <div className="text-sm text-slate-400">Strong value</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400 flex items-center">
                  <Info className="w-4 h-4 mr-1" />
                  {prediction.reasoning}
                </div>
                <Button 
                  onClick={() => onPlaceBet(game.id, prediction)}
                  className="bg-[#1E40AF] hover:bg-blue-600 text-white"
                >
                  Place Bet
                </Button>
              </div>
            </div>
          ))
        )}
        
        {gamesWithPredictions.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No predictions available at the moment. Check back soon!
          </div>
        )}
        
        <div className="text-center pt-4">
          <Button variant="ghost" className="text-[#1E40AF] hover:text-blue-400">
            View All Predictions →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
