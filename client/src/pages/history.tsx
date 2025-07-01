import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Filter, TrendingUp, TrendingDown, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, getTimestamp } from "@/lib/utils";
import type { BetWithGame } from "@shared/schema";

export default function History() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [betTypeFilter, setBetTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("date");

  const { data: bets, isLoading } = useQuery<BetWithGame[]>({
    queryKey: ["/api/bets"],
  });

  const filteredAndSortedBets = bets?.filter(bet => {
    const statusMatch = statusFilter === "all" || bet.status === statusFilter;
    const typeMatch = betTypeFilter === "all" || bet.betType === betTypeFilter;
    const searchMatch = searchTerm === "" || 
      bet.pick.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.game.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.game.awayTeam.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && typeMatch && searchMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime();
      case "amount":
        return parseFloat(b.amount) - parseFloat(a.amount);
      case "status":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "won":
        return "bg-green-500/20 text-green-400";
      case "lost":
        return "bg-red-500/20 text-red-400";
      case "push":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const getBetTypeColor = (betType: string) => {
    switch (betType) {
      case "spread":
        return "bg-blue-500/20 text-blue-400";
      case "moneyline":
        return "bg-purple-500/20 text-purple-400";
      case "total":
        return "bg-orange-500/20 text-orange-400";
      case "prop":
        return "bg-pink-500/20 text-pink-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const calculateProfitLoss = (bet: BetWithGame) => {
    if (bet.status === "won") {
      return parseFloat(bet.payout || "0") - parseFloat(bet.amount);
    } else if (bet.status === "lost") {
      return -parseFloat(bet.amount);
    } else if (bet.status === "push") {
      return 0;
    }
    return 0;
  };

  const totalProfit = filteredAndSortedBets.reduce((sum, bet) => sum + calculateProfitLoss(bet), 0);
  const winRate = filteredAndSortedBets.length > 0 ? 
    (filteredAndSortedBets.filter(bet => bet.status === "won").length / filteredAndSortedBets.filter(bet => bet.status !== "pending").length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="">
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
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
            <h1 className="text-3xl font-bold">Betting History</h1>
            <p className="text-muted-foreground mt-2">Complete record of your betting activity</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bets</p>
                  <p className="text-2xl font-bold">{filteredAndSortedBets.length}</p>
                </div>
                <Calendar className="text-[#1E40AF] text-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
                </div>
                <TrendingUp className="text-[#10B981] text-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit/Loss</p>
                  <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                    {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                  </p>
                </div>
                {totalProfit >= 0 ? 
                  <TrendingUp className="text-[#10B981] text-xl" /> :
                  <TrendingDown className="text-[#EF4444] text-xl" />
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className=" mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border text-foreground"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-muted border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-muted border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={betTypeFilter} onValueChange={setBetTypeFilter}>
                <SelectTrigger className="bg-muted border">
                  <SelectValue placeholder="Bet Type" />
                </SelectTrigger>
                <SelectContent className="bg-muted border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="spread">Spread</SelectItem>
                  <SelectItem value="moneyline">Moneyline</SelectItem>
                  <SelectItem value="total">Total</SelectItem>
                  <SelectItem value="prop">Prop</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-muted border">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-muted border">
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="amount">Amount</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setStatusFilter("all");
                  setBetTypeFilter("all");
                  setSearchTerm("");
                  setSortBy("date");
                }}
                variant="outline"
                className="bg-muted border hover:border-[#1E40AF]"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Betting History */}
        <Card className="">
          <CardHeader className="border-b border">
            <CardTitle>Bet History ({filteredAndSortedBets.length} bets)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAndSortedBets.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No bets found matching your filters
              </div>
            ) : (
              <div className="space-y-0">
                {filteredAndSortedBets.map((bet, index) => (
                  <div 
                    key={bet.id} 
                    className={`p-6 border-b border last:border-b-0 hover:bg-muted transition-colors ${
                      index % 2 === 0 ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Game & Pick */}
                      <div className="md:col-span-2">
                        <div className="font-medium text-sm mb-1">
                          {bet.game.awayTeam} @ {bet.game.homeTeam}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {bet.pick}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getBetTypeColor(bet.betType)}`}>
                            {bet.betType}
                          </Badge>
                          <span className="text-xs text-foreground0">
                            {bet.odds > 0 ? `+${bet.odds}` : bet.odds}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-center">
                        <div className="font-bold">{formatCurrency(bet.amount)}</div>
                        <div className="text-xs text-muted-foreground">Bet Amount</div>
                      </div>

                      {/* Status */}
                      <div className="text-center">
                        <Badge className={`${getStatusColor(bet.status)} capitalize`}>
                          {bet.status}
                        </Badge>
                      </div>

                      {/* Profit/Loss */}
                      <div className="text-center">
                        <div className={`font-bold ${
                          calculateProfitLoss(bet) > 0 ? 'text-[#10B981]' : 
                          calculateProfitLoss(bet) < 0 ? 'text-[#EF4444]' : 
                          'text-muted-foreground'
                        }`}>
                          {calculateProfitLoss(bet) > 0 ? '+' : ''}
                          {formatCurrency(calculateProfitLoss(bet))}
                        </div>
                        <div className="text-xs text-muted-foreground">P&L</div>
                      </div>

                      {/* Date */}
                      <div className="text-center">
                        <div className="text-sm">{getTimestamp(new Date(bet.placedAt))}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(bet.placedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}