import { type Bet, type Game } from "@shared/schema";

export class BettingSimulator {
  calculatePayout(bet: Bet, gameResult: "win" | "loss" | "push"): number {
    if (gameResult === "push") return parseFloat(bet.amount);
    if (gameResult === "loss") return 0;
    
    const betAmount = parseFloat(bet.amount);
    const odds = bet.odds;
    
    if (odds > 0) {
      // Positive odds (underdog)
      return betAmount + (betAmount * odds / 100);
    } else {
      // Negative odds (favorite)
      return betAmount + (betAmount * 100 / Math.abs(odds));
    }
  }

  simulateGameResult(game: Game): { homeScore: number; awayScore: number } {
    // Simple simulation based on total points
    const totalPoints = parseFloat(game.totalPoints || "200");
    const homeScore = Math.floor(Math.random() * (totalPoints * 0.6)) + Math.floor(totalPoints * 0.2);
    const awayScore = Math.floor(totalPoints - homeScore + (Math.random() * 20 - 10));
    
    return {
      homeScore: Math.max(0, homeScore),
      awayScore: Math.max(0, awayScore),
    };
  }

  evaluateBet(bet: Bet, game: Game, homeScore: number, awayScore: number): "win" | "loss" | "push" {
    const { betType, pick } = bet;
    
    if (betType === "spread") {
      const spread = parseFloat(game.homeSpread || "0");
      const homeSpreadResult = homeScore + spread;
      const margin = homeSpreadResult - awayScore;
      
      if (pick.includes(game.homeTeam)) {
        return margin > 0 ? "win" : margin < 0 ? "loss" : "push";
      } else {
        return margin < 0 ? "win" : margin > 0 ? "loss" : "push";
      }
    }
    
    if (betType === "moneyline") {
      const homeWins = homeScore > awayScore;
      if (pick.includes(game.homeTeam)) {
        return homeWins ? "win" : "loss";
      } else {
        return !homeWins ? "win" : "loss";
      }
    }
    
    if (betType === "total") {
      const total = homeScore + awayScore;
      const gameTotal = parseFloat(game.totalPoints || "200");
      
      if (pick.toLowerCase().includes("over")) {
        return total > gameTotal ? "win" : total < gameTotal ? "loss" : "push";
      } else {
        return total < gameTotal ? "win" : total > gameTotal ? "loss" : "push";
      }
    }
    
    return "loss";
  }

  validateBet(bet: Bet, userBankroll: number): { valid: boolean; error?: string } {
    const betAmount = parseFloat(bet.amount);
    
    if (betAmount < 10) {
      return { valid: false, error: "Minimum bet amount is $10" };
    }
    
    if (betAmount > userBankroll) {
      return { valid: false, error: "Insufficient bankroll" };
    }
    
    if (betAmount > userBankroll * 0.2) {
      return { valid: false, error: "Bet amount exceeds 20% of bankroll" };
    }
    
    return { valid: true };
  }
}

export const bettingSimulator = new BettingSimulator();
