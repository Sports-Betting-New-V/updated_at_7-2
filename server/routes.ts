import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { predictionEngine } from "./services/prediction-engine";
import { bettingSimulator } from "./services/betting-simulator";
import { sportsDataService } from "./services/sports-data";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user - backwards compatibility
  app.get("/api/user", async (req: any, res) => {
    try {
      // If authenticated, get the real user
      if (req.isAuthenticated?.() && req.user?.claims?.sub) {
        const user = await storage.getUser(req.user.claims.sub);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      } else {
        // Return empty for unauthenticated users (demo mode)
        res.status(401).json({ message: "Please log in to access user data" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user stats
  app.get("/api/user/stats", async (req: any, res) => {
    try {
      // Support both authenticated and demo mode
      let userId = "demo-user-1";
      if (req.isAuthenticated?.() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user stats" });
    }
  });

  // Get all games with predictions
  app.get("/api/games", async (req, res) => {
    try {
      const games = await storage.getGamesWithPredictions();
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to get games" });
    }
  });

  // Refresh games from professional sports APIs
  app.post("/api/games/refresh", async (req, res) => {
    try {
      console.log("🔄 Refreshing game data from SportsDataIO and RapidAPI...");
      const freshGames = await sportsDataService.fetchAllSportsGames();
      
      for (const gameData of freshGames) {
        await storage.createGame(gameData);
      }
      
      console.log(`✅ Refreshed ${freshGames.length} games from live sports data`);
      res.json({ 
        success: true, 
        message: `Refreshed ${freshGames.length} games from professional sports APIs`,
        games: freshGames 
      });
    } catch (error: any) {
      console.error("❌ Games refresh failed:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // Get predictions
  app.get("/api/predictions", async (req, res) => {
    try {
      const predictions = await storage.getPredictions();
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get predictions" });
    }
  });

  // Generate new predictions
  app.post("/api/predictions/generate", async (req, res) => {
    try {
      const games = await storage.getGames();
      const newPredictions = [];
      
      for (const game of games) {
        if (game.status === "upcoming") {
          const prediction = await predictionEngine.generatePrediction(game);
          const created = await storage.createPrediction(prediction);
          newPredictions.push(created);
        }
      }
      
      res.json(newPredictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  // Get user bets
  app.get("/api/bets", async (req: any, res) => {
    try {
      // Support both authenticated and demo mode
      let userId = "demo-user-1";
      if (req.isAuthenticated?.() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      const bets = await storage.getBetsByUserId(userId);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get bets" });
    }
  });

  // Get recent bets
  app.get("/api/bets/recent", async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      // Support both authenticated and demo mode
      let userId = "demo-user-1";
      if (req.isAuthenticated?.() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      const bets = await storage.getRecentBetsByUserId(userId, limit);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent bets" });
    }
  });

  // Place a bet (protected route)
  app.post("/api/bets", async (req: any, res) => {
    try {
      // Check if user is authenticated for real betting
      if (!req.isAuthenticated?.() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Please log in to place bets" });
      }

      const userId = req.user.claims.sub;
      const betData = insertBetSchema.parse({
        ...req.body,
        userId,
      });

      // Get user's current bankroll
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Validate bet
      const validation = bettingSimulator.validateBet({
        ...betData,
        id: 0,
        status: "pending",
        payout: null,
        placedAt: new Date(),
        predictionId: betData.predictionId || null,
        odds: betData.odds || -110,
      }, parseFloat(user.bankroll));

      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Create the bet
      const bet = await storage.createBet(betData);
      
      // Update user's bankroll - subtract the bet amount
      const newBankroll = parseFloat(user.bankroll) - parseFloat(betData.amount);
      await storage.updateUserBankroll(userId, newBankroll.toString());
      
      res.json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bet data", errors: error.errors });
      }
      console.error("Error placing bet:", error);
      res.status(500).json({ message: "Failed to place bet" });
    }
  });

  // Simulate game results (for testing)
  app.post("/api/games/:gameId/simulate", async (req, res) => {
    try {
      const gameId = parseInt(req.params.gameId);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Simulate game result
      const result = bettingSimulator.simulateGameResult(game);
      
      // Update all bets for this game
      const allBets = await storage.getBetsByUserId(1);
      const gameBets = allBets.filter(bet => bet.gameId === gameId && bet.status === "pending");
      
      let totalPayouts = 0;
      for (const bet of gameBets) {
        const betResult = bettingSimulator.evaluateBet(bet, game, result.homeScore, result.awayScore);
        const payout = bettingSimulator.calculatePayout(bet, betResult);
        await storage.updateBetStatus(bet.id, betResult, payout.toFixed(2));
        
        // If the bet won, add the payout to total
        if (betResult === "win") {
          totalPayouts += payout;
        }
      }
      
      // Update user's bankroll with any winnings
      if (totalPayouts > 0) {
        const user = await storage.getUser(1);
        if (user) {
          const newBankroll = parseFloat(user.bankroll) + totalPayouts;
          await storage.updateUserBankroll(1, newBankroll.toString());
        }
      }

      res.json({
        gameResult: result,
        updatedBets: gameBets.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate game" });
    }
  });

  // Generate fresh predictions using AI
  app.post("/api/predictions/generate", async (req, res) => {
    try {
      const games = await storage.getGames();
      const recentGames = games.filter(game => 
        new Date(game.gameTime) > new Date() // Only future games
      ).slice(0, 5); // Limit to prevent API overuse

      if (recentGames.length === 0) {
        return res.json({ message: "No upcoming games found for predictions" });
      }

      const newPredictions = [];
      for (const game of recentGames) {
        try {
          const prediction = await predictionEngine.generatePrediction(game);
          const createdPrediction = await storage.createPrediction(prediction);
          newPredictions.push(createdPrediction);
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to generate prediction for game ${game.id}:`, error);
        }
      }

      res.json({ 
        message: `Generated ${newPredictions.length} new AI predictions`,
        predictions: newPredictions 
      });
    } catch (error) {
      console.error("Error generating predictions:", error);
      res.status(500).json({ error: "Failed to generate predictions" });
    }
  });

  // Refresh games from live sports data
  app.post("/api/games/refresh", async (req, res) => {
    try {
      const { sportsDataService } = await import("./services/sports-data");
      const liveGames = await sportsDataService.fetchAllSportsGames();
      
      if (liveGames.length === 0) {
        return res.json({ message: "No live games available at this time" });
      }

      const createdGames = [];
      for (const gameData of liveGames) {
        try {
          const game = await storage.createGame(gameData);
          createdGames.push(game);
        } catch (error) {
          // Game might already exist or have duplicate data
          console.log(`Skipped duplicate or invalid game: ${gameData.homeTeam} vs ${gameData.awayTeam}`);
        }
      }

      res.json({ 
        message: `Refreshed with ${createdGames.length} new games from live sports data`,
        games: createdGames 
      });
    } catch (error) {
      console.error("Error refreshing games:", error);
      res.status(500).json({ error: "Failed to refresh games from sports data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
