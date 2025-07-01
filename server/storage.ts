import { users, games, predictions, bets, type User, type InsertUser, type Game, type InsertGame, type Prediction, type InsertPrediction, type Bet, type InsertBet, type GameWithPredictions, type BetWithGame, type UserStats } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBankroll(userId: number, amount: string): Promise<User>;

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
  getBetsByUserId(userId: number): Promise<BetWithGame[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(betId: number, status: string, payout?: string): Promise<Bet>;
  getRecentBetsByUserId(userId: number, limit: number): Promise<BetWithGame[]>;

  // Analytics
  getUserStats(userId: number): Promise<UserStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private games: Map<number, Game>;
  private predictions: Map<number, Prediction>;
  private bets: Map<number, Bet>;
  private currentUserId: number;
  private currentGameId: number;
  private currentPredictionId: number;
  private currentBetId: number;

  constructor() {
    this.users = new Map();
    this.games = new Map();
    this.predictions = new Map();
    this.bets = new Map();
    this.currentUserId = 1;
    this.currentGameId = 1;
    this.currentPredictionId = 1;
    this.currentBetId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create default user
    const defaultUser: User = {
      id: 1,
      username: "john_bettor",
      password: "password123",
      bankroll: "12450.00",
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create sample games
    const sampleGames: Game[] = [
      {
        id: 1,
        homeTeam: "Lakers",
        awayTeam: "Warriors",
        gameTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
        sport: "NBA",
        homeSpread: "-3.5",
        awaySpread: "3.5",
        totalPoints: "225.5",
        homeMoneyline: -150,
        awayMoneyline: 130,
        status: "upcoming",
        homeScore: null,
        awayScore: null,
      },
      {
        id: 2,
        homeTeam: "Celtics",
        awayTeam: "Heat",
        gameTime: new Date(Date.now() + 4.5 * 60 * 60 * 1000),
        sport: "NBA",
        homeSpread: "-5.5",
        awaySpread: "5.5",
        totalPoints: "215.5",
        homeMoneyline: -200,
        awayMoneyline: 170,
        status: "upcoming",
        homeScore: null,
        awayScore: null,
      },
      {
        id: 3,
        homeTeam: "Cowboys",
        awayTeam: "Eagles",
        gameTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        sport: "NFL",
        homeSpread: "-7.0",
        awaySpread: "7.0",
        totalPoints: "47.5",
        homeMoneyline: -280,
        awayMoneyline: 220,
        status: "upcoming",
        homeScore: null,
        awayScore: null,
      },
      {
        id: 4,
        homeTeam: "Yankees",
        awayTeam: "Red Sox",
        gameTime: new Date(Date.now() + 8 * 60 * 60 * 1000),
        sport: "MLB",
        homeSpread: "-1.5",
        awaySpread: "1.5",
        totalPoints: "9.5",
        homeMoneyline: -165,
        awayMoneyline: 145,
        status: "upcoming",
        homeScore: null,
        awayScore: null,
      },
      {
        id: 5,
        homeTeam: "Rangers",
        awayTeam: "Bruins",
        gameTime: new Date(Date.now() + 10 * 60 * 60 * 1000),
        sport: "NHL",
        homeSpread: "-1.5",
        awaySpread: "1.5",
        totalPoints: "6.5",
        homeMoneyline: -140,
        awayMoneyline: 120,
        status: "upcoming",
        homeScore: null,
        awayScore: null,
      },
    ];

    sampleGames.forEach(game => this.games.set(game.id, game));
    this.currentGameId = 6;

    // Create sample predictions
    const samplePredictions: Prediction[] = [
      {
        id: 1,
        gameId: 1,
        recommendedPick: "Warriors +3.5",
        betType: "spread",
        edgeScore: "8.7",
        confidenceTier: "high",
        tags: ["Smart Money", "Line Movement"],
        reasoning: "Warriors have been excellent ATS as road underdogs this season",
        createdAt: new Date(),
      },
      {
        id: 2,
        gameId: 2,
        recommendedPick: "Under 215.5",
        betType: "total",
        edgeScore: "6.3",
        confidenceTier: "medium",
        tags: ["Fade Public", "Weather"],
        reasoning: "Public heavily on over, defensive matchup expected",
        createdAt: new Date(),
      },
      {
        id: 3,
        gameId: 3,
        recommendedPick: "Eagles +7.0",
        betType: "spread",
        edgeScore: "7.8",
        confidenceTier: "high",
        tags: ["Road Dog", "Value"],
        reasoning: "Eagles getting too many points in this divisional matchup",
        createdAt: new Date(),
      },
      {
        id: 4,
        gameId: 4,
        recommendedPick: "Over 9.5",
        betType: "total",
        edgeScore: "6.9",
        confidenceTier: "medium",
        tags: ["Steam", "Weather"],
        reasoning: "Wind conditions favor offense, both bullpens have been shaky",
        createdAt: new Date(),
      },
      {
        id: 5,
        gameId: 5,
        recommendedPick: "Bruins ML",
        betType: "moneyline",
        edgeScore: "5.4",
        confidenceTier: "low",
        tags: ["Value", "Injury News"],
        reasoning: "Rangers missing key defenseman, Bruins good value as road favorite",
        createdAt: new Date(),
      },
    ];

    samplePredictions.forEach(prediction => this.predictions.set(prediction.id, prediction));
    this.currentPredictionId = 6;

    // Create sample bets
    const sampleBets: Bet[] = [
      {
        id: 1,
        userId: 1,
        gameId: 1,
        predictionId: 1,
        betType: "spread",
        pick: "Lakers +3.5",
        amount: "200.00",
        odds: -110,
        status: "won",
        payout: "380.00",
        placedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: 1,
        gameId: 2,
        predictionId: null,
        betType: "moneyline",
        pick: "Warriors ML",
        amount: "150.00",
        odds: 130,
        status: "lost",
        payout: "0.00",
        placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];

    sampleBets.forEach(bet => this.bets.set(bet.id, bet));
    this.currentBetId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      bankroll: insertUser.bankroll || "10000.00",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBankroll(userId: number, amount: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, bankroll: amount };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentGameId++;
    const game: Game = { 
      ...insertGame, 
      id,
      sport: insertGame.sport || "NBA",
      status: insertGame.status || "upcoming"
    };
    this.games.set(id, game);
    return game;
  }

  async getGamesWithPredictions(): Promise<GameWithPredictions[]> {
    const games = Array.from(this.games.values());
    return games.map(game => ({
      ...game,
      predictions: Array.from(this.predictions.values()).filter(p => p.gameId === game.id),
    }));
  }

  async getPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values());
  }

  async getPredictionsByGameId(gameId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(p => p.gameId === gameId);
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const prediction: Prediction = {
      ...insertPrediction,
      id,
      tags: insertPrediction.tags || [],
      reasoning: insertPrediction.reasoning || null,
      createdAt: new Date(),
    };
    this.predictions.set(id, prediction);
    return prediction;
  }

  async getBetsByUserId(userId: number): Promise<BetWithGame[]> {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    return userBets.map(bet => ({
      ...bet,
      game: this.games.get(bet.gameId)!,
    }));
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const bet: Bet = {
      ...insertBet,
      id,
      status: insertBet.status || "pending",
      predictionId: insertBet.predictionId || null,
      odds: insertBet.odds || -110,
      payout: insertBet.payout || null,
      placedAt: new Date(),
    };
    this.bets.set(id, bet);
    
    // Update user bankroll
    const user = this.users.get(insertBet.userId);
    if (user) {
      const newBankroll = (parseFloat(user.bankroll) - parseFloat(insertBet.amount)).toFixed(2);
      this.updateUserBankroll(insertBet.userId, newBankroll);
    }
    
    return bet;
  }

  async updateBetStatus(betId: number, status: string, payout?: string): Promise<Bet> {
    const bet = this.bets.get(betId);
    if (!bet) throw new Error("Bet not found");
    
    const updatedBet = { ...bet, status, payout: payout || "0.00" };
    this.bets.set(betId, updatedBet);
    
    // Update user bankroll if won
    if (status === "won" && payout) {
      const user = this.users.get(bet.userId);
      if (user) {
        const newBankroll = (parseFloat(user.bankroll) + parseFloat(payout)).toFixed(2);
        this.updateUserBankroll(bet.userId, newBankroll);
      }
    }
    
    return updatedBet;
  }

  async getRecentBetsByUserId(userId: number, limit: number): Promise<BetWithGame[]> {
    const userBets = Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime())
      .slice(0, limit);
    
    return userBets.map(bet => ({
      ...bet,
      game: this.games.get(bet.gameId)!,
    }));
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    const finishedBets = userBets.filter(bet => bet.status === "won" || bet.status === "lost");
    
    const totalWins = finishedBets.filter(bet => bet.status === "won").length;
    const totalPL = finishedBets.reduce((sum, bet) => {
      if (bet.status === "won") {
        return sum + (parseFloat(bet.payout || "0") - parseFloat(bet.amount));
      } else {
        return sum - parseFloat(bet.amount);
      }
    }, 0);
    
    const totalBetsAmount = finishedBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const roi = totalBetsAmount > 0 ? (totalPL / totalBetsAmount) * 100 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const sortedBets = finishedBets.sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
    for (const bet of sortedBets) {
      if (bet.status === "won") {
        currentStreak++;
      } else {
        break;
      }
    }
    
    // Mock bankroll history
    const bankrollHistory = [
      { date: "2024-01-01", amount: 10000 },
      { date: "2024-02-01", amount: 10500 },
      { date: "2024-03-01", amount: 9800 },
      { date: "2024-04-01", amount: 11200 },
      { date: "2024-05-01", amount: 11800 },
      { date: "2024-06-01", amount: 12100 },
      { date: "2024-07-01", amount: 12450 },
    ];
    
    return {
      totalPL,
      winRate: finishedBets.length > 0 ? (totalWins / finishedBets.length) * 100 : 0,
      totalBets: finishedBets.length,
      roi,
      currentStreak,
      bankrollHistory,
    };
  }
}

