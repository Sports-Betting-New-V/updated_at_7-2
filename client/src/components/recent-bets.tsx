import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getTimestamp } from "@/lib/utils";
import type { BetWithGame } from "@shared/schema";

export function RecentBets() {
  const { data: bets, isLoading } = useQuery<BetWithGame[]>({
    queryKey: ["/api/bets/recent", { limit: 5 }],
    queryFn: async () => {
      const res = await fetch("/api/bets/recent?limit=5", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch recent bets");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card className="">
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="">
      <CardHeader className="border-b">
        <CardTitle>Recent Bets</CardTitle>
        <p className="text-sm text-muted-foreground">Your latest activity</p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-3">
        {bets?.map((bet) => (
          <div key={bet.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex-1">
              <div className="font-medium text-sm">{bet.pick}</div>
              <div className="text-xs text-muted-foreground">
                {getTimestamp(new Date(bet.placedAt))} • {formatCurrency(bet.amount)}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-medium ${
                bet.status === "won" ? "text-green-500" : 
                bet.status === "lost" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {bet.status === "won" ? `+${formatCurrency(parseFloat(bet.payout || "0") - parseFloat(bet.amount))}` :
                 bet.status === "lost" ? `-${formatCurrency(bet.amount)}` :
                 "Pending"}
              </div>
              <div className={`text-xs capitalize ${
                bet.status === "won" ? "text-green-500" : 
                bet.status === "lost" ? "text-red-500" : 
                "text-muted-foreground"
              }`}>
                {bet.status}
              </div>
            </div>
          </div>
        ))}
        
        {bets?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No recent bets found. Place your first bet to get started!
          </div>
        )}
        
        <div className="text-center pt-2">
          <Button variant="ghost" className="text-blue-600 hover:text-blue-500 text-sm">
            View All Bets
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
