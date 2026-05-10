import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // ID from Supabase Auth
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Simple per-user coin watchlist (1-click toggle)
export const watchlists = pgTable("watchlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  coinId: varchar("coin_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
