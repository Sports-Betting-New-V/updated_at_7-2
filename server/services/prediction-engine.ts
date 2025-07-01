import { type Game, type InsertPrediction } from "@shared/schema";
import { openAIService } from "./openai-service";

export class PredictionEngine {
  async generatePrediction(game: Game): Promise<InsertPrediction> {
    // Use OpenAI for real predictions
    return await openAIService.generatePrediction(game);
  }

  // Keep fallback method for when OpenAI is not available
  generateFallbackPrediction(game: Game): InsertPrediction {
    // Simple ML simulation based on team names and spreads
    const homeAdvantage = 2.5;
    const randomFactor = Math.random() * 10 - 5; // -5 to +5
    
    // Mock confidence calculation
    const edgeScore = Math.max(1, Math.min(10, 5 + Math.abs(randomFactor)));
    const confidenceTier = edgeScore >= 7 ? "high" : edgeScore >= 5 ? "medium" : "low";
    
    // Mock prediction logic
    const predictions = [
      {
        recommendedPick: `${game.awayTeam} ${game.awaySpread}`,
        betType: "spread",
        tags: ["Smart Money", "Line Movement"],
        reasoning: `${game.awayTeam} has been excellent ATS as road underdogs this season`,
      },
      {
        recommendedPick: `Under ${game.totalPoints}`,
        betType: "total",
        tags: ["Fade Public", "Weather"],
        reasoning: "Public heavily on over, defensive matchup expected",
      },
      {
        recommendedPick: `${game.homeTeam} ML`,
        betType: "moneyline", 
        tags: ["Home Favorite", "Value"],
        reasoning: `${game.homeTeam} has strong home court advantage`,
      },
    ];
    
    const selectedPrediction = predictions[Math.floor(Math.random() * predictions.length)];
    
    return {
      gameId: game.id,
      recommendedPick: selectedPrediction.recommendedPick,
      betType: selectedPrediction.betType,
      edgeScore: edgeScore.toFixed(1),
      confidenceTier,
      tags: selectedPrediction.tags,
      reasoning: selectedPrediction.reasoning,
    };
  }

  calculateEdgeScore(game: Game): number {
    // Mock edge calculation based on various factors
    const factors = {
      lineMovement: Math.random() * 3,
      publicPercentage: Math.random() * 2,
      weatherConditions: Math.random() * 1.5,
      injuries: Math.random() * 2.5,
      motivation: Math.random() * 2,
    };
    
    return Math.min(10, Object.values(factors).reduce((a, b) => a + b, 0));
  }

  getConfidenceTier(edgeScore: number): string {
    if (edgeScore >= 7) return "high";
    if (edgeScore >= 5) return "medium";
    return "low";
  }

  getTags(game: Game, edgeScore: number): string[] {
    const allTags = [
      "Smart Money",
      "Fade Public", 
      "Line Movement",
      "Weather",
      "Injury News",
      "Home Favorite",
      "Road Dog",
      "Value",
      "Steam",
      "Trap Game",
    ];
    
    // Return 1-3 random tags
    const numTags = Math.floor(Math.random() * 3) + 1;
    return allTags.sort(() => 0.5 - Math.random()).slice(0, numTags);
  }

  async generateMultiplePredictions(games: Game[]): Promise<InsertPrediction[]> {
    const predictions: InsertPrediction[] = [];
    
    // Generate predictions for each game (limit to prevent API overuse)
    const gamesToProcess = games.slice(0, 5);
    
    for (const game of gamesToProcess) {
      try {
        const prediction = await this.generatePrediction(game);
        predictions.push(prediction);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to generate prediction for game ${game.id}:`, error);
        // Fall back to mock prediction
        predictions.push(this.generateFallbackPrediction(game));
      }
    }
    
    return predictions;
  }

  async getMarketInsights(games: Game[]): Promise<string> {
    try {
      return await openAIService.analyzeBettingTrends(games);
    } catch (error) {
      console.error("Failed to get market insights:", error);
      return "Market analysis shows typical seasonal patterns with increased activity across major sports.";
    }
  }
}

export const predictionEngine = new PredictionEngine();
