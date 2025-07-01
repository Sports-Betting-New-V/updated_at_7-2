import { db } from "../db";
import { users, games, predictions, bets } from "@shared/schema";
import { eq } from "drizzle-orm";
import { predictionEngine } from "./prediction-engine";
import { sportsDataService } from "./sports-data";

export class DataInitService {
  async initializeData() {
    console.log("Initializing database with sample data...");
    
    try {
      // Create default user if doesn't exist
      const existingUser = await db.select().from(users).where(eq(users.id, 1));
      if (existingUser.length === 0) {
        await db.insert(users).values({
          username: "john_bettor",
          password: "password123",
          bankroll: "10000.00"
        });
        console.log("Created default user");
      }

      // Create sample games if none exist
      const existingGames = await db.select().from(games);
      if (existingGames.length === 0) {
        const sampleGames = [
          {
            homeTeam: "Lakers",
            awayTeam: "Warriors",
            sport: "NBA",
            gameTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
            status: "scheduled",
            homeSpread: "-3.5",
            awaySpread: "+3.5",
            totalPoints: "220.5",
            homeMoneyline: -150,
            awayMoneyline: 130,
            homeScore: null,
            awayScore: null,
          },
          {
            homeTeam: "Celtics",
            awayTeam: "Heat",
            sport: "NBA",
            gameTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
            status: "scheduled",
            homeSpread: "-7.0",
            awaySpread: "+7.0",
            totalPoints: "215.5",
            homeMoneyline: -280,
            awayMoneyline: 240,
            homeScore: null,
            awayScore: null,
          },
          {
            homeTeam: "Cowboys",
            awayTeam: "Eagles",
            sport: "NFL",
            gameTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
            status: "scheduled",
            homeSpread: "-7.0",
            awaySpread: "+7.0",
            totalPoints: "47.5",
            homeMoneyline: -320,
            awayMoneyline: 280,
            homeScore: null,
            awayScore: null,
          },
          {
            homeTeam: "Yankees",
            awayTeam: "Red Sox",
            sport: "MLB",
            gameTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
            status: "scheduled",
            homeSpread: "-1.5",
            awaySpread: "+1.5",
            totalPoints: "9.5",
            homeMoneyline: -140,
            awayMoneyline: 120,
            homeScore: null,
            awayScore: null,
          },
          {
            homeTeam: "Rangers",
            awayTeam: "Bruins",
            sport: "NHL",
            gameTime: new Date(Date.now() + 10 * 60 * 60 * 1000), // 10 hours from now
            status: "scheduled",
            homeSpread: "-1.5",
            awaySpread: "+1.5",
            totalPoints: "6.5",
            homeMoneyline: -110,
            awayMoneyline: -110,
            homeScore: null,
            awayScore: null,
          },
        ];

        const insertedGames = await db.insert(games).values(sampleGames).returning();
        console.log(`Created ${insertedGames.length} sample games`);

        // Generate AI predictions for the games
        try {
          const aiPredictions = await predictionEngine.generateMultiplePredictions(insertedGames);
          if (aiPredictions.length > 0) {
            await db.insert(predictions).values(aiPredictions);
            console.log(`Generated ${aiPredictions.length} AI predictions`);
          }
        } catch (error) {
          console.error("Failed to generate AI predictions:", error);
          // Create fallback predictions
          const fallbackPredictions = insertedGames.map(game => 
            predictionEngine.generateFallbackPrediction(game)
          );
          await db.insert(predictions).values(fallbackPredictions);
          console.log(`Created ${fallbackPredictions.length} fallback predictions`);
        }

        // Create some sample bets
        const sampleBets = [
          {
            userId: 1,
            gameId: insertedGames[0].id,
            predictionId: null,
            pick: "Warriors +3.5",
            betType: "spread",
            amount: "100.00",
            odds: 1.91,
            status: "won",
            payout: "191.00",
            placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          },
          {
            userId: 1,
            gameId: insertedGames[1].id,
            predictionId: null,
            pick: "Under 215.5",
            betType: "total",
            amount: "50.00",
            odds: 1.95,
            status: "lost",
            payout: null,
            placedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          },
        ];

        await db.insert(bets).values(sampleBets);
        console.log(`Created ${sampleBets.length} sample bets`);
      }

      console.log("Database initialization completed successfully");
    } catch (error) {
      console.error("Database initialization failed:", error);
    }
  }
}

export const dataInitService = new DataInitService();