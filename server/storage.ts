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
        gameTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
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
        gameTime: new Date(Date.now() + 4.5 * 60 * 60 * 1000), // 4.5 hours from now
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
    ];

    sampleGames.forEach(game => this.games.set(game.id, game));
    this.currentGameId = 3;

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
    ];

    samplePredictions.forEach(prediction => this.predictions.set(prediction.id, prediction));
    this.currentPredictionId = 3;

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
    const game: Game = { ...insertGame, id };
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

export const storage = new MemStorage();