import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBankroll(userId: number, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ bankroll: amount })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(games.gameTime);
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db
      .insert(games)
      .values(insertGame)
      .returning();
    return game;
  }

  async getGamesWithPredictions(): Promise<GameWithPredictions[]> {
    const gamesData = await db.select().from(games).orderBy(games.gameTime);
    const predictionsData = await db.select().from(predictions);
    
    return gamesData.map(game => ({
      ...game,
      predictions: predictionsData.filter(p => p.gameId === game.id)
    }));
  }

  async getPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }

  async getPredictionsByGameId(gameId: number): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.gameId, gameId));
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db
      .insert(predictions)
      .values(insertPrediction)
      .returning();
    return prediction;
  }

  async getBetsByUserId(userId: number): Promise<BetWithGame[]> {
    const betsData = await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.placedAt));
    const gamesData = await db.select().from(games);
    
    return betsData.map(bet => ({
      ...bet,
      game: gamesData.find(g => g.id === bet.gameId)!
    }));
  }

  async createBet(insertBet: InsertBet): Promise<Bet> {
    const [bet] = await db
      .insert(bets)
      .values(insertBet)
      .returning();
    return bet;
  }

  async updateBetStatus(betId: number, status: string, payout?: string): Promise<Bet> {
    const [bet] = await db
      .update(bets)
      .set({ status, payout: payout || null })
      .where(eq(bets.id, betId))
      .returning();
    return bet;
  }

  async getRecentBetsByUserId(userId: number, limit: number): Promise<BetWithGame[]> {
    const betsData = await db.select().from(bets)
      .where(eq(bets.userId, userId))
      .orderBy(desc(bets.placedAt))
      .limit(limit);
    const gamesData = await db.select().from(games);
    
    return betsData.map(bet => ({
      ...bet,
      game: gamesData.find(g => g.id === bet.gameId)!
    }));
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const userBets = await this.getBetsByUserId(userId);
    
    const totalBets = userBets.length;
    const wonBets = userBets.filter(bet => bet.status === 'won').length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    
    const totalPL = userBets.reduce((sum, bet) => {
      if (bet.status === 'won' && bet.payout) {
        return sum + parseFloat(bet.payout) - parseFloat(bet.amount);
      } else if (bet.status === 'lost') {
        return sum - parseFloat(bet.amount);
      }
      return sum;
    }, 0);
    
    const totalWagered = userBets.reduce((sum, bet) => sum + parseFloat(bet.amount), 0);
    const roi = totalWagered > 0 ? (totalPL / totalWagered) * 100 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    for (const bet of userBets) {
      if (bet.status === 'won') {
        currentStreak++;
      } else if (bet.status === 'lost') {
        break;
      }
    }
    
    const bankrollHistory = [
      { date: '2024-12-25', amount: 10000 },
      { date: '2024-12-26', amount: 10000 + totalPL * 0.3 },
      { date: '2024-12-27', amount: 10000 + totalPL * 0.6 },
      { date: '2024-12-28', amount: 10000 + totalPL },
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

// Check if we should use database or memory storage
const USE_DATABASE = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;

export const storage = USE_DATABASE ? new DatabaseStorage() : new MemStorage();
