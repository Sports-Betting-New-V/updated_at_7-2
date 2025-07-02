import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Email/Password Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email").unique().notNull(),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bankroll: decimal("bankroll", { precision: 10, scale: 2 }).notNull().default("10000.00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  gameTime: timestamp("game_time").notNull(),
  sport: text("sport").notNull().default("NBA"),
  homeSpread: decimal("home_spread", { precision: 4, scale: 1 }),
  awaySpread: decimal("away_spread", { precision: 4, scale: 1 }),
  totalPoints: decimal("total_points", { precision: 4, scale: 1 }),
  homeMoneyline: integer("home_moneyline"),
  awayMoneyline: integer("away_moneyline"),
  status: text("status").notNull().default("upcoming"), // upcoming, live, finished
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  recommendedPick: text("recommended_pick").notNull(),
  betType: text("bet_type").notNull(), // spread, moneyline, total, prop
  edgeScore: decimal("edge_score", { precision: 3, scale: 1 }).notNull(),
  confidenceTier: text("confidence_tier").notNull(), // high, medium, low
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  predictionId: integer("prediction_id").references(() => predictions.id),
  betType: text("bet_type").notNull(),
  pick: text("pick").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  odds: integer("odds").notNull().default(-110),
  status: text("status").notNull().default("pending"), // pending, won, lost, push
  payout: decimal("payout", { precision: 10, scale: 2 }),
  placedAt: timestamp("placed_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
});

export const insertBetSchema = createInsertSchema(bets).omit({
  id: true,
  placedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Bet = typeof bets.$inferSelect;
export type InsertBet = z.infer<typeof insertBetSchema>;

// Extended types for frontend
export type GameWithPredictions = Game & {
  predictions: Prediction[];
};

export type BetWithGame = Bet & {
  game: Game;
};

export type UserStats = {
  totalPL: number;
  winRate: number;
  totalBets: number;
  roi: number;
  currentStreak: number;
  bankrollHistory: Array<{ date: string; amount: number }>;
};
