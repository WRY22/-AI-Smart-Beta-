import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const candidateStocks = sqliteTable(
  "candidate_stocks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    ticker: text("ticker").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [uniqueIndex("candidate_user_ticker_unique").on(table.userId, table.ticker)],
);

export const portfolioRuns = sqliteTable("portfolio_runs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  portfolioType: text("portfolio_type").notNull(),
  conditions: text("conditions").notNull(),
  factorWeights: text("factor_weights").notNull(),
  allocationSettings: text("allocation_settings").notNull(),
  candidateOnly: integer("candidate_only", { mode: "boolean" }).notNull(),
  candidateTickers: text("candidate_tickers").notNull(),
  result: text("result").notNull(),
  createdAt: text("created_at").notNull(),
});
