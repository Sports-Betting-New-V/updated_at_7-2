import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { predictionEngine } from "./services/prediction-engine";
import { bettingSimulator } from "./services/betting-simulator";
import { insertBetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (for demo, always return user 1)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Get user stats
  app.get("/api/user/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats(1);
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
          const prediction = predictionEngine.generatePrediction(game);
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
  app.get("/api/bets", async (req, res) => {
    try {
      const bets = await storage.getBetsByUserId(1);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get bets" });
    }
  });

  // Get recent bets
  app.get("/api/bets/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const bets = await storage.getRecentBetsByUserId(1, limit);
      res.json(bets);
    } catch (error) {
      res.status(500).json({ message: "Failed to get recent bets" });
    }
  });

  // Place a bet
  app.post("/api/bets", async (req, res) => {
    try {
      const betData = insertBetSchema.parse({
        ...req.body,
        userId: 1, // For demo, always use user 1
      });

      // Get user's current bankroll
      const user = await storage.getUser(1);
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
      }, parseFloat(user.bankroll));

      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Create the bet
      const bet = await storage.createBet(betData);
      res.json(bet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bet data", errors: error.errors });
      }
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
      
      for (const bet of gameBets) {
        const betResult = bettingSimulator.evaluateBet(bet, game, result.homeScore, result.awayScore);
        const payout = bettingSimulator.calculatePayout(bet, betResult);
        await storage.updateBetStatus(bet.id, betResult, payout.toFixed(2));
      }

      res.json({
        gameResult: result,
        updatedBets: gameBets.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to simulate game" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
