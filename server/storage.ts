import { users, games, predictions, bets, type User, type UpsertUser, type Game, type InsertGame, type Prediction, type InsertPrediction, type Bet, type InsertBet, type GameWithPredictions, type BetWithGame, type UserStats } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations (Replit Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBankroll(userId: string, amount: string): Promise<User>;

  // Game operations  
  getGames(): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  getGamesWithPredictions(): Promise<GameWithPredictions[]>;

  // Prediction operations
  getPredictions(): Promise<Prediction[]>;
  getPredictionsByGameId(gameId: number): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;

  // Bet operations
  getBetsByUserId(userId: string): Promise<BetWithGame[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(betId: number, status: string, payout?: string): Promise<Bet>;
  getRecentBetsByUserId(userId: string, limit: number): Promise<BetWithGame[]>;

  // Analytics
  getUserStats(userId: string): Promise<UserStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBankroll(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ bankroll: amount, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return await db.select().from(games);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game;
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(gameData).returning();
    return game;
  }

  async getGamesWithPredictions(): Promise<GameWithPredictions[]> {
    const gamesData = await db.select().from(games);
    const predictionsData = await db.select().from(predictions);
    
    return gamesData.map(game => ({
      ...game,
      predictions: predictionsData.filter(p => p.gameId === game.id)
    }));
  }

  // Prediction operations
  async getPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions);
  }

  async getPredictionsByGameId(gameId: number): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.gameId, gameId));
  }

  async createPrediction(predictionData: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db.insert(predictions).values(predictionData).returning();
    return prediction;
  }

  // Bet operations
  async getBetsByUserId(userId: string): Promise<BetWithGame[]> {
    const result = await db
      .select()
      .from(bets)
      .leftJoin(games, eq(bets.gameId, games.id))
      .where(eq(bets.userId, userId));
    
    return result.map(row => ({
      ...row.bets,
      game: row.games!
    }));
  }

  async createBet(betData: InsertBet): Promise<Bet> {
    const [bet] = await db.insert(bets).values(betData).returning();
    return bet;
  }

  async updateBetStatus(betId: number, status: string, payout?: string): Promise<Bet> {
    const [bet] = await db
      .update(bets)
      .set({ 
        status,
        payout: payout || null,
      })
      .where(eq(bets.id, betId))
      .returning();
    return bet;
  }

  async getRecentBetsByUserId(userId: string, limit: number): Promise<BetWithGame[]> {
    const result = await db
      .select()
      .from(bets)
      .leftJoin(games, eq(bets.gameId, games.id))
      .where(eq(bets.userId, userId))
      .orderBy(bets.placedAt)
      .limit(limit);
    
    return result.map(row => ({
      ...row.bets,
      game: row.games!
    }));
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const userBets = await this.getBetsByUserId(userId);
    const completedBets = userBets.filter(bet => bet.status !== "pending");
    
    const totalBets = completedBets.length;
    const wonBets = completedBets.filter(bet => bet.status === "won").length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    
    const totalPL = completedBets.reduce((sum, bet) => {
      if (bet.status === "won" && bet.payout) {
        return sum + (parseFloat(bet.payout) - parseFloat(bet.amount));
      } else if (bet.status === "lost") {
        return sum - parseFloat(bet.amount);
      }
      return sum;
    }, 0);
    
    const totalWagered = completedBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const recentBets = [...completedBets].reverse();
    for (const bet of recentBets) {
      if (bet.status === "won") {
        currentStreak++;
      } else if (bet.status === "lost") {
        if (currentStreak > 0) break;
        currentStreak--;
      } else {
        break;
      }
    }
    
    // Generate bankroll history (simplified)
    const bankrollHistory = [
      { date: new Date().toISOString().split('T')[0], amount: 10000 + totalPL }
    ];
    
    return {
      totalPL,
      winRate,
      totalBets,
      roi,
      currentStreak,
      bankrollHistory,
    };
  }
}

export const storage = new DatabaseStorage();