import { users, games, predictions, bets, type User, type UpsertUser, type Game, type InsertGame, type Prediction, type InsertPrediction, type Bet, type InsertBet, type GameWithPredictions, type BetWithGame, type UserStats } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (Email/Password Auth compatible)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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

// In-memory storage implementation for local development
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private games: Map<number, Game> = new Map();
  private predictions: Map<number, Prediction> = new Map();
  private bets: Map<number, Bet> = new Map();
  private currentGameId = 1;
  private currentPredictionId = 1;
  private currentBetId = 1;

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample users
    const sampleUsers: User[] = [
      {
        id: "demo-user-1",
        username: "john_bettor",
        email: "john@example.com",
        password: "password123",
        bankroll: "12450.00",
        createdAt: new Date(),
      },
      {
        id: "demo-user-2", 
        username: "jane_gambler",
        email: "jane@example.com",
        password: "password123",
        bankroll: "8750.00",
        createdAt: new Date(),
      }
    ];

    sampleUsers.forEach(user => this.users.set(user.id, user));

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
        tags: ["Value", "Steam"],
        reasoning: "Bruins getting decent value on the road against inconsistent Rangers",
        createdAt: new Date(),
      },
    ];

    samplePredictions.forEach(prediction => this.predictions.set(prediction.id, prediction));
    this.currentPredictionId = 6;

    // Create sample bets
    const sampleBets: Bet[] = [
      {
        id: 1,
        userId: "demo-user-1",
        gameId: 1,
        predictionId: 1,
        amount: "100.00",
        pick: "Warriors +3.5",
        odds: "130",
        status: "won",
        payout: "130.00",
        placedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId: "demo-user-1",
        gameId: 2,
        predictionId: 2,
        amount: "150.00",
        pick: "Under 215.5",
        odds: "-110",
        status: "lost",
        payout: null,
        placedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ];

    sampleBets.forEach(bet => this.bets.set(bet.id, bet));
    this.currentBetId = 3;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: nanoid(),
      username: userData.username || "",
      email: userData.email || "",
      password: userData.password || "",
      bankroll: userData.bankroll || "10000.00",
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.email ? await this.getUserByEmail(userData.email) : undefined;
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData };
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    }
    return this.createUser(userData);
  }

  async updateUserBankroll(userId: string, amount: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.bankroll = amount;
    this.users.set(userId, user);
    return user;
  }

  async getGames(): Promise<Game[]> {
    return Array.from(this.games.values());
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(gameData: InsertGame): Promise<Game> {
    const game: Game = {
      id: this.currentGameId++,
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      gameTime: gameData.gameTime,
      sport: gameData.sport,
      homeSpread: gameData.homeSpread,
      awaySpread: gameData.awaySpread,
      totalPoints: gameData.totalPoints,
      homeMoneyline: gameData.homeMoneyline,
      awayMoneyline: gameData.awayMoneyline,
      status: gameData.status || "upcoming",
      homeScore: gameData.homeScore || null,
      awayScore: gameData.awayScore || null,
    };
    this.games.set(game.id, game);
    return game;
  }

  async getGamesWithPredictions(): Promise<GameWithPredictions[]> {
    const games = Array.from(this.games.values());
    return games.map(game => ({
      ...game,
      predictions: Array.from(this.predictions.values()).filter(p => p.gameId === game.id)
    }));
  }

  async getPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values());
  }

  async getPredictionsByGameId(gameId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(p => p.gameId === gameId);
  }

  async createPrediction(predictionData: InsertPrediction): Promise<Prediction> {
    const prediction: Prediction = {
      id: this.currentPredictionId++,
      gameId: predictionData.gameId,
      recommendedPick: predictionData.recommendedPick,
      betType: predictionData.betType,
      edgeScore: predictionData.edgeScore,
      confidenceTier: predictionData.confidenceTier,
      tags: predictionData.tags,
      reasoning: predictionData.reasoning,
      createdAt: new Date(),
    };
    this.predictions.set(prediction.id, prediction);
    return prediction;
  }

  async getBetsByUserId(userId: string): Promise<BetWithGame[]> {
    const userBets = Array.from(this.bets.values()).filter(bet => bet.userId === userId);
    return userBets.map(bet => ({
      ...bet,
      game: this.games.get(bet.gameId)!
    }));
  }

  async createBet(betData: InsertBet): Promise<Bet> {
    const bet: Bet = {
      id: this.currentBetId++,
      userId: betData.userId,
      gameId: betData.gameId,
      predictionId: betData.predictionId,
      amount: betData.amount,
      pick: betData.pick,
      odds: betData.odds,
      status: betData.status || "pending",
      payout: betData.payout || null,
      placedAt: new Date(),
    };
    this.bets.set(bet.id, bet);
    return bet;
  }

  async updateBetStatus(betId: number, status: string, payout?: string): Promise<Bet> {
    const bet = this.bets.get(betId);
    if (!bet) {
      throw new Error("Bet not found");
    }
    bet.status = status;
    if (payout) bet.payout = payout;
    this.bets.set(betId, bet);
    return bet;
  }

  async getRecentBetsByUserId(userId: string, limit: number): Promise<BetWithGame[]> {
    const userBets = Array.from(this.bets.values())
      .filter(bet => bet.userId === userId)
      .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
      .slice(0, limit);
    
    return userBets.map(bet => ({
      ...bet,
      game: this.games.get(bet.gameId)!
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
      bankrollHistory
    };
  }
}

// Use database storage if available, otherwise use memory storage
export const storage = db ? new DatabaseStorage() : new MemoryStorage();